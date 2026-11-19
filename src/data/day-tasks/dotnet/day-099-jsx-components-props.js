export default {
  lesson: 'day-099-jsx-components-props',
  minutes: 30,
  intro: 'Write correct JSX, split the UI into functional components and pass data to them with props (including children and default values).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which JSX is **valid**?',
      options: [
        '<div class="card"><img src={url}></div>',
        '<div className="card"><img src={url} /></div>',
        '<h1>Hi</h1><p>Text</p>  (returned from a component as-is)',
        '<input type="text" disabled="{true}">',
      ],
      answer: 1,
      explain: 'JSX uses `className` (class is a JS keyword), every tag must be **closed** (`<img />`), and a component must return **one** root element (wrap siblings in a `<div>` or `<>...</>` fragment).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What text does the page show? Type each `<li>` text on its own line.',
      example: { title: 'default prop values', code: 'function Badge({ label = "New" }) { return <span>{label}</span>; }\n<Badge />  →  New' },
      code: `function Student({ name, marks, city = "Pune" }) {
  return <li>{name} ({city}) - {marks >= 40 ? "Pass" : "Fail"}</li>;
}

function App() {
  return (
    <ul>
      <Student name="Asha" marks={78} />
      <Student name="Ravi" marks={35} city="Nagpur" />
      <Student name="Meera" marks={"40"} />
    </ul>
  );
}`,
      expected: `Asha (Pune) - Pass
Ravi (Nagpur) - Fail
Meera (Pune) - Pass`,
      explain: 'Missing props use the destructuring default (`city = "Pune"`). `marks={"40"}` passes a string, but `"40" >= 40` is true in JavaScript because the comparison converts it to a number. Pass numbers with `{40}` to avoid surprises.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the prop name that receives whatever is written **between** the component tags:\n```\nfunction Card({ title, ______ }) {\n  return <div className="card"><h3>{title}</h3>{______}</div>;\n}\n<Card title="Fees"><p>₹ 4,999</p></Card>\n```',
      example: { title: 'a layout wrapper', code: 'function Page({ children }) { return <main>{children}</main>; }' },
      accept: ['children'],
      caseSensitive: true,
      explain: '`children` is a special prop containing the nested JSX. It makes wrapper components (Card, Modal, Layout) reusable for any content.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about props are TRUE? (choose all that apply)',
      options: [
        'Props flow from parent to child',
        'A child must not modify its props (they are read-only)',
        'Functions can be passed as props (e.g. onDelete)',
        'Props can only be strings',
        'Each component call can receive different props',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Props are the inputs of a component - like method parameters in C#. Any value works: numbers, arrays, objects, functions, JSX. To change data, the parent changes its state and passes new props.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: '**A reusable StudentCard.** Write `StudentCard({ name, course, fee })` that renders `<div className="card">` with `<h3>` name, `<p className="course">` course and `<p className="fee">` showing `₹` + fee (e.g. `₹4999`). In `App`, render a card for each student in the given array.',
      example: { title: 'passing an object\'s fields as props', code: '{items.map((i) => <Item key={i.id} title={i.title} price={i.price} />)}' },
      starter: 'const students = [\n  { id: 1, name: "Asha", course: "C#", fee: 4999 },\n  { id: 2, name: "Ravi", course: "React", fee: 5999 },\n  { id: 3, name: "Meera", course: "SQL Server", fee: 3999 },\n];\n\nfunction StudentCard(props) {\n  // TODO\n}\n\nfunction App() {\n  return <div id="cards">{/* TODO */}</div>;\n}\n',
      solution: 'const students = [\n  { id: 1, name: "Asha", course: "C#", fee: 4999 },\n  { id: 2, name: "Ravi", course: "React", fee: 5999 },\n  { id: 3, name: "Meera", course: "SQL Server", fee: 3999 },\n];\n\nfunction StudentCard({ name, course, fee }) {\n  return (\n    <div className="card">\n      <h3>{name}</h3>\n      <p className="course">{course}</p>\n      <p className="fee">₹{fee}</p>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div id="cards">\n      {students.map((s) => <StudentCard key={s.id} name={s.name} course={s.course} fee={s.fee} />)}\n    </div>\n  );\n}\n',
      checks: [
        { sel: '#cards .card', count: 3, msg: 'Render 3 cards with className="card"' },
        { sel: '.card h3', index: 1, textEq: 'Ravi', msg: 'The second card heading must be Ravi' },
        { sel: '.card .course', index: 2, textEq: 'SQL Server', msg: 'The third card course must be SQL Server' },
        { sel: '.card .fee', index: 0, textEq: '₹4999', msg: 'The first card fee must show ₹4999' },
      ],
      explain: 'One component, many instances: the markup is written once and each call gets different props. The `key` goes on the element in the `map`, not inside StudentCard.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 7,
      q: '**Children and conditional JSX.** Write `Alert({ type, children })` that renders `<div className={"alert alert-" + type}>` with the children inside, and returns `null` when `children` is empty/missing. App renders `<Alert type="success">Fees paid</Alert>`, `<Alert type="danger">Payment failed</Alert>` and `<Alert type="info"></Alert>`.',
      example: { title: 'rendering nothing', code: 'if (!items.length) return null;' },
      starter: 'function Alert({ type, children }) {\n  // TODO\n}\n\nfunction App() {\n  return (\n    <div>\n      <Alert type="success">Fees paid</Alert>\n      <Alert type="danger">Payment failed</Alert>\n      <Alert type="info"></Alert>\n    </div>\n  );\n}\n',
      solution: 'function Alert({ type, children }) {\n  if (!children) return null;\n  return <div className={"alert alert-" + type}>{children}</div>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Alert type="success">Fees paid</Alert>\n      <Alert type="danger">Payment failed</Alert>\n      <Alert type="info"></Alert>\n    </div>\n  );\n}\n',
      checks: [
        { sel: '.alert', count: 2, msg: 'Only 2 alerts must render (the empty one returns null)' },
        { sel: '.alert.alert-danger', textEq: 'Payment failed', msg: 'The danger alert must contain "Payment failed"' },
        { sel: '.alert.alert-success', count: 1, msg: 'The success alert must have class "alert alert-success"' },
      ],
      explain: 'Returning `null` renders nothing - the standard way to hide a component. Building `className` from a prop is how Bootstrap-style variants (`alert-success`, `btn-primary`) are made reusable.',
    },
  ],
};
