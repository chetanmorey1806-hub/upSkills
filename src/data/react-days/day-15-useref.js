export default {
  id: 'day-15-useref',
  title: 'useRef: DOM Refs and Mutable Values',
  module: 'Module 3: Hooks',
  day: 15,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    'useRef gives a component a box whose value persists between renders without causing re-renders. Use it to access DOM elements (focus, scroll, measure, play video) and to store mutable values like timer IDs and previous values. Learn ref vs state and how to pass refs to child components.',
  objectives: [
    'Create a ref with useRef and read/write ref.current',
    'Access DOM nodes to focus inputs, scroll and measure elements',
    'Store mutable values (interval IDs, previous values, render counts) without re-rendering',
    'Choose correctly between useRef and useState',
    'Pass refs to child components (forwardRef and React 19 ref-as-prop)',
  ],
  theory: [
    {
      heading: 'What is useRef?',
      content:
        '`useRef(initialValue)` returns a plain object `{ current: initialValue }`. React gives you the **same object on every render**. You can read and change `ref.current` freely, and **changing it does NOT trigger a re-render**.\n\nAnalogy: state is like a scoreboard in a stadium: when it changes, everyone looks (re-render). A ref is like a notebook in your pocket: you can write in it any time, but nobody else is notified.',
      syntax: `const countRef = useRef(0);

function handleClick() {
  countRef.current = countRef.current + 1; // no re-render
  console.log(countRef.current);
}`,
    },
    {
      heading: 'Use case 1: accessing DOM elements',
      content:
        'React manages the DOM for you, but sometimes you need the real element: focusing an input, scrolling to a section, measuring size, controlling `<video>`, integrating a non-React library (charts, maps).\n\n1. Create a ref: `const inputRef = useRef(null)`\n2. Attach it: `<input ref={inputRef} />`\n3. After React renders, `inputRef.current` is the DOM node. It is `null` before mount and after unmount.',
      syntax: `function SearchBox() {
  const inputRef = useRef(null);
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}`,
      tip: 'Do not read or write ref.current during rendering (in the component body). Use refs in event handlers and effects, because during render the DOM may not exist yet.',
    },
    {
      heading: 'Use case 2: mutable values that survive re-renders',
      content: 'Refs are perfect for values that must persist but do not affect what is displayed:',
      points: [
        '**Timer / interval IDs** so you can clear them later from another handler',
        '**Previous value** of a prop or state',
        '**Flags** such as "is this the first render?" or "is a request in progress?"',
        '**Latest callback or value** for use inside a long-lived interval or listener (avoids stale closures)',
        '**Instances** of non-React objects (a chart, a WebSocket, an AbortController)',
      ],
      syntax: `const intervalRef = useRef(null);

function start() {
  intervalRef.current = setInterval(tick, 1000);
}
function stop() {
  clearInterval(intervalRef.current);
}`,
    },
    {
      heading: 'useRef vs useState vs normal variable',
      content: '',
      points: [
        '**useState**: persists across renders; changing it **re-renders**; use for anything shown in the UI',
        '**useRef**: persists across renders; changing it does **not** re-render; use for values not shown in the UI and for DOM nodes',
        '**let variable** inside the component: **reset on every render**; useless for remembering things',
        '**Variable outside the component**: shared by ALL instances of the component; usually a bug',
      ],
      tip: 'If you display ref.current in JSX, the screen will NOT update when it changes. If it must be shown, it should be state.',
    },
    {
      heading: 'Passing refs to child components',
      content:
        'By default a ref placed on your own component (`<MyInput ref={r} />`) does not reach the inner DOM node.\n\n- **React 18**: wrap the child in `forwardRef`, which gives it a second argument `ref` to attach to an inner element.\n- **React 19**: function components can simply accept `ref` as a regular prop; forwardRef is no longer needed (but still works).\n\nAdvanced: `useImperativeHandle` lets a child expose only specific methods (like `focus` and `clear`) instead of the whole DOM node.',
      syntax: `// React 18
const MyInput = React.forwardRef(function MyInput(props, ref) {
  return <input ref={ref} {...props} />;
});

// React 19
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// Parent
const r = useRef(null);
<MyInput ref={r} />; r.current.focus();`,
    },
    {
      heading: 'Callback refs and refs in lists',
      content:
        'Instead of a ref object you can pass a **function** to `ref`. React calls it with the DOM node on mount and with `null` on unmount. This is useful when you need refs for a dynamic list of items: store nodes in a Map held by a ref.',
      syntax: `const itemsRef = useRef(new Map());

{items.map(item => (
  <li key={item.id} ref={node => {
    if (node) itemsRef.current.set(item.id, node);
    else itemsRef.current.delete(item.id);
  }}>{item.name}</li>
))}

// later
itemsRef.current.get(id).scrollIntoView({ behavior: "smooth" });`,
      tip: 'Refs are an escape hatch. If you can do it with props and state, prefer that. Coming next (Day 16): useContext to share data without prop drilling.',
    },
  ],
  examples: [
    {
      title: 'Auto-focus and focus on button click',
      scenario: 'A login form focuses the email input when it appears, and a button jumps focus to the password field.',
      steps: [
        'Create emailRef and passwordRef with useRef(null)',
        'Attach them with the ref attribute',
        'Focus email in a mount effect; focus password in a click handler',
      ],
      code: `function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  return (
    <>
      <input ref={emailRef} placeholder="Email" />
      <input ref={passwordRef} type="password" placeholder="Password" />
      <button onClick={() => passwordRef.current.focus()}>Go to password</button>
    </>
  );
}`,
      playground: {
        jsx: `const { useRef, useEffect } = React;

function App() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    emailRef.current.focus(); // DOM node is available after mount
  }, []);

  function handleEmailKey(e) {
    if (e.key === "Enter") passwordRef.current.focus();
  }

  return (
    <div className="form">
      <input ref={emailRef} placeholder="Email (press Enter to jump)" onKeyDown={handleEmailKey} />
      <input ref={passwordRef} type="password" placeholder="Password" />
      <div>
        <button onClick={() => emailRef.current.focus()}>Focus email</button>
        <button onClick={() => passwordRef.current.focus()}>Focus password</button>
        <button onClick={() => { emailRef.current.select(); }}>Select email text</button>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.form { display: flex; flex-direction: column; gap: 8px; max-width: 320px; }
input { padding: 8px; }
input:focus { outline: 3px solid #a5b4fc; }
button { margin-right: 6px; margin-top: 4px; }`,
      },
      result: 'The email input is focused on load; Enter moves to the password; the buttons focus or select the inputs.',
      explanation:
        'ref={emailRef} makes React set emailRef.current to the <input> DOM node after mounting. focus() and select() are native DOM methods.',
    },
    {
      title: 'Storing an interval ID in a ref (stopwatch with lap times)',
      scenario: 'Start/Stop buttons in different handlers need the same interval ID. Storing it in state would cause needless re-renders; a local variable would be lost.',
      steps: [
        'Create intervalRef = useRef(null)',
        'In start(), save the ID: intervalRef.current = setInterval(...)',
        'In stop(), clear it using intervalRef.current',
        'Clear it on unmount in an effect cleanup',
      ],
      code: `const intervalRef = useRef(null);

function start() {
  if (intervalRef.current) return;          // already running
  intervalRef.current = setInterval(() => setMs(m => m + 100), 100);
}
function stop() {
  clearInterval(intervalRef.current);
  intervalRef.current = null;
}
useEffect(() => () => clearInterval(intervalRef.current), []);`,
      playground: {
        jsx: `const { useState, useRef, useEffect } = React;

function App() {
  const [ms, setMs] = useState(0);
  const [laps, setLaps] = useState([]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  function start() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setMs(m => m + 100), 100);
    setRunning(true);
  }
  function stop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }
  function reset() {
    stop();
    setMs(0);
    setLaps([]);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const fmt = t => (t / 1000).toFixed(1) + "s";
  return (
    <div>
      <h1 className="time">{fmt(ms)}</h1>
      {running ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
      <button disabled={!running} onClick={() => setLaps(l => [ms, ...l])}>Lap</button>
      <button onClick={reset}>Reset</button>
      <ol reversed>{laps.map((l, i) => <li key={laps.length - i}>{fmt(l)}</li>)}</ol>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.time { font-family: monospace; font-size: 2.6rem; margin: 6px 0 10px; }
button { margin-right: 6px; padding: 6px 14px; }`,
      },
      result: 'Start runs the clock, Lap records times, Stop pauses, Reset clears. No duplicate intervals even if Start is clicked twice.',
      explanation:
        'The interval ID is not shown on screen, so it belongs in a ref. Both start and stop read the same intervalRef.current. The guard if (intervalRef.current) return prevents starting two intervals.',
    },
    {
      title: 'Previous value and render counter (ref vs state)',
      scenario: 'Show the previous value of a counter and how many times the component rendered, without causing extra renders.',
      steps: [
        'Store previous count in prevRef and update it in an effect after each render',
        'Increment renderCount.current in an effect (no re-render)',
        'Compare with a state-based counter that would loop forever',
      ],
      code: `const prevRef = useRef();
useEffect(() => {
  prevRef.current = count;   // runs after render, so during render it still holds the old value
}, [count]);

const renders = useRef(0);
useEffect(() => { renders.current += 1; });
// ❌ with state: useEffect(() => setRenders(r => r + 1)) → infinite loop`,
      playground: {
        jsx: `const { useState, useRef, useEffect } = React;

function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const prevCount = useRef(null);
  const renders = useRef(0);
  const [, forceShow] = useState(0);

  useEffect(() => {
    renders.current += 1; // changing a ref does not re-render
  });

  useEffect(() => {
    prevCount.current = count;
  }, [count]);

  return (
    <div>
      <p>Current: <b>{count}</b> · Previous: <b>{prevCount.current === null ? "-" : prevCount.current}</b></p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c + 5)}>+5</button>
      <p><input value={text} placeholder="Typing also re-renders" onChange={e => setText(e.target.value)} /></p>
      <p className="muted">Render count stored in a ref: {renders.current} (updates on the next render)</p>
      <button onClick={() => forceShow(n => n + 1)}>Re-render to refresh the count</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
button { margin-right: 6px; }
input { padding: 6px; width: 240px; }
.muted { color: #6b7280; }`,
      },
      result: 'Clicking +5 after +1 shows Current: 6, Previous: 1. The render count grows with every render but only appears updated on the following render.',
      explanation:
        'During render, prevCount.current still holds the value set after the previous render, so it shows the old count. The render counter lives in a ref, so incrementing it does not trigger another render (with state it would loop infinitely). This also demonstrates that displaying refs does not update the UI by itself.',
    },
    {
      title: 'Scrolling, measuring and forwarding refs to a child',
      scenario: 'A chat window auto-scrolls to the newest message, a box reports its size, and a custom TextInput component exposes its inner input to the parent via forwardRef.',
      steps: [
        'Attach a ref to the end of the message list and call scrollIntoView in an effect when messages change',
        'Measure a box with getBoundingClientRect in a click handler',
        'Wrap TextInput in React.forwardRef and pass the ref to the inner <input>',
      ],
      code: `const TextInput = React.forwardRef(function TextInput({ label, ...rest }, ref) {
  return <label>{label} <input ref={ref} {...rest} /></label>;
});

function Chat() {
  const endRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  ...
  <TextInput ref={inputRef} label="Message" />
}`,
      playground: {
        jsx: `const { useState, useRef, useEffect } = React;

// React 18 style; in React 19 you can accept { ref } as a normal prop instead
const TextInput = React.forwardRef(function TextInput({ label, ...rest }, ref) {
  return (
    <label className="ti">
      {label}
      <input ref={ref} {...rest} />
    </label>
  );
});

function App() {
  const [messages, setMessages] = useState(["Hi! 👋", "How is React going?"]);
  const [text, setText] = useState("");
  const [size, setSize] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return inputRef.current.focus();
    setMessages(m => [...m, text.trim()]);
    setText("");
    inputRef.current.focus();
  }

  function measure() {
    const r = boxRef.current.getBoundingClientRect();
    setSize(Math.round(r.width) + " × " + Math.round(r.height) + " px");
  }

  return (
    <div>
      <div className="chat" ref={boxRef}>
        {messages.map((m, i) => <p key={i} className="msg">{m}</p>)}
        <div ref={endRef} />
      </div>
      <form onSubmit={send}>
        <TextInput ref={inputRef} label="Message" value={text} onChange={e => setText(e.target.value)} />
        <button>Send</button>
      </form>
      <button onClick={measure}>Measure chat box</button> {size && <span>{size}</span>}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.chat { height: 140px; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px; width: 300px; margin-bottom: 8px; background: #f8fafc; }
.msg { background: #dbeafe; display: inline-block; padding: 6px 10px; border-radius: 12px; margin: 3px 0; clear: both; float: left; }
.chat > div { clear: both; }
.ti input { margin-left: 6px; padding: 6px; }
button { margin: 6px 6px 0 0; }`,
      },
      result: 'Sending several messages auto-scrolls the chat to the newest one; focus returns to the input; "Measure" shows the box size in pixels.',
      explanation:
        'endRef points to an empty div after the last message; scrollIntoView brings it into view whenever messages change. getBoundingClientRect reads layout from the real DOM node. forwardRef lets the parent\'s inputRef reach the <input> inside TextInput.',
    },
  ],
  interview: [
    { q: 'What does useRef return?', a: 'A mutable object { current: initialValue } that persists for the full lifetime of the component. The same object is returned on every render.', level: 'Easy' },
    { q: 'What is the difference between useRef and useState?', a: 'Both persist across renders, but updating state triggers a re-render while changing ref.current does not. Use state for data shown in the UI, refs for DOM nodes and values that do not affect rendering.', level: 'Easy' },
    { q: 'How do you focus an input in React?', a: 'Create a ref with useRef(null), attach it with ref={inputRef}, then call inputRef.current.focus() in an event handler or effect.', level: 'Easy' },
    { q: 'When is ref.current set for DOM refs?', a: 'React sets it after the DOM node is created during the commit phase, before effects run. It is null during the first render and set back to null when the element unmounts.', level: 'Medium' },
    { q: 'Why shouldn\'t you read or write refs during render?', a: 'Rendering must be pure and predictable. ref.current may not be set yet, and mutations during render are not tracked by React, which can cause inconsistent UI, especially with concurrent rendering. Use refs in handlers and effects.', level: 'Hard' },
    { q: 'What is forwardRef?', a: 'A React API that lets a component receive a ref from its parent and attach it to a child DOM node or component. In React 19, ref can be accepted as a normal prop on function components, making forwardRef unnecessary.', level: 'Medium' },
    { q: 'What is useImperativeHandle?', a: 'A hook used with ref forwarding to customise the value exposed to the parent ref, e.g. exposing only { focus, clear } instead of the whole DOM node.', level: 'Hard' },
    { q: 'How would you store a timer ID so start/stop handlers can access it?', a: 'In a ref: intervalRef.current = setInterval(...); clearInterval(intervalRef.current). It persists between renders and changing it does not cause a re-render.', level: 'Medium' },
    { q: 'How do you get the previous value of a prop or state?', a: 'Store it in a ref inside an effect after each render (prevRef.current = value). During the next render, prevRef.current still holds the old value.', level: 'Medium' },
    { q: 'What is a callback ref?', a: 'A function passed to the ref attribute. React calls it with the DOM node when it mounts and with null when it unmounts. Useful for dynamic lists or running logic when a node attaches.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a video player with custom Play, Pause and +10s buttons controlling a <video> element through a ref.',
      hint: 'videoRef.current.play(), .pause(), .currentTime += 10',
      solution: `function App() {
  const videoRef = React.useRef(null);
  return (
    <div>
      <video ref={videoRef} width="320" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
      <div>
        <button onClick={() => videoRef.current.play()}>Play</button>
        <button onClick={() => videoRef.current.pause()}>Pause</button>
        <button onClick={() => { videoRef.current.currentTime += 10; }}>+10s</button>
      </div>
    </div>
  );
}`,
    },
    {
      task: 'Build a "Scroll to section" page: three tall sections and three buttons that smoothly scroll to each.',
      hint: 'One ref per section, scrollIntoView({ behavior: "smooth" }).',
      solution: `function App() {
  const refs = { About: React.useRef(null), Projects: React.useRef(null), Contact: React.useRef(null) };
  return (
    <div>
      <nav style={{ position: "sticky", top: 0, background: "#fff", padding: 6 }}>
        {Object.keys(refs).map(name => (
          <button key={name} onClick={() => refs[name].current.scrollIntoView({ behavior: "smooth" })}>{name}</button>
        ))}
      </nav>
      {Object.keys(refs).map(name => (
        <section key={name} ref={refs[name]} style={{ height: 300, borderBottom: "1px solid #ccc" }}>
          <h2>{name}</h2>
        </section>
      ))}
    </div>
  );
}`,
    },
    {
      task: 'Count how many times a button was clicked using a ref, and only show the total when a "Show total" button is pressed.',
      hint: 'clicksRef.current++ in one handler; setShown(clicksRef.current) in the other.',
      solution: `function App() {
  const clicksRef = React.useRef(0);
  const [shown, setShown] = React.useState(null);
  return (
    <div>
      <button onClick={() => { clicksRef.current++; }}>Click me (silent)</button>
      <button onClick={() => setShown(clicksRef.current)}>Show total</button>
      {shown !== null && <p>Clicked {shown} times</p>}
    </div>
  );
}`,
    },
    {
      task: 'Create a reusable FancyInput with forwardRef, and a parent that clears and focuses it with a "Reset" button.',
      hint: 'inputRef.current.value = ""; inputRef.current.focus();  (uncontrolled input)',
      solution: `const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} {...props} style={{ padding: 8, border: "2px solid #6366f1", borderRadius: 8 }} />;
});

function App() {
  const inputRef = React.useRef(null);
  return (
    <div>
      <FancyInput ref={inputRef} placeholder="Type something" />
      <button onClick={() => { inputRef.current.value = ""; inputRef.current.focus(); }}>Reset</button>
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Changing ref.current...', options: ['Triggers a re-render', 'Does not trigger a re-render', 'Throws an error', 'Resets the component'], answer: 1, explanation: 'Refs are mutable boxes; React is not notified of changes.' },
    { question: 'What is inputRef.current before the component mounts?', options: ['undefined always', 'The input element', 'null (the initial value passed)', 'An empty string'], answer: 2, explanation: 'It holds the initial value (null) until React attaches the DOM node.' },
    { question: 'Which is the best place to store a setInterval ID used by Start and Stop handlers?', options: ['useRef', 'A let variable in the component body', 'useState', 'A CSS variable'], answer: 0, explanation: 'Refs persist across renders without causing re-renders.' },
    { question: 'Which API lets a parent ref reach a DOM node inside a child component in React 18?', options: ['useContext', 'React.memo', 'createPortal', 'React.forwardRef'], answer: 3, explanation: 'forwardRef passes the ref through to an inner element.' },
    { question: 'You display {countRef.current} in JSX and update it on click. What happens?', options: ['The number updates instantly', 'The screen does not update until something else re-renders', 'React throws an error', 'The page reloads'], answer: 1, explanation: 'Refs do not trigger renders, so the UI shows a stale value.' },
  ],
};
