export default {
  id: "day-40-async-await-asyncio",
  title: "Async Programming: async / await, asyncio basics",
  module: "Module 6: Advanced Python",
  day: 40,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Learn asynchronous programming with async/await: coroutines, the event loop, running tasks concurrently with asyncio.gather and create_task, timeouts, semaphores, queues, and when async beats threads.",
  objectives: [
    "Explain synchronous vs asynchronous execution and the event loop",
    "Define coroutines with async def and pause them with await",
    "Run coroutines concurrently with asyncio.gather, create_task and TaskGroup",
    "Handle timeouts, errors and limits with wait_for, return_exceptions and Semaphore",
    "Know where async is used (FastAPI, aiohttp, Django async views) and its pitfalls",
  ],
  theory: [
    {
      heading: "Synchronous vs Asynchronous",
      content: "Synchronous code runs one step at a time: while waiting for a network reply, the program just sits idle. Asynchronous code uses the waiting time to do other work. Analogy: a waiter in a restaurant takes order 1, gives it to the kitchen, and instead of standing there waiting, takes order 2 and 3. When a dish is ready he serves it. One waiter (one thread), many tables (tasks). asyncio is single-threaded concurrency - perfect for I/O-bound tasks such as API calls, database queries, websockets and chat servers.",
      points: [
        "Concurrency without threads: tasks voluntarily pause at await",
        "Not useful for CPU-heavy work (it would block the whole loop)",
        "Can handle thousands of connections with little memory",
      ],
    },
    {
      heading: "Coroutines: async def and await",
      content: "A function defined with async def is a coroutine function. Calling it does NOT run it; it returns a coroutine object. You run it with await (inside another coroutine) or asyncio.run() (from normal code, the entry point). await pauses the current coroutine until the awaited thing finishes, letting the event loop run other tasks in the meantime. You can only use await inside async def.",
      syntax: `import asyncio

async def greet(name):
    await asyncio.sleep(1)       # non-blocking wait
    return f"Hello {name}"

async def main():
    msg = await greet("Asha")
    print(msg)

asyncio.run(main())              # starts the event loop
`,
      tip: "Use asyncio.sleep() inside async code, never time.sleep(), which freezes the entire event loop.",
    },
    {
      heading: "The Event Loop",
      content: "The event loop is the manager that keeps a list of tasks, runs one until it hits an await on something that is not ready, then switches to another ready task. When the I/O finishes, the paused task is resumed. asyncio.run() creates the loop, runs the main coroutine until it completes, and closes the loop.",
    },
    {
      heading: "Running Tasks Concurrently",
      content: "Awaiting coroutines one after another is still sequential. To overlap them: asyncio.gather(c1, c2, c3) runs them together and returns results in the same order as passed. asyncio.create_task(coro) schedules a coroutine to start running in the background and returns a Task you can await later. Python 3.11+ adds asyncio.TaskGroup, which waits for all tasks and cancels the rest if one fails. asyncio.as_completed yields results as they finish.",
      syntax: `results = await asyncio.gather(fetch(1), fetch(2), fetch(3))

task = asyncio.create_task(fetch(4))   # starts now
... other work ...
value = await task

async with asyncio.TaskGroup() as tg:  # 3.11+
    t1 = tg.create_task(fetch(5))
    t2 = tg.create_task(fetch(6))
`,
    },
    {
      heading: "Timeouts, Errors, Limits and Queues",
      content: "asyncio.wait_for(coro, timeout) raises TimeoutError if too slow (3.11+ also has asyncio.timeout()). gather(..., return_exceptions=True) returns exceptions as results instead of failing everything. asyncio.Semaphore(n) limits how many tasks run a section at once (e.g. max 5 API calls at a time). asyncio.Queue supports producer/consumer patterns. task.cancel() cancels a task by raising CancelledError inside it.",
      points: [
        "Blocking libraries (requests, time.sleep) block the loop - use aiohttp/httpx or run them with asyncio.to_thread()",
        "Real-world: FastAPI, aiohttp, Django async views, Discord bots, web scrapers",
      ],
    },
    {
      heading: "Common Mistakes",
      content: "Forgetting await (you get a coroutine object and a 'coroutine was never awaited' warning), calling asyncio.run() inside an already running loop (e.g. Jupyter), using time.sleep in async code, and expecting async to speed up CPU work.",
      points: [
        "result = fetch() without await -> <coroutine object ...>",
        "await is only valid inside async def",
        "Use asyncio.to_thread(func) for blocking functions",
        "Order of output from concurrent tasks depends on their wait times",
      ],
    },
  ],
  examples: [
    {
      title: "First Coroutine: Sequential await vs gather",
      scenario: "Make tea, toast and eggs. Waiting for each one in turn is slow; doing them concurrently is fast.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import asyncio
import time

async def make(item, seconds):
    print(f"start {item}")
    await asyncio.sleep(seconds)        # non-blocking wait
    print(f"done  {item}")
    return item.upper()

async def sequential():
    a = await make("tea", 0.3)
    b = await make("toast", 0.2)
    return [a, b]

async def concurrent():
    return await asyncio.gather(make("tea", 0.3), make("toast", 0.2), make("eggs", 0.1))

async def main():
    t = time.perf_counter()
    print(await sequential())
    print(f"sequential took {time.perf_counter() - t:.1f}s")

    t = time.perf_counter()
    print(await concurrent())
    print(f"concurrent took {time.perf_counter() - t:.1f}s")

coro = make("x", 0)
print(type(coro).__name__)
coro.close()                            # we did not await it; close to avoid a warning
asyncio.run(main())
`,
      python: {
        files: {
          "main.py": `import asyncio
import time

async def make(item, seconds):
    print(f"start {item}")
    await asyncio.sleep(seconds)        # non-blocking wait
    print(f"done  {item}")
    return item.upper()

async def sequential():
    a = await make("tea", 0.3)
    b = await make("toast", 0.2)
    return [a, b]

async def concurrent():
    return await asyncio.gather(make("tea", 0.3), make("toast", 0.2), make("eggs", 0.1))

async def main():
    t = time.perf_counter()
    print(await sequential())
    print(f"sequential took {time.perf_counter() - t:.1f}s")

    t = time.perf_counter()
    print(await concurrent())
    print(f"concurrent took {time.perf_counter() - t:.1f}s")

coro = make("x", 0)
print(type(coro).__name__)
coro.close()                            # we did not await it; close to avoid a warning
asyncio.run(main())
`,
        },
      },
      result: `coroutine
start tea
done  tea
start toast
done  toast
['TEA', 'TOAST']
sequential took 0.5s
start tea
start toast
start eggs
done  eggs
done  toast
done  tea
['TEA', 'TOAST', 'EGGS']
concurrent took 0.3s`,
      explanation: "Calling make() only creates a coroutine object. Awaiting one after another takes 0.3 + 0.2 = 0.5 s. gather() starts all three together: they all print 'start' first, then finish in order of their sleep time (eggs, toast, tea), and the total is only about 0.3 s. gather still returns results in the order passed in.",
    },
    {
      title: "create_task, as_completed and TaskGroup",
      scenario: "A food-delivery app fetches restaurant, rider and payment info in the background while doing other work.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} ({delay}s)"

async def main():
    task = asyncio.create_task(fetch("restaurant menu", 0.2))   # starts immediately
    print("Doing other work while the task runs...")
    await asyncio.sleep(0.1)
    print("Task done yet?", task.done())
    print("Result:", await task)

    jobs = [fetch("rider", 0.3), fetch("payment", 0.1), fetch("offers", 0.2)]
    for coro in asyncio.as_completed(jobs):     # fastest first
        print("finished:", await coro)

    async with asyncio.TaskGroup() as tg:       # Python 3.11+
        t1 = tg.create_task(fetch("orders", 0.1))
        t2 = tg.create_task(fetch("reviews", 0.2))
    print("TaskGroup:", t1.result(), "|", t2.result())

asyncio.run(main())
`,
      python: {
        files: {
          "main.py": `import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} ({delay}s)"

async def main():
    task = asyncio.create_task(fetch("restaurant menu", 0.2))   # starts immediately
    print("Doing other work while the task runs...")
    await asyncio.sleep(0.1)
    print("Task done yet?", task.done())
    print("Result:", await task)

    jobs = [fetch("rider", 0.3), fetch("payment", 0.1), fetch("offers", 0.2)]
    for coro in asyncio.as_completed(jobs):     # fastest first
        print("finished:", await coro)

    async with asyncio.TaskGroup() as tg:       # Python 3.11+
        t1 = tg.create_task(fetch("orders", 0.1))
        t2 = tg.create_task(fetch("reviews", 0.2))
    print("TaskGroup:", t1.result(), "|", t2.result())

asyncio.run(main())
`,
        },
      },
      result: `Doing other work while the task runs...
Task done yet? False
Result: restaurant menu (0.2s)
finished: payment (0.1s)
finished: offers (0.2s)
finished: rider (0.3s)
TaskGroup: orders (0.1s) | reviews (0.2s)`,
      explanation: "create_task schedules the coroutine right away, so it runs while main sleeps; after 0.1 s it is not done yet, and await task waits for the rest. as_completed gives results in finishing order (payment, offers, rider). TaskGroup waits for all its tasks at the end of the async with block.",
    },
    {
      title: "Timeouts, Errors and Cancellation",
      scenario: "A payment API might be slow or fail; the app must not hang forever.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import asyncio

async def call_api(name, delay, fail=False):
    await asyncio.sleep(delay)
    if fail:
        raise ConnectionError(f"{name} failed")
    return f"{name} OK"

async def main():
    try:
        await asyncio.wait_for(call_api("slow-bank", 1.0), timeout=0.2)
    except TimeoutError:
        print("slow-bank: timed out after 0.2s")

    results = await asyncio.gather(
        call_api("upi", 0.1),
        call_api("card", 0.1, fail=True),
        call_api("wallet", 0.2),
        return_exceptions=True,
    )
    for r in results:
        print("error ->" if isinstance(r, Exception) else "ok    ->", r)

    async def long_job():
        try:
            await asyncio.sleep(10)
        except asyncio.CancelledError:
            print("long_job: cleaning up after cancel")
            raise

    task = asyncio.create_task(long_job())
    await asyncio.sleep(0.1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("task cancelled:", task.cancelled())

asyncio.run(main())
`,
      python: {
        files: {
          "main.py": `import asyncio

async def call_api(name, delay, fail=False):
    await asyncio.sleep(delay)
    if fail:
        raise ConnectionError(f"{name} failed")
    return f"{name} OK"

async def main():
    try:
        await asyncio.wait_for(call_api("slow-bank", 1.0), timeout=0.2)
    except TimeoutError:
        print("slow-bank: timed out after 0.2s")

    results = await asyncio.gather(
        call_api("upi", 0.1),
        call_api("card", 0.1, fail=True),
        call_api("wallet", 0.2),
        return_exceptions=True,
    )
    for r in results:
        print("error ->" if isinstance(r, Exception) else "ok    ->", r)

    async def long_job():
        try:
            await asyncio.sleep(10)
        except asyncio.CancelledError:
            print("long_job: cleaning up after cancel")
            raise

    task = asyncio.create_task(long_job())
    await asyncio.sleep(0.1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("task cancelled:", task.cancelled())

asyncio.run(main())
`,
        },
      },
      result: `slow-bank: timed out after 0.2s
ok    -> upi OK
error -> card failed
ok    -> wallet OK
long_job: cleaning up after cancel
task cancelled: True`,
      explanation: "wait_for cancels the slow call and raises TimeoutError after 0.2 s. With return_exceptions=True, gather returns the ConnectionError as a result instead of failing everything. task.cancel() raises CancelledError inside the coroutine at its current await, where it can clean up and must re-raise.",
    },
    {
      title: "Semaphore and Queue: Polite Web Scraper",
      scenario: "Scrape 6 pages (simulated) but allow at most 2 requests at a time, then process results through a queue.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import asyncio

MAX_AT_ONCE = 2
active = 0
peak = 0

async def fetch_page(page, sem):
    global active, peak
    async with sem:                     # at most 2 inside
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.1)
        active -= 1
        return f"page{page}: {page * 100} words"

async def worker(name, queue, out):
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        out.append(f"{name} saved {item.split(':')[0]}")
        queue.task_done()

async def main():
    sem = asyncio.Semaphore(MAX_AT_ONCE)
    pages = await asyncio.gather(*(fetch_page(p, sem) for p in range(1, 7)))
    print(pages)
    print("max concurrent requests:", peak)

    queue = asyncio.Queue()
    out = []
    for p in pages:
        queue.put_nowait(p)
    queue.put_nowait(None)
    await worker("W1", queue, out)
    await queue.join()
    print(out[:2], "...", len(out), "saved")

asyncio.run(main())
`,
      python: {
        files: {
          "main.py": `import asyncio

MAX_AT_ONCE = 2
active = 0
peak = 0

async def fetch_page(page, sem):
    global active, peak
    async with sem:                     # at most 2 inside
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.1)
        active -= 1
        return f"page{page}: {page * 100} words"

async def worker(name, queue, out):
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        out.append(f"{name} saved {item.split(':')[0]}")
        queue.task_done()

async def main():
    sem = asyncio.Semaphore(MAX_AT_ONCE)
    pages = await asyncio.gather(*(fetch_page(p, sem) for p in range(1, 7)))
    print(pages)
    print("max concurrent requests:", peak)

    queue = asyncio.Queue()
    out = []
    for p in pages:
        queue.put_nowait(p)
    queue.put_nowait(None)
    await worker("W1", queue, out)
    await queue.join()
    print(out[:2], "...", len(out), "saved")

asyncio.run(main())
`,
        },
      },
      result: `['page1: 100 words', 'page2: 200 words', 'page3: 300 words', 'page4: 400 words', 'page5: 500 words', 'page6: 600 words']
max concurrent requests: 2
['W1 saved page1', 'W1 saved page2'] ... 6 saved`,
      explanation: "Semaphore(2) lets only two coroutines into the async with block at once, so 6 pages take about 0.3 s and the peak never exceeds 2 - this protects servers from overload. asyncio.Queue is the async version of a thread-safe queue; None is a stop signal and queue.join() waits until every item is marked task_done().",
    },
  ],
  interview: [
    {
      q: "What is asynchronous programming?",
      a: "A style where a program starts an operation (usually I/O) and, instead of waiting, continues with other work; when the operation completes, the program resumes that task. In Python it is done with async/await and asyncio.",
      level: "Easy",
    },
    {
      q: "What is a coroutine?",
      a: "A function defined with async def. Calling it returns a coroutine object that runs only when awaited or scheduled on the event loop. It can pause at await points.",
      level: "Easy",
    },
    {
      q: "What is the event loop?",
      a: "The core scheduler of asyncio that runs tasks, pauses them at await on pending I/O, and resumes them when ready - all in a single thread.",
      level: "Medium",
    },
    {
      q: "Difference between asyncio.gather and asyncio.create_task?",
      a: "create_task schedules one coroutine immediately and returns a Task. gather runs multiple awaitables concurrently and returns their results in input order (wrapping coroutines in tasks).",
      level: "Medium",
    },
    {
      q: "asyncio vs threading?",
      a: "asyncio is single-threaded cooperative multitasking - tasks switch only at await, so fewer race conditions and very low memory per task. Threading uses OS threads with preemptive switching. Both suit I/O-bound work; neither speeds up CPU-bound Python code.",
      level: "Hard",
    },
    {
      q: "Why should you not use time.sleep() in async code?",
      a: "It blocks the whole thread and therefore the event loop, freezing every task. Use await asyncio.sleep().",
      level: "Easy",
    },
    {
      q: "What happens if you call an async function without await?",
      a: "You get a coroutine object; the body never runs and Python warns 'coroutine was never awaited'.",
      level: "Easy",
    },
    {
      q: "How do you run blocking code inside async code?",
      a: "Use await asyncio.to_thread(func, *args) or loop.run_in_executor() to run it in a thread pool without blocking the loop.",
      level: "Hard",
    },
    {
      q: `What is the output?
import asyncio
async def f(n):
    await asyncio.sleep(n / 10)
    print(n)
async def main():
    await asyncio.gather(f(3), f(1), f(2))
asyncio.run(main())`,
      a: "1, 2, 3 on separate lines - all run concurrently and finish in order of their sleep times.",
      level: "Medium",
    },
    {
      q: "How do you add a timeout to a coroutine?",
      a: "await asyncio.wait_for(coro, timeout=5) or (3.11+) async with asyncio.timeout(5): ... ; both raise TimeoutError if it takes too long.",
      level: "Medium",
    },
    {
      q: "Name frameworks that use async in Python.",
      a: "FastAPI, Starlette, aiohttp, Sanic, Django async views/Channels, discord.py, httpx.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Write a coroutine countdown(n) that prints n..1 with 0.1 s gaps, and run it with asyncio.run.",
      hint: "for loop with await asyncio.sleep(0.1).",
      solution: `import asyncio
async def countdown(n):
    for i in range(n, 0, -1):
        print(i)
        await asyncio.sleep(0.1)
asyncio.run(countdown(3))
`,
    },
    {
      task: "Run three coroutines that return squares of 2, 3, 4 concurrently and print the list.",
      hint: "asyncio.gather returns a list.",
      solution: `import asyncio
async def square(n):
    await asyncio.sleep(0.1)
    return n * n
async def main():
    print(await asyncio.gather(*(square(n) for n in (2, 3, 4))))
asyncio.run(main())   # [4, 9, 16]
`,
    },
    {
      task: "Call a coroutine that sleeps 2 s with a 0.5 s timeout and print 'Timeout!'.",
      hint: "asyncio.wait_for + except TimeoutError.",
      solution: `import asyncio
async def slow():
    await asyncio.sleep(2)
async def main():
    try:
        await asyncio.wait_for(slow(), 0.5)
    except TimeoutError:
        print("Timeout!")
asyncio.run(main())
`,
    },
    {
      task: "Limit 5 downloads to 2 concurrent using a Semaphore.",
      hint: "async with sem: inside the download coroutine.",
      solution: `import asyncio
async def download(i, sem):
    async with sem:
        await asyncio.sleep(0.1)
        return i
async def main():
    sem = asyncio.Semaphore(2)
    print(await asyncio.gather(*(download(i, sem) for i in range(5))))
asyncio.run(main())   # [0, 1, 2, 3, 4]
`,
    },
    {
      task: "Run a blocking function (time.sleep based) without blocking the loop.",
      hint: "await asyncio.to_thread(func)",
      solution: `import asyncio, time
def blocking():
    time.sleep(0.2)
    return "done"
async def main():
    print(await asyncio.gather(asyncio.to_thread(blocking), asyncio.sleep(0.1, result="other")))
asyncio.run(main())   # ['done', 'other']
`,
    },
  ],
  quiz: [
    {
      question: "What does calling an async def function return?",
      options: [
        "Its return value",
        "A coroutine object",
        "A Thread",
        "None",
      ],
      answer: 1,
      explanation: "The body runs only when awaited.",
    },
    {
      question: "Which call starts the event loop from normal (sync) code?",
      options: [
        "asyncio.start()",
        "await main()",
        "asyncio.run(main())",
        "loop()",
      ],
      answer: 2,
      explanation: "asyncio.run is the standard entry point.",
    },
    {
      question: "asyncio.gather(a(), b()) returns results in:",
      options: [
        "The order passed in",
        "Finishing order",
        "Random order",
        "Reverse order",
      ],
      answer: 0,
      explanation: "gather preserves input order.",
    },
    {
      question: "Which should be used inside a coroutine to pause without blocking?",
      options: [
        "time.sleep(1)",
        "input()",
        "while True: pass",
        "await asyncio.sleep(1)",
      ],
      answer: 3,
      explanation: "asyncio.sleep yields control to the loop.",
    },
    {
      question: "asyncio is best suited for:",
      options: [
        "Heavy numeric computation",
        "Many concurrent I/O-bound tasks",
        "GPU programming",
        "Replacing multiprocessing for CPU work",
      ],
      answer: 1,
      explanation: "It shines with network/database waits.",
    },
  ],
};
