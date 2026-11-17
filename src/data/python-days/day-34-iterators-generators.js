export default {
  id: "day-34-iterators-generators",
  title: "Iterators and Generators, yield",
  module: "Module 6: Advanced Python",
  day: 34,
  level: "Advanced",
  duration: "2 hours",
  summary: "Understand how for loops really work through the iterator protocol, build your own iterators, and write memory-efficient generators with yield and generator expressions.",
  objectives: [
    "Differentiate between an iterable and an iterator",
    "Use iter() and next() and handle StopIteration",
    "Build a custom iterator class with __iter__ and __next__",
    "Write generator functions with yield and yield from",
    "Use generator expressions and pipelines for large data with low memory",
  ],
  theory: [
    {
      heading: "Iterable vs Iterator",
      content: "An iterable is anything you can loop over: list, tuple, str, dict, set, file, range. It has an __iter__() method that returns an iterator. An iterator is the object that actually produces values one at a time using __next__(). When there are no more values it raises StopIteration. Analogy: a book is iterable; a bookmark is the iterator that remembers which page you are on.",
      syntax: `nums = [10, 20, 30]      # iterable
it = iter(nums)          # iterator
print(next(it))          # 10
print(next(it))          # 20
print(next(it))          # 30
next(it)                 # StopIteration
`,
      points: [
        "Every iterator is iterable (its __iter__ returns itself)",
        "Not every iterable is an iterator (a list has no __next__)",
        "An iterator is exhausted after one full pass",
      ],
    },
    {
      heading: "How a for Loop Works Internally",
      content: "A for loop calls iter() on the object once, then repeatedly calls next() until StopIteration is raised, which it catches silently. Knowing this helps you understand why a generator can be looped over only once and why you can use files, dicts and custom objects in a for loop.",
      syntax: `# for x in data: print(x)   is the same as:
it = iter(data)
while True:
    try:
        x = next(it)
    except StopIteration:
        break
    print(x)
`,
    },
    {
      heading: "Custom Iterator Classes",
      content: "To build your own iterator, write a class with __iter__ (return self) and __next__ (return the next value or raise StopIteration). This is useful for objects that produce a sequence on demand, such as page numbers, countdowns or database rows.",
      tip: "Iterator classes need a lot of code for state. Generators do the same job in a few lines - prefer them unless you need extra methods.",
    },
    {
      heading: "Generators and yield",
      content: "A generator function is a normal def that contains yield. Calling it does not run the body; it returns a generator object. Each next() runs the code until the next yield, hands out the value and PAUSES, remembering all local variables. When the function ends, StopIteration is raised automatically. Analogy: a tea vendor who makes one cup when you ask, instead of preparing 1000 cups in advance.",
      syntax: `def count_up(n):
    i = 1
    while i <= n:
        yield i       # pause here, give i
        i += 1

for x in count_up(3):
    print(x)          # 1 2 3
`,
      points: [
        "return gives one value and ends; yield gives many values over time",
        "Generators are lazy: values are created only when needed",
        "Great for big files, infinite sequences, streaming data",
        "yield from other_iterable delegates to another generator",
      ],
    },
    {
      heading: "Generator Expressions and Memory",
      content: "A generator expression looks like a list comprehension but with parentheses: (x * x for x in range(10)). It produces values lazily instead of building a full list. A list of one million numbers uses megabytes, while the generator object is around 200 bytes regardless of size. Functions like sum(), max(), any(), all() accept generators directly.",
      syntax: `squares_list = [x * x for x in range(1_000_000)]   # all in memory
squares_gen = (x * x for x in range(1_000_000))    # lazy
total = sum(x * x for x in range(1_000_000))       # no extra brackets needed
`,
    },
    {
      heading: "Useful Tools and Common Mistakes",
      content: "The itertools module works with iterators: islice (take a slice of any iterator), count (infinite counter), chain (join iterables), cycle. Common mistakes: trying to reuse an exhausted generator, calling len() on a generator (TypeError), or expecting a generator function to run when called.",
      points: [
        "list(gen) twice -> second time gives []",
        "len(gen) -> TypeError",
        "gen[0] -> TypeError: not subscriptable",
        "Use itertools.islice(gen, 5) to take first 5 values",
        "generator.send(value) can push values into a paused generator (advanced)",
      ],
    },
  ],
  examples: [
    {
      title: "iter(), next() and StopIteration",
      scenario: "See exactly how a for loop pulls values from a list and a string.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `fruits = ["apple", "banana", "cherry"]
it = iter(fruits)
print(type(fruits).__name__, type(it).__name__)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration: no more items")

print(next(iter("hi")), next(iter("hi")))   # a new iterator each time
print(next(it, "default"))                  # default instead of error

# Manual for loop
it2 = iter([1, 2, 3])
while True:
    try:
        n = next(it2)
    except StopIteration:
        break
    print("got", n)
`,
      python: {
        files: {
          "main.py": `fruits = ["apple", "banana", "cherry"]
it = iter(fruits)
print(type(fruits).__name__, type(it).__name__)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration: no more items")

print(next(iter("hi")), next(iter("hi")))   # a new iterator each time
print(next(it, "default"))                  # default instead of error

# Manual for loop
it2 = iter([1, 2, 3])
while True:
    try:
        n = next(it2)
    except StopIteration:
        break
    print("got", n)
`,
        },
      },
      result: `list list_iterator
apple
banana
cherry
StopIteration: no more items
h h
default
got 1
got 2
got 3`,
      explanation: "iter() turns a list into a list_iterator. Each next() returns the next item; after the last item StopIteration is raised. next(it, default) returns a default instead. The while loop shows what a for loop does behind the scenes.",
    },
    {
      title: "Custom Iterator Class vs Generator",
      scenario: "A countdown timer for a rocket launch written in both styles.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Countdown:
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

def countdown_gen(start):
    while start > 0:
        yield start
        start -= 1

print(list(Countdown(5)))
print(list(countdown_gen(5)))

c = Countdown(3)
for n in c:
    print(n, end=" ")
print("| reused:", list(c))      # exhausted

g = countdown_gen(3)
print(type(g).__name__, next(g), next(g))
print(list(g))                    # only what is left
`,
      python: {
        files: {
          "main.py": `class Countdown:
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

def countdown_gen(start):
    while start > 0:
        yield start
        start -= 1

print(list(Countdown(5)))
print(list(countdown_gen(5)))

c = Countdown(3)
for n in c:
    print(n, end=" ")
print("| reused:", list(c))      # exhausted

g = countdown_gen(3)
print(type(g).__name__, next(g), next(g))
print(list(g))                    # only what is left
`,
        },
      },
      result: `[5, 4, 3, 2, 1]
[5, 4, 3, 2, 1]
3 2 1 | reused: []
generator 3 2
[1]`,
      explanation: "Both produce the same values, but the generator needs only 3 lines because Python saves the state (start) between yields. Iterators are single-use: after the loop, list(c) is empty. A generator also remembers where it paused, so list(g) only returns the remaining 1.",
    },
    {
      title: "Execution Flow of a Generator",
      scenario: "Trace exactly when the code inside a generator runs.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def steps():
    print("  start")
    yield "A"
    print("  after A")
    yield "B"
    print("  after B")
    return "done"          # becomes StopIteration.value

g = steps()
print("generator created, nothing printed yet")
print("next ->", next(g))
print("next ->", next(g))
try:
    next(g)
except StopIteration as e:
    print("finished with", e.value)

def nested():
    yield 1
    yield from [2, 3]      # delegate to another iterable
    yield from steps()

print(list(nested()))
`,
      python: {
        files: {
          "main.py": `def steps():
    print("  start")
    yield "A"
    print("  after A")
    yield "B"
    print("  after B")
    return "done"          # becomes StopIteration.value

g = steps()
print("generator created, nothing printed yet")
print("next ->", next(g))
print("next ->", next(g))
try:
    next(g)
except StopIteration as e:
    print("finished with", e.value)

def nested():
    yield 1
    yield from [2, 3]      # delegate to another iterable
    yield from steps()

print(list(nested()))
`,
        },
      },
      result: `generator created, nothing printed yet
  start
next -> A
  after A
next -> B
  after B
finished with done
  start
  after A
  after B
[1, 2, 3, 'A', 'B']`,
      explanation: "Calling steps() only creates the generator. Each next() runs until the next yield and pauses. The final next() runs to the end; the return value is stored in StopIteration.value. yield from passes through every value of another iterable or generator (its prints run too).",
    },
    {
      title: "Memory-Efficient Data Pipeline",
      scenario: "Process a large log of sales lines without loading everything into memory, using generator pipelines.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys
from itertools import islice, count

big_list = [x * x for x in range(100_000)]
big_gen = (x * x for x in range(100_000))
print("list bytes > 100000:", sys.getsizeof(big_list) > 100_000)
print("gen bytes < 500:", sys.getsizeof(big_gen) < 500)
print(sum(big_gen) == sum(big_list))

def read_lines():                      # pretend this reads a huge file
    data = ["shoe,1200", "bag,800", "bad line", "watch,2500", "cap,300"]
    for line in data:
        yield line

def parse(lines):
    for line in lines:
        parts = line.split(",")
        if len(parts) == 2:
            yield parts[0], int(parts[1])

def expensive(items, limit):
    return ((name, price) for name, price in items if price >= limit)

pipeline = expensive(parse(read_lines()), 1000)
for name, price in pipeline:
    print(name, price)

def fibonacci():                       # infinite generator
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonacci(), 10)))
print(list(zip("abc", count(1))))
`,
      python: {
        files: {
          "main.py": `import sys
from itertools import islice, count

big_list = [x * x for x in range(100_000)]
big_gen = (x * x for x in range(100_000))
print("list bytes > 100000:", sys.getsizeof(big_list) > 100_000)
print("gen bytes < 500:", sys.getsizeof(big_gen) < 500)
print(sum(big_gen) == sum(big_list))

def read_lines():                      # pretend this reads a huge file
    data = ["shoe,1200", "bag,800", "bad line", "watch,2500", "cap,300"]
    for line in data:
        yield line

def parse(lines):
    for line in lines:
        parts = line.split(",")
        if len(parts) == 2:
            yield parts[0], int(parts[1])

def expensive(items, limit):
    return ((name, price) for name, price in items if price >= limit)

pipeline = expensive(parse(read_lines()), 1000)
for name, price in pipeline:
    print(name, price)

def fibonacci():                       # infinite generator
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonacci(), 10)))
print(list(zip("abc", count(1))))
`,
        },
      },
      result: `list bytes > 100000: True
gen bytes < 500: True
True
shoe 1200
watch 2500
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
[('a', 1), ('b', 2), ('c', 3)]`,
      explanation: "The list stores 100000 numbers, while the generator object is tiny because it computes values on demand. The pipeline chains generators: each line flows through read_lines -> parse -> expensive one at a time. fibonacci() never ends, so we use islice to take only 10 values; count(1) is an infinite counter that zip stops automatically.",
    },
  ],
  interview: [
    {
      q: "Difference between iterable and iterator?",
      a: "An iterable has __iter__() and can return an iterator (list, str, dict). An iterator has both __iter__() and __next__(), returns one value at a time, and raises StopIteration when exhausted.",
      level: "Easy",
    },
    {
      q: "What is a generator?",
      a: "A function containing yield. Calling it returns a generator object (an iterator) that produces values lazily, pausing after each yield and keeping its local state.",
      level: "Easy",
    },
    {
      q: "Difference between yield and return?",
      a: "return sends one value and ends the function. yield sends a value and pauses the function so it can continue from the same point on the next next() call.",
      level: "Easy",
    },
    {
      q: "Why are generators memory efficient?",
      a: "They produce one value at a time on demand instead of storing the whole sequence in memory. A generator object has a small, constant size.",
      level: "Medium",
    },
    {
      q: "What is yield from?",
      a: "It delegates to another iterable or generator, yielding all its values (and receiving its return value). It replaces a 'for x in sub: yield x' loop.",
      level: "Medium",
    },
    {
      q: "Can you iterate a generator twice?",
      a: "No. Once exhausted, it yields nothing more. Create a new generator by calling the function again, or store results in a list.",
      level: "Easy",
    },
    {
      q: `What is the output?
g = (x for x in range(3))
print(list(g), list(g))`,
      a: "[0, 1, 2] [] - the generator is exhausted after the first list().",
      level: "Easy",
    },
    {
      q: `What is the output?
def f():
    print('A')
    yield 1
g = f()
print('B')
print(next(g))`,
      a: "B then A then 1 - the body does not run until next() is called.",
      level: "Medium",
    },
    {
      q: "Difference between list comprehension and generator expression?",
      a: "[...] builds the full list immediately (supports len, indexing, reuse). (...) creates a lazy generator (low memory, single pass, no len/indexing).",
      level: "Medium",
    },
    {
      q: "How does a for loop work internally?",
      a: "It calls iter(obj) to get an iterator, then calls next() repeatedly, assigning each value to the loop variable, and stops when StopIteration is raised.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a generator even_numbers(n) that yields even numbers up to n.",
      hint: "Use range(0, n + 1, 2) or a while loop with yield.",
      solution: `def even_numbers(n):
    for i in range(0, n + 1, 2):
        yield i
print(list(even_numbers(10)))   # [0, 2, 4, 6, 8, 10]
`,
    },
    {
      task: "Create an iterator class Squares(n) that returns 1, 4, 9 ... n*n.",
      hint: "Keep a counter in self and raise StopIteration.",
      solution: `class Squares:
    def __init__(self, n): self.n, self.i = n, 0
    def __iter__(self): return self
    def __next__(self):
        if self.i >= self.n: raise StopIteration
        self.i += 1
        return self.i ** 2
print(list(Squares(5)))   # [1, 4, 9, 16, 25]
`,
    },
    {
      task: "Write an infinite generator of prime numbers and print the first 10 using islice.",
      hint: "Check divisibility up to sqrt(n).",
      solution: `from itertools import islice, count
def primes():
    for n in count(2):
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            yield n
print(list(islice(primes(), 10)))
`,
    },
    {
      task: "Write a generator chunks(lst, size) that yields sub-lists of the given size.",
      hint: "Use range with a step of size and slicing.",
      solution: `def chunks(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]
print(list(chunks([1, 2, 3, 4, 5, 6, 7], 3)))   # [[1, 2, 3], [4, 5, 6], [7]]
`,
    },
    {
      task: "Using a generator expression, find the sum of squares of odd numbers from 1 to 100.",
      hint: "sum(x*x for x in ... if ...)",
      solution: `print(sum(x * x for x in range(1, 101) if x % 2))   # 166650
`,
    },
  ],
  quiz: [
    {
      question: "Which exception signals that an iterator has no more values?",
      options: [
        "StopIteration",
        "IndexError",
        "EOFError",
        "GeneratorExit",
      ],
      answer: 0,
      explanation: "next() raises StopIteration when exhausted.",
    },
    {
      question: "What does calling a generator function return?",
      options: [
        "The first yielded value",
        "None",
        "A list",
        "A generator object",
      ],
      answer: 3,
      explanation: "The body runs only when next() is called.",
    },
    {
      question: "What is the output of: g = (i for i in [1,2]); next(g); print(list(g))",
      options: [
        "[1, 2]",
        "[2]",
        "[]",
        "Error",
      ],
      answer: 1,
      explanation: "One value was consumed, so only 2 remains.",
    },
    {
      question: "Which methods must an iterator implement?",
      options: [
        "__len__ and __getitem__",
        "__iter__ and __next__",
        "__next__ only",
        "__call__",
      ],
      answer: 1,
      explanation: "The iterator protocol is __iter__ + __next__.",
    },
    {
      question: "Which is lazy (does not build all values in memory)?",
      options: [
        "[x for x in r]",
        "list(r)",
        "(x for x in r)",
        "{x for x in r}",
      ],
      answer: 2,
      explanation: "Parentheses create a generator expression.",
    },
  ],
};
