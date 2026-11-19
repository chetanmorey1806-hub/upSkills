// errorOf(expr) builds a test call that returns the name of the exception raised by expr ('no error' if none).
const errorOf = (expr) => `exec("try:\\n    ${expr}\\n    _r = 'no error'\\nexcept Exception as e:\\n    _r = type(e).__name__") or _r`;
const messageOf = (expr) => `exec("try:\\n    ${expr}\\n    _r = 'no error'\\nexcept Exception as e:\\n    _r = str(e)") or _r`;

export default {
  lesson: 'day-24-raise-custom-exceptions-assert',
  minutes: 30,
  intro: 'Raise exceptions with clear messages, build a custom exception hierarchy, chain errors with raise ... from, and use assert correctly.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why must you **not** use `assert` to validate user input in production code?',
      options: [
        'assert is slower than if',
        'Asserts are removed when Python runs with the -O (optimise) flag, so the check disappears',
        'assert can only check numbers',
        'assert always raises ValueError',
      ],
      answer: 1,
      explain: '`python -O` strips all assert statements. Use assert for developer checks ("this should never happen"); validate input with `if ...: raise ValueError(...)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `class AppError(Exception):
    pass

class PaymentError(AppError):
    pass

try:
    try:
        int("x")
    except ValueError as e:
        raise PaymentError("bad amount") from e
except AppError as err:
    print(type(err).__name__, "-", err)
    print(type(err.__cause__).__name__)
    print(isinstance(err, Exception))`,
      expected: 'PaymentError - bad amount\nValueError\nTrue',
      explain: '`except AppError` also catches its subclass PaymentError: that is the point of an exception **hierarchy**. `raise ... from e` stores the original exception in `__cause__`, so the traceback shows both ("The above exception was the direct cause...").',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `set_age(age)` that returns the age when it is valid, otherwise **raises**:\n- `TypeError("age must be an int")` if age is not an int\n- `ValueError("age must be between 0 and 120")` if it is outside 0..120',
      example: { title: 'raise with a message', code: 'def set_qty(q):\n    if q <= 0:\n        raise ValueError("quantity must be positive")\n    return q' },
      starter: `def set_age(age):
    # TODO: validate and raise
    return age
`,
      solution: `def set_age(age):
    if not isinstance(age, int):
        raise TypeError("age must be an int")
    if age < 0 or age > 120:
        raise ValueError("age must be between 0 and 120")
    return age
`,
      tests: [
        { call: 'set_age(25)', expect: 25 },
        { call: errorOf("set_age('25')"), expect: 'TypeError', msg: "set_age('25') must raise TypeError" },
        { call: errorOf('set_age(-1)'), expect: 'ValueError', msg: 'set_age(-1) must raise ValueError' },
        { call: messageOf('set_age(150)'), expect: 'age must be between 0 and 120', msg: 'the ValueError message must be "age must be between 0 and 120"' },
      ],
      explain: 'Raising stops the function immediately and lets the **caller** decide what to do. Pick the right type: wrong kind of value → TypeError, right type but bad value → ValueError. Returning an error string instead would be easy to ignore by mistake.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Bank account with custom exceptions. Create:\n- `BankError(Exception)`\n- `InsufficientFundsError(BankError)` and `InvalidAmountError(BankError)`\n\nand `withdraw(balance, amount)` that returns the new balance, raising `InvalidAmountError` if amount ≤ 0 and `InsufficientFundsError` if amount > balance.',
      example: { title: 'a custom exception', code: 'class OutOfStockError(Exception):\n    pass\n\nraise OutOfStockError("Only 2 left")' },
      starter: `# TODO: exception classes

def withdraw(balance, amount):
    return balance - amount   # TODO: checks
`,
      solution: `class BankError(Exception):
    pass

class InsufficientFundsError(BankError):
    pass

class InvalidAmountError(BankError):
    pass

def withdraw(balance, amount):
    if amount <= 0:
        raise InvalidAmountError("amount must be positive")
    if amount > balance:
        raise InsufficientFundsError(f"balance is only {balance}")
    return balance - amount
`,
      tests: [
        { call: 'withdraw(1000, 300)', expect: 700 },
        { call: errorOf('withdraw(1000, 5000)'), expect: 'InsufficientFundsError', msg: 'withdraw(1000, 5000) must raise InsufficientFundsError' },
        { call: errorOf('withdraw(1000, 0)'), expect: 'InvalidAmountError', msg: 'withdraw(1000, 0) must raise InvalidAmountError' },
        { call: 'issubclass(InsufficientFundsError, BankError) and issubclass(InvalidAmountError, BankError) and issubclass(BankError, Exception)', expect: true, msg: 'both errors must inherit from BankError, which inherits from Exception' },
      ],
      explain: 'Custom exceptions are just classes that inherit from `Exception` (never directly from BaseException). A shared base class lets callers catch all bank problems with `except BankError` or a specific one when needed.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Exception chaining. Write `load_price(text)` that returns `float(text)`; if that raises ValueError, raise a `PriceError` (your own class) with the message `"invalid price: <text>"` **from** the original error, so the cause is kept.',
      example: { title: 'raise ... from', code: 'try:\n    {}["id"]\nexcept KeyError as e:\n    raise RuntimeError("config incomplete") from e' },
      starter: `class PriceError(Exception):
    pass

def load_price(text):
    # TODO
    pass
`,
      solution: `class PriceError(Exception):
    pass

def load_price(text):
    try:
        return float(text)
    except ValueError as e:
        raise PriceError(f"invalid price: {text}") from e
`,
      tests: [
        { call: 'load_price("49.5")', expect: 49.5 },
        { call: messageOf("load_price('abc')"), expect: 'invalid price: abc' },
        { call: `exec("try:\\n    load_price('abc')\\nexcept PriceError as e:\\n    _c = type(e.__cause__).__name__") or _c`, expect: 'ValueError', msg: 'use raise PriceError(...) from e so __cause__ is the ValueError' },
      ],
      explain: '`raise New(...) from e` keeps the original error as `__cause__`, so debugging shows the real root problem. Raising without `from` inside except still links them (as `__context__`), but `from` makes the intent explicit.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Inside an `except` block, which single statement **re-raises** the same exception after logging it?',
      accept: ['raise'],
      explain: 'A bare `raise` inside except re-raises the current exception with its original traceback. Writing `raise e` also works but adds the current line to the traceback.',
    },
  ],
};
