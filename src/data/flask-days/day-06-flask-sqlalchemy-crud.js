export default {
  id: "day-06-flask-sqlalchemy-crud",
  title: "Flask-SQLAlchemy: Models, CRUD",
  module: "Module 2: Database & Auth",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Connect Flask to a database with Flask-SQLAlchemy 3 (SQLAlchemy 2.0 style), define models with Mapped and mapped_column, create tables, and build a complete Create-Read-Update-Delete web app with forms, pagination and the flask shell.",
  objectives: [
    "Explain ORM and why we use SQLAlchemy instead of raw SQL strings",
    "Configure SQLALCHEMY_DATABASE_URI for SQLite and MySQL and initialise db = SQLAlchemy(model_class=Base)",
    "Define models with column types, primary key, unique, nullable and default values",
    "Perform CRUD with db.session.add/commit/delete and db.select / db.get_or_404 / db.paginate",
    "Build a full CRUD web app with Flask-WTF forms and templates, and test queries in flask shell",
  ],
  theory: [
    {
      heading: "What is an ORM? Why SQLAlchemy?",
      content: "An ORM (Object Relational Mapper) lets you work with database tables as Python classes and rows as objects. Instead of writing INSERT INTO book ... you write db.session.add(Book(title='Flask')). Analogy: an interpreter between you (speaking Python) and the database (speaking SQL). SQLAlchemy is the most popular Python ORM and works with SQLite, MySQL, PostgreSQL and more by just changing the connection URL. Flask-SQLAlchemy is an extension that wires SQLAlchemy into Flask: it reads config, creates a session per request and removes it at the end, and adds helpers like get_or_404 and paginate.",
      points: [
        "Model class = table, class attribute = column, object = row",
        "Parameters are bound safely, so ORM queries are protected from SQL injection",
        "Database-independent code: switch SQLite -> MySQL by changing one config line",
        "We use Flask-SQLAlchemy 3.1 with SQLAlchemy 2.0 style: DeclarativeBase, Mapped, mapped_column, db.select()",
      ],
    },
    {
      heading: "Setup and Configuration",
      content: "Install with pip install Flask-SQLAlchemy. Create a Base class from DeclarativeBase and pass it to SQLAlchemy(model_class=Base). Set SQLALCHEMY_DATABASE_URI before calling db.init_app(app) (or SQLAlchemy(app)). For SQLite the file is created inside the instance folder: 'sqlite:///library.db' -> instance/library.db. For MySQL install a driver (pip install PyMySQL) and use 'mysql+pymysql://user:password@localhost:3306/library'. db.create_all() creates tables that do not exist yet (it never alters existing ones - that is Flask-Migrate's job on Day 7) and must run inside app.app_context().",
      syntax: "from flask_sqlalchemy import SQLAlchemy\nfrom sqlalchemy.orm import DeclarativeBase\n\nclass Base(DeclarativeBase):\n    pass\n\ndb = SQLAlchemy(model_class=Base)\napp.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'\ndb.init_app(app)",
      points: [
        "SQLite URI: sqlite:///name.db (relative, stored in instance/)",
        "MySQL URI: mysql+pymysql://root:pass@localhost/dbname (create the database first in MySQL Workbench)",
        "SQLALCHEMY_ECHO = True prints every SQL statement - great for learning",
        "Error 'Working outside of application context' -> wrap code in with app.app_context():",
      ],
    },
    {
      heading: "Defining Models",
      content: "A model is a class that inherits db.Model. Each column is declared with a type annotation Mapped[type] and mapped_column(...) for options. Mapped[str] means NOT NULL; Mapped[str | None] (or Optional) means nullable. String(100) sets VARCHAR length (required for MySQL). Table name defaults to the class name in snake_case (Book -> book) and can be set with __tablename__. Add __repr__ for readable printing in the shell.",
      syntax: "class Book(db.Model):\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str] = mapped_column(String(150), unique=True)\n    price: Mapped[float] = mapped_column(default=0.0)\n    summary: Mapped[str | None] = mapped_column(Text)",
      points: [
        "Common types: Integer, String(n), Text, Float, Numeric(10, 2), Boolean, Date, DateTime",
        "Options: primary_key, unique, index, nullable, default (Python side), server_default (DB side)",
        "default=datetime.utcnow is wrong if you write datetime.utcnow() - pass the function, not its result; better: default=lambda: datetime.now(timezone.utc)",
      ],
    },
    {
      heading: "CRUD with the Session",
      content: "db.session is a workspace (unit of work): you stage changes and commit them in one transaction. Create: db.session.add(obj); db.session.commit(). Read: db.session.get(Book, 1) by primary key, db.session.execute(db.select(Book).filter_by(author='X')).scalars().all() for lists, .scalar_one_or_none() / .first() for one row. Update: change attributes then commit. Delete: db.session.delete(obj); commit. On errors call db.session.rollback(). In views use db.get_or_404(Book, id) and db.first_or_404(select) to auto-return 404, and db.paginate(select, page=..., per_page=...) for pages.",
      syntax: "books = db.session.execute(db.select(Book).order_by(Book.title)).scalars().all()\nbook = db.get_or_404(Book, book_id)\nbook.price = 399\ndb.session.commit()",
      points: [
        "filter_by(title='X') for simple equality; where(Book.price > 300) for expressions",
        "Book.title.ilike('%flask%') for case-insensitive search; order_by(Book.price.desc())",
        "db.session.scalar(db.select(db.func.count(Book.id))) for counting",
        "Old style Book.query.all() still works but is legacy - stay with db.select() for consistency",
      ],
      tip: "Interview line: 'db.session tracks objects and sends all pending INSERT/UPDATE/DELETE statements in one transaction when commit() is called.'",
    },
    {
      heading: "flask shell and Common Mistakes",
      content: "flask --app app shell opens a Python shell with the app context already pushed, so you can play with models. Add @app.shell_context_processor to auto-import db and models. Typical mistakes: forgetting commit() (data disappears), creating tables before importing models (create_all creates nothing), MySQL String without length, and IntegrityError for duplicate unique values (catch it, rollback, show a message).",
      points: [
        "No commit -> nothing saved",
        "IntegrityError -> db.session.rollback() then flash an error",
        "Keep business logic out of templates; query in views",
      ],
    },
  ],
  examples: [
    {
      title: "Project setup, Book model and flask shell CRUD",
      scenario: "Create a library database and try all CRUD operations from the shell before building pages.",
      steps: [
        "Create the library_app folder and open it in VS Code (select .venv interpreter) or PyCharm (New Project with venv)",
        "pip install Flask Flask-SQLAlchemy Flask-WTF and pip freeze > requirements.txt",
        "Create the files from the tree (models.py, app.py)",
        "Run flask --app app init-db to create instance/library.db",
        "Run flask --app app shell and type the shell commands shown",
        "PyCharm Professional: open the Database tool window > + > Data Source > SQLite > select instance/library.db to browse the table; VS Code: install the 'SQLite Viewer' extension",
      ],
      code: `# Project tree
library_app/
├── app.py
├── models.py
├── forms.py
├── requirements.txt
├── instance/
│   └── library.db        (created automatically)
└── templates/
    ├── base.html
    ├── books.html
    └── book_form.html

# ---- requirements.txt ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
SQLAlchemy==2.0.35
Flask-WTF==1.2.1
# PyMySQL==1.1.1   (only for MySQL)

# ---- models.py ----
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class Book(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), unique=True)
    author: Mapped[str] = mapped_column(String(100), index=True)
    price: Mapped[float] = mapped_column(default=0.0)
    in_stock: Mapped[bool] = mapped_column(default=True)
    summary: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Book {self.id} {self.title!r}>"


# ---- app.py (part 1) ----
from flask import Flask
from models import db, Book

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///library.db"
# MySQL: "mysql+pymysql://root:password@localhost:3306/library"
app.config["SQLALCHEMY_ECHO"] = False
db.init_app(app)


@app.cli.command("init-db")
def init_db():
    """Create all tables."""
    db.create_all()
    print("Database tables created.")


@app.shell_context_processor
def make_shell_context():
    return {"db": db, "Book": Book}


# ---- Terminal ----
$ flask --app app init-db
Database tables created.

$ flask --app app shell
>>> b1 = Book(title="Flask Web Development", author="Miguel", price=499)
>>> b2 = Book(title="Fluent Python", author="Luciano", price=899)
>>> db.session.add_all([b1, b2])
>>> db.session.commit()
>>> db.session.execute(db.select(Book).order_by(Book.price)).scalars().all()
>>> book = db.session.get(Book, 1)
>>> book.price = 449
>>> db.session.commit()
>>> db.session.scalar(db.select(Book).where(Book.price > 500))
>>> db.session.delete(db.session.get(Book, 2))
>>> db.session.commit()
>>> db.session.scalar(db.select(db.func.count(Book.id)))`,
      result: `[<Book 1 'Flask Web Development'>, <Book 2 'Fluent Python'>]
<Book 2 'Fluent Python'>
1

instance/library.db now has a table 'book' with columns
id, title, author, price, in_stock, summary, created_at`,
      explanation: "db.init_app connects the extension to the app. The custom CLI command creates tables inside the app context automatically. In the shell, add_all + commit inserts rows, get() reads by primary key, attribute change + commit updates, delete + commit removes.",
    },
    {
      title: "Full CRUD web app: list, search, create, edit, delete with pagination",
      scenario: "Librarians need pages to list books (5 per page with search), add a book, edit it and delete it.",
      steps: [
        "Continue in library_app; add forms.py and the routes below to app.py",
        "Create the templates base.html, books.html and book_form.html",
        "Run flask --app app run --debug and open /books",
        "Add several books, search by title, edit a price, delete a book",
        "Turn on SQLALCHEMY_ECHO = True and watch the SQL in the terminal",
      ],
      code: `# ---- forms.py ----
from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, BooleanField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length, NumberRange, Optional


class BookForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired(), Length(max=150)])
    author = StringField("Author", validators=[DataRequired(), Length(max=100)])
    price = FloatField("Price", validators=[NumberRange(min=0)])
    in_stock = BooleanField("In stock", default=True)
    summary = TextAreaField("Summary", validators=[Optional()])
    submit = SubmitField("Save")


# ---- app.py (part 2: views) ----
from flask import render_template, request, redirect, url_for, flash
from sqlalchemy.exc import IntegrityError
from forms import BookForm


@app.route("/")
@app.route("/books")
def book_list():
    q = request.args.get("q", "").strip()
    page = request.args.get("page", 1, type=int)
    stmt = db.select(Book).order_by(Book.created_at.desc())
    if q:
        stmt = stmt.where(Book.title.ilike(f"%{q}%"))
    pagination = db.paginate(stmt, page=page, per_page=5, error_out=False)
    return render_template("books.html", pagination=pagination, q=q)


@app.route("/books/new", methods=["GET", "POST"])
def book_create():
    form = BookForm()
    if form.validate_on_submit():
        book = Book()
        form.populate_obj(book)          # copies title, author, price ... onto book
        db.session.add(book)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            form.title.errors.append("A book with this title already exists.")
            return render_template("book_form.html", form=form, heading="Add Book")
        flash(f"Book '{book.title}' added.", "success")
        return redirect(url_for("book_list"))
    return render_template("book_form.html", form=form, heading="Add Book")


@app.route("/books/<int:book_id>/edit", methods=["GET", "POST"])
def book_edit(book_id):
    book = db.get_or_404(Book, book_id)
    form = BookForm(obj=book)            # pre-fill with current values
    if form.validate_on_submit():
        form.populate_obj(book)
        db.session.commit()
        flash("Book updated.", "success")
        return redirect(url_for("book_list"))
    return render_template("book_form.html", form=form, heading=f"Edit: {book.title}")


@app.post("/books/<int:book_id>/delete")
def book_delete(book_id):
    book = db.get_or_404(Book, book_id)
    db.session.delete(book)
    db.session.commit()
    flash(f"Deleted '{book.title}'.", "info")
    return redirect(url_for("book_list"))


# ---- templates/base.html ----
<!DOCTYPE html>
<html>
<head>
  <title>Library</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="container py-4">
  <nav class="mb-3"><a href="{{ url_for('book_list') }}">Books</a> |
       <a href="{{ url_for('book_create') }}">Add Book</a></nav>
  {% for cat, msg in get_flashed_messages(with_categories=true) %}
    <div class="alert alert-{{ cat }}">{{ msg }}</div>
  {% endfor %}
  {% block content %}{% endblock %}
</body>
</html>

# ---- templates/books.html ----
{% extends "base.html" %}
{% block content %}
<form class="mb-3"><input name="q" value="{{ q }}" placeholder="Search title"> <button>Search</button></form>
<table class="table">
  <tr><th>Title</th><th>Author</th><th>Price</th><th>Stock</th><th></th></tr>
  {% for b in pagination.items %}
  <tr>
    <td>{{ b.title }}</td><td>{{ b.author }}</td><td>Rs. {{ "%.2f"|format(b.price) }}</td>
    <td>{{ "Yes" if b.in_stock else "No" }}</td>
    <td>
      <a href="{{ url_for('book_edit', book_id=b.id) }}">Edit</a>
      <form method="post" action="{{ url_for('book_delete', book_id=b.id) }}" style="display:inline"
            onsubmit="return confirm('Delete this book?')">
        <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
        <button class="btn btn-sm btn-danger">Delete</button>
      </form>
    </td>
  </tr>
  {% else %}
  <tr><td colspan="5">No books found.</td></tr>
  {% endfor %}
</table>
<p>Page {{ pagination.page }} of {{ pagination.pages }} ({{ pagination.total }} books)</p>
{% if pagination.has_prev %}<a href="{{ url_for('book_list', page=pagination.prev_num, q=q) }}">Prev</a>{% endif %}
{% if pagination.has_next %}<a href="{{ url_for('book_list', page=pagination.next_num, q=q) }}">Next</a>{% endif %}
{% endblock %}

# ---- templates/book_form.html ----
{% extends "base.html" %}
{% block content %}
<h2>{{ heading }}</h2>
<form method="post" novalidate>
  {{ form.hidden_tag() }}
  {% for field in [form.title, form.author, form.price, form.summary] %}
    <div class="mb-2">{{ field.label }} {{ field(class_="form-control") }}
      {% for e in field.errors %}<small class="text-danger">{{ e }}</small>{% endfor %}</div>
  {% endfor %}
  <div>{{ form.in_stock() }} {{ form.in_stock.label }}</div>
  {{ form.submit(class_="btn btn-primary mt-2") }}
</form>
{% endblock %}`,
      result: `/books          -> table of books (newest first), 5 per page, 'Page 1 of 2 (7 books)', Next link
/books?q=python -> only titles containing 'python' (case-insensitive)
/books/new      -> form; save -> 'Book 'Clean Code' added.' and redirect to list
                   duplicate title -> 'A book with this title already exists.'
/books/3/edit   -> form pre-filled; save -> 'Book updated.'
Delete button   -> confirm popup -> 'Deleted 'Clean Code'.'
/books/999/edit -> 404 Not Found`,
      explanation: "db.paginate runs the select with LIMIT/OFFSET and gives items, page, pages, total, has_next. form.populate_obj copies form data onto the model. Delete uses POST + CSRF token (never delete with GET links). csrf_token() is available in templates because Flask-WTF is installed and the form uses it; for a guaranteed global token, add CSRFProtect(app).",
    },
    {
      title: "Switching to MySQL 8",
      scenario: "Move the library app from SQLite to MySQL for production-like testing.",
      steps: [
        "Open MySQL Workbench (or mysql CLI) and run the SQL below",
        "pip install PyMySQL cryptography",
        "Change SQLALCHEMY_DATABASE_URI in app.py",
        "Run flask --app app init-db and then flask --app app run --debug",
        "Refresh the schema in Workbench and see the book table",
      ],
      code: `-- MySQL Workbench
CREATE DATABASE library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'StrongPass#2026';
GRANT ALL PRIVILEGES ON library.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;

# ---- Terminal ----
pip install PyMySQL cryptography

# ---- app.py ----
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://library_user:StrongPass%232026@localhost:3306/library"
)
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_recycle": 280, "pool_pre_ping": True}

# ---- Terminal ----
flask --app app init-db`,
      result: `Database tables created.

mysql> DESCRIBE book;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int          | NO   | PRI | NULL    | auto_increment |
| title      | varchar(150) | NO   | UNI | NULL    |                |
| author     | varchar(100) | NO   | MUL | NULL    |                |
| price      | float        | NO   |     | NULL    |                |
| in_stock   | tinyint(1)   | NO   |     | NULL    |                |
| summary    | text         | YES  |     | NULL    |                |
| created_at | datetime     | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+`,
      explanation: "Only the URI changed - the ORM code is the same. Special characters in passwords must be URL-encoded (# becomes %23). pool_recycle avoids 'MySQL server has gone away' after idle time. Python-side defaults do not appear as DB defaults.",
    },
    {
      title: "Pure Python demo: the SQL that the ORM runs for CRUD",
      scenario: "See the INSERT / SELECT / UPDATE / DELETE statements behind db.session using the built-in sqlite3 module.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `@@FD06@@`,
      python: { files: { "main.py": `@@FD06@@` } },
      result: `(1, 'Flask Basics', 299.0)
(2, 'Python Tricks', 450.0)
(3, 'SQL Guide', 199.0)
After update/delete:
(1, 'Flask Basics', 349.0)
(2, 'Python Tricks', 450.0)`,
      explanation: "The ORM generates exactly these parameterised statements for you. The ? placeholders are what keeps queries safe from SQL injection; SQLAlchemy does the same automatically.",
    },
  ],
  interview: [
    { q: "What is an ORM and its advantages?", a: "Object Relational Mapper maps classes to tables and objects to rows. Advantages: write Python instead of SQL, database independence, protection from SQL injection via bound parameters, relationships as attributes, easier testing.", level: "Easy" },
    { q: "Difference between SQLAlchemy and Flask-SQLAlchemy?", a: "SQLAlchemy is the standalone ORM/toolkit. Flask-SQLAlchemy is a Flask extension that configures SQLAlchemy from app.config, manages a scoped session per request, and adds helpers like db.Model, get_or_404, first_or_404 and paginate.", level: "Medium" },
    { q: "What does db.create_all() do and what are its limits?", a: "It creates tables for all imported models that do not yet exist. It does not alter existing tables (adding a column will not happen) - use migrations (Flask-Migrate) for schema changes.", level: "Medium" },
    { q: "What is db.session?", a: "A SQLAlchemy Session (unit of work) scoped to the current app context. It tracks new, changed and deleted objects and sends them to the database in one transaction on commit().", level: "Medium" },
    { q: "How do you fetch a row by primary key or return 404?", a: "db.get_or_404(Book, book_id) in Flask-SQLAlchemy 3; plain SQLAlchemy uses db.session.get(Book, id), which returns None if missing.", level: "Easy" },
    { q: "Difference between filter_by() and where()/filter()?", a: "filter_by uses keyword arguments for simple equality (filter_by(author='X')); where/filter accepts SQL expressions (Book.price > 300, Book.title.ilike('%py%'), or_(...)).", level: "Medium" },
    { q: "What happens if you forget db.session.commit()?", a: "Changes stay pending in the session and are discarded (rolled back) when the request ends - nothing is saved to the database.", level: "Easy" },
    { q: "How do you handle a duplicate value on a unique column?", a: "Catch sqlalchemy.exc.IntegrityError around commit, call db.session.rollback(), and show a friendly error; optionally check existence before inserting.", level: "Medium" },
    { q: "What does Mapped[str | None] mean in a model?", a: "The column is nullable. Mapped[str] without None makes it NOT NULL. The annotation drives both typing and nullability in SQLAlchemy 2.0 style.", level: "Hard" },
    { q: "How do you paginate in Flask-SQLAlchemy 3?", a: "pagination = db.paginate(db.select(Model), page=page, per_page=10); use pagination.items, .pages, .total, .has_next, .next_num in templates.", level: "Medium" },
    { q: "Why use POST for delete instead of a GET link?", a: "GET must be safe and idempotent; crawlers, prefetchers or a malicious <img> tag could trigger a GET. POST with a CSRF token prevents accidental and forged deletions.", level: "Medium" },
    { q: "What is the 'Working outside of application context' error?", a: "Flask-SQLAlchemy needs the current app; code that runs outside a request (scripts, shell) must be wrapped in 'with app.app_context():' or run via flask shell / CLI commands.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a Student model (id, name, email unique, marks int default 0) and insert 3 students from flask shell.",
      hint: "Mapped[int], mapped_column(String(120), unique=True).",
      solution: `class Student(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    marks: Mapped[int] = mapped_column(default=0)

# flask --app app shell
>>> db.create_all()
>>> db.session.add_all([Student(name="Asha", email="a@x.com", marks=88),
...                     Student(name="Ravi", email="r@x.com", marks=67),
...                     Student(name="Meena", email="m@x.com", marks=92)])
>>> db.session.commit()`,
    },
    {
      task: "Write queries: students with marks > 80 ordered by marks desc; count of all students; average marks.",
      hint: "db.select(...).where(...).order_by(...desc()); db.func.count / db.func.avg.",
      solution: `toppers = db.session.execute(
    db.select(Student).where(Student.marks > 80).order_by(Student.marks.desc())
).scalars().all()
total = db.session.scalar(db.select(db.func.count(Student.id)))
average = db.session.scalar(db.select(db.func.avg(Student.marks)))`,
    },
    {
      task: "Add a /books/<id> detail page that shows all fields or 404.",
      hint: "db.get_or_404",
      solution: `@app.route("/books/<int:book_id>")
def book_detail(book_id):
    book = db.get_or_404(Book, book_id)
    return render_template("book_detail.html", book=book)

{# book_detail.html #}
{% extends "base.html" %}
{% block content %}
<h2>{{ book.title }}</h2>
<p>By {{ book.author }} - Rs. {{ book.price }}</p>
<p>{{ book.summary or "No summary" }}</p>
{% endblock %}`,
    },
    {
      task: "Add a JSON endpoint /api/books returning id, title and price of all in-stock books.",
      hint: "filter_by(in_stock=True) and a list comprehension.",
      solution: `@app.get("/api/books")
def api_books():
    books = db.session.execute(db.select(Book).filter_by(in_stock=True)).scalars()
    return [{"id": b.id, "title": b.title, "price": b.price} for b in books]`,
    },
  ],
  quiz: [
    {
      question: "Which call saves pending changes to the database?",
      options: ["db.session.add()", "db.session.flush_all()", "db.session.commit()", "db.save()"],
      answer: 2,
      explanation: "commit() ends the transaction and persists changes.",
    },
    {
      question: "In Flask-SQLAlchemy 3, which returns a Book or a 404 response?",
      options: ["db.get_or_404(Book, 5)", "Book.get(5)", "db.session.find(5)", "db.select(5)"],
      answer: 0,
      explanation: "db.get_or_404 is the modern helper.",
    },
    {
      question: "What does db.create_all() NOT do?",
      options: ["Create missing tables", "Use model metadata", "Need an app context", "Add a new column to an existing table"],
      answer: 3,
      explanation: "Schema changes need migrations.",
    },
    {
      question: "Correct SQLite URI for a file library.db in the instance folder?",
      options: ["sqlite://library.db", "sqlite:///library.db", "sqlite:library.db", "file:///library.db"],
      answer: 1,
      explanation: "Three slashes = relative path; Flask-SQLAlchemy puts it in instance/.",
    },
    {
      question: "Which expression finds titles containing 'flask' ignoring case?",
      options: ["Book.title == '%flask%'", "Book.title.like('FLASK')", "Book.title.ilike('%flask%')", "Book.title.contains_case('flask')"],
      answer: 2,
      explanation: "ilike is case-insensitive LIKE with % wildcards.",
    },
  ],
};
