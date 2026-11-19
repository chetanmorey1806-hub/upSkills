export default {
  lesson: 'day-03-django-apps-and-settings',
  minutes: 25,
  intro: 'Practise startapp, INSTALLED_APPS, AppConfig, the key settings and include(), and write the settings checks and URL include logic in plain Python.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Write the command that creates a new app called `students` inside the project:',
      accept: ['python manage.py startapp students', 'py manage.py startapp students', 'python3 manage.py startapp students', 'django-admin startapp students'],
      explain: '`python manage.py startapp students` creates `models.py`, `views.py`, `admin.py`, `apps.py`, `tests.py` and a `migrations/` folder. Django will ignore the app until you add it to `INSTALLED_APPS`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You wrote models in the new `students` app but `makemigrations` says "No changes detected". What is the most likely cause?',
      options: ['MySQL is not installed', "'students' (or 'students.apps.StudentsConfig') is missing from INSTALLED_APPS", 'DEBUG is False', 'The app needs a urls.py first'],
      answer: 1,
      explain: 'Django only looks at apps listed in **INSTALLED_APPS** for models, migrations, templates, admin and static files. Add `\'students\'` or the explicit `\'students.apps.StudentsConfig\'`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about settings.py are TRUE? (choose all that apply)',
      options: [
        'With DEBUG = False, ALLOWED_HOSTS must list the domains the site is served on',
        'TIME_ZONE = "Asia/Kolkata" sets the local time zone for India',
        'MIDDLEWARE order matters',
        'DEBUG = True is fine in production because it shows helpful errors',
        'DATABASES["default"] decides which database the ORM uses',
      ],
      answers: [0, 1, 2, 4],
      explain: 'DEBUG=True leaks code, settings and SQL in error pages - never in production. With DEBUG=False Django refuses requests whose Host is not in ALLOWED_HOSTS (400 Bad Request). Middleware runs in order (security → sessions → CSRF → auth...).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The project urls.py includes the app\'s URLs. What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `from django.urls import path, include, reverse, resolve
from django.http import HttpResponse

def student_list(request):
    return HttpResponse('list')

def student_detail(request, pk):
    return HttpResponse('detail')

students_urls = ([
    path('', student_list, name='list'),
    path('<int:pk>/', student_detail, name='detail'),
], 'students')

urlpatterns = [
    path('students/', include(students_urls)),
]

print(reverse('students:list'))
print(reverse('students:detail', args=[7]))
match = resolve('/students/7/')
print(match.view_name, match.kwargs)`,
      expected: "/students/\n/students/7/\nstudents:detail {'pk': 7}",
      explain: '`include()` mounts the app\'s patterns under the `students/` prefix. The `app_name` ("students") creates a namespace, so names become `students:list` and `students:detail`. `resolve` is the reverse of `reverse`: URL → view + captured kwargs.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write `check_settings(s)` - a mini `manage.py check --deploy`. `s` is a dict of settings. Return a list of warning codes (in this order):\n- `\'DEBUG\'` if `s[\'DEBUG\']` is True\n- `\'ALLOWED_HOSTS\'` if `DEBUG` is False and `ALLOWED_HOSTS` is empty or contains `\'*\'`\n- `\'SECRET_KEY\'` if the key is shorter than 50 characters or starts with `\'django-insecure-\'`\n- `\'APP:<name>\'` for every name in `s[\'LOCAL_APPS\']` that is not in `s[\'INSTALLED_APPS\']` (an entry like `\'students.apps.StudentsConfig\'` counts as `students`)',
      example: { title: 'first part of a dotted path', code: "print('students.apps.StudentsConfig'.split('.')[0])   # students" },
      starter: `def check_settings(s):
    warnings = []
    # TODO
    return warnings
`,
      solution: `def check_settings(s):
    warnings = []
    if s.get('DEBUG'):
        warnings.append('DEBUG')
    hosts = s.get('ALLOWED_HOSTS', [])
    if not s.get('DEBUG') and (not hosts or '*' in hosts):
        warnings.append('ALLOWED_HOSTS')
    key = s.get('SECRET_KEY', '')
    if len(key) < 50 or key.startswith('django-insecure-'):
        warnings.append('SECRET_KEY')
    installed = {a.split('.')[0] for a in s.get('INSTALLED_APPS', [])}
    for app in s.get('LOCAL_APPS', []):
        if app not in installed:
            warnings.append(f'APP:{app}')
    return warnings
`,
      tests: [
        { call: "check_settings({'DEBUG': False, 'ALLOWED_HOSTS': ['studentportal.in'], 'SECRET_KEY': 'k' * 60, 'INSTALLED_APPS': ['django.contrib.admin', 'students.apps.StudentsConfig'], 'LOCAL_APPS': ['students']})", expect: [] },
        { call: "check_settings({'DEBUG': True, 'ALLOWED_HOSTS': [], 'SECRET_KEY': 'django-insecure-' + 'x' * 50, 'INSTALLED_APPS': ['django.contrib.admin'], 'LOCAL_APPS': ['students', 'fees']})", expect: ['DEBUG', 'SECRET_KEY', 'APP:students', 'APP:fees'] },
        { call: "check_settings({'DEBUG': False, 'ALLOWED_HOSTS': ['*'], 'SECRET_KEY': 'short', 'INSTALLED_APPS': ['fees'], 'LOCAL_APPS': ['fees']})", expect: ['ALLOWED_HOSTS', 'SECRET_KEY'] },
      ],
      explain: 'These are exactly the mistakes `python manage.py check --deploy` reports. The generated key starts with `django-insecure-` as a reminder to replace it in production. Forgetting an app in INSTALLED_APPS silently hides its models, templates and admin.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `flatten_urls(project_urls)` that expands `include()`. `project_urls` is a list of `(prefix, target)` where `target` is either a view name (string) or a list of app patterns `(route, view_name)`. Return a list of `(full_route, view_name)` in order.',
      example: { title: 'checking the type', code: "for x in ['a', ['b', 'c']]:\n    print(isinstance(x, list))   # False, True" },
      starter: `def flatten_urls(project_urls):
    # TODO
    return []
`,
      solution: `def flatten_urls(project_urls):
    result = []
    for prefix, target in project_urls:
        if isinstance(target, list):
            for route, view in target:
                result.append((prefix + route, view))
        else:
            result.append((prefix, target))
    return result
`,
      tests: [
        { call: "flatten_urls([('admin/', 'admin_site'), ('students/', [('', 'student_list'), ('<int:pk>/', 'student_detail')]), ('', 'home')])", expect: [['admin/', 'admin_site'], ['students/', 'student_list'], ['students/<int:pk>/', 'student_detail'], ['', 'home']] },
        { call: "flatten_urls([('fees/', [('pay/', 'pay_fee')])])", expect: [['fees/pay/', 'pay_fee']] },
      ],
      explain: '`include()` simply prefixes each of the app\'s routes with the project route. That is why the app\'s `urls.py` uses short routes like `\'<int:pk>/\'` - the app does not need to know where it is mounted, which makes it reusable.',
    },
  ],
};
