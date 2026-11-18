export default {
  lesson: 'day-31-promises',
  minutes: 35,
  intro: 'Create promises, consume them with then/catch/finally, chain them and run tasks in parallel with Promise.all and friends.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What are the three states of a Promise?',
      options: ['start, running, end', 'pending, fulfilled, rejected', 'waiting, done, failed, cancelled', 'open, resolved, closed'],
      answer: 1,
      explain: 'A promise starts **pending** and settles once: either **fulfilled** (with a value) or **rejected** (with a reason). After settling it never changes again.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Promise chaining and error propagation. What is printed?',
      code: `Promise.resolve(2)
  .then((n) => n * 5)
  .then((n) => {
    if (n > 5) throw new Error("too big: " + n);
    return n;
  })
  .then((n) => console.log("never", n))
  .catch((err) => console.log(err.message))
  .finally(() => console.log("done"));`,
      expected: 'too big: 10\ndone',
      explain: 'Each `then` receives what the previous one **returned**. A `throw` inside then rejects the chain, skips the remaining thens and jumps to the nearest `catch`. `finally` runs in both cases.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `delay(ms, value)` that returns a **Promise** which resolves with `value` after `ms` milliseconds.',
      example: { title: 'creating a promise', code: 'const coin = new Promise((resolve, reject) => {\n  Math.random() > 0.5 ? resolve("heads") : reject(new Error("tails"));\n});' },
      starter: 'function delay(ms, value) {\n  // TODO: return new Promise(...)\n}',
      solution: 'function delay(ms, value) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(value), ms);\n  });\n}',
      tests: [
        { call: 'delay(20, "ready")', expect: 'ready' },
        { call: 'delay(10, 42).then((v) => v + 1)', expect: 43 },
        { call: 'delay(10, 1) instanceof Promise', expect: true, msg: 'Returns a Promise' },
      ],
      explain: 'The executor receives `resolve` and `reject`; call `resolve(value)` when the work finishes. A common mistake is `return value` inside setTimeout: that value goes nowhere, the promise stays pending forever.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `placeOrder(item, stock)` that returns a promise which (after 10 ms):\n- **resolves** with `"Order placed: <item>"` if `stock[item] > 0`\n- **rejects** with `new Error("<item> is out of stock")` otherwise\n\nThen write `orderMessage(item, stock)` that uses `.then`/`.catch` and returns a promise for the success text or the error message.',
      example: { title: 'then / catch', code: 'getMarks()\n  .then((m) => "Marks: " + m)\n  .catch((err) => "Failed: " + err.message);' },
      starter: 'function placeOrder(item, stock) {\n  // TODO\n}\n\nfunction orderMessage(item, stock) {\n  // TODO\n}',
      solution: 'function placeOrder(item, stock) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (stock[item] > 0) resolve("Order placed: " + item);\n      else reject(new Error(item + " is out of stock"));\n    }, 10);\n  });\n}\n\nfunction orderMessage(item, stock) {\n  return placeOrder(item, stock)\n    .then((msg) => msg)\n    .catch((err) => err.message);\n}',
      tests: [
        { call: 'orderMessage("phone", { phone: 3 })', expect: 'Order placed: phone' },
        { call: 'orderMessage("laptop", { laptop: 0 })', expect: 'laptop is out of stock' },
        { call: 'placeOrder("tv", {}).then(() => "resolved", (e) => e instanceof Error)', expect: true, msg: 'placeOrder rejects with an Error object' },
      ],
      explain: 'Reject with an `Error` object (not a plain string) so callers get a message and a stack trace. `catch` returns a normal value, which turns the chain back into a fulfilled promise.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Load a dashboard in parallel. `fetchMarks(name)` is given (it returns a promise). Write `classTotal(names)` that starts all requests at once with **Promise.all** and resolves with the **sum** of all marks.',
      example: { title: 'Promise.all', code: 'Promise.all([p1, p2, p3]).then(([a, b, c]) => a + b + c);' },
      starter: 'const MARKS = { Asha: 88, Ravi: 72, Meena: 95 };\nfunction fetchMarks(name) {\n  return new Promise((res) => setTimeout(() => res(MARKS[name]), 10));\n}\n\nfunction classTotal(names) {\n  // TODO\n}',
      solution: 'const MARKS = { Asha: 88, Ravi: 72, Meena: 95 };\nfunction fetchMarks(name) {\n  return new Promise((res) => setTimeout(() => res(MARKS[name]), 10));\n}\n\nfunction classTotal(names) {\n  return Promise.all(names.map(fetchMarks)).then((marks) =>\n    marks.reduce((sum, m) => sum + m, 0)\n  );\n}',
      tests: [
        { call: 'classTotal(["Asha", "Ravi", "Meena"])', expect: 255 },
        { call: 'classTotal(["Ravi"])', expect: 72 },
        { call: 'classTotal([])', expect: 0 },
      ],
      explain: '`names.map(fetchMarks)` starts every request immediately and gives an array of promises; `Promise.all` waits for all and keeps the **same order** as the input. If any one rejects, Promise.all rejects (use allSettled when you need every result).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You send SMS to 100 students and want a report of **which succeeded and which failed**, even if some fail. Which combinator fits?',
      options: ['Promise.all', 'Promise.allSettled', 'Promise.race', 'Promise.any'],
      answer: 1,
      explain: '`allSettled` waits for every promise and gives `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` for each. `all` stops at the first failure, `race` takes the first to settle, `any` the first to succeed.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Promisify a callback API. `getWeather(city, cb)` uses an error-first callback. Write `getWeatherAsync(city)` that returns a Promise: resolve with the data, reject with the error.',
      example: { title: 'wrapping a callback', code: 'function waitAsync(ms) {\n  return new Promise((resolve) => wait(ms, resolve));\n}' },
      starter: 'function getWeather(city, cb) {\n  setTimeout(() => {\n    if (!city) cb(new Error("City required"));\n    else cb(null, city + ": 31°C");\n  }, 10);\n}\n\nfunction getWeatherAsync(city) {\n  // TODO\n}',
      solution: 'function getWeather(city, cb) {\n  setTimeout(() => {\n    if (!city) cb(new Error("City required"));\n    else cb(null, city + ": 31°C");\n  }, 10);\n}\n\nfunction getWeatherAsync(city) {\n  return new Promise((resolve, reject) => {\n    getWeather(city, (err, data) => {\n      if (err) reject(err);\n      else resolve(data);\n    });\n  });\n}',
      tests: [
        { call: 'getWeatherAsync("Chennai")', expect: 'Chennai: 31°C' },
        { call: 'getWeatherAsync("").catch((e) => "caught " + e.message)', expect: 'caught City required' },
      ],
      explain: 'Inside the executor, call the old function and translate its callback: error → `reject`, data → `resolve`. Node offers `util.promisify` for exactly this pattern.',
    },
  ],
};
