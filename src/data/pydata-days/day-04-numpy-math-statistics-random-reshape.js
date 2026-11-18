export default {
  "id": "day-04-numpy-math-statistics-random-reshape",
  "title": "NumPy Math, Statistics, Random, Reshape, Stack and Split",
  "module": "Module 1: NumPy",
  "day": 4,
  "level": "Beginner",
  "duration": "3 hours",
  "summary": "Use NumPy's universal functions and aggregation methods (sum, mean, median, std, percentile, cumsum) along axes, generate random samples for simulations, and reshape, flatten, transpose, stack and split arrays to get data into the shape your analysis needs.",
  "objectives": [
    "Apply ufuncs (np.sqrt, np.log, np.round, np.abs, np.clip) and aggregations",
    "Compute statistics along axis=0 and axis=1 and understand what the axis means",
    "Calculate median, std, var, percentiles, argmax, cumsum and correlation",
    "Generate random integers, uniform/normal samples, choices and shuffles with default_rng",
    "Reshape, flatten, transpose, stack (vstack/hstack/concatenate) and split arrays"
  ],
  "theory": [
    {
      "heading": "Universal Functions (ufuncs)",
      "content": "A ufunc is a function that operates element by element on arrays at C speed. You already used arithmetic operators, which call ufuncs behind the scenes (`a + b` is `np.add(a, b)`). NumPy offers many more for business maths.",
      "points": [
        "`np.round(a, 2)`, `np.floor`, `np.ceil` - rounding",
        "`np.sqrt`, `np.power(a, 2)`, `np.exp`, `np.log`, `np.log10` - maths (log for growth rates and skewed data)",
        "`np.abs(a)` - absolute value (e.g. forecast error)",
        "`np.clip(a, low, high)` - cap values (e.g. limit discount to 0-50%)",
        "`np.maximum(a, b)` / `np.minimum(a, b)` - element-wise max/min of two arrays",
        "`np.diff(a)` - difference between consecutive elements (day-over-day change)"
      ]
    },
    {
      "heading": "Aggregations and the axis Parameter",
      "content": "Aggregation functions reduce many values to one: `sum, mean, min, max, prod, std, var, argmin, argmax`. Call them as methods (`a.sum()`) or functions (`np.sum(a)`).\n\nOn a 2D array, `axis` decides the direction. **axis=0** collapses the rows and gives one result per **column** (down the table). **axis=1** collapses the columns and gives one result per **row** (across the table). With no axis you get a single number for the whole array.",
      "syntax": "sales = np.array([[10, 20, 30],\n                  [40, 50, 60]])\nsales.sum()          # 210\nsales.sum(axis=0)    # [50 70 90]   per column\nsales.sum(axis=1)    # [ 60 150]    per row",
      "tip": "Memory trick: the axis you pass is the axis that disappears. Shape (2, 3) with axis=0 becomes (3,); with axis=1 becomes (2,)."
    },
    {
      "heading": "Descriptive Statistics",
      "content": "These are the numbers every analyst reports when summarising a column.",
      "points": [
        "`np.mean` - average; sensitive to outliers",
        "`np.median` - middle value; robust to outliers (use for salaries, house prices)",
        "`np.std`, `np.var` - spread. NumPy uses population std (ddof=0) by default; pandas uses sample std (ddof=1). Pass `ddof=1` for the sample version",
        "`np.percentile(a, [25, 50, 75])` / `np.quantile(a, 0.9)` - quartiles and percentiles",
        "`np.cumsum` - running total (cumulative revenue); `np.cumprod` - compound growth",
        "`np.corrcoef(x, y)` - Pearson correlation matrix between two variables",
        "`np.unique(a, return_counts=True)` - distinct values and their frequencies",
        "`np.nanmean`, `np.nansum` etc. ignore NaN values"
      ],
      "tip": "If mean is much larger than median, the data is right-skewed (a few very large values), which is common for income and order values."
    },
    {
      "heading": "Random Sampling and Simulation",
      "content": "`rng = np.random.default_rng(seed)` creates a generator. Use it to simulate data, take random samples, shuffle rows or run what-if scenarios.",
      "syntax": "rng = np.random.default_rng(42)\nrng.integers(1, 7, size=10)              # dice rolls\nrng.normal(loc=500, scale=50, size=1000)  # normal distribution\nrng.uniform(0, 1, size=5)\nrng.choice(['UPI', 'Card', 'COD'], size=8, p=[0.6, 0.3, 0.1])\nrng.permutation(10)                      # shuffled copy of 0..9\nrng.choice(100, size=10, replace=False)  # sample without replacement"
    },
    {
      "heading": "Reshaping: reshape, flatten, ravel, transpose",
      "content": "`reshape(rows, cols)` changes the shape without changing the data; the total size must stay the same. Use `-1` to let NumPy calculate one dimension. `flatten()` returns a 1D copy; `ravel()` returns a 1D view when possible. `.T` transposes (swaps rows and columns).",
      "syntax": "a = np.arange(12)\na.reshape(3, 4)       # 3 rows, 4 cols\na.reshape(-1, 6)      # NumPy computes 2 rows\na.reshape(3, 4).T     # shape (4, 3)\nm.flatten()           # back to 1D\nnp.expand_dims(a, 0)  # add a new axis -> (1, 12)",
      "tip": "Common use: 12 monthly values reshaped to (4, 3) gives quarters x months, so sum(axis=1) gives quarterly totals."
    },
    {
      "heading": "Combining and Splitting Arrays",
      "content": "To join arrays use `np.concatenate([a, b], axis=...)`, or the shortcuts `np.vstack` (stack rows on top of each other) and `np.hstack` (place side by side). `np.column_stack` turns several 1D arrays into columns. `np.stack` creates a NEW axis (e.g. stacking 2D monthly tables into 3D).\n\nTo split use `np.split(a, n)` (equal parts), `np.split(a, [i, j])` (at positions), `np.array_split` (unequal parts allowed), `np.hsplit` and `np.vsplit`.",
      "syntax": "np.vstack([jan, feb])          # add rows\nnp.hstack([a, b])              # add columns / extend 1D\nnp.column_stack([ids, marks])  # 1D arrays as columns\nnp.split(np.arange(12), 3)     # 3 arrays of 4\nnp.array_split(np.arange(10), 3)  # sizes 4, 3, 3"
    }
  ],
  "examples": [
    {
      "title": "Axis-wise Aggregation on Quarterly Sales",
      "scenario": "Rows are 3 regions, columns are 4 quarters (in lakh rupees). Find totals per region, per quarter, the best quarter for each region and the overall best region.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nregions = np.array([\"North\", \"South\", \"West\"])\nsales = np.array([[42, 55, 61, 70],\n                  [38, 41, 47, 52],\n                  [50, 48, 66, 81]])\n\nprint(\"Grand total:\", sales.sum())\nprint(\"Per region (axis=1):\", sales.sum(axis=1))\nprint(\"Per quarter (axis=0):\", sales.sum(axis=0))\nprint(\"Avg per quarter:\", sales.mean(axis=0))\nprint(\"Best quarter index per region:\", sales.argmax(axis=1) + 1)\nprint(\"Best region:\", regions[sales.sum(axis=1).argmax()])\nprint(\"QoQ change North:\", np.diff(sales[0]))\nprint(\"Running total West:\", np.cumsum(sales[2]))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nregions = np.array([\"North\", \"South\", \"West\"])\nsales = np.array([[42, 55, 61, 70],\n                  [38, 41, 47, 52],\n                  [50, 48, 66, 81]])\n\nprint(\"Grand total:\", sales.sum())\nprint(\"Per region (axis=1):\", sales.sum(axis=1))\nprint(\"Per quarter (axis=0):\", sales.sum(axis=0))\nprint(\"Avg per quarter:\", sales.mean(axis=0))\nprint(\"Best quarter index per region:\", sales.argmax(axis=1) + 1)\nprint(\"Best region:\", regions[sales.sum(axis=1).argmax()])\nprint(\"QoQ change North:\", np.diff(sales[0]))\nprint(\"Running total West:\", np.cumsum(sales[2]))\n"
        }
      },
      "result": "Grand total: 651\nPer region (axis=1): [228 178 245]\nPer quarter (axis=0): [130 144 174 203]\nAvg per quarter: [43.33333333 48.         58.         67.66666667]\nBest quarter index per region: [4 4 4]\nBest region: West\nQoQ change North: [13  6  9]\nRunning total West: [ 50  98 164 245]",
      "explanation": "axis=1 adds across each row giving one total per region; axis=0 adds down each column giving one total per quarter. argmax returns the position of the maximum (0-based, so we add 1 for the quarter number). np.diff gives quarter-over-quarter change and np.cumsum gives a running total."
    },
    {
      "title": "Descriptive Statistics of Employee Salaries",
      "scenario": "HR wants a statistical summary of 10 salaries (in thousands), including quartiles and the effect of one very high CEO salary.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nsalary = np.array([32, 35, 38, 41, 45, 48, 52, 58, 65, 400])\n\nprint(\"Mean:\", salary.mean())\nprint(\"Median:\", np.median(salary))\nprint(\"Std (population):\", round(salary.std(), 2))\nprint(\"Std (sample):\", round(salary.std(ddof=1), 2))\nprint(\"Q1, Q2, Q3:\", np.percentile(salary, [25, 50, 75]))\nq1, q3 = np.percentile(salary, [25, 75])\niqr = q3 - q1\nupper = q3 + 1.5 * iqr\nprint(\"IQR:\", iqr, \"Upper fence:\", upper)\nprint(\"Outliers:\", salary[salary > upper])\nprint(\"Mean without outliers:\", salary[salary <= upper].mean())\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nsalary = np.array([32, 35, 38, 41, 45, 48, 52, 58, 65, 400])\n\nprint(\"Mean:\", salary.mean())\nprint(\"Median:\", np.median(salary))\nprint(\"Std (population):\", round(salary.std(), 2))\nprint(\"Std (sample):\", round(salary.std(ddof=1), 2))\nprint(\"Q1, Q2, Q3:\", np.percentile(salary, [25, 50, 75]))\nq1, q3 = np.percentile(salary, [25, 75])\niqr = q3 - q1\nupper = q3 + 1.5 * iqr\nprint(\"IQR:\", iqr, \"Upper fence:\", upper)\nprint(\"Outliers:\", salary[salary > upper])\nprint(\"Mean without outliers:\", salary[salary <= upper].mean())\n"
        }
      },
      "result": "Mean: 81.4\nMedian: 46.5\nStd (population): 106.65\nStd (sample): 112.42\nQ1, Q2, Q3: [38.75 46.5  56.5 ]\nIQR: 17.75 Upper fence: 83.125\nOutliers: [400]\nMean without outliers: 46.0",
      "explanation": "One salary of 400k pulls the mean to 81.4k while the median stays at 46.5k - this is why medians are reported for salaries. The IQR rule marks values above Q3 + 1.5 x IQR as outliers. ddof=1 gives the sample standard deviation (the same as pandas' default)."
    },
    {
      "title": "Simulating Daily Orders and Payment Modes",
      "scenario": "Simulate 30 days of orders for a new online store (normally distributed around 200 per day) and random payment modes, then summarise.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nrng = np.random.default_rng(2024)\norders = rng.normal(loc=200, scale=25, size=30).round().astype(int)\norders = np.clip(orders, 0, None)\nprint(\"First 7 days:\", orders[:7])\nprint(\"Total:\", orders.sum(), \"Mean:\", orders.mean().round(1))\nprint(\"Days above 220:\", (orders > 220).sum())\n\nmodes = rng.choice([\"UPI\", \"Card\", \"COD\"], size=1000, p=[0.6, 0.3, 0.1])\nvalues, counts = np.unique(modes, return_counts=True)\nfor v, c in zip(values, counts):\n    print(v, c)\n\nsample_days = rng.choice(np.arange(1, 31), size=5, replace=False)\nprint(\"Audit days:\", np.sort(sample_days))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nrng = np.random.default_rng(2024)\norders = rng.normal(loc=200, scale=25, size=30).round().astype(int)\norders = np.clip(orders, 0, None)\nprint(\"First 7 days:\", orders[:7])\nprint(\"Total:\", orders.sum(), \"Mean:\", orders.mean().round(1))\nprint(\"Days above 220:\", (orders > 220).sum())\n\nmodes = rng.choice([\"UPI\", \"Card\", \"COD\"], size=1000, p=[0.6, 0.3, 0.1])\nvalues, counts = np.unique(modes, return_counts=True)\nfor v, c in zip(values, counts):\n    print(v, c)\n\nsample_days = rng.choice(np.arange(1, 31), size=5, replace=False)\nprint(\"Audit days:\", np.sort(sample_days))\n"
        }
      },
      "result": "First 7 days: [226 241 229 176 165 202 222]\nTotal: 6024 Mean: 200.8\nDays above 220: 7\nCOD 111\nCard 312\nUPI 577\nAudit days: [ 2  8 19 22 27]",
      "explanation": "normal(200, 25) generates realistic daily counts; we round, convert to int and clip negatives to 0. choice with p= gives weighted random categories, and np.unique with return_counts counts each one - close to 60/30/10 because the sample is large. replace=False picks distinct audit days. The seed makes these numbers identical every run."
    },
    {
      "title": "Reshape Monthly Data into Quarters",
      "scenario": "You have 12 monthly revenue numbers. Reshape them into a quarter x month table, get quarterly totals, transpose, and flatten back.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nmonthly = np.array([12, 15, 14, 18, 20, 19, 22, 25, 24, 28, 30, 35])\nby_quarter = monthly.reshape(4, 3)\nprint(by_quarter)\nprint(\"Quarter totals:\", by_quarter.sum(axis=1))\nprint(\"Shape after -1:\", monthly.reshape(-1, 6).shape)\nprint(\"Transposed shape:\", by_quarter.T.shape)\nprint(by_quarter.T)\nprint(\"Flatten:\", by_quarter.flatten())\ngrowth = np.round((monthly[1:] / monthly[:-1] - 1) * 100, 1)\nprint(\"MoM growth %:\", growth)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nmonthly = np.array([12, 15, 14, 18, 20, 19, 22, 25, 24, 28, 30, 35])\nby_quarter = monthly.reshape(4, 3)\nprint(by_quarter)\nprint(\"Quarter totals:\", by_quarter.sum(axis=1))\nprint(\"Shape after -1:\", monthly.reshape(-1, 6).shape)\nprint(\"Transposed shape:\", by_quarter.T.shape)\nprint(by_quarter.T)\nprint(\"Flatten:\", by_quarter.flatten())\ngrowth = np.round((monthly[1:] / monthly[:-1] - 1) * 100, 1)\nprint(\"MoM growth %:\", growth)\n"
        }
      },
      "result": "[[12 15 14]\n [18 20 19]\n [22 25 24]\n [28 30 35]]\nQuarter totals: [41 57 71 93]\nShape after -1: (2, 6)\nTransposed shape: (3, 4)\n[[12 18 22 28]\n [15 20 25 30]\n [14 19 24 35]]\nFlatten: [12 15 14 18 20 19 22 25 24 28 30 35]\nMoM growth %: [25.  -6.7 28.6 11.1 -5.  15.8 13.6 -4.  16.7  7.1 16.7]",
      "explanation": "reshape(4, 3) fills rows first (row-major order), so row 0 is Jan-Mar = Q1. Summing across each row (axis=1) gives quarter totals. reshape(-1, 6) lets NumPy calculate 2 rows. .T swaps rows and columns, and flatten returns a 1D copy. The growth formula divides each month by the previous month using two shifted slices - fully vectorized."
    },
    {
      "title": "Stacking and Splitting Branch Data",
      "scenario": "Combine January and February sales of two branches, add a new product column, then split the year's data into halves.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\njan = np.array([[10, 20, 30],\n                [15, 25, 35]])\nfeb = np.array([[12, 22, 32],\n                [18, 28, 38]])\n\nboth = np.vstack([jan, feb])\nprint(\"vstack:\", both.shape)\nside = np.hstack([jan, feb])\nprint(\"hstack:\", side.shape)\ncube = np.stack([jan, feb])\nprint(\"stack (new axis):\", cube.shape)\nprint(\"Feb total via cube:\", cube[1].sum())\n\nids = np.array([101, 102, 103])\nmarks = np.array([78, 85, 91])\nprint(np.column_stack([ids, marks]))\n\nh1, h2 = np.split(np.arange(1, 13), 2)\nprint(h1, h2)\nprint([part.tolist() for part in np.array_split(np.arange(10), 3)])\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\njan = np.array([[10, 20, 30],\n                [15, 25, 35]])\nfeb = np.array([[12, 22, 32],\n                [18, 28, 38]])\n\nboth = np.vstack([jan, feb])\nprint(\"vstack:\", both.shape)\nside = np.hstack([jan, feb])\nprint(\"hstack:\", side.shape)\ncube = np.stack([jan, feb])\nprint(\"stack (new axis):\", cube.shape)\nprint(\"Feb total via cube:\", cube[1].sum())\n\nids = np.array([101, 102, 103])\nmarks = np.array([78, 85, 91])\nprint(np.column_stack([ids, marks]))\n\nh1, h2 = np.split(np.arange(1, 13), 2)\nprint(h1, h2)\nprint([part.tolist() for part in np.array_split(np.arange(10), 3)])\n"
        }
      },
      "result": "vstack: (4, 3)\nhstack: (2, 6)\nstack (new axis): (2, 2, 3)\nFeb total via cube: 150\n[[101  78]\n [102  85]\n [103  91]]\n[1 2 3 4 5 6] [ 7  8  9 10 11 12]\n[[0, 1, 2, 3], [4, 5, 6], [7, 8, 9]]",
      "explanation": "vstack adds rows (4 x 3), hstack adds columns (2 x 6) and stack creates a new first axis (2 months x 2 branches x 3 products). column_stack turns 1D arrays into columns of a table. split needs equal parts; array_split allows unequal sizes (4, 3, 3)."
    }
  ],
  "interview": [
    {
      "q": "What does axis=0 and axis=1 mean in NumPy aggregations?",
      "a": "axis=0 operates down the rows and returns one result per column; axis=1 operates across columns and returns one result per row. The axis you pass is the one that is collapsed.",
      "level": "Easy"
    },
    {
      "q": "Why does np.std give a different result from pandas .std()?",
      "a": "NumPy's default is the population standard deviation (ddof=0, divide by n). pandas' default is the sample standard deviation (ddof=1, divide by n-1). Pass ddof=1 to NumPy or ddof=0 to pandas to match.",
      "level": "Medium"
    },
    {
      "q": "When should you use median instead of mean?",
      "a": "When the data is skewed or has outliers, such as salaries, house prices or order values. The median is the middle value and is not pulled by extreme values, while the mean is.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between reshape, flatten and ravel?",
      "a": "reshape changes the shape (returns a view when possible). flatten always returns a new 1D copy. ravel returns a flattened view if the memory is contiguous, otherwise a copy - so it is faster but changes may affect the original.",
      "level": "Medium"
    },
    {
      "q": "What does -1 mean in reshape?",
      "a": "It tells NumPy to infer that dimension from the array size and the other dimensions. E.g. an array of 12 elements reshaped with (-1, 4) becomes (3, 4). Only one dimension can be -1.",
      "level": "Easy"
    },
    {
      "q": "Difference between np.vstack, np.hstack, np.concatenate and np.stack?",
      "a": "concatenate joins along an existing axis (axis=0 default). vstack = concatenate along rows (adds rows), hstack = along columns for 2D (or extends 1D). stack joins along a NEW axis, so stacking two (2, 3) arrays gives (2, 2, 3).",
      "level": "Medium"
    },
    {
      "q": "How do you compute percentiles and the IQR in NumPy?",
      "a": "q1, q3 = np.percentile(a, [25, 75]); iqr = q3 - q1. Outliers are often defined as values below q1 - 1.5*iqr or above q3 + 1.5*iqr.",
      "level": "Medium"
    },
    {
      "q": "How do you handle NaN values in NumPy aggregations?",
      "a": "Regular functions return nan if any NaN is present. Use the nan-aware versions: np.nansum, np.nanmean, np.nanmedian, np.nanstd, np.nanmax. Or filter with a[~np.isnan(a)].",
      "level": "Medium"
    },
    {
      "q": "How would you randomly sample 10% of 1,000 customer IDs without repetition?",
      "a": "rng = np.random.default_rng(42); sample = rng.choice(customer_ids, size=100, replace=False). In pandas: df.sample(frac=0.1, random_state=42).",
      "level": "Medium"
    },
    {
      "q": "What does np.corrcoef return?",
      "a": "The Pearson correlation coefficient matrix. For two 1D arrays it returns a 2x2 matrix; the off-diagonal element [0, 1] is the correlation between them, ranging from -1 to +1.",
      "level": "Hard"
    },
    {
      "q": "Calculate month-over-month growth for an array of revenues without a loop.",
      "a": "growth = (rev[1:] / rev[:-1] - 1) * 100, or np.diff(rev) / rev[:-1] * 100. Both use shifted slices so each month is divided by the previous one.",
      "level": "Hard"
    },
    {
      "q": "What is the difference between np.split and np.array_split?",
      "a": "np.split requires the array to divide into equal parts (otherwise ValueError) when given an integer. np.array_split allows unequal parts, making the first parts one element larger.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Weekly website visitors for 4 weeks x 7 days are given as 28 numbers from np.arange(100, 128). Reshape to (4, 7), then print weekly totals, the average for each weekday and the busiest week number.",
      "hint": "sum(axis=1), mean(axis=0), argmax() + 1",
      "solution": "import numpy as np\n\nvisits = np.arange(100, 128).reshape(4, 7)\nprint(visits.sum(axis=1))\nprint(visits.mean(axis=0))\nprint(\"Busiest week:\", visits.sum(axis=1).argmax() + 1)\n"
    },
    {
      "task": "For order values [250, 480, 320, 150, 9800, 410, 375, 290], print mean, median, sample std (2 decimals), the 90th percentile and any outliers by the IQR rule.",
      "hint": "np.percentile(a, [25, 75]), std(ddof=1)",
      "solution": "import numpy as np\n\norders = np.array([250, 480, 320, 150, 9800, 410, 375, 290])\nprint(orders.mean(), np.median(orders), round(orders.std(ddof=1), 2))\nprint(np.percentile(orders, 90))\nq1, q3 = np.percentile(orders, [25, 75])\niqr = q3 - q1\nprint(orders[(orders < q1 - 1.5 * iqr) | (orders > q3 + 1.5 * iqr)])\n"
    },
    {
      "task": "Simulate 1,000 customers' ratings (1-5) with probabilities [0.05, 0.1, 0.2, 0.35, 0.3] using seed 10. Print the count of each rating and the average rating.",
      "hint": "rng.choice([1,2,3,4,5], size=1000, p=[...]) and np.unique(..., return_counts=True)",
      "solution": "import numpy as np\n\nrng = np.random.default_rng(10)\nratings = rng.choice([1, 2, 3, 4, 5], size=1000, p=[0.05, 0.1, 0.2, 0.35, 0.3])\nvals, counts = np.unique(ratings, return_counts=True)\nprint(dict(zip(vals.tolist(), counts.tolist())))\nprint(ratings.mean())\n"
    },
    {
      "task": "Two arrays hold advertising spend and sales for 6 months: ad = [10, 15, 12, 20, 25, 30], sales = [120, 150, 130, 190, 230, 270]. Print the correlation coefficient (3 decimals) and the cumulative sales.",
      "hint": "np.corrcoef(ad, sales)[0, 1]",
      "solution": "import numpy as np\n\nad = np.array([10, 15, 12, 20, 25, 30])\nsales = np.array([120, 150, 130, 190, 230, 270])\nprint(round(np.corrcoef(ad, sales)[0, 1], 3))\nprint(np.cumsum(sales))\n"
    },
    {
      "task": "Create class A marks [70, 80, 90] and class B marks [65, 85, 95]. Stack them into a (2, 3) array, add a new subject column [88, 72] with column_stack/hstack, then split the result into two 1D rows.",
      "hint": "np.vstack, then np.hstack([m, new.reshape(-1, 1)]), then np.vsplit or indexing",
      "solution": "import numpy as np\n\na = np.array([70, 80, 90])\nb = np.array([65, 85, 95])\nm = np.vstack([a, b])\nm = np.hstack([m, np.array([88, 72]).reshape(-1, 1)])\nprint(m)\nrow_a, row_b = np.vsplit(m, 2)\nprint(row_a.ravel(), row_b.ravel())\n"
    }
  ],
  "quiz": [
    {
      "question": "For m with shape (5, 3), what is the shape of m.mean(axis=0)?",
      "options": [
        "(5,)",
        "(3,)",
        "(5, 3)",
        "()"
      ],
      "answer": 1,
      "explanation": "axis=0 collapses the 5 rows, leaving one value per column."
    },
    {
      "question": "Which statistic is most robust to outliers?",
      "options": [
        "Mean",
        "Standard deviation",
        "Median",
        "Range"
      ],
      "answer": 2,
      "explanation": "The median depends only on the middle value, not on extreme values."
    },
    {
      "question": "np.arange(12).reshape(-1, 4) has shape:",
      "options": [
        "(4, 3)",
        "(3, 4)",
        "(12, 4)",
        "Error"
      ],
      "answer": 1,
      "explanation": "12 elements / 4 columns = 3 rows."
    },
    {
      "question": "What does np.cumsum([5, 10, 15]) return?",
      "options": [
        "[5 10 15]",
        "[5 15 30]",
        "30",
        "[30 25 15]"
      ],
      "answer": 1,
      "explanation": "cumsum returns running totals."
    },
    {
      "question": "Stacking two (2, 3) arrays with np.stack gives shape:",
      "options": [
        "(4, 3)",
        "(2, 6)",
        "(2, 2, 3)",
        "(2, 3, 2)"
      ],
      "answer": 2,
      "explanation": "np.stack adds a new first axis by default."
    },
    {
      "question": "Which call samples 5 distinct values from an array a?",
      "options": [
        "rng.choice(a, 5)",
        "rng.choice(a, 5, replace=False)",
        "rng.integers(a, 5)",
        "rng.permutation(5)"
      ],
      "answer": 1,
      "explanation": "replace=False prevents the same element being picked twice."
    }
  ]
};
