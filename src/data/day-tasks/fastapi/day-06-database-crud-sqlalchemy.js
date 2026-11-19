export default {
  lesson: 'day-06-database-crud-sqlalchemy',
  minutes: 35,
  intro: 'Practise SQLAlchemy 2.0 models, the get_db session dependency, from_attributes schemas and CRUD, and write the SQL the ORM sends.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why does the Pydantic output schema need `model_config = ConfigDict(from_attributes=True)`?',
      options: ['To make all fields optional', 'So Pydantic can read values from an ORM object\'s attributes (student.name) instead of only from a dict', 'To connect to the database', 'To enable async'],
      answer: 1,
      explain: 'By default Pydantic validates dicts. Endpoints return **SQLAlchemy objects**, so the schema needs `from_attributes=True` (v1: `orm_mode = True`) to read `obj.id`, `obj.name` etc. Without it the response fails with a validation error.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the create endpoint so the new row gets its auto-generated `id` back from the database before returning:\n\n```\nstudent = Student(**data.model_dump())\ndb.add(student)\ndb.commit()\n______\nreturn student\n```',
      accept: ['db.refresh(student)'],
      explain: '`db.commit()` writes the row; `db.refresh(student)` reloads it so database-generated values (id, default timestamps) are available on the object. Forgetting `commit()` means nothing is saved; forgetting `refresh` can return stale data.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match SQLAlchemy 2.0 calls. Which are TRUE? (choose all that apply)',
      options: [
        'db.get(Student, 5) returns the student with primary key 5 or None',
        'db.scalars(select(Student).where(Student.city == "Pune")).all() returns a list of Student objects',
        'db.delete(obj) followed by db.commit() removes the row',
        'select(Student).offset(10).limit(10) is page 2 with size 10',
        'Base.metadata.create_all(engine) adds new columns to existing tables',
      ],
      answers: [0, 1, 2, 3],
      explain: '`get` looks up by primary key (raise 404 yourself if None). `select()` + `scalars()` is the 2.0 query style. Offset 10 limit 10 = rows 11-20. `create_all` only creates **missing tables** - it never alters existing ones; that is what Alembic migrations are for.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'The list endpoint runs\n```\nstmt = select(Student).where(Student.marks >= 60).order_by(Student.name).offset(0).limit(3)\n```\nWrite the SQL it generates (select `id`, `name`, `marks`).',
      example: { title: 'LIMIT and OFFSET', code: 'SELECT id, title FROM book\nWHERE price < 500\nORDER BY title\nLIMIT 5 OFFSET 10;' },
      setup: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, marks INTEGER);
INSERT INTO students VALUES (1, 'Rohan', 'rohan@x.in', 72), (2, 'Asha', 'asha@x.in', 88), (3, 'Kabir', 'kabir@x.in', 45), (4, 'Meera', 'meera@x.in', 91), (5, 'Dev', 'dev@x.in', 60), (6, 'Zoya', 'zoya@x.in', 66);`,
      starter: 'SELECT id, name, marks FROM students;',
      solution: 'SELECT id, name, marks FROM students WHERE marks >= 60 ORDER BY name LIMIT 3 OFFSET 0;',
      ordered: true,
      explain: '`.where()` → WHERE, `.order_by()` → ORDER BY, `.limit()/.offset()` → LIMIT/OFFSET. Always ORDER BY when paginating, otherwise the database may return rows in any order and pages can overlap.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'One-to-many: a `Course` has many `Student`s (`students.course_id`). The endpoint `GET /courses` returns each course `title` with `student_count`. Write the SQL (include courses with no students, order by `title`).',
      example: { title: 'LEFT JOIN + COUNT', code: 'SELECT d.name, COUNT(e.id) AS staff\nFROM department d\nLEFT JOIN employee e ON e.dept_id = d.id\nGROUP BY d.id\nORDER BY d.name;' },
      setup: `CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, course_id INTEGER REFERENCES courses(id));
INSERT INTO courses VALUES (1, 'FastAPI'), (2, 'Data Science'), (3, 'Cloud');
INSERT INTO students VALUES (1, 'Asha', 1), (2, 'Ravi', 1), (3, 'Meera', 2), (4, 'Dev', 1);`,
      starter: 'SELECT title FROM courses;',
      solution: 'SELECT c.title, COUNT(s.id) AS student_count FROM courses c LEFT JOIN students s ON s.course_id = c.id GROUP BY c.id ORDER BY c.title;',
      ordered: true,
      explain: 'LEFT JOIN keeps "Cloud" (0 students); `COUNT(s.id)` ignores the NULL from the missing match. In SQLAlchemy: `select(Course.title, func.count(Student.id)).outerjoin(Course.students).group_by(Course.id)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write an in-memory repository with the same behaviour as the CRUD endpoints. Class `StudentRepo` stores dicts in `self.rows` (keyed by id) and has:\n- `create(data)` → assigns the next id (1, 2, 3...), stores `{\'id\': id, **data}`, returns it; if the email already exists return `\'409\'`\n- `get(id)` → the row or `\'404\'`\n- `update(id, changes)` → applies only the given keys (PATCH), returns the row or `\'404\'`\n- `delete(id)` → returns `\'204\'` or `\'404\'`',
      example: { title: 'next id and partial update', code: "rows = {1: {'id': 1, 'name': 'A'}}\nnew_id = max(rows, default=0) + 1\nrows[1].update({'name': 'B'})" },
      starter: `class StudentRepo:
    def __init__(self):
        self.rows = {}
        self.next_id = 1

    # TODO: create, get, update, delete
`,
      solution: `class StudentRepo:
    def __init__(self):
        self.rows = {}
        self.next_id = 1

    def create(self, data):
        if any(r.get('email') == data.get('email') for r in self.rows.values()):
            return '409'
        row = {'id': self.next_id, **data}
        self.rows[self.next_id] = row
        self.next_id += 1
        return row

    def get(self, id):
        return self.rows.get(id, '404')

    def update(self, id, changes):
        if id not in self.rows:
            return '404'
        self.rows[id].update(changes)
        return self.rows[id]

    def delete(self, id):
        if self.rows.pop(id, None) is None:
            return '404'
        return '204'
`,
      tests: [
        { call: "(lambda r: [r.create({'name': 'Asha', 'email': 'a@x.in'}), r.create({'name': 'Ravi', 'email': 'r@x.in'})])(StudentRepo())", expect: [{ id: 1, name: 'Asha', email: 'a@x.in' }, { id: 2, name: 'Ravi', email: 'r@x.in' }] },
        { call: "(lambda r: (r.create({'name': 'Asha', 'email': 'a@x.in'}), r.create({'name': 'Asha2', 'email': 'a@x.in'}))[1])(StudentRepo())", expect: '409' },
        { call: "(lambda r: (r.create({'name': 'Asha', 'email': 'a@x.in', 'marks': 70}), r.update(1, {'marks': 85}))[1])(StudentRepo())", expect: { id: 1, name: 'Asha', email: 'a@x.in', marks: 85 } },
        { call: "(lambda r: [r.get(5), r.update(5, {}), r.delete(5)])(StudentRepo())", expect: ['404', '404', '404'] },
        { call: "(lambda r: (r.create({'name': 'A', 'email': 'a'}), r.delete(1), r.get(1))[1:])(StudentRepo())", expect: ['204', '404'] },
      ],
      explain: 'Putting data access in a small repository/CRUD module (instead of inside endpoints) keeps routes thin and makes logic testable. The status strings map to `HTTPException(404)`, `409 Conflict` and `status_code=204` in the real endpoints; PATCH uses `model_dump(exclude_unset=True)` to apply only sent fields.',
    },
  ],
};
