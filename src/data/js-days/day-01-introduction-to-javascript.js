export default {
  id: 'day-01-introduction-to-javascript',
  title: 'Introduction to JavaScript: History, Where JS Runs, Adding JS to HTML, the Console',
  module: 'Module 1: JavaScript Basics',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Learn what JavaScript is, where it came from, where it runs (browser and Node.js), the three ways to add it to an HTML page, and how to use the console to see output and debug.',
  objectives: [
    'Explain what JavaScript is and why every website uses it',
    'Describe the short history of JavaScript and ECMAScript versions (ES5, ES6/ES2015 and yearly releases)',
    'Know where JavaScript runs: browsers, Node.js, servers, mobile and desktop apps',
    'Add JavaScript to HTML using inline, internal and external scripts (with defer)',
    'Use console.log, console.warn, console.error and the browser DevTools console',
  ],
  theory: [
    {
      heading: 'What is JavaScript?',
      content: 'JavaScript (JS) is the **programming language of the web**. HTML gives a page its structure, CSS gives it style, and JavaScript gives it **behaviour**.\n\nAnalogy: think of a house. **HTML** is the walls and rooms, **CSS** is the paint and furniture, and **JavaScript** is the electricity: lights that turn on when you press a switch, a doorbell that rings, a fan that spins.\n\nWith JavaScript you can:\n- React to clicks, typing and scrolling\n- Change text, images and styles on the page without reloading\n- Validate forms before they are sent\n- Load data from servers (weather, products, chat messages)\n- Build games, dashboards and full applications\n\nJavaScript is a **high-level, interpreted (JIT-compiled), dynamically typed** language. "Dynamically typed" means a variable can hold a number now and a string later; you do not declare types like in Java or C.',
      points: [
        'JavaScript is NOT Java. The names are similar only for marketing reasons.',
        'JS is case-sensitive: console.log works, Console.Log does not.',
        'Statements usually end with a semicolon ; (optional but recommended for beginners).',
      ],
    },
    {
      heading: 'A short history of JavaScript',
      content: '1. **1995**: Brendan Eich created JavaScript at Netscape in about **10 days**. It was first called Mocha, then LiveScript, then JavaScript.\n2. **1997**: It was standardised by **ECMA International**. The official standard is called **ECMAScript (ES)**. JavaScript is the most popular implementation of ECMAScript.\n3. **2009**: **ES5** added strict mode, JSON support and array methods like forEach and map.\n4. **2015**: **ES6 / ES2015** was a huge update: let, const, arrow functions, classes, template literals, modules, promises.\n5. **2016 onward**: a new version every year (ES2016, ES2017 ... ES2024) with smaller features such as async/await, optional chaining ?. and nullish coalescing ??.\n\nWhen people say "modern JavaScript" they usually mean **ES2015+**. That is what this course teaches.',
      tip: 'Interview line: "ECMAScript is the specification; JavaScript is the language that implements it. ES6 (ES2015) introduced let/const, arrow functions, classes and modules."',
    },
    {
      heading: 'Where does JavaScript run?',
      content: 'JavaScript needs a **JavaScript engine** to run. An engine reads your code and turns it into machine instructions.\n\n- **Browsers**: Chrome and Edge use **V8**, Firefox uses **SpiderMonkey**, Safari uses **JavaScriptCore**. In the browser JS can access the page (the **DOM**) and browser features like alerts, storage and fetch.\n- **Node.js** (2009): runs V8 outside the browser, so you can write servers, command-line tools and build scripts in JavaScript. Node has no `document` or `window`, but it has file system and network access.\n- **Other places**: mobile apps (React Native), desktop apps (Electron, e.g. VS Code), databases (MongoDB shell), even IoT devices.\n\nSo the **language** is the same everywhere, but the **environment** (the extra objects available) changes. `console.log` works in both browser and Node; `document.querySelector` works only in the browser.',
      points: [
        'Engine = runs the code (V8, SpiderMonkey).',
        'Runtime/environment = engine + extra APIs (browser: DOM, window; Node: fs, http).',
      ],
    },
    {
      heading: 'Adding JavaScript to HTML',
      content: 'There are three ways to put JavaScript in a web page:\n\n1. **Inline**: inside an HTML attribute such as `onclick`. Quick for demos but mixes behaviour with structure. Avoid in real projects.\n2. **Internal**: inside a `<script>` tag in the same HTML file. Good for small pages and learning.\n3. **External**: in a separate `.js` file linked with `<script src="app.js"></script>`. **Best practice**: code is reusable, cached by the browser and easier to maintain.\n\n**Where to place the script tag?** The browser reads HTML from top to bottom. If a script in `<head>` tries to find a button that is written later in `<body>`, the button does not exist yet. Two fixes:\n- Put `<script>` just before `</body>`, or\n- Put it in `<head>` with the **defer** attribute: `<script src="app.js" defer></script>`. defer downloads the file in parallel and runs it **after** the HTML is fully parsed.',
      syntax: `<!-- 1. Inline -->
<button onclick="console.log('clicked')">Click</button>

<!-- 2. Internal -->
<script>
  console.log('Hello from internal script');
</script>

<!-- 3. External (recommended) -->
<script src="app.js" defer></script>`,
      tip: 'Common mistake: writing code between the tags of an external script, like <script src="app.js">console.log(1)</script>. When src is present, the inner code is ignored.',
    },
    {
      heading: 'The Console: your best friend',
      content: 'The **console** is a panel in the browser DevTools where you see messages from your code and errors. Open it with **F12** or **Ctrl+Shift+J** (Windows/Linux) / **Cmd+Option+J** (Mac), then click the **Console** tab.\n\nUseful console methods:\n- `console.log(value)`: print normal messages\n- `console.info(value)`: information (looks like log in most browsers)\n- `console.warn(value)`: yellow warning\n- `console.error(value)`: red error\n- `console.table(array)`: show arrays/objects as a table\n- `console.clear()`: clear the console\n\nYou can pass **many values** separated by commas: `console.log("Age:", 25)` prints `Age: 25` with a space between them.\n\nYou can also type JavaScript **directly** into the console and press Enter. It works like a calculator: type `2 + 3` and it shows `5`.',
      tip: 'console.log is for developers, not for users. Users never open the console. To show something to a user you change the page (DOM), which you will learn in Module 4.',
    },
    {
      heading: 'Comments and your first statements',
      content: 'Comments are notes for humans. JavaScript ignores them.\n\n- Single line: `// this is a comment`\n- Multi line: `/* this spans\n   many lines */`\n\nA **statement** is one instruction, like `console.log("Hi");`. JavaScript runs statements **top to bottom**, one after another.\n\nComing next (Day 2): storing values in **variables** with let and const.',
      syntax: `// Print a greeting
console.log("Hello, JavaScript!");

/* Print some math
   results */
console.log(10 + 5);`,
    },
  ],
  examples: [
    {
      title: 'Your first JavaScript program',
      scenario: 'You want to print a greeting and a few calculations to the console to confirm JavaScript is working.',
      steps: [
        'Create index.html with an empty body and a <script> tag (or open the playground)',
        'Write the console.log statements below inside the script',
        'Open DevTools (F12) and click the Console tab, or click Run in the playground',
        'Read the output line by line and match it with each statement',
      ],
      code: `console.log("Hello, JavaScript!");
console.log(10 + 5);
console.log("10" + 5);
console.log("Name:", "Asha", "Age:", 21);`,
      playground: {
        js: `console.log("Hello, JavaScript!");
console.log(10 + 5);
console.log("10" + 5);
console.log("Name:", "Asha", "Age:", 21);`,
      },
      result: `Hello, JavaScript!
15
105
Name: Asha Age: 21`,
      explanation: 'Line 1 prints text (a string). Line 2 adds two numbers, so 15. Line 3 is a surprise: "10" is text, and + with text joins (concatenates), so you get "105". You will learn why on Day 5. Line 4 shows that console.log accepts many values and puts a space between them.',
    },
    {
      title: 'Three ways to add JavaScript to HTML',
      scenario: 'A page has a button. You want to log a message when it is clicked, using inline JS, and also log a message from an internal script when the page loads.',
      steps: [
        'Create index.html',
        'Add a button with an inline onclick attribute',
        'Add an internal <script> before </body> that logs a message and changes a paragraph',
        'Open in the browser / click Run, then click the button and watch the console',
      ],
      code: `<!-- index.html -->
<h1>Day 1 Demo</h1>
<button onclick="console.log('Inline: button clicked')">Click me</button>
<p id="msg">Waiting for JavaScript...</p>

<!-- internal script, placed at the end of body -->
<script>
  console.log('Internal: page loaded');
  document.getElementById('msg').textContent = 'JavaScript is running!';
</script>

<!-- external script (in a real project) -->
<!-- <script src="app.js" defer></script> -->`,
      playground: {
        html: `<h1>Day 1 Demo</h1>
<button onclick="console.log('Inline: button clicked')">Click me</button>
<p id="msg">Waiting for JavaScript...</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { padding: 8px 16px; cursor: pointer; }
#msg { color: teal; font-weight: bold; }`,
        js: `console.log('Internal: page loaded');
document.getElementById('msg').textContent = 'JavaScript is running!';`,
      },
      result: 'The paragraph changes to "JavaScript is running!" and the console shows "Internal: page loaded". Each button click adds "Inline: button clicked" to the console.',
      explanation: 'The internal script runs after the HTML above it is parsed, so the paragraph with id "msg" already exists and can be changed. The onclick attribute is inline JavaScript that runs only when the button is clicked. In real projects you would move the code to app.js and load it with <script src="app.js" defer>.',
    },
    {
      title: 'Console methods: log, info, warn, error',
      scenario: 'You are debugging a shopping cart and want different kinds of messages: normal info, a warning for low stock and an error for a failed payment.',
      steps: [
        'Open the playground (or the browser console)',
        'Write one statement for each console method',
        'Click Run',
        'Notice the colours in a browser: warn is yellow, error is red',
      ],
      code: `console.log("Cart loaded");
console.info("Items in cart:", 3);
console.warn("Only 2 left in stock!");
console.error("Payment failed. Try again.");`,
      playground: {
        js: `console.log("Cart loaded");
console.info("Items in cart:", 3);
console.warn("Only 2 left in stock!");
console.error("Payment failed. Try again.");`,
      },
      result: `Cart loaded
Items in cart: 3
Only 2 left in stock!
Payment failed. Try again.`,
      explanation: 'All four methods print a message. The difference is the level: log/info are normal messages, warn is highlighted as a warning and error as an error (with a red icon). DevTools lets you filter by level, which is very useful in big apps.',
    },
    {
      title: 'Using JavaScript as a calculator',
      scenario: 'Before learning variables, use the console to quickly compute a bill: 3 notebooks at 45 rupees and 2 pens at 10 rupees, plus the average of three test marks.',
      steps: [
        'Open the console or playground',
        'Type the expressions with console.log',
        'Use brackets () to control the order of calculation',
        'Click Run and compare the results',
      ],
      code: `console.log(3 * 45 + 2 * 10);
console.log((78 + 85 + 92) / 3);
console.log(10 / 3);
console.log(2 ** 10);`,
      playground: {
        js: `console.log(3 * 45 + 2 * 10);
console.log((78 + 85 + 92) / 3);
console.log(10 / 3);
console.log(2 ** 10);`,
      },
      result: `155
85
3.3333333333333335
1024`,
      explanation: '* and / happen before + (like in school maths), so 135 + 20 = 155. The brackets make the addition happen first, then divide by 3 = 85. 10 / 3 shows that JS numbers are decimals (floating point), and the last digit 5 is a tiny rounding effect. ** is the power operator: 2 to the power 10 = 1024.',
    },
  ],
  interview: [
    { q: 'What is JavaScript?', a: 'JavaScript is a high-level, dynamically typed, interpreted (JIT-compiled) programming language. It is the language of the web: it adds interactivity to HTML/CSS pages, and with Node.js it also runs on servers.', level: 'Easy' },
    { q: 'Is JavaScript the same as Java?', a: 'No. They are completely different languages. Java is statically typed and compiled to bytecode; JavaScript is dynamically typed and runs in browsers and Node.js. The name "JavaScript" was a marketing decision in 1995.', level: 'Easy' },
    { q: 'What is ECMAScript? What is ES6?', a: 'ECMAScript is the official specification (standard) maintained by ECMA International (TC39). JavaScript implements it. ES6, also called ES2015, was a major update that added let/const, arrow functions, classes, template literals, destructuring, promises and modules. Since 2015 a new version is released every year.', level: 'Easy' },
    { q: 'What is a JavaScript engine? Name some.', a: 'A JS engine is the program that parses and executes JavaScript code, usually with Just-In-Time compilation. Examples: V8 (Chrome, Edge, Node.js), SpiderMonkey (Firefox), JavaScriptCore (Safari).', level: 'Medium' },
    { q: 'What is the difference between the browser and Node.js as JavaScript environments?', a: 'Both run the same language. The browser provides the DOM (document), window, localStorage, fetch etc. Node.js has no DOM but provides modules like fs (file system), http and process, so it can build servers and CLI tools.', level: 'Medium' },
    { q: 'What are the ways to include JavaScript in an HTML page? Which is best?', a: 'Inline (onclick="..."), internal (<script>...</script>) and external (<script src="app.js"></script>). External is best: separation of concerns, browser caching, reuse across pages and easier maintenance.', level: 'Easy' },
    { q: 'What is the difference between <script>, <script defer> and <script async>?', a: 'A normal script blocks HTML parsing while it downloads and runs. defer downloads in parallel and runs after the HTML is parsed, in document order. async downloads in parallel and runs as soon as it is ready, which may be before parsing finishes and in any order. Use defer for app code that touches the DOM; async for independent scripts like analytics.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log("5" + 3);\nconsole.log(5 + 3);', a: 'It prints:\n53\n8\nWith a string on one side, + joins text (concatenation), so "5" + 3 = "53". With two numbers, + adds them, so 8.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log("A", 1, "B");\nconsole.log(1 + 2 + "3");', a: 'It prints:\nA 1 B\n33\nconsole.log separates multiple arguments with a space. In the second line, + runs left to right: 1 + 2 = 3 (numbers), then 3 + "3" = "33" (string).', level: 'Medium' },
    { q: 'Why might document.getElementById return null when the script is in the <head>?', a: 'The browser parses HTML top to bottom. A script in <head> runs before the body elements exist, so the element is not found and the result is null. Fix it by moving the script before </body> or by adding the defer attribute.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Print your name, your city and your favourite programming language on three separate lines using console.log.',
      hint: 'Use one console.log per line. Text must be inside quotes.',
      solution: `console.log("Name: Ravi");
console.log("City: Pune");
console.log("Favourite language: JavaScript");`,
    },
    {
      task: 'Create an HTML page that loads an external file app.js with defer. In app.js, log "app.js loaded" and change the text of an <h1 id="title"> to "Hello from app.js".',
      hint: 'Use <script src="app.js" defer></script> in the <head>. Use document.getElementById("title").textContent = ...',
      solution: `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Day 1</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h1 id="title">Loading...</h1>
</body>
</html>

// app.js
console.log("app.js loaded");
document.getElementById("title").textContent = "Hello from app.js";`,
    },
    {
      task: 'Use console.log to calculate: the total price of 4 shirts at 499 each with a 100 rupee discount, and the area of a rectangle 12 by 7.5.',
      hint: 'Multiply first, then subtract. Area = length * width.',
      solution: `console.log(4 * 499 - 100); // 1896
console.log(12 * 7.5);      // 90`,
    },
    {
      task: 'Log one message with each of console.log, console.info, console.warn and console.error for a "file upload" scenario. Open DevTools and use the level filter to show only errors.',
      hint: 'In Chrome DevTools, the "Default levels" dropdown lets you filter.',
      solution: `console.log("Upload started");
console.info("File size: 2 MB");
console.warn("File is larger than 1 MB, upload may be slow");
console.error("Upload failed: network error");`,
    },
  ],
  quiz: [
    { question: 'Who created JavaScript and in which year?', options: ['James Gosling, 1991', 'Brendan Eich, 1995', 'Guido van Rossum, 1989', 'Tim Berners-Lee, 1990'], answer: 1, explanation: 'Brendan Eich created JavaScript at Netscape in 1995.' },
    { question: 'Which attribute makes an external script run after the HTML is fully parsed, in order?', options: ['async', 'lazy', 'defer', 'onload'], answer: 2, explanation: 'defer downloads in parallel and executes after parsing, preserving order.' },
    { question: 'What does console.log("2" + 2) print?', options: ['22', '4', 'NaN', 'Error'], answer: 0, explanation: 'With a string involved, + concatenates: "2" + 2 = "22".' },
    { question: 'Which engine powers Google Chrome and Node.js?', options: ['SpiderMonkey', 'Chakra', 'JavaScriptCore', 'V8'], answer: 3, explanation: 'V8 is Google\'s engine used in Chrome, Edge and Node.js.' },
    { question: 'Which object is NOT available in plain Node.js?', options: ['console', 'document', 'Math', 'JSON'], answer: 1, explanation: 'document (the DOM) exists only in browsers.' },
  ],
};
