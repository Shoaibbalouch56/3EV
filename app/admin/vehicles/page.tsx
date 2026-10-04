import { Car, Factory, PackageCheck, Truck } from 'lucide-react';
import { CreateRecordButton, ExportButton, RowActions } from '@/components/admin/Crud';
import { getVehicleSummary, getVehicles } from '@/lib/api';
import { date, number, titleize } from '@/lib/format';
import { Card, EmptyState, PageHeader, Pagination, StatCard, StatusPill, TableShell } from '@/components/admin/Ui';
import { Filters } from '@/components/admin/Filters';
import { DonutChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inventory & VINs' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'in_production', label: 'In production' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
];

const TRIM_OPTIONS = [
  { value: 'all', label: 'All trims' },
  { value: '3EV Launch Edition', label: 'Launch Edition' },
  { value: '3EV Touring', label: 'Touring' },
  { value: '3EV Sport', label: 'Sport' },
  { value: '3EV Fleet', label: 'Fleet' },
];

const VEHICLE_FIELDS = [
  { name: 'vin', label: 'VIN', required: true, placeholder: '3EV01234VV000123' },
  {
    name: 'trim',
    label: 'Trim',
    type: 'select' as const,
    required: true,
    options: TRIM_OPTIONS.filter((o) => o.value !== 'all'),
  },
  {
    name: 'color',
    label: 'Colour',
    type: 'select' as const,
    options: ['Safety Orange', 'Arctic White', 'Obsidian', 'Signal Red', 'Pacific Blue', 'Titanium'].map((c) => ({
      value: c,
      label: c,
    })),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    required: true,
    options: STATUS_OPTIONS.filter((o) => o.value !== 'all'),
  },
  { name: 'batteryKwh', label: 'Battery (kWh)', type: 'number' as const, placeholder: '102' },
  { name: 'rangeMiles', label: 'Range (mi)', type: 'number' as const, placeholder: '275' },
  {
    name: 'plant',
    label: 'Plant',
    type: 'select' as const,
    options: [
      { value: 'Saint John Assembly', label: 'Saint John Assembly' },
      { value: 'Phoenix Assembly', label: 'Phoenix Assembly' },
    ],
  },
  { name: 'dealerId', label: 'Assigned dealer ID', placeholder: 'DLR-004' },
];

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; trim?: string; page?: string };
}) {
  const params = {
    search: searchParams.search ?? '',
    status: searchParams.status ?? 'all',
    trim: searchParams.trim ?? 'all',
    page: searchParams.page ?? '1',
  };

  const [{ data, live }, { data: summary }] = await Promise.all([
    getVehicles({ ...params, pageSize: 18 }),
    getVehicleSummary(),
  ]);

  const rows = data.data || [];
  const byStatus = (summary.byStatus || []).reduce(
    (acc: Record<string, number>, s: any) => ({ ...acc, [s.status]: s.count }),
    {},
  );

  return (
    <>
      <PageHeader
        title="Inventory & VIN tracking"
        subtitle="Every 3EV from the production line to dealer handover."
        live={live}
        actions={
          <>
            <ExportButton resource="vehicles" entity="Vehicle" />
            <CreateRecordButton
              resource="vehicles"
              entity="Vehicle"
              label="Add VIN"
              fields={VEHICLE_FIELDS}
              defaults={{
                trim: '3EV Launch Edition',
                color: 'Safety Orange',
                status: 'in_production',
                batteryKwh: 102,
                rangeMiles: 275,
                plant: 'Saint John Assembly',
              }}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total VINs" value={number(summary.total)} hint="Across all plants" icon={Car} />
        <StatCard label="In production" value={number(byStatus.in_production || 0)} icon={Factory} accent="ember" />
        <StatCard label="In stock" value={number(byStatus.in_stock || 0)} hint="Available to allocate" icon={PackageCheck} accent="volt" />
        <StatCard label="In transit" value={number(byStatus.in_transit || 0)} hint="En route to dealers" icon={Truck} accent="neutral" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card title="Inventory by status">
          <DonutChart
            data={(summary.byStatus || []).map((s: any) => ({ label: titleize(s.status), value: s.count }))}
          />
        </Card>
        <Card className="xl:col-span-2" title="Build mix by trim" subtitle="Units built or scheduled">
          <div className="space-y-4">
            {(summary.byTrim || []).map((t: any) => {
              const max = Math.max(...(summary.byTrim || []).map((x: any) => x.count)) || 1;
              return (
                <div key={t.trim}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-chalk-300">{t.trim}</span>
                    <span className="text-chalk-500">{number(t.count)} units</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ember to-brand"
                      style={{ width: `${(t.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card bodyClassName="p-4 sm:p-5">
          <Filters
            basePath="/admin/vehicles"
            search={params.search}
            searchPlaceholder="Search VIN, trim, colour or plant"
            filters={[
              { key: 'status', label: 'Status', value: params.status, options: STATUS_OPTIONS },
              { key: 'trim', label: 'Trim', value: params.trim, options: TRIM_OPTIONS },
            ]}
          />

          {rows.length === 0 ? (
            <EmptyState message="No vehicles match these filters." />
          ) : (
            <>
              <TableShell>
                <thead>
                  <tr>
                    <th>VIN</th>
                    <th>Trim</th>
                    <th>Colour</th>
                    <th>Status</th>
                    <th className="text-right">Battery</th>
                    <th className="text-right">Range</th>
                    <th>Plant</th>
                    <th>Assigned dealer</th>
                    <th>Built</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v: any) => (
                    <tr key={v.id}>
                      <td className="font-mono text-xs text-white">{v.vin}</td>
                      <td className="text-chalk-200">{v.trim}</td>
                      <td className="text-chalk-400">{v.color}</td>
                      <td>
                        <StatusPill status={v.status} />
                      </td>
                      <td className="text-right text-chalk-300">{v.batteryKwh} kWh</td>
                      <td className="text-right text-chalk-300">{v.rangeMiles} mi</td>
                      <td className="text-chalk-400">{v.plant}</td>
                      <td className="max-w-[220px] truncate text-chalk-400">{v.dealerName || '—'}</td>
                      <td className="text-chalk-500">{v.builtAt ? date(v.builtAt) : 'Scheduled'}</td>
                      <td>
                        <RowActions
                          resource="vehicles"
                          entity="Vehicle"
                          fields={VEHICLE_FIELDS}
                          record={v}
                          recordLabel={v.vin}
                          detail={[
                            { label: 'VIN', value: v.vin },
                            { label: 'Status', value: titleize(v.status) },
                            { label: 'Trim', value: v.trim },
                            { label: 'Colour', value: v.color },
                            { label: 'Battery', value: `${v.batteryKwh} kWh` },
                            { label: 'Range', value: `${v.rangeMiles} mi` },
                            { label: 'Plant', value: v.plant },
                            { label: 'Dealer', value: v.dealerName || 'Unassigned' },
                            { label: 'Built', value: v.builtAt ? date(v.builtAt) : 'Scheduled' },
                            { label: 'Allocated order', value: v.orderId || 'Not allocated' },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>

              <Pagination
                meta={data.meta}
                basePath="/admin/vehicles"
                params={{ search: params.search, status: params.status, trim: params.trim }}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
