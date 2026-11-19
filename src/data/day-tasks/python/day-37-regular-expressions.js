export default {
  lesson: 'day-37-regular-expressions',
  minutes: 35,
  intro: 'Search, extract, replace and validate text with the re module: Indian mobile numbers, PAN, emails, dates and hashtags.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import re
text = "Order 66 shipped on 12-05-2026, invoice 1042"
print(re.findall(r"\\d+", text))
print(re.match(r"\\d+", text))
print(re.search(r"\\d+", text).group())
print(re.sub(r"\\d", "#", "PIN 4110"))
print(re.findall(r"<.+>", "<b>hi</b>"), re.findall(r"<.+?>", "<b>hi</b>"))`,
      expected: "['66', '12', '05', '2026', '1042']\nNone\n66\nPIN ####\n['<b>hi</b>'] ['<b>', '</b>']",
      explain: '`findall` returns every match. `match` only checks at the **start** of the string (text starts with "Order" → None); `search` finds the first match anywhere. `+` is greedy (takes as much as possible); `+?` is non-greedy (as little as possible).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should regex patterns usually be written as raw strings, like `r"\\d+"`?',
      options: [
        'Raw strings run faster',
        'So Python does not treat backslashes as its own escape sequences before re sees them',
        'Because re only accepts raw strings',
        'To make the match case-insensitive',
      ],
      answer: 1,
      explain: 'In a normal string, `"\\b"` is a backspace character, not the regex word boundary. `r"..."` keeps backslashes as-is, so the regex engine receives exactly what you wrote.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Input validators using `re.fullmatch`. Each returns True/False:\n- `is_mobile(s)`: Indian mobile, exactly 10 digits, first digit 6-9 (`9876543210` ✓, `5876543210` ✗)\n- `is_pan(s)`: PAN = 5 capital letters, 4 digits, 1 capital letter (`ABCDE1234F` ✓)\n- `is_pincode(s)`: 6 digits, first digit not 0',
      example: { title: 'fullmatch checks the whole string', code: 'import re\nprint(bool(re.fullmatch(r"[A-Z]{2}\\d{2}", "MH12")))    # True\nprint(bool(re.fullmatch(r"[A-Z]{2}\\d{2}", "MH123")))   # False' },
      starter: `import re

def is_mobile(s):
    pass  # TODO

def is_pan(s):
    pass  # TODO

def is_pincode(s):
    pass  # TODO
`,
      solution: `import re

def is_mobile(s):
    return bool(re.fullmatch(r"[6-9]\\d{9}", s))

def is_pan(s):
    return bool(re.fullmatch(r"[A-Z]{5}\\d{4}[A-Z]", s))

def is_pincode(s):
    return bool(re.fullmatch(r"[1-9]\\d{5}", s))
`,
      tests: [
        { call: '[is_mobile("9876543210"), is_mobile("5876543210"), is_mobile("98765432101"), is_mobile("98765abc10")]', expect: [true, false, false, false] },
        { call: '[is_pan("ABCDE1234F"), is_pan("abcde1234f"), is_pan("ABCD1234F")]', expect: [true, false, false] },
        { call: '[is_pincode("411001"), is_pincode("011001"), is_pincode("41100")]', expect: [true, false, false] },
      ],
      explain: '`fullmatch` requires the **whole** string to match; `search` would accept "98765432101" because 10 valid digits appear inside it. `\\d{9}` means exactly 9 digits and `[6-9]` is a character class.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Extract data with **named groups**. Write `parse_dates(text)` that finds all dates written as `dd-mm-yyyy` and returns a list of dicts `{"day": .., "month": .., "year": ..}` (strings).\n\n`parse_dates("Exam 12-05-2026, result 30-06-2026")` → `[{"day": "12", "month": "05", "year": "2026"}, {"day": "30", "month": "06", "year": "2026"}]`',
      example: { title: 'named groups', code: 'import re\nm = re.search(r"(?P<user>\\w+)@(?P<site>[\\w.]+)", "mail asha@upskillr.in")\nprint(m.group("user"), m.groupdict())' },
      starter: `import re

def parse_dates(text):
    return []  # TODO
`,
      solution: `import re

def parse_dates(text):
    pattern = r"(?P<day>\\d{2})-(?P<month>\\d{2})-(?P<year>\\d{4})"
    return [m.groupdict() for m in re.finditer(pattern, text)]
`,
      tests: [
        { call: 'parse_dates("Exam 12-05-2026, result 30-06-2026")', expect: [{ day: '12', month: '05', year: '2026' }, { day: '30', month: '06', year: '2026' }] },
        { call: 'parse_dates("no dates here")', expect: [] },
      ],
      explain: '`(?P<name>...)` names a group, and `groupdict()` returns all named groups as a dict. `finditer` yields match objects (with groups); `findall` with groups returns only tuples of strings.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Clean and search text with `re.sub` and `re.findall`:\n- `clean_spaces(s)` → replaces any run of whitespace with a single space and strips the ends\n- `hashtags(s)` → list of hashtags **without** the `#` (letters, digits, underscore)\n\n`clean_spaces("  Learn   Python \\n fast ")` → `"Learn Python fast"`\n`hashtags("Day 37 #Python #regex_101 done")` → `["Python", "regex_101"]`',
      example: { title: 'sub and a group in findall', code: 'import re\nprint(re.sub(r"-+", "-", "a---b--c"))        # a-b-c\nprint(re.findall(r"@(\\w+)", "hi @asha @ravi"))  # [\'asha\', \'ravi\']' },
      starter: `import re

def clean_spaces(s):
    return s  # TODO

def hashtags(s):
    return []  # TODO
`,
      solution: `import re

def clean_spaces(s):
    return re.sub(r"\\s+", " ", s).strip()

def hashtags(s):
    return re.findall(r"#(\\w+)", s)
`,
      tests: [
        { call: 'clean_spaces("  Learn   Python \\n fast ")', expect: 'Learn Python fast' },
        { call: 'hashtags("Day 37 #Python #regex_101 done")', expect: ['Python', 'regex_101'] },
        { call: 'hashtags("no tags")', expect: [] },
      ],
      explain: '`\\s+` matches one or more whitespace characters (spaces, tabs, newlines). With one group in the pattern, `findall` returns only the group’s text, so the `#` is dropped automatically.',
    },
  ],
};
