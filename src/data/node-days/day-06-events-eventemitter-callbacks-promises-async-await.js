export default {
  id: 'day-06-events-eventemitter-callbacks-promises-async-await',
  title: 'Events and EventEmitter; Callbacks, Promises and async / await in Node',
  module: 'Module 1: Node.js Fundamentals',
  day: 6,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn the event-driven heart of Node with EventEmitter (on, emit, once, off, error events, custom emitter classes) and master the three async styles: error-first callbacks, Promises (with util.promisify and Promise combinators) and async / await.',
  objectives: [
    'Create, listen to and emit events with EventEmitter and build classes that extend it',
    'Handle the special "error" event and avoid memory-leak warnings',
    'Convert callback APIs to promises with util.promisify',
    'Use Promise.all, allSettled, race and any correctly',
    'Write clean async / await code with try / catch, sequential vs parallel execution and events.once',
  ],
  theory: [
    {
      heading: 'Event-driven programming and EventEmitter',
      content:
        'Node is **event-driven**: things happen (a request arrives, a file finishes reading, data comes from a stream) and code **reacts**. Much of Node is built on the **EventEmitter** class from `node:events`: HTTP servers, streams, `process` and sockets are all EventEmitters.\n\n- `emitter.on(name, listener)` (alias `addListener`) registers a listener\n- `emitter.emit(name, ...args)` triggers all listeners **synchronously, in registration order**, and returns true if there were listeners\n- `emitter.once(name, listener)` runs only the first time\n- `emitter.off(name, listener)` (alias `removeListener`), `removeAllListeners(name)`\n- `prependListener` puts a listener first, `listenerCount(name)`, `eventNames()`\n\nAnalogy: a **YouTube channel**. Viewers **subscribe** (`on`), the channel **publishes** a video (`emit`) and every subscriber gets notified. The channel does not need to know who the subscribers are. This is the **publish / subscribe (observer) pattern** and keeps code loosely coupled.',
      syntax:
        "const EventEmitter = require('node:events');\nconst bus = new EventEmitter();\nbus.on('greet', name => console.log('Hello', name));\nbus.emit('greet', 'Asha'); // Hello Asha",
    },
    {
      heading: 'Extending EventEmitter, the error event and leaks',
      content:
        'Real apps create classes that **extend EventEmitter**, so objects can announce what happens to them: `class Order extends EventEmitter`, then `this.emit(\'paid\', order)` inside methods.\n\n**The special `error` event**: if you emit `\'error\'` and **no listener** is registered, Node **throws** the error and the process can crash. Always add `emitter.on(\'error\', ...)` for emitters that can fail (streams, sockets, your own classes).\n\n**Memory leaks**: by default Node warns when more than **10 listeners** are added for the same event (`MaxListenersExceededWarning`). Usually it means you add a listener inside a function that runs repeatedly (e.g. per request) and never remove it. Fix the bug; raise the limit with `setMaxListeners(n)` only when it is intentional.\n\nListeners run synchronously. For heavy work inside a listener, use async code or `setImmediate` so the emitter is not blocked.',
    },
    {
      heading: 'Callbacks and callback hell',
      content:
        'The original Node async style is the **error-first callback**: `fn(args, (err, result) => { ... })`. It works, but sequential steps nest deeper and deeper:\n\n```\ngetUser(id, (err, user) => {\n  getOrders(user, (err, orders) => {\n    getInvoice(orders[0], (err, invoice) => { ... });\n  });\n});\n```\n\nThis **pyramid of doom** (callback hell) is hard to read, error handling is repeated at every level, and it is easy to forget to `return` after an error or to call a callback twice.\n\n`util.promisify(fn)` converts any function that follows the error-first convention into a function that returns a **Promise**. Most core modules also have built-in promise versions: `fs/promises`, `timers/promises`, `dns/promises`, `stream/promises`.',
    },
    {
      heading: 'Promises and the combinators',
      content:
        'A **Promise** represents a value that will be available later. It is **pending**, then **fulfilled** (resolved with a value) or **rejected** (with an error). Use `.then()`, `.catch()` and `.finally()`, or `await`.\n\nRunning several promises:\n\n- `Promise.all([...])`: waits for all; **rejects as soon as one fails** (fail-fast). Use when you need every result.\n- `Promise.allSettled([...])`: waits for all and reports each as `{ status: \'fulfilled\', value }` or `{ status: \'rejected\', reason }`. Use when partial success is OK.\n- `Promise.race([...])`: settles with the **first** promise that settles (success or failure). Classic use: timeouts.\n- `Promise.any([...])`: resolves with the first **success**; rejects with an AggregateError only if all fail. Use for "fastest mirror".\n\nAlways handle rejections. An **unhandled rejection** crashes the process in modern Node (since v15).',
    },
    {
      heading: 'async / await: sequential vs parallel',
      content:
        '`async` functions always return a Promise. Inside them, `await` pauses **that function only** (not the thread) until the promise settles. Errors become normal exceptions you catch with **try / catch / finally**.\n\nThe most common performance mistake is awaiting independent tasks **one after another**:\n\n```\nconst a = await getUsers();    // 1 s\nconst b = await getProducts(); // 1 s  -> total 2 s\n```\n\nIf the tasks do not depend on each other, start them together:\n\n```\nconst [a, b] = await Promise.all([getUsers(), getProducts()]); // total 1 s\n```\n\nOther tips:\n\n- `await` inside `forEach` does NOT wait; use `for...of` (sequential) or `Promise.all(arr.map(...))` (parallel)\n- `await events.once(emitter, \'ready\')` turns a single event into a promise\n- `require(\'node:timers/promises\').setTimeout(ms)` is an awaitable sleep\n- Top-level `await` works in ES modules; in CommonJS wrap code in an async function',
      tip: 'Every async entry point should end with error handling: `main().catch(err => { console.error(err); process.exitCode = 1; });`. In Express 5, errors thrown in async route handlers are automatically forwarded to the error middleware (Express 4 needed a wrapper).',
    },
  ],
  examples: [
    {
      title: 'EventEmitter basics: on, once, emit, off',
      scenario: 'Build a simple notification bus for a shopping site.',
      steps: [
        'Create `bus.js` and run `node bus.js`',
        'Register normal, once and prepended listeners',
        'Emit events with arguments and remove a listener',
      ],
      code: "// bus.js\nconst EventEmitter = require('node:events');\nconst bus = new EventEmitter();\n\nfunction sendEmail(user) { console.log(`  email -> welcome ${user.name}`); }\nbus.on('signup', sendEmail);\nbus.on('signup', user => console.log(`  analytics -> new user #${user.id}`));\nbus.prependListener('signup', () => console.log('  (prepended listener runs first)'));\nbus.once('signup', () => console.log('  once -> first signup bonus!'));\n\nconsole.log('Emit 1:');\nbus.emit('signup', { id: 1, name: 'Asha' });\nconsole.log('Emit 2:');\nbus.emit('signup', { id: 2, name: 'Ravi' });\n\nbus.off('signup', sendEmail);\nconsole.log('Emit 3 (email listener removed):');\nbus.emit('signup', { id: 3, name: 'Meera' });\n\nconsole.log('listeners left:', bus.listenerCount('signup'));\nconsole.log('emit with no listeners returns', bus.emit('logout'));\nconsole.log('event names:', bus.eventNames());",
      result: "Emit 1:\n  (prepended listener runs first)\n  email -> welcome Asha\n  analytics -> new user #1\n  once -> first signup bonus!\nEmit 2:\n  (prepended listener runs first)\n  email -> welcome Ravi\n  analytics -> new user #2\nEmit 3 (email listener removed):\n  (prepended listener runs first)\n  analytics -> new user #3\nlisteners left: 2\nemit with no listeners returns false\nevent names: [ 'signup' ]",
      explanation:
        'Listeners run synchronously in order, except the prepended one which runs first. The `once` listener ran only for the first signup. After `off`, the email listener no longer runs. `emit` returns false when nobody listens. To remove a listener you need a reference to the same function, which is why sendEmail is a named function.',
    },
    {
      title: 'A class that extends EventEmitter, with error handling',
      scenario: 'An OrderService announces placed and failed orders so other parts of the app (email, stock, logging) can react without being hard-coded inside it.',
      steps: [
        'Create `orders.js` and run `node orders.js`',
        'The class calls this.emit(...) inside its methods',
        'Register an "error" listener so failures do not crash the process',
      ],
      code: "// orders.js\nconst EventEmitter = require('node:events');\n\nclass OrderService extends EventEmitter {\n  constructor() {\n    super();\n    this.stock = { pen: 5, book: 1 };\n  }\n  place(item, qty) {\n    if ((this.stock[item] ?? 0) < qty) {\n      this.emit('error', new Error(`Not enough ${item} (wanted ${qty})`));\n      return;\n    }\n    this.stock[item] -= qty;\n    this.emit('placed', { item, qty, left: this.stock[item] });\n  }\n}\n\nconst orders = new OrderService();\norders.on('placed', o => console.log(`[email] Order confirmed: ${o.qty} x ${o.item}`));\norders.on('placed', o => { if (o.left < 2) console.log(`[stock] Low stock for ${o.item}: ${o.left}`); });\norders.on('error', err => console.log('[error]', err.message));\n\norders.place('pen', 2);\norders.place('book', 1);\norders.place('book', 1);\nconsole.log('stock now:', orders.stock);\n\n// What happens WITHOUT an error listener?\nconst bare = new EventEmitter();\ntry {\n  bare.emit('error', new Error('nobody is listening'));\n} catch (err) {\n  console.log('Thrown because no error listener:', err.message);\n}",
      result: "[email] Order confirmed: 2 x pen\n[email] Order confirmed: 1 x book\n[stock] Low stock for book: 0\n[error] Not enough book (wanted 1)\nstock now: { pen: 3, book: 0 }\nThrown because no error listener: nobody is listening",
      explanation:
        'OrderService does not know about email or stock alerts; it just emits events, and listeners decide what to do (loose coupling). The second book order fails, and because an `error` listener exists, it is handled gracefully. The last part proves the rule: emitting `error` with no listener throws, which would crash a real app if uncaught.',
    },
    {
      title: 'From callback hell to promises with util.promisify',
      scenario: 'A legacy library gives callback-based functions. Chain them with nesting, then convert them to promises.',
      steps: [
        'Create `promisify.js` and run `node promisify.js`',
        'Part 1 uses nested callbacks',
        'Part 2 wraps the same functions with util.promisify and uses async / await',
      ],
      code: "// promisify.js\nconst { promisify } = require('node:util');\n\n// legacy, callback-style API (error-first)\nfunction getUser(id, cb) {\n  setTimeout(() => (id > 0 ? cb(null, { id, name: 'Asha' }) : cb(new Error('Invalid id'))), 50);\n}\nfunction getOrders(user, cb) {\n  setTimeout(() => cb(null, [{ orderId: 101, total: 499 }, { orderId: 102, total: 1299 }]), 50);\n}\n\n// Part 1: nested callbacks\ngetUser(1, (err, user) => {\n  if (err) return console.log('callback error:', err.message);\n  getOrders(user, (err, orders) => {\n    if (err) return console.log('callback error:', err.message);\n    console.log('[callbacks]', user.name, 'has', orders.length, 'orders');\n\n    // Part 2: same functions as promises\n    runWithPromises();\n  });\n});\n\nconst getUserP = promisify(getUser);\nconst getOrdersP = promisify(getOrders);\n\nasync function runWithPromises() {\n  try {\n    const user = await getUserP(1);\n    const orders = await getOrdersP(user);\n    const total = orders.reduce((s, o) => s + o.total, 0);\n    console.log('[async/await]', user.name, 'spent', total);\n    await getUserP(-5); // will reject\n  } catch (err) {\n    console.log('[async/await] caught:', err.message);\n  } finally {\n    console.log('[async/await] finally always runs');\n  }\n}",
      result: "[callbacks] Asha has 2 orders\n[async/await] Asha spent 1798\n[async/await] caught: Invalid id\n[async/await] finally always runs",
      explanation:
        '`promisify` returns a new function that calls the original with an extra callback and resolves or rejects a Promise based on `(err, value)`. The async version reads top-to-bottom, and a single try / catch handles errors from every step. `finally` runs whether or not an error happened, which is ideal for cleanup.',
    },
    {
      title: 'Promise.all, allSettled, race and any + sequential vs parallel timing',
      scenario: 'Load data from three fake services, one of which fails, and add a timeout to a slow call.',
      steps: [
        'Create `combinators.js` and run `node combinators.js`',
        'Uses `node:timers/promises` for an awaitable setTimeout',
        'Compare the time of sequential and parallel awaits',
      ],
      code: "// combinators.js\nconst { setTimeout: sleep } = require('node:timers/promises');\n\nconst service = (name, ms, fail = false) =>\n  sleep(ms).then(() => { if (fail) throw new Error(`${name} failed`); return `${name} ok`; });\n\nconst timeout = ms => sleep(ms).then(() => { throw new Error(`timed out after ${ms} ms`); });\nconst secs = start => ((Date.now() - start) / 1000).toFixed(1) + 's';\n\nasync function main() {\n  let t = Date.now();\n  await service('users', 300);\n  await service('products', 300);\n  console.log('sequential:', secs(t));\n\n  t = Date.now();\n  console.log('all       :', await Promise.all([service('users', 300), service('products', 300)]), secs(t));\n\n  try {\n    await Promise.all([service('users', 100), service('payments', 200, true)]);\n  } catch (err) {\n    console.log('all fails :', err.message);\n  }\n\n  const settled = await Promise.allSettled([service('users', 100), service('payments', 200, true)]);\n  console.log('allSettled:', settled.map(r => r.status === 'fulfilled' ? r.value : `ERR ${r.reason.message}`));\n\n  try {\n    await Promise.race([service('reports', 1000), timeout(250)]);\n  } catch (err) {\n    console.log('race      :', err.message);\n  }\n\n  console.log('any       :', await Promise.any([service('mirror-A', 400), service('mirror-B', 150), service('mirror-C', 50, true)]));\n}\n\nmain().catch(err => { console.error(err); process.exitCode = 1; });",
      result: "sequential: 0.6s\nall       : [ 'users ok', 'products ok' ] 0.3s\nall fails : payments failed\nallSettled: [ 'users ok', 'ERR payments failed' ]\nrace      : timed out after 250 ms\nany       : mirror-B ok",
      explanation:
        'Two sequential 300 ms awaits take about 0.6 s, while Promise.all runs them together in about 0.3 s. Promise.all rejects with the first error; allSettled reports every outcome. race settles with whichever finishes first, so the 250 ms timeout beats the 1 s report. any ignores the failed mirror-C and returns the fastest success, mirror-B.',
    },
    {
      title: 'Waiting for an event with await events.once',
      scenario: 'A database connection object emits "ready" when connected. Wait for it with await, and give up if it takes too long.',
      steps: [
        'Create `once.js` and run `node once.js`',
        '`events.once(emitter, name)` returns a Promise that resolves with the event arguments',
        'An AbortSignal.timeout cancels the wait if the event never comes',
      ],
      code: "// once.js\nconst EventEmitter = require('node:events');\nconst { once } = require('node:events');\n\nclass FakeDb extends EventEmitter {\n  connect(ms) {\n    setTimeout(() => this.emit('ready', { host: 'localhost', port: 27017 }), ms);\n    return this;\n  }\n}\n\nasync function main() {\n  const db = new FakeDb().connect(100);\n  const [info] = await once(db, 'ready');   // resolves with the emitted args array\n  console.log('Connected to', `${info.host}:${info.port}`);\n\n  const slowDb = new FakeDb().connect(2000);\n  try {\n    await once(slowDb, 'ready', { signal: AbortSignal.timeout(300) });\n  } catch (err) {\n    console.log('Gave up waiting:', err.name);\n  }\n\n  const failing = new FakeDb();\n  setTimeout(() => failing.emit('error', new Error('auth failed')), 50);\n  try {\n    await once(failing, 'ready');\n  } catch (err) {\n    console.log('once() rejects on error event:', err.message);\n  }\n  process.exit(0); // stop the pending 2-second timer of slowDb\n}\n\nmain();",
      result: "Connected to localhost:27017\nGave up waiting: AbortError\nonce() rejects on error event: auth failed",
      explanation:
        '`once` turns a single event into a Promise, which fits naturally with async / await. With an AbortSignal it rejects with an `AbortError` when the timeout expires. If the emitter emits `error` while waiting, the promise rejects with that error, so one try / catch covers both cases.',
    },
  ],
  interview: [
    { q: 'What is EventEmitter?', a: 'A class from the node:events module that implements the observer (publish / subscribe) pattern. Objects emit named events and registered listener functions are called with the event data. HTTP servers, streams, sockets and process are EventEmitters.', level: 'Easy' },
    { q: 'Are EventEmitter listeners called synchronously or asynchronously?', a: 'Synchronously, in the order they were registered, when emit() is called. emit returns after all listeners have run. To make work asynchronous, use setImmediate / process.nextTick or async code inside the listener.', level: 'Medium' },
    { q: 'Difference between on and once?', a: 'on registers a listener that runs every time the event is emitted; once registers a listener that is removed automatically after its first call.', level: 'Easy' },
    { q: 'What happens if an "error" event is emitted with no listener?', a: 'Node throws the error. If nothing catches it, the process crashes with an uncaught exception. Always add an error listener to emitters that can fail.', level: 'Medium' },
    { q: 'What is MaxListenersExceededWarning?', a: 'A warning when more than 10 listeners (the default) are added for one event on one emitter. It often indicates a memory leak, such as adding listeners inside a request handler without removing them. Fix the leak or use setMaxListeners if intentional.', level: 'Medium' },
    { q: 'What is callback hell and how do you avoid it?', a: 'Deeply nested callbacks for sequential async steps, making code hard to read and handle errors. Avoid it with named functions, Promises (util.promisify, promise-based core APIs) and async / await.', level: 'Easy' },
    { q: 'What does util.promisify do?', a: 'It takes a function that follows the error-first callback convention and returns a version that returns a Promise, resolving with the result or rejecting with the error.', level: 'Easy' },
    { q: 'Difference between Promise.all and Promise.allSettled?', a: 'Promise.all resolves with all values but rejects immediately when any promise rejects. Promise.allSettled always waits for every promise and returns an array of { status, value | reason } objects.', level: 'Medium' },
    { q: 'Difference between Promise.race and Promise.any?', a: 'race settles with the first promise to settle, whether it fulfils or rejects. any resolves with the first fulfilled promise and only rejects (AggregateError) if all reject.', level: 'Medium' },
    { q: 'Why does await inside forEach not work as expected?', a: 'forEach ignores the promises returned by the async callback, so it does not wait. Use for...of for sequential awaits or Promise.all(array.map(async ...)) for parallel execution.', level: 'Hard' },
    { q: 'How do you make independent awaits faster?', a: 'Start them at the same time and await together with Promise.all (or allSettled) instead of awaiting each one sequentially. Total time becomes the slowest task instead of the sum.', level: 'Medium' },
    { q: 'What happens on an unhandled promise rejection in Node 15+?', a: 'The process emits unhandledRejection and, by default, crashes with a non-zero exit code. Always catch rejections with try / catch or .catch().', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a `Timer` class extending EventEmitter with a `start(seconds)` method that emits "tick" with the remaining seconds every 100 ms (simulate seconds) and "done" at the end. Print each tick and "Time up!".',
      hint: 'setInterval inside start; clearInterval and emit("done") when the counter reaches 0.',
      solution: "const EventEmitter = require('node:events');\nclass Timer extends EventEmitter {\n  start(seconds) {\n    let left = seconds;\n    const id = setInterval(() => {\n      left--;\n      this.emit('tick', left);\n      if (left === 0) { clearInterval(id); this.emit('done'); }\n    }, 100);\n  }\n}\nconst t = new Timer();\nt.on('tick', s => console.log('remaining', s));\nt.on('done', () => console.log('Time up!'));\nt.start(3);\n// remaining 2, remaining 1, remaining 0, Time up!",
    },
    {
      task: 'Promisify this function and use it with async / await: function divide(a, b, cb) { if (b === 0) return cb(new Error("Cannot divide by zero")); cb(null, a / b); }. Print divide(10, 2) and handle divide(1, 0).',
      hint: 'const divideP = util.promisify(divide);',
      solution: "const { promisify } = require('node:util');\nfunction divide(a, b, cb) {\n  if (b === 0) return cb(new Error('Cannot divide by zero'));\n  cb(null, a / b);\n}\nconst divideP = promisify(divide);\n(async () => {\n  console.log(await divideP(10, 2)); // 5\n  try { await divideP(1, 0); } catch (e) { console.log(e.message); } // Cannot divide by zero\n})();",
    },
    {
      task: 'Write `withTimeout(promise, ms)` that rejects with "Timeout" if the promise takes longer than ms. Test it with a 200 ms task and a 100 ms limit.',
      hint: 'Promise.race between the promise and a timer that rejects.',
      solution: "const { setTimeout: sleep } = require('node:timers/promises');\nfunction withTimeout(promise, ms) {\n  const timer = sleep(ms).then(() => { throw new Error('Timeout'); });\n  return Promise.race([promise, timer]);\n}\n(async () => {\n  try {\n    await withTimeout(sleep(200).then(() => 'done'), 100);\n  } catch (e) {\n    console.log(e.message); // Timeout\n  }\n  console.log(await withTimeout(sleep(50).then(() => 'fast'), 100)); // fast\n})();",
    },
    {
      task: 'You have ids [1, 2, 3] and `fetchUser(id)` that takes 200 ms. Write two versions: one that fetches sequentially with for...of and one in parallel with Promise.all, and print how long each takes.',
      hint: 'Sequential ≈ 600 ms, parallel ≈ 200 ms.',
      solution: "const { setTimeout: sleep } = require('node:timers/promises');\nconst fetchUser = id => sleep(200).then(() => ({ id }));\n(async () => {\n  let t = Date.now();\n  const seq = [];\n  for (const id of [1, 2, 3]) seq.push(await fetchUser(id));\n  console.log('sequential', Date.now() - t, 'ms');\n  t = Date.now();\n  const par = await Promise.all([1, 2, 3].map(fetchUser));\n  console.log('parallel', Date.now() - t, 'ms', par);\n})();",
    },
    {
      task: 'Build a tiny chat room with EventEmitter: users join (event "join"), send messages ("message") and leave ("leave"). Log a line for each event and print how many users are online after each join/leave.',
      hint: 'Keep a Set of usernames in the class; emit events from join/send/leave methods.',
      solution: "const EventEmitter = require('node:events');\nclass ChatRoom extends EventEmitter {\n  users = new Set();\n  join(u) { this.users.add(u); this.emit('join', u); }\n  send(u, text) { this.emit('message', u, text); }\n  leave(u) { this.users.delete(u); this.emit('leave', u); }\n}\nconst room = new ChatRoom();\nroom.on('join', u => console.log(`${u} joined (${room.users.size} online)`));\nroom.on('message', (u, t) => console.log(`${u}: ${t}`));\nroom.on('leave', u => console.log(`${u} left (${room.users.size} online)`));\nroom.join('Asha'); room.join('Ravi');\nroom.send('Asha', 'Hi Ravi!');\nroom.leave('Ravi');",
    },
  ],
  quiz: [
    { question: 'Which module provides EventEmitter?', options: ['node:util', 'node:stream', 'node:events', 'node:process'], answer: 2, explanation: 'EventEmitter is exported by node:events.' },
    { question: 'What does emitter.emit() return?', options: ['A Promise', 'true if the event had listeners, otherwise false', 'The number of listeners', 'undefined always'], answer: 1, explanation: 'emit returns a boolean telling whether any listener was called.' },
    { question: 'Promise.all([p1, p2]) where p2 rejects:', options: ['Rejects with p2\'s error', 'Resolves with [p1Value, undefined]', 'Waits forever', 'Resolves with only p1\'s value'], answer: 0, explanation: 'Promise.all is fail-fast: one rejection rejects the whole thing.' },
    { question: 'Which is best for awaiting two independent API calls?', options: ['await a(); await b();', 'a().then(b)', 'Using forEach with await', 'await Promise.all([a(), b()])'], answer: 3, explanation: 'Starting both together and awaiting Promise.all runs them in parallel.' },
    { question: 'util.promisify works with functions that...', options: ['Return a Promise already', 'Take an error-first callback as the last argument', 'Are synchronous', 'Emit events'], answer: 1, explanation: 'promisify expects the (err, value) callback convention as the last argument.' },
  ],
};
