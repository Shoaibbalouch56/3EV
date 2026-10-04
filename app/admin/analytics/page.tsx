import { getAnalytics } from '@/lib/api';
import { currency, number, percent } from '@/lib/format';
import { Card, PageHeader, ProgressBar, StatCard, TableShell } from '@/components/admin/Ui';
import { BarChart, DonutChart, Funnel, Sparkline, TrendChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics' };

export default async function AnalyticsPage() {
  const { data, live } = await getAnalytics();

  const monthly = data.monthly || [];
  const totalOrders = monthly.reduce((s: number, m: any) => s + m.orders, 0);
  const totalDeliveries = monthly.reduce((s: number, m: any) => s + m.deliveries, 0);
  const totalRevenue = monthly.reduce((s: number, m: any) => s + (m.revenue || 0), 0);
  const conversion = totalOrders ? (totalDeliveries / totalOrders) * 100 : 0;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Demand, conversion, product mix and dealer performance across the programme."
        live={live}
        actions={
          <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-chalk-400">
            Rolling 12 months
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders (12 mo)" value={number(totalOrders)} delta={12.4} />
        <StatCard label="Deliveries (12 mo)" value={number(totalDeliveries)} delta={18.2} accent="volt" />
        <StatCard label="Revenue (12 mo)" value={currency(totalRevenue, { compact: true })} delta={16.9} accent="ember" />
        <StatCard label="Order → delivery" value={percent(conversion, 1)} hint="Conversion rate" accent="neutral" />
      </div>

      <div className="mt-6 grid gap-4">
        <Card title="Demand curve" subtitle="Order intake against deliveries, by month">
          <TrendChart data={monthly} height={300} />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card title="Sales funnel" subtitle="Lead to delivery">
          <Funnel data={data.funnel || []} />
        </Card>

        <Card title="Trim mix" subtitle="Share of order book">
          <DonutChart data={(data.trimMix || []).map((t: any) => ({ label: t.trim, value: t.count }))} />
        </Card>

        <Card title="Colour popularity" subtitle="Orders by finish">
          <BarChart
            data={(data.colorMix || []).map((c: any) => ({ label: c.color.split(' ')[0], value: c.count }))}
            color="#2ED3A7"
            height={190}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Dealer leaderboard" subtitle="Ranked by revenue year to date">
          <TableShell>
            <thead>
              <tr>
                <th>#</th>
                <th>Dealer</th>
                <th>Region</th>
                <th className="text-right">Orders</th>
                <th className="text-right">Deliveries</th>
                <th className="text-right">Conversion</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {(data.topDealers || []).map((d: any, i: number) => (
                <tr key={d.id}>
                  <td className="text-chalk-600">{i + 1}</td>
                  <td>
                    <p className="font-medium text-white">{d.name}</p>
                    <p className="text-[11px] text-chalk-600">
                      {d.city}, {d.state}
                    </p>
                  </td>
                  <td className="text-chalk-400">{d.region}</td>
                  <td className="text-right text-chalk-300">{number(d.ordersYtd)}</td>
                  <td className="text-right text-chalk-300">{number(d.deliveriesYtd)}</td>
                  <td className="text-right">
                    <span className={d.conversion >= 55 ? 'text-volt' : 'text-chalk-300'}>
                      {percent(d.conversion, 0)}
                    </span>
                  </td>
                  <td className="text-right font-medium text-white">
                    {currency(d.revenueYtd, { compact: true })}
                  </td>
                  <td className="text-right">
                    <Sparkline
                      values={monthly.slice(-8).map((m: any, idx: number) => m.orders * (0.6 + ((i + idx) % 5) * 0.12))}
                      color={i < 3 ? '#2ED3A7' : '#E11D2E'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card title="Regional share" subtitle="Revenue contribution">
          <div className="space-y-5">
            {(data.regions || []).map((r: any) => {
              const total = (data.regions || []).reduce((s: number, x: any) => s + x.revenue, 0) || 1;
              const share = (r.revenue / total) * 100;
              return (
                <div key={r.region}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-chalk-300">{r.region}</span>
                    <span className="text-chalk-500">{percent(share, 0)}</span>
                  </div>
                  <ProgressBar value={share} className="mt-2" />
                  <p className="mt-1.5 text-[11px] text-chalk-600">
                    {r.dealers} dealers · {number(r.orders)} orders · {currency(r.revenue, { compact: true })}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
