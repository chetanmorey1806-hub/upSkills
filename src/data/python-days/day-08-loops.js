export default {
  id: "day-08-loops",
  title: "Loops: for, while, range(), break, continue, pass, else on Loops",
  module: "Module 1: Python Basics",
  day: 8,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Repeat work with for and while loops, generate number sequences with range(), control loops with break, continue and pass, and understand the unique loop-else clause.",
  objectives: [
    "Iterate over strings, lists and ranges with for, using enumerate() and zip()",
    "Use range(start, stop, step) including reverse ranges",
    "Write while loops with a correct exit condition and avoid infinite loops",
    "Control loop flow with break, continue and pass",
    "Use else on loops (e.g. in prime number and search programs) and write nested loops",
  ],
  theory: [
    {
      heading: "Why loops?",
      content: "A loop repeats a block of code. Without loops, printing numbers 1 to 1000 would need 1000 print lines. Python has two loops: for (repeat for each item in a collection, when you know what to go through) and while (repeat as long as a condition is True, when you do not know how many times). Analogy: for is like a teacher calling every name on the attendance list; while is like \"keep stirring until the tea boils\".",
    },
    {
      heading: "for loop and range()",
      content: "A for loop takes each item from an iterable (string, list, tuple, dict, set, range, file...) one by one and runs the block. range() produces a sequence of integers lazily (it does not create the whole list in memory). range(stop) starts at 0; range(start, stop) excludes stop; range(start, stop, step) jumps by step; a negative step counts down.",
      syntax: `for item in iterable:
    block

range(5)          # 0 1 2 3 4
range(1, 6)       # 1 2 3 4 5
range(0, 11, 2)   # 0 2 4 6 8 10
range(10, 0, -3)  # 10 7 4 1
for ch in "abc": ...
for i, name in enumerate(["a", "b"], start=1): ...   # index + value
for n, m in zip(names, marks): ...                   # two lists together`,
      tip: "The stop value is NOT included. range(1, 10) stops at 9. This \"off by one\" is the most common loop mistake.",
    },
    {
      heading: "while loop",
      content: "A while loop checks a condition before each repetition. If the condition is True it runs the block, then checks again. You must change something inside the loop that will eventually make the condition False, otherwise you get an infinite loop (stop it with Ctrl+C). while True with a break is a common pattern for menus and input validation.",
      syntax: `count = 1
while count <= 5:
    print(count)
    count += 1        # without this, infinite loop

while True:
    cmd = input()
    if cmd == "quit":
        break`,
    },
    {
      heading: "break, continue and pass",
      content: "break immediately exits the nearest loop. continue skips the rest of the current iteration and jumps to the next one. pass does nothing; it is a placeholder where a statement is required. In nested loops, break and continue affect only the innermost loop.",
      syntax: `for n in range(1, 10):
    if n == 3:
        continue      # skip 3
    if n == 6:
        break         # stop at 6
    print(n)          # 1 2 4 5

for n in range(3):
    pass              # empty loop body (placeholder)`,
    },
    {
      heading: "else on loops",
      content: "Python loops can have an else block. It runs when the loop finishes normally, i.e. it was NOT stopped by break. Think of it as \"no break happened\". It is perfect for search programs: break when found, and the else block says \"not found\". This is unique to Python and a favourite interview question.",
      syntax: `for item in items:
    if item == target:
        print("Found")
        break
else:
    print("Not found")    # runs only if loop did not break`,
      points: [
        "while loops support else too",
        "The else runs even if the loop body never executed (empty list)",
      ],
    },
    {
      heading: "Nested loops",
      content: "A loop inside another loop is a nested loop. For every iteration of the outer loop, the inner loop runs completely. They are used for tables, matrices and pattern printing. If the outer loop runs m times and the inner n times, the inner body runs m x n times (time complexity O(m*n)).",
      syntax: `for i in range(1, 4):         # rows
    for j in range(1, 4):     # columns
        print(i * j, end="\\t")
    print()`,
    },
  ],
  examples: [
    {
      title: "Multiplication table with for and range()",
      scenario: "Print the multiplication table of a number entered by the user.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `n = int(input("Table of: "))
print()
for i in range(1, 11):
    print(f"{n} x {i:>2} = {n * i:>3}")`,
      python: {
        files: {
          "main.py": `n = int(input("Table of: "))
print()
for i in range(1, 11):
    print(f"{n} x {i:>2} = {n * i:>3}")`,
        },
        stdin: `7
`,
      },
      result: `Table of: 
7 x  1 =   7
7 x  2 =  14
7 x  3 =  21
7 x  4 =  28
7 x  5 =  35
7 x  6 =  42
7 x  7 =  49
7 x  8 =  56
7 x  9 =  63
7 x 10 =  70`,
      explanation: "range(1, 11) gives 1 to 10 (11 is excluded). The f-string aligns numbers in columns.",
    },
    {
      title: "enumerate(), zip() and reverse range",
      scenario: "Print a ranked list of students with their marks, then count down from 10.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `names = ["Asha", "Ravi", "Meena"]
marks = [91, 85, 78]
for rank, (name, mark) in enumerate(zip(names, marks), start=1):
    print(f"{rank}. {name} - {mark}")

for i in range(10, 0, -2):
    print(i, end=" ")
print()
total = 0
for n in range(1, 101):
    total += n
print("Sum 1..100 =", total)`,
      python: {
        files: {
          "main.py": `names = ["Asha", "Ravi", "Meena"]
marks = [91, 85, 78]
for rank, (name, mark) in enumerate(zip(names, marks), start=1):
    print(f"{rank}. {name} - {mark}")

for i in range(10, 0, -2):
    print(i, end=" ")
print()
total = 0
for n in range(1, 101):
    total += n
print("Sum 1..100 =", total)`,
        },
      },
      result: `1. Asha - 91
2. Ravi - 85
3. Meena - 78
10 8 6 4 2 
Sum 1..100 = 5050`,
      explanation: "zip() pairs items from both lists, enumerate() adds a counter starting from 1. range(10, 0, -2) counts down by 2 and stops before 0. Summing in a loop gives 5050 (or use sum(range(1, 101))).",
    },
    {
      title: "while loop: reverse a number and check palindrome",
      scenario: "Reverse the digits of a number using while, then check whether it is a palindrome.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `num = int(input("Number: "))
original = num
reverse = 0
while num > 0:
    digit = num % 10
    reverse = reverse * 10 + digit
    num //= 10
print()
print("Reverse:", reverse)
print("Palindrome" if reverse == original else "Not palindrome")`,
      python: {
        files: {
          "main.py": `num = int(input("Number: "))
original = num
reverse = 0
while num > 0:
    digit = num % 10
    reverse = reverse * 10 + digit
    num //= 10
print()
print("Reverse:", reverse)
print("Palindrome" if reverse == original else "Not palindrome")`,
        },
        stdin: `12321
`,
      },
      result: `Number: 
Reverse: 12321
Palindrome`,
      explanation: "Each iteration takes the last digit (% 10), appends it to reverse, and removes it from num (// 10). The loop ends when num becomes 0. We saved the original value because num is destroyed.",
    },
    {
      title: "break, continue and loop-else: prime numbers",
      scenario: "Print all prime numbers between 2 and 30 using a for-else, skip even numbers with continue, and stop a search with break.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `primes = []
for n in range(2, 31):
    if n > 2 and n % 2 == 0:
        continue                 # skip even numbers
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            break                # not prime
    else:
        primes.append(n)         # no break -> prime
print("Primes:", primes)

for x in [4, 9, 15, 21]:
    if x % 7 == 0:
        print("First multiple of 7:", x)
        break
else:
    print("No multiple of 7")`,
      python: {
        files: {
          "main.py": `primes = []
for n in range(2, 31):
    if n > 2 and n % 2 == 0:
        continue                 # skip even numbers
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            break                # not prime
    else:
        primes.append(n)         # no break -> prime
print("Primes:", primes)

for x in [4, 9, 15, 21]:
    if x % 7 == 0:
        print("First multiple of 7:", x)
        break
else:
    print("No multiple of 7")`,
        },
      },
      result: `Primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
First multiple of 7: 21`,
      explanation: "The inner loop tries divisors up to the square root. If a divisor is found, break skips the else; if none is found, else runs and n is prime. The second loop finds 21 and breaks, so its else does not run.",
    },
    {
      title: "Input validation with while True",
      scenario: "Keep asking for an age until a valid number between 1 and 120 is entered. Typical menu/validation loop.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `attempts = 0
while True:
    attempts += 1
    text = input("Enter age: ")
    if not text.isdigit():
        print("  Not a number, try again")
        continue
    age = int(text)
    if 1 <= age <= 120:
        break
    print("  Age must be between 1 and 120")
print(f"Accepted age {age} after {attempts} attempts")`,
      python: {
        files: {
          "main.py": `attempts = 0
while True:
    attempts += 1
    text = input("Enter age: ")
    if not text.isdigit():
        print("  Not a number, try again")
        continue
    age = int(text)
    if 1 <= age <= 120:
        break
    print("  Age must be between 1 and 120")
print(f"Accepted age {age} after {attempts} attempts")`,
        },
        stdin: `abc
150
25
`,
      },
      result: `Enter age:   Not a number, try again
Enter age:   Age must be between 1 and 120
Enter age: Accepted age 25 after 3 attempts`,
      explanation: "The loop runs forever until break. continue skips the range check when the text is not a number. Inputs abc, 150 and 25 were provided, so the loop runs three times.",
    },
    {
      title: "Nested loops: multiplication grid",
      scenario: "Print a 5x5 multiplication grid and count how many cells are even.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `even_count = 0
for i in range(1, 6):
    for j in range(1, 6):
        value = i * j
        if value % 2 == 0:
            even_count += 1
        print(f"{value:>3}", end="")
    print()
print("Even cells:", even_count)`,
      python: {
        files: {
          "main.py": `even_count = 0
for i in range(1, 6):
    for j in range(1, 6):
        value = i * j
        if value % 2 == 0:
            even_count += 1
        print(f"{value:>3}", end="")
    print()
print("Even cells:", even_count)`,
        },
      },
      result: `  1  2  3  4  5
  2  4  6  8 10
  3  6  9 12 15
  4  8 12 16 20
  5 10 15 20 25
Even cells: 16`,
      explanation: "For each row i, the inner loop prints 5 values on the same line (end=\"\"), then print() moves to the next line. The inner body runs 25 times in total.",
    },
  ],
  interview: [
    {
      q: "Difference between for and while loops?",
      a: "for iterates over items of an iterable (known sequence). while repeats as long as a condition is True (unknown number of iterations).",
      level: "Easy",
    },
    {
      q: "What is the output of list(range(2, 10, 3))?",
      a: "[2, 5, 8]",
      level: "Easy",
    },
    {
      q: "Explain break, continue and pass.",
      a: "break exits the loop; continue skips to the next iteration; pass does nothing and is a placeholder.",
      level: "Easy",
    },
    {
      q: "When does the else block of a loop execute?",
      a: "When the loop completes without hitting break (including when it runs zero times). It does not run if break ends the loop.",
      level: "Medium",
    },
    {
      q: `What is the output?
for i in range(3):
    pass
print(i)`,
      a: "2. The loop variable keeps its last value after the loop ends.",
      level: "Medium",
    },
    {
      q: `What is the output?
for i in range(5):
    if i == 3: break
else:
    print("done")
print(i)`,
      a: "3. break happens at i == 3 so \"done\" is not printed.",
      level: "Medium",
    },
    {
      q: "Does Python have a do-while loop?",
      a: "No. Simulate it with while True: ... if not condition: break, so the body runs at least once.",
      level: "Medium",
    },
    {
      q: "What is enumerate() used for?",
      a: "It returns (index, item) pairs while iterating, avoiding manual counters: for i, x in enumerate(items, start=1).",
      level: "Easy",
    },
    {
      q: "Is range() a list?",
      a: "No. In Python 3 range is a lazy, immutable sequence object that computes numbers on demand, using constant memory. list(range(...)) creates a list.",
      level: "Medium",
    },
    {
      q: "Why should you not modify a list while iterating over it?",
      a: "Removing or adding items shifts indexes, so items get skipped or the loop misbehaves. Iterate over a copy (items[:]) or build a new list.",
      level: "Hard",
    },
    {
      q: "What is the time complexity of two nested loops of n each?",
      a: "O(n^2), because the inner body runs n x n times.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Print the factorial of a number using a for loop.",
      hint: "Multiply result by every i from 1 to n.",
      solution: `n = int(input())
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)`,
    },
    {
      task: "Print the first n Fibonacci numbers using a while loop.",
      hint: "a, b = b, a + b",
      solution: `n = int(input())
a, b, count = 0, 1, 0
while count < n:
    print(a, end=" ")
    a, b = b, a + b
    count += 1`,
    },
    {
      task: "Count vowels and consonants in a string using a for loop.",
      hint: "Check ch.isalpha() first.",
      solution: `s = input().lower()
v = c = 0
for ch in s:
    if ch.isalpha():
        if ch in "aeiou":
            v += 1
        else:
            c += 1
print("Vowels:", v, "Consonants:", c)`,
    },
    {
      task: "Number guessing: secret = 42. Keep asking until the user guesses it, giving \"too high\"/\"too low\" hints.",
      hint: "while True with break",
      solution: `secret = 42
while True:
    g = int(input("Guess: "))
    if g > secret:
        print("Too high")
    elif g < secret:
        print("Too low")
    else:
        print("Correct!")
        break`,
    },
    {
      task: "Check if a number is an Armstrong number (e.g. 153 = 1^3 + 5^3 + 3^3).",
      hint: "Power = number of digits.",
      solution: `n = int(input())
p = len(str(n))
total = 0
for d in str(n):
    total += int(d) ** p
print("Armstrong" if total == n else "Not Armstrong")`,
    },
  ],
  quiz: [
    {
      question: "What does range(5) produce?",
      options: [
        "1 to 5",
        "0 to 5",
        "0 to 4",
        "1 to 4",
      ],
      answer: 2,
      explanation: "Starts at 0, stop (5) is excluded.",
    },
    {
      question: "Which statement skips the rest of the current iteration?",
      options: [
        "break",
        "continue",
        "pass",
        "skip",
      ],
      answer: 1,
      explanation: "continue jumps to the next iteration.",
    },
    {
      question: "The else of a for loop runs when:",
      options: [
        "The loop ends without break",
        "The loop hits break",
        "An exception occurs",
        "Never",
      ],
      answer: 0,
      explanation: "else means \"no break happened\".",
    },
    {
      question: "What is printed? for i in range(1, 10, 4): print(i, end=\" \")",
      options: [
        "1 4 8",
        "1 5 9 13",
        "4 8",
        "1 5 9",
      ],
      answer: 3,
      explanation: "1, then +4 = 5, then 9; 13 is beyond 10.",
    },
    {
      question: "How do you stop an infinite loop in the terminal?",
      options: [
        "Ctrl+S",
        "Ctrl+C",
        "Esc",
        "Ctrl+P",
      ],
      answer: 1,
      explanation: "Ctrl+C raises KeyboardInterrupt and stops the program.",
    },
  ],
};
