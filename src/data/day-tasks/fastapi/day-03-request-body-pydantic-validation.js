export default {
  lesson: 'day-03-request-body-pydantic-validation',
  minutes: 35,
  intro: 'Practise Pydantic v2 models, Field() constraints, field_validator/model_validator and nested models, and write the validation a Pydantic model performs in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'An endpoint is `def create_student(student: Student):` where `Student` is a Pydantic `BaseModel`. Where does FastAPI read `student` from?',
      options: ['The query string', 'The URL path', 'The JSON request body', 'A cookie'],
      answer: 2,
      explain: 'A parameter whose type is a **Pydantic model** is read from the **request body** (JSON). Simple types (int, str ...) not in the path are query parameters. FastAPI validates the JSON against the model and returns 422 if it does not fit.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the field so `age` is required and must be between 16 and 60 (inclusive):\n\n```\nclass Student(BaseModel):\n    name: str\n    age: int = ______\n```',
      accept: ['Field(ge=16, le=60)', 'Field(le=60, ge=16)', 'Field(..., ge=16, le=60)', 'Field(..., le=60, ge=16)', 'Field(gt=15, lt=61)'],
      explain: '`Field(ge=16, le=60)` adds constraints while keeping the field required (no default given; `...` also means required). A body with `"age": 70` now returns 422 with "Input should be less than or equal to 60".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Pydantic v2 are TRUE? (choose all that apply)',
      options: [
        'model.model_dump() returns a dict (v1 used .dict())',
        '@field_validator("email") runs custom code for one field',
        '@model_validator(mode="after") can compare two fields, e.g. password and confirm_password',
        'Optional fields need a default, e.g. phone: str | None = None',
        'Pydantic never converts types: "25" for an int field always fails',
      ],
      answers: [0, 1, 2, 3],
      explain: 'v2 renamed `.dict()`/`.json()` to `model_dump()`/`model_dump_json()`. Field validators check one field, model validators see the whole object. A field without a default is required even if typed `str | None`. In the default (lax) mode Pydantic **does** convert `"25"` to 25; use `strict=True` to forbid that.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

class Address(BaseModel):
    city: str
    pin: str = Field(min_length=6, max_length=6)

class Student(BaseModel):
    name: str
    marks: list[int] = []
    address: Address

app = FastAPI()

@app.post('/students')
def create(s: Student):
    return {'name': s.name.upper(), 'total': sum(s.marks), 'city': s.address.city}

c = TestClient(app)
print(c.post('/students', json={'name': 'asha', 'marks': [80, '90'], 'address': {'city': 'Pune', 'pin': '411001'}}).json())
r = c.post('/students', json={'name': 'ravi', 'address': {'city': 'Nagpur', 'pin': '4400'}})
print(r.status_code, r.json()['detail'][0]['loc'])`,
      expected: "{'name': 'ASHA', 'total': 170, 'city': 'Pune'}\n422 ['body', 'address', 'pin']",
      explain: 'Nested JSON is validated by the nested `Address` model. In lax mode `"90"` is converted to 90, so total is 170. The second body has a 4-character pin, so FastAPI returns 422 and the error `loc` shows the exact path: body → address → pin.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `validate_registration(data)` that does what this Pydantic model would do:\n```\nclass Register(BaseModel):\n    username: str = Field(min_length=3, max_length=20)\n    email: EmailStr\n    age: int = Field(ge=13)\n    password: str = Field(min_length=8)\n    confirm_password: str\n```\nReturn `(errors, clean)`. `errors` is a dict `{field: message}` using exactly: `\'too short\'` / `\'too long\'` (username), `\'invalid email\'` (needs one `@` with text before it and a `.` in the part after it), `\'must be a number >= 13\'` (age: int, or a digit string which you convert), `\'too short\'` (password), and `\'passwords do not match\'` under key `\'confirm_password\'`. `clean` holds the converted values (without confirm_password) only when there are no errors, else `{}`. Missing keys count as empty strings.',
      example: { title: 'a field_validator in Pydantic', code: "@field_validator('username')\n@classmethod\ndef no_spaces(cls, v):\n    if ' ' in v:\n        raise ValueError('no spaces allowed')\n    return v.lower()" },
      starter: `def validate_registration(data):
    errors = {}
    # TODO
    return errors, {}
`,
      solution: `def validate_registration(data):
    errors = {}
    username = str(data.get('username', ''))
    if len(username) < 3:
        errors['username'] = 'too short'
    elif len(username) > 20:
        errors['username'] = 'too long'
    email = str(data.get('email', ''))
    local, at, domain = email.partition('@')
    if not (local and at and '.' in domain and '@' not in domain):
        errors['email'] = 'invalid email'
    age = data.get('age', '')
    if isinstance(age, str) and age.isdigit():
        age = int(age)
    if not (isinstance(age, int) and not isinstance(age, bool) and age >= 13):
        errors['age'] = 'must be a number >= 13'
    password = str(data.get('password', ''))
    if len(password) < 8:
        errors['password'] = 'too short'
    if data.get('confirm_password', '') != data.get('password', ''):
        errors['confirm_password'] = 'passwords do not match'
    if errors:
        return errors, {}
    return errors, {'username': username, 'email': email, 'age': age, 'password': password}
`,
      tests: [
        { call: "validate_registration({'username': 'asha_p', 'email': 'asha@gmail.com', 'age': '19', 'password': 'Secret@12', 'confirm_password': 'Secret@12'})", expect: [{}, { username: 'asha_p', email: 'asha@gmail.com', age: 19, password: 'Secret@12' }] },
        { call: "validate_registration({'username': 'ab', 'email': 'ab.gmail.com', 'age': 10, 'password': 'short', 'confirm_password': 'short'})", expect: [{ username: 'too short', email: 'invalid email', age: 'must be a number >= 13', password: 'too short' }, {}] },
        { call: "validate_registration({'username': 'ravi', 'email': 'ravi@mail.in', 'age': 21, 'password': 'Password1', 'confirm_password': 'Password2'})", expect: [{ confirm_password: 'passwords do not match' }, {}] },
        { call: "validate_registration({'username': 'x' * 21, 'email': 'a@b.c', 'age': 'twenty', 'password': 'Password1', 'confirm_password': 'Password1'})[0]", expect: { username: 'too long', age: 'must be a number >= 13' } },
      ],
      explain: 'Pydantic runs every field validator and collects **all** errors (FastAPI returns them together in the 422 `detail` list), converts lax values like `"19"` → 19, and finally runs the model validator that compares two fields. `confirm_password` is only needed for validation - real code would exclude it before saving.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `model_dump(data, exclude=(), exclude_none=False)` that copies a (possibly nested) dict like Pydantic\'s `model_dump()`:\n- keys in `exclude` are left out (top level only)\n- with `exclude_none=True`, keys whose value is `None` are left out at **every** level of nested dicts',
      example: { title: 'recursion over nested dicts', code: "def count_keys(d):\n    return sum(1 + (count_keys(v) if isinstance(v, dict) else 0) for v in d.values())" },
      starter: `def model_dump(data, exclude=(), exclude_none=False):
    # TODO
    return data
`,
      solution: `def model_dump(data, exclude=(), exclude_none=False):
    out = {}
    for key, value in data.items():
        if key in exclude:
            continue
        if exclude_none and value is None:
            continue
        if isinstance(value, dict):
            value = model_dump(value, exclude_none=exclude_none)
        out[key] = value
    return out
`,
      tests: [
        { call: "model_dump({'name': 'Asha', 'password': 'x', 'phone': None}, exclude=('password',))", expect: { name: 'Asha', phone: null } },
        { call: "model_dump({'name': 'Asha', 'phone': None, 'address': {'city': 'Pune', 'landmark': None}}, exclude_none=True)", expect: { name: 'Asha', address: { city: 'Pune' } } },
        { call: "(lambda d: (model_dump(d, exclude=('a',)), d)[1])({'a': 1, 'b': 2})", expect: { a: 1, b: 2 }, msg: 'The original dict must not be changed' },
      ],
      explain: '`model_dump(exclude={\'password\'})` keeps secrets out of logs and responses, and `exclude_none=True` / `exclude_unset=True` are handy for PATCH updates where you only want the fields the client actually sent. Build a **new** dict - mutating the input is a common bug.',
    },
  ],
};
