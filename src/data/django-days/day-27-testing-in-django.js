export default {
  id: 'day-27-testing-in-django',
  title: 'Testing in Django',
  module: 'Module 5: Advanced Django',
  day: 27,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Write automated tests for the Student Portal: model tests, form tests, view tests with the test Client, authentication and permission tests, email and management command tests, plus coverage and pytest-django.',
  objectives: [
    'Understand why testing matters and the types of tests (unit, integration, functional)',
    'Use django.test.TestCase, setUpTestData and the test database',
    'Test models, forms, views, templates, redirects and permissions with Client',
    'Test emails (mail.outbox), commands (call_command) and signals',
    'Measure coverage and run tests in VS Code, PyCharm and with pytest-django',
  ],
  theory: [
    {
      heading: 'Why write tests?',
      content: 'A test is code that checks other code automatically. Instead of clicking through 20 pages after every change, you run python manage.py test and in seconds you know if something broke. Tests are like a safety net under a trapeze artist: you can try new moves (refactor, upgrade Django) without fear. Interviewers expect you to know testing basics.',
      points: [
        'Unit test: one small piece (a model method, a form clean method)',
        'Integration test: pieces working together (URL -> view -> template -> database)',
        'Functional / end-to-end: a real browser (Selenium, Playwright with LiveServerTestCase)',
        'Regression test: written for a fixed bug so it never returns',
      ],
    },
    {
      heading: 'Django test classes and the test database',
      content: 'python manage.py test finds files named test*.py, creates a separate empty test database (test_<name>), runs migrations, runs tests and destroys it. Your real data is never touched. django.test.TestCase wraps each test in a transaction and rolls it back, so tests are isolated and fast.',
      points: [
        'SimpleTestCase: no database access',
        'TestCase: database with rollback per test (most common)',
        'TransactionTestCase: real commits (needed to test transaction.on_commit, or use self.captureOnCommitCallbacks)',
        'LiveServerTestCase / StaticLiveServerTestCase: runs a live server for Selenium',
        'setUpTestData (classmethod): create data ONCE per class; setUp: runs before EVERY test',
      ],
    },
    {
      heading: 'The test Client',
      content: 'self.client acts like a browser without a network. It can GET and POST, follow redirects, log in and keep cookies. The response gives status_code, content, context (template variables) and templates used.',
      syntax: `response = self.client.get(reverse("students:list"))
self.assertEqual(response.status_code, 200)
self.assertContains(response, "Asha")
self.assertTemplateUsed(response, "students/student_list.html")
self.client.force_login(user)                       # skip password check
response = self.client.post(url, {"name": "Ravi"}, follow=True)
self.assertRedirects(response, "/students/")`,
    },
    {
      heading: 'Useful assertions and tools',
      content: 'Beyond assertEqual/assertTrue, Django adds web-aware assertions. Use them to keep tests short and readable.',
      points: [
        'assertContains / assertNotContains (checks status and text)',
        'assertRedirects, assertTemplateUsed, assertFormError(form, field, errors)',
        'assertNumQueries(n) to catch N+1 problems',
        'self.settings(...) or @override_settings to change settings in a test',
        'mail.outbox for emails, call_command for commands, RequestFactory for testing a view function directly',
        'factory_boy / model_bakery to create test objects quickly',
      ],
    },
    {
      heading: 'Coverage, pytest-django and good habits',
      content: 'coverage.py shows which lines your tests executed. pytest-django lets you write tests as simple functions with fixtures (client, admin_client, db). Follow the AAA pattern: Arrange (create data), Act (call the code), Assert (check the result). One behaviour per test, clear names like test_teacher_cannot_delete_student.',
      syntax: `pip install coverage pytest pytest-django
coverage run manage.py test
coverage report -m          # or: coverage html  -> htmlcov/index.html

# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = portal.settings
python_files = tests.py test_*.py`,
      tip: 'Common mistake: tests that depend on each other or on the order they run. Each test must create its own data.',
    },
  ],
  examples: [
    {
      title: 'Model and form tests',
      scenario: 'Test the Student model (string, absolute URL, unique roll number) and StudentForm validation (roll must start with STU).',
      steps: [
        'Delete students/tests.py and create a package students/tests/ with __init__.py',
        'Create students/tests/test_models.py and test_forms.py',
        'VS Code: Testing panel > Configure Python Tests > unittest or pytest; or run python manage.py test students',
        'PyCharm: right-click the tests folder > Run \'Tests in tests\' (choose Django tests run configuration)',
        'Read the dots: . = pass, F = fail, E = error',
      ],
      code: `# students/tests/__init__.py   (empty)

# students/tests/test_models.py
from django.db import IntegrityError
from django.test import TestCase
from students.models import Course, Student


class StudentModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = Course.objects.create(name="BCA")
        cls.student = Student.objects.create(name="Asha", roll_no="STU101",
                                             email="asha@example.com", course=cls.course)

    def test_str_returns_name(self):
        self.assertEqual(str(self.student), "Asha")

    def test_get_absolute_url(self):
        self.assertEqual(self.student.get_absolute_url(), f"/students/{self.student.pk}/")

    def test_roll_no_is_unique(self):
        with self.assertRaises(IntegrityError):
            Student.objects.create(name="Copy", roll_no="STU101", email="copy@example.com")

    def test_default_is_active(self):
        self.assertTrue(self.student.is_active)

    def test_course_related_name(self):
        self.assertIn(self.student, self.course.students.all())


# students/tests/test_forms.py
from django.test import TestCase
from students.forms import StudentForm
from students.models import Course


class StudentFormTests(TestCase):
    def setUp(self):
        self.course = Course.objects.create(name="BSc")
        self.data = {"name": "Ravi", "roll_no": "stu202", "email": "ravi@example.com",
                     "course": self.course.pk, "is_active": True}

    def test_valid_form_uppercases_roll(self):
        form = StudentForm(data=self.data)
        self.assertTrue(form.is_valid(), form.errors)
        self.assertEqual(form.cleaned_data["roll_no"], "STU202")

    def test_roll_must_start_with_stu(self):
        self.data["roll_no"] = "ABC1"
        form = StudentForm(data=self.data)
        self.assertFalse(form.is_valid())
        self.assertIn("Roll number must start with STU", form.errors["roll_no"])

    def test_email_required(self):
        self.data["email"] = ""
        self.assertFalse(StudentForm(data=self.data).is_valid())


# Terminal
python manage.py test students -v 2`,
      result: `Creating test database for alias 'default'...
Found 8 test(s).
test_course_related_name (students.tests.test_models.StudentModelTests...) ... ok
...
test_valid_form_uppercases_roll (students.tests.test_forms.StudentFormTests...) ... ok
----------------------------------------------------------------------
Ran 8 tests in 0.214s

OK
Destroying test database for alias 'default'...`,
      explanation: 'setUpTestData creates data once for the class (fast), and TestCase rolls back after each test. Form tests do not need the Client at all.',
    },
    {
      title: 'View, authentication and permission tests',
      scenario: 'Check that anonymous users are redirected, teachers get 403 on delete, office staff can create students, and the list page avoids N+1 queries.',
      steps: [
        'Create students/tests/test_views.py',
        'Create users with get_user_model() and add groups/permissions',
        'Use self.client.force_login() to act as each user',
        'Run python manage.py test students.tests.test_views',
      ],
      code: `# students/tests/test_views.py
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from students.models import Course, Student

User = get_user_model()


class StudentViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = Course.objects.create(name="BCA")
        for i in range(1, 13):
            Student.objects.create(name=f"Student {i}", roll_no=f"STU{i:03d}",
                                   email=f"s{i}@example.com", course=cls.course)
        cls.teacher = User.objects.create_user(email="teacher@portal.com", password="Pass@12345")
        cls.staff = User.objects.create_user(email="office@portal.com", password="Pass@12345")
        perms = Permission.objects.filter(codename__in=["add_student", "delete_student", "view_student"])
        cls.staff.user_permissions.add(*perms)

    def test_list_requires_login(self):
        url = reverse("students:list")
        response = self.client.get(url)
        self.assertRedirects(response, f"{reverse('login')}?next={url}")

    def test_list_paginates_and_uses_template(self):
        self.client.force_login(self.teacher)
        response = self.client.get(reverse("students:list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "students/student_list.html")
        self.assertTrue(response.context["is_paginated"])
        self.assertEqual(len(response.context["students"]), 10)

    def test_list_query_count(self):
        self.client.force_login(self.teacher)
        # session + user + count + page of students (with select_related course)
        with self.assertNumQueries(4):
            self.client.get(reverse("students:list"))

    def test_search_filters_results(self):
        self.client.force_login(self.teacher)
        response = self.client.get(reverse("students:list"), {"q": "Student 12"})
        self.assertContains(response, "Student 12")
        self.assertNotContains(response, "Student 11")

    def test_teacher_cannot_delete(self):
        self.client.force_login(self.teacher)
        student = Student.objects.first()
        response = self.client.post(reverse("students:delete", args=[student.pk]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Student.objects.filter(pk=student.pk).exists())

    def test_staff_can_create_student(self):
        self.client.force_login(self.staff)
        data = {"name": "New Kid", "roll_no": "stu900", "email": "new@example.com",
                "course": self.course.pk, "is_active": True}
        response = self.client.post(reverse("students:create"), data, follow=True)
        new = Student.objects.get(roll_no="STU900")
        self.assertRedirects(response, new.get_absolute_url())
        self.assertContains(response, "New Kid")

    def test_detail_404_for_missing_student(self):
        self.client.force_login(self.teacher)
        response = self.client.get(reverse("students:detail", args=[9999]))
        self.assertEqual(response.status_code, 404)`,
      result: `Found 7 test(s).
.......
----------------------------------------------------------------------
Ran 7 tests in 0.958s

OK`,
      explanation: 'force_login skips password hashing so tests are faster. assertNumQueries protects against someone removing select_related later. Permission tests check both the status code and that the data was not changed.',
    },
    {
      title: 'Testing emails, signals, commands and middleware; coverage',
      scenario: 'Verify that signup sends a welcome email, that the audit signal fires, that the fee command works in dry-run mode, and that the timing header is added.',
      steps: [
        'Create students/tests/test_integrations.py',
        'Use mail.outbox, call_command with StringIO and captureOnCommitCallbacks',
        'Install coverage: pip install coverage',
        'Run coverage run manage.py test then coverage report -m (VS Code terminal or PyCharm Run with Coverage button)',
      ],
      code: `# students/tests/test_integrations.py
from datetime import timedelta
from io import StringIO

from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from students.models import AuditLog, Course, FeeDue, Student


class SignupEmailTests(TestCase):
    def test_signup_sends_welcome_email(self):
        data = {"email": "asha@example.com", "first_name": "Asha", "last_name": "K",
                "phone": "", "password1": "VeryStrong#2026", "password2": "VeryStrong#2026"}
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(reverse("signup"), data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Welcome to Student Portal")
        self.assertEqual(mail.outbox[0].to, ["asha@example.com"])


class SignalTests(TestCase):
    def test_student_create_writes_audit_log(self):
        Student.objects.create(name="Kiran", roll_no="STU105", email="kiran@example.com")
        self.assertTrue(AuditLog.objects.filter(action="student_created", detail="STU105 Kiran").exists())


class FeeCommandTests(TestCase):
    def test_dry_run_lists_without_sending(self):
        s = Student.objects.create(name="Asha", roll_no="STU101", email="asha@example.com",
                                   course=Course.objects.create(name="BCA"))
        FeeDue.objects.create(student=s, amount=15000, due_date=timezone.localdate() + timedelta(days=2))
        out = StringIO()
        call_command("send_fee_reminders", days=3, dry_run=True, stdout=out)
        self.assertIn("[dry-run] STU101", out.getvalue())
        self.assertIn("1 reminder(s) processed", out.getvalue())
        self.assertEqual(len(mail.outbox), 0)


class MiddlewareTests(TestCase):
    def test_response_time_header(self):
        response = self.client.get(reverse("login"))
        self.assertIn("X-Response-Time", response.headers)

    @override_settings(MAINTENANCE_MODE=True)
    def test_maintenance_mode_returns_503(self):
        response = self.client.get(reverse("login"))
        self.assertEqual(response.status_code, 503)


# pytest-django style (optional) - students/tests/test_pytest_style.py
import pytest

@pytest.mark.django_db
def test_home_page_for_admin(admin_client):
    response = admin_client.get("/")
    assert response.status_code == 200

# Terminal
coverage run --source="." manage.py test
coverage report -m
coverage html        # open htmlcov/index.html`,
      result: `Name                                   Stmts   Miss  Cover   Missing
--------------------------------------------------------------------
students/views.py                        142     11    92%   88-91, 160-166
students/signals.py                       28      0   100%
students/management/commands/send_fee_reminders.py   34   4    88%   31-33, 45
--------------------------------------------------------------------
TOTAL                                    612     41    93%`,
      explanation: 'Django swaps in the locmem email backend during tests, so mail.outbox collects messages. captureOnCommitCallbacks runs on_commit callbacks inside TestCase. Coverage shows untested lines to target next.',
    },
    {
      title: 'Pure Python demo: unittest basics and the AAA pattern',
      scenario: 'Practise unittest (which Django TestCase extends) on a plain grade function.',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import io
import unittest

def grade(marks):
    if not 0 <= marks <= 100:
        raise ValueError("marks must be 0-100")
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 40:
        return "C"
    return "F"

class GradeTests(unittest.TestCase):
    def test_a_grade(self):
        marks = 95                        # Arrange
        result = grade(marks)             # Act
        self.assertEqual(result, "A")     # Assert

    def test_boundaries(self):
        self.assertEqual(grade(75), "B")
        self.assertEqual(grade(40), "C")
        self.assertEqual(grade(39), "F")

    def test_invalid_marks(self):
        with self.assertRaises(ValueError):
            grade(120)

    def test_wrong_expectation(self):
        self.assertEqual(grade(89), "A")   # deliberate failing test

suite = unittest.defaultTestLoader.loadTestsFromTestCase(GradeTests)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("Ran:", result.testsRun)
print("Failures:", [t.id().split(".")[-1] for t, _ in result.failures])
print("Successful:", result.wasSuccessful())`,
      python: {
        files: {
          'main.py': `import io
import unittest

def grade(marks):
    if not 0 <= marks <= 100:
        raise ValueError("marks must be 0-100")
    if marks >= 90:
        return "A"
    if marks >= 75:
        return "B"
    if marks >= 40:
        return "C"
    return "F"

class GradeTests(unittest.TestCase):
    def test_a_grade(self):
        marks = 95                        # Arrange
        result = grade(marks)             # Act
        self.assertEqual(result, "A")     # Assert

    def test_boundaries(self):
        self.assertEqual(grade(75), "B")
        self.assertEqual(grade(40), "C")
        self.assertEqual(grade(39), "F")

    def test_invalid_marks(self):
        with self.assertRaises(ValueError):
            grade(120)

    def test_wrong_expectation(self):
        self.assertEqual(grade(89), "A")   # deliberate failing test

suite = unittest.defaultTestLoader.loadTestsFromTestCase(GradeTests)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print("Ran:", result.testsRun)
print("Failures:", [t.id().split(".")[-1] for t, _ in result.failures])
print("Successful:", result.wasSuccessful())`,
        },
      },
      result: `Ran: 4
Failures: ['test_wrong_expectation']
Successful: False`,
      explanation: 'Each method starting with test_ is one test. 89 is a "B", so the deliberate wrong test fails, showing how a failure is reported. Django\'s TestCase adds a database and the test client on top of this.',
    },
  ],
  interview: [
    { q: 'How do you run tests in Django?', a: 'python manage.py test (all apps), python manage.py test students (one app), or a dotted path to a module, class or method.', level: 'Easy' },
    { q: 'Does Django use the real database for tests?', a: 'No. It creates a separate test database (prefix test_), applies migrations, and destroys it afterwards. Use --keepdb to reuse it.', level: 'Easy' },
    { q: 'TestCase vs TransactionTestCase vs SimpleTestCase?', a: 'SimpleTestCase has no DB. TestCase wraps each test in a transaction and rolls back (fast). TransactionTestCase truncates tables and allows real commits (slower, needed for some transaction behaviour).', level: 'Medium' },
    { q: 'setUp vs setUpTestData?', a: 'setUp runs before every test method; setUpTestData is a classmethod that runs once per TestCase class, making tests faster. Objects are restored per test via transactions.', level: 'Medium' },
    { q: 'What is the Django test Client?', a: 'A dummy browser to make GET/POST requests to your views, follow redirects, log in and inspect response context and templates.', level: 'Easy' },
    { q: 'login() vs force_login() in tests?', a: 'client.login() checks credentials through backends (slower, needs the raw password); force_login() logs the user in directly.', level: 'Medium' },
    { q: 'How do you test emails?', a: 'The test runner uses the locmem backend; assert on django.core.mail.outbox (length, subject, to, body).', level: 'Easy' },
    { q: 'How do you catch N+1 queries in tests?', a: 'Wrap the request in self.assertNumQueries(n).', level: 'Hard' },
    { q: 'What is RequestFactory?', a: 'Creates request objects to call a view function directly without middleware or URL routing; you must set request.user yourself.', level: 'Medium' },
    { q: 'What is code coverage?', a: 'The percentage of code lines (or branches) executed by tests, measured with coverage.py. High coverage does not guarantee good tests but low coverage shows untested code.', level: 'Easy' },
    { q: 'What is mocking and when do you use it?', a: 'Replacing a dependency with a fake object (unittest.mock.patch) to avoid real SMTP, payment or HTTP calls and to simulate errors.', level: 'Hard' },
    { q: 'Why might a test using transaction.on_commit not run the callback?', a: 'TestCase never commits, so callbacks do not fire; use self.captureOnCommitCallbacks(execute=True) or TransactionTestCase.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a test that the home page returns 200 and contains "Student Portal" for a logged-in user.',
      hint: 'force_login then assertContains.',
      solution: `class HomeTests(TestCase):
    def test_home(self):
        user = get_user_model().objects.create_user(email="a@a.com", password="x")
        self.client.force_login(user)
        self.assertContains(self.client.get("/"), "Student Portal")`,
    },
    {
      task: 'Test that posting an invalid roll number shows a form error.',
      hint: 'assertFormError(response.context["form"], field, message).',
      solution: `def test_invalid_roll(self):
    self.client.force_login(self.staff)
    r = self.client.post(reverse("students:create"), {"name": "X", "roll_no": "1", "email": "x@x.com"})
    self.assertEqual(r.status_code, 200)
    self.assertFormError(r.context["form"], "roll_no", "Roll number must start with STU")`,
    },
    {
      task: 'Mock send_mail so a test can check it was called once.',
      hint: 'unittest.mock.patch the name where it is used.',
      solution: `from unittest.mock import patch

@patch("students.management.commands.send_fee_reminders.send_mail")
def test_sends(self, mock_send):
    ... create FeeDue ...
    call_command("send_fee_reminders", days=3, stdout=StringIO())
    mock_send.assert_called_once()`,
    },
    {
      task: 'Run only one test method from the terminal.',
      hint: 'Use the dotted path.',
      solution: `python manage.py test students.tests.test_views.StudentViewTests.test_teacher_cannot_delete`,
    },
    {
      task: 'Test a signal-free bulk update does not create audit logs (regression test).',
      hint: 'Use queryset.update and assert count unchanged.',
      solution: `def test_bulk_update_no_audit(self):
    Student.objects.create(name="A", roll_no="STU1", email="a@x.com")
    before = AuditLog.objects.count()
    Student.objects.update(is_active=False)
    self.assertEqual(AuditLog.objects.count(), before)`,
    },
  ],
  quiz: [
    { question: 'Which command runs Django tests?', options: ['python manage.py check', 'python manage.py runtests', 'python manage.py test', 'python -m django tests'], answer: 2, explanation: 'manage.py test discovers and runs tests.' },
    { question: 'Which method creates data once for the whole TestCase class?', options: ['setUpTestData', 'setUp', 'tearDown', '__init__'], answer: 0, explanation: 'setUpTestData is a classmethod run once per class.' },
    { question: 'Where are emails stored during tests?', options: ['The console', 'A file', 'settings.OUTBOX', 'django.core.mail.outbox'], answer: 3, explanation: 'The locmem backend appends to mail.outbox.' },
    { question: 'Which assertion checks the number of SQL queries?', options: ['assertQueries', 'assertNumQueries', 'assertSQL', 'assertDBHits'], answer: 1, explanation: 'assertNumQueries(n) is a context manager on TestCase.' },
    { question: 'Logging in a user in a test without checking the password:', options: ['client.login()', 'authenticate()', 'client.force_login(user)', 'request.user = user'], answer: 2, explanation: 'force_login bypasses authentication backends.' },
  ],
};
