export default {
  lesson: 'day-07-sending-emails-and-notifications',
  minutes: 30,
  intro: 'Build emails with email.message.EmailMessage (text, HTML, attachments), personalise bulk mails safely with a dry run, and know how smtplib, app passwords, Telegram and Slack alerts work.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Which is the correct way to send mail through Gmail from a script?',
      options: ['Put your normal Gmail password in the script', 'Turn on 2-Step Verification, create an **App Password**, keep it in an environment variable and use `smtplib.SMTP_SSL("smtp.gmail.com", 465)` + `login()`', 'Use port 25 without login', 'Email the password to yourself and read it from your inbox'],
      answer: 1,
      explain: 'Gmail/Outlook block normal-password logins from scripts. An app password is a separate 16-character password you can revoke anytime. Read it with `os.environ["GMAIL_APP_PASSWORD"]` so it never lands in Git. Port 465 = SSL; port 587 = `SMTP` + `starttls()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Build a report email (offline).** Write `build_email(to, name, total)` that returns an `EmailMessage` with:\n- `From`: `reports@upskillr.in`, `To`: `to`, `Subject`: `Daily sales report - <name>`\n- a plain-text body containing `Hi <name>, total sales today: Rs <total>`\n- an HTML alternative (`add_alternative(..., subtype="html")`) with the total in `<b>…</b>`\n- an attachment `report.csv` with the content `item,amount\\nPen,120\\n` (maintype `text`, subtype `csv`)',
      example: { title: 'EmailMessage', code: 'from email.message import EmailMessage\nmsg = EmailMessage()\nmsg["Subject"] = "Hello"\nmsg.set_content("plain text")\nmsg.add_alternative("<p>html</p>", subtype="html")\nmsg.add_attachment(b"data", maintype="application", subtype="octet-stream", filename="x.bin")' },
      starter: 'from email.message import EmailMessage\n\ndef build_email(to, name, total):\n    # TODO\n    pass\n',
      solution: `from email.message import EmailMessage

def build_email(to, name, total):
    msg = EmailMessage()
    msg["From"] = "reports@upskillr.in"
    msg["To"] = to
    msg["Subject"] = f"Daily sales report - {name}"
    msg.set_content(f"Hi {name}, total sales today: Rs {total}")
    msg.add_alternative(f"<p>Hi {name}, total sales today: <b>Rs {total}</b></p>", subtype="html")
    msg.add_attachment("item,amount\\nPen,120\\n".encode(), maintype="text", subtype="csv", filename="report.csv")
    return msg
`,
      tests: [
        { call: '(lambda m: [m["To"], m["Subject"], m["From"]])(build_email("asha@shop.in", "Asha", 15400))', expect: ['asha@shop.in', 'Daily sales report - Asha', 'reports@upskillr.in'] },
        { call: '"total sales today: Rs 15400" in build_email("a@b.in", "Asha", 15400).get_body(("plain",)).get_content()', expect: true },
        { call: '"<b>" in build_email("a@b.in", "Asha", 15400).get_body(("html",)).get_content()', expect: true, msg: 'add an HTML alternative with the total in <b>' },
        { call: '[(a.get_filename(), a.get_content_type()) for a in build_email("a@b.in", "Asha", 1).iter_attachments()]', expect: [['report.csv', 'text/csv']] },
      ],
      explain: '`set_content` = plain text (shown by simple clients and used by spam filters), `add_alternative` = HTML version, `add_attachment` turns the message into multipart/mixed automatically. Building the message in a function lets you test it offline; sending is just `smtp.send_message(msg)`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Bulk personalised mails – dry run.** `contacts` is a CSV text with `name,email,due`. Write `plan_mails(csv_text, template)` that returns a list of `(email, body)` for every row, filling `{name}` and `{due}` in the template with `str.format`. **Skip** rows whose email has no `@` and rows whose `due` is 0.',
      example: { title: 'reading CSV text', code: 'import csv, io\nfor row in csv.DictReader(io.StringIO("a,b\\n1,2\\n")):\n    print(row["a"], row["b"])' },
      starter: 'import csv, io\n\ndef plan_mails(csv_text, template):\n    # TODO\n    pass\n',
      solution: 'import csv, io\n\ndef plan_mails(csv_text, template):\n    out = []\n    for row in csv.DictReader(io.StringIO(csv_text)):\n        email = row["email"].strip()\n        if "@" not in email or float(row["due"]) == 0:\n            continue\n        out.append((email, template.format(name=row["name"].strip(), due=row["due"].strip())))\n    return out\n',
      tests: [
        { call: 'plan_mails("name,email,due\\nAsha,asha@x.in,1500\\nRavi,ravi-at-x.in,800\\nNeha,neha@x.in,0\\nKaran,karan@x.in,250\\n", "Dear {name}, Rs {due} is pending.")', expect: [['asha@x.in', 'Dear Asha, Rs 1500 is pending.'], ['karan@x.in', 'Dear Karan, Rs 250 is pending.']] },
        { call: 'plan_mails("name,email,due\\n", "x")', expect: [] },
      ],
      explain: 'Always generate and review the full list (a dry run) before sending hundreds of emails – a wrong template or bad data cannot be "unsent". In the real loop, wrap each `send_message` in try/except, log failures and add a short pause to respect provider limits.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about instant notifications are TRUE? (choose all that apply)',
      options: ['A Telegram bot sends a message with a POST to `https://api.telegram.org/bot<TOKEN>/sendMessage` with `chat_id` and `text`', 'A Slack incoming webhook accepts a POST with JSON like `{"text": "Report ready"}`', 'Bot tokens and webhook URLs are secrets – keep them in environment variables', 'Webhook URLs are safe to paste in public GitHub repos', 'Alerts are useful when a scheduled job fails'],
      answers: [0, 1, 2, 4],
      explain: 'Anyone with a webhook URL or bot token can post as your bot, so treat them like passwords. A common pattern: the job emails the report on success and sends a short Telegram/Slack alert on failure.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that upgrades a plain SMTP connection on port 587 to an encrypted one:\n\n`with smtplib.SMTP("smtp.office365.com", 587) as s:\n    s.____()\n    s.login(user, pwd)`',
      accept: ['starttls'],
      explain: '`starttls()` switches the connection to TLS before you send the password. With port 465 you use `smtplib.SMTP_SSL`, which is encrypted from the start. Never send credentials over an unencrypted connection.',
    },
  ],
};
