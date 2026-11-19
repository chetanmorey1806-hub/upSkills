export default {
  lesson: 'day-01-introduction-to-fastapi',
  minutes: 25,
  intro: 'Check what FastAPI, ASGI and Uvicorn are, predict what a first FastAPI app returns, and write the plain-Python logic of a JSON endpoint.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'FastAPI is built on top of which two libraries?',
      options: ['Flask and SQLAlchemy', 'Starlette (web/ASGI part) and Pydantic (data validation)', 'Django and DRF', 'Werkzeug and Jinja2'],
      answer: 1,
      explain: 'FastAPI = **Starlette** (routing, requests, responses, ASGI) + **Pydantic** (type-hint based validation and serialisation) + automatic OpenAPI docs. Werkzeug/Jinja2 are Flask\'s foundations.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about WSGI, ASGI and Uvicorn are TRUE? (choose all that apply)',
      options: [
        'ASGI supports async code, WebSockets and long-lived connections',
        'Uvicorn is an ASGI server that runs FastAPI apps',
        'WSGI is newer than ASGI and replaced it',
        'fastapi dev main.py starts a development server with auto-reload',
        'FastAPI apps must be run with python main.py only',
      ],
      answers: [0, 1, 3],
      explain: 'WSGI (2003) is synchronous; **ASGI** is its async successor and supports WebSockets. FastAPI is an ASGI app, so it runs on an ASGI server such as **Uvicorn** (`uvicorn main:app --reload` or the `fastapi dev main.py` CLI).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You run `uvicorn main:app --reload`. At which URL is the interactive **Swagger UI** documentation available by default? (path only)',
      accept: ['/docs', 'http://127.0.0.1:8000/docs', 'localhost:8000/docs', 'http://localhost:8000/docs', '127.0.0.1:8000/docs'],
      explain: 'FastAPI generates an OpenAPI schema at `/openapi.json` and serves **Swagger UI at `/docs`** and ReDoc at `/redoc` - no extra code. You can try every endpoint from `/docs` with the "Try it out" button.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'FastAPI\'s `TestClient` calls the app without starting a server. What does this program print?',
      code: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get('/')
def home():
    return {'message': 'Namaste FastAPI'}

@app.post('/echo')
def echo(data: dict):
    return {'you_sent': data, 'keys': len(data)}

client = TestClient(app)
r = client.get('/')
print(r.status_code, r.json())
print(client.post('/echo', json={'city': 'Pune'}).json())
print(client.get('/echo').status_code)`,
      expected: "200 {'message': 'Namaste FastAPI'}\n{'you_sent': {'city': 'Pune'}, 'keys': 1}\n405",
      explain: 'Returning a dict makes FastAPI send it as **JSON** with status 200. The `/echo` path exists only for POST, so a GET gets **405 Method Not Allowed**.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'An ML model is often served with FastAPI. Write the function the `/predict` endpoint would call: `predict_price(area_sqft, bedrooms)` returns a dict:\n- `price_lakh`: `area_sqft * 0.045 + bedrooms * 5`, rounded to 2 decimals\n- `category`: `\'budget\'` if price < 50, `\'mid\'` if < 100, otherwise `\'premium\'`',
      example: { title: 'returning a JSON-ready dict', code: "def bmi(weight, height):\n    value = round(weight / height ** 2, 1)\n    return {'bmi': value, 'healthy': 18.5 <= value <= 24.9}" },
      starter: `def predict_price(area_sqft, bedrooms):
    # TODO
    return {}
`,
      solution: `def predict_price(area_sqft, bedrooms):
    price = round(area_sqft * 0.045 + bedrooms * 5, 2)
    if price < 50:
        category = 'budget'
    elif price < 100:
        category = 'mid'
    else:
        category = 'premium'
    return {'price_lakh': price, 'category': category}
`,
      tests: [
        { call: 'predict_price(650, 1)', expect: { price_lakh: 34.25, category: 'budget' } },
        { call: 'predict_price(1250, 2)', expect: { price_lakh: 66.25, category: 'mid' } },
        { call: "predict_price(2500.5, 4)['category']", expect: 'premium' },
      ],
      explain: 'A FastAPI path operation usually just calls a plain function like this and returns its dict - FastAPI converts it to JSON. Keeping the logic in a separate function makes it easy to test without HTTP.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `route_table(routes)` that turns a list of `(method, path, name)` tuples into the summary Swagger shows: a dict `{path: [METHODS...]}` where methods are **upper-case** and **sorted**.',
      example: { title: 'grouping into a dict of lists', code: "groups = {}\nfor city, name in [('Pune', 'Asha'), ('Pune', 'Ravi')]:\n    groups.setdefault(city, []).append(name)\nprint(groups)   # {'Pune': ['Asha', 'Ravi']}" },
      starter: `def route_table(routes):
    # TODO
    return {}
`,
      solution: `def route_table(routes):
    table = {}
    for method, path, name in routes:
        table.setdefault(path, []).append(method.upper())
    return {p: sorted(m) for p, m in table.items()}
`,
      tests: [
        { call: "route_table([('get', '/students', 'list'), ('post', '/students', 'create'), ('get', '/students/{id}', 'detail')])", expect: { '/students': ['GET', 'POST'], '/students/{id}': ['GET'] } },
        { call: "route_table([('delete', '/items/{id}', 'd'), ('GET', '/items/{id}', 'g'), ('put', '/items/{id}', 'u')])", expect: { '/items/{id}': ['DELETE', 'GET', 'PUT'] } },
        { call: 'route_table([])', expect: {} },
      ],
      explain: 'One path can have several **operations** (one per HTTP method) - FastAPI calls them path operations. Note FastAPI writes path parameters as `{id}` (not Flask\'s `<id>`).',
    },
  ],
};
