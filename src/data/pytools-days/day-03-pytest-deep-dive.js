export default {
  id: "day-03-pytest-deep-dive",
  title: "pytest Deep Dive: Fixtures, Parametrize, Mocking and Coverage",
  module: "Module 1: Developer Workflow",
  day: 3,
  level: "Beginner",
  duration: "3 hours",
  summary: "Write professional automated tests with pytest: plain assert tests, fixtures for setup and cleanup, parametrize for many inputs, unittest.mock to replace slow or external code, and coverage reports to find untested lines.",
  objectives: [
    "Write and run pytest tests and read pass/fail output",
    "Share setup code using fixtures, conftest.py and fixture scopes",
    "Test many inputs with @pytest.mark.parametrize and check exceptions with pytest.raises",
    "Replace external calls (APIs, time, email) using unittest.mock patch and Mock",
    "Measure test coverage with pytest-cov and understand what the number means",
  ],
  theory: [
    {
      heading: "Why Automated Tests and Why pytest?",
      content: "Automated tests are small programs that check your code gives the expected result. They catch bugs before users do, let you refactor without fear, and act as living documentation. In interviews for Python roles you are often asked \"How do you test your code?\" and sometimes asked to write a test live.\n\nPython ships with `unittest` (class-based, JUnit style). **pytest** is the most popular third-party framework: tests are plain functions, you use the normal `assert` statement, and it gives very readable failure messages. pytest can also run old unittest tests, so teams migrate gradually.",
      points: [
        "Unit test: tests one function/class in isolation (fast, many)",
        "Integration test: tests pieces together, e.g. code + real database",
        "End-to-end test: tests the whole app like a user (slow, few)",
        "Test pyramid: many unit tests, fewer integration, very few E2E",
      ],
    },
    {
      heading: "pytest Basics: Discovery, assert and Running Tests",
      content: "pytest automatically finds files named `test_*.py` or `*_test.py`, functions starting with `test_`, and classes starting with `Test` (without an __init__). Inside a test you simply write `assert`. When an assert fails, pytest shows the actual and expected values.\n\nUse `pytest.raises` to check that code raises an exception, and `pytest.approx` to compare floats safely.",
      syntax: `# pricing.py
def apply_discount(price, pct):
    if not 0 <= pct <= 100:
        raise ValueError("pct must be between 0 and 100")
    return round(price * (100 - pct) / 100, 2)

# tests/test_pricing.py
import pytest
from pricing import apply_discount

def test_ten_percent():
    assert apply_discount(500, 10) == 450

def test_invalid_pct():
    with pytest.raises(ValueError, match="between 0 and 100"):
        apply_discount(500, 120)

def test_float():
    assert 0.1 + 0.2 == pytest.approx(0.3)`,
      points: [
        "pytest                run all tests",
        "pytest -v             verbose: one line per test",
        "pytest -k discount    run tests whose name matches 'discount'",
        "pytest -x             stop at first failure",
        "pytest --lf           rerun only last failed tests",
        "pytest -s             show print() output",
      ],
    },
    {
      heading: "Fixtures: Reusable Setup and Teardown",
      content: "A **fixture** is a function decorated with `@pytest.fixture` that prepares something a test needs (sample data, a database connection, a logged-in client). A test asks for a fixture simply by naming it as a parameter; pytest calls the fixture and passes the result. This is called dependency injection.\n\nCode after `yield` in a fixture is **teardown** that runs after the test, even if it fails. Put shared fixtures in `tests/conftest.py`; pytest loads it automatically and no import is needed.",
      syntax: `# tests/conftest.py
import sqlite3
import pytest

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
    yield conn            # test runs here
    conn.close()          # teardown

# tests/test_users.py
def test_insert_user(db):
    db.execute("INSERT INTO users (name) VALUES ('Asha')")
    assert db.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1`,
      points: [
        "scope='function' (default): new fixture for every test",
        "scope='module' / 'session': created once per file / whole run (good for expensive setup)",
        "Built-in fixtures: tmp_path (temporary folder), monkeypatch (set env vars/attributes), capsys (capture print output)",
        "Fixtures can use other fixtures",
      ],
    },
    {
      heading: "Parametrize: One Test, Many Inputs",
      content: "`@pytest.mark.parametrize` runs the same test function with different input/expected pairs. Each case shows separately in the report, so you instantly see which input failed. It replaces copy-pasted tests and loops inside tests.",
      syntax: `import pytest
from pricing import apply_discount

@pytest.mark.parametrize(
    "price, pct, expected",
    [
        (1000, 0, 1000),
        (1000, 10, 900),
        (999, 50, 499.5),
        (1000, 100, 0),
    ],
)
def test_apply_discount(price, pct, expected):
    assert apply_discount(price, pct) == expected`,
      tip: "Use ids=[...] or pytest.param(..., id='full-discount') to give readable names to cases in the output.",
    },
    {
      heading: "Mocking with unittest.mock",
      content: "Unit tests must be fast and must not depend on the internet, real payment gateways, emails or the current time. **Mocking** replaces a real object with a fake one during a test. Python's built-in `unittest.mock` provides `Mock`/`MagicMock` objects and `patch`, which temporarily replaces an attribute and restores it afterwards. The `pytest-mock` plugin offers the same via a `mocker` fixture.\n\nThe golden rule of patch: **patch where the name is looked up, not where it is defined.** If `services.py` does `from emailer import send_email`, you patch `services.send_email`, not `emailer.send_email`.",
      syntax: `from unittest.mock import patch, Mock

mock = Mock(return_value=42)
mock(1, 2)
mock.assert_called_once_with(1, 2)

mock.side_effect = ConnectionError("down")   # make it raise

with patch("services.requests.get") as fake_get:
    fake_get.return_value.json.return_value = {"rate": 83.2}
    ...`,
      tip: "Do not over-mock. If you mock everything, the test only checks your mocks. Mock the boundaries: network, time, randomness, file system, third-party services.",
    },
    {
      heading: "Coverage: Which Lines Did the Tests Run?",
      content: "**Coverage** measures the percentage of your code executed by tests. Install `pytest-cov` and run `pytest --cov`. The report lists missing line numbers, so you can see untested branches. Use `--cov-branch` to check that both sides of every if/else were tested.\n\n100% coverage does not mean bug-free; it only means every line ran at least once. Many teams set a minimum like 80% in CI with `--cov-fail-under=80`.",
      syntax: `pip install pytest pytest-cov
pytest --cov=src --cov-report=term-missing
pytest --cov=src --cov-branch --cov-report=html   # open htmlcov/index.html
pytest --cov=src --cov-fail-under=80              # fail CI below 80%`,
    },
  ],
  examples: [
    {
      title: "Parametrized Tests (Runnable with unittest subTest)",
      scenario: "You want to test a GST calculator with many inputs. In a real project you would use @pytest.mark.parametrize; this runnable version uses the standard library's unittest.subTest, which works the same way.",
      steps: [
        "Save the code as main.py (no install needed)",
        "Run python main.py",
        "Change an expected value to see a failing subtest",
        "Compare with the pytest version shown in the theory section",
      ],
      code: `import io
import re
import unittest


def price_with_gst(amount, rate=18):
    if amount < 0:
        raise ValueError("amount cannot be negative")
    return round(amount * (1 + rate / 100), 2)


class TestGST(unittest.TestCase):
    def test_many_inputs(self):
        cases = [(100, 18, 118.0), (250, 5, 262.5), (999, 12, 1118.88), (0, 18, 0.0)]
        for amount, rate, expected in cases:
            with self.subTest(amount=amount, rate=rate):
                self.assertEqual(price_with_gst(amount, rate), expected)

    def test_negative_amount(self):
        with self.assertRaises(ValueError):
            price_with_gst(-1)


stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream, verbosity=2)
unittest.main(argv=["x"], exit=False, testRunner=runner)
print(re.sub(r" in \\d+\\.\\d+s", "", stream.getvalue()).strip())`,
      python: {
        files: {
          "main.py": `import io
import re
import unittest


def price_with_gst(amount, rate=18):
    if amount < 0:
        raise ValueError("amount cannot be negative")
    return round(amount * (1 + rate / 100), 2)


class TestGST(unittest.TestCase):
    def test_many_inputs(self):
        cases = [(100, 18, 118.0), (250, 5, 262.5), (999, 12, 1118.88), (0, 18, 0.0)]
        for amount, rate, expected in cases:
            with self.subTest(amount=amount, rate=rate):
                self.assertEqual(price_with_gst(amount, rate), expected)

    def test_negative_amount(self):
        with self.assertRaises(ValueError):
            price_with_gst(-1)


stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream, verbosity=2)
unittest.main(argv=["x"], exit=False, testRunner=runner)
print(re.sub(r" in \\d+\\.\\d+s", "", stream.getvalue()).strip())
`,
        },
      },
      result: `test_many_inputs (__main__.TestGST.test_many_inputs) ... ok
test_negative_amount (__main__.TestGST.test_negative_amount) ... ok

----------------------------------------------------------------------
Ran 2 tests

OK`,
      explanation: "subTest reports each failing case separately, like parametrize. assertRaises is the unittest version of pytest.raises. The runner writes to a StringIO and the timing text is removed only so the output is identical every run. The pytest equivalent is shorter: @pytest.mark.parametrize('amount, rate, expected', cases) on a plain function with assert.",
    },
    {
      title: "Mocking an External API with unittest.mock",
      scenario: "A currency converter calls a live exchange-rate API. Tests must not hit the internet, and must also check behaviour when the API is down.",
      steps: [
        "Save as main.py and run python main.py",
        "Notice that fetch_rate is replaced by a Mock inside each test",
        "Read how side_effect simulates an error",
      ],
      code: `import io
import re
import unittest
from unittest.mock import patch


def fetch_rate(currency):
    raise RuntimeError("real network call - never run in unit tests")


def convert_usd(amount, currency="INR"):
    try:
        rate = fetch_rate(currency)
    except ConnectionError:
        return None
    return round(amount * rate, 2)


class TestConvert(unittest.TestCase):
    @patch("__main__.fetch_rate", return_value=83.25)
    def test_convert(self, mock_fetch):
        self.assertEqual(convert_usd(10), 832.5)
        mock_fetch.assert_called_once_with("INR")

    @patch("__main__.fetch_rate", side_effect=ConnectionError("API down"))
    def test_api_down(self, mock_fetch):
        self.assertIsNone(convert_usd(10))


stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream, verbosity=2)
unittest.main(argv=["x"], exit=False, testRunner=runner)
print(re.sub(r" in \\d+\\.\\d+s", "", stream.getvalue()).strip())`,
      python: {
        files: {
          "main.py": `import io
import re
import unittest
from unittest.mock import patch


def fetch_rate(currency):
    raise RuntimeError("real network call - never run in unit tests")


def convert_usd(amount, currency="INR"):
    try:
        rate = fetch_rate(currency)
    except ConnectionError:
        return None
    return round(amount * rate, 2)


class TestConvert(unittest.TestCase):
    @patch("__main__.fetch_rate", return_value=83.25)
    def test_convert(self, mock_fetch):
        self.assertEqual(convert_usd(10), 832.5)
        mock_fetch.assert_called_once_with("INR")

    @patch("__main__.fetch_rate", side_effect=ConnectionError("API down"))
    def test_api_down(self, mock_fetch):
        self.assertIsNone(convert_usd(10))


stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream, verbosity=2)
unittest.main(argv=["x"], exit=False, testRunner=runner)
print(re.sub(r" in \\d+\\.\\d+s", "", stream.getvalue()).strip())
`,
        },
      },
      result: `test_api_down (__main__.TestConvert.test_api_down) ... ok
test_convert (__main__.TestConvert.test_convert) ... ok

----------------------------------------------------------------------
Ran 2 tests

OK`,
      explanation: "patch replaces fetch_rate in the module where convert_usd looks it up (__main__ here; in a project it would be e.g. 'myapp.services.fetch_rate'). return_value sets what the fake returns; side_effect makes it raise. assert_called_once_with verifies the code called the dependency correctly. unittest runs tests in alphabetical order, so test_api_down appears first.",
    },
    {
      title: "Fixtures with yield, tmp_path and monkeypatch",
      scenario: "A report function writes a CSV file and reads the output folder from an environment variable. You need a temporary folder and a fake environment variable for each test.",
      steps: [
        "pip install pytest",
        "Create report.py and tests/test_report.py",
        "Run pytest -v",
      ],
      code: `# report.py
import csv
import os
from pathlib import Path

def write_report(rows):
    out_dir = Path(os.environ["REPORT_DIR"])
    path = out_dir / "sales.csv"
    with path.open("w", newline="") as f:
        csv.writer(f).writerows(rows)
    return path

# tests/test_report.py
import pytest
from report import write_report

@pytest.fixture
def sales_rows():
    return [["city", "amount"], ["Pune", 1200], ["Delhi", 900]]

@pytest.fixture
def report_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("REPORT_DIR", str(tmp_path))
    yield tmp_path
    # teardown: tmp_path is cleaned by pytest, monkeypatch undoes setenv

def test_write_report(sales_rows, report_dir):
    path = write_report(sales_rows)
    assert path.parent == report_dir
    assert path.read_text().splitlines()[1] == "Pune,1200"`,
      result: `tests/test_report.py::test_write_report PASSED                    [100%]

============================== 1 passed in 0.02s ===============================`,
      explanation: "The test requests two fixtures by name. report_dir itself uses the built-in fixtures tmp_path (a unique temporary folder) and monkeypatch (sets an env var and automatically restores it after the test). No real folders or environment variables are touched.",
    },
    {
      title: "Mocking with pytest-mock and Checking Coverage",
      scenario: "An order service sends a confirmation email. You test it without sending real emails and then check coverage.",
      steps: [
        "pip install pytest pytest-mock pytest-cov",
        "Create orders.py, emailer.py and tests/test_orders.py",
        "Run pytest --cov=. --cov-report=term-missing",
      ],
      code: `# emailer.py
def send_email(to, subject):
    ...  # talks to an SMTP server

# orders.py
from emailer import send_email

def place_order(user_email, total):
    if total <= 0:
        raise ValueError("total must be positive")
    send_email(user_email, f"Order confirmed: Rs {total}")
    return {"status": "confirmed", "total": total}

# tests/test_orders.py
import pytest
from orders import place_order

def test_place_order_sends_email(mocker):
    fake_send = mocker.patch("orders.send_email")   # patch where it is USED
    result = place_order("ravi@example.com", 499)
    assert result["status"] == "confirmed"
    fake_send.assert_called_once_with("ravi@example.com", "Order confirmed: Rs 499")

def test_invalid_total():
    with pytest.raises(ValueError):
        place_order("ravi@example.com", 0)`,
      result: `Name        Stmts   Miss  Cover   Missing
-----------------------------------------
emailer.py      2      1    50%   2
orders.py       6      0   100%
-----------------------------------------
TOTAL           8      1    88%
2 passed in 0.05s`,
      explanation: "orders.py imported send_email into its own namespace, so we patch orders.send_email. Patching emailer.send_email would not affect the already-imported name. Coverage shows orders.py is fully covered; emailer.py line 2 never ran because it was mocked, which is expected. Exact numbers vary slightly with versions and test files included.",
    },
  ],
  interview: [
    { q: "Why prefer pytest over unittest?", a: "pytest uses plain functions and the normal assert statement with detailed failure messages, has powerful fixtures with scopes and dependency injection, built-in parametrize, a huge plugin ecosystem (pytest-cov, pytest-mock, pytest-django, pytest-asyncio) and can still run unittest tests.", level: "Easy" },
    { q: "How does pytest discover tests?", a: "By default it looks in files named test_*.py or *_test.py, collects functions prefixed test_ and methods prefixed test_ inside classes prefixed Test (without __init__). testpaths in pyproject.toml can restrict the folders.", level: "Easy" },
    { q: "What is a fixture and how is teardown done?", a: "A function marked @pytest.fixture that provides data or resources to tests, which receive it by naming it as a parameter. For cleanup, use yield: code before yield is setup, code after yield is teardown and runs even if the test fails.", level: "Medium" },
    { q: "Explain fixture scopes.", a: "function (default, new per test), class, module, package and session. Wider scopes create the fixture once and reuse it, which speeds up expensive setup like a database engine, but tests can then affect each other through shared state.", level: "Medium" },
    { q: "What is conftest.py?", a: "A special file pytest loads automatically for its directory and sub-directories. It holds shared fixtures and hooks, so tests can use them without imports.", level: "Easy" },
    { q: "How do you test that a function raises an exception?", a: "Use with pytest.raises(ValueError, match='regex'): call(). Optionally capture as exc_info to inspect the exception. In unittest use self.assertRaises.", level: "Easy" },
    { q: "What is mocking and when should you use it?", a: "Replacing a real dependency with a controllable fake during a test. Use it for slow, non-deterministic or external things: HTTP APIs, email, payment gateways, current time, random numbers. Avoid mocking your own simple logic, otherwise tests stop checking real behaviour.", level: "Medium" },
    { q: "Explain 'patch where it is looked up, not where it is defined'.", a: "patch replaces a name in a specific namespace. If orders.py does from emailer import send_email, orders has its own reference, so you must patch 'orders.send_email'. Patching 'emailer.send_email' would not change the reference orders already holds.", level: "Hard" },
    { q: "Difference between Mock and MagicMock, return_value and side_effect?", a: "MagicMock is a Mock that also supports magic methods like __len__, __iter__ and context managers. return_value sets what the mock returns; side_effect can raise an exception, return values from an iterable one per call, or call a function.", level: "Hard" },
    { q: "Does 100% coverage mean code is bug-free?", a: "No. Coverage only proves lines were executed, not that results were asserted correctly or that all input combinations and edge cases were tested. Branch coverage is stronger than line coverage; meaningful assertions matter more than the number.", level: "Medium" },
    { q: "How do you make tests independent and fast?", a: "Use function-scoped fixtures for mutable state, in-memory or transactional databases rolled back after each test, mock external services, avoid sleep, never depend on test order, and run in parallel with pytest-xdist if needed.", level: "Hard" },
    { q: "What is monkeypatch?", a: "A built-in pytest fixture to temporarily set or delete attributes, dictionary items and environment variables (monkeypatch.setenv) for one test; changes are undone automatically afterwards.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write a function is_valid_mobile(number) that returns True for 10-digit Indian mobile numbers starting with 6, 7, 8 or 9. Write a parametrized pytest test with at least 5 cases.",
      hint: "Use len(), str.isdigit() and number[0] in '6789'.",
      solution: `# validators.py
def is_valid_mobile(number: str) -> bool:
    return len(number) == 10 and number.isdigit() and number[0] in "6789"

# tests/test_validators.py
import pytest
from validators import is_valid_mobile

@pytest.mark.parametrize("number, expected", [
    ("9876543210", True),
    ("6123456789", True),
    ("5123456789", False),   # starts with 5
    ("98765", False),        # too short
    ("98765abcde", False),   # letters
])
def test_is_valid_mobile(number, expected):
    assert is_valid_mobile(number) == expected`,
    },
    {
      task: "Create a fixture cart that returns a dict-based shopping cart with two items, and write two tests using it: one checks the total, one checks that adding an item increases the count. Prove tests do not share state.",
      hint: "Function-scoped fixtures return a fresh object for each test.",
      solution: `import pytest

@pytest.fixture
def cart():
    return {"pen": 10, "book": 250}

def test_total(cart):
    assert sum(cart.values()) == 260

def test_add_item(cart):
    cart["bag"] = 700
    assert len(cart) == 3

def test_still_two_items(cart):
    assert len(cart) == 2   # fresh fixture, previous test's change is gone`,
    },
    {
      task: "A function get_greeting() returns 'Good morning' before 12:00 and 'Good evening' otherwise, using datetime.now(). Test both branches using unittest.mock.patch.",
      hint: "Inject a now function or patch the module's datetime. Injecting is the cleaner design.",
      solution: `# greet.py
from datetime import datetime

def get_greeting(now=datetime.now):
    return "Good morning" if now().hour < 12 else "Good evening"

# tests/test_greet.py
from datetime import datetime
from unittest.mock import Mock
from greet import get_greeting

def test_morning():
    assert get_greeting(Mock(return_value=datetime(2026, 1, 1, 9, 0))) == "Good morning"

def test_evening():
    assert get_greeting(Mock(return_value=datetime(2026, 1, 1, 19, 0))) == "Good evening"`,
    },
    {
      task: "Write a test that checks a function retries once: fetch() should call api_call(); if it raises ConnectionError the first time, it calls again and returns the second result.",
      hint: "side_effect accepts a list: the first item can be an exception, the second a value.",
      solution: `# client.py
def api_call():
    ...

def fetch():
    try:
        return api_call()
    except ConnectionError:
        return api_call()

# tests/test_client.py
from unittest.mock import patch
from client import fetch

def test_fetch_retries_once():
    with patch("client.api_call", side_effect=[ConnectionError(), {"ok": True}]) as m:
        assert fetch() == {"ok": True}
        assert m.call_count == 2`,
    },
    {
      task: "Run your test suite with coverage, find a missing line and add a test that covers it. Make CI fail if coverage drops below 85%.",
      hint: "Use --cov-report=term-missing and --cov-fail-under.",
      solution: `pip install pytest-cov
pytest --cov=src --cov-report=term-missing
# Look at the Missing column, e.g. "pricing.py  12  1  92%  4"
# line 4 is the raise ValueError branch -> add a pytest.raises test
pytest --cov=src --cov-branch --cov-fail-under=85

# pyproject.toml (so CI just runs "pytest")
[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=85"`,
    },
  ],
  quiz: [
    { question: "Which file name will pytest discover by default?", options: ["check_cart.py", "test_cart.py", "cart_tests.txt", "TestCart.java"], answer: 1, explanation: "pytest collects test_*.py and *_test.py files." },
    { question: "In a fixture, what does code after yield do?", options: ["Runs before the test", "Runs as teardown after the test", "Never runs", "Runs only if the test fails"], answer: 1, explanation: "Code after yield is teardown and runs after the test, pass or fail." },
    { question: "Which decorator runs one test with several input sets?", options: ["@pytest.fixture", "@pytest.mark.skip", "@pytest.mark.parametrize", "@patch"], answer: 2, explanation: "parametrize generates one test case per parameter set." },
    { question: "orders.py does 'from emailer import send_email'. What should you patch?", options: ["emailer.send_email", "orders.send_email", "send_email", "smtplib.send_email"], answer: 1, explanation: "Patch the name where it is looked up: the orders module's reference." },
    { question: "How do you make a Mock raise an exception when called?", options: ["mock.raise = ValueError", "mock.return_value = ValueError", "mock.side_effect = ValueError('x')", "mock.error(ValueError)"], answer: 2, explanation: "Assigning an exception to side_effect makes each call raise it." },
    { question: "What does pytest --cov-fail-under=80 do?", options: ["Skips 20% of tests", "Fails the run if coverage is below 80%", "Runs tests 80 times", "Shows only 80 lines"], answer: 1, explanation: "It enforces a minimum coverage threshold, commonly used in CI." },
  ],
};
