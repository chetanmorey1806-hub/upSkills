export default {
  lesson: 'day-15-array-methods',
  minutes: 35,
  intro: 'Transform, filter, search, reduce and sort arrays of products and students with callback methods.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `[1, 2, 3].forEach(n => n * 2)` return?',
      options: ['[2, 4, 6]', '[1, 2, 3]', 'undefined', '12'],
      answer: 2,
      explain: '`forEach` is only for side effects (logging, pushing) and always returns **undefined**. To build a new array of results, use `map`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const nums = [10, 1, 5, 25];
console.log([...nums].sort().join(","));
console.log([...nums].sort((a, b) => a - b).join(","));
console.log(nums.some(n => n > 20));
console.log(nums.every(n => n > 0));
console.log(nums.findIndex(n => n === 5));`,
      expected: '1,10,25,5\n1,5,10,25\ntrue\ntrue\n2',
      explain: 'Without a compare function, `sort` compares items **as strings**, so "10" comes before "5". Use `(a, b) => a - b` for numbers. `some` = at least one passes, `every` = all pass.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `priceTags(products)` that uses **map** to return an array of strings like `"Pen: ₹10"` for products `{ name, price }`.',
      example: { title: 'map transforms each item', code: 'const names = ["asha", "ravi"];\nnames.map((n) => n.toUpperCase()); // ["ASHA", "RAVI"]' },
      starter: 'function priceTags(products) {\n  // TODO\n}',
      solution: 'function priceTags(products) {\n  return products.map((p) => `${p.name}: ₹${p.price}`);\n}',
      tests: [
        { call: 'priceTags([{ name: "Pen", price: 10 }, { name: "Bag", price: 799 }])', expect: ['Pen: ₹10', 'Bag: ₹799'] },
        { call: 'priceTags([])', expect: [] },
      ],
      explain: '`map` calls your callback for each item and collects the **returned** values into a new array of the same length. Forgetting to return (e.g. using `{ }` without `return`) fills the array with undefined.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `passedNames(students)` that returns the **names** of students with `marks >= 40`, using `filter` and then `map` (chaining).',
      example: { title: 'filter then map', code: 'orders\n  .filter((o) => o.paid)\n  .map((o) => o.id);' },
      starter: 'function passedNames(students) {\n  // TODO\n}',
      solution: 'function passedNames(students) {\n  return students.filter((s) => s.marks >= 40).map((s) => s.name);\n}',
      tests: [
        { call: 'passedNames([{ name: "Asha", marks: 78 }, { name: "Ravi", marks: 35 }, { name: "Meena", marks: 40 }])', expect: ['Asha', 'Meena'] },
        { call: 'passedNames([{ name: "X", marks: 10 }])', expect: [] },
      ],
      explain: '`filter` keeps items whose callback returns true; `map` then turns each kept object into its name. Doing map first would lose the marks you need for filtering.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Cart total with **reduce**. Write `cartTotal(cart)` for items `{ price, qty }` that returns the sum of `price * qty`.',
      example: { title: 'reduce to one value', code: '[5, 10, 15].reduce((sum, n) => sum + n, 0); // 30' },
      starter: 'function cartTotal(cart) {\n  // TODO\n}',
      solution: 'function cartTotal(cart) {\n  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);\n}',
      tests: [
        { call: 'cartTotal([{ price: 100, qty: 2 }, { price: 50, qty: 3 }])', expect: 350 },
        { call: 'cartTotal([])', expect: 0, msg: 'Empty cart gives 0' },
      ],
      explain: 'The accumulator (`sum`) carries the running total; the **initial value 0** is essential. Without it, reduce on an empty array throws a TypeError, and on objects it would start with the first object instead of a number.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `countByCity(people)` that uses **reduce** to count how many people live in each city. Return an object like `{ Pune: 2, Delhi: 1 }`.',
      example: { title: 'reduce into an object', code: 'const words = ["a", "b", "a"];\nwords.reduce((acc, w) => {\n  acc[w] = (acc[w] || 0) + 1;\n  return acc;\n}, {});' },
      starter: 'function countByCity(people) {\n  // TODO\n}',
      solution: 'function countByCity(people) {\n  return people.reduce((acc, p) => {\n    acc[p.city] = (acc[p.city] || 0) + 1;\n    return acc;\n  }, {});\n}',
      tests: [
        { call: 'countByCity([{ city: "Pune" }, { city: "Delhi" }, { city: "Pune" }])', expect: { Pune: 2, Delhi: 1 } },
        { call: 'countByCity([])', expect: {} },
      ],
      explain: 'Start with `{}` and add 1 to the city key each time; `(acc[city] || 0)` handles the first time a city appears. You must **return acc** from the callback, otherwise the next round receives undefined.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `sortByPrice(products)` that returns a **new** array of products sorted by `price` from **highest to lowest**, without changing the original array.',
      example: { title: 'sorting objects', code: 'people.sort((a, b) => a.age - b.age); // youngest first' },
      starter: 'function sortByPrice(products) {\n  // TODO\n}',
      solution: 'function sortByPrice(products) {\n  return [...products].sort((a, b) => b.price - a.price);\n}',
      tests: [
        { call: 'sortByPrice([{ n: "A", price: 50 }, { n: "B", price: 500 }, { n: "C", price: 120 }]).map((p) => p.n)', expect: ['B', 'C', 'A'] },
        { call: '(() => { const list = [{ price: 1 }, { price: 2 }]; sortByPrice(list); return list[0].price; })()', expect: 1, msg: 'The original array is not reordered' },
      ],
      explain: '`sort` **mutates** the array, so copy first with `[...products]` (or `toSorted`). `b.price - a.price` puts bigger prices first; `a - b` would be lowest first.',
    },
  ],
};
