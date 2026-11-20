export default {
  id: 'day-45-charts-dashboards',
  title: 'Charts and Dashboards: Recharts / Chart.js, KPI Cards and an Admin Analytics Dashboard',
  module: 'Module 10: Advanced Industry Topics',
  day: 45,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Almost every company app has an admin or analytics dashboard: revenue KPIs, sales trends, category share. You will learn how to choose the right chart, build charts with Recharts and Chart.js (react-chartjs-2), format Indian currency, design KPI cards, and assemble a responsive admin dashboard that loads real data from an API.',
  objectives: [
    'Choose the right chart type (bar, line, area, pie/donut) for a business question',
    'Build responsive charts with Recharts and with Chart.js through react-chartjs-2',
    'Transform raw API data into chart-ready arrays with map/reduce and useMemo',
    'Create reusable KPI cards with Indian number formatting (Intl.NumberFormat en-IN) and trend indicators',
    'Assemble an admin analytics dashboard with loading, error and empty states and accessible charts',
  ],
  theory: [
    {
      heading: 'Dashboards in real companies and choosing the right chart',
      content:
        'A dashboard answers business questions at a glance: "How much did we sell today?", "Which category is growing?", "Are refunds rising?". A typical admin dashboard (Flipkart seller hub, Zoho, Razorpay) has:\n\n1. A row of **KPI cards** (revenue, orders, customers, conversion) with a % change vs last period\n2. A **trend chart** (line/area) over time\n3. A **comparison chart** (bar) between categories, cities or products\n4. A **share chart** (pie/donut) for parts of a whole\n5. A **table** of recent orders or top products (Day 46)\n\nChoosing a chart:\n- **Line / area**: change over time (daily revenue for 30 days)\n- **Bar / column**: compare categories (sales per city). Horizontal bars when labels are long\n- **Pie / donut**: share of a total, only with **2 to 6 slices**; otherwise use a bar chart\n- **Stacked bar**: composition across categories (online vs COD per month)\n- **Scatter**: relation between two numbers (price vs rating)\n\nAnalogy: a KPI card is the car speedometer (one number, now). A line chart is the trip log (how speed changed). A pie chart is the fuel split between city and highway driving.',
      tip: 'Common mistake: a pie chart with 15 slices, or a 3D chart. If people have to read a legend to compare values, a sorted bar chart is better.',
    },
    {
      heading: 'Recharts: composable React charts',
      content:
        '**Recharts** (`npm install recharts`, v2) is the most popular React chart library. Charts are built from **components**, just like JSX UI:\n\n- A chart container: `LineChart`, `BarChart`, `AreaChart`, `PieChart`, `ComposedChart`\n- Children: `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `Line`, `Bar`, `Area`, `Pie`, `Cell`\n- `ResponsiveContainer width="100%" height={300}` makes the chart resize with its parent (the parent must have a size)\n\nData is an **array of objects**; `dataKey` tells each element which property to read. Recharts renders **SVG**, so it is crisp and styleable, but it can get slow with many thousands of points.',
      syntax:
        "import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';\n\nconst data = [\n  { month: 'Jan', revenue: 420000, orders: 310 },\n  { month: 'Feb', revenue: 510000, orders: 360 },\n  { month: 'Mar', revenue: 480000, orders: 342 },\n];\n\nexport function RevenueChart() {\n  return (\n    <ResponsiveContainer width=\"100%\" height={300}>\n      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>\n        <CartesianGrid strokeDasharray=\"3 3\" />\n        <XAxis dataKey=\"month\" />\n        <YAxis tickFormatter={v => '₹' + v / 100000 + 'L'} />\n        <Tooltip formatter={v => '₹' + v.toLocaleString('en-IN')} />\n        <Legend />\n        <Line type=\"monotone\" dataKey=\"revenue\" stroke=\"#4f46e5\" strokeWidth={2} />\n      </LineChart>\n    </ResponsiveContainer>\n  );\n}",
    },
    {
      heading: 'Chart.js with react-chartjs-2',
      content:
        '**Chart.js** draws on a **canvas** (faster for big datasets, less DOM). In React you use the wrapper `react-chartjs-2`: `npm install chart.js react-chartjs-2`.\n\nDifferences from Recharts:\n- Configuration is an **object** (`data` with `labels` + `datasets`, and `options`) instead of child components\n- Chart.js v4 is **tree-shakable**: you must **register** the pieces you use (scales, elements, plugins), otherwise you get errors like `"category" is not a registered scale`\n- Charts are responsive by default; set `maintainAspectRatio: false` and give the wrapper a height for full control\n\nWhen to choose what: Recharts for typical React dashboards and custom SVG styling; Chart.js for large datasets, canvas performance, or when designers already use Chart.js; ECharts / Highcharts / ApexCharts for very advanced visualisations (Highcharts needs a commercial licence).',
      syntax:
        "import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';\nimport { Bar } from 'react-chartjs-2';\n\nChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);\n\nconst data = {\n  labels: ['Mumbai', 'Delhi', 'Bengaluru', 'Pune'],\n  datasets: [{ label: 'Orders', data: [1240, 1100, 980, 640], backgroundColor: '#22c55e' }],\n};\nconst options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };\n\nexport const CityOrders = () => <div style={{ height: 280 }}><Bar data={data} options={options} /></div>;",
    },
    {
      heading: 'Preparing data: transform, aggregate, memoise',
      content:
        'APIs rarely return data in chart shape. You will usually:\n1. **Group** rows (orders by month, products by category) with `reduce`\n2. **Convert** to an array of `{ label, value }` objects\n3. **Sort** (bar charts read best sorted) and **limit** (top 5 + "Others")\n4. **Format** numbers only for display (axis ticks, tooltip), keep raw numbers in data\n\nWrap expensive transformations in `useMemo` so they do not re-run on every render (for example when a tooltip moves). In bigger apps, the backend should do heavy aggregation (an `/analytics/summary` endpoint) instead of sending 50,000 orders to the browser.',
      syntax:
        "const byCategory = useMemo(() => {\n  const totals = products.reduce((acc, p) => {\n    acc[p.category] = (acc[p.category] || 0) + p.price * p.stock;\n    return acc;\n  }, {});\n  return Object.entries(totals)\n    .map(([category, value]) => ({ category, value: Math.round(value) }))\n    .sort((a, b) => b.value - a.value)\n    .slice(0, 6);\n}, [products]);",
      tip: 'Indian formatting: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(1234567) gives ₹12,34,567. Use notation: "compact" for axis ticks (₹12L).',
    },
    {
      heading: 'KPI cards and dashboard layout',
      content:
        'A good **KPI card** shows: a label, the main value (big), a comparison (`+12.4% vs last month`, green up / red down), and optionally a small sparkline. Make it a reusable component: `<KpiCard label value change format />`.\n\nLayout: CSS Grid with `repeat(auto-fit, minmax(200px, 1fr))` for KPI cards, and a 2-column grid for charts on desktop that stacks on mobile. Every chart lives in a **Card** with a title, a short subtitle (period), and its own loading/empty/error state, so one failing widget does not break the whole page.\n\nIndustry folder structure:\n- `src/features/dashboard/DashboardPage.jsx`\n- `src/features/dashboard/components/KpiCard.jsx`, `RevenueChart.jsx`, `CategoryChart.jsx`\n- `src/features/dashboard/api/dashboardApi.js` (queries with TanStack Query)\n- `src/features/dashboard/utils/aggregate.js` (pure functions, easy to unit test)',
    },
    {
      heading: 'Accessibility, performance and the playground note',
      content:
        'Charts are images of data, so:\n- Give each chart a heading and an `aria-label` / `role="img"` summary ("Revenue rose from ₹4.2L in Jan to ₹6.1L in Jun")\n- Do not rely on colour alone; use labels, patterns or direct values\n- Offer a "View as table" toggle or a data table below for screen readers and for export\n- Use high-contrast colours and respect dark mode\n\nPerformance: lazy-load chart libraries on the dashboard route (`React.lazy`), because Recharts/Chart.js add 100KB+ to the bundle; avoid re-creating `data`/`options` objects on every render; for 10k+ points use canvas (Chart.js) or downsample.\n\nThe playground cannot import Recharts or Chart.js, so the examples below draw **plain SVG charts with React**. This is exactly what Recharts does internally, and it teaches you scales and coordinates. The `code` blocks show the real library code.\n\nComing next: Day 46 builds the data table that sits under these charts.',
    },
  ],
  examples: [
    {
      title: 'Reusable KPI cards with Indian currency and trend arrows',
      scenario:
        'The founder of "ChaiCart", a Bengaluru D2C tea brand, wants four numbers on top of the admin panel: revenue, orders, average order value and returning customers, each compared with last month.',
      steps: [
        'Create src/features/dashboard/components/KpiCard.jsx',
        'Write formatters with Intl.NumberFormat("en-IN") for currency, number and percent',
        'Calculate % change = (current - previous) / previous * 100',
        'Colour the change green for positive and red for negative, with an arrow and text (not colour only)',
        'Lay the cards out with CSS Grid auto-fit',
        'Run the playground and switch between "This month" and "Last month"',
      ],
      code: `// src/features/dashboard/utils/format.js
export const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const num = new Intl.NumberFormat('en-IN');
export const pct = v => (v > 0 ? '+' : '') + v.toFixed(1) + '%';

// src/features/dashboard/components/KpiCard.jsx
import { inr, num, pct } from '../utils/format';

export default function KpiCard({ label, value, previous, format = 'number', invert = false }) {
  const change = previous ? ((value - previous) / previous) * 100 : 0;
  const good = invert ? change < 0 : change >= 0;
  const display = format === 'currency' ? inr.format(value) : format === 'percent' ? value + '%' : num.format(value);
  return (
    <article className="kpi">
      <h3>{label}</h3>
      <p className="kpi-value">{display}</p>
      <p className={good ? 'up' : 'down'}>
        <span aria-hidden="true">{change >= 0 ? '▲' : '▼'}</span> {pct(change)} vs last month
      </p>
    </article>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IN');
const pct = v => (v > 0 ? '+' : '') + v.toFixed(1) + '%';

function KpiCard({ label, value, previous, format, invert }) {
  const change = previous ? ((value - previous) / previous) * 100 : 0;
  const good = invert ? change < 0 : change >= 0;
  const display = format === 'currency' ? inr.format(value) : format === 'percent' ? value + '%' : num.format(value);
  return (
    <article className="kpi">
      <h3>{label}</h3>
      <p className="value">{display}</p>
      <p className={good ? 'up' : 'down'}>
        <span aria-hidden="true">{change >= 0 ? '\\u25B2' : '\\u25BC'}</span> {pct(change)} <span className="muted">vs prev.</span>
      </p>
    </article>
  );
}

const periods = {
  'This month': { revenue: 1845600, orders: 4210, returning: 38, refunds: 41 },
  'Last month': { revenue: 1620300, orders: 4390, returning: 35, refunds: 52 },
  'Two months ago': { revenue: 1501000, orders: 3980, returning: 33, refunds: 47 },
};
const names = Object.keys(periods);

function App() {
  const [i, setI] = useState(0);
  const cur = periods[names[i]];
  const prev = periods[names[i + 1]] || cur;
  return (
    <div className="page">
      <header>
        <h2>ChaiCart overview</h2>
        <select value={i} onChange={e => setI(Number(e.target.value))}>
          {names.slice(0, 2).map((n, idx) => <option key={n} value={idx}>{n}</option>)}
        </select>
      </header>
      <section className="grid">
        <KpiCard label="Revenue" value={cur.revenue} previous={prev.revenue} format="currency" />
        <KpiCard label="Orders" value={cur.orders} previous={prev.orders} />
        <KpiCard label="Avg order value" value={Math.round(cur.revenue / cur.orders)} previous={Math.round(prev.revenue / prev.orders)} format="currency" />
        <KpiCard label="Returning customers" value={cur.returning} previous={prev.returning} format="percent" />
        <KpiCard label="Refunds" value={cur.refunds} previous={prev.refunds} invert />
      </section>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
header { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0 0 12px; }
select { padding: 6px 10px; border-radius: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.kpi { background: #fff; border-radius: 12px; padding: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.kpi h3 { margin: 0; font-size: 13px; color: #64748b; font-weight: 500; }
.value { font-size: 24px; font-weight: 700; margin: 6px 0; }
.up { color: #15803d; margin: 0; font-size: 13px; }
.down { color: #b91c1c; margin: 0; font-size: 13px; }
.muted { color: #94a3b8; }`,
      },
      result:
        'Five cards: Revenue ₹18,45,600 (+13.9%), Orders 4,210 (red, -4.1%), Avg order value, Returning customers 38% and Refunds 41 shown in green because fewer refunds is good. Switching to "Last month" compares with two months ago.',
      explanation:
        'Intl.NumberFormat with en-IN produces lakh/crore grouping (18,45,600). The change is computed from raw numbers, never from formatted strings. The `invert` prop handles "lower is better" metrics like refunds or delivery time, a detail many juniors miss. The arrow is aria-hidden while the text "+13.9%" carries the meaning for screen readers.',
    },
    {
      title: 'Bar chart with tooltip: plain SVG vs Recharts',
      scenario: 'Compare monthly orders across Indian cities. Show values on hover and keep the chart responsive.',
      steps: [
        'Prepare data as [{ city, orders }] sorted descending',
        'Compute a linear scale: barHeight = value / max * chartHeight',
        'Render one <rect> per item with an x position based on its index',
        'Show a tooltip on mouse enter / focus and hide it on leave / blur',
        'In a real project use Recharts BarChart (see code)',
      ],
      code: `import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { city: 'Mumbai', orders: 1240 }, { city: 'Delhi', orders: 1100 },
  { city: 'Bengaluru', orders: 980 }, { city: 'Hyderabad', orders: 760 },
  { city: 'Pune', orders: 640 }, { city: 'Kolkata', orders: 520 },
];

export default function CityOrdersChart() {
  return (
    <section className="card">
      <h3>Orders by city (October)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="city" />
          <YAxis />
          <Tooltip formatter={v => v.toLocaleString('en-IN') + ' orders'} />
          <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

const data = [
  { city: 'Mumbai', orders: 1240 }, { city: 'Delhi', orders: 1100 },
  { city: 'Bengaluru', orders: 980 }, { city: 'Hyderabad', orders: 760 },
  { city: 'Pune', orders: 640 }, { city: 'Kolkata', orders: 520 },
];

function BarChart({ data, xKey, yKey, height = 240, color = '#6366f1' }) {
  const [active, setActive] = useState(null);
  const W = 480, H = height, pad = { top: 16, right: 10, bottom: 30, left: 44 };
  const innerW = W - pad.left - pad.right, innerH = H - pad.top - pad.bottom;
  const max = Math.ceil(Math.max(...data.map(d => d[yKey])) / 500) * 500;
  const step = innerW / data.length, barW = step * 0.6;
  const y = v => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  return (
    <div className="chart">
      <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label={'Bar chart of ' + yKey + ' by ' + xKey}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * step + (step - barW) / 2;
          return (
            <g key={d[xKey]}>
              <rect
                x={x} y={y(d[yKey])} width={barW} height={pad.top + innerH - y(d[yKey])} rx="5"
                fill={active === i ? '#4338ca' : color} tabIndex="0"
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              />
              <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="#334155">{d[xKey]}</text>
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <div className="tip" style={{ left: ((pad.left + active * step + step / 2) / W) * 100 + '%' }}>
          <b>{data[active][xKey]}</b><br />{data[active][yKey].toLocaleString('en-IN')} orders
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <section className="card">
      <h3>Orders by city (October)</h3>
      <BarChart data={data} xKey="city" yKey="orders" />
      <small>Hover or Tab onto a bar.</small>
    </section>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #eef2ff; margin: 0; padding: 20px; }
.card { background: #fff; border-radius: 12px; padding: 16px; max-width: 560px; margin: auto; }
h3 { margin: 0 0 8px; }
.chart { position: relative; }
svg { width: 100%; height: auto; display: block; }
rect { transition: fill .15s; cursor: pointer; outline: none; }
.tip { position: absolute; top: 0; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; pointer-events: none; white-space: nowrap; }
small { color: #64748b; }`,
      },
      result:
        'Six indigo bars from Mumbai (tallest) to Kolkata with dashed grid lines and y-axis labels 0-1500. Hovering or tabbing to a bar darkens it and shows a dark tooltip with the city and order count.',
      explanation:
        'This is a plain-React version of Recharts\' BarChart. The core of every chart library is a **scale**: a function mapping data values to pixels (`y(v)`). SVG y grows downwards, so the bar starts at y(value) and its height reaches the baseline. viewBox + width:100% makes it responsive like ResponsiveContainer. tabIndex and onFocus make the tooltip keyboard accessible.',
    },
    {
      title: 'Multi-series line chart with a clickable legend',
      scenario: 'Show online vs COD revenue for 6 months and let the manager hide a series by clicking its legend item.',
      steps: [
        'Shape data as [{ month, online, cod }]',
        'Create x and y scales from the number of points and the max value of the visible series',
        'Build an SVG path "M x0 y0 L x1 y1 ..." for each series',
        'Keep hidden series in state and toggle them from legend buttons',
        'With Recharts, use <Line hide={hidden.cod} /> and Legend onClick (see code)',
      ],
      code: `import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const data = [
  { month: 'May', online: 820000, cod: 410000 }, { month: 'Jun', online: 910000, cod: 395000 },
  { month: 'Jul', online: 990000, cod: 380000 }, { month: 'Aug', online: 1120000, cod: 360000 },
  { month: 'Sep', online: 1180000, cod: 352000 }, { month: 'Oct', online: 1320000, cod: 330000 },
];
const lakh = v => '₹' + (v / 100000).toFixed(1) + 'L';

export default function PaymentTrend() {
  const [hidden, setHidden] = useState({});
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={lakh} />
        <Tooltip formatter={lakh} />
        <Legend onClick={e => setHidden(h => ({ ...h, [e.dataKey]: !h[e.dataKey] }))} />
        <Line dataKey="online" name="Online (UPI/Cards)" stroke="#2563eb" hide={hidden.online} strokeWidth={2} />
        <Line dataKey="cod" name="Cash on Delivery" stroke="#f59e0b" hide={hidden.cod} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}`,
      playground: {
        jsx: `const { useState, useMemo } = React;

const data = [
  { month: 'May', online: 820000, cod: 410000 }, { month: 'Jun', online: 910000, cod: 395000 },
  { month: 'Jul', online: 990000, cod: 380000 }, { month: 'Aug', online: 1120000, cod: 360000 },
  { month: 'Sep', online: 1180000, cod: 352000 }, { month: 'Oct', online: 1320000, cod: 330000 },
];
const series = [
  { key: 'online', name: 'Online (UPI/Cards)', color: '#2563eb' },
  { key: 'cod', name: 'Cash on Delivery', color: '#f59e0b' },
];
const lakh = v => '\\u20B9' + (v / 100000).toFixed(1) + 'L';

function LineChart() {
  const [hidden, setHidden] = useState({});
  const [hover, setHover] = useState(null);
  const W = 500, H = 260, L = 56, R = 16, T = 16, B = 30;
  const visible = series.filter(s => !hidden[s.key]);
  const max = useMemo(() => {
    const vals = data.flatMap(d => visible.map(s => d[s.key]));
    return vals.length ? Math.max(...vals) * 1.1 : 1;
  }, [hidden]);
  const x = i => L + (i * (W - L - R)) / (data.length - 1);
  const y = v => T + (H - T - B) * (1 - v / max);
  const path = key => data.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d[key]).toFixed(1)).join(' ');

  return (
    <div>
      <div className="legend">
        {series.map(s => (
          <button key={s.key} aria-pressed={!hidden[s.key]} className={hidden[s.key] ? 'off' : ''}
            onClick={() => setHidden(h => ({ ...h, [s.key]: !h[s.key] }))}>
            <i style={{ background: s.color }} /> {s.name}
          </button>
        ))}
      </div>
      <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Online revenue rising, COD falling from May to October"
        onMouseLeave={() => setHover(null)}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke="#e5e7eb" />
            <text x={L - 6} y={y(max * f) + 4} fontSize="10" textAnchor="end" fill="#6b7280">{lakh(max * f)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.month}>
            <text x={x(i)} y={H - 10} fontSize="11" textAnchor="middle" fill="#374151">{d.month}</text>
            <rect x={x(i) - 20} y={T} width="40" height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#9ca3af" strokeDasharray="4 3" />}
        {visible.map(s => (
          <g key={s.key}>
            <path d={path(s.key)} fill="none" stroke={s.color} strokeWidth="2.5" />
            {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d[s.key])} r={hover === i ? 5 : 3} fill={s.color} />)}
          </g>
        ))}
      </svg>
      <p className="readout">
        {hover === null ? 'Hover the chart to see values.' :
          data[hover].month + ': ' + visible.map(s => s.name + ' ' + lakh(data[hover][s.key])).join(' | ')}
      </p>
    </div>
  );
}

function App() {
  return (
    <section className="card">
      <h3>Revenue by payment method</h3>
      <LineChart />
    </section>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
.card { background: #fff; border-radius: 12px; padding: 16px; max-width: 580px; margin: auto; }
h3 { margin: 0 0 8px; }
svg { width: 100%; height: auto; }
.legend { display: flex; gap: 8px; flex-wrap: wrap; }
.legend button { display: flex; align-items: center; gap: 6px; border: 1px solid #e2e8f0; background: #fff; border-radius: 999px; padding: 4px 10px; cursor: pointer; }
.legend button.off { opacity: .45; text-decoration: line-through; }
.legend i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.readout { font-size: 13px; color: #334155; min-height: 18px; }`,
      },
      result:
        'A blue line rising from ₹8.2L to ₹13.2L and an amber line falling slowly. Hovering shows a dashed vertical guide and a readout under the chart. Clicking a legend pill hides that line and the y-axis rescales to the remaining series.',
      explanation:
        'Plain-React version of Recharts LineChart. A line is just an SVG path built from scaled points. The y-scale depends on visible series only, so hiding the big series zooms in on the small one (Recharts does the same with hide). aria-pressed on legend buttons tells screen readers whether a series is shown.',
    },
    {
      title: 'Donut chart for category share (with "Others")',
      scenario: 'Show the share of sales by category, keeping only the top 4 and grouping the rest as "Others".',
      steps: [
        'Sort categories by value and keep the top 4; sum the rest into "Others"',
        'Convert each value into an angle: value / total * 360',
        'Draw arcs with SVG stroke-dasharray on a circle (simple donut technique)',
        'Show the total in the centre and a legend with percentages',
        'In Recharts use <PieChart><Pie innerRadius outerRadius><Cell /></Pie></PieChart> (see code)',
      ],
      code: `import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#94a3b8'];

export default function CategoryDonut({ data }) {   // [{ name, value }]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
          {data.map((d, i) => <Cell key={d.name} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={v => '₹' + v.toLocaleString('en-IN')} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}`,
      playground: {
        jsx: `const { useMemo } = React;

const raw = [
  { name: 'Smartphones', value: 920000 }, { name: 'Laptops', value: 610000 },
  { name: 'Fashion', value: 380000 }, { name: 'Groceries', value: 260000 },
  { name: 'Beauty', value: 90000 }, { name: 'Home decor', value: 70000 }, { name: 'Sports', value: 40000 },
];
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#94a3b8'];

function topN(rows, n) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, n);
  const rest = sorted.slice(n).reduce((s, r) => s + r.value, 0);
  return rest ? top.concat({ name: 'Others', value: rest }) : top;
}

function Donut({ data, size = 220, thickness = 34 }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} role="img"
      aria-label={data.map(d => d.name + ' ' + Math.round((d.value / total) * 100) + '%').join(', ')}>
      <g transform={'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'}>
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle key={d.name} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS[i]} strokeWidth={thickness}
              strokeDasharray={Math.max(len - 2, 0) + ' ' + (C - len + 2)} strokeDashoffset={-offset}>
              <title>{d.name + ': \\u20B9' + d.value.toLocaleString('en-IN')}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="50%" y="47%" textAnchor="middle" fontSize="12" fill="#64748b">Total</text>
      <text x="50%" y="58%" textAnchor="middle" fontSize="18" fontWeight="700">{'\\u20B9' + (total / 100000).toFixed(1) + 'L'}</text>
    </svg>
  );
}

function App() {
  const data = useMemo(() => topN(raw, 4), []);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <section className="card">
      <h3>Sales share by category</h3>
      <div className="row">
        <Donut data={data} />
        <ul>
          {data.map((d, i) => (
            <li key={d.name}><i style={{ background: COLORS[i] }} />{d.name}<b>{((d.value / total) * 100).toFixed(1)}%</b></li>
          ))}
        </ul>
      </div>
    </section>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fdf2f8; margin: 0; padding: 20px; }
.card { background: #fff; border-radius: 12px; padding: 16px; max-width: 520px; margin: auto; }
h3 { margin: 0 0 8px; }
.row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
ul { list-style: none; padding: 0; margin: 0; min-width: 180px; }
li { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 14px; }
li b { margin-left: auto; }
li i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }`,
      },
      result:
        'A donut with 5 coloured segments (Smartphones largest, then Laptops, Fashion, Groceries and grey Others), ₹23.7L total in the centre, and a legend with percentages. Hovering a segment shows a native tooltip with the rupee value.',
      explanation:
        'Plain-SVG version of the Recharts donut. Each segment is the same circle drawn with a dash of length (share x circumference) and shifted by the running offset; rotate(-90) starts at 12 o\'clock. Grouping small categories into "Others" keeps the chart readable, the most common dashboard best practice for pie charts.',
    },
    {
      title: 'Admin analytics dashboard from a real API',
      scenario:
        'Build the first version of an admin dashboard for a store using dummyjson.com: KPI cards from all carts, inventory value per category, and top-rated products, with loading and error states.',
      steps: [
        'Fetch https://dummyjson.com/carts?limit=0 and https://dummyjson.com/products?limit=0 in parallel with Promise.all',
        'Show a skeleton while loading and a retry button on error',
        'Compute KPIs (revenue, orders, items sold, avg order value) with reduce inside useMemo',
        'Aggregate inventory value (price x stock) per category, top 6, and draw a horizontal bar chart',
        'List the 5 best-rated products',
        'Arrange everything with CSS Grid so it stacks on mobile',
      ],
      code: `// src/features/dashboard/api/dashboardApi.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDashboardData = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [carts, products] = await Promise.all([
        api.get('/carts', { params: { limit: 0 } }),
        api.get('/products', { params: { limit: 0, select: 'title,price,category,stock,rating' } }),
      ]);
      return { carts: carts.data.carts, products: products.data.products };
    },
    staleTime: 5 * 60 * 1000,
  });

// src/features/dashboard/DashboardPage.jsx
import { lazy, Suspense, useMemo } from 'react';
import { useDashboardData } from './api/dashboardApi';
import KpiCard from './components/KpiCard';
import { summarise, inventoryByCategory } from './utils/aggregate';
const CategoryBarChart = lazy(() => import('./components/CategoryBarChart')); // Recharts loaded lazily

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboardData();
  const kpis = useMemo(() => data && summarise(data.carts), [data]);
  const byCategory = useMemo(() => data && inventoryByCategory(data.products), [data]);

  if (isPending) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  return (
    <main className="dashboard">
      <section className="kpis">
        <KpiCard label="Revenue" value={kpis.revenue} format="currency" />
        <KpiCard label="Orders" value={kpis.orders} />
      </section>
      <Suspense fallback={<div className="chart-skeleton" />}>
        <CategoryBarChart data={byCategory} />
      </Suspense>
    </main>
  );
}`,
      playground: {
        jsx: `const { useEffect, useMemo, useState } = React;

const USD_TO_INR = 83;   // dummyjson prices are in USD; convert for an Indian dashboard
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

function useDashboardData() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading', data: null, error: null });
    Promise.all([
      fetch('https://dummyjson.com/carts?limit=0', { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error('Carts ' + r.status); return r.json(); }),
      fetch('https://dummyjson.com/products?limit=0&select=title,price,category,stock,rating', { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error('Products ' + r.status); return r.json(); }),
    ])
      .then(([c, p]) => setState({ status: 'success', data: { carts: c.carts, products: p.products }, error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', data: null, error: err.message }); });
    return () => ctrl.abort();
  }, [reload]);
  return { ...state, retry: () => setReload(n => n + 1) };
}

function summarise(carts) {
  const revenue = carts.reduce((s, c) => s + c.discountedTotal, 0) * USD_TO_INR;
  const items = carts.reduce((s, c) => s + c.totalQuantity, 0);
  return { revenue, orders: carts.length, items, aov: revenue / carts.length };
}
function inventoryByCategory(products) {
  const totals = {};
  products.forEach(p => { totals[p.category] = (totals[p.category] || 0) + p.price * p.stock * USD_TO_INR; });
  return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
}

function Kpi({ label, value }) {
  return <article className="kpi"><h4>{label}</h4><p>{value}</p></article>;
}

function HBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div role="img" aria-label={'Top category: ' + data[0].name}>
      {data.map(d => (
        <div className="hbar" key={d.name}>
          <span className="label">{d.name}</span>
          <div className="track"><div className="fill" style={{ width: (d.value / max) * 100 + '%' }} /></div>
          <span className="val">{'\\u20B9' + compact.format(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="dash">
      <div className="kpis">{[1, 2, 3, 4].map(i => <div key={i} className="kpi sk" />)}</div>
      <div className="grid2"><div className="card sk tall" /><div className="card sk tall" /></div>
    </div>
  );
}

function App() {
  const { status, data, error, retry } = useDashboardData();
  const kpis = useMemo(() => data && summarise(data.carts), [data]);
  const byCategory = useMemo(() => data && inventoryByCategory(data.products), [data]);
  const topRated = useMemo(() => data && [...data.products].sort((a, b) => b.rating - a.rating).slice(0, 5), [data]);

  if (status === 'loading') return <Skeleton />;
  if (status === 'error') return (
    <div className="card err"><p>Could not load dashboard: {error}</p><button onClick={retry}>Retry</button></div>
  );
  return (
    <div className="dash">
      <h2>Store analytics</h2>
      <section className="kpis">
        <Kpi label="Revenue (all carts)" value={inr.format(kpis.revenue)} />
        <Kpi label="Orders" value={kpis.orders.toLocaleString('en-IN')} />
        <Kpi label="Items sold" value={kpis.items.toLocaleString('en-IN')} />
        <Kpi label="Avg order value" value={inr.format(kpis.aov)} />
      </section>
      <div className="grid2">
        <section className="card">
          <h3>Inventory value by category (top 6)</h3>
          <HBarChart data={byCategory} />
        </section>
        <section className="card">
          <h3>Top rated products</h3>
          <ol>
            {topRated.map(p => (
              <li key={p.id}><span>{p.title}</span><b>{p.rating.toFixed(2)}</b></li>
            ))}
          </ol>
        </section>
      </div>
      <button className="ghost" onClick={retry}>Refresh</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; padding: 16px; }
.dash { max-width: 900px; margin: auto; display: grid; gap: 14px; }
h2 { margin: 0; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.kpi { background: #fff; border-radius: 12px; padding: 14px; min-height: 60px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.kpi h4 { margin: 0; font-size: 12px; color: #64748b; font-weight: 500; }
.kpi p { margin: 6px 0 0; font-size: 20px; font-weight: 700; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.card h3 { margin: 0 0 12px; font-size: 15px; }
.hbar { display: grid; grid-template-columns: 110px 1fr 70px; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
.label { text-transform: capitalize; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track { background: #e2e8f0; border-radius: 6px; height: 14px; overflow: hidden; }
.fill { background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 100%; border-radius: 6px; transition: width .6s; }
.val { text-align: right; font-variant-numeric: tabular-nums; }
ol { margin: 0; padding-left: 18px; }
li { display: flex; justify-content: space-between; gap: 8px; padding: 5px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
.sk { background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%); background-size: 200% 100%; animation: sh 1.2s infinite; }
.tall { height: 220px; }
@keyframes sh { to { background-position: -200% 0; } }
.err { max-width: 400px; margin: 40px auto; text-align: center; }
button { padding: 8px 14px; border: 0; border-radius: 8px; background: #6366f1; color: #fff; cursor: pointer; }
.ghost { justify-self: start; background: #fff; color: #6366f1; border: 1px solid #c7d2fe; }`,
      },
      result:
        'A shimmering skeleton first, then 4 KPI cards (revenue in rupees from 200+ carts, order count, items sold, average order value), a horizontal bar chart of inventory value for the top 6 categories, and the 5 highest-rated products. Turning off the network shows the error card with Retry.',
      explanation:
        'Plain-React version of a TanStack Query + Recharts dashboard. Both requests run in parallel with Promise.all and are cancelled with AbortController on unmount. All aggregation lives in pure functions (summarise, inventoryByCategory) wrapped in useMemo, which are easy to unit test and could later move to the backend. The horizontal bar chart is CSS widths, a perfectly valid lightweight chart when you only need comparison bars.',
    },
  ],
  interview: [
    {
      q: 'Which chart would you use to show daily revenue for the last 30 days, and which for sales by category?',
      a: 'Daily revenue is a time series, so a line or area chart. Sales by category is a comparison between discrete groups, so a bar chart (sorted, horizontal if labels are long). A pie/donut is only suitable for share of total with few (2-6) slices.',
      level: 'Easy',
    },
    {
      q: 'Recharts vs Chart.js: how do you decide?',
      a: 'Recharts is React-first and declarative (components like <LineChart><Line/></LineChart>), renders SVG, and is easy to customise with React; it can slow down with many thousands of points. Chart.js (via react-chartjs-2) is config-object based, renders on canvas, handles large datasets better, and requires registering components in v4. Choose by team familiarity, data size, customisation needs and bundle size.',
      level: 'Medium',
    },
    {
      q: 'Why does a Recharts ResponsiveContainer sometimes render nothing?',
      a: 'ResponsiveContainer takes 100% of its parent. If the parent has no height (for example a flex child without a set height, or height: auto with only the chart inside and height="100%"), the computed height is 0 so nothing appears. Give it a fixed height prop (height={300}) or give the parent an explicit height.',
      level: 'Medium',
    },
    {
      q: 'What does "category is not a registered scale" mean in Chart.js?',
      a: 'Chart.js v4 is tree-shakable, so scales, elements and plugins must be registered explicitly: ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend). Forgetting CategoryScale for a bar/line chart with string labels triggers that error. Alternatively import "chart.js/auto" which registers everything (bigger bundle).',
      level: 'Medium',
    },
    {
      q: 'How do you format numbers in Indian style in a React chart?',
      a: 'Use Intl.NumberFormat("en-IN"): with style "currency" and currency "INR" it gives ₹12,34,567; with notation "compact" it gives 12L / 1.2Cr style short values for axis ticks. Pass these formatters to tickFormatter and Tooltip formatter in Recharts, or to options.scales.y.ticks.callback in Chart.js. Keep raw numbers in the data.',
      level: 'Easy',
    },
    {
      q: 'Where should data aggregation for a dashboard happen: frontend or backend?',
      a: 'For small datasets, the frontend can aggregate with reduce inside useMemo. For large or sensitive data, aggregate on the backend (SQL GROUP BY, an /analytics endpoint, materialised views) so the browser downloads a few summary rows instead of thousands of records. It is faster, cheaper, and does not expose raw data.',
      level: 'Medium',
    },
    {
      q: 'How do you make charts accessible?',
      a: 'Add a visible title, role="img" with an aria-label summarising the insight, do not rely on colour alone (labels, patterns, values), ensure sufficient contrast, make interactive elements focusable with keyboard tooltips, and provide a data table alternative or "view as table" toggle.',
      level: 'Medium',
    },
    {
      q: 'Your dashboard re-renders slowly when hovering a chart. What would you check?',
      a: 'Check whether data and options objects or expensive aggregations are recreated on each render (wrap in useMemo), whether the parent state (tooltip/hover) re-renders all charts (move state down or memoise chart components with React.memo), whether there are too many SVG points (downsample or switch to canvas), and lazy-load chart libraries to reduce initial work. Use the React Profiler to confirm.',
      level: 'Hard',
    },
    {
      q: 'What should a KPI card contain?',
      a: 'A clear label, the main value formatted for the audience, the comparison period and change (with direction indicated by both colour and an icon/text), and optionally a sparkline. It should handle loading and missing previous values, and support metrics where lower is better (refunds, delivery time).',
      level: 'Easy',
    },
    {
      q: 'How would you structure a dashboard feature in a React codebase?',
      a: 'A feature folder with DashboardPage, components (KpiCard, charts), api (TanStack Query hooks per widget), and utils (pure aggregation and formatting functions with unit tests). Each widget handles its own loading/error state, chart libraries are lazy-loaded, filters like date range live in URL search params so the view is shareable.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Add a date-range filter (7, 30, 90 days) to a revenue line chart. Store the selected range in the URL (?range=30) so the link is shareable.',
      hint: 'useSearchParams from react-router; filter the data array by date.',
      solution: `import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const RANGES = [7, 30, 90];

export default function RevenueTrend({ daily }) {   // daily: [{ date: '2025-10-01', revenue }]
  const [params, setParams] = useSearchParams();
  const range = Number(params.get('range')) || 30;

  const data = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - range);
    return daily.filter(d => new Date(d.date) >= from);
  }, [daily, range]);

  return (
    <section className="card">
      <div role="group" aria-label="Date range">
        {RANGES.map(r => (
          <button key={r} aria-pressed={r === range} onClick={() => setParams({ range: String(r) })}>
            {r} days
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={v => '₹' + (v / 1000) + 'k'} />
          <Tooltip />
          <Line dataKey="revenue" stroke="#4f46e5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}`,
    },
    {
      task: 'Write a plain-React Sparkline component (an SVG polyline, 100x30) and add it to each KPI card.',
      hint: 'Map values to points "x,y" with x = i * step and y = height - (v - min) / (max - min) * height.',
      solution: `function Sparkline({ values, width = 100, height = 30, color = '#6366f1' }) {
  const min = Math.min(...values), max = Math.max(...values);
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => (i * step).toFixed(1) + ',' + (height - ((v - min) / (max - min || 1)) * height).toFixed(1))
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function KpiCard({ label, value, history }) {
  return (
    <article className="kpi">
      <h3>{label}</h3>
      <p className="value">{value}</p>
      <Sparkline values={history} />
    </article>
  );
}

function App() {
  return <KpiCard label="Orders" value="4,210" history={[320, 340, 310, 380, 420, 410, 450]} />;
}`,
    },
    {
      task: 'Using react-chartjs-2, build a stacked bar chart of monthly orders split into "Prepaid" and "COD" with Indian number formatting in tooltips.',
      hint: 'options.scales.x.stacked and y.stacked = true; plugins.tooltip.callbacks.label.',
      solution: `import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const labels = ['Jul', 'Aug', 'Sep', 'Oct'];
const data = {
  labels,
  datasets: [
    { label: 'Prepaid', data: [2100, 2350, 2600, 2900], backgroundColor: '#2563eb' },
    { label: 'COD', data: [1500, 1420, 1380, 1310], backgroundColor: '#f59e0b' },
  ],
};
const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { x: { stacked: true }, y: { stacked: true } },
  plugins: {
    tooltip: {
      callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('en-IN') + ' orders' },
    },
  },
};

export default function OrdersStacked() {
  return <div style={{ height: 300 }}><Bar data={data} options={options} /></div>;
}`,
    },
    {
      task: 'Add a "View as table" toggle under the city bar chart that shows the same data in an accessible table.',
      hint: 'Keep one data array and render either the chart or a <table> with <caption> and <th scope>.',
      solution: `const { useState } = React;
const data = [
  { city: 'Mumbai', orders: 1240 }, { city: 'Delhi', orders: 1100 }, { city: 'Pune', orders: 640 },
];

function CityOrders() {
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(...data.map(d => d.orders));
  return (
    <section>
      <button aria-pressed={asTable} onClick={() => setAsTable(t => !t)}>
        {asTable ? 'View as chart' : 'View as table'}
      </button>
      {asTable ? (
        <table>
          <caption>Orders by city, October</caption>
          <thead><tr><th scope="col">City</th><th scope="col">Orders</th></tr></thead>
          <tbody>{data.map(d => <tr key={d.city}><th scope="row">{d.city}</th><td>{d.orders.toLocaleString('en-IN')}</td></tr>)}</tbody>
        </table>
      ) : (
        <div role="img" aria-label="Mumbai has the most orders">
          {data.map(d => (
            <div key={d.city} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 70 }}>{d.city}</span>
              <div style={{ width: (d.orders / max) * 200, height: 14, background: '#6366f1' }} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function App() { return <CityOrders />; }`,
    },
    {
      task: 'Write and unit-test (Vitest) a pure function groupByMonth(orders) that returns [{ month: "2025-10", revenue }] sorted by month.',
      hint: 'Use order.createdAt.slice(0, 7) as the key.',
      solution: `// utils/groupByMonth.js
export function groupByMonth(orders) {
  const map = {};
  for (const o of orders) {
    const key = o.createdAt.slice(0, 7);
    map[key] = (map[key] || 0) + o.amount;
  }
  return Object.entries(map)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// utils/groupByMonth.test.js
import { describe, it, expect } from 'vitest';
import { groupByMonth } from './groupByMonth';

describe('groupByMonth', () => {
  it('sums revenue per month and sorts', () => {
    const orders = [
      { createdAt: '2025-10-03T10:00:00Z', amount: 500 },
      { createdAt: '2025-09-28T10:00:00Z', amount: 200 },
      { createdAt: '2025-10-15T10:00:00Z', amount: 300 },
    ];
    expect(groupByMonth(orders)).toEqual([
      { month: '2025-09', revenue: 200 },
      { month: '2025-10', revenue: 800 },
    ]);
  });
  it('returns [] for no orders', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});`,
    },
  ],
  quiz: [
    {
      question: 'Which chart is best for showing the trend of daily active users over 3 months?',
      options: ['Pie chart', 'Line chart', 'Donut chart', 'Radar chart'],
      answer: 1,
      explanation: 'Line charts show change over time.',
    },
    {
      question: 'In Recharts, which prop tells a <Bar> or <Line> which property of each data object to plot?',
      options: ['value', 'field', 'dataKey', 'key'],
      answer: 2,
      explanation: 'dataKey selects the property from each object in the data array.',
    },
    {
      question: 'What must you do in Chart.js v4 before using a Bar chart with react-chartjs-2?',
      options: ['Register the needed scales, elements and plugins with ChartJS.register', 'Wrap the app in <ChartProvider>', 'Call createRoot for the canvas', 'Nothing, everything is automatic'],
      answer: 0,
      explanation: 'Chart.js v4 is tree-shakable; components must be registered (or import chart.js/auto).',
    },
    {
      question: 'new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(1234567) returns:',
      options: ['₹1,234,567', 'INR 1234567', '₹12.3L', '₹12,34,567'],
      answer: 3,
      explanation: 'The en-IN locale uses lakh grouping: 12,34,567.',
    },
    {
      question: 'Why wrap dashboard aggregation (reduce over thousands of rows) in useMemo?',
      options: ['To make it run on the server', 'To avoid recalculating on every render, such as tooltip hover updates', 'Because reduce does not work without it', 'To cache data in localStorage'],
      answer: 1,
      explanation: 'useMemo recomputes only when its dependencies (the data) change.',
    },
  ],
};
