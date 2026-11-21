export default [
  {
    id: 'sq-valid-parentheses',
    title: 'Valid Parentheses',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['TCS', 'Infosys', 'Amazon', 'Microsoft'],
    statement: "Given a string `s` made only of the characters `()[]{}`, return `true` if the brackets are **balanced**: every opening bracket is closed by the same type, and brackets close in the correct order.",
    examples: [
      { input: 's = "{[()]}"', output: 'true' },
      { input: 's = "([)]"', output: 'false', explain: 'The ] closes a ( .' },
      { input: 's = "(("', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's contains only ()[]{}'],
    hints: ['The most recent unmatched opening bracket must be closed first.', 'Push openings on a stack; on a closing bracket, the top must be its partner.'],
    approach: "Use a stack of opening brackets. Push every opening bracket. For a closing bracket, the stack must be non-empty and its top must be the matching opening type; pop it, otherwise the string is invalid. At the end the stack must be empty, or some brackets were never closed. A stack fits because brackets close in last-opened-first-closed order. Repeatedly deleting '()', '[]' and '{}' pairs from the string also works but costs O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'is_valid', js: 'isValid' },
    py: {
      starter: 'def is_valid(s):\n    # write your code here\n    pass\n',
      solution: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack
`,
    },
    js: {
      starter: 'function isValid(s) {\n  // write your code here\n}\n',
      solution: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (!stack.length || stack[stack.length - 1] !== pairs[ch]) return false;
      stack.pop();
    } else stack.push(ch);
  }
  return stack.length === 0;
}
`,
    },
    tests: [
      { args: ['{[()]}'], expect: true },
      { args: ['([)]'], expect: false },
      { args: ['(('], expect: false },
      { args: ['()[]{}'], expect: true },
      { args: [']'], expect: false },
      { args: ['{{}[()]}'], expect: true },
      { args: ['(]'], expect: false },
    ],
  },
  {
    id: 'sq-baseball-game',
    title: 'Baseball Score Keeper',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Accenture', 'Wipro'],
    statement: "You keep score of a game from a list of strings `ops`. Each entry is one of: an integer `x` (record a new score x); `\"+\"` (record the sum of the previous two scores); `\"D\"` (record double the previous score); `\"C\"` (remove the previous score). All operations are valid. Return the **sum of all remaining scores**.",
    examples: [
      { input: 'ops = ["5", "2", "C", "D", "+"]', output: '30', explain: 'Scores: [5] -> [5,2] -> [5] -> [5,10] -> [5,10,15].' },
      { input: 'ops = ["1", "C"]', output: '0' },
    ],
    constraints: ['1 <= ops.length <= 1000', 'Integers are in [-3 * 10^4, 3 * 10^4]', 'Every operation is valid'],
    hints: ['Each operation only looks at the most recent scores.', 'Use a stack of scores.'],
    approach: "Keep a stack of valid scores. For a number, push it. For '+', push the sum of the top two. For 'D', push twice the top. For 'C', pop the top. Every operation touches only the last one or two records, which is exactly what a stack gives in O(1). The answer is the sum of the stack at the end. There is no meaningfully slower brute force; the point of the problem is choosing the right structure.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'cal_points', js: 'calPoints' },
    py: {
      starter: 'def cal_points(ops):\n    # write your code here\n    pass\n',
      solution: `def cal_points(ops):
    st = []
    for op in ops:
        if op == '+':
            st.append(st[-1] + st[-2])
        elif op == 'D':
            st.append(2 * st[-1])
        elif op == 'C':
            st.pop()
        else:
            st.append(int(op))
    return sum(st)
`,
    },
    js: {
      starter: 'function calPoints(ops) {\n  // write your code here\n}\n',
      solution: `function calPoints(ops) {
  const st = [];
  for (const op of ops) {
    if (op === '+') st.push(st[st.length - 1] + st[st.length - 2]);
    else if (op === 'D') st.push(2 * st[st.length - 1]);
    else if (op === 'C') st.pop();
    else st.push(parseInt(op, 10));
  }
  return st.reduce((a, b) => a + b, 0);
}
`,
    },
    tests: [
      { args: [['5', '2', 'C', 'D', '+']], expect: 30 },
      { args: [['1', 'C']], expect: 0 },
      { args: [['5', '-2', '4', 'C', 'D', '9', '+', '+']], expect: 27 },
      { args: [['7']], expect: 7 },
      { args: [['3', 'D', 'D']], expect: 21 },
      { args: [['1', '2', '+', 'C', 'C']], expect: 1 },
    ],
  },
  {
    id: 'sq-backspace-compare',
    title: 'Backspace String Compare',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given strings `s` and `t`, where `#` means a backspace, return `true` if both strings are equal after they are typed into empty text editors. A backspace on empty text does nothing.",
    examples: [
      { input: 's = "ab#c", t = "ad#c"', output: 'true', explain: 'Both become "ac".' },
      { input: 's = "a#c", t = "b"', output: 'false' },
    ],
    constraints: ['1 <= s.length, t.length <= 200', 'Lowercase letters and #'],
    hints: ['Simulate typing with a stack.', 'Push letters; pop on # if the stack is not empty.'],
    approach: "Simulate the editor for each string with a stack: push every letter, and on '#' pop the last letter if there is one. The stack then holds the final text, and we compare the two results. This is linear time and space. A follow-up uses two pointers scanning from the end and counting pending backspaces to get O(1) space; both are linear. Repeatedly rebuilding the string after each backspace costs O(n^2).",
    complexity: 'Time O(n + m), Space O(n + m)',
    fn: { py: 'backspace_compare', js: 'backspaceCompare' },
    py: {
      starter: 'def backspace_compare(s, t):\n    # write your code here\n    pass\n',
      solution: `def backspace_compare(s, t):
    def build(x):
        st = []
        for ch in x:
            if ch == '#':
                if st:
                    st.pop()
            else:
                st.append(ch)
        return st
    return build(s) == build(t)
`,
    },
    js: {
      starter: 'function backspaceCompare(s, t) {\n  // write your code here\n}\n',
      solution: `function backspaceCompare(s, t) {
  const build = x => {
    const st = [];
    for (const ch of x) {
      if (ch === '#') st.pop();
      else st.push(ch);
    }
    return st.join('');
  };
  return build(s) === build(t);
}
`,
    },
    tests: [
      { args: ['ab#c', 'ad#c'], expect: true },
      { args: ['a#c', 'b'], expect: false },
      { args: ['ab##', 'c#d#'], expect: true },
      { args: ['###a', 'a'], expect: true },
      { args: ['xy#z', 'xzz#'], expect: true },
      { args: ['abc', 'abd'], expect: false },
    ],
  },
  {
    id: 'sq-remove-adjacent-duplicates',
    title: 'Remove All Adjacent Duplicates',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'TCS', 'Infosys'],
    statement: "Given a lowercase string `s`, repeatedly remove **two adjacent equal letters** until no such pair remains. Return the final string (the result is unique).",
    examples: [
      { input: 's = "abbaca"', output: '"ca"', explain: 'Remove "bb" -> "aaca", then "aa" -> "ca".' },
      { input: 's = "azxxzy"', output: '"ay"' },
    ],
    constraints: ['1 <= s.length <= 10^5'],
    hints: ['Removing a pair can make a new pair meet.', 'Use a stack: if the new letter equals the top, pop instead of pushing.'],
    approach: "Process letters left to right with a stack holding the current result. If the incoming letter equals the top of the stack, those two form an adjacent pair, so pop the top and drop the letter. Otherwise push the letter. Popping exposes the previous letter, which handles chains like 'abba' automatically. The stack's contents joined together form the answer. Repeatedly scanning the string and deleting pairs is O(n^2) in the worst case.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'remove_duplicates', js: 'removeDuplicates' },
    py: {
      starter: 'def remove_duplicates(s):\n    # write your code here\n    pass\n',
      solution: `def remove_duplicates(s):
    st = []
    for ch in s:
        if st and st[-1] == ch:
            st.pop()
        else:
            st.append(ch)
    return ''.join(st)
`,
    },
    js: {
      starter: 'function removeDuplicates(s) {\n  // write your code here\n}\n',
      solution: `function removeDuplicates(s) {
  const st = [];
  for (const ch of s) {
    if (st.length && st[st.length - 1] === ch) st.pop();
    else st.push(ch);
  }
  return st.join('');
}
`,
    },
    tests: [
      { args: ['abbaca'], expect: 'ca' },
      { args: ['azxxzy'], expect: 'ay' },
      { args: ['aa'], expect: '' },
      { args: ['a'], expect: 'a' },
      { args: ['abccba'], expect: '' },
      { args: ['abcd'], expect: 'abcd' },
    ],
  },
  {
    id: 'sq-queue-using-stacks',
    title: 'Implement Queue Using Two Stacks',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Microsoft', 'Wipro', 'Accenture'],
    statement: "Implement a FIFO queue using only two stacks (push to top, pop from top, peek top, size). You receive a list of operations `ops`; each is `[\"push\", x]`, `[\"pop\"]`, `[\"peek\"]` or `[\"empty\"]`. Process them on an initially empty queue and return a list with one entry per operation: `null` for push, the removed front value for pop, the front value for peek, and `true`/`false` for empty. Pop and peek are never called on an empty queue.",
    examples: [
      { input: 'ops = [["push", 1], ["push", 2], ["peek"], ["pop"], ["empty"]]', output: '[null, null, 1, 1, false]' },
      { input: 'ops = [["empty"], ["push", 5], ["pop"], ["empty"]]', output: '[true, null, 5, true]' },
    ],
    constraints: ['1 <= ops.length <= 100', '1 <= x <= 9'],
    hints: ['Push into an "in" stack.', 'For pop/peek, if the "out" stack is empty, move everything from "in" to "out", which reverses the order.'],
    approach: "Use an in-stack for pushes and an out-stack for removals. A push goes onto the in-stack. For pop or peek, if the out-stack is empty, pop every element from the in-stack and push it onto the out-stack; this reverses the order, so the oldest element ends up on top. Then pop or peek the out-stack. Each element moves between the stacks at most once, so every operation is O(1) amortised. Moving all elements back and forth on every operation would cost O(n) per operation.",
    complexity: 'Time O(1) amortised per operation, Space O(n)',
    fn: { py: 'queue_ops', js: 'queueOps' },
    py: {
      starter: 'def queue_ops(ops):\n    # write your code here\n    pass\n',
      solution: `def queue_ops(ops):
    inp, out = [], []
    res = []

    def shift():
        if not out:
            while inp:
                out.append(inp.pop())

    for op in ops:
        if op[0] == 'push':
            inp.append(op[1])
            res.append(None)
        elif op[0] == 'pop':
            shift()
            res.append(out.pop())
        elif op[0] == 'peek':
            shift()
            res.append(out[-1])
        else:
            res.append(not inp and not out)
    return res
`,
    },
    js: {
      starter: 'function queueOps(ops) {\n  // write your code here\n}\n',
      solution: `function queueOps(ops) {
  const inp = [], out = [], res = [];
  const shift = () => { if (!out.length) while (inp.length) out.push(inp.pop()); };
  for (const op of ops) {
    if (op[0] === 'push') { inp.push(op[1]); res.push(null); }
    else if (op[0] === 'pop') { shift(); res.push(out.pop()); }
    else if (op[0] === 'peek') { shift(); res.push(out[out.length - 1]); }
    else res.push(inp.length === 0 && out.length === 0);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']]], expect: [null, null, 1, 1, false] },
      { args: [[['empty'], ['push', 5], ['pop'], ['empty']]], expect: [true, null, 5, true] },
      { args: [[['push', 3], ['push', 4], ['pop'], ['push', 5], ['pop'], ['pop']]], expect: [null, null, 3, null, 4, 5] },
      { args: [[['empty']]], expect: [true] },
      { args: [[['push', 9], ['peek'], ['peek'], ['empty']]], expect: [null, 9, 9, false] },
      { args: [[['push', 1], ['push', 2], ['push', 3], ['pop'], ['push', 4], ['peek'], ['pop'], ['pop'], ['peek']]], expect: [null, null, null, 1, null, 2, 2, 3, 4] },
    ],
  },
  {
    id: 'sq-make-string-great',
    title: 'Make the String Great',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Infosys'],
    statement: "A string is **good** if it has no two adjacent characters where one is the lowercase and the other the uppercase version of the **same letter** (like `\"aA\"` or `\"Bb\"`). Repeatedly delete such pairs from `s` until it is good, and return the result.",
    examples: [
      { input: 's = "leEeetcode"', output: '"leetcode"' },
      { input: 's = "abBAcC"', output: '""', explain: 'bB goes, then aA, then cC.' },
    ],
    constraints: ['1 <= s.length <= 100', 's has only English letters'],
    hints: ['Same pattern as removing adjacent duplicates.', 'Pop when the top and the new character are the same letter in different cases.'],
    approach: "Scan the string with a stack holding the good prefix so far. For each character, if the stack is non-empty and the top is the same letter in the opposite case (they differ but are equal after lowercasing), the pair cancels, so pop. Otherwise push the character. Pops can expose new pairs, which the stack handles naturally. Join the stack at the end. Repeated scans that delete one pair at a time cost O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'make_good', js: 'makeGood' },
    py: {
      starter: 'def make_good(s):\n    # write your code here\n    pass\n',
      solution: `def make_good(s):
    st = []
    for ch in s:
        if st and st[-1] != ch and st[-1].lower() == ch.lower():
            st.pop()
        else:
            st.append(ch)
    return ''.join(st)
`,
    },
    js: {
      starter: 'function makeGood(s) {\n  // write your code here\n}\n',
      solution: `function makeGood(s) {
  const st = [];
  for (const ch of s) {
    const top = st[st.length - 1];
    if (top !== undefined && top !== ch && top.toLowerCase() === ch.toLowerCase()) st.pop();
    else st.push(ch);
  }
  return st.join('');
}
`,
    },
    tests: [
      { args: ['leEeetcode'], expect: 'leetcode' },
      { args: ['abBAcC'], expect: '' },
      { args: ['s'], expect: 's' },
      { args: ['aa'], expect: 'aa' },
      { args: ['Pp'], expect: '' },
      { args: ['xYyXz'], expect: 'z' },
    ],
  },
  {
    id: 'sq-time-to-buy-tickets',
    title: 'Time Needed to Buy Tickets',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'TCS', 'Accenture'],
    statement: "People stand in a queue; person `i` wants to buy `tickets[i]` tickets. Buying one ticket takes 1 second, after which the person goes to the back of the queue (or leaves if they have bought all their tickets). Return the number of seconds until the person at position `k` (0-indexed) has bought all their tickets.",
    examples: [
      { input: 'tickets = [2, 3, 2], k = 2', output: '6' },
      { input: 'tickets = [5, 1, 1, 1], k = 0', output: '8' },
    ],
    constraints: ['1 <= tickets.length <= 100', '1 <= tickets[i] <= 100', '0 <= k < tickets.length'],
    hints: ['You can simulate with a queue, or count directly.', 'People before k buy min(t, tickets[k]); people after k buy min(t, tickets[k] - 1).'],
    approach: "A direct queue simulation works: repeatedly take the front person, give them one ticket, and re-append them if they still need more, until person k finishes. That costs O(sum of tickets). We can count instead: by the time k buys their last ticket, every person standing before k has had tickets[k] turns, so they bought min(tickets[i], tickets[k]); every person after k has had one fewer turn, so they bought min(tickets[i], tickets[k] - 1). Add these up to get the total time in one pass.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'time_required_to_buy', js: 'timeRequiredToBuy' },
    py: {
      starter: 'def time_required_to_buy(tickets, k):\n    # write your code here\n    pass\n',
      solution: `def time_required_to_buy(tickets, k):
    total = 0
    for i, t in enumerate(tickets):
        if i <= k:
            total += min(t, tickets[k])
        else:
            total += min(t, tickets[k] - 1)
    return total
`,
    },
    js: {
      starter: 'function timeRequiredToBuy(tickets, k) {\n  // write your code here\n}\n',
      solution: `function timeRequiredToBuy(tickets, k) {
  let total = 0;
  tickets.forEach((t, i) => {
    total += i <= k ? Math.min(t, tickets[k]) : Math.min(t, tickets[k] - 1);
  });
  return total;
}
`,
    },
    tests: [
      { args: [[2, 3, 2], 2], expect: 6 },
      { args: [[5, 1, 1, 1], 0], expect: 8 },
      { args: [[1], 0], expect: 1 },
      { args: [[3, 3, 3], 1], expect: 8 },
      { args: [[1, 1, 1, 1], 3], expect: 4 },
      { args: [[4, 2, 6], 1], expect: 5 },
    ],
  },
  {
    id: 'sq-next-greater-element',
    title: 'Next Greater Element',
    diff: 'Easy',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Flipkart', 'TCS', 'Infosys'],
    statement: "Given an integer array `arr`, return an array `res` where `res[i]` is the first element to the **right** of index `i` that is strictly greater than `arr[i]`, or `-1` if there is none.",
    examples: [
      { input: 'arr = [4, 5, 2, 25]', output: '[5, 25, 25, -1]' },
      { input: 'arr = [13, 7, 6, 12]', output: '[-1, 12, 12, -1]' },
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i] <= 10^9'],
    hints: ['Scan from the right and keep a stack of candidates.', 'Pop every candidate that is <= the current element; the top left over is the answer.'],
    approach: "Scan from right to left while keeping a stack of values that could be the next greater element for something further left. For the current value, pop every stack value that is less than or equal to it, because the current value is both closer and at least as large, so those can never be an answer again. If the stack is now non-empty, its top is the next greater element; otherwise it is -1. Then push the current value. Each value is pushed and popped at most once, so this is linear. The brute force scans right from every index in O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'next_greater', js: 'nextGreater' },
    py: {
      starter: 'def next_greater(arr):\n    # write your code here\n    pass\n',
      solution: `def next_greater(arr):
    res = [-1] * len(arr)
    st = []
    for i in range(len(arr) - 1, -1, -1):
        while st and st[-1] <= arr[i]:
            st.pop()
        if st:
            res[i] = st[-1]
        st.append(arr[i])
    return res
`,
    },
    js: {
      starter: 'function nextGreater(arr) {\n  // write your code here\n}\n',
      solution: `function nextGreater(arr) {
  const res = new Array(arr.length).fill(-1);
  const st = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    while (st.length && st[st.length - 1] <= arr[i]) st.pop();
    if (st.length) res[i] = st[st.length - 1];
    st.push(arr[i]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[4, 5, 2, 25]], expect: [5, 25, 25, -1] },
      { args: [[13, 7, 6, 12]], expect: [-1, 12, 12, -1] },
      { args: [[1]], expect: [-1] },
      { args: [[3, 3, 3]], expect: [-1, -1, -1] },
      { args: [[1, 2, 3, 4]], expect: [2, 3, 4, -1] },
      { args: [[6, 8, 0, 1, 3]], expect: [8, -1, 1, 3, -1] },
    ],
  },
  {
    id: 'sq-min-stack',
    title: 'Min Stack',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: "Design a stack that supports `push`, `pop`, `top` and `getMin` (the smallest element currently in the stack), all in O(1). You receive a list of operations `ops`, each `[\"push\", x]`, `[\"pop\"]`, `[\"top\"]` or `[\"getMin\"]`, applied to an empty stack. Return one entry per operation: `null` for push and pop, the value for top and getMin. top, pop and getMin are only called on a non-empty stack.",
    examples: [
      { input: 'ops = [["push", -2], ["push", 0], ["push", -3], ["getMin"], ["pop"], ["top"], ["getMin"]]', output: '[null, null, null, -3, null, 0, -2]' },
      { input: 'ops = [["push", 4], ["getMin"], ["push", 4], ["pop"], ["getMin"]]', output: '[null, 4, null, null, 4]' },
    ],
    constraints: ['1 <= ops.length <= 3 * 10^4', '-2^31 <= x <= 2^31 - 1'],
    hints: ['When you push, you also know the minimum at that moment.', 'Store pairs (value, min so far) on the stack.'],
    approach: "Store each entry as a pair: the value and the minimum of the stack at the moment it was pushed, which is min(value, previous top's minimum). The top pair then always carries the current minimum, so getMin reads it in O(1). Popping removes the pair, and the pair below still carries the correct minimum for the smaller stack. All operations are O(1). Scanning the whole stack on every getMin would be O(n) per call.",
    complexity: 'Time O(1) per operation, Space O(n)',
    fn: { py: 'min_stack_ops', js: 'minStackOps' },
    py: {
      starter: 'def min_stack_ops(ops):\n    # write your code here\n    pass\n',
      solution: `def min_stack_ops(ops):
    st = []
    res = []
    for op in ops:
        if op[0] == 'push':
            x = op[1]
            m = min(x, st[-1][1]) if st else x
            st.append((x, m))
            res.append(None)
        elif op[0] == 'pop':
            st.pop()
            res.append(None)
        elif op[0] == 'top':
            res.append(st[-1][0])
        else:
            res.append(st[-1][1])
    return res
`,
    },
    js: {
      starter: 'function minStackOps(ops) {\n  // write your code here\n}\n',
      solution: `function minStackOps(ops) {
  const st = [], res = [];
  for (const op of ops) {
    if (op[0] === 'push') {
      const x = op[1];
      const m = st.length ? Math.min(x, st[st.length - 1][1]) : x;
      st.push([x, m]);
      res.push(null);
    } else if (op[0] === 'pop') { st.pop(); res.push(null); }
    else if (op[0] === 'top') res.push(st[st.length - 1][0]);
    else res.push(st[st.length - 1][1]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']]], expect: [null, null, null, -3, null, 0, -2] },
      { args: [[['push', 4], ['getMin'], ['push', 4], ['pop'], ['getMin']]], expect: [null, 4, null, null, 4] },
      { args: [[['push', 1], ['top'], ['getMin']]], expect: [null, 1, 1] },
      { args: [[['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['pop'], ['getMin']]], expect: [null, null, null, 3, null, null, 5] },
      { args: [[['push', 2], ['push', 1], ['push', 1], ['pop'], ['getMin'], ['top']]], expect: [null, null, null, null, 1, 1] },
      { args: [[['push', 10], ['push', 20], ['getMin'], ['top']]], expect: [null, null, 10, 20] },
    ],
  },
  {
    id: 'sq-evaluate-rpn',
    title: 'Evaluate Reverse Polish Notation',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Microsoft', 'Infosys', 'Google'],
    statement: "Evaluate an arithmetic expression given in **postfix (Reverse Polish) notation** as a list of tokens. Tokens are integers or one of `+`, `-`, `*`, `/`. Division between integers **truncates toward zero**. The expression is always valid and there is no division by zero. Return the result.",
    examples: [
      { input: 'tokens = ["2", "1", "+", "3", "*"]', output: '9', explain: '(2 + 1) * 3' },
      { input: 'tokens = ["4", "13", "5", "/", "+"]', output: '6', explain: '4 + (13 / 5) = 4 + 2' },
    ],
    constraints: ['1 <= tokens.length <= 10^4', 'All intermediate results fit in a 32-bit integer'],
    hints: ['Numbers wait on a stack until an operator needs them.', 'For an operator, pop b then a and push a op b. Careful: truncate toward zero, not floor.'],
    approach: "Scan the tokens left to right with a stack of numbers. Push each number. When an operator appears, pop the right operand b first and then the left operand a, compute a op b and push the result. For division, truncate toward zero: in Python use int(a / b) (or adjust floor division for negative results) since // floors. When the scan ends, the single remaining number is the answer. Each token is processed once. Converting to infix and re-parsing would be more work for the same result.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'eval_rpn', js: 'evalRPN' },
    py: {
      starter: 'def eval_rpn(tokens):\n    # write your code here\n    pass\n',
      solution: `def eval_rpn(tokens):
    st = []
    for tok in tokens:
        if tok in ('+', '-', '*', '/'):
            b = st.pop()
            a = st.pop()
            if tok == '+':
                st.append(a + b)
            elif tok == '-':
                st.append(a - b)
            elif tok == '*':
                st.append(a * b)
            else:
                q = abs(a) // abs(b)
                st.append(q if (a >= 0) == (b > 0) else -q)
        else:
            st.append(int(tok))
    return st[-1]
`,
    },
    js: {
      starter: 'function evalRPN(tokens) {\n  // write your code here\n}\n',
      solution: `function evalRPN(tokens) {
  const st = [];
  for (const tok of tokens) {
    if (tok === '+' || tok === '-' || tok === '*' || tok === '/') {
      const b = st.pop(), a = st.pop();
      let r;
      if (tok === '+') r = a + b;
      else if (tok === '-') r = a - b;
      else if (tok === '*') r = a * b;
      else r = Math.trunc(a / b);
      st.push(r === 0 ? 0 : r);
    } else st.push(parseInt(tok, 10));
  }
  return st[st.length - 1];
}
`,
    },
    tests: [
      { args: [['2', '1', '+', '3', '*']], expect: 9 },
      { args: [['4', '13', '5', '/', '+']], expect: 6 },
      { args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expect: 22 },
      { args: [['7']], expect: 7 },
      { args: [['-7', '2', '/']], expect: -3 },
      { args: [['3', '-4', '*', '5', '-']], expect: -17 },
      { args: [['1', '3', '/']], expect: 0 },
    ],
  },
  {
    id: 'sq-daily-temperatures',
    title: 'Daily Temperatures',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "Given daily temperatures `temps`, return an array `ans` where `ans[i]` is the number of days you must wait after day `i` for a **strictly warmer** temperature. If no warmer day comes, `ans[i]` is `0`.",
    examples: [
      { input: 'temps = [73, 74, 75, 71, 69, 72, 76, 73]', output: '[1, 1, 4, 2, 1, 1, 0, 0]' },
      { input: 'temps = [30, 60, 90]', output: '[1, 1, 0]' },
    ],
    constraints: ['1 <= temps.length <= 10^5', '30 <= temps[i] <= 100'],
    hints: ['This is next greater element, but you need the distance.', 'Keep a stack of indices of days still waiting for a warmer day.'],
    approach: "Keep a monotonic stack of indices of days that have not yet found a warmer day; their temperatures are non-increasing from bottom to top. For each new day i, while the temperature at the top index is lower than temps[i], pop it and set its answer to i minus that index. Then push i. Days left in the stack at the end keep the answer 0. Every index is pushed and popped once, so the algorithm is linear. Looking ahead from each day takes O(n^2) in the worst case.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'daily_temperatures', js: 'dailyTemperatures' },
    py: {
      starter: 'def daily_temperatures(temps):\n    # write your code here\n    pass\n',
      solution: `def daily_temperatures(temps):
    ans = [0] * len(temps)
    st = []
    for i, t in enumerate(temps):
        while st and temps[st[-1]] < t:
            j = st.pop()
            ans[j] = i - j
        st.append(i)
    return ans
`,
    },
    js: {
      starter: 'function dailyTemperatures(temps) {\n  // write your code here\n}\n',
      solution: `function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const st = [];
  for (let i = 0; i < temps.length; i++) {
    while (st.length && temps[st[st.length - 1]] < temps[i]) {
      const j = st.pop();
      ans[j] = i - j;
    }
    st.push(i);
  }
  return ans;
}
`,
    },
    tests: [
      { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expect: [1, 1, 4, 2, 1, 1, 0, 0] },
      { args: [[30, 60, 90]], expect: [1, 1, 0] },
      { args: [[50]], expect: [0] },
      { args: [[90, 80, 70]], expect: [0, 0, 0] },
      { args: [[40, 40, 41]], expect: [2, 1, 0] },
      { args: [[55, 38, 53, 81, 61, 93]], expect: [3, 1, 1, 2, 1, 0] },
    ],
  },
  {
    id: 'sq-next-greater-circular',
    title: 'Next Greater Element in a Circular Array',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given a **circular** integer array `nums` (the element after the last one is the first one), return for every element the first strictly greater value found by moving forward (wrapping around). Use `-1` if no greater value exists.",
    examples: [
      { input: 'nums = [1, 2, 1]', output: '[2, -1, 2]', explain: 'The last 1 wraps around to find 2.' },
      { input: 'nums = [5, 4, 3, 2, 1]', output: '[-1, 5, 5, 5, 5]' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Pretend the array is written twice.', 'Run the next-greater stack over indices 2n-1 down to 0 using i % n.'],
    approach: "A circular array behaves like the array concatenated with itself. Run the usual next-greater-element stack from right to left over virtual indices 2n-1 down to 0, using nums[i % n]. For each position, pop stack values that are less than or equal to the current value; the top that remains is the next greater value. Only record answers for i < n, but push values for all 2n positions, so elements near the end can see the wrapped-around beginning. Each virtual index is pushed and popped once, so this is O(n). The brute force walks up to n steps from every index, O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'next_greater_circular', js: 'nextGreaterCircular' },
    py: {
      starter: 'def next_greater_circular(nums):\n    # write your code here\n    pass\n',
      solution: `def next_greater_circular(nums):
    n = len(nums)
    res = [-1] * n
    st = []
    for i in range(2 * n - 1, -1, -1):
        x = nums[i % n]
        while st and st[-1] <= x:
            st.pop()
        if i < n and st:
            res[i] = st[-1]
        st.append(x)
    return res
`,
    },
    js: {
      starter: 'function nextGreaterCircular(nums) {\n  // write your code here\n}\n',
      solution: `function nextGreaterCircular(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const st = [];
  for (let i = 2 * n - 1; i >= 0; i--) {
    const x = nums[i % n];
    while (st.length && st[st.length - 1] <= x) st.pop();
    if (i < n && st.length) res[i] = st[st.length - 1];
    st.push(x);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 1]], expect: [2, -1, 2] },
      { args: [[5, 4, 3, 2, 1]], expect: [-1, 5, 5, 5, 5] },
      { args: [[7]], expect: [-1] },
      { args: [[2, 2]], expect: [-1, -1] },
      { args: [[1, 2, 3, 4, 3]], expect: [2, 3, 4, -1, 4] },
      { args: [[3, 8, 4, 1, 2]], expect: [8, -1, 8, 2, 3] },
    ],
  },
  {
    id: 'sq-asteroid-collision',
    title: 'Asteroid Collision',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "Each value in `asteroids` is an asteroid in a row: its absolute value is its size and its sign is its direction (positive moves right, negative moves left). All move at the same speed. When a right-moving and a left-moving asteroid meet, the smaller one explodes; if they are equal, both explode. Asteroids moving the same way never meet. Return the asteroids left after all collisions, in order.",
    examples: [
      { input: 'asteroids = [5, 10, -5]', output: '[5, 10]', explain: '10 destroys -5.' },
      { input: 'asteroids = [8, -8]', output: '[]' },
      { input: 'asteroids = [-2, -1, 1, 2]', output: '[-2, -1, 1, 2]', explain: 'Nothing collides.' },
    ],
    constraints: ['2 <= asteroids.length <= 10^4', '-1000 <= asteroids[i] <= 1000', 'asteroids[i] != 0'],
    hints: ['Only a positive asteroid on the stack and a new negative asteroid can collide.', 'Keep popping while the new negative asteroid is bigger than the positive top.'],
    approach: "Process asteroids left to right with a stack of survivors. A collision happens only when the new asteroid moves left (negative) and the top of the stack moves right (positive). While that is the case, compare sizes: if the top is smaller, pop it and keep checking; if equal, pop it and the new asteroid also dies; if the top is bigger, the new asteroid dies. If the new asteroid survives all collisions, push it. Every asteroid is pushed and popped at most once. Simulating time step by step would be much slower, O(n^2) or worse.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'asteroid_collision', js: 'asteroidCollision' },
    py: {
      starter: 'def asteroid_collision(asteroids):\n    # write your code here\n    pass\n',
      solution: `def asteroid_collision(asteroids):
    st = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and st and st[-1] > 0:
            if st[-1] < -a:
                st.pop()
            elif st[-1] == -a:
                st.pop()
                alive = False
            else:
                alive = False
        if alive:
            st.append(a)
    return st
`,
    },
    js: {
      starter: 'function asteroidCollision(asteroids) {\n  // write your code here\n}\n',
      solution: `function asteroidCollision(asteroids) {
  const st = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1];
      if (top < -a) st.pop();
      else if (top === -a) { st.pop(); alive = false; }
      else alive = false;
    }
    if (alive) st.push(a);
  }
  return st;
}
`,
    },
    tests: [
      { args: [[5, 10, -5]], expect: [5, 10] },
      { args: [[8, -8]], expect: [] },
      { args: [[-2, -1, 1, 2]], expect: [-2, -1, 1, 2] },
      { args: [[10, 2, -5]], expect: [10] },
      { args: [[1, -2, -2, -2]], expect: [-2, -2, -2] },
      { args: [[3, 5, -6, 2, -1, 4]], expect: [-6, 2, 4] },
    ],
  },
  {
    id: 'sq-decode-string',
    title: 'Decode String',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "An encoded string uses the rule `k[text]`, meaning `text` repeated `k` times (k is a positive integer, possibly with several digits). Encodings can be nested. Given a valid encoded string `s` made of lowercase letters, digits and brackets, return the decoded string.",
    examples: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 's = "2[x3[y]]z"', output: '"xyyyxyyyz"' },
    ],
    constraints: ['1 <= s.length <= 30', '1 <= k <= 300', 'The decoded length is at most 10^5'],
    hints: ['On "[" you must remember the text built so far and the repeat count.', 'Push (previous text, k) on "["; on "]" pop and do previous + current * k.'],
    approach: "Scan the string while building the current text and a pending number. Digits extend the number (it can have several digits). On '[', push the pair (text built so far, number) onto a stack and reset both, because we are entering a new nested level. Letters are appended to the current text. On ']', pop (previous text, k) and set the current text to previous text + current text repeated k times. At the end, the current text is the fully decoded string. The work is proportional to the output size. A recursive descent parser is an equivalent alternative.",
    complexity: 'Time O(output length), Space O(output length)',
    fn: { py: 'decode_string', js: 'decodeString' },
    py: {
      starter: 'def decode_string(s):\n    # write your code here\n    pass\n',
      solution: `def decode_string(s):
    st = []
    cur = ''
    num = 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == '[':
            st.append((cur, num))
            cur, num = '', 0
        elif ch == ']':
            prev, k = st.pop()
            cur = prev + cur * k
        else:
            cur += ch
    return cur
`,
    },
    js: {
      starter: 'function decodeString(s) {\n  // write your code here\n}\n',
      solution: `function decodeString(s) {
  const st = [];
  let cur = '', num = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') num = num * 10 + Number(ch);
    else if (ch === '[') { st.push([cur, num]); cur = ''; num = 0; }
    else if (ch === ']') { const [prev, k] = st.pop(); cur = prev + cur.repeat(k); }
    else cur += ch;
  }
  return cur;
}
`,
    },
    tests: [
      { args: ['3[a]2[bc]'], expect: 'aaabcbc' },
      { args: ['2[x3[y]]z'], expect: 'xyyyxyyyz' },
      { args: ['abc'], expect: 'abc' },
      { args: ['10[a]'], expect: 'aaaaaaaaaa' },
      { args: ['2[abc]3[cd]ef'], expect: 'abcabccdcdcdef' },
      { args: ['3[a2[c]]'], expect: 'accaccacc' },
    ],
  },
  {
    id: 'sq-stock-span',
    title: 'Stock Span',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Flipkart', 'Microsoft', 'TCS'],
    statement: "Given daily stock `prices`, the **span** of day `i` is the number of consecutive days ending at day `i` (including day `i`) on which the price was **less than or equal to** `prices[i]`. Return the list of spans for every day.",
    examples: [
      { input: 'prices = [100, 80, 60, 70, 60, 75, 85]', output: '[1, 1, 1, 2, 1, 4, 6]' },
      { input: 'prices = [10, 20, 30]', output: '[1, 2, 3]' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '1 <= prices[i] <= 10^5'],
    hints: ['You need the previous strictly greater price for each day.', 'Keep a stack of indices with decreasing prices; pop while the price is <= today.'],
    approach: "The span of day i is i minus the index of the previous day with a strictly greater price (or i+1 if none exists). Keep a stack of indices whose prices are strictly decreasing from bottom to top. For each day, pop indices whose price is less than or equal to today's price, since today blocks them for every future day. The index left on top, if any, is the previous greater day. Compute the span and push today. Each index is pushed and popped at most once. Walking back day by day from every index costs O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'stock_span', js: 'stockSpan' },
    py: {
      starter: 'def stock_span(prices):\n    # write your code here\n    pass\n',
      solution: `def stock_span(prices):
    res = []
    st = []
    for i, p in enumerate(prices):
        while st and prices[st[-1]] <= p:
            st.pop()
        res.append(i - st[-1] if st else i + 1)
        st.append(i)
    return res
`,
    },
    js: {
      starter: 'function stockSpan(prices) {\n  // write your code here\n}\n',
      solution: `function stockSpan(prices) {
  const res = [], st = [];
  for (let i = 0; i < prices.length; i++) {
    while (st.length && prices[st[st.length - 1]] <= prices[i]) st.pop();
    res.push(st.length ? i - st[st.length - 1] : i + 1);
    st.push(i);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[100, 80, 60, 70, 60, 75, 85]], expect: [1, 1, 1, 2, 1, 4, 6] },
      { args: [[10, 20, 30]], expect: [1, 2, 3] },
      { args: [[5]], expect: [1] },
      { args: [[30, 20, 10]], expect: [1, 1, 1] },
      { args: [[7, 7, 7]], expect: [1, 2, 3] },
      { args: [[10, 4, 5, 90, 120, 80]], expect: [1, 1, 2, 4, 5, 1] },
    ],
  },
  {
    id: 'sq-remove-k-digits',
    title: 'Remove K Digits',
    diff: 'Medium',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    statement: "Given a string `num` representing a non-negative integer and an integer `k`, remove exactly `k` digits so that the remaining number is as **small as possible**. Return it as a string without leading zeros; if nothing (or only zeros) remains, return `\"0\"`.",
    examples: [
      { input: 'num = "1432219", k = 3', output: '"1219"' },
      { input: 'num = "10200", k = 1', output: '"200"', explain: 'Remove the 1; leading zeros are dropped.' },
      { input: 'num = "10", k = 2', output: '"0"' },
    ],
    constraints: ['1 <= k <= num.length <= 10^5', 'num has no leading zeros except "0" itself'],
    hints: ['A smaller digit should come as early as possible.', 'Monotonic stack: while k > 0 and the top is greater than the new digit, pop it.'],
    approach: "Greedily make the leftmost digits as small as possible. Scan the digits with a stack that stays non-decreasing: while we still may remove digits (k > 0) and the top digit is greater than the current digit, pop it and decrement k, because replacing a larger digit with a smaller one at an earlier position always gives a smaller number. Push the current digit. If removals remain after the scan, remove them from the end, where the largest digits are. Finally strip leading zeros and return '0' if the result is empty. Trying all combinations of k removals is exponential.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'remove_kdigits', js: 'removeKdigits' },
    py: {
      starter: 'def remove_kdigits(num, k):\n    # write your code here\n    pass\n',
      solution: `def remove_kdigits(num, k):
    st = []
    for d in num:
        while k and st and st[-1] > d:
            st.pop()
            k -= 1
        st.append(d)
    if k:
        st = st[:-k]
    res = ''.join(st).lstrip('0')
    return res or '0'
`,
    },
    js: {
      starter: 'function removeKdigits(num, k) {\n  // write your code here\n}\n',
      solution: `function removeKdigits(num, k) {
  const st = [];
  for (const d of num) {
    while (k > 0 && st.length && st[st.length - 1] > d) { st.pop(); k--; }
    st.push(d);
  }
  while (k > 0) { st.pop(); k--; }
  let i = 0;
  while (i < st.length && st[i] === '0') i++;
  const res = st.slice(i).join('');
  return res || '0';
}
`,
    },
    tests: [
      { args: ['1432219', 3], expect: '1219' },
      { args: ['10200', 1], expect: '200' },
      { args: ['10', 2], expect: '0' },
      { args: ['12345', 2], expect: '123' },
      { args: ['54321', 2], expect: '321' },
      { args: ['112', 1], expect: '11' },
      { args: ['100002', 1], expect: '2' },
    ],
  },
  {
    id: 'sq-largest-rectangle-histogram',
    title: 'Largest Rectangle in Histogram',
    diff: 'Hard',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    statement: "Given `heights`, the bar heights of a histogram where every bar has width 1, return the **area of the largest rectangle** that fits entirely inside the histogram.",
    examples: [
      { input: 'heights = [2, 1, 5, 6, 2, 3]', output: '10', explain: 'Bars 5 and 6 give height 5, width 2.' },
      { input: 'heights = [2, 4]', output: '4' },
    ],
    constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
    hints: ['For each bar, find how far it can extend left and right while bars are at least as tall.', 'A stack of increasing heights tells you both boundaries when a bar is popped.'],
    approach: "For each bar, the largest rectangle using its full height stretches between the nearest shorter bar on the left and the nearest shorter bar on the right. Keep a stack of indices with increasing heights. When the current bar is shorter than the top, the top bar's right boundary is the current index and its left boundary is the new top after popping; compute height * width and update the best. Add a sentinel height 0 at the end so that every bar gets popped. Each index is pushed and popped once, giving O(n). Expanding left and right from every bar is O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'largest_rectangle_area', js: 'largestRectangleArea' },
    py: {
      starter: 'def largest_rectangle_area(heights):\n    # write your code here\n    pass\n',
      solution: `def largest_rectangle_area(heights):
    st = []
    best = 0
    h = heights + [0]
    for i, x in enumerate(h):
        while st and h[st[-1]] >= x:
            height = h[st.pop()]
            left = st[-1] if st else -1
            best = max(best, height * (i - left - 1))
        st.append(i)
    return best
`,
    },
    js: {
      starter: 'function largestRectangleArea(heights) {\n  // write your code here\n}\n',
      solution: `function largestRectangleArea(heights) {
  const h = [...heights, 0];
  const st = [];
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    while (st.length && h[st[st.length - 1]] >= h[i]) {
      const height = h[st.pop()];
      const left = st.length ? st[st.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    st.push(i);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[2, 1, 5, 6, 2, 3]], expect: 10 },
      { args: [[2, 4]], expect: 4 },
      { args: [[0]], expect: 0 },
      { args: [[3, 3, 3]], expect: 9 },
      { args: [[6, 2, 5, 4, 5, 1, 6]], expect: 12 },
      { args: [[1, 2, 3, 4, 5]], expect: 9 },
    ],
  },
  {
    id: 'sq-maximal-rectangle',
    title: 'Maximal Rectangle of 1s',
    diff: 'Hard',
    pattern: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given a binary matrix `matrix` of `\"0\"` and `\"1\"` strings, return the **area of the largest rectangle** that contains only `\"1\"`s.",
    examples: [
      { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '6' },
      { input: 'matrix = [["0"]]', output: '0' },
    ],
    constraints: ['1 <= rows, cols <= 200', 'matrix[i][j] is "0" or "1"'],
    hints: ['Treat each row as the floor of a histogram.', 'heights[j] = consecutive 1s ending at this row in column j; run Largest Rectangle in Histogram per row.'],
    approach: "Process the matrix row by row and keep heights[j], the number of consecutive '1' cells in column j ending at the current row (reset to 0 on a '0'). Each row then defines a histogram, and the largest all-ones rectangle whose bottom edge lies on that row is the largest rectangle in that histogram. Solve that with the monotonic stack method in O(cols) per row and keep the maximum. The total is O(rows * cols). Checking every possible rectangle is O(rows^2 * cols^2) or worse.",
    complexity: 'Time O(rows * cols), Space O(cols)',
    fn: { py: 'maximal_rectangle', js: 'maximalRectangle' },
    py: {
      starter: 'def maximal_rectangle(matrix):\n    # write your code here\n    pass\n',
      solution: `def maximal_rectangle(matrix):
    cols = len(matrix[0])
    heights = [0] * cols
    best = 0
    for row in matrix:
        for j in range(cols):
            heights[j] = heights[j] + 1 if row[j] == '1' else 0
        h = heights + [0]
        st = []
        for i, x in enumerate(h):
            while st and h[st[-1]] >= x:
                height = h[st.pop()]
                left = st[-1] if st else -1
                best = max(best, height * (i - left - 1))
            st.append(i)
    return best
`,
    },
    js: {
      starter: 'function maximalRectangle(matrix) {\n  // write your code here\n}\n',
      solution: `function maximalRectangle(matrix) {
  const cols = matrix[0].length;
  const heights = new Array(cols).fill(0);
  let best = 0;
  for (const row of matrix) {
    for (let j = 0; j < cols; j++) heights[j] = row[j] === '1' ? heights[j] + 1 : 0;
    const h = [...heights, 0];
    const st = [];
    for (let i = 0; i < h.length; i++) {
      while (st.length && h[st[st.length - 1]] >= h[i]) {
        const height = h[st.pop()];
        const left = st.length ? st[st.length - 1] : -1;
        best = Math.max(best, height * (i - left - 1));
      }
      st.push(i);
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], expect: 6 },
      { args: [[['0']]], expect: 0 },
      { args: [[['1']]], expect: 1 },
      { args: [[['1', '1'], ['1', '1']]], expect: 4 },
      { args: [[['0', '1'], ['1', '0']]], expect: 1 },
      { args: [[['1', '1', '1', '0'], ['1', '1', '1', '1'], ['0', '1', '1', '1']]], expect: 6 },
    ],
  },
  {
    id: 'sq-longest-valid-parentheses',
    title: 'Longest Valid Parentheses',
    diff: 'Hard',
    pattern: 'Stack & Queue',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "Given a string `s` containing only `(` and `)`, return the length of the longest **contiguous** substring that is a well-formed (balanced) parentheses string.",
    examples: [
      { input: 's = "(()"', output: '2' },
      { input: 's = ")()())"', output: '4', explain: '"()()"' },
      { input: 's = ""', output: '0' },
    ],
    constraints: ['0 <= s.length <= 3 * 10^4', 's[i] is ( or )'],
    hints: ['Push indices, not characters.', 'Keep the index of the last unmatched ")" at the bottom of the stack as a base.'],
    approach: "Use a stack of indices that starts with -1 as a base marker. For '(' push its index. For ')' pop the top; if the stack becomes empty, this ')' is unmatched, so push its index as the new base. Otherwise the current valid substring runs from just after the index now on top up to i, so its length is i - top; update the best. The base always marks the position just before the current valid run. Each index is pushed and popped once. Checking every substring for validity is O(n^3), or O(n^2) with incremental counting.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'longest_valid_parentheses', js: 'longestValidParentheses' },
    py: {
      starter: 'def longest_valid_parentheses(s):\n    # write your code here\n    pass\n',
      solution: `def longest_valid_parentheses(s):
    st = [-1]
    best = 0
    for i, ch in enumerate(s):
        if ch == '(':
            st.append(i)
        else:
            st.pop()
            if not st:
                st.append(i)
            else:
                best = max(best, i - st[-1])
    return best
`,
    },
    js: {
      starter: 'function longestValidParentheses(s) {\n  // write your code here\n}\n',
      solution: `function longestValidParentheses(s) {
  const st = [-1];
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') st.push(i);
    else {
      st.pop();
      if (!st.length) st.push(i);
      else best = Math.max(best, i - st[st.length - 1]);
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: ['(()'], expect: 2 },
      { args: [')()())'], expect: 4 },
      { args: [''], expect: 0 },
      { args: ['()(())'], expect: 6 },
      { args: ['))(('], expect: 0 },
      { args: ['()(()'], expect: 2 },
      { args: ['(()())())'], expect: 8 },
    ],
  },
  {
    id: 'sq-basic-calculator',
    title: 'Basic Calculator',
    diff: 'Hard',
    pattern: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "Evaluate a valid expression string `s` containing non-negative integers, `+`, `-`, parentheses `(` `)` and spaces. A `-` may also be a **unary minus** (for example `\"-(2 + 3)\"`). Return the result. Do not use any built-in eval function.",
    examples: [
      { input: 's = "1 + 1"', output: '2' },
      { input: 's = " 2-1 + 2 "', output: '3' },
      { input: 's = "(1+(4+5+2)-3)+(6+8)"', output: '23' },
    ],
    constraints: ['1 <= s.length <= 3 * 10^5', 'The expression is valid', 'All results fit in a 32-bit integer'],
    hints: ['With only + and -, every number is added with a sign of +1 or -1.', 'On "(" push the current result and sign; on ")" pop them and combine.'],
    approach: "Scan the string keeping result (the total at the current parenthesis level), sign (+1 or -1 for the next number) and the number being read. When a number ends, add sign * number to result. A '+' or '-' sets the sign for the next number. On '(', push the current result and sign onto a stack, then start a fresh level with result 0 and sign +1. On ')', finish the inner value, then pop the saved sign and outer result and combine: result = outer + savedSign * inner. Unary minus works because it simply sets sign = -1 before the next number or parenthesis. Each character is handled once.",
    complexity: 'Time O(n), Space O(n) for nested parentheses',
    fn: { py: 'calculate', js: 'calculate' },
    py: {
      starter: 'def calculate(s):\n    # write your code here\n    pass\n',
      solution: `def calculate(s):
    st = []
    result, sign, num = 0, 1, 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in '+-':
            result += sign * num
            num = 0
            sign = 1 if ch == '+' else -1
        elif ch == '(':
            st.append(result)
            st.append(sign)
            result, sign = 0, 1
        elif ch == ')':
            result += sign * num
            num = 0
            saved_sign = st.pop()
            outer = st.pop()
            result = outer + saved_sign * result
    return result + sign * num
`,
    },
    js: {
      starter: 'function calculate(s) {\n  // write your code here\n}\n',
      solution: `function calculate(s) {
  const st = [];
  let result = 0, sign = 1, num = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') num = num * 10 + Number(ch);
    else if (ch === '+' || ch === '-') {
      result += sign * num;
      num = 0;
      sign = ch === '+' ? 1 : -1;
    } else if (ch === '(') {
      st.push(result, sign);
      result = 0; sign = 1;
    } else if (ch === ')') {
      result += sign * num;
      num = 0;
      const savedSign = st.pop();
      const outer = st.pop();
      result = outer + savedSign * result;
    }
  }
  const r = result + sign * num;
  return r === 0 ? 0 : r;
}
`,
    },
    tests: [
      { args: ['1 + 1'], expect: 2 },
      { args: [' 2-1 + 2 '], expect: 3 },
      { args: ['(1+(4+5+2)-3)+(6+8)'], expect: 23 },
      { args: ['-(2 + 3)'], expect: -5 },
      { args: ['10 - (4 - (1 + 2))'], expect: 9 },
      { args: ['42'], expect: 42 },
      { args: ['1-(-2)'], expect: 3 },
    ],
  },
];
