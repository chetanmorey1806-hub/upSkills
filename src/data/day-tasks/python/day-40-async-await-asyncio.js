// _drive(coro) runs a coroutine that only awaits asyncio.sleep(0) / other coroutines, step by step (the browser
// Python already runs an event loop, so asyncio.run() is not available inside the grader).
const DRIVE = 'exec("def _drive(c):\\n    try:\\n        while True:\\n            c.send(None)\\n    except StopIteration as e:\\n        return e.value")';

export default {
  lesson: 'day-40-async-await-asyncio',
  minutes: 30,
  intro: 'Write coroutines with async def / await, run them concurrently with asyncio.gather and avoid blocking the event loop.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '```\nasync def greet():\n    return "hi"\n\nx = greet()\n```\nWhat is `x`?',
      options: ['The string "hi"', 'A coroutine object (the body has not run yet)', 'None', 'A Thread'],
      answer: 1,
      explain: 'Calling an `async def` function only creates a **coroutine object**. It runs when awaited (`await greet()`) or scheduled by the event loop (`asyncio.run(greet())`). Forgetting `await` gives "coroutine was never awaited" warnings.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What is printed?',
      code: `import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    print("got", name)
    return name.upper()

async def main():
    results = await asyncio.gather(fetch("orders", 0.2), fetch("users", 0.1))
    print(results)

asyncio.run(main())`,
      expected: "got users\ngot orders\n['ORDERS', 'USERS']",
      explain: '`gather` runs both coroutines **concurrently**: "users" (0.1 s) finishes first, so it prints first. But the returned list is always in the **order you passed** the coroutines, not completion order. Total time ≈ 0.2 s instead of 0.3 s.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are mistakes inside an `async def` function? (select all that apply)',
      options: [
        'Calling `time.sleep(2)` (blocks the whole event loop)',
        'Using `await asyncio.sleep(2)`',
        'Calling another coroutine without `await`',
        'Using `requests.get(...)` for many concurrent downloads (it is blocking)',
      ],
      answers: [0, 2, 3],
      explain: 'Blocking calls (`time.sleep`, `requests`) freeze every task on the event loop; use `asyncio.sleep` and async libraries such as aiohttp/httpx. A coroutine called without await never runs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that pauses the coroutine until `get_user()` finishes and stores its result:\n```\nuser = ____ get_user(7)\n```',
      accept: ['await'],
      explain: '`await` suspends the current coroutine (letting others run) until the awaited coroutine completes, then gives back its return value. `await` is only allowed inside `async def`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write two coroutines:\n- `async def get_price(item)` → simulates a network call with `await asyncio.sleep(0)` and returns the price from `PRICES`\n- `async def cart_total(items)` → **awaits** `get_price` for each item and returns the sum\n\nNote: the in-browser grader drives your coroutines step by step, so use `asyncio.sleep(0)` (not longer sleeps) and plain `await` here (no gather / asyncio.run).\n\n`cart_total(["pen", "book"])` → 130',
      example: { title: 'awaiting one coroutine from another', code: 'import asyncio\n\nasync def square(n):\n    await asyncio.sleep(0)   # give other tasks a turn\n    return n * n\n\nasync def sum_squares(nums):\n    total = 0\n    for n in nums:\n        total += await square(n)\n    return total' },
      starter: `import asyncio

PRICES = {"pen": 10, "book": 120, "bag": 650}

async def get_price(item):
    pass  # TODO

async def cart_total(items):
    pass  # TODO
`,
      solution: `import asyncio

PRICES = {"pen": 10, "book": 120, "bag": 650}

async def get_price(item):
    await asyncio.sleep(0)
    return PRICES[item]

async def cart_total(items):
    total = 0
    for item in items:
        total += await get_price(item)
    return total
`,
      tests: [
        { call: `${DRIVE} or _drive(cart_total(["pen", "book"]))`, expect: 130, msg: 'await cart_total(["pen", "book"]) should give 130' },
        { call: `${DRIVE} or _drive(cart_total(["bag", "bag", "pen"]))`, expect: 1310, msg: 'await cart_total(["bag", "bag", "pen"]) should give 1310' },
        { call: `${DRIVE} or _drive(get_price("book"))`, expect: 120, msg: 'await get_price("book") should give 120' },
        { call: "__import__('inspect').iscoroutinefunction(cart_total) and __import__('inspect').iscoroutinefunction(get_price)", expect: true, msg: 'both functions must be defined with async def' },
      ],
      explain: 'Inside `async def`, `await get_price(item)` pauses until the price is ready and gives back the number. Without `await`, `total += get_price(item)` tries to add a **coroutine object** to an int (TypeError). In a real app you would speed this up with `asyncio.gather(*(get_price(i) for i in items))`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Preparing work for `asyncio.gather`. Write a normal (non-async) function `make_jobs(items)` that returns a **list of coroutine objects** `get_price(item)` (one per item) **without running them**. In a real program you would then do `await asyncio.gather(*make_jobs(items))`.',
      example: { title: 'creating vs running a coroutine', code: 'async def ping():\n    return "pong"\n\njob = ping()        # created, not run yet\nprint(type(job).__name__)   # coroutine\njob.close()         # discard it (avoids a warning)' },
      starter: `import asyncio

async def get_price(item):
    await asyncio.sleep(0)
    return {"pen": 10, "book": 120}[item]

def make_jobs(items):
    return []  # TODO
`,
      solution: `import asyncio

async def get_price(item):
    await asyncio.sleep(0)
    return {"pen": 10, "book": 120}[item]

def make_jobs(items):
    return [get_price(item) for item in items]
`,
      tests: [
        { call: `(lambda jobs: [type(j).__name__ for j in jobs] + [j.close() for j in jobs][:0])(make_jobs(["pen", "book"]))`, expect: ['coroutine', 'coroutine'], msg: 'make_jobs must return coroutine objects, one per item' },
        { call: `${DRIVE} or [_drive(j) for j in make_jobs(["book", "pen"])]`, expect: [120, 10], msg: 'each job, when awaited, gives the item price (same order)' },
      ],
      explain: 'Calling `get_price(item)` only **creates** a coroutine; nothing runs until it is awaited or scheduled. That is exactly what gather needs: a set of ready-to-run coroutines it can start together on the event loop.',
    },
  ],
};
