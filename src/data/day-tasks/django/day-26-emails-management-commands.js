export default {
  lesson: 'day-26-emails-management-commands',
  minutes: 30,
  intro: 'Practise email backends, send_mail/EmailMessage/EmailMultiAlternatives, the password reset flow and custom management commands, and write the reminder logic a command would run.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'During development you want emails printed in the terminal instead of really sent. Which setting?',
      options: ["EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'", "EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'", 'EMAIL_DEBUG = True', "EMAIL_HOST = 'localhost'"],
      answer: 1,
      explain: 'The **console** backend writes each email to stdout - perfect for development. Production uses the SMTP backend with `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER` and an app password read from the environment. Tests use the `locmem` backend automatically (`mail.outbox`).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A custom command lives in `students/management/commands/send_fee_reminders.py`. Complete the method that Django calls when you run `python manage.py send_fee_reminders`:\n\n```\nclass Command(BaseCommand):\n    help = \'Email students with pending fees\'\n\n    def ______(self, *args, **options):\n        ...\n```',
      accept: ['handle'],
      caseSensitive: true,
      explain: 'Django runs `handle(*args, **options)`; options come from `add_arguments(self, parser)` (argparse). The file name becomes the command name, and both `management/` and `commands/` need an `__init__.py`. Print with `self.stdout.write(self.style.SUCCESS(...))`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'EmailMultiAlternatives can send a plain-text body plus an HTML version',
        'render_to_string("emails/welcome.html", context) builds an HTML email body from a template',
        'send_mass_mail opens one connection for many messages',
        'Sending emails inside a request is always fine, even for 5,000 students',
        'Commands can be scheduled with cron (Linux) or Task Scheduler (Windows)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Send both text and HTML for compatibility. Big batches should run in a management command scheduled by cron or in a background worker (Celery), not inside a web request that would time out.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'What does this program print? (runs inside a configured Django project; the locmem backend keeps sent mails in `mail.outbox`)',
      code: `from django.conf import settings
from django.core import mail
from django.core.mail import send_mail, EmailMultiAlternatives

settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
mail.outbox = []

n = send_mail('Welcome to Student Portal', 'Hi Asha, your account is ready.', 'noreply@portal.in', ['asha@gmail.com'])
msg = EmailMultiAlternatives('Result published', 'Your result is out.', 'exam@portal.in', ['ravi@gmail.com', 'meera@gmail.com'])
msg.attach_alternative('<h1>Your result is out</h1>', 'text/html')
msg.send()

print(n, len(mail.outbox))
print(mail.outbox[0].subject, '|', mail.outbox[0].to)
print(mail.outbox[1].recipients(), mail.outbox[1].alternatives[0][1])`,
      expected: "1 2\nWelcome to Student Portal | ['asha@gmail.com']\n['ravi@gmail.com', 'meera@gmail.com'] text/html",
      explain: '`send_mail` returns the number of messages sent (1). Each `send()` adds one message to `mail.outbox` - one email can have several recipients. `attach_alternative` adds the HTML version. In tests you assert on `mail.outbox` exactly like this.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write the logic of `send_fee_reminders`: `build_reminders(students, today, days_before=3, dry_run=False)`. Each student = `{\'name\', \'email\', \'fee_due\': \'YYYY-MM-DD\', \'paid\': bool}`. Select unpaid students whose due date is between today and today + `days_before` (inclusive) **or already overdue**. Return `{\'count\': n, \'emails\': [...]}` where each email is `(to, subject)`; subject = `f\'Fee reminder: due on {fee_due}\'` or `f\'OVERDUE: fee was due on {fee_due}\'` if the date is before today. With `dry_run=True` return the same count but `emails = []`. Sort emails by due date, then name.',
      example: { title: 'dates', code: "from datetime import date, timedelta\ntoday = date(2026, 11, 19)\nprint(date.fromisoformat('2026-11-21') <= today + timedelta(days=3))   # True" },
      starter: `from datetime import date, timedelta

def build_reminders(students, today, days_before=3, dry_run=False):
    # TODO
    return {'count': 0, 'emails': []}
`,
      solution: `from datetime import date, timedelta

def build_reminders(students, today, days_before=3, dry_run=False):
    today = date.fromisoformat(today) if isinstance(today, str) else today
    limit = today + timedelta(days=days_before)
    due = [s for s in students if not s['paid'] and date.fromisoformat(s['fee_due']) <= limit]
    due.sort(key=lambda s: (s['fee_due'], s['name']))
    emails = []
    for s in due:
        d = date.fromisoformat(s['fee_due'])
        subject = f"OVERDUE: fee was due on {s['fee_due']}" if d < today else f"Fee reminder: due on {s['fee_due']}"
        emails.append((s['email'], subject))
    return {'count': len(due), 'emails': [] if dry_run else emails}
`,
      tests: [
        { call: "build_reminders([{'name': 'Asha', 'email': 'a@x.in', 'fee_due': '2026-11-21', 'paid': False}, {'name': 'Ravi', 'email': 'r@x.in', 'fee_due': '2026-11-30', 'paid': False}, {'name': 'Meera', 'email': 'm@x.in', 'fee_due': '2026-11-10', 'paid': False}, {'name': 'Dev', 'email': 'd@x.in', 'fee_due': '2026-11-20', 'paid': True}], '2026-11-19')", expect: { count: 2, emails: [['m@x.in', 'OVERDUE: fee was due on 2026-11-10'], ['a@x.in', 'Fee reminder: due on 2026-11-21']] } },
        { call: "build_reminders([{'name': 'Asha', 'email': 'a@x.in', 'fee_due': '2026-11-22', 'paid': False}], '2026-11-19')['count']", expect: 1, msg: 'today + 3 days is still included' },
        { call: "build_reminders([{'name': 'Asha', 'email': 'a@x.in', 'fee_due': '2026-11-21', 'paid': False}], '2026-11-19', dry_run=True)", expect: { count: 1, emails: [] } },
      ],
      explain: 'Keep the decision logic in a plain function and let `handle()` only parse options (`--days`, `--dry-run`), call it and send mails. A **dry run** lets you check who would be emailed before spamming 500 students. Schedule it daily with cron: `0 9 * * * python manage.py send_fee_reminders`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Password reset links contain `uidb64` and a token. Write `encode_uid(pk)` = `urlsafe_base64_encode(str(pk).encode())` (base64 url-safe **without** `=` padding) and `decode_uid(uidb64)` that returns the int pk, or `None` if decoding fails.',
      example: { title: 'base64 url-safe', code: "import base64\ns = base64.urlsafe_b64encode(b'42').decode().rstrip('=')\nprint(s)   # NDI" },
      starter: `import base64

def encode_uid(pk):
    # TODO
    return str(pk)

def decode_uid(uidb64):
    # TODO
    return None
`,
      solution: `import base64

def encode_uid(pk):
    return base64.urlsafe_b64encode(str(pk).encode()).decode().rstrip('=')

def decode_uid(uidb64):
    try:
        raw = base64.urlsafe_b64decode(uidb64 + '=' * (-len(uidb64) % 4)).decode()
        return int(raw)
    except (ValueError, UnicodeDecodeError):
        return None
`,
      tests: [
        { call: 'encode_uid(42)', expect: 'NDI' },
        { call: 'encode_uid(7)', expect: 'Nw' },
        { call: "decode_uid('NDI')", expect: 42 },
        { call: 'decode_uid(encode_uid(12345))', expect: 12345 },
        { call: "decode_uid('!!bad!!')", expect: null },
      ],
      explain: 'Django\'s reset URL is `/reset/<uidb64>/<token>/`: the uid is just the user\'s pk in URL-safe base64 (not secret), while the **token** (an HMAC of the user\'s password hash, last login and a timestamp) proves the link is genuine and becomes invalid once the password changes.',
    },
  ],
};
