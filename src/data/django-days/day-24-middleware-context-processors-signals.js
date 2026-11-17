export default {
  id: 'day-24-middleware-context-processors-signals',
  title: 'Middleware, Context Processors, Signals',
  module: 'Module 5: Advanced Django',
  day: 24,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Learn three ways to run code "around" your views: middleware wraps every request and response, context processors add variables to every template, and signals let apps react to events like a model being saved or a user logging in.',
  objectives: [
    'Explain the request/response cycle and middleware order (the onion model)',
    'Write function-based and class-based middleware with process_view and process_exception',
    'Create a custom context processor and register it in TEMPLATES',
    'Use built-in signals (post_save, pre_delete, user_logged_in) and create custom signals',
    'Know when NOT to use signals and common pitfalls',
  ],
  theory: [
    {
      heading: 'What is middleware?',
      content: 'Middleware is a layer of code that every request passes through before reaching the view and every response passes through on the way back. Think of airport security: every passenger (request) passes the same checkpoints in order on the way in, and back through customs on the way out. Django uses middleware for sessions, authentication, CSRF, security headers and messages.',
      points: [
        'MIDDLEWARE list order matters: requests go top -> bottom, responses go bottom -> top',
        'A middleware can return a response early (short-circuit) and the view is never called',
        'SessionMiddleware must come before AuthenticationMiddleware (auth needs the session)',
      ],
    },
    {
      heading: 'Writing middleware',
      content: 'A middleware is a factory that receives get_response (the next layer) and returns a callable that takes a request. Code before get_response(request) runs on the way in; code after it runs on the way out. Class middleware may also define hooks.',
      syntax: `class TimingMiddleware:
    def __init__(self, get_response):      # runs ONCE at server start
        self.get_response = get_response

    def __call__(self, request):           # runs for EVERY request
        # before view
        response = self.get_response(request)
        # after view
        return response

    def process_view(self, request, view_func, view_args, view_kwargs): ...
    def process_exception(self, request, exception): ...
    def process_template_response(self, request, response): ...`,
      tip: '__init__ runs once per process, so never store per-request data on self in middleware (it is shared by all users).',
    },
    {
      heading: 'Context processors',
      content: 'A context processor is a function that takes request and returns a dict. Django merges that dict into the context of EVERY template rendered with a request (render(), TemplateView, etc.). Built-in ones give user, perms, messages and request. Use them for site-wide values like site name, current year, or count of unread notices in the navbar.',
      syntax: `# students/context_processors.py
def portal_info(request):
    return {"SITE_NAME": "Student Portal", "SUPPORT_EMAIL": "help@portal.com"}

# settings.py TEMPLATES[0]["OPTIONS"]["context_processors"] += ["students.context_processors.portal_info"]`,
      tip: 'Context processors run on every render, so keep them fast (cache database queries).',
    },
    {
      heading: 'Signals',
      content: 'Signals are Django\'s publish/subscribe system. A sender broadcasts "something happened" and any number of receivers react, without the sender knowing about them. Like a school bell: the bell does not know which classes will react, it just rings.',
      points: [
        'Model signals: pre_save, post_save, pre_delete, post_delete, m2m_changed',
        'Request signals: request_started, request_finished',
        'Auth signals: user_logged_in, user_logged_out, user_login_failed',
        'Connect receivers with @receiver and import the module in AppConfig.ready()',
        'post_save gives created=True for new rows',
      ],
    },
    {
      heading: 'Signal pitfalls and alternatives',
      content: 'Signals are synchronous: they run in the same request and transaction. They are hidden (hard to find when reading the view) and they do NOT fire for queryset.update(), bulk_create() or raw SQL. Prefer overriding save() or calling a service function when the logic belongs to that model. Use signals to decouple apps (e.g. accounts reacting to a model in students) or to hook into third-party models like User.',
      points: [
        'Use transaction.on_commit() inside receivers before sending email or tasks',
        'Avoid infinite loops: calling instance.save() inside post_save of the same model re-triggers it',
        'Use dispatch_uid to prevent duplicate connections',
      ],
    },
  ],
  examples: [
    {
      title: 'Custom middleware: request timing, maintenance mode and IP logging',
      scenario: 'The portal team wants to log slow requests, add an X-Response-Time header, and turn on a maintenance page with one setting.',
      steps: [
        'Create portal/middleware.py (VS Code: New File; PyCharm: right-click portal > New > Python File)',
        'Paste the two middleware classes',
        'Add them to MIDDLEWARE in portal/settings.py in the right position',
        'Run python manage.py runserver and check the response headers in browser DevTools',
        'Set MAINTENANCE_MODE = True and reload to see the 503 page',
      ],
      code: `# portal/middleware.py
import logging
import time

from django.conf import settings
from django.http import HttpResponse

logger = logging.getLogger("portal.requests")


class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000
        response["X-Response-Time"] = f"{duration_ms:.1f}ms"
        if duration_ms > 500:
            ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR"))
            logger.warning("Slow request %s %s %.0fms from %s", request.method, request.path, duration_ms, ip)
        return response

    def process_exception(self, request, exception):
        logger.exception("Unhandled error on %s", request.path)
        return None          # let Django continue normal error handling


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if getattr(settings, "MAINTENANCE_MODE", False):
            if not request.path.startswith("/admin/") and not request.user.is_staff:
                return HttpResponse("<h1>Portal under maintenance. Back soon.</h1>", status=503)
        return self.get_response(request)


# Function-style middleware (same idea)
def simple_header_middleware(get_response):
    def middleware(request):
        response = get_response(request)
        response["X-Portal"] = "student-portal"
        return response
    return middleware


# portal/settings.py
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "portal.middleware.RequestTimingMiddleware",            # early: measures everything below
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "portal.middleware.MaintenanceModeMiddleware",          # after auth: needs request.user
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "portal.middleware.simple_header_middleware",
]
MAINTENANCE_MODE = False

LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"portal.requests": {"handlers": ["console"], "level": "INFO"}},
}`,
      result: 'Every response has headers X-Response-Time: 12.4ms and X-Portal: student-portal. With MAINTENANCE_MODE = True, students see "Portal under maintenance. Back soon." with status 503; staff can still use the site.',
      explanation: 'MaintenanceModeMiddleware must be after AuthenticationMiddleware, otherwise request.user does not exist yet. Returning a response early skips the view and all inner middleware.',
    },
    {
      title: 'Context processor for site-wide navbar data',
      scenario: 'The navbar on every page shows the site name, the current academic year and the count of new notices.',
      steps: [
        'Create students/context_processors.py',
        'Register it in TEMPLATES OPTIONS context_processors in settings.py',
        'Use the variables in templates/base.html',
        'Reload any page to see the values without changing views',
      ],
      code: `# students/context_processors.py
from datetime import date

from django.core.cache import cache

from .models import Notice


def portal_globals(request):
    today = date.today()
    start = today.year if today.month >= 6 else today.year - 1
    new_notices = cache.get("new_notice_count")
    if new_notices is None:
        new_notices = Notice.objects.filter(created_at__date=today).count()
        cache.set("new_notice_count", new_notices, 60)   # cache for 60 s
    return {
        "SITE_NAME": "Student Portal",
        "ACADEMIC_YEAR": f"{start}-{str(start + 1)[-2:]}",
        "NEW_NOTICES": new_notices,
    }


# portal/settings.py
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "students.context_processors.portal_globals",
            ],
        },
    },
]

<!-- templates/base.html -->
<header>
  <strong>{{ SITE_NAME }}</strong> | Academic year {{ ACADEMIC_YEAR }}
  <a href="{% url 'students:notices' %}">Notices ({{ NEW_NOTICES }})</a>
</header>`,
      result: 'Every page header shows: Student Portal | Academic year 2026-27  Notices (2).',
      explanation: 'Views do not need to pass these values. The query is cached for 60 seconds so the context processor does not hit the database on every page.',
    },
    {
      title: 'Signals: welcome email, audit log and custom signal',
      scenario: 'When a Student is created, create an audit entry; when a result is published, notify listeners through a custom signal; log every login.',
      steps: [
        'Create students/signals.py with the receivers',
        'Import the signals module in students/apps.py ready()',
        'Make sure INSTALLED_APPS uses "students" (the default AppConfig is detected automatically)',
        'Create a student in the admin and log in/out, then check the AuditLog table and console',
      ],
      code: `# students/models.py
class AuditLog(models.Model):
    action = models.CharField(max_length=100)
    detail = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)


# students/signals.py
import logging

from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.db import transaction
from django.db.models.signals import post_save, pre_delete
from django.dispatch import Signal, receiver

from .models import AuditLog, Student

logger = logging.getLogger(__name__)

result_published = Signal()          # custom signal; sends result=...


@receiver(post_save, sender=Student, dispatch_uid="student_saved_audit")
def student_saved(sender, instance, created, **kwargs):
    action = "student_created" if created else "student_updated"
    AuditLog.objects.create(action=action, detail=f"{instance.roll_no} {instance.name}")


@receiver(pre_delete, sender=Student)
def student_deleting(sender, instance, **kwargs):
    AuditLog.objects.create(action="student_deleted", detail=instance.roll_no)
    if instance.photo:
        transaction.on_commit(lambda: instance.photo.delete(save=False))


@receiver(user_logged_in)
def on_login(sender, request, user, **kwargs):
    AuditLog.objects.create(action="login", detail=str(user))


@receiver(user_login_failed)
def on_login_failed(sender, credentials, request, **kwargs):
    logger.warning("Failed login for %s", credentials.get("username"))


@receiver(result_published)
def notify_student(sender, result, **kwargs):
    logger.info("Result %s published for %s", result.subject, result.student.name)


# students/apps.py
from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "students"

    def ready(self):
        from . import signals  # noqa: F401


# students/views.py (sending the custom signal)
from .signals import result_published

def publish_result(request, pk):
    result = get_object_or_404(Result, pk=pk)
    result.is_published = True
    result.save(update_fields=["is_published"])
    result_published.send(sender=Result, result=result)
    return redirect("students:detail", pk=result.student_id)`,
      result: 'Adding student STU105 Kiran creates AuditLog(action="student_created", detail="STU105 Kiran"). Logging in creates AuditLog(action="login"). Publishing a result prints "Result Maths published for Kiran" in the console. Note: Student.objects.filter(...).update(is_active=False) creates NO audit entries.',
      explanation: 'Receivers are connected when ready() imports the module. dispatch_uid prevents double registration. Bulk update() skips signals because no model instances are saved.',
    },
    {
      title: 'Pure Python demo: the middleware onion',
      scenario: 'Simulate how Django chains middleware so you can see the order of "before" and "after" code.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `def view(request):
    print("  -> view runs for", request["path"])
    return {"status": 200, "headers": []}

def make_middleware(name, block=False):
    def factory(get_response):
        def middleware(request):
            print(f"{name}: before")
            if block and request["path"].startswith("/blocked"):
                print(f"{name}: short-circuit")
                return {"status": 403, "headers": [name]}
            response = get_response(request)
            response["headers"].append(name)
            print(f"{name}: after")
            return response
        return middleware
    return factory

MIDDLEWARE = [make_middleware("Security"), make_middleware("Session"), make_middleware("Auth", block=True)]

handler = view
for mw in reversed(MIDDLEWARE):      # Django builds the chain from the bottom up
    handler = mw(handler)

print(handler({"path": "/students/"}))
print(handler({"path": "/blocked/"}))`,
      python: {
        files: {
          'main.py': `def view(request):
    print("  -> view runs for", request["path"])
    return {"status": 200, "headers": []}

def make_middleware(name, block=False):
    def factory(get_response):
        def middleware(request):
            print(f"{name}: before")
            if block and request["path"].startswith("/blocked"):
                print(f"{name}: short-circuit")
                return {"status": 403, "headers": [name]}
            response = get_response(request)
            response["headers"].append(name)
            print(f"{name}: after")
            return response
        return middleware
    return factory

MIDDLEWARE = [make_middleware("Security"), make_middleware("Session"), make_middleware("Auth", block=True)]

handler = view
for mw in reversed(MIDDLEWARE):      # Django builds the chain from the bottom up
    handler = mw(handler)

print(handler({"path": "/students/"}))
print(handler({"path": "/blocked/"}))`,
        },
      },
      result: `Security: before
Session: before
Auth: before
  -> view runs for /students/
Auth: after
Session: after
Security: after
{'status': 200, 'headers': ['Auth', 'Session', 'Security']}
Security: before
Session: before
Auth: before
Auth: short-circuit
Session: after
Security: after
{'status': 403, 'headers': ['Auth', 'Session', 'Security']}`,
      explanation: 'Requests go top to bottom, responses bottom to top. When Auth returns early, the view never runs, but the outer middleware still process the response on the way out.',
    },
  ],
  interview: [
    { q: 'What is middleware in Django?', a: 'A lightweight plugin layer that processes every request before the view and every response after it, configured in the MIDDLEWARE setting.', level: 'Easy' },
    { q: 'In what order does middleware run?', a: 'Request phase top to bottom, response phase bottom to top, like layers of an onion. A middleware returning early skips the inner layers and view.', level: 'Medium' },
    { q: 'Name some built-in middleware and their purpose.', a: 'SecurityMiddleware (HTTPS/headers), SessionMiddleware (sessions), CommonMiddleware (APPEND_SLASH), CsrfViewMiddleware (CSRF), AuthenticationMiddleware (request.user), MessageMiddleware (messages), XFrameOptionsMiddleware (clickjacking).', level: 'Medium' },
    { q: 'What hooks can class-based middleware define?', a: 'process_view (before the view is called), process_exception (when the view raises), process_template_response (for TemplateResponse objects).', level: 'Hard' },
    { q: 'What is a context processor?', a: 'A function that takes request and returns a dict merged into every template context rendered with a RequestContext.', level: 'Easy' },
    { q: 'What are Django signals?', a: 'An observer pattern implementation letting decoupled receivers get notified when senders perform actions, e.g. post_save after a model is saved.', level: 'Easy' },
    { q: 'Where should you connect signal receivers?', a: 'In a signals.py module imported from AppConfig.ready() so they are registered once when the app loads.', level: 'Medium' },
    { q: 'Do signals run asynchronously?', a: 'No, they are synchronous and run in the same thread and transaction. For slow tasks use transaction.on_commit plus a task queue like Celery.', level: 'Medium' },
    { q: 'Which ORM operations do NOT send pre_save/post_save?', a: 'QuerySet.update(), bulk_create() (no post_save per object), bulk_update(), and raw SQL.', level: 'Hard' },
    { q: 'When should you avoid signals?', a: 'When the logic belongs to the same app/model: overriding save() or explicit service functions are clearer and easier to test.', level: 'Medium' },
    { q: 'Why does the order of SessionMiddleware and AuthenticationMiddleware matter?', a: 'AuthenticationMiddleware reads the user id from request.session, which SessionMiddleware creates; so session must come first.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write middleware that blocks IPs listed in settings.BLOCKED_IPS with 403.',
      hint: 'request.META["REMOTE_ADDR"] and HttpResponseForbidden.',
      solution: `from django.http import HttpResponseForbidden

class BlockIPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.META.get("REMOTE_ADDR") in getattr(settings, "BLOCKED_IPS", []):
            return HttpResponseForbidden("Blocked")
        return self.get_response(request)`,
    },
    {
      task: 'Create a context processor that adds current_year.',
      hint: 'Return a dict and register it.',
      solution: `from datetime import date

def current_year(request):
    return {"current_year": date.today().year}
# add "students.context_processors.current_year" to context_processors`,
    },
    {
      task: 'Use pre_save to always store student names in Title Case.',
      hint: 'Modify instance before saving.',
      solution: `from django.db.models.signals import pre_save

@receiver(pre_save, sender=Student)
def title_case_name(sender, instance, **kwargs):
    instance.name = instance.name.strip().title()`,
    },
    {
      task: 'Log whenever a student is added to or removed from a ManyToMany clubs field.',
      hint: 'm2m_changed with Student.clubs.through.',
      solution: `from django.db.models.signals import m2m_changed

@receiver(m2m_changed, sender=Student.clubs.through)
def clubs_changed(sender, instance, action, pk_set, **kwargs):
    if action in ("post_add", "post_remove"):
        print(instance.name, action, pk_set)`,
    },
  ],
  quiz: [
    { question: 'During the response phase, middleware runs:', options: ['Top to bottom', 'Bottom to top', 'Randomly', 'Only the first one'], answer: 1, explanation: 'Responses travel back out through the layers in reverse order.' },
    { question: 'Which signal tells you whether a row was newly created?', options: ['pre_save', 'pre_init', 'post_delete', 'post_save (created argument)'], answer: 3, explanation: 'post_save passes created=True for inserts.' },
    { question: 'Where do you register a custom context processor?', options: ['TEMPLATES OPTIONS context_processors', 'MIDDLEWARE', 'INSTALLED_APPS', 'urls.py'], answer: 0, explanation: 'It is listed under TEMPLATES[...]["OPTIONS"]["context_processors"].' },
    { question: 'Student.objects.filter(course=c).update(is_active=False) will:', options: ['send post_save for each student', 'send pre_delete', 'not send post_save at all', 'raise an error'], answer: 2, explanation: 'update() runs a single SQL UPDATE without saving instances.' },
    { question: 'Where should signal receivers be imported?', options: ['settings.py', 'AppConfig.ready()', 'manage.py', 'wsgi.py'], answer: 1, explanation: 'ready() runs once when the app registry is fully loaded.' },
  ],
};
