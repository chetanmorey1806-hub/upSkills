export default {
  lesson: 'day-04-urls-and-views',
  minutes: 30,
  intro: 'Practise path(), converters, named URLs, reverse(), request.GET, JsonResponse, redirect and Http404, and write the URL-converter matching in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'With `path(\'students/<slug:slug>/\', ...)`, which URL matches?',
      options: ['/students/Asha Patil/', '/students/asha-patil-2024/', '/students/asha/patil/', '/students/'],
      answer: 1,
      explain: 'The **slug** converter matches letters, digits, hyphens and underscores (`[-a-zA-Z0-9_]+`) - no spaces and no `/`. `<path:...>` would allow slashes, `<int:...>` only digits.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the view so it returns JSON `{"id": 7, "name": "Asha"}` with the right Content-Type:\n\n```\nfrom django.http import JsonResponse\n\ndef student_api(request, pk):\n    return ______\n```',
      accept: ["JsonResponse({'id': pk, 'name': 'Asha'})", 'JsonResponse({"id": pk, "name": "Asha"})', "JsonResponse({'id': 7, 'name': 'Asha'})", 'JsonResponse({"id": 7, "name": "Asha"})'],
      explain: '`JsonResponse(dict)` serialises the dict and sets `Content-Type: application/json`. To return a **list** you must pass `safe=False` - Django blocks top-level lists by default.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        "reverse('student-detail', args=[7]) builds the URL from the name instead of hard-coding it",
        "In templates the same is done with {% url 'student-detail' 7 %}",
        'request.GET.get("q") reads ?q=... from the query string',
        'raise Http404("Student not found") returns a 404 page',
        'redirect() can only take a full URL string, not a URL name',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Named URLs + `reverse()`/`{% url %}` keep links working when routes change. `request.GET` is a QueryDict of query parameters. `redirect()` accepts a URL, a **URL name** (with args) or a model with `get_absolute_url()`.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `from django.http import HttpResponse, JsonResponse, Http404
from django.shortcuts import redirect
from django.test import RequestFactory
from django.urls import path, reverse

STUDENTS = {1: 'Asha', 2: 'Ravi'}

def detail(request, pk):
    if pk not in STUDENTS:
        raise Http404('Student not found')
    return JsonResponse({'id': pk, 'name': STUDENTS[pk]})

def search(request):
    q = request.GET.get('q', '').lower()
    names = [n for n in STUDENTS.values() if q in n.lower()]
    return HttpResponse(', '.join(names) or 'No match')

def old_profile(request, pk):
    return redirect('student-detail', pk=pk)

urlpatterns = [
    path('students/<int:pk>/', detail, name='student-detail'),
    path('students/search/', search, name='student-search'),
    path('profile/<int:pk>/', old_profile),
]

rf = RequestFactory()
print(reverse('student-detail', kwargs={'pk': 2}))
print(detail(rf.get('/'), 1).content.decode())
print(search(rf.get('/students/search/?q=RA')).content.decode())
r = old_profile(rf.get('/'), 2)
print(r.status_code, r.url)`,
      expected: '/students/2/\n{"id": 1, "name": "Asha"}\nRavi\n302 /students/2/',
      explain: '`reverse` builds `/students/2/` from the name. `JsonResponse` outputs JSON text. The search lower-cases both sides so `RA` finds Ravi. `redirect(\'student-detail\', pk=2)` reverses the name and returns a **302** with `url` = the new location.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write `match_route(route, path)` for Django-style routes with converters `<int:x>`, `<str:x>` (default), `<slug:x>`. Both use a trailing slash, e.g. `route=\'students/<int:pk>/marks/\'`, `path=\'students/7/marks/\'`. Return a dict of captured values (int converted) or `None`:\n- `int`: only digits\n- `str` (or no converter): any non-empty text without `/`\n- `slug`: only letters, digits, `-` and `_`',
      example: { title: 'checking characters', code: "import re\nprint(bool(re.fullmatch(r'[-a-zA-Z0-9_]+', 'asha-patil_1')))   # True" },
      starter: `import re

def match_route(route, path):
    # TODO
    return None
`,
      solution: `import re

PATTERNS = {'int': r'[0-9]+', 'str': r'[^/]+', 'slug': r'[-a-zA-Z0-9_]+'}

def match_route(route, path):
    r_parts = route.strip('/').split('/')
    p_parts = path.strip('/').split('/')
    if len(r_parts) != len(p_parts):
        return None
    values = {}
    for r, p in zip(r_parts, p_parts):
        if r.startswith('<') and r.endswith('>'):
            inner = r[1:-1]
            conv, name = inner.split(':') if ':' in inner else ('str', inner)
            if not re.fullmatch(PATTERNS[conv], p):
                return None
            values[name] = int(p) if conv == 'int' else p
        elif r != p:
            return None
    return values
`,
      tests: [
        { call: "match_route('students/<int:pk>/marks/', 'students/7/marks/')", expect: { pk: 7 } },
        { call: "match_route('students/<int:pk>/', 'students/seven/')", expect: null },
        { call: "match_route('courses/<slug:slug>/', 'courses/python-full-stack/')", expect: { slug: 'python-full-stack' } },
        { call: "match_route('courses/<slug:slug>/', 'courses/python full stack/')", expect: null },
        { call: "match_route('hello/<name>/', 'hello/Asha/')", expect: { name: 'Asha' } },
        { call: "match_route('<str:city>/colleges/<int:id>/', 'pune/colleges/12/')", expect: { city: 'pune', id: 12 } },
        { call: "match_route('about/', 'contact/')", expect: null },
      ],
      explain: 'Django compiles each `path()` into a regex in which every converter has its own pattern; a non-matching part means "try the next pattern", and if none matches → 404. Matched values are converted (`int`) before being passed to the view as keyword arguments.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `build_query(base, **params)` that builds a URL with a query string like `reverse(...) + \'?\' + urlencode(...)`: skip params whose value is `None` or `\'\'`, and use `urllib.parse.urlencode` so spaces and special characters are encoded. No params left → just `base`.',
      example: { title: 'urlencode', code: "from urllib.parse import urlencode\nprint(urlencode({'q': 'asha patil', 'page': 2}))   # q=asha+patil&page=2" },
      starter: `from urllib.parse import urlencode

def build_query(base, **params):
    # TODO
    return base
`,
      solution: `from urllib.parse import urlencode

def build_query(base, **params):
    clean = {k: v for k, v in params.items() if v not in (None, '')}
    if not clean:
        return base
    return base + '?' + urlencode(clean)
`,
      tests: [
        { call: "build_query('/students/search/', q='asha patil', page=2)", expect: '/students/search/?q=asha+patil&page=2' },
        { call: "build_query('/students/', city=None, q='')", expect: '/students/' },
        { call: "build_query('/students/', course='B.Sc & IT')", expect: '/students/?course=B.Sc+%26+IT' },
      ],
      explain: 'Never glue query strings by hand: an `&` inside a value (`B.Sc & IT`) would start a new parameter. `urlencode` escapes it as `%26`. Inside the view `request.GET.get(\'course\')` gives back the original text.',
    },
  ],
};
