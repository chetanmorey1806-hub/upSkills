export default {
  lesson: 'day-45-final-project-interview',
  minutes: 45,
  intro: 'Final practical: build the core of the Expense Tracker (dataclass, Enum, custom exception, JSON save/load) and answer interview-style output questions.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Interview round: predict the output.',
      code: `def add(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add(1), add(2))
a = [1, 2, 3]
b = a
a += [4]
print(b)
print([i * j for i in range(1, 3) for j in range(2)])
print(bool([]), bool([0]), 0.1 + 0.2 == 0.3)
print(*"abc", sep="-")`,
      expected: '[1, 2] [1, 2]\n[1, 2, 3, 4]\n[0, 1, 0, 2]\nFalse True False\na-b-c',
      explain: 'The default list is created once and shared, and both calls return the **same** list object, so it prints `[1, 2] [1, 2]`. `a += [4]` extends the list in place, so the alias `b` sees it. `[0]` is a non-empty list (truthy). Float maths is not exact. `*"abc"` unpacks the string into three arguments.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview facts: which statements are true? (select all that apply)',
      options: [
        'Tuples can be dictionary keys; lists cannot',
        '`is` compares values, `==` compares identity',
        'A generator produces values lazily and can be iterated only once',
        '`__init__` creates the object; `__new__` initialises it',
        '`@staticmethod` receives neither self nor cls',
      ],
      answers: [0, 2, 4],
      explain: '`==` compares values and `is` identity (reversed in option 2). `__new__` **creates** the instance and `__init__` **initialises** it (reversed in option 4). Hashable tuples work as keys, generators are one-shot, static methods get no implicit first argument.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Project part 1: the model. Create:\n- `Category(Enum)` with `FOOD`, `TRAVEL`, `BILLS`, `OTHER` (values `"food"`, `"travel"`, `"bills"`, `"other"`)\n- `InvalidExpenseError(Exception)`\n- a dataclass `Expense(title: str, amount: float, category: Category = Category.OTHER)` whose `__post_init__` raises `InvalidExpenseError` when amount ≤ 0 or the title is blank',
      example: { title: 'Enum + dataclass together', code: 'from dataclasses import dataclass\nfrom enum import Enum\n\nclass Mode(Enum):\n    UPI = "upi"\n    CASH = "cash"\n\n@dataclass\nclass Payment:\n    amount: float\n    mode: Mode = Mode.UPI' },
      starter: `from dataclasses import dataclass
from enum import Enum

# TODO: Category, InvalidExpenseError, Expense
`,
      solution: `from dataclasses import dataclass
from enum import Enum


class Category(Enum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    OTHER = "other"


class InvalidExpenseError(Exception):
    pass


@dataclass
class Expense:
    title: str
    amount: float
    category: Category = Category.OTHER

    def __post_init__(self):
        if self.amount <= 0:
            raise InvalidExpenseError("amount must be positive")
        if not self.title.strip():
            raise InvalidExpenseError("title is required")
`,
      tests: [
        { call: '[c.value for c in Category]', expect: ['food', 'travel', 'bills', 'other'] },
        { call: '(lambda e: [e.title, e.amount, e.category is Category.OTHER])(Expense("Chai", 20))', expect: ['Chai', 20, true] },
        { call: `exec("_r = []\\nfor _args in [('Taxi', 0), ('  ', 50)]:\\n    try:\\n        Expense(*_args)\\n        _r.append('created')\\n    except InvalidExpenseError:\\n        _r.append('InvalidExpenseError')") or _r`, expect: ['InvalidExpenseError', 'InvalidExpenseError'], msg: 'amount 0 and a blank title must raise InvalidExpenseError' },
        { call: 'issubclass(InvalidExpenseError, Exception)', expect: true },
      ],
      explain: 'An Enum keeps categories to a fixed set (no "Fod" typos), the dataclass removes boilerplate, and validation in `__post_init__` guarantees every Expense object is valid. A custom exception lets the UI catch exactly this problem and show a friendly message.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Project part 2: the service. Using the model from part 1 (copy it in), create `ExpenseTracker` with:\n- `add(title, amount, category=Category.OTHER)` → creates and stores an `Expense`, returns it\n- `total()` → sum of all amounts\n- `by_category()` → dict **category value** → total, e.g. `{"food": 270, "travel": 500}` (only categories that have expenses)\n- `top(n)` → titles of the n most expensive expenses, highest first',
      example: { title: 'aggregating objects', code: 'from collections import defaultdict\nsums = defaultdict(int)\nfor e in expenses:\n    sums[e.category.value] += e.amount' },
      starter: `from dataclasses import dataclass
from enum import Enum

class Category(Enum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    OTHER = "other"

@dataclass
class Expense:
    title: str
    amount: float
    category: Category = Category.OTHER

class ExpenseTracker:
    def __init__(self):
        self.expenses = []
    # TODO: add, total, by_category, top
`,
      solution: `from collections import defaultdict
from dataclasses import dataclass
from enum import Enum


class Category(Enum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    OTHER = "other"


@dataclass
class Expense:
    title: str
    amount: float
    category: Category = Category.OTHER


class ExpenseTracker:
    def __init__(self):
        self.expenses = []

    def add(self, title, amount, category=Category.OTHER):
        expense = Expense(title, amount, category)
        self.expenses.append(expense)
        return expense

    def total(self):
        return sum(e.amount for e in self.expenses)

    def by_category(self):
        sums = defaultdict(int)
        for e in self.expenses:
            sums[e.category.value] += e.amount
        return dict(sums)

    def top(self, n):
        ranked = sorted(self.expenses, key=lambda e: e.amount, reverse=True)
        return [e.title for e in ranked[:n]]
`,
      tests: [
        { call: `(lambda t: (t.add("Lunch", 150, Category.FOOD), t.add("Metro", 60, Category.TRAVEL), t.add("Snacks", 120, Category.FOOD), t.add("Flight", 4500, Category.TRAVEL), [t.total(), t.by_category(), t.top(2)])[4])(ExpenseTracker())`, expect: [4830, { food: 270, travel: 4560 }, ['Flight', 'Lunch']] },
        { call: '[ExpenseTracker().total(), ExpenseTracker().by_category(), ExpenseTracker().top(3)]', expect: [0, {}, []], msg: 'an empty tracker: total 0, {} and []' },
        { call: 'type(ExpenseTracker().add("Tea", 10)).__name__', expect: 'Expense', msg: 'add() must return the created Expense' },
      ],
      explain: 'Keeping logic in a service class (separate from input/output code) makes it easy to unit test, exactly what the grader does. `sorted(..., key=..., reverse=True)` ranks objects by an attribute; `defaultdict(int)` avoids KeyError while summing.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Project part 3: storage. Write `save_expenses(path, expenses)` and `load_expenses(path)` where `expenses` is a list of dicts like `{"title": "Lunch", "amount": 150, "category": "food"}`.\n- save writes them as JSON (use `json.dump` with `indent=2`)\n- load returns the list, or `[]` if the file does not exist **or** contains invalid JSON',
      example: { title: 'JSON file round-trip', code: 'import json\nwith open("data.json", "w") as f:\n    json.dump({"a": 1}, f, indent=2)\nwith open("data.json") as f:\n    print(json.load(f))' },
      starter: `import json

def save_expenses(path, expenses):
    pass  # TODO

def load_expenses(path):
    pass  # TODO
`,
      solution: `import json

def save_expenses(path, expenses):
    with open(path, "w") as f:
        json.dump(expenses, f, indent=2)

def load_expenses(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []
`,
      tests: [
        { call: '(save_expenses("exp.json", [{"title": "Lunch", "amount": 150, "category": "food"}]), load_expenses("exp.json"))[1]', expect: [{ title: 'Lunch', amount: 150, category: 'food' }] },
        { call: 'open("exp.json").read().startswith("[\\n  {")', expect: true, msg: 'use indent=2 so the file is human-readable' },
        { call: 'load_expenses("missing.json")', expect: [] },
        { call: '(open("broken.json", "w").write("{not json"), load_expenses("broken.json"))[1]', expect: [], msg: 'invalid JSON must give [] instead of crashing' },
      ],
      explain: 'Catching a **tuple** of exceptions handles both a first run (no file yet) and a corrupted file. Without this, one bad file would crash the whole app on start-up. Enums are not JSON-serialisable, which is why the file stores `category.value` strings.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview: what is the output of `print(type(lambda: 0).__name__, type(x for x in []).__name__)`?',
      options: ['lambda generator', 'function generator', 'function list', 'lambda tuple'],
      answer: 1,
      explain: 'A lambda is just an anonymous **function** object. Brackets `( )` around a comprehension create a **generator**, not a tuple; use `tuple(x for x in ...)` for a tuple.',
    },
  ],
};
