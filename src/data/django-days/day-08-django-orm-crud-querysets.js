export default {
  id: 'day-08-django-orm-crud-querysets',
  title: 'Django ORM: CRUD, QuerySets, filter, exclude, get, order_by',
  module: 'Module 2: Models & Database',
  day: 8,
  level: 'Beginner',
  duration: '3 hours',
  summary: `Use the Django ORM to Create, Read, Update and Delete Student records without writing SQL. Learn managers and QuerySets, all(), filter(), exclude(), get(), order_by(), slicing, values(), count(), exists(), update(), delete(), get_or_create(), and connect the ORM to real views and templates.`,
  objectives: [
    `Explain what the ORM, a Manager (objects) and a QuerySet are`,
    `Create records with save(), create() and bulk_create()`,
    `Read records with all(), filter(), exclude(), get(), first(), last(), order_by(), slicing, values()`,
    `Update and delete single objects and whole QuerySets`,
    `Understand lazy evaluation, DoesNotExist / MultipleObjectsReturned and get_object_or_404`,
  ],
  theory: [
    {
      heading: `ORM, Manager and QuerySet`,
      content: `ORM (Object Relational Mapper) lets you talk to the database with Python objects. Student.objects is the Manager - the gateway to the table. Most manager methods return a QuerySet: a list-like collection of Student objects that represents a SQL query. Analogy: the Manager is the librarian, a QuerySet is the request slip you fill ("BCA students, sorted by marks"), and the rows are the books handed over only when you actually ask to read them.`,
      syntax: `from students.models import Student

Student.objects            # Manager
Student.objects.all()      # QuerySet of all rows  -> SELECT * FROM students_student
Student.objects.filter(course="BCA")   # QuerySet  -> ... WHERE course = 'BCA'`,
    },
    {
      heading: `Create (INSERT)`,
      content: `Three ways to insert rows.`,
      syntax: `# 1. Instantiate + save()  (two steps, lets you change fields before saving)
s = Student(roll_no="S101", name="Asha", email="asha@college.in", course="BCA", marks=92)
s.save()                       # INSERT; s.id is now set

# 2. create()  (one step)
Student.objects.create(roll_no="S102", name="Ravi", email="ravi@college.in", course="BSc", marks=76)

# 3. bulk_create()  (one query for many rows - fast; does not call save() or signals)
Student.objects.bulk_create([
    Student(roll_no="S103", name="Meena", email="meena@college.in", course="BCA", marks=35),
    Student(roll_no="S104", name="Kiran", email="kiran@college.in", course="BCom", marks=81),
])`,
    },
    {
      heading: `Read (SELECT)`,
      content: `QuerySet methods can be chained because most of them return a new QuerySet.`,
      points: [
        `all() - every row. filter(**conditions) - rows that match (AND). exclude(**conditions) - rows that do NOT match.`,
        `get(**conditions) - exactly ONE object. Raises Student.DoesNotExist if none, Student.MultipleObjectsReturned if more than one.`,
        `order_by("marks") ascending, order_by("-marks") descending, order_by("course", "name") multiple.`,
        `first(), last() - one object or None (never raises).`,
        `count(), exists() - efficient COUNT / EXISTS queries.`,
        `Slicing [:3] -> LIMIT 3, [3:6] -> OFFSET 3 LIMIT 3 (negative indexing not supported).`,
        `values("name", "marks") - list of dicts; values_list("name", flat=True) - flat list; distinct().`,
        `In views use get_object_or_404(Student, pk=id) instead of get() to return a 404 page automatically.`,
      ],
    },
    {
      heading: `Update and Delete`,
      content: `Update one object by changing attributes and calling save(), or update many rows in a single query with QuerySet.update(). Delete with obj.delete() or QuerySet.delete().`,
      syntax: `s = Student.objects.get(roll_no="S102")
s.marks = 80
s.save()                                   # UPDATE all columns of that row
s.save(update_fields=["marks"])            # UPDATE only marks (faster)

Student.objects.filter(course="BSc").update(is_active=False)   # one UPDATE, returns row count

Student.objects.get(roll_no="S103").delete()
Student.objects.filter(is_active=False).delete()   # returns (count, {model: count})

# Helpers
obj, created = Student.objects.get_or_create(roll_no="S103", defaults={...})
obj, created = Student.objects.update_or_create(roll_no="S104", defaults={"marks": 85})`,
      tip: `QuerySet.update() does NOT call save(), so auto_now fields (updated_at) are not changed and signals are not sent. Danger: Student.objects.all().delete() empties the table - always filter first.`,
    },
    {
      heading: `QuerySets are lazy`,
      content: `Creating or chaining a QuerySet runs NO SQL. Django builds the SQL and waits. The query runs only when you evaluate it: iterate (for loop / template loop), call len(), list(), bool(), print/repr, slice with a step, or call methods like count(), get(), first(). Results are cached in the QuerySet, so looping twice over the same QuerySet hits the database only once.`,
      points: [
        `print(qs.query) shows the SQL Django will run - great for learning and debugging.`,
        `qs = Student.objects.filter(course="BCA")  -> no query`,
        `qs = qs.order_by("-marks")  -> still no query`,
        `for s in qs: ...  -> ONE query now`,
      ],
    },
    {
      heading: `Common mistakes`,
      content: `These ORM errors are seen daily by beginners.`,
      points: [
        `Using get() when several rows can match -> MultipleObjectsReturned. Use filter() instead.`,
        `Calling get() in a view without handling DoesNotExist -> 500 error. Use get_object_or_404().`,
        `Writing Student.objects.filter(course="BCA").name - a QuerySet has no .name; loop over it or use first().`,
        `Forgetting save() after changing attributes - changes stay only in memory.`,
        `Running queries inside a loop (one query per student) - see N+1 on Day 12.`,
      ],
    },
  ],
  examples: [
    {
      title: `ORM CRUD in the Django shell`,
      scenario: `Insert five students, query them in many ways, update and delete - using the Student model from Day 7.`,
      steps: [
        `Open the VS Code / PyCharm terminal with the venv active.`,
        `Run python manage.py shell (PyCharm Professional also has Tools > Python or Debug Console > Django Console).`,
        `Type the statements one by one and watch the output.`,
        `Exit with exit() or Ctrl+Z Enter (Windows) / Ctrl+D (macOS/Linux).`,
      ],
      code: `>>> from students.models import Student
>>> s = Student(roll_no="S101", name="Asha", email="asha@college.in", gender="F", course="BCA", marks=92)
>>> s.save()
>>> print(s.id, s)
>>> Student.objects.create(roll_no="S102", name="Ravi", email="ravi@college.in", course="BSc", marks=76)
>>> Student.objects.bulk_create([
...     Student(roll_no="S103", name="Meena", email="meena@college.in", gender="F", course="BCA", marks=35),
...     Student(roll_no="S104", name="Kiran", email="kiran@college.in", course="BCom", marks=81),
...     Student(roll_no="S105", name="Priya", email="priya@college.in", gender="F", course="BSc", marks=64),
... ])
>>> Student.objects.count()
>>> Student.objects.all()
>>> Student.objects.filter(course="BCA")
>>> Student.objects.exclude(course="BCA")
>>> Student.objects.order_by("-marks").values_list("name", "marks")
>>> st = Student.objects.get(roll_no="S102")
>>> print(st.name, st.marks, st.get_gender_display())
>>> Student.objects.get(roll_no="S999")
>>> Student.objects.get(course="BCA")
>>> Student.objects.first(), Student.objects.last()
>>> Student.objects.order_by("-marks")[:3]
>>> st.marks = 80; st.save()
>>> Student.objects.filter(course="BSc").update(is_active=False)
>>> Student.objects.filter(roll_no="S103").delete()
>>> Student.objects.update_or_create(roll_no="S104", defaults={"marks": 85})
>>> Student.objects.values_list("course", flat=True).distinct().order_by("course")`,
      result: `1 S101 - Asha
5
<QuerySet [<Student: S101 - Asha>, <Student: S102 - Ravi>, <Student: S103 - Meena>, <Student: S104 - Kiran>, <Student: S105 - Priya>]>
<QuerySet [<Student: S101 - Asha>, <Student: S103 - Meena>]>
<QuerySet [<Student: S102 - Ravi>, <Student: S104 - Kiran>, <Student: S105 - Priya>]>
<QuerySet [('Asha', 92), ('Kiran', 81), ('Ravi', 76), ('Priya', 64), ('Meena', 35)]>
Ravi 76 Male
students.models.Student.DoesNotExist: Student matching query does not exist.
students.models.Student.MultipleObjectsReturned: get() returned more than one Student -- it returned 2!
(<Student: S101 - Asha>, <Student: S105 - Priya>)
<QuerySet [<Student: S101 - Asha>, <Student: S104 - Kiran>, <Student: S102 - Ravi>]>
2
(1, {'students.Student': 1})
(<Student: S104 - Kiran>, False)
<QuerySet ['BCA', 'BCom', 'BSc']>`,
      explanation: `Results appear in roll_no order because of Meta.ordering = ["roll_no"]. get() is strict: zero or many matches raise exceptions. update() returned 2 (rows changed), delete() returned the number of rows deleted per model, and update_or_create returned (object, created=False) because S104 already existed.`,
    },
    {
      title: `Student list, detail and filter views using the ORM`,
      scenario: `Replace the in-memory STUDENTS list from Days 4-5 with real database queries, including a course filter and search from the query string.`,
      steps: [
        `Edit students/views.py and students/urls.py as below.`,
        `Update student_list.html to use real fields (roll_no, name, course, marks, result).`,
        `Run runserver and open /students/, /students/?course=BCA, /students/?q=ra&sort=-marks, /students/1/.`,
      ],
      code: `# students/views.py
from django.shortcuts import render, get_object_or_404
from .models import Student

def student_list(request):
    students = Student.objects.filter(is_active=True)
    course = request.GET.get("course")
    q = request.GET.get("q")
    sort = request.GET.get("sort", "roll_no")
    if course:
        students = students.filter(course=course)
    if q:
        students = students.filter(name__icontains=q)       # lookups: Day 9
    if sort in ["roll_no", "name", "marks", "-marks"]:
        students = students.order_by(sort)
    courses = Student.objects.values_list("course", flat=True).distinct().order_by("course")
    context = {"students": students, "courses": courses, "selected": course, "title": "Students"}
    return render(request, "students/student_list.html", context)

def student_detail(request, student_id):
    student = get_object_or_404(Student, pk=student_id)
    return render(request, "students/student_detail.html", {"student": student})

# students/urls.py
from django.urls import path
from . import views

app_name = "students"
urlpatterns = [
    path("", views.student_list, name="list"),
    path("<int:student_id>/", views.student_detail, name="detail"),
]

<!-- students/templates/students/student_list.html -->
{% extends "base.html" %}
{% block content %}
<h1>{{ title }} ({{ students|length }})</h1>
<p>Filter:
  <a href="?">All</a>
  {% for c in courses %}<a href="?course={{ c }}">{{ c }}</a> {% endfor %}
</p>
<form method="get">
  <input name="q" placeholder="Search name" value="{{ request.GET.q }}">
  <button>Search</button>
</form>
<table>
  <tr><th>Roll</th><th>Name</th><th>Course</th><th><a href="?sort=-marks">Marks</a></th><th>Result</th></tr>
  {% for s in students %}
  <tr>
    <td>{{ s.roll_no }}</td>
    <td><a href="{% url 'students:detail' s.id %}">{{ s.name }}</a></td>
    <td>{{ s.course }}</td><td>{{ s.marks }}</td><td>{{ s.result }}</td>
  </tr>
  {% empty %}<tr><td colspan="5">No students found.</td></tr>
  {% endfor %}
</table>
{% endblock %}`,
      result: `/students/                 -> active students sorted by roll number
/students/?course=BCA      -> only BCA students
/students/?q=ra&sort=-marks-> names containing "ra", highest marks first
/students/999/             -> 404 Page not found (get_object_or_404)`,
      explanation: `The QuerySet is built step by step and runs only once, when the template loops over it. get_object_or_404 turns DoesNotExist into a proper 404 instead of a server error. s.result is the @property from the model.`,
    },
    {
      title: `See the SQL behind a QuerySet`,
      scenario: `Learn what SQL the ORM generates, which helps in interviews and when tuning MySQL.`,
      steps: [
        `Open python manage.py shell.`,
        `Build a QuerySet and print its .query attribute.`,
        `With MySQL configured, the same QuerySet produces MySQL syntax with backticks.`,
      ],
      code: `>>> qs = Student.objects.filter(gender="F").order_by("marks").values("name", "marks")
>>> print(qs.query)
>>> from django.db import connection, reset_queries
>>> list(qs)                       # executes now
>>> connection.queries[-1]["sql"]  # last executed SQL (DEBUG=True only)`,
      result: `SELECT "students_student"."name", "students_student"."marks" FROM "students_student" WHERE "students_student"."gender" = F ORDER BY "students_student"."marks" ASC

[{'name': 'Meena', 'marks': 35}, {'name': 'Priya', 'marks': 64}, {'name': 'Asha', 'marks': 92}]`,
      explanation: `str(qs.query) shows the SQL with parameters substituted for display only (that is why F has no quotes) - the real query uses safe parameter binding, which protects against SQL injection. values() selects only the requested columns.`,
    },
    {
      title: `Pure Python: a tiny lazy QuerySet`,
      scenario: `Understand lazy evaluation by building a mini QuerySet whose filter/exclude/order_by only record steps, and which "hits the database" only when you loop.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Notice where "hitting the database now" is printed.`,
      ],
      code: `class QuerySet:
    def __init__(self, rows, steps=None):
        self.rows = rows
        self.steps = steps or []

    def filter(self, **kw):
        return QuerySet(self.rows, self.steps + [("filter", kw)])

    def exclude(self, **kw):
        return QuerySet(self.rows, self.steps + [("exclude", kw)])

    def order_by(self, field):
        return QuerySet(self.rows, self.steps + [("order", field)])

    def _evaluate(self):
        print("  ...hitting the database now")
        data = list(self.rows)
        for kind, arg in self.steps:
            if kind == "filter":
                data = [r for r in data if all(r[k] == v for k, v in arg.items())]
            elif kind == "exclude":
                data = [r for r in data if not all(r[k] == v for k, v in arg.items())]
            else:
                rev = arg.startswith("-")
                data.sort(key=lambda r: r[arg.lstrip("-")], reverse=rev)
        return data

    def __iter__(self):
        return iter(self._evaluate())


STUDENTS = [
    {"name": "Asha", "course": "BCA", "marks": 92, "gender": "F"},
    {"name": "Ravi", "course": "BSc", "marks": 76, "gender": "M"},
    {"name": "Meena", "course": "BCA", "marks": 35, "gender": "F"},
    {"name": "Kiran", "course": "BCom", "marks": 81, "gender": "M"},
]

qs = QuerySet(STUDENTS).filter(gender="F")
print("Step 1: filter built, no query yet")
qs = qs.exclude(course="BSc").order_by("-marks")
print("Step 2: chained exclude + order_by, still no query")
print("Step 3: looping...")
for s in qs:
    print(" ", s["name"], s["marks"])`,
      python: {
        files: {
          'main.py': `class QuerySet:
    def __init__(self, rows, steps=None):
        self.rows = rows
        self.steps = steps or []

    def filter(self, **kw):
        return QuerySet(self.rows, self.steps + [("filter", kw)])

    def exclude(self, **kw):
        return QuerySet(self.rows, self.steps + [("exclude", kw)])

    def order_by(self, field):
        return QuerySet(self.rows, self.steps + [("order", field)])

    def _evaluate(self):
        print("  ...hitting the database now")
        data = list(self.rows)
        for kind, arg in self.steps:
            if kind == "filter":
                data = [r for r in data if all(r[k] == v for k, v in arg.items())]
            elif kind == "exclude":
                data = [r for r in data if not all(r[k] == v for k, v in arg.items())]
            else:
                rev = arg.startswith("-")
                data.sort(key=lambda r: r[arg.lstrip("-")], reverse=rev)
        return data

    def __iter__(self):
        return iter(self._evaluate())


STUDENTS = [
    {"name": "Asha", "course": "BCA", "marks": 92, "gender": "F"},
    {"name": "Ravi", "course": "BSc", "marks": 76, "gender": "M"},
    {"name": "Meena", "course": "BCA", "marks": 35, "gender": "F"},
    {"name": "Kiran", "course": "BCom", "marks": 81, "gender": "M"},
]

qs = QuerySet(STUDENTS).filter(gender="F")
print("Step 1: filter built, no query yet")
qs = qs.exclude(course="BSc").order_by("-marks")
print("Step 2: chained exclude + order_by, still no query")
print("Step 3: looping...")
for s in qs:
    print(" ", s["name"], s["marks"])
`,
        },
      },
      result: `Step 1: filter built, no query yet
Step 2: chained exclude + order_by, still no query
Step 3: looping...
  ...hitting the database now
  Asha 92
  Meena 35`,
      explanation: `Each method returns a NEW QuerySet with one more recorded step - that is why Django QuerySets can be chained and reused safely. Work happens only in _evaluate(), triggered by iteration, exactly like Django's lazy QuerySets.`,
    },
  ],
  interview: [
    { q: `What is a QuerySet?`, a: `A lazy, chainable collection of model objects representing a database query. It is evaluated (SQL executed) only when iterated, sliced with a step, printed, len()/list()/bool() is called, or methods like count()/get() are used.`, level: 'Easy' },
    { q: `What is objects in Student.objects?`, a: `The default Manager (models.Manager) - the interface through which database query operations are provided to a model. You can define custom managers.`, level: 'Easy' },
    { q: `Difference between get() and filter()?`, a: `get() returns a single object and raises DoesNotExist or MultipleObjectsReturned. filter() returns a QuerySet (possibly empty) and never raises for zero/many matches.`, level: 'Easy' },
    { q: `create() vs save()?`, a: `save() inserts or updates an existing instance. create(**kwargs) instantiates and saves in one step and returns the object.`, level: 'Easy' },
    { q: `What is the difference between QuerySet.update() and obj.save()?`, a: `update() issues a single SQL UPDATE for all matching rows, without loading objects, calling save(), sending signals or updating auto_now. save() works on one loaded instance and runs model save logic.`, level: 'Medium' },
    { q: `What does bulk_create do and what are its limitations?`, a: `Inserts many objects with one (or few batched) INSERT queries. It does not call save(), does not send pre/post_save signals, and does not handle multi-table inheritance.`, level: 'Medium' },
    { q: `How do you see the SQL of a QuerySet?`, a: `print(qs.query), or connection.queries when DEBUG=True, or Django Debug Toolbar, or qs.explain() for the query plan.`, level: 'Medium' },
    { q: `What does get_or_create return?`, a: `A tuple (object, created) where created is True if a new row was inserted, False if an existing one was fetched.`, level: 'Easy' },
    { q: `What is the output of Student.objects.filter(course="XYZ")?`, a: `An empty QuerySet: <QuerySet []>. No exception is raised.`, level: 'Easy' },
    { q: `Why are QuerySets lazy?`, a: `So you can build them in steps (filtering, ordering in different functions) without running multiple queries; only the final combined SQL runs once, and results are cached for reuse.`, level: 'Medium' },
    { q: `How do you avoid a 500 error when an object is not found in a view?`, a: `Use get_object_or_404(Model, **lookup) or catch Model.DoesNotExist and return/raise Http404.`, level: 'Easy' },
    { q: `values() vs values_list()?`, a: `values() returns dictionaries; values_list() returns tuples; values_list("field", flat=True) returns plain values. Both fetch only the given columns.`, level: 'Medium' },
  ],
  practice: [
    { task: `Get the top 2 BCA students by marks.`, hint: `filter + order_by("-marks") + slicing.`, solution: `Student.objects.filter(course="BCA").order_by("-marks")[:2]` },
    { task: `Increase marks by 5 for student S105 and save only that field.`, hint: `update_fields`, solution: `s = Student.objects.get(roll_no="S105")\ns.marks += 5\ns.save(update_fields=["marks"])` },
    { task: `Write a view course_students(request, course) that renders all students of a course or shows "No students" if empty.`, hint: `filter + {% empty %}`, solution: `def course_students(request, course):\n    students = Student.objects.filter(course=course).order_by("name")\n    return render(request, "students/student_list.html", {"students": students, "title": course})\n\npath("course/<str:course>/", views.course_students, name="course"),` },
    { task: `Deactivate all students with marks below 40 and print how many were changed.`, hint: `marks__lt (preview of Day 9) and update().`, solution: `count = Student.objects.filter(marks__lt=40).update(is_active=False)\nprint(count)` },
    { task: `Print a list of only the email addresses of female students.`, hint: `values_list flat`, solution: `list(Student.objects.filter(gender="F").values_list("email", flat=True))` },
  ],
  quiz: [
    { question: `What does Student.objects.get(roll_no="S999") do if no row exists?`, options: [`Returns None`, `Returns an empty QuerySet`, `Raises Student.DoesNotExist`, `Creates the row`], answer: 2, explanation: `get() raises DoesNotExist; use first() or filter() if you want None/empty.` },
    { question: `Which query sorts by marks highest first?`, options: [`order_by("-marks")`, `order_by("marks")`, `sort("marks", desc=True)`, `order_by("marks DESC")`], answer: 0, explanation: `A minus sign prefix means descending.` },
    { question: `Which method returns rows that do NOT match a condition?`, options: [`filter_not()`, `remove()`, `without()`, `exclude()`], answer: 3, explanation: `exclude() negates the conditions.` },
    { question: `When is this executed: qs = Student.objects.filter(course="BCA")?`, options: [`Immediately`, `When qs is evaluated (e.g. iterated)`, `When the server restarts`, `Never`], answer: 1, explanation: `QuerySets are lazy.` },
    { question: `Student.objects.filter(course="BSc").update(is_active=False) returns:`, options: [`A QuerySet`, `None`, `The number of rows updated`, `True`], answer: 2, explanation: `update() returns the count of affected rows.` },
  ],
};
