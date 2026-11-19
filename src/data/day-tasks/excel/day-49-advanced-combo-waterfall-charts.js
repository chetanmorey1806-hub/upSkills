// Day Task (auto-graded practice) for day-49-advanced-combo-waterfall-charts
export default {
  "lesson": "day-49-advanced-combo-waterfall-charts",
  "minutes": 20,
  "intro": "Build Combo charts with a secondary axis, Waterfall charts and know when to use Pareto, Histogram, Treemap and Sparklines.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want **Actual sales as columns** and **Target as a line** in the same chart. Which chart type?",
      "options": [
        "Pie",
        "Combo (Clustered Column - Line)",
        "Waterfall",
        "Treemap"
      ],
      "answer": 1,
      "explain": "A **Combo** chart (Insert > Charts > Combo, or Change Chart Type > Combo) lets each series have its own chart type."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Sales are in lakhs and Growth % is between 0 and 1. The % line looks flat at the bottom. What fixes it?",
      "options": [
        "Delete the % series",
        "Plot the % series on a Secondary Axis",
        "Use a pie chart",
        "Add data labels"
      ],
      "answer": 1,
      "explain": "Put the small-scale series on a **Secondary Axis** (Format Data Series > Series Options > Secondary Axis) so both series are readable."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In a **Waterfall** chart, how do you make the closing balance bar start from zero?",
      "options": [
        "Right-click the bar > Set as Total",
        "Delete the bar",
        "Change its colour",
        "Use a secondary axis"
      ],
      "answer": 0,
      "explain": "Click the bar (single click twice to select only that point), right-click > **Set as Total**. Otherwise Excel treats it as another increase/decrease floating bar."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Match the chart to its use. Which pairs are correct? (choose all that apply)",
      "options": [
        "Pareto = sorted columns + cumulative % line (80/20 rule)",
        "Histogram = frequency of values in ranges (bins)",
        "Sparklines = tiny charts inside a single cell",
        "Treemap = trend over time"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "Pareto, Histogram and Sparklines are correctly matched. A **Treemap** shows hierarchical parts of a whole as rectangles, not trends (use a line chart for trends)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The waterfall's final **Closing Balance** bar = opening + all increases and decreases. Calculate it.",
      "example": {
        "title": "running total",
        "code": "=SUM($B$2:B4)"
      },
      "grid": {
        "A1": "Step",
        "B1": "Value",
        "C1": "Month",
        "D1": "Actual",
        "E1": "Target",
        "A2": "Opening Balance",
        "B2": "50000",
        "C2": "Jan",
        "D2": "42000",
        "E2": "40000",
        "A3": "Sales",
        "B3": "32000",
        "C3": "Feb",
        "D3": "38000",
        "E3": "42000",
        "A4": "Salaries",
        "B4": "-18000",
        "C4": "Mar",
        "D4": "47000",
        "E4": "44000",
        "A5": "Rent",
        "B5": "-7000",
        "C5": "Apr",
        "D5": "51000",
        "E5": "46000",
        "A6": "Other Income",
        "B6": "4500"
      },
      "starter": "",
      "solution": "=SUM(B2:B6)",
      "explain": "50000 + 32000 - 18000 - 7000 + 4500 = **61500**. Decreases are stored as negative numbers, so SUM gives the closing balance."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "For the combo chart's secondary axis, compute **Achievement %** for **Feb** (Actual / Target) as a decimal.",
      "example": {
        "title": "ratio for a % series",
        "code": "=C5/D5"
      },
      "grid": {
        "A1": "Step",
        "B1": "Value",
        "C1": "Month",
        "D1": "Actual",
        "E1": "Target",
        "A2": "Opening Balance",
        "B2": "50000",
        "C2": "Jan",
        "D2": "42000",
        "E2": "40000",
        "A3": "Sales",
        "B3": "32000",
        "C3": "Feb",
        "D3": "38000",
        "E3": "42000",
        "A4": "Salaries",
        "B4": "-18000",
        "C4": "Mar",
        "D4": "47000",
        "E4": "44000",
        "A5": "Rent",
        "B5": "-7000",
        "C5": "Apr",
        "D5": "51000",
        "E5": "46000",
        "A6": "Other Income",
        "B6": "4500"
      },
      "starter": "",
      "solution": "=D3/E3",
      "explain": "38000 / 42000 = **0.904761...** (90.5%). Plot this % series on the secondary axis with Actual and Target columns on the primary axis."
    }
  ]
};
