export default {
  lesson: 'day-04-variables-and-data-types',
  minutes: 20,
  intro: 'Create variables, check types with type() and isinstance(), swap values and spot truthy/falsy and float surprises.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `type(10 / 2)` return?',
      options: ["<class 'int'>", "<class 'float'>", "<class 'complex'>", "<class 'str'>"],
      answer: 1,
      explain: 'The `/` operator always returns a **float** in Python 3, so `10 / 2` is `5.0`. Use `//` if you want an int result.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `x = 5
x = "five"
print(type(x))
print(True + True)
print(0.1 + 0.2 == 0.3)
print(type(None))`,
      expected: "<class 'str'>\n2\nFalse\n<class 'NoneType'>",
      explain: '**Dynamic typing**: the same name can point to a new object of a different type, so `x` is now a str. `bool` is a subclass of int (True = 1), so `True + True` is 2. Floats are stored in binary, so `0.1 + 0.2` is `0.30000000000000004`, not exactly 0.3. `None` has its own type, `NoneType`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these values are **falsy** (behave like False in an `if`)? (select all that apply)',
      options: ['0', '"0"', '""', 'None', '0.0', '" "', '[]'],
      answers: [0, 2, 3, 4, 6],
      explain: 'Falsy values: `0`, `0.0`, `""` (empty string), `None`, and empty containers like `[]`. The strings `"0"` and `" "` are NOT empty, so they are **truthy**: a classic trap when checking user input.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the check so it prints `True`:\n```\nage = 25\nprint(isinstance(age, ____))\n```',
      accept: ['int'],
      explain: '`isinstance(value, type)` returns True when the value is of that type. `25` is an `int`. Note: it is the type name `int`, not the string `"int"`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 3,
      q: 'Swap the values of `a` and `b` **without typing the numbers again**, so the program prints `20 10`.',
      example: { title: 'multiple assignment', code: 'x, y = 1, 2      # x = 1, y = 2 in one line\nprint(x, y)' },
      starter: `a = 10
b = 20
# TODO: swap a and b
print(a, b)`,
      solution: `a = 10
b = 20
a, b = b, a
print(a, b)`,
      tests: [{ stdout: '20 10' }],
      explain: '`a, b = b, a` builds the tuple `(20, 10)` first and then unpacks it, so no temporary variable is needed. Writing `a = b` then `b = a` fails: after the first line both are 20.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Create a student profile with these variables and values:\n- `name` = `"Asha"`\n- `age` = `21`\n- `cgpa` = `8.7`\n- `is_placed` = `False`\n- `mentor` = `None`\n\nThen print the **type** of each variable, one per line, in the same order.',
      example: { title: 'checking a type', code: 'city = "Pune"\nprint(type(city))   # <class \'str\'>' },
      starter: `# TODO: create the five variables
# TODO: print type() of each one
`,
      solution: `name = "Asha"
age = 21
cgpa = 8.7
is_placed = False
mentor = None
print(type(name))
print(type(age))
print(type(cgpa))
print(type(is_placed))
print(type(mentor))`,
      tests: [
        { stdout: "<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>\n<class 'NoneType'>" },
        { call: 'name', expect: 'Asha', msg: 'name must be "Asha"' },
        { call: 'cgpa', expect: 8.7, msg: 'cgpa must be 8.7' },
        { call: 'is_placed is False and mentor is None', expect: true, msg: 'is_placed must be False and mentor must be None' },
      ],
      explain: 'Python works out the type from the value: quotes → str, whole number → int, decimal point → float, `True/False` → bool (capital T/F!) and `None` → NoneType. Writing `"False"` in quotes would make it a str, and `false` (lowercase) is a NameError.',
    },
  ],
};
