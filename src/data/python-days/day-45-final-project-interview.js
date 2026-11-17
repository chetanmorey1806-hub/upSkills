export default {
  id: "day-45-final-project-interview",
  title: "Python Final Project, Practical Test, Interview Questions",
  module: "Module 7: Interview Prep & Project",
  day: 45,
  level: "Advanced",
  duration: "4 hours",
  summary: "Bring the whole course together: build a multi-file, menu-driven Expense Tracker console application with OOP, dataclasses, enums, custom exceptions, JSON storage and unit tests, then take a timed practical test and revise 30 must-know Python interview questions.",
  objectives: [
    "Design and build a complete multi-module Python console application",
    "Apply OOP, dataclasses, enums, exceptions, file handling, comprehensions and collections together",
    "Write unit tests for the project and run them",
    "Solve a timed practical test covering core and advanced topics",
    "Revise and answer 30 frequently asked Python interview questions confidently",
  ],
  theory: [
    {
      heading: "Project Overview: Expense Tracker",
      content: "You will build an Expense Tracker that runs in the terminal. Users can add expenses, list them, see a summary by category and month with a budget warning, search, and delete. Data is saved in a JSON file so it survives restarts. This is a realistic mini-project you can put on GitHub and explain in interviews.",
      points: [
        "Add expense with validation (title, amount, category, date)",
        "List all expenses in a neat table",
        "Summary: total, by category (with text bar chart), by month, over-budget months",
        "Search by keyword or category",
        "Delete by id with a proper error if the id does not exist",
        "Auto-save to expenses.json",
      ],
    },
    {
      heading: "Architecture: Separate Responsibilities",
      content: "Professional code is split into layers so each file has one job (Single Responsibility Principle). models.py defines WHAT the data is (Expense dataclass, Category enum, exceptions). storage.py defines WHERE data lives (JSON file) - you could replace it with SQLite or MySQL later without touching the rest. service.py defines the RULES (add, delete, totals, reports). main.py is only the user interface (menu, input, printing). This same layering appears in Flask/Django apps as models, services and views.",
      syntax: `expense_tracker/
|-- models.py      # dataclass, StrEnum, custom exceptions
|-- storage.py     # JSON file handling
|-- service.py     # business logic (OOP + collections)
|-- main.py        # menu-driven console UI (entry point)
|-- test_tracker.py  # unit tests (see next example)
\`-- expenses.json  # created automatically
`,
      tip: "In interviews, explain WHY you split the code: easier testing, easier changes, and team members can work on different layers.",
    },
    {
      heading: "Concepts Used from the Course",
      content: "This project is a revision of almost every module.",
      points: [
        "Module 1-2: variables, f-strings with alignment and thousands separator, loops, lists, dicts",
        "Module 3: functions, default arguments, lambda in sorted(), modules and imports, if __name__ == '__main__'",
        "Module 4: custom exception hierarchy, try/except/else, raise ... from None, JSON file handling with with",
        "Module 5: classes, dataclass with __post_init__ validation, @property, StrEnum, __str__",
        "Module 6: comprehensions, generators in sum()/max(), defaultdict, type hints, unittest",
        "Module 7: logging in storage, PEP 8 naming, clean structure",
      ],
    },
    {
      heading: "Step-by-Step Build Plan",
      content: "Build in small steps and run after each one: 1) Create the folder and a virtual environment (python -m venv venv). 2) Write models.py and test creating Expense objects in the shell. 3) Write storage.py and check that a JSON file is created. 4) Write service.py with add/list/total. 5) Write main.py with the menu loop. 6) Add reports, search and delete. 7) Write unit tests. 8) Add a README.md, requirements.txt (empty - standard library only) and push to GitHub.",
      points: [
        "VS Code: File > Open Folder > expense_tracker, select the venv interpreter (Ctrl+Shift+P > Python: Select Interpreter), run main.py with the play button",
        "PyCharm: New Project > expense_tracker with a new venv, add the files, right-click main.py > Run",
        "Run tests: python -m unittest -v",
      ],
    },
    {
      heading: "Ideas to Extend the Project",
      content: "Extensions show initiative in interviews: export to CSV, monthly budget per category, charts with matplotlib, SQLite storage (sqlite3 module), a Flask/Django web version or a REST API with DRF, user login, and recurring expenses. Use argparse to add command-line options like python main.py --report.",
    },
    {
      heading: "Interview Preparation Strategy",
      content: "Revise definitions (what/why/example), practise the coding programs from Day 43 on paper and in an editor, be ready to explain your project's architecture and challenges, and predict outputs of tricky snippets (mutable defaults, late binding, MRO, integer division). Speak your thought process aloud, write clean names, test with edge cases, and mention complexity.",
      points: [
        "Prepare a 60-second introduction of your project",
        "Know at least one example for each OOP pillar",
        "Be honest - say how you would find the answer if you do not know it",
      ],
    },
  ],
  examples: [
    {
      title: "Final Project: Expense Tracker Console App (multi-file)",
      scenario: "A complete menu-driven console application. The sample session loads sample data, lists, adds a valid expense, tries two invalid ones, searches, deletes (wrong id, then right id), shows the summary and exits.",
      steps: [
        "Create a folder expense_tracker and open it in VS Code or PyCharm",
        "Optional: create a virtual environment: python -m venv venv and activate it",
        "Create models.py, storage.py, service.py and main.py and paste each section of the code into its file",
        "Run: python main.py and follow the menu (type y to load sample data)",
        "To reproduce the result below, enter the same inputs shown after each prompt",
        "Open expenses.json to see the saved data",
      ],
      code: `# ===== Project structure =====
# expense_tracker/
# |-- models.py      # dataclass, StrEnum, custom exceptions
# |-- storage.py     # JSON file handling
# |-- service.py     # business logic (OOP + collections)
# |-- main.py        # menu-driven console UI (entry point)
# |-- test_tracker.py  # unit tests (see next example)
# \`-- expenses.json  # created automatically

# ===== models.py =====
"""models.py - data classes, enums and custom exceptions."""
from dataclasses import dataclass, asdict
from datetime import date
from enum import StrEnum


class Category(StrEnum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    SHOPPING = "shopping"
    OTHER = "other"


class ExpenseError(Exception):
    """Base error for the expense tracker."""


class InvalidExpenseError(ExpenseError):
    """Raised when expense data is not valid."""


class ExpenseNotFoundError(ExpenseError):
    """Raised when an expense id does not exist."""


@dataclass
class Expense:
    id: int
    title: str
    amount: float
    category: Category
    spent_on: str                      # ISO format: YYYY-MM-DD

    def __post_init__(self):
        self.title = self.title.strip().title()
        if not self.title:
            raise InvalidExpenseError("title cannot be empty")
        try:
            self.amount = round(float(self.amount), 2)
        except (TypeError, ValueError):
            raise InvalidExpenseError(f"amount must be a number, got {self.amount!r}") from None
        if self.amount <= 0:
            raise InvalidExpenseError("amount must be greater than 0")
        try:
            self.category = Category(str(self.category).lower())
        except ValueError:
            options = ", ".join(c.value for c in Category)
            raise InvalidExpenseError(f"category must be one of: {options}") from None
        try:
            date.fromisoformat(self.spent_on)
        except ValueError:
            raise InvalidExpenseError("date must be YYYY-MM-DD") from None

    @property
    def month(self) -> str:
        return self.spent_on[:7]

    def to_dict(self) -> dict:
        return asdict(self)

    def __str__(self) -> str:
        return f"#{self.id:<3} {self.spent_on}  {self.title:<16} {self.category:<9} Rs.{self.amount:>9,.2f}"

# ===== storage.py =====
"""storage.py - saves and loads expenses as JSON (file handling + exceptions)."""
import json
import logging

log = logging.getLogger(__name__)


class JSONStorage:
    def __init__(self, path: str):
        self.path = path

    def load(self) -> list[dict]:
        try:
            with open(self.path, encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            log.info("No data file yet, starting empty")
            return []
        except json.JSONDecodeError:
            log.warning("Corrupted data file, starting empty")
            return []

    def save(self, rows: list[dict]) -> None:
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)

# ===== service.py =====
"""service.py - business logic (OOP, comprehensions, collections)."""
from collections import defaultdict
from models import Expense, ExpenseNotFoundError
from storage import JSONStorage


class ExpenseTracker:
    def __init__(self, storage: JSONStorage, monthly_budget: float = 10000):
        self.storage = storage
        self.monthly_budget = monthly_budget
        self.expenses: list[Expense] = [Expense(**row) for row in storage.load()]

    def _next_id(self) -> int:
        return max((e.id for e in self.expenses), default=0) + 1

    def _save(self) -> None:
        self.storage.save([e.to_dict() for e in self.expenses])

    def add(self, title, amount, category, spent_on) -> Expense:
        expense = Expense(self._next_id(), title, amount, category, spent_on)
        self.expenses.append(expense)
        self._save()
        return expense

    def delete(self, expense_id: int) -> Expense:
        for e in self.expenses:
            if e.id == expense_id:
                self.expenses.remove(e)
                self._save()
                return e
        raise ExpenseNotFoundError(f"no expense with id {expense_id}")

    def reset(self, rows: list[tuple]) -> None:
        self.expenses = []
        for row in rows:
            self.add(*row)

    def total(self) -> float:
        return round(sum(e.amount for e in self.expenses), 2)

    def by_category(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.category.value] += e.amount
        return dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))

    def by_month(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.month] += e.amount
        return dict(sorted(totals.items()))

    def search(self, keyword: str) -> list[Expense]:
        keyword = keyword.lower()
        return [e for e in self.expenses if keyword in e.title.lower() or keyword == e.category]

    def over_budget_months(self) -> list[str]:
        return [m for m, amt in self.by_month().items() if amt > self.monthly_budget]

# ===== main.py =====
"""main.py - menu-driven console app (run: python main.py)."""
import sys
from models import ExpenseError
from service import ExpenseTracker
from storage import JSONStorage

SAMPLE = [
    ("Groceries", 2450, "food", "2024-05-02"),
    ("Electricity bill", 1890.5, "bills", "2024-05-05"),
    ("Train to Pune", 760, "travel", "2024-05-11"),
    ("Running shoes", 5200, "shopping", "2024-05-20"),
    ("Restaurant", 1340, "food", "2024-06-01"),
]

MENU = "\\n[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit"


def ask(prompt: str) -> str:
    value = input(prompt).strip()
    if not sys.stdin.isatty():       # echo typed value when input is piped / in the browser
        print(value)
    return value


def show(expenses) -> None:
    if not expenses:
        print("  (nothing to show)")
    for e in expenses:
        print(" ", e)


def summary(tracker: ExpenseTracker) -> None:
    print(f"  Total spent: Rs.{tracker.total():,.2f} in {len(tracker.expenses)} expenses")
    print("  By category:")
    for cat, amt in tracker.by_category().items():
        bar = "#" * int(amt // 500)
        print(f"    {cat:<9} Rs.{amt:>9,.2f} {bar}")
    print("  By month:", {m: round(a, 2) for m, a in tracker.by_month().items()})
    over = tracker.over_budget_months()
    print("  Over budget:", ", ".join(over) if over else "none")


def main() -> None:
    print("===== EXPENSE TRACKER =====")
    tracker = ExpenseTracker(JSONStorage("expenses.json"), monthly_budget=9000)
    if ask("Load sample data? (y/n): ").lower() == "y":
        tracker.reset(SAMPLE)
        print(f"  Loaded {len(SAMPLE)} sample expenses")
    while True:
        print(MENU)
        choice = ask("Choose 1-6: ")
        try:
            if choice == "1":
                exp = tracker.add(ask("Title: "), ask("Amount: "),
                                  ask("Category (food/travel/bills/shopping/other): "),
                                  ask("Date (YYYY-MM-DD): "))
                print("  Added:", exp)
            elif choice == "2":
                show(tracker.expenses)
            elif choice == "3":
                summary(tracker)
            elif choice == "4":
                show(tracker.search(ask("Keyword or category: ")))
            elif choice == "5":
                removed = tracker.delete(int(ask("Expense id: ")))
                print("  Deleted:", removed.title)
            elif choice == "6":
                print("  Data saved to expenses.json. Goodbye!")
                break
            else:
                print("  Invalid choice, try again")
        except ExpenseError as e:
            print("  Error:", e)
        except ValueError:
            print("  Error: please enter a valid number")


if __name__ == "__main__":
    main()
`,
      python: {
        files: {
          "main.py": `"""main.py - menu-driven console app (run: python main.py)."""
import sys
from models import ExpenseError
from service import ExpenseTracker
from storage import JSONStorage

SAMPLE = [
    ("Groceries", 2450, "food", "2024-05-02"),
    ("Electricity bill", 1890.5, "bills", "2024-05-05"),
    ("Train to Pune", 760, "travel", "2024-05-11"),
    ("Running shoes", 5200, "shopping", "2024-05-20"),
    ("Restaurant", 1340, "food", "2024-06-01"),
]

MENU = "\\n[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit"


def ask(prompt: str) -> str:
    value = input(prompt).strip()
    if not sys.stdin.isatty():       # echo typed value when input is piped / in the browser
        print(value)
    return value


def show(expenses) -> None:
    if not expenses:
        print("  (nothing to show)")
    for e in expenses:
        print(" ", e)


def summary(tracker: ExpenseTracker) -> None:
    print(f"  Total spent: Rs.{tracker.total():,.2f} in {len(tracker.expenses)} expenses")
    print("  By category:")
    for cat, amt in tracker.by_category().items():
        bar = "#" * int(amt // 500)
        print(f"    {cat:<9} Rs.{amt:>9,.2f} {bar}")
    print("  By month:", {m: round(a, 2) for m, a in tracker.by_month().items()})
    over = tracker.over_budget_months()
    print("  Over budget:", ", ".join(over) if over else "none")


def main() -> None:
    print("===== EXPENSE TRACKER =====")
    tracker = ExpenseTracker(JSONStorage("expenses.json"), monthly_budget=9000)
    if ask("Load sample data? (y/n): ").lower() == "y":
        tracker.reset(SAMPLE)
        print(f"  Loaded {len(SAMPLE)} sample expenses")
    while True:
        print(MENU)
        choice = ask("Choose 1-6: ")
        try:
            if choice == "1":
                exp = tracker.add(ask("Title: "), ask("Amount: "),
                                  ask("Category (food/travel/bills/shopping/other): "),
                                  ask("Date (YYYY-MM-DD): "))
                print("  Added:", exp)
            elif choice == "2":
                show(tracker.expenses)
            elif choice == "3":
                summary(tracker)
            elif choice == "4":
                show(tracker.search(ask("Keyword or category: ")))
            elif choice == "5":
                removed = tracker.delete(int(ask("Expense id: ")))
                print("  Deleted:", removed.title)
            elif choice == "6":
                print("  Data saved to expenses.json. Goodbye!")
                break
            else:
                print("  Invalid choice, try again")
        except ExpenseError as e:
            print("  Error:", e)
        except ValueError:
            print("  Error: please enter a valid number")


if __name__ == "__main__":
    main()
`,
          "models.py": `"""models.py - data classes, enums and custom exceptions."""
from dataclasses import dataclass, asdict
from datetime import date
from enum import StrEnum


class Category(StrEnum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    SHOPPING = "shopping"
    OTHER = "other"


class ExpenseError(Exception):
    """Base error for the expense tracker."""


class InvalidExpenseError(ExpenseError):
    """Raised when expense data is not valid."""


class ExpenseNotFoundError(ExpenseError):
    """Raised when an expense id does not exist."""


@dataclass
class Expense:
    id: int
    title: str
    amount: float
    category: Category
    spent_on: str                      # ISO format: YYYY-MM-DD

    def __post_init__(self):
        self.title = self.title.strip().title()
        if not self.title:
            raise InvalidExpenseError("title cannot be empty")
        try:
            self.amount = round(float(self.amount), 2)
        except (TypeError, ValueError):
            raise InvalidExpenseError(f"amount must be a number, got {self.amount!r}") from None
        if self.amount <= 0:
            raise InvalidExpenseError("amount must be greater than 0")
        try:
            self.category = Category(str(self.category).lower())
        except ValueError:
            options = ", ".join(c.value for c in Category)
            raise InvalidExpenseError(f"category must be one of: {options}") from None
        try:
            date.fromisoformat(self.spent_on)
        except ValueError:
            raise InvalidExpenseError("date must be YYYY-MM-DD") from None

    @property
    def month(self) -> str:
        return self.spent_on[:7]

    def to_dict(self) -> dict:
        return asdict(self)

    def __str__(self) -> str:
        return f"#{self.id:<3} {self.spent_on}  {self.title:<16} {self.category:<9} Rs.{self.amount:>9,.2f}"
`,
          "storage.py": `"""storage.py - saves and loads expenses as JSON (file handling + exceptions)."""
import json
import logging

log = logging.getLogger(__name__)


class JSONStorage:
    def __init__(self, path: str):
        self.path = path

    def load(self) -> list[dict]:
        try:
            with open(self.path, encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            log.info("No data file yet, starting empty")
            return []
        except json.JSONDecodeError:
            log.warning("Corrupted data file, starting empty")
            return []

    def save(self, rows: list[dict]) -> None:
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)
`,
          "service.py": `"""service.py - business logic (OOP, comprehensions, collections)."""
from collections import defaultdict
from models import Expense, ExpenseNotFoundError
from storage import JSONStorage


class ExpenseTracker:
    def __init__(self, storage: JSONStorage, monthly_budget: float = 10000):
        self.storage = storage
        self.monthly_budget = monthly_budget
        self.expenses: list[Expense] = [Expense(**row) for row in storage.load()]

    def _next_id(self) -> int:
        return max((e.id for e in self.expenses), default=0) + 1

    def _save(self) -> None:
        self.storage.save([e.to_dict() for e in self.expenses])

    def add(self, title, amount, category, spent_on) -> Expense:
        expense = Expense(self._next_id(), title, amount, category, spent_on)
        self.expenses.append(expense)
        self._save()
        return expense

    def delete(self, expense_id: int) -> Expense:
        for e in self.expenses:
            if e.id == expense_id:
                self.expenses.remove(e)
                self._save()
                return e
        raise ExpenseNotFoundError(f"no expense with id {expense_id}")

    def reset(self, rows: list[tuple]) -> None:
        self.expenses = []
        for row in rows:
            self.add(*row)

    def total(self) -> float:
        return round(sum(e.amount for e in self.expenses), 2)

    def by_category(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.category.value] += e.amount
        return dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))

    def by_month(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.month] += e.amount
        return dict(sorted(totals.items()))

    def search(self, keyword: str) -> list[Expense]:
        keyword = keyword.lower()
        return [e for e in self.expenses if keyword in e.title.lower() or keyword == e.category]

    def over_budget_months(self) -> list[str]:
        return [m for m, amt in self.by_month().items() if amt > self.monthly_budget]
`,
        },
        stdin: `y
2
1
Mobile recharge
299
bills
2024-06-03
1
Gift
abc
shopping
2024-06-04
1
Movie
450
fun
2024-06-05
4
food
5
99
5
3
3
7
6
`,
      },
      result: `===== EXPENSE TRACKER =====
Load sample data? (y/n): y
  Loaded 5 sample expenses

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 2
  #1   2024-05-02  Groceries        food      Rs. 2,450.00
  #2   2024-05-05  Electricity Bill bills     Rs. 1,890.50
  #3   2024-05-11  Train To Pune    travel    Rs.   760.00
  #4   2024-05-20  Running Shoes    shopping  Rs. 5,200.00
  #5   2024-06-01  Restaurant       food      Rs. 1,340.00

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 1
Title: Mobile recharge
Amount: 299
Category (food/travel/bills/shopping/other): bills
Date (YYYY-MM-DD): 2024-06-03
  Added: #6   2024-06-03  Mobile Recharge  bills     Rs.   299.00

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 1
Title: Gift
Amount: abc
Category (food/travel/bills/shopping/other): shopping
Date (YYYY-MM-DD): 2024-06-04
  Error: amount must be a number, got 'abc'

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 1
Title: Movie
Amount: 450
Category (food/travel/bills/shopping/other): fun
Date (YYYY-MM-DD): 2024-06-05
  Error: category must be one of: food, travel, bills, shopping, other

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 4
Keyword or category: food
  #1   2024-05-02  Groceries        food      Rs. 2,450.00
  #5   2024-06-01  Restaurant       food      Rs. 1,340.00

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 5
Expense id: 99
  Error: no expense with id 99

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 5
Expense id: 3
  Deleted: Train To Pune

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 3
  Total spent: Rs.11,179.50 in 5 expenses
  By category:
    shopping  Rs. 5,200.00 ##########
    food      Rs. 3,790.00 #######
    bills     Rs. 2,189.50 ####
  By month: {'2024-05': 9540.5, '2024-06': 1639.0}
  Over budget: 2024-05

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 7
  Invalid choice, try again

[1] Add  [2] List  [3] Summary  [4] Search  [5] Delete  [6] Exit
Choose 1-6: 6
  Data saved to expenses.json. Goodbye!`,
      explanation: "models.py validates every expense in __post_init__ and raises InvalidExpenseError with a clear message, so 'abc' as amount and 'fun' as category are rejected without crashing the menu. service.py keeps the list of Expense objects, assigns the next id, and saves to JSON after each change. by_category uses defaultdict and sorts by amount; the summary shows a text bar (one # per Rs.500) and flags May 2024 because 9540.50 > the 9000 budget. main.py only handles input/output and catches ExpenseError and ValueError so the loop keeps running. ask() echoes typed values when input is piped (like in the browser) so the session is readable; in a real terminal you see what you type.",
    },
    {
      title: "Unit Tests for the Project",
      scenario: "Test the models and the service layer automatically, using a separate JSON file that is deleted after each test.",
      steps: [
        "In the expense_tracker folder create test_tracker.py (in the browser IDE it is main.py) and paste the code",
        "Run: python -m unittest -v   (or python test_tracker.py)",
        "In PyCharm: right-click the file > Run 'Unittests in test_tracker'",
        "All tests should pass; try breaking a rule in service.py and run again to see a failure",
      ],
      code: `"""test_tracker.py - unit tests for the expense tracker (run: python -m unittest -v)"""
import io
import os
import unittest
from models import Expense, Category, InvalidExpenseError, ExpenseNotFoundError
from service import ExpenseTracker
from storage import JSONStorage

TEST_FILE = "test_expenses.json"


class TestExpense(unittest.TestCase):
    def test_title_and_category_are_normalised(self):
        e = Expense(1, "  tea and snacks ", "120", "FOOD", "2024-01-01")
        self.assertEqual((e.title, e.amount, e.category), ("Tea And Snacks", 120.0, Category.FOOD))

    def test_invalid_values_raise(self):
        bad_rows = [("", 10, "food", "2024-01-01"), ("x", -5, "food", "2024-01-01"),
                    ("x", 10, "games", "2024-01-01"), ("x", 10, "food", "01-01-2024")]
        for row in bad_rows:
            with self.subTest(row=row):
                with self.assertRaises(InvalidExpenseError):
                    Expense(1, *row)


class TestTracker(unittest.TestCase):
    def setUp(self):
        self.tracker = ExpenseTracker(JSONStorage(TEST_FILE), monthly_budget=1000)
        self.tracker.reset([("Lunch", 300, "food", "2024-03-01"),
                            ("Bus", 50, "travel", "2024-03-02"),
                            ("Dinner", 800, "food", "2024-03-09")])

    def tearDown(self):
        if os.path.exists(TEST_FILE):
            os.remove(TEST_FILE)

    def test_total_and_ids(self):
        self.assertEqual(self.tracker.total(), 1150)
        self.assertEqual([e.id for e in self.tracker.expenses], [1, 2, 3])

    def test_by_category_sorted_desc(self):
        self.assertEqual(self.tracker.by_category(), {"food": 1100.0, "travel": 50.0})

    def test_delete_and_not_found(self):
        self.tracker.delete(2)
        self.assertEqual(len(self.tracker.expenses), 2)
        with self.assertRaises(ExpenseNotFoundError):
            self.tracker.delete(2)

    def test_data_persists_to_json(self):
        reloaded = ExpenseTracker(JSONStorage(TEST_FILE))
        self.assertEqual(reloaded.total(), 1150)

    def test_over_budget(self):
        self.assertEqual(self.tracker.over_budget_months(), ["2024-03"])

    def test_search(self):
        self.assertEqual([e.title for e in self.tracker.search("din")], ["Dinner"])


if __name__ == "__main__":
    # Locally: python -m unittest -v   (here we print a stable, path-free report)
    suite = unittest.defaultTestLoader.loadTestsFromModule(__import__(__name__))
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
    for line in stream.getvalue().splitlines():
        if line.endswith((" ok", " FAIL", " ERROR")):
            print(line.split(" (")[0], "->", line.rsplit(" ", 1)[-1])
    print(f"Ran {result.testsRun} tests | OK = {result.wasSuccessful()}")

# (uses the same models.py, storage.py and service.py from the project)
`,
      python: {
        files: {
          "main.py": `"""test_tracker.py - unit tests for the expense tracker (run: python -m unittest -v)"""
import io
import os
import unittest
from models import Expense, Category, InvalidExpenseError, ExpenseNotFoundError
from service import ExpenseTracker
from storage import JSONStorage

TEST_FILE = "test_expenses.json"


class TestExpense(unittest.TestCase):
    def test_title_and_category_are_normalised(self):
        e = Expense(1, "  tea and snacks ", "120", "FOOD", "2024-01-01")
        self.assertEqual((e.title, e.amount, e.category), ("Tea And Snacks", 120.0, Category.FOOD))

    def test_invalid_values_raise(self):
        bad_rows = [("", 10, "food", "2024-01-01"), ("x", -5, "food", "2024-01-01"),
                    ("x", 10, "games", "2024-01-01"), ("x", 10, "food", "01-01-2024")]
        for row in bad_rows:
            with self.subTest(row=row):
                with self.assertRaises(InvalidExpenseError):
                    Expense(1, *row)


class TestTracker(unittest.TestCase):
    def setUp(self):
        self.tracker = ExpenseTracker(JSONStorage(TEST_FILE), monthly_budget=1000)
        self.tracker.reset([("Lunch", 300, "food", "2024-03-01"),
                            ("Bus", 50, "travel", "2024-03-02"),
                            ("Dinner", 800, "food", "2024-03-09")])

    def tearDown(self):
        if os.path.exists(TEST_FILE):
            os.remove(TEST_FILE)

    def test_total_and_ids(self):
        self.assertEqual(self.tracker.total(), 1150)
        self.assertEqual([e.id for e in self.tracker.expenses], [1, 2, 3])

    def test_by_category_sorted_desc(self):
        self.assertEqual(self.tracker.by_category(), {"food": 1100.0, "travel": 50.0})

    def test_delete_and_not_found(self):
        self.tracker.delete(2)
        self.assertEqual(len(self.tracker.expenses), 2)
        with self.assertRaises(ExpenseNotFoundError):
            self.tracker.delete(2)

    def test_data_persists_to_json(self):
        reloaded = ExpenseTracker(JSONStorage(TEST_FILE))
        self.assertEqual(reloaded.total(), 1150)

    def test_over_budget(self):
        self.assertEqual(self.tracker.over_budget_months(), ["2024-03"])

    def test_search(self):
        self.assertEqual([e.title for e in self.tracker.search("din")], ["Dinner"])


if __name__ == "__main__":
    # Locally: python -m unittest -v   (here we print a stable, path-free report)
    suite = unittest.defaultTestLoader.loadTestsFromModule(__import__(__name__))
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
    for line in stream.getvalue().splitlines():
        if line.endswith((" ok", " FAIL", " ERROR")):
            print(line.split(" (")[0], "->", line.rsplit(" ", 1)[-1])
    print(f"Ran {result.testsRun} tests | OK = {result.wasSuccessful()}")
`,
          "models.py": `"""models.py - data classes, enums and custom exceptions."""
from dataclasses import dataclass, asdict
from datetime import date
from enum import StrEnum


class Category(StrEnum):
    FOOD = "food"
    TRAVEL = "travel"
    BILLS = "bills"
    SHOPPING = "shopping"
    OTHER = "other"


class ExpenseError(Exception):
    """Base error for the expense tracker."""


class InvalidExpenseError(ExpenseError):
    """Raised when expense data is not valid."""


class ExpenseNotFoundError(ExpenseError):
    """Raised when an expense id does not exist."""


@dataclass
class Expense:
    id: int
    title: str
    amount: float
    category: Category
    spent_on: str                      # ISO format: YYYY-MM-DD

    def __post_init__(self):
        self.title = self.title.strip().title()
        if not self.title:
            raise InvalidExpenseError("title cannot be empty")
        try:
            self.amount = round(float(self.amount), 2)
        except (TypeError, ValueError):
            raise InvalidExpenseError(f"amount must be a number, got {self.amount!r}") from None
        if self.amount <= 0:
            raise InvalidExpenseError("amount must be greater than 0")
        try:
            self.category = Category(str(self.category).lower())
        except ValueError:
            options = ", ".join(c.value for c in Category)
            raise InvalidExpenseError(f"category must be one of: {options}") from None
        try:
            date.fromisoformat(self.spent_on)
        except ValueError:
            raise InvalidExpenseError("date must be YYYY-MM-DD") from None

    @property
    def month(self) -> str:
        return self.spent_on[:7]

    def to_dict(self) -> dict:
        return asdict(self)

    def __str__(self) -> str:
        return f"#{self.id:<3} {self.spent_on}  {self.title:<16} {self.category:<9} Rs.{self.amount:>9,.2f}"
`,
          "storage.py": `"""storage.py - saves and loads expenses as JSON (file handling + exceptions)."""
import json
import logging

log = logging.getLogger(__name__)


class JSONStorage:
    def __init__(self, path: str):
        self.path = path

    def load(self) -> list[dict]:
        try:
            with open(self.path, encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            log.info("No data file yet, starting empty")
            return []
        except json.JSONDecodeError:
            log.warning("Corrupted data file, starting empty")
            return []

    def save(self, rows: list[dict]) -> None:
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2)
`,
          "service.py": `"""service.py - business logic (OOP, comprehensions, collections)."""
from collections import defaultdict
from models import Expense, ExpenseNotFoundError
from storage import JSONStorage


class ExpenseTracker:
    def __init__(self, storage: JSONStorage, monthly_budget: float = 10000):
        self.storage = storage
        self.monthly_budget = monthly_budget
        self.expenses: list[Expense] = [Expense(**row) for row in storage.load()]

    def _next_id(self) -> int:
        return max((e.id for e in self.expenses), default=0) + 1

    def _save(self) -> None:
        self.storage.save([e.to_dict() for e in self.expenses])

    def add(self, title, amount, category, spent_on) -> Expense:
        expense = Expense(self._next_id(), title, amount, category, spent_on)
        self.expenses.append(expense)
        self._save()
        return expense

    def delete(self, expense_id: int) -> Expense:
        for e in self.expenses:
            if e.id == expense_id:
                self.expenses.remove(e)
                self._save()
                return e
        raise ExpenseNotFoundError(f"no expense with id {expense_id}")

    def reset(self, rows: list[tuple]) -> None:
        self.expenses = []
        for row in rows:
            self.add(*row)

    def total(self) -> float:
        return round(sum(e.amount for e in self.expenses), 2)

    def by_category(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.category.value] += e.amount
        return dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))

    def by_month(self) -> dict[str, float]:
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e.month] += e.amount
        return dict(sorted(totals.items()))

    def search(self, keyword: str) -> list[Expense]:
        keyword = keyword.lower()
        return [e for e in self.expenses if keyword in e.title.lower() or keyword == e.category]

    def over_budget_months(self) -> list[str]:
        return [m for m, amt in self.by_month().items() if amt > self.monthly_budget]
`,
        },
      },
      result: `test_invalid_values_raise -> ok
test_title_and_category_are_normalised -> ok
test_by_category_sorted_desc -> ok
test_data_persists_to_json -> ok
test_delete_and_not_found -> ok
test_over_budget -> ok
test_search -> ok
test_total_and_ids -> ok
Ran 8 tests | OK = True`,
      explanation: "TestExpense checks validation: input is normalised and four kinds of bad data each raise InvalidExpenseError (subTest reports each row separately). TestTracker uses setUp to create fresh data before every test and tearDown to delete the test file, so tests are independent. We test totals, ids, sorting, deletion errors, JSON persistence (a new tracker reloads the same file), budget logic and search. Locally run: python -m unittest -v.",
    },
    {
      title: "Practical Test with Solutions",
      scenario: "A 60-minute practical test covering data structures, regex, decorators, generators, dataclasses, JSON and exceptions. Try each question yourself first, then compare.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `# PRACTICAL TEST (60 minutes) - solutions
from collections import Counter
from functools import wraps
from dataclasses import dataclass
import json
import re

print("Q1. Second highest unique salary")
salaries = [45000, 72000, 38000, 72000, 61000]
print("   ", sorted(set(salaries))[-2])

print("Q2. Validate emails and extract domains")
emails = ["asha@gmail.com", "ravi@company.co.in", "wrong@", "neha.k@yahoo.com"]
valid = [e for e in emails if re.fullmatch(r"[\\w.]+@[\\w-]+(\\.[\\w-]+)+", e)]
print("   ", valid, Counter(e.split("@")[1] for e in valid))

print("Q3. Decorator that counts calls")
def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def greet(name):
    return f"Hi {name}"

for n in ["A", "B", "C"]:
    greet(n)
print("   ", greet.__name__, "called", greet.calls, "times")

print("Q4. Generator for batches")
def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]
print("   ", list(batches(list(range(1, 8)), 3)))

print("Q5. Dataclass + JSON round trip")
@dataclass
class Book:
    title: str
    price: float
books = [Book("Python", 499), Book("SQL", 350)]
text = json.dumps([b.__dict__ for b in books])
back = [Book(**d) for d in json.loads(text)]
print("   ", text)
print("   ", back == books, sum(b.price for b in back))

print("Q6. Custom exception for bank withdrawal")
class InsufficientBalance(Exception):
    def __init__(self, need, have):
        super().__init__(f"need {need}, have {have}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientBalance(amount, balance)
    return balance - amount

for amt in (300, 5000):
    try:
        print("    balance left:", withdraw(1000, amt))
    except InsufficientBalance as e:
        print("    InsufficientBalance:", e)

print("Q7. Word frequency (top 3, case-insensitive)")
text = "Python is easy. Python is fun, and python is powerful!"
words = re.findall(r"[a-z]+", text.lower())
print("   ", Counter(words).most_common(3))
`,
      python: {
        files: {
          "main.py": `# PRACTICAL TEST (60 minutes) - solutions
from collections import Counter
from functools import wraps
from dataclasses import dataclass
import json
import re

print("Q1. Second highest unique salary")
salaries = [45000, 72000, 38000, 72000, 61000]
print("   ", sorted(set(salaries))[-2])

print("Q2. Validate emails and extract domains")
emails = ["asha@gmail.com", "ravi@company.co.in", "wrong@", "neha.k@yahoo.com"]
valid = [e for e in emails if re.fullmatch(r"[\\w.]+@[\\w-]+(\\.[\\w-]+)+", e)]
print("   ", valid, Counter(e.split("@")[1] for e in valid))

print("Q3. Decorator that counts calls")
def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def greet(name):
    return f"Hi {name}"

for n in ["A", "B", "C"]:
    greet(n)
print("   ", greet.__name__, "called", greet.calls, "times")

print("Q4. Generator for batches")
def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]
print("   ", list(batches(list(range(1, 8)), 3)))

print("Q5. Dataclass + JSON round trip")
@dataclass
class Book:
    title: str
    price: float
books = [Book("Python", 499), Book("SQL", 350)]
text = json.dumps([b.__dict__ for b in books])
back = [Book(**d) for d in json.loads(text)]
print("   ", text)
print("   ", back == books, sum(b.price for b in back))

print("Q6. Custom exception for bank withdrawal")
class InsufficientBalance(Exception):
    def __init__(self, need, have):
        super().__init__(f"need {need}, have {have}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientBalance(amount, balance)
    return balance - amount

for amt in (300, 5000):
    try:
        print("    balance left:", withdraw(1000, amt))
    except InsufficientBalance as e:
        print("    InsufficientBalance:", e)

print("Q7. Word frequency (top 3, case-insensitive)")
text = "Python is easy. Python is fun, and python is powerful!"
words = re.findall(r"[a-z]+", text.lower())
print("   ", Counter(words).most_common(3))
`,
        },
      },
      result: `Q1. Second highest unique salary
    61000
Q2. Validate emails and extract domains
    ['asha@gmail.com', 'ravi@company.co.in', 'neha.k@yahoo.com'] Counter({'gmail.com': 1, 'company.co.in': 1, 'yahoo.com': 1})
Q3. Decorator that counts calls
    greet called 3 times
Q4. Generator for batches
    [[1, 2, 3], [4, 5, 6], [7]]
Q5. Dataclass + JSON round trip
    [{"title": "Python", "price": 499}, {"title": "SQL", "price": 350}]
    True 849
Q6. Custom exception for bank withdrawal
    balance left: 700
    InsufficientBalance: need 5000, have 1000
Q7. Word frequency (top 3, case-insensitive)
    [('python', 3), ('is', 3), ('easy', 1)]`,
      explanation: "Q1 removes duplicates with set before sorting. Q2 uses fullmatch for validation and Counter for domain counts. Q3 stores the count as an attribute on the wrapper and keeps the name with wraps. Q4 is a generator that yields slices. Q5 converts dataclasses to dicts and back; dataclass __eq__ makes back == books True. Q6 raises a custom exception with a helpful message. Q7 extracts words with regex and counts them.",
    },
    {
      title: "Interview Round: Predict the Output",
      scenario: "Fifteen tricky snippets interviewers love. Write your answers first, then run the code.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `# INTERVIEW ROUND: predict the output, then run to check
print("1.", [i * 2 for i in range(3)] == list(map(lambda i: i * 2, range(3))))

def add_item(x, bucket=[]):
    bucket.append(x)
    return bucket
add_item(1)
print("2.", add_item(2))                      # mutable default trap

a = [1, 2, 3]
b = a
b += [4]
print("3.", a, a is b)

t = (1, [2, 3])
t[1].append(4)
print("4.", t)

print("5.", "".join(sorted("python")), "python"[::-2])

x = 10
def outer():
    x = 20
    def inner():
        nonlocal x
        x += 1
        return x
    return inner()
print("6.", outer(), x)

print("7.", bool([]), bool([0]), 0 or "default", 5 and 0)

d = {"a": 1}
d.setdefault("b", []).append(9)
print("8.", d, d.get("z", "missing"))

gen = (n * n for n in range(4))
print("9.", sum(gen), sum(gen))

class A:
    def hi(self): return "A"
class B(A):
    def hi(self): return "B" + super().hi()
class C(A):
    def hi(self): return "C" + super().hi()
class D(B, C):
    pass
print("10.", D().hi(), [k.__name__ for k in D.__mro__])

print("11.", 7 // 2, -7 // 2, 7 % 3, -7 % 3, 2 ** 3 ** 2)

print("12.", {1, 2, 3} & {2, 3, 4}, {1, 2} | {5}, {1, 2, 3} - {2})

s = "hello"
try:
    s[0] = "H"
except TypeError as e:
    print("13.", type(e).__name__)

print("14.", [(i, j) for i in range(2) for j in range(i + 1)])

funcs = [lambda: i for i in range(3)]
print("15.", [f() for f in funcs])            # late binding
`,
      python: {
        files: {
          "main.py": `# INTERVIEW ROUND: predict the output, then run to check
print("1.", [i * 2 for i in range(3)] == list(map(lambda i: i * 2, range(3))))

def add_item(x, bucket=[]):
    bucket.append(x)
    return bucket
add_item(1)
print("2.", add_item(2))                      # mutable default trap

a = [1, 2, 3]
b = a
b += [4]
print("3.", a, a is b)

t = (1, [2, 3])
t[1].append(4)
print("4.", t)

print("5.", "".join(sorted("python")), "python"[::-2])

x = 10
def outer():
    x = 20
    def inner():
        nonlocal x
        x += 1
        return x
    return inner()
print("6.", outer(), x)

print("7.", bool([]), bool([0]), 0 or "default", 5 and 0)

d = {"a": 1}
d.setdefault("b", []).append(9)
print("8.", d, d.get("z", "missing"))

gen = (n * n for n in range(4))
print("9.", sum(gen), sum(gen))

class A:
    def hi(self): return "A"
class B(A):
    def hi(self): return "B" + super().hi()
class C(A):
    def hi(self): return "C" + super().hi()
class D(B, C):
    pass
print("10.", D().hi(), [k.__name__ for k in D.__mro__])

print("11.", 7 // 2, -7 // 2, 7 % 3, -7 % 3, 2 ** 3 ** 2)

print("12.", {1, 2, 3} & {2, 3, 4}, {1, 2} | {5}, {1, 2, 3} - {2})

s = "hello"
try:
    s[0] = "H"
except TypeError as e:
    print("13.", type(e).__name__)

print("14.", [(i, j) for i in range(2) for j in range(i + 1)])

funcs = [lambda: i for i in range(3)]
print("15.", [f() for f in funcs])            # late binding
`,
        },
      },
      result: `1. True
2. [1, 2]
3. [1, 2, 3, 4] True
4. (1, [2, 3, 4])
5. hnopty nhy
6. 21 10
7. False True default 0
8. {'a': 1, 'b': [9]} missing
9. 14 0
10. BCA ['D', 'B', 'C', 'A', 'object']
11. 3 -4 1 2 512
12. {2, 3} {1, 2, 5} {1, 3}
13. TypeError
14. [(0, 0), (1, 0), (1, 1)]
15. [2, 2, 2]`,
      explanation: "2: the default list is shared between calls. 3: += on a list mutates it in place, so a changes too. 4: the tuple cannot change, but the list inside it can. 6: nonlocal changes outer()'s x, not the global. 7: 'or' returns the first truthy value and 'and' returns the first falsy one. 9: a generator is exhausted after one use. 10: MRO for D(B, C) is D, B, C, A, object, so super() in B goes to C. 11: // floors toward minus infinity, % takes the sign of the divisor, and ** is right-associative (3 ** 2 first). 15: lambdas look up i when called (late binding), so all see 2.",
    },
  ],
  interview: [
    {
      q: "What are the key features of Python?",
      a: "Interpreted, dynamically typed, high-level, object-oriented and multi-paradigm, huge standard library, platform independent, readable syntax, automatic memory management, and a large ecosystem (Django, Pandas, NumPy).",
      level: "Easy",
    },
    {
      q: "What is the difference between a list and a tuple?",
      a: "Lists are mutable, use [], have more methods and use slightly more memory. Tuples are immutable, use (), are hashable (if their items are) and can be dict keys; they are good for fixed records.",
      level: "Easy",
    },
    {
      q: "Difference between list, set and dict?",
      a: "list: ordered, allows duplicates, indexed. set: unordered, unique items, fast membership. dict: key-value pairs, unique hashable keys, insertion ordered (3.7+), O(1) average lookup.",
      level: "Easy",
    },
    {
      q: "What is the difference between is and ==?",
      a: "== compares values; is compares identity (same object in memory). Use is only for None, True, False and singletons.",
      level: "Easy",
    },
    {
      q: "What are *args and **kwargs?",
      a: "*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict. They allow functions to accept a variable number of arguments.",
      level: "Easy",
    },
    {
      q: "Explain LEGB rule.",
      a: "Python resolves names in the order Local, Enclosing, Global, Built-in. global and nonlocal let you assign to global or enclosing variables.",
      level: "Medium",
    },
    {
      q: "What is a lambda function?",
      a: "A small anonymous single-expression function: lambda x: x * 2. Commonly used as a key function in sorted(), map() and filter().",
      level: "Easy",
    },
    {
      q: "What is the mutable default argument problem?",
      a: "Default values are evaluated once when the function is defined, so a default list/dict is shared across calls. Use None as default and create the object inside.",
      level: "Medium",
    },
    {
      q: "What are the four pillars of OOP?",
      a: "Encapsulation (bundling data and methods, controlling access), Abstraction (exposing only essentials, e.g. ABCs), Inheritance (reusing code from parent classes), Polymorphism (same interface, different behaviour).",
      level: "Easy",
    },
    {
      q: "Difference between @staticmethod and @classmethod?",
      a: "A classmethod receives the class (cls) and can create/alter class state (alternative constructors). A staticmethod receives nothing implicit - it is a plain function grouped in the class.",
      level: "Medium",
    },
    {
      q: "What is MRO?",
      a: "Method Resolution Order: the order in which Python searches classes for a method in multiple inheritance, computed by the C3 linearisation; view it with Class.__mro__ or Class.mro().",
      level: "Medium",
    },
    {
      q: "What is __init__ vs __new__?",
      a: "__new__ creates and returns the instance (rarely overridden, e.g. singletons, immutable types); __init__ initialises the already-created instance.",
      level: "Hard",
    },
    {
      q: "What is a decorator?",
      a: "A function that takes a function and returns a wrapped version adding behaviour (logging, auth, caching) without changing the original code. Applied with @decorator.",
      level: "Medium",
    },
    {
      q: "What is a generator and why use it?",
      a: "A function using yield that produces values lazily one at a time. It saves memory and can represent large or infinite sequences.",
      level: "Medium",
    },
    {
      q: "What is a context manager?",
      a: "An object implementing __enter__ and __exit__ used with the with statement to guarantee setup and cleanup, e.g. closing files or releasing locks.",
      level: "Medium",
    },
    {
      q: "Shallow copy vs deep copy?",
      a: "Shallow copy creates a new outer object but shares nested objects; deep copy (copy.deepcopy) recursively copies everything.",
      level: "Medium",
    },
    {
      q: "How is memory managed in Python?",
      a: "Private heap managed by the interpreter, reference counting to free objects immediately, and a generational garbage collector for reference cycles.",
      level: "Hard",
    },
    {
      q: "What is the GIL?",
      a: "CPython's Global Interpreter Lock lets only one thread execute Python bytecode at a time. Threads help I/O-bound work; multiprocessing is used for CPU-bound work.",
      level: "Hard",
    },
    {
      q: "Difference between threading, multiprocessing and asyncio?",
      a: "threading: multiple OS threads sharing memory, good for I/O. multiprocessing: separate processes, true parallelism for CPU work. asyncio: single-threaded cooperative concurrency with async/await, best for many network connections.",
      level: "Hard",
    },
    {
      q: "What are exceptions and how do you handle them?",
      a: "Errors raised at runtime. Handle them with try/except (specific exceptions first), else (runs if no exception), finally (always runs). Raise with raise and create custom exceptions by subclassing Exception.",
      level: "Easy",
    },
    {
      q: "Difference between append() and extend()?",
      a: "append adds its argument as one element (even a list); extend iterates the argument and adds each element.",
      level: "Easy",
    },
    {
      q: "What is list comprehension? Give an example.",
      a: "A concise way to build lists: [x * x for x in range(10) if x % 2 == 0]. Similar syntax exists for dicts, sets and generators.",
      level: "Easy",
    },
    {
      q: "What does if __name__ == '__main__' do?",
      a: "Code inside it runs only when the file is executed directly, not when it is imported as a module - used for entry points and quick tests.",
      level: "Easy",
    },
    {
      q: "What is a virtual environment and why use it?",
      a: "An isolated Python environment (python -m venv venv) with its own packages, so different projects can use different package versions without conflicts. Dependencies are listed in requirements.txt.",
      level: "Easy",
    },
    {
      q: "What are dataclasses and enums used for?",
      a: "@dataclass auto-generates __init__, __repr__ and __eq__ for data-holding classes. Enum defines a fixed set of named constants (statuses, roles) to avoid magic strings.",
      level: "Medium",
    },
    {
      q: "What is duck typing?",
      a: "Using an object based on the methods it supports rather than its type: if it has read(), it can be treated like a file.",
      level: "Medium",
    },
    {
      q: "What is PEP 8?",
      a: "Python's official style guide: 4-space indentation, snake_case functions, PascalCase classes, UPPER_CASE constants, organised imports and limited line length.",
      level: "Easy",
    },
    {
      q: "How do you test Python code?",
      a: "With unittest (built-in, TestCase classes) or pytest (plain asserts, fixtures, parametrize). Use mocks to isolate external dependencies and measure coverage.",
      level: "Medium",
    },
    {
      q: `What is the output?
print(0.1 + 0.2 == 0.3, round(0.1 + 0.2, 2) == 0.3)`,
      a: "False True - floating-point numbers cannot represent 0.1 exactly; compare with rounding, math.isclose or Decimal.",
      level: "Medium",
    },
    {
      q: `What is the output?
x = [1, 2, 3]
print(x[10:], x[-1:-4:-1])`,
      a: "[] [3, 2, 1] - slicing never raises IndexError; the negative step reverses.",
      level: "Medium",
    },
    {
      q: "Explain your project in an interview.",
      a: "Example: 'I built a modular Expense Tracker in Python. models.py uses a dataclass with validation and an enum for categories, storage.py persists data as JSON, service.py contains the business logic like category and monthly reports with budget alerts, and main.py is a menu-driven CLI. I handled invalid input with a custom exception hierarchy and covered the logic with unittest. Next I would move storage to MySQL and expose it as a Django REST API.'",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Add an 'Export to CSV' option to the Expense Tracker that writes expenses.csv with a header row.",
      hint: "Use csv.DictWriter with fieldnames from Expense.to_dict().keys().",
      solution: `import csv
def export_csv(tracker, path="expenses.csv"):
    rows = [e.to_dict() for e in tracker.expenses]
    if not rows:
        return 0
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    return len(rows)
# In main.py: elif choice == "7": print("  Exported", export_csv(tracker), "rows")
`,
    },
    {
      task: "Add a method top_expenses(n) to ExpenseTracker that returns the n most expensive expenses.",
      hint: "sorted with key and reverse, then slice; or heapq.nlargest.",
      solution: `import heapq
def top_expenses(self, n=3):
    return heapq.nlargest(n, self.expenses, key=lambda e: e.amount)
# ExpenseTracker.top_expenses = top_expenses
`,
    },
    {
      task: "Build a Library Management console app: Book dataclass (id, title, author, available), add/issue/return/list, custom exceptions BookNotAvailable and BookNotFound, JSON storage.",
      hint: "Reuse the same 4-layer structure as the Expense Tracker.",
      solution: `from dataclasses import dataclass, asdict
class BookNotFound(Exception): pass
class BookNotAvailable(Exception): pass
@dataclass
class Book:
    id: int
    title: str
    author: str
    available: bool = True
class Library:
    def __init__(self): self.books = {}
    def add(self, title, author):
        b = Book(len(self.books) + 1, title, author)
        self.books[b.id] = b
        return b
    def issue(self, book_id):
        b = self.books.get(book_id)
        if b is None: raise BookNotFound(book_id)
        if not b.available: raise BookNotAvailable(b.title)
        b.available = False
    def give_back(self, book_id):
        self.books[book_id].available = True
lib = Library(); lib.add("Python 101", "Asha"); lib.issue(1)
try:
    lib.issue(1)
except BookNotAvailable as e:
    print("Not available:", e)
`,
    },
    {
      task: "Write a decorator log_action that logs every service method call (method name and arguments) using the logging module.",
      hint: "Use functools.wraps and logging.getLogger(__name__).",
      solution: `import logging
from functools import wraps
log = logging.getLogger("tracker")
def log_action(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        log.info("%s called with %s %s", func.__name__, args[1:], kwargs)
        return func(*args, **kwargs)
    return wrapper
# Decorate: @log_action above add() and delete() in ExpenseTracker
`,
    },
    {
      task: "Use argparse so that 'python main.py --report' prints only the summary and exits.",
      hint: "parser.add_argument('--report', action='store_true')",
      solution: `import argparse
parser = argparse.ArgumentParser(description="Expense Tracker")
parser.add_argument("--report", action="store_true", help="print summary and exit")
args = parser.parse_args()
if args.report:
    tracker = ExpenseTracker(JSONStorage("expenses.json"))
    summary(tracker)
else:
    main()
`,
    },
    {
      task: "Replace JSONStorage with an SQLiteStorage class that has the same load() and save() methods.",
      hint: "sqlite3 with a table expenses(id, title, amount, category, spent_on).",
      solution: `import sqlite3
class SQLiteStorage:
    def __init__(self, path="expenses.db"):
        self.conn = sqlite3.connect(path)
        self.conn.execute("CREATE TABLE IF NOT EXISTS expenses(id INTEGER PRIMARY KEY, title TEXT, amount REAL, category TEXT, spent_on TEXT)")
    def load(self):
        cur = self.conn.execute("SELECT id, title, amount, category, spent_on FROM expenses")
        cols = ["id", "title", "amount", "category", "spent_on"]
        return [dict(zip(cols, row)) for row in cur]
    def save(self, rows):
        with self.conn:
            self.conn.execute("DELETE FROM expenses")
            self.conn.executemany("INSERT INTO expenses VALUES (:id, :title, :amount, :category, :spent_on)", rows)
# tracker = ExpenseTracker(SQLiteStorage())  - no other code changes needed!
`,
    },
  ],
  quiz: [
    {
      question: "In the project, which file should contain the menu and input() calls?",
      options: [
        "models.py",
        "storage.py",
        "main.py",
        "service.py",
      ],
      answer: 2,
      explanation: "The UI layer (main.py) handles input/output only.",
    },
    {
      question: "Why does Expense validate data in __post_init__?",
      options: [
        "To make the class faster",
        "So invalid objects can never be created",
        "Because __init__ is not allowed in dataclasses",
        "To save to JSON",
      ],
      answer: 1,
      explanation: "Validation at creation keeps every Expense object valid.",
    },
    {
      question: "What is printed by: funcs = [lambda: i for i in range(3)]; print([f() for f in funcs])",
      options: [
        "[0, 1, 2]",
        "[2, 2, 2]",
        "[0, 0, 0]",
        "Error",
      ],
      answer: 1,
      explanation: "Late binding: each lambda reads i when called, and i is 2 by then.",
    },
    {
      question: "Which design benefit lets us swap JSONStorage for SQLiteStorage without changing service.py?",
      options: [
        "Separation of concerns / same interface (duck typing)",
        "Multiple inheritance",
        "Global variables",
        "Recursion",
      ],
      answer: 0,
      explanation: "Both storages expose load() and save(), so the service does not care which one it uses.",
    },
    {
      question: "Output of print(-7 // 2, -7 % 3)?",
      options: [
        "-3 -1",
        "-3 2",
        "-4 -1",
        "-4 2",
      ],
      answer: 3,
      explanation: "Floor division rounds down to -4; modulo takes the sign of the divisor, giving 2.",
    },
  ],
};
