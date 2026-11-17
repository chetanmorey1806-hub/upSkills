export default {
  id: 'day-05-templates-and-inheritance',
  title: 'Templates, Template Language (variables, tags, filters), Template Inheritance',
  module: 'Module 1: Django Basics',
  day: 5,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Move HTML out of Python into Django templates. Learn the Django Template Language (variables, tags, filters, comments), render() with a context, template inheritance with base.html and blocks, include, and auto-escaping - and give the Student Portal a real layout.`,
  objectives: [
    `Configure template folders and render templates with render() and a context dictionary`,
    `Use variables with dot lookup, and tags: if, for/empty, url, include, with, comment`,
    `Apply built-in filters such as upper, title, length, default, date, floatformat, truncatechars, pluralize`,
    `Build a base.html layout and extend it with {% extends %} and {% block %}`,
    `Explain auto-escaping and when (not) to use the safe filter`,
  ],
  theory: [
    {
      heading: `Why templates?`,
      content: `On Day 4 we built HTML inside Python strings - messy and unsafe. A template is a text/HTML file with placeholders. The view supplies data (the context), and the template engine fills the placeholders. Designers can edit HTML without touching Python; developers can change logic without breaking HTML. Analogy: a template is a wedding-card design with blanks; the context is the names and date you fill in.`,
      syntax: `from django.shortcuts import render

def student_list(request):
    context = {"students": students, "title": "All Students"}
    return render(request, "students/student_list.html", context)
# render() = load template + fill context + return HttpResponse`,
    },
    {
      heading: `Where templates live`,
      content: `Two places are searched (configured in TEMPLATES in settings.py): project-level folders listed in DIRS (we use BASE_DIR / "templates" for base.html and shared partials), and each app's templates/ folder when APP_DIRS=True. Inside an app always add an extra folder with the app name (students/templates/students/...) - this namespacing avoids clashes when two apps have a "list.html".`,
      syntax: `student_portal/
|-- templates/                    <- DIRS (project-wide)
|   |-- base.html
|   \`-- partials/
|       |-- navbar.html
|       \`-- footer.html
\`-- students/
    \`-- templates/
        \`-- students/             <- namespace folder
            |-- student_list.html
            \`-- student_detail.html`,
    },
    {
      heading: `Variables and dot lookup`,
      content: `{{ variable }} prints a value. The dot works for everything: dictionary key, attribute, list index, or a method with no arguments (called automatically, without parentheses). If a variable does not exist, Django prints an empty string instead of crashing (string_if_invalid).`,
      points: [
        `{{ student.name }} - dict key "name" OR attribute .name`,
        `{{ students.0 }} - first item of a list`,
        `{{ student.get_grade }} - calls the method get_grade() (no arguments allowed)`,
        `{{ request.user.username }} - available thanks to the request context processor`,
        `You cannot write Python expressions like {{ marks + 5 }} or call methods with arguments - keep logic in the view.`,
      ],
    },
    {
      heading: `Tags {% %}`,
      content: `Tags add logic: loops, conditions, URLs, inheritance and more.`,
      syntax: `{% if student.marks >= 90 %} A+ {% elif student.marks >= 60 %} Pass {% else %} Fail {% endif %}

{% for s in students %}
  {{ forloop.counter }}. {{ s.name }}       {# counter starts at 1, counter0 at 0 #}
  {% if forloop.last %}(last){% endif %}
{% empty %}
  No students found.
{% endfor %}

<a href="{% url 'students:detail' s.id %}">View</a>
{% include "partials/navbar.html" %}
{% with total=students|length %} Total: {{ total }} {% endwith %}
{% comment %} multi-line comment {% endcomment %}
{% csrf_token %}   {# inside every POST form (Day 14) #}
{% load static %}  {# Day 6 #}`,
      points: [
        `Operators allowed in {% if %}: ==, !=, <, >, <=, >=, in, not in, is, and, or, not.`,
        `forloop variables: counter, counter0, revcounter, first, last, parentloop.`,
        `{% cycle "odd" "even" %} alternates values - handy for table row colours.`,
      ],
    },
    {
      heading: `Filters |`,
      content: `Filters transform a variable for display, using a pipe. They can be chained and some take one argument after a colon.`,
      points: [
        `{{ name|upper }}, {{ name|lower }}, {{ name|title }}, {{ name|capfirst }}`,
        `{{ students|length }} - count`,
        `{{ phone|default:"Not given" }} - fallback for empty/False values`,
        `{{ joined|date:"d M Y" }} - 05 Aug 2024`,
        `{{ percentage|floatformat:2 }} - 87.50`,
        `{{ bio|truncatechars:30 }}, {{ bio|truncatewords:5 }}`,
        `{{ count }} student{{ count|pluralize }} - "1 student" / "3 students"`,
        `{{ list|join:", " }}, {{ text|linebreaks }}, {{ html|striptags }}, {{ value|add:5 }}`,
        `{{ html_content|safe }} - turn OFF escaping for trusted HTML only`,
      ],
    },
    {
      heading: `Template inheritance: extends and block`,
      content: `Almost every page shares a header, navbar and footer. Instead of copy-pasting, create base.html with {% block %} placeholders. Child templates start with {% extends "base.html" %} (must be the FIRST tag) and override only the blocks they need. {{ block.super }} keeps the parent's content and adds to it.`,
      syntax: `{# base.html #}
<title>{% block title %}Student Portal{% endblock %}</title>
<main>{% block content %}{% endblock %}</main>

{# students/student_list.html #}
{% extends "base.html" %}
{% block title %}Students | {{ block.super }}{% endblock %}
{% block content %}<h1>All Students</h1>{% endblock %}`,
      tip: `Anything in a child template outside a {% block %} is ignored. Common mistake: putting {% extends %} after some HTML or {% load %} - it must be first.`,
    },
    {
      heading: `Auto-escaping (XSS protection)`,
      content: `Django escapes HTML characters in every {{ variable }} automatically: < becomes &lt;, > becomes &gt;, quotes are escaped. If a student enters "<script>alert(1)</script>" as their name, it is shown as text, not executed. Only use |safe or {% autoescape off %} for content you fully trust (e.g. HTML you wrote yourself).`,
    },
  ],
  examples: [
    {
      title: `Student Portal layout with base.html, navbar include and child pages`,
      scenario: `Create a shared layout and convert the student list and detail pages to templates.`,
      steps: [
        `Make sure settings.py TEMPLATES has "DIRS": [BASE_DIR / "templates"] and "APP_DIRS": True (Day 3).`,
        `Create templates/base.html and templates/partials/navbar.html in the project root.`,
        `Create students/templates/students/student_list.html and student_detail.html (in PyCharm right-click > New > Directory, then New > HTML File; in VS Code use the New File icon and type the full path students/templates/students/student_list.html).`,
        `Update students/views.py to use render().`,
        `Run python manage.py runserver and visit /students/ and /students/1/.`,
      ],
      code: `<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{% block title %}Student Portal{% endblock %}</title>
</head>
<body>
  {% include "partials/navbar.html" %}
  <main style="padding:20px">
    {% block content %}{% endblock %}
  </main>
  <footer><small>&copy; 2026 ABC College</small></footer>
</body>
</html>

<!-- templates/partials/navbar.html -->
<nav>
  <a href="{% url 'home' %}">Home</a> |
  <a href="{% url 'students:list' %}">Students</a>
</nav>

<!-- students/templates/students/student_list.html -->
{% extends "base.html" %}
{% block title %}Students | {{ block.super }}{% endblock %}
{% block content %}
  <h1>{{ title }}</h1>
  <p>{{ students|length }} student{{ students|length|pluralize }}</p>
  <table border="1" cellpadding="6">
    <tr><th>#</th><th>Name</th><th>Course</th><th>Marks</th><th>Result</th></tr>
    {% for s in students %}
      <tr>
        <td>{{ forloop.counter }}</td>
        <td><a href="{% url 'students:detail' s.id %}">{{ s.name|title }}</a></td>
        <td>{{ s.course|upper }}</td>
        <td>{{ s.marks }}</td>
        <td>{% if s.marks >= 90 %}Distinction{% elif s.marks >= 40 %}Pass{% else %}Fail{% endif %}</td>
      </tr>
    {% empty %}
      <tr><td colspan="5">No students yet.</td></tr>
    {% endfor %}
  </table>
{% endblock %}

<!-- students/templates/students/student_detail.html -->
{% extends "base.html" %}
{% block title %}{{ student.name }} | Student Portal{% endblock %}
{% block content %}
  <h1>{{ student.name|title }}</h1>
  <p>Course: {{ student.course|upper }}</p>
  <p>Marks: {{ student.marks }}</p>
  <p>Phone: {{ student.phone|default:"Not provided" }}</p>
  <a href="{% url 'students:list' %}">&larr; Back</a>
{% endblock %}

# students/views.py
from django.http import Http404
from django.shortcuts import render

STUDENTS = [
    {"id": 1, "name": "asha verma", "course": "bca", "marks": 92, "phone": "98765 43210"},
    {"id": 2, "name": "ravi kumar", "course": "bsc-cs", "marks": 76},
    {"id": 3, "name": "meena iyer", "course": "bca", "marks": 35},
]

def home(request):
    return render(request, "home.html")   # create templates/home.html extending base.html

def student_list(request):
    return render(request, "students/student_list.html",
                  {"students": STUDENTS, "title": "All Students"})

def student_detail(request, student_id):
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if student is None:
        raise Http404("Student not found")
    return render(request, "students/student_detail.html", {"student": student})`,
      result: `/students/ shows the navbar, heading "All Students", "3 students" and a table:
#  Name        Course   Marks  Result
1  Asha Verma  BCA      92     Distinction
2  Ravi Kumar  BSC-CS   76     Pass
3  Meena Iyer  BCA      35     Fail

/students/2/ shows: Ravi Kumar, Course: BSC-CS, Marks: 76, Phone: Not provided`,
      explanation: `Both pages extend base.html, so the navbar and footer appear everywhere while each page fills only the content block. Filters (title, upper, pluralize, default) format data without touching the view. The {% url %} tag uses the named routes from Day 4.`,
    },
    {
      title: `Filters and forloop variables cheat-sheet page`,
      scenario: `Build a single demo page that shows the most-used filters with real values - a reference for later days.`,
      steps: [
        `Add the view filters_demo to students/views.py and route path("filters/", views.filters_demo).`,
        `Create students/templates/students/filters_demo.html.`,
        `Visit /students/filters/.`,
      ],
      code: `# students/views.py
from datetime import date

def filters_demo(request):
    context = {
        "name": "asha verma",
        "subjects": ["Python", "Django", "SQL"],
        "joined": date(2024, 8, 5),
        "percentage": 87.456,
        "bio": "Asha is a final-year BCA student who loves building web apps.",
        "empty_value": "",
        "bad_name": "<script>alert('hi')</script>",
    }
    return render(request, "students/filters_demo.html", context)

<!-- students/templates/students/filters_demo.html -->
{% extends "base.html" %}
{% block content %}
<ul>
  <li>upper: {{ name|upper }}</li>
  <li>title: {{ name|title }}</li>
  <li>length: {{ subjects|length }}</li>
  <li>join: {{ subjects|join:" / " }}</li>
  <li>first: {{ subjects|first }}</li>
  <li>date: {{ joined|date:"d M Y" }}</li>
  <li>floatformat: {{ percentage|floatformat:2 }}</li>
  <li>truncatewords: {{ bio|truncatewords:5 }}</li>
  <li>default: {{ empty_value|default:"N/A" }}</li>
  <li>escaped: {{ bad_name }}</li>
</ul>
{% for sub in subjects %}{{ forloop.counter }}:{{ sub }}{% if not forloop.last %}, {% endif %}{% endfor %}
{% endblock %}`,
      result: `upper: ASHA VERMA
title: Asha Verma
length: 3
join: Python / Django / SQL
first: Python
date: 05 Aug 2024
floatformat: 87.46
truncatewords: Asha is a final-year BCA …
default: N/A
escaped: <script>alert('hi')</script>   (shown as plain text, not executed)
1:Python, 2:Django, 3:SQL`,
      explanation: `Each filter only changes how the value is displayed; the context data is unchanged. The script tag is shown literally because auto-escaping converted it to &lt;script&gt;... in the HTML source. forloop.last avoids a trailing comma.`,
    },
    {
      title: `Pure Python: what auto-escaping and the title/pluralize filters do`,
      scenario: `Reproduce three filters and Django's auto-escaping with the standard library to understand what happens behind {{ }}.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Compare the escaped output with what you see in the browser's View Source.`,
      ],
      code: `import html

def title(value):
    return value.title()

def pluralize(count, suffix="s"):
    return "" if count == 1 else suffix

def render_var(value, safe=False):
    # Django escapes every {{ variable }} unless marked safe
    return str(value) if safe else html.escape(str(value))

name = "<b>asha</b>"
print("escaped :", render_var(name))
print("safe    :", render_var(name, safe=True))
print("title   :", title("ravi kumar"))
for n in (1, 3):
    print(f"{n} student{pluralize(n)}")`,
      python: {
        files: {
          'main.py': `import html

def title(value):
    return value.title()

def pluralize(count, suffix="s"):
    return "" if count == 1 else suffix

def render_var(value, safe=False):
    # Django escapes every {{ variable }} unless marked safe
    return str(value) if safe else html.escape(str(value))

name = "<b>asha</b>"
print("escaped :", render_var(name))
print("safe    :", render_var(name, safe=True))
print("title   :", title("ravi kumar"))
for n in (1, 3):
    print(f"{n} student{pluralize(n)}")
`,
        },
      },
      result: `escaped : &lt;b&gt;asha&lt;/b&gt;
safe    : <b>asha</b>
title   : Ravi Kumar
1 student
3 students`,
      explanation: `html.escape converts special characters to HTML entities - the browser then displays them as text instead of interpreting them as tags. Marking content safe skips this, which is why |safe on user input opens the door to XSS attacks.`,
    },
  ],
  interview: [
    { q: `What is the Django Template Language (DTL)?`, a: `Django's built-in templating system for generating HTML (or any text). It provides variables {{ }}, tags {% %}, filters | and comments {# #}, deliberately limiting logic so that business logic stays in views.`, level: 'Easy' },
    { q: `What does render() do?`, a: `render(request, template_name, context) loads the template, renders it with the context (plus context processors data) and returns an HttpResponse with the resulting HTML.`, level: 'Easy' },
    { q: `Explain template inheritance.`, a: `A base template defines the common layout with {% block %} placeholders. Child templates use {% extends "base.html" %} as the first tag and override specific blocks. {{ block.super }} includes the parent block's content.`, level: 'Easy' },
    { q: `Difference between {% include %} and {% extends %}?`, a: `extends makes the current template a child of a parent layout (one per template, must be first). include inserts another template's content at that spot (any number, e.g. navbar, footer, cards).`, level: 'Medium' },
    { q: `How does dot lookup work in templates?`, a: `For {{ a.b }} Django tries, in order: dictionary lookup a["b"], attribute lookup a.b, then list index a[b]. If the result is callable it is called with no arguments.`, level: 'Hard' },
    { q: `What is a template filter? Give examples.`, a: `A function applied with | to transform output: upper, lower, title, length, default, date, floatformat, truncatechars, join, pluralize, safe, linebreaks.`, level: 'Easy' },
    { q: `How does Django protect templates against XSS?`, a: `Auto-escaping: all variable output is HTML-escaped by default. It is turned off only with |safe, mark_safe() or {% autoescape off %}, which should be used only with trusted content.`, level: 'Medium' },
    { q: `What does {% empty %} do?`, a: `Inside a {% for %} loop, it renders its content when the iterable is empty or missing - avoiding a separate {% if %} check.`, level: 'Easy' },
    { q: `What is the output of {{ students|length }} when students is ["A", "B"] and of {{ missing_var }}?`, a: `2 and an empty string. Undefined variables render as "" by default (string_if_invalid).`, level: 'Medium' },
    { q: `Why namespace templates as app/templates/app/file.html?`, a: `Because Django merges all template folders into one search path. Without the extra folder, two apps with list.html would clash and the first app in INSTALLED_APPS would always win.`, level: 'Medium' },
    { q: `Can you call a method with arguments in a Django template?`, a: `No. Only zero-argument callables are called automatically. Compute such values in the view, a model method/property, or write a custom template tag/filter.`, level: 'Hard' },
  ],
  practice: [
    { task: `Create templates/home.html that extends base.html, shows "Welcome to Student Portal" and today's date with the date filter.`, hint: `Pass "today": date.today() from the view.`, solution: `{% extends "base.html" %}\n{% block content %}\n<h1>Welcome to Student Portal</h1>\n<p>Today: {{ today|date:"l, d F Y" }}</p>\n{% endblock %}\n\n# view\nfrom datetime import date\ndef home(request):\n    return render(request, "home.html", {"today": date.today()})` },
    { task: `Add a footer partial templates/partials/footer.html and include it in base.html.`, hint: `{% include %}`, solution: `<!-- partials/footer.html -->\n<footer><small>&copy; {% now "Y" %} ABC College Student Portal</small></footer>\n\n<!-- base.html, before </body> -->\n{% include "partials/footer.html" %}` },
    { task: `In student_list.html, colour Fail rows red using {% if %} and alternate row classes using {% cycle %}.`, hint: `class="{% cycle 'odd' 'even' %}"`, solution: `<tr class="{% cycle 'odd' 'even' %}" {% if s.marks < 40 %}style="color:red"{% endif %}>...</tr>` },
    { task: `Show "Topper: <name>" above the table using the first student after sorting by marks in the view.`, hint: `sorted(STUDENTS, key=..., reverse=True)[0]`, solution: `# view\ntopper = max(STUDENTS, key=lambda s: s["marks"])\ncontext["topper"] = topper\n# template\n<p>Topper: {{ topper.name|title }} ({{ topper.marks }})</p>` },
  ],
  quiz: [
    { question: `Which syntax prints a variable?`, options: [`{% name %}`, `{{ name }}`, `{# name #}`, `<%= name %>`], answer: 1, explanation: `Double curly braces output variables; {% %} is for tags, {# #} for comments.` },
    { question: `Where must {% extends %} appear?`, options: [`Anywhere`, `Inside a block`, `At the end`, `As the first template tag`], answer: 3, explanation: `extends must be the very first tag in the child template.` },
    { question: `{{ "ravi kumar"|title }} outputs:`, options: [`Ravi Kumar`, `RAVI KUMAR`, `Ravi kumar`, `ravi kumar`], answer: 0, explanation: `title capitalises the first letter of every word.` },
    { question: `Which filter disables auto-escaping?`, options: [`escape`, `raw`, `safe`, `striptags`], answer: 2, explanation: `|safe marks the string as safe HTML - use it only for trusted content.` },
    { question: `Inside {% for %}, forloop.counter starts at:`, options: [`0`, `1`, `-1`, `The list length`], answer: 1, explanation: `counter is 1-based; counter0 is 0-based.` },
  ],
};
