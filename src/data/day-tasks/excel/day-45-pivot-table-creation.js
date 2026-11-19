// Day Task (auto-graded practice) for day-45-pivot-table-creation
export default {
  "lesson": "day-45-pivot-table-creation",
  "minutes": 25,
  "intro": "Create a Pivot Table, place fields in Rows/Columns/Values/Filters and check pivot numbers with formulas.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you insert a Pivot Table?",
      "options": [
        "Insert > Tables > PivotTable",
        "Data > Pivot",
        "Home > Pivot",
        "Formulas > Pivot"
      ],
      "answer": 0,
      "explain": "**Insert > Tables > PivotTable** (Alt, N, V). Click inside clean data (ideally an Excel Table) first so Excel detects the range."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "What are the **four areas** of the PivotTable Fields pane? (choose all)",
      "options": [
        "Filters",
        "Columns",
        "Rows",
        "Values",
        "Charts"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "The four areas are **Filters, Columns, Rows and Values**. Put categories (Region) in Rows/Columns and numbers (Amount) in Values."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You drag a **text** field (Product) into Values. What summary does the pivot show by default?",
      "options": [
        "Sum",
        "Count",
        "Average",
        "Max"
      ],
      "answer": 1,
      "explain": "Text fields in Values are **counted**. Number fields are summed by default (unless the column contains blanks or text, then Count). Change it in **Value Field Settings**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Source data changed. How do you update the pivot?",
      "options": [
        "It updates automatically",
        "PivotTable Analyze > Refresh (Alt + F5)",
        "Delete and recreate it",
        "Press F9"
      ],
      "answer": 1,
      "explain": "Pivots do **not** update automatically. Use **Refresh** (Alt + F5) or Refresh All (Ctrl + Alt + F5). If new rows were added outside the range, use Change Data Source or base the pivot on a Table."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Check the pivot: the cell for **Region = North** in the Sum of Amount column. Write a formula that gives the same number.",
      "example": {
        "title": "reproducing a pivot cell",
        "code": "=SUMIF(C2:C99, \"Laptop\", F2:F99)"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Product",
        "D1": "Qty",
        "E1": "Amount",
        "A2": "Apr",
        "B2": "North",
        "C2": "Mobile",
        "D2": "5",
        "E2": "75000",
        "A3": "Apr",
        "B3": "South",
        "C3": "Laptop",
        "D3": "2",
        "E3": "98000",
        "A4": "May",
        "B4": "North",
        "C4": "Laptop",
        "D4": "3",
        "E4": "147000",
        "A5": "May",
        "B5": "East",
        "C5": "Mobile",
        "D5": "4",
        "E5": "60000",
        "A6": "Jun",
        "B6": "South",
        "C6": "Mobile",
        "D6": "6",
        "E6": "90000",
        "A7": "Jun",
        "B7": "North",
        "C7": "Mobile",
        "D7": "2",
        "E7": "30000"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B7,\"North\",E2:E7)",
      "explain": "North: 75000 + 147000 + 30000 = **252000**. Checking a pivot value with SUMIF/SUMIFS is a good habit in MIS work."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "With Show Values As **% of Grand Total**, what fraction does **Mobile** have? Write a formula that returns it as a decimal (Mobile amount / total amount).",
      "example": {
        "title": "share of total",
        "code": "=SUMIF(B2:B99,\"East\",E2:E99)/SUM(E2:E99)"
      },
      "grid": {
        "A1": "Date",
        "B1": "Region",
        "C1": "Product",
        "D1": "Qty",
        "E1": "Amount",
        "A2": "Apr",
        "B2": "North",
        "C2": "Mobile",
        "D2": "5",
        "E2": "75000",
        "A3": "Apr",
        "B3": "South",
        "C3": "Laptop",
        "D3": "2",
        "E3": "98000",
        "A4": "May",
        "B4": "North",
        "C4": "Laptop",
        "D4": "3",
        "E4": "147000",
        "A5": "May",
        "B5": "East",
        "C5": "Mobile",
        "D5": "4",
        "E5": "60000",
        "A6": "Jun",
        "B6": "South",
        "C6": "Mobile",
        "D6": "6",
        "E6": "90000",
        "A7": "Jun",
        "B7": "North",
        "C7": "Mobile",
        "D7": "2",
        "E7": "30000"
      },
      "starter": "",
      "solution": "=SUMIF(C2:C7,\"Mobile\",E2:E7)/SUM(E2:E7)",
      "explain": "Mobile = 255000, total = 500000 → **0.51** (51%). Show Values As does this calculation inside the pivot."
    }
  ]
};
