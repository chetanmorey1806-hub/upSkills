export default {
  lesson: 'day-06-flask-sqlalchemy-crud',
  minutes: 35,
  intro: 'Practise Flask-SQLAlchemy models and CRUD with the session, then write the SQL that the ORM generates and the pagination maths behind db.paginate.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You changed a student\'s name with `student.name = \'Asha\'`. What must you call to save it to the database?',
      options: ['db.session.add_all()', 'db.session.commit()', 'student.save()', 'db.create_all()'],
      answer: 1,
      explain: 'The object is already tracked by the session, so the change is pending until **`db.session.commit()`** writes it in a transaction. `student.save()` is Django style, not SQLAlchemy. `db.create_all()` only creates missing tables.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the SQLAlchemy 2.0 style column for a **unique, required** email (max 120 chars) in the model:\n\n```\nclass Student(db.Model):\n    id: Mapped[int] = mapped_column(primary_key=True)\n    email: Mapped[str] = ______\n```',
      accept: ['mapped_column(String(120), unique=True)', 'mapped_column(String(120), unique=True, nullable=False)', 'mapped_column(String(120), nullable=False, unique=True)', 'mapped_column(db.String(120), unique=True)', 'mapped_column(db.String(120), unique=True, nullable=False)', 'mapped_column(db.String(120), nullable=False, unique=True)'],
      explain: '`Mapped[str]` (not `Mapped[Optional[str]]`) already makes the column NOT NULL, and `unique=True` adds a UNIQUE constraint. `String(120)` sets the VARCHAR length, which MySQL requires. Writing `nullable=False` too is allowed but redundant.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match ORM calls to what they do. Which statements are TRUE? (choose all that apply)',
      options: [
        'db.get_or_404(Student, 5) returns the student with id 5 or aborts with 404',
        'db.session.execute(db.select(Student)).scalars().all() returns a list of Student objects',
        'db.session.delete(s) deletes the row immediately without commit',
        'db.paginate(db.select(Student), page=2, per_page=10) returns an object with .items, .pages and .has_next',
        'Student.query is the only way to query in Flask-SQLAlchemy 3',
      ],
      answers: [0, 1, 3],
      explain: '`db.get_or_404` and `db.paginate` are Flask-SQLAlchemy helpers; `select()` + `scalars()` is the SQLAlchemy 2.0 style. `delete()` only marks the object - it is removed on **commit**. `Model.query` still works but is legacy; the docs recommend `db.select`.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'The ORM call\n```\ndb.session.execute(\n    db.select(Student).where(Student.city == \'Pune\').order_by(Student.marks.desc())\n).scalars().all()\n```\ngenerates a SELECT. Write that SQL query (return `name` and `marks` only).',
      example: { title: 'WHERE + ORDER BY', code: "SELECT name, price FROM product\nWHERE category = 'Books'\nORDER BY price ASC;" },
      setup: `CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, marks INTEGER);
INSERT INTO student VALUES (1, 'Asha', 'Pune', 82), (2, 'Ravi', 'Mumbai', 67), (3, 'Meera', 'Pune', 91), (4, 'Kabir', 'Pune', 58), (5, 'Neha', 'Nagpur', 74);`,
      starter: '-- SELECT ...\nSELECT name FROM student;',
      solution: "SELECT name, marks FROM student WHERE city = 'Pune' ORDER BY marks DESC;",
      ordered: true,
      explain: '`.where()` becomes `WHERE`, `.order_by(Student.marks.desc())` becomes `ORDER BY marks DESC`. Knowing the SQL behind the ORM helps you debug (set `SQLALCHEMY_ECHO = True` to print every query).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'This view code runs:\n```\ns = db.get_or_404(Student, 2)\ns.marks = 72\ndb.session.commit()\n\ndb.session.delete(db.get_or_404(Student, 4))\ndb.session.commit()\n```\nWrite the **UPDATE** and **DELETE** statements the ORM sends.',
      example: { title: 'UPDATE and DELETE by primary key', code: "UPDATE product SET price = 99 WHERE id = 3;\nDELETE FROM product WHERE id = 7;" },
      setup: `CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, marks INTEGER);
INSERT INTO student VALUES (1, 'Asha', 'Pune', 82), (2, 'Ravi', 'Mumbai', 67), (3, 'Meera', 'Pune', 91), (4, 'Kabir', 'Pune', 58), (5, 'Neha', 'Nagpur', 74);`,
      starter: '-- UPDATE ...\n-- DELETE ...\n',
      solution: 'UPDATE student SET marks = 72 WHERE id = 2;\nDELETE FROM student WHERE id = 4;',
      check: 'SELECT id, name, marks FROM student ORDER BY id',
      explain: 'Changing an attribute and committing becomes `UPDATE ... WHERE id = ?` (only the changed columns), and `session.delete()` + commit becomes `DELETE ... WHERE id = ?`. Forgetting the `WHERE` in raw SQL would update/delete **every** row - the ORM always adds the primary key for you.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `paginate(items, page, per_page)` - the maths behind `db.paginate`. Return a dict with:\n- `items`: the slice for that page\n- `total`: number of items\n- `pages`: number of pages (0 items → 0 pages)\n- `has_prev`: page > 1\n- `has_next`: page < pages',
      example: { title: 'slicing for page 2 with 3 per page', code: "data = list('abcdefgh')\nstart = (2 - 1) * 3\nprint(data[start:start + 3])   # ['d', 'e', 'f']" },
      starter: `def paginate(items, page, per_page):
    # TODO
    return {}
`,
      solution: `import math

def paginate(items, page, per_page):
    total = len(items)
    pages = math.ceil(total / per_page) if total else 0
    start = (page - 1) * per_page
    return {
        'items': items[start:start + per_page],
        'total': total,
        'pages': pages,
        'has_prev': page > 1,
        'has_next': page < pages,
    }
`,
      tests: [
        { call: 'paginate(list(range(1, 24)), 1, 10)', expect: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], total: 23, pages: 3, has_prev: false, has_next: true } },
        { call: 'paginate(list(range(1, 24)), 3, 10)', expect: { items: [21, 22, 23], total: 23, pages: 3, has_prev: true, has_next: false } },
        { call: 'paginate([], 1, 10)', expect: { items: [], total: 0, pages: 0, has_prev: false, has_next: false } },
        { call: "paginate(['a', 'b', 'c', 'd'], 2, 2)", expect: { items: ['c', 'd'], total: 4, pages: 2, has_prev: true, has_next: false } },
      ],
      explain: 'Pages = ceiling(total / per_page) - 23 items at 10 per page need **3** pages, not 2. The offset for page n is `(n - 1) * per_page`, which becomes `LIMIT per_page OFFSET ...` in SQL. Templates use `has_prev`/`has_next` to show Previous/Next links.',
    },
  ],
};
