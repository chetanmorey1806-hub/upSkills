export default {
  lesson: 'day-12-select-related-prefetch-related',
  minutes: 30,
  intro: 'Practise spotting the N+1 problem and fixing it with select_related, prefetch_related and Prefetch, and count queries in plain Python and SQL.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The template loops over 100 students and prints `{{ s.course.name }}`. The view uses `Student.objects.all()`. How many queries run?',
      options: ['1', '2', '101', '200'],
      answer: 2,
      explain: '1 query for the students + 1 query **per student** to load its course = 101 (the N+1 problem). `Student.objects.select_related(\'course\')` loads everything with one JOIN query.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'select_related works for ForeignKey and OneToOne (forward) relations using a SQL JOIN',
        'prefetch_related works for ManyToMany and reverse ForeignKey using a second query and joining in Python',
        "Prefetch('subjects', queryset=Subject.objects.order_by('title'), to_attr='sorted_subjects') customises the prefetch",
        'select_related("subjects") works for a ManyToManyField',
        'self.assertNumQueries(2) in a test fails if the code runs a different number of queries',
      ],
      answers: [0, 1, 2, 4],
      explain: 'JOINs can only fetch "one" related row per row, so `select_related` is for FK/OneToOne. Many-valued relations need `prefetch_related` (one extra `IN (...)` query per relation). `assertNumQueries` locks the query count in tests so N+1 bugs cannot come back.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Each course page lists the course\'s students (reverse FK `related_name=\'students\'`) and their profile (OneToOne). Complete the queryset so it runs a fixed number of queries:\n\n```\ncourses = Course.objects.prefetch_related(______)\n```',
      accept: ["'students__profile'", '"students__profile"', "'students', 'students__profile'", '"students", "students__profile"'],
      explain: '`prefetch_related(\'students__profile\')` prefetches the students and then their profiles - one query for courses, one for students, one for profiles, no matter how many rows. Lookups can go through several relations with `__`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Simulate both loading strategies and count queries. `QUERIES` records every "database call". Write:\n- `naive(students)` → list of `\'name - course\'` strings using `get_course(id)` for every student (N+1)\n- `with_prefetch(students)` → the same list using **one** call to `get_courses(ids)` (like prefetch_related)\n\nBoth start by calling `get_students()` once (already in the starter).',
      example: { title: 'collect ids, load once, look up in a dict', code: "ids = {s['course_id'] for s in students}\ncourses = get_courses(ids)   # {id: name}\nprint(courses[students[0]['course_id']])" },
      starter: `QUERIES = []
COURSES = {1: 'BCA', 2: 'BSc IT', 3: 'MCA'}
STUDENTS = [{'name': 'Asha', 'course_id': 1}, {'name': 'Ravi', 'course_id': 2}, {'name': 'Meera', 'course_id': 1}, {'name': 'Dev', 'course_id': 3}]

def get_students():
    QUERIES.append('SELECT student')
    return STUDENTS

def get_course(cid):
    QUERIES.append(f'SELECT course {cid}')
    return COURSES[cid]

def get_courses(ids):
    QUERIES.append(f'SELECT course IN {sorted(ids)}')
    return {i: COURSES[i] for i in ids}

def naive():
    students = get_students()
    # TODO
    return []

def with_prefetch():
    students = get_students()
    # TODO
    return []
`,
      solution: `QUERIES = []
COURSES = {1: 'BCA', 2: 'BSc IT', 3: 'MCA'}
STUDENTS = [{'name': 'Asha', 'course_id': 1}, {'name': 'Ravi', 'course_id': 2}, {'name': 'Meera', 'course_id': 1}, {'name': 'Dev', 'course_id': 3}]

def get_students():
    QUERIES.append('SELECT student')
    return STUDENTS

def get_course(cid):
    QUERIES.append(f'SELECT course {cid}')
    return COURSES[cid]

def get_courses(ids):
    QUERIES.append(f'SELECT course IN {sorted(ids)}')
    return {i: COURSES[i] for i in ids}

def naive():
    students = get_students()
    return [f"{s['name']} - {get_course(s['course_id'])}" for s in students]

def with_prefetch():
    students = get_students()
    courses = get_courses({s['course_id'] for s in students})
    return [f"{s['name']} - {courses[s['course_id']]}" for s in students]
`,
      tests: [
        { call: "(QUERIES.clear(), naive(), len(QUERIES))[1:]", expect: [['Asha - BCA', 'Ravi - BSc IT', 'Meera - BCA', 'Dev - MCA'], 5], msg: 'naive() gives the right list using 1 + N = 5 queries' },
        { call: "(QUERIES.clear(), with_prefetch(), len(QUERIES))[1:]", expect: [['Asha - BCA', 'Ravi - BSc IT', 'Meera - BCA', 'Dev - MCA'], 2], msg: 'with_prefetch() gives the same list in exactly 2 queries' },
      ],
      explain: 'Same output, very different cost: the naive version grows with every row (1 + N), the prefetch version is always 2 queries. `prefetch_related` does exactly this: collect ids → one `WHERE id IN (...)` → join in Python.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: '`Student.objects.select_related(\'course\', \'profile\')` produces one query with two JOINs. Write it: return student `name`, `course_name`, and the profile `phone` (students without a profile must still appear, with NULL phone), ordered by student `id`.',
      example: { title: 'INNER JOIN + LEFT JOIN', code: 'SELECT o.id, c.name, a.city\nFROM shop_order o\nJOIN shop_customer c ON o.customer_id = c.id\nLEFT JOIN shop_address a ON a.order_id = o.id\nORDER BY o.id;' },
      setup: `CREATE TABLE students_course (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT, course_id INTEGER NOT NULL REFERENCES students_course(id));
CREATE TABLE students_profile (id INTEGER PRIMARY KEY, student_id INTEGER UNIQUE REFERENCES students_student(id), phone TEXT);
INSERT INTO students_course VALUES (1, 'BCA'), (2, 'MCA');
INSERT INTO students_student VALUES (1, 'Asha', 1), (2, 'Ravi', 2), (3, 'Meera', 1);
INSERT INTO students_profile VALUES (1, 1, '9876500001'), (2, 3, '9876500003');`,
      starter: 'SELECT name FROM students_student;',
      solution: 'SELECT s.name, c.name AS course_name, p.phone FROM students_student s JOIN students_course c ON s.course_id = c.id LEFT JOIN students_profile p ON p.student_id = s.id ORDER BY s.id;',
      ordered: true,
      explain: 'For a required FK (`NOT NULL`) Django uses INNER JOIN; for a nullable FK or a reverse OneToOne it uses LEFT OUTER JOIN, so students without a profile are not lost (Ravi has phone NULL).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Django can show you the SQL of a queryset without running it. What does this program print? (runs inside a configured Django project)',
      code: `from django.contrib.auth.models import User, Group

qs = User.objects.filter(groups__name='Teachers').order_by('username')
print(qs.query.__class__.__name__)
sql = str(qs.query)
print('INNER JOIN' in sql, '"auth_group"."name" = Teachers' in sql)
print(str(User.objects.only('username').query).startswith('SELECT "auth_user"."id", "auth_user"."username" FROM'))`,
      expected: 'Query\nTrue True\nTrue',
      explain: '`str(qs.query)` prints the SQL Django will send - the M2M lookup `groups__name` becomes INNER JOINs through `auth_user_groups` to `auth_group`. `only()` limits the selected columns (the primary key is always included). Use this, `connection.queries` or Debug Toolbar to find N+1 problems.',
    },
  ],
};
