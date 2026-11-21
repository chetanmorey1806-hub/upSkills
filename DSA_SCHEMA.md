# DSA practice problems: file format

One file per pattern group: `src/data/dsa/<group>.js`, plain ES module, no imports:

```js
export default [
  {
    id: 'two-sum',                       // unique across ALL files, kebab-case
    title: 'Two Sum',
    diff: 'Easy',                        // 'Easy' | 'Medium' | 'Hard'
    pattern: 'Arrays & Hashing',         // exactly one of the pattern names given in your brief
    companies: ['Amazon', 'TCS', 'Infosys'],   // companies known to ask this kind of problem (Indian service + product companies); 1-4
    statement: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`...',  // clear, self-contained; `code` and **bold** allowed
    examples: [ { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explain: 'nums[0] + nums[1] = 9' } ],   // 2-3
    constraints: ['2 <= nums.length <= 10^4', 'Exactly one valid answer exists'],
    hints: ['hint 1 (gentle)', 'hint 2 (stronger)'],
    approach: 'Explain the optimal approach in simple English (4-8 sentences), then the brute force and why it is slower.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'two_sum', js: 'twoSum' },  // function names
    py: { starter: 'def two_sum(nums, target):\n    # write your code here\n    pass\n', solution: 'def two_sum(nums, target):\n    seen = {}\n    ...' },
    js: { starter: 'function twoSum(nums, target) {\n  // write your code here\n}\n', solution: 'function twoSum(nums, target) {\n  ...\n}\n' },
    tests: [ { args: [[2, 7, 11, 15], 9], expect: [0, 1] }, ... ],   // 6-10 tests incl. edge cases; args/expect are JSON values shared by BOTH languages
  },
];
```

Rules
- Inputs and outputs must be plain JSON: numbers, strings, booleans, null, arrays and objects. Do not use linked-list or tree node classes.
  - Trees are given as a level-order array with null for missing nodes, if needed.
  - Graphs are given as edge lists or adjacency lists.
- The answer must be DETERMINISTIC. If several answers are valid, the statement must say which one to return, for example "return the indices in increasing order" or "return the list sorted". Otherwise the test cannot compare it.
- Floats: avoid them, or say "round to 2 decimals" and return the rounded number.
- Python grader:
  - Tuples become lists. Sets become sorted lists. Dict keys become strings. `True`/`False`/`None` are JSON true/false/null.
  - The solution must return a list, not a tuple, when a list is expected. Never print; return the value.
- JS grader: deep-equal of the returned value with `expect`.
- Starters must FAIL the tests: they return nothing.
- Solutions must be correct and optimal. Use only the standard library (Python: collections, heapq and bisect are fine).
- Test calls are generated as `fn(arg1, arg2, ...)`:
  - Python call: the JSON literal is converted, so true→True, false→False, null→None.
  - JS call: the args are JSON.stringify'd.
- Validate EVERY solution in BOTH languages against EVERY test with real `node` and `python3` before finishing. Also check that the starters fail.
