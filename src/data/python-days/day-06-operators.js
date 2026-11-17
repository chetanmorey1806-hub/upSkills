export default {
  id: "day-06-operators",
  title: "Operators: Arithmetic, Comparison, Logical, Assignment, Identity, Membership, Bitwise",
  module: "Module 1: Python Basics",
  day: 6,
  level: "Beginner",
  duration: "2 hours",
  summary: "Master all seven groups of Python operators, operator precedence, short-circuit evaluation, and the important difference between == and is.",
  objectives: [
    "Use arithmetic operators including //, % and ** correctly (also with negative numbers)",
    "Write conditions with comparison, chained comparison and logical operators",
    "Use compound assignment operators and the walrus operator :=",
    "Explain identity (is) vs equality (==) and use membership (in)",
    "Apply bitwise operators and understand operator precedence",
  ],
  theory: [
    {
      heading: "Arithmetic operators",
      content: "Arithmetic operators do maths. Python has seven: + addition, - subtraction, * multiplication, / true division (always float), // floor division (rounds DOWN toward minus infinity), % modulus (remainder; result has the sign of the divisor), ** power. + and * also work on strings and lists (concatenation and repetition).",
      syntax: `a, b = 17, 5
a + b    # 22
a - b    # 12
a * b    # 85
a / b    # 3.4
a // b   # 3
a % b    # 2
a ** 2   # 289
-17 // 5 # -4  (floor goes down, not toward zero)
-17 % 5  # 3
"ab" * 3 # 'ababab'
divmod(17, 5)  # (3, 2)`,
      tip: "Use n % 2 == 0 to check even numbers and n % 10 to get the last digit; these appear in many interview programs.",
    },
    {
      heading: "Comparison (relational) operators",
      content: "Comparison operators compare two values and return a bool: == equal, != not equal, > greater, < less, >= greater or equal, <= less or equal. Python allows chaining: 18 <= age < 60 means (18 <= age) and (age < 60). Strings are compared alphabetically by Unicode code points, so \"Apple\" < \"apple\" because uppercase letters come first.",
      syntax: `5 == 5.0          # True (value equality)
"a" != "A"        # True
10 > 3 > 1        # True (chained)
"apple" < "banana"  # True (dictionary order)
[1, 2] == [1, 2]  # True`,
    },
    {
      heading: "Logical operators and short-circuiting",
      content: "and, or, not combine conditions. and is True only if both sides are True; or is True if at least one side is True; not flips the value. They short-circuit: and stops at the first falsy value, or stops at the first truthy value. Important: and/or return one of the operands, not necessarily True/False. This gives a handy default-value trick: name = user_input or \"Guest\".",
      syntax: `True and False   # False
True or False    # True
not True         # False
0 and 5          # 0   (first falsy)
3 and 5          # 5   (last value, all truthy)
0 or "default"   # 'default'
"" or None       # None`,
      points: [
        "Precedence: not > and > or",
        "x > 0 and 10 / x > 1 is safe even when x is 0 because of short-circuiting",
      ],
    },
    {
      heading: "Assignment operators and the walrus operator",
      content: "= assigns. Compound operators update a variable in place: +=, -=, *=, /=, //=, %=, **=, &=, |=, ^=, >>=, <<=. Python has NO ++ or -- operators; use x += 1. The walrus operator := (Python 3.8+) assigns a value inside an expression, which avoids calling something twice.",
      syntax: `x = 10
x += 5      # 15
x *= 2      # 30
x //= 4     # 7
x **= 2     # 49
# walrus
if (n := len("python")) > 5:
    print(n)     # 6`,
    },
    {
      heading: "Identity and membership operators",
      content: "Identity operators is and is not check whether two names point to the SAME object in memory (same id). Equality == checks whether the VALUES are equal. Two separate lists with the same items are equal (==) but not identical (is). Use is only for None, True, False. Membership operators in and not in check whether a value exists inside a sequence or collection (string, list, tuple, set, dict keys).",
      syntax: `a = [1, 2]
b = [1, 2]
c = a
a == b      # True  (same values)
a is b      # False (different objects)
a is c      # True  (same object)
x is None   # correct way to test None

"py" in "python"       # True (substring)
3 in [1, 2, 3]         # True
"age" in {"age": 21}   # True (checks keys)
5 not in (1, 2)        # True`,
    },
    {
      heading: "Bitwise operators and precedence",
      content: "Bitwise operators work on the binary bits of integers: & AND, | OR, ^ XOR, ~ NOT (gives -(n+1)), << left shift (multiply by 2 per shift), >> right shift (floor divide by 2 per shift). They are used in permissions, flags, low-level and interview problems (e.g. n & 1 checks odd, n & (n-1) == 0 checks power of 2). Precedence (high to low): ** , unary + - ~ , * / // % , + - , << >> , & , ^ , | , comparisons/is/in , not , and , or. When in doubt, use parentheses.",
      syntax: `a, b = 12, 10      # 1100, 1010
a & b    # 8   (1000)
a | b    # 14  (1110)
a ^ b    # 6   (0110)
~a       # -13
a << 2   # 48
a >> 2   # 3
2 + 3 * 4 ** 2     # 50   (** first, then *, then +)
-2 ** 2            # -4   (** before unary minus)
(-2) ** 2          # 4
2 ** 3 ** 2        # 512  (** is right-associative)`,
    },
  ],
  examples: [
    {
      title: "All arithmetic operators on two numbers",
      scenario: "Read two numbers and show the result of every arithmetic operator, including negative floor division.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a = int(input("a: "))
b = int(input("b: "))
print()
print(f"{a} + {b} = {a + b}")
print(f"{a} - {b} = {a - b}")
print(f"{a} * {b} = {a * b}")
print(f"{a} / {b} = {a / b}")
print(f"{a} // {b} = {a // b}")
print(f"{a} % {b} = {a % b}")
print(f"{a} ** 2 = {a ** 2}")
print(f"-{a} // {b} = {-a // b}, -{a} % {b} = {-a % b}")
print("divmod:", divmod(a, b))`,
      python: {
        files: {
          "main.py": `a = int(input("a: "))
b = int(input("b: "))
print()
print(f"{a} + {b} = {a + b}")
print(f"{a} - {b} = {a - b}")
print(f"{a} * {b} = {a * b}")
print(f"{a} / {b} = {a / b}")
print(f"{a} // {b} = {a // b}")
print(f"{a} % {b} = {a % b}")
print(f"{a} ** 2 = {a ** 2}")
print(f"-{a} // {b} = {-a // b}, -{a} % {b} = {-a % b}")
print("divmod:", divmod(a, b))`,
        },
        stdin: `17
5
`,
      },
      result: `a: b: 
17 + 5 = 22
17 - 5 = 12
17 * 5 = 85
17 / 5 = 3.4
17 // 5 = 3
17 % 5 = 2
17 ** 2 = 289
-17 // 5 = -4, -17 % 5 = 3
divmod: (3, 2)`,
      explanation: "// rounds down to the nearest integer, so -17 // 5 is -4 (not -3). The remainder then satisfies a == b * (a // b) + a % b, giving -17 % 5 = 3.",
    },
    {
      title: "Digit tricks with // and %",
      scenario: "Extract the digits of a 4-digit number and find their sum; check even/odd. Very common in interview programs.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `n = 4729
last = n % 10
first = n // 1000
print("Last digit:", last)
print("First digit:", first)
print("Without last digit:", n // 10)

total = 0
temp = n
while temp > 0:
    total += temp % 10
    temp //= 10
print("Sum of digits:", total)
print("Even" if n % 2 == 0 else "Odd")`,
      python: {
        files: {
          "main.py": `n = 4729
last = n % 10
first = n // 1000
print("Last digit:", last)
print("First digit:", first)
print("Without last digit:", n // 10)

total = 0
temp = n
while temp > 0:
    total += temp % 10
    temp //= 10
print("Sum of digits:", total)
print("Even" if n % 2 == 0 else "Odd")`,
        },
      },
      result: `Last digit: 9
First digit: 4
Without last digit: 472
Sum of digits: 22
Odd`,
      explanation: "n % 10 gives the last digit, n // 10 removes it. Repeating these in a loop visits every digit. The compound operators += and //= update variables in place.",
    },
    {
      title: "Logical operators: eligibility check and short-circuit",
      scenario: "A loan is approved when age is between 21 and 60 and (salary >= 25000 or has a guarantor). Also see what and/or return.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `age, salary, guarantor = 30, 18000, True
eligible = 21 <= age <= 60 and (salary >= 25000 or guarantor)
print("Loan eligible:", eligible)

print(0 and 10, 5 and 10, 0 or 10, "" or "Guest", not 0)
username = ""
display = username or "Guest"
print("Welcome,", display)

x = 0
print(x != 0 and 100 / x > 1)   # no ZeroDivisionError`,
      python: {
        files: {
          "main.py": `age, salary, guarantor = 30, 18000, True
eligible = 21 <= age <= 60 and (salary >= 25000 or guarantor)
print("Loan eligible:", eligible)

print(0 and 10, 5 and 10, 0 or 10, "" or "Guest", not 0)
username = ""
display = username or "Guest"
print("Welcome,", display)

x = 0
print(x != 0 and 100 / x > 1)   # no ZeroDivisionError`,
        },
      },
      result: `Loan eligible: True
0 10 10 Guest True
Welcome, Guest
False`,
      explanation: "Chained comparison keeps the age check readable. and/or return an operand: 0 and 10 returns 0, 0 or 10 returns 10. In the last line, x != 0 is False so Python never evaluates 100 / x.",
    },
    {
      title: "== vs is and membership",
      scenario: "Understand why \"is\" is not the same as \"==\", and search inside strings, lists and dictionaries.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a = [1, 2, 3]
b = [1, 2, 3]
c = a
print("a == b:", a == b)
print("a is b:", a is b)
print("a is c:", a is c)
c.append(4)
print("a after c.append(4):", a)

value = None
print("value is None:", value is None)

print("Py" in "Python", "java" not in "Python")
print(3 in [1, 2, 3], "age" in {"name": "Asha", "age": 21}, 21 in {"age": 21})`,
      python: {
        files: {
          "main.py": `a = [1, 2, 3]
b = [1, 2, 3]
c = a
print("a == b:", a == b)
print("a is b:", a is b)
print("a is c:", a is c)
c.append(4)
print("a after c.append(4):", a)

value = None
print("value is None:", value is None)

print("Py" in "Python", "java" not in "Python")
print(3 in [1, 2, 3], "age" in {"name": "Asha", "age": 21}, 21 in {"age": 21})`,
        },
      },
      result: `a == b: True
a is b: False
a is c: True
a after c.append(4): [1, 2, 3, 4]
value is None: True
True True
True True False`,
      explanation: "a and b are equal lists but two different objects. c is just another name for a, so changing c changes a. in on a dict checks keys only, so 21 in {\"age\": 21} is False.",
    },
    {
      title: "Bitwise operators and precedence",
      scenario: "Show bit patterns with bin(), and use bit tricks to test odd numbers and powers of two.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a, b = 12, 10
print(bin(a), bin(b))
print("a & b =", a & b, bin(a & b))
print("a | b =", a | b, bin(a | b))
print("a ^ b =", a ^ b, bin(a ^ b))
print("~a =", ~a)
print("a << 2 =", a << 2, "| a >> 2 =", a >> 2)

for n in [7, 8, 16, 18]:
    print(n, "odd" if n & 1 else "even", "| power of 2:", n > 0 and n & (n - 1) == 0)

print(2 + 3 * 4 ** 2, -2 ** 2, (-2) ** 2, 2 ** 3 ** 2)`,
      python: {
        files: {
          "main.py": `a, b = 12, 10
print(bin(a), bin(b))
print("a & b =", a & b, bin(a & b))
print("a | b =", a | b, bin(a | b))
print("a ^ b =", a ^ b, bin(a ^ b))
print("~a =", ~a)
print("a << 2 =", a << 2, "| a >> 2 =", a >> 2)

for n in [7, 8, 16, 18]:
    print(n, "odd" if n & 1 else "even", "| power of 2:", n > 0 and n & (n - 1) == 0)

print(2 + 3 * 4 ** 2, -2 ** 2, (-2) ** 2, 2 ** 3 ** 2)`,
        },
      },
      result: `0b1100 0b1010
a & b = 8 0b1000
a | b = 14 0b1110
a ^ b = 6 0b110
~a = -13
a << 2 = 48 | a >> 2 = 3
7 odd | power of 2: False
8 even | power of 2: True
16 even | power of 2: True
18 even | power of 2: False
50 -4 4 512`,
      explanation: "& keeps bits set in both, | in either, ^ in exactly one. ~a is -(a+1). Shifting left by 2 multiplies by 4. n & 1 is 1 for odd numbers, and a power of two has a single 1-bit, so n & (n - 1) is 0. ** binds tighter than unary minus and is right-associative.",
    },
  ],
  interview: [
    {
      q: "What is the difference between / and //?",
      a: "/ is true division and always returns float (7/2 = 3.5). // is floor division and rounds down toward negative infinity (7//2 = 3, -7//2 = -4).",
      level: "Easy",
    },
    {
      q: "What is the output of print(-7 // 2, -7 % 2)?",
      a: "-4 1. Floor division rounds down, and the remainder takes the sign of the divisor.",
      level: "Medium",
    },
    {
      q: "Difference between == and is?",
      a: "== compares values (calls __eq__). is compares identity, i.e. whether both names refer to the same object. Use is only for None/True/False singletons.",
      level: "Easy",
    },
    {
      q: "Does Python have ++ and -- operators?",
      a: "No. Use x += 1 and x -= 1. ++x is valid but just means +(+x), which does nothing.",
      level: "Medium",
    },
    {
      q: "What is short-circuit evaluation?",
      a: "For and, if the left operand is falsy the right side is not evaluated; for or, if the left is truthy the right is not evaluated. It saves time and prevents errors like division by zero.",
      level: "Medium",
    },
    {
      q: "What is the output of print(3 and 0 or 7)?",
      a: "7. 3 and 0 gives 0 (falsy), then 0 or 7 gives 7.",
      level: "Hard",
    },
    {
      q: "What is the output of print(2 ** 3 ** 2)?",
      a: "512, because ** is right-associative: 3 ** 2 = 9 first, then 2 ** 9.",
      level: "Medium",
    },
    {
      q: "What does ~5 return?",
      a: "-6. Bitwise NOT of n is -(n + 1) for integers (two's complement).",
      level: "Medium",
    },
    {
      q: "What is the walrus operator?",
      a: ":= (Python 3.8) assigns a value as part of an expression, e.g. while (line := input()) != \"quit\": ...",
      level: "Medium",
    },
    {
      q: "How do you check if a number is a power of two without loops?",
      a: "n > 0 and n & (n - 1) == 0",
      level: "Hard",
    },
    {
      q: "What is the output of print(\"a\" in \"banana\", \"an\" in [\"banana\"])?",
      a: "True False. In a string, in checks substrings; in a list, it checks for an equal element, and \"an\" is not an element.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Read a number of seconds and print it as hours, minutes and seconds (e.g. 3725 -> 1 h 2 m 5 s).",
      hint: "Use // and % with 3600 and 60, or divmod.",
      solution: `s = int(input())
h, rem = divmod(s, 3600)
m, sec = divmod(rem, 60)
print(f"{h} h {m} m {sec} s")`,
    },
    {
      task: "Check whether a year is a leap year using one boolean expression.",
      hint: "(y % 4 == 0 and y % 100 != 0) or y % 400 == 0",
      solution: `y = int(input())
print((y % 4 == 0 and y % 100 != 0) or y % 400 == 0)`,
    },
    {
      task: "Swap two numbers using XOR without a third variable.",
      hint: "a ^= b; b ^= a; a ^= b",
      solution: `a, b = 5, 9
a ^= b
b ^= a
a ^= b
print(a, b)   # 9 5`,
    },
    {
      task: "Check whether a character entered by the user is a vowel using in.",
      hint: "ch.lower() in \"aeiou\"",
      solution: `ch = input("Char: ")
print("Vowel" if ch.lower() in "aeiou" else "Not a vowel")`,
    },
  ],
  quiz: [
    {
      question: "What is 10 % 3?",
      options: [
        "3",
        "1",
        "3.33",
        "0",
      ],
      answer: 1,
      explanation: "10 = 3 * 3 + 1, remainder 1.",
    },
    {
      question: "What is the output of print(5 > 3 > 1)?",
      options: [
        "False",
        "Error",
        "True",
        "1",
      ],
      answer: 2,
      explanation: "Chained: 5 > 3 and 3 > 1, both True.",
    },
    {
      question: "What does \"\" or \"N/A\" evaluate to?",
      options: [
        "\"\"",
        "True",
        "False",
        "\"N/A\"",
      ],
      answer: 3,
      explanation: "or returns the first truthy operand.",
    },
    {
      question: "Which operator checks whether two names refer to the same object?",
      options: [
        "is",
        "==",
        "in",
        "&",
      ],
      answer: 0,
      explanation: "is compares identity.",
    },
    {
      question: "What is 6 & 3?",
      options: [
        "9",
        "7",
        "2",
        "5",
      ],
      answer: 2,
      explanation: "110 & 011 = 010 = 2.",
    },
  ],
};
