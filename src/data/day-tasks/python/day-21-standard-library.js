export default {
  lesson: 'day-21-standard-library',
  minutes: 30,
  intro: 'Use math, random, datetime, collections and itertools from the standard library to solve everyday problems without extra packages.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import math
from datetime import date, timedelta
from collections import Counter
print(math.ceil(4.1), math.floor(-4.1), math.factorial(5))
d = date(2026, 1, 26) + timedelta(days=10)
print(d, d.strftime("%d/%m/%Y"))
print((date(2026, 12, 25) - date(2026, 11, 18)).days)
print(Counter("banana").most_common(2))`,
      expected: "5 -5 120\n2026-02-05 05/02/2026\n37\n[('a', 3), ('n', 2)]",
      explain: '`ceil` rounds up, `floor` rounds **down** (towards minus infinity, so -4.1 → -5). Adding a `timedelta` to a date crosses month ends correctly. Subtracting two dates gives a timedelta whose `.days` is the gap. `Counter.most_common(n)` returns (item, count) pairs, biggest first.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You need a queue where you add and remove items at **both ends** very fast (e.g. last 5 recently viewed products). Which is best?',
      options: ['list', 'collections.deque', 'tuple', 'set'],
      answer: 1,
      explain: '`deque` has O(1) `append`, `appendleft`, `pop` and `popleft`, and `deque(maxlen=5)` drops old items automatically. `list.pop(0)` / `insert(0, x)` are O(n) because every item shifts.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Library due dates with `datetime`. Write:\n- `due_date(issued, days)`: `issued` is a string like `"18-11-2026"` (day-month-year). Return the due date `days` later as a string like `"02 Dec 2026"`.\n- `late_days(due, returned)`: both strings in the same `dd-mm-yyyy` format; return how many days late (0 if not late).',
      example: { title: 'strptime and strftime', code: 'from datetime import datetime, timedelta\nd = datetime.strptime("26-01-2026", "%d-%m-%Y")\nprint((d + timedelta(days=7)).strftime("%d %b %Y"))   # 02 Feb 2026' },
      starter: `from datetime import datetime, timedelta

def due_date(issued, days):
    # TODO
    pass

def late_days(due, returned):
    # TODO
    pass
`,
      solution: `from datetime import datetime, timedelta

FMT = "%d-%m-%Y"

def due_date(issued, days):
    d = datetime.strptime(issued, FMT) + timedelta(days=days)
    return d.strftime("%d %b %Y")

def late_days(due, returned):
    gap = (datetime.strptime(returned, FMT) - datetime.strptime(due, FMT)).days
    return max(gap, 0)
`,
      tests: [
        { call: 'due_date("18-11-2026", 14)', expect: '02 Dec 2026' },
        { call: 'due_date("25-02-2028", 5)', expect: '01 Mar 2028', msg: '2028 is a leap year: 25 Feb + 5 days = 1 Mar' },
        { call: 'late_days("02-12-2026", "10-12-2026")', expect: 8 },
        { call: 'late_days("02-12-2026", "30-11-2026")', expect: 0 },
      ],
      explain: '`strptime` (parse) turns text into a datetime using format codes (`%d` day, `%m` month number, `%Y` 4-digit year); `strftime` (format) turns it back (`%b` = short month name). Never add days by hand: timedelta handles month lengths and leap years.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Canteen orders. Write `top_items(orders, n)` that returns the `n` most ordered items as a list of `(item, count)` tuples (most frequent first) using `collections.Counter`.\n\n`top_items(["tea", "samosa", "tea", "vada pav", "tea", "samosa"], 2)` → `[("tea", 3), ("samosa", 2)]`',
      example: { title: 'Counter', code: 'from collections import Counter\nc = Counter(["a", "b", "a"])\nprint(c["a"], c["z"])     # 2 0  (missing keys count as 0)' },
      starter: `from collections import Counter

def top_items(orders, n):
    # TODO
    pass
`,
      solution: `from collections import Counter

def top_items(orders, n):
    return Counter(orders).most_common(n)
`,
      tests: [
        { call: 'top_items(["tea", "samosa", "tea", "vada pav", "tea", "samosa"], 2)', expect: [['tea', 3], ['samosa', 2]] },
        { call: 'top_items(["idli"], 1)', expect: [['idli', 1]] },
      ],
      explain: '`Counter` counts hashable items in one line and `most_common(n)` sorts by count. Writing the counting loop and sorting yourself works too, but the standard library version is shorter and well tested.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Use `itertools`:\n- `match_pairs(teams)` → list of all possible matches (each pair once, as tuples) using `combinations`\n- `running_total(sales)` → list of running totals using `accumulate`\n\n`match_pairs(["MI", "CSK", "RCB"])` → `[("MI", "CSK"), ("MI", "RCB"), ("CSK", "RCB")]`\n`running_total([100, 250, 50])` → `[100, 350, 400]`',
      example: { title: 'itertools helpers', code: 'from itertools import permutations\nprint(list(permutations("ab")))   # [(\'a\', \'b\'), (\'b\', \'a\')]' },
      starter: `from itertools import combinations, accumulate

def match_pairs(teams):
    pass

def running_total(sales):
    pass
`,
      solution: `from itertools import combinations, accumulate

def match_pairs(teams):
    return list(combinations(teams, 2))

def running_total(sales):
    return list(accumulate(sales))
`,
      tests: [
        { call: 'match_pairs(["MI", "CSK", "RCB"])', expect: [['MI', 'CSK'], ['MI', 'RCB'], ['CSK', 'RCB']] },
        { call: 'len(match_pairs(["A", "B", "C", "D", "E"]))', expect: 10 },
        { call: 'running_total([100, 250, 50])', expect: [100, 350, 400] },
      ],
      explain: '`combinations(items, 2)` gives each unordered pair once (n·(n-1)/2 pairs); `permutations` would count MI-CSK and CSK-MI separately. `accumulate` yields the running sum. Both return iterators, so wrap them in `list()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Reproducible lucky draw. Write `lucky_draw(names, seed)` that calls `random.seed(seed)` and then returns `random.choice(names)`. The same seed must always give the same winner.',
      example: { title: 'seeding random', code: 'import random\nrandom.seed(42)\nprint(random.randint(1, 6))   # same number every run with seed 42' },
      starter: `import random

def lucky_draw(names, seed):
    # TODO
    pass
`,
      solution: `import random

def lucky_draw(names, seed):
    random.seed(seed)
    return random.choice(names)
`,
      tests: [
        { call: 'lucky_draw(["Asha", "Ravi", "Neha", "Kiran"], 7) in ["Asha", "Ravi", "Neha", "Kiran"]', expect: true, msg: 'the winner must be one of the names' },
        { call: '[lucky_draw(["Asha", "Ravi", "Neha", "Kiran"], 7) for _ in range(5)] == [lucky_draw(["Asha", "Ravi", "Neha", "Kiran"], 7)] * 5', expect: true, msg: 'the same seed must always give the same winner' },
        { call: 'lucky_draw(["Asha", "Ravi", "Neha", "Kiran"], 7) == __import__("random").Random(7).choice(["Asha", "Ravi", "Neha", "Kiran"])', expect: true, msg: 'seed first, then call random.choice once' },
      ],
      explain: '`random.seed(n)` resets the generator, so the following "random" numbers are the same every time: useful for tests and fair, repeatable draws. Without a seed, each run gives a different winner. (Use the `secrets` module for security-sensitive randomness.)',
    },
  ],
};
