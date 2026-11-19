export default {
  lesson: 'day-12-matplotlib-charts',
  minutes: 30,
  intro: 'Pick the right chart, know the Figure/Axes API and prepare the exact data a Matplotlib chart needs (sorted bars, shares for a pie, histogram bins, subplot layouts).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to show **monthly revenue over 12 months**. Which chart is the best choice?',
      options: ['Pie chart', 'Line chart', 'Scatter plot', 'Histogram'],
      answer: 1,
      explain: 'Trends over time → **line chart** (`ax.plot(months, revenue)`). Comparisons between categories → bar/barh, composition → stacked bar or pie (few slices), distribution → histogram/box, relationship between two numbers → scatter.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about the Matplotlib object-oriented API are TRUE? (choose all that apply)',
      options: ['`fig, ax = plt.subplots()` creates a Figure with one Axes', '`fig, axes = plt.subplots(2, 2)` returns a 2×2 array of Axes', 'With the OO API you set a title with `ax.set_title("...")`', '`ax.barh(names, values)` draws horizontal bars', '`plt.savefig()` must be called **after** `plt.show()` to save the chart'],
      answers: [0, 1, 2, 3],
      explain: 'Save **before** `plt.show()`: in scripts `show()` can close/clear the figure, so saving after it often writes a blank image. Use `fig.savefig("chart.png", dpi=150, bbox_inches="tight")`. The Figure is the whole canvas; each Axes is one chart inside it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that sets the **y-axis label** on an Axes object:\n\n`ax.____("Revenue (₹ lakh)")`',
      accept: ['set_ylabel'],
      explain: 'With the OO API the setters start with `set_`: `ax.set_title`, `ax.set_xlabel`, `ax.set_ylabel`, `ax.set_xlim`. The pyplot shortcuts are `plt.title`, `plt.xlabel`, `plt.ylabel`. A chart without axis labels and units is a common review comment.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Prepare data for a **sorted horizontal bar chart** of revenue by product category (biggest bar on top means: for `barh` sort **ascending**, because barh draws the first item at the bottom).\n1. `cat_rev`: total `amount` per `category` (groupby), sorted **ascending**\n2. `labels`: the category names in that order (list)\n3. `values`: the totals in that order (list of ints)\n4. `top_share`: the share of the largest category in % of total revenue, rounded to 1 decimal\n\n(In a notebook you would then call `ax.barh(labels, values)`.)',
      example: { title: 'sorting before plotting', code: 's = df.groupby("city")["sales"].sum().sort_values()\nfig, ax = plt.subplots()\nax.barh(s.index, s.values)' },
      starter: 'import pandas as pd\ndf = pd.DataFrame({\n    "category": ["Mobiles", "Grocery", "Fashion", "Mobiles", "Books", "Fashion", "Grocery", "Mobiles"],\n    "amount": [18000, 2200, 5400, 25000, 900, 3100, 2600, 12000],\n})\n\n# TODO: cat_rev, labels, values, top_share\n',
      solution: 'import pandas as pd\ndf = pd.DataFrame({\n    "category": ["Mobiles", "Grocery", "Fashion", "Mobiles", "Books", "Fashion", "Grocery", "Mobiles"],\n    "amount": [18000, 2200, 5400, 25000, 900, 3100, 2600, 12000],\n})\n\ncat_rev = df.groupby("category")["amount"].sum().sort_values()\nlabels = list(cat_rev.index)\nvalues = [int(v) for v in cat_rev.values]\ntop_share = round(cat_rev.max() / cat_rev.sum() * 100, 1)\n',
      tests: [
        { call: 'list(labels)', expect: ['Books', 'Grocery', 'Fashion', 'Mobiles'] },
        { call: '[int(v) for v in values]', expect: [900, 4800, 8500, 55000] },
        { call: 'round(float(top_share), 1)', expect: 79.5 },
      ],
      explain: 'Charts are only as good as the data you feed them: aggregate first, then sort so the reader sees the ranking instantly. One category with ~80% of revenue is the insight you would annotate on the chart.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Histogram data.** Before drawing `ax.hist(order_values, bins=[0, 500, 1000, 1500, 2000])` you want to know the bar heights.\n1. `counts`: the number of orders in each bin, using `np.histogram(order_values, bins=[0, 500, 1000, 1500, 2000])` (list of ints)\n2. `busiest_bin`: the bin label with the most orders, as a string like `"500-1000"`',
      example: { title: 'np.histogram returns counts and edges', code: 'counts, edges = np.histogram([1, 2, 2, 7], bins=[0, 5, 10])\n# counts -> [3 1], edges -> [ 0  5 10]' },
      starter: 'import numpy as np\norder_values = [120, 450, 520, 610, 700, 880, 930, 1100, 1250, 1720, 640, 300, 990, 1999]\n\n# TODO: counts, busiest_bin\n',
      solution: 'import numpy as np\norder_values = [120, 450, 520, 610, 700, 880, 930, 1100, 1250, 1720, 640, 300, 990, 1999]\n\nbins = [0, 500, 1000, 1500, 2000]\nc, edges = np.histogram(order_values, bins=bins)\ncounts = [int(x) for x in c]\ni = int(np.argmax(c))\nbusiest_bin = f"{bins[i]}-{bins[i + 1]}"\n',
      tests: [
        { call: '[int(x) for x in counts]', expect: [3, 7, 2, 2] },
        { call: 'busiest_bin', expect: '500-1000' },
      ],
      explain: 'A histogram groups numbers into bins and counts them – exactly what `ax.hist` draws. Bins are half-open `[a, b)` except the last one, which includes its right edge (1999 and 2000 would both be in 1500-2000). Most orders are ₹500-1000, the "typical basket".',
    },
    {
      type: 'output',
      mins: 2,
      q: 'A dashboard uses `fig, axes = plt.subplots(2, 3)`. This code mimics the shape of `axes` with NumPy. What does it print?',
      code: `import numpy as np
axes = np.empty((2, 3), dtype=object)
print(axes.shape)
print(axes.size)
print(axes.ravel().shape)`,
      expected: '(2, 3)\n6\n(6,)',
      explain: '`plt.subplots(2, 3)` returns a 2×3 NumPy array of Axes: use `axes[0, 2]` for row 0, column 2, or loop over `axes.ravel()` / `axes.flat` (6 Axes) when filling charts one by one. With a single row, `axes` is 1D (`axes[0]`).',
    },
  ],
};
