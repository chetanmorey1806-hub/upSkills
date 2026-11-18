export default {
  lesson: 'day-18-testing-nextjs-apps',
  minutes: 35,
  intro: 'Choose the right test type, practise React Testing Library ideas and write pure, testable functions plus a tiny test runner.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to test the full flow "log in → add product → see it in the list" in a real browser against the running app. Which tool fits?',
      options: ['Jest unit test', 'React Testing Library', 'Playwright (end-to-end)', 'ESLint'],
      answer: 2,
      explain: '**Playwright** drives real browsers against `next start` (or the dev server) and is the right tool for E2E flows, including async Server Components that unit test tools cannot render. Jest/Vitest + RTL are for functions and Client Components.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which React Testing Library query is recommended first because it matches how users and screen readers find elements?',
      options: ["container.querySelector('.btn')", "getByRole('button', { name: /save/i })", "getByTestId('save-btn')", 'wrapper.find(Button)'],
      answer: 1,
      explain: '`getByRole` with an accessible name tests what the user actually sees and also checks accessibility. `getByTestId` is a last resort; CSS selectors and component lookups test implementation details that break on refactors.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'A Client Component calls `useRouter()` and `usePathname()`. When you render it in a Jest/Vitest test, what is TRUE? (choose all that apply)',
      options: [
        'You should mock `next/navigation` (e.g. `jest.mock("next/navigation", ...)`)',
        'With the mock, you can assert that `push` was called with `/dashboard`',
        'The real Next.js router works automatically inside jsdom',
        'Async Server Components are best covered with E2E tests',
      ],
      answers: [0, 1, 3],
      explain: 'Outside a Next.js app there is no router context, so `useRouter` would throw; mock `next/navigation` and return a `push: jest.fn()`. Async Server Components are not supported well by unit renderers, so test their data logic as functions and the page with Playwright.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the jest-dom assertion that passes when the element is present in the page:\n\n`expect(screen.getByText(\'Saved!\')).__________();`',
      accept: ['toBeInTheDocument', 'toBeInTheDocument()'],
      explain: '`toBeInTheDocument()` comes from `@testing-library/jest-dom` (imported in the setup file). To check that something is NOT shown use `expect(screen.queryByText("Saved!")).not.toBeInTheDocument()`; `getBy` would throw instead.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'This is how a mock function records calls in a test. What is printed?',
      code: `const calls = [];
const push = (url) => calls.push(url);   // like jest.fn()

function afterLogin(ok) {
  if (ok) push('/dashboard');
  else push('/login?error=1');
}
afterLogin(false);
afterLogin(true);
console.log(calls.length, calls[0]);`,
      expected: '2 /login?error=1',
      explain: 'A mock records every call in order, so the test can assert `expect(push).toHaveBeenCalledTimes(2)` and `toHaveBeenNthCalledWith(1, "/login?error=1")`. The first call came from `afterLogin(false)`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Server Actions are easiest to test when their logic is a pure function. Write `slugify(title)` used when saving a blog post:\n- lower-case\n- trim spaces at the ends\n- replace every run of characters that are not `a-z` or `0-9` with a single `-`\n- remove `-` at the start or end',
      example: { title: 'regex replace', code: "'a  b'.replace(/\\s+/g, ' ')   // 'a b'\n'-x-'.replace(/^-+|-+$/g, '')  // 'x'" },
      starter: 'function slugify(title) {\n  // TODO\n}\n',
      solution: "function slugify(title) {\n  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');\n}",
      tests: [
        { call: "slugify('Hello Next.js 15')", expect: 'hello-next-js-15' },
        { call: "slugify('  Top 10 Tips!!  ')", expect: 'top-10-tips' },
        { call: "slugify('React & Vue: A Comparison')", expect: 'react-vue-a-comparison' },
      ],
      explain: 'Pure functions (same input → same output, no database or network) can be tested in milliseconds with many edge cases. The Server Action itself then stays a thin wrapper: validate → `slugify` → save → `revalidatePath`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write a tiny test runner `runTests(cases, fn)`. `cases` is an array of `{ input, expected }`. Call `fn(input)` for each case, compare with `expected` using `===`, and return `{ passed, failed }` counts. If `fn` throws, count that case as failed.',
      example: { title: 'counting with try/catch', code: "let ok = 0;\nfor (const x of list) {\n  try { if (check(x)) ok++; } catch { /* count as failure */ }\n}" },
      starter: 'function runTests(cases, fn) {\n  // TODO\n  return { passed: 0, failed: 0 };\n}\n',
      solution: 'function runTests(cases, fn) {\n  let passed = 0, failed = 0;\n  for (const c of cases) {\n    try {\n      if (fn(c.input) === c.expected) passed++;\n      else failed++;\n    } catch {\n      failed++;\n    }\n  }\n  return { passed, failed };\n}',
      tests: [
        { call: 'runTests([{ input: 2, expected: 4 }, { input: 3, expected: 6 }], (x) => x * 2)', expect: { passed: 2, failed: 0 } },
        { call: 'runTests([{ input: 2, expected: 5 }, { input: 3, expected: 6 }], (x) => x * 2)', expect: { passed: 1, failed: 1 } },
        { call: "runTests([{ input: null, expected: 1 }], (x) => x.length)", expect: { passed: 0, failed: 1 }, msg: 'A thrown error counts as a failed case' },
      ],
      explain: 'This is the heart of Jest/Vitest: run each case in isolation, catch errors so one failure does not stop the others, and report counts. Table-driven tests like `it.each(cases)` follow the same idea.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 6,
      q: 'Write a **testable** `AddToCart` component so RTL can find things by role: a `<button>` with the accessible name **Add to cart** and an element with `role="status"` that shows `0 items` and updates to `1 items`, `2 items`... on each click. The checks click twice.',
      example: { title: 'accessible markup', code: '<button aria-label="Close dialog">×</button>\n<p role="status">Saved</p>' },
      starter: "const { useState } = React;\n\nfunction App() {\n  // TODO\n  return <div />;\n}\n",
      solution: "const { useState } = React;\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <button onClick={() => setCount(count + 1)}>Add to cart</button>\n      <p role=\"status\">{count} items</p>\n    </div>\n  );\n}",
      actions: [{ click: 'button' }, { click: 'button' }],
      checks: [
        { sel: 'button', text: 'Add to cart', msg: 'The button text (accessible name) must be "Add to cart"' },
        { sel: '[role="status"]', textEq: '2 items', msg: 'After two clicks the role="status" element must show "2 items"' },
      ],
      explain: 'The matching RTL test would be: `await user.click(screen.getByRole("button", { name: /add to cart/i }))` twice, then `expect(screen.getByRole("status")).toHaveTextContent("2 items")`. Accessible markup makes components both usable and easy to test.',
    },
  ],
};
