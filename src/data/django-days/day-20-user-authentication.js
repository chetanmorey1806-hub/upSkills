export default {
  id: 'day-20-user-authentication',
  title: 'User Authentication: login, logout, register, @login_required',
  module: 'Module 4: Authentication & Security',
  day: 20,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Add sign up, login, logout and password change to the Student Portal using django.contrib.auth, protect pages with @login_required and LoginRequiredMixin, and understand how Django hashes passwords and keeps users logged in with sessions.',
  objectives: [
    'Explain authentication vs authorization and how django.contrib.auth works',
    'Use built-in LoginView, LogoutView and password views with auth URLs',
    'Build a registration page with UserCreationForm and log the user in',
    'Protect views with @login_required and LoginRequiredMixin',
    'Use request.user, user.is_authenticated and the {{ user }} variable in templates',
  ],
  theory: [
    {
      heading: 'Authentication vs Authorization',
      content: 'Authentication answers "Who are you?" (login with username and password). Authorization answers "What are you allowed to do?" (permissions, Day 22). At a college gate, showing your ID card is authentication; being allowed into the staff room is authorization. Django\'s django.contrib.auth app gives the User model, password hashing, login/logout helpers, views, forms and permissions.',
      points: [
        'Needs django.contrib.auth, django.contrib.contenttypes, SessionMiddleware and AuthenticationMiddleware (all default)',
        'AuthenticationMiddleware sets request.user on every request',
        'Anonymous visitors get an AnonymousUser object (is_authenticated is False)',
      ],
    },
    {
      heading: 'authenticate(), login() and logout()',
      content: 'authenticate(request, username, password) checks credentials against the AUTHENTICATION_BACKENDS and returns a User or None. login(request, user) stores the user id in the session and rotates the session key (prevents session fixation). logout(request) flushes the session.',
      syntax: `from django.contrib.auth import authenticate, login, logout

user = authenticate(request, username="asha", password="S3cret!pass")
if user is not None:
    login(request, user)
else:
    # invalid credentials
    ...
logout(request)`,
      tip: 'Never compare passwords yourself. user.check_password("raw") and user.set_password("raw") handle hashing safely.',
    },
    {
      heading: 'Built-in auth views and URLs',
      content: 'include("django.contrib.auth.urls") gives ready URLs: login/, logout/, password_change/, password_change/done/, password_reset/ and more. You only write templates in templates/registration/. Settings LOGIN_URL, LOGIN_REDIRECT_URL and LOGOUT_REDIRECT_URL control redirects.',
      syntax: `# portal/urls.py
path("accounts/", include("django.contrib.auth.urls")),

# settings.py
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "students:home"
LOGOUT_REDIRECT_URL = "login"`,
      tip: 'Since Django 5.0, LogoutView accepts only POST. Use a small form with {% csrf_token %} for the logout button, not a link.',
    },
    {
      heading: 'Protecting views',
      content: 'For function views use the @login_required decorator. For class views use LoginRequiredMixin as the LEFT-most parent. If a visitor is not logged in, they are redirected to LOGIN_URL?next=/original/path/ and returned there after login.',
      syntax: `from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin

@login_required
def dashboard(request): ...

class StudentListView(LoginRequiredMixin, ListView): ...`,
      points: [
        'Django 5.1+ also has LoginRequiredMiddleware to protect every view by default, with @login_not_required for public views',
      ],
    },
    {
      heading: 'How passwords are stored',
      content: 'Django never stores the raw password. It stores algorithm$iterations$salt$hash, using PBKDF2-SHA256 by default with a random salt and a high iteration count. Even if the database leaks, attackers cannot read passwords directly. AUTH_PASSWORD_VALIDATORS enforce minimum length, common-password checks and similarity checks.',
      syntax: `# Example of a stored password value
pbkdf2_sha256$870000$Xq3...salt...$hJ4...hash...=`,
    },
  ],
  examples: [
    {
      title: 'Accounts app: login, logout and registration',
      scenario: 'Students must sign up and log in before seeing the portal.',
      steps: [
        'VS Code terminal / PyCharm terminal: python manage.py startapp accounts',
        'Add "accounts" to INSTALLED_APPS in portal/settings.py',
        'Create accounts/forms.py, accounts/views.py and accounts/urls.py as below',
        'Create templates/registration/login.html and templates/accounts/signup.html',
        'Add auth settings, include URLs, run python manage.py runserver and open /accounts/signup/',
      ],
      code: `# Project tree
student_portal/
├── accounts/
│   ├── forms.py
│   ├── urls.py
│   └── views.py
├── portal/settings.py
├── portal/urls.py
└── templates/
    ├── base.html
    ├── accounts/signup.html
    └── registration/login.html

# portal/settings.py
INSTALLED_APPS += ["accounts"]
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "students:home"
LOGOUT_REDIRECT_URL = "login"

# accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ["username", "email", "first_name", "last_name"]

    def clean_email(self):
        email = self.cleaned_data["email"].lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already registered.")
        return email


# accounts/views.py
from django.contrib import messages
from django.contrib.auth import login
from django.urls import reverse_lazy
from django.views.generic import CreateView
from .forms import SignUpForm


class SignUpView(CreateView):
    form_class = SignUpForm
    template_name = "accounts/signup.html"
    success_url = reverse_lazy("students:home")

    def form_valid(self, form):
        response = super().form_valid(form)      # saves user, sets self.object
        login(self.request, self.object)         # log in immediately
        messages.success(self.request, f"Welcome {self.object.username}!")
        return response


# accounts/urls.py
from django.urls import path
from .views import SignUpView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
]

# portal/urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("django.contrib.auth.urls")),   # login, logout, password_change...
    path("", include("students.urls")),
]

<!-- templates/registration/login.html -->
{% extends "base.html" %}
{% block content %}
  <h2>Login</h2>
  <form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <input type="hidden" name="next" value="{{ next }}">
    <button type="submit">Login</button>
  </form>
  <a href="{% url 'signup' %}">Create account</a> |
  <a href="{% url 'password_reset' %}">Forgot password?</a>
{% endblock %}

<!-- templates/accounts/signup.html -->
{% extends "base.html" %}
{% block content %}
  <h2>Sign up</h2>
  <form method="post">{% csrf_token %}{{ form.as_p }}<button>Register</button></form>
{% endblock %}

<!-- templates/base.html navbar -->
<nav>
  {% if user.is_authenticated %}
    Hi {{ user.username }}
    <form method="post" action="{% url 'logout' %}" style="display:inline">
      {% csrf_token %}<button type="submit">Logout</button>
    </form>
  {% else %}
    <a href="{% url 'login' %}">Login</a> <a href="{% url 'signup' %}">Sign up</a>
  {% endif %}
</nav>`,
      result: 'Signing up as "asha" creates the user (password stored as a pbkdf2_sha256 hash), logs her in and shows "Welcome asha!". Clicking Logout (POST) redirects to /accounts/login/.',
      explanation: 'UserCreationForm already validates password1/password2 and runs AUTH_PASSWORD_VALIDATORS. Calling login() after save logs the new user in without asking for the password again.',
    },
    {
      title: 'Protecting pages and redirecting with ?next=',
      scenario: 'Only logged-in users may see the student list and the dashboard.',
      steps: [
        'Open students/views.py',
        'Add LoginRequiredMixin to class views and @login_required to function views',
        'Log out and open /students/; you are sent to /accounts/login/?next=/students/',
        'Log in and you land back on /students/',
      ],
      code: `# students/views.py
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin


class StudentListView(LoginRequiredMixin, ListView):
    model = Student
    paginate_by = 10
    ordering = ["roll_no"]
    # login_url = "/accounts/login/"    # optional override
    # redirect_field_name = "next"      # default


@login_required
def dashboard(request):
    context = {
        "username": request.user.get_full_name() or request.user.username,
        "last_login": request.user.last_login,
    }
    return render(request, "students/dashboard.html", context)`,
      result: 'Anonymous GET /students/ -> 302 redirect to /accounts/login/?next=/students/. After a correct login -> 302 to /students/ with the list shown.',
      explanation: 'LoginView reads the next parameter and redirects safely (it ignores external URLs to prevent open redirects).',
    },
    {
      title: 'Custom login view with email or username',
      scenario: 'Some students forget their username, so the login form should accept email too.',
      steps: [
        'Create accounts/backends.py with EmailOrUsernameBackend',
        'Add it to AUTHENTICATION_BACKENDS in settings.py',
        'Change the login label to "Username or email"',
        'Test logging in with asha@example.com',
      ],
      code: `# accounts/backends.py
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrUsernameBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        try:
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            User().set_password(password)   # run hasher anyway to reduce timing attacks
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None


# portal/settings.py
AUTHENTICATION_BACKENDS = [
    "accounts.backends.EmailOrUsernameBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# Manual login function view (alternative to LoginView)
from django.contrib.auth import authenticate, login

def login_view(request):
    error = None
    if request.method == "POST":
        user = authenticate(request,
                            username=request.POST["username"],
                            password=request.POST["password"])
        if user:
            login(request, user)
            return redirect(request.GET.get("next") or "students:home")
        error = "Invalid credentials"
    return render(request, "registration/login.html", {"error": error})`,
      result: 'Logging in with "ASHA@example.com" and the correct password succeeds; a wrong password shows "Invalid credentials".',
      explanation: 'Django tries each backend in AUTHENTICATION_BACKENDS in order. The custom backend matches username OR email, case-insensitively.',
    },
    {
      title: 'Pure Python demo: salted password hashing like Django',
      scenario: 'See why the same password gives different hashes with different salts, and how checking works.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import hashlib, base64, hmac

def make_password(raw, salt, iterations=1000):
    dk = hashlib.pbkdf2_hmac("sha256", raw.encode(), salt.encode(), iterations)
    return f"pbkdf2_sha256\${iterations}\${salt}\${base64.b64encode(dk).decode()}"

def check_password(raw, encoded):
    algo, iterations, salt, _ = encoded.split("$")
    return hmac.compare_digest(make_password(raw, salt, int(iterations)), encoded)

h1 = make_password("S3cret!pass", "saltA")
h2 = make_password("S3cret!pass", "saltB")
print(h1 == h2)
print(h1.split("$")[:3])
print(check_password("S3cret!pass", h1))
print(check_password("wrong", h1))`,
      python: {
        files: {
          'main.py': `import hashlib, base64, hmac

def make_password(raw, salt, iterations=1000):
    dk = hashlib.pbkdf2_hmac("sha256", raw.encode(), salt.encode(), iterations)
    return f"pbkdf2_sha256\${iterations}\${salt}\${base64.b64encode(dk).decode()}"

def check_password(raw, encoded):
    algo, iterations, salt, _ = encoded.split("$")
    return hmac.compare_digest(make_password(raw, salt, int(iterations)), encoded)

h1 = make_password("S3cret!pass", "saltA")
h2 = make_password("S3cret!pass", "saltB")
print(h1 == h2)
print(h1.split("$")[:3])
print(check_password("S3cret!pass", h1))
print(check_password("wrong", h1))`,
        },
      },
      result: `False
['pbkdf2_sha256', '1000', 'saltA']
True
False`,
      explanation: 'Different salts produce different hashes for the same password, so identical passwords do not look identical in the database. Checking re-hashes the input with the stored salt and compares in constant time.',
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies identity (who you are). Authorization decides access (what you can do) using permissions and groups.', level: 'Easy' },
    { q: 'What does authenticate() return?', a: 'A User object if any backend accepts the credentials, otherwise None. It does not log the user in.', level: 'Easy' },
    { q: 'What does login() do internally?', a: 'Stores the user\'s id, backend path and a session auth hash in the session, cycles the session key to prevent fixation, updates last_login via the user_logged_in signal.', level: 'Hard' },
    { q: 'How do you protect a class-based view?', a: 'Inherit LoginRequiredMixin as the first (left-most) parent class.', level: 'Easy' },
    { q: 'How does Django store passwords?', a: 'As algorithm$iterations$salt$hash using PBKDF2-SHA256 by default (Argon2/bcrypt available). Raw passwords are never stored.', level: 'Medium' },
    { q: 'What is the purpose of the next parameter?', a: 'It stores the page the user originally requested so LoginView can redirect back after login. Django validates it is a safe same-host URL.', level: 'Medium' },
    { q: 'Why must logout be POST in Django 5?', a: 'GET requests should be safe; a GET logout could be triggered by an image tag or link on another site (CSRF). Django 5.0 removed GET support for LogoutView.', level: 'Medium' },
    { q: 'What is request.user for anonymous visitors?', a: 'An AnonymousUser instance with is_authenticated=False, id=None and no permissions.', level: 'Easy' },
    { q: 'What happens to sessions when a user changes the password?', a: 'Other sessions are invalidated because the session auth hash depends on the password. Use update_session_auth_hash(request, user) to keep the current session logged in.', level: 'Hard' },
    { q: 'What is AUTHENTICATION_BACKENDS?', a: 'A list of backend classes Django tries in order when authenticating. Default is ModelBackend; you can add email login, LDAP or social login backends.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add password change pages using built-in views.',
      hint: 'They are already in django.contrib.auth.urls; just add templates.',
      solution: `<!-- templates/registration/password_change_form.html -->
<form method="post">{% csrf_token %}{{ form.as_p }}<button>Change</button></form>

<!-- templates/registration/password_change_done.html -->
<p>Your password was changed.</p>
<!-- URL: {% url 'password_change' %} -->`,
    },
    {
      task: 'Redirect already logged-in users away from the login page.',
      hint: 'LoginView has redirect_authenticated_user.',
      solution: `from django.contrib.auth.views import LoginView

path("accounts/login/", LoginView.as_view(redirect_authenticated_user=True), name="login"),`,
    },
    {
      task: 'Show "Last login: <date>" on the dashboard template.',
      hint: 'Use user.last_login with the date filter.',
      solution: `<p>Last login: {{ user.last_login|date:"d M Y, H:i" }}</p>`,
    },
    {
      task: 'Create a superuser and a normal user from the terminal.',
      hint: 'createsuperuser and the shell.',
      solution: `python manage.py createsuperuser
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.create_user("ravi", "ravi@example.com", "Ravi@12345")`,
    },
  ],
  quiz: [
    { question: 'Which decorator protects a function view for logged-in users only?', options: ['@permission_required', '@csrf_exempt', '@require_POST', '@login_required'], answer: 3, explanation: '@login_required redirects anonymous users to LOGIN_URL.' },
    { question: 'Which form helps build a sign-up page?', options: ['UserCreationForm', 'AuthenticationForm', 'PasswordChangeForm', 'SetPasswordForm'], answer: 0, explanation: 'UserCreationForm validates username and two password fields.' },
    { question: 'In Django 5, logging out through LogoutView requires:', options: ['GET request', 'POST request', 'PUT request', 'Any method'], answer: 1, explanation: 'GET logout was removed in Django 5.0.' },
    { question: 'Where should the template for the built-in LoginView be?', options: ['templates/login.html', 'templates/auth/login.html', 'templates/registration/login.html', 'templates/accounts/login.html'], answer: 2, explanation: 'The default template_name is registration/login.html.' },
    { question: 'user.is_authenticated for a visitor who is not logged in is:', options: ['None', 'Error', 'True', 'False'], answer: 3, explanation: 'AnonymousUser.is_authenticated is always False.' },
  ],
};
