export default {
  id: 'day-11-component-composition',
  title: 'Component Composition and Reusable Components',
  module: 'Module 2: State & Events',
  day: 11,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Composition is how React apps are built: combining small, generic components into bigger ones. Learn containment with children, multiple "slots" via props, specialization, passing components as props, and how to design flexible reusable components that avoid prop drilling.',
  objectives: [
    'Use children for containment (Card, Modal, Layout)',
    'Create multiple slots by passing JSX through named props',
    'Build specialized components from generic ones',
    'Design reusable components with sensible props, defaults and rest spreading',
    'Use composition to reduce prop drilling',
  ],
  theory: [
    {
      heading: 'Composition over inheritance',
      content:
        'In object-oriented programming you often reuse code with **inheritance** (class Dog extends Animal). React recommends **composition** instead: build components that **contain** or **configure** other components. The React team states they have not found any use case where component inheritance hierarchies are needed.\n\nAnalogy: a smartphone is not a "subclass" of a camera. It is composed of a camera, a screen, a battery and a speaker. Each part can be swapped or reused.',
    },
    {
      heading: 'Containment with children',
      content:
        'Some components do not know their content ahead of time: a Card, a Modal, a Sidebar, a Page Layout. They render `children` wherever the content should go. The parent decides what goes inside.',
      syntax: `function Modal({ title, children, onClose }) {
  return (
    <div className="backdrop">
      <div className="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}`,
    },
    {
      heading: 'Multiple slots with props',
      content:
        'Sometimes a component needs several "holes". Since JSX elements are just values, you can pass them through **any prop**, not only children. These props are often called **slots**.',
      syntax: `function SplitPane({ left, right }) {
  return (
    <div className="split">
      <div className="left">{left}</div>
      <div className="right">{right}</div>
    </div>
  );
}

<SplitPane left={<ContactList />} right={<ChatWindow />} />`,
      points: [
        'Common slot names: header, footer, sidebar, icon, actions, emptyState',
        'You can pass a component **type** too: `<List itemComponent={UserRow} />`, then render `<ItemComponent ... />` inside (capitalise the variable)',
      ],
    },
    {
      heading: 'Specialization',
      content:
        'A **specialized** component is a more specific version of a generic one, created by rendering the generic component with preset props. No inheritance needed.',
      syntax: `function Button({ variant = "primary", size = "md", children, ...rest }) {
  return <button className={"btn btn-" + variant + " btn-" + size} {...rest}>{children}</button>;
}

// Specializations
const DangerButton = props => <Button variant="danger" {...props} />;
const IconButton = ({ icon, label, ...rest }) => (
  <Button size="sm" aria-label={label} {...rest}>{icon}</Button>
);`,
    },
    {
      heading: 'Designing reusable components',
      content: 'Good reusable components are flexible but simple. Guidelines:',
      points: [
        '**Keep them presentational**: receive data via props, avoid fetching or global state inside generic UI components',
        '**Sensible defaults**: most props optional (`variant = "primary"`)',
        '**Forward extra props** with `...rest` so users can add `onClick`, `disabled`, `aria-*`, `id` without you listing them all',
        '**Accept className** and merge it with your own classes so users can adjust styles',
        '**Prefer children/slots over many boolean flags**: `<Card footer={...}>` beats `showFooter`, `footerText`, `footerButtonLabel`...',
        '**Consistent naming**: `onX` for events, `isX`/`hasX` for booleans',
      ],
      tip: 'Do not over-generalise too early. Rule of three: extract a reusable component when you have copy-pasted the same UI about three times.',
    },
    {
      heading: 'Composition to avoid prop drilling',
      content:
        'If a deeply nested component needs data from the top, instead of drilling props through every layer, the top-level component can **create the nested element itself** and pass it down as children or a slot. Intermediate layout components then just render `{children}` without knowing about the data.',
      syntax: `// ❌ Drilling user through Layout and Sidebar
<Layout user={user} />  →  <Sidebar user={user} />  →  <Avatar user={user} />

// ✅ Composition: App builds Avatar, Layout just places it
<Layout sidebar={<Avatar user={user} />}>
  <Feed />
</Layout>`,
      tip: 'Coming next (Day 12): styling these components with CSS files, CSS Modules, inline styles and Tailwind.',
    },
  ],
  examples: [
    {
      title: 'Containment: a reusable Modal with children',
      scenario: 'A generic Modal shows any content. Use it for both a login form and a delete confirmation.',
      steps: [
        'Write Modal with props isOpen, title, onClose and children',
        'Return null when not open',
        'Use the same Modal twice with different children',
      ],
      code: `function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header><h3>{title}</h3><button onClick={onClose}>✕</button></header>
        {children}
      </div>
    </div>
  );
}`,
      playground: {
        jsx: `function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <header>
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </header>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [open, setOpen] = React.useState(null); // "login" | "delete" | null
  const close = () => setOpen(null);
  return (
    <div>
      <button onClick={() => setOpen("login")}>Login</button>
      <button onClick={() => setOpen("delete")}>Delete account</button>

      <Modal isOpen={open === "login"} title="Welcome back" onClose={close}>
        <input placeholder="Email" /><br />
        <input type="password" placeholder="Password" /><br />
        <button onClick={close}>Sign in</button>
      </Modal>

      <Modal isOpen={open === "delete"} title="Are you sure?" onClose={close}>
        <p>This cannot be undone.</p>
        <button className="danger" onClick={close}>Yes, delete</button>
      </Modal>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
button { margin: 4px; padding: 6px 12px; cursor: pointer; }
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; }
.modal { background: #fff; border-radius: 12px; padding: 16px; width: 280px; }
.modal header { display: flex; justify-content: space-between; align-items: center; }
.modal h3 { margin: 0; }
.modal input { width: 95%; padding: 6px; margin: 4px 0; }
.x { border: 0; background: none; font-size: 18px; }
.danger { background: #dc2626; color: #fff; border: 0; border-radius: 6px; }`,
      },
      result: 'Each button opens the same Modal frame with different content; clicking the backdrop or ✕ closes it.',
      explanation:
        'Modal only knows about layout and closing behaviour. Its content is passed as children, so one component serves both use cases.',
    },
    {
      title: 'Multiple slots: a PageLayout with header, sidebar and content',
      scenario: 'Build a layout component that accepts header, sidebar and children slots, and avoid drilling user data through it.',
      steps: [
        'Write PageLayout({ header, sidebar, children })',
        'In App build the header and sidebar JSX with the user data',
        'PageLayout never receives the user prop directly',
      ],
      code: `function PageLayout({ header, sidebar, children }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

<PageLayout
  header={<UserMenu user={user} />}
  sidebar={<Nav items={links} />}
>
  <Dashboard user={user} />
</PageLayout>`,
      playground: {
        jsx: `function PageLayout({ header, sidebar, children }) {
  return (
    <div className="layout">
      <header className="top">{header}</header>
      <aside className="side">{sidebar}</aside>
      <main className="main">{children}</main>
    </div>
  );
}

function UserMenu({ user }) {
  return <span>👤 {user.name} <small>({user.plan})</small></span>;
}

function Nav({ items, active, onSelect }) {
  return (
    <nav>
      {items.map(i => (
        <a key={i} href="#" className={i === active ? "on" : ""}
          onClick={e => { e.preventDefault(); onSelect(i); }}>{i}</a>
      ))}
    </nav>
  );
}

function App() {
  const user = { name: "Neha", plan: "Pro" };
  const [page, setPage] = React.useState("Dashboard");
  return (
    <PageLayout
      header={<><b>AdminPanel</b><UserMenu user={user} /></>}
      sidebar={<Nav items={["Dashboard", "Orders", "Settings"]} active={page} onSelect={setPage} />}
    >
      <h2>{page}</h2>
      <p>Hello {user.name}, this is the {page.toLowerCase()} page.</p>
    </PageLayout>
  );
}`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.layout { display: grid; grid-template-columns: 140px 1fr; grid-template-rows: auto 1fr; min-height: 260px; }
.top { grid-column: 1 / -1; display: flex; justify-content: space-between; padding: 10px 14px; background: #312e81; color: #fff; }
.side { background: #eef2ff; padding: 10px; }
.side a { display: block; padding: 6px; color: #312e81; text-decoration: none; border-radius: 6px; }
.side a.on { background: #c7d2fe; font-weight: bold; }
.main { padding: 10px 16px; }`,
      },
      result: 'An admin layout with a top bar, sidebar navigation and main content that changes when you click links.',
      explanation:
        'PageLayout has three slots. App fills them with ready-made elements that already have the data they need, so PageLayout stays generic and nothing is drilled through it.',
    },
    {
      title: 'Specialization and rest props: a Button family',
      scenario: 'Create one flexible Button and derive PrimaryButton, DangerButton and IconButton from it.',
      steps: [
        'Write Button with variant, size, className, children and ...rest',
        'Create specialized components that preset some props',
        'Use them with extra props like disabled and onClick',
      ],
      code: `function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
  return (
    <button className={["btn", variant, size, className].join(" ")} {...rest}>
      {children}
    </button>
  );
}
const DangerButton = props => <Button variant="danger" {...props} />;`,
      playground: {
        jsx: `function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
  return (
    <button className={["btn", variant, size, className].join(" ").trim()} {...rest}>
      {children}
    </button>
  );
}

const DangerButton = props => <Button variant="danger" {...props} />;
const GhostButton = props => <Button variant="ghost" {...props} />;
const IconButton = ({ icon, label, ...rest }) => (
  <Button size="sm" variant="ghost" aria-label={label} title={label} {...rest}>{icon}</Button>
);

function App() {
  const [log, setLog] = React.useState("Click a button");
  return (
    <div>
      <Button onClick={() => setLog("Saved!")}>Save</Button>
      <DangerButton onClick={() => setLog("Deleted!")}>Delete</DangerButton>
      <GhostButton disabled>Disabled ghost</GhostButton>
      <Button size="lg" className="rounded" onClick={() => setLog("Big + rounded")}>Large</Button>
      <IconButton icon="❤" label="Like" onClick={() => setLog("Liked ❤")} />
      <IconButton icon="🔗" label="Share" onClick={() => setLog("Link copied 🔗")} />
      <p>{log}</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.btn { border: 1px solid transparent; border-radius: 6px; margin: 4px; cursor: pointer; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.primary { background: #2563eb; color: #fff; }
.danger { background: #dc2626; color: #fff; }
.ghost { background: transparent; border-color: #94a3b8; }
.sm { padding: 4px 8px; font-size: 14px; }
.md { padding: 8px 14px; font-size: 15px; }
.lg { padding: 12px 22px; font-size: 18px; }
.rounded { border-radius: 999px; }`,
      },
      result: 'A row of differently styled buttons; clicking them updates the message, and the disabled one cannot be clicked.',
      explanation:
        '...rest collects any props Button does not name (onClick, disabled, aria-label, title) and spreads them on the real <button>. Specialized components just preset props and forward the rest, which is composition rather than inheritance.',
    },
    {
      title: 'Passing a component type and a render function',
      scenario: 'A generic DataList renders any array. The caller chooses how each item looks by passing an item component, and the empty state via a slot.',
      steps: [
        'Write DataList({ items, ItemComponent, empty })',
        'Render <ItemComponent {...item} /> for each item',
        'Use DataList for users and for products with different item components',
      ],
      code: `function DataList({ items, ItemComponent, empty = <p>Nothing here</p> }) {
  if (items.length === 0) return empty;
  return <ul>{items.map(item => <li key={item.id}><ItemComponent {...item} /></li>)}</ul>;
}

<DataList items={users} ItemComponent={UserRow} />
<DataList items={[]} ItemComponent={ProductRow} empty={<p>No products yet 📦</p>} />`,
      playground: {
        jsx: `function DataList({ title, items, ItemComponent, empty = <p>Nothing here</p> }) {
  return (
    <section className="list">
      <h3>{title}</h3>
      {items.length === 0 ? empty : (
        <ul>{items.map(item => <li key={item.id}><ItemComponent {...item} /></li>)}</ul>
      )}
    </section>
  );
}

const UserRow = ({ name, role }) => <span>👤 <b>{name}</b> – {role}</span>;
const ProductRow = ({ title, price }) => <span>📦 {title} <i>₹{price}</i></span>;

function App() {
  const [products, setProducts] = React.useState([]);
  const users = [
    { id: 1, name: "Ishaan", role: "Admin" },
    { id: 2, name: "Tara", role: "Editor" },
  ];
  return (
    <div className="row">
      <DataList title="Users" items={users} ItemComponent={UserRow} />
      <DataList title="Products" items={products} ItemComponent={ProductRow}
        empty={<button onClick={() => setProducts([{ id: 1, title: "Desk Lamp", price: 749 }])}>No products – add sample</button>} />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.list { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 14px; min-width: 220px; }
ul { padding-left: 18px; }`,
      },
      result: 'Users list shows two rows; Products shows a custom empty-state button that, when clicked, displays a product.',
      explanation:
        'ItemComponent is a prop holding a component type; it must be capitalised to be used as a JSX tag. empty is a slot holding JSX. DataList is fully generic and knows nothing about users or products.',
    },
  ],
  interview: [
    { q: 'What is component composition?', a: 'Building complex UIs by combining smaller components, either by nesting them, passing them as children, or passing them through props, instead of using inheritance.', level: 'Easy' },
    { q: 'Why does React prefer composition over inheritance?', a: 'Composition with props and children is more flexible and explicit; any UI customisation can be achieved by passing data, JSX or functions as props. Inheritance creates tight coupling and fragile hierarchies.', level: 'Medium' },
    { q: 'What is containment in React?', a: 'A pattern where a component does not know its children ahead of time and renders whatever is passed as props.children, e.g. Card, Modal, Dialog, Layout.', level: 'Easy' },
    { q: 'How can a component accept multiple content areas?', a: 'Pass JSX through named props (slots) like header, sidebar and footer, and render them in the right places.', level: 'Easy' },
    { q: 'What is specialization?', a: 'Creating a specific component by rendering a generic one with preset props, e.g. const DangerButton = props => <Button variant="danger" {...props} />.', level: 'Medium' },
    { q: 'Why spread ...rest props onto the root element of a reusable component?', a: 'It forwards any extra attributes or handlers (onClick, disabled, aria-*, data-*) without the component having to declare each one, making it flexible and accessible.', level: 'Medium' },
    { q: 'How can composition reduce prop drilling?', a: 'The top-level component creates the nested element with the data it needs and passes the element down as children or a slot. Intermediate layout components render it without knowing about the data.', level: 'Hard' },
    { q: 'What are presentational vs container components?', a: 'Presentational components focus on how things look and receive data via props. Container components handle data fetching and state and pass data to presentational ones. With hooks this split is often done with custom hooks instead.', level: 'Medium' },
    { q: 'What is a render prop?', a: 'A prop whose value is a function that returns JSX; the component calls it to decide what to render, e.g. <List renderItem={item => <Row {...item} />} />.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Card component with title, footer slot and children. Use it to make a pricing card with a "Buy now" button in the footer.',
      hint: 'footer is a prop holding JSX.',
      solution: `function Card({ title, footer, children }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, width: 220 }}>
      <h3 style={{ margin: 0, padding: 10, background: "#f1f5f9" }}>{title}</h3>
      <div style={{ padding: 10 }}>{children}</div>
      {footer && <div style={{ padding: 10, borderTop: "1px solid #eee" }}>{footer}</div>}
    </div>
  );
}

function App() {
  return (
    <Card title="Pro Plan" footer={<button>Buy now</button>}>
      <p>₹499 / month</p>
      <ul><li>Unlimited projects</li><li>Priority support</li></ul>
    </Card>
  );
}`,
    },
    {
      task: 'Build an Alert component (type: info | success | error, plus children) and specialize it into SuccessAlert and ErrorAlert.',
      hint: 'const SuccessAlert = props => <Alert type="success" {...props} />',
      solution: `const bg = { info: "#e0f2fe", success: "#dcfce7", error: "#fee2e2" };

function Alert({ type = "info", children }) {
  return <div style={{ background: bg[type], padding: 10, borderRadius: 8, margin: 6 }}>{children}</div>;
}
const SuccessAlert = props => <Alert type="success" {...props} />;
const ErrorAlert = props => <Alert type="error" {...props} />;

function App() {
  return (
    <>
      <Alert>FYI: maintenance tonight.</Alert>
      <SuccessAlert>Order placed!</SuccessAlert>
      <ErrorAlert>Payment failed.</ErrorAlert>
    </>
  );
}`,
    },
    {
      task: 'Write a reusable Input component with label, error and ...rest props, and use it for name and email fields.',
      hint: 'Spread rest onto <input>, and generate an id from the label if none is given.',
      solution: `function Input({ label, error, id, ...rest }) {
  const inputId = id || label.toLowerCase().replace(/\\s+/g, "-");
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={inputId}>{label}</label><br />
      <input id={inputId} {...rest} style={{ borderColor: error ? "red" : "#ccc" }} />
      {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function App() {
  const [email, setEmail] = React.useState("");
  return (
    <>
      <Input label="Full name" placeholder="Your name" />
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
        error={email && !email.includes("@") ? "Invalid email" : ""} />
    </>
  );
}`,
    },
    {
      task: 'Make a List component that takes items and a renderItem function prop, and use it to render numbers squared.',
      hint: 'Inside List: items.map((item, i) => <li key={i}>{renderItem(item)}</li>)',
      solution: `function List({ items, renderItem }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

function App() {
  return <List items={[1, 2, 3, 4]} renderItem={n => <span>{n} squared = <b>{n * n}</b></span>} />;
}`,
    },
  ],
  quiz: [
    { question: 'Which prop holds content placed between a component\'s tags?', options: ['content', 'slot', 'children', 'inner'], answer: 2, explanation: 'Nested JSX arrives as props.children.' },
    { question: 'React recommends reusing code between components via...', options: ['Class inheritance', 'Composition', 'Global variables', 'Mixins'], answer: 1, explanation: 'Composition with props and children is preferred.' },
    { question: 'What does {...rest} on a <button> inside a reusable Button do?', options: ['Forwards remaining props like onClick and disabled', 'Removes all props', 'Copies state', 'Adds CSS'], answer: 0, explanation: 'Rest props are spread onto the native element.' },
    { question: 'To render a component passed as a prop called item, you should...', options: ['Call item() always', 'Write <item />', 'Use document.createElement(item)', 'Assign it to a capitalised variable and render <Item />'], answer: 3, explanation: 'Lowercase JSX tags are treated as HTML elements.' },
    { question: 'const DangerButton = p => <Button variant="danger" {...p} /> is an example of...', options: ['Inheritance', 'Prop drilling', 'Specialization', 'Context'], answer: 2, explanation: 'It presets props on a generic component.' },
  ],
};
