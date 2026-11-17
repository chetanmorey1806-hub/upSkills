export default {
  id: 'day-01-introduction-to-react',
  title: 'Introduction to React: SPA, Virtual DOM and Why React',
  module: 'Module 1: React Fundamentals',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Learn what React is, what a Single Page Application (SPA) is, how the Virtual DOM makes updates efficient, and why React is the most popular library for building user interfaces.',
  objectives: [
    'Explain what React is and who maintains it',
    'Describe a Single Page Application and compare it with a multi-page website',
    'Understand the Virtual DOM and the idea of reconciliation',
    'List the main reasons companies choose React (components, declarative UI, ecosystem)',
    'Render your first React component in the playground',
  ],
  theory: [
    {
      heading: 'What is React?',
      content:
        'React is a **JavaScript library for building user interfaces**. It was created by Jordan Walke at Facebook (now Meta), used internally from 2011 and released as open source in 2013. Today it powers Facebook, Instagram, Netflix, Airbnb, WhatsApp Web and thousands of other apps.\n\nReact is a **library**, not a full framework. It focuses on one job: turning your data into UI and keeping the UI in sync when data changes. For routing, data fetching or global state you pick extra libraries (React Router, Redux Toolkit, etc.).\n\nThink of React like **LEGO bricks**: you build small pieces (components) like a Button, a Card or a Navbar, and then snap them together to build a whole page.',
      points: [
        'Library for UI, maintained by Meta and the open-source community',
        'Component-based: UI is split into small reusable pieces',
        'Declarative: you describe WHAT the UI should look like, React figures out HOW to update the DOM',
        'Learn once, write anywhere: React DOM for web, React Native for mobile',
      ],
    },
    {
      heading: 'Imperative vs Declarative UI',
      content:
        'With plain JavaScript you write **imperative** code: step-by-step instructions such as "find this element, create a li, set its text, append it". As the app grows, keeping every element in sync with the data becomes error-prone.\n\nWith React you write **declarative** code: "for this data, the UI looks like this". When the data changes, you just update the data and React re-renders the UI for you.\n\nAnalogy: imperative is giving a taxi driver every turn ("left, then right, then straight"); declarative is just telling the driver the destination address.',
      syntax:
        '// Imperative (plain DOM)\nconst li = document.createElement("li");\nli.textContent = "Milk";\ndocument.querySelector("ul").appendChild(li);\n\n// Declarative (React)\nfunction List({ items }) {\n  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;\n}',
    },
    {
      heading: 'Single Page Application (SPA)',
      content:
        'In a traditional **multi-page application (MPA)**, every click on a link asks the server for a brand-new HTML page, and the browser reloads everything (white flash, scroll resets).\n\nIn a **Single Page Application**, the browser loads ONE HTML page and a JavaScript bundle once. After that, JavaScript swaps parts of the page as the user navigates. Only data (usually JSON) is fetched from the server. The result feels fast and app-like, like Gmail or Google Maps.',
      points: [
        'One initial HTML page (index.html) with a single <div id="root">',
        'JavaScript renders and updates the UI in the browser',
        'Navigation without full reloads (handled by a router, covered on Day 20)',
        'Trade-off: bigger first download and SEO needs care (solved by frameworks like Next.js)',
      ],
      tip: 'An SPA still can have many "pages" (URLs). "Single page" refers to the single HTML document, not a single screen.',
    },
    {
      heading: 'The DOM and the Virtual DOM',
      content:
        'The **DOM** (Document Object Model) is the browser\'s tree of objects that represents your HTML. Changing the real DOM is relatively expensive because the browser may need to recalculate styles, layout and repaint.\n\nThe **Virtual DOM** is a lightweight JavaScript copy of the UI tree that React keeps in memory. When state changes:\n\n1. React builds a new virtual tree by calling your components again.\n2. It **diffs** (compares) the new tree with the previous one. This process is called **reconciliation**.\n3. It applies only the minimum set of real DOM changes (for example, changing one text node).\n\nAnalogy: instead of repainting a whole house because one wall got dirty, React compares a photo of before and after and repaints only that one wall.',
      tip: 'The Virtual DOM is not "magic speed". Its main benefit is that you can write simple declarative code and still get efficient, batched DOM updates.',
    },
    {
      heading: 'Why React? Key features',
      content:
        'Companies choose React because it scales from a small widget to a huge app.',
      points: [
        '**Components**: reusable, testable building blocks',
        '**JSX**: write HTML-like markup inside JavaScript (Day 3)',
        '**One-way data flow**: data flows from parent to child via props, easy to debug',
        '**Hooks**: useState, useEffect, etc. add state and side effects to functions',
        '**Huge ecosystem and job market**: Next.js, React Native, many UI libraries',
        '**Backed by Meta** and a large community',
      ],
    },
    {
      heading: 'How a React app starts',
      content:
        'Every React web app has an HTML page with an empty container, usually `<div id="root"></div>`. A small entry file creates a React root and renders the top component, typically called `App`.\n\nIn this course\'s playground, React 18 is already loaded as global variables (`React`, `ReactDOM`) and the playground renders `<App />` for you. You only write `function App() { ... }`.',
      syntax:
        '// main.jsx in a real project (you will set this up on Day 2)\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")).render(<App />);',
      tip: 'Coming next (Day 2): creating a real React project on your computer with Vite.',
    },
  ],
  examples: [
    {
      title: 'Your first React component',
      scenario: 'Display a welcome heading and a short paragraph using a React function component.',
      steps: [
        'Open the playground for this example',
        'Define a function called App that returns JSX',
        'Click Run and see the heading rendered inside #root',
      ],
      code: 'function App() {\n  return (\n    <div>\n      <h1>Hello, React!</h1>\n      <p>This UI is rendered by a function component.</p>\n    </div>\n  );\n}',
      playground: {
        jsx: 'function App() {\n  return (\n    <div className="box">\n      <h1>Hello, React!</h1>\n      <p>This UI is rendered by a function component.</p>\n    </div>\n  );\n}',
        css: 'body { font-family: system-ui, sans-serif; padding: 20px; }\n.box { border: 2px solid #61dafb; border-radius: 10px; padding: 16px; }\nh1 { color: #087ea4; margin-top: 0; }',
      },
      result: 'A bordered box with the heading "Hello, React!" and a paragraph below it.',
      explanation:
        'App is just a JavaScript function that returns JSX. React calls it, turns the JSX into elements and puts them into the #root div. className is used instead of class because class is a reserved word in JavaScript.',
    },
    {
      title: 'Declarative UI: the UI follows the data',
      scenario: 'Show a like counter. Clicking the button changes the data, and React updates only the number on the screen.',
      steps: [
        'Create App with a piece of state called likes',
        'Render the number and a button',
        'On click, update the state and watch the UI change automatically',
      ],
      code: 'function App() {\n  const [likes, setLikes] = React.useState(0);\n  return (\n    <div>\n      <p>{likes} likes</p>\n      <button onClick={() => setLikes(likes + 1)}>Like</button>\n    </div>\n  );\n}',
      playground: {
        jsx: 'function App() {\n  const [likes, setLikes] = React.useState(0);\n  return (\n    <div className="card">\n      <h2>React Post</h2>\n      <p>{likes} likes</p>\n      <button onClick={() => setLikes(likes + 1)}>👍 Like</button>\n    </div>\n  );\n}',
        css: 'body { font-family: system-ui, sans-serif; padding: 20px; }\n.card { max-width: 260px; padding: 16px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }\nbutton { padding: 8px 14px; cursor: pointer; }',
      },
      result: 'Each click on "Like" increases the number shown.',
      explanation:
        'We never touch document.querySelector. We only change the data (likes). React re-runs App, compares the new virtual tree with the old one, and updates just the text node with the number. State (useState) is covered in depth on Day 7; here it simply shows the declarative idea.',
    },
    {
      title: 'Imperative vs declarative side by side',
      scenario: 'Compare how a list is added to in plain DOM code versus how React renders a list from an array.',
      steps: [
        'Read the imperative version in the code block',
        'Run the React version in the playground',
        'Click "Add fruit" and notice you only push data, not DOM nodes',
      ],
      code: '// Imperative (vanilla JS)\nconst ul = document.querySelector("ul");\nconst li = document.createElement("li");\nli.textContent = "Mango";\nul.appendChild(li);\n\n// Declarative (React)\nfunction App() {\n  const [fruits, setFruits] = React.useState(["Apple", "Banana"]);\n  return (\n    <>\n      <ul>{fruits.map(f => <li key={f}>{f}</li>)}</ul>\n      <button onClick={() => setFruits([...fruits, "Mango"])}>Add fruit</button>\n    </>\n  );\n}',
      playground: {
        jsx: 'const extra = ["Mango", "Kiwi", "Grapes", "Papaya"];\n\nfunction App() {\n  const [fruits, setFruits] = React.useState(["Apple", "Banana"]);\n  const next = extra.find(f => !fruits.includes(f));\n  return (\n    <div>\n      <h3>Fruit list ({fruits.length})</h3>\n      <ul>{fruits.map(f => <li key={f}>{f}</li>)}</ul>\n      <button disabled={!next} onClick={() => setFruits([...fruits, next])}>\n        {next ? "Add " + next : "No more fruits"}\n      </button>\n    </div>\n  );\n}',
        css: 'body { font-family: system-ui, sans-serif; padding: 20px; }\nbutton { padding: 6px 12px; }',
      },
      result: 'The list grows one fruit per click; the count in the heading updates too.',
      explanation:
        'The heading count and the list are both derived from the same array. In imperative code you would have to remember to update both places yourself; in React they can never get out of sync.',
    },
    {
      title: 'Seeing the Virtual DOM idea: only changed parts update',
      scenario: 'A clock shows the current time every second while an input next to it keeps its typed text. This proves React does not rebuild the whole page.',
      steps: [
        'Run the playground',
        'Type something into the input box',
        'Watch the time update every second while your typed text and cursor stay untouched',
      ],
      code: 'function App() {\n  const [now, setNow] = React.useState(new Date());\n  React.useEffect(() => {\n    const id = setInterval(() => setNow(new Date()), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return (\n    <div>\n      <p>Time: {now.toLocaleTimeString()}</p>\n      <input placeholder="Type here..." />\n    </div>\n  );\n}',
      playground: {
        jsx: 'function App() {\n  const [now, setNow] = React.useState(new Date());\n  React.useEffect(() => {\n    const id = setInterval(() => setNow(new Date()), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return (\n    <div>\n      <p className="time">Time: {now.toLocaleTimeString()}</p>\n      <input placeholder="Type here... I won\'t be reset" />\n    </div>\n  );\n}',
        css: 'body { font-family: system-ui, sans-serif; padding: 20px; }\n.time { font-size: 1.5rem; font-weight: bold; }\ninput { padding: 8px; width: 260px; }',
      },
      result: 'The time ticks every second; the text you typed stays in the input.',
      explanation:
        'Every second App re-renders and produces a new virtual tree. React diffs it with the previous one, sees that only the text inside <p> changed, and updates just that text node. The <input> DOM node is reused, so your typing is preserved. (useEffect is covered on Day 13.)',
    },
  ],
  interview: [
    { q: 'What is React?', a: 'React is an open-source JavaScript library, maintained by Meta, for building user interfaces using reusable components. It is declarative: you describe the UI for a given state and React updates the DOM efficiently when that state changes.', level: 'Easy' },
    { q: 'Is React a library or a framework?', a: 'A library. It focuses on the view layer (rendering UI). Routing, data fetching, forms and global state are handled by additional libraries or by frameworks built on React such as Next.js.', level: 'Easy' },
    { q: 'What is a Single Page Application?', a: 'A web app that loads a single HTML document once and then updates the page dynamically with JavaScript instead of loading new HTML pages from the server for each navigation. Examples: Gmail, Trello.', level: 'Easy' },
    { q: 'What are the pros and cons of SPAs?', a: 'Pros: fast, app-like navigation, less server load for HTML, rich interactivity. Cons: larger initial JS bundle, SEO and first paint need extra work (SSR/SSG), browser history must be managed by a router.', level: 'Medium' },
    { q: 'What is the Virtual DOM?', a: 'A lightweight in-memory JavaScript representation of the UI tree. On each update React creates a new virtual tree, compares it with the previous one (diffing) and applies only the necessary changes to the real DOM.', level: 'Easy' },
    { q: 'What is reconciliation?', a: 'The process React uses to compare the new element tree with the previous one and decide what to change in the DOM. It uses heuristics: elements of different types produce different trees, and keys identify list items across renders.', level: 'Medium' },
    { q: 'Is the Virtual DOM always faster than direct DOM manipulation?', a: 'No. Carefully hand-written DOM updates can be faster. The Virtual DOM gives "fast enough" performance by default while letting developers write simple declarative code, and it enables batching of updates.', level: 'Hard' },
    { q: 'What does declarative mean in React?', a: 'You describe what the UI should look like for the current data (for example, items.map to li elements) instead of writing step-by-step DOM instructions. React handles how to get from the old UI to the new UI.', level: 'Easy' },
    { q: 'What is one-way data flow?', a: 'Data in React flows downward from parent to child via props. Children cannot directly modify parent data; they call functions passed down as props. This makes the app predictable and easier to debug.', level: 'Medium' },
    { q: 'What is the difference between React and React DOM?', a: 'The react package contains the core: components, hooks, element creation. react-dom contains the renderer for browsers (createRoot, portals). React Native uses a different renderer with the same core.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an App component that shows your name in an h1 and your city in a p tag.',
      hint: 'Return one parent div that contains both elements.',
      solution: 'function App() {\n  return (\n    <div>\n      <h1>Riya Sharma</h1>\n      <p>Pune, India</p>\n    </div>\n  );\n}',
    },
    {
      task: 'Render a list of three programming languages from an array using map.',
      hint: 'Use langs.map(l => <li key={l}>{l}</li>) inside a ul.',
      solution: 'const langs = ["JavaScript", "Python", "Java"];\n\nfunction App() {\n  return (\n    <ul>\n      {langs.map(l => <li key={l}>{l}</li>)}\n    </ul>\n  );\n}',
    },
    {
      task: 'Build a counter that shows a number and a "+1" button (use React.useState).',
      hint: 'const [count, setCount] = React.useState(0);',
      solution: 'function App() {\n  const [count, setCount] = React.useState(0);\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}',
    },
    {
      task: 'Write (in comments) the imperative DOM code AND the React code to show the text "Logged in" inside a p element.',
      hint: 'Imperative: createElement, textContent, appendChild. React: return <p>Logged in</p>.',
      solution: '// Imperative\n// const p = document.createElement("p");\n// p.textContent = "Logged in";\n// document.body.appendChild(p);\n\nfunction App() {\n  return <p>Logged in</p>;\n}',
    },
  ],
  quiz: [
    { question: 'Which company originally created React?', options: ['Google', 'Facebook (Meta)', 'Microsoft', 'Twitter'], answer: 1, explanation: 'React was created by Jordan Walke at Facebook and open-sourced in 2013.' },
    { question: 'What does the Virtual DOM do?', options: ['Replaces the browser DOM completely', 'Stores data in a database', 'Keeps an in-memory UI tree and applies only the needed changes to the real DOM', 'Compiles JSX to HTML on the server'], answer: 2, explanation: 'React diffs virtual trees and patches only what changed in the real DOM.' },
    { question: 'In an SPA, what usually happens when you navigate to another page?', options: ['JavaScript updates the view without a full page reload', 'The browser downloads a new HTML page', 'The server restarts', 'The page is printed'], answer: 0, explanation: 'SPAs load one HTML document and swap views with JavaScript.' },
    { question: 'React is best described as...', options: ['A database', 'A CSS framework', 'A backend language', 'A JavaScript library for building UIs'], answer: 3, explanation: 'React is a UI library focused on the view layer.' },
    { question: 'What is the name of the process where React compares old and new virtual trees?', options: ['Compilation', 'Reconciliation', 'Hydration', 'Transpilation'], answer: 1, explanation: 'Reconciliation (diffing) decides which DOM updates are necessary.' },
  ],
};
