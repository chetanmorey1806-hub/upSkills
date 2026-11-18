export default {
  id: 'day-18-testing-nextjs-apps',
  title: 'Testing Next.js Apps: Jest / Vitest, React Testing Library and Playwright',
  module: 'Module 4: Production',
  day: 18,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Learn how to test a Next.js App Router project at every level: unit tests for utilities and Server Actions logic, component tests for Client Components with React Testing Library, mocking next/navigation, testing Route Handlers, and end-to-end tests of async Server Components and full user flows with Playwright - plus running everything in CI.',
  objectives: [
    'Choose the right test type (unit, component, E2E) for each part of a Next.js app',
    'Configure Jest with next/jest (or Vitest) and React Testing Library',
    'Test Client Components with user-event and mock next/navigation hooks',
    'Unit test Route Handlers and Server Action logic by extracting pure functions',
    'Write Playwright E2E tests for pages, forms and auth flows and run them in CI',
  ],
  theory: [
    {
      heading: 'What to test in a Next.js app (and with what)',
      content:
        'The testing pyramid applies, adapted to Next.js:\n- **Unit tests** (Jest/Vitest): pure functions - validation schemas, price calculations, formatters, reducers, data-mapping helpers, the logic inside Server Actions.\n- **Component tests** (React Testing Library + jsdom): **Client Components** - forms, buttons, filters, conditional UI. Test what the user sees and does, not implementation details.\n- **End-to-end tests** (Playwright): the real app in a real browser - **async Server Components**, routing, middleware redirects, Server Actions, authentication, database writes.\n\nWhy E2E for Server Components? Async Server Components are not supported well by unit-test renderers yet (Jest/RTL cannot `await` a component tree that uses server-only APIs like `cookies()` or Prisma). The official recommendation: test them with E2E.\n\nAnalogy: unit tests check each ingredient, component tests taste one dish, E2E tests are a customer eating the full meal in the restaurant.',
      points: [
        'Many fast unit tests, some component tests, a few critical E2E flows',
        'Test behaviour from the user\'s point of view (roles, labels, visible text)',
        'Critical E2E flows: sign up/login, checkout, create/edit content',
      ],
    },
    {
      heading: 'Setting up Jest with next/jest (or Vitest)',
      content:
        '`next/jest` configures Jest for Next.js automatically: SWC transforms (JSX), CSS/image mocks, `.env` loading, ignoring `.next` and `node_modules`.\n\nInstall: `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event`\n\nThen create `jest.config.js` and `jest.setup.js` and add `"test": "jest"` to package.json. Test files: `__tests__/*.test.js` or `*.test.js` next to the component.\n\n**Vitest** is a popular faster alternative: `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react` with `vitest.config.mjs` using `environment: \'jsdom\'` and `vite-tsconfig-paths` for the `@/` alias. The test API (`describe`, `it`, `expect`, `vi.fn()` instead of `jest.fn()`) is almost identical.',
      syntax:
        "// jest.config.js\nconst nextJest = require('next/jest');\nconst createJestConfig = nextJest({ dir: './' });   // loads next.config.js and .env\n\nmodule.exports = createJestConfig({\n  testEnvironment: 'jsdom',\n  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],\n  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },\n  testPathIgnorePatterns: ['<rootDir>/e2e/'],          // Playwright tests run separately\n});\n\n// jest.setup.js\nimport '@testing-library/jest-dom';",
    },
    {
      heading: 'Testing Client Components and mocking next/navigation',
      content:
        'React Testing Library renders a component into jsdom; you then query it **like a user**: `getByRole(\'button\', { name: /save/i })`, `getByLabelText(\'Email\')`, `findByText` (async). Simulate interactions with `userEvent.setup()` → `await user.type(...)`, `await user.click(...)`.\n\nNext.js hooks such as `useRouter`, `usePathname`, `useSearchParams` need the App Router context, which does not exist in a unit test. **Mock the module**: `jest.mock(\'next/navigation\', () => ({ useRouter: jest.fn(), ... }))` and assert that `push` was called with the right URL.\n\nComponents that call a **Server Action** prop can be tested by passing a mock function (`jest.fn()`) as the action and asserting it received the right FormData.\n\n`next/image` and `next/link` work in jsdom with next/jest; `next/font` is mocked automatically.',
      syntax:
        "jest.mock('next/navigation', () => ({\n  useRouter: jest.fn(),\n  usePathname: jest.fn(() => '/products'),\n  useSearchParams: jest.fn(() => new URLSearchParams('sort=price')),\n}));\n\nimport { useRouter } from 'next/navigation';\nconst push = jest.fn();\nuseRouter.mockReturnValue({ push, replace: jest.fn(), refresh: jest.fn() });",
      tip: 'Prefer getByRole over getByTestId: if a test cannot find a button by its accessible name, a screen-reader user cannot either. Your tests double as accessibility checks.',
    },
    {
      heading: 'Testing Route Handlers and Server Action logic',
      content:
        '**Route Handlers** are plain functions that take a Web `Request` and return a `Response` - easy to unit test in the Node environment (`@jest-environment node` docblock): build `new Request(\'http://localhost/api/products?q=shoe\')`, call `GET(req)`, then `await res.json()` and check `res.status`. Mock the data layer (`jest.mock(\'@/lib/data/products\')`).\n\n**Server Actions**: keep them thin. Put validation and business rules in **pure functions** (e.g. `parseProductForm(formData)` returning `{ data } | { errors }`) and unit test those. Mock `next/cache` (`revalidatePath: jest.fn()`) and the database when you want to test the action itself.\n\nThe full action + database + UI round trip is best covered by an E2E test against a test database.',
      syntax:
        "/** @jest-environment node */\nimport { GET } from '@/app/api/health/route';\n\ntest('GET /api/health returns ok', async () => {\n  const res = await GET(new Request('http://localhost/api/health'));\n  expect(res.status).toBe(200);\n  expect(await res.json()).toEqual({ status: 'ok' });\n});",
    },
    {
      heading: 'End-to-end testing with Playwright',
      content:
        '**Playwright** (by Microsoft) drives real Chromium, Firefox and WebKit. Install with `npm init playwright@latest` - it creates `playwright.config.js`, an `e2e/` (or `tests/`) folder and installs browsers.\n\nKey ideas:\n- `webServer` in the config starts your app (`npm run build && npm run start`) before tests and waits for the URL.\n- `page.goto(\'/\')`, locators `page.getByRole(\'link\', { name: \'Blog\' })`, actions `.click()`, `.fill()`, assertions `await expect(page).toHaveURL(/blog/)`, `await expect(locator).toBeVisible()`.\n- **Auto-waiting**: Playwright waits for elements to be visible/enabled - no manual sleeps.\n- **Auth state**: log in once in a setup project and save `storageState` so other tests start already logged in.\n- **Codegen**: `npx playwright codegen localhost:3000` records your clicks as test code. **Trace viewer** shows screenshots for every step of a failing test.\n- Run `npx playwright test`, `--ui` for interactive mode.\n\nIn CI (GitHub Actions): install deps, `npx playwright install --with-deps`, run unit tests and E2E tests, upload the HTML report as an artifact. Use a separate test database (`DATABASE_URL` for tests) and seed it before E2E.',
      syntax:
        "// playwright.config.js\nconst { defineConfig, devices } = require('@playwright/test');\n\nmodule.exports = defineConfig({\n  testDir: './e2e',\n  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n    { name: 'mobile', use: { ...devices['Pixel 7'] } },\n  ],\n  webServer: {\n    command: 'npm run build && npm run start',\n    url: 'http://localhost:3000',\n    reuseExistingServer: !process.env.CI,\n  },\n});",
      tip: 'Coming next (Day 19): deploying to Vercel with environment variables, and choosing between the Edge and Node.js runtimes.',
    },
  ],
  examples: [
    {
      title: 'Unit testing a validation helper used by a Server Action',
      scenario: 'The createProduct Server Action uses parseProductForm(formData). Test the rules: name required (min 3), price positive number, stock integer >= 0.',
      steps: [
        'Extract the validation into lib/validation/product.js as a pure function',
        'Write __tests__/product-validation.test.js with describe/it/expect',
        'Cover valid input, each invalid field and type conversion',
        'Run npm test',
        'In the playground SIMULATION a tiny in-page test runner executes the same assertions',
      ],
      code:
        "// lib/validation/product.js\nexport function parseProductForm(formData) {\n  const name = String(formData.get('name') ?? '').trim();\n  const price = Number(formData.get('price'));\n  const stock = Number(formData.get('stock') ?? 0);\n  const errors = {};\n  if (name.length < 3) errors.name = 'Name must be at least 3 characters';\n  if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number';\n  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number >= 0';\n  return Object.keys(errors).length ? { errors } : { data: { name, price, stock } };\n}\n\n// __tests__/product-validation.test.js\nimport { parseProductForm } from '@/lib/validation/product';\n\nconst fd = (obj) => { const f = new FormData(); Object.entries(obj).forEach(([k, v]) => f.set(k, v)); return f; };\n\ndescribe('parseProductForm', () => {\n  it('returns clean data for valid input', () => {\n    expect(parseProductForm(fd({ name: ' Runner ', price: '2499', stock: '5' })))\n      .toEqual({ data: { name: 'Runner', price: 2499, stock: 5 } });\n  });\n  it('rejects a short name', () => {\n    expect(parseProductForm(fd({ name: 'ab', price: '10' })).errors.name).toMatch(/at least 3/);\n  });\n  it('rejects zero or negative price', () => {\n    expect(parseProductForm(fd({ name: 'Bag', price: '0' })).errors.price).toBeDefined();\n  });\n  it('rejects fractional stock', () => {\n    expect(parseProductForm(fd({ name: 'Bag', price: '10', stock: '1.5' })).errors.stock).toBeDefined();\n  });\n});",
      playground: {
        jsx: "// SIMULATION: a mini test runner (describe/it/expect) running in the page instead of Jest.\nfunction parseProductForm(formData) {\n  const name = String(formData.get('name') ?? '').trim();\n  const price = Number(formData.get('price'));\n  const stock = Number(formData.get('stock') ?? 0);\n  const errors = {};\n  if (name.length < 3) errors.name = 'Name must be at least 3 characters';\n  if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number';\n  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number >= 0';\n  return Object.keys(errors).length ? { errors } : { data: { name, price, stock } };\n}\n\nfunction expect(actual) {\n  return {\n    toEqual(exp) { if (JSON.stringify(actual) !== JSON.stringify(exp)) throw new Error('Expected ' + JSON.stringify(exp) + ' got ' + JSON.stringify(actual)); },\n    toMatch(re) { if (!re.test(String(actual))) throw new Error('Expected ' + actual + ' to match ' + re); },\n    toBeDefined() { if (actual === undefined) throw new Error('Expected value to be defined'); },\n  };\n}\nconst fd = (obj) => { const f = new FormData(); Object.entries(obj).forEach(([k, v]) => f.set(k, v)); return f; };\n\nconst tests = [\n  ['returns clean data for valid input', () => expect(parseProductForm(fd({ name: ' Runner ', price: '2499', stock: '5' }))).toEqual({ data: { name: 'Runner', price: 2499, stock: 5 } })],\n  ['rejects a short name', () => expect(parseProductForm(fd({ name: 'ab', price: '10' })).errors.name).toMatch(/at least 3/)],\n  ['rejects zero or negative price', () => expect(parseProductForm(fd({ name: 'Bag', price: '0' })).errors.price).toBeDefined()],\n  ['rejects fractional stock', () => expect(parseProductForm(fd({ name: 'Bag', price: '10', stock: '1.5' })).errors.stock).toBeDefined()],\n  ['(deliberately failing) price 0 should be valid', () => expect(parseProductForm(fd({ name: 'Bag', price: '0' }))).toEqual({ data: { name: 'Bag', price: 0, stock: 0 } })],\n];\n\nfunction App() {\n  const results = tests.map(([name, fn]) => { try { fn(); return { name, ok: true }; } catch (e) { return { name, ok: false, msg: e.message }; } });\n  const passed = results.filter((r) => r.ok).length;\n  return (\n    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>\n      <b>parseProductForm</b>\n      {results.map((r) => (\n        <div key={r.name} style={{ color: r.ok ? 'green' : 'crimson' }}>{r.ok ? 'PASS' : 'FAIL'} {r.name}{r.msg ? ' - ' + r.msg : ''}</div>\n      ))}\n      <p>Tests: {passed} passed, {results.length - passed} failed, {results.length} total</p>\n    </div>\n  );\n}",
      },
      result: 'Four green PASS lines and one red FAIL line (the deliberately wrong expectation), ending with "Tests: 4 passed, 1 failed, 5 total" - just like Jest\'s summary.',
      explanation:
        'Pure functions are the easiest and fastest code to test: input in, output out, no mocks. Keeping Server Actions thin and moving rules into such helpers makes most of your server logic unit-testable.',
    },
    {
      title: 'Component test: search form that navigates with useRouter',
      scenario: 'A Client Component SearchForm calls router.push("/search?q=<text>") on submit and shows an error when the input is empty. Test both behaviours with RTL and a mocked next/navigation.',
      steps: [
        'Write components/SearchForm.js ("use client") using useRouter',
        'In the test, jest.mock("next/navigation") and provide a push mock',
        'Render, type with userEvent, click the button',
        'Assert push was called with the encoded URL, and the error appears for empty input',
        'In the SIMULATION the "router" is a mock object and the UI logs the push calls',
      ],
      code:
        "// components/SearchForm.js\n'use client';\nimport { useState } from 'react';\nimport { useRouter } from 'next/navigation';\n\nexport default function SearchForm() {\n  const router = useRouter();\n  const [q, setQ] = useState('');\n  const [error, setError] = useState('');\n  return (\n    <form onSubmit={(e) => {\n      e.preventDefault();\n      if (!q.trim()) return setError('Please enter a search term');\n      router.push('/search?q=' + encodeURIComponent(q.trim()));\n    }}>\n      <label htmlFor=\"q\">Search</label>\n      <input id=\"q\" value={q} onChange={(e) => setQ(e.target.value)} />\n      <button>Go</button>\n      {error && <p role=\"alert\">{error}</p>}\n    </form>\n  );\n}\n\n// components/SearchForm.test.js\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport SearchForm from './SearchForm';\nimport { useRouter } from 'next/navigation';\n\njest.mock('next/navigation', () => ({ useRouter: jest.fn() }));\n\ndescribe('SearchForm', () => {\n  const push = jest.fn();\n  beforeEach(() => { push.mockClear(); useRouter.mockReturnValue({ push }); });\n\n  it('navigates to the search page with the encoded query', async () => {\n    const user = userEvent.setup();\n    render(<SearchForm />);\n    await user.type(screen.getByLabelText('Search'), 'red shoes');\n    await user.click(screen.getByRole('button', { name: 'Go' }));\n    expect(push).toHaveBeenCalledWith('/search?q=red%20shoes');\n  });\n\n  it('shows an error and does not navigate when empty', async () => {\n    const user = userEvent.setup();\n    render(<SearchForm />);\n    await user.click(screen.getByRole('button', { name: 'Go' }));\n    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a search term');\n    expect(push).not.toHaveBeenCalled();\n  });\n});",
      playground: {
        jsx: "// SIMULATION: the component receives a mocked router (like jest.mock('next/navigation')).\n// Interact with it, then click 'Run assertions' to check the recorded calls like a test would.\nfunction createMockFn() {\n  const fn = (...args) => { fn.calls.push(args); };\n  fn.calls = [];\n  return fn;\n}\nconst mockRouter = { push: createMockFn() };\nconst useRouter = () => mockRouter;\n\nfunction SearchForm() {\n  const router = useRouter();\n  const [q, setQ] = React.useState('');\n  const [error, setError] = React.useState('');\n  return (\n    <form onSubmit={(e) => {\n      e.preventDefault();\n      if (!q.trim()) return setError('Please enter a search term');\n      setError('');\n      router.push('/search?q=' + encodeURIComponent(q.trim()));\n    }}>\n      <label htmlFor=\"q\">Search </label>\n      <input id=\"q\" value={q} onChange={(e) => setQ(e.target.value)} />\n      <button>Go</button>\n      {error && <p role=\"alert\" style={{ color: 'crimson' }}>{error}</p>}\n    </form>\n  );\n}\n\nfunction App() {\n  const [report, setReport] = React.useState('');\n  function runAssertions() {\n    const last = mockRouter.push.calls[mockRouter.push.calls.length - 1];\n    const ok = last && last[0] === '/search?q=red%20shoes';\n    setReport((ok ? 'PASS' : 'FAIL') + \": expect(push).toHaveBeenCalledWith('/search?q=red%20shoes') - calls: \" + JSON.stringify(mockRouter.push.calls));\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <SearchForm />\n      <p style={{ fontSize: 12 }}>Type \"red shoes\" and click Go, or click Go with an empty box.</p>\n      <button onClick={runAssertions}>Run assertions</button>\n      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{report}</pre>\n    </div>\n  );\n}",
      },
      result: 'Clicking Go with an empty box shows "Please enter a search term" and no push call. After typing "red shoes" and Go, "Run assertions" prints PASS with calls [["/search?q=red%20shoes"]].',
      explanation:
        'Mocking next/navigation replaces the real router with a spy, so the test checks the component\'s decision (which URL) without needing a running Next.js app. Queries by label, role and name mirror how real users and screen readers find elements.',
    },
    {
      title: 'Testing a Route Handler in the Node environment',
      scenario: 'GET /api/products?q=... returns matching products as JSON and 400 when q is longer than 50 characters. Test the handler without starting a server.',
      steps: [
        'Write app/api/products/route.js using a data function getProducts(q)',
        'In the test file add the /** @jest-environment node */ docblock',
        'jest.mock the data module and control its return value',
        'Call GET(new Request(url)) and assert status and JSON',
        'In the SIMULATION the same handler runs against the browser\'s Request/Response classes',
      ],
      code:
        "// app/api/products/route.js\nimport { getProducts } from '@/lib/data/products';\n\nexport async function GET(request) {\n  const q = new URL(request.url).searchParams.get('q') ?? '';\n  if (q.length > 50) return Response.json({ error: 'Query too long' }, { status: 400 });\n  const products = await getProducts(q);\n  return Response.json({ count: products.length, products });\n}\n\n// app/api/products/route.test.js\n/** @jest-environment node */\nimport { GET } from './route';\nimport { getProducts } from '@/lib/data/products';\n\njest.mock('@/lib/data/products', () => ({ getProducts: jest.fn() }));\n\ntest('returns matching products', async () => {\n  getProducts.mockResolvedValue([{ id: 1, name: 'Runner' }]);\n  const res = await GET(new Request('http://localhost/api/products?q=run'));\n  expect(res.status).toBe(200);\n  expect(await res.json()).toEqual({ count: 1, products: [{ id: 1, name: 'Runner' }] });\n  expect(getProducts).toHaveBeenCalledWith('run');\n});\n\ntest('rejects very long queries with 400', async () => {\n  const res = await GET(new Request('http://localhost/api/products?q=' + 'x'.repeat(51)));\n  expect(res.status).toBe(400);\n});",
      playground: {
        jsx: "// SIMULATION: the Route Handler is just a function (Request) => Response, so we can call it directly.\nconst fakeDb = [{ id: 1, name: 'Runner' }, { id: 2, name: 'Backpack' }, { id: 3, name: 'Trail Runner' }];\nasync function getProducts(q) { return fakeDb.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())); }\n\nasync function GET(request) {\n  const q = new URL(request.url).searchParams.get('q') ?? '';\n  if (q.length > 50) return Response.json({ error: 'Query too long' }, { status: 400 });\n  const products = await getProducts(q);\n  return Response.json({ count: products.length, products });\n}\n\nfunction App() {\n  const [q, setQ] = React.useState('run');\n  const [out, setOut] = React.useState('');\n  async function call() {\n    const res = await GET(new Request('http://localhost/api/products?q=' + encodeURIComponent(q)));\n    setOut(res.status + ' ' + JSON.stringify(await res.json()));\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={q} onChange={(e) => setQ(e.target.value)} />{' '}\n      <button onClick={call}>await GET(new Request(...))</button>{' '}\n      <button onClick={() => setQ('x'.repeat(51))}>Use 51-char query</button>\n      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{out}</pre>\n    </div>\n  );\n}",
      },
      result: 'With q=run: 200 {"count":2,"products":[{"id":1,"name":"Runner"},{"id":3,"name":"Trail Runner"}]}. With the 51-character query: 400 {"error":"Query too long"}.',
      explanation:
        'Because App Router handlers use standard Web Request/Response objects, they are testable as plain async functions. The node test environment provides these globals; mocking the data layer keeps the test fast and deterministic.',
    },
    {
      title: 'Playwright E2E: login redirect and creating a post',
      scenario: 'Verify the real app: visiting /dashboard while logged out redirects to /login; after logging in, a user can create a post and see it in the list.',
      steps: [
        'Run npm init playwright@latest and configure webServer and baseURL',
        'Create e2e/posts.spec.js',
        'Test 1: goto /dashboard and expect the URL to match /login',
        'Test 2: fill the login form, create a post with a unique title, expect it to be visible',
        'Run npx playwright test (and --ui to watch); open the HTML report on failure',
        'In the SIMULATION, a scripted "robot" performs the same steps against a mini app',
      ],
      code:
        "// e2e/posts.spec.js\nconst { test, expect } = require('@playwright/test');\n\ntest('redirects anonymous users to login', async ({ page }) => {\n  await page.goto('/dashboard');\n  await expect(page).toHaveURL(/\\/login\\?callbackUrl=/);\n  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();\n});\n\ntest('logged-in user can create a post', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill('test@example.com');\n  await page.getByLabel('Password').fill('secret123');\n  await page.getByRole('button', { name: 'Log in' }).click();\n  await expect(page).toHaveURL('/dashboard');\n\n  const title = 'E2E post ' + Date.now();\n  await page.getByLabel('Title').fill(title);\n  await page.getByRole('button', { name: 'Create' }).click();\n\n  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();\n});",
      playground: {
        jsx: "// SIMULATION: a scripted 'browser robot' performs E2E-style steps against a mini app.\n// Real Playwright drives a real browser against `next start`; this only shows the flow.\nfunction MiniApp({ state, setState }) {\n  const { path, user, posts } = state;\n  React.useEffect(() => { // the dashboard layout guard: redirect('/login')\n    if (path === '/dashboard' && !user) setState((s) => ({ ...s, path: '/login?callbackUrl=/dashboard' }));\n  }, [path, user]);\n  if (path === '/dashboard' && !user) return null;\n  if (path.startsWith('/login')) return <div><h3>Log in</h3><p>(form)</p></div>;\n  if (path === '/dashboard') return <div><h3>Dashboard</h3><ul>{posts.map((p) => <li key={p}>{p}</li>)}</ul></div>;\n  return <h3>Home</h3>;\n}\n\nfunction App() {\n  const [state, setState] = React.useState({ path: '/', user: null, posts: [] });\n  const [log, setLog] = React.useState([]);\n  const stateRef = React.useRef(state);\n  stateRef.current = state;\n  const step = (msg, fn) => new Promise((r) => setTimeout(() => { fn && fn(); setLog((l) => [...l, msg]); r(); }, 500));\n  const check = (msg, pred) => new Promise((r) => setTimeout(() => { setLog((l) => [...l, (pred(stateRef.current) ? 'PASS ' : 'FAIL ') + msg]); r(); }, 300));\n\n  async function run() {\n    setLog([]);\n    setState({ path: '/', user: null, posts: [] });\n    await step(\"page.goto('/dashboard')\", () => setState((s) => ({ ...s, path: '/dashboard' })));\n    await check('expect(page).toHaveURL(/login/)', (s) => s.path.startsWith('/login'));\n    await step('fill Email + Password, click Log in', () => setState((s) => ({ ...s, user: 'test@example.com', path: '/dashboard' })));\n    await check(\"expect(page).toHaveURL('/dashboard')\", (s) => s.path === '/dashboard');\n    await step(\"fill Title 'E2E post 1', click Create\", () => setState((s) => ({ ...s, posts: [...s.posts, 'E2E post 1'] })));\n    await check(\"expect(listitem 'E2E post 1').toBeVisible()\", (s) => s.posts.includes('E2E post 1'));\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>\n      <div style={{ border: '1px solid #ccc', padding: 8 }}>\n        <small>URL: {state.path}</small>\n        <MiniApp state={state} setState={setState} />\n      </div>\n      <div>\n        <button onClick={run}>Run E2E test</button>\n        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{log.join('\\n')}</pre>\n      </div>\n    </div>\n  );\n}",
      },
      result: 'Clicking "Run E2E test" visibly navigates the mini app: /dashboard -> /login (PASS), logs in -> /dashboard (PASS), creates "E2E post 1" which appears in the list (PASS).',
      explanation:
        'E2E tests exercise the complete stack - middleware/layout redirects, Server Actions, database and rendering - exactly as a user does. They are slower, so keep them for the most important flows and run them in CI on every pull request.',
    },
  ],
  interview: [
    { q: 'How do you test async Server Components?', a: 'Async Server Components are not fully supported by Jest/RTL renderers yet, so the recommended approach is end-to-end testing with Playwright (or Cypress) against a running app. Extract their logic into pure functions to unit test those separately.', level: 'Medium' },
    { q: 'What does next/jest do?', a: 'It creates a Jest config for Next.js: uses the SWC compiler to transform JS/JSX/TS, auto-mocks CSS, images and next/font, loads .env files and next.config.js, and ignores .next and node_modules from transforms and test discovery.', level: 'Medium' },
    { q: 'How do you test a component that uses useRouter from next/navigation?', a: 'Mock the module: jest.mock("next/navigation", () => ({ useRouter: jest.fn() })), then useRouter.mockReturnValue({ push: jest.fn() }) and assert push was called with the expected URL. Same approach for usePathname and useSearchParams.', level: 'Medium' },
    { q: 'Why prefer getByRole over getByTestId?', a: 'getByRole queries by accessible role and name, the way users and assistive technologies perceive the page. It makes tests resilient to markup changes and verifies accessibility. Test IDs are a last resort for elements without an accessible role/name.', level: 'Easy' },
    { q: 'getBy vs queryBy vs findBy?', a: 'getBy throws if not found (use for elements that must exist). queryBy returns null if not found (use to assert absence). findBy returns a promise and waits/retries (use for elements that appear asynchronously).', level: 'Easy' },
    { q: 'How do you unit test a Route Handler?', a: 'Import the exported GET/POST function, call it with new Request(url, init) in the node test environment, then assert response.status and await response.json(). Mock database/data modules for deterministic results.', level: 'Medium' },
    { q: 'How do you make Server Actions testable?', a: 'Keep them thin: move validation and business rules into pure functions and unit test those. For the action itself, mock next/cache (revalidatePath), next/navigation (redirect) and the data layer. Cover the integrated flow with an E2E test.', level: 'Hard' },
    { q: 'What advantages does Playwright offer for E2E tests?', a: 'Cross-browser (Chromium, Firefox, WebKit) and mobile emulation, auto-waiting locators, parallel execution, network interception, storageState for reusing logins, codegen, trace viewer with screenshots/DOM snapshots, and a built-in webServer option to start the app.', level: 'Medium' },
    { q: 'Should E2E tests run against next dev or a production build?', a: 'Preferably a production build (next build && next start): it matches what users get (caching, static generation, minified code, middleware behaviour) and is faster and more stable than on-demand dev compilation.', level: 'Medium' },
    { q: 'How do you avoid logging in again in every Playwright test?', a: 'Create a setup project/test that logs in once and saves page.context().storageState({ path: "playwright/.auth/user.json" }); other projects use storageState in their config so they start authenticated.', level: 'Hard' },
    { q: 'What should a CI pipeline for a Next.js app run?', a: 'Install with npm ci, lint (next lint/eslint), type-check if using TypeScript, run unit/component tests, build the app, install Playwright browsers and run E2E tests against the build with a test database, and upload reports/traces as artifacts.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write Jest tests for a formatPrice(paise) utility that returns "Rs 1,234.50" style strings using Intl.NumberFormat("en-IN").',
      hint: 'Test normal values, zero and large numbers (Indian grouping).',
      solution:
        "// lib/format.js\nexport function formatPrice(paise) {\n  return 'Rs ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(paise / 100);\n}\n\n// lib/format.test.js\nimport { formatPrice } from './format';\n\ndescribe('formatPrice', () => {\n  it('formats paise into rupees', () => expect(formatPrice(123450)).toBe('Rs 1,234.50'));\n  it('handles zero', () => expect(formatPrice(0)).toBe('Rs 0.00'));\n  it('uses Indian digit grouping', () => expect(formatPrice(1234567800)).toBe('Rs 1,23,45,678.00'));\n});",
    },
    {
      task: 'Test a Client Component <Counter initial={2} /> with + and - buttons: it must not go below 0.',
      hint: 'userEvent click and getByText / getByRole status.',
      solution:
        "// components/Counter.js\n'use client';\nimport { useState } from 'react';\nexport default function Counter({ initial = 0 }) {\n  const [n, setN] = useState(initial);\n  return (\n    <div>\n      <button onClick={() => setN((v) => Math.max(0, v - 1))}>-</button>\n      <output aria-label=\"count\">{n}</output>\n      <button onClick={() => setN((v) => v + 1)}>+</button>\n    </div>\n  );\n}\n\n// components/Counter.test.js\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Counter from './Counter';\n\ntest('increments and never goes below zero', async () => {\n  const user = userEvent.setup();\n  render(<Counter initial={2} />);\n  const count = screen.getByLabelText('count');\n  await user.click(screen.getByRole('button', { name: '+' }));\n  expect(count).toHaveTextContent('3');\n  for (let i = 0; i < 5; i++) await user.click(screen.getByRole('button', { name: '-' }));\n  expect(count).toHaveTextContent('0');\n});",
    },
    {
      task: 'Test a form component that receives a Server Action as a prop: submitting must call the action with FormData containing the typed email.',
      hint: 'Pass jest.fn() as action; React 19 calls form actions with FormData.',
      solution:
        "// components/NewsletterForm.js\n'use client';\nexport default function NewsletterForm({ action }) {\n  return (\n    <form action={action}>\n      <label htmlFor=\"email\">Email</label>\n      <input id=\"email\" name=\"email\" type=\"email\" />\n      <button>Subscribe</button>\n    </form>\n  );\n}\n\n// components/NewsletterForm.test.js\nimport { render, screen, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport NewsletterForm from './NewsletterForm';\n\ntest('calls the action with the email', async () => {\n  const action = jest.fn();\n  const user = userEvent.setup();\n  render(<NewsletterForm action={action} />);\n  await user.type(screen.getByLabelText('Email'), 'asha@example.com');\n  await user.click(screen.getByRole('button', { name: 'Subscribe' }));\n  await waitFor(() => expect(action).toHaveBeenCalled());\n  const formData = action.mock.calls[0][0];\n  expect(formData.get('email')).toBe('asha@example.com');\n});",
    },
    {
      task: 'Write a Playwright test that checks the home page title, the main navigation links and that clicking "Blog" goes to /blog.',
      hint: 'toHaveTitle, getByRole("navigation"), getByRole("link").',
      solution:
        "// e2e/home.spec.js\nconst { test, expect } = require('@playwright/test');\n\ntest('home page navigation', async ({ page }) => {\n  await page.goto('/');\n  await expect(page).toHaveTitle(/DevBlog/);\n  const nav = page.getByRole('navigation');\n  await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();\n  await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();\n  await nav.getByRole('link', { name: 'Blog' }).click();\n  await expect(page).toHaveURL('/blog');\n  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');\n});",
    },
    {
      task: 'Create a GitHub Actions workflow that runs lint, Jest and Playwright tests on every pull request.',
      hint: 'actions/setup-node, npm ci, npx playwright install --with-deps, upload-artifact.',
      solution:
        "# .github/workflows/test.yml\nname: Test\non: [pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    env:\n      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}\n      AUTH_SECRET: test-secret-for-ci\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test -- --ci\n      - run: npx playwright install --with-deps\n      - run: npx playwright test\n      - uses: actions/upload-artifact@v4\n        if: failure()\n        with: { name: playwright-report, path: playwright-report }",
    },
  ],
  quiz: [
    { question: 'Which tool is recommended for testing async Server Components?', options: ['Jest snapshot tests', 'React DevTools', 'An E2E tool such as Playwright', 'console.log'], answer: 2, explanation: 'E2E tests run the real server rendering.' },
    { question: 'Which RTL query should you use for an element that appears after an async fetch?', options: ['findByText', 'getByText', 'queryByText', 'getAllByTestId'], answer: 0, explanation: 'findBy* returns a promise and waits for the element.' },
    { question: 'How do you provide a fake router to a component using useRouter in Jest?', options: ['Wrap it in <BrowserRouter>', 'Start next dev first', 'Use next/router', 'jest.mock("next/navigation") and return a mock push'], answer: 3, explanation: 'Mocking next/navigation replaces the App Router hooks.' },
    { question: 'Which Jest environment is suitable for Route Handler tests?', options: ['jsdom', 'node', 'browser', 'edge-light only'], answer: 1, explanation: 'Route handlers are server code using Web Request/Response in Node.' },
    { question: 'In Playwright, what does the webServer config option do?', options: ['Deploys to Vercel', 'Mocks all network calls', 'Starts the app before tests and waits for the URL', 'Opens DevTools'], answer: 2, explanation: 'It runs your start command and waits until the app is reachable.' },
  ],
};
