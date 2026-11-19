export default {
  lesson: 'day-11-configuration-deployment',
  minutes: 30,
  intro: 'Practise config classes, environment variables, .env files, Gunicorn and Render deployment, and write the config-loading logic yourself.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should the production `SECRET_KEY` and database password live?',
      options: ['Hard-coded in config.py and pushed to GitHub', 'In environment variables (e.g. Render dashboard / a .env file that is in .gitignore)', 'In a comment at the top of app.py', 'In the session cookie'],
      answer: 1,
      explain: 'Secrets go into **environment variables**: set in the hosting dashboard in production and in a local `.env` file (loaded by python-dotenv) during development. The `.env` file must be in `.gitignore`; anything pushed to Git should be treated as leaked.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Render **start command** that runs the app created by the factory `create_app()` in `app.py` with Gunicorn on the port Render provides:\n\n```\ngunicorn "______" --bind 0.0.0.0:$PORT\n```',
      accept: ['app:create_app()'],
      explain: 'Gunicorn takes `module:callable`. With a factory you write `"app:create_app()"` (the quotes are needed because of the brackets). For a plain global app it would be `app:app`. Binding to `0.0.0.0:$PORT` lets Render route traffic to the container.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which belong on a Flask **production checklist**? (choose all that apply)',
      options: ['DEBUG off', 'Run with Gunicorn / Waitress, not flask run', 'A strong random SECRET_KEY from the environment', 'SQLite file in the repo as the production database', 'Run flask db upgrade on deploy', 'SESSION_COOKIE_SECURE = True behind HTTPS'],
      answers: [0, 1, 2, 4, 5],
      explain: 'The dev server is single-process and not hardened; Gunicorn/Waitress are production WSGI servers. Debug off, secret from env, migrations on deploy and secure cookies are standard. Platforms like Render have ephemeral disks, so a SQLite file would be lost on every deploy - use PostgreSQL/MySQL.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      code: `import os
from flask import Flask

class Config:
    DEBUG = False
    PER_PAGE = 10

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    PER_PAGE = 25

CONFIGS = {'development': DevelopmentConfig, 'production': ProductionConfig}

os.environ['FLASK_CONFIG'] = 'production'
os.environ['FLASK_SHOP_NAME'] = 'UpSkillr Store'

app = Flask(__name__)
app.config.from_object(CONFIGS[os.environ.get('FLASK_CONFIG', 'development')])
app.config.from_prefixed_env()
print(app.config['DEBUG'], app.config['PER_PAGE'])
print(app.config['SHOP_NAME'])`,
      expected: 'False 25\nUpSkillr Store',
      explain: '`from_object` copies the UPPERCASE attributes of the class (including inherited ones): ProductionConfig keeps `DEBUG = False` from Config and overrides `PER_PAGE`. `from_prefixed_env()` loads every `FLASK_*` environment variable without the prefix, so `FLASK_SHOP_NAME` becomes `SHOP_NAME`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `parse_env(text)` - a mini python-dotenv. Turn the text of a `.env` file into a dict:\n- ignore blank lines and lines starting with `#`\n- split each line on the **first** `=`; strip spaces around key and value\n- remove one pair of surrounding quotes (`"..."` or `\'...\'`) from the value',
      example: { title: 'split only on the first =', code: "print('URL=postgres://u:p@h/db?a=b'.split('=', 1))\n# ['URL', 'postgres://u:p@h/db?a=b']" },
      starter: `def parse_env(text):
    env = {}
    # TODO
    return env
`,
      solution: `def parse_env(text):
    env = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key, value = key.strip(), value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in '"\\'':
            value = value[1:-1]
        env[key] = value
    return env
`,
      tests: [
        { call: "parse_env('SECRET_KEY=abc123\\nDEBUG=0')", expect: { SECRET_KEY: 'abc123', DEBUG: '0' } },
        { call: "parse_env('# database\\n\\nDATABASE_URL = postgres://u:p@host/db?ssl=true\\n')", expect: { DATABASE_URL: 'postgres://u:p@host/db?ssl=true' } },
        { call: "parse_env('APP_NAME=\"UpSkillr Store\"\\nMAIL_FROM=\\'noreply@upskillr.in\\'')", expect: { APP_NAME: 'UpSkillr Store', MAIL_FROM: 'noreply@upskillr.in' } },
      ],
      explain: 'Database URLs often contain `=` (query strings), so split with `split(\'=\', 1)`. Environment values are always **strings**: `DEBUG=0` gives `\'0\'`, which is truthy in Python - convert it explicitly (`os.environ.get(\'DEBUG\') == \'1\'`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Gunicorn\'s common rule of thumb for workers is `(2 × CPU cores) + 1`. Render also gives `DATABASE_URL` starting with `postgres://`, but SQLAlchemy needs `postgresql://`. Write:\n- `workers(cores)` → the worker count (at least 1 core is assumed even if 0 is passed)\n- `fix_db_url(url)` → replace a leading `postgres://` with `postgresql://`; leave other URLs unchanged',
      example: { title: 'replace only at the start', code: "u = 'http://site'\nif u.startswith('http://'):\n    u = 'https://' + u[len('http://'):]\nprint(u)   # https://site" },
      starter: `def workers(cores):
    # TODO
    return 1

def fix_db_url(url):
    # TODO
    return url
`,
      solution: `def workers(cores):
    return 2 * max(cores, 1) + 1

def fix_db_url(url):
    if url.startswith('postgres://'):
        return 'postgresql://' + url[len('postgres://'):]
    return url
`,
      tests: [
        { call: 'workers(2)', expect: 5 },
        { call: 'workers(4)', expect: 9 },
        { call: 'workers(0)', expect: 3 },
        { call: "fix_db_url('postgres://user:pw@dpg-x.render.com/shop')", expect: 'postgresql://user:pw@dpg-x.render.com/shop' },
        { call: "fix_db_url('postgresql://already/ok')", expect: 'postgresql://already/ok' },
        { call: "fix_db_url('sqlite:///app.db')", expect: 'sqlite:///app.db' },
      ],
      explain: 'Each Gunicorn worker is a separate process that handles one request at a time, so (2 × cores) + 1 keeps the CPU busy while some workers wait on I/O. SQLAlchemy 1.4+ removed the `postgres://` alias, so a naive `replace` could also break a URL that is already `postgresql://` if done wrongly - only replace the prefix.',
    },
  ],
};
