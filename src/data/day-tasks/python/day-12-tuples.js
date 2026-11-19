export default {
  lesson: 'day-12-tuples',
  minutes: 25,
  intro: 'Create tuples (including the single-item trap), pack and unpack them, use count/index and namedtuple, and compare tuples with lists.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is `type((5))` and how do you make a tuple with one item?',
      options: [
        "<class 'tuple'>; (5) is fine",
        "<class 'int'>; write (5,) with a trailing comma",
        "<class 'list'>; write [5]",
        "<class 'int'>; write tuple 5",
      ],
      answer: 1,
      explain: 'Brackets alone just group an expression, so `(5)` is the int 5. The **comma** makes a tuple: `(5,)` or even `5,`. This single-element trap is a popular interview question.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `first, *middle, last = (10, 20, 30, 40, 50)
print(first, middle, last)
t = (1, [2, 3])
t[1].append(4)
print(t)
point = 3, 4
x, y = point
print(type(point).__name__, x + y)`,
      expected: '10 [20, 30, 40] 50\n(1, [2, 3, 4])\ntuple 7',
      explain: '`*middle` collects the extra items into a **list**. A tuple is immutable (you cannot replace `t[1]`), but the list **inside** it is mutable and can change. `3, 4` without brackets is packing into a tuple; `x, y = point` unpacks it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **tuple vs list** are true? (select all that apply)',
      options: [
        'Tuples cannot be changed after creation (immutable)',
        'A tuple (of immutable items) can be used as a dictionary key; a list cannot',
        'Tuples have append() and remove() methods',
        'Tuples use a little less memory than the same list',
        'Tuples are good for fixed records like (latitude, longitude)',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Tuples are immutable, hashable (if their items are), slightly smaller and faster, and ideal for fixed records. They only have two methods: `count()` and `index()`: no append/remove.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'A student record is stored as a nested tuple:\n```\nrecord = ("Asha", 101, (78, 85, 90))\n```\n**Unpack** it into `name`, `roll` and `marks` in one line, compute the average of `marks`, and print:\n```\nAsha (101): 84.33\n```',
      example: { title: 'unpacking a tuple', code: 'emp = ("Ravi", "Pune", 45000)\nname, city, salary = emp\nprint(name, salary)' },
      starter: `record = ("Asha", 101, (78, 85, 90))
# TODO: unpack and print
`,
      solution: `record = ("Asha", 101, (78, 85, 90))
name, roll, marks = record
avg = sum(marks) / len(marks)
print(f"{name} ({roll}): {avg:.2f}")`,
      tests: [
        { stdout: 'Asha (101): 84.33' },
        { call: '(name, roll, marks)', expect: ['Asha', 101, [78, 85, 90]], msg: 'name, roll and marks must be unpacked from record' },
      ],
      explain: 'The number of names on the left must equal the number of items (3); otherwise you get "too many / not enough values to unpack". `sum()` and `len()` work on tuples just like on lists.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Temperature readings are stored in a tuple:\n```\nreadings = (31, 29, 35, 31, 28, 35, 31)\n```\nCreate:\n- `count31`: how many times 31 appears (tuple method)\n- `first35`: the index of the first 35 (tuple method)\n- `sorted_readings`: a **tuple** of the readings in ascending order',
      example: { title: 'tuple methods', code: 'colors = ("red", "blue", "red")\nprint(colors.count("red"))   # 2\nprint(colors.index("blue"))  # 1' },
      starter: `readings = (31, 29, 35, 31, 28, 35, 31)
count31 = 0          # TODO
first35 = -1         # TODO
sorted_readings = () # TODO
`,
      solution: `readings = (31, 29, 35, 31, 28, 35, 31)
count31 = readings.count(31)
first35 = readings.index(35)
sorted_readings = tuple(sorted(readings))
`,
      tests: [
        { call: 'count31', expect: 3 },
        { call: 'first35', expect: 2 },
        { call: 'sorted_readings', expect: [28, 29, 31, 31, 31, 35, 35] },
        { call: 'type(sorted_readings).__name__', expect: 'tuple', msg: 'sorted_readings must be a tuple (sorted() returns a list: convert it)' },
      ],
      explain: 'Tuples have only `count()` and `index()`. There is no `readings.sort()` because tuples are immutable; `sorted()` returns a **list**, so wrap it in `tuple(...)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Use `collections.namedtuple` to create a type `Product` with fields `name`, `price`, `qty`. Then create\n```\nitems = [Product("Pen", 10, 5), Product("Notebook", 45, 3), Product("Bag", 650, 1)]\n```\nand compute `total` = sum of price × qty for all items (using the field names, not indexes).',
      example: { title: 'namedtuple', code: 'from collections import namedtuple\nPoint = namedtuple("Point", ["x", "y"])\np = Point(3, 4)\nprint(p.x + p.y)   # 7' },
      starter: `from collections import namedtuple
# TODO: Product = namedtuple(...)
# TODO: items = [...]
total = 0
`,
      solution: `from collections import namedtuple
Product = namedtuple("Product", ["name", "price", "qty"])
items = [Product("Pen", 10, 5), Product("Notebook", 45, 3), Product("Bag", 650, 1)]
total = 0
for p in items:
    total += p.price * p.qty
`,
      tests: [
        { call: 'Product("Pen", 10, 5).price', expect: 10, msg: 'Product must have a price field' },
        { call: 'Product("Pen", 10, 5).qty', expect: 5, msg: 'Product must have a qty field' },
        { call: 'total', expect: 835 },
      ],
      explain: 'A namedtuple is still a tuple (immutable, unpackable) but its items have **names**, so `p.price` is clearer than `p[1]`. 10×5 + 45×3 + 650×1 = 835.',
    },
  ],
};
