import { Store, TrendingUp, Users } from 'lucide-react';
import { CreateRecordButton, ExportButton, RowActions } from '@/components/admin/Crud';
import { getDealerRegions, getDealers } from '@/lib/api';
import { currency, date, number, titleize } from '@/lib/format';
import { Card, EmptyState, PageHeader, Pagination, ProgressBar, StatCard, StatusPill, TableShell } from '@/components/admin/Ui';
import { Filters } from '@/components/admin/Filters';
import { BarChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dealer network' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'suspended', label: 'Suspended' },
];

const REGION_VALUES = ['West', 'Mountain', 'South', 'Midwest', 'Northeast', 'Canada'];

const DEALER_FIELDS = [
  { name: 'name', label: 'Dealer name', required: true, placeholder: 'Visionary Vehicles Austin' },
  { name: 'code', label: 'Dealer code', placeholder: 'VVTX11' },
  { name: 'city', label: 'City', required: true, placeholder: 'Austin' },
  { name: 'state', label: 'State / province', required: true, placeholder: 'TX' },
  {
    name: 'region',
    label: 'Region',
    type: 'select' as const,
    required: true,
    options: REGION_VALUES.map((r) => ({ value: r, label: r })),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: STATUS_OPTIONS.filter((o) => o.value !== 'all'),
  },
  { name: 'principal', label: 'Dealer principal', placeholder: 'Dana Whitfield' },
  { name: 'email', label: 'Email', type: 'email' as const, placeholder: 'principal@vv-austin.com' },
  { name: 'phone', label: 'Phone', type: 'tel' as const, placeholder: '+1 (512) 555-0147' },
  { name: 'allocation', label: 'Allocation (units)', type: 'number' as const, placeholder: '120' },
];

const SORT_OPTIONS = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'orders', label: 'Orders' },
  { value: 'satisfaction', label: 'Satisfaction' },
  { value: 'name', label: 'Name' },
];

export default async function DealersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; region?: string; sort?: string; page?: string };
}) {
  const params = {
    search: searchParams.search ?? '',
    status: searchParams.status ?? 'all',
    region: searchParams.region ?? 'all',
    sort: searchParams.sort ?? 'revenue',
    page: searchParams.page ?? '1',
  };

  const [{ data, live }, { data: regions }] = await Promise.all([
    getDealers({ ...params, pageSize: 15 }),
    getDealerRegions(),
  ]);

  const rows = data.data || [];
  const regionList = Array.isArray(regions) ? regions : [];
  const totals = regionList.reduce(
    (acc, r: any) => ({
      dealers: acc.dealers + r.dealers,
      orders: acc.orders + r.orders,
      revenue: acc.revenue + r.revenue,
    }),
    { dealers: 0, orders: 0, revenue: 0 },
  );

  const regionOptions = [
    { value: 'all', label: 'All regions' },
    ...regionList.map((r: any) => ({ value: r.region, label: r.region })),
  ];

  return (
    <>
      <PageHeader
        title="Dealer network"
        subtitle="Franchise performance, allocation and onboarding across every region."
        live={live}
        actions={
          <>
            <ExportButton resource="dealers" entity="Dealer" />
            <CreateRecordButton
              resource="dealers"
              entity="Dealer"
              label="Onboard dealer"
              fields={DEALER_FIELDS}
              defaults={{ region: 'West', status: 'onboarding', allocation: 60 }}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dealer points" value={number(totals.dealers)} hint="Across all regions" icon={Store} />
        <StatCard
          label="Network revenue YTD"
          value={currency(totals.revenue, { compact: true })}
          delta={9.1}
          icon={TrendingUp}
          accent="volt"
        />
        <StatCard label="Orders YTD" value={number(totals.orders)} hint="Network-wide intake" icon={Users} accent="ember" />
        <StatCard
          label="Average CSAT"
          value={
            regionList.length
              ? (regionList.reduce((s: number, r: any) => s + r.satisfaction, 0) / regionList.length).toFixed(2)
              : '—'
          }
          hint="Weighted by region"
          accent="neutral"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Revenue by region" subtitle="Year to date">
          <BarChart
            data={regionList.map((r: any) => ({ label: r.region, value: r.revenue }))}
            format="currency"
          />
        </Card>

        <Card title="Network health">
          <div className="space-y-4">
            {regionList.map((r: any) => {
              const max = Math.max(...regionList.map((x: any) => x.orders)) || 1;
              return (
                <div key={r.region}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-chalk-300">{r.region}</span>
                    <span className="text-chalk-600">
                      {r.dealers} dealers · CSAT {r.satisfaction}
                    </span>
                  </div>
                  <ProgressBar value={(r.orders / max) * 100} className="mt-2" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card bodyClassName="p-4 sm:p-5">
          <Filters
            basePath="/admin/dealers"
            search={params.search}
            searchPlaceholder="Search dealer, city or principal"
            filters={[
              { key: 'status', label: 'Status', value: params.status, options: STATUS_OPTIONS },
              { key: 'region', label: 'Region', value: params.region, options: regionOptions },
              { key: 'sort', label: 'Sort', value: params.sort, options: SORT_OPTIONS },
            ]}
          />

          {rows.length === 0 ? (
            <EmptyState message="No dealers match these filters." />
          ) : (
            <>
              <TableShell>
                <thead>
                  <tr>
                    <th>Dealer</th>
                    <th>Code</th>
                    <th>Principal</th>
                    <th>Status</th>
                    <th className="text-right">Allocation</th>
                    <th className="text-right">Orders YTD</th>
                    <th className="text-right">Deliveries</th>
                    <th className="text-right">Revenue YTD</th>
                    <th className="text-right">CSAT</th>
                    <th>Onboarded</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d: any) => (
                    <tr key={d.id}>
                      <td>
                        <p className="font-medium text-white">{d.name}</p>
                        <p className="text-[11px] text-chalk-600">
                          {d.city}, {d.state} · {d.region}
                        </p>
                      </td>
                      <td className="font-mono text-xs text-chalk-400">{d.code}</td>
                      <td className="text-chalk-300">{d.principal}</td>
                      <td>
                        <StatusPill status={d.status} />
                      </td>
                      <td className="text-right text-chalk-300">{number(d.allocation)}</td>
                      <td className="text-right text-chalk-300">{number(d.ordersYtd)}</td>
                      <td className="text-right text-chalk-300">{number(d.deliveriesYtd)}</td>
                      <td className="text-right font-medium text-white">
                        {currency(d.revenueYtd, { compact: true })}
                      </td>
                      <td className="text-right">
                        <span className={d.satisfaction >= 4.5 ? 'text-volt' : 'text-chalk-300'}>
                          {d.satisfaction}
                        </span>
                      </td>
                      <td className="text-chalk-500">{date(d.onboardedAt)}</td>
                      <td>
                        <RowActions
                          resource="dealers"
                          entity="Dealer"
                          fields={DEALER_FIELDS}
                          record={d}
                          recordLabel={d.name}
                          detail={[
                            { label: 'Dealer code', value: d.code },
                            { label: 'Status', value: titleize(d.status) },
                            { label: 'Principal', value: d.principal },
                            { label: 'Email', value: d.email },
                            { label: 'Phone', value: d.phone },
                            { label: 'Location', value: `${d.city}, ${d.state} · ${d.region}` },
                            { label: 'Allocation', value: `${number(d.allocation)} units` },
                            { label: 'Orders YTD', value: number(d.ordersYtd) },
                            { label: 'Deliveries YTD', value: number(d.deliveriesYtd) },
                            { label: 'Revenue YTD', value: currency(d.revenueYtd) },
                            { label: 'Satisfaction', value: String(d.satisfaction) },
                            { label: 'Onboarded', value: date(d.onboardedAt) },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>

              <Pagination
                meta={data.meta}
                basePath="/admin/dealers"
                params={{
                  search: params.search,
                  status: params.status,
                  region: params.region,
                  sort: params.sort,
                }}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
