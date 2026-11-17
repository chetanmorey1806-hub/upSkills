export default {
  id: 'day-26-emails-management-commands',
  title: 'Sending Emails, Custom Management Commands',
  module: 'Module 5: Advanced Django',
  day: 26,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Send welcome mails, HTML result mails with attachments and password-reset mails from the Student Portal using Django\'s email API and SMTP, then automate routine jobs (reminders, seeding, cleanup) with custom manage.py commands.',
  objectives: [
    'Configure email backends: console for development and SMTP (Gmail, SendGrid, etc.) for production',
    'Use send_mail, send_mass_mail, EmailMessage and EmailMultiAlternatives with templates',
    'Set up the built-in password reset flow',
    'Write custom management commands with arguments and options',
    'Schedule commands with cron / Task Scheduler and understand when to use Celery',
  ],
  theory: [
    {
      heading: 'Email backends',
      content: 'Django sends mail through a backend chosen in EMAIL_BACKEND. In development use the console backend: emails are printed in the terminal, so you never spam real people. In production use the SMTP backend with credentials from environment variables. In tests Django automatically uses the locmem backend and stores mails in django.core.mail.outbox.',
      syntax: `# development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# production (SMTP)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")   # Gmail: App Password, not your normal password
DEFAULT_FROM_EMAIL = "Student Portal <no-reply@portal.com>"`,
    },
    {
      heading: 'Email APIs',
      content: 'send_mail() is the quick way for one message. send_mass_mail() sends many messages over one connection. EmailMessage gives full control: cc, bcc, reply_to, headers and attachments. EmailMultiAlternatives sends both plain text and HTML versions; clients that cannot show HTML fall back to text.',
      points: [
        'send_mail(subject, message, from_email, recipient_list, html_message=None, fail_silently=False)',
        'render_to_string("emails/welcome.html", context) builds the HTML from a template',
        'strip_tags(html) gives a quick plain-text version',
        'mail_admins() sends to settings.ADMINS (also used for error reports)',
      ],
    },
    {
      heading: 'Password reset flow',
      content: 'django.contrib.auth.urls already includes password_reset/, password_reset/done/, reset/<uidb64>/<token>/ and reset/done/. The user enters their email, Django sends a one-time link with a token (based on SECRET_KEY, the user\'s password hash and last_login), and the link expires after PASSWORD_RESET_TIMEOUT seconds (default 3 days). You only provide templates.',
      tip: 'For security, password_reset/ shows the same "email sent" page whether or not the email exists, so attackers cannot discover registered emails.',
    },
    {
      heading: 'Custom management commands',
      content: 'manage.py commands like migrate and runserver are classes. You can add your own by creating <app>/management/commands/<name>.py with a Command class that inherits BaseCommand and implements handle(). Use them for jobs that run outside a web request: sending daily reminders, importing CSVs, cleaning old data, creating demo data.',
      syntax: `students/
└── management/
    ├── __init__.py
    └── commands/
        ├── __init__.py
        └── send_fee_reminders.py   ->  python manage.py send_fee_reminders`,
      points: [
        'add_arguments(self, parser) uses argparse: positional and --optional arguments',
        'self.stdout.write(self.style.SUCCESS("...")) for coloured output',
        'raise CommandError("...") for clean failures (non-zero exit code)',
        'call_command("send_fee_reminders", dry_run=True) runs it from code or tests',
      ],
    },
    {
      heading: 'Scheduling and background jobs',
      content: 'Commands are run by a scheduler: cron on Linux, Task Scheduler on Windows, or Render/Heroku cron jobs. Sending email inside a view slows the response and can fail if SMTP is down; for heavy traffic use a task queue (Celery + Redis, Django 6 tasks, or django-q2) and call the email function in the background.',
      syntax: `# crontab -e   (every day at 8:00)
0 8 * * * cd /srv/student_portal && /srv/student_portal/venv/bin/python manage.py send_fee_reminders >> /var/log/portal_cron.log 2>&1`,
    },
  ],
  examples: [
    {
      title: 'Welcome email with HTML template on signup',
      scenario: 'When a student signs up, send a welcome email with an HTML layout and a plain-text fallback.',
      steps: [
        'Add the console email backend to settings.py for development',
        'Create templates/emails/welcome.html and welcome.txt',
        'Create accounts/emails.py with send_welcome_email()',
        'Call it from SignUpView.form_valid() after the user is saved, using transaction.on_commit',
        'Sign up in the browser and look at the VS Code / PyCharm Run terminal to see the printed email',
      ],
      code: `# portal/settings.py
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = "Student Portal <no-reply@portal.com>"
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000")

<!-- templates/emails/welcome.html -->
<h2 style="color:#2b6cb0">Welcome to Student Portal, {{ user.first_name|default:user.email }}!</h2>
<p>Your account has been created. You can now log in and view your courses and results.</p>
<p><a href="{{ login_url }}">Log in now</a></p>

<!-- templates/emails/welcome.txt -->
Welcome to Student Portal, {{ user.first_name|default:user.email }}!
Log in here: {{ login_url }}

# accounts/emails.py
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.urls import reverse


def send_welcome_email(user):
    context = {"user": user, "login_url": settings.SITE_URL + reverse("login")}
    subject = "Welcome to Student Portal"
    text_body = render_to_string("emails/welcome.txt", context)
    html_body = render_to_string("emails/welcome.html", context)
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [user.email],
                                 reply_to=["office@portal.com"])
    msg.attach_alternative(html_body, "text/html")
    msg.send()


# accounts/views.py
from django.db import transaction
from .emails import send_welcome_email


class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    template_name = "accounts/signup.html"
    success_url = reverse_lazy("students:home")

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.object
        transaction.on_commit(lambda: send_welcome_email(user))   # send only if the DB commit succeeds
        login(self.request, user, backend="django.contrib.auth.backends.ModelBackend")
        return response`,
      result: `Content-Type: multipart/alternative; boundary="===============..."
MIME-Version: 1.0
Subject: Welcome to Student Portal
From: Student Portal <no-reply@portal.com>
To: asha@example.com
Reply-To: office@portal.com
...
Welcome to Student Portal, Asha!
Log in here: http://127.0.0.1:8000/accounts/login/`,
      explanation: 'The console backend prints the full MIME message. Switching to real SMTP needs only settings changes, no code changes.',
    },
    {
      title: 'Result email with PDF attachment and password reset templates',
      scenario: 'Office staff email a student their marksheet PDF; students can reset forgotten passwords by email.',
      steps: [
        'Write send_result_email() using EmailMessage with attach()',
        'Create the four password reset templates under templates/registration/',
        'Set SMTP settings in .env for production (Gmail App Password or SendGrid API key)',
        'Test reset at /accounts/password_reset/',
      ],
      code: `# students/emails.py
from django.core.mail import EmailMessage


def send_result_email(student, pdf_bytes):
    email = EmailMessage(
        subject=f"Marksheet for {student.name} ({student.roll_no})",
        body=f"Dear {student.name},\\n\\nPlease find your marksheet attached.\\n\\nRegards,\\nExam Cell",
        to=[student.email],
        cc=["exam-cell@portal.com"],
        headers={"X-Portal-Type": "result"},
    )
    email.attach(f"{student.roll_no}_marksheet.pdf", pdf_bytes, "application/pdf")
    # or: email.attach_file(student.id_proof.path)
    sent = email.send(fail_silently=False)
    return sent   # 1 if sent


# Bulk reminder with one SMTP connection
from django.core.mail import send_mass_mail

def notify_course(course, text):
    messages = tuple(
        ("Course update: " + course.name, text, None, [s.email])
        for s in course.students.filter(is_active=True)
    )
    return send_mass_mail(messages, fail_silently=False)

<!-- templates/registration/password_reset_form.html -->
{% extends "base.html" %}
{% block content %}
<h2>Forgot password</h2>
<form method="post">{% csrf_token %}{{ form.as_p }}<button>Send reset link</button></form>
{% endblock %}

<!-- templates/registration/password_reset_email.html  (plain text email body) -->
Hi {{ user.get_full_name|default:user.email }},
Click the link to reset your Student Portal password:
{{ protocol }}://{{ domain }}{% url 'password_reset_confirm' uidb64=uid token=token %}
The link is valid for 3 days.

<!-- templates/registration/password_reset_done.html -->
<p>If an account exists for that email, we have sent a reset link.</p>

<!-- templates/registration/password_reset_confirm.html -->
{% if validlink %}
  <form method="post">{% csrf_token %}{{ form.as_p }}<button>Set new password</button></form>
{% else %}
  <p>The reset link is invalid or has already been used.</p>
{% endif %}

<!-- templates/registration/password_reset_complete.html -->
<p>Password changed. <a href="{% url 'login' %}">Log in</a></p>

# .env (production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxx`,
      result: 'send_result_email() returns 1 and the student receives "Marksheet for Asha (STU101)" with STU101_marksheet.pdf attached. The reset link looks like http://127.0.0.1:8000/accounts/reset/MQ/cb7x9k-3f2a.../ and works only once.',
      explanation: 'EmailMessage supports attachments, cc and custom headers. The reset token becomes invalid once the password changes because it includes the password hash.',
    },
    {
      title: 'Custom management command: fee reminders with options',
      scenario: 'Every morning, email students whose fee due date is within N days. Support --days, --dry-run and a course filter.',
      steps: [
        'Create folders students/management/commands/ with empty __init__.py files in both',
        'Add a FeeDue model (student, amount, due_date, paid) and migrate',
        'Create send_fee_reminders.py with the Command class',
        'VS Code terminal: python manage.py send_fee_reminders --days 3 --dry-run',
        'PyCharm: Tools > Run manage.py Task, type send_fee_reminders --days 3',
        'Schedule it with cron (Linux) or Task Scheduler (Windows)',
      ],
      code: `# students/models.py
class FeeDue(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="fees")
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    due_date = models.DateField()
    paid = models.BooleanField(default=False)
    reminder_sent = models.DateField(null=True, blank=True)


# students/management/commands/send_fee_reminders.py
from datetime import timedelta

from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from students.models import Course, FeeDue


class Command(BaseCommand):
    help = "Email students whose unpaid fee is due within the next N days."

    def add_arguments(self, parser):
        parser.add_argument("course", nargs="?", help="Optional course name to filter")
        parser.add_argument("--days", type=int, default=7, help="Look-ahead window in days (default 7)")
        parser.add_argument("--dry-run", action="store_true", help="Show who would be emailed without sending")

    def handle(self, *args, **options):
        days = options["days"]
        if days < 0:
            raise CommandError("--days must be zero or positive")

        today = timezone.localdate()
        dues = (FeeDue.objects.select_related("student")
                .filter(paid=False, due_date__range=(today, today + timedelta(days=days)))
                .exclude(reminder_sent=today))

        if options["course"]:
            if not Course.objects.filter(name__iexact=options["course"]).exists():
                raise CommandError(f'Course "{options["course"]}" does not exist')
            dues = dues.filter(student__course__name__iexact=options["course"])

        count = 0
        for due in dues:
            line = f"{due.student.roll_no} {due.student.email} Rs.{due.amount} due {due.due_date}"
            if options["dry_run"]:
                self.stdout.write(f"[dry-run] {line}")
            else:
                send_mail(
                    "Fee reminder - Student Portal",
                    f"Dear {due.student.name}, your fee of Rs.{due.amount} is due on {due.due_date}.",
                    None,
                    [due.student.email],
                )
                due.reminder_sent = today
                due.save(update_fields=["reminder_sent"])
                self.stdout.write(f"sent: {line}")
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Done. {count} reminder(s) processed."))


# Terminal
python manage.py help send_fee_reminders
python manage.py send_fee_reminders --days 3 --dry-run
python manage.py send_fee_reminders BCA --days 3

# Calling from code / tests
from django.core.management import call_command
call_command("send_fee_reminders", days=3, dry_run=True)

# Linux cron (daily 8 AM)
0 8 * * * cd /srv/student_portal && venv/bin/python manage.py send_fee_reminders >> /var/log/fees.log 2>&1`,
      result: `[dry-run] STU101 asha@example.com Rs.15000.00 due 2026-11-19
[dry-run] STU104 kiran@example.com Rs.12000.00 due 2026-11-20
Done. 2 reminder(s) processed.`,
      explanation: 'Options with dashes become underscores in options ("dry_run"). reminder_sent prevents sending twice on the same day if cron runs again. CommandError prints a clean message and exits with code 1.',
    },
    {
      title: 'Pure Python demo: how BaseCommand parses arguments',
      scenario: 'Django commands use argparse internally. Recreate a tiny version to understand add_arguments() and handle().',
      steps: [
        'Create main.py in VS Code or PyCharm',
        'Run python main.py',
      ],
      code: `import argparse

class BaseCommand:
    help = ""
    def add_arguments(self, parser):
        pass
    def run_from_argv(self, argv):
        parser = argparse.ArgumentParser(prog="manage.py " + argv[0], description=self.help)
        self.add_arguments(parser)
        options = vars(parser.parse_args(argv[1:]))
        self.handle(**options)

class Command(BaseCommand):
    help = "Send fee reminders"
    def add_arguments(self, parser):
        parser.add_argument("course", nargs="?")
        parser.add_argument("--days", type=int, default=7)
        parser.add_argument("--dry-run", action="store_true")
    def handle(self, **options):
        print(options)

Command().run_from_argv(["send_fee_reminders"])
Command().run_from_argv(["send_fee_reminders", "BCA", "--days", "3", "--dry-run"])`,
      python: {
        files: {
          'main.py': `import argparse

class BaseCommand:
    help = ""
    def add_arguments(self, parser):
        pass
    def run_from_argv(self, argv):
        parser = argparse.ArgumentParser(prog="manage.py " + argv[0], description=self.help)
        self.add_arguments(parser)
        options = vars(parser.parse_args(argv[1:]))
        self.handle(**options)

class Command(BaseCommand):
    help = "Send fee reminders"
    def add_arguments(self, parser):
        parser.add_argument("course", nargs="?")
        parser.add_argument("--days", type=int, default=7)
        parser.add_argument("--dry-run", action="store_true")
    def handle(self, **options):
        print(options)

Command().run_from_argv(["send_fee_reminders"])
Command().run_from_argv(["send_fee_reminders", "BCA", "--days", "3", "--dry-run"])`,
        },
      },
      result: `{'course': None, 'days': 7, 'dry_run': False}
{'course': 'BCA', 'days': 3, 'dry_run': True}`,
      explanation: 'argparse converts --dry-run to the key dry_run and applies types and defaults, exactly what you receive in handle(**options) in Django.',
    },
  ],
  interview: [
    { q: 'How do you send email in Django?', a: 'Configure EMAIL_BACKEND and SMTP settings, then use send_mail(), send_mass_mail(), EmailMessage or EmailMultiAlternatives from django.core.mail.', level: 'Easy' },
    { q: 'Which email backend is best for development?', a: 'The console backend (prints emails to the terminal) or the file backend. Tests automatically use locmem.', level: 'Easy' },
    { q: 'send_mail vs EmailMessage?', a: 'send_mail is a shortcut for simple messages. EmailMessage supports cc, bcc, reply_to, headers, attachments and reusing connections.', level: 'Medium' },
    { q: 'How do you send HTML email with a text fallback?', a: 'EmailMultiAlternatives(subject, text, from, to) then attach_alternative(html, "text/html"), or send_mail(..., html_message=html).', level: 'Medium' },
    { q: 'Why should emails be sent with transaction.on_commit or a task queue?', a: 'So mail is sent only after the DB transaction commits, and so slow SMTP calls do not block or break the web request.', level: 'Hard' },
    { q: 'How does Django\'s password reset token work?', a: 'PasswordResetTokenGenerator creates an HMAC of user id, password hash, last_login and timestamp signed with SECRET_KEY. It expires after PASSWORD_RESET_TIMEOUT and becomes invalid after the password changes.', level: 'Hard' },
    { q: 'Where do custom management commands live?', a: 'In <app>/management/commands/<command_name>.py, with __init__.py files in management and commands, defining class Command(BaseCommand).', level: 'Easy' },
    { q: 'How do you add arguments to a command?', a: 'Override add_arguments(self, parser) and use parser.add_argument() (argparse). Values arrive in handle(*args, **options).', level: 'Easy' },
    { q: 'How do you run a management command from code?', a: 'django.core.management.call_command("name", arg, option=value).', level: 'Medium' },
    { q: 'How do you show an error from a command?', a: 'Raise CommandError("message"); Django prints it to stderr and exits with a non-zero status.', level: 'Medium' },
    { q: 'How do you schedule management commands?', a: 'Use cron (Linux), Windows Task Scheduler, platform cron jobs (Render/Heroku Scheduler), or Celery beat.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Send a simple notice email to all active students using send_mail in a loop-free way.',
      hint: 'Use send_mass_mail or bcc in EmailMessage.',
      solution: `emails = list(Student.objects.filter(is_active=True).values_list("email", flat=True))
EmailMessage("Holiday notice", "The portal will be closed on Friday.", to=["office@portal.com"], bcc=emails).send()`,
    },
    {
      task: 'Write a command clear_old_notices that deletes notices older than --days (default 90).',
      hint: 'BaseCommand + created_at__lt.',
      solution: `class Command(BaseCommand):
    help = "Delete old notices"

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=90)

    def handle(self, *args, **opts):
        cutoff = timezone.now() - timedelta(days=opts["days"])
        deleted, _ = Notice.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} notices"))`,
    },
    {
      task: 'Configure Django to email you full error reports in production.',
      hint: 'ADMINS, SERVER_EMAIL and DEBUG=False.',
      solution: `ADMINS = [("Portal Admin", "admin@portal.com")]
SERVER_EMAIL = "errors@portal.com"
# With DEBUG=False, AdminEmailHandler mails 500 errors to ADMINS`,
    },
    {
      task: 'Write a command import_students that reads a CSV path argument and creates students.',
      hint: 'csv.DictReader and get_or_create.',
      solution: `import csv

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("path")

    def handle(self, *args, **opts):
        with open(opts["path"], newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                Student.objects.get_or_create(roll_no=row["roll_no"],
                                              defaults={"name": row["name"], "email": row["email"]})
        self.stdout.write(self.style.SUCCESS("Import finished"))`,
    },
  ],
  quiz: [
    { question: 'Which backend prints emails to the terminal?', options: ['smtp.EmailBackend', 'locmem.EmailBackend', 'console.EmailBackend', 'dummy.EmailBackend'], answer: 2, explanation: 'The console backend writes messages to stdout.' },
    { question: 'Which class sends HTML plus a plain-text alternative?', options: ['EmailMultiAlternatives', 'EmailMessage only', 'send_mass_mail', 'mail_admins'], answer: 0, explanation: 'attach_alternative() adds the HTML part.' },
    { question: 'Where must a custom command file be placed?', options: ['app/commands/name.py', 'project/management/name.py', 'app/scripts/name.py', 'app/management/commands/name.py'], answer: 3, explanation: 'Django discovers commands in management/commands.' },
    { question: 'Which method contains the main logic of a command?', options: ['run()', 'handle()', 'execute_command()', 'main()'], answer: 1, explanation: 'BaseCommand calls handle(*args, **options).' },
    { question: 'In tests, sent emails can be inspected in:', options: ['mail.outbox', 'settings.EMAILS', 'request.mail', 'the console only'], answer: 0, explanation: 'The test runner uses the locmem backend, which stores mails in django.core.mail.outbox.' },
  ],
};
