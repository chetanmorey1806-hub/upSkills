export default {
  lesson: 'extra-02-walrus-operator-advanced-fstrings',
  minutes: 25,
  intro: 'Use the walrus operator := where it helps and master f-string format specs: width, alignment, fill, grouping, precision, percentages and {x=}.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line is a **SyntaxError**?',
      options: ['`if (n := len(items)) > 3: print(n)`', '`while (line := input()) != "q": ...`', '`x := 5` (as a statement on its own line)', '`[y for v in data if (y := v * 2) > 4]`'],
      answer: 2,
      explain: 'An unparenthesised walrus is not allowed as a top-level statement: write `x = 5` there. The walrus is meant for **expressions** (if/while conditions, comprehensions). Note also the parentheses in `(n := len(items)) > 3`; without them n would get the boolean result of the comparison.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed? (spaces matter, the `|` show the edges)',
      code: `name = "Asha"
amount = 1234567.891
print(f"|{name:<6}|{name:>6}|{name:*^8}|")
print(f"{amount:,.2f}")
print(f"{42:05}")
print(f"{0.256:.1%}")`,
      expected: '|Asha  |  Asha|**Asha**|\n1,234,567.89\n00042\n25.6%',
      explain: '`<` left-aligns, `>` right-aligns, `^` centres and the character before it is the fill. `,` adds thousands separators and `.2f` rounds to 2 decimals. `05` zero-pads to width 5. `%` multiplies by 100 and adds the percent sign.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You want to print `marks=87` for debugging using a single f-string with the self-documenting feature (variable is `marks`). Write the f-string.',
      accept: ['f"{marks=}"', "f'{marks=}'", 'print(f"{marks=}")', "print(f'{marks=}')"],
      explain: '`f"{marks=}"` prints the expression text, an equals sign and the repr of the value: `marks=87`. For strings the value is shown with quotes because `=` uses `repr` by default.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `read_until_stop()` that keeps reading lines with `input()` and returns the **list of lines** read before the line `"stop"`. Use a `while` loop with the **walrus operator**.\n\nThe test feeds: `apple`, `mango`, `stop`, `grapes`.',
      example: { title: 'walrus in a while loop', code: 'total = 0\nwhile (n := int(input())) != 0:\n    total += n' },
      starter: 'def read_until_stop():\n    items = []\n    # TODO: while (line := input()) != "stop": ...\n    return items\n',
      solution: 'def read_until_stop():\n    items = []\n    while (line := input()) != "stop":\n        items.append(line)\n    return items\n',
      stdin: 'apple\nmango\nstop\ngrapes',
      tests: [
        { call: 'read_until_stop()', expect: ['apple', 'mango'] },
      ],
      explain: 'The walrus assigns `line` and the comparison uses it in the same expression, so you do not need to call `input()` twice (once before the loop and once at the end). Do not forget the parentheses around `line := input()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `bill_line(item, qty, price)` that returns ONE formatted line for a shop bill:\n- item left-aligned in **12** characters\n- qty right-aligned in **3**\n- line total (qty × price) right-aligned in **10** with thousands separator and **2 decimals**\n\nParts are separated by single spaces. Example: `bill_line("Rice", 2, 1250.5)` → `"Rice           2   2,501.00"`',
      example: { title: 'format spec pieces', code: 'f"{\'Tea\':<8}|"      # "Tea     |"\nf"{7:>4}"           # "   7"\nf"{98765.4:>12,.2f}" # "   98,765.40"' },
      starter: 'def bill_line(item, qty, price):\n    total = qty * price\n    # TODO: return an f-string with widths 12, 3, 10\n    return f"{item} {qty} {total}"\n',
      solution: 'def bill_line(item, qty, price):\n    total = qty * price\n    return f"{item:<12} {qty:>3} {total:>10,.2f}"\n',
      tests: [
        { call: 'bill_line("Rice", 2, 1250.5)', expect: 'Rice           2   2,501.00' },
        { call: 'bill_line("Pen", 10, 9.99)', expect: 'Pen           10      99.90' },
        { call: 'bill_line("Laptop", 1, 56999)', expect: 'Laptop         1  56,999.00' },
      ],
      explain: 'The spec order is `[fill][align][width][,][.precision][type]`, e.g. `>10,.2f`. Numbers are right-aligned by default and strings left-aligned, but writing `<` and `>` makes your intent clear. A common mistake is `.2f,` (wrong order) which is a ValueError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `big_squares(nums, limit)` that returns a list of `n * n` for each n in nums **only when** the square is greater than `limit`. Use a list comprehension with the walrus so the square is computed once per item.',
      example: { title: 'walrus inside a comprehension', code: 'clean = [s for w in words if (s := w.strip())]' },
      starter: 'def big_squares(nums, limit):\n    # TODO\n    return []\n',
      solution: 'def big_squares(nums, limit):\n    return [sq for n in nums if (sq := n * n) > limit]\n',
      tests: [
        { call: 'big_squares([1, 2, 3, 4, 5], 8)', expect: [9, 16, 25] },
        { call: 'big_squares([-6, 1, 2], 10)', expect: [36] },
        { call: 'big_squares([], 0)', expect: [] },
        { call: 'big_squares([3], 9)', expect: [], msg: '9 is not greater than 9' },
      ],
      explain: '`(sq := n * n) > limit` stores the square in `sq`, which the output expression then reuses. Without the walrus you would write `[n*n for n in nums if n*n > limit]` and compute every square twice.',
    },
  ],
};
