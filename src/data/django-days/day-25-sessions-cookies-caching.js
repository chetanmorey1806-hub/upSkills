export default {
  id: 'day-25-sessions-cookies-caching',
  title: 'Sessions, Cookies and Caching',
  module: 'Module 5: Advanced Django',
  day: 25,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Store per-visitor data with cookies and sessions (recently viewed students, theme preference) and make the Student Portal fast with Django\'s cache framework: per-view, template fragment and low-level caching with Redis or local memory, plus cache invalidation.',
  objectives: [
    'Differentiate cookies and sessions and know where each stores data',
    'Set, read and delete cookies (including signed cookies) securely',
    'Use request.session and configure session engines and expiry',
    'Configure CACHES (LocMem, Redis, database, file) and use cache_page, {% cache %} and the low-level API',
    'Invalidate cached data correctly when models change',
  ],
  theory: [
    {
      heading: 'Cookies',
      content: 'HTTP is stateless: the server forgets you after each request. A cookie is a small piece of text (max about 4 KB) the server asks the browser to store and send back on every request to that site. Like a token at a cloakroom: you keep the token, and you show it each time. Cookies live in the BROWSER, so users can read and change them. Never store secrets or trusted data in plain cookies.',
      syntax: `response.set_cookie("theme", "dark", max_age=60*60*24*30, httponly=True, samesite="Lax", secure=True)
request.COOKIES.get("theme", "light")
response.delete_cookie("theme")

# tamper-proof cookie signed with SECRET_KEY
response.set_signed_cookie("roll", "STU101", salt="portal")
request.get_signed_cookie("roll", default=None, salt="portal")`,
    },
    {
      heading: 'Sessions',
      content: 'A session keeps data on the SERVER and gives the browser only a random session id in the sessionid cookie. request.session works like a dictionary. Django\'s login system itself uses the session. Data must be JSON serializable (strings, numbers, lists, dicts).',
      points: [
        'Engines (SESSION_ENGINE): db (default), cache, cached_db, file, signed_cookies',
        'SESSION_COOKIE_AGE (default 2 weeks), SESSION_EXPIRE_AT_BROWSER_CLOSE',
        'request.session.set_expiry(300) -> expire after 5 minutes of inactivity',
        'Modifying a nested list does not mark the session changed: set request.session.modified = True',
        'python manage.py clearsessions removes expired rows from the db engine',
      ],
    },
    {
      heading: 'Why caching?',
      content: 'Caching stores the result of expensive work (database queries, rendered HTML) so the next request can reuse it. It is like keeping a printed copy of the timetable on the notice board instead of asking the office every time. A cache hit is fast; a cache miss does the work and stores the result.',
      syntax: `# settings.py (development: in-memory per process)
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# production: Redis (built in since Django 4.0)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "TIMEOUT": 300,
        "KEY_PREFIX": "portal",
    }
}`,
      tip: 'LocMemCache is per process: with 4 Gunicorn workers you get 4 separate caches. Use Redis or Memcached in production.',
    },
    {
      heading: 'Levels of caching',
      content: 'Django offers caching at several levels. Choose the smallest one that solves the problem.',
      points: [
        'Per-site: UpdateCacheMiddleware + FetchFromCacheMiddleware (rarely used for logged-in sites)',
        'Per-view: @cache_page(60 * 15) or cache_page in urls.py',
        'Template fragment: {% load cache %}{% cache 600 sidebar %}...{% endcache %}',
        'Low-level API: cache.get, cache.set, cache.get_or_set, cache.delete, cache.incr, cache.get_many',
        '@vary_on_cookie / vary_on_headers so different users do not see each other\'s pages',
      ],
    },
    {
      heading: 'Cache invalidation',
      content: '"There are only two hard things in computer science: cache invalidation and naming things." When data changes, cached copies become stale. Strategies: short timeouts, delete the key when the model is saved (signals), or version keys (include updated_at or a version number in the key).',
      tip: 'Never cache pages that show private data per user with cache_page unless you vary on the session cookie. A common mistake is caching a logged-in dashboard and showing it to the next user.',
    },
  ],
  examples: [
    {
      title: 'Cookies: remember theme and signed last-visit',
      scenario: 'Students choose a light or dark theme; the portal also remembers their last visit time in a tamper-proof cookie.',
      steps: [
        'Open students/views.py in VS Code or PyCharm',
        'Write set_theme and home views below',
        'Add URLs and a theme switch link in base.html',
        'Open DevTools > Application > Cookies to see theme and last_visit',
      ],
      code: `# students/views.py
from datetime import datetime
from django.core import signing
from django.shortcuts import redirect, render
from django.utils.http import url_has_allowed_host_and_scheme

ALLOWED_THEMES = {"light", "dark"}


def set_theme(request, theme):
    if theme not in ALLOWED_THEMES:
        theme = "light"
    next_url = request.GET.get("next", "/")
    if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        next_url = "/"
    response = redirect(next_url)
    response.set_cookie("theme", theme, max_age=60 * 60 * 24 * 365, samesite="Lax")
    return response


def home(request):
    theme = request.COOKIES.get("theme", "light")
    try:
        last_visit = request.get_signed_cookie("last_visit", salt="portal-visit")
    except (KeyError, signing.BadSignature):
        last_visit = None
    response = render(request, "students/home.html", {"theme": theme, "last_visit": last_visit})
    response.set_signed_cookie("last_visit", datetime.now().strftime("%d %b %Y %H:%M"),
                               salt="portal-visit", max_age=60 * 60 * 24 * 30, httponly=True)
    return response


# students/urls.py
path("theme/<str:theme>/", views.set_theme, name="set_theme"),

<!-- templates/base.html -->
<body class="theme-{{ request.COOKIES.theme|default:'light' }}">
  <a href="{% url 'students:set_theme' 'dark' %}?next={{ request.path }}">Dark</a>
  <a href="{% url 'students:set_theme' 'light' %}?next={{ request.path }}">Light</a>
  {% if last_visit %}<small>Last visit: {{ last_visit }}</small>{% endif %}`,
      result: 'Clicking Dark sets cookie theme=dark and the page reloads with class "theme-dark". The last_visit cookie value looks like "17 Nov 2026 10:05:Ab3x...signature"; if a user edits it, BadSignature is caught and last_visit is None.',
      explanation: 'Plain cookies are fine for harmless preferences. Signed cookies detect tampering (but are still readable). The next URL is validated to prevent open redirects.',
    },
    {
      title: 'Sessions: recently viewed students and a multi-step form',
      scenario: 'Show the last 5 students a staff member viewed, and keep data between steps of an admission form.',
      steps: [
        'Make sure django.contrib.sessions and SessionMiddleware are enabled (default)',
        'Update StudentDetailView.get() to store ids in request.session',
        'Read them in the home view',
        'Create the two-step admission views',
        'Optional: switch SESSION_ENGINE to cached_db for speed',
      ],
      code: `# students/views.py
class StudentDetailView(LoginRequiredMixin, DetailView):
    model = Student

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        recent = request.session.get("recent_students", [])
        if self.object.pk in recent:
            recent.remove(self.object.pk)
        recent.insert(0, self.object.pk)
        request.session["recent_students"] = recent[:5]      # reassign -> session marked modified
        return response


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = "students/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        ids = self.request.session.get("recent_students", [])
        students = Student.objects.in_bulk(ids)
        context["recent"] = [students[i] for i in ids if i in students]
        return context


# Multi-step admission form
def admission_step1(request):
    if request.method == "POST":
        request.session["admission"] = {"name": request.POST["name"], "email": request.POST["email"]}
        return redirect("students:admission_step2")
    return render(request, "students/admission_step1.html")


def admission_step2(request):
    data = request.session.get("admission")
    if not data:
        return redirect("students:admission_step1")
    if request.method == "POST":
        Student.objects.create(name=data["name"], email=data["email"],
                               roll_no=request.POST["roll_no"], course_id=request.POST["course"])
        del request.session["admission"]
        messages.success(request, "Admission completed.")
        return redirect("students:list")
    return render(request, "students/admission_step2.html", {"data": data, "courses": Course.objects.all()})


# portal/settings.py
SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_COOKIE_AGE = 60 * 60 * 8          # 8 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"`,
      result: 'After viewing students 3, 1, 4 the home page shows "Recently viewed: Kiran, Asha, Ravi". Admission data survives between step 1 and step 2 and is removed after saving.',
      explanation: 'The browser only holds a random sessionid; the actual list is stored on the server. Reassigning the key ensures Django saves the change.',
    },
    {
      title: 'Caching: per-view, template fragment and low-level with invalidation',
      scenario: 'The public course catalogue and the "top scorers" widget are slow. Cache them and clear the cache when results change.',
      steps: [
        'Install Redis (or use Docker: docker run -p 6379:6379 redis:7) and pip install redis',
        'Configure CACHES in settings.py (LocMem in development is fine)',
        'Add @cache_page to the course catalogue view',
        'Cache the top scorers query with cache.get_or_set',
        'Add a signal that deletes the key when a Result is saved',
        'Use {% cache %} in the sidebar template; test with Django Debug Toolbar to see fewer queries',
      ],
      code: `# portal/settings.py
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.getenv("REDIS_URL", "redis://127.0.0.1:6379/1"),
        "TIMEOUT": 300,
        "KEY_PREFIX": "portal",
    }
}
# In development without Redis:
# CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# students/views.py
from django.core.cache import cache
from django.db.models import Avg
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

TOP_KEY = "top_scorers_v1"


@cache_page(60 * 15)               # public page, same for everyone
def course_catalogue(request):
    courses = Course.objects.annotate(avg_marks=Avg("students__results__marks")).order_by("name")
    return render(request, "students/catalogue.html", {"courses": courses})


def get_top_scorers():
    def compute():
        return list(
            Student.objects.annotate(avg=Avg("results__marks"))
            .filter(avg__isnull=False).order_by("-avg").values("name", "avg")[:5]
        )
    return cache.get_or_set(TOP_KEY, compute, timeout=60 * 10)


@vary_on_cookie
@cache_page(60)                    # per-user page: vary on the session cookie
@login_required
def dashboard(request):
    return render(request, "students/dashboard.html", {"top": get_top_scorers()})


# students/signals.py  (invalidate on change)
from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from .models import Result


@receiver([post_save, post_delete], sender=Result)
def clear_top_scorers(sender, **kwargs):
    cache.delete("top_scorers_v1")

<!-- templates/students/_sidebar.html -->
{% load cache %}
{% cache 600 course_sidebar %}
  <ul>{% for c in all_courses %}<li>{{ c.name }}</li>{% endfor %}</ul>
{% endcache %}

{# per-user fragment: add a vary key #}
{% cache 300 my_results request.user.pk %}
  ...
{% endcache %}

# Shell
>>> from django.core.cache import cache
>>> cache.set("greeting", "hello", 30)
>>> cache.get("greeting")
'hello'
>>> cache.incr("visits", 1) if cache.get("visits") is not None else cache.set("visits", 1)
>>> cache.clear()          # careful: clears everything`,
      result: 'First load of /catalogue/ runs 1 SQL query (about 120 ms); the next loads come from Redis (about 5 ms, 0 queries). Saving a new Result deletes top_scorers_v1, so the dashboard shows fresh rankings on the next request.',
      explanation: 'cache_page stores the whole response; get_or_set caches only the data; {% cache %} caches part of a template. The signal keeps the cache correct after writes.',
    },
    {
      title: 'Pure Python demo: a TTL cache with hits and misses',
      scenario: 'Understand cache hit, miss and expiry using a fake clock so the output is predictable.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `class FakeClock:
    now = 0

class TTLCache:
    def __init__(self):
        self.store = {}
    def get(self, key):
        item = self.store.get(key)
        if item and item[1] > FakeClock.now:
            return item[0]
        self.store.pop(key, None)
        return None
    def set(self, key, value, timeout):
        self.store[key] = (value, FakeClock.now + timeout)
    def get_or_set(self, key, func, timeout):
        value = self.get(key)
        if value is None:
            print(f"t={FakeClock.now}: MISS -> computing")
            value = func()
            self.set(key, value, timeout)
        else:
            print(f"t={FakeClock.now}: HIT")
        return value

db_calls = 0
def top_scorers():
    global db_calls
    db_calls += 1
    return ["Asha", "Meena"]

cache = TTLCache()
for t in [0, 10, 59, 60, 61]:
    FakeClock.now = t
    cache.get_or_set("top", top_scorers, timeout=60)
print("database calls:", db_calls)`,
      python: {
        files: {
          'main.py': `class FakeClock:
    now = 0

class TTLCache:
    def __init__(self):
        self.store = {}
    def get(self, key):
        item = self.store.get(key)
        if item and item[1] > FakeClock.now:
            return item[0]
        self.store.pop(key, None)
        return None
    def set(self, key, value, timeout):
        self.store[key] = (value, FakeClock.now + timeout)
    def get_or_set(self, key, func, timeout):
        value = self.get(key)
        if value is None:
            print(f"t={FakeClock.now}: MISS -> computing")
            value = func()
            self.set(key, value, timeout)
        else:
            print(f"t={FakeClock.now}: HIT")
        return value

db_calls = 0
def top_scorers():
    global db_calls
    db_calls += 1
    return ["Asha", "Meena"]

cache = TTLCache()
for t in [0, 10, 59, 60, 61]:
    FakeClock.now = t
    cache.get_or_set("top", top_scorers, timeout=60)
print("database calls:", db_calls)`,
        },
      },
      result: `t=0: MISS -> computing
t=10: HIT
t=59: HIT
t=60: MISS -> computing
t=61: HIT
database calls: 2`,
      explanation: 'Five requests needed only two expensive calls. At t=60 the entry expired (timeout 60), so it was recomputed, just like Django\'s cache timeout.',
    },
  ],
  interview: [
    { q: 'Difference between cookies and sessions?', a: 'Cookies store data in the browser (limited size, user-editable). Sessions store data on the server and the browser holds only a session id cookie.', level: 'Easy' },
    { q: 'What session engines does Django support?', a: 'db (default), cache, cached_db, file and signed_cookies.', level: 'Medium' },
    { q: 'What is a signed cookie?', a: 'A cookie whose value is signed with SECRET_KEY so tampering is detected (BadSignature). It is not encrypted; users can still read it.', level: 'Medium' },
    { q: 'What are HttpOnly, Secure and SameSite cookie flags?', a: 'HttpOnly hides the cookie from JavaScript (XSS protection), Secure sends it only over HTTPS, SameSite (Lax/Strict/None) limits sending on cross-site requests (CSRF protection).', level: 'Medium' },
    { q: 'Why may changes to request.session not be saved?', a: 'Django saves only when the session is marked modified, which happens on key assignment or deletion. Mutating a nested object needs request.session.modified = True.', level: 'Hard' },
    { q: 'What cache backends does Django provide?', a: 'Redis, Memcached (PyMemcache/PyLibMC), database, file-based, local-memory and dummy.', level: 'Easy' },
    { q: 'What does @cache_page do?', a: 'Caches the entire response of a view for the given seconds, keyed by URL (and Vary headers).', level: 'Easy' },
    { q: 'What is template fragment caching?', a: 'Caching part of a template with {% cache timeout name vary_on... %}...{% endcache %}.', level: 'Medium' },
    { q: 'What is cache invalidation and how do you handle it?', a: 'Removing or updating stale cached data when the source changes. Use timeouts, delete keys in save/signals, or versioned keys.', level: 'Medium' },
    { q: 'Why is LocMemCache not suitable for production with multiple workers?', a: 'Each process has its own memory, so caches are not shared and invalidation in one worker does not affect the others.', level: 'Hard' },
    { q: 'What is cache stampede and how can it be reduced?', a: 'Many requests miss an expired key at the same time and all recompute it. Reduce with locks, staggered/jittered timeouts, or background refresh.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Count how many times a visitor opened the home page using the session.',
      hint: 'request.session.get with default 0.',
      solution: `def home(request):
    request.session["visits"] = request.session.get("visits", 0) + 1
    return render(request, "students/home.html", {"visits": request.session["visits"]})`,
    },
    {
      task: 'Cache the course list view for 10 minutes from urls.py without touching views.py.',
      hint: 'Wrap the view with cache_page in path().',
      solution: `from django.views.decorators.cache import cache_page

path("courses/", cache_page(60 * 10)(views.CourseListView.as_view()), name="course_list"),`,
    },
    {
      task: 'Write a function that caches a student count per course with key "course_count_<id>".',
      hint: 'cache.get_or_set with a lambda.',
      solution: `def course_count(course_id):
    return cache.get_or_set(f"course_count_{course_id}",
                            lambda: Student.objects.filter(course_id=course_id).count(), 300)`,
    },
    {
      task: 'Log the user out automatically after 15 minutes of inactivity.',
      hint: 'SESSION_COOKIE_AGE and SESSION_SAVE_EVERY_REQUEST.',
      solution: `SESSION_COOKIE_AGE = 15 * 60
SESSION_SAVE_EVERY_REQUEST = True`,
    },
  ],
  quiz: [
    { question: 'Where is session data stored by default?', options: ['Browser localStorage', 'In the database (django_session table)', 'In settings.py', 'In the URL'], answer: 1, explanation: 'The default engine is db.' },
    { question: 'Which decorator caches a whole view response?', options: ['@cache_page', '@lru_cache', '@cached_property', '@never_cache'], answer: 0, explanation: 'cache_page stores the response in the configured cache.' },
    { question: 'Which cookie flag stops JavaScript from reading a cookie?', options: ['Secure', 'SameSite', 'Max-Age', 'HttpOnly'], answer: 3, explanation: 'HttpOnly cookies are not available via document.cookie.' },
    { question: 'Which method returns a cached value or computes and stores it?', options: ['cache.fetch()', 'cache.add()', 'cache.get_or_set()', 'cache.touch()'], answer: 2, explanation: 'get_or_set calls the default callable on a miss.' },
    { question: 'Best production cache backend from this list:', options: ['LocMemCache', 'RedisCache', 'DummyCache', 'FileBasedCache on each server'], answer: 1, explanation: 'Redis is shared between processes and servers and is fast.' },
  ],
};
