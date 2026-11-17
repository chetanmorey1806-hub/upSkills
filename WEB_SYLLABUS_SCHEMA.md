# Web Development courses: topic file spec (HTML, CSS, JavaScript, React)

Folders (ONE file per lesson):
- `src/data/html-days/day-NN-<slug>.js`   (Day 1–30)
- `src/data/html-extra/extra-NN-<slug>.js` (Extra 1–15)
- `src/data/css-days/day-NN-<slug>.js`    (Day 1–30)
- `src/data/js-days/day-NN-<slug>.js`     (Day 1–45)
- `src/data/react-days/day-NN-<slug>.js`  (Day 1–30)

Each file is a plain ES module with a default export object. NO imports, NO JSX syntax in the module itself
(JSX/HTML code goes inside strings), valid JS. Prefer template literals for multi-line code (escape backticks and `${` inside them as \` and \${).

```js
export default {
  id: 'day-06-html-links',          // = filename without .js
  title: 'HTML Links: <a>, href, target, Absolute & Relative URLs, Email Links',
  module: 'Module 2: Links, Images & Lists',   // exact module name from the syllabus below (extras: 'Extra: <group>')
  day: 6,                            // extras: omit `day`, use `extraNo: 3`
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  duration: '1.5 hours',
  summary: '1-2 sentences: what & why.',
  objectives: ['...'],               // 3-5
  theory: [                          // 4-7 sections. Explain EVERY sub-topic of the day in simple English for freshers, with real-world analogies.
    { heading, content /* paragraphs split by \n\n; `code`; **bold**; "- " bullets; "1. " numbered */, syntax /* optional code snippet */, points /* optional */, tip /* optional: common mistake / best practice */ },
  ],
  examples: [                        // 3-6 SOLVED examples
    {
      title, scenario,
      steps: ['Create index.html', 'Add ...', 'Open in browser / click Run'],   // REQUIRED numbered steps
      code: '...',                   // the key code shown to the student (HTML / CSS / JS / JSX)
      playground: {                  // REQUIRED when the example can run in a browser: a complete runnable demo
        html: '<h1>Hello</h1>',      //   body HTML only (no <html>/<head> needed; you MAY include a full document for HTML-structure lessons)
        css: 'h1 { color: teal; }',  //   optional
        js: 'console.log("hi")',     //   optional (plain browser JS; console.log output appears in the playground console)
        // React lessons use ONLY: jsx: 'function App() { return <h1>Hi</h1>; }'
        //   The playground loads React 18 + ReactDOM as globals (React, ReactDOM) and Babel; it renders <App /> into #root automatically.
        //   Use React.useState etc. or `const { useState } = React;`. No import statements. Do NOT call createRoot yourself.
      },
      result: 'What the student should see in the preview / console',
      explanation: 'Why it works, line by line where useful.',
    },
  ],
  interview: [ { q, a, level: 'Easy' | 'Medium' | 'Hard' } ],   // 8-12 real interview questions with clear, correct answers (code allowed with \n)
  practice: [ { task, hint, solution } ],                       // 4-6 hands-on assignments; solution = full code
  quiz: [ { question, options: [4 items], answer: 0-3, explanation } ],   // EXACTLY 5; vary the correct position
};
```

Quality rules:
- Correct, modern, standards-based code (HTML5, modern CSS, ES2015+ JS, React 18 function components + hooks). No deprecated tags except when explaining why they are deprecated.
- Every playground must actually run in a sandboxed iframe (no external files; use https://picsum.photos/… or inline SVG/data URIs for images; https://jsonplaceholder.typicode.com for fetch demos).
- Beginner friendly: explain WHY, show common mistakes, give interview-ready definitions.
- Do not drift into topics of later days except a short "coming next" line.

Validation (run after writing; fix every failure):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.examples.some(e=>e.playground)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```
For JS playgrounds also sanity-run the js with node where it doesn't touch the DOM.

## HTML – 30 days
Module 1: HTML Fundamentals (Day 1–5)
1 Introduction to HTML, History of HTML, HTML Versions, Features, Uses of HTML
2 HTML Document Structure, <!DOCTYPE html>, <html>, <head>, <body>, <title>
3 HTML Elements, Tags, Attributes, Opening and Closing Tags, Nested Elements
4 Heading Tags <h1> to <h6>, Paragraph <p>, Line Break <br>, Horizontal Line <hr>
5 Text Formatting: <b>, <strong>, <i>, <em>, <u>, <mark>, <small>, <del>, <ins>, <sub>, <sup>
Module 2: Links, Images & Lists (Day 6–10)
6 HTML Links <a>, href, target, Absolute URL, Relative URL, Email Links
7 HTML Images <img>, src, alt, width, height, Image Paths
8 Ordered Lists <ol>, Unordered Lists <ul>, List Items <li>
9 Description Lists <dl>, <dt>, <dd>, Nested Lists
10 HTML Tables, <table>, <tr>, <th>, <td>, <caption>, colspan, rowspan
Module 3: HTML Forms (Day 11–15)
11 Introduction to HTML Forms, <form>, action, method, GET and POST
12 Input Types: text, password, email, number, tel, date, time
13 Input Types: radio, checkbox, file, color, range, hidden, submit, reset
14 Form Elements: <label>, <textarea>, <select>, <option>, <button>, <fieldset>, <legend>
15 Form Validation: required, minlength, maxlength, min, max, pattern, placeholder, readonly, disabled
Module 4: Semantic HTML & Advanced Elements (Day 16–20)
16 Semantic HTML, <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
17 Block-Level Elements vs Inline Elements, <div>, <span>
18 HTML Iframes, <iframe>, Google Maps Embed, YouTube Video Embed
19 Audio and Video Tags, <audio>, <video>, <source>, controls, autoplay, loop, muted
20 HTML Entities, Special Characters, Symbols, Emojis, Comments
Module 5: HTML5 Advanced Topics (Day 21–25)
21 HTML5 Introduction, New HTML5 Features, New Semantic Elements
22 HTML5 Input Attributes, datalist, autocomplete, autofocus, multiple, step
23 HTML Canvas Introduction, <canvas>, Basic Shapes, Lines, Rectangles
24 SVG Introduction, <svg>, Shapes, Circle, Rectangle, Line, Polygon
25 HTML Meta Tags, Charset, Viewport, Description, Keywords, SEO Basics
Module 6: Professional HTML Development (Day 26–30)
26 HTML Accessibility, ARIA Basics, alt Text, Labels, Semantic Structure
27 HTML Best Practices, Code Indentation, Clean Code, File Structure
28 HTML with CSS Integration, External CSS, Internal CSS, Inline CSS
29 HTML with JavaScript Integration, Script Tag, DOM Introduction
30 Complete HTML Project, Practical Test, Revision, Interview Questions (bigger: full project + test + 20+ interview Q&A)

## HTML – 15 must-know extra topics (module names in quotes)
'Extra: Elements & Attributes': 1 Global Attributes (id, class, style, title, lang, hidden, contenteditable, draggable, tabindex, accesskey); 2 Custom Data Attributes (data-*); 3 Details and Summary; 4 Progress and Meter Tags; 5 Time, Figure and Figcaption; 6 Picture Tag and Responsive Images (srcset, sizes); 7 Dialog Element
'Extra: Forms Advanced': 8 Form Submission, Enctype and FormData
'Extra: HTML5 Browser APIs': 9 Local Storage and Session Storage; 10 Drag and Drop API; 11 Geolocation API; 12 Progressive Web App (PWA) Basics
'Extra: SEO & Accessibility': 13 Open Graph Meta Tags, Favicon and Canonical URL; 14 Structured Data (JSON-LD); 15 ARIA Roles, Screen Readers and Keyboard Accessibility

## CSS – 30 days
Module 1: CSS Basics (Day 1–6)
1 Introduction to CSS, How CSS Works, Inline / Internal / External CSS
2 CSS Syntax, Comments, Basic Selectors (element, class, id, universal, group)
3 Colors: Named, HEX, RGB/RGBA, HSL/HSLA, Opacity
4 CSS Units: px, %, em, rem, vw, vh, ch
5 Text and Fonts: font-family, Google Fonts, font-size, font-weight, line-height, text-align, text-decoration, text-transform, letter-spacing
6 Backgrounds: background-color, background-image, repeat, position, size, attachment, shorthand
Module 2: Box Model & Positioning (Day 7–11)
7 The CSS Box Model, content / padding / border / margin
8 Margin, Padding, Borders, border-radius, Outline, Margin Collapsing
9 Width, Height, min/max, box-sizing, Overflow
10 Display Property: block, inline, inline-block, none; visibility
11 Position: static, relative, absolute, fixed, sticky; z-index
Module 3: Selectors & Cascade (Day 12–15)
12 Combinators (descendant, child, adjacent, general sibling) and Attribute Selectors
13 Pseudo-classes: :hover, :focus, :active, :nth-child, :first-child, :not, :checked
14 Pseudo-elements: ::before, ::after, ::first-letter, ::placeholder, ::selection
15 Specificity, Cascade, Inheritance, !important
Module 4: Layout (Day 16–21)
16 Float and Clear (legacy layouts)
17 Flexbox: Container Properties (display:flex, flex-direction, justify-content, align-items, flex-wrap, gap)
18 Flexbox: Item Properties (flex-grow, flex-shrink, flex-basis, order, align-self)
19 CSS Grid Basics: grid-template-columns/rows, fr unit, gap, repeat()
20 CSS Grid Advanced: grid-template-areas, spanning, auto-fit/auto-fill, minmax()
21 Centering Techniques and Common Layout Patterns (navbar, holy grail, card grid)
Module 5: Responsive Design (Day 22–24)
22 Responsive Web Design, Viewport, Media Queries, Mobile-First
23 Responsive Images and Typography, clamp(), min(), max()
24 CSS Variables (Custom Properties) and calc(), Theming / Dark Mode
Module 6: Visual Effects & Animation (Day 25–27)
25 Transitions and Transforms (translate, rotate, scale, skew)
26 Keyframe Animations
27 Shadows, Gradients, Filters, object-fit
Module 7: Professional CSS (Day 28–30)
28 CSS Architecture: BEM, File Organization, Intro to Sass, Tailwind and Bootstrap
29 Modern CSS: :has(), :is()/:where(), Container Queries, Nesting, Best Practices and Performance
30 Complete Responsive Website Project, Practical Test, Interview Questions (bigger: project + test + 20+ Q&A)

## JavaScript – 45 days
Module 1: JavaScript Basics (Day 1–8)
1 Introduction to JavaScript, History, Where JS Runs, Adding JS to HTML, Console
2 Variables: var, let, const, Naming Rules
3 Data Types: Primitive vs Reference, typeof, null vs undefined
4 Operators: Arithmetic, Assignment, Comparison, Logical, Ternary, Nullish (??), Optional Chaining (?.)
5 Type Conversion and Coercion, == vs ===, Truthy and Falsy
6 Strings and String Methods, Template Literals
7 Numbers, Math Object, toFixed, parseInt/parseFloat, NaN
8 Conditionals: if/else, else if, switch
Module 2: Functions & Arrays (Day 9–15)
9 Loops: for, while, do-while, for...of, for...in, break/continue
10 Functions: Declaration, Expression, Arrow Functions, Return
11 Parameters: Default, Rest, Spread, Arguments
12 Scope (global, function, block) and Hoisting, TDZ
13 Closures and Lexical Scope
14 Arrays: Creating, Accessing, push/pop/shift/unshift/splice/slice, includes/indexOf
15 Array Methods: forEach, map, filter, reduce, find, some, every, sort
Module 3: Objects & Data Structures (Day 16–21)
16 Objects: Creating, Accessing, Adding/Deleting Properties, Object.keys/values/entries
17 Object Methods and the this Keyword
18 Destructuring (arrays and objects) and Spread/Rest with Objects
19 JSON: JSON.stringify, JSON.parse
20 Date Object and Working with Dates
21 Set, Map, WeakMap basics
Module 4: DOM & Events (Day 22–28)
22 DOM Introduction and Selecting Elements (getElementById, querySelector, querySelectorAll)
23 Changing Content, Attributes, Styles and classList
24 Creating, Appending and Removing Elements
25 Events and addEventListener (click, input, change, keydown, submit)
26 Event Object, Bubbling, Capturing, Event Delegation, preventDefault
27 Form Handling and Validation with JavaScript
28 localStorage / sessionStorage + Mini Project: To-Do App
Module 5: Asynchronous JavaScript (Day 29–34)
29 Error Handling: try/catch/finally, throw, Custom Errors
30 Timers: setTimeout, setInterval, Callbacks and Callback Hell
31 Promises: creating, then/catch/finally, Promise.all / allSettled / race / any
32 async / await
33 Fetch API, REST APIs, JSON data, Loading and Error states
34 The Event Loop, Call Stack, Microtasks vs Macrotasks
Module 6: Advanced JavaScript (Day 35–41)
35 ES Modules: import / export, default vs named
36 Classes and OOP: constructor, methods, getters/setters, static, inheritance (extends, super)
37 Prototypes and Prototypal Inheritance
38 call, apply, bind and this in depth
39 Higher-Order Functions, Currying, Pure Functions, Immutability
40 Debounce and Throttle
41 Regular Expressions Basics
Module 7: Professional JavaScript (Day 42–45)
42 Iterators, Generators and Symbols
43 Browser APIs Recap: History, Clipboard, IntersectionObserver, Geolocation
44 Tooling: npm, package.json, Bundlers (Vite), ESLint/Prettier, Modern ES2015+ Feature Recap
45 Final JavaScript Project, Practical Test, Interview Questions (bigger: project + test + 25+ Q&A incl. output-based questions)

## React – 30 days
Module 1: React Fundamentals (Day 1–6)
1 Introduction to React, SPA, Virtual DOM, Why React
2 Setup with Vite, Project Structure, npm scripts, React DevTools
3 JSX: Rules, Expressions, Attributes (className), Fragments
4 Components: Function Components, Import/Export, Component Tree
5 Props: Passing Data, Destructuring, Default Values, children
6 Conditional Rendering and Rendering Lists with Keys
Module 2: State & Events (Day 7–12)
7 State with useState, State vs Props, Immutable Updates
8 Handling Events in React
9 Forms and Controlled Components
10 Lifting State Up and Sharing State between Components
11 Component Composition and Reusable Components
12 Styling in React: CSS files, CSS Modules, Inline Styles, Tailwind overview
Module 3: Hooks (Day 13–19)
13 useEffect: Side Effects, Dependency Array, Cleanup
14 Fetching Data from APIs (loading, error, AbortController)
15 useRef: DOM refs and mutable values
16 useContext and the Context API
17 useReducer for Complex State
18 Performance Hooks: useMemo, useCallback, React.memo
19 Custom Hooks
Module 4: Routing & State Management (Day 20–24)
20 React Router: BrowserRouter, Routes, Route, Link, NavLink
21 Dynamic Routes, useParams, Nested Routes, useNavigate, Protected Routes
22 Global State: Context vs Redux Toolkit vs Zustand (when to use what)
23 Redux Toolkit: createSlice, configureStore, useSelector, useDispatch, async thunks
24 Forms at Scale: React Hook Form and Validation
Module 5: Advanced React (Day 25–28)
25 Code Splitting: React.lazy, Suspense, Performance Optimization
26 Error Boundaries and Portals
27 Testing React: Vitest and React Testing Library basics
28 React with TypeScript Basics
Module 6: Professional React (Day 29–30)
29 Build and Deployment (Vite build, env variables, Netlify/Vercel), Next.js Overview
30 Final React Project, Practical Test, Interview Questions (bigger: project + test + 25+ Q&A)
Note for React days whose topic cannot run in the single-file playground (Vite setup, Router, Redux Toolkit, testing, TypeScript, deployment): still give full code in `code`, and give a playground that demonstrates the core idea with plain React (e.g. a tiny hash-router or a reducer), clearly saying so.
