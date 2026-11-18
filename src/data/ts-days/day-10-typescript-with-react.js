export default {
  id: 'day-10-typescript-with-react',
  title: 'TypeScript with React: Props, children, Events, Hooks, Context and Generic Components',
  module: 'Module 3: TypeScript in the MERN Stack',
  day: 10,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'React + TypeScript is the default stack in most frontend and MERN jobs. Today you type component props and children, DOM events and forms, the main hooks (useState, useRef, useEffect, useReducer, useContext), build a safe typed Context, and write generic components that work with any data.',
  objectives: [
    'Type component props, optional/default props, callback props and children',
    'Extend native HTML element props with ComponentProps',
    'Type event handlers and controlled forms',
    'Type useState, useRef, useReducer and useContext correctly',
    'Build generic, reusable components like List<T>',
  ],
  theory: [
    {
      heading: 'Setup: React + TypeScript with Vite',
      content: `Create a project with \`npm create vite@latest my-app -- --template react-ts\`. You get:
- \`.tsx\` files for components (TypeScript + JSX); plain logic files stay \`.ts\`
- \`tsconfig.app.json\` with \`strict\`, \`jsx: "react-jsx"\`, \`moduleResolution: "Bundler"\` and \`verbatimModuleSyntax\`
- \`@types/react\` and \`@types/react-dom\` (React 19 types)

Vite only strips types (fast). The \`npm run build\` script runs \`tsc -b\` first, so type errors fail the build. Your editor shows errors as you type.

Notes for React 19 types:
- \`ref\` is a normal prop for function components (no \`forwardRef\` needed)
- \`useRef\` requires an initial value: \`useRef<HTMLInputElement>(null)\`
- The global \`JSX\` namespace is gone; use \`React.JSX.Element\` if you need it (you rarely do: let TypeScript infer component return types)`,
    },
    {
      heading: 'Typing props and children',
      content: `Props are just a function parameter, so you type them with a \`type\` or \`interface\` and destructure:

\`function CourseCard({ title, price, level = "beginner" }: CourseCardProps) { ... }\`

- Optional prop: \`level?: "beginner" | "advanced"\` with a default value in the destructuring
- Callback prop: \`onEnroll: (id: string) => void\`
- Children: \`children: ReactNode\` (anything React can render: elements, strings, numbers, arrays, null). Use \`ReactElement\` only if you require exactly one element.
- Style: \`style?: CSSProperties\`

**Avoid \`React.FC\`** in new code: it used to add implicit children and makes generics awkward. Plain functions with typed props are the community standard.

**Native props:** to build a Button that accepts every \`<button>\` attribute, extend \`ComponentProps<"button">\` (or \`ComponentPropsWithoutRef<"button">\`) and spread the rest: \`{ variant, ...rest }\`.`,
      syntax: `import type { ReactNode, ComponentProps } from "react";

type CardProps = { title: string; children: ReactNode };
type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "danger" };`,
    },
    {
      heading: 'Typing events and forms',
      content: `React passes its own **synthetic events**, typed with generics that say which element fired them:

- \`ChangeEvent<HTMLInputElement>\` for \`onChange\` on inputs (\`HTMLSelectElement\`, \`HTMLTextAreaElement\` for others)
- \`FormEvent<HTMLFormElement>\` for \`onSubmit\`
- \`MouseEvent<HTMLButtonElement>\` for \`onClick\`
- \`KeyboardEvent<HTMLInputElement>\` for \`onKeyDown\`

Trick: if you write the handler **inline** (\`onChange={(e) => ...}\`), \`e\` is typed automatically. When you extract it into a named function, hover the \`onChange\` prop in VS Code to see the exact type to use.

Import these event types from "react", not the DOM's global \`MouseEvent\` which is a different type.`,
      tip: '`e.target.value` is always a `string`, even for `type="number"` inputs. Convert with `Number()` or use `e.target.valueAsNumber`.',
    },
    {
      heading: 'Typing hooks: useState, useRef, useEffect, useReducer',
      content: `- **useState** infers from the initial value: \`useState(0)\` → number. Pass a type when the initial value does not show the full type: \`useState<User | null>(null)\`, \`useState<string[]>([])\`.
- **useRef for DOM**: \`useRef<HTMLInputElement>(null)\`; then \`ref.current\` is \`HTMLInputElement | null\`, so use \`ref.current?.focus()\`.
- **useRef for mutable values**: \`useRef<number | undefined>(undefined)\` for timer ids and similar values that should not cause re-renders.
- **useEffect** needs no types; just return a cleanup function or nothing (never return a Promise: do not make the effect callback async).
- **useReducer**: type the state and use a **discriminated union** for actions. Inside each \`case\`, the action is narrowed, so \`action.id\` exists only for actions that have it.
- **Custom hooks** are plain functions: return a typed object, or a tuple with \`as const\` so \`[value, setValue]\` keeps per-position types.`,
    },
    {
      heading: 'Typing Context safely',
      content: `\`createContext\` needs a default value. A clean pattern:

1. \`const AuthContext = createContext<AuthContextValue | undefined>(undefined);\`
2. A Provider component that holds the state and passes the value
3. A custom hook \`useAuth()\` that throws if the context is undefined, so every consumer gets a non-undefined type and a clear error if the Provider is missing

This avoids fake default objects like \`createContext({} as AuthContextValue)\`, which lie to the compiler.

In React 19 you can render \`<AuthContext value={...}>\` directly; \`<AuthContext.Provider value={...}>\` still works.`,
    },
    {
      heading: 'Generic components',
      content: `A component can be generic just like a function: \`function List<T>({ items, renderItem }: ListProps<T>)\`. When you use \`<List items={courses} renderItem={(c) => c.title} />\`, TypeScript infers \`T = Course\`, so \`c\` is fully typed inside the callback.

Common generic components: List/Table with columns, Select/Dropdown with options, Autocomplete, DataGrid, Paginated views.

In a \`.tsx\` file a generic **arrow function** needs \`<T,>\` instead of \`<T>\` (or use a function declaration, which has no such issue).`,
      tip: 'Do not type everything manually. Let TypeScript infer component return types and inline handler types; annotate props, state that starts empty/null, refs, and reducer actions.',
    },
  ],
  examples: [
    {
      title: 'Props, children, callback props and native button props',
      scenario: 'A course card with optional and callback props, a Button that accepts every native <button> attribute, and a Section wrapper with children.',
      steps: [
        'Create a Vite react-ts app',
        'Add src/components/CourseCard.tsx with this code',
        'Run `npx tsc --noEmit -p tsconfig.app.json` (no errors)',
        'Hover `rest` in Button: it contains onClick, disabled, type and all other button props',
      ],
      code: `// Typing props, children, optional/default props and native HTML props
import type { ComponentProps, ReactNode } from "react";

type CourseCardProps = {
  title: string;
  price: number;
  level?: "beginner" | "intermediate" | "advanced"; // optional
  tags?: string[];
  onEnroll: (title: string) => void;               // callback prop
  children?: ReactNode;                            // anything React can render
};

export function CourseCard({ title, price, level = "beginner", tags = [], onEnroll, children }: CourseCardProps) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>
        ₹{price.toLocaleString("en-IN")} · {level}
      </p>
      {tags.length > 0 && <small>{tags.join(", ")}</small>}
      {children}
      <button onClick={() => onEnroll(title)}>Enroll</button>
    </article>
  );
}

// Extend the props of a native <button>: gets onClick, disabled, type, aria-* ... for free
type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "danger";
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return <button className={\`btn btn-\${variant} \${className}\`} {...rest} />;
}

// Wrapper component that only needs children
export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2>{heading}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <Section heading="Popular courses">
      <CourseCard title="TypeScript for MERN" price={2999} tags={["TS", "React"]} onEnroll={(t) => alert(t)}>
        <p>12 days · certificate included</p>
      </CourseCard>
      <Button variant="danger" disabled type="button">
        Delete
      </Button>
    </Section>
  );
}`,
      result: 'Type-checks with no errors (strict, React 19 types). The page shows the Popular courses section with one course card (₹2,999 · beginner · TS, React · 12 days) and a disabled Delete button. Clicking Enroll alerts the course title.',
      explanation: '`CourseCardProps` documents the component\'s API: `level` and `tags` are optional with defaults, `onEnroll` is a typed callback, and `children` accepts any renderable content. `ComponentProps<"button"> & {...}` merges all native button props with a custom `variant`, and `...rest` forwards them, so `disabled` and `type` are type-checked too.',
    },
    {
      title: 'Prop mistakes caught at compile time',
      scenario: 'Three common mistakes when using a component: a missing required prop, a wrong prop type and an invalid literal value.',
      steps: [
        'Create Mistakes.tsx',
        'Run `npx tsc --noEmit`',
        'Read the three errors',
      ],
      code: `type CourseCardProps = {
  title: string;
  price: number;
  level?: "beginner" | "advanced";
};

function CourseCard({ title, price, level = "beginner" }: CourseCardProps) {
  return <h3>{title} - ₹{price} ({level})</h3>;
}

export function App() {
  return (
    <>
      <CourseCard title="React" />
      <CourseCard title="Node" price="999" />
      <CourseCard title="Mongo" price={999} level="expert" />
    </>
  );
}`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2741: Property 'price' is missing in type '{ title: string; }' but required in type 'CourseCardProps'.
error TS2322: Type 'string' is not assignable to type 'number'.
error TS2322: Type '"expert"' is not assignable to type '"beginner" | "advanced" | undefined'.`,
      explanation: 'In plain React JS all three would render something wrong silently ("undefined", string concatenation, an unknown level). With TypeScript the props type is a contract checked at every usage: `price` is required, must be a number (use `price={999}`, not a string), and `level` only accepts the listed literals.',
    },
    {
      title: 'Typed events, controlled form, useState, useRef and useEffect',
      scenario: 'A signup form that focuses the first input, handles inputs and a select with one handler, and posts to an API.',
      steps: [
        'Create SignupPage.tsx',
        'Type-check with `npx tsc --noEmit`',
        'Run the app, fill the form and submit (jsonplaceholder returns a fake user with id 11)',
      ],
      code: `// Events, forms and hooks: useState, useRef, useEffect
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type SignupForm = { name: string; email: string; course: "mern" | "java" };
type User = { id: number; name: string; email: string };

export function SignupPage() {
  // Type inferred from the initial value
  const [form, setForm] = useState<SignupForm>({ name: "", email: "", course: "mern" });
  // Initial value null: we must pass the type explicitly
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  // DOM ref: starts as null, React fills it after render
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInput.current?.focus(); // current is HTMLInputElement | null
  }, []);

  // One handler for inputs and selects
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const created = (await res.json()) as User; // trust boundary
      setUser(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameInput} name="name" value={form.name} onChange={handleChange} />
      <input name="email" type="email" value={form.email} onChange={handleChange} />
      <select name="course" value={form.course} onChange={handleChange}>
        <option value="mern">MERN</option>
        <option value="java">Java</option>
      </select>
      <button type="submit">Sign up</button>
      {error && <p role="alert">{error}</p>}
      {user && <p>Welcome, {user.name} (id {user.id})</p>}
    </form>
  );
}`,
      result: 'Type-checks with no errors. On load the name input is focused. After submitting, the page shows "Welcome, <your name> (id 11)" because jsonplaceholder echoes the body and adds id 11; on a network failure the error message is shown.',
      explanation: '`useState<User | null>(null)` is needed because `null` alone does not tell TypeScript about User. `useRef<HTMLInputElement>(null)` gives a ref whose `current` may be null, so we use `?.`. `ChangeEvent<HTMLInputElement | HTMLSelectElement>` lets one handler serve both inputs and the select. `FormEvent<HTMLFormElement>` types the submit event. The `as User` cast marks the network trust boundary.',
    },
    {
      title: 'A typed reducer for useReducer',
      scenario: 'Shopping cart logic written as a pure reducer with a discriminated union of actions. It is plain TypeScript, so we can run it without React.',
      steps: [
        'Create src/state/cartReducer.ts',
        'Run it with tsx or the playground',
        'In a component use `const [cart, dispatch] = useReducer(cartReducer, initialCart);`',
        'Try `dispatch({ type: "remove" })`: error, `id` is missing',
      ],
      code: `// cartReducer.ts - a fully typed reducer for useReducer (pure TS, no JSX)
export type CartItem = { id: string; title: string; price: number; qty: number };

export type CartState = { items: CartItem[]; coupon: string | null };

export type CartAction =
  | { type: "add"; item: Omit<CartItem, "qty"> }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "applyCoupon"; code: string }
  | { type: "clear" };

export const initialCart: CartState = { items: [], coupon: null };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "remove":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "setQty":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i)),
      };
    case "applyCoupon":
      return { ...state, coupon: action.code.toUpperCase() };
    case "clear":
      return initialCart;
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}

export function cartTotal(state: CartState): number {
  const sum = state.items.reduce((t, i) => t + i.price * i.qty, 0);
  return state.coupon === "SAVE10" ? sum * 0.9 : sum;
}

// In a component: const [cart, dispatch] = useReducer(cartReducer, initialCart);
// Here we call the reducer directly to see it work:
const actions: CartAction[] = [
  { type: "add", item: { id: "c1", title: "React Course", price: 1999 } },
  { type: "add", item: { id: "c2", title: "Node Course", price: 1499 } },
  { type: "add", item: { id: "c1", title: "React Course", price: 1999 } },
  { type: "setQty", id: "c2", qty: 3 },
  { type: "applyCoupon", code: "save10" },
];

let state = initialCart;
for (const a of actions) {
  state = cartReducer(state, a);
  console.log(a.type.padEnd(12), state.items.map((i) => \`\${i.id}x\${i.qty}\`).join(" "), "| total", cartTotal(state));
}`,
      playground: {
        html: '<p>Open the console</p>',
        js: `const initialCart = { items: [], coupon: null };
function cartReducer(state, action) {
    switch (action.type) {
        case "add": {
            const existing = state.items.find((i) => i.id === action.item.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)),
                };
            }
            return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
        }
        case "remove":
            return { ...state, items: state.items.filter((i) => i.id !== action.id) };
        case "setQty":
            return {
                ...state,
                items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i)),
            };
        case "applyCoupon":
            return { ...state, coupon: action.code.toUpperCase() };
        case "clear":
            return initialCart;
        default: {
            const unhandled = action;
            return unhandled;
        }
    }
}
function cartTotal(state) {
    const sum = state.items.reduce((t, i) => t + i.price * i.qty, 0);
    return state.coupon === "SAVE10" ? sum * 0.9 : sum;
}
// In a component: const [cart, dispatch] = useReducer(cartReducer, initialCart);
// Here we call the reducer directly to see it work:
const actions = [
    { type: "add", item: { id: "c1", title: "React Course", price: 1999 } },
    { type: "add", item: { id: "c2", title: "Node Course", price: 1499 } },
    { type: "add", item: { id: "c1", title: "React Course", price: 1999 } },
    { type: "setQty", id: "c2", qty: 3 },
    { type: "applyCoupon", code: "save10" },
];
let state = initialCart;
for (const a of actions) {
    state = cartReducer(state, a);
    console.log(a.type.padEnd(12), state.items.map((i) => \`\${i.id}x\${i.qty}\`).join(" "), "| total", cartTotal(state));
}`,
      },
      result: `Console output:
add          c1x1 | total 1999
add          c1x1 c2x1 | total 3498
add          c1x2 c2x1 | total 5497
setQty       c1x2 c2x3 | total 8495
applyCoupon  c1x2 c2x3 | total 7645.5`,
      explanation: '`CartAction` is a discriminated union on `type`. Inside each `case`, TypeScript narrows `action`, so `action.item` exists only for "add" and `action.qty` only for "setQty". The `never` check fails to compile if a new action type is added but not handled. Keeping the reducer pure and typed makes it easy to unit-test.',
    },
    {
      title: 'Typed Context with a safe hook, and a generic List component',
      scenario: 'An auth context used across the app, and a reusable List that renders any kind of item.',
      steps: [
        'Create AuthContext.tsx and List.tsx (shown together here)',
        'Wrap the app in <AuthProvider>',
        'Use `useAuth()` in any component',
        'Type-check with `npx tsc --noEmit`',
      ],
      code: `// Typed Context with a safe custom hook + a generic List component
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// ---------- Context ----------
type AuthUser = { id: string; name: string; role: "student" | "admin" };

type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

// undefined default = "no provider above me"
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const value: AuthContextValue = {
    user,
    login: setUser,
    logout: () => setUser(null),
  };
  return <AuthContext value={value}>{children}</AuthContext>; // React 19: context as provider
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx; // narrowed: AuthContextValue (never undefined)
}

// ---------- Generic component ----------
type ListProps<T> = {
  items: T[];
  getKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  emptyText?: string;
};

export function List<T>({ items, getKey, renderItem, emptyText = "Nothing here" }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyText}</p>;
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// ---------- Usage ----------
type Course = { id: number; title: string; seats: number };
const courses: Course[] = [
  { id: 1, title: "React", seats: 12 },
  { id: 2, title: "Node", seats: 0 },
];

function Header() {
  const { user, login, logout } = useAuth();
  return user ? (
    <button onClick={logout}>Logout {user.name}</button>
  ) : (
    <button onClick={() => login({ id: "u1", name: "Asha", role: "student" })}>Login</button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Header />
      {/* T is inferred as Course, so \`c\` is fully typed */}
      <List items={courses} getKey={(c) => c.id} renderItem={(c) => \`\${c.title} (\${c.seats} seats)\`} />
    </AuthProvider>
  );
}`,
      result: 'Type-checks with no errors. The header shows a Login button; clicking it logs in Asha and shows "Logout Asha". The list renders "React (12 seats)" and "Node (0 seats)". Using useAuth() outside the provider throws "useAuth must be used inside <AuthProvider>".',
      explanation: 'The context is created with `undefined` as default and `useAuth` narrows it away by throwing, so consumers always get `AuthContextValue`. `List<T>` infers `T = Course` from `items`, which types the `c` parameter in both `getKey` and `renderItem`. React 19 lets you render the context object itself as the provider.',
    },
  ],
  interview: [
    {
      q: 'How do you type props in a React function component?',
      a: 'Define a type or interface and annotate the destructured parameter: `type Props = { title: string; onClick?: () => void }; function Card({ title, onClick }: Props) {...}`. Defaults go in the destructuring.',
      level: 'Easy',
    },
    {
      q: 'What type should children have?',
      a: 'ReactNode, which covers elements, strings, numbers, arrays, fragments, null, undefined and booleans. Use ReactElement only when exactly one element is required.',
      level: 'Easy',
    },
    {
      q: 'Should you use React.FC?',
      a: 'It is not wrong, but most teams avoid it: older versions implicitly added children, it does not support generic components well, and typing props on the parameter is simpler. Since React 18 types FC no longer includes children.',
      level: 'Medium',
    },
    {
      q: 'How do you type an onChange handler for an input?',
      a: '`function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setValue(e.target.value); }`. Use HTMLSelectElement or HTMLTextAreaElement for those elements, FormEvent<HTMLFormElement> for onSubmit and MouseEvent<HTMLButtonElement> for clicks.',
      level: 'Easy',
    },
    {
      q: 'How do you type useState when the initial value is null?',
      a: 'Pass the type argument: `const [user, setUser] = useState<User | null>(null);`. Otherwise it would be inferred as null and you could never set a User.',
      level: 'Easy',
    },
    {
      q: 'How do you type useRef for a DOM element?',
      a: '`const inputRef = useRef<HTMLInputElement>(null);` then `<input ref={inputRef} />`. inputRef.current is HTMLInputElement | null, so use optional chaining: inputRef.current?.focus().',
      level: 'Medium',
    },
    {
      q: 'How do you type useReducer actions?',
      a: 'With a discriminated union: `type Action = { type: \'add\'; item: Item } | { type: \'remove\'; id: string }`. The reducer `(state: State, action: Action): State` narrows action in each switch case. Add a never check for exhaustiveness.',
      level: 'Medium',
    },
    {
      q: 'What is a clean way to type a Context that must have a Provider?',
      a: 'createContext<Value | undefined>(undefined), then a custom hook that reads it and throws if undefined. Consumers use the hook and always receive Value. This avoids fake defaults like `{} as Value`.',
      level: 'Medium',
    },
    {
      q: 'How do you make a component accept all native button attributes?',
      a: 'Extend ComponentProps<\'button\'> (or ComponentPropsWithoutRef<\'button\'>) and spread the rest: `type Props = ComponentProps<\'button\'> & { variant?: \'primary\' }; function Button({ variant, ...rest }: Props) { return <button {...rest} /> }`.',
      level: 'Medium',
    },
    {
      q: 'How do you write a generic component in TSX?',
      a: 'function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {...}. T is inferred from the items prop. For arrow functions in .tsx write `<T,>` so it is not parsed as JSX.',
      level: 'Hard',
    },
    {
      q: 'Why must the useEffect callback not be async?',
      a: 'useEffect expects the callback to return nothing or a cleanup function. An async function returns a Promise, which React would treat as the cleanup, and TypeScript reports a type error. Define an async function inside the effect and call it.',
      level: 'Medium',
    },
    {
      q: 'What changed for refs in React 19 types?',
      a: 'Function components receive `ref` as a regular prop (forwardRef is no longer needed), useRef requires an argument, and useRef<T>(null) returns RefObject<T | null>. The global JSX namespace was removed in favour of React.JSX.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a `Badge` component with an optional `variant` (\'success\' | \'warning\' | \'error\' | \'info\', default \'info\'), an optional `icon` and required children. Map variants to colours with a Record so adding a variant forces a colour.',
      hint: 'const COLORS: Record<BadgeVariant, string> = {...}',
      solution: `import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info";

type BadgeProps = {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
};

const COLORS: Record<BadgeVariant, string> = {
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  info: "#2563eb",
};

export function Badge({ variant = "info", icon, children }: BadgeProps) {
  return (
    <span style={{ color: COLORS[variant], border: \`1px solid \${COLORS[variant]}\`, padding: "2px 8px" }}>
      {icon} {children}
    </span>
  );
}

export function OrderStatus() {
  return (
    <p>
      <Badge variant="success">Paid</Badge> <Badge variant="warning" icon="⏳">Shipping</Badge>
    </p>
  );
}`,
    },
    {
      task: 'Build a controlled LoginForm (email, password, remember checkbox) with typed values, a typed errors object derived from the values type, one change handler for all inputs and an `onLogin` callback prop.',
      hint: 'type LoginErrors = Partial<Record<keyof LoginValues, string>>; use `checked` for the checkbox.',
      solution: `import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type LoginValues = { email: string; password: string; remember: boolean };
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

function validate(v: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!v.email.includes("@")) errors.email = "Enter a valid email";
  if (v.password.length < 8) errors.password = "Minimum 8 characters";
  return errors;
}

export function LoginForm({ onLogin }: { onLogin: (values: LoginValues) => void }) {
  const [values, setValues] = useState<LoginValues>({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState<LoginErrors>({});

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onLogin(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <small>{errors.email}</small>}
      <input name="password" type="password" value={values.password} onChange={handleChange} />
      {errors.password && <small>{errors.password}</small>}
      <label>
        <input name="remember" type="checkbox" checked={values.remember} onChange={handleChange} /> Remember me
      </label>
      <button type="submit">Login</button>
    </form>
  );
}`,
    },
    {
      task: 'Write a generic custom hook `useFetch<T>(url)` that returns a discriminated union (loading / success with data: T / error) and aborts the request on unmount. Use it to list posts.',
      hint: 'Use AbortController in useEffect and return controller.abort as cleanup.',
      solution: `import { useEffect, useState } from "react";

type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json() as Promise<T>;
      })
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error", error: err instanceof Error ? err.message : String(err) });
      });
    return () => controller.abort();
  }, [url]);

  return state;
}

type Post = { id: number; title: string };

export function Posts() {
  const result = useFetch<Post[]>("https://jsonplaceholder.typicode.com/posts?_limit=5");
  if (result.status === "loading") return <p>Loading...</p>;
  if (result.status === "error") return <p>Error: {result.error}</p>;
  return (
    <ul>
      {result.data.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}`,
    },
    {
      task: 'Create a ThemeContext (\'light\' | \'dark\' with a toggle function), a ThemeProvider with an optional initial theme, a safe `useTheme` hook and a ThemeToggle button.',
      hint: 'createContext<ThemeContextValue | null>(null) and throw in the hook when null.',
      solution: `import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, initial = "light" }: { children: ReactNode; initial?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Switch to {theme === "light" ? "dark" : "light"} mode</button>;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which type is best for a component\'s `children` prop?',
      options: [
        'string',
        'JSX.Element[]',
        'ReactNode',
        'any',
      ],
      answer: 2,
      explanation: 'ReactNode covers everything React can render.',
    },
    {
      question: 'What is the correct type for an input\'s onChange event?',
      options: [
        'ChangeEvent<HTMLInputElement>',
        'Event',
        'InputEvent<string>',
        'FormEvent<HTMLButtonElement>',
      ],
      answer: 0,
      explanation: 'React\'s ChangeEvent with the element type as the generic.',
    },
    {
      question: 'How do you declare state that starts as null but will later hold a User?',
      options: [
        'useState(null as User)',
        'useState<User>()',
        'useState<null>(User)',
        'useState<User | null>(null)',
      ],
      answer: 3,
      explanation: 'The union type allows both null and User.',
    },
    {
      question: 'How should reducer actions be typed?',
      options: [
        'As any',
        'As a discriminated union on a `type` property',
        'As a string',
        'As an enum of functions',
      ],
      answer: 1,
      explanation: 'Discriminated unions let each case narrow the action payload.',
    },
    {
      question: 'In a .tsx file, how do you write a generic arrow function?',
      options: [
        'const f = <T,>(x: T) => x',
        'const f = <T>(x: T) => x',
        'const f = generic T (x: T) => x',
        'Generic arrows are not allowed',
      ],
      answer: 0,
      explanation: 'The trailing comma stops the parser from reading <T> as JSX.',
    },
  ],
};
