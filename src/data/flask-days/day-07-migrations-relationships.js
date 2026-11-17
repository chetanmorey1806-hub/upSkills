export default {
  id: "day-07-migrations-relationships",
  title: "Database Migrations (Flask-Migrate), Relationships",
  module: "Module 2: Database & Auth",
  day: 7,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Evolve your database schema safely with Flask-Migrate (Alembic) using init, migrate, upgrade and downgrade, and model real-world links between tables: one-to-many, one-to-one and many-to-many with relationship(), back_populates, ForeignKey and cascades.",
  objectives: [
    "Explain why db.create_all() is not enough and what a migration is",
    "Set up Flask-Migrate and use flask db init / migrate / upgrade / downgrade / history / current",
    "Review and edit an auto-generated Alembic migration script",
    "Model one-to-many, one-to-one and many-to-many relationships with SQLAlchemy 2.0 style",
    "Use cascade delete, lazy loading options and avoid the N+1 query problem",
  ],
  theory: [
    {
      heading: "Why Migrations?",
      content: "Your schema changes as the app grows: today Post has title and body; next week you add views and a category. db.create_all() only creates missing tables - it never adds columns to existing ones, and dropping the table would lose real user data. A migration is a versioned Python script that describes a schema change (upgrade) and how to undo it (downgrade). Analogy: Git for your database structure - every change is a commit you can apply or roll back on every machine (your laptop, teammate's laptop, production). Flask-Migrate is a thin Flask wrapper around Alembic, the migration tool written by the SQLAlchemy author.",
      points: [
        "Migration = upgrade() + downgrade() functions with a unique revision id",
        "Alembic stores the current version in a table called alembic_version",
        "Migration files are committed to Git so the whole team shares the same schema history",
        "Never edit the database by hand in production; always ship a migration",
      ],
    },
    {
      heading: "Flask-Migrate Commands",
      content: "Install with pip install Flask-Migrate and create migrate = Migrate(app, db). Then use the flask db command group. Workflow: change your models -> flask db migrate -m 'message' (autogenerate a script by comparing models with the DB) -> REVIEW the script -> flask db upgrade (apply). Run flask db init only once per project; it creates the migrations/ folder.",
      syntax: "flask db init                      # once: creates migrations/\nflask db migrate -m \"create posts\"  # generate script\nflask db upgrade                   # apply to database\nflask db downgrade                 # undo last migration\nflask db history                   # list revisions\nflask db current                   # show DB version",
      points: [
        "Autogenerate detects: new/removed tables and columns, nullable changes, indexes, unique constraints, foreign keys",
        "It does NOT reliably detect: column renames (seen as drop + add -> data loss!), table renames, some type changes - edit the script manually",
        "Adding a NOT NULL column to a table with rows needs server_default or a 3-step migration",
        "SQLite has limited ALTER TABLE; enable render_as_batch=True in Migrate(app, db, render_as_batch=True)",
      ],
      tip: "Golden rule: always open and read the generated file in migrations/versions/ before running upgrade.",
    },
    {
      heading: "One-to-Many Relationships",
      content: "One author writes many posts; each post has one author. In the database the 'many' side stores a foreign key column (post.author_id -> author.id). In SQLAlchemy we add a ForeignKey column on Post and relationship() attributes on both classes linked with back_populates, so you can write author.posts (a list) and post.author (an object). Analogy: a class teacher (one) and students (many) - every student's record holds the teacher's id.",
      syntax: "class Author(db.Model):\n    id: Mapped[int] = mapped_column(primary_key=True)\n    posts: Mapped[list['Post']] = relationship(back_populates='author', cascade='all, delete-orphan')\n\nclass Post(db.Model):\n    id: Mapped[int] = mapped_column(primary_key=True)\n    author_id: Mapped[int] = mapped_column(ForeignKey('author.id'))\n    author: Mapped['Author'] = relationship(back_populates='posts')",
      points: [
        "ForeignKey('author.id') uses the TABLE name, relationship('Author') uses the CLASS name",
        "cascade='all, delete-orphan': deleting an author deletes their posts; removing a post from author.posts deletes it",
        "Without cascade, deleting a parent that still has children raises an IntegrityError (or sets NULL)",
        "back_populates (explicit, both sides) is preferred over the older backref",
      ],
    },
    {
      heading: "One-to-One and Many-to-Many",
      content: "One-to-one is a one-to-many with a single object on the 'many' side: a User has one Profile. Put a unique foreign key on Profile and use Mapped['Profile'] (not a list) on User. Many-to-many: a post can have many tags and a tag belongs to many posts. You need a third association table (post_tag) with two foreign keys; pass it as secondary= in relationship(). Analogy: students and courses - the enrolment register is the association table. If the link itself needs extra data (enrolled_on, grade), use an association MODEL instead of a plain table.",
      syntax: "post_tag = db.Table('post_tag',\n    db.Column('post_id', ForeignKey('post.id'), primary_key=True),\n    db.Column('tag_id', ForeignKey('tag.id'), primary_key=True))\n\ntags: Mapped[list['Tag']] = relationship(secondary=post_tag, back_populates='posts')",
    },
    {
      heading: "Loading Strategies and the N+1 Problem",
      content: "By default relationships are lazy='select': author.posts runs a new query the first time you access it. In a template that loops over 50 posts and prints post.author.name you may fire 1 query for posts + 50 for authors = N+1 queries, which is slow. Fix it with eager loading in the query: db.select(Post).options(selectinload(Post.author)) or joinedload. lazy='dynamic' is legacy; in SQLAlchemy 2.0 use lazy='write_only' for very large collections.",
      points: [
        "selectinload: 1 extra query with WHERE id IN (...) - best for collections",
        "joinedload: a JOIN in the same query - good for many-to-one (post.author)",
        "Turn on SQLALCHEMY_ECHO to count queries while developing",
      ],
    },
  ],
  examples: [
    {
      title: "Set up Flask-Migrate and create the first migration",
      scenario: "Start a blog project and manage tables only through migrations from day one.",
      steps: [
        "Create blog_db folder; open in VS Code (select .venv) or PyCharm (venv interpreter)",
        "pip install Flask Flask-SQLAlchemy Flask-Migrate and pip freeze > requirements.txt",
        "Create models.py and app.py as below",
        "Run flask --app app db init (creates migrations/)",
        "Run flask --app app db migrate -m \"create author and post\" and open the file in migrations/versions/",
        "Run flask --app app db upgrade, then flask --app app db current",
        "Tip: create a .flaskenv file with FLASK_APP=app (pip install python-dotenv) so you can type just flask db upgrade",
      ],
      code: `# Project tree
blog_db/
├── .flaskenv
├── app.py
├── models.py
├── requirements.txt
├── instance/blog.db
└── migrations/
    ├── alembic.ini
    ├── env.py
    ├── script.py.mako
    └── versions/
        └── 1a2b3c4d5e6f_create_author_and_post.py

# ---- requirements.txt ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.7
python-dotenv==1.0.1

# ---- .flaskenv ----
FLASK_APP=app
FLASK_DEBUG=1

# ---- models.py ----
from datetime import datetime, timezone
from typing import Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class Author(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Author {self.name}>"


class Post(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    author_id: Mapped[int] = mapped_column(ForeignKey("author.id"))
    author: Mapped["Author"] = relationship(back_populates="posts")

    def __repr__(self):
        return f"<Post {self.title!r}>"


# ---- app.py ----
from flask import Flask
from flask_migrate import Migrate
from models import db, Author, Post

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///blog.db"
db.init_app(app)
migrate = Migrate(app, db, render_as_batch=True)   # batch mode helps SQLite ALTERs


@app.shell_context_processor
def ctx():
    return {"db": db, "Author": Author, "Post": Post}


# ---- Terminal ----
flask db init
flask db migrate -m "create author and post"
flask db upgrade
flask db current

# ---- migrations/versions/1a2b3c4d5e6f_create_author_and_post.py (generated) ----
"""create author and post

Revision ID: 1a2b3c4d5e6f
Revises:
Create Date: 2026-11-17 10:15:00
"""
from alembic import op
import sqlalchemy as sa

revision = "1a2b3c4d5e6f"
down_revision = None


def upgrade():
    op.create_table(
        "author",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "post",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["author.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("post")
    op.drop_table("author")`,
      result: `$ flask db init
  Creating directory .../blog_db/migrations ...  done
  Please edit configuration/connection/logging settings in .../migrations/alembic.ini before proceeding.

$ flask db migrate -m "create author and post"
INFO  [alembic.autogenerate.compare] Detected added table 'author'
INFO  [alembic.autogenerate.compare] Detected added table 'post'
  Generating .../migrations/versions/1a2b3c4d5e6f_create_author_and_post.py ...  done

$ flask db upgrade
INFO  [alembic.runtime.migration] Running upgrade  -> 1a2b3c4d5e6f, create author and post

$ flask db current
1a2b3c4d5e6f (head)`,
      explanation: "Migrate(app, db) registers the flask db commands. migrate compares models with the database and writes a script; upgrade runs it and records the revision in alembic_version. downgrade() is the exact reverse.",
    },
    {
      title: "Add a column to a table that already has data",
      scenario: "The blog is live with posts. Product owner asks for a 'views' counter and an optional 'summary'.",
      steps: [
        "Add the two new columns to Post in models.py",
        "Run flask db migrate -m \"add views and summary to post\"",
        "Open the new file in migrations/versions/ and check server_default is present",
        "Run flask db upgrade; check existing rows got views = 0",
        "Practice undo: flask db downgrade, then flask db upgrade again",
      ],
      code: `# ---- models.py (Post: add two lines) ----
from sqlalchemy import Integer

class Post(db.Model):
    # ... existing columns ...
    views: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    summary: Mapped[str | None] = mapped_column(String(300))


# ---- generated: migrations/versions/9f8e7d6c5b4a_add_views_and_summary_to_post.py ----
revision = "9f8e7d6c5b4a"
down_revision = "1a2b3c4d5e6f"


def upgrade():
    with op.batch_alter_table("post", schema=None) as batch_op:
        batch_op.add_column(sa.Column("views", sa.Integer(), server_default="0", nullable=False))
        batch_op.add_column(sa.Column("summary", sa.String(length=300), nullable=True))


def downgrade():
    with op.batch_alter_table("post", schema=None) as batch_op:
        batch_op.drop_column("summary")
        batch_op.drop_column("views")


# ---- Terminal ----
flask db migrate -m "add views and summary to post"
flask db upgrade
flask db history
flask db downgrade      # back to 1a2b3c4d5e6f
flask db upgrade        # forward again`,
      result: `$ flask db history
1a2b3c4d5e6f -> 9f8e7d6c5b4a (head), add views and summary to post
<base> -> 1a2b3c4d5e6f, create author and post

Existing posts now have views = 0 and summary = NULL. No data lost.`,
      explanation: "server_default='0' tells the DATABASE to fill existing rows; a Python default= alone would fail with 'NOT NULL constraint failed' on a non-empty table. Batch mode copies the table behind the scenes because SQLite cannot alter columns in place.",
    },
    {
      title: "Many-to-many tags, one-to-one profile and querying relationships",
      scenario: "Posts need tags (python, flask, sql) and authors need a profile with a bio.",
      steps: [
        "Add the association table, Tag and Profile models to models.py",
        "flask db migrate -m \"tags and profile\" then flask db upgrade",
        "Open flask shell and run the commands",
        "Turn on SQLALCHEMY_ECHO=True and compare the number of queries with and without selectinload",
      ],
      code: `# ---- models.py (add) ----
post_tag = db.Table(
    "post_tag",
    db.Column("post_id", ForeignKey("post.id"), primary_key=True),
    db.Column("tag_id", ForeignKey("tag.id"), primary_key=True),
)


class Tag(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30), unique=True)
    posts: Mapped[list["Post"]] = relationship(secondary=post_tag, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"


class Profile(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    bio: Mapped[str | None] = mapped_column(String(300))
    author_id: Mapped[int] = mapped_column(ForeignKey("author.id"), unique=True)
    author: Mapped["Author"] = relationship(back_populates="profile")


# In Author add:
#     profile: Mapped[Optional["Profile"]] = relationship(back_populates="author", cascade="all, delete-orphan")
# In Post add:
#     tags: Mapped[list["Tag"]] = relationship(secondary=post_tag, back_populates="posts")


# ---- flask shell ----
>>> asha = Author(name="Asha", email="asha@blog.com")
>>> asha.profile = Profile(bio="Python trainer")
>>> py, fl = Tag(name="python"), Tag(name="flask")
>>> p1 = Post(title="Hello Flask", body="...", author=asha, tags=[py, fl])
>>> p2 = Post(title="Python Tips", body="...", author=asha, tags=[py])
>>> db.session.add(asha); db.session.commit()
>>> asha.posts
>>> p1.author.name, asha.profile.bio
>>> py.posts
>>> [t.name for t in p1.tags]
>>> # posts that have the tag 'flask'
>>> db.session.execute(db.select(Post).join(Post.tags).where(Tag.name == "flask")).scalars().all()
>>> # eager loading to avoid N+1
>>> from sqlalchemy.orm import selectinload
>>> posts = db.session.execute(db.select(Post).options(selectinload(Post.author), selectinload(Post.tags))).scalars().all()
>>> # posts per author
>>> db.session.execute(db.select(Author.name, db.func.count(Post.id)).join(Author.posts).group_by(Author.id)).all()
>>> db.session.delete(asha); db.session.commit()   # cascade removes posts + profile
>>> db.session.scalar(db.select(db.func.count(Post.id)))`,
      result: `[<Post 'Hello Flask'>, <Post 'Python Tips'>]
('Asha', 'Python trainer')
[<Post 'Hello Flask'>, <Post 'Python Tips'>]
['python', 'flask']
[<Post 'Hello Flask'>]
[('Asha', 2)]
0`,
      explanation: "Assigning post.author or author.profile fills the foreign keys automatically; adding asha also adds related objects (save-update cascade). secondary=post_tag manages rows in the link table. join(Post.tags) filters through the association. cascade='all, delete-orphan' deletes child posts and the profile with the author; the link rows in post_tag are removed automatically.",
    },
    {
      title: "Pure Python demo: a migration and a one-to-many join in SQL",
      scenario: "See what ALTER TABLE and a foreign-key join look like underneath Flask-Migrate and relationship().",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `@@FD07@@`,
      python: { files: { "main.py": `@@FD07@@` } },
      result: `('Asha', 2, 10)
('Ravi', 1, 0)`,
      explanation: "ALTER TABLE ... ADD COLUMN ... DEFAULT 0 is what the upgrade() generates; existing rows keep their data. The JOIN on post.author_id = author.id is what author.posts uses under the hood.",
    },
  ],
  interview: [
    { q: "What is a database migration?", a: "A versioned script that changes the database schema (upgrade) and can undo it (downgrade), letting teams evolve schemas without losing data and keep every environment in sync.", level: "Easy" },
    { q: "What is Flask-Migrate?", a: "A Flask extension that integrates Alembic with Flask-SQLAlchemy and exposes commands under 'flask db' (init, migrate, upgrade, downgrade, history, current, stamp).", level: "Easy" },
    { q: "Difference between flask db migrate and flask db upgrade?", a: "migrate generates a new migration script by comparing models to the database; upgrade applies pending scripts to the database.", level: "Easy" },
    { q: "What can autogenerate miss?", a: "Column and table renames (treated as drop + add), some type changes, changes to server defaults and constraints without names, data migrations. Always review the generated script.", level: "Hard" },
    { q: "How do you add a NOT NULL column to a table with existing rows?", a: "Give it a server_default so the database fills existing rows, or do it in steps: add as nullable, back-fill data, then alter to NOT NULL.", level: "Hard" },
    { q: "Where does Alembic store the current schema version?", a: "In the alembic_version table in your database (one row with the revision id).", level: "Medium" },
    { q: "How do you define a one-to-many relationship?", a: "Add a ForeignKey column on the many side (post.author_id) and relationship() on both sides with back_populates; the one side uses Mapped[list['Child']].", level: "Medium" },
    { q: "What is the difference between backref and back_populates?", a: "backref defines the reverse attribute implicitly from one side; back_populates requires declaring both sides explicitly, which is clearer and is the recommended style.", level: "Medium" },
    { q: "How is a many-to-many relationship implemented?", a: "With an association table holding two foreign keys, passed as secondary= to relationship() on both models. If extra data is needed on the link, use an association model.", level: "Medium" },
    { q: "What does cascade='all, delete-orphan' mean?", a: "Operations on the parent (save, delete, merge, ...) cascade to children, and a child removed from the parent's collection is deleted (orphan).", level: "Hard" },
    { q: "What is the N+1 query problem and how to fix it in SQLAlchemy?", a: "Loading N parents then lazily loading each child relation causes N extra queries. Fix with eager loading: selectinload() or joinedload() in the select options.", level: "Hard" },
    { q: "Why use render_as_batch=True with SQLite?", a: "SQLite cannot ALTER/DROP columns in many cases; batch mode recreates the table with the new schema and copies data.", level: "Hard" },
  ],
  practice: [
    {
      task: "Add a Category model (one category has many posts) and generate + apply the migration.",
      hint: "ForeignKey on Post, relationship on both; nullable first if posts already exist.",
      solution: `class Category(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    posts: Mapped[list["Post"]] = relationship(back_populates="category")

# in Post
category_id: Mapped[int | None] = mapped_column(ForeignKey("category.id"))
category: Mapped[Optional["Category"]] = relationship(back_populates="posts")

# terminal
flask db migrate -m "add category"
flask db upgrade`,
    },
    {
      task: "Write a query that lists each tag with the number of posts using it, most used first.",
      hint: "select(Tag.name, func.count(Post.id)).join(Tag.posts).group_by(Tag.id)",
      solution: `rows = db.session.execute(
    db.select(Tag.name, db.func.count(Post.id).label("total"))
    .join(Tag.posts)
    .group_by(Tag.id)
    .order_by(db.desc("total"))
).all()
for name, total in rows:
    print(name, total)`,
    },
    {
      task: "Rename column Post.body to Post.content WITHOUT losing data by editing the migration.",
      hint: "Replace drop/add with alter_column(new_column_name=...).",
      solution: `def upgrade():
    with op.batch_alter_table("post") as batch_op:
        batch_op.alter_column("body", new_column_name="content")


def downgrade():
    with op.batch_alter_table("post") as batch_op:
        batch_op.alter_column("content", new_column_name="body")`,
    },
    {
      task: "Create a Student/Course many-to-many with an Enrollment association model that stores grade.",
      hint: "Enrollment has two FKs as composite primary key plus grade.",
      solution: `class Enrollment(db.Model):
    student_id: Mapped[int] = mapped_column(ForeignKey("student.id"), primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id"), primary_key=True)
    grade: Mapped[str | None] = mapped_column(String(2))
    student: Mapped["Student"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")


class Student(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="student")


class Course(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(80))
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course")`,
    },
  ],
  quiz: [
    {
      question: "Which command creates the migrations folder (run once)?",
      options: ["flask db init", "flask db upgrade", "flask db create", "flask db start"],
      answer: 0,
      explanation: "init sets up the Alembic environment.",
    },
    {
      question: "Where is the foreign key placed in a one-to-many relationship?",
      options: ["On the 'one' side", "In an association table", "On the 'many' side", "In alembic_version"],
      answer: 2,
      explanation: "Each child row stores its parent's id.",
    },
    {
      question: "What does flask db downgrade do?",
      options: ["Deletes the migrations folder", "Reverts the last applied migration", "Downgrades Flask version", "Drops the database"],
      answer: 1,
      explanation: "It runs downgrade() of the current revision.",
    },
    {
      question: "Which relationship option names the association table for many-to-many?",
      options: ["cascade=", "lazy=", "foreign_keys=", "secondary="],
      answer: 3,
      explanation: "secondary points to the link table.",
    },
    {
      question: "Autogenerate sees a renamed column as...",
      options: ["a rename", "a drop and an add (data loss risk)", "no change", "an error"],
      answer: 1,
      explanation: "Review and fix with alter_column(new_column_name=...).",
    },
  ],
};
