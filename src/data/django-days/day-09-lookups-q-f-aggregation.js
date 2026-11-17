export default {
  id: 'day-09-lookups-q-f-aggregation',
  title: 'Field Lookups, Q and F Objects, Aggregation and Annotation',
  module: 'Module 2: Models & Database',
  day: 9,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Write powerful queries for the Student Portal: field lookups (gte, range, icontains, in, year, isnull), complex OR/NOT conditions with Q objects, database-side arithmetic and field comparisons with F expressions, and reports with aggregate(), annotate(), values() grouping and Case/When.`,
  objectives: [
    `Use double-underscore field lookups for comparisons, text search, lists, ranges, dates and NULLs`,
    `Combine conditions with Q objects using | (OR), & (AND) and ~ (NOT)`,
    `Use F expressions to update and compare fields inside the database without race conditions`,
    `Compute summaries with aggregate() (Count, Sum, Avg, Max, Min)`,
    `Build per-group reports with values().annotate() and add computed columns with Case/When`,
  ],
  theory: [
    {
      heading: `Field lookups (field__lookup=value)`,
      content: `A lookup is written as fieldname, two underscores, lookup name. If you do not write a lookup, "exact" is used. Lookups translate into SQL WHERE conditions.`,
      points: [
        `exact / iexact: name__iexact="asha verma" (case-insensitive equal)`,
        `gt, gte, lt, lte: marks__gte=75 -> marks >= 75`,
        `range: marks__range=(50, 80) -> BETWEEN 50 AND 80 (inclusive)`,
        `contains / icontains: name__icontains="ar" -> LIKE '%ar%'`,
        `startswith / istartswith / endswith / iendswith: email__endswith="@college.in"`,
        `in: course__in=["BSc", "BCom"] -> IN (...)`,
        `isnull: date_of_birth__isnull=True -> IS NULL`,
        `Date parts: date_of_birth__year=2004, created_at__month=6, created_at__date=date.today(), __week_day`,
        `regex / iregex: roll_no__regex=r"^S1[0-9]{2}$"`,
        `Across relations (Day 10): course__name__icontains="computer"`,
      ],
      tip: `Multiple keyword arguments in one filter() are joined with AND: filter(course="BCA", marks__gte=60).`,
    },
    {
      heading: `Q objects: OR, AND, NOT`,
      content: `Keyword arguments can only express AND. For OR or NOT, wrap conditions in Q() and combine them with operators. Q objects must come BEFORE keyword arguments in filter().`,
      syntax: `from django.db.models import Q

Student.objects.filter(Q(course="BCom") | Q(marks__gte=90))      # OR
Student.objects.filter(Q(course="BCA") & ~Q(gender="F"))         # AND NOT
Student.objects.filter(Q(course="BCA") | Q(course="BSc"), gender="F")  # (A OR B) AND gender

# Building a search dynamically
query = Q()
for word in "ravi rao".split():
    query |= Q(name__icontains=word)
Student.objects.filter(query)`,
    },
    {
      heading: `F expressions: refer to a field's value in the database`,
      content: `F("marks") means "the current value of the marks column". Use it to (1) update a field relative to itself in a single SQL statement - safe even if two users click at the same time (no race condition), and (2) compare two fields of the same row.`,
      syntax: `from django.db.models import F

Student.objects.filter(course="BCA").update(marks=F("marks") + 5)   # grace marks
Student.objects.filter(fee_paid__gt=F("marks") * 500)                # compare columns

s = Student.objects.get(roll_no="S101")
s.marks = F("marks") + 1
s.save()
s.refresh_from_db()        # reload, otherwise s.marks is still an F() expression`,
      tip: `Without F: s.marks = s.marks + 5; s.save() reads the value into Python first - if two requests do this at the same time, one update is lost.`,
    },
    {
      heading: `aggregate(): one summary for the whole QuerySet`,
      content: `aggregate() computes values over all rows and returns a plain dictionary (not a QuerySet). Default keys are field__function (marks__avg); give your own names with keyword arguments.`,
      syntax: `from django.db.models import Count, Sum, Avg, Max, Min

Student.objects.aggregate(Avg("marks"))                 # {'marks__avg': 70.1}
Student.objects.aggregate(total=Count("id"), top=Max("marks"), fees=Sum("fee_paid"))
Student.objects.filter(course="BCA").aggregate(avg=Avg("marks"))`,
    },
    {
      heading: `annotate(): a value per row or per group`,
      content: `annotate() adds a computed field to every object in the QuerySet. Combined with values() BEFORE annotate(), it becomes SQL GROUP BY - one row per group. Filtering after annotate() on the annotated value becomes HAVING.`,
      syntax: `# GROUP BY course
Student.objects.values("course").annotate(students=Count("id"), avg=Avg("marks"))

# HAVING COUNT(id) >= 2
Student.objects.values("course").annotate(n=Count("id")).filter(n__gte=2)

# Computed column per student
from django.db.models import Case, When, Value, CharField
Student.objects.annotate(grade=Case(
    When(marks__gte=85, then=Value("A")),
    When(marks__gte=60, then=Value("B")),
    When(marks__gte=40, then=Value("C")),
    default=Value("F"),
    output_field=CharField(),
))`,
      points: [
        `aggregate() = SELECT AVG(marks) FROM ... -> dict`,
        `values("course").annotate(...) = SELECT course, COUNT(*) ... GROUP BY course -> QuerySet of dicts`,
        `Model.objects.annotate(...) without values() = extra attribute on each object`,
        `Order of values() and annotate() matters: values first = group; annotate first = per object.`,
      ],
    },
  ],
  examples: [
    {
      title: `Field lookups and Q objects on Student data`,
      scenario: `The exam cell asks for several lists. Answer each with one ORM query. Data: 6 students (Asha 92 BCA, Ravi 76 BSc, Meena 35 BCA, Kiran 81 BCom, Priya 64 BSc, Arjun 58 BCA).`,
      steps: [
        `Load the data in python manage.py shell (bulk_create from Day 8 with full names, emails and dates of birth).`,
        `Run each query below in the shell (VS Code terminal or PyCharm Django Console).`,
        `Compare your output with the result.`,
      ],
      code: `>>> from django.db.models import Q
>>> from students.models import Student
>>> names = lambda qs: list(qs.values_list("name", flat=True))
>>> names(Student.objects.filter(marks__gte=75))
>>> names(Student.objects.filter(marks__range=(50, 80)))
>>> names(Student.objects.filter(name__icontains="ar"))
>>> names(Student.objects.filter(name__startswith="A"))
>>> names(Student.objects.filter(email__endswith="@college.in"))
>>> names(Student.objects.filter(course__in=["BSc", "BCom"]))
>>> names(Student.objects.filter(date_of_birth__year=2004))
>>> names(Student.objects.filter(date_of_birth__isnull=True))
>>> names(Student.objects.filter(Q(course="BCom") | Q(marks__gte=90)))
>>> names(Student.objects.filter(Q(course="BCA") & ~Q(gender="F")))
>>> names(Student.objects.filter(Q(course="BCA") | Q(course="BSc"), gender="F"))`,
      result: `['Asha Verma', 'Ravi Kumar', 'Kiran Rao']
['Ravi Kumar', 'Priya Nair', 'Arjun Das']
['Ravi Kumar', 'Arjun Das']
['Asha Verma', 'Arjun Das']
['Asha Verma', 'Meena Iyer', 'Priya Nair']
['Ravi Kumar', 'Kiran Rao', 'Priya Nair']
['Asha Verma', 'Kiran Rao', 'Priya Nair']
[]
['Asha Verma', 'Kiran Rao']
['Arjun Das']
['Asha Verma', 'Meena Iyer', 'Priya Nair']`,
      explanation: `icontains matched "Ravi Kumar" and "Arjun Das" (case-insensitive "ar"). range is inclusive. The last query is (BCA OR BSc) AND gender F. On SQLite, contains is case-insensitive for ASCII; on MySQL the default collation (utf8mb4_unicode_ci) makes most comparisons case-insensitive too - use icontains for clear intent.`,
    },
    {
      title: `F expressions, aggregate and annotate - a marks report`,
      scenario: `Give 5 grace marks to all BCA students, then produce college-wide and course-wise statistics and grades.`,
      steps: [
        `Continue in the same shell session.`,
        `Run the statements in order.`,
        `On MySQL, Decimal sums show two decimal places, e.g. Decimal('210000.00').`,
      ],
      code: `>>> from django.db.models import F, Count, Avg, Max, Min, Sum, Case, When, Value, CharField
>>> Student.objects.filter(course="BCA").update(marks=F("marks") + 5)
>>> list(Student.objects.filter(course="BCA").values_list("name", "marks"))
>>> Student.objects.aggregate(total=Count("id"), avg_marks=Avg("marks"),
...                           top=Max("marks"), low=Min("marks"), fees=Sum("fee_paid"))
>>> Student.objects.filter(course="BCA").aggregate(Avg("marks"))
>>> for row in (Student.objects.values("course")
...             .annotate(students=Count("id"), avg=Avg("marks"), fees=Sum("fee_paid"))
...             .order_by("course")):
...     print(row)
>>> list(Student.objects.values("course").annotate(n=Count("id"))
...      .filter(n__gte=2).values_list("course", "n").order_by("course"))
>>> graded = Student.objects.annotate(grade=Case(
...     When(marks__gte=85, then=Value("A")),
...     When(marks__gte=60, then=Value("B")),
...     When(marks__gte=40, then=Value("C")),
...     default=Value("F"), output_field=CharField())).order_by("-marks")
>>> for s in graded:
...     print(s.name, s.marks, s.grade)`,
      result: `3
[('Asha Verma', 97), ('Meena Iyer', 40), ('Arjun Das', 63)]
{'total': 6, 'avg_marks': 70.16666666666667, 'top': 97, 'low': 40, 'fees': Decimal('210000')}
{'marks__avg': 66.66666666666667}
{'course': 'BCA', 'students': 3, 'avg': 66.66666666666667, 'fees': Decimal('110000')}
{'course': 'BCom', 'students': 1, 'avg': 81.0, 'fees': Decimal('40000')}
{'course': 'BSc', 'students': 2, 'avg': 70.0, 'fees': Decimal('60000')}
[('BCA', 3), ('BSc', 2)]
Asha Verma 97 A
Kiran Rao 81 B
Ravi Kumar 76 B
Priya Nair 64 B
Arjun Das 63 B
Meena Iyer 40 C`,
      explanation: `update(marks=F("marks") + 5) ran one SQL UPDATE marks = marks + 5 for 3 rows. aggregate() returned a dict; values("course").annotate() produced GROUP BY course; filtering on n produced HAVING. Case/When computed a grade column in SQL - no Python loop needed.`,
    },
    {
      title: `Course statistics page in the Student Portal`,
      scenario: `Show a dashboard with total students, average marks, toppers and a per-course table.`,
      steps: [
        `Add the view dashboard to students/views.py and route path("dashboard/", views.dashboard, name="dashboard").`,
        `Create students/templates/students/dashboard.html.`,
        `Open /students/dashboard/ in the browser.`,
      ],
      code: `# students/views.py
from django.db.models import Avg, Count, Max, Q, Sum
from django.shortcuts import render
from .models import Student

def dashboard(request):
    summary = Student.objects.aggregate(
        total=Count("id"),
        avg_marks=Avg("marks"),
        passed=Count("id", filter=Q(marks__gte=40)),
        fees=Sum("fee_paid"),
    )
    by_course = (Student.objects.values("course")
                 .annotate(students=Count("id"), avg=Avg("marks"), top=Max("marks"))
                 .order_by("-avg"))
    toppers = Student.objects.order_by("-marks")[:3]
    return render(request, "students/dashboard.html",
                  {"summary": summary, "by_course": by_course, "toppers": toppers})

<!-- students/templates/students/dashboard.html -->
{% extends "base.html" %}
{% block content %}
<h1>Dashboard</h1>
<p>Total: {{ summary.total }} | Passed: {{ summary.passed }} |
   Average: {{ summary.avg_marks|floatformat:1 }} | Fees: Rs. {{ summary.fees }}</p>
<h2>Top 3</h2>
<ol>{% for s in toppers %}<li>{{ s.name }} - {{ s.marks }}</li>{% endfor %}</ol>
<h2>Course-wise</h2>
<table>
  <tr><th>Course</th><th>Students</th><th>Average</th><th>Highest</th></tr>
  {% for row in by_course %}
  <tr><td>{{ row.course }}</td><td>{{ row.students }}</td>
      <td>{{ row.avg|floatformat:1 }}</td><td>{{ row.top }}</td></tr>
  {% endfor %}
</table>
{% endblock %}`,
      result: `Dashboard
Total: 6 | Passed: 6 | Average: 70.2 | Fees: Rs. 210000
Top 3: 1. Asha Verma - 97  2. Kiran Rao - 81  3. Ravi Kumar - 76
Course-wise:
BCom  1  81.0  81
BSc   2  70.0  76
BCA   3  66.7  97`,
      explanation: `Count with filter=Q(...) counts conditionally (SQL COUNT ... FILTER / CASE). The whole page uses only 3 queries regardless of how many students exist, because aggregation happens inside the database.`,
    },
    {
      title: `Pure Python: how Q objects combine with &, | and ~`,
      scenario: `Re-create Q objects using operator overloading to understand how Django builds OR/AND/NOT conditions and parses lookups like marks__gte.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Add a "lte" lookup to LOOKUPS and try Q(marks__lte=76).`,
      ],
      code: `import operator

LOOKUPS = {
    "exact": operator.eq,
    "gte": operator.ge,
    "lt": operator.lt,
    "icontains": lambda a, b: b.lower() in a.lower(),
    "in": lambda a, b: a in b,
}


class Q:
    def __init__(self, **kw):
        self.test = lambda row: all(check(row, k, v) for k, v in kw.items())

    def __and__(self, other):
        q = Q()
        q.test = lambda row: self.test(row) and other.test(row)
        return q

    def __or__(self, other):
        q = Q()
        q.test = lambda row: self.test(row) or other.test(row)
        return q

    def __invert__(self):
        q = Q()
        q.test = lambda row: not self.test(row)
        return q


def check(row, key, value):
    field, _, lookup = key.partition("__")
    return LOOKUPS[lookup or "exact"](row[field], value)


STUDENTS = [
    {"name": "Asha Verma", "course": "BCA", "marks": 92},
    {"name": "Ravi Kumar", "course": "BSc", "marks": 76},
    {"name": "Meena Iyer", "course": "BCA", "marks": 35},
    {"name": "Kiran Rao", "course": "BCom", "marks": 81},
]

def filter_rows(q):
    return [s["name"] for s in STUDENTS if q.test(s)]

print(filter_rows(Q(marks__gte=80)))
print(filter_rows(Q(course="BCom") | Q(marks__gte=90)))
print(filter_rows(Q(course="BCA") & ~Q(marks__lt=40)))
print(filter_rows(Q(name__icontains="ra") & Q(course__in=["BSc", "BCom"])))`,
      python: {
        files: {
          'main.py': `import operator

LOOKUPS = {
    "exact": operator.eq,
    "gte": operator.ge,
    "lt": operator.lt,
    "icontains": lambda a, b: b.lower() in a.lower(),
    "in": lambda a, b: a in b,
}


class Q:
    def __init__(self, **kw):
        self.test = lambda row: all(check(row, k, v) for k, v in kw.items())

    def __and__(self, other):
        q = Q()
        q.test = lambda row: self.test(row) and other.test(row)
        return q

    def __or__(self, other):
        q = Q()
        q.test = lambda row: self.test(row) or other.test(row)
        return q

    def __invert__(self):
        q = Q()
        q.test = lambda row: not self.test(row)
        return q


def check(row, key, value):
    field, _, lookup = key.partition("__")
    return LOOKUPS[lookup or "exact"](row[field], value)


STUDENTS = [
    {"name": "Asha Verma", "course": "BCA", "marks": 92},
    {"name": "Ravi Kumar", "course": "BSc", "marks": 76},
    {"name": "Meena Iyer", "course": "BCA", "marks": 35},
    {"name": "Kiran Rao", "course": "BCom", "marks": 81},
]

def filter_rows(q):
    return [s["name"] for s in STUDENTS if q.test(s)]

print(filter_rows(Q(marks__gte=80)))
print(filter_rows(Q(course="BCom") | Q(marks__gte=90)))
print(filter_rows(Q(course="BCA") & ~Q(marks__lt=40)))
print(filter_rows(Q(name__icontains="ra") & Q(course__in=["BSc", "BCom"])))
`,
        },
      },
      result: `['Asha Verma', 'Kiran Rao']
['Asha Verma', 'Kiran Rao']
['Asha Verma']
['Ravi Kumar', 'Kiran Rao']`,
      explanation: `key.partition("__") splits "marks__gte" into field "marks" and lookup "gte" - the same idea Django uses. &, | and ~ call __and__, __or__ and __invert__, returning new Q objects that combine the tests; Django instead combines them into a SQL WHERE tree.`,
    },
  ],
  interview: [
    { q: `What are field lookups? Give five examples.`, a: `Keyword arguments of the form field__lookup used in filter/exclude/get to build WHERE clauses: exact, iexact, contains, icontains, gt, gte, lt, lte, in, range, startswith, endswith, isnull, year, month, regex.`, level: 'Easy' },
    { q: `How do you write an OR condition in the Django ORM?`, a: `With Q objects: Model.objects.filter(Q(a=1) | Q(b=2)). Alternatively qs1 | qs2 (union of two QuerySets of the same model).`, level: 'Easy' },
    { q: `What is an F expression and why is it useful?`, a: `F("field") references a column value inside the database. It allows atomic updates like F("marks") + 5 (no race condition, no extra SELECT) and comparisons between fields of the same row.`, level: 'Medium' },
    { q: `Difference between aggregate() and annotate()?`, a: `aggregate() returns a single dict summarising the whole QuerySet. annotate() returns a QuerySet with a computed value attached to each object or, after values(), to each group (GROUP BY).`, level: 'Medium' },
    { q: `How do you write GROUP BY and HAVING with the ORM?`, a: `values("course").annotate(n=Count("id")) gives GROUP BY course; adding .filter(n__gte=2) after annotate gives HAVING COUNT >= 2.`, level: 'Medium' },
    { q: `What is the output key of Student.objects.aggregate(Avg("marks"))?`, a: `marks__avg, e.g. {'marks__avg': 70.17}. Use aggregate(avg=Avg("marks")) to name it avg.`, level: 'Easy' },
    { q: `Why call refresh_from_db() after saving an F expression on an instance?`, a: `After save(), the attribute still holds the F() expression object, not the new number. refresh_from_db() reloads the actual value from the database.`, level: 'Hard' },
    { q: `What does ~Q(...) mean?`, a: `NOT - it negates the condition. filter(~Q(gender="F")) is equivalent to exclude(gender="F").`, level: 'Easy' },
    { q: `contains vs icontains on MySQL?`, a: `contains generates LIKE BINARY (case-sensitive) on MySQL; icontains generates LIKE with the column collation (usually case-insensitive). On SQLite, contains is case-insensitive for ASCII characters.`, level: 'Hard' },
    { q: `How can you count only passed students per course in one query?`, a: `values("course").annotate(passed=Count("id", filter=Q(marks__gte=40))) - conditional aggregation.`, level: 'Hard' },
    { q: `Is filter(a=1).filter(b=2) the same as filter(a=1, b=2)?`, a: `For simple fields yes (AND). For multi-valued relationships (ManyToMany/reverse FK) chained filters may join the related table twice and give different results.`, level: 'Hard' },
  ],
  practice: [
    { task: `Find students whose name contains "a" (any case) and who scored between 60 and 90.`, hint: `icontains + range`, solution: `Student.objects.filter(name__icontains="a", marks__range=(60, 90))` },
    { task: `Find students who are either from BCom or did not pay any fee.`, hint: `Q with |`, solution: `Student.objects.filter(Q(course="BCom") | Q(fee_paid=0))` },
    { task: `Reduce fee_paid by 10% for all BSc students in one query.`, hint: `F("fee_paid") * ...`, solution: `from decimal import Decimal\nStudent.objects.filter(course="BSc").update(fee_paid=F("fee_paid") * Decimal("0.9"))` },
    { task: `Print the number of male and female students.`, hint: `values("gender").annotate(Count)`, solution: `for row in Student.objects.values("gender").annotate(n=Count("id")).order_by("gender"):\n    print(row["gender"], row["n"])` },
    { task: `Get the course with the highest average marks.`, hint: `annotate avg, order_by("-avg").first()`, solution: `Student.objects.values("course").annotate(avg=Avg("marks")).order_by("-avg").first()` },
  ],
  quiz: [
    { question: `Which lookup gives marks BETWEEN 50 AND 80?`, options: [`marks__between=(50, 80)`, `marks__range=(50, 80)`, `marks__in=(50, 80)`, `marks__gte=50..80`], answer: 1, explanation: `range is inclusive BETWEEN.` },
    { question: `Which object is needed for OR conditions?`, options: [`F`, `Sum`, `Q`, `Value`], answer: 2, explanation: `Q objects support |, & and ~.` },
    { question: `aggregate() returns:`, options: [`A dictionary`, `A QuerySet`, `A list of objects`, `An integer`], answer: 0, explanation: `aggregate() returns a dict like {'marks__avg': 70.2}.` },
    { question: `update(marks=F("marks") + 5) executes:`, options: [`A SELECT then an UPDATE per row`, `Nothing until save()`, `A DELETE and INSERT`, `One SQL UPDATE marks = marks + 5`], answer: 3, explanation: `F expressions are evaluated inside the database in a single statement.` },
    { question: `To get one row per course with a count you write:`, options: [`annotate(Count("id")).values("course")`, `values("course").annotate(n=Count("id"))`, `aggregate(Count("course"))`, `group_by("course").count()`], answer: 1, explanation: `values() before annotate() groups by those fields.` },
  ],
};
