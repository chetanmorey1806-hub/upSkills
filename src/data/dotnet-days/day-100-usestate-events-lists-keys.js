export default {
  id: 'day-100-usestate-events-lists-keys',
  title: 'useState, Events, Conditional Rendering, Lists and Keys',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 100,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Make components interactive: store changing data with useState, react to clicks and typing with event handlers, show or hide UI with conditional rendering, and render API-style arrays with map and keys. Build a searchable Student list.',
  objectives: [
    'Declare state with useState and update it immutably (objects and arrays)',
    'Handle onClick, onChange and onSubmit events and pass arguments to handlers',
    'Use if, ternary and && for conditional rendering',
    'Render lists with map() and choose correct keys (database Id, not index)',
  ],
  theory: [
    {
      heading: 'State with useState',
      content:
        '**State** is data that belongs to a component and can change over time (a counter, the search text, the list of students loaded from the API). When state changes, React **re-renders** the component.\n\n`const [value, setValue] = useState(initialValue);` returns the current value and a **setter function**. Never assign the variable directly (`count = 5` does nothing on screen); always call the setter.\n\nAnalogy: state is the **private field** of a C# class, but you can only change it through its **setter**, and every change refreshes the screen.',
      syntax: `import { useState } from "react";

const [count, setCount] = useState(0);
setCount(count + 1);          // simple update
setCount(c => c + 1);         // functional update: uses latest value (safe for multiple updates)`,
      tip: 'State updates are asynchronous and batched. console.log(count) right after setCount(count + 1) still prints the old value.',
    },
    {
      heading: 'Updating objects and arrays immutably',
      content:
        'React decides to re-render by comparing the **reference** of the old and new state. If you mutate an array (`students.push(x)`) the reference is the same and React may not update. Always create a **new** array/object with spread or array methods that return new arrays.',
      syntax: `// Arrays
setStudents([...students, newStudent]);                       // add
setStudents(students.filter(s => s.id !== id));               // remove
setStudents(students.map(s => s.id === id ? { ...s, marks: 90 } : s)); // update one

// Objects
setForm({ ...form, email: "new@mail.com" });`,
      points: [
        'Use: spread `...`, map, filter, concat, slice, toSorted',
        'Avoid on state: push, pop, splice, sort, direct assignment `obj.x = 1`',
      ],
    },
    {
      heading: 'Handling events',
      content:
        'React events use **camelCase** names (`onClick`, `onChange`, `onSubmit`, `onKeyDown`) and receive a **function**, not a string.\n\n- `onClick={handleClick}` passes the function (correct)\n- `onClick={handleClick()}` CALLS it during render (bug: runs immediately)\n- To pass arguments wrap it in an arrow: `onClick={() => remove(s.id)}`\n\nThe handler receives a **synthetic event** `e` with `e.target.value`, `e.preventDefault()` etc., which works the same in every browser.',
      syntax: `function handleChange(e) { setSearch(e.target.value); }

<input value={search} onChange={handleChange} />
<button onClick={() => removeStudent(s.id)}>Delete</button>`,
    },
    {
      heading: 'Conditional rendering',
      content:
        'Because JSX is JavaScript, you show different UI with normal JavaScript:',
      points: [
        '**if / early return** for whole-component cases: `if (loading) return <p>Loading...</p>;`',
        '**Ternary** for either/or: `{isAdmin ? <AdminMenu /> : <UserMenu />}`',
        '**&&** for show-or-nothing: `{error && <p className="error">{error}</p>}`',
        'Returning **null** renders nothing',
      ],
      tip: 'Careful with && and numbers: {students.length && <List />} renders "0" when the list is empty. Use {students.length > 0 && <List />}.',
    },
    {
      heading: 'Rendering lists with map() and keys',
      content:
        'To render an array, transform it into an array of JSX elements with `map()`. Every element needs a unique, stable **key** prop among its siblings.\n\nKeys let React match old and new items during reconciliation. With API data, the best key is the **database primary key** (`s.id` from the `Id` IDENTITY column). Using the array **index** as key breaks when items are inserted, deleted or sorted: input values and state can jump to the wrong row.',
      syntax: `<ul>
  {students.map(s => (
    <li key={s.id}>{s.fullName} - {s.marks}</li>
  ))}
</ul>`,
      tip: 'The key goes on the outermost element returned from map, not inside the child component. Keys are not passed as props (props.key is undefined).',
    },
  ],
  examples: [
    {
      title: 'Counter: useState and onClick',
      scenario: 'Warm-up: an attendance counter with +, - and reset buttons that never goes below zero.',
      steps: [
        'Create src/components/AttendanceCounter.jsx',
        'Import useState from react and paste the code',
        'Render <AttendanceCounter /> in App.jsx',
        'Click the buttons and watch the number change',
      ],
      code: `// src/components/AttendanceCounter.jsx
import { useState } from "react";

export default function AttendanceCounter() {
  const [present, setPresent] = useState(0);

  return (
    <div>
      <h3>Students present: {present}</h3>
      <button onClick={() => setPresent(p => p + 1)}>+1</button>
      <button onClick={() => setPresent(p => Math.max(0, p - 1))}>-1</button>
      <button onClick={() => setPresent(0)}>Reset</button>
      {present >= 5 && <p>Class can start (minimum 5 students).</p>}
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [present, setPresent] = useState(0);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <h3>Students present: {present}</h3>
      <button onClick={() => setPresent(p => p + 1)}>+1</button>{" "}
      <button onClick={() => setPresent(p => Math.max(0, p - 1))}>-1</button>{" "}
      <button onClick={() => setPresent(0)}>Reset</button>
      {present >= 5 && <p style={{ color: "green" }}>Class can start (minimum 5 students).</p>}
    </div>
  );
}`,
      },
      result: 'Shows "Students present: 0". Each +1 click increases the number; -1 never goes below 0. After 5 clicks the green message "Class can start (minimum 5 students)." appears.',
      explanation:
        'useState(0) creates the state. The functional update p => p + 1 always uses the latest value. Math.max(0, ...) prevents negatives. The && operator renders the message only when the condition is true.',
    },
    {
      title: 'Student list with search, delete and keys',
      scenario: 'The day\'s practical: show the students (shape of GET /api/students), filter by name while typing, and delete a row.',
      steps: [
        'Create src/components/StudentList.jsx',
        'Store the students array and the search text in state',
        'Filter with filter() and render rows with map() using key={s.id}',
        'Delete with filter() to create a new array',
        'Render <StudentList /> in App.jsx and try searching "a"',
      ],
      code: `// src/components/StudentList.jsx
import { useState } from "react";

const initialStudents = [   // later (Day 101) this comes from GET /api/students
  { id: 1, fullName: "Asha Patil", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", course: "SQL Server", marks: 72 },
  { id: 4, fullName: "John Dsouza", course: "Web API", marks: 58 },
];

export default function StudentList() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const visible = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()));

  function remove(id) {
    setStudents(prev => prev.filter(s => s.id !== id)); // DELETE /api/students/{id} on Day 105
  }

  return (
    <div>
      <input placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
      <p>Showing {visible.length} of {students.length}</p>
      {visible.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th><th></th></tr></thead>
          <tbody>
            {visible.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.fullName}</td>
                <td>{s.course}</td>
                <td style={{ color: s.marks >= 40 ? "green" : "red" }}>{s.marks}</td>
                <td><button onClick={() => remove(s.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

const initialStudents = [
  { id: 1, fullName: "Asha Patil", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", course: "SQL Server", marks: 72 },
  { id: 4, fullName: "John Dsouza", course: "Web API", marks: 58 },
];

function App() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const visible = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()));

  function remove(id) {
    setStudents(prev => prev.filter(s => s.id !== id));
  }

  const cell = { border: "1px solid #ddd", padding: "4px 8px" };
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <input placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
      <p>Showing {visible.length} of {students.length}</p>
      {visible.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table style={{ borderCollapse: "collapse" }}>
          <thead><tr><th style={cell}>Id</th><th style={cell}>Name</th><th style={cell}>Course</th><th style={cell}>Marks</th><th style={cell}></th></tr></thead>
          <tbody>
            {visible.map(s => (
              <tr key={s.id}>
                <td style={cell}>{s.id}</td>
                <td style={cell}>{s.fullName}</td>
                <td style={cell}>{s.course}</td>
                <td style={{ ...cell, color: s.marks >= 40 ? "green" : "red" }}>{s.marks}</td>
                <td style={cell}><button onClick={() => remove(s.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}`,
      },
      result: 'A table of 4 students and "Showing 4 of 4". Typing "sh" shows Asha Patil and Meena Shah ("Showing 2 of 4"). Clicking Delete on Ravi removes the row ("Showing 3 of 3" with empty search). Typing "xyz" shows "No students found.".',
      explanation:
        'Only the source data (students) and the search text are state; the filtered list is derived during render, so it is never out of sync. filter() returns a new array, so React sees a new reference and re-renders. key={s.id} uses the database Id.',
    },
    {
      title: 'Toggle details and select a row (object state)',
      scenario: 'Show/hide details for the selected student and keep a "favourite" flag updated immutably inside the array.',
      steps: [
        'Add selectedId state (null = nothing selected)',
        'Clicking a name sets selectedId; clicking again clears it',
        'The star button updates one object inside the array with map + spread',
        'Run and click names and stars',
      ],
      code: `import { useState } from "react";

export default function StudentPicker() {
  const [students, setStudents] = useState([
    { id: 1, fullName: "Asha Patil", email: "asha@college.edu", favourite: false },
    { id: 2, fullName: "Ravi Kumar", email: "ravi@college.edu", favourite: false },
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const toggleFav = id =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, favourite: !s.favourite } : s));

  const selected = students.find(s => s.id === selectedId);

  return (
    <div>
      <ul>
        {students.map(s => (
          <li key={s.id}>
            <button onClick={() => toggleFav(s.id)}>{s.favourite ? "★" : "☆"}</button>
            <span onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}>{s.fullName}</span>
          </li>
        ))}
      </ul>
      {selected ? <p>Email: {selected.email}</p> : <p>Click a name to see details.</p>}
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [students, setStudents] = useState([
    { id: 1, fullName: "Asha Patil", email: "asha@college.edu", favourite: false },
    { id: 2, fullName: "Ravi Kumar", email: "ravi@college.edu", favourite: false },
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const toggleFav = id =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, favourite: !s.favourite } : s));

  const selected = students.find(s => s.id === selectedId);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {students.map(s => (
          <li key={s.id} style={{ marginBottom: 6 }}>
            <button onClick={() => toggleFav(s.id)}>{s.favourite ? "★" : "☆"}</button>{" "}
            <span style={{ cursor: "pointer", fontWeight: s.id === selectedId ? "bold" : "normal" }}
              onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}>{s.fullName}</span>
          </li>
        ))}
      </ul>
      {selected ? <p>Email: {selected.email}</p> : <p>Click a name to see details.</p>}
    </div>
  );
}`,
      },
      result: 'Initially "Click a name to see details.". Clicking "Asha Patil" makes it bold and shows "Email: asha@college.edu"; clicking it again hides it. Clicking a star toggles between ☆ and ★ for that student only.',
      explanation:
        'selectedId stores only the id; the selected object is derived with find(). toggleFav maps over the array and replaces just the matching object with a copy whose favourite flag is flipped, leaving the others untouched.',
    },
  ],
  interview: [
    { q: 'What is state in React?', a: 'Data owned by a component that can change over time. Updating it through the setter from useState causes the component to re-render.', level: 'Easy' },
    { q: 'Difference between state and props?', a: 'Props are passed in by the parent and are read-only; state is created and managed inside the component and can be changed with its setter.', level: 'Easy' },
    { q: 'What is the output? const [c,setC]=useState(0); function f(){ setC(c+1); setC(c+1); } after one click', a: 'c becomes 1, not 2. Both calls use the same c (0) from the current render. Use setC(p => p + 1) twice to get 2.', level: 'Hard' },
    { q: 'Why should we not mutate state with push?', a: 'push changes the existing array but keeps the same reference, so React\'s comparison (Object.is) sees no change and may skip the re-render; it also breaks features like StrictMode checks. Create a new array with spread or filter/map.', level: 'Medium' },
    { q: 'What is wrong with onClick={remove(s.id)}?', a: 'It calls remove immediately during render (and may cause an infinite render loop if it sets state). Use onClick={() => remove(s.id)}.', level: 'Medium' },
    { q: 'Why are keys needed in lists?', a: 'Keys identify which item is which between renders so React can reuse, move, insert or delete DOM nodes correctly instead of re-creating everything or mixing up state.', level: 'Easy' },
    { q: 'Why is index a bad key for API data?', a: 'When rows are inserted, deleted or sorted, indexes shift so a different item gets the same key; React then reuses the wrong DOM/state (e.g. input values on wrong rows). Use the database primary key.', level: 'Medium' },
    { q: 'What does {count && <p>Items</p>} render when count is 0?', a: 'It renders 0, because 0 && x evaluates to 0 and React renders numbers. Use {count > 0 && ...}.', level: 'Hard' },
    { q: 'What is a synthetic event?', a: 'React\'s cross-browser wrapper around the native DOM event, with the same interface (target, preventDefault, stopPropagation).', level: 'Medium' },
    { q: 'What is derived state and why prefer it?', a: 'Values computed from existing state during render (e.g. filtered list from students + search). Storing them separately duplicates data and risks being out of sync.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a Like button that shows "Liked (n)" and toggles a liked state.',
      hint: 'Two pieces of state or one object.',
      solution: `function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  function toggle() {
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);
  }
  return <button onClick={toggle}>{liked ? "Liked" : "Like"} ({count})</button>;
}`,
    },
    {
      task: 'Render an employee list and a dropdown to filter by department (All, IT, HR).',
      hint: 'Store the selected department in state and derive the filtered list.',
      solution: `function Employees() {
  const all = [
    { id: 1, name: "Kiran", dept: "IT" },
    { id: 2, name: "Priya", dept: "HR" },
    { id: 3, name: "Amit", dept: "IT" },
  ];
  const [dept, setDept] = useState("All");
  const list = dept === "All" ? all : all.filter(e => e.dept === dept);
  return (
    <>
      <select value={dept} onChange={e => setDept(e.target.value)}>
        <option>All</option><option>IT</option><option>HR</option>
      </select>
      <ul>{list.map(e => <li key={e.id}>{e.name} ({e.dept})</li>)}</ul>
    </>
  );
}`,
    },
    {
      task: 'Add an "Add student" button that appends a new student with the next id.',
      hint: 'Next id = Math.max of ids + 1; use spread to append.',
      solution: `function addStudent() {
  setStudents(prev => {
    const nextId = prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1;
    return [...prev, { id: nextId, fullName: "New Student " + nextId, course: "C#", marks: 0 }];
  });
}`,
    },
    {
      task: 'Add a "Sort by marks" button to the student list that sorts descending without mutating state.',
      hint: 'Copy before sorting: [...students].sort(...)',
      solution: `const sortByMarks = () =>
  setStudents(prev => [...prev].sort((a, b) => b.marks - a.marks));`,
    },
  ],
  quiz: [
    { question: 'What does useState return?', options: ['A single value', 'An array with the value and a setter', 'A promise', 'An object with get/set'], answer: 1, explanation: 'useState returns [state, setState].' },
    { question: 'Which handler is correct?', options: ['onclick="save()"', 'onClick={save()}', 'onClick="save"', 'onClick={() => save(id)}'], answer: 3, explanation: 'Pass a function; wrap in an arrow to pass arguments.' },
    { question: 'Best key for a student row from SQL Server?', options: ['The student Id', 'Array index', 'Math.random()', 'The student name'], answer: 0, explanation: 'The primary key is unique and stable.' },
    { question: 'How do you remove an item from state immutably?', options: ['students.splice(i,1)', 'delete students[i]', 'setStudents(students.filter(s => s.id !== id))', 'students.pop()'], answer: 2, explanation: 'filter returns a new array without the item.' },
    { question: '{list.length && <Table />} with an empty list renders...', options: ['Nothing', '0', 'An empty table', 'An error'], answer: 1, explanation: '0 is falsy but React renders numbers, so "0" appears.' },
  ],
};
