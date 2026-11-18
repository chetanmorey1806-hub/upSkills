export default {
  id: "day-23-ai-data-analysis",
  title: "AI for Data Analysis: Copilot in Excel, Copilot in Power BI, Data Analysis in ChatGPT/Claude, AI in Google Sheets",
  module: "Module 4: AI Tools for Productivity",
  day: 23,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Use AI tools built into spreadsheets and BI tools - Copilot in Excel, Copilot in Power BI, Gemini in Google Sheets - and the file-analysis abilities of ChatGPT and Claude to clean data, write formulas, find insights, build charts and draft reports, then verify every number.",
  objectives: [
    "Explain what Copilot in Excel, Copilot in Power BI, Gemini in Sheets and chat-based data analysis are",
    "Prepare data so AI tools work well (tables, clean headers, one row per record)",
    "Use AI step by step to create formulas, PivotTables, charts, DAX measures and report summaries",
    "Analyse an uploaded CSV/Excel file in Claude or ChatGPT",
    "Verify AI analysis with independent checks and protect sensitive data"
  ],
  theory: [
    {
      heading: "Why AI for data analysis?",
      content: "Most analysis time goes into repetitive work: cleaning data, remembering formula syntax, building pivots and charts, and writing the summary. AI tools let you describe what you want in plain English ('show revenue by region for Q3 as a bar chart') and do the mechanical part. The analyst's job shifts to asking the right questions, checking results and explaining what they mean for the business. Analogy: AI is a fast junior analyst who knows every formula - but still needs your supervision.",
      points: [
        "Natural-language questions -> formulas, pivots, charts, DAX, SQL, Python",
        "Faster exploration: 'What are the top 3 insights in this data?'",
        "Explanations: 'Explain this formula / measure step by step'",
        "Risks: wrong assumptions, misread columns, incorrect totals - always verify"
      ]
    },
    {
      heading: "Copilot in Excel",
      content: "Copilot in Excel is Microsoft's AI assistant inside Excel (Microsoft 365, with a Copilot licence; availability and exact features evolve). It works best on data formatted as an Excel Table (Ctrl+T) with clear headers, stored in OneDrive/SharePoint. It can suggest formula columns, highlight/sort/filter data, create PivotTables and charts, summarise trends, and - with Python in Excel - run deeper analysis. Excel also has a COPILOT() function in newer builds that lets you use AI directly inside a cell formula (e.g. to classify text).",
      points: [
        "Where used: sales reports, finance variance analysis, HR attendance summaries, inventory checks",
        "How to use: 1) Open the workbook in Excel (desktop or web) saved to OneDrive/SharePoint 2) Select data and press Ctrl+T to make a Table 3) Click 'Copilot' on the Home ribbon 4) Type a request: 'Add a column for profit margin %' 5) Review the suggested formula, click 'Insert column' 6) Ask: 'Show total revenue by region as a PivotTable' -> 'Add to a new sheet' 7) Ask 'What are the key insights?' and verify each",
        "Tip: name columns clearly (Revenue_INR, not Col5); remove merged cells and blank header rows"
      ]
    },
    {
      heading: "Copilot in Power BI",
      content: "Copilot in Power BI (requires an appropriate Fabric/Power BI capacity or licence that supports Copilot; check current requirements) helps create report pages from a prompt, write and explain DAX measures, summarise a report in a narrative visual, and answer questions about the data model. Report consumers can ask questions about a report in natural language. Good results depend on a clean model: proper relationships, clear table/column names and synonyms/descriptions.",
      points: [
        "Where used: BI developers speeding up report creation, managers asking questions of dashboards, analysts writing DAX",
        "How to use (Desktop): 1) Open your .pbix connected to a Copilot-enabled workspace 2) Click 'Copilot' on the Home ribbon 3) Try 'Suggest content for a new report page' or 'Create a page showing sales by region and month' 4) In the DAX query view, use Copilot to write or explain a measure 5) Add a 'Narrative with Copilot' visual for an automatic summary 6) Validate visuals against known totals",
        "Model hygiene: star schema, meaningful names, hidden technical columns, descriptions on measures"
      ]
    },
    {
      heading: "Gemini in Google Sheets",
      content: "Google Sheets includes Gemini features (on supported Google Workspace plans): a side panel to ask questions about your sheet, generate tables, create formulas and charts, and summarise data, plus an AI function in cells (=AI(...) on supported plans) for tasks like categorising or summarising text in each row. Features roll out gradually, so names may differ slightly in your account.",
      points: [
        "Where used: small businesses and startups on Google Workspace, students, marketing teams tracking campaigns",
        "How to use: 1) Open the sheet in Google Sheets 2) Click the Gemini (spark) icon at top right to open the side panel 3) Ask: 'Create a formula to calculate days between Order Date and Delivery Date' or 'Summarise sales by category' 4) Insert the suggested formula/table 5) For row-by-row text tasks, use the AI function where available, e.g. classify feedback into Positive/Negative/Neutral 6) Spot-check results"
      ]
    },
    {
      heading: "Data analysis in ChatGPT and Claude",
      content: "In ChatGPT and Claude you can upload CSV or Excel files (or connect cloud drives) and ask questions. Both can write and run code (Python) in a sandbox to compute statistics, clean data and create charts, and Claude can build interactive dashboards as Artifacts. This is useful when you don't have Copilot licences or need more complex analysis. Claude also offers an Excel add-in (Claude for Excel) for working inside workbooks where available.",
      points: [
        "Where used: quick exploratory analysis, one-off reports, cleaning messy exports, learning how to analyse data",
        "How to use: 1) Remove or mask sensitive columns 2) Upload the file (paperclip / + icon) 3) First ask: 'Describe the columns, data types, row count and data quality issues' 4) Then ask specific questions 5) Ask it to show the code/method used 6) Download the cleaned file or chart 7) Verify key numbers in Excel with a PivotTable",
        "Large files may be sampled or truncated - always ask for row counts to confirm everything was read"
      ]
    },
    {
      heading: "Verification and data privacy",
      content: "AI analysis can be wrong in subtle ways: it may misinterpret a column, ignore blank rows, mix percentage and percentage points, or compute a growth rate from the wrong base. Build a habit: check row counts, recompute 2-3 key numbers independently (PivotTable, SUMIFS, SQL or a short script), and ask the AI to state its assumptions. For privacy, use company-approved tools; Copilot for Microsoft 365 respects your organisation's permissions, while personal accounts in public tools are not suitable for confidential data.",
      points: [
        "Check: row count, totals, filters applied, date ranges",
        "Recompute key numbers independently",
        "Ask: 'What assumptions did you make?'",
        "Mask personal data (names, phone numbers, IDs) before uploading to non-approved tools"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Asking an AI assistant to analyse a sales file",
      scenario: "A sales coordinator uploads a quarterly sales CSV to Claude or ChatGPT. 'Analyse this' gives generic charts. A structured prompt gets a data-quality check first, then specific answers with the method shown.",
      steps: [
        "Export the sales data from your system as CSV; delete customer name/phone columns",
        "Open claude.ai or chatgpt.com and click the paperclip/+ icon to upload the CSV",
        "Paste the GOOD prompt",
        "Read the data-quality section first - fix issues before trusting insights",
        "Verify total revenue and one region's figure with a PivotTable in Excel"
      ],
      code: `BAD PROMPT:
analyse this

GOOD PROMPT:
You are a sales analyst. I uploaded q3_sales.csv (columns: Region, Month, Units, Revenue).
Step 1 - Data check: row count, missing values, duplicates, odd values. Stop and list issues.
Step 2 - Answer: (a) total Q3 revenue, (b) revenue by region and month as a table,
(c) % change Jul->Sep per region, (d) best and worst region.
Step 3 - 3 insights in plain English for a regional sales manager.
Show the method or code you used for each number. Round % to 1 decimal.`,
      prompt: {
        system: "You are a careful sales analyst. Always check data quality first, show your method, and never guess missing data.",
        user: "Data (q3_sales.csv):\nRegion,Month,Units,Revenue\nNorth,Jul,120,240000\nNorth,Aug,135,270000\nNorth,Sep,150,297000\nSouth,Jul,200,360000\nSouth,Aug,190,342000\nSouth,Sep,170,306000\nWest,Jul,90,198000\nWest,Aug,110,242000\nWest,Sep,130,286000\n\nStep 1 - Data check: row count, missing values, duplicates, odd values.\nStep 2 - Answer: (a) total Q3 revenue, (b) revenue by region and month as a table, (c) % change Jul->Sep per region, (d) best and worst region.\nStep 3 - 3 insights in plain English for a regional sales manager.\nShow the method for each number. Round % to 1 decimal."
      },
      result: `Step 1 - Data check
9 rows, 4 columns. No missing values, no duplicates. 3 regions x 3 months - complete.

Step 2
(a) Total Q3 revenue = 25,41,000 (sum of all 9 Revenue values)

(b)
| Region | Jul      | Aug      | Sep      | Q3 Total  |
|--------|----------|----------|----------|-----------|
| North  | 2,40,000 | 2,70,000 | 2,97,000 | 8,07,000  |
| South  | 3,60,000 | 3,42,000 | 3,06,000 | 10,08,000 |
| West   | 1,98,000 | 2,42,000 | 2,86,000 | 7,26,000  |

(c) % change Jul->Sep = (Sep - Jul) / Jul x 100
North +23.8% | South -15.0% | West +44.4%

(d) Best (Q3 total): South. Worst: West. Fastest growing: West.

Step 3 - Insights
- South is still the largest region but is declining every month (-15% since July) - investigate pricing, competition or stock issues.
- West is the smallest region but growing fastest (+44%); if the trend continues it may overtake North soon.
- North is growing steadily (+24%) - a stable performer.`,
      explanation: "The data-quality step catches missing or duplicate rows before you trust totals. Asking for the method makes each number auditable. The next example shows how to verify these numbers independently with a script."
    },
    {
      title: "Verifying the AI's numbers with a script",
      scenario: "Before the coordinator sends the analysis, she checks the AI's key claims with a small Python script. One of the claims from an earlier AI draft turned out to be wrong.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Look for any line marked WRONG",
        "Correct the report, then re-ask the AI: 'You said North grew 25%; recompute from the data and show the formula.'"
      ],
      code: `# Verify the numbers an AI assistant reported for this small sales table
rows = [
    # region, month, units, revenue
    ("North", "Jul", 120, 240000), ("North", "Aug", 135, 270000), ("North", "Sep", 150, 297000),
    ("South", "Jul", 200, 360000), ("South", "Aug", 190, 342000), ("South", "Sep", 170, 306000),
    ("West",  "Jul",  90, 198000), ("West",  "Aug", 110, 242000), ("West",  "Sep", 130, 286000),
]

ai_claims = {
    "Total Q3 revenue": 2541000,
    "South revenue change Jul->Sep (%)": -15.0,
    "West revenue change Jul->Sep (%)": 44.4,
    "North revenue change Jul->Sep (%)": 25.0,
    "Best region by Q3 revenue": "South",
}

total = sum(r[3] for r in rows)
by_region = {}
for region, month, units, rev in rows:
    by_region.setdefault(region, {})[month] = rev

def change(region):
    jul, sep = by_region[region]["Jul"], by_region[region]["Sep"]
    return round((sep - jul) / jul * 100, 1)

region_totals = {r: sum(m.values()) for r, m in by_region.items()}
best = max(region_totals, key=region_totals.get)

checks = {
    "Total Q3 revenue": total,
    "South revenue change Jul->Sep (%)": change("South"),
    "West revenue change Jul->Sep (%)": change("West"),
    "North revenue change Jul->Sep (%)": change("North"),
    "Best region by Q3 revenue": best,
}

print("Region totals:", region_totals)
for claim, ai_value in ai_claims.items():
    actual = checks[claim]
    status = "OK " if actual == ai_value else "WRONG"
    print(f"{status} | {claim}: AI said {ai_value}, actual {actual}")`,
      python: {
        files: {
          "main.py": `# Verify the numbers an AI assistant reported for this small sales table
rows = [
    # region, month, units, revenue
    ("North", "Jul", 120, 240000), ("North", "Aug", 135, 270000), ("North", "Sep", 150, 297000),
    ("South", "Jul", 200, 360000), ("South", "Aug", 190, 342000), ("South", "Sep", 170, 306000),
    ("West",  "Jul",  90, 198000), ("West",  "Aug", 110, 242000), ("West",  "Sep", 130, 286000),
]

ai_claims = {
    "Total Q3 revenue": 2541000,
    "South revenue change Jul->Sep (%)": -15.0,
    "West revenue change Jul->Sep (%)": 44.4,
    "North revenue change Jul->Sep (%)": 25.0,
    "Best region by Q3 revenue": "South",
}

total = sum(r[3] for r in rows)
by_region = {}
for region, month, units, rev in rows:
    by_region.setdefault(region, {})[month] = rev

def change(region):
    jul, sep = by_region[region]["Jul"], by_region[region]["Sep"]
    return round((sep - jul) / jul * 100, 1)

region_totals = {r: sum(m.values()) for r, m in by_region.items()}
best = max(region_totals, key=region_totals.get)

checks = {
    "Total Q3 revenue": total,
    "South revenue change Jul->Sep (%)": change("South"),
    "West revenue change Jul->Sep (%)": change("West"),
    "North revenue change Jul->Sep (%)": change("North"),
    "Best region by Q3 revenue": best,
}

print("Region totals:", region_totals)
for claim, ai_value in ai_claims.items():
    actual = checks[claim]
    status = "OK " if actual == ai_value else "WRONG"
    print(f"{status} | {claim}: AI said {ai_value}, actual {actual}")
`
        },
        stdin: ""
      },
      result: `Region totals: {'North': 807000, 'South': 1008000, 'West': 726000}
OK  | Total Q3 revenue: AI said 2541000, actual 2541000
OK  | South revenue change Jul->Sep (%): AI said -15.0, actual -15.0
OK  | West revenue change Jul->Sep (%): AI said 44.4, actual 44.4
WRONG | North revenue change Jul->Sep (%): AI said 25.0, actual 23.8
OK  | Best region by Q3 revenue: AI said South, actual South`,
      explanation: "This is the real output of the script. A rounded or estimated figure (25% instead of 23.8%) is a typical AI slip that looks plausible. Independent verification - a PivotTable, SUMIFS, SQL or a short script - takes two minutes and protects your credibility."
    },
    {
      title: "Step by step: Copilot in Excel - formula column, PivotTable and insights",
      scenario: "An HR executive has an attendance table (Employee, Department, Working_Days, Days_Present, Leaves). She uses Copilot in Excel to add an attendance % column, summarise by department and get insights.",
      steps: [
        "Save the workbook to OneDrive or SharePoint (Copilot requires cloud-saved files)",
        "Click inside the data and press Ctrl+T, tick 'My table has headers', click OK",
        "On the Home tab click 'Copilot' to open the pane",
        "Type prompt 1 (below). Review the formula Copilot shows and click 'Insert column'",
        "Type prompt 2 and click 'Add to a new sheet' for the PivotTable",
        "Type prompt 3 and read the insights; verify one department's average manually",
        "No Copilot licence? Paste the same prompts plus a sample of the table into claude.ai or ChatGPT to get the formula and summary"
      ],
      code: `Prompt 1:
Add a column Attendance_% = Days_Present / Working_Days, formatted as a percentage with 1 decimal.

Prompt 2:
Create a PivotTable showing average Attendance_% and total Leaves by Department, sorted by Attendance_% ascending.

Prompt 3:
Which departments have average attendance below 90%? Highlight those rows in light red
and give me 3 insights in plain English.`,
      prompt: {
        system: "You act like Copilot in Excel. The user has an Excel Table named Attendance with columns Employee, Department, Working_Days, Days_Present, Leaves. Give the exact Excel formula using structured references, then describe the PivotTable and insights.",
        user: "Add a column Attendance_% = Days_Present / Working_Days, formatted as a percentage with 1 decimal. Then describe a PivotTable with average Attendance_% and total Leaves by Department, sorted ascending by attendance. Sample: Sales avg 86.4% leaves 42; IT avg 94.1% leaves 18; HR avg 92.7% leaves 9; Operations avg 88.9% leaves 37. Give 3 insights."
      },
      result: `Formula column (structured reference):
=[@Days_Present]/[@Working_Days]
Format: Percentage, 1 decimal place.

PivotTable (new sheet "Attendance Summary"):
| Department | Avg Attendance_% | Total Leaves |
|------------|------------------|--------------|
| Sales      | 86.4%            | 42           |
| Operations | 88.9%            | 37           |
| HR         | 92.7%            | 9            |
| IT         | 94.1%            | 18           |

Insights
- Sales (86.4%) and Operations (88.9%) are below the 90% target; together they account for most of the leaves (79 of 106).
- IT has the highest attendance (94.1%) despite having more leaves than HR - likely a larger team.
- Check whether Sales absences cluster around month-end or field visits before taking action.`,
      explanation: "Copilot uses structured references ([@Column]) because the data is an Excel Table - another reason to press Ctrl+T first. The insight about IT shows why AI comments need context: total leaves depend on team size. HR should validate before discussing attendance with any employee."
    },
    {
      title: "Step by step: Copilot in Power BI - writing and explaining a DAX measure",
      scenario: "A BI developer needs a 'Sales YoY %' measure and wants to understand it. She uses Copilot in Power BI (or a chat assistant if Copilot is not enabled) to generate and explain the DAX.",
      steps: [
        "Open the report in Power BI Desktop (workspace must support Copilot) or Power BI Service",
        "Make sure the model has a marked Date table related to Sales[OrderDate]",
        "Open DAX query view (or the Copilot pane) and click Copilot",
        "Paste the prompt below; review the DAX",
        "Create the measure (Modelling > New measure), paste the DAX, set format to Percentage",
        "Verify in a table visual: check one month manually against last year's value",
        "Without Copilot: paste the same prompt into claude.ai / ChatGPT including your table and column names"
      ],
      code: `Model: Sales(OrderDate, Amount, ProductID), 'Date'(Date, Year, Month) marked as date table,
relationship 'Date'[Date] 1-* Sales[OrderDate]. Existing measure: [Total Sales] = SUM(Sales[Amount]).

Write a measure Sales YoY % that compares [Total Sales] with the same period last year.
Return BLANK when last year has no sales. Use variables. Then explain it line by line
for a beginner.`,
      prompt: {
        system: "You are a Power BI DAX expert. Use only the tables, columns and measures provided. Write readable DAX with variables and explain simply.",
        user: "Model: Sales(OrderDate, Amount, ProductID), 'Date'(Date, Year, Month) marked as date table, relationship 'Date'[Date] 1-* Sales[OrderDate]. Existing measure: [Total Sales] = SUM(Sales[Amount]).\n\nWrite a measure Sales YoY % that compares [Total Sales] with the same period last year. Return BLANK when last year has no sales. Use variables. Then explain it line by line for a beginner."
      },
      result: `Sales YoY % =
VAR CurrentSales = [Total Sales]
VAR LastYearSales =
    CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN
    DIVIDE ( CurrentSales - LastYearSales, LastYearSales )

Line by line
- CurrentSales: total sales for whatever is selected (month, region, product...).
- LastYearSales: CALCULATE changes the date filter to the same dates one year earlier using SAMEPERIODLASTYEAR - this needs the marked Date table.
- DIVIDE: (this year - last year) / last year. DIVIDE returns BLANK instead of an error when LastYearSales is 0 or blank, so months without history show empty.
- Format the measure as Percentage.

Check: if Sep 2026 = 5,50,000 and Sep 2025 = 5,00,000, the result should be 10.0%.`,
      explanation: "Giving the exact model (tables, relationships, existing measures) prevents invented column names. DIVIDE handles the 'no sales last year' case cleanly. The built-in check (10% example) gives you a quick manual test to run in a table visual."
    },
    {
      title: "Step by step: Gemini in Google Sheets - classify customer feedback",
      scenario: "A startup's customer success team has 500 feedback comments in Google Sheets. They want each comment classified and a summary of the main complaints.",
      steps: [
        "Open the sheet in Google Sheets (Workspace plan with Gemini features)",
        "Click the Gemini (spark) icon at top right to open the side panel",
        "Paste prompt 1 to get a formula/approach for categories; insert into column C",
        "Where the AI cell function is available, use it in C2 and fill down (see code); otherwise ask the side panel to classify the selected range",
        "Paste prompt 2 to create a summary table and chart",
        "Manually check 20 random rows; refine category definitions if accuracy is poor"
      ],
      code: `Column A: Customer_ID, Column B: Feedback

Prompt 1 (side panel):
Classify each comment in column B into one of: Pricing, App Bug, Delivery, Support, Praise.
Put the category in column C.

Cell-level option (where available):
=AI("Classify this feedback into exactly one of: Pricing, App Bug, Delivery, Support, Praise. Return only the label.", B2)

Prompt 2 (side panel):
Create a summary table of count and % by category in a new sheet, and a bar chart.
Then list the top 3 issues with one example comment each.`,
      prompt: {
        system: "Classify each feedback into exactly one of: Pricing, App Bug, Delivery, Support, Praise. Output a table: Customer_ID | Category. Then give counts by category.",
        user: "C101: App crashes when I open the cart\nC102: Delivery came 3 days late\nC103: Love the new UI, super smooth!\nC104: Subscription is too expensive compared to others\nC105: Support never replied to my email\nC106: Payment page freezes on Android\nC107: Great service, quick refund\nC108: Delivery boy was rude and late"
      },
      result: `| Customer_ID | Category |
|-------------|----------|
| C101        | App Bug  |
| C102        | Delivery |
| C103        | Praise   |
| C104        | Pricing  |
| C105        | Support  |
| C106        | App Bug  |
| C107        | Praise   |
| C108        | Delivery |

Counts: App Bug 2 (25%), Delivery 2 (25%), Praise 2 (25%), Pricing 1 (12.5%), Support 1 (12.5%)

Top issues: App Bug ("Payment page freezes on Android"), Delivery ("Delivery came 3 days late"), Pricing ("Subscription is too expensive...")`,
      explanation: "Row-by-row AI classification turns unstructured text into a column you can pivot and chart. Fixed category names keep results consistent. C107 mentions a refund but is praise - edge cases like this are why you spot-check a random sample."
    }
  ],
  tools: [
    { name: "Copilot in Excel", use: "Formula columns, PivotTables, charts, highlighting and insights from Excel Tables using natural language", url: "https://support.microsoft.com/copilot-excel" },
    { name: "Copilot in Power BI", use: "Create report pages, write/explain DAX, narrative summaries and Q&A on reports", url: "https://learn.microsoft.com/power-bi/create-reports/copilot-introduction" },
    { name: "Gemini in Google Sheets", use: "Side-panel help for formulas, tables, charts and summaries; AI function for row-by-row text tasks", url: "https://workspace.google.com/products/sheets/" },
    { name: "ChatGPT (data analysis)", use: "Upload CSV/Excel, run Python analysis, create charts and cleaned files", url: "https://chatgpt.com" },
    { name: "Claude (file analysis, Artifacts)", use: "Upload data files, analyse with code, build interactive dashboards as Artifacts", url: "https://claude.ai" },
    { name: "Python IDE (in-app)", use: "Verify AI-produced numbers with pandas or plain Python", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "What is Copilot in Excel and what does it need to work well?", a: "Microsoft's AI assistant inside Excel that creates formula columns, PivotTables, charts and insights from natural language. It works best with data formatted as an Excel Table with clear headers, saved in OneDrive/SharePoint, and requires a Copilot-enabled licence.", level: "Easy" },
    { q: "Name three things Copilot in Power BI can do.", a: "Suggest and create report pages from a prompt, write and explain DAX measures, and generate narrative summaries; it can also answer questions about report data.", level: "Easy" },
    { q: "Why does data modelling quality matter for Copilot in Power BI?", a: "Copilot relies on table/column names, relationships and descriptions to understand the model. Clear names, a star schema, a marked date table and descriptions lead to correct visuals and DAX; a messy model leads to wrong answers.", level: "Medium" },
    { q: "How can you analyse data with AI if you don't have Copilot licences?", a: "Upload masked data to an approved chat assistant (Claude, ChatGPT) that can run code, or paste table structure and samples to get formulas, DAX, SQL or Python, then run them in your own tools.", level: "Easy" },
    { q: "How do you verify AI-generated analysis?", a: "Check row counts and filters, recompute key totals and percentages independently (PivotTable, SUMIFS, SQL, script), ask the AI for its method and assumptions, and sanity-check results against business knowledge.", level: "Medium" },
    { q: "What is the risk of uploading a large file to a chat assistant?", a: "It may be truncated or sampled, causing incomplete results; there may also be privacy concerns. Confirm row counts, split data if needed, and use approved tools for confidential data.", level: "Medium" },
    { q: "Explain the DAX pattern for year-over-year %.", a: "Compute current sales, compute last year's sales with CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])), then DIVIDE(current - last year, last year), which returns BLANK if last year is zero. It requires a proper date table.", level: "Hard" },
    { q: "When would you use an AI cell function (like COPILOT() in Excel or AI() in Sheets)?", a: "For row-by-row text tasks such as classifying feedback, extracting entities or summarising comments - tasks that normal formulas can't do. Use fixed labels, spot-check accuracy and be aware results may change on recalculation.", level: "Hard" },
    { q: "How should you prepare data before using AI tools?", a: "One header row with clear names, one row per record, no merged cells or subtotal rows, consistent data types, formatted as a Table, sensitive columns removed or masked.", level: "Easy" },
    { q: "What is the analyst's role when AI can create charts and insights?", a: "Framing the right business questions, ensuring data quality, validating results, interpreting them in business context, communicating recommendations and owning accountability for the numbers.", level: "Medium" }
  ],
  practice: [
    { task: "Create a 20-row sales table in Excel or Google Sheets. Use Copilot/Gemini (or a chat assistant) to add a profit margin column and a PivotTable by category. Verify one category manually.", hint: "Format as Table first; margin = (Revenue - Cost) / Revenue.", solution: "Formula: =([@Revenue]-[@Cost])/[@Revenue]. Verify with SUMIFS for one category: compare Copilot's pivot total with =SUMIFS(Table1[Revenue],Table1[Category],\"Electronics\")." },
    { task: "Upload a public dataset CSV (e.g. a sample sales dataset) to Claude or ChatGPT and use the 3-step prompt (data check, answers, insights).", hint: "Ask for row count and method for each number.", solution: "Confirm the reported row count matches Excel's count (Ctrl+Down or =ROWS()). Recompute one total with a PivotTable." },
    { task: "Modify the verification script: add a claim 'North Q3 total = 807000' and a wrong claim 'West Aug units = 120'. Run it in the Python IDE.", hint: "Add units checks by building a units dictionary.", solution: "Add to ai_claims and checks; expected: North total OK, West Aug units WRONG (actual 110)." },
    { task: "Ask an AI assistant to write a DAX measure for 'Running Total of Sales by Date' given your model, and test it in Power BI.", hint: "Give table names and the date table.", solution: "Running Total = CALCULATE([Total Sales], FILTER(ALL('Date'[Date]), 'Date'[Date] <= MAX('Date'[Date]))). Verify by adding cumulative totals manually for the first 3 days." },
    { task: "Classify 15 real or sample feedback comments with an AI function or chat assistant into 5 categories. Measure accuracy by checking each manually.", hint: "Accuracy = correct / total.", solution: "If accuracy is below about 90%, refine category definitions (e.g. 'App Bug = crashes, freezes, errors') and add 1-2 examples (few-shot, Day 14)." }
  ],
  quiz: [
    { question: "Before using Copilot in Excel, you should format your data as:", options: ["A picture", "Merged cells", "An Excel Table (Ctrl+T) with clear headers", "A Word document"], answer: 2, explanation: "Copilot works best on Tables with clear headers saved in the cloud." },
    { question: "Which Power BI feature does Copilot help with?", options: ["Writing and explaining DAX measures", "Replacing the data source with images", "Deleting the model", "Printing posters"], answer: 0, explanation: "Copilot can generate and explain DAX, create pages and summaries." },
    { question: "An AI assistant says North grew 25%; your PivotTable shows 23.8%. What should you do?", options: ["Average the two", "Trust the AI", "Ignore the difference", "Use the verified figure and ask the AI to recompute with its formula"], answer: 3, explanation: "Independent verification wins; then investigate the AI's error." },
    { question: "Which Google tool provides AI help in a side panel inside Sheets?", options: ["Midjourney", "Gemini", "Power Query", "Tableau"], answer: 1, explanation: "Gemini in Google Workspace powers AI features in Sheets." },
    { question: "What is a good FIRST question after uploading a data file to an AI assistant?", options: ["Make it colourful", "Write a poem about the data", "Describe the columns, row count and data quality issues", "Delete duplicates without telling me"], answer: 2, explanation: "Understanding and checking the data first prevents wrong conclusions." }
  ]
};
