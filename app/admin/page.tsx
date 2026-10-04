import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  Car,
  ClipboardList,
  Info,
  LifeBuoy,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getDashboard } from '@/lib/api';
import { currency, number, percent, timeAgo, titleize } from '@/lib/format';
import { Card, PageHeader, ProgressBar, StatCard } from '@/components/admin/Ui';
import { DonutChart, TrendChart } from '@/components/admin/Charts';

export const dynamic = 'force-dynamic';

const ALERT_STYLES: Record<string, { ring: string; icon: string }> = {
  critical: { ring: 'border-brand/30 bg-brand/[0.07]', icon: 'text-brand' },
  warning: { ring: 'border-ember/30 bg-ember/[0.07]', icon: 'text-ember' },
  info: { ring: 'border-white/10 bg-white/[0.03]', icon: 'text-chalk-400' },
};

const ACTIVITY_DOT: Record<string, string> = {
  order: 'bg-brand',
  service: 'bg-ember',
  dealer: 'bg-volt',
};

export default async function AdminDashboardPage() {
  const { data, live } = await getDashboard();
  const k = data.kpis;

  return (
    <>
      <PageHeader
        title="Executive dashboard"
        subtitle="Order book, dealer network, production and service — one view of the Bricklin 3EV programme."
        live={live}
        actions={
          <>
            <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-chalk-400">
              Last 12 months
            </span>
            <Link href="/admin/analytics" className="btn-ghost btn-sm">
              Full analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-ember/25 bg-ember/[0.06] px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
        <p className="text-xs leading-relaxed text-chalk-300">
          <span className="font-medium text-white">Demonstration dataset.</span> Figures below —
          including the 46,000-unit backlog — are illustrative sample data for this prototype. A
          production deployment reads the verified order book from the company&apos;s systems.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Order backlog"
          value={number(k.totalBacklog, { compact: true })}
          hint={`${currency(k.backlogValue, { compact: true })} contracted value`}
          delta={k.orderGrowth}
          icon={ClipboardList}
          accent="brand"
        />
        <StatCard
          label="Revenue YTD"
          value={currency(k.revenueYtd, { compact: true })}
          hint={`${number(k.deliveries)} deliveries recorded`}
          delta={8.6}
          icon={BadgeDollarSign}
          accent="volt"
        />
        <StatCard
          label="Active dealers"
          value={`${k.activeDealers}/${k.totalDealers}`}
          hint={`Avg CSAT ${k.avgSatisfaction}`}
          icon={Store}
          accent="ember"
        />
        <StatCard
          label="Open service tickets"
          value={number(k.openTickets)}
          hint={`${k.criticalTickets} critical`}
          delta={-4.2}
          icon={LifeBuoy}
          accent="neutral"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Order intake vs. deliveries"
          subtitle="Rolling 12 months"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-volt/10 px-2 py-1 text-[11px] font-medium text-volt">
              <TrendingUp className="h-3 w-3" />
              {percent(k.orderGrowth)} MoM
            </span>
          }
        >
          <TrendChart data={data.monthly} />
        </Card>

        <Card title="Trim mix" subtitle="Share of total order book">
          <DonutChart
            data={(data.trimMix || []).map((t: any) => ({ label: t.trim, value: t.count }))}
            centerLabel="Configurations in the book"
            centerValue={number((data.trimMix || []).reduce((s: number, t: any) => s + t.count, 0))}
          />
        </Card>
      </div>

      {/* Pipeline */}
      <div className="mt-6">
        <Card
          title="Order pipeline"
          subtitle="Every reservation from deposit to delivery"
          action={
            <Link href="/admin/orders" className="text-xs text-chalk-400 transition hover:text-white">
              Manage orders →
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(data.pipeline || []).map((stage: any, i: number) => {
              const total = (data.pipeline || []).reduce((s: number, p: any) => s + p.count, 0) || 1;
              return (
                <Link
                  key={stage.status}
                  href={`/admin/orders?status=${stage.status}`}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" style={{ opacity: 1 - i * 0.13 }} />
                    <p className="truncate text-xs text-chalk-500">{stage.label}</p>
                  </div>
                  <p className="mt-3 font-display text-2xl font-semibold text-white">
                    {number(stage.count)}
                  </p>
                  <p className="mt-1 text-[11px] text-chalk-600">
                    {currency(stage.value, { compact: true })}
                  </p>
                  <ProgressBar value={(stage.count / total) * 100} className="mt-3" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Network + inventory */}
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Top dealers by revenue" subtitle="Year to date">
          <div className="overflow-x-auto">
            <table className="table-vv">
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Region</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Deliveries</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {(data.topDealers || []).map((d: any) => (
                  <tr key={d.id}>
                    <td>
                      <Link href="/admin/dealers" className="font-medium text-white hover:text-brand">
                        {d.name}
                      </Link>
                      <p className="text-xs text-chalk-600">
                        {d.city}, {d.state}
                      </p>
                    </td>
                    <td className="text-chalk-400">{d.region}</td>
                    <td className="text-right">{number(d.ordersYtd)}</td>
                    <td className="text-right">{number(d.deliveriesYtd)}</td>
                    <td className="text-right font-medium text-white">
                      {currency(d.revenueYtd, { compact: true })}
                    </td>
                    <td className="text-right">
                      <span className={d.satisfaction >= 4.5 ? 'text-volt' : 'text-chalk-300'}>
                        {d.satisfaction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Production & inventory">
            <div className="space-y-4">
              {[
                { label: 'In production', value: k.inProduction, icon: Car, accent: 'text-ember' },
                { label: 'In stock', value: k.inventory, icon: Car, accent: 'text-volt' },
                { label: 'Open orders', value: k.openOrders, icon: ClipboardList, accent: 'text-brand' },
                { label: 'Customers', value: k.customers, icon: Users, accent: 'text-chalk-300' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm text-chalk-400">
                    <row.icon className={`h-4 w-4 ${row.accent}`} />
                    {row.label}
                  </span>
                  <span className="font-display text-lg font-semibold text-white">
                    {number(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/admin/vehicles" className="btn-ghost btn-sm mt-6 w-full">
              Open inventory
            </Link>
          </Card>

          <Card title="Regional performance">
            <div className="space-y-4">
              {(data.regions || []).slice(0, 5).map((r: any) => {
                const max = Math.max(...(data.regions || []).map((x: any) => x.revenue)) || 1;
                return (
                  <div key={r.region}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-chalk-300">{r.region}</span>
                      <span className="text-chalk-500">{currency(r.revenue, { compact: true })}</span>
                    </div>
                    <ProgressBar value={(r.revenue / max) * 100} className="mt-2" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Activity + alerts */}
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Recent activity" subtitle="Orders, service and network events">
          <ol className="relative space-y-5 pl-5">
            <span className="absolute inset-y-1 left-[5px] w-px bg-white/[0.08]" aria-hidden="true" />
            {(data.activity || []).map((a: any) => (
              <li key={a.id} className="relative">
                <span
                  className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-950 ${
                    ACTIVITY_DOT[a.type] || 'bg-chalk-500'
                  }`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-white">{titleize(a.title)}</p>
                  <span className="text-[11px] text-chalk-600">{timeAgo(a.at)}</span>
                </div>
                <p className="mt-0.5 text-xs text-chalk-500">{a.description}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Alerts" subtitle="Needs an executive decision">
          <ul className="space-y-3">
            {(data.alerts || []).map((alert: any) => {
              const style = ALERT_STYLES[alert.level] || ALERT_STYLES.info;
              return (
                <li key={alert.id} className={`rounded-xl border p-4 ${style.ring}`}>
                  <div className="flex gap-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-chalk-500">{alert.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
