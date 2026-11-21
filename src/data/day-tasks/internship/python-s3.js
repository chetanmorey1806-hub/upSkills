export default {
  lesson: 'python-s3',
  minutes: 55,
  intro: 'Sprint 3 at PaisaPath: generate the monthly merchant report, wrap wallet logic in a proper class with exceptions, build a transaction service and think like a tester.',
  tasks: [
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**PP-301 · Story · Medium** Monthly spend report\n\nMerchants download a text report. Write `monthly_report(rows)` where each row is `{"date": "YYYY-MM-DD", "amount": float}`. Return a string with one line per month, **sorted by month**, then a total line:\n```\n2024-04: Rs 1,250.00\n2024-05: Rs 12,000.50\nTOTAL: Rs 13,250.50\n```\n- Amounts use thousands separators and exactly 2 decimals\n- Lines are joined with `\\n` (no trailing newline)',
      example: { title: 'formatting money with f-strings', code: 'amount = 1234567.5\nprint(f"Rs {amount:,.2f}")   # Rs 1,234,567.50' },
      starter: 'def monthly_report(rows):\n    # TODO\n    return ""\n',
      solution: `def monthly_report(rows):
    totals = {}
    for r in rows:
        month = r["date"][:7]
        totals[month] = totals.get(month, 0) + r["amount"]
    lines = [f"{m}: Rs {totals[m]:,.2f}" for m in sorted(totals)]
    lines.append(f"TOTAL: Rs {sum(totals.values()):,.2f}")
    return "\\n".join(lines)
`,
      tests: [
        { call: 'monthly_report([{"date": "2024-05-03", "amount": 12000.5}, {"date": "2024-04-20", "amount": 1000}, {"date": "2024-04-28", "amount": 250}])', expect: '2024-04: Rs 1,250.00\n2024-05: Rs 12,000.50\nTOTAL: Rs 13,250.50' },
        { call: 'monthly_report([{"date": "2025-01-01", "amount": 99.999}])', expect: '2025-01: Rs 100.00\nTOTAL: Rs 100.00', msg: 'Round to 2 decimals in the output' },
        { call: 'monthly_report([])', expect: 'TOTAL: Rs 0.00', msg: 'No rows -> only the total line' },
      ],
      explain: 'Review: `date[:7]` gives "YYYY-MM", and because ISO dates sort as text, `sorted()` puts months in the right order (that is why we never store "05-2024"). The format spec `:,.2f` adds separators and fixes 2 decimals. Build a list of lines and `"\\n".join` them instead of adding strings in a loop; it is cleaner and avoids a stray trailing newline.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 12,
      q: '**PP-302 · Story · High** Wallet class\n\nReplace the global-variable wallet code with a class.\n\n`Wallet(owner, balance=0)`:\n- `deposit(amount)`: amount must be `> 0`, otherwise `raise ValueError("amount must be positive")`\n- `withdraw(amount)`: amount must be `> 0` (same error) and not more than the balance, otherwise `raise ValueError("insufficient balance")`\n- Both update `balance` and append `("deposit", amount)` / `("withdraw", amount)` to a `history` list\n- `__str__` returns `"Asha: Rs 300"` style text\n\nThe helper `raises(fn)` (used by QA tests) is already in the starter; keep it.',
      example: { title: 'a class that validates input', code: 'class Counter:\n    def __init__(self, limit):\n        self.value = 0\n        self.limit = limit\n    def add(self):\n        if self.value >= self.limit:\n            raise ValueError("limit reached")\n        self.value += 1' },
      starter: `def raises(fn):
    try:
        fn()
    except ValueError as e:
        return str(e)
    return None

class Wallet:
    # TODO
    pass
`,
      solution: `def raises(fn):
    try:
        fn()
    except ValueError as e:
        return str(e)
    return None

class Wallet:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise ValueError("insufficient balance")
        self.balance -= amount
        self.history.append(("withdraw", amount))

    def __str__(self):
        return f"{self.owner}: Rs {self.balance}"
`,
      tests: [
        { call: '(lambda w: (w.deposit(500), w.withdraw(200), w.balance)[-1])(Wallet("Asha"))', expect: 300, msg: 'deposit 500 then withdraw 200 -> balance 300' },
        { call: '(lambda w: (w.deposit(500), w.withdraw(200), w.history)[-1])(Wallet("Asha"))', expect: [['deposit', 500], ['withdraw', 200]], msg: 'history records each operation as a tuple' },
        { call: 'str((lambda w: (w.deposit(300), w)[-1])(Wallet("Asha")))', expect: 'Asha: Rs 300', msg: '__str__ format' },
        { call: 'raises(lambda: Wallet("Ravi", 100).withdraw(101))', expect: 'insufficient balance', msg: 'Withdrawing more than the balance raises ValueError("insufficient balance")' },
        { call: 'raises(lambda: Wallet("Ravi").deposit(0))', expect: 'amount must be positive', msg: 'Depositing 0 raises ValueError' },
        { call: 'raises(lambda: Wallet("Ravi", 100).withdraw(-5))', expect: 'amount must be positive', msg: 'A negative withdrawal raises ValueError' },
        { call: '(lambda w: (w.withdraw(100), w.balance)[-1])(Wallet("Meera", 100))', expect: 0, msg: 'Withdrawing exactly the balance is allowed' },
      ],
      explain: 'Review: raising `ValueError` makes invalid operations impossible to ignore; returning `False` relies on every caller remembering to check. Validate **before** changing state so a failed withdrawal never leaves the balance half-updated. The `history` list is an audit trail support can use when a customer disputes a transaction. Note the boundary: withdrawing exactly the balance is valid (`>` not `>=`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**PP-303 · Story · High** TransactionService: top spenders\n\nWrite a class `TransactionService`:\n- `add(customer, amount)` stores a transaction\n- `total_for(customer)` returns that customer\'s total (0 if unknown)\n- `top_spenders(n)` returns a list of `(customer, total)` tuples, highest total first; **ties sorted by name A-Z**\n\nTest data: Asha 500 + 700, Ravi 1200, Meera 300.',
      example: { title: 'sort by two keys', code: 'scores = [("Ravi", 80), ("Asha", 90), ("Dev", 80)]\nsorted(scores, key=lambda x: (-x[1], x[0]))\n# [("Asha", 90), ("Dev", 80), ("Ravi", 80)]' },
      starter: 'class TransactionService:\n    # TODO\n    pass\n',
      solution: `class TransactionService:
    def __init__(self):
        self.totals = {}

    def add(self, customer, amount):
        self.totals[customer] = self.totals.get(customer, 0) + amount

    def total_for(self, customer):
        return self.totals.get(customer, 0)

    def top_spenders(self, n):
        ranked = sorted(self.totals.items(), key=lambda kv: (-kv[1], kv[0]))
        return ranked[:n]
`,
      tests: [
        { call: '(lambda s: (s.add("Asha", 500), s.add("Ravi", 1200), s.add("Asha", 700), s.add("Meera", 300), s.total_for("Asha"))[-1])(TransactionService())', expect: 1200 },
        { call: '(lambda s: (s.add("Asha", 500), s.add("Ravi", 1200), s.add("Asha", 700), s.add("Meera", 300), s.top_spenders(2))[-1])(TransactionService())', expect: [['Asha', 1200], ['Ravi', 1200]], msg: 'Asha and Ravi tie at 1200, so Asha comes first (A-Z)' },
        { call: '(lambda s: (s.add("Meera", 300), s.top_spenders(5))[-1])(TransactionService())', expect: [['Meera', 300]], msg: 'n larger than the number of customers returns everyone' },
        { call: 'TransactionService().total_for("Nobody")', expect: 0, msg: 'Unknown customer -> 0' },
      ],
      explain: 'Review: the key `(-total, name)` sorts by total descending and then name ascending, so the report is the **same on every run**. Without a tie-breaker, tests become flaky and merchants see the order change between downloads. Storing running totals in a dict makes `total_for` O(1) instead of scanning every transaction.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**PP-304 · Story · Medium** Validate UPI IDs\n\nWrite `is_valid_upi(upi)` that returns `True` or `False`:\n- Format `handle@provider`\n- handle: 3 to 30 characters, letters, digits, dot, underscore or hyphen, must **start with a letter or digit**\n- provider: 2 to 20 **letters** only (e.g. `okhdfcbank`, `ybl`, `paytm`)\n- Exactly one `@`; leading/trailing spaces are not allowed',
      example: { title: 'a full-match regex', code: 'import re\nPIN = re.compile(r"[1-9][0-9]{5}")\nbool(PIN.fullmatch("411001"))   # True\nbool(PIN.fullmatch("4110011"))  # False' },
      starter: 'import re\n\ndef is_valid_upi(upi):\n    # TODO\n    return "@" in upi\n',
      solution: `import re

UPI = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{2,29}@[A-Za-z]{2,20}")

def is_valid_upi(upi):
    return bool(UPI.fullmatch(upi))
`,
      tests: [
        { call: 'is_valid_upi("asha.patil@okhdfcbank")', expect: true },
        { call: 'is_valid_upi("9876543210@ybl")', expect: true },
        { call: 'is_valid_upi("ra@paytm")', expect: false, msg: 'Handle shorter than 3 characters' },
        { call: 'is_valid_upi(".asha@ybl")', expect: false, msg: 'Handle must start with a letter or digit' },
        { call: 'is_valid_upi("asha@@ybl")', expect: false, msg: 'Two @ signs' },
        { call: 'is_valid_upi("asha@ybl1")', expect: false, msg: 'Provider must be letters only' },
        { call: 'is_valid_upi(" asha@ybl")', expect: false, msg: 'Leading space' },
        { call: 'is_valid_upi("asha_p-01@sbi")', expect: true },
      ],
      explain: 'Review: use `fullmatch` (or anchor with `^...$`); `re.match` only checks the start, so "asha@ybl1" would slip through. Write the test cases **first** (short handle, bad first character, double @, digits in provider, spaces) and then the regex; that is the testing mindset this sprint is about. Compile the pattern once at module level so it is not rebuilt on every call.',
    },
    {
      type: 'multi',
      mins: 3,
      q: '**PP-305 · Task · Medium** Plan the tests for parse_amount\n\nBefore writing tests for `parse_amount(text)` (Sprint 1), which cases are worth adding? (choose all that apply)',
      options: [
        'A normal value with ₹ and commas: "₹1,250.50"',
        'Empty and blank strings',
        'Indian grouping: "1,00,000"',
        'A test that calls the function 1000 times with the same input',
        'Invalid text like "abc" (decide: raise ValueError or return 0)',
        'Testing that Python\'s float() function works',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Review: good tests cover the **normal** case, the **edges** (empty, blank, big Indian numbers) and **invalid** input, and they make the expected behaviour explicit. Repeating the same input adds no information, and testing the standard library is not your job. Each bug found in production should also become a new regression test.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '**PP-306 · Task · Low** Review feedback\n\nIn your Wallet PR the reviewer comments: "Please raise ValueError instead of returning False." You disagree slightly because returning False felt simpler. What should you do?',
      options: [
        'Ignore the comment and merge after another approval',
        'Reply with your reasoning, listen to theirs, and if the team convention is exceptions, change it and push; resolve the thread when done',
        'Argue in the team channel that the reviewer is wrong',
        'Close the PR and start over',
      ],
      answer: 1,
      explain: 'Review: code review is a conversation, not a judgement. It is fine to explain your view politely, but team conventions win and the reviewer is often protecting callers you have not seen. Make the change, push and resolve the thread so the PR status is clear. Taking it to a public channel damages trust.',
    },
  ],
};
