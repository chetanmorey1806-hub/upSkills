export default {
  id: 'day-12-select-related-prefetch-related',
  title: 'select_related, prefetch_related, N+1 Problem',
  module: 'Module 2: Models & Database',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Find and fix the most common Django performance bug - the N+1 query problem - in the Student Portal. Learn how select_related (SQL JOIN) and prefetch_related (separate query + Python join) work, when to use each, the Prefetch object, and how to count queries with connection.queries, CaptureQueriesContext and Django Debug Toolbar.`,
  objectives: [
    `Explain the N+1 query problem and spot it in views and templates`,
    `Use select_related for ForeignKey and OneToOne relations (JOIN)`,
    `Use prefetch_related for ManyToMany and reverse ForeignKey relations`,
    `Customise prefetching with Prefetch(queryset=..., to_attr=...)`,
    `Measure queries with connection.queries, CaptureQueriesContext, assertNumQueries and Debug Toolbar`,
  ],
  theory: [
    {
      heading: `What is the N+1 problem?`,
      content: `You run 1 query to get N students, then while looping you access student.course - Django runs 1 more query per student to fetch the course. Total N+1 queries. With 6 students that is 7 queries; with 5,000 students it is 5,001 queries and the page becomes painfully slow. Analogy: a teacher fetching 50 answer sheets from the staff room one by one (50 trips) instead of carrying the whole bundle in one trip.`,
      syntax: `students = Student.objects.all()          # 1 query
for s in students:
    print(s.course.code)                   # +1 query for EACH student  -> N+1`,
      points: [
        `It hides in templates too: {{ s.course.code }} inside {% for %} triggers the same extra queries.`,
        `Also in admin list_display columns that show related fields, and in DRF serializers.`,
        `The ORM is lazy - related objects are fetched only when accessed - that is the root cause.`,
      ],
    },
    {
      heading: `select_related: one JOIN query`,
      content: `select_related("course") tells Django to JOIN the related table in the same SQL query and fill student.course immediately. It works for "single-valued" relations: ForeignKey and OneToOneField (forward), and OneToOne reverse. It can follow chains with __.`,
      syntax: `Student.objects.select_related("course")                 # INNER JOIN students_course
Student.objects.select_related("course", "profile")      # two JOINs
StudentProfile.objects.select_related("student__course")  # follow chain
Student.objects.select_related()                         # all non-null FKs (avoid - too broad)`,
      tip: `For a nullable ForeignKey Django uses LEFT OUTER JOIN; for non-null it uses INNER JOIN.`,
    },
    {
      heading: `prefetch_related: separate query + join in Python`,
      content: `For "many-valued" relations (ManyToMany and reverse ForeignKey like course.students) a JOIN would duplicate rows. prefetch_related runs one extra query per relation using WHERE id IN (...) and connects the objects in Python. Total = 1 + number of prefetched relations, regardless of N.`,
      syntax: `Student.objects.prefetch_related("subjects")         # 2 queries
Course.objects.prefetch_related("students")          # 2 queries
Student.objects.select_related("course").prefetch_related("subjects")   # combine: 2 queries`,
      points: [
        `select_related -> FK / OneToOne -> JOIN -> 1 query.`,
        `prefetch_related -> M2M / reverse FK (also works on FK) -> IN query -> 1 extra query per relation.`,
        `Prefetched data is used only by .all(). Calling .filter() on a prefetched relation ignores the cache and hits the database again.`,
      ],
    },
    {
      heading: `The Prefetch object`,
      content: `Prefetch lets you filter, order or select_related inside the prefetch query, and store the result in a custom attribute with to_attr (a plain list).`,
      syntax: `from django.db.models import Prefetch

courses = Course.objects.prefetch_related(
    Prefetch(
        "students",
        queryset=Student.objects.filter(marks__gte=60).order_by("-marks"),
        to_attr="good_students",
    )
)
for c in courses:
    print(c.code, [s.name for s in c.good_students])   # still 2 queries`,
    },
    {
      heading: `Measuring queries`,
      content: `Never guess - count. With DEBUG=True Django records every query in connection.queries.`,
      points: [
        `from django.db import connection, reset_queries; reset_queries(); ...; len(connection.queries)`,
        `from django.test.utils import CaptureQueriesContext; with CaptureQueriesContext(connection) as ctx: ...; len(ctx.captured_queries)`,
        `In tests: with self.assertNumQueries(2): ... (fails if the count changes - protects against regressions).`,
        `Django Debug Toolbar: pip install django-debug-toolbar - shows SQL panel with duplicate query warnings on every page.`,
        `Other tools: only()/defer() to fetch fewer columns, values() for plain dicts, annotate(Count(...)) instead of len(obj.related.all()) for counts, in admin list_select_related.`,
      ],
    },
  ],
  examples: [
    {
      title: `Detecting N+1 and fixing it with select_related`,
      scenario: `The student list shows each student's course code. Count the queries before and after the fix (6 students, 3 courses, data from Day 10).`,
      steps: [
        `Open python manage.py shell in the VS Code / PyCharm terminal.`,
        `Paste the code below.`,
        `Compare the query counts.`,
      ],
      code: `>>> from django.db import connection
>>> from django.test.utils import CaptureQueriesContext
>>> from students.models import Student

>>> with CaptureQueriesContext(connection) as ctx:
...     for s in Student.objects.all():
...         print(s.name, "-", s.course.code)
>>> print("Queries:", len(ctx.captured_queries))

>>> with CaptureQueriesContext(connection) as ctx:
...     for s in Student.objects.select_related("course"):
...         print(s.name, "-", s.course.code)
>>> print("Queries:", len(ctx.captured_queries))
>>> print(ctx.captured_queries[0]["sql"])`,
      result: `Asha Verma - BCA
Ravi Kumar - BSC
Meena Iyer - BCA
Kiran Rao - BCOM
Priya Nair - BSC
Arjun Das - BCA
Queries: 7

Asha Verma - BCA
... (same 6 lines)
Queries: 1

SELECT "students_student"."id", "students_student"."roll_no", ... "students_course"."id", "students_course"."code", "students_course"."name", "students_course"."duration_years" FROM "students_student" INNER JOIN "students_course" ON ("students_student"."course_id" = "students_course"."id") ORDER BY "students_student"."roll_no" ASC`,
      explanation: `Without select_related: 1 query for students + 6 queries for courses = 7. With select_related: one INNER JOIN query that returns student and course columns together, and Django builds both objects from each row.`,
    },
    {
      title: `prefetch_related for ManyToMany and reverse ForeignKey, plus Prefetch`,
      scenario: `Show each student's subjects, each course's students, and only the good students (marks >= 60) per course - all with a constant number of queries.`,
      steps: [
        `Continue in the same shell.`,
        `Run each block and note the query count.`,
        `Notice the IN (...) query that prefetch_related generates.`,
      ],
      code: `>>> from django.db.models import Prefetch
>>> with CaptureQueriesContext(connection) as ctx:
...     for s in Student.objects.all():
...         print(s.name, [x.name for x in s.subjects.all()])
>>> print("Queries:", len(ctx.captured_queries))

>>> with CaptureQueriesContext(connection) as ctx:
...     for s in Student.objects.prefetch_related("subjects"):
...         print(s.name, [x.name for x in s.subjects.all()])
>>> print("Queries:", len(ctx.captured_queries))
>>> print(ctx.captured_queries[1]["sql"])

>>> with CaptureQueriesContext(connection) as ctx:
...     for c in Course.objects.prefetch_related("students"):
...         print(c.code, [s.name for s in c.students.all()])
>>> print("Queries:", len(ctx.captured_queries))

>>> with CaptureQueriesContext(connection) as ctx:
...     qs = Student.objects.select_related("course", "profile").prefetch_related("subjects")
...     for s in qs:
...         print(s.roll_no, s.course.code, s.profile.blood_group, len(s.subjects.all()))
>>> print("Queries:", len(ctx.captured_queries))

>>> with CaptureQueriesContext(connection) as ctx:
...     courses = Course.objects.prefetch_related(Prefetch("students",
...         queryset=Student.objects.filter(marks__gte=60).order_by("-marks"), to_attr="good_students"))
...     for c in courses:
...         print(c.code, [s.name for s in c.good_students])
>>> print("Queries:", len(ctx.captured_queries))`,
      result: `Asha Verma ['Python', 'Django', 'SQL']
Ravi Kumar ['Python', 'SQL']
Meena Iyer ['Python']
Kiran Rao ['Accounts']
Priya Nair ['Python', 'SQL']
Arjun Das ['Python', 'Django']
Queries: 7

(same 6 lines)
Queries: 2
SELECT ("students_student_subjects"."student_id") AS "_prefetch_related_val_student_id", "students_subject"."id", "students_subject"."name", "students_subject"."credits" FROM "students_subject" INNER JOIN "students_student_subjects" ON ("students_subject"."id" = "students_student_subjects"."subject_id") WHERE "students_student_subjects"."student_id" IN (1, 2, 3, 4, 5, 6)

BCA ['Asha Verma', 'Meena Iyer', 'Arjun Das']
BSC ['Ravi Kumar', 'Priya Nair']
BCOM ['Kiran Rao']
Queries: 2

S101 BCA O+ 3
S102 BSC O+ 2
S103 BCA O+ 1
S104 BCOM O+ 1
S105 BSC O+ 2
S106 BCA O+ 2
Queries: 2

BCA ['Asha Verma']
BSC ['Ravi Kumar', 'Priya Nair']
BCOM ['Kiran Rao']
Queries: 2`,
      explanation: `prefetch_related collected all student ids and fetched every subject link in one IN query. Combining select_related (course + profile as JOINs) with prefetch_related (subjects) gave 2 queries for everything. Prefetch with to_attr filtered and ordered the related students in SQL while keeping 2 queries. (Every student was given a profile with blood group O+ for this demo.)`,
    },
    {
      title: `Fixing N+1 in a view, template and admin`,
      scenario: `Apply the optimisation to the real Student Portal pages and verify with Django Debug Toolbar.`,
      steps: [
        `pip install django-debug-toolbar`,
        `Add the settings and URL below (development only).`,
        `Update the student_list view and StudentAdmin.`,
        `Open /students/ - the toolbar on the right shows the SQL panel: before = 1 + N (+N for subjects), after = 2 queries.`,
        `Common trap: s.subjects.filter(...) inside the template loop ignores prefetch and causes N queries again.`,
      ],
      code: `# settings.py (development)
INSTALLED_APPS += ["debug_toolbar"]
MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
INTERNAL_IPS = ["127.0.0.1"]

# student_portal/urls.py
from django.conf import settings
if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]

# students/views.py
from django.shortcuts import render
from .models import Student

def student_list(request):
    students = (Student.objects.filter(is_active=True)
                .select_related("course")
                .prefetch_related("subjects"))
    return render(request, "students/student_list.html", {"students": students})

<!-- students/templates/students/student_list.html (rows) -->
{% for s in students %}
<tr>
  <td>{{ s.roll_no }}</td><td>{{ s.name }}</td>
  <td>{{ s.course.code }}</td>
  <td>{% for sub in s.subjects.all %}{{ sub.name }}{% if not forloop.last %}, {% endif %}{% endfor %}</td>
</tr>
{% endfor %}

# students/admin.py
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("roll_no", "name", "course", "marks")
    list_select_related = ("course",)

# Course list with student counts: use annotate instead of obj.students.count() per row
from django.db.models import Count
Course.objects.annotate(n=Count("students")).order_by("code")   # 1 query`,
      result: `Debug Toolbar SQL panel for /students/ (6 students):
Before optimisation: 13 queries (1 students + 6 courses + 6 subjects), "6 similar queries" warnings
After optimisation:  2 queries`,
      explanation: `The view decides what data the template needs and loads it efficiently. s.subjects.all in the template uses the prefetch cache. list_select_related does the same JOIN for the admin change list. Counting with annotate(Count) keeps the course list at one query.`,
    },
    {
      title: `Pure Python: N+1 vs JOIN vs prefetch counted with sqlite3`,
      scenario: `Log every SQL statement with sqlite3's trace callback to see exactly why N+1 is slow and how the two fixes work internally.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Add 10 more students and see how only n_plus_one grows.`,
      ],
      code: `import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE course (id INTEGER PRIMARY KEY, code TEXT);
CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT, course_id INTEGER);
INSERT INTO course VALUES (1, 'BCA'), (2, 'BSC'), (3, 'BCOM');
INSERT INTO student VALUES (1, 'Asha', 1), (2, 'Ravi', 2), (3, 'Meena', 1),
                           (4, 'Kiran', 3), (5, 'Priya', 2), (6, 'Arjun', 1);
""")

queries = []
db.set_trace_callback(queries.append)   # log every SQL statement


def n_plus_one():
    rows = db.execute("SELECT id, name, course_id FROM student").fetchall()   # 1 query
    for _, name, course_id in rows:                                          # + N queries
        code = db.execute("SELECT code FROM course WHERE id = ?", (course_id,)).fetchone()[0]
        print(" ", name, code)


def select_related():
    rows = db.execute("SELECT s.name, c.code FROM student s "
                      "JOIN course c ON c.id = s.course_id").fetchall()       # 1 JOIN query
    for name, code in rows:
        print(" ", name, code)


def prefetch_related():
    students = db.execute("SELECT name, course_id FROM student").fetchall()   # query 1
    ids = sorted({cid for _, cid in students})
    marks = ",".join("?" * len(ids))
    courses = dict(db.execute(f"SELECT id, code FROM course WHERE id IN ({marks})", ids))  # query 2
    for name, cid in students:                                               # joined in Python
        print(" ", name, courses[cid])


for func in (n_plus_one, select_related, prefetch_related):
    queries.clear()
    print(func.__name__)
    func()
    print("  queries:", len(queries))`,
      python: {
        files: {
          'main.py': `import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE course (id INTEGER PRIMARY KEY, code TEXT);
CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT, course_id INTEGER);
INSERT INTO course VALUES (1, 'BCA'), (2, 'BSC'), (3, 'BCOM');
INSERT INTO student VALUES (1, 'Asha', 1), (2, 'Ravi', 2), (3, 'Meena', 1),
                           (4, 'Kiran', 3), (5, 'Priya', 2), (6, 'Arjun', 1);
""")

queries = []
db.set_trace_callback(queries.append)   # log every SQL statement


def n_plus_one():
    rows = db.execute("SELECT id, name, course_id FROM student").fetchall()   # 1 query
    for _, name, course_id in rows:                                          # + N queries
        code = db.execute("SELECT code FROM course WHERE id = ?", (course_id,)).fetchone()[0]
        print(" ", name, code)


def select_related():
    rows = db.execute("SELECT s.name, c.code FROM student s "
                      "JOIN course c ON c.id = s.course_id").fetchall()       # 1 JOIN query
    for name, code in rows:
        print(" ", name, code)


def prefetch_related():
    students = db.execute("SELECT name, course_id FROM student").fetchall()   # query 1
    ids = sorted({cid for _, cid in students})
    marks = ",".join("?" * len(ids))
    courses = dict(db.execute(f"SELECT id, code FROM course WHERE id IN ({marks})", ids))  # query 2
    for name, cid in students:                                               # joined in Python
        print(" ", name, courses[cid])


for func in (n_plus_one, select_related, prefetch_related):
    queries.clear()
    print(func.__name__)
    func()
    print("  queries:", len(queries))
`,
        },
      },
      result: `n_plus_one
  Asha BCA
  Ravi BSC
  Meena BCA
  Kiran BCOM
  Priya BSC
  Arjun BCA
  queries: 7
select_related
  Asha BCA
  Ravi BSC
  Meena BCA
  Kiran BCOM
  Priya BSC
  Arjun BCA
  queries: 1
prefetch_related
  Asha BCA
  Ravi BSC
  Meena BCA
  Kiran BCOM
  Priya BSC
  Arjun BCA
  queries: 2`,
      explanation: `n_plus_one runs 1 + 6 queries; the count grows with every student. select_related's strategy is a single JOIN. prefetch_related's strategy is two queries - the second uses IN (...) with all needed ids - then a dictionary lookup in Python links the objects. Both fixes stay constant no matter how many students exist.`,
    },
  ],
  interview: [
    { q: `What is the N+1 query problem?`, a: `Fetching N parent objects with 1 query and then triggering 1 additional query per object when accessing a related field, giving N+1 queries. It is caused by lazy loading of relations inside loops.`, level: 'Easy' },
    { q: `Difference between select_related and prefetch_related?`, a: `select_related uses a SQL JOIN in the same query and works for ForeignKey/OneToOne. prefetch_related runs a separate query per relation (WHERE ... IN) and joins in Python; it works for ManyToMany and reverse ForeignKey (and also FK).`, level: 'Easy' },
    { q: `Why can't select_related be used for ManyToMany?`, a: `A JOIN to a many-valued relation would multiply parent rows (one per related row), producing duplicates and huge result sets. Django therefore restricts select_related to single-valued relations.`, level: 'Medium' },
    { q: `How many queries does Student.objects.select_related("course").prefetch_related("subjects") run when iterated?`, a: `Two: one JOIN query for students + courses, one IN query for subjects.`, level: 'Medium' },
    { q: `What is the Prefetch object used for?`, a: `To customise a prefetch: filter/order the related queryset, use select_related inside it, and store the result in a custom attribute via to_attr.`, level: 'Medium' },
    { q: `Why does s.subjects.filter(name="Python") inside a loop cause extra queries even after prefetch_related("subjects")?`, a: `Prefetched data is cached only for .all(). Any new filter creates a new QuerySet that goes to the database. Filter in Python or use Prefetch with a filtered queryset instead.`, level: 'Hard' },
    { q: `How do you count the number of queries a block of code executes?`, a: `connection.queries with DEBUG=True (reset_queries first), django.test.utils.CaptureQueriesContext, TestCase.assertNumQueries, or Django Debug Toolbar.`, level: 'Medium' },
    { q: `How do you avoid N+1 in the Django admin change list?`, a: `Set list_select_related on the ModelAdmin (or override get_queryset with select_related/prefetch_related), and use annotate for counts.`, level: 'Medium' },
    { q: `What do only() and defer() do?`, a: `only("a", "b") loads only those columns; defer("bio") loads everything except the listed columns. Accessing a deferred field later triggers an extra query.`, level: 'Hard' },
    { q: `Is it better to use len(course.students.all()) or annotate(Count("students")) for a list of courses?`, a: `annotate(Count("students")) - it computes counts in a single GROUP BY query instead of loading all students or doing one COUNT per course.`, level: 'Medium' },
  ],
  practice: [
    { task: `Write an optimised query to print every StudentProfile with the student name and course code.`, hint: `select_related with a chain.`, solution: `for p in StudentProfile.objects.select_related("student__course"):\n    print(p.student.name, p.student.course.code, p.blood_group)   # 1 query` },
    { task: `For each subject print the names of its students using 2 queries in total.`, hint: `prefetch_related on the reverse M2M.`, solution: `for sub in Subject.objects.prefetch_related("students"):\n    print(sub.name, [s.name for s in sub.students.all()])` },
    { task: `Write a test that ensures the student list page uses at most 2 queries.`, hint: `assertNumQueries + self.client.get`, solution: `from django.test import TestCase\nfrom django.urls import reverse\n\nclass StudentListQueryTest(TestCase):\n    def test_query_count(self):\n        with self.assertNumQueries(2):\n            self.client.get(reverse("students:list"))` },
    { task: `For each course, prefetch only female students ordered by name into course.girls.`, hint: `Prefetch(..., to_attr="girls")`, solution: `courses = Course.objects.prefetch_related(Prefetch("students",\n    queryset=Student.objects.filter(gender="F").order_by("name"), to_attr="girls"))\nfor c in courses:\n    print(c.code, [s.name for s in c.girls])` },
  ],
  quiz: [
    { question: `Which method uses a SQL JOIN?`, options: [`prefetch_related`, `select_related`, `annotate`, `values`], answer: 1, explanation: `select_related adds a JOIN to the same query.` },
    { question: `For Student.subjects (ManyToMany) you should use:`, options: [`prefetch_related`, `select_related`, `only`, `distinct`], answer: 0, explanation: `Many-valued relations need prefetch_related.` },
    { question: `With 50 students and no optimisation, printing s.course.code runs how many queries?`, options: [`1`, `2`, `50`, `51`], answer: 3, explanation: `1 for students + 50 for courses = N+1 = 51.` },
    { question: `Which ModelAdmin option avoids N+1 for FK columns?`, options: [`list_filter`, `search_fields`, `list_select_related`, `raw_id_fields`], answer: 2, explanation: `list_select_related applies select_related to the change list queryset.` },
    { question: `prefetch_related("subjects") results are reused by:`, options: [`s.subjects.filter(...)`, `s.subjects.exclude(...)`, `s.subjects.order_by(...)`, `s.subjects.all()`], answer: 3, explanation: `Only .all() uses the prefetch cache; other methods create new queries.` },
  ],
};
