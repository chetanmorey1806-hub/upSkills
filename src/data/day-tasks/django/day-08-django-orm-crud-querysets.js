export default {
  lesson: 'day-08-django-orm-crud-querysets',
  minutes: 35,
  intro: 'Practise ORM CRUD, QuerySet methods, lazy evaluation and get() errors, then write the SQL behind ORM calls and a tiny QuerySet class in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`Student.objects.get(city=\'Pune\')` is called and **three** students live in Pune. What happens?',
      options: ['It returns the first one', 'It returns a list of three', 'It raises Student.MultipleObjectsReturned', 'It returns None'],
      answer: 2,
      explain: '`get()` must find **exactly one** row: 0 rows → `DoesNotExist`, more than 1 → `MultipleObjectsReturned`. Use `filter()` for many rows, `filter(...).first()` for "one or None", and `get_object_or_404()` in views.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'QuerySets are lazy: Student.objects.filter(city="Pune") does not hit the database until you use the results',
        'Student.objects.create(name="Asha") inserts the row immediately',
        'Student.objects.filter(city="Pune").update(city="Pune City") updates rows with one SQL query and does not call save()',
        'exclude(city="Pune") returns students NOT in Pune',
        'order_by("-marks") sorts by marks ascending',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Querysets build SQL lazily and run it when iterated, sliced with a step, printed, `len()`/`list()` etc. `create()` = construct + `save()`. Queryset `update()` is one UPDATE statement (fast, but no `save()` or signals). A minus sign means **descending**.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that returns the student if roll number `CS010` exists, otherwise creates it, and tells you which happened:\n\n```\nstudent, created = ______(roll_no=\'CS010\', defaults={\'name\': \'Meera\'})\n```',
      accept: ['Student.objects.get_or_create'],
      caseSensitive: true,
      explain: '`get_or_create(lookup, defaults={...})` returns a tuple `(object, created)`. `defaults` are used only when creating. It is perfect for idempotent seed scripts that may run more than once.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Write the SQL for\n```\nStudent.objects.filter(city=\'Pune\').exclude(marks__lt=60).order_by(\'-marks\', \'name\').values(\'name\', \'marks\')[:3]\n```',
      example: { title: 'filter + exclude + order + slice', code: "SELECT title, price FROM shop_product\nWHERE category = 'Books' AND NOT (price < 100)\nORDER BY price DESC, title ASC\nLIMIT 5;" },
      setup: `CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT, roll_no TEXT UNIQUE, city TEXT, marks INTEGER);
INSERT INTO students_student VALUES (1, 'Asha', 'CS001', 'Pune', 82), (2, 'Ravi', 'CS002', 'Mumbai', 67), (3, 'Meera', 'CS003', 'Pune', 91), (4, 'Kabir', 'CS004', 'Pune', 58), (5, 'Neha', 'CS005', 'Pune', 82), (6, 'Dev', 'CS006', 'Pune', 75);`,
      starter: "SELECT name, marks FROM students_student WHERE city = 'Pune';",
      solution: "SELECT name, marks FROM students_student WHERE city = 'Pune' AND NOT (marks < 60) ORDER BY marks DESC, name ASC LIMIT 3;",
      ordered: true,
      explain: '`filter` → WHERE, `exclude(marks__lt=60)` → `AND NOT (marks < 60)`, `order_by(\'-marks\', \'name\')` → `ORDER BY marks DESC, name ASC` (name breaks the tie between Asha and Neha), slicing `[:3]` → `LIMIT 3`. Print `str(qs.query)` in the shell to see the SQL Django generates.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Write the SQL these ORM statements run, in order:\n```\nStudent.objects.create(name=\'Zoya\', roll_no=\'CS007\', city=\'Nagpur\', marks=88)\nStudent.objects.filter(city=\'Mumbai\').update(marks=70)\nStudent.objects.filter(marks__lt=60).delete()\n```',
      example: { title: 'INSERT, UPDATE, DELETE', code: "INSERT INTO shop_product (title, price) VALUES ('Pen', 10);\nUPDATE shop_product SET price = 12 WHERE title = 'Pen';\nDELETE FROM shop_product WHERE price > 1000;" },
      setup: `CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT, roll_no TEXT UNIQUE, city TEXT, marks INTEGER);
INSERT INTO students_student VALUES (1, 'Asha', 'CS001', 'Pune', 82), (2, 'Ravi', 'CS002', 'Mumbai', 67), (3, 'Meera', 'CS003', 'Pune', 91), (4, 'Kabir', 'CS004', 'Pune', 58), (5, 'Neha', 'CS005', 'Pune', 82), (6, 'Dev', 'CS006', 'Pune', 45);`,
      starter: '-- INSERT ...\n-- UPDATE ...\n-- DELETE ...\n',
      solution: "INSERT INTO students_student (name, roll_no, city, marks) VALUES ('Zoya', 'CS007', 'Nagpur', 88);\nUPDATE students_student SET marks = 70 WHERE city = 'Mumbai';\nDELETE FROM students_student WHERE marks < 60;",
      check: 'SELECT name, city, marks FROM students_student ORDER BY id',
      explain: '`create()` → INSERT, queryset `update()` → one UPDATE with the filter as WHERE, queryset `delete()` → DELETE with the same WHERE. A queryset without a filter (`Student.objects.all().delete()`) deletes **every** row - always double-check the filter.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write a tiny chainable `QuerySet` over a list of dicts with methods that each return a **new** QuerySet (the original stays unchanged):\n- `filter(**kw)` keeps rows where every `row[k] == v`\n- `exclude(**kw)` removes rows where every `row[k] == v`\n- `order_by(*fields)` sorts (a field starting with `-` = descending; apply fields so the first is the main key)\n- `values_list(field)` returns a plain list of that field\n- `count()` returns the number of rows; `first()` returns the first row or `None`',
      example: { title: 'returning a new object for chaining', code: "class Q:\n    def __init__(self, rows):\n        self.rows = rows\n    def even(self):\n        return Q([r for r in self.rows if r % 2 == 0])\n\nprint(Q([1, 2, 3, 4]).even().rows)   # [2, 4]" },
      starter: `class QuerySet:
    def __init__(self, rows):
        self.rows = list(rows)

    # TODO: filter, exclude, order_by, values_list, count, first
`,
      solution: `class QuerySet:
    def __init__(self, rows):
        self.rows = list(rows)

    def filter(self, **kw):
        return QuerySet(r for r in self.rows if all(r.get(k) == v for k, v in kw.items()))

    def exclude(self, **kw):
        return QuerySet(r for r in self.rows if not all(r.get(k) == v for k, v in kw.items()))

    def order_by(self, *fields):
        rows = list(self.rows)
        for f in reversed(fields):
            rows.sort(key=lambda r: r[f.lstrip('-')], reverse=f.startswith('-'))
        return QuerySet(rows)

    def values_list(self, field):
        return [r[field] for r in self.rows]

    def count(self):
        return len(self.rows)

    def first(self):
        return self.rows[0] if self.rows else None
`,
      tests: [
        { call: "QuerySet([{'name': 'Asha', 'city': 'Pune', 'marks': 82}, {'name': 'Ravi', 'city': 'Mumbai', 'marks': 67}, {'name': 'Meera', 'city': 'Pune', 'marks': 91}]).filter(city='Pune').values_list('name')", expect: ['Asha', 'Meera'] },
        { call: "QuerySet([{'name': 'Asha', 'city': 'Pune', 'marks': 82}, {'name': 'Ravi', 'city': 'Mumbai', 'marks': 67}, {'name': 'Meera', 'city': 'Pune', 'marks': 91}]).exclude(city='Pune').count()", expect: 1 },
        { call: "QuerySet([{'name': 'Asha', 'marks': 82}, {'name': 'Neha', 'marks': 82}, {'name': 'Meera', 'marks': 91}, {'name': 'Dev', 'marks': 45}]).order_by('-marks', 'name').values_list('name')", expect: ['Meera', 'Asha', 'Neha', 'Dev'] },
        { call: "QuerySet([{'name': 'Asha', 'city': 'Pune'}]).filter(city='Delhi').first()", expect: null },
        { call: "(lambda qs: (qs.filter(city='Pune'), qs.count())[1])(QuerySet([{'city': 'Pune'}, {'city': 'Goa'}]))", expect: 2, msg: 'filter() must return a NEW QuerySet and leave the original unchanged' },
      ],
      explain: 'Every Django queryset method returns a new queryset, so you can chain `filter().exclude().order_by()` and reuse a base queryset safely. Sorting by several keys works by sorting on the **last** key first (Python sort is stable) - Django does the same in SQL with `ORDER BY a DESC, b ASC`.',
    },
  ],
};
