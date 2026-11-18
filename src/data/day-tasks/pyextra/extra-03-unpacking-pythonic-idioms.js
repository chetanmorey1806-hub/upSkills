export default {
  lesson: 'extra-03-unpacking-pythonic-idioms',
  minutes: 25,
  intro: 'Practise tuple and star unpacking, * and ** spreading, chained comparisons, truthiness and everyday Pythonic idioms.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `first, *middle, last = [10, 20, 30, 40, 50]
print(first, middle, last)
head, *tail = [7]
print(head, tail)
a, b = 1, 2
a, b = b, a
print(a, b)
q, r = divmod(47, 10)
print(q, r)`,
      expected: '10 [20, 30, 40] 50\n7 []\n2 1\n4 7',
      explain: 'The starred name always becomes a **list** (possibly empty). `a, b = b, a` builds the tuple on the right first, so the swap needs no temp variable. `divmod` returns (quotient, remainder) together.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `1 < x < 10` mean in Python?',
      options: ['`(1 < x) < 10`, comparing a boolean with 10', '`1 < x and x < 10`, with x evaluated once', 'A SyntaxError', '`1 < x or x < 10`'],
      answer: 1,
      explain: 'Python chains comparisons: `a < b < c` means `a < b and b < c`, and `b` is evaluated only once. In C/JavaScript the same code compares a boolean with 10, which is a classic bug.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are considered **Pythonic**? (choose all that apply)',
      options: ['`if value is None:`', '`if flag == True:`', '`for i, name in enumerate(names):`', '`for i in range(len(names)): print(names[i])`', '`count = stock.get("pen", 0)`', '`if len(items) != 0:` instead of `if items:`'],
      answers: [0, 2, 4],
      explain: 'Compare with None using `is`. Use truthiness (`if flag:`, `if items:`) instead of `== True` or `len(...) != 0`. `enumerate` gives index and value together, and `dict.get(key, default)` avoids KeyError without an if.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Each row is `[name, mark1, mark2, ...]` (any number of marks). Write `averages(rows)` that returns a dict `{name: average}` rounded to 1 decimal. Use **star unpacking** in the for loop.',
      example: { title: 'star unpacking in a loop', code: 'for city, *temps in [["Pune", 30, 32], ["Delhi", 41]]:\n    print(city, max(temps))' },
      starter: 'def averages(rows):\n    result = {}\n    # TODO: for name, *marks in rows: ...\n    return result\n',
      solution: 'def averages(rows):\n    result = {}\n    for name, *marks in rows:\n        result[name] = round(sum(marks) / len(marks), 1)\n    return result\n',
      tests: [
        { call: 'averages([["Asha", 80, 91], ["Ravi", 70, 75, 66]])', expect: { Asha: 85.5, Ravi: 70.3 } },
        { call: 'averages([["Meera", 99, 98]])', expect: { Meera: 98.5 } },
        { call: 'averages([])', expect: {} },
      ],
      explain: '`for name, *marks in rows` takes the first item as `name` and puts all remaining items in the list `marks`, whatever its length. This is cleaner than `row[0]` and `row[1:]`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `merge_settings(defaults, user)` that returns a NEW dict where user values override defaults, using `{**a, **b}`. Then write `make_order(*items, **options)` that returns a dict `{"items": [list of items], "gift": options.get("gift", False)}`.',
      example: { title: '* and ** spreading', code: 'nums = [*range(3), 99]        # [0, 1, 2, 99]\nprofile = {**base, "city": "Nagpur"}' },
      starter: 'def merge_settings(defaults, user):\n    # TODO\n    return defaults\n\ndef make_order(*items, **options):\n    # TODO\n    return {}\n',
      solution: 'def merge_settings(defaults, user):\n    return {**defaults, **user}\n\ndef make_order(*items, **options):\n    return {"items": list(items), "gift": options.get("gift", False)}\n',
      tests: [
        { call: 'merge_settings({"theme": "light", "lang": "en"}, {"lang": "hi"})', expect: { theme: 'light', lang: 'hi' } },
        { call: '(lambda d: (merge_settings(d, {"x": 1}), d))({"y": 2})[1]', expect: { y: 2 }, msg: 'defaults must not be modified' },
        { call: 'make_order("pen", "book", gift=True)', expect: { items: ['pen', 'book'], gift: true } },
        { call: 'make_order()', expect: { items: [], gift: false } },
      ],
      explain: 'In `{**a, **b}` later keys win, so user settings override defaults and the original dicts stay unchanged. `*items` collects extra positional arguments into a tuple and `**options` collects keyword arguments into a dict.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `find_first_failed(students)` where students is a list of `(name, marks)` tuples. Use a `for ... else` loop: return the name of the first student with marks < 35; if the loop finishes without finding one (the `else` branch), return `"all passed"`.',
      example: { title: 'for ... else', code: 'for n in nums:\n    if n < 0:\n        print("found negative", n)\n        break\nelse:\n    print("no negatives")' },
      starter: 'def find_first_failed(students):\n    # TODO: for name, marks in students: ... else: ...\n    pass\n',
      solution: 'def find_first_failed(students):\n    for name, marks in students:\n        if marks < 35:\n            result = name\n            break\n    else:\n        result = "all passed"\n    return result\n',
      tests: [
        { call: 'find_first_failed([("Asha", 70), ("Ravi", 20), ("Om", 10)])', expect: 'Ravi' },
        { call: 'find_first_failed([("Asha", 70), ("Meera", 35)])', expect: 'all passed' },
        { call: 'find_first_failed([])', expect: 'all passed' },
      ],
      explain: 'The `else` of a loop runs only when the loop ended **without** `break`. It replaces a separate `found = False` flag. Many people think the loop `else` runs when the loop body never executed, but it also runs after a full normal loop.',
    },
  ],
};
