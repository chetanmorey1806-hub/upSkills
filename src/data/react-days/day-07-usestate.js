export default {
  id: 'day-07-usestate',
  title: 'State with useState: State vs Props and Immutable Updates',
  module: 'Module 2: State & Events',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'State is a component\'s memory. Learn how useState works, why updating state triggers a re-render, how state differs from props, how to use functional updates, and how to update objects and arrays immutably.',
  objectives: [
    'Declare and update state with the useState hook',
    'Explain the difference between state and props, and between state and regular variables',
    'Use functional updates (prev => ...) when the new value depends on the old one',
    'Update objects and arrays immutably with spread, map and filter',
    'Follow the Rules of Hooks',
  ],
  theory: [
    {
      heading: 'Why do we need state?',
      content:
        'A normal variable inside a component is recreated every time the function runs, and changing it does not tell React to update the screen. **State** is data that React remembers between renders, and **changing it causes a re-render**.\n\nAnalogy: a whiteboard in a classroom. Ordinary variables are like words spoken aloud: gone in a moment. State is written on the whiteboard: it stays there, and whenever the teacher updates it, everyone looks again (re-render).',
      syntax: `// ❌ Does not work: the screen never updates
function Counter() {
  let count = 0;
  return <button onClick={() => count++}>{count}</button>;
}`,
    },
    {
      heading: 'useState syntax',
      content:
        '`useState` is a **hook**: a special function that lets components "hook into" React features. It returns an array with exactly two items, which we destructure:\n\n1. the **current value**\n2. a **setter function** that updates the value and schedules a re-render\n\nThe argument is the **initial value**, used only on the first render.',
      syntax: `import { useState } from "react";   // in a project
// const { useState } = React;      // in the playground

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}`,
      points: [
        'Naming convention: `[thing, setThing]`',
        'State can hold any type: number, string, boolean, array, object, null',
        'Each component instance has its own independent state',
        '**Lazy initial state**: `useState(() => expensiveCalc())` runs the function only once',
      ],
    },
    {
      heading: 'State is a snapshot and updates are batched',
      content:
        'Calling the setter does **not** change the variable immediately. It asks React to re-render with the new value. Inside the current render, `count` remains the old value (a "snapshot").\n\nReact 18 also **batches** multiple setState calls in the same event into one re-render.\n\nWhen the next value depends on the previous one, use a **functional update**: pass a function that receives the latest value.',
      syntax: `// ❌ Adds only 1: all three read the same snapshot (count = 0)
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);

// ✅ Adds 3: each function gets the latest value
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1);`,
      tip: 'console.log(count) right after setCount(count + 1) prints the OLD value. That is expected, not a bug.',
    },
    {
      heading: 'Immutable updates for objects and arrays',
      content:
        'React decides whether to re-render by comparing the old and new state with `Object.is`. If you **mutate** an object or array (`user.name = "X"`, `arr.push(4)`) and pass the same reference to the setter, React sees "no change" and may skip the update.\n\nAlways create a **new** object or array:',
      syntax: `// Objects: spread then override
setUser({ ...user, city: "Pune" });
setUser(prev => ({ ...prev, address: { ...prev.address, pin: "411001" } }));

// Arrays
setItems([...items, newItem]);                        // add
setItems(items.filter(i => i.id !== id));             // remove
setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i)); // update
setItems([...items].sort((a, b) => a.price - b.price)); // sort a copy`,
      tip: 'Methods that mutate (avoid on state): push, pop, shift, unshift, splice, sort, reverse, direct assignment. Safe ones: map, filter, slice, concat, spread, toSorted.',
    },
    {
      heading: 'State vs Props',
      content: '',
      points: [
        '**Props**: passed from parent; read-only for the child; like function arguments',
        '**State**: owned by the component; changeable via its setter; like a function\'s private memory',
        'Both trigger re-renders when they change',
        'A parent\'s state often becomes a child\'s props',
        'Do not copy props into state unless you intentionally want to ignore future prop changes',
        'If something can be **computed** from props or state, compute it during render instead of storing it in extra state (derived state)',
      ],
    },
    {
      heading: 'Rules of Hooks',
      content:
        '1. Call hooks only at the **top level** of a component: not inside if, loops, or nested functions. React relies on the call order to match state to each hook.\n2. Call hooks only from **React function components or custom hooks**, not from regular JS functions.\n\nThe ESLint plugin `eslint-plugin-react-hooks` (included in the Vite template) warns you about violations.',
      tip: 'Coming next (Day 8): handling events like click, input, submit and keyboard in detail.',
    },
  ],
  examples: [
    {
      title: 'Counter with functional updates',
      scenario: 'Build a counter with +1, -1, +3 and Reset buttons, and see why +3 must use functional updates.',
      steps: [
        'Declare const [count, setCount] = useState(0)',
        'Add buttons calling setCount',
        'Click "+3 (wrong)" and "+3 (right)" and compare',
      ],
      code: `function App() {
  const [count, setCount] = React.useState(0);
  const addThreeWrong = () => { setCount(count + 1); setCount(count + 1); setCount(count + 1); };
  const addThreeRight = () => { setCount(c => c + 1); setCount(c => c + 1); setCount(c => c + 1); };
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={addThreeWrong}>+3 (wrong)</button>
      <button onClick={addThreeRight}>+3 (right)</button>
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);
  const addThreeWrong = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  const addThreeRight = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  };
  return (
    <div className="counter">
      <h1>{count}</h1>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={addThreeWrong}>+3 (wrong)</button>
      <button onClick={addThreeRight}>+3 (right)</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.counter h1 { font-size: 3rem; margin: 0 0 10px; }
button { margin: 3px; padding: 6px 12px; }`,
      },
      result: '"+3 (wrong)" adds only 1, "+3 (right)" adds 3.',
      explanation:
        'In the wrong version all three calls compute 0 + 1 from the same snapshot. Functional updates are queued and each receives the result of the previous one.',
    },
    {
      title: 'Updating an object in state immutably',
      scenario: 'A profile editor stores user details in one object. Change fields without losing the others.',
      steps: [
        'Store { name, city, skills } in state',
        'Create an update function that spreads the old object and overrides one field',
        'Type in the inputs and watch the preview update',
      ],
      code: `const [user, setUser] = useState({ name: "Ravi", city: "Indore", premium: false });

// ✅ copy then override
setUser({ ...user, city: "Bhopal" });

// ❌ mutation, React may not re-render
user.city = "Bhopal";
setUser(user);`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [user, setUser] = useState({ name: "Ravi", city: "Indore", premium: false });

  const update = (field, value) => setUser(prev => ({ ...prev, [field]: value }));

  const brokenUpdate = () => {
    user.city = "MUTATED";   // ❌ same object
    setUser(user);           // React sees no change → no re-render
  };

  return (
    <div className="wrap">
      <label>Name <input value={user.name} onChange={e => update("name", e.target.value)} /></label>
      <label>City <input value={user.city} onChange={e => update("city", e.target.value)} /></label>
      <label><input type="checkbox" checked={user.premium} onChange={e => update("premium", e.target.checked)} /> Premium</label>
      <button onClick={brokenUpdate}>Mutate directly (broken)</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.wrap { display: flex; flex-direction: column; gap: 8px; max-width: 280px; }
pre { background: #0f172a; color: #a5f3fc; padding: 10px; border-radius: 8px; }`,
      },
      result: 'Typing updates the JSON preview. The "Mutate directly" button does nothing visible until another proper update happens.',
      explanation:
        '{ ...prev, [field]: value } copies every property and replaces one using a computed property name. Mutating and passing the same reference makes Object.is(old, new) true, so React bails out of re-rendering.',
    },
    {
      title: 'Array state: add, toggle and remove',
      scenario: 'A shopping list where items can be added, marked as bought and deleted, all with immutable array methods.',
      steps: [
        'Store an array of { id, name, bought } objects',
        'Add with spread, toggle with map, remove with filter',
        'Try all three operations',
      ],
      code: `setItems([...items, { id: Date.now(), name, bought: false }]);           // add
setItems(items.map(i => i.id === id ? { ...i, bought: !i.bought } : i)); // toggle
setItems(items.filter(i => i.id !== id));                                // remove`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [items, setItems] = useState([
    { id: 1, name: "Milk", bought: false },
    { id: 2, name: "Bread", bought: true },
  ]);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setItems([...items, { id: Date.now(), name: text.trim(), bought: false }]);
    setText("");
  };
  const toggle = id => setItems(items.map(i => (i.id === id ? { ...i, bought: !i.bought } : i)));
  const remove = id => setItems(items.filter(i => i.id !== id));

  const left = items.filter(i => !i.bought).length; // derived, not stored

  return (
    <div>
      <h3>Shopping list ({left} left)</h3>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Add item" />
      <button onClick={add}>Add</button>
      <ul>
        {items.map(i => (
          <li key={i.id}>
            <span onClick={() => toggle(i.id)} className={i.bought ? "done" : ""}>{i.name}</span>
            <button onClick={() => remove(i.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
li { margin: 6px 0; }
li span { cursor: pointer; margin-right: 8px; }
.done { text-decoration: line-through; color: #9ca3af; }`,
      },
      result: 'You can add items, click an item to strike it through, and delete it with ✕. The heading count updates.',
      explanation:
        'Every update creates a new array. The "left" count is derived from items during render, so it can never be out of sync, which is better than keeping a separate counter in state.',
    },
    {
      title: 'State vs props: parent state becomes child props',
      scenario: 'A parent holds the selected theme in state and passes it as a prop to a Preview child, which cannot change it directly.',
      steps: [
        'Keep theme in App\'s state',
        'Pass theme to Preview as a prop',
        'Change the theme with buttons in App and watch Preview update',
      ],
      code: `function Preview({ theme }) {      // prop: read-only here
  return <div className={theme}>Current theme: {theme}</div>;
}

function App() {
  const [theme, setTheme] = useState("light"); // state: owned here
  return (
    <>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <Preview theme={theme} />
    </>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function Preview({ theme }) {
  const [clicks, setClicks] = useState(0); // Preview's own private state
  return (
    <div className={"preview " + theme}>
      <p>Prop theme = <b>{theme}</b></p>
      <p>Own state clicks = <b>{clicks}</b></p>
      <button onClick={() => setClicks(clicks + 1)}>Click inside preview</button>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("sepia")}>Sepia</button>
      <Preview theme={theme} />
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.preview { margin-top: 12px; padding: 16px; border-radius: 10px; transition: .3s; }
.light { background: #fff; color: #111; border: 1px solid #ddd; }
.dark { background: #111827; color: #f9fafb; }
.sepia { background: #f4ecd8; color: #5b4636; }`,
      },
      result: 'The theme buttons in App restyle the Preview; Preview\'s own click counter is independent.',
      explanation:
        'theme is state in App and a prop in Preview. clicks is state private to Preview. When App\'s state changes, React re-renders App and passes the new prop to Preview, while Preview keeps its own clicks.',
    },
  ],
  interview: [
    { q: 'What is state in React?', a: 'Data that a component owns and remembers between renders. Updating it via its setter schedules a re-render so the UI reflects the new data.', level: 'Easy' },
    { q: 'What does useState return?', a: 'An array with two elements: the current state value and a setter function. We usually destructure it: const [value, setValue] = useState(initial).', level: 'Easy' },
    { q: 'Why does console.log after setState show the old value?', a: 'State updates are not applied immediately; the setter schedules a re-render. The variable in the current render is a snapshot and stays the same until the next render.', level: 'Medium' },
    { q: 'When should you use a functional update?', a: 'Whenever the new state depends on the previous state, especially with multiple updates in one event or in async callbacks: setCount(c => c + 1). It always receives the latest value.', level: 'Medium' },
    { q: 'Why must state be updated immutably?', a: 'React compares old and new state by reference (Object.is). Mutating the same object keeps the reference identical, so React may skip re-rendering; it also breaks features like memoization and time-travel debugging.', level: 'Medium' },
    { q: 'What is batching in React 18?', a: 'React groups multiple state updates that happen in the same event, timeout, promise or native handler into a single re-render for better performance (automatic batching).', level: 'Hard' },
    { q: 'State vs props?', a: 'Props come from the parent and are read-only inside the child. State is owned and modified by the component itself. Changing either causes a re-render.', level: 'Easy' },
    { q: 'What are the Rules of Hooks?', a: 'Call hooks only at the top level (not in conditions, loops or nested functions) and only from React function components or custom hooks. React relies on consistent call order.', level: 'Easy' },
    { q: 'What is lazy initial state?', a: 'Passing a function to useState, e.g. useState(() => JSON.parse(localStorage.getItem("x"))). The function runs only on the first render, avoiding repeated expensive work.', level: 'Hard' },
    { q: 'What is derived state and why avoid storing it?', a: 'Values that can be computed from existing props/state (e.g. a filtered list or total). Storing them separately risks them getting out of sync; compute them during render instead.', level: 'Medium' },
    { q: 'Does setting state to the same value re-render?', a: 'If the new value is identical (Object.is) to the current one, React bails out and usually skips re-rendering the children.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a "Show/Hide password" input using a boolean state.',
      hint: 'type={show ? "text" : "password"}',
      solution: `function App() {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <input type={show ? "text" : "password"} placeholder="Password" />
      <button onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}`,
    },
    {
      task: 'Create a quantity selector with - and + buttons that never goes below 1 or above 10.',
      hint: 'Math.max / Math.min inside a functional update.',
      solution: `function App() {
  const [qty, setQty] = React.useState(1);
  return (
    <div>
      <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
      <span style={{ margin: "0 12px" }}>{qty}</span>
      <button onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
    </div>
  );
}`,
    },
    {
      task: 'Store a settings object { darkMode, fontSize } in one state and add controls to toggle darkMode and increase fontSize.',
      hint: 'setSettings(prev => ({ ...prev, fontSize: prev.fontSize + 2 }))',
      solution: `function App() {
  const [settings, setSettings] = React.useState({ darkMode: false, fontSize: 16 });
  return (
    <div style={{ background: settings.darkMode ? "#111" : "#fff", color: settings.darkMode ? "#fff" : "#111", fontSize: settings.fontSize, padding: 16 }}>
      <p>Sample text</p>
      <button onClick={() => setSettings(p => ({ ...p, darkMode: !p.darkMode }))}>Toggle dark</button>
      <button onClick={() => setSettings(p => ({ ...p, fontSize: p.fontSize + 2 }))}>A+</button>
    </div>
  );
}`,
    },
    {
      task: 'Make a color palette: a list of colors in state, a button to add a random color, and clicking a swatch removes it.',
      hint: 'Random hex: "#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6, "0")',
      solution: `function App() {
  const [colors, setColors] = React.useState(["#f87171", "#60a5fa"]);
  const addRandom = () =>
    setColors(c => [...c, "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")]);
  return (
    <div>
      <button onClick={addRandom}>Add color</button>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {colors.map((c, i) => (
          <div key={c + i} title={c} onClick={() => setColors(colors.filter((_, j) => j !== i))}
            style={{ width: 50, height: 50, background: c, borderRadius: 8, cursor: "pointer" }} />
        ))}
      </div>
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'What does useState(0) return?', options: ['The number 0', 'An array [value, setter]', 'An object { value, set }', 'A promise'], answer: 1, explanation: 'useState returns a pair: the current value and a setter.' },
    { question: 'count is 5. After setCount(count + 1); setCount(count + 1); what is count on next render?', options: ['7', '5', '6', '8'], answer: 2, explanation: 'Both calls use the snapshot 5, so the result is 6.' },
    { question: 'Which correctly adds an item to array state?', options: ['items.push(x); setItems(items)', 'setItems(items.push(x))', 'items[items.length] = x', 'setItems([...items, x])'], answer: 3, explanation: 'Create a new array with spread.' },
    { question: 'Where can hooks be called?', options: ['At the top level of a function component', 'Inside if statements', 'Inside for loops', 'In any JS function'], answer: 0, explanation: 'Rules of Hooks: top level of components or custom hooks only.' },
    { question: 'Which is the correct way to update one field of an object state?', options: ['setUser(user.name = "A")', 'setUser({ ...user, name: "A" })', 'user.name = "A"', 'setUser.name("A")'], answer: 1, explanation: 'Spread the old object into a new one and override the field.' },
  ],
};
