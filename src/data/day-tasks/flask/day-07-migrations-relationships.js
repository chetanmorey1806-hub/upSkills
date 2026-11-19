export default {
  lesson: 'day-07-migrations-relationships',
  minutes: 35,
  intro: 'Practise Flask-Migrate commands and one-to-many / many-to-many relationships, write the JOIN queries the ORM runs, and see the N+1 problem in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You added a new column `phone` to the `Student` model. Which commands apply it to the database with Flask-Migrate?',
      options: ['flask db init then flask run', 'flask db migrate -m "add phone" then flask db upgrade', 'db.create_all() again', 'flask db downgrade then flask db upgrade'],
      answer: 1,
      explain: '`flask db migrate` **generates** a migration script by comparing models with the database; `flask db upgrade` **applies** it. `flask db init` is run only once per project. `db.create_all()` never alters existing tables, which is exactly why migrations exist.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the foreign key column on the "many" side (each `Post` belongs to one `User` whose table is `user`):\n\n```\nclass Post(db.Model):\n    id: Mapped[int] = mapped_column(primary_key=True)\n    user_id: Mapped[int] = mapped_column(______)\n```',
      accept: ["ForeignKey('user.id')", 'ForeignKey("user.id")', "db.ForeignKey('user.id')", 'db.ForeignKey("user.id")'],
      explain: '`ForeignKey(\'user.id\')` uses the **table name and column** (`user.id`), not the class name `User`. The foreign key always lives on the **many** side (Post), and `relationship()` on both classes with `back_populates` gives you `user.posts` and `post.author`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about relationships are TRUE? (choose all that apply)',
      options: [
        'A many-to-many relationship (Student ↔ Course) needs an association table',
        "cascade='all, delete-orphan' deletes a user's posts when the user is deleted",
        'The N+1 problem = 1 query for the list + 1 extra query for each row',
        "lazy='selectin' or selectinload() helps avoid the N+1 problem",
        'A one-to-one relationship needs two foreign keys, one in each table',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Many-to-many uses an association table with two foreign keys. `delete-orphan` cascades deletes to children. Loading `post.author` inside a loop fires one query per post (N+1); `selectinload`/`joinedload` loads all related rows up front. One-to-one is just a foreign key with `unique=True` on one side (and `uselist=False`).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'For the blog page the ORM loads posts with their authors using a JOIN (`select(Post).join(Post.author)`). Write the SQL: return `title` and the author\'s `username` for every post, ordered by post `id`.',
      example: { title: 'INNER JOIN', code: 'SELECT o.id, c.name\nFROM orders o\nJOIN customer c ON c.id = o.customer_id;' },
      setup: `CREATE TABLE user (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL);
CREATE TABLE post (id INTEGER PRIMARY KEY, title TEXT NOT NULL, user_id INTEGER NOT NULL REFERENCES user(id));
INSERT INTO user VALUES (1, 'asha'), (2, 'ravi'), (3, 'meera');
INSERT INTO post VALUES (1, 'Flask in 10 minutes', 1), (2, 'Jinja2 tips', 1), (3, 'My first API', 2), (4, 'SQLAlchemy 2.0', 3);`,
      starter: 'SELECT title FROM post;',
      solution: 'SELECT p.title, u.username FROM post p JOIN user u ON u.id = p.user_id ORDER BY p.id;',
      ordered: true,
      explain: 'The foreign key `post.user_id` joins to `user.id`. One JOIN query returns everything, instead of 1 query for posts + 1 per post for its author (N+1). This is what `joinedload(Post.author)` does.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Students and courses are many-to-many through the association table `enrollment`. Write a query that returns each course `title` and the **number of students** enrolled (`total`), including courses with 0 students, ordered by `title`.',
      example: { title: 'LEFT JOIN + GROUP BY', code: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customer c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY c.name;' },
      setup: `CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE course (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE enrollment (student_id INTEGER REFERENCES student(id), course_id INTEGER REFERENCES course(id), PRIMARY KEY (student_id, course_id));
INSERT INTO student VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Meera');
INSERT INTO course VALUES (1, 'Flask'), (2, 'Django'), (3, 'FastAPI');
INSERT INTO enrollment VALUES (1, 1), (2, 1), (3, 1), (1, 2), (3, 2);`,
      starter: 'SELECT title FROM course;',
      solution: 'SELECT c.title, COUNT(e.student_id) AS total FROM course c LEFT JOIN enrollment e ON e.course_id = c.id GROUP BY c.id ORDER BY c.title;',
      ordered: true,
      explain: 'The association table holds pairs (student_id, course_id). A **LEFT** JOIN keeps FastAPI even though nobody enrolled, and `COUNT(e.student_id)` counts 0 for it (`COUNT(*)` would wrongly count 1).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'See the N+1 problem in plain Python. `get_user(uid)` (given) simulates one database query and counts it. Write `posts_with_authors(posts)` that returns a list of `\'title by username\'` strings using **at most 2 queries in total**: call `get_users(ids)` once with all needed ids (it returns `{id: username}`) instead of calling `get_user` in the loop.',
      example: { title: 'collect ids first, then look them up once', code: "ids = {o['customer_id'] for o in orders}\ncustomers = load_customers(ids)   # one query\nfor o in orders:\n    print(customers[o['customer_id']])" },
      starter: `USERS = {1: 'asha', 2: 'ravi', 3: 'meera'}
QUERIES = []

def get_user(uid):
    QUERIES.append(f'SELECT * FROM user WHERE id = {uid}')
    return USERS[uid]

def get_users(ids):
    QUERIES.append(f'SELECT * FROM user WHERE id IN {sorted(ids)}')
    return {i: USERS[i] for i in ids}

def posts_with_authors(posts):
    # TODO: this version runs one query per post (N+1) - fix it
    return [f"{p['title']} by {get_user(p['user_id'])}" for p in posts]
`,
      solution: `USERS = {1: 'asha', 2: 'ravi', 3: 'meera'}
QUERIES = []

def get_user(uid):
    QUERIES.append(f'SELECT * FROM user WHERE id = {uid}')
    return USERS[uid]

def get_users(ids):
    QUERIES.append(f'SELECT * FROM user WHERE id IN {sorted(ids)}')
    return {i: USERS[i] for i in ids}

def posts_with_authors(posts):
    users = get_users({p['user_id'] for p in posts})
    return [f"{p['title']} by {users[p['user_id']]}" for p in posts]
`,
      tests: [
        { call: "posts_with_authors([{'title': 'Flask', 'user_id': 1}, {'title': 'Jinja', 'user_id': 1}, {'title': 'API', 'user_id': 2}, {'title': 'ORM', 'user_id': 3}])", expect: ['Flask by asha', 'Jinja by asha', 'API by ravi', 'ORM by meera'] },
        { call: "(QUERIES.clear(), posts_with_authors([{'title': t, 'user_id': (i % 3) + 1} for i, t in enumerate('abcdef')]), len(QUERIES))[2]", expect: 1, msg: 'Loading 6 posts must use only one user query (no N+1)' },
      ],
      explain: 'The starter calls the database once **per post**: 100 posts = 101 queries. Collecting the ids and fetching them in one `IN (...)` query is exactly what `selectinload()` does. Using a set also removes duplicate ids.',
    },
  ],
};
