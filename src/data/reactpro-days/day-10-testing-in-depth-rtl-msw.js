export default {
  id: 'day-10-testing-in-depth-rtl-msw',
  title: 'Testing in Depth: RTL Queries, user-event, Mocking APIs with MSW 2, Testing Hooks and Async UI, Coverage',
  module: 'Module 4: Production React',
  day: 10,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Go beyond "renders without crashing". Write tests the way users use your app: find elements by role and label, interact with user-event, mock the Express API at the network level with MSW 2, test loading/error/empty states, custom hooks, TanStack Query and router-dependent components, and measure coverage with Vitest. These are the skills that separate juniors from mid-level React developers.',
  objectives: [
    'Choose the right RTL query (getBy/queryBy/findBy, ByRole first) and avoid implementation details',
    'Simulate realistic interactions with userEvent.setup() and async/await',
    'Mock REST APIs with MSW 2 handlers (http, HttpResponse) and override them per test',
    'Test async UI, custom hooks (renderHook), and components that need providers',
    'Configure Vitest coverage and know what is worth testing',
  ],
  theory: [
    {
      heading: 'Testing philosophy and the testing trophy',
      content:
        '"The more your tests resemble the way your software is used, the more confidence they can give you." (Kent C. Dodds). For React apps the **testing trophy** suggests:\n- **Static analysis** (ESLint, TypeScript): catches typos and type errors for free.\n- **Unit tests**: pure functions (price calculation, validators, reducers).\n- **Integration tests** (the biggest part): render a feature (form + API + state) and test it like a user with RTL + MSW. Best confidence per effort.\n- **End-to-end tests** (Playwright/Cypress): a few critical flows in a real browser against a real backend (signup, checkout).\n\nAvoid testing **implementation details**: internal state, private functions, component instance methods, CSS class names. A refactor that keeps behaviour the same should not break tests.\n\nSetup (Vite): `npm i -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom msw @vitest/coverage-v8`.',
      syntax:
        "// vite.config.js (or vitest.config.js)\nexport default defineConfig({\n  plugins: [react()],\n  test: {\n    environment: 'jsdom',\n    globals: true,\n    setupFiles: './src/test/setup.js',\n    coverage: { provider: 'v8', reporter: ['text', 'html'], include: ['src/**/*.{js,jsx,ts,tsx}'], exclude: ['src/main.jsx', 'src/**/*.test.*'] },\n  },\n});\n\n// src/test/setup.js\nimport '@testing-library/jest-dom/vitest';\nimport { cleanup } from '@testing-library/react';\nimport { afterEach } from 'vitest';\nafterEach(() => cleanup());",
    },
    {
      heading: 'RTL queries: which one and when',
      content:
        'Each query has three types:\n- **getBy...**: returns the element or **throws** if not found (or if multiple). Use for elements that must be there.\n- **queryBy...**: returns `null` if not found. Use **only** to assert absence: `expect(screen.queryByText(/error/i)).not.toBeInTheDocument()`.\n- **findBy...**: returns a **promise**, retries until found (default 1000 ms). Use for elements that appear **after async work**.\n- `getAllBy` / `queryAllBy` / `findAllBy` for multiple elements.\n\n**Priority** (most to least preferred):\n1. `getByRole(\'button\', { name: /save/i })` - matches how assistive technology sees the page, and checks accessibility for free.\n2. `getByLabelText(\'Email\')` - form fields.\n3. `getByPlaceholderText`, `getByText`, `getByDisplayValue`.\n4. `getByAltText`, `getByTitle`.\n5. `getByTestId` - last resort when nothing else is meaningful.\n\nUse `within(row).getByRole(...)` to scope queries, and `screen.debug()` or `screen.logTestingPlaygroundURL()` to inspect.',
      tip: 'If you cannot find an element by role, that is often an accessibility bug (e.g. a clickable div instead of a button, or an input without a label).',
    },
    {
      heading: 'user-event: realistic interactions',
      content:
        '`fireEvent.click` dispatches a single DOM event. `@testing-library/user-event` v14 simulates what a real user does: a click includes pointer down/up, focus changes; typing fires keydown, keypress, input, keyup for every character and respects `maxLength`, disabled fields, etc.\n\nRules:\n- Call `const user = userEvent.setup()` **before** rendering (or at the start of the test).\n- All methods are **async**: always `await user.click(...)`.\n- Common APIs: `user.click`, `user.dblClick`, `user.type(el, \'hello\')`, `user.clear`, `user.keyboard(\'{Enter}\')`, `user.tab()`, `user.selectOptions(select, \'admin\')`, `user.upload(input, file)`, `user.hover`.\n- With fake timers (`vi.useFakeTimers()`), pass `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.',
    },
    {
      heading: 'Mocking APIs with MSW 2',
      content:
        '**Mock Service Worker** intercepts requests at the network level. Your component, axios instance and TanStack Query all run for real; only the server responses are fake. Benefits over `vi.mock(\'axios\')`: tests do not depend on how you fetch, and the same handlers can power the browser during development and Storybook.\n\nMSW 2 API:\n- `import { http, HttpResponse, delay } from \'msw\'`\n- Handler: `http.get(\'*/api/products\', () => HttpResponse.json([...]))`\n- Read input: `async ({ request, params }) => { const body = await request.json(); const url = new URL(request.url); }`\n- Errors: `HttpResponse.json({ message: \'Server error\' }, { status: 500 })` or `HttpResponse.error()` (network error).\n- Node setup: `setupServer(...handlers)` from `msw/node`; `server.listen({ onUnhandledRequest: \'error\' })` in beforeAll, `server.resetHandlers()` in afterEach, `server.close()` in afterAll.\n- Per-test override: `server.use(http.get(..., () => HttpResponse.json([], { status: 200 })))`.\n\nMSW 1 used `rest.get` and `res(ctx.json())`; that API is gone in v2.',
      syntax:
        "// src/test/handlers.js\nimport { http, HttpResponse } from 'msw';\nexport const handlers = [\n  http.get('*/api/products', ({ request }) => {\n    const q = new URL(request.url).searchParams.get('q') ?? '';\n    const all = [{ _id: '1', name: 'Laptop' }, { _id: '2', name: 'Mouse' }];\n    return HttpResponse.json(all.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));\n  }),\n  http.post('*/api/auth/login', async ({ request }) => {\n    const { email } = await request.json();\n    if (email === 'blocked@test.com') return HttpResponse.json({ message: 'Account blocked' }, { status: 403 });\n    return HttpResponse.json({ accessToken: 'abc', user: { name: 'Asha', role: 'user' } });\n  }),\n];\n\n// src/test/server.js\nimport { setupServer } from 'msw/node';\nexport const server = setupServer(...handlers);\n\n// setup.js additions\nbeforeAll(() => server.listen({ onUnhandledRequest: 'error' }));\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());",
    },
    {
      heading: 'Testing async UI and components that need providers',
      content:
        'Async patterns:\n- `expect(await screen.findByText(/laptop/i)).toBeInTheDocument()` waits for data.\n- `await waitFor(() => expect(mockFn).toHaveBeenCalledWith(...))` for non-DOM assertions.\n- `await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))`.\n- Do not wrap RTL calls in `act()` yourself; RTL already does. An "act warning" usually means a state update happened after the test ended: await the final UI state.\n\nProviders: components using TanStack Query, Router, Redux, Theme or Auth context need them in tests. Create a **custom render** (`renderWithProviders`) that wraps the UI. For TanStack Query, create a **new QueryClient per test** with `retry: false` so failed requests fail fast and cache does not leak between tests. For routes, use `MemoryRouter` with `initialEntries` or `createMemoryRouter`.',
      syntax:
        "// src/test/utils.jsx\nexport function renderWithProviders(ui, { route = '/', ...options } = {}) {\n  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });\n  function Wrapper({ children }) {\n    return (\n      <QueryClientProvider client={queryClient}>\n        <MemoryRouter initialEntries={[route]}>\n          <AuthProvider>{children}</AuthProvider>\n        </MemoryRouter>\n      </QueryClientProvider>\n    );\n  }\n  return { user: userEvent.setup(), queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };\n}",
    },
    {
      heading: 'Testing hooks, mocks, timers and coverage',
      content:
        '- **Custom hooks**: `renderHook(() => useCounter(5))` returns `{ result, rerender, unmount }`; read `result.current`; wrap state changes in `act(() => result.current.increment())`. Pass `wrapper` if the hook needs providers. Prefer testing hooks through a component when possible.\n- **Mock functions**: `const onSubmit = vi.fn()`; `expect(onSubmit).toHaveBeenCalledWith({ email: \'a@b.com\' })`.\n- **Module mocks**: `vi.mock(\'react-router\', async (orig) => ({ ...(await orig()), useNavigate: () => mockNavigate }))`.\n- **Timers**: `vi.useFakeTimers()`, `vi.advanceTimersByTime(500)` for debounce; restore with `vi.useRealTimers()`.\n- **Coverage**: `vitest run --coverage` with the v8 provider shows statements/branches/functions/lines. Use thresholds in config (`coverage.thresholds: { lines: 80 }`) for CI. Coverage shows **what is not tested**, not that tests are good: 100% coverage with weak assertions is useless.\n- **What to test**: critical business logic, forms and validation, auth guards, error and empty states, bug regressions. Skip trivial markup and third-party library internals.',
    },
  ],
  examples: [
    {
      title: 'Login form integration test with user-event and MSW',
      scenario: 'Test success, server error and validation for the login form from Day 8.',
      steps: [
        'Render <Login /> with renderWithProviders',
        'Type into fields found by label and click the button found by role',
        'Assert navigation or the error alert with findBy',
        'Override the handler with server.use for the 403 case',
      ],
      code: `import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { renderWithProviders } from '@/test/utils';
import Login from './Login';

describe('Login', () => {
  it('logs in and redirects to the dashboard', async () => {
    const { user } = renderWithProviders(<AppRoutes />, { route: '/login' });
    await user.type(screen.getByLabelText(/email/i), 'asha@test.com');
    await user.type(screen.getByLabelText(/password/i), 'Secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('shows a generic error when credentials are wrong', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json({ message: 'Invalid' }, { status: 401 })));
    const { user } = renderWithProviders(<Login />);
    await user.type(screen.getByLabelText(/email/i), 'asha@test.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });

  it('validates required fields without calling the API', async () => {
    const spy = vi.fn();
    server.use(http.post('*/api/auth/login', () => { spy(); return HttpResponse.json({}); }));
    const { user } = renderWithProviders(<Login />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });
});`,
      result: 'Three passing tests that would still pass if you switched from axios to fetch or from Context to Zustand.',
      explanation:
        'The tests only use what users see (labels, roles, text) and what the server returns. server.use overrides a handler just for one test; resetHandlers in afterEach restores the defaults.',
    },
    {
      title: 'A component designed for testing: all async states',
      scenario: 'A user search widget with loading, error, empty and success states, each with accessible markup that tests can query.',
      steps: [
        'Render a label + input, a status region and a list',
        'Use role="status" for loading and role="alert" for errors',
        'Run the playground and search for "le" (results), "zzz" (empty)',
        'Write tests for each state (see code)',
      ],
      code: `it('shows users matching the search', async () => {
  const { user } = renderWithProviders(<UserSearch />);
  await user.type(screen.getByLabelText(/search users/i), 'le');
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  const items = await screen.findAllByRole('listitem');
  expect(items).toHaveLength(2);
});

it('shows empty state', async () => {
  server.use(http.get('*/users', () => HttpResponse.json([])));
  const { user } = renderWithProviders(<UserSearch />);
  await user.type(screen.getByLabelText(/search users/i), 'zzz');
  expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
});

it('shows error state', async () => {
  server.use(http.get('*/users', () => HttpResponse.json({ message: 'down' }, { status: 500 })));
  const { user } = renderWithProviders(<UserSearch />);
  await user.type(screen.getByLabelText(/search users/i), 'a');
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load users/i);
});`,
      playground: {
        jsx: `const { useState, useEffect, useId } = React;

function UserSearch() {
  const id = useId();
  const [q, setQ] = useState('');
  const [state, setState] = useState({ status: 'idle', users: [] });

  useEffect(() => {
    if (!q.trim()) { setState({ status: 'idle', users: [] }); return; }
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    const t = setTimeout(() => {
      fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error('bad status'); return r.json(); })
        .then(all => setState({ status: 'success', users: all.filter(u => u.name.toLowerCase().includes(q.toLowerCase())) }))
        .catch(e => { if (e.name !== 'AbortError') setState({ status: 'error', users: [] }); });
    }, 300);                                           // debounce
    return () => { clearTimeout(t); controller.abort(); };
  }, [q]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <label htmlFor={id}>Search users</label>{' '}
      <input id={id} value={q} onChange={e => setQ(e.target.value)} />
      {state.status === 'loading' && <p role="status">Loading...</p>}
      {state.status === 'error' && <p role="alert" style={{ color: 'crimson' }}>Could not load users</p>}
      {state.status === 'success' && state.users.length === 0 && <p>No users found</p>}
      {state.status === 'success' && state.users.length > 0 && (
        <ul aria-label="results">{state.users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
      )}
    </div>
  );
}

function App() { return <UserSearch />; }`,
      },
      result: 'Typing shows "Loading...", then matching names or "No users found". Each state has a role or text a test can target.',
      explanation:
        'Testable components are accessible components: a labelled input (getByLabelText), status/alert roles (getByRole), real list semantics (findAllByRole("listitem")). Note how the debounce and AbortController make the UI correct, and tests would use findBy to wait for them.',
    },
    {
      title: 'Why mock at the network level: an in-browser MSW-like switch',
      scenario: 'Simulate how MSW handlers replace the real server so the same component can be checked against success, empty, slow and 500 responses.',
      steps: [
        'Create a handlers object mapping scenarios to fake responses',
        'Provide a fetch-like function through context (MSW does this transparently by intercepting real fetch/XHR)',
        'Switch scenarios and watch the same component react',
      ],
      code: `// Real MSW in the browser (dev mode), src/mocks/browser.js
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
export const worker = setupWorker(...handlers);

// main.jsx
if (import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
// npx msw init public/ --save   (creates mockServiceWorker.js)`,
      playground: {
        jsx: `const { useState, useEffect, createContext, useContext } = React;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const scenarios = {
  success: async () => ({ status: 200, body: [{ _id: '1', name: 'Wireless Mouse', price: 799 }, { _id: '2', name: 'USB-C Hub', price: 1499 }] }),
  empty: async () => ({ status: 200, body: [] }),
  slow: async () => { await wait(2500); return { status: 200, body: [{ _id: '3', name: 'Slow Keyboard', price: 999 }] }; },
  serverError: async () => ({ status: 500, body: { message: 'Internal Server Error' } }),
};

const ApiContext = createContext(null);

function ProductList() {
  const request = useContext(ApiContext);
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    let ignore = false;
    setState({ status: 'loading' });
    request('/api/products').then(res => {
      if (ignore) return;
      if (res.status >= 400) setState({ status: 'error', message: res.body.message });
      else setState({ status: 'success', items: res.body });
    });
    return () => { ignore = true; };
  }, [request]);
  if (state.status === 'loading') return <p role="status">Loading products...</p>;
  if (state.status === 'error') return <p role="alert" style={{ color: 'crimson' }}>Error: {state.message}</p>;
  if (!state.items.length) return <p>No products yet</p>;
  return <ul>{state.items.map(p => <li key={p._id}>{p.name} - Rs {p.price}</li>)}</ul>;
}

function App() {
  const [scenario, setScenario] = useState('success');
  const request = React.useMemo(() => async (url) => { await wait(400); return scenarios[scenario](url); }, [scenario]);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <p>Active handler: {Object.keys(scenarios).map(s => (
        <label key={s} style={{ marginRight: 10 }}><input type="radio" checked={scenario === s} onChange={() => setScenario(s)} /> {s}</label>
      ))}</p>
      <ApiContext.Provider value={request}><ProductList /></ApiContext.Provider>
    </div>
  );
}`,
      },
      result: 'Switching the handler re-runs the request and the same component shows the list, the empty state, a long loading state or the error.',
      explanation:
        'MSW does the same without any context: it intercepts the real fetch/XMLHttpRequest calls (Service Worker in the browser, request interception in Node), so production code is untouched. server.use(...) in a test is the equivalent of picking a radio button here.',
    },
    {
      title: 'Testing a custom hook and a debounced input with fake timers',
      scenario: 'Test useCart (add, remove, total) with renderHook, and a SearchBox that calls onSearch 500 ms after typing stops.',
      steps: [
        'renderHook(() => useCart()) and use act for updates',
        'Use vi.useFakeTimers and userEvent.setup({ advanceTimers })',
        'Advance time and assert the mock was called once with the final text',
      ],
      code: `import { renderHook, act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('useCart', () => {
  it('adds items, increases qty and calculates total', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.add({ id: 'p1', price: 500 }));
    act(() => result.current.add({ id: 'p1', price: 500 }));
    act(() => result.current.add({ id: 'p2', price: 250 }));
    expect(result.current.items).toEqual([
      { id: 'p1', price: 500, qty: 2 },
      { id: 'p2', price: 250, qty: 1 },
    ]);
    expect(result.current.total).toBe(1250);
  });
});

describe('SearchBox', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces onSearch by 500ms', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchBox onSearch={onSearch} delay={500} />);
    await user.type(screen.getByRole('searchbox'), 'react');
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('react');
  });
});

// package.json scripts
// "test": "vitest", "test:ci": "vitest run --coverage"`,
      result: 'Both tests pass quickly; the debounce test does not actually wait 500 ms thanks to fake timers.',
      explanation:
        'renderHook mounts the hook in a hidden test component. act flushes state updates before assertions. Fake timers make time-dependent code deterministic; userEvent must know about them via advanceTimers, otherwise its internal delays hang.',
    },
  ],
  interview: [
    { q: 'getBy vs queryBy vs findBy?', a: 'getBy returns the element or throws (synchronous, must exist). queryBy returns null when missing (use for asserting absence). findBy returns a promise that retries until the element appears or times out (use for async UI).', level: 'Easy' },
    { q: 'Why is getByRole the preferred query?', a: 'It queries the accessibility tree the same way screen readers do, so tests mirror real usage and also verify accessibility (correct roles and accessible names). It is also resilient to markup and styling changes.', level: 'Easy' },
    { q: 'user-event vs fireEvent?', a: 'fireEvent dispatches one synthetic DOM event. user-event simulates full user interactions (focus, pointer, keyboard events per character, respecting disabled/readonly), making tests more realistic. user-event v14 APIs are async and should be set up with userEvent.setup().', level: 'Medium' },
    { q: 'What is MSW and why prefer it over mocking axios?', a: 'Mock Service Worker intercepts HTTP requests at the network layer and returns mocked responses. The app code (axios, fetch, query library, interceptors) runs unchanged, so tests are realistic and do not break when you change the data-fetching implementation. The same handlers work in the browser for development.', level: 'Medium' },
    { q: 'How do you override an MSW handler for one test?', a: 'Call server.use(http.get(url, () => HttpResponse.json(..., { status: 500 }))) inside the test. Prepended handlers take priority. server.resetHandlers() in afterEach removes the overrides.', level: 'Medium' },
    { q: 'What causes the "not wrapped in act(...)" warning and how do you fix it?', a: 'A state update happened outside of RTL\'s automatic act, typically after an async operation finished when the test was not awaiting it. Fix by awaiting the final UI (findBy, waitFor, waitForElementToBeRemoved) rather than adding manual act calls.', level: 'Hard' },
    { q: 'How do you test a component that uses TanStack Query?', a: 'Wrap it in a QueryClientProvider with a fresh QueryClient per test (retry: false to avoid slow failures), mock the API with MSW, and use findBy to wait for data. A shared client would leak cache between tests.', level: 'Medium' },
    { q: 'How do you test a custom hook?', a: 'Use renderHook from @testing-library/react, read result.current, wrap updates in act, and pass a wrapper for providers. If the hook is simple UI logic, testing it through a component that uses it is often better.', level: 'Medium' },
    { q: 'How do you test components that use React Router hooks?', a: 'Render inside MemoryRouter with initialEntries, or create a memory data router with createMemoryRouter and RouterProvider. Assert navigation by checking the new page content; mock useNavigate only if necessary.', level: 'Medium' },
    { q: 'Is 100% code coverage a good goal?', a: 'Not by itself. Coverage shows which lines ran, not whether behaviour was asserted. Aim for high coverage of critical paths (auth, payments, forms, business rules) with meaningful assertions; set reasonable thresholds (70-85%) in CI and use coverage to find untested branches.', level: 'Easy' },
    { q: 'What are implementation details and why avoid testing them?', a: 'Internal state names, private functions, component structure, CSS classes or which hook is used. Tests coupled to them break on refactors even when behaviour is unchanged (false negatives) and can pass while the UI is broken (false positives).', level: 'Medium' },
    { q: 'When would you use Playwright instead of RTL?', a: 'For end-to-end flows that need a real browser, real routing, real backend or multiple pages: signup + email verification, checkout with payment sandbox, file uploads, cross-browser checks and visual regression. RTL integration tests are faster and cover most component behaviour.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write MSW 2 handlers for GET /api/todos (returns 3 todos), POST /api/todos (echoes the body with an _id), and DELETE /api/todos/:id (204).',
      hint: 'Use params for :id and new HttpResponse(null, { status: 204 }).',
      solution: `import { http, HttpResponse } from 'msw';

let todos = [
  { _id: '1', title: 'Learn RTL', done: false },
  { _id: '2', title: 'Learn MSW', done: false },
  { _id: '3', title: 'Write tests', done: true },
];

export const handlers = [
  http.get('*/api/todos', () => HttpResponse.json(todos)),
  http.post('*/api/todos', async ({ request }) => {
    const body = await request.json();
    const created = { _id: String(Date.now()), done: false, ...body };
    todos = [...todos, created];
    return HttpResponse.json(created, { status: 201 });
  }),
  http.delete('*/api/todos/:id', ({ params }) => {
    todos = todos.filter(t => t._id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];`,
    },
    {
      task: 'Write a test for a TodoApp: it loads todos, the user adds "Buy milk" via the input and Add button, and the new item appears in the list.',
      hint: 'findAllByRole("listitem"), user.type, user.click.',
      solution: `import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import TodoApp from './TodoApp';

it('adds a todo', async () => {
  const { user } = renderWithProviders(<TodoApp />);
  expect(await screen.findAllByRole('listitem')).toHaveLength(3);

  await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Buy milk');
  await user.click(screen.getByRole('button', { name: /add/i }));

  const list = screen.getByRole('list');
  expect(await within(list).findByText('Buy milk')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /new todo/i })).toHaveValue('');
});`,
    },
    {
      task: 'Test the RequireAuth route guard: a guest visiting /dashboard sees the login page; an admin-only route shows "Unauthorized" for a normal user.',
      hint: 'Render routes inside MemoryRouter with a fake AuthContext value.',
      solution: `function renderRoutes(route, authValue) {
  return render(
    <AuthContext value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
          <Route element={<RequireAuth />}><Route path="/dashboard" element={<h1>Dashboard</h1>} /></Route>
          <Route element={<RequireAuth roles={['admin']} />}><Route path="/admin" element={<h1>Admin</h1>} /></Route>
        </Routes>
      </MemoryRouter>
    </AuthContext>
  );
}

it('redirects guests to login', () => {
  renderRoutes('/dashboard', { user: null, status: 'guest' });
  expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
});

it('blocks non-admins', () => {
  renderRoutes('/admin', { user: { name: 'Ravi', role: 'user' }, status: 'authenticated' });
  expect(screen.getByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument();
});`,
    },
    {
      task: 'Add a coverage threshold to Vitest so CI fails below 80% lines and 70% branches, and add an npm script for CI.',
      hint: 'test.coverage.thresholds.',
      solution: `// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.{js,jsx}'],
      thresholds: { lines: 80, branches: 70, functions: 80, statements: 80 },
    },
  },
});

// package.json
// "scripts": { "test": "vitest", "test:ci": "vitest run --coverage" }`,
    },
  ],
  quiz: [
    { question: 'Which query should you use to wait for data loaded from an API?', options: ['getByText', 'queryByText', 'findByText', 'getByTestId'], answer: 2, explanation: 'findBy queries return a promise that retries until the element appears.' },
    { question: 'Which RTL query is highest priority?', options: ['getByRole', 'getByTestId', 'getByClassName', 'container.querySelector'], answer: 0, explanation: 'Role queries reflect how users and assistive tech find elements.' },
    { question: 'In MSW 2, how do you return JSON with status 500?', options: ['res(ctx.status(500))', 'rest.error(500)', 'throw 500', 'HttpResponse.json(body, { status: 500 })'], answer: 3, explanation: 'MSW 2 uses the Fetch API style HttpResponse class.' },
    { question: 'Why create a new QueryClient for each test?', options: ['It is faster', 'To avoid cached data leaking between tests', 'MSW requires it', 'To enable retries'], answer: 1, explanation: 'A shared cache makes tests depend on each other.' },
    { question: 'How should user-event calls be written in v14?', options: ['user.click(el) without await', 'fireEvent(user.click)', 'await user.click(el) after userEvent.setup()', 'act(user.click)'], answer: 2, explanation: 'All user-event APIs are async and should be awaited.' },
  ],
};
