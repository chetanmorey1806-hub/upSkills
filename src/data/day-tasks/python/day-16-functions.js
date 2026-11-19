export default {
  lesson: 'day-16-functions',
  minutes: 30,
  intro: 'Define functions with def, return one or many values, use default and keyword arguments and avoid the mutable default trap.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'print vs return. What is printed?',
      code: `def greet(name):
    print("Hi", name)

def square(n):
    return n * n

x = greet("Asha")
print(x)
print(square(4) + 1)`,
      expected: 'Hi Asha\nNone\n17',
      explain: '`greet` only **prints**; it has no return, so it returns `None` and `x` is None. `square` **returns** 16, which the caller can use in more calculations. Use return when the caller needs the value.',
    },
    {
      type: 'fill',
      mins: 1,
      q: '```\ndef power(base, exp=2):\n    return base ** exp\n```\nWhat does `power(5)` return?',
      accept: ['25'],
      explain: '`exp` has a **default value** of 2, so `power(5)` is 5 ** 2 = 25. `power(5, 3)` or `power(5, exp=3)` would override it with 3.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `bill(price, qty, discount=0)` that returns the amount to pay: `price * qty` minus `discount` **percent**, rounded to 2 decimals.\n\nExamples: `bill(120, 3)` → 360, `bill(120, 3, 10)` → 324, `bill(99.5, 2, discount=5)` → 189.05',
      example: { title: 'default parameter', code: 'def area(length, width=1):\n    return length * width\n\nprint(area(5))      # 5\nprint(area(5, 3))   # 15' },
      starter: `def bill(price, qty, discount=0):
    # TODO
    pass
`,
      solution: `def bill(price, qty, discount=0):
    total = price * qty
    return round(total - total * discount / 100, 2)
`,
      tests: [
        { call: 'bill(120, 3) == 360', expect: true, msg: 'bill(120, 3) should be 360' },
        { call: 'bill(120, 3, 10) == 324', expect: true, msg: 'bill(120, 3, 10) should be 324' },
        { call: 'bill(99.5, 2, discount=5)', expect: 189.05 },
      ],
      explain: 'Parameters with defaults must come after those without. The keyword call `discount=5` makes the call readable. A common mistake is printing the result instead of **returning** it: then `bill(...)` gives None.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `stats(marks)` that **returns three values**: the lowest mark, the highest mark and the average rounded to 2 decimals.\n\nExample: `stats([78, 92, 65])` → `(65, 92, 78.33)`',
      example: { title: 'returning multiple values', code: 'def split_name(full):\n    first, last = full.split()\n    return first, last      # returns a tuple\n\nf, l = split_name("Asha Patil")' },
      starter: `def stats(marks):
    # TODO
    pass
`,
      solution: `def stats(marks):
    return min(marks), max(marks), round(sum(marks) / len(marks), 2)
`,
      tests: [
        { call: 'stats([78, 92, 65])', expect: [65, 92, 78.33] },
        { call: 'stats([40, 41])', expect: [40, 41, 40.5] },
        { call: 'type(stats([1, 2])).__name__', expect: 'tuple', msg: 'return the three values separated by commas (a tuple)' },
      ],
      explain: '`return a, b, c` packs the values into a tuple, which the caller can unpack: `lo, hi, avg = stats(m)`. Only the first `return` that runs counts: three separate return lines would return just the first value.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'This function has the **mutable default argument** bug: calling it twice keeps the old items.\n\nFix `add_item(item, cart=...)` so each call without a cart starts a **new** empty list, while passing a cart still appends to it.',
      example: { title: 'the safe pattern', code: 'def log(msg, history=None):\n    if history is None:\n        history = []\n    history.append(msg)\n    return history' },
      starter: `def add_item(item, cart=[]):
    cart.append(item)
    return cart
`,
      solution: `def add_item(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart
`,
      tests: [
        { call: 'add_item("pen")', expect: ['pen'] },
        { call: 'add_item("book")', expect: ['book'], msg: 'a second call without cart must start a new list' },
        { call: 'add_item("bag", ["pen"])', expect: ['pen', 'bag'] },
      ],
      explain: 'Default values are created **once**, when `def` runs, so the same list is shared by every call. Using `None` as the default and creating the list inside the function gives a fresh list each time.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Write `grade(marks)` that **returns** `"A"` for 75 and above, `"B"` for 60-74, `"C"` for 40-59 and `"Fail"` below 40.',
      example: { title: 'returning from branches', code: 'def sign(n):\n    if n > 0:\n        return "positive"\n    if n < 0:\n        return "negative"\n    return "zero"' },
      starter: `def grade(marks):
    # TODO
    pass
`,
      solution: `def grade(marks):
    if marks >= 75:
        return "A"
    elif marks >= 60:
        return "B"
    elif marks >= 40:
        return "C"
    return "Fail"
`,
      tests: [
        { call: 'grade(75)', expect: 'A' },
        { call: 'grade(74)', expect: 'B' },
        { call: 'grade(40)', expect: 'C' },
        { call: 'grade(39)', expect: 'Fail' },
      ],
      explain: '`return` ends the function immediately, so after a match nothing else runs. Test the **boundaries** (75, 74, 40, 39): off-by-one errors like `> 75` are the most common bug.',
    },
  ],
};
