// Day Task (auto-graded practice) for sort-filter-tables
export default {
  "lesson": "sort-filter-tables",
  "minutes": 18,
  "intro": "Revise multi-level sorting, AutoFilter, Advanced Filter, Excel Tables, structured references and SUBTOTAL.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut converts a range into an **Excel Table**?",
      "accept": [
        "Ctrl+T",
        "Ctrl+L"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*T\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*L\\s*$"
      ],
      "explain": "**Ctrl + T** (or Ctrl + L) opens Create Table. Tables auto-expand, copy formulas down, keep headers visible and allow structured references like `Sales[Amount]`."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut turns **AutoFilter** arrows on or off?",
      "accept": [
        "Ctrl+Shift+L"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*L\\s*$"
      ],
      "explain": "**Ctrl + Shift + L** toggles the filter arrows (Data > Filter)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The table is named **Orders**. What does `=SUM(Orders[Amount])` refer to?",
      "options": [
        "Only the header cell",
        "All data cells of the Amount column, automatically including new rows",
        "The whole table",
        "The Total Row only"
      ],
      "answer": 1,
      "explain": "A **structured reference** `Table[Column]` covers the data rows of that column and grows when rows are added, so the formula never needs editing."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "You filter Status = **Delivered**. Write a formula that gives the total Amount of the **visible** rows (the practice sheet cannot filter, so use Status as the condition).",
      "example": {
        "title": "total for one status",
        "code": "=SUMIF(D2:D50,\"Paid\",C2:C50)"
      },
      "grid": {
        "A1": "Order",
        "B1": "City",
        "C1": "Product",
        "D1": "Qty",
        "E1": "Amount",
        "F1": "Status",
        "A2": "1001",
        "B2": "Pune",
        "C2": "Fan",
        "D2": "2",
        "E2": "3600",
        "F2": "Delivered",
        "A3": "1002",
        "B3": "Mumbai",
        "C3": "Cooler",
        "D3": "1",
        "E3": "8900",
        "F3": "Pending",
        "A4": "1003",
        "B4": "Pune",
        "C4": "AC",
        "D4": "1",
        "E4": "36500",
        "F4": "Delivered",
        "A5": "1004",
        "B5": "Nagpur",
        "C5": "Fan",
        "D5": "3",
        "E5": "5400",
        "F5": "Cancelled",
        "A6": "1005",
        "B6": "Mumbai",
        "C6": "AC",
        "D6": "2",
        "E6": "71000",
        "F6": "Delivered",
        "A7": "1006",
        "B7": "Pune",
        "C7": "Cooler",
        "D7": "2",
        "E7": "17800",
        "F7": "Pending"
      },
      "starter": "",
      "solution": "=SUMIF(F2:F7,\"Delivered\",E2:E7)",
      "explain": "Visible rows: 3,600 + 36,500 + 71,000 = **111,100**. In the real filtered sheet use `=SUBTOTAL(109,E2:E7)`, because SUM keeps adding hidden rows."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You need a sort by **City A-Z**, then **Amount largest first** within each city. Where do you do it?",
      "options": [
        "Click the A-Z button twice",
        "Data > Sort, add a level for City (A to Z) and then a level for Amount (Largest to Smallest)",
        "Use AutoFilter on City only",
        "Home > Format > Sort"
      ],
      "answer": 1,
      "explain": "The **Sort dialog** lets you add levels: the first level is the main sort, the next levels break ties. Single A-Z clicks re-sort the whole list by one column only."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about **Advanced Filter** are TRUE? (choose all that apply)",
      "options": [
        "Criteria are written in a separate range with the same headers",
        "Criteria on the same row are AND, on different rows are OR",
        "It can copy the result to another location",
        "It can return unique records only",
        "It updates automatically when data changes"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Advanced Filter (Data > Sort & Filter > Advanced) is **not** live: run it again after data changes, or use FILTER() in Microsoft 365 for a live result."
    }
  ]
};
