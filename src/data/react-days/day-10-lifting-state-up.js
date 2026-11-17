export default {
  id: 'day-10-lifting-state-up',
  title: 'Lifting State Up and Sharing State between Components',
  module: 'Module 2: State & Events',
  day: 10,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'When two components need the same data, move the state to their closest common parent and pass it down as props, with callbacks to change it. Learn the "single source of truth" principle, inverse data flow, and how to decide where state should live.',
  objectives: [
    'Recognise when sibling components need shared state',
    'Lift state to the closest common parent and pass data + callbacks down',
    'Apply the single source of truth principle and avoid duplicated state',
    'Turn a component from uncontrolled (own state) to controlled (props-driven)',
    'Understand prop drilling and its limits',
  ],
  theory: [
    {
      heading: 'The problem: siblings cannot talk directly',
      content:
        'Data in React flows **one way: down** from parent to child via props. Two sibling components cannot read each other\'s state.\n\nExample: a product page has a `SizeSelector` and an `AddToCartButton`. The button needs to know the selected size, but the size lives inside SizeSelector. The siblings have no direct connection.\n\nAnalogy: two children in a family who are not allowed to talk at the dinner table. They pass messages through the parent, who keeps the official record.',
    },
    {
      heading: 'The solution: lift state up',
      content:
        '**Lifting state up** means moving the state from the child components to their **closest common parent**. Then:\n\n1. The parent owns the state (`useState`)\n2. The parent passes the **value** down as a prop to whoever needs to read it\n3. The parent passes a **callback** (setter or handler) down to whoever needs to change it\n4. The child calls the callback; the parent updates state; React re-renders both children with fresh props',
      syntax: `function ProductPage() {
  const [size, setSize] = useState("M");          // lifted state
  return (
    <>
      <SizeSelector size={size} onChange={setSize} />  // can change it
      <AddToCartButton size={size} />                   // can read it
    </>
  );
}`,
      tip: 'Data goes DOWN as props; events go UP as callback calls. This is called "inverse data flow".',
    },
    {
      heading: 'Single source of truth',
      content:
        'Every piece of changing data should have **exactly one owner** component. Do not keep copies of the same data in several components\' state: they will drift apart and create bugs (for example, the cart badge says 3 items but the cart page shows 2).\n\nIf a value can be **calculated** from the source of truth, calculate it during render rather than storing it.',
      points: [
        'Bad: Header keeps its own cartCount state AND Cart keeps cartItems state',
        'Good: App keeps cartItems; Header receives cartItems.length; Cart receives cartItems',
      ],
    },
    {
      heading: 'Where should state live? A checklist',
      content:
        'For each piece of state:\n\n1. Find every component that **renders** something based on it\n2. Find their **closest common parent**\n3. Put the state there (or even higher if it makes sense)\n4. If no sensible parent exists, create a new wrapper component just to hold the state\n\nKeep state as **low** as possible but as **high** as necessary. State that only one component uses should stay in that component.',
    },
    {
      heading: 'Controlled vs uncontrolled components (component level)',
      content:
        'A component that manages its own state internally is **uncontrolled** (the parent cannot influence it). After lifting state up, the component receives its value and change handler via props and becomes **controlled** by its parent.\n\nThis is the same idea as controlled inputs from Day 9, applied to your own components. Many reusable components (Tabs, Accordion, Modal) support both modes.',
      syntax: `// Uncontrolled: owns its state
function Accordion() {
  const [open, setOpen] = useState(false);
  ...
}

// Controlled: parent owns the state
function Accordion({ open, onToggle }) {
  ...
}`,
    },
    {
      heading: 'Prop drilling and its limits',
      content:
        'When state is lifted high, you may need to pass props through several layers of components that do not use them, just to reach a deep child. This is **prop drilling**. One or two levels is fine and explicit. Many levels become painful.\n\nSolutions (coming later): **component composition** with children (Day 11) and the **Context API** (Day 16). Global state libraries such as Redux Toolkit or Zustand are covered on Days 22–23.',
      tip: 'Coming next (Day 11): composition patterns that reduce prop drilling and make components reusable.',
    },
  ],
  examples: [
    {
      title: 'Temperature converter: two inputs, one source of truth',
      scenario: 'Celsius and Fahrenheit inputs must stay in sync. Typing in either updates the other.',
      steps: [
        'Create a TemperatureInput component that receives value and onChange via props',
        'In App store the temperature and which scale was edited',
        'Compute the other scale during render',
        'Type in either input',
      ],
      code: `function TemperatureInput({ scale, value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function App() {
  const [temp, setTemp] = useState("");
  const [scale, setScale] = useState("c");
  const celsius = scale === "f" ? toC(temp) : temp;
  const fahrenheit = scale === "c" ? toF(temp) : temp;
  return (
    <>
      <TemperatureInput scale="c" value={celsius} onChange={v => { setScale("c"); setTemp(v); }} />
      <TemperatureInput scale="f" value={fahrenheit} onChange={v => { setScale("f"); setTemp(v); }} />
    </>
  );
}`,
      playground: {
        jsx: `const toC = f => ((f - 32) * 5) / 9;
const toF = c => (c * 9) / 5 + 32;
const convert = (value, fn) => (value === "" || isNaN(value) ? "" : String(Math.round(fn(Number(value)) * 10) / 10));

function TemperatureInput({ label, value, onChange }) {
  return (
    <label className="field">
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Verdict({ celsius }) {
  if (celsius === "") return null;
  return <p>{Number(celsius) >= 100 ? "💨 Water boils" : Number(celsius) <= 0 ? "🧊 Water freezes" : "💧 Water is liquid"}</p>;
}

function App() {
  const [temp, setTemp] = React.useState("");
  const [scale, setScale] = React.useState("c");

  const celsius = scale === "f" ? convert(temp, toC) : temp;
  const fahrenheit = scale === "c" ? convert(temp, toF) : temp;

  return (
    <div>
      <TemperatureInput label="Celsius" value={celsius} onChange={v => { setScale("c"); setTemp(v); }} />
      <TemperatureInput label="Fahrenheit" value={fahrenheit} onChange={v => { setScale("f"); setTemp(v); }} />
      <Verdict celsius={celsius} />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.field { display: block; margin-bottom: 10px; }
.field input { display: block; padding: 8px; margin-top: 4px; }`,
      },
      result: 'Typing 100 in Celsius shows 212 in Fahrenheit and "Water boils"; typing 32 in Fahrenheit shows 0 in Celsius.',
      explanation:
        'Only App stores data (temp and scale). Both inputs and the Verdict are driven by props derived from it, so they can never disagree. Each input reports changes upward via onChange.',
    },
    {
      title: 'Shopping cart: header badge and product list share state',
      scenario: 'Products, the header cart count and the cart summary are siblings. Lift the cart to App so all stay in sync.',
      steps: [
        'Keep cart (array of ids) in App',
        'Pass cart.length to Header, cart + onAdd/onRemove to ProductList',
        'Pass cart to CartSummary to compute the total',
        'Add and remove items and watch all three update',
      ],
      code: `function App() {
  const [cart, setCart] = useState([]);
  const add = id => setCart(c => [...c, id]);
  const remove = id => setCart(c => c.filter(x => x !== id));
  return (
    <>
      <Header count={cart.length} />
      <ProductList cart={cart} onAdd={add} onRemove={remove} />
      <CartSummary cart={cart} />
    </>
  );
}`,
      playground: {
        jsx: `const products = [
  { id: 1, name: "Notebook", price: 60 },
  { id: 2, name: "Gel Pen", price: 25 },
  { id: 3, name: "Backpack", price: 899 },
];

function Header({ count }) {
  return <header className="header">📚 StationeryHub <span className="badge">🛒 {count}</span></header>;
}

function ProductList({ cart, onAdd, onRemove }) {
  return (
    <ul className="list">
      {products.map(p => {
        const inCart = cart.includes(p.id);
        return (
          <li key={p.id}>
            {p.name} – ₹{p.price}
            {inCart
              ? <button onClick={() => onRemove(p.id)}>Remove</button>
              : <button onClick={() => onAdd(p.id)}>Add</button>}
          </li>
        );
      })}
    </ul>
  );
}

function CartSummary({ cart }) {
  const total = products.filter(p => cart.includes(p.id)).reduce((s, p) => s + p.price, 0);
  return <p className="summary">Items: {cart.length} · Total: ₹{total}</p>;
}

function App() {
  const [cart, setCart] = React.useState([]);
  const add = id => setCart(c => [...c, id]);
  const remove = id => setCart(c => c.filter(x => x !== id));
  return (
    <>
      <Header count={cart.length} />
      <ProductList cart={cart} onAdd={add} onRemove={remove} />
      <CartSummary cart={cart} />
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
.header { display: flex; justify-content: space-between; padding: 12px 16px; background: #1e293b; color: #fff; }
.badge { background: #f59e0b; color: #000; padding: 0 10px; border-radius: 999px; }
.list { list-style: none; padding: 16px; }
.list li { display: flex; justify-content: space-between; max-width: 320px; margin-bottom: 8px; }
.summary { padding: 0 16px; font-weight: bold; }`,
      },
      result: 'Adding a product updates the header badge, the button label and the total at once.',
      explanation:
        'Header, ProductList and CartSummary are siblings. Since cart lives in their common parent App, there is one source of truth; the total is derived, not stored.',
    },
    {
      title: 'Accordion: only one panel open at a time',
      scenario: 'An FAQ where opening one question closes the others. Each Panel originally managed its own isOpen; lift it to the parent.',
      steps: [
        'Store activeIndex in the parent (FAQ)',
        'Pass isActive and onShow to each Panel',
        'Clicking a panel tells the parent which index to show',
      ],
      code: `function Panel({ title, children, isActive, onShow }) {
  return (
    <section>
      <h3 onClick={onShow}>{title}</h3>
      {isActive && <p>{children}</p>}
    </section>
  );
}

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);
  return faqs.map((f, i) => (
    <Panel key={f.q} title={f.q} isActive={activeIndex === i} onShow={() => setActiveIndex(i)}>
      {f.a}
    </Panel>
  ));
}`,
      playground: {
        jsx: `const faqs = [
  { q: "What is React?", a: "A JavaScript library for building user interfaces." },
  { q: "What is state?", a: "Data a component remembers between renders." },
  { q: "What is lifting state up?", a: "Moving state to the closest common parent so siblings can share it." },
];

function Panel({ title, children, isActive, onShow }) {
  return (
    <section className={"panel" + (isActive ? " open" : "")}>
      <button className="title" onClick={onShow} aria-expanded={isActive}>
        {isActive ? "▾" : "▸"} {title}
      </button>
      {isActive && <p className="body">{children}</p>}
    </section>
  );
}

function App() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  return (
    <div className="faq">
      <h2>FAQ</h2>
      {faqs.map((f, i) => (
        <Panel key={f.q} title={f.q} isActive={activeIndex === i}
          onShow={() => setActiveIndex(activeIndex === i ? -1 : i)}>
          {f.a}
        </Panel>
      ))}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.faq { max-width: 420px; }
.panel { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
.panel.open { border-color: #0ea5e9; }
.title { width: 100%; text-align: left; background: none; border: 0; padding: 10px; font-size: 1rem; cursor: pointer; }
.body { margin: 0; padding: 0 12px 12px; color: #475569; }`,
      },
      result: 'Only one answer is visible at a time; clicking the open question closes it.',
      explanation:
        'If each Panel had its own state, several could be open and they could not coordinate. With activeIndex lifted to the parent, the parent decides; panels are now controlled components.',
    },
    {
      title: 'Search filter: input and list are siblings',
      scenario: 'A SearchBar and a ContactList are separate components. The query is lifted to App so the list can filter by it.',
      steps: [
        'Keep query in App',
        'Pass query and setQuery to SearchBar',
        'Pass the filtered contacts to ContactList',
      ],
      code: `function App() {
  const [query, setQuery] = useState("");
  const visible = contacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <SearchBar query={query} onQueryChange={setQuery} />
      <ContactList contacts={visible} />
    </>
  );
}`,
      playground: {
        jsx: `const contacts = [
  { id: 1, name: "Aarav Mehta", phone: "98765 43210" },
  { id: 2, name: "Diya Nair", phone: "91234 56789" },
  { id: 3, name: "Kabir Singh", phone: "99887 76655" },
  { id: 4, name: "Ananya Iyer", phone: "90000 11111" },
];

function SearchBar({ query, onQueryChange }) {
  return (
    <input className="search" placeholder="Search contacts..." value={query}
      onChange={e => onQueryChange(e.target.value)} />
  );
}

function ContactList({ contacts }) {
  if (contacts.length === 0) return <p>No contacts found.</p>;
  return (
    <ul>
      {contacts.map(c => <li key={c.id}><b>{c.name}</b> · {c.phone}</li>)}
    </ul>
  );
}

function App() {
  const [query, setQuery] = React.useState("");
  const visible = contacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <SearchBar query={query} onQueryChange={setQuery} />
      <p className="count">{visible.length} of {contacts.length} contacts</p>
      <ContactList contacts={visible} />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.search { padding: 8px; width: 260px; }
.count { color: #64748b; font-size: .9rem; }`,
      },
      result: 'Typing "an" shows Ananya Iyer and Diya Nair; the counter shows "2 of 4 contacts".',
      explanation:
        'SearchBar only reports changes; ContactList only displays. App owns the query and derives the filtered list, so both siblings stay in sync.',
    },
  ],
  interview: [
    { q: 'What does "lifting state up" mean?', a: 'Moving shared state from child components to their closest common ancestor, then passing the value down as props and a callback to update it, so multiple components can share and stay in sync.', level: 'Easy' },
    { q: 'How do sibling components share data in React?', a: 'By lifting the shared state to their common parent, which passes it to both as props. Alternatives for distant components: Context or a state management library.', level: 'Easy' },
    { q: 'What is the single source of truth principle?', a: 'Each piece of data should be owned by exactly one component (or store). Others receive it via props or context rather than keeping copies, preventing inconsistencies.', level: 'Medium' },
    { q: 'What is inverse data flow?', a: 'Data flows down via props, but children can trigger changes upward by calling callback functions provided by the parent, which updates its state.', level: 'Medium' },
    { q: 'How do you decide where state should live?', a: 'Identify all components that use the state, find their closest common parent, and place the state there. Keep it as low as possible and as high as necessary.', level: 'Medium' },
    { q: 'What is prop drilling and how can you avoid it?', a: 'Passing props through intermediate components that do not use them to reach deeply nested children. Avoid via composition (passing components as children), Context API, or state libraries.', level: 'Medium' },
    { q: 'What is the difference between a controlled and an uncontrolled component in general (not just inputs)?', a: 'A controlled component gets its important state from props and reports changes via callbacks; the parent decides. An uncontrolled component keeps that state internally.', level: 'Hard' },
    { q: 'Why should you avoid storing derived data in state?', a: 'It duplicates information that already exists, requiring manual synchronisation and risking bugs. Compute it from existing state/props during render (use useMemo only if expensive).', level: 'Medium' },
    { q: 'Can a child component call setState of the parent directly?', a: 'Only if the parent passes the setter (or a handler wrapping it) as a prop. The child has no other access to the parent\'s state.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create two Counter components and a Total component. Lift the counts to App so Total shows their sum.',
      hint: 'Store counts as an array [0, 0] in App.',
      solution: `function Counter({ value, onIncrement }) {
  return <button onClick={onIncrement}>Count: {value}</button>;
}

function Total({ values }) {
  return <p>Total: {values.reduce((a, b) => a + b, 0)}</p>;
}

function App() {
  const [counts, setCounts] = React.useState([0, 0]);
  const inc = i => setCounts(c => c.map((v, j) => (j === i ? v + 1 : v)));
  return (
    <div>
      <Counter value={counts[0]} onIncrement={() => inc(0)} />
      <Counter value={counts[1]} onIncrement={() => inc(1)} />
      <Total values={counts} />
    </div>
  );
}`,
    },
    {
      task: 'Build Tabs: a TabList component of buttons and a TabContent component. The active tab lives in App.',
      hint: 'Pass active and onSelect to TabList; pass active to TabContent.',
      solution: `const tabs = { Home: "Welcome home!", Profile: "Your profile", Settings: "Change settings" };

function TabList({ active, onSelect }) {
  return Object.keys(tabs).map(t => (
    <button key={t} onClick={() => onSelect(t)} style={{ fontWeight: t === active ? "bold" : "normal" }}>{t}</button>
  ));
}

function TabContent({ active }) {
  return <p>{tabs[active]}</p>;
}

function App() {
  const [active, setActive] = React.useState("Home");
  return (
    <div>
      <TabList active={active} onSelect={setActive} />
      <TabContent active={active} />
    </div>
  );
}`,
    },
    {
      task: 'Create a ColorPicker (buttons for 4 colors) and a Preview box as siblings; selecting a color changes the box.',
      hint: 'Lift selected color to App.',
      solution: `const colors = ["tomato", "gold", "seagreen", "royalblue"];

function ColorPicker({ onPick }) {
  return colors.map(c => <button key={c} onClick={() => onPick(c)} style={{ background: c, color: "#fff" }}>{c}</button>);
}

function Preview({ color }) {
  return <div style={{ width: 120, height: 80, background: color, marginTop: 10, borderRadius: 8 }} />;
}

function App() {
  const [color, setColor] = React.useState("tomato");
  return (
    <div>
      <ColorPicker onPick={setColor} />
      <Preview color={color} />
    </div>
  );
}`,
    },
    {
      task: 'Create a TodoForm and a TodoList as siblings. The form adds todos; the list shows them and can delete them.',
      hint: 'App owns todos; pass onAdd to TodoForm and todos + onDelete to TodoList.',
      solution: `function TodoForm({ onAdd }) {
  const [text, setText] = React.useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); if (text.trim()) { onAdd(text.trim()); setText(""); } }}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button>Add</button>
    </form>
  );
}

function TodoList({ todos, onDelete }) {
  return <ul>{todos.map(t => <li key={t.id}>{t.text} <button onClick={() => onDelete(t.id)}>x</button></li>)}</ul>;
}

function App() {
  const [todos, setTodos] = React.useState([]);
  return (
    <div>
      <TodoForm onAdd={text => setTodos(t => [...t, { id: Date.now(), text }])} />
      <TodoList todos={todos} onDelete={id => setTodos(t => t.filter(x => x.id !== id))} />
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Two sibling components need the same state. Where should it live?', options: ['In both siblings', 'In their closest common parent', 'In a global variable', 'In localStorage'], answer: 1, explanation: 'Lift it to the closest common parent.' },
    { question: 'How does a child ask the parent to change lifted state?', options: ['By mutating props', 'By calling a callback passed via props', 'By using document.querySelector', 'It cannot'], answer: 1, explanation: 'The parent passes a function; the child calls it.' },
    { question: 'What is prop drilling?', options: ['Passing props through many layers that do not need them', 'Deleting props', 'Validating props', 'Using props in CSS'], answer: 0, explanation: 'Intermediate components only forward the props.' },
    { question: 'A cart total can be calculated from cart items. You should...', options: ['Store it in separate state', 'Store it in a ref', 'Store it in each child', 'Compute it during render'], answer: 3, explanation: 'Derive values instead of duplicating state.' },
    { question: 'Data in React flows...', options: ['Up from child to parent via props', 'Randomly', 'Down from parent to child via props', 'Sideways between siblings'], answer: 2, explanation: 'One-way data flow: top-down via props.' },
  ],
};
