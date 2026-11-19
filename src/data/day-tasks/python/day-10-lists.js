export default {
  lesson: 'day-10-lists',
  minutes: 30,
  intro: 'Create and change lists with list methods, avoid the sort()/None and aliasing traps, and work with a 2D marks table.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `nums = [3, 1, 2]
result = nums.sort()
print(result)
print(nums)
a = [1, 2]
a.append([3, 4])
print(a, len(a))
b = [1, 2]
b.extend([3, 4])
print(b, len(b))`,
      expected: 'None\n[1, 2, 3]\n[1, 2, [3, 4]] 3\n[1, 2, 3, 4] 4',
      explain: '`sort()` sorts **in place** and returns `None` (use `sorted(nums)` for a new list). `append` adds its argument as ONE item (a nested list), while `extend` adds each item separately.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '```\nmarks = [70, 80]\nbackup = marks\nbackup.append(90)\nprint(marks)\n```\nWhat is printed?',
      options: ['[70, 80]', '[70, 80, 90]', '[90]', 'Error'],
      answer: 1,
      explain: '`backup = marks` does **not** copy: both names point to the same list (aliasing). Changing one changes "both". Use `backup = marks.copy()` (or `marks[:]`, `list(marks)`) for a real copy.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these **change the original list** `items` in place? (select all that apply)',
      options: ['items.sort()', 'sorted(items)', 'items.reverse()', 'items[::-1]', 'items.pop()', 'del items[0]'],
      answers: [0, 2, 4, 5],
      explain: 'Methods like `sort`, `reverse`, `pop` and the `del` statement modify the list itself. `sorted(items)` and the slice `items[::-1]` return **new** lists and leave `items` unchanged.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Shopping cart. Starting from `cart = ["rice", "dal"]`, use list methods to:\n1. add `"oil"` at the end\n2. insert `"sugar"` at the **start**\n3. remove `"dal"`\n\nThen print the cart. Expected: `[\'sugar\', \'rice\', \'oil\']`',
      example: { title: 'list methods', code: 'bag = ["pen"]\nbag.append("book")      # [\'pen\', \'book\']\nbag.insert(0, "bag")    # [\'bag\', \'pen\', \'book\']\nbag.remove("pen")       # [\'bag\', \'book\']' },
      starter: `cart = ["rice", "dal"]
# TODO: append, insert, remove
print(cart)`,
      solution: `cart = ["rice", "dal"]
cart.append("oil")
cart.insert(0, "sugar")
cart.remove("dal")
print(cart)`,
      tests: [{ stdout: "['sugar', 'rice', 'oil']" }, { call: 'cart', expect: ['sugar', 'rice', 'oil'] }],
      explain: '`append(x)` adds at the end, `insert(i, x)` adds before index i, `remove(x)` deletes the first matching **value** (use `pop(i)` to delete by index). Writing `cart = cart.append("oil")` sets cart to None.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Read prices on one line separated by spaces (no prompt), e.g. `250 99 480 120 75`. Print:\n```\nTop 3: [480, 250, 120]\nCheapest: 75\nCount: 5\n```\nThe original order of `prices` must stay unchanged (keep a list named `prices`).',
      example: { title: 'sorted() vs sort()', code: 'nums = [4, 9, 1]\ntop = sorted(nums, reverse=True)   # [9, 4, 1], nums unchanged\nprint(top[:2])                      # [9, 4]' },
      stdin: '250 99 480 120 75',
      starter: `prices = list(map(int, input().split()))
# TODO: print top 3, cheapest and count
`,
      solution: `prices = list(map(int, input().split()))
top3 = sorted(prices, reverse=True)[:3]
print("Top 3:", top3)
print("Cheapest:", min(prices))
print("Count:", len(prices))`,
      tests: [{ stdout: 'Top 3: [480, 250, 120]\nCheapest: 75\nCount: 5' }, { call: 'prices', expect: [250, 99, 480, 120, 75], msg: '`prices` must keep its original order (use sorted(), not sort())' }],
      explain: '`sorted(..., reverse=True)` returns a new descending list, and `[:3]` slices the first three. `min()` and `len()` are built-ins that work on any list. Using `prices.sort()` would reorder the original list.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Marks table (2D list). Each inner list is one student’s marks in 3 subjects:\n```\nmarks = [[78, 85, 90], [60, 72, 58], [88, 94, 91]]\n```\nPrint the **total of each student** on its own line, then the **highest mark in subject 2** (the middle column):\n```\n253\n190\n273\nBest in subject 2: 94\n```',
      example: { title: 'nested list access', code: 'grid = [[1, 2], [3, 4]]\nprint(grid[1][0])        # 3 (row 1, column 0)\nfor row in grid:\n    print(sum(row))' },
      starter: `marks = [[78, 85, 90], [60, 72, 58], [88, 94, 91]]
# TODO: total per student
# TODO: best mark in the middle column
`,
      solution: `marks = [[78, 85, 90], [60, 72, 58], [88, 94, 91]]
for row in marks:
    print(sum(row))
best = marks[0][1]
for row in marks:
    if row[1] > best:
        best = row[1]
print("Best in subject 2:", best)`,
      tests: [{ stdout: '253\n190\n273\nBest in subject 2: 94' }],
      explain: 'Looping over a 2D list gives one **row** (inner list) at a time. Column 2 is index **1** in every row: `row[1]`. Using `marks[1]` would give the second student’s row instead of the second column.',
    },
  ],
};
