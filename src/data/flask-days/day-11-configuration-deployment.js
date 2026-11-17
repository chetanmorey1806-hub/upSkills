export default {
  id: "day-11-configuration-deployment",
  title: "Configuration, Environment Variables, Deployment (Gunicorn, Render)",
  module: "Module 3: APIs & Deployment",
  day: 11,
  level: "Advanced",
  duration: "3 hours",
  summary: "Manage settings per environment with config classes, environment variables and .env files, keep secrets out of Git, add logging, run Flask with a production WSGI server (Gunicorn / Waitress), and deploy a Flask + PostgreSQL app to Render step by step.",
  objectives: [
    "Load configuration with app.config.from_object, from_prefixed_env, instance folder and python-dotenv",
    "Create Development, Testing and Production config classes and select one with an environment variable",
    "Keep secrets in environment variables and .env files that are excluded from Git",
    "Run the app with Gunicorn (Linux/macOS) or Waitress (Windows), choose worker counts and add ProxyFix",
    "Deploy to Render with a build command, start command, environment variables, PostgreSQL and migrations",
  ],
  theory: [
    {
      heading: "Configuration in Flask",
      content: "app.config is a dict-like object holding all settings: SECRET_KEY, DEBUG, TESTING, SQLALCHEMY_DATABASE_URI, MAX_CONTENT_LENGTH and your own keys. Only UPPERCASE keys are loaded from objects and files. You can load config from a class (from_object), a Python file (from_pyfile), environment variables with a prefix (from_prefixed_env: FLASK_SECRET_KEY -> SECRET_KEY), or JSON/TOML (from_file). A neat pattern is a base Config class plus subclasses for each environment. Analogy: a phone with profiles - Silent at office, Loud at home - same phone, different settings.",
      syntax: "class Config:\n    SECRET_KEY = os.environ.get('SECRET_KEY')\n\nclass ProductionConfig(Config):\n    DEBUG = False\n\napp.config.from_object(ProductionConfig)\napp.config.from_prefixed_env()   # FLASK_* env vars override",
      points: [
        "Development: DEBUG on, SQLite, verbose logs",
        "Testing: TESTING=True, in-memory DB, CSRF off",
        "Production: DEBUG off, real DB, secure cookies, secrets from environment",
        "Instance folder (instance/config.py) holds machine-specific config that is never committed",
      ],
    },
    {
      heading: "Environment Variables and .env Files",
      content: "An environment variable is a key=value set in the operating system/process, read in Python with os.environ.get('NAME', default). Secrets (SECRET_KEY, DB passwords, API keys) must live here, never in code, because code goes to GitHub. For local development, put them in a .env file and install python-dotenv: the flask command loads .env and .flaskenv automatically (in your own scripts call load_dotenv()). Add .env to .gitignore and commit a .env.example with dummy values so teammates know which variables are needed.",
      syntax: "# .env  (NOT committed)\nSECRET_KEY=8f42a73054b1749f8f58848be5e6502c\nDATABASE_URL=sqlite:///dev.db\n\n# .flaskenv  (committed, no secrets)\nFLASK_APP=wsgi\nFLASK_DEBUG=1",
      points: [
        "Set temporarily: Linux/macOS export SECRET_KEY=abc ; Windows PowerShell $env:SECRET_KEY=\"abc\" ; cmd set SECRET_KEY=abc",
        "VS Code: .env in the workspace is read by the Python extension for debugging (setting python.envFile)",
        "PyCharm: Run > Edit Configurations > Environment variables, or 'Paths to .env files' (EnvFile)",
        "Fail fast in production: os.environ['SECRET_KEY'] raises KeyError if missing - better than running with a weak default",
      ],
    },
    {
      heading: "Production WSGI Servers: Gunicorn and Waitress",
      content: "flask run uses Werkzeug's development server: single process, not hardened, debugger risk. In production use a WSGI server. Gunicorn ('Green Unicorn') is the standard on Linux: it starts a master process and several worker processes, each handling requests. Command: gunicorn 'wsgi:app' (module:variable) or with a factory gunicorn 'blogapp:create_app()'. A common worker formula is (2 x CPU cores) + 1. Gunicorn does not run on Windows - use Waitress there: waitress-serve --port=8000 wsgi:app. Usually a reverse proxy (Nginx, or the platform's load balancer like Render's) sits in front for HTTPS, static files and buffering.",
      syntax: "gunicorn --workers 3 --bind 0.0.0.0:8000 --access-logfile - 'wsgi:app'",
      points: [
        "--workers / -w: number of processes; --threads for threaded workers; --timeout for slow requests (default 30s)",
        "--bind 0.0.0.0:$PORT: listen on the port given by the platform",
        "Behind a proxy, wrap the app with werkzeug.middleware.proxy_fix.ProxyFix so url_for(_external=True) and request.scheme use https",
        "Analogy: flask run is a home kitchen; Gunicorn is a restaurant kitchen with several cooks; Nginx is the front-desk",
      ],
      tip: "Interview line: 'In production we serve Flask with a WSGI server like Gunicorn with multiple workers behind a reverse proxy like Nginx, with DEBUG off and secrets from environment variables.'",
    },
    {
      heading: "Deploying to Render",
      content: "Render is a cloud platform (PaaS) that builds and runs your app from a Git repository. You push code to GitHub; Render installs requirements and runs your start command. For Flask: create a Web Service, Runtime Python 3, Build Command 'pip install -r requirements.txt && flask --app wsgi db upgrade' (or run migrations in a pre-deploy command on paid plans), Start Command 'gunicorn wsgi:app'. Add environment variables in the dashboard (SECRET_KEY, DATABASE_URL, PYTHON_VERSION). Create a Render PostgreSQL database and copy its Internal Database URL into DATABASE_URL. Render sets the PORT variable and Gunicorn binds to it automatically (Render's default start sets the port; you can also pass --bind 0.0.0.0:$PORT).",
      points: [
        "Free instances sleep after inactivity - first request can take ~30-50 seconds",
        "Render's filesystem is ephemeral: SQLite files and uploads are lost on redeploy - use PostgreSQL and cloud storage (S3/Cloudinary)",
        "Some providers give URLs starting with postgres:// - SQLAlchemy needs postgresql:// (replace it in config)",
        "Every git push to the main branch triggers auto-deploy; check Logs tab for errors",
      ],
    },
    {
      heading: "Production Checklist",
      content: "Before going live, walk through this list. Most production bugs come from missing environment variables, debug left on, or migrations not applied.",
      points: [
        "DEBUG=False, strong random SECRET_KEY from env",
        "SESSION_COOKIE_SECURE=True, REMEMBER_COOKIE_SECURE=True, HTTPS only",
        "Database: PostgreSQL/MySQL, migrations applied (flask db upgrade)",
        "requirements.txt pinned (pip freeze), Python version pinned (.python-version or PYTHON_VERSION)",
        "Logging to stdout (platform collects it), error monitoring (e.g. Sentry)",
        "Static files: served by Nginx/CDN or WhiteNoise; user uploads on cloud storage",
        "Health-check endpoint /healthz returning 200",
      ],
    },
  ],
  examples: [
    {
      title: "Config classes + .env + config selection by environment",
      scenario: "Prepare the blog project (Day 9) so the same code runs on your laptop, in tests and in production.",
      steps: [
        "Open blog_project in VS Code or PyCharm",
        "pip install python-dotenv and add it to requirements.txt",
        "Create config.py, .env, .env.example, .flaskenv and update .gitignore as shown",
        "Generate a key: python -c \"import secrets; print(secrets.token_hex(32))\" and paste it into .env",
        "Run flask run - it loads .flaskenv and .env automatically; print the config in flask shell",
        "PyCharm: Run > Edit Configurations > your Flask/Python config > 'Paths to .env files' > select .env; VS Code: launch.json supports \"envFile\": \"\${workspaceFolder}/.env\"",
      ],
      code: `# Project tree (additions)
blog_project/
├── .env               # secrets - NOT in git
├── .env.example       # template - committed
├── .flaskenv          # non-secret flask settings - committed
├── .gitignore
├── config.py
├── wsgi.py
└── blogapp/__init__.py

# ---- .gitignore ----
.venv/
__pycache__/
*.pyc
.env
instance/
*.db

# ---- .env ----
APP_ENV=development
SECRET_KEY=8f42a73054b1749f8f58848be5e6502c9d1e0ab1c2f3d4e5f60718293a4b5c6d
DATABASE_URL=sqlite:///dev.db

# ---- .env.example ----
APP_ENV=development
SECRET_KEY=change-me
DATABASE_URL=sqlite:///dev.db

# ---- .flaskenv ----
FLASK_APP=wsgi
FLASK_DEBUG=1

# ---- config.py ----
import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def fix_db_url(url):
    # Heroku/Render style 'postgres://' -> SQLAlchemy needs 'postgresql://'
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-key")
    SQLALCHEMY_DATABASE_URI = fix_db_url(
        os.environ.get("DATABASE_URL", "sqlite:///" + os.path.join(BASE_DIR, "dev.db")))
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    POSTS_PER_PAGE = int(os.environ.get("POSTS_PER_PAGE", 5))
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = timedelta(hours=12)

    @classmethod
    def validate(cls):
        if not os.environ.get("SECRET_KEY"):
            raise RuntimeError("SECRET_KEY environment variable is required in production")


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


# ---- blogapp/__init__.py (top of create_app) ----
import logging
import os
from flask import Flask
from config import config_by_name


def create_app(config_name=None):
    config_name = config_name or os.environ.get("APP_ENV", "development")
    config_class = config_by_name[config_name]
    if hasattr(config_class, "validate"):
        config_class.validate()

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)
    app.config.from_pyfile("config.py", silent=True)   # optional instance/config.py overrides
    app.config.from_prefixed_env()                      # FLASK_XYZ env vars override XYZ

    logging.basicConfig(level=app.config["LOG_LEVEL"],
                        format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    app.logger.info("Starting app with %s", config_class.__name__)
    # ... init extensions, register blueprints (Day 9) ...
    return app


# ---- wsgi.py ----
from blogapp import create_app

app = create_app()


# ---- flask shell ----
>>> app.config["DEBUG"], app.config["SQLALCHEMY_DATABASE_URI"]`,
      result: `$ flask run
INFO blogapp: Starting app with DevelopmentConfig
 * Debug mode: on

>>> app.config["DEBUG"], app.config["SQLALCHEMY_DATABASE_URI"]
(True, 'sqlite:///dev.db')

$ APP_ENV=production flask run       (without SECRET_KEY set)
RuntimeError: SECRET_KEY environment variable is required in production`,
      explanation: "One codebase, three behaviours chosen by APP_ENV. Secrets come from .env locally and from the platform's environment in production. Validation makes production fail fast instead of running with an insecure default key.",
    },
    {
      title: "Run with Gunicorn (Linux/macOS) and Waitress (Windows) locally",
      scenario: "Before deploying, run the app exactly like production on your machine.",
      steps: [
        "pip install gunicorn (Linux/macOS/WSL) or pip install waitress (Windows)",
        "Add a /healthz route and ProxyFix in create_app",
        "Run the Gunicorn command and open http://127.0.0.1:8000",
        "Create gunicorn.conf.py so the command stays short",
        "PyCharm/VS Code: run these commands in the built-in Terminal (debugger breakpoints do not work under Gunicorn - use flask run for debugging)",
      ],
      code: `# ---- in create_app ----
from werkzeug.middleware.proxy_fix import ProxyFix

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


# ---- gunicorn.conf.py ----
import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))
timeout = 60
accesslog = "-"      # log requests to stdout
errorlog = "-"

# ---- Terminal: Linux / macOS ----
pip install gunicorn
APP_ENV=production SECRET_KEY=local-test-key gunicorn wsgi:app
# or with explicit options
gunicorn --workers 3 --bind 127.0.0.1:8000 wsgi:app
# factory form (no wsgi.py needed)
gunicorn "blogapp:create_app()"

# ---- Terminal: Windows ----
pip install waitress
waitress-serve --listen=127.0.0.1:8000 wsgi:app

# ---- requirements.txt (add) ----
gunicorn==23.0.0
python-dotenv==1.0.1
psycopg2-binary==2.9.9`,
      result: `[2026-11-17 10:00:00 +0530] [12345] [INFO] Starting gunicorn 23.0.0
[2026-11-17 10:00:00 +0530] [12345] [INFO] Listening at: http://0.0.0.0:8000 (12345)
[2026-11-17 10:00:00 +0530] [12345] [INFO] Using worker: sync
[2026-11-17 10:00:00 +0530] [12346] [INFO] Booting worker with pid: 12346
[2026-11-17 10:00:00 +0530] [12347] [INFO] Booting worker with pid: 12347
[2026-11-17 10:00:00 +0530] [12348] [INFO] Booting worker with pid: 12348
...
GET /healthz -> {"status": "ok"}`,
      explanation: "Gunicorn imports wsgi.py, takes the app variable, and forks several workers so multiple requests are handled in parallel. gunicorn.conf.py is picked up automatically from the current folder. ProxyFix trusts X-Forwarded-* headers from one proxy so generated URLs use https on Render.",
    },
    {
      title: "Deploy to Render with PostgreSQL step by step",
      scenario: "Publish the blog so friends can use it at https://asha-blog.onrender.com.",
      steps: [
        "Push the project to GitHub: git init, git add ., git commit -m \"ready for deploy\", create a repo, git push (VS Code: Source Control panel; PyCharm: Git > Share Project on GitHub)",
        "Render dashboard > New > PostgreSQL > name blog-db > Create; copy the Internal Database URL",
        "Render > New > Web Service > connect the GitHub repo",
        "Runtime: Python 3; Build Command: pip install -r requirements.txt && flask --app wsgi db upgrade; Start Command: gunicorn wsgi:app",
        "Environment: add APP_ENV=production, SECRET_KEY=<random 64 hex>, DATABASE_URL=<internal URL>, PYTHON_VERSION=3.12.7",
        "Click Create Web Service and watch the Logs tab; open the .onrender.com URL",
        "Optional: commit render.yaml (Blueprint spec) to recreate everything from code",
      ],
      code: `# ---- requirements.txt (final) ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.7
Flask-Login==0.6.3
Flask-WTF==1.2.1
email-validator==2.2.0
python-dotenv==1.0.1
gunicorn==23.0.0
psycopg2-binary==2.9.9

# ---- render.yaml (Infrastructure as Code, optional) ----
services:
  - type: web
    name: asha-blog
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt && flask --app wsgi db upgrade
    startCommand: gunicorn wsgi:app
    healthCheckPath: /healthz
    envVars:
      - key: APP_ENV
        value: production
      - key: PYTHON_VERSION
        value: 3.12.7
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: blog-db
          property: connectionString

databases:
  - name: blog-db
    plan: free

# ---- Git commands ----
git init
git add .
git commit -m "ready for deploy"
git branch -M main
git remote add origin https://github.com/<your-username>/asha-blog.git
git push -u origin main`,
      result: `Render build log:
==> Installing Python version 3.12.7...
==> Running build command 'pip install -r requirements.txt && flask --app wsgi db upgrade'...
Successfully installed Flask-3.0.3 ... gunicorn-23.0.0 psycopg2-binary-2.9.9
INFO  [alembic.runtime.migration] Running upgrade  -> 1a2b3c4d5e6f, initial
==> Build successful
==> Running 'gunicorn wsgi:app'
[INFO] Listening at: http://0.0.0.0:10000
==> Your service is live at https://asha-blog.onrender.com`,
      explanation: "Render clones the repo, installs requirements, applies migrations against PostgreSQL, then starts Gunicorn on the PORT it provides. Secrets live only in Render's environment settings. A new git push redeploys automatically.",
    },
    {
      title: "Pure Python demo: reading configuration from environment variables",
      scenario: "See how config classes pick up values from os.environ and why class attributes are evaluated at import time.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    pass


config_map = {"development": DevelopmentConfig, "production": ProductionConfig}

print("Before setting env vars:")
cfg = config_map["development"]
print(" ", cfg.SECRET_KEY, cfg.SQLALCHEMY_DATABASE_URI, cfg.DEBUG)

os.environ["SECRET_KEY"] = "s3cr3t-from-render"
os.environ["DATABASE_URL"] = "postgresql://user:pass@host/db"


class FreshProduction(ProductionConfig):
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


print("After setting env vars (production):")
print(" ", FreshProduction.SECRET_KEY, FreshProduction.SQLALCHEMY_DATABASE_URI, FreshProduction.DEBUG)
workers = 2 * 2 + 1
print("Gunicorn workers for 2 CPU cores:", workers)`,
      python: { files: { "main.py": `import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    pass


config_map = {"development": DevelopmentConfig, "production": ProductionConfig}

print("Before setting env vars:")
cfg = config_map["development"]
print(" ", cfg.SECRET_KEY, cfg.SQLALCHEMY_DATABASE_URI, cfg.DEBUG)

os.environ["SECRET_KEY"] = "s3cr3t-from-render"
os.environ["DATABASE_URL"] = "postgresql://user:pass@host/db"


class FreshProduction(ProductionConfig):
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


print("After setting env vars (production):")
print(" ", FreshProduction.SECRET_KEY, FreshProduction.SQLALCHEMY_DATABASE_URI, FreshProduction.DEBUG)
workers = 2 * 2 + 1
print("Gunicorn workers for 2 CPU cores:", workers)` } },
      result: `Before setting env vars:
  dev-only-key sqlite:///app.db True
After setting env vars (production):
  s3cr3t-from-render postgresql://user:pass@host/db False
Gunicorn workers for 2 CPU cores: 5`,
      explanation: "os.environ.get with a default gives safe local values. Class attributes are read when the class is defined, so environment variables must be set BEFORE the config module is imported (that is why the platform sets them before starting Gunicorn). The worker formula (2 x cores) + 1 gives 5 for 2 cores.",
    },
  ],
  interview: [
    { q: "How do you manage different configurations in Flask?", a: "Use a base Config class with subclasses (Development, Testing, Production) and load one with app.config.from_object, selected by an environment variable; secrets come from environment variables.", level: "Easy" },
    { q: "Why should SECRET_KEY not be hard-coded?", a: "Code is shared and stored in Git; anyone with the key can forge session cookies and CSRF tokens. Keep it in environment variables or a secrets manager.", level: "Easy" },
    { q: "What is the difference between .env and .flaskenv?", a: "Both are loaded by the flask CLI when python-dotenv is installed. Convention: .flaskenv holds non-secret Flask CLI settings (FLASK_APP, FLASK_DEBUG) and is committed; .env holds secrets and is git-ignored. .env values take precedence.", level: "Medium" },
    { q: "Why not use flask run in production?", a: "The Werkzeug dev server is single-process, not optimised or security-hardened, and debug mode exposes a code-execution console. Use Gunicorn/uWSGI/Waitress.", level: "Easy" },
    { q: "What is Gunicorn and how many workers should you use?", a: "A pre-fork WSGI HTTP server for UNIX. A master process manages worker processes; a common starting point is (2 x CPU cores) + 1 workers, then tune with load testing.", level: "Medium" },
    { q: "What is the role of Nginx in front of Gunicorn?", a: "Reverse proxy: terminates HTTPS, serves static files, buffers slow clients, load-balances and protects Gunicorn workers from slow connections.", level: "Medium" },
    { q: "What is ProxyFix and when is it needed?", a: "Werkzeug middleware that trusts X-Forwarded-For/Proto/Host headers from a known number of proxies so request.remote_addr, request.scheme and external URLs are correct behind Nginx or a PaaS load balancer.", level: "Hard" },
    { q: "Why can't you use SQLite on Render's free web service for real data?", a: "The filesystem is ephemeral; files are reset on each deploy or restart, so the SQLite database would be lost. Use a managed database like PostgreSQL.", level: "Medium" },
    { q: "How do you run migrations on deploy?", a: "Run flask db upgrade in the build/pre-deploy step (or a release command) with DATABASE_URL pointing to the production database, after installing requirements.", level: "Medium" },
    { q: "What does app.config.from_prefixed_env() do?", a: "Loads environment variables starting with FLASK_ into config without the prefix (FLASK_SECRET_KEY -> SECRET_KEY), parsing values as JSON where possible.", level: "Hard" },
    { q: "How do you run a Flask app in production on Windows?", a: "Gunicorn does not support Windows; use Waitress (waitress-serve wsgi:app) or deploy on Linux/WSL/containers.", level: "Medium" },
    { q: "What is a health-check endpoint?", a: "A cheap route like /healthz returning 200 that the platform or load balancer calls to know if the instance is alive and ready.", level: "Easy" },
  ],
  practice: [
    {
      task: "Add a MAIL settings group (MAIL_SERVER, MAIL_PORT, MAIL_USE_TLS) to Config read from env with sensible defaults.",
      hint: "int() for port; compare strings for booleans.",
      solution: `class Config:
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 25))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "false").lower() in ("1", "true", "yes")`,
    },
    {
      task: "Write a Procfile-style start command and gunicorn.conf.py that uses 4 workers and 2 threads per worker.",
      hint: "workers and threads settings; worker_class gthread is used automatically when threads > 1.",
      solution: `# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
threads = 2
timeout = 60

# Procfile
web: gunicorn wsgi:app`,
    },
    {
      task: "Log every request's method, path and status using an after_request hook.",
      hint: "@app.after_request receives and must return the response.",
      solution: `from flask import request

@app.after_request
def log_request(response):
    app.logger.info("%s %s -> %s", request.method, request.path, response.status_code)
    return response`,
    },
    {
      task: "Create a pytest test proving that ProductionConfig refuses to start without SECRET_KEY.",
      hint: "monkeypatch.delenv and pytest.raises(RuntimeError).",
      solution: `import pytest
from blogapp import create_app


def test_production_requires_secret(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(RuntimeError):
        create_app("production")`,
    },
  ],
  quiz: [
    {
      question: "Which file should be listed in .gitignore?",
      options: [".env", "requirements.txt", "config.py", ".env.example"],
      answer: 0,
      explanation: ".env contains secrets.",
    },
    {
      question: "Correct Gunicorn command when wsgi.py defines app?",
      options: ["gunicorn app:wsgi", "gunicorn wsgi.py", "gunicorn wsgi:app", "flask gunicorn"],
      answer: 2,
      explanation: "Syntax is module:variable.",
    },
    {
      question: "Recommended starting number of Gunicorn workers on a 4-core machine?",
      options: ["1", "4", "16", "9"],
      answer: 3,
      explanation: "(2 x 4) + 1 = 9.",
    },
    {
      question: "Which loads settings from a config class?",
      options: ["app.config.from_object(ProdConfig)", "app.load(ProdConfig)", "Flask(config=ProdConfig)", "app.config = ProdConfig"],
      answer: 0,
      explanation: "from_object copies UPPERCASE attributes.",
    },
    {
      question: "Why use PostgreSQL instead of SQLite on Render?",
      options: ["SQLite is not Python", "The disk is ephemeral so the SQLite file can be lost", "Render bans SQLite", "PostgreSQL is free forever"],
      answer: 1,
      explanation: "Local files do not persist across deploys.",
    },
  ],
};
