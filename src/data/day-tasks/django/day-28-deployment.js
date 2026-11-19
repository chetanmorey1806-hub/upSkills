export default {
  lesson: 'day-28-deployment',
  minutes: 30,
  intro: 'Practise the production stack (Nginx → Gunicorn → Django), environment variables, collectstatic with WhiteNoise and Render/PythonAnywhere settings, and write the env-parsing and deploy checks in Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the stack browser → Nginx → Gunicorn → Django, what is Gunicorn\'s job?',
      options: ['It serves static files and HTTPS certificates', 'It is the WSGI server that runs several Django worker processes and passes requests to them', 'It is the database', 'It compiles Python to C'],
      answer: 1,
      explain: '**Gunicorn** is a production WSGI server: it loads `student_portal.wsgi:application` into several worker processes. **Nginx** sits in front: HTTPS, static/media files, buffering slow clients and proxying the rest to Gunicorn.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the start command for Render (project package `student_portal`):\n\n```\ngunicorn ______ --bind 0.0.0.0:$PORT --workers 3\n```',
      accept: ['student_portal.wsgi:application', 'student_portal.wsgi'],
      explain: 'Gunicorn needs `module:callable`; Django\'s `wsgi.py` defines `application` (if omitted, Gunicorn looks for `application` by default). Build command on Render is usually `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'WhiteNoise lets Gunicorn/Django serve the collected static files efficiently without Nginx',
        "WhiteNoise's middleware goes right after SecurityMiddleware",
        'STATIC_ROOT must be set before running collectstatic',
        'runserver is fine for production if DEBUG is False',
        'CSRF_TRUSTED_ORIGINS must include https://yourdomain for HTTPS form posts on some hosts',
      ],
      answers: [0, 1, 2, 4],
      explain: 'runserver is single-threaded, unaudited and not meant for the internet. WhiteNoise serves compressed, cache-busted static files from `STATIC_ROOT`. Behind proxies, Django 4+ checks the Origin header for POSTs, so add your HTTPS domain to `CSRF_TRUSTED_ORIGINS`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `production_settings(env)` that reads environment variables (dict of strings) like a `settings.py` using django-environ / os.environ:\n- `DEBUG`: True only for `\'1\'`, `\'true\'`, `\'yes\'` (any case); default False\n- `SECRET_KEY`: required → if missing return `\'ImproperlyConfigured: SECRET_KEY\'`\n- `ALLOWED_HOSTS`: comma-separated list, spaces stripped, empties removed; default `[]`\n- `CSRF_TRUSTED_ORIGINS`: `\'https://\' + host` for every allowed host that does not start with `.` or `localhost`/`127.0.0.1`\n- `SECURE_SSL_REDIRECT`: `not DEBUG`',
      example: { title: 'turning a string into a bool', code: "print(bool('False'))                  # True (!)\nprint('False'.lower() in ('1', 'true', 'yes'))   # False" },
      starter: `def production_settings(env):
    # TODO
    return {}
`,
      solution: `def production_settings(env):
    if not env.get('SECRET_KEY'):
        return 'ImproperlyConfigured: SECRET_KEY'
    debug = env.get('DEBUG', '').strip().lower() in ('1', 'true', 'yes')
    hosts = [h.strip() for h in env.get('ALLOWED_HOSTS', '').split(',') if h.strip()]
    origins = ['https://' + h for h in hosts if not h.startswith('.') and h not in ('localhost', '127.0.0.1')]
    return {
        'DEBUG': debug,
        'SECRET_KEY': env['SECRET_KEY'],
        'ALLOWED_HOSTS': hosts,
        'CSRF_TRUSTED_ORIGINS': origins,
        'SECURE_SSL_REDIRECT': not debug,
    }
`,
      tests: [
        { call: "production_settings({'SECRET_KEY': 'k', 'DEBUG': 'False', 'ALLOWED_HOSTS': 'studentportal.onrender.com, www.studentportal.in,localhost,'})", expect: { DEBUG: false, SECRET_KEY: 'k', ALLOWED_HOSTS: ['studentportal.onrender.com', 'www.studentportal.in', 'localhost'], CSRF_TRUSTED_ORIGINS: ['https://studentportal.onrender.com', 'https://www.studentportal.in'], SECURE_SSL_REDIRECT: true } },
        { call: "production_settings({'SECRET_KEY': 'k', 'DEBUG': 'TRUE'})", expect: { DEBUG: true, SECRET_KEY: 'k', ALLOWED_HOSTS: [], CSRF_TRUSTED_ORIGINS: [], SECURE_SSL_REDIRECT: false } },
        { call: "production_settings({'DEBUG': '1'})", expect: 'ImproperlyConfigured: SECRET_KEY' },
        { call: "production_settings({'SECRET_KEY': 'k', 'ALLOWED_HOSTS': '.portal.in'})['CSRF_TRUSTED_ORIGINS']", expect: [] },
      ],
      explain: 'Environment variables are strings - `bool(\'False\')` is True, a classic bug that leaves DEBUG on in production. Failing fast on a missing SECRET_KEY is better than starting with a fallback key that is checked into Git.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `deploy_checklist(cfg)` returning the list of failed items (in this order) for a release: `\'debug\'` if `cfg[\'DEBUG\']`; `\'static_root\'` if `STATIC_ROOT` is empty; `\'whitenoise\'` if `\'whitenoise.middleware.WhiteNoiseMiddleware\'` is in MIDDLEWARE but not **directly after** `\'django.middleware.security.SecurityMiddleware\'`; `\'database\'` if `DATABASE_ENGINE` ends with `sqlite3`; `\'gunicorn\'` if `\'gunicorn\'` is not in `REQUIREMENTS` (a list of package names, case-insensitive).',
      example: { title: 'position in a list', code: "mw = ['a', 'b', 'c']\ni = mw.index('b')\nprint(mw[i - 1])   # a" },
      starter: `def deploy_checklist(cfg):
    failed = []
    # TODO
    return failed
`,
      solution: `def deploy_checklist(cfg):
    failed = []
    if cfg.get('DEBUG'):
        failed.append('debug')
    if not cfg.get('STATIC_ROOT'):
        failed.append('static_root')
    mw = cfg.get('MIDDLEWARE', [])
    wn = 'whitenoise.middleware.WhiteNoiseMiddleware'
    sec = 'django.middleware.security.SecurityMiddleware'
    if wn in mw:
        i = mw.index(wn)
        if i == 0 or mw[i - 1] != sec:
            failed.append('whitenoise')
    if cfg.get('DATABASE_ENGINE', '').endswith('sqlite3'):
        failed.append('database')
    if 'gunicorn' not in [r.lower() for r in cfg.get('REQUIREMENTS', [])]:
        failed.append('gunicorn')
    return failed
`,
      tests: [
        { call: "deploy_checklist({'DEBUG': False, 'STATIC_ROOT': 'staticfiles', 'MIDDLEWARE': ['django.middleware.security.SecurityMiddleware', 'whitenoise.middleware.WhiteNoiseMiddleware', 'x'], 'DATABASE_ENGINE': 'django.db.backends.postgresql', 'REQUIREMENTS': ['Django', 'Gunicorn', 'whitenoise']})", expect: [] },
        { call: "deploy_checklist({'DEBUG': True, 'STATIC_ROOT': '', 'MIDDLEWARE': ['whitenoise.middleware.WhiteNoiseMiddleware', 'django.middleware.security.SecurityMiddleware'], 'DATABASE_ENGINE': 'django.db.backends.sqlite3', 'REQUIREMENTS': ['Django']})", expect: ['debug', 'static_root', 'whitenoise', 'database', 'gunicorn'] },
        { call: "deploy_checklist({'DEBUG': False, 'STATIC_ROOT': 's', 'MIDDLEWARE': [], 'DATABASE_ENGINE': 'django.db.backends.mysql', 'REQUIREMENTS': ['gunicorn']})", expect: [] },
      ],
      explain: 'Automating a checklist (or running `manage.py check --deploy` in CI) catches the usual deploy failures: DEBUG on, missing STATIC_ROOT (collectstatic fails), mis-ordered WhiteNoise, an SQLite file on a host with an ephemeral disk, and forgetting to add gunicorn to requirements.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Gunicorn only knows the **WSGI** contract: call `application(environ, start_response)`. What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `import io
from django.core.wsgi import get_wsgi_application
from django.http import HttpResponse
from django.urls import path

def health(request):
    return HttpResponse('ok')

urlpatterns = [path('health/', health)]

application = get_wsgi_application()
print(type(application).__name__)

statuses = []
def start_response(status, headers):
    statuses.append(status)

def call(path):
    environ = {'REQUEST_METHOD': 'GET', 'PATH_INFO': path, 'SERVER_NAME': 'localhost',
               'SERVER_PORT': '8000', 'wsgi.url_scheme': 'http', 'wsgi.input': io.BytesIO()}
    return b''.join(application(environ, start_response)).decode()

print(call('/health/'), statuses[-1])
call('/nope/')
print(statuses[-1])`,
      expected: 'WSGIHandler\nok 200 OK\n404 Not Found',
      explain: '`wsgi.py` exposes `application = get_wsgi_application()`, a `WSGIHandler`. Gunicorn builds the `environ` dict from the HTTP request, calls the application and sends back the status, headers and body - this is all a WSGI server does. A `/health/` URL like this is what Render/Railway health checks call.',
    },
  ],
};
