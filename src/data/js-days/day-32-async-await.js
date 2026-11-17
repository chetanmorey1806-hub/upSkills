const ex1 = `// Same task written with then() and with async/await
const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

function withThen() {
  return delay(200, 'Asha').then((name) => {
    console.log('then version got:', name);
    return name.length;
  });
}

async function withAwait() {
  const name = await delay(300, 'Ravi');   // pauses THIS function only
  console.log('await version got:', name);
  return name.length;                       // becomes the resolved value
}

console.log('Start');
const p = withAwait();
console.log('withAwait() returned a', p instanceof Promise ? 'Promise' : typeof p);
withThen().then((len) => console.log('then length:', len));
p.then((len) => console.log('await length:', len));
console.log('End of script (nothing was blocked)');`;

const ex2 = `// Error handling with try / catch / finally
const fakeLogin = (user, pass) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (pass === 'secret') resolve({ user, token: 'abc123' });
      else reject(new Error('Invalid password'));
    }, 200));

async function login(user, pass) {
  console.log('Loading... (' + user + ')');
  try {
    const session = await fakeLogin(user, pass);
    console.log('Welcome', session.user, '- token', session.token);
    return true;
  } catch (err) {
    console.log('Login failed:', err.message);
    return false;
  } finally {
    console.log('Hide spinner for', user);
  }
}

async function main() {
  const ok1 = await login('asha', 'secret');
  const ok2 = await login('ravi', 'wrong');
  console.log('Results:', ok1, ok2);
}
main();`;

const ex3 = `// Sequential vs parallel awaits
const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function sequential() {
  const start = Date.now();
  const a = await delay(300, 'A');   // wait 300ms
  const b = await delay(300, 'B');   // THEN wait another 300ms
  const ms = Date.now() - start;
  console.log('sequential:', a + b, ms >= 590 ? '~600ms' : ms + 'ms');
}

async function parallel() {
  const start = Date.now();
  // start both first, then await together
  const [a, b] = await Promise.all([delay(300, 'A'), delay(300, 'B')]);
  const ms = Date.now() - start;
  console.log('parallel:', a + b, ms < 450 ? '~300ms' : ms + 'ms');
}

async function main() {
  await sequential();
  await parallel();
}
main();`;

const ex4 = `// Real API: fetch a user and then their posts with async/await
async function loadUserWithPosts(userId) {
  try {
    const userRes = await fetch('https://jsonplaceholder.typicode.com/users/' + userId);
    if (!userRes.ok) throw new Error('User request failed: ' + userRes.status);
    const user = await userRes.json();

    const postsRes = await fetch('https://jsonplaceholder.typicode.com/posts?userId=' + userId);
    const posts = await postsRes.json();

    console.log(user.name + ' has written ' + posts.length + ' posts');
    console.log('First post:', posts[0].title);
  } catch (err) {
    console.log('Something went wrong:', err.message);
  }
}

loadUserWithPosts(1);`;

const ex5 = `// await inside loops: for...of waits, forEach does NOT
const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const ids = [3, 1, 2];

async function withForOf() {
  for (const id of ids) {
    const v = await delay(id * 50, id);
    console.log('for...of got', v);
  }
  console.log('for...of finished');
}

async function withForEach() {
  ids.forEach(async (id) => {
    const v = await delay(id * 50, id);
    console.log('forEach got', v);
  });
  console.log('forEach "finished" (too early!)');
}

async function main() {
  await withForOf();
  await withForEach();
}
main();`;

export default {
  id: 'day-32-async-await',
  title: 'async / await',
  module: 'Module 5: Asynchronous JavaScript',
  day: 32,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'async/await is cleaner syntax on top of promises that lets you write asynchronous code that reads like normal top-to-bottom code. You will learn how it works, how to handle errors with try/catch, and how to avoid making parallel work accidentally sequential.',
  objectives: [
    'Declare async functions and understand that they always return a promise',
    'Use await to pause an async function until a promise settles',
    'Handle errors with try/catch/finally in async code',
    'Run independent tasks in parallel with await Promise.all',
    'Avoid the common forEach + await mistake',
  ],
  theory: [
    {
      heading: 'Why async / await?',
      content:
        'Promise chains (Day 31) are better than callbacks, but long chains of `.then()` still look different from normal code. **async/await** (ES2017) lets you write:\n\n`const user = await getUser();`\n\ninstead of `getUser().then(user => ...)`.\n\nAnalogy: you put a kettle on and say "I will **await** the whistle". You (this one task) wait, but the rest of the house (the browser, other code) keeps running. await never freezes the whole program – it only pauses the current async function.',
      points: [
        'async/await is syntax sugar – underneath it is still promises',
        'Code reads top-to-bottom like synchronous code',
        'Errors are handled with the familiar try/catch',
      ],
    },
    {
      heading: 'The async keyword',
      content:
        'Putting `async` before a function does two things:\n\n1. The function **always returns a promise**. If you `return 5`, the caller gets `Promise<5>`. If you `throw`, the caller gets a rejected promise.\n2. You are allowed to use `await` inside it.\n\nAll function forms can be async: declarations, expressions, arrow functions and object/class methods.',
      syntax: `async function getData() { return 5; }
const getData2 = async () => 5;
const obj = { async load() { return 5; } };

getData().then((v) => console.log(v)); // 5`,
      tip: 'Calling an async function without await or .then() gives you a Promise object, not the value. Logging it shows "Promise {<pending>}".',
    },
    {
      heading: 'The await keyword',
      content:
        '`await promise` pauses the async function until the promise settles:\n- If it **fulfills**, await gives you the value.\n- If it **rejects**, await **throws** the reason, just like a `throw` statement.\n\nWhile the function is paused, JavaScript continues running other code (the caller, timers, clicks). When the promise settles, the function resumes from where it stopped.\n\n`await` can only be used inside an async function, or at the **top level of an ES module** (top-level await, covered on Day 35).',
      syntax: `async function show() {
  const response = await fetch(url);  // wait for headers
  const data = await response.json(); // wait for body
  console.log(data);
}`,
      tip: 'await on a non-promise value (await 5) just gives 5 back, but still yields once to the microtask queue.',
    },
    {
      heading: 'Error Handling with try / catch / finally',
      content:
        'Because a rejected promise makes `await` throw, you handle errors with a normal `try/catch` block (you learned try/catch on Day 29).\n\n- **try** – the awaited operations\n- **catch** – runs if any await inside try rejects (or any code throws)\n- **finally** – cleanup that always runs, like hiding a loading spinner\n\nYou can also handle errors at the call site: `loadData().catch(handleError)`, because an async function returns a promise.',
      syntax: `async function load() {
  try {
    const data = await getData();
    show(data);
  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}`,
      tip: 'An async function with no try/catch whose caller also has no .catch() produces an "Unhandled promise rejection". Always handle errors somewhere.',
    },
    {
      heading: 'Sequential vs Parallel',
      content:
        'Each `await` waits before moving to the next line. If two tasks do **not depend on each other**, awaiting them one by one wastes time:\n\n- Sequential: `await a(); await b();` → total time = a + b\n- Parallel: `await Promise.all([a(), b()])` → total time = max(a, b)\n\nUse sequential only when the second task needs the result of the first (e.g. fetch user, then fetch that user\'s posts).',
      syntax: `// slow (sequential)
const users = await getUsers();
const products = await getProducts();

// fast (parallel)
const [users2, products2] = await Promise.all([getUsers(), getProducts()]);`,
    },
    {
      heading: 'await in Loops',
      content:
        '- `for...of` (and normal `for`) with `await` inside processes items **one after another**, and the loop really waits.\n- `array.forEach(async item => { await ... })` does **not** wait. forEach ignores the promises returned by the callback, so the code after forEach runs immediately.\n- To process all items in parallel and wait for all: `await Promise.all(items.map(async item => ...))`.',
      tip: 'Interview favourite: "Why doesn\'t await work inside forEach?" – because forEach does not await the promise its callback returns. Use for...of or Promise.all + map.',
    },
  ],
  examples: [
    {
      title: 'then() vs async/await side by side',
      scenario: 'Compare the same operation written both ways and prove that await does not block the rest of the script.',
      steps: [
        'Create a delay() helper that returns a promise',
        'Write withThen() using .then() and withAwait() using async/await',
        'Call both and log around them',
        'Click Run and read the order of messages',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        'Start\nwithAwait() returned a Promise\nEnd of script (nothing was blocked)\nthen version got: Asha\nthen length: 4\nawait version got: Ravi\nawait length: 4',
      explanation:
        'Calling withAwait() immediately returns a pending Promise; the function pauses at await and the script continues to "End of script". After 200 ms the then version resolves, after 300 ms the await version resumes. Both return the name length, which callers receive via then().',
    },
    {
      title: 'try / catch / finally with await',
      scenario: 'A login form that shows a loading message, handles a wrong password and always hides the spinner.',
      steps: [
        'Create fakeLogin() that resolves for password "secret" and rejects otherwise',
        'Write async login() with try/catch/finally',
        'Call it twice from an async main() using await',
        'Click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        'Loading... (asha)\nWelcome asha - token abc123\nHide spinner for asha\nLoading... (ravi)\nLogin failed: Invalid password\nHide spinner for ravi\nResults: true false',
      explanation:
        'For asha the await resolves, so the try block finishes and finally runs. For ravi the promise rejects, await throws, catch logs the message, then finally still runs. Because main awaits each login, they run one after the other.',
    },
    {
      title: 'Sequential vs parallel awaits',
      scenario: 'Measure how long two independent 300 ms tasks take when awaited one by one vs with Promise.all.',
      steps: [
        'Write sequential() with two awaits in a row',
        'Write parallel() with await Promise.all([...])',
        'Measure with Date.now() and click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result: 'sequential: AB ~600ms\nparallel: AB ~300ms',
      explanation:
        'In sequential() the second delay only starts after the first finishes (300 + 300). In parallel() both timers start at the same moment, and Promise.all waits for the slowest one (300).',
    },
    {
      title: 'Fetching real data with async/await',
      scenario: 'Load a user from JSONPlaceholder, then load that user\'s posts (a dependent, sequential request).',
      steps: [
        'Write an async function with try/catch',
        'await fetch() the user, check response.ok, await response.json()',
        'Use the user id to fetch posts',
        'Click Run (needs internet)',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'Leanne Graham has written 10 posts\nFirst post: sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      explanation:
        'Each await waits for a network step. The posts request depends on the user id, so sequential awaits are correct here. fetch only rejects on network failure, so we throw manually when response.ok is false (more on Day 33).',
    },
    {
      title: 'await inside for...of vs forEach',
      scenario: 'Process a list of ids with awaits and see why forEach does not wait.',
      steps: [
        'Loop the ids with for...of and await inside',
        'Loop the same ids with forEach(async ...)',
        'Click Run and compare when "finished" is printed',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        'for...of got 3\nfor...of got 1\nfor...of got 2\nfor...of finished\nforEach "finished" (too early!)\nforEach got 1\nforEach got 2\nforEach got 3',
      explanation:
        'for...of waits for each delay in order (3, 1, 2) and only then prints "finished". forEach starts all three async callbacks at once and does not wait, so "finished" prints first; the results then arrive in order of their delays (50, 100, 150 ms).',
    },
  ],
  interview: [
    {
      q: 'What does an async function return?',
      a: 'Always a Promise. A returned value becomes the fulfilled value; a thrown error becomes the rejection reason.',
      level: 'Easy',
    },
    {
      q: 'Does await block the main thread?',
      a: 'No. await only pauses the async function it is in. The function\'s remaining code is scheduled to continue when the promise settles; meanwhile the event loop keeps running other code, rendering and events.',
      level: 'Easy',
    },
    {
      q: 'How do you handle errors with async/await?',
      a: 'Wrap awaits in try/catch (and optionally finally). Alternatively, attach .catch() to the promise returned by the async function when calling it.',
      level: 'Easy',
    },
    {
      q: 'Can you use await outside an async function?',
      a: 'Only at the top level of an ES module (top-level await, ES2022). In a normal script or a regular function it is a SyntaxError.',
      level: 'Medium',
    },
    {
      q: 'Why does await not work as expected inside forEach?',
      a: 'forEach calls the async callback but ignores the promise it returns, so it does not wait. Code after forEach runs immediately. Use for...of for sequential processing or await Promise.all(arr.map(async x => ...)) for parallel.',
      level: 'Medium',
    },
    {
      q: 'How do you run two independent async calls in parallel with async/await?',
      a: 'Start both and await them together:\nconst [a, b] = await Promise.all([getA(), getB()]);\nAwaiting them one after another would double the time.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nasync function f() { console.log(1); await null; console.log(2); }\nf(); console.log(3);',
      a: '1, 3, 2. The body of f runs synchronously until the first await, logging 1. await yields, so 3 is logged by the caller, then the rest of f (logging 2) runs as a microtask.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between return await promise and return promise inside an async function?',
      a: 'Inside try/catch, return await lets the catch block handle a rejection; plain return passes the promise out so the local catch does NOT see the error. Outside try/catch they behave the same.',
      level: 'Hard',
    },
    {
      q: 'Is async/await a replacement for promises?',
      a: 'No, it is built on promises. await consumes promises, async functions produce promises, and combinators like Promise.all are still used with await.',
      level: 'Easy',
    },
    {
      q: 'What happens if an awaited promise never settles?',
      a: 'The async function stays paused forever; code after that await never runs. That is why timeouts (Promise.race with a timer, or AbortController for fetch) are important.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Rewrite this chain using async/await with try/catch: getUser().then(u => getOrders(u.id)).then(o => console.log(o)).catch(e => console.log(e.message));',
      hint: 'Two awaits inside try.',
      solution: `const getUser = () => Promise.resolve({ id: 1 });
const getOrders = (id) => Promise.resolve(['order-' + id]);

async function show() {
  try {
    const u = await getUser();
    const o = await getOrders(u.id);
    console.log(o);
  } catch (e) {
    console.log(e.message);
  }
}
show();`,
    },
    {
      task: 'Write an async function countdown(n) that logs n, n-1, ... 1 with one second between numbers, then logs "Go!".',
      hint: 'A for loop with await delay(1000) inside.',
      solution: `const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function countdown(n) {
  for (let i = n; i >= 1; i--) {
    console.log(i);
    await delay(1000);
  }
  console.log('Go!');
}
countdown(3);`,
    },
    {
      task: 'Fetch users 1, 2 and 3 from JSONPlaceholder in parallel using async/await and log their names.',
      hint: 'await Promise.all(ids.map(async id => ...))',
      solution: `async function loadUsers() {
  const ids = [1, 2, 3];
  const users = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch('https://jsonplaceholder.typicode.com/users/' + id);
      return res.json();
    })
  );
  users.forEach((u) => console.log(u.name));
}
loadUsers();`,
    },
    {
      task: 'Write retry(fn, attempts) that calls an async fn and retries it up to attempts times if it throws, then rethrows the last error.',
      hint: 'A for loop with try/catch inside; return on success.',
      solution: `async function retry(fn, attempts) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.log('Attempt ' + i + ' failed');
    }
  }
  throw lastError;
}

let calls = 0;
const flaky = async () => { calls++; if (calls < 3) throw new Error('fail'); return 'ok'; };
retry(flaky, 5).then((v) => console.log('Result:', v));`,
    },
  ],
  quiz: [
    {
      question: 'What does async function f() { return 10; } f() return?',
      options: ['10', 'undefined', 'A Promise that resolves to 10', 'An error'],
      answer: 2,
      explanation: 'async functions always wrap their return value in a promise.',
    },
    {
      question: 'What does await do when the promise rejects?',
      options: ['Returns undefined', 'Throws the rejection reason', 'Retries automatically', 'Ignores it'],
      answer: 1,
      explanation: 'A rejected await behaves like a throw statement, so use try/catch.',
    },
    {
      question: 'Which is the fastest way to await two independent requests?',
      options: [
        'await Promise.all([a(), b()])',
        'await a(); await b();',
        'a().then(b)',
        'Use forEach with await',
      ],
      answer: 0,
      explanation: 'Promise.all runs them concurrently, so the total time is the slower of the two.',
    },
    {
      question: 'Where can await be used?',
      options: [
        'Anywhere in any script',
        'Only inside loops',
        'Only inside callbacks',
        'Inside async functions and at the top level of ES modules',
      ],
      answer: 3,
      explanation: 'Top-level await works in modules; otherwise await needs an async function.',
    },
    {
      question: 'Which loop correctly waits for each await before continuing?',
      options: ['arr.forEach(async ...)', 'arr.map without Promise.all', 'for...of', 'None of them'],
      answer: 2,
      explanation: 'for...of (or a classic for loop) inside an async function waits on each await.',
    },
  ],
};
