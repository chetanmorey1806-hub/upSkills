// Day Task (auto-graded practice) for pivot-tables
export default {
  "lesson": "pivot-tables",
  "minutes": 22,
  "intro": "Revise the four Pivot Table areas, Show Values As, grouping, calculated fields, slicers, refresh and GETPIVOTDATA.",
  "tasks": [
    {
      "type": "multi",
      "mins": 2,
      "q": "What are the **four areas** of the PivotTable Fields pane? (choose all that apply)",
      "options": [
        "Filters",
        "Columns",
        "Rows",
        "Values",
        "Slicers",
        "Totals"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Drag fields into **Filters, Columns, Rows and Values**. Slicers are inserted separately (PivotTable Analyze > Insert Slicer)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A pivot has **Region** in Rows and **Sum of Sales** in Values. Write the formula that gives the value the pivot shows for **North**.",
      "example": {
        "title": "pivot value = conditional sum",
        "code": "=SUMIFS(D2:D500,B2:B500,\"West\",C2:C500,\"Laptop\")"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Category",
        "D1": "Sales",
        "E1": "Cost",
        "A2": "=DATE(2025,4,3)",
        "B2": "North",
        "C2": "Furniture",
        "D2": "42000",
        "E2": "30500",
        "A3": "=DATE(2025,4,9)",
        "B3": "South",
        "C3": "Electronics",
        "D3": "68000",
        "E3": "52000",
        "A4": "=DATE(2025,5,2)",
        "B4": "North",
        "C4": "Electronics",
        "D4": "51000",
        "E4": "39800",
        "A5": "=DATE(2025,5,15)",
        "B5": "East",
        "C5": "Furniture",
        "D5": "27500",
        "E5": "19000",
        "A6": "=DATE(2025,6,6)",
        "B6": "South",
        "C6": "Furniture",
        "D6": "33800",
        "E6": "24100",
        "A7": "=DATE(2025,6,21)",
        "B7": "North",
        "C7": "Electronics",
        "D7": "74500",
        "E7": "58200"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B7,\"North\",D2:D7)",
      "explain": "North: 42,000 + 51,000 + 74,500 = **167,500**. A pivot is a SUMIFS for every combination of row/column items, built in seconds and refreshable."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A **calculated field** `Margin % = (Sales - Cost) / Sales` is added. What does it show for **Electronics** in total? Write one formula (sums first, then the ratio).",
      "example": {
        "title": "ratio of sums",
        "code": "=(SUM(B2:B9)-SUM(C2:C9))/SUM(B2:B9)"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Category",
        "D1": "Sales",
        "E1": "Cost",
        "A2": "=DATE(2025,4,3)",
        "B2": "North",
        "C2": "Furniture",
        "D2": "42000",
        "E2": "30500",
        "A3": "=DATE(2025,4,9)",
        "B3": "South",
        "C3": "Electronics",
        "D3": "68000",
        "E3": "52000",
        "A4": "=DATE(2025,5,2)",
        "B4": "North",
        "C4": "Electronics",
        "D4": "51000",
        "E4": "39800",
        "A5": "=DATE(2025,5,15)",
        "B5": "East",
        "C5": "Furniture",
        "D5": "27500",
        "E5": "19000",
        "A6": "=DATE(2025,6,6)",
        "B6": "South",
        "C6": "Furniture",
        "D6": "33800",
        "E6": "24100",
        "A7": "=DATE(2025,6,21)",
        "B7": "North",
        "C7": "Electronics",
        "D7": "74500",
        "E7": "58200"
      },
      "starter": "",
      "solution": "=(SUMIF(C2:C7,\"Electronics\",D2:D7)-SUMIF(C2:C7,\"Electronics\",E2:E7))/SUMIF(C2:C7,\"Electronics\",D2:D7)",
      "explain": "Calculated fields work on the **sums**: (193,500 − 150,000) / 193,500 ≈ **0.2248** (22.5%). Averaging each row's margin % would give a different, wrong answer."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The source data got 200 new rows. The pivot does not show them. What do you do?",
      "options": [
        "Rebuild the pivot",
        "Refresh (Alt+F5), and if the source is a plain range, Change Data Source first (better: base the pivot on an Excel Table)",
        "Press F9",
        "Save and reopen"
      ],
      "answer": 1,
      "explain": "Pivots read a **cache**; they update only on **Refresh**. If the source is a fixed range, extend it with Change Data Source, or use a Table so new rows are included automatically."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which **Show Values As** option displays each region's share of the total sales?",
      "options": [
        "Running Total In",
        "% of Grand Total (or % of Column Total)",
        "Difference From",
        "Rank Largest to Smallest"
      ],
      "answer": 1,
      "explain": "Right-click a value > **Show Values As > % of Grand Total**. The underlying sum is unchanged; only the display changes."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the function that pulls a number out of a pivot table and keeps working when the layout changes: `=______(\"Sales\", $A$3, \"Region\", \"North\")`",
      "accept": [
        "GETPIVOTDATA"
      ],
      "explain": "**GETPIVOTDATA**(data_field, pivot_table, field1, item1, ...) is created automatically when you type = and click a pivot value. Unlike a cell reference it does not break when the pivot is re-sorted."
    }
  ]
};
