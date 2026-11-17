export default {
  id: "day-37-regular-expressions",
  title: "Regular Expressions (re module)",
  module: "Module 6: Advanced Python",
  day: 37,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Use regular expressions with Python's re module to search, validate, extract and replace text patterns such as emails, phone numbers, dates and log entries.",
  objectives: [
    "Read and write regex patterns using metacharacters, character classes and quantifiers",
    "Use re.match, re.search, re.fullmatch, re.findall, re.finditer, re.sub and re.split",
    "Extract data with groups and named groups",
    "Understand greedy vs non-greedy matching and use flags like IGNORECASE and MULTILINE",
    "Validate common inputs like email, mobile number and password",
  ],
  theory: [
    {
      heading: "What is a Regular Expression?",
      content: "A regular expression (regex) is a small pattern language for describing text. Instead of writing many if/for statements to find 'all 10-digit phone numbers', you write a pattern like \\d{10}. Analogy: regex is like a search filter with wildcards - 'find words that start with a capital letter and end with ing'. Python's built-in re module provides regex support. Always write patterns as raw strings r'...' so backslashes are not treated as escape sequences by Python.",
      syntax: `import re
text = "Call 9876543210 or 9123456789"
print(re.findall(r"\\d{10}", text))   # ['9876543210', '9123456789']
`,
    },
    {
      heading: "Metacharacters and Character Classes",
      content: "Special symbols have special meaning in a pattern. Character classes match one character from a group.",
      points: [
        ". any character except newline",
        "^ start of string, $ end of string",
        "\\d digit, \\D non-digit",
        "\\w word char (letter, digit, _), \\W non-word",
        "\\s whitespace, \\S non-whitespace",
        "\\b word boundary",
        "[abc] one of a, b, c; [a-z] range; [^0-9] NOT a digit",
        "| OR: cat|dog",
        "( ) group; \\ escapes a metacharacter, e.g. \\. for a real dot",
      ],
    },
    {
      heading: "Quantifiers, Greedy vs Non-Greedy",
      content: "Quantifiers say how many times the previous item repeats. By default they are greedy: they match as much as possible. Adding ? after a quantifier makes it non-greedy (lazy): it matches as little as possible. This matters when extracting things like HTML tags.",
      points: [
        "* zero or more",
        "+ one or more",
        "? zero or one (optional)",
        "{n} exactly n, {n,} n or more, {n,m} between n and m",
        "<.*> on '<b>x</b>' matches the whole '<b>x</b>' (greedy)",
        "<.*?> matches '<b>' then '</b>' (non-greedy)",
      ],
    },
    {
      heading: "re Module Functions",
      content: "re.match checks only at the beginning of the string. re.search finds the first match anywhere. re.fullmatch requires the whole string to match (best for validation). re.findall returns a list of all matches (strings, or tuples if there are groups). re.finditer returns match objects one at a time. re.sub replaces matches. re.split splits by a pattern. re.compile creates a reusable pattern object for speed and readability.",
      syntax: `m = re.search(r"(\\d+)-(\\d+)", "Room 12-45")
m.group()     # '12-45'
m.group(1)    # '12'
m.groups()    # ('12', '45')
m.span()      # (5, 10)
`,
      tip: "match/search/fullmatch return None when there is no match, so always check if m: before calling m.group().",
    },
    {
      heading: "Groups, Named Groups and Flags",
      content: "Parentheses create capturing groups that extract parts of the match. Named groups (?P<name>...) let you access parts by name with m.group('name') or m.groupdict(). (?:...) groups without capturing. In re.sub you can refer to groups with \\1 or \\g<name>. Flags change behaviour: re.IGNORECASE (re.I), re.MULTILINE (re.M: ^ and $ match at each line), re.DOTALL (re.S: . matches newline), re.VERBOSE (re.X: allow spaces and comments in the pattern).",
    },
    {
      heading: "Common Mistakes",
      content: "Forgetting the raw string prefix, using match when you meant search, forgetting to escape the dot in email/domain patterns, writing greedy patterns that eat too much, and using regex where a simple str method (startswith, split, in) would be clearer.",
      points: [
        "'\\b' without r means backspace character, not word boundary",
        "re.match('cat', 'my cat') is None",
        "a.b matches 'axb' too; use a\\.b for a real dot",
        "Do not parse full HTML/JSON with regex - use proper parsers",
      ],
    },
  ],
  examples: [
    {
      title: "match vs search vs fullmatch vs findall",
      scenario: "Understand which function to use when looking for order IDs in text.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re

text = "Order ORD-1024 shipped, ORD-2048 pending"

print(re.match(r"ORD-\\d+", text))            # only at the start
print(re.search(r"ORD-\\d+", text).group())   # first anywhere
print(re.findall(r"ORD-\\d+", text))          # all matches
print(re.findall(r"ORD-(\\d+)", text))        # only the group
print(re.fullmatch(r"ORD-\\d+", "ORD-77") is not None)
print(re.fullmatch(r"ORD-\\d+", "ORD-77x"))

for m in re.finditer(r"ORD-(\\d+)", text):
    print(m.group(), m.group(1), m.span())

pattern = re.compile(r"\\b[A-Z]{3}\\b")
print(pattern.findall("Flights: DEL to BOM via goa and BLR"))
`,
      python: {
        files: {
          "main.py": `import re

text = "Order ORD-1024 shipped, ORD-2048 pending"

print(re.match(r"ORD-\\d+", text))            # only at the start
print(re.search(r"ORD-\\d+", text).group())   # first anywhere
print(re.findall(r"ORD-\\d+", text))          # all matches
print(re.findall(r"ORD-(\\d+)", text))        # only the group
print(re.fullmatch(r"ORD-\\d+", "ORD-77") is not None)
print(re.fullmatch(r"ORD-\\d+", "ORD-77x"))

for m in re.finditer(r"ORD-(\\d+)", text):
    print(m.group(), m.group(1), m.span())

pattern = re.compile(r"\\b[A-Z]{3}\\b")
print(pattern.findall("Flights: DEL to BOM via goa and BLR"))
`,
        },
      },
      result: `None
ORD-1024
['ORD-1024', 'ORD-2048']
['1024', '2048']
True
None
ORD-1024 1024 (6, 14)
ORD-2048 2048 (24, 32)
['DEL', 'BOM', 'BLR']`,
      explanation: "match() returns None because the text does not START with ORD. search() finds the first match anywhere. findall() returns all matches; with a group it returns only the group text. fullmatch() requires the entire string to match. finditer() yields match objects with group() and span(). compile() creates a reusable pattern; \\b ensures whole 3-letter uppercase words.",
    },
    {
      title: "Extracting Data with Groups and Named Groups",
      scenario: "Parse dates, emails and log lines from raw text.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re

m = re.search(r"(\\d{2})-(\\d{2})-(\\d{4})", "DOB: 15-08-1998")
print(m.group(), m.groups())
day, month, year = m.groups()
print(f"{year}/{month}/{day}")

emails = "Contact asha.rao@gmail.com, ravi_k@company.co.in or bad@email"
print(re.findall(r"[\\w.]+@[\\w-]+(?:\\.[\\w-]+)+", emails))

log = """2024-01-10 10:15:01 ERROR Disk full
2024-01-10 10:16:22 INFO Backup started
2024-01-10 10:17:45 WARNING CPU high"""
pattern = re.compile(r"^(?P<date>\\S+) (?P<time>\\S+) (?P<level>[A-Z]+) (?P<msg>.+)$", re.MULTILINE)
for m in pattern.finditer(log):
    print(m.group("level"), "|", m.group("msg"))
print(pattern.search(log).groupdict())
`,
      python: {
        files: {
          "main.py": `import re

m = re.search(r"(\\d{2})-(\\d{2})-(\\d{4})", "DOB: 15-08-1998")
print(m.group(), m.groups())
day, month, year = m.groups()
print(f"{year}/{month}/{day}")

emails = "Contact asha.rao@gmail.com, ravi_k@company.co.in or bad@email"
print(re.findall(r"[\\w.]+@[\\w-]+(?:\\.[\\w-]+)+", emails))

log = """2024-01-10 10:15:01 ERROR Disk full
2024-01-10 10:16:22 INFO Backup started
2024-01-10 10:17:45 WARNING CPU high"""
pattern = re.compile(r"^(?P<date>\\S+) (?P<time>\\S+) (?P<level>[A-Z]+) (?P<msg>.+)$", re.MULTILINE)
for m in pattern.finditer(log):
    print(m.group("level"), "|", m.group("msg"))
print(pattern.search(log).groupdict())
`,
        },
      },
      result: `15-08-1998 ('15', '08', '1998')
1998/08/15
['asha.rao@gmail.com', 'ravi_k@company.co.in']
ERROR | Disk full
INFO | Backup started
WARNING | CPU high
{'date': '2024-01-10', 'time': '10:15:01', 'level': 'ERROR', 'msg': 'Disk full'}`,
      explanation: "Each pair of parentheses captures one part, so groups() gives day, month and year. The email pattern uses a non-capturing group (?:...) so findall returns full emails; 'bad@email' is skipped because it has no dot part. Named groups (?P<name>...) let us read fields by name, and re.MULTILINE makes ^ and $ work on every line.",
    },
    {
      title: "Replacing and Splitting: sub and split",
      scenario: "Clean messy user input, mask phone numbers and reformat dates.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re

messy = "  Hello    world,   this  is   Python  "
print(re.sub(r"\\s+", " ", messy).strip())

print(re.sub(r"\\d(?=\\d{4})", "*", "Phone: 9876543210"))

print(re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", "Due 25/12/2024 and 01/01/2025"))

print(re.sub(r"(?P<word>\\b\\w+\\b) (?P=word)", r"\\g<word>", "this is is a test test"))

print(re.split(r"[,;\\s]+", "apple, banana;cherry  mango"))

print(re.sub(r"[aeiou]", lambda m: m.group().upper(), "regular expression"))

print(re.findall(r"<.*>", "<b>bold</b>"))
print(re.findall(r"<.*?>", "<b>bold</b>"))
print(re.findall(r"python", "Python PYTHON python", flags=re.I))
`,
      python: {
        files: {
          "main.py": `import re

messy = "  Hello    world,   this  is   Python  "
print(re.sub(r"\\s+", " ", messy).strip())

print(re.sub(r"\\d(?=\\d{4})", "*", "Phone: 9876543210"))

print(re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", "Due 25/12/2024 and 01/01/2025"))

print(re.sub(r"(?P<word>\\b\\w+\\b) (?P=word)", r"\\g<word>", "this is is a test test"))

print(re.split(r"[,;\\s]+", "apple, banana;cherry  mango"))

print(re.sub(r"[aeiou]", lambda m: m.group().upper(), "regular expression"))

print(re.findall(r"<.*>", "<b>bold</b>"))
print(re.findall(r"<.*?>", "<b>bold</b>"))
print(re.findall(r"python", "Python PYTHON python", flags=re.I))
`,
        },
      },
      result: `Hello world, this is Python
Phone: ******3210
Due 2024-12-25 and 2025-01-01
this is a test
['apple', 'banana', 'cherry', 'mango']
rEgUlAr ExprEssIOn
['<b>bold</b>']
['<b>', '</b>']
['Python', 'PYTHON', 'python']`,
      explanation: "\\s+ collapses multiple spaces. The lookahead (?=\\d{4}) replaces every digit that still has 4 digits after it, masking all but the last 4. \\3-\\2-\\1 reorders the date groups. (?P=word) matches a repeated word. re.split accepts several separators. re.sub can take a function. Greedy <.*> grabs everything, while non-greedy <.*?> stops at the first >. re.I ignores case.",
    },
    {
      title: "Input Validator: Email, Mobile, Password, PAN",
      scenario: "A registration form validates fields before saving the user.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import re

RULES = {
    "email": r"[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?",
    "mobile": r"[6-9]\\d{9}",
    "pincode": r"[1-9]\\d{5}",
    "pan": r"[A-Z]{5}\\d{4}[A-Z]",
}

def is_valid(kind, value):
    return re.fullmatch(RULES[kind], value) is not None

def strong_password(pw):
    checks = {
        "8+ chars": len(pw) >= 8,
        "uppercase": re.search(r"[A-Z]", pw),
        "lowercase": re.search(r"[a-z]", pw),
        "digit": re.search(r"\\d", pw),
        "special": re.search(r"[^\\w\\s]", pw),
    }
    missing = [k for k, ok in checks.items() if not ok]
    return "Strong" if not missing else "Weak: missing " + ", ".join(missing)

tests = [("email", "asha@gmail.com"), ("email", "asha@gmail"), ("mobile", "9876543210"),
         ("mobile", "1234567890"), ("pincode", "560001"), ("pan", "ABCDE1234F"), ("pan", "abcde1234f")]
for kind, value in tests:
    print(f"{kind:<8} {value:<15} {is_valid(kind, value)}")

for pw in ["hello", "Hello123", "Hello@123"]:
    print(f"{pw:<10} {strong_password(pw)}")
`,
      python: {
        files: {
          "main.py": `import re

RULES = {
    "email": r"[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?",
    "mobile": r"[6-9]\\d{9}",
    "pincode": r"[1-9]\\d{5}",
    "pan": r"[A-Z]{5}\\d{4}[A-Z]",
}

def is_valid(kind, value):
    return re.fullmatch(RULES[kind], value) is not None

def strong_password(pw):
    checks = {
        "8+ chars": len(pw) >= 8,
        "uppercase": re.search(r"[A-Z]", pw),
        "lowercase": re.search(r"[a-z]", pw),
        "digit": re.search(r"\\d", pw),
        "special": re.search(r"[^\\w\\s]", pw),
    }
    missing = [k for k, ok in checks.items() if not ok]
    return "Strong" if not missing else "Weak: missing " + ", ".join(missing)

tests = [("email", "asha@gmail.com"), ("email", "asha@gmail"), ("mobile", "9876543210"),
         ("mobile", "1234567890"), ("pincode", "560001"), ("pan", "ABCDE1234F"), ("pan", "abcde1234f")]
for kind, value in tests:
    print(f"{kind:<8} {value:<15} {is_valid(kind, value)}")

for pw in ["hello", "Hello123", "Hello@123"]:
    print(f"{pw:<10} {strong_password(pw)}")
`,
        },
      },
      result: `email    asha@gmail.com  True
email    asha@gmail      False
mobile   9876543210      True
mobile   1234567890      False
pincode  560001          True
pan      ABCDE1234F      True
pan      abcde1234f      False
hello      Weak: missing 8+ chars, uppercase, digit, special
Hello123   Weak: missing special
Hello@123  Strong`,
      explanation: "fullmatch() makes sure the whole value matches, not just a part. Indian mobile numbers start with 6-9 and have 10 digits; PAN is 5 letters, 4 digits, 1 letter (case-sensitive). The password checker uses several small searches instead of one huge unreadable pattern - a good practice for readability.",
    },
  ],
  interview: [
    {
      q: "What is a regular expression?",
      a: "A pattern that describes a set of strings, used to search, validate, extract or replace text. Python supports it through the built-in re module.",
      level: "Easy",
    },
    {
      q: "Difference between re.match(), re.search() and re.fullmatch()?",
      a: "match checks only at the start of the string, search finds the first match anywhere, fullmatch requires the entire string to match.",
      level: "Easy",
    },
    {
      q: "Why use raw strings for regex patterns?",
      a: "In normal strings backslash sequences like \\b or \\n are interpreted by Python before re sees them. r'...' passes backslashes unchanged to the regex engine.",
      level: "Medium",
    },
    {
      q: "What is the difference between greedy and non-greedy quantifiers?",
      a: "Greedy (*, +, ?) match as much as possible; non-greedy (*?, +?, ??) match as little as possible. E.g. <.*> vs <.*?> on '<a><b>'.",
      level: "Medium",
    },
    {
      q: "What does re.findall return when the pattern has groups?",
      a: "If one group, a list of the group strings; if multiple groups, a list of tuples. Without groups, a list of full matches.",
      level: "Medium",
    },
    {
      q: "What are named groups?",
      a: "Groups written as (?P<name>...) that can be accessed with m.group('name') or m.groupdict(), making patterns self-documenting.",
      level: "Medium",
    },
    {
      q: `What is the output?
import re
print(re.findall(r'\\d+', 'a1b22c333'))`,
      a: "['1', '22', '333']",
      level: "Easy",
    },
    {
      q: `What is the output?
import re
print(re.sub(r'a', 'b', 'banana', count=2))`,
      a: "bbnbna - only the first 2 'a' are replaced.",
      level: "Medium",
    },
    {
      q: "What is the use of re.compile()?",
      a: "It compiles a pattern into a reusable Pattern object, improving readability and avoiding re-parsing when the same pattern is used many times.",
      level: "Easy",
    },
    {
      q: "What are lookahead and lookbehind?",
      a: "Zero-width assertions that check context without consuming it: (?=...) positive lookahead, (?!...) negative lookahead, (?<=...) positive lookbehind, (?<!...) negative lookbehind.",
      level: "Hard",
    },
    {
      q: "What do re.MULTILINE and re.DOTALL do?",
      a: "MULTILINE makes ^ and $ match at the start/end of every line. DOTALL makes . also match newline characters.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Extract all hashtags from a tweet.",
      hint: "Pattern #\\w+",
      solution: `import re
print(re.findall(r"#\\w+", "Learning #Python and #Regex today #100DaysOfCode"))
`,
    },
    {
      task: "Validate a username: 4-16 characters, letters/digits/underscore, must start with a letter.",
      hint: "re.fullmatch(r'[A-Za-z]\\w{3,15}', name)",
      solution: `import re
for u in ["asha_01", "1asha", "ab", "Ravi_Kumar_2024"]:
    print(u, bool(re.fullmatch(r"[A-Za-z]\\w{3,15}", u)))
`,
    },
    {
      task: "Find all prices like Rs.499 or Rs.1,299 in a string and convert them to integers.",
      hint: "Capture digits and commas, then remove commas.",
      solution: `import re
text = "Shirt Rs.499, Shoes Rs.1,299, Watch Rs.12,500"
prices = [int(p.replace(",", "")) for p in re.findall(r"Rs\\.([\\d,]+)", text)]
print(prices, sum(prices))   # [499, 1299, 12500] 14298
`,
    },
    {
      task: "Convert camelCase names to snake_case.",
      hint: "Insert _ before capitals with sub and lower().",
      solution: `import re
def snake(name):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()
print(snake("firstName"), snake("totalOrderAmount"))   # first_name total_order_amount
`,
    },
    {
      task: "Count words in a paragraph ignoring punctuation and case.",
      hint: "re.findall(r'\\b\\w+\\b', text.lower()) with collections.Counter.",
      solution: `import re
from collections import Counter
text = "The cat and the hat. The END!"
print(Counter(re.findall(r"\\b\\w+\\b", text.lower())).most_common(2))   # [('the', 3), ('cat', 1)]
`,
    },
  ],
  quiz: [
    {
      question: "Which function checks for a match only at the beginning of the string?",
      options: [
        "re.search",
        "re.findall",
        "re.match",
        "re.sub",
      ],
      answer: 2,
      explanation: "re.match anchors at the start.",
    },
    {
      question: "What does \\d{3} match?",
      options: [
        "Exactly 3 digits",
        "3 or more digits",
        "Any 3 characters",
        "The letter d three times",
      ],
      answer: 0,
      explanation: "\\d is a digit and {3} means exactly three.",
    },
    {
      question: "Which pattern is non-greedy?",
      options: [
        "<.*>",
        "<.+>",
        "<.*?>",
        "<.>",
      ],
      answer: 2,
      explanation: "Adding ? after a quantifier makes it lazy.",
    },
    {
      question: "re.findall(r'(\\w)(\\d)', 'a1 b2') returns:",
      options: [
        "['a1', 'b2']",
        "[('a', '1'), ('b', '2')]",
        "['a', 'b']",
        "None",
      ],
      answer: 1,
      explanation: "With multiple groups findall returns tuples.",
    },
    {
      question: "Which flag makes ^ and $ work on every line?",
      options: [
        "re.I",
        "re.S",
        "re.X",
        "re.M",
      ],
      answer: 3,
      explanation: "re.MULTILINE (re.M).",
    },
  ],
};
