export default {
  id: "extra-05-itertools",
  title: "itertools: Efficient Iteration Building Blocks",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 5,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "itertools provides fast, memory-efficient tools that work on iterators: infinite counters, chaining, slicing, grouping, accumulating, pairing, batching and combinatorics (product, permutations, combinations). Learn to replace nested loops and temporary lists with lazy pipelines.",
  objectives: [
    "Explain lazy iterators and why itertools saves memory",
    "Use count, cycle, repeat, islice, chain, zip_longest and pairwise",
    "Group sorted data with groupby and compute running totals with accumulate",
    "Filter with takewhile, dropwhile, filterfalse and compress",
    "Generate product, permutations, combinations and batches",
  ],
  theory: [
    {
      heading: "Iterators and Lazy Evaluation",
      content: `An **iterable** is anything you can loop over (list, str, dict, file). An **iterator** is the object that actually produces values one by one using \`next()\`; when finished it raises \`StopIteration\`. Every itertools function returns an iterator, so values are produced **lazily** - only when requested. This means you can process millions of rows, or even infinite streams, without building huge lists in memory.

Important consequence: an iterator can be consumed only once. After you loop through it, it is empty. Wrap it in \`list()\` if you need to reuse or print the results.`,
      syntax: `import itertools as it
nums = it.count(1)        # 1, 2, 3, ... forever (lazy)
next(nums), next(nums)    # (1, 2)
list(it.islice(nums, 3))  # [3, 4, 5]
`,
    },
    {
      heading: "Infinite Iterators: count, cycle, repeat",
      content: `\`count(start=0, step=1)\` counts forever (works with floats too). \`cycle(iterable)\` repeats the items endlessly - useful for round-robin assignment. \`repeat(obj, times=None)\` returns the same object again and again, or a fixed number of times; it is often used with map or zip to supply a constant argument.

Always pair infinite iterators with something that stops: \`islice\`, \`zip\` with a finite iterable, \`takewhile\`, or a \`break\`.`,
      points: [
        "`zip(it.count(1), names)` - number items like enumerate",
        "`zip(tasks, it.cycle(['Asha', 'Ravi']))` - round-robin assignment",
        "`list(map(pow, range(5), it.repeat(2)))` - squares [0, 1, 4, 9, 16]",
      ],
    },
    {
      heading: "Combining and Slicing: chain, islice, zip_longest, pairwise, batched",
      content: "`chain(a, b, c)` iterates through several iterables one after another without concatenating them; `chain.from_iterable(list_of_lists)` flattens one level. `islice(iterable, start, stop, step)` slices any iterator (you cannot use `[1:5]` on a generator). `zip_longest(a, b, fillvalue=x)` zips to the LONGEST input, filling gaps. `pairwise(iterable)` (3.10+) gives overlapping pairs (a,b), (b,c), (c,d). `batched(iterable, n)` (3.12+) splits into tuples of size n - ideal for bulk database inserts or API calls.",
      syntax: `list(it.chain([1, 2], (3,), "ab"))        # [1, 2, 3, 'a', 'b']
list(it.pairwise([10, 12, 15]))           # [(10, 12), (12, 15)]
list(it.batched(range(7), 3))             # [(0, 1, 2), (3, 4, 5), (6,)]
`,
    },
    {
      heading: "groupby and accumulate",
      content: `\`groupby(iterable, key=None)\` groups **consecutive** items that have the same key. It yields (key, group_iterator) pairs. Because it only groups neighbours, you almost always need to **sort by the same key first**, otherwise the same key can appear in several groups. Each group iterator is consumed when you move to the next group, so convert it to a list immediately if you need it.

\`accumulate(iterable, func=operator.add, initial=None)\` returns running results: running totals by default, or running max/min/product with another function.`,
      tip: "groupby is NOT like SQL GROUP BY. Unsorted data gives repeated keys. Sort first: `sorted(data, key=keyfunc)`.",
    },
    {
      heading: "Filtering Tools: takewhile, dropwhile, filterfalse, compress, starmap",
      content: "`takewhile(pred, it)` yields items while the predicate is true and stops at the first false. `dropwhile(pred, it)` skips items while true, then yields everything else (no more checking). `filterfalse(pred, it)` is the opposite of `filter`. `compress(data, selectors)` keeps items whose selector is truthy. `starmap(func, iterable_of_tuples)` calls `func(*args)` for each tuple. `tee(it, n)` splits one iterator into n independent iterators.",
    },
    {
      heading: "Combinatorics: product, permutations, combinations",
      content: `\`product(A, B)\` is the Cartesian product - equivalent to nested for loops. \`product(range(2), repeat=3)\` gives all 3-bit combinations. \`permutations(items, r)\` gives all ordered arrangements of length r (order matters, no repeats). \`combinations(items, r)\` gives selections where order does not matter. \`combinations_with_replacement(items, r)\` allows repeated elements.

Counts: for n items, permutations(r) = n!/(n-r)!, combinations(r) = n!/(r!(n-r)!). \`math.perm\` and \`math.comb\` compute these numbers without generating items. These grow very fast, so be careful with large inputs.`,
      points: [
        "product('AB', [1, 2]) -> A1, A2, B1, B2",
        "permutations('ABC', 2) -> AB, AC, BA, BC, CA, CB (6)",
        "combinations('ABC', 2) -> AB, AC, BC (3)",
      ],
    },
  ],
  examples: [
    {
      title: "Round-robin Task Assignment with cycle, count and islice",
      scenario: "A team lead wants to assign support tickets to developers in rotation and generate ticket numbers automatically.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import itertools as it

tickets = ["Login bug", "Payment fail", "Slow page", "Typo", "Crash on save"]
devs = it.cycle(["Asha", "Ravi"])
ids = it.count(1001)

for ticket, dev, tid in zip(tickets, devs, ids):
    print(f"#{tid} {ticket:<14} -> {dev}")

evens = (n for n in it.count(0, 2))
print(list(it.islice(evens, 5)))
print(list(it.islice("ABCDEFGH", 1, 7, 2)))
print(list(map(pow, [1, 2, 3, 4], it.repeat(2))))
`,
      python: {
        files: {
          "main.py": `import itertools as it

tickets = ["Login bug", "Payment fail", "Slow page", "Typo", "Crash on save"]
devs = it.cycle(["Asha", "Ravi"])
ids = it.count(1001)

for ticket, dev, tid in zip(tickets, devs, ids):
    print(f"#{tid} {ticket:<14} -> {dev}")

evens = (n for n in it.count(0, 2))
print(list(it.islice(evens, 5)))
print(list(it.islice("ABCDEFGH", 1, 7, 2)))
print(list(map(pow, [1, 2, 3, 4], it.repeat(2))))
`,
        },
      },
      result: `#1001 Login bug      -> Asha
#1002 Payment fail   -> Ravi
#1003 Slow page      -> Asha
#1004 Typo           -> Ravi
#1005 Crash on save  -> Asha
[0, 2, 4, 6, 8]
['B', 'D', 'F']
[1, 4, 9, 16]`,
      explanation: "zip stops when the finite tickets list ends, so the infinite cycle and count are safe. islice takes the first 5 values of an infinite generator, or slices with start/stop/step. repeat supplies the constant exponent to map.",
    },
    {
      title: "Flattening, Pairing and Batching Data",
      scenario: "A data engineer flattens orders from multiple branches, compares day-to-day prices and inserts rows into a database in batches of 3.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import itertools as it

pune = ["O1", "O2"]
delhi = ["O3"]
mumbai = ["O4", "O5", "O6"]
all_orders = list(it.chain(pune, delhi, mumbai))
print(all_orders)
nested = [[1, 2], [3], [4, 5, 6]]
print(list(it.chain.from_iterable(nested)))

prices = [100, 104, 101, 110, 108]
for (d1, p1), (d2, p2) in it.pairwise(enumerate(prices, start=1)):
    print(f"Day {d1}->{d2}: {p2 - p1:+d}")

for batch in it.batched(all_orders, 4):
    print("INSERT batch:", batch)

names = ["Asha", "Ravi", "Meena"]
marks = [90, 85]
print(list(it.zip_longest(names, marks, fillvalue="absent")))
`,
      python: {
        files: {
          "main.py": `import itertools as it

pune = ["O1", "O2"]
delhi = ["O3"]
mumbai = ["O4", "O5", "O6"]
all_orders = list(it.chain(pune, delhi, mumbai))
print(all_orders)
nested = [[1, 2], [3], [4, 5, 6]]
print(list(it.chain.from_iterable(nested)))

prices = [100, 104, 101, 110, 108]
for (d1, p1), (d2, p2) in it.pairwise(enumerate(prices, start=1)):
    print(f"Day {d1}->{d2}: {p2 - p1:+d}")

for batch in it.batched(all_orders, 4):
    print("INSERT batch:", batch)

names = ["Asha", "Ravi", "Meena"]
marks = [90, 85]
print(list(it.zip_longest(names, marks, fillvalue="absent")))
`,
        },
      },
      result: `['O1', 'O2', 'O3', 'O4', 'O5', 'O6']
[1, 2, 3, 4, 5, 6]
Day 1->2: +4
Day 2->3: -3
Day 3->4: +9
Day 4->5: -2
INSERT batch: ('O1', 'O2', 'O3', 'O4')
INSERT batch: ('O5', 'O6')
[('Asha', 90), ('Ravi', 85), ('Meena', 'absent')]`,
      explanation: "chain avoids building a big concatenated list. pairwise gives consecutive pairs for differences. batched (3.12+) groups items in tuples of 4, with a smaller last batch. zip_longest keeps all names and fills missing marks.",
    },
    {
      title: "Sales Report with groupby and accumulate",
      scenario: "A sales manager needs total sales per region and a running total of daily revenue.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import itertools as it
import operator

sales = [
    ("South", 500), ("North", 300), ("South", 200),
    ("East", 400), ("North", 100), ("South", 50),
]

print("Without sorting:")
for region, grp in it.groupby(sales, key=lambda s: s[0]):
    print(" ", region, [amt for _, amt in grp])

print("Sorted first:")
key = operator.itemgetter(0)
for region, grp in it.groupby(sorted(sales, key=key), key=key):
    amounts = [amt for _, amt in grp]
    print(f"  {region:<6} total={sum(amounts):>4} count={len(amounts)}")

daily = [1200, 800, 1500, 700]
print("Running total:", list(it.accumulate(daily)))
print("Running max:  ", list(it.accumulate(daily, max)))
print("With opening balance:", list(it.accumulate(daily, initial=5000)))
print("Product:", list(it.accumulate([1, 2, 3, 4], operator.mul)))
`,
      python: {
        files: {
          "main.py": `import itertools as it
import operator

sales = [
    ("South", 500), ("North", 300), ("South", 200),
    ("East", 400), ("North", 100), ("South", 50),
]

print("Without sorting:")
for region, grp in it.groupby(sales, key=lambda s: s[0]):
    print(" ", region, [amt for _, amt in grp])

print("Sorted first:")
key = operator.itemgetter(0)
for region, grp in it.groupby(sorted(sales, key=key), key=key):
    amounts = [amt for _, amt in grp]
    print(f"  {region:<6} total={sum(amounts):>4} count={len(amounts)}")

daily = [1200, 800, 1500, 700]
print("Running total:", list(it.accumulate(daily)))
print("Running max:  ", list(it.accumulate(daily, max)))
print("With opening balance:", list(it.accumulate(daily, initial=5000)))
print("Product:", list(it.accumulate([1, 2, 3, 4], operator.mul)))
`,
        },
      },
      result: `Without sorting:
  South [500]
  North [300]
  South [200]
  East [400]
  North [100]
  South [50]
Sorted first:
  East   total= 400 count=1
  North  total= 400 count=2
  South  total= 750 count=3
Running total: [1200, 2000, 3500, 4200]
Running max:   [1200, 1200, 1500, 1500]
With opening balance: [5000, 6200, 7000, 8500, 9200]
Product: [1, 2, 6, 24]`,
      explanation: "Without sorting, groupby creates a new group whenever the key changes, so South appears multiple times. After sorting by region, each region is one group. accumulate builds running totals; passing max or operator.mul changes the operation; initial adds a starting value.",
    },
    {
      title: "Filtering Logs with takewhile, dropwhile, compress and starmap",
      scenario: "A log file starts with header lines beginning with '#'. We need to skip headers, read data until an 'END' marker, and process selected rows.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import itertools as it

lines = ["# app log", "# v1.2", "INFO start", "WARN disk 85%", "INFO ok", "END", "garbage"]

body = it.dropwhile(lambda l: l.startswith("#"), lines)
data = list(it.takewhile(lambda l: l != "END", body))
print(data)

print(list(it.filterfalse(lambda l: l.startswith("INFO"), data)))

products = ["pen", "book", "bag", "lamp"]
in_stock = [1, 0, 1, 1]
print(list(it.compress(products, in_stock)))

orders = [("pen", 10, 3), ("book", 250, 2)]
print(list(it.starmap(lambda name, price, qty: f"{name}={price * qty}", orders)))

temps = [22, 25, 31, 28, 35]
print(list(it.takewhile(lambda t: t < 30, temps)))
print(list(it.dropwhile(lambda t: t < 30, temps)))
`,
      python: {
        files: {
          "main.py": `import itertools as it

lines = ["# app log", "# v1.2", "INFO start", "WARN disk 85%", "INFO ok", "END", "garbage"]

body = it.dropwhile(lambda l: l.startswith("#"), lines)
data = list(it.takewhile(lambda l: l != "END", body))
print(data)

print(list(it.filterfalse(lambda l: l.startswith("INFO"), data)))

products = ["pen", "book", "bag", "lamp"]
in_stock = [1, 0, 1, 1]
print(list(it.compress(products, in_stock)))

orders = [("pen", 10, 3), ("book", 250, 2)]
print(list(it.starmap(lambda name, price, qty: f"{name}={price * qty}", orders)))

temps = [22, 25, 31, 28, 35]
print(list(it.takewhile(lambda t: t < 30, temps)))
print(list(it.dropwhile(lambda t: t < 30, temps)))
`,
        },
      },
      result: `['INFO start', 'WARN disk 85%', 'INFO ok']
['WARN disk 85%']
['pen', 'bag', 'lamp']
['pen=30', 'book=500']
[22, 25]
[31, 28, 35]`,
      explanation: "dropwhile skips the header then passes everything; takewhile stops at END. filterfalse keeps lines that are NOT INFO. compress uses a mask list. starmap unpacks each tuple into arguments. Note dropwhile does not re-check after the first false (28 is kept).",
    },
    {
      title: "Combinatorics: Test Cases, Passwords and Teams",
      scenario: "A QA engineer wants all browser/OS combinations, a manager wants possible 2-person teams, and a security lesson shows how many 3-digit PINs exist.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import itertools as it
import math

browsers = ["Chrome", "Firefox"]
systems = ["Windows", "Linux", "macOS"]
for b, s in it.product(browsers, systems):
    print(f"test_{b}_{s}")

print(len(list(it.product("0123456789", repeat=3))), "3-digit PINs")

people = ["Asha", "Ravi", "Meena", "John"]
teams = list(it.combinations(people, 2))
print(len(teams), "teams:", teams[:3], "...")

podium = list(it.permutations(["A", "B", "C"], 2))
print(podium)
print(list(it.combinations_with_replacement("XY", 2)))
print(math.comb(4, 2), math.perm(3, 2))
`,
      python: {
        files: {
          "main.py": `import itertools as it
import math

browsers = ["Chrome", "Firefox"]
systems = ["Windows", "Linux", "macOS"]
for b, s in it.product(browsers, systems):
    print(f"test_{b}_{s}")

print(len(list(it.product("0123456789", repeat=3))), "3-digit PINs")

people = ["Asha", "Ravi", "Meena", "John"]
teams = list(it.combinations(people, 2))
print(len(teams), "teams:", teams[:3], "...")

podium = list(it.permutations(["A", "B", "C"], 2))
print(podium)
print(list(it.combinations_with_replacement("XY", 2)))
print(math.comb(4, 2), math.perm(3, 2))
`,
        },
      },
      result: `test_Chrome_Windows
test_Chrome_Linux
test_Chrome_macOS
test_Firefox_Windows
test_Firefox_Linux
test_Firefox_macOS
1000 3-digit PINs
6 teams: [('Asha', 'Ravi'), ('Asha', 'Meena'), ('Asha', 'John')] ...
[('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]
[('X', 'X'), ('X', 'Y'), ('Y', 'Y')]
6 6`,
      explanation: "product replaces nested loops (2 x 3 = 6 tests). With repeat=3 over 10 digits there are 1000 PINs. combinations ignores order (6 teams from 4 people); permutations considers order (6 ordered pairs from 3). math.comb/math.perm calculate counts directly.",
    },
  ],
  interview: [
    {
      q: "What is the difference between an iterable and an iterator?",
      a: "An iterable has `__iter__()` and can produce an iterator (list, str, dict). An iterator has `__next__()` and `__iter__()` returning itself; it produces values one at a time and is exhausted after one pass. `iter(iterable)` gives an iterator; `next(iterator)` gets the next value.",
      level: "Easy",
    },
    {
      q: "Why are itertools functions memory efficient?",
      a: "They return lazy iterators that compute each value only when requested, instead of building the whole result list in memory. You can chain them into pipelines that process huge or infinite data streams with constant memory.",
      level: "Easy",
    },
    {
      q: "Why must data usually be sorted before itertools.groupby?",
      a: "groupby only groups consecutive elements with equal keys. If the same key appears in separate places, you get multiple groups for it. Sorting by the same key brings equal keys together, giving one group per key, similar to SQL GROUP BY.",
      level: "Medium",
    },
    {
      q: "How do you flatten a list of lists?",
      a: "`list(itertools.chain.from_iterable(list_of_lists))` or a comprehension `[x for sub in lists for x in sub]`. chain.from_iterable is lazy and fast. For deeper nesting you need recursion.",
      level: "Easy",
    },
    {
      q: "How do you take the first N items from a generator?",
      a: "Use `itertools.islice(gen, n)`. Generators do not support slicing with `[:n]`. islice also supports start, stop and step but not negative indices.",
      level: "Easy",
    },
    {
      q: "What is the difference between combinations and permutations?",
      a: "permutations considers order (AB and BA are different): n!/(n-r)! results. combinations ignores order (AB only): n!/(r!(n-r)!). Use permutations for arrangements/rankings and combinations for selections/teams.",
      level: "Medium",
    },
    {
      q: "How is itertools.product related to nested loops?",
      a: "`product(A, B, C)` yields the same tuples as `for a in A: for b in B: for c in C: yield (a, b, c)`. With `repeat=n`, it is the product of an iterable with itself n times. It flattens deep nesting into one loop.",
      level: "Medium",
    },
    {
      q: "What does accumulate do and how can you change its operation?",
      a: "It returns running results. By default it adds (running total). Pass a two-argument function like `max`, `min` or `operator.mul` for running max/min/product. The `initial` argument (3.8+) adds a starting value at the front.",
      level: "Medium",
    },
    {
      q: "Difference between takewhile and filter?",
      a: "filter checks every item and keeps all items where the predicate is true. takewhile yields items only until the predicate first becomes false, then stops completely - even if later items would pass.",
      level: "Medium",
    },
    {
      q: "How would you process a large list in chunks of 100?",
      a: "In Python 3.12+: `for chunk in itertools.batched(items, 100):`. In older versions: use islice in a loop, e.g. `it = iter(items); while chunk := list(islice(it, 100)): ...`.",
      level: "Hard",
    },
    {
      q: "What is itertools.tee and what is its pitfall?",
      a: "`tee(iterator, n)` returns n independent iterators from one source. It buffers values internally, so if one copy runs far ahead of the others, memory grows. Also you must not use the original iterator after calling tee.",
      level: "Hard",
    },
    {
      q: "Why might an itertools result look empty the second time you use it?",
      a: "Because iterators are single-pass. Once consumed (e.g. by list() or a for loop), they are exhausted. Store results in a list if you need them more than once, or recreate the iterator.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Generate the first 10 multiples of 7 using count and islice.",
      hint: "islice(count(7, 7), 10)",
      solution: `from itertools import count, islice
print(list(islice(count(7, 7), 10)))
`,
    },
    {
      task: "Given words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry', 'apricot'], group them by first letter using groupby (sort first) and print letter: words.",
      hint: "sorted(words) already sorts by first letter; key=lambda w: w[0]",
      solution: `from itertools import groupby

words = ["apple", "avocado", "banana", "blueberry", "cherry", "apricot"]
for letter, grp in groupby(sorted(words), key=lambda w: w[0]):
    print(letter, list(grp))
`,
    },
    {
      task: "Monthly expenses are [12000, 15000, 9000, 18000]. Print the running total and the month (1-based) when the cumulative total first crosses 30000.",
      hint: "Use accumulate and enumerate, then break when total > 30000.",
      solution: `from itertools import accumulate

expenses = [12000, 15000, 9000, 18000]
running = list(accumulate(expenses))
print(running)
for month, total in enumerate(running, start=1):
    if total > 30000:
        print("Crossed 30000 in month", month)
        break
`,
    },
    {
      task: "Find all pairs of numbers in [2, 4, 5, 7, 9, 11] that add up to 16 using combinations.",
      hint: "[p for p in combinations(nums, 2) if sum(p) == 16]",
      solution: `from itertools import combinations

nums = [2, 4, 5, 7, 9, 11]
pairs = [p for p in combinations(nums, 2) if sum(p) == 16]
print(pairs)
`,
    },
    {
      task: "Generate all sizes and colours for a T-shirt catalog: sizes S, M, L and colours Red, Blue. Print SKUs like 'TS-S-Red' and the total count. Then split the SKUs into batches of 4.",
      hint: "product(sizes, colours) and batched(skus, 4)",
      solution: `from itertools import product, batched

sizes = ["S", "M", "L"]
colours = ["Red", "Blue"]
skus = [f"TS-{s}-{c}" for s, c in product(sizes, colours)]
print(skus, len(skus))
for b in batched(skus, 4):
    print(b)
`,
    },
  ],
  quiz: [
    {
      question: "What does list(itertools.islice(itertools.count(5), 3)) return?",
      options: [
        "[0, 1, 2]",
        "[5, 6, 7]",
        "[5, 10, 15]",
        "Infinite loop",
      ],
      answer: 1,
      explanation: "count(5) yields 5, 6, 7, ... and islice takes the first 3.",
    },
    {
      question: "How many tuples does itertools.combinations(range(5), 2) produce?",
      options: [
        "10",
        "20",
        "25",
        "5",
      ],
      answer: 0,
      explanation: "C(5,2) = 5!/(2!*3!) = 10.",
    },
    {
      question: "list(groupby('AABAA')) produces how many groups?",
      options: [
        "2",
        "3",
        "5",
        "1",
      ],
      answer: 1,
      explanation: "Consecutive groups: AA, B, AA = 3 groups, because groupby does not sort.",
    },
    {
      question: "What does list(itertools.accumulate([1, 2, 3, 4])) return?",
      options: [
        "[1, 2, 3, 4]",
        "[10]",
        "[1, 3, 6, 10]",
        "[1, 2, 6, 24]",
      ],
      answer: 2,
      explanation: "Default operation is addition: running totals.",
    },
    {
      question: "Which function gives overlapping pairs (a,b), (b,c)...?",
      options: [
        "zip_longest",
        "pairwise",
        "batched",
        "tee",
      ],
      answer: 1,
      explanation: "itertools.pairwise (3.10+) returns successive overlapping pairs.",
    },
    {
      question: "list(itertools.takewhile(lambda x: x < 5, [1, 3, 6, 2])) is...",
      options: [
        "[1, 3, 2]",
        "[1, 3]",
        "[6, 2]",
        "[1, 3, 6]",
      ],
      answer: 1,
      explanation: "takewhile stops at 6 and never looks at 2.",
    },
  ],
};
