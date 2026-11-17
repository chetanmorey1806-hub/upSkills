export default {
  id: 'day-06-conditional-rendering-lists-keys',
  title: 'Conditional Rendering and Rendering Lists with Keys',
  module: 'Module 1: React Fundamentals',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Real UIs show different things in different situations and display lists of data. Learn every conditional rendering pattern (if, ternary, &&, null) and how to render arrays with map() and stable keys.',
  objectives: [
    'Render different UI using if/else, early return, ternary and logical &&',
    'Avoid the "0 renders on screen" bug with &&',
    'Render lists of data using map() and filter()',
    'Choose correct keys and explain why array index keys can cause bugs',
  ],
  theory: [
    {
      heading: 'Conditional rendering with if and early return',
      content:
        'Components are JavaScript functions, so you can use normal `if` statements **before** the return. A common pattern is the **early return**: handle special cases first (loading, error, empty) and return early.\n\nAnalogy: a security guard at a door. If you have no ticket, you are sent back immediately; only if all checks pass do you reach the main hall.',
      syntax: `function Dashboard({ user }) {
  if (!user) {
    return <p>Please log in.</p>;
  }
  return <h1>Welcome, {user.name}</h1>;
}`,
    },
    {
      heading: 'Ternary operator inside JSX',
      content:
        'Use `condition ? A : B` when you need **either one thing or another** inside JSX. Keep ternaries short; nested ternaries become hard to read: move that logic above the return or into a small component.',
      syntax: `<button>{isLoggedIn ? "Logout" : "Login"}</button>

<div className={isActive ? "tab active" : "tab"}>Home</div>

{isLoading ? <Spinner /> : <ProductList />}`,
    },
    {
      heading: 'Logical && and returning null',
      content:
        'Use `condition && <JSX />` when you want **something or nothing**. If the condition is truthy, the JSX renders; if falsy, React renders the falsy value, and `false`, `null`, `undefined` render nothing.\n\nA component can also hide itself by returning `null`.',
      syntax: `{hasError && <p className="error">Something went wrong</p>}
{cart.length > 0 && <CheckoutButton />}

function Banner({ show }) {
  if (!show) return null;
  return <div className="banner">Sale!</div>;
}`,
      tip: 'Danger: {count && <Badge />} renders "0" when count is 0, because 0 is falsy but numbers ARE rendered. Write {count > 0 && <Badge />} or {!!count && <Badge />}.',
    },
    {
      heading: 'Rendering lists with map()',
      content:
        'To show a list, transform an array of data into an array of JSX elements with `array.map()`. React renders arrays of elements automatically.\n\nYou can chain `filter()` before `map()` to show only some items, and `sort()` (on a copy!) to change the order.',
      syntax: `const fruits = ["Apple", "Mango", "Banana"];

<ul>
  {fruits.map(fruit => <li key={fruit}>{fruit}</li>)}
</ul>

// filter + map
{products
  .filter(p => p.inStock)
  .map(p => <ProductCard key={p.id} {...p} />)}`,
      tip: 'If you use curly braces in the arrow function body you must write return: items.map(i => { return <li key={i.id}>{i.name}</li>; }). Forgetting return is a very common bug that renders nothing.',
    },
    {
      heading: 'Keys: what, why and which value',
      content:
        'Every element in a list needs a **key** prop: a string or number that uniquely identifies it **among its siblings**. React uses keys during reconciliation to know which items were added, removed or moved, so it can keep the correct DOM nodes and state.\n\nAnalogy: roll numbers in a classroom. If students change seats, the teacher still knows who is who by roll number, not by seat position.',
      points: [
        '**Best**: a stable unique ID from your data (`user.id`, database ID)',
        '**OK**: a unique, unchanging value such as a name, if guaranteed unique',
        '**Avoid**: array index (`key={index}`) when the list can be reordered, filtered, or items inserted/removed: state and inputs get attached to the wrong item',
        '**Never**: `Math.random()` or `Date.now()` as key: a new key every render forces React to recreate every item',
        'Keys only need to be unique among siblings, not globally',
        'The key goes on the outermost element returned by map, and is NOT available inside the child as props.key',
      ],
    },
    {
      heading: 'Empty states and combining patterns',
      content:
        'Always handle the empty list. A good UI tells the user "No results" instead of showing a blank area.\n\nTypical structure of a list screen:\n\n1. If loading, show a loader\n2. If error, show the error\n3. If the list is empty, show an empty state\n4. Otherwise map the items',
      syntax: `{items.length === 0 ? (
  <p>No tasks yet. Add one!</p>
) : (
  <ul>{items.map(t => <li key={t.id}>{t.title}</li>)}</ul>
)}`,
      tip: 'Coming next (Day 7): useState in depth, so lists can be updated by the user.',
    },
  ],
  examples: [
    {
      title: 'Login / logout UI with ternary and &&',
      scenario: 'Show a greeting and a Logout button when logged in, otherwise a Login button. Show an admin badge only for admins.',
      steps: [
        'Keep isLoggedIn and isAdmin in state',
        'Use a ternary to switch between the two buttons',
        'Use && to show the admin badge',
        'Toggle the checkbox and buttons to try every combination',
      ],
      code: `function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  return (
    <div>
      <h2>{isLoggedIn ? "Welcome back, Priya!" : "Hello, guest"}</h2>
      {isLoggedIn && isAdmin && <span className="badge">ADMIN</span>}
      {isLoggedIn
        ? <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        : <button onClick={() => setIsLoggedIn(true)}>Login</button>}
    </div>
  );
}`,
      playground: {
        jsx: `function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  return (
    <div className="box">
      <h2>{isLoggedIn ? "Welcome back, Priya!" : "Hello, guest"}</h2>
      {isLoggedIn && isAdmin && <span className="badge">ADMIN</span>}
      <p>
        {isLoggedIn
          ? <button onClick={() => setIsLoggedIn(false)}>Logout</button>
          : <button onClick={() => setIsLoggedIn(true)}>Login</button>}
      </p>
      <label>
        <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} /> Is admin?
      </label>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; max-width: 320px; }
.badge { background: #7c3aed; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 12px; }
button { padding: 6px 14px; }`,
      },
      result: 'Clicking Login changes the heading and button; the ADMIN badge appears only when logged in AND the checkbox is ticked.',
      explanation:
        'The ternary picks one of two elements. && renders the badge only when both conditions are true; otherwise it renders false, which shows nothing.',
    },
    {
      title: 'The 0 && bug and how to fix it',
      scenario: 'A notification counter should show a badge only when there are unread messages.',
      steps: [
        'Render a buggy version using {count && ...}',
        'Render a fixed version using {count > 0 && ...}',
        'Use the buttons to set count to 0 and compare',
      ],
      code: `// ❌ Buggy: shows "0" when count is 0
{count && <span className="badge">{count}</span>}

// ✅ Fixed
{count > 0 && <span className="badge">{count}</span>}`,
      playground: {
        jsx: `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p>Buggy: Inbox {count && <span className="badge">{count}</span>}</p>
      <p>Fixed: Inbox {count > 0 && <span className="badge">{count}</span>}</p>
      <button onClick={() => setCount(count + 1)}>New message</button>
      <button onClick={() => setCount(0)}>Mark all read</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.badge { background: crimson; color: #fff; border-radius: 999px; padding: 0 8px; font-size: 13px; }
button { margin-right: 6px; }`,
      },
      result: 'With count 0, the buggy line shows "Inbox 0" while the fixed line shows just "Inbox".',
      explanation:
        '0 && X evaluates to 0, and React renders numbers. count > 0 evaluates to false, which React ignores.',
    },
    {
      title: 'Rendering a filtered list with map and keys',
      scenario: 'Show a list of courses with IDs; a toggle shows only free courses; show an empty state when nothing matches.',
      steps: [
        'Create an array of course objects with unique id fields',
        'Filter by the onlyFree flag, then map to <li key={course.id}>',
        'Handle the empty case with a ternary',
      ],
      code: `const courses = [
  { id: 101, title: "HTML Basics", price: 0 },
  { id: 102, title: "Advanced CSS", price: 499 },
  { id: 103, title: "JavaScript Intro", price: 0 },
  { id: 104, title: "React Mastery", price: 999 },
];

function App() {
  const [onlyFree, setOnlyFree] = React.useState(false);
  const visible = onlyFree ? courses.filter(c => c.price === 0) : courses;
  return (
    <ul>
      {visible.map(c => (
        <li key={c.id}>{c.title} – {c.price === 0 ? "FREE" : "₹" + c.price}</li>
      ))}
    </ul>
  );
}`,
      playground: {
        jsx: `const courses = [
  { id: 101, title: "HTML Basics", price: 0, level: "Beginner" },
  { id: 102, title: "Advanced CSS", price: 499, level: "Intermediate" },
  { id: 103, title: "JavaScript Intro", price: 0, level: "Beginner" },
  { id: 104, title: "React Mastery", price: 999, level: "Advanced" },
];

function App() {
  const [onlyFree, setOnlyFree] = React.useState(false);
  const [level, setLevel] = React.useState("All");
  const visible = courses
    .filter(c => !onlyFree || c.price === 0)
    .filter(c => level === "All" || c.level === level);

  return (
    <div>
      <label><input type="checkbox" checked={onlyFree} onChange={e => setOnlyFree(e.target.checked)} /> Free only</label>
      <select value={level} onChange={e => setLevel(e.target.value)}>
        {["All", "Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
      </select>
      {visible.length === 0 ? (
        <p className="empty">No courses match your filters.</p>
      ) : (
        <ul>
          {visible.map(c => (
            <li key={c.id}>
              <b>{c.title}</b> <small>({c.level})</small> – {c.price === 0 ? <span className="free">FREE</span> : "₹" + c.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
select { margin-left: 12px; }
li { margin: 6px 0; }
.free { color: #16a34a; font-weight: bold; }
.empty { color: #6b7280; font-style: italic; }`,
      },
      result: 'A course list that shrinks when "Free only" is ticked or a level is chosen; "Free only" + "Advanced" shows the empty message.',
      explanation:
        'filter() returns a new array of matching items, map() turns them into <li> elements, and each li has a stable key (the course id). The ternary chooses between the empty state and the list.',
    },
    {
      title: 'Why index keys break: a live demonstration',
      scenario: 'Two lists each have a text input per item. Adding an item at the top shows that index keys attach typed text to the wrong row.',
      steps: [
        'Type a note into the input next to "Alice" in both lists',
        'Click "Add to top"',
        'In the index-key list the note now sits next to the new name; in the id-key list it stays with Alice',
      ],
      code: `// ❌ index as key
{people.map((p, index) => <Row key={index} name={p.name} />)}

// ✅ stable id as key
{people.map(p => <Row key={p.id} name={p.name} />)}`,
      playground: {
        jsx: `function Row({ name }) {
  return (
    <li>
      <span className="name">{name}</span>
      <input placeholder="note..." />
    </li>
  );
}

let nextId = 3;
const extraNames = ["Zara", "Yash", "Xavier", "Wen"];

function App() {
  const [people, setPeople] = React.useState([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
  const addTop = () => {
    const name = extraNames[(nextId - 3) % extraNames.length];
    setPeople([{ id: nextId++, name }, ...people]);
  };
  return (
    <div>
      <button onClick={addTop}>Add to top</button>
      <div className="cols">
        <div>
          <h4>❌ key = index</h4>
          <ul>{people.map((p, i) => <Row key={i} name={p.name} />)}</ul>
        </div>
        <div>
          <h4>✅ key = id</h4>
          <ul>{people.map(p => <Row key={p.id} name={p.name} />)}</ul>
        </div>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.cols { display: flex; gap: 24px; flex-wrap: wrap; }
ul { padding: 0; list-style: none; }
li { margin: 4px 0; }
.name { display: inline-block; width: 60px; }
input { width: 110px; }`,
      },
      result: 'After adding to the top, the left list shows your note next to the wrong name; the right list keeps it next to Alice.',
      explanation:
        'With index keys, the new item gets key 0, the key Alice used to have, so React reuses Alice\'s old DOM input for the new row. With id keys React sees a new key and inserts a fresh row while moving Alice\'s row intact.',
    },
  ],
  interview: [
    { q: 'What are the ways to conditionally render in React?', a: 'if/else with early return before JSX, the ternary operator inside JSX, logical && for show-or-nothing, returning null from a component, and storing JSX in a variable chosen by if/switch.', level: 'Easy' },
    { q: 'Why does {count && <Comp />} sometimes render 0?', a: 'Because && returns the left operand when it is falsy. 0 is falsy, so the expression returns 0, and React renders numbers. Use count > 0 && ... instead.', level: 'Medium' },
    { q: 'What is a key in React lists?', a: 'A special prop that gives each sibling element a stable identity so React can match items between renders during reconciliation, preserving DOM and state for the right items.', level: 'Easy' },
    { q: 'Why is using the array index as key discouraged?', a: 'When items are inserted, removed, filtered or reordered, indexes shift, so React associates state and DOM nodes with the wrong items, causing bugs and extra re-renders. It is acceptable only for static lists that never change order.', level: 'Medium' },
    { q: 'Why not use Math.random() as a key?', a: 'It generates a different key on every render, so React thinks every item is new, unmounts and remounts all of them, losing state and hurting performance.', level: 'Medium' },
    { q: 'Do keys need to be globally unique?', a: 'No, only unique among siblings in the same array. Two different lists can use the same keys.', level: 'Easy' },
    { q: 'Can a child component read its key through props?', a: 'No. key is used by React internally and is not passed to the component. Pass the id as a separate prop if needed.', level: 'Medium' },
    { q: 'Where should the key be placed when mapping to a component?', a: 'On the outermost element returned by the map callback, e.g. <ProductCard key={p.id} />, not on an element inside ProductCard.', level: 'Easy' },
    { q: 'How do you render nothing from a component?', a: 'Return null. The component still exists in the tree (its hooks still run) but produces no DOM output.', level: 'Easy' },
    { q: 'How would you render a list where each item needs two sibling elements (like dt and dd)?', a: 'Map to <React.Fragment key={item.id}>...</React.Fragment>, because the short <> syntax cannot take a key.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Show a traffic light message: "Stop" for red, "Wait" for yellow, "Go" for green, using buttons to change the color.',
      hint: 'Keep the color in state and use an object lookup or if/else.',
      solution: `const messages = { red: "Stop", yellow: "Wait", green: "Go" };

function App() {
  const [color, setColor] = React.useState("red");
  return (
    <div>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: color }} />
      <h2>{messages[color]}</h2>
      {Object.keys(messages).map(c => (
        <button key={c} onClick={() => setColor(c)}>{c}</button>
      ))}
    </div>
  );
}`,
    },
    {
      task: 'Render a table of students (id, name, marks) and highlight rows with marks below 40 in red with a "Fail" label.',
      hint: 'Use a ternary for the style and && for the label.',
      solution: `const students = [
  { id: 1, name: "Aman", marks: 78 },
  { id: 2, name: "Bela", marks: 35 },
  { id: 3, name: "Chirag", marks: 91 },
];

function App() {
  return (
    <table border="1" cellPadding="6">
      <tbody>
        {students.map(s => (
          <tr key={s.id} style={{ background: s.marks < 40 ? "#fee2e2" : "white" }}>
            <td>{s.name}</td>
            <td>{s.marks} {s.marks < 40 && <b>Fail</b>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
    },
    {
      task: 'Create a search box that filters a list of cities as you type, and shows "No city found" when nothing matches.',
      hint: 'city.toLowerCase().includes(query.toLowerCase())',
      solution: `const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad"];

function App() {
  const [query, setQuery] = React.useState("");
  const found = cities.filter(c => c.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search city" />
      {found.length === 0 ? <p>No city found</p> : <ul>{found.map(c => <li key={c}>{c}</li>)}</ul>}
    </div>
  );
}`,
    },
    {
      task: 'Render a nested list: categories each containing items, using keys on both levels.',
      hint: 'map inside map; each level needs its own key.',
      solution: `const menu = [
  { id: "veg", name: "Veg", items: [{ id: 1, name: "Paneer Tikka" }, { id: 2, name: "Dal Makhani" }] },
  { id: "dessert", name: "Desserts", items: [{ id: 3, name: "Gulab Jamun" }] },
];

function App() {
  return (
    <div>
      {menu.map(cat => (
        <section key={cat.id}>
          <h3>{cat.name}</h3>
          <ul>{cat.items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
        </section>
      ))}
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'What does {items.length && <List />} render when items is empty?', options: ['Nothing', 'The List', '0', 'An error'], answer: 2, explanation: 'items.length is 0, which is rendered as text.' },
    { question: 'Which is the best key for a list of users from a database?', options: ['user.id', 'index', 'Math.random()', 'Date.now()'], answer: 0, explanation: 'A stable unique ID from the data is ideal.' },
    { question: 'Which method transforms an array of data into JSX elements?', options: ['forEach', 'reduce', 'find', 'map'], answer: 3, explanation: 'map returns a new array, which React can render; forEach returns undefined.' },
    { question: 'How can a component render nothing?', options: ['return false only in classes', 'return null', 'return ""', 'throw an error'], answer: 1, explanation: 'Returning null renders nothing.' },
    { question: 'Keys must be unique...', options: ['Across the whole app', 'Across the page', 'Among siblings in the same list', 'They need not be unique'], answer: 2, explanation: 'Uniqueness is only required among siblings.' },
  ],
};
