export default {
  lesson: 'day-34-iterators-generators',
  minutes: 30,
  intro: 'Use iter()/next(), build a custom iterator class, and write memory-friendly generators with yield and generator expressions.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Execution flow of a generator. What is printed?',
      code: `def steps():
    print("start")
    yield 1
    print("middle")
    yield 2
    print("end")

g = steps()
print("created")
print(next(g))
print(next(g))
try:
    next(g)
except StopIteration:
    print("done")`,
      expected: 'created\nstart\n1\nmiddle\n2\nend\ndone',
      explain: 'Calling `steps()` runs **nothing**: it only creates a generator ("created" prints first). Each `next()` runs until the next `yield` and pauses there. After the last yield, the function finishes and `next()` raises StopIteration.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '```\nsq = (n * n for n in range(3))\nprint(sum(sq), sum(sq))\n```\nWhat is printed?',
      options: ['5 5', '5 0', '0 5', 'Error'],
      answer: 1,
      explain: 'A generator is an **iterator**: it can be consumed only once. The first `sum` uses up 0, 1, 4 = 5; the second finds nothing left → 0. Use a list if you need the data twice.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Custom iterator class. Create `Countdown(start)` that implements `__iter__` and `__next__` so that `list(Countdown(3))` → `[3, 2, 1]` and raises `StopIteration` after 1.',
      example: { title: 'iterator protocol', code: 'class Upto:\n    def __init__(self, n):\n        self.i, self.n = 0, n\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.i >= self.n:\n            raise StopIteration\n        self.i += 1\n        return self.i' },
      starter: `class Countdown:
    def __init__(self, start):
        self.current = start
    # TODO: __iter__ and __next__
`,
      solution: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value
`,
      tests: [
        { call: 'list(Countdown(3))', expect: [3, 2, 1] },
        { call: 'list(Countdown(0))', expect: [] },
        { call: '(lambda c: [next(c), next(c)])(iter(Countdown(5)))', expect: [5, 4] },
      ],
      explain: '`__iter__` returns the iterator (self) and `__next__` returns the next value or raises **StopIteration** to end the loop. Returning None instead of raising would make a for loop run forever.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write a **generator function** `batches(items, size)` that yields lists of at most `size` items.\n\n`list(batches([1, 2, 3, 4, 5], 2))` → `[[1, 2], [3, 4], [5]]`',
      example: { title: 'yield in a loop', code: 'def evens(limit):\n    for n in range(0, limit, 2):\n        yield n\n\nprint(list(evens(7)))   # [0, 2, 4, 6]' },
      starter: `def batches(items, size):
    # TODO: use yield
    return []
`,
      solution: `def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]
`,
      tests: [
        { call: 'list(batches([1, 2, 3, 4, 5], 2))', expect: [[1, 2], [3, 4], [5]] },
        { call: 'list(batches(["a", "b", "c"], 5))', expect: [['a', 'b', 'c']] },
        { call: "__import__('inspect').isgeneratorfunction(batches)", expect: true, msg: 'batches must be a generator function (use yield)' },
      ],
      explain: 'Each `yield` hands one batch to the caller and pauses, so only one batch exists in memory at a time: perfect for sending 10,000 SMS in groups of 100. Slicing past the end is safe, so the last short batch needs no special case.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Generator pipeline. `lines` is a list of log lines like `"INFO user login"`, `"ERROR db timeout"`. Write `error_messages(lines)` that returns a **generator** yielding the message part (text after the level) of ERROR lines only, in upper case. Use generator expressions or `yield`.\n\n`list(error_messages(["INFO ok", "ERROR db timeout", "ERROR disk full"]))` → `["DB TIMEOUT", "DISK FULL"]`',
      example: { title: 'chained generator expressions', code: 'words = ["a1", "b2", "a3"]\nas_ = (w for w in words if w.startswith("a"))\nnums = (int(w[1]) for w in as_)\nprint(sum(nums))   # 4' },
      starter: `def error_messages(lines):
    return []  # TODO
`,
      solution: `def error_messages(lines):
    errors = (line for line in lines if line.startswith("ERROR "))
    return (line.split(" ", 1)[1].upper() for line in errors)
`,
      tests: [
        { call: 'list(error_messages(["INFO ok", "ERROR db timeout", "ERROR disk full"]))', expect: ['DB TIMEOUT', 'DISK FULL'] },
        { call: "__import__('inspect').isgenerator(error_messages(['ERROR x']))", expect: true, msg: 'return a generator (not a list)' },
        { call: 'list(error_messages([]))', expect: [] },
      ],
      explain: 'Generator expressions use `( )` instead of `[ ]` and produce values lazily, so a pipeline over a 5 GB log file uses almost no memory. `split(" ", 1)` splits only at the first space, keeping the rest of the message intact.',
    },
  ],
};
