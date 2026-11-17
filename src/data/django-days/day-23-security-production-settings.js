export default {
  id: 'day-23-security-production-settings',
  title: 'Security: CSRF, XSS, SQL Injection protection, settings for production',
  module: 'Module 4: Authentication & Security',
  day: 23,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Understand the most common web attacks (CSRF, XSS, SQL injection, clickjacking) and how Django protects the Student Portal against them, then harden settings.py for production using environment variables and python manage.py check --deploy.',
  objectives: [
    'Explain CSRF and how {% csrf_token %} and CsrfViewMiddleware prevent it',
    'Explain XSS and Django template auto-escaping, and the danger of |safe and mark_safe',
    'Write SQL safely with the ORM and parameterized raw queries',
    'Configure production security settings (DEBUG, ALLOWED_HOSTS, HTTPS, HSTS, secure cookies)',
    'Use environment variables for secrets and run check --deploy',
  ],
  theory: [
    {
      heading: 'CSRF: Cross-Site Request Forgery',
      content: 'If you are logged into the portal and visit an evil site, that site can secretly submit a form to the portal (for example "delete student 5"). Your browser sends your session cookie automatically, so the portal thinks YOU did it. Django prevents this with a secret token: every POST form must include {% csrf_token %}, and CsrfViewMiddleware rejects POST/PUT/PATCH/DELETE requests without a matching token (403 Forbidden). The evil site cannot read your token, so it cannot forge the request.',
      points: [
        'Always put {% csrf_token %} inside <form method="post">',
        'For AJAX send the X-CSRFToken header with the csrftoken cookie value',
        'Avoid @csrf_exempt unless the endpoint uses another auth (e.g. signed webhooks)',
        'Behind HTTPS on another domain/port set CSRF_TRUSTED_ORIGINS = ["https://portal.example.com"]',
      ],
    },
    {
      heading: 'XSS: Cross-Site Scripting',
      content: 'XSS happens when user input containing <script> is shown on a page and runs in other users\' browsers, stealing cookies or changing the page. Django templates auto-escape variables: < becomes &lt;, so {{ student.name }} is shown as text, never executed. You turn escaping off only with |safe, {% autoescape off %} or mark_safe(), so use them only for trusted content.',
      syntax: `{{ comment }}          {# <script>alert(1)</script> is shown as text #}
{{ comment|safe }}     {# DANGEROUS: the script runs #}
{{ data|json_script:"student-data" }}   {# safe way to pass data to JavaScript #}`,
      tip: 'Use format_html() instead of mark_safe(f"...") when building HTML in Python; it escapes the arguments for you.',
    },
    {
      heading: 'SQL Injection',
      content: 'SQL injection happens when user input is glued into a SQL string, e.g. "SELECT * FROM student WHERE name = \'" + q + "\'". Input like \' OR \'1\'=\'1 changes the query. The Django ORM always uses parameterized queries, so filter(name=q) is safe. If you write raw SQL, pass parameters separately; never use f-strings or % formatting to build SQL.',
      syntax: `Student.objects.filter(name=q)                                     # safe
Student.objects.raw("SELECT * FROM students_student WHERE name = %s", [q])   # safe
cursor.execute("SELECT ... WHERE name = %s", [q])                  # safe
cursor.execute(f"SELECT ... WHERE name = '{q}'")                   # VULNERABLE`,
    },
    {
      heading: 'Clickjacking, HTTPS and cookies',
      content: 'Clickjacking hides your site inside an invisible iframe and tricks users into clicking. XFrameOptionsMiddleware sends X-Frame-Options: DENY by default. In production, force HTTPS so passwords and cookies are encrypted, mark cookies Secure, and use HSTS so browsers never try HTTP again.',
      points: [
        'SECURE_SSL_REDIRECT = True',
        'SESSION_COOKIE_SECURE = True, CSRF_COOKIE_SECURE = True',
        'SECURE_HSTS_SECONDS = 31536000, SECURE_HSTS_INCLUDE_SUBDOMAINS = True, SECURE_HSTS_PRELOAD = True',
        'SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") when behind Nginx/Render',
        'SESSION_COOKIE_HTTPONLY = True (default) so JavaScript cannot read the session cookie',
      ],
    },
    {
      heading: 'Production settings checklist',
      content: 'DEBUG=True shows full stack traces and settings to anyone, so it must be False in production. SECRET_KEY signs sessions, password reset tokens and CSRF; keep it out of Git and load it from environment variables. ALLOWED_HOSTS must list your domains (prevents Host header attacks). Finally run python manage.py check --deploy which lists missing security settings.',
      points: [
        'DEBUG = False, SECRET_KEY from env, ALLOWED_HOSTS = ["portal.example.com"]',
        'Strong AUTH_PASSWORD_VALIDATORS, admin URL not at /admin/ (optional obscurity)',
        'Keep Django and packages updated (pip list --outdated, pip-audit)',
        'Log errors (ADMINS + LOGGING) instead of showing them',
      ],
    },
  ],
  examples: [
    {
      title: 'CSRF in forms and in fetch() AJAX',
      scenario: 'A "Mark attendance" button sends a POST with JavaScript; it must include the CSRF token.',
      steps: [
        'Open templates/students/student_detail.html in VS Code or PyCharm',
        'Add the button and the JavaScript below',
        'Write the mark_attendance view with @require_POST',
        'Open the browser DevTools Network tab and check the X-CSRFToken header',
        'Remove the header to see 403 Forbidden (CSRF verification failed)',
      ],
      code: `<!-- normal form -->
<form method="post" action="{% url 'students:delete' student.pk %}">
  {% csrf_token %}
  <button>Delete</button>
</form>

<!-- AJAX button -->
<button id="present" data-url="{% url 'students:attendance' student.pk %}">Mark present</button>
<script>
function getCookie(name) {
  const match = document.cookie.match('(^|;)\\\\s*' + name + '\\\\s*=\\\\s*([^;]+)');
  return match ? decodeURIComponent(match.pop()) : null;
}
document.getElementById("present").addEventListener("click", async (e) => {
  const res = await fetch(e.target.dataset.url, {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
  });
  const data = await res.json();
  alert(data.message);
});
</script>

# students/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_POST


@login_required
@require_POST
def mark_attendance(request, pk):
    student = get_object_or_404(Student, pk=pk)
    Attendance.objects.get_or_create(student=student, date=timezone.localdate())
    return JsonResponse({"message": f"{student.name} marked present"})`,
      result: 'With the header: 200 {"message": "Asha marked present"}. Without the header: 403 Forbidden "CSRF verification failed. Request aborted."',
      explanation: 'The csrftoken cookie is readable by your own page\'s JavaScript but not by other sites, so only your page can copy it into the header.',
    },
    {
      title: 'XSS: auto-escaping, |safe and format_html',
      scenario: 'A student enters <script>alert("hacked")</script> as their bio. Make sure it never runs.',
      steps: [
        'Save the bio through the profile form from Day 21',
        'Display it with {{ }} and view page source',
        'Write a safe admin column with format_html',
      ],
      code: `<!-- templates/accounts/profile_detail.html -->
<p>{{ user.profile.bio }}</p>
<!-- page source shows: &lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt; -->

<p>{{ user.profile.bio|linebreaksbr }}</p>   <!-- still escaped, adds <br> -->

<!-- Passing data to JS safely -->
{{ chart_data|json_script:"marks-data" }}
<script>
  const marks = JSON.parse(document.getElementById("marks-data").textContent);
</script>

# accounts/admin.py
from django.utils.html import format_html


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "avatar_tag")

    @admin.display(description="Avatar")
    def avatar_tag(self, obj):
        if obj.avatar:
            # format_html escapes obj.user.email, mark_safe(f"...") would not
            return format_html('<img src="{}" alt="{}" width="40">', obj.avatar.url, obj.user.email)
        return "-"`,
      result: 'The page shows the literal text <script>alert("hacked")</script>; no alert box appears.',
      explanation: 'Auto-escaping is on by default. The risk only appears when developers use |safe or mark_safe on user data.',
    },
    {
      title: 'Production settings with environment variables',
      scenario: 'Prepare portal/settings.py so the same code runs safely in development and production.',
      steps: [
        'pip install python-dotenv (or django-environ) and add to requirements.txt',
        'Create .env in the project root and add .env to .gitignore',
        'Edit settings.py as below',
        'VS Code: the Python extension can load .env automatically (python.envFile); PyCharm: Run Configuration > Environment variables or EnvFile plugin',
        'Run DJANGO_DEBUG=False python manage.py check --deploy and fix every warning',
      ],
      code: `# .env  (never commit this file)
DJANGO_SECRET_KEY=change-me-to-a-long-random-string
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=portal.example.com,www.portal.example.com
DB_NAME=student_portal
DB_USER=portal_user
DB_PASSWORD=StrongDbPass#2026
DB_HOST=127.0.0.1

# Generate a key:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# portal/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]                 # crash early if missing
DEBUG = os.getenv("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
CSRF_TRUSTED_ORIGINS = [f"https://{h}" for h in ALLOWED_HOSTS if h not in ("localhost", "127.0.0.1")]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4", "init_command": "SET sql_mode='STRICT_TRANS_TABLES'"},
    }
}

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    X_FRAME_OPTIONS = "DENY"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# .gitignore
.env
venv/
__pycache__/
media/
staticfiles/

# Terminal
python manage.py check --deploy`,
      result: 'Before hardening, check --deploy prints warnings like security.W004 (SECURE_HSTS_SECONDS), security.W008 (SECURE_SSL_REDIRECT), security.W012 (SESSION_COOKIE_SECURE), security.W018 (DEBUG). After the changes: "System check identified no issues (0 silenced)."',
      explanation: 'Secrets live in the environment, not in Git. Security settings switch on automatically when DEBUG is False.',
    },
    {
      title: 'Pure Python demo: SQL injection vs parameterized query',
      scenario: 'Use sqlite3 to see why string formatting is dangerous and parameters are safe.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE student (name TEXT, marks INT)")
con.executemany("INSERT INTO student VALUES (?, ?)", [("Asha", 91), ("Ravi", 78), ("Meena", 85)])

user_input = "x' OR '1'='1"

unsafe_sql = f"SELECT name FROM student WHERE name = '{user_input}'"
print("Unsafe:", con.execute(unsafe_sql).fetchall())

safe = con.execute("SELECT name FROM student WHERE name = ?", (user_input,)).fetchall()
print("Safe:", safe)

print("Normal:", con.execute("SELECT name FROM student WHERE name = ?", ("Ravi",)).fetchall())`,
      python: {
        files: {
          'main.py': `import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE student (name TEXT, marks INT)")
con.executemany("INSERT INTO student VALUES (?, ?)", [("Asha", 91), ("Ravi", 78), ("Meena", 85)])

user_input = "x' OR '1'='1"

unsafe_sql = f"SELECT name FROM student WHERE name = '{user_input}'"
print("Unsafe:", con.execute(unsafe_sql).fetchall())

safe = con.execute("SELECT name FROM student WHERE name = ?", (user_input,)).fetchall()
print("Safe:", safe)

print("Normal:", con.execute("SELECT name FROM student WHERE name = ?", ("Ravi",)).fetchall())`,
        },
      },
      result: `Unsafe: [('Asha',), ('Ravi',), ('Meena',)]
Safe: []
Normal: [('Ravi',)]`,
      explanation: 'With formatting, the input becomes part of the SQL and OR \'1\'=\'1\' returns every row. With parameters, the whole input is treated as a value, so nothing matches. The Django ORM always uses parameters.',
    },
  ],
  interview: [
    { q: 'What is CSRF and how does Django prevent it?', a: 'A forged request from another site using the victim\'s cookies. Django\'s CsrfViewMiddleware requires a secret token (from {% csrf_token %} or X-CSRFToken header) on unsafe methods and checks the Origin/Referer for HTTPS.', level: 'Medium' },
    { q: 'What is XSS and how does Django prevent it?', a: 'Injecting scripts into pages viewed by others. Django auto-escapes template variables (<, >, &, quotes). Danger comes from |safe, mark_safe and autoescape off on user data.', level: 'Medium' },
    { q: 'Is the Django ORM safe from SQL injection?', a: 'Yes, queries are parameterized. Risk appears with raw(), extra() or cursor.execute() if you build SQL using string formatting instead of params.', level: 'Easy' },
    { q: 'Why must DEBUG be False in production?', a: 'DEBUG=True shows tracebacks, settings and SQL to visitors, and keeps all queries in memory. It also disables ALLOWED_HOSTS checking in some cases.', level: 'Easy' },
    { q: 'What is SECRET_KEY used for?', a: 'Cryptographic signing: sessions (signed cookie backend), password reset tokens, messages, CSRF and signing module. If leaked, attackers can forge them.', level: 'Medium' },
    { q: 'What is ALLOWED_HOSTS?', a: 'A list of host/domain names the site can serve. It prevents HTTP Host header attacks such as poisoned password reset links.', level: 'Medium' },
    { q: 'What is HSTS?', a: 'HTTP Strict Transport Security: a header telling browsers to use only HTTPS for a period (SECURE_HSTS_SECONDS). It prevents SSL stripping attacks.', level: 'Hard' },
    { q: 'What does python manage.py check --deploy do?', a: 'Runs extra security checks for production and warns about missing settings like DEBUG, SECRET_KEY strength, HTTPS and cookie flags.', level: 'Easy' },
    { q: 'What is clickjacking and Django\'s protection?', a: 'Embedding your site in an invisible iframe to trick clicks. XFrameOptionsMiddleware sends X-Frame-Options: DENY by default.', level: 'Medium' },
    { q: 'How do you safely pass Python data to JavaScript in a template?', a: 'Use the json_script filter which outputs escaped JSON inside a <script type="application/json"> tag.', level: 'Hard' },
    { q: 'When is @csrf_exempt acceptable?', a: 'Rarely: for endpoints authenticated another way (e.g. signed webhooks from a payment gateway, token-authenticated APIs) and never for cookie-authenticated forms.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Rewrite this unsafe query safely: Student.objects.raw(f"SELECT * FROM students_student WHERE roll_no = \'{roll}\'")',
      hint: 'Use %s placeholders and a params list, or the ORM.',
      solution: `Student.objects.raw("SELECT * FROM students_student WHERE roll_no = %s", [roll])
# or simply
Student.objects.filter(roll_no=roll)`,
    },
    {
      task: 'Generate a new SECRET_KEY from the terminal.',
      hint: 'django.core.management.utils.get_random_secret_key.',
      solution: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`,
    },
    {
      task: 'Move the admin to a secret URL read from the environment.',
      hint: 'os.getenv in urls.py.',
      solution: `import os
ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "admin/")
urlpatterns = [path(ADMIN_URL, admin.site.urls), ...]`,
    },
    {
      task: 'Make session cookies expire when the browser closes and after 30 minutes of inactivity.',
      hint: 'SESSION_EXPIRE_AT_BROWSER_CLOSE, SESSION_COOKIE_AGE, SESSION_SAVE_EVERY_REQUEST.',
      solution: `SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 30 * 60
SESSION_SAVE_EVERY_REQUEST = True`,
    },
  ],
  quiz: [
    { question: 'Which template tag prevents CSRF in forms?', options: ['{% csrf_token %}', '{% secure %}', '{% token %}', '{% protect %}'], answer: 0, explanation: 'It inserts a hidden csrfmiddlewaretoken input.' },
    { question: 'Which filter disables auto-escaping for a variable?', options: ['escape', 'striptags', 'safe', 'json_script'], answer: 2, explanation: '|safe marks the string as safe HTML, so it is not escaped.' },
    { question: 'Which raw query is safe?', options: ['f"... WHERE id = {pk}"', '"... WHERE id = %s" % pk', '"... WHERE id = " + pk', 'cursor.execute("... WHERE id = %s", [pk])'], answer: 3, explanation: 'Passing params separately lets the driver escape them.' },
    { question: 'Which setting forces all HTTP requests to redirect to HTTPS?', options: ['SECURE_HSTS_SECONDS', 'SECURE_SSL_REDIRECT', 'SESSION_COOKIE_SECURE', 'USE_TLS'], answer: 1, explanation: 'SecurityMiddleware redirects when SECURE_SSL_REDIRECT=True.' },
    { question: 'What command lists missing production security settings?', options: ['python manage.py check --deploy', 'python manage.py audit', 'python manage.py secure', 'python manage.py migrate --check'], answer: 0, explanation: 'check --deploy runs deployment checks.' },
  ],
};
