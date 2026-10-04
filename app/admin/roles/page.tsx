'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/Ui';
import { IconButton } from '@/components/admin/Crud';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { Field, FieldGrid } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/client-api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  system: boolean;
  locked: boolean;
  color: string;
  userCount: number;
  permissionCount: number;
  totalPermissions: number;
  updatedAt: string;
}

interface PermissionGroup {
  resource: string;
  label: string;
  description: string;
  actions: string[];
}

const ACTION_ORDER = ['view', 'create', 'update', 'delete', 'export'];

const ROLE_COLORS = ['#E11D2E', '#FF6A1F', '#2ED3A7', '#6E8BFF', '#C084FC', '#F5C451', '#8A92A2'];

export default function RolesPage() {
  const toast = useToast();
  const { can, user, refresh: refreshSession } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => roles.find((r) => r.id === selectedId) || roles[0],
    [roles, selectedId],
  );

  const load = useCallback(
    async (announce = false) => {
      setLoading(true);
      try {
        const [roleRows, catalog] = await Promise.all([api.get('/roles'), api.get('/permissions')]);
        setRoles(roleRows);
        setGroups(catalog.groups);
        if (!selectedId && roleRows.length) setSelectedId(roleRows[0].id);
        if (announce) toast.success('Roles reloaded', `${roleRows.length} roles in the platform.`);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Something went wrong.';
        toast.error('Could not load roles', message);
      } finally {
        setLoading(false);
      }
    },
    [selectedId, toast],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const denied = (permission: string) =>
    toast.warning(
      'Permission required',
      user
        ? `Your role (${user.roleName}) does not include "${permission}".`
        : 'Sign in to perform this action.',
    );

  /* --------------------------------------------------- permission matrix */

  const toggle = async (role: Role, permission: string, granted: boolean) => {
    if (!can('roles:update')) return denied('roles:update');
    if (role.locked) {
      toast.warning('Role is locked', `${role.name} always keeps every permission.`);
      return;
    }

    setSavingKey(`${role.id}:${permission}`);
    try {
      const updated: Role = await api.patch(`/roles/${role.id}/permissions`, { permission, granted });
      setRoles((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(
        granted ? 'Permission granted' : 'Permission revoked',
        `${permission} · ${updated.name} (${updated.permissionCount}/${updated.totalPermissions})`,
      );
      // If the caller just changed their own role, refresh their session so the
      // navigation and action buttons update immediately.
      if (user?.roleId === updated.id) refreshSession();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Could not update permission', message);
    } finally {
      setSavingKey('');
    }
  };

  const toggleResource = async (role: Role, group: PermissionGroup, grantAll: boolean) => {
    if (!can('roles:update')) return denied('roles:update');
    if (role.locked) {
      toast.warning('Role is locked', `${role.name} always keeps every permission.`);
      return;
    }

    const permissions = group.actions.map((a) => `${group.resource}:${a}`);
    const next = grantAll
      ? [...new Set([...role.permissions, ...permissions])]
      : role.permissions.filter((p) => !permissions.includes(p));

    setBusy(true);
    try {
      const updated: Role = await api.patch(`/roles/${role.id}`, { permissions: next });
      setRoles((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(
        grantAll ? `${group.label} fully granted` : `${group.label} revoked`,
        `${updated.name} now has ${updated.permissionCount} of ${updated.totalPermissions} permissions.`,
      );
      if (user?.roleId === updated.id) refreshSession();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Could not update role', message);
    } finally {
      setBusy(false);
    }
  };

  const removeRole = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/roles/${deleting.id}`);
      toast.success('Role deleted', `${deleting.name} has been removed.`);
      setDeleting(null);
      if (selectedId === deleting.id) setSelectedId('');
      await load();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Could not delete role', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Roles & permissions"
        subtitle="Create roles and choose exactly what each one can see, edit and delete. Changes apply on the next request — no redeploy."
        actions={
          <>
            <button type="button" onClick={() => load(true)} className="btn-ghost btn-sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => (can('roles:create') ? setCreating(true) : denied('roles:create'))}
              className={can('roles:create') ? 'btn-primary btn-sm' : 'btn-ghost btn-sm opacity-60'}
            >
              <Plus className="h-4 w-4" />
              New role
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        {/* Role list */}
        <div className="space-y-2.5">
          {loading && roles.length === 0 && (
            <div className="panel flex items-center gap-3 p-5 text-sm text-chalk-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading roles…
            </div>
          )}

          {roles.map((role) => {
            const active = selected?.id === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedId(role.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-white/20 bg-white/[0.06]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-white">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: role.color }} />
                      {role.name}
                      {role.locked && <Lock className="h-3 w-3 text-chalk-600" />}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-chalk-500">
                      {role.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                      role.system
                        ? 'border-white/12 bg-white/[0.05] text-chalk-500'
                        : 'border-volt/30 bg-volt/10 text-volt'
                    }`}
                  >
                    {role.system ? 'System' : 'Custom'}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-chalk-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    {role.userCount} user{role.userCount === 1 ? '' : 's'}
                  </span>
                  <span>
                    {role.permissionCount}/{role.totalPermissions} permissions
                  </span>
                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(role.permissionCount / role.totalPermissions) * 100}%`,
                      background: role.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission matrix */}
        {selected && (
          <Card
            title={`${selected.name} — permission matrix`}
            subtitle={
              selected.locked
                ? 'This role is locked: it always holds every permission.'
                : 'Tick a box to grant, untick to revoke. Saved immediately.'
            }
            action={
              <div className="flex items-center gap-1">
                <IconButton
                  label="Edit role"
                  tone="edit"
                  muted={!can('roles:update') || selected.locked}
                  onClick={() =>
                    !can('roles:update')
                      ? denied('roles:update')
                      : selected.locked
                        ? toast.warning('Role is locked', `${selected.name} cannot be edited.`)
                        : setEditing(selected)
                  }
                >
                  <Pencil className="h-[15px] w-[15px]" />
                </IconButton>
                <IconButton
                  label="Delete role"
                  tone="danger"
                  muted={!can('roles:delete') || selected.system}
                  onClick={() =>
                    !can('roles:delete')
                      ? denied('roles:delete')
                      : selected.system
                        ? toast.warning('Built-in role', `${selected.name} cannot be deleted.`)
                        : setDeleting(selected)
                  }
                >
                  <Trash2 className="h-[15px] w-[15px]" />
                </IconButton>
              </div>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="table-vv">
                <thead>
                  <tr>
                    <th className="min-w-[190px]">Module</th>
                    {ACTION_ORDER.map((action) => (
                      <th key={action} className="px-2 text-center capitalize">
                        {action}
                      </th>
                    ))}
                    <th className="text-right">All</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const permissions = group.actions.map((a) => `${group.resource}:${a}`);
                    const allGranted = permissions.every((p) => selected.permissions.includes(p));

                    return (
                      <tr key={group.resource}>
                        <td className="whitespace-normal">
                          <p className="font-medium text-white">{group.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-chalk-600">
                            {group.description}
                          </p>
                        </td>

                        {ACTION_ORDER.map((action) => {
                          const supported = group.actions.includes(action);
                          const permission = `${group.resource}:${action}`;
                          const granted = selected.permissions.includes(permission);
                          const saving = savingKey === `${selected.id}:${permission}`;

                          return (
                            <td key={action} className="px-2 text-center">
                              {supported ? (
                                <button
                                  type="button"
                                  onClick={() => toggle(selected, permission, !granted)}
                                  disabled={saving || busy}
                                  aria-label={`${granted ? 'Revoke' : 'Grant'} ${permission}`}
                                  aria-pressed={granted}
                                  title={permission}
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                    granted
                                      ? 'border-volt/50 bg-volt/20 text-volt'
                                      : 'border-white/15 bg-white/[0.03] text-transparent hover:border-white/35'
                                  } ${selected.locked ? 'opacity-60' : ''}`}
                                >
                                  {saving ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-chalk-300" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-chalk-700">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleResource(selected, group, !allGranted)}
                            disabled={busy}
                            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-chalk-400 transition hover:border-white/25 hover:text-white"
                          >
                            {allGranted ? 'Revoke' : 'Grant'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-4 text-xs text-chalk-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                {selected.permissionCount} of {selected.totalPermissions} permissions granted to{' '}
                {selected.userCount} user{selected.userCount === 1 ? '' : 's'}
              </span>
              <span>Every write endpoint re-checks these values server-side on each request.</span>
            </div>
          </Card>
        )}
      </div>

      <RoleDialog
        open={creating}
        mode="create"
        groups={groups}
        onClose={() => setCreating(false)}
        onSaved={(role) => {
          setCreating(false);
          setSelectedId(role.id);
          load();
        }}
      />

      <RoleDialog
        open={Boolean(editing)}
        mode="edit"
        role={editing || undefined}
        groups={groups}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        busy={busy}
        title="Delete this role?"
        message={
          deleting
            ? `${deleting.name} will be removed. Users still holding it must be reassigned first — the API will refuse the delete otherwise.`
            : ''
        }
        confirmLabel={busy ? 'Deleting…' : 'Delete role'}
        onCancel={() => setDeleting(null)}
        onConfirm={removeRole}
      />
    </>
  );
}

/* ------------------------------------------------------------ Role dialog */

function RoleDialog({
  open,
  mode,
  role,
  groups,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  groups: PermissionGroup[];
  onClose: () => void;
  onSaved: (role: Role) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(ROLE_COLORS[2]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (open && !seeded) {
    setName(role?.name || '');
    setDescription(role?.description || '');
    setColor(role?.color || ROLE_COLORS[2]);
    setPermissions(role?.permissions ? [...role.permissions] : []);
    setSeeded(true);
  }
  if (!open && seeded) setSeeded(false);

  const toggle = (permission: string) =>
    setPermissions((current) =>
      current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission],
    );

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.warning('Name required', 'Give the role a name of at least 2 characters.');
      return;
    }

    setBusy(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), color, permissions };
      const saved: Role =
        mode === 'create'
          ? await api.post('/roles', payload)
          : await api.patch(`/roles/${role!.id}`, payload);
      toast.success(
        mode === 'create' ? 'Role created' : 'Role updated',
        `${saved.name} · ${saved.permissionCount} permissions.`,
      );
      onSaved(saved);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error(mode === 'create' ? 'Could not create role' : 'Could not update role', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={mode === 'create' ? 'New role' : `Edit ${role?.name ?? 'role'}`}
      subtitle="Name the role, then tick the permissions it should carry."
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} className="btn-primary btn-sm">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'create' ? 'Create role' : 'Save role'}
          </button>
        </>
      }
    >
      <FieldGrid>
        <Field
          spec={{ name: 'name', label: 'Role name', required: true, placeholder: 'Regional Sales Lead' }}
          value={name}
          onChange={setName}
        />
        <Field
          spec={{
            name: 'description',
            label: 'Description',
            placeholder: 'What this role is responsible for',
          }}
          value={description}
          onChange={setDescription}
        />
      </FieldGrid>

      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-500">Colour</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              className={`h-8 w-8 rounded-full border transition ${
                color === c ? 'scale-110 border-white' : 'border-white/20 hover:border-white/50'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-500">
            Permissions ({permissions.length})
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setPermissions(groups.flatMap((g) => g.actions.map((a) => `${g.resource}:${a}`)))
              }
              className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-chalk-400 transition hover:border-white/25 hover:text-white"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setPermissions([])}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-chalk-400 transition hover:border-white/25 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.resource} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
              <p className="text-sm font-medium text-white">{group.label}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {group.actions.map((action) => {
                  const permission = `${group.resource}:${action}`;
                  const granted = permissions.includes(permission);
                  return (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => toggle(permission)}
                      aria-label={`${group.label}: ${action}`}
                      aria-pressed={granted}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] capitalize transition ${
                        granted
                          ? 'border-volt/40 bg-volt/10 text-volt'
                          : 'border-white/10 bg-white/[0.02] text-chalk-500 hover:border-white/25'
                      }`}
                    >
                      {granted && <Check className="h-3 w-3" />}
                      {action}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
