export default {
  lesson: 'day-03-syntax-indentation-comments-print',
  minutes: 20,
  intro: 'Fix indentation, recognise keywords and valid identifiers, and control print() output with sep and end.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does Python use to decide which lines belong inside an `if` block?',
      options: ['Curly braces { }', 'The keyword end', 'Indentation (spaces at the start of the line)', 'Semicolons'],
      answer: 2,
      explain: 'Python uses **indentation** (4 spaces by convention) to form blocks; the line before the block ends with a colon `:`. Missing or mixed indentation gives `IndentationError`. Braces are used in C/Java/JavaScript, not Python.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid** Python identifiers (variable names)? (select all that apply)',
      options: ['student_name', '2nd_rank', 'total-marks', '_count', 'class', 'marksOf2024'],
      answers: [0, 3, 5],
      explain: 'Identifiers may contain letters, digits and `_` but **cannot start with a digit** (`2nd_rank`), cannot contain `-` (`total-marks` is read as total minus marks) and cannot be a **keyword** (`class`). PEP 8 prefers snake_case like `student_name`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `print("a", "b", "c", sep="-")
print("Loading", end="...")
print("done")
print(10, 5, 2026, sep="/")`,
      expected: 'a-b-c\nLoading...done\n10/5/2026',
      explain: '`sep` is placed **between** the arguments (default is a space). `end` is printed **after** the last argument instead of the default newline, so the next print continues on the same line: `Loading...done`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line so it prints `Python|Java|C++`:\n```\nprint("Python", "Java", "C++", ____)\n```',
      accept: ['sep="|"', "sep='|'"],
      explain: '`sep="|"` puts `|` between every pair of arguments. Writing `end="|"` would put it only at the end (`Python Java C++|`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'This program has **indentation errors** and does not run. Fix it so that it prints:\n```\nWelcome Asha\nYou passed\nResult printed\n```\nKeep the comment lines (comments are ignored by Python).',
      example: { title: 'a correctly indented block', code: 'if 10 > 5:\n    # inside the block: 4 spaces\n    print("ten is bigger")\nprint("outside the block")' },
      starter: `# Result program
print("Welcome Asha")
  marks = 72
if marks >= 35:
print("You passed")
print("Result printed")`,
      solution: `# Result program
print("Welcome Asha")
marks = 72
if marks >= 35:
    print("You passed")
print("Result printed")`,
      tests: [{ stdout: 'Welcome Asha\nYou passed\nResult printed' }],
      explain: 'Top-level statements must start at column 0 (`marks = 72` had stray spaces → "unexpected indent"). The body of `if ...:` must be indented (→ "expected an indented block"). The last print is outside the if, so it stays at column 0.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Using `sep` and `end`, print exactly:\n```\n18-11-2026\nItems: pen, book, bag\n```\nRules: the first line must come from `print(18, 11, 2026, ...)`, and the second line from **two** print calls: `print("Items:", ...)` and `print("pen", "book", "bag", ...)`.',
      example: { title: 'sep and end together', code: 'print("Total", end=": ")\nprint(1, 2, 3, sep="+")\n# Total: 1+2+3' },
      starter: `# TODO line 1: print(18, 11, 2026, ...)
# TODO line 2: print("Items:", ...) and print("pen", "book", "bag", ...)
`,
      solution: `print(18, 11, 2026, sep="-")
print("Items:", end=" ")
print("pen", "book", "bag", sep=", ")`,
      tests: [{ stdout: '18-11-2026\nItems: pen, book, bag' }],
      explain: '`sep="-"` joins 18, 11, 2026 with dashes. `end=" "` stops the newline after "Items:" so the next print continues on the same line, and `sep=", "` puts a comma and space between the items.',
    },
  ],
};
