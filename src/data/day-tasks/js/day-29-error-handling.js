export default {
  lesson: 'day-29-error-handling',
  minutes: 30,
  intro: 'Catch runtime errors with try/catch/finally, throw your own errors for bad input and handle custom error classes.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Execution order. What is printed?',
      code: `function test() {
  try {
    console.log("try");
    throw new Error("Oops");
    console.log("after throw");
  } catch (err) {
    console.log("catch: " + err.message);
    return "returned";
  } finally {
    console.log("finally");
  }
}
console.log(test());`,
      expected: 'try\ncatch: Oops\nfinally\nreturned',
      explain: '`throw` jumps straight to `catch`, so "after throw" never runs. `finally` **always** runs, even when the catch block returns; the returned value is delivered after finally finishes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which built-in error is thrown by `null.length`?',
      options: ['ReferenceError', 'SyntaxError', 'TypeError', 'RangeError'],
      answer: 2,
      explain: 'Using a value in a way its type does not allow (reading a property of null, calling a non-function) is a **TypeError**. Using an undeclared variable is a ReferenceError; `new Array(-1)` is a RangeError.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `try {
  total = price * 2;
  let price = 10;
} catch (e) {
  console.log(e.name);
}
try {
  JSON.parse("{oops}");
} catch (e) {
  console.log(e.name);
}`,
      expected: 'ReferenceError\nSyntaxError',
      explain: 'Reading `price` before its `let` line (TDZ) throws a **ReferenceError**. `JSON.parse` on invalid text throws a **SyntaxError** at runtime, which try/catch can catch (a syntax error in your own source code cannot be caught).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Validate with `throw`. Write `withdraw(balance, amount)` that returns the new balance, but:\n- throws `new Error("Amount must be positive")` if amount <= 0\n- throws `new Error("Insufficient balance")` if amount > balance',
      example: { title: 'throwing on bad input', code: 'function setAge(age) {\n  if (age < 0) throw new Error("Age cannot be negative");\n  return age;\n}' },
      starter: 'function withdraw(balance, amount) {\n  // TODO\n}',
      solution: 'function withdraw(balance, amount) {\n  if (amount <= 0) throw new Error("Amount must be positive");\n  if (amount > balance) throw new Error("Insufficient balance");\n  return balance - amount;\n}',
      tests: [
        { call: 'withdraw(1000, 300)', expect: 700 },
        { call: '(() => { try { withdraw(1000, -5); return "no error"; } catch (e) { return e.message; } })()', expect: 'Amount must be positive' },
        { call: '(() => { try { withdraw(100, 500); return "no error"; } catch (e) { return e.message; } })()', expect: 'Insufficient balance' },
      ],
      explain: 'Throwing stops the function immediately and forces the caller to deal with the problem. Returning a string like "error" is weaker: callers can forget to check it and treat it as a number.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `safeDivide(a, b)` that calls the given `divide` function inside **try/catch**. Return the result, or the string `"Error: <message>"` if it throws.',
      example: { title: 'catching and reading the message', code: 'try {\n  riskyWork();\n} catch (err) {\n  console.log("Failed:", err.message);\n}' },
      starter: 'function divide(a, b) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}\n\nfunction safeDivide(a, b) {\n  // TODO\n}',
      solution: 'function divide(a, b) {\n  if (b === 0) throw new Error("Cannot divide by zero");\n  return a / b;\n}\n\nfunction safeDivide(a, b) {\n  try {\n    return divide(a, b);\n  } catch (err) {\n    return "Error: " + err.message;\n  }\n}',
      tests: [
        { call: 'safeDivide(10, 2)', expect: 5 },
        { call: 'safeDivide(5, 0)', expect: 'Error: Cannot divide by zero' },
      ],
      explain: 'The error object carries a `message` (and a `name` and `stack`). Catch errors at the level where you can do something useful with them, such as showing a friendly message.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Custom error class. Create `class ValidationError extends Error` whose constructor takes `(field, message)`, calls `super(message)`, sets `this.name = "ValidationError"` and stores `this.field`.\n\nThen write `handle(fn)` that runs `fn()` and returns:\n- `"OK"` if no error\n- `"Fix <field>: <message>"` for a ValidationError\n- `"Unexpected: <message>"` for any other error',
      example: { title: 'instanceof to branch', code: 'catch (err) {\n  if (err instanceof TypeError) { /* ... */ }\n  else throw err;\n}' },
      starter: 'class ValidationError extends Error {\n  // TODO\n}\n\nfunction handle(fn) {\n  // TODO\n}',
      solution: 'class ValidationError extends Error {\n  constructor(field, message) {\n    super(message);\n    this.name = "ValidationError";\n    this.field = field;\n  }\n}\n\nfunction handle(fn) {\n  try {\n    fn();\n    return "OK";\n  } catch (err) {\n    if (err instanceof ValidationError) return `Fix ${err.field}: ${err.message}`;\n    return "Unexpected: " + err.message;\n  }\n}',
      tests: [
        { call: 'handle(() => {})', expect: 'OK' },
        { call: 'handle(() => { throw new ValidationError("email", "must contain @"); })', expect: 'Fix email: must contain @' },
        { call: 'handle(() => { null.x; })', expect: "Unexpected: Cannot read properties of null (reading 'x')" },
        { call: 'new ValidationError("age", "too small").name', expect: 'ValidationError' },
        { call: 'new ValidationError("age", "too small") instanceof Error', expect: true },
      ],
      explain: 'Extending `Error` keeps the message and stack trace, and `instanceof` lets you treat your own errors (show a form hint) differently from real bugs. Forgetting `super(message)` before using `this` throws a ReferenceError.',
    },
  ],
};
