export default {
  lesson: 'day-04-numpy-math-statistics-random-reshape',
  minutes: 30,
  intro: 'Aggregate along the right axis, compute descriptive statistics, simulate with a seeded random generator, and reshape, stack and split arrays.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`q` has shape (4, 3): 4 regions (rows) × 3 months (columns). Which call returns the **total of each month** (3 numbers)?',
      options: ['q.sum()', 'q.sum(axis=0)', 'q.sum(axis=1)', 'q.sum(axis=2)'],
      answer: 1,
      explain: '`axis=0` collapses the rows (goes **down** the columns) → one value per column = per month. `axis=1` collapses the columns → one value per region. No axis sums everything into one number. Tip: the axis you pass is the axis that **disappears** from the shape.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import numpy as np
x = np.array([4, 9, 16, 25])
print(np.sqrt(x))
print(np.clip(x, 5, 20))
print(np.cumsum([1, 2, 3, 4]))
print(np.arange(6).reshape(2, 3))`,
      expected: '[2. 3. 4. 5.]\n[ 5  9 16 20]\n[ 1  3  6 10]\n[[0 1 2]\n[3 4 5]]',
      explain: '`np.sqrt` works element-wise and returns floats. `np.clip(x, lo, hi)` caps values below 5 to 5 and above 20 to 20. `cumsum` is a running total. `reshape(2, 3)` fills row by row; the total size (6) must stay the same.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about NumPy statistics are TRUE? (choose all that apply)',
      options: ['`np.median` is less affected by one huge outlier than `np.mean`', '`np.percentile(a, 50)` equals the median', '`a.argmax()` returns the largest value', '`np.random.default_rng(42)` gives the same random numbers every run', '`a.std()` and `a.var()` measure spread; std = sqrt(var)'],
      answers: [0, 1, 3, 4],
      explain: '`argmax()` returns the **position** of the largest value, not the value itself (use `max()` for that). The median is robust to outliers (one CEO salary barely moves it), the 50th percentile is the median, and seeding the generator makes simulations reproducible.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Quarterly sales: rows = 4 regions (North, South, East, West), columns = Q1..Q4 (₹ lakh). Create:\n1. `region_total`: total per region (4 values)\n2. `quarter_avg`: average per quarter, rounded to 2 decimals (4 values)\n3. `best_region`: the **name** of the region with the highest total (use `argmax` on `region_total` with the `regions` list)\n4. `p90`: the 90th percentile of all values, rounded to 2 decimals (as a float)',
      example: { title: 'axis and argmax', code: 'm = np.array([[3, 7], [8, 1]])\nm.sum(axis=1)          # [10  9] -> per row\nm.mean(axis=0)         # [5.5 4. ] -> per column\nnames = ["A", "B"]\nnames[m.sum(axis=1).argmax()]   # "A"' },
      starter: 'import numpy as np\nregions = ["North", "South", "East", "West"]\nsales = np.array([[12.5, 14.0, 13.2, 18.4],\n                  [20.1, 19.5, 22.3, 25.0],\n                  [8.7, 9.9, 11.4, 10.2],\n                  [15.0, 16.8, 15.9, 21.7]])\n\n# TODO: region_total, quarter_avg, best_region, p90\n',
      solution: 'import numpy as np\nregions = ["North", "South", "East", "West"]\nsales = np.array([[12.5, 14.0, 13.2, 18.4],\n                  [20.1, 19.5, 22.3, 25.0],\n                  [8.7, 9.9, 11.4, 10.2],\n                  [15.0, 16.8, 15.9, 21.7]])\n\nregion_total = sales.sum(axis=1)\nquarter_avg = np.round(sales.mean(axis=0), 2)\nbest_region = regions[region_total.argmax()]\np90 = round(float(np.percentile(sales, 90)), 2)\n',
      tests: [
        { call: '[round(float(x), 2) for x in region_total]', expect: [58.1, 86.9, 40.2, 69.4] },
        { call: '[round(float(x), 2) for x in quarter_avg]', expect: [14.08, 15.05, 15.7, 18.82] },
        { call: 'best_region', expect: 'South' },
        { call: 'round(float(p90), 2) == 22.0', expect: true, msg: 'p90 must be the 90th percentile of all 16 values (22.0)' },
      ],
      explain: 'Per region = across the columns → `axis=1`; per quarter = down the rows → `axis=0`. `argmax()` gives the index of the largest total, which you map to a name with the `regions` list. `np.percentile` on a 2D array without an axis uses all values.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Simulation with a seed.** Using `rng = np.random.default_rng(7)`:\n1. `orders`: 30 random daily order counts with `rng.integers(20, 60, size=30)` (20 to 59)\n2. `busy_days`: how many days had **50 or more** orders (int)\n3. `weekly`: reshape the **first 28** days into 4 rows × 7 columns and take the **sum of each week** (4 values)',
      example: { title: 'seeded random numbers', code: 'rng = np.random.default_rng(1)\ndice = rng.integers(1, 7, size=5)   # same 5 numbers on every run\nrng.normal(50, 10, size=3)          # mean 50, std 10' },
      starter: 'import numpy as np\nrng = np.random.default_rng(7)\n\n# TODO: orders, busy_days, weekly\n',
      solution: 'import numpy as np\nrng = np.random.default_rng(7)\n\norders = rng.integers(20, 60, size=30)\nbusy_days = int((orders >= 50).sum())\nweekly = orders[:28].reshape(4, 7).sum(axis=1)\n',
      tests: [
        { call: '[len(orders), int(orders.min()) >= 20, int(orders.max()) <= 59]', expect: [30, true, true] },
        { call: 'int(orders.sum())', expect: 1225, msg: 'orders must come from rng.integers(20, 60, size=30) with seed 7' },
        { call: 'int(busy_days)', expect: 10 },
        { call: '[int(x) for x in weekly]', expect: [351, 244, 281, 270] },
      ],
      explain: 'With the same seed the generator always produces the same sequence, so results are reproducible (important when you share an analysis). `integers(low, high)` **excludes** high. `reshape(4, 7)` needs exactly 28 values, which is why you slice `[:28]` first; then `sum(axis=1)` totals each row (week).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: '**Stack and split.** Two branches report 3 months of sales.\n1. `both`: stack `pune` and `nagpur` **vertically** into a 2×3 array (`np.vstack`)\n2. `wide`: join them **side by side** into one 1D array of 6 values (`np.concatenate` or `np.hstack`)\n3. `first, second, third`: split `wide` into 3 equal parts with `np.split`',
      example: { title: 'stacking', code: 'a, b = np.array([1, 2]), np.array([3, 4])\nnp.vstack([a, b])        # [[1 2] [3 4]]\nnp.hstack([a, b])        # [1 2 3 4]\nnp.split(np.arange(6), 2)  # [array([0,1,2]), array([3,4,5])]' },
      starter: 'import numpy as np\npune = np.array([410, 380, 455])\nnagpur = np.array([300, 325, 290])\n\n# TODO: both, wide, first, second, third\n',
      solution: 'import numpy as np\npune = np.array([410, 380, 455])\nnagpur = np.array([300, 325, 290])\n\nboth = np.vstack([pune, nagpur])\nwide = np.concatenate([pune, nagpur])\nfirst, second, third = np.split(wide, 3)\n',
      tests: [
        { call: 'both.tolist()', expect: [[410, 380, 455], [300, 325, 290]] },
        { call: 'wide.tolist()', expect: [410, 380, 455, 300, 325, 290] },
        { call: '[first.tolist(), second.tolist(), third.tolist()]', expect: [[410, 380], [455, 300], [325, 290]] },
      ],
      explain: '`vstack` puts arrays on top of each other (new rows), `hstack`/`concatenate` joins them end to end. All take a **list/tuple** of arrays – `np.vstack(pune, nagpur)` is a common error. `np.split(a, n)` needs the length to divide evenly by n (use `np.array_split` otherwise).',
    },
  ],
};
