export default {
  id: "day-08-celery-redis-background-jobs",
  title: "Background Jobs with Celery and Redis",
  module: "Module 3: Production",
  day: 8,
  level: "Advanced",
  duration: "3.5 hours",
  summary: "Move slow work like emails, reports and image processing out of the web request using Celery workers with Redis as the message broker. Learn tasks, workers, results, retries, chains and periodic scheduling with Celery Beat.",
  objectives: [
    "Explain why slow work should run in background jobs instead of inside an HTTP request",
    "Describe the roles of producer, broker, worker and result backend",
    "Create a Celery app with Redis, define tasks and call them with delay() and apply_async()",
    "Configure automatic retries with backoff and make tasks idempotent",
    "Schedule periodic tasks with Celery Beat and monitor workers with Flower",
    "Integrate Celery with Django or Flask projects",
  ],
  theory: [
    {
      heading: "Why Background Jobs?",
      content: "A web request should answer in milliseconds. But many jobs are slow: sending a welcome email (1-3 s), generating a PDF invoice, resizing uploaded images, calling a slow third-party API, or building a monthly sales report. If you do this inside the view, the user waits, the request may hit a timeout (Gunicorn's default is 30 s), and your server can handle fewer users at once.\n\nThe solution is a **task queue**: the web app quickly puts a small message \"send email to user 42\" into a queue and returns a response. Separate **worker** processes pick messages from the queue and do the work in the background. **Celery** is the most popular task queue in the Python world, used with Django, Flask and FastAPI.",
      points: [
        "Typical jobs: emails/SMS/OTP, PDF/Excel reports, image/video processing, data imports, webhooks, ML predictions",
        "Scheduled jobs: daily database backup, nightly report, cleaning expired sessions every hour",
        "Lighter alternatives: RQ (Redis Queue), Dramatiq, Huey, arq (async); FastAPI BackgroundTasks for tiny in-process jobs",
      ],
    },
    {
      heading: "Celery Architecture: Producer, Broker, Worker, Backend",
      content: "Celery has four moving parts. Understanding this diagram is the most common interview question on this topic.",
      points: [
        "Producer (client): your Django/Flask/FastAPI code that calls task.delay(...). It only sends a message.",
        "Broker: the message queue that stores task messages until a worker takes them. Redis or RabbitMQ (Amazon SQS also supported).",
        "Worker: a separate long-running process (celery -A proj worker) that executes tasks. You can run many workers on many machines.",
        "Result backend (optional): stores return values and task state (PENDING, STARTED, SUCCESS, FAILURE, RETRY). Redis or a database.",
        "Celery Beat: a scheduler process that sends periodic tasks to the broker on a timetable.",
      ],
      syntax: `[Web app] --task.delay()--> [Broker: Redis queue] --> [Worker 1]
                                                   --> [Worker 2]
                                   [Result backend] <-- workers store results
[Celery Beat] --every 5 min--> [Broker]`,
      tip: "Task arguments are serialized to JSON by default. Pass simple values like IDs, not ORM objects or open files.",
    },
    {
      heading: "Setting Up Celery with Redis",
      content: "Install Celery with the Redis extras and run Redis. The easiest way to get Redis on any OS is Docker. On Windows, Celery 4+ does not officially support the default prefork pool, so for development use `--pool=solo` (or run inside WSL/Docker).",
      syntax: `pip install "celery[redis]"
docker run -d --name redis -p 6379:6379 redis:7

# tasks.py
from celery import Celery

app = Celery(
    "shop",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
)
app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
)

@app.task
def add(x, y):
    return x + y

# start a worker (from the folder containing tasks.py)
celery -A tasks worker --loglevel=INFO
# Windows dev only:
celery -A tasks worker --loglevel=INFO --pool=solo`,
    },
    {
      heading: "Calling Tasks and Reading Results",
      content: "Calling `add(2, 3)` directly runs the function normally in the current process. To run it in the background use `add.delay(2, 3)`, which is a shortcut for `add.apply_async(args=(2, 3))`. Both return an `AsyncResult` immediately, holding a task id.\n\n`apply_async` gives extra options: `countdown` (run after N seconds), `eta` (run at a datetime), `expires`, `queue` (send to a specific queue) and `priority`.\n\n`result.get(timeout=10)` blocks until the result is ready. Never call `.get()` inside a web view or inside another task - it defeats the purpose and can deadlock. Instead return the task id to the client and let it poll a status endpoint.",
      syntax: `r = add.delay(2, 3)
print(r.id)           # 'b7c1...'
print(r.status)       # PENDING -> SUCCESS
print(r.get(timeout=10))   # 5

send_reminder.apply_async(args=[42], countdown=3600)   # in 1 hour
generate_report.apply_async(args=[7], queue="reports")

from celery.result import AsyncResult
AsyncResult(task_id, app=app).state`,
    },
    {
      heading: "Retries, Time Limits and Idempotency",
      content: "Background tasks often call unreliable things: an SMTP server, a payment gateway, an external API. Celery can retry automatically. Use `autoretry_for` with a tuple of exception classes, `retry_backoff=True` for exponential delays (1 s, 2 s, 4 s, ...) and `max_retries`. For manual control use `bind=True` and call `self.retry(exc=exc, countdown=...)`.\n\nBecause a task can run more than once (retry, worker crash, `acks_late`), tasks must be **idempotent**: running them twice must have the same effect as running once. For example, check `if order.invoice_sent: return` before sending, or use a unique key in the database.",
      syntax: `import requests

@app.task(
    bind=True,
    autoretry_for=(requests.RequestException,),
    retry_backoff=True,        # exponential backoff
    retry_backoff_max=600,     # cap at 10 minutes
    retry_jitter=True,         # random spread to avoid thundering herd
    max_retries=5,
    soft_time_limit=60,        # raises SoftTimeLimitExceeded inside task
    time_limit=90,             # hard kill
    acks_late=True,            # ack only after success -> redelivered if worker dies
)
def notify_webhook(self, order_id):
    resp = requests.post("https://partner.example.com/hook",
                         json={"order_id": order_id}, timeout=10)
    resp.raise_for_status()
    return resp.status_code`,
      tip: "Always set a timeout on network calls inside tasks. A hung request without timeout blocks a worker slot forever.",
    },
    {
      heading: "Periodic Tasks with Celery Beat and Workflows",
      content: "Celery Beat is a separate process that reads a schedule and pushes tasks to the broker at the right time. Run exactly ONE beat process, otherwise tasks run twice. Use `crontab()` for cron-like schedules or a number of seconds for simple intervals. With Django you can store schedules in the database using `django-celery-beat`.\n\nCelery also offers **canvas** primitives to combine tasks: `chain` (run one after another, passing results), `group` (run in parallel) and `chord` (a group followed by a callback that receives all results).",
      syntax: `from celery.schedules import crontab

app.conf.beat_schedule = {
    "daily-sales-report": {
        "task": "tasks.daily_sales_report",
        "schedule": crontab(hour=7, minute=0),        # 7:00 AM daily
    },
    "cleanup-every-15-min": {
        "task": "tasks.cleanup_expired_otps",
        "schedule": 15 * 60,                          # seconds
    },
}

# run beat (separate terminal)
celery -A tasks beat --loglevel=INFO

from celery import chain, group, chord
chain(fetch.s(1), parse.s(), save.s())()
group(resize.s(img, size) for size in (128, 256, 512))()
chord([price.s(p) for p in ids], total.s())()`,
    },
    {
      heading: "Monitoring and Production Tips",
      content: "In production you need to see what workers are doing. **Flower** is a web dashboard for Celery (`pip install flower`, `celery -A proj flower` at port 5555). The CLI also helps: `celery -A proj inspect active` and `celery -A proj status`.",
      points: [
        "Run workers with a process manager: systemd, supervisor, Docker or Kubernetes",
        "--concurrency=N sets parallel worker processes (default = number of CPU cores)",
        "Use separate queues for slow and fast tasks: celery -A proj worker -Q emails,default",
        "Set task_time_limit and avoid huge arguments; store big data in DB/S3 and pass the id",
        "Use worker_prefetch_multiplier=1 for long tasks so one worker does not hoard messages",
        "Log the task id; set task_always_eager=True only in unit tests to run tasks synchronously",
        "Redis as broker is simple and fast; RabbitMQ gives stronger delivery guarantees and routing",
      ],
    },
  ],
  examples: [
    {
      title: "First Celery Task with Redis",
      scenario: "Run a simple addition task in the background to see the producer -> broker -> worker flow.",
      steps: [
        "Start Redis: docker run -d --name redis -p 6379:6379 redis:7",
        "Create a venv and run: pip install \"celery[redis]\"",
        "Create tasks.py with the code below",
        "Terminal 1: celery -A tasks worker --loglevel=INFO (add --pool=solo on Windows)",
        "Terminal 2: open python in the same folder and run the client lines",
      ],
      code: `# tasks.py
import time
from celery import Celery

app = Celery("tasks",
             broker="redis://localhost:6379/0",
             backend="redis://localhost:6379/1")

@app.task
def slow_add(x, y):
    time.sleep(5)          # pretend this is slow work
    return x + y

# ---- Terminal 2 (python shell) ----
# >>> from tasks import slow_add
# >>> r = slow_add.delay(4, 6)
# >>> r.status
# >>> r.get(timeout=10)`,
      result: `>>> r.status
'PENDING'
>>> r.get(timeout=10)
10

Worker log:
[INFO/MainProcess] Task tasks.slow_add[3f1c...] received
[INFO/ForkPoolWorker-1] Task tasks.slow_add[3f1c...] succeeded in 5.01s: 10`,
      explanation: "delay() returns instantly with status PENDING because only a message was pushed to Redis. The worker picks it up, sleeps 5 seconds and stores 10 in the result backend. get() waits for it. In a real web app you would not call get(); you would return r.id to the client.",
    },
    {
      title: "Sending Emails in the Background from Django",
      scenario: "When a user registers on a Django shop, the welcome email should not slow down the signup page.",
      steps: [
        "pip install \"celery[redis]\" in your Django project",
        "Create proj/celery.py and update proj/__init__.py as shown",
        "Create accounts/tasks.py with @shared_task",
        "Add CELERY_BROKER_URL to settings.py",
        "Run: celery -A proj worker -l INFO and python manage.py runserver",
      ],
      code: `# proj/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "proj.settings")
app = Celery("proj")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()          # finds tasks.py in every installed app

# proj/__init__.py
from .celery import app as celery_app
__all__ = ("celery_app",)

# proj/settings.py
CELERY_BROKER_URL = "redis://localhost:6379/0"
CELERY_RESULT_BACKEND = "redis://localhost:6379/1"
CELERY_TIMEZONE = "Asia/Kolkata"

# accounts/tasks.py
from smtplib import SMTPException
from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

@shared_task(autoretry_for=(SMTPException,), retry_backoff=True, max_retries=3)
def send_welcome_email(user_id):
    user = get_user_model().objects.get(pk=user_id)
    send_mail("Welcome to ShopKart!",
              f"Hi {user.first_name}, thanks for joining.",
              "noreply@shopkart.in", [user.email])
    return user.email

# accounts/views.py (inside signup view, after user.save())
from django.db import transaction
transaction.on_commit(lambda: send_welcome_email.delay(user.id))`,
      result: `Signup page responds in ~80 ms instead of ~2 s.
Worker log:
Task accounts.tasks.send_welcome_email[9a2e...] received
Task accounts.tasks.send_welcome_email[9a2e...] succeeded in 1.42s: 'asha@example.com'`,
      explanation: "@shared_task lets reusable apps define tasks without importing the project's app object. We pass user.id, not the user object, because arguments must be JSON-serializable and the data might change. transaction.on_commit makes sure the task is sent only after the user row is committed; otherwise a fast worker might query the user before it exists. SMTP failures retry with exponential backoff.",
    },
    {
      title: "Retry with Backoff for a Flaky Payment API",
      scenario: "A payment-status check API sometimes returns 503. We want automatic retries with growing delays and a final failure log.",
      steps: [
        "pip install requests \"celery[redis]\"",
        "Add the task to tasks.py",
        "Restart the worker so it loads the new task",
        "Call check_payment.delay(\"ORD-1001\") and watch the worker log retries",
      ],
      code: `import logging
import requests
from celery import Celery

app = Celery("tasks", broker="redis://localhost:6379/0")
log = logging.getLogger(__name__)

@app.task(bind=True, max_retries=4)
def check_payment(self, order_ref):
    try:
        r = requests.get(f"https://pay.example.com/status/{order_ref}", timeout=5)
        r.raise_for_status()
        return r.json()["status"]
    except requests.RequestException as exc:
        delay = 2 ** self.request.retries * 10     # 10, 20, 40, 80 seconds
        log.warning("Attempt %s failed for %s, retrying in %ss",
                    self.request.retries + 1, order_ref, delay)
        raise self.retry(exc=exc, countdown=delay)`,
      result: `WARNING Attempt 1 failed for ORD-1001, retrying in 10s
Task tasks.check_payment[...] retry: Retry in 10s: HTTPError('503 Server Error')
WARNING Attempt 2 failed for ORD-1001, retrying in 20s
Task tasks.check_payment[...] succeeded in 0.31s: 'PAID'`,
      explanation: "bind=True passes the task instance as self, giving access to self.request.retries and self.retry(). self.retry raises a special Retry exception that re-queues the task with a countdown. After max_retries (4) the original exception is raised and the task state becomes FAILURE. The same behaviour can be written declaratively with autoretry_for and retry_backoff.",
    },
    {
      title: "Daily Report with Celery Beat",
      scenario: "The sales manager wants a sales summary every morning at 8 AM IST and expired OTPs removed every 10 minutes.",
      steps: [
        "Add beat_schedule to your Celery config as shown",
        "Terminal 1: celery -A tasks worker -l INFO",
        "Terminal 2: celery -A tasks beat -l INFO",
        "For quick testing temporarily change the crontab to run every minute: crontab()",
      ],
      code: `from datetime import date
from celery import Celery
from celery.schedules import crontab

app = Celery("tasks", broker="redis://localhost:6379/0")
app.conf.timezone = "Asia/Kolkata"

app.conf.beat_schedule = {
    "morning-sales-report": {
        "task": "tasks.sales_report",
        "schedule": crontab(hour=8, minute=0),
        "args": ("email",),
    },
    "purge-otps": {
        "task": "tasks.purge_otps",
        "schedule": 600.0,
    },
}

@app.task
def sales_report(channel):
    # in a real app: query DB, build Excel, email it
    return f"Report for {date.today()} sent via {channel}"

@app.task
def purge_otps():
    return "deleted 37 expired OTPs"`,
      result: `[beat] Scheduler: Sending due task purge-otps (tasks.purge_otps)
[worker] Task tasks.purge_otps[...] succeeded in 0.01s: 'deleted 37 expired OTPs'
[beat] Scheduler: Sending due task morning-sales-report (tasks.sales_report)
[worker] Task tasks.sales_report[...] succeeded in 0.02s: 'Report for 2026-11-18 sent via email'`,
      explanation: "Beat only schedules; workers execute. Setting app.conf.timezone ensures 8:00 means 8:00 IST. Run a single beat instance - two beat processes would send every task twice. For a quick single-machine dev setup you can run both with celery -A tasks worker -B, but not in production.",
    },
  ],
  interview: [
    {
      q: "What is Celery and when would you use it?",
      a: "Celery is a distributed task queue for Python. You use it to run slow or scheduled work outside the request/response cycle: sending emails, generating reports, processing uploads, calling slow APIs and periodic jobs like nightly cleanups. It keeps web responses fast and lets you scale workers independently.",
      level: "Easy",
    },
    {
      q: "Explain the roles of broker, worker and result backend in Celery.",
      a: "The broker (Redis/RabbitMQ) stores task messages in queues. The producer (web app) sends messages to the broker. Workers are separate processes that consume messages and execute tasks. The result backend (Redis, database) stores the task state and return value so the producer can check it later. The backend is optional if you do not need results.",
      level: "Easy",
    },
    {
      q: "What is the difference between delay() and apply_async()?",
      a: "`task.delay(*args, **kwargs)` is a shortcut for `task.apply_async(args, kwargs)` with default options. `apply_async` accepts execution options like countdown, eta, expires, queue, priority, retry policy and link callbacks.",
      level: "Easy",
    },
    {
      q: "Why should you pass IDs rather than model objects to tasks?",
      a: "Arguments are serialized (JSON by default), and ORM objects are not JSON-serializable. Even with pickle, the object would be a stale snapshot - the row may change before the task runs. Passing the primary key lets the task fetch fresh data. It also keeps messages small.",
      level: "Medium",
    },
    {
      q: "Redis vs RabbitMQ as a Celery broker?",
      a: "Redis is simple to run, very fast and doubles as cache and result backend, so it is the common default. RabbitMQ is a dedicated AMQP broker with stronger delivery guarantees, acknowledgements, advanced routing (exchanges) and better behaviour with very large queues. Choose RabbitMQ for mission-critical messaging and complex routing, Redis for simplicity.",
      level: "Medium",
    },
    {
      q: "How do retries work in Celery? What is exponential backoff?",
      a: "You can declare `autoretry_for=(SomeError,)` with `max_retries`, or use `bind=True` and call `self.retry(exc=exc, countdown=n)`. Exponential backoff increases the wait each attempt (e.g. 1, 2, 4, 8 s) so a struggling service gets time to recover; `retry_backoff=True` enables it and `retry_jitter` adds randomness so many tasks do not retry at the same moment.",
      level: "Medium",
    },
    {
      q: "What does idempotent mean, and why must Celery tasks be idempotent?",
      a: "An idempotent task gives the same final effect whether it runs once or many times. Celery delivers at-least-once in many setups: retries, acks_late with a worker crash, or visibility timeouts in Redis can cause duplicate execution. Without idempotency a customer could be charged or emailed twice. Use checks like status flags, unique constraints or idempotency keys.",
      level: "Hard",
    },
    {
      q: "What is Celery Beat? What happens if you run two beat instances?",
      a: "Celery Beat is a scheduler process that sends periodic tasks (interval or crontab) to the broker. It does not execute tasks; workers do. If two beat instances run, each sends the same scheduled tasks, so every periodic job runs twice. Run exactly one beat, or use a locking scheduler (e.g. RedBeat) for high availability.",
      level: "Medium",
    },
    {
      q: "Why should you avoid calling result.get() inside a Django view or inside another task?",
      a: "It blocks until the task finishes, so the view becomes as slow as doing the work inline and ties up a web worker. Inside a task it can deadlock when all worker slots are waiting on subtasks that cannot start; Celery even raises a RuntimeError for this by default. Use chains/chords for dependencies and return task ids to clients for polling.",
      level: "Hard",
    },
    {
      q: "Explain chain, group and chord.",
      a: "`chain(a.s(), b.s(), c.s())` runs tasks in sequence, passing each result to the next. `group(...)` runs tasks in parallel and returns a GroupResult. `chord(group, callback)` runs a group in parallel and then calls the callback with the list of all results, like map-reduce. A chord requires a result backend.",
      level: "Hard",
    },
    {
      q: "How do you test Celery tasks without running Redis and workers?",
      a: "Test the task function directly by calling it like a normal function (`add(2, 3)`), or set `task_always_eager=True` (and `task_eager_propagates=True`) in test settings so `.delay()` runs synchronously in the same process. Mock external calls with unittest.mock. Use celery.contrib.pytest fixtures for integration tests with a real worker.",
      level: "Medium",
    },
    {
      q: "A task is sent right after creating a DB row but the worker raises DoesNotExist. Why, and how do you fix it?",
      a: "The task was queued before the database transaction committed, and a fast worker queried the row before it became visible. In Django, wrap the call in `transaction.on_commit(lambda: task.delay(obj.id))` so the message is sent only after commit. Similar patterns exist in SQLAlchemy (send after session.commit()).",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create a Celery app with Redis and a task `word_count(text)` that returns the number of words. Start a worker and call it with delay(), printing the result.",
      hint: "Remember the backend URL is needed to call get().",
      solution: `# tasks.py
from celery import Celery

app = Celery("tasks", broker="redis://localhost:6379/0",
             backend="redis://localhost:6379/1")

@app.task
def word_count(text):
    return len(text.split())

# terminal 1:  celery -A tasks worker -l INFO
# terminal 2:
# >>> from tasks import word_count
# >>> r = word_count.delay("background jobs keep apps fast")
# >>> r.get(timeout=5)
# 5
`,
    },
    {
      task: "Write a task `fetch_rate(currency)` that calls an exchange-rate API with requests, retries up to 3 times on any requests.RequestException with exponential backoff, and has a 20 second soft time limit.",
      hint: "Use autoretry_for, retry_backoff, max_retries and soft_time_limit in the decorator.",
      solution: `import requests
from celery import Celery

app = Celery("tasks", broker="redis://localhost:6379/0")

@app.task(autoretry_for=(requests.RequestException,),
          retry_backoff=True, retry_jitter=True,
          max_retries=3, soft_time_limit=20)
def fetch_rate(currency):
    r = requests.get(f"https://api.example.com/rates/{currency}", timeout=5)
    r.raise_for_status()
    return r.json()["inr"]
`,
    },
    {
      task: "Configure Celery Beat to run `backup_db` every night at 2:30 AM IST and `ping_health` every 30 seconds. Write the commands to run worker and beat.",
      hint: "Use crontab(hour=2, minute=30) and set app.conf.timezone.",
      solution: `from celery import Celery
from celery.schedules import crontab

app = Celery("ops", broker="redis://localhost:6379/0")
app.conf.timezone = "Asia/Kolkata"
app.conf.beat_schedule = {
    "nightly-backup": {"task": "ops.backup_db",
                       "schedule": crontab(hour=2, minute=30)},
    "health-ping": {"task": "ops.ping_health", "schedule": 30.0},
}

@app.task
def backup_db():
    return "backup done"

@app.task
def ping_health():
    return "ok"

# celery -A ops worker -l INFO
# celery -A ops beat -l INFO
`,
    },
    {
      task: "Make an idempotent task `send_invoice(order_id)` that does nothing if the invoice was already sent. Use a simple dict as a fake database and show that calling it twice sends only one email.",
      hint: "Check a flag before doing the side effect; set the flag after success. Call the function directly to test.",
      solution: `from celery import Celery

app = Celery("billing", broker="redis://localhost:6379/0")
FAKE_DB = {101: {"email": "a@x.com", "invoice_sent": False}}
SENT = []

@app.task
def send_invoice(order_id):
    order = FAKE_DB[order_id]
    if order["invoice_sent"]:
        return "skipped"
    SENT.append(order["email"])        # real code: send email
    order["invoice_sent"] = True       # real code: UPDATE ... in a transaction
    return "sent"

print(send_invoice(101))   # sent   (direct call, no worker needed)
print(send_invoice(101))   # skipped
print(SENT)                # ['a@x.com']
`,
    },
  ],
  quiz: [
    {
      question: "In Celery, which component stores task messages until a worker picks them up?",
      options: ["Result backend", "Broker", "Beat", "Flower"],
      answer: 1,
      explanation: "The broker (Redis/RabbitMQ) holds the queue of task messages.",
    },
    {
      question: "What does add.delay(2, 3) return?",
      options: ["5", "None", "An AsyncResult object", "A Celery app"],
      answer: 2,
      explanation: "delay() returns immediately with an AsyncResult that has the task id and state.",
    },
    {
      question: "Which option makes a task wait 60 seconds before running?",
      options: ["apply_async(countdown=60)", "delay(wait=60)", "apply_async(timeout=60)", "@app.task(sleep=60)"],
      answer: 0,
      explanation: "countdown delays execution by N seconds; eta gives an exact datetime.",
    },
    {
      question: "Which process sends periodic tasks according to a schedule?",
      options: ["celery worker", "celery flower", "celery beat", "redis-server"],
      answer: 2,
      explanation: "Beat is the scheduler; workers still execute the tasks.",
    },
    {
      question: "Why use transaction.on_commit() when sending a task from a Django view?",
      options: ["It makes the task faster", "So the task is queued only after the DB row is committed", "It is required for Redis", "It enables retries"],
      answer: 1,
      explanation: "Otherwise the worker may run before the transaction commits and not find the row.",
    },
    {
      question: "What is the safest kind of argument to pass to a Celery task?",
      options: ["A Django model instance", "An open file object", "A primary key integer", "A database connection"],
      answer: 2,
      explanation: "Small JSON-serializable values like IDs are safe; the task fetches fresh data itself.",
    },
  ],
};
