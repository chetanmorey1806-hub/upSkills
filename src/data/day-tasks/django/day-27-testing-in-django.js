export default {
  lesson: 'day-27-testing-in-django',
  minutes: 35,
  intro: 'Practise TestCase, setUpTestData, the test Client, assertions, mail.outbox and coverage, and write unittest tests that catch real bugs.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where do Django tests write their data?',
      options: ['Into your real development database', 'Into a separate test database created for the run (each TestCase test is rolled back)', 'Into a JSON file', 'Nowhere, tests cannot use the database'],
      answer: 1,
      explain: '`python manage.py test` creates `test_<dbname>`, runs migrations and destroys it at the end. `django.test.TestCase` wraps each test in a transaction that is rolled back, so tests never see each other\'s data.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the assertion that the student list page loads and contains "Asha":\n\n```\nresponse = self.client.get(reverse(\'student-list\'))\nself.assertEqual(response.status_code, 200)\n______(response, \'Asha\')\n```',
      accept: ['self.assertContains'],
      caseSensitive: true,
      explain: '`assertContains(response, text)` checks status 200 **and** that the text appears in the HTML. Related helpers: `assertNotContains`, `assertTemplateUsed`, `assertRedirects`, `assertFormError`, `assertNumQueries`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'setUpTestData (classmethod) creates data once per TestCase class - faster than setUp for every test',
        'self.client.force_login(user) logs in without going through the login form',
        'Emails sent during tests are collected in django.core.mail.outbox',
        'call_command("send_fee_reminders", "--dry-run") runs a management command inside a test',
        '100% coverage means the code has no bugs',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Coverage only says which lines **ran**, not that the assertions were meaningful. The rest are everyday tools: `setUpTestData`, `force_login`, `mail.outbox`, `call_command`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: 'Write a `unittest.TestCase` subclass named `FeeTests` with **at least 4** test methods for `calculate_fee(base, scholarship_percent, late_days)` (given). Rules: scholarship reduces the base; late fine is ₹50 per day, **max ₹500**; result is an int.\n\nThen write `run()` that runs `FeeTests` with `unittest` and returns `(tests_run, failures + errors)`.\n\nThe checker also runs your tests against **two buggy versions** - each must be caught by at least one test.',
      example: { title: 'unittest basics', code: "import unittest\n\nclass MathTests(unittest.TestCase):\n    def test_add(self):\n        self.assertEqual(add(2, 3), 5)\n\nsuite = unittest.defaultTestLoader.loadTestsFromTestCase(MathTests)\nresult = unittest.TextTestRunner(stream=io.StringIO()).run(suite)" },
      starter: `import io, unittest

def calculate_fee(base, scholarship_percent=0, late_days=0):
    fee = base - base * scholarship_percent // 100
    fine = min(late_days * 50, 500)
    return fee + fine

# TODO: class FeeTests(unittest.TestCase) with 4+ tests

def run():
    # TODO
    return (0, 0)
`,
      solution: `import io, unittest

def calculate_fee(base, scholarship_percent=0, late_days=0):
    fee = base - base * scholarship_percent // 100
    fine = min(late_days * 50, 500)
    return fee + fine

class FeeTests(unittest.TestCase):
    def test_no_discount_no_fine(self):
        self.assertEqual(calculate_fee(50000), 50000)

    def test_scholarship(self):
        self.assertEqual(calculate_fee(50000, 20), 40000)

    def test_late_fine(self):
        self.assertEqual(calculate_fee(10000, 0, 3), 10150)

    def test_fine_is_capped(self):
        self.assertEqual(calculate_fee(10000, 0, 30), 10500)

    def test_combined(self):
        self.assertEqual(calculate_fee(20000, 50, 2), 10100)

def run():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(FeeTests)
    result = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
    return (result.testsRun, len(result.failures) + len(result.errors))
`,
      tests: [
        { call: 'run()[0] >= 4', expect: true, msg: 'Write at least 4 test methods (names starting with test_)' },
        { call: 'run()[1]', expect: 0, msg: 'All your tests must pass for the correct calculate_fee()' },
        { call: "(lambda g: (globals().__setitem__('calculate_fee', lambda base, s=0, late=0: base - base * s // 100 + late * 50), run()[1] > 0, globals().__setitem__('calculate_fee', g))[1])(calculate_fee)", expect: true, msg: 'Your tests must catch a bug where the late fine is not capped at 500' },
        { call: "(lambda g: (globals().__setitem__('calculate_fee', lambda base, s=0, late=0: base + min(late * 50, 500)), run()[1] > 0, globals().__setitem__('calculate_fee', g))[1])(calculate_fee)", expect: true, msg: 'Your tests must catch a bug where the scholarship is ignored' },
      ],
      explain: 'Good tests cover each **rule** and its edge (the 500 cap) - one happy-path test would miss both bugs. Django\'s `TestCase` is a subclass of `unittest.TestCase`, so the same `assertEqual` style applies; `manage.py test` discovers `test*.py` files and `test_*` methods.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project; this file is the ROOT_URLCONF)',
      code: `from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.test import Client
from django.urls import path

def home(request):
    return HttpResponse('<h1>Student Portal</h1>')

def api_students(request):
    return JsonResponse({'count': 2, 'city': request.GET.get('city', 'all')})

def old(request):
    return redirect('/')

urlpatterns = [path('', home), path('api/students/', api_students), path('old/', old)]

c = Client()
r = c.get('/')
print(r.status_code, b'Student Portal' in r.content)
print(c.get('/api/students/', {'city': 'Pune'}).json())
r = c.get('/old/')
print(r.status_code, r.url)
print(c.get('/old/', follow=True).redirect_chain)
print(c.get('/missing/').status_code)`,
      expected: "200 True\n{'count': 2, 'city': 'Pune'}\n302 /\n[('/', 302)]\n404",
      explain: 'The test `Client` sends real requests through URLconf, middleware and views (no server needed). A dict as the second argument of `get()` becomes the query string. Redirects are not followed unless `follow=True`, which records `redirect_chain`. Unknown URLs give 404.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write `coverage_report(executed, total_lines)` like `coverage report`. `executed` is a dict `{file: set_of_line_numbers_run}` and `total_lines` is `{file: number_of_statements}` (statements are numbered 1..n). Return a list of `(file, percent, missing)` sorted by file, where percent is an int (rounded down) and `missing` is the sorted list of line numbers never run. Files never executed count as 0%.',
      example: { title: 'missing numbers', code: "ran = {1, 2, 4}\nprint(sorted(set(range(1, 6)) - ran))   # [3, 5]" },
      starter: `def coverage_report(executed, total_lines):
    # TODO
    return []
`,
      solution: `def coverage_report(executed, total_lines):
    report = []
    for f in sorted(total_lines):
        n = total_lines[f]
        ran = executed.get(f, set()) & set(range(1, n + 1))
        missing = sorted(set(range(1, n + 1)) - ran)
        percent = (len(ran) * 100) // n if n else 100
        report.append((f, percent, missing))
    return report
`,
      tests: [
        { call: "coverage_report({'students/views.py': {1, 2, 3, 5}, 'students/models.py': {1, 2}}, {'students/views.py': 6, 'students/models.py': 2, 'students/forms.py': 3})", expect: [['students/forms.py', 0, [1, 2, 3]], ['students/models.py', 100, []], ['students/views.py', 66, [4, 6]]] },
        { call: "coverage_report({}, {})", expect: [] },
      ],
      explain: 'Coverage tells you which lines your tests never execute (here `views.py` lines 4 and 6 - maybe the error branch). Run `coverage run manage.py test` then `coverage report -m`. Aim for good coverage of business logic, not a vanity 100%.',
    },
  ],
};
