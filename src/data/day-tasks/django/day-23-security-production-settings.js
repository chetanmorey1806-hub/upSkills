export default {
  lesson: 'day-23-security-production-settings',
  minutes: 35,
  intro: 'Practise CSRF, XSS, SQL injection, clickjacking and HTTPS settings, and see the attacks and defences in SQL and Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which code is vulnerable to **SQL injection**?',
      options: [
        "Student.objects.filter(name=q)",
        "Student.objects.raw('SELECT * FROM students_student WHERE name = %s', [q])",
        "Student.objects.raw(f\"SELECT * FROM students_student WHERE name = '{q}'\")",
        "cursor.execute('SELECT * FROM students_student WHERE name = %s', [q])",
      ],
      answer: 2,
      explain: 'Building SQL with an **f-string** inserts user text directly into the query: `q = "x\' OR \'1\'=\'1"` returns every row. The ORM and parameterised queries (`%s` + a params list) send values separately, so they are always treated as data.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good production security settings? (choose all that apply)',
      options: ['DEBUG = False', 'SECURE_SSL_REDIRECT = True', 'SESSION_COOKIE_SECURE = True and CSRF_COOKIE_SECURE = True', 'SECURE_HSTS_SECONDS = 31536000 (after HTTPS works)', 'X_FRAME_OPTIONS = "ALLOWALL"', 'ALLOWED_HOSTS = ["*"]'],
      answers: [0, 1, 2, 3],
      explain: 'HTTPS everywhere (redirect, secure cookies, HSTS) and DEBUG off. `X_FRAME_OPTIONS = \'DENY\'` (the default) protects against clickjacking; `ALLOWED_HOSTS` must list your real domains. Run `python manage.py check --deploy` to catch the rest.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the POST form so Django\'s CsrfViewMiddleware accepts it:\n\n```\n<form method="post">\n  ______\n  {{ form.as_div }}\n  <button>Pay fee</button>\n</form>\n```',
      accept: ['{% csrf_token %}'],
      explain: '`{% csrf_token %}` adds a hidden secret token. A malicious site can make your browser POST to the portal (with your cookies), but it cannot read the token, so the forged request fails with **403**.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'See SQL injection yourself. A badly written login view builds:\n```\nf"SELECT username FROM auth_user WHERE username = \'{u}\' AND password = \'{p}\'"\n```\nThe attacker types username `admin\' --` and any password. Write the **exact SQL** the view would run (with u = `admin\' --` and p = `x`). Its result shows the attacker is logged in as admin.',
      example: { title: 'what a comment does', code: "SELECT * FROM t WHERE a = 1 -- AND b = 2\n-- everything after -- is ignored" },
      setup: `CREATE TABLE auth_user (id INTEGER PRIMARY KEY, username TEXT, password TEXT);
INSERT INTO auth_user VALUES (1, 'admin', 'pbkdf2_sha256$...$secret'), (2, 'asha', 'pbkdf2_sha256$...$other');`,
      starter: "SELECT username FROM auth_user WHERE username = 'admin' AND password = 'x';",
      solution: "SELECT username FROM auth_user WHERE username = 'admin' --' AND password = 'x';",
      explain: 'The quote in `admin\'` closes the string and `--` turns the password check into a comment, so the query only asks for "username = admin". The fix is never to format SQL with user input: use the ORM (`authenticate()`), or `cursor.execute(sql, [u, p])`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `safe_query(sql, params)` that builds a **parameterised** query the way a DB driver does for SQLite: replace each `%s` in order with the escaped value - strings are wrapped in single quotes with every `\'` doubled (`\'\'`), ints/floats as they are, `None` as `NULL`. If the number of `%s` and params differ return `\'error: wrong number of params\'`.',
      example: { title: 'escaping a quote in SQL', code: "name = \"D'Souza\"\nprint(\"'\" + name.replace(\"'\", \"''\") + \"'\")   # 'D''Souza'" },
      starter: `def safe_query(sql, params):
    # TODO
    return sql
`,
      solution: `def safe_query(sql, params):
    parts = sql.split('%s')
    if len(parts) - 1 != len(params):
        return 'error: wrong number of params'
    def lit(v):
        if v is None:
            return 'NULL'
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return str(v)
        return "'" + str(v).replace("'", "''") + "'"
    out = parts[0]
    for value, rest in zip(params, parts[1:]):
        out += lit(value) + rest
    return out
`,
      tests: [
        { call: "safe_query('SELECT * FROM s WHERE name = %s AND marks > %s', ['Asha', 60])", expect: "SELECT * FROM s WHERE name = 'Asha' AND marks > 60" },
        { call: "safe_query('SELECT * FROM s WHERE name = %s', [\"D'Souza\"])", expect: "SELECT * FROM s WHERE name = 'D''Souza'" },
        { call: "safe_query('SELECT * FROM u WHERE username = %s', [\"admin' --\"])", expect: "SELECT * FROM u WHERE username = 'admin'' --'", msg: 'The attack text must stay inside the string' },
        { call: "safe_query('UPDATE s SET phone = %s WHERE id = %s', [None, 3])", expect: 'UPDATE s SET phone = NULL WHERE id = 3' },
        { call: "safe_query('SELECT %s, %s', [1])", expect: 'error: wrong number of params' },
      ],
      explain: 'With proper escaping the attacker\'s `\'` becomes `\'\'` (a literal quote inside the string), so `--` is no longer a comment. Real drivers go further and send values separately from the SQL text. In Django you never write this yourself: use the ORM or `params=[...]`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.template import Template, Context
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

comment = '<script>steal(document.cookie)</script>'
print(Template('{{ c }}').render(Context({'c': comment})))
print(Template('{{ c|safe }}').render(Context({'c': comment})))
print(format_html('<b>{}</b>', comment))
print(escape("Tom & Jerry's"))`,
      expected: "&lt;script&gt;steal(document.cookie)&lt;/script&gt;\n<script>steal(document.cookie)</script>\n<b>&lt;script&gt;steal(document.cookie)&lt;/script&gt;</b>\nTom &amp; Jerry&#x27;s",
      explain: 'Auto-escaping neutralises the script (**XSS** protection). `|safe` (or `mark_safe`) disables it - the script would run in every visitor\'s browser. When you need HTML around user data, `format_html` escapes the arguments but keeps your own tags.',
    },
  ],
};
