export default {
  lesson: 'day-03-jinja2-templates-static-files',
  minutes: 30,
  intro: 'Practise Jinja2 syntax, filters, loops, template inheritance, static files and autoescaping, and write the Python that prepares template context.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a Jinja2 template, which delimiter **prints** a value?',
      options: ['{% name %}', '{{ name }}', '{# name #}', '<%= name %>'],
      answer: 1,
      explain: '`{{ ... }}` = expression (prints a value), `{% ... %}` = statement (for, if, block, extends), `{# ... #}` = comment (not sent to the browser). `<%= %>` is EJS/ERB, not Jinja2.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line in a child template that reuses the layout `base.html`:\n\n```\n______\n{% block content %}\n  <h1>Courses</h1>\n{% endblock %}\n```',
      accept: ["{% extends 'base.html' %}", '{% extends "base.html" %}'],
      explain: '`{% extends \'base.html\' %}` must be the **first** tag in the child template. The child then only overrides the `{% block %}`s defined in the base; anything written outside blocks in a child template is ignored.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        "url_for('static', filename='css/style.css') builds /static/css/style.css",
        'render_template looks for files in the templates/ folder next to your app',
        'Autoescaping turns <script> in user data into &lt;script&gt; in .html templates',
        'The |safe filter should be used on comments typed by users',
        'loop.index inside a for loop starts at 0',
      ],
      answers: [0, 1, 2],
      explain: 'Static files live in `static/` and are linked with `url_for(\'static\', filename=...)`. Templates live in `templates/`. Autoescaping protects against **XSS**; `|safe` turns it off, so never use it on user input. `loop.index` starts at **1** (`loop.index0` starts at 0).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      code: `from flask import Flask, render_template_string

app = Flask(__name__)
tpl = """{% for s in students %}{{ loop.index }}. {{ s.name|title }} - {{ s.marks }}{% if s.marks >= 35 %} PASS{% else %} FAIL{% endif %}
{% endfor %}Total: {{ students|length }} | Note: {{ note }}"""

with app.app_context():
    print(render_template_string(tpl,
        students=[{'name': 'asha patil', 'marks': 82}, {'name': 'ravi', 'marks': 30}],
        note='<b>Top</b>'))`,
      expected: '1. Asha Patil - 82 PASS\n2. Ravi - 30 FAIL\nTotal: 2 | Note: &lt;b&gt;Top&lt;/b&gt;',
      explain: '`loop.index` starts at 1, `|title` capitalises each word, `|length` counts items. `render_template_string` autoescapes like an `.html` template, so the `<b>` tags in `note` are printed as `&lt;b&gt;` - this is the XSS protection you get for free.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Views should prepare data **before** passing it to a template. Write `marksheet_context(name, marks)` that returns a dict for `render_template`:\n- `name`: the name in Title Case\n- `total`: sum of the marks\n- `percent`: total / (len(marks) * 100) * 100, rounded to 1 decimal\n- `result`: `\'PASS\'` if every mark is >= 35, else `\'FAIL\'`',
      example: { title: 'building a context dict', code: "def profile_context(user):\n    return {'username': user.lower(), 'initial': user[0].upper()}\n\n# return render_template('profile.html', **profile_context('Asha'))" },
      starter: `def marksheet_context(name, marks):
    # TODO: return a dict with name, total, percent, result
    return {}
`,
      solution: `def marksheet_context(name, marks):
    total = sum(marks)
    return {
        'name': name.title(),
        'total': total,
        'percent': round(total / (len(marks) * 100) * 100, 1),
        'result': 'PASS' if all(m >= 35 for m in marks) else 'FAIL',
    }
`,
      tests: [
        { call: "marksheet_context('asha patil', [80, 90, 75])", expect: { name: 'Asha Patil', total: 245, percent: 81.7, result: 'PASS' } },
        { call: "marksheet_context('ravi', [60, 31, 21])", expect: { name: 'Ravi', total: 112, percent: 37.3, result: 'FAIL' } },
      ],
      explain: 'Keep calculations in Python and keep templates for display only. The view would call `render_template(\'marksheet.html\', **marksheet_context(name, marks))`. Templates with heavy logic are hard to test; a plain function like this can be tested in one line.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `escape_html(text)` that does what Jinja2 autoescaping does: replace `&` with `&amp;`, `<` with `&lt;`, `>` with `&gt;`, `"` with `&#34;` and `\'` with `&#39;`. (Replace `&` **first**!)',
      example: { title: 'chained replace', code: "s = 'a-b_c'.replace('-', ' ').replace('_', ' ')\nprint(s)   # a b c" },
      starter: `def escape_html(text):
    # TODO
    return text
`,
      solution: `def escape_html(text):
    return (text.replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&#34;')
                .replace("'", '&#39;'))
`,
      tests: [
        { call: "escape_html('<script>alert(1)</script>')", expect: '&lt;script&gt;alert(1)&lt;/script&gt;' },
        { call: "escape_html('Tom & Jerry')", expect: 'Tom &amp; Jerry' },
        { call: "escape_html('say \"hi\"')", expect: 'say &#34;hi&#34;' },
        { call: "escape_html(\"it's\")", expect: 'it&#39;s' },
      ],
      explain: 'Escaping turns HTML special characters into harmless entities, so user input is shown as text instead of being run as HTML/JavaScript (XSS). `&` must be replaced first, otherwise the `&` inside `&lt;` would be escaped again into `&amp;lt;`. Jinja2 (via MarkupSafe) does this automatically for every `{{ }}` in `.html` templates.',
    },
  ],
};
