export default {
  id: 'day-03-jsx',
  title: 'JSX: Rules, Expressions, Attributes (className) and Fragments',
  module: 'Module 1: React Fundamentals',
  day: 3,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'JSX is the HTML-like syntax used to describe React UI. Learn how it compiles to JavaScript, its rules, how to embed expressions with curly braces, how attributes differ from HTML, and how Fragments avoid extra wrapper divs.',
  objectives: [
    'Explain what JSX is and what it compiles to',
    'Apply the JSX rules: one root, close every tag, camelCase attributes',
    'Embed JavaScript expressions with { } and know what cannot go inside',
    'Use className, htmlFor, style objects and boolean attributes correctly',
    'Group elements with Fragments (<>...</>)',
  ],
  theory: [
    {
      heading: 'What is JSX?',
      content:
        '**JSX (JavaScript XML)** is a syntax extension that lets you write HTML-like markup inside JavaScript. Browsers do not understand JSX directly; a compiler (Babel or esbuild inside Vite) turns it into plain function calls.\n\nIn React 17+ the "automatic runtime" compiles `<h1 className="t">Hi</h1>` into something like `jsx("h1", { className: "t", children: "Hi" })`. The older form is `React.createElement("h1", { className: "t" }, "Hi")`. Both return a plain JavaScript object called a **React element** that describes what should appear on screen.\n\nAnalogy: JSX is like a recipe card. It does not cook the food itself; it describes the dish, and React does the cooking (DOM updates).',
      syntax: `// JSX
const el = <h1 className="title">Hello</h1>;

// What it becomes (classic form)
const el2 = React.createElement("h1", { className: "title" }, "Hello");`,
    },
    {
      heading: 'The rules of JSX',
      content: 'JSX looks like HTML but is stricter because it is really JavaScript.',
      points: [
        '1. **Return a single root element.** Wrap siblings in a div or a Fragment.',
        '2. **Close every tag.** Self-closing tags need a slash: `<img />`, `<br />`, `<input />`.',
        '3. **camelCase attributes.** `onclick` becomes `onClick`, `tabindex` becomes `tabIndex`.',
        '4. **className instead of class, htmlFor instead of for**, because class and for are JavaScript keywords.',
        '5. **Multi-line JSX goes in parentheses** after return, to avoid automatic semicolon insertion bugs.',
        '6. **Component names start with a capital letter** (`<Card />`); lowercase means an HTML tag (`<div>`).',
      ],
      tip: 'Common mistake: writing return on its own line followed by JSX on the next line without parentheses. JavaScript inserts a semicolon after return and the component returns undefined.',
    },
    {
      heading: 'Embedding expressions with { }',
      content:
        'Curly braces open a "window" from JSX back into JavaScript. Anything that is an **expression** (produces a value) can go inside: variables, math, function calls, ternaries, template strings, array.map.\n\n**Statements** cannot go inside: `if`, `for`, `while`, variable declarations. Do that logic before the return, or use a ternary / && instead.',
      syntax: `const user = { first: "Asha", last: "Rao" };
const items = 3;

<p>Name: {user.first + " " + user.last}</p>
<p>Total: {items * 250} rupees</p>
<p>Status: {items > 0 ? "In cart" : "Empty"}</p>
<p>Today: {new Date().toDateString()}</p>`,
      points: [
        'Strings and numbers render as text',
        '`true`, `false`, `null` and `undefined` render nothing',
        'Arrays of elements render each element (used with map)',
        'Plain objects CANNOT be rendered directly: "Objects are not valid as a React child"',
      ],
    },
    {
      heading: 'Attributes in JSX',
      content:
        'Attributes (called **props** for components) use either quotes for string values or braces for JavaScript values.\n\n- String: `<img alt="Logo" />`\n- Expression: `<img src={logoUrl} width={120} />`\n- **style** takes an object with camelCase CSS properties: `style={{ backgroundColor: "teal", fontSize: 18 }}` (the outer braces = JS expression, inner braces = object). Numbers are treated as px for most properties.\n- Boolean attributes: `<input disabled />` is the same as `disabled={true}`.\n- `data-*` and `aria-*` attributes keep their dash form: `aria-label="Close"`.',
      tip: 'Do not put quotes around braces: src="{url}" passes the literal text {url}.',
    },
    {
      heading: 'Fragments',
      content:
        'Because a component must return one root, beginners often wrap everything in a `<div>`. That adds useless DOM nodes and can break layouts (for example inside a `<table>` or a flex container).\n\nA **Fragment** groups children without adding any DOM element.\n\n- Short syntax: `<>...</>`\n- Long syntax: `<React.Fragment key={id}>...</React.Fragment>`: needed when you must pass a **key** (for example in a list).',
      syntax: `function Row() {
  return (
    <>
      <td>Apple</td>
      <td>₹120</td>
    </>
  );
}`,
    },
    {
      heading: 'Comments and whitespace in JSX',
      content:
        'Inside JSX, write comments inside braces: `{/* comment */}`. Line breaks and indentation between tags are removed; if you need a space between two inline elements on different lines, add `{" "}`.\n\nJSX also escapes values automatically, so `{userInput}` containing `<script>` is shown as text, which protects you from XSS attacks.',
      tip: 'Coming next (Day 4): splitting JSX into many components and importing/exporting them.',
    },
  ],
  examples: [
    {
      title: 'Embedding expressions in JSX',
      scenario: 'Show a product card where name, price with GST, and stock status are computed with JavaScript expressions.',
      steps: [
        'Create a product object above App',
        'Use { } to display properties and calculations',
        'Use a ternary for the stock message and click Run',
      ],
      code: `const product = { name: "Wireless Mouse", price: 799, stock: 0 };

function App() {
  const gst = 0.18;
  return (
    <div>
      <h2>{product.name.toUpperCase()}</h2>
      <p>Price incl. GST: ₹{(product.price * (1 + gst)).toFixed(2)}</p>
      <p>{product.stock > 0 ? "In stock" : "Out of stock"}</p>
    </div>
  );
}`,
      playground: {
        jsx: `const product = { name: "Wireless Mouse", price: 799, stock: 0 };

function App() {
  const gst = 0.18;
  return (
    <div className="card">
      {/* expressions inside curly braces */}
      <h2>{product.name.toUpperCase()}</h2>
      <p>Base price: ₹{product.price}</p>
      <p>Price incl. GST: ₹{(product.price * (1 + gst)).toFixed(2)}</p>
      <p className={product.stock > 0 ? "ok" : "no"}>
        {product.stock > 0 ? "In stock" : "Out of stock"}
      </p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.card { border: 1px solid #ddd; border-radius: 10px; padding: 16px; max-width: 280px; }
.ok { color: green; } .no { color: crimson; font-weight: bold; }`,
      },
      result: 'Card showing "WIRELESS MOUSE", base price 799, price incl. GST 942.82 and a red "Out of stock".',
      explanation:
        'Each { } holds an expression. toUpperCase(), the multiplication with toFixed(2), and the ternary all produce values. The ternary is also used inside className to switch CSS classes.',
    },
    {
      title: 'JSX attributes: className, htmlFor, style and booleans',
      scenario: 'Build a small sign-up field with a label, an input and an inline-styled warning, using the correct JSX attribute names.',
      steps: [
        'Use htmlFor on the label and the same id on the input',
        'Add className for CSS classes',
        'Use a style object for the warning text',
        'Use a boolean attribute (disabled) on the button',
      ],
      code: `function App() {
  const warn = { color: "#b45309", fontSize: 13, marginTop: 4 };
  return (
    <form className="form">
      <label htmlFor="email">Email</label>
      <input id="email" type="email" placeholder="you@mail.com" autoFocus />
      <p style={warn}>We never share your email.</p>
      <button type="submit" disabled>Sign up</button>
    </form>
  );
}`,
      playground: {
        jsx: `function App() {
  const warn = { color: "#b45309", fontSize: 13, marginTop: 4 };
  return (
    <form className="form" onSubmit={e => e.preventDefault()}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" placeholder="you@mail.com" tabIndex={1} />
      <p style={warn}>We never share your email.</p>
      <button type="submit" disabled aria-label="Sign up (disabled)">Sign up</button>
      <img src="https://picsum.photos/80" alt="Random" width={80} style={{ borderRadius: "50%", marginTop: 10 }} />
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.form { display: flex; flex-direction: column; max-width: 260px; gap: 4px; }
input { padding: 8px; }
button { padding: 8px; margin-top: 6px; }`,
      },
      result: 'A label, email input, small orange note, a disabled button and a round image.',
      explanation:
        'className and htmlFor replace class and for. style receives a JS object: keys are camelCase and numbers become px. disabled with no value means disabled={true}. tabIndex is camelCase while aria-label keeps its dash.',
    },
    {
      title: 'Fragments to avoid extra divs',
      scenario: 'A table row component returns two cells. Wrapping them in a div would produce invalid HTML, so use a Fragment.',
      steps: [
        'Create a Cells component that returns two td elements inside <>...</>',
        'Use it inside a tr in App',
        'Inspect the DOM: there is no extra wrapper',
      ],
      code: `function Cells({ item, price }) {
  return (
    <>
      <td>{item}</td>
      <td>₹{price}</td>
    </>
  );
}

function App() {
  return (
    <table>
      <tbody>
        <tr><Cells item="Tea" price={20} /></tr>
      </tbody>
    </table>
  );
}`,
      playground: {
        jsx: `function Cells({ item, price }) {
  return (
    <>
      <td>{item}</td>
      <td>₹{price}</td>
    </>
  );
}

const menu = [
  { id: 1, item: "Tea", price: 20 },
  { id: 2, item: "Coffee", price: 35 },
  { id: 3, item: "Samosa", price: 15 },
];

function App() {
  return (
    <>
      <h3>Canteen menu</h3>
      <table>
        <tbody>
          {menu.map(m => (
            <tr key={m.id}><Cells item={m.item} price={m.price} /></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
table { border-collapse: collapse; }
td { border: 1px solid #ccc; padding: 6px 14px; }`,
      },
      result: 'A valid table of three rows (Tea, Coffee, Samosa) with prices.',
      explanation:
        'A <div> inside <tr> is invalid HTML and React would warn. <>...</> groups the two <td> without adding a node, so the DOM is tr > td, td.',
    },
    {
      title: 'Common JSX errors and their fixes',
      scenario: 'Compare broken JSX with corrected JSX for the most frequent beginner errors.',
      steps: [
        'Read the "wrong" lines in the code block',
        'Run the corrected version in the playground',
        'Notice how null, false and arrays render',
      ],
      code: `// ❌ Two roots           → ✅ wrap in <>...</>
// return <h1>A</h1><p>B</p>;

// ❌ class="box"          → ✅ className="box"
// ❌ <img src="a.png">     → ✅ <img src="a.png" />
// ❌ {if (x) {...}}        → ✅ {x ? ... : ...}
// ❌ <p>{user}</p>  (object) → ✅ <p>{user.name}</p>
// ❌ style="color:red"    → ✅ style={{ color: "red" }}`,
      playground: {
        jsx: `function App() {
  const user = { name: "Kiran", isAdmin: false };
  const tags = ["react", "jsx", "fragments"];
  return (
    <>
      <h2 className="title">Hi {user.name}</h2>
      <img src="https://picsum.photos/60" alt="avatar" />
      <p style={{ color: "red" }}>{user.isAdmin ? "Admin" : "Regular user"}</p>
      <p>Renders nothing → [{null}{false}{undefined}]</p>
      <p>Array renders items: {tags.map(t => <span key={t} className="tag">#{t} </span>)}</p>
      <p>Number zero renders: {0}</p>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.tag { background: #e0f2fe; padding: 2px 6px; border-radius: 4px; margin-right: 4px; }`,
      },
      result: 'Greeting, avatar, red "Regular user", empty brackets "[]", hashtags and "0".',
      explanation:
        'null, false and undefined render nothing, but the number 0 DOES render. That is why {count && <List />} shows "0" when count is 0 (covered on Day 6).',
    },
  ],
  interview: [
    { q: 'What is JSX?', a: 'A syntax extension for JavaScript that looks like HTML. It is compiled (by Babel/esbuild) into React.createElement or jsx() calls that return React element objects.', level: 'Easy' },
    { q: 'Can browsers read JSX directly?', a: 'No. JSX must be transpiled to plain JavaScript by a tool such as Babel, esbuild or SWC before it runs in the browser.', level: 'Easy' },
    { q: 'Why use className instead of class?', a: 'JSX is JavaScript, and class is a reserved keyword (used for ES6 classes). React maps className to the DOM class attribute. Similarly htmlFor maps to for.', level: 'Easy' },
    { q: 'Why must a component return a single root element?', a: 'A component returns one value, and JSX compiles to one function call that returns one element object. Two siblings would be two values. Use a wrapper element or a Fragment.', level: 'Medium' },
    { q: 'What is a React Fragment and when would you use the long syntax?', a: 'A Fragment groups children without adding a DOM node. Use <React.Fragment key={...}> when you need to pass a key, e.g. when mapping a list that returns several elements per item.', level: 'Medium' },
    { q: 'Can you use if statements inside JSX?', a: 'Not directly, because JSX braces accept only expressions. Use a ternary, logical &&, or compute the value with if before the return statement.', level: 'Easy' },
    { q: 'How do you write inline styles in JSX?', a: 'Pass an object to style with camelCase property names: style={{ backgroundColor: "blue", fontSize: 16 }}. Numeric values get px for most properties.', level: 'Easy' },
    { q: 'How does JSX protect against XSS?', a: 'React escapes every value embedded with { } before rendering, so strings are inserted as text, not HTML. Only dangerouslySetInnerHTML bypasses this.', level: 'Medium' },
    { q: 'What does <Card /> compile to versus <card />?', a: 'Capitalized names refer to a variable/component (createElement(Card)); lowercase names are treated as built-in HTML tags (createElement("card")).', level: 'Medium' },
    { q: 'What is the difference between a React element and a component?', a: 'An element is a plain immutable object describing what to render (type, props). A component is a function (or class) that returns elements. JSX creates elements.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a profile card with name, age and a computed line "Born in YYYY" using the current year.',
      hint: 'new Date().getFullYear() - age',
      solution: `const person = { name: "Meera", age: 24 };

function App() {
  return (
    <div className="card">
      <h2>{person.name}</h2>
      <p>Age: {person.age}</p>
      <p>Born in {new Date().getFullYear() - person.age}</p>
    </div>
  );
}`,
    },
    {
      task: 'Convert this HTML to valid JSX: <div class="box" style="background:yellow;padding:10px"><label for="n">Name</label><input id="n"><br></div>',
      hint: 'className, style object, htmlFor, self-closing tags.',
      solution: `function App() {
  return (
    <div className="box" style={{ background: "yellow", padding: 10 }}>
      <label htmlFor="n">Name</label>
      <input id="n" />
      <br />
    </div>
  );
}`,
    },
    {
      task: 'Write a component that returns a dt and dd pair using a Fragment, and render three pairs inside a dl.',
      hint: 'Use React.Fragment with key when mapping.',
      solution: `const terms = [
  { t: "JSX", d: "HTML-like syntax for React" },
  { t: "Fragment", d: "Groups elements without a DOM node" },
  { t: "Element", d: "Object describing UI" },
];

function App() {
  return (
    <dl>
      {terms.map(x => (
        <React.Fragment key={x.t}>
          <dt><b>{x.t}</b></dt>
          <dd>{x.d}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}`,
    },
    {
      task: 'Show a greeting that says "Good morning", "Good afternoon" or "Good evening" based on the current hour, using logic before the return.',
      hint: 'Use if/else above the return and store the text in a variable.',
      solution: `function App() {
  const h = new Date().getHours();
  let greet;
  if (h < 12) greet = "Good morning";
  else if (h < 17) greet = "Good afternoon";
  else greet = "Good evening";
  return <h1>{greet}!</h1>;
}`,
    },
  ],
  quiz: [
    { question: 'Which attribute sets a CSS class in JSX?', options: ['class', 'cssClass', 'className', 'styleClass'], answer: 2, explanation: 'class is a JS keyword, so React uses className.' },
    { question: 'What does <>...</> represent?', options: ['A Fragment', 'An empty div', 'A comment', 'A syntax error'], answer: 0, explanation: 'It is the short syntax for React.Fragment.' },
    { question: 'Which can be placed inside { } in JSX?', options: ['A for loop', 'An if statement', 'A const declaration', 'A ternary expression'], answer: 3, explanation: 'Only expressions are allowed; ternaries are expressions.' },
    { question: 'What is the correct inline style?', options: ['style="color: red"', 'style={{ color: "red" }}', 'style={color: red}', 'css={{ color: "red" }}'], answer: 1, explanation: 'style takes a JS object, hence double braces.' },
    { question: 'Which value renders visible text in JSX?', options: ['0', 'false', 'null', 'undefined'], answer: 0, explanation: 'Numbers including 0 render; booleans, null and undefined render nothing.' },
  ],
};
