import { AlertOctagon, LifeBuoy, PackageSearch, ShieldCheck } from 'lucide-react';
import { CreateRecordButton, ExportButton, RowActions } from '@/components/admin/Crud';
import { getServiceSummary, getTickets } from '@/lib/api';
import { number, percent, timeAgo, titleize } from '@/lib/format';
import { Card, EmptyState, PageHeader, Pagination, StatCard, StatusPill, TableShell } from '@/components/admin/Ui';
import { Filters } from '@/components/admin/Filters';
import { BarChart, DonutChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Service & warranty' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting_parts', label: 'Awaiting parts' },
  { value: 'resolved', label: 'Resolved' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TICKET_FIELDS = [
  { name: 'subject', label: 'Subject', required: true, wide: true, placeholder: 'Charging session interrupts at 80%' },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    required: true,
    options: ['Battery', 'Software', 'Body', 'Drivetrain', 'Brakes', 'Suspension', 'Charging', 'Delivery', 'Warranty'].map(
      (c) => ({ value: c, label: c }),
    ),
  },
  { name: 'vin', label: 'VIN', placeholder: '3EV01234VV000123' },
  { name: 'customerName', label: 'Customer', placeholder: 'Alex Morgan' },
  { name: 'dealerId', label: 'Dealer ID', placeholder: 'DLR-010' },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select' as const,
    required: true,
    options: PRIORITY_OPTIONS.filter((o) => o.value !== 'all'),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: STATUS_OPTIONS.filter((o) => o.value !== 'all'),
  },
  { name: 'slaHours', label: 'SLA (hours)', type: 'number' as const, placeholder: '24' },
  { name: 'underWarranty', label: 'Under warranty', type: 'switch' as const },
];

export default async function ServicePage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; priority?: string; page?: string };
}) {
  const params = {
    search: searchParams.search ?? '',
    status: searchParams.status ?? 'all',
    priority: searchParams.priority ?? 'all',
    page: searchParams.page ?? '1',
  };

  const [{ data, live }, { data: summary }] = await Promise.all([
    getTickets({ ...params, pageSize: 18 }),
    getServiceSummary(),
  ]);

  const rows = data.data || [];

  return (
    <>
      <PageHeader
        title="Service & warranty"
        subtitle="Every open ticket across the network, ranked by priority and SLA exposure."
        live={live}
        actions={
          <>
            <ExportButton resource="service" entity="Ticket" />
            <CreateRecordButton
              resource="service"
              entity="Ticket"
              label="New ticket"
              fields={TICKET_FIELDS}
              defaults={{ category: 'Software', priority: 'medium', status: 'open', slaHours: 24, underWarranty: true }}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tickets" value={number(summary.open)} hint={`${number(summary.total)} lifetime`} icon={LifeBuoy} />
        <StatCard label="Critical" value={number(summary.critical)} hint="Escalate within SLA" icon={AlertOctagon} accent="brand" />
        <StatCard label="Awaiting parts" value={number(summary.awaitingParts)} icon={PackageSearch} accent="ember" />
        <StatCard label="Under warranty" value={percent(summary.warrantyShare, 0)} hint="Share of all tickets" icon={ShieldCheck} accent="volt" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card title="Tickets by status">
          <DonutChart
            data={(summary.byStatus || []).map((s: any) => ({ label: titleize(s.status), value: s.count }))}
          />
        </Card>
        <Card className="xl:col-span-2" title="Tickets by category" subtitle="Where the network spends its bay time">
          <BarChart
            data={(summary.byCategory || []).map((c: any) => ({ label: c.category, value: c.count }))}
            color="#FF6A1F"
          />
        </Card>
      </div>

      <div className="mt-6">
        <Card bodyClassName="p-4 sm:p-5">
          <Filters
            basePath="/admin/service"
            search={params.search}
            searchPlaceholder="Search ticket, VIN, customer or dealer"
            filters={[
              { key: 'status', label: 'Status', value: params.status, options: STATUS_OPTIONS },
              { key: 'priority', label: 'Priority', value: params.priority, options: PRIORITY_OPTIONS },
            ]}
          />

          {rows.length === 0 ? (
            <EmptyState message="No tickets match these filters." />
          ) : (
            <>
              <TableShell>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>VIN</th>
                    <th>Customer</th>
                    <th>Dealer</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-right">SLA</th>
                    <th>Warranty</th>
                    <th>Opened</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t: any) => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs text-white">{t.ticketNumber}</td>
                      <td className="max-w-[260px]">
                        <p className="truncate text-chalk-100">{t.subject}</p>
                        <p className="text-[11px] text-chalk-600">{t.category}</p>
                      </td>
                      <td className="font-mono text-[11px] text-chalk-500">{t.vin}</td>
                      <td className="text-chalk-300">{t.customerName}</td>
                      <td className="max-w-[200px] truncate text-chalk-400">{t.dealerName}</td>
                      <td>
                        <StatusPill status={t.priority} />
                      </td>
                      <td>
                        <StatusPill status={t.status} />
                      </td>
                      <td className="text-right text-chalk-300">{t.slaHours}h</td>
                      <td>
                        <span className={t.underWarranty ? 'text-volt' : 'text-chalk-600'}>
                          {t.underWarranty ? 'Covered' : 'Out of warranty'}
                        </span>
                      </td>
                      <td className="text-chalk-500">{timeAgo(t.openedAt)}</td>
                      <td>
                        <RowActions
                          resource="service"
                          entity="Ticket"
                          fields={TICKET_FIELDS}
                          record={t}
                          recordLabel={t.ticketNumber}
                          detail={[
                            { label: 'Ticket', value: t.ticketNumber },
                            { label: 'Subject', value: t.subject },
                            { label: 'Category', value: t.category },
                            { label: 'Status', value: titleize(t.status) },
                            { label: 'Priority', value: titleize(t.priority) },
                            { label: 'VIN', value: t.vin },
                            { label: 'Customer', value: t.customerName },
                            { label: 'Dealer', value: t.dealerName },
                            { label: 'SLA', value: `${t.slaHours} hours` },
                            { label: 'Warranty', value: t.underWarranty ? 'Covered' : 'Out of warranty' },
                            { label: 'Opened', value: timeAgo(t.openedAt) },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>

              <Pagination
                meta={data.meta}
                basePath="/admin/service"
                params={{ search: params.search, status: params.status, priority: params.priority }}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
