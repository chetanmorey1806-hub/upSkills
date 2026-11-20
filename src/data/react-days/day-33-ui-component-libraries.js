export default {
  id: 'day-33-ui-component-libraries',
  title: 'UI Component Libraries: Material UI, shadcn/ui and Ant Design (Setup, Theming, Common Components, Choosing One)',
  module: 'Module 7: Industry Project Setup & UI',
  day: 33,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Companies rarely build every button, dialog and table from scratch. Learn the three most used React UI libraries: Material UI (MUI 6), shadcn/ui and Ant Design 5: how to install them, theme them with your brand, use their common components, and how to choose the right one for a project.',
  objectives: [
    'Explain what a component library gives you: accessibility, consistency, speed and a theme system',
    'Set up MUI 6 with ThemeProvider, createTheme, CssBaseline and the sx prop',
    'Add shadcn/ui components to a Tailwind project and customise the copied source code',
    'Use Ant Design 5 Table, Form and ConfigProvider theme tokens for admin panels',
    'Choose between MUI, shadcn/ui, Ant Design or a custom kit based on project needs',
  ],
  theory: [
    {
      heading: 'Why teams use a component library',
      content:
        'A "simple" dropdown needs keyboard navigation, focus management, screen-reader labels, positioning near screen edges, closing on Escape and outside click, and mobile behaviour. Building and testing all of that for 40 components takes months.\n\nA **component library** gives you:\n- **Ready, tested components**: Button, TextField, Select, Dialog, Table, DatePicker, Tabs, Snackbar\n- **Accessibility** (ARIA roles, focus traps) handled for you\n- A **theme system**: change the primary colour, font and border radius once, and every component follows\n- **Consistency** between developers and screens, and faster delivery\n\nCosts: bundle size, learning the library\'s API, and sometimes fighting its default look when the designer wants something very different.\n\nAnalogy: buying furniture from IKEA versus hiring a carpenter. IKEA (a library) is quick and reliable; a carpenter (custom components) fits your exact design but takes much longer. shadcn/ui is like getting the carpenter\'s drawings: you build from proven designs but you own the result.',
    },
    {
      heading: 'Material UI (MUI 6): setup, theme and sx',
      content:
        '**MUI** implements Google\'s Material Design and is one of the most downloaded React libraries. Used widely in enterprise dashboards and in many Indian service companies.\n\n**Install**: `npm install @mui/material @emotion/react @emotion/styled` (+ `@mui/icons-material` for icons).\n\n**Key ideas**\n- `createTheme({ palette, typography, shape })` defines your brand; `<ThemeProvider theme={theme}>` passes it down (Context under the hood)\n- `<CssBaseline />` normalises browser styles\n- The **`sx` prop** is styling with theme access: `sx={{ p: 2, mt: 1, bgcolor: \'primary.main\', borderRadius: 2 }}` (spacing units are 8px)\n- Layout helpers: `Box`, `Stack`, `Container`, `Grid2`\n- Common components: `Button` (variant contained / outlined / text), `TextField`, `Select`, `Card`, `Dialog`, `Snackbar`, `AppBar`, `Drawer`, `Tabs`, and `DataGrid` from `@mui/x-data-grid`\n- MUI 6 supports dark mode with `colorSchemes: { dark: true }` and CSS variables',
      syntax:
        "import { createTheme, ThemeProvider, CssBaseline, Button, TextField, Stack } from '@mui/material';\n\nconst theme = createTheme({\n  palette: { primary: { main: '#4f46e5' }, secondary: { main: '#ff9933' } },\n  shape: { borderRadius: 10 },\n  typography: { fontFamily: 'Inter, sans-serif', button: { textTransform: 'none' } },\n});\n\nexport default function App() {\n  return (\n    <ThemeProvider theme={theme}>\n      <CssBaseline />\n      <Stack spacing={2} sx={{ p: 3, maxWidth: 360 }}>\n        <TextField label=\"Email\" type=\"email\" fullWidth />\n        <Button variant=\"contained\">Login</Button>\n      </Stack>\n    </ThemeProvider>\n  );\n}",
      tip: 'Import from the package root (`@mui/material`) is fine with Vite: unused components are tree-shaken. Override component defaults for the whole app in the theme (`components: { MuiButton: { defaultProps: { disableElevation: true } } }`) instead of repeating props everywhere.',
    },
    {
      heading: 'shadcn/ui: copy the code, own the code',
      content:
        '**shadcn/ui** is not an npm dependency you import from. It is a **CLI that copies component source code into your project** (`src/components/ui/button.jsx`). The components are built on **Radix UI** primitives (accessible behaviour) and **Tailwind CSS** (styling), with **cva** for variants and the `cn()` helper you met on Day 32.\n\n**Setup** (in a Vite + Tailwind 4 project with the `@/` alias from Day 31):\n1. `npx shadcn@latest init` creates `components.json`, `lib/utils.js` (cn) and CSS variables for the theme\n2. `npx shadcn@latest add button dialog input card` copies those components\n3. `import { Button } from \'@/components/ui/button\'`\n\n**Theming** is done with CSS variables (`--primary`, `--radius`, `--background`) in your CSS file, and dark mode uses the `.dark` class.\n\n**Why it became so popular (2023-2025)**: full control (edit any component), no version lock-in, modern look, small bundle (you ship only what you add). Many startups and Next.js projects use it.\n\n**Downside**: you maintain the copied code; updates are not automatic.',
      syntax:
        "npx shadcn@latest init\nnpx shadcn@latest add button dialog\n\nimport { Button } from '@/components/ui/button';\nimport { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';\n\n<Dialog>\n  <DialogTrigger asChild><Button variant=\"destructive\">Delete product</Button></DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Delete product?</DialogTitle>\n      <DialogDescription>This cannot be undone.</DialogDescription>\n    </DialogHeader>\n    <DialogFooter><Button variant=\"outline\">Cancel</Button><Button variant=\"destructive\">Delete</Button></DialogFooter>\n  </DialogContent>\n</Dialog>",
    },
    {
      heading: 'Ant Design 5: the admin-panel favourite',
      content:
        '**Ant Design (antd)** comes from Ant Group (Alibaba) and is designed for **data-heavy enterprise and admin apps**: very powerful `Table` (sorting, filtering, pagination, row selection, fixed columns), `Form` with built-in validation, `DatePicker`, `Upload`, `Tree`, `Steps`, `Descriptions`, `message` and `notification`.\n\n**Install**: `npm install antd` (CSS-in-JS: no CSS file import needed in v5). For React 19 also install and import `@ant-design/v5-patch-for-react-19` once in `main.jsx`.\n\n**Theming** uses **design tokens** in `ConfigProvider`: `theme={{ token: { colorPrimary: \'#4f46e5\', borderRadius: 8 } }}`; dark mode with `algorithm: theme.darkAlgorithm`.\n\n**Table API style**: you describe `columns` (title, dataIndex, render, sorter) and pass `dataSource` (each row needs a unique `key`). This configuration style is fast for CRUD screens.',
      syntax:
        "import { ConfigProvider, Table, Tag, Button } from 'antd';\n\nconst columns = [\n  { title: 'Order', dataIndex: 'id', key: 'id' },\n  { title: 'Customer', dataIndex: 'name', key: 'name' },\n  { title: 'Amount', dataIndex: 'amount', key: 'amount', sorter: (a, b) => a.amount - b.amount, render: v => '₹' + v.toLocaleString('en-IN') },\n  { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'Paid' ? 'green' : 'orange'}>{s}</Tag> },\n];\n\n<ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 8 } }}>\n  <Table columns={columns} dataSource={orders} rowKey=\"id\" pagination={{ pageSize: 5 }} />\n</ConfigProvider>",
    },
    {
      heading: 'Which one should you choose?',
      content:
        '- **MUI**: you want a complete, mature, well-documented kit with Material look; enterprise apps; teams without a dedicated designer; need DataGrid/DatePickers (MUI X). Heavier bundle, Material look is recognisable unless themed.\n- **shadcn/ui**: you already use Tailwind, want a modern custom look, full control and small bundle; designers give custom Figma designs; Next.js / startup products.\n- **Ant Design**: internal tools, admin panels, ERP/CRM, lots of tables and forms; you value features over custom looks.\n- **Others**: Chakra UI, Mantine (feature-rich, great DX), Headless UI / Radix (behaviour only, you style), React-Bootstrap (legacy projects).\n- **Custom kit** (Day 32): when the brand is very unique and the team has time, often built on Radix/Headless primitives.\n\n**Golden rule**: pick **one** main library per project. Mixing MUI and antd doubles the bundle, gives two different looks and two theme systems.',
      points: [
        'Check: React 19 support, TypeScript types, accessibility, documentation, licence (MUI X Pro / Premium are paid), bundle size',
        'Wrap library components in your own thin components (AppButton, AppTable) in big projects, so switching or upgrading is easier',
        'Theme once at the top; avoid inline overrides scattered over 100 files',
      ],
      tip: 'Interview favourite: "Why shadcn/ui instead of MUI?" Answer with trade-offs (ownership and Tailwind vs. ready-made breadth and maturity), not with "it is trendy". Coming next (Day 34): building the dashboard layout that holds these components.',
    },
  ],
  examples: [
    {
      title: 'MUI-style theming: one theme object controls every component',
      scenario: 'A login card for "ShopKart Seller Hub". The brand team keeps changing the primary colour and corner radius; with a theme you change it in one place. Try it live.',
      steps: [
        'npm install @mui/material @emotion/react @emotion/styled',
        'Create src/app/theme.js with createTheme({ palette, shape, typography })',
        'Wrap the app in <ThemeProvider theme={theme}> and add <CssBaseline />',
        'Build the form with Stack, TextField and Button variants',
        'Run the playground: a plain-React mini ThemeProvider imitates MUI; change colour and radius',
      ],
      code: `// src/app/theme.js
import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: { primary: { main: '#4f46e5' } },
  shape: { borderRadius: 10 },
  typography: { button: { textTransform: 'none', fontWeight: 600 } },
});

// src/features/auth/components/SellerLogin.jsx
import { Card, CardContent, Typography, Stack, TextField, Button } from '@mui/material';

export function SellerLogin() {
  return (
    <Card sx={{ maxWidth: 380, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Seller Hub login</Typography>
        <Stack spacing={2}>
          <TextField label="Mobile number" inputMode="numeric" fullWidth />
          <TextField label="Password" type="password" fullWidth />
          <Button variant="contained" size="large">Login</Button>
          <Button variant="outlined">Login with OTP</Button>
          <Button variant="text">Forgot password?</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// main.jsx
<ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>`,
      playground: {
        jsx: `// ----- mini "MUI" (plain React learning version) -----
const ThemeContext = React.createContext(null);
function createTheme({ primary = '#1976d2', radius = 4 }) {
  return { palette: { primary: { main: primary } }, shape: { borderRadius: radius }, spacing: n => n * 8 + 'px' };
}
const ThemeProvider = ({ theme, children }) => <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
const useTheme = () => React.useContext(ThemeContext);

function Button({ variant = 'text', children, ...props }) {
  const t = useTheme();
  const main = t.palette.primary.main;
  const styles = {
    contained: { background: main, color: '#fff', border: '1px solid ' + main },
    outlined: { background: 'transparent', color: main, border: '1px solid ' + main },
    text: { background: 'transparent', color: main, border: '1px solid transparent' },
  };
  return (
    <button {...props} style={{ ...styles[variant], borderRadius: t.shape.borderRadius, padding: t.spacing(1) + ' ' + t.spacing(2), font: '600 14px system-ui', cursor: 'pointer' }}>
      {children}
    </button>
  );
}
function TextField({ label, type = 'text' }) {
  const t = useTheme();
  const id = React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={id} style={{ fontSize: 12, color: '#555' }}>{label}</label>
      <input id={id} type={type} style={{ padding: t.spacing(1.25), borderRadius: t.shape.borderRadius, border: '1px solid #bbb', outlineColor: t.palette.primary.main }} />
    </div>
  );
}
function Card({ children }) {
  const t = useTheme();
  return <div style={{ maxWidth: 360, padding: t.spacing(3), borderRadius: t.shape.borderRadius, boxShadow: '0 2px 8px rgba(0,0,0,.15)', background: '#fff' }}>{children}</div>;
}
// ----- app -----
function SellerLogin() {
  return (
    <Card>
      <h2 style={{ margin: '0 0 16px', fontFamily: 'system-ui' }}>Seller Hub login</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField label="Mobile number" />
        <TextField label="Password" type="password" />
        <Button variant="contained">Login</Button>
        <Button variant="outlined">Login with OTP</Button>
        <Button variant="text">Forgot password?</Button>
      </div>
    </Card>
  );
}

function App() {
  const [primary, setPrimary] = React.useState('#4f46e5');
  const [radius, setRadius] = React.useState(10);
  const theme = React.useMemo(() => createTheme({ primary, radius }), [primary, radius]);
  return (
    <div style={{ fontFamily: 'system-ui', background: '#f5f5f5', padding: 16, minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <label>Primary <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} /></label>
        <label>Radius {radius}px <input type="range" min="0" max="24" value={radius} onChange={e => setRadius(Number(e.target.value))} /></label>
      </div>
      <ThemeProvider theme={theme}><SellerLogin /></ThemeProvider>
    </div>
  );
}`,
      },
      result: 'A login card with two inputs and contained, outlined and text buttons. Changing the colour picker recolours all three buttons and the input focus outline; the slider changes the corner radius of the card, inputs and buttons together.',
      explanation:
        'This is exactly how MUI theming works: createTheme builds an object, ThemeProvider places it in Context, and every component reads it (useTheme) instead of hard-coding colours. The playground is a plain-React imitation because @mui/material cannot be imported here; the real MUI code is shown in `code`.',
    },
    {
      title: 'shadcn/ui-style Button variants and a confirm Dialog',
      scenario: 'In the products admin, "Delete" opens a dialog asking for confirmation. Build it the shadcn way: a Button with cva-style variants and a Dialog component that you own.',
      steps: [
        'npx shadcn@latest init (choose a base colour; it creates components.json and lib/utils.js)',
        'npx shadcn@latest add button dialog',
        'Import Button and Dialog parts from @/components/ui/...',
        'Customise the copied button.jsx if needed (e.g. add a "success" variant)',
        'Run the playground: a tiny cva() and a Dialog made with plain React and inline styles behave like the real ones',
      ],
      code: `// src/components/ui/button.jsx (copied by the CLI, simplified)
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border bg-background hover:bg-accent',
        ghost: 'hover:bg-accent',
      },
      size: { default: 'h-9 px-4 py-2', sm: 'h-8 px-3', lg: 'h-10 px-6' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

// DeleteProductButton.jsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

export function DeleteProductButton({ product, onDelete }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="destructive" size="sm">Delete</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{product.title}"?</DialogTitle>
          <DialogDescription>This product will be removed from your store.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button variant="destructive" onClick={() => onDelete(product.id)}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,
      playground: {
        jsx: `// tiny cva(): returns a function that picks variant styles (real cva returns class strings)
function cva(base, { variants, defaultVariants }) {
  return (opts = {}) => {
    const out = { ...base };
    Object.keys(variants).forEach(name => Object.assign(out, variants[name][opts[name] ?? defaultVariants[name]]));
    return out;
  };
}
const buttonVariants = cva(
  { borderRadius: 6, font: '500 14px system-ui', cursor: 'pointer', border: '1px solid transparent' },
  {
    variants: {
      variant: {
        default: { background: '#18181b', color: '#fff' },
        destructive: { background: '#dc2626', color: '#fff' },
        outline: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7' },
      },
      size: { default: { padding: '8px 16px' }, sm: { padding: '4px 10px', fontSize: 13 } },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
function Button({ variant, size, style, ...props }) {
  return <button style={{ ...buttonVariants({ variant, size }), ...style }} {...props} />;
}

function Dialog({ open, onOpenChange, title, description, children }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onOpenChange(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div onClick={() => onOpenChange(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 10, padding: 20, width: 'min(92vw, 380px)', fontFamily: 'system-ui' }}>
        <h3 id="dlg-title" style={{ margin: 0 }}>{title}</h3>
        <p style={{ color: '#71717a', fontSize: 14 }}>{description}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = React.useState([
    { id: 1, title: 'Redmi Note 13', price: 17999 },
    { id: 2, title: 'boAt Airdopes 141', price: 1299 },
    { id: 3, title: 'Prestige Induction Cooktop', price: 2399 },
  ]);
  const [toDelete, setToDelete] = React.useState(null);
  function confirmDelete() {
    setProducts(list => list.filter(p => p.id !== toDelete.id));
    console.log('deleted', toDelete.title);
    setToDelete(null);
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h3>Products</h3>
      {products.length === 0 && <p>No products left.</p>}
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span>{p.title}, {'₹' + p.price.toLocaleString('en-IN')}</span>
          <Button variant="destructive" size="sm" onClick={() => setToDelete(p)}>Delete</Button>
        </div>
      ))}
      <Dialog open={!!toDelete} onOpenChange={o => { if (!o) setToDelete(null); }}
        title={toDelete ? 'Delete "' + toDelete.title + '"?' : ''} description="This product will be removed from your store.">
        <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
        <Button variant="destructive" onClick={confirmDelete} autoFocus>Delete</Button>
      </Dialog>
    </div>
  );
}`,
      },
      result: 'Three products with red "Delete" buttons. Clicking one opens a dark overlay with a dialog. Cancel, clicking outside or pressing Escape closes it; Delete removes the product and logs "deleted <title>".',
      explanation:
        'cva maps variant names to styles, so callers write variant="destructive" instead of repeating styles. Real shadcn/ui gets dialog behaviour (focus trap, Escape, aria attributes, portal) from Radix UI and styles from Tailwind classes; because the code is copied into your project you can change any part, which the playground imitates with plain React.',
    },
    {
      title: 'Ant Design-style data Table with columns config, sorting and pagination',
      scenario: 'An orders screen for an admin panel: columns are described as configuration, Amount is sortable, Status is rendered as a coloured tag, and the table shows 4 rows per page.',
      steps: [
        'npm install antd (plus @ant-design/v5-patch-for-react-19 for React 19)',
        'Define columns: title, dataIndex, key, sorter, render',
        'Pass dataSource and rowKey="id" to <Table>',
        'Wrap the app in <ConfigProvider theme={{ token: { colorPrimary } }}>',
        'Run the playground: a mini Table component reads the same columns config',
      ],
      code: `// main.jsx (React 19)
import '@ant-design/v5-patch-for-react-19';

// OrdersTable.jsx
import { ConfigProvider, Table, Tag } from 'antd';

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Customer', dataIndex: 'name', key: 'name' },
  { title: 'City', dataIndex: 'city', key: 'city' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount',
    sorter: (a, b) => a.amount - b.amount,
    render: v => '₹' + v.toLocaleString('en-IN') },
  { title: 'Status', dataIndex: 'status', key: 'status',
    render: s => <Tag color={s === 'Paid' ? 'green' : s === 'Pending' ? 'orange' : 'red'}>{s}</Tag> },
];

export function OrdersTable({ orders }) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 8 } }}>
      <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 4 }} />
    </ConfigProvider>
  );
}`,
      playground: {
        jsx: `// mini Table that understands an antd-like columns config
function Table({ columns, dataSource, rowKey, pagination }) {
  const [sort, setSort] = React.useState({ key: null, order: null }); // order: 'ascend' | 'descend' | null
  const [page, setPage] = React.useState(1);
  const col = columns.find(c => c.key === sort.key);
  const rows = React.useMemo(() => {
    if (!col || !sort.order) return dataSource;
    const sorted = [...dataSource].sort(col.sorter);
    return sort.order === 'descend' ? sorted.reverse() : sorted;
  }, [dataSource, col, sort.order]);
  const size = pagination.pageSize;
  const pages = Math.ceil(rows.length / size);
  const visible = rows.slice((page - 1) * size, page * size);

  function toggleSort(key) {
    setSort(s => s.key !== key ? { key, order: 'ascend' } : s.order === 'ascend' ? { key, order: 'descend' } : { key: null, order: null });
  }
  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: 'left', background: '#fafafa', padding: 10, borderBottom: '1px solid #f0f0f0' }}
                aria-sort={sort.key === c.key ? (sort.order === 'ascend' ? 'ascending' : 'descending') : undefined}>
                {c.sorter
                  ? <button onClick={() => toggleSort(c.key)} style={{ border: 0, background: 'none', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                      {c.title} {sort.key === c.key ? (sort.order === 'ascend' ? '▲' : '▼') : '⇅'}
                    </button>
                  : c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map(row => (
            <tr key={row[rowKey]}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: 10, borderBottom: '1px solid #f0f0f0' }}>
                  {c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 10 }}>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => setPage(n)} aria-current={n === page ? 'page' : undefined}
            style={{ minWidth: 30, padding: 4, borderRadius: 6, border: '1px solid ' + (n === page ? '#4f46e5' : '#d9d9d9'), color: n === page ? '#4f46e5' : '#333', background: '#fff' }}>{n}</button>
        ))}
      </div>
    </div>
  );
}
const TAG = { Paid: ['#f6ffed', '#389e0d'], Pending: ['#fff7e6', '#d46b08'], Refunded: ['#fff1f0', '#cf1322'] };
const Tag = ({ children }) => <span style={{ background: TAG[children][0], color: TAG[children][1], padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{children}</span>;

const columns = [
  { title: 'Order ID', dataIndex: 'id', key: 'id' },
  { title: 'Customer', dataIndex: 'name', key: 'name' },
  { title: 'City', dataIndex: 'city', key: 'city' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', sorter: (a, b) => a.amount - b.amount, render: v => '₹' + v.toLocaleString('en-IN') },
  { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag>{s}</Tag> },
];
const orders = [
  { id: 'OD-501', name: 'Rahul Verma', city: 'Delhi', amount: 2499, status: 'Paid' },
  { id: 'OD-502', name: 'Sneha Patil', city: 'Mumbai', amount: 18999, status: 'Pending' },
  { id: 'OD-503', name: 'Karthik R', city: 'Chennai', amount: 799, status: 'Refunded' },
  { id: 'OD-504', name: 'Ayesha Khan', city: 'Hyderabad', amount: 5600, status: 'Paid' },
  { id: 'OD-505', name: 'Manpreet Singh', city: 'Chandigarh', amount: 12450, status: 'Paid' },
  { id: 'OD-506', name: 'Divya Nair', city: 'Kochi', amount: 3299, status: 'Pending' },
];

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Orders</h3>
      <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 4 }} />
    </div>
  );
}`,
      },
      result: 'A table with 4 orders on page 1 and 2 on page 2. Clicking "Amount" sorts ascending (▲), again descending (▼), and a third time removes the sort. Status shows green Paid, orange Pending and red Refunded tags; amounts are formatted as ₹18,999.',
      explanation:
        'Ant Design\'s Table is configuration-driven: columns describe what to show and how (render, sorter), and the Table handles sorting state and pagination. The playground re-implements a small part of that behaviour in plain React to show the idea; with antd you get filters, row selection, fixed headers and more for free.',
    },
    {
      title: 'Decision helper: which UI library fits this project?',
      scenario: 'Your manager asks which UI library to use for a new project. Answer a few questions and get a recommendation with reasons, the same way you would justify it in a design review or interview.',
      steps: [
        'List project needs: Tailwind or not, custom design or not, data-heavy admin or customer-facing',
        'Score each library against the needs',
        'Pick one main library and write down why (and what you give up)',
        'Run the playground and try different combinations',
      ],
      code: `// A typical "tech decision" note in the project README (ADR = Architecture Decision Record)
## ADR-003: UI component library
Status: Accepted
Context: Internal warehouse admin (Pune + Bhiwandi), 30+ CRUD screens, many tables and forms,
         no dedicated designer, team knows React but not Tailwind.
Decision: Ant Design 5 with ConfigProvider theme tokens (brand colour #4f46e5).
Consequences:
  + Table, Form, DatePicker, Upload ready; fast delivery
  - Bigger bundle; custom looks are harder; React 19 needs the v5 patch package
Alternatives considered: MUI 6 (also good, MUI X DataGrid Pro is paid), shadcn/ui (needs Tailwind skills).`,
      playground: {
        jsx: `const LIBS = {
  'MUI 6': { why: 'Complete, mature kit with Material design, great docs, DataGrid and DatePickers (MUI X).', score: 0 },
  'shadcn/ui': { why: 'Tailwind + Radix, you own the code, modern custom look, tiny bundle.', score: 0 },
  'Ant Design 5': { why: 'Best-in-class Table and Form for data-heavy admin panels and internal tools.', score: 0 },
};
const QUESTIONS = [
  { id: 'tailwind', text: 'The team already uses Tailwind CSS', yes: { 'shadcn/ui': 3 }, no: { 'MUI 6': 1, 'Ant Design 5': 1 } },
  { id: 'custom', text: 'Designers provide a unique custom brand design', yes: { 'shadcn/ui': 2, 'MUI 6': 1 }, no: { 'Ant Design 5': 1, 'MUI 6': 1 } },
  { id: 'admin', text: 'Mostly an admin panel with many tables and forms', yes: { 'Ant Design 5': 3, 'MUI 6': 2 }, no: { 'shadcn/ui': 1 } },
  { id: 'material', text: 'Client likes Google Material look', yes: { 'MUI 6': 3 }, no: {} },
  { id: 'bundle', text: 'Bundle size is critical (mobile users on slow 4G)', yes: { 'shadcn/ui': 2 }, no: {} },
];

function App() {
  const [answers, setAnswers] = React.useState({ tailwind: false, custom: false, admin: true, material: false, bundle: false });
  const scores = {};
  Object.keys(LIBS).forEach(k => { scores[k] = 0; });
  QUESTIONS.forEach(q => {
    const add = answers[q.id] ? q.yes : q.no;
    Object.entries(add).forEach(([lib, pts]) => { scores[lib] += pts; });
  });
  const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const max = Math.max(...Object.values(scores), 1);
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 520, padding: 8 }}>
      <fieldset style={{ border: '1px solid #ddd', borderRadius: 8 }}>
        <legend>Project needs</legend>
        {QUESTIONS.map(q => (
          <label key={q.id} style={{ display: 'block', margin: '6px 0' }}>
            <input type="checkbox" checked={answers[q.id]} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.checked }))} /> {q.text}
          </label>
        ))}
      </fieldset>
      <h3>Recommendation: {ranked[0]}</h3>
      <p>{LIBS[ranked[0]].why}</p>
      {ranked.map(lib => (
        <div key={lib} style={{ margin: '6px 0' }}>
          <div style={{ fontSize: 13 }}>{lib}: {scores[lib]} pts</div>
          <div style={{ height: 10, background: '#eee', borderRadius: 5 }}>
            <div style={{ width: (scores[lib] / max) * 100 + '%', height: '100%', background: lib === ranked[0] ? '#4f46e5' : '#a5b4fc', borderRadius: 5 }} />
          </div>
        </div>
      ))}
    </div>
  );
}`,
      },
      result: 'With the default answers (admin panel only) Ant Design 5 wins, with MUI close behind. Ticking "uses Tailwind" and "bundle size is critical" while unticking admin makes shadcn/ui the recommendation; ticking "Material look" pushes MUI up.',
      explanation:
        'The scoring is deliberately simple, but it mirrors a real decision: libraries are tools with trade-offs. Writing the decision and its consequences in an ADR helps future team members understand why the project looks and works the way it does.',
    },
  ],
  interview: [
    { q: 'Why use a UI component library instead of building components yourself?', a: 'It provides accessible, tested components (dialogs, menus, tables, date pickers) with a theme system, so teams deliver faster and more consistently. Building these correctly (keyboard, focus, ARIA, edge positioning) is expensive. Trade-offs: bundle size, API learning, and customisation limits.', level: 'Easy' },
    { q: 'How does theming work in MUI?', a: 'You create a theme object with createTheme (palette, typography, spacing, shape, component overrides) and provide it with ThemeProvider. Components read it via context; the sx prop and styled() can access theme values like primary.main or spacing units.', level: 'Medium' },
    { q: 'What is the sx prop in MUI?', a: 'A prop on MUI components for one-off styles with theme awareness: shorthand spacing (p, m, mt), theme colours (bgcolor: "primary.main"), responsive values ({ xs: 1, md: 3 }) and nested selectors. It is compiled by Emotion into CSS classes.', level: 'Medium' },
    { q: 'How is shadcn/ui different from MUI or Ant Design?', a: 'shadcn/ui is not installed as a dependency; its CLI copies component source code into your project. Components are built on Radix UI primitives and Tailwind CSS, so you fully own and modify them. MUI/antd are versioned packages you configure through props and themes.', level: 'Medium' },
    { q: 'What is Radix UI and why does shadcn/ui use it?', a: 'Radix provides unstyled, accessible primitives (Dialog, Dropdown, Popover, Tabs) handling focus management, keyboard interaction, ARIA and portals. shadcn/ui adds Tailwind styles on top, so it gets correct behaviour without writing that logic.', level: 'Hard' },
    { q: 'How do you theme Ant Design 5?', a: 'Wrap the app in ConfigProvider with theme={{ token: { colorPrimary, borderRadius, fontFamily } }}, optionally component-level tokens (components: { Button: {...} }) and algorithm: theme.darkAlgorithm for dark mode. antd 5 uses CSS-in-JS with design tokens instead of Less variables.', level: 'Medium' },
    { q: 'When would you choose Ant Design over MUI?', a: 'For data-heavy enterprise/admin apps needing powerful Table, Form, Tree, Upload and DatePicker out of the box, where a business-tool look is acceptable. MUI fits when you want Material design, wide community, or MUI X components, and is often easier to make look "consumer-friendly".', level: 'Medium' },
    { q: 'Is it OK to use two UI libraries in one project?', a: 'Generally no: it increases bundle size, gives an inconsistent look, and you maintain two theme systems. Exceptions: using a headless library (Radix) inside a styled kit, or a specialised component (a chart or a date picker) that the main library lacks.', level: 'Easy' },
    { q: 'How do you keep a project independent of a UI library?', a: 'Wrap library components in your own thin components (AppButton, DataTable, ConfirmDialog) with a stable props API, centralise the theme, and avoid using library-specific props deep in business components. Migrating or upgrading then touches only the wrappers.', level: 'Hard' },
    { q: 'What accessibility features should a good Dialog provide?', a: 'role="dialog" and aria-modal, a label (aria-labelledby), focus moved into the dialog and trapped there, Escape to close, focus returned to the trigger on close, background inert/not scrollable. Libraries like MUI, Radix/shadcn and antd handle these.', level: 'Hard' },
    { q: 'What is the role of CssBaseline in MUI?', a: 'It applies a consistent CSS reset/normalisation (box-sizing, margins, body background and typography from the theme) so components look the same across browsers, and enables dark mode background colours.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'With MUI, build a "Add product" form inside a Dialog: TextFields for name and price (₹), a Select for category, and Save/Cancel buttons. Theme primary #0f766e and borderRadius 8.',
      hint: 'Dialog, DialogTitle, DialogContent, DialogActions, TextField select, MenuItem.',
      solution: `import { useState } from 'react';
import { createTheme, ThemeProvider, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, InputAdornment } from '@mui/material';

const theme = createTheme({ palette: { primary: { main: '#0f766e' } }, shape: { borderRadius: 8 } });
const CATEGORIES = ['Mobiles', 'Laptops', 'Audio', 'Home'];

export default function AddProduct() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'Mobiles' });
  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  function save() { console.log('save', form); setOpen(false); }
  return (
    <ThemeProvider theme={theme}>
      <Button variant="contained" onClick={() => setOpen(true)}>Add product</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="name" label="Name" value={form.name} onChange={update} required />
            <TextField name="price" label="Price" type="number" value={form.price} onChange={update}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
            <TextField name="category" label="Category" select value={form.category} onChange={update}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!form.name || !form.price}>Save</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}`,
    },
    {
      task: 'Add a "success" variant (green) to the shadcn/ui button.jsx in your project and use it for a "Mark as delivered" button.',
      hint: 'Edit the variants object inside buttonVariants (cva). You own the file.',
      solution: `// src/components/ui/button.jsx
const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium ...', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
      outline: 'border bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      success: 'bg-green-600 text-white hover:bg-green-700',      // NEW
    },
    size: { default: 'h-9 px-4 py-2', sm: 'h-8 px-3', lg: 'h-10 px-6' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

// usage
<Button variant="success" onClick={() => markDelivered(order.id)}>Mark as delivered</Button>`,
    },
    {
      task: 'Using Ant Design, build a customers Table with columns Name, City (with filters for Mumbai, Delhi, Bengaluru), Total spent (sortable, ₹ format) and an Action column with a Popconfirm delete button.',
      hint: 'filters + onFilter on the City column; Popconfirm wraps a Button.',
      solution: `import { useState } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';

const initial = [
  { id: 1, name: 'Ravi Kumar', city: 'Mumbai', spent: 15400 },
  { id: 2, name: 'Pooja Shah', city: 'Delhi', spent: 8200 },
  { id: 3, name: 'Imran Ali', city: 'Bengaluru', spent: 23100 },
];

export function CustomersTable() {
  const [data, setData] = useState(initial);
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'City', dataIndex: 'city', key: 'city',
      filters: ['Mumbai', 'Delhi', 'Bengaluru'].map(c => ({ text: c, value: c })),
      onFilter: (value, record) => record.city === value },
    { title: 'Total spent', dataIndex: 'spent', key: 'spent',
      sorter: (a, b) => a.spent - b.spent, render: v => '₹' + v.toLocaleString('en-IN') },
    { title: 'Action', key: 'action', render: (_, record) => (
      <Popconfirm title={'Delete ' + record.name + '?'} onConfirm={() => {
        setData(d => d.filter(r => r.id !== record.id));
        message.success('Customer deleted');
      }}>
        <Button danger size="small">Delete</Button>
      </Popconfirm>
    ) },
  ];
  return <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />;
}`,
    },
    {
      task: 'Write an AppButton wrapper around MUI Button that exposes only variant="primary" | "secondary" | "danger" and a loading prop, so feature code never imports @mui/material directly.',
      hint: 'Map your variants to MUI variant + color; use CircularProgress for loading.',
      solution: `// src/components/ui/AppButton.jsx
import { Button, CircularProgress } from '@mui/material';

const MAP = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
};

export function AppButton({ variant = 'primary', loading = false, children, disabled, ...props }) {
  return (
    <Button {...MAP[variant]} disabled={disabled || loading} aria-busy={loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : props.startIcon} {...props}>
      {children}
    </Button>
  );
}

// feature code
import { AppButton } from '@/components/ui/AppButton';
<AppButton variant="danger" loading={isDeleting} onClick={remove}>Delete</AppButton>
// If the team moves from MUI to shadcn/ui later, only AppButton.jsx changes.`,
    },
  ],
  quiz: [
    {
      question: 'What does `npx shadcn@latest add button` do?',
      options: ['Installs a shadcn npm package you import from', 'Copies the Button component source code into your project', 'Adds a CDN script tag', 'Generates a Material UI theme'],
      answer: 1,
      explanation: 'shadcn/ui copies the code into your project (src/components/ui), so you own it.',
    },
    {
      question: 'In MUI, which component makes the theme available to all components?',
      options: ['CssBaseline', 'Box', 'ThemeProvider', 'StyledEngineProvider'],
      answer: 2,
      explanation: 'ThemeProvider places the theme object (from createTheme) into context.',
    },
    {
      question: 'How do you change the primary colour in Ant Design 5?',
      options: ['ConfigProvider theme={{ token: { colorPrimary: "#4f46e5" } }}', 'Edit antd.css', 'Pass color to every Button', 'Use createTheme from @mui/material'],
      answer: 0,
      explanation: 'antd 5 uses design tokens in ConfigProvider.',
    },
    {
      question: 'Which library is the best fit for an internal admin panel with 30 data tables and complex forms, and no designer?',
      options: ['React Native Paper', 'Bootstrap 3', 'Framer Motion', 'Ant Design'],
      answer: 3,
      explanation: 'Ant Design is built for data-heavy enterprise UIs (MUI would also be reasonable).',
    },
    {
      question: 'Why should you avoid mixing MUI and Ant Design in one app?',
      options: ['They cannot both run in React', 'It increases bundle size and creates inconsistent looks and two theme systems', 'Vite does not support two libraries', 'They use different JSX syntax'],
      answer: 1,
      explanation: 'Both work technically, but cost and consistency suffer.',
    },
  ],
};
