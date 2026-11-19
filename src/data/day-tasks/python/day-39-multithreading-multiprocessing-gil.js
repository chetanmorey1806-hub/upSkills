export default {
  lesson: 'day-39-multithreading-multiprocessing-gil',
  minutes: 25,
  intro: 'Understand processes, threads and the GIL, protect shared data with a Lock, and pick threading, multiprocessing or asyncio for a job.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does the **GIL** (Global Interpreter Lock) in CPython mean?',
      options: [
        'Only one process can run Python on a computer',
        'Only one thread executes Python bytecode at a time inside one process',
        'Threads cannot do any I/O',
        'Python code cannot use more than 1 GB of memory',
      ],
      answer: 1,
      explain: 'Inside one CPython process, the GIL lets only one thread run Python bytecode at a time. Threads still help for **I/O-bound** work (the GIL is released while waiting for network/disk), but CPU-heavy work needs **multiprocessing** (separate processes, each with its own GIL).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which pairings of task → tool are good choices? (select all that apply)',
      options: [
        'Downloading 50 web pages → threads (ThreadPoolExecutor) or asyncio',
        'Resizing 10,000 images using pure Python maths → multiprocessing (ProcessPoolExecutor)',
        'Calculating primes up to 10 million in pure Python → many threads for a big speed-up',
        'Thousands of concurrent socket connections → asyncio',
      ],
      answers: [0, 1, 3],
      explain: 'I/O-bound → threads or asyncio (asyncio scales best to thousands of connections). CPU-bound pure Python → processes, because threads are limited by the GIL and give little or no speed-up for the primes job.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import threading
from concurrent.futures import ThreadPoolExecutor

results = []
def work(name):
    results.append(name.upper())

t = threading.Thread(target=work, args=("asha",))
t.start()
t.join()
print(results)

with ThreadPoolExecutor(max_workers=3) as ex:
    print(list(ex.map(lambda n: n * n, [1, 2, 3, 4])))`,
      expected: "['ASHA']\n[1, 4, 9, 16]",
      explain: '`args` must be a **tuple** (note the comma in `("asha",)`). `join()` waits for the thread to finish, so the result is ready before printing. `executor.map` returns results in the **input order**, even if the threads finish in a different order.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'After `t.start()`, which method makes the main program **wait** until thread `t` has finished?',
      accept: ['join', 'join()', 't.join()', 't.join'],
      explain: '`t.join()` blocks until the thread ends. Forgetting it means the main code may read results before the thread has produced them.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Race-condition fix. `count += 1` is not atomic, so two threads can lose updates. Create `SafeCounter` with:\n- `self.value = 0` and `self.lock = threading.Lock()`\n- `increment()` that adds 1 **while holding the lock** (use `with self.lock:`)\n- `add_many(n)` that calls increment n times',
      example: { title: 'protecting shared data', code: 'import threading\nbalance = 0\nlock = threading.Lock()\n\ndef deposit(x):\n    global balance\n    with lock:            # acquire ... release automatically\n        balance += x' },
      starter: `import threading

class SafeCounter:
    def __init__(self):
        self.value = 0
        # TODO: create a lock

    def increment(self):
        self.value += 1   # TODO: protect with the lock

    def add_many(self, n):
        pass  # TODO
`,
      solution: `import threading

class SafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def increment(self):
        with self.lock:
            self.value += 1

    def add_many(self, n):
        for _ in range(n):
            self.increment()
`,
      tests: [
        { call: '(lambda c: (c.add_many(1000), c.increment(), c.value)[2])(SafeCounter())', expect: 1001 },
        { call: 'isinstance(SafeCounter().lock, type(threading.Lock()))', expect: true, msg: 'self.lock must be a threading.Lock()' },
        { call: `exec("_c = SafeCounter()\\n_c.lock.acquire()\\n_seen = []\\n_orig = _c.lock\\nclass _Spy:\\n    def __enter__(s):\\n        _seen.append('enter')\\n    def __exit__(s, *a):\\n        _seen.append('exit')\\n_c.lock.release()\\n_c.lock = _Spy()\\n_c.increment()") or _seen`, expect: ['enter', 'exit'], msg: 'increment() must use `with self.lock:`' },
      ],
      explain: 'A Lock lets only one thread at a time run the protected block, so read-add-write happens as one step. `with self.lock:` releases the lock even if an error occurs; a manual `acquire()` without `release()` would deadlock the next thread.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Before handing work to a pool of workers you often split it into chunks. Write `split_work(items, workers)` that distributes items **round-robin** into `workers` lists.\n\n`split_work([1, 2, 3, 4, 5, 6, 7], 3)` → `[[1, 4, 7], [2, 5], [3, 6]]`',
      example: { title: 'round-robin with modulo', code: 'for i, item in enumerate("abcde"):\n    print(item, "→ worker", i % 2)' },
      starter: `def split_work(items, workers):
    return []  # TODO
`,
      solution: `def split_work(items, workers):
    chunks = [[] for _ in range(workers)]
    for i, item in enumerate(items):
        chunks[i % workers].append(item)
    return chunks
`,
      tests: [
        { call: 'split_work([1, 2, 3, 4, 5, 6, 7], 3)', expect: [[1, 4, 7], [2, 5], [3, 6]] },
        { call: 'split_work(["a", "b"], 4)', expect: [['a'], ['b'], [], []] },
      ],
      explain: '`i % workers` cycles 0, 1, 2, 0, 1, 2... so the load stays balanced. Create the inner lists with a comprehension: `[[]] * workers` would put the **same** list in every slot (aliasing), and every item would land in all of them.',
    },
  ],
};
