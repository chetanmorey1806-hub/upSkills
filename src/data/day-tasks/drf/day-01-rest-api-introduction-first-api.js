export default {
  lesson: 'day-01-rest-api-introduction-first-api',
  minutes: 25,
  intro: 'Check REST basics (resources, methods, status codes, JSON), predict what a first DRF view returns, and write the plain-Python logic behind a JSON API.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which URL design follows REST best practice for "delete book 7"?',
      options: ['GET /api/deleteBook?id=7', 'POST /api/books/7/delete', 'DELETE /api/books/7', 'GET /api/books/delete/7'],
      answer: 2,
      explain: 'In REST the URL names the **resource** (`/api/books/7`, a noun, plural collection) and the **HTTP method** says the action (DELETE). Verbs in URLs and changing data with GET are anti-patterns - GET must be safe (no side effects).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'REST APIs are stateless: every request carries everything needed (e.g. its auth token)',
        'PUT replaces a resource; PATCH updates only some fields',
        '201 Created is returned after a successful POST',
        'An API should return 200 OK with {"error": "..."} for every error',
        'rest_framework must be added to INSTALLED_APPS',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Statelessness means the server keeps no client session between requests. PUT = full replace, PATCH = partial. Errors must use proper **4xx/5xx** codes so clients can react - "200 with an error body" breaks every HTTP tool. DRF is a Django app, so `\'rest_framework\'` goes in `INSTALLED_APPS`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the decorator that turns a function into a DRF API view accepting GET and POST:\n\n```\n______\ndef book_list(request):\n    ...\n```',
      accept: ["@api_view(['GET', 'POST'])", '@api_view(["GET", "POST"])', "@api_view(['POST', 'GET'])", '@api_view(["POST", "GET"])'],
      explain: '`@api_view([...])` wraps the function so it receives DRF\'s `Request` (with `request.data`) and can return `Response`. Methods not listed get **405 Method Not Allowed** automatically, and the browsable API is enabled.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This DRF view is called with DRF\'s `APIRequestFactory` (inside a configured Django project). What does it print?',
      code: `from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

@api_view(['GET'])
def hello(request):
    name = request.query_params.get('name', 'Guest')
    return Response({'message': f'Hello {name}', 'method': request.method})

factory = APIRequestFactory()
r = hello(factory.get('/api/hello/?name=Asha'))
print(r.status_code, r.data)
r = hello(factory.get('/api/hello/'))
print(r.data['message'])
print(hello(factory.post('/api/hello/')).status_code)`,
      expected: "200 {'message': 'Hello Asha', 'method': 'GET'}\nHello Guest\n405",
      explain: '`request.query_params` is DRF\'s name for the query string (Django: `request.GET`). `Response` takes plain Python data and renders it as JSON. POST is not in the allowed list, so DRF returns **405**.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `crud_action(method, has_id)` that maps a request to the REST action name:\n- `GET` without id → `\'list\'`, with id → `\'retrieve\'`\n- `POST` without id → `\'create\'`\n- `PUT` with id → `\'update\'`, `PATCH` with id → `\'partial_update\'`, `DELETE` with id → `\'destroy\'`\n- anything else → `\'405\'`\n\n`method` may be lower-case.',
      example: { title: 'a lookup table with tuple keys', code: "PRICES = {('tea', 'small'): 10, ('tea', 'large'): 15}\nprint(PRICES.get(('tea', 'large'), 0))   # 15" },
      starter: `def crud_action(method, has_id):
    # TODO
    return ''
`,
      solution: `ACTIONS = {
    ('GET', False): 'list',
    ('GET', True): 'retrieve',
    ('POST', False): 'create',
    ('PUT', True): 'update',
    ('PATCH', True): 'partial_update',
    ('DELETE', True): 'destroy',
}

def crud_action(method, has_id):
    return ACTIONS.get((method.upper(), has_id), '405')
`,
      tests: [
        { call: "crud_action('GET', False)", expect: 'list' },
        { call: "crud_action('get', True)", expect: 'retrieve' },
        { call: "crud_action('POST', False)", expect: 'create' },
        { call: "crud_action('PATCH', True)", expect: 'partial_update' },
        { call: "crud_action('DELETE', True)", expect: 'destroy' },
        { call: "crud_action('DELETE', False)", expect: '405', msg: 'Deleting the whole collection is not allowed' },
        { call: "crud_action('POST', True)", expect: '405' },
      ],
      explain: 'These six names are exactly the actions DRF ViewSets use (day 5): two URLs (`/books/` and `/books/{id}/`) × HTTP methods. Any other combination should answer **405 Method Not Allowed**.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Python objects must become JSON-friendly data before sending. Write `to_json_ready(book)` that converts a dict with Python types into JSON-safe values:\n- `datetime.date` → ISO string `\'YYYY-MM-DD\'`\n- `decimal.Decimal` → string (like DRF\'s DecimalField does)\n- `set` → sorted list\n- other values unchanged',
      example: { title: 'checking types', code: "import datetime\nd = datetime.date(2026, 1, 26)\nprint(isinstance(d, datetime.date), d.isoformat())   # True 2026-01-26" },
      starter: `import datetime, decimal

def to_json_ready(book):
    # TODO
    return book
`,
      solution: `import datetime, decimal

def to_json_ready(book):
    out = {}
    for key, value in book.items():
        if isinstance(value, datetime.date):
            value = value.isoformat()
        elif isinstance(value, decimal.Decimal):
            value = str(value)
        elif isinstance(value, set):
            value = sorted(value)
        out[key] = value
    return out
`,
      tests: [
        { call: "to_json_ready({'id': 1, 'title': 'Wings of Fire', 'price': decimal.Decimal('299.00'), 'published': datetime.date(1999, 1, 1), 'tags': {'biography', 'india'}})", expect: { id: 1, title: 'Wings of Fire', price: '299.00', published: '1999-01-01', tags: ['biography', 'india'] } },
        { call: "__import__('json').dumps(to_json_ready({'d': datetime.date(2026, 8, 15), 'p': decimal.Decimal('9.5')}))", expect: '{"d": "2026-08-15", "p": "9.5"}' },
      ],
      explain: '`json.dumps` cannot handle dates, Decimals or sets. Converting model data to JSON-safe primitives is **serialization** - the main job of DRF serializers (day 2). DRF sends Decimals as strings by default so money values never lose precision.',
    },
  ],
};
