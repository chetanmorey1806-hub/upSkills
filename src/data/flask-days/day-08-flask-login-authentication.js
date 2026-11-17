export default {
  id: "day-08-flask-login-authentication",
  title: "User Authentication with Flask-Login, Password Hashing",
  module: "Module 2: Database & Auth",
  day: 8,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Build a complete register / login / logout system: store passwords safely with Werkzeug hashing, manage logged-in users with Flask-Login (UserMixin, user_loader, login_user, login_required, current_user), support 'remember me' and protect against open redirects.",
  objectives: [
    "Explain authentication vs authorization and why passwords must be hashed, not encrypted",
    "Hash and verify passwords with werkzeug.security generate_password_hash / check_password_hash",
    "Configure Flask-Login: LoginManager, login_view, user_loader, UserMixin",
    "Implement register, login (with remember me and safe next redirect), logout and protected pages",
    "Use current_user in views and templates and add simple role-based authorization",
  ],
  theory: [
    {
      heading: "Authentication vs Authorization",
      content: "Authentication answers 'Who are you?' - checking username and password. Authorization answers 'What are you allowed to do?' - for example only admins can delete users. Analogy: at an airport, showing your passport at the gate is authentication; your boarding pass deciding which seat and lounge you can use is authorization. Flask-Login handles the 'remembering who is logged in' part of authentication: it stores the user id in the session, loads the user on each request, and protects views. It does NOT store users, hash passwords or create forms - you do that with Flask-SQLAlchemy, Werkzeug and Flask-WTF.",
      points: [
        "Authentication: login with credentials -> identity",
        "Authorization: permissions/roles -> access",
        "Flask-Login: session management for users (login_user, logout_user, current_user, @login_required)",
      ],
    },
    {
      heading: "Password Hashing",
      content: "NEVER store plain passwords. If the database leaks, every account (and every other site where users reuse the password) is exposed. A hash is a one-way function: easy to compute from a password, practically impossible to reverse. Werkzeug's generate_password_hash adds a random salt (so two users with the same password get different hashes) and uses a slow algorithm (scrypt by default in Werkzeug 3, or pbkdf2) with many iterations so brute-force guessing is expensive. To log in, check_password_hash(stored_hash, typed_password) re-hashes with the same salt and compares safely.",
      syntax: "from werkzeug.security import generate_password_hash, check_password_hash\n\nh = generate_password_hash('secret123')     # 'scrypt:32768:8:1$salt$hash...'\ncheck_password_hash(h, 'secret123')         # True",
      points: [
        "Hashing is one-way; encryption is two-way (can be decrypted) - passwords need hashing",
        "Salt: random data mixed in so identical passwords have different hashes (defeats rainbow tables)",
        "Never use plain md5/sha1/sha256 for passwords - they are too fast",
        "Store the hash in a column of length 256 (String(256)); scrypt hashes are long",
      ],
      tip: "Interview line: 'We store salted, slow hashes (scrypt/pbkdf2/bcrypt) of passwords and verify with check_password_hash; we never store or log plain passwords.'",
    },
    {
      heading: "Flask-Login Setup",
      content: "pip install Flask-Login. Create login_manager = LoginManager(app) (or init_app). Your User model inherits UserMixin, which provides is_authenticated, is_active, is_anonymous and get_id(). Register a user_loader callback that takes the id string from the session and returns the User object (or None). Set login_manager.login_view = 'login' so @login_required redirects anonymous users to the login page with a ?next= parameter.",
      syntax: "login_manager = LoginManager(app)\nlogin_manager.login_view = 'login'\n\n@login_manager.user_loader\ndef load_user(user_id):\n    return db.session.get(User, int(user_id))",
      points: [
        "UserMixin.get_id() returns str(self.id)",
        "login_manager.login_message and login_message_category customise the flash shown on redirect",
        "Missing user_loader -> 'Missing user_loader or request_loader' exception",
        "current_user is AnonymousUserMixin when nobody is logged in (is_authenticated is False)",
      ],
    },
    {
      heading: "login_user, logout_user, login_required, current_user",
      content: "After verifying the password call login_user(user, remember=form.remember.data). This stores the id in the session; with remember=True it also sets a long-lived 'remember_token' cookie (default 365 days, REMEMBER_COOKIE_DURATION). logout_user() clears it. Decorate private views with @login_required (place it BELOW @app.route). current_user is available in every view and template: {% if current_user.is_authenticated %}Hi {{ current_user.username }}{% endif %}.",
      points: [
        "Decorator order: @app.route first (top), then @login_required",
        "Safe redirect: only follow ?next= if it is a relative path (no scheme/host) to prevent open-redirect attacks",
        "Use a generic error 'Invalid email or password' - do not reveal which part is wrong",
        "Fresh login: @fresh_login_required for sensitive pages like changing password",
      ],
    },
    {
      heading: "Simple Role-Based Authorization",
      content: "Add a role column (or is_admin boolean) to User and write a small decorator that checks current_user.role and calls abort(403) otherwise. For bigger apps use permissions tables or extensions like Flask-Principal. Always check permissions on the server, even if you hide the buttons in the template.",
      syntax: "def admin_required(view):\n    @wraps(view)\n    @login_required\n    def wrapped(*args, **kwargs):\n        if current_user.role != 'admin':\n            abort(403)\n        return view(*args, **kwargs)\n    return wrapped",
    },
  ],
  examples: [
    {
      title: "Complete auth app: models, forms, register, login, logout, profile",
      scenario: "Build the authentication base for a student portal: users register, log in (with remember me), see their dashboard and log out.",
      steps: [
        "Create auth_app and open it in VS Code (select .venv) or PyCharm",
        "pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-Login Flask-WTF email-validator",
        "Create files exactly as in the project tree",
        "Run flask --app app db init, flask --app app db migrate -m \"users\", flask --app app db upgrade",
        "Run flask --app app run --debug and open /register",
        "Register, log out, log in again with Remember me, close and reopen the browser and open /dashboard",
        "PyCharm: set a breakpoint inside load_user and Debug to see it called on every request",
      ],
      code: `# Project tree
auth_app/
├── app.py
├── models.py
├── forms.py
├── requirements.txt
├── migrations/
└── templates/
    ├── base.html
    ├── register.html
    ├── login.html
    └── dashboard.html

# ---- requirements.txt ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.7
Flask-Login==0.6.3
Flask-WTF==1.2.1
email-validator==2.2.0

# ---- models.py ----
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class User(UserMixin, db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    role: Mapped[str] = mapped_column(String(20), default="student")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"


# ---- forms.py ----
from flask_wtf import FlaskForm
from wtforms import StringField, EmailField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from models import db, User


class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(3, 50)])
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
    confirm = PasswordField("Confirm", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Create account")

    def validate_username(self, field):
        if db.session.scalar(db.select(User).filter_by(username=field.data)):
            raise ValidationError("Username already taken.")

    def validate_email(self, field):
        if db.session.scalar(db.select(User).filter_by(email=field.data.lower())):
            raise ValidationError("Email already registered.")


class LoginForm(FlaskForm):
    email = EmailField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember = BooleanField("Remember me")
    submit = SubmitField("Log in")


# ---- app.py ----
from urllib.parse import urlsplit
from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import (LoginManager, login_user, logout_user,
                         login_required, current_user)
from flask_migrate import Migrate
from models import db, User
from forms import RegisterForm, LoginForm

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-secret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///auth.db"

db.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "warning"


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@app.route("/")
def index():
    return redirect(url_for("dashboard"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data.lower())
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash("Account created. Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("register.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(db.select(User).filter_by(email=form.email.data.lower()))
        if user is None or not user.check_password(form.password.data):
            flash("Invalid email or password.", "danger")
            return redirect(url_for("login"))
        login_user(user, remember=form.remember.data)
        next_page = request.args.get("next")
        # allow only relative URLs -> prevents open redirect to evil.com
        if not next_page or urlsplit(next_page).netloc != "" or not next_page.startswith("/"):
            next_page = url_for("dashboard")
        flash(f"Welcome, {user.username}!", "success")
        return redirect(next_page)
    return render_template("login.html", form=form)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out.", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")


# ---- templates/base.html ----
<!DOCTYPE html>
<html>
<head><title>Student Portal</title></head>
<body>
<nav>
  {% if current_user.is_authenticated %}
    Hi, {{ current_user.username }} |
    <a href="{{ url_for('dashboard') }}">Dashboard</a> |
    <a href="{{ url_for('logout') }}">Logout</a>
  {% else %}
    <a href="{{ url_for('login') }}">Login</a> |
    <a href="{{ url_for('register') }}">Register</a>
  {% endif %}
</nav>
{% for cat, msg in get_flashed_messages(with_categories=true) %}
  <p class="{{ cat }}">{{ msg }}</p>
{% endfor %}
{% block content %}{% endblock %}
</body>
</html>

# ---- templates/register.html ----
{% extends "base.html" %}
{% block content %}
<h2>Register</h2>
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  {% for field in [form.username, form.email, form.password, form.confirm] %}
    <p>{{ field.label }}<br>{{ field() }}
    {% for e in field.errors %}<br><small style="color:red">{{ e }}</small>{% endfor %}</p>
  {% endfor %}
  {{ form.submit() }}
</form>
{% endblock %}

# ---- templates/login.html ----
{% extends "base.html" %}
{% block content %}
<h2>Login</h2>
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  <p>{{ form.email.label }}<br>{{ form.email() }}</p>
  <p>{{ form.password.label }}<br>{{ form.password() }}</p>
  <p>{{ form.remember() }} {{ form.remember.label }}</p>
  {{ form.submit() }}
</form>
{% endblock %}

# ---- templates/dashboard.html ----
{% extends "base.html" %}
{% block content %}
<h1>Dashboard</h1>
<p>Email: {{ current_user.email }}</p>
<p>Role: {{ current_user.role }}</p>
{% endblock %}`,
      result: `/dashboard (logged out) -> redirect /login?next=%2Fdashboard + 'Please log in to access this page.'
/register asha / asha@mail.com / flask2026 -> 'Account created. Please log in.'
/register same email again                 -> 'Email already registered.'
/login wrong password                      -> 'Invalid email or password.'
/login correct + Remember me               -> 'Welcome, asha!' -> /dashboard
                                              navbar: Hi, asha | Dashboard | Logout
Close browser, reopen /dashboard           -> still logged in (remember_token cookie)
/login?next=https://evil.com               -> after login goes to /dashboard, not evil.com
/logout                                    -> 'Logged out.'

Database row: password_hash = 'scrypt:32768:8:1$Zk3...$7f1c...' (no plain password stored)`,
      explanation: "UserMixin supplies the properties Flask-Login needs. user_loader turns the id saved in the session back into a User on every request. login_user writes the session (and remember cookie), login_required guards views, and current_user is a proxy to the loaded user. The next check prevents open redirects.",
    },
    {
      title: "Admin-only page with a role decorator and 403 page",
      scenario: "Only admins may see the list of all users.",
      steps: [
        "Add the decorator and route below to app.py",
        "Create templates/users.html and templates/403.html",
        "Make a user admin in flask shell",
        "Log in as a student and open /admin/users (403), then as the admin (list)",
      ],
      code: `# ---- app.py (add) ----
from functools import wraps
from flask import abort


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user.role != "admin":
            abort(403)
        return view(*args, **kwargs)
    return wrapped


@app.route("/admin/users")
@admin_required
def admin_users():
    users = db.session.execute(db.select(User).order_by(User.id)).scalars().all()
    return render_template("users.html", users=users)


@app.errorhandler(403)
def forbidden(e):
    return render_template("403.html"), 403


# ---- templates/users.html ----
{% extends "base.html" %}
{% block content %}
<h2>All users</h2>
<ul>{% for u in users %}<li>{{ u.username }} ({{ u.role }})</li>{% endfor %}</ul>
{% endblock %}

# ---- templates/403.html ----
{% extends "base.html" %}
{% block content %}<h2>403 - You do not have permission to view this page.</h2>{% endblock %}

# ---- flask shell ----
>>> u = db.session.scalar(db.select(User).filter_by(username="asha"))
>>> u.role = "admin"
>>> db.session.commit()`,
      result: `Logged in as ravi (student) -> /admin/users -> 403 - You do not have permission to view this page.
Logged in as asha (admin)   -> All users
                               - asha (admin)
                               - ravi (student)
Logged out                  -> redirect to /login (login_required runs first)`,
      explanation: "The decorator stacks @login_required inside, so anonymous users are sent to login and logged-in non-admins get 403. functools.wraps keeps the original function name, which Flask needs for the endpoint.",
    },
    {
      title: "Change password with current-password check",
      scenario: "Logged-in users can change their password only after confirming the old one.",
      steps: [
        "Add ChangePasswordForm to forms.py and the route to app.py",
        "Create templates/change_password.html",
        "Log in, open /account/password, try a wrong current password, then a correct one",
      ],
      code: `# ---- forms.py (add) ----
class ChangePasswordForm(FlaskForm):
    current = PasswordField("Current password", validators=[DataRequired()])
    new = PasswordField("New password", validators=[DataRequired(), Length(min=8)])
    confirm = PasswordField("Confirm new password", validators=[DataRequired(), EqualTo("new")])
    submit = SubmitField("Change password")


# ---- app.py (add) ----
from forms import ChangePasswordForm


@app.route("/account/password", methods=["GET", "POST"])
@login_required
def change_password():
    form = ChangePasswordForm()
    if form.validate_on_submit():
        if not current_user.check_password(form.current.data):
            form.current.errors.append("Current password is wrong.")
        else:
            current_user.set_password(form.new.data)
            db.session.commit()
            flash("Password changed.", "success")
            return redirect(url_for("dashboard"))
    return render_template("change_password.html", form=form)


# ---- templates/change_password.html ----
{% extends "base.html" %}
{% block content %}
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  {% for f in [form.current, form.new, form.confirm] %}
    <p>{{ f.label }}<br>{{ f() }}{% for e in f.errors %}<br><small>{{ e }}</small>{% endfor %}</p>
  {% endfor %}
  {{ form.submit() }}
</form>
{% endblock %}`,
      result: `Wrong current password -> 'Current password is wrong.' under the first field
Correct                -> 'Password changed.' -> dashboard; old password no longer works`,
      explanation: "current_user is the real User object, so we can call model methods on it and commit. A new random salt is generated for the new hash.",
    },
    {
      title: "Pure Python demo: salted, slow password hashing",
      scenario: "Understand what generate_password_hash and check_password_hash do using hashlib.pbkdf2_hmac.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `@@FD08@@`,
      python: { files: { "main.py": `@@FD08@@` } },
      result: `Starts with: pbkdf2:sha256:100000
Same password, same hash? False
Correct password: True
Wrong password: False`,
      explanation: "A random salt makes two hashes of the same password different. Checking re-computes the hash with the stored salt and iterations, then compares with hmac.compare_digest (constant time, so attackers cannot learn from timing). This is the same 'method$salt$hash' format Werkzeug uses.",
    },
  ],
  interview: [
    { q: "What is Flask-Login and what does it NOT do?", a: "It manages user sessions: logging in/out, remembering users, loading the current user and protecting views. It does not provide a user model, password hashing, registration forms or permissions.", level: "Easy" },
    { q: "What is the purpose of user_loader?", a: "A callback that receives the user id stored in the session and returns the User object (or None). Flask-Login calls it on each request to populate current_user.", level: "Easy" },
    { q: "What does UserMixin provide?", a: "Default implementations of is_authenticated, is_active, is_anonymous and get_id() required by Flask-Login.", level: "Easy" },
    { q: "Difference between hashing and encryption?", a: "Hashing is one-way and cannot be reversed; encryption is two-way with a key. Passwords must be hashed so even the server cannot recover them.", level: "Easy" },
    { q: "What is a salt and why is it needed?", a: "Random data combined with the password before hashing and stored with the hash. It makes identical passwords produce different hashes and defeats precomputed rainbow tables.", level: "Medium" },
    { q: "Why not use sha256(password) for storing passwords?", a: "It is fast, so attackers can test billions of guesses per second, and unsalted hashes are vulnerable to rainbow tables. Use slow, salted algorithms like scrypt, bcrypt, argon2 or pbkdf2 with many iterations.", level: "Medium" },
    { q: "How does 'remember me' work in Flask-Login?", a: "login_user(user, remember=True) sets a long-lived signed remember_token cookie. When the session cookie is gone, Flask-Login restores the user from this cookie. Duration is REMEMBER_COOKIE_DURATION (default 365 days).", level: "Medium" },
    { q: "What is an open redirect vulnerability in login?", a: "Blindly redirecting to ?next= lets attackers craft login links that send users to a phishing site after login. Only allow relative URLs on your own host.", level: "Hard" },
    { q: "What is the correct order of @app.route and @login_required?", a: "@app.route must be the outermost (top) decorator; @login_required goes below it so the registered view is the protected one.", level: "Medium" },
    { q: "How do you show different navbar links for logged-in users?", a: "Use {% if current_user.is_authenticated %} ... {% else %} ... {% endif %} in base.html; current_user is injected into templates by Flask-Login.", level: "Easy" },
    { q: "Why show 'Invalid email or password' instead of 'Email not found'?", a: "Specific messages let attackers discover which emails are registered (user enumeration).", level: "Medium" },
    { q: "How would you implement role-based access?", a: "Store a role or permissions on User and write a decorator that checks current_user and aborts with 403; for complex needs use a permissions table or Flask-Principal.", level: "Medium" },
  ],
  practice: [
    {
      task: "Add an is_active column to User and block deactivated users from logging in.",
      hint: "Override is_active property; Flask-Login's login_user returns False for inactive users.",
      solution: `class User(UserMixin, db.Model):
    # ...
    active: Mapped[bool] = mapped_column(default=True)

    @property
    def is_active(self):
        return self.active

# in login view
if not login_user(user, remember=form.remember.data):
    flash("Your account is disabled.", "danger")
    return redirect(url_for("login"))`,
    },
    {
      task: "Create a /profile page that shows the current user's username and number of days since joining.",
      hint: "Add joined_at column; compute in the view.",
      solution: `from datetime import datetime, timezone

# model
joined_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

@app.route("/profile")
@login_required
def profile():
    days = (datetime.now(timezone.utc) - current_user.joined_at.replace(tzinfo=timezone.utc)).days
    return render_template("profile.html", days=days)`,
    },
    {
      task: "Write a pytest-style check that a hashed password verifies correctly and wrong ones fail.",
      hint: "Use set_password and check_password on a User object (no DB needed).",
      solution: `from models import User


def test_password_hashing():
    u = User(username="t", email="t@t.com")
    u.set_password("flask2026")
    assert u.password_hash != "flask2026"
    assert u.check_password("flask2026")
    assert not u.check_password("wrong")`,
    },
    {
      task: "Redirect already-logged-in users away from /login and /register to /dashboard.",
      hint: "if current_user.is_authenticated at the top of the view.",
      solution: `@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    # ... rest of the view`,
    },
  ],
  quiz: [
    {
      question: "Which function verifies a typed password against a stored hash?",
      options: ["generate_password_hash", "check_password_hash", "verify_hash", "login_user"],
      answer: 1,
      explanation: "check_password_hash(hash, password) returns True or False.",
    },
    {
      question: "What must the user_loader return when the id does not exist?",
      options: ["None", "An empty User()", "False", "It must raise 404"],
      answer: 0,
      explanation: "Returning None tells Flask-Login the user is not logged in.",
    },
    {
      question: "Which attribute tells whether someone is logged in?",
      options: ["current_user.logged", "session.user", "current_user.is_authenticated", "request.user"],
      answer: 2,
      explanation: "is_authenticated is True for real users, False for AnonymousUserMixin.",
    },
    {
      question: "Where does @login_required redirect anonymous users?",
      options: ["Home page", "404 page", "It shows 500", "The view named in login_manager.login_view"],
      answer: 3,
      explanation: "login_view sets the login endpoint; next= is added automatically.",
    },
    {
      question: "Why do two users with the same password get different hashes?",
      options: ["Different usernames", "Random salt", "Different time zones", "Base64 encoding"],
      answer: 1,
      explanation: "The salt is random per hash.",
    },
  ],
};
