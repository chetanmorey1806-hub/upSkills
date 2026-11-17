export default {
  id: "day-04-variables-and-data-types",
  title: "Variables and Data Types (int, float, complex, bool, str, None), type(), Dynamic Typing",
  module: "Module 1: Python Basics",
  day: 4,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn how variables store data in Python, the six basic data types (int, float, complex, bool, str, None), how to check a type with type() and isinstance(), and what dynamic typing really means.",
  objectives: [
    "Create variables, use multiple assignment and swap values",
    "Use int, float, complex, bool, str and None correctly",
    "Check types with type() and isinstance() and see object identity with id()",
    "Explain dynamic typing and the idea that variables are names (references) to objects",
    "Avoid common mistakes with floats, bool and None",
  ],
  theory: [
    {
      heading: "What is a variable?",
      content: "A variable is a name that refers to a value stored in memory. Think of it as a label/sticker put on a box: the box (object) holds the value, and the label (variable) lets you find it. In Python you create a variable just by assigning a value with =. No declaration and no type keyword is needed. Internally, every value is an object with a type, a value and an identity (memory address); a variable only points to that object.",
      syntax: `name = "Asha"         # str
age = 21               # int
height = 5.4           # float
is_student = True      # bool

x = y = z = 0          # same value to many variables
a, b, c = 1, 2, 3      # multiple assignment
a, b = b, a            # swap without a temp variable`,
      points: [
        "= is assignment, not equality (== checks equality)",
        "A variable must be assigned before use, else NameError",
        "del x removes the name x",
      ],
    },
    {
      heading: "Numeric types: int, float, complex",
      content: "int stores whole numbers of any size (Python ints have no overflow; they grow as needed). float stores decimal numbers using 64-bit double precision, so some decimals cannot be represented exactly (0.1 + 0.2 is 0.30000000000000004). complex stores numbers with a real and an imaginary part written with j, used in engineering and science.",
      syntax: `count = 42             # int
big = 10 ** 30         # int, still exact
salary = 1_50_000      # underscores for readability -> 150000
binary = 0b1010        # 10 (binary)
hexa = 0xFF            # 255 (hexadecimal)
price = 99.5           # float
sci = 2.5e3            # 2500.0 (scientific notation)
z = 3 + 4j             # complex; z.real -> 3.0, z.imag -> 4.0`,
      tip: "For money calculations use the decimal module (Decimal(\"0.1\")) or store paise/cents as int, because floats have rounding errors.",
    },
    {
      heading: "bool, str and None",
      content: "bool has only two values: True and False (capital first letter). bool is actually a subclass of int, so True == 1 and False == 0. str (string) is a sequence of Unicode characters inside single, double or triple quotes; strings are immutable. None is a special constant meaning \"no value / nothing yet\"; its type is NoneType. Functions that do not return anything return None.",
      syntax: `passed = True
name = 'Ravi'
city = "Mumbai"
address = """Line 1
Line 2"""
result = None          # value not known yet
print(result is None)  # True - always compare None with "is"`,
      points: [
        "Falsy values: False, None, 0, 0.0, 0j, \"\" (empty string), [], (), {}, set()",
        "Everything else is truthy",
        "True + True is 2 because bool is a subclass of int",
      ],
    },
    {
      heading: "type(), isinstance() and id()",
      content: "type(x) returns the class of the object x refers to. isinstance(x, int) checks whether x is an int (or a subclass of it) and is preferred in real code because it supports inheritance and can check many types at once: isinstance(x, (int, float)). id(x) returns a unique number for the object (its memory address in CPython). Two variables pointing to the same object have the same id.",
      syntax: `type(10)               # <class 'int'>
type(3.14)             # <class 'float'>
isinstance(True, int)  # True  (bool is a subclass of int)
id(x)                  # identity of the object`,
    },
    {
      heading: "Dynamic typing and strong typing",
      content: "Python is dynamically typed: the type belongs to the object, not to the variable. The same variable can point to an int now and a str later. The type is checked at runtime. Python is also strongly typed: it will not silently mix incompatible types. \"5\" + 5 raises TypeError instead of guessing. Compare with Java (static typing: int x = 5; x = \"hi\" is a compile error) and JavaScript (weak typing: \"5\" + 5 gives \"55\").",
      syntax: `x = 10        # x -> int object
x = "ten"     # now x -> str object (allowed)
"5" + 5       # TypeError: can only concatenate str (not "int") to str`,
      tip: "Type hints like age: int = 21 are allowed (Day 41) but Python does NOT enforce them at runtime; they help editors and tools.",
    },
    {
      heading: "Mutable vs immutable (preview) and naming constants",
      content: "int, float, complex, bool, str and None are all immutable: you cannot change the object; \"changing\" a variable creates a new object and moves the label. Lists and dicts (later days) are mutable. Python has no real constants; by convention we write constants in UPPER_CASE and do not change them.",
      syntax: `PI = 3.14159
MAX_USERS = 100
a = 5
print(id(a))
a = a + 1      # new object 6; a now points to it
print(id(a))   # different id`,
    },
  ],
  examples: [
    {
      title: "Student profile with all basic types",
      scenario: "Store a student's details in variables of different types and print each value with its type.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `name = "Asha"
age = 21
cgpa = 8.75
is_placed = False
z = 2 + 3j
mentor = None

for value in [name, age, cgpa, is_placed, z, mentor]:
    print(repr(value), "->", type(value).__name__)`,
      python: {
        files: {
          "main.py": `name = "Asha"
age = 21
cgpa = 8.75
is_placed = False
z = 2 + 3j
mentor = None

for value in [name, age, cgpa, is_placed, z, mentor]:
    print(repr(value), "->", type(value).__name__)`,
        },
      },
      result: `'Asha' -> str
21 -> int
8.75 -> float
False -> bool
(2+3j) -> complex
None -> NoneType`,
      explanation: "type(value).__name__ gives the short type name. repr() shows strings with quotes so you can see they are strings. Each basic type appears once.",
    },
    {
      title: "Multiple assignment and swapping",
      scenario: "Assign many variables in one line and swap two values without a temporary variable (a classic interview question).",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `a, b, c = 10, 20, 30
print("a, b, c =", a, b, c)

x = y = z = 0
print("x, y, z =", x, y, z)

first, second = "left", "right"
first, second = second, first
print("After swap:", first, second)`,
      python: {
        files: {
          "main.py": `a, b, c = 10, 20, 30
print("a, b, c =", a, b, c)

x = y = z = 0
print("x, y, z =", x, y, z)

first, second = "left", "right"
first, second = second, first
print("After swap:", first, second)`,
        },
      },
      result: `a, b, c = 10 20 30
x, y, z = 0 0 0
After swap: right left`,
      explanation: "The right side creates a tuple (second, first) first, then unpacks it into the names on the left. That is why swapping works in one line.",
    },
    {
      title: "Dynamic typing in action",
      scenario: "Reuse the same variable for different types and observe how type() and id() change.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `data = 100
print(data, type(data))
data = 99.9
print(data, type(data))
data = "hundred"
print(data, type(data))
data = [1, 2, 3]
print(data, type(data))

a = 500
b = a
print("a is b:", a is b, "| same id:", id(a) == id(b))`,
      python: {
        files: {
          "main.py": `data = 100
print(data, type(data))
data = 99.9
print(data, type(data))
data = "hundred"
print(data, type(data))
data = [1, 2, 3]
print(data, type(data))

a = 500
b = a
print("a is b:", a is b, "| same id:", id(a) == id(b))`,
        },
      },
      result: `100 <class 'int'>
99.9 <class 'float'>
hundred <class 'str'>
[1, 2, 3] <class 'list'>
a is b: True | same id: True`,
      explanation: "One name, four different types over time. b = a does not copy the value; it makes b point to the same object, so a is b is True.",
    },
    {
      title: "Float precision and bool as int",
      scenario: "Understand two surprising behaviours that are favourite interview \"what is the output\" questions.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(round(0.1 + 0.2, 2) == 0.3)
print(True + True + False)
print(isinstance(True, int))
print(10 ** 25)
print(type(5 / 1), type(5 // 1))
c = 3 + 4j
print(c.real, c.imag, abs(c))`,
      python: {
        files: {
          "main.py": `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(round(0.1 + 0.2, 2) == 0.3)
print(True + True + False)
print(isinstance(True, int))
print(10 ** 25)
print(type(5 / 1), type(5 // 1))
c = 3 + 4j
print(c.real, c.imag, abs(c))`,
        },
      },
      result: `0.30000000000000004
False
True
2
True
10000000000000000000000000
<class 'float'> <class 'int'>
3.0 4.0 5.0`,
      explanation: "Floats are stored in binary so 0.1 + 0.2 is not exactly 0.3; round() or math.isclose() fixes the comparison. True counts as 1. Ints can be huge without overflow. abs() of a complex number gives its magnitude: sqrt(3*3 + 4*4) = 5.0.",
    },
    {
      title: "Truthy and falsy values",
      scenario: "Find which values Python treats as False in an if condition.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `values = [0, 1, -5, 0.0, "", " ", "0", None, [], [0], True, False]
for v in values:
    print(repr(v).ljust(6), "->", bool(v))`,
      python: {
        files: {
          "main.py": `values = [0, 1, -5, 0.0, "", " ", "0", None, [], [0], True, False]
for v in values:
    print(repr(v).ljust(6), "->", bool(v))`,
        },
      },
      result: `0      -> False
1      -> True
-5     -> True
0.0    -> False
''     -> False
' '    -> True
'0'    -> True
None   -> False
[]     -> False
[0]    -> True
True   -> True
False  -> False`,
      explanation: "Zero numbers, empty containers, empty string, None and False are falsy. A string with a space \" \" or the string \"0\" is NOT empty, so it is truthy. ljust(6) just pads the text for neat columns.",
    },
  ],
  interview: [
    {
      q: "What are the basic built-in data types in Python?",
      a: "Numeric: int, float, complex; boolean: bool; text: str; and NoneType (None). Collections like list, tuple, set, dict come later.",
      level: "Easy",
    },
    {
      q: "Do we need to declare variables in Python?",
      a: "No. A variable is created when you first assign a value to it. Its type is inferred from the value at runtime.",
      level: "Easy",
    },
    {
      q: "Is Python statically or dynamically typed? Strongly or weakly?",
      a: "Dynamically typed (types are checked at runtime and a variable can refer to any type) and strongly typed (no implicit conversion between incompatible types such as \"5\" + 5).",
      level: "Medium",
    },
    {
      q: "What is the output of print(type(True + 1))?",
      a: "<class 'int'>. bool is a subclass of int, so True + 1 is 2, an int.",
      level: "Medium",
    },
    {
      q: "What is the output of print(0.1 + 0.2 == 0.3)?",
      a: "False, because of binary floating-point precision; 0.1 + 0.2 is 0.30000000000000004. Use math.isclose() or round().",
      level: "Medium",
    },
    {
      q: "What is None?",
      a: "None is a singleton object of type NoneType representing the absence of a value. Compare with \"is None\", not \"== None\".",
      level: "Easy",
    },
    {
      q: "Difference between type() and isinstance()?",
      a: "type(x) returns the exact class. isinstance(x, C) returns True if x is an instance of C or any subclass of C, and accepts a tuple of classes. isinstance is preferred for checks.",
      level: "Medium",
    },
    {
      q: "How do you swap two variables in Python?",
      a: "a, b = b, a. The right side builds a tuple, then it is unpacked into a and b.",
      level: "Easy",
    },
    {
      q: "Is there an integer overflow in Python?",
      a: "No. Python int has arbitrary precision; it grows to use more memory as needed. Floats can overflow to inf.",
      level: "Medium",
    },
    {
      q: "What does id() return?",
      a: "A unique integer for the object during its lifetime; in CPython it is the memory address. Two names with the same id refer to the same object.",
      level: "Medium",
    },
    {
      q: "What is the output of a = 256; b = 256; print(a is b)?",
      a: "True in CPython because small integers from -5 to 256 are cached (interned). For larger values the result of \"is\" can vary, so always use == to compare values.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create variables for a product: name, price, quantity, in_stock and discount (None). Print each with its type.",
      hint: "Use type(x).__name__.",
      solution: `name, price, quantity, in_stock, discount = "Pen", 10.5, 3, True, None
for v in [name, price, quantity, in_stock, discount]:
    print(v, type(v).__name__)`,
    },
    {
      task: "Swap three variables so that a gets b, b gets c, and c gets a in one line.",
      hint: "a, b, c = b, c, a",
      solution: `a, b, c = 1, 2, 3
a, b, c = b, c, a
print(a, b, c)   # 2 3 1`,
    },
    {
      task: "Check if a value is a number (int or float but not bool).",
      hint: "isinstance(x, (int, float)) and not isinstance(x, bool)",
      solution: `def is_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)

print(is_number(5), is_number(2.5), is_number(True), is_number("5"))`,
    },
    {
      task: "Print the real part, imaginary part and conjugate of 5 - 2j.",
      hint: ".real, .imag, .conjugate()",
      solution: `z = 5 - 2j
print(z.real, z.imag, z.conjugate())`,
    },
  ],
  quiz: [
    {
      question: "What is type(7.0)?",
      options: [
        "int",
        "float",
        "double",
        "decimal",
      ],
      answer: 1,
      explanation: "Any number with a decimal point is a float.",
    },
    {
      question: "What is the output of print(bool(\"\"))?",
      options: [
        "True",
        "None",
        "Error",
        "False",
      ],
      answer: 3,
      explanation: "An empty string is falsy.",
    },
    {
      question: "Which correctly checks for None?",
      options: [
        "x is None",
        "x == \"None\"",
        "x.isNone()",
        "type(x) == None",
      ],
      answer: 0,
      explanation: "None is a singleton, compare with is.",
    },
    {
      question: "What does \"5\" + 5 give?",
      options: [
        "10",
        "\"55\"",
        "TypeError",
        "55",
      ],
      answer: 2,
      explanation: "Python is strongly typed and will not add str and int.",
    },
    {
      question: "Which literal is a complex number?",
      options: [
        "3 + 4i",
        "complex",
        "3 + 4j",
        "3j4",
      ],
      answer: 2,
      explanation: "Python uses j for the imaginary unit.",
    },
  ],
};
