export default {
  "id": "day-01-introduction-to-data-analysis",
  "title": "Introduction to Data Analysis, Jupyter Notebook and Google Colab",
  "module": "Module 1: NumPy",
  "day": 1,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Understand what a data analyst does, the end-to-end analysis workflow (ask, collect, clean, analyse, visualise, share), the Python data stack (NumPy, pandas, Matplotlib, Seaborn) and how to work in Jupyter Notebook and Google Colab.",
  "objectives": [
    "Explain data analysis, types of analytics and the daily work of a data analyst",
    "Describe the analyst workflow from business question to report",
    "Know the role of NumPy, pandas, Matplotlib and Seaborn in the Python data stack",
    "Install and use Jupyter Notebook / JupyterLab and Google Colab (cells, kernels, shortcuts, magics)",
    "Write a first small analysis in plain Python on business data"
  ],
  "theory": [
    {
      "heading": "What is Data Analysis?",
      "content": "Data analysis is the process of inspecting, cleaning, transforming and summarising data to answer business questions and support decisions. A company collects data every day: sales orders, website visits, employee attendance, student marks. Raw data alone is not useful. An analyst turns it into answers such as **Which city gives the most revenue?** or **Why did sales drop in March?**\n\nAnalytics is usually described in four levels, from simple to advanced.",
      "points": [
        "**Descriptive** - What happened? (total sales last month, average marks)",
        "**Diagnostic** - Why did it happen? (sales fell because two stores were closed)",
        "**Predictive** - What will happen? (forecast next quarter's demand)",
        "**Prescriptive** - What should we do? (increase stock of the top 10 products)"
      ],
      "tip": "Most entry-level data analyst jobs in India focus on descriptive and diagnostic analysis using Excel, SQL, Python and Power BI/Tableau. Master these first."
    },
    {
      "heading": "The Data Analyst Workflow",
      "content": "Almost every analysis project follows the same cycle. Interviewers often ask you to explain it, so learn it with an example: an e-commerce manager asks **Which product categories should we promote during Diwali?**",
      "points": [
        "1. **Ask** - understand the business question, the KPI (revenue, profit, conversion) and the deadline",
        "2. **Collect** - get data from CSV/Excel files, SQL databases, APIs or web exports",
        "3. **Clean** - fix missing values, duplicates, wrong data types, spelling variations ('Mumbai', 'mumbai ')",
        "4. **Explore & Analyse** - summary statistics, group by category/month, compare, find patterns",
        "5. **Visualise** - charts that make the pattern obvious (bar, line, histogram)",
        "6. **Share** - a report, dashboard or presentation with clear recommendations"
      ],
      "tip": "Cleaning usually takes 60-80% of an analyst's time. Do not skip it - wrong data gives confident but wrong answers."
    },
    {
      "heading": "The Python Data Stack",
      "content": "Python is the most popular language for data analysis because it is easy to read, free, and has powerful libraries. In this 15-day course you will learn the core stack used in every analyst job description.",
      "points": [
        "**NumPy** - fast numerical arrays and maths; the foundation of all other libraries",
        "**pandas** - DataFrames (tables) for reading, cleaning, filtering, grouping and merging data - like Excel with code",
        "**Matplotlib** - the base plotting library (line, bar, pie, scatter, histogram)",
        "**Seaborn** - beautiful statistical charts with less code, built on Matplotlib",
        "**Plotly** - interactive charts for dashboards and web pages",
        "**Jupyter / Colab** - notebook environments where code, output, charts and notes live together"
      ],
      "syntax": "pip install numpy pandas matplotlib seaborn openpyxl jupyter\n\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns",
      "tip": "Always use these standard aliases (np, pd, plt, sns). Every tutorial, Stack Overflow answer and interviewer expects them."
    },
    {
      "heading": "Jupyter Notebook and JupyterLab",
      "content": "A Jupyter notebook (.ipynb file) is a document made of **cells**. A code cell runs Python and shows the output right below it; a Markdown cell holds headings and notes. This makes notebooks perfect for exploration: run a step, look at the result, then decide the next step.\n\nInstall with `pip install notebook` (classic) or `pip install jupyterlab`, then start with `jupyter notebook` or `jupyter lab` in a terminal. The notebook opens in your browser at http://localhost:8888. Behind every notebook runs a **kernel** - a Python process that keeps variables in memory between cells.",
      "points": [
        "Shift + Enter - run cell and move to the next one",
        "Esc then A / B - insert a cell above / below; Esc then D, D - delete a cell",
        "Esc then M - change cell to Markdown; Esc then Y - change to code",
        "The last expression in a cell is displayed automatically (no print needed), e.g. `df.head()`",
        "Kernel > Restart & Run All - re-runs everything from the top to make sure the notebook works in order",
        "Magic commands: `%timeit` (time a statement), `%matplotlib inline`, `!pip install seaborn` (run a shell command)"
      ],
      "tip": "Cells can be run in any order, which causes hidden-state bugs. Before sharing a notebook, always Restart Kernel and Run All."
    },
    {
      "heading": "Google Colab",
      "content": "Google Colab (colab.research.google.com) is a free, cloud-hosted Jupyter notebook. You only need a Google account and a browser - nothing to install. NumPy, pandas, Matplotlib, Seaborn and scikit-learn are pre-installed, and you even get free GPU access for machine learning.",
      "points": [
        "Upload a file: click the folder icon on the left and upload, or use `from google.colab import files; files.upload()`",
        "Mount Google Drive: `from google.colab import drive; drive.mount('/content/drive')`",
        "Install extra packages with `!pip install package-name`",
        "Notebooks are saved in your Google Drive and can be shared like a Google Doc",
        "The runtime resets after a period of inactivity - uploaded files are lost, so keep data in Drive"
      ],
      "tip": "Use Colab when your laptop is slow or you cannot install software (for example in a college lab). Use local Jupyter/VS Code for company work with private data."
    },
    {
      "heading": "Data Types You Will Meet",
      "content": "Before analysing, recognise what kind of data each column holds. This decides which summary and which chart is correct.",
      "points": [
        "**Numerical continuous** - price, salary, temperature (use mean, median, histogram)",
        "**Numerical discrete** - quantity, number of orders (counts)",
        "**Categorical nominal** - city, product category, gender (use counts, bar charts)",
        "**Categorical ordinal** - rating Low/Medium/High, education level (order matters)",
        "**Date/time** - order date, joining date (trends, line charts)",
        "**Structured** data is in rows and columns (Excel, SQL); **unstructured** data is text, images, audio"
      ]
    }
  ],
  "examples": [
    {
      "title": "Your First Analysis in Plain Python",
      "scenario": "A shop owner gives you one week of daily sales. Find total, average, best day and worst day - the descriptive analysis every report starts with.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Google Colab / VS Code on your machine)",
        "Paste the code into main.py (or a notebook cell)",
        "Run it and compare your output with the result below"
      ],
      "code": "# One week of daily sales (in rupees)\ndays = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]\nsales = [12500, 9800, 15200, 11000, 18900, 24500, 21300]\n\ntotal = sum(sales)\naverage = total / len(sales)\nbest = days[sales.index(max(sales))]\nworst = days[sales.index(min(sales))]\n\nprint(\"Total sales:\", total)\nprint(\"Average per day:\", round(average, 2))\nprint(\"Best day:\", best, max(sales))\nprint(\"Worst day:\", worst, min(sales))\nweekend = sales[5] + sales[6]\nprint(f\"Weekend share: {weekend / total:.1%}\")\n",
      "python": {
        "files": {
          "main.py": "# One week of daily sales (in rupees)\ndays = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]\nsales = [12500, 9800, 15200, 11000, 18900, 24500, 21300]\n\ntotal = sum(sales)\naverage = total / len(sales)\nbest = days[sales.index(max(sales))]\nworst = days[sales.index(min(sales))]\n\nprint(\"Total sales:\", total)\nprint(\"Average per day:\", round(average, 2))\nprint(\"Best day:\", best, max(sales))\nprint(\"Worst day:\", worst, min(sales))\nweekend = sales[5] + sales[6]\nprint(f\"Weekend share: {weekend / total:.1%}\")\n"
        }
      },
      "result": "Total sales: 113200\nAverage per day: 16171.43\nBest day: Sat 24500\nWorst day: Tue 9800\nWeekend share: 40.5%",
      "explanation": "sum() and len() give the total and the count, so total / count is the mean. index(max(...)) finds the position of the highest value, which we use to look up the day name. The weekend share shows that Saturday and Sunday bring about 40.5% of the weekly revenue - a real business insight (staff more people on weekends)."
    },
    {
      "title": "The Analyst Workflow on a Small Order List",
      "scenario": "Orders are stored as a list of dictionaries (like rows from a CSV). Clean the messy city names, then answer: which city brings the most revenue?",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Google Colab / VS Code on your machine)",
        "Paste the code into main.py (or a notebook cell)",
        "Run it and compare your output with the result below"
      ],
      "code": "orders = [\n    {\"order_id\": 101, \"city\": \"Mumbai\", \"amount\": 2500},\n    {\"order_id\": 102, \"city\": \"pune \", \"amount\": 1200},\n    {\"order_id\": 103, \"city\": \"Delhi\", \"amount\": 3200},\n    {\"order_id\": 104, \"city\": \"MUMBAI\", \"amount\": 1500},\n    {\"order_id\": 105, \"city\": \"Pune\", \"amount\": 2200},\n    {\"order_id\": 106, \"city\": \"Delhi\", \"amount\": None},\n]\n\n# Clean: standardise city names, skip missing amounts\nclean = []\nfor o in orders:\n    if o[\"amount\"] is None:\n        continue\n    clean.append({**o, \"city\": o[\"city\"].strip().title()})\nprint(\"Rows before/after cleaning:\", len(orders), len(clean))\n\n# Analyse: revenue per city\nrevenue = {}\nfor o in clean:\n    revenue[o[\"city\"]] = revenue.get(o[\"city\"], 0) + o[\"amount\"]\nprint(revenue)\n\ntop_city = max(revenue, key=revenue.get)\nprint(\"Top city:\", top_city)\n",
      "python": {
        "files": {
          "main.py": "orders = [\n    {\"order_id\": 101, \"city\": \"Mumbai\", \"amount\": 2500},\n    {\"order_id\": 102, \"city\": \"pune \", \"amount\": 1200},\n    {\"order_id\": 103, \"city\": \"Delhi\", \"amount\": 3200},\n    {\"order_id\": 104, \"city\": \"MUMBAI\", \"amount\": 1500},\n    {\"order_id\": 105, \"city\": \"Pune\", \"amount\": 2200},\n    {\"order_id\": 106, \"city\": \"Delhi\", \"amount\": None},\n]\n\n# Clean: standardise city names, skip missing amounts\nclean = []\nfor o in orders:\n    if o[\"amount\"] is None:\n        continue\n    clean.append({**o, \"city\": o[\"city\"].strip().title()})\nprint(\"Rows before/after cleaning:\", len(orders), len(clean))\n\n# Analyse: revenue per city\nrevenue = {}\nfor o in clean:\n    revenue[o[\"city\"]] = revenue.get(o[\"city\"], 0) + o[\"amount\"]\nprint(revenue)\n\ntop_city = max(revenue, key=revenue.get)\nprint(\"Top city:\", top_city)\n"
        }
      },
      "result": "Rows before/after cleaning: 6 5\n{'Mumbai': 4000, 'Pune': 3400, 'Delhi': 3200}\nTop city: Mumbai",
      "explanation": "Real data is messy: 'pune ' and 'MUMBAI' are the same cities as 'Pune' and 'Mumbai'. strip() removes spaces and title() fixes capitalisation. Rows with a missing amount are removed. Then a dictionary accumulates revenue per city (this is exactly what pandas groupby does in one line, which you will learn on Day 8)."
    },
    {
      "title": "Why NumPy and pandas? Loop vs Vectorised Code",
      "scenario": "Apply 18% GST to a list of prices. Compare a Python loop with the NumPy way, and preview a pandas table.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Google Colab / VS Code on your machine)",
        "Paste the code into main.py (or a notebook cell)",
        "Run it and compare your output with the result below"
      ],
      "code": "import numpy as np\nimport pandas as pd\n\nprices = [499, 1299, 799, 2499]\n\n# Plain Python: a loop\nwith_gst = []\nfor p in prices:\n    with_gst.append(round(p * 1.18, 2))\nprint(\"Loop:\", with_gst)\n\n# NumPy: one vectorised expression\narr = np.array(prices)\nprint(\"NumPy:\", np.round(arr * 1.18, 2))\n\n# pandas: a labelled table\ndf = pd.DataFrame({\"product\": [\"Mouse\", \"Keyboard\", \"Headset\", \"Webcam\"],\n                   \"price\": prices})\ndf[\"price_with_gst\"] = (df[\"price\"] * 1.18).round(2)\nprint(df)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport pandas as pd\n\nprices = [499, 1299, 799, 2499]\n\n# Plain Python: a loop\nwith_gst = []\nfor p in prices:\n    with_gst.append(round(p * 1.18, 2))\nprint(\"Loop:\", with_gst)\n\n# NumPy: one vectorised expression\narr = np.array(prices)\nprint(\"NumPy:\", np.round(arr * 1.18, 2))\n\n# pandas: a labelled table\ndf = pd.DataFrame({\"product\": [\"Mouse\", \"Keyboard\", \"Headset\", \"Webcam\"],\n                   \"price\": prices})\ndf[\"price_with_gst\"] = (df[\"price\"] * 1.18).round(2)\nprint(df)\n"
        }
      },
      "result": "Loop: [588.82, 1532.82, 942.82, 2948.82]\nNumPy: [ 588.82 1532.82  942.82 2948.82]\n    product  price  price_with_gst\n0     Mouse    499          588.82\n1  Keyboard   1299         1532.82\n2   Headset    799          942.82\n3    Webcam   2499         2948.82",
      "explanation": "The loop processes one value at a time. NumPy applies `* 1.18` to the whole array at once (vectorisation) - shorter and much faster on millions of rows. pandas adds column names and a row index, so the result looks like an Excel sheet. This is why the rest of the course is built on NumPy and pandas."
    },
    {
      "title": "Notebook-Style Exploration: First Look at a Dataset",
      "scenario": "The first thing an analyst does with new data: check its size, columns, types and a few rows. In Jupyter you would run each line in a separate cell.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Google Colab / VS Code on your machine)",
        "Paste the code into main.py (or a notebook cell)",
        "Run it and compare your output with the result below"
      ],
      "code": "import pandas as pd\n\nstudents = pd.DataFrame({\n    \"name\": [\"Aarav\", \"Diya\", \"Kabir\", \"Meera\", \"Rohan\"],\n    \"course\": [\"Python\", \"Excel\", \"Python\", \"Power BI\", \"Excel\"],\n    \"marks\": [88, 92, 75, 81, 69],\n})\n\nprint(students.shape)          # (rows, columns)\nprint(list(students.columns))\nprint(students.dtypes)\nprint(students.head(3))        # in Jupyter, just write students.head(3)\nprint(\"Average marks:\", students[\"marks\"].mean())\n",
      "python": {
        "files": {
          "main.py": "import pandas as pd\n\nstudents = pd.DataFrame({\n    \"name\": [\"Aarav\", \"Diya\", \"Kabir\", \"Meera\", \"Rohan\"],\n    \"course\": [\"Python\", \"Excel\", \"Python\", \"Power BI\", \"Excel\"],\n    \"marks\": [88, 92, 75, 81, 69],\n})\n\nprint(students.shape)          # (rows, columns)\nprint(list(students.columns))\nprint(students.dtypes)\nprint(students.head(3))        # in Jupyter, just write students.head(3)\nprint(\"Average marks:\", students[\"marks\"].mean())\n"
        }
      },
      "result": "(5, 3)\n['name', 'course', 'marks']\nname      object\ncourse    object\nmarks      int64\ndtype: object\n    name  course  marks\n0  Aarav  Python     88\n1   Diya   Excel     92\n2  Kabir  Python     75\nAverage marks: 81.0",
      "explanation": "shape tells you there are 5 rows and 3 columns. dtypes shows text columns as `object` and marks as `int64`. head(3) shows the first three rows. In a notebook you would not need print() for the last line of a cell - Jupyter displays it automatically as a formatted table."
    }
  ],
  "interview": [
    {
      "q": "What is data analysis? How is it different from data science?",
      "a": "Data analysis means cleaning, exploring and summarising existing data to answer business questions (mostly descriptive and diagnostic). Data science is broader: it includes analysis but also builds predictive models with statistics and machine learning. A data analyst answers 'what happened and why'; a data scientist often answers 'what will happen'.",
      "level": "Easy"
    },
    {
      "q": "Explain the four types of analytics with examples.",
      "a": "Descriptive: what happened (monthly sales report). Diagnostic: why it happened (sales fell because of a stock-out). Predictive: what will happen (forecast next month's demand). Prescriptive: what should we do (reorder 500 units of product X by Friday).",
      "level": "Easy"
    },
    {
      "q": "Walk me through your data analysis process.",
      "a": "1) Understand the business question and KPIs with stakeholders. 2) Collect data from databases, files or APIs. 3) Clean it: missing values, duplicates, types, inconsistent text, outliers. 4) Explore: summary stats, distributions, group-wise comparisons. 5) Visualise the key findings. 6) Communicate insights and recommendations in a report or dashboard, and validate numbers with the business.",
      "level": "Medium"
    },
    {
      "q": "What is a Jupyter notebook and why do analysts use it?",
      "a": "A Jupyter notebook is an interactive document of code and Markdown cells, backed by a kernel that keeps variables in memory. Analysts use it because they can run code step by step, see tables and charts inline, document reasoning in Markdown and share the whole analysis as one .ipynb file.",
      "level": "Easy"
    },
    {
      "q": "What is a kernel in Jupyter? What happens when you restart it?",
      "a": "The kernel is the Python process that executes the notebook's code and stores variables. Restarting it clears all variables and imports from memory; you must run the cells again. 'Restart & Run All' is used to check the notebook runs correctly from top to bottom.",
      "level": "Medium"
    },
    {
      "q": "What are the risks of running notebook cells out of order?",
      "a": "Variables may hold values from cells that were later edited or deleted (hidden state), so the notebook works for you but fails for others or gives different numbers. Fix: keep cells in logical order and Restart & Run All before sharing.",
      "level": "Medium"
    },
    {
      "q": "Google Colab vs local Jupyter - when would you use each?",
      "a": "Colab: no installation, free GPU, libraries pre-installed, easy sharing via Drive; but sessions time out, files are temporary and data is in the cloud. Local Jupyter: full control, works offline, better for confidential company data and large local files.",
      "level": "Easy"
    },
    {
      "q": "Why is Python preferred over Excel for data analysis?",
      "a": "Python handles millions of rows that Excel cannot (Excel's limit is 1,048,576 rows), makes work repeatable through scripts (no manual clicking), connects to databases and APIs, and has libraries for statistics, visualisation and ML. Excel is still great for quick ad-hoc analysis and sharing with business users - analysts use both.",
      "level": "Medium"
    },
    {
      "q": "Name the main Python libraries used by a data analyst and their purpose.",
      "a": "NumPy - numerical arrays and maths. pandas - tabular data cleaning and analysis. Matplotlib - basic plotting. Seaborn - statistical visualisation. Plotly - interactive charts. openpyxl - read/write Excel files. SQLAlchemy - connect to SQL databases. scipy/statsmodels - statistics.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between structured, semi-structured and unstructured data?",
      "a": "Structured data fits rows and columns with a fixed schema (SQL tables, CSV). Semi-structured data has tags/keys but a flexible schema (JSON, XML). Unstructured data has no tabular form (emails, images, audio). Analysts mostly work with structured data and convert semi-structured data (like API JSON) into tables.",
      "level": "Medium"
    },
    {
      "q": "Which magic commands in Jupyter have you used?",
      "a": "%timeit to measure execution time, %matplotlib inline to show charts in the notebook, %%time for a whole cell, %who to list variables, %load_ext autoreload for reloading modules, and ! to run shell commands such as !pip install seaborn.",
      "level": "Medium"
    },
    {
      "q": "A manager says 'sales are down, find out why'. How would you approach it?",
      "a": "Clarify: down compared to what period and by how much? Then break revenue into drivers: number of orders x average order value, and slice by region, product, channel and customer segment to find where the drop is concentrated. Check data issues (missing days, pipeline failures) and external factors (season, price changes, stock-outs, competitor offers). Finally present the main driver with evidence and suggested actions.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Monthly revenue for six months is [42000, 38500, 45100, 51200, 47800, 55300] (Jan-Jun). Print the total, the average (2 decimals), the best month name, and the percentage growth from Jan to Jun.",
      "hint": "Keep a list of month names in the same order; growth % = (last - first) / first * 100.",
      "solution": "months = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\"]\nrevenue = [42000, 38500, 45100, 51200, 47800, 55300]\n\ntotal = sum(revenue)\nprint(\"Total:\", total)\nprint(\"Average:\", round(total / len(revenue), 2))\nprint(\"Best month:\", months[revenue.index(max(revenue))])\ngrowth = (revenue[-1] - revenue[0]) / revenue[0] * 100\nprint(f\"Growth Jan->Jun: {growth:.2f}%\")\n"
    },
    {
      "task": "Given employee records as a list of dicts with keys name, dept and salary, count employees per department and find the department with the highest average salary.",
      "hint": "Use two dictionaries: one for counts and one for salary totals, then divide.",
      "solution": "emps = [\n    {\"name\": \"Asha\", \"dept\": \"IT\", \"salary\": 65000},\n    {\"name\": \"Vikram\", \"dept\": \"HR\", \"salary\": 42000},\n    {\"name\": \"Neha\", \"dept\": \"IT\", \"salary\": 72000},\n    {\"name\": \"Arjun\", \"dept\": \"Sales\", \"salary\": 48000},\n    {\"name\": \"Pooja\", \"dept\": \"Sales\", \"salary\": 51000},\n]\ncount, total = {}, {}\nfor e in emps:\n    count[e[\"dept\"]] = count.get(e[\"dept\"], 0) + 1\n    total[e[\"dept\"]] = total.get(e[\"dept\"], 0) + e[\"salary\"]\navg = {d: total[d] / count[d] for d in count}\nprint(count)\nprint(avg)\nprint(\"Highest average:\", max(avg, key=avg.get))\n"
    },
    {
      "task": "Classify each column of this dataset as numerical continuous, numerical discrete, categorical nominal, categorical ordinal or date: order_id, order_date, city, quantity, unit_price, customer_rating (Poor/Average/Good/Excellent), payment_mode.",
      "hint": "Ask: is it measured or counted? Does the order of categories matter?",
      "solution": "# Answer (no code needed, printed for reference)\ncolumns = {\n    \"order_id\": \"identifier (nominal, not used for maths)\",\n    \"order_date\": \"date/time\",\n    \"city\": \"categorical nominal\",\n    \"quantity\": \"numerical discrete\",\n    \"unit_price\": \"numerical continuous\",\n    \"customer_rating\": \"categorical ordinal\",\n    \"payment_mode\": \"categorical nominal\",\n}\nfor col, kind in columns.items():\n    print(f\"{col:16} -> {kind}\")\n"
    },
    {
      "task": "Create a Google Colab notebook: add a Markdown title cell 'Week 1 Sales', a code cell that builds a pandas DataFrame of 5 products with price and quantity, add a revenue column and display it. Then Restart and Run All.",
      "hint": "In Colab, Insert > Text cell for Markdown. The last line of a cell (df) is displayed automatically.",
      "solution": "# Cell 1 (Markdown):  # Week 1 Sales\n# Cell 2 (Code):\nimport pandas as pd\n\ndf = pd.DataFrame({\n    \"product\": [\"Pen\", \"Notebook\", \"Bag\", \"Bottle\", \"Calculator\"],\n    \"price\": [20, 60, 850, 300, 650],\n    \"qty\": [150, 80, 12, 25, 10],\n})\ndf[\"revenue\"] = df[\"price\"] * df[\"qty\"]\nprint(df)          # in Colab you can simply write: df\n# Then: Runtime > Restart session and run all\n"
    }
  ],
  "quiz": [
    {
      "question": "Which type of analytics answers 'Why did sales drop last month?'",
      "options": [
        "Descriptive",
        "Diagnostic",
        "Predictive",
        "Prescriptive"
      ],
      "answer": 1,
      "explanation": "Diagnostic analytics investigates the reasons behind an observed result."
    },
    {
      "question": "Which keyboard shortcut runs a Jupyter cell and moves to the next cell?",
      "options": [
        "Ctrl + S",
        "Shift + Enter",
        "Alt + R",
        "Esc + D"
      ],
      "answer": 1,
      "explanation": "Shift + Enter executes the current cell and selects the next one."
    },
    {
      "question": "Which library provides the DataFrame object?",
      "options": [
        "NumPy",
        "Matplotlib",
        "pandas",
        "Seaborn"
      ],
      "answer": 2,
      "explanation": "pandas provides Series and DataFrame for labelled tabular data."
    },
    {
      "question": "In the analyst workflow, which step usually takes the most time?",
      "options": [
        "Asking the question",
        "Cleaning the data",
        "Making the final slide",
        "Installing Python"
      ],
      "answer": 1,
      "explanation": "Data cleaning typically consumes 60-80% of project time because real data is messy."
    },
    {
      "question": "How do you install a package inside a Google Colab cell?",
      "options": [
        "install seaborn",
        "!pip install seaborn",
        "import pip seaborn",
        "%install seaborn"
      ],
      "answer": 1,
      "explanation": "The ! prefix runs a shell command from a notebook cell, so !pip install works."
    },
    {
      "question": "A 'customer_rating' column with values Poor, Average, Good, Excellent is:",
      "options": [
        "Numerical continuous",
        "Categorical nominal",
        "Categorical ordinal",
        "Date/time"
      ],
      "answer": 2,
      "explanation": "The categories have a natural order, so it is ordinal."
    }
  ]
};
