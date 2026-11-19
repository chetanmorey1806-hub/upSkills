export default {
  lesson: 'day-11-list-comprehensions',
  minutes: 30,
  intro: 'Turn loops into list comprehensions with filtering, if-else transforms and nesting, and solve common list programs.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is `[x for x in range(6) if x % 2]`?',
      options: ['[0, 2, 4]', '[1, 3, 5]', '[0, 1, 2, 3, 4, 5]', '[True, False, ...]'],
      answer: 1,
      explain: 'The `if` at the end is a **filter**. `x % 2` is 1 (truthy) for odd numbers and 0 (falsy) for even numbers, so only 1, 3, 5 are kept.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `nums = [4, 7, 10, 3]
print([n * 2 for n in nums if n > 5])
print(["even" if n % 2 == 0 else "odd" for n in nums])
print([c for c in "a1b2" if c.isdigit()])
print([[i * j for j in range(1, 3)] for i in range(1, 3)])`,
      expected: "[14, 20]\n['even', 'odd', 'even', 'odd']\n['1', '2']\n[[1, 2], [2, 4]]",
      explain: 'A filter `if` goes **after** the for; an if-**else** transform goes **before** the for (`a if cond else b for ...`). Putting `if-else` at the end is a SyntaxError. A comprehension inside a comprehension builds a 2D list.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Rewrite the loop as a comprehension:\n```\nupper = []\nfor n in names:\n    upper.append(n.upper())\n```\n`upper = [____ for n in names]`: what goes in the blank?',
      accept: ['n.upper()'],
      explain: 'The pattern is `[expression for item in iterable]`: the expression is whatever you appended in the loop, here `n.upper()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Given `marks = [45, 82, 33, 91, 67, 28]`, create with **list comprehensions**:\n- `passed`: only the marks **≥ 35**\n- `result`: `"Pass"` or `"Fail"` for **every** mark (same order)\n- `bonus`: every mark + 5, but capped at 100 (use `min`)',
      example: { title: 'filter vs transform', code: 'ages = [12, 25, 17]\nadults = [a for a in ages if a >= 18]             # [25]\nlabels = ["A" if a >= 18 else "M" for a in ages]  # [\'M\', \'A\', \'M\']' },
      starter: `marks = [45, 82, 33, 91, 67, 28]
passed = []   # TODO
result = []   # TODO
bonus = []    # TODO
`,
      solution: `marks = [45, 82, 33, 91, 67, 28]
passed = [m for m in marks if m >= 35]
result = ["Pass" if m >= 35 else "Fail" for m in marks]
bonus = [min(m + 5, 100) for m in marks]
`,
      tests: [
        { call: 'passed', expect: [45, 82, 91, 67] },
        { call: 'result', expect: ['Pass', 'Pass', 'Fail', 'Pass', 'Pass', 'Fail'] },
        { call: 'bonus', expect: [50, 87, 38, 96, 72, 33] },
      ],
      explain: 'Filtering removes items (fewer results), transforming keeps every item. `min(m + 5, 100)` caps the value without an if. Remember: filter `if` after the for, if-else before it.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Nested comprehensions. Given\n```\nbatches = [["Asha", "Ravi"], ["Neha"], ["Kiran", "Meena", "Arjun"]]\n```\ncreate:\n- `all_students`: one flat list of all names, in order\n- `table`: the 3×3 multiplication table `[[1, 2, 3], [2, 4, 6], [3, 6, 9]]`',
      example: { title: 'reading a nested comprehension', code: 'pairs = [(c, n) for c in "ab" for n in [1, 2]]\n# same order as two nested loops: [(\'a\',1), (\'a\',2), (\'b\',1), (\'b\',2)]' },
      starter: `batches = [["Asha", "Ravi"], ["Neha"], ["Kiran", "Meena", "Arjun"]]
all_students = []  # TODO
table = []         # TODO
`,
      solution: `batches = [["Asha", "Ravi"], ["Neha"], ["Kiran", "Meena", "Arjun"]]
all_students = [name for batch in batches for name in batch]
table = [[i * j for j in range(1, 4)] for i in range(1, 4)]
`,
      tests: [
        { call: 'all_students', expect: ['Asha', 'Ravi', 'Neha', 'Kiran', 'Meena', 'Arjun'] },
        { call: 'table', expect: [[1, 2, 3], [2, 4, 6], [3, 6, 9]] },
      ],
      explain: 'For flattening, write the `for` clauses in the same order as nested loops: outer (`for batch in batches`) first, inner (`for name in batch`) second. For a matrix, put a comprehension **inside** the brackets of another, one inner list per row.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Two classic list programs:\n1. `unique`: the items of `orders` **without duplicates, keeping the first-seen order**\n2. `missing`: the one number missing from `nums` (it should contain 1..10)\n```\norders = ["tea", "coffee", "tea", "juice", "coffee", "tea"]\nnums = [1, 2, 3, 5, 6, 7, 8, 9, 10]\n```',
      example: { title: 'sum of 1..n', code: 'n = 5\nprint(n * (n + 1) // 2)   # 15 = 1+2+3+4+5' },
      starter: `orders = ["tea", "coffee", "tea", "juice", "coffee", "tea"]
nums = [1, 2, 3, 5, 6, 7, 8, 9, 10]
unique = []   # TODO
missing = 0   # TODO
`,
      solution: `orders = ["tea", "coffee", "tea", "juice", "coffee", "tea"]
nums = [1, 2, 3, 5, 6, 7, 8, 9, 10]
unique = []
for o in orders:
    if o not in unique:
        unique.append(o)
n = len(nums) + 1
missing = n * (n + 1) // 2 - sum(nums)
`,
      tests: [
        { call: 'unique', expect: ['tea', 'coffee', 'juice'] },
        { call: 'missing', expect: 4 },
      ],
      explain: 'A loop with `if o not in unique` keeps the first-seen order (`list(set(orders))` loses the order). For the missing number, the expected sum of 1..n minus the actual sum gives the missing value in one pass. Note: this is a case where a plain loop is clearer than a comprehension with side effects.',
    },
  ],
};
