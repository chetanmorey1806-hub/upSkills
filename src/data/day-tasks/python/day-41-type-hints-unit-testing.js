export default {
  lesson: 'day-41-type-hints-unit-testing',
  minutes: 35,
  intro: 'Annotate functions with type hints, write unittest test cases that catch bugs, and isolate external services with unittest.mock.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'Are type hints enforced at runtime? What is printed?',
      code: `def double(x: int) -> int:
    return x * 2

print(double(4))
print(double("ab"))
print(double.__annotations__["return"].__name__)`,
      expected: '8\nabab\nint',
      explain: 'Python does **not** check hints when the code runs: `double("ab")` happily returns "abab". Hints are for readers, IDEs and static checkers like **mypy**, which would flag that call. They are stored in `__annotations__`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A function returns a user’s age or `None` if the user is not found. Which return annotation is correct in modern Python (3.10+)?',
      options: ['-> int', '-> int | None', '-> None', '-> any'],
      answer: 1,
      explain: '`int | None` (same as `Optional[int]`) says "an int or None". Writing just `-> int` hides the None case, and mypy would then warn wherever you use the result without checking.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Add type hints (do not change the logic):\n- `average(marks)`: `marks` is a list of ints, returns a float\n- `find_student(roll, students)`: `roll` is an int, `students` is a dict mapping int to str, returns a str or None',
      example: { title: 'built-in generic hints', code: 'def total(prices: list[float], tax: float = 0.18) -> float:\n    return sum(prices) * (1 + tax)\n\ndef lookup(codes: dict[str, int], key: str) -> int | None:\n    return codes.get(key)' },
      starter: `def average(marks):
    return sum(marks) / len(marks)

def find_student(roll, students):
    return students.get(roll)
`,
      solution: `def average(marks: list[int]) -> float:
    return sum(marks) / len(marks)

def find_student(roll: int, students: dict[int, str]) -> str | None:
    return students.get(roll)
`,
      tests: [
        { call: 'average.__annotations__ == {"marks": list[int], "return": float}', expect: true, msg: 'average needs marks: list[int] and -> float' },
        { call: 'find_student.__annotations__ == {"roll": int, "students": dict[int, str], "return": str | None}', expect: true, msg: 'find_student needs roll: int, students: dict[int, str] and -> str | None' },
        { call: 'find_student(2, {1: "Asha", 2: "Ravi"})', expect: 'Ravi' },
      ],
      explain: 'Use lowercase built-in generics (`list[int]`, `dict[int, str]`) in Python 3.9+, and `X | None` in 3.10+. The return hint goes after `->`. Hints describe the contract; the behaviour stays the same.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write a `unittest.TestCase` class `TestDiscount` for the given `discount_price(price, pct)` function with **at least 3 test methods**:\n- a normal case (e.g. 1000 with 10% → 900)\n- 0% returns the same price\n- a negative pct raises `ValueError` (use `assertRaises`)\n\nThe grader runs your tests on the correct function (they must pass) **and** on buggy versions (your tests must catch them).',
      example: { title: 'a TestCase', code: 'import unittest\n\nclass TestAdd(unittest.TestCase):\n    def test_small(self):\n        self.assertEqual(2 + 3, 5)\n\n    def test_error(self):\n        with self.assertRaises(ZeroDivisionError):\n            1 / 0' },
      starter: `import unittest

def discount_price(price, pct):
    if pct < 0 or pct > 100:
        raise ValueError("pct must be 0-100")
    return price - price * pct / 100

class TestDiscount(unittest.TestCase):
    pass  # TODO: test methods (names must start with test_)
`,
      solution: `import unittest

def discount_price(price, pct):
    if pct < 0 or pct > 100:
        raise ValueError("pct must be 0-100")
    return price - price * pct / 100

class TestDiscount(unittest.TestCase):
    def test_ten_percent(self):
        self.assertEqual(discount_price(1000, 10), 900)

    def test_zero_percent(self):
        self.assertEqual(discount_price(499, 0), 499)

    def test_negative_raises(self):
        with self.assertRaises(ValueError):
            discount_price(100, -5)
`,
      tests: [
        { call: `exec("import io\\n_r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestDiscount))") or [_r.testsRun >= 3, _r.wasSuccessful()]`, expect: [true, true], msg: 'at least 3 tests, all passing on the correct function' },
        { call: `exec("_good = discount_price\\ndiscount_price = lambda price, pct: price\\n_r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestDiscount))\\ndiscount_price = _good") or _r.wasSuccessful()`, expect: false, msg: 'your tests must FAIL for a buggy version that ignores the discount' },
        { call: `exec("_good = discount_price\\ndiscount_price = lambda price, pct: price - price * pct / 100\\n_r = unittest.TextTestRunner(stream=io.StringIO()).run(unittest.defaultTestLoader.loadTestsFromTestCase(TestDiscount))\\ndiscount_price = _good") or _r.wasSuccessful()`, expect: false, msg: 'your tests must FAIL for a buggy version that never raises ValueError' },
      ],
      explain: 'Good tests cover the normal case, an edge case and the error case. A test suite that passes for broken code is worthless, so the grader swaps in buggy versions. `assertRaises` as a context manager checks that the exception really happens.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Mocking. `get_temperature(client, city)` should call `client.get("/weather", params={"city": city})`, read the returned dict and return `round(data["temp_c"])`; if `client.get` raises `ConnectionError` return `None`.\n\nThe grader passes a `unittest.mock.Mock` instead of a real HTTP client, so no network is used.',
      example: { title: 'Mock objects', code: 'from unittest.mock import Mock\napi = Mock()\napi.get.return_value = {"ok": True}\nprint(api.get("/x"))                 # {\'ok\': True}\napi.get.assert_called_once_with("/x")' },
      starter: `def get_temperature(client, city):
    # TODO
    pass
`,
      solution: `def get_temperature(client, city):
    try:
        data = client.get("/weather", params={"city": city})
    except ConnectionError:
        return None
    return round(data["temp_c"])
`,
      tests: [
        { call: `exec("from unittest.mock import Mock\\n_m = Mock()\\n_m.get.return_value = {'temp_c': 31.6}\\n_t = get_temperature(_m, 'Pune')\\n_m.get.assert_called_once_with('/weather', params={'city': 'Pune'})") or _t`, expect: 32, msg: 'call client.get("/weather", params={"city": city}) once and return the rounded temp_c' },
        { call: `exec("_m2 = Mock()\\n_m2.get.side_effect = ConnectionError('down')") or get_temperature(_m2, 'Delhi')`, expect: null, msg: 'return None when client.get raises ConnectionError' },
      ],
      explain: 'Passing the client in (dependency injection) lets tests replace it with a Mock: no network, fast and repeatable. `return_value` fakes a response, `side_effect` fakes an error, and `assert_called_once_with` checks your code called the API correctly.',
    },
  ],
};
