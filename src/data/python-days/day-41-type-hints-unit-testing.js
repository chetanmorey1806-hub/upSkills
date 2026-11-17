export default {
  id: "day-41-type-hints-unit-testing",
  title: "Type Hints and Unit Testing (unittest / pytest)",
  module: "Module 6: Advanced Python",
  day: 41,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Add type hints to make code self-documenting and checkable with tools like mypy, then write automated unit tests with unittest and pytest, including assertions, fixtures, parametrized tests and mocking.",
  objectives: [
    "Annotate variables, parameters and return values using built-in and typing types",
    "Use Optional/Union (X | None), list[int], dict[str, int], Callable, TypedDict and Protocol",
    "Write unit tests with unittest.TestCase, setUp and assert methods",
    "Write pytest-style tests with plain assert, fixtures and parametrize",
    "Isolate external dependencies with unittest.mock and understand test coverage",
  ],
  theory: [
    {
      heading: "What are Type Hints?",
      content: "Type hints (PEP 484) let you write the expected type of variables, parameters and return values. Python does NOT enforce them at runtime - the program runs the same - but editors (VS Code Pylance, PyCharm) use them for autocomplete and warnings, and static checkers like mypy find bugs before running. Analogy: labels on kitchen jars - the jar will still hold anything, but labels prevent you from putting salt in your tea.",
      syntax: `age: int = 25
names: list[str] = ["Asha", "Ravi"]
scores: dict[str, float] = {"maths": 91.5}

def greet(name: str, times: int = 1) -> str:
    return ("Hi " + name + " ") * times
`,
      points: [
        "Install and run: pip install mypy ; mypy main.py",
        "Hints are stored in func.__annotations__",
        "Python 3.9+: use list[int] instead of typing.List[int]",
      ],
    },
    {
      heading: "Useful typing Constructs",
      content: "Optional[str] or str | None means 'a str or None'. Union[int, str] or int | str means either type. Any disables checking. Callable[[int, int], int] describes a function. Tuple types: tuple[int, str]. TypedDict describes dict shapes (like JSON). Literal['GET', 'POST'] restricts to exact values. Protocol describes duck-typed interfaces. TypeVar and generics make reusable typed functions. Type aliases: UserId = int.",
      syntax: `from typing import Callable, TypedDict, Literal

def find_user(uid: int) -> dict | None: ...

def apply(f: Callable[[int], int], x: int) -> int:
    return f(x)

class User(TypedDict):
    name: str
    age: int

Method = Literal["GET", "POST"]
`,
    },
    {
      heading: "Why Unit Testing?",
      content: "A unit test is a small piece of code that checks one unit (usually a function or method) gives the expected output for a given input. Tests catch bugs early, protect you when refactoring, document how code should behave, and are required in every professional job (CI pipelines run them on every push). Arrange-Act-Assert is the common pattern: prepare data, call the function, check the result.",
      points: [
        "Unit test: one function in isolation",
        "Integration test: several parts together (e.g. API + database)",
        "TDD: write the failing test first, then the code, then refactor",
        "Test normal cases, edge cases (0, empty, boundaries) and error cases",
      ],
    },
    {
      heading: "unittest (Built-in)",
      content: "unittest is the standard library framework (JUnit style). Create a class that inherits unittest.TestCase; every method whose name starts with test_ is a test. setUp() runs before each test, tearDown() after each. Use assert methods: assertEqual, assertNotEqual, assertTrue, assertFalse, assertIn, assertIsNone, assertAlmostEqual (floats), assertRaises (exceptions). Run with python -m unittest -v or unittest.main().",
      syntax: `import unittest
from calc import add

class TestAdd(unittest.TestCase):
    def test_positive(self):
        self.assertEqual(add(2, 3), 5)

if __name__ == "__main__":
    unittest.main(verbosity=2)
`,
    },
    {
      heading: "pytest (Most Popular Third-Party Framework)",
      content: "pytest (pip install pytest) uses plain functions and the normal assert statement, with very readable failure messages. Files named test_*.py and functions named test_* are discovered automatically. Fixtures (@pytest.fixture) provide reusable setup data, @pytest.mark.parametrize runs one test with many inputs, and pytest.raises checks exceptions. It can also run unittest tests. Coverage: pip install pytest-cov ; pytest --cov=.",
      syntax: `# test_calc.py
import pytest
from calc import divide

@pytest.fixture
def numbers():
    return (10, 2)

def test_divide(numbers):
    a, b = numbers
    assert divide(a, b) == 5

@pytest.mark.parametrize("a, b, expected", [(9, 3, 3), (5, 2, 2.5)])
def test_divide_many(a, b, expected):
    assert divide(a, b) == expected

def test_zero():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)

# Run in terminal:  pytest -v
`,
    },
    {
      heading: "Mocking and Common Mistakes",
      content: "Tests must be fast and repeatable, so we do not call real APIs, send real emails or hit the real database. unittest.mock.patch temporarily replaces a function or object with a Mock that returns what you choose and records how it was called. Common mistakes: test names not starting with test_, tests that depend on each other's order, comparing floats with == instead of assertAlmostEqual / pytest.approx, patching the wrong import path, and thinking type hints validate data at runtime.",
      points: [
        "Patch where the name is USED, e.g. patch('weather.get_temperature')",
        "mock.assert_called_once_with(...) verifies calls",
        "Keep each test independent and small",
      ],
    },
  ],
  examples: [
    {
      title: "Type Hints in Action",
      scenario: "Annotate a small billing module, inspect hints at runtime and see that Python does not enforce them.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from typing import Callable, TypedDict, Literal, get_type_hints

class Item(TypedDict):
    name: str
    price: float
    qty: int

Mode = Literal["cash", "upi", "card"]

def line_total(item: Item) -> float:
    return item["price"] * item["qty"]

def bill(items: list[Item], discount: float | None = None) -> float:
    total = sum(line_total(i) for i in items)
    if discount is not None:
        total -= total * discount
    return round(total, 2)

def apply(op: Callable[[float], float], value: float) -> float:
    return op(value)

def pay(amount: float, mode: Mode = "upi") -> str:
    return f"Paid {amount} by {mode}"

cart: list[Item] = [{"name": "Pen", "price": 10.0, "qty": 3}, {"name": "Book", "price": 120.0, "qty": 1}]
print(bill(cart))
print(bill(cart, discount=0.1))
print(apply(lambda x: x * 1.18, 100.0))
print(pay(135.0))
print(get_type_hints(bill))
print(pay.__annotations__)
print(line_total({"name": "X", "price": "ab", "qty": 2}))   # hints are not enforced!
`,
      python: {
        files: {
          "main.py": `from typing import Callable, TypedDict, Literal, get_type_hints

class Item(TypedDict):
    name: str
    price: float
    qty: int

Mode = Literal["cash", "upi", "card"]

def line_total(item: Item) -> float:
    return item["price"] * item["qty"]

def bill(items: list[Item], discount: float | None = None) -> float:
    total = sum(line_total(i) for i in items)
    if discount is not None:
        total -= total * discount
    return round(total, 2)

def apply(op: Callable[[float], float], value: float) -> float:
    return op(value)

def pay(amount: float, mode: Mode = "upi") -> str:
    return f"Paid {amount} by {mode}"

cart: list[Item] = [{"name": "Pen", "price": 10.0, "qty": 3}, {"name": "Book", "price": 120.0, "qty": 1}]
print(bill(cart))
print(bill(cart, discount=0.1))
print(apply(lambda x: x * 1.18, 100.0))
print(pay(135.0))
print(get_type_hints(bill))
print(pay.__annotations__)
print(line_total({"name": "X", "price": "ab", "qty": 2}))   # hints are not enforced!
`,
        },
      },
      result: `150.0
135.0
118.0
Paid 135.0 by upi
{'items': list[__main__.Item], 'discount': float | None, 'return': <class 'float'>}
{'amount': <class 'float'>, 'mode': typing.Literal['cash', 'upi', 'card'], 'return': <class 'str'>}
abab`,
      explanation: "Annotations describe intent: list[Item], float | None, Callable[[float], float], Literal. They are stored in __annotations__ and can be read with get_type_hints. The last line passes a str price; Python still runs it ('ab' * 2 = 'abab'). A static checker like mypy or PyCharm would flag that call before running - that is the real value of type hints.",
    },
    {
      title: "unittest: Testing a Calculator Module",
      scenario: "Test add, divide and grade functions in calc.py, including edge cases, exceptions and one deliberately failing test.",
      steps: [
        "Create a folder with two files: calc.py (code) and main.py (tests)",
        "Paste each part into its file",
        "Run: python main.py   (or python -m unittest -v)",
        "In PyCharm: right-click the test file > Run 'Unittests in main'",
        "Compare with the result below",
      ],
      code: `import io
import unittest
from calc import add, divide, grade


class TestCalc(unittest.TestCase):

    def setUp(self):                      # runs before EVERY test
        self.data = [10, 20, 30]

    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertAlmostEqual(add(0.1, 0.2), 0.3)

    def test_divide(self):
        self.assertEqual(divide(10, 4), 2.5)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            divide(1, 0)

    def test_grade_boundaries(self):
        for marks, expected in [(95, "A"), (75, "B"), (50, "C"), (49, "F")]:
            with self.subTest(marks=marks):
                self.assertEqual(grade(marks), expected)

    def test_sum_of_data(self):
        self.assertEqual(sum(self.data), 60)

    def test_wrong_expectation(self):     # deliberately failing test
        self.assertEqual(grade(89), "A", "89 should be A?")


if __name__ == "__main__":
    # In VS Code / PyCharm you would normally write: unittest.main(verbosity=2)
    # Here we capture the report so the output is the same on every machine.
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCalc)
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
    for line in stream.getvalue().splitlines():
        if line.endswith(("ok", "FAIL", "ERROR")):
            print(line.split(" (")[0], "...", line.rsplit(" ", 1)[-1])
    for test, tb in result.failures:
        reason = next(l for l in tb.splitlines() if l.startswith("AssertionError"))
        print("FAILED:", test.id().split(".")[-1], "->", reason)
    print(f"Ran {result.testsRun} tests, failures={len(result.failures)}, "
          f"errors={len(result.errors)}, success={result.wasSuccessful()}")

# ---- calc.py ----
"""calc.py - code under test"""


def add(a: float, b: float) -> float:
    return a + b


def divide(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("cannot divide by zero")
    return a / b


def grade(marks: int) -> str:
    if not 0 <= marks <= 100:
        raise ValueError("marks must be 0-100")
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 50:
        return "C"
    return "F"
`,
      python: {
        files: {
          "main.py": `import io
import unittest
from calc import add, divide, grade


class TestCalc(unittest.TestCase):

    def setUp(self):                      # runs before EVERY test
        self.data = [10, 20, 30]

    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertAlmostEqual(add(0.1, 0.2), 0.3)

    def test_divide(self):
        self.assertEqual(divide(10, 4), 2.5)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            divide(1, 0)

    def test_grade_boundaries(self):
        for marks, expected in [(95, "A"), (75, "B"), (50, "C"), (49, "F")]:
            with self.subTest(marks=marks):
                self.assertEqual(grade(marks), expected)

    def test_sum_of_data(self):
        self.assertEqual(sum(self.data), 60)

    def test_wrong_expectation(self):     # deliberately failing test
        self.assertEqual(grade(89), "A", "89 should be A?")


if __name__ == "__main__":
    # In VS Code / PyCharm you would normally write: unittest.main(verbosity=2)
    # Here we capture the report so the output is the same on every machine.
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCalc)
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
    for line in stream.getvalue().splitlines():
        if line.endswith(("ok", "FAIL", "ERROR")):
            print(line.split(" (")[0], "...", line.rsplit(" ", 1)[-1])
    for test, tb in result.failures:
        reason = next(l for l in tb.splitlines() if l.startswith("AssertionError"))
        print("FAILED:", test.id().split(".")[-1], "->", reason)
    print(f"Ran {result.testsRun} tests, failures={len(result.failures)}, "
          f"errors={len(result.errors)}, success={result.wasSuccessful()}")
`,
          "calc.py": `"""calc.py - code under test"""


def add(a: float, b: float) -> float:
    return a + b


def divide(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("cannot divide by zero")
    return a / b


def grade(marks: int) -> str:
    if not 0 <= marks <= 100:
        raise ValueError("marks must be 0-100")
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 50:
        return "C"
    return "F"
`,
        },
      },
      result: `test_add ... ok
test_divide ... ok
test_divide_by_zero ... ok
test_grade_boundaries ... ok
test_sum_of_data ... ok
test_wrong_expectation ... FAIL
FAILED: test_wrong_expectation -> AssertionError: 'B' != 'A'
Ran 6 tests, failures=1, errors=0, success=False`,
      explanation: "calc.py holds the code and main.py holds the tests. Each test_ method is run separately and setUp() runs before each one. assertRaises checks the exception, subTest checks several inputs in one test, and assertAlmostEqual handles 0.1 + 0.2. grade(89) returns 'B', so test_wrong_expectation fails and the report shows why ('B' != 'A'). We print only the AssertionError line because the full traceback contains file paths that differ on every machine. Locally you can simply run: python -m unittest -v.",
    },
    {
      title: "pytest Style Tests with Fixture and Parametrize Ideas",
      scenario: "Write pytest-style tests for a BankAccount class. A tiny runner imitates what pytest does so it also runs without installing pytest.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class InsufficientFunds(Exception):
    pass

class BankAccount:
    def __init__(self, owner: str, balance: float = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        return self.balance

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise InsufficientFunds("not enough balance")
        self.balance -= amount
        return self.balance

# ---------- tests (pytest style: plain functions + assert) ----------
def account():                          # with pytest: @pytest.fixture
    return BankAccount("Asha", 1000)

def test_deposit():
    acc = account()
    assert acc.deposit(500) == 1500

def test_withdraw():
    acc = account()
    assert acc.withdraw(300) == 700

def test_withdraw_too_much():           # with pytest: with pytest.raises(InsufficientFunds)
    acc = account()
    try:
        acc.withdraw(5000)
        assert False, "expected InsufficientFunds"
    except InsufficientFunds:
        pass

CASES = [(100, 1100), (1, 1001), (0.5, 1000.5)]   # with pytest: @pytest.mark.parametrize

def test_deposit_many():
    for amount, expected in CASES:
        assert account().deposit(amount) == expected

def test_negative_deposit():
    try:
        account().deposit(-5)
        assert False
    except ValueError as e:
        assert str(e) == "amount must be positive"

def test_bug_example():
    assert account().withdraw(100) == 800, "balance after 100 withdrawal"

# ---------- mini runner (pytest does this automatically) ----------
passed = failed = 0
for name, func in list(globals().items()):
    if name.startswith("test_") and callable(func):
        try:
            func()
            print(f"{name} PASSED")
            passed += 1
        except AssertionError as e:
            print(f"{name} FAILED: {e}")
            failed += 1
print(f"{passed} passed, {failed} failed")
`,
      python: {
        files: {
          "main.py": `class InsufficientFunds(Exception):
    pass

class BankAccount:
    def __init__(self, owner: str, balance: float = 0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        return self.balance

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise InsufficientFunds("not enough balance")
        self.balance -= amount
        return self.balance

# ---------- tests (pytest style: plain functions + assert) ----------
def account():                          # with pytest: @pytest.fixture
    return BankAccount("Asha", 1000)

def test_deposit():
    acc = account()
    assert acc.deposit(500) == 1500

def test_withdraw():
    acc = account()
    assert acc.withdraw(300) == 700

def test_withdraw_too_much():           # with pytest: with pytest.raises(InsufficientFunds)
    acc = account()
    try:
        acc.withdraw(5000)
        assert False, "expected InsufficientFunds"
    except InsufficientFunds:
        pass

CASES = [(100, 1100), (1, 1001), (0.5, 1000.5)]   # with pytest: @pytest.mark.parametrize

def test_deposit_many():
    for amount, expected in CASES:
        assert account().deposit(amount) == expected

def test_negative_deposit():
    try:
        account().deposit(-5)
        assert False
    except ValueError as e:
        assert str(e) == "amount must be positive"

def test_bug_example():
    assert account().withdraw(100) == 800, "balance after 100 withdrawal"

# ---------- mini runner (pytest does this automatically) ----------
passed = failed = 0
for name, func in list(globals().items()):
    if name.startswith("test_") and callable(func):
        try:
            func()
            print(f"{name} PASSED")
            passed += 1
        except AssertionError as e:
            print(f"{name} FAILED: {e}")
            failed += 1
print(f"{passed} passed, {failed} failed")
`,
        },
      },
      result: `test_deposit PASSED
test_withdraw PASSED
test_withdraw_too_much PASSED
test_deposit_many PASSED
test_negative_deposit PASSED
test_bug_example FAILED: balance after 100 withdrawal
5 passed, 1 failed`,
      explanation: "pytest discovers every function whose name starts with test_ and runs it; a plain assert that fails marks the test as failed. Here the mini runner does the same thing so you can run it anywhere. test_bug_example expects 800 but the real balance is 900, so it fails with our message. With pytest installed you would use @pytest.fixture, @pytest.mark.parametrize and pytest.raises and run: pytest -v.",
    },
    {
      title: "Mocking an External API with unittest.mock",
      scenario: "A weather alert function calls a real web API. In tests we replace that call with a mock so tests are fast and offline.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import unittest
from unittest.mock import patch, Mock

def get_temperature(city: str) -> float:
    raise RuntimeError("real network call - not allowed in tests")

def weather_alert(city: str) -> str:
    temp = get_temperature(city)
    if temp >= 40:
        return f"Heat alert for {city}: {temp}C"
    if temp <= 5:
        return f"Cold alert for {city}: {temp}C"
    return f"{city} is pleasant: {temp}C"

class TestWeather(unittest.TestCase):
    @patch("__main__.get_temperature", return_value=44.5)
    def test_heat(self, mock_temp):
        self.assertEqual(weather_alert("Nagpur"), "Heat alert for Nagpur: 44.5C")
        mock_temp.assert_called_once_with("Nagpur")

    def test_cold_and_pleasant(self):
        with patch("__main__.get_temperature", side_effect=[2, 25]) as m:
            self.assertIn("Cold", weather_alert("Shimla"))
            self.assertIn("pleasant", weather_alert("Pune"))
            self.assertEqual(m.call_count, 2)

    def test_api_down(self):
        with patch("__main__.get_temperature", side_effect=ConnectionError("down")):
            with self.assertRaises(ConnectionError):
                weather_alert("Delhi")

m = Mock(return_value=10)
print(m(1, 2), m.called, m.call_args)

suite = unittest.TestLoader().loadTestsFromTestCase(TestWeather)
result = unittest.TestResult()
suite.run(result)
print("tests run:", result.testsRun, "| failures:", len(result.failures), "| errors:", len(result.errors))
`,
      python: {
        files: {
          "main.py": `import unittest
from unittest.mock import patch, Mock

def get_temperature(city: str) -> float:
    raise RuntimeError("real network call - not allowed in tests")

def weather_alert(city: str) -> str:
    temp = get_temperature(city)
    if temp >= 40:
        return f"Heat alert for {city}: {temp}C"
    if temp <= 5:
        return f"Cold alert for {city}: {temp}C"
    return f"{city} is pleasant: {temp}C"

class TestWeather(unittest.TestCase):
    @patch("__main__.get_temperature", return_value=44.5)
    def test_heat(self, mock_temp):
        self.assertEqual(weather_alert("Nagpur"), "Heat alert for Nagpur: 44.5C")
        mock_temp.assert_called_once_with("Nagpur")

    def test_cold_and_pleasant(self):
        with patch("__main__.get_temperature", side_effect=[2, 25]) as m:
            self.assertIn("Cold", weather_alert("Shimla"))
            self.assertIn("pleasant", weather_alert("Pune"))
            self.assertEqual(m.call_count, 2)

    def test_api_down(self):
        with patch("__main__.get_temperature", side_effect=ConnectionError("down")):
            with self.assertRaises(ConnectionError):
                weather_alert("Delhi")

m = Mock(return_value=10)
print(m(1, 2), m.called, m.call_args)

suite = unittest.TestLoader().loadTestsFromTestCase(TestWeather)
result = unittest.TestResult()
suite.run(result)
print("tests run:", result.testsRun, "| failures:", len(result.failures), "| errors:", len(result.errors))
`,
        },
      },
      result: `10 True call(1, 2)
tests run: 3 | failures: 0 | errors: 0`,
      explanation: "patch temporarily replaces get_temperature in this module with a Mock. return_value sets one fixed result, side_effect can give a sequence of results or raise an exception. assert_called_once_with and call_count verify how the dependency was used. No real network call happens, so all 3 tests pass quickly.",
    },
  ],
  interview: [
    {
      q: "Are type hints enforced at runtime?",
      a: "No. Python ignores them during execution (they are stored in __annotations__). Tools like mypy, Pyright/Pylance and PyCharm use them for static checking; libraries like pydantic can validate at runtime.",
      level: "Easy",
    },
    {
      q: "What is the difference between Optional[int] and int | None?",
      a: "They mean the same thing. int | None is the newer syntax (Python 3.10+).",
      level: "Easy",
    },
    {
      q: "What is mypy?",
      a: "A static type checker that analyses annotated Python code without running it and reports type errors.",
      level: "Easy",
    },
    {
      q: "What is a unit test?",
      a: "An automated test that checks a small unit of code (usually one function or method) in isolation for a given input and expected output.",
      level: "Easy",
    },
    {
      q: "How do you write a test with unittest?",
      a: "Subclass unittest.TestCase, write methods starting with test_, use self.assert* methods, and run with python -m unittest or unittest.main().",
      level: "Easy",
    },
    {
      q: "Difference between unittest and pytest?",
      a: "unittest is built-in, class-based, uses assert methods. pytest is third-party, supports plain functions and assert, fixtures, parametrize, plugins and better failure output; it can also run unittest tests.",
      level: "Medium",
    },
    {
      q: "What are setUp and tearDown?",
      a: "Methods in a TestCase that run before and after each test to prepare and clean up (setUpClass/tearDownClass run once per class).",
      level: "Medium",
    },
    {
      q: "What is a pytest fixture?",
      a: "A function decorated with @pytest.fixture that provides reusable setup data or resources to tests that list it as a parameter; it can also do teardown using yield.",
      level: "Medium",
    },
    {
      q: "What is mocking and why use it?",
      a: "Replacing real dependencies (APIs, databases, time, email) with fake objects that return controlled values, so tests are fast, offline and deterministic. In Python: unittest.mock.Mock and patch.",
      level: "Medium",
    },
    {
      q: `What is the output?
def f(x: int) -> int:
    return x * 2
print(f('ab'))`,
      a: "abab - type hints are not enforced, and str * 2 repeats the string.",
      level: "Medium",
    },
    {
      q: "What is TDD?",
      a: "Test-Driven Development: write a failing test first (red), write minimal code to pass (green), then refactor - repeat.",
      level: "Medium",
    },
    {
      q: "What is code coverage?",
      a: "The percentage of code lines/branches executed by tests, measured with coverage.py or pytest-cov. High coverage helps but does not guarantee correctness.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Add type hints to a function average(nums) that returns None for an empty list.",
      hint: "def average(nums: list[float]) -> float | None",
      solution: `def average(nums: list[float]) -> float | None:
    if not nums:
        return None
    return sum(nums) / len(nums)
print(average([2, 4]), average([]))   # 3.0 None
`,
    },
    {
      task: "Write a unittest TestCase for is_palindrome(s) with at least 3 tests.",
      hint: "Test a palindrome, a non-palindrome and an empty string.",
      solution: `import unittest
def is_palindrome(s: str) -> bool:
    s = s.lower()
    return s == s[::-1]
class T(unittest.TestCase):
    def test_yes(self): self.assertTrue(is_palindrome("Madam"))
    def test_no(self): self.assertFalse(is_palindrome("hello"))
    def test_empty(self): self.assertTrue(is_palindrome(""))
if __name__ == "__main__":
    unittest.main(verbosity=2)
`,
    },
    {
      task: "Write a pytest parametrized test for a function square(n).",
      hint: "@pytest.mark.parametrize('n, exp', [...])",
      solution: `import pytest
def square(n): return n * n
@pytest.mark.parametrize("n, exp", [(2, 4), (-3, 9), (0, 0)])
def test_square(n, exp):
    assert square(n) == exp
# run: pytest -v
`,
    },
    {
      task: "Test that withdraw raises ValueError for negative amounts using assertRaises.",
      hint: "with self.assertRaises(ValueError):",
      solution: `import unittest
def withdraw(bal, amt):
    if amt < 0: raise ValueError("negative")
    return bal - amt
class T(unittest.TestCase):
    def test_neg(self):
        with self.assertRaises(ValueError):
            withdraw(100, -1)
unittest.main(argv=["x"], exit=False)
`,
    },
    {
      task: "Mock random.randint so a dice game test always rolls 6.",
      hint: "patch('random.randint', return_value=6)",
      solution: `import random
from unittest.mock import patch
def roll(): return random.randint(1, 6)
with patch("random.randint", return_value=6):
    print(roll())   # 6
`,
    },
  ],
  quiz: [
    {
      question: "What does Python do if you pass a str to a parameter annotated as int?",
      options: [
        "Raises TypeError",
        "Converts it to int",
        "Runs normally - hints are not enforced",
        "Raises SyntaxError",
      ],
      answer: 2,
      explanation: "Hints are for tools, not runtime checks.",
    },
    {
      question: "In unittest, test method names must start with:",
      options: [
        "test_",
        "check_",
        "unit_",
        "should_",
      ],
      answer: 0,
      explanation: "The loader collects methods starting with 'test'.",
    },
    {
      question: "Which assertion should be used to compare floats like 0.1 + 0.2 and 0.3?",
      options: [
        "assertEqual",
        "assertIs",
        "assertTrue",
        "assertAlmostEqual",
      ],
      answer: 3,
      explanation: "Floating-point rounding makes exact equality unreliable.",
    },
    {
      question: "Which pytest feature runs the same test with multiple input sets?",
      options: [
        "@pytest.fixture",
        "@pytest.mark.parametrize",
        "pytest.raises",
        "conftest.py",
      ],
      answer: 1,
      explanation: "parametrize generates one test per case.",
    },
    {
      question: "unittest.mock.patch is mainly used to:",
      options: [
        "Speed up Python",
        "Replace a dependency with a fake during a test",
        "Fix bugs automatically",
        "Format code",
      ],
      answer: 1,
      explanation: "It swaps the real object with a Mock temporarily.",
    },
  ],
};
