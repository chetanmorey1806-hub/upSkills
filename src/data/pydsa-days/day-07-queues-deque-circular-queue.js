export default {
  id: "day-07-queues-deque-circular-queue",
  title: "Queues, Deque and Circular Queue",
  module: "Module 2: Linear Data Structures",
  day: 7,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Learn the FIFO queue, why a Python list is a poor queue, how collections.deque gives O(1) operations at both ends, how to build a fixed-size circular queue with an array, and how queues and monotonic deques solve problems like sliding window maximum and BFS-style processing.",
  objectives: [
    "Explain FIFO and the enqueue, dequeue, front and is_empty operations",
    "Use collections.deque correctly and know why list.pop(0) is O(n)",
    "Implement a circular queue using an array with head index and size",
    "Solve sliding window maximum with a monotonic deque in O(n)",
    "Know the queue-related tools in Python: queue.Queue, heapq, deque(maxlen)",
  ],
  theory: [
    {
      heading: "What is a Queue?",
      content: `A queue is a linear data structure that follows **FIFO: First In, First Out**. Think of a ticket counter line at a railway station: the person who joins first is served first. New items join at the **rear** (enqueue) and leave from the **front** (dequeue).

Real uses: printer job queues, task schedulers, message queues (Kafka, RabbitMQ), call-center waiting lines and Breadth-First Search (BFS) in trees and graphs.`,
      points: [
        "enqueue(x): add at the rear -> O(1)",
        "dequeue(): remove from the front -> O(1)",
        "front()/peek(): read the front item -> O(1)",
        "is_empty(), size() -> O(1)",
      ],
    },
    {
      heading: "Why Not Use a List as a Queue?",
      content: "list.append(x) is O(1), but list.pop(0) is O(n) because every remaining element shifts one position left. For a queue with n operations this becomes O(n^2). Python's `collections.deque` (double-ended queue) is implemented as a doubly linked list of fixed-size blocks, so adding and removing at BOTH ends is O(1).",
      syntax: `from collections import deque

q = deque()
q.append("A")        # enqueue at right
q.append("B")
front = q[0]         # peek -> 'A'
q.popleft()          # dequeue -> 'A'
q.appendleft("Z")    # add to the front
q.pop()              # remove from the right
`,
      points: [
        "deque: append, appendleft, pop, popleft -> O(1)",
        "deque[0] and deque[-1] -> O(1); deque[i] in the middle -> O(n)",
        "deque(maxlen=k) automatically drops items from the other end when full",
        "deque.rotate(k) rotates elements; O(k)",
      ],
    },
    {
      heading: "Deque: Double-Ended Queue",
      content: `A deque allows insertion and deletion at both ends, so it can act as a stack, a queue, or both. This makes it perfect for sliding window maximum/minimum (monotonic deque), palindrome checks from both ends, and 0-1 BFS in graphs.

A **monotonic deque** keeps indices whose values are in decreasing (or increasing) order. Remove from the back elements that can never be the answer again, and remove from the front elements that have left the window.`,
    },
    {
      heading: "Circular Queue (Ring Buffer)",
      content: `A circular queue uses a fixed-size array and treats it as if the end wraps around to the beginning. It stores a head index (front) and a count (size). The rear position is computed as (head + size) % capacity. When we dequeue, head moves forward with wrap-around. No elements are ever shifted, so all operations are O(1) and memory is fixed.

Used in CPU scheduling (round-robin), keyboard/network buffers, streaming audio and logging the last N events.`,
      syntax: `rear_index = (head + size) % capacity   # where to enqueue
head = (head + 1) % capacity            # after dequeue
`,
      tip: "Tracking size separately avoids the classic ambiguity where head == tail could mean either 'empty' or 'full'.",
    },
    {
      heading: "Other Queue Types in Python",
      content: "Python has several queue-like tools; choose based on the job.",
      points: [
        "collections.deque: the default for algorithm problems (BFS, sliding windows)",
        "queue.Queue: thread-safe FIFO for producer-consumer programs (has locking overhead)",
        "heapq: priority queue, smallest item first (Day 13)",
        "queue.LifoQueue / queue.PriorityQueue: thread-safe stack and priority queue",
        "asyncio.Queue: for async coroutines",
      ],
    },
    {
      heading: "Complexity Summary",
      content: "deque enqueue/dequeue at either end: O(1). list.pop(0): O(n). Circular queue operations: O(1) time, O(capacity) space. Sliding window maximum with a monotonic deque: O(n) time because each index is added and removed at most once, O(k) space. Queue via two stacks: amortized O(1).",
    },
  ],
  examples: [
    {
      title: "Ticket Counter with deque",
      scenario: "Simulate a railway ticket line where people are served in arrival order.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

line = deque()
for person in ["Asha", "Ravi", "Meena"]:
    line.append(person)
    print("joined:", person, "| line:", list(line))

line.append("Kiran")
while line:
    served = line.popleft()
    print("served:", served, "| waiting:", len(line))
`,
      python: {
        files: {
          "main.py": `from collections import deque

line = deque()
for person in ["Asha", "Ravi", "Meena"]:
    line.append(person)
    print("joined:", person, "| line:", list(line))

line.append("Kiran")
while line:
    served = line.popleft()
    print("served:", served, "| waiting:", len(line))
`,
        },
      },
      result: `joined: Asha | line: ['Asha']
joined: Ravi | line: ['Asha', 'Ravi']
joined: Meena | line: ['Asha', 'Ravi', 'Meena']
served: Asha | waiting: 3
served: Ravi | waiting: 2
served: Meena | waiting: 1
served: Kiran | waiting: 0`,
      explanation: "append adds at the rear and popleft removes from the front, both O(1). The first person to join (Asha) is served first: FIFO.",
    },
    {
      title: "list.pop(0) vs deque.popleft() Timing",
      scenario: "Measure why lists are bad queues by removing 100,000 items from the front.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import time
from collections import deque

n = 100_000
lst = list(range(n))
start = time.perf_counter()
while lst:
    lst.pop(0)
list_time = time.perf_counter() - start

dq = deque(range(n))
start = time.perf_counter()
while dq:
    dq.popleft()
deque_time = time.perf_counter() - start

print("list.pop(0) slower than deque.popleft():", list_time > deque_time)
print("deque is roughly", "10x+" if list_time > 10 * deque_time else "a few times", "faster here")
`,
      python: {
        files: {
          "main.py": `import time
from collections import deque

n = 100_000
lst = list(range(n))
start = time.perf_counter()
while lst:
    lst.pop(0)
list_time = time.perf_counter() - start

dq = deque(range(n))
start = time.perf_counter()
while dq:
    dq.popleft()
deque_time = time.perf_counter() - start

print("list.pop(0) slower than deque.popleft():", list_time > deque_time)
print("deque is roughly", "10x+" if list_time > 10 * deque_time else "a few times", "faster here")
`,
        },
      },
      result: `list.pop(0) slower than deque.popleft(): True
deque is roughly 10x+ faster here`,
      explanation: "Each list.pop(0) shifts all remaining elements, giving O(n^2) total, while each popleft is O(1). Exact timings differ by machine, so the program prints a comparison instead of raw seconds.",
    },
    {
      title: "Circular Queue Implementation",
      scenario: "LeetCode 622: build a fixed-capacity queue backed by an array with wrap-around.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class CircularQueue:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.capacity = capacity
        self.head = 0
        self.size = 0

    def enqueue(self, x):
        if self.size == self.capacity:
            return False
        rear = (self.head + self.size) % self.capacity
        self.data[rear] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return None
        x = self.data[self.head]
        self.data[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return x

    def __repr__(self):
        return f"data={self.data} head={self.head} size={self.size}"

cq = CircularQueue(3)
print(cq.enqueue(10), cq.enqueue(20), cq.enqueue(30), cq.enqueue(40))
print(cq)
print("dequeue:", cq.dequeue())
print(cq.enqueue(40))
print(cq)
print([cq.dequeue() for _ in range(3)])
`,
      python: {
        files: {
          "main.py": `class CircularQueue:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.capacity = capacity
        self.head = 0
        self.size = 0

    def enqueue(self, x):
        if self.size == self.capacity:
            return False
        rear = (self.head + self.size) % self.capacity
        self.data[rear] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return None
        x = self.data[self.head]
        self.data[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return x

    def __repr__(self):
        return f"data={self.data} head={self.head} size={self.size}"

cq = CircularQueue(3)
print(cq.enqueue(10), cq.enqueue(20), cq.enqueue(30), cq.enqueue(40))
print(cq)
print("dequeue:", cq.dequeue())
print(cq.enqueue(40))
print(cq)
print([cq.dequeue() for _ in range(3)])
`,
        },
      },
      result: `True True True False
data=[10, 20, 30] head=0 size=3
dequeue: 10
True
data=[40, 20, 30] head=1 size=3
[20, 30, 40]`,
      explanation: "The fourth enqueue fails because the queue is full. After one dequeue, head moves to index 1 and the new item 40 wraps around into index 0. Items still come out in FIFO order: 20, 30, 40. Every operation is O(1).",
    },
    {
      title: "Sliding Window Maximum (Monotonic Deque)",
      scenario: "LeetCode 239 (Hard): for every window of size k, report the maximum value.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()                 # indices, values decreasing
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()             # smaller values can never be max again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()         # front index left the window
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
print(max_sliding_window([9, 11], 2))
`,
      python: {
        files: {
          "main.py": `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()                 # indices, values decreasing
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()             # smaller values can never be max again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()         # front index left the window
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
print(max_sliding_window([9, 11], 2))
`,
        },
      },
      result: `[3, 3, 5, 5, 6, 7]
[11]`,
      explanation: "The deque front always holds the index of the current window's maximum. New larger values remove smaller ones from the back, and expired indices are removed from the front. Each index enters and leaves once: O(n) time, O(k) space. A naive solution is O(n * k).",
    },
    {
      title: "Last N Events with deque(maxlen) and Round-Robin",
      scenario: "Keep only the 3 most recent log messages, and schedule tasks in round-robin order with a time slice.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

recent = deque(maxlen=3)
for msg in ["login", "view", "add_cart", "pay", "logout"]:
    recent.append(msg)
print("recent logs:", list(recent))

# Round-robin CPU scheduling with time slice 2
tasks = deque([("P1", 5), ("P2", 2), ("P3", 3)])
order = []
while tasks:
    name, remaining = tasks.popleft()
    run = min(2, remaining)
    order.append(f"{name}:{run}")
    if remaining - run > 0:
        tasks.append((name, remaining - run))
print(" -> ".join(order))
`,
      python: {
        files: {
          "main.py": `from collections import deque

recent = deque(maxlen=3)
for msg in ["login", "view", "add_cart", "pay", "logout"]:
    recent.append(msg)
print("recent logs:", list(recent))

# Round-robin CPU scheduling with time slice 2
tasks = deque([("P1", 5), ("P2", 2), ("P3", 3)])
order = []
while tasks:
    name, remaining = tasks.popleft()
    run = min(2, remaining)
    order.append(f"{name}:{run}")
    if remaining - run > 0:
        tasks.append((name, remaining - run))
print(" -> ".join(order))
`,
        },
      },
      result: `recent logs: ['add_cart', 'pay', 'logout']
P1:2 -> P2:2 -> P3:2 -> P1:2 -> P3:1 -> P1:1`,
      explanation: "With maxlen=3, appending a fourth item drops the oldest automatically. In round-robin, an unfinished task goes back to the rear of the queue, which is exactly how operating systems share CPU time fairly.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a stack and a queue?",
      a: "A stack is LIFO: insert and remove at the same end (top). A queue is FIFO: insert at the rear, remove from the front. Stacks suit undo, recursion and DFS; queues suit scheduling, buffering and BFS.",
      level: "Easy",
    },
    {
      q: "Why should you not use a Python list as a queue?",
      a: "Removing from the front with list.pop(0) is O(n) because all other elements shift left. A sequence of n dequeues becomes O(n^2). collections.deque.popleft() is O(1).",
      level: "Easy",
    },
    {
      q: "How is collections.deque implemented?",
      a: "In CPython it is a doubly linked list of fixed-size blocks (arrays of 64 slots). This gives O(1) append/pop at both ends without shifting, while keeping memory overhead low. Random access in the middle is O(n).",
      level: "Medium",
    },
    {
      q: "What is a circular queue and why is it useful?",
      a: "A fixed-size array-based queue whose indices wrap around using modulo arithmetic. It reuses freed slots at the front without shifting elements, giving O(1) operations with bounded memory. Used for buffers, streaming and round-robin scheduling.",
      level: "Easy",
    },
    {
      q: "In a circular queue, how do you distinguish between full and empty?",
      a: "If you only keep head and tail, head == tail is ambiguous. Solutions: keep a separate size counter (empty when size == 0, full when size == capacity), or always leave one slot empty (full when (tail + 1) % capacity == head).",
      level: "Medium",
    },
    {
      q: "What is a deque and when do you need one?",
      a: "A double-ended queue allows O(1) insertions and deletions at both ends. Use it for BFS queues, sliding window max/min, palindrome checking, implementing both stacks and queues, and 0-1 BFS.",
      level: "Easy",
    },
    {
      q: "Explain the sliding window maximum algorithm.",
      a: "Maintain a deque of indices whose values are decreasing. For each new index i: pop from the back while the back value <= nums[i]; push i; pop from the front if it is outside the window (index <= i - k); once i >= k - 1, nums[dq[0]] is the window max. Each index is pushed/popped once: O(n).",
      level: "Hard",
    },
    {
      q: "What is the difference between queue.Queue and collections.deque?",
      a: "queue.Queue is designed for multi-threaded producer-consumer code: it is thread-safe with locks and supports blocking get()/put() with timeouts. deque is faster for single-threaded algorithms. Individual deque append/popleft are also atomic in CPython, but deque has no blocking API.",
      level: "Medium",
    },
    {
      q: "How do you implement a stack using queues (LeetCode 225)?",
      a: "With one deque: on push, append the new item and then rotate the previous n - 1 items behind it (popleft and append them), so the newest item is at the front. Pop is then popleft. Push is O(n), pop O(1).",
      level: "Medium",
    },
    {
      q: "What does deque(maxlen=3) do when you append a fourth element?",
      a: "It automatically discards an item from the opposite end. append() on the right removes the leftmost (oldest) item; appendleft() removes the rightmost. This is useful for keeping the last N items.",
      level: "Easy",
    },
    {
      q: "What is a priority queue and how is it different from a normal queue?",
      a: "In a priority queue, items are removed by priority (e.g. smallest first), not arrival order. It is usually implemented with a binary heap (heapq in Python), giving O(log n) push and pop. A normal queue removes strictly by arrival order in O(1).",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Number of Recent Calls (LeetCode 933): ping(t) returns the number of pings in the range [t - 3000, t]. Pings arrive with increasing t.",
      hint: "Keep a deque of timestamps; pop from the left while older than t - 3000.",
      solution: `from collections import deque

class RecentCounter:
    # Amortized O(1) per ping, Space O(W) for pings in the window
    def __init__(self):
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)

rc = RecentCounter()
print([rc.ping(t) for t in [1, 100, 3001, 3002]])  # [1, 2, 3, 3]
`,
    },
    {
      task: "Design Circular Deque (LeetCode 641): support insertFront, insertLast, deleteFront, deleteLast, getFront, getRear, isEmpty, isFull with a fixed array.",
      hint: "Track head and size. Front insert moves head back: head = (head - 1) % k.",
      solution: `class CircularDeque:
    # All operations O(1), Space O(k)
    def __init__(self, k):
        self.data = [0] * k
        self.k, self.head, self.size = k, 0, 0

    def insert_front(self, v):
        if self.size == self.k:
            return False
        self.head = (self.head - 1) % self.k
        self.data[self.head] = v
        self.size += 1
        return True

    def insert_last(self, v):
        if self.size == self.k:
            return False
        self.data[(self.head + self.size) % self.k] = v
        self.size += 1
        return True

    def delete_front(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.size -= 1
        return True

    def delete_last(self):
        if self.size == 0:
            return False
        self.size -= 1
        return True

    def get_front(self):
        return -1 if self.size == 0 else self.data[self.head]

    def get_rear(self):
        return -1 if self.size == 0 else self.data[(self.head + self.size - 1) % self.k]

d = CircularDeque(3)
print(d.insert_last(1), d.insert_last(2), d.insert_front(3), d.insert_front(4))
print(d.get_rear(), d.delete_last(), d.insert_front(4), d.get_front())
`,
    },
    {
      task: "Implement Stack using Queues (LeetCode 225) with push, pop, top and empty.",
      hint: "After appending, rotate the older items behind the new one.",
      solution: `from collections import deque

class MyStack:
    # push O(n), pop/top O(1)
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return not self.q

s = MyStack()
s.push(1); s.push(2); s.push(3)
print(s.top(), s.pop(), s.pop(), s.empty())  # 3 3 2 False
`,
    },
    {
      task: "Dota2 Senate (LeetCode 649): 'R' and 'D' senators ban each other in rounds. Return 'Radiant' or 'Dire'. 'RD' -> 'Radiant', 'RDD' -> 'Dire'.",
      hint: "Two queues of indices. The smaller index bans the other and re-enters with index + n.",
      solution: `from collections import deque

def predict_party_victory(senate):
    # Time O(n), Space O(n)
    n = len(senate)
    r = deque(i for i, c in enumerate(senate) if c == "R")
    d = deque(i for i, c in enumerate(senate) if c == "D")
    while r and d:
        ri, di = r.popleft(), d.popleft()
        if ri < di:
            r.append(ri + n)
        else:
            d.append(di + n)
    return "Radiant" if r else "Dire"

print(predict_party_victory("RD"))   # Radiant
print(predict_party_victory("RDD"))  # Dire
`,
    },
    {
      task: "First Negative in Every Window of Size k: [12,-1,-7,8,-15,30,16,28], k=3 -> [-1,-1,-7,-15,-15,0].",
      hint: "Deque of indices of negative numbers; drop indices that left the window.",
      solution: `from collections import deque

def first_negative(nums, k):
    # Time O(n), Space O(k)
    dq = deque()
    result = []
    for i, x in enumerate(nums):
        if x < 0:
            dq.append(i)
        if dq and dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            result.append(nums[dq[0]] if dq else 0)
    return result

print(first_negative([12, -1, -7, 8, -15, 30, 16, 28], 3))
`,
    },
  ],
  quiz: [
    {
      question: "A queue follows which order?",
      options: [
        "LIFO",
        "FIFO",
        "Sorted order",
        "Random",
      ],
      answer: 1,
      explanation: "First In, First Out.",
    },
    {
      question: "Time complexity of list.pop(0) on a list of n items?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)",
      ],
      answer: 2,
      explanation: "All remaining elements shift left.",
    },
    {
      question: "Which call removes from the front of a deque?",
      options: [
        "pop()",
        "popleft()",
        "remove()",
        "dequeue()",
      ],
      answer: 1,
      explanation: "popleft() removes the leftmost element in O(1).",
    },
    {
      question: "Circular queue with capacity 5, head = 3, size = 4. Where does the next enqueue go?",
      options: [
        "Index 7",
        "Index 2",
        "Index 4",
        "Queue is full",
      ],
      answer: 1,
      explanation: "(3 + 4) % 5 = 2.",
    },
    {
      question: "What does deque(maxlen=2) contain after appending 1, 2, 3?",
      options: [
        "[1, 2]",
        "[2, 3]",
        "[1, 2, 3]",
        "Error",
      ],
      answer: 1,
      explanation: "The oldest item (1) is dropped automatically.",
    },
    {
      question: "Sliding window maximum with a monotonic deque runs in:",
      options: [
        "O(n * k)",
        "O(n log k)",
        "O(n)",
        "O(k)",
      ],
      answer: 2,
      explanation: "Each index is pushed and popped at most once.",
    },
  ],
};
