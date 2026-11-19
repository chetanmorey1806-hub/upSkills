export default {
  lesson: 'day-06-operators',
  minutes: 25,
  intro: 'Use arithmetic, comparison, logical, identity, membership and bitwise operators, including the tricky // and % with negatives.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `print(-7 // 2)
print(-7 % 3)
print(2 ** 3 ** 2)
print(10 > 5 > 2)
print(0 or "default")`,
      expected: '-4\n2\n512\nTrue\ndefault',
      explain: '`//` floors towards minus infinity, so -3.5 becomes **-4** (not -3). `%` takes the sign of the divisor: -7 = 3 × (-3) + 2. `**` is right-associative: `3 ** 2` first, then `2 ** 9` = 512. Chained comparison means `10 > 5 and 5 > 2`. `or` returns the first truthy operand, here "default".',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '```\na = [1, 2]\nb = [1, 2]\nprint(a == b, a is b)\n```\nWhat is printed?',
      options: ['True True', 'True False', 'False False', 'False True'],
      answer: 1,
      explain: '`==` compares **values** (both lists contain 1, 2 → True). `is` compares **identity** (are they the same object in memory?). Two separate list literals create two objects → False. Use `is` only for `None`, `True`, `False`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the value of `5 & 3`? (5 = 0b101, 3 = 0b011)',
      options: ['8', '7', '1', '6'],
      answer: 2,
      explain: '`&` keeps a bit only where **both** numbers have 1: 101 & 011 = 001 = **1**. `5 | 3` would be 7 (either has 1) and `5 ^ 3` would be 6 (exactly one has 1). Do not confuse `&` with the logical `and`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the **walrus** operator so the length is stored in `n` and tested in one line:\n```\nname = "Venkatesh"\nif (n ____ len(name)) > 5:\n    print(n, "letters")\n```',
      accept: [':='],
      explain: '`:=` (walrus, Python 3.8+) assigns a value **inside an expression**. A plain `=` is not allowed inside an `if` condition and gives a SyntaxError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Read a **4-digit** number with `input()` (no prompt). Using only `//` and `%` (no strings, no loops), print:\n```\nLast digit: 9\nFirst digit: 4\nSum of digits: 22\n```\n(The test number is `4729`.)',
      example: { title: 'digit tricks', code: 'n = 853\nprint(n % 10)        # 3  (last digit)\nprint(n // 10)       # 85 (drop the last digit)\nprint(n // 10 % 10)  # 5  (middle digit)' },
      stdin: '4729',
      starter: `n = int(input())
# TODO: print last digit, first digit and sum of digits
`,
      solution: `n = int(input())
d4 = n % 10
d3 = n // 10 % 10
d2 = n // 100 % 10
d1 = n // 1000
print("Last digit:", d4)
print("First digit:", d1)
print("Sum of digits:", d1 + d2 + d3 + d4)`,
      tests: [{ stdout: 'Last digit: 9\nFirst digit: 4\nSum of digits: 22' }],
      explain: '`n % 10` gives the last digit, `n // 10` removes it. For a 4-digit number, `n // 1000` is the first digit. Using `/` instead of `//` gives floats like 4.729 and breaks the result.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Scholarship check. Read **age**, **percentage** and **city** on three lines (no prompts). Store in `eligible` the result of this rule and print it:\n- age between 18 and 25 (both included), **and**\n- percentage at least 60, **and**\n- city is one of `"Pune"`, `"Mumbai"`, `"Nagpur"` (use `in`)\n\nTest input: `21`, `72.5`, `Pune` → `True`',
      example: { title: 'chained comparison and in', code: 'temp = 30\nprint(20 <= temp <= 35)            # True\nprint("Goa" in ["Goa", "Delhi"])     # True' },
      stdin: '21\n72.5\nPune',
      starter: `age = int(input())
pct = float(input())
city = input()
eligible = None  # TODO: write the rule
print(eligible)`,
      solution: `age = int(input())
pct = float(input())
city = input()
eligible = 18 <= age <= 25 and pct >= 60 and city in ["Pune", "Mumbai", "Nagpur"]
print(eligible)`,
      tests: [{ stdout: 'True' }, { call: 'eligible', expect: true, msg: '`eligible` must be the boolean True for this input' }],
      explain: '`18 <= age <= 25` is a chained comparison; `and` needs all parts to be True; `in` checks membership in the list. A common mistake is `city == "Pune" or "Mumbai"`, which is always truthy because `"Mumbai"` alone is a non-empty string.',
    },
  ],
};
