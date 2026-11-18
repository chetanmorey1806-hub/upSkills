// Final projects: starter files, automated tests (run in the browser with Pyodide) and reference solutions.
// Generated from verified Python sources: every solution passes its tests.
export const TEST_RUNNER = "# UpSkillr project test runner: imports _tests.py and runs every test_* function in order.\nimport sys, io, json, contextlib, traceback, importlib\n\ndef _run():\n    for m in list(sys.modules):\n        if m == \"_tests\":\n            sys.modules.pop(m, None)\n    try:\n        tests = importlib.import_module(\"_tests\")\n    except Exception as e:\n        print(\"##TEST \" + json.dumps({\"name\": \"import\", \"doc\": \"Your files load without errors\", \"status\": \"ERROR\", \"msg\": f\"{type(e).__name__}: {e}\"}))\n        return\n    fns = [getattr(tests, n) for n in dir(tests) if n.startswith(\"test_\") and callable(getattr(tests, n))]\n    fns.sort(key=lambda f: f.__code__.co_firstlineno)\n    for fn in fns:\n        doc = (fn.__doc__ or fn.__name__).strip()\n        buf = io.StringIO()\n        try:\n            with contextlib.redirect_stdout(buf):\n                fn()\n            res = {\"status\": \"PASS\", \"msg\": \"\"}\n        except NotImplementedError:\n            res = {\"status\": \"TODO\", \"msg\": \"Not implemented yet\"}\n        except AssertionError as e:\n            res = {\"status\": \"FAIL\", \"msg\": str(e) or \"Assertion failed\"}\n        except Exception as e:\n            tb = traceback.extract_tb(e.__traceback__)\n            where = next((f\"{fr.filename.split('/')[-1]}:{fr.lineno}\" for fr in reversed(tb) if not fr.filename.endswith(\"_tests.py\")), \"\")\n            res = {\"status\": \"ERROR\", \"msg\": f\"{type(e).__name__}: {e}\" + (f\" (at {where})\" if where else \"\")}\n        print(\"##TEST \" + json.dumps({\"name\": fn.__name__, \"doc\": doc, **res}))\n\n_run()\n";

export const projects = [
 {
  "id": "student-management",
  "icon": "🎓",
  "level": "Beginner",
  "hours": "6-8 hours",
  "title": "Student Management System",
  "summary": "A menu-driven console app to add students, calculate averages and grades, find the topper, search and save records to JSON.",
  "skills": [
   "Functions",
   "Lists & dictionaries",
   "String methods",
   "Exceptions",
   "JSON files"
  ],
  "related": [
   "python/day-14-dictionaries",
   "python/day-16-functions",
   "python/day-23-exception-handling",
   "python/day-26-csv-json"
  ],
  "story": "Your college wants a simple tool for class teachers. Teachers add students with their marks, see averages and grades, find the topper and save everything to a file so nothing is lost when the program closes.",
  "requirements": [
   "Add a student with roll number, name and marks (validate everything)",
   "Calculate average (2 decimals) and grade A/B/C/D/F",
   "Find the topper and search students by name",
   "Update marks and delete students",
   "Print a formatted report sorted by roll number",
   "Save to and load from a JSON file"
  ],
  "milestones": [
   {
    "title": "Data & validation",
    "tasks": [
     "Write add_student with all validation rules",
     "Write average and grade",
     "Run tests: the first 4 should pass"
    ]
   },
   {
    "title": "Queries",
    "tasks": [
     "Write get_topper and search",
     "Write update_marks and delete_student"
    ]
   },
   {
    "title": "Reports & storage",
    "tasks": [
     "Write report with exact formatting",
     "Write save and load using the json module",
     "All tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Use the menu in main.py (Run with Input) and try wrong inputs",
     "Add one feature of your own (e.g. class statistics)"
    ]
   }
  ],
  "hints": [
   "Use name.strip().title() to clean names.",
   "max(db.values(), key=..., default=None) finds the topper in one line.",
   "json turns int keys into strings: convert them back with {int(k): v for k, v in data.items()}."
  ],
  "extensions": [
   "Subject-wise marks with a dict instead of a list",
   "Export the report to CSV",
   "Rank students (1st, 2nd, 3rd) with ties"
  ],
  "stdin": "1\n1\nasha patil\n88 92 79\n1\n2\nravi kumar\n65 70 58\n2\n3\n0\n",
  "files": {
   "main.py": "# Student Management System - menu-driven console app.\n# The logic lives in students.py. Click \"Run tests\" to check it, \"Run\" to use the menu.\nfrom students import add_student, average, grade, get_topper, search, delete_student, report, save, load\n\ndb = {}\n\n\ndef menu():\n    while True:\n        print(\"\\n1.Add  2.Report  3.Topper  4.Search  5.Delete  6.Save  0.Exit\")\n        choice = input(\"Choice: \").strip()\n        try:\n            if choice == \"1\":\n                roll = int(input(\"Roll: \"))\n                name = input(\"Name: \")\n                marks = [int(m) for m in input(\"Marks (space separated): \").split()]\n                s = add_student(db, roll, name, marks)\n                print(\"Added\", s[\"name\"])\n            elif choice == \"2\":\n                print(\"\\n\".join(report(db)) or \"No students yet\")\n            elif choice == \"3\":\n                t = get_topper(db)\n                print(\"Topper:\", t[\"name\"] if t else \"-\")\n            elif choice == \"4\":\n                for s in search(db, input(\"Name contains: \")):\n                    print(s[\"roll\"], s[\"name\"])\n            elif choice == \"5\":\n                print(\"Deleted\", delete_student(db, int(input(\"Roll: \")))[\"name\"])\n            elif choice == \"6\":\n                save(db, \"students.json\")\n                print(\"Saved to students.json\")\n            elif choice == \"0\":\n                print(\"Bye!\")\n                break\n            else:\n                print(\"Invalid choice\")\n        except (ValueError, KeyError) as e:\n            print(\"Error:\", e)\n        except NotImplementedError:\n            print(\"This feature is not implemented yet - complete students.py\")\n\n\nif __name__ == \"__main__\":\n    menu()\n",
   "students.py": "\"\"\"Student Management System - core logic.\n\nData model: a dict that maps roll number -> student dict\n    {\"roll\": 1, \"name\": \"Asha Patil\", \"marks\": [88, 92, 79]}\nComplete every function marked TODO. Run the tests to check your work.\n\"\"\"\nimport json\n\n\ndef add_student(db, roll, name, marks):\n    \"\"\"Add a student to db and return the new student dict.\n\n    Rules:\n    - roll must be a positive int and must not already exist -> else raise ValueError\n    - name is stripped and converted to Title Case (\"  asha patil \" -> \"Asha Patil\")\n    - every mark must be between 0 and 100 -> else raise ValueError\n    \"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef average(marks):\n    \"\"\"Return the average of marks rounded to 2 decimals. Empty list -> 0.0\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef grade(avg):\n    \"\"\"Return grade for an average: >=85 'A', >=70 'B', >=55 'C', >=40 'D', else 'F'.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef get_topper(db):\n    \"\"\"Return the student dict with the highest average (None if db is empty).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef search(db, text):\n    \"\"\"Return a list of students whose name contains text (case-insensitive), sorted by roll.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef update_marks(db, roll, marks):\n    \"\"\"Replace marks of an existing student. Unknown roll -> KeyError. Invalid mark -> ValueError.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef delete_student(db, roll):\n    \"\"\"Remove the student and return it. Unknown roll -> KeyError.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef report(db):\n    \"\"\"Return a list of lines, one per student sorted by roll, formatted exactly like:\n    '1 | Asha Patil | avg 86.33 | grade A'\n    \"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef save(db, path):\n    \"\"\"Save db to a JSON file (keys become strings in JSON - that is fine).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef load(path):\n    \"\"\"Load db from a JSON file and return it with int roll numbers as keys.\"\"\"\n    raise NotImplementedError  # TODO\n"
  },
  "solution": {
   "students.py": "import json\n\n\ndef _check_marks(marks):\n    for m in marks:\n        if not (0 <= m <= 100):\n            raise ValueError(f\"Invalid mark {m}\")\n\n\ndef add_student(db, roll, name, marks):\n    if not isinstance(roll, int) or roll <= 0:\n        raise ValueError(\"Roll must be a positive integer\")\n    if roll in db:\n        raise ValueError(f\"Roll {roll} already exists\")\n    _check_marks(marks)\n    s = {\"roll\": roll, \"name\": name.strip().title(), \"marks\": list(marks)}\n    db[roll] = s\n    return s\n\n\ndef average(marks):\n    return round(sum(marks) / len(marks), 2) if marks else 0.0\n\n\ndef grade(avg):\n    for limit, g in ((85, \"A\"), (70, \"B\"), (55, \"C\"), (40, \"D\")):\n        if avg >= limit:\n            return g\n    return \"F\"\n\n\ndef get_topper(db):\n    return max(db.values(), key=lambda s: average(s[\"marks\"]), default=None)\n\n\ndef search(db, text):\n    t = text.lower()\n    return sorted((s for s in db.values() if t in s[\"name\"].lower()), key=lambda s: s[\"roll\"])\n\n\ndef update_marks(db, roll, marks):\n    if roll not in db:\n        raise KeyError(roll)\n    _check_marks(marks)\n    db[roll][\"marks\"] = list(marks)\n\n\ndef delete_student(db, roll):\n    if roll not in db:\n        raise KeyError(roll)\n    return db.pop(roll)\n\n\ndef report(db):\n    lines = []\n    for roll in sorted(db):\n        s = db[roll]\n        avg = average(s[\"marks\"])\n        lines.append(f\"{roll} | {s['name']} | avg {avg:.2f} | grade {grade(avg)}\")\n    return lines\n\n\ndef save(db, path):\n    with open(path, \"w\") as f:\n        json.dump(db, f)\n\n\ndef load(path):\n    with open(path) as f:\n        data = json.load(f)\n    return {int(k): v for k, v in data.items()}\n"
  },
  "tests": "from students import add_student, average, grade, get_topper, search, update_marks, delete_student, report, save, load\n\n\ndef sample():\n    db = {}\n    add_student(db, 1, \"asha patil\", [88, 92, 79])\n    add_student(db, 2, \"Ravi Kumar\", [65, 70, 58])\n    add_student(db, 3, \"neha shah\", [95, 90, 98])\n    return db\n\n\ndef test_add_student():\n    \"\"\"add_student stores the student with a Title Case name\"\"\"\n    db = {}\n    s = add_student(db, 7, \"  asha patil \", [80, 90])\n    assert s == {\"roll\": 7, \"name\": \"Asha Patil\", \"marks\": [80, 90]}, f\"got {s}\"\n    assert db[7] is s or db[7] == s, \"student must be stored in db under its roll\"\n\n\ndef test_add_duplicate_and_invalid():\n    \"\"\"add_student rejects duplicate rolls, bad rolls and marks outside 0-100\"\"\"\n    db = sample()\n    for bad in [(1, \"X\", [50]), (0, \"X\", [50]), (9, \"X\", [101]), (9, \"X\", [-1])]:\n        try:\n            add_student(db, *bad)\n        except ValueError:\n            continue\n        raise AssertionError(f\"expected ValueError for {bad}\")\n\n\ndef test_average():\n    \"\"\"average() rounds to 2 decimals and handles an empty list\"\"\"\n    assert average([88, 92, 79]) == 86.33, average([88, 92, 79])\n    assert average([]) == 0.0\n\n\ndef test_grade():\n    \"\"\"grade() uses 85/70/55/40 boundaries\"\"\"\n    cases = {90: \"A\", 85: \"A\", 84.99: \"B\", 70: \"B\", 60: \"C\", 55: \"C\", 45: \"D\", 40: \"D\", 39.9: \"F\"}\n    for avg, g in cases.items():\n        assert grade(avg) == g, f\"grade({avg}) should be {g}, got {grade(avg)}\"\n\n\ndef test_topper():\n    \"\"\"get_topper returns the student with the best average (None when empty)\"\"\"\n    assert get_topper(sample())[\"name\"] == \"Neha Shah\"\n    assert get_topper({}) is None\n\n\ndef test_search():\n    \"\"\"search is case-insensitive and sorted by roll\"\"\"\n    names = [s[\"name\"] for s in search(sample(), \"SHA\")]\n    assert names == [\"Asha Patil\", \"Neha Shah\"], names\n\n\ndef test_update_and_delete():\n    \"\"\"update_marks and delete_student work and raise KeyError for unknown rolls\"\"\"\n    db = sample()\n    update_marks(db, 2, [100, 100])\n    assert db[2][\"marks\"] == [100, 100]\n    removed = delete_student(db, 1)\n    assert removed[\"name\"] == \"Asha Patil\" and 1 not in db\n    for fn, args in [(delete_student, (db, 42)), (update_marks, (db, 42, [50]))]:\n        try:\n            fn(*args)\n        except KeyError:\n            continue\n        raise AssertionError(f\"{fn.__name__} should raise KeyError for unknown roll\")\n\n\ndef test_report():\n    \"\"\"report() returns formatted lines sorted by roll\"\"\"\n    lines = report(sample())\n    assert lines[0] == \"1 | Asha Patil | avg 86.33 | grade A\", lines[0]\n    assert lines[1] == \"2 | Ravi Kumar | avg 64.33 | grade C\", lines[1]\n    assert len(lines) == 3\n\n\ndef test_save_and_load():\n    \"\"\"save() then load() gives back the same data with int keys\"\"\"\n    db = sample()\n    save(db, \"test_students.json\")\n    again = load(\"test_students.json\")\n    assert again == db, again\n    assert all(isinstance(k, int) for k in again)\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 },
 {
  "id": "bank-system",
  "icon": "🏦",
  "level": "Beginner",
  "hours": "8-10 hours",
  "title": "Bank Account System (OOP)",
  "summary": "Model a bank with Account, SavingsAccount and Bank classes: deposits, withdrawals, minimum balance, interest, statements and safe transfers.",
  "skills": [
   "Classes & objects",
   "Inheritance & super()",
   "@property",
   "Custom exceptions",
   "Encapsulation"
  ],
  "related": [
   "python/day-27-classes-objects",
   "python/day-29-encapsulation-property",
   "python/day-30-inheritance",
   "python/day-24-raise-custom-exceptions-assert"
  ],
  "story": "A small cooperative bank needs the core of its banking software. Every rupee must be tracked, savings accounts must keep a minimum balance and a failed transfer must never lose money.",
  "requirements": [
   "Account with read-only balance, deposit, withdraw and a transaction history",
   "Custom InsufficientFunds exception",
   "SavingsAccount that keeps a minimum balance of Rs. 1000 and adds yearly interest",
   "Bank that opens numbered accounts (1001, 1002 ...), finds them and transfers money safely",
   "Formatted __str__ and statement()"
  ],
  "milestones": [
   {
    "title": "Account class",
    "tasks": [
     "Constructor, balance property, deposit and withdraw",
     "statement() and __str__"
    ]
   },
   {
    "title": "Inheritance",
    "tasks": [
     "SavingsAccount reusing super()",
     "add_interest()"
    ]
   },
   {
    "title": "Bank",
    "tasks": [
     "open_account and find",
     "transfer that never loses money",
     "total_deposits; all tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Try the menu in main.py",
     "Explain encapsulation and inheritance using your code (interview practice)"
    ]
   }
  ],
  "hints": [
   "A @property with no setter makes balance read-only.",
   "In SavingsAccount.withdraw check the minimum balance first, then call super().withdraw(amount).",
   "In transfer, withdraw first: if it raises, the deposit never happens."
  ],
  "extensions": [
   "PIN check before withdrawals",
   "Daily withdrawal limit",
   "Save and load accounts with JSON or pickle"
  ],
  "stdin": "1\nAsha\n5000\nsavings\n1\nRavi\n1000\ncurrent\n4\n1001\n1002\n2500\n6\n0\n",
  "files": {
   "main.py": "# Bank Account System - console demo. The logic lives in bank.py.\nfrom bank import Bank, InsufficientFunds\n\nbank = Bank(\"UpSkillr Bank\")\n\n\ndef menu():\n    while True:\n        print(\"\\n1.Open  2.Deposit  3.Withdraw  4.Transfer  5.Statement  6.All accounts  0.Exit\")\n        c = input(\"Choice: \").strip()\n        try:\n            if c == \"1\":\n                acc = bank.open_account(input(\"Owner: \"), float(input(\"Opening balance: \")), input(\"Type (current/savings): \").strip() or \"current\")\n                print(\"Opened\", acc)\n            elif c == \"2\":\n                acc = bank.find(int(input(\"Account no: \")))\n                print(\"Balance:\", acc.deposit(float(input(\"Amount: \"))))\n            elif c == \"3\":\n                acc = bank.find(int(input(\"Account no: \")))\n                print(\"Balance:\", acc.withdraw(float(input(\"Amount: \"))))\n            elif c == \"4\":\n                bank.transfer(int(input(\"From: \")), int(input(\"To: \")), float(input(\"Amount: \")))\n                print(\"Transfer done\")\n            elif c == \"5\":\n                print(\"\\n\".join(bank.find(int(input(\"Account no: \"))).statement()))\n            elif c == \"6\":\n                for acc in bank.accounts.values():\n                    print(acc)\n            elif c == \"0\":\n                break\n        except (ValueError, KeyError, InsufficientFunds) as e:\n            print(\"Error:\", type(e).__name__, e)\n        except NotImplementedError:\n            print(\"Not implemented yet - complete bank.py\")\n\n\nif __name__ == \"__main__\":\n    menu()\n",
   "bank.py": "\"\"\"Bank Account System - OOP project.\n\nBuild three classes: Account, SavingsAccount (inherits Account) and Bank.\nComplete every method marked TODO, then click \"Run tests\".\n\"\"\"\n\n\nclass InsufficientFunds(Exception):\n    \"\"\"Raised when a withdrawal or transfer is bigger than the balance.\"\"\"\n\n\nclass Account:\n    def __init__(self, acc_no, owner, balance=0):\n        \"\"\"Store acc_no, owner and balance. A negative opening balance -> ValueError.\n        Keep a list self.transactions of tuples like (\"deposit\", 500) / (\"withdraw\", 200).\n        \"\"\"\n        raise NotImplementedError  # TODO\n\n    @property\n    def balance(self):\n        \"\"\"Read-only balance (store it in self._balance).\"\"\"\n        raise NotImplementedError  # TODO\n\n    def deposit(self, amount):\n        \"\"\"Add money. amount must be > 0 else ValueError. Record (\"deposit\", amount). Return new balance.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def withdraw(self, amount):\n        \"\"\"Remove money. amount must be > 0 else ValueError.\n        amount > balance -> InsufficientFunds. Record (\"withdraw\", amount). Return new balance.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def statement(self):\n        \"\"\"Return a list of lines like 'deposit: 500' for every transaction, in order.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def __str__(self):\n        \"\"\"Return e.g. 'Account 1001 | Asha | Rs. 1500.00'\"\"\"\n        raise NotImplementedError  # TODO\n\n\nclass SavingsAccount(Account):\n    MIN_BALANCE = 1000\n\n    def __init__(self, acc_no, owner, balance=0, rate=4.0):\n        \"\"\"Call the parent constructor and store the yearly interest rate (percent).\"\"\"\n        raise NotImplementedError  # TODO\n\n    def withdraw(self, amount):\n        \"\"\"Same as Account.withdraw, but the balance may never go below MIN_BALANCE\n        (raise InsufficientFunds). Reuse the parent method with super().\"\"\"\n        raise NotImplementedError  # TODO\n\n    def add_interest(self):\n        \"\"\"Add one year of interest (balance * rate / 100, rounded to 2 decimals) as a deposit.\n        Return the interest added.\"\"\"\n        raise NotImplementedError  # TODO\n\n\nclass Bank:\n    def __init__(self, name):\n        \"\"\"Store the bank name and a dict of accounts. Account numbers start at 1001.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def open_account(self, owner, balance=0, kind=\"current\", rate=4.0):\n        \"\"\"Create an Account (\"current\") or SavingsAccount (\"savings\") with the next number\n        (1001, 1002, ...), store it and return it. Unknown kind -> ValueError.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def find(self, acc_no):\n        \"\"\"Return the account or raise KeyError.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def transfer(self, from_no, to_no, amount):\n        \"\"\"Move money between two accounts. If the withdrawal fails, nothing must change.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def total_deposits(self):\n        \"\"\"Sum of all balances in the bank.\"\"\"\n        raise NotImplementedError  # TODO\n"
  },
  "solution": {
   "bank.py": "class InsufficientFunds(Exception):\n    pass\n\n\nclass Account:\n    def __init__(self, acc_no, owner, balance=0):\n        if balance < 0:\n            raise ValueError(\"Opening balance cannot be negative\")\n        self.acc_no = acc_no\n        self.owner = owner\n        self._balance = balance\n        self.transactions = []\n\n    @property\n    def balance(self):\n        return self._balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Amount must be positive\")\n        self._balance += amount\n        self.transactions.append((\"deposit\", amount))\n        return self._balance\n\n    def withdraw(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Amount must be positive\")\n        if amount > self._balance:\n            raise InsufficientFunds(f\"Balance {self._balance} < {amount}\")\n        self._balance -= amount\n        self.transactions.append((\"withdraw\", amount))\n        return self._balance\n\n    def statement(self):\n        return [f\"{kind}: {amt}\" for kind, amt in self.transactions]\n\n    def __str__(self):\n        return f\"Account {self.acc_no} | {self.owner} | Rs. {self._balance:.2f}\"\n\n\nclass SavingsAccount(Account):\n    MIN_BALANCE = 1000\n\n    def __init__(self, acc_no, owner, balance=0, rate=4.0):\n        super().__init__(acc_no, owner, balance)\n        self.rate = rate\n\n    def withdraw(self, amount):\n        if amount > 0 and self._balance - amount < self.MIN_BALANCE:\n            raise InsufficientFunds(f\"Minimum balance {self.MIN_BALANCE} required\")\n        return super().withdraw(amount)\n\n    def add_interest(self):\n        interest = round(self._balance * self.rate / 100, 2)\n        self.deposit(interest)\n        return interest\n\n\nclass Bank:\n    def __init__(self, name):\n        self.name = name\n        self.accounts = {}\n        self._next = 1001\n\n    def open_account(self, owner, balance=0, kind=\"current\", rate=4.0):\n        if kind == \"current\":\n            acc = Account(self._next, owner, balance)\n        elif kind == \"savings\":\n            acc = SavingsAccount(self._next, owner, balance, rate)\n        else:\n            raise ValueError(f\"Unknown account type {kind}\")\n        self.accounts[acc.acc_no] = acc\n        self._next += 1\n        return acc\n\n    def find(self, acc_no):\n        if acc_no not in self.accounts:\n            raise KeyError(acc_no)\n        return self.accounts[acc_no]\n\n    def transfer(self, from_no, to_no, amount):\n        src, dst = self.find(from_no), self.find(to_no)\n        src.withdraw(amount)\n        dst.deposit(amount)\n\n    def total_deposits(self):\n        return sum(a.balance for a in self.accounts.values())\n"
  },
  "tests": "from bank import Account, SavingsAccount, Bank, InsufficientFunds\n\n\ndef raises(exc, fn, *args):\n    try:\n        fn(*args)\n    except exc:\n        return True\n    except NotImplementedError:\n        raise\n    except Exception as e:\n        raise AssertionError(f\"expected {exc.__name__} but got {type(e).__name__}: {e}\")\n    raise AssertionError(f\"expected {exc.__name__} to be raised\")\n\n\ndef test_account_basics():\n    \"\"\"Account stores owner/balance and deposit/withdraw return the new balance\"\"\"\n    a = Account(1, \"Asha\", 1000)\n    assert a.owner == \"Asha\" and a.balance == 1000\n    assert a.deposit(500) == 1500\n    assert a.withdraw(200) == 1300\n    assert a.balance == 1300\n\n\ndef test_balance_is_read_only():\n    \"\"\"balance is a read-only property\"\"\"\n    a = Account(1, \"Asha\", 100)\n    try:\n        a.balance = 999\n    except AttributeError:\n        return\n    raise AssertionError(\"assigning to balance should raise AttributeError (use @property without a setter)\")\n\n\ndef test_account_validation():\n    \"\"\"negative opening balance, zero/negative amounts and overdraft are rejected\"\"\"\n    raises(ValueError, Account, 1, \"X\", -5)\n    a = Account(1, \"Asha\", 100)\n    raises(ValueError, a.deposit, 0)\n    raises(ValueError, a.withdraw, -10)\n    raises(InsufficientFunds, a.withdraw, 101)\n    assert a.balance == 100, \"failed withdrawals must not change the balance\"\n\n\ndef test_statement_and_str():\n    \"\"\"statement() lists transactions and str() is formatted\"\"\"\n    a = Account(1001, \"Asha\", 1000)\n    a.deposit(500)\n    a.withdraw(200)\n    assert a.statement() == [\"deposit: 500\", \"withdraw: 200\"], a.statement()\n    assert str(a) == \"Account 1001 | Asha | Rs. 1300.00\", str(a)\n\n\ndef test_savings_inherits():\n    \"\"\"SavingsAccount is an Account and keeps the minimum balance\"\"\"\n    s = SavingsAccount(1, \"Ravi\", 5000, rate=5)\n    assert isinstance(s, Account)\n    assert s.withdraw(3000) == 2000\n    raises(InsufficientFunds, s.withdraw, 1500)\n    assert s.balance == 2000\n\n\ndef test_add_interest():\n    \"\"\"add_interest adds one year of interest as a deposit\"\"\"\n    s = SavingsAccount(1, \"Ravi\", 2000, rate=4.5)\n    assert s.add_interest() == 90.0\n    assert s.balance == 2090.0\n    assert s.transactions[-1] == (\"deposit\", 90.0)\n\n\ndef test_bank_open_and_find():\n    \"\"\"Bank numbers accounts from 1001 and finds them\"\"\"\n    b = Bank(\"Test\")\n    a = b.open_account(\"Asha\", 1000)\n    s = b.open_account(\"Ravi\", 5000, \"savings\")\n    assert (a.acc_no, s.acc_no) == (1001, 1002)\n    assert type(a) is Account and type(s) is SavingsAccount\n    assert b.find(1002) is s\n    raises(KeyError, b.find, 9999)\n    raises(ValueError, b.open_account, \"X\", 0, \"crypto\")\n\n\ndef test_transfer_is_safe():\n    \"\"\"transfer moves money and changes nothing when it fails\"\"\"\n    b = Bank(\"Test\")\n    b.open_account(\"Asha\", 1000)\n    b.open_account(\"Ravi\", 500)\n    b.transfer(1001, 1002, 300)\n    assert (b.find(1001).balance, b.find(1002).balance) == (700, 800)\n    raises(InsufficientFunds, b.transfer, 1002, 1001, 5000)\n    assert (b.find(1001).balance, b.find(1002).balance) == (700, 800)\n    assert b.total_deposits() == 1500\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 },
 {
  "id": "library-management",
  "icon": "📚",
  "level": "Intermediate",
  "hours": "8-10 hours",
  "title": "Library Management System",
  "summary": "Issue and return books with copy tracking, member limits and late fines, using dataclasses and clean business rules.",
  "skills": [
   "dataclasses",
   "Business rules",
   "Dictionaries of objects",
   "Custom exceptions",
   "Sorting with key"
  ],
  "related": [
   "python/day-33-dataclasses-enums",
   "python/day-27-classes-objects",
   "python/day-14-dictionaries"
  ],
  "story": "Your college library still uses a register. Build the system that tracks every copy, stops members from taking more than 3 books and calculates late fines automatically.",
  "requirements": [
   "Book dataclass with an available property",
   "Add books (extra copies merge into the same ISBN)",
   "Issue books with 4 rules: unknown ISBN, no copy left, same book twice, max 3 books",
   "Return books and charge Rs. 5 per day after 14 days",
   "Search by title or author, list available books, member report"
  ],
  "milestones": [
   {
    "title": "Models",
    "tasks": [
     "Book.available",
     "add_book with copy merging"
    ]
   },
   {
    "title": "Issue & return",
    "tasks": [
     "issue_book with every rule",
     "return_book with fine calculation"
    ]
   },
   {
    "title": "Reports",
    "tasks": [
     "search, available_books and member_report",
     "All tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Run main.py and read the output",
     "Add one rule of your own (e.g. reserve a book)"
    ]
   }
  ],
  "hints": [
   "field(default_factory=list) gives every Book its own list.",
   "max(0, days - 14) * 5 is the fine.",
   "setdefault(member, []) creates a member's list on first use."
  ],
  "extensions": [
   "Reservations queue with collections.deque",
   "Due-date reminders using datetime",
   "Save the library to SQLite"
  ],
  "files": {
   "main.py": "# Library Management System - demo run. The logic lives in library.py.\nfrom library import Library, LibraryError\n\nlib = Library()\nlib.add_book(\"978-0\", \"Python Crash Course\", \"Eric Matthes\", 2)\nlib.add_book(\"978-1\", \"Clean Code\", \"Robert Martin\")\nlib.add_book(\"978-2\", \"Automate the Boring Stuff\", \"Al Sweigart\", 3)\n\ntry:\n    lib.issue_book(\"978-0\", \"Asha\")\n    lib.issue_book(\"978-1\", \"Asha\")\n    print(\"Available:\", lib.available_books())\n    print(\"Fine:\", lib.return_book(\"978-1\", \"Asha\", days_kept=20))\n    print(\"Asha:\", lib.member_report(\"Asha\"))\n    print(\"Search 'python':\", [b.title for b in lib.search(\"python\")])\n    lib.issue_book(\"978-9\", \"Ravi\")\nexcept LibraryError as e:\n    print(\"LibraryError:\", e)\nexcept NotImplementedError:\n    print(\"Not implemented yet - complete library.py\")\n",
   "library.py": "\"\"\"Library Management System.\n\nRules of the library:\n- A member can hold at most MAX_BOOKS books at a time.\n- Books are free for LOAN_DAYS days; after that the fine is FINE_PER_DAY per extra day.\nComplete every TODO and click \"Run tests\".\n\"\"\"\nfrom dataclasses import dataclass, field\n\nMAX_BOOKS = 3\nLOAN_DAYS = 14\nFINE_PER_DAY = 5\n\n\nclass LibraryError(Exception):\n    \"\"\"Raised for any rule violation (no copies, limit reached, book not issued ...).\"\"\"\n\n\n@dataclass\nclass Book:\n    isbn: str\n    title: str\n    author: str\n    copies: int = 1\n    issued_to: list = field(default_factory=list)   # member names holding a copy\n\n    @property\n    def available(self):\n        \"\"\"Number of copies on the shelf (copies - issued).\"\"\"\n        raise NotImplementedError  # TODO\n\n\nclass Library:\n    def __init__(self):\n        self.books = {}        # isbn -> Book\n        self.members = {}      # member name -> list of isbns they hold\n        self.fines = {}        # member name -> total fine collected\n\n    def add_book(self, isbn, title, author, copies=1):\n        \"\"\"Add a new Book, or if the isbn exists just increase its copies. Return the Book.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def issue_book(self, isbn, member):\n        \"\"\"Issue one copy. Raise LibraryError if: unknown isbn, no copy available,\n        member already holds MAX_BOOKS books, or member already holds this isbn.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def return_book(self, isbn, member, days_kept):\n        \"\"\"Return a copy and return the fine for it (0 if days_kept <= LOAN_DAYS).\n        Add the fine to self.fines[member]. Book not held by member -> LibraryError.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def search(self, text):\n        \"\"\"Books whose title OR author contains text (case-insensitive), sorted by title.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def available_books(self):\n        \"\"\"List of titles with at least one available copy, sorted.\"\"\"\n        raise NotImplementedError  # TODO\n\n    def member_report(self, member):\n        \"\"\"Return {'books': [titles held, sorted], 'fine': total fine (0 if none)}.\"\"\"\n        raise NotImplementedError  # TODO\n"
  },
  "solution": {
   "library.py": "from dataclasses import dataclass, field\n\nMAX_BOOKS = 3\nLOAN_DAYS = 14\nFINE_PER_DAY = 5\n\n\nclass LibraryError(Exception):\n    pass\n\n\n@dataclass\nclass Book:\n    isbn: str\n    title: str\n    author: str\n    copies: int = 1\n    issued_to: list = field(default_factory=list)\n\n    @property\n    def available(self):\n        return self.copies - len(self.issued_to)\n\n\nclass Library:\n    def __init__(self):\n        self.books = {}\n        self.members = {}\n        self.fines = {}\n\n    def add_book(self, isbn, title, author, copies=1):\n        if isbn in self.books:\n            self.books[isbn].copies += copies\n        else:\n            self.books[isbn] = Book(isbn, title, author, copies)\n        return self.books[isbn]\n\n    def issue_book(self, isbn, member):\n        book = self.books.get(isbn)\n        if book is None:\n            raise LibraryError(f\"No book with ISBN {isbn}\")\n        held = self.members.setdefault(member, [])\n        if isbn in held:\n            raise LibraryError(f\"{member} already has {book.title}\")\n        if len(held) >= MAX_BOOKS:\n            raise LibraryError(f\"{member} already holds {MAX_BOOKS} books\")\n        if book.available <= 0:\n            raise LibraryError(f\"No copies of {book.title} available\")\n        book.issued_to.append(member)\n        held.append(isbn)\n\n    def return_book(self, isbn, member, days_kept):\n        if isbn not in self.members.get(member, []):\n            raise LibraryError(f\"{member} does not hold {isbn}\")\n        self.members[member].remove(isbn)\n        self.books[isbn].issued_to.remove(member)\n        fine = max(0, days_kept - LOAN_DAYS) * FINE_PER_DAY\n        self.fines[member] = self.fines.get(member, 0) + fine\n        return fine\n\n    def search(self, text):\n        t = text.lower()\n        return sorted((b for b in self.books.values() if t in b.title.lower() or t in b.author.lower()), key=lambda b: b.title)\n\n    def available_books(self):\n        return sorted(b.title for b in self.books.values() if b.available > 0)\n\n    def member_report(self, member):\n        return {\"books\": sorted(self.books[i].title for i in self.members.get(member, [])), \"fine\": self.fines.get(member, 0)}\n"
  },
  "tests": "from library import Library, Book, LibraryError, MAX_BOOKS\n\n\ndef lib():\n    l = Library()\n    l.add_book(\"1\", \"Python Crash Course\", \"Eric Matthes\", 2)\n    l.add_book(\"2\", \"Clean Code\", \"Robert Martin\")\n    l.add_book(\"3\", \"Fluent Python\", \"Luciano Ramalho\")\n    l.add_book(\"4\", \"Automate the Boring Stuff\", \"Al Sweigart\")\n    return l\n\n\ndef must_fail(fn, *args):\n    try:\n        fn(*args)\n    except LibraryError:\n        return\n    raise AssertionError(f\"{fn.__name__}{args[:2]} should raise LibraryError\")\n\n\ndef test_book_available():\n    \"\"\"Book.available = copies - issued copies\"\"\"\n    b = Book(\"1\", \"T\", \"A\", copies=3, issued_to=[\"x\"])\n    assert b.available == 2, b.available\n\n\ndef test_add_book_merges_copies():\n    \"\"\"add_book creates books and adds copies for an existing ISBN\"\"\"\n    l = lib()\n    b = l.add_book(\"1\", \"Python Crash Course\", \"Eric Matthes\", 3)\n    assert b.copies == 5 and len(l.books) == 4\n\n\ndef test_issue_book():\n    \"\"\"issue_book reduces availability and records the member\"\"\"\n    l = lib()\n    l.issue_book(\"2\", \"Asha\")\n    assert l.books[\"2\"].available == 0\n    assert l.members[\"Asha\"] == [\"2\"]\n\n\ndef test_issue_rules():\n    \"\"\"issue_book enforces: unknown ISBN, no copies, same book twice, max books\"\"\"\n    l = lib()\n    must_fail(l.issue_book, \"99\", \"Asha\")\n    l.issue_book(\"2\", \"Asha\")\n    must_fail(l.issue_book, \"2\", \"Ravi\")\n    must_fail(l.issue_book, \"2\", \"Asha\")\n    l.issue_book(\"1\", \"Asha\")\n    l.issue_book(\"3\", \"Asha\")\n    assert MAX_BOOKS == 3\n    must_fail(l.issue_book, \"4\", \"Asha\")\n\n\ndef test_return_and_fine():\n    \"\"\"return_book gives 0 fine within 14 days and Rs.5 per extra day\"\"\"\n    l = lib()\n    l.issue_book(\"1\", \"Asha\")\n    l.issue_book(\"2\", \"Asha\")\n    assert l.return_book(\"1\", \"Asha\", 10) == 0\n    assert l.return_book(\"2\", \"Asha\", 20) == 30\n    assert l.fines[\"Asha\"] == 30\n    assert l.books[\"2\"].available == 1\n    must_fail(l.return_book, \"2\", \"Asha\", 1)\n\n\ndef test_search():\n    \"\"\"search matches title or author, case-insensitive, sorted by title\"\"\"\n    l = lib()\n    assert [b.title for b in l.search(\"PYTHON\")] == [\"Fluent Python\", \"Python Crash Course\"]\n    assert [b.title for b in l.search(\"martin\")] == [\"Clean Code\"]\n\n\ndef test_available_and_report():\n    \"\"\"available_books and member_report reflect issued books and fines\"\"\"\n    l = lib()\n    l.issue_book(\"2\", \"Ravi\")\n    l.issue_book(\"3\", \"Ravi\")\n    assert l.available_books() == [\"Automate the Boring Stuff\", \"Python Crash Course\"]\n    l.return_book(\"3\", \"Ravi\", 16)\n    assert l.member_report(\"Ravi\") == {\"books\": [\"Clean Code\"], \"fine\": 10}\n    assert l.member_report(\"Nobody\") == {\"books\": [], \"fine\": 0}\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 },
 {
  "id": "expense-tracker",
  "icon": "💰",
  "level": "Intermediate",
  "hours": "8-10 hours",
  "title": "Personal Expense Tracker (CSV)",
  "summary": "Record expenses, validate input with datetime, build category and monthly reports, raise budget alerts and store data in CSV files.",
  "skills": [
   "csv module",
   "datetime",
   "Validation",
   "Aggregation with dicts",
   "String formatting"
  ],
  "related": [
   "python/day-26-csv-json",
   "python/day-21-standard-library",
   "python/day-25-file-handling"
  ],
  "story": "Students and young professionals want to know where their money goes. Build a tracker that validates every entry, shows monthly summaries, warns when a budget is crossed and keeps data in a CSV file that opens in Excel.",
  "requirements": [
   "Validate date (YYYY-MM-DD), category and amount",
   "Total and totals by category",
   "Monthly summary with the top category",
   "Budget alerts with exact formatting",
   "Save to CSV and load back, skipping bad rows"
  ],
  "milestones": [
   {
    "title": "Validation",
    "tasks": [
     "make_expense with all rules",
     "total and total_by_category"
    ]
   },
   {
    "title": "Reports",
    "tasks": [
     "monthly_summary",
     "budget_alerts"
    ]
   },
   {
    "title": "Storage",
    "tasks": [
     "save_csv with DictWriter",
     "load_csv that skips bad rows; all tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Open the CSV from main.py output in Excel (download your files)",
     "Add a feature: weekly report or search by note"
    ]
   }
  ],
  "hints": [
   "datetime.strptime(date, '%Y-%m-%d') raises ValueError for bad dates.",
   "f'{value:.2f}' formats money with 2 decimals.",
   "Wrap make_expense in try/except inside load_csv and count failures."
  ],
  "extensions": [
   "Charts with matplotlib (in VS Code)",
   "Recurring monthly expenses",
   "A Streamlit dashboard"
  ],
  "files": {
   "main.py": "# Expense Tracker - demo. The logic lives in expenses.py.\nfrom expenses import make_expense, total, total_by_category, monthly_summary, budget_alerts, save_csv, load_csv\n\ntry:\n    data = [\n        make_expense(\"2026-01-03\", \"Food\", 250, \"lunch\"),\n        make_expense(\"2026-01-05\", \"travel\", 120, \"metro\"),\n        make_expense(\"2026-01-09\", \"food\", 980, \"groceries\"),\n        make_expense(\"2026-02-01\", \"rent\", 9000, \"february rent\"),\n    ]\n    print(\"Total spent:\", total(data))\n    print(\"By category:\", total_by_category(data))\n    print(\"January:\", monthly_summary(data, \"2026-01\"))\n    print(\"Alerts:\", budget_alerts(data, {\"food\": 1000, \"travel\": 500}))\n    save_csv(data, \"expenses.csv\")\n    loaded, skipped = load_csv(\"expenses.csv\")\n    print(f\"Reloaded {len(loaded)} rows, skipped {skipped}\")\nexcept NotImplementedError:\n    print(\"Not implemented yet - complete expenses.py\")\n",
   "expenses.py": "\"\"\"Personal Expense Tracker with CSV storage and reports.\n\nAn expense is a dict: {\"date\": \"2026-01-05\", \"category\": \"food\", \"amount\": 250.0, \"note\": \"lunch\"}\nComplete every TODO and click \"Run tests\".\n\"\"\"\nimport csv\nfrom datetime import datetime\n\nFIELDS = [\"date\", \"category\", \"amount\", \"note\"]\n\n\ndef make_expense(date, category, amount, note=\"\"):\n    \"\"\"Validate and return an expense dict.\n    - date must be YYYY-MM-DD (use datetime.strptime) -> else ValueError\n    - category is stripped and lower-cased, must not be empty -> else ValueError\n    - amount is converted to float and must be > 0 -> else ValueError\n    \"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef total(expenses):\n    \"\"\"Sum of all amounts, rounded to 2 decimals.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef total_by_category(expenses):\n    \"\"\"Return {category: total} with totals rounded to 2 decimals.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef monthly_summary(expenses, month):\n    \"\"\"month like '2026-01'. Return {\"count\": n, \"total\": t, \"top_category\": name or None}.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef budget_alerts(expenses, budgets):\n    \"\"\"budgets = {category: limit}. Return a sorted list of messages for every category whose\n    total is above its limit, exactly like: 'food: spent 1200.00 of 1000.00 (+200.00)'\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef save_csv(expenses, path):\n    \"\"\"Write expenses to a CSV file with a header row (FIELDS order).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef load_csv(path):\n    \"\"\"Read a CSV written by save_csv and return a list of validated expense dicts.\n    Skip (do not crash on) rows that fail validation. Return (expenses, skipped_count).\"\"\"\n    raise NotImplementedError  # TODO\n"
  },
  "solution": {
   "expenses.py": "import csv\nfrom datetime import datetime\n\nFIELDS = [\"date\", \"category\", \"amount\", \"note\"]\n\n\ndef make_expense(date, category, amount, note=\"\"):\n    datetime.strptime(date, \"%Y-%m-%d\")\n    category = category.strip().lower()\n    if not category:\n        raise ValueError(\"Category is required\")\n    amount = float(amount)\n    if amount <= 0:\n        raise ValueError(\"Amount must be positive\")\n    return {\"date\": date, \"category\": category, \"amount\": amount, \"note\": note}\n\n\ndef total(expenses):\n    return round(sum(e[\"amount\"] for e in expenses), 2)\n\n\ndef total_by_category(expenses):\n    out = {}\n    for e in expenses:\n        out[e[\"category\"]] = out.get(e[\"category\"], 0) + e[\"amount\"]\n    return {k: round(v, 2) for k, v in out.items()}\n\n\ndef monthly_summary(expenses, month):\n    items = [e for e in expenses if e[\"date\"].startswith(month + \"-\")]\n    by_cat = total_by_category(items)\n    top = max(by_cat, key=by_cat.get) if by_cat else None\n    return {\"count\": len(items), \"total\": total(items), \"top_category\": top}\n\n\ndef budget_alerts(expenses, budgets):\n    spent = total_by_category(expenses)\n    msgs = []\n    for cat, limit in budgets.items():\n        s = spent.get(cat, 0)\n        if s > limit:\n            msgs.append(f\"{cat}: spent {s:.2f} of {limit:.2f} (+{s - limit:.2f})\")\n    return sorted(msgs)\n\n\ndef save_csv(expenses, path):\n    with open(path, \"w\", newline=\"\") as f:\n        w = csv.DictWriter(f, fieldnames=FIELDS)\n        w.writeheader()\n        w.writerows(expenses)\n\n\ndef load_csv(path):\n    good, skipped = [], 0\n    with open(path, newline=\"\") as f:\n        for row in csv.DictReader(f):\n            try:\n                good.append(make_expense(row[\"date\"], row[\"category\"], row[\"amount\"], row.get(\"note\") or \"\"))\n            except (ValueError, KeyError, TypeError):\n                skipped += 1\n    return good, skipped\n"
  },
  "tests": "from expenses import make_expense, total, total_by_category, monthly_summary, budget_alerts, save_csv, load_csv\n\n\ndef data():\n    return [\n        make_expense(\"2026-01-03\", \" Food \", \"250\", \"lunch\"),\n        make_expense(\"2026-01-05\", \"travel\", 120.5),\n        make_expense(\"2026-01-09\", \"food\", 980),\n        make_expense(\"2026-02-01\", \"rent\", 9000),\n    ]\n\n\ndef test_make_expense():\n    \"\"\"make_expense cleans category and converts amount to float\"\"\"\n    e = make_expense(\"2026-01-03\", \" Food \", \"250\", \"lunch\")\n    assert e == {\"date\": \"2026-01-03\", \"category\": \"food\", \"amount\": 250.0, \"note\": \"lunch\"}, e\n\n\ndef test_make_expense_validation():\n    \"\"\"bad dates, empty categories and non-positive amounts raise ValueError\"\"\"\n    for args in [(\"2026-13-01\", \"food\", 10), (\"05/01/2026\", \"food\", 10), (\"2026-01-01\", \"  \", 10), (\"2026-01-01\", \"food\", 0), (\"2026-01-01\", \"food\", \"abc\")]:\n        try:\n            make_expense(*args)\n        except ValueError:\n            continue\n        raise AssertionError(f\"expected ValueError for {args}\")\n\n\ndef test_totals():\n    \"\"\"total and total_by_category add up amounts\"\"\"\n    d = data()\n    assert total(d) == 10350.5, total(d)\n    assert total_by_category(d) == {\"food\": 1230.0, \"travel\": 120.5, \"rent\": 9000.0}, total_by_category(d)\n\n\ndef test_monthly_summary():\n    \"\"\"monthly_summary counts, totals and finds the top category for one month\"\"\"\n    assert monthly_summary(data(), \"2026-01\") == {\"count\": 3, \"total\": 1350.5, \"top_category\": \"food\"}\n    assert monthly_summary(data(), \"2025-12\") == {\"count\": 0, \"total\": 0, \"top_category\": None}\n\n\ndef test_budget_alerts():\n    \"\"\"budget_alerts reports only categories over budget, formatted\"\"\"\n    msgs = budget_alerts(data(), {\"food\": 1000, \"travel\": 500, \"rent\": 9000})\n    assert msgs == [\"food: spent 1230.00 of 1000.00 (+230.00)\"], msgs\n\n\ndef test_csv_round_trip():\n    \"\"\"save_csv + load_csv returns the same expenses\"\"\"\n    save_csv(data(), \"t_exp.csv\")\n    loaded, skipped = load_csv(\"t_exp.csv\")\n    assert skipped == 0 and loaded == data(), loaded\n\n\ndef test_load_skips_bad_rows():\n    \"\"\"load_csv skips invalid rows instead of crashing\"\"\"\n    with open(\"t_bad.csv\", \"w\") as f:\n        f.write(\"date,category,amount,note\\n2026-01-01,food,100,ok\\nnot-a-date,food,50,x\\n2026-01-02,,10,x\\n2026-01-03,books,-5,x\\n2026-01-04,books,450,novel\\n\")\n    loaded, skipped = load_csv(\"t_bad.csv\")\n    assert skipped == 3, f\"skipped={skipped}\"\n    assert [e[\"amount\"] for e in loaded] == [100.0, 450.0]\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 },
 {
  "id": "inventory-billing",
  "icon": "🧾",
  "level": "Advanced",
  "hours": "10-12 hours",
  "title": "Inventory & Billing System (SQLite)",
  "summary": "A shop billing backend on SQLite: products, stock, GST bills in one transaction, low-stock alerts and a JOIN + GROUP BY sales report.",
  "skills": [
   "sqlite3",
   "SQL DDL/DML",
   "Transactions",
   "Parameterized queries",
   "JOIN & GROUP BY"
  ],
  "related": [
   "sql/",
   "python/day-36-context-managers",
   "python/day-24-raise-custom-exceptions-assert"
  ],
  "story": "A stationery shop owner wants billing software. Stock must never go negative, every bill includes 18% GST and a failed bill must not change anything. At the end of the day the owner wants a sales report.",
  "requirements": [
   "Create products, bills and bill_items tables with constraints",
   "Add products (reject duplicates and invalid values) and restock",
   "Create a bill in ONE transaction with 18% GST",
   "Low-stock alert",
   "Sales report with a single JOIN + GROUP BY query"
  ],
  "milestones": [
   {
    "title": "Database",
    "tasks": [
     "init_db with constraints",
     "add_product and restock"
    ]
   },
   {
    "title": "Billing",
    "tasks": [
     "create_bill totals and stock update",
     "Make it atomic: a failing bill saves nothing"
    ]
   },
   {
    "title": "Reports",
    "tasks": [
     "low_stock",
     "sales_report with JOIN + GROUP BY; all tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Explain transactions and SQL injection using your code",
     "Add a feature: discounts or returns"
    ]
   }
  ],
  "hints": [
   "`with conn:` commits on success and rolls back on any exception.",
   "Always use ? placeholders: conn.execute('... WHERE id = ?', (pid,)).",
   "cur.lastrowid gives the id of the inserted row."
  ],
  "extensions": [
   "Customer table and customer-wise history",
   "Print a formatted invoice",
   "Move to MySQL with SQLAlchemy"
  ],
  "files": {
   "main.py": "# Inventory & Billing - demo. The logic lives in inventory.py.\nfrom inventory import connect, init_db, add_product, restock, create_bill, low_stock, sales_report, StockError\n\ntry:\n    conn = connect()\n    init_db(conn)\n    pen = add_product(conn, \"Pen\", 10, 100)\n    book = add_product(conn, \"Notebook\", 45, 20)\n    bag = add_product(conn, \"School Bag\", 799, 3)\n\n    bill = create_bill(conn, [(pen, 5), (book, 2)])\n    print(\"Bill:\", bill)\n    print(\"Low stock:\", low_stock(conn))\n    try:\n        create_bill(conn, [(bag, 10)])\n    except StockError as e:\n        print(\"StockError:\", e)\n    restock(conn, bag, 7)\n    create_bill(conn, [(bag, 1), (pen, 10)])\n    for row in sales_report(conn):\n        print(row)\nexcept NotImplementedError:\n    print(\"Not implemented yet - complete inventory.py\")\n",
   "inventory.py": "\"\"\"Inventory & Billing System with SQLite (sqlite3 module).\n\nTables (create them in init_db):\n  products(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,\n           price REAL NOT NULL CHECK(price > 0), stock INTEGER NOT NULL CHECK(stock >= 0))\n  bills(id INTEGER PRIMARY KEY AUTOINCREMENT, subtotal REAL, gst REAL, total REAL)\n  bill_items(bill_id INTEGER, product_id INTEGER, qty INTEGER, price REAL)\n\nAlways use ? placeholders (never f-strings) to avoid SQL injection.\nComplete every TODO and click \"Run tests\".\n\"\"\"\nimport sqlite3\n\nGST_RATE = 18  # percent\n\n\nclass StockError(Exception):\n    \"\"\"Not enough stock to complete a bill.\"\"\"\n\n\ndef connect(path=\":memory:\"):\n    conn = sqlite3.connect(path)\n    conn.row_factory = sqlite3.Row\n    return conn\n\n\ndef init_db(conn):\n    \"\"\"Create the three tables (IF NOT EXISTS).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef add_product(conn, name, price, stock):\n    \"\"\"Insert a product and return its new id. Duplicate name -> ValueError\n    (catch sqlite3.IntegrityError). price <= 0 or stock < 0 -> ValueError.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef restock(conn, product_id, qty):\n    \"\"\"Increase stock by qty (> 0). Unknown product -> KeyError. Return the new stock.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef create_bill(conn, items):\n    \"\"\"items = [(product_id, qty), ...]. In ONE transaction:\n    - check every product exists (KeyError) and has enough stock (StockError)\n    - reduce stock, insert the bill and its bill_items\n    - subtotal = sum(price * qty); gst = round(subtotal * GST_RATE / 100, 2); total = subtotal + gst\n    If anything fails, nothing must be saved. Return {\"bill_id\", \"subtotal\", \"gst\", \"total\"}.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef low_stock(conn, threshold=5):\n    \"\"\"Names of products with stock < threshold, sorted by name.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef sales_report(conn):\n    \"\"\"Return a list of (product name, units sold, revenue) for products that were sold,\n    highest revenue first. Use one SQL query with JOIN + GROUP BY.\"\"\"\n    raise NotImplementedError  # TODO\n"
  },
  "solution": {
   "inventory.py": "import sqlite3\n\nGST_RATE = 18\n\n\nclass StockError(Exception):\n    pass\n\n\ndef connect(path=\":memory:\"):\n    conn = sqlite3.connect(path)\n    conn.row_factory = sqlite3.Row\n    return conn\n\n\ndef init_db(conn):\n    conn.executescript(\"\"\"\n    CREATE TABLE IF NOT EXISTS products(\n        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL,\n        price REAL NOT NULL CHECK(price > 0), stock INTEGER NOT NULL CHECK(stock >= 0));\n    CREATE TABLE IF NOT EXISTS bills(id INTEGER PRIMARY KEY AUTOINCREMENT, subtotal REAL, gst REAL, total REAL);\n    CREATE TABLE IF NOT EXISTS bill_items(bill_id INTEGER, product_id INTEGER, qty INTEGER, price REAL);\n    \"\"\")\n\n\ndef add_product(conn, name, price, stock):\n    if price <= 0 or stock < 0:\n        raise ValueError(\"Invalid price or stock\")\n    try:\n        with conn:\n            cur = conn.execute(\"INSERT INTO products(name, price, stock) VALUES (?, ?, ?)\", (name, price, stock))\n    except sqlite3.IntegrityError as e:\n        raise ValueError(f\"Product {name} already exists\") from e\n    return cur.lastrowid\n\n\ndef restock(conn, product_id, qty):\n    if qty <= 0:\n        raise ValueError(\"qty must be positive\")\n    with conn:\n        cur = conn.execute(\"UPDATE products SET stock = stock + ? WHERE id = ?\", (qty, product_id))\n    if cur.rowcount == 0:\n        raise KeyError(product_id)\n    return conn.execute(\"SELECT stock FROM products WHERE id = ?\", (product_id,)).fetchone()[\"stock\"]\n\n\ndef create_bill(conn, items):\n    with conn:\n        subtotal = 0\n        lines = []\n        for pid, qty in items:\n            row = conn.execute(\"SELECT name, price, stock FROM products WHERE id = ?\", (pid,)).fetchone()\n            if row is None:\n                raise KeyError(pid)\n            if qty > row[\"stock\"]:\n                raise StockError(f\"Only {row['stock']} {row['name']} in stock\")\n            subtotal += row[\"price\"] * qty\n            lines.append((pid, qty, row[\"price\"]))\n        gst = round(subtotal * GST_RATE / 100, 2)\n        total = round(subtotal + gst, 2)\n        bill_id = conn.execute(\"INSERT INTO bills(subtotal, gst, total) VALUES (?, ?, ?)\", (subtotal, gst, total)).lastrowid\n        for pid, qty, price in lines:\n            conn.execute(\"UPDATE products SET stock = stock - ? WHERE id = ?\", (qty, pid))\n            conn.execute(\"INSERT INTO bill_items VALUES (?, ?, ?, ?)\", (bill_id, pid, qty, price))\n    return {\"bill_id\": bill_id, \"subtotal\": subtotal, \"gst\": gst, \"total\": total}\n\n\ndef low_stock(conn, threshold=5):\n    return [r[\"name\"] for r in conn.execute(\"SELECT name FROM products WHERE stock < ? ORDER BY name\", (threshold,))]\n\n\ndef sales_report(conn):\n    rows = conn.execute(\"\"\"\n        SELECT p.name, SUM(bi.qty) AS units, SUM(bi.qty * bi.price) AS revenue\n        FROM bill_items bi JOIN products p ON p.id = bi.product_id\n        GROUP BY p.id ORDER BY revenue DESC\"\"\").fetchall()\n    return [(r[\"name\"], r[\"units\"], r[\"revenue\"]) for r in rows]\n"
  },
  "tests": "from inventory import connect, init_db, add_product, restock, create_bill, low_stock, sales_report, StockError\n\n\ndef setup():\n    conn = connect()\n    init_db(conn)\n    ids = {n: add_product(conn, n, p, s) for n, p, s in [(\"Pen\", 10, 100), (\"Notebook\", 45, 20), (\"Bag\", 799, 3)]}\n    return conn, ids\n\n\ndef stock(conn, pid):\n    return conn.execute(\"SELECT stock FROM products WHERE id = ?\", (pid,)).fetchone()[0]\n\n\ndef test_tables_and_products():\n    \"\"\"init_db creates tables and add_product returns ids 1, 2, 3\"\"\"\n    conn, ids = setup()\n    names = {r[0] for r in conn.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")}\n    assert {\"products\", \"bills\", \"bill_items\"} <= names, names\n    assert list(ids.values()) == [1, 2, 3], ids\n\n\ndef test_add_product_validation():\n    \"\"\"duplicate names and bad price/stock raise ValueError\"\"\"\n    conn, _ = setup()\n    for args in [(\"Pen\", 5, 1), (\"Ruler\", 0, 1), (\"Ruler\", 5, -1)]:\n        try:\n            add_product(conn, *args)\n        except ValueError:\n            continue\n        raise AssertionError(f\"expected ValueError for {args}\")\n\n\ndef test_restock():\n    \"\"\"restock adds stock and raises KeyError for unknown products\"\"\"\n    conn, ids = setup()\n    assert restock(conn, ids[\"Bag\"], 7) == 10\n    try:\n        restock(conn, 99, 1)\n    except KeyError:\n        return\n    raise AssertionError(\"restock(99) should raise KeyError\")\n\n\ndef test_create_bill_totals():\n    \"\"\"create_bill computes subtotal, 18% GST and total and reduces stock\"\"\"\n    conn, ids = setup()\n    bill = create_bill(conn, [(ids[\"Pen\"], 5), (ids[\"Notebook\"], 2)])\n    assert bill == {\"bill_id\": 1, \"subtotal\": 140, \"gst\": 25.2, \"total\": 165.2}, bill\n    assert stock(conn, ids[\"Pen\"]) == 95 and stock(conn, ids[\"Notebook\"]) == 18\n\n\ndef test_bill_is_atomic():\n    \"\"\"a failing bill (not enough stock) saves nothing\"\"\"\n    conn, ids = setup()\n    try:\n        create_bill(conn, [(ids[\"Pen\"], 1), (ids[\"Bag\"], 10)])\n    except StockError:\n        pass\n    else:\n        raise AssertionError(\"expected StockError\")\n    assert stock(conn, ids[\"Pen\"]) == 100, \"Pen stock changed although the bill failed\"\n    assert conn.execute(\"SELECT COUNT(*) FROM bills\").fetchone()[0] == 0\n    try:\n        create_bill(conn, [(42, 1)])\n    except KeyError:\n        return\n    raise AssertionError(\"unknown product should raise KeyError\")\n\n\ndef test_low_stock():\n    \"\"\"low_stock lists products under the threshold\"\"\"\n    conn, ids = setup()\n    assert low_stock(conn) == [\"Bag\"]\n    create_bill(conn, [(ids[\"Notebook\"], 17)])\n    assert low_stock(conn) == [\"Bag\", \"Notebook\"]\n\n\ndef test_sales_report():\n    \"\"\"sales_report groups sold units and revenue, highest revenue first\"\"\"\n    conn, ids = setup()\n    create_bill(conn, [(ids[\"Pen\"], 5), (ids[\"Notebook\"], 2)])\n    create_bill(conn, [(ids[\"Pen\"], 10), (ids[\"Bag\"], 1)])\n    assert sales_report(conn) == [(\"Bag\", 1, 799.0), (\"Pen\", 15, 150.0), (\"Notebook\", 2, 90.0)], sales_report(conn)\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 },
 {
  "id": "log-analyzer",
  "icon": "🔍",
  "level": "Advanced",
  "hours": "8-10 hours",
  "title": "Server Log Analyzer (Regex)",
  "summary": "Parse web-server logs with a named-group regex and report status codes, top pages, error rate, brute-force login attempts, slow requests and hourly traffic.",
  "skills": [
   "Regular expressions",
   "collections.Counter",
   "Parsing text",
   "Sorting with keys",
   "Security thinking"
  ],
  "related": [
   "python/day-37-regular-expressions",
   "python/day-21-standard-library"
  ],
  "story": "Your company's website was slow last night and someone may be guessing passwords. You are given the access log. Write the analyzer that the DevOps team will run every morning.",
  "requirements": [
   "One regex with named groups for ip, time, method, path, status, bytes, ms",
   "Skip corrupted lines and count them",
   "Status counts, top pages and error rate",
   "Detect IPs with 3+ failed logins",
   "List slow requests and requests per hour"
  ],
  "milestones": [
   {
    "title": "Parsing",
    "tasks": [
     "Write LINE_RE with named groups",
     "parse_line and parse_log"
    ]
   },
   {
    "title": "Statistics",
    "tasks": [
     "status_counts, top_paths, error_rate"
    ]
   },
   {
    "title": "Security & performance",
    "tasks": [
     "suspicious_ips",
     "slow_requests and requests_per_hour; all tests pass"
    ]
   },
   {
    "title": "Polish",
    "tasks": [
     "Run main.py and read your report",
     "Explain each part of your regex aloud (interview practice)"
    ]
   }
  ],
  "hints": [
   "(?P<ip>...) creates a named group; m.groupdict() returns them all.",
   "\\S+ matches a run of non-space characters.",
   "Counter(...).most_common() or sorted(items, key=lambda kv: (-kv[1], kv[0]))."
  ],
  "extensions": [
   "Read a real log file passed with argparse",
   "Export the report to JSON",
   "Block-list suggestion for suspicious IPs"
  ],
  "files": {
   "main.py": "# Log Analyzer - prints a report for the sample log. The logic lives in logs.py.\nfrom logs import parse_log, status_counts, top_paths, error_rate, suspicious_ips, slow_requests, requests_per_hour\nfrom sample_logs import LOG\n\ntry:\n    records, bad = parse_log(LOG)\n    print(f\"Parsed {len(records)} requests ({bad} bad lines)\")\n    print(\"Status codes :\", status_counts(records))\n    print(\"Top pages    :\", top_paths(records))\n    print(\"Error rate   :\", error_rate(records), \"%\")\n    print(\"Brute force? :\", suspicious_ips(records))\n    print(\"Slow         :\", slow_requests(records))\n    print(\"Per hour     :\", requests_per_hour(records))\nexcept NotImplementedError:\n    print(\"Not implemented yet - complete logs.py\")\n",
   "logs.py": "\"\"\"Server Log Analyzer using regular expressions.\n\nEach valid line looks like:\n192.168.1.10 - - [12/Jan/2026:10:15:32 +0530] \"GET /index.html HTTP/1.1\" 200 5120 34\n ip            date-time                       method path     protocol status bytes ms\nComplete every TODO and click \"Run tests\".\n\"\"\"\nimport re\nfrom collections import Counter\n\n# TODO: write a regex with NAMED groups: ip, time, method, path, status, bytes, ms\nLINE_RE = re.compile(r\"TODO\")\n\n\ndef parse_line(line):\n    \"\"\"Return a dict {ip, time, method, path, status(int), bytes(int), ms(int)} or None if invalid.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef parse_log(text):\n    \"\"\"Parse all lines. Return (records, bad_line_count). Ignore empty lines.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef status_counts(records):\n    \"\"\"Return {status_code: count}.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef top_paths(records, n=3):\n    \"\"\"Return the n most requested paths as [(path, count), ...] (most first; ties by path name).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef error_rate(records):\n    \"\"\"Percentage of records with status >= 400, rounded to 1 decimal (0.0 for no records).\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef suspicious_ips(records, limit=3):\n    \"\"\"IPs with at least `limit` failed logins (POST /login with status 401), sorted.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef slow_requests(records, ms=1000):\n    \"\"\"Records slower than `ms` milliseconds, as 'METHOD path (Xms)' strings, slowest first.\"\"\"\n    raise NotImplementedError  # TODO\n\n\ndef requests_per_hour(records):\n    \"\"\"Return {\"10\": 6, \"11\": 3, ...} - hour (from the time field) -> number of requests.\"\"\"\n    raise NotImplementedError  # TODO\n",
   "sample_logs.py": "# Sample web-server access log (Common Log Format + response time in ms at the end).\nLOG = \"\"\"\\\n192.168.1.10 - - [12/Jan/2026:10:15:32 +0530] \"GET /index.html HTTP/1.1\" 200 5120 34\n192.168.1.11 - - [12/Jan/2026:10:15:40 +0530] \"GET /courses HTTP/1.1\" 200 8450 120\n10.0.0.5 - - [12/Jan/2026:10:16:02 +0530] \"POST /login HTTP/1.1\" 401 210 15\n10.0.0.5 - - [12/Jan/2026:10:16:05 +0530] \"POST /login HTTP/1.1\" 401 210 14\n10.0.0.5 - - [12/Jan/2026:10:16:09 +0530] \"POST /login HTTP/1.1\" 401 210 16\n10.0.0.5 - - [12/Jan/2026:10:16:15 +0530] \"POST /login HTTP/1.1\" 200 340 22\n192.168.1.10 - - [12/Jan/2026:11:02:11 +0530] \"GET /courses HTTP/1.1\" 200 8450 95\n172.16.0.2 - - [12/Jan/2026:11:05:47 +0530] \"GET /admin HTTP/1.1\" 403 180 8\nthis line is corrupted and must be skipped\n192.168.1.12 - - [12/Jan/2026:11:30:00 +0530] \"GET /api/report HTTP/1.1\" 500 95 2300\n192.168.1.11 - - [12/Jan/2026:12:01:30 +0530] \"GET /courses HTTP/1.1\" 200 8450 110\n\"\"\"\n"
  },
  "solution": {
   "logs.py": "import re\nfrom collections import Counter\n\nLINE_RE = re.compile(\n    r'^(?P<ip>\\d{1,3}(?:\\.\\d{1,3}){3}) \\S+ \\S+ \\[(?P<time>[^\\]]+)\\] '\n    r'\"(?P<method>[A-Z]+) (?P<path>\\S+) [^\"]*\" (?P<status>\\d{3}) (?P<bytes>\\d+) (?P<ms>\\d+)$'\n)\n\n\ndef parse_line(line):\n    m = LINE_RE.match(line.strip())\n    if not m:\n        return None\n    d = m.groupdict()\n    for k in (\"status\", \"bytes\", \"ms\"):\n        d[k] = int(d[k])\n    return d\n\n\ndef parse_log(text):\n    records, bad = [], 0\n    for line in text.splitlines():\n        if not line.strip():\n            continue\n        r = parse_line(line)\n        if r is None:\n            bad += 1\n        else:\n            records.append(r)\n    return records, bad\n\n\ndef status_counts(records):\n    return dict(Counter(r[\"status\"] for r in records))\n\n\ndef top_paths(records, n=3):\n    c = Counter(r[\"path\"] for r in records)\n    return sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))[:n]\n\n\ndef error_rate(records):\n    if not records:\n        return 0.0\n    return round(100 * sum(r[\"status\"] >= 400 for r in records) / len(records), 1)\n\n\ndef suspicious_ips(records, limit=3):\n    c = Counter(r[\"ip\"] for r in records if r[\"method\"] == \"POST\" and r[\"path\"] == \"/login\" and r[\"status\"] == 401)\n    return sorted(ip for ip, n in c.items() if n >= limit)\n\n\ndef slow_requests(records, ms=1000):\n    slow = sorted((r for r in records if r[\"ms\"] > ms), key=lambda r: -r[\"ms\"])\n    return [f\"{r['method']} {r['path']} ({r['ms']}ms)\" for r in slow]\n\n\ndef requests_per_hour(records):\n    return dict(Counter(r[\"time\"].split(\":\")[1] for r in records))\n"
  },
  "tests": "from logs import parse_line, parse_log, status_counts, top_paths, error_rate, suspicious_ips, slow_requests, requests_per_hour\nfrom sample_logs import LOG\n\nLINE = '192.168.1.10 - - [12/Jan/2026:10:15:32 +0530] \"GET /index.html HTTP/1.1\" 200 5120 34'\n\n\ndef test_parse_line():\n    \"\"\"parse_line extracts all fields with int status/bytes/ms\"\"\"\n    r = parse_line(LINE)\n    assert r == {\"ip\": \"192.168.1.10\", \"time\": \"12/Jan/2026:10:15:32 +0530\", \"method\": \"GET\", \"path\": \"/index.html\", \"status\": 200, \"bytes\": 5120, \"ms\": 34}, r\n\n\ndef test_parse_line_invalid():\n    \"\"\"parse_line returns None for corrupted lines\"\"\"\n    for bad in [\"this line is corrupted\", \"\", '1.2.3.4 - - [x] \"GET / HTTP/1.1\" abc 1 1']:\n        assert parse_line(bad) is None, f\"should be None: {bad!r}\"\n\n\ndef test_parse_log():\n    \"\"\"parse_log returns 10 records and 1 bad line for the sample\"\"\"\n    records, bad = parse_log(LOG)\n    assert (len(records), bad) == (10, 1), (len(records), bad)\n\n\ndef test_status_and_errors():\n    \"\"\"status_counts and error_rate\"\"\"\n    records, _ = parse_log(LOG)\n    assert status_counts(records) == {200: 5, 401: 3, 403: 1, 500: 1}, status_counts(records)\n    assert error_rate(records) == 50.0\n    assert error_rate([]) == 0.0\n\n\ndef test_top_paths():\n    \"\"\"top_paths returns the most requested paths\"\"\"\n    records, _ = parse_log(LOG)\n    assert top_paths(records) == [(\"/login\", 4), (\"/courses\", 3), (\"/admin\", 1)], top_paths(records)\n\n\ndef test_suspicious_ips():\n    \"\"\"3+ failed logins from one IP is suspicious\"\"\"\n    records, _ = parse_log(LOG)\n    assert suspicious_ips(records) == [\"10.0.0.5\"]\n    assert suspicious_ips(records, limit=4) == []\n\n\ndef test_slow_and_hourly():\n    \"\"\"slow_requests and requests_per_hour\"\"\"\n    records, _ = parse_log(LOG)\n    assert slow_requests(records) == [\"GET /api/report (2300ms)\"]\n    assert slow_requests(records, 100) == [\"GET /api/report (2300ms)\", \"GET /courses (120ms)\", \"GET /courses (110ms)\"]\n    assert requests_per_hour(records) == {\"10\": 6, \"11\": 3, \"12\": 1}, requests_per_hour(records)\n",
  "rubric": [
   [
    "Correctness: automated tests pass",
    50
   ],
   [
    "Milestones completed",
    20
   ],
   [
    "Code quality: clear names, functions, comments, no repetition",
    10
   ],
   [
    "Error handling: bad input never crashes the app",
    10
   ],
   [
    "Presentation: you can explain the design in an interview",
    10
   ]
  ]
 }
];

export const findProject = (id) => projects.find((p) => p.id === id);
