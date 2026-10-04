'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Download, Eye, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { Field, FieldGrid, FieldSpec } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/client-api';

export interface DetailRow {
  label: string;
  value: string;
}

interface CrudConfig {
  /** API segment and permission prefix, e.g. "orders". */
  resource: string;
  /** Human singular, e.g. "Order". */
  entity: string;
  fields: FieldSpec[];
}

/* ------------------------------------------------------------- Row actions */

export function RowActions({
  resource,
  entity,
  fields,
  record,
  recordLabel,
  detail,
}: CrudConfig & {
  record: Record<string, any>;
  recordLabel: string;
  detail: DetailRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { can, user } = useAuth();

  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const denied = (permission: string) =>
    toast.warning(
      'Permission required',
      user
        ? `Your role (${user.roleName}) does not include "${permission}". Ask an administrator to grant it in Roles & permissions.`
        : 'Sign in to perform this action.',
    );

  const remove = async () => {
    setBusy(true);
    try {
      await api.del(`/${resource}/${record.id}`);
      toast.success(`${entity} deleted`, `${recordLabel} has been removed.`);
      setConfirming(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error(`Could not delete ${entity.toLowerCase()}`, message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <IconButton label={`View ${entity.toLowerCase()}`} onClick={() => setViewing(true)}>
          <Eye className="h-[15px] w-[15px]" />
        </IconButton>

        <IconButton
          label={`Edit ${entity.toLowerCase()}`}
          tone="edit"
          muted={!can(`${resource}:update`)}
          onClick={() => (can(`${resource}:update`) ? setEditing(true) : denied(`${resource}:update`))}
        >
          <Pencil className="h-[15px] w-[15px]" />
        </IconButton>

        <IconButton
          label={`Delete ${entity.toLowerCase()}`}
          tone="danger"
          muted={!can(`${resource}:delete`)}
          onClick={() => (can(`${resource}:delete`) ? setConfirming(true) : denied(`${resource}:delete`))}
        >
          <Trash2 className="h-[15px] w-[15px]" />
        </IconButton>
      </div>

      <Dialog
        open={viewing}
        onClose={() => setViewing(false)}
        title={recordLabel}
        subtitle={`${entity} details`}
        footer={
          <button type="button" onClick={() => setViewing(false)} className="btn-ghost btn-sm">
            Close
          </button>
        }
      >
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {detail.map((row) => (
            <div key={row.label} className="border-b border-white/[0.06] pb-3">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-chalk-600">{row.label}</dt>
              <dd className="mt-1.5 text-sm text-white">{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </Dialog>

      <RecordFormDialog
        open={editing}
        onClose={() => setEditing(false)}
        mode="edit"
        resource={resource}
        entity={entity}
        fields={fields}
        record={record}
        recordLabel={recordLabel}
      />

      <ConfirmDialog
        open={confirming}
        busy={busy}
        title={`Delete this ${entity.toLowerCase()}?`}
        message={`${recordLabel} will be removed from the platform. This cannot be undone in the demo dataset — it is restored when the API restarts.`}
        confirmLabel={busy ? 'Deleting…' : `Delete ${entity.toLowerCase()}`}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </>
  );
}

/* ---------------------------------------------------------- Create button */

export function CreateRecordButton({
  resource,
  entity,
  fields,
  label,
  defaults = {},
}: CrudConfig & { label?: string; defaults?: Record<string, any> }) {
  const toast = useToast();
  const { can, user } = useAuth();
  const [open, setOpen] = useState(false);

  const allowed = can(`${resource}:create`);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          allowed
            ? setOpen(true)
            : toast.warning(
                'Permission required',
                user
                  ? `Your role (${user.roleName}) does not include "${resource}:create".`
                  : 'Sign in to perform this action.',
              )
        }
        className={allowed ? 'btn-primary btn-sm' : 'btn-ghost btn-sm opacity-60'}
      >
        <Plus className="h-4 w-4" />
        {label || `New ${entity.toLowerCase()}`}
      </button>

      <RecordFormDialog
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
        resource={resource}
        entity={entity}
        fields={fields}
        record={defaults}
        recordLabel={`New ${entity.toLowerCase()}`}
      />
    </>
  );
}

/* ----------------------------------------------------------- Export button */

export function ExportButton({ resource, entity }: { resource: string; entity: string }) {
  const toast = useToast();
  const { can, user } = useAuth();

  return (
    <button
      type="button"
      onClick={() =>
        can(`${resource}:export`)
          ? toast.info(
              'Export queued',
              `A CSV of the current ${entity.toLowerCase()} view would be generated and emailed to ${user?.email ?? 'you'}. File generation is out of scope for this prototype.`,
            )
          : toast.warning(
              'Permission required',
              user
                ? `Your role (${user.roleName}) does not include "${resource}:export".`
                : 'Sign in to perform this action.',
            )
      }
      className="btn-ghost btn-sm"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}

/* ------------------------------------------------------------- Form dialog */

function RecordFormDialog({
  open,
  onClose,
  mode,
  resource,
  entity,
  fields,
  record,
  recordLabel,
}: CrudConfig & {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  record: Record<string, any>;
  recordLabel: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<Record<string, any>>(() => pick(record, fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Re-seed the form each time the dialog opens on a (possibly new) record.
  if (open && !seeded) {
    setValues(pick(record, fields));
    setErrors({});
    setSeeded(true);
  }
  if (!open && seeded) setSeeded(false);

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
      if (field.type === 'email' && value && !/.+@.+\..+/.test(String(value))) {
        nextErrors[field.name] = 'Enter a valid email address.';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.warning('Check the highlighted fields', 'Some required information is missing.');
      return;
    }

    const payload: Record<string, any> = {};
    for (const field of fields) {
      const value = values[field.name];
      payload[field.name] = field.type === 'number' ? Number(value) || 0 : value;
    }

    setBusy(true);
    try {
      if (mode === 'create') {
        const created = await api.post(`/${resource}`, payload);
        toast.success(
          `${entity} created`,
          created?.orderNumber || created?.name || created?.vin || created?.ticketNumber
            ? `${created.orderNumber || created.name || created.vin || created.ticketNumber} was added.`
            : `The ${entity.toLowerCase()} was added.`,
        );
      } else {
        await api.patch(`/${resource}/${record.id}`, payload);
        toast.success(`${entity} updated`, `${recordLabel} has been saved.`);
      }
      onClose();
      router.refresh();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error(mode === 'create' ? `Could not create ${entity.toLowerCase()}` : `Could not save ${entity.toLowerCase()}`, message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={mode === 'create' ? `New ${entity.toLowerCase()}` : `Edit ${entity.toLowerCase()}`}
      subtitle={mode === 'edit' ? recordLabel : `Add a ${entity.toLowerCase()} to the platform`}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} className="btn-primary btn-sm">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'create' ? `Create ${entity.toLowerCase()}` : 'Save changes'}
          </button>
        </>
      }
    >
      <FieldGrid>
        {fields.map((field) => (
          <Field
            key={field.name}
            spec={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
          />
        ))}
      </FieldGrid>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- helpers */

function pick(record: Record<string, any>, fields: FieldSpec[]) {
  const out: Record<string, any> = {};
  for (const field of fields) {
    const value = record?.[field.name];
    out[field.name] = value === null || value === undefined ? (field.type === 'switch' ? false : '') : value;
  }
  return out;
}

export function IconButton({
  children,
  label,
  onClick,
  tone = 'default',
  muted = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'edit' | 'danger';
  muted?: boolean;
}) {
  const tones = {
    default: 'hover:border-white/25 hover:text-white',
    edit: 'hover:border-ember/50 hover:text-ember',
    danger: 'hover:border-brand/60 hover:text-brand-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={muted ? `${label} — not permitted for your role` : label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-chalk-400 transition ${
        muted ? 'opacity-40 hover:border-white/15' : tones[tone]
      }`}
    >
      {children}
    </button>
  );
}
