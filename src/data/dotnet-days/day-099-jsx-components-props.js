export default {
  id: 'day-099-jsx-components-props',
  title: 'JSX, Components, Functional Components and Props',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 99,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn JSX rules, build functional components, and pass data down with props. Build a reusable StudentProfile component whose props match the StudentResponseDto returned by the Module 8 Web API.',
  objectives: [
    'Write valid JSX: one root element, className, camelCase attributes, {expressions}',
    'Create functional components and organise them into files with import/export',
    'Pass data with props, destructure props, set default values and use children',
    'Map a .NET response DTO (camelCase JSON) to React props',
  ],
  theory: [
    {
      heading: 'What is JSX?',
      content:
        '**JSX** (JavaScript XML) lets you write HTML-like markup inside JavaScript. It is not HTML and not a string: Vite (with esbuild/Babel) compiles every JSX tag into a function call.\n\n`<h1 className="title">Hi</h1>` becomes `React.createElement("h1", { className: "title" }, "Hi")` (or the newer `jsx()` call).\n\nThink of JSX as **Razor for React**: in Razor you mix C# into HTML with `@`; in JSX you mix JavaScript into markup with `{ }`.',
      syntax: `const name = "Asha";
const element = <h1 className="title">Hello, {name}!</h1>;
// Razor equivalent:  <h1 class="title">Hello, @Model.Name!</h1>`,
    },
    {
      heading: 'JSX rules every beginner must know',
      content:
        'JSX is stricter than HTML:',
      points: [
        '**One root element**: return a single parent. Use a Fragment `<>...</>` when you do not want an extra div',
        '**Close every tag**: `<img />`, `<br />`, `<input />`',
        '**className** instead of class, **htmlFor** instead of for (class and for are JavaScript keywords)',
        '**camelCase attributes**: onClick, tabIndex, maxLength, backgroundColor in style',
        '**style takes an object**: `style={{ color: "red", fontSize: 18 }}` (outer braces = JS, inner = object)',
        '**{ } holds expressions only**: variables, function calls, ternaries, `a && b`, map(). Not if/for statements',
        '**Comments**: `{/* comment */}`',
      ],
      syntax: `return (
  <>
    <label htmlFor="email">Email</label>
    <input id="email" type="email" maxLength={100} />
    <p style={{ color: marks >= 40 ? "green" : "red" }}>{marks >= 40 ? "Pass" : "Fail"}</p>
    {/* this is a JSX comment */}
  </>
);`,
      tip: 'Common mistake: returning two sibling elements without a parent gives "Adjacent JSX elements must be wrapped in an enclosing tag".',
    },
    {
      heading: 'Functional components',
      content:
        'A **component** is a JavaScript function that returns JSX. Its name **must start with a capital letter** (`StudentCard`), otherwise React treats `<studentCard>` as an unknown HTML tag.\n\nComponents are like **C# classes you can instantiate many times**: write once, use `<StudentCard />` anywhere. Each component normally lives in its own file under `src/components/` and is exported so others can import it.\n\nClass components (`class X extends React.Component`) still work but modern React uses **functional components + hooks** only.',
      syntax: `// src/components/Header.jsx
export default function Header() {
  return <header><h1>Student Portal</h1></header>;
}

// src/App.jsx
import Header from "./components/Header";
export default function App() {
  return <Header />;
}`,
      points: [
        '**Default export**: one per file, import with any name: `import Header from "./Header"`',
        '**Named export**: many per file, import with braces: `import { Button, Badge } from "./ui"`',
      ],
    },
    {
      heading: 'Props: passing data to components',
      content:
        '**Props** (properties) are the inputs of a component, exactly like **method parameters** or **constructor arguments** in C#. The parent writes them as attributes; the child receives one object.\n\n- Props are **read-only**: a child must never change its props\n- Data flows **one way**: parent → child\n- Any JavaScript value can be a prop: string, number, array, object, function\n- Strings use quotes, everything else uses braces: `<StudentCard name="Asha" marks={87} />`',
      syntax: `function StudentCard({ name, course, marks = 0 }) {   // destructuring + default value
  return <p>{name} ({course}) - {marks}</p>;
}

<StudentCard name="Asha" course="C#" marks={87} />
<StudentCard name="Ravi" course="React" />            // marks defaults to 0`,
      tip: 'Passing a number as marks="87" gives a string "87". Use marks={87}.',
    },
    {
      heading: 'The children prop and component composition',
      content:
        'Whatever you put **between** a component\'s opening and closing tags arrives as `props.children`. This lets you build wrapper components such as Card, Modal or Layout, just like `@RenderBody()` in a Razor layout page.',
      syntax: `function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="Profile">
  <p>Any content here becomes children</p>
</Card>`,
    },
    {
      heading: 'Mapping .NET DTOs to props',
      content:
        'ASP.NET Core serialises C# properties to **camelCase** JSON by default (System.Text.Json). So a `StudentResponseDto` with `FullName` and `Email` arrives in React as `fullName` and `email`. Your prop names should match these camelCase names, so you can spread the object straight into the component: `<StudentProfile {...student} />`.',
      syntax: `// C# (Module 8)
public record StudentResponseDto(int Id, string FullName, string Email, string Course, int Marks);

// JSON from GET /api/students/1
{ "id": 1, "fullName": "Asha Patil", "email": "asha@college.edu", "course": "C#", "marks": 87 }

// React
<StudentProfile {...student} />`,
      tip: 'If your API uses PascalCase JSON (JsonNamingPolicy = null), your React props must also use PascalCase. Keep the default camelCase for React clients.',
    },
  ],
  examples: [
    {
      title: 'StudentProfile component with props',
      scenario: 'Build the day\'s practical: a StudentProfile card that displays one student received from GET /api/students/{id}.',
      steps: [
        'In the student-portal project create src/components/StudentProfile.jsx',
        'Paste the StudentProfile component and export it as default',
        'Import it in src/App.jsx and render it with a student object',
        'Save and check http://localhost:5173 (npm run dev must be running)',
      ],
      code: `// src/components/StudentProfile.jsx
export default function StudentProfile({ id, fullName, email, course, marks = 0 }) {
  const passed = marks >= 40;
  return (
    <div className="profile-card">
      <h2>{fullName}</h2>
      <p>ID: {id}</p>
      <p>Email: {email}</p>
      <p>Course: {course}</p>
      <p>
        Marks: {marks}{" "}
        <span className={passed ? "badge pass" : "badge fail"}>{passed ? "PASS" : "FAIL"}</span>
      </p>
    </div>
  );
}

// src/App.jsx
import StudentProfile from "./components/StudentProfile";

// Same shape as StudentResponseDto JSON from GET /api/students/1
const student = { id: 1, fullName: "Asha Patil", email: "asha@college.edu", course: "C#", marks: 87 };

export default function App() {
  return <StudentProfile {...student} />;
}`,
      playground: {
        jsx: `function StudentProfile({ id, fullName, email, course, marks = 0 }) {
  const passed = marks >= 40;
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, width: 280, fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ margin: "0 0 8px" }}>{fullName}</h2>
      <p>ID: {id}</p>
      <p>Email: {email}</p>
      <p>Course: {course}</p>
      <p>
        Marks: {marks}{" "}
        <span style={{ padding: "2px 8px", borderRadius: 4, color: "#fff", background: passed ? "green" : "crimson" }}>
          {passed ? "PASS" : "FAIL"}
        </span>
      </p>
    </div>
  );
}

const student = { id: 1, fullName: "Asha Patil", email: "asha@college.edu", course: "C#", marks: 87 };

function App() {
  return <StudentProfile {...student} />;
}`,
      },
      result: 'A card shows "Asha Patil", "ID: 1", "Email: asha@college.edu", "Course: C#" and "Marks: 87" with a green PASS badge.',
      explanation:
        'The spread {...student} passes each property of the object as a separate prop. The component destructures them in its parameter list, computes passed from marks and uses a ternary inside JSX for both the badge text and its colour.',
    },
    {
      title: 'Reusing a component for many students',
      scenario: 'Render three StudentProfile cards from an array, as if the array came from GET /api/students.',
      steps: [
        'Keep StudentProfile.jsx from Example 1',
        'In App.jsx create an array of three students',
        'Use students.map(...) to return one StudentProfile per student with a key',
        'Save and view the three cards side by side',
      ],
      code: `// src/App.jsx
import StudentProfile from "./components/StudentProfile";

const students = [
  { id: 1, fullName: "Asha Patil", email: "asha@college.edu", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", email: "ravi@college.edu", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", email: "meena@college.edu", course: "SQL Server", marks: 72 },
];

export default function App() {
  return (
    <div className="grid">
      {students.map(s => <StudentProfile key={s.id} {...s} />)}
    </div>
  );
}`,
      playground: {
        jsx: `function StudentProfile({ fullName, course, marks = 0 }) {
  const passed = marks >= 40;
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minWidth: 160 }}>
      <h3 style={{ margin: 0 }}>{fullName}</h3>
      <p>{course}</p>
      <strong style={{ color: passed ? "green" : "crimson" }}>{marks} - {passed ? "PASS" : "FAIL"}</strong>
    </div>
  );
}

const students = [
  { id: 1, fullName: "Asha Patil", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", course: "SQL Server", marks: 72 },
];

function App() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontFamily: "Segoe UI, sans-serif" }}>
      {students.map(s => <StudentProfile key={s.id} {...s} />)}
    </div>
  );
}`,
      },
      result: 'Three cards: "Asha Patil / C# / 87 - PASS" (green), "Ravi Kumar / React / 35 - FAIL" (red), "Meena Shah / SQL Server / 72 - PASS" (green).',
      explanation:
        'One component definition is reused three times with different props. key={s.id} uses the database primary key so React can track each card (lists and keys are covered in depth on Day 100).',
    },
    {
      title: 'Layout composition with children and function props',
      scenario: 'Create a reusable Card wrapper and a Button that receives a function prop, the pattern used by every dashboard page later in this module.',
      steps: [
        'Create src/components/Card.jsx and src/components/Button.jsx',
        'Card renders a title and {children}; Button calls the onClick prop it receives',
        'Use both in App.jsx',
        'Click the button and see the alert',
      ],
      code: `// src/components/Card.jsx
export default function Card({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </section>
  );
}

// src/components/Button.jsx
export default function Button({ text, onClick, variant = "primary" }) {
  return <button className={"btn btn-" + variant} onClick={onClick}>{text}</button>;
}

// src/App.jsx
import Card from "./components/Card";
import Button from "./components/Button";

export default function App() {
  const showInfo = () => alert("Data comes from ASP.NET Core Web API");
  return (
    <Card title="Course Info">
      <p>React + .NET Full Stack</p>
      <Button text="Show info" onClick={showInfo} />
      <Button text="Cancel" variant="secondary" />
    </Card>
  );
}`,
      playground: {
        jsx: `function Card({ title, children }) {
  return (
    <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, maxWidth: 320, fontFamily: "Segoe UI, sans-serif" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function Button({ text, onClick, variant = "primary" }) {
  const bg = variant === "primary" ? "#512bd4" : "#888";
  return (
    <button onClick={onClick} style={{ background: bg, color: "#fff", border: 0, padding: "6px 12px", borderRadius: 4, marginRight: 8 }}>
      {text}
    </button>
  );
}

function App() {
  const showInfo = () => alert("Data comes from ASP.NET Core Web API");
  return (
    <Card title="Course Info">
      <p>React + .NET Full Stack</p>
      <Button text="Show info" onClick={showInfo} />
      <Button text="Cancel" variant="secondary" />
    </Card>
  );
}`,
      },
      result: 'A bordered card titled "Course Info" with the text "React + .NET Full Stack", a purple "Show info" button and a grey "Cancel" button. Clicking "Show info" shows the alert "Data comes from ASP.NET Core Web API".',
      explanation:
        'Everything between <Card> and </Card> arrives as children. Functions are values in JavaScript, so the parent passes showInfo down as the onClick prop; the child simply attaches it to the real button. variant has a default value of "primary".',
    },
  ],
  interview: [
    { q: 'What is JSX?', a: 'A syntax extension for JavaScript that looks like HTML. It is compiled into React.createElement (or jsx()) calls that produce React elements (plain objects describing the UI).', level: 'Easy' },
    { q: 'Why className instead of class in JSX?', a: 'JSX is JavaScript and class is a reserved keyword in JavaScript, so React uses the DOM property name className. Similarly htmlFor replaces for.', level: 'Easy' },
    { q: 'Why must component names start with a capital letter?', a: 'JSX treats lowercase tags as built-in HTML elements (strings) and capitalised tags as component references (variables). <studentCard /> would render an unknown HTML element.', level: 'Easy' },
    { q: 'What are props?', a: 'Read-only inputs passed from a parent component to a child, received as a single object. They are similar to method parameters in C#.', level: 'Easy' },
    { q: 'Can a child component modify its props?', a: 'No. Props are read-only. To change data, the parent owns it in state and passes down a callback function that the child calls.', level: 'Medium' },
    { q: 'What is props.children?', a: 'The content placed between a component\'s opening and closing tags. It enables composition: Card, Modal and Layout components that wrap arbitrary content, like @RenderBody in Razor.', level: 'Medium' },
    { q: 'What is a Fragment and why use it?', a: '<></> or <React.Fragment> groups multiple elements without adding an extra DOM node. Useful when a component must return siblings, e.g. several <td> cells.', level: 'Medium' },
    { q: 'What will <Score value="10" /> pass compared with <Score value={10} />?', a: 'The first passes the string "10", the second the number 10. value + 5 gives "105" in the first case and 15 in the second.', level: 'Medium' },
    { q: 'Why do API JSON property names appear in camelCase in React?', a: 'ASP.NET Core\'s System.Text.Json uses JsonNamingPolicy.CamelCase by default, so FullName becomes fullName. React code must use those camelCase names.', level: 'Medium' },
    { q: 'Difference between default and named exports?', a: 'A file can have one default export, imported with any name and no braces. Named exports can be many and must be imported with braces and the same name (or aliased with as).', level: 'Easy' },
    { q: 'What does {...student} do in <StudentProfile {...student} />?', a: 'It spreads every property of the student object as an individual prop, equivalent to writing id={student.id} fullName={student.fullName} and so on.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an EmployeeCard component that receives name, department and salary props and shows "High" if salary >= 50000 else "Normal".',
      hint: 'Destructure props in the parameter list and use a ternary.',
      solution: `function EmployeeCard({ name, department, salary }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{department}</p>
      <p>{salary} - {salary >= 50000 ? "High" : "Normal"}</p>
    </div>
  );
}
// <EmployeeCard name="Kiran" department="IT" salary={65000} />`,
    },
    {
      task: 'Build a Layout component with a header, footer and children in the middle; use it in App.',
      hint: 'Render {children} between <header> and <footer>.',
      solution: `function Layout({ children }) {
  return (
    <>
      <header><h1>Student Portal</h1></header>
      <main>{children}</main>
      <footer>Powered by ASP.NET Core + React</footer>
    </>
  );
}
function App() {
  return <Layout><p>Dashboard content</p></Layout>;
}`,
    },
    {
      task: 'Write a ProductCard for ProductResponseDto { id, name, price, stock } that shows "Out of stock" when stock is 0.',
      hint: 'Use && or a ternary for the conditional text; price is a number.',
      solution: `function ProductCard({ name, price, stock = 0 }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Price: {price.toFixed(2)}</p>
      {stock === 0 ? <p className="text-danger">Out of stock</p> : <p>In stock: {stock}</p>}
    </div>
  );
}`,
    },
    {
      task: 'Fix the JSX: function A(){ return <h1 class="t">Hi</h1><p>x</p> }',
      hint: 'Two root elements and class.',
      solution: `function A() {
  return (
    <>
      <h1 className="t">Hi</h1>
      <p>x</p>
    </>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which attribute sets a CSS class in JSX?', options: ['class', 'cssClass', 'className', 'styleClass'], answer: 2, explanation: 'class is a JS keyword, so JSX uses className.' },
    { question: 'How do you embed a JavaScript expression in JSX?', options: ['{ expression }', '@expression', '{{ expression }}', '${expression}'], answer: 0, explanation: 'Single curly braces evaluate a JavaScript expression inside JSX.' },
    { question: 'Props in React are...', options: ['Writable by the child', 'Read-only inputs from the parent', 'Stored in localStorage', 'Only strings'], answer: 1, explanation: 'Props are read-only and can be any JS value.' },
    { question: 'A C# property FullName in a DTO arrives in React by default as...', options: ['FullName', 'full_name', 'FULLNAME', 'fullName'], answer: 3, explanation: 'System.Text.Json uses camelCase by default in ASP.NET Core.' },
    { question: 'What is the correct inline style in JSX?', options: ['style="color:red"', 'style={{ color: "red" }}', 'style={color: red}', 'css="color:red"'], answer: 1, explanation: 'style takes a JavaScript object; the outer braces enter JS, the inner create the object.' },
  ],
};
