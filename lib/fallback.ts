/**
 * Offline fallback dataset.
 *
 * The admin screens fetch from the NestJS API. If the API is not running (a
 * laptop demo, a preview deploy without the backend) `lib/api.ts` falls back to
 * this dataset so the presentation never shows a broken screen — the UI then
 * renders an "offline data" badge so nobody mistakes it for live data.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(77123);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pad = (n: number, len: number) => String(n).padStart(len, '0');
const DAY = 86400000;
const NOW = new Date('2026-09-12T00:00:00.000Z').getTime();
const ago = (d: number) => new Date(NOW - d * DAY).toISOString();
const ahead = (d: number) => new Date(NOW + d * DAY).toISOString();

const TRIMS = ['3EV Launch Edition', '3EV Touring', '3EV Sport', '3EV Fleet'];
const COLORS = ['Safety Orange', 'Arctic White', 'Obsidian', 'Signal Red', 'Pacific Blue', 'Titanium'];
const CITIES: Array<[string, string, string]> = [
  ['Los Angeles', 'CA', 'West'], ['Seattle', 'WA', 'West'], ['Phoenix', 'AZ', 'West'],
  ['Denver', 'CO', 'Mountain'], ['Las Vegas', 'NV', 'Mountain'],
  ['Dallas', 'TX', 'South'], ['Miami', 'FL', 'South'], ['Atlanta', 'GA', 'South'],
  ['Chicago', 'IL', 'Midwest'], ['Detroit', 'MI', 'Midwest'],
  ['New York', 'NY', 'Northeast'], ['Boston', 'MA', 'Northeast'],
  ['Toronto', 'ON', 'Canada'], ['Saint John', 'NB', 'Canada'],
];
const NAMES = ['James Bennett', 'Maria Alvarez', 'David Chen', 'Sofia Okafor', 'Aisha Patel', 'Robert Sullivan', 'Elena Moreau', 'Marcus Grant', 'Chloe Silva', 'Omar Hassan', 'Nina Kowalski', 'Tyler Brooks'];
const STATUSES = ['reservation', 'confirmed', 'in_production', 'in_transit', 'ready_for_delivery', 'delivered'];
const PROGRESS: Record<string, number> = {
  reservation: 10, confirmed: 28, in_production: 55, in_transit: 76, ready_for_delivery: 90, delivered: 100, cancelled: 0,
};

const dealers = CITIES.map((c, i) => {
  const [city, state, region] = c;
  const status = i < 10 ? 'active' : i < 12 ? 'onboarding' : i < 13 ? 'prospect' : 'suspended';
  const ordersYtd = status === 'active' ? int(340, 2200) : int(20, 240);
  const deliveriesYtd = Math.floor(ordersYtd * 0.55);
  return {
    id: `DLR-${pad(i + 1, 3)}`,
    name: `Visionary Vehicles ${city}`,
    code: `VV${state}${pad(i + 1, 2)}`,
    city, state, region,
    country: region === 'Canada' ? 'Canada' : 'United States',
    status,
    principal: pick(NAMES),
    email: `principal@vv-${city.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1 (${int(201, 989)}) ${int(200, 999)}-${pad(int(0, 9999), 4)}`,
    onboardedAt: ago(int(30, 800)),
    allocation: int(40, 420),
    ordersYtd,
    deliveriesYtd,
    revenueYtd: deliveriesYtd * 39980,
    satisfaction: Number((3.9 + rand() * 1.1).toFixed(1)),
    serviceCapacity: int(40, 100),
    lat: 0, lng: 0,
  };
});

const customers = Array.from({ length: 90 }, (_, i) => {
  const dealer = pick(dealers);
  const segment = rand() < 0.75 ? 'retail' : rand() < 0.6 ? 'fleet' : 'commercial';
  const orders = segment === 'fleet' ? int(2, 18) : 1;
  return {
    id: `CUS-${pad(i + 1, 5)}`,
    name: pick(NAMES),
    email: `owner${i}@example.com`,
    phone: `+1 (${int(201, 989)}) ${int(200, 999)}-${pad(int(0, 9999), 4)}`,
    city: dealer.city, state: dealer.state,
    segment,
    dealerId: dealer.id,
    dealerName: dealer.name,
    createdAt: ago(int(1, 500)),
    lifetimeValue: orders * 39980,
    orders,
    status: rand() < 0.25 ? 'owner' : rand() < 0.7 ? 'reserved' : 'lead',
  };
});

const orders = Array.from({ length: 120 }, (_, i) => {
  const customer = pick(customers);
  const dealer = dealers.find((d) => d.id === customer.dealerId)!;
  const status = pick(STATUSES);
  const placed = int(1, 420);
  return {
    id: `ORD-${pad(i + 1, 6)}`,
    orderNumber: `VV-3EV-${pad(100000 + i, 6)}`,
    customerId: customer.id,
    customerName: customer.name,
    dealerId: dealer.id,
    dealerName: dealer.name,
    vehicleId: null as string | null,
    trim: pick(TRIMS),
    color: pick(COLORS),
    status,
    placedAt: ago(placed),
    estimatedDelivery: status === 'delivered' ? ago(int(1, placed)) : ahead(int(5, 380)),
    deposit: pick([500, 1000, 2500]),
    total: 39980,
    progress: PROGRESS[status],
  };
});

const vehicles = Array.from({ length: 80 }, (_, i) => {
  const dealer = pick(dealers);
  return {
    id: `VEH-${pad(i + 1, 5)}`,
    vin: `3EV${pad(int(0, 99999), 5)}VV${pad(i + 1, 6)}`,
    trim: pick(TRIMS),
    color: pick(COLORS),
    status: pick(['in_production', 'in_stock', 'allocated', 'in_transit', 'delivered']),
    batteryKwh: pick([82, 92, 102]),
    rangeMiles: pick([248, 262, 275, 288]),
    builtAt: ago(int(1, 200)),
    plant: pick(['Saint John Assembly', 'Phoenix Assembly']),
    dealerId: dealer.id,
    dealerName: dealer.name,
    orderId: null as string | null,
  };
});

const tickets = Array.from({ length: 60 }, (_, i) => {
  const dealer = pick(dealers);
  const subjects: Array<[string, string]> = [
    ['Battery', 'Charging session interrupts at 80% state of charge'],
    ['Software', 'Infotainment reboots during navigation'],
    ['Body', 'Door seal wind noise above 60 mph'],
    ['Drivetrain', 'Rear motor whine under acceleration'],
    ['Charging', 'Home charger commissioning appointment'],
    ['Warranty', 'Warranty claim review - drive unit'],
  ];
  const [category, subject] = pick(subjects);
  return {
    id: `SVC-${pad(i + 1, 5)}`,
    ticketNumber: `SR-${pad(50000 + i, 6)}`,
    vin: pick(vehicles).vin,
    customerId: pick(customers).id,
    customerName: pick(NAMES),
    dealerId: dealer.id,
    dealerName: dealer.name,
    category,
    subject,
    status: pick(['open', 'in_progress', 'awaiting_parts', 'resolved']),
    priority: rand() < 0.1 ? 'critical' : pick(['low', 'medium', 'high']),
    openedAt: ago(int(0, 80)),
    slaHours: pick([4, 8, 24, 48, 72]),
    underWarranty: rand() < 0.8,
  };
});

const MONTH_LABELS = ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26'];
const monthly = MONTH_LABELS.map((label, i) => {
  const orders = 180 + i * 46 + int(-30, 40);
  const deliveries = Math.round(orders * (0.28 + i * 0.02));
  return { key: `m-${i}`, label, orders, deliveries, revenue: deliveries * 39980 };
});

const paginate = <T,>(rows: T[], page = 1, pageSize = 20) => ({
  data: rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
  meta: {
    total: rows.length,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(rows.length / pageSize)),
  },
});

const pipeline = [
  { status: 'reservation', label: 'Reservations' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_production', label: 'In production' },
  { status: 'in_transit', label: 'In transit' },
  { status: 'ready_for_delivery', label: 'Ready for delivery' },
  { status: 'delivered', label: 'Delivered' },
].map((s) => {
  const rows = orders.filter((o) => o.status === s.status);
  return { ...s, count: rows.length, value: rows.length * 39980 };
});

const trimMix = TRIMS.map((trim) => {
  const count = orders.filter((o) => o.trim === trim).length;
  return { trim, count, share: Number(((count / orders.length) * 100).toFixed(1)) };
}).sort((a, b) => b.count - a.count);

const regions = [...new Set(dealers.map((d) => d.region))].map((region) => {
  const rows = dealers.filter((d) => d.region === region);
  return {
    region,
    dealers: rows.length,
    orders: rows.reduce((s, d) => s + d.ordersYtd, 0),
    revenue: rows.reduce((s, d) => s + d.revenueYtd, 0),
    satisfaction: Number((rows.reduce((s, d) => s + d.satisfaction, 0) / rows.length).toFixed(2)),
  };
}).sort((a, b) => b.revenue - a.revenue);

const topDealers = [...dealers]
  .sort((a, b) => b.revenueYtd - a.revenueYtd)
  .slice(0, 8)
  .map((d) => ({ ...d, conversion: Number(((d.deliveriesYtd / Math.max(1, d.ordersYtd)) * 100).toFixed(1)) }));

const activity = [
  ...orders.slice(0, 40).map((o) => ({
    id: `act-${o.id}`,
    type: 'order',
    title: `${o.orderNumber} - ${o.status.replace(/_/g, ' ')}`,
    description: `${o.customerName} - ${o.trim} - ${o.dealerName}`,
    at: o.placedAt,
  })),
  ...tickets.slice(0, 20).map((t) => ({
    id: `act-${t.id}`,
    type: 'service',
    title: `${t.ticketNumber} - ${t.subject}`,
    description: `${t.dealerName} - priority ${t.priority}`,
    at: t.openedAt,
  })),
].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 12);

const alerts = [
  { id: 'a1', level: 'critical', title: '6 critical service tickets open', detail: 'Escalate to regional service managers within SLA window.' },
  { id: 'a2', level: 'warning', title: '1 dealer suspended', detail: 'Compliance review required before allocation resumes.' },
  { id: 'a3', level: 'info', title: '18 vehicles in stock without an order', detail: 'Consider reallocating to high-demand regions.' },
];

export const fallback = {
  dashboard: {
    demoData: true,
    kpis: {
      totalBacklog: 46000,
      backlogValue: 46000 * 39980,
      openOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
      deliveries: orders.filter((o) => o.status === 'delivered').length,
      revenueYtd: dealers.reduce((s, d) => s + d.revenueYtd, 0),
      activeDealers: dealers.filter((d) => d.status === 'active').length,
      totalDealers: dealers.length,
      inventory: vehicles.filter((v) => v.status === 'in_stock').length,
      inProduction: vehicles.filter((v) => v.status === 'in_production').length,
      customers: customers.length,
      openTickets: tickets.filter((t) => t.status !== 'resolved').length,
      criticalTickets: tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length,
      avgSatisfaction: Number((dealers.reduce((s, d) => s + d.satisfaction, 0) / dealers.length).toFixed(2)),
      orderGrowth: 12.4,
    },
    pipeline,
    monthly,
    trimMix,
    topDealers: topDealers.slice(0, 6),
    regions,
    activity,
    alerts,
  },
  orders: (page = 1, pageSize = 20) => paginate(orders, page, pageSize),
  dealers: (page = 1, pageSize = 20) => paginate([...dealers].sort((a, b) => b.revenueYtd - a.revenueYtd), page, pageSize),
  vehicles: (page = 1, pageSize = 20) => paginate(vehicles, page, pageSize),
  customers: (page = 1, pageSize = 20) => paginate(customers, page, pageSize),
  tickets: (page = 1, pageSize = 20) => paginate(tickets, page, pageSize),
  regionsList: regions,
  vehicleSummary: {
    total: vehicles.length,
    byStatus: ['in_production', 'in_stock', 'allocated', 'in_transit', 'delivered'].map((status) => ({
      status,
      count: vehicles.filter((v) => v.status === status).length,
    })),
    byTrim: TRIMS.map((trim) => ({ trim, count: vehicles.filter((v) => v.trim === trim).length })),
  },
  customerSummary: {
    total: customers.length,
    bySegment: ['retail', 'fleet', 'commercial'].map((segment) => ({
      segment,
      count: customers.filter((c) => c.segment === segment).length,
    })),
    byStatus: ['lead', 'reserved', 'owner'].map((status) => ({
      status,
      count: customers.filter((c) => c.status === status).length,
    })),
    pipelineValue: customers.reduce((s, c) => s + c.lifetimeValue, 0),
  },
  serviceSummary: {
    total: tickets.length,
    open: tickets.filter((t) => t.status !== 'resolved').length,
    critical: tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length,
    awaitingParts: tickets.filter((t) => t.status === 'awaiting_parts').length,
    warrantyShare: 80,
    byStatus: ['open', 'in_progress', 'awaiting_parts', 'resolved'].map((status) => ({
      status,
      count: tickets.filter((t) => t.status === status).length,
    })),
    byCategory: [...new Set(tickets.map((t) => t.category))].map((category) => ({
      category,
      count: tickets.filter((t) => t.category === category).length,
    })).sort((a, b) => b.count - a.count),
  },
  analytics: {
    monthly,
    trimMix,
    colorMix: COLORS.map((color) => ({ color, count: orders.filter((o) => o.color === color).length })),
    funnel: [
      { stage: 'Leads', count: customers.length * 14 },
      { stage: 'Reservations', count: orders.length * 6 },
      { stage: 'Confirmed orders', count: orders.filter((o) => o.status !== 'reservation').length * 6 },
      { stage: 'Deliveries', count: orders.filter((o) => o.status === 'delivered').length * 6 },
    ],
    topDealers,
    regions,
  },
  locator: dealers
    .filter((d) => d.status === 'active' || d.status === 'onboarding')
    .map((d) => ({
      id: d.id, name: d.name, city: d.city, state: d.state,
      country: d.country, phone: d.phone, status: d.status, lat: d.lat, lng: d.lng,
    })),
};
