export default {
  lesson: 'day-02-numpy-arrays-creation-dtypes-shape',
  minutes: 25,
  intro: 'Create NumPy arrays from lists and with arange, linspace, zeros, ones, full and eye, inspect shape/ndim/size/dtype and convert types with astype.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Why is a NumPy `ndarray` preferred over a Python list for numeric data? (choose all that apply)',
      options: ['All elements share one dtype and are stored in one contiguous block of memory', 'Maths on whole arrays runs in fast compiled C code (vectorisation)', 'An array can hold a string, a dict and an int together efficiently', 'It uses less memory for large numeric data', '`arr * 2` doubles every element instead of repeating the list'],
      answers: [0, 1, 3, 4],
      explain: 'An ndarray is **homogeneous** (one dtype) and contiguous, so NumPy can loop in C: it is faster and smaller. Mixing types is what lists are good at; in NumPy mixed values are upcast (e.g. everything becomes a string). Note `[1, 2] * 2` gives `[1, 2, 1, 2]` but `np.array([1, 2]) * 2` gives `[2, 4]`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the `dtype` of `np.array([1, 2.5, 3])`?',
      options: ['int64', 'float64', 'object', 'it raises an error'],
      answer: 1,
      explain: 'NumPy **upcasts** to the type that can hold every value: one float makes the whole array `float64` → `[1. , 2.5, 3. ]`. If one element were a string, everything would become a string (`<U32`), a common silent bug when reading messy data.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (type the exact output, one value per line)',
      code: `import numpy as np
a = np.zeros((3, 4))
print(a.shape)
print(a.ndim)
print(a.size)
print(np.arange(2, 11, 3))
print(np.linspace(0, 1, 5))`,
      expected: '(3, 4)\n2\n12\n[2 5 8]\n[0.   0.25 0.5  0.75 1.  ]',
      explain: '`shape` is (rows, cols), `ndim` is the number of axes (2) and `size` the total count (3 × 4 = 12). `arange(start, stop, step)` **excludes** stop (2, 5, 8). `linspace(start, stop, num)` gives `num` evenly spaced values **including** stop.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Prices were read as text: `p = np.array(["120", "99", "45"])`. Complete the line that converts them to floating-point numbers:\n\n`p = p.____`',
      accept: ['astype(float)', 'astype(np.float64)', "astype('float')", 'astype("float")', "astype('float64')", 'astype("float64")', 'astype(np.float_)'],
      explain: '`astype()` returns a **new** array with the requested dtype, so you must assign it back (`p = p.astype(float)`). Converting floats to int with `astype(int)` truncates (2.9 → 2), it does not round.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Daily sales (₹) for one week at two stores:\n- Store A: 1200, 1500, 980, 1750, 2100, 2600, 1900\n- Store B: 800, 950, 1100, 1020, 1400, 2200, 1600\n\nCreate:\n1. `sales`: a **2D** NumPy array with 2 rows (one per store) and 7 columns, as **float**\n2. `n_rows`, `n_cols`: the number of rows and columns taken from `sales.shape`\n3. `total`: the sum of all values (as a Python number, use `sales.sum()`)',
      example: { title: 'a 2D array and its shape', code: 'import numpy as np\nmarks = np.array([[70, 85, 90], [60, 75, 80]], dtype=float)\nrows, cols = marks.shape   # 2, 3\nprint(marks.ndim, marks.dtype)   # 2 float64' },
      starter: 'import numpy as np\n\n# TODO: sales = np.array(...)\n',
      solution: 'import numpy as np\n\nsales = np.array([[1200, 1500, 980, 1750, 2100, 2600, 1900],\n                  [800, 950, 1100, 1020, 1400, 2200, 1600]], dtype=float)\nn_rows, n_cols = sales.shape\ntotal = sales.sum()\n',
      tests: [
        { call: 'list(sales.shape)', expect: [2, 7], msg: 'sales must have shape (2, 7)' },
        { call: 'str(sales.dtype)', expect: 'float64', msg: 'sales must be a float array' },
        { call: '[int(n_rows), int(n_cols)]', expect: [2, 7] },
        { call: 'int(total)', expect: 21100 },
        { call: '[int(x) for x in sales[1]]', expect: [800, 950, 1100, 1020, 1400, 2200, 1600], msg: 'Row 2 must be Store B' },
      ],
      explain: 'A list of lists becomes a 2D array; `dtype=float` (or `.astype(float)`) makes it float64. `shape` is a tuple `(rows, cols)` that you can unpack directly. Mistake to avoid: passing two separate lists (`np.array([..], [..])`) – the second argument is interpreted as the dtype and raises an error.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Build these arrays with NumPy **creation functions** (not by typing every value):\n1. `roll_nos`: 101, 102, …, 110 (use `np.arange`)\n2. `steps`: 5 evenly spaced values from 0 to 100 including both ends (use `np.linspace`)\n3. `bonus`: a 3×3 array where every value is 500.0 (use `np.full`)\n4. `ident`: a 4×4 identity matrix (use `np.eye`)',
      example: { title: 'creation functions', code: 'np.arange(0, 10, 2)      # [0 2 4 6 8]  (stop excluded)\nnp.linspace(1, 2, 3)     # [1.  1.5 2. ] (stop included)\nnp.zeros((2, 3))         # 2x3 of 0.0\nnp.full((2, 2), 7)       # 2x2 of 7' },
      starter: 'import numpy as np\n\nroll_nos = None   # TODO\nsteps = None      # TODO\nbonus = None      # TODO\nident = None      # TODO\n',
      solution: 'import numpy as np\n\nroll_nos = np.arange(101, 111)\nsteps = np.linspace(0, 100, 5)\nbonus = np.full((3, 3), 500.0)\nident = np.eye(4)\n',
      tests: [
        { call: '[int(x) for x in roll_nos]', expect: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110] },
        { call: '[float(x) for x in steps] == [0.0, 25.0, 50.0, 75.0, 100.0]', expect: true, msg: 'steps must be [0, 25, 50, 75, 100]' },
        { call: '[list(bonus.shape), int(bonus.sum()), int(bonus.min())]', expect: [[3, 3], 4500, 500] },
        { call: '[list(ident.shape), int(ident.trace()), int(ident.sum())]', expect: [[4, 4], 4, 4], msg: 'ident must be a 4x4 identity (1s on the diagonal only)' },
      ],
      explain: '`np.arange(101, 111)` stops **before** 111 – the classic off-by-one is writing `arange(101, 110)`. `linspace(0, 100, 5)` counts *values* (5), not the step. `np.full(shape, value)` fills any constant and `np.eye(n)` gives 1s on the diagonal.',
    },
  ],
};
