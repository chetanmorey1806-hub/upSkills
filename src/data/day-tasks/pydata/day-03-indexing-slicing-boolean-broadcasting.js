export default {
  lesson: 'day-03-indexing-slicing-boolean-broadcasting',
  minutes: 30,
  intro: 'Pick exactly the data you need with indexes, slices, boolean masks and fancy indexing, then replace loops with np.where and broadcasting.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: '`sales` holds 3 stores (rows) × 4 months (columns). What does this print?',
      code: `import numpy as np
sales = np.array([[10, 20, 30, 40],
                  [50, 60, 70, 80],
                  [90, 100, 110, 120]])
print(sales[1, 2])
print(sales[:, 0])
print(sales[0, 1:3])
print(sales[-1, ::2])`,
      expected: '70\n[10 50 90]\n[20 30]\n[ 90 110]',
      explain: '`sales[row, col]` – row 1 is the 2nd store, col 2 the 3rd month → 70. `[:, 0]` is the whole first column. Slices stop **before** the end index, so `1:3` gives columns 1 and 2. `-1` is the last row and `::2` takes every 2nd column.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`a = np.array([5, 6, 7, 8])`, `b = a[1:3]`, then `b[0] = 99`. What is `a` now?',
      options: ['[5 6 7 8]', '[5 99 7 8]', '[99 6 7 8]', 'an error: slices are read-only'],
      answer: 1,
      explain: 'A basic slice is a **view**: it shares memory with the original, so changing `b[0]` changes `a[1]`. Use `a[1:3].copy()` when you need an independent copy. Boolean masks and fancy indexing (`a[[1, 2]]`) always return copies.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the mask that keeps salaries **between 30000 and 60000 (inclusive)**. Remember NumPy needs `&` and brackets.\n\n`mid = sal[____]`',
      accept: ['(sal >= 30000) & (sal <= 60000)', '(sal <= 60000) & (sal >= 30000)', '(30000 <= sal) & (sal <= 60000)', '(sal >= 30000) & (60000 >= sal)'],
      explain: 'Combine conditions with `&` (and), `|` (or), `~` (not), and wrap each comparison in brackets because `&` binds tighter than `>=`. Using Python `and` raises *"The truth value of an array … is ambiguous"*.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Employee salaries (₹) are given in the starter. Create:\n1. `high`: the salaries **above 50000** (boolean mask)\n2. `count_high`: how many salaries are above 50000 (as an int)\n3. `raised`: a copy of `salaries` where every salary **below 30000 gets +5000** and the others stay the same (use `np.where`)',
      example: { title: 'masks and np.where', code: 'marks = np.array([35, 80, 52, 91])\npassed = marks[marks >= 40]                 # [80 52 91]\nn = int((marks >= 40).sum())                # 3 (True counts as 1)\nlabel = np.where(marks >= 40, "Pass", "Fail")' },
      starter: 'import numpy as np\nsalaries = np.array([25000, 48000, 72000, 31000, 55000, 18000, 90000, 42000])\n\n# TODO: high, count_high, raised\n',
      solution: 'import numpy as np\nsalaries = np.array([25000, 48000, 72000, 31000, 55000, 18000, 90000, 42000])\n\nhigh = salaries[salaries > 50000]\ncount_high = int((salaries > 50000).sum())\nraised = np.where(salaries < 30000, salaries + 5000, salaries)\n',
      tests: [
        { call: '[int(x) for x in high]', expect: [72000, 55000, 90000] },
        { call: 'int(count_high)', expect: 3 },
        { call: '[int(x) for x in raised]', expect: [30000, 48000, 72000, 31000, 55000, 23000, 90000, 42000] },
        { call: '[int(x) for x in salaries]', expect: [25000, 48000, 72000, 31000, 55000, 18000, 90000, 42000], msg: 'Do not change the original salaries array' },
      ],
      explain: '`salaries > 50000` is a boolean array; indexing with it keeps the True positions, and `.sum()` counts the Trues. `np.where(cond, a, b)` picks from `a` where the condition is True and from `b` elsewhere, element by element – no loop needed, and the original array is not modified.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Broadcasting.** `qty` is a 3×4 array (3 stores × 4 products) and `price` holds the price of each of the 4 products.\n1. `revenue`: revenue per store per product (`qty × price`, shape 3×4) – no loops\n2. `store_total`: total revenue of each store (length 3)\n3. `with_delivery`: `revenue` plus a per-store delivery charge `[50, 80, 30]` added to every product of that store (hint: make the charge a **column** with shape (3, 1))',
      example: { title: 'row vs column broadcasting', code: 'm = np.array([[1, 2], [3, 4]])\nm * np.array([10, 100])        # each COLUMN scaled: [[10 200] [30 400]]\nm + np.array([[5], [7]])       # each ROW shifted:   [[6 7] [10 11]]' },
      starter: 'import numpy as np\nqty = np.array([[2, 5, 1, 0],\n                [4, 0, 3, 2],\n                [1, 1, 1, 6]])\nprice = np.array([120, 40, 250, 15])\ncharge = np.array([50, 80, 30])\n\n# TODO: revenue, store_total, with_delivery\n',
      solution: 'import numpy as np\nqty = np.array([[2, 5, 1, 0],\n                [4, 0, 3, 2],\n                [1, 1, 1, 6]])\nprice = np.array([120, 40, 250, 15])\ncharge = np.array([50, 80, 30])\n\nrevenue = qty * price\nstore_total = revenue.sum(axis=1)\nwith_delivery = revenue + charge.reshape(3, 1)\n',
      tests: [
        { call: 'revenue.tolist()', expect: [[240, 200, 250, 0], [480, 0, 750, 30], [120, 40, 250, 90]] },
        { call: '[int(x) for x in store_total]', expect: [690, 1260, 500] },
        { call: 'with_delivery.tolist()', expect: [[290, 250, 300, 50], [560, 80, 830, 110], [150, 70, 280, 120]] },
      ],
      explain: 'Shapes (3, 4) and (4,) are compatible: the price row is "stretched" over every store. To add one value **per row** the array must be a column (3, 1) – `charge.reshape(3, 1)` or `charge[:, None]`. Adding `charge` directly fails because (3,) does not line up with the 4 columns.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: '**Fancy indexing.** From `marks` (5 students × 3 subjects) create:\n1. `picked`: the rows of students 0, 2 and 4 (in that order)\n2. `toppers`: the row indexes of students whose **total** marks are 240 or more (use `np.where(...)[0]` or `np.flatnonzero`)',
      example: { title: 'fancy indexing', code: 'a = np.array([10, 20, 30, 40])\na[[3, 0]]                    # [40 10]\nnp.where(a > 15)[0]          # [1 2 3]  -> indexes, not values' },
      starter: 'import numpy as np\nmarks = np.array([[78, 85, 90],\n                  [55, 60, 48],\n                  [92, 88, 95],\n                  [70, 65, 80],\n                  [81, 79, 84]])\n\n# TODO: picked, toppers\n',
      solution: 'import numpy as np\nmarks = np.array([[78, 85, 90],\n                  [55, 60, 48],\n                  [92, 88, 95],\n                  [70, 65, 80],\n                  [81, 79, 84]])\n\npicked = marks[[0, 2, 4]]\ntoppers = np.where(marks.sum(axis=1) >= 240)[0]\n',
      tests: [
        { call: 'picked.tolist()', expect: [[78, 85, 90], [92, 88, 95], [81, 79, 84]] },
        { call: '[int(x) for x in toppers]', expect: [0, 2, 4] },
      ],
      explain: 'Passing a **list** of indexes selects those rows in that order (and returns a copy). `marks.sum(axis=1)` gives each student\'s total; `np.where(condition)` with one argument returns a tuple of index arrays, so take `[0]`. A common mistake is returning the totals instead of the indexes.',
    },
  ],
};
