export default {
  lesson: 'day-13-sets',
  minutes: 25,
  intro: 'Remove duplicates, add/remove items safely and use union, intersection, difference and subset checks on real data.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is `type({})` in Python?',
      options: ["<class 'set'>", "<class 'dict'>", "<class 'tuple'>", "<class 'list'>"],
      answer: 1,
      explain: 'Empty curly braces create an empty **dict**. To create an empty set you must write `set()`. `{1, 2}` (with items and no colons) is a set.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed? (`sorted()` is used so the order is fixed.)',
      code: `a = {1, 2, 3, 4}
b = {3, 4, 5}
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))
print(sorted(a ^ b))
print(len({"pen", "Pen", "pen"}))`,
      expected: '[1, 2, 3, 4, 5]\n[3, 4]\n[1, 2]\n[1, 2, 5]\n2',
      explain: '`|` union (in either), `&` intersection (in both), `-` difference (in a but not b), `^` symmetric difference (in exactly one). Sets keep only unique items and comparison is case-sensitive, so "pen" and "Pen" are different: 2 items.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`skills = {"python", "sql"}`. What happens on `skills.remove("java")` vs `skills.discard("java")`?',
      options: [
        'Both do nothing',
        'remove raises KeyError; discard does nothing',
        'remove does nothing; discard raises KeyError',
        'Both raise KeyError',
      ],
      answer: 1,
      explain: '`remove()` raises **KeyError** when the item is missing; `discard()` silently ignores it. Use `discard` when you are not sure the item exists.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Course enrollments:\n```\npython = {"Asha", "Ravi", "Neha", "Kiran"}\njava = {"Ravi", "Meena", "Kiran", "Arjun"}\n```\nCreate:\n- `both`: students in both courses\n- `only_python`: in Python but not Java\n- `everyone`: all students\n- `exactly_one`: students in exactly one course',
      example: { title: 'set methods', code: 'a = {"x", "y"}\nb = {"y", "z"}\nprint(a.union(b), a.intersection(b))\nprint(a.difference(b), a.symmetric_difference(b))' },
      starter: `python = {"Asha", "Ravi", "Neha", "Kiran"}
java = {"Ravi", "Meena", "Kiran", "Arjun"}
both = set()         # TODO
only_python = set()  # TODO
everyone = set()     # TODO
exactly_one = set()  # TODO
`,
      solution: `python = {"Asha", "Ravi", "Neha", "Kiran"}
java = {"Ravi", "Meena", "Kiran", "Arjun"}
both = python & java
only_python = python - java
everyone = python | java
exactly_one = python ^ java
`,
      tests: [
        { call: 'both', expect: ['Kiran', 'Ravi'] },
        { call: 'only_python', expect: ['Asha', 'Neha'] },
        { call: 'everyone', expect: ['Arjun', 'Asha', 'Kiran', 'Meena', 'Neha', 'Ravi'] },
        { call: 'exactly_one', expect: ['Arjun', 'Asha', 'Meena', 'Neha'] },
      ],
      explain: 'Operators (`& - | ^`) and methods (`intersection`, `difference`, `union`, `symmetric_difference`) give the same results. Difference is **not** symmetric: `java - python` would give Meena and Arjun instead.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Website visitor log: read one line of email IDs separated by spaces (no prompt). Print the number of **unique** visitors and the unique emails in sorted order:\n```\nUnique visitors: 3\n[\'asha@x.in\', \'neha@x.in\', \'ravi@x.in\']\n```\nTest input: `ravi@x.in asha@x.in ravi@x.in neha@x.in asha@x.in`',
      example: { title: 'set() removes duplicates', code: 'cities = ["Pune", "Goa", "Pune"]\nprint(set(cities))          # {\'Pune\', \'Goa\'} (any order)\nprint(sorted(set(cities)))  # [\'Goa\', \'Pune\']' },
      stdin: 'ravi@x.in asha@x.in ravi@x.in neha@x.in asha@x.in',
      starter: `emails = input().split()
# TODO
`,
      solution: `emails = input().split()
unique = set(emails)
print("Unique visitors:", len(unique))
print(sorted(unique))`,
      tests: [{ stdout: "Unique visitors: 3\n['asha@x.in', 'neha@x.in', 'ravi@x.in']" }],
      explain: 'Converting to a set removes duplicates instantly. Sets are **unordered**, so printing the set directly can show any order: use `sorted()` (which returns a list) for a stable output.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Job skill matching. `required = {"python", "sql", "git"}`. Read a candidate’s skills on one line (no prompt). If the candidate has **all** required skills print `Eligible`; otherwise print the missing skills sorted:\n```\nMissing: [\'git\', \'sql\']\n```\nTest input: `python excel communication`',
      example: { title: 'subset check', code: 'need = {"a", "b"}\nhave = {"a", "b", "c"}\nprint(need.issubset(have))   # True  (same as need <= have)\nprint(need - have)            # set()' },
      stdin: 'python excel communication',
      starter: `required = {"python", "sql", "git"}
skills = set(input().split())
# TODO
`,
      solution: `required = {"python", "sql", "git"}
skills = set(input().split())
if required.issubset(skills):
    print("Eligible")
else:
    print("Missing:", sorted(required - skills))`,
      tests: [{ stdout: "Missing: ['git', 'sql']" }],
      explain: '`required.issubset(skills)` (or `required <= skills`) checks that every required skill is present. The missing ones are `required - skills`, not `skills - required` (that would be the extra skills).',
    },
  ],
};
