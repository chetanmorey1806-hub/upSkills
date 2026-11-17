export default {
  id: "day-12-flask-project-interview",
  title: "Flask Project (Blog / Todo App) and Interview Questions",
  module: "Module 3: APIs & Deployment",
  day: 12,
  level: "Advanced",
  duration: "4 hours",
  summary: "Build a complete multi-user Todo App that uses everything from the course - application factory, blueprints, Flask-SQLAlchemy models, Flask-Migrate, Flask-Login, Flask-WTF forms, flash messages, a JSON API, tests and Render deployment - then revise with 25 Flask interview questions.",
  objectives: [
    "Plan a Flask project: features, models, URL map and folder structure",
    "Implement authentication, per-user todo CRUD with ownership checks, filters and pagination",
    "Expose a JSON API for the same data and handle errors consistently",
    "Write pytest tests with the application factory and deploy with Gunicorn on Render",
    "Answer the most common Flask interview questions with confidence",
  ],
  theory: [
    {
      heading: "Project Plan: TaskFlow (Multi-user Todo App)",
      content: "Before coding, write down features, data and URLs - like an architect drawing a plan before building a house. Features: register/login/logout; each user sees only their own todos; create, edit, toggle done, delete; filter All/Active/Completed; due date and priority; a JSON API at /api/todos for a future mobile app. Data: User (1) -> (many) Todo. Blueprints: main (landing), auth (accounts), todos (HTML CRUD), api (JSON).",
      points: [
        "Models: User(id, username, email, password_hash), Todo(id, title, notes, priority, due_date, done, created_at, user_id)",
        "URL map: /, /auth/register, /auth/login, /auth/logout, /todos/, /todos/new, /todos/<id>/edit, /todos/<id>/toggle, /todos/<id>/delete, /api/todos",
        "Security: login_required on every todo route, ownership check (403), CSRF on all forms, hashed passwords",
      ],
    },
    {
      heading: "Folder Structure and Responsibilities",
      content: "We use the factory + blueprints layout from Day 9. Each file has one job: config.py (settings), extensions.py (db, migrate, login_manager, csrf), models.py (tables), forms.py per blueprint (validation), routes.py per blueprint (request handling), templates (presentation). This separation of concerns makes it easy to find bugs and to work in a team.",
      points: [
        "taskflow/__init__.py -> create_app()",
        "taskflow/auth, taskflow/todos, taskflow/api -> blueprints",
        "tests/ -> pytest with in-memory SQLite",
        "wsgi.py -> entry point for Gunicorn",
      ],
    },
    {
      heading: "Ownership and Authorization",
      content: "Logged-in is not enough: user A must not edit user B's todo by changing the id in the URL (/todos/7/edit). This bug is called IDOR (Insecure Direct Object Reference). Always load objects through the current user: get_user_todo(id) returns the todo only if todo.user_id == current_user.id, else 404 (hiding that it exists) or 403.",
      syntax: "def get_user_todo(todo_id):\n    todo = db.get_or_404(Todo, todo_id)\n    if todo.user_id != current_user.id:\n        abort(404)\n    return todo",
    },
    {
      heading: "Development Workflow",
      content: "A clean workflow: create venv -> install -> flask db init/migrate/upgrade -> flask run --debug -> write tests -> pytest -> git commit -> push -> Render deploys. Use the IDE's strengths: VS Code (Python + Pylance extensions, Testing panel, REST Client) and PyCharm (Flask run configuration, Database tool window, built-in HTTP client and pytest runner).",
      points: [
        "Commit migrations together with model changes",
        "Seed demo data with a custom CLI command (flask seed)",
        "Keep the README with setup commands",
      ],
    },
    {
      heading: "How to Present This Project in an Interview",
      content: "Explain it in 4 lines: problem, stack, features, your learning. Example: 'TaskFlow is a multi-user todo manager built with Flask 3 using the application factory and blueprints. It uses Flask-SQLAlchemy with Flask-Migrate on PostgreSQL, Flask-Login with Werkzeug password hashing, Flask-WTF forms with CSRF, and exposes a JSON API with consistent error handling. It is tested with pytest and deployed on Render with Gunicorn.' Be ready to explain ownership checks, N+1 avoidance, migrations and why the dev server is not used in production.",
      tip: "Keep the GitHub repo clean: README with screenshots, requirements.txt, .env.example, tests passing, live Render link.",
    },
  ],
  examples: [
    {
      title: "TaskFlow part 1: setup, config, extensions, models and factory",
      scenario: "Create the backbone of the project so that later parts only add blueprints.",
      steps: [
        "Create a folder taskflow_project; VS Code: open folder, python -m venv .venv, select interpreter; PyCharm: New Project > Pure Python (or Flask in Professional) with a new venv",
        "Create requirements.txt and run pip install -r requirements.txt",
        "Create all files of the tree (PyCharm: New > Python Package creates folders with __init__.py)",
        "Create .env from .env.example",
        "Run flask db init, flask db migrate -m \"users and todos\", flask db upgrade (FLASK_APP=wsgi comes from .flaskenv)",
        "Run flask seed to create a demo user, then flask run",
      ],
      code: `# Project tree
taskflow_project/
├── .env / .env.example / .flaskenv / .gitignore
├── config.py
├── wsgi.py
├── gunicorn.conf.py
├── requirements.txt
├── migrations/
├── tests/
│   ├── conftest.py
│   └── test_todos.py
└── taskflow/
    ├── __init__.py
    ├── extensions.py
    ├── models.py
    ├── templates/
    │   ├── base.html
    │   ├── _form_macros.html
    │   ├── 404.html
    │   ├── auth/login.html, auth/register.html
    │   └── todos/list.html, todos/form.html
    ├── static/css/app.css
    ├── auth/__init__.py, forms.py, routes.py
    ├── todos/__init__.py, forms.py, routes.py
    └── api/__init__.py, routes.py

# ---- requirements.txt ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.7
Flask-Login==0.6.3
Flask-WTF==1.2.1
email-validator==2.2.0
python-dotenv==1.0.1
gunicorn==23.0.0
psycopg2-binary==2.9.9
pytest==8.3.3

# ---- .flaskenv ----
FLASK_APP=wsgi
FLASK_DEBUG=1

# ---- .env.example ----
APP_ENV=development
SECRET_KEY=change-me
DATABASE_URL=sqlite:///taskflow.db

# ---- config.py ----
import os


def _db_url():
    url = os.environ.get("DATABASE_URL", "sqlite:///taskflow.db")
    return url.replace("postgres://", "postgresql://", 1)


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure")
    SQLALCHEMY_DATABASE_URI = _db_url()
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    TODOS_PER_PAGE = 8


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True


config_by_name = {"development": DevelopmentConfig, "testing": TestingConfig,
                  "production": ProductionConfig}


# ---- taskflow/extensions.py ----
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
migrate = Migrate()
csrf = CSRFProtect()
login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.login_message_category = "warning"


# ---- taskflow/models.py ----
from datetime import date, datetime, timezone
from typing import Optional
from flask_login import UserMixin
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db, login_manager


class User(UserMixin, db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    todos: Mapped[list["Todo"]] = relationship(back_populates="owner", cascade="all, delete-orphan")

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class Todo(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    priority: Mapped[int] = mapped_column(default=2)            # 1 high, 2 medium, 3 low
    due_date: Mapped[Optional[date]]
    done: Mapped[bool] = mapped_column(default=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)
    owner: Mapped["User"] = relationship(back_populates="todos")

    @property
    def is_overdue(self):
        return bool(self.due_date and not self.done and self.due_date < date.today())

    def to_dict(self):
        return {"id": self.id, "title": self.title, "notes": self.notes,
                "priority": self.priority, "done": self.done,
                "due_date": self.due_date.isoformat() if self.due_date else None}


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ---- taskflow/__init__.py ----
import os
from flask import Flask, render_template, redirect, url_for
from flask_login import current_user
from config import config_by_name
from .extensions import db, migrate, login_manager, csrf


def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name or os.environ.get("APP_ENV", "development")])

    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    login_manager.init_app(app)
    csrf.init_app(app)

    from .auth import auth_bp
    from .todos import todos_bp
    from .api import api_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(todos_bp, url_prefix="/todos")
    app.register_blueprint(api_bp, url_prefix="/api")
    csrf.exempt(api_bp)                       # JSON API uses session auth only for this demo

    @app.route("/")
    def index():
        if current_user.is_authenticated:
            return redirect(url_for("todos.todo_list"))
        return redirect(url_for("auth.login"))

    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}

    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    @app.cli.command("seed")
    def seed():
        from .models import User, Todo
        if db.session.scalar(db.select(User).filter_by(username="demo")):
            print("Demo user already exists")
            return
        u = User(username="demo", email="demo@taskflow.dev")
        u.set_password("demo12345")
        u.todos = [Todo(title="Learn Flask blueprints", priority=1),
                   Todo(title="Write tests", priority=2),
                   Todo(title="Deploy to Render", priority=3, done=True)]
        db.session.add(u)
        db.session.commit()
        print("Created user demo / demo12345 with 3 todos")

    return app


# ---- wsgi.py ----
from taskflow import create_app

app = create_app()`,
      result: `$ flask db upgrade
INFO  [alembic.runtime.migration] Running upgrade  -> 3c1d2e4f5a6b, users and todos

$ flask seed
Created user demo / demo12345 with 3 todos

$ flask run
 * Serving Flask app 'wsgi'
 * Debug mode: on
 * Running on http://127.0.0.1:5000`,
      explanation: "The backbone combines Day 6-11: SQLAlchemy 2.0 style models with a one-to-many relationship, Migrate, Login and CSRF initialised with init_app, config selected by APP_ENV, and a seed CLI command. Mapped[Optional[date]] without mapped_column() is allowed - the type annotation alone defines a nullable DATE column.",
    },
    {
      title: "TaskFlow part 2: auth and todos blueprints, forms and templates",
      scenario: "Add registration/login and the per-user todo pages with filters, pagination, toggle and delete.",
      steps: [
        "Create the auth and todos packages with the files below",
        "Create the templates in taskflow/templates",
        "Run flask run, register a new user, add todos with due dates and priorities",
        "Try filters ?status=active / completed, toggle a todo, edit, delete",
        "Security test: log in as another user and open /todos/1/edit of the first user -> 404",
      ],
      code: `# ---- taskflow/auth/__init__.py ----
from flask import Blueprint
auth_bp = Blueprint("auth", __name__)
from . import routes  # noqa: E402,F401

# ---- taskflow/auth/forms.py ----
from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from ..extensions import db
from ..models import User


class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(3, 50)])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
    confirm = PasswordField("Confirm password", validators=[EqualTo("password", "Passwords must match.")])
    submit = SubmitField("Create account")

    def validate_email(self, field):
        if db.session.scalar(db.select(User).filter_by(email=field.data.lower())):
            raise ValidationError("Email already registered.")

    def validate_username(self, field):
        if db.session.scalar(db.select(User).filter_by(username=field.data)):
            raise ValidationError("Username already taken.")


class LoginForm(FlaskForm):
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember = BooleanField("Remember me")
    submit = SubmitField("Log in")

# ---- taskflow/auth/routes.py ----
from urllib.parse import urlsplit
from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from ..extensions import db
from ..models import User
from .forms import RegisterForm, LoginForm
from . import auth_bp


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("todos.todo_list"))
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data.lower())
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash("Welcome to TaskFlow!", "success")
        return redirect(url_for("todos.todo_list"))
    return render_template("auth/register.html", form=form)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("todos.todo_list"))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(db.select(User).filter_by(email=form.email.data.lower()))
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember.data)
            nxt = request.args.get("next", "")
            if not nxt.startswith("/") or urlsplit(nxt).netloc:
                nxt = url_for("todos.todo_list")
            return redirect(nxt)
        flash("Invalid email or password.", "danger")
    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out.", "info")
    return redirect(url_for("auth.login"))

# ---- taskflow/todos/__init__.py ----
from flask import Blueprint
todos_bp = Blueprint("todos", __name__)
from . import routes  # noqa: E402,F401

# ---- taskflow/todos/forms.py ----
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, DateField, SubmitField
from wtforms.validators import DataRequired, Length, Optional


class TodoForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired(), Length(max=150)])
    notes = TextAreaField("Notes", validators=[Optional()])
    priority = SelectField("Priority", coerce=int, choices=[(1, "High"), (2, "Medium"), (3, "Low")])
    due_date = DateField("Due date", validators=[Optional()])
    submit = SubmitField("Save")

# ---- taskflow/todos/routes.py ----
from flask import render_template, redirect, url_for, flash, request, abort, current_app
from flask_login import login_required, current_user
from ..extensions import db
from ..models import Todo
from .forms import TodoForm
from . import todos_bp


@todos_bp.before_request
@login_required
def require_login():
    """Every route in this blueprint needs a logged-in user."""


def get_user_todo(todo_id):
    todo = db.get_or_404(Todo, todo_id)
    if todo.user_id != current_user.id:
        abort(404)                       # do not reveal other users' data
    return todo


@todos_bp.route("/")
def todo_list():
    status = request.args.get("status", "all")
    page = request.args.get("page", 1, type=int)
    stmt = db.select(Todo).filter_by(user_id=current_user.id)
    if status == "active":
        stmt = stmt.filter_by(done=False)
    elif status == "completed":
        stmt = stmt.filter_by(done=True)
    stmt = stmt.order_by(Todo.done, Todo.priority, Todo.due_date.is_(None), Todo.due_date)
    pagination = db.paginate(stmt, page=page,
                             per_page=current_app.config["TODOS_PER_PAGE"], error_out=False)
    remaining = db.session.scalar(
        db.select(db.func.count(Todo.id)).filter_by(user_id=current_user.id, done=False))
    return render_template("todos/list.html", pagination=pagination,
                           status=status, remaining=remaining)


@todos_bp.route("/new", methods=["GET", "POST"])
def todo_create():
    form = TodoForm()
    if form.validate_on_submit():
        todo = Todo(owner=current_user)
        form.populate_obj(todo)
        db.session.add(todo)
        db.session.commit()
        flash("Todo added.", "success")
        return redirect(url_for(".todo_list"))
    return render_template("todos/form.html", form=form, heading="New Todo")


@todos_bp.route("/<int:todo_id>/edit", methods=["GET", "POST"])
def todo_edit(todo_id):
    todo = get_user_todo(todo_id)
    form = TodoForm(obj=todo)
    if form.validate_on_submit():
        form.populate_obj(todo)
        db.session.commit()
        flash("Todo updated.", "success")
        return redirect(url_for(".todo_list"))
    return render_template("todos/form.html", form=form, heading="Edit Todo")


@todos_bp.post("/<int:todo_id>/toggle")
def todo_toggle(todo_id):
    todo = get_user_todo(todo_id)
    todo.done = not todo.done
    db.session.commit()
    return redirect(request.referrer or url_for(".todo_list"))


@todos_bp.post("/<int:todo_id>/delete")
def todo_delete(todo_id):
    todo = get_user_todo(todo_id)
    db.session.delete(todo)
    db.session.commit()
    flash(f"Deleted '{todo.title}'.", "info")
    return redirect(url_for(".todo_list"))

# ---- taskflow/templates/base.html ----
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% block title %}TaskFlow{% endblock %}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="{{ url_for('static', filename='css/app.css') }}" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-dark bg-primary mb-4"><div class="container">
  <a class="navbar-brand" href="{{ url_for('index') }}">TaskFlow</a>
  <div>
  {% if current_user.is_authenticated %}
    <span class="text-white me-3">{{ current_user.username }}</span>
    <a class="btn btn-light btn-sm" href="{{ url_for('auth.logout') }}">Logout</a>
  {% else %}
    <a class="btn btn-light btn-sm" href="{{ url_for('auth.login') }}">Login</a>
    <a class="btn btn-outline-light btn-sm" href="{{ url_for('auth.register') }}">Register</a>
  {% endif %}
  </div>
</div></nav>
<main class="container">
  {% for cat, msg in get_flashed_messages(with_categories=true) %}
    <div class="alert alert-{{ cat }}">{{ msg }}</div>
  {% endfor %}
  {% block content %}{% endblock %}
</main>
</body>
</html>

# ---- taskflow/templates/_form_macros.html ----
{% macro field(f) %}
  <div class="mb-3">
    {{ f.label(class_="form-label") }}
    {{ f(class_="form-control" + (" is-invalid" if f.errors else "")) }}
    {% for e in f.errors %}<div class="invalid-feedback">{{ e }}</div>{% endfor %}
  </div>
{% endmacro %}

# ---- taskflow/templates/auth/login.html ----
{% extends "base.html" %}
{% from "_form_macros.html" import field %}
{% block content %}
<h2>Log in</h2>
<form method="post" novalidate class="col-md-5">
  {{ form.hidden_tag() }}
  {{ field(form.email) }} {{ field(form.password) }}
  <div class="form-check mb-3">{{ form.remember(class_="form-check-input") }} {{ form.remember.label }}</div>
  {{ form.submit(class_="btn btn-primary") }}
</form>
{% endblock %}

# ---- taskflow/templates/auth/register.html ----
{% extends "base.html" %}
{% from "_form_macros.html" import field %}
{% block content %}
<h2>Create account</h2>
<form method="post" novalidate class="col-md-5">
  {{ form.hidden_tag() }}
  {{ field(form.username) }} {{ field(form.email) }} {{ field(form.password) }} {{ field(form.confirm) }}
  {{ form.submit(class_="btn btn-primary") }}
</form>
{% endblock %}

# ---- taskflow/templates/todos/list.html ----
{% extends "base.html" %}
{% block content %}
<div class="d-flex justify-content-between mb-3">
  <h2>My Todos <small class="text-muted">({{ remaining }} left)</small></h2>
  <a class="btn btn-success" href="{{ url_for('todos.todo_create') }}">+ New</a>
</div>
<div class="btn-group mb-3">
  {% for s in ['all', 'active', 'completed'] %}
    <a class="btn btn-outline-primary {{ 'active' if status == s }}" href="{{ url_for('todos.todo_list', status=s) }}">{{ s|title }}</a>
  {% endfor %}
</div>
<ul class="list-group">
{% for t in pagination.items %}
  <li class="list-group-item d-flex align-items-center {{ 'list-group-item-danger' if t.is_overdue }}">
    <form method="post" action="{{ url_for('todos.todo_toggle', todo_id=t.id) }}">
      <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
      <button class="btn btn-sm {{ 'btn-success' if t.done else 'btn-outline-secondary' }} me-2">&#10003;</button>
    </form>
    <span class="flex-grow-1 {{ 'text-decoration-line-through text-muted' if t.done }}">
      {{ t.title }}
      <span class="badge bg-{{ {1: 'danger', 2: 'warning', 3: 'secondary'}[t.priority] }}">P{{ t.priority }}</span>
      {% if t.due_date %}<small class="ms-2">due {{ t.due_date.strftime('%d %b') }}</small>{% endif %}
    </span>
    <a class="btn btn-sm btn-link" href="{{ url_for('todos.todo_edit', todo_id=t.id) }}">Edit</a>
    <form method="post" action="{{ url_for('todos.todo_delete', todo_id=t.id) }}" onsubmit="return confirm('Delete?')">
      <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
      <button class="btn btn-sm btn-outline-danger">Delete</button>
    </form>
  </li>
{% else %}
  <li class="list-group-item">Nothing here. Add your first todo!</li>
{% endfor %}
</ul>
{% if pagination.pages > 1 %}
<nav class="mt-3">
  {% if pagination.has_prev %}<a href="{{ url_for('todos.todo_list', status=status, page=pagination.prev_num) }}">&laquo; Prev</a>{% endif %}
  Page {{ pagination.page }} / {{ pagination.pages }}
  {% if pagination.has_next %}<a href="{{ url_for('todos.todo_list', status=status, page=pagination.next_num) }}">Next &raquo;</a>{% endif %}
</nav>
{% endif %}
{% endblock %}

# ---- taskflow/templates/todos/form.html ----
{% extends "base.html" %}
{% from "_form_macros.html" import field %}
{% block content %}
<h2>{{ heading }}</h2>
<form method="post" novalidate class="col-md-6">
  {{ form.hidden_tag() }}
  {{ field(form.title) }} {{ field(form.notes) }} {{ field(form.priority) }} {{ field(form.due_date) }}
  {{ form.submit(class_="btn btn-primary") }}
  <a href="{{ url_for('todos.todo_list') }}" class="btn btn-link">Cancel</a>
</form>
{% endblock %}`,
      result: `/auth/register -> account created, auto login, redirect to /todos/
/todos/        -> 'My Todos (2 left)', filter buttons All | Active | Completed
                  list sorted: open first, then by priority (P1 red badge), then due date
                  overdue items highlighted red, done items struck through
/todos/new     -> form; empty title -> 'This field is required.'
Toggle button  -> item moves to completed, counter decreases
Other user's /todos/1/edit -> 404 Not Found (ownership check)`,
      explanation: "before_request + login_required protects the whole todos blueprint in one place. get_user_todo prevents IDOR. populate_obj maps form fields to model attributes because the names match. Every state-changing action is a POST with a CSRF token.",
    },
    {
      title: "TaskFlow part 3: JSON API, tests and deployment",
      scenario: "Add an API for a future mobile client, cover the app with tests, and ship it to Render.",
      steps: [
        "Create taskflow/api/__init__.py and routes.py",
        "Create tests/conftest.py and tests/test_todos.py; run python -m pytest -q (VS Code Testing panel / PyCharm right-click tests > Run)",
        "Create gunicorn.conf.py; test locally with gunicorn wsgi:app",
        "Push to GitHub, create Render PostgreSQL + Web Service (Build: pip install -r requirements.txt && flask db upgrade, Start: gunicorn wsgi:app)",
        "Set env vars APP_ENV=production, SECRET_KEY, DATABASE_URL, PYTHON_VERSION=3.12.7 and deploy",
      ],
      code: `# ---- taskflow/api/__init__.py ----
from flask import Blueprint
api_bp = Blueprint("api", __name__)
from . import routes  # noqa: E402,F401

# ---- taskflow/api/routes.py ----
from flask import request, jsonify
from flask_login import current_user
from werkzeug.exceptions import HTTPException
from ..extensions import db
from ..models import Todo
from . import api_bp


@api_bp.before_request
def api_auth():
    if not current_user.is_authenticated:
        return jsonify(error="authentication required"), 401


@api_bp.errorhandler(HTTPException)
def api_http_error(e):
    return jsonify(error=e.name, message=e.description), e.code


def owned(todo_id):
    todo = db.session.get(Todo, todo_id)
    if todo is None or todo.user_id != current_user.id:
        return None
    return todo


@api_bp.get("/todos")
def api_list():
    todos = db.session.execute(
        db.select(Todo).filter_by(user_id=current_user.id).order_by(Todo.id)).scalars()
    return [t.to_dict() for t in todos]


@api_bp.post("/todos")
def api_create():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return {"error": "title is required"}, 422
    todo = Todo(title=title, priority=int(data.get("priority", 2)), owner=current_user)
    db.session.add(todo)
    db.session.commit()
    return todo.to_dict(), 201


@api_bp.patch("/todos/<int:todo_id>")
def api_update(todo_id):
    todo = owned(todo_id)
    if todo is None:
        return {"error": "not found"}, 404
    data = request.get_json(silent=True) or {}
    if "done" in data:
        todo.done = bool(data["done"])
    if "title" in data and data["title"].strip():
        todo.title = data["title"].strip()
    db.session.commit()
    return todo.to_dict()


@api_bp.delete("/todos/<int:todo_id>")
def api_delete(todo_id):
    todo = owned(todo_id)
    if todo is None:
        return {"error": "not found"}, 404
    db.session.delete(todo)
    db.session.commit()
    return "", 204

# ---- tests/conftest.py ----
import pytest
from taskflow import create_app
from taskflow.extensions import db
from taskflow.models import User


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        for name in ("asha", "ravi"):
            u = User(username=name, email=f"{name}@t.com")
            u.set_password("password1")
            db.session.add(u)
        db.session.commit()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def login(client, email):
    return client.post("/auth/login", data={"email": email, "password": "password1"})

# ---- tests/test_todos.py ----
from conftest import login


def test_requires_login(client):
    r = client.get("/todos/")
    assert r.status_code == 302 and "/auth/login" in r.headers["Location"]


def test_create_and_list(client):
    login(client, "asha@t.com")
    client.post("/todos/new", data={"title": "Buy milk", "priority": 1})
    r = client.get("/todos/")
    assert b"Buy milk" in r.data and b"(1 left)" in r.data


def test_toggle(client):
    login(client, "asha@t.com")
    client.post("/todos/new", data={"title": "Task", "priority": 2})
    client.post("/todos/1/toggle")
    assert b"(0 left)" in client.get("/todos/").data


def test_other_user_cannot_edit(client):
    login(client, "asha@t.com")
    client.post("/todos/new", data={"title": "Private", "priority": 2})
    client.get("/auth/logout")
    login(client, "ravi@t.com")
    assert client.get("/todos/1/edit").status_code == 404


def test_api_flow(client):
    assert client.get("/api/todos").status_code == 401
    login(client, "asha@t.com")
    r = client.post("/api/todos", json={"title": "From API"})
    assert r.status_code == 201
    todo_id = r.get_json()["id"]
    assert client.patch(f"/api/todos/{todo_id}", json={"done": True}).get_json()["done"] is True
    assert client.delete(f"/api/todos/{todo_id}").status_code == 204
    assert client.post("/api/todos", json={}).status_code == 422

# ---- gunicorn.conf.py ----
import os
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", 3))
accesslog = "-"

# ---- Terminal ----
python -m pytest -q
gunicorn wsgi:app
git add . && git commit -m "TaskFlow v1" && git push`,
      result: `$ python -m pytest -q
.....                                                        [100%]
5 passed in 1.12s

Render: ==> Build successful ... Running 'gunicorn wsgi:app' ... Your service is live

curl with a logged-in session cookie:
GET  /api/todos          -> 200 [{"id": 1, "title": "Learn Flask blueprints", "notes": null, "priority": 1, "done": false, "due_date": null}, ...]
POST /api/todos {}       -> 422 {"error": "title is required"}
GET  /api/todos (no login) -> 401 {"error": "authentication required"}`,
      explanation: "The API reuses the same models and ownership rule. A blueprint-level before_request returns 401 JSON instead of redirecting. conftest.py builds a fresh testing app with two users, so tests prove both functionality and security (IDOR). The same wsgi.py serves Gunicorn locally and on Render.",
    },
    {
      title: "Pure Python demo: the Todo business logic without Flask",
      scenario: "Keep core logic testable and framework-free: add, toggle, delete, validate and count remaining tasks.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `from dataclasses import dataclass, field


@dataclass
class Todo:
    id: int
    title: str
    done: bool = False


@dataclass
class TodoStore:
    items: list = field(default_factory=list)
    next_id: int = 1

    def add(self, title):
        if not title.strip():
            raise ValueError("Title cannot be empty")
        todo = Todo(self.next_id, title.strip())
        self.items.append(todo)
        self.next_id += 1
        return todo

    def toggle(self, todo_id):
        for t in self.items:
            if t.id == todo_id:
                t.done = not t.done
                return t
        raise KeyError(todo_id)

    def delete(self, todo_id):
        self.items = [t for t in self.items if t.id != todo_id]

    def show(self):
        for t in self.items:
            mark = "x" if t.done else " "
            print(f"[{mark}] {t.id}. {t.title}")
        left = sum(1 for t in self.items if not t.done)
        print(f"{left} task(s) left")


store = TodoStore()
store.add("Learn Flask routing")
store.add("Build models")
store.add("Deploy to Render")
store.toggle(1)
store.delete(2)
try:
    store.add("   ")
except ValueError as e:
    print("Error:", e)
store.show()`,
      python: { files: { "main.py": `from dataclasses import dataclass, field


@dataclass
class Todo:
    id: int
    title: str
    done: bool = False


@dataclass
class TodoStore:
    items: list = field(default_factory=list)
    next_id: int = 1

    def add(self, title):
        if not title.strip():
            raise ValueError("Title cannot be empty")
        todo = Todo(self.next_id, title.strip())
        self.items.append(todo)
        self.next_id += 1
        return todo

    def toggle(self, todo_id):
        for t in self.items:
            if t.id == todo_id:
                t.done = not t.done
                return t
        raise KeyError(todo_id)

    def delete(self, todo_id):
        self.items = [t for t in self.items if t.id != todo_id]

    def show(self):
        for t in self.items:
            mark = "x" if t.done else " "
            print(f"[{mark}] {t.id}. {t.title}")
        left = sum(1 for t in self.items if not t.done)
        print(f"{left} task(s) left")


store = TodoStore()
store.add("Learn Flask routing")
store.add("Build models")
store.add("Deploy to Render")
store.toggle(1)
store.delete(2)
try:
    store.add("   ")
except ValueError as e:
    print("Error:", e)
store.show()` } },
      result: `Error: Title cannot be empty
[x] 1. Learn Flask routing
[ ] 3. Deploy to Render
1 task(s) left`,
      explanation: "The same rules (no empty titles, toggle done, delete by id, count remaining) are what the Flask views enforce. Keeping logic in plain Python classes/functions makes it easy to unit-test and reuse from both HTML views and the JSON API.",
    },
  ],
  interview: [
    { q: "What is Flask and why is it called a micro-framework?", a: "A lightweight WSGI web framework built on Werkzeug and Jinja2. 'Micro' means a small, unopinionated core; features like ORM, auth and forms are added via extensions.", level: "Easy" },
    { q: "Explain the request-response cycle in Flask.", a: "The WSGI server receives an HTTP request and calls the Flask app; Flask pushes the app and request contexts, runs before_request hooks, matches the URL to a view via the URL map, calls the view, converts its return value into a Response, runs after_request hooks, pops contexts (teardown) and returns the response.", level: "Medium" },
    { q: "What are the application context and request context?", a: "The application context makes current_app and g available; the request context makes request and session available. Both are pushed per request and popped afterwards; use app.app_context() for scripts.", level: "Hard" },
    { q: "What is the g object?", a: "A namespace for storing data during a single application context (one request), e.g. a DB connection or the loaded user. It is reset for each request.", level: "Medium" },
    { q: "How does url_for help?", a: "It builds URLs from endpoint names and arguments, avoiding hard-coded paths, handling escaping, query strings, blueprints ('bp.view') and static files.", level: "Easy" },
    { q: "Difference between redirect and render_template?", a: "render_template returns HTML for the current request (status 200). redirect returns a 3xx response telling the browser to make a new request to another URL. Use redirect after successful POSTs (PRG).", level: "Easy" },
    { q: "How does Jinja2 template inheritance work?", a: "A base template defines blocks; children use {% extends %} and override blocks; {{ super() }} keeps the parent content; {% include %} inserts partials.", level: "Easy" },
    { q: "How does Flask protect against XSS?", a: "Jinja2 autoescaping for HTML templates converts special characters to entities. Avoid |safe and Markup on untrusted data.", level: "Medium" },
    { q: "How do you protect forms from CSRF in Flask?", a: "Use Flask-WTF: FlaskForm or CSRFProtect adds a signed token to forms ({{ form.hidden_tag() }} or csrf_token()) and rejects POSTs without a valid token. Requires SECRET_KEY.", level: "Medium" },
    { q: "How are sessions implemented in Flask by default?", a: "Client-side: the session dict is serialised and signed with SECRET_KEY (itsdangerous) and stored in a cookie. It is tamper-proof but readable. Use Flask-Session for server-side storage.", level: "Medium" },
    { q: "What are flash messages?", a: "One-time messages stored in the session with flash() and read once with get_flashed_messages(), typically shown after a redirect.", level: "Easy" },
    { q: "What is Flask-SQLAlchemy and how do you define a model?", a: "An extension integrating SQLAlchemy with Flask. Define class X(db.Model) with columns as Mapped[type] = mapped_column(...) (SQLAlchemy 2.0 style), and use db.session for CRUD.", level: "Easy" },
    { q: "Why use Flask-Migrate instead of db.create_all()?", a: "create_all only creates missing tables. Flask-Migrate (Alembic) generates versioned scripts to alter schemas (add/rename columns) without losing data and to roll back.", level: "Medium" },
    { q: "How do you model one-to-many and many-to-many relationships?", a: "One-to-many: ForeignKey on the child and relationship() with back_populates on both sides. Many-to-many: an association table passed as secondary=, or an association model when extra columns are needed.", level: "Medium" },
    { q: "What is the N+1 query problem and the fix?", a: "Loading N rows then lazily loading a relation for each triggers N extra queries. Fix with eager loading: selectinload() or joinedload().", level: "Hard" },
    { q: "How does Flask-Login work?", a: "It stores the user id in the session via login_user; on each request a user_loader callback loads the user into current_user; @login_required redirects anonymous users to login_view; logout_user clears it. UserMixin provides required properties.", level: "Medium" },
    { q: "How do you store passwords securely?", a: "Hash with a slow, salted algorithm via werkzeug.security.generate_password_hash (scrypt/pbkdf2) and verify with check_password_hash. Never store plain text or fast unsalted hashes.", level: "Easy" },
    { q: "What are Blueprints?", a: "Components that group routes, templates, static files and handlers for a feature; registered on the app with optional url_prefix; endpoints are namespaced as 'bp.view'.", level: "Easy" },
    { q: "What is the application factory pattern and its benefits?", a: "Creating the app inside create_app(config) and binding extensions with init_app. Benefits: multiple configured instances (testing), cleaner imports without cycles, easier scaling.", level: "Medium" },
    { q: "How do you build a REST API in Flask?", a: "Use resource URLs with HTTP methods, return dicts/jsonify with proper status codes, read input via request.get_json(), validate it, and return JSON errors with errorhandler(HTTPException) and custom exceptions. Optionally MethodView, Flask-Smorest or APIFlask.", level: "Medium" },
    { q: "What is the difference between PUT and PATCH, and which status codes do you use for create and delete?", a: "PUT replaces the full resource, PATCH partially updates. Create returns 201 (with Location), delete returns 204 No Content.", level: "Easy" },
    { q: "How do you handle errors globally in Flask?", a: "Register @app.errorhandler for status codes (404, 500), for HTTPException (all HTTP errors) and for custom exception classes; blueprints can use errorhandler (local) or app_errorhandler (global).", level: "Medium" },
    { q: "How do you manage configuration and secrets?", a: "Config classes per environment loaded with from_object, chosen by an env var; secrets in environment variables or .env (git-ignored) loaded by python-dotenv; from_prefixed_env for FLASK_* overrides.", level: "Medium" },
    { q: "How do you deploy a Flask app?", a: "Pin requirements, set DEBUG off and secrets via env, use a production DB and run migrations, serve with Gunicorn (Waitress on Windows) behind Nginx or a PaaS like Render, add health checks and logging.", level: "Medium" },
    { q: "How do you test a Flask application?", a: "Use pytest with an app factory fixture (TestingConfig, in-memory DB, CSRF off), app.test_client() to send requests, and assert status codes, JSON and HTML content; use app.test_cli_runner() for CLI commands.", level: "Medium" },
    { q: "What is IDOR and how did you prevent it in your project?", a: "Insecure Direct Object Reference: accessing another user's object by changing an id. Prevent by loading objects scoped to current_user and returning 404/403 when the owner does not match.", level: "Hard" },
    { q: "Flask vs Django vs FastAPI - when to choose which?", a: "Flask: flexible, small-to-medium apps and APIs with chosen extensions. Django: batteries-included for large data-driven sites with admin. FastAPI: high-performance async APIs with automatic validation and OpenAPI docs.", level: "Medium" },
  ],
  practice: [
    {
      task: "Add a search box to /todos/ that filters by title (case-insensitive) and keeps the status filter.",
      hint: "Read q from request.args and add .where(Todo.title.ilike(...)); pass q to url_for in links.",
      solution: `q = request.args.get("q", "").strip()
if q:
    stmt = stmt.where(Todo.title.ilike(f"%{q}%"))

{# list.html #}
<form class="mb-3">
  <input type="hidden" name="status" value="{{ status }}">
  <input name="q" value="{{ request.args.get('q', '') }}" placeholder="Search...">
</form>`,
    },
    {
      task: "Add a 'Clear completed' button that deletes all completed todos of the current user.",
      hint: "db.delete(Todo).where(...) with user_id and done=True; POST route.",
      solution: `@todos_bp.post("/clear-completed")
def clear_completed():
    result = db.session.execute(
        db.delete(Todo).where(Todo.user_id == current_user.id, Todo.done.is_(True)))
    db.session.commit()
    flash(f"Removed {result.rowcount} completed todos.", "info")
    return redirect(url_for(".todo_list"))`,
    },
    {
      task: "Add a Category model (user-owned) with a many-to-many link to Todo and show category badges.",
      hint: "Association table todo_category, relationship(secondary=...), new migration.",
      solution: `todo_category = db.Table(
    "todo_category",
    db.Column("todo_id", ForeignKey("todo.id"), primary_key=True),
    db.Column("category_id", ForeignKey("category.id"), primary_key=True),
)


class Category(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    todos: Mapped[list["Todo"]] = relationship(secondary=todo_category, back_populates="categories")

# in Todo
categories: Mapped[list["Category"]] = relationship(secondary=todo_category, back_populates="todos")

# terminal
flask db migrate -m "categories"
flask db upgrade`,
    },
    {
      task: "Convert the Blog idea: list the minimum models, blueprints and routes you would need for a multi-author blog with comments.",
      hint: "Reuse TaskFlow structure.",
      solution: `Models: User(1)-(N)Post, Post(1)-(N)Comment, User(1)-(N)Comment, Post(N)-(N)Tag
Blueprints: auth, blog, comments, api
Routes:
  GET  /blog/                 list (paginated, ?tag=)
  GET  /blog/<slug>           detail + comments
  GET/POST /blog/new          create (login_required)
  GET/POST /blog/<id>/edit    owner only
  POST /blog/<id>/delete      owner only
  POST /blog/<id>/comments    add comment (login_required)
  GET  /api/posts             JSON list`,
    },
    {
      task: "Write a test that checks the /healthz endpoint returns {'status': 'ok'}.",
      hint: "client.get and get_json().",
      solution: `def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.get_json() == {"status": "ok"}`,
    },
  ],
  quiz: [
    {
      question: "Which pattern prevents user A from editing user B's todo by changing the URL id?",
      options: ["CSRF tokens", "Template inheritance", "Ownership check (load todo scoped to current_user)", "Pagination"],
      answer: 2,
      explanation: "This is the IDOR protection.",
    },
    {
      question: "Which command applies pending migrations on Render during build?",
      options: ["flask db upgrade", "flask db init", "flask run", "db.create_all()"],
      answer: 0,
      explanation: "upgrade applies migration scripts to the production DB.",
    },
    {
      question: "In TaskFlow, how is login enforced for every todos route at once?",
      options: ["A global variable", "A before_request hook with login_required on the blueprint", "A Jinja2 macro", "A CSS rule"],
      answer: 1,
      explanation: "Blueprint-level before_request runs before each of its routes.",
    },
    {
      question: "Which test configuration choice keeps tests isolated and fast?",
      options: ["Use the production DB", "Turn on DEBUG", "Disable pytest", "In-memory SQLite with a fresh app from create_app('testing')"],
      answer: 3,
      explanation: "Each test gets a clean database.",
    },
    {
      question: "What does the API return for an unauthenticated request in TaskFlow?",
      options: ["401 JSON error", "302 redirect to login", "200 empty list", "500 error"],
      answer: 0,
      explanation: "API clients need JSON, so before_request returns 401.",
    },
  ],
};
