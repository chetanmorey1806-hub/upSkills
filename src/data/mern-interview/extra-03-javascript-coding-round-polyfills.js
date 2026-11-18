const POLYFILL_ARRAY = `Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this);
  }
  return result;
};
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};
Array.prototype.myReduce = function (callback, initialValue) {
  let i = 0;
  let acc = initialValue;
  if (arguments.length < 2) {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError("Reduce of empty array with no initial value");
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = callback(acc, this[i], i, this);
  }
  return acc;
};
const nums = [1, 2, 3, 4, 5];
console.log(nums.myMap((n) => n * 2));
console.log(nums.myFilter((n) => n % 2 === 0));
console.log(nums.myReduce((sum, n) => sum + n));
console.log(nums.myReduce((acc, n) => ({ ...acc, [n]: n * n }), {}));
try { [].myReduce((a, b) => a + b); } catch (e) { console.log(e.message); }`;

const POLYFILL_BIND_PROMISE_ALL = `Function.prototype.myBind = function (context, ...preset) {
  const fn = this;
  return function (...later) {
    return fn.apply(context, [...preset, ...later]);
  };
};
function intro(greeting, city) { return greeting + ", I am " + this.name + " from " + city; }
const hi = intro.myBind({ name: "Asha" }, "Hi");
console.log(hi("Pune"));

function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const items = Array.from(promises);
    const results = new Array(items.length);
    let done = 0;
    if (items.length === 0) return resolve(results);
    items.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        done++;
        if (done === items.length) resolve(results);
      }, reject);
    });
  });
}
const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
promiseAll([delay(30, "a"), 42, delay(10, "c")]).then((r) => console.log("all:", r));
promiseAll([delay(10, "ok"), Promise.reject(new Error("fail"))]).catch((e) => console.log("rejected:", e.message));
promiseAll([]).then((r) => console.log("empty:", r));`;

const DEBOUNCE_THROTTLE = `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
const search = debounce((q) => console.log("API call for:", q), 100);
["r", "re", "rea", "reac", "react"].forEach((q, i) => setTimeout(() => search(q), i * 20));

const onScroll = throttle((n) => console.log("scroll handled:", n), 100);
let n = 0;
const id = setInterval(() => {
  n++;
  onScroll(n);
  if (n === 12) clearInterval(id);
}, 30);`;

const CLONE_FLATTEN_CURRY_MEMO = `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) return new Map([...value].map(([k, v]) => [k, deepClone(v, seen)]));
  if (value instanceof Set) return new Set([...value].map((v) => deepClone(v, seen)));
  if (seen.has(value)) return seen.get(value);
  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);
  return copy;
}
const original = { name: "Asha", skills: ["js", "react"], address: { city: "Pune" }, joined: new Date(0) };
original.self = original;
const copy = deepClone(original);
copy.address.city = "Mumbai";
copy.skills.push("node");
console.log(original.address.city, original.skills.length, copy.skills.length);
console.log(copy.self === copy, copy.joined instanceof Date);

function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, item) =>
    Array.isArray(item) && depth > 0
      ? acc.concat(flatten(item, depth - 1))
      : acc.concat([item]), []);
}
console.log(flatten([1, [2, [3, [4, [5]]]]]));
console.log(flatten([1, [2, [3, [4]]]], 1));

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}
const add3 = (a, b, c) => a + b + c;
const cAdd = curry(add3);
console.log(cAdd(1)(2)(3), cAdd(1, 2)(3), cAdd(1)(2, 3));

const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
console.log(sum(1)(2)(3)(4)());

function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
let calls = 0;
const slowSquare = (n) => { calls++; return n * n; };
const fastSquare = memoize(slowSquare);
console.log(fastSquare(9), fastSquare(9), fastSquare(4), "calls:", calls);`;

const ARRAY_STRING_PROGRAMS = `const reverseWords = (s) => s.trim().split(/\\s+/).reverse().join(" ");
console.log(reverseWords("  MERN stack   developer "));

const isPalindrome = (s) => {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
};
console.log(isPalindrome("A man, a plan, a canal: Panama"), isPalindrome("react"));

const isAnagram = (a, b) => {
  if (a.length !== b.length) return false;
  const count = {};
  for (const ch of a) count[ch] = (count[ch] || 0) + 1;
  for (const ch of b) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
};
console.log(isAnagram("listen", "silent"), isAnagram("rat", "car"));

const firstUnique = (s) => {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (const ch of s) if (freq.get(ch) === 1) return ch;
  return null;
};
console.log(firstUnique("swiss"), firstUnique("aabb"));

const twoSum = (nums, target) => {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
};
console.log(twoSum([2, 7, 11, 15], 9), twoSum([3, 2, 4], 6));

console.log([...new Set([3, 1, 3, 2, 1])]);

const maxSubArray = (nums) => {
  let best = nums[0], current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
};
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));

const secondLargest = (arr) => {
  let first = -Infinity, second = -Infinity;
  for (const n of arr) {
    if (n > first) { second = first; first = n; }
    else if (n > second && n < first) second = n;
  }
  return second === -Infinity ? null : second;
};
console.log(secondLargest([10, 5, 10, 8, 3]));

const charFrequency = (s) =>
  [...s.replace(/\\s/g, "")].reduce((acc, ch) => ((acc[ch] = (acc[ch] || 0) + 1), acc), {});
console.log(charFrequency("hello world"));

const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item.name);
    return acc;
  }, {});
console.log(groupBy([{ name: "A", dept: "IT" }, { name: "B", dept: "HR" }, { name: "C", dept: "IT" }], (u) => u.dept));`;

const consoleHtml = '<p>Open the console to see the output.</p>';

export default {
  id: 'extra-03-javascript-coding-round-polyfills',
  title: 'JavaScript Coding Round: Polyfills (map, filter, reduce, bind, Promise.all), Debounce, Throttle, Deep Clone, Flatten, Curry, Memoize and Must-Know Programs',
  module: 'Interview: JavaScript',
  extraNo: 3,
  level: 'Intermediate',
  duration: '4 hours',
  summary: 'The live-coding round of a MERN interview: write polyfills and utility functions from scratch and solve classic array/string problems. Learn a repeatable approach, memorise the 10 must-know implementations, and practise explaining time and space complexity.',
  objectives: [
    'Follow a clear 5-step approach in a live coding round (clarify, examples, brute force, optimise, test)',
    'Write polyfills for map, filter, reduce, bind, call and Promise.all from memory',
    'Implement debounce, throttle, deep clone, flatten, curry and memoize and explain where each is used',
    'Solve common array and string problems with hash maps, two pointers and sliding window',
    'State the time and space complexity of every solution',
  ],
  theory: [
    {
      heading: 'How to approach a live coding round',
      content: `Interviewers judge your **process** as much as your final code. Use these 5 steps out loud:
1. **Clarify** – inputs, outputs, edge cases. "Can the array be empty? Can it contain negative numbers? Should I mutate the input?"
2. **Examples** – write 1 normal + 1 edge example as comments.
3. **Brute force first** – say it and its complexity ("nested loops, O(n²)").
4. **Optimise** – usually with a hash map/Set (O(1) lookups), two pointers, sorting, or a sliding window.
5. **Test** – dry-run your examples line by line; mention complexity.

Coding style that impresses: meaningful names, \`const\`/\`let\`, early returns for edge cases, no global variables, and a small helper function instead of one giant function.

If you get stuck: say what you are thinking, ask for a hint politely – silence is worse than a hint.`,
      tip: 'Service companies (TCS/Infosys/Wipro) usually ask string/array programs; product companies and startups add polyfills, debounce/throttle and Promise questions. Prepare both.',
    },
    {
      heading: 'Polyfills: what and how',
      content: `A **polyfill** is code that implements a modern feature for environments that lack it. In interviews, "write a polyfill for X" tests whether you understand exactly how X behaves.

Rules for array method polyfills:
- Add to \`Array.prototype\` with a different name (\`myMap\`) so you do not break the real one.
- Use a normal \`function\` (not an arrow) so that \`this\` is the array.
- Pass \`(element, index, array)\` to the callback and respect \`thisArg\`.
- Skip holes in sparse arrays (\`i in this\`).
- **map** returns a new array of the same length; **filter** returns only items where the callback is truthy; **reduce** uses the first element as the accumulator if no initial value is given and throws a TypeError on an empty array without one.

**bind** returns a function that calls the original with a fixed \`this\` and pre-set arguments (partial application). **call/apply** can be polyfilled by temporarily attaching the function to the object as a unique \`Symbol\` property.

**Promise.all** must: keep results in input order, resolve when all fulfil, reject on the first rejection, accept non-promise values (wrap with \`Promise.resolve\`), and resolve immediately with \`[]\` for an empty input.`,
      syntax: `Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;
  const key = Symbol('fn');
  ctx[key] = this;            // this = the function being called
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};`,
    },
    {
      heading: 'Debounce vs throttle',
      content: `Both limit how often a function runs when an event fires many times (typing, scrolling, resizing).

**Debounce** – run the function only after the events STOP for \`delay\` ms. Every new event resets the timer.
- Use for: search-as-you-type (call the API when the user pauses), auto-save, window resize end, form validation.

**Throttle** – run the function at most ONCE every \`interval\` ms, no matter how many events.
- Use for: scroll position tracking, infinite scroll checks, mouse-move, button spam protection, analytics pings.

Analogy: debounce is a lift door that waits until people stop entering; throttle is a metro that leaves every 5 minutes no matter how many people are waiting.

Both work using a **closure** to keep the timer id / last-run time between calls, and use \`fn.apply(this, args)\` to keep \`this\` and arguments.`,
      tip: 'Follow-ups to expect: "add a leading option", "add cancel()", "how do you use debounce in React?" (wrap with useMemo/useRef so the debounced function is not recreated on every render, and cancel it in the cleanup).',
    },
    {
      heading: 'Deep clone, flatten, curry and memoize',
      content: `- **Deep clone** – copy every nested level. Handle primitives (return as-is), arrays vs objects, Date/RegExp/Map/Set, and **circular references** with a \`WeakMap\` of already-copied objects. In real code: \`structuredClone(obj)\`.
- **Flatten** – turn \`[1, [2, [3]]]\` into \`[1, 2, 3]\`. Recursive with reduce, or iterative with a stack. Support a depth argument like \`Array.prototype.flat(depth)\`.
- **Curry** – transform \`f(a, b, c)\` into \`f(a)(b)(c)\`. Compare the collected argument count with \`fn.length\`; when enough, call fn; otherwise return a function that collects more. The infinite version \`sum(1)(2)(3)()\` stops when called with no argument.
- **Memoize** – cache results by arguments in a \`Map\` so repeated calls are O(1). Works only for **pure** functions. Key with \`JSON.stringify(args)\` for simple arguments. Used for expensive calculations and API caching; React's \`useMemo\` and \`React.memo\` are the same idea.`,
    },
    {
      heading: 'Patterns for array and string problems',
      content: `Most fresher coding questions are solved by one of these patterns:
- **Hash map / Set (frequency counting)** – duplicates, anagrams, first non-repeating character, two-sum, group by. O(n) time, O(n) space.
- **Two pointers** – palindrome check, reverse in place, pair sum in a SORTED array, remove duplicates from sorted array, merge two sorted arrays.
- **Sliding window** – longest substring without repeating characters, max sum of k consecutive elements.
- **Kadane's algorithm** – maximum subarray sum in O(n).
- **Sorting first** – O(n log n), then a linear scan (e.g. merge intervals, k-th largest).
- **Single pass with variables** – second largest, missing number (sum formula n(n+1)/2 or XOR).

Know the built-ins and their complexity: \`includes\`/\`indexOf\` are O(n); \`Set.has\`/\`Map.get\` are O(1) on average; \`sort\` is O(n log n) and sorts as STRINGS by default (\`[10, 9, 1].sort()\` → \`[1, 10, 9]\`) – always pass \`(a, b) => a - b\` for numbers. ES2023 adds non-mutating \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\`; ES2024 adds \`Object.groupBy\` and \`Map.groupBy\`.`,
      tip: 'Always state complexity at the end: "This is O(n) time and O(n) space because of the map." It is often what separates a pass from a strong pass.',
    },
  ],
  examples: [
    {
      title: 'Polyfills for map, filter and reduce',
      scenario: '"Write your own version of Array.prototype.map / filter / reduce" – asked in almost every JS round.',
      steps: ['Read each polyfill and note how this and the callback arguments are used', 'Run', 'Try removing the initial value check in reduce to see why it matters'],
      code: POLYFILL_ARRAY,
      playground: { html: consoleHtml, js: POLYFILL_ARRAY },
      result: `[ 2, 4, 6, 8, 10 ]
[ 2, 4 ]
15
{ '1': 1, '2': 4, '3': 9, '4': 16, '5': 25 }
Reduce of empty array with no initial value`,
      explanation: `this inside the normal function is the array the method is called on. Each callback receives (element, index, array) exactly like the native methods, and "i in this" skips holes in sparse arrays. reduce without an initial value takes the first element as the accumulator and starts from index 1; with an empty array and no initial value it throws a TypeError, matching the native behaviour. Complexity: O(n) for all three. (Browser consoles may print arrays as Array(5).)`,
    },
    {
      title: 'Polyfills for bind and Promise.all',
      scenario: 'Two favourite polyfill questions in product-company interviews.',
      steps: ['Read myBind: it returns a new function using apply', 'Read promiseAll: counter + results array by index', 'Run and notice the order of the three outputs'],
      code: POLYFILL_BIND_PROMISE_ALL,
      playground: { html: consoleHtml, js: POLYFILL_BIND_PROMISE_ALL },
      result: `Hi, I am Asha from Pune
empty: []
rejected: fail
all: [ 'a', 42, 'c' ]`,
      explanation: `myBind captures the function (this), the context and preset arguments in a closure and later merges them with new arguments (partial application). promiseAll stores each value at its INDEX (so order matches the input, not finish time), counts completions, resolves when the count equals the length, rejects on the first error, wraps plain values like 42 with Promise.resolve, and resolves immediately for an empty array. The empty case prints first because it resolves synchronously; the rejection comes next (as a microtask); "all" waits for the 30 ms timer.`,
    },
    {
      title: 'Debounce and throttle in action',
      scenario: 'Simulate a user typing "react" quickly and a scroll event firing every 30 ms.',
      steps: ['Read debounce (clear + set timer) and throttle (compare timestamps)', 'Run', 'Count how many times each real function ran'],
      code: DEBOUNCE_THROTTLE,
      playground: { html: consoleHtml, js: DEBOUNCE_THROTTLE },
      result: `scroll handled: 1
scroll handled: 5
API call for: react
scroll handled: 9`,
      explanation: `Typing fires search 5 times, 20 ms apart, but each call resets the 100 ms timer, so the API is called ONCE with the final text "react" – that is debounce. The scroll handler is called 12 times (every 30 ms) but runs only at most once per 100 ms (events 1, 5, 9) – that is throttle. Both keep their state (timer / last time) in a closure. Exact numbers can shift by one on a busy machine because timers are not perfectly precise.`,
    },
    {
      title: 'Deep clone, flatten, curry, infinite sum and memoize',
      scenario: 'Five utility functions that are frequently asked as one-liners or follow-ups.',
      steps: ['Read each function', 'Run', 'Change values (e.g. flatten depth) and run again'],
      code: CLONE_FLATTEN_CURRY_MEMO,
      playground: { html: consoleHtml, js: CLONE_FLATTEN_CURRY_MEMO },
      result: `Pune 2 3
true true
[ 1, 2, 3, 4, 5 ]
[ 1, 2, [ 3, [ 4 ] ] ]
6 6 6
10
81 81 16 calls: 2`,
      explanation: `deepClone: changing the copy's nested address and skills did not affect the original (Pune, 2 skills). The WeakMap handles the circular "self" reference, and the Date stays a Date. flatten: depth Infinity flattens fully, depth 1 removes only one level. curry: works with any grouping of arguments because it compares the collected count with fn.length. sum(1)(2)(3)(4)() keeps returning functions until called with no argument. memoize: the second fastSquare(9) came from the cache, so the slow function ran only twice.`,
    },
    {
      title: 'Must-know array and string programs',
      scenario: 'The 10 programs most often asked in fresher and service-company rounds, each in its optimal form.',
      steps: ['Before reading each solution, try it yourself for 5 minutes', 'Run', 'Say the time complexity of each one out loud'],
      code: ARRAY_STRING_PROGRAMS,
      playground: { html: consoleHtml, js: ARRAY_STRING_PROGRAMS },
      result: `developer stack MERN
true false
true false
w null
[ 0, 1 ] [ 1, 2 ]
[ 3, 1, 2 ]
6
8
{ h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1 }
{ IT: [ 'A', 'C' ], HR: [ 'B' ] }`,
      explanation: `- reverseWords: split on one-or-more spaces after trim – O(n).
- isPalindrome: normalise (lowercase, remove non-alphanumerics), compare with reverse – O(n). A two-pointer version uses O(1) extra space.
- isAnagram: count characters of a, subtract with b – O(n) instead of sorting O(n log n).
- firstUnique: two passes with a frequency Map – O(n).
- twoSum: store each number's index in a Map and look up target − n – O(n) instead of O(n²).
- Remove duplicates: [...new Set(arr)] keeps first-occurrence order.
- maxSubArray (Kadane): extend the current sum or restart at the current number – O(n).
- secondLargest: single pass with two variables, ignores duplicates of the max.
- charFrequency and groupBy: reduce into an object; ||= creates the group array on first use (ES2024 also has Object.groupBy).`,
    },
  ],
  interview: [
    { level: 'Easy', q: 'What is a polyfill? How is it different from a transpiler?', a: `A polyfill is code that implements a missing API at runtime, e.g. adding Array.prototype.includes or Promise in an old browser by writing the function in plain JS.
A transpiler (Babel, TypeScript, esbuild) converts new SYNTAX into old syntax at build time, e.g. arrow functions → function expressions, optional chaining → ternaries. Syntax cannot be polyfilled; APIs can.
In practice tools like core-js (polyfills) + Babel/Vite (transpiling) are used together based on a browserslist target.` },
    { level: 'Medium', q: 'Write a polyfill for Array.prototype.map.', a: `Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this);
  }
  return result;
};
[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
Points to mention: use a normal function so this is the array; pass (element, index, array); support thisArg; return a NEW array of the same length; skip holes.` },
    { level: 'Medium', q: 'Write a polyfill for Array.prototype.filter.', a: `Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};
[1, 2, 3, 4].myFilter(n => n % 2 === 0); // [2, 4]
filter keeps the ORIGINAL element when the callback returns a truthy value; the result can be shorter than the input. O(n).` },
    { level: 'Medium', q: 'Write a polyfill for Array.prototype.reduce.', a: `Array.prototype.myReduce = function (callback, initialValue) {
  let i = 0;
  let acc = initialValue;
  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[0];
    i = 1;
  }
  for (; i < this.length; i++) acc = callback(acc, this[i], i, this);
  return acc;
};
[1, 2, 3].myReduce((s, n) => s + n, 0); // 6
Key detail: check arguments.length, not initialValue === undefined, because undefined can be a valid initial value.` },
    { level: 'Medium', q: 'Write a polyfill for Function.prototype.bind.', a: `Function.prototype.myBind = function (context, ...preset) {
  const fn = this;
  return function (...later) {
    return fn.apply(context, [...preset, ...later]);
  };
};
function greet(g, city) { return g + ' ' + this.name + ' from ' + city; }
greet.myBind({ name: 'Asha' }, 'Hi')('Pune'); // "Hi Asha from Pune"
Advanced point: a real bound function used with new ignores the bound this; you can handle it with if (new.target) return new fn(...preset, ...later).` },
    { level: 'Medium', q: 'Write polyfills for call and apply.', a: `Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;
  const key = Symbol('fn');
  ctx[key] = this;
  const res = ctx[key](...args);
  delete ctx[key];
  return res;
};
Function.prototype.myApply = function (ctx, args = []) {
  return this.myCall(ctx, ...args);
};
Idea: calling a function as a property of an object (ctx.fn()) sets this = ctx (implicit binding). A Symbol key avoids overwriting an existing property.` },
    { level: 'Hard', q: 'Implement Promise.all from scratch.', a: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const items = Array.from(promises);
    const results = new Array(items.length);
    let done = 0;
    if (items.length === 0) return resolve([]);
    items.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;            // keep input order
        if (++done === items.length) resolve(results);
      }, reject);                      // first rejection wins
    });
  });
}
Must-cover points: order by index (not push), counter instead of results.length, wrap non-promises, empty array, fail fast.` },
    { level: 'Hard', q: 'Implement Promise.allSettled and Promise.race.', a: `function allSettled(promises) {
  return Promise.all(Array.from(promises, (p) =>
    Promise.resolve(p).then(
      (value) => ({ status: 'fulfilled', value }),
      (reason) => ({ status: 'rejected', reason })
    )));
}
function race(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) Promise.resolve(p).then(resolve, reject);
  });
}
allSettled converts every outcome into a fulfilled object so Promise.all never rejects. race works because a promise can only settle once – the first resolve/reject call wins; later ones are ignored.` },
    { level: 'Easy', q: 'What is the difference between debounce and throttle? Give use cases.', a: `Debounce delays execution until events stop for a given time; every new event restarts the timer. The function runs once after the burst. Use: search suggestions, auto-save, resize end, validation.
Throttle guarantees the function runs at most once per interval during continuous events. Use: scroll handlers, infinite scroll, mousemove, rate-limiting button clicks.
Example: user types 10 letters in 1 s with debounce 300 ms → 1 API call. Scrolling for 2 s with throttle 200 ms → about 10 calls.` },
    { level: 'Medium', q: 'Implement debounce.', a: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
const onSearch = debounce((q) => fetchResults(q), 300);
input.addEventListener('input', (e) => onSearch(e.target.value));
The timer lives in a closure. apply keeps the original this and arguments. Extension: add debounced.cancel = () => clearTimeout(timer); and a leading/immediate option.` },
    { level: 'Medium', q: 'Implement throttle.', a: `// Timestamp version (runs on the leading edge)
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
// Timer version: let waiting = false; if (waiting) return; fn(...args); waiting = true; setTimeout(() => waiting = false, interval);
window.addEventListener('scroll', throttle(checkPosition, 200));
For a "trailing" call (to not lose the final event) keep the last args and schedule one call at the end of the interval.` },
    { level: 'Medium', q: 'How do you use debounce correctly in a React component?', a: `The debounced function must be created ONCE, not on every render; otherwise each render creates a new timer and nothing is debounced.
Option 1 – debounce the value with a custom hook:
function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
const debouncedQuery = useDebounce(query, 400); useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
Option 2 – keep a debounced function in useMemo/useRef and cancel it in the cleanup.` },
    { level: 'Hard', q: 'Write a deep clone function. What edge cases matter?', a: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value);
  if (seen.has(value)) return seen.get(value);       // circular refs
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) copy[key] = deepClone(value[key], seen);
  return copy;
}
Edge cases: null (typeof is 'object'), arrays vs objects, Date/RegExp/Map/Set, circular references (WeakMap), functions (usually copied by reference), symbols as keys, prototypes/class instances.
In production use structuredClone(value).` },
    { level: 'Medium', q: 'Why is JSON.parse(JSON.stringify(obj)) not a perfect deep clone?', a: `It loses or changes data:
- undefined values, functions and Symbols are removed.
- Date becomes an ISO string.
- NaN, Infinity become null.
- Map/Set become {}.
- Circular references throw TypeError.
- Class instances lose their prototype (become plain objects).
- BigInt throws.
It works for plain JSON-like data (API payloads). Prefer structuredClone, which handles Dates, Maps, Sets and cycles (but still not functions or DOM nodes).` },
    { level: 'Medium', q: 'Flatten a nested array without using Array.prototype.flat.', a: `// Recursive
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, item) =>
    Array.isArray(item) && depth > 0 ? acc.concat(flatten(item, depth - 1)) : acc.concat([item]), []);
}
// Iterative with a stack (no recursion limit)
function flattenIter(arr) {
  const stack = [...arr], out = [];
  while (stack.length) {
    const item = stack.pop();
    Array.isArray(item) ? stack.push(...item) : out.push(item);
  }
  return out.reverse();
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]. O(n) where n is total elements.` },
    { level: 'Medium', q: 'Flatten a nested object into dot-notation keys.', a: `function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flattenObject(value, path, out);
    else out[path] = value;
  }
  return out;
}
flattenObject({ user: { name: 'A', address: { city: 'Pune' } }, active: true });
// { 'user.name': 'A', 'user.address.city': 'Pune', active: true }
Real use: MongoDB $set with nested fields, form libraries, i18n keys.` },
    { level: 'Medium', q: 'What is currying? Implement a generic curry function.', a: `Currying converts a function of many arguments into a chain of functions each taking one (or some) arguments: f(a, b, c) → f(a)(b)(c).
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); add(1, 2)(3); // 6
Uses: partial application and reusable configured functions, e.g. const logError = log('error'); Express middleware factories like auth('admin') are the same idea.` },
    { level: 'Medium', q: 'Implement sum(1)(2)(3)...() that returns the total when called with no argument.', a: `const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
sum(1)(2)(3)(4)(); // 10
Each call returns a new function that closes over the running total. When called with no argument it returns the total.
Variation without the final (): override valueOf/toString on the returned function so it converts to a number in +sum(1)(2).` },
    { level: 'Medium', q: 'What is memoization? Implement memoize.', a: `Memoization caches a function's results by its input so the same input is computed only once. Works only for pure functions (same input → same output, no side effects).
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
Examples: memoized fibonacci goes from O(2^n) to O(n). In React: useMemo, useCallback, React.memo. Caveat: the cache grows forever – add a size limit (LRU) in real apps.` },
    { level: 'Easy', q: 'Reverse a string, and reverse the words of a sentence.', a: `const reverse = (s) => [...s].reverse().join('');      // spread handles emojis/unicode better than split('')
const reverseWords = (s) => s.trim().split(/\\s+/).reverse().join(' ');
reverse('hello');               // 'olleh'
reverseWords('  I love  JS ');  // 'JS love I'
Without built-ins: loop from the end and build the string (or two pointers on an array of chars). Both are O(n).` },
    { level: 'Easy', q: 'Check whether a string is a palindrome.', a: `function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let i = 0, j = t.length - 1;
  while (i < j) {
    if (t[i] !== t[j]) return false;
    i++; j--;
  }
  return true;
}
isPalindrome('Madam'); // true
Two pointers: O(n) time, O(1) extra space (after cleaning). Ask the interviewer whether case and punctuation should be ignored.` },
    { level: 'Easy', q: 'Remove duplicates from an array. Give multiple ways.', a: `const arr = [3, 1, 3, 2, 1];
1. [...new Set(arr)]                               // [3, 1, 2] – O(n), simplest
2. arr.filter((x, i) => arr.indexOf(x) === i)      // O(n²)
3. arr.reduce((acc, x) => (acc.includes(x) ? acc : [...acc, x]), [])
For objects, dedupe by a key: [...new Map(users.map(u => [u.id, u])).values()].
Set uses SameValueZero, so NaN is deduplicated too, but two different objects with the same content are not.` },
    { level: 'Medium', q: 'Find the first non-repeating character in a string.', a: `function firstUnique(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
  for (const ch of s) if (freq.get(ch) === 1) return ch;
  return null;
}
firstUnique('swiss'); // 'w'
Two passes, O(n) time, O(k) space for k distinct characters. A Map keeps insertion order, so you could also loop over the map.` },
    { level: 'Medium', q: 'Two Sum: return indices of two numbers that add up to a target.', a: `function twoSum(nums, target) {
  const seen = new Map();               // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
twoSum([2, 7, 11, 15], 9); // [0, 1]
Brute force with two loops is O(n²); the hash map makes it O(n) time, O(n) space. If the array is sorted, two pointers give O(1) space.` },
    { level: 'Medium', q: 'Check if two strings are anagrams.', a: `function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const ch of a) count[ch] = (count[ch] || 0) + 1;
  for (const ch of b) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
isAnagram('listen', 'silent'); // true
Sorting both ([...a].sort().join('') === [...b].sort().join('')) is shorter but O(n log n); counting is O(n).` },
    { level: 'Hard', q: 'Find the length of the longest substring without repeating characters.', a: `Sliding window with a map of last-seen indices:
function longestUnique(s) {
  const last = new Map();
  let start = 0, best = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (last.has(ch) && last.get(ch) >= start) start = last.get(ch) + 1;
    last.set(ch, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
longestUnique('abcabcbb'); // 3 ('abc')
O(n) time, O(k) space. Explain the window: expand the end, move the start past the previous duplicate.` },
    { level: 'Medium', q: 'Find the maximum subarray sum (Kadane\'s algorithm).', a: `function maxSubArray(nums) {
  let best = nums[0], current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend or restart
    best = Math.max(best, current);
  }
  return best;
}
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]); // 6 ([4, -1, 2, 1])
O(n) time, O(1) space. Starting with nums[0] (not 0) handles all-negative arrays correctly.` },
    { level: 'Easy', q: 'Why does [10, 9, 1, 100].sort() give [1, 10, 100, 9]? How do you sort numbers?', a: `Without a compare function, sort converts elements to strings and compares them by UTF-16 code units, so '10' < '100' < '9'.
Correct numeric sort: arr.sort((a, b) => a - b) (ascending) or (b - a) for descending.
sort mutates the original array; use arr.toSorted((a, b) => a - b) (ES2023) or [...arr].sort(...) to keep the original – important in React state.
Sorting objects: users.sort((a, b) => a.name.localeCompare(b.name)).` },
    { level: 'Medium', q: 'Implement a simple EventEmitter (on, off, emit, once).', a: `class EventEmitter {
  #events = new Map();
  on(name, fn) { (this.#events.get(name) ?? this.#events.set(name, []).get(name)).push(fn); return this; }
  off(name, fn) { this.#events.set(name, (this.#events.get(name) || []).filter((f) => f !== fn && f.original !== fn)); return this; }
  once(name, fn) { const w = (...a) => { this.off(name, w); fn(...a); }; w.original = fn; return this.on(name, w); }
  emit(name, ...args) { [...(this.#events.get(name) || [])].forEach((fn) => fn(...args)); return this.#events.has(name); }
}
Used to show understanding of the observer pattern – Node's events module and DOM events work this way. Copying the array before emit avoids bugs when a listener removes itself.` },
  ],
  practice: [
    {
      task: 'Write a polyfill myIncludes for Array.prototype.includes that also finds NaN (unlike indexOf).',
      hint: 'Compare with === but treat NaN specially using Number.isNaN, or use Object.is-like SameValueZero.',
      solution: `Array.prototype.myIncludes = function (search, fromIndex = 0) {
  const len = this.length;
  let i = fromIndex >= 0 ? fromIndex : Math.max(len + fromIndex, 0);
  for (; i < len; i++) {
    const el = this[i];
    if (el === search || (Number.isNaN(el) && Number.isNaN(search))) return true;
  }
  return false;
};

console.log([1, 2, NaN].myIncludes(NaN)); // true
console.log([1, 2, NaN].indexOf(NaN));    // -1
console.log([1, 2, 3].myIncludes(1, 1));  // false`,
    },
    {
      task: 'Implement debounce with a cancel() method and an optional leading flag (call on the first event instead of the last).',
      hint: 'Keep timer in a closure. For leading: call immediately if no timer is running, then block until delay passes.',
      solution: `function debounce(fn, delay, { leading = false } = {}) {
  let timer = null;
  function debounced(...args) {
    const callNow = leading && timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  }
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

const log = debounce((x) => console.log('trailing', x), 100);
log(1); log(2); log(3);           // after 100 ms: trailing 3
const lead = debounce((x) => console.log('leading', x), 100, { leading: true });
lead('a'); lead('b'); lead('c');  // immediately: leading a`,
    },
    {
      task: 'Write chunk(arr, size) that splits an array into groups of size, and a function that rotates an array right by k steps.',
      hint: 'chunk: loop i += size with slice. rotate: k % n, then slice and concat.',
      solution: `function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function rotateRight(arr, k) {
  const n = arr.length;
  if (n === 0) return [];
  k = k % n;
  return [...arr.slice(n - k), ...arr.slice(0, n - k)];
}

console.log(chunk([1, 2, 3, 4, 5], 2));          // [[1, 2], [3, 4], [5]]
console.log(rotateRight([1, 2, 3, 4, 5], 2));    // [4, 5, 1, 2, 3]
console.log(rotateRight([1, 2, 3], 4));          // [3, 1, 2]`,
    },
    {
      task: 'Write a memoized fibonacci and compare the number of calls with the naive recursive version for n = 25.',
      hint: 'Count calls with a counter variable; use a Map or object as cache.',
      solution: `let naiveCalls = 0;
function fibNaive(n) {
  naiveCalls++;
  return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}

let memoCalls = 0;
const fibMemo = (() => {
  const cache = new Map();
  return function fib(n) {
    memoCalls++;
    if (n < 2) return n;
    if (cache.has(n)) return cache.get(n);
    const value = fib(n - 1) + fib(n - 2);
    cache.set(n, value);
    return value;
  };
})();

console.log(fibNaive(25), 'naive calls:', naiveCalls); // 75025 naive calls: 242785
console.log(fibMemo(25), 'memo calls:', memoCalls);    // 75025 memo calls: 49`,
    },
    {
      task: 'Write getByPath(obj, "a.b.0.c", defaultValue) similar to lodash.get, returning the default when any part is missing.',
      hint: 'Split the path by ".", walk with reduce and optional chaining; check for undefined at the end.',
      solution: `function getByPath(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.replace(/\\[(\\d+)\\]/g, '.$1').split('.');
  const result = keys.reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  return result === undefined ? defaultValue : result;
}

const data = { user: { orders: [{ id: 7, items: ['pen'] }] } };
console.log(getByPath(data, 'user.orders.0.id'));            // 7
console.log(getByPath(data, 'user.orders[0].items[0]'));     // pen
console.log(getByPath(data, 'user.address.city', 'N/A'));    // N/A`,
    },
  ],
  quiz: [
    {
      question: 'Why must an Array.prototype polyfill use a normal function instead of an arrow function?',
      options: ['Arrow functions are slower', 'Arrow functions cannot return arrays', 'Arrow functions cannot take callbacks', 'A normal function gets this = the array it is called on; an arrow function would not'],
      answer: 3,
      explanation: 'Arrow functions take this from the surrounding scope, so this would not refer to the array.',
    },
    {
      question: 'A search box should call the API only after the user stops typing for 300 ms. Which technique?',
      options: ['Debounce', 'Throttle', 'Memoize', 'Curry'],
      answer: 0,
      explanation: 'Debounce waits for a pause in events; every keystroke resets the timer.',
    },
    {
      question: 'In a Promise.all polyfill, why store results with results[i] = value instead of results.push(value)?',
      options: ['push is slower', 'To keep the output in the same order as the input, regardless of which finishes first', 'push does not work inside then', 'To avoid a memory leak'],
      answer: 1,
      explanation: 'Promises finish in any order; indexing by position preserves input order, as the real Promise.all does.',
    },
    {
      question: 'What is the time complexity of Two Sum using a hash map?',
      options: ['O(n²)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 2,
      explanation: 'One pass with O(1) average map lookups gives O(n) time and O(n) space.',
    },
    {
      question: 'Which value is NOT correctly preserved by JSON.parse(JSON.stringify(obj))?',
      options: ['A nested array of numbers', 'A string property', 'A boolean property', 'A Date object (it becomes a string)'],
      answer: 3,
      explanation: 'Dates become ISO strings; functions and undefined disappear; circular references throw. Use structuredClone instead.',
    },
  ],
};
