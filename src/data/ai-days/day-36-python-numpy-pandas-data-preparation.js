export default {
  id: "day-36-python-numpy-pandas-data-preparation",
  title: "Python for AI: NumPy, Pandas and Data Preparation",
  module: "Module 6: Machine Learning Hands-on",
  day: 36,
  level: "Beginner",
  duration: "2 hours",
  summary: "Start the hands-on Machine Learning module. Learn why Python is the language of AI, use NumPy arrays for fast maths on numbers, use Pandas DataFrames to load, explore and clean tabular data, and prepare data for a model: handle missing values, remove duplicates, encode text categories (one-hot encoding), scale numbers and split features (X) from the target (y). Everything runs in the in-app Python IDE with numpy and pandas preloaded.",
  objectives: [
    "Explain why Python, NumPy and Pandas are the standard toolkit for AI and ML work",
    "Create NumPy arrays and use vectorised maths, boolean filtering, shape and matrix multiplication",
    "Load, inspect, filter and group a Pandas DataFrame",
    "Clean data: missing values, duplicates, wrong types and outliers",
    "Prepare features for ML: one-hot encoding, min-max scaling and the X / y split"
  ],
  theory: [
    {
      heading: "Why Python for AI?",
      content: "Almost every AI and ML project today uses Python. Python itself is simple to read, and the heavy maths is done by fast libraries written in C/C++ underneath. Think of Python as the steering wheel and NumPy/Pandas/scikit-learn as the engine. You write a few readable lines; the libraries crunch millions of numbers.",
      points: [
        "NumPy: fast arrays and maths (vectors, matrices). Every ML library is built on top of it.",
        "Pandas: tables (DataFrames) - like Excel sheets inside Python. Used to load CSV/Excel files, clean and explore data.",
        "scikit-learn: classic ML models (regression, classification, clustering) - Days 37-40.",
        "Matplotlib / Seaborn: charts. Hugging Face transformers / PyTorch: deep learning and pre-trained models - Day 41.",
        "Jupyter Notebook, Google Colab and the in-app Python IDE (/tools/python-ide) let you run code cell by cell and see results immediately."
      ],
      tip: "A data scientist often says: 80% of ML work is data preparation, 20% is modelling. Today is the 80% day."
    },
    {
      heading: "NumPy Arrays: Fast Maths on Many Numbers",
      content: "A NumPy array is a grid of numbers of the same type. Unlike a Python list, you can do maths on the whole array in one go (vectorisation) - no loop needed. Analogy: a list is a bag of separate items; an array is an egg tray where every slot is the same size, so a machine can process the whole tray at once.",
      syntax: `import numpy as np
a = np.array([12, 15, 11, 18, 14])   # 1-D array (vector)
a * 2            # [24 30 22 36 28]  - every element doubled
a.mean(), a.max(), a.std()
a[a > 13]        # boolean filtering -> [15 18 14]
m = np.array([[1, 2], [3, 4]])       # 2-D array (matrix)
m.shape          # (2, 2)  rows, columns
m.T              # transpose
m @ m            # matrix multiplication
np.zeros((2, 3)), np.ones(4), np.arange(0, 10, 2), np.linspace(0, 1, 5)
a.reshape(5, 1)  # change shape: 5 rows, 1 column`,
      points: [
        "shape tells you the dimensions. ML models usually expect X with shape (rows, features) - a 2-D array.",
        "dtype tells the type: int64, float64, bool.",
        "Broadcasting: a + 10 adds 10 to every element; NumPy 'stretches' the smaller value automatically.",
        "Matrix multiplication (@) is the core operation inside neural networks: inputs @ weights.",
        "np.random.seed(42) or np.random.default_rng(42) makes random numbers repeatable."
      ]
    },
    {
      heading: "Pandas DataFrames: Excel Inside Python",
      content: "A DataFrame is a table with named columns and an index (row labels). Each column is a Series. If you know Excel or SQL, Pandas will feel familiar: filter = WHERE, groupby = GROUP BY / PivotTable, merge = JOIN / VLOOKUP.",
      syntax: `import pandas as pd
df = pd.read_csv("students.csv")      # or pd.read_excel, or pd.DataFrame(dict)
df.head()         # first 5 rows
df.shape          # (rows, columns)
df.info()         # column types + non-null counts
df.describe()     # count, mean, std, min, quartiles, max
df["marks"]                         # one column (Series)
df[["name", "marks"]]               # several columns
df[df["marks"] > 80]                # filter rows
df.sort_values("marks", ascending=False)
df.groupby("city")["marks"].mean()  # average per group
df["grade"] = df["marks"].apply(lambda m: "A" if m >= 80 else "B")`,
      points: [
        "Always start with head(), shape, info() and describe() - this is called EDA (Exploratory Data Analysis).",
        "value_counts() counts each category - great for checking class balance (e.g. how many spam vs not spam).",
        "loc[] selects by label, iloc[] selects by position.",
        "Pandas reads CSV, Excel, JSON, SQL databases and even web tables."
      ]
    },
    {
      heading: "Cleaning Data: Missing Values, Duplicates, Types and Outliers",
      content: "Real data is messy: blank cells, the same customer entered twice, numbers stored as text, a typo making age 250. Models learn from whatever you give them - garbage in, garbage out. Cleaning is like washing vegetables before cooking.",
      syntax: `df.isna().sum()                         # missing values per column
df["marks"] = df["marks"].fillna(df["marks"].mean())   # fill with mean (or median)
df = df.dropna(subset=["city"])         # or drop rows missing an important field
df = df.drop_duplicates()               # remove exact duplicate rows
df["price"] = pd.to_numeric(df["price"], errors="coerce")  # text -> number
df["date"] = pd.to_datetime(df["date"])
df = df[df["age"].between(0, 100)]      # remove impossible values`,
      points: [
        "Fill numeric gaps with mean (normal data) or median (data with outliers). Fill categories with the most common value or 'Unknown'.",
        "Drop rows only when few are missing - dropping too many throws away information.",
        "Outliers: check with describe() or a box plot; decide whether they are errors (remove/fix) or real rare events (keep).",
        "Never fill missing values in the target column (y) with guesses - drop those rows instead.",
        "Data leakage warning: compute fill values and scaling only from training data in serious projects (Day 40)."
      ]
    },
    {
      heading: "Preparing Features: Encoding and Scaling",
      content: "ML models only understand numbers. Text categories must be converted (encoded), and numbers on very different scales should be scaled so that one large column (salary in lakhs) does not overpower a small one (years of experience).",
      syntax: `# One-hot encoding: one 0/1 column per category
df = pd.get_dummies(df, columns=["city"], dtype=int)
# Label / ordinal encoding for ordered categories
df["size"] = df["size"].map({"S": 0, "M": 1, "L": 2})
# Min-max scaling to 0..1
df["hours_scaled"] = (df["hours"] - df["hours"].min()) / (df["hours"].max() - df["hours"].min())
# Standard scaling (z-score): mean 0, std 1  (sklearn: StandardScaler)
df["z"] = (df["hours"] - df["hours"].mean()) / df["hours"].std()`,
      points: [
        "One-hot encoding for categories with no order (city, colour). Ordinal mapping for ordered categories (S < M < L).",
        "Do not give cities numbers like Pune=1, Mumbai=2, Delhi=3 - the model would think Delhi is 'bigger' than Pune.",
        "Scaling matters a lot for distance-based models (KNN, k-means) and gradient-based models (logistic regression, neural networks). Tree models do not need it.",
        "scikit-learn has the same tools: OneHotEncoder, MinMaxScaler, StandardScaler, SimpleImputer."
      ]
    },
    {
      heading: "Features (X) and Target (y): The Final Shape",
      content: "Before training, split the table into X (the input columns, called features) and y (the column you want to predict, called the target or label). Analogy: X is the question paper, y is the answer key. The model studies many (X, y) pairs and learns to produce y from X.",
      syntax: `X = df[["hours", "attendance", "city_Pune", "city_Mumbai"]]   # 2-D: (rows, features)
y = df["passed"]                                                # 1-D: (rows,)
print(X.shape, y.shape)`,
      points: [
        "X must be 2-D even with one feature: df[['hours']] (double brackets), or arr.reshape(-1, 1).",
        "Remove ID columns and names from X - they carry no general pattern and can cause overfitting.",
        "Remove columns that 'leak' the answer (e.g. 'final_grade' when predicting 'passed').",
        "Visual intuition: open the ML Playground (/tools/ml-playground), click to add points - each point is a row, its x/y position are features, its colour is the target."
      ],
      tip: "Checklist before modelling: no missing values, all columns numeric, no ID/leak columns, X is 2-D, y is 1-D, rows of X and y line up."
    }
  ],
  examples: [
    {
      title: "NumPy Basics: Vectorised Maths, Filtering and Matrices",
      scenario: "You have the daily study hours of 5 students and want quick statistics without writing loops, plus a first look at matrix multiplication (the core operation inside neural networks).",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Create or open main.py and paste the code below",
        "Click Run",
        "Compare your output with the Result section",
        "Change the numbers in the array and run again"
      ],
      code: `import numpy as np

hours = np.array([12, 15, 11, 18, 14])
print("doubled:", hours * 2)
print("mean:", round(float(hours.mean()), 2))
print("max:", int(hours.max()))
print("std:", round(float(hours.std()), 2))
print("above 13:", hours[hours > 13])

m = np.array([[1, 2], [3, 4]])
print("shape:", m.shape)
print("transpose:", m.T.tolist())
print("m @ m:", (m @ m).tolist())`,
      python: {
        files: {
          "main.py": `import numpy as np

hours = np.array([12, 15, 11, 18, 14])
print("doubled:", hours * 2)
print("mean:", round(float(hours.mean()), 2))
print("max:", int(hours.max()))
print("std:", round(float(hours.std()), 2))
print("above 13:", hours[hours > 13])

m = np.array([[1, 2], [3, 4]])
print("shape:", m.shape)
print("transpose:", m.T.tolist())
print("m @ m:", (m @ m).tolist())
`
        },
        stdin: ""
      },
      result: `doubled: [24 30 22 36 28]
mean: 14.0
max: 18
std: 2.45
above 13: [15 18 14]
shape: (2, 2)
transpose: [[1, 3], [2, 4]]
m @ m: [[7, 10], [15, 22]]`,
      explanation: "hours * 2 doubles every element at once (vectorisation). Mean = 70/5 = 14. Std: the differences from 14 are -2, 1, -3, 4, 0; their squares add up to 30; 30/5 = 6; square root of 6 = 2.45 (NumPy's default std divides by n). hours > 13 creates a True/False mask and hours[mask] keeps only the True positions. m @ m: row 1 = [1*1+2*3, 1*2+2*4] = [7, 10]; row 2 = [3*1+4*3, 3*2+4*4] = [15, 22]. .tolist() is used so the printout is a plain Python list."
    },
    {
      title: "Pandas: Explore and Clean a Student Table",
      scenario: "A teacher shares a small student sheet. One student's marks are missing. You need the number of missing values, fill the gap with the average, and find the average marks per city.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read the output line by line and match it with the explanation",
        "Try fillna with the median instead of the mean and see what changes"
      ],
      code: `import pandas as pd

df = pd.DataFrame({
    "name":  ["Asha", "Ravi", "Meena", "John", "Sara"],
    "city":  ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai"],
    "marks": [78, None, 92, 65, 85],
    "hours": [5, 3, 7, 2, 6],
})
print("shape:", df.shape)
print("missing marks:", int(df["marks"].isna().sum()))
avg = df["marks"].mean()            # mean ignores the missing value
print("average of known marks:", avg)
df["marks"] = df["marks"].fillna(avg)
print("marks after fill:", df["marks"].tolist())
print("mean by city:", df.groupby("city")["marks"].mean().round(1).to_dict())
print("toppers:", df[df["marks"] > 80]["name"].tolist())`,
      python: {
        files: {
          "main.py": `import pandas as pd

df = pd.DataFrame({
    "name":  ["Asha", "Ravi", "Meena", "John", "Sara"],
    "city":  ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai"],
    "marks": [78, None, 92, 65, 85],
    "hours": [5, 3, 7, 2, 6],
})
print("shape:", df.shape)
print("missing marks:", int(df["marks"].isna().sum()))
avg = df["marks"].mean()            # mean ignores the missing value
print("average of known marks:", avg)
df["marks"] = df["marks"].fillna(avg)
print("marks after fill:", df["marks"].tolist())
print("mean by city:", df.groupby("city")["marks"].mean().round(1).to_dict())
print("toppers:", df[df["marks"] > 80]["name"].tolist())
`
        },
        stdin: ""
      },
      result: `shape: (5, 4)
missing marks: 1
average of known marks: 80.0
marks after fill: [78.0, 80.0, 92.0, 65.0, 85.0]
mean by city: {'Delhi': 65.0, 'Mumbai': 82.5, 'Pune': 85.0}
toppers: ['Meena', 'Sara']`,
      explanation: "None becomes NaN (missing) in Pandas, so the marks column becomes float. The mean skips NaN: (78+92+65+85)/4 = 80.0. After fillna, Ravi gets 80.0. Group averages: Delhi = 65, Mumbai = (80+85)/2 = 82.5, Pune = (78+92)/2 = 85. Filtering marks > 80 is strictly greater than, so Ravi's filled 80.0 is excluded and only Meena (92) and Sara (85) are toppers. Always check boundary values like this when you filter."
    },
    {
      title: "Data Preparation: One-hot Encoding, Scaling and X / y Split",
      scenario: "You want to predict whether a student passes. Before training, the text column 'city' must become numbers, hours must be scaled to 0..1, and the table must be split into X (features) and y (target).",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Look at the new column names created by get_dummies",
        "Check the shapes of X and y"
      ],
      code: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Asha", "Ravi", "Meena", "John", "Sara"],
    "city":   ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai"],
    "hours":  [5, 3, 7, 2, 6],
    "passed": [1, 0, 1, 0, 1],
})
lo, hi = df["hours"].min(), df["hours"].max()
df["hours_scaled"] = ((df["hours"] - lo) / (hi - lo)).round(2)
print("scaled hours:", df["hours_scaled"].tolist())

df = pd.get_dummies(df, columns=["city"], dtype=int)
print("columns:", df.columns.tolist())

X = df.drop(columns=["name", "hours", "passed"])
y = df["passed"]
print("X shape:", X.shape, " y shape:", y.shape)
print("first row of X:", X.iloc[0].tolist())`,
      python: {
        files: {
          "main.py": `import pandas as pd

df = pd.DataFrame({
    "name":   ["Asha", "Ravi", "Meena", "John", "Sara"],
    "city":   ["Pune", "Mumbai", "Pune", "Delhi", "Mumbai"],
    "hours":  [5, 3, 7, 2, 6],
    "passed": [1, 0, 1, 0, 1],
})
lo, hi = df["hours"].min(), df["hours"].max()
df["hours_scaled"] = ((df["hours"] - lo) / (hi - lo)).round(2)
print("scaled hours:", df["hours_scaled"].tolist())

df = pd.get_dummies(df, columns=["city"], dtype=int)
print("columns:", df.columns.tolist())

X = df.drop(columns=["name", "hours", "passed"])
y = df["passed"]
print("X shape:", X.shape, " y shape:", y.shape)
print("first row of X:", X.iloc[0].tolist())
`
        },
        stdin: ""
      },
      result: `scaled hours: [0.6, 0.2, 1.0, 0.0, 0.8]
columns: ['name', 'hours', 'passed', 'hours_scaled', 'city_Delhi', 'city_Mumbai', 'city_Pune']
X shape: (5, 4)  y shape: (5,)
first row of X: [0.6, 0.0, 0.0, 1.0]`,
      explanation: "Min-max scaling: (hours - 2) / (7 - 2). Asha: 3/5 = 0.6, John (the minimum) becomes 0.0 and Meena (the maximum) becomes 1.0. get_dummies removes 'city' and appends one 0/1 column per city in alphabetical order (Delhi, Mumbai, Pune). X keeps hours_scaled + 3 city columns = 4 features; y is a 1-D Series of 5 labels. Asha's row: scaled 0.6, Delhi 0, Mumbai 0, Pune 1 (iloc returns floats because the row mixes float and int columns)."
    },
    {
      title: "Pure-Python Version (Runs Anywhere, No Libraries)",
      scenario: "To truly understand what Pandas does for you, do the same cleaning, grouping, scaling and one-hot encoding with plain Python lists and dictionaries. This version runs on any Python installation.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or any Python 3 installation",
        "Paste the code and click Run",
        "Compare each result with the Pandas versions above - they match",
        "Notice how many more lines plain Python needs - that is why we use Pandas"
      ],
      code: `# Pure-Python version of the data-prep steps (no libraries needed)
rows = [
    {"name": "Asha",  "city": "Pune",   "marks": 78,   "hours": 5},
    {"name": "Ravi",  "city": "Mumbai", "marks": None, "hours": 3},
    {"name": "Meena", "city": "Pune",   "marks": 92,   "hours": 7},
    {"name": "John",  "city": "Delhi",  "marks": 65,   "hours": 2},
    {"name": "Sara",  "city": "Mumbai", "marks": 85,   "hours": 6},
]
known = [r["marks"] for r in rows if r["marks"] is not None]
avg = sum(known) / len(known)
print("average of known marks:", avg)
for r in rows:
    if r["marks"] is None:
        r["marks"] = avg
by_city = {}
for r in rows:
    by_city.setdefault(r["city"], []).append(r["marks"])
print("mean marks by city:", {c: round(sum(v) / len(v), 1) for c, v in sorted(by_city.items())})
lo = min(r["hours"] for r in rows)
hi = max(r["hours"] for r in rows)
print("scaled hours:", [round((r["hours"] - lo) / (hi - lo), 2) for r in rows])
cities = sorted({r["city"] for r in rows})
print("one-hot columns:", ["city_" + c for c in cities])
for r in rows:
    print(r["name"], [1 if r["city"] == c else 0 for c in cities])`,
      python: {
        files: {
          "main.py": `# Pure-Python version of the data-prep steps (no libraries needed)
rows = [
    {"name": "Asha",  "city": "Pune",   "marks": 78,   "hours": 5},
    {"name": "Ravi",  "city": "Mumbai", "marks": None, "hours": 3},
    {"name": "Meena", "city": "Pune",   "marks": 92,   "hours": 7},
    {"name": "John",  "city": "Delhi",  "marks": 65,   "hours": 2},
    {"name": "Sara",  "city": "Mumbai", "marks": 85,   "hours": 6},
]
known = [r["marks"] for r in rows if r["marks"] is not None]
avg = sum(known) / len(known)
print("average of known marks:", avg)
for r in rows:
    if r["marks"] is None:
        r["marks"] = avg
by_city = {}
for r in rows:
    by_city.setdefault(r["city"], []).append(r["marks"])
print("mean marks by city:", {c: round(sum(v) / len(v), 1) for c, v in sorted(by_city.items())})
lo = min(r["hours"] for r in rows)
hi = max(r["hours"] for r in rows)
print("scaled hours:", [round((r["hours"] - lo) / (hi - lo), 2) for r in rows])
cities = sorted({r["city"] for r in rows})
print("one-hot columns:", ["city_" + c for c in cities])
for r in rows:
    print(r["name"], [1 if r["city"] == c else 0 for c in cities])
`
        },
        stdin: ""
      },
      result: `average of known marks: 80.0
mean marks by city: {'Delhi': 65.0, 'Mumbai': 82.5, 'Pune': 85.0}
scaled hours: [0.6, 0.2, 1.0, 0.0, 0.8]
one-hot columns: ['city_Delhi', 'city_Mumbai', 'city_Pune']
Asha [0, 0, 1]
Ravi [0, 1, 0]
Meena [0, 0, 1]
John [1, 0, 0]
Sara [0, 1, 0]`,
      explanation: "Exactly the same numbers as the Pandas examples: mean imputation gives 80.0, group means 65.0 / 82.5 / 85.0, min-max scaling 0.6, 0.2, 1.0, 0.0, 0.8, and one 0/1 column per city. Pandas does all of this in one line each, faster and with fewer bugs - but now you know what happens underneath."
    },
    {
      title: "Use AI to Plan a Data-Cleaning Script",
      scenario: "You receive a messy CSV of 2,000 customer orders and want an AI assistant to suggest a cleaning plan and Pandas code. You must still run and verify the code yourself.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste only the column names and 5 sample rows (never real customer personal data)",
        "Paste the prompt below and run it",
        "Copy the generated code into the Python IDE and test it on your sample",
        "Check every step - AI code can use wrong column names or outdated functions"
      ],
      code: `You are a senior data analyst who teaches beginners.
I have a CSV with columns: order_id, order_date, customer_city, product, qty, price, discount.
Sample rows (fake data):
1001, 2026-01-05, Pune, Pen, 10, 12.5,
1002, 05/01/2026, mumbai, Notebook, two, 40, 5
1002, 05/01/2026, mumbai, Notebook, two, 40, 5
1003, 2026-01-07, Delhi, Bag, 1, 1200, 0
1004, 2026-01-08, PUNE, Pen, -3, 12.5, 0

Task: list every data-quality problem you see, then write Pandas code that fixes them.
Format: 1) a table: problem | column | fix  2) commented Python code  3) three checks I should run after cleaning.
Constraints: use only pandas; do not invent columns; explain each step in one line.`,
      prompt: {
        system: "You are a senior data analyst who teaches beginners. You write clear, commented Pandas code and never invent columns that are not in the data.",
        user: "I have a CSV with columns: order_id, order_date, customer_city, product, qty, price, discount.\nSample rows (fake data):\n1001, 2026-01-05, Pune, Pen, 10, 12.5, \n1002, 05/01/2026, mumbai, Notebook, two, 40, 5\n1002, 05/01/2026, mumbai, Notebook, two, 40, 5\n1003, 2026-01-07, Delhi, Bag, 1, 1200, 0\n1004, 2026-01-08, PUNE, Pen, -3, 12.5, 0\n\nTask: list every data-quality problem you see, then write Pandas code that fixes them.\nFormat: 1) a table: problem | column | fix  2) commented Python code  3) three checks I should run after cleaning.\nConstraints: use only pandas; do not invent columns; explain each step in one line."
      },
      result: "A problem table similar to: missing discount -> fill 0; duplicate order 1002 -> drop_duplicates; mixed date formats -> pd.to_datetime with a format / dayfirst; inconsistent city case -> str.strip().str.title(); qty stored as text 'two' -> pd.to_numeric(errors='coerce') then review; negative qty -> flag or remove. Then commented Pandas code and checks such as df.isna().sum(), df.duplicated().sum(), df.describe().",
      explanation: "AI is an excellent assistant for spotting data-quality issues and drafting code, but you are the analyst: run the code, check the row counts before and after, and confirm that decisions (like removing negative quantities) match business rules. Never paste real personal data into a public chatbot."
    }
  ],
  tools: [
    { name: "In-app Python IDE", use: "Run NumPy and Pandas code in the browser - no installation", url: "/tools/python-ide" },
    { name: "ML Playground", use: "See rows as points and labels as colours to build intuition about features and targets", url: "/tools/ml-playground" },
    { name: "Google Colab", use: "Free cloud Jupyter notebooks with NumPy, Pandas and scikit-learn preinstalled", url: "https://colab.research.google.com" },
    { name: "NumPy", use: "Arrays and fast numerical maths", url: "https://numpy.org" },
    { name: "Pandas", use: "DataFrames for loading, cleaning and exploring tables", url: "https://pandas.pydata.org" },
    { name: "Kaggle Datasets", use: "Free practice datasets (Titanic, house prices, etc.)", url: "https://www.kaggle.com/datasets" }
  ],
  interview: [
    { q: "Why is NumPy faster than Python lists for numerical work?", a: "NumPy stores numbers of one type in a contiguous block of memory and runs operations in optimised C code over the whole array (vectorisation). A Python list stores separate objects and needs a Python-level loop, which is much slower.", level: "Easy" },
    { q: "What is the difference between a Pandas Series and a DataFrame?", a: "A Series is a single labelled column (1-D). A DataFrame is a table of several Series sharing the same index (2-D).", level: "Easy" },
    { q: "How do you handle missing values?", a: "First measure them with df.isna().sum(). Then, depending on the amount and meaning: drop rows/columns (if few or useless), fill numeric columns with mean/median, fill categorical columns with mode or 'Unknown', use model-based imputation, or add an 'is_missing' flag. Never guess the target column.", level: "Easy" },
    { q: "Mean or median imputation - when to use which?", a: "Mean for roughly symmetric data without outliers. Median when the data is skewed or has outliers (e.g. salaries), because a few huge values pull the mean up but not the median.", level: "Medium" },
    { q: "What is one-hot encoding and why not just number the categories?", a: "One-hot creates one 0/1 column per category. Numbering (Pune=1, Mumbai=2, Delhi=3) creates a fake order and fake distances that the model will treat as meaningful. Ordinal numbering is only correct when categories have a real order (S < M < L).", level: "Medium" },
    { q: "Explain normalisation (min-max) vs standardisation (z-score).", a: "Min-max rescales to a fixed range, usually 0..1: (x - min)/(max - min). Standardisation centres to mean 0 and std 1: (x - mean)/std. Standardisation is less sensitive to a single extreme value defining the range and is the common default for linear models and neural nets.", level: "Medium" },
    { q: "Which models need feature scaling?", a: "Distance-based (KNN, k-means, SVM) and gradient-descent-based models (logistic/linear regression with regularisation, neural networks). Tree-based models (decision tree, random forest, gradient boosting) split on thresholds and do not need scaling.", level: "Medium" },
    { q: "What is the shape requirement of X in scikit-learn?", a: "X must be 2-D: (n_samples, n_features). With a single feature use df[['col']] or arr.reshape(-1, 1). y is usually 1-D: (n_samples,).", level: "Easy" },
    { q: "What is data leakage in preprocessing?", a: "When information from the test set (or from the future / the answer) influences training. Example: scaling or imputing using the mean of the whole dataset before the train/test split, or including a column derived from the target. It makes evaluation look better than reality. Fit preprocessors on training data only (use sklearn Pipelines).", level: "Hard" },
    { q: "What does df.describe() show and how do you use it?", a: "Count, mean, std, min, 25%, 50% (median), 75% and max for numeric columns. Use it to spot missing values (low count), impossible values (negative age, max age 250), skew (mean far from median) and very different scales between columns.", level: "Easy" }
  ],
  practice: [
    {
      task: "Create a NumPy array of 7 daily temperatures [31, 29, 35, 33, 30, 36, 28]. Print the mean, the maximum, the days hotter than 32 and the temperatures converted to Fahrenheit (F = C * 9/5 + 32).",
      hint: "Use np.array, .mean(), .max(), boolean filtering t[t > 32] and vectorised maths t * 9 / 5 + 32.",
      solution: `import numpy as np
t = np.array([31, 29, 35, 33, 30, 36, 28])
print(round(float(t.mean()), 2))   # 31.71
print(int(t.max()))                # 36
print(t[t > 32])                   # [35 33 36]
print((t * 9 / 5 + 32).tolist())   # [87.8, 84.2, 95.0, 91.4, 86.0, 96.8, 82.4]`
    },
    {
      task: "Build a DataFrame of 6 products (name, category, price, stock) with one missing price and one duplicate row. Clean it: drop the duplicate, fill the missing price with the median, then print the average price per category.",
      hint: "drop_duplicates(), fillna(df['price'].median()), groupby('category')['price'].mean().",
      solution: `import pandas as pd
df = pd.DataFrame({
    "name": ["Pen", "Book", "Bag", "Pen", "Lamp", "Mug"],
    "category": ["Stationery", "Stationery", "Travel", "Stationery", "Home", "Home"],
    "price": [10, 250, None, 10, 600, 150],
    "stock": [100, 20, 5, 100, 8, 30],
})
df = df.drop_duplicates()
df["price"] = df["price"].fillna(df["price"].median())
print(df.groupby("category")["price"].mean().round(1).to_dict())`
    },
    {
      task: "One-hot encode a 'payment' column with values UPI, Card, Cash and standard-scale an 'amount' column. Print the resulting column names.",
      hint: "pd.get_dummies(df, columns=['payment'], dtype=int) and (x - mean) / std.",
      solution: `import pandas as pd
df = pd.DataFrame({"payment": ["UPI", "Card", "Cash", "UPI"], "amount": [200, 800, 100, 500]})
df["amount_z"] = ((df["amount"] - df["amount"].mean()) / df["amount"].std()).round(2)
df = pd.get_dummies(df, columns=["payment"], dtype=int)
print(df.columns.tolist())  # ['amount', 'amount_z', 'payment_Card', 'payment_Cash', 'payment_UPI']`
    },
    {
      task: "Download any small CSV from Kaggle (e.g. Titanic). In Colab or the Python IDE, run head(), info(), describe(), isna().sum() and value_counts() on the target column. Write 5 bullet observations about data quality.",
      hint: "For Titanic, look at Age (missing), Cabin (mostly missing), Survived (class balance).",
      solution: "Example observations: 1) Age has about 20% missing - fill with median by passenger class. 2) Cabin is mostly missing - drop it or create a has_cabin flag. 3) Embarked has 2 missing - fill with the most common port. 4) Survived is imbalanced (more 0 than 1) - use precision/recall later. 5) Fare is skewed with outliers - median is safer than mean; consider log scaling."
    },
    {
      task: "Ask an AI assistant (AI Prompt Lab or any chatbot) to explain the difference between loc and iloc with 3 examples, then run the examples yourself in the Python IDE and check that the explanation is correct.",
      hint: "Prompt: 'Explain Pandas loc vs iloc to a beginner with 3 runnable examples on a 4-row DataFrame. Show expected output.' Then verify.",
      solution: "loc selects by label (df.loc[0, 'name'], df.loc[df['marks'] > 80, ['name']]) and includes the end label in slices; iloc selects by integer position (df.iloc[0, 0], df.iloc[1:3]) and excludes the end position. Running the examples confirms whether the AI's expected outputs were correct - correct any mismatch."
    }
  ],
  quiz: [
    {
      question: "What does np.array([2, 4, 6]) * 3 return?",
      options: ["[2, 4, 6, 2, 4, 6, 2, 4, 6]", "[6 12 18]", "An error", "[5 7 9]"],
      answer: 1,
      explanation: "NumPy applies the multiplication to every element (vectorisation). A Python list * 3 would repeat the list instead."
    },
    {
      question: "Which Pandas call shows how many missing values each column has?",
      options: ["df.describe()", "df.head()", "df.shape", "df.isna().sum()"],
      answer: 3,
      explanation: "isna() marks missing cells as True and sum() counts the Trues per column."
    },
    {
      question: "Why should 'city' be one-hot encoded instead of mapped to 1, 2, 3?",
      options: ["Numbers would create a fake order and distance between cities", "One-hot uses less memory", "Models cannot read numbers", "It is required by Pandas"],
      answer: 0,
      explanation: "Cities have no natural order; numbering them would make the model think Delhi (3) is 'more' than Pune (1)."
    },
    {
      question: "Min-max scaling of hours [2, 5, 7] gives:",
      options: ["[0.2, 0.5, 0.7]", "[-1, 0, 1]", "[0.0, 0.6, 1.0]", "[2, 5, 7]"],
      answer: 2,
      explanation: "(x - 2) / (7 - 2): 2 -> 0.0, 5 -> 3/5 = 0.6, 7 -> 1.0."
    },
    {
      question: "Which shape is correct for X when training a scikit-learn model with 100 rows and 1 feature?",
      options: ["(100,)", "(1, 100)", "(100, 1)", "(1,)"],
      answer: 2,
      explanation: "X must be 2-D: (n_samples, n_features) = (100, 1). Use df[['col']] or reshape(-1, 1)."
    }
  ]
};
