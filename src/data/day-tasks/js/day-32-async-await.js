export default {
  lesson: 'day-32-async-await',
  minutes: 35,
  intro: 'Write async functions with await, handle errors with try/catch, and run independent work in parallel.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does an `async` function always return?',
      options: ['Whatever value you return, unchanged', 'A Promise', 'undefined', 'A callback'],
      answer: 1,
      explain: 'An async function **always returns a promise**. `return 5` becomes a promise fulfilled with 5, and a `throw` becomes a rejected promise. That is why callers must `await` it or use `.then`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `async function getCity() {
  console.log("B");
  const city = await Promise.resolve("Pune");
  console.log("D " + city);
  return city;
}
console.log("A");
getCity().then((c) => console.log("E " + c));
console.log("C");`,
      expected: 'A\nB\nC\nD Pune\nE Pune',
      explain: 'An async function runs **synchronously until the first await**, so "B" prints right after "A". At `await` it pauses and lets the outer code continue ("C"). It resumes afterwards ("D"), and finally the `.then` runs.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Rewrite with async/await. `fetchStudent(id)` and `fetchMarks(student)` are given (they return promises). Write `async function report(id)` that awaits both and returns `"<name>: <marks>"`.',
      example: { title: 'await step by step', code: 'async function show() {\n  const user = await getUser(1);\n  const posts = await getPosts(user.id);\n  return posts.length;\n}' },
      starter: 'const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nfunction fetchStudent(id) { return wait(10, { id, name: id === 1 ? "Asha" : "Ravi" }); }\nfunction fetchMarks(student) { return wait(10, student.id === 1 ? 91 : 67); }\n\nasync function report(id) {\n  // TODO\n}',
      solution: 'const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nfunction fetchStudent(id) { return wait(10, { id, name: id === 1 ? "Asha" : "Ravi" }); }\nfunction fetchMarks(student) { return wait(10, student.id === 1 ? 91 : 67); }\n\nasync function report(id) {\n  const student = await fetchStudent(id);\n  const marks = await fetchMarks(student);\n  return `${student.name}: ${marks}`;\n}',
      tests: [
        { call: 'report(1)', expect: 'Asha: 91' },
        { call: 'report(2)', expect: 'Ravi: 67' },
      ],
      explain: '`await` unwraps the promise into its value, so the code reads top to bottom like normal code. Forgetting `await` gives you a Promise object, and `student.name` would be undefined.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Error handling. `payBill(amount)` rejects for amounts above 5000. Write `async function checkout(amount)` that uses **try/catch/finally**:\n- on success return `"Paid ₹<amount>"`\n- on failure return `"Payment failed: <message>"`\n- in `finally`, increase the global counter `attempts` by 1',
      example: { title: 'try / catch with await', code: 'try {\n  const data = await loadData();\n} catch (err) {\n  console.log(err.message);\n} finally {\n  hideSpinner();\n}' },
      starter: 'let attempts = 0;\nfunction payBill(amount) {\n  return new Promise((res, rej) => setTimeout(() => (amount > 5000 ? rej(new Error("Limit exceeded")) : res(amount)), 10));\n}\n\nasync function checkout(amount) {\n  // TODO\n}',
      solution: 'let attempts = 0;\nfunction payBill(amount) {\n  return new Promise((res, rej) => setTimeout(() => (amount > 5000 ? rej(new Error("Limit exceeded")) : res(amount)), 10));\n}\n\nasync function checkout(amount) {\n  try {\n    const paid = await payBill(amount);\n    return `Paid ₹${paid}`;\n  } catch (err) {\n    return "Payment failed: " + err.message;\n  } finally {\n    attempts++;\n  }\n}',
      tests: [
        { call: 'checkout(1200)', expect: 'Paid ₹1200' },
        { call: 'checkout(9000)', expect: 'Payment failed: Limit exceeded' },
        { call: 'checkout(10).then(() => checkout(99999)).then(() => attempts)', expect: 2, msg: 'finally runs after success and after failure' },
      ],
      explain: 'A rejected promise that you `await` **throws** at that line, so a normal try/catch handles it. `finally` is the right place for clean-up like hiding a loading spinner, because it runs either way.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Sequential vs parallel. `getPrice(item)` takes 100 ms each. Write `async function totalPrice(items)` that fetches **all prices in parallel** with `await Promise.all(...)` and returns their sum.\n\nThe test checks (using the `events` log) that **all five lookups start before any of them finishes**.',
      example: { title: 'start first, await together', code: 'const [user, orders] = await Promise.all([getUser(), getOrders()]);' },
      starter: 'const PRICES = { pen: 10, book: 250, bag: 900, cap: 199, bottle: 349 };\nconst events = []; // records when each lookup starts and finishes\nconst getPrice = (item) => {\n  events.push("start " + item);\n  return new Promise((r) => setTimeout(() => { events.push("end " + item); r(PRICES[item]); }, 100));\n};\n\nasync function totalPrice(items) {\n  let total = 0;\n  for (const item of items) {\n    total += await getPrice(item); // TODO: this is sequential, make it parallel\n  }\n  return total;\n}',
      solution: 'const PRICES = { pen: 10, book: 250, bag: 900, cap: 199, bottle: 349 };\nconst events = []; // records when each lookup starts and finishes\nconst getPrice = (item) => {\n  events.push("start " + item);\n  return new Promise((r) => setTimeout(() => { events.push("end " + item); r(PRICES[item]); }, 100));\n};\n\nasync function totalPrice(items) {\n  const prices = await Promise.all(items.map(getPrice));\n  return prices.reduce((s, p) => s + p, 0);\n}',
      tests: [
        { call: 'totalPrice(["pen", "book"])', expect: 260 },
        { call: 'totalPrice(["pen", "book", "bag", "cap", "bottle"]).then(() => events.slice(0, 5).every((e) => e.startsWith("start")))', expect: true, msg: 'All five lookups start before any finishes (parallel)' },
      ],
      explain: 'Awaiting inside a loop waits for each request before starting the next (5 × 100 ms). When the requests do not depend on each other, start them all with `map` and `await Promise.all` (about 100 ms total).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The forEach + await mistake. What is printed?',
      code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function sendAll() {
  [1, 2].forEach(async (n) => {
    await wait(10);
    console.log("sent " + n);
  });
  console.log("all done?");
}
sendAll();`,
      expected: 'all done?\nsent 1\nsent 2',
      explain: '`forEach` does not wait for async callbacks; it fires them and moves on, so "all done?" prints first. Use `for...of` with `await` (sequential) or `await Promise.all(arr.map(...))` (parallel) instead.',
    },
  ],
};
