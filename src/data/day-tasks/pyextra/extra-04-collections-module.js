export default {
  lesson: 'extra-04-collections-module',
  minutes: 30,
  intro: 'Use Counter, defaultdict, deque, namedtuple, OrderedDict and ChainMap to solve everyday data problems with less code.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You need a queue where you add at the right and remove from the LEFT many times. Which is the best choice?',
      options: ['`list` with `pop(0)`', '`collections.deque` with `popleft()`', '`dict` with `popitem()`', '`tuple`'],
      answer: 1,
      explain: '`deque.popleft()` is O(1). `list.pop(0)` is O(n) because every remaining element must shift one place left, which becomes slow for big queues.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from collections import Counter, deque
c = Counter("banana")
print(c.most_common(2))
print(c["z"])
d = deque([1, 2, 3], maxlen=3)
d.append(4)
print(list(d))
d.rotate(1)
print(list(d))`,
      expected: "[('a', 3), ('n', 2)]\n0\n[2, 3, 4]\n[4, 2, 3]",
      explain: '`most_common(n)` returns (item, count) pairs, highest first. A missing key in a Counter gives **0**, not KeyError. With `maxlen=3`, appending a 4th item drops the oldest from the other end. `rotate(1)` moves the last item to the front.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `top_words(text, n)` that returns the `n` most common words (lower-cased, split on spaces) as a list of `(word, count)` tuples, using `Counter`.',
      example: { title: 'Counter basics', code: 'from collections import Counter\nvotes = Counter(["BJP", "INC", "BJP"])\nvotes.most_common(1)  # [("BJP", 2)]' },
      starter: 'from collections import Counter\n\ndef top_words(text, n):\n    # TODO\n    return []\n',
      solution: 'from collections import Counter\n\ndef top_words(text, n):\n    return Counter(text.lower().split()).most_common(n)\n',
      tests: [
        { call: 'top_words("the cat and the hat and the bat", 2)', expect: [['the', 3], ['and', 2]] },
        { call: 'top_words("Python python PYTHON java", 1)', expect: [['python', 3]] },
        { call: 'top_words("", 3)', expect: [] },
      ],
      explain: '`Counter(iterable)` counts every item; `most_common(n)` sorts by count. Lower-casing first makes "Python" and "python" the same word. Writing this with a plain dict needs `if word in d` checks; Counter does it for you.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `group_by_city(people)` where people is a list of `(name, city)` tuples. Return a normal dict `{city: [names in input order]}` built with `defaultdict(list)`.',
      example: { title: 'defaultdict', code: 'from collections import defaultdict\nby_len = defaultdict(list)\nfor w in ["hi", "yo", "hey"]:\n    by_len[len(w)].append(w)\n# {2: ["hi", "yo"], 3: ["hey"]}' },
      starter: 'from collections import defaultdict\n\ndef group_by_city(people):\n    groups = {}\n    # TODO\n    return groups\n',
      solution: 'from collections import defaultdict\n\ndef group_by_city(people):\n    groups = defaultdict(list)\n    for name, city in people:\n        groups[city].append(name)\n    return dict(groups)\n',
      tests: [
        { call: 'group_by_city([("Asha", "Pune"), ("Ravi", "Delhi"), ("Om", "Pune")])', expect: { Pune: ['Asha', 'Om'], Delhi: ['Ravi'] } },
        { call: 'group_by_city([])', expect: {} },
      ],
      explain: '`defaultdict(list)` creates an empty list the first time a missing key is used, so `groups[city].append(name)` never raises KeyError. Pass the factory `list` (no brackets), not `list()` or `[]`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `moving_average(values, k)` that returns the list of averages of every window of the last `k` values, using a `deque(maxlen=k)`. Only output an average once the window is full. Round each average to 2 decimals.',
      example: { title: 'deque with maxlen', code: 'from collections import deque\nlast3 = deque(maxlen=3)\nfor x in [5, 6, 7, 8]:\n    last3.append(x)\nprint(list(last3))  # [6, 7, 8]' },
      starter: 'from collections import deque\n\ndef moving_average(values, k):\n    result = []\n    # TODO\n    return result\n',
      solution: 'from collections import deque\n\ndef moving_average(values, k):\n    window = deque(maxlen=k)\n    result = []\n    for v in values:\n        window.append(v)\n        if len(window) == k:\n            result.append(round(sum(window) / k, 2))\n    return result\n',
      tests: [
        { call: 'moving_average([10, 21, 30, 45], 2)', expect: [15.5, 25.5, 37.5] },
        { call: 'moving_average([1, 2, 4, 5, 7], 3)', expect: [2.33, 3.67, 5.33] },
        { call: 'moving_average([1, 2], 3)', expect: [], msg: 'Window never full → empty list' },
        { call: 'moving_average([1, 2, 2], 3)', expect: [1.67] },
      ],
      explain: 'A `deque` with `maxlen` automatically throws away the oldest value when a new one is appended, which is exactly a sliding window. Check `len(window) == k` so partial windows are skipped.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Create a `namedtuple` called `Employee` with fields `name`, `dept`, `salary`. Then write `highest_paid(rows)` that converts each `(name, dept, salary)` tuple to an Employee (use `Employee._make` or `Employee(*row)`) and returns the **name** of the highest-paid employee.',
      example: { title: 'namedtuple', code: 'from collections import namedtuple\nCity = namedtuple("City", ["name", "state"])\nc = City("Indore", "MP")\nprint(c.name, c[1])' },
      starter: 'from collections import namedtuple\n\n# TODO: Employee = namedtuple(...)\n\ndef highest_paid(rows):\n    # TODO\n    return None\n',
      solution: 'from collections import namedtuple\n\nEmployee = namedtuple("Employee", ["name", "dept", "salary"])\n\ndef highest_paid(rows):\n    emps = [Employee._make(r) for r in rows]\n    return max(emps, key=lambda e: e.salary).name\n',
      tests: [
        { call: 'Employee("Asha", "IT", 50000).dept', expect: 'IT', msg: 'Employee must have fields name, dept, salary' },
        { call: 'highest_paid([("Asha", "IT", 50000), ("Ravi", "HR", 65000), ("Om", "IT", 42000)])', expect: 'Ravi' },
        { call: 'highest_paid([("Meera", "Ops", 1)])', expect: 'Meera' },
      ],
      explain: 'A namedtuple is an immutable tuple whose items also have names, so `e.salary` reads better than `e[2]`. `_make(iterable)` builds one from any sequence. `max(..., key=...)` picks the record with the biggest salary.',
    },
  ],
};
