export default {
  id: 'day-04-urls-and-views',
  title: 'URLs and Views (function-based), HttpResponse, URL Parameters',
  module: 'Module 1: Django Basics',
  day: 4,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Write function-based views that return HttpResponse, JsonResponse and redirects, map them with path() and re_path(), capture URL parameters with path converters, read query strings, name URLs and reverse them, and handle 404 errors - all inside the Student Portal.`,
  objectives: [
    `Write function-based views and understand the HttpRequest object`,
    `Map URLs with path(), include() and named routes; reverse them with reverse() and {% url %}`,
    `Capture URL parameters with converters: int, str, slug, uuid, path`,
    `Read GET query parameters and handle different HTTP methods`,
    `Return HttpResponse, JsonResponse, redirect and Http404 correctly`,
  ],
  theory: [
    {
      heading: `What is a view?`,
      content: `A view is a Python callable that takes an HttpRequest object and returns an HttpResponse object. That is the only rule. Inside, you can do anything - read the database, call an API, compute marks - but you must return a response. A function-based view (FBV) is simply a def function; class-based views come on Day 16.`,
      syntax: `from django.http import HttpResponse

def home(request):                     # request = HttpRequest object
    return HttpResponse("Hello")       # must return an HttpResponse`,
      points: [
        `request.method - "GET", "POST", "PUT", "DELETE"...`,
        `request.GET - query string dictionary (?page=2&course=BCA)`,
        `request.POST - submitted form data`,
        `request.path - "/students/5/"`,
        `request.user - logged-in user (or AnonymousUser)`,
        `request.headers, request.COOKIES, request.session, request.FILES`,
      ],
    },
    {
      heading: `URL patterns with path()`,
      content: `path(route, view, kwargs=None, name=None) maps a URL route string to a view. Django checks urlpatterns from top to bottom and stops at the first match. Routes never start with a slash and usually end with one ("students/" not "/students").`,
      syntax: `from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("students/<int:student_id>/", views.student_detail, name="student_detail"),
]`,
      tip: `APPEND_SLASH=True (default) redirects /about to /about/ automatically if only "about/" exists. That is why we always end routes with a slash.`,
    },
    {
      heading: `Path converters (URL parameters)`,
      content: `Angle brackets capture part of the URL and pass it to the view as a keyword argument. The converter validates and converts the type.`,
      points: [
        `<int:id> - matches 0 or positive integers, passes an int: /students/5/`,
        `<str:name> - any non-empty text without "/" (default if no converter given)`,
        `<slug:slug> - letters, numbers, hyphens, underscores: /courses/python-full-stack/`,
        `<uuid:token> - a UUID like 075194d3-6885-417e-a8a8-6c931e272f00`,
        `<path:file_path> - like str but also matches "/": /files/2024/marks.pdf`,
        `re_path() with regular expressions for advanced cases: re_path(r"^year/(?P<year>[0-9]{4})/$", views.by_year)`,
      ],
      syntax: `def student_detail(request, student_id):    # parameter name = converter name
    return HttpResponse(f"Student #{student_id}")`,
    },
    {
      heading: `Query parameters (request.GET)`,
      content: `Values after ? in a URL are not part of the route. They are read from request.GET, a dictionary-like QueryDict. Use .get() with a default to avoid KeyError. Use URL parameters for identity (which student) and query parameters for filtering/sorting/searching (which students).`,
      syntax: `# /students/search/?q=asha&course=BCA
def search(request):
    q = request.GET.get("q", "")           # "asha"
    course = request.GET.get("course")     # "BCA" or None
    subjects = request.GET.getlist("sub")  # ?sub=math&sub=cs -> ["math", "cs"]`,
    },
    {
      heading: `Response types and redirects`,
      content: `HttpResponse returns text/HTML; JsonResponse converts a dict to JSON and sets Content-Type: application/json; redirect() returns a 302 to another URL or named route; raising Http404 returns a 404 page. Status codes can be set with status=.`,
      syntax: `from django.http import HttpResponse, JsonResponse, Http404, HttpResponseNotAllowed
from django.shortcuts import redirect
from django.urls import reverse

HttpResponse("Created", status=201)
JsonResponse({"name": "Asha", "marks": 88})
JsonResponse([1, 2, 3], safe=False)      # non-dict needs safe=False
redirect("students:list")                # by URL name
redirect("/students/")                   # by path
reverse("students:detail", args=[5])     # -> "/students/5/"
raise Http404("Student not found")`,
    },
    {
      heading: `Named URLs, namespaces and reverse()`,
      content: `Hard-coding "/students/5/" everywhere breaks when you change the URL. Instead give each pattern a name and reverse it. With app_name in the app urls.py the full name becomes "namespace:name".`,
      points: [
        `In Python: reverse("students:detail", kwargs={"student_id": 5})`,
        `In templates: <a href="{% url 'students:detail' student.id %}">View</a>`,
        `In redirects: redirect("students:detail", student_id=5)`,
        `Common mistake: NoReverseMatch - wrong name, missing namespace or missing/extra arguments.`,
      ],
    },
  ],
  examples: [
    {
      title: `Student Portal views with URL parameters`,
      scenario: `Build home, about, student list, student detail (by id), course page (by slug) and a JSON API view, using an in-memory list until we learn models.`,
      steps: [
        `Open the student_portal project in VS Code / PyCharm and activate the venv.`,
        `Replace students/views.py and students/urls.py with the code below.`,
        `Add the home route to student_portal/urls.py.`,
        `Run python manage.py runserver.`,
        `Visit /, /students/, /students/2/, /students/99/, /students/course/bca/, /students/api/2/.`,
      ],
      code: `# students/views.py
from django.http import HttpResponse, JsonResponse, Http404

STUDENTS = {
    1: {"name": "Asha", "course": "bca", "marks": 88},
    2: {"name": "Ravi", "course": "bsc-cs", "marks": 76},
    3: {"name": "Meena", "course": "bca", "marks": 92},
}

def home(request):
    return HttpResponse("<h1>Welcome to Student Portal</h1><a href='/students/'>Students</a>")

def student_list(request):
    items = "".join(
        f"<li><a href='/students/{sid}/'>{s['name']}</a></li>" for sid, s in STUDENTS.items()
    )
    return HttpResponse(f"<h2>All Students</h2><ul>{items}</ul>")

def student_detail(request, student_id):
    student = STUDENTS.get(student_id)
    if student is None:
        raise Http404("Student not found")
    return HttpResponse(f"<h2>{student['name']}</h2><p>Course: {student['course']} | Marks: {student['marks']}</p>")

def by_course(request, course_slug):
    names = [s["name"] for s in STUDENTS.values() if s["course"] == course_slug]
    return HttpResponse(f"{course_slug.upper()}: {', '.join(names) or 'No students'}")

def student_api(request, student_id):
    student = STUDENTS.get(student_id)
    if not student:
        return JsonResponse({"error": "not found"}, status=404)
    return JsonResponse({"id": student_id, **student})

# students/urls.py
from django.urls import path
from . import views

app_name = "students"
urlpatterns = [
    path("", views.student_list, name="list"),
    path("<int:student_id>/", views.student_detail, name="detail"),
    path("course/<slug:course_slug>/", views.by_course, name="by_course"),
    path("api/<int:student_id>/", views.student_api, name="api_detail"),
]

# student_portal/urls.py
from django.contrib import admin
from django.urls import path, include
from students import views as student_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", student_views.home, name="home"),
    path("students/", include("students.urls")),
]`,
      result: `/                      -> Welcome to Student Portal  [Students link]
/students/             -> All Students: Asha, Ravi, Meena (links)
/students/2/           -> Ravi  Course: bsc-cs | Marks: 76
/students/99/          -> 404 Page not found (Student not found)
/students/abc/         -> 404 (int converter does not match "abc")
/students/course/bca/  -> BCA: Asha, Meena
/students/api/2/       -> {"id": 2, "name": "Ravi", "course": "bsc-cs", "marks": 76}`,
      explanation: `<int:student_id> converts "2" to the integer 2 so the dictionary lookup works. A non-number never reaches the view because the converter fails to match. Http404 shows Django's 404 page (detailed in DEBUG mode). JsonResponse serialises the dict and sets the JSON content type.`,
    },
    {
      title: `Query-string search, HTTP methods and redirect`,
      scenario: `Add a search page that reads ?q= and ?min_marks=, a view that only allows GET, and an old URL that redirects to the new one using its name.`,
      steps: [
        `Add the three views to students/views.py (keep STUDENTS from Example 1).`,
        `Add the routes to students/urls.py (put "search/" ABOVE "<int:student_id>/" is not required, but keep specific routes first as a habit).`,
        `Visit /students/search/?q=a&min_marks=80 and /students/old-list/.`,
      ],
      code: `# students/views.py (add)
from django.shortcuts import redirect
from django.views.decorators.http import require_GET

@require_GET
def search(request):
    q = request.GET.get("q", "").lower()
    try:
        min_marks = int(request.GET.get("min_marks", 0))
    except ValueError:
        min_marks = 0
    found = [s["name"] for s in STUDENTS.values()
             if q in s["name"].lower() and s["marks"] >= min_marks]
    return HttpResponse(f"Search '{q}' (marks >= {min_marks}): {found}")

def old_list(request):
    return redirect("students:list")   # 302 to /students/

# students/urls.py (add)
    path("search/", views.search, name="search"),
    path("old-list/", views.old_list, name="old_list"),`,
      result: `/students/search/?q=a&min_marks=80 -> Search 'a' (marks >= 80): ['Asha', 'Meena']
/students/search/                  -> Search '' (marks >= 0): ['Asha', 'Ravi', 'Meena']
POST to /students/search/          -> 405 Method Not Allowed
/students/old-list/                -> 302 redirect, browser lands on /students/`,
      explanation: `request.GET.get() with defaults keeps the view safe when parameters are missing; converting with int() inside try/except prevents a crash on ?min_marks=abc. @require_GET returns 405 for other methods. redirect() accepts a URL name and reverses it for us.`,
    },
    {
      title: `Pure Python: how path converters match and convert`,
      scenario: `Rebuild a tiny version of Django's path() matching with regular expressions to understand converters like <int:id> and <slug:slug>.`,
      steps: [
        `Create main.py in VS Code or PyCharm.`,
        `Run python main.py.`,
        `Add your own pattern such as "marks/<int:year>/" and test it.`,
      ],
      code: `import re

CONVERTERS = {
    "int": (r"[0-9]+", int),
    "str": (r"[^/]+", str),
    "slug": (r"[-a-zA-Z0-9_]+", str),
}

def compile_route(route):
    pattern, casts = "^", {}
    for part in re.split(r"(<[^>]+>)", route):
        if part.startswith("<"):
            conv, name = part[1:-1].split(":")
            regex, cast = CONVERTERS[conv]
            pattern += f"(?P<{name}>{regex})"
            casts[name] = cast
        else:
            pattern += re.escape(part)
    return re.compile(pattern + "$"), casts

def student_detail(student_id):
    return f"detail of student {student_id} (type {type(student_id).__name__})"

def by_course(course_slug):
    return f"students in course {course_slug}"

urlpatterns = [
    ("students/<int:student_id>/", student_detail),
    ("students/course/<slug:course_slug>/", by_course),
]

def resolve(path):
    for route, view in urlpatterns:
        regex, casts = compile_route(route)
        m = regex.match(path)
        if m:
            kwargs = {k: casts[k](v) for k, v in m.groupdict().items()}
            return view(**kwargs)
    return "404 Not Found"

for p in ["students/7/", "students/abc/", "students/course/bca-2024/"]:
    print(p, "=>", resolve(p))`,
      python: {
        files: {
          'main.py': `import re

CONVERTERS = {
    "int": (r"[0-9]+", int),
    "str": (r"[^/]+", str),
    "slug": (r"[-a-zA-Z0-9_]+", str),
}

def compile_route(route):
    pattern, casts = "^", {}
    for part in re.split(r"(<[^>]+>)", route):
        if part.startswith("<"):
            conv, name = part[1:-1].split(":")
            regex, cast = CONVERTERS[conv]
            pattern += f"(?P<{name}>{regex})"
            casts[name] = cast
        else:
            pattern += re.escape(part)
    return re.compile(pattern + "$"), casts

def student_detail(student_id):
    return f"detail of student {student_id} (type {type(student_id).__name__})"

def by_course(course_slug):
    return f"students in course {course_slug}"

urlpatterns = [
    ("students/<int:student_id>/", student_detail),
    ("students/course/<slug:course_slug>/", by_course),
]

def resolve(path):
    for route, view in urlpatterns:
        regex, casts = compile_route(route)
        m = regex.match(path)
        if m:
            kwargs = {k: casts[k](v) for k, v in m.groupdict().items()}
            return view(**kwargs)
    return "404 Not Found"

for p in ["students/7/", "students/abc/", "students/course/bca-2024/"]:
    print(p, "=>", resolve(p))
`,
        },
      },
      result: `students/7/ => detail of student 7 (type int)
students/abc/ => 404 Not Found
students/course/bca-2024/ => students in course bca-2024`,
      explanation: `Each converter is a regex plus a conversion function. "7" matches [0-9]+ and is converted to int 7, so the view receives an integer. "abc" fails the int regex, so no view is called and we get 404 - exactly Django's behaviour.`,
    },
  ],
  interview: [
    { q: `What is a function-based view?`, a: `A plain Python function that accepts an HttpRequest (and optional URL kwargs) and returns an HttpResponse.`, level: 'Easy' },
    { q: `Difference between path() and re_path()?`, a: `path() uses simple route syntax with converters like <int:id>. re_path() uses full regular expressions with named groups for complex patterns.`, level: 'Easy' },
    { q: `List the built-in path converters.`, a: `str (default), int, slug, uuid and path. You can also register custom converters with register_converter().`, level: 'Medium' },
    { q: `URL parameters vs query parameters?`, a: `URL parameters are part of the route and identify a resource (/students/5/), received as view arguments. Query parameters come after ? for filtering/searching/paging (?page=2), read from request.GET.`, level: 'Easy' },
    { q: `What is reverse() and why use named URLs?`, a: `reverse() builds a URL from its name and arguments. Named URLs avoid hard-coded paths, so changing a route in urls.py automatically updates every link and redirect.`, level: 'Medium' },
    { q: `What causes NoReverseMatch?`, a: `Reversing a URL name that does not exist, forgetting the namespace ("students:detail"), or passing wrong/missing arguments for the pattern.`, level: 'Medium' },
    { q: `When must you use safe=False with JsonResponse?`, a: `When serialising anything other than a dict, e.g. a list. Django requires it as a reminder of an old JSON array security issue.`, level: 'Medium' },
    { q: `How do you return a 404 from a view?`, a: `raise Http404("message"), or use the shortcut get_object_or_404(Model, pk=id), which raises Http404 automatically when the object does not exist.`, level: 'Easy' },
    { q: `What is the output for /students/abc/ when the pattern is "students/<int:id>/"?`, a: `404 Page not found. The int converter does not match "abc", so the view is never called (no ValueError).`, level: 'Medium' },
    { q: `How do you restrict a view to GET or POST only?`, a: `Use decorators from django.views.decorators.http: @require_GET, @require_POST or @require_http_methods(["GET", "POST"]). Other methods get 405 Method Not Allowed.`, level: 'Medium' },
    { q: `What is APPEND_SLASH?`, a: `A setting (True by default) used with CommonMiddleware: if a URL without a trailing slash does not match but the slash version does, Django redirects to the slash version.`, level: 'Hard' },
  ],
  practice: [
    { task: `Add a URL /students/<int:student_id>/marks/ that returns "Marks of <name>: <marks>" or 404.`, hint: `Reuse STUDENTS.get() and Http404.`, solution: `def student_marks(request, student_id):\n    s = STUDENTS.get(student_id)\n    if not s:\n        raise Http404("Student not found")\n    return HttpResponse(f"Marks of {s['name']}: {s['marks']}")\n\npath("<int:student_id>/marks/", views.student_marks, name="marks"),` },
    { task: `Create /students/top/?n=2 that returns the top-n students by marks as JSON.`, hint: `sorted(..., key=..., reverse=True)[:n], JsonResponse with safe=False.`, solution: `def top_students(request):\n    n = int(request.GET.get("n", 3))\n    data = sorted(STUDENTS.values(), key=lambda s: s["marks"], reverse=True)[:n]\n    return JsonResponse(data, safe=False)\n\npath("top/", views.top_students, name="top"),` },
    { task: `Use reverse() in a view to return the URL of student 3's detail page as text.`, hint: `from django.urls import reverse`, solution: `def link_demo(request):\n    url = reverse("students:detail", kwargs={"student_id": 3})\n    return HttpResponse(url)   # "/students/3/"` },
    { task: `Add a re_path for /students/year/2024/ that only accepts 4-digit years.`, hint: `(?P<year>[0-9]{4})`, solution: `from django.urls import re_path\nre_path(r"^year/(?P<year>[0-9]{4})/$", views.by_year, name="by_year"),\n\ndef by_year(request, year):\n    return HttpResponse(f"Batch {year}")   # year is a str with re_path` },
  ],
  quiz: [
    { question: `A view function must return:`, options: [`A string`, `A dict`, `An HttpResponse object`, `A template name`], answer: 2, explanation: `Returning anything other than an HttpResponse (or subclass) raises an error.` },
    { question: `Which converter accepts "python-full-stack"?`, options: [`int`, `slug`, `uuid`, `None of these`], answer: 1, explanation: `slug matches letters, digits, hyphens and underscores.` },
    { question: `How do you read ?page=3 in a view?`, options: [`request.GET.get("page")`, `request.POST["page"]`, `request.page`, `request.args.get("page")`], answer: 0, explanation: `Query parameters live in request.GET (request.args is Flask).` },
    { question: `In a template, which tag builds a URL from its name?`, options: [`{% link %}`, `{% href %}`, `{% path %}`, `{% url %}`], answer: 3, explanation: `{% url 'students:detail' student.id %} reverses the named route.` },
    { question: `What status code does redirect() return by default?`, options: [`200`, `302`, `301`, `404`], answer: 1, explanation: `redirect() returns a temporary 302; pass permanent=True for 301.` },
  ],
};
