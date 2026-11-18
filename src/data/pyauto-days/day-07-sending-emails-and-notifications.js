export default {
  id: "day-07-sending-emails-and-notifications",
  title: "Sending Emails and Notifications with Python",
  module: "Module 3: Bots & Scheduling",
  day: 7,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Send automatic emails with smtplib and email.message: plain text, HTML, attachments and bulk personalised mails using Gmail/Outlook app passwords. Then send instant alerts to Telegram and Slack through bot APIs and incoming webhooks.",
  objectives: [
    "Explain how SMTP works: server, port, TLS and authentication",
    "Build emails with EmailMessage: subject, recipients, text and HTML bodies",
    "Attach files such as Excel reports and PDFs with the correct MIME type",
    "Use app passwords and environment variables instead of real passwords",
    "Send notifications to Telegram and Slack using HTTP requests",
  ],
  theory: [
    {
      heading: "How Email Sending Works",
      content: "When you click Send, your mail client hands the message to an **SMTP server** (Simple Mail Transfer Protocol), which delivers it to the recipient's mail server. Python's built-in `smtplib` talks to an SMTP server and `email.message.EmailMessage` builds the message (headers, body, attachments). No pip install is needed.",
      points: [
        "Gmail: smtp.gmail.com, port 587 with STARTTLS or 465 with SSL",
        "Outlook / Microsoft 365: smtp.office365.com, port 587 with STARTTLS (many organisations disable basic SMTP auth; check with IT)",
        "Company servers and services like Amazon SES, SendGrid, Mailgun or Brevo are used for large volumes",
        "Port 25 is usually blocked on home and cloud networks",
      ],
    },
    {
      heading: "App Passwords and Keeping Secrets Safe",
      content: "Gmail does not allow your normal password for scripts. Turn on **2-Step Verification**, then create an **App Password** (Google Account > Security > App passwords). It is a 16-character password valid only for this app and can be revoked any time. Store it in an environment variable or a `.env` file that is listed in `.gitignore`, never in the script.",
      syntax: `# terminal (Linux/macOS)
export SMTP_USER="reports.bot@gmail.com"
export SMTP_PASS="abcd efgh ijkl mnop"

# Python
import os
user = os.environ["SMTP_USER"]
password = os.environ["SMTP_PASS"]
`,
      tip: "If you accidentally push a password to GitHub, revoke it immediately. Deleting the commit is not enough; bots scan GitHub for secrets within minutes.",
    },
    {
      heading: "Building a Message with EmailMessage",
      content: "`EmailMessage` behaves like a dictionary for headers. `set_content()` sets the plain-text body; `add_alternative(html, subtype=\"html\")` adds an HTML version (clients show HTML when they can, otherwise text). Multiple recipients go in one comma-separated header. Bcc recipients should not be put in headers when you want them hidden; pass them to `send_message(to_addrs=...)` instead.",
      syntax: `from email.message import EmailMessage

msg = EmailMessage()
msg["Subject"] = "Daily Sales Report - 18 Nov"
msg["From"] = "Reports Bot <reports.bot@gmail.com>"
msg["To"] = "manager@company.com, team@company.com"
msg["Cc"] = "ceo@company.com"
msg.set_content("Hi,\\nPlease find today's report attached.")
msg.add_alternative("<h3>Daily Sales</h3><p>Total: <b>Rs 2,45,000</b></p>", subtype="html")
`,
    },
    {
      heading: "Attachments",
      content: "Read the file as bytes and call `add_attachment(data, maintype, subtype, filename=...)`. The `mimetypes` module guesses the type from the file extension, for example `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` for .xlsx. Keep attachments small (Gmail limit is 25 MB); for big files upload to a shared drive and send the link.",
      syntax: `import mimetypes
from pathlib import Path

path = Path("sales_report.xlsx")
ctype, _ = mimetypes.guess_type(path)
maintype, subtype = (ctype or "application/octet-stream").split("/", 1)
msg.add_attachment(path.read_bytes(), maintype=maintype, subtype=subtype, filename=path.name)
`,
    },
    {
      heading: "Sending with smtplib",
      content: "Open a connection, upgrade to TLS, log in and send. Use the `with` statement so the connection is closed properly. Catch `smtplib.SMTPAuthenticationError` (wrong user or app password) and `smtplib.SMTPException` for other errors. For bulk emails, reuse one connection for all messages, personalise each one, and add a small delay to respect provider limits (Gmail personal accounts allow roughly 500 recipients per day).",
      syntax: `import smtplib, ssl

context = ssl.create_default_context()
with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
    server.starttls(context=context)
    server.login(user, password)
    server.send_message(msg)

# or implicit SSL
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
    server.login(user, password)
    server.send_message(msg)
`,
      tip: "While developing, point your script to a local debugging server or send only to yourself. One bug in a loop can email 500 customers by mistake.",
    },
    {
      heading: "Instant Notifications: Telegram and Slack",
      content: "Email is slow for urgent alerts like 'server down' or 'payment failed'. Chat apps offer simple HTTP APIs:\n\n**Telegram**: talk to @BotFather to create a bot and get a token, send any message to the bot, then find your chat_id from `https://api.telegram.org/bot<TOKEN>/getUpdates`. Send with a POST to `/sendMessage`.\n\n**Slack**: create an app with an **Incoming Webhook** for a channel; you get a secret URL. POST JSON `{\"text\": \"...\"}` to it. Microsoft Teams supports similar webhooks through Workflows.",
      syntax: `import os, requests

requests.post(f"https://api.telegram.org/bot{os.environ['TG_TOKEN']}/sendMessage",
              json={"chat_id": os.environ["TG_CHAT_ID"], "text": "Backup completed"}, timeout=10)

requests.post(os.environ["SLACK_WEBHOOK_URL"], json={"text": ":white_check_mark: Report sent"}, timeout=10)
`,
      points: [
        "Treat bot tokens and webhook URLs as passwords",
        "Do not send personal or confidential data to chat channels",
        "Only message people who expect it: unsolicited bulk messages are spam",
      ],
    },
  ],
  examples: [
    {
      title: "Build an Email with Text, HTML and an Attachment (Offline)",
      scenario: "Before sending anything, build the full email object and inspect its structure. The script creates a small CSV report and attaches it. Nothing is sent.",
      steps: [
        "No pip install needed (email and mimetypes are built in)",
        "Run: python main.py",
        "Change the recipients and file name and run again",
      ],
      code: `import mimetypes
from pathlib import Path
from email.message import EmailMessage

report = Path("sales_18_nov.csv")
report.write_text("region,amount\\nNorth,52000\\nSouth,61000\\n")

msg = EmailMessage()
msg["Subject"] = "Daily Sales Report - 18 Nov"
msg["From"] = "Reports Bot <reports.bot@example.com>"
msg["To"] = "manager@example.com, team@example.com"
msg.set_content("Hi team,\\nTotal sales today: Rs 1,13,000.\\nReport attached.")
msg.add_alternative("<p>Hi team,</p><p>Total sales today: <b>Rs 1,13,000</b>.</p>", subtype="html")

ctype, _ = mimetypes.guess_type(report.name)
maintype, subtype = ctype.split("/", 1)
msg.add_attachment(report.read_bytes(), maintype=maintype, subtype=subtype, filename=report.name)

print("Subject:", msg["Subject"])
print("To:", msg["To"])
print("Multipart:", msg.is_multipart())
for part in msg.walk():
    name = part.get_filename()
    extra = f" | attachment: {name}" if name else ""
    print(" ", part.get_content_type() + extra)
`,
      result: `Subject: Daily Sales Report - 18 Nov
To: manager@example.com, team@example.com
Multipart: True
  multipart/mixed
  multipart/alternative
  text/plain
  text/html
  text/csv | attachment: sales_18_nov.csv`,
      explanation: "set_content() creates the text body, add_alternative() turns it into multipart/alternative (text + HTML), and add_attachment() wraps everything in multipart/mixed. msg.walk() visits every part of the tree, which shows exactly what the mail client will receive. mimetypes.guess_type() gives 'text/csv' for .csv files.",
      python: {
        files: {
          "main.py": `import mimetypes
from pathlib import Path
from email.message import EmailMessage

report = Path("sales_18_nov.csv")
report.write_text("region,amount\\nNorth,52000\\nSouth,61000\\n")

msg = EmailMessage()
msg["Subject"] = "Daily Sales Report - 18 Nov"
msg["From"] = "Reports Bot <reports.bot@example.com>"
msg["To"] = "manager@example.com, team@example.com"
msg.set_content("Hi team,\\nTotal sales today: Rs 1,13,000.\\nReport attached.")
msg.add_alternative("<p>Hi team,</p><p>Total sales today: <b>Rs 1,13,000</b>.</p>", subtype="html")

ctype, _ = mimetypes.guess_type(report.name)
maintype, subtype = ctype.split("/", 1)
msg.add_attachment(report.read_bytes(), maintype=maintype, subtype=subtype, filename=report.name)

print("Subject:", msg["Subject"])
print("To:", msg["To"])
print("Multipart:", msg.is_multipart())
for part in msg.walk():
    name = part.get_filename()
    extra = f" | attachment: {name}" if name else ""
    print(" ", part.get_content_type() + extra)
`,
        },
      },
    },
    {
      title: "Send the Email through Gmail with an App Password",
      scenario: "Send the daily report email for real using Gmail's SMTP server with credentials from environment variables.",
      steps: [
        "No pip install needed (smtplib is built in)",
        "Enable 2-Step Verification and create an App Password in your Google Account",
        "Set SMTP_USER and SMTP_PASS environment variables",
        "Run: python main.py and check your inbox (send to yourself first)",
      ],
      code: `import os
import ssl
import smtplib
from email.message import EmailMessage

SMTP_HOST, SMTP_PORT = "smtp.gmail.com", 587
user = os.environ["SMTP_USER"]
password = os.environ["SMTP_PASS"]

msg = EmailMessage()
msg["Subject"] = "Test from Python automation"
msg["From"] = user
msg["To"] = user                       # send to yourself while testing
msg.set_content("Hello! This email was sent by a Python script.")

try:
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
        server.starttls(context=ssl.create_default_context())
        server.login(user, password)
        refused = server.send_message(msg)
    print("Sent successfully" if not refused else f"Refused: {refused}")
except smtplib.SMTPAuthenticationError:
    print("Login failed: check SMTP_USER and the 16-character app password")
except (smtplib.SMTPException, OSError) as e:
    print("Could not send:", e)
`,
      result: `Sent successfully`,
      explanation: "SMTP on port 587 starts as plain text; starttls() upgrades it to an encrypted TLS connection before login. send_message() reads From/To/Cc from the headers and returns a dict of refused recipients (empty on success). Authentication errors are caught separately so the user gets a helpful message. OSError covers network problems such as no internet.",
    },
    {
      title: "Personalised Bulk Emails from a Template (Dry Run)",
      scenario: "Send each customer a payment reminder with their own name, invoice number and amount. Run in dry-run mode first to preview the messages.",
      steps: [
        "No pip install needed",
        "Run: python main.py (DRY_RUN = True prints the emails instead of sending)",
        "To send for real, set DRY_RUN = False and add the smtplib block from Example 2 around the loop",
      ],
      code: `import csv
import io
from string import Template
from email.message import EmailMessage

CUSTOMERS_CSV = """name,email,invoice,amount,due
Ravi Traders,accounts@ravitraders.example,INV-1042,18500,25 Nov
Sai Medicals,billing@saimedicals.example,INV-1047,7250,28 Nov
"""
BODY = Template("Dear $name,\\nThis is a reminder that invoice $invoice for Rs $amount is due on $due.\\nRegards,\\nAccounts Team")
DRY_RUN = True

def build(row):
    msg = EmailMessage()
    msg["Subject"] = f"Payment reminder: {row['invoice']}"
    msg["From"] = "accounts@mycompany.example"
    msg["To"] = row["email"]
    row = dict(row, amount=f"{int(row['amount']):,}")
    msg.set_content(BODY.substitute(row))
    return msg

for row in csv.DictReader(io.StringIO(CUSTOMERS_CSV)):
    msg = build(row)
    if DRY_RUN:
        print("To:", msg["To"], "| Subject:", msg["Subject"])
        print(msg.get_content().strip())
        print("-" * 40)
`,
      result: `To: accounts@ravitraders.example | Subject: Payment reminder: INV-1042
Dear Ravi Traders,
This is a reminder that invoice INV-1042 for Rs 18,500 is due on 25 Nov.
Regards,
Accounts Team
----------------------------------------
To: billing@saimedicals.example | Subject: Payment reminder: INV-1047
Dear Sai Medicals,
This is a reminder that invoice INV-1047 for Rs 7,250 is due on 28 Nov.
Regards,
Accounts Team
----------------------------------------`,
      explanation: "csv.DictReader turns each row into a dict (io.StringIO lets us read CSV text from a string; in real use open a file). string.Template fills $placeholders; substitute() raises KeyError if a value is missing, which protects you from sending half-filled emails. Each recipient gets an individual message, so customers never see each other's addresses. The dry-run preview is the most important safety step in bulk mailing.",
      python: {
        files: {
          "main.py": `import csv
import io
from string import Template
from email.message import EmailMessage

CUSTOMERS_CSV = """name,email,invoice,amount,due
Ravi Traders,accounts@ravitraders.example,INV-1042,18500,25 Nov
Sai Medicals,billing@saimedicals.example,INV-1047,7250,28 Nov
"""
BODY = Template("Dear $name,\\nThis is a reminder that invoice $invoice for Rs $amount is due on $due.\\nRegards,\\nAccounts Team")
DRY_RUN = True

def build(row):
    msg = EmailMessage()
    msg["Subject"] = f"Payment reminder: {row['invoice']}"
    msg["From"] = "accounts@mycompany.example"
    msg["To"] = row["email"]
    row = dict(row, amount=f"{int(row['amount']):,}")
    msg.set_content(BODY.substitute(row))
    return msg

for row in csv.DictReader(io.StringIO(CUSTOMERS_CSV)):
    msg = build(row)
    if DRY_RUN:
        print("To:", msg["To"], "| Subject:", msg["Subject"])
        print(msg.get_content().strip())
        print("-" * 40)
`,
        },
      },
    },
    {
      title: "Send a Telegram Alert from a Bot",
      scenario: "Get a phone notification when a long-running job finishes or fails.",
      steps: [
        "Install: pip install requests",
        "In Telegram, open @BotFather, send /newbot and copy the token",
        "Send 'hi' to your new bot, then open https://api.telegram.org/bot<TOKEN>/getUpdates and copy chat.id",
        "Set TG_TOKEN and TG_CHAT_ID environment variables and run: python main.py",
      ],
      code: `import os
import requests

def notify_telegram(text):
    token = os.environ["TG_TOKEN"]
    chat_id = os.environ["TG_CHAT_ID"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    r = requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}, timeout=10)
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram error: {data.get('description')}")
    return data["result"]["message_id"]

try:
    total = sum(range(1_000_000))          # pretend this is a long job
    msg_id = notify_telegram(f"<b>Job finished</b>\\nResult: {total:,}")
    print("Telegram message id:", msg_id)
except Exception as e:
    print("Alert failed:", e)
`,
      result: `Telegram message id: 15
(and your phone shows: Job finished / Result: 499,999,500,000)`,
      explanation: "The Bot API is a simple HTTPS endpoint. parse_mode='HTML' allows tags like <b>. Telegram always returns JSON with an 'ok' flag; checking it gives clear errors such as 'chat not found'. The token and chat id come from environment variables, so the code can be shared safely.",
    },
    {
      title: "Post to a Slack Channel with an Incoming Webhook",
      scenario: "Post a short daily summary to the #sales channel with a formatted message.",
      steps: [
        "Install: pip install requests",
        "Create a Slack app at api.slack.com/apps, enable Incoming Webhooks and add one for #sales",
        "Set SLACK_WEBHOOK_URL environment variable",
        "Run: python main.py",
      ],
      code: `import os
import requests

summary = {"orders": 128, "revenue": 245000, "top_product": "Wireless Mouse"}

payload = {
    "text": f"Daily sales: Rs {summary['revenue']:,}",          # fallback for notifications
    "blocks": [
        {"type": "header", "text": {"type": "plain_text", "text": "Daily Sales Summary"}},
        {"type": "section", "text": {"type": "mrkdwn",
            "text": f"*Orders:* {summary['orders']}\\n*Revenue:* Rs {summary['revenue']:,}\\n*Top product:* {summary['top_product']}"}},
    ],
}
r = requests.post(os.environ["SLACK_WEBHOOK_URL"], json=payload, timeout=10)
print(r.status_code, r.text)
`,
      result: `200 ok`,
      explanation: "Slack webhooks accept JSON. 'text' is required as a fallback for notifications; 'blocks' (Block Kit) give rich formatting with headers and bold text using Slack's mrkdwn syntax (*bold*). A successful post returns status 200 with body 'ok'. Anyone with the webhook URL can post to the channel, so keep it secret.",
    },
  ],
  interview: [
    { q: "Which Python modules are used to send email?", a: "`smtplib` to connect to an SMTP server and send, and the `email` package (`email.message.EmailMessage`) to build headers, body and attachments. Both are in the standard library.", level: "Easy" },
    { q: "What is the difference between port 587 and 465?", a: "587 is the submission port using STARTTLS: the connection starts unencrypted and is upgraded with server.starttls(). 465 uses implicit TLS from the first byte, with smtplib.SMTP_SSL. Both are secure when used correctly.", level: "Medium" },
    { q: "Why use an App Password for Gmail?", a: "Google blocks normal passwords for SMTP from scripts. An app password is a separate 16-character password generated after enabling 2-Step Verification, scoped to one app and revocable without changing your main password.", level: "Easy" },
    { q: "How do you send both HTML and plain-text versions?", a: "Call `msg.set_content(text)` and then `msg.add_alternative(html, subtype='html')`. This creates multipart/alternative; clients show the richest version they support.", level: "Medium" },
    { q: "How do you attach a file correctly?", a: "Read it as bytes, determine the MIME type with mimetypes.guess_type() (default application/octet-stream), and call msg.add_attachment(data, maintype=..., subtype=..., filename=...).", level: "Easy" },
    { q: "How do you hide recipients when sending one email to many people?", a: "Put addresses in Bcc and pass them to send_message(msg, to_addrs=[...]) without exposing them in the To header, or better, send an individual personalised message to each recipient.", level: "Medium" },
    { q: "Your bulk email script must send to 2,000 customers. What do you consider?", a: "Provider limits (Gmail ~500/day; use SES/SendGrid for volume), one reused SMTP connection, throttling, retries for temporary failures, logging of sent/failed addresses so a restart does not resend, unsubscribe links and consent (anti-spam rules), SPF/DKIM/DMARC for deliverability, and a dry run first.", level: "Hard" },
    { q: "What is the difference between a Slack incoming webhook and a bot token?", a: "An incoming webhook is a secret URL that only posts messages to one fixed channel; very simple. A bot token (xoxb-) used with the Web API (chat.postMessage) can post to many channels, read messages, upload files and react to events, with permission scopes.", level: "Medium" },
    { q: "How do you find the chat_id for a Telegram bot?", a: "Send a message to the bot, then call https://api.telegram.org/bot<TOKEN>/getUpdates; the response contains message.chat.id. Group chat ids are negative numbers.", level: "Medium" },
    { q: "How would you test email code without spamming real people?", a: "Use dry-run mode, send only to yourself or a test inbox, use a local SMTP debugging server (e.g. `python -m aiosmtpd -n -l localhost:8025`) or a service like Mailtrap, and unit-test message building separately from sending by mocking smtplib.", level: "Hard" },
    { q: "Why might emails sent from a script land in spam?", a: "Missing SPF/DKIM/DMARC for the sending domain, a From address that does not match the authenticated account, spammy subject/content, only HTML without text part, sending too many too fast, or attachments like .exe/.zip. Use a proper sending domain and a reputable provider.", level: "Hard" },
  ],
  practice: [
    {
      task: "Write a function build_message(to, subject, body) that returns an EmailMessage with From read from the SMTP_USER environment variable (default 'bot@example.com').",
      hint: "os.getenv('SMTP_USER', 'bot@example.com').",
      solution: `import os
from email.message import EmailMessage

def build_message(to, subject, body):
    msg = EmailMessage()
    msg["From"] = os.getenv("SMTP_USER", "bot@example.com")
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    return msg

print(build_message("a@example.com", "Hi", "Test")["From"])
`,
    },
    {
      task: "Write a function attach_files(msg, paths) that attaches every file in the list and skips files that do not exist with a warning.",
      hint: "Use Path.exists(), mimetypes.guess_type and add_attachment.",
      solution: `import mimetypes
from pathlib import Path

def attach_files(msg, paths):
    for p in map(Path, paths):
        if not p.exists():
            print("WARNING: missing", p)
            continue
        ctype, _ = mimetypes.guess_type(p.name)
        maintype, subtype = (ctype or "application/octet-stream").split("/", 1)
        msg.add_attachment(p.read_bytes(), maintype=maintype, subtype=subtype, filename=p.name)
    return msg
`,
    },
    {
      task: "Write send_all(messages) that reuses ONE SMTP connection to send a list of EmailMessage objects and returns lists of sent and failed recipients.",
      hint: "Open smtplib.SMTP once in a with block; wrap each send_message in try/except smtplib.SMTPException.",
      solution: `import os, ssl, smtplib, time

def send_all(messages):
    sent, failed = [], []
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as s:
        s.starttls(context=ssl.create_default_context())
        s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        for msg in messages:
            try:
                s.send_message(msg)
                sent.append(msg["To"])
            except smtplib.SMTPException as e:
                failed.append((msg["To"], str(e)))
            time.sleep(1)
    return sent, failed
`,
    },
    {
      task: "Create a function alert(text) that posts to Slack if SLACK_WEBHOOK_URL is set, otherwise to Telegram if TG_TOKEN is set, otherwise just prints the text.",
      hint: "Check os.getenv for each variable in order.",
      solution: `import os
import requests

def alert(text):
    if os.getenv("SLACK_WEBHOOK_URL"):
        requests.post(os.environ["SLACK_WEBHOOK_URL"], json={"text": text}, timeout=10)
    elif os.getenv("TG_TOKEN") and os.getenv("TG_CHAT_ID"):
        requests.post(f"https://api.telegram.org/bot{os.environ['TG_TOKEN']}/sendMessage",
                      json={"chat_id": os.environ["TG_CHAT_ID"], "text": text}, timeout=10)
    else:
        print("ALERT:", text)

alert("Disk usage above 90%")
`,
    },
  ],
  quiz: [
    { question: "Which class is recommended for building emails in modern Python?", options: ["email.mime.MIMEText only", "email.message.EmailMessage", "smtplib.Message", "mail.Message"], answer: 1, explanation: "EmailMessage (Python 3.6+) provides set_content, add_alternative and add_attachment." },
    { question: "What does server.starttls() do?", options: ["Logs in", "Upgrades the connection to encrypted TLS", "Sends the message", "Closes the connection"], answer: 1, explanation: "STARTTLS upgrades a plain SMTP connection (port 587) to TLS." },
    { question: "Where should the Gmail app password be stored?", options: ["In the script", "In the email subject", "In an environment variable or secrets store", "In a public README"], answer: 2, explanation: "Secrets must never be hardcoded or committed." },
    { question: "Which method adds an HTML version of the body?", options: ["msg.add_html()", "msg.add_alternative(html, subtype='html')", "msg.set_html()", "msg.attach_html()"], answer: 1, explanation: "add_alternative creates multipart/alternative with text and HTML." },
    { question: "What does a Slack incoming webhook return on success?", options: ["201 Created", "200 with body 'ok'", "204 No Content", "302 Redirect"], answer: 1, explanation: "Slack webhooks respond with HTTP 200 and the text 'ok'." },
    { question: "Which is the safest first step before running a bulk email script?", options: ["Send to all customers at once", "Run in dry-run mode and send only to yourself", "Disable TLS", "Remove error handling"], answer: 1, explanation: "Previewing and self-testing prevents embarrassing or harmful mistakes." },
  ],
};
