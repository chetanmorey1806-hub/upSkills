export default {
  lesson: 'extra-06-functools',
  minutes: 30,
  intro: 'Use functools: partial, lru_cache/cache, reduce, wraps, singledispatch and total_ordering in practical code.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which function should **NOT** be decorated with `@lru_cache`?',
      options: ['A recursive Fibonacci function', 'A function that converts a state code to a state name from a fixed dict', 'A function that returns the current stock price from an API', 'A function that computes n choose k'],
      answer: 2,
      explain: 'Caching is only safe for **pure** functions: same input, same output. A live stock price changes over time, so a cache would keep returning an old value. Recursive maths functions are perfect for caching.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from functools import partial, reduce
def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5), cube(2))
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))
print(reduce(lambda a, b: a + b, [], 100))`,
      expected: '25 8\n24\n100',
      explain: '`partial` pre-fills `exp`, giving new one-argument functions. `reduce` folds the list: ((1*2)*3)*4 = 24. With an empty list, reduce returns the **initial value** (100); without an initial value it would raise TypeError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Count the ways to climb `n` stairs taking 1 or 2 steps at a time: `ways(n) = ways(n-1) + ways(n-2)`, with `ways(0) = 1` and `ways(1) = 1`. Write it **recursively** and decorate it with `@lru_cache` (or `@cache`) so `ways(40)` is instant.',
      example: { title: 'memoising a recursive function', code: 'from functools import cache\n\n@cache\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)' },
      starter: 'from functools import lru_cache\n\ndef ways(n):\n    # TODO: add the decorator and the recursion\n    return 0\n',
      solution: 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef ways(n):\n    if n <= 1:\n        return 1\n    return ways(n - 1) + ways(n - 2)\n',
      tests: [
        { call: 'ways(1)', expect: 1 },
        { call: 'ways(4)', expect: 5 },
        { call: 'ways(10)', expect: 89 },
        { call: 'ways(40)', expect: 165580141 },
        { call: 'hasattr(ways, "cache_info")', expect: true, msg: 'ways must be decorated with lru_cache or cache' },
      ],
      explain: 'Without caching, the recursion recomputes the same values again and again (exponential time). With `lru_cache`, each `n` is computed once, so the time becomes linear. `cache_info()` exists only on cached functions.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write a decorator `count_calls` that counts how many times the decorated function is called (store it in `wrapper.calls`). Use `@functools.wraps` so the function keeps its `__name__` and docstring.',
      example: { title: 'decorator skeleton with wraps', code: 'import functools\n\ndef shout(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs).upper()\n    return wrapper' },
      starter: 'import functools\n\ndef count_calls(func):\n    # TODO\n    return func\n\n@count_calls\ndef greet(name):\n    "Say hello"\n    return "Hello " + name\n',
      solution: 'import functools\n\ndef count_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        wrapper.calls += 1\n        return func(*args, **kwargs)\n    wrapper.calls = 0\n    return wrapper\n\n@count_calls\ndef greet(name):\n    "Say hello"\n    return "Hello " + name\n',
      tests: [
        { call: 'greet("Asha")', expect: 'Hello Asha' },
        { call: '(greet("A"), greet("B"), greet.calls)[2]', expect: 3, msg: 'greet.calls counts every call' },
        { call: 'greet.__name__', expect: 'greet', msg: 'Use functools.wraps to keep the name' },
        { call: 'greet.__doc__', expect: 'Say hello' },
      ],
      explain: '`wraps(func)` copies `__name__`, `__doc__` and other metadata onto the wrapper; without it the function would be called "wrapper", which confuses debugging and tools. Function objects can hold attributes, so `wrapper.calls` is a simple counter.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Use `functools.singledispatch` to write `describe(value)`:\n- default → `"something"`\n- `int` → `"number N"`\n- `list` → `"list of N items"`\n- `str` → `"text: VALUE"`',
      example: { title: 'singledispatch', code: 'from functools import singledispatch\n\n@singledispatch\ndef area(shape):\n    raise TypeError("unknown")\n\n@area.register\ndef _(shape: float):\n    return 3.14 * shape * shape' },
      starter: 'from functools import singledispatch\n\n@singledispatch\ndef describe(value):\n    return "something"\n\n# TODO: register int, list and str versions\n',
      solution: 'from functools import singledispatch\n\n@singledispatch\ndef describe(value):\n    return "something"\n\n@describe.register\ndef _(value: int):\n    return f"number {value}"\n\n@describe.register\ndef _(value: list):\n    return f"list of {len(value)} items"\n\n@describe.register\ndef _(value: str):\n    return f"text: {value}"\n',
      tests: [
        { call: 'describe(42)', expect: 'number 42' },
        { call: 'describe([1, 2, 3])', expect: 'list of 3 items' },
        { call: 'describe("hi")', expect: 'text: hi' },
        { call: 'describe(3.5)', expect: 'something' },
      ],
      explain: 'singledispatch chooses the implementation from the **type of the first argument**. `@describe.register` reads the type from the annotation. It replaces long `if isinstance(...) elif ...` chains and new types can be added later without editing the original function.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Make class `Version(major, minor)` comparable. Define `__eq__` and `__lt__` (compare `(major, minor)` tuples) and add `@functools.total_ordering` so `<=`, `>` and `>=` work too.',
      example: { title: 'total_ordering', code: '@total_ordering\nclass Rupee:\n    def __init__(self, amt): self.amt = amt\n    def __eq__(self, o): return self.amt == o.amt\n    def __lt__(self, o): return self.amt < o.amt' },
      starter: 'import functools\n\nclass Version:\n    def __init__(self, major, minor):\n        self.major = major\n        self.minor = minor\n    # TODO\n',
      solution: 'import functools\n\n@functools.total_ordering\nclass Version:\n    def __init__(self, major, minor):\n        self.major = major\n        self.minor = minor\n    def __eq__(self, other):\n        return (self.major, self.minor) == (other.major, other.minor)\n    def __lt__(self, other):\n        return (self.major, self.minor) < (other.major, other.minor)\n',
      tests: [
        { call: 'Version(3, 12) > Version(3, 9)', expect: true },
        { call: 'Version(2, 7) >= Version(3, 0)', expect: false },
        { call: 'Version(3, 1) <= Version(3, 1)', expect: true },
        { call: 'Version(1, 0) == Version(1, 0)', expect: true },
        { call: 'max([Version(3, 8), Version(3, 13), Version(3, 11)]).minor', expect: 13 },
      ],
      explain: 'With `__eq__` and one ordering method, `total_ordering` fills in the other three. Comparing tuples compares major first, then minor, so 3.12 > 3.9 is correct (comparing the strings "3.12" and "3.9" would get it wrong).',
    },
  ],
};
