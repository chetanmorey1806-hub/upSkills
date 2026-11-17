export default {
  id: 'day-12-styling-in-react',
  title: 'Styling in React: CSS Files, CSS Modules, Inline Styles and Tailwind Overview',
  module: 'Module 2: State & Events',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Explore the main ways to style React components: global CSS files, scoped CSS Modules, inline style objects, conditional class names, and utility-first Tailwind CSS. Learn the pros, cons and when to use each.',
  objectives: [
    'Import plain CSS files and understand that they are global',
    'Use CSS Modules to scope class names to a component',
    'Write inline styles with style objects and know their limitations',
    'Apply conditional and dynamic class names cleanly',
    'Understand utility-first styling with Tailwind CSS and how it is set up in Vite',
  ],
  theory: [
    {
      heading: 'Plain CSS files',
      content:
        'The simplest approach: write a normal `.css` file and **import it** in a component. Vite injects it into the page.\n\nImportant: plain CSS is **global**. Importing `Button.css` inside Button.jsx does NOT limit those styles to Button. A `.title` class in one file can accidentally style a `.title` in another component.\n\nAnalogy: shouting in a hall. Everyone hears it, not just the person you meant.',
      syntax: `/* Button.css */
.btn { padding: 8px 16px; border-radius: 6px; }

// Button.jsx
import "./Button.css";
export default function Button({ children }) {
  return <button className="btn">{children}</button>;
}`,
      tip: 'Avoid clashes with a naming convention like BEM (.card__title--active) or prefix with the component name.',
    },
    {
      heading: 'CSS Modules: scoped class names',
      content:
        'Name the file `Something.module.css`. Vite (and most build tools) then **renames each class to a unique name** like `_btn_1x2ab_3`, and gives you an object mapping your names to the generated ones.\n\nResult: styles are **locally scoped** to the component that imports them. No clashes, still plain CSS.',
      syntax: `/* Card.module.css */
.card { border: 1px solid #ddd; }
.title { color: teal; }
.active { border-color: teal; }

// Card.jsx
import styles from "./Card.module.css";
export default function Card({ active }) {
  return (
    <div className={styles.card + " " + (active ? styles.active : "")}>
      <h3 className={styles.title}>Hello</h3>
    </div>
  );
}`,
      points: [
        'Class names with dashes: `styles["card-title"]` (or configure camelCase)',
        'Use `:global(.some-class)` to target a global class from a module',
        '`composes: base from "./base.module.css";` lets one class reuse another',
      ],
    },
    {
      heading: 'Inline styles',
      content:
        'Pass a JavaScript object to the `style` prop. Property names are **camelCase** (`backgroundColor`), values are strings or numbers (numbers become `px` for most properties).\n\nGood for **dynamic values** computed at runtime (a progress bar width, a user-picked color, positions). Limitations: no pseudo-classes (`:hover`), no media queries, no animations/keyframes, harder to override, and a new object every render.',
      syntax: `const percent = 72;
<div style={{ width: percent + "%", backgroundColor: percent > 50 ? "green" : "orange", height: 10 }} />

// CSS variables via style: great combo of dynamic + real CSS
<div className="bar" style={{ "--progress": percent + "%" }} />`,
      tip: 'Setting CSS custom properties through style and using them in a stylesheet gives you dynamic values while keeping :hover and media queries in CSS.',
    },
    {
      heading: 'Conditional class names',
      content:
        'Toggling classes based on state or props is extremely common. Options:\n\n- Template string or concatenation: `"tab " + (active ? "active" : "")`\n- Array join: `["btn", primary && "primary", size].filter(Boolean).join(" ")`\n- The tiny **clsx** (or classnames) library: `clsx("btn", { primary, disabled: isDisabled })`',
      syntax: `// npm install clsx
import clsx from "clsx";
<button className={clsx("btn", variant, { "btn-loading": loading, "btn-block": fullWidth })} />`,
    },
    {
      heading: 'Tailwind CSS overview',
      content:
        '**Tailwind CSS** is a **utility-first** framework: instead of writing custom CSS, you compose tiny single-purpose classes directly in JSX: `p-4` (padding), `bg-blue-600`, `rounded-lg`, `hover:bg-blue-700`, `md:flex` (responsive). The build step scans your files and generates only the classes you use.\n\nPros: very fast to build UIs, consistent design scale, no naming, no dead CSS, responsive and state variants built in. Cons: long class strings, learning the class names, markup looks busy (extract components to fix that).',
      syntax: `// Tailwind v4 with Vite
// npm install tailwindcss @tailwindcss/vite
// vite.config.js: plugins: [react(), tailwindcss()]
// src/index.css:  @import "tailwindcss";

<button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
  Save
</button>`,
    },
    {
      heading: 'Choosing an approach',
      content: 'All of these are valid; teams pick one main approach and stay consistent.',
      points: [
        '**Plain CSS**: small apps, global styles (resets, typography, CSS variables for themes)',
        '**CSS Modules**: component styles with real CSS and zero clashes; great default for Vite projects',
        '**Inline styles**: truly dynamic values only',
        '**Tailwind**: rapid development, design systems, very popular in startups and Next.js projects',
        '**CSS-in-JS** (styled-components, Emotion): styles written in JS with props; less common in new projects because of runtime cost and Server Component limitations',
        'Component libraries (MUI, Chakra, shadcn/ui) give pre-styled components',
      ],
      tip: 'Coming next (Day 13): useEffect, for running side effects such as timers, subscriptions and syncing with the outside world.',
    },
  ],
  examples: [
    {
      title: 'Global CSS and conditional classes: a tab bar',
      scenario: 'Style a tab bar with a global stylesheet and toggle an "active" class based on state.',
      steps: [
        'Write CSS for .tabs, .tab and .tab.active (in a project: Tabs.css imported into Tabs.jsx)',
        'Build className with a condition',
        'Click tabs to move the active style',
      ],
      code: `import "./Tabs.css";

function Tabs({ items, active, onChange }) {
  return (
    <div className="tabs">
      {items.map(t => (
        <button key={t} className={"tab" + (t === active ? " active" : "")} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}`,
      playground: {
        jsx: `// In a project Tabs.jsx would load Tabs.css; here the CSS panel plays that role.
function Tabs({ items, active, onChange }) {
  return (
    <div className="tabs">
      {items.map(t => (
        <button key={t} className={"tab" + (t === active ? " active" : "")} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [active, setActive] = React.useState("Overview");
  return (
    <div>
      <Tabs items={["Overview", "Reviews", "Specs"]} active={active} onChange={setActive} />
      <p className="panel">Showing: {active}</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.tabs { display: flex; border-bottom: 2px solid #e5e7eb; }
.tab { background: none; border: 0; padding: 10px 16px; cursor: pointer; color: #6b7280; border-bottom: 3px solid transparent; margin-bottom: -2px; }
.tab:hover { color: #111827; }
.tab.active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }
.panel { padding: 12px 4px; }`,
      },
      result: 'Three tabs; the clicked one is purple with an underline, others are grey and darken on hover.',
      explanation:
        'Hover styles live in CSS (impossible with inline styles). The "active" class is added via a simple conditional string.',
    },
    {
      title: 'CSS Modules: same class name, no clash',
      scenario: 'Two components both use a class called .title but should look different. CSS Modules generate unique names so they do not interfere.',
      steps: [
        'Create Alert.module.css and Card.module.css, both with .title',
        'Import styles and use className={styles.title}',
        'In the playground we simulate the generated unique names with objects',
      ],
      code: `/* Alert.module.css */
.title { color: #b91c1c; }

/* Card.module.css */
.title { color: #0f766e; }

// Alert.jsx
import styles from "./Alert.module.css";
export const Alert = () => <h3 className={styles.title}>Warning</h3>;

// Card.jsx
import styles from "./Card.module.css";
export const Card = () => <h3 className={styles.title}>Card heading</h3>;

// Rendered HTML:
// <h3 class="_title_k3j9a_1">Warning</h3>
// <h3 class="_title_p8x2c_1">Card heading</h3>`,
      playground: {
        jsx: `// Playground simulation: these objects mimic what
// the styles object you get from a CSS Module file (X.module.css).
const alertStyles = { box: "_box_k3j9a_1", title: "_title_k3j9a_2" };
const cardStyles = { box: "_box_p8x2c_1", title: "_title_p8x2c_2" };

function Alert() {
  return (
    <div className={alertStyles.box}>
      <h3 className={alertStyles.title}>⚠ Warning</h3>
      <p>class="{alertStyles.title}"</p>
    </div>
  );
}

function Card() {
  return (
    <div className={cardStyles.box}>
      <h3 className={cardStyles.title}>Card heading</h3>
      <p>class="{cardStyles.title}"</p>
    </div>
  );
}

function App() {
  return (
    <>
      <Alert />
      <Card />
      <p className="note">Both files used ".title", but the generated names are unique.</p>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
/* what Vite generates from Alert.module.css */
._box_k3j9a_1 { background: #fef2f2; border-left: 4px solid #dc2626; padding: 8px 12px; margin-bottom: 10px; }
._title_k3j9a_2 { color: #b91c1c; margin: 0; }
/* what Vite generates from Card.module.css */
._box_p8x2c_1 { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 8px 12px; }
._title_p8x2c_2 { color: #0f766e; margin: 0; }
p { font-family: monospace; font-size: 12px; color: #555; }
.note { font-family: system-ui; font-size: 14px; }`,
      },
      result: 'A red warning box and a teal card, each with a differently coloured title, plus the unique class names shown.',
      explanation:
        'CSS Modules transform .title into a hashed name per file. The import gives you a mapping object, so styles.title in each component refers to its own unique class.',
    },
    {
      title: 'Inline styles for dynamic values (and CSS variables)',
      scenario: 'A progress bar and a color preview whose width and color come from state.',
      steps: [
        'Store progress (0–100) and a hue in state',
        'Set width and background via the style prop',
        'Pass a CSS variable through style and use it in the stylesheet for hover',
      ],
      code: `<div className="track">
  <div className="fill" style={{ width: progress + "%", background: progress < 40 ? "#ef4444" : progress < 80 ? "#f59e0b" : "#22c55e" }} />
</div>

<div className="swatch" style={{ "--hue": hue }} />
/* CSS */ .swatch { background: hsl(var(--hue) 80% 55%); }
          .swatch:hover { background: hsl(var(--hue) 80% 40%); }`,
      playground: {
        jsx: `function App() {
  const [progress, setProgress] = React.useState(35);
  const [hue, setHue] = React.useState(200);
  const barColor = progress < 40 ? "#ef4444" : progress < 80 ? "#f59e0b" : "#22c55e";

  return (
    <div>
      <label>Progress: {progress}%
        <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} />
      </label>
      <div className="track">
        <div className="fill" style={{ width: progress + "%", backgroundColor: barColor }} />
      </div>

      <label>Hue: {hue}
        <input type="range" min="0" max="360" value={hue} onChange={e => setHue(Number(e.target.value))} />
      </label>
      <div className="swatch" style={{ "--hue": hue }}>Hover me</div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
label { display: block; margin-top: 12px; }
input[type=range] { width: 260px; display: block; }
.track { width: 280px; height: 14px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-top: 6px; }
.fill { height: 100%; transition: width .2s, background-color .2s; }
.swatch { margin-top: 8px; width: 140px; height: 70px; border-radius: 10px; display: grid; place-items: center; color: #fff;
  background: hsl(var(--hue) 80% 55%); transition: background .2s; }
.swatch:hover { background: hsl(var(--hue) 80% 35%); }`,
      },
      result: 'Dragging the sliders changes the bar width/colour and the swatch hue; the swatch darkens on hover.',
      explanation:
        'Inline styles are ideal for values that change continuously. Using a CSS variable via style keeps :hover and transitions in the stylesheet, which inline styles alone cannot do.',
    },
    {
      title: 'Tailwind-style utility classes',
      scenario: 'Build a profile card using utility classes. The playground defines a few Tailwind-like utilities by hand to show the idea; in a real project Tailwind generates them.',
      steps: [
        'In a project: npm install tailwindcss @tailwindcss/vite, add the plugin, add @import "tailwindcss" to index.css',
        'Compose utilities in className instead of writing custom CSS',
        'In the playground, a mini utility stylesheet stands in for Tailwind',
      ],
      code: `function ProfileCard({ name, role, online }) {
  return (
    <div className="max-w-xs rounded-xl shadow p-4 flex items-center gap-3 bg-white">
      <img className="w-14 h-14 rounded-full" src="https://picsum.photos/id/91/100" alt="" />
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
        <span className={online ? "text-green-600" : "text-gray-400"}>{online ? "● Online" : "○ Offline"}</span>
      </div>
      <button className="ml-auto px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Follow</button>
    </div>
  );
}`,
      playground: {
        jsx: `// Playground note: real Tailwind needs a build step. The CSS panel
// defines only the utility classes used here so you can see the idea.
function ProfileCard({ name, role, online }) {
  return (
    <div className="max-w-xs rounded-xl shadow p-4 flex items-center gap-3 bg-white mb-3">
      <img className="w-14 h-14 rounded-full" src="https://picsum.photos/id/91/100" alt="" />
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
        <span className={"text-sm " + (online ? "text-green-600" : "text-gray-400")}>{online ? "● Online" : "○ Offline"}</span>
      </div>
      <button className="ml-auto px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Follow</button>
    </div>
  );
}

function App() {
  return (
    <div className="p-4 bg-gray-100">
      <ProfileCard name="Rohan Das" role="React Developer" online />
      <ProfileCard name="Fatima Ali" role="UX Designer" online={false} />
    </div>
  );
}`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
p { margin: 0; }
.p-4 { padding: 1rem; } .px-3 { padding-left: .75rem; padding-right: .75rem; } .py-1 { padding-top: .25rem; padding-bottom: .25rem; }
.mb-3 { margin-bottom: .75rem; } .ml-auto { margin-left: auto; }
.max-w-xs { max-width: 20rem; } .w-14 { width: 3.5rem; } .h-14 { height: 3.5rem; }
.flex { display: flex; } .items-center { align-items: center; } .gap-3 { gap: .75rem; }
.rounded-xl { border-radius: .75rem; } .rounded-lg { border-radius: .5rem; } .rounded-full { border-radius: 9999px; }
.shadow { box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08); }
.bg-white { background: #fff; } .bg-gray-100 { background: #f3f4f6; } .bg-indigo-600 { background: #4f46e5; } .hover\\:bg-indigo-700:hover { background: #4338ca; }
.text-white { color: #fff; } .text-gray-900 { color: #111827; } .text-gray-500 { color: #6b7280; } .text-gray-400 { color: #9ca3af; } .text-green-600 { color: #16a34a; }
.text-sm { font-size: .875rem; } .font-semibold { font-weight: 600; }
button { border: 0; cursor: pointer; }`,
      },
      result: 'Two neat profile cards with avatar, name, role, online status and an indigo Follow button that darkens on hover.',
      explanation:
        'Each class does one thing (padding, colour, radius). You build the design by composing them in JSX. Tailwind generates exactly these classes (and variants like hover: and md:) from your source files.',
    },
  ],
  interview: [
    { q: 'What are the main ways to style React components?', a: 'Global CSS files, CSS Modules, inline style objects, CSS-in-JS libraries (styled-components, Emotion), utility-first frameworks like Tailwind, preprocessors like Sass, and component libraries like MUI.', level: 'Easy' },
    { q: 'Is CSS imported into a component scoped to that component?', a: 'No. A plain .css import is global; its rules apply to the whole page. Use CSS Modules, naming conventions or CSS-in-JS for scoping.', level: 'Medium' },
    { q: 'How do CSS Modules work?', a: 'Files named *.module.css are processed so each class name is transformed into a unique hashed name. Importing the file returns an object mapping original names to generated names, which you use in className.', level: 'Medium' },
    { q: 'What are the limitations of inline styles?', a: 'No pseudo-classes or pseudo-elements, no media queries, no keyframes, higher specificity making overrides hard, verbose for large styles and a new object each render. Best for dynamic values.', level: 'Medium' },
    { q: 'How do you write a CSS property like background-color inline in React?', a: 'Use camelCase in a JS object: style={{ backgroundColor: "red" }}. Vendor prefixes start with a capital letter except ms (WebkitTransition).', level: 'Easy' },
    { q: 'How do you apply classes conditionally?', a: 'Build the className string with a ternary or template string, an array filtered and joined, or the clsx/classnames utility: clsx("btn", { active: isActive }).', level: 'Easy' },
    { q: 'What is utility-first CSS (Tailwind)?', a: 'Styling by composing many small single-purpose classes (p-4, text-center, bg-blue-500) directly in markup. Tailwind generates only the classes used, includes responsive and state variants, and enforces a consistent design scale.', level: 'Medium' },
    { q: 'What are pros and cons of CSS-in-JS?', a: 'Pros: scoped styles, dynamic styling via props, co-location. Cons: runtime overhead, larger bundles, complications with server rendering and React Server Components.', level: 'Hard' },
    { q: 'How can you combine dynamic values with :hover styles?', a: 'Set a CSS custom property via the style prop (style={{ "--color": c }}) and use var(--color) in a stylesheet rule that includes :hover or media queries.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Badge component whose background colour comes from a color prop (inline style) and whose padding/rounding come from a CSS class.',
      hint: 'className="badge" style={{ background: color }}',
      solution: `function Badge({ color = "#64748b", children }) {
  return (
    <span className="badge" style={{ background: color, color: "#fff", padding: "2px 10px", borderRadius: 999, marginRight: 6 }}>
      {children}
    </span>
  );
}

function App() {
  return (
    <p>
      <Badge color="#16a34a">Paid</Badge>
      <Badge color="#f59e0b">Pending</Badge>
      <Badge>Draft</Badge>
    </p>
  );
}`,
    },
    {
      task: 'Write a CSS Module Button.module.css with .button, .primary and .large, and a Button component that combines them based on props.',
      hint: 'className={[styles.button, primary && styles.primary, large && styles.large].filter(Boolean).join(" ")}',
      solution: `/* Button.module.css */
.button { padding: 8px 14px; border-radius: 6px; border: 1px solid #ccc; }
.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.large { font-size: 1.2rem; padding: 12px 20px; }

// Button.jsx
import styles from "./Button.module.css";

export default function Button({ primary, large, children, ...rest }) {
  const cls = [styles.button, primary && styles.primary, large && styles.large].filter(Boolean).join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}`,
    },
    {
      task: 'Build a dark/light theme toggle by switching a class on a wrapper and defining CSS variables for each theme.',
      hint: '.light { --bg: #fff; --fg: #111 } .dark { --bg: #111; --fg: #eee }',
      solution: `function App() {
  const [dark, setDark] = React.useState(false);
  const vars = dark ? { "--bg": "#111827", "--fg": "#f9fafb" } : { "--bg": "#ffffff", "--fg": "#111827" };
  return (
    <div style={{ ...vars, background: "var(--bg)", color: "var(--fg)", padding: 20, minHeight: 120 }}>
      <h2>{dark ? "Dark" : "Light"} theme</h2>
      <button onClick={() => setDark(d => !d)}>Toggle theme</button>
    </div>
  );
}`,
    },
    {
      task: 'Convert this CSS-styled button to Tailwind classes: padding 8px 16px, blue background, white bold text, rounded, darker blue on hover.',
      hint: 'px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700',
      solution: `function SaveButton() {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
      Save
    </button>
  );
}

function App() {
  return <SaveButton />;
}`,
    },
  ],
  quiz: [
    { question: 'What file name enables CSS Modules in Vite?', options: ['styles.css', 'Button.module.css', 'Button.scoped.css', 'Button.local.css'], answer: 1, explanation: 'The .module.css suffix enables CSS Modules.' },
    { question: 'Which inline style is correct?', options: ['style={{ fontSize: 18 }}', 'style="font-size: 18px"', 'style={{ font-size: 18 }}', 'style={fontSize: 18}'], answer: 0, explanation: 'Use an object with camelCase keys.' },
    { question: 'Which is NOT possible with inline styles alone?', options: ['Setting colour', 'Setting width dynamically', ':hover styles', 'Setting margin'], answer: 2, explanation: 'Pseudo-classes need a stylesheet.' },
    { question: 'A plain CSS file imported into Header.jsx applies to...', options: ['Only Header', 'Only Header\'s children', 'Nothing until exported', 'The whole page (global)'], answer: 3, explanation: 'Plain CSS imports are global.' },
    { question: 'Tailwind CSS is best described as...', options: ['A CSS-in-JS library', 'A utility-first CSS framework', 'A React component library', 'A CSS preprocessor like Sass'], answer: 1, explanation: 'Tailwind provides utility classes generated at build time.' },
  ],
};
