export default {
  lesson: 'day-19-recursion',
  minutes: 30,
  intro: 'Write recursive functions with a clear base case, trace the call stack and speed up Fibonacci with lru_cache.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A recursive function has no base case (or never reaches it). What happens in Python?',
      options: ['It runs forever silently', 'RecursionError: maximum recursion depth exceeded', 'It returns None', 'SyntaxError'],
      answer: 1,
      explain: 'Every call adds a frame to the call stack. Python limits the depth (about 1000, see `sys.getrecursionlimit()`) and raises **RecursionError** instead of crashing. Always write the base case first.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Trace the calls. What is printed?',
      code: `def show(n):
    if n == 0:
        print("base")
        return
    print("down", n)
    show(n - 1)
    print("up", n)

show(2)`,
      expected: 'down 2\ndown 1\nbase\nup 1\nup 2',
      explain: 'Code **before** the recursive call runs on the way down (2, 1). After the base case, each paused call resumes and runs the code **after** the call, in reverse order (1, 2): that is the call stack unwinding.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write **recursive** functions (they must call themselves; no loops):\n- `factorial(n)` → n! (factorial(0) = 1)\n- `sum_digits(n)` → sum of the digits of a non-negative int (sum_digits(4729) = 22)',
      example: { title: 'base case + smaller problem', code: 'def count_down(n):\n    if n == 0:          # base case\n        return\n    print(n)\n    count_down(n - 1)   # smaller problem' },
      starter: `def factorial(n):
    # TODO
    pass

def sum_digits(n):
    # TODO
    pass
`,
      solution: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def sum_digits(n):
    if n < 10:
        return n
    return n % 10 + sum_digits(n // 10)
`,
      tests: [
        { call: 'factorial(0)', expect: 1 },
        { call: 'factorial(5)', expect: 120 },
        { call: 'sum_digits(4729)', expect: 22 },
        { call: 'sum_digits(7)', expect: 7 },
        { call: "'factorial' in factorial.__code__.co_names and 'sum_digits' in sum_digits.__code__.co_names", expect: true, msg: 'both functions must call themselves (recursion)' },
      ],
      explain: 'Each function needs a **base case** that returns directly (n <= 1, or a single digit) and a recursive case that works on a **smaller** input (n - 1, n // 10). Forgetting to `return` the recursive result gives None.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write a recursive `reverse(s)` that returns the string reversed (no slicing with `[::-1]`, no loops).\n\n`reverse("python")` → `"nohtyp"`, `reverse("")` → `""`',
      example: { title: 'first character + rest', code: 's = "abc"\nprint(s[0], s[1:])   # a bc' },
      starter: `def reverse(s):
    # TODO
    pass
`,
      solution: `def reverse(s):
    if s == "":
        return ""
    return reverse(s[1:]) + s[0]
`,
      tests: [
        { call: 'reverse("python")', expect: 'nohtyp' },
        { call: 'reverse("a")', expect: 'a' },
        { call: 'reverse("")', expect: '' },
        { call: "'reverse' in reverse.__code__.co_names", expect: true, msg: 'reverse must call itself' },
      ],
      explain: 'Reverse of "python" = reverse of "ython" + "p". The base case is the empty string. Without it, `s[0]` on "" raises IndexError (or the recursion never stops).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Memoization. Write a recursive `fib(n)` (fib(0) = 0, fib(1) = 1) and decorate it with `@lru_cache` from `functools` so repeated sub-problems are remembered.',
      example: { title: 'lru_cache', code: 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef slow_square(n):\n    return n * n' },
      starter: `from functools import lru_cache

def fib(n):
    # TODO
    pass
`,
      solution: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
`,
      tests: [
        { call: 'fib(0)', expect: 0 },
        { call: 'fib(10)', expect: 55 },
        { call: 'fib(20)', expect: 6765 },
        { call: "hasattr(fib, 'cache_info')", expect: true, msg: 'fib must be decorated with @lru_cache' },
      ],
      explain: 'Naive Fibonacci recalculates the same values again and again (exponential time). `@lru_cache` stores each result, so every fib(k) is computed once: fib(100) becomes instant.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write a recursive `flatten(items)` that turns a list nested to **any depth** into a flat list.\n\n`flatten([1, [2, [3, 4]], 5, [[6]]])` → `[1, 2, 3, 4, 5, 6]`',
      example: { title: 'is it a list?', code: 'print(isinstance([1, 2], list))   # True\nprint(isinstance(3, list))        # False' },
      starter: `def flatten(items):
    # TODO
    pass
`,
      solution: `def flatten(items):
    result = []
    for x in items:
        if isinstance(x, list):
            result.extend(flatten(x))
        else:
            result.append(x)
    return result
`,
      tests: [
        { call: 'flatten([1, [2, [3, 4]], 5, [[6]]])', expect: [1, 2, 3, 4, 5, 6] },
        { call: 'flatten([])', expect: [] },
        { call: 'flatten([[["deep"]]])', expect: ['deep'] },
      ],
      explain: 'For each item: if it is a list, flatten it recursively and `extend` the result; otherwise `append` it. Using `append` for the recursive result would keep the nesting.',
    },
  ],
};
