export default {
  id: "day-06-stacks",
  title: "Stacks: Balanced Brackets, Next Greater Element and Min Stack",
  module: "Module 2: Linear Data Structures",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Learn the LIFO stack data structure, implement it with a Python list, and use it to solve classic interview problems: balanced brackets, expression evaluation, monotonic stack problems like next greater element and daily temperatures, and the O(1) min stack design question.",
  objectives: [
    "Explain LIFO and implement push, pop, peek and is_empty in O(1)",
    "Choose between list, collections.deque and a custom Stack class",
    "Validate brackets and evaluate postfix (Reverse Polish) expressions",
    "Use a monotonic stack for next greater element and daily temperatures in O(n)",
    "Design a Min Stack with O(1) getMin",
  ],
  theory: [
    {
      heading: "What is a Stack?",
      content: `A stack is a linear data structure that follows **LIFO: Last In, First Out**. Think of a pile of plates in a canteen: you put a plate on top and you take the top plate first. You can only access the top element.

Real uses: the undo button in editors, browser back button, the function call stack, and checking matching brackets in compilers.`,
      points: [
        "push(x): add x on top -> O(1)",
        "pop(): remove and return the top -> O(1)",
        "peek()/top(): read the top without removing -> O(1)",
        "is_empty() and size() -> O(1)",
      ],
    },
    {
      heading: "Implementing a Stack in Python",
      content: "A Python list is a great stack because append() and pop() work at the END of the list in O(1) (amortized for append). Never use insert(0, x) / pop(0) for a stack, those are O(n). collections.deque also works with append/pop and has guaranteed O(1) without occasional resizing copies.",
      syntax: `stack = []
stack.append(10)      # push
stack.append(20)
top = stack[-1]       # peek -> 20
stack.pop()           # pop  -> 20
is_empty = not stack  # True/False
`,
      tip: "Calling pop() or stack[-1] on an empty list raises IndexError. Always check `if stack:` first.",
    },
    {
      heading: "Balanced Brackets Pattern",
      content: "To check if brackets like '({[]})' are balanced, push every opening bracket. When you see a closing bracket, the top of the stack must be its matching opening bracket; pop it. At the end the stack must be empty. The stack works because the most recently opened bracket must be closed first, which is exactly LIFO.",
      points: [
        "Closing bracket with an empty stack -> invalid",
        "Closing bracket that does not match the top -> invalid",
        "Non-empty stack at the end -> some brackets were never closed",
        "Time O(n), space O(n)",
      ],
    },
    {
      heading: "Monotonic Stack",
      content: `A monotonic stack keeps its elements in increasing or decreasing order. When a new element breaks the order, we pop elements, and at the moment of popping we have found an answer for them.

For **next greater element**, keep a decreasing stack of indices. When the current value is bigger than the value at the top, the current value is the next greater element for that top index. Pop and record. Each index is pushed once and popped at most once, so the total is O(n) even though there is a while loop inside the for loop.`,
      syntax: `result = [-1] * n
stack = []                       # indices, values decreasing
for i in range(n):
    while stack and nums[i] > nums[stack[-1]]:
        result[stack.pop()] = nums[i]
    stack.append(i)
`,
      points: [
        "Next greater / next warmer day: decreasing stack",
        "Next smaller element: increasing stack",
        "Largest rectangle in histogram, stock span, trapping rain water: monotonic stack variants",
      ],
    },
    {
      heading: "Expression Evaluation",
      content: "In **postfix** (Reverse Polish) notation, operators come after operands: '3 4 + 2 *' means (3 + 4) * 2. Evaluate it by pushing numbers; when you see an operator, pop two operands (right operand first), apply the operator and push the result. Converting normal infix expressions to postfix uses a stack of operators (Shunting Yard algorithm).",
      tip: "Careful with order: b = pop(), a = pop(), then compute a - b or a / b. For LeetCode 150, division truncates toward zero, so use int(a / b), not a // b.",
    },
    {
      heading: "Min Stack Design and Complexity",
      content: `Design a stack that supports push, pop, top and get_min, all in O(1). The trick: store, along with each value, the minimum of the stack at that moment, either as (value, current_min) pairs or in a second 'min stack'. When you pop, the previous minimum is automatically restored.

Summary: all stack operations are O(1); the extra min tracking costs O(n) additional space in the worst case.`,
    },
  ],
  examples: [
    {
      title: "Stack Class with a Python List",
      scenario: "Build a reusable Stack class and simulate a browser's back button.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Stack:
    def __init__(self):
        self._items = []

    def push(self, x):
        self._items.append(x)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        return self._items[-1] if self._items else None

    def is_empty(self):
        return not self._items

    def __len__(self):
        return len(self._items)

history = Stack()
for page in ["home", "courses", "python-dsa", "day-6"]:
    history.push(page)
print("current:", history.peek(), "| size:", len(history))
print("back ->", history.pop())
print("back ->", history.pop())
print("now on:", history.peek())
`,
      python: {
        files: {
          "main.py": `class Stack:
    def __init__(self):
        self._items = []

    def push(self, x):
        self._items.append(x)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        return self._items[-1] if self._items else None

    def is_empty(self):
        return not self._items

    def __len__(self):
        return len(self._items)

history = Stack()
for page in ["home", "courses", "python-dsa", "day-6"]:
    history.push(page)
print("current:", history.peek(), "| size:", len(history))
print("back ->", history.pop())
print("back ->", history.pop())
print("now on:", history.peek())
`,
        },
      },
      result: `current: day-6 | size: 4
back -> day-6
back -> python-dsa
now on: courses`,
      explanation: "Visiting a page pushes it; pressing back pops the latest page. All operations work at the end of the list and are O(1).",
    },
    {
      title: "Valid Parentheses",
      scenario: "LeetCode 20: check whether brackets in a string are properly opened and closed.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                       # closing bracket
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:                                 # opening bracket
            stack.append(ch)
    return not stack

for test in ["()[]{}", "({[]})", "(]", "([)]", "((", ""]:
    print(f"{test!r:10} -> {is_valid(test)}")
`,
      python: {
        files: {
          "main.py": `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                       # closing bracket
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:                                 # opening bracket
            stack.append(ch)
    return not stack

for test in ["()[]{}", "({[]})", "(]", "([)]", "((", ""]:
    print(f"{test!r:10} -> {is_valid(test)}")
`,
        },
      },
      result: `'()[]{}'   -> True
'({[]})'   -> True
'(]'       -> False
'([)]'     -> False
'(('       -> False
''         -> True`,
      explanation: "Each opening bracket waits on the stack until its closing partner arrives. '([)]' fails because ')' arrives while '[' is on top. '((' fails because the stack is not empty at the end. O(n) time, O(n) space.",
    },
    {
      title: "Next Greater Element with a Monotonic Stack",
      scenario: "For each day's share price, find the next day's price that is higher (or -1).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def next_greater(nums):
    n = len(nums)
    result = [-1] * n
    stack = []                     # indices with decreasing values
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            j = stack.pop()
            result[j] = nums[i]
        stack.append(i)
    return result

prices = [4, 5, 2, 10, 8]
print(next_greater(prices))
print(next_greater([13, 7, 6, 12]))
`,
      python: {
        files: {
          "main.py": `def next_greater(nums):
    n = len(nums)
    result = [-1] * n
    stack = []                     # indices with decreasing values
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            j = stack.pop()
            result[j] = nums[i]
        stack.append(i)
    return result

prices = [4, 5, 2, 10, 8]
print(next_greater(prices))
print(next_greater([13, 7, 6, 12]))
`,
        },
      },
      result: `[5, 10, 10, -1, -1]
[-1, 12, 12, -1]`,
      explanation: "Indices wait on the stack until a bigger value arrives. Values still on the stack at the end have no greater element, so they keep -1. Each index is pushed and popped at most once: O(n) time, O(n) space.",
    },
    {
      title: "Evaluate Reverse Polish Notation",
      scenario: "LeetCode 150: evaluate an expression written in postfix form.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in {"+", "-", "*", "/"}:
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))   # truncate toward zero
        else:
            stack.append(int(t))
    return stack[0]

print(eval_rpn(["2", "1", "+", "3", "*"]))
print(eval_rpn(["4", "13", "5", "/", "+"]))
print(eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
print("-7 // 2 =", -7 // 2, "| int(-7 / 2) =", int(-7 / 2))
`,
      python: {
        files: {
          "main.py": `def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in {"+", "-", "*", "/"}:
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))   # truncate toward zero
        else:
            stack.append(int(t))
    return stack[0]

print(eval_rpn(["2", "1", "+", "3", "*"]))
print(eval_rpn(["4", "13", "5", "/", "+"]))
print(eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
print("-7 // 2 =", -7 // 2, "| int(-7 / 2) =", int(-7 / 2))
`,
        },
      },
      result: `9
6
22
-7 // 2 = -4 | int(-7 / 2) = -3`,
      explanation: "Numbers are pushed; each operator pops its two operands (right first) and pushes the result. The last line shows why int(a / b) is used: // floors toward negative infinity, but the problem wants truncation toward zero.",
    },
    {
      title: "Min Stack with O(1) get_min",
      scenario: "LeetCode 155: design a stack that returns its minimum element in constant time.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class MinStack:
    def __init__(self):
        self.stack = []            # (value, min_so_far)

    def push(self, val):
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]

ms = MinStack()
for v in [5, 3, 7, 2, 8]:
    ms.push(v)
    print(f"push {v}: min={ms.get_min()}")
ms.pop(); ms.pop()
print("after 2 pops: top =", ms.top(), "min =", ms.get_min())
`,
      python: {
        files: {
          "main.py": `class MinStack:
    def __init__(self):
        self.stack = []            # (value, min_so_far)

    def push(self, val):
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]

ms = MinStack()
for v in [5, 3, 7, 2, 8]:
    ms.push(v)
    print(f"push {v}: min={ms.get_min()}")
ms.pop(); ms.pop()
print("after 2 pops: top =", ms.top(), "min =", ms.get_min())
`,
        },
      },
      result: `push 5: min=5
push 3: min=3
push 7: min=3
push 2: min=2
push 8: min=2
after 2 pops: top = 7 min = 3`,
      explanation: "Every entry remembers the minimum at the time it was pushed. After popping 8 and 2, the top entry (7, 3) tells us the minimum is 3 again. All operations are O(1); the extra space is O(n).",
    },
  ],
  interview: [
    {
      q: "What is a stack and what is LIFO?",
      a: "A stack is a linear data structure where insertion (push) and removal (pop) happen only at one end, the top. LIFO means Last In, First Out: the most recently added element is removed first.",
      level: "Easy",
    },
    {
      q: "How do you implement a stack in Python and what are the complexities?",
      a: "Use a list with append() for push, pop() for pop and lst[-1] for peek. All are O(1) (append is amortized O(1)). collections.deque with append/pop also works. Avoid insert(0)/pop(0), which are O(n).",
      level: "Easy",
    },
    {
      q: "Give real-world applications of stacks.",
      a: "Undo/redo, browser back/forward, the function call stack and recursion, expression evaluation and syntax parsing in compilers, bracket matching, DFS traversal, and backtracking.",
      level: "Easy",
    },
    {
      q: "Explain how to check balanced parentheses and its complexity.",
      a: "Scan the string; push opening brackets; on a closing bracket, check the stack is non-empty and its top is the matching opener, then pop. At the end the stack must be empty. O(n) time, O(n) space in the worst case (all opening brackets).",
      level: "Easy",
    },
    {
      q: "What is a monotonic stack? Give an example problem.",
      a: "A stack whose elements are kept in increasing or decreasing order by popping elements that violate the order before pushing. Example: Next Greater Element / Daily Temperatures, where a decreasing stack of indices lets each element find its next larger element in O(n) total.",
      level: "Medium",
    },
    {
      q: "The monotonic stack solution has a while loop inside a for loop. Why is it O(n)?",
      a: "Every index is pushed exactly once and popped at most once. So the total number of pops across the entire run is at most n, making the combined work of all while-loop iterations O(n). Total O(n).",
      level: "Medium",
    },
    {
      q: "How do you design a stack with O(1) getMin?",
      a: "Store pairs (value, min_so_far) or maintain an auxiliary stack of minimums. On push, the new min is min(val, previous min). On pop, the previous minimum becomes visible again automatically. All operations O(1), extra space O(n).",
      level: "Medium",
    },
    {
      q: "How would you implement a queue using two stacks?",
      a: "Use an in_stack for enqueue and an out_stack for dequeue. On dequeue, if out_stack is empty, move all elements from in_stack to out_stack (reversing their order), then pop from out_stack. Each element moves at most once, so operations are amortized O(1).",
      level: "Medium",
    },
    {
      q: "What is stack overflow in the context of recursion?",
      a: "Each function call pushes a frame onto the call stack. If recursion is too deep, the stack exceeds its limit. In Python you get RecursionError at the recursion limit (default 1000) before the real C stack overflows.",
      level: "Easy",
    },
    {
      q: "How do you solve Daily Temperatures (LeetCode 739)?",
      a: "Keep a stack of indices with decreasing temperatures. For each day i, while temps[i] > temps[stack top], pop j and set answer[j] = i - j. Push i. Remaining indices have answer 0. O(n) time and space.",
      level: "Medium",
    },
    {
      q: "Explain the idea behind Largest Rectangle in Histogram (LeetCode 84).",
      a: "Use an increasing stack of bar indices. When a shorter bar arrives, pop taller bars: for each popped bar, it is the limiting height of a rectangle whose right boundary is the current index and left boundary is the new stack top + 1. Width = i - stack[-1] - 1 (or i if the stack is empty). Append a sentinel 0 height at the end to flush the stack. O(n) time.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Daily Temperatures (LeetCode 739): For each day, how many days until a warmer temperature? [73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0].",
      hint: "Decreasing stack of indices; answer[j] = i - j when popped.",
      solution: `def daily_temperatures(temps):
    # Time O(n), Space O(n)
    answer = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer

print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
`,
    },
    {
      task: "Remove All Adjacent Duplicates (LeetCode 1047): 'abbaca' -> 'ca'.",
      hint: "If the current character equals the stack top, pop; else push.",
      solution: `def remove_duplicates(s):
    # Time O(n), Space O(n)
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)

print(remove_duplicates("abbaca"))  # ca
`,
    },
    {
      task: "Implement Queue using Stacks (LeetCode 232) with push, pop, peek and empty.",
      hint: "Two stacks; transfer only when the output stack is empty.",
      solution: `class MyQueue:
    # Amortized O(1) per operation, Space O(n)
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def _move(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._move()
        return self.outbox.pop()

    def peek(self):
        self._move()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox

q = MyQueue()
q.push(1); q.push(2); q.push(3)
print(q.peek(), q.pop(), q.pop(), q.empty())  # 1 1 2 False
`,
    },
    {
      task: "Largest Rectangle in Histogram (LeetCode 84): heights=[2,1,5,6,2,3] -> 10.",
      hint: "Increasing stack; on a shorter bar, pop and compute area with width = i - stack[-1] - 1. Add a 0 at the end.",
      solution: `def largest_rectangle_area(heights):
    # Time O(n), Space O(n)
    stack = []
    best = 0
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            best = max(best, height * width)
        stack.append(i)
    return best

print(largest_rectangle_area([2, 1, 5, 6, 2, 3]))  # 10
print(largest_rectangle_area([2, 4]))              # 4
`,
    },
    {
      task: "Simplify Path (LeetCode 71): '/home//foo/../bar/./' -> '/home/bar'.",
      hint: "Split on '/', push folder names, pop on '..', ignore '' and '.'.",
      solution: `def simplify_path(path):
    # Time O(n), Space O(n)
    stack = []
    for part in path.split("/"):
        if part == "..":
            if stack:
                stack.pop()
        elif part and part != ".":
            stack.append(part)
    return "/" + "/".join(stack)

print(simplify_path("/home//foo/../bar/./"))  # /home/bar
print(simplify_path("/../"))                  # /
`,
    },
  ],
  quiz: [
    {
      question: "A stack follows which principle?",
      options: [
        "FIFO",
        "LIFO",
        "Priority order",
        "Random access",
      ],
      answer: 1,
      explanation: "Last In, First Out.",
    },
    {
      question: "Which list operations make an O(1) stack in Python?",
      options: [
        "insert(0, x) and pop(0)",
        "append(x) and pop()",
        "append(x) and pop(0)",
        "insert(0, x) and pop()",
      ],
      answer: 1,
      explanation: "Both work at the end of the list.",
    },
    {
      question: "For input '([)]', the balanced bracket checker returns:",
      options: [
        "True",
        "False",
        "Error",
        "None",
      ],
      answer: 1,
      explanation: "')' arrives while '[' is on top of the stack.",
    },
    {
      question: "Total time of next greater element using a monotonic stack?",
      options: [
        "O(n^2)",
        "O(n log n)",
        "O(n)",
        "O(1)",
      ],
      answer: 2,
      explanation: "Each index is pushed and popped at most once.",
    },
    {
      question: "Evaluate postfix: 5 1 2 + 4 * + 3 -",
      options: [
        "14",
        "12",
        "18",
        "10",
      ],
      answer: 0,
      explanation: "1+2=3, 3*4=12, 5+12=17, 17-3=14.",
    },
    {
      question: "In a Min Stack storing (value, min_so_far) pairs, get_min is:",
      options: [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n log n)",
      ],
      answer: 2,
      explanation: "The minimum is stored with the top entry.",
    },
  ],
};
