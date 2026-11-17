export default {
  id: 'day-09-forms-controlled-components',
  title: 'Forms and Controlled Components',
  module: 'Module 2: State & Events',
  day: 9,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn how to build forms in React the "controlled" way, where React state is the single source of truth for every input. Handle text, textarea, select, checkbox and radio inputs, manage many fields with one handler, validate, and compare with uncontrolled inputs.',
  objectives: [
    'Build controlled inputs using value + onChange',
    'Handle textarea, select, checkbox, radio and multiple fields with a single handler',
    'Submit a form with onSubmit and preventDefault',
    'Add simple validation and error messages',
    'Explain controlled vs uncontrolled components',
  ],
  theory: [
    {
      heading: 'What is a controlled component?',
      content:
        'In plain HTML, an input keeps its own value inside the DOM. In React, a **controlled component** is an input whose value is driven by **React state**:\n\n1. `value={state}` tells the input what to show\n2. `onChange` updates the state on every keystroke\n3. React re-renders the input with the new value\n\nState becomes the **single source of truth**. Analogy: a puppet on strings. The input (puppet) only moves when React (puppeteer) pulls the strings.',
      syntax: `function NameForm() {
  const [name, setName] = useState("");
  return <input value={name} onChange={e => setName(e.target.value)} />;
}`,
      tip: 'If you set value without onChange, the input becomes read-only and React warns you. Use defaultValue for an uncontrolled input, or add onChange (or readOnly) for a controlled one.',
    },
    {
      heading: 'Different input types',
      content: 'Each input type uses a slightly different prop:',
      points: [
        '**text, email, password, number, textarea**: `value` and `e.target.value`',
        '**select**: `value` on the `<select>` (not `selected` on option): `<select value={city} onChange={...}>`',
        '**checkbox**: `checked` and `e.target.checked` (boolean)',
        '**radio**: `checked={gender === "female"}` and `value="female"`; the change sets state to `e.target.value`',
        '**number**: `e.target.value` is still a **string**. Convert with `Number()` when needed',
        '**textarea**: in React it uses `value`, not children text',
        '**file**: always uncontrolled (read with a ref or `e.target.files`)',
      ],
    },
    {
      heading: 'One state object, one change handler',
      content:
        'Forms with many fields become repetitive with one useState per field. Store all fields in **one object** and use the input\'s **name** attribute with a **computed property name** to update the correct field.',
      syntax: `const [form, setForm] = useState({ name: "", email: "", agree: false });

function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
}

<input name="email" value={form.email} onChange={handleChange} />
<input name="agree" type="checkbox" checked={form.agree} onChange={handleChange} />`,
    },
    {
      heading: 'Submitting and validating',
      content:
        'Handle submission on the `<form>` with `onSubmit` (works with Enter key and button), and call `e.preventDefault()`.\n\nValidation strategies:\n\n- **HTML attributes**: required, minLength, pattern, type="email" (quick, built-in)\n- **On submit**: validate all fields, store errors in state, show messages\n- **On change / on blur**: live feedback; use a "touched" state so you do not show errors before the user types\n\nDisable the submit button while the form is invalid or submitting.',
      syntax: `function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errors.email = "Invalid email";
  return errors;
}`,
      tip: 'For large forms, libraries like React Hook Form reduce boilerplate (Day 24). Learn the controlled pattern first: interviews always ask about it.',
    },
    {
      heading: 'Uncontrolled components',
      content:
        'An **uncontrolled** input keeps its value in the DOM. You give an initial `defaultValue` (or `defaultChecked`) and read the value only when needed, using a **ref** (Day 15) or the `FormData` API on submit.\n\n- Controlled: instant validation, conditional UI, formatting as you type, easy reset. More re-renders and code.\n- Uncontrolled: less code, good for simple forms and file inputs, integration with non-React code.',
      syntax: `function Quick() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    console.log(data); // { city: "Pune" }
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="city" defaultValue="Pune" />
      <button>Save</button>
    </form>
  );
}`,
      tip: 'Do not switch an input between controlled and uncontrolled: value={undefined} at first and a string later triggers a warning. Initialise text state with "" not undefined.',
    },
  ],
  examples: [
    {
      title: 'Basic controlled input with live preview',
      scenario: 'Type a username; the preview updates live, the text is forced to lowercase, and spaces are not allowed.',
      steps: [
        'Create username state initialised to ""',
        'Bind value and onChange; transform the text before saving it',
        'Type "Hello World" and see "helloworld"',
      ],
      code: `const [username, setUsername] = useState("");

<input
  value={username}
  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\\s/g, ""))}
/>
<p>Your profile URL: site.com/{username || "..."}</p>`,
      playground: {
        jsx: `function App() {
  const [username, setUsername] = React.useState("");
  return (
    <div>
      <label htmlFor="u">Choose a username</label><br />
      <input id="u" value={username} maxLength={15}
        onChange={e => setUsername(e.target.value.toLowerCase().replace(/\\s/g, ""))} />
      <p>Profile URL: <code>site.com/{username || "..."}</code></p>
      <p>{username.length}/15 characters</p>
      <button onClick={() => setUsername("")}>Clear</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
input { padding: 8px; width: 220px; margin-top: 4px; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }`,
      },
      result: 'Uppercase letters become lowercase and spaces are removed as you type; Clear empties the input.',
      explanation:
        'Because state controls the value, we can transform input before storing it. Clearing state clears the input: impossible to do this simply with an uncontrolled input.',
    },
    {
      title: 'Registration form with all input types and one handler',
      scenario: 'A course registration form with text, email, select, radio, checkbox and textarea, all managed by one state object.',
      steps: [
        'Create one form state object with a key per field',
        'Give each input a name matching its key',
        'Write one handleChange that handles checkboxes specially',
        'Submit and view the collected data',
      ],
      code: `const [form, setForm] = useState({
  name: "", email: "", course: "react", mode: "online", newsletter: true, notes: "",
});

function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
}`,
      playground: {
        jsx: `const initial = { name: "", email: "", course: "react", mode: "online", newsletter: true, notes: "" };

function App() {
  const [form, setForm] = React.useState(initial);
  const [submitted, setSubmitted] = React.useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(form);
    setForm(initial);
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <select name="course" value={form.course} onChange={handleChange}>
        <option value="html">HTML</option>
        <option value="react">React</option>
        <option value="node">Node.js</option>
      </select>
      <div>
        Mode:
        {["online", "offline"].map(m => (
          <label key={m}>
            <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={handleChange} /> {m}
          </label>
        ))}
      </div>
      <label>
        <input type="checkbox" name="newsletter" checked={form.newsletter} onChange={handleChange} /> Send me updates
      </label>
      <textarea name="notes" rows={3} placeholder="Anything else?" value={form.notes} onChange={handleChange} />
      <button type="submit">Register</button>
      {submitted && <pre>{JSON.stringify(submitted, null, 2)}</pre>}
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.form { display: flex; flex-direction: column; gap: 8px; max-width: 320px; }
input[type=text], input:not([type]), input[type=email], select, textarea { padding: 8px; }
label { margin-right: 10px; }
pre { background: #f1f5f9; padding: 10px; border-radius: 8px; }`,
      },
      result: 'Filling the form and clicking Register shows the collected JSON and resets the form to its initial values.',
      explanation:
        '[name]: value uses the input\'s name attribute as the key. Checkboxes use checked, radios compare state to their value, select uses value on the select element.',
    },
    {
      title: 'Validation with error messages and touched fields',
      scenario: 'A login form shows errors only after the user leaves a field (blur) or tries to submit, and disables the button while invalid.',
      steps: [
        'Write a validate(values) function returning an errors object',
        'Track touched fields with onBlur',
        'Show an error only if the field is touched and invalid',
        'Disable Submit while there are errors',
      ],
      code: `function validate(v) {
  const e = {};
  if (!/^\\S+@\\S+\\.\\S+$/.test(v.email)) e.email = "Enter a valid email";
  if (v.password.length < 6) e.password = "Min 6 characters";
  return e;
}

const errors = validate(values);           // derived on every render
const isValid = Object.keys(errors).length === 0;`,
      playground: {
        jsx: `function validate(v) {
  const e = {};
  if (!v.email) e.email = "Email is required";
  else if (!/^\\S+@\\S+\\.\\S+$/.test(v.email)) e.email = "Enter a valid email";
  if (v.password.length < 6) e.password = "Password must be at least 6 characters";
  return e;
}

function App() {
  const [values, setValues] = React.useState({ email: "", password: "" });
  const [touched, setTouched] = React.useState({});
  const [status, setStatus] = React.useState("");

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = e => setValues({ ...values, [e.target.name]: e.target.value });
  const handleBlur = e => setTouched({ ...touched, [e.target.name]: true });

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (isValid) setStatus("Logged in as " + values.email);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <input name="email" placeholder="Email" value={values.email}
        onChange={handleChange} onBlur={handleBlur}
        className={touched.email && errors.email ? "bad" : ""} />
      {touched.email && errors.email && <small>{errors.email}</small>}

      <input name="password" type="password" placeholder="Password" value={values.password}
        onChange={handleChange} onBlur={handleBlur}
        className={touched.password && errors.password ? "bad" : ""} />
      {touched.password && errors.password && <small>{errors.password}</small>}

      <button disabled={!isValid}>Log in</button>
      {status && <p className="ok">{status}</p>}
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.form { display: flex; flex-direction: column; gap: 6px; max-width: 280px; }
input { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
input.bad { border-color: #dc2626; background: #fef2f2; }
small { color: #dc2626; }
button:disabled { opacity: .5; cursor: not-allowed; }
.ok { color: #16a34a; }`,
      },
      result: 'Errors appear after leaving a field empty or invalid; the Log in button stays disabled until both fields are valid.',
      explanation:
        'errors is derived from values each render, so it is always current. touched prevents scary red errors before the user has interacted. noValidate disables the browser\'s own popups so our messages are used.',
    },
    {
      title: 'Controlled vs uncontrolled side by side',
      scenario: 'Compare a controlled input (state on every keystroke) with an uncontrolled one (read with FormData on submit).',
      steps: [
        'Build a controlled input that shows a live character count',
        'Build an uncontrolled form with defaultValue and FormData',
        'Type in both and submit the uncontrolled one',
      ],
      code: `// Controlled
<input value={city} onChange={e => setCity(e.target.value)} />

// Uncontrolled
<form onSubmit={e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
}}>
  <input name="city" defaultValue="Pune" />
</form>`,
      playground: {
        jsx: `function Controlled() {
  const [city, setCity] = React.useState("Delhi");
  return (
    <div className="box">
      <h4>Controlled</h4>
      <input value={city} onChange={e => setCity(e.target.value)} />
      <p>Live value: {city} ({city.length} chars)</p>
      <button onClick={() => setCity("")}>Reset from state</button>
    </div>
  );
}

function Uncontrolled() {
  const [saved, setSaved] = React.useState(null);
  function handleSubmit(e) {
    e.preventDefault();
    setSaved(Object.fromEntries(new FormData(e.target)));
  }
  return (
    <form className="box" onSubmit={handleSubmit}>
      <h4>Uncontrolled</h4>
      <input name="city" defaultValue="Pune" />
      <p>React does not know the value until submit.</p>
      <button>Submit</button>
      {saved && <p>Submitted: {JSON.stringify(saved)}</p>}
    </form>
  );
}

function App() {
  return (
    <div className="row">
      <Controlled />
      <Uncontrolled />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.box { border: 1px solid #ddd; border-radius: 10px; padding: 12px; width: 240px; }
input { padding: 6px; width: 90%; }`,
      },
      result: 'The controlled box updates its text on every key press; the uncontrolled box only reports the value after Submit.',
      explanation:
        'Controlled inputs re-render on each keystroke and let you react instantly. Uncontrolled inputs leave the value in the DOM; FormData reads all named fields at submit time.',
    },
  ],
  interview: [
    { q: 'What is a controlled component?', a: 'A form element whose value is controlled by React state via the value (or checked) prop and updated through onChange. React state is the single source of truth.', level: 'Easy' },
    { q: 'What is an uncontrolled component?', a: 'A form element that keeps its own state in the DOM. You set an initial defaultValue and read the current value when needed using a ref or FormData.', level: 'Easy' },
    { q: 'When would you choose uncontrolled inputs?', a: 'For simple forms where you only need values on submit, file inputs (always uncontrolled), integrating with non-React libraries, or performance-sensitive large forms (as React Hook Form does).', level: 'Medium' },
    { q: 'How do you handle many inputs with a single handler?', a: 'Give each input a name attribute matching a key in a state object, then in handleChange use setForm(prev => ({ ...prev, [e.target.name]: e.target.value })).', level: 'Medium' },
    { q: 'How do you control a select element in React?', a: 'Set value on the <select> element and update it in onChange. For multiple select use multiple and value={arrayOfValues}.', level: 'Easy' },
    { q: 'How do checkbox and radio inputs differ from text inputs?', a: 'Checkboxes use the checked prop and e.target.checked (boolean). Radios use checked={state === value} and set state to e.target.value.', level: 'Easy' },
    { q: 'What causes the warning "A component is changing an uncontrolled input to be controlled"?', a: 'The value prop starts as undefined or null (uncontrolled) and later becomes a defined value. Initialise state with "" (or false for checkboxes).', level: 'Medium' },
    { q: 'What happens if you set value without onChange?', a: 'The input becomes read-only because React keeps resetting it to the state value; React warns you to add onChange, readOnly, or use defaultValue.', level: 'Medium' },
    { q: 'Why might e.target.value of a number input surprise you?', a: 'It is always a string. Convert with Number() or e.target.valueAsNumber before doing math.', level: 'Easy' },
    { q: 'How would you validate a form in React without a library?', a: 'Write a validate function that returns an errors object based on current values, derive errors each render (or on submit/blur), show messages conditionally, track touched fields, and block submission while errors exist.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a temperature converter: typing Celsius shows Fahrenheit live.',
      hint: 'F = C * 9 / 5 + 32. Convert the string with Number().',
      solution: `function App() {
  const [c, setC] = React.useState("");
  const f = c === "" ? "" : (Number(c) * 9 / 5 + 32).toFixed(1);
  return (
    <div>
      <input type="number" value={c} onChange={e => setC(e.target.value)} placeholder="Celsius" />
      <p>{f === "" ? "Enter a value" : c + "°C = " + f + "°F"}</p>
    </div>
  );
}`,
    },
    {
      task: 'Build a feedback form with name, rating (select 1-5) and comments, and display a thank-you card after submit.',
      hint: 'Keep a submitted flag in state and conditionally render.',
      solution: `function App() {
  const [form, setForm] = React.useState({ name: "", rating: "5", comments: "" });
  const [done, setDone] = React.useState(false);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  if (done) return <div><h3>Thank you, {form.name}!</h3><p>Rating: {form.rating}/5</p></div>;
  return (
    <form onSubmit={e => { e.preventDefault(); setDone(true); }}>
      <input name="name" value={form.name} onChange={change} placeholder="Name" required /><br />
      <select name="rating" value={form.rating} onChange={change}>
        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
      </select><br />
      <textarea name="comments" value={form.comments} onChange={change} /><br />
      <button>Send</button>
    </form>
  );
}`,
    },
    {
      task: 'Create a "terms" checkbox that must be ticked before the Sign up button is enabled.',
      hint: 'disabled={!agree}',
      solution: `function App() {
  const [agree, setAgree] = React.useState(false);
  return (
    <div>
      <label><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} /> I accept the terms</label><br />
      <button disabled={!agree}>Sign up</button>
    </div>
  );
}`,
    },
    {
      task: 'Build a password strength meter: weak (<6), medium (6-9), strong (10+ with a number and a symbol).',
      hint: 'Use regex tests /\\d/ and /[^A-Za-z0-9]/.',
      solution: `function strength(p) {
  if (p.length >= 10 && /\\d/.test(p) && /[^A-Za-z0-9]/.test(p)) return ["Strong", "green"];
  if (p.length >= 6) return ["Medium", "orange"];
  return ["Weak", "red"];
}

function App() {
  const [pw, setPw] = React.useState("");
  const [label, color] = strength(pw);
  return (
    <div>
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
      {pw && <p style={{ color }}>{label}</p>}
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which two props make a text input controlled?', options: ['value and onChange', 'defaultValue and onInput', 'name and id', 'ref and onSubmit'], answer: 0, explanation: 'value is driven by state and onChange updates the state.' },
    { question: 'How do you read a checkbox value in onChange?', options: ['e.target.value', 'e.checked', 'e.target.selected', 'e.target.checked'], answer: 3, explanation: 'Checkboxes expose a boolean checked property.' },
    { question: 'How is the selected option of a <select> set in React?', options: ['selected on the option', 'value on the select', 'checked on the option', 'index on the select'], answer: 1, explanation: 'React uses value on the <select> element.' },
    { question: 'What does [e.target.name]: e.target.value do inside an object literal?', options: ['Creates an array', 'Uses the input name as a dynamic key', 'Deletes the key', 'Throws an error'], answer: 1, explanation: 'Computed property names use an expression as the key.' },
    { question: 'Which input type is always uncontrolled in React?', options: ['text', 'checkbox', 'file', 'radio'], answer: 2, explanation: 'File input values can only be set by the user, so they are uncontrolled.' },
  ],
};
