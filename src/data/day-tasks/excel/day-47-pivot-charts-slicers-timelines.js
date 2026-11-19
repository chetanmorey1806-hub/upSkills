// Day Task (auto-graded practice) for day-47-pivot-charts-slicers-timelines
export default {
  "lesson": "day-47-pivot-charts-slicers-timelines",
  "minutes": 20,
  "intro": "Make pivot reports interactive with Pivot Charts, Slicers, Timelines and Report Connections.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is a **Slicer**?",
      "options": [
        "A chart type",
        "A set of clickable filter buttons for a pivot or table",
        "A way to split cells",
        "A date function"
      ],
      "answer": 1,
      "explain": "A **Slicer** shows one button per item (e.g. each Region); clicking filters the connected pivots/tables. Insert it from **PivotTable Analyze > Insert Slicer**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A **Timeline** can be used only for which kind of field?",
      "options": [
        "Text",
        "Numbers",
        "Dates",
        "Any field"
      ],
      "answer": 2,
      "explain": "A Timeline works only with **date** fields and lets you filter by Years, Quarters, Months or Days with a slider."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "How can **one slicer** filter **three pivot tables** built on the same source?",
      "options": [
        "Copy the slicer three times",
        "Slicer > Report Connections > tick all three pivots",
        "Group the pivots",
        "It is not possible"
      ],
      "answer": 1,
      "explain": "Right-click the slicer > **Report Connections** (or Slicer > Report Connections) and tick every pivot to control. The pivots must share the same pivot cache/source."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **key** do you hold to select **several** items in a slicer (or use the Multi-Select button)?",
      "accept": [
        "Ctrl",
        "Control"
      ],
      "explain": "Hold **Ctrl** while clicking slicer buttons, or turn on **Multi-Select** (Alt + S) at the top of the slicer."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about **Pivot Charts** are TRUE? (choose all that apply)",
      "options": [
        "A Pivot Chart is linked to a pivot table",
        "Filtering the pivot changes the chart",
        "Pivot Charts support XY (Scatter) charts",
        "Field buttons on the chart can filter it"
      ],
      "answers": [
        0,
        1,
        3
      ],
      "explain": "Pivot Charts always follow their pivot (filters, slicers, layout) and show field buttons. They do **not** support Scatter, Bubble or Stock charts."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A slicer has **\"South\"** selected. The KPI card should show the South total. Write the formula that gives it.",
      "example": {
        "title": "criteria from a cell",
        "code": "=SUMIF(A2:A50, $H$1, C2:C50)"
      },
      "grid": {
        "A1": "Region",
        "B1": "Amount",
        "A2": "North",
        "B2": "84000",
        "A3": "South",
        "B3": "61500",
        "A4": "East",
        "B4": "47200",
        "A5": "South",
        "B5": "39800",
        "A7": "Selected:",
        "B7": "South"
      },
      "starter": "",
      "solution": "=SUMIF(A2:A5,B7,B2:B5)",
      "explain": "Using the selected value from a cell (B7) makes the formula follow the selection: 61500 + 39800 = **101300**. This is how drop-down driven KPI cards work."
    }
  ]
};
