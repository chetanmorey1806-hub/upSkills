export default {
  id: 'day-29-error-handling',
  title: 'Error Handling: try/catch/finally, throw, Custom Errors',
  module: 'Module 5: Asynchronous JavaScript',
  day: 29,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Errors happen: bad user input, broken JSON, missing data, network failures. Instead of letting the program crash, you can catch errors, show helpful messages and clean up. Today you learn try/catch/finally, the Error object and built-in error types, throwing your own errors, and creating custom error classes - the foundation for handling async errors in the next days.',
  objectives: [
    'Explain the difference between syntax errors and runtime exceptions',
    'Use try, catch and finally, including the order in which they run with return',
    'Read the Error object (name, message, stack, cause) and know built-in types (TypeError, ReferenceError, RangeError, SyntaxError)',
    'Throw errors with throw new Error() to validate inputs and stop bad states early',
    'Create custom error classes and handle different errors differently with instanceof',
  ],
  theory: [
    {
      heading: 'What is an Error (Exception)?',
      content: "An **error** (or **exception**) is a problem that happens while code is running. When one is **thrown** and not caught, JavaScript stops running the current script and prints a red message in the console.\n\nTwo kinds:\n- **Syntax errors**: the code is not valid JavaScript (missing bracket). The engine cannot even start running that script, so `try/catch` in the same script cannot catch them.\n- **Runtime errors**: the code is valid but something goes wrong while running: calling `undefined()`, reading a property of `null`, `JSON.parse('oops')`.\n\nAnalogy: a try/catch is a safety net under a trapeze artist. The act (code) still might fail, but the show (your app) does not end.",
    },
    {
      heading: 'try...catch...finally',
      content: "- **try**: code that might fail\n- **catch (error)**: runs ONLY if something in try threw; receives the error object. The `(error)` part is optional (`catch { }`) if you do not need it.\n- **finally**: runs ALWAYS, whether there was an error or not, even if try or catch contains `return`. Use it for cleanup: hiding a loading spinner, closing a file, re-enabling a button.\n\nWhen an error is thrown, the rest of the try block is skipped and control jumps straight to catch.\n\nIf `finally` itself contains a `return`, it **overrides** any return from try/catch (avoid doing this).",
      syntax: `try {
  console.log('1. start');
  JSON.parse('{bad json}');      // throws
  console.log('never runs');
} catch (error) {
  console.log('2. caught:', error.name); // SyntaxError
} finally {
  console.log('3. always runs');
}
console.log('4. program continues');`,
      tip: 'Do not wrap everything in try/catch. Catch errors only where you can do something useful (show a message, use a fallback, retry). Swallowing errors silently (`catch {}`) hides bugs.',
    },
    {
      heading: 'The Error Object and Built-in Error Types',
      content: "A caught error is usually an object created from the `Error` class with:\n- `name` - the type, e.g. `'TypeError'`\n- `message` - a human-readable description\n- `stack` - where it happened (file, line, call chain), very useful for debugging\n- `cause` - optional original error (ES2022): `new Error('Save failed', { cause: err })`\n\nBuilt-in types:\n- **ReferenceError** - using a variable that does not exist\n- **TypeError** - wrong type of operation: calling a non-function, reading a property of undefined/null, assigning to a const\n- **RangeError** - number out of allowed range: `new Array(-1)`, `(1).toFixed(200)`, infinite recursion\n- **SyntaxError** - invalid code, or invalid JSON in `JSON.parse`\n- **URIError** - bad `decodeURIComponent('%')`\n\nAll of them inherit from `Error`, so `err instanceof Error` is true.",
      syntax: `try { undefinedVariable; } catch (e) { e.name; } // 'ReferenceError'
try { null.length; } catch (e) { e.name; }        // 'TypeError'
try { new Array(-1); } catch (e) { e.name; }      // 'RangeError'
try { JSON.parse('{'); } catch (e) { e.name; }    // 'SyntaxError'`,
    },
    {
      heading: 'throw: Creating Your Own Errors',
      content: "Use `throw` to signal that something is wrong and the function cannot continue. Execution stops immediately and jumps to the nearest catch (in this function or any caller up the call stack).\n\nAlways throw an **Error object** (`throw new Error('message')`), not a string. Error objects carry a stack trace and work with `instanceof`.\n\nTypical uses: validating function arguments, rejecting invalid states (\"insufficient balance\"), and re-throwing an error you cannot handle after logging it.",
      syntax: `function withdraw(balance, amount) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new TypeError('Amount must be a positive number');
  }
  if (amount > balance) {
    throw new Error('Insufficient balance');
  }
  return balance - amount;
}

try {
  withdraw(100, 500);
} catch (err) {
  console.log(err.message); // 'Insufficient balance'
}`,
    },
    {
      heading: 'Custom Error Classes',
      content: "For bigger apps, create your own error types by extending `Error` (classes are covered fully on Day 36). Then callers can react differently to each kind with `instanceof`:\n\n- `ValidationError` -> show the message next to the form field\n- `NotFoundError` -> show a 404 page\n- anything else -> show \"Something went wrong\" and log it\n\nSet `this.name` so logs show the right type, and add extra fields (like `field`) that help handle the error.\n\nRe-throw errors you do not know how to handle: `else throw err;`.",
      syntax: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);            // sets this.message
    this.name = 'ValidationError';
    this.field = field;
  }
}

try {
  throw new ValidationError('email', 'Email is invalid');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(err.field + ': ' + err.message);
  } else {
    throw err; // not ours, let it bubble up
  }
}`,
    },
    {
      heading: 'Errors and Async Code (Preview)',
      content: "`try/catch` only catches errors thrown **synchronously** inside the try block. If the error happens later inside a `setTimeout` callback, the try block has already finished, so it cannot catch it. You must put the try/catch **inside** the callback.\n\nPromises use `.catch()` and `async/await` lets you use normal try/catch again. Coming next: Day 30 timers & callbacks, Day 31 promises, Day 32 async/await.\n\nIn browsers, `window.addEventListener('error', ...)` and `'unhandledrejection'` are global safety nets for logging uncaught errors.",
      syntax: `try {
  setTimeout(() => {
    throw new Error('Too late!'); // NOT caught by the outer try
  }, 0);
} catch (e) {
  console.log('never runs');
}`,
    },
  ],
  examples: [
    {
      title: 'Execution Order of try / catch / finally',
      scenario: 'Trace exactly which lines run when no error happens and when an error happens, and see that the program continues afterwards.',
      steps: [
        'Write a function run(shouldFail) with logs in try, catch and finally',
        'Inside try, throw only when shouldFail is true',
        'Call run(false) and run(true)',
        'Click Run and compare the two traces',
      ],
      code: `function run(shouldFail) {
  try {
    console.log('try: start');
    if (shouldFail) throw new Error('Boom');
    console.log('try: end');
  } catch (err) {
    console.log('catch: ' + err.message);
  } finally {
    console.log('finally: cleanup');
  }
  console.log('after: continues');
}
run(false);
run(true);`,
      playground: {
        js: `function run(shouldFail) {
  console.log('--- run(' + shouldFail + ') ---');
  try {
    console.log('try: start');
    if (shouldFail) throw new Error('Boom');
    console.log('try: end');
  } catch (err) {
    console.log('catch: ' + err.message);
  } finally {
    console.log('finally: cleanup');
  }
  console.log('after: continues');
}
run(false);
run(true);`,
      },
      result: `--- run(false) ---
try: start
try: end
finally: cleanup
after: continues
--- run(true) ---
try: start
catch: Boom
finally: cleanup
after: continues`,
      explanation: 'Without an error, catch is skipped. With an error, the remaining try code ("try: end") is skipped and control jumps to catch. finally runs in both cases, and because the error was handled the program continues normally.',
    },
    {
      title: 'Identifying Built-in Error Types',
      scenario: 'Run several broken operations safely in a loop and print each error\'s name and message, proving all are instances of Error.',
      steps: [
        'Create an array of small functions that each fail in a different way',
        'Loop over them, calling each inside try/catch',
        'Print err.name and whether it is instanceof Error',
        'Click Run',
      ],
      code: `const tests = [
  () => notDefinedVar,
  () => null.toUpperCase(),
  () => (123.456).toFixed(101),
  () => JSON.parse("{'single': 'quotes'}"),
  () => { const x = 1; x = 2; },
];
tests.forEach(fn => {
  try { fn(); }
  catch (err) { console.log(err.name, err instanceof Error); }
});`,
      playground: {
        js: `const tests = [
  () => notDefinedVar,
  () => null.toUpperCase(),
  () => (123.456).toFixed(101),
  () => JSON.parse("{'single': 'quotes'}"),
  () => { const x = 1; x = 2; },
  () => decodeURIComponent('%'),
];
tests.forEach((fn, i) => {
  try {
    fn();
  } catch (err) {
    console.log((i + 1) + '. ' + err.name + ' | instanceof Error: ' + (err instanceof Error));
  }
});
console.log('All errors handled, app still running');`,
      },
      result: `1. ReferenceError | instanceof Error: true
2. TypeError | instanceof Error: true
3. RangeError | instanceof Error: true
4. SyntaxError | instanceof Error: true
5. TypeError | instanceof Error: true
6. URIError | instanceof Error: true
All errors handled, app still running`,
      explanation: 'Using an undeclared variable is a ReferenceError; calling a method on null and assigning to a const are TypeErrors; toFixed only accepts 0-100 digits (RangeError); single quotes are invalid JSON (SyntaxError); a lone % is an invalid URI escape (URIError). All built-in types extend Error. Exact messages differ between browsers, which is why we print only the names.',
    },
    {
      title: 'Validating Input with throw',
      scenario: 'A bank withdraw function must reject invalid amounts and overdrafts. The caller shows friendly messages and a finally block logs every attempt.',
      steps: [
        'Write withdraw(account, amount) that throws TypeError / RangeError / Error',
        'Write attempt(amount) that calls withdraw inside try/catch/finally',
        'Try valid and invalid amounts',
        'Click Run',
      ],
      code: `function withdraw(account, amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new TypeError('Amount must be a number');
  }
  if (amount <= 0) throw new RangeError('Amount must be greater than 0');
  if (amount > account.balance) throw new Error('Insufficient balance');
  account.balance -= amount;
  return account.balance;
}`,
      playground: {
        js: `const account = { owner: 'Ravi', balance: 1000 };

function withdraw(acc, amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    throw new TypeError('Amount must be a number');
  }
  if (amount <= 0) throw new RangeError('Amount must be greater than 0');
  if (amount > acc.balance) throw new Error('Insufficient balance');
  acc.balance -= amount;
  return acc.balance;
}

let attempts = 0;
function attempt(amount) {
  try {
    const left = withdraw(account, amount);
    console.log('OK: withdrew ' + amount + ', balance ' + left);
  } catch (err) {
    console.log('Failed (' + err.name + '): ' + err.message);
  } finally {
    attempts++;
  }
}

attempt(300);
attempt('500');
attempt(-50);
attempt(5000);
attempt(700);
console.log('Attempts: ' + attempts + ', final balance: ' + account.balance);`,
      },
      result: `OK: withdrew 300, balance 700
Failed (TypeError): Amount must be a number
Failed (RangeError): Amount must be greater than 0
Failed (Error): Insufficient balance
OK: withdrew 700, balance 0
Attempts: 5, final balance: 0`,
      explanation: 'withdraw throws as soon as a rule is broken, so the balance is never changed by bad input. The caller decides how to present errors. finally counts every attempt, successful or not. Note "500" (a string) is rejected because typeof is "string".',
    },
    {
      title: 'Custom Error Classes with instanceof',
      scenario: 'A user registration service can fail with a ValidationError (bad field) or a DuplicateError (email taken). The UI layer reacts differently to each, and unknown errors are re-thrown.',
      steps: [
        'Create ValidationError and DuplicateError classes extending Error',
        'Write register(user) that throws the right error',
        'Write handle(user) with if/else instanceof in catch, re-throwing unknown errors',
        'Use the cause option to wrap a low-level error',
        'Click Run',
      ],
      code: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
class DuplicateError extends Error {
  constructor(email) {
    super(email + ' is already registered');
    this.name = 'DuplicateError';
  }
}`,
      playground: {
        js: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
class DuplicateError extends Error {
  constructor(email) {
    super(email + ' is already registered');
    this.name = 'DuplicateError';
  }
}

const existing = new Set(['asha@mail.com']);

function register(user) {
  if (!user.name) throw new ValidationError('name', 'Name is required');
  if (!user.email.includes('@')) throw new ValidationError('email', 'Email is invalid');
  if (existing.has(user.email)) throw new DuplicateError(user.email);
  if (user.email.endsWith('.crash')) {
    try {
      JSON.parse('{broken');
    } catch (low) {
      throw new Error('Database write failed', { cause: low });
    }
  }
  existing.add(user.email);
  return 'Registered ' + user.name;
}

function handle(user) {
  try {
    console.log(register(user));
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log('Fix the "' + err.field + '" field: ' + err.message);
    } else if (err instanceof DuplicateError) {
      console.log('Try logging in instead: ' + err.message);
    } else {
      console.log('Unexpected: ' + err.message + ' (cause: ' + err.cause.name + ')');
    }
  }
}

handle({ name: '', email: 'x@mail.com' });
handle({ name: 'Ravi', email: 'ravi-mail.com' });
handle({ name: 'Asha', email: 'asha@mail.com' });
handle({ name: 'Meera', email: 'meera@mail.com' });
handle({ name: 'Bug', email: 'bug@test.crash' });

const e = new ValidationError('age', 'Too young');
console.log(e.name, e instanceof ValidationError, e instanceof Error);`,
      },
      result: `Fix the "name" field: Name is required
Fix the "email" field: Email is invalid
Try logging in instead: asha@mail.com is already registered
Registered Meera
Unexpected: Database write failed (cause: SyntaxError)
ValidationError true true`,
      explanation: 'Custom classes let the catch block recognise the kind of failure with instanceof and use extra data (err.field). Setting this.name makes logs readable. The { cause } option wraps a low-level SyntaxError inside a meaningful higher-level error without losing the original. Custom errors are still instances of Error.',
    },
  ],
  interview: [
    { q: 'What is the purpose of try/catch/finally?', a: 'try contains code that may throw; catch handles the error if one is thrown; finally always runs afterwards (success or failure) and is used for cleanup.', level: 'Easy' },
    { q: 'What is the output?\ntry {\n  console.log("a");\n  throw new Error("x");\n  console.log("b");\n} catch (e) {\n  console.log("c");\n} finally {\n  console.log("d");\n}\nconsole.log("e");', a: 'a c d e. After the throw, "b" is skipped, catch runs, finally runs, then execution continues.', level: 'Easy' },
    { q: 'What is the output?\nfunction f() {\n  try { return "try"; }\n  finally { console.log("finally"); }\n}\nconsole.log(f());', a: '"finally" then "try". finally runs before the function actually returns, and the try\'s return value is kept.', level: 'Medium' },
    { q: 'What is the output?\nfunction g() {\n  try { return 1; }\n  finally { return 2; }\n}\nconsole.log(g());', a: '2. A return inside finally overrides the return from try (and would even swallow a thrown error). Avoid returning from finally.', level: 'Hard' },
    { q: 'Difference between TypeError and ReferenceError?', a: 'ReferenceError: a variable that does not exist (or is in the TDZ) is accessed. TypeError: a value exists but is used in an invalid way, e.g. calling a non-function, reading a property of null/undefined, or assigning to a const.', level: 'Medium' },
    { q: 'Why throw new Error("msg") instead of throw "msg"?', a: 'Error objects include name, message and a stack trace, work with instanceof and are what tools/loggers expect. Thrown strings have no stack and make debugging harder.', level: 'Medium' },
    { q: 'Can try/catch catch an error thrown inside setTimeout?', a: 'No, not if the try/catch wraps the setTimeout call. The callback runs later, after the try block has finished. Put try/catch inside the callback, or use promises/async-await.', level: 'Medium' },
    { q: 'What is the output?\ntry {\n  try { throw new Error("inner"); }\n  finally { console.log("f1"); }\n} catch (e) {\n  console.log("outer caught " + e.message);\n}', a: 'f1 then "outer caught inner". The inner try has no catch, so its finally runs and the error continues to the outer catch.', level: 'Hard' },
    { q: 'How do you create a custom error type?', a: 'class MyError extends Error { constructor(msg) { super(msg); this.name = "MyError"; } }. Then throw new MyError("...") and check with err instanceof MyError.', level: 'Medium' },
    { q: 'What is the output?\ntry { JSON.parse("{a:1}"); }\ncatch (e) { console.log(e.name, e instanceof SyntaxError, e instanceof Error); }', a: 'SyntaxError true true. Invalid JSON throws a SyntaxError, which inherits from Error.', level: 'Easy' },
    { q: 'What does the cause option of Error do?', a: 'new Error("High-level message", { cause: originalError }) attaches the original error as err.cause, preserving the root cause when wrapping errors (ES2022).', level: 'Hard' },
    { q: 'Can try/catch catch a syntax error in the same script?', a: 'No. A syntax error prevents the whole script from being parsed, so no code (including the try) runs. Only runtime errors, such as JSON.parse or eval of bad code, can be caught.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write safeDivide(a, b) that throws a TypeError if either argument is not a number and a RangeError if b is 0. Call it inside try/catch for (10, 2), (10, 0) and ("10", 2).',
      hint: 'Check typeof first, then b === 0.',
      solution: `function safeDivide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') throw new TypeError('Both arguments must be numbers');
  if (b === 0) throw new RangeError('Cannot divide by zero');
  return a / b;
}
for (const [a, b] of [[10, 2], [10, 0], ['10', 2]]) {
  try {
    console.log(safeDivide(a, b));
  } catch (err) {
    console.log(err.name + ': ' + err.message);
  }
}
// 5
// RangeError: Cannot divide by zero
// TypeError: Both arguments must be numbers`,
    },
    {
      task: 'Write parseAge(text) that converts a string to an integer age and throws an Error with a helpful message if it is not a number or not between 0 and 120.',
      hint: 'Use Number(text) and Number.isInteger.',
      solution: `function parseAge(text) {
  const age = Number(text);
  if (!Number.isInteger(age)) throw new Error('"' + text + '" is not a whole number');
  if (age < 0 || age > 120) throw new RangeError('Age must be between 0 and 120');
  return age;
}
['25', 'abc', '150', '3.5'].forEach(t => {
  try { console.log(parseAge(t)); }
  catch (e) { console.log(e.message); }
});`,
    },
    {
      task: 'Simulate a "loading" flow: set loading = true, then in try call a function that randomly throws, in catch log the error, and in finally set loading = false. Print loading at the end.',
      hint: 'if (Math.random() < 0.5) throw new Error("Server error");',
      solution: `let loading = false;
function fetchData() {
  if (Math.random() < 0.5) throw new Error('Server error');
  return { items: 3 };
}
loading = true;
try {
  const data = fetchData();
  console.log('Loaded', data.items, 'items');
} catch (err) {
  console.log('Failed:', err.message);
} finally {
  loading = false;
}
console.log('loading =', loading); // always false`,
    },
    {
      task: 'Create a NotFoundError class with a resource property. Write getProduct(id) that searches an array and throws NotFoundError if missing. Handle it by printing "Product <id> not found".',
      hint: 'class NotFoundError extends Error { constructor(resource, id) {...} }',
      solution: `class NotFoundError extends Error {
  constructor(resource, id) {
    super(resource + ' ' + id + ' not found');
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}
const products = [{ id: 1, name: 'Pen' }];
function getProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) throw new NotFoundError('Product', id);
  return p;
}
try {
  getProduct(42);
} catch (err) {
  if (err instanceof NotFoundError) console.log(err.message); // Product 42 not found
  else throw err;
}`,
    },
    {
      task: 'Write retry(fn, times) that calls fn up to `times` times until it succeeds, logging each failure, and throws the last error if all attempts fail.',
      hint: 'Use a for loop with try/catch; return on success; remember the last error.',
      solution: `function retry(fn, times) {
  let lastError;
  for (let i = 1; i <= times; i++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
      console.log('Attempt ' + i + ' failed: ' + err.message);
    }
  }
  throw lastError;
}
let calls = 0;
const flaky = () => { calls++; if (calls < 3) throw new Error('Not yet'); return 'Success on call ' + calls; };
console.log(retry(flaky, 5));`,
    },
  ],
  quiz: [
    { question: 'When does the finally block run?', options: ['Only when there is no error', 'Only when there is an error', 'Always, after try (and catch if it ran)', 'Only if catch re-throws'], answer: 2, explanation: 'finally always runs, used for cleanup.' },
    { question: 'Which error is thrown by `null.length`?', options: ['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError'], answer: 0, explanation: 'Reading a property of null is a TypeError.' },
    { question: 'What is the best way to throw an error?', options: ['throw "Something failed"', 'return new Error("Something failed")', 'console.error("Something failed")', 'throw new Error("Something failed")'], answer: 3, explanation: 'Throw Error objects for name, message and stack.' },
    { question: 'Which keyword lets a custom error class inherit from Error?', options: ['implements', 'extends', 'inherits', 'super'], answer: 1, explanation: 'class MyError extends Error { ... }' },
    { question: 'What does JSON.parse("oops") throw?', options: ['TypeError', 'RangeError', 'SyntaxError', 'Nothing, returns undefined'], answer: 2, explanation: 'Invalid JSON throws SyntaxError.' },
  ],
};
