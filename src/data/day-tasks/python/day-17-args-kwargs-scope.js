export default {
  lesson: 'day-17-args-kwargs-scope',
  minutes: 30,
  intro: 'Accept any number of arguments with *args and **kwargs, unpack with * and **, and understand LEGB, global and nonlocal.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'LEGB in action. What is printed?',
      code: `x = "global"

def outer():
    x = "enclosing"
    def inner():
        nonlocal x
        x = "changed"
    inner()
    print(x)

outer()
print(x)

count = 0
def tick():
    global count
    count += 1
tick(); tick()
print(count)`,
      expected: 'changed\nglobal\n2',
      explain: '`nonlocal x` rebinds the **enclosing** function’s x, so outer prints "changed", while the global x is untouched. `global count` lets `tick` change the module-level variable.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '```\ntotal = 0\ndef add(n):\n    total = total + n\nadd(5)\n```\nWhat happens?',
      options: ['total becomes 5', 'UnboundLocalError', 'NameError', 'Nothing happens'],
      answer: 1,
      explain: 'Because `total` is **assigned** inside the function, Python treats it as local for the whole function. Reading it before assignment gives `UnboundLocalError`. Fix: `global total` (or better, pass and return values).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Write `average(*nums)` that returns the average of **any number** of arguments rounded to 2 decimals, and `0` when called with no arguments.\n\n`average(10, 20, 35)` → 21.67, `average(4, 5)` → 4.5, `average()` → 0',
      example: { title: '*args is a tuple', code: 'def total(*prices):\n    print(prices)        # (10, 20)\n    return sum(prices)\n\ntotal(10, 20)' },
      starter: `def average(*nums):
    # TODO
    pass
`,
      solution: `def average(*nums):
    if not nums:
        return 0
    return round(sum(nums) / len(nums), 2)
`,
      tests: [
        { call: 'average(10, 20, 35)', expect: 21.67 },
        { call: 'average(4, 5)', expect: 4.5 },
        { call: 'average()', expect: 0 },
      ],
      explain: '`*nums` collects all positional arguments into a tuple (empty if none). Check for the empty case first; otherwise `sum(()) / len(())` raises ZeroDivisionError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Write `make_profile(name, **details)` that returns a dict with `"name"` plus every keyword argument passed.\n\n`make_profile("Asha", city="Pune", age=21)` → `{"name": "Asha", "city": "Pune", "age": 21}`',
      example: { title: '**kwargs is a dict', code: 'def show(**info):\n    for k, v in info.items():\n        print(k, "=", v)\n\nshow(course="Python", days=45)' },
      starter: `def make_profile(name, **details):
    # TODO
    pass
`,
      solution: `def make_profile(name, **details):
    profile = {"name": name}
    profile.update(details)
    return profile
`,
      tests: [
        { call: 'make_profile("Asha", city="Pune", age=21)', expect: { name: 'Asha', city: 'Pune', age: 21 } },
        { call: 'make_profile("Ravi")', expect: { name: 'Ravi' } },
      ],
      explain: '`**details` gathers keyword arguments into a dict. `{"name": name, **details}` or `profile.update(details)` merges them. Positional extra arguments are NOT accepted here (that needs *args).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Closure with `nonlocal`. Write `make_counter()` that returns a function; each call of that function returns the next number: 1, 2, 3, ... Two counters must be independent.',
      example: { title: 'inner function remembers outer variables', code: 'def make_greeter(greeting):\n    def greet(name):\n        return greeting + ", " + name\n    return greet\n\nhi = make_greeter("Namaste")\nprint(hi("Asha"))' },
      starter: `def make_counter():
    count = 0
    def next_number():
        # TODO
        pass
    return next_number
`,
      solution: `def make_counter():
    count = 0
    def next_number():
        nonlocal count
        count += 1
        return count
    return next_number
`,
      tests: [
        { call: '(lambda c: [c(), c(), c()])(make_counter())', expect: [1, 2, 3], msg: 'three calls of one counter → 1, 2, 3' },
        { call: '(lambda a, b: [a(), a(), b()])(make_counter(), make_counter())', expect: [1, 2, 1], msg: 'two counters must be independent' },
      ],
      explain: 'Without `nonlocal`, `count += 1` makes `count` local to `next_number` → UnboundLocalError. `nonlocal` tells Python to update the variable of the **enclosing** function, and each `make_counter()` call creates its own `count`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: '```\ndef add(a, b, c):\n    return a + b + c\nnums = [1, 2, 3]\n```\nComplete the call that passes the list items as three separate arguments: `add(____)`',
      accept: ['*nums'],
      explain: '`*nums` **unpacks** the list into positional arguments: `add(1, 2, 3)`. Passing `nums` alone gives one argument → TypeError (missing b and c). `**dict` does the same for keyword arguments.',
    },
  ],
};
