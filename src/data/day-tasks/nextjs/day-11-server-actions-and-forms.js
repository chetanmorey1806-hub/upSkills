export default {
  lesson: 'day-11-server-actions-and-forms',
  minutes: 35,
  intro: 'Practise the "use server" directive, FormData, server-side validation in the useActionState shape, revalidation and pending/optimistic UI.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which directive turns an async function into a **Server Action**?',
      options: ["'use client'", "'use server'", "'use action'", "export const runtime = 'server'"],
      answer: 1,
      explain: "`'use server'` marks a function (inline, as the first line of its body) or a whole file (first line of `actions.js`) as Server Actions. `'use client'` is the opposite boundary for components. Note: `'use server'` does NOT mean \"Server Component\"; components are server by default.",
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Server Actions are TRUE? (choose all that apply)',
      options: [
        'They can be passed to `<form action={createStudent}>` and work even before JavaScript loads',
        'They run in the browser',
        'They are exposed as public POST endpoints, so you must check authentication and validate input inside them',
        'A Client Component can import and call a Server Action',
        'They can only be used inside Route Handlers',
      ],
      answers: [0, 2, 3],
      explain: 'Server Actions always run on the **server**, support progressive enhancement with `<form action>`, and can be imported into Client Components. Anyone can call them with a crafted POST request, so treat them like an API: authenticate, authorise and validate every time.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which React hook (imported from `react-dom`) lets a submit button inside a form show "Saving..." while the form\'s action is running?',
      accept: ['useFormStatus', 'useFormStatus()'],
      explain: '`useFormStatus()` returns `{ pending }` for the **parent** `<form>`, so it must be used in a child component (like `SubmitButton`), not in the component that renders the form. `useActionState` gives you the returned state (errors) plus its own `isPending`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After a Server Action inserts a new todo, the `/todos` page still shows the old cached list. What should the action call?',
      options: ["revalidatePath('/todos')", "router.push('/todos')", 'window.location.reload()', 'useEffect(() => refetch())'],
      answer: 0,
      explain: "`revalidatePath('/todos')` (from `next/cache`) purges the cached data for that route so the next render shows the new item. `router` and `window` do not exist on the server. Use `redirect('/todos')` after it if you also want to navigate.",
    },
    {
      type: 'output',
      mins: 2,
      q: 'A form has two checkboxes named `tag` (both ticked) and a text field `name`. This code builds the same FormData. What is printed?',
      code: `const fd = new FormData();
fd.append('tag', 'react');
fd.append('tag', 'next');
fd.set('name', 'Asha');
console.log(fd.get('tag'), fd.getAll('tag').length, fd.get('name'), fd.get('city'));`,
      expected: 'react 2 Asha null',
      explain: '`get()` returns only the **first** value for a key; use `getAll()` for multi-value fields like checkboxes. A missing field returns `null` (not `undefined` or an empty string), so validate it before using it.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: 'Write the Server Action `createStudent(prevState, formData)` in the **useActionState** shape (logic only, no database):\n- read `name` and `email` from `formData`\n- collect errors: `name` must be at least 2 characters (after trim) → `"Name is too short"`; `email` must contain `@` → `"Enter a valid email"`\n- if there are errors return `{ errors }` (an object with only the failing fields)\n- otherwise return `{ success: true, student: { name, email } }` with the trimmed name',
      example: { title: 'collecting field errors', code: "const errors = {};\nif (!age) errors.age = 'Age is required';\nif (Object.keys(errors).length) return { errors };" },
      starter: "async function createStudent(prevState, formData) {\n  'use server';\n  // TODO\n}\n",
      solution: "async function createStudent(prevState, formData) {\n  'use server';\n  const name = String(formData.get('name') || '').trim();\n  const email = String(formData.get('email') || '');\n  const errors = {};\n  if (name.length < 2) errors.name = 'Name is too short';\n  if (!email.includes('@')) errors.email = 'Enter a valid email';\n  if (Object.keys(errors).length) return { errors };\n  return { success: true, student: { name, email } };\n}",
      tests: [
        { call: "(() => { const f = new FormData(); f.set('name', '  Asha '); f.set('email', 'asha@mail.in'); return createStudent(null, f); })()", expect: { success: true, student: { name: 'Asha', email: 'asha@mail.in' } } },
        { call: "(() => { const f = new FormData(); f.set('name', 'A'); f.set('email', 'asha'); return createStudent(null, f); })()", expect: { errors: { name: 'Name is too short', email: 'Enter a valid email' } } },
        { call: "(() => { const f = new FormData(); f.set('email', 'r@x.in'); return createStudent(null, f); })()", expect: { errors: { name: 'Name is too short' } }, msg: 'A missing name field (null) must not crash: treat it as empty' },
      ],
      explain: 'With `useActionState(createStudent, {})` the returned object becomes the new state, so the form can show `state.errors?.name` under each field. Always trim and validate on the server; `formData.get()` returns `null` for missing fields, hence `String(... || "")`.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: 'Build the client side of an "Add student" form. On submit (prevent the page reload):\n- read the name with `new FormData(e.target).get("name")` (input `name="name"`, id `name`)\n- if it is empty show `<p className="error">Name is required</p>`\n- otherwise add it as an `<li>` in `<ul id="students">`, hide the error and clear the input\n\nThe checks submit an empty form first, then type **Asha** and submit again.',
      example: { title: 'handling a submit event', code: "function onSubmit(e) {\n  e.preventDefault();\n  const data = new FormData(e.target);\n  console.log(data.get('city'));\n  e.target.reset();\n}" },
      starter: "const { useState } = React;\n\nfunction App() {\n  // TODO\n  return (\n    <form>\n      <input id=\"name\" name=\"name\" />\n      <button>Add</button>\n    </form>\n  );\n}\n",
      solution: "const { useState } = React;\n\nfunction App() {\n  const [students, setStudents] = useState([]);\n  const [error, setError] = useState('');\n  function onSubmit(e) {\n    e.preventDefault();\n    const name = String(new FormData(e.target).get('name') || '').trim();\n    if (!name) { setError('Name is required'); return; }\n    setStudents([...students, name]);\n    setError('');\n    e.target.reset();\n  }\n  return (\n    <div>\n      <form onSubmit={onSubmit}>\n        <input id=\"name\" name=\"name\" />\n        <button>Add</button>\n      </form>\n      {error && <p className=\"error\">{error}</p>}\n      <ul id=\"students\">{students.map((s, i) => <li key={i}>{s}</li>)}</ul>\n    </div>\n  );\n}",
      actions: [{ submit: 'form' }, { input: ['#name', 'Asha'] }, { submit: 'form' }],
      checks: [
        { sel: '#students li', count: 1, msg: 'After a valid submit exactly one <li> (Asha) must be in <ul id="students">' },
        { sel: '#students li', textEq: 'Asha', msg: 'The new student must be "Asha"' },
        { sel: '.error', notExists: true, msg: 'The error must disappear after a valid submit' },
        { sel: '#name', prop: { value: '' }, msg: 'Clear the input after adding' },
      ],
      explain: 'In Next.js you would pass a Server Action to `<form action={...}>` and React handles the FormData for you; the same validation then happens on the server. The empty submit must NOT add an item: validating only in the browser is never enough, but it gives instant feedback.',
    },
  ],
};
