export default {
  id: "day-18-prompting-coding-data-learning",
  title: "Prompting for Coding, Data Analysis and Learning",
  module: "Module 3: Prompt Engineering",
  day: 18,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Apply prompt engineering to three high-value areas: writing and debugging code, analysing data (Excel, SQL, Python) and learning any new topic faster with AI as a tutor - while verifying everything the AI produces.",
  objectives: [
    "Write coding prompts with language, version, inputs/outputs, constraints and error messages",
    "Debug code by giving AI the code, the error and the expected behaviour",
    "Prompt AI to write Excel formulas, SQL queries and Python analysis scripts and verify them",
    "Use AI as a personal tutor with the Socratic, explain-like-I'm-new and quiz-me patterns",
    "Avoid over-reliance: test, understand and own AI-generated code"
  ],
  theory: [
    {
      heading: "Prompting for code generation",
      content: "Coding prompts need precise specifications, just like a ticket given to a developer. State the language and version, the framework, what goes in and what comes out, edge cases, and style constraints. Mention what already exists (table names, function names) so the code fits your project. Ask for comments or a short explanation if you are learning.",
      syntax: `Language: Python 3.12, standard library only
Task: Write a function parse_marks(csv_text) that ...
Input example: ...
Expected output: ...
Edge cases: empty lines, missing marks -> treat as 0
Constraints: no external libraries, add docstring, max 30 lines`,
      points: [
        "Specify versions: 'React 18', '.NET 8', 'MySQL 8', 'Excel 365'",
        "Give a small input and expected output example",
        "List edge cases explicitly",
        "Ask for tests: 'also write 3 unit tests'"
      ]
    },
    {
      heading: "Prompting for debugging",
      content: "The most common mistake when asking AI to fix code is pasting only the code and saying 'not working'. Give the AI what a senior developer would need: the code, the full error message and stack trace, what you expected, what actually happened, and what you already tried. Ask it to explain the root cause before giving the fix - that way you learn and can judge whether the fix is right.",
      syntax: `Code: <code>...</code>
Error: <error>full message + line number</error>
Expected: ...
Actual: ...
Already tried: ...
Explain the root cause in 2-3 sentences, then give the minimal fix.`,
      tip: "Ask for the MINIMAL fix. Otherwise AI may rewrite your whole program and introduce new bugs."
    },
    {
      heading: "Prompting for data analysis",
      content: "For data work, AI is great at writing formulas, SQL, DAX and pandas code, and at suggesting what to analyse. Describe your data structure precisely: table/sheet name, column names, data types and a few sample rows. Say what question the analysis must answer. Never paste confidential or personal data into public chat tools unless your company allows it - use sample or masked data instead.",
      points: [
        "Excel: give sheet name, column letters, header names and Excel version",
        "SQL: give the CREATE TABLE structure or column list and the database (MySQL / SQL Server / PostgreSQL)",
        "Power BI DAX: give table names, columns and relationships",
        "Python: give a few sample rows and ask for pandas (or standard-library) code",
        "Always test on a small sample where you know the correct answer"
      ]
    },
    {
      heading: "Prompting for learning (AI as a tutor)",
      content: "AI can be a patient, 24x7 tutor if you prompt it like one. Useful learning patterns: 'Explain like I'm a beginner, then like I'm an expert'; 'Use an analogy from cricket/cooking'; 'Quiz me with 5 questions one at a time'; Socratic mode: 'Don't give me the answer, ask guiding questions'; 'Create a 7-day study plan'; 'Find the mistake in my explanation'. Learning works best when YOU do the thinking and AI checks it.",
      syntax: `I am learning SQL JOINs. Do not give me answers directly.
Ask me one question at a time, give hints if I'm wrong,
and explain only after my second attempt.`
    },
    {
      heading: "Verify, understand, own",
      content: "AI-generated code and analysis can look perfect and still be wrong: wrong column, off-by-one, missing edge case, outdated library function, or a security issue (e.g. SQL injection). Treat AI like a fast junior colleague: review everything. Run the code, test edge cases, read every line you will commit, and never paste secrets (API keys, passwords) into prompts.",
      points: [
        "Run it and test with known answers",
        "Ask the AI to explain each line if you don't understand it",
        "Check for security issues: hard-coded keys, string-built SQL, missing validation",
        "Interviewers expect you to explain any code in your portfolio - even if AI helped write it"
      ]
    },
    {
      heading: "Tools you'll use",
      content: "Chat assistants (Claude, ChatGPT, Gemini) are good for explanations, small scripts and analysis. AI coding assistants inside the editor (GitHub Copilot, Cursor, Claude Code - Day 28) see your whole project. Copilot in Excel and AI in Google Sheets (Day 23) work directly on spreadsheets. The in-app Python IDE lets you run AI-generated pandas/scikit-learn code safely in the browser.",
      tip: "For data analysis in claude.ai or ChatGPT you can upload a CSV/Excel file; the assistant can write and run code on it and show charts. Still verify totals with a PivotTable."
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Debugging a Python error",
      scenario: "A student's marks program crashes. The BAD prompt gets a generic guess; the GOOD prompt gets the exact root cause and a minimal fix.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run the BAD prompt - notice the AI has to guess",
        "Run the GOOD prompt with code, full error and expected output",
        "Apply the minimal fix in your editor or the Python IDE and run again"
      ],
      code: `BAD PROMPT:
my python code not working pls fix

GOOD PROMPT:
Python 3.12. My code should print the average of the marks.

<code>
marks = input("Enter marks separated by commas: ").split(",")
total = sum(marks)
print("Average:", total / len(marks))
</code>

<error>
Traceback (most recent call last):
  File "avg.py", line 2, in <module>
    total = sum(marks)
TypeError: unsupported operand type(s) for +: 'int' and 'str'
</error>

Input I typed: 78, 85, 90
Expected: Average: 84.33
Explain the root cause in 2 sentences, then give the minimal fix (change as few lines as possible).`,
      prompt: {
        system: "You are a patient Python mentor. Explain root causes simply and give minimal fixes. Do not rewrite code unnecessarily.",
        user: "Python 3.12. My code should print the average of the marks.\n\n<code>\nmarks = input(\"Enter marks separated by commas: \").split(\",\")\ntotal = sum(marks)\nprint(\"Average:\", total / len(marks))\n</code>\n\n<error>\nTraceback (most recent call last):\n  File \"avg.py\", line 2, in <module>\n    total = sum(marks)\nTypeError: unsupported operand type(s) for +: 'int' and 'str'\n</error>\n\nInput I typed: 78, 85, 90\nExpected: Average: 84.33\nExplain the root cause in 2 sentences, then give the minimal fix."
      },
      result: `Root cause: input().split(",") returns a list of strings like ['78', ' 85', ' 90'], and sum() starts from 0 (an int), so it cannot add an int to a string. You must convert each value to a number first.

Minimal fix (change line 1 only):
marks = [float(m) for m in input("Enter marks separated by commas: ").split(",")]

Optional: round the output to match your expected format:
print("Average:", round(total / len(marks), 2))

Output for 78, 85, 90 -> Average: 84.33`,
      explanation: "The full traceback pointed straight at line 2 and the type error, and the expected output let the AI also suggest rounding. float(' 85') works because float() ignores surrounding spaces. Asking for the root cause first means you learn the concept (input always returns strings)."
    },
    {
      title: "Writing a SQL query with exact table structure",
      scenario: "A junior analyst needs the top 3 customers by revenue in 2026 from a MySQL database. Giving the schema prevents the AI from inventing column names.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt with the table structures",
        "Copy the query into MySQL Workbench and run it on a test database",
        "Check one customer's total manually with a simple SUM query"
      ],
      code: `Database: MySQL 8
Tables:
customers(customer_id INT PK, name VARCHAR, city VARCHAR)
orders(order_id INT PK, customer_id INT FK, order_date DATE, status VARCHAR)  -- status: 'Delivered','Cancelled','Pending'
order_items(item_id INT PK, order_id INT FK, product_id INT, qty INT, unit_price DECIMAL(10,2))

Task: Top 3 customers by total revenue in calendar year 2026.
Revenue = SUM(qty * unit_price). Exclude Cancelled orders.
Output columns: name, city, total_revenue (2 decimals), order_count.
Explain each clause in one line after the query.`,
      prompt: {
        system: "You are a senior SQL developer. Use only the tables and columns provided. Write clean, readable MySQL 8 queries.",
        user: "Database: MySQL 8\nTables:\ncustomers(customer_id INT PK, name VARCHAR, city VARCHAR)\norders(order_id INT PK, customer_id INT FK, order_date DATE, status VARCHAR) -- status: 'Delivered','Cancelled','Pending'\norder_items(item_id INT PK, order_id INT FK, product_id INT, qty INT, unit_price DECIMAL(10,2))\n\nTask: Top 3 customers by total revenue in calendar year 2026.\nRevenue = SUM(qty * unit_price). Exclude Cancelled orders.\nOutput columns: name, city, total_revenue (2 decimals), order_count.\nExplain each clause in one line after the query."
      },
      result: `SELECT c.name,
       c.city,
       ROUND(SUM(oi.qty * oi.unit_price), 2) AS total_revenue,
       COUNT(DISTINCT o.order_id)            AS order_count
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
WHERE o.status <> 'Cancelled'
  AND o.order_date >= '2026-01-01'
  AND o.order_date <  '2027-01-01'
GROUP BY c.customer_id, c.name, c.city
ORDER BY total_revenue DESC
LIMIT 3;

- JOINs connect each customer to their orders and order lines.
- WHERE removes cancelled orders and keeps only 2026 (date range is index-friendly).
- SUM(qty * unit_price) calculates revenue; COUNT(DISTINCT order_id) avoids counting each line as an order.
- GROUP BY customer, ORDER BY revenue descending, LIMIT 3 for the top three.`,
      explanation: "Because the exact schema was given, the query uses real column names. Note COUNT(DISTINCT o.order_id): a plain COUNT(*) would count order lines, not orders - a classic bug worth checking in any AI-written query."
    },
    {
      title: "AI-written data analysis script - verified by running it",
      scenario: "A sales coordinator asked Claude: 'Write standard-library Python that reads this CSV and prints revenue by city with % share, revenue by category, and average order value.' We run the AI's script to verify the numbers.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and paste the prompt shown in the Prompt Lab panel",
        "Copy the generated code into the in-app Python IDE (/tools/python-ide) as main.py",
        "Click Run and compare the output with a quick PivotTable in Excel on the same 8 rows",
        "Ask a follow-up: 'Rewrite this using pandas groupby' and run that version in the IDE too"
      ],
      code: `import csv, io
from collections import defaultdict

data = """order_id,city,category,amount
1001,Pune,Electronics,15000
1002,Mumbai,Grocery,1200
1003,Pune,Grocery,800
1004,Nagpur,Electronics,22000
1005,Mumbai,Electronics,18000
1006,Nagpur,Grocery,950
1007,Pune,Fashion,3200
1008,Mumbai,Fashion,2800
"""

rows = list(csv.DictReader(io.StringIO(data)))
by_city = defaultdict(float)
by_category = defaultdict(float)
for r in rows:
    amt = float(r["amount"])
    by_city[r["city"]] += amt
    by_category[r["category"]] += amt

total = sum(by_city.values())
print("Total revenue:", int(total))
print("\\nRevenue by city:")
for city, amt in sorted(by_city.items(), key=lambda x: -x[1]):
    print(f"  {city:<8}{int(amt):>8}  ({amt / total * 100:.1f}%)")
print("\\nRevenue by category:")
for cat, amt in sorted(by_category.items(), key=lambda x: -x[1]):
    print(f"  {cat:<12}{int(amt):>8}")
print("\\nAverage order value:", round(total / len(rows), 2))`,
      python: {
        files: {
          "main.py": `import csv, io
from collections import defaultdict

data = """order_id,city,category,amount
1001,Pune,Electronics,15000
1002,Mumbai,Grocery,1200
1003,Pune,Grocery,800
1004,Nagpur,Electronics,22000
1005,Mumbai,Electronics,18000
1006,Nagpur,Grocery,950
1007,Pune,Fashion,3200
1008,Mumbai,Fashion,2800
"""

rows = list(csv.DictReader(io.StringIO(data)))
by_city = defaultdict(float)
by_category = defaultdict(float)
for r in rows:
    amt = float(r["amount"])
    by_city[r["city"]] += amt
    by_category[r["category"]] += amt

total = sum(by_city.values())
print("Total revenue:", int(total))
print("\\nRevenue by city:")
for city, amt in sorted(by_city.items(), key=lambda x: -x[1]):
    print(f"  {city:<8}{int(amt):>8}  ({amt / total * 100:.1f}%)")
print("\\nRevenue by category:")
for cat, amt in sorted(by_category.items(), key=lambda x: -x[1]):
    print(f"  {cat:<12}{int(amt):>8}")
print("\\nAverage order value:", round(total / len(rows), 2))
`
        },
        stdin: ""
      },
      prompt: {
        system: "You are a Python data analyst. Write clear standard-library Python 3 code with short comments. No external libraries.",
        user: "Write Python (standard library only) that reads the CSV below from a string and prints: total revenue, revenue by city sorted descending with % share (1 decimal), revenue by category sorted descending, and average order value (2 decimals).\n\norder_id,city,category,amount\n1001,Pune,Electronics,15000\n1002,Mumbai,Grocery,1200\n1003,Pune,Grocery,800\n1004,Nagpur,Electronics,22000\n1005,Mumbai,Electronics,18000\n1006,Nagpur,Grocery,950\n1007,Pune,Fashion,3200\n1008,Mumbai,Fashion,2800"
      },
      result: `Total revenue: 63950

Revenue by city:
  Nagpur     22950  (35.9%)
  Mumbai     22000  (34.4%)
  Pune       19000  (29.7%)

Revenue by category:
  Electronics    55000
  Fashion         6000
  Grocery         2950

Average order value: 7993.75`,
      explanation: "This output was produced by actually running the code. Cross-check: Nagpur = 22000 + 950 = 22950; total = 63950; 22950 / 63950 = 35.9%. Electronics is 86% of revenue - an insight worth reporting. Running AI code on a tiny dataset where you can verify totals by hand is the safest habit in AI-assisted analysis."
    },
    {
      title: "AI as a Socratic tutor: learning Excel XLOOKUP",
      scenario: "A fresher wants to really understand XLOOKUP, not just copy a formula. He asks the AI to teach with questions instead of answers.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the tutor prompt below",
        "Answer each question honestly - wrong answers are fine",
        "At the end, ask for a 5-question quiz and a one-page summary to save in your notes"
      ],
      code: `I want to learn Excel XLOOKUP. Act as a Socratic tutor.
- I know VLOOKUP basics.
- Do NOT give me the full answer immediately. Ask one question at a time.
- If I'm wrong, give a hint, not the answer. Explain only after my second attempt.
- Use this mini table in your questions:
  A: EmpID | B: Name | C: Dept | D: Salary
  101 | Asha | HR | 42000
  102 | Ravi | IT | 55000
  103 | Meena | Sales | 47000
- After 4 questions, summarise what I learned in 5 bullets.`,
      prompt: {
        system: "You are a Socratic Excel tutor. Ask one question at a time, give hints instead of answers, and only explain fully after the learner's second attempt.",
        user: "I want to learn Excel XLOOKUP. I know VLOOKUP basics. Use this mini table:\nA: EmpID | B: Name | C: Dept | D: Salary\n101 | Asha | HR | 42000\n102 | Ravi | IT | 55000\n103 | Meena | Sales | 47000\nAsk me the first question."
      },
      result: `Great - since you know VLOOKUP, let's build on that.

Question 1:
With VLOOKUP you would find Ravi's salary using =VLOOKUP(102, A2:D4, 4, FALSE).
XLOOKUP doesn't use a column number. It asks for three main things:
what to look for, where to look, and what to return.

Using our table, which RANGE would you give as "where to look" and which RANGE as "what to return" to get Ravi's salary?

(Try it - write the ranges or the full formula.)`,
      explanation: "The Socratic pattern makes you think actively, which leads to better memory than reading a ready answer. The correct final formula is =XLOOKUP(102, A2:A4, D2:D4). Students can later ask for the 'reverse lookup' (find EmpID from Name) - something VLOOKUP cannot do without tricks."
    }
  ],
  tools: [
    { name: "Claude (claude.ai)", use: "Explain, write and debug code; upload CSV/Excel files for analysis; Socratic tutoring", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Data analysis on uploaded files, code help and tutoring", url: "https://chatgpt.com" },
    { name: "GitHub Copilot", use: "AI code suggestions and chat inside VS Code / Visual Studio (covered on Day 28)", url: "https://github.com/features/copilot" },
    { name: "Python IDE (in-app)", use: "Run and verify AI-generated Python, pandas and scikit-learn code safely in the browser", url: "/tools/python-ide" },
    { name: "AI Prompt Lab (in-app)", use: "Save debugging, SQL and tutor prompt templates", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What information should a good debugging prompt include?", a: "Language/version, the relevant code, the full error message and stack trace, input used, expected vs actual behaviour, and what you already tried. Ask for the root cause and a minimal fix.", level: "Easy" },
    { q: "How do you prevent an AI from inventing column or table names in SQL?", a: "Provide the exact schema (table names, columns, types, relationships) and instruct it to use only those. Then run the query on test data.", level: "Easy" },
    { q: "Why ask for a 'minimal fix' instead of a rewrite?", a: "Minimal fixes are easier to review, less likely to introduce new bugs, and keep the project's style and structure intact.", level: "Medium" },
    { q: "What risks come with AI-generated code?", a: "Logical bugs, unhandled edge cases, outdated or non-existent APIs, security flaws (SQL injection, hard-coded secrets), licensing concerns and code the developer doesn't understand. Mitigate with tests, reviews and understanding every line.", level: "Medium" },
    { q: "How would you verify an AI-generated data analysis?", a: "Run it on a small sample with known answers, cross-check totals with a PivotTable or SQL query, check row counts and filters, and review assumptions (e.g. excluded rows, date ranges).", level: "Medium" },
    { q: "What data should you not paste into a public AI chat?", a: "Personal data (names with phone/Aadhaar/PAN), customer data, passwords, API keys, confidential financials or source code, unless your organisation has approved the tool and data handling. Use masked or sample data.", level: "Medium" },
    { q: "How can AI be used effectively for learning a new technology?", a: "As a tutor: request beginner-to-advanced explanations, analogies, Socratic questioning, quizzes, study plans and feedback on your own explanations or code, while verifying facts with official documentation.", level: "Easy" },
    { q: "COUNT(*) vs COUNT(DISTINCT order_id) after a join - why does it matter?", a: "After joining orders to order_items there is one row per item, so COUNT(*) counts items, not orders. COUNT(DISTINCT order_id) gives the correct number of orders.", level: "Hard" },
    { q: "How do you ask AI for code that fits an existing project?", a: "Share relevant existing code (function signatures, models, naming conventions), versions and frameworks, and say 'follow the existing style; do not change other functions'. Coding assistants that read the repository (Copilot, Cursor, Claude Code) help here.", level: "Hard" },
    { q: "Interviewer: 'Did you write this portfolio code yourself or use AI?' How should you answer?", a: "Be honest: explain where AI assisted, and demonstrate you understand the design, every key line, the trade-offs, and how you tested it. Using AI is acceptable; not understanding your code is not.", level: "Medium" }
  ],
  practice: [
    { task: "Ask AI for an Excel formula that gives 'A' for marks >= 75, 'B' for 60-74, 'C' for 40-59, else 'F'. Test it on 39, 40, 60, 74, 75.", hint: "Mention Excel 365 so it can use IFS.", solution: "=IFS(B2>=75,\"A\",B2>=60,\"B\",B2>=40,\"C\",TRUE,\"F\"). Results: 39->F, 40->C, 60->B, 74->B, 75->A." },
    { task: "Break a small program on purpose (e.g. misspell a variable) and practise a complete debugging prompt.", hint: "Include code, full error, expected output.", solution: "NameError example: the AI should identify the misspelled name on the reported line and give a one-line fix." },
    { task: "In the Python IDE, run the sales script, then ask AI to add 'revenue by city and category' (a cross-tab). Verify Pune Grocery = 800.", hint: "Use a dictionary keyed by (city, category).", solution: "Add: by_pair = defaultdict(float); by_pair[(r['city'], r['category'])] += amt; then print. Pune-Grocery should print 800." },
    { task: "Use the Socratic tutor pattern to learn SQL GROUP BY with HAVING for 15 minutes, then ask for a 5-question quiz.", hint: "Tell it not to give answers until your second attempt.", solution: "Expected learning: WHERE filters rows before grouping, HAVING filters groups after aggregation, e.g. HAVING SUM(amount) > 20000." }
  ],
  quiz: [
    { question: "Which debugging prompt is best?", options: ["fix my code", "Code + full error + expected vs actual + 'explain root cause, minimal fix'", "Rewrite everything in Java", "Just the error line number"], answer: 1, explanation: "Complete context lets the AI find the real cause." },
    { question: "Why provide the table schema when asking for SQL?", options: ["So the AI uses real column names instead of inventing them", "It makes the query slower", "Schemas are secret", "It's not useful"], answer: 0, explanation: "Without a schema the AI guesses names." },
    { question: "What is the Socratic tutoring pattern?", options: ["AI writes your assignment", "AI only gives final answers", "AI asks guiding questions and gives hints so you work it out", "AI translates text"], answer: 2, explanation: "You do the thinking; the AI guides." },
    { question: "Best way to verify AI-written analysis code?", options: ["Trust it if it looks clean", "Ask the AI if it's correct and stop", "Delete the comments", "Run it on a small dataset where you know the correct answers"], answer: 3, explanation: "Known answers expose bugs quickly." },
    { question: "Which should NOT be pasted into a public chatbot?", options: ["A generic Python error", "A sample table with fake data", "Your production API key and customer phone numbers", "A question about XLOOKUP"], answer: 2, explanation: "Secrets and personal data must stay out of unapproved tools." }
  ]
};
