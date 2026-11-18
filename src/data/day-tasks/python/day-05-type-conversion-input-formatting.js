export default {
  lesson: 'day-05-type-conversion-input-formatting',
  minutes: 25,
  intro: 'Convert between types, read numbers with input() and split(), and format money, decimals and percentages with f-strings.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens when Python runs `int("12.5")`?',
      options: ['Returns 12', 'Returns 13', 'Raises ValueError', 'Returns 12.5'],
      answer: 2,
      explain: '`int()` can convert a string only if it looks like a **whole number**. `"12.5"` raises `ValueError: invalid literal for int()`. Use `int(float("12.5"))` → 12 (it truncates, it does not round).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `print(int(7.9))
print(float("3"))
print(bool("False"))
print(10 + 2.5)
print("5" * 3)`,
      expected: '7\n3.0\nTrue\n12.5\n555',
      explain: '`int(7.9)` **truncates** to 7. `float("3")` is 3.0. `bool("False")` is True because any non-empty string is truthy. `10 + 2.5` is implicit conversion int → float. `"5" * 3` repeats the string: input() gives strings, so forgetting to convert causes surprises like this.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the f-string so `price = 1234.5` prints as `₹1,234.50`:\n```\nprint(f"₹{price:____}")\n```',
      accept: [',.2f'],
      explain: 'Inside `{value:spec}`, `,` adds thousands separators and `.2f` means fixed-point with 2 decimals. Order matters: `,.2f` (comma first). `.2f` alone gives `1234.50`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Simple interest calculator. Read **three lines** with `input()` (no prompt text): principal, rate (% per year) and time (years). Print\n```\nSimple Interest: <si>\n```\nwith exactly 2 decimals, where `si = principal * rate * time / 100`.\n\nTest input: `10000`, `6.5`, `2` → `Simple Interest: 1300.00`',
      example: { title: 'reading a number', code: 'qty = int(input())        # "3" -> 3\nrate = float(input())     # "49.5" -> 49.5\nprint(f"{qty * rate:.2f}")' },
      stdin: '10000\n6.5\n2',
      starter: `# TODO: read principal, rate and time and convert them
# TODO: calculate and print the simple interest
`,
      solution: `p = float(input())
r = float(input())
t = float(input())
si = p * r * t / 100
print(f"Simple Interest: {si:.2f}")`,
      tests: [{ stdout: 'Simple Interest: 1300.00' }],
      explain: '`input()` always returns a **str**, so convert with `float()` before doing maths; `"10000" * ...` would fail or repeat text. `:.2f` formats to exactly two decimals (1300.0 → 1300.00).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Read the marks of a student in **three subjects on one line** separated by spaces (e.g. `78 85 92`). Print two lines:\n```\nTotal: 255\nPercentage: 85.0%\n```\nPercentage = total / 300 * 100, shown with 1 decimal. Use `input()` without a prompt.',
      example: { title: 'split() + map()', code: 'a, b = map(int, input().split())   # "4 6" -> a=4, b=6\nprint(a + b)' },
      stdin: '78 85 92',
      starter: `# TODO: read the three marks from one line
# TODO: print total and percentage
`,
      solution: `m1, m2, m3 = map(int, input().split())
total = m1 + m2 + m3
print(f"Total: {total}")
print(f"Percentage: {total / 300 * 100:.1f}%")`,
      tests: [{ stdout: 'Total: 255\nPercentage: 85.0%' }],
      explain: '`input().split()` turns "78 85 92" into `["78", "85", "92"]`; `map(int, ...)` converts each to int. Without converting, `+` would join strings ("788592"). `:.1f` keeps one decimal. (You could also use `{total/300:.1%}`, which multiplies by 100 for you.)',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Three formatting styles. What is printed?',
      code: `name, marks = "Ravi", 91.456
print(f"{name} scored {marks:.1f}")
print("{} scored {:.0f}".format(name, marks))
print("%s scored %d" % (name, marks))`,
      expected: 'Ravi scored 91.5\nRavi scored 91\nRavi scored 91',
      explain: 'f-strings and `str.format()` share the same format spec: `.1f` rounds to 91.5, `.0f` rounds to 91. In old `%` formatting, `%d` converts to int (truncates) → 91. Prefer f-strings in new code.',
    },
  ],
};
