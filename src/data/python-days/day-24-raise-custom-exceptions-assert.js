export default {
  id: "day-24-raise-custom-exceptions-assert",
  title: "raise, Custom Exceptions, assert",
  module: "Module 4: Exceptions & Files",
  day: 24,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Signal problems yourself with raise, re-raise and chain exceptions, design your own exception classes for business rules, and use assert for internal sanity checks during development.",
  objectives: [
    "Raise built-in exceptions with clear messages",
    "Re-raise an exception and chain exceptions with raise ... from",
    "Create custom exception classes and an exception hierarchy",
    "Use assert correctly and know why it must not validate user input",
    "Know when to raise versus return an error value",
  ],
  theory: [
    {
      heading: "Why raise Exceptions Yourself?",
      content: "Python raises exceptions for technical problems (division by zero). But your program also has business rules: a withdrawal cannot exceed the balance, age cannot be negative, an email must contain \"@\". When a rule is broken, raise an exception so the caller is forced to deal with it. Analogy: a referee blowing the whistle - the game stops until someone handles the foul.",
      syntax: `def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age
`,
      points: [
        "raise ExceptionClass(\"message\") - raise with a message",
        "Choose the most fitting built-in type: ValueError for bad values, TypeError for wrong types, KeyError/LookupError for missing items",
        "Fail fast: detect bad data early, close to where it entered",
      ],
    },
    {
      heading: "Re-raising and Exception Chaining",
      content: "Inside an except block, a bare raise re-raises the same exception after you do something (like logging). raise NewError(...) from e wraps a low-level error in a meaningful high-level one and keeps the original as __cause__, so the traceback shows both. raise ... from None hides the original context.",
      syntax: `try:
    price = float(text)
except ValueError as e:
    raise InvalidPriceError(f"bad price: {text}") from e

except Exception:
    log_error()
    raise          # re-raise the same exception
`,
    },
    {
      heading: "Custom Exceptions",
      content: "Create your own exception by subclassing Exception (never BaseException). A good practice is to make one base exception for your app and specific subclasses for each problem. Callers can then catch one specific error or the whole family. You can add extra attributes (like the amount or the field name) by overriding __init__.",
      syntax: `class BankError(Exception):
    """Base class for bank errors."""

class InsufficientFundsError(BankError):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"Need {amount}, have only {balance}")
`,
      tip: "Name custom exceptions with the Error suffix: PaymentError, InvalidEmailError.",
    },
    {
      heading: "assert Statement",
      content: "assert condition, \"message\" raises AssertionError if the condition is False. It is a developer tool to check assumptions that should ALWAYS be true (\"this list should never be empty here\"). Assertions are removed when Python runs with the -O (optimise) flag, so NEVER use assert to validate user input, permissions or anything important in production - use if + raise instead.",
      syntax: `def average(nums):
    assert len(nums) > 0, "nums must not be empty"
    return sum(nums) / len(nums)
`,
    },
    {
      heading: "raise vs return error codes",
      content: "Returning special values like -1 or None for errors is easy to forget to check, and errors silently spread. Raising an exception cannot be ignored: either someone handles it, or the program stops with a clear traceback. Python follows EAFP - \"Easier to Ask Forgiveness than Permission\": try the operation and handle the exception, instead of checking everything beforehand (LBYL - Look Before You Leap).",
    },
  ],
  examples: [
    {
      title: "Validating Input with raise",
      scenario: "A registration function must reject invalid names, ages and emails with clear messages.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def register(name, age, email):
    if not isinstance(age, int):
        raise TypeError(f"age must be int, got {type(age).__name__}")
    if not name.strip():
        raise ValueError("name is required")
    if not 18 <= age <= 60:
        raise ValueError(f"age {age} not in range 18-60")
    if "@" not in email:
        raise ValueError(f"invalid email: {email}")
    return f"Registered {name} ({age}) <{email}>"

tests = [("Asha", 22, "asha@mail.com"), ("", 25, "x@y.com"),
         ("Ravi", 15, "ravi@mail.com"), ("Neha", "30", "neha@mail.com"),
         ("Om", 30, "om.mail.com")]
for args in tests:
    try:
        print(register(*args))
    except (ValueError, TypeError) as e:
        print(f"{type(e).__name__}: {e}")
`,
      python: {
        files: {
          "main.py": `def register(name, age, email):
    if not isinstance(age, int):
        raise TypeError(f"age must be int, got {type(age).__name__}")
    if not name.strip():
        raise ValueError("name is required")
    if not 18 <= age <= 60:
        raise ValueError(f"age {age} not in range 18-60")
    if "@" not in email:
        raise ValueError(f"invalid email: {email}")
    return f"Registered {name} ({age}) <{email}>"

tests = [("Asha", 22, "asha@mail.com"), ("", 25, "x@y.com"),
         ("Ravi", 15, "ravi@mail.com"), ("Neha", "30", "neha@mail.com"),
         ("Om", 30, "om.mail.com")]
for args in tests:
    try:
        print(register(*args))
    except (ValueError, TypeError) as e:
        print(f"{type(e).__name__}: {e}")
`,
        },
      },
      result: `Registered Asha (22) <asha@mail.com>
ValueError: name is required
ValueError: age 15 not in range 18-60
TypeError: age must be int, got str
ValueError: invalid email: om.mail.com`,
      explanation: "Each rule raises the most suitable built-in exception with a precise message. The caller decides how to handle it - here by printing the error and moving on.",
    },
    {
      title: "Custom Exception Hierarchy: Bank Account",
      scenario: "A bank app needs specific errors for insufficient funds and invalid amounts, plus one base error to catch them all.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class BankError(Exception):
    """Base class for all bank errors."""

class InvalidAmountError(BankError):
    pass

class InsufficientFundsError(BankError):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        self.shortfall = amount - balance
        super().__init__(f"cannot withdraw {amount}; balance is {balance}")

def withdraw(balance, amount):
    if amount <= 0:
        raise InvalidAmountError(f"amount must be positive, got {amount}")
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

balance = 5000
for amt in [1500, -200, 9000]:
    try:
        balance = withdraw(balance, amt)
        print(f"Withdrew {amt}. Balance: {balance}")
    except InsufficientFundsError as e:
        print("Declined:", e, "| short by", e.shortfall)
    except BankError as e:
        print(f"{type(e).__name__}: {e}")

print(issubclass(InsufficientFundsError, BankError), issubclass(BankError, Exception))
`,
      python: {
        files: {
          "main.py": `class BankError(Exception):
    """Base class for all bank errors."""

class InvalidAmountError(BankError):
    pass

class InsufficientFundsError(BankError):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        self.shortfall = amount - balance
        super().__init__(f"cannot withdraw {amount}; balance is {balance}")

def withdraw(balance, amount):
    if amount <= 0:
        raise InvalidAmountError(f"amount must be positive, got {amount}")
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

balance = 5000
for amt in [1500, -200, 9000]:
    try:
        balance = withdraw(balance, amt)
        print(f"Withdrew {amt}. Balance: {balance}")
    except InsufficientFundsError as e:
        print("Declined:", e, "| short by", e.shortfall)
    except BankError as e:
        print(f"{type(e).__name__}: {e}")

print(issubclass(InsufficientFundsError, BankError), issubclass(BankError, Exception))
`,
        },
      },
      result: `Withdrew 1500. Balance: 3500
InvalidAmountError: amount must be positive, got -200
Declined: cannot withdraw 9000; balance is 3500 | short by 5500
True True`,
      explanation: "InsufficientFundsError stores extra data (shortfall) that the handler uses. Because both errors inherit BankError, the second except catches any other bank error. The specific handler is placed first.",
    },
    {
      title: "Re-raise and Exception Chaining",
      scenario: "A config loader converts low-level errors into a meaningful ConfigError, while a logger re-raises errors it cannot handle.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class ConfigError(Exception):
    pass

def read_port(settings):
    try:
        return int(settings["PORT"])
    except KeyError as e:
        raise ConfigError("PORT setting is missing") from e
    except ValueError as e:
        raise ConfigError(f"PORT must be a number, got {settings['PORT']!r}") from e

for cfg in [{"PORT": "8000"}, {}, {"PORT": "eighty"}]:
    try:
        print("Port:", read_port(cfg))
    except ConfigError as e:
        print("ConfigError:", e, "| caused by:", type(e.__cause__).__name__)

def risky():
    try:
        return 1 / 0
    except ZeroDivisionError:
        print("logging the error, then re-raising...")
        raise

try:
    risky()
except ZeroDivisionError as e:
    print("Caller handled:", e)
`,
      python: {
        files: {
          "main.py": `class ConfigError(Exception):
    pass

def read_port(settings):
    try:
        return int(settings["PORT"])
    except KeyError as e:
        raise ConfigError("PORT setting is missing") from e
    except ValueError as e:
        raise ConfigError(f"PORT must be a number, got {settings['PORT']!r}") from e

for cfg in [{"PORT": "8000"}, {}, {"PORT": "eighty"}]:
    try:
        print("Port:", read_port(cfg))
    except ConfigError as e:
        print("ConfigError:", e, "| caused by:", type(e.__cause__).__name__)

def risky():
    try:
        return 1 / 0
    except ZeroDivisionError:
        print("logging the error, then re-raising...")
        raise

try:
    risky()
except ZeroDivisionError as e:
    print("Caller handled:", e)
`,
        },
      },
      result: `Port: 8000
ConfigError: PORT setting is missing | caused by: KeyError
ConfigError: PORT must be a number, got 'eighty' | caused by: ValueError
logging the error, then re-raising...
Caller handled: division by zero`,
      explanation: "raise ... from e chains the original exception into __cause__, so debugging shows the real root cause. A bare raise inside except re-raises the same exception after logging.",
    },
    {
      title: "assert for Developer Checks",
      scenario: "Use assert to verify internal assumptions while developing a discount function.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def apply_discount(price, percent):
    assert 0 <= percent <= 100, f"percent out of range: {percent}"
    final = price * (100 - percent) / 100
    assert final <= price, "discounted price cannot be higher"
    return final

print(apply_discount(1000, 20))
try:
    apply_discount(1000, 150)
except AssertionError as e:
    print("AssertionError:", e)

nums = [3, 1, 2]
nums.sort()
assert nums == [1, 2, 3]
print("sorted check passed")
print("assert active?", __debug__)
`,
      python: {
        files: {
          "main.py": `def apply_discount(price, percent):
    assert 0 <= percent <= 100, f"percent out of range: {percent}"
    final = price * (100 - percent) / 100
    assert final <= price, "discounted price cannot be higher"
    return final

print(apply_discount(1000, 20))
try:
    apply_discount(1000, 150)
except AssertionError as e:
    print("AssertionError:", e)

nums = [3, 1, 2]
nums.sort()
assert nums == [1, 2, 3]
print("sorted check passed")
print("assert active?", __debug__)
`,
        },
      },
      result: `800.0
AssertionError: percent out of range: 150
sorted check passed
assert active? True`,
      explanation: "assert raises AssertionError with the message when the condition is False. __debug__ is True normally; with python -O it becomes False and all asserts are skipped - which is why assert must not be used to validate user input.",
    },
  ],
  interview: [
    {
      q: "What does the raise keyword do?",
      a: "It throws an exception: raise ValueError(\"msg\"). Execution stops at that point and Python looks for a matching except block up the call stack.",
      level: "Easy",
    },
    {
      q: "How do you create a custom exception?",
      a: "Define a class that inherits from Exception (or a subclass of it), e.g. class PaymentError(Exception): pass. Optionally override __init__ to store extra data and call super().__init__(message).",
      level: "Easy",
    },
    {
      q: "Why inherit custom exceptions from Exception and not BaseException?",
      a: "BaseException also covers SystemExit and KeyboardInterrupt. Code that catches Exception would not catch your error, and you risk mixing app errors with interpreter-exit signals.",
      level: "Medium",
    },
    {
      q: "What is the difference between raise and raise e and raise X from e?",
      a: "Bare raise re-raises the current exception with its original traceback. raise e re-raises the object (adding the current line to the traceback). raise X from e raises a new exception X with e stored as __cause__ (explicit chaining).",
      level: "Hard",
    },
    {
      q: "When should you not use assert?",
      a: "Never for validating user input, permissions or data in production, because assert statements are stripped when Python runs with -O. Use if + raise for those. assert is for internal invariants and tests.",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

class AppError(Exception):
    pass
class DBError(AppError):
    pass

try:
    raise DBError("db down")
except AppError as e:
    print(type(e).__name__, "-", e)
`,
      a: `Output:
DBError - db down

DBError is a subclass of AppError, so except AppError catches it. type(e).__name__ is still the real class, DBError.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

try:
    assert 2 + 2 == 5, "math is broken"
except AssertionError as e:
    print("Caught:", e)
`,
      a: `Output:
Caught: math is broken

The condition is False so AssertionError is raised with the given message.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

try:
    try:
        int("x")
    except ValueError as e:
        raise RuntimeError("wrapper") from e
except RuntimeError as err:
    print(err, "<-", type(err.__cause__).__name__)
`,
      a: `Output:
wrapper <- ValueError

The RuntimeError carries the original ValueError in __cause__.`,
      level: "Hard",
    },
    {
      q: "What is EAFP vs LBYL?",
      a: "EAFP (Easier to Ask Forgiveness than Permission): try the action and handle exceptions - Pythonic style. LBYL (Look Before You Leap): check conditions first with if. EAFP avoids race conditions and duplicate checks.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write set_marks(m) that raises ValueError if m is not between 0 and 100, otherwise returns m. Test with 85 and 120.",
      hint: "if not 0 <= m <= 100: raise ValueError(...)",
      solution: `def set_marks(m):
    if not 0 <= m <= 100:
        raise ValueError(f"marks must be 0-100, got {m}")
    return m

for m in [85, 120]:
    try:
        print("Saved", set_marks(m))
    except ValueError as e:
        print("Error:", e)
`,
    },
    {
      task: "Create InvalidPasswordError and a function check_password(pw) that raises it when the password is shorter than 8 characters or has no digit.",
      hint: "any(ch.isdigit() for ch in pw)",
      solution: `class InvalidPasswordError(Exception):
    pass

def check_password(pw):
    if len(pw) < 8:
        raise InvalidPasswordError("must be at least 8 characters")
    if not any(ch.isdigit() for ch in pw):
        raise InvalidPasswordError("must contain a digit")
    return True

for pw in ["abc", "abcdefgh", "abcdefg1"]:
    try:
        check_password(pw)
        print(pw, "OK")
    except InvalidPasswordError as e:
        print(pw, "->", e)
`,
    },
    {
      task: "Create OutOfStockError(item, available) that stores both values, and an order(item, qty, stock) function that raises it.",
      hint: "Override __init__ and call super().__init__(message).",
      solution: `class OutOfStockError(Exception):
    def __init__(self, item, available):
        self.item = item
        self.available = available
        super().__init__(f"{item}: only {available} left")

def order(item, qty, stock):
    if stock.get(item, 0) < qty:
        raise OutOfStockError(item, stock.get(item, 0))
    stock[item] -= qty
    return stock[item]

stock = {"pen": 5}
try:
    print(order("pen", 3, stock))
    print(order("pen", 3, stock))
except OutOfStockError as e:
    print("Error:", e, "| available:", e.available)
`,
    },
    {
      task: "Write average(nums) using assert to ensure the list is not empty and catch the AssertionError when called with [].",
      hint: "assert nums, \"empty list\"",
      solution: `def average(nums):
    assert nums, "empty list"
    return sum(nums) / len(nums)

print(average([2, 4, 6]))
try:
    average([])
except AssertionError as e:
    print("AssertionError:", e)
`,
    },
  ],
  quiz: [
    {
      question: "Which keyword manually throws an exception?",
      options: [
        "throw",
        "raise",
        "except",
        "error",
      ],
      answer: 1,
      explanation: "Python uses raise.",
    },
    {
      question: "Custom exceptions should usually inherit from:",
      options: [
        "object",
        "BaseException",
        "Exception",
        "Error",
      ],
      answer: 2,
      explanation: "Inherit from Exception or one of its subclasses.",
    },
    {
      question: "What happens to assert statements when Python runs with -O?",
      options: [
        "They are removed",
        "They raise SystemExit",
        "They become warnings",
        "They run twice",
      ],
      answer: 0,
      explanation: "Optimised mode strips assert statements.",
    },
    {
      question: "raise NewError(\"x\") from e stores e in which attribute?",
      options: [
        "__context__ only",
        "args",
        "__traceback__",
        "__cause__",
      ],
      answer: 3,
      explanation: "Explicit chaining sets __cause__.",
    },
    {
      question: "Inside an except block, what does a bare raise do?",
      options: [
        "Raises a new Exception",
        "Re-raises the current exception",
        "Ignores the error",
        "Causes a SyntaxError",
      ],
      answer: 1,
      explanation: "It re-raises the exception being handled.",
    },
  ],
};
