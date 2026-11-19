export default {
  lesson: 'day-10-final-project-docker-deployment',
  minutes: 40,
  intro: 'Revise the course through the Student Task Manager project: settings from environment variables, per-user task filters, Docker and deployment, and FastAPI vs Flask vs Django.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Dockerfile, why do we `COPY requirements.txt .` and `RUN pip install -r requirements.txt` **before** `COPY . .`?',
      options: ['Docker requires requirements.txt to be first', 'So the slow pip install layer is cached and only re-runs when requirements.txt changes', 'To make the image smaller', 'Because COPY . . deletes requirements.txt'],
      answer: 1,
      explain: 'Docker caches each layer. If code changes but dependencies do not, the `pip install` layer is reused and rebuilds take seconds. Copying all code first would invalidate the cache on every code change and reinstall everything.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'FastAPI generates OpenAPI docs and validates requests from type hints automatically',
        'Django gives an admin panel, ORM, auth and forms out of the box ("batteries included")',
        'Flask is a minimal WSGI framework where you choose your own extensions',
        'FastAPI cannot be used with a SQL database',
        'In Docker the server must listen on 0.0.0.0, not 127.0.0.1, to be reachable from outside the container',
      ],
      answers: [0, 1, 2, 4],
      explain: 'FastAPI = async, type-hint validation, automatic docs - great for APIs and ML serving. Django = full-stack batteries included. Flask = micro and flexible. FastAPI works fine with SQLAlchemy/SQLModel. Inside a container `127.0.0.1` means "only this container", so use `--host 0.0.0.0`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Dockerfile **CMD** that starts the app object `app` in `app/main.py` with Uvicorn on port 8000, reachable from outside the container:\n\n```\nCMD [______]\n```',
      accept: ['"uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"', '"uvicorn","app.main:app","--host","0.0.0.0","--port","8000"', '"uvicorn", "app.main:app", "--port", "8000", "--host", "0.0.0.0"', '"fastapi", "run", "app/main.py", "--port", "8000"'],
      explain: 'The exec (JSON array) form passes each argument separately: `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`. `app.main:app` = module path + app variable. (`fastapi run` also listens on 0.0.0.0 by default.)',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `load_settings(env)` - what `pydantic-settings` does with environment variables. `env` is a dict of strings. Return a dict:\n- `database_url`: default `\'sqlite:///./tasks.db\'`\n- `secret_key`: **required** - if missing or empty return the string `\'error: SECRET_KEY is required\'` instead of a dict\n- `access_token_minutes`: int, default 30\n- `debug`: bool, `true/1/yes` (any case) → True, default False\n- `cors_origins`: list from a comma-separated string (strip spaces, skip empties), default `[]`\n\nKeys in `env` are UPPER_CASE (e.g. `DATABASE_URL`).',
      example: { title: 'reading with defaults', code: "port = int(env.get('PORT', '8000'))\nhosts = [h.strip() for h in env.get('HOSTS', '').split(',') if h.strip()]" },
      starter: `def load_settings(env):
    # TODO
    return {}
`,
      solution: `def load_settings(env):
    secret = env.get('SECRET_KEY', '').strip()
    if not secret:
        return 'error: SECRET_KEY is required'
    return {
        'database_url': env.get('DATABASE_URL', 'sqlite:///./tasks.db'),
        'secret_key': secret,
        'access_token_minutes': int(env.get('ACCESS_TOKEN_MINUTES', '30')),
        'debug': env.get('DEBUG', '').lower() in ('true', '1', 'yes'),
        'cors_origins': [o.strip() for o in env.get('CORS_ORIGINS', '').split(',') if o.strip()],
    }
`,
      tests: [
        { call: "load_settings({'SECRET_KEY': 's3cr3t'})", expect: { database_url: 'sqlite:///./tasks.db', secret_key: 's3cr3t', access_token_minutes: 30, debug: false, cors_origins: [] } },
        { call: "load_settings({'SECRET_KEY': 'k', 'DATABASE_URL': 'postgresql://u:p@db:5432/tasks', 'ACCESS_TOKEN_MINUTES': '15', 'DEBUG': 'True', 'CORS_ORIGINS': 'http://localhost:5173, https://tasks.upskillr.in,'})", expect: { database_url: 'postgresql://u:p@db:5432/tasks', secret_key: 'k', access_token_minutes: 15, debug: true, cors_origins: ['http://localhost:5173', 'https://tasks.upskillr.in'] } },
        { call: "load_settings({'DEBUG': '1'})", expect: 'error: SECRET_KEY is required' },
        { call: "load_settings({'SECRET_KEY': 'k', 'DEBUG': 'false'})['debug']", expect: false },
      ],
      explain: 'Environment variables are always strings, so settings must be **converted** (`"15"` → 15, `"false"` → False - note `bool("false")` is True!). Failing fast when `SECRET_KEY` is missing is better than starting with an insecure default. `pydantic-settings` does all of this from a `BaseSettings` class with type hints.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write the service function behind `GET /tasks`: `list_tasks(tasks, user_id, status=None, priority=None, q=None, skip=0, limit=10)` that returns a dict `{\'total\': n, \'items\': [ids...]}`:\n1. only tasks of `user_id`\n2. optional filters: `status` (exact), `priority` (exact), `q` (case-insensitive substring of `title`)\n3. sort by `due` (a `YYYY-MM-DD` string) ascending, then `id`\n4. `total` counts after filtering; `items` are the ids after `skip`/`limit`',
      example: { title: 'sort by two keys', code: "rows.sort(key=lambda r: (r['due'], r['id']))" },
      starter: `def list_tasks(tasks, user_id, status=None, priority=None, q=None, skip=0, limit=10):
    # TODO
    return {'total': 0, 'items': []}
`,
      solution: `def list_tasks(tasks, user_id, status=None, priority=None, q=None, skip=0, limit=10):
    rows = [t for t in tasks if t['owner_id'] == user_id]
    if status:
        rows = [t for t in rows if t['status'] == status]
    if priority:
        rows = [t for t in rows if t['priority'] == priority]
    if q:
        rows = [t for t in rows if q.lower() in t['title'].lower()]
    rows.sort(key=lambda t: (t['due'], t['id']))
    return {'total': len(rows), 'items': [t['id'] for t in rows[skip:skip + limit]]}
`,
      tests: [
        { call: "list_tasks([{'id': 1, 'owner_id': 1, 'title': 'DBMS assignment', 'status': 'todo', 'priority': 'high', 'due': '2026-12-05'}, {'id': 2, 'owner_id': 1, 'title': 'Pay hostel fee', 'status': 'done', 'priority': 'high', 'due': '2026-12-01'}, {'id': 3, 'owner_id': 2, 'title': 'Gym', 'status': 'todo', 'priority': 'low', 'due': '2026-11-30'}, {'id': 4, 'owner_id': 1, 'title': 'FastAPI project', 'status': 'todo', 'priority': 'medium', 'due': '2026-12-01'}], 1)", expect: { total: 3, items: [2, 4, 1] } },
        { call: "list_tasks([{'id': 1, 'owner_id': 1, 'title': 'DBMS assignment', 'status': 'todo', 'priority': 'high', 'due': '2026-12-05'}, {'id': 2, 'owner_id': 1, 'title': 'Pay hostel fee', 'status': 'done', 'priority': 'high', 'due': '2026-12-01'}, {'id': 4, 'owner_id': 1, 'title': 'FastAPI project', 'status': 'todo', 'priority': 'medium', 'due': '2026-12-01'}], 1, status='todo')", expect: { total: 2, items: [4, 1] } },
        { call: "list_tasks([{'id': 1, 'owner_id': 1, 'title': 'DBMS assignment', 'status': 'todo', 'priority': 'high', 'due': '2026-12-05'}, {'id': 4, 'owner_id': 1, 'title': 'FastAPI project', 'status': 'todo', 'priority': 'medium', 'due': '2026-12-01'}], 1, q='dbms', priority='high')", expect: { total: 1, items: [1] } },
        { call: "list_tasks([{'id': i, 'owner_id': 7, 'title': f'T{i}', 'status': 'todo', 'priority': 'low', 'due': '2026-12-01'} for i in range(1, 8)], 7, skip=5, limit=5)", expect: { total: 7, items: [6, 7] } },
        { call: "list_tasks([{'id': 3, 'owner_id': 2, 'title': 'Gym', 'status': 'todo', 'priority': 'low', 'due': '2026-11-30'}], 1)", expect: { total: 0, items: [] } },
      ],
      explain: 'The owner filter comes first - users must never see other users\' tasks. ISO dates (`YYYY-MM-DD`) sort correctly as strings. Using `(due, id)` as the sort key makes the order stable, so pagination never shows a task twice. In the real project each step is a clause on the SQLAlchemy `select()`.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'The project\'s `/stats` endpoint shows, for user 1, how many tasks are in each `status`. Write the SQL: return `status` and `total`, ordered by `total` descending then `status`.',
      example: { title: 'GROUP BY with a filter', code: "SELECT city, COUNT(*) AS students\nFROM student\nWHERE course = 'BCA'\nGROUP BY city\nORDER BY students DESC;" },
      setup: `CREATE TABLE tasks (id INTEGER PRIMARY KEY, owner_id INTEGER, title TEXT, status TEXT, priority TEXT, due TEXT);
INSERT INTO tasks VALUES (1, 1, 'DBMS assignment', 'todo', 'high', '2026-12-05'), (2, 1, 'Pay hostel fee', 'done', 'high', '2026-12-01'), (3, 2, 'Gym', 'todo', 'low', '2026-11-30'), (4, 1, 'FastAPI project', 'in_progress', 'medium', '2026-12-01'), (5, 1, 'Resume', 'todo', 'low', '2026-12-10'), (6, 1, 'Mock interview', 'done', 'medium', '2026-11-28'), (7, 1, 'Docker notes', 'todo', 'low', '2026-12-12');`,
      starter: 'SELECT status FROM tasks;',
      solution: 'SELECT status, COUNT(*) AS total FROM tasks WHERE owner_id = 1 GROUP BY status ORDER BY total DESC, status;',
      ordered: true,
      explain: '`WHERE owner_id = 1` filters rows **before** grouping; `GROUP BY status` then counts per status. Forgetting the WHERE would mix in other users\' tasks. In SQLAlchemy: `select(Task.status, func.count()).where(Task.owner_id == user.id).group_by(Task.status)`.',
    },
  ],
};
