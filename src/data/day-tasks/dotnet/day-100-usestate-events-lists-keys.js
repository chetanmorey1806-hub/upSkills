export default {
  lesson: 'day-100-usestate-events-lists-keys',
  minutes: 35,
  intro: 'Make components interactive with useState and event handlers, show content conditionally and render lists with stable keys.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'The button is clicked **once**. What number is shown afterwards?',
      example: { title: 'the updater form', code: 'setCount((c) => c + 1); // always uses the latest value' },
      code: `function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount((c) => c + 1);
  }
  return <button onClick={handleClick}>{count}</button>;
}`,
      expected: '2',
      explain: '`count` is 0 during this whole click. The first two calls both schedule "set to 1"; the updater `(c) => c + 1` then gets the pending value 1 and returns 2. Use the updater form whenever the new state depends on the old one.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which key is the best choice for a list of students loaded from your API?',
      options: ['key={index}', 'key={student.id}', 'key={Math.random()}', 'No key is needed'],
      answer: 1,
      explain: 'Keys must be **stable and unique**: the database id is perfect. Index keys break when items are inserted/deleted/sorted (state sticks to the wrong row), and random keys recreate every item on each render.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the event handler attribute so `handleDelete` runs when the button is clicked (JSX syntax):\n`<button ______={() => handleDelete(s.id)}>Delete</button>`',
      example: { title: 'an input change handler', code: '<input onChange={(e) => setName(e.target.value)} />' },
      accept: ['onClick'],
      caseSensitive: true,
      explain: 'React events are camelCase (`onClick`, `onChange`, `onSubmit`) and take a **function**. Writing `onClick={handleDelete(s.id)}` calls it immediately during render - wrap it in an arrow function to pass arguments.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 7,
      q: '**Show / hide fee details.** Keep a boolean state `open` (start false). A `<button id="toggle">` shows `Show details` when closed and `Hide details` when open. When open, render `<p id="details">Course fee: ₹4999</p>` (not rendered at all when closed).',
      example: { title: 'conditional rendering with &&', code: '{isAdmin && <button>Delete</button>}' },
      starter: 'const { useState } = React;\n\nfunction App() {\n  // TODO\n  return <button id="toggle">Show details</button>;\n}\n',
      solution: 'const { useState } = React;\n\nfunction App() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div>\n      <button id="toggle" onClick={() => setOpen((o) => !o)}>{open ? "Hide details" : "Show details"}</button>\n      {open && <p id="details">Course fee: ₹4999</p>}\n    </div>\n  );\n}\n',
      actions: [{ click: '#toggle' }],
      checks: [
        { sel: '#details', textEq: 'Course fee: ₹4999', msg: 'After one click the details paragraph must be shown' },
        { sel: '#toggle', textEq: 'Hide details', msg: 'After one click the button must say "Hide details"' },
      ],
      explain: '`!o` toggles the boolean; `&&` renders the paragraph only when `open` is true, and the ternary switches the label. The UI is always a function of state.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 10,
      q: '**Attendance list.** State `students` starts as `[{ id: 1, name: "Asha", present: false }, { id: 2, name: "Ravi", present: false }, { id: 3, name: "Meera", present: false }]`. Render each as `<li>` (key = id) with the name and a `<button className="mark">` that toggles `present` for that student (immutably). Present students get `className="present"` on their `<li>`. Show `<p id="summary">Present: X / 3</p>`.\n\n(The grader marks Asha and Meera.)',
      example: { title: 'updating one item immutably', code: 'setItems((list) => list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));' },
      starter: 'const { useState } = React;\n\nfunction App() {\n  const [students, setStudents] = useState([\n    { id: 1, name: "Asha", present: false },\n    { id: 2, name: "Ravi", present: false },\n    { id: 3, name: "Meera", present: false },\n  ]);\n  // TODO: toggle function, list, summary\n  return <ul></ul>;\n}\n',
      solution: 'const { useState } = React;\n\nfunction App() {\n  const [students, setStudents] = useState([\n    { id: 1, name: "Asha", present: false },\n    { id: 2, name: "Ravi", present: false },\n    { id: 3, name: "Meera", present: false },\n  ]);\n  const toggle = (id) => setStudents((list) => list.map((s) => (s.id === id ? { ...s, present: !s.present } : s)));\n  const count = students.filter((s) => s.present).length;\n  return (\n    <div>\n      <ul>\n        {students.map((s) => (\n          <li key={s.id} className={s.present ? "present" : ""}>\n            {s.name} <button className="mark" onClick={() => toggle(s.id)}>Mark</button>\n          </li>\n        ))}\n      </ul>\n      <p id="summary">Present: {count} / {students.length}</p>\n    </div>\n  );\n}\n',
      actions: [{ click: 'li:nth-child(1) .mark' }, { click: 'li:nth-child(3) .mark' }],
      checks: [
        { sel: 'li', count: 3, msg: 'Render 3 <li> items' },
        { sel: 'li.present', count: 2, msg: 'After marking Asha and Meera, 2 items must have class "present"' },
        { sel: '#summary', textEq: 'Present: 2 / 3', msg: 'The summary must say "Present: 2 / 3"' },
      ],
      explain: 'Never mutate state (`students[0].present = true` will not re-render). `map` returns a new array with a new object for the changed student. The count is **derived** from state, not stored separately.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: '**Add to a list.** A controlled `<input id="name">` and a `<button id="add">`. Clicking add appends `{ id: Date.now(), name }` to a `students` state (ignore empty/whitespace names) and clears the input. Render the names in `<ul id="list">`; show `<p id="empty">No students yet</p>` when the list is empty.\n\n(The grader adds "Kiran", then clicks add with an empty box.)',
      example: { title: 'appending immutably', code: 'setTodos((t) => [...t, { id: Date.now(), text }]);' },
      starter: 'const { useState } = React;\n\nfunction App() {\n  // TODO\n  return <p id="empty">No students yet</p>;\n}\n',
      solution: 'const { useState } = React;\n\nfunction App() {\n  const [name, setName] = useState("");\n  const [students, setStudents] = useState([]);\n  function add() {\n    const n = name.trim();\n    if (!n) return;\n    setStudents((list) => [...list, { id: Date.now(), name: n }]);\n    setName("");\n  }\n  return (\n    <div>\n      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />\n      <button id="add" onClick={add}>Add</button>\n      {students.length === 0 ? (\n        <p id="empty">No students yet</p>\n      ) : (\n        <ul id="list">{students.map((s) => <li key={s.id}>{s.name}</li>)}</ul>\n      )}\n    </div>\n  );\n}\n',
      actions: [{ input: ['#name', 'Kiran'] }, { click: '#add' }, { click: '#add' }],
      checks: [
        { sel: '#list li', count: 1, msg: 'Exactly one student must be added (empty names are ignored)' },
        { sel: '#list li', textEq: 'Kiran', msg: 'The added student must be Kiran' },
        { sel: '#empty', notExists: true, msg: 'Hide "No students yet" when the list has items' },
        { sel: '#name', prop: { value: '' }, msg: 'Clear the input after adding' },
      ],
      explain: 'A controlled input keeps its value in state, so clearing it is just `setName("")`. The empty-state message is conditional rendering with a ternary - a small detail that makes real apps feel finished.',
    },
  ],
};
