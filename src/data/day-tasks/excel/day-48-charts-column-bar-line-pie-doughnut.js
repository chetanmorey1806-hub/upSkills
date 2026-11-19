// Day Task (auto-graded practice) for day-48-charts-column-bar-line-pie-doughnut
export default {
  "lesson": "day-48-charts-column-bar-line-pie-doughnut",
  "minutes": 20,
  "intro": "Choose the right chart (column, bar, line, pie, doughnut), insert it quickly and calculate the values it displays.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which chart is best to show **monthly sales trend over 12 months**?",
      "options": [
        "Pie",
        "Line",
        "Doughnut",
        "Bar"
      ],
      "answer": 1,
      "explain": "**Line** charts show trends over time. Column charts compare categories; pie/doughnut show share of a whole (few categories only)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **function key** creates a chart on a **new chart sheet** from the selected data?",
      "accept": [
        "F11"
      ],
      "explain": "**F11** puts a default chart on a new chart sheet; **Alt + F1** inserts it on the current sheet."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Your chart puts months in the legend and products on the axis, but you want the opposite. Which button do you use?",
      "options": [
        "Change Chart Type",
        "Switch Row/Column",
        "Move Chart",
        "Quick Layout"
      ],
      "answer": 1,
      "explain": "**Chart Design > Data > Switch Row/Column** swaps what is shown on the horizontal axis and in the legend (series)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Why is a **pie chart** a bad choice for 12 product categories with similar values?",
      "options": [
        "Pie charts cannot show 12 values",
        "Many similar slices are hard to compare; use a bar chart",
        "Pie charts need dates",
        "Pie charts only work with percentages"
      ],
      "answer": 1,
      "explain": "Pies work for **2-6** categories that make up a whole. With many similar slices the eye cannot compare angles: a sorted **bar** chart is clearer."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A pie chart's data label shows each category's **percentage of total**. Calculate it for **Electronics** as a decimal.",
      "example": {
        "title": "share of a whole",
        "code": "=B3/SUM($B$2:$B$9)"
      },
      "grid": {
        "A1": "Category",
        "B1": "Sales",
        "A2": "Grocery",
        "B2": "125000",
        "A3": "Clothing",
        "B3": "82000",
        "A4": "Electronics",
        "B4": "143000",
        "A5": "Footwear",
        "B5": "50000"
      },
      "starter": "",
      "solution": "=B4/SUM(B2:B5)",
      "explain": "143000 / 400000 = **0.3575** (35.75%). In the real sheet, write `=B2/SUM($B$2:$B$5)` and copy down to build the % column."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A column chart's title should say which category is highest. Return the **name** of the category with the maximum sales.",
      "example": {
        "title": "name of the max",
        "code": "=INDEX(A2:A9, MATCH(MAX(C2:C9), C2:C9, 0))"
      },
      "grid": {
        "A1": "Category",
        "B1": "Sales",
        "A2": "Grocery",
        "B2": "125000",
        "A3": "Clothing",
        "B3": "82000",
        "A4": "Electronics",
        "B4": "143000",
        "A5": "Footwear",
        "B5": "50000"
      },
      "starter": "",
      "solution": "=INDEX(A2:A5,MATCH(MAX(B2:B5),B2:B5,0))",
      "explain": "MAX finds 143000; MATCH finds its position; INDEX returns **Electronics**. `=XLOOKUP(MAX(B2:B5),B2:B5,A2:A5)` also works. Dynamic titles link to such a cell."
    }
  ]
};
