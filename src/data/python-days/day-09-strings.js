export default {
  id: "day-09-strings",
  title: "Strings: Indexing, Slicing, String Methods, Immutability",
  module: "Module 2: Data Structures",
  day: 9,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Work with text in Python: create strings, access characters with positive and negative indexes, extract parts with slicing, use the most important string methods, and understand why strings are immutable.",
  objectives: [
    "Create single, double, triple-quoted and raw strings",
    "Access characters with positive/negative indexing and extract substrings with slicing [start:stop:step]",
    "Use common string methods: case, search, replace, split/join, strip, checks, alignment",
    "Explain string immutability and build strings efficiently with join()",
    "Solve classic string programs: reverse, palindrome, count characters, title case",
  ],
  theory: [
    {
      heading: "Creating strings",
      content: "A string (str) is an ordered, immutable sequence of Unicode characters. Create it with single quotes, double quotes, or triple quotes for multi-line text. Use double quotes when the text contains an apostrophe. A raw string r\"...\" treats backslashes literally. len() gives the number of characters. Strings support + (join), * (repeat), in (substring test) and comparison.",
      syntax: `s1 = 'Python'
s2 = "It's easy"
s3 = """Multi
line"""
path = r"C:\\new\\folder"
len("hello")        # 5
"Py" + "thon"       # 'Python'
"-" * 10            # '----------'
"th" in "Python"    # True`,
    },
    {
      heading: "Indexing",
      content: "Each character has a position (index). Positive indexes start at 0 from the left; negative indexes start at -1 from the right. Think of seats in a row numbered from the front (0, 1, 2...) and also from the back (-1, -2...). Accessing an index outside the range raises IndexError.",
      syntax: `s = "PYTHON"
#  index:  0  1  2  3  4  5
#  neg  : -6 -5 -4 -3 -2 -1
s[0]    # 'P'
s[3]    # 'H'
s[-1]   # 'N'  (last character)
s[-2]   # 'O'
s[10]   # IndexError: string index out of range`,
    },
    {
      heading: "Slicing [start:stop:step]",
      content: "Slicing extracts a part of a string. s[start:stop] returns characters from start up to (but NOT including) stop. Missing start means \"from the beginning\"; missing stop means \"till the end\". step skips characters; a negative step goes backwards, so s[::-1] reverses the string. Slicing never raises IndexError; out-of-range values are simply clipped.",
      syntax: `s = "PYTHON"
s[0:3]    # 'PYT'
s[2:]     # 'THON'
s[:4]     # 'PYTH'
s[-3:]    # 'HON'  (last 3)
s[::2]    # 'PTO'  (every 2nd)
s[::-1]   # 'NOHTYP' (reverse)
s[1:100]  # 'YTHON' (no error)`,
      tip: "Length of s[a:b] is b - a (when both are in range). s[:n] + s[n:] always equals s.",
    },
    {
      heading: "Immutability",
      content: "Strings cannot be changed after creation. s[0] = \"J\" raises TypeError. All string methods return a NEW string and leave the original unchanged, so you must store the result: name = name.upper(). Because strings are immutable, they are safe to use as dictionary keys and can be shared safely. Repeated += in a big loop creates many temporary strings; collect parts in a list and use \"\".join(parts) instead.",
      syntax: `s = "hello"
s[0] = "H"            # TypeError: 'str' object does not support item assignment
s = "H" + s[1:]       # create a new string -> 'Hello'
s.upper()             # returns 'HELLO', s is unchanged
s = s.upper()         # store the new string`,
    },
    {
      heading: "Important string methods",
      content: "Python strings have more than 40 methods. These are the ones used daily in projects and interviews.",
      syntax: `# case
"hello world".upper()        # 'HELLO WORLD'
"HeLLo".lower()              # 'hello'
"hello world".title()        # 'Hello World'
"hello world".capitalize()   # 'Hello world'
"Hello".swapcase()           # 'hELLO'
# search
"banana".find("an")          # 1   (-1 if not found)
"banana".index("an")         # 1   (ValueError if not found)
"banana".rfind("an")         # 3
"banana".count("a")          # 3
"report.pdf".endswith(".pdf")    # True
"https://x".startswith("https")  # True
# modify
"  hi  ".strip()             # 'hi'   (also lstrip, rstrip)
"a-b-c".replace("-", "+")    # 'a+b+c'
"a,b,c".split(",")           # ['a', 'b', 'c']
" ".join(["Hi", "there"])    # 'Hi there'
"7".zfill(3)                 # '007'
"hi".center(8, "*")          # '***hi***'
# checks (return bool)
"abc".isalpha()  "123".isdigit()  "ab12".isalnum()  "  ".isspace()
"Hi".istitle()   "HI".isupper()   "hi".islower()`,
    },
    {
      heading: "Unicode, ord() and chr()",
      content: "Every character has a Unicode code point number. ord(\"A\") gives 65 and chr(65) gives \"A\". This is useful for ciphers, sorting tricks and checking ranges. Strings compare character by character using these numbers, which is why \"Zebra\" < \"apple\" is True (uppercase letters have smaller codes).",
      syntax: `ord("A")   # 65
ord("a")   # 97
chr(98)    # 'b'
"₹ 500"    # Unicode is fully supported`,
    },
  ],
  examples: [
    {
      title: "Indexing and slicing an email and a mobile number",
      scenario: "Extract the username and domain from an email, and mask a mobile number except the last 4 digits.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `email = "asha.patil@gmail.com"
at = email.index("@")
print("Username:", email[:at])
print("Domain  :", email[at + 1:])
print("First char:", email[0], "| Last char:", email[-1])

mobile = "9876543210"
masked = "*" * (len(mobile) - 4) + mobile[-4:]
print("Masked mobile:", masked)
print("Every 2nd digit:", mobile[::2])
print("Reversed:", mobile[::-1])`,
      python: {
        files: {
          "main.py": `email = "asha.patil@gmail.com"
at = email.index("@")
print("Username:", email[:at])
print("Domain  :", email[at + 1:])
print("First char:", email[0], "| Last char:", email[-1])

mobile = "9876543210"
masked = "*" * (len(mobile) - 4) + mobile[-4:]
print("Masked mobile:", masked)
print("Every 2nd digit:", mobile[::2])
print("Reversed:", mobile[::-1])`,
        },
      },
      result: `Username: asha.patil
Domain  : gmail.com
First char: a | Last char: m
Masked mobile: ******3210
Every 2nd digit: 97531
Reversed: 0123456789`,
      explanation: "index(\"@\") gives the position of @; slicing before and after it splits the email. mobile[-4:] takes the last 4 characters. [::2] skips every second character and [::-1] reverses.",
    },
    {
      title: "Cleaning user input with string methods",
      scenario: "Users type names with extra spaces and random case. Clean it, validate a username, and build a slug for a URL.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `raw = "   aSHA   patIL  "
clean = " ".join(raw.split()).title()
print(f"[{raw}] -> [{clean}]")

username = "asha_99"
print("Valid username:", username.replace("_", "").isalnum() and 3 <= len(username) <= 15)

title = "  Learn Python Strings in 1 Day!  "
slug = "-".join(title.strip().lower().replace("!", "").split())
print("Slug:", slug)

csv_line = "Asha,21,Pune"
name, age, city = csv_line.split(",")
print(name, int(age) + 1, city.upper())
print("Order ID:", str(42).zfill(6))`,
      python: {
        files: {
          "main.py": `raw = "   aSHA   patIL  "
clean = " ".join(raw.split()).title()
print(f"[{raw}] -> [{clean}]")

username = "asha_99"
print("Valid username:", username.replace("_", "").isalnum() and 3 <= len(username) <= 15)

title = "  Learn Python Strings in 1 Day!  "
slug = "-".join(title.strip().lower().replace("!", "").split())
print("Slug:", slug)

csv_line = "Asha,21,Pune"
name, age, city = csv_line.split(",")
print(name, int(age) + 1, city.upper())
print("Order ID:", str(42).zfill(6))`,
        },
      },
      result: `[   aSHA   patIL  ] -> [Asha Patil]
Valid username: True
Slug: learn-python-strings-in-1-day
Asha 22 PUNE
Order ID: 000042`,
      explanation: "split() with no argument splits on any whitespace and drops empty parts, so join(split()) removes extra spaces. Methods can be chained because each returns a new string. zfill pads with zeros.",
    },
    {
      title: "Immutability in action",
      scenario: "Try to change a character, see the error, and do it the correct way.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `s = "python"
try:
    s[0] = "P"
except TypeError as e:
    print("Error:", e)

t = s.capitalize()
print("s =", s, "| t =", t)

old_id = id(s)
s = "J" + s[1:]
print("New s:", s, "| same object?", id(s) == old_id)

parts = []
for i in range(5):
    parts.append(str(i))
print("Joined:", "-".join(parts))`,
      python: {
        files: {
          "main.py": `s = "python"
try:
    s[0] = "P"
except TypeError as e:
    print("Error:", e)

t = s.capitalize()
print("s =", s, "| t =", t)

old_id = id(s)
s = "J" + s[1:]
print("New s:", s, "| same object?", id(s) == old_id)

parts = []
for i in range(5):
    parts.append(str(i))
print("Joined:", "-".join(parts))`,
        },
      },
      result: `Error: 'str' object does not support item assignment
s = python | t = Python
New s: Jython | same object? False
Joined: 0-1-2-3-4`,
      explanation: "Item assignment fails because str is immutable. capitalize() returns a new string while s stays the same. Building with \"J\" + s[1:] creates a new object (different id). join() is the efficient way to build a string from many parts.",
    },
    {
      title: "Palindrome, reverse words and character frequency",
      scenario: "Three classic interview programs on strings.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `def is_palindrome(text):
    cleaned = "".join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]

print(is_palindrome("Madam"))
print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("Python"))

sentence = "Python is fun to learn"
print(" ".join(sentence.split()[::-1]))
print(" ".join(word[::-1] for word in sentence.split()))

word = "programming"
freq = {}
for ch in word:
    freq[ch] = freq.get(ch, 0) + 1
print(freq)
print("Duplicates:", [ch for ch, c in freq.items() if c > 1])`,
      python: {
        files: {
          "main.py": `def is_palindrome(text):
    cleaned = "".join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]

print(is_palindrome("Madam"))
print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("Python"))

sentence = "Python is fun to learn"
print(" ".join(sentence.split()[::-1]))
print(" ".join(word[::-1] for word in sentence.split()))

word = "programming"
freq = {}
for ch in word:
    freq[ch] = freq.get(ch, 0) + 1
print(freq)
print("Duplicates:", [ch for ch, c in freq.items() if c > 1])`,
        },
      },
      result: `True
True
False
learn to fun is Python
nohtyP si nuf ot nrael
{'p': 1, 'r': 2, 'o': 1, 'g': 2, 'a': 1, 'm': 2, 'i': 1, 'n': 1}
Duplicates: ['r', 'g', 'm']`,
      explanation: "The palindrome check keeps only letters/digits in lowercase and compares with its reverse. Reversing the list of words reverses word order; reversing each word reverses letters. A dictionary counts each character (dicts are covered on Day 14).",
    },
    {
      title: "ord(), chr() and Caesar cipher",
      scenario: "Encrypt a message by shifting each letter by 3 positions (Caesar cipher), keeping case and punctuation.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `def caesar(text, shift):
    result = ""
    for ch in text:
        if ch.isupper():
            result += chr((ord(ch) - ord("A") + shift) % 26 + ord("A"))
        elif ch.islower():
            result += chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))
        else:
            result += ch
    return result

secret = caesar("Hello, World! xyz", 3)
print("Encrypted:", secret)
print("Decrypted:", caesar(secret, -3))
print(ord("A"), ord("a"), chr(8377), "Zebra" < "apple")`,
      python: {
        files: {
          "main.py": `def caesar(text, shift):
    result = ""
    for ch in text:
        if ch.isupper():
            result += chr((ord(ch) - ord("A") + shift) % 26 + ord("A"))
        elif ch.islower():
            result += chr((ord(ch) - ord("a") + shift) % 26 + ord("a"))
        else:
            result += ch
    return result

secret = caesar("Hello, World! xyz", 3)
print("Encrypted:", secret)
print("Decrypted:", caesar(secret, -3))
print(ord("A"), ord("a"), chr(8377), "Zebra" < "apple")`,
        },
      },
      result: `Encrypted: Khoor, Zruog! abc
Decrypted: Hello, World! xyz
65 97 ₹ True`,
      explanation: "ord() converts a letter to a number, we shift it, wrap around with % 26, and chr() converts back. Non-letters are kept. chr(8377) is the Rupee sign. Uppercase codes (65-90) are smaller than lowercase (97-122).",
    },
  ],
  interview: [
    {
      q: "Why are strings immutable in Python?",
      a: "For safety and performance: they can be hashed and used as dict keys/set elements, shared across references without copies, and interned. Any \"modification\" creates a new string.",
      level: "Medium",
    },
    {
      q: "What is the output of print(\"Python\"[1:4])?",
      a: "yth (indexes 1, 2, 3).",
      level: "Easy",
    },
    {
      q: "How do you reverse a string?",
      a: "s[::-1], or \"\".join(reversed(s)).",
      level: "Easy",
    },
    {
      q: "Difference between find() and index()?",
      a: "Both return the first position of a substring. find() returns -1 if not found; index() raises ValueError.",
      level: "Easy",
    },
    {
      q: "What is the output of print(\"abc\" * 2 + \"d\")?",
      a: "abcabcd",
      level: "Easy",
    },
    {
      q: "What is the output of print(\"hello\"[-10:3])?",
      a: "hel. Slicing clips out-of-range indexes and never raises IndexError.",
      level: "Medium",
    },
    {
      q: "Difference between split() and split(\" \")?",
      a: "split() splits on any run of whitespace and removes empty strings. split(\" \") splits on each single space, so multiple spaces produce empty strings: \"a  b\".split(\" \") -> ['a', '', 'b'].",
      level: "Hard",
    },
    {
      q: "Why is \"\".join(list) preferred over += in a loop?",
      a: "+= creates a new string each time (O(n^2) copying in the worst case); join computes the total size once and builds the result in one pass (O(n)).",
      level: "Hard",
    },
    {
      q: "What do strip(), lstrip() and rstrip() do?",
      a: "Remove whitespace (or given characters) from both ends, the left end, or the right end respectively.",
      level: "Easy",
    },
    {
      q: "What is the output of print(\"Hello World\".title().swapcase())?",
      a: "hELLO wORLD",
      level: "Medium",
    },
    {
      q: "What is the difference between isdigit() and isnumeric()?",
      a: "isdigit() accepts digits 0-9 and digit-like chars (superscripts); isnumeric() also accepts numeric characters such as fractions \"½\" and Roman numerals. Neither accepts \"-5\" or \"2.5\".",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Read a string and count uppercase letters, lowercase letters, digits and spaces.",
      hint: "Loop and use isupper(), islower(), isdigit(), isspace().",
      solution: `s = input()
u = l = d = sp = 0
for ch in s:
    if ch.isupper(): u += 1
    elif ch.islower(): l += 1
    elif ch.isdigit(): d += 1
    elif ch.isspace(): sp += 1
print(u, l, d, sp)`,
    },
    {
      task: "Check whether two strings are anagrams (\"listen\", \"silent\").",
      hint: "Compare sorted characters.",
      solution: `a, b = "listen", "silent"
print(sorted(a.lower()) == sorted(b.lower()))`,
    },
    {
      task: "Remove all vowels from a string.",
      hint: "Join characters not in \"aeiouAEIOU\".",
      solution: `s = "Programming in Python"
print("".join(ch for ch in s if ch not in "aeiouAEIOU"))`,
    },
    {
      task: "Find the longest word in a sentence.",
      hint: "max(words, key=len)",
      solution: `s = "Python makes programming enjoyable"
print(max(s.split(), key=len))`,
    },
    {
      task: "Capitalize the first and last letter of each word: \"hello world\" -> \"HellO WorlD\".",
      hint: "w[0].upper() + w[1:-1] + w[-1].upper()",
      solution: `s = "hello world"
out = []
for w in s.split():
    out.append(w[0].upper() + w[1:-1] + w[-1].upper() if len(w) > 1 else w.upper())
print(" ".join(out))`,
    },
  ],
  quiz: [
    {
      question: "What is \"PYTHON\"[-2]?",
      options: [
        "N",
        "O",
        "H",
        "T",
      ],
      answer: 1,
      explanation: "-1 is N, -2 is O.",
    },
    {
      question: "What is \"abcdef\"[1:5:2]?",
      options: [
        "bd",
        "bdf",
        "ace",
        "bcde",
      ],
      answer: 0,
      explanation: "Indexes 1 and 3: b, d.",
    },
    {
      question: "What happens with s = \"hi\"; s[0] = \"H\"?",
      options: [
        "s becomes \"Hi\"",
        "Nothing",
        "IndexError",
        "TypeError",
      ],
      answer: 3,
      explanation: "Strings are immutable.",
    },
    {
      question: "What does \"a,b,,c\".split(\",\") return?",
      options: [
        "['a', 'b', 'c']",
        "['a', 'b', '', 'c']",
        "['a,b,,c']",
        "Error",
      ],
      answer: 1,
      explanation: "Two commas in a row produce an empty string.",
    },
    {
      question: "Which method returns -1 when the substring is not found?",
      options: [
        "index()",
        "search()",
        "find()",
        "count()",
      ],
      answer: 2,
      explanation: "find() returns -1; index() raises ValueError.",
    },
  ],
};
