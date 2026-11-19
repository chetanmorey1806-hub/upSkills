export default {
  lesson: 'day-10-project-daily-sales-report-bot',
  minutes: 40,
  intro: 'Build the core of the Daily Sales Report Bot: validate input data, summarise it, write a JSON/CSV report, preview the email in dry-run mode, and answer automation interview questions.',
  tasks: [
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Validate early.** Write `validate(rows)` for a list of dicts with keys `date`, `branch`, `product`, `qty`, `price` (all strings, as read from CSV). Return a tuple `(good, errors)`:\n- `good`: rows that pass, with `qty` and `price` converted to int and float\n- `errors`: list of strings `"row N: <reason>"` (N = 1-based row number) for rows with a **missing branch**, **non-numeric** qty/price, or **qty ≤ 0**. Check in that order and report only the first problem of a row.',
      example: { title: 'collecting errors instead of crashing', code: 'errors = []\nfor i, r in enumerate(rows, start=1):\n    try:\n        amount = float(r["amount"])\n    except ValueError:\n        errors.append(f"row {i}: amount not a number")\n        continue' },
      starter: 'def validate(rows):\n    # TODO\n    pass\n',
      solution: `def validate(rows):
    good, errors = [], []
    for i, r in enumerate(rows, start=1):
        if not (r.get("branch") or "").strip():
            errors.append(f"row {i}: missing branch")
            continue
        try:
            qty = int(r["qty"])
            price = float(r["price"])
        except (ValueError, TypeError):
            errors.append(f"row {i}: qty/price not a number")
            continue
        if qty <= 0:
            errors.append(f"row {i}: qty must be positive")
            continue
        good.append({**r, "qty": qty, "price": price})
    return good, errors
`,
      tests: [
        { call: '(lambda g, e: [len(g), e])(*validate([{"date": "2024-06-01", "branch": "Pune", "product": "Pen", "qty": "10", "price": "12.5"}, {"date": "2024-06-01", "branch": "", "product": "Bag", "qty": "1", "price": "799"}, {"date": "2024-06-01", "branch": "Nagpur", "product": "Lamp", "qty": "two", "price": "450"}, {"date": "2024-06-01", "branch": "Nashik", "product": "Pen", "qty": "0", "price": "10"}]))', expect: [1, ['row 2: missing branch', 'row 3: qty/price not a number', 'row 4: qty must be positive']] },
        { call: '(lambda g: [g[0]["qty"], g[0]["price"]])(validate([{"date": "d", "branch": "Pune", "product": "Pen", "qty": "3", "price": "12.5"}])[0])', expect: [3, 12.5] },
      ],
      explain: 'A report bot must **fail early and loudly**: bad rows are listed with their row numbers (and emailed/alerted) instead of silently producing wrong totals or crashing at 6 AM with a traceback nobody reads. Only clean, typed data goes into the summary step.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Summarise and save.** Write `summarise(good)` that takes validated rows and returns a dict:\n- `"total"`: total revenue (qty × price) rounded to 2\n- `"by_branch"`: `{branch: revenue rounded to 2}`\n- `"top_product"`: product with the highest revenue\n\nThen write `save_report(summary, path)` that writes the dict as pretty JSON (`indent=2`) to `path`.',
      example: { title: 'json.dump', code: 'import json\nwith open("summary.json", "w", encoding="utf-8") as f:\n    json.dump(data, f, indent=2, ensure_ascii=False)' },
      starter: 'import json\n\ndef summarise(good):\n    # TODO\n    pass\n\ndef save_report(summary, path):\n    # TODO\n    pass\n',
      solution: `import json

def summarise(good):
    by_branch, by_product = {}, {}
    for r in good:
        rev = r["qty"] * r["price"]
        by_branch[r["branch"]] = by_branch.get(r["branch"], 0) + rev
        by_product[r["product"]] = by_product.get(r["product"], 0) + rev
    return {"total": round(sum(by_branch.values()), 2),
            "by_branch": {k: round(v, 2) for k, v in by_branch.items()},
            "top_product": max(by_product, key=by_product.get)}

def save_report(summary, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
`,
      tests: [
        { call: 'summarise([{"branch": "Pune", "product": "Pen", "qty": 10, "price": 12.5}, {"branch": "Pune", "product": "Bag", "qty": 1, "price": 799.25}, {"branch": "Nagpur", "product": "Pen", "qty": 41, "price": 12.5}])', expect: { total: 1436.75, by_branch: { Pune: 924.25, Nagpur: 512.5 }, top_product: 'Bag' } },
        { call: '(save_report({"total": 10.5, "by_branch": {"Pune": 10.5}, "top_product": "Pen"}, "summary.json"), __import__("json").load(open("summary.json")))[1]', expect: { total: 10.5, by_branch: { Pune: 10.5 }, top_product: 'Pen' } },
        { call: '(save_report({"a": 1}, "s2.json"), open("s2.json").read())[1]', expect: '{\n  "a": 1\n}', msg: 'write pretty JSON with indent=2' },
      ],
      explain: 'Keeping "summarise" (pure logic) separate from "save" and "send" (side effects) makes the bot easy to test – exactly what you just did. Bag wins on revenue even though Pen sold more units: always state which measure "top" means.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Email preview (dry run).** Write `email_body(summary, report_date)` that returns this exact text (amounts with thousands separators and 2 decimals, branches sorted by revenue high → low):\n\n```\nDaily Sales Report - 2024-06-01\nTotal revenue: Rs 1,424.00\nPune: Rs 924.00\nNagpur: Rs 500.00\nTop product: Bag\n```',
      example: { title: 'formatting money', code: 'f"Rs {1234567.5:,.2f}"   # Rs 1,234,567.50' },
      starter: 'def email_body(summary, report_date):\n    # TODO\n    pass\n',
      solution: 'def email_body(summary, report_date):\n    lines = [f"Daily Sales Report - {report_date}", f"Total revenue: Rs {summary[\'total\']:,.2f}"]\n    for branch, rev in sorted(summary["by_branch"].items(), key=lambda kv: kv[1], reverse=True):\n        lines.append(f"{branch}: Rs {rev:,.2f}")\n    lines.append(f"Top product: {summary[\'top_product\']}")\n    return "\\n".join(lines)\n',
      tests: [
        { call: 'email_body({"total": 1424.0, "by_branch": {"Nagpur": 500.0, "Pune": 924.0}, "top_product": "Bag"}, "2024-06-01")', expect: 'Daily Sales Report - 2024-06-01\nTotal revenue: Rs 1,424.00\nPune: Rs 924.00\nNagpur: Rs 500.00\nTop product: Bag' },
        { call: 'email_body({"total": 0, "by_branch": {}, "top_product": "-"}, "2024-06-02").splitlines()[1]', expect: 'Total revenue: Rs 0.00' },
      ],
      explain: 'In dry-run mode the bot prints/saves this body instead of sending, so you can check the output before the manager sees it. `:,.2f` adds the separators – note Python uses international grouping (1,234,567); Indian lakh grouping (12,34,567) needs a small custom function or the `babel` library.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview: which features make an automation bot **production-ready**? (choose all that apply)',
      options: ['Configuration (paths, recipients) in a config file / environment variables, not hard-coded', 'A --dry-run mode that builds everything but sends nothing', 'Logging to a file plus an alert when the job fails', 'Retries with backoff for network steps like SMTP or APIs', 'Catching every exception with `except: pass` so the job never shows an error'],
      answers: [0, 1, 2, 3],
      explain: '`except: pass` hides failures: the manager silently stops getting reports and nobody knows why. Catch specific exceptions, log them with `log.exception(...)`, alert, and exit with a non-zero code so the scheduler records the failure.',
    },
    {
      type: 'written',
      mins: 4,
      q: 'Interview: **"Describe an automation you built and the impact."** Answer in 3-5 sentences: the manual task before, what your script does (tools/libraries), how it runs, and the time saved or errors avoided (with a number).',
      rules: [
        { any: ['python', 'pandas', 'openpyxl', 'smtplib', 'requests', 'selenium', 'schedule', 'cron', 'task scheduler'], msg: 'Mention the tools / libraries you used' },
        { regex: '\\d', msg: 'Quantify the impact with a number (hours saved, files, errors…)' },
        { any: ['manual', 'manually', 'by hand', 'every day', 'daily', 'every morning', 'each week', 'weekly'], msg: 'Describe the manual task it replaced' },
      ],
      minWords: 40,
      maxWords: 150,
      sample: 'Every morning our sales coordinator manually copied data from 12 branch Excel files into one sheet and emailed it, which took about 90 minutes. I built a Python bot with pandas and openpyxl that validates the files, builds a formatted summary with a chart and emails it with smtplib. It runs at 8 AM through Windows Task Scheduler with logging, retries and a Telegram alert on failure. It now finishes in under 2 minutes, saving roughly 30 hours a month and removing copy-paste errors.',
      explain: 'Strong answers follow **problem → solution → how it runs → measurable impact**. Mentioning reliability features (logging, alerts, dry run) shows you think like an engineer, not just a script writer.',
    },
  ],
};
