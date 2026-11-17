export default {
  id: "day-09-blueprints-application-factory",
  title: "Blueprints and Application Factory Pattern",
  module: "Module 2: Database & Auth",
  day: 9,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Turn a single-file app into a professional, scalable package: split features into Blueprints (main, auth, blog), create the app inside a create_app() factory, initialise extensions with init_app, use current_app, and avoid circular imports.",
  objectives: [
    "Explain why large Flask apps need Blueprints and an application factory",
    "Create Blueprints with their own routes, templates and url_prefix, and use 'blueprint.endpoint' in url_for",
    "Write create_app(config) that loads config, initialises extensions and registers blueprints",
    "Move extensions to extensions.py and use current_app instead of importing app",
    "Run, migrate and test an app built with the factory pattern",
  ],
  theory: [
    {
      heading: "The Problem with a Single app.py",
      content: "Up to Day 8 everything lived in app.py. With 40 routes, 10 models and 15 forms that file becomes thousands of lines, merge conflicts grow, and you get circular imports (models.py imports app, app.py imports models). You also cannot create a second app with different settings for testing. Analogy: a small shop can keep everything in one room; a supermarket needs separate sections (fruits, dairy, billing) with a manager who sets up the whole store each morning. Blueprints are the sections; the application factory is the manager.",
      points: [
        "Blueprint = a group of related routes, templates, static files and error handlers",
        "Application factory = a function create_app() that builds and returns a configured app",
        "Together they give modular code, team-friendly structure and easy testing",
      ],
    },
    {
      heading: "Blueprints",
      content: "A Blueprint records routes like a mini app, but they become active only after app.register_blueprint(bp). Create one with bp = Blueprint('auth', __name__, url_prefix='/auth', template_folder='templates'). Use @bp.route instead of @app.route. Endpoint names become 'blueprint_name.function_name', so url_for('auth.login'). Inside the same blueprint you can use a relative endpoint: url_for('.login'). Blueprints can have their own error handlers (@bp.errorhandler) and app-wide ones (@bp.app_errorhandler), and hooks like @bp.before_request.",
      syntax: "from flask import Blueprint\n\nauth_bp = Blueprint('auth', __name__, url_prefix='/auth')\n\n@auth_bp.route('/login')\ndef login():\n    return 'login'\n\n# in factory\napp.register_blueprint(auth_bp)   # URL: /auth/login, endpoint: auth.login",
      points: [
        "url_prefix groups URLs: /auth/login, /auth/register",
        "Common mistake: url_for('login') after moving to a blueprint -> BuildError; use url_for('auth.login')",
        "Blueprint templates: put them in templates/auth/login.html to avoid name clashes",
        "login_manager.login_view must also change to 'auth.login'",
      ],
    },
    {
      heading: "Application Factory: create_app()",
      content: "Instead of a global app = Flask(__name__), write def create_app(config_class=Config): app = Flask(__name__); app.config.from_object(config_class); initialise extensions; register blueprints; return app. Benefits: create many apps (one with TestingConfig using an in-memory database), no global app object to import (fewer circular imports), and the Flask CLI finds it automatically: flask --app myapp run calls create_app() for you.",
      syntax: "def create_app(config_class=Config):\n    app = Flask(__name__)\n    app.config.from_object(config_class)\n    db.init_app(app)\n    login_manager.init_app(app)\n    from .auth import auth_bp\n    app.register_blueprint(auth_bp)\n    return app",
      points: [
        "flask --app blogapp run -> Flask looks for create_app or make_app in the package",
        "Pass arguments: flask --app \"blogapp:create_app('testing')\" run",
        "Import blueprints INSIDE create_app to avoid circular imports",
      ],
      tip: "Interview line: 'The application factory is a function that creates and configures the Flask app on demand, allowing multiple instances with different configs and avoiding circular imports; extensions are created unbound and attached with init_app.'",
    },
    {
      heading: "Extensions with init_app and current_app",
      content: "Create extension objects without an app in extensions.py: db = SQLAlchemy(model_class=Base), migrate = Migrate(), login_manager = LoginManager(), csrf = CSRFProtect(). In create_app call ext.init_app(app). Since there is no global app, code that needs the app (config values, logger) uses current_app, a proxy to the app handling the current request. Outside a request (scripts, tests) push a context: with app.app_context(): ...",
      points: [
        "current_app.config['PER_PAGE'], current_app.logger.info('...')",
        "g: per-request storage; current_app: the active application",
        "'RuntimeError: Working outside of application context' -> missing app_context()",
      ],
    },
    {
      heading: "Recommended Project Layout",
      content: "A common layout is a package (folder with __init__.py) containing create_app, config, extensions, models and one sub-package per blueprint, each with routes.py and forms.py. A small wsgi.py or run.py at the top level creates the app for servers like Gunicorn: gunicorn 'wsgi:app'. Tests live in a tests/ folder and call create_app(TestingConfig).",
      points: [
        "Feature-based blueprints (auth, blog, admin, api) scale better than splitting by type (all views in one file)",
        "Keep models in models.py (or models/ package) imported by blueprints",
        "One base.html in app/templates shared by all blueprints",
      ],
    },
  ],
  examples: [
    {
      title: "Refactor the blog into a package with factory, extensions and three blueprints",
      scenario: "Your team is growing; restructure the Day 7/8 blog so separate developers can own auth, blog and main pages.",
      steps: [
        "Create the folder structure below (VS Code: New Folder/New File; PyCharm: right-click > New > Python Package creates __init__.py for you)",
        "pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-Login Flask-WTF email-validator python-dotenv",
        "Paste each file",
        "Run flask --app blogapp db init, flask --app blogapp db migrate -m \"initial\", flask --app blogapp db upgrade",
        "Run flask --app blogapp run --debug (or python run.py) and open /, /auth/register, /blog/",
        "Run flask --app blogapp routes to see endpoints prefixed with blueprint names",
        "PyCharm Professional: Run > Edit Configurations > Flask Server > Target type: Module name, Target: blogapp, Application: create_app",
      ],
      code: `# Project tree
blog_project/
├── .flaskenv
├── config.py
├── run.py
├── requirements.txt
├── migrations/
├── tests/
│   └── test_app.py
└── blogapp/
    ├── __init__.py          # create_app()
    ├── extensions.py        # db, migrate, login_manager, csrf
    ├── models.py
    ├── templates/
    │   ├── base.html
    │   └── 404.html
    ├── main/
    │   ├── __init__.py
    │   ├── routes.py
    │   └── templates/main/index.html
    ├── auth/
    │   ├── __init__.py
    │   ├── forms.py
    │   ├── routes.py
    │   └── templates/auth/login.html, register.html
    └── blog/
        ├── __init__.py
        ├── forms.py
        ├── routes.py
        └── templates/blog/list.html, detail.html, form.html

# ---- .flaskenv ----
FLASK_APP=blogapp
FLASK_DEBUG=1

# ---- config.py ----
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(BASE_DIR, "blog.db"))
    POSTS_PER_PAGE = 5


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


# ---- blogapp/extensions.py ----
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.login_message_category = "warning"
csrf = CSRFProtect()


# ---- blogapp/models.py ----
from datetime import datetime, timezone
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
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class Post(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    author_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    author: Mapped["User"] = relationship(back_populates="posts")


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ---- blogapp/__init__.py ----
from flask import Flask, render_template
from config import Config
from .extensions import db, migrate, login_manager, csrf


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # 1. extensions
    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    login_manager.init_app(app)
    csrf.init_app(app)

    # 2. blueprints (imported here to avoid circular imports)
    from .main import main_bp
    from .auth import auth_bp
    from .blog import blog_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(blog_bp, url_prefix="/blog")

    # 3. app-wide error pages and shell context
    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    from . import models

    @app.shell_context_processor
    def shell_ctx():
        return {"db": db, "User": models.User, "Post": models.Post}

    return app


# ---- blogapp/main/__init__.py ----
from flask import Blueprint

main_bp = Blueprint("main", __name__, template_folder="templates")

from . import routes  # noqa: E402,F401  (registers routes on main_bp)


# ---- blogapp/main/routes.py ----
from flask import render_template
from ..extensions import db
from ..models import Post
from . import main_bp


@main_bp.route("/")
def index():
    latest = db.session.execute(
        db.select(Post).order_by(Post.created_at.desc()).limit(3)).scalars().all()
    return render_template("main/index.html", latest=latest)


# ---- blogapp/auth/__init__.py ----
from flask import Blueprint

auth_bp = Blueprint("auth", __name__, template_folder="templates")

from . import routes  # noqa: E402,F401


# ---- blogapp/auth/routes.py ----
from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from ..extensions import db
from ..models import User
from .forms import LoginForm, RegisterForm      # Day 8 forms; in forms.py import User from ..models
from . import auth_bp


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data.lower())
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash("Account created.", "success")
        return redirect(url_for(".login"))          # relative endpoint -> auth.login
    return render_template("auth/register.html", form=form)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(db.select(User).filter_by(email=form.email.data.lower()))
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember.data)
            return redirect(url_for("blog.post_list"))
        flash("Invalid email or password.", "danger")
    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("main.index"))


# ---- blogapp/blog/__init__.py ----
from flask import Blueprint

blog_bp = Blueprint("blog", __name__, template_folder="templates")

from . import routes  # noqa: E402,F401


# ---- blogapp/blog/forms.py ----
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length


class PostForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired(), Length(max=200)])
    body = TextAreaField("Body", validators=[DataRequired()])
    submit = SubmitField("Publish")


# ---- blogapp/blog/routes.py ----
from flask import render_template, redirect, url_for, flash, request, current_app, abort
from flask_login import login_required, current_user
from ..extensions import db
from ..models import Post
from .forms import PostForm
from . import blog_bp


@blog_bp.route("/")
def post_list():
    page = request.args.get("page", 1, type=int)
    per_page = current_app.config["POSTS_PER_PAGE"]     # no global app import
    pagination = db.paginate(db.select(Post).order_by(Post.created_at.desc()),
                             page=page, per_page=per_page, error_out=False)
    return render_template("blog/list.html", pagination=pagination)


@blog_bp.route("/<int:post_id>")
def post_detail(post_id):
    return render_template("blog/detail.html", post=db.get_or_404(Post, post_id))


@blog_bp.route("/new", methods=["GET", "POST"])
@login_required
def post_create():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(title=form.title.data, body=form.body.data, author=current_user)
        db.session.add(post)
        db.session.commit()
        current_app.logger.info("Post %s created by %s", post.id, current_user.username)
        flash("Post published.", "success")
        return redirect(url_for(".post_detail", post_id=post.id))
    return render_template("blog/form.html", form=form)


@blog_bp.post("/<int:post_id>/delete")
@login_required
def post_delete(post_id):
    post = db.get_or_404(Post, post_id)
    if post.author_id != current_user.id:
        abort(403)
    db.session.delete(post)
    db.session.commit()
    return redirect(url_for(".post_list"))


# ---- blogapp/templates/base.html (navbar uses blueprint endpoints) ----
<nav>
  <a href="{{ url_for('main.index') }}">Home</a>
  <a href="{{ url_for('blog.post_list') }}">Blog</a>
  {% if current_user.is_authenticated %}
    <a href="{{ url_for('blog.post_create') }}">New Post</a>
    <a href="{{ url_for('auth.logout') }}">Logout</a>
  {% else %}
    <a href="{{ url_for('auth.login') }}">Login</a>
  {% endif %}
</nav>
{% block content %}{% endblock %}

# ---- run.py ----
from blogapp import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)`,
      result: `$ flask --app blogapp routes
Endpoint          Methods    Rule
----------------  ---------  -----------------------
auth.login        GET, POST  /auth/login
auth.logout       GET        /auth/logout
auth.register     GET, POST  /auth/register
blog.post_create  GET, POST  /blog/new
blog.post_delete  POST       /blog/<int:post_id>/delete
blog.post_detail  GET        /blog/<int:post_id>
blog.post_list    GET        /blog/
main.index        GET        /
static            GET        /static/<path:filename>

Browser: / shows latest 3 posts, /blog/ is paginated (5 per page),
/blog/new redirects anonymous users to /auth/login?next=%2Fblog%2Fnew`,
      explanation: "Each feature lives in its own blueprint package. Extensions are created once without an app and bound in create_app via init_app. Blueprints are imported inside the factory, which breaks the circular import chain. Endpoints are namespaced (auth.login), and '.login' refers to the current blueprint.",
    },
    {
      title: "Testing with the factory: an in-memory app per test",
      scenario: "Write automated tests that use a fresh database each time without touching blog.db.",
      steps: [
        "pip install pytest",
        "Create tests/test_app.py with the code below",
        "VS Code: Testing panel (flask icon) > Configure Python Tests > pytest > tests folder, then click Run; PyCharm: right-click tests folder > Run 'pytest in tests'",
        "Or run python -m pytest -q in the terminal",
      ],
      code: `# ---- tests/test_app.py ----
import pytest
from blogapp import create_app
from blogapp.extensions import db
from blogapp.models import User, Post
from config import TestingConfig


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_home_page(client):
    resp = client.get("/")
    assert resp.status_code == 200


def test_new_post_requires_login(client):
    resp = client.get("/blog/new")
    assert resp.status_code == 302
    assert "/auth/login" in resp.headers["Location"]


def test_register_and_login(client, app):
    client.post("/auth/register", data={
        "username": "asha", "email": "asha@mail.com",
        "password": "flask2026", "confirm": "flask2026"})
    assert db.session.scalar(db.select(User).filter_by(username="asha")) is not None
    resp = client.post("/auth/login", data={"email": "asha@mail.com", "password": "flask2026"},
                       follow_redirects=True)
    assert resp.status_code == 200


def test_post_model(app):
    u = User(username="ravi", email="r@mail.com")
    u.set_password("x12345678")
    db.session.add(Post(title="Hi", body="Body", author=u))
    db.session.commit()
    assert u.posts[0].title == "Hi"`,
      result: `$ python -m pytest -q
....                                                         [100%]
4 passed in 0.62s`,
      explanation: "Because the app is built by a function, each test gets its own app with TestingConfig (in-memory SQLite, CSRF off). This is impossible with a single global app object whose config is fixed at import time.",
    },
    {
      title: "Blueprint-specific hooks and error handlers",
      scenario: "The admin area must log every request and show a JSON error for 403 only inside that blueprint.",
      steps: [
        "Create blogapp/admin/__init__.py with the code below",
        "Register it in create_app with url_prefix='/admin'",
        "Open /admin/ as a normal user and check the terminal log",
      ],
      code: `# ---- blogapp/admin/__init__.py ----
from flask import Blueprint, current_app, request, abort, jsonify
from flask_login import login_required, current_user

admin_bp = Blueprint("admin", __name__)


@admin_bp.before_request
@login_required
def only_admins():
    current_app.logger.info("Admin area hit: %s by %s", request.path, current_user.username)
    if current_user.username != "admin":
        abort(403)


@admin_bp.errorhandler(403)
def admin_forbidden(e):
    return jsonify(error="admins only"), 403


@admin_bp.route("/")
def dashboard():
    return "Admin dashboard"


# ---- in create_app ----
from .admin import admin_bp
app.register_blueprint(admin_bp, url_prefix="/admin")`,
      result: `Normal user -> GET /admin/ -> 403 {"error": "admins only"}
Terminal:  INFO in __init__: Admin area hit: /admin/ by ravi
User 'admin' -> Admin dashboard`,
      explanation: "before_request on a blueprint runs only for that blueprint's routes, so one check protects every admin URL. errorhandler on a blueprint applies only to errors raised inside it; use app_errorhandler for app-wide handlers.",
    },
    {
      title: "Pure Python demo: factory function and blueprint registration",
      scenario: "Model the idea of create_app() and register_blueprint() with plain classes to see how endpoints get prefixed.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `class Blueprint:
    def __init__(self, name):
        self.name = name
        self.rules = {}

    def route(self, rule):
        def decorator(func):
            self.rules[rule] = func
            return func
        return decorator


class App:
    def __init__(self, config):
        self.config = config
        self.url_map = {}

    def register_blueprint(self, bp, url_prefix=""):
        for rule, func in bp.rules.items():
            full = (url_prefix + rule).rstrip("/") or "/"
            self.url_map[full] = bp.name + "." + func.__name__


auth_bp = Blueprint("auth")
blog_bp = Blueprint("blog")


@auth_bp.route("/login")
def login():
    return "login page"


@blog_bp.route("/")
def index():
    return "blog home"


@blog_bp.route("/<int:id>")
def detail(id):
    return "post"


def create_app(config_name="development"):
    configs = {"development": {"DEBUG": True}, "testing": {"TESTING": True}}
    app = App(configs[config_name])
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(blog_bp, url_prefix="/blog")
    return app


dev = create_app()
test = create_app("testing")
print("dev config:", dev.config)
print("test config:", test.config)
for url, endpoint in dev.url_map.items():
    print(f"{url:16} -> {endpoint}")
print("Different objects?", dev is not test)`,
      python: { files: { "main.py": `class Blueprint:
    def __init__(self, name):
        self.name = name
        self.rules = {}

    def route(self, rule):
        def decorator(func):
            self.rules[rule] = func
            return func
        return decorator


class App:
    def __init__(self, config):
        self.config = config
        self.url_map = {}

    def register_blueprint(self, bp, url_prefix=""):
        for rule, func in bp.rules.items():
            full = (url_prefix + rule).rstrip("/") or "/"
            self.url_map[full] = bp.name + "." + func.__name__


auth_bp = Blueprint("auth")
blog_bp = Blueprint("blog")


@auth_bp.route("/login")
def login():
    return "login page"


@blog_bp.route("/")
def index():
    return "blog home"


@blog_bp.route("/<int:id>")
def detail(id):
    return "post"


def create_app(config_name="development"):
    configs = {"development": {"DEBUG": True}, "testing": {"TESTING": True}}
    app = App(configs[config_name])
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(blog_bp, url_prefix="/blog")
    return app


dev = create_app()
test = create_app("testing")
print("dev config:", dev.config)
print("test config:", test.config)
for url, endpoint in dev.url_map.items():
    print(f"{url:16} -> {endpoint}")
print("Different objects?", dev is not test)` } },
      result: `dev config: {'DEBUG': True}
test config: {'TESTING': True}
/auth/login      -> auth.login
/blog            -> blog.index
/blog/<int:id>   -> blog.detail
Different objects? True`,
      explanation: "Blueprints only record rules; the app adds the prefix and the 'blueprint.function' endpoint name when registering. Calling the factory twice produces two independent apps with different configs - exactly what tests need.",
    },
  ],
  interview: [
    { q: "What is a Blueprint in Flask?", a: "A way to organise a group of related routes, templates, static files and handlers into a reusable component that is registered on an application, optionally with a url_prefix.", level: "Easy" },
    { q: "What is the application factory pattern?", a: "Creating the Flask app inside a function (create_app) that configures it, initialises extensions and registers blueprints, then returns it. It allows multiple app instances with different configs and avoids circular imports.", level: "Easy" },
    { q: "How does url_for change with blueprints?", a: "Endpoints are prefixed with the blueprint name: url_for('auth.login'). Inside the same blueprint, url_for('.login') works.", level: "Easy" },
    { q: "Why do we call db.init_app(app) instead of SQLAlchemy(app)?", a: "With a factory there is no app at import time. Creating the extension unbound and calling init_app later lets one extension object serve many app instances.", level: "Medium" },
    { q: "What is current_app and when do you need it?", a: "A proxy to the application handling the current request or app context. Use it in blueprints/modules to access config or logger without importing a global app.", level: "Medium" },
    { q: "How do blueprints help avoid circular imports?", a: "Models and routes import extensions from extensions.py (not from the app), and blueprints are imported inside create_app after extensions exist, so no module imports the app at load time.", level: "Hard" },
    { q: "Difference between @bp.errorhandler and @bp.app_errorhandler?", a: "errorhandler handles errors raised in that blueprint's views only; app_errorhandler registers an application-wide handler from the blueprint.", level: "Hard" },
    { q: "How does the flask command find a factory?", a: "With --app package, Flask looks for an 'app' or 'application' variable, then a create_app or make_app factory function, and calls it. You can also pass 'pkg:create_app(\"testing\")'.", level: "Medium" },
    { q: "Can one blueprint be registered twice?", a: "Yes, with different url_prefix and a unique name parameter in register_blueprint(bp, name='...'), e.g. API v1 and v2.", level: "Hard" },
    { q: "Why put blueprint templates in templates/<bp_name>/file.html?", a: "All template folders share one search path; namespacing avoids collisions such as two different index.html files.", level: "Medium" },
    { q: "What does a before_request hook on a blueprint do?", a: "Runs before every request handled by that blueprint, useful for auth checks, logging or loading data into g.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a 'contact' blueprint with url_prefix /contact and a single GET route returning a template contact/index.html.",
      hint: "Blueprint('contact', __name__, template_folder='templates').",
      solution: `# blogapp/contact/__init__.py
from flask import Blueprint, render_template

contact_bp = Blueprint("contact", __name__, template_folder="templates")


@contact_bp.route("/")
def index():
    return render_template("contact/index.html")

# create_app
from .contact import contact_bp
app.register_blueprint(contact_bp, url_prefix="/contact")`,
    },
    {
      task: "Add a DevelopmentConfig and ProductionConfig and select one with an environment variable inside create_app.",
      hint: "A dict mapping names to classes; os.environ.get('APP_ENV', 'development').",
      solution: `# config.py
class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {"development": DevelopmentConfig, "production": ProductionConfig,
                  "testing": TestingConfig}

# blogapp/__init__.py
import os
from config import config_by_name


def create_app(config_name=None):
    config_name = config_name or os.environ.get("APP_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    # ... extensions + blueprints
    return app`,
    },
    {
      task: "Write a context processor in the main blueprint that injects site_name into ALL templates.",
      hint: "@main_bp.app_context_processor",
      solution: `@main_bp.app_context_processor
def inject_site():
    return {"site_name": "Asha's Blog"}`,
    },
    {
      task: "Create a custom CLI command 'flask seed' in the factory that creates 3 sample posts.",
      hint: "@app.cli.command('seed') inside create_app.",
      solution: `# inside create_app
@app.cli.command("seed")
def seed():
    from .models import User, Post
    u = User(username="demo", email="demo@mail.com")
    u.set_password("demo12345")
    for i in range(1, 4):
        db.session.add(Post(title=f"Sample {i}", body="Lorem ipsum", author=u))
    db.session.commit()
    print("Seeded 3 posts")`,
    },
  ],
  quiz: [
    {
      question: "With bp = Blueprint('blog', __name__), how do you link to its view 'detail'?",
      options: ["url_for('detail')", "url_for('blog.detail')", "url_for('blog/detail')", "url_for(blog.detail)"],
      answer: 1,
      explanation: "Endpoint = blueprint name + '.' + function name.",
    },
    {
      question: "Main benefit of the application factory?",
      options: ["Faster templates", "No need for a database", "Automatic HTTPS", "Multiple app instances with different configs and fewer circular imports"],
      answer: 3,
      explanation: "Factories create configured apps on demand.",
    },
    {
      question: "How are extensions attached in a factory?",
      options: ["ext.init_app(app)", "app.add(ext)", "Flask(ext)", "ext.register(app)"],
      answer: 0,
      explanation: "Extensions follow the init_app convention.",
    },
    {
      question: "Which object gives access to config inside a blueprint view?",
      options: ["app", "request.config", "current_app", "g.app"],
      answer: 2,
      explanation: "current_app proxies the active application.",
    },
    {
      question: "Why import blueprints inside create_app()?",
      options: ["Required by Python", "To avoid circular imports", "To make them faster", "Flask ignores top-level imports"],
      answer: 1,
      explanation: "Delaying the import breaks import cycles.",
    },
  ],
};
