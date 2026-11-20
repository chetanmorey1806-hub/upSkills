export default {
  id: 'day-46-data-tables-tanstack-table',
  title: 'Data Tables: Sorting, Filtering, Pagination and Row Selection with TanStack Table',
  module: 'Module 10: Advanced Industry Topics',
  day: 46,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Admin panels are mostly tables: orders, users, products, invoices. TanStack Table v8 is a "headless" table engine that gives you sorting, filtering, pagination and row selection logic while you keep full control of the markup and styling. You will build client-side and server-side tables, add bulk actions with selected rows, and learn the accessibility and performance rules companies follow.',
  objectives: [
    'Explain what a headless table library is and why TanStack Table is the industry default',
    'Define columns with createColumnHelper (accessor, header, cell) and render them with flexRender',
    'Add sorting, global and column filters, and pagination with the row model functions',
    'Implement row selection with an indeterminate "select all" checkbox and bulk actions',
    'Switch to server-side (manual) pagination, sorting and search using an API',
  ],
  theory: [
    {
      heading: 'Why tables need a library, and what "headless" means',
      content:
        'A simple `<table>` with `map()` is fine for 10 rows. Real admin tables need: click-to-sort columns, a search box, per-column filters, pagination with page size, row selection with "select all", bulk delete/export, column visibility, and sometimes server-side data with 1 lakh rows. Writing all that by hand for every table is slow and buggy.\n\n**TanStack Table** (`npm install @tanstack/react-table`, v8) is a **headless** library: it manages the **state and logic** (which rows, in which order, which page, which are selected) and gives you plain data back. **You** write the `<table>`, `<tr>`, `<td>` and the CSS (Tailwind, MUI, your design system).\n\nAnalogy: a headless table is like a car engine and gearbox delivered without a body. You build any body you want (sports car, SUV), and the engine still works the same.\n\nAlternatives: **MUI DataGrid** and **AG Grid** are "batteries-included" grids with their own UI (great for Excel-like grids, editing, huge datasets; advanced features are paid). TanStack Table is free, tiny and fits any design system.',
      points: [
        'Headless = logic only, you own the markup and styling',
        'Same core works for React, Vue, Solid, Svelte',
        'Works with client-side data or server-side (manual) data',
      ],
    },
    {
      heading: 'Columns, useReactTable and flexRender',
      content:
        'Three building blocks:\n\n1. **data**: an array of row objects. It must be **stable** (state, useMemo or from TanStack Query); creating a new array on every render causes infinite re-renders.\n2. **columns**: definitions made with `createColumnHelper()`. `columnHelper.accessor(\'email\', { header: \'Email\', cell: info => info.getValue() })` reads a field; `columnHelper.display({ id: \'actions\', cell: ... })` is a column with no data (checkbox, buttons).\n3. **useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })** returns a `table` instance.\n\nRendering: `table.getHeaderGroups()` gives header rows; `table.getRowModel().rows` gives the rows to show; each row has `row.getVisibleCells()`. Because `header` and `cell` can be strings **or** functions/components, you render them with `flexRender(def, context)`.',
      syntax:
        "import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';\n\nconst columnHelper = createColumnHelper();\nconst columns = [\n  columnHelper.accessor('name', { header: 'Customer' }),\n  columnHelper.accessor('city', { header: 'City' }),\n  columnHelper.accessor('amount', {\n    header: 'Amount',\n    cell: info => '₹' + info.getValue().toLocaleString('en-IN'),\n  }),\n];\n\nfunction OrdersTable({ data }) {\n  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });\n  return (\n    <table>\n      <thead>\n        {table.getHeaderGroups().map(hg => (\n          <tr key={hg.id}>\n            {hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}\n          </tr>\n        ))}\n      </thead>\n      <tbody>\n        {table.getRowModel().rows.map(row => (\n          <tr key={row.id}>\n            {row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}",
      tip: 'Define columns OUTSIDE the component (or in useMemo). A new columns array on every render resets internal state and hurts performance.',
    },
    {
      heading: 'Sorting and filtering',
      content:
        'Features are added by passing **row model** functions and (optionally) controlling the state:\n\n- **Sorting**: `getSortedRowModel()`, state `sorting` (array like `[{ id: \'amount\', desc: true }]`). In the header call `header.column.getToggleSortingHandler()` on click and show `header.column.getIsSorted()` (`\'asc\' | \'desc\' | false`). Shift+click gives multi-column sorting.\n- **Global filter** (one search box): `getFilteredRowModel()` plus state `globalFilter`.\n- **Column filters** (status dropdown, city filter): state `columnFilters` and `column.setFilterValue(value)`; use `filterFn: \'equals\'` or a custom function.\n\n"Controlled state" means you keep it in `useState` and pass `state: { sorting }` + `onSortingChange: setSorting`. You do this when you need the state elsewhere: saving it in the URL (Day 38), sending it to the API, or showing "sorted by".',
      syntax:
        "const [sorting, setSorting] = useState([]);\nconst [globalFilter, setGlobalFilter] = useState('');\n\nconst table = useReactTable({\n  data, columns,\n  state: { sorting, globalFilter },\n  onSortingChange: setSorting,\n  onGlobalFilterChange: setGlobalFilter,\n  getCoreRowModel: getCoreRowModel(),\n  getSortedRowModel: getSortedRowModel(),\n  getFilteredRowModel: getFilteredRowModel(),\n});\n\n<th onClick={header.column.getToggleSortingHandler()}\n    aria-sort={{ asc: 'ascending', desc: 'descending' }[header.column.getIsSorted()] ?? 'none'}>\n  {flexRender(header.column.columnDef.header, header.getContext())}\n  {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? ''}\n</th>",
    },
    {
      heading: 'Pagination and row selection',
      content:
        '**Pagination**: add `getPaginationRowModel()`. State `pagination` is `{ pageIndex, pageSize }`. Useful API: `table.nextPage()`, `previousPage()`, `firstPage()`, `lastPage()`, `getCanNextPage()`, `getCanPreviousPage()`, `getPageCount()`, `setPageSize(20)`.\n\n**Row selection**: state `rowSelection` is an object `{ [rowId]: true }`. Add a `display` column with checkboxes:\n- Header: `table.getIsAllPageRowsSelected()`, `getIsSomePageRowsSelected()` (for the **indeterminate** state), `getToggleAllPageRowsSelectedHandler()`\n- Cell: `row.getIsSelected()`, `row.getToggleSelectedHandler()`, `row.getCanSelect()`\n- Get selected data: `table.getSelectedRowModel().rows.map(r => r.original)`\n\nSet `getRowId: row => row.id` so selection uses your real database IDs instead of array indexes; otherwise selection breaks when data is re-sorted on the server or refetched.',
      tip: 'The HTML checkbox "indeterminate" state cannot be set with an attribute. Use a ref: useEffect(() => { ref.current.indeterminate = someSelected && !allSelected }).',
    },
    {
      heading: 'Server-side tables (manual mode)',
      content:
        'With 50,000 orders you cannot download everything. The server does the sorting, filtering and paging; the table only displays the current page. Set:\n\n- `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`\n- `rowCount` (total rows from the API) so the table knows the page count\n- Controlled `pagination`, `sorting`, `globalFilter` state, and use them in the **query key**: `useQuery({ queryKey: [\'users\', pagination, sorting, search], queryFn, placeholderData: keepPreviousData })`\n\nUX rules from real products: keep the previous page visible while loading (`keepPreviousData`), debounce the search box (Day 38), reset to page 1 when filters change, and put the table state in the URL so a support agent can share "page 3 sorted by amount".',
      syntax:
        "const table = useReactTable({\n  data: query.data?.users ?? [],\n  columns,\n  rowCount: query.data?.total ?? 0,\n  state: { pagination, sorting },\n  onPaginationChange: setPagination,\n  onSortingChange: setSorting,\n  manualPagination: true,\n  manualSorting: true,\n  getCoreRowModel: getCoreRowModel(),\n});",
    },
    {
      heading: 'Accessibility, performance and the playground note',
      content:
        'Accessibility checklist:\n- Use real `<table>`, `<thead>`, `<th scope="col">`, `<caption>` (or aria-label)\n- Sortable headers: put a `<button>` inside the `<th>` (keyboard focusable) and set `aria-sort` on the `<th>`\n- Checkboxes need `aria-label` ("Select row Priya Sharma")\n- Announce result counts ("Showing 11-20 of 208")\n- On mobile, allow horizontal scroll (`overflow-x: auto` wrapper) or switch to cards\n\nPerformance: memoise data and columns; paginate or **virtualise** (Day 39, `@tanstack/react-virtual`) for thousands of rows; do heavy work on the server.\n\nThe playground cannot import @tanstack/react-table, so the examples use a **small plain-React `useTable` hook** that mimics its API (accessor columns, sorting, filtering, pagination, selection). The `code` blocks contain the real TanStack Table code.',
    },
  ],
  examples: [
    {
      title: 'Orders table with column definitions and custom cells',
      scenario:
        'An Indian D2C brand shows recent orders: order ID, customer, city, amount in rupees and a coloured status badge. Columns are defined once and rendered generically.',
      steps: [
        'npm install @tanstack/react-table',
        'Create src/features/orders/columns.jsx with createColumnHelper and accessor columns',
        'Give the amount and status columns custom cell renderers',
        'Create OrdersTable.jsx with useReactTable and getCoreRowModel',
        'Render header groups and rows with flexRender',
        'Run the playground (mini useTable with the same ideas)',
      ],
      code: `// src/features/orders/columns.jsx
import { createColumnHelper } from '@tanstack/react-table';
const columnHelper = createColumnHelper();
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const columns = [
  columnHelper.accessor('id', { header: 'Order #' }),
  columnHelper.accessor('customer', { header: 'Customer' }),
  columnHelper.accessor('city', { header: 'City' }),
  columnHelper.accessor('amount', { header: 'Amount', cell: info => inr.format(info.getValue()) }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => <span className={'badge badge-' + info.getValue()}>{info.getValue()}</span>,
  }),
];

// src/features/orders/OrdersTable.jsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { columns } from './columns';

export default function OrdersTable({ data }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: r => r.id });
  return (
    <div className="table-wrap">
      <table>
        <caption>Recent orders</caption>
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id} scope="col">{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
      playground: {
        jsx: `// ---------- mini TanStack-like helpers (learning version) ----------
const columnHelper = {
  accessor: (key, def) => ({ id: key, accessorKey: key, ...def }),
  display: def => ({ ...def }),
};
function flexRender(renderer, ctx) {
  if (renderer === undefined) return ctx.getValue ? String(ctx.getValue()) : null;
  return typeof renderer === 'function' ? renderer(ctx) : renderer;
}
function useTable({ data, columns }) {
  return {
    headers: columns.map(c => ({ id: c.id, column: c })),
    rows: data.map(row => ({
      id: row.id,
      original: row,
      cells: columns.map(c => ({ id: row.id + '_' + c.id, column: c, getValue: () => row[c.accessorKey], row })),
    })),
  };
}

// ---------- the app ----------
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const orders = [
  { id: 'ORD-1042', customer: 'Priya Sharma', city: 'Pune', amount: 2499, status: 'delivered' },
  { id: 'ORD-1043', customer: 'Rahul Verma', city: 'Delhi', amount: 899, status: 'shipped' },
  { id: 'ORD-1044', customer: 'Ananya Iyer', city: 'Chennai', amount: 15999, status: 'pending' },
  { id: 'ORD-1045', customer: 'Mohammed Khan', city: 'Hyderabad', amount: 4250, status: 'cancelled' },
  { id: 'ORD-1046', customer: 'Sneha Patil', city: 'Mumbai', amount: 1299, status: 'delivered' },
];
const columns = [
  columnHelper.accessor('id', { header: 'Order #' }),
  columnHelper.accessor('customer', { header: 'Customer' }),
  columnHelper.accessor('city', { header: 'City' }),
  columnHelper.accessor('amount', { header: 'Amount', cell: info => inr.format(info.getValue()) }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => <span className={'badge ' + info.getValue()}>{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: 'actions', header: '',
    cell: ({ row }) => <button onClick={() => console.log('Open', row.id)}>View</button>,
  }),
];

function App() {
  const table = useTable({ data: orders, columns });
  return (
    <div className="table-wrap">
      <table>
        <caption>Recent orders</caption>
        <thead>
          <tr>{table.headers.map(h => <th key={h.id} scope="col">{flexRender(h.column.header, {})}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row.id}>
              {row.cells.map(cell => <td key={cell.id}>{flexRender(cell.column.cell, cell)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 16px; }
.table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
table { width: 100%; border-collapse: collapse; min-width: 560px; }
caption { text-align: left; padding: 12px 14px; font-weight: 700; font-size: 17px; }
th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
th { background: #f8fafc; color: #475569; font-weight: 600; }
tbody tr:hover { background: #f8fafc; }
.badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; text-transform: capitalize; }
.delivered { background: #dcfce7; color: #166534; } .shipped { background: #dbeafe; color: #1e40af; }
.pending { background: #fef9c3; color: #854d0e; } .cancelled { background: #fee2e2; color: #991b1b; }
button { padding: 4px 10px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; cursor: pointer; }`,
      },
      result:
        'A white card with a "Recent orders" table: five rows, amounts like ₹15,999.00, coloured status pills and a View button that logs the order ID. On a narrow screen the table scrolls horizontally.',
      explanation:
        'Plain-React version of TanStack Table\'s core: columns describe WHAT to show (accessor key, header, optional cell renderer); the hook turns data + columns into header and cell objects; flexRender calls the renderer if it is a function or prints it if it is a string, falling back to the raw value. The real library works the same way, which is why your JSX stays generic and every column\'s formatting lives in one place.',
    },
    {
      title: 'Sorting (asc / desc / none) and a global search filter',
      scenario: 'Support staff need to find a customer quickly and sort orders by amount or date.',
      steps: [
        'Add getSortedRowModel and getFilteredRowModel to useReactTable',
        'Control sorting and globalFilter with useState',
        'Make each header a <button> calling column.getToggleSortingHandler()',
        'Set aria-sort on <th> and show an arrow for the sort direction',
        'Add a search input bound to globalFilter and show "N results"',
      ],
      code: `import { useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender,
} from '@tanstack/react-table';

export default function SortableOrders({ data, columns }) {
  const [sorting, setSorting] = useState([{ id: 'amount', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Search orders..." />
      <p>{table.getRowModel().rows.length} results</p>
      <table>
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => {
                const dir = h.column.getIsSorted();
                return (
                  <th key={h.id} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}>
                    {h.column.getCanSort() ? (
                      <button onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {dir === 'asc' ? ' ▲' : dir === 'desc' ? ' ▼' : ' ⇅'}
                      </button>
                    ) : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {/* tbody same as before */}
      </table>
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useMemo } = React;

function useTable({ data, columns, sorting, globalFilter }) {
  return useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    let rows = q ? data.filter(r => columns.some(c => c.key && String(r[c.key]).toLowerCase().includes(q))) : data;
    if (sorting.length) {
      const { id, desc } = sorting[0];
      rows = [...rows].sort((a, b) => {
        const x = a[id], y = b[id];
        const cmp = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
        return desc ? -cmp : cmp;
      });
    }
    return rows;
  }, [data, columns, sorting, globalFilter]);
}

// cycle like TanStack: none -> asc -> desc -> none (numbers start with desc)
function nextSorting(current, col) {
  const cur = current[0] && current[0].id === col.key ? current[0] : null;
  const firstDesc = col.type === 'number';
  if (!cur) return [{ id: col.key, desc: firstDesc }];
  if (cur.desc === firstDesc) return [{ id: col.key, desc: !firstDesc }];
  return [];
}

const inr = n => '\\u20B9' + n.toLocaleString('en-IN');
const data = [
  { id: 1, customer: 'Priya Sharma', city: 'Pune', amount: 2499, date: '2025-10-02' },
  { id: 2, customer: 'Rahul Verma', city: 'Delhi', amount: 899, date: '2025-10-05' },
  { id: 3, customer: 'Ananya Iyer', city: 'Chennai', amount: 15999, date: '2025-09-28' },
  { id: 4, customer: 'Mohammed Khan', city: 'Hyderabad', amount: 4250, date: '2025-10-07' },
  { id: 5, customer: 'Sneha Patil', city: 'Mumbai', amount: 1299, date: '2025-10-01' },
  { id: 6, customer: 'Arjun Reddy', city: 'Bengaluru', amount: 7800, date: '2025-09-30' },
  { id: 7, customer: 'Kavya Nair', city: 'Kochi', amount: 560, date: '2025-10-06' },
];
const columns = [
  { key: 'customer', header: 'Customer' },
  { key: 'city', header: 'City' },
  { key: 'date', header: 'Date' },
  { key: 'amount', header: 'Amount', type: 'number', cell: v => inr(v) },
];

function App() {
  const [sorting, setSorting] = useState([{ id: 'amount', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const rows = useTable({ data, columns, sorting, globalFilter });

  return (
    <div className="card">
      <div className="toolbar">
        <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Search name or city..." aria-label="Search orders" />
        <span aria-live="polite">{rows.length} of {data.length} orders</span>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map(col => {
              const s = sorting[0] && sorting[0].id === col.key ? sorting[0] : null;
              return (
                <th key={col.key} aria-sort={s ? (s.desc ? 'descending' : 'ascending') : 'none'}>
                  <button onClick={() => setSorting(cur => nextSorting(cur, col))}>
                    {col.header} <span className="arrow">{s ? (s.desc ? '\\u25BC' : '\\u25B2') : '\\u21C5'}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>{columns.map(c => <td key={c.key}>{c.cell ? c.cell(r[c.key]) : r[c.key]}</td>)}</tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={columns.length} className="empty">No orders match "{globalFilter}"</td></tr>}
        </tbody>
      </table>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f0fdf4; margin: 0; padding: 16px; }
.card { background: #fff; border-radius: 12px; padding: 14px; max-width: 640px; margin: auto; overflow-x: auto; }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #475569; }
input { padding: 8px 10px; border: 1px solid #bbf7d0; border-radius: 8px; flex: 1; max-width: 260px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; background: #f0fdf4; }
th button { all: unset; cursor: pointer; padding: 10px; display: block; font-weight: 600; }
th button:focus-visible { outline: 2px solid #16a34a; }
.arrow { color: #16a34a; font-size: 11px; }
td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.empty { text-align: center; color: #64748b; padding: 20px; }`,
      },
      result:
        'Orders appear sorted by amount (highest ₹15,999 first, ▼ on Amount). Clicking Customer sorts A-Z, again Z-A, a third time removes sorting. Typing "pu" leaves Priya (Pune) and shows "1 of 7 orders"; a search with no match shows an empty-state row.',
      explanation:
        'Plain-React version of getSortedRowModel + getFilteredRowModel: filter first, then sort, all inside useMemo so it reruns only when inputs change. The sort cycle mirrors TanStack (numbers default to descending first, a third click clears). Headers are buttons for keyboard users and aria-sort tells screen readers the current order; aria-live announces the result count.',
    },
    {
      title: 'Pagination with page size and row selection with bulk actions',
      scenario:
        'Admins manage 23 products. They page through 5 at a time, select several (even across pages) and mark them "Out of stock" or delete them in bulk.',
      steps: [
        'Add getPaginationRowModel and a controlled pagination state { pageIndex, pageSize }',
        'Add a display column "select" with header and cell checkboxes',
        'Use an IndeterminateCheckbox component with a ref for the header',
        'Store rowSelection keyed by product ID (getRowId)',
        'Show a bulk-action bar when at least one row is selected',
        'Run the playground and select rows on different pages',
      ],
      code: `import { useEffect, useRef, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper, flexRender } from '@tanstack/react-table';

function IndeterminateCheckbox({ indeterminate, ...rest }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.indeterminate = !rest.checked && indeterminate; }, [indeterminate, rest.checked]);
  return <input type="checkbox" ref={ref} {...rest} />;
}

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        aria-label="Select all on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input type="checkbox" aria-label={'Select ' + row.original.title}
        checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
    ),
  }),
  columnHelper.accessor('title', { header: 'Product' }),
  columnHelper.accessor('stock', { header: 'Stock' }),
];

export default function ProductsTable({ data, onBulkDelete }) {
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const table = useReactTable({
    data, columns,
    getRowId: row => String(row.id),
    state: { rowSelection, pagination },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const selected = table.getSelectedRowModel().rows.map(r => r.original);

  return (
    <>
      {selected.length > 0 && (
        <div role="region" aria-label="Bulk actions">
          {selected.length} selected
          <button onClick={() => { onBulkDelete(selected.map(p => p.id)); setRowSelection({}); }}>Delete</button>
        </div>
      )}
      {/* table markup */}
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</button>
      <span>Page {pagination.pageIndex + 1} of {table.getPageCount()}</span>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
      <select value={pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))}>
        {[5, 10, 20].map(n => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </>
  );
}`,
      playground: {
        jsx: `const { useEffect, useRef, useState } = React;

const names = ['Basmati Rice 5kg', 'Toor Dal 1kg', 'Amul Butter 500g', 'Tata Tea Gold', 'Aashirvaad Atta 10kg', 'Haldiram Bhujia',
  'Parle-G Family Pack', 'Maggi 12 Pack', 'Fortune Oil 1L', 'MDH Garam Masala', 'Britannia Bread', 'Mother Dairy Paneer',
  'Saffola Oats', 'Kissan Jam', 'Dabur Honey', 'Real Juice 1L', 'Surf Excel 1kg', 'Colgate 200g', 'Dettol Soap x4',
  'Lizol 1L', 'Vim Bar', 'Good Day Biscuits', 'Bournvita 500g'];
const initial = names.map((title, i) => ({ id: 101 + i, title, stock: (i * 37) % 90, price: 40 + ((i * 53) % 460) }));

function IndeterminateCheckbox({ indeterminate, checked, ...rest }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.indeterminate = !checked && indeterminate; }, [indeterminate, checked]);
  return <input type="checkbox" ref={ref} checked={checked} {...rest} />;
}

function App() {
  const [products, setProducts] = useState(initial);
  const [rowSelection, setRowSelection] = useState({});            // { [id]: true }
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const pageCount = Math.max(1, Math.ceil(products.length / pagination.pageSize));
  const pageIndex = Math.min(pagination.pageIndex, pageCount - 1);
  const start = pageIndex * pagination.pageSize;
  const pageRows = products.slice(start, start + pagination.pageSize);

  const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]).map(Number);
  const allPageSelected = pageRows.length > 0 && pageRows.every(r => rowSelection[r.id]);
  const somePageSelected = pageRows.some(r => rowSelection[r.id]);

  const toggleRow = id => setRowSelection(s => ({ ...s, [id]: !s[id] }));
  const toggleAllPage = () => setRowSelection(s => {
    const next = { ...s };
    pageRows.forEach(r => { next[r.id] = !allPageSelected; });
    return next;
  });
  const bulkDelete = () => { setProducts(ps => ps.filter(p => !rowSelection[p.id])); setRowSelection({}); };
  const bulkOutOfStock = () => { setProducts(ps => ps.map(p => (rowSelection[p.id] ? { ...p, stock: 0 } : p))); setRowSelection({}); };

  return (
    <div className="card">
      <h3>Products ({products.length})</h3>
      {selectedIds.length > 0 && (
        <div className="bulk" role="region" aria-label="Bulk actions">
          <b>{selectedIds.length} selected</b>
          <button onClick={bulkOutOfStock}>Mark out of stock</button>
          <button className="danger" onClick={bulkDelete}>Delete</button>
          <button className="link" onClick={() => setRowSelection({})}>Clear</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th><IndeterminateCheckbox aria-label="Select all on this page" checked={allPageSelected} indeterminate={somePageSelected} onChange={toggleAllPage} /></th>
            <th>ID</th><th>Product</th><th>Price</th><th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map(p => (
            <tr key={p.id} className={rowSelection[p.id] ? 'sel' : ''}>
              <td><input type="checkbox" aria-label={'Select ' + p.title} checked={!!rowSelection[p.id]} onChange={() => toggleRow(p.id)} /></td>
              <td>{p.id}</td><td>{p.title}</td><td>{'\\u20B9' + p.price}</td>
              <td className={p.stock === 0 ? 'out' : ''}>{p.stock === 0 ? 'Out of stock' : p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pager">
        <span>Showing {products.length ? start + 1 : 0}-{start + pageRows.length} of {products.length}</span>
        <div>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))} disabled={pageIndex === 0}>{'\\u00AB'}</button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: pageIndex - 1 }))} disabled={pageIndex === 0}>Prev</button>
          <span> Page {pageIndex + 1} of {pageCount} </span>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: pageIndex + 1 }))} disabled={pageIndex >= pageCount - 1}>Next</button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: pageCount - 1 }))} disabled={pageIndex >= pageCount - 1}>{'\\u00BB'}</button>
          <select value={pagination.pageSize} onChange={e => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}>
            {[5, 10, 20].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fff7ed; margin: 0; padding: 16px; }
.card { background: #fff; border-radius: 12px; padding: 14px; max-width: 680px; margin: auto; overflow-x: auto; }
h3 { margin: 0 0 10px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
th { background: #fff7ed; }
tr.sel { background: #ffedd5; }
.out { color: #b91c1c; font-weight: 600; }
.bulk { display: flex; gap: 8px; align-items: center; background: #1e293b; color: #fff; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; flex-wrap: wrap; }
button { padding: 5px 10px; border: 1px solid #fdba74; background: #fff; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: .4; cursor: default; }
.danger { background: #dc2626; color: #fff; border-color: #dc2626; }
.link { background: none; color: #fdba74; border: 0; text-decoration: underline; }
.pager { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; font-size: 13px; }
select { padding: 5px; border-radius: 6px; margin-left: 6px; }`,
      },
      result:
        'A product table showing 5 of 23 rows with page controls. Selecting some rows makes the header checkbox show a dash (indeterminate) and a dark bulk bar "2 selected". Selections survive page changes. "Mark out of stock" turns those rows red; "Delete" removes them and the counts update.',
      explanation:
        'Plain-React version of getPaginationRowModel + row selection. Selection is an object keyed by product ID (like getRowId in TanStack), so it survives paging, sorting and deletions. The indeterminate checkbox needs a ref because that state is a DOM property only. Page index is clamped after deletions so you never land on an empty page.',
    },
    {
      title: 'Server-side pagination, sorting and search with a real API',
      scenario:
        'The users list has thousands of records in production. Load one page at a time from the API (dummyjson.com/users) with server-side sorting and a debounced search.',
      steps: [
        'Keep pagination, sorting and search in state',
        'Build the URL: /users?limit=&skip=&sortBy=&order=&select= (or /users/search?q= when searching)',
        'Fetch with AbortController whenever the state changes; keep showing old rows while loading',
        'Debounce the search box by 400 ms and reset to page 1 when it changes',
        'In TanStack Table set manualPagination, manualSorting and rowCount (see code)',
      ],
      code: `import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/axios';

export default function UsersTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([{ id: 'firstName', desc: false }]);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 400);

  const query = useQuery({
    queryKey: ['users', pagination, sorting, q],
    queryFn: async ({ signal }) => {
      const s = sorting[0];
      const { data } = await api.get(q ? '/users/search' : '/users', {
        signal,
        params: {
          q: q || undefined,
          limit: pagination.pageSize,
          skip: pagination.pageIndex * pagination.pageSize,
          sortBy: s?.id, order: s ? (s.desc ? 'desc' : 'asc') : undefined,
          select: 'firstName,lastName,email,age,role',
        },
      });
      return data;                        // { users, total, skip, limit }
    },
    placeholderData: keepPreviousData,   // keep old page visible while loading
  });

  const table = useReactTable({
    data: query.data?.users ?? [],
    columns,
    rowCount: query.data?.total ?? 0,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });
  // render table + pager + search input (onChange: setSearch, and reset pageIndex to 0)
}`,
      playground: {
        jsx: `const { useEffect, useState } = React;

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'firstName', header: 'First name' },
  { key: 'lastName', header: 'Last name' },
  { key: 'email', header: 'Email', sortable: false },
  { key: 'age', header: 'Age' },
  { key: 'role', header: 'Role' },
];

function useUsers({ pageIndex, pageSize, sorting, q }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      limit: pageSize, skip: pageIndex * pageSize,
      select: 'firstName,lastName,email,age,role',
    });
    if (sorting) { params.set('sortBy', sorting.id); params.set('order', sorting.desc ? 'desc' : 'asc'); }
    if (q) params.set('q', q);
    const url = 'https://dummyjson.com/users' + (q ? '/search' : '') + '?' + params;
    setState(s => ({ ...s, loading: true, error: null }));      // keep previous data visible
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState(s => ({ ...s, loading: false, error: err.message })); });
    return () => ctrl.abort();
  }, [pageIndex, pageSize, sorting, q]);
  return state;
}

function App() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState({ id: 'firstName', desc: false });
  const [search, setSearch] = useState('');
  const q = useDebounce(search.trim(), 400);
  useEffect(() => { setPagination(p => ({ ...p, pageIndex: 0 })); }, [q]);

  const { data, loading, error } = useUsers({ ...pagination, sorting, q });
  const total = data ? data.total : 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  const sortBy = key => setSorting(s => (s && s.id === key ? (s.desc ? null : { id: key, desc: true }) : { id: key, desc: false }));
  const go = i => setPagination(p => ({ ...p, pageIndex: i }));

  return (
    <div className="card">
      <div className="top">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users (server-side)..." aria-label="Search users" />
        {loading && <span className="spin" aria-label="Loading" />}
      </div>
      {error && <p className="err">Failed: {error}</p>}
      <div className={'wrap' + (loading ? ' dim' : '')}>
        <table>
          <thead>
            <tr>
              {columns.map(c => {
                const s = sorting && sorting.id === c.key ? sorting : null;
                return (
                  <th key={c.key} aria-sort={s ? (s.desc ? 'descending' : 'ascending') : 'none'}>
                    {c.sortable === false ? c.header : (
                      <button onClick={() => sortBy(c.key)}>{c.header} {s ? (s.desc ? '\\u25BC' : '\\u25B2') : ''}</button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data && data.users.map(u => (
              <tr key={u.id}>{columns.map(c => <td key={c.key}>{u[c.key]}</td>)}</tr>
            ))}
            {data && data.users.length === 0 && <tr><td colSpan={columns.length} className="empty">No users found</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span>{total} users | page {pagination.pageIndex + 1} of {pageCount}</span>
        <div>
          <button disabled={pagination.pageIndex === 0} onClick={() => go(pagination.pageIndex - 1)}>Prev</button>
          <button disabled={pagination.pageIndex >= pageCount - 1} onClick={() => go(pagination.pageIndex + 1)}>Next</button>
          <select value={pagination.pageSize} onChange={e => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}>
            {[5, 10, 20].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #eff6ff; margin: 0; padding: 16px; }
.card { background: #fff; border-radius: 12px; padding: 14px; max-width: 760px; margin: auto; }
.top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
input { flex: 1; padding: 8px 10px; border: 1px solid #bfdbfe; border-radius: 8px; }
.spin { width: 16px; height: 16px; border: 2px solid #bfdbfe; border-top-color: #2563eb; border-radius: 50%; animation: r .7s linear infinite; }
@keyframes r { to { transform: rotate(360deg); } }
.wrap { overflow-x: auto; transition: opacity .2s; }
.dim { opacity: .55; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { text-align: left; background: #eff6ff; padding: 9px; font-weight: 600; }
th button { all: unset; cursor: pointer; }
th button:focus-visible { outline: 2px solid #2563eb; }
td { padding: 8px 9px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
.empty { text-align: center; color: #64748b; }
.pager { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; font-size: 13px; }
button { padding: 5px 10px; border: 1px solid #bfdbfe; background: #fff; border-radius: 6px; cursor: pointer; }
button:disabled { opacity: .4; }
select { padding: 5px; border-radius: 6px; }
.err { color: #b91c1c; }`,
      },
      result:
        'The first 10 of 208 users load sorted by first name. Next/Prev fetch new pages from the server; clicking Age sorts by age on the server (▲ then ▼ then none). Typing "jo" waits 400 ms, then shows only matching users with a smaller total and page 1. While loading, old rows stay visible but dimmed with a spinner.',
      explanation:
        'Plain-React version of TanStack Table manual mode + TanStack Query: the table state (page, size, sort, search) is the input to the request, just like a query key. dummyjson supports limit/skip/sortBy/order/select, mirroring a real backend. AbortController cancels outdated requests, so fast clicks never show stale pages. Keeping previous data while loading avoids the table "jumping" to a blank state (keepPreviousData).',
    },
  ],
  interview: [
    {
      q: 'What does "headless" mean in TanStack Table?',
      a: 'The library provides only state management and logic (row models for sorting, filtering, pagination, selection, grouping) and returns data structures; it renders no markup or styles. You write the table JSX and CSS yourself, so it fits any design system (Tailwind, MUI, shadcn).',
      level: 'Easy',
    },
    {
      q: 'Why must data and columns be memoised or stable?',
      a: 'useReactTable compares them by reference. A new array every render makes the table recompute all row models and can reset internal state, and if the table state change triggers a re-render that again creates new data, you can get infinite loops. Define columns outside the component or with useMemo, and keep data in state/useMemo/query cache.',
      level: 'Medium',
    },
    {
      q: 'What is flexRender and why is it needed?',
      a: 'Column header and cell definitions can be a string, a React component, or a function receiving a context. flexRender(def, context) handles all of these uniformly, calling the function/component with the context or returning the string, so rendering code stays generic.',
      level: 'Easy',
    },
    {
      q: 'Explain client-side vs server-side pagination. When do you use each?',
      a: 'Client-side: load all rows once, slice them in the browser (getPaginationRowModel); simple and fast for a few thousand rows. Server-side: the API returns one page (limit/offset or cursor) plus total; set manualPagination and rowCount and refetch on page change. Use server-side for large, growing or sensitive datasets. Sorting and filtering must then also be server-side, otherwise you only sort the current page.',
      level: 'Medium',
    },
    {
      q: 'Why use getRowId in row selection?',
      a: 'By default row IDs are array indexes. After sorting on the server, refetching, deleting or paging, the same index refers to a different record, so the wrong rows appear selected or get deleted. getRowId: row => row.id keys selection by the real database ID.',
      level: 'Medium',
    },
    {
      q: 'How do you implement an indeterminate "select all" checkbox?',
      a: 'indeterminate is a DOM property, not an HTML attribute, so set it through a ref in useEffect: ref.current.indeterminate = someSelected && !allSelected. In TanStack use table.getIsSomePageRowsSelected() / getIsAllPageRowsSelected() and getToggleAllPageRowsSelectedHandler().',
      level: 'Medium',
    },
    {
      q: 'How would you make a sortable table accessible?',
      a: 'Use semantic table elements with caption and th scope="col"; put a button inside each sortable th so it is keyboard focusable; set aria-sort (ascending, descending, none) on the th; give row checkboxes descriptive aria-labels; announce result counts with aria-live; ensure focus styles and contrast; make wide tables scroll horizontally.',
      level: 'Medium',
    },
    {
      q: 'The user searches, but they are on page 7 and see "No results". What is the bug and fix?',
      a: 'Filtering reduced the results to fewer pages, but pageIndex stayed at 6. Reset pageIndex to 0 whenever filters or search change (TanStack has autoResetPageIndex for client-side; in manual mode do it yourself), and clamp the page index to the page count.',
      level: 'Easy',
    },
    {
      q: 'TanStack Table vs MUI DataGrid vs AG Grid?',
      a: 'TanStack Table: headless, free, tiny, full design control, you build UI. MUI DataGrid: ready-made Material UI grid, quick to start, advanced features (row grouping, Excel export) in paid Pro/Premium. AG Grid: very powerful enterprise grid (pivoting, huge data, editing), heavy and enterprise features are paid. Choose based on design requirements, features, data volume and licence budget.',
      level: 'Medium',
    },
    {
      q: 'How would you persist table state so a link can be shared?',
      a: 'Store pagination, sorting and filters in URL search params (useSearchParams): read initial state from the URL and update the URL in onPaginationChange/onSortingChange. The query key uses the same values, so copying the URL reproduces the exact view, and the back button works.',
      level: 'Hard',
    },
    {
      q: 'How do you render 10,000 rows without freezing the browser?',
      a: 'Prefer pagination or server-side data. If you need a long scrolling list, virtualise the rows with @tanstack/react-virtual (render only visible rows plus overscan), memoise data/columns and cell components, avoid heavy cell renderers, and do sorting/filtering on the server or in a web worker for huge datasets.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Add a "Status" column filter (All / Pending / Shipped / Delivered) to the orders table using TanStack Table column filters.',
      hint: 'columnFilters state, getFilteredRowModel, column.setFilterValue, filterFn: "equals".',
      solution: `const columns = [
  columnHelper.accessor('customer', { header: 'Customer' }),
  columnHelper.accessor('status', { header: 'Status', filterFn: 'equals' }),
  columnHelper.accessor('amount', { header: 'Amount' }),
];

function OrdersTable({ data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const table = useReactTable({
    data, columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const statusColumn = table.getColumn('status');

  return (
    <>
      <label>
        Status{' '}
        <select
          value={statusColumn.getFilterValue() ?? ''}
          onChange={e => statusColumn.setFilterValue(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </label>
      {/* table markup as before */}
    </>
  );
}`,
    },
    {
      task: 'Add column visibility toggles ("Columns" menu with checkboxes) to a TanStack table.',
      hint: 'table.getAllLeafColumns(), column.getIsVisible(), column.getToggleVisibilityHandler(), and state columnVisibility.',
      solution: `function ColumnToggle({ table }) {
  return (
    <details>
      <summary>Columns</summary>
      {table.getAllLeafColumns().filter(c => c.getCanHide()).map(column => (
        <label key={column.id} style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={column.getIsVisible()}
            onChange={column.getToggleVisibilityHandler()}
          />{' '}
          {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
        </label>
      ))}
    </details>
  );
}

// in the table component
const [columnVisibility, setColumnVisibility] = useState({ email: false });
const table = useReactTable({
  data, columns,
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel(),
});
// row.getVisibleCells() automatically skips hidden columns`,
    },
    {
      task: 'Write an "Export selected to CSV" button for a table with row selection (plain JS, no library).',
      hint: 'Build lines with join(","), escape quotes, create a Blob and a temporary <a download>.',
      solution: `function toCsv(rows, columns) {
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const header = columns.map(c => esc(c.header)).join(',');
  const lines = rows.map(r => columns.map(c => esc(r[c.key])).join(','));
  return [header, ...lines].join('\\n');
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// with TanStack Table
<button
  disabled={!table.getSelectedRowModel().rows.length}
  onClick={() => downloadCsv(
    'orders.csv',
    toCsv(table.getSelectedRowModel().rows.map(r => r.original), [
      { key: 'id', header: 'Order' }, { key: 'customer', header: 'Customer' }, { key: 'amount', header: 'Amount' },
    ])
  )}
>
  Export selected
</button>`,
    },
    {
      task: 'Sync the sorting and page of a TanStack table with the URL (?sort=amount.desc&page=2).',
      hint: 'Derive state from useSearchParams; in onSortingChange/onPaginationChange compute the next value (it may be an updater function) and write it to the URL.',
      solution: `import { useSearchParams } from 'react-router';

function useTableUrlState() {
  const [params, setParams] = useSearchParams();
  const [id, dir] = (params.get('sort') || '').split('.');
  const sorting = id ? [{ id, desc: dir === 'desc' }] : [];
  const pagination = { pageIndex: Math.max(0, Number(params.get('page') || 1) - 1), pageSize: 10 };

  const resolve = (updater, old) => (typeof updater === 'function' ? updater(old) : updater);

  const onSortingChange = updater => {
    const next = resolve(updater, sorting);
    setParams(p => {
      if (next[0]) p.set('sort', next[0].id + '.' + (next[0].desc ? 'desc' : 'asc')); else p.delete('sort');
      p.set('page', '1');
      return p;
    });
  };
  const onPaginationChange = updater => {
    const next = resolve(updater, pagination);
    setParams(p => { p.set('page', String(next.pageIndex + 1)); return p; });
  };
  return { sorting, pagination, onSortingChange, onPaginationChange };
}

// const urlState = useTableUrlState();
// useReactTable({ data, columns, state: { sorting: urlState.sorting, pagination: urlState.pagination },
//   onSortingChange: urlState.onSortingChange, onPaginationChange: urlState.onPaginationChange, ... })`,
    },
    {
      task: 'On mobile (< 640px) show each row as a card instead of a table. Write a ResponsiveTable component that switches using matchMedia.',
      hint: 'A useMediaQuery hook with window.matchMedia and a change listener.',
      solution: `const { useEffect, useState } = React;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = e => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function ResponsiveTable({ rows, columns }) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  if (isMobile) {
    return rows.map(r => (
      <article key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8 }}>
        {columns.map(c => <p key={c.key} style={{ margin: 2 }}><b>{c.header}:</b> {r[c.key]}</p>)}
      </article>
    ));
  }
  return (
    <table>
      <thead><tr>{columns.map(c => <th key={c.key}>{c.header}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={r.id}>{columns.map(c => <td key={c.key}>{r[c.key]}</td>)}</tr>)}</tbody>
    </table>
  );
}

function App() {
  const columns = [{ key: 'name', header: 'Name' }, { key: 'city', header: 'City' }];
  const rows = [{ id: 1, name: 'Priya', city: 'Pune' }, { id: 2, name: 'Rahul', city: 'Delhi' }];
  return <ResponsiveTable rows={rows} columns={columns} />;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which function must ALWAYS be passed to useReactTable?',
      options: ['getSortedRowModel', 'getPaginationRowModel', 'getFilteredRowModel', 'getCoreRowModel'],
      answer: 3,
      explanation: 'getCoreRowModel is required; the others add optional features.',
    },
    {
      question: 'What does manualPagination: true tell TanStack Table?',
      options: ['Pagination buttons are hidden', 'The server already paginated the data, so do not slice it', 'Users must type the page number', 'Pagination is disabled'],
      answer: 1,
      explanation: 'In manual mode the table displays the given rows as the current page and uses rowCount/pageCount for navigation.',
    },
    {
      question: 'Why set getRowId: row => row.id?',
      options: ['So row selection is keyed by real IDs, not array indexes', 'It is required for sorting', 'It improves CSS performance', 'It enables flexRender'],
      answer: 0,
      explanation: 'Index-based IDs break when data is re-sorted, paged or refetched.',
    },
    {
      question: 'Which attribute tells screen readers how a column is currently sorted?',
      options: ['aria-pressed', 'aria-selected', 'aria-sort', 'aria-order'],
      answer: 2,
      explanation: 'aria-sort on the th accepts ascending, descending, none or other.',
    },
    {
      question: 'After a search reduces results to 1 page, the table shows nothing. What is the usual fix?',
      options: ['Increase pageSize', 'Disable sorting', 'Reload the page', 'Reset pageIndex to 0 when filters/search change'],
      answer: 3,
      explanation: 'The old page index is beyond the new page count; reset or clamp it.',
    },
  ],
};
