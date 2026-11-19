export default {
  lesson: 'day-05-dependency-injection',
  minutes: 30,
  intro: 'Practise Depends, class dependencies, sub-dependencies, yield dependencies and dependency_overrides, and build a tiny dependency injector in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `def items(p: Annotated[dict, Depends(pagination)]):` do?',
      options: ['Imports the pagination module', 'Calls pagination() for each request (with its own query params resolved) and passes the result as p', 'Runs pagination once when the app starts', 'Makes pagination a background task'],
      answer: 1,
      explain: 'FastAPI calls the dependency **for every request**, resolving its own parameters (query, headers, other dependencies) first, and injects the return value. You do not call `pagination()` yourself - you pass the function itself (no brackets) to `Depends`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the yield dependency that gives each request a DB session and always closes it:\n\n```\ndef get_db():\n    db = SessionLocal()\n    try:\n        ______\n    finally:\n        db.close()\n```',
      accept: ['yield db'],
      explain: 'Code before `yield` is **setup**, the yielded value is injected, and code after (`finally`) is **teardown** that runs after the response - even if the endpoint raised an error. `return db` would never close the session.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about dependencies are TRUE? (choose all that apply)',
      options: [
        'If two dependencies both depend on get_db, get_db runs only once per request by default (cached)',
        'app.dependency_overrides[get_db] = get_test_db swaps the dependency in tests',
        'APIRouter(dependencies=[Depends(verify_token)]) applies it to every route in the router',
        'A dependency must be an async function',
        'A class can be a dependency: Depends(Paginator) creates an instance from query params',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Sub-dependency results are cached per request (`use_cache=False` turns that off). Overrides are the standard way to test with a fake DB/user. Dependencies can be added at path, router or app level. They may be `def` or `async def`, functions or classes (any callable).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print?',
      code: `from typing import Annotated
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.testclient import TestClient

def pagination(page: int = 1, size: int = 10):
    return {'skip': (page - 1) * size, 'limit': size}

def current_user(x_token: Annotated[str | None, Header()] = None):
    if x_token != 'secret':
        raise HTTPException(status_code=401, detail='Not authenticated')
    return 'asha'

app = FastAPI()

@app.get('/courses')
def courses(p: Annotated[dict, Depends(pagination)], user: Annotated[str, Depends(current_user)]):
    return {'user': user, **p}

c = TestClient(app)
print(c.get('/courses?page=3&size=5', headers={'X-Token': 'secret'}).json())
print(c.get('/courses').status_code)
app.dependency_overrides[current_user] = lambda: 'test-user'
print(c.get('/courses').json())`,
      expected: "{'user': 'asha', 'skip': 10, 'limit': 5}\n401\n{'user': 'test-user', 'skip': 0, 'limit': 10}",
      explain: '`pagination` reads `page`/`size` from the query string: page 3 of size 5 skips 10. `x_token` maps to the `X-Token` header; without it the dependency raises 401 and the endpoint never runs. `dependency_overrides` replaces `current_user` with a fake, which is how you test protected routes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Build a tiny dependency injector. Dependencies are declared as a dict `DEPS = {name: (function, [names_it_depends_on])}`. Write `resolve(name, DEPS, cache=None)` that:\n1. resolves each dependency of `name` first (recursively), passing their results as positional arguments\n2. calls each function **at most once** per resolve (store results in `cache`, a dict)\n3. returns the result for `name`',
      example: { title: 'recursion with a cache', code: "def fib(n, cache={}):\n    if n < 2:\n        return n\n    if n not in cache:\n        cache[n] = fib(n - 1) + fib(n - 2)\n    return cache[n]" },
      starter: `CALLS = []

def get_db():
    CALLS.append('db')
    return 'DB'

def get_user(db):
    CALLS.append('user')
    return f'user-from-{db}'

def get_orders(db, user):
    CALLS.append('orders')
    return f'orders of {user} via {db}'

DEPS = {
    'db': (get_db, []),
    'user': (get_user, ['db']),
    'orders': (get_orders, ['db', 'user']),
}

def resolve(name, deps, cache=None):
    # TODO
    pass
`,
      solution: `CALLS = []

def get_db():
    CALLS.append('db')
    return 'DB'

def get_user(db):
    CALLS.append('user')
    return f'user-from-{db}'

def get_orders(db, user):
    CALLS.append('orders')
    return f'orders of {user} via {db}'

DEPS = {
    'db': (get_db, []),
    'user': (get_user, ['db']),
    'orders': (get_orders, ['db', 'user']),
}

def resolve(name, deps, cache=None):
    if cache is None:
        cache = {}
    if name in cache:
        return cache[name]
    func, needs = deps[name]
    args = [resolve(n, deps, cache) for n in needs]
    cache[name] = func(*args)
    return cache[name]
`,
      tests: [
        { call: "resolve('db', DEPS)", expect: 'DB' },
        { call: "resolve('orders', DEPS)", expect: 'orders of user-from-DB via DB' },
        { call: "(CALLS.clear(), resolve('orders', DEPS), list(CALLS))[2]", expect: ['db', 'user', 'orders'], msg: 'get_db must run only ONCE even though two dependencies need it' },
        { call: "(CALLS.clear(), resolve('user', DEPS), resolve('user', DEPS), len(CALLS))[3]", expect: 4, msg: 'Each new resolve() (new request) gets a fresh cache' },
      ],
      explain: 'This is FastAPI\'s dependency graph: sub-dependencies are solved first and each one is **cached per request**, so `get_db` opens one session even if several dependencies need it. A new request starts with an empty cache. Using a mutable default `cache={}` would wrongly share results across requests.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Class-based dependencies are classes whose `__init__` takes the query params. Write class `Paginator` with `__init__(self, page=1, size=10)` that clamps `page` to at least 1 and `size` to 1..100, stores `self.page`, `self.size`, `self.offset` (= (page-1)*size), and a method `apply(self, items)` that returns the slice for the page.',
      example: { title: 'clamping a number', code: "size = 500\nsize = max(1, min(size, 100))\nprint(size)   # 100" },
      starter: `class Paginator:
    def __init__(self, page=1, size=10):
        # TODO
        pass

    def apply(self, items):
        # TODO
        return items
`,
      solution: `class Paginator:
    def __init__(self, page=1, size=10):
        self.page = max(1, page)
        self.size = max(1, min(size, 100))
        self.offset = (self.page - 1) * self.size

    def apply(self, items):
        return items[self.offset:self.offset + self.size]
`,
      tests: [
        { call: 'Paginator(2, 3).apply(list(range(1, 11)))', expect: [4, 5, 6] },
        { call: '(lambda p: [p.page, p.size, p.offset])(Paginator(0, 500))', expect: [1, 100, 0] },
        { call: 'Paginator().apply(list(range(25)))', expect: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { call: 'Paginator(4, 10).apply(list(range(25)))', expect: [] },
      ],
      explain: 'With `p: Annotated[Paginator, Depends()]` FastAPI reads `page` and `size` from the query string and builds the object for you; the class gives you attributes and methods instead of a loose dict. Clamping protects the server from `?size=100000` requests.',
    },
  ],
};
