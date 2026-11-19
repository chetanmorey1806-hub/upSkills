export default {
  lesson: 'day-02-routing-url-building',
  minutes: 30,
  intro: 'Practise routes, URL converters, HTTP methods, url_for and redirect, then write the URL-matching logic a router uses behind the scenes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A route is declared as `@app.route(\'/student/<int:roll>\')`. What happens when a user opens `/student/abc`?',
      options: ['The view runs with roll = "abc"', 'The view runs with roll = 0', 'Flask returns 404 Not Found because "abc" does not match the int converter', 'Flask returns 500 Internal Server Error'],
      answer: 2,
      explain: 'Converters are part of URL **matching**. `<int:roll>` only matches digits, so `/student/abc` matches no rule and Flask answers **404**. When it does match, the value is already converted, so `roll` is an `int`, not a string.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the decorator so that `/login` accepts **both** GET (show the form) and POST (submit the form):\n\n```\n@app.route(\'/login\', ______)\ndef login():\n    ...\n```',
      accept: ["methods=['GET', 'POST']", 'methods=["GET", "POST"]', "methods=['POST', 'GET']", 'methods=["POST", "GET"]', "methods=('GET', 'POST')", 'methods=("GET", "POST")'],
      explain: 'By default a route only allows **GET** (and HEAD/OPTIONS). Without `methods=[\'GET\', \'POST\']` submitting the form gives **405 Method Not Allowed**. Inside the view, check `request.method == \'POST\'` to tell the two apart. Flask 2+ also has the shortcuts `@app.get` and `@app.post`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `url_for` and `redirect` are TRUE? (choose all that apply)',
      options: [
        'url_for takes the **endpoint name** (normally the function name), not the URL',
        "url_for('profile', username='asha') fills the <username> part of the rule",
        'Extra keyword arguments that are not in the rule are added as a query string',
        'redirect() changes the URL rule of the current view',
        'Hard-coding URLs like "/profile/asha" is better because url_for is slow',
      ],
      answers: [0, 1, 2],
      explain: '`url_for(\'profile\', username=\'asha\')` builds `/profile/asha` from the **endpoint** name, so if you later change the URL rule every link still works. Unknown arguments become a query string: `url_for(\'search\', q=\'flask\')` → `/search?q=flask`. `redirect()` simply returns a 302 response that tells the browser to go somewhere else.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (it uses Flask\'s test client and a test request context)',
      code: `from flask import Flask, url_for, redirect

app = Flask(__name__)

@app.route('/course/<slug>')
def course(slug):
    return f'Course: {slug}'

@app.route('/old-course')
def old():
    return redirect(url_for('course', slug='python'))

with app.test_request_context():
    print(url_for('course', slug='flask', page=2))

client = app.test_client()
r = client.get('/old-course')
print(r.status_code, r.headers['Location'])
print(client.get('/course/django').get_data(as_text=True))
print(client.post('/course/django').status_code)`,
      expected: '/course/flask?page=2\n302 /course/python\nCourse: django\n405',
      explain: '`page=2` is not part of the rule, so url_for adds it as `?page=2`. `redirect()` returns **302** with a `Location` header. The `/course/<slug>` rule only allows GET, so a POST gets **405 Method Not Allowed** (the URL exists, the method does not).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write the matching logic behind `<int:...>` and `<string:...>` rules. `match(rule, path)` gets a rule like `\'/student/<int:roll>/marks\'` and a path like `\'/student/7/marks\'` and returns:\n- a dict of captured values (`{\'roll\': 7}`, ints converted with `int()`) if the path matches\n- `None` if it does not match (different number of parts, different fixed text, or a non-digit for `int`)\n\nPlain `<name>` and `<string:name>` capture any text without a `/`.',
      example: { title: 'splitting a URL into parts', code: "parts = '/a/b/c'.strip('/').split('/')\nprint(parts)   # ['a', 'b', 'c']\nprint('<int:id>'[1:-1].split(':'))   # ['int', 'id']" },
      starter: `def match(rule, path):
    # TODO: compare rule parts with path parts
    return None
`,
      solution: `def match(rule, path):
    r_parts = rule.strip('/').split('/')
    p_parts = path.strip('/').split('/')
    if len(r_parts) != len(p_parts):
        return None
    values = {}
    for r, p in zip(r_parts, p_parts):
        if r.startswith('<') and r.endswith('>'):
            inner = r[1:-1]
            conv, name = inner.split(':') if ':' in inner else ('string', inner)
            if conv == 'int':
                if not p.isdigit():
                    return None
                values[name] = int(p)
            else:
                if p == '':
                    return None
                values[name] = p
        elif r != p:
            return None
    return values
`,
      tests: [
        { call: "match('/student/<int:roll>/marks', '/student/7/marks')", expect: { roll: 7 } },
        { call: "match('/student/<int:roll>/marks', '/student/abc/marks')", expect: null },
        { call: "match('/hello/<name>', '/hello/Asha')", expect: { name: 'Asha' } },
        { call: "match('/hello/<string:name>', '/hello/Asha/extra')", expect: null },
        { call: "match('/about', '/about')", expect: {} },
        { call: "match('/about', '/contact')", expect: null },
        { call: "match('/<string:city>/shop/<int:id>', '/pune/shop/42')", expect: { city: 'pune', id: 42 } },
      ],
      explain: 'Werkzeug compiles each rule into a regex, but the idea is the same: fixed parts must be equal, variable parts are captured and **converted**. That is why `/student/abc` gives 404 for an `int` rule and why the view receives an `int`. Common mistakes: forgetting to compare the number of parts, and returning the value as a string `"7"` instead of `7`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `build_url(rule, **values)` - a mini `url_for`. Replace every `<name>` or `<conv:name>` placeholder with the value from `values`; every **leftover** value becomes a query string `?key=value&key2=value2` (in the order given).',
      example: { title: 'replacing text and joining pairs', code: "s = '/shop/<item>'.replace('<item>', 'pen')\nq = '&'.join(f'{k}={v}' for k, v in {'a': 1, 'b': 2}.items())\nprint(s, q)   # /shop/pen a=1&b=2" },
      starter: `def build_url(rule, **values):
    # TODO
    return rule
`,
      solution: `import re

def build_url(rule, **values):
    used = set()
    def repl(m):
        name = m.group(1).split(':')[-1]
        used.add(name)
        return str(values[name])
    url = re.sub(r'<([^>]+)>', repl, rule)
    extra = [(k, v) for k, v in values.items() if k not in used]
    if extra:
        url += '?' + '&'.join(f'{k}={v}' for k, v in extra)
    return url
`,
      tests: [
        { call: "build_url('/course/<slug>', slug='flask')", expect: '/course/flask' },
        { call: "build_url('/student/<int:roll>', roll=12, tab='marks')", expect: '/student/12?tab=marks' },
        { call: "build_url('/search', q='python', page=2)", expect: '/search?q=python&page=2' },
        { call: "build_url('/<city>/shop/<int:id>', city='pune', id=5)", expect: '/pune/shop/5' },
      ],
      explain: 'This is how `url_for` works: rule placeholders are filled from keyword arguments, and unknown arguments go to the query string. Because templates and views call `url_for(\'endpoint\', ...)` instead of hard-coding paths, you can change a URL rule in one place.',
    },
  ],
};
