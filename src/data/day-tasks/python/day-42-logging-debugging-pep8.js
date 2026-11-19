export default {
  lesson: 'day-42-logging-debugging-pep8',
  minutes: 30,
  intro: 'Replace print() with proper logging levels, find and fix a bug step by step, and clean code up to PEP 8.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Logging levels. What is printed?',
      code: `import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.WARNING,
                    format="%(levelname)s:%(name)s:%(message)s")
log = logging.getLogger("shop")
log.debug("cart loaded")
log.info("user logged in")
log.warning("stock low: %s", "pen")
log.error("payment failed")
log.setLevel(logging.INFO)
log.info("retrying")`,
      expected: 'WARNING:shop:stock low: pen\nERROR:shop:payment failed\nINFO:shop:retrying',
      explain: 'Levels go DEBUG < INFO < WARNING < ERROR < CRITICAL; with level WARNING, debug and info messages are dropped. Setting the logger to INFO later lets "retrying" through. Passing `"%s", value` lets logging format the message only if it is actually emitted.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is `logging` preferred over `print()` in real applications?',
      options: [
        'print() is slower',
        'Logging has levels, timestamps/format, and can send output to files or services without changing code',
        'print() does not work on servers',
        'Logging automatically fixes bugs',
      ],
      answer: 1,
      explain: 'With logging you can switch verbosity with a level, add time and module names via a format, and route messages to console, files or monitoring with handlers. Debug prints must be found and deleted by hand.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `process_orders(orders)` using the logger `logging.getLogger("shop")`. `orders` is a list of `(item, qty)`:\n- for qty > 0 log **INFO** `"<item> x <qty>"`\n- otherwise log **WARNING** `"invalid qty for <item>"`\n\nReturn the number of valid orders. Do not use print().',
      example: { title: 'a named logger', code: 'import logging\nlog = logging.getLogger("billing")\nlog.info("invoice %s created", 1042)\nlog.error("GST number missing")' },
      starter: `import logging

def process_orders(orders):
    valid = 0
    for item, qty in orders:
        print(item, qty)   # TODO: use logging instead
    return valid
`,
      solution: `import logging

log = logging.getLogger("shop")

def process_orders(orders):
    valid = 0
    for item, qty in orders:
        if qty > 0:
            log.info("%s x %s", item, qty)
            valid += 1
        else:
            log.warning("invalid qty for %s", item)
    return valid
`,
      tests: [
        { call: `exec("import unittest\\n_tc = unittest.TestCase()\\nwith _tc.assertLogs('shop', level='INFO') as _cm:\\n    _res = process_orders([('pen', 2), ('bag', 0), ('book', 1)])") or [_res, _cm.output]`, expect: [2, ['INFO:shop:pen x 2', 'WARNING:shop:invalid qty for bag', 'INFO:shop:book x 1']] },
      ],
      explain: 'Named loggers (`getLogger("shop")`) let you filter messages per module. Use INFO for normal events and WARNING for something suspicious that the program can survive. The test captures the records with `assertLogs`, which is also how you test logging in real projects.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Debugging. `find_max(nums)` has **two bugs**: it gives wrong answers for lists of negative numbers and when the largest value is the first item. Find and fix them (do not use the built-in `max`).',
      example: { title: 'debug with f"{var=}"', code: 'best = 0\nfor i in range(1, 3):\n    print(f"{i=} {best=}")   # prints i=1 best=0 ...' },
      starter: `def find_max(nums):
    best = 0
    for i in range(1, len(nums)):
        if nums[i] > best:
            best = nums[i]
    return best
`,
      solution: `def find_max(nums):
    best = nums[0]
    for i in range(1, len(nums)):
        if nums[i] > best:
            best = nums[i]
    return best
`,
      tests: [
        { call: 'find_max([3, 9, 4])', expect: 9 },
        { call: 'find_max([-5, -2, -9])', expect: -2, msg: 'all-negative list: starting with best = 0 is wrong' },
        { call: 'find_max([10, 2, 3])', expect: 10, msg: 'the largest value is the first item' },
        { call: "'max' not in find_max.__code__.co_names", expect: true, msg: 'do not use the built-in max()' },
      ],
      explain: 'Bug 1: starting from 0 assumes there is a positive number. Bug 2: the loop starts at index 1, so the first item was never compared. Initialising `best = nums[0]` fixes both. Tracing variables with `print(f"{i=} {best=}")` or a breakpoint shows this quickly.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'PEP 8 clean-up. Rename everything to follow PEP 8 **without changing behaviour**:\n- class `shopping_cart` → CapWords `ShoppingCart`\n- function `CalculateTotal` → snake_case `calculate_total`\n- the constant `gstRate` → UPPER_CASE `GST_RATE`\n- method `AddItem` → `add_item`',
      example: { title: 'PEP 8 naming', code: 'MAX_RETRIES = 3            # constant\n\nclass InvoiceGenerator:   # class: CapWords\n    def build_pdf(self):  # method: snake_case\n        page_count = 1    # variable: snake_case' },
      starter: `gstRate = 0.18

class shopping_cart:
    def __init__(self):
        self.items = []

    def AddItem(self, price):
        self.items.append(price)

def CalculateTotal(cart):
    return round(sum(cart.items) * (1 + gstRate), 2)
`,
      solution: `GST_RATE = 0.18


class ShoppingCart:
    def __init__(self):
        self.items = []

    def add_item(self, price):
        self.items.append(price)


def calculate_total(cart):
    return round(sum(cart.items) * (1 + GST_RATE), 2)
`,
      tests: [
        { call: 'GST_RATE', expect: 0.18 },
        { call: '(lambda c: (c.add_item(100), c.add_item(250), calculate_total(c))[2])(ShoppingCart()) == 413', expect: true, msg: 'a cart with 100 + 250 must total 413 with GST' },
        { call: "all(n not in globals() for n in ['gstRate', 'shopping_cart', 'CalculateTotal'])", expect: true, msg: 'the old names must be gone' },
      ],
      explain: 'PEP 8: classes in CapWords, functions/methods/variables in snake_case, constants in UPPER_CASE, two blank lines between top-level definitions. Tools like **black** (formatting) and **ruff/flake8/pylint** (linting) enforce this automatically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which follow PEP 8 / Pythonic style? (select all that apply)',
      options: [
        'Indent with 4 spaces',
        '`if x == None:`',
        '`if not items:` to check for an empty list',
        '`import os, sys` on one line',
        'Using `with open(...)` instead of manual close()',
      ],
      answers: [0, 2, 4],
      explain: 'Compare with None using `is None`, not `==`. Imports go on **separate** lines (`import os` then `import sys`). Truthiness (`if not items`) and context managers are idiomatic Python.',
    },
  ],
};
