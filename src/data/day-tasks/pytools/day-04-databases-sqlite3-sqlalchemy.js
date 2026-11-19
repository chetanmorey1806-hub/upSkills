export default {
  lesson: 'day-04-databases-sqlite3-sqlalchemy',
  minutes: 35,
  intro: 'Use sqlite3 for real: create tables, run parameterized queries, handle transactions with commit/rollback, and understand SQLAlchemy 2.0 ORM ideas and the N+1 problem.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which query is safe from **SQL injection** when `name` comes from a user?',
      options: ['`cur.execute(f"SELECT * FROM users WHERE name = \'{name}\'")`', '`cur.execute("SELECT * FROM users WHERE name = ?", (name,))`', '`cur.execute("SELECT * FROM users WHERE name = " + name)`', '`cur.execute("SELECT * FROM users WHERE name = %s" % name)`'],
      answer: 1,
      explain: 'With placeholders (`?` in sqlite3), the driver sends the value separately from the SQL text, so input like `\' OR 1=1 --` is treated as data, not code. Note the parameters must be a tuple: `(name,)` with the comma.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about SQLAlchemy 2.0 are TRUE? (choose all that apply)',
      options: ['Models inherit from a class based on `DeclarativeBase`', 'Columns are declared with `Mapped[int] = mapped_column(primary_key=True)`', 'Queries are built with `select(User).where(User.city == "Pune")` and run with `session.execute` / `session.scalars`', 'Changes are saved without calling `session.commit()`', 'The N+1 problem can be fixed with eager loading such as `selectinload`'],
      answers: [0, 1, 2, 4],
      explain: 'Nothing is written until `session.commit()`. The N+1 problem happens when you load N parents and then lazily run one extra query per parent for its children; eager loading (`selectinload`, `joinedload`) fetches them in one or two queries.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write `setup_db()` that returns an in-memory sqlite3 connection with a table `students(id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, marks INTEGER)`, then write `add_students(conn, rows)` that inserts a list of `(name, city, marks)` tuples with **one** `executemany` call using `?` placeholders and commits, and `count_by_city(conn)` that returns a list of `(city, count)` ordered by city.',
      example: { title: 'sqlite3 basics', code: 'import sqlite3\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE t (x INTEGER)")\nconn.executemany("INSERT INTO t VALUES (?)", [(1,), (2,)])\nconn.commit()\nprint(conn.execute("SELECT SUM(x) FROM t").fetchone())  # (3,)' },
      starter: 'import sqlite3\n\ndef setup_db():\n    conn = sqlite3.connect(":memory:")\n    # TODO: create the table\n    return conn\n\ndef add_students(conn, rows):\n    pass  # TODO\n\ndef count_by_city(conn):\n    return []  # TODO\n',
      solution: 'import sqlite3\n\ndef setup_db():\n    conn = sqlite3.connect(":memory:")\n    conn.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, marks INTEGER)")\n    return conn\n\ndef add_students(conn, rows):\n    conn.executemany("INSERT INTO students (name, city, marks) VALUES (?, ?, ?)", rows)\n    conn.commit()\n\ndef count_by_city(conn):\n    return conn.execute("SELECT city, COUNT(*) FROM students GROUP BY city ORDER BY city").fetchall()\n',
      tests: [
        { call: '(lambda c: (add_students(c, [("Asha", "Pune", 88), ("Ravi", "Delhi", 72), ("Om", "Pune", 65)]), count_by_city(c))[1])(setup_db())', expect: [['Delhi', 1], ['Pune', 2]] },
        { call: '(lambda c: (add_students(c, [("O\'Brien", "Goa", 90)]), c.execute("SELECT name FROM students").fetchone()[0])[1])(setup_db())', expect: "O'Brien", msg: 'Quotes in names must work (use placeholders)' },
        { call: 'count_by_city(setup_db())', expect: [] },
      ],
      explain: '`executemany` runs the same parameterized INSERT for every tuple, which is faster and safer than building SQL strings in a loop. The `id INTEGER PRIMARY KEY` column is filled automatically. Without `commit()`, a file database would lose the rows when the connection closes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Transactions.** Write `transfer(conn, from_id, to_id, amount)` for a table `accounts(id, name, balance)`. Use `with conn:` (commits on success, rolls back on error). If the sender\'s balance would go below 0, raise `ValueError("insufficient funds")` INSIDE the `with` block so nothing is saved. Return `"ok"` on success or the error message. The starter creates the table.',
      example: { title: 'connection as a context manager', code: 'with conn:\n    conn.execute("UPDATE stock SET qty = qty - 1 WHERE id = ?", (5,))\n    conn.execute("INSERT INTO orders (item_id) VALUES (?)", (5,))\n# both statements are committed together, or neither' },
      starter: 'import sqlite3\n\ndef make_bank():\n    conn = sqlite3.connect(":memory:")\n    conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER)")\n    conn.executemany("INSERT INTO accounts VALUES (?, ?, ?)", [(1, "Asha", 1000), (2, "Ravi", 200)])\n    conn.commit()\n    return conn\n\ndef balances(conn):\n    return [b for (b,) in conn.execute("SELECT balance FROM accounts ORDER BY id")]\n\ndef transfer(conn, from_id, to_id, amount):\n    # TODO\n    return "ok"\n',
      solution: 'import sqlite3\n\ndef make_bank():\n    conn = sqlite3.connect(":memory:")\n    conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER)")\n    conn.executemany("INSERT INTO accounts VALUES (?, ?, ?)", [(1, "Asha", 1000), (2, "Ravi", 200)])\n    conn.commit()\n    return conn\n\ndef balances(conn):\n    return [b for (b,) in conn.execute("SELECT balance FROM accounts ORDER BY id")]\n\ndef transfer(conn, from_id, to_id, amount):\n    try:\n        with conn:\n            conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, from_id))\n            conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, to_id))\n            (bal,) = conn.execute("SELECT balance FROM accounts WHERE id = ?", (from_id,)).fetchone()\n            if bal < 0:\n                raise ValueError("insufficient funds")\n        return "ok"\n    except ValueError as e:\n        return str(e)\n',
      tests: [
        { call: '(lambda c: (transfer(c, 1, 2, 300), balances(c)))(make_bank())', expect: ['ok', [700, 500]] },
        { call: '(lambda c: (transfer(c, 2, 1, 500), balances(c)))(make_bank())', expect: ['insufficient funds', [1000, 200]], msg: 'A failed transfer must roll back BOTH updates' },
        { call: '(lambda c: (transfer(c, 2, 1, 200), balances(c)))(make_bank())', expect: ['ok', [1200, 0]] },
      ],
      explain: 'A transfer is two updates that must succeed or fail together (atomicity). `with conn:` commits if the block finishes and rolls back if an exception escapes it, so the half-done debit is undone. Catching the error inside the block would commit the broken state.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `import sqlite3
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE p (name TEXT, price REAL)")
conn.executemany("INSERT INTO p VALUES (?, ?)", [("Pen", 10), ("Bag", 499.5), ("Ink", 35)])
row = conn.execute("SELECT name, price FROM p WHERE price > ? ORDER BY price", (20,)).fetchone()
print(row["name"], row["price"])
print(conn.execute("SELECT COUNT(*) FROM p").fetchone()[0])`,
      expected: 'Ink 35.0\n3',
      explain: '`fetchone()` returns only the FIRST matching row (prices above 20, cheapest first → Ink). The column is REAL, so 35 comes back as 35.0. `row_factory = sqlite3.Row` lets you read columns by name as well as by index.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In SQLAlchemy 2.0, which code loads all users from Pune?',
      options: ['`session.query("Pune")`', '`session.scalars(select(User).where(User.city == "Pune")).all()`', '`User.objects.filter(city="Pune")`', '`select * from User where city = Pune`'],
      answer: 1,
      explain: '2.0 style builds a `select()` statement and runs it on the session; `scalars()` returns the User objects instead of one-element rows. `User.objects.filter` is Django ORM syntax, not SQLAlchemy.',
    },
  ],
};
