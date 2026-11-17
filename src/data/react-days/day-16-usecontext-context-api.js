export default {
  id: 'day-16-usecontext-context-api',
  title: 'useContext and the Context API: createContext, Provider, Consumer, Avoiding Prop Drilling',
  module: 'Module 3: Hooks',
  day: 16,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn how React Context lets you share data such as the theme, the logged-in user or the language with any component in the tree without passing props through every level. You will create a context, provide a value and read it with the useContext hook.',
  objectives: [
    'Explain what prop drilling is and why it becomes painful in larger apps',
    'Create a context with React.createContext and supply a value with a Provider',
    'Read context values in any child component with useContext',
    'Pass both state and updater functions through context (theme toggle, auth)',
    'Know when context is the right tool and when plain props are better',
  ],
  theory: [
    {
      heading: 'The problem: prop drilling',
      content:
        'Imagine an app where the `App` component knows the logged-in user, and a tiny `Avatar` component five levels deep needs the user name. Without context you must pass `user` as a prop through `Layout`, `Sidebar`, `Menu` and `Profile`, even though none of them use it. This is called **prop drilling**.\n\nAnalogy: it is like passing a note through every person in a row of a classroom just to reach the student at the end. Everybody in the middle has to touch the note even though it is not for them.\n\nProp drilling is fine for 1-2 levels. It becomes a problem when:\n- Many components at different depths need the same data\n- Middle components must accept props they never use\n- Renaming a prop forces you to edit many files',
      tip: 'Do not reach for context too early. Passing props 1-2 levels is clear and easy to follow. Use context for truly "global-ish" data: theme, current user, language, cart.',
    },
    {
      heading: 'The three steps: create, provide, consume',
      content:
        'Context works in three steps:\n\n1. **Create** the context once with `React.createContext(defaultValue)`. This returns a context object.\n2. **Provide** a value by wrapping part of the tree with `<MyContext.Provider value={...}>`. Every component inside can now read the value.\n3. **Consume** the value in any child with `const value = useContext(MyContext)`.\n\nAnalogy: context is like a Wi-Fi router. The Provider is the router broadcasting a signal; any device (component) inside the house (subtree) can connect with `useContext` without running a cable through each room.',
      syntax:
        "const ThemeContext = React.createContext('light');   // 1. create\n\nfunction App() {\n  return (\n    <ThemeContext.Provider value=\"dark\">           {/* 2. provide */}\n      <Toolbar />\n    </ThemeContext.Provider>\n  );\n}\n\nfunction Button() {\n  const theme = React.useContext(ThemeContext);    // 3. consume\n  return <button className={theme}>OK</button>;\n}",
    },
    {
      heading: 'Default value and the nearest Provider',
      content:
        'The argument to `createContext` is the **default value**. It is used only when a component calls `useContext` and there is **no matching Provider above it**. Many developers pass `null` and then show a helpful error if the context is missing.\n\nWhen there are several Providers of the same context, a component reads the value from the **nearest Provider above it** in the tree. This lets you override a value for one section, for example a dark sidebar inside a light page.\n\n- No Provider above: default value is used\n- One Provider: its `value` is used\n- Nested Providers: the closest one wins',
      tip: 'A common bug: you call useContext but forgot to wrap the tree in the Provider, so you silently get the default value. Throwing an error in a custom hook such as useAuth() when the value is null makes this bug obvious.',
    },
    {
      heading: 'Sharing state and functions through context',
      content:
        'Context by itself does not store state. It only **transports** a value. To make the value change, keep it in state (with `useState` or `useReducer`) inside a provider component and pass both the value and the function that changes it.\n\nA very common pattern is a custom provider component:\n\n- `ThemeProvider` holds `const [theme, setTheme] = useState(\'light\')`\n- It renders `<ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>`\n- Children call `useContext(ThemeContext)` to get `theme` and `toggle`\n\nWhen the state changes, React re-renders **every component that reads that context**.',
      syntax:
        "function ThemeProvider({ children }) {\n  const [theme, setTheme] = React.useState('light');\n  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));\n  return (\n    <ThemeContext.Provider value={{ theme, toggle }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}",
    },
    {
      heading: 'Re-renders and performance basics',
      content:
        'Every time the Provider `value` changes (by reference), all consumers re-render. If you write `value={{ theme, toggle }}`, a **new object** is created on every render of the provider, so consumers re-render even if `theme` did not change.\n\nSimple rules:\n- Keep the provider component small so it rarely re-renders for unrelated reasons\n- Split unrelated data into separate contexts (ThemeContext, AuthContext) instead of one giant AppContext\n- For heavy apps, memoize the value with `useMemo` (covered on Day 18)\n\nContext is great for data that changes rarely (theme, user, locale). For data that changes many times per second, a dedicated state library can be better (Day 22).',
      tip: 'Context is not a state manager. It is a dependency-injection mechanism. State still lives in useState/useReducer.',
    },
    {
      heading: 'Legacy Consumer syntax and when not to use context',
      content:
        'Before hooks, you read context with a render-prop component: `<ThemeContext.Consumer>{value => <p>{value}</p>}</ThemeContext.Consumer>`. You may see it in old code bases, but `useContext` is the modern, simpler way.\n\nDo **not** use context when:\n- Only a parent and its direct child need the data (use props)\n- You can solve the drilling by **composition**, i.e. passing the finished component as `children` instead of the data\n- The data changes extremely often and many consumers would re-render\n\nComing next: Day 17 shows `useReducer`, which pairs beautifully with context for app-wide state.',
    },
  ],
  examples: [
    {
      title: 'Theme toggle shared with Context',
      scenario: 'A header button switches the whole page between light and dark mode. The card deep inside the tree must react without receiving any props.',
      steps: [
        'Create ThemeContext with React.createContext(null)',
        'Write a ThemeProvider that stores theme in useState and exposes { theme, toggle }',
        'Wrap the app content in <ThemeProvider>',
        'Read theme and toggle with useContext in Header and Card',
        'Click Run and press the toggle button',
      ],
      code: `const ThemeContext = React.createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState('light');
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function Header() {
  const { theme, toggle } = React.useContext(ThemeContext);
  return <button onClick={toggle}>Switch to {theme === 'light' ? 'dark' : 'light'}</button>;
}`,
      playground: {
        jsx: `const { createContext, useContext, useState } = React;
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

function Header() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>My App</h2>
      <button onClick={toggle}>Switch to {theme === 'light' ? 'dark' : 'light'}</button>
    </header>
  );
}

function Card() {
  const { theme } = useContext(ThemeContext);
  return (
    <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: '1px solid #888' }}>
      This card has no props, but it knows the theme is <b>{theme}</b>.
    </div>
  );
}

function Page() {
  const { theme } = useContext(ThemeContext);
  const styles = theme === 'light'
    ? { background: '#ffffff', color: '#111111' }
    : { background: '#1e1e2e', color: '#f1f1f1' };
  return (
    <div style={{ ...styles, padding: 24, minHeight: 200, fontFamily: 'sans-serif' }}>
      <Header />
      <Card />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}`,
      },
      result: 'A page with a "Switch to dark" button. Clicking it turns the background dark and the card text changes to "the theme is dark". Clicking again switches back.',
      explanation:
        'ThemeProvider owns the state. It passes an object { theme, toggle } as the context value. Header, Card and Page call useContext(ThemeContext) and get the same object, no props needed. When toggle runs, the state in ThemeProvider changes, the value changes, and every consumer re-renders with the new theme.',
    },
    {
      title: 'Avoiding prop drilling for the logged-in user',
      scenario: 'The user name is needed in a deeply nested Avatar component. First see the drilling version in the code, then the context version in the playground.',
      steps: [
        'Look at the prop-drilling version in the code block: user passes through Layout and Sidebar',
        'Create UserContext and wrap the tree in UserContext.Provider',
        'Remove the user prop from Layout and Sidebar',
        'Read the user directly inside Avatar with useContext',
        'Run and click "Log in as Riya"',
      ],
      code: `// BEFORE: prop drilling
function App() { const user = { name: 'Riya' }; return <Layout user={user} />; }
function Layout({ user }) { return <Sidebar user={user} />; }   // does not use user
function Sidebar({ user }) { return <Avatar user={user} />; }  // does not use user
function Avatar({ user }) { return <p>{user.name}</p>; }

// AFTER: context
const UserContext = React.createContext(null);
function App() {
  return (
    <UserContext.Provider value={{ name: 'Riya' }}>
      <Layout />
    </UserContext.Provider>
  );
}
function Avatar() { const user = React.useContext(UserContext); return <p>{user.name}</p>; }`,
      playground: {
        jsx: `const { createContext, useContext, useState } = React;
const UserContext = createContext(null);

function Avatar() {
  const { user, logout } = useContext(UserContext);
  if (!user) return <p>Not logged in</p>;
  return (
    <p>
      Hello, <b>{user.name}</b> <button onClick={logout}>Log out</button>
    </p>
  );
}
function Sidebar() { return <aside style={{ border: '1px dashed #999', padding: 8 }}><h4>Sidebar</h4><Avatar /></aside>; }
function Layout() { return <div style={{ padding: 8 }}><h3>Layout</h3><Sidebar /></div>; }

function App() {
  const [user, setUser] = useState(null);
  const value = { user, login: name => setUser({ name }), logout: () => setUser(null) };
  return (
    <UserContext.Provider value={value}>
      <div style={{ fontFamily: 'sans-serif' }}>
        {!user && <button onClick={() => value.login('Riya')}>Log in as Riya</button>}
        <Layout />
      </div>
    </UserContext.Provider>
  );
}`,
      },
      result: 'Initially "Not logged in" inside the Sidebar. After clicking "Log in as Riya" the Avatar shows "Hello, Riya" with a Log out button.',
      explanation:
        'Layout and Sidebar no longer know about the user at all. Only the Provider (App) and the consumer (Avatar) care about the data. This makes middle components simpler and reusable.',
    },
    {
      title: 'Nested Providers and the default value',
      scenario: 'Show that a component reads the nearest Provider, and falls back to the default value when no Provider exists.',
      steps: [
        "Create ColorContext with default value 'gray'",
        'Render one Swatch outside any Provider',
        "Render one Swatch inside a Provider with value 'tomato'",
        "Render one Swatch inside a nested Provider with value 'teal'",
        'Run and compare the three swatches',
      ],
      code: `const ColorContext = React.createContext('gray');

<Swatch />                                       // gray (default)
<ColorContext.Provider value="tomato">
  <Swatch />                                     // tomato
  <ColorContext.Provider value="teal">
    <Swatch />                                   // teal (nearest wins)
  </ColorContext.Provider>
</ColorContext.Provider>`,
      playground: {
        jsx: `const ColorContext = React.createContext('gray');

function Swatch({ label }) {
  const color = React.useContext(ColorContext);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 6 }}>
      <span style={{ width: 40, height: 24, background: color, display: 'inline-block', borderRadius: 4 }} />
      {label}: <code>{color}</code>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Swatch label="No provider" />
      <ColorContext.Provider value="tomato">
        <Swatch label="Outer provider" />
        <ColorContext.Provider value="teal">
          <Swatch label="Nested provider" />
        </ColorContext.Provider>
      </ColorContext.Provider>
    </div>
  );
}`,
      },
      result: 'Three rows: gray (no provider), tomato (outer provider), teal (nested provider).',
      explanation:
        'useContext walks up the tree and stops at the first matching Provider. If none is found it returns the default value given to createContext.',
    },
    {
      title: 'Custom hook with a safety check',
      scenario: 'Wrap useContext in a custom hook useCart() that throws a clear error if someone forgets the Provider.',
      steps: [
        'Create CartContext with default null',
        'Write CartProvider holding an items array in state',
        'Write useCart() that reads the context and throws if it is null',
        'Use useCart() in ProductList and CartBadge',
        'Run and add products',
      ],
      code: `function useCart() {
  const ctx = React.useContext(CartContext);
  if (ctx === null) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}`,
      playground: {
        jsx: `const { createContext, useContext, useState } = React;
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = product => setItems(prev => [...prev, product]);
  const clear = () => setItems([]);
  return <CartContext.Provider value={{ items, add, clear }}>{children}</CartContext.Provider>;
}

function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === null) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

function CartBadge() {
  const { items, clear } = useCart();
  const total = items.reduce((sum, p) => sum + p.price, 0);
  return <p>Cart: {items.length} items, total Rs {total} <button onClick={clear}>Clear</button></p>;
}

function ProductList() {
  const { add } = useCart();
  const products = [{ id: 1, name: 'Pen', price: 20 }, { id: 2, name: 'Notebook', price: 60 }, { id: 3, name: 'Bag', price: 900 }];
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} - Rs {p.price} <button onClick={() => add(p)}>Add</button></li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <CartProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <CartBadge />
        <ProductList />
      </div>
    </CartProvider>
  );
}`,
      },
      result: 'A product list with Add buttons. The cart badge at the top updates its count and total every time you add a product.',
      explanation:
        'The custom hook hides the context object from consumers and gives a meaningful error if the Provider is missing. This is the pattern used in most professional React code bases.',
    },
  ],
  interview: [
    { q: 'What is prop drilling?', a: 'Prop drilling is passing data through several layers of components that do not need it, only so that a deeply nested component can receive it. It makes components harder to reuse and maintain.', level: 'Easy' },
    { q: 'What is the Context API in React?', a: 'Context is a built-in React feature that lets a parent component make a value available to every component below it in the tree, without passing props manually at every level. It consists of createContext, a Provider and a way to consume (useContext).', level: 'Easy' },
    { q: 'What are the steps to use context?', a: '1) Create it: const C = React.createContext(default). 2) Provide it: <C.Provider value={x}>...</C.Provider>. 3) Consume it in a child: const x = useContext(C).', level: 'Easy' },
    { q: 'When is the default value of createContext used?', a: 'Only when a component calls useContext and there is no matching Provider above it in the tree. It is not used when a Provider exists with value={undefined}.', level: 'Medium' },
    { q: 'If there are nested Providers of the same context, which value does a consumer get?', a: 'The value of the nearest Provider above the consumer in the component tree.', level: 'Medium' },
    { q: 'Does context replace state management?', a: 'No. Context only transports a value through the tree. The state itself still lives in useState or useReducer inside some component (usually a provider component). Context + useReducer can act as a simple global store.', level: 'Medium' },
    { q: 'Why might all consumers re-render even when the data did not change?', a: 'If the Provider value is an object or function created inline (value={{ a, b }}), a new reference is created on every render of the provider, so React considers the value changed and re-renders all consumers. Fix by memoizing with useMemo/useCallback or by keeping the provider component stable.', level: 'Hard' },
    { q: 'How can you update context from a child component?', a: 'Put state in the provider component and pass a setter or an action function as part of the context value, e.g. value={{ theme, toggleTheme }}. The child calls toggleTheme().', level: 'Medium' },
    { q: 'When should you NOT use context?', a: 'When data only travels 1-2 levels (use props), when component composition (passing children) removes the drilling, or when data changes very frequently and many consumers would re-render.', level: 'Medium' },
    { q: 'What is Context.Consumer?', a: 'The pre-hooks render-prop API: <C.Consumer>{value => ...}</C.Consumer>. It still works but useContext is preferred in function components.', level: 'Easy' },
    { q: 'Why do people wrap useContext in a custom hook like useAuth()?', a: 'It hides the context object, gives a nicer API, and can throw a descriptive error if the hook is used outside the Provider.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a LanguageContext with values "en" and "hi". Show a greeting ("Hello" / "Namaste") in a nested component and a button to switch the language.',
      hint: 'Store the language in useState inside App and pass { lang, setLang } as the value.',
      solution: `const LanguageContext = React.createContext(null);

function Greeting() {
  const { lang } = React.useContext(LanguageContext);
  return <h2>{lang === 'en' ? 'Hello' : 'Namaste'}</h2>;
}

function Switcher() {
  const { lang, setLang } = React.useContext(LanguageContext);
  return <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>Language: {lang}</button>;
}

function App() {
  const [lang, setLang] = React.useState('en');
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <Switcher />
      <Greeting />
    </LanguageContext.Provider>
  );
}`,
    },
    {
      task: 'Build an AuthProvider with login(name) and logout(). Show a LoginButton and a Navbar that displays "Welcome, NAME" when logged in.',
      hint: 'Write a useAuth() custom hook that throws when used outside AuthProvider.',
      solution: `const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const login = name => setUser({ name });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

function Navbar() {
  const { user } = useAuth();
  return <nav>{user ? 'Welcome, ' + user.name : 'Guest'}</nav>;
}

function LoginButton() {
  const { user, login, logout } = useAuth();
  return user
    ? <button onClick={logout}>Logout</button>
    : <button onClick={() => login('Aman')}>Login</button>;
}

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <LoginButton />
    </AuthProvider>
  );
}`,
    },
    {
      task: 'Make a font-size context. Buttons "A-" and "A+" change the size, and three paragraphs in different nested components use it.',
      hint: 'Context value: { size, setSize }. Paragraph style: { fontSize: size }.',
      solution: `const FontContext = React.createContext(null);

function Para({ children }) {
  const { size } = React.useContext(FontContext);
  return <p style={{ fontSize: size }}>{children}</p>;
}

function Controls() {
  const { size, setSize } = React.useContext(FontContext);
  return (
    <div>
      <button onClick={() => setSize(s => Math.max(10, s - 2))}>A-</button>
      <span> {size}px </span>
      <button onClick={() => setSize(s => Math.min(40, s + 2))}>A+</button>
    </div>
  );
}

function Article() {
  return <section><Para>First paragraph</Para><Para>Second paragraph</Para></section>;
}

function App() {
  const [size, setSize] = React.useState(16);
  return (
    <FontContext.Provider value={{ size, setSize }}>
      <Controls />
      <Article />
      <Para>Third paragraph</Para>
    </FontContext.Provider>
  );
}`,
    },
    {
      task: 'Demonstrate nested Providers: the whole page uses theme "light" but a Sidebar section overrides it with "dark". A ThemedBox component shows which theme it received.',
      hint: 'Wrap the sidebar in a second ThemeContext.Provider.',
      solution: `const ThemeContext = React.createContext('light');

function ThemedBox() {
  const theme = React.useContext(ThemeContext);
  const style = theme === 'dark'
    ? { background: '#222', color: '#fff', padding: 8 }
    : { background: '#eee', color: '#000', padding: 8 };
  return <div style={style}>Theme: {theme}</div>;
}

function App() {
  return (
    <ThemeContext.Provider value="light">
      <ThemedBox />
      <aside>
        <ThemeContext.Provider value="dark">
          <ThemedBox />
        </ThemeContext.Provider>
      </aside>
    </ThemeContext.Provider>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which function creates a new context object?',
      options: ['React.useContext()', 'React.createContext()', 'React.makeContext()', 'React.Provider()'],
      answer: 1,
      explanation: 'React.createContext(defaultValue) creates the context object. useContext is used to read it.',
    },
    {
      question: 'A component calls useContext(ThemeContext) but there is no ThemeContext.Provider above it. What does it receive?',
      options: ['undefined always', 'An error is thrown by React', 'null always', 'The default value passed to createContext'],
      answer: 3,
      explanation: 'Without a Provider, the default value from createContext(defaultValue) is returned.',
    },
    {
      question: 'What problem does Context mainly solve?',
      options: ['Prop drilling', 'Slow network requests', 'CSS conflicts', 'Routing between pages'],
      answer: 0,
      explanation: 'Context avoids passing props through many intermediate components (prop drilling).',
    },
    {
      question: 'Where does the changing data (e.g. the current theme) actually live when using context?',
      options: ['Inside the context object itself', 'In the browser localStorage', 'In useState/useReducer of the provider component', 'In the default value'],
      answer: 2,
      explanation: 'Context only transports a value. The state is stored in a component, usually the provider component.',
    },
    {
      question: 'With nested Providers of the same context, which value does a consumer read?',
      options: ['The outermost Provider', 'The nearest Provider above it', 'A merge of all values', 'The default value'],
      answer: 1,
      explanation: 'The closest Provider above the consumer in the tree wins.',
    },
  ],
};
