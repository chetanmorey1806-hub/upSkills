export default {
  lesson: 'day-15-pattern-programs-practice',
  minutes: 35,
  intro: 'Design patterns with the rows-and-columns method and solve classic data-structure problems like first unique character and run-length encoding.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You must check again and again whether a roll number has already been marked present among 10,000 students. Which data structure gives the fastest check?',
      options: ['list', 'tuple', 'set', 'string'],
      answer: 2,
      explain: '`x in some_set` is O(1) on average because sets use hashing; `x in some_list` checks items one by one (O(n)). Use a dict if you also need a value per key.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What pattern is printed?',
      code: `n = 4
for i in range(1, n + 1):
    print(" ".join(str(j) for j in range(i, 0, -1)))`,
      expected: '1\n2 1\n3 2 1\n4 3 2 1',
      explain: 'Row `i` prints numbers from i **down to** 1 (`range(i, 0, -1)` stops before 0). Rows-and-columns method: the outer loop is the row, the inner range decides what each row contains.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Pyramid. Read `n` (no prompt) and print a centred star pyramid of `n` rows. For `n = 4`:\n```\n   *\n  ***\n *****\n*******\n```\nRow i (1-based) has `n - i` leading spaces and `2*i - 1` stars (trailing spaces do not matter).',
      example: { title: 'string repetition', code: 'print(" " * 3 + "#" * 2)   # "   ##"' },
      stdin: '4',
      starter: `n = int(input())
# TODO
`,
      solution: `n = int(input())
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))`,
      tests: [{ stdout: '   *\n  ***\n *****\n*******' }],
      explain: 'Work out spaces and stars per row first (a small table: row 1 → 3 spaces, 1 star; row 2 → 2 spaces, 3 stars...), then turn the table into formulas. `" " * k` repeats a string k times.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Floyd’s triangle. Read `n` and print `n` rows of consecutive numbers separated by single spaces. For `n = 4`:\n```\n1\n2 3\n4 5 6\n7 8 9 10\n```',
      example: { title: 'a counter that continues across rows', code: 'num = 1\nfor row in range(2):\n    for col in range(3):\n        print(num, end=" ")\n        num += 1\n    print()' },
      stdin: '4',
      starter: `n = int(input())
num = 1
# TODO
`,
      solution: `n = int(input())
num = 1
for i in range(1, n + 1):
    row = []
    for j in range(i):
        row.append(str(num))
        num += 1
    print(" ".join(row))`,
      tests: [{ stdout: '1\n2 3\n4 5 6\n7 8 9 10' }],
      explain: 'Row i has i numbers, and the counter `num` is created **outside** both loops so it keeps increasing across rows. Resetting it inside the outer loop would print 1, 1 2, 1 2 3...',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'First non-repeating character. Read a word and print the first character that appears **exactly once**, or `None` if there is none.\n\nTest input: `swiss` → `w`',
      example: { title: 'count first, then scan', code: 'counts = {}\nfor ch in "hello":\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts["l"])   # 2' },
      stdin: 'swiss',
      starter: `word = input()
# TODO
`,
      solution: `word = input()
counts = {}
for ch in word:
    counts[ch] = counts.get(ch, 0) + 1
answer = None
for ch in word:
    if counts[ch] == 1:
        answer = ch
        break
print(answer)`,
      tests: [{ stdout: 'w' }],
      explain: 'Two passes: first count every character with a dict, then scan the word **in order** and stop at the first count of 1. Using a set loses order; calling `word.count(ch)` inside the loop works but is O(n²).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Run-length encoding. Read a string and compress runs of the same character as character + count.\n\nTest input: `aaabbcdddd` → `a3b2c1d4`',
      example: { title: 'compare with the previous character', code: 's = "aab"\nfor i in range(1, len(s)):\n    print(s[i], "same" if s[i] == s[i - 1] else "new")' },
      stdin: 'aaabbcdddd',
      starter: `s = input()
# TODO
`,
      solution: `s = input()
result = ""
count = 1
for i in range(1, len(s) + 1):
    if i < len(s) and s[i] == s[i - 1]:
        count += 1
    else:
        result += s[i - 1] + str(count)
        count = 1
print(result)`,
      tests: [{ stdout: 'a3b2c1d4' }],
      explain: 'Keep a counter while the character equals the previous one; when it changes, append "char + count" and reset. The typical bug is forgetting the **last** run (here `d4`): handle it after the loop or loop one step past the end as in the solution.',
    },
  ],
};
