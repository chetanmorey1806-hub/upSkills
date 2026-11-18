export default {
  id: 'day-11-react-with-typescript-in-depth',
  title: 'React with TypeScript in Depth: Props, Events, Refs, Context, Reducers, Generic Components and API Types',
  module: 'Module 4: Production React',
  day: 11,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Most React job descriptions now ask for TypeScript. Learn to type everything you use daily: props with children and HTML attributes, events and handlers, refs, context with a safe hook, reducers with discriminated unions, generic components like Table<T> and Select<T>, polymorphic props, and end-to-end API types from Zod schemas for your MERN backend.',
  objectives: [
    'Type props, children, default values and native element attributes with ComponentProps',
    'Type events, handlers, refs (DOM and imperative) and state correctly',
    'Build a type-safe context and a reducer with discriminated-union actions',
    'Write generic components and hooks (Table<T>, useFetch<T>) with constraints',
    'Model API data with shared types, Zod inference and type guards for unknown responses',
  ],
  theory: [
    {
      heading: 'Typing props the modern way',
      content:
        'Use a `type` (or `interface`) for props and annotate the parameter. Avoid `React.FC`: it is not wrong anymore (children are no longer implicit since React 18 types), but plain functions are simpler and support generics.\n\n- **children**: `children: React.ReactNode` (anything renderable). Use `React.ReactElement` only if you need exactly one element.\n- **Optional props with defaults**: `size?: \'sm\' | \'md\'` and a default in destructuring `{ size = \'md\' }`. (`defaultProps` is removed for function components in React 19.)\n- **Union of literal types** instead of `string`: `variant: \'primary\' | \'danger\'` gives autocomplete and errors on typos.\n- **Extending native elements**: `type ButtonProps = React.ComponentProps<\'button\'> & { variant?: ... }` gives `onClick`, `disabled`, `type`, `aria-*` for free. In React 19, `ComponentProps<\'input\'>` includes `ref`.\n- **Omit conflicting props**: `Omit<React.ComponentProps<\'input\'>, \'size\'> & { size: \'sm\' | \'lg\' }`.\n- **Props of another component**: `React.ComponentProps<typeof ProductCard>`.\n- **Function props**: `onSelect: (id: string) => void`.\n- **Mutually exclusive props** with unions: `{ href: string; onClick?: never } | { onClick: () => void; href?: never }`.',
      syntax:
        "type ButtonProps = React.ComponentProps<'button'> & {\n  variant?: 'primary' | 'outline' | 'danger';\n  isLoading?: boolean;\n};\n\nexport function Button({ variant = 'primary', isLoading = false, children, disabled, ...rest }: ButtonProps) {\n  return (\n    <button data-variant={variant} disabled={disabled || isLoading} {...rest}>\n      {isLoading ? 'Loading...' : children}\n    </button>\n  );\n}\n\ntype CardProps = { title: string; children: React.ReactNode; footer?: React.ReactNode };",
    },
    {
      heading: 'State, events and handlers',
      content:
        '**useState** infers from the initial value: `useState(0)` is `number`. Provide the type when the initial value does not show it: `useState<User | null>(null)`, `useState<Product[]>([])`, `useState<\'idle\' | \'loading\' | \'error\'>(\'idle\')`.\n\n**Events**: React wraps native events. Common types:\n- `React.ChangeEvent<HTMLInputElement>` (also `HTMLSelectElement`, `HTMLTextAreaElement`)\n- `React.FormEvent<HTMLFormElement>`\n- `React.MouseEvent<HTMLButtonElement>`\n- `React.KeyboardEvent<HTMLInputElement>`\n- Handler types: `React.ChangeEventHandler<HTMLInputElement>`, `React.MouseEventHandler<HTMLButtonElement>`.\n\nTip: if you write the handler inline, TypeScript infers the event type. To find a type, hover the `onChange` prop in VS Code.\n\n`e.target` vs `e.currentTarget`: `currentTarget` is typed as the element the handler is attached to; `target` is only `EventTarget` because the event may come from a child.',
      syntax:
        "const [form, setForm] = useState({ email: '', password: '' });\n\nconst handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n  const { name, value } = e.currentTarget;\n  setForm(prev => ({ ...prev, [name]: value }));\n};\n\nconst handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\n  e.preventDefault();\n  const data = new FormData(e.currentTarget);\n};\n\nconst onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {\n  if (e.key === 'Enter') search(e.currentTarget.value);\n};",
    },
    {
      heading: 'Refs: DOM refs, mutable refs and imperative handles',
      content:
        '- **DOM ref**: `const inputRef = useRef<HTMLInputElement>(null);` Its type is `RefObject<HTMLInputElement | null>` (React 19 types); access with `inputRef.current?.focus()`.\n- **Mutable value ref** (timer id, previous value): `const timer = useRef<number | undefined>(undefined);` React 19 types require an argument for `useRef`.\n- **Ref as prop (React 19)**: `function Input({ ref, ...props }: React.ComponentProps<\'input\'>)`; no `forwardRef` generic gymnastics. With React 18, `forwardRef<HTMLInputElement, Props>((props, ref) => ...)`.\n- **useImperativeHandle**: expose a small typed API instead of the DOM node:\n  `type VideoHandle = { play(): void; pause(): void }` and `ref: React.Ref<VideoHandle>`.',
      syntax:
        "type PlayerHandle = { play: () => void; pause: () => void };\n\nfunction VideoPlayer({ src, ref }: { src: string; ref?: React.Ref<PlayerHandle> }) {\n  const videoRef = useRef<HTMLVideoElement>(null);\n  useImperativeHandle(ref, () => ({\n    play: () => videoRef.current?.play(),\n    pause: () => videoRef.current?.pause(),\n  }), []);\n  return <video ref={videoRef} src={src} />;\n}\n\n// parent\nconst player = useRef<PlayerHandle>(null);\n<VideoPlayer ref={player} src=\"/intro.mp4\" />\n<button onClick={() => player.current?.play()}>Play</button>",
    },
    {
      heading: 'Context and reducers with discriminated unions',
      content:
        '**Typed context without null checks everywhere**: create the context as `createContext<AuthContextValue | null>(null)` and a custom hook that throws if the value is null. The hook then returns the non-null type.\n\n**Reducers**: model actions as a **discriminated union** (each member has a literal `type`). Inside `switch (action.type)`, TypeScript **narrows** `action` so `action.payload` has the right type for that case. Add a `default` branch with an `never` check for **exhaustiveness**: if someone adds a new action type and forgets to handle it, compilation fails.\n\nState can also be a discriminated union to make impossible states impossible: `{ status: \'loading\' } | { status: \'success\'; data: Product[] } | { status: \'error\'; error: string }`. You cannot read `data` without checking `status === \'success\'` first.',
      syntax:
        "type CartItem = { id: string; name: string; price: number; qty: number };\ntype CartState = { items: CartItem[] };\ntype CartAction =\n  | { type: 'added'; item: Omit<CartItem, 'qty'> }\n  | { type: 'removed'; id: string }\n  | { type: 'qtyChanged'; id: string; qty: number }\n  | { type: 'cleared' };\n\nfunction cartReducer(state: CartState, action: CartAction): CartState {\n  switch (action.type) {\n    case 'added': {\n      const found = state.items.find(i => i.id === action.item.id);\n      return found\n        ? { items: state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i) }\n        : { items: [...state.items, { ...action.item, qty: 1 }] };\n    }\n    case 'removed': return { items: state.items.filter(i => i.id !== action.id) };\n    case 'qtyChanged': return { items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) };\n    case 'cleared': return { items: [] };\n    default: {\n      const _exhaustive: never = action;\n      return state;\n    }\n  }\n}",
    },
    {
      heading: 'Generic components and hooks',
      content:
        'A generic component works with any item type while keeping types connected. Example: a `Table<T>` receives `rows: T[]` and `columns` whose `key` must be a key of `T`; `onRowClick` receives a `T`, not `any`.\n\n- Syntax: `function Table<T>(props: TableProps<T>) {...}`. In `.tsx` arrow functions write `<T,>` (trailing comma) so it is not parsed as JSX.\n- **Constraints**: `<T extends { _id: string }>` guarantees a key for React lists.\n- **keyof and indexed access**: `key: keyof T`, `render?: (value: T[K], row: T) => React.ReactNode`.\n- Generic hooks: `function useFetch<T>(url: string): { data: T | undefined; error: Error | null; isLoading: boolean }`.\n- TanStack Query infers `data` from `queryFn`\'s return type; type the fetcher, not the hook: `const getProducts = async (): Promise<Product[]> => ...`.\n\nTypeScript infers `T` at the call site: `<Table rows={products} ... />` makes `T = Product` automatically.',
      syntax:
        "type Column<T> = { [K in keyof T]: { key: K; header: string; render?: (value: T[K], row: T) => React.ReactNode } }[keyof T];\n\ntype TableProps<T extends { _id: string }> = {\n  rows: T[];\n  columns: Column<T>[];\n  onRowClick?: (row: T) => void;\n};\n\nexport function Table<T extends { _id: string }>({ rows, columns, onRowClick }: TableProps<T>) {\n  return (\n    <table>\n      <thead><tr>{columns.map(c => <th key={String(c.key)}>{c.header}</th>)}</tr></thead>\n      <tbody>\n        {rows.map(row => (\n          <tr key={row._id} onClick={() => onRowClick?.(row)}>\n            {columns.map(c => <td key={String(c.key)}>{c.render ? c.render(row[c.key] as never, row) : String(row[c.key])}</td>)}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}",
    },
    {
      heading: 'API types for a MERN app',
      content:
        'Your Express API returns JSON; TypeScript cannot know its shape at runtime. Strategies:\n\n1. **Shared types package** in a monorepo (`packages/shared`): `export type Product = { _id: string; name: string; price: number; createdAt: string }`. Note MongoDB `ObjectId` and `Date` become **strings** in JSON.\n2. **Zod as the source of truth**: define `productSchema` once, `type Product = z.infer<typeof productSchema>`; validate responses at runtime with `productSchema.parse(data)` (or `safeParse`) to catch backend changes early.\n3. **Generated types** from OpenAPI (openapi-typescript) or end-to-end typed RPC (tRPC, Hono RPC) for TypeScript backends.\n\nOther useful utilities: `Pick`, `Omit`, `Partial` (`type UpdateProduct = Partial<Omit<Product, \'_id\'>>`), `Required`, `Record<string, string>` (field errors), `Awaited<ReturnType<typeof fn>>`.\n\nFor errors in `catch (err)`, `err` is `unknown`. Narrow with `axios.isAxiosError(err)` or `err instanceof Error` before reading properties. Avoid `any`; use `unknown` and narrow.',
      syntax:
        "// shared/schemas/product.ts\nexport const productSchema = z.object({\n  _id: z.string(),\n  name: z.string(),\n  price: z.number(),\n  category: z.enum(['mobile', 'laptop', 'audio']),\n  createdAt: z.string(),\n});\nexport type Product = z.infer<typeof productSchema>;\nexport const paginatedProducts = z.object({ items: z.array(productSchema), page: z.number(), totalPages: z.number() });\nexport type PaginatedProducts = z.infer<typeof paginatedProducts>;\n\n// client/api/products.ts\nexport async function getProducts(page = 1): Promise<PaginatedProducts> {\n  const { data } = await api.get<unknown>('/products', { params: { page } });\n  return paginatedProducts.parse(data);   // runtime check + typed result\n}\n\ntry { await getProducts(); } catch (err) {\n  if (axios.isAxiosError<{ message: string }>(err)) toast.error(err.response?.data.message ?? err.message);\n}",
    },
  ],
  examples: [
    {
      title: 'Generic Select<T> component (TypeScript) with a runnable JS version',
      scenario: 'A dropdown used for users, categories and cities. The selected value must keep its real type.',
      steps: [
        'Define SelectProps<T> with options: T[], getLabel, getKey, value: T | null, onChange(value: T)',
        'Implement Select<T> using the key to find the selected option',
        'Use it with User objects and with plain strings',
        'Run the JS version in the playground',
      ],
      code: `type SelectProps<T> = {
  label: string;
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getKey: (option: T) => string;
};

export function Select<T>({ label, options, value, onChange, getLabel, getKey }: SelectProps<T>) {
  return (
    <label>
      {label}
      <select
        value={value ? getKey(value) : ''}
        onChange={(e) => {
          const next = options.find(o => getKey(o) === e.target.value);
          if (next) onChange(next);
        }}
      >
        <option value="" disabled>Choose...</option>
        {options.map(o => <option key={getKey(o)} value={getKey(o)}>{getLabel(o)}</option>)}
      </select>
    </label>
  );
}

type User = { _id: string; name: string; role: 'admin' | 'user' };
const [assignee, setAssignee] = useState<User | null>(null);
<Select label="Assign to" options={users} value={assignee} onChange={setAssignee}
        getLabel={u => u.name} getKey={u => u._id} />   // T inferred as User
// onChange receives a User, so assignee.role is typed: no casting needed`,
      playground: {
        jsx: `const { useState } = React;

function Select({ label, options, value, onChange, getLabel, getKey }) {
  return (
    <label style={{ display: 'block', margin: '8px 0' }}>
      {label}{' '}
      <select value={value ? getKey(value) : ''} onChange={(e) => {
        const next = options.find(o => getKey(o) === e.target.value);
        if (next) onChange(next);
      }}>
        <option value="" disabled>Choose...</option>
        {options.map(o => <option key={getKey(o)} value={getKey(o)}>{getLabel(o)}</option>)}
      </select>
    </label>
  );
}

const users = [
  { _id: 'u1', name: 'Asha', role: 'admin' },
  { _id: 'u2', name: 'Ravi', role: 'user' },
  { _id: 'u3', name: 'Neha', role: 'user' },
];
const cities = ['Pune', 'Bengaluru', 'Hyderabad', 'Chennai'];

function App() {
  const [assignee, setAssignee] = useState(null);
  const [city, setCity] = useState(null);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <Select label="Assign to" options={users} value={assignee} onChange={setAssignee} getLabel={u => u.name} getKey={u => u._id} />
      <Select label="City" options={cities} value={city} onChange={setCity} getLabel={c => c} getKey={c => c} />
      <pre>{JSON.stringify({ assignee, city }, null, 2)}</pre>
    </div>
  );
}`,
      },
      result: 'Selecting a user stores the whole user object (with role); selecting a city stores the string.',
      explanation:
        'The generic T flows from options to value to onChange. With TypeScript, passing users makes onChange receive a User, while cities make it a string; using a wrong getKey (e.g. u => u.age) is a compile error.',
    },
    {
      title: 'Typed reducer with a discriminated-union state machine',
      scenario: 'A data loader whose state can only be idle, loading, success (with data) or error (with message).',
      steps: [
        'Define State and Action as discriminated unions',
        'Write the reducer with switch on action.type',
        'Render by switching on state.status (narrowing gives safe access to data/error)',
        'Run the JS version and trigger success and failure',
      ],
      code: `type State<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

type Action<T> =
  | { type: 'fetch' }
  | { type: 'resolve'; data: T }
  | { type: 'reject'; error: string };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'fetch': return { status: 'loading' };
    case 'resolve': return { status: 'success', data: action.data };
    case 'reject': return { status: 'error', error: action.error };
  }
}

// in JSX
if (state.status === 'success') return <List items={state.data} />;   // data exists here
// state.data outside this check is a compile error`,
      playground: {
        jsx: `const { useReducer } = React;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function reducer(state, action) {
  switch (action.type) {
    case 'fetch': return { status: 'loading' };
    case 'resolve': return { status: 'success', data: action.data };
    case 'reject': return { status: 'error', error: action.error };
    default: throw new Error('Unknown action ' + action.type);
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  async function load(fail) {
    dispatch({ type: 'fetch' });
    await wait(800);
    if (fail) dispatch({ type: 'reject', error: 'Server responded with 500' });
    else dispatch({ type: 'resolve', data: ['Order #101', 'Order #102', 'Order #103'] });
  }
  let body;
  switch (state.status) {
    case 'idle': body = <p>Click a button to load orders.</p>; break;
    case 'loading': body = <p>Loading...</p>; break;
    case 'success': body = <ul>{state.data.map(o => <li key={o}>{o}</li>)}</ul>; break;
    case 'error': body = <p style={{ color: 'crimson' }}>{state.error}</p>; break;
  }
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <button onClick={() => load(false)}>Load (success)</button>{' '}
      <button onClick={() => load(true)}>Load (fail)</button>
      {body}
      <small>state = {JSON.stringify(state)}</small>
    </div>
  );
}`,
      },
      result: 'The UI moves through idle -> loading -> success/error. There is never a state with both data and error.',
      explanation:
        'Separate booleans (isLoading, isError, data) allow impossible combinations like isLoading && error. A discriminated union makes each state explicit, and TypeScript narrows the type inside each case.',
    },
    {
      title: 'Type-safe AuthContext and typed events in a login form',
      scenario: 'A context that never returns null to consumers and a form with correctly typed handlers.',
      steps: [
        'Define AuthContextValue and createContext<AuthContextValue | null>(null)',
        'Write useAuth that throws when used outside the provider',
        'Type the change and submit handlers',
      ],
      code: `type User = { _id: string; name: string; email: string; role: 'admin' | 'user' };
type Credentials = { email: string; password: string };
type AuthContextValue = {
  user: User | null;
  status: 'checking' | 'authenticated' | 'guest';
  login: (c: Credentials) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;   // narrowed: not null
}

export function LoginForm() {
  const { login } = useAuth();
  const [values, setValues] = useState<Credentials>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues(v => ({ ...v, [e.currentTarget.name]: e.currentTarget.value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(values);
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message ?? 'Login failed' : 'Unexpected error');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input name="email" value={values.email} onChange={onChange} />
      <input name="password" type="password" value={values.password} onChange={onChange} />
      {error && <p role="alert">{error}</p>}
      <button>Login</button>
    </form>
  );
}`,
      result: 'Consumers call useAuth() and get a fully typed value with no optional chaining; handlers have correct event types.',
      explanation:
        'Using null as the default plus a throwing hook avoids fake default objects and gives a clear runtime error. catch variables are unknown, so narrowing with axios.isAxiosError is required before reading response.',
    },
    {
      title: 'Typed API layer with Zod + TanStack Query + React Hook Form',
      scenario: 'One schema drives the product form types, the API function return types and runtime validation.',
      steps: [
        'Define productInputSchema and productSchema; infer types',
        'Type API functions with Promise<Product>',
        'useQuery/useMutation infer data types automatically',
        'useForm<ProductInput> with zodResolver',
      ],
      code: `export const productInputSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().positive(),
  category: z.enum(['mobile', 'laptop', 'audio']),
});
export const productSchema = productInputSchema.extend({ _id: z.string(), createdAt: z.string() });

export type ProductInput = z.infer<typeof productInputSchema>;
export type Product = z.infer<typeof productSchema>;

export const productsApi = {
  list: async (): Promise<Product[]> => z.array(productSchema).parse((await api.get('/products')).data),
  create: async (input: ProductInput): Promise<Product> => productSchema.parse((await api.post('/products', input)).data),
};

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: productsApi.list });   // data: Product[] | undefined
}

export function ProductForm() {
  const qc = useQueryClient();
  const create = useMutation({ mutationFn: productsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }) });
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof productInputSchema>, unknown, ProductInput>({
    resolver: zodResolver(productInputSchema),
  });
  return (
    <form onSubmit={handleSubmit((values) => create.mutate(values))}>   {/* values: ProductInput */}
      <input {...register('name')} />{errors.name?.message}
      <input type="number" {...register('price')} />
      <select {...register('category')}><option value="mobile">Mobile</option><option value="laptop">Laptop</option></select>
      <button disabled={create.isPending}>Save</button>
    </form>
  );
}`,
      result: 'Renaming a field in the schema immediately shows type errors in the form, the API layer and every component using Product.',
      explanation:
        'z.infer derives static types from runtime schemas, so types and validation never drift. Recent React Hook Form 7 versions support separate input and output generic types for resolvers that transform data (coerce). TanStack Query infers data from the queryFn return type, so you rarely pass generics to useQuery.',
    },
  ],
  interview: [
    { q: 'Should you use React.FC?', a: 'It is acceptable now (it no longer adds implicit children since @types/react 18), but most teams prefer typing the props parameter directly: function Card({ title }: CardProps). It is simpler, works naturally with generics and default values.', level: 'Easy' },
    { q: 'How do you type children?', a: 'children: React.ReactNode for anything renderable (elements, strings, numbers, arrays, null). Use React.ReactElement when exactly one element is required, or a function type for render props.', level: 'Easy' },
    { q: 'How do you accept all native button props in your Button component?', a: 'type ButtonProps = React.ComponentProps<"button"> & { variant?: "primary" | "danger" }; then spread ...rest onto the button. Use ComponentPropsWithoutRef/ComponentPropsWithRef in React 18 when refs matter; in React 19 ComponentProps includes ref.', level: 'Medium' },
    { q: 'What is the type of an input onChange event?', a: 'React.ChangeEvent<HTMLInputElement>. The handler type is React.ChangeEventHandler<HTMLInputElement>. For select and textarea use HTMLSelectElement and HTMLTextAreaElement.', level: 'Easy' },
    { q: 'Why is e.currentTarget better typed than e.target?', a: 'currentTarget is the element the listener is attached to, so React types it with the generic element type. target can be any descendant that dispatched the event, so it is typed as EventTarget.', level: 'Medium' },
    { q: 'How do you type useRef for a DOM element vs a mutable value?', a: 'DOM: useRef<HTMLInputElement>(null) and access current?.focus(). Mutable value: useRef<number | undefined>(undefined) or useRef(0). React 19 types require an initial argument and make all refs mutable.', level: 'Medium' },
    { q: 'How do you create a context that is never null for consumers?', a: 'createContext<Value | null>(null) and a custom hook that reads it, throws an error if null, and returns Value. Consumers use the hook and get a non-null type.', level: 'Medium' },
    { q: 'What is a discriminated union and why use it for reducer actions?', a: 'A union of object types sharing a literal property (type or status). Switching on that property narrows the type, so each case knows its payload shape. Adding a never check in default makes the switch exhaustive.', level: 'Hard' },
    { q: 'How do you write a generic component in a .tsx file using an arrow function?', a: 'Use <T,>(props: Props<T>) => ... (trailing comma) or <T extends unknown>, because <T> alone is parsed as a JSX tag. Function declarations function List<T>(props: Props<T>) avoid the issue.', level: 'Hard' },
    { q: 'any vs unknown?', a: 'any disables type checking entirely. unknown means "could be anything" but forces you to narrow (typeof, instanceof, type guards, Zod parse) before use. Use unknown for API responses and catch errors.', level: 'Easy' },
    { q: 'How do you keep frontend and backend types in sync in a MERN app?', a: 'Share types or Zod schemas in a monorepo package, infer types with z.infer, validate on both sides, or generate types from an OpenAPI spec. Remember JSON turns ObjectId and Date into strings.', level: 'Medium' },
    { q: 'What do Partial, Pick, Omit and Record do?', a: 'Partial<T> makes all properties optional (update payloads). Pick<T, K> selects some keys; Omit<T, K> removes keys (e.g. Omit<Product, "_id"> for create input). Record<K, V> builds an object type with keys K and values V (e.g. Record<string, string> for field errors).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Type a reusable <Input> component that accepts all native input props plus label: string and error?: string, and forwards ref (React 19 style).',
      hint: 'React.ComponentProps<"input"> & { label: string; error?: string }.',
      solution: `type InputProps = React.ComponentProps<'input'> & { label: string; error?: string };

export function Input({ label, error, id, ref, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} ref={ref} aria-invalid={!!error} aria-describedby={error ? inputId + '-err' : undefined} {...props} />
      {error && <p id={inputId + '-err'} role="alert">{error}</p>}
    </div>
  );
}

// <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />`,
    },
    {
      task: 'Write a generic hook useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void].',
      hint: 'Lazy initial state with try/catch around JSON.parse.',
      solution: `export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota or private mode */ }
  }, [key, value]);

  return [value, setValue] as const;   // tuple type, not (T | Dispatch)[]
}

// const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');`,
    },
    {
      task: 'Type a notifications reducer with actions: added (notification without id), dismissed (id), clearedAll. Include an exhaustiveness check.',
      hint: 'Notification = { id: string; message: string; kind: "info" | "error" }.',
      solution: `type Notification = { id: string; message: string; kind: 'info' | 'success' | 'error' };
type NotifAction =
  | { type: 'added'; notification: Omit<Notification, 'id'> }
  | { type: 'dismissed'; id: string }
  | { type: 'clearedAll' };

export function notificationsReducer(state: Notification[], action: NotifAction): Notification[] {
  switch (action.type) {
    case 'added':
      return [...state, { id: crypto.randomUUID(), ...action.notification }];
    case 'dismissed':
      return state.filter(n => n.id !== action.id);
    case 'clearedAll':
      return [];
    default: {
      const unreachable: never = action;
      throw new Error('Unhandled action: ' + JSON.stringify(unreachable));
    }
  }
}`,
    },
    {
      task: 'Write a type guard isApiError(err: unknown): err is { status: number; message: string } and use it in a catch block.',
      hint: 'Check typeof err === "object" && err !== null && "status" in err.',
      solution: `type ApiError = { status: number; message: string };

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' && err !== null &&
    'status' in err && typeof (err as Record<string, unknown>).status === 'number' &&
    'message' in err && typeof (err as Record<string, unknown>).message === 'string'
  );
}

try {
  await saveProfile(values);
} catch (err) {
  if (isApiError(err) && err.status === 409) setError('email', { message: err.message });
  else toast.error('Something went wrong');
}`,
    },
  ],
  quiz: [
    { question: 'Which type fits the children prop that can be text, elements or null?', options: ['React.ReactNode', 'JSX.Element', 'string', 'React.FC'], answer: 0, explanation: 'ReactNode covers everything React can render.' },
    { question: 'What is the type of a form onSubmit event?', options: ['React.MouseEvent<HTMLFormElement>', 'SubmitEvent', 'React.ChangeEvent<HTMLFormElement>', 'React.FormEvent<HTMLFormElement>'], answer: 3, explanation: 'Form submissions use FormEvent.' },
    { question: 'In a .tsx arrow function, how do you declare a generic T?', options: ['<T>(p) => ...', '<T,>(p) => ...', 'generic T (p) => ...', 'It is not possible'], answer: 1, explanation: 'The trailing comma stops the parser treating <T> as JSX.' },
    { question: 'What does z.infer<typeof schema> give you?', options: ['A runtime validator', 'A JSON file', 'A TypeScript type derived from the schema', 'A Mongoose model'], answer: 2, explanation: 'It extracts the static type from a Zod schema.' },
    { question: 'What is the type of err inside catch with strict TypeScript settings?', options: ['Error', 'any', 'AxiosError', 'unknown'], answer: 3, explanation: 'useUnknownInCatchVariables (part of strict) makes it unknown, so you must narrow it.' },
  ],
};
