// Day Task (auto-graded practice) for excel-dashboards
export default {
  "lesson": "excel-dashboards",
  "minutes": 20,
  "intro": "Revise dashboard design, KPI formulas, slicers and form controls, protection and the most used shortcuts.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "KPI card: **Revenue vs Target %** for the whole period (total revenue ÷ total target).",
      "example": {
        "title": "achievement % from totals",
        "code": "=SUM(C2:C13)/SUM(D2:D13)"
      },
      "grid": {
        "A1": "Month",
        "B1": "Revenue",
        "C1": "Target",
        "D1": "Orders",
        "A2": "Apr",
        "B2": "820000",
        "C2": "800000",
        "D2": "410",
        "A3": "May",
        "B3": "760000",
        "C3": "850000",
        "D3": "388",
        "A4": "Jun",
        "B4": "905000",
        "C4": "880000",
        "D4": "452",
        "A5": "Jul",
        "B5": "842000",
        "C5": "900000",
        "D5": "431"
      },
      "starter": "",
      "solution": "=SUM(B2:B5)/SUM(C2:C5)",
      "explain": "3,327,000 / 3,430,000 ≈ **0.97** (97% of target). Divide the totals; averaging the four monthly percentages gives a slightly different, wrong figure."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "KPI card: number of months where Revenue **met or beat** the Target.",
      "example": {
        "title": "counting row-by-row comparisons",
        "code": "=SUMPRODUCT(--(C2:C13>D2:D13))"
      },
      "grid": {
        "A1": "Month",
        "B1": "Revenue",
        "C1": "Target",
        "D1": "Orders",
        "A2": "Apr",
        "B2": "820000",
        "C2": "800000",
        "D2": "410",
        "A3": "May",
        "B3": "760000",
        "C3": "850000",
        "D3": "388",
        "A4": "Jun",
        "B4": "905000",
        "C4": "880000",
        "D4": "452",
        "A5": "Jul",
        "B5": "842000",
        "C5": "900000",
        "D5": "431"
      },
      "starter": "",
      "solution": "=SUMPRODUCT(--(B2:B5>=C2:C5))",
      "explain": "Apr (820k ≥ 800k) and Jun (905k ≥ 880k) → **2** months. COUNTIF cannot compare two ranges row by row, so SUMPRODUCT with `--(condition)` is used."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "KPI card: **Average Order Value** for July (row 5), rounded to the nearest rupee.",
      "example": {
        "title": "a ratio KPI",
        "code": "=ROUND(C2/D2,0)"
      },
      "grid": {
        "A1": "Month",
        "B1": "Revenue",
        "C1": "Target",
        "D1": "Orders",
        "A2": "Apr",
        "B2": "820000",
        "C2": "800000",
        "D2": "410",
        "A3": "May",
        "B3": "760000",
        "C3": "850000",
        "D3": "388",
        "A4": "Jun",
        "B4": "905000",
        "C4": "880000",
        "D4": "452",
        "A5": "Jul",
        "B5": "842000",
        "C5": "900000",
        "D5": "431"
      },
      "starter": "",
      "solution": "=ROUND(B5/D5,0)",
      "explain": "842,000 / 431 = 1,953.6 → **1,954**. Rounding the displayed KPI keeps the card clean."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want users to change only the input cells (yellow) and not break formulas. What is the right order of steps?",
      "options": [
        "Protect Sheet, then unlock input cells",
        "Unlock the input cells (Format Cells > Protection > untick Locked), then Review > Protect Sheet",
        "Hide the formulas only",
        "Save as PDF"
      ],
      "answer": 1,
      "explain": "All cells are **Locked** by default, but locking only works after **Protect Sheet**. So first unlock the input cells, then protect the sheet (optionally with a password)."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are good dashboard design rules? (choose all that apply)",
      "options": [
        "Put the most important KPIs at the top-left",
        "Use one consistent colour for \"good\" and one for \"bad\"",
        "Keep raw data on a separate sheet",
        "Use as many chart types as possible",
        "Connect slicers to all related pivots (Report Connections)"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Dashboards are read top-left first, need consistent colours and a clean data/calc/dashboard separation. Too many chart types make it hard to read."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **recalculates** all formulas when calculation is set to Manual?",
      "accept": [
        "F9"
      ],
      "explain": "**F9** recalculates all open workbooks; Shift + F9 recalculates the active sheet only. Large dashboards are sometimes set to Manual calculation to stay fast."
    }
  ]
};
