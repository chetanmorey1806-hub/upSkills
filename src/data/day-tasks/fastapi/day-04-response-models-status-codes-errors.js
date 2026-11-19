export default {
  lesson: 'day-04-response-models-status-codes-errors',
  minutes: 30,
  intro: 'Practise response_model, status codes, HTTPException and custom exception handlers, and write the response-filtering and error-format logic yourself.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A user tries to register with an email that already exists. Which status code fits best?',
      options: ['200 OK', '404 Not Found', '409 Conflict', '500 Internal Server Error'],
      answer: 2,
      explain: '**409 Conflict** means the request clashes with the current state (a duplicate unique value). 404 is for something that does not exist, 422 for invalid input shape, 500 for a server bug. Picking precise codes lets the frontend react correctly.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that stops the request with a 404 JSON error `{"detail": "Student not found"}`:\n\n```\nstudent = DB.get(student_id)\nif student is None:\n    ______\n```',
      accept: ["raise HTTPException(status_code=404, detail='Student not found')", 'raise HTTPException(status_code=404, detail="Student not found")', "raise HTTPException(404, 'Student not found')", 'raise HTTPException(404, "Student not found")', "raise HTTPException(404, detail='Student not found')", 'raise HTTPException(404, detail="Student not found")', "raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Student not found')", 'raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")'],
      explain: '`HTTPException` is **raised**, not returned. FastAPI catches it and sends `{"detail": "..."}` with the status code. Writing `return HTTPException(...)` is a classic mistake: it would try to serialise the exception object with status 200.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `response_model` are TRUE? (choose all that apply)',
      options: [
        'It filters the returned data so only the fields of the output model are sent',
        'It lets you return a DB object that has a password_hash while the API never shows it',
        'It is documented automatically in /docs',
        'It validates the incoming request body',
        'Using the same model for input (with password) and output is the recommended pattern',
      ],
      answers: [0, 1, 2],
      explain: 'The response model controls the **output**: extra fields such as `password_hash` are dropped and the schema is shown in `/docs`. Input is validated by the parameter\'s type. The recommended pattern is separate schemas: `UserCreate` (with password) and `UserOut` (without).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient
from pydantic import BaseModel

class UserIn(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

app = FastAPI()
USERS = {}

@app.post('/users', response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserIn):
    if any(u['email'] == user.email for u in USERS.values()):
        raise HTTPException(status_code=409, detail='Email already registered')
    new = {'id': len(USERS) + 1, 'email': user.email, 'password': user.password}
    USERS[new['id']] = new
    return new

c = TestClient(app)
r = c.post('/users', json={'email': 'asha@upskillr.in', 'password': 'Secret@12'})
print(r.status_code, r.json())
r = c.post('/users', json={'email': 'asha@upskillr.in', 'password': 'x'})
print(r.status_code, r.json())`,
      expected: "201 {'id': 1, 'email': 'asha@upskillr.in'}\n409 {'detail': 'Email already registered'}",
      explain: 'The view returns a dict **with** the password, but `response_model=UserOut` filters it out. `status_code=201` sets the success code. The duplicate email raises `HTTPException(409)`, which becomes `{"detail": ...}`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `apply_response_model(obj, fields, exclude_none=False)` that does what `response_model` does: return a new dict with only the keys listed in `fields` (in that order). Fields missing in `obj` are set to `None`. With `exclude_none=True` (like `response_model_exclude_none`), keys whose value is `None` are dropped. `obj` may also be a **list** of dicts - then apply it to every item.',
      example: { title: 'picking keys', code: "row = {'id': 1, 'name': 'Asha', 'salary': 50000}\nprint({k: row.get(k) for k in ['id', 'name']})" },
      starter: `def apply_response_model(obj, fields, exclude_none=False):
    # TODO
    return obj
`,
      solution: `def apply_response_model(obj, fields, exclude_none=False):
    if isinstance(obj, list):
        return [apply_response_model(o, fields, exclude_none) for o in obj]
    out = {f: obj.get(f) for f in fields}
    if exclude_none:
        out = {k: v for k, v in out.items() if v is not None}
    return out
`,
      tests: [
        { call: "apply_response_model({'id': 1, 'email': 'a@b.in', 'password_hash': 'x9$..'}, ['id', 'email'])", expect: { id: 1, email: 'a@b.in' } },
        { call: "apply_response_model({'id': 2, 'email': 'r@b.in'}, ['id', 'email', 'phone'])", expect: { id: 2, email: 'r@b.in', phone: null } },
        { call: "apply_response_model({'id': 2, 'email': 'r@b.in'}, ['id', 'email', 'phone'], exclude_none=True)", expect: { id: 2, email: 'r@b.in' } },
        { call: "apply_response_model([{'id': 1, 'pw': 'a'}, {'id': 2, 'pw': 'b'}], ['id'])", expect: [{ id: 1 }, { id: 2 }] },
      ],
      explain: 'Filtering the output by a schema is a **security** feature: even if your DB object has `password_hash`, the response cannot leak it. For list endpoints use `response_model=list[UserOut]`, which applies the model to each item.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Professional APIs return one consistent error format. Write `format_validation_errors(errors)` that converts FastAPI\'s default 422 `detail` list into:\n```\n{\'success\': False, \'message\': \'Validation failed\', \'errors\': {\'field\': \'msg\', ...}}\n```\nEach input item looks like `{\'loc\': [\'body\', \'address\', \'pin\'], \'msg\': \'...\', \'type\': \'...\'}`. The field name is the `loc` parts **after the first one** joined with `.` (e.g. `\'address.pin\'`). If a field appears twice keep the first message.',
      example: { title: 'joining a list', code: "loc = ['query', 'page']\nprint('.'.join(str(p) for p in loc[1:]))   # page" },
      starter: `def format_validation_errors(errors):
    # TODO
    return {}
`,
      solution: `def format_validation_errors(errors):
    out = {}
    for e in errors:
        field = '.'.join(str(p) for p in e['loc'][1:])
        out.setdefault(field, e['msg'])
    return {'success': False, 'message': 'Validation failed', 'errors': out}
`,
      tests: [
        { call: "format_validation_errors([{'loc': ['body', 'email'], 'msg': 'value is not a valid email address', 'type': 'value_error'}])", expect: { success: false, message: 'Validation failed', errors: { email: 'value is not a valid email address' } } },
        { call: "format_validation_errors([{'loc': ['body', 'address', 'pin'], 'msg': 'too short', 'type': 'x'}, {'loc': ['query', 'page'], 'msg': 'should be >= 1', 'type': 'y'}, {'loc': ['body', 'address', 'pin'], 'msg': 'second', 'type': 'z'}])['errors']", expect: { 'address.pin': 'too short', page: 'should be >= 1' } },
        { call: "format_validation_errors([{'loc': ['body', 'marks', 2], 'msg': 'not an int', 'type': 'int'}])['errors']", expect: { 'marks.2': 'not an int' } },
        { call: 'format_validation_errors([])', expect: { success: false, message: 'Validation failed', errors: {} } },
      ],
      explain: 'In a real app this code lives inside `@app.exception_handler(RequestValidationError)` which returns `JSONResponse(status_code=422, content=...)`. `loc[0]` is where the value came from (body / query / path) and list indexes are ints, hence `str(p)`.',
    },
  ],
};
