export default {
  lesson: 'day-18-lambda-map-filter-reduce',
  minutes: 30,
  intro: 'Write lambdas and use map(), filter(), reduce() and sorted(key=...) to transform, select, combine and rank shop and student data.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement about `lambda` is true?',
      options: [
        'A lambda can contain several statements and loops',
        'A lambda is a single expression whose value is returned automatically',
        'A lambda must use the return keyword',
        'A lambda cannot take more than one argument',
      ],
      answer: 1,
      explain: '`lambda args: expression` creates a small anonymous function; the expression’s value is returned automatically (writing `return` is a SyntaxError). For several statements, write a normal `def`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from functools import reduce
nums = [5, 12, 7, 20]
print(list(map(lambda n: n * 2, nums)))
print(list(filter(lambda n: n > 6, nums)))
print(reduce(lambda a, b: a + b, nums))
print(sorted(["kiwi", "fig", "banana"], key=len))
m = map(str, nums)
print(list(m), list(m))`,
      expected: "[10, 24, 14, 40]\n[12, 7, 20]\n44\n['fig', 'kiwi', 'banana']\n['5', '12', '7', '20'] []",
      explain: '`map` transforms every item, `filter` keeps items whose function returns True, `reduce` combines items pairwise into one value. `key=len` sorts by length. A map object is a one-time **iterator**: the second `list(m)` is empty.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Sort the words by their **last letter**:\n```\nsorted(words, key=____)\n```',
      accept: ['lambda w: w[-1]', 'lambda word: word[-1]', 'lambda x: x[-1]', 'lambda s: s[-1]'],
      acceptRegex: ['^lambda\\s*(\\w+)\\s*:\\s*\\1\\[-1\\]$'],
      explain: '`key` receives a function that is called on each item; sorting uses its return value. `lambda w: w[-1]` returns the last character. Writing `key=w[-1]` fails because `key` needs a function, not a value.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Shop data: `products` is a list of `(name, price)` tuples. Using **map** and **filter** with lambdas, write:\n- `names_upper(products)` → list of names in UPPER CASE\n- `affordable(products, budget)` → list of names with price ≤ budget (original order)',
      example: { title: 'map and filter on tuples', code: 'items = [("pen", 10), ("bag", 650)]\nprint(list(map(lambda p: p[1], items)))            # [10, 650]\nprint(list(filter(lambda p: p[1] < 100, items)))   # [(\'pen\', 10)]' },
      starter: `def names_upper(products):
    # TODO: use map
    pass

def affordable(products, budget):
    # TODO: use filter (and map for the names)
    pass
`,
      solution: `def names_upper(products):
    return list(map(lambda p: p[0].upper(), products))

def affordable(products, budget):
    cheap = filter(lambda p: p[1] <= budget, products)
    return list(map(lambda p: p[0], cheap))
`,
      tests: [
        { call: 'names_upper([("pen", 10), ("bag", 650), ("mug", 199)])', expect: ['PEN', 'BAG', 'MUG'] },
        { call: 'affordable([("pen", 10), ("bag", 650), ("mug", 199)], 200)', expect: ['pen', 'mug'] },
        { call: 'affordable([("bag", 650)], 100)', expect: [] },
      ],
      explain: 'map and filter return lazy iterators, so wrap them in `list()` before returning. You can chain them: filter first, then map to the names. A list comprehension `[n for n, p in products if p <= budget]` is equally correct.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `cart_total(cart)` using `functools.reduce` that returns the total bill of a cart of `(item, price, qty)` tuples. An empty cart must return 0.\n\n`cart_total([("pen", 10, 5), ("book", 120, 2)])` → 290',
      example: { title: 'reduce with an initial value', code: 'from functools import reduce\nreduce(lambda acc, n: acc + n * n, [1, 2, 3], 0)   # 14' },
      starter: `from functools import reduce

def cart_total(cart):
    # TODO
    pass
`,
      solution: `from functools import reduce

def cart_total(cart):
    return reduce(lambda acc, it: acc + it[1] * it[2], cart, 0)
`,
      tests: [
        { call: 'cart_total([("pen", 10, 5), ("book", 120, 2)])', expect: 290 },
        { call: 'cart_total([("bag", 650, 1)])', expect: 650 },
        { call: 'cart_total([])', expect: 0 },
      ],
      explain: 'The third argument `0` is the **initial value** of the accumulator. Without it, reduce starts with the first tuple itself (so `tuple + int` fails) and raises TypeError on an empty list.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `rank(students)` where `students` is a list of `(name, marks)` tuples. Return the **names** sorted by marks **highest first**; students with equal marks are sorted by name A→Z.\n\n`rank([("Ravi", 82), ("Asha", 91), ("Neha", 82)])` → `["Asha", "Neha", "Ravi"]`',
      example: { title: 'sort by two keys', code: 'emps = [("IT", 50), ("HR", 40), ("IT", 30)]\nsorted(emps, key=lambda e: (e[0], -e[1]))\n# dept A→Z, then salary high→low' },
      starter: `def rank(students):
    # TODO
    pass
`,
      solution: `def rank(students):
    ordered = sorted(students, key=lambda s: (-s[1], s[0]))
    return [name for name, marks in ordered]
`,
      tests: [
        { call: 'rank([("Ravi", 82), ("Asha", 91), ("Neha", 82)])', expect: ['Asha', 'Neha', 'Ravi'] },
        { call: 'rank([("Zoya", 70), ("Amit", 70), ("Kiran", 99)])', expect: ['Kiran', 'Amit', 'Zoya'] },
      ],
      explain: 'A key that returns a **tuple** sorts by the first element, then the second for ties. Negating the marks (`-s[1]`) gives "highest first" while names stay A→Z. `reverse=True` would also reverse the names.',
    },
  ],
};
