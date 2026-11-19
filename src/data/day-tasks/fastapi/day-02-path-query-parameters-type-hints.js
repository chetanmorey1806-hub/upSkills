export default {
  lesson: 'day-02-path-query-parameters-type-hints',
  minutes: 30,
  intro: 'Practise path and query parameters, type conversion, 422 errors, Enum and Query()/Path() rules, and write the conversion and validation logic FastAPI does from type hints.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Given `@app.get(\'/students/{student_id}\')` and `def get_student(student_id: int):`, what happens for `GET /students/abc`?',
      options: ['student_id = "abc"', 'student_id = 0', 'FastAPI returns 422 Unprocessable Entity with a validation error', 'FastAPI returns 404'],
      answer: 2,
      explain: 'The path **matches** (`{student_id}` accepts any text), but validation of the type hint `int` fails, so FastAPI returns **422** with a JSON error explaining which parameter is wrong. (Flask\'s `<int:id>` would give 404 instead, because there the type is part of URL matching.)',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'For `def list_students(city: str, page: int = 1, active: bool | None = None)` (no `{...}` in the path), which are TRUE? (choose all that apply)',
      options: [
        'city is a REQUIRED query parameter',
        'page is optional and defaults to 1',
        '?active=yes is converted to True',
        'city is a path parameter',
        'Calling the endpoint without ?city=... returns 200 with city = None',
      ],
      answers: [0, 1, 2],
      explain: 'Parameters not in the path are **query** parameters. No default → required (missing gives 422). For `bool`, FastAPI accepts `1, true, on, yes` (any case) as True. Only names inside `{...}` in the path are path parameters.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the parameter so `limit` is an optional query param with default 10, minimum 1 and maximum 100:\n\n```\n@app.get(\'/products\')\ndef products(limit: Annotated[int, ______] = 10):\n    ...\n```',
      accept: ['Query(ge=1, le=100)', 'Query(le=100, ge=1)', 'Query(gt=0, le=100)', 'Query(ge=1, lt=101)'],
      explain: '`Query(ge=1, le=100)` adds validation (`ge` = greater than or equal, `le` = less than or equal) and documents the limits in `/docs`. With `Annotated`, the default goes after `=` as usual. `?limit=500` now returns 422.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from enum import Enum
from fastapi import FastAPI
from fastapi.testclient import TestClient

class Branch(str, Enum):
    cse = 'cse'
    it = 'it'

app = FastAPI()

@app.get('/branches/{branch}/students')
def students(branch: Branch, year: int = 1, q: str | None = None):
    return {'branch': branch.value, 'year': year, 'q': q}

c = TestClient(app)
print(c.get('/branches/cse/students').json())
print(c.get('/branches/it/students?year=3&q=asha').json())
print(c.get('/branches/mech/students').status_code)
print(c.get('/branches/cse/students?year=two').status_code)`,
      expected: "{'branch': 'cse', 'year': 1, 'q': None}\n{'branch': 'it', 'year': 3, 'q': 'asha'}\n422\n422",
      explain: 'Query params use defaults when missing (`year=1`, `q=None`) and are converted from strings (`"3"` → 3). `mech` is not a member of the `Branch` Enum and `"two"` is not an int, so both give **422** validation errors.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `convert(value, type_name)` - what FastAPI does with a query string value and a type hint. `value` is always a string. Return the converted value or the string `\'422\'` if it cannot be converted:\n- `\'int\'`: digits with optional leading `-` → `int`\n- `\'float\'`: anything `float()` accepts → `float`\n- `\'bool\'`: `1, true, on, yes` → `True`; `0, false, off, no` → `False` (case-insensitive); else 422\n- `\'str\'`: unchanged',
      example: { title: 'try / except for conversion', code: "def to_number(s):\n    try:\n        return float(s)\n    except ValueError:\n        return None" },
      starter: `def convert(value, type_name):
    # TODO
    return value
`,
      solution: `def convert(value, type_name):
    if type_name == 'int':
        body = value[1:] if value.startswith('-') else value
        return int(value) if body.isdigit() else '422'
    if type_name == 'float':
        try:
            return float(value)
        except ValueError:
            return '422'
    if type_name == 'bool':
        v = value.lower()
        if v in ('1', 'true', 'on', 'yes'):
            return True
        if v in ('0', 'false', 'off', 'no'):
            return False
        return '422'
    return value
`,
      tests: [
        { call: "convert('42', 'int')", expect: 42 },
        { call: "convert('-7', 'int')", expect: -7 },
        { call: "convert('4.5', 'int')", expect: '422' },
        { call: "convert('99.5', 'float')", expect: 99.5 },
        { call: "convert('abc', 'float')", expect: '422' },
        { call: "convert('YES', 'bool')", expect: true },
        { call: "convert('off', 'bool')", expect: false },
        { call: "convert('maybe', 'bool')", expect: '422' },
        { call: "convert('Pune', 'str')", expect: 'Pune' },
      ],
      explain: 'Everything in a URL is text. FastAPI (through Pydantic) reads your **type hints** and converts each value, returning a 422 error with details when conversion fails - so your function body always receives correct types. Note `"4.5"` is not a valid int (Pydantic does not silently truncate).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `check_limits(value, ge=None, le=None, min_length=None, max_length=None)` that returns a list of error messages, like `Query()`/`Path()` constraints do:\n- `ge`: `f\'must be >= {ge}\'`  •  `le`: `f\'must be <= {le}\'` (for numbers)\n- `min_length`: `f\'at least {min_length} characters\'`  •  `max_length`: `f\'at most {max_length} characters\'` (for strings)\n\nOnly check the limits that were given; empty list = valid.',
      example: { title: 'optional checks', code: "def check_age(age, minimum=None):\n    errors = []\n    if minimum is not None and age < minimum:\n        errors.append(f'must be >= {minimum}')\n    return errors" },
      starter: `def check_limits(value, ge=None, le=None, min_length=None, max_length=None):
    errors = []
    # TODO
    return errors
`,
      solution: `def check_limits(value, ge=None, le=None, min_length=None, max_length=None):
    errors = []
    if ge is not None and value < ge:
        errors.append(f'must be >= {ge}')
    if le is not None and value > le:
        errors.append(f'must be <= {le}')
    if min_length is not None and len(value) < min_length:
        errors.append(f'at least {min_length} characters')
    if max_length is not None and len(value) > max_length:
        errors.append(f'at most {max_length} characters')
    return errors
`,
      tests: [
        { call: 'check_limits(10, ge=1, le=100)', expect: [] },
        { call: 'check_limits(0, ge=1, le=100)', expect: ['must be >= 1'] },
        { call: 'check_limits(500, ge=1, le=100)', expect: ['must be <= 100'] },
        { call: "check_limits('as', min_length=3, max_length=20)", expect: ['at least 3 characters'] },
        { call: "check_limits('a' * 25, max_length=20)", expect: ['at most 20 characters'] },
        { call: 'check_limits(0, ge=0)', expect: [], msg: 'ge means greater than OR EQUAL' },
      ],
      explain: '`ge`/`le` are inclusive (>=, <=) while `gt`/`lt` are exclusive. Checking `is not None` (not just `if ge:`) matters: `ge=0` is a real limit even though 0 is falsy. FastAPI shows these limits in the docs and returns all failures in the 422 response.',
    },
  ],
};
