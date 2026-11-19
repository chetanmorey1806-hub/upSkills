export default {
  lesson: 'day-14-dictionaries',
  minutes: 30,
  intro: 'Create, read, update and delete dictionary entries, count words, group data and write dict comprehensions.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `stock = {"pen": 10, "book": 4}
print(stock.get("bag"))
print(stock.get("bag", 0))
stock["pen"] += 5
print(stock.setdefault("bag", 1), stock.setdefault("pen", 99))
print(stock.pop("book"))
print(stock)`,
      expected: "None\n0\n1 15\n4\n{'pen': 15, 'bag': 1}",
      explain: '`get()` returns None (or your default) instead of raising KeyError. `setdefault` inserts the key only if it is missing and returns the current value (so "pen" stays 15). `pop` removes the key and returns its value. Dicts keep insertion order.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`marks = {"Asha": 90}`. What does `marks["Ravi"]` do?',
      options: ['Returns None', 'Returns 0', 'Raises KeyError', 'Adds "Ravi" with value None'],
      answer: 2,
      explain: 'Square-bracket access to a missing key raises **KeyError**. Use `marks.get("Ravi")` or check `"Ravi" in marks` first. Assigning `marks["Ravi"] = 75` would add the key.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Update the student record:\n```\nstudent = {"name": "Asha", "age": 20, "marks": 85}\n```\n1. change `marks` to 90\n2. add `city` = `"Pune"`\n3. delete `age`',
      example: { title: 'CRUD on a dict', code: 'emp = {"id": 1, "dept": "HR"}\nemp["dept"] = "IT"      # update\nemp["salary"] = 50000   # add\ndel emp["id"]           # delete' },
      starter: `student = {"name": "Asha", "age": 20, "marks": 85}
# TODO
`,
      solution: `student = {"name": "Asha", "age": 20, "marks": 85}
student["marks"] = 90
student["city"] = "Pune"
del student["age"]
`,
      tests: [{ call: 'student', expect: { name: 'Asha', marks: 90, city: 'Pune' } }],
      explain: 'The same `d[key] = value` syntax updates an existing key or adds a new one. `del d[key]` (or `d.pop(key)`) removes it. Keys are unique, so assigning "marks" again replaces the old value.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Word frequency. Read a sentence (no prompt), build a dict `freq` of word → count (lowercase words), then print the most frequent word and its count:\n```\nthe 3\n```\nTest input: `The cat and the hat and the bat`',
      example: { title: 'counting with get()', code: 'counts = {}\nfor fruit in ["apple", "kiwi", "apple"]:\n    counts[fruit] = counts.get(fruit, 0) + 1\nprint(counts)   # {\'apple\': 2, \'kiwi\': 1}' },
      stdin: 'The cat and the hat and the bat',
      starter: `words = input().lower().split()
freq = {}
# TODO: count words, then print the top word and its count
`,
      solution: `words = input().lower().split()
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
top = max(freq, key=freq.get)
print(top, freq[top])`,
      tests: [
        { call: 'freq', expect: { the: 3, cat: 1, and: 2, hat: 1, bat: 1 } },
        { stdout: 'the 3' },
      ],
      explain: '`freq.get(w, 0) + 1` avoids a KeyError the first time a word appears (`collections.Counter(words)` does the same). `max(freq, key=freq.get)` loops over the keys but compares their **values**. Without `.lower()`, "The" and "the" would be counted separately.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Dict comprehensions. Given\n```\nprices = {"pen": 10, "book": 120, "bag": 799, "eraser": 5}\n```\ncreate:\n- `with_gst`: every price × 1.18, rounded to 2 decimals\n- `costly`: only items with price **above 100**',
      example: { title: 'dict comprehension', code: 'ages = {"Asha": 20, "Ravi": 17}\nadults = {n: a for n, a in ages.items() if a >= 18}   # {\'Asha\': 20}' },
      starter: `prices = {"pen": 10, "book": 120, "bag": 799, "eraser": 5}
with_gst = {}  # TODO
costly = {}    # TODO
`,
      solution: `prices = {"pen": 10, "book": 120, "bag": 799, "eraser": 5}
with_gst = {k: round(v * 1.18, 2) for k, v in prices.items()}
costly = {k: v for k, v in prices.items() if v > 100}
`,
      tests: [
        { call: 'with_gst', expect: { pen: 11.8, book: 141.6, bag: 942.82, eraser: 5.9 } },
        { call: 'costly', expect: { book: 120, bag: 799 } },
      ],
      explain: '`{key_expr: value_expr for k, v in d.items() if cond}` builds a new dict. Loop over `.items()` to get key and value together; looping over the dict alone gives only keys. `round(x, 2)` avoids long float tails like 141.6000000001.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Group students by city. Given\n```\nstudents = [\n    {"name": "Asha", "city": "Pune"},\n    {"name": "Ravi", "city": "Delhi"},\n    {"name": "Neha", "city": "Pune"},\n    {"name": "Kiran", "city": "Delhi"},\n    {"name": "Meena", "city": "Goa"},\n]\n```\nbuild `by_city`: city → list of names (in the original order).',
      example: { title: 'grouping with setdefault', code: 'groups = {}\nfor word in ["ant", "bee", "ape"]:\n    groups.setdefault(word[0], []).append(word)\nprint(groups)   # {\'a\': [\'ant\', \'ape\'], \'b\': [\'bee\']}' },
      starter: `students = [
    {"name": "Asha", "city": "Pune"},
    {"name": "Ravi", "city": "Delhi"},
    {"name": "Neha", "city": "Pune"},
    {"name": "Kiran", "city": "Delhi"},
    {"name": "Meena", "city": "Goa"},
]
by_city = {}
# TODO
`,
      solution: `students = [
    {"name": "Asha", "city": "Pune"},
    {"name": "Ravi", "city": "Delhi"},
    {"name": "Neha", "city": "Pune"},
    {"name": "Kiran", "city": "Delhi"},
    {"name": "Meena", "city": "Goa"},
]
by_city = {}
for s in students:
    by_city.setdefault(s["city"], []).append(s["name"])
`,
      tests: [{ call: 'by_city', expect: { Pune: ['Asha', 'Neha'], Delhi: ['Ravi', 'Kiran'], Goa: ['Meena'] } }],
      explain: '`setdefault(city, [])` creates an empty list the first time a city is seen and returns the existing list afterwards, so `.append()` always works. `collections.defaultdict(list)` is an equally good approach.',
    },
  ],
};
