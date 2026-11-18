export default {
  id: 'day-01-introduction-to-nodejs',
  title: 'Introduction to Node.js: V8, Event Loop, Non-blocking I/O and Where Node Is Used',
  module: 'Module 1: Node.js Fundamentals',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Understand what Node.js is, how it runs JavaScript outside the browser with the V8 engine, why its single-threaded event loop with non-blocking I/O can serve thousands of users, and where companies use it.',
  objectives: [
    'Explain what Node.js is (a runtime, not a language or framework)',
    'Describe the roles of V8, libuv and the event loop',
    'Compare blocking and non-blocking I/O with a real script',
    'Predict the order of sync code, process.nextTick, Promises, timers and setImmediate',
    'List real-world use cases where Node.js is (and is not) a good fit',
  ],
  theory: [
    {
      heading: 'What is Node.js?',
      content:
        '**Node.js is a JavaScript runtime** that lets you run JavaScript outside the browser: on your laptop, on a server, in a command-line tool or inside a Docker container. It was created by **Ryan Dahl in 2009** and is now maintained by the OpenJS Foundation.\n\nBefore Node, JavaScript lived only inside browsers. Node took Google Chrome\'s **V8 engine**, added access to the file system, network, processes and operating system, and packaged it as a program called `node`.\n\nAnalogy: JavaScript is a **language** (like English). The browser and Node.js are two different **workplaces** where that language is spoken. In the browser you get `document`, `window` and `fetch`; in Node you get `fs`, `http`, `process` and `path`, but no DOM.',
      points: [
        'Node.js is a runtime environment, NOT a programming language and NOT a framework',
        'Express, NestJS, Fastify are frameworks that run ON Node.js',
        'Current LTS line: Node.js 22 (Long Term Support = safe for production)',
        'Even-numbered releases (20, 22, 24) become LTS; odd releases are short-lived "Current" releases',
      ],
    },
    {
      heading: 'Inside Node.js: V8 + libuv + core modules',
      content:
        'Node is built from a few main pieces:\n\n1. **V8**: Google\'s open-source JavaScript engine (written in C++). It compiles your JavaScript to fast machine code using just-in-time (JIT) compilation.\n2. **libuv**: a C library that provides the **event loop**, a **thread pool** (default 4 threads) and cross-platform asynchronous I/O for files, network sockets, DNS and timers.\n3. **Core modules / bindings**: JavaScript APIs such as `fs`, `http`, `path`, `os`, `events`, `stream` that talk to C++ code underneath.\n\nAnalogy: V8 is the **engine** of a car, libuv is the **gearbox and wheels** that connect the engine to the road (OS), and the core modules are the **dashboard controls** you actually touch.',
      tip: 'Interview favourite: "Is Node.js single-threaded?" Your JavaScript runs on ONE main thread, but Node itself uses extra threads (libuv thread pool, V8 garbage collector threads). So the accurate answer is: "JavaScript execution is single-threaded; I/O is handled asynchronously by the OS and libuv."',
    },
    {
      heading: 'Blocking vs Non-blocking I/O',
      content:
        '**I/O** (input/output) means talking to something slow outside the CPU: reading a file, querying a database, calling another API.\n\n- **Blocking (synchronous)** I/O: the program waits and does nothing else until the operation finishes. Example: `fs.readFileSync()`.\n- **Non-blocking (asynchronous)** I/O: the program starts the operation, registers a callback (or Promise), and immediately moves on. When the OS finishes, the callback is queued and run later. Example: `fs.readFile()` or `fs.promises.readFile()`.\n\nAnalogy: a **restaurant waiter**. A blocking waiter takes one order, walks into the kitchen and stands there until the food is cooked, while other tables wait. A non-blocking waiter hands the order to the kitchen, serves other tables, and comes back when the kitchen rings the bell. One non-blocking waiter can serve many tables, exactly like one Node thread can serve many requests.',
      syntax:
        "const fs = require('fs');\n\n// Blocking: the next line waits\nconst data = fs.readFileSync('notes.txt', 'utf8');\n\n// Non-blocking: callback runs later\nfs.readFile('notes.txt', 'utf8', (err, text) => {\n  if (err) return console.error(err);\n  console.log(text);\n});\nconsole.log('I run before the file is read');",
    },
    {
      heading: 'The Event Loop (simple version)',
      content:
        'The **event loop** is the heart of Node. It keeps checking: "Is the call stack empty? Is there a finished task waiting? Then run its callback."\n\nThe loop goes through **phases** in a cycle:\n\n1. **timers**: callbacks from `setTimeout` / `setInterval` whose time has passed\n2. **pending callbacks**: some system-level callbacks\n3. **poll**: wait for and run I/O callbacks (files, sockets)\n4. **check**: `setImmediate` callbacks\n5. **close callbacks**: e.g. `socket.on(\'close\')`\n\nBetween every callback, Node empties two special queues first: the **process.nextTick queue**, then the **Promise microtask queue**.\n\nOrder to remember: **synchronous code → process.nextTick → Promise callbacks → timers / I/O / setImmediate**.',
      points: [
        'Never block the event loop with heavy CPU work (huge loops, sync crypto, big JSON parsing): every user waits',
        'CPU-heavy work belongs in worker_threads, a child process or a separate service',
        'Inside an I/O callback, setImmediate always runs before setTimeout(fn, 0)',
      ],
    },
    {
      heading: 'Where is Node.js used?',
      content:
        'Node shines for **I/O-heavy, real-time and API** workloads:\n\n- **REST and GraphQL APIs** and backends for web and mobile apps (Express, NestJS, Fastify)\n- **Real-time apps**: chat, live notifications, multiplayer games, collaboration tools (WebSockets / Socket.io)\n- **Streaming**: Netflix uses Node for its UI layer; streaming files and video in chunks\n- **Microservices and API gateways / BFF (backend for frontend)**\n- **Command-line tools**: npm, Vite, ESLint, Prettier, Angular CLI are all Node programs\n- **Full-stack JavaScript**: React / Next.js front end + Node back end, one language everywhere\n\nCompanies: Netflix, PayPal, LinkedIn, Uber, Walmart, NASA, Trello.\n\nNode is **not ideal** for pure CPU-bound work such as video encoding, heavy image processing or machine-learning training, unless you offload it to worker threads or other services.',
    },
    {
      heading: 'Node.js vs the Browser',
      content:
        'Both run JavaScript with the same syntax, but the **environment** differs:\n\n- Browser has `window`, `document`, DOM, `localStorage`; Node has **no DOM**.\n- Node has `process`, `fs`, `http`, `os`, `Buffer`; browsers do not (for security).\n- In Node the global object is `global` (also available as `globalThis` everywhere).\n- Node supports both **CommonJS** (`require`) and **ES Modules** (`import`). We cover modules on Day 3.\n- Both share modern APIs: `fetch`, `setTimeout`, `URL`, `console`, `structuredClone`.\n\nComing next (Day 2): installing Node, the REPL, npm and package.json.',
    },
  ],
  examples: [
    {
      title: 'Your first Node.js program',
      scenario: 'Run JavaScript outside the browser and see which globals exist in Node.',
      steps: [
        'Install Node.js 22 LTS from nodejs.org (or with nvm) and check with `node -v`',
        'Create a folder `day01` and a file `app.js` inside it',
        'Paste the code and save',
        'Open a terminal in the folder and run `node app.js`',
      ],
      code: "// app.js\nconsole.log('Hello from Node.js!');\n\nconsole.log('typeof window   :', typeof window);    // no browser window\nconsole.log('typeof document :', typeof document);  // no DOM\nconsole.log('typeof process  :', typeof process);   // Node-only global\nconsole.log('typeof require  :', typeof require);   // CommonJS loader\nconsole.log('global === globalThis:', global === globalThis);\n\nconst sum = [1, 2, 3, 4].reduce((a, b) => a + b, 0);\nconsole.log(`Sum is ${sum}`);",
      result: "Hello from Node.js!\ntypeof window   : undefined\ntypeof document : undefined\ntypeof process  : object\ntypeof require  : function\nglobal === globalThis: true\nSum is 10",
      explanation:
        'The same JavaScript language runs, but the environment is different: `window` and `document` are undefined because there is no browser, while `process` and `require` exist because Node provides them. `global` is the Node name of the global object and equals the standard `globalThis`.',
    },
    {
      title: 'Blocking vs non-blocking file reading',
      scenario: 'See with your own eyes that readFileSync waits, while readFile lets the program continue.',
      steps: [
        'Create `io.js` with the code below (it creates its own `notes.txt` first)',
        'Run `node io.js`',
        'Notice the order of the lines: the async callback prints LAST',
      ],
      code: "// io.js\nconst fs = require('fs');\nfs.writeFileSync('notes.txt', 'Node.js is non-blocking');\n\nconsole.log('1. Start');\n\n// Blocking: waits until the file is read\nconst text = fs.readFileSync('notes.txt', 'utf8');\nconsole.log('2. Sync read  :', text);\n\n// Non-blocking: registers a callback and moves on immediately\nfs.readFile('notes.txt', 'utf8', (err, data) => {\n  if (err) throw err;\n  console.log('4. Async read :', data);\n});\n\nconsole.log('3. End of script (async read still in progress)');",
      result: "1. Start\n2. Sync read  : Node.js is non-blocking\n3. End of script (async read still in progress)\n4. Async read : Node.js is non-blocking",
      explanation:
        '`readFileSync` blocks: line 2 cannot print until the file is fully read. `readFile` hands the work to libuv and returns at once, so line 3 prints before the callback. When the read completes, the event loop runs the callback and prints line 4.',
    },
    {
      title: 'Predicting event loop order',
      scenario: 'A classic interview question: in what order do these logs appear?',
      steps: [
        'Create `loop.js` and paste the code',
        'Before running, write down your predicted order',
        'Run `node loop.js` and compare',
      ],
      code: "// loop.js\nconst fs = require('fs');\n\nconsole.log('1 sync start');\n\nsetTimeout(() => console.log('5 setTimeout 0'), 0);\nPromise.resolve().then(() => console.log('4 promise microtask'));\nprocess.nextTick(() => console.log('3 process.nextTick'));\n\nfs.readFile(__filename, () => {\n  console.log('6 I/O callback (poll phase)');\n  setTimeout(() => console.log('8 timeout inside I/O'), 0);\n  setImmediate(() => console.log('7 setImmediate inside I/O'));\n});\n\nconsole.log('2 sync end');",
      result: "1 sync start\n2 sync end\n3 process.nextTick\n4 promise microtask\n5 setTimeout 0\n6 I/O callback (poll phase)\n7 setImmediate inside I/O\n8 timeout inside I/O",
      explanation:
        'Synchronous code always finishes first (1, 2). Then Node drains the nextTick queue (3) and the Promise microtask queue (4). The event loop then reaches the timers phase (5). When the file read finishes, its callback runs in the poll phase (6). After poll comes the check phase, so `setImmediate` (7) runs before the next timers phase (8). Inside an I/O callback this order is guaranteed.',
    },
    {
      title: 'One thread, many waits at the same time',
      scenario: 'Simulate three slow "database calls" of 1 second each. Do they take 3 seconds or 1 second in total?',
      steps: [
        'Create `concurrent.js`',
        'The `fakeDbCall` function uses a timer to pretend to be slow I/O',
        'Run `node concurrent.js` and check the total time',
      ],
      code: "// concurrent.js\nfunction fakeDbCall(name) {\n  return new Promise(resolve => {\n    setTimeout(() => resolve(`${name} loaded`), 1000); // 1 second of \"I/O\"\n  });\n}\n\nasync function main() {\n  const start = Date.now();\n  const results = await Promise.all([\n    fakeDbCall('users'),\n    fakeDbCall('orders'),\n    fakeDbCall('products'),\n  ]);\n  const seconds = Math.round((Date.now() - start) / 1000);\n  console.log(results);\n  console.log(`Total time: about ${seconds} second(s), not 3`);\n}\n\nmain();",
      result: "[ 'users loaded', 'orders loaded', 'products loaded' ]\nTotal time: about 1 second(s), not 3",
      explanation:
        'All three waits are started immediately and run concurrently. The single JavaScript thread is free while waiting, so the total is about 1 second. This is exactly why one Node process can handle thousands of simultaneous requests that mostly wait on databases and networks.',
    },
    {
      title: 'A tiny web server in 10 lines',
      scenario: 'Preview of Day 8: Node can be a web server with no extra packages.',
      steps: [
        'Create `server.js` with the code below',
        'Run `node server.js`',
        'Open http://localhost:3000 in the browser or run `curl http://localhost:3000`',
        'Press Ctrl + C in the terminal to stop the server',
      ],
      code: "// server.js\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ message: 'Hello from Node!', path: req.url }));\n});\n\nserver.listen(3000, () => console.log('Server running on http://localhost:3000'));",
      result: "Server running on http://localhost:3000\nGET / → 200 {\"message\":\"Hello from Node!\",\"path\":\"/\"}\nGET /about → 200 {\"message\":\"Hello from Node!\",\"path\":\"/about\"}",
      explanation:
        '`http.createServer` registers one callback for every request. `server.listen` starts listening and the event loop keeps the process alive, waiting for connections without blocking. On Day 8 you will add routing by hand, and from Day 9 you will use Express.',
    },
  ],
  interview: [
    { q: 'What is Node.js?', a: 'Node.js is an open-source, cross-platform JavaScript runtime built on Chrome\'s V8 engine. It lets you run JavaScript outside the browser, mainly for servers, APIs, CLIs and tooling, using an event-driven, non-blocking I/O model.', level: 'Easy' },
    { q: 'Is Node.js a language, a framework or a runtime?', a: 'A runtime. JavaScript is the language; Express, NestJS and Fastify are frameworks that run on top of the Node.js runtime.', level: 'Easy' },
    { q: 'Is Node.js single-threaded?', a: 'Your JavaScript code runs on a single main thread with one call stack. But Node uses libuv\'s thread pool (default 4 threads, UV_THREADPOOL_SIZE) for some operations such as file system, DNS lookup, crypto and zlib, and the OS kernel handles network I/O asynchronously. So: single-threaded JS execution, multi-threaded under the hood.', level: 'Medium' },
    { q: 'What is the event loop?', a: 'The event loop is a loop provided by libuv that continuously picks completed events (timers, I/O, setImmediate, close events) from queues and runs their callbacks on the main thread when the call stack is empty. It has phases: timers, pending callbacks, idle/prepare, poll, check and close callbacks. The nextTick and Promise microtask queues are drained between callbacks.', level: 'Medium' },
    { q: 'What is non-blocking I/O?', a: 'Starting an I/O operation without waiting for it to finish. The function returns immediately and the result is delivered later through a callback, Promise or event, so the thread can serve other work meanwhile.', level: 'Easy' },
    { q: 'What is the difference between process.nextTick and setImmediate?', a: 'process.nextTick callbacks run immediately after the current operation, before any Promise microtasks and before the event loop continues to the next phase. setImmediate callbacks run in the check phase, after the poll (I/O) phase of the current loop iteration. Overusing nextTick can starve the event loop.', level: 'Hard' },
    { q: 'What are V8 and libuv?', a: 'V8 is Google\'s JavaScript engine that compiles and executes JS (JIT compilation, garbage collection). libuv is a C library that gives Node its event loop, thread pool and cross-platform asynchronous I/O.', level: 'Medium' },
    { q: 'When should you NOT use Node.js?', a: 'For CPU-intensive tasks such as video encoding, large image processing, scientific computing or ML training on the main thread, because heavy computation blocks the event loop and every request waits. You can still use worker_threads, child processes or a dedicated service in another language.', level: 'Medium' },
    { q: 'Why is Node.js good for real-time and API servers?', a: 'Most server time is spent waiting on I/O (DB, network). Node\'s event-driven model keeps one thread busy serving other requests while waiting, so it handles many concurrent connections with low memory. Same language on front end and back end, and the huge npm ecosystem, are extra benefits.', level: 'Easy' },
    { q: 'What is the difference between Node.js and JavaScript in the browser?', a: 'Same language, different environment. The browser provides DOM, window, document and storage APIs and is sandboxed. Node provides file system, networking, process, OS and Buffer APIs, has no DOM, and supports both CommonJS and ES Modules.', level: 'Easy' },
    { q: 'What does LTS mean for Node.js versions?', a: 'Long Term Support. Even-numbered releases (e.g. 20, 22) enter LTS and receive bug and security fixes for about 30 months, so they are recommended for production. Odd-numbered releases are short-lived Current releases.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write `info.js` that prints "Running on Node", the value of `typeof window`, and the result of `[10, 20, 30].map(n => n * 2)`.',
      hint: 'Use console.log for each value and run it with `node info.js`.',
      solution: "// info.js\nconsole.log('Running on Node');\nconsole.log(typeof window);          // undefined\nconsole.log([10, 20, 30].map(n => n * 2)); // [ 20, 40, 60 ]",
    },
    {
      task: 'Without running it first, predict the output order of: console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); process.nextTick(() => console.log("D")); console.log("E"). Then run it to check.',
      hint: 'Sync first, then nextTick, then Promises, then timers.',
      solution: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nprocess.nextTick(() => console.log('D'));\nconsole.log('E');\n// Output: A E D C B",
    },
    {
      task: 'Create a file `story.txt` from code, then read it twice: once with readFileSync and once with readFile. Print "done" at the end of the script and observe where it appears.',
      hint: 'writeFileSync first; the async callback prints after "done".',
      solution: "const fs = require('fs');\nfs.writeFileSync('story.txt', 'Once upon a time');\nconsole.log('sync:', fs.readFileSync('story.txt', 'utf8'));\nfs.readFile('story.txt', 'utf8', (err, txt) => {\n  if (err) throw err;\n  console.log('async:', txt);\n});\nconsole.log('done');\n// sync: Once upon a time\n// done\n// async: Once upon a time",
    },
    {
      task: 'Prove that blocking code freezes timers: schedule setTimeout(..., 0) that prints "timer fired", then run a busy loop for about 2 seconds, then print "loop finished". Which prints first and why?',
      hint: 'while (Date.now() - start < 2000) {} blocks the only JS thread.',
      solution: "const start = Date.now();\nsetTimeout(() => console.log('timer fired after', Date.now() - start, 'ms'), 0);\nwhile (Date.now() - start < 2000) { /* blocking the event loop */ }\nconsole.log('loop finished');\n// loop finished\n// timer fired after ~2000 ms  -> the timer could not run while the thread was busy",
    },
    {
      task: 'Write `parallel.js` that runs a 500 ms fake call and a 1500 ms fake call with Promise.all and prints the total time rounded to the nearest 100 ms.',
      hint: 'Total time is the slowest call, not the sum.',
      solution: "const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));\n(async () => {\n  const t = Date.now();\n  const out = await Promise.all([wait(500, 'fast'), wait(1500, 'slow')]);\n  console.log(out, Math.round((Date.now() - t) / 100) * 100, 'ms'); // [ 'fast', 'slow' ] 1500 ms\n})();",
    },
  ],
  quiz: [
    { question: 'Which JavaScript engine does Node.js use?', options: ['SpiderMonkey', 'V8', 'Chakra', 'JavaScriptCore'], answer: 1, explanation: 'Node.js is built on Google\'s V8 engine, the same one used in Chrome.' },
    { question: 'Which library provides the event loop and thread pool in Node.js?', options: ['Express', 'npm', 'libuv', 'V8'], answer: 2, explanation: 'libuv is the C library behind the event loop, the thread pool and asynchronous I/O.' },
    { question: 'What prints first? setTimeout(() => log("T"), 0); Promise.resolve().then(() => log("P")); process.nextTick(() => log("N"));', options: ['T', 'P', 'N', 'It is random'], answer: 2, explanation: 'process.nextTick runs before Promise microtasks, which run before timers.' },
    { question: 'Which task is the WORST fit for running directly on Node\'s main thread?', options: ['A chat server', 'A REST API that reads from MongoDB', 'Encoding a 4K video', 'A CLI tool that renames files'], answer: 2, explanation: 'Video encoding is CPU-bound and would block the event loop for every other request.' },
    { question: 'Which object does NOT exist in Node.js by default?', options: ['process', 'document', 'globalThis', 'Buffer'], answer: 1, explanation: 'There is no DOM in Node, so `document` is undefined.' },
  ],
};
