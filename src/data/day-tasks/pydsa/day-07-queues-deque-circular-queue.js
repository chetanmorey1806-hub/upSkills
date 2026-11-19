export default {
  lesson: 'day-07-queues-deque-circular-queue',
  minutes: 35,
  intro: 'Use queues (FIFO) correctly: collections.deque, a fixed-size circular queue, round-robin simulation and the sliding-window maximum with a monotonic deque.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which is the right way to build a FIFO queue in Python?',
      options: ['`list` with `append()` and `pop(0)`', '`collections.deque` with `append()` and `popleft()`', '`set` with `add()` and `pop()`', '`dict` with `popitem()`'],
      answer: 1,
      explain: '`deque` supports O(1) adds and removes at both ends. `list.pop(0)` is O(n) because all remaining items shift left. A set has no order at all, and `dict.popitem()` removes the LAST item (LIFO).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: ['`queue.Queue` is thread-safe and used between producer and consumer threads', '`heapq` gives a priority queue (smallest first)', '`deque(maxlen=3)` automatically drops the oldest items when full', 'A queue removes the most recently added item first', 'BFS (breadth-first search) uses a queue'],
      answers: [0, 1, 2, 4],
      explain: 'A queue is **FIFO**: the oldest item leaves first (a stack is LIFO). `queue.Queue` adds locking for threads, `heapq` orders by priority and `deque(maxlen=n)` keeps only the last n items. BFS explores level by level with a queue.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from collections import deque
q = deque(["Asha", "Ravi"])
q.append("Om")
q.appendleft("VIP")
print(q.popleft(), q.pop())
q.rotate(-1)
print(list(q))`,
      expected: "VIP Om\n['Ravi', 'Asha']",
      explain: '`appendleft` puts "VIP" at the front, so `popleft` returns it; `pop` removes from the right ("Om"). `rotate(-1)` moves the first item to the end: [Asha, Ravi] becomes [Ravi, Asha].',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Circular queue.** Implement `CircularQueue(k)` with a fixed list of size k, a `head` index and a `size` count:\n- `enqueue(x)` → True, or False if full\n- `dequeue()` → removed value, or None if empty\n- `front()` / `rear()` → value or None\n- `is_full()`, `is_empty()`\nUse `% k` to wrap around; do NOT use list.pop(0) or deque.',
      example: { title: 'wrap-around index', code: 'tail = (head + size) % k   # next free slot\nhead = (head + 1) % k       # after a dequeue' },
      starter: 'class CircularQueue:\n    def __init__(self, k):\n        self.data = [None] * k\n        self.k = k\n        self.head = 0\n        self.size = 0\n    # TODO: enqueue, dequeue, front, rear, is_full, is_empty\n',
      solution: 'class CircularQueue:\n    def __init__(self, k):\n        self.data = [None] * k\n        self.k = k\n        self.head = 0\n        self.size = 0\n    def is_empty(self):\n        return self.size == 0\n    def is_full(self):\n        return self.size == self.k\n    def enqueue(self, x):\n        if self.is_full():\n            return False\n        self.data[(self.head + self.size) % self.k] = x\n        self.size += 1\n        return True\n    def dequeue(self):\n        if self.is_empty():\n            return None\n        x = self.data[self.head]\n        self.head = (self.head + 1) % self.k\n        self.size -= 1\n        return x\n    def front(self):\n        return None if self.is_empty() else self.data[self.head]\n    def rear(self):\n        return None if self.is_empty() else self.data[(self.head + self.size - 1) % self.k]\n',
      tests: [
        { call: '(lambda q: [q.enqueue(1), q.enqueue(2), q.enqueue(3), q.enqueue(4), q.rear(), q.is_full()])(CircularQueue(3))', expect: [true, true, true, false, 3, true] },
        { call: '(lambda q: [q.enqueue(1), q.enqueue(2), q.enqueue(3), q.dequeue(), q.enqueue(4), q.front(), q.rear()])(CircularQueue(3))', expect: [true, true, true, 1, true, 2, 4], msg: 'The free slot at the start must be reused (wrap around)' },
        { call: '(lambda q: [q.dequeue(), q.front(), q.rear(), q.is_empty()])(CircularQueue(2))', expect: [null, null, null, true] },
        { call: '(lambda q: [q.enqueue(7), q.dequeue(), q.dequeue(), q.enqueue(8), q.front()])(CircularQueue(1))', expect: [true, 7, null, true, 8] },
      ],
      explain: 'Keeping `size` separately avoids the classic "is head == tail empty or full?" ambiguity. The tail is computed as `(head + size) % k`, and the rear item is one before it. All operations are O(1) and memory stays fixed, which is why ring buffers are used for logs and streaming data.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Round-robin scheduler.** Each job is `(name, time_needed)`. The CPU gives each job at most `quantum` units, then moves it to the back of the queue if unfinished. Write `finish_order(jobs, quantum)` that returns the job names in the order they finish. Use a deque.',
      example: { title: 'requeue at the back', code: 'name, left = q.popleft()\nif left > quantum:\n    q.append((name, left - quantum))' },
      starter: 'from collections import deque\n\ndef finish_order(jobs, quantum):\n    # TODO\n    return []\n',
      solution: 'from collections import deque\n\ndef finish_order(jobs, quantum):\n    q = deque(jobs)\n    done = []\n    while q:\n        name, left = q.popleft()\n        if left > quantum:\n            q.append((name, left - quantum))\n        else:\n            done.append(name)\n    return done\n',
      tests: [
        { call: 'finish_order([("A", 5), ("B", 2), ("C", 3)], 2)', expect: ['B', 'C', 'A'] },
        { call: 'finish_order([("A", 1), ("B", 1)], 3)', expect: ['A', 'B'] },
        { call: 'finish_order([("X", 6), ("Y", 4)], 2)', expect: ['Y', 'X'] },
        { call: 'finish_order([], 2)', expect: [] },
      ],
      explain: 'A job that needs exactly the quantum finishes in that turn (`left > quantum` decides requeueing). The queue guarantees fairness: every waiting job gets a turn before anyone gets a second one.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Sliding window maximum.** Write `window_max(nums, k)` that returns the maximum of every window of size k, in **O(n)**. Keep a deque of INDEXES whose values are in decreasing order; drop indexes that left the window from the front.',
      example: { title: 'monotonic deque steps', code: '# 1. pop from the back while the back value <= new value\n# 2. append the new index\n# 3. pop from the front if that index is outside the window\n# 4. once i >= k - 1, the front is the maximum' },
      starter: 'from collections import deque\n\ndef window_max(nums, k):\n    # TODO\n    return []\n',
      solution: 'from collections import deque\n\ndef window_max(nums, k):\n    dq = deque()\n    out = []\n    for i, x in enumerate(nums):\n        while dq and nums[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out\n',
      tests: [
        { call: 'window_max([1, 3, -1, -3, 5, 3, 6, 7], 3)', expect: [3, 3, 5, 5, 6, 7] },
        { call: 'window_max([9, 8, 7, 6], 2)', expect: [9, 8, 7] },
        { call: 'window_max([4], 1)', expect: [4] },
        { call: 'window_max([1, 2, 3], 3)', expect: [3] },
        { call: 'window_max([2, 2, 2], 2)', expect: [2, 2] },
      ],
      explain: 'A smaller value behind a bigger, newer value can never be a maximum again, so it is removed. The front is always the maximum of the current window. Each index enters and leaves the deque once: O(n), compared with O(n·k) for `max()` on every window.',
    },
  ],
};
