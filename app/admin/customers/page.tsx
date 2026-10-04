import { Building2, HeartHandshake, Users } from 'lucide-react';
import { CreateRecordButton, ExportButton, RowActions } from '@/components/admin/Crud';
import { getCustomerSummary, getCustomers } from '@/lib/api';
import { currency, date, initials, number, titleize } from '@/lib/format';
import { Card, EmptyState, PageHeader, Pagination, StatCard, StatusPill, TableShell } from '@/components/admin/Ui';
import { Filters } from '@/components/admin/Filters';
import { DonutChart, Funnel } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customers' };

const SEGMENT_OPTIONS = [
  { value: 'all', label: 'All segments' },
  { value: 'retail', label: 'Retail' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'commercial', label: 'Commercial' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All stages' },
  { value: 'lead', label: 'Lead' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'owner', label: 'Owner' },
];

const CUSTOMER_FIELDS = [
  { name: 'name', label: 'Full name', required: true, placeholder: 'Alex Morgan' },
  { name: 'email', label: 'Email', type: 'email' as const, required: true, placeholder: 'alex@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel' as const, placeholder: '+1 (555) 010-2244' },
  { name: 'city', label: 'City', placeholder: 'Austin' },
  { name: 'state', label: 'State', placeholder: 'TX' },
  {
    name: 'segment',
    label: 'Segment',
    type: 'select' as const,
    required: true,
    options: SEGMENT_OPTIONS.filter((o) => o.value !== 'all'),
  },
  {
    name: 'status',
    label: 'Lifecycle stage',
    type: 'select' as const,
    required: true,
    options: STATUS_OPTIONS.filter((o) => o.value !== 'all'),
  },
  { name: 'dealerId', label: 'Dealer ID', placeholder: 'DLR-011' },
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string; segment?: string; status?: string; page?: string };
}) {
  const params = {
    search: searchParams.search ?? '',
    segment: searchParams.segment ?? 'all',
    status: searchParams.status ?? 'all',
    page: searchParams.page ?? '1',
  };

  const [{ data, live }, { data: summary }] = await Promise.all([
    getCustomers({ ...params, pageSize: 18 }),
    getCustomerSummary(),
  ]);

  const rows = data.data || [];
  const byStatus = (summary.byStatus || []).reduce(
    (acc: Record<string, number>, s: any) => ({ ...acc, [s.status]: s.count }),
    {},
  );

  return (
    <>
      <PageHeader
        title="Customers & CRM"
        subtitle="Leads, reservation holders and owners — with the dealer who owns the relationship."
        live={live}
        actions={
          <>
            <ExportButton resource="customers" entity="Customer" />
            <CreateRecordButton
              resource="customers"
              entity="Customer"
              label="Add customer"
              fields={CUSTOMER_FIELDS}
              defaults={{ segment: 'retail', status: 'lead' }}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customer records" value={number(summary.total)} icon={Users} />
        <StatCard label="Reservation holders" value={number(byStatus.reserved || 0)} icon={HeartHandshake} accent="ember" />
        <StatCard label="Owners" value={number(byStatus.owner || 0)} hint="Delivered and active" accent="volt" />
        <StatCard
          label="Pipeline value"
          value={currency(summary.pipelineValue, { compact: true })}
          hint="Lifetime value in CRM"
          icon={Building2}
          accent="neutral"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card title="Segments">
          <DonutChart
            data={(summary.bySegment || []).map((s: any) => ({ label: titleize(s.segment), value: s.count }))}
          />
        </Card>
        <Card className="xl:col-span-2" title="Customer lifecycle" subtitle="Lead to owner conversion">
          <Funnel
            data={(summary.byStatus || []).map((s: any) => ({ stage: titleize(s.status), count: s.count }))}
          />
        </Card>
      </div>

      <div className="mt-6">
        <Card bodyClassName="p-4 sm:p-5">
          <Filters
            basePath="/admin/customers"
            search={params.search}
            searchPlaceholder="Search name, email, phone or city"
            filters={[
              { key: 'segment', label: 'Segment', value: params.segment, options: SEGMENT_OPTIONS },
              { key: 'status', label: 'Stage', value: params.status, options: STATUS_OPTIONS },
            ]}
          />

          {rows.length === 0 ? (
            <EmptyState message="No customers match these filters." />
          ) : (
            <>
              <TableShell>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Segment</th>
                    <th>Stage</th>
                    <th>Dealer</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Lifetime value</th>
                    <th>Added</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ember/70 to-brand/70 text-[11px] font-semibold text-white">
                            {initials(c.name)}
                          </span>
                          <div>
                            <p className="font-medium text-white">{c.name}</p>
                            <p className="font-mono text-[11px] text-chalk-600">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-chalk-300">{c.email}</p>
                        <p className="text-[11px] text-chalk-600">{c.phone}</p>
                      </td>
                      <td className="text-chalk-400">
                        {c.city}, {c.state}
                      </td>
                      <td>
                        <StatusPill status={c.segment} />
                      </td>
                      <td>
                        <StatusPill status={c.status} />
                      </td>
                      <td className="max-w-[200px] truncate text-chalk-400">{c.dealerName || '—'}</td>
                      <td className="text-right text-chalk-300">{c.orders}</td>
                      <td className="text-right font-medium text-white">{currency(c.lifetimeValue)}</td>
                      <td className="text-chalk-500">{date(c.createdAt)}</td>
                      <td>
                        <RowActions
                          resource="customers"
                          entity="Customer"
                          fields={CUSTOMER_FIELDS}
                          record={c}
                          recordLabel={c.name}
                          detail={[
                            { label: 'Customer ID', value: c.id },
                            { label: 'Email', value: c.email },
                            { label: 'Phone', value: c.phone },
                            { label: 'Location', value: `${c.city}, ${c.state}` },
                            { label: 'Segment', value: titleize(c.segment) },
                            { label: 'Stage', value: titleize(c.status) },
                            { label: 'Dealer', value: c.dealerName || 'Unassigned' },
                            { label: 'Orders', value: String(c.orders) },
                            { label: 'Lifetime value', value: currency(c.lifetimeValue) },
                            { label: 'Added', value: date(c.createdAt) },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>

              <Pagination
                meta={data.meta}
                basePath="/admin/customers"
                params={{ search: params.search, segment: params.segment, status: params.status }}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
