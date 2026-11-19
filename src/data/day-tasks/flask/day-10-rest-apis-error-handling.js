export default {
  lesson: 'day-10-rest-apis-error-handling',
  minutes: 35,
  intro: 'Practise REST design, jsonify, request.get_json, status codes and JSON error handlers, and write the validation and response-building logic of a JSON API.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A client sends `POST /api/books` with valid JSON and the book is created. Which status code should the API return?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      answer: 1,
      explain: '**201 Created** is the correct response for a successful POST that creates a resource (often with a `Location` header pointing to the new item). 200 is for successful reads/updates, 204 for a successful DELETE with no body, 302 is a browser redirect.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match HTTP verbs to REST actions on `/api/books`. Which are correct? (choose all that apply)',
      options: ['GET /api/books → list books', 'POST /api/books/5 → create book 5', 'PATCH /api/books/5 → update only some fields of book 5', 'DELETE /api/books/5 → delete book 5', 'GET /api/deleteBook?id=5 → good REST design'],
      answers: [0, 2, 3],
      explain: 'REST URLs name **resources** (nouns) and the HTTP verb says the action: GET read, POST create (on the collection), PUT replace, PATCH partial update, DELETE remove. Verbs in URLs like `/deleteBook` and changing data with GET are anti-patterns.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that reads the JSON body of the request (returns `None` instead of failing if the body is not JSON):\n\n```\n@app.post(\'/api/books\')\ndef create_book():\n    data = ______\n    if not data:\n        return {\'error\': \'JSON body required\'}, 400\n```',
      accept: ['request.get_json(silent=True)', 'request.get_json(silent = True)'],
      explain: '`request.get_json()` parses the JSON body; with `silent=True` it returns `None` for a missing/invalid body instead of raising a 400/415 error, so you can return your **own** JSON error. `request.json` and plain `get_json()` raise when the body is not JSON.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from flask import Flask, jsonify, request, abort

app = Flask(__name__)
BOOKS = {1: {'id': 1, 'title': 'Wings of Fire'}}

@app.errorhandler(404)
def not_found(e):
    return jsonify(error='not found'), 404

@app.get('/api/books/<int:book_id>')
def get_book(book_id):
    book = BOOKS.get(book_id) or abort(404)
    return jsonify(book)

@app.post('/api/books')
def add_book():
    data = request.get_json(silent=True) or {}
    if not data.get('title'):
        return jsonify(error='title is required'), 400
    new_id = max(BOOKS) + 1
    BOOKS[new_id] = {'id': new_id, 'title': data['title']}
    return jsonify(BOOKS[new_id]), 201

c = app.test_client()
print(c.get('/api/books/1').get_json())
print(c.get('/api/books/9').status_code, c.get('/api/books/9').get_json())
r = c.post('/api/books', json={'title': 'Godaan'})
print(r.status_code, r.get_json())
r = c.post('/api/books', json={})
print(r.status_code, r.get_json())`,
      expected: "{'id': 1, 'title': 'Wings of Fire'}\n404 {'error': 'not found'}\n201 {'id': 2, 'title': 'Godaan'}\n400 {'error': 'title is required'}",
      explain: '`abort(404)` raises an HTTPException that our `@app.errorhandler(404)` turns into **JSON** (instead of the default HTML page). The POST with a title gets 201 and the new object; the empty body fails validation with 400. `get_json()` on the test response parses the JSON back into a Python dict.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `validate_book(data, partial=False)` for the books API. Return `(errors, clean)`:\n- `title`: required non-empty string (stripped) → error `\'title is required\'`\n- `price`: required number (int or float, not bool) and >= 0 → error `\'price must be a positive number\'`\n- `clean` contains only `title` (stripped) and `price` (when valid)\n- With `partial=True` (PATCH) missing fields are **not** errors, but fields that are present are still validated.',
      example: { title: 'type checks', code: "print(isinstance(5.5, (int, float)))   # True\nprint(isinstance(True, bool))          # True  (bool is a subclass of int!)" },
      starter: `def validate_book(data, partial=False):
    errors, clean = {}, {}
    # TODO
    return errors, clean
`,
      solution: `def validate_book(data, partial=False):
    errors, clean = {}, {}
    if 'title' in data or not partial:
        title = data.get('title')
        if isinstance(title, str) and title.strip():
            clean['title'] = title.strip()
        else:
            errors['title'] = 'title is required'
    if 'price' in data or not partial:
        price = data.get('price')
        if isinstance(price, (int, float)) and not isinstance(price, bool) and price >= 0:
            clean['price'] = price
        else:
            errors['price'] = 'price must be a positive number'
    return errors, clean
`,
      tests: [
        { call: "validate_book({'title': ' Godaan ', 'price': 250, 'hack': 1})", expect: [{}, { title: 'Godaan', price: 250 }] },
        { call: "validate_book({'price': -5})", expect: [{ title: 'title is required', price: 'price must be a positive number' }, {}] },
        { call: "validate_book({'title': 'Gitanjali', 'price': '99'})", expect: [{ price: 'price must be a positive number' }, { title: 'Gitanjali' }] },
        { call: "validate_book({'price': 199.5}, partial=True)", expect: [{}, { price: 199.5 }] },
        { call: "validate_book({'title': ''}, partial=True)", expect: [{ title: 'title is required' }, {}] },
        { call: "validate_book({'title': 'X', 'price': True})", expect: [{ price: 'price must be a positive number' }, { title: 'X' }] },
      ],
      explain: 'Never save `request.get_json()` directly: unknown keys (`hack`) must be dropped and every field type-checked. `\'99\'` is a string, not a number. `True` is technically an `int` in Python, so bools need an explicit check. PATCH validates only the fields that were sent - that is the `partial` flag (DRF and Pydantic use the same idea).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Make every API error look the same. Write `api_error(status, message, details=None)` that returns a tuple `(body, status)` where `body` is:\n```\n{\'error\': {\'code\': status, \'name\': NAME, \'message\': message}}\n```\n`NAME` comes from `{400: \'Bad Request\', 401: \'Unauthorized\', 403: \'Forbidden\', 404: \'Not Found\', 409: \'Conflict\', 422: \'Unprocessable Entity\'}` (anything else → `\'Error\'`). If `details` is given, add it as `body[\'error\'][\'details\']`.',
      example: { title: 'returning (body, status) from a Flask view', code: "return {'error': 'not found'}, 404" },
      starter: `NAMES = {400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity'}

def api_error(status, message, details=None):
    # TODO
    return {}, 200
`,
      solution: `NAMES = {400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity'}

def api_error(status, message, details=None):
    err = {'code': status, 'name': NAMES.get(status, 'Error'), 'message': message}
    if details is not None:
        err['details'] = details
    return {'error': err}, status
`,
      tests: [
        { call: "api_error(404, 'Book 9 not found')", expect: [{ error: { code: 404, name: 'Not Found', message: 'Book 9 not found' } }, 404] },
        { call: "api_error(400, 'Invalid data', {'price': 'must be positive'})", expect: [{ error: { code: 400, name: 'Bad Request', message: 'Invalid data', details: { price: 'must be positive' } } }, 400] },
        { call: "api_error(418, 'teapot')[0]['error']['name']", expect: 'Error' },
      ],
      explain: 'A front-end team can handle errors with one piece of code only if every error has the same shape. In Flask you return this from `@app.errorhandler(HTTPException)` and from a custom `APIError` handler. Returning a `(dict, status)` tuple makes Flask jsonify the dict and set the status.',
    },
  ],
};
