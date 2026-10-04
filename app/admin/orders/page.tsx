import Link from 'next/link';
import { CreateRecordButton, ExportButton, RowActions } from '@/components/admin/Crud';
import { getOrders } from '@/lib/api';
import { currency, date, number, titleize } from '@/lib/format';
import { Card, EmptyState, PageHeader, Pagination, ProgressBar, StatusPill, TableShell } from '@/components/admin/Ui';
import { Filters } from '@/components/admin/Filters';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'reservation', label: 'Reservation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In production' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'ready_for_delivery', label: 'Ready for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TRIM_OPTIONS = [
  { value: 'all', label: 'All trims' },
  { value: '3EV Launch Edition', label: 'Launch Edition' },
  { value: '3EV Touring', label: 'Touring' },
  { value: '3EV Sport', label: 'Sport' },
  { value: '3EV Fleet', label: 'Fleet' },
];

const ORDER_FIELDS = [
  { name: 'customerName', label: 'Customer', required: true, placeholder: 'Alex Morgan' },
  { name: 'dealerId', label: 'Dealer ID', placeholder: 'DLR-010', help: 'Which dealer owns this order' },
  {
    name: 'trim',
    label: 'Trim',
    type: 'select' as const,
    required: true,
    options: TRIM_OPTIONS.filter((o) => o.value !== 'all').map((o) => ({ value: o.value, label: o.label })),
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
  { name: 'deposit', label: 'Deposit (USD)', type: 'number' as const, placeholder: '500' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'progress', label: 'Most progressed' },
  { value: 'value', label: 'Highest value' },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; trim?: string; sort?: string; page?: string };
}) {
  const params = {
    search: searchParams.search ?? '',
    status: searchParams.status ?? 'all',
    trim: searchParams.trim ?? 'all',
    sort: searchParams.sort ?? 'newest',
    page: searchParams.page ?? '1',
  };

  const { data, live } = await getOrders({ ...params, pageSize: 20 });
  const rows = data.data || [];

  return (
    <>
      <PageHeader
        title="Order management"
        subtitle="Every reservation, confirmed order and delivery across the dealer network."
        live={live}
        actions={
          <>
            <ExportButton resource="orders" entity="Order" />
            <CreateRecordButton
              resource="orders"
              entity="Order"
              fields={ORDER_FIELDS}
              defaults={{ trim: '3EV Launch Edition', color: 'Safety Orange', status: 'reservation', deposit: 500 }}
            />
          </>
        }
      />

      <Card bodyClassName="p-4 sm:p-5">
        <Filters
          basePath="/admin/orders"
          search={params.search}
          searchPlaceholder="Search order number, customer or dealer"
          filters={[
            { key: 'status', label: 'Status', value: params.status, options: STATUS_OPTIONS },
            { key: 'trim', label: 'Trim', value: params.trim, options: TRIM_OPTIONS },
            { key: 'sort', label: 'Sort', value: params.sort, options: SORT_OPTIONS },
          ]}
        />

        {rows.length === 0 ? (
          <EmptyState message="No orders match these filters." />
        ) : (
          <>
            <TableShell>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Dealer</th>
                  <th>Configuration</th>
                  <th>Status</th>
                  <th className="w-40">Progress</th>
                  <th>Placed</th>
                  <th>Est. delivery</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o: any) => (
                  <tr key={o.id}>
                    <td>
                      <span className="font-mono text-xs text-white">{o.orderNumber}</span>
                      <p className="text-[11px] text-chalk-600">Deposit {currency(o.deposit)}</p>
                    </td>
                    <td className="font-medium text-white">{o.customerName}</td>
                    <td className="max-w-[220px] truncate text-chalk-400">{o.dealerName}</td>
                    <td>
                      <span className="text-chalk-200">{o.trim}</span>
                      <p className="text-[11px] text-chalk-600">{o.color}</p>
                    </td>
                    <td>
                      <StatusPill status={o.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={o.progress} className="w-24" />
                        <span className="text-[11px] text-chalk-500">{o.progress}%</span>
                      </div>
                    </td>
                    <td className="text-chalk-400">{date(o.placedAt)}</td>
                    <td className="text-chalk-400">{date(o.estimatedDelivery)}</td>
                    <td className="text-right font-medium text-white">{currency(o.total)}</td>
                    <td>
                      <RowActions
                        resource="orders"
                        entity="Order"
                        fields={ORDER_FIELDS}
                        record={o}
                        recordLabel={o.orderNumber}
                        detail={[
                          { label: 'Order number', value: o.orderNumber },
                          { label: 'Status', value: titleize(o.status) },
                          { label: 'Customer', value: o.customerName },
                          { label: 'Dealer', value: o.dealerName },
                          { label: 'Trim', value: o.trim },
                          { label: 'Colour', value: o.color },
                          { label: 'Placed', value: date(o.placedAt) },
                          { label: 'Estimated delivery', value: date(o.estimatedDelivery) },
                          { label: 'Deposit', value: currency(o.deposit) },
                          { label: 'Total', value: currency(o.total) },
                          { label: 'Progress', value: `${o.progress}%` },
                          { label: 'Allocated VIN', value: o.vehicleId || 'Not allocated' },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>

            <Pagination
              meta={data.meta}
              basePath="/admin/orders"
              params={{
                search: params.search,
                status: params.status,
                trim: params.trim,
                sort: params.sort,
              }}
            />
          </>
        )}
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Orders in view', value: number(data.meta?.total ?? 0) },
          { label: 'Contract value in view', value: currency((data.meta?.total ?? 0) * 39980, { compact: true }) },
          { label: 'Average deposit', value: currency(1333) },
        ].map((s) => (
          <div key={s.label} className="panel px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-600">{s.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-chalk-600">
        Need the full order journey?{' '}
        <Link href="/admin/vehicles" className="text-chalk-300 underline-offset-4 hover:underline">
          Track allocated VINs in inventory
        </Link>
        .
      </p>
    </>
  );
}
