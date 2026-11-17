const ex1 = `// Symbols: unique, hidden-ish property keys
const id1 = Symbol('id');
const id2 = Symbol('id');
console.log('unique?', id1 === id2, '| description:', id1.description, '| typeof:', typeof id1);

const user = { name: 'Asha', [id1]: 101 };      // symbol as a key (computed property)
user[id2] = 202;                                 // no clash with id1

console.log('value by symbol:', user[id1], user[id2]);
console.log('Object.keys:', Object.keys(user));
console.log('JSON:', JSON.stringify(user));
console.log('for...in:', (() => { const k = []; for (const key in user) k.push(key); return k; })());
console.log('symbols:', Object.getOwnPropertySymbols(user).length);

// Global symbol registry: same key -> same symbol everywhere
console.log('Symbol.for equal?', Symbol.for('app.theme') === Symbol.for('app.theme'));

// Well-known symbols customise built-in behaviour
class Money {
  constructor(amount) { this.amount = amount; }
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? this.amount : 'Rs. ' + this.amount;
  }
  get [Symbol.toStringTag]() { return 'Money'; }
}
const price = new Money(250);
console.log(\`\${price}\`, +price * 2, Object.prototype.toString.call(price));`;

const ex2 = `// The iteration protocol: an iterator has next() returning { value, done }
const colors = ['red', 'green'];
const it = colors[Symbol.iterator]();     // arrays are iterable
console.log(it.next());
console.log(it.next());
console.log(it.next());

// Making our own object iterable
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) console.log('for...of:', n);
console.log('spread:', [...range]);
console.log('Array.from:', Array.from(range, (n) => n * n));
const [first, second] = range;
console.log('destructuring:', first, second);

// Plain objects are NOT iterable
try {
  for (const x of { a: 1 }) console.log(x);
} catch (e) {
  console.log(e.name + ':', e.message);
}`;

const ex3 = `// Generators: functions that can pause (yield) and resume
function* countdown(start) {
  console.log('  (generator started)');
  while (start > 0) {
    yield start;            // pause here and give back a value
    start--;
  }
  return 'Lift off!';       // final value (done: true)
}

const gen = countdown(3);   // nothing runs yet!
console.log('created generator');
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());

// for...of ignores the return value
console.log('for...of:', [...countdown(2)]);

// Rewriting the iterable range with a generator - much shorter
const range = {
  from: 1, to: 4,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  },
};
console.log('range:', [...range]);`;

const ex4 = `// Lazy & infinite sequences, yield*, and two-way communication
function* idGenerator(prefix) {
  let n = 1;
  while (true) yield prefix + '-' + String(n++).padStart(3, '0');   // infinite but lazy
}
const orderIds = idGenerator('ORD');
console.log(orderIds.next().value, orderIds.next().value, orderIds.next().value);

function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
function* take(iterable, count) {
  let i = 0;
  for (const item of iterable) {
    if (i++ >= count) return;
    yield item;
  }
}
console.log('first 10 fib:', [...take(fibonacci(), 10)].join(', '));

// yield* delegates to another iterable/generator
function* allTeams() {
  yield* ['Asha', 'Ravi'];
  yield* take(idGenerator('TMP'), 2);
}
console.log('yield*:', [...allTeams()]);

// Passing values IN with next(value)
function* chat() {
  const name = yield 'What is your name?';
  const city = yield 'Hi ' + name + '! Which city?';
  return name + ' from ' + city;
}
const c = chat();
console.log(c.next().value);
console.log(c.next('Meera').value);
console.log(c.next('Jaipur'));`;

const ex5 = `// Async generators + for await...of: paginated API loading
async function* fetchPostsInPages(pageSize, maxPages) {
  for (let page = 1; page <= maxPages; page++) {
    const url = 'https://jsonplaceholder.typicode.com/posts?_page=' + page + '&_limit=' + pageSize;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const posts = await res.json();
    if (posts.length === 0) return;     // no more data
    yield { page, posts };
  }
}

async function main() {
  for await (const { page, posts } of fetchPostsInPages(3, 3)) {
    console.log('Page ' + page + ': post ids ' + posts.map((p) => p.id).join(', '));
  }
  console.log('All pages loaded');
}
main();`;

export default {
  id: 'day-42-iterators-generators-symbols',
  title: 'Iterators, Generators and Symbols',
  module: 'Module 7: Professional JavaScript',
  day: 42,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Symbols are unique values used as special property keys, and the well-known Symbol.iterator is what makes for...of, spread and destructuring work. Generators let you write iterators – including lazy, infinite and asynchronous sequences – with simple pause-and-resume functions.',
  objectives: [
    'Create symbols, use them as property keys and know well-known symbols',
    'Explain the iterable and iterator protocols (Symbol.iterator, next, done)',
    'Make custom objects iterable for for...of, spread and destructuring',
    'Write generator functions with yield, yield* and next(value)',
    'Consume async data streams with async generators and for await...of',
  ],
  theory: [
    {
      heading: 'Symbols: Unique Keys',
      content:
        '`Symbol` is a **primitive type** (ES2015). Every call to `Symbol("desc")` creates a **brand-new unique value** – two symbols are never equal, even with the same description.\n\nAnalogy: a symbol is like a locker key with a unique cut. Two keys can have the same label tag ("id"), but each opens only its own locker.\n\nWhy use them?\n- **Collision-free property keys**: libraries can add metadata to your objects without clashing with your property names\n- **Hidden-ish properties**: symbol keys are skipped by `for...in`, `Object.keys` and `JSON.stringify` (but not truly private – `Object.getOwnPropertySymbols` finds them)\n- `Symbol.for("key")` uses a **global registry**: the same key returns the same symbol everywhere',
      syntax: `const ID = Symbol('id');
const user = { name: 'Asha', [ID]: 7 };
user[ID];              // 7
Object.keys(user);     // ['name']`,
      tip: 'Symbols cannot be auto-converted to strings: "x" + Symbol() throws a TypeError. Use symbol.toString() or symbol.description.',
    },
    {
      heading: 'Well-Known Symbols',
      content:
        'JavaScript has built-in symbols that let you **hook into language behaviour**:\n- `Symbol.iterator` – how `for...of`, spread `...`, destructuring and `Array.from` loop over an object\n- `Symbol.asyncIterator` – used by `for await...of`\n- `Symbol.toPrimitive` – how an object converts to a number/string\n- `Symbol.toStringTag` – the name in `Object.prototype.toString` output, e.g. `[object Money]`\n- `Symbol.hasInstance` – customise `instanceof`',
    },
    {
      heading: 'Iterables and Iterators',
      content:
        'Two simple "contracts" (protocols):\n\n1. An **iterable** is an object with a `[Symbol.iterator]()` method that returns an iterator.\n2. An **iterator** is an object with a `next()` method that returns `{ value, done }`. When `done` is `true`, iteration stops.\n\nAnalogy: an iterable is a **playlist**; the iterator is the **"next song" button** that remembers where you are.\n\n**Built-in iterables**: Array, String, Map, Set, arguments, NodeList, TypedArrays, and results of `matchAll`.\n**Not iterable**: plain objects `{}` – use `Object.entries(obj)` to iterate them.\n\nEverything that consumes iterables: `for...of`, spread `[...x]`, destructuring `const [a, b] = x`, `Array.from(x)`, `new Map(x)`, `new Set(x)`, `Promise.all(x)`.',
    },
    {
      heading: 'Generator Functions',
      content:
        'Writing iterators by hand is verbose. A **generator function** (`function*`) does it for you.\n\n- Calling a generator function does **not run** its body. It returns a **generator object** (which is both an iterator and an iterable).\n- Each `gen.next()` runs the body **until the next `yield`**, then **pauses** and returns `{ value: yieldedValue, done: false }`.\n- When the function finishes (or hits `return`), `next()` returns `{ value: returnValue, done: true }`.\n\nAnalogy: a generator is like **reading a book with a bookmark** – you read until a chapter ends (yield), close it, and later continue exactly where you stopped, with all local variables remembered.',
      syntax: `function* numbers() {
  yield 1;
  yield 2;
  return 3;
}
const g = numbers();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 3, done: true }
[...numbers()]; // [1, 2]  (return value is ignored by for...of / spread)`,
    },
    {
      heading: 'Lazy Evaluation, yield* and next(value)',
      content:
        '- **Lazy**: values are produced only when asked for. That makes **infinite sequences** (IDs, Fibonacci) possible without freezing – just take as many as you need.\n- `yield* otherIterable` – **delegates**: yields every value of another generator/array.\n- `gen.next(value)` – sends a value **into** the generator; it becomes the result of the paused `yield` expression. (The first `next()` just starts the generator.)\n- `gen.return(v)` stops a generator; `gen.throw(err)` throws an error inside it.\n\nReal-world uses: ID generators, pagination, step-by-step wizards, game turns, Redux-Saga (built on generators), and the idea behind async/await (which is essentially generators + promises).',
      tip: 'Never spread an infinite generator ([...fibonacci()]) – it never ends and freezes the tab. Limit it with a take() helper or break out of the loop.',
    },
    {
      heading: 'Async Iterators and for await...of',
      content:
        'An **async generator** (`async function*`) can `await` inside and `yield` values over time. Consume it with `for await (const item of asyncIterable)` inside an async function (or a module).\n\nPerfect for **streams of async data**: paginated APIs, reading a file in chunks, live messages.\n\nThe loop waits for each item before moving on, so pages are loaded one by one only as needed.',
      syntax: `async function* pages() {
  for (let p = 1; p <= 3; p++) {
    const res = await fetch('/api?page=' + p);
    yield res.json();
  }
}
for await (const page of pages()) console.log(page);`,
      tip: 'Coming next (Day 43): useful browser APIs – History, Clipboard, IntersectionObserver and Geolocation.',
    },
  ],
  examples: [
    {
      title: 'Symbols as unique and hidden keys',
      scenario: 'Attach IDs to an object without clashes and customise how an object converts to text.',
      steps: [
        'Create two symbols with the same description and compare them',
        'Use them as property keys and check keys / JSON / for...in',
        'Compare Symbol.for values',
        'Implement Symbol.toPrimitive and Symbol.toStringTag in a class, click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        "unique? false | description: id | typeof: symbol\nvalue by symbol: 101 202\nObject.keys: [ 'name' ]\nJSON: {\"name\":\"Asha\"}\nfor...in: [ 'name' ]\nsymbols: 2\nSymbol.for equal? true\nRs. 250 500 [object Money]",
      explanation:
        'Symbol keys are invisible to Object.keys, for...in and JSON, but still accessible directly or via getOwnPropertySymbols. Symbol.toPrimitive decides the result of string interpolation ("Rs. 250") and number conversion (250).',
    },
    {
      title: 'The iteration protocol and a custom iterable range',
      scenario: 'Step through an array iterator manually, then make a range object work with for...of and spread.',
      steps: [
        'Call colors[Symbol.iterator]() and call next() three times',
        'Give range a [Symbol.iterator]() method returning an object with next()',
        'Use range with for...of, spread, Array.from and destructuring',
        'Try for...of on a plain object, click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        "{ value: 'red', done: false }\n{ value: 'green', done: false }\n{ value: undefined, done: true }\nfor...of: 1\nfor...of: 2\nfor...of: 3\nfor...of: 4\nfor...of: 5\nspread: [ 1, 2, 3, 4, 5 ]\nArray.from: [ 1, 4, 9, 16, 25 ]\ndestructuring: 1 2\nTypeError: {(intermediate value)} is not iterable",
      explanation:
        'Every for...of/spread/destructuring call asks the object for a fresh iterator via Symbol.iterator, then calls next() until done is true. Plain objects have no Symbol.iterator, hence the TypeError (Chrome says "{(intermediate value)} is not iterable"; the exact wording varies by browser).',
    },
    {
      title: 'Generator basics: pause and resume',
      scenario: 'A countdown generator that yields numbers one at a time.',
      steps: [
        'Write function* countdown(start) with yield inside a loop',
        'Create the generator and notice nothing runs yet',
        'Call next() five times and read value/done',
        'Rewrite the range iterable with a generator method, click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        "created generator\n  (generator started)\n{ value: 3, done: false }\n{ value: 2, done: false }\n{ value: 1, done: false }\n{ value: 'Lift off!', done: true }\n{ value: undefined, done: true }\n  (generator started)\nfor...of: [ 2, 1 ]\nrange: [ 1, 2, 3, 4 ]",
      explanation:
        'The body starts only on the first next(). Each yield pauses the function. The return value arrives with done: true, and after that every next() gives undefined. Spread ignores the return value. A *[Symbol.iterator]() generator method makes any object iterable in three lines.',
    },
    {
      title: 'Infinite lazy sequences, yield* and next(value)',
      scenario: 'Generate order IDs on demand, take the first 10 Fibonacci numbers, combine generators and have a "conversation" with a generator.',
      steps: [
        'Write an infinite idGenerator with while(true) and yield',
        'Write fibonacci and a take(iterable, n) generator',
        'Combine sequences with yield*',
        'Pass values into a generator with next(value), click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        "ORD-001 ORD-002 ORD-003\nfirst 10 fib: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34\nyield*: [ 'Asha', 'Ravi', 'TMP-001', 'TMP-002' ]\nWhat is your name?\nHi Meera! Which city?\n{ value: 'Meera from Jaipur', done: true }",
      explanation:
        'while(true) is safe in a generator because it pauses at every yield. take() stops after n items. In chat(), the value passed to next("Meera") becomes the result of the first yield expression.',
    },
    {
      title: 'Async generator for paginated API data',
      scenario: 'Load posts page by page from JSONPlaceholder using for await...of.',
      steps: [
        'Write async function* that fetches one page per iteration and yields it',
        'Stop when a page comes back empty',
        'Consume it with for await...of inside an async function',
        'Click Run (needs internet)',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        'Page 1: post ids 1, 2, 3\nPage 2: post ids 4, 5, 6\nPage 3: post ids 7, 8, 9\nAll pages loaded',
      explanation:
        'Each loop iteration awaits the next page. Pages are fetched lazily – only when the loop asks for them – so you could stop early with break and no extra requests would be made.',
    },
  ],
  interview: [
    {
      q: 'What is a Symbol?',
      a: 'A primitive type whose values are unique and immutable, mainly used as collision-free property keys. Symbol("x") !== Symbol("x").',
      level: 'Easy',
    },
    {
      q: 'Are symbol-keyed properties private?',
      a: 'No. They are hidden from for...in, Object.keys and JSON.stringify, but accessible via Object.getOwnPropertySymbols or Reflect.ownKeys. Use #private fields for real privacy.',
      level: 'Medium',
    },
    {
      q: 'Symbol() vs Symbol.for()?',
      a: 'Symbol() always creates a new unique symbol. Symbol.for(key) looks up a global registry and returns the same symbol for the same key across the whole app (even across iframes).',
      level: 'Medium',
    },
    {
      q: 'What is the difference between an iterable and an iterator?',
      a: 'An iterable has a [Symbol.iterator]() method that returns an iterator. An iterator has a next() method returning { value, done }. Arrays are iterables; arr[Symbol.iterator]() is an iterator.',
      level: 'Medium',
    },
    {
      q: 'Why can\'t you use for...of on a plain object?',
      a: 'Plain objects do not implement Symbol.iterator. Use Object.keys/values/entries (which return arrays) or add a [Symbol.iterator] method.',
      level: 'Easy',
    },
    {
      q: 'What is a generator function?',
      a: 'A function declared with function* that can pause at yield and resume later. Calling it returns a generator object (iterator + iterable); the body runs step by step with each next() call.',
      level: 'Easy',
    },
    {
      q: 'Output?\nfunction* g() { yield 1; yield 2; return 3; }\nconsole.log([...g()]);',
      a: '[1, 2]. Spread and for...of stop when done is true and ignore the value that comes with it (the return value 3).',
      level: 'Medium',
    },
    {
      q: 'What does yield* do?',
      a: 'It delegates to another iterable or generator, yielding each of its values in turn, e.g. yield* [1, 2] or yield* otherGen().',
      level: 'Medium',
    },
    {
      q: 'How do you pass a value into a generator?',
      a: 'Call gen.next(value). The value becomes the result of the yield expression where the generator is paused. The first next() call only starts the generator, so its argument is ignored.',
      level: 'Hard',
    },
    {
      q: 'What are practical uses of generators?',
      a: 'Lazy/infinite sequences, custom iterables, ID generators, pagination, controlling step-by-step flows, Redux-Saga effects, and historically implementing async/await-like code (co library).',
      level: 'Medium',
    },
    {
      q: 'What is for await...of?',
      a: 'A loop that consumes async iterables (objects with Symbol.asyncIterator, such as async generators) or iterables of promises, awaiting each value in order. It must be used inside an async function or module.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Make a class Playlist that stores songs in an array and is iterable with for...of (use a generator method).',
      hint: '*[Symbol.iterator]() { yield* this.songs; }',
      solution: `class Playlist {
  constructor(...songs) { this.songs = songs; }
  *[Symbol.iterator]() { yield* this.songs; }
}
const p = new Playlist('Song A', 'Song B', 'Song C');
for (const s of p) console.log(s);
console.log([...p].length); // 3`,
    },
    {
      task: 'Write a generator evens(limit) that yields even numbers from 0 up to limit, and print them with spread.',
      hint: 'for loop with i += 2 and yield i.',
      solution: `function* evens(limit) {
  for (let i = 0; i <= limit; i += 2) yield i;
}
console.log([...evens(10)]); // [0, 2, 4, 6, 8, 10]`,
    },
    {
      task: 'Write an infinite generator cycle(arr) that loops over an array forever (e.g. traffic lights red → yellow → green → red...). Print the first 7 values.',
      hint: 'while (true) { yield* arr; }',
      solution: `function* cycle(arr) {
  while (true) yield* arr;
}
const lights = cycle(['red', 'yellow', 'green']);
const out = [];
for (let i = 0; i < 7; i++) out.push(lights.next().value);
console.log(out.join(' -> ')); // red -> yellow -> green -> red -> yellow -> green -> red`,
    },
    {
      task: 'Write a generator chunk(arr, size) that yields slices of the array, e.g. chunk([1..7], 3) → [1,2,3], [4,5,6], [7].',
      hint: 'for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);',
      solution: `function* chunk(arr, size) {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}
console.log([...chunk([1, 2, 3, 4, 5, 6, 7], 3)]); // [[1,2,3],[4,5,6],[7]]`,
    },
    {
      task: 'Use a Symbol as a "secret" key to store an internal cache on an object, and show that JSON.stringify does not include it.',
      hint: 'const CACHE = Symbol("cache"); obj[CACHE] = {...}',
      solution: `const CACHE = Symbol('cache');
const product = { name: 'Phone', price: 15000 };
product[CACHE] = { lastFetched: '10:30' };
console.log(JSON.stringify(product));   // {"name":"Phone","price":15000}
console.log(product[CACHE].lastFetched); // 10:30`,
    },
  ],
  quiz: [
    {
      question: 'What is Symbol("a") === Symbol("a")?',
      options: ['true', 'false', 'TypeError', 'undefined'],
      answer: 1,
      explanation: 'Every Symbol() call creates a unique value.',
    },
    {
      question: 'Which method makes an object usable with for...of?',
      options: ['toString', 'valueOf', '[Symbol.iterator]', 'next only'],
      answer: 2,
      explanation: 'for...of looks for Symbol.iterator.',
    },
    {
      question: 'What does calling a generator function return?',
      options: ['A generator object', 'The first yielded value', 'An array', 'A Promise'],
      answer: 0,
      explanation: 'The body does not run until next() is called.',
    },
    {
      question: 'What does next() return after a generator finishes?',
      options: ['null', 'It throws', '{ value: 0, done: false }', '{ value: undefined, done: true }'],
      answer: 3,
      explanation: 'A finished generator keeps returning done: true.',
    },
    {
      question: 'Which loop consumes an async generator?',
      options: ['for...in', 'forEach', 'for await...of', 'while'],
      answer: 2,
      explanation: 'for await...of awaits each yielded value.',
    },
  ],
};
