export default {
  lesson: 'day-09-lookups-q-f-aggregation',
  minutes: 35,
  intro: 'Practise field lookups, Q and F objects, aggregate() and values().annotate(), write the matching SQL, and implement double-underscore lookups in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which query finds students from Pune **OR** with marks above 90?',
      options: ["Student.objects.filter(city='Pune', marks__gt=90)", "Student.objects.filter(Q(city='Pune') | Q(marks__gt=90))", "Student.objects.filter(city='Pune').filter(marks__gt=90)", "Student.objects.filter(Q(city='Pune') & Q(marks__gt=90))"],
      answer: 1,
      explain: 'Keyword arguments and chained `filter()` calls are combined with **AND**. For OR you need `Q` objects joined with `|`; `&` is AND and `~Q(...)` is NOT.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Give every student 5 bonus marks with a single UPDATE (no loop, no race condition):\n\n```\nStudent.objects.update(marks=______)\n```',
      accept: ["F('marks') + 5", 'F("marks") + 5', "F('marks')+5", '5 + F("marks")', "5 + F('marks')"],
      explain: '`F(\'marks\')` refers to the column value **inside the database**, so the SQL is `UPDATE ... SET marks = marks + 5`. Reading the value into Python, adding 5 and saving can lose updates when two requests run at the same time.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        "aggregate(Avg('marks')) returns a dict like {'marks__avg': 74.5}",
        "values('city').annotate(total=Count('id')) gives one row per city",
        "name__icontains='sha' matches 'Asha' and 'SHARMA'",
        "marks__range=(60, 80) includes 60 and 80",
        "annotate() and aggregate() are the same thing",
      ],
      answers: [0, 1, 2, 3],
      explain: '`aggregate()` returns **one dict** for the whole queryset; `annotate()` adds a value **per row** (or per group after `values()`). `icontains` is case-insensitive contains; `range` is SQL BETWEEN (inclusive).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'Write the SQL for this report:\n```\nStudent.objects.filter(marks__gte=40).values(\'city\')\n    .annotate(total=Count(\'id\'), avg_marks=Avg(\'marks\'))\n    .order_by(\'-total\', \'city\')\n```\nReturn columns `city`, `total`, `avg_marks` (round avg to 1 decimal with `ROUND(AVG(marks), 1)`).',
      example: { title: 'GROUP BY with aggregates', code: "SELECT category, COUNT(id) AS items, ROUND(AVG(price), 1) AS avg_price\nFROM shop_product\nWHERE price > 0\nGROUP BY category\nORDER BY items DESC;" },
      setup: `CREATE TABLE students_student (id INTEGER PRIMARY KEY, name TEXT, city TEXT, marks INTEGER);
INSERT INTO students_student VALUES (1, 'Asha', 'Pune', 82), (2, 'Ravi', 'Mumbai', 67), (3, 'Meera', 'Pune', 91), (4, 'Kabir', 'Pune', 35), (5, 'Neha', 'Nagpur', 74), (6, 'Dev', 'Mumbai', 58), (7, 'Zoya', 'Pune', 66);`,
      starter: 'SELECT city FROM students_student;',
      solution: 'SELECT city, COUNT(id) AS total, ROUND(AVG(marks), 1) AS avg_marks FROM students_student WHERE marks >= 40 GROUP BY city ORDER BY total DESC, city;',
      ordered: true,
      explain: '`filter()` before `values().annotate()` becomes WHERE (applied before grouping - Kabir with 35 is excluded). `values(\'city\')` + `annotate()` becomes GROUP BY city. A `filter()` **after** annotate on the aggregate would become HAVING.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: 'Implement Django field lookups over a list of dicts. Write `lookup_filter(rows, **conditions)` where a key is `field` or `field__lookup`. Support: `exact` (default), `iexact`, `contains`, `icontains`, `startswith`, `gt`, `gte`, `lt`, `lte`, `in`, `range` (inclusive tuple), `isnull` (True/False). All conditions must match (AND). Return the matching rows.',
      example: { title: 'splitting a lookup key', code: "field, _, lookup = 'marks__gte'.partition('__')\nprint(field, lookup or 'exact')   # marks gte" },
      starter: `def lookup_filter(rows, **conditions):
    # TODO
    return rows
`,
      solution: `OPS = {
    'exact': lambda a, b: a == b,
    'iexact': lambda a, b: a is not None and a.lower() == b.lower(),
    'contains': lambda a, b: a is not None and b in a,
    'icontains': lambda a, b: a is not None and b.lower() in a.lower(),
    'startswith': lambda a, b: a is not None and a.startswith(b),
    'gt': lambda a, b: a is not None and a > b,
    'gte': lambda a, b: a is not None and a >= b,
    'lt': lambda a, b: a is not None and a < b,
    'lte': lambda a, b: a is not None and a <= b,
    'in': lambda a, b: a in b,
    'range': lambda a, b: a is not None and b[0] <= a <= b[1],
    'isnull': lambda a, b: (a is None) == b,
}

def lookup_filter(rows, **conditions):
    def ok(row):
        for key, value in conditions.items():
            field, _, lookup = key.partition('__')
            if not OPS[lookup or 'exact'](row.get(field), value):
                return False
        return True
    return [r for r in rows if ok(r)]
`,
      tests: [
        { call: "[r['name'] for r in lookup_filter([{'name': 'Asha', 'city': 'Pune', 'marks': 82, 'phone': None}, {'name': 'Ravi', 'city': 'Mumbai', 'marks': 67, 'phone': '98'}, {'name': 'Meera', 'city': 'Pune', 'marks': 91, 'phone': '97'}, {'name': 'Kabir', 'city': 'pune', 'marks': 58, 'phone': None}], city__iexact='PUNE', marks__gte=60)]", expect: ['Asha', 'Meera'] },
        { call: "[r['name'] for r in lookup_filter([{'name': 'Asha', 'city': 'Pune', 'marks': 82, 'phone': None}, {'name': 'Ravi', 'city': 'Mumbai', 'marks': 67, 'phone': '98'}, {'name': 'Meera', 'city': 'Pune', 'marks': 91, 'phone': '97'}, {'name': 'Kabir', 'city': 'pune', 'marks': 58, 'phone': None}], name__icontains='a', phone__isnull=True)]", expect: ['Asha', 'Kabir'] },
        { call: "[r['name'] for r in lookup_filter([{'name': 'Asha', 'city': 'Pune', 'marks': 82}, {'name': 'Ravi', 'city': 'Mumbai', 'marks': 67}, {'name': 'Meera', 'city': 'Pune', 'marks': 91}, {'name': 'Kabir', 'city': 'pune', 'marks': 58}], marks__range=(58, 82), city__in=['Pune', 'Mumbai'])]", expect: ['Asha', 'Ravi'] },
        { call: "[r['name'] for r in lookup_filter([{'name': 'Asha', 'marks': 82}, {'name': 'Ravi', 'marks': 67}], name='Ravi')]", expect: ['Ravi'] },
        { call: "[r['name'] for r in lookup_filter([{'name': 'Asha', 'marks': 82}, {'name': 'Amit', 'marks': 40}], name__startswith='A', marks__lt=50)]", expect: ['Amit'] },
      ],
      explain: 'Django splits each keyword on `__`: the part before is the field (or a relation to follow), the last part is the lookup that becomes SQL (`gte` → `>=`, `icontains` → `LIKE %...%` case-insensitive, `in` → `IN (...)`, `range` → `BETWEEN`, `isnull` → `IS NULL`). Note `exact` is the default when no lookup is given.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `report(rows)` that returns what this ORM call returns:\n```\nStudent.objects.aggregate(total=Count(\'id\'), avg=Avg(\'marks\'), top=Max(\'marks\'), low=Min(\'marks\'))\n```\n`avg` rounded to 2 decimals. For an empty list Django returns `{\'total\': 0, \'avg\': None, \'top\': None, \'low\': None}`.',
      example: { title: 'aggregates in Python', code: "marks = [82, 67, 91]\nprint(len(marks), max(marks), round(sum(marks) / len(marks), 2))   # 3 91 80.0" },
      starter: `def report(rows):
    # TODO
    return {}
`,
      solution: `def report(rows):
    marks = [r['marks'] for r in rows]
    if not marks:
        return {'total': 0, 'avg': None, 'top': None, 'low': None}
    return {'total': len(marks), 'avg': round(sum(marks) / len(marks), 2), 'top': max(marks), 'low': min(marks)}
`,
      tests: [
        { call: "report([{'marks': 82}, {'marks': 67}, {'marks': 92}])", expect: { total: 3, avg: 80.33, top: 92, low: 67 } },
        { call: 'report([])', expect: { total: 0, avg: null, top: null, low: null } },
      ],
      explain: '`aggregate()` returns a **dict**, not a queryset. On an empty table `Count` gives 0 but `Avg/Max/Min/Sum` give `None` - templates and code must handle that (Django 4+ lets you pass `default=0`).',
    },
  ],
};
