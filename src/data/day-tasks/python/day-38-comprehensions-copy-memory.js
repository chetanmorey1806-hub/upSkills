export default {
  lesson: 'day-38-comprehensions-copy-memory',
  minutes: 30,
  intro: 'Write advanced comprehensions, predict side effects of mutable objects, and choose between assignment, shallow and deep copy.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Assignment vs shallow vs deep copy. What is printed?',
      code: `import copy
original = {"name": "Asha", "marks": [80, 90]}
alias = original
shallow = copy.copy(original)
deep = copy.deepcopy(original)
original["marks"].append(100)
original["name"] = "Ravi"
print(alias["name"], alias["marks"])
print(shallow["name"], shallow["marks"])
print(deep["name"], deep["marks"])`,
      expected: 'Ravi [80, 90, 100]\nAsha [80, 90, 100]\nAsha [80, 90]',
      explain: 'The alias is the **same** dict, so it sees everything. A shallow copy is a new outer dict (rebinding "name" does not affect it) but **shares** the inner list, so the append shows up. A deep copy copies the nested list too and is fully independent.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these types are **immutable**? (select all that apply)',
      options: ['int', 'str', 'list', 'tuple', 'dict', 'frozenset', 'set'],
      answers: [0, 1, 3, 5],
      explain: 'int, float, bool, str, tuple and frozenset cannot change after creation; "changing" them creates a new object. list, dict and set are mutable, which is why passing them to a function can cause side effects.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Fix the side effect: `apply_discount(prices, pct)` must return a **new** list with each price reduced by `pct` percent (rounded to 2) and must **not** change the caller’s list.',
      example: { title: 'mutating vs returning new data', code: 'def bad(nums):\n    nums.append(0)        # changes the caller\'s list\n\ndef good(nums):\n    return nums + [0]     # new list' },
      starter: `def apply_discount(prices, pct):
    for i in range(len(prices)):
        prices[i] = round(prices[i] * (100 - pct) / 100, 2)
    return prices
`,
      solution: `def apply_discount(prices, pct):
    return [round(p * (100 - pct) / 100, 2) for p in prices]
`,
      tests: [
        { call: 'apply_discount([199.5, 349.9], 10)', expect: [179.55, 314.91] },
        { call: '(lambda p: (apply_discount(p, 50), p)[1])([99.9, 10.5])', expect: [99.9, 10.5], msg: 'the original list must stay unchanged' },
      ],
      explain: 'Lists are passed by **reference** (the function receives the same object), so assigning `prices[i]` changes the caller’s data. A comprehension builds a new list and leaves the input untouched.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `clone_config(cfg)` that returns a fully independent copy of a nested config dict, so changing any nested list/dict in the copy never affects the original.',
      example: { title: 'copy module', code: 'import copy\nboard = [[0, 0], [0, 0]]\nb2 = copy.deepcopy(board)\nb2[0][0] = 1\nprint(board[0][0])   # 0' },
      starter: `def clone_config(cfg):
    return cfg.copy()   # TODO: is a shallow copy enough?
`,
      solution: `import copy

def clone_config(cfg):
    return copy.deepcopy(cfg)
`,
      tests: [
        { call: '(lambda c: (lambda d: (d["db"]["hosts"].append("b"), d["db"].update(port=1), c)[2])(clone_config(c)))({"db": {"hosts": ["a"], "port": 5432}, "debug": False})', expect: { db: { hosts: ['a'], port: 5432 }, debug: false }, msg: 'changing nested data in the clone must not change the original' },
        { call: 'clone_config({"x": [1, {"y": 2}]})', expect: { x: [1, { y: 2 }] } },
      ],
      explain: '`dict.copy()` (and `copy.copy`) copy only the top level; nested lists and dicts are still shared. `copy.deepcopy` recursively copies everything. Use it for nested configs, game boards and templates.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Comprehensions deep dive. Given\n```\nstudents = {"Asha": [78, 93], "Ravi": [45, 30], "Neha": [88, 95], "Kiran": [60, 70]}\n```\ncreate:\n- `toppers`: **dict** name → average (rounded to 1) for students whose average ≥ 75\n- `all_marks`: **set** of every mark\n- `grid`: list of lists `[[name, mark], ...]` for every (student, mark) pair, in order',
      example: { title: 'dict, set and nested comprehensions', code: 'd = {k: len(k) for k in ["ab", "c"]}       # {\'ab\': 2, \'c\': 1}\ns = {x % 3 for x in range(10)}              # {0, 1, 2}\np = [[a, b] for a in "xy" for b in [1, 2]]' },
      starter: `students = {"Asha": [78, 93], "Ravi": [45, 30], "Neha": [88, 95], "Kiran": [60, 70]}
toppers = {}    # TODO
all_marks = set()  # TODO
grid = []       # TODO
`,
      solution: `students = {"Asha": [78, 93], "Ravi": [45, 30], "Neha": [88, 95], "Kiran": [60, 70]}
toppers = {n: round(sum(m) / len(m), 1) for n, m in students.items() if sum(m) / len(m) >= 75}
all_marks = {mark for marks in students.values() for mark in marks}
grid = [[n, mark] for n, marks in students.items() for mark in marks]
`,
      tests: [
        { call: 'toppers', expect: { Asha: 85.5, Neha: 91.5 } },
        { call: 'all_marks', expect: [30, 45, 60, 70, 78, 88, 93, 95] },
        { call: 'type(all_marks).__name__', expect: 'set' },
        { call: 'grid[:3]', expect: [['Asha', 78], ['Asha', 93], ['Ravi', 45]] },
        { call: 'len(grid)', expect: 8 },
      ],
      explain: 'Use `{k: v ...}` for dicts and `{x ...}` for sets; nested `for` clauses read left to right like nested loops. If a comprehension needs more than one condition and two loops, a normal loop is usually more readable.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Two objects reference each other (a cycle) and nothing else references them. How does CPython free them?',
      options: [
        'Reference counting frees them immediately',
        'The cyclic garbage collector (gc module) finds and frees them',
        'They are never freed until the program ends',
        'You must call del on both',
      ],
      answer: 1,
      explain: 'Reference counting frees most objects as soon as their count hits 0, but in a cycle each object still has a reference from the other. The **cyclic GC** periodically detects such unreachable groups; `gc.collect()` runs it manually.',
    },
  ],
};
