export default {
  id: "day-04-databases-sqlite3-sqlalchemy",
  title: "Databases in Python: sqlite3 and SQLAlchemy 2.0 ORM",
  module: "Module 2: Data & Apps",
  day: 4,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Store and query data from Python using the built-in sqlite3 module, then move to SQLAlchemy 2.0 ORM to work with tables as Python classes, sessions, relationships and full CRUD.",
  objectives: [
    "Connect to SQLite, create tables and run parameterized queries with sqlite3",
    "Use commit, rollback and the connection context manager for transactions",
    "Define SQLAlchemy 2.0 models with DeclarativeBase, Mapped and mapped_column",
    "Perform CRUD with Session, select() and relationships",
    "Explain ORM vs raw SQL trade-offs and the N+1 query problem in interviews",
  ],
  theory: [
    {
      heading: "Why Databases and Why SQLite?",
      content: "Lists and dictionaries live in RAM and disappear when your program stops. A database stores data permanently on disk, lets many users read and write safely, and lets you search millions of rows quickly with SQL.\n\n**SQLite** is a small database engine that stores the whole database in a single file (for example `shop.db`). It needs no server and no installation, because Python ships with the `sqlite3` module. It is perfect for learning, small apps, desktop tools, tests and mobile apps. For production web apps with many concurrent writers, companies usually use **PostgreSQL** or **MySQL** - but the Python code looks almost the same.",
      points: [
        "sqlite3 is part of the standard library - no pip install needed",
        "Use the special name \":memory:\" for a temporary in-RAM database (great for tests)",
        "SQLite has dynamic typing: INTEGER, REAL, TEXT, BLOB, NULL",
      ],
    },
    {
      heading: "sqlite3 Basics: Connection, Cursor, Execute, Commit",
      content: "The workflow is always the same: open a **connection**, get a **cursor** (or call `conn.execute` directly), run SQL with `execute()` or `executemany()`, then `commit()` to save changes and `close()` when done. Read results with `fetchone()`, `fetchall()` or by looping over the cursor.\n\nAlways use **placeholders** (`?`) instead of building SQL with f-strings. Placeholders protect against **SQL injection** and handle quotes in values automatically.",
      syntax: `import sqlite3

conn = sqlite3.connect("shop.db")      # creates file if missing
cur = conn.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)")
cur.execute("INSERT INTO items (name) VALUES (?)", ("Pen",))   # note the tuple
conn.commit()
rows = cur.execute("SELECT * FROM items").fetchall()
conn.close()
`,
      tip: "A single value still needs a tuple: (\"Pen\",) with a trailing comma. Writing (\"Pen\") is just a string and causes a binding error.",
    },
    {
      heading: "Transactions, Row Factory and Context Managers",
      content: "A **transaction** groups several statements so they all succeed or all fail (atomicity). In sqlite3, using the connection as a context manager - `with conn:` - commits automatically if the block succeeds and rolls back if an exception happens. Note: `with conn:` does NOT close the connection.\n\nSetting `conn.row_factory = sqlite3.Row` lets you read columns by name (`row[\"name\"]`) and convert rows to dicts with `dict(row)`.",
      points: [
        "commit() saves changes; rollback() undoes uncommitted changes",
        "cursor.rowcount tells how many rows an UPDATE/DELETE affected",
        "cursor.lastrowid gives the id of the last inserted row",
      ],
    },
    {
      heading: "What is an ORM? Introducing SQLAlchemy 2.0",
      content: "An **ORM (Object Relational Mapper)** maps database tables to Python classes and rows to objects. Instead of writing `INSERT INTO users ...`, you create a `User(...)` object and add it to a session. **SQLAlchemy** is the most popular Python ORM; it works with SQLite, PostgreSQL, MySQL, Oracle and SQL Server, and is used by Flask (Flask-SQLAlchemy) and FastAPI projects. Django has its own ORM.\n\nSQLAlchemy 2.0 introduced a modern, type-hinted style: models inherit from `DeclarativeBase`, columns use `Mapped[...]` and `mapped_column()`, and queries use `select()` with `session.execute()` / `session.scalars()`. The old `session.query(User)` style still works but is called **legacy**.",
      syntax: `pip install sqlalchemy

from sqlalchemy import create_engine, String, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str | None]          # nullable because of Optional type

engine = create_engine("sqlite:///app.db", echo=True)   # echo prints SQL
Base.metadata.create_all(engine)
`,
    },
    {
      heading: "Engine, Session and CRUD",
      content: "The **Engine** manages database connections (a connection pool). The **Session** is your unit of work: you add, change and delete objects, and on `commit()` SQLAlchemy sends the right INSERT/UPDATE/DELETE statements in one transaction.\n\nCommon operations: `session.add(obj)`, `session.add_all([...])`, `session.get(User, 1)` (by primary key), `session.scalars(select(User).where(User.name == \"Asha\")).all()`, change attributes then `commit()` to update, `session.delete(obj)` to delete.",
      points: [
        "Use `with Session(engine) as session:` so the session is always closed",
        "`session.begin()` as a context manager commits or rolls back automatically",
        "Database URL format: dialect+driver://user:password@host:port/dbname, e.g. postgresql+psycopg://app:secret@localhost:5432/shop",
      ],
      tip: "Never hard-code the database password in code. Read the URL from an environment variable like DATABASE_URL.",
    },
    {
      heading: "Relationships: One-to-Many and Many-to-One",
      content: "Real data is connected: one customer has many orders. In SQL this is a **foreign key** column in the child table. In SQLAlchemy you add a `ForeignKey` column plus a `relationship()` on both sides with `back_populates` so Python can navigate `customer.orders` and `order.customer`.\n\nBy default relationships are **lazy loaded**: the related rows are fetched only when you access the attribute. Looping over 100 customers and touching `customer.orders` fires 100 extra queries - the famous **N+1 problem**. Fix it with eager loading such as `selectinload(Customer.orders)`.",
      syntax: `class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    orders: Mapped[list["Order"]] = relationship(back_populates="customer",
                                                 cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[float]
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped["Customer"] = relationship(back_populates="orders")
`,
    },
    {
      heading: "Migrations and Best Practices",
      content: "`create_all()` only creates missing tables; it never changes existing ones. In real projects you use **Alembic** (made by the SQLAlchemy author) to version your schema: `alembic revision --autogenerate -m \"add phone\"` then `alembic upgrade head`. This is like Django's makemigrations/migrate.",
      points: [
        "Keep one engine per application; create short-lived sessions per request or task",
        "Always use parameters (sqlite3 ?) or ORM expressions - never f-string SQL",
        "Add indexes (index=True) on columns you filter often",
        "Use echo=True while learning to see the SQL the ORM generates",
      ],
    },
  ],
  examples: [
    {
      title: "Create a Table, Insert Many Rows and Query with sqlite3",
      scenario: "A coaching institute wants to store student marks and find students from Pune plus the class average.",
      steps: [
        "Create a project folder and a file main.py (no pip install needed)",
        "Paste the code; \":memory:\" keeps the database in RAM for this demo",
        "Run: python main.py",
        "Change \":memory:\" to \"students.db\" to save to a real file and open it with DB Browser for SQLite",
      ],
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("""
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT,
    marks INTEGER
)
""")
rows = [("Asha", "Pune", 88), ("Ravi", "Delhi", 72), ("Meena", "Pune", 95)]
cur.executemany("INSERT INTO students (name, city, marks) VALUES (?, ?, ?)", rows)
conn.commit()

cur.execute("SELECT id, name, marks FROM students WHERE city = ?", ("Pune",))
for row in cur.fetchall():
    print(row)

cur.execute("SELECT COUNT(*), AVG(marks) FROM students")
count, avg = cur.fetchone()
print(f"Count={count}, Avg={avg:.2f}")
conn.close()
`,
      python: {
        files: {
          "main.py": `import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("""
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT,
    marks INTEGER
)
""")
rows = [("Asha", "Pune", 88), ("Ravi", "Delhi", 72), ("Meena", "Pune", 95)]
cur.executemany("INSERT INTO students (name, city, marks) VALUES (?, ?, ?)", rows)
conn.commit()

cur.execute("SELECT id, name, marks FROM students WHERE city = ?", ("Pune",))
for row in cur.fetchall():
    print(row)

cur.execute("SELECT COUNT(*), AVG(marks) FROM students")
count, avg = cur.fetchone()
print(f"Count={count}, Avg={avg:.2f}")
conn.close()
`,
        },
      },
      result: `(1, 'Asha', 88)
(3, 'Meena', 95)
Count=3, Avg=85.00`,
      explanation: "executemany() inserts all three tuples using the same parameterized statement. The WHERE city = ? query receives (\"Pune\",) safely. Each row comes back as a tuple. fetchone() on the aggregate query returns one tuple that we unpack into count and avg.",
    },
    {
      title: "UPDATE, DELETE and sqlite3.Row",
      scenario: "A stationery shop updates a price, removes low-stock items and prints products by column name.",
      steps: [
        "Create main.py and paste the code",
        "Run: python main.py",
        "Notice how rowcount reports the deleted rows and how Row objects allow p[\"name\"]",
      ],
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER)")
conn.executemany(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [("Pen", 10.0, 100), ("Notebook", 45.5, 40), ("Bag", 799.0, 5)],
)
conn.commit()

# UPDATE
conn.execute("UPDATE products SET price = ? WHERE name = ?", (49.0, "Notebook"))
# DELETE
cur = conn.execute("DELETE FROM products WHERE stock < ?", (10,))
print("Deleted rows:", cur.rowcount)
conn.commit()

# READ with sqlite3.Row (access by column name)
for p in conn.execute("SELECT * FROM products ORDER BY price DESC"):
    print(p["id"], p["name"], p["price"], p["stock"])

print(dict(conn.execute("SELECT * FROM products WHERE id = 1").fetchone()))
conn.close()
`,
      python: {
        files: {
          "main.py": `import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER)")
conn.executemany(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [("Pen", 10.0, 100), ("Notebook", 45.5, 40), ("Bag", 799.0, 5)],
)
conn.commit()

# UPDATE
conn.execute("UPDATE products SET price = ? WHERE name = ?", (49.0, "Notebook"))
# DELETE
cur = conn.execute("DELETE FROM products WHERE stock < ?", (10,))
print("Deleted rows:", cur.rowcount)
conn.commit()

# READ with sqlite3.Row (access by column name)
for p in conn.execute("SELECT * FROM products ORDER BY price DESC"):
    print(p["id"], p["name"], p["price"], p["stock"])

print(dict(conn.execute("SELECT * FROM products WHERE id = 1").fetchone()))
conn.close()
`,
        },
      },
      result: `Deleted rows: 1
2 Notebook 49.0 40
1 Pen 10.0 100
{'id': 1, 'name': 'Pen', 'price': 10.0, 'stock': 100}`,
      explanation: "conn.execute() is a shortcut that creates a cursor for you. The Bag (stock 5) is deleted, so rowcount is 1. Because row_factory is sqlite3.Row, each row supports access by column name and dict(row) converts it to a normal dictionary - handy for returning JSON from an API.",
    },
    {
      title: "Transactions with Rollback and Why Placeholders Matter",
      scenario: "A wallet app transfers money between users. A transfer that would make a balance negative must be fully undone. We also show a SQL injection attack.",
      steps: [
        "Create main.py and paste the code",
        "Run: python main.py",
        "Observe that the failed transfer did not credit Asha even though that UPDATE ran first",
      ],
      code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0))")
conn.executemany("INSERT INTO accounts VALUES (?, ?)", [("Asha", 1000), ("Ravi", 500)])
conn.commit()

def transfer(conn, sender, receiver, amount):
    try:
        with conn:  # commits on success, rolls back on exception
            conn.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, receiver))
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, sender))
        print(f"Transferred {amount} from {sender} to {receiver}")
    except sqlite3.IntegrityError as e:
        print("Failed, rolled back:", e)

transfer(conn, "Asha", "Ravi", 300)
transfer(conn, "Ravi", "Asha", 5000)
print(conn.execute("SELECT * FROM accounts ORDER BY name").fetchall())

# SQL injection demo
user_input = "x' OR '1'='1"
unsafe = f"SELECT COUNT(*) FROM accounts WHERE name = '{user_input}'"
print("Unsafe query rows:", conn.execute(unsafe).fetchone()[0])
safe = conn.execute("SELECT COUNT(*) FROM accounts WHERE name = ?", (user_input,)).fetchone()[0]
print("Safe query rows:", safe)
conn.close()
`,
      python: {
        files: {
          "main.py": `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0))")
conn.executemany("INSERT INTO accounts VALUES (?, ?)", [("Asha", 1000), ("Ravi", 500)])
conn.commit()

def transfer(conn, sender, receiver, amount):
    try:
        with conn:  # commits on success, rolls back on exception
            conn.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, receiver))
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, sender))
        print(f"Transferred {amount} from {sender} to {receiver}")
    except sqlite3.IntegrityError as e:
        print("Failed, rolled back:", e)

transfer(conn, "Asha", "Ravi", 300)
transfer(conn, "Ravi", "Asha", 5000)
print(conn.execute("SELECT * FROM accounts ORDER BY name").fetchall())

# SQL injection demo
user_input = "x' OR '1'='1"
unsafe = f"SELECT COUNT(*) FROM accounts WHERE name = '{user_input}'"
print("Unsafe query rows:", conn.execute(unsafe).fetchone()[0])
safe = conn.execute("SELECT COUNT(*) FROM accounts WHERE name = ?", (user_input,)).fetchone()[0]
print("Safe query rows:", safe)
conn.close()
`,
        },
      },
      result: `Transferred 300 from Asha to Ravi
Failed, rolled back: CHECK constraint failed: balance >= 0
[('Asha', 700), ('Ravi', 800)]
Unsafe query rows: 2
Safe query rows: 0`,
      explanation: "In the second transfer, Asha is credited first, then Ravi's debit violates the CHECK constraint. Because both statements run inside `with conn:`, the exception triggers a rollback and Asha's credit is undone - the balances stay 700 and 800. The f-string query turns user input into SQL, so OR '1'='1' matches every row; the ? placeholder treats it as plain text and matches nothing.",
    },
    {
      title: "SQLAlchemy 2.0 ORM: Models, Relationships and CRUD",
      scenario: "An online store keeps customers and their orders. We build it with SQLAlchemy models instead of raw SQL.",
      steps: [
        "Create and activate a virtual environment: python -m venv venv, then venv\\Scripts\\activate (Windows) or source venv/bin/activate (Linux/Mac)",
        "Install: pip install sqlalchemy",
        "Save the code as store.py and run: python store.py",
        "Set echo=True in create_engine to see the generated SQL",
      ],
      code: `from sqlalchemy import create_engine, ForeignKey, String, select, func
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column,
                            relationship, Session, selectinload)

class Base(DeclarativeBase):
    pass

class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    city: Mapped[str | None]
    orders: Mapped[list["Order"]] = relationship(
        back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"Customer({self.name!r})"

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    amount: Mapped[float]
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped[Customer] = relationship(back_populates="orders")

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # CREATE
    asha = Customer(name="Asha", city="Pune",
                    orders=[Order(amount=1200), Order(amount=300)])
    ravi = Customer(name="Ravi", city="Delhi", orders=[Order(amount=950)])
    session.add_all([asha, ravi])
    session.commit()

    # READ
    c = session.scalars(select(Customer).where(Customer.city == "Pune")).one()
    print(c, [o.amount for o in c.orders])

    # UPDATE
    ravi.city = "Mumbai"
    session.commit()
    print(session.get(Customer, ravi.id).city)

    # Eager loading avoids N+1 queries
    stmt = select(Customer).options(selectinload(Customer.orders)).order_by(Customer.name)
    for cust in session.scalars(stmt):
        print(cust.name, sum(o.amount for o in cust.orders))

    # Aggregate query
    total = session.scalar(select(func.sum(Order.amount)))
    print("Total sales:", total)

    # DELETE (cascade removes Asha's orders too)
    session.delete(asha)
    session.commit()
    print("Orders left:", session.scalar(select(func.count(Order.id))))
`,
      result: `Customer('Asha') [1200.0, 300.0]
Mumbai
Asha 1500.0
Ravi 950.0
Total sales: 2450.0
Orders left: 1`,
      explanation: "Models inherit from DeclarativeBase and declare columns with Mapped type hints; `str | None` makes city nullable. Adding the customer with an orders list saves both tables in one commit. select() builds queries, scalars() returns model objects, session.get() fetches by primary key. Changing an attribute and committing issues an UPDATE. selectinload loads all orders in one extra query instead of one per customer. cascade=\"all, delete-orphan\" deletes child orders when the parent is deleted.",
    },
  ],
  interview: [
    { q: "What is SQLite and when would you use it instead of PostgreSQL?", a: "SQLite is a serverless, file-based database engine bundled with Python (sqlite3). Use it for learning, prototypes, desktop/mobile apps, tests and low-write websites. Use PostgreSQL/MySQL when you need many concurrent writers, user management, network access, replication and production scaling.", level: "Easy" },
    { q: "Why should you use placeholders (?) instead of f-strings in SQL?", a: "Placeholders send values separately from the SQL text, so the database never interprets user input as SQL. This prevents SQL injection and also handles quotes and types correctly. f-strings like f\"... WHERE name = '{name}'\" let an attacker inject `' OR '1'='1`.", level: "Easy" },
    { q: "Difference between fetchone(), fetchall() and fetchmany()?", a: "fetchone() returns the next row as a tuple or None. fetchall() returns a list of all remaining rows. fetchmany(n) returns up to n rows - useful for processing large result sets in batches without loading everything into memory.", level: "Easy" },
    { q: "What does `with conn:` do in sqlite3?", a: "It wraps the block in a transaction: commit on success, rollback if an exception occurs. It does NOT close the connection - you still call conn.close() or use contextlib.closing().", level: "Medium" },
    { q: "What is an ORM? Pros and cons?", a: "An Object Relational Mapper maps tables to classes and rows to objects. Pros: less SQL boilerplate, database portability, safer queries, relationships as attributes, works well with migrations. Cons: can hide inefficient queries (N+1), learning curve, complex reports are sometimes easier in raw SQL. SQLAlchemy lets you mix ORM and SQL expressions.", level: "Easy" },
    { q: "Explain Engine and Session in SQLAlchemy.", a: "The Engine is created once per app with create_engine(url); it holds the connection pool and dialect. A Session is a short-lived unit of work that tracks objects you add/modify/delete and flushes them to the database in a transaction on commit(). Typically one session per web request.", level: "Medium" },
    { q: "What changed in SQLAlchemy 2.0 compared to 1.x style?", a: "2.0 uses DeclarativeBase with typed Mapped[] and mapped_column(), a unified select() API executed via session.execute()/session.scalars() for both Core and ORM, session.get() instead of query.get(), and removed autocommit/implicit behaviours. session.query() is considered legacy.", level: "Medium" },
    { q: "What is the N+1 query problem and how do you solve it?", a: "You run 1 query to load N parent rows, then accessing a lazy relationship on each parent fires N more queries. Solve with eager loading: selectinload() (one extra IN query) or joinedload() (a JOIN) in SQLAlchemy; select_related/prefetch_related in Django.", level: "Hard" },
    { q: "What does back_populates do in relationship()?", a: "It links two relationship() attributes as two sides of the same relationship, so setting order.customer = c automatically appends the order to c.orders in Python, and vice versa. It must name the attribute on the other class.", level: "Medium" },
    { q: "What is cascade='all, delete-orphan'?", a: "Cascade controls which session operations flow from parent to children. 'all' includes save-update, merge, delete etc., so deleting a customer deletes its orders. 'delete-orphan' also deletes a child that is removed from the parent's collection.", level: "Hard" },
    { q: "How do you change the schema of an existing table in a SQLAlchemy project?", a: "Use Alembic migrations: alembic init, configure target_metadata, run alembic revision --autogenerate -m \"msg\" to generate a migration script, review it, then alembic upgrade head. create_all() cannot alter existing tables.", level: "Medium" },
    { q: "What are ACID properties?", a: "Atomicity (all or nothing), Consistency (constraints always hold), Isolation (concurrent transactions do not see each other's partial work), Durability (committed data survives crashes). The wallet transfer example shows atomicity via rollback.", level: "Medium" },
  ],
  practice: [
    {
      task: "Using sqlite3 and an in-memory database, create a table employees(id, name, dept, salary). Insert 4 employees in two departments and print the average salary per department ordered by department name.",
      hint: "Use executemany for inserts and SELECT dept, AVG(salary) ... GROUP BY dept ORDER BY dept.",
      solution: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER)")
conn.executemany("INSERT INTO employees (name, dept, salary) VALUES (?, ?, ?)", [
    ("Asha", "IT", 60000), ("Ravi", "IT", 50000),
    ("Meena", "HR", 40000), ("John", "HR", 45000),
])
for dept, avg in conn.execute("SELECT dept, AVG(salary) FROM employees GROUP BY dept ORDER BY dept"):
    print(dept, avg)
conn.close()
# HR 42500.0
# IT 55000.0
`,
    },
    {
      task: "Write a function add_user(conn, name, email) that inserts a user and returns the new id. The email column must be UNIQUE; if a duplicate email is inserted, print \"Email exists\" and return None.",
      hint: "Use cursor.lastrowid and catch sqlite3.IntegrityError.",
      solution: `import sqlite3

def add_user(conn, name, email):
    try:
        with conn:
            cur = conn.execute("INSERT INTO users (name, email) VALUES (?, ?)", (name, email))
        return cur.lastrowid
    except sqlite3.IntegrityError:
        print("Email exists")
        return None

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE)")
print(add_user(conn, "Asha", "asha@mail.com"))   # 1
print(add_user(conn, "Asha2", "asha@mail.com"))  # Email exists, None
`,
    },
    {
      task: "Create SQLAlchemy 2.0 models Author and Book (one author has many books). Insert one author with two books and print the author name with the titles of their books.",
      hint: "Book needs author_id = mapped_column(ForeignKey(\"authors.id\")); both sides use relationship(back_populates=...).",
      solution: `from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase):
    pass

class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    books: Mapped[list["Book"]] = relationship(back_populates="author")

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped[Author] = relationship(back_populates="books")

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add(Author(name="R.K. Narayan", books=[Book(title="Malgudi Days"), Book(title="The Guide")]))
    s.commit()
    a = s.scalars(select(Author)).first()
    print(a.name, [b.title for b in a.books])
`,
    },
    {
      task: "Using the Customer/Order models from the example, write a query that returns each customer's name and number of orders, including customers with zero orders.",
      hint: "Use an outer join with func.count(Order.id) and group_by(Customer.id).",
      solution: `from sqlalchemy import select, func

stmt = (
    select(Customer.name, func.count(Order.id))
    .outerjoin(Order, Order.customer_id == Customer.id)
    .group_by(Customer.id)
    .order_by(Customer.name)
)
for name, count in session.execute(stmt):
    print(name, count)
`,
    },
  ],
  quiz: [
    { question: "Which module is used to work with SQLite in Python without installing anything?", options: ["sqlalchemy", "sqlite3", "pysqlite", "mysql.connector"], answer: 1, explanation: "sqlite3 is part of the Python standard library." },
    { question: "What is the correct way to pass a single parameter in sqlite3?", options: ["execute(sql, \"Pen\")", "execute(sql, (\"Pen\"))", "execute(sql, (\"Pen\",))", "execute(sql % \"Pen\")"], answer: 2, explanation: "Parameters must be a sequence; (\"Pen\",) with a trailing comma is a one-item tuple." },
    { question: "In SQLAlchemy 2.0, which call returns ORM objects for a select() statement?", options: ["session.scalars(stmt)", "session.query(stmt)", "engine.fetch(stmt)", "Base.select(stmt)"], answer: 0, explanation: "session.scalars(select(Model)) returns the model objects; .all(), .first() or .one() pick results." },
    { question: "What happens when an exception is raised inside `with conn:` in sqlite3?", options: ["The connection closes", "Changes are committed", "Changes in the block are rolled back", "Nothing special"], answer: 2, explanation: "The connection context manager rolls back on exception and commits on success; it does not close." },
    { question: "Which option fixes the N+1 problem when loading customers with their orders?", options: ["echo=True", "selectinload(Customer.orders)", "cascade='all'", "session.flush()"], answer: 1, explanation: "Eager loading with selectinload fetches all related orders in one additional query." },
    { question: "Which tool manages schema migrations for SQLAlchemy projects?", options: ["pip", "Alembic", "Gunicorn", "pytest"], answer: 1, explanation: "Alembic generates and applies versioned migration scripts for SQLAlchemy models." },
  ],
};
