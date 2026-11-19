export default {
  lesson: 'day-23-exception-handling',
  minutes: 30,
  intro: 'Catch specific exceptions with try / except / else / finally so programs keep running and give friendly messages.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which exception does `int("abc")` raise?',
      options: ['TypeError', 'ValueError', 'SyntaxError', 'NameError'],
      answer: 1,
      explain: 'The **type** is fine (int() accepts a string) but the **value** "abc" cannot be converted, so it is a `ValueError`. `TypeError` is for wrong types, e.g. `"5" + 3`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `def test(x):
    try:
        r = 10 / x
    except ZeroDivisionError:
        print("zero!")
        return "E"
    else:
        print("ok", r)
        return "R"
    finally:
        print("finally")

print(test(2))
print(test(0))`,
      expected: 'ok 5.0\nfinally\nR\nzero!\nfinally\nE',
      explain: '`else` runs only when **no** exception happened; `except` runs when the matching one did. `finally` runs in **both** cases, even when the block returns: it executes before the function actually returns.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are caught by `except Exception:`? (select all that apply)',
      options: ['ValueError', 'ZeroDivisionError', 'KeyError', 'FileNotFoundError', 'KeyboardInterrupt (Ctrl+C)'],
      answers: [0, 1, 2, 3],
      explain: 'Most built-in errors inherit from `Exception`. `KeyboardInterrupt` and `SystemExit` inherit directly from `BaseException`, so Ctrl+C still stops the program. A bare `except:` would swallow even those: avoid it.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `safe_divide(a, b)` that returns `a / b` rounded to 2 decimals, but:\n- returns `"Cannot divide by zero"` on ZeroDivisionError\n- returns `"Numbers only"` on TypeError (e.g. `safe_divide("10", 2)`)',
      example: { title: 'catching a specific exception', code: 'try:\n    value = [1, 2][5]\nexcept IndexError:\n    value = "no such item"' },
      starter: `def safe_divide(a, b):
    return round(a / b, 2)   # TODO: handle errors
`,
      solution: `def safe_divide(a, b):
    try:
        return round(a / b, 2)
    except ZeroDivisionError:
        return "Cannot divide by zero"
    except TypeError:
        return "Numbers only"
`,
      tests: [
        { call: 'safe_divide(10, 4)', expect: 2.5 },
        { call: 'safe_divide(10, 0)', expect: 'Cannot divide by zero' },
        { call: 'safe_divide("10", 2)', expect: 'Numbers only' },
      ],
      explain: 'Catch **specific** exceptions in separate `except` blocks so each gets the right message. A bare `except:` would hide real bugs (like a typo causing NameError) behind a misleading message.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `parse_marks(items)` that converts a list of strings to ints, **skipping** invalid entries, and returns `(valid_numbers, error_count)`.\n\n`parse_marks(["78", "abc", "91", "", "65"])` → `([78, 91, 65], 2)`',
      example: { title: 'try inside a loop', code: 'for s in ["4", "x"]:\n    try:\n        print(int(s) * 2)\n    except ValueError:\n        print("skip", s)' },
      starter: `def parse_marks(items):
    numbers = []
    errors = 0
    # TODO
    return numbers, errors
`,
      solution: `def parse_marks(items):
    numbers = []
    errors = 0
    for s in items:
        try:
            numbers.append(int(s))
        except ValueError:
            errors += 1
    return numbers, errors
`,
      tests: [
        { call: 'parse_marks(["78", "abc", "91", "", "65"])', expect: [[78, 91, 65], 2] },
        { call: 'parse_marks([" 40 ", "4.5"])', expect: [[40], 1] },
      ],
      explain: 'Put the `try` **inside** the loop so one bad value is skipped and the loop continues. A try around the whole loop would stop at the first error. Note `int(" 40 ")` works (spaces are allowed) but `int("4.5")` raises ValueError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `get_price(prices, item)` for a shop dict. Catch the exception **as e** and return:\n- the price when found\n- `"Not found: <item>"` on KeyError (use `e.args[0]` or the item)\n\nAlso keep a global list `log`; append `"lookup"` in a `finally` block on **every** call.',
      example: { title: 'except ... as e', code: 'try:\n    {}["x"]\nexcept KeyError as e:\n    print("missing key", e)' },
      starter: `log = []

def get_price(prices, item):
    # TODO: try / except KeyError as e / finally
    return prices[item]
`,
      solution: `log = []

def get_price(prices, item):
    try:
        return prices[item]
    except KeyError as e:
        return f"Not found: {e.args[0]}"
    finally:
        log.append("lookup")
`,
      tests: [
        { call: 'get_price({"pen": 10}, "pen")', expect: 10 },
        { call: 'get_price({"pen": 10}, "bag")', expect: 'Not found: bag' },
        { call: 'log', expect: ['lookup', 'lookup'], msg: 'finally must append "lookup" on both calls' },
      ],
      explain: '`as e` gives you the exception object; for KeyError, `e.args[0]` is the missing key. `finally` runs whether the lookup succeeded or failed, which is why it is used for clean-up and logging.',
    },
  ],
};
