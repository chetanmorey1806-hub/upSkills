export default {
  id: "day-10-project-daily-sales-report-bot",
  title: "Project: Automated Daily Sales Report Bot + Automation Interview Questions",
  module: "Module 4: Project",
  day: 10,
  level: "Advanced",
  duration: "4 hours",
  summary: "Combine everything from this course into one portfolio project: a bot that reads daily sales data, summarises it with pandas, writes a formatted Excel report with a chart, emails it to the manager and runs every morning on a schedule with logging, retries and a dry-run mode. Finish with the most common Python automation interview questions.",
  objectives: [
    "Design a clean project structure with config, logging and separate pipeline steps",
    "Read and validate raw sales data and summarise it with pandas",
    "Generate a multi-sheet, formatted Excel report with a chart using openpyxl",
    "Email the report with an HTML summary and attachment, with dry-run and error alerts",
    "Schedule, test and explain the project confidently in interviews",
  ],
  theory: [
    {
      heading: "Project Overview and Architecture",
      content: "Business problem: every morning a sales coordinator downloads yesterday's orders, builds pivot tables in Excel, formats them, and emails the manager. It takes 45 minutes and errors creep in. Our bot does it in seconds at 8:00 AM.\n\nThe pipeline has four independent steps. Keeping them as separate functions makes the code easy to test and to change (for example, reading from a database instead of CSV later).",
      points: [
        "1. Extract: read orders.csv (or an API / database) and validate columns",
        "2. Transform: pandas summary by region and product, KPIs (revenue, orders, average order value)",
        "3. Load / Report: Excel workbook with Summary, By Region, By Product and Raw Data sheets plus a chart",
        "4. Deliver: email with HTML KPIs and the attachment; Telegram/Slack alert if anything fails",
      ],
    },
    {
      heading: "Project Structure and Configuration",
      content: "Separate code, configuration, data and output. Settings that change between environments (recipients, SMTP server, folders) go in a config file or environment variables, and secrets only in environment variables. Use a virtual environment and a `requirements.txt` so the bot runs identically on your laptop and the server.",
      syntax: `sales_bot/
├── .venv/
├── .env                 # SMTP_USER, SMTP_PASS (never commit!)
├── .gitignore           # .venv/ .env output/ logs/
├── config.json          # recipients, folders, subject
├── requirements.txt     # pandas, openpyxl, python-dotenv
├── data/orders.csv
├── output/              # generated reports
├── logs/
└── bot.py               # main(): extract -> transform -> report -> deliver
`,
      tip: "pip freeze > requirements.txt records exact versions; on the server run pip install -r requirements.txt.",
    },
    {
      heading: "Data Validation: Fail Early and Loudly",
      content: "Real data is messy. Before calculating anything, check that required columns exist, types are correct, there are no negative quantities, and the file is not empty or stale (yesterday's date). If validation fails, do not send a wrong report: stop, log the problem and alert the team. A wrong number in front of a manager is worse than a late report.",
      points: [
        "Required columns present: set(REQUIRED) - set(df.columns) should be empty",
        "Parse dates with pd.to_datetime(errors='coerce') and count failures",
        "Drop exact duplicate order IDs and log how many were removed",
        "Compare today's totals with the 7-day average to flag suspicious spikes",
      ],
    },
    {
      heading: "Building the Report",
      content: "pandas does the maths: `groupby().agg()` with named aggregations, `pivot_table()` for region x product, `nlargest()` for top products. Then `pd.ExcelWriter(engine=\"openpyxl\")` writes all sheets in one go, and through `writer.book` / `writer.sheets` you can apply openpyxl formatting (header style, number formats, widths, freeze panes) and add a bar chart before the file is saved.",
      syntax: `with pd.ExcelWriter(path, engine="openpyxl") as writer:
    kpis.to_excel(writer, sheet_name="Summary", index=False)
    by_region.to_excel(writer, sheet_name="By Region", index=False)
    ws = writer.sheets["By Region"]          # openpyxl worksheet
    ws.freeze_panes = "A2"
`,
    },
    {
      heading: "Delivery, Dry Run and Alerts",
      content: "The email contains a short HTML table of KPIs (so the manager can read it on the phone) and the Excel file as an attachment. A `--dry-run` flag builds everything but saves the email to an .eml file instead of sending it, which is perfect for testing. Wrap `main()` in try/except: on failure log the traceback, send an alert to Telegram/Slack (Day 7) and exit with code 1 so the scheduler records the failure.",
      points: [
        "Retry SMTP sending on temporary errors (Day 8 retry decorator)",
        "Never email customers' personal data unless required and protected",
        "Keep generated reports for 30 days and delete older ones automatically (Day 1)",
      ],
    },
    {
      heading: "Scheduling and Presenting the Project",
      content: "Schedule `bot.py` with cron (`0 8 * * 1-6`) or Task Scheduler at 08:00 Monday to Saturday, using the virtual environment's Python and absolute paths. In interviews and on your resume, describe the business impact with numbers and the engineering decisions you made.",
      points: [
        "Resume line: 'Built a Python bot that automated the daily sales MIS report (pandas, openpyxl, smtplib), saving ~15 hours per month and eliminating manual errors.'",
        "Be ready to explain: validation, idempotency, logging, retries, secrets handling, scheduling",
        "Extensions: read from MySQL with SQLAlchemy, add a Streamlit dashboard, send WhatsApp via an official Business API provider, deploy on a cloud VM",
      ],
    },
  ],
  examples: [
    {
      title: "Step 1: Create Sample Data and Summarise with the Standard Library",
      scenario: "Start the project without any installs: generate a small orders CSV, validate it and compute KPIs with csv and collections. This is also a useful fallback when pandas is not available.",
      steps: [
        "No pip install needed",
        "Create the sales_bot folder and save this as step1.py",
        "Run: python step1.py",
      ],
      code: `import csv
from collections import defaultdict
from pathlib import Path

ROWS = [
    ("O101", "2025-11-17", "North", "Laptop", 2, 55000),
    ("O102", "2025-11-17", "South", "Mobile", 5, 18000),
    ("O103", "2025-11-17", "North", "Mouse", 10, 600),
    ("O104", "2025-11-17", "West", "Laptop", 1, 55000),
    ("O105", "2025-11-17", "South", "Mouse", 4, 600),
    ("O106", "2025-11-17", "West", "Mobile", 3, 18000),
    ("O106", "2025-11-17", "West", "Mobile", 3, 18000),
    ("O107", "2025-11-17", "East", "Tablet", -2, 25000),
]
Path("data").mkdir(exist_ok=True)
with open("data/orders.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["order_id", "date", "region", "product", "qty", "price"])
    w.writerows(ROWS)

seen, clean, problems = set(), [], []
with open("data/orders.csv", newline="") as f:
    for row in csv.DictReader(f):
        qty, price = int(row["qty"]), int(row["price"])
        if row["order_id"] in seen:
            problems.append(f"duplicate {row['order_id']}")
            continue
        if qty <= 0:
            problems.append(f"bad qty {qty} in {row['order_id']}")
            continue
        seen.add(row["order_id"])
        clean.append({**row, "revenue": qty * price})

by_region = defaultdict(int)
for r in clean:
    by_region[r["region"]] += r["revenue"]

revenue = sum(r["revenue"] for r in clean)
print("Problems:", problems)
print(f"Orders: {len(clean)} | Revenue: Rs {revenue:,} | Avg order: Rs {revenue / len(clean):,.0f}")
for region, amount in sorted(by_region.items(), key=lambda kv: -kv[1]):
    print(f"  {region:<6} Rs {amount:>8,}  ({amount / revenue:.1%})")
`,
      result: `Problems: ['duplicate O106', 'bad qty -2 in O107']
Orders: 6 | Revenue: Rs 317,400 | Avg order: Rs 52,900
  North  Rs  116,000  (36.5%)
  West   Rs  109,000  (34.3%)
  South  Rs   92,400  (29.1%)`,
      explanation: "We write deliberately messy sample data (a duplicate order and a negative quantity) to prove that validation works. csv.DictReader gives each row as a dict; a set tracks seen order IDs. defaultdict(int) accumulates revenue per region. Format specs like {:,} add thousands separators and {:.1%} shows percentages.",
      python: {
        files: {
          "main.py": `import csv
from collections import defaultdict
from pathlib import Path

ROWS = [
    ("O101", "2025-11-17", "North", "Laptop", 2, 55000),
    ("O102", "2025-11-17", "South", "Mobile", 5, 18000),
    ("O103", "2025-11-17", "North", "Mouse", 10, 600),
    ("O104", "2025-11-17", "West", "Laptop", 1, 55000),
    ("O105", "2025-11-17", "South", "Mouse", 4, 600),
    ("O106", "2025-11-17", "West", "Mobile", 3, 18000),
    ("O106", "2025-11-17", "West", "Mobile", 3, 18000),
    ("O107", "2025-11-17", "East", "Tablet", -2, 25000),
]
Path("data").mkdir(exist_ok=True)
with open("data/orders.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["order_id", "date", "region", "product", "qty", "price"])
    w.writerows(ROWS)

seen, clean, problems = set(), [], []
with open("data/orders.csv", newline="") as f:
    for row in csv.DictReader(f):
        qty, price = int(row["qty"]), int(row["price"])
        if row["order_id"] in seen:
            problems.append(f"duplicate {row['order_id']}")
            continue
        if qty <= 0:
            problems.append(f"bad qty {qty} in {row['order_id']}")
            continue
        seen.add(row["order_id"])
        clean.append({**row, "revenue": qty * price})

by_region = defaultdict(int)
for r in clean:
    by_region[r["region"]] += r["revenue"]

revenue = sum(r["revenue"] for r in clean)
print("Problems:", problems)
print(f"Orders: {len(clean)} | Revenue: Rs {revenue:,} | Avg order: Rs {revenue / len(clean):,.0f}")
for region, amount in sorted(by_region.items(), key=lambda kv: -kv[1]):
    print(f"  {region:<6} Rs {amount:>8,}  ({amount / revenue:.1%})")
`,
        },
      },
    },
    {
      title: "Step 2: Load, Validate and Summarise with pandas",
      scenario: "Replace the manual loops with pandas: load orders.csv, validate it, and build the KPI table, region summary and top products.",
      steps: [
        "Install: pip install pandas openpyxl",
        "Run step1.py first so data/orders.csv exists",
        "Save as step2.py and run: python step2.py",
      ],
      code: `import pandas as pd

REQUIRED = {"order_id", "date", "region", "product", "qty", "price"}

def load_orders(path):
    df = pd.read_csv(path, parse_dates=["date"])
    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")
    before = len(df)
    df = df.drop_duplicates(subset="order_id")
    df = df[df["qty"] > 0].copy()
    print(f"Removed {before - len(df)} bad rows")
    df["revenue"] = df["qty"] * df["price"]
    return df

def summarise(df):
    kpis = pd.DataFrame({
        "Metric": ["Orders", "Units", "Revenue", "Avg Order Value"],
        "Value": [len(df), int(df["qty"].sum()), int(df["revenue"].sum()),
                  round(df["revenue"].mean())],
    })
    by_region = (df.groupby("region", as_index=False)
                   .agg(orders=("order_id", "count"), revenue=("revenue", "sum"))
                   .sort_values("revenue", ascending=False))
    by_product = (df.groupby("product", as_index=False)
                    .agg(units=("qty", "sum"), revenue=("revenue", "sum"))
                    .nlargest(3, "revenue"))
    return kpis, by_region, by_product

df = load_orders("data/orders.csv")
kpis, by_region, by_product = summarise(df)
print(kpis.to_string(index=False))
print(by_region.to_string(index=False))
print(by_product.to_string(index=False))
`,
      result: `Removed 2 bad rows
         Metric  Value
         Orders      6
          Units     25
        Revenue 317400
Avg Order Value  52900
region  orders  revenue
 North       2   116000
  West       2   109000
 South       2    92400
product  units  revenue
 Laptop      3   165000
 Mobile      8   144000
  Mouse     14     8400`,
      explanation: "load_orders() fails loudly if columns are missing, then removes duplicates and invalid quantities and computes revenue. summarise() returns three DataFrames: a KPI table, a region summary (named aggregation with count and sum) and the top 3 products with nlargest(). Keeping load and summarise as separate functions makes each easy to unit-test.",
    },
    {
      title: "Step 3: Write a Formatted Multi-Sheet Excel Report with a Chart",
      scenario: "Turn the DataFrames into a professional Excel file: one sheet per table, styled headers, number formats, auto widths, frozen headers and a revenue-by-region bar chart.",
      steps: [
        "Install: pip install pandas openpyxl",
        "Save as report.py in the same folder as step2.py (it imports load_orders and summarise; first wrap step2's last 5 lines in if __name__ == \"__main__\":)",
        "Run: python report.py and open the file in output/",
      ],
      code: `from datetime import date
from pathlib import Path
import pandas as pd
from openpyxl.styles import Font, PatternFill
from openpyxl.chart import BarChart, Reference
from step2 import load_orders, summarise

HEADER_FONT = Font(bold=True, color="FFFFFF")
HEADER_FILL = PatternFill(fill_type="solid", start_color="1F4E78")

def style_sheet(ws, money_cols=()):
    for cell in ws[1]:
        cell.font, cell.fill = HEADER_FONT, HEADER_FILL
    for col in ws.columns:
        width = max(len(str(c.value)) for c in col if c.value is not None) + 3
        ws.column_dimensions[col[0].column_letter].width = width
        if col[0].value in money_cols:
            for c in col[1:]:
                c.number_format = "#,##0"
    ws.freeze_panes = "A2"

def build_report(df, kpis, by_region, by_product, out_dir="output"):
    Path(out_dir).mkdir(exist_ok=True)
    path = Path(out_dir) / f"sales_report_{date.today():%Y-%m-%d}.xlsx"
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        kpis.to_excel(writer, sheet_name="Summary", index=False)
        by_region.to_excel(writer, sheet_name="By Region", index=False)
        by_product.to_excel(writer, sheet_name="Top Products", index=False)
        df.assign(date=df["date"].dt.date).to_excel(writer, sheet_name="Raw Data", index=False)

        style_sheet(writer.sheets["Summary"], money_cols=("Value",))
        style_sheet(writer.sheets["By Region"], money_cols=("revenue",))
        style_sheet(writer.sheets["Top Products"], money_cols=("revenue",))
        style_sheet(writer.sheets["Raw Data"], money_cols=("price", "revenue"))

        ws = writer.sheets["By Region"]
        chart = BarChart()
        chart.title = "Revenue by Region"
        chart.add_data(Reference(ws, min_col=3, min_row=1, max_row=ws.max_row), titles_from_data=True)
        chart.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))
        ws.add_chart(chart, "E2")
    return path

if __name__ == "__main__":
    df = load_orders("data/orders.csv")
    path = build_report(df, *summarise(df))
    print("Report saved:", path)
`,
      result: `Removed 2 bad rows
Report saved: output/sales_report_2025-11-18.xlsx
(the workbook has 4 styled sheets and a bar chart on 'By Region'; the date is today's date)`,
      explanation: "ExcelWriter writes all four sheets into one file. writer.sheets gives the openpyxl worksheet for each sheet, so we can style it before the file is saved when the with block ends. style_sheet() colours headers, sizes columns from the longest value and formats money columns. The chart references the revenue column (column 3) including its header for the series name. The file name contains the date so every day's report is kept separately.",
    },
    {
      title: "Step 4: The Complete Bot with Email, Logging, Dry Run and Alerts",
      scenario: "Wire everything together into bot.py: CLI flags, logging to file, email with an HTML KPI table and the Excel attachment, a retry for SMTP, and a Telegram alert plus exit code 1 on failure.",
      steps: [
        "Install: pip install pandas openpyxl requests python-dotenv",
        "Create .env with SMTP_USER, SMTP_PASS (Gmail app password), REPORT_TO, and optionally TG_TOKEN, TG_CHAT_ID",
        "Test: python bot.py --dry-run (saves output/preview.eml instead of sending)",
        "Send for real: python bot.py   |   Schedule: 0 8 * * 1-6 /path/.venv/bin/python /path/bot.py",
      ],
      code: `import argparse, logging, os, smtplib, ssl, sys, time
from email.message import EmailMessage
from pathlib import Path
import requests
from dotenv import load_dotenv
from step2 import load_orders, summarise
from report import build_report

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")
(BASE / "logs").mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s",
                    handlers=[logging.FileHandler(BASE / "logs" / "bot.log", encoding="utf-8"),
                              logging.StreamHandler()])
log = logging.getLogger("sales_bot")

def build_email(kpis, report_path):
    msg = EmailMessage()
    msg["Subject"] = f"Daily Sales Report - {report_path.stem[-10:]}"
    msg["From"] = os.environ["SMTP_USER"]
    msg["To"] = os.environ["REPORT_TO"]
    text = "\\n".join(f"{m}: {v:,}" for m, v in kpis.itertuples(index=False))
    msg.set_content(f"Hello,\\n\\n{text}\\n\\nThe full report is attached.\\n- Sales Bot")
    msg.add_alternative("<h3>Daily Sales</h3>" + kpis.to_html(index=False) + "<p>Full report attached.</p>", subtype="html")
    msg.add_attachment(report_path.read_bytes(), maintype="application",
                       subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                       filename=report_path.name)
    return msg

def send_email(msg, attempts=3):
    for i in range(1, attempts + 1):
        try:
            with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as s:
                s.starttls(context=ssl.create_default_context())
                s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
                s.send_message(msg)
            return
        except smtplib.SMTPAuthenticationError:
            raise                                   # permanent: do not retry
        except (smtplib.SMTPException, OSError) as e:
            log.warning("Send attempt %d failed: %s", i, e)
            if i == attempts:
                raise
            time.sleep(2 ** i)

def alert(text):
    if os.getenv("TG_TOKEN") and os.getenv("TG_CHAT_ID"):
        requests.post(f"https://api.telegram.org/bot{os.environ['TG_TOKEN']}/sendMessage",
                      json={"chat_id": os.environ["TG_CHAT_ID"], "text": text}, timeout=10)

def main():
    parser = argparse.ArgumentParser(description="Daily sales report bot")
    parser.add_argument("--data", default=str(BASE / "data" / "orders.csv"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    log.info("Bot started (dry_run=%s)", args.dry_run)
    df = load_orders(args.data)
    kpis, by_region, by_product = summarise(df)
    report = build_report(df, kpis, by_region, by_product, out_dir=BASE / "output")
    log.info("Report created: %s", report.name)
    msg = build_email(kpis, report)
    if args.dry_run:
        (BASE / "output" / "preview.eml").write_bytes(bytes(msg))
        log.info("Dry run: email saved to output/preview.eml")
    else:
        send_email(msg)
        log.info("Email sent to %s", msg["To"])
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        log.exception("Bot failed")
        alert(f"Sales bot FAILED: {e}")
        sys.exit(1)
`,
      result: `2025-11-18 08:00:01,204 | INFO | Bot started (dry_run=True)
Removed 2 bad rows
2025-11-18 08:00:01,690 | INFO | Report created: sales_report_2025-11-18.xlsx
2025-11-18 08:00:01,702 | INFO | Dry run: email saved to output/preview.eml
(without --dry-run the last line is: INFO | Email sent to manager@yourcompany.com)`,
      explanation: "The bot reuses the tested step functions, so bot.py only orchestrates. load_dotenv reads secrets from .env, logging writes to both the console and logs/bot.log. The email has a plain-text and an HTML version (kpis.to_html) plus the .xlsx attachment with its official MIME type. send_email retries temporary errors with backoff but not authentication failures. --dry-run writes a .eml file you can open in any mail client. Any exception is logged with a traceback, triggers a Telegram alert and exits with code 1 for the scheduler.",
    },
    {
      title: "Step 5: Preview the Email Body Offline (Test without Sending)",
      scenario: "Unit-test the message-building part of the bot without pandas, SMTP or internet: build the KPI text and EmailMessage from fixed numbers and check the result.",
      steps: [
        "No pip install needed",
        "Run: python main.py",
        "Use this pattern in pytest: assert on the subject, recipients and attachment names",
      ],
      code: `from email.message import EmailMessage

kpis = [("Orders", 6), ("Units", 25), ("Revenue", 317400), ("Avg Order Value", 52900)]
report_name = "sales_report_2025-11-18.xlsx"

def build_email(kpis, report_name, to, attachment_bytes=b"demo"):
    msg = EmailMessage()
    msg["Subject"] = f"Daily Sales Report - {report_name[13:23]}"
    msg["From"] = "sales.bot@example.com"
    msg["To"] = to
    lines = [f"{metric:<16}{value:>10,}" for metric, value in kpis]
    msg.set_content("Hello,\\n\\n" + "\\n".join(lines) + "\\n\\nThe full report is attached.")
    msg.add_attachment(attachment_bytes, maintype="application",
                       subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                       filename=report_name)
    return msg

msg = build_email(kpis, report_name, "manager@example.com")
body = msg.get_body(preferencelist=("plain",)).get_content()
attachments = [p.get_filename() for p in msg.iter_attachments()]

print("Subject:", msg["Subject"])
print(body.strip())
print("Attachments:", attachments)
assert msg["Subject"].endswith("2025-11-18")
assert attachments == [report_name]
print("All checks passed")
`,
      result: `Subject: Daily Sales Report - 2025-11-18
Hello,

Orders                   6
Units                   25
Revenue            317,400
Avg Order Value     52,900

The full report is attached.
Attachments: ['sales_report_2025-11-18.xlsx']
All checks passed`,
      explanation: "Separating 'build the message' from 'send the message' makes the bot testable. get_body(preferencelist=('plain',)) returns the text part even after an attachment turned the message into multipart/mixed, and iter_attachments() lists attachments. Slicing the file name [13:23] extracts the date. The assert statements are a mini test: if someone changes the subject format by mistake, the check fails before any real email goes out.",
      python: {
        files: {
          "main.py": `from email.message import EmailMessage

kpis = [("Orders", 6), ("Units", 25), ("Revenue", 317400), ("Avg Order Value", 52900)]
report_name = "sales_report_2025-11-18.xlsx"

def build_email(kpis, report_name, to, attachment_bytes=b"demo"):
    msg = EmailMessage()
    msg["Subject"] = f"Daily Sales Report - {report_name[13:23]}"
    msg["From"] = "sales.bot@example.com"
    msg["To"] = to
    lines = [f"{metric:<16}{value:>10,}" for metric, value in kpis]
    msg.set_content("Hello,\\n\\n" + "\\n".join(lines) + "\\n\\nThe full report is attached.")
    msg.add_attachment(attachment_bytes, maintype="application",
                       subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                       filename=report_name)
    return msg

msg = build_email(kpis, report_name, "manager@example.com")
body = msg.get_body(preferencelist=("plain",)).get_content()
attachments = [p.get_filename() for p in msg.iter_attachments()]

print("Subject:", msg["Subject"])
print(body.strip())
print("Attachments:", attachments)
assert msg["Subject"].endswith("2025-11-18")
assert attachments == [report_name]
print("All checks passed")
`,
        },
      },
    },
  ],
  interview: [
    { q: "Walk me through an automation project you built.", a: "Use the STAR format. Situation: the sales team spent 45 minutes daily on a manual Excel MIS report. Task: automate it end to end. Action: Python bot that validates the CSV, summarises with pandas, writes a formatted multi-sheet workbook with openpyxl, emails it with smtplib, runs via cron at 8 AM, with logging, retries, dry-run and Telegram alerts. Result: ~15 hours/month saved, zero manual errors, report arrives before the morning meeting.", level: "Medium" },
    { q: "How do you decide whether a task is worth automating?", a: "Estimate frequency x time per run x number of people versus build and maintenance cost; consider error risk, compliance needs and how stable the process/inputs are. Repetitive, rule-based, high-volume and error-prone tasks with stable inputs are the best candidates.", level: "Easy" },
    { q: "What is your order of preference for getting data from a system?", a: "1) Official API or database access, 2) export files (CSV/Excel) or email reports, 3) HTML scraping of public pages respecting robots.txt and ToS, 4) browser automation (Selenium/Playwright), 5) desktop GUI automation (pyautogui) as a last resort. Higher options are more stable, faster and more clearly permitted.", level: "Medium" },
    { q: "How do you handle secrets in automation scripts?", a: "Environment variables or a .env file excluded from Git (loaded with python-dotenv), or a secrets manager/OS keyring in production. Use app passwords or tokens with minimum permissions, never log them, rotate them, and revoke immediately if leaked.", level: "Medium" },
    { q: "What makes an automation job production-ready?", a: "Input validation, logging with rotation, clear error handling and alerts, retries with backoff for transient errors, idempotency (safe re-runs), a lock against overlapping runs, configuration outside code, dry-run mode, tests for core functions, pinned dependencies, documented setup and proper exit codes for the scheduler.", level: "Hard" },
    { q: "How do you make a daily job idempotent?", a: "Name outputs by date and overwrite rather than append, record processed IDs or a 'last run' marker, check if today's email was already sent before sending, and use upserts in databases. Then re-running after a failure does not duplicate reports or emails.", level: "Hard" },
    { q: "Your bot failed at 8 AM and nobody noticed until noon. How would you prevent this?", a: "Alert on failure (Telegram/Slack/email) from the exception handler, exit with non-zero codes so the scheduler marks failures, add a heartbeat/dead-man's switch (e.g. healthchecks.io) that alerts when the success ping does not arrive, and monitor log freshness.", level: "Medium" },
    { q: "pandas vs openpyxl in the report step: why use both?", a: "pandas does fast data manipulation and writes tables; openpyxl provides cell-level control for styling, widths, freeze panes, number formats and charts. Using ExcelWriter with engine='openpyxl' lets you write with pandas and then format via writer.sheets.", level: "Medium" },
    { q: "How would you test this bot?", a: "Unit-test pure functions (load/validate, summarise, build_email) with small fixture files and asserts (pytest); mock smtplib and requests so tests never send real messages; run an end-to-end dry run that produces the .xlsx and .eml; and test failure paths such as missing columns or empty files.", level: "Hard" },
    { q: "How do you deploy and schedule the bot on a server?", a: "Create a virtualenv, pip install -r requirements.txt, place .env with restricted permissions, test with --dry-run, then add a cron entry using absolute paths to the venv python and script (or a Windows Task Scheduler task with 'Start in' set). Check logs after the first scheduled run. Alternatives: Docker + cron, GitHub Actions schedule, cloud functions.", level: "Medium" },
    { q: "What would you change if data volume grew from 1,000 to 10 million rows per day?", a: "Read only needed columns with proper dtypes or in chunks, move aggregation into the database with SQL, consider Polars/DuckDB or Parquet files, write summaries rather than raw data to Excel (Excel is limited to 1,048,576 rows per sheet), and send dashboard links instead of huge attachments.", level: "Hard" },
    { q: "What legal and ethical points matter in automation and scraping?", a: "Respect terms of service and robots.txt, prefer official APIs, rate-limit requests, never bypass logins/CAPTCHAs or security controls, protect personal data under India's DPDP Act 2023 (and GDPR where relevant), get consent for bulk messages, and automate only systems you are authorised to use.", level: "Medium" },
  ],
  practice: [
    {
      task: "Extend summarise() to also return a pivot table of revenue with regions as rows and products as columns (fill missing with 0).",
      hint: "df.pivot_table(index='region', columns='product', values='revenue', aggfunc='sum', fill_value=0).",
      solution: `def region_product_pivot(df):
    return df.pivot_table(index="region", columns="product", values="revenue",
                          aggfunc="sum", fill_value=0).reset_index()

# in build_report:
# region_product_pivot(df).to_excel(writer, sheet_name="Pivot", index=False)
`,
    },
    {
      task: "Add a check that stops the bot if the data file was not modified today (stale data), raising a clear error.",
      hint: "Compare date.fromtimestamp(path.stat().st_mtime) with date.today().",
      solution: `from datetime import date
from pathlib import Path

def ensure_fresh(path):
    modified = date.fromtimestamp(Path(path).stat().st_mtime)
    if modified != date.today():
        raise RuntimeError(f"{path} is stale (last modified {modified}); not sending report")
`,
    },
    {
      task: "Add automatic cleanup: delete reports in output/ older than 30 days, logging each deletion.",
      hint: "Loop glob('sales_report_*.xlsx'), compare st_mtime with time.time() - 30*86400.",
      solution: `import time
import logging
from pathlib import Path

def cleanup(out_dir="output", days=30):
    cutoff = time.time() - days * 86400
    for p in Path(out_dir).glob("sales_report_*.xlsx"):
        if p.stat().st_mtime < cutoff:
            p.unlink()
            logging.info("Deleted old report %s", p.name)
`,
    },
    {
      task: "Write a pytest test for load_orders() that creates a temporary CSV with one duplicate and one negative quantity and checks that only valid rows remain.",
      hint: "Use pytest's tmp_path fixture to write the CSV.",
      solution: `from step2 import load_orders

def test_load_orders_removes_bad_rows(tmp_path):
    csv_file = tmp_path / "orders.csv"
    csv_file.write_text(
        "order_id,date,region,product,qty,price\\n"
        "A1,2025-11-17,North,Mouse,2,600\\n"
        "A1,2025-11-17,North,Mouse,2,600\\n"
        "A2,2025-11-17,South,Laptop,-1,55000\\n"
    )
    df = load_orders(csv_file)
    assert list(df["order_id"]) == ["A1"]
    assert df["revenue"].iloc[0] == 1200
`,
    },
    {
      task: "Add a --to command-line option to bot.py that overrides the REPORT_TO recipient for one run (useful for testing).",
      hint: "parser.add_argument('--to'); then if args.to: replace the To header.",
      solution: `# in main():
parser.add_argument("--to", help="override recipient for this run")
args = parser.parse_args()
...
msg = build_email(kpis, report)
if args.to:
    del msg["To"]
    msg["To"] = args.to
`,
    },
  ],
  quiz: [
    { question: "What is the correct order of the report bot pipeline?", options: ["Email -> Excel -> Summary -> Read", "Read/validate -> Summarise -> Excel report -> Email", "Excel -> Read -> Email -> Summarise", "Summarise -> Read -> Email -> Excel"], answer: 1, explanation: "Extract and validate first, then transform, then build the report and deliver it." },
    { question: "Why does the bot validate data before building the report?", options: ["To make the script slower", "To avoid sending wrong numbers to managers", "Because pandas requires it", "To compress the file"], answer: 1, explanation: "Failing loudly on bad data is better than delivering an incorrect report." },
    { question: "What does the --dry-run flag do in our bot?", options: ["Deletes old reports", "Builds everything but saves the email to a file instead of sending it", "Runs without Python", "Sends the email twice"], answer: 1, explanation: "Dry runs let you test the full pipeline safely." },
    { question: "Which object gives access to openpyxl worksheets inside pd.ExcelWriter?", options: ["writer.sheets", "writer.ws", "pd.sheets", "writer.tabs"], answer: 0, explanation: "writer.sheets maps sheet names to openpyxl Worksheet objects." },
    { question: "What exit code should the bot return when it fails?", options: ["0", "A non-zero code such as 1", "It should not exit", "-0"], answer: 1, explanation: "Non-zero exit codes let schedulers and monitoring detect failures." },
    { question: "Which is the most preferred way to get data from another system?", options: ["pyautogui clicks", "Selenium scraping", "An official API or database access", "Copying from screenshots"], answer: 2, explanation: "Official APIs are stable, structured and permitted." },
  ],
};
