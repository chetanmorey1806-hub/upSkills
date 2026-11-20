// Shared by the playgrounds below: a tiny in-browser imitation of Vitest + React Testing Library + user-event.
const MINI_TESTING_LIBRARY = `const { useState, useEffect } = React;

// ===== mini testing library (plain-JS stand-in for Vitest + RTL + user-event) =====
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let mounted = [];
let uid = 0;
let setHostItems = null;

// Test UIs are rendered through portals into detached-looking sandboxes (like RTL's container)
function TestHost() {
  const [items, setItems] = useState([]);
  setHostItems = setItems;
  return items.map(it => ReactDOM.createPortal(<React.Fragment key={it.id}>{it.ui}</React.Fragment>, it.container));
}
function render(ui) {
  const container = document.createElement("div");
  container.className = "test-sandbox";
  document.body.appendChild(container);
  const id = ++uid;
  ReactDOM.flushSync(() => setHostItems(list => [...list, { id, ui, container }]));
  mounted.push(container);
  return { container, unmount: () => ReactDOM.flushSync(() => setHostItems(list => list.filter(x => x.id !== id))) };
}
function cleanup() {
  ReactDOM.flushSync(() => setHostItems([]));
  mounted.forEach(c => c.remove());
  mounted = [];
}

const ROLES = {
  button: "button, [role=button]",
  textbox: "input:not([type]), input[type=text], input[type=email], input[type=search], input[type=tel], textarea, [role=textbox]",
  heading: "h1, h2, h3, h4, h5, h6, [role=heading]",
  listitem: "li, [role=listitem]",
  checkbox: "input[type=checkbox], [role=checkbox]",
  link: "a[href]",
};
const matches = (text, m) => (m instanceof RegExp ? m.test(text) : text === m);
function accessibleName(el) {
  if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
  if (el.id) { const l = document.querySelector('label[for="' + el.id + '"]'); if (l) return l.textContent.trim(); }
  const wrap = el.closest("label");
  if (wrap && wrap !== el) return wrap.textContent.trim();
  return (el.textContent || "").trim();
}
const sandboxes = () => [...document.querySelectorAll(".test-sandbox")];
const allEls = sel => sandboxes().flatMap(c => [...c.querySelectorAll(sel)]);
function single(list, what) {
  if (list.length === 0) throw new Error("Unable to find " + what);
  if (list.length > 1) throw new Error("Found multiple elements for " + what);
  return list[0];
}
const screen = {
  queryAllByRole: (role, { name } = {}) =>
    allEls(ROLES[role] || "[role=" + role + "]").filter(el => name === undefined || matches(accessibleName(el), name)),
  getByRole: (role, opts = {}) => single(screen.queryAllByRole(role, opts), 'role "' + role + '"' + (opts.name ? " with name " + opts.name : "")),
  queryByRole: (role, opts) => screen.queryAllByRole(role, opts)[0] || null,
  queryAllByText: m => allEls("*").filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && matches(el.textContent.trim(), m)),
  getByText: m => single(screen.queryAllByText(m), "text " + m),
  queryByText: m => screen.queryAllByText(m)[0] || null,
  getByLabelText: m => single(allEls("input, textarea, select").filter(el => matches(accessibleName(el), m)), "label " + m),
  findByText: m => waitFor(() => screen.getByText(m)),
  findByRole: (r, o) => waitFor(() => screen.getByRole(r, o)),
  findAllByRole: (r, o) => waitFor(() => { const l = screen.queryAllByRole(r, o); if (!l.length) throw new Error("Unable to find role " + r); return l; }),
};
async function waitFor(fn, { timeout = 2000 } = {}) {
  const start = Date.now();
  for (;;) {
    try { return fn(); } catch (e) { if (Date.now() - start > timeout) throw e; await sleep(20); }
  }
}
const userEvent = {
  setup: () => ({
    async click(el) { el.focus && el.focus(); el.click(); await sleep(0); },
    async type(el, text) {
      el.focus();
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setValue = Object.getOwnPropertyDescriptor(proto, "value").set;
      for (const ch of text) {
        setValue.call(el, el.value + ch);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(0);
      }
    },
  }),
};
const vi = {
  fn(impl = () => {}) {
    const f = (...args) => { f.mock.calls.push(args); return impl(...args); };
    f.mock = { calls: [] };
    return f;
  },
};
function expect(actual) {
  const fail = msg => { throw new Error(msg); };
  const inDoc = () => actual && document.body.contains(actual);
  const api = {
    toBe: v => { if (!Object.is(actual, v)) fail("Expected " + JSON.stringify(v) + ", received " + JSON.stringify(actual)); },
    toEqual: v => { if (JSON.stringify(actual) !== JSON.stringify(v)) fail("Expected " + JSON.stringify(v) + ", received " + JSON.stringify(actual)); },
    toHaveLength: n => { if (actual.length !== n) fail("Expected length " + n + ", received " + actual.length); },
    toBeInTheDocument: () => { if (!inDoc()) fail("Element is not in the document"); },
    toHaveTextContent: m => { const t = actual.textContent; if (!(m instanceof RegExp ? m.test(t) : t.includes(m))) fail('Expected text "' + m + '", received "' + t + '"'); },
    toBeDisabled: () => { if (!actual.disabled) fail("Expected element to be disabled"); },
    toHaveBeenCalledTimes: n => { if (actual.mock.calls.length !== n) fail("Expected " + n + " calls, received " + actual.mock.calls.length); },
    toHaveBeenCalledWith: (...args) => { if (!actual.mock.calls.some(c => JSON.stringify(c) === JSON.stringify(args))) fail("Not called with " + JSON.stringify(args) + ". Calls: " + JSON.stringify(actual.mock.calls)); },
  };
  api.not = {
    toBeInTheDocument: () => { if (inDoc()) fail("Expected element NOT to be in the document"); },
    toBeDisabled: () => { if (actual.disabled) fail("Expected element to be enabled"); },
    toHaveBeenCalled: () => { if (actual.mock.calls.length) fail("Expected no calls, received " + actual.mock.calls.length); },
  };
  return api;
}

function TestRunner({ beforeEach, afterAll }) {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  async function run() {
    setRunning(true);
    setResults([]);
    await sleep(10);
    const out = [];
    for (const t of tests) {
      const start = performance.now();
      try {
        if (beforeEach) beforeEach();
        await t.fn();
        out.push({ name: t.name, ok: true, ms: performance.now() - start });
      } catch (e) {
        out.push({ name: t.name, ok: false, ms: performance.now() - start, error: e.message });
      } finally {
        cleanup();
      }
      setResults([...out]);
    }
    if (afterAll) afterAll();
    setRunning(false);
  }
  useEffect(() => { const id = setTimeout(run, 50); return () => clearTimeout(id); }, []);
  const passed = results.filter(r => r.ok).length;
  return (
    <div className="runner">
      <TestHost />
      <button onClick={run} disabled={running}>{running ? "Running…" : "▶ Re-run tests"}</button>
      {results.map(r => (
        <div key={r.name} className={r.ok ? "pass" : "fail"}>
          {r.ok ? "✓" : "✗"} {r.name} <small>({r.ms.toFixed(0)} ms)</small>
          {r.error && <div className="msg">{r.error}</div>}
        </div>
      ))}
      {!running && results.length > 0 && (
        <p className="sum">Tests: {passed} passed, {results.length - passed} failed, {results.length} total</p>
      )}
    </div>
  );
}
// ===== end of mini testing library =====
`;

const RUNNER_CSS = `.test-sandbox { position: absolute; left: -10000px; top: 0; width: 400px; }
.runner { font-family: ui-monospace, monospace; font-size: 13px; }
.runner .pass { color: #15803d; } .runner .fail { color: #b91c1c; }
.runner .msg { margin-left: 18px; color: #7f1d1d; }
.runner small { color: #6b7280; }
.sum { font-weight: 700; }
.demo { border: 1px dashed #cbd5e1; border-radius: 10px; padding: 10px; margin: 10px 0; max-width: 380px; font-family: system-ui, sans-serif; }`;

export default {
  id: 'day-53-testing-rtl-msw-playwright',
  title: 'Testing like the Industry: React Testing Library + user-event, MSW API Mocking, Playwright End-to-End Basics',
  module: 'Module 11: Testing, Quality & Deployment',
  day: 53,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Companies do not merge code without tests. Building on Day 27 (Vitest + RTL basics), today you write tests the way product teams do: integration tests that use the app like a user (accessible queries + user-event), API calls mocked at the network level with Mock Service Worker (MSW), and a few critical end-to-end journeys in a real browser with Playwright, all running in CI.',
  objectives: [
    'Explain the testing trophy and decide what to test with unit, integration and E2E tests',
    'Write user-centric tests with React Testing Library queries (getByRole, findBy*) and user-event',
    'Mock REST APIs with MSW handlers, override them per test for error states, and avoid mocking fetch by hand',
    'Write and debug Playwright tests with locators, auto-waiting, codegen and the trace viewer',
    'Organise test files, coverage and CI so that tests are fast, reliable and not flaky',
  ],
  theory: [
    {
      heading: 'What companies test: the testing trophy',
      content:
        'Kent C. Dodds\' **testing trophy** describes a modern frontend test strategy, from bottom to top:\n\n1. **Static**: ESLint + TypeScript catch typos and type errors for free\n2. **Unit**: pure functions, reducers, utilities, custom hooks (Vitest)\n3. **Integration** (the biggest layer): render a feature (form, page, list) with its children, real context/providers and mocked network; interact like a user and assert what the user sees (Vitest + RTL + user-event + MSW)\n4. **End-to-end (E2E)**: a few critical journeys (login, add to cart, checkout, payment) in real browsers against a running app (Playwright or Cypress)\n\nGuiding principle: **"The more your tests resemble the way your software is used, the more confidence they can give you."** Test **behaviour**, not implementation details (state variable names, internal functions, CSS classes). Then refactoring does not break tests, but real bugs do.\n\nWhat NOT to test: third-party libraries themselves, exact styling, every trivial component, snapshot files nobody reads.',
      points: [
        'Typical stack in 2025-26: Vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom + MSW + Playwright',
        'Jest is still common in older/CRA projects; the RTL code is the same',
        'Coverage is a guide, not a goal: 70-80% on business logic is common; 100% is rarely worth it',
      ],
    },
    {
      heading: 'React Testing Library queries and user-event',
      content:
        '**Query priority** (from the RTL docs). Prefer queries everyone can perceive:\n1. `getByRole("button", { name: /add to cart/i })`: the best, also checks accessibility\n2. `getByLabelText("Email")` for form fields\n3. `getByPlaceholderText`, `getByText`, `getByDisplayValue`\n4. `getByAltText`, `getByTitle`\n5. `getByTestId` only as a last resort\n\n**Query variants:**\n- `getBy…`: element must exist now (throws otherwise)\n- `queryBy…`: returns `null` if missing: use to assert something is NOT there\n- `findBy…`: returns a Promise, waits (default 1 s) for async UI such as API data\n- `getAllBy…` / `findAllBy…`: multiple elements\n\n**user-event v14** simulates real user interactions (focus, keydown, input, keyup, click) and is async: create `const user = userEvent.setup()` at the start of each test and `await user.click(...)`, `await user.type(...)`, `await user.keyboard("{Enter}")`, `await user.selectOptions(...)`, `await user.upload(...)`. Prefer it over `fireEvent`.\n\n`screen.debug()` prints the current DOM; `screen.logTestingPlaygroundURL()` suggests the best query.',
      syntax: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("adds an item to the cart", async () => {
  const user = userEvent.setup();
  render(<ProductCard product={{ id: 1, title: "Kurta", price: 899 }} />);
  await user.click(screen.getByRole("button", { name: /add to cart/i }));
  expect(screen.getByRole("status")).toHaveTextContent("Added");
});`,
      tip: 'Common mistakes: using container.querySelector instead of screen queries, wrapping everything in act() manually (RTL already does it), forgetting await before user-event or findBy, and using waitFor for something findBy already does.',
    },
    {
      heading: 'Vitest setup for React projects',
      content:
        'Install: `npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw`\n\nConfigure `test` in `vite.config.js` with `environment: "jsdom"` and a `setupFiles` file that adds jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`…), starts the MSW server and cleans up after each test.\n\n**Conventions used in companies:**\n- Test files next to the code: `LoginForm.jsx` + `LoginForm.test.jsx`\n- A custom `renderWithProviders(ui, { route, user })` in `src/test/utils.jsx` that wraps Router, QueryClientProvider (with `retry: false`), Theme and Auth providers\n- **Arrange, Act, Assert** structure; one behaviour per test; descriptive names: "shows an error when the password is too short"\n- `vi.fn()` for callback props, `vi.mock("module")` for modules, `vi.useFakeTimers()` for debounce/timers\n- Scripts: `"test": "vitest"`, `"test:run": "vitest run"`, `"coverage": "vitest run --coverage"`',
      syntax: `// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.js", css: false },
});

// src/test/setup.js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => { server.resetHandlers(); cleanup(); });
afterAll(() => server.close());`,
    },
    {
      heading: 'Mock Service Worker (MSW): mock the network, not fetch',
      content:
        'Instead of `vi.mock("axios")` or replacing `fetch` in every test, **MSW intercepts requests at the network level** and returns mock responses. Your component, Axios instance, TanStack Query and interceptors run exactly as in production.\n\n- Write **handlers** once (`src/test/mocks/handlers.js`) with `http.get`, `http.post`… and `HttpResponse.json(...)` (MSW v2 API)\n- In Node tests use `setupServer(...handlers)` from `msw/node`; in the browser (dev mode or Storybook) use `setupWorker` from `msw/browser`\n- Override per test with `server.use(http.get(url, () => HttpResponse.json({ message: "Server down" }, { status: 500 })))` to test **error states**, empty states and slow responses (`await delay(2000)`)\n- `onUnhandledRequest: "error"` makes tests fail if a component calls an API you forgot to mock\n- The same handlers power **frontend development before the backend is ready**: a big reason companies adopt MSW',
      syntax: `// src/test/mocks/handlers.js
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://dummyjson.com/products", () =>
    HttpResponse.json({ products: [{ id: 1, title: "Kurta", price: 899 }], total: 1 })),
  http.post("https://dummyjson.com/auth/login", async ({ request }) => {
    const { username } = await request.json();
    if (username !== "emilys") return HttpResponse.json({ message: "Invalid credentials" }, { status: 400 });
    return HttpResponse.json({ accessToken: "fake-token", firstName: "Emily" });
  }),
];

// src/test/mocks/server.js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);`,
    },
    {
      heading: 'Playwright end-to-end basics',
      content:
        '**Playwright** (by Microsoft) drives real Chromium, Firefox and WebKit browsers. E2E tests start your app (`npm run dev` or a preview build) and click through it like a user.\n\n- Setup: `npm init playwright@latest` creates `playwright.config.js`, an `e2e/` folder and a GitHub Actions workflow\n- **Locators** mirror RTL: `page.getByRole("button", { name: "Login" })`, `page.getByLabel("Email")`, `page.getByText("Order placed")`\n- **Auto-waiting**: actions wait until elements are visible and enabled; web-first assertions like `await expect(locator).toBeVisible()` retry until timeout: no manual sleeps\n- `webServer` in the config starts the app automatically before tests\n- `npx playwright codegen http://localhost:5173` records your clicks into test code\n- `npx playwright test --ui` for interactive mode; `--headed` to watch; **trace viewer** (`trace: "on-first-retry"`) shows screenshots, DOM and network for every step of a failed CI run\n- `page.route()` can mock network responses; `storageState` reuses a logged-in session across tests\n\nKeep E2E tests **few and critical** (login, search, add to cart, checkout) because they are slower and more fragile than integration tests.',
      syntax: `// e2e/checkout.spec.js
import { test, expect } from "@playwright/test";

test("user can add a product to the cart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /kurta/i }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("link", { name: /cart \\(1\\)/i })).toBeVisible();
});`,
    },
    {
      heading: 'Flaky tests, CI and the playground note',
      content:
        '**Flaky tests** pass sometimes and fail sometimes: the team stops trusting them. Typical causes and fixes:\n- Fixed `setTimeout` waits → use `findBy`, `waitFor` or Playwright auto-waiting\n- Tests depending on each other or on order → each test sets up its own data; MSW `resetHandlers()` after each test\n- Real dates/random values → `vi.useFakeTimers()` / `vi.setSystemTime()`, seed data\n- Real network calls → MSW with `onUnhandledRequest: "error"`\n- Animations in E2E → disable them in the test environment\n\n**CI**: run `vitest run --coverage` on every pull request, and Playwright on PRs to main (with sharding for speed). Tests must pass before merge (branch protection). Day 55 builds this pipeline.\n\n**Playground note**: the playground cannot install Vitest, RTL, MSW or Playwright. The demos below include a ~150-line **mini testing library** that imitates `render`, `screen`, `userEvent`, `vi.fn`, `expect` and an MSW-like `setupServer` in the browser, so you can see real-looking tests run and fail. The `code` blocks contain the real test code for a Vite project.',
    },
  ],
  examples: [
    {
      title: 'Integration test: LoginForm with accessible queries, user-event and vi.fn',
      scenario: 'A login form must show validation errors, disable the button while submitting and call onLogin with the typed values. Write the tests a reviewer would expect in the pull request.',
      steps: [
        'Create LoginForm.jsx with labelled inputs, a submit button and a role="alert" error',
        'Create LoginForm.test.jsx; in each test call userEvent.setup() and render(<LoginForm onLogin={onLogin} />)',
        'Find fields with getByLabelText and the button with getByRole("button", { name: /log in/i })',
        'Type with await user.type, click with await user.click',
        'Assert on what the user sees (alert text) and on the mock: toHaveBeenCalledWith',
        'Run npx vitest (or watch the playground run the same tests); one test is intentionally wrong to show a failure',
      ],
      code: `// src/features/auth/LoginForm.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  test("shows an error when email is invalid", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText("Email"), "rahul@");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText("Email"), "  rahul@example.in ");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(onLogin).toHaveBeenCalledWith({ email: "rahul@example.in", password: "secret123" });
  });
});`,
      playground: {
        jsx: MINI_TESTING_LIBRARY + `
// ===== component under test =====
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!/^\\S+@\\S+\\.\\S+$/.test(cleanEmail)) return setError("Please enter a valid email address");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setError("");
    setLoading(true);
    try { await onLogin({ email: cleanEmail, password }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
    </form>
  );
}

// ===== tests (same style as LoginForm.test.jsx) =====
test("shows an error when email is invalid", async () => {
  const user = userEvent.setup();
  const onLogin = vi.fn();
  render(<LoginForm onLogin={onLogin} />);
  await user.type(screen.getByLabelText("Email"), "rahul@");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
  expect(onLogin).not.toHaveBeenCalled();
});

test("shows an error when password is too short", async () => {
  const user = userEvent.setup();
  render(<LoginForm onLogin={vi.fn()} />);
  await user.type(screen.getByLabelText("Email"), "rahul@example.in");
  await user.type(screen.getByLabelText("Password"), "123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");
});

test("submits trimmed values and disables the button while loading", async () => {
  const user = userEvent.setup();
  const onLogin = vi.fn(() => sleep(200));
  render(<LoginForm onLogin={onLogin} />);
  await user.type(screen.getByLabelText("Email"), "  rahul@example.in ");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(onLogin).toHaveBeenCalledWith({ email: "rahul@example.in", password: "secret123" });
  expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  await screen.findByRole("button", { name: "Log in" }); // enabled again after the promise resolves
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("(intentionally failing) expects the wrong button text", async () => {
  render(<LoginForm onLogin={vi.fn()} />);
  screen.getByRole("button", { name: "Sign in" });
});

function App() {
  return (
    <div>
      <TestRunner />
      <div className="demo"><b>Try the real component:</b><LoginForm onLogin={v => sleep(800).then(() => alert("Logged in as " + v.email))} /></div>
    </div>
  );
}`,
        css: RUNNER_CSS + `
.demo form { display: grid; gap: 4px; }
.demo input { padding: 6px; }
.demo [role=alert] { color: #b91c1c; margin: 0; }`,
      },
      result: 'Three green ✓ tests and one red ✗ test: Unable to find role "button" with name Sign in, then "Tests: 3 passed, 1 failed, 4 total". Below the runner you can use the same form yourself.',
      explanation:
        'The tests never look at state variables or CSS classes. They find elements the way users and screen readers do (label text, role + accessible name), act with user-event, and assert on visible output and on the vi.fn() callback. Because getByRole requires a correct accessible name, the tests also protect accessibility. The failing test shows how a clear error message points straight to the problem. The mini library imitates RTL so it can run in the playground.',
    },
    {
      title: 'Mocking APIs with MSW: loading, success, error and retry states',
      scenario: 'A ProductList fetches products from https://dummyjson.com/products. Test all three states without hitting the real server: loading → list, server error → message, and retry → list.',
      steps: [
        'Create handlers.js with http.get("https://dummyjson.com/products", ...) returning two products',
        'Start the server in setup.js (listen / resetHandlers / close)',
        'Test success: render and await screen.findAllByRole("listitem")',
        'Test error: server.use(...) returns status 500 for this test only, then assert the alert',
        'Test retry: first call fails, second succeeds; click Retry and await the products',
      ],
      code: `// src/features/products/ProductList.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { ProductList } from "./ProductList";

const URL = "https://dummyjson.com/products";

test("shows products from the API", async () => {
  render(<ProductList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  const items = await screen.findAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(screen.getByText("Cotton Kurta · ₹899")).toBeInTheDocument();
});

test("shows an error message when the server fails", async () => {
  server.use(http.get(URL, () => HttpResponse.json({ message: "Down" }, { status: 500 })));
  render(<ProductList />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load products");
});

test("retry loads products after a failure", async () => {
  const user = userEvent.setup();
  server.use(http.get(URL, () => HttpResponse.json({}, { status: 500 }), { once: true }));
  render(<ProductList />);
  await user.click(await screen.findByRole("button", { name: /retry/i }));
  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
});`,
      playground: {
        jsx: MINI_TESTING_LIBRARY + `
// ===== mini MSW (plain-JS stand-in for msw: http, HttpResponse, setupServer) =====
const http = {
  get: (url, resolver, opts = {}) => ({ method: "GET", url, resolver, once: !!opts.once }),
  post: (url, resolver, opts = {}) => ({ method: "POST", url, resolver, once: !!opts.once }),
};
const HttpResponse = {
  json: (body, init = {}) => new Response(JSON.stringify(body), { status: init.status || 200, headers: { "Content-Type": "application/json" } }),
};
function setupServer(...initial) {
  let handlers = [...initial];
  const realFetch = window.fetch.bind(window);
  return {
    listen() {
      window.fetch = async (input, init = {}) => {
        const url = String(typeof input === "string" ? input : input.url);
        const method = (init.method || "GET").toUpperCase();
        const h = handlers.find(x => x.method === method && url.split("?")[0] === x.url);
        if (!h) throw new Error("[MSW] Unhandled request: " + method + " " + url);
        if (h.once) handlers = handlers.filter(x => x !== h);
        await sleep(40); // simulated latency
        return h.resolver({ request: { url, method, json: async () => JSON.parse(init.body || "null") } });
      };
    },
    use: (...overrides) => { handlers = [...overrides, ...handlers]; }, // overrides win
    resetHandlers: () => { handlers = [...initial]; },
    close: () => { window.fetch = realFetch; },
  };
}

// ===== handlers.js =====
const URL = "https://dummyjson.com/products";
const server = setupServer(
  http.get(URL, () => HttpResponse.json({
    products: [{ id: 1, title: "Cotton Kurta", price: 899 }, { id: 2, title: "Steel Water Bottle", price: 349 }],
    total: 2,
  }))
);

// ===== component under test =====
function ProductList() {
  const [state, setState] = useState({ status: "loading", products: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let ignore = false;
    setState(s => ({ ...s, status: "loading" }));
    fetch(URL + "?limit=10&select=title,price")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => { if (!ignore) setState({ status: "success", products: data.products }); })
      .catch(() => { if (!ignore) setState({ status: "error", products: [] }); });
    return () => { ignore = true; };
  }, [attempt]);

  if (state.status === "loading") return <p>Loading products…</p>;
  if (state.status === "error")
    return (
      <div>
        <p role="alert">Could not load products. Please try again.</p>
        <button onClick={() => setAttempt(a => a + 1)}>Retry</button>
      </div>
    );
  return <ul>{state.products.map(p => <li key={p.id}>{p.title + " · ₹" + p.price}</li>)}</ul>;
}

// ===== tests =====
test("shows a loading state first", async () => {
  render(<ProductList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("shows products from the API", async () => {
  render(<ProductList />);
  const items = await screen.findAllByRole("listitem");
  expect(items).toHaveLength(2);
  expect(screen.getByText("Cotton Kurta · ₹899")).toBeInTheDocument();
});

test("shows an error message when the server fails", async () => {
  server.use(http.get(URL, () => HttpResponse.json({ message: "Down" }, { status: 500 })));
  render(<ProductList />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load products");
});

test("retry loads products after one failure", async () => {
  const user = userEvent.setup();
  server.use(http.get(URL, () => HttpResponse.json({}, { status: 500 }), { once: true }));
  render(<ProductList />);
  await user.click(await screen.findByRole("button", { name: /retry/i }));
  expect(await screen.findAllByRole("listitem")).toHaveLength(2);
});

function App() {
  return (
    <TestRunner
      beforeEach={() => { server.resetHandlers(); server.listen(); }}
      afterAll={() => server.close()}
    />
  );
}`,
        css: RUNNER_CSS,
      },
      result: 'All four tests pass: loading text, two list items from the mock, the error alert when the handler returns 500, and a successful retry after a one-time failure. No request reaches the real dummyjson.com server.',
      explanation:
        'The component uses plain fetch with no knowledge of tests. The mock server replaces the network layer, so the real fetch → status check → JSON → setState path is exercised. server.use() prepends a handler that wins only for that test; resetHandlers() restores the defaults before the next test, keeping tests independent. { once: true } is how MSW v2 simulates "fail once, then succeed". The mini MSW here patches window.fetch to imitate the real library in the playground.',
    },
    {
      title: 'Testing a custom hook and a component that needs providers',
      scenario: 'A useCart hook lives in CartContext, and the Header shows the cart count. Test the hook with renderHook and the header with a reusable renderWithProviders helper (Router + QueryClient + Cart).',
      steps: [
        'Create src/test/utils.jsx exporting renderWithProviders(ui, { route })',
        'Use a fresh QueryClient per test with retry: false so errors show immediately',
        'Test the hook: const { result } = renderHook(() => useCart(), { wrapper })',
        'Call actions inside act() and assert on result.current',
        'Test the Header through the helper with a starting route',
      ],
      code: `// src/test/utils.jsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/features/cart/CartContext";

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </CartProvider>
      </QueryClientProvider>
    );
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

// src/features/cart/useCart.test.jsx
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

test("adds items and computes the total", () => {
  const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
  act(() => result.current.add({ id: 1, title: "Kurta", price: 899 }));
  act(() => result.current.add({ id: 1, title: "Kurta", price: 899 }));
  expect(result.current.count).toBe(2);
  expect(result.current.total).toBe(1798);
});

// src/components/Header.test.jsx
test("shows the cart count in the header", async () => {
  renderWithProviders(<Header />, { route: "/products" });
  expect(screen.getByRole("link", { name: /cart \\(0\\)/i })).toBeInTheDocument();
});`,
      result: 'The hook test passes without rendering any UI, and every component test gets the same providers with one line, so tests stay short and consistent across the team.',
      explanation:
        'renderHook renders an invisible component that calls the hook and exposes its latest return value in result.current. State updates triggered directly (outside user events) must be wrapped in act() so React applies them before assertions. A shared renderWithProviders helper is standard in company codebases: a new QueryClient per test prevents cache leaking between tests, and retry: false keeps error tests fast.',
    },
    {
      title: 'Playwright E2E: login and checkout happy path',
      scenario: 'Protect the money path of an e-commerce site: a user logs in, searches for a product, adds it to the cart and reaches the order confirmation. This runs on every pull request in Chromium, Firefox and WebKit.',
      steps: [
        'npm init playwright@latest (choose JavaScript, e2e folder, add GitHub Actions workflow)',
        'Set baseURL and webServer in playwright.config.js so the app starts automatically',
        'Use npx playwright codegen http://localhost:5173 to record the first draft',
        'Replace recorded CSS selectors with getByRole / getByLabel locators and add web-first assertions',
        'Run npx playwright test --ui; on CI failures open the HTML report and trace',
      ],
      code: `// playwright.config.js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 0,
  reporter: [["html"], ["list"]],
  use: { baseURL: "http://localhost:4173", trace: "on-first-retry", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "npm run build && npm run preview", url: "http://localhost:4173", reuseExistingServer: !process.env.CI },
});

// e2e/checkout.spec.js
import { test, expect } from "@playwright/test";

test.describe("checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("priya@example.in");
    await page.getByLabel("Password").fill("Test@1234");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Welcome, Priya")).toBeVisible();
  });

  test("user can buy a product", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search products" }).fill("kurta");
    await page.getByRole("link", { name: /cotton kurta/i }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: /cart \\(1\\)/ }).click();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
    await expect(page).toHaveURL(/\\/orders\\/\\d+/);
  });

  test("shows an error if the payment API fails", async ({ page }) => {
    await page.route("**/api/payments", route => route.fulfill({ status: 500, json: { message: "Gateway down" } }));
    // ...same steps, then:
    // await expect(page.getByRole("alert")).toContainText("Payment failed");
  });
});

// package.json scripts
// "e2e": "playwright test", "e2e:ui": "playwright test --ui"`,
      result: 'npx playwright test runs the journeys in three browser configurations in parallel and prints a pass/fail list; on failure the HTML report shows a screenshot and a step-by-step trace with DOM snapshots and network calls.',
      explanation:
        'Playwright locators use the same accessible queries as RTL, so the habits transfer. Actions and expect(...).toBeVisible() auto-wait and retry, which removes most flakiness without sleeps. page.route() mocks a single API to test failure paths that are hard to trigger on a real backend. Keep the E2E suite small and focused on business-critical flows; cover edge cases with faster integration tests.',
    },
  ],
  interview: [
    { q: 'What is the testing trophy and how is it different from the testing pyramid?', a: 'The pyramid puts most effort into unit tests. The trophy (Kent C. Dodds) adds static analysis at the base and puts the most weight on integration tests, because they give the best confidence-to-cost ratio for UI code, with fewer E2E tests on top.', level: 'Medium' },
    { q: 'Why does React Testing Library recommend getByRole?', a: 'It queries the accessibility tree the way assistive technologies and users perceive the page (role + accessible name). Tests become resilient to markup refactors and fail when accessibility breaks, unlike class or test-id selectors.', level: 'Easy' },
    { q: 'Difference between getBy, queryBy and findBy?', a: 'getBy throws if the element is not found (synchronous). queryBy returns null instead (use for asserting absence). findBy returns a promise and retries until the element appears or times out (use for async UI).', level: 'Easy' },
    { q: 'Why prefer user-event over fireEvent?', a: 'user-event simulates full interactions (pointer events, focus, keydown/keypress/input/keyup, selection) like a real browser, catching bugs that a single synthetic event dispatched by fireEvent would miss. v14 is async and created with userEvent.setup().', level: 'Medium' },
    { q: 'What is MSW and why is it better than mocking fetch or axios?', a: 'Mock Service Worker intercepts requests at the network level (Service Worker in browsers, interceptors in Node) and returns defined responses. Application code, HTTP client, interceptors and caching run unchanged, handlers are reusable in tests, Storybook and development, and tests do not couple to implementation details.', level: 'Medium' },
    { q: 'How do you test an error state with MSW?', a: 'Override the handler for that test with server.use(http.get(url, () => HttpResponse.json({...}, { status: 500 }))) and assert the error UI with findByRole("alert"). server.resetHandlers() in afterEach restores the defaults.', level: 'Medium' },
    { q: 'What is act() and when do you need it explicitly?', a: 'act() makes sure all state updates and effects are processed before assertions. RTL render and user-event already wrap in act, and findBy/waitFor handle async updates. You call it explicitly mainly with renderHook when invoking hook functions directly, or with fake timers.', level: 'Hard' },
    { q: 'Integration test vs E2E test?', a: 'Integration tests render components in jsdom with mocked network, run in milliseconds and test many cases. E2E tests run the real built app in real browsers (Playwright), often against real or staged backends, are slower and cover a few critical user journeys end to end.', level: 'Easy' },
    { q: 'How does Playwright avoid flaky waits?', a: 'Actions auto-wait for elements to be attached, visible, stable and enabled; web-first assertions (expect(locator).toBeVisible()) retry until a timeout. Plus isolated browser contexts per test, retries on CI and traces for debugging.', level: 'Medium' },
    { q: 'What makes a test flaky and how do you fix it?', a: 'Timing assumptions (fixed sleeps), shared state between tests, real network, real time/randomness, animation and order dependence. Use findBy/waitFor or auto-waiting, reset state and MSW handlers after each test, fake timers, seeded data and isolated test data.', level: 'Hard' },
    { q: 'What do you avoid testing?', a: 'Implementation details (internal state names, private functions, component instance methods), third-party library internals, exact CSS, and huge snapshot tests that nobody reviews. Test behaviour and output that users and other code depend on.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Using the mini testing library from Example 1, write 3 tests for a Counter with + and − buttons where − is disabled at 0 and a max of 5 shows "Limit reached".',
      hint: 'Use getByRole("button", { name: "+" }), toBeDisabled and getByText.',
      solution: MINI_TESTING_LIBRARY + `
function Counter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <button onClick={() => setN(n - 1)} disabled={n === 0} aria-label="decrement">−</button>
      <span role="status">{n}</span>
      <button onClick={() => setN(n + 1)} disabled={n === 5} aria-label="increment">+</button>
      {n === 5 && <p>Limit reached</p>}
    </div>
  );
}
test("starts at 0 with decrement disabled", () => {
  render(<Counter />);
  expect(screen.getByRole("status")).toHaveTextContent("0");
  expect(screen.getByRole("button", { name: "decrement" })).toBeDisabled();
});
test("increments when + is clicked", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: "increment" }));
  expect(screen.getByRole("status")).toHaveTextContent("1");
});
test("shows limit message at 5", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  for (let i = 0; i < 5; i++) await user.click(screen.getByRole("button", { name: "increment" }));
  expect(screen.getByText("Limit reached")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "increment" })).toBeDisabled();
});
function App() { return <TestRunner />; }`,
    },
    {
      task: 'Write the real Vitest + RTL test for a SearchBox that calls onSearch only 300 ms after the user stops typing (debounced). Use fake timers.',
      hint: 'vi.useFakeTimers(); userEvent.setup({ advanceTimers: vi.advanceTimersByTime }); then vi.advanceTimersByTime(300).',
      solution: `import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "./SearchBox";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test("calls onSearch once, 300 ms after typing stops", async () => {
  const onSearch = vi.fn();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<SearchBox onSearch={onSearch} />);

  await user.type(screen.getByRole("searchbox", { name: /search/i }), "pune");
  expect(onSearch).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(300));
  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith("pune");
});`,
    },
    {
      task: 'Add MSW handlers for POST https://dummyjson.com/auth/login that return 200 with a token for username "emilys" and 400 otherwise, and write two tests for a LoginPage that shows "Welcome, Emily" or the error message.',
      hint: 'In the resolver read the body with await request.json().',
      solution: `// handlers.js
import { http, HttpResponse } from "msw";
export const handlers = [
  http.post("https://dummyjson.com/auth/login", async ({ request }) => {
    const { username, password } = await request.json();
    if (username === "emilys" && password === "emilyspass")
      return HttpResponse.json({ accessToken: "fake", firstName: "Emily" });
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 400 });
  }),
];

// LoginPage.test.jsx
test("logs in with valid credentials", async () => {
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Username"), "emilys");
  await user.type(screen.getByLabelText("Password"), "emilyspass");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(await screen.findByText("Welcome, Emily")).toBeInTheDocument();
});

test("shows the API error for wrong credentials", async () => {
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("Username"), "nobody");
  await user.type(screen.getByLabelText("Password"), "wrong");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
});`,
    },
    {
      task: 'Write a Playwright test that opens the products page, sorts by "Price: Low to High" and checks that the first two prices are in ascending order.',
      hint: 'Use page.getByLabel("Sort by").selectOption(...), then read texts with locator.allTextContents().',
      solution: `import { test, expect } from "@playwright/test";

test("sorts products by price ascending", async ({ page }) => {
  await page.goto("/products");
  await page.getByLabel("Sort by").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);

  const prices = page.getByTestId("product-price");
  await expect(prices.first()).toBeVisible();
  const values = (await prices.allTextContents()).map(t => Number(t.replace(/[^0-9.]/g, "")));
  expect(values[0]).toBeLessThanOrEqual(values[1]);
});`,
    },
    {
      task: 'Add accessibility checks to tests: use vitest-axe in a unit test for the LoginForm and @axe-core/playwright in an E2E test for the home page.',
      hint: 'expect(await axe(container)).toHaveNoViolations(); new AxeBuilder({ page }).analyze().',
      solution: `// LoginForm.a11y.test.jsx
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { LoginForm } from "./LoginForm";

test("LoginForm has no detectable a11y violations", async () => {
  const { container } = render(<LoginForm onLogin={vi.fn()} />);
  expect(await axe(container)).toHaveNoViolations();
});

// e2e/a11y.spec.js
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home page has no serious a11y issues", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter(v => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});`,
    },
  ],
  quiz: [
    { question: 'Which query should you use FIRST according to React Testing Library?', options: ['getByTestId', 'container.querySelector', 'getByRole', 'getByClassName'], answer: 2, explanation: 'getByRole matches how users and assistive technology find elements.' },
    { question: 'To wait for data that appears after an API call you use...', options: ['findByText / findByRole', 'getByText immediately', 'setTimeout(…, 3000)', 'queryByText'], answer: 0, explanation: 'findBy queries return a promise that retries until the element appears.' },
    { question: 'In MSW, how do you make ONE test return a 500 error?', options: ['Edit handlers.js', 'Stop the server', 'Mock window.fetch with vi.fn', 'server.use(http.get(url, () => HttpResponse.json({}, { status: 500 })))'], answer: 3, explanation: 'server.use adds a runtime override; resetHandlers removes it after the test.' },
    { question: 'Which assertion checks that an element is NOT rendered?', options: ['expect(screen.getByText("x")).toBeNull()', 'expect(screen.queryByText("x")).not.toBeInTheDocument()', 'expect(screen.findByText("x")).toBe(false)', 'expect(screen.getByText("x")).toBeHidden()'], answer: 1, explanation: 'queryBy returns null when missing (getBy would throw before the assertion runs).' },
    { question: 'Why are Playwright tests less flaky than tests with manual waits?', options: ['They run only in Chrome', 'They skip assertions', 'Actions and web-first assertions auto-wait and retry', 'They do not use a browser'], answer: 2, explanation: 'Auto-waiting removes timing guesses like sleep(2000).' },
  ],
};
