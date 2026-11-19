// Day Task (auto-graded practice) for charts
export default {
  "lesson": "charts",
  "minutes": 18,
  "intro": "Revise choosing the right chart, combo charts with a secondary axis, sparklines, dynamic charts and formatting rules.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which chart is best to show **monthly revenue over 24 months**?",
      "options": [
        "Pie chart",
        "Line chart",
        "Doughnut chart",
        "Radar chart"
      ],
      "answer": 1,
      "explain": "A **line chart** shows a trend over time. Pie and doughnut charts show parts of a whole and become unreadable with many slices."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You need to plot **Revenue (₹ lakhs)** and **Margin %** in one chart. What should you build?",
      "options": [
        "Two pie charts",
        "A combo chart: Revenue as columns, Margin % as a line on the secondary axis",
        "A stacked column chart",
        "A scatter chart"
      ],
      "answer": 1,
      "explain": "The values have very different scales, so put Margin % on a **secondary axis** (Insert > Combo). On one axis, 0.18 would be a flat line at zero."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **chart type** (introduced in Excel 2016) shows how a starting value moves to an end value through positive and negative steps, like a profit bridge?",
      "accept": [
        "Waterfall",
        "Waterfall chart"
      ],
      "explain": "A **Waterfall** chart shows increases and decreases between a start and an end total, e.g. Revenue → − Cost → − Tax → Profit."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is a **sparkline**?",
      "options": [
        "A chart with sparkle effects",
        "A tiny chart inside a single cell that shows a trend",
        "A chart template",
        "A trendline"
      ],
      "answer": 1,
      "explain": "Insert > Sparklines (Line, Column, Win/Loss) draws a mini chart in a cell, great for showing the trend of each row in a table."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The chart title should state the best month. Write a formula that returns the **month** with the highest revenue (for a linked title).",
      "example": {
        "title": "label of the maximum value",
        "code": "=XLOOKUP(MAX(C2:C13),C2:C13,A2:A13)"
      },
      "grid": {
        "A1": "Month",
        "B1": "Revenue",
        "C1": "Margin %",
        "A2": "Apr",
        "B2": "420000",
        "C2": "0.18",
        "A3": "May",
        "B3": "385000",
        "C3": "0.21",
        "A4": "Jun",
        "B4": "512000",
        "C4": "0.16",
        "A5": "Jul",
        "B5": "468000",
        "C5": "0.19"
      },
      "starter": "",
      "solution": "=INDEX(A2:A5,MATCH(MAX(B2:B5),B2:B5,0))",
      "explain": "Max revenue 512,000 is in **Jun**. Link the title to a cell like `=\"Best month: \"&D1` so the message updates with the data."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which make a chart grow automatically when new months are added? (choose all that apply)",
      "options": [
        "Base the chart on an Excel Table",
        "Use dynamic named ranges (INDEX/COUNTA or OFFSET) as the series values",
        "Select a much larger range including blank rows",
        "Copy the chart every month"
      ],
      "answers": [
        0,
        1
      ],
      "explain": "A **Table** or **dynamic named ranges** expand the series automatically. Including blank rows leaves empty gaps on the axis."
    }
  ]
};
