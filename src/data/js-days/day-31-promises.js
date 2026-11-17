const ex1 = `// A Promise that "orders a pizza" and settles after a delay
function orderPizza(isShopOpen) {
  return new Promise((resolve, reject) => {
    console.log('1. Order placed (executor runs immediately)');
    setTimeout(() => {
      if (isShopOpen) {
        resolve('Margherita pizza');
      } else {
        reject(new Error('Shop is closed'));
      }
    }, 500);
  });
}

const pizzaPromise = orderPizza(true); // executor runs right here
console.log('2. Waiting for pizza...');

pizzaPromise
  .then((pizza) => console.log('3. Received:', pizza))
  .catch((err) => console.log('3. Failed:', err.message))
  .finally(() => console.log('4. Table cleaned (finally always runs)'));`;

const ex2 = `// Chaining: each then() returns a NEW promise
function getUser(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: 'Asha' }), 300));
}
function getOrders(user) {
  return new Promise((resolve) => setTimeout(() => resolve(['Book', 'Pen']), 300));
}

getUser(7)
  .then((user) => {
    console.log('User:', user.name);
    return getOrders(user);          // return a promise -> next then waits for it
  })
  .then((orders) => {
    console.log('Orders:', orders.join(', '));
    return orders.length;            // return a plain value -> wrapped in a promise
  })
  .then((count) => {
    console.log('Count:', count);
    throw new Error('Payment service down'); // throwing -> jumps to catch
  })
  .then(() => console.log('This line is skipped'))
  .catch((err) => console.log('Caught:', err.message))
  .then(() => console.log('Chain continues after catch'));`;

const ex3 = `// Promise.all vs Promise.allSettled
const wait = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));

const tasks = () => [
  wait(300, 'Profile'),
  wait(100, 'Settings'),
  wait(200, 'Photos failed', true),
];

Promise.all(tasks())
  .then((values) => console.log('all:', values))
  .catch((err) => console.log('all rejected with:', err.message));

Promise.allSettled(tasks()).then((results) => {
  results.forEach((r) =>
    console.log('allSettled:', r.status, r.status === 'fulfilled' ? r.value : r.reason.message)
  );
});`;

const ex4 = `// Promise.race vs Promise.any - first one wins
const wait = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));

// race: first SETTLED (success OR failure) wins
Promise.race([wait(200, 'Server A'), wait(50, 'Server B down', true)])
  .then((v) => console.log('race value:', v))
  .catch((e) => console.log('race error:', e.message));

// any: first FULFILLED wins, failures are ignored
Promise.any([wait(200, 'Server A'), wait(50, 'Server B down', true)])
  .then((v) => console.log('any value:', v));

// any: if ALL fail -> AggregateError
Promise.any([wait(10, 'X down', true), wait(20, 'Y down', true)])
  .catch((e) => console.log('any error:', e.constructor.name, e.errors.length));

// Timeout pattern built with race
const timeout = (ms) => wait(ms, 'Request timed out', true);
Promise.race([wait(500, 'Slow data'), timeout(300)])
  .then((v) => console.log(v))
  .catch((e) => console.log('timeout pattern:', e.message));`;

const ex5 = `// Promisify a callback-style function
function readFileCallback(name, callback) {
  setTimeout(() => {
    if (name.endsWith('.txt')) callback(null, 'Contents of ' + name);
    else callback(new Error('Unsupported file: ' + name));
  }, 100);
}

function readFilePromise(name) {
  return new Promise((resolve, reject) => {
    readFileCallback(name, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

readFilePromise('notes.txt')
  .then((data) => {
    console.log(data);
    return readFilePromise('photo.png');
  })
  .then((data) => console.log(data))
  .catch((err) => console.log('Error:', err.message));

// Already-settled promises
Promise.resolve(42).then((v) => console.log('resolved:', v));
Promise.reject(new Error('nope')).catch((e) => console.log('rejected:', e.message));`;

export default {
  id: 'day-31-promises',
  title: 'Promises: Creating, then/catch/finally, Promise.all / allSettled / race / any',
  module: 'Module 5: Asynchronous JavaScript',
  day: 31,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'A Promise is an object that represents a value that will be available later (or an error). Promises replace deeply nested callbacks with flat, readable chains and give us powerful combinators to run many async tasks together.',
  objectives: [
    'Explain what a Promise is and its three states: pending, fulfilled, rejected',
    'Create promises with new Promise(resolve, reject) and consume them with then/catch/finally',
    'Chain promises correctly by returning values or promises from then()',
    'Choose between Promise.all, allSettled, race and any for running tasks in parallel',
    'Convert a callback-based function into a promise-based one (promisify)',
  ],
  theory: [
    {
      heading: 'What is a Promise?',
      content:
        'Think of ordering food at a restaurant counter. You pay and receive a **token**. The food is not ready yet, but the token is a *promise* that you will get either your food or an apology ("sorry, we are out of paneer"). You can go and sit down (do other work) instead of standing at the counter.\n\nA JavaScript **Promise** is exactly that token: an object representing the eventual result of an asynchronous operation.\n\nA promise is always in one of three states:\n- **pending** – the work is still going on\n- **fulfilled** – the work finished successfully and has a **value**\n- **rejected** – the work failed and has a **reason** (usually an Error)\n\nOnce a promise is fulfilled or rejected it is **settled** and can never change again. Calling `resolve` twice, or `reject` after `resolve`, is simply ignored.',
      points: [
        'Promises solve "callback hell" from Day 30 by flattening nested callbacks into a chain',
        'A promise settles only once – its result is immutable',
        'Promise callbacks (then/catch) always run asynchronously, even if the promise is already settled',
      ],
    },
    {
      heading: 'Creating a Promise',
      content:
        'You create a promise with the `Promise` constructor. It takes an **executor** function that receives two functions: `resolve` and `reject`.\n\nThe executor runs **immediately and synchronously** when you call `new Promise(...)`. Inside it you start the async work and later call `resolve(value)` on success or `reject(error)` on failure.\n\nMost of the time you will *consume* promises returned by APIs like `fetch()`, but knowing how to create one helps you wrap old callback APIs (promisify).',
      syntax: `const promise = new Promise((resolve, reject) => {
  // async work here
  if (success) resolve(value);
  else reject(new Error('reason'));
});

// Shortcuts for already-settled promises
Promise.resolve(42);
Promise.reject(new Error('failed'));`,
      tip: 'Always reject with an Error object (reject(new Error("msg"))), not a string. Error objects carry a stack trace, which makes debugging much easier.',
    },
    {
      heading: 'Consuming: then, catch, finally',
      content:
        '- `.then(onFulfilled, onRejected?)` – runs when the promise fulfills; receives the value\n- `.catch(onRejected)` – runs when the promise (or anything earlier in the chain) rejects; same as `.then(null, onRejected)`\n- `.finally(onFinally)` – runs in both cases; receives no argument; good for cleanup like hiding a loading spinner\n\nEvery call to `then`, `catch` or `finally` returns a **new promise**. That is what makes chaining possible.',
      syntax: `doWork()
  .then((value) => { /* success */ })
  .catch((error) => { /* failure */ })
  .finally(() => { /* always */ });`,
      tip: 'Common mistake: forgetting .catch(). An unhandled rejection shows "Uncaught (in promise)" in the console and in Node.js can crash the process.',
    },
    {
      heading: 'Promise Chaining Rules',
      content:
        'What you do inside a `then` callback decides what the next `then` receives:\n\n1. **Return a plain value** → the next then gets that value.\n2. **Return a promise** → the chain waits for it and the next then gets its result.\n3. **Throw an error** → the chain skips all following thens and jumps to the nearest catch.\n4. **Return nothing** → the next then receives `undefined`.\n\nAfter a `catch` handles an error, the chain is "healthy" again, so a following `then` runs normally.',
      tip: 'The #1 chaining bug: forgetting `return` inside then. Without return, the next then does not wait for your inner promise and receives undefined.',
    },
    {
      heading: 'Promise Combinators: all, allSettled, race, any',
      content:
        'When you have several independent async tasks, run them **in parallel** with a combinator. All take an iterable (usually an array) of promises:\n\n- `Promise.all([...])` – waits for **all** to fulfill → array of values in the **same order** as input. **Fails fast**: rejects as soon as any one rejects.\n- `Promise.allSettled([...])` – waits for **all** to settle; never rejects. Gives `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` for each.\n- `Promise.race([...])` – settles like the **first promise to settle** (success or failure). Great for timeouts.\n- `Promise.any([...])` – fulfills with the **first fulfilled** promise; ignores failures. Rejects with an `AggregateError` only if **all** fail.\n\nAnalogy: `all` = a group trip that is cancelled if anyone drops out; `allSettled` = a report card of everyone; `race` = the first runner across the line, even if he fell; `any` = first person to successfully answer the question.',
      points: [
        'Promise.all keeps the input order, not the finishing order',
        'Use allSettled when partial success is acceptable (dashboard widgets)',
        'Use any for redundancy (try several mirror servers)',
      ],
    },
    {
      heading: 'Promisifying Callback APIs',
      content:
        'Older APIs use the Node-style "error-first callback" `(err, data) => {}`. You can wrap them in a promise once and then use them with then/catch (and with async/await, coming next on Day 32).\n\nInside the wrapper: call `reject(err)` if there is an error, otherwise `resolve(data)`. Node.js even ships a helper: `util.promisify`.',
      tip: 'Coming next (Day 32): async/await is syntax built on top of promises – everything you learn today still applies.',
    },
  ],
  examples: [
    {
      title: 'Create and consume a Promise',
      scenario: 'Simulate ordering a pizza that arrives after half a second, handling success, failure and cleanup.',
      steps: [
        'Write a function that returns new Promise((resolve, reject) => ...)',
        'Use setTimeout to simulate the delay and call resolve or reject',
        'Consume it with then, catch and finally',
        'Click Run and watch the order of console messages',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        '1. Order placed (executor runs immediately)\n2. Waiting for pizza...\n3. Received: Margherita pizza\n4. Table cleaned (finally always runs)',
      explanation:
        'The executor runs synchronously, so "1." prints first, then "2." from the main script. After 500 ms resolve() is called, so then() prints "3." and finally() prints "4.". Change orderPizza(true) to orderPizza(false) to see "3. Failed: Shop is closed".',
    },
    {
      title: 'Promise chaining and error propagation',
      scenario: 'Load a user, then their orders, then count them – and see how a thrown error skips steps.',
      steps: [
        'Create two functions that return promises (getUser, getOrders)',
        'Chain them by RETURNING the next promise inside then',
        'Throw an error in the middle of the chain',
        'Add catch and one more then after it, then click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        'User: Asha\nOrders: Book, Pen\nCount: 2\nCaught: Payment service down\nChain continues after catch',
      explanation:
        'Returning getOrders(user) makes the next then wait for it. Returning orders.length passes a plain number. The throw rejects the promise returned by that then, so the next then is skipped and catch handles it. catch returns a fulfilled promise, so the final then runs.',
    },
    {
      title: 'Promise.all vs Promise.allSettled',
      scenario: 'A profile page loads three things in parallel. One of them (Photos) fails.',
      steps: [
        'Create a wait() helper that resolves or rejects after some milliseconds',
        'Pass the same three tasks to Promise.all and Promise.allSettled',
        'Click Run and compare the outputs',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        'all rejected with: Photos failed\nallSettled: fulfilled Profile\nallSettled: fulfilled Settings\nallSettled: rejected Photos failed',
      explanation:
        'Promise.all fails fast: at 200 ms the Photos task rejects, so all() rejects immediately with that error and the other values are lost. allSettled waits for all three (300 ms) and reports every result in the INPUT order, not finishing order.',
    },
    {
      title: 'Promise.race, Promise.any and a timeout pattern',
      scenario: 'Pick the fastest server, ignore failed ones, and cancel waiting after a time limit.',
      steps: [
        'Reuse the wait() helper',
        'Call race and any with the same two promises',
        'Call any with two failing promises to see AggregateError',
        'Build a timeout by racing the real task against a rejecting timer',
        'Click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'any error: AggregateError 2\nrace error: Server B down\nany value: Server A\ntimeout pattern: Request timed out',
      explanation:
        'At 20 ms both X and Y have failed, so any() rejects with AggregateError (errors array has 2 items). At 50 ms Server B rejects – race() settles with that failure, but any() ignores it. At 200 ms Server A fulfills, so any() gives "Server A". At 300 ms the timeout rejects before the 500 ms slow task.',
    },
    {
      title: 'Promisify a callback function',
      scenario: 'Wrap an old error-first callback API so it can be used in a promise chain.',
      steps: [
        'Write a callback-based readFileCallback(name, cb)',
        'Wrap it inside new Promise and call reject/resolve from the callback',
        'Chain two reads and catch the failure',
        'Also try Promise.resolve and Promise.reject, then click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result: 'resolved: 42\nrejected: nope\nContents of notes.txt\nError: Unsupported file: photo.png',
      explanation:
        'Promise.resolve/reject create already-settled promises, so their handlers run as soon as the current script finishes (as microtasks) – before any setTimeout. The file reads take 100 ms each; the second one rejects and the catch prints the error.',
    },
  ],
  interview: [
    {
      q: 'What is a Promise in JavaScript?',
      a: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation and its resulting value. It starts as pending and settles once, either fulfilled with a value or rejected with a reason.',
      level: 'Easy',
    },
    {
      q: 'What are the states of a Promise?',
      a: 'pending (initial), fulfilled (resolve was called) and rejected (reject was called or an error was thrown). Fulfilled and rejected are together called "settled". A settled promise never changes state.',
      level: 'Easy',
    },
    {
      q: 'Does the executor function of new Promise run synchronously or asynchronously?',
      a: 'Synchronously. new Promise(fn) calls fn immediately. Only the then/catch/finally callbacks run asynchronously (as microtasks).\n\nnew Promise(() => console.log("A"));\nconsole.log("B");\n// A, B',
      level: 'Medium',
    },
    {
      q: 'What is the difference between Promise.all and Promise.allSettled?',
      a: 'Promise.all resolves with an array of values when ALL promises fulfill, but rejects immediately (fail-fast) if any one rejects. Promise.allSettled never rejects; it waits for every promise and returns an array of {status, value} or {status, reason} objects.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between Promise.race and Promise.any?',
      a: 'race settles with the first promise that SETTLES, whether fulfilled or rejected. any fulfills with the first promise that FULFILLS, ignoring rejections; it rejects with an AggregateError only when all promises reject.',
      level: 'Medium',
    },
    {
      q: 'What happens if you forget to return a promise inside .then()?',
      a: 'The next .then() does not wait for the inner promise; it runs immediately with undefined. The inner promise becomes "floating" and its errors are not caught by the chain\'s catch.',
      level: 'Medium',
    },
    {
      q: 'What does .finally() receive and return?',
      a: 'finally receives no arguments (it does not know whether the promise succeeded). It passes the original value or error through to the next handler, unless the finally callback itself throws or returns a rejected promise.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nPromise.resolve(1).then(x => x + 1).then(x => { throw new Error(x) }).catch(e => e.message).then(console.log);',
      a: '"2". 1 → then makes 2 → the throw creates an Error with message "2" → catch returns e.message ("2") as a normal value → the last then logs 2.',
      level: 'Hard',
    },
    {
      q: 'How would you implement a timeout for a promise?',
      a: 'Race the promise against a timer promise that rejects:\nconst withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), ms))]);',
      level: 'Hard',
    },
    {
      q: 'How do you convert a callback-based function into a promise-based one?',
      a: 'Wrap it in new Promise and call reject/resolve from inside the callback:\nconst p = (arg) => new Promise((res, rej) => fn(arg, (err, data) => err ? rej(err) : res(data)));\nIn Node.js you can use util.promisify(fn).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a function delay(ms) that returns a promise which resolves after ms milliseconds. Use it to log "Start", wait 1 second, then log "Done".',
      hint: 'resolve is a function – pass it directly to setTimeout.',
      solution: `const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log('Start');
delay(1000).then(() => console.log('Done'));`,
    },
    {
      task: 'Create a function checkAge(age) that returns a promise: resolves with "Access granted" if age >= 18, otherwise rejects with an Error "Too young". Test with 20 and 15.',
      hint: 'Decide inside the executor and call resolve or reject.',
      solution: `function checkAge(age) {
  return new Promise((resolve, reject) => {
    if (age >= 18) resolve('Access granted');
    else reject(new Error('Too young'));
  });
}

checkAge(20).then(console.log).catch((e) => console.log(e.message));
checkAge(15).then(console.log).catch((e) => console.log(e.message));`,
    },
    {
      task: 'Using Promise.all, fetch posts 1, 2 and 3 from https://jsonplaceholder.typicode.com/posts/ID in parallel and log their titles.',
      hint: 'Build an array of fetch(...).then(r => r.json()) promises with map.',
      solution: `const ids = [1, 2, 3];
const requests = ids.map((id) =>
  fetch('https://jsonplaceholder.typicode.com/posts/' + id).then((r) => r.json())
);

Promise.all(requests)
  .then((posts) => posts.forEach((p) => console.log(p.id, p.title)))
  .catch((err) => console.log('Failed:', err.message));`,
    },
    {
      task: 'Write withTimeout(promise, ms) that rejects with "Timeout" if the promise does not settle within ms. Test with a 2-second task and a 1-second limit.',
      hint: 'Promise.race with a rejecting timer.',
      solution: `const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms));
  return Promise.race([promise, timer]);
}

withTimeout(delay(2000, 'data'), 1000)
  .then(console.log)
  .catch((e) => console.log(e.message)); // Timeout`,
    },
    {
      task: 'Three mirror servers respond after 300, 100 and 200 ms, but the 100 ms one fails. Use Promise.any to get the first successful response.',
      hint: 'Create two resolving and one rejecting promise.',
      solution: `const server = (name, ms, ok) => new Promise((res, rej) =>
  setTimeout(() => (ok ? res(name) : rej(new Error(name + ' failed'))), ms));

Promise.any([server('A', 300, true), server('B', 100, false), server('C', 200, true)])
  .then((winner) => console.log('Using server', winner)); // Using server C`,
    },
  ],
  quiz: [
    {
      question: 'Which state is a Promise in right after it is created and before resolve/reject is called?',
      options: ['fulfilled', 'pending', 'settled', 'rejected'],
      answer: 1,
      explanation: 'Every promise starts as pending.',
    },
    {
      question: 'Promise.all([p1, p2, p3]) – p2 rejects. What happens?',
      options: [
        'It waits for p1 and p3, then resolves',
        'It resolves with [p1, undefined, p3]',
        'It ignores p2',
        'It rejects immediately with p2\'s reason',
      ],
      answer: 3,
      explanation: 'Promise.all is fail-fast: the first rejection rejects the whole thing.',
    },
    {
      question: 'Which combinator never rejects?',
      options: ['Promise.allSettled', 'Promise.all', 'Promise.race', 'Promise.any'],
      answer: 0,
      explanation: 'allSettled always fulfills with an array of status objects.',
    },
    {
      question: 'What does Promise.any reject with when every promise rejects?',
      options: ['The first error', 'The last error', 'An AggregateError', 'undefined'],
      answer: 2,
      explanation: 'AggregateError has an errors array containing all rejection reasons.',
    },
    {
      question: 'What will the next .then receive if the previous .then callback has no return statement?',
      options: ['The same value again', 'null', 'An error', 'undefined'],
      answer: 3,
      explanation: 'A function without return returns undefined, so the next promise is fulfilled with undefined.',
    },
  ],
};
