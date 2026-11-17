export default {
  id: 'day-28-react-typescript-basics',
  title: 'React with TypeScript Basics: Typing Props, State, Events, Hooks and Context',
  module: 'Module 5: Advanced React',
  day: 28,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'TypeScript adds static types to JavaScript so many bugs are caught in the editor before the code runs. Learn how to start a React + TypeScript project with Vite and how to type props, children, state, events, refs, reducers, context and generic components.',
  objectives: [
    'Explain what TypeScript adds and why most React teams use it',
    'Create a React + TS project with Vite and understand .tsx files',
    'Type component props (optional, default, union, children) with type/interface',
    'Type useState, useRef, useReducer (discriminated unions), events and context',
    'Write a simple generic component',
  ],
  theory: [
    {
      heading: 'Why TypeScript?',
      content:
        'JavaScript only finds many mistakes at **runtime**: you pass `"5"` instead of `5`, misspell a prop, or forget that `user` can be `null`, and the app crashes in the user\'s browser.\n\n**TypeScript** (TS) is JavaScript + **types**. The TS compiler checks your code **before it runs** and the editor shows red underlines and smart autocomplete.\n\nBenefits in React:\n- Wrong or missing props are flagged immediately\n- Autocomplete for props, state and API data shapes\n- Safer refactoring: rename a prop and every usage is checked\n- Types act as documentation for teammates\n\nAnalogy: TypeScript is a spell-checker for your code\'s data. It does not change what you write; it warns you before you send the letter.\n\nTypes are **erased** at build time: the browser still runs plain JavaScript.',
    },
    {
      heading: 'Setup with Vite',
      content:
        '`npm create vite@latest my-app -- --template react-ts`\n\nYou get:\n- `.tsx` files for components (TS + JSX) and `.ts` for plain logic\n- `tsconfig.json` with `"strict": true` (keep it on)\n- `@types/react` and `@types/react-dom` with React\'s type definitions\n\nNote: Vite only **strips** types when running; run `npx tsc --noEmit` (the template\'s build script already does `tsc -b`) to type-check.\n\nAbout the playground: the in-browser playground runs JavaScript JSX only, so the playground examples show the **same components with the types removed** and comments where the types would be. Use the `code` blocks (TypeScript) in a Vite react-ts project.',
    },
    {
      heading: 'Typing props and children',
      content:
        'Describe props with a `type` alias or an `interface` and annotate the destructured parameter.\n\n- Optional prop: `subtitle?: string`\n- Default value: in destructuring `({ size = \'md\' })`\n- Union of allowed values: `variant: \'primary\' | \'danger\'` (autocomplete + errors on typos)\n- Functions: `onClick: () => void`, `onSelect: (id: number) => void`\n- Children: `children: React.ReactNode` (anything renderable)\n- Extending native element props: `React.ComponentProps<\'button\'>` or `React.ButtonHTMLAttributes<HTMLButtonElement>`\n\n`type` vs `interface`: both work for props. Interfaces can be extended/merged; types can express unions. Pick one convention per project.',
      syntax:
        "type ButtonProps = {\n  label: string;\n  variant?: 'primary' | 'danger';\n  onClick: () => void;\n};\n\nfunction Button({ label, variant = 'primary', onClick }: ButtonProps) {\n  return <button className={variant} onClick={onClick}>{label}</button>;\n}\n\ntype CardProps = { title: string; children: React.ReactNode };\nfunction Card({ title, children }: CardProps) {\n  return <section><h2>{title}</h2>{children}</section>;\n}",
      tip: 'Avoid React.FC for new code; typing the props parameter directly is simpler and the community standard.',
    },
    {
      heading: 'Typing state, refs and events',
      content:
        '**useState** infers the type from the initial value: `useState(0)` is `number`. Give a generic when the initial value does not show the full type:\n- `useState<User | null>(null)`\n- `useState<string[]>([])`\n\n**useRef** for DOM elements: `useRef<HTMLInputElement>(null)`; use `ref.current?.focus()` because current may be null.\n\n**Events**: use React\'s event types:\n- `React.ChangeEvent<HTMLInputElement>` for input onChange\n- `React.FormEvent<HTMLFormElement>` for form onSubmit\n- `React.MouseEvent<HTMLButtonElement>` for clicks\n\nTip: when writing inline handlers (`onChange={e => ...}`), TS infers the event type automatically.',
      syntax:
        "type User = { id: number; name: string; email: string };\n\nconst [user, setUser] = useState<User | null>(null);\nconst inputRef = useRef<HTMLInputElement>(null);\n\nfunction handleChange(e: React.ChangeEvent<HTMLInputElement>) {\n  setName(e.target.value);\n}\nfunction handleSubmit(e: React.FormEvent<HTMLFormElement>) {\n  e.preventDefault();\n}",
    },
    {
      heading: 'Reducers with discriminated unions, and typed context',
      content:
        'For useReducer, describe actions as a **discriminated union**: each action has a literal `type`, and TS knows which payload exists in each case.\n\nFor context, give createContext a type. A common pattern is `createContext<AuthValue | null>(null)` plus a custom hook that throws when null, so consumers get a non-null type.',
      syntax:
        "type State = { count: number };\ntype Action =\n  | { type: 'increment' }\n  | { type: 'add'; amount: number }\n  | { type: 'reset' };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'add': return { count: state.count + action.amount }; // amount is known here\n    case 'reset': return { count: 0 };\n  }\n}\n\ntype AuthValue = { user: User | null; login: (u: User) => void; logout: () => void };\nconst AuthContext = createContext<AuthValue | null>(null);\nexport function useAuth() {\n  const ctx = useContext(AuthContext);\n  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');\n  return ctx;          // type: AuthValue (not null)\n}",
    },
    {
      heading: 'Generic components and typing API data',
      content:
        'A **generic** component works with any item type while keeping type safety, like a `List<T>` that renders any array with a `renderItem` function.\n\nFor API data, write a type for the response and annotate: `const data: Post[] = await res.json();`. Note that TS **trusts** this annotation; it does not check real data at runtime. For untrusted data use a runtime validator like Zod (`z.infer<typeof schema>` gives the type).\n\nComing next: Day 29 covers building and deploying the app.',
      syntax:
        "type ListProps<T> = {\n  items: T[];\n  renderItem: (item: T) => React.ReactNode;\n  getKey: (item: T) => string | number;\n};\n\nfunction List<T>({ items, renderItem, getKey }: ListProps<T>) {\n  return <ul>{items.map(item => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\n}\n\n<List items={users} getKey={u => u.id} renderItem={u => u.name} />   // u is User",
    },
  ],
  examples: [
    {
      title: 'Typed Button and Card components',
      scenario: 'Create reusable Button and Card components with typed props, including a union variant and children.',
      steps: [
        'npm create vite@latest ts-demo -- --template react-ts',
        'Create Button.tsx with a ButtonProps type',
        'Create Card.tsx with children: React.ReactNode',
        'Use them in App.tsx and try passing variant="dangr": TS shows an error',
        'Run the playground: same components with the types removed',
      ],
      code: `// Button.tsx
type ButtonProps = {
  label: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  onClick: () => void;
};

export function Button({ label, variant = 'primary', disabled = false, onClick }: ButtonProps) {
  return (
    <button className={'btn btn-' + variant} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}

// Card.tsx
type CardProps = { title: string; children: React.ReactNode };
export function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

// App.tsx
<Card title="Danger zone">
  <Button label="Delete" variant="danger" onClick={() => alert('Deleted')} />
  {/* <Button label="Oops" variant="dangr" />  -> TS error: Type '"dangr"' is not assignable... and onClick is missing */}
</Card>`,
      playground: {
        jsx: `// TypeScript types removed for the JS playground. Comments show the TS types.

// type ButtonProps = { label: string; variant?: 'primary' | 'danger'; disabled?: boolean; onClick: () => void }
function Button({ label, variant = 'primary', disabled = false, onClick }) {
  const colors = { primary: '#2563eb', danger: '#dc2626' };
  return (
    <button disabled={disabled} onClick={onClick}
            style={{ background: colors[variant], color: 'white', border: 0, padding: '8px 14px', borderRadius: 6, marginRight: 8, opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );
}

// type CardProps = { title: string; children: React.ReactNode }
function Card({ title, children }) {
  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}

function App() {
  const [msg, setMsg] = React.useState('');
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Card title="Account">
        <Button label="Save" onClick={() => setMsg('Saved!')} />
        <Button label="Disabled" disabled onClick={() => {}} />
      </Card>
      <Card title="Danger zone">
        <Button label="Delete" variant="danger" onClick={() => setMsg('Deleted!')} />
      </Card>
      <p>{msg}</p>
    </div>
  );
}`,
      },
      result: 'Two cards: "Account" with a blue Save button and a faded disabled button, "Danger zone" with a red Delete button. Clicking shows "Saved!" or "Deleted!".',
      explanation:
        'In TypeScript, ButtonProps documents exactly what Button accepts. A typo in variant or a missing onClick becomes a compile error instead of a silent UI bug. The JS version behaves the same at runtime because types are erased.',
    },
    {
      title: 'Typed state, events, refs and a reducer with a discriminated union',
      scenario: 'A small expense tracker: a form (typed events + ref) adds expenses through a reducer with typed actions.',
      steps: [
        'Define Expense, State and Action types',
        'Write the reducer with a switch on action.type (TS narrows each case)',
        'Type the form handlers with React.FormEvent and React.ChangeEvent',
        'Use useRef<HTMLInputElement>(null) to focus the title input after adding',
        'Run the playground version',
      ],
      code: `type Expense = { id: number; title: string; amount: number };
type State = { expenses: Expense[] };
type Action =
  | { type: 'added'; expense: Expense }
  | { type: 'removed'; id: number }
  | { type: 'cleared' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'added':   return { expenses: [...state.expenses, action.expense] };
    case 'removed': return { expenses: state.expenses.filter(e => e.id !== action.id) };
    case 'cleared': return { expenses: [] };
  }
}

export default function Expenses() {
  const [state, dispatch] = useReducer(reducer, { expenses: [] });
  const [title, setTitle] = useState('');            // inferred: string
  const [amount, setAmount] = useState<number | ''>('');
  const titleRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || amount === '') return;
    dispatch({ type: 'added', expense: { id: Date.now(), title, amount } });
    setTitle(''); setAmount('');
    titleRef.current?.focus();
  }

  function handleAmount(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value === '' ? '' : Number(e.target.value));
  }
  // ...JSX
}`,
      playground: {
        jsx: `// Types removed; see the TypeScript version in the code block.
function reducer(state, action) {
  switch (action.type) {
    case 'added': return { expenses: [...state.expenses, action.expense] };
    case 'removed': return { expenses: state.expenses.filter(e => e.id !== action.id) };
    case 'cleared': return { expenses: [] };
    default: return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, { expenses: [] });
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const titleRef = React.useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || amount === '') return;
    dispatch({ type: 'added', expense: { id: Date.now(), title, amount: Number(amount) } });
    setTitle(''); setAmount('');
    if (titleRef.current) titleRef.current.focus();
  }

  const total = state.expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 360 }}>
      <form onSubmit={handleSubmit}>
        <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" style={{ width: 80 }} />
        <button>Add</button>
      </form>
      <ul>
        {state.expenses.map(e => (
          <li key={e.id}>{e.title}: Rs {e.amount} <button onClick={() => dispatch({ type: 'removed', id: e.id })}>x</button></li>
        ))}
      </ul>
      <p><b>Total: Rs {total}</b> <button onClick={() => dispatch({ type: 'cleared' })}>Clear</button></p>
    </div>
  );
}`,
      },
      result: 'Add expenses with a title and amount; they appear in the list with a running total. x removes one, Clear removes all, and focus returns to the title input after adding.',
      explanation:
        'In TS, dispatch({ type: "added" }) without an expense, or dispatch({ type: "remove" }) with a typo, would not compile. Inside case "removed", TS knows action.id exists. The ref type HTMLInputElement gives autocomplete for focus().',
    },
    {
      title: 'Generic List component and typed API data',
      scenario: 'A reusable List<T> renders users fetched from JSONPlaceholder, and the same List renders a list of strings.',
      steps: [
        'Define type User for the API response',
        'Write List<T> with items, getKey and renderItem props',
        'Fetch users with useState<User[]>([])',
        'Use List for users and for an array of strings',
        'Run the playground version',
      ],
      code: `type User = { id: number; name: string; email: string };

type ListProps<T> = {
  items: T[];
  getKey: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;
  emptyText?: string;
};

function List<T>({ items, getKey, renderItem, emptyText = 'Nothing here' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyText}</p>;
  return <ul>{items.map(item => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users?_limit=4')
      .then(r => r.json())
      .then((data: User[]) => setUsers(data));
  }, []);
  return (
    <>
      <List items={users} getKey={u => u.id} renderItem={u => <b>{u.name}</b>} emptyText="Loading..." />
      <List items={['React', 'TypeScript']} getKey={s => s} renderItem={s => s.toUpperCase()} />
    </>
  );
}`,
      playground: {
        jsx: `// function List<T>({ items, getKey, renderItem, emptyText }: ListProps<T>)  (types removed)
function List({ items, getKey, renderItem, emptyText = 'Nothing here' }) {
  if (items.length === 0) return <p>{emptyText}</p>;
  return <ul>{items.map(item => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

function App() {
  // const [users, setUsers] = useState<User[]>([]);
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users?_limit=4')
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h4>Users (T = User)</h4>
      <List items={users} getKey={u => u.id} renderItem={u => <span><b>{u.name}</b> - {u.email}</span>} emptyText="Loading..." />
      <h4>Skills (T = string)</h4>
      <List items={['React', 'TypeScript', 'Vite']} getKey={s => s} renderItem={s => s.toUpperCase()} />
    </div>
  );
}`,
      },
      result: '"Loading..." briefly, then four user names with emails. Below, a list of skills in capital letters, both rendered by the same List component.',
      explanation:
        'With generics, TypeScript infers T from items: in the first List, u is User (so u.name autocompletes); in the second, s is string. One component, full type safety for any data.',
    },
  ],
  interview: [
    { q: 'What is TypeScript and why use it with React?', a: 'A typed superset of JavaScript that compiles to JS. With React it catches wrong/missing props, null bugs and typos at compile time, improves autocomplete and makes refactoring safer.', level: 'Easy' },
    { q: 'What is the difference between .ts and .tsx?', a: '.tsx files may contain JSX; .ts files cannot. Components go in .tsx.', level: 'Easy' },
    { q: 'How do you type component props?', a: 'Define a type or interface for the props and annotate the parameter: function Button({ label }: ButtonProps). Use ? for optional props and default values in destructuring.', level: 'Easy' },
    { q: 'How do you type children?', a: 'children: React.ReactNode, which covers elements, strings, numbers, fragments, arrays, null and undefined.', level: 'Medium' },
    { q: 'type vs interface for props?', a: 'Both describe object shapes. Interfaces support declaration merging and extends; types support unions, intersections and mapped types. Either is fine for props; be consistent.', level: 'Medium' },
    { q: 'How do you type useState that starts as null?', a: 'Provide a generic: const [user, setUser] = useState<User | null>(null). Then narrow with if (user) before using its fields.', level: 'Medium' },
    { q: 'How do you type an input onChange handler?', a: '(e: React.ChangeEvent<HTMLInputElement>) => void. For form submit: React.FormEvent<HTMLFormElement>; clicks: React.MouseEvent<HTMLButtonElement>.', level: 'Medium' },
    { q: 'How do you type a DOM ref?', a: 'const ref = useRef<HTMLInputElement>(null); and access it safely with ref.current?.focus().', level: 'Medium' },
    { q: 'What is a discriminated union and why is it useful for reducers?', a: 'A union of object types sharing a literal "type" field. In a switch on action.type, TypeScript narrows to the matching member, so only valid payload fields are accessible and typos in action types are caught.', level: 'Hard' },
    { q: 'Does TypeScript validate API responses at runtime?', a: 'No. Types are erased at compile time; annotating res.json() as User[] is a promise to the compiler, not a check. Use runtime validation (e.g. Zod) for untrusted data.', level: 'Hard' },
    { q: 'What is a generic component?', a: 'A component parameterised by a type, e.g. function List<T>(props: ListProps<T>), so it works with any item type while preserving type safety in callbacks like renderItem.', level: 'Hard' },
    { q: 'Why is React.FC less recommended now?', a: 'Typing props directly is simpler and more explicit. React.FC historically added implicit children and had issues with generics and default props; the community moved to plain function signatures.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Type an Avatar component: src (string), alt (string), size (optional union "sm" | "md" | "lg", default "md"), and an optional onClick.',
      hint: 'Map sizes to pixel values with a Record<"sm"|"md"|"lg", number>.',
      solution: `type AvatarProps = {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
};

const SIZES: Record<'sm' | 'md' | 'lg', number> = { sm: 32, md: 48, lg: 96 };

export function Avatar({ src, alt, size = 'md', onClick }: AvatarProps) {
  const px = SIZES[size];
  return <img src={src} alt={alt} width={px} height={px} style={{ borderRadius: '50%' }} onClick={onClick} />;
}

// <Avatar src="https://picsum.photos/96" alt="Profile" size="lg" />`,
    },
    {
      task: 'Write a typed controlled LoginForm with state for email and password, typed change and submit handlers, and an onLogin prop of type (email: string, password: string) => void.',
      hint: 'React.ChangeEvent<HTMLInputElement>, React.FormEvent<HTMLFormElement>.',
      solution: `import { useState } from 'react';

type LoginFormProps = { onLogin: (email: string, password: string) => void };

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleEmail} placeholder="Email" />
      <input type="password" value={password} onChange={handlePassword} placeholder="Password" />
      <button>Login</button>
    </form>
  );
}`,
    },
    {
      task: 'Create a typed ThemeContext (theme: "light" | "dark", toggle: () => void) with a ThemeProvider and a useTheme hook that never returns null.',
      hint: 'createContext<ThemeValue | null>(null) and throw in useTheme when null.',
      solution: `import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeValue = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}`,
    },
    {
      task: 'Write a typed useFetch<T>(url) custom hook returning { data: T | null; loading: boolean; error: string | null } and use it for a list of posts.',
      hint: 'Make the hook generic: function useFetch<T>(url: string).',
      solution: `import { useEffect, useState } from 'react';

type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() as Promise<T>; })
      .then(data => setState({ data, loading: false, error: null }))
      .catch((err: Error) => { if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message }); });
    return () => controller.abort();
  }, [url]);
  return state;
}

type Post = { id: number; title: string };

export function Posts() {
  const { data, loading, error } = useFetch<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return <ul>{data?.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which Vite template creates a React + TypeScript project?',
      options: ['react', 'react-ts', 'typescript-react', 'tsx'],
      answer: 1,
      explanation: 'npm create vite@latest app -- --template react-ts.',
    },
    {
      question: 'What is the best type for a children prop that can be any renderable content?',
      options: ['string', 'JSX.Element[]', 'any', 'React.ReactNode'],
      answer: 3,
      explanation: 'ReactNode covers elements, text, numbers, arrays, null and more.',
    },
    {
      question: 'How do you type state that may be a User or null?',
      options: ['useState<User | null>(null)', 'useState(null as User)', 'useState<User>()', 'useState(User)'],
      answer: 0,
      explanation: 'Use a generic union to include null.',
    },
    {
      question: 'Which event type is correct for an input\'s onChange handler?',
      options: ['React.MouseEvent<HTMLInputElement>', 'Event', 'React.ChangeEvent<HTMLInputElement>', 'React.FormEvent<HTMLButtonElement>'],
      answer: 2,
      explanation: 'ChangeEvent with the input element type gives e.target.value typed as string.',
    },
    {
      question: 'Are TypeScript types checked when the app runs in the browser?',
      options: ['Yes, always', 'No, types are erased at build time', 'Only in Chrome', 'Only for props'],
      answer: 1,
      explanation: 'TS checks at compile time; the browser runs plain JavaScript.',
    },
  ],
};
