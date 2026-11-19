export default {
  lesson: 'day-01-introduction-to-data-analysis',
  minutes: 25,
  intro: 'Check the analyst basics (types of analytics, workflow, Jupyter/Colab) and write your first small analysis on business data in plain Python.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A store manager asks: **"Why did sales in Pune drop in March?"** Which type of analytics answers this question?',
      options: ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'],
      answer: 1,
      explain: '**Diagnostic** analytics explains *why* something happened (e.g. two stores were closed for renovation). Descriptive = *what* happened (total March sales), predictive = *what will* happen, prescriptive = *what should we do*. A common mistake is choosing descriptive because the question mentions sales numbers.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are steps of the standard data analyst workflow? (choose all that apply)',
      options: ['Ask the business question', 'Clean the data', 'Compile the notebook into an .exe', 'Visualise the findings', 'Share a report with recommendations', 'Delete the raw data after cleaning'],
      answers: [0, 1, 3, 4],
      explain: 'The cycle is **Ask → Collect → Clean → Explore/Analyse → Visualise → Share**. Notebooks are never compiled, and you should always keep the raw data so the cleaning can be re-run and checked.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which keyboard shortcut runs the current Jupyter / Colab cell and moves to the next cell?',
      options: ['Ctrl + S', 'Shift + Enter', 'Esc + D', 'Alt + R'],
      answer: 1,
      explain: '**Shift + Enter** runs the cell and selects the next one (Ctrl + Enter runs and stays). Esc then D, D deletes a cell. Remember: before sharing a notebook use **Restart & Run All**, because cells run out of order cause hidden-state bugs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the Colab cell that installs the seaborn package (one line):\n\n`____ install seaborn`',
      accept: ['!pip', '! pip', '%pip'],
      explain: 'In a notebook the `!` prefix runs a **shell command**, so `!pip install seaborn` installs the package (the magic `%pip install seaborn` also works and installs into the running kernel). Writing just `pip install seaborn` in a code cell is a Python syntax error.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this first analysis print? (type the exact output)',
      code: `revenue = [42000, 38500, 45100, 51200]
months = ["Jan", "Feb", "Mar", "Apr"]
print("Total:", sum(revenue))
print("Best:", months[revenue.index(max(revenue))])
print("Growth:", round((revenue[-1] - revenue[0]) / revenue[0] * 100, 1))`,
      expected: 'Total: 176800\nBest: Apr\nGrowth: 21.9',
      explain: '`sum()` adds all values, `max()` finds 51200 and `.index()` gives its position (3) which picks "Apr" from the parallel list. Growth % = (last - first) / first × 100 = 9200 / 42000 × 100 = 21.904…, rounded to 1 decimal = 21.9.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Write a function `summary(revenue)` that takes a list of monthly revenue numbers and returns a **dict** with:\n- `"total"`: the sum\n- `"average"`: the mean rounded to 2 decimals\n- `"growth_pct"`: growth from the first to the last month in %, rounded to 2 decimals',
      example: { title: 'returning several results in a dict', code: 'def stats(marks):\n    return {"count": len(marks), "highest": max(marks)}\n\nprint(stats([72, 88, 65]))   # {\'count\': 3, \'highest\': 88}' },
      starter: 'def summary(revenue):\n    # TODO: return {"total": ..., "average": ..., "growth_pct": ...}\n    pass\n',
      solution: 'def summary(revenue):\n    total = sum(revenue)\n    avg = round(total / len(revenue), 2)\n    growth = round((revenue[-1] - revenue[0]) / revenue[0] * 100, 2)\n    return {"total": total, "average": avg, "growth_pct": growth}\n',
      tests: [
        { call: 'summary([42000, 38500, 45100, 51200, 47800, 55301])', expect: { total: 279901, average: 46650.17, growth_pct: 31.67 } },
        { call: 'summary([200, 55])', expect: { total: 255, average: 127.5, growth_pct: -72.5 } },
      ],
      explain: 'Average = total / count. Growth % always divides by the **first** (old) value: (new - old) / old × 100. A common mistake is dividing by the new value, or rounding before dividing, which gives slightly wrong numbers.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Each order is a dict with `city` and `amount`. Write `revenue_by_city(orders)` that returns a dict `{city: total_amount}`, and `top_city(orders)` that returns the name of the city with the highest total revenue.',
      example: { title: 'counting with dict.get()', code: 'counts = {}\nfor dept in ["IT", "HR", "IT"]:\n    counts[dept] = counts.get(dept, 0) + 1\nprint(counts)   # {\'IT\': 2, \'HR\': 1}' },
      starter: 'def revenue_by_city(orders):\n    totals = {}\n    # TODO: add each order amount to its city\n    return totals\n\ndef top_city(orders):\n    # TODO\n    pass\n',
      solution: 'def revenue_by_city(orders):\n    totals = {}\n    for o in orders:\n        totals[o["city"]] = totals.get(o["city"], 0) + o["amount"]\n    return totals\n\ndef top_city(orders):\n    totals = revenue_by_city(orders)\n    return max(totals, key=totals.get)\n',
      tests: [
        { call: 'revenue_by_city([{"city": "Pune", "amount": 1200}, {"city": "Delhi", "amount": 800}, {"city": "Pune", "amount": 300}])', expect: { Pune: 1500, Delhi: 800 } },
        { call: 'top_city([{"city": "Pune", "amount": 1200}, {"city": "Delhi", "amount": 800}, {"city": "Delhi", "amount": 900}])', expect: 'Delhi' },
        { call: 'revenue_by_city([])', expect: {} },
      ],
      explain: 'This is a "group by city and sum" done by hand: `totals.get(city, 0)` returns 0 the first time a city is seen. `max(totals, key=totals.get)` returns the **key** with the largest value. The usual mistake is picking the city of the single largest order instead of the largest total.',
    },
  ],
};
