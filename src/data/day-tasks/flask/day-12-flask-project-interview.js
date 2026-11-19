export default {
  lesson: 'day-12-flask-project-interview',
  minutes: 40,
  intro: 'Revise the whole Flask course through the TaskFlow todo project: ownership checks, filters, pagination, a JSON API and the interview questions you will be asked.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In TaskFlow a logged-in user opens `/todos/42/edit`, but todo 42 belongs to someone else. What is the best response?',
      options: ['Show the edit form anyway - the user is logged in', '404 Not Found (query only the current user\'s todos, so it "does not exist" for them)', '500 Internal Server Error', 'Redirect to the login page'],
      answer: 1,
      explain: 'Logged in ≠ allowed. Query with the owner filter: `db.first_or_404(db.select(Todo).filter_by(id=42, user_id=current_user.id))`. Returning **404** (or 403) prevents users from editing - or even discovering - other users\' data. Forgetting this check is the most common security bug in student projects (IDOR).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements about Flask are TRUE? (choose all that apply)',
      options: [
        'The application context gives access to current_app and g; the request context gives request and session',
        'g is a per-request storage object, reset for every request',
        'Flask is asynchronous by default like FastAPI',
        'A Blueprint is a way to organise a group of routes, templates and static files',
        'flash() messages survive forever until deleted manually',
      ],
      answers: [0, 1, 3],
      explain: '`current_app`/`g` live in the app context, `request`/`session` in the request context; `g` is cleared after each request. Flask is a **WSGI** (sync) framework - it supports `async def` views but runs them in a thread per request, unlike ASGI FastAPI. Flashed messages are shown once.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the query that lists only the current user\'s todos (SQLAlchemy 2.0 style):\n\n```\nstmt = db.select(Todo).filter_by(______).order_by(Todo.created_at.desc())\n```',
      accept: ['user_id=current_user.id', 'owner_id=current_user.id', 'user=current_user', 'owner=current_user'],
      explain: '`filter_by(user_id=current_user.id)` adds `WHERE user_id = ?`. Every list, detail, update and delete query in a multi-user app must include this owner filter - doing it in the query is safer than checking after loading.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'This is a slice of the TaskFlow JSON API (without the database). What does it print?',
      code: `from flask import Flask, jsonify, request

app = Flask(__name__)
TODOS = [
    {'id': 1, 'title': 'Learn Flask', 'done': True, 'user_id': 1},
    {'id': 2, 'title': 'Build API', 'done': False, 'user_id': 1},
    {'id': 3, 'title': 'Buy milk', 'done': False, 'user_id': 2},
]

@app.get('/api/todos')
def list_todos():
    uid = int(request.headers.get('X-User', 0))
    status = request.args.get('status', 'all')
    items = [t for t in TODOS if t['user_id'] == uid]
    if status == 'done':
        items = [t for t in items if t['done']]
    elif status == 'pending':
        items = [t for t in items if not t['done']]
    return jsonify(count=len(items), titles=[t['title'] for t in items])

c = app.test_client()
print(c.get('/api/todos', headers={'X-User': '1'}).get_json())
print(c.get('/api/todos?status=pending', headers={'X-User': '1'}).get_json())
print(c.get('/api/todos').get_json()['count'])`,
      expected: "{'count': 2, 'titles': ['Learn Flask', 'Build API']}\n{'count': 1, 'titles': ['Build API']}\n0",
      explain: 'The owner filter runs **first**, then the status filter. Without a user header uid is 0, so nobody\'s todos are returned. (In the real project `current_user` from Flask-Login replaces the header.)',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write the logic behind TaskFlow\'s list page: `list_todos(todos, user_id, status=\'all\', q=\'\', page=1, per_page=5)` returns a dict `{\'items\': [...titles...], \'total\': n, \'pages\': p}`:\n1. keep only todos of `user_id`\n2. `status`: `\'done\'` / `\'pending\'` / `\'all\'`\n3. `q`: case-insensitive substring of the title (empty = no filter)\n4. sort by `id` descending (newest first)\n5. `total` and `pages` are computed **after** filtering; `items` are the titles on that page',
      example: { title: 'filter, sort, slice', code: "rows = [r for r in rows if r['city'] == 'Pune']\nrows.sort(key=lambda r: r['id'], reverse=True)\npage_rows = rows[(page - 1) * size: page * size]" },
      starter: `def list_todos(todos, user_id, status='all', q='', page=1, per_page=5):
    # TODO
    return {'items': [], 'total': 0, 'pages': 0}
`,
      solution: `import math

def list_todos(todos, user_id, status='all', q='', page=1, per_page=5):
    rows = [t for t in todos if t['user_id'] == user_id]
    if status == 'done':
        rows = [t for t in rows if t['done']]
    elif status == 'pending':
        rows = [t for t in rows if not t['done']]
    if q:
        rows = [t for t in rows if q.lower() in t['title'].lower()]
    rows.sort(key=lambda t: t['id'], reverse=True)
    total = len(rows)
    start = (page - 1) * per_page
    return {
        'items': [t['title'] for t in rows[start:start + per_page]],
        'total': total,
        'pages': math.ceil(total / per_page) if total else 0,
    }
`,
      tests: [
        { call: "list_todos([{'id': i, 'title': f'Task {i}', 'done': i % 2 == 0, 'user_id': 1 if i < 9 else 2} for i in range(1, 11)], 1)", expect: { items: ['Task 8', 'Task 7', 'Task 6', 'Task 5', 'Task 4'], total: 8, pages: 2 } },
        { call: "list_todos([{'id': i, 'title': f'Task {i}', 'done': i % 2 == 0, 'user_id': 1 if i < 9 else 2} for i in range(1, 11)], 1, page=2)", expect: { items: ['Task 3', 'Task 2', 'Task 1'], total: 8, pages: 2 } },
        { call: "list_todos([{'id': i, 'title': f'Task {i}', 'done': i % 2 == 0, 'user_id': 1 if i < 9 else 2} for i in range(1, 11)], 1, status='done')", expect: { items: ['Task 8', 'Task 6', 'Task 4', 'Task 2'], total: 4, pages: 1 } },
        { call: "list_todos([{'id': 1, 'title': 'Pay Fees', 'done': False, 'user_id': 3}, {'id': 2, 'title': 'Study Flask', 'done': False, 'user_id': 3}, {'id': 3, 'title': 'pay rent', 'done': True, 'user_id': 3}], 3, q='PAY')", expect: { items: ['pay rent', 'Pay Fees'], total: 2, pages: 1 } },
        { call: "list_todos([{'id': 1, 'title': 'A', 'done': False, 'user_id': 1}], 2)", expect: { items: [], total: 0, pages: 0 } },
      ],
      explain: 'The order matters: owner filter → other filters → sort → count → slice. Counting **after** the filters makes the "Page 1 of 2" text correct. In the real app each step is a clause on the same `select()` (`where`, `order_by`, then `db.paginate`) so the database does the work.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'The TaskFlow dashboard shows per-user stats. Write one query that returns `username`, `total` (all todos) and `done` (completed todos) for every user, including users with no todos, ordered by `username`.',
      example: { title: 'counting with a condition', code: "SELECT c.name, COUNT(o.id) AS orders,\n       SUM(CASE WHEN o.paid = 1 THEN 1 ELSE 0 END) AS paid\nFROM customer c LEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id;" },
      setup: `CREATE TABLE user (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL);
CREATE TABLE todo (id INTEGER PRIMARY KEY, title TEXT, done INTEGER DEFAULT 0, user_id INTEGER REFERENCES user(id));
INSERT INTO user VALUES (1, 'asha'), (2, 'ravi'), (3, 'zoya');
INSERT INTO todo VALUES (1, 'Learn Flask', 1, 1), (2, 'Build API', 0, 1), (3, 'Deploy', 1, 1), (4, 'Buy milk', 0, 2);`,
      starter: 'SELECT username FROM user;',
      solution: 'SELECT u.username, COUNT(t.id) AS total, COALESCE(SUM(t.done), 0) AS done FROM user u LEFT JOIN todo t ON t.user_id = u.id GROUP BY u.id ORDER BY u.username;',
      ordered: true,
      explain: 'LEFT JOIN keeps `zoya` who has no todos. `COUNT(t.id)` counts 0 for her, and `SUM(t.done)` would be NULL, so wrap it in `COALESCE(..., 0)` (or use `SUM(CASE WHEN t.done = 1 THEN 1 ELSE 0 END)`). In SQLAlchemy you would build this with `func.count` and `func.sum` + `group_by`.',
    },
  ],
};
