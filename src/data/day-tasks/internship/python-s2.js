export default {
  lesson: 'python-s2',
  minutes: 50,
  intro: 'Sprint 2 at PaisaPath: build the import step that parses CSV exports, validates every row, totals spending by category and reports rejected rows.',
  tasks: [
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**PP-201 · Story · Medium** Parse the bank CSV export\n\nThe bank sends transactions as CSV text. Write `parse_csv(text)`:\n- The first non-empty line is the header\n- Return a list of dicts, one per data row, keys from the header\n- Strip spaces around every header and value\n- Skip blank lines (including a trailing newline)\n- Values stay strings',
      example: { title: 'zip a header with a row', code: 'header = ["name", "city"]\nrow = ["Asha", "Pune"]\ndict(zip(header, row))   # {"name": "Asha", "city": "Pune"}' },
      starter: 'def parse_csv(text):\n    # TODO\n    return []\n',
      solution: `def parse_csv(text):
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        return []
    header = [h.strip() for h in lines[0].split(",")]
    rows = []
    for line in lines[1:]:
        values = [v.strip() for v in line.split(",")]
        rows.append(dict(zip(header, values)))
    return rows
`,
      tests: [
        { call: 'parse_csv("txn_id, amount, category\\nT1, 250, Food\\nT2, 1200 , Travel\\n")', expect: [{ txn_id: 'T1', amount: '250', category: 'Food' }, { txn_id: 'T2', amount: '1200', category: 'Travel' }] },
        { call: 'parse_csv("id,city\\n\\n1,Pune\\n\\n")', expect: [{ id: '1', city: 'Pune' }], msg: 'Blank lines must be skipped' },
        { call: 'parse_csv("id,city\\n")', expect: [], msg: 'Only a header -> empty list' },
        { call: 'parse_csv("")', expect: [], msg: 'Empty text -> empty list' },
      ],
      explain: 'Review: `splitlines()` handles `\\n` and `\\r\\n` (Windows exports from banks). Filter out blank lines first so a trailing newline does not create an empty record. `dict(zip(header, values))` is the idiomatic way to pair columns. In real code you would use the `csv` module to handle quoted commas, but the shape of the output stays the same.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**PP-202 · Story · High** Validate a transaction row\n\nBad rows must be reported, not crash the job. Write `validate_row(row)` that returns a **list of error strings** (empty list = valid), checking in this order:\n- `"missing txn_id"` if `txn_id` is missing or blank\n- `"invalid amount"` if `amount` is not a number or is `<= 0`\n- `"invalid date"` if `date` is not a real date in `YYYY-MM-DD` format\n\nReturn **all** errors, not just the first.',
      example: { title: 'checking a date with datetime', code: 'from datetime import datetime\ntry:\n    datetime.strptime("2024-02-30", "%Y-%m-%d")\nexcept ValueError:\n    print("not a real date")' },
      starter: 'def validate_row(row):\n    errors = []\n    # TODO\n    return errors\n',
      solution: `from datetime import datetime

def validate_row(row):
    errors = []
    if not str(row.get("txn_id", "")).strip():
        errors.append("missing txn_id")
    try:
        if float(row.get("amount", "")) <= 0:
            errors.append("invalid amount")
    except ValueError:
        errors.append("invalid amount")
    try:
        datetime.strptime(row.get("date", ""), "%Y-%m-%d")
    except ValueError:
        errors.append("invalid date")
    return errors
`,
      tests: [
        { call: 'validate_row({"txn_id": "T1", "amount": "250", "date": "2024-05-10"})', expect: [] },
        { call: 'validate_row({"txn_id": " ", "amount": "250", "date": "2024-05-10"})', expect: ['missing txn_id'] },
        { call: 'validate_row({"txn_id": "T3", "amount": "-40", "date": "2024-05-10"})', expect: ['invalid amount'], msg: 'Negative amount is invalid' },
        { call: 'validate_row({"txn_id": "T4", "amount": "abc", "date": "2024-02-30"})', expect: ['invalid amount', 'invalid date'], msg: 'Return ALL errors; 30 Feb is not a real date' },
        { call: 'validate_row({"amount": "0", "date": "10/05/2024"})', expect: ['missing txn_id', 'invalid amount', 'invalid date'], msg: 'Missing key, zero amount and wrong date format' },
      ],
      explain: 'Review: collecting **all** errors means the merchant fixes the file once, not three times. `datetime.strptime` rejects impossible dates like 30 Feb that a regex such as `\\d{4}-\\d{2}-\\d{2}` would accept. Catch `ValueError` specifically; a bare `except:` would also hide typos and real bugs.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**PP-203 · Story · Medium** Spending by category\n\nWrite `total_by_category(rows)` where each row has `category` and `amount` (string). Return a dict `{category: total}` with totals rounded to 2 decimals. Categories are case-insensitive and should be returned in Title Case (`"food"` and `"FOOD"` both count as `"Food"`).',
      example: { title: 'counting with dict.get', code: 'counts = {}\nfor city in ["Pune", "Goa", "Pune"]:\n    counts[city] = counts.get(city, 0) + 1' },
      starter: 'def total_by_category(rows):\n    totals = {}\n    # TODO\n    return totals\n',
      solution: `def total_by_category(rows):
    totals = {}
    for r in rows:
        cat = r["category"].strip().title()
        totals[cat] = totals.get(cat, 0) + float(r["amount"])
    return {k: round(v, 2) for k, v in totals.items()}
`,
      tests: [
        { call: 'total_by_category([{"category": "Food", "amount": "250.50"}, {"category": "travel", "amount": "1200"}, {"category": "FOOD", "amount": "99.25"}])', expect: { Food: 349.75, Travel: 1200 } },
        { call: 'total_by_category([{"category": "Bills", "amount": "0.1"}, {"category": "bills", "amount": "0.2"}])', expect: { Bills: 0.3 }, msg: '0.1 + 0.2 must be rounded to 0.3' },
        { call: 'total_by_category([])', expect: {} },
      ],
      explain: 'Review: normalise the key **before** grouping, otherwise "food" and "FOOD" become two rows in the merchant\'s report. `0.1 + 0.2` is `0.30000000000000004` in floating point, so round at the end (or keep paise as integers). `dict.get(key, 0)` avoids a KeyError on the first item of each category.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**PP-204 · Story · High** Import summary\n\nCombine your helpers. `parse_csv` and `validate_row` are provided. Write `import_summary(text)` that returns:\n```\n{"valid": <count>, "rejected": <count>, "total": <sum of valid amounts, 2 decimals>, "errors": {"<txn_id or row number>": [errors]}}\n```\n- Row numbers start at 1 for the first data row; use the row number as the key when `txn_id` is blank\n- Only valid rows are added to `total`',
      example: { title: 'enumerate from 1', code: 'for n, name in enumerate(["Asha", "Ravi"], start=1):\n    print(n, name)   # 1 Asha, 2 Ravi' },
      starter: `from datetime import datetime

def parse_csv(text):
    lines = [l for l in text.splitlines() if l.strip()]
    if not lines:
        return []
    header = [h.strip() for h in lines[0].split(",")]
    return [dict(zip(header, [v.strip() for v in l.split(",")])) for l in lines[1:]]

def validate_row(row):
    errors = []
    if not row.get("txn_id", "").strip():
        errors.append("missing txn_id")
    try:
        if float(row.get("amount", "")) <= 0:
            errors.append("invalid amount")
    except ValueError:
        errors.append("invalid amount")
    try:
        datetime.strptime(row.get("date", ""), "%Y-%m-%d")
    except ValueError:
        errors.append("invalid date")
    return errors

def import_summary(text):
    # TODO
    return {}
`,
      solution: `from datetime import datetime

def parse_csv(text):
    lines = [l for l in text.splitlines() if l.strip()]
    if not lines:
        return []
    header = [h.strip() for h in lines[0].split(",")]
    return [dict(zip(header, [v.strip() for v in l.split(",")])) for l in lines[1:]]

def validate_row(row):
    errors = []
    if not row.get("txn_id", "").strip():
        errors.append("missing txn_id")
    try:
        if float(row.get("amount", "")) <= 0:
            errors.append("invalid amount")
    except ValueError:
        errors.append("invalid amount")
    try:
        datetime.strptime(row.get("date", ""), "%Y-%m-%d")
    except ValueError:
        errors.append("invalid date")
    return errors

def import_summary(text):
    summary = {"valid": 0, "rejected": 0, "total": 0.0, "errors": {}}
    for n, row in enumerate(parse_csv(text), start=1):
        errs = validate_row(row)
        if errs:
            summary["rejected"] += 1
            key = row.get("txn_id", "").strip() or str(n)
            summary["errors"][key] = errs
        else:
            summary["valid"] += 1
            summary["total"] += float(row["amount"])
    summary["total"] = round(summary["total"], 2)
    return summary
`,
      tests: [
        { call: 'import_summary("txn_id,amount,date\\nT1,250.50,2024-05-01\\nT2,abc,2024-05-02\\n,99,2024-05-03\\nT4,1000,2024-05-04")', expect: { valid: 2, rejected: 2, total: 1250.5, errors: { T2: ['invalid amount'], 3: ['missing txn_id'] } } },
        { call: 'import_summary("txn_id,amount,date\\nT9,10,2024-13-01")', expect: { valid: 0, rejected: 1, total: 0, errors: { T9: ['invalid date'] } }, msg: 'Month 13 is rejected and total stays 0' },
        { call: 'import_summary("txn_id,amount,date\\n")', expect: { valid: 0, rejected: 0, total: 0, errors: {} }, msg: 'Header only -> zero counts' },
      ],
      explain: 'Review: this is the "parse, validate, aggregate" pipeline you will see in every data job. Small functions that each do one thing are easy to test and combine. Keying errors by `txn_id` (or row number when the id itself is missing) gives the merchant something they can actually find in their file. The job never crashes on bad rows; it counts and reports them.',
    },
    {
      type: 'output',
      mins: 3,
      q: '**PP-205 · Bug · Low** Code review question\n\nA reviewer asks: "What does this print?" Type the exact output.',
      code: 'limits = {"food": 5000, "travel": 3000}\nprint(limits.get("bills"))\nprint(limits.get("bills", 0))\nprint(limits.get("food", 0) - 1200)',
      expected: 'None\n0\n3800',
      explain: 'Review: `dict.get(key)` returns `None` for a missing key instead of raising KeyError, and `get(key, default)` returns the default. Using `limits["bills"]` would crash the job. Choose the default deliberately: 0 makes sense for a missing budget, but `None` makes it visible that the data was missing.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '**PP-206 · Task · Low** Pull Request description\n\nYou are raising the PR for PP-204. Which description is most helpful for the reviewer?',
      options: [
        '"Done, please merge"',
        'An empty description; the code explains itself',
        '"PP-204: add import_summary. What: counts valid/rejected rows and totals valid amounts. Why: merchants need to see rejected rows. How to test: run pytest tests/test_import.py; sample file in tests/data. Note: rows without txn_id are keyed by row number."',
        'A copy of the entire Slack conversation about the ticket',
      ],
      answer: 2,
      explain: 'Review: a good PR description says **what** changed, **why**, **how to test** and any decisions the reviewer should know about, with the ticket key for traceability. It cuts review time in half and becomes documentation for whoever reads the history later.',
    },
  ],
};
