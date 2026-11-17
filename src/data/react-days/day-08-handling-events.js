export default {
  id: 'day-08-handling-events',
  title: 'Handling Events in React',
  module: 'Module 2: State & Events',
  day: 8,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Learn how React handles user interactions: attaching handlers with camelCase props, passing functions (not calling them), the SyntheticEvent object, passing arguments, preventDefault, stopPropagation, and keyboard, mouse and form events.',
  objectives: [
    'Attach event handlers using onClick, onChange, onSubmit, onKeyDown and more',
    'Avoid the classic mistake of calling a handler instead of passing it',
    'Pass arguments to handlers with arrow functions',
    'Use the event object: target, key, preventDefault and stopPropagation',
    'Name handler props and functions using the onX / handleX convention',
  ],
  theory: [
    {
      heading: 'Event handlers in JSX',
      content:
        'In HTML you write `onclick="doSomething()"` (a string). In React you pass a **function** to a **camelCase** prop: `onClick={doSomething}`.\n\nAnalogy: you give the waiter your phone number (the function) so they can call you when the table is ready. You do not call yourself right now.',
      syntax: `function App() {
  function handleClick() {
    alert("Button clicked!");
  }
  return <button onClick={handleClick}>Click me</button>;
}`,
      tip: 'Biggest beginner mistake: onClick={handleClick()} calls the function immediately during render (and, if it sets state, causes an infinite loop). Pass the function: onClick={handleClick}, or wrap: onClick={() => handleClick(id)}.',
    },
    {
      heading: 'Passing arguments to handlers',
      content:
        'When the handler needs data (like an item id), wrap the call in an **arrow function**. The arrow function is created and passed; it runs only when the event happens.',
      syntax: `function deleteItem(id) { ... }

{items.map(item => (
  <button key={item.id} onClick={() => deleteItem(item.id)}>Delete</button>
))}

// Need the event too?
<button onClick={e => deleteItem(item.id, e)}>Delete</button>`,
    },
    {
      heading: 'The SyntheticEvent object',
      content:
        'React passes your handler an **event object**. It is a `SyntheticEvent`: a cross-browser wrapper around the native event with the same interface (`target`, `currentTarget`, `type`, `key`, `preventDefault()`, `stopPropagation()`). The native event is available as `e.nativeEvent`.\n\nUseful properties:',
      points: [
        '`e.target`: the element that triggered the event (`e.target.value` for inputs, `e.target.checked` for checkboxes)',
        '`e.currentTarget`: the element the handler is attached to',
        '`e.key`: which key was pressed ("Enter", "Escape", "a")',
        '`e.clientX / e.clientY`: mouse position',
        '`e.preventDefault()`: stop default browser behaviour (form submit reloading the page, link navigation)',
        '`e.stopPropagation()`: stop the event bubbling to parent handlers',
      ],
    },
    {
      heading: 'Common React events',
      content: 'React supports all standard DOM events using camelCase names:',
      points: [
        '**Mouse**: onClick, onDoubleClick, onMouseEnter, onMouseLeave, onMouseMove, onContextMenu',
        '**Form**: onChange (fires on every keystroke in React, unlike HTML), onSubmit, onFocus, onBlur, onInput',
        '**Keyboard**: onKeyDown, onKeyUp (onKeyPress is deprecated)',
        '**Clipboard**: onCopy, onPaste',
        '**Other**: onScroll, onLoad (images), onDragStart, onDrop',
        'Capture phase versions add Capture: onClickCapture',
      ],
      tip: 'In React, onChange on a text input fires on every character typed, which is exactly what you want for live updates.',
    },
    {
      heading: 'Event propagation and preventDefault',
      content:
        'Events **bubble** up from the clicked element through its ancestors, in React too. If a button inside a clickable card is clicked, both handlers run (button first, then card). Call `e.stopPropagation()` in the button\'s handler to stop the card\'s handler.\n\nForms reload the page on submit by default. In a React SPA you almost always call `e.preventDefault()` in `onSubmit`.\n\nIn React 17+, React attaches listeners at the **root container** (not the document), and uses event delegation internally.',
      syntax: `<form onSubmit={e => { e.preventDefault(); save(); }}>...</form>

<div onClick={openCard}>
  <button onClick={e => { e.stopPropagation(); like(); }}>Like</button>
</div>`,
      tip: 'Returning false from a handler does NOT prevent default in React. You must call e.preventDefault() explicitly.',
    },
    {
      heading: 'Naming conventions and passing handlers as props',
      content:
        'Convention: name the **prop** after the event (`onSelect`, `onDelete`, `onAddToCart`) and the **function** that handles it `handleX` (`handleSelect`).\n\nCustom components do not have built-in events; `onSomething` is just a prop. The child decides when to call it.',
      syntax: `function Product({ name, onAddToCart }) {
  return <button onClick={() => onAddToCart(name)}>Add {name}</button>;
}

function App() {
  const handleAddToCart = name => console.log("Added", name);
  return <Product name="Pen" onAddToCart={handleAddToCart} />;
}`,
      tip: 'Coming next (Day 9): forms and controlled components, where onChange and value work together.',
    },
  ],
  examples: [
    {
      title: 'Click handlers and passing arguments',
      scenario: 'A movie list with "Watch" buttons. Each button sends its movie title to a handler that records the last watched movie.',
      steps: [
        'Write handleWatch(title) that updates state',
        'In map, use onClick={() => handleWatch(m.title)}',
        'Click different buttons and see the message change',
      ],
      code: `function App() {
  const [last, setLast] = React.useState("none");
  const handleWatch = title => setLast(title);
  return (
    <>
      {movies.map(m => (
        <button key={m.id} onClick={() => handleWatch(m.title)}>Watch {m.title}</button>
      ))}
      <p>Last watched: {last}</p>
    </>
  );
}`,
      playground: {
        jsx: `const movies = [
  { id: 1, title: "Lagaan" },
  { id: 2, title: "Dangal" },
  { id: 3, title: "RRR" },
];

function App() {
  const [last, setLast] = React.useState("none");
  const [history, setHistory] = React.useState([]);

  function handleWatch(title) {
    setLast(title);
    setHistory(h => [...h, title]);
  }

  return (
    <div>
      {movies.map(m => (
        <button key={m.id} onClick={() => handleWatch(m.title)}>▶ {m.title}</button>
      ))}
      <p>Last watched: <b>{last}</b></p>
      <p>History: {history.join(" → ") || "empty"}</p>
      <button onDoubleClick={() => setHistory([])}>Double-click to clear history</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
button { margin: 4px; padding: 6px 12px; cursor: pointer; }`,
      },
      result: 'Clicking a movie updates "Last watched" and appends to history; double-clicking the last button clears history.',
      explanation:
        'The arrow function () => handleWatch(m.title) is passed to onClick and runs only on click. onDoubleClick is another camelCase event prop.',
    },
    {
      title: 'Reading the event object: input, keyboard and mouse',
      scenario: 'An event inspector shows the typed value, the last key pressed (with Enter to submit), and the mouse position over a box.',
      steps: [
        'Use onChange and read e.target.value',
        'Use onKeyDown and check e.key === "Enter"',
        'Use onMouseMove on a box and read e.nativeEvent.offsetX / offsetY',
      ],
      code: `<input
  onChange={e => setText(e.target.value)}
  onKeyDown={e => { setKey(e.key); if (e.key === "Enter") submit(); }}
/>
<div onMouseMove={e => setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />`,
      playground: {
        jsx: `function App() {
  const [text, setText] = React.useState("");
  const [lastKey, setLastKey] = React.useState("-");
  const [submitted, setSubmitted] = React.useState([]);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [inside, setInside] = React.useState(false);

  function handleKeyDown(e) {
    setLastKey(e.key);
    if (e.key === "Enter" && text.trim()) {
      setSubmitted(s => [...s, text.trim()]);
      setText("");
    }
    if (e.key === "Escape") setText("");
  }

  return (
    <div>
      <input value={text} placeholder="Type, Enter to add, Esc to clear"
        onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} />
      <p>Value: "{text}" · Last key: <kbd>{lastKey}</kbd></p>
      <p>Added: {submitted.join(", ") || "nothing yet"}</p>
      <div className={"pad" + (inside ? " in" : "")}
        onMouseMove={e => setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
        onMouseEnter={() => setInside(true)}
        onMouseLeave={() => setInside(false)}>
        {inside ? "x: " + pos.x + ", y: " + pos.y : "Move the mouse here"}
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
input { padding: 8px; width: 280px; }
kbd { background: #eee; border: 1px solid #bbb; border-radius: 4px; padding: 1px 5px; }
.pad { width: 280px; height: 120px; border: 2px dashed #94a3b8; display: grid; place-items: center; border-radius: 10px; user-select: none; }
.pad.in { background: #ecfeff; border-color: #06b6d4; }`,
      },
      result: 'Typing shows the value and last key; Enter adds to the list; Esc clears; the box shows live mouse coordinates.',
      explanation:
        'Each handler receives the event object. e.target.value is the input text, e.key is the key name, and offsetX/Y (from the native event) give the position inside the box.',
    },
    {
      title: 'preventDefault on forms and links',
      scenario: 'Submitting a form normally reloads the page and loses state. preventDefault keeps the SPA running.',
      steps: [
        'Add onSubmit to the form and call e.preventDefault()',
        'Add a link whose click is intercepted',
        'Submit and click the link: no navigation happens, state is kept',
      ],
      code: `function handleSubmit(e) {
  e.preventDefault();          // stop page reload
  setMessage("Subscribed: " + email);
}

<form onSubmit={handleSubmit}>
  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
  <button type="submit">Subscribe</button>
</form>`,
      playground: {
        jsx: `function App() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("✅ Subscribed: " + email);
    setEmail("");
  }

  function handleLink(e) {
    e.preventDefault();
    setMessage("🔗 Link click intercepted, no navigation.");
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} required placeholder="you@mail.com"
          onChange={e => setEmail(e.target.value)} />
        <button type="submit">Subscribe</button>
      </form>
      <p><a href="https://example.com" onClick={handleLink}>Go to example.com</a></p>
      <p className="msg">{message}</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
input { padding: 8px; margin-right: 6px; }
.msg { color: #15803d; font-weight: 600; }`,
      },
      result: 'Submitting shows the success message without a page reload; clicking the link shows a message instead of navigating.',
      explanation:
        'onSubmit fires on Enter or button click. e.preventDefault() cancels the browser\'s default action. The required attribute still validates because the browser checks it before the submit event fires.',
    },
    {
      title: 'Bubbling and stopPropagation; custom event props',
      scenario: 'A clickable product card opens details, but the "Add to cart" button inside should not open the card. The card exposes onOpen and onAddToCart props.',
      steps: [
        'Give the card div an onClick that calls onOpen',
        'In the inner button call e.stopPropagation() before onAddToCart',
        'Toggle the checkbox to disable stopPropagation and see both fire',
      ],
      code: `function ProductCard({ name, onOpen, onAddToCart }) {
  return (
    <div className="card" onClick={() => onOpen(name)}>
      <h4>{name}</h4>
      <button onClick={e => { e.stopPropagation(); onAddToCart(name); }}>Add to cart</button>
    </div>
  );
}`,
      playground: {
        jsx: `function ProductCard({ name, stop, onOpen, onAddToCart }) {
  return (
    <div className="card" onClick={() => onOpen(name)}>
      <h4>{name}</h4>
      <button onClick={e => {
        if (stop) e.stopPropagation();
        onAddToCart(name);
      }}>Add to cart</button>
    </div>
  );
}

function App() {
  const [log, setLog] = React.useState([]);
  const [stop, setStop] = React.useState(true);
  const add = msg => setLog(l => [msg, ...l].slice(0, 6));

  return (
    <div>
      <label><input type="checkbox" checked={stop} onChange={e => setStop(e.target.checked)} /> use stopPropagation</label>
      <div className="row">
        {["Earbuds", "Smartwatch"].map(n => (
          <ProductCard key={n} name={n} stop={stop}
            onOpen={name => add("📄 Opened details: " + name)}
            onAddToCart={name => add("🛒 Added to cart: " + name)} />
        ))}
      </div>
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.row { display: flex; gap: 12px; margin: 12px 0; }
.card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; cursor: pointer; width: 140px; }
.card:hover { background: #f1f5f9; }`,
      },
      result: 'With stopPropagation on, clicking the button logs only "Added to cart". With it off, both "Added" and "Opened" are logged.',
      explanation:
        'The click starts at the button and bubbles to the card. stopPropagation stops it at the button. onOpen and onAddToCart are ordinary props holding functions; ProductCard decides when to call them.',
    },
  ],
  interview: [
    { q: 'How are React events different from HTML events?', a: 'React uses camelCase names (onClick vs onclick), you pass a function rather than a string, you must call preventDefault explicitly (returning false does not work), and handlers receive a cross-browser SyntheticEvent.', level: 'Easy' },
    { q: 'What is a SyntheticEvent?', a: 'React\'s cross-browser wrapper around the native browser event, exposing the same interface (target, preventDefault, stopPropagation, etc.). The underlying native event is available as e.nativeEvent.', level: 'Medium' },
    { q: 'What is wrong with onClick={handleClick()}?', a: 'It calls handleClick during render and passes its return value (usually undefined) as the handler. If it sets state it causes an infinite re-render loop. Pass handleClick or () => handleClick().', level: 'Easy' },
    { q: 'How do you pass an argument to an event handler?', a: 'Wrap it in an arrow function: onClick={() => remove(id)}, or onClick={e => remove(id, e)} if you also need the event.', level: 'Easy' },
    { q: 'How do you prevent a form from reloading the page?', a: 'Call e.preventDefault() in the onSubmit handler of the form.', level: 'Easy' },
    { q: 'What is the difference between e.target and e.currentTarget?', a: 'target is the element where the event originated (e.g. an icon inside a button). currentTarget is the element whose handler is currently running (the button).', level: 'Medium' },
    { q: 'How does React attach event listeners internally?', a: 'React uses event delegation: since React 17 it attaches one listener per event type to the root container, then dispatches to the right component handlers based on the fiber tree.', level: 'Hard' },
    { q: 'Do events bubble in React? How do you stop it?', a: 'Yes, React events bubble through the React tree (even through portals). Call e.stopPropagation() in a handler to stop parent handlers from running.', level: 'Medium' },
    { q: 'How do child components communicate events to parents?', a: 'The parent passes a callback prop (e.g. onDelete); the child calls it with any data when the event occurs.', level: 'Easy' },
    { q: 'Does onChange in React behave like the HTML change event?', a: 'No. React\'s onChange on text inputs fires on every keystroke (like the native input event), not only when the input loses focus.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a button that changes its own text to a random greeting each time it is clicked.',
      hint: 'Pick a random index from an array of greetings.',
      solution: `const greetings = ["Hello", "Namaste", "Hola", "Bonjour", "Ciao"];

function App() {
  const [text, setText] = React.useState("Click me");
  const handleClick = () => setText(greetings[Math.floor(Math.random() * greetings.length)]);
  return <button onClick={handleClick}>{text}</button>;
}`,
    },
    {
      task: 'Build a character counter for a tweet box (max 140). Show remaining characters and turn red when below 10.',
      hint: 'Use onChange and e.target.value.length.',
      solution: `function App() {
  const [text, setText] = React.useState("");
  const left = 140 - text.length;
  return (
    <div>
      <textarea maxLength={140} rows={4} cols={40} value={text} onChange={e => setText(e.target.value)} />
      <p style={{ color: left < 10 ? "red" : "gray" }}>{left} characters left</p>
    </div>
  );
}`,
    },
    {
      task: 'Make a box that changes background color on mouse enter and resets on mouse leave, and logs right-clicks without opening the browser menu.',
      hint: 'onMouseEnter, onMouseLeave, onContextMenu with e.preventDefault().',
      solution: `function App() {
  const [hover, setHover] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={e => { e.preventDefault(); setMsg("Right-clicked!"); }}
      style={{ width: 200, height: 100, background: hover ? "#fde68a" : "#e5e7eb", padding: 10 }}>
      {msg || "Hover or right-click me"}
    </div>
  );
}`,
    },
    {
      task: 'Create a Rating component with 5 stars that calls an onRate(n) prop when a star is clicked; the parent shows "You rated N stars".',
      hint: 'Map [1,2,3,4,5] to spans, each calling onRate(n).',
      solution: `function Rating({ value, onRate }) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} onClick={() => onRate(n)} style={{ cursor: "pointer", fontSize: 28 }}>
          {n <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function App() {
  const [rating, setRating] = React.useState(0);
  return (
    <div>
      <Rating value={rating} onRate={setRating} />
      <p>{rating ? "You rated " + rating + " stars" : "Not rated yet"}</p>
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which correctly attaches a click handler?', options: ['onclick="handle()"', 'onClick={handle()}', 'onClick={handle}', 'click={handle}'], answer: 2, explanation: 'Pass the function reference with camelCase onClick.' },
    { question: 'How do you stop a form submit from reloading the page?', options: ['return false', 'e.preventDefault()', 'e.stopPropagation()', 'e.cancel()'], answer: 1, explanation: 'preventDefault cancels the default browser action.' },
    { question: 'How do you read the value of an input in onChange?', options: ['e.target.value', 'e.value', 'this.value', 'e.input'], answer: 0, explanation: 'e.target is the input element.' },
    { question: 'Which event fires when a key is pressed down?', options: ['onPress', 'onKey', 'onKeyPressDown', 'onKeyDown'], answer: 3, explanation: 'onKeyDown (onKeyPress is deprecated).' },
    { question: 'What does e.stopPropagation() do?', options: ['Cancels default behaviour', 'Stops the event bubbling to parent handlers', 'Removes the listener', 'Reloads the component'], answer: 1, explanation: 'It prevents ancestor handlers from receiving the event.' },
  ],
};
