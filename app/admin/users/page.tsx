'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';
import { Card, PageHeader, StatCard } from '@/components/admin/Ui';
import { IconButton } from '@/components/admin/Crud';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { Field, FieldGrid } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/client-api';
import { date, initials, timeAgo } from '@/lib/format';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleColor: string;
  permissionCount: number;
  dealerId: string | null;
  dealerName: string | null;
  status: 'active' | 'suspended';
  lastActiveAt: string;
  createdAt: string;
}

interface RoleOption {
  id: string;
  name: string;
  color: string;
}

export default function UsersPage() {
  const toast = useToast();
  const { can, user: me, refresh: refreshSession } = useAuth();

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [deleting, setDeleting] = useState<PlatformUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (announce = false) => {
      setLoading(true);
      try {
        const [userRows, roleRows] = await Promise.all([api.get('/users'), api.get('/roles')]);
        setUsers(userRows);
        setRoles(roleRows.map((r: any) => ({ id: r.id, name: r.name, color: r.color })));
        if (announce) toast.success('Users reloaded', `${userRows.length} accounts.`);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Something went wrong.';
        toast.error('Could not load users', message);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const denied = (permission: string) =>
    toast.warning(
      'Permission required',
      me ? `Your role (${me.roleName}) does not include "${permission}".` : 'Sign in first.',
    );

  const patchUser = async (target: PlatformUser, body: Record<string, any>, message: string) => {
    if (!can('users:update')) return denied('users:update');
    setSavingId(target.id);
    try {
      const updated: PlatformUser = await api.patch(`/users/${target.id}`, body);
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(message, `${updated.name} · ${updated.roleName}`);
      if (me?.id === updated.id) refreshSession();
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Could not update user', msg);
    } finally {
      setSavingId('');
    }
  };

  const removeUser = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/users/${deleting.id}`);
      toast.success('User deleted', `${deleting.name} no longer has access.`);
      setDeleting(null);
      load();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Could not delete user', message);
    } finally {
      setBusy(false);
    }
  };

  const active = users.filter((u) => u.status === 'active').length;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Platform accounts and the role each one carries. Changing a role changes what that person can do immediately."
        actions={
          <>
            <button type="button" onClick={() => load(true)} className="btn-ghost btn-sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => (can('users:create') ? setCreating(true) : denied('users:create'))}
              className={can('users:create') ? 'btn-primary btn-sm' : 'btn-ghost btn-sm opacity-60'}
            >
              <Plus className="h-4 w-4" />
              New user
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts" value={String(users.length)} hint="Across HQ and dealers" />
        <StatCard label="Active" value={String(active)} accent="volt" />
        <StatCard label="Suspended" value={String(users.length - active)} accent="brand" />
        <StatCard label="Roles in use" value={String(new Set(users.map((u) => u.roleId)).size)} accent="ember" icon={ShieldCheck} />
      </div>

      <div className="mt-6">
        <Card title="Platform accounts" subtitle="Assign a role inline — it saves immediately" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="table-vv">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th className="min-w-[200px]">Role</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th>Last active</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${row.roleColor}, ${row.roleColor}88)` }}
                        >
                          {initials(row.name)}
                        </span>
                        <div>
                          <p className="font-medium text-white">
                            {row.name}
                            {me?.id === row.id && <span className="ml-2 text-[10px] text-chalk-600">(you)</span>}
                          </p>
                          <p className="font-mono text-[11px] text-chalk-600">{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-chalk-300">{row.email}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <select
                          value={row.roleId}
                          disabled={savingId === row.id}
                          onChange={(e) => patchUser(row, { roleId: e.target.value }, 'Role updated')}
                          className="cursor-pointer appearance-none rounded-lg border border-white/[0.12] bg-white/[0.03] py-1.5 pl-2.5 pr-7 text-xs text-chalk-100 transition hover:border-white/25 focus:border-brand/50 focus:outline-none"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id} className="bg-ink-900">
                              {role.name}
                            </option>
                          ))}
                        </select>
                        {savingId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-chalk-500" />
                        ) : (
                          <span className="text-[11px] text-chalk-600">{row.permissionCount} perms</span>
                        )}
                      </div>
                    </td>
                    <td className="text-chalk-400">{row.dealerName || 'Head office'}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          row.status === 'active'
                            ? 'border-volt/30 bg-volt/10 text-volt'
                            : 'border-brand/35 bg-brand/10 text-brand-400'
                        }`}
                      >
                        {row.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="text-chalk-500">{timeAgo(row.lastActiveAt)}</td>
                    <td className="text-chalk-500">{date(row.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          label={row.status === 'active' ? 'Suspend user' : 'Activate user'}
                          muted={!can('users:update')}
                          onClick={() =>
                            can('users:update')
                              ? patchUser(
                                  row,
                                  { status: row.status === 'active' ? 'suspended' : 'active' },
                                  row.status === 'active' ? 'User suspended' : 'User activated',
                                )
                              : denied('users:update')
                          }
                        >
                          {row.status === 'active' ? (
                            <UserX className="h-[15px] w-[15px]" />
                          ) : (
                            <UserCheck className="h-[15px] w-[15px]" />
                          )}
                        </IconButton>

                        <IconButton
                          label="Edit user"
                          tone="edit"
                          muted={!can('users:update')}
                          onClick={() => (can('users:update') ? setEditing(row) : denied('users:update'))}
                        >
                          <Pencil className="h-[15px] w-[15px]" />
                        </IconButton>

                        <IconButton
                          label="Delete user"
                          tone="danger"
                          muted={!can('users:delete')}
                          onClick={() => (can('users:delete') ? setDeleting(row) : denied('users:delete'))}
                        >
                          <Trash2 className="h-[15px] w-[15px]" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && users.length === 0 && (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm text-chalk-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users…
            </div>
          )}
        </Card>
      </div>

      <UserDialog
        open={creating}
        mode="create"
        roles={roles}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />

      <UserDialog
        open={Boolean(editing)}
        mode="edit"
        user={editing || undefined}
        roles={roles}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        busy={busy}
        title="Delete this user?"
        message={
          deleting
            ? `${deleting.name} (${deleting.email}) will lose access immediately. The API refuses to remove the last active administrator.`
            : ''
        }
        confirmLabel={busy ? 'Deleting…' : 'Delete user'}
        onCancel={() => setDeleting(null)}
        onConfirm={removeUser}
      />
    </>
  );
}

/* ------------------------------------------------------------ User dialog */

function UserDialog({
  open,
  mode,
  user,
  roles,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  user?: PlatformUser;
  roles: RoleOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (open && !seeded) {
    setValues({
      name: user?.name || '',
      email: user?.email || '',
      roleId: user?.roleId || roles[0]?.id || '',
      status: user?.status || 'active',
      password: '',
    });
    setSeeded(true);
  }
  if (!open && seeded) setSeeded(false);

  const submit = async () => {
    if (!String(values.name || '').trim() || !String(values.email || '').trim()) {
      toast.warning('Missing details', 'Name and email are both required.');
      return;
    }

    setBusy(true);
    try {
      const payload: Record<string, any> = {
        name: values.name,
        email: values.email,
        roleId: values.roleId,
        status: values.status,
      };
      if (values.password) payload.password = values.password;

      const saved =
        mode === 'create' ? await api.post('/users', payload) : await api.patch(`/users/${user!.id}`, payload);
      toast.success(mode === 'create' ? 'User created' : 'User updated', `${saved.name} · ${saved.roleName}`);
      onSaved();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error(mode === 'create' ? 'Could not create user' : 'Could not update user', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={mode === 'create' ? 'New user' : `Edit ${user?.name ?? 'user'}`}
      subtitle="Accounts inherit every permission from the role you assign."
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className="btn-ghost btn-sm">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} className="btn-primary btn-sm">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'create' ? 'Create user' : 'Save changes'}
          </button>
        </>
      }
    >
      <FieldGrid>
        <Field
          spec={{ name: 'name', label: 'Full name', required: true, placeholder: 'Alex Morgan' }}
          value={values.name}
          onChange={(v) => setValues({ ...values, name: v })}
        />
        <Field
          spec={{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'alex@vvcars.com' }}
          value={values.email}
          onChange={(v) => setValues({ ...values, email: v })}
        />
        <Field
          spec={{
            name: 'roleId',
            label: 'Role',
            type: 'select',
            required: true,
            options: roles.map((r) => ({ value: r.id, label: r.name })),
          }}
          value={values.roleId}
          onChange={(v) => setValues({ ...values, roleId: v })}
        />
        <Field
          spec={{
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ],
          }}
          value={values.status}
          onChange={(v) => setValues({ ...values, status: v })}
        />
        <Field
          spec={{
            name: 'password',
            label: mode === 'create' ? 'Password' : 'New password',
            placeholder: mode === 'create' ? 'demo1234' : 'Leave blank to keep current',
            help: 'Demo build stores this in plain text; production hashes it.',
            wide: true,
          }}
          value={values.password}
          onChange={(v) => setValues({ ...values, password: v })}
        />
      </FieldGrid>
    </Dialog>
  );
}
