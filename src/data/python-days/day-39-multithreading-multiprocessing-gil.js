export default {
  id: "day-39-multithreading-multiprocessing-gil",
  title: "Multithreading, Multiprocessing and the GIL (concepts)",
  module: "Module 6: Advanced Python",
  day: 39,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Understand concurrency vs parallelism, create threads and processes in Python, protect shared data with locks, use thread and process pools, and learn how the Global Interpreter Lock (GIL) decides which tool to use for I/O-bound and CPU-bound work.",
  objectives: [
    "Differentiate process, thread, concurrency and parallelism",
    "Create, start and join threads and share results safely",
    "Explain race conditions and fix them with Lock",
    "Use concurrent.futures ThreadPoolExecutor and ProcessPoolExecutor",
    "Explain the GIL and choose threading, multiprocessing or asyncio for a task",
  ],
  theory: [
    {
      heading: "Process, Thread, Concurrency and Parallelism",
      content: "A process is a running program with its own memory (opening Chrome and VS Code creates separate processes). A thread is a lightweight unit of execution inside a process; threads of the same process share memory. Concurrency means handling many tasks by switching between them (one cook managing three dishes). Parallelism means truly running tasks at the same time on multiple CPU cores (three cooks, three dishes).",
      points: [
        "Processes: separate memory, heavier to create, communicate through queues/pipes",
        "Threads: shared memory, light, but shared data needs protection",
        "Program starts with one main thread in one main process",
      ],
    },
    {
      heading: "The Global Interpreter Lock (GIL)",
      content: "CPython has a Global Interpreter Lock: only one thread can execute Python bytecode at a time inside one process. It keeps reference counting simple and safe. Effect: threads do NOT speed up CPU-heavy Python code (calculations, loops). But a thread releases the GIL while it waits for I/O (network, disk, sleep), so threads DO speed up I/O-bound work. For CPU-bound work, use multiprocessing: each process has its own interpreter and its own GIL, so it can use all cores.",
      points: [
        "I/O-bound (downloads, API calls, file/DB access) -> threading or asyncio",
        "CPU-bound (image processing, number crunching) -> multiprocessing",
        "Libraries like NumPy release the GIL inside C code",
        "Python 3.13 has an experimental free-threaded (no-GIL) build",
      ],
      tip: "Interview one-liner: 'The GIL lets only one thread run Python bytecode at a time, so threads help I/O-bound tasks and processes help CPU-bound tasks.'",
    },
    {
      heading: "The threading Module",
      content: "Create a Thread with a target function and args, call start() to begin and join() to wait for it to finish. Threads cannot return values directly; store results in a shared list/dict or use concurrent.futures. daemon=True threads are killed automatically when the main program ends.",
      syntax: `import threading

def work(n):
    print("working on", n)

t = threading.Thread(target=work, args=(1,))
t.start()      # begin running in parallel
t.join()       # wait until it finishes
`,
    },
    {
      heading: "Race Conditions and Locks",
      content: "When several threads read-modify-write the same variable, their steps can interleave and updates get lost; this is a race condition. A Lock allows only one thread at a time into a critical section. Use it with the with statement so it is always released. Other tools: RLock (re-entrant), Semaphore (limit N workers), Event (signal), and queue.Queue (thread-safe producer/consumer).",
      syntax: `lock = threading.Lock()
with lock:
    counter += 1     # only one thread at a time here
`,
      points: [
        "Deadlock: two threads each wait for a lock the other holds - always acquire locks in the same order",
        "queue.Queue is already thread-safe",
      ],
    },
    {
      heading: "multiprocessing and concurrent.futures",
      content: "multiprocessing.Process works like Thread but starts a new Python process. Pool / ProcessPoolExecutor distribute work across cores. Data sent between processes must be picklable, and code that starts processes must be inside if __name__ == '__main__': (required on Windows and macOS). concurrent.futures gives one simple API for both: ThreadPoolExecutor and ProcessPoolExecutor with submit(), map() and as_completed().",
      syntax: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

with ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(download, urls))       # I/O-bound

if __name__ == "__main__":
    with ProcessPoolExecutor() as ex:
        results = list(ex.map(heavy_math, numbers))  # CPU-bound
`,
    },
    {
      heading: "Choosing the Right Tool and Common Mistakes",
      content: "Use threading for a moderate number of blocking I/O tasks, asyncio for thousands of network connections, and multiprocessing for CPU-heavy work. Common mistakes: expecting threads to speed up CPU loops, forgetting join(), sharing data without locks, forgetting the __main__ guard, and passing lambdas (not picklable) to process pools.",
      points: [
        "Thread output order is not guaranteed - collect results and print after join for predictable output",
        "Too many processes cause overhead; use os.cpu_count() as a guide",
      ],
    },
  ],
  examples: [
    {
      title: "Threads for I/O-bound Work: Sequential vs Threaded",
      scenario: "Download three files (simulated with sleep). Threads overlap the waiting time.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import threading
import time

def download(name, seconds, results):
    time.sleep(seconds)                 # simulates waiting for network
    results[name] = f"{name} done in {seconds}s"

files = [("report.pdf", 0.3), ("photo.jpg", 0.3), ("video.mp4", 0.3)]

start = time.perf_counter()
seq_results = {}
for name, sec in files:
    download(name, sec, seq_results)
print(f"Sequential: {time.perf_counter() - start:.1f}s")

start = time.perf_counter()
results = {}
threads = [threading.Thread(target=download, args=(n, s, results)) for n, s in files]
for t in threads:
    t.start()
for t in threads:
    t.join()                            # wait for all
print(f"Threaded:   {time.perf_counter() - start:.1f}s")

for name, _ in files:                   # print in a fixed order
    print(results[name])
print("Active threads now:", threading.active_count())
`,
      python: {
        files: {
          "main.py": `import threading
import time

def download(name, seconds, results):
    time.sleep(seconds)                 # simulates waiting for network
    results[name] = f"{name} done in {seconds}s"

files = [("report.pdf", 0.3), ("photo.jpg", 0.3), ("video.mp4", 0.3)]

start = time.perf_counter()
seq_results = {}
for name, sec in files:
    download(name, sec, seq_results)
print(f"Sequential: {time.perf_counter() - start:.1f}s")

start = time.perf_counter()
results = {}
threads = [threading.Thread(target=download, args=(n, s, results)) for n, s in files]
for t in threads:
    t.start()
for t in threads:
    t.join()                            # wait for all
print(f"Threaded:   {time.perf_counter() - start:.1f}s")

for name, _ in files:                   # print in a fixed order
    print(results[name])
print("Active threads now:", threading.active_count())
`,
        },
      },
      result: `Sequential: 0.9s
Threaded:   0.3s
report.pdf done in 0.3s
photo.jpg done in 0.3s
video.mp4 done in 0.3s
Active threads now: 1`,
      explanation: "Each download sleeps 0.3 s. Sequentially that is 0.9 s, but threads wait at the same time so the total is about 0.3 s. Results are stored in a shared dict and printed after join() in a fixed order, which keeps the output predictable. After all threads finish only the main thread is active. (The browser runner may not support real threads; run locally if needed.)",
    },
    {
      title: "Race Condition and Lock",
      scenario: "Several cashier threads update the same shop balance. A Lock keeps the total correct.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import threading

balance = 0
lock = threading.Lock()

def deposit_safe(times):
    global balance
    for _ in range(times):
        with lock:                      # critical section
            current = balance
            balance = current + 1

threads = [threading.Thread(target=deposit_safe, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("Expected:", 4 * 100_000)
print("With lock:", balance)

# Thread-safe producer / consumer using queue.Queue
import queue

q = queue.Queue()
processed = []

def producer():
    for order in ["ORD1", "ORD2", "ORD3"]:
        q.put(order)
    q.put(None)                         # signal: no more work

def consumer():
    while (item := q.get()) is not None:
        processed.append(item.lower())

p = threading.Thread(target=producer)
c = threading.Thread(target=consumer)
p.start(); c.start(); p.join(); c.join()
print("Processed:", processed)
`,
      python: {
        files: {
          "main.py": `import threading

balance = 0
lock = threading.Lock()

def deposit_safe(times):
    global balance
    for _ in range(times):
        with lock:                      # critical section
            current = balance
            balance = current + 1

threads = [threading.Thread(target=deposit_safe, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("Expected:", 4 * 100_000)
print("With lock:", balance)

# Thread-safe producer / consumer using queue.Queue
import queue

q = queue.Queue()
processed = []

def producer():
    for order in ["ORD1", "ORD2", "ORD3"]:
        q.put(order)
    q.put(None)                         # signal: no more work

def consumer():
    while (item := q.get()) is not None:
        processed.append(item.lower())

p = threading.Thread(target=producer)
c = threading.Thread(target=consumer)
p.start(); c.start(); p.join(); c.join()
print("Processed:", processed)
`,
        },
      },
      result: `Expected: 400000
With lock: 400000
Processed: ['ord1', 'ord2', 'ord3']`,
      explanation: "balance = current + 1 is a read-modify-write. Without a lock, two threads can read the same value and one update is lost, so the total can come out lower (and different every run). with lock lets only one thread run that section at a time, so the result is always 400000. queue.Queue handles locking internally, and None is used as a stop signal for the consumer.",
    },
    {
      title: "ThreadPoolExecutor: map, submit and as_completed",
      scenario: "Check the status of several websites (simulated) using a pool of worker threads.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from concurrent.futures import ThreadPoolExecutor, as_completed
import time

SITES = {"google.com": 0.2, "github.com": 0.1, "python.org": 0.3, "bad.site": 0.1}

def check(site):
    time.sleep(SITES[site])
    if site == "bad.site":
        raise ConnectionError(f"{site} unreachable")
    return f"{site}: 200 OK"

ok_sites = ["google.com", "github.com", "python.org"]
start = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as pool:
    for line in pool.map(check, ok_sites):      # results in INPUT order
        print(line)
print(f"Took about {time.perf_counter() - start:.1f}s")

with ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(check, s): s for s in SITES}
    report = {}
    for fut in as_completed(futures):           # finishes in any order
        site = futures[fut]
        try:
            report[site] = fut.result()
        except ConnectionError as e:
            report[site] = f"ERROR {e}"
for site in sorted(report):
    print(report[site])
`,
      python: {
        files: {
          "main.py": `from concurrent.futures import ThreadPoolExecutor, as_completed
import time

SITES = {"google.com": 0.2, "github.com": 0.1, "python.org": 0.3, "bad.site": 0.1}

def check(site):
    time.sleep(SITES[site])
    if site == "bad.site":
        raise ConnectionError(f"{site} unreachable")
    return f"{site}: 200 OK"

ok_sites = ["google.com", "github.com", "python.org"]
start = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as pool:
    for line in pool.map(check, ok_sites):      # results in INPUT order
        print(line)
print(f"Took about {time.perf_counter() - start:.1f}s")

with ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(check, s): s for s in SITES}
    report = {}
    for fut in as_completed(futures):           # finishes in any order
        site = futures[fut]
        try:
            report[site] = fut.result()
        except ConnectionError as e:
            report[site] = f"ERROR {e}"
for site in sorted(report):
    print(report[site])
`,
        },
      },
      result: `google.com: 200 OK
github.com: 200 OK
python.org: 200 OK
Took about 0.3s
ERROR bad.site unreachable
github.com: 200 OK
google.com: 200 OK
python.org: 200 OK`,
      explanation: "pool.map returns results in the same order as the input, even though tasks finish at different times; total time is close to the slowest task (0.3 s). submit() returns Future objects; as_completed yields them as they finish, and fut.result() re-raises any exception from the worker. Sorting before printing keeps the output stable.",
    },
    {
      title: "CPU-bound Work: Multiprocessing vs Threads (run locally)",
      scenario: "Count primes in big ranges. Threads do not help because of the GIL; processes use multiple cores.",
      steps: [
        "Open VS Code or PyCharm and create main.py",
        "Paste the code (keep the if __name__ == '__main__': guard - it is required for multiprocessing on Windows/macOS)",
        "Run it from the terminal with: python main.py",
        "Note: the in-browser runner cannot start real processes, so run this one on your own machine",
      ],
      code: `import time
from multiprocessing import Pool, cpu_count
from concurrent.futures import ThreadPoolExecutor

def count_primes(limit):
    count = 0
    for n in range(2, limit):
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            count += 1
    return count

if __name__ == "__main__":
    jobs = [60_000] * 4

    start = time.perf_counter()
    seq = [count_primes(j) for j in jobs]
    t_seq = time.perf_counter() - start

    start = time.perf_counter()
    with ThreadPoolExecutor(4) as ex:
        thr = list(ex.map(count_primes, jobs))
    t_thr = time.perf_counter() - start

    start = time.perf_counter()
    with Pool(processes=4) as pool:
        proc = pool.map(count_primes, jobs)
    t_proc = time.perf_counter() - start

    print("Results equal:", seq == thr == proc, seq[0])
    print("Threads faster than sequential by 1.5x?", t_seq / t_thr > 1.5)
    print("Processes faster than sequential?", t_proc < t_seq if cpu_count() > 1 else "single core")
`,
      result: `Results equal: True 6057
Threads faster than sequential by 1.5x? False
Processes faster than sequential? True`,
      explanation: "count_primes is pure Python CPU work, so the GIL lets only one thread run it at a time - the thread pool takes roughly as long as the sequential loop. multiprocessing.Pool starts separate processes, each with its own GIL, so on a multi-core machine it finishes much faster. The __main__ guard is mandatory because child processes re-import the module. Exact timings vary by machine; that is why we print comparisons instead of seconds.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a process and a thread?",
      a: "A process is an independent program instance with its own memory space. A thread runs inside a process and shares its memory with other threads; threads are lighter to create and switch.",
      level: "Easy",
    },
    {
      q: "What is the GIL?",
      a: "The Global Interpreter Lock in CPython allows only one thread to execute Python bytecode at a time in a process. It simplifies memory management (reference counting) but limits CPU parallelism with threads.",
      level: "Medium",
    },
    {
      q: "When should you use threading vs multiprocessing?",
      a: "Threading (or asyncio) for I/O-bound tasks like network calls, file and DB access. Multiprocessing for CPU-bound tasks like heavy calculations, because each process has its own GIL.",
      level: "Medium",
    },
    {
      q: "What is a race condition?",
      a: "A bug where the result depends on the timing of threads accessing shared data, e.g. two threads incrementing a counter and losing updates. Fixed with locks or thread-safe structures.",
      level: "Medium",
    },
    {
      q: "What is a deadlock?",
      a: "Two or more threads waiting forever for locks held by each other. Avoid by acquiring locks in a consistent order, using timeouts, or minimising shared locks.",
      level: "Hard",
    },
    {
      q: "What is the difference between start() and run() on a Thread?",
      a: "start() creates a new thread which then calls run(). Calling run() directly just executes the function in the current thread - no concurrency.",
      level: "Medium",
    },
    {
      q: "What does join() do?",
      a: "It blocks the calling thread until the target thread (or process) finishes.",
      level: "Easy",
    },
    {
      q: "Why is if __name__ == '__main__' needed with multiprocessing?",
      a: "On Windows/macOS (spawn start method) child processes import the main module; without the guard they would start new processes recursively.",
      level: "Hard",
    },
    {
      q: "What is a daemon thread?",
      a: "A background thread that does not prevent the program from exiting; it is stopped abruptly when the main thread ends.",
      level: "Medium",
    },
    {
      q: "What is the output order of ThreadPoolExecutor.map?",
      a: "Results are returned in the order of the input iterable, regardless of which task finishes first. Use as_completed to get them in completion order.",
      level: "Medium",
    },
    {
      q: "Does the GIL make Python code thread-safe?",
      a: "No. The GIL protects interpreter internals, but compound operations like x += 1 are several bytecodes and can still be interrupted, so you still need locks.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Start 3 threads that each compute the square of a number and store it in a shared dict; print sorted results.",
      hint: "Thread(target=f, args=(n, results)) then join.",
      solution: `import threading
results = {}
def sq(n): results[n] = n * n
ts = [threading.Thread(target=sq, args=(n,)) for n in (2, 3, 4)]
for t in ts: t.start()
for t in ts: t.join()
print(dict(sorted(results.items())))   # {2: 4, 3: 9, 4: 16}
`,
    },
    {
      task: "Use ThreadPoolExecutor.map to convert a list of words to uppercase with 3 workers.",
      hint: "list(ex.map(str.upper, words))",
      solution: `from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(3) as ex:
    print(list(ex.map(str.upper, ["a", "b", "c"])))
`,
    },
    {
      task: "Protect a shared list append-and-count operation with a Lock across 5 threads adding 1000 items each.",
      hint: "with lock: inside the loop.",
      solution: `import threading
items, lock = [], threading.Lock()
def add():
    for i in range(1000):
        with lock:
            items.append(i)
ts = [threading.Thread(target=add) for _ in range(5)]
[t.start() for t in ts]; [t.join() for t in ts]
print(len(items))   # 5000
`,
    },
    {
      task: "Write a multiprocessing Pool program that returns cubes of 1..5 (run locally).",
      hint: "Use the __main__ guard.",
      solution: `from multiprocessing import Pool
def cube(n): return n ** 3
if __name__ == "__main__":
    with Pool(2) as p:
        print(p.map(cube, range(1, 6)))   # [1, 8, 27, 64, 125]
`,
    },
    {
      task: "Classify each task as I/O-bound or CPU-bound: resizing 1000 images, calling 50 APIs, reading 100 files, training a model in pure Python.",
      hint: "Ask: is it waiting or calculating?",
      solution: `Resizing images      -> CPU-bound -> multiprocessing
Calling 50 APIs      -> I/O-bound -> threading / asyncio
Reading 100 files    -> I/O-bound -> threading
Pure Python training -> CPU-bound -> multiprocessing (or NumPy, which releases the GIL)
`,
    },
  ],
  quiz: [
    {
      question: "The GIL allows how many threads to execute Python bytecode at once in one process?",
      options: [
        "One",
        "Two",
        "Equal to CPU cores",
        "Unlimited",
      ],
      answer: 0,
      explanation: "Only one thread holds the GIL at a time.",
    },
    {
      question: "Best choice for a CPU-heavy pure Python calculation?",
      options: [
        "threading",
        "asyncio",
        "multiprocessing",
        "time.sleep",
      ],
      answer: 2,
      explanation: "Separate processes avoid the single GIL.",
    },
    {
      question: "Which method waits for a thread to finish?",
      options: [
        "wait()",
        "stop()",
        "end()",
        "join()",
      ],
      answer: 3,
      explanation: "join() blocks until the thread ends.",
    },
    {
      question: "Which object prevents two threads from entering a critical section together?",
      options: [
        "threading.Lock",
        "threading.Timer",
        "queue.Empty",
        "threading.local",
      ],
      answer: 0,
      explanation: "A Lock gives mutual exclusion.",
    },
    {
      question: "Which call returns results as tasks finish (not in input order)?",
      options: [
        "executor.map",
        "concurrent.futures.as_completed",
        "Thread.join",
        "Pool.map",
      ],
      answer: 1,
      explanation: "as_completed yields futures as they complete.",
    },
  ],
};
