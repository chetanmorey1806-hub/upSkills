export default {
  lesson: 'day-04-operators',
  minutes: 25,
  intro: 'Use arithmetic, comparison, logical, ternary, ?? and ?. operators on real data.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is `17 % 5`?',
      options: ['3.4', '2', '3', '85'],
      answer: 1,
      explain: '`%` is the **remainder** operator: 17 ÷ 5 = 3 remainder **2**. It is perfect for even/odd checks (`n % 2 === 0`).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `let x = 5;
console.log(x++);
console.log(x);
console.log(++x);
console.log(2 ** 3);
console.log(0 || "default");
console.log(0 ?? "default");`,
      expected: '5\n6\n7\n8\ndefault\n0',
      explain: 'Postfix `x++` returns the **old** value (5) then adds 1; prefix `++x` adds first. `**` is power. `||` replaces any falsy value (0 is falsy), but `??` only replaces `null`/`undefined`, so `0 ?? "default"` keeps 0.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which expression safely reads the city when `user.address` might be missing, without throwing an error?',
      options: ['user.address.city', 'user?.address?.city', 'user.address || city', 'user[address][city]'],
      answer: 1,
      explain: 'Optional chaining `?.` stops and returns `undefined` if the part before it is `null`/`undefined`. `user.address.city` throws "Cannot read properties of undefined" when address is missing.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `isEven(n)` that returns `true` if `n` is even and `false` otherwise. Use the `%` operator and `===`.',
      example: { title: 'remainder check', code: 'console.log(10 % 3 === 1); // true' },
      starter: 'function isEven(n) {\n  // TODO\n}',
      solution: 'function isEven(n) {\n  return n % 2 === 0;\n}',
      tests: [
        { call: 'isEven(4)', expect: true },
        { call: 'isEven(7)', expect: false },
        { call: 'isEven(0)', expect: true },
      ],
      explain: 'A number is even when dividing by 2 leaves remainder 0. The comparison `n % 2 === 0` already produces `true`/`false`, so you can return it directly, no if/else needed.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Login check. Write `canLogin(user)` using logical operators and a **ternary**. Return `"Welcome"` if `user.isActive` is true **and** `user.password.length >= 8`, otherwise return `"Access denied"`.',
      example: { title: 'ternary with &&', code: 'const age = 20, hasId = true;\nconst msg = age >= 18 && hasId ? "Enter" : "Stop";' },
      starter: 'function canLogin(user) {\n  // TODO: return a ternary expression\n}',
      solution: 'function canLogin(user) {\n  return user.isActive && user.password.length >= 8 ? "Welcome" : "Access denied";\n}',
      tests: [
        { call: 'canLogin({ isActive: true, password: "secret123" })', expect: 'Welcome' },
        { call: 'canLogin({ isActive: false, password: "secret123" })', expect: 'Access denied' },
        { call: 'canLogin({ isActive: true, password: "abc" })', expect: 'Access denied' },
      ],
      explain: '`&&` is true only when **both** sides are true. The ternary `condition ? a : b` picks one of two values. A common slip is using `=` (assignment) instead of `>=` or `===` inside the condition.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'API data can be incomplete. Write `cityOf(user)` that returns `user.address.city`, or `"Unknown"` if `user`, `address` or `city` is missing. Use `?.` and `??`.',
      example: { title: '?. and ?? together', code: 'const order = { items: null };\nconst count = order.items?.length ?? 0; // 0' },
      starter: 'function cityOf(user) {\n  // TODO\n}',
      solution: 'function cityOf(user) {\n  return user?.address?.city ?? "Unknown";\n}',
      tests: [
        { call: 'cityOf({ address: { city: "Nagpur" } })', expect: 'Nagpur' },
        { call: 'cityOf({ name: "Ravi" })', expect: 'Unknown' },
        { call: 'cityOf(null)', expect: 'Unknown' },
        { call: 'cityOf({ address: {} })', expect: 'Unknown' },
      ],
      explain: '`?.` returns `undefined` instead of throwing when a link in the chain is missing, and `??` swaps `null`/`undefined` for the default. `||` would also work here, but `??` is safer when a real value could be falsy like `""` or `0`.',
    },
  ],
};
