export default {
  id: 'extra-01-javascript-fundamentals-interview',
  title: 'JavaScript Fundamentals Interview: var/let/const, Hoisting, TDZ, Scope, Closures, this, == vs ===, Prototypes, Classes',
  module: 'Interview: JavaScript',
  extraNo: 1,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'The JavaScript core questions that open almost every MERN interview: variables, hoisting, scope, closures, this, equality, truthy/falsy, prototypes and classes. Revise the notes, practise the output questions, then rehearse the 28 interview answers aloud.',
  objectives: [
    'Explain var, let and const, hoisting and the Temporal Dead Zone with a code example',
    'Define scope, lexical scope and closures and give real uses of closures',
    'Predict the value of this in regular functions, methods, arrow functions, bind/call/apply and classes',
    'Answer == vs ===, truthy/falsy and type-coercion output questions confidently',
    'Explain prototypal inheritance, the prototype chain and how ES6 classes map onto it',
  ],
  theory: [
    {
      heading: 'var, let, const, hoisting and the TDZ',
      content: `**var** is function-scoped, can be re-declared, and is hoisted and initialised with \`undefined\`. **let** and **const** are block-scoped (\`{ }\`), cannot be re-declared in the same scope, and are hoisted but NOT initialised.

**Hoisting** means the engine registers all declarations of a scope before running its code (during the creation phase of the execution context). So:
- \`var x\` → exists as \`undefined\` from the top of the function.
- function declarations → fully hoisted (you can call them before the line).
- \`let\` / \`const\` / \`class\` → hoisted but stay in the **Temporal Dead Zone (TDZ)** until the declaration line runs. Touching them earlier throws \`ReferenceError: Cannot access 'x' before initialization\`.
- function expressions / arrow functions assigned to \`var\` → only the variable is hoisted (as undefined), so calling early gives \`TypeError: x is not a function\`.

**const** means the *binding* cannot be reassigned. It does not make the value immutable: \`const arr = []; arr.push(1)\` is fine. Use \`Object.freeze\` for shallow immutability.

**Rule to say in interviews:** "I use const by default, let when I must reassign, and never var in modern code."`,
      syntax: `console.log(a); // undefined  (var hoisted + initialised)
var a = 1;

console.log(b); // ReferenceError (TDZ)
let b = 2;

const user = { name: 'Asha' };
user.name = 'Ravi';  // OK - object is mutable
// user = {};        // TypeError: Assignment to constant variable`,
      tip: 'How to answer: give the 3-column comparison (scope, re-declare, hoisting/TDZ), then show one 3-line code example. Interviewers love it when you say "let/const ARE hoisted, but they are in the TDZ".',
    },
    {
      heading: 'Scope, lexical scope and the scope chain',
      content: `**Scope** decides where a variable can be accessed. JavaScript has:
- **Global scope** – declared outside any function/block.
- **Function scope** – \`var\` and everything inside a function.
- **Block scope** – \`let\`/\`const\` inside \`{ }\` (if, for, while, plain blocks).
- **Module scope** – top-level variables in an ES module are private to that module.

**Lexical (static) scope** means a function's scope is decided by WHERE it is written in the code, not where it is called. When a variable is not found locally, the engine walks outward through parent scopes – the **scope chain** – up to global. If not found anywhere: ReferenceError (or an accidental global in sloppy mode when assigning).

**Shadowing**: an inner variable with the same name hides the outer one. Illegal shadowing: \`let x\` outside and \`var x\` inside a block of the same function is a SyntaxError.`,
      tip: 'Always mention "lexical" — it is the bridge to closures, which is usually the next question.',
    },
    {
      heading: 'Closures',
      content: `A **closure** is a function bundled together with references to the variables of the scope where it was created. The inner function "remembers" those variables even after the outer function has returned.

Real uses (say at least two in an interview):
1. **Data privacy / encapsulation** – counter, bank account with private balance.
2. **Function factories** – \`multiplyBy(2)\` returns a doubling function.
3. **Callbacks and event handlers** – a handler remembers the item it was created for.
4. **Memoization, debounce, throttle, once** – they keep a cache/timer in a closure.
5. **Module pattern** (IIFE) before ES modules.

**Classic trap:** \`for (var i...)\` with \`setTimeout\` prints the final value 3 times because all callbacks close over ONE shared \`i\`. Fix: use \`let\` (a new binding per iteration) or an IIFE.

**Downside:** closures keep variables alive, so a long-lived closure holding a big object can cause a memory leak.`,
      syntax: `function makeCounter() {
  let count = 0;            // private
  return () => ++count;     // closure over count
}
const next = makeCounter();
next(); next(); // 2`,
      tip: 'Definition in one line: "A closure is a function plus its lexical environment." Then show the counter. Then give one real use (debounce or private state).',
    },
    {
      heading: 'The this keyword, call/apply/bind and arrow functions',
      content: `**this** is decided by HOW a function is called (except arrow functions):
1. **new binding** – \`new Fn()\` → this = the new object.
2. **Explicit binding** – \`fn.call(obj, a, b)\`, \`fn.apply(obj, [a, b])\`, \`fn.bind(obj)\` (bind returns a new function, permanently bound).
3. **Implicit binding** – \`obj.method()\` → this = obj (the object left of the dot).
4. **Default binding** – plain \`fn()\` → \`undefined\` in strict mode / modules / classes, the global object (window) in sloppy mode.

**Arrow functions** have no own \`this\`; they use \`this\` from the surrounding lexical scope. That is why they are great inside methods for callbacks (\`setTimeout\`, \`map\`), but bad as object methods.

**Losing this:** \`const f = obj.method; f()\` → default binding, this is lost. Common in React class components and event listeners; fix with bind or arrow functions.`,
      syntax: `function show(greet, mark) { return greet + ' ' + this.name + mark; }
const p = { name: 'Asha' };
show.call(p, 'Hi', '!');      // "Hi Asha!"
show.apply(p, ['Hi', '?']);   // "Hi Asha?"
const b = show.bind(p, 'Yo');
b('.');                       // "Yo Asha."`,
      tip: 'Answer with the 4 rules in priority order: new > explicit (bind/call/apply) > implicit (obj.) > default. Then mention the arrow-function exception.',
    },
    {
      heading: 'Equality, type coercion, truthy and falsy',
      content: `**===** (strict equality) compares value AND type, no conversion. **==** (loose equality) converts types first (coercion) and then compares.

Important coercion facts:
- \`null == undefined\` is true, but neither equals anything else with == (\`null == 0\` is false).
- \`NaN\` is not equal to anything, even itself. Use \`Number.isNaN(x)\` or \`Object.is(x, NaN)\`.
- \`Object.is\` is like === but \`Object.is(NaN, NaN)\` is true and \`Object.is(0, -0)\` is false.
- Objects compare by **reference**: \`{} === {}\` is false.
- \`+\` with a string concatenates (\`"5" + 2 = "52"\`); other math operators convert to number (\`"5" - 2 = 3\`).

**Falsy values (only 8):** \`false, 0, -0, 0n, "", null, undefined, NaN\`. Everything else is truthy, including \`"0"\`, \`"false"\`, \`[]\`, \`{}\` and functions.

**Nullish operators:** \`a ?? b\` uses b only when a is null/undefined (unlike \`||\`, which also skips 0 and ""). \`obj?.a?.b\` safely reads nested properties.`,
      tip: 'Say: "I always use === except the common idiom x == null to check both null and undefined." That shows you know both sides.',
    },
    {
      heading: 'Prototypes, prototype chain and ES6 classes',
      content: `Every object has a hidden link \`[[Prototype]]\` (read it with \`Object.getPrototypeOf(obj)\`, or the legacy \`__proto__\`). When a property is not found on the object, JS looks up the **prototype chain** until it reaches \`Object.prototype\` and then \`null\`. This is **prototypal inheritance**: objects inherit directly from other objects.

Functions have a \`prototype\` property; objects created with \`new Fn()\` get \`Fn.prototype\` as their [[Prototype]]. Methods placed on the prototype are shared by all instances (memory efficient).

**ES6 classes are syntactic sugar** over constructor functions and prototypes:
- \`class Dog extends Animal\` sets up the chain Dog.prototype → Animal.prototype.
- \`super(...)\` must be called before using \`this\` in a derived constructor.
- \`static\` members belong to the class itself, not instances.
- **Private fields** \`#secret\` (ES2022) are truly private; getters/setters with \`get\`/\`set\`.
- Classes are not hoisted for use (TDZ), and class bodies always run in strict mode.

Other ways to create objects with a prototype: \`Object.create(proto)\`, object literals (prototype is Object.prototype).`,
      syntax: `const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;
rabbit.eats;                              // true (from prototype)
Object.getPrototypeOf(rabbit) === animal; // true`,
      tip: 'If asked "Is JS object-oriented?": "Yes, but it is prototype-based. Classes are syntax sugar over prototypes." Then sketch the chain d → Dog.prototype → Animal.prototype → Object.prototype → null.',
    },
  ],
  examples: [
    {
      title: 'Output question: hoisting and TDZ',
      scenario: 'A very common first-round question: predict the output and explain each line.',
      steps: ['Read the code and write your predicted output', 'Click Run', 'Compare with the result and read the explanation'],
      code: `console.log(a);
var a = 10;
greet();
function greet() { console.log("Hello from greet"); }
try {
  console.log(b);
  let b = 20;
} catch (e) {
  console.log(e.name + ": " + e.message);
}
try {
  sayHi();
  var sayHi = function () { console.log("hi"); };
} catch (e) {
  console.log(e.name + ": " + e.message);
}`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `console.log(a);
var a = 10;
greet();
function greet() { console.log("Hello from greet"); }
try {
  console.log(b);
  let b = 20;
} catch (e) {
  console.log(e.name + ": " + e.message);
}
try {
  sayHi();
  var sayHi = function () { console.log("hi"); };
} catch (e) {
  console.log(e.name + ": " + e.message);
}`,
      },
      result: `undefined
Hello from greet
ReferenceError: Cannot access 'b' before initialization
TypeError: sayHi is not a function`,
      explanation: `1. var a is hoisted and initialised to undefined, so the log prints undefined (not an error).
2. greet is a function declaration – fully hoisted with its body, so it runs.
3. let b is hoisted inside the try block but is in the TDZ, so reading it throws ReferenceError.
4. var sayHi is hoisted as undefined; calling undefined() throws TypeError "is not a function". Only the variable is hoisted, not the function expression.`,
    },
    {
      title: 'Output question: closures in loops (var vs let) and a private counter',
      scenario: 'Interviewers use this to check closures, block scope and the event loop together.',
      steps: ['Predict the output order', 'Run the code', 'Notice the synchronous line prints first'],
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
}
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1.increment(); c1.increment();
c2.increment();
console.log("c1:", c1.get(), "c2:", c2.get());`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
}
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1.increment(); c1.increment();
c2.increment();
console.log("c1:", c1.get(), "c2:", c2.get());`,
      },
      result: `c1: 2 c2: 1
var: 3
var: 3
var: 3
let: 0
let: 1
let: 2`,
      explanation: `The synchronous console.log runs first; timers run later. With var there is ONE i shared by all three callbacks, and by the time they run the loop has finished, so i is 3. With let, each iteration creates a NEW binding j, so each callback closes over its own value. c1 and c2 are separate closures – each call of makeCounter creates a fresh count, so they do not share state.`,
    },
    {
      title: 'Output question: the value of this',
      scenario: 'Predict this in methods, arrow functions, callbacks, detached methods and bind.',
      steps: ['Note the "use strict" line', 'Predict each of the 7 lines', 'Run and compare'],
      code: `"use strict";
const user = {
  name: "Asha",
  regular() { return this.name; },
  arrow: () => this === user,
  delayed() {
    return [1].map(function () { return this; })[0];
  },
  delayedArrow() {
    return [1].map(() => this.name)[0];
  },
};
console.log(user.regular());
console.log(user.arrow());
console.log(user.delayed());
console.log(user.delayedArrow());
const fn = user.regular;
try { console.log(fn()); } catch (e) { console.log(e.name + ": " + e.message); }
const bound = user.regular.bind({ name: "Ravi" });
console.log(bound());
console.log(bound.call({ name: "Meena" }));`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `"use strict";
const user = {
  name: "Asha",
  regular() { return this.name; },
  arrow: () => this === user,
  delayed() {
    return [1].map(function () { return this; })[0];
  },
  delayedArrow() {
    return [1].map(() => this.name)[0];
  },
};
console.log(user.regular());
console.log(user.arrow());
console.log(user.delayed());
console.log(user.delayedArrow());
const fn = user.regular;
try { console.log(fn()); } catch (e) { console.log(e.name + ": " + e.message); }
const bound = user.regular.bind({ name: "Ravi" });
console.log(bound());
console.log(bound.call({ name: "Meena" }));`,
      },
      result: `Asha
false
undefined
Asha
TypeError: Cannot read properties of undefined (reading 'name')
Ravi
Ravi`,
      explanation: `1. user.regular() – implicit binding, this = user.
2. The arrow function takes this from the outer (top-level) scope, NOT from user, so this === user is false. Arrow functions are a bad choice for object methods.
3. A normal function callback inside map is called plainly, so in strict mode this is undefined.
4. The arrow callback inherits this from delayedArrow, which was called as user.delayedArrow(), so this.name is "Asha".
5. fn() is a detached method: default binding → undefined in strict mode → TypeError.
6-7. bind creates a permanently bound function; even call() cannot change it, so both print "Ravi".`,
    },
    {
      title: 'Output question: == vs ===, coercion, typeof and truthy/falsy',
      scenario: 'A rapid-fire coercion round. Many candidates lose marks here.',
      steps: ['Write all 13 answers on paper', 'Run the code', 'Read the explanation for every line you got wrong'],
      code: `console.log(1 == "1");
console.log(1 === "1");
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
console.log([] == false);
console.log([] + []);
console.log([] + {});
console.log("5" - 2, "5" + 2);
console.log(typeof null, typeof NaN, typeof []);
console.log(Boolean(""), Boolean("0"), Boolean([]), Boolean({}));
console.log(0.1 + 0.2 === 0.3);`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `console.log(1 == "1");
console.log(1 === "1");
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
console.log([] == false);
console.log([] + []);
console.log([] + {});
console.log("5" - 2, "5" + 2);
console.log(typeof null, typeof NaN, typeof []);
console.log(Boolean(""), Boolean("0"), Boolean([]), Boolean({}));
console.log(0.1 + 0.2 === 0.3);`,
      },
      result: `true
false
true
false
false
true
true
(empty line)
[object Object]
3 52
object number object
false true true true
false`,
      explanation: `- 1 == "1": the string is converted to number 1 → true. === checks type too → false.
- null == undefined is a special rule → true; with === they are different types → false.
- NaN is never equal to itself; Object.is treats it as equal.
- [] == false: false → 0, [] → "" → 0, so 0 == 0 → true (but [] is truthy in an if!).
- [] + [] → "" + "" = empty string; [] + {} → "" + "[object Object]".
- "5" - 2 converts to number (3); "5" + 2 concatenates ("52").
- typeof null is "object" (a historic bug), typeof NaN is "number", arrays are "object" (use Array.isArray).
- Only "" is falsy here; "0", [] and {} are truthy.
- Floating point: 0.1 + 0.2 is 0.30000000000000004. Compare with Math.abs(a - b) < Number.EPSILON.`,
    },
    {
      title: 'Prototype chain with constructor functions and classes',
      scenario: 'Show that classes are sugar over prototypes, plus static and private fields.',
      steps: ['Read the class Dog that extends a constructor function', 'Run', 'Draw the prototype chain on paper'],
      code: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound"; };
class Dog extends Animal {
  #tricks = [];
  static count = 0;
  constructor(name) { super(name); Dog.count++; }
  speak() { return super.speak() + " (woof)"; }
  learn(t) { this.#tricks.push(t); return this; }
  get tricks() { return [...this.#tricks]; }
}
const d = new Dog("Tommy");
console.log(d.speak());
console.log(d.learn("sit").learn("roll").tricks);
console.log(Object.getPrototypeOf(d) === Dog.prototype);
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
console.log(d instanceof Animal, Dog.count);
console.log(d.hasOwnProperty("name"), d.hasOwnProperty("speak"));
console.log(typeof Dog);`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound"; };
class Dog extends Animal {
  #tricks = [];
  static count = 0;
  constructor(name) { super(name); Dog.count++; }
  speak() { return super.speak() + " (woof)"; }
  learn(t) { this.#tricks.push(t); return this; }
  get tricks() { return [...this.#tricks]; }
}
const d = new Dog("Tommy");
console.log(d.speak());
console.log(d.learn("sit").learn("roll").tricks);
console.log(Object.getPrototypeOf(d) === Dog.prototype);
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
console.log(d instanceof Animal, Dog.count);
console.log(d.hasOwnProperty("name"), d.hasOwnProperty("speak"));
console.log(typeof Dog);`,
      },
      result: `Tommy makes a sound (woof)
[ 'sit', 'roll' ]
true
true
true 1
true false
function`,
      explanation: `A class can extend a plain constructor function because both work through prototypes. The chain is d → Dog.prototype → Animal.prototype → Object.prototype → null. name is an own property (set in the constructor), while speak lives on the prototype, so hasOwnProperty("speak") is false. #tricks is a private field (cannot be read from outside), learn returns this to allow method chaining, static count belongs to Dog itself, and typeof Dog is "function" – proof that classes are functions under the hood. (The browser console may show the array as Array(2).)`,
    },
  ],
  interview: [
    { level: 'Easy', q: 'What is the difference between var, let and const?', a: `- Scope: var is function-scoped; let and const are block-scoped.
- Re-declaration: var can be re-declared in the same scope; let/const cannot.
- Reassignment: var and let can be reassigned; const cannot (but the object it points to can still be mutated).
- Hoisting: var is hoisted and initialised to undefined; let/const are hoisted but stay in the Temporal Dead Zone until their line runs.
- Global object: a top-level var becomes a property of window; let/const do not.
Example: if (true) { var a = 1; let b = 2; } console.log(a); // 1, console.log(b); // ReferenceError.
In modern code I use const by default, let when reassignment is needed, and avoid var.` },
    { level: 'Easy', q: 'What is hoisting?', a: `Hoisting is JavaScript's behaviour of registering declarations in memory during the creation phase of an execution context, before the code runs. It looks like declarations are "moved to the top".
- var → hoisted, initialised to undefined.
- function declarations → hoisted with their full body (callable before definition).
- let, const, class → hoisted but uninitialised (TDZ) → ReferenceError if accessed early.
- function expressions/arrow functions → only the variable is hoisted.
Example: console.log(x); var x = 5; prints undefined, not an error.` },
    { level: 'Medium', q: 'What is the Temporal Dead Zone (TDZ)?', a: `The TDZ is the time between entering a scope and the line where a let/const/class variable is declared. During this time the variable exists (it is hoisted) but cannot be read or written; doing so throws ReferenceError: Cannot access 'x' before initialization.
Example:
{
  console.log(x); // ReferenceError
  let x = 1;
}
Why it exists: to catch bugs where a variable is used before it is set, which var silently allows (giving undefined). Even typeof x throws inside the TDZ.` },
    { level: 'Easy', q: 'Is const really constant? Can you change an object declared with const?', a: `const makes the BINDING constant, not the value. You cannot reassign the variable, but you can mutate the object or array it points to.
const arr = [1]; arr.push(2); // OK
arr = [];                     // TypeError
To prevent mutation use Object.freeze(obj) (shallow – nested objects stay mutable) or structuredClone + freeze for deep cases, or immutable update patterns (spread) as in React.` },
    { level: 'Easy', q: 'What is scope? What types of scope exist in JavaScript?', a: `Scope is the region of code where a variable is accessible.
1. Global scope – available everywhere.
2. Function scope – variables declared inside a function (including var).
3. Block scope – let/const inside { } of if/for/while.
4. Module scope – top-level variables in an ES module are private to that file.
When a variable is used, JS searches the current scope and then outer scopes (the scope chain) until global.` },
    { level: 'Medium', q: 'What is lexical scope?', a: `Lexical (static) scope means the accessible variables of a function are decided by where the function is WRITTEN in the source code, not where it is called from.
const x = 'global';
function outer() { const x = 'outer'; function inner() { return x; } return inner; }
outer()(); // 'outer' – inner looks in the scope where it was defined.
Lexical scope is what makes closures possible.` },
    { level: 'Easy', q: 'What is a closure? Give an example.', a: `A closure is a function together with references to the variables of the scope in which it was created. The function can access those variables even after the outer function has finished.
function makeCounter() {
  let count = 0;
  return function () { return ++count; };
}
const next = makeCounter();
next(); // 1
next(); // 2
count is not accessible from outside, but the returned function still remembers it. That is a closure.` },
    { level: 'Medium', q: 'Where are closures used in real projects?', a: `- Data privacy: private variables in a module or factory (e.g. a cache or counter that cannot be changed from outside).
- Function factories: const double = multiplyBy(2).
- Event handlers/callbacks that remember data: items.forEach(item => btn.onclick = () => open(item.id)).
- Utilities: debounce and throttle keep a timer id in a closure; memoize keeps a cache; once keeps a "called" flag.
- React: every hook callback is a closure over the props/state of that render (that is also the source of the "stale closure" bug).
- Middleware factories in Express: const auth = (role) => (req, res, next) => { ... }.` },
    { level: 'Medium', q: 'Predict the output: for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); How do you fix it?', a: `Output: 3 3 3. var creates one function-scoped i shared by all callbacks; when the timers run, the loop is done and i is 3.
Fixes:
1. Use let: for (let i = 0; ...) – a new binding per iteration → 0 1 2.
2. IIFE: for (var i = 0; i < 3; i++) ((j) => setTimeout(() => console.log(j), 0))(i);
3. Pass the value as an extra argument: setTimeout(console.log, 0, i).` },
    { level: 'Medium', q: 'Can closures cause memory leaks?', a: `Yes. A closure keeps its outer variables alive as long as the closure itself is reachable. If a long-lived closure (an event listener, a setInterval callback, a global cache) references a large object, that object can never be garbage collected.
Example: an interval that closes over a huge array and is never cleared.
Prevention: remove event listeners, clearInterval/clearTimeout, set references to null when done, use WeakMap for caches keyed by objects, and in React return cleanup functions from useEffect.` },
    { level: 'Medium', q: 'How is the value of this determined in JavaScript?', a: `By how the function is called (priority order):
1. new binding: new Person() → this is the new object.
2. Explicit binding: call/apply/bind → this is the passed object.
3. Implicit binding: obj.method() → this is obj.
4. Default binding: plain fn() → undefined in strict mode (and inside classes/ES modules), the global object in sloppy mode.
Arrow functions ignore these rules and take this from the enclosing lexical scope.
In the browser, inside a DOM event listener written as a normal function, this is the element.` },
    { level: 'Easy', q: 'What is the difference between call, apply and bind?', a: `All three set this explicitly.
- call(thisArg, a, b) – calls immediately, arguments one by one.
- apply(thisArg, [a, b]) – calls immediately, arguments as an array.
- bind(thisArg, a) – does NOT call; returns a new function with this (and optionally some arguments) permanently fixed.
function intro(city) { return this.name + ' from ' + city; }
intro.call({ name: 'Asha' }, 'Pune');
intro.apply({ name: 'Asha' }, ['Pune']);
const f = intro.bind({ name: 'Asha' }); f('Pune');
Use bind for callbacks you pass around (event handlers), apply when you already have an array of arguments (now often replaced by spread).` },
    { level: 'Medium', q: 'How are arrow functions different from regular functions?', a: `1. No own this – they use this from the surrounding scope (lexical this). call/apply/bind cannot change it.
2. No arguments object – use rest parameters (...args).
3. Cannot be used as constructors – new on an arrow throws TypeError; they have no prototype property.
4. Shorter syntax and implicit return for single expressions: x => x * 2.
5. Cannot be generators.
Use arrows for callbacks (map, setTimeout, promise chains); use regular functions/method syntax for object methods and constructors.` },
    { level: 'Easy', q: 'What is the difference between == and ===?', a: `=== (strict equality) compares value and type without conversion. == (loose equality) converts the operands to a common type first (type coercion).
1 == '1'   // true
1 === '1'  // false
0 == false // true
null == undefined // true, null === undefined // false
Best practice: always use === to avoid surprises; the only accepted == idiom is value == null to check null or undefined together.` },
    { level: 'Easy', q: 'What are truthy and falsy values?', a: `When a value is used in a boolean context (if, &&, ||, !), it is converted to true or false.
Falsy values (only these 8): false, 0, -0, 0n, '' (empty string), null, undefined, NaN.
Everything else is truthy, including '0', 'false', ' ', [], {}, and functions.
if ([]) console.log('runs'); // runs, because an empty array is truthy
To check an empty array use arr.length === 0.` },
    { level: 'Medium', q: 'What is the difference between || and ?? (nullish coalescing)?', a: `|| returns the right side if the left side is ANY falsy value. ?? returns the right side only if the left side is null or undefined.
const count = 0;
count || 10  // 10 (0 is falsy – often a bug)
count ?? 10  // 0
Use ?? for default values where 0, '' or false are valid (page numbers, quantities, form fields). Related: ??= assigns only if null/undefined, and ?. (optional chaining) safely reads nested properties: user?.address?.city.` },
    { level: 'Medium', q: 'Why is typeof null "object"? How do you check types correctly?', a: `typeof null === 'object' is a bug from the first version of JavaScript (null had the object type tag) that was never fixed for backward compatibility.
Correct checks:
- null: value === null
- array: Array.isArray(value)
- NaN: Number.isNaN(value)
- plain object: value !== null && typeof value === 'object' && !Array.isArray(value)
- precise tag: Object.prototype.toString.call(value) // '[object Date]'
typeof function is 'function', typeof NaN is 'number'.` },
    { level: 'Easy', q: 'What are the primitive data types in JavaScript? How are they different from objects?', a: `7 primitives: string, number, bigint, boolean, undefined, null, symbol. Everything else is an object (arrays, functions, dates, maps...).
- Primitives are immutable and copied by value: let a = 5; let b = a; b++ → a is still 5.
- Objects are mutable and copied by reference: const o1 = { x: 1 }; const o2 = o1; o2.x = 2 → o1.x is 2.
- Equality: primitives compare by value; objects by reference ({} === {} is false).
This is why React needs a NEW object/array when updating state.` },
    { level: 'Medium', q: 'What is the difference between null and undefined?', a: `undefined means a value was never assigned: an uninitialised variable, a missing property, a missing function argument, or a function with no return.
null is an intentional "no value" assigned by the programmer (e.g. user = null after logout).
typeof undefined → 'undefined'; typeof null → 'object'.
null == undefined → true; null === undefined → false.
In JSON, undefined properties are dropped, while null is kept – important for APIs.` },
    { level: 'Medium', q: 'What is a prototype and what is the prototype chain?', a: `Every JavaScript object has an internal link [[Prototype]] to another object (or null). When you read a property that the object does not have, JS looks at its prototype, then the prototype's prototype, and so on until null. This lookup path is the prototype chain.
const arr = [1, 2];
arr.map  // found on Array.prototype
arr.hasOwnProperty // found on Object.prototype
Chain: arr → Array.prototype → Object.prototype → null.
Methods are stored once on the prototype and shared by all instances, which saves memory.` },
    { level: 'Medium', q: 'What is the difference between __proto__ and prototype?', a: `- prototype is a property of constructor FUNCTIONS (and classes). It is the object that will become the [[Prototype]] of instances created with new.
- __proto__ is an accessor on every object that exposes its own [[Prototype]] (legacy; prefer Object.getPrototypeOf / Object.setPrototypeOf).
function Car() {}
const c = new Car();
c.__proto__ === Car.prototype // true
Object.getPrototypeOf(c) === Car.prototype // true` },
    { level: 'Medium', q: 'Are JavaScript classes real classes? What do they add?', a: `JavaScript classes (ES6) are syntactic sugar over constructor functions and prototypal inheritance. typeof MyClass is 'function' and methods live on MyClass.prototype.
They add: cleaner syntax, extends and super for inheritance, static members, getters/setters, private fields and methods (#x, ES2022), static blocks, and safety – class bodies are always strict, classes must be called with new, and they are in the TDZ before declaration.
class Admin extends User { constructor(n) { super(n); this.role = 'admin'; } }` },
    { level: 'Medium', q: 'How do you create private variables in JavaScript?', a: `1. Private class fields (modern, true privacy):
class Account { #balance = 0; deposit(x) { this.#balance += x; } get balance() { return this.#balance; } }
Accessing acc.#balance outside the class is a SyntaxError.
2. Closures (factory functions):
function createAccount() { let balance = 0; return { deposit: x => balance += x, getBalance: () => balance }; }
3. Module scope: variables not exported from an ES module are private to the file.
4. WeakMap keyed by instance (older pattern).
The _name underscore convention is NOT private – just a hint.` },
    { level: 'Hard', q: 'What is the difference between Object.create(), a constructor function with new, and a class?', a: `- Object.create(proto) creates an empty object whose [[Prototype]] is proto. No constructor runs. Object.create(null) creates an object with no prototype (useful as a pure dictionary).
- new Fn(): creates an object, links it to Fn.prototype, runs Fn with this = the new object, returns it (unless Fn returns another object).
- class: does the same as new Fn() with nicer syntax, enforced new, strict mode, and extends/super.
All three end up using the same prototype mechanism.` },
    { level: 'Hard', q: 'What exactly happens when you call a function with new?', a: `1. A new empty object is created.
2. Its [[Prototype]] is set to Constructor.prototype.
3. The constructor runs with this bound to the new object.
4. If the constructor returns an object, that object is the result; otherwise the new object is returned.
Polyfill idea:
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);
  const ret = Fn.apply(obj, args);
  return ret !== null && typeof ret === 'object' ? ret : obj;
}` },
    { level: 'Medium', q: 'What is an execution context and the call stack?', a: `An execution context is the environment in which code runs. It contains the variable environment (variables, functions), the scope chain (outer reference) and the value of this. There is one global execution context plus a new one for every function call.
Each context is created in two phases: creation (hoisting: memory for vars/functions) and execution (code runs line by line).
The call stack is a LIFO stack of execution contexts: calling a function pushes a context, returning pops it. Too much recursion → "RangeError: Maximum call stack size exceeded".` },
    { level: 'Medium', q: 'What is an IIFE and why was it used?', a: `An IIFE (Immediately Invoked Function Expression) is a function that runs as soon as it is defined:
(function () { const secret = 42; console.log('runs once'); })();
(() => { /* arrow version */ })();
It was used to create a private scope (before let/const and ES modules) so variables did not leak into the global scope – the "module pattern" used by jQuery-era libraries. Today it is still handy for top-level async code: (async () => { await main(); })();` },
    { level: 'Hard', q: 'What is the difference between shallow copy and deep copy? How do you deep copy?', a: `A shallow copy copies only the top level; nested objects are still shared by reference. A deep copy duplicates every nested level.
Shallow: { ...obj }, Object.assign({}, obj), [...arr], arr.slice().
Deep:
- structuredClone(obj) – built-in (browsers and Node 17+); handles Dates, Maps, Sets and circular references, but not functions or DOM nodes.
- JSON.parse(JSON.stringify(obj)) – loses undefined, functions, Dates (become strings), Infinity/NaN, and fails on circular references.
- A recursive custom function or lodash cloneDeep.
const a = { user: { name: 'A' } }; const b = { ...a }; b.user.name = 'B'; // a.user.name is also 'B'` },
    { level: 'Hard', q: 'What is strict mode and what does it change?', a: `"use strict" opts into a safer subset of JavaScript. ES modules and class bodies are strict automatically.
Changes:
- Assigning to an undeclared variable throws ReferenceError instead of creating a global.
- this in a plain function call is undefined instead of the global object.
- Writing to read-only properties or deleting non-deletable ones throws.
- Duplicate parameter names are a SyntaxError; with is not allowed; octal literals like 010 are banned.
It catches silent bugs early, which is why tools like Vite/ESM code always run strict.` },
  ],
  practice: [
    {
      task: 'Write a function once(fn) that allows fn to run only the first time; later calls return the first result.',
      hint: 'Keep a "called" flag and the result in a closure.',
      solution: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const init = once((x) => { console.log('init with', x); return x * 2; });
console.log(init(5)); // init with 5, then 10
console.log(init(9)); // 10 (fn not called again)`,
    },
    {
      task: 'Create a bank account factory createAccount(initial) with deposit, withdraw and getBalance where the balance cannot be changed directly. Throw an error on overdraft.',
      hint: 'Closure over a local balance variable; return an object of functions.',
      solution: `function createAccount(initial = 0) {
  let balance = initial;
  return {
    deposit(amount) {
      if (amount <= 0) throw new Error('Amount must be positive');
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error('Insufficient balance');
      balance -= amount;
      return balance;
    },
    getBalance: () => balance,
  };
}

const acc = createAccount(1000);
acc.deposit(500);
acc.withdraw(200);
console.log(acc.getBalance()); // 1300
console.log(acc.balance);      // undefined - truly private`,
    },
    {
      task: 'Fix this code so that it prints 0, 1, 2 using THREE different techniques: for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 100);',
      hint: 'let, IIFE, and the extra setTimeout argument (or bind).',
      solution: `// 1. let creates a new binding per iteration
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 100);

// 2. IIFE captures the current value
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i);
}

// 3. Pass the value as an argument to the callback
for (var k = 0; k < 3; k++) setTimeout((n) => console.log(n), 100, k);`,
    },
    {
      task: 'Implement a Person class and a Student class that extends it. Student has a private #marks array, addMark(m) (chainable), a getter average, and a static method compare(a, b) that returns the name of the student with the higher average.',
      hint: 'Use extends, super, #private fields, get, static.',
      solution: `class Person {
  constructor(name) { this.name = name; }
  intro() { return 'Hi, I am ' + this.name; }
}

class Student extends Person {
  #marks = [];
  addMark(m) { this.#marks.push(m); return this; }
  get average() {
    if (this.#marks.length === 0) return 0;
    return this.#marks.reduce((s, m) => s + m, 0) / this.#marks.length;
  }
  static compare(a, b) {
    return a.average >= b.average ? a.name : b.name;
  }
}

const s1 = new Student('Asha').addMark(80).addMark(90);
const s2 = new Student('Ravi').addMark(70).addMark(95);
console.log(s1.intro(), s1.average); // Hi, I am Asha 85
console.log(Student.compare(s1, s2)); // Asha (85 vs 82.5)`,
    },
    {
      task: 'Write the same "Shape → Circle" inheritance WITHOUT the class keyword (constructor functions + prototypes), and show that circle.area() and circle.describe() both work.',
      hint: 'Shape.call(this, ...) for the parent constructor; Circle.prototype = Object.create(Shape.prototype); reset constructor.',
      solution: `function Shape(name) { this.name = name; }
Shape.prototype.describe = function () {
  return this.name + ' with area ' + this.area().toFixed(2);
};

function Circle(r) {
  Shape.call(this, 'Circle');   // like super('Circle')
  this.r = r;
}
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;
Circle.prototype.area = function () { return Math.PI * this.r ** 2; };

const c = new Circle(2);
console.log(c.area().toFixed(2)); // 12.57
console.log(c.describe());        // Circle with area 12.57
console.log(c instanceof Shape);  // true`,
    },
  ],
  quiz: [
    {
      question: 'What does this print? console.log(x); let x = 5;',
      options: ['undefined', '5', 'ReferenceError: Cannot access \'x\' before initialization', 'null'],
      answer: 2,
      explanation: 'let is hoisted but stays in the Temporal Dead Zone until its declaration line, so reading it early throws ReferenceError.',
    },
    {
      question: 'Which of these values is truthy?',
      options: ['"0"', '0', '""', 'NaN'],
      answer: 0,
      explanation: '"0" is a non-empty string, so it is truthy. 0, "" and NaN are among the 8 falsy values.',
    },
    {
      question: 'Inside an arrow function used as an object method, what is this?',
      options: ['The object the method belongs to', 'Always undefined', 'A new empty object', 'The this of the surrounding (enclosing) scope'],
      answer: 3,
      explanation: 'Arrow functions do not have their own this; they inherit it lexically from where they are defined, which is why they are a poor choice for object methods.',
    },
    {
      question: 'What is the output of: const f = function () { return this; }.bind({ a: 1 }); console.log(f.call({ a: 2 }).a);',
      options: ['2', '1', 'undefined', 'TypeError'],
      answer: 1,
      explanation: 'A bound function has its this permanently fixed; call cannot override it, so this.a is 1.',
    },
    {
      question: 'Which statement about ES6 classes is correct?',
      options: ['Classes create a new inheritance model separate from prototypes', 'Class declarations are fully hoisted like function declarations', 'Classes are syntactic sugar over prototypes, and typeof a class is "function"', 'Class methods are copied onto every instance'],
      answer: 2,
      explanation: 'Classes use the same prototype mechanism; methods live on Class.prototype and are shared. Classes are hoisted but stay in the TDZ.',
    },
  ],
};
