export default {
  lesson: 'day-01-big-o-time-space-complexity',
  minutes: 30,
  intro: 'Analyse time and space complexity: drop constants, spot O(1) to O(2^n) patterns, know the cost of Python operations, and turn an O(n^2) solution into O(n).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the Big-O of `5n^2 + 300n + 9000`?',
      options: ['O(5n^2)', 'O(n^2)', 'O(n^2 + n)', 'O(9000)'],
      answer: 1,
      explain: 'Big-O describes growth for large n: drop **constants** (5) and **lower-order terms** (300n, 9000). For big inputs the n^2 term dominates everything else.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the time complexity of this code?\n```\ni = 1\nwhile i < n:\n    i *= 2\n```',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 1,
      explain: 'i doubles every step: 1, 2, 4, 8, ... so it reaches n after about log2(n) steps. Halving or doubling the problem each step is the signature of **O(log n)**, like binary search.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these Python operations are **O(n)** (n = size of the collection)? (choose all that apply)',
      options: ['`x in my_list`', '`x in my_set`', '`my_list.insert(0, x)`', '`my_list.append(x)`', '`my_dict[key]`', '`my_list.pop(0)`', '`my_list[a:b]` copying all n items'],
      answers: [0, 2, 5, 6],
      explain: 'Searching a list, inserting/removing at the front (everything shifts) and slicing (copies items) are O(n). Set/dict lookups are O(1) on average thanks to hashing, and `append` is amortized O(1).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'This function counts its own steps. What is printed?',
      code: `def steps(n):
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            count += 1
    return count

print(steps(4), steps(10), steps(100))`,
      expected: '6 45 4950',
      explain: 'The inner loop runs (n-1) + (n-2) + ... + 0 = n(n-1)/2 times: 6, 45 and 4950. That is about n^2/2, which is still **O(n^2)** because constants like 1/2 are dropped.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `has_duplicate(nums)` that returns True if any value appears twice. It must be **O(n)** time: use a set (no nested loops, no sorting).',
      example: { title: 'set membership is O(1)', code: 'seen = set()\nfor city in ["Pune", "Goa", "Pune"]:\n    if city in seen:\n        print("repeat:", city)\n    seen.add(city)' },
      starter: 'def has_duplicate(nums):\n    seen = set()\n    # TODO: one pass over nums\n    return False\n',
      solution: 'def has_duplicate(nums):\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False\n',
      tests: [
        { call: 'has_duplicate([3, 1, 4, 1, 5])', expect: true },
        { call: 'has_duplicate([1, 2, 3])', expect: false },
        { call: 'has_duplicate([])', expect: false },
        { call: 'has_duplicate([7])', expect: false },
        { call: 'has_duplicate(list(range(1000)) + [999])', expect: true },
        { call: 'has_duplicate(["a", "b", "A"])', expect: false },
      ],
      explain: 'Nested loops compare every pair: O(n^2), about 20 billion comparisons for 200,000 items. A set remembers what we have seen with O(1) lookups, so one pass is enough: **O(n) time, O(n) space**. This "trade memory for time" idea appears in many problems.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `range_sum(n)` that returns 1 + 2 + ... + n in **O(1)** time (use the formula, no loop). Then write `prefix_sums(nums)` that returns a list where item i is the sum of `nums[0..i]`, in **O(n)** (do not call `sum()` inside a loop).',
      example: { title: 'running total', code: 'total = 0\nfor x in [5, 1, 2]:\n    total += x\n    print(total)   # 5, 6, 8' },
      starter: 'def range_sum(n):\n    # TODO: O(1)\n    return 0\n\ndef prefix_sums(nums):\n    # TODO: O(n)\n    return []\n',
      solution: 'def range_sum(n):\n    return n * (n + 1) // 2\n\ndef prefix_sums(nums):\n    out, total = [], 0\n    for x in nums:\n        total += x\n        out.append(total)\n    return out\n',
      tests: [
        { call: 'range_sum(10)', expect: 55 },
        { call: 'range_sum(0)', expect: 0 },
        { call: 'range_sum(1000000)', expect: 500000500000 },
        { call: 'prefix_sums([3, 1, 4, 1, 5])', expect: [3, 4, 8, 9, 14] },
        { call: 'prefix_sums([])', expect: [] },
      ],
      explain: 'Gauss\'s formula n(n+1)/2 does a constant amount of work for any n. For prefix sums, `sum(nums[:i+1])` inside a loop is O(n^2) (each sum and slice is O(n)); carrying a running total makes it O(n). Use `//` so the result stays an int.',
    },
  ],
};
