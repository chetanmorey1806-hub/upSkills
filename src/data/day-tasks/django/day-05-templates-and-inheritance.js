export default {
  lesson: 'day-05-templates-and-inheritance',
  minutes: 30,
  intro: 'Practise the Django Template Language - variables, dot lookup, tags, filters, inheritance and auto-escaping - and re-implement a few filters in Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The context is `{\'student\': {\'name\': \'Asha\', \'marks\': [80, 92]}}`. Which template expression prints `92`?',
      options: ['{{ student[\'marks\'][1] }}', '{{ student.marks.1 }}', '{{ student.marks(1) }}', '{% student.marks.1 %}'],
      answer: 1,
      explain: 'Django templates use **dot lookup** for everything: dict key, attribute, method (without brackets) and list index - `student.marks.1`. Square brackets and calls with arguments are not allowed in DTL.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the loop so it shows "No students yet." when the list is empty:\n\n```\n<ul>\n{% for s in students %}\n  <li>{{ s.name }}</li>\n______\n  <li>No students yet.</li>\n{% endfor %}\n</ul>\n```',
      accept: ['{% empty %}'],
      explain: '`{% for %} ... {% empty %} ... {% endfor %}` renders the `empty` block when the list is empty (or missing) - shorter than wrapping the loop in `{% if students %}`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '{% extends "base.html" %} must be the first template tag in the child',
        'A child template overrides {% block content %} defined in base.html',
        '{{ comment|safe }} is fine for text typed by users',
        '{{ name|default:"Guest" }} prints Guest when name is empty or missing',
        '{% include "partials/navbar.html" %} inserts another template',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Inheritance: the base defines blocks, children fill them; `extends` must come first. Auto-escaping protects against XSS - `|safe` turns it off, so never use it on user input. `default` covers falsy values, `include` reuses fragments.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project)',
      code: `from django.template import Template, Context

t = Template(
    "{% for s in students %}{{ forloop.counter }}. {{ s.name|title }} "
    "({{ s.marks|floatformat:1 }}%) {% if s.marks >= 35 %}Pass{% else %}Fail{% endif %}\\n{% endfor %}"
    "{{ students|length }} student{{ students|length|pluralize }} | "
    "{{ note|default:'No note' }} | {{ html }} | {{ bio|truncatechars:10 }}"
)
print(t.render(Context({
    'students': [{'name': 'asha patil', 'marks': 82.456}, {'name': 'ravi', 'marks': 30}],
    'note': '',
    'html': '<b>Topper</b>',
    'bio': 'Loves Python and cricket',
})))`,
      expected: '1. Asha Patil (82.5%) Pass\n2. Ravi (30.0%) Fail\n2 students | No note | &lt;b&gt;Topper&lt;/b&gt; | Loves Pyt…',
      explain: '`forloop.counter` starts at 1, `title` capitalises words, `floatformat:1` rounds to one decimal. `pluralize` adds "s" when the number is not 1. Empty `note` → `default`. The `<b>` tags are **auto-escaped**. `truncatechars:10` keeps 9 characters plus "…" (10 in total).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Re-implement four built-in filters as Python functions:\n- `pluralize(n, suffix=\'s\')` → `\'\'` if n == 1 else suffix\n- `truncatechars(text, n)` → text if len <= n, else the first `n-1` chars + `\'…\'`\n- `default(value, fallback)` → fallback if value is falsy (`\'\'`, `None`, `0`, `[]`), else value\n- `floatformat(x, digits=1)` → string with exactly `digits` decimals (rounding half up like Django, e.g. 82.45 → 82.5)',
      example: { title: 'Decimal rounding half up', code: "from decimal import Decimal, ROUND_HALF_UP\nprint(Decimal('2.675').quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))   # 2.68" },
      starter: `from decimal import Decimal, ROUND_HALF_UP

def pluralize(n, suffix='s'):
    return ''

def truncatechars(text, n):
    return text

def default(value, fallback):
    return value

def floatformat(x, digits=1):
    return str(x)
`,
      solution: `from decimal import Decimal, ROUND_HALF_UP

def pluralize(n, suffix='s'):
    return '' if n == 1 else suffix

def truncatechars(text, n):
    return text if len(text) <= n else text[:n - 1] + '…'

def default(value, fallback):
    return value if value else fallback

def floatformat(x, digits=1):
    q = Decimal(1).scaleb(-digits)
    return str(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP))
`,
      tests: [
        { call: '[pluralize(0), pluralize(1), pluralize(5)]', expect: ['s', '', 's'] },
        { call: "pluralize(2, 'es')", expect: 'es' },
        { call: "truncatechars('Loves Python and cricket', 10)", expect: 'Loves Pyt…' },
        { call: "truncatechars('Short', 10)", expect: 'Short' },
        { call: "[default('', 'Guest'), default(None, 'Guest'), default('Asha', 'Guest'), default(0, 'N/A')]", expect: ['Guest', 'Guest', 'Asha', 'N/A'] },
        { call: '[floatformat(82.45), floatformat(30), floatformat(7.126, 2)]', expect: ['82.5', '30.0', '7.13'] },
      ],
      explain: 'Filters are just Python functions `value|filter:arg` → `filter(value, arg)`; you can write your own with `@register.filter`. Keep presentation tweaks (plurals, truncation, number formats) in templates/filters and calculations in views.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Simulate template inheritance. Write `render_inheritance(base, blocks)`: `base` contains placeholders like `{% block title %}Default{% endblock %}`. Replace each block with the child\'s content from the dict `blocks` (`{name: html}`), or keep the default content if the child does not override that block.',
      example: { title: 're.sub with a function', code: "import re\ns = re.sub(r'\\[(\\w+)\\]', lambda m: m.group(1).upper(), 'Hi [asha]')\nprint(s)   # Hi ASHA" },
      starter: `import re

def render_inheritance(base, blocks):
    # TODO
    return base
`,
      solution: `import re

def render_inheritance(base, blocks):
    pattern = r'\\{% block (\\w+) %\\}(.*?)\\{% endblock %\\}'
    return re.sub(pattern, lambda m: blocks.get(m.group(1), m.group(2)), base, flags=re.S)
`,
      tests: [
        { call: "render_inheritance('<title>{% block title %}Student Portal{% endblock %}</title><main>{% block content %}{% endblock %}</main>', {'content': '<h1>Students</h1>'})", expect: '<title>Student Portal</title><main><h1>Students</h1></main>' },
        { call: "render_inheritance('<title>{% block title %}Student Portal{% endblock %}</title>', {'title': 'Fees | Portal'})", expect: '<title>Fees | Portal</title>' },
        { call: "render_inheritance('<nav>Menu</nav>{% block content %}Welcome{% endblock %}<footer>2026</footer>', {})", expect: '<nav>Menu</nav>Welcome<footer>2026</footer>' },
      ],
      explain: 'This is the idea of `{% extends %}`: the **base** owns the layout (nav, footer, CSS links) and defines named holes; each page only fills the blocks it needs, and anything it does not override keeps the base default. Change the navbar once in base.html and every page updates.',
    },
  ],
};
