export default {
  lesson: 'python-s4',
  minutes: 60,
  intro: 'Sprint 4 at PaisaPath: ship the nightly reconciliation job with deduplication, retries for the flaky bank API, an end-to-end summary and a clean release.',
  tasks: [
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**PP-401 · Story · High** Deduplicate ledger events\n\nThe ledger sometimes stores the same transaction twice (the app retried after a timeout). Write `dedupe(events)`:\n- Each event is `{"txn_id": str, "amount": float, "updated_at": "YYYY-MM-DD HH:MM"}`\n- Keep only **one** event per `txn_id`: the one with the **latest** `updated_at`\n- Return the result sorted by `txn_id`',
      example: { title: 'keep the max per key', code: 'best = {}\nfor s in scores:\n    k = s["student"]\n    if k not in best or s["marks"] > best[k]["marks"]:\n        best[k] = s' },
      starter: 'def dedupe(events):\n    # TODO\n    return events\n',
      solution: `def dedupe(events):
    latest = {}
    for e in events:
        k = e["txn_id"]
        if k not in latest or e["updated_at"] > latest[k]["updated_at"]:
            latest[k] = e
    return sorted(latest.values(), key=lambda e: e["txn_id"])
`,
      tests: [
        { call: '[ (e["txn_id"], e["amount"]) for e in dedupe([{"txn_id": "T2", "amount": 500, "updated_at": "2024-06-01 10:00"}, {"txn_id": "T1", "amount": 100, "updated_at": "2024-06-01 09:00"}, {"txn_id": "T2", "amount": 550, "updated_at": "2024-06-01 10:05"}]) ]', expect: [['T1', 100], ['T2', 550]], msg: 'T2 keeps the later event (550) and the result is sorted by txn_id' },
        { call: '[ e["amount"] for e in dedupe([{"txn_id": "T9", "amount": 70, "updated_at": "2024-06-02 08:00"}, {"txn_id": "T9", "amount": 60, "updated_at": "2024-06-01 23:59"}]) ]', expect: [70], msg: 'An older duplicate that comes later in the list must not win' },
        { call: 'dedupe([])', expect: [] },
      ],
      explain: 'Review: "latest wins" must compare timestamps, not list position; events arrive out of order from retries. ISO-style timestamps ("YYYY-MM-DD HH:MM") compare correctly as strings, which is one more reason to store dates in this format. Sorting the output makes the job deterministic, so two runs on the same data produce the same file.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 12,
      q: '**PP-402 · Story · High** Reconcile bank statement vs ledger\n\nWrite `reconcile(bank, ledger)`; both are lists of `{"txn_id": str, "amount": float}`. Return a dict of **sorted** lists:\n- `"matched"`: ids in both with the same amount (compare in **paise**: `round(amount * 100)`)\n- `"amount_mismatch"`: ids in both with different amounts\n- `"missing_in_ledger"`: ids only in the bank statement\n- `"missing_in_bank"`: ids only in the ledger',
      example: { title: 'set operations on ids', code: 'a = {"T1", "T2", "T3"}\nb = {"T2", "T3", "T4"}\na & b   # {"T2", "T3"}  in both\na - b   # {"T1"}        only in a' },
      starter: 'def reconcile(bank, ledger):\n    # TODO\n    return {"matched": [], "amount_mismatch": [], "missing_in_ledger": [], "missing_in_bank": []}\n',
      solution: `def reconcile(bank, ledger):
    b = {r["txn_id"]: round(r["amount"] * 100) for r in bank}
    l = {r["txn_id"]: round(r["amount"] * 100) for r in ledger}
    both = b.keys() & l.keys()
    return {
        "matched": sorted(t for t in both if b[t] == l[t]),
        "amount_mismatch": sorted(t for t in both if b[t] != l[t]),
        "missing_in_ledger": sorted(b.keys() - l.keys()),
        "missing_in_bank": sorted(l.keys() - b.keys()),
    }
`,
      tests: [
        { call: 'reconcile([{"txn_id": "T1", "amount": 100.0}, {"txn_id": "T2", "amount": 250.5}, {"txn_id": "T3", "amount": 99.0}], [{"txn_id": "T2", "amount": 250.5}, {"txn_id": "T1", "amount": 100.0}, {"txn_id": "T4", "amount": 10.0}])', expect: { matched: ['T1', 'T2'], amount_mismatch: [], missing_in_ledger: ['T3'], missing_in_bank: ['T4'] } },
        { call: 'reconcile([{"txn_id": "T5", "amount": 0.3}], [{"txn_id": "T5", "amount": 0.1 + 0.2}])', expect: { matched: ['T5'], amount_mismatch: [], missing_in_ledger: [], missing_in_bank: [] }, msg: '0.1 + 0.2 must match 0.3 (compare in paise)' },
        { call: 'reconcile([{"txn_id": "T6", "amount": 500.0}], [{"txn_id": "T6", "amount": 505.0}])["amount_mismatch"]', expect: ['T6'], msg: 'Different amounts go to amount_mismatch' },
        { call: 'reconcile([], [])', expect: { matched: [], amount_mismatch: [], missing_in_ledger: [], missing_in_bank: [] } },
      ],
      explain: 'Review: `0.1 + 0.2 == 0.3` is **False** in floating point, so comparing raw floats would flag a correct payment as a mismatch and wake up the finance team at night. Converting to integer paise makes the comparison exact. Dict lookups plus set operations (`&`, `-`) keep the job O(n) even for lakhs of rows, instead of nested loops.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 12,
      q: '**PP-403 · Story · High** Retry decorator for the flaky bank API\n\nThe bank API fails randomly with `ConnectionError`. Write a decorator factory `retry(times)`:\n- Call the wrapped function; if it raises `ConnectionError`, call it again, up to `times` attempts in total\n- Return the result of the first successful call\n- If all attempts fail, **re-raise** the last `ConnectionError`\n- Other exceptions are not retried\n- Use `functools.wraps`\n\nThe QA helpers `make_flaky(fails)` and `outcome(fn)` are in the starter; keep them.',
      example: { title: 'a decorator that logs calls', code: 'import functools\n\ndef log_calls(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        print("calling", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper' },
      starter: `import functools

def make_flaky(fails):
    state = {"calls": 0}
    def fetch_statement():
        state["calls"] += 1
        if state["calls"] <= fails:
            raise ConnectionError("bank API timeout")
        return "statement ok"
    fetch_statement.state = state
    return fetch_statement

def outcome(fn):
    try:
        return fn()
    except Exception as e:
        return type(e).__name__

def retry(times):
    # TODO
    pass
`,
      solution: `import functools

def make_flaky(fails):
    state = {"calls": 0}
    def fetch_statement():
        state["calls"] += 1
        if state["calls"] <= fails:
            raise ConnectionError("bank API timeout")
        return "statement ok"
    fetch_statement.state = state
    return fetch_statement

def outcome(fn):
    try:
        return fn()
    except Exception as e:
        return type(e).__name__

def retry(times):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            last = None
            for _ in range(times):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError as e:
                    last = e
            raise last
        return wrapper
    return decorator
`,
      tests: [
        { call: 'outcome(retry(3)(make_flaky(2)))', expect: 'statement ok', msg: 'Fails twice, succeeds on the 3rd attempt' },
        { call: 'outcome(retry(3)(make_flaky(3)))', expect: 'ConnectionError', msg: 'Fails 3 times with 3 attempts -> re-raise ConnectionError' },
        { call: '(lambda f: (outcome(retry(5)(f)), f.state["calls"])[-1])(make_flaky(1))', expect: 2, msg: 'Stop retrying after the first success (2 calls, not 5)' },
        { call: '(lambda f: (outcome(retry(3)(f)), f.state["calls"])[-1])(make_flaky(10))', expect: 3, msg: 'Never call more than `times` times' },
        { call: 'outcome(retry(3)(lambda: 1 / 0))', expect: 'ZeroDivisionError', msg: 'Other exceptions are not retried and are raised as-is' },
        { call: 'retry(2)(make_flaky(0)).__name__', expect: 'fetch_statement', msg: 'Use functools.wraps to keep the function name' },
      ],
      explain: 'Review: a decorator **factory** has three layers: `retry(times)` returns the decorator, which returns the wrapper. Retry only errors that are worth retrying (network), never logic errors like ZeroDivisionError, and always cap attempts so a dead API cannot hang the nightly job. Re-raising the last error keeps the real failure visible in monitoring. In production you would also wait (exponential backoff) between attempts.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**PP-404 · Story · Medium** Nightly job summary line\n\nThe job posts one line to the finance Slack channel. Write `job_summary(result, total_bank)` where `result` is the dict from `reconcile` and `total_bank` is a float:\n```\nRECON OK | matched=2 | mismatch=0 | missing_ledger=1 | missing_bank=0 | bank_total=Rs 1,23,456.50\n```\n- Status is `RECON OK` when `amount_mismatch` is empty, otherwise `RECON ALERT`\n- `bank_total` uses **Indian** digit grouping and 2 decimals (write a small helper; do not rely on locale)',
      example: { title: 'Indian grouping by hand', code: '# 1234567 -> "12,34,567"\ns = "1234567"\nlast3, rest = s[-3:], s[:-3]\n# group rest in pairs from the right: "12,34"' },
      starter: 'def job_summary(result, total_bank):\n    # TODO\n    return ""\n',
      solution: `def inr(amount):
    whole, paise = f"{amount:.2f}".split(".")
    if len(whole) > 3:
        last3, rest = whole[-3:], whole[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        whole = ",".join(groups) + "," + last3
    return f"Rs {whole}.{paise}"

def job_summary(result, total_bank):
    status = "RECON OK" if not result["amount_mismatch"] else "RECON ALERT"
    return " | ".join([
        status,
        f"matched={len(result['matched'])}",
        f"mismatch={len(result['amount_mismatch'])}",
        f"missing_ledger={len(result['missing_in_ledger'])}",
        f"missing_bank={len(result['missing_in_bank'])}",
        f"bank_total={inr(total_bank)}",
    ])
`,
      tests: [
        { call: 'job_summary({"matched": ["T1", "T2"], "amount_mismatch": [], "missing_in_ledger": ["T3"], "missing_in_bank": []}, 123456.5)', expect: 'RECON OK | matched=2 | mismatch=0 | missing_ledger=1 | missing_bank=0 | bank_total=Rs 1,23,456.50' },
        { call: 'job_summary({"matched": [], "amount_mismatch": ["T6"], "missing_in_ledger": [], "missing_in_bank": ["T4", "T5"]}, 10000000)', expect: 'RECON ALERT | matched=0 | mismatch=1 | missing_ledger=0 | missing_bank=2 | bank_total=Rs 1,00,00,000.00', msg: 'Mismatch -> RECON ALERT; one crore = 1,00,00,000.00' },
        { call: 'job_summary({"matched": ["T1"], "amount_mismatch": [], "missing_in_ledger": [], "missing_in_bank": []}, 999)', expect: 'RECON OK | matched=1 | mismatch=0 | missing_ledger=0 | missing_bank=0 | bank_total=Rs 999.00', msg: 'Small amounts have no comma' },
      ],
      explain: 'Review: finance reads this line at 7 AM, so make the status the first word and keep every field `key=value` (easy to read and easy to grep in logs). Server locales differ between laptop and CI, which is why the Indian grouping is a small pure helper with its own tests instead of relying on `locale`. Format with `.2f` first so rounding happens before you split rupees and paise.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '**PP-405 · Incident · Critical** Bug in production after release\n\nOn Saturday the reconciliation job marks every UPI refund as a mismatch. The release freeze is on and `main` already contains half-finished work for next sprint. What is the correct process?',
      options: [
        'Fix it directly on the production server and tell the team on Monday',
        'Create a hotfix branch from the released tag, write a failing test that reproduces the bug, fix it, get a quick review, release a patch version and merge the fix back into main',
        'Release the current main because it is the newest code',
        'Wait until the next sprint planning to create a ticket',
      ],
      answer: 1,
      explain: 'Review: a **hotfix** starts from exactly what is in production (the release tag), not from main with unreleased work. The failing test proves the bug and stops it coming back. Even urgent fixes get a review, then a patch release (e.g. 1.4.0 to 1.4.1) and the fix is merged back to main so the next release does not reintroduce the bug.',
    },
    {
      type: 'fill',
      mins: 2,
      q: '**PP-406 · Task · Low** Run only the reconciliation tests\n\nThe tests for this sprint live in `tests/test_reconcile.py`. Write the command that runs **only** that test file with pytest.',
      accept: ['pytest tests/test_reconcile.py', 'python -m pytest tests/test_reconcile.py', 'python3 -m pytest tests/test_reconcile.py', 'pytest -v tests/test_reconcile.py', 'pytest tests/test_reconcile.py -v', 'py.test tests/test_reconcile.py'],
      explain: 'Review: `pytest <path>` runs only the tests in that file, which is much faster while you work on one feature (add `-v` for one line per test, or `-k name` to filter by test name). Before pushing, run the **whole** suite with plain `pytest`, because your change may break something elsewhere, and CI will run everything anyway.',
    },
  ],
};
