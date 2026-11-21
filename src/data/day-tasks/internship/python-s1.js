export default {
  lesson: 'python-s1',
  minutes: 40,
  intro: 'Sprint 1 at PaisaPath: write the small, well-tested cleaning helpers (phone, amount, account mask, names) that the whole payments pipeline reuses.',
  tasks: [
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**PP-101 · Story · Medium** Normalize customer phone numbers\n\nMerchants upload phone numbers in many formats: `"98765 43210"`, `"+91-98765-43210"`, `"09876543210"`, `"919876543210"`.\n\nWrite `normalize_phone(raw)`:\n- Remove spaces, dashes and the leading `+`\n- Remove a leading country code `91` (when 12 digits) or a leading `0` (when 11 digits)\n- The result must be exactly 10 digits starting with 6, 7, 8 or 9\n- Return `"+91"` + the 10 digits, or `None` if invalid',
      example: { title: 'cleaning a GST number', code: 'def clean_gstin(raw):\n    s = raw.replace(" ", "").upper()\n    return s if len(s) == 15 else None' },
      starter: 'def normalize_phone(raw):\n    # TODO\n    return raw\n',
      solution: `def normalize_phone(raw):
    digits = raw.replace(" ", "").replace("-", "").lstrip("+")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits.isdigit() and digits[0] in "6789":
        return "+91" + digits
    return None
`,
      tests: [
        { call: 'normalize_phone("98765 43210")', expect: '+919876543210' },
        { call: 'normalize_phone("+91-98765-43210")', expect: '+919876543210' },
        { call: 'normalize_phone("09876543210")', expect: '+919876543210', msg: 'A leading 0 (11 digits) must be removed' },
        { call: 'normalize_phone("919876543210")', expect: '+919876543210', msg: 'Country code 91 without + must be removed' },
        { call: 'normalize_phone("12345 67890")', expect: null, msg: 'Numbers starting with 1-5 are invalid -> None' },
        { call: 'normalize_phone("98765")', expect: null, msg: 'Too short -> None' },
        { call: 'normalize_phone("98765abcde")', expect: null, msg: 'Letters -> None' },
      ],
      explain: 'Review: clean first, then validate the **final** shape (10 digits, starts with 6-9). Returning `None` for bad input lets the caller decide what to do (skip the row, show an error) instead of crashing the whole import. Only strip `91` when the length proves it is a country code; a valid number like 9198765432 starts with 91 too.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**PP-102 · Bug · High** parse_amount crashes on "Rs. 1,250"\n\nThe import job crashed with `ValueError: could not convert string to float: \'₹1,250.50\'`.\n\nFix `parse_amount(text)`:\n- Remove `₹`, `Rs.`, `Rs`, `INR`, commas and spaces\n- Return a `float`\n- Empty or blank text returns `0.0`\n- `parse_amount("₹1,250.50")` returns `1250.5`',
      example: { title: 'removing several tokens', code: 'def clean_percent(text):\n    for token in ["%", " "]:\n        text = text.replace(token, "")\n    return float(text) if text else 0.0' },
      starter: 'def parse_amount(text):\n    return float(text)   # BUG: crashes on symbols and commas\n',
      solution: `def parse_amount(text):
    s = text.strip()
    for token in ["₹", "Rs.", "Rs", "INR", ",", " "]:
        s = s.replace(token, "")
    return float(s) if s else 0.0
`,
      tests: [
        { call: 'parse_amount("₹1,250.50")', expect: 1250.5 },
        { call: 'parse_amount("Rs. 99")', expect: 99 },
        { call: 'parse_amount("INR 1,00,000")', expect: 100000, msg: 'Indian grouping 1,00,000 = 100000' },
        { call: 'parse_amount("")', expect: 0, msg: 'Empty text returns 0.0' },
        { call: 'parse_amount("   ")', expect: 0, msg: 'Blank text returns 0.0' },
        { call: 'type(parse_amount("42")).__name__', expect: 'float', msg: 'Always return a float' },
      ],
      explain: 'Review: remove `Rs.` **before** `Rs`, otherwise the dot stays behind and `float(".99")` gives the wrong number. Handle the empty case explicitly; `float("")` raises ValueError. In production you would also store money in paise (integers) to avoid float rounding, but parsing is the first step.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: '**PP-103 · Story · Medium** Mask bank account numbers in reports\n\nCompliance rule: reports may show only the **last 4 digits** of an account number.\n\nWrite `mask_account(acc)`:\n- Remove spaces first\n- Replace every character except the last 4 with `X`\n- If there are 4 or fewer characters, return them unchanged\n- `mask_account("1234 5678 9012")` returns `"XXXXXXXX9012"`',
      example: { title: 'masking an email', code: 'def mask_email(e):\n    name, domain = e.split("@")\n    return name[0] + "*" * (len(name) - 1) + "@" + domain' },
      starter: 'def mask_account(acc):\n    # TODO\n    return acc\n',
      solution: `def mask_account(acc):
    s = acc.replace(" ", "")
    if len(s) <= 4:
        return s
    return "X" * (len(s) - 4) + s[-4:]
`,
      tests: [
        { call: 'mask_account("1234 5678 9012")', expect: 'XXXXXXXX9012' },
        { call: 'mask_account("00112233445566")', expect: 'XXXXXXXXXX5566' },
        { call: 'mask_account("789")', expect: '789', msg: '4 or fewer characters are returned unchanged' },
        { call: 'len(mask_account("123456789012345678"))', expect: 18, msg: 'The masked value keeps the original length' },
      ],
      explain: 'Review: `"X" * n + s[-4:]` keeps the length so support staff can still recognise the account type, while hiding the digits. Never log the raw number "just for debugging": logs are copied to many systems and that is a data leak under Indian data protection rules.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**PP-104 · Story · Medium** Clean merchant names\n\nThe merchant list has duplicates like `"  ravi stores"`, `"RAVI STORES"` and `"Ravi Stores"`.\n\nWrite `clean_names(names)`:\n- Strip spaces, collapse multiple inner spaces to one and convert to Title Case\n- Remove duplicates **after** cleaning, keeping the first occurrence order\n- Skip empty names\n- Return a list',
      example: { title: 'dedupe while keeping order', code: 'seen = set()\nunique = []\nfor city in ["Pune", "Goa", "Pune"]:\n    if city not in seen:\n        seen.add(city)\n        unique.append(city)\n# ["Pune", "Goa"]' },
      starter: 'def clean_names(names):\n    # TODO\n    return names\n',
      solution: `def clean_names(names):
    seen = set()
    result = []
    for n in names:
        clean = " ".join(n.split()).title()
        if clean and clean not in seen:
            seen.add(clean)
            result.append(clean)
    return result
`,
      tests: [
        { call: 'clean_names(["  ravi stores", "RAVI STORES", "Asha  Traders", "Ravi Stores"])', expect: ['Ravi Stores', 'Asha Traders'] },
        { call: 'clean_names(["", "   ", "om mart"])', expect: ['Om Mart'], msg: 'Empty names must be skipped' },
        { call: 'clean_names(["kiran   kirana   store"])', expect: ['Kiran Kirana Store'], msg: 'Collapse inner spaces' },
        { call: 'clean_names([])', expect: [] },
      ],
      explain: 'Review: `" ".join(s.split())` trims and collapses all whitespace in one step. Clean **before** comparing, otherwise "RAVI STORES" and "Ravi Stores" look different. `set()` alone would lose the original order, so use a set for "seen" plus a list for the result.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '**PP-105 · Task · Low** Commit message\n\nYou fixed PP-102 (amounts with ₹ and commas). Which commit message follows the team convention?',
      options: [
        '"fixed stuff"',
        '"PP-102: handle rupee symbol, Rs. prefix and commas in parse_amount"',
        '"final final v2"',
        '"Updated utils.py"',
      ],
      answer: 1,
      explain: 'Review: start with the **ticket key** so Jira links the commit automatically, then say **what** changed in the imperative mood. Six months later, `git log` and `git blame` are how someone finds why this line exists; "fixed stuff" tells them nothing.',
    },
    {
      type: 'fill',
      mins: 2,
      q: '**PP-106 · Task · Low** Check before you commit\n\nBefore committing, you want to see which files are modified, which are staged and which are untracked. Write the git command.',
      accept: ['git status', 'git status -s', 'git status --short'],
      explain: 'Review: `git status` shows staged, modified and untracked files, so you never commit a debug file or forget a new one. Use `git diff` (and `git diff --staged`) to see the actual line changes. Make checking both a habit before every commit.',
    },
  ],
};
