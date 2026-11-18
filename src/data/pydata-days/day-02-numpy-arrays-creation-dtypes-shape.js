export default {
  "id": "day-02-numpy-arrays-creation-dtypes-shape",
  "title": "NumPy Arrays: Creation, dtypes, shape and ndim",
  "module": "Module 1: NumPy",
  "day": 2,
  "level": "Beginner",
  "duration": "2.5 hours",
  "summary": "Learn what a NumPy ndarray is, why it is faster than a Python list, and how to create 1D/2D/3D arrays with array, arange, linspace, zeros, ones, full, eye and random. Inspect arrays with shape, ndim, size, dtype and itemsize, and convert types with astype.",
  "objectives": [
    "Explain the ndarray and why it is faster and smaller than a Python list",
    "Create arrays from lists and with arange, linspace, zeros, ones, full, eye and random",
    "Read the attributes shape, ndim, size, dtype, itemsize and nbytes",
    "Choose and convert data types with dtype= and astype()",
    "Avoid common mistakes such as silent upcasting and integer truncation"
  ],
  "theory": [
    {
      "heading": "What is a NumPy Array?",
      "content": "NumPy (Numerical Python) gives Python a powerful object called the **ndarray** (n-dimensional array). It is a grid of values that all have the **same data type**, stored in one continuous block of memory. Because of this, NumPy can run operations in optimised C code instead of slow Python loops.\n\nA Python list can hold mixed types (`[1, 'a', 3.5]`) and each element is a separate Python object. A NumPy array holds raw numbers side by side, so it uses less memory and is 10-100x faster for maths.",
      "syntax": "import numpy as np\n\nsales = np.array([1200, 3400, 2100])\nprint(type(sales))   # <class 'numpy.ndarray'>",
      "points": [
        "Homogeneous: one dtype for all elements",
        "Fixed size: appending creates a new array (unlike list.append)",
        "Vectorised: `sales * 2` multiplies every element; a list would be repeated",
        "Foundation of pandas, Matplotlib, scikit-learn and TensorFlow"
      ]
    },
    {
      "heading": "Creating Arrays from Python Lists",
      "content": "Use `np.array()` with a list for 1D, a list of lists for 2D (a table/matrix) and a list of 2D lists for 3D. Every inner list must have the same length, otherwise NumPy raises an error (or creates an object array in older versions).",
      "syntax": "a1 = np.array([10, 20, 30])                     # 1D, shape (3,)\na2 = np.array([[1, 2, 3], [4, 5, 6]])            # 2D, shape (2, 3)\na3 = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])  # 3D, shape (2, 2, 2)",
      "tip": "Think of a 2D array as an Excel sheet: rows x columns. A 3D array is like several sheets (for example, 12 monthly sheets of stores x products)."
    },
    {
      "heading": "Built-in Creation Functions",
      "content": "Often you need arrays of a given size without typing every value.",
      "points": [
        "`np.arange(start, stop, step)` - like range() but returns an array; stop is excluded; works with floats",
        "`np.linspace(start, stop, num)` - num evenly spaced values, stop is INCLUDED",
        "`np.zeros(shape)`, `np.ones(shape)` - filled with 0.0 / 1.0 (float by default)",
        "`np.full(shape, value)` - filled with any value",
        "`np.eye(n)` / `np.identity(n)` - identity matrix",
        "`np.empty(shape)` - uninitialised memory (fast, but contains garbage values)",
        "`np.zeros_like(a)`, `np.ones_like(a)` - same shape and dtype as another array"
      ],
      "syntax": "np.arange(0, 10, 2)        # [0 2 4 6 8]\nnp.linspace(0, 1, 5)       # [0.   0.25 0.5  0.75 1.  ]\nnp.zeros((2, 3))           # 2 rows, 3 columns of 0.0\nnp.full((2, 2), 7)         # [[7 7] [7 7]]"
    },
    {
      "heading": "Random Arrays",
      "content": "Random data is used for simulations, sampling and creating practice datasets. The modern way is a **Generator** created with `np.random.default_rng(seed)`. A seed makes results reproducible - the same seed always gives the same numbers, which is important when you share an analysis.",
      "syntax": "rng = np.random.default_rng(42)\nrng.integers(1, 100, size=5)        # 5 ints from 1 to 99\nrng.random(3)                       # 3 floats in [0, 1)\nrng.normal(50000, 8000, size=4)     # mean 50000, std 8000",
      "tip": "Older code uses np.random.seed(42) with np.random.randint / np.random.rand. It still works, but default_rng is recommended for new code."
    },
    {
      "heading": "Array Attributes: shape, ndim, size, dtype",
      "content": "Every array describes itself through attributes (no brackets - they are not methods).",
      "points": [
        "`a.shape` - tuple of dimension lengths, e.g. (3, 4) = 3 rows, 4 columns",
        "`a.ndim` - number of dimensions (1, 2, 3 ...)",
        "`a.size` - total number of elements (3 x 4 = 12)",
        "`a.dtype` - data type of the elements (int64, float64, bool, <U10 ...)",
        "`a.itemsize` - bytes per element (int64 = 8 bytes); `a.nbytes` = size x itemsize",
        "`len(a)` - length of the first dimension only"
      ],
      "tip": "A 1D shape is written (5,) with a comma - it is a one-element tuple. (5,) and (5, 1) are different: the second is a 2D column."
    },
    {
      "heading": "Data Types (dtype) and astype()",
      "content": "NumPy picks a dtype automatically: integers become int64 (on Linux/Mac; int32 was the Windows default before NumPy 2), decimals become float64, True/False become bool and text becomes a fixed-width Unicode string like <U6. If you mix types, NumPy **upcasts** to a type that can hold all values: [1, 2.5] becomes float64, and [1, 'a'] becomes strings.\n\nYou can set the type at creation with `dtype=` or convert later with `astype()`, which returns a new array.",
      "syntax": "np.array([1, 2, 3], dtype='float32')\nprices = np.array(['499', '1299'])\nprices.astype(int)          # [ 499 1299]\nnp.array([9.99, 4.5]).astype(int)   # [9 4]  (truncates, does not round)",
      "points": [
        "Smaller dtypes (int8, int16, float32) save memory on big data",
        "int8 can only hold -128 to 127 - values outside overflow",
        "Missing values (np.nan) are floats, so an int array with NaN becomes float64"
      ]
    }
  ],
  "examples": [
    {
      "title": "List vs Array: Behaviour and Type",
      "scenario": "See why analysts use arrays: doubling quarterly sales with a list and with an array.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nsales_list = [120, 340, 210, 450]\nsales_arr = np.array(sales_list)\n\nprint(type(sales_list), type(sales_arr))\nprint(\"List * 2 :\", sales_list * 2)\nprint(\"Array * 2:\", sales_arr * 2)\nprint(\"Array + 10:\", sales_arr + 10)\nprint(\"dtype:\", sales_arr.dtype)\n\nmixed = np.array([1, 2.5, 3])\nprint(mixed, mixed.dtype)\ntext = np.array([1, \"two\", 3])\nprint(text, text.dtype)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nsales_list = [120, 340, 210, 450]\nsales_arr = np.array(sales_list)\n\nprint(type(sales_list), type(sales_arr))\nprint(\"List * 2 :\", sales_list * 2)\nprint(\"Array * 2:\", sales_arr * 2)\nprint(\"Array + 10:\", sales_arr + 10)\nprint(\"dtype:\", sales_arr.dtype)\n\nmixed = np.array([1, 2.5, 3])\nprint(mixed, mixed.dtype)\ntext = np.array([1, \"two\", 3])\nprint(text, text.dtype)\n"
        }
      },
      "result": "<class 'list'> <class 'numpy.ndarray'>\nList * 2 : [120, 340, 210, 450, 120, 340, 210, 450]\nArray * 2: [240 680 420 900]\nArray + 10: [130 350 220 460]\ndtype: int64\n[1.  2.5 3. ] float64\n['1' 'two' '3'] <U21",
      "explanation": "Multiplying a list repeats it, but multiplying an array multiplies each element (vectorisation). NumPy stores all elements with one dtype: mixing int and float upcasts everything to float64, and mixing numbers with text turns everything into Unicode strings ('<U21'), so you can no longer do maths on it."
    },
    {
      "title": "Creating 1D, 2D and 3D Arrays and Inspecting Them",
      "scenario": "Store sales of 3 stores across 4 quarters (2D), then 2 years of that data (3D), and inspect the attributes.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nq_sales = np.array([[150, 180, 210, 260],   # Store A\n                    [120, 130, 160, 190],   # Store B\n                    [200, 220, 240, 300]])  # Store C\nprint(q_sales)\nprint(\"shape:\", q_sales.shape, \"ndim:\", q_sales.ndim, \"size:\", q_sales.size)\nprint(\"dtype:\", q_sales.dtype, \"itemsize:\", q_sales.itemsize, \"nbytes:\", q_sales.nbytes)\nprint(\"len:\", len(q_sales))\n\ntwo_years = np.array([q_sales, q_sales + 20])\nprint(\"3D shape:\", two_years.shape, \"ndim:\", two_years.ndim)\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nq_sales = np.array([[150, 180, 210, 260],   # Store A\n                    [120, 130, 160, 190],   # Store B\n                    [200, 220, 240, 300]])  # Store C\nprint(q_sales)\nprint(\"shape:\", q_sales.shape, \"ndim:\", q_sales.ndim, \"size:\", q_sales.size)\nprint(\"dtype:\", q_sales.dtype, \"itemsize:\", q_sales.itemsize, \"nbytes:\", q_sales.nbytes)\nprint(\"len:\", len(q_sales))\n\ntwo_years = np.array([q_sales, q_sales + 20])\nprint(\"3D shape:\", two_years.shape, \"ndim:\", two_years.ndim)\n"
        }
      },
      "result": "[[150 180 210 260]\n [120 130 160 190]\n [200 220 240 300]]\nshape: (3, 4) ndim: 2 size: 12\ndtype: int64 itemsize: 8 nbytes: 96\nlen: 3\n3D shape: (2, 3, 4) ndim: 3",
      "explanation": "The 2D array has 3 rows (stores) and 4 columns (quarters), so shape is (3, 4) and size is 12. Each int64 takes 8 bytes, so nbytes = 12 x 8 = 96. len() returns only the first dimension (3). Stacking two 2D arrays gives a 3D array of shape (2, 3, 4): 2 years x 3 stores x 4 quarters."
    },
    {
      "title": "arange, linspace, zeros, ones, full and eye",
      "scenario": "Generate common helper arrays: invoice numbers, discount levels, an empty target table and an identity matrix.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\ninvoice_no = np.arange(1001, 1006)\nprint(invoice_no)\nprint(np.arange(0, 1, 0.25))\ndiscounts = np.linspace(0, 0.5, 6)\nprint(discounts)\nprint(np.zeros((2, 3)))\nprint(np.ones(4, dtype=int))\nprint(np.full((2, 2), 500))\nprint(np.eye(3))\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\ninvoice_no = np.arange(1001, 1006)\nprint(invoice_no)\nprint(np.arange(0, 1, 0.25))\ndiscounts = np.linspace(0, 0.5, 6)\nprint(discounts)\nprint(np.zeros((2, 3)))\nprint(np.ones(4, dtype=int))\nprint(np.full((2, 2), 500))\nprint(np.eye(3))\n"
        }
      },
      "result": "[1001 1002 1003 1004 1005]\n[0.   0.25 0.5  0.75]\n[0.  0.1 0.2 0.3 0.4 0.5]\n[[0. 0. 0.]\n [0. 0. 0.]]\n[1 1 1 1]\n[[500 500]\n [500 500]]\n[[1. 0. 0.]\n [0. 1. 0.]\n [0. 0. 1.]]",
      "explanation": "arange excludes the stop value (1006 is not included). linspace includes both ends and divides the range into 6 equal points. zeros/ones default to float64 (printed as 0. and 1.) unless you pass dtype=int. full fills with any value, and eye creates an identity matrix with 1s on the diagonal."
    },
    {
      "title": "dtype Control and astype() Conversion",
      "scenario": "Prices arrive from a CSV export as text. Convert them to numbers, check memory usage and see how float-to-int conversion truncates.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nraw_prices = np.array([\"499\", \"1299\", \"799\", \"2499\"])\nprint(raw_prices.dtype)\nprices = raw_prices.astype(int)\nprint(prices, prices.dtype, prices.sum())\n\nratings = np.array([4.7, 3.2, 4.9, 2.5])\nprint(ratings.astype(int))          # truncates toward zero\nprint(np.round(ratings).astype(int))\n\nbig = np.arange(1_000_000, dtype=np.int64)\nsmall = big.astype(np.int32)\nprint(big.nbytes, small.nbytes)\n\nflags = np.array([1, 0, 1, 1]).astype(bool)\nprint(flags, flags.sum())\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nraw_prices = np.array([\"499\", \"1299\", \"799\", \"2499\"])\nprint(raw_prices.dtype)\nprices = raw_prices.astype(int)\nprint(prices, prices.dtype, prices.sum())\n\nratings = np.array([4.7, 3.2, 4.9, 2.5])\nprint(ratings.astype(int))          # truncates toward zero\nprint(np.round(ratings).astype(int))\n\nbig = np.arange(1_000_000, dtype=np.int64)\nsmall = big.astype(np.int32)\nprint(big.nbytes, small.nbytes)\n\nflags = np.array([1, 0, 1, 1]).astype(bool)\nprint(flags, flags.sum())\n"
        }
      },
      "result": "<U4\n[ 499 1299  799 2499] int64 5096\n[4 3 4 2]\n[5 3 5 2]\n8000000 4000000\n[ True False  True  True] 3",
      "explanation": "Text numbers have dtype <U4 and cannot be summed until converted with astype(int). Converting float to int cuts off the decimal part (4.7 -> 4); round first if you want 5. Changing int64 to int32 halves memory from 8 MB to 4 MB - useful for large datasets. Booleans sum as 1/0, which is a quick way to count True values."
    },
    {
      "title": "Reproducible Random Data for Practice",
      "scenario": "Create a fake dataset of 5 employees' salaries and 5 test scores with a fixed seed so everyone in the class gets the same numbers.",
      "steps": [
        "Open the in-browser IDE (or Jupyter / Colab / VS Code with numpy installed)",
        "Paste the code into main.py and run it",
        "Compare your output with the result below"
      ],
      "code": "import numpy as np\n\nrng = np.random.default_rng(7)\nemp_ids = np.arange(1, 6)\nsalaries = rng.integers(30000, 90000, size=5)\nscores = np.round(rng.uniform(50, 100, size=5), 1)\n\nprint(\"IDs     :\", emp_ids)\nprint(\"Salaries:\", salaries)\nprint(\"Scores  :\", scores)\nprint(\"Shape:\", salaries.shape, \"dtype:\", salaries.dtype)\n\nrng2 = np.random.default_rng(7)\nprint(\"Same seed, same first salary:\", rng2.integers(30000, 90000, size=5)[0] == salaries[0])\n",
      "python": {
        "files": {
          "main.py": "import numpy as np\n\nrng = np.random.default_rng(7)\nemp_ids = np.arange(1, 6)\nsalaries = rng.integers(30000, 90000, size=5)\nscores = np.round(rng.uniform(50, 100, size=5), 1)\n\nprint(\"IDs     :\", emp_ids)\nprint(\"Salaries:\", salaries)\nprint(\"Scores  :\", scores)\nprint(\"Shape:\", salaries.shape, \"dtype:\", salaries.dtype)\n\nrng2 = np.random.default_rng(7)\nprint(\"Same seed, same first salary:\", rng2.integers(30000, 90000, size=5)[0] == salaries[0])\n"
        }
      },
      "result": "IDs     : [1 2 3 4 5]\nSalaries: [86694 67505 71050 83832 64697]\nScores  : [61.3 65.  93.7 50.3 91.1]\nShape: (5,) dtype: int64\nSame seed, same first salary: True",
      "explanation": "default_rng(7) creates a random generator with seed 7. integers(low, high, size) gives whole numbers where high is excluded; uniform gives floats. Creating a new generator with the same seed reproduces exactly the same sequence, which makes your analysis repeatable."
    }
  ],
  "interview": [
    {
      "q": "What is NumPy and why is it used?",
      "a": "NumPy is the core Python library for numerical computing. It provides the ndarray, a fast fixed-type multi-dimensional array, plus vectorised maths, linear algebra, statistics and random number functions. pandas, scikit-learn and most data libraries are built on it.",
      "level": "Easy"
    },
    {
      "q": "Why is a NumPy array faster than a Python list?",
      "a": "1) Elements are stored in one contiguous memory block with a single dtype, so there is no per-element type checking. 2) Operations are vectorised and executed in compiled C loops. 3) It uses less memory (a list stores pointers to separate Python objects). 4) It can use CPU SIMD instructions and optimised BLAS libraries.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between shape, size and ndim?",
      "a": "shape is a tuple with the length of each dimension, e.g. (3, 4). ndim is the number of dimensions (2). size is the total number of elements (12).",
      "level": "Easy"
    },
    {
      "q": "Difference between np.arange and np.linspace?",
      "a": "arange(start, stop, step) uses a step size and excludes stop. linspace(start, stop, num) uses the number of points and includes stop by default. For float steps, linspace is safer because floating-point rounding in arange can produce an unexpected number of elements.",
      "level": "Easy"
    },
    {
      "q": "What happens when you create an array with mixed types like [1, 2.5, '3']?",
      "a": "NumPy upcasts to a common type that can hold all elements. int + float gives float64; any string makes all elements Unicode strings (dtype <U32 etc.), so maths operations will fail. Always clean and convert types before analysis.",
      "level": "Medium"
    },
    {
      "q": "What does astype() do? Does it modify the array in place?",
      "a": "astype(dtype) returns a NEW array converted to the given type; the original array is unchanged unless you reassign it (a = a.astype(float)). Converting float to int truncates decimals.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between np.zeros, np.empty and np.zeros_like?",
      "a": "np.zeros(shape) creates an array filled with 0. np.empty(shape) allocates memory without initialising it, so it contains arbitrary leftover values but is slightly faster. np.zeros_like(a) creates zeros with the same shape and dtype as array a.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between shape (5,) and (5, 1)?",
      "a": "(5,) is a 1D array of 5 elements. (5, 1) is a 2D column with 5 rows and 1 column. They behave differently in broadcasting and matrix operations, e.g. a (5,) array plus a (5, 1) array broadcasts to (5, 5).",
      "level": "Hard"
    },
    {
      "q": "Why do we set a random seed?",
      "a": "A seed initialises the random number generator so that the same sequence is produced every run. This makes simulations, train/test splits and sample datasets reproducible for colleagues and reviewers. Modern code uses rng = np.random.default_rng(seed).",
      "level": "Easy"
    },
    {
      "q": "How would you reduce memory usage of a large numeric array?",
      "a": "Use a smaller dtype that still fits the data range: int64 -> int32/int16/int8, float64 -> float32. Check a.nbytes before and after. Be careful of overflow (int8 holds only -128..127) and precision loss with float32.",
      "level": "Medium"
    },
    {
      "q": "Why does an integer array become float when it contains a missing value?",
      "a": "NumPy's missing-value marker np.nan is a special floating-point value (IEEE 754). Integer dtypes have no NaN representation, so the whole array must be float64. pandas offers nullable integer types (Int64) to work around this.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Create an array of monthly targets for 12 months starting at 50000 and increasing by 2500 each month. Print the array, its shape, dtype and the total yearly target.",
      "hint": "np.arange(50000, 50000 + 12 * 2500, 2500)",
      "solution": "import numpy as np\n\ntargets = np.arange(50000, 50000 + 12 * 2500, 2500)\nprint(targets)\nprint(targets.shape, targets.dtype)\nprint(\"Yearly target:\", targets.sum())\n"
    },
    {
      "task": "Create a 4x5 array filled with the value 100 (an attendance template), then a 3x3 identity matrix and a 1D array of 5 evenly spaced numbers from 10 to 20. Print the ndim and size of each.",
      "hint": "np.full, np.eye, np.linspace",
      "solution": "import numpy as np\n\ntemplate = np.full((4, 5), 100)\nident = np.eye(3)\nspaced = np.linspace(10, 20, 5)\nfor name, arr in [(\"template\", template), (\"identity\", ident), (\"spaced\", spaced)]:\n    print(name, arr.ndim, arr.size)\nprint(spaced)\n"
    },
    {
      "task": "You receive quantities as strings: ['5', '12', '7', '3']. Convert them to integers, multiply by the unit price 250, and print the revenue array and its total.",
      "hint": "np.array(...).astype(int)",
      "solution": "import numpy as np\n\nqty = np.array(['5', '12', '7', '3']).astype(int)\nrevenue = qty * 250\nprint(revenue)\nprint(\"Total:\", revenue.sum())\n"
    },
    {
      "task": "Using a seeded generator (seed 1), simulate marks of 10 students between 35 and 100 (inclusive). Print the marks, the dtype and the memory used. Then convert to int16 and print the new memory.",
      "hint": "rng.integers(35, 101, size=10); nbytes",
      "solution": "import numpy as np\n\nrng = np.random.default_rng(1)\nmarks = rng.integers(35, 101, size=10)\nprint(marks, marks.dtype, marks.nbytes)\nsmall = marks.astype(np.int16)\nprint(small.dtype, small.nbytes)\n"
    },
    {
      "task": "Build a 3D array representing 2 warehouses x 3 products x 4 weeks of stock, all starting at 0 (integers). Print its shape, ndim and size.",
      "hint": "np.zeros((2, 3, 4), dtype=int)",
      "solution": "import numpy as np\n\nstock = np.zeros((2, 3, 4), dtype=int)\nprint(stock.shape, stock.ndim, stock.size)\nprint(stock[0])\n"
    }
  ],
  "quiz": [
    {
      "question": "What does np.array([[1, 2, 3], [4, 5, 6]]).shape return?",
      "options": [
        "(3, 2)",
        "(2, 3)",
        "(6,)",
        "2"
      ],
      "answer": 1,
      "explanation": "There are 2 rows and 3 columns."
    },
    {
      "question": "What is the output of np.arange(2, 10, 3)?",
      "options": [
        "[2 5 8]",
        "[2 5 8 11]",
        "[3 6 9]",
        "[2 4 6 8]"
      ],
      "answer": 0,
      "explanation": "Start at 2, step 3, stop before 10: 2, 5, 8."
    },
    {
      "question": "Which function includes the stop value by default?",
      "options": [
        "np.arange",
        "range",
        "np.linspace",
        "np.zeros"
      ],
      "answer": 2,
      "explanation": "linspace includes the endpoint unless endpoint=False."
    },
    {
      "question": "What is the dtype of np.array([1, 2.5, 3])?",
      "options": [
        "int64",
        "float64",
        "object",
        "<U3"
      ],
      "answer": 1,
      "explanation": "Mixing ints and a float upcasts all elements to float64."
    },
    {
      "question": "What does np.array([3.9, 2.1]).astype(int) return?",
      "options": [
        "[4 2]",
        "[3 2]",
        "[3.9 2.1]",
        "Error"
      ],
      "answer": 1,
      "explanation": "astype(int) truncates toward zero, it does not round."
    },
    {
      "question": "For an array of shape (3, 4, 5), what is ndim and size?",
      "options": [
        "3 and 60",
        "3 and 12",
        "60 and 3",
        "4 and 60"
      ],
      "answer": 0,
      "explanation": "Three dimensions; 3 x 4 x 5 = 60 elements."
    }
  ]
};
