export default {
  "id": "day-03-indexing-slicing-boolean-broadcasting",
  "title": "Indexing, Slicing, Boolean Masks, Broadcasting and Vectorization",
  "module": "Module 1: NumPy",
  "day": 3,
  "level": "Beginner",
  "duration": "3 hours",
  "summary": "Select exactly the data you need from NumPy arrays using indexing, slicing, fancy indexing and boolean masks; understand views vs copies; and write fast loop-free code with vectorization, np.where and broadcasting rules.",
  "objectives": [
    "Access elements, rows and columns of 1D and 2D arrays with indexes and slices",
    "Filter data with boolean masks and combine conditions with &, | and ~",
    "Use fancy (integer array) indexing and np.where",
    "Explain views vs copies and avoid accidental changes to the original data",
    "Apply broadcasting rules and replace Python loops with vectorized operations"
  ],
  "theory": [
    {
      "heading": "Indexing 1D and 2D Arrays",
      "content": "Indexing works like Python lists: positions start at 0 and negative indexes count from the end. For a 2D array you give the row and column separated by a comma: `a[row, col]`. Writing `a[row][col]` also works but is slower because it creates an intermediate array.",
      "syntax": "sales = np.array([120, 340, 210, 450, 380])\nsales[0]      # 120\nsales[-1]     # 380\n\nm = np.array([[10, 20, 30],\n              [40, 50, 60]])\nm[1, 2]       # 60  (row 1, column 2)\nm[0]          # [10 20 30]  (whole first row)"
    },
    {
      "heading": "Slicing: start:stop:step",
      "content": "A slice `start:stop:step` selects a range; stop is excluded. Leave a part empty to use the default (start=0, stop=end, step=1). In 2D, slice rows and columns separately: `m[rows, cols]`. A bare `:` means 'all'.",
      "points": [
        "`a[1:4]` - elements at positions 1, 2, 3",
        "`a[::2]` - every second element; `a[::-1]` - reversed",
        "`m[:, 0]` - first column of every row (returns 1D)",
        "`m[:, 0:1]` - first column but kept as 2D shape (n, 1)",
        "`m[:2, 1:]` - first two rows, columns from 1 to the end"
      ],
      "tip": "Read m[:, 1] as 'all rows, column 1'. This is the NumPy equivalent of selecting a whole column in Excel."
    },
    {
      "heading": "Views vs Copies",
      "content": "A basic slice returns a **view** - a window onto the same memory, not new data. If you change the view, the original array changes too. This saves memory but surprises beginners. Use `.copy()` when you need an independent array. Fancy indexing and boolean masks always return copies.",
      "syntax": "prices = np.array([100, 200, 300, 400])\nfirst_two = prices[:2]          # view\nfirst_two[0] = 999\nprint(prices)                   # [999 200 300 400]  original changed!\n\nsafe = prices[:2].copy()        # independent copy",
      "tip": "Use np.shares_memory(a, b) to check whether two arrays share data."
    },
    {
      "heading": "Boolean Masks and Filtering",
      "content": "A comparison like `sales > 300` returns an array of True/False of the same shape - a **mask**. Putting the mask inside brackets keeps only the True positions: `sales[sales > 300]`. This is the NumPy version of an Excel filter or SQL WHERE.\n\nCombine conditions with `&` (and), `|` (or) and `~` (not). Each condition must be in brackets because these operators have higher precedence than comparisons. The Python words `and`/`or` do NOT work on arrays.",
      "syntax": "mask = (sales > 200) & (sales < 400)\nsales[mask]\nsales[~mask]                 # the rest\nmask.sum()                   # count of True\nmask.mean()                  # fraction of True\nsales[sales < 150] = 150     # conditional update"
    },
    {
      "heading": "Fancy Indexing and np.where",
      "content": "Fancy indexing means passing a list or array of positions: `a[[0, 2, 4]]` picks those elements in that order. With 2D arrays, `m[[0, 2]]` picks rows 0 and 2.\n\n`np.where(condition, x, y)` works like Excel's IF for a whole array: where the condition is True take x, else y. With only a condition, `np.where(cond)` returns the indexes of True elements. For more than two outcomes use `np.select(conditions, choices, default)`.",
      "syntax": "np.where(marks >= 40, 'Pass', 'Fail')\nnp.where(sales > 300)            # (array([1, 3, 4]),)\nnp.select([marks >= 75, marks >= 40], ['A', 'B'], default='C')"
    },
    {
      "heading": "Vectorization",
      "content": "Vectorization means applying an operation to the whole array in one expression instead of writing a for loop. Arithmetic (+ - * / ** // %), comparisons and NumPy functions (np.sqrt, np.log, np.round, np.abs) are all element-wise **universal functions (ufuncs)** running in C. On a million rows, vectorized code is typically 50-100x faster than a Python loop.",
      "syntax": "revenue = price * qty                 # element-wise multiply\nprofit_pct = (revenue - cost) / revenue * 100\nnp.round(profit_pct, 1)"
    },
    {
      "heading": "Broadcasting Rules",
      "content": "Broadcasting lets NumPy combine arrays of different shapes without copying data. Compare shapes from the **right**; two dimensions are compatible if they are equal or one of them is 1. The dimension of size 1 is stretched to match.\n\nExamples: (3, 4) + scalar works; (3, 4) + (4,) adds the row to every row; (3, 4) + (3, 1) adds a different value to each row; (3, 4) + (3,) FAILS because 4 and 3 differ.",
      "points": [
        "Scalar with any array: always works (`prices * 1.18`)",
        "(rows, cols) with (cols,): apply one value per column (e.g. per-product price)",
        "(rows, cols) with (rows, 1): apply one value per row (e.g. per-store bonus)",
        "Use `a[:, np.newaxis]` or `a.reshape(-1, 1)` to turn (n,) into (n, 1)"
      ],
      "tip": "If you get 'operands could not be broadcast together with shapes (3,4) (3,)', reshape the 1D array into a column with .reshape(-1, 1)."
    }
  ],
  "examples": [
    {
      "title": "Indexing and Slicing a Store x Month Sales Table",
      "scenario": "Rows are 3 stores, columns are 4 months. Pick single values, rows, columns and sub-tables.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nsales = np.array([[150, 180, 210, 260],   # Store A\n                  [120, 130, 160, 190],   # Store B\n                  [200, 220, 240, 300]])  # Store C\n\nprint(\"Store B, month 3:\", sales[1, 2])\nprint(\"Store C all months:\", sales[2])\nprint(\"Month 1 all stores:\", sales[:, 0])\nprint(\"Last month:\", sales[:, -1])\nprint(\"Stores A-B, months 2-3:\")\nprint(sales[:2, 1:3])\nprint(\"Every other month:\", sales[0, ::2])\nprint(\"Reversed months for A:\", sales[0, ::-1])\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nsales = np.array([[150, 180, 210, 260],   # Store A\n                  [120, 130, 160, 190],   # Store B\n                  [200, 220, 240, 300]])  # Store C\n\nprint(\"Store B, month 3:\", sales[1, 2])\nprint(\"Store C all months:\", sales[2])\nprint(\"Month 1 all stores:\", sales[:, 0])\nprint(\"Last month:\", sales[:, -1])\nprint(\"Stores A-B, months 2-3:\")\nprint(sales[:2, 1:3])\nprint(\"Every other month:\", sales[0, ::2])\nprint(\"Reversed months for A:\", sales[0, ::-1])\n"
        }
      },
      "result": "Store B, month 3: 160\nStore C all months: [200 220 240 300]\nMonth 1 all stores: [150 120 200]\nLast month: [260 190 300]\nStores A-B, months 2-3:\n[[180 210]\n [130 160]]\nEvery other month: [150 210]\nReversed months for A: [260 210 180 150]",
      "explanation": "sales[1, 2] means row 1 (Store B) and column 2 (third month). sales[:, 0] takes all rows of column 0. sales[:2, 1:3] gives rows 0-1 and columns 1-2 (stop excluded). Step 2 skips every other column and step -1 reverses."
    },
    {
      "title": "Boolean Filtering of Employee Salaries",
      "scenario": "HR wants employees earning between 40k and 70k, the count of high earners, and a 10% raise only for salaries under 40k.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nnames = np.array([\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"])\nsalary = np.array([38000, 72000, 55000, 31000, 64000, 90000])\n\nmid = (salary >= 40000) & (salary <= 70000)\nprint(mid)\nprint(\"Mid-range:\", names[mid], salary[mid])\nprint(\"High earners (>60k):\", (salary > 60000).sum())\nprint(\"Not mid-range:\", names[~mid])\n\nraised = salary.copy()\nraised[raised < 40000] = raised[raised < 40000] * 1.10\nprint(\"After raise:\", raised)\nprint(\"Original unchanged:\", salary)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nnames = np.array([\"Asha\", \"Vikram\", \"Neha\", \"Arjun\", \"Pooja\", \"Ravi\"])\nsalary = np.array([38000, 72000, 55000, 31000, 64000, 90000])\n\nmid = (salary >= 40000) & (salary <= 70000)\nprint(mid)\nprint(\"Mid-range:\", names[mid], salary[mid])\nprint(\"High earners (>60k):\", (salary > 60000).sum())\nprint(\"Not mid-range:\", names[~mid])\n\nraised = salary.copy()\nraised[raised < 40000] = raised[raised < 40000] * 1.10\nprint(\"After raise:\", raised)\nprint(\"Original unchanged:\", salary)\n"
        }
      },
      "result": "[False False  True False  True False]\nMid-range: ['Neha' 'Pooja'] [55000 64000]\nHigh earners (>60k): 3\nNot mid-range: ['Asha' 'Vikram' 'Arjun' 'Ravi']\nAfter raise: [41800 72000 55000 34100 64000 90000]\nOriginal unchanged: [38000 72000 55000 31000 64000 90000]",
      "explanation": "The mask is a True/False array. Using it on both names and salary keeps the arrays aligned. Summing a mask counts True values. ~mid inverts the mask. We work on a copy so the original salary array is unchanged; the assignment raised[mask] = ... updates only the matching positions (the result stays int because the array dtype is int64)."
    },
    {
      "title": "np.where and np.select for Grades",
      "scenario": "Label student marks as Pass/Fail, and then assign grades A/B/C/F with multiple conditions.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nmarks = np.array([92, 38, 75, 61, 45, 88, 30])\n\nprint(np.where(marks >= 40, \"Pass\", \"Fail\"))\nprint(\"Failed positions:\", np.where(marks < 40)[0])\n\ngrades = np.select(\n    [marks >= 85, marks >= 70, marks >= 40],\n    [\"A\", \"B\", \"C\"],\n    default=\"F\",\n)\nprint(grades)\nprint(\"Top 3 marks:\", marks[np.argsort(marks)[::-1][:3]])\nprint(\"Fancy pick:\", marks[[0, 2, 5]])\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nmarks = np.array([92, 38, 75, 61, 45, 88, 30])\n\nprint(np.where(marks >= 40, \"Pass\", \"Fail\"))\nprint(\"Failed positions:\", np.where(marks < 40)[0])\n\ngrades = np.select(\n    [marks >= 85, marks >= 70, marks >= 40],\n    [\"A\", \"B\", \"C\"],\n    default=\"F\",\n)\nprint(grades)\nprint(\"Top 3 marks:\", marks[np.argsort(marks)[::-1][:3]])\nprint(\"Fancy pick:\", marks[[0, 2, 5]])\n"
        }
      },
      "result": "['Pass' 'Fail' 'Pass' 'Pass' 'Pass' 'Pass' 'Fail']\nFailed positions: [1 6]\n['A' 'F' 'B' 'C' 'C' 'A' 'F']\nTop 3 marks: [92 88 75]\nFancy pick: [92 75 88]",
      "explanation": "np.where(cond, x, y) is a vectorized IF. With a single argument it returns the indexes of True elements (wrapped in a tuple, hence [0]). np.select checks conditions in order and picks the first match - like nested IFs or SQL CASE WHEN. argsort returns the positions that would sort the array; reversing and taking 3 gives the top three, which we fetch with fancy indexing."
    },
    {
      "title": "Broadcasting: Prices x Quantities and Per-Store Delivery Charge",
      "scenario": "3 stores sold 4 products. Multiply each column by the product price, add a per-store delivery charge, and compute each store's share of revenue.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nqty = np.array([[10, 5, 2, 8],\n                [ 4, 9, 6, 1],\n                [ 7, 3, 5, 6]])\nprice = np.array([50, 120, 300, 80])        # shape (4,)\ndelivery = np.array([100, 150, 80])         # shape (3,)\n\nrevenue = qty * price                       # (3,4) * (4,)\nprint(revenue)\ntotal = revenue.sum(axis=1, keepdims=True) + delivery.reshape(-1, 1)\nprint(total)\nprint(np.round(revenue / revenue.sum(axis=1, keepdims=True) * 100, 1))\ntry:\n    qty + delivery\nexcept ValueError as e:\n    print(\"Error:\", e)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nqty = np.array([[10, 5, 2, 8],\n                [ 4, 9, 6, 1],\n                [ 7, 3, 5, 6]])\nprice = np.array([50, 120, 300, 80])        # shape (4,)\ndelivery = np.array([100, 150, 80])         # shape (3,)\n\nrevenue = qty * price                       # (3,4) * (4,)\nprint(revenue)\ntotal = revenue.sum(axis=1, keepdims=True) + delivery.reshape(-1, 1)\nprint(total)\nprint(np.round(revenue / revenue.sum(axis=1, keepdims=True) * 100, 1))\ntry:\n    qty + delivery\nexcept ValueError as e:\n    print(\"Error:\", e)\n"
        }
      },
      "result": "[[ 500  600  600  640]\n [ 200 1080 1800   80]\n [ 350  360 1500  480]]\n[[2440]\n [3310]\n [2770]]\n[[21.4 25.6 25.6 27.4]\n [ 6.3 34.2 57.   2.5]\n [13.  13.4 55.8 17.8]]\nError: operands could not be broadcast together with shapes (3,4) (3,)",
      "explanation": "price has shape (4,), matching the last dimension of qty (3, 4), so each column is multiplied by its product price. delivery has shape (3,), which does not match 4 - adding it directly fails. reshape(-1, 1) turns it into a (3, 1) column that broadcasts across each row. keepdims=True keeps the row totals as (3, 1) so the percentage calculation divides each row by its own total."
    },
    {
      "title": "Views vs Copies and Loop vs Vectorized Timing",
      "scenario": "Prove that slices share memory, and measure how much faster vectorized code is on one million values.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\nimport time\n\nprices = np.array([100, 200, 300, 400])\nview = prices[1:3]\nview[0] = 999\nprint(\"After editing view:\", prices)\ncopy = prices[1:3].copy()\ncopy[0] = 1\nprint(\"After editing copy:\", prices)\nprint(np.shares_memory(prices, view), np.shares_memory(prices, copy))\n\ndata = np.arange(1_000_000)\nstart = time.perf_counter()\nloop_result = [x * 2 for x in data]\nloop_time = time.perf_counter() - start\nstart = time.perf_counter()\nvec_result = data * 2\nvec_time = time.perf_counter() - start\nprint(\"Same result:\", np.array_equal(loop_result, vec_result))\nprint(\"Vectorized is faster:\", vec_time < loop_time)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\nimport time\n\nprices = np.array([100, 200, 300, 400])\nview = prices[1:3]\nview[0] = 999\nprint(\"After editing view:\", prices)\ncopy = prices[1:3].copy()\ncopy[0] = 1\nprint(\"After editing copy:\", prices)\nprint(np.shares_memory(prices, view), np.shares_memory(prices, copy))\n\ndata = np.arange(1_000_000)\nstart = time.perf_counter()\nloop_result = [x * 2 for x in data]\nloop_time = time.perf_counter() - start\nstart = time.perf_counter()\nvec_result = data * 2\nvec_time = time.perf_counter() - start\nprint(\"Same result:\", np.array_equal(loop_result, vec_result))\nprint(\"Vectorized is faster:\", vec_time < loop_time)\n"
        }
      },
      "result": "After editing view: [100 999 300 400]\nAfter editing copy: [100 999 300 400]\nTrue False\nSame result: True\nVectorized is faster: True",
      "explanation": "Editing the slice changed the original array because a slice is a view. After .copy(), changes do not affect the original. The timing part shows the loop and the vectorized version give identical results, but the vectorized one is much faster (exact times depend on your machine, so we only print the comparison)."
    }
  ],
  "interview": [
    {
      "q": "How do you select the second column of a 2D NumPy array?",
      "a": "arr[:, 1] - all rows, column index 1. It returns a 1D array. Use arr[:, 1:2] to keep it as a 2D column of shape (n, 1).",
      "level": "Easy"
    },
    {
      "q": "What is the difference between a view and a copy in NumPy?",
      "a": "A view shares the same data buffer as the original array, so modifying it changes the original; basic slicing returns views. A copy has its own data; .copy(), fancy indexing and boolean indexing produce copies. Check with np.shares_memory(a, b) or a.base.",
      "level": "Medium"
    },
    {
      "q": "How do you filter an array with multiple conditions?",
      "a": "Use element-wise operators with brackets: arr[(arr > 10) & (arr < 50)], arr[(arr < 10) | (arr > 90)], arr[~(arr == 0)]. Python's and/or raise 'The truth value of an array with more than one element is ambiguous'.",
      "level": "Easy"
    },
    {
      "q": "What does np.where do?",
      "a": "np.where(cond, x, y) returns an array taking x where cond is True and y elsewhere (vectorized if-else). np.where(cond) with one argument returns a tuple of index arrays where cond is True.",
      "level": "Easy"
    },
    {
      "q": "Explain broadcasting rules.",
      "a": "NumPy compares shapes element-wise from the trailing (rightmost) dimension. Two dimensions are compatible if they are equal or one is 1. Missing leading dimensions are treated as 1. Size-1 dimensions are virtually stretched. Example: (3, 4) and (4,) work; (3, 4) and (3,) fail; (3, 1) and (1, 4) produce (3, 4).",
      "level": "Medium"
    },
    {
      "q": "What is vectorization and why is it faster?",
      "a": "Vectorization means expressing operations on whole arrays instead of element-by-element Python loops. The loop runs inside pre-compiled C code (ufuncs), avoiding Python's per-element interpreter overhead and type checks, and can use SIMD CPU instructions.",
      "level": "Medium"
    },
    {
      "q": "What is fancy indexing?",
      "a": "Indexing with an array or list of integer positions, e.g. a[[0, 3, 5]] or m[[2, 0]] for rows. The result is always a copy and follows the order given, allowing reordering and repetition.",
      "level": "Medium"
    },
    {
      "q": "How would you replace all negative values in an array with 0?",
      "a": "Either a[a < 0] = 0 (in place) or np.where(a < 0, 0, a) (new array) or np.clip(a, 0, None).",
      "level": "Easy"
    },
    {
      "q": "What is the output shape of np.ones((3, 1)) + np.ones((1, 4))?",
      "a": "(3, 4). The (3, 1) array is stretched along columns and the (1, 4) array along rows.",
      "level": "Hard"
    },
    {
      "q": "How do you get the indexes of the top 3 values in an array?",
      "a": "np.argsort(a)[::-1][:3] (sort ascending, reverse, take 3) or more efficiently for large arrays np.argpartition(a, -3)[-3:] (unordered top 3), then sort those if order matters.",
      "level": "Hard"
    },
    {
      "q": "Why does a[a > 5] return a 1D array even when a is 2D?",
      "a": "A boolean mask can select any number of elements from anywhere in the array, so the result cannot keep the 2D structure; NumPy returns the selected values flattened in row-major order.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "daily_orders = np.array([34, 51, 29, 60, 72, 45, 38]). Print the orders for days 2-5 (positions 1 to 4), the last three days, and the days in reverse order.",
      "hint": "Slices [1:5], [-3:] and [::-1].",
      "solution": "import numpy as np\n\ndaily_orders = np.array([34, 51, 29, 60, 72, 45, 38])\nprint(daily_orders[1:5])\nprint(daily_orders[-3:])\nprint(daily_orders[::-1])\n"
    },
    {
      "task": "Product prices: [250, 1200, 75, 640, 3000, 410]. Print prices between 200 and 1000, count how many are above 500, and apply a 20% discount only to prices above 1000 (in a copy).",
      "hint": "Use masks with & and boolean assignment on a float copy.",
      "solution": "import numpy as np\n\nprices = np.array([250, 1200, 75, 640, 3000, 410])\nprint(prices[(prices >= 200) & (prices <= 1000)])\nprint((prices > 500).sum())\ndiscounted = prices.astype(float)\ndiscounted[discounted > 1000] *= 0.8\nprint(discounted)\n"
    },
    {
      "task": "Given a 4x3 matrix of test scores (rows = students, cols = subjects), subtract each subject's mean from its column (centering) using broadcasting.",
      "hint": "scores.mean(axis=0) has shape (3,), which broadcasts across rows.",
      "solution": "import numpy as np\n\nscores = np.array([[70, 80, 90],\n                   [60, 85, 75],\n                   [90, 70, 80],\n                   [80, 65, 95]])\ncentered = scores - scores.mean(axis=0)\nprint(scores.mean(axis=0))\nprint(centered)\n"
    },
    {
      "task": "Label order amounts [450, 1200, 2999, 80, 5600] as 'Small' (<500), 'Medium' (500-2999) or 'Large' (>=3000) using np.select.",
      "hint": "Order the conditions from most specific to least.",
      "solution": "import numpy as np\n\namounts = np.array([450, 1200, 2999, 80, 5600])\nlabels = np.select([amounts >= 3000, amounts >= 500], [\"Large\", \"Medium\"], default=\"Small\")\nprint(labels)\n"
    },
    {
      "task": "Create a 3x4 array of quantities and a per-store discount array [0.05, 0.10, 0.0]. Compute the discounted quantity value with prices [100, 200, 150, 50]: value = qty * price * (1 - discount per store).",
      "hint": "price broadcasts as (4,); discount must be reshaped to (3, 1).",
      "solution": "import numpy as np\n\nqty = np.array([[1, 2, 3, 4], [2, 2, 2, 2], [5, 0, 1, 3]])\nprice = np.array([100, 200, 150, 50])\ndiscount = np.array([0.05, 0.10, 0.0])\nvalue = qty * price * (1 - discount.reshape(-1, 1))\nprint(value)\nprint(value.sum(axis=1))\n"
    }
  ],
  "quiz": [
    {
      "question": "For m = np.array([[1, 2, 3], [4, 5, 6]]), what is m[1, :2]?",
      "options": [
        "[4 5]",
        "[2 5]",
        "[1 2]",
        "[5 6]"
      ],
      "answer": 0,
      "explanation": "Row 1 is [4 5 6]; columns 0-1 give [4 5]."
    },
    {
      "question": "Which expression correctly filters values greater than 10 AND less than 20?",
      "options": [
        "a[a > 10 and a < 20]",
        "a[(a > 10) & (a < 20)]",
        "a[a > 10 & a < 20]",
        "a[(a > 10) and (a < 20)]"
      ],
      "answer": 1,
      "explanation": "Use & with each condition in brackets; 'and' does not work element-wise."
    },
    {
      "question": "What does a basic slice like a[1:3] return?",
      "options": [
        "Always a copy",
        "A view sharing memory",
        "A Python list",
        "A tuple"
      ],
      "answer": 1,
      "explanation": "Basic slicing returns a view; changes affect the original array."
    },
    {
      "question": "Can arrays of shapes (4, 3) and (3,) be added?",
      "options": [
        "Yes, result (4, 3)",
        "No, error",
        "Yes, result (3, 4)",
        "Yes, result (3,)"
      ],
      "answer": 0,
      "explanation": "Trailing dimensions 3 and 3 match, so the (3,) row is broadcast to every row."
    },
    {
      "question": "What does np.where([True, False, True], 1, 0) return?",
      "options": [
        "[0 1 0]",
        "[1 0 1]",
        "(array([0, 2]),)",
        "[True False True]"
      ],
      "answer": 1,
      "explanation": "It takes 1 where True and 0 where False."
    },
    {
      "question": "Which method creates an independent array from a slice?",
      "options": [
        ".view()",
        ".copy()",
        ".base",
        ".flatten(False)"
      ],
      "answer": 1,
      "explanation": ".copy() allocates new memory so changes do not affect the original."
    }
  ]
};
