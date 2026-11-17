export default {
  id: 'day-27-testing-vitest-rtl',
  title: 'Testing React: Vitest and React Testing Library Basics',
  module: 'Module 5: Advanced React',
  day: 27,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Tests let you change code with confidence. Learn the testing pyramid, set up Vitest with React Testing Library in a Vite project, write unit tests for functions and reducers, test components the way users use them (queries, user-event, async findBy), and mock fetch.',
  objectives: [
    'Explain unit, integration and end-to-end tests and why we test',
    'Set up Vitest, jsdom and React Testing Library in a Vite project',
    'Write tests with describe, it/test and expect matchers',
    'Render components, query by role/label/text and simulate user actions with user-event',
    'Test async UI with findBy and mock functions and fetch with vi.fn()',
  ],
  theory: [
    {
      heading: 'Why test, and what kinds of tests exist',
      content:
        'A test is code that checks other code automatically. Instead of clicking through the app after every change, you run `npm test` and get a green or red result in seconds.\n\nThe **testing pyramid**:\n- **Unit tests** (many, fast): one function or one small component in isolation (e.g. `formatPrice(1999)` returns "Rs 1,999")\n- **Integration tests** (some): several components working together (a form + list)\n- **End-to-end (E2E) tests** (few, slow): a real browser clicking through the real app (Playwright, Cypress)\n\nAnalogy: car manufacturing. Each bolt is tested (unit), then the engine assembly (integration), then a test drive (E2E).\n\nBenefits: catch bugs early, refactor safely, tests act as documentation.',
    },
    {
      heading: 'Setting up Vitest + React Testing Library',
      content:
        '**Vitest** is a fast test runner built for Vite (Jest-compatible API). **React Testing Library (RTL)** renders components into a fake DOM (**jsdom**) and gives you user-centric queries.\n\nInstall:\n`npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`\n\nConfigure Vite and add a script `"test": "vitest"`. Test files are named `*.test.jsx` or `*.spec.jsx` and usually live next to the component.\n\nNote: the single-file playground cannot run Vitest or jsdom. The playground examples below use a **tiny hand-written test runner** that runs inside the page and checks the live DOM, so you can see the same assertions pass or fail. The `code` blocks show real Vitest + RTL tests.',
      syntax:
        "// vite.config.js\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  test: {\n    environment: 'jsdom',\n    globals: true,\n    setupFiles: './src/setupTests.js',\n  },\n});\n\n// src/setupTests.js\nimport '@testing-library/jest-dom/vitest';   // adds toBeInTheDocument() etc.",
    },
    {
      heading: 'Anatomy of a test: describe, it, expect',
      content:
        '- `describe(\'name\', () => {...})` groups related tests\n- `it(\'does something\', () => {...})` or `test(...)`: one test case\n- `expect(actual).matcher(expected)`: an assertion\n\nCommon matchers: `toBe` (===), `toEqual` (deep equality for objects/arrays), `toBeTruthy`, `toContain`, `toHaveLength`, `toThrow`, `toHaveBeenCalledWith`. From jest-dom: `toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`, `toHaveValue`.\n\nFollow **Arrange - Act - Assert**: set up data, perform the action, check the result.',
      syntax:
        "// sum.test.js\nimport { describe, it, expect } from 'vitest';\nimport { sum } from './sum';\n\ndescribe('sum', () => {\n  it('adds two numbers', () => {\n    expect(sum(2, 3)).toBe(5);\n  });\n  it('works with negatives', () => {\n    expect(sum(-2, -3)).toBe(-5);\n  });\n});",
    },
    {
      heading: 'Testing components like a user',
      content:
        'RTL\'s guiding principle: **"The more your tests resemble the way your software is used, the more confidence they can give you."** Test what the user sees and does, not internal state or implementation details.\n\n- `render(<Counter />)` mounts the component into jsdom\n- `screen` gives queries over the whole document\n- Query priority: `getByRole` (best, e.g. `getByRole(\'button\', { name: /add/i })`), `getByLabelText`, `getByPlaceholderText`, `getByText`, and last `getByTestId`\n- Query variants: `getBy` (throws if missing), `queryBy` (returns null, use for "not in document"), `findBy` (async, waits for it to appear)\n- `userEvent.setup()` then `await user.click(button)`, `await user.type(input, \'hello\')` simulate real interactions',
      syntax:
        "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Counter from './Counter';\n\nit('increments when clicked', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});",
      tip: 'Avoid testing implementation details like state variable names or calling component methods. If you refactor useState to useReducer, good tests should still pass.',
    },
    {
      heading: 'Async UI and mocking',
      content:
        'When a component fetches data, the result appears later. Use `await screen.findByText(...)` (retries until it appears or times out) or `await waitFor(() => expect(...))`.\n\nTests should not hit real APIs (slow, flaky). **Mock** them:\n- `vi.fn()` creates a fake function that records calls: `expect(onSubmit).toHaveBeenCalledWith({ email: \'a@b.com\' })`\n- `vi.spyOn(globalThis, \'fetch\').mockResolvedValue(...)` replaces fetch with a fake response\n- `vi.mock(\'./api\')` replaces a whole module\n- Larger apps use **MSW (Mock Service Worker)** to fake the network layer\n\nReset mocks between tests with `afterEach(() => vi.restoreAllMocks())`.',
    },
    {
      heading: 'What to test and coverage',
      content:
        'Good things to test:\n- Pure logic: utility functions, reducers, selectors (easy and valuable)\n- Components: renders correct content for given props, reacts to user events, shows loading/error/empty states\n- Custom hooks: with `renderHook` from RTL\n- Critical user flows: login, checkout (E2E)\n\nRun `vitest --coverage` to see which lines are covered. Do not chase 100%; cover important behaviour and bug-prone code.\n\nComing next: Day 28 adds TypeScript to React.',
    },
  ],
  examples: [
    {
      title: 'Unit testing pure functions and a reducer',
      scenario: 'Test formatPrice and a cart reducer with describe/it/expect. The playground contains a mini test runner that prints pass/fail like Vitest.',
      steps: [
        'Write formatPrice and cartReducer in src/utils',
        'Create utils.test.js with describe blocks',
        'Use toBe for primitives and toEqual for objects',
        'Run npx vitest (in a real project)',
        'Run the playground: the mini runner shows the same results in the page',
      ],
      code: `// utils.test.js
import { describe, it, expect } from 'vitest';
import { formatPrice, cartReducer } from './utils';

describe('formatPrice', () => {
  it('formats with Rs and commas', () => {
    expect(formatPrice(1999)).toBe('Rs 1,999');
  });
  it('handles zero', () => {
    expect(formatPrice(0)).toBe('Rs 0');
  });
});

describe('cartReducer', () => {
  it('adds an item', () => {
    const next = cartReducer({ items: [] }, { type: 'add', item: { id: 1 } });
    expect(next).toEqual({ items: [{ id: 1, qty: 1 }] });
  });
  it('does not mutate the previous state', () => {
    const prev = { items: [] };
    cartReducer(prev, { type: 'add', item: { id: 1 } });
    expect(prev.items).toHaveLength(0);
  });
});`,
      playground: {
        jsx: `// ---------- code under test ----------
function formatPrice(n) {
  return 'Rs ' + n.toLocaleString('en-IN');
}
function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const found = state.items.find(i => i.id === action.item.id);
      if (found) return { items: state.items.map(i => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)) };
      return { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    default: return state;
  }
}

// ---------- tiny test runner (stand-in for Vitest) ----------
function expect(actual) {
  const fail = msg => { throw new Error(msg); };
  return {
    toBe: exp => { if (actual !== exp) fail('Expected ' + JSON.stringify(exp) + ', received ' + JSON.stringify(actual)); },
    toEqual: exp => { if (JSON.stringify(actual) !== JSON.stringify(exp)) fail('Expected ' + JSON.stringify(exp) + ', received ' + JSON.stringify(actual)); },
    toHaveLength: n => { if (actual.length !== n) fail('Expected length ' + n + ', received ' + actual.length); },
  };
}
function runSuite(suites) {
  const results = [];
  suites.forEach(([suite, tests]) => tests.forEach(([name, fn]) => {
    try { fn(); results.push({ suite, name, pass: true }); }
    catch (e) { results.push({ suite, name, pass: false, error: e.message }); }
  }));
  return results;
}

const suites = [
  ['formatPrice', [
    ['formats with Rs and commas', () => expect(formatPrice(1999)).toBe('Rs 1,999')],
    ['handles zero', () => expect(formatPrice(0)).toBe('Rs 0')],
    ['uses Indian grouping for lakhs', () => expect(formatPrice(150000)).toBe('Rs 1,50,000')],
  ]],
  ['cartReducer', [
    ['adds an item', () => expect(cartReducer({ items: [] }, { type: 'add', item: { id: 1 } })).toEqual({ items: [{ id: 1, qty: 1 }] })],
    ['increments qty for existing item', () => {
      const s = cartReducer({ items: [{ id: 1, qty: 1 }] }, { type: 'add', item: { id: 1 } });
      expect(s.items[0].qty).toBe(2);
    }],
    ['does not mutate previous state', () => {
      const prev = { items: [] };
      cartReducer(prev, { type: 'add', item: { id: 1 } });
      expect(prev.items).toHaveLength(0);
    }],
    ['(intentionally failing) expects wrong qty', () => {
      const s = cartReducer({ items: [] }, { type: 'add', item: { id: 7 } });
      expect(s.items[0].qty).toBe(5);
    }],
  ]],
];

function App() {
  const [results, setResults] = React.useState(null);
  const passed = results ? results.filter(r => r.pass).length : 0;
  return (
    <div style={{ fontFamily: 'monospace' }}>
      <button onClick={() => setResults(runSuite(suites))}>Run tests</button>
      {results && (
        <div>
          {results.map((r, i) => (
            <div key={i} style={{ color: r.pass ? 'green' : 'crimson' }}>
              {r.pass ? 'PASS' : 'FAIL'} {r.suite} &gt; {r.name}
              {!r.pass && <div style={{ marginLeft: 20 }}>{r.error}</div>}
            </div>
          ))}
          <p><b>Tests: {passed} passed, {results.length - passed} failed, {results.length} total</b></p>
        </div>
      )}
    </div>
  );
}`,
      },
      result: 'After clicking "Run tests": six green PASS lines and one red FAIL line ("Expected 5, received 1") followed by "Tests: 6 passed, 1 failed, 7 total".',
      explanation:
        'Pure functions are the easiest code to test: give input, check output. The intentionally failing test shows what a useful failure message looks like. Vitest prints the same kind of report in the terminal.',
    },
    {
      title: 'Testing a Counter component with RTL and user-event',
      scenario: 'Check that the counter starts at 0, increments on click, and that the Decrement button is disabled at 0.',
      steps: [
        'Write Counter.jsx with accessible buttons (visible text = accessible name)',
        'Create Counter.test.jsx: render, query by role, click with user-event, assert',
        'Run npx vitest',
        'In the playground, the mini runner queries the live DOM of the rendered component and clicks the real button',
      ],
      code: `// Counter.jsx
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(c => c - 1)} disabled={count === 0}>Decrement</button>
    </div>
  );
}

// Counter.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => {
  it('starts at 0 with Decrement disabled', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled();
  });

  it('increments on click', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeEnabled();
  });
});`,
      playground: {
        jsx: `function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div id="counter-under-test" style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>{' '}
      <button onClick={() => setCount(c => c - 1)} disabled={count === 0}>Decrement</button>
    </div>
  );
}

// Mini "screen" helpers working on the real DOM (stand-in for RTL)
const tick = () => new Promise(r => setTimeout(r, 0));
const root = () => document.getElementById('counter-under-test');
const getByText = text => {
  const el = [...root().querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent === text);
  if (!el) throw new Error('Unable to find element with text: ' + text);
  return el;
};
const getButton = name => {
  const el = [...root().querySelectorAll('button')].find(b => b.textContent === name);
  if (!el) throw new Error('Unable to find button: ' + name);
  return el;
};

async function runTests(resetCounter) {
  const out = [];
  const test = async (name, fn) => {
    try { await fn(); out.push({ name, pass: true }); } catch (e) { out.push({ name, pass: false, error: e.message }); }
  };
  await resetCounter();
  await test('starts at 0 with Decrement disabled', async () => {
    getByText('Count: 0');
    if (!getButton('Decrement').disabled) throw new Error('Decrement should be disabled');
  });
  await test('increments on click', async () => {
    getButton('Increment').click();
    await tick();
    getByText('Count: 1');
    if (getButton('Decrement').disabled) throw new Error('Decrement should be enabled');
  });
  await test('decrements back to 0', async () => {
    getButton('Decrement').click();
    await tick();
    getByText('Count: 0');
  });
  return out;
}

function App() {
  const [key, setKey] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const resetCounter = async () => { setKey(k => k + 1); await tick(); };   // like a fresh render()
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Counter key={key} />
      <button onClick={async () => setResults(await runTests(resetCounter))}>Run component tests</button>
      <ul style={{ fontFamily: 'monospace' }}>
        {results.map(r => (
          <li key={r.name} style={{ color: r.pass ? 'green' : 'crimson' }}>
            {r.pass ? 'PASS' : 'FAIL'} {r.name} {r.error ? ' - ' + r.error : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      result: 'Clicking "Run component tests" remounts the counter, clicks the buttons automatically and lists three green PASS lines.',
      explanation:
        'The tests interact with the component the way a user does: find visible text and buttons, click, and check what is shown. RTL + user-event does the same in jsdom, with better queries (getByRole) and automatic waiting.',
    },
    {
      title: 'Async component test with mocked fetch',
      scenario: 'A UserCard fetches a user and shows the name. Test the loading state and the final name without calling the real API.',
      steps: [
        'Write UserCard that fetches /users/1 and shows "Loading..." then the name',
        'In the test, mock fetch with vi.spyOn(globalThis, "fetch").mockResolvedValue(...)',
        'Assert "Loading..." appears, then await findByText for the name',
        'Assert fetch was called with the expected URL',
        'In the playground, fetch is replaced with a fake function to show the idea',
      ],
      code: `// UserCard.test.jsx
import { render, screen } from '@testing-library/react';
import { vi, afterEach } from 'vitest';
import UserCard from './UserCard';

afterEach(() => vi.restoreAllMocks());

it('shows the user name after loading', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: 'Leanne Graham' }),
  });

  render(<UserCard id={1} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText('Leanne Graham')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users/1');
});

it('shows an error when the request fails', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 500 });
  render(<UserCard id={1} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 500');
});`,
      playground: {
        jsx: `function UserCard({ id, fetchFn }) {
  const [state, setState] = React.useState({ loading: true, user: null, error: null });
  React.useEffect(() => {
    let ignore = false;
    fetchFn('https://jsonplaceholder.typicode.com/users/' + id)
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(user => { if (!ignore) setState({ loading: false, user, error: null }); })
      .catch(err => { if (!ignore) setState({ loading: false, user: null, error: err.message }); });
    return () => { ignore = true; };
  }, [id, fetchFn]);
  if (state.loading) return <p>Loading...</p>;
  if (state.error) return <p role="alert" style={{ color: 'crimson' }}>{state.error}</p>;
  return <h3>{state.user.name}</h3>;
}

// vi.fn()-like mock: records calls and returns a fake response
function makeMock(response, delay = 600) {
  const mock = (...args) => {
    mock.calls.push(args);
    return new Promise(r => setTimeout(() => r(response), delay));
  };
  mock.calls = [];
  return mock;
}

function App() {
  const [scenario, setScenario] = React.useState('success');
  const fetchFn = React.useMemo(() => (
    scenario === 'success'
      ? makeMock({ ok: true, json: async () => ({ id: 1, name: 'Leanne Graham (mocked)' }) })
      : makeMock({ ok: false, status: 500 })
  ), [scenario]);
  const [calls, setCalls] = React.useState([]);
  React.useEffect(() => { const t = setTimeout(() => setCalls(fetchFn.calls.slice()), 700); return () => clearTimeout(t); }, [fetchFn]);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => setScenario('success')}>Mock: success</button>{' '}
      <button onClick={() => setScenario('error')}>Mock: HTTP 500</button>
      <div style={{ border: '1px solid #ccc', padding: 8, marginTop: 8 }}>
        <UserCard key={scenario} id={1} fetchFn={fetchFn} />
      </div>
      <p><small>fetch mock called with: {calls.map(c => c[0]).join(', ') || '(waiting)'}</small></p>
    </div>
  );
}`,
      },
      result: '"Loading..." first, then "Leanne Graham (mocked)" without any real network call. Choosing "Mock: HTTP 500" shows the red "HTTP 500" alert. The page lists the URL the mock was called with.',
      explanation:
        'Mocks replace the network with predictable data so tests are fast and reliable. findBy queries wait for the async result. Checking the call arguments verifies the component requested the right URL.',
    },
  ],
  interview: [
    { q: 'What is the difference between unit, integration and E2E tests?', a: 'Unit tests check a single function/component in isolation; integration tests check several units working together; end-to-end tests run the whole app in a real browser like a user (Playwright/Cypress).', level: 'Easy' },
    { q: 'What is Vitest?', a: 'A fast, Vite-native test runner with a Jest-compatible API (describe, it, expect, vi mocks), sharing Vite\'s config and transforms.', level: 'Easy' },
    { q: 'What is React Testing Library\'s philosophy?', a: 'Test components the way users use them: query by accessible roles, labels and text, interact with events, and assert on visible output, avoiding implementation details.', level: 'Medium' },
    { q: 'getBy vs queryBy vs findBy?', a: 'getBy throws if not found (synchronous). queryBy returns null if not found (use for asserting absence). findBy returns a Promise that resolves when the element appears (async, retries until timeout).', level: 'Medium' },
    { q: 'Which query should you prefer and why?', a: 'getByRole, because it matches how assistive technology sees the page and encourages accessible markup. Fall back to label, placeholder, text, and finally test ids.', level: 'Medium' },
    { q: 'toBe vs toEqual?', a: 'toBe uses Object.is (same value/reference). toEqual recursively compares object and array contents.', level: 'Easy' },
    { q: 'Why use user-event instead of fireEvent?', a: 'user-event simulates complete user interactions (focus, keydown, input, keyup, click sequence), producing more realistic tests than dispatching a single synthetic event with fireEvent.', level: 'Medium' },
    { q: 'How do you test a component that fetches data?', a: 'Mock the network (vi.spyOn(fetch), vi.mock the API module, or MSW), render, assert the loading state, then await findBy... for the loaded data; also test the error state.', level: 'Hard' },
    { q: 'What is vi.fn() used for?', a: 'Creating mock functions that record calls and arguments and can return configured values, e.g. to verify an onSubmit prop was called with certain data.', level: 'Medium' },
    { q: 'What are implementation details, and why avoid testing them?', a: 'Internal things like state variable names, private methods or component instance internals. Testing them makes tests break on harmless refactors without catching real user-facing bugs.', level: 'Medium' },
    { q: 'How do you test a custom hook?', a: 'With renderHook from @testing-library/react: const { result } = renderHook(() => useCounter()); act(() => result.current.increment()); expect(result.current.count).toBe(1).', level: 'Hard' },
    { q: 'Is 100% code coverage a good goal?', a: 'Not necessarily. Coverage shows lines executed, not correctness. Focus on critical behaviour, edge cases and bug-prone logic; high coverage with weak assertions gives false confidence.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write Vitest tests for a validateEmail(email) function: valid email, missing @, missing domain, empty string.',
      hint: 'Use describe + several it blocks and toBe(true/false).',
      solution: `// validateEmail.js
export const validateEmail = email => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);

// validateEmail.test.js
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validateEmail';

describe('validateEmail', () => {
  it('accepts a normal email', () => expect(validateEmail('dev@example.com')).toBe(true));
  it('rejects missing @', () => expect(validateEmail('dev.example.com')).toBe(false));
  it('rejects missing domain', () => expect(validateEmail('dev@')).toBe(false));
  it('rejects empty string', () => expect(validateEmail('')).toBe(false));
});`,
    },
    {
      task: 'Test a LoginForm: typing email and password and clicking "Log in" calls the onSubmit prop with { email, password }. Also test that the button is disabled while the email is empty.',
      hint: 'const onSubmit = vi.fn(); await user.type(screen.getByLabelText(/email/i), "...").',
      solution: `// LoginForm.jsx
export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ email, password }); }}>
      <label>Email <input value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password <input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={!email}>Log in</button>
    </form>
  );
}

// LoginForm.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoginForm from './LoginForm';

it('disables the button when email is empty', () => {
  render(<LoginForm onSubmit={vi.fn()} />);
  expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
});

it('submits email and password', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(/email/i), 'a@b.com');
  await user.type(screen.getByLabelText(/password/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' });
});`,
    },
    {
      task: 'Test a TodoList component: adding a todo shows it in the list, and the "No todos" message disappears.',
      hint: 'Use queryByText to assert something is NOT in the document.',
      solution: `// TodoList.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

it('adds a todo and hides the empty message', async () => {
  const user = userEvent.setup();
  render(<TodoList />);
  expect(screen.getByText('No todos')).toBeInTheDocument();

  await user.type(screen.getByPlaceholderText('New todo'), 'Write tests');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  expect(screen.getByRole('listitem')).toHaveTextContent('Write tests');
  expect(screen.queryByText('No todos')).not.toBeInTheDocument();
});`,
    },
    {
      task: 'Test a useCounter custom hook with renderHook and act: increment, decrement and reset.',
      hint: 'import { renderHook, act } from "@testing-library/react".',
      solution: `// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

it('increments, decrements and resets', () => {
  const { result } = renderHook(() => useCounter(5));
  act(() => result.current.increment());
  expect(result.current.count).toBe(6);
  act(() => result.current.decrement());
  act(() => result.current.decrement());
  expect(result.current.count).toBe(4);
  act(() => result.current.reset());
  expect(result.current.count).toBe(5);
});`,
    },
  ],
  quiz: [
    {
      question: 'Which query returns null instead of throwing when the element is missing?',
      options: ['getByText', 'findByText', 'queryByText', 'getAllByText'],
      answer: 2,
      explanation: 'queryBy* is used to assert that something is NOT present.',
    },
    {
      question: 'Which query is recommended first by React Testing Library?',
      options: ['getByRole', 'getByTestId', 'getByClassName', 'querySelector'],
      answer: 0,
      explanation: 'Role-based queries reflect how users and assistive tech find elements.',
    },
    {
      question: 'What should you use to wait for data that appears after a fetch?',
      options: ['getByText immediately', 'setTimeout with 5 seconds', 'queryByText', 'await findByText(...)'],
      answer: 3,
      explanation: 'findBy queries retry until the element appears or time out.',
    },
    {
      question: 'Which matcher deep-compares two objects?',
      options: ['toBe', 'toEqual', 'toBeTruthy', 'toContain'],
      answer: 1,
      explanation: 'toEqual compares contents recursively; toBe checks identity.',
    },
    {
      question: 'Which environment lets Vitest render React components without a real browser?',
      options: ['node only', 'jsdom', 'webpack', 'babel'],
      answer: 1,
      explanation: 'jsdom provides a simulated DOM in Node.',
    },
  ],
};
