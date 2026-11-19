// Day Task (auto-graded practice) for day-30-filtering-data
export default {
  "lesson": "day-30-filtering-data",
  "minutes": 20,
  "intro": "Filter data with AutoFilter and Advanced Filter, and count/total the same records with formulas.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut turns **AutoFilter** on or off?",
      "accept": [
        "Ctrl+Shift+L"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*L\\s*$"
      ],
      "explain": "**Ctrl + Shift + L** adds or removes the filter arrows (Data > Sort & Filter > Filter)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In an Advanced Filter **criteria range**, how do you write an **OR** condition (Delhi OR Mumbai)?",
      "options": [
        "Both values in the same row",
        "Values on different rows under the same header",
        "Separate them with a comma in one cell",
        "You cannot do OR"
      ],
      "answer": 1,
      "explain": "Conditions on the **same row = AND**; conditions on **different rows = OR**. So put Delhi in one row and Mumbai in the next row under the City header."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which options are available in **Advanced Filter**? (choose all that apply)",
      "options": [
        "Filter the list, in-place",
        "Copy to another location",
        "Unique records only",
        "Sort by colour"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "Advanced Filter (Data > Sort & Filter > Advanced) can filter in place or **copy to another location**, and has **Unique records only**. Sorting by colour is a Sort feature."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A filter shows only 3 of 50 rows. `=SUM(D2:D51)` adds:",
      "options": [
        "only the 3 visible rows",
        "all 50 rows (hidden ones too)",
        "nothing (0)",
        "an error"
      ],
      "answer": 1,
      "explain": "SUM always adds **all** cells, including rows hidden by a filter. Use `=SUBTOTAL(109, D2:D51)` (Day 53) to total only visible rows."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A filter on Dept = Sales AND City = Delhi shows 2 rows. Write a formula that **counts** the same records.",
      "example": {
        "title": "counting what a filter shows",
        "code": "=COUNTIFS(B2:B50,\"IT\",C2:C50,\"Pune\")"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Dept",
        "C1": "City",
        "D1": "Salary",
        "A2": "Kiran",
        "B2": "Sales",
        "C2": "Delhi",
        "D2": "48000",
        "A3": "Lata",
        "B3": "Accounts",
        "C3": "Mumbai",
        "D3": "52000",
        "A4": "Manoj",
        "B4": "Sales",
        "C4": "Mumbai",
        "D4": "61000",
        "A5": "Nisha",
        "B5": "Sales",
        "C5": "Delhi",
        "D5": "39000",
        "A6": "Om",
        "B6": "IT",
        "C6": "Delhi",
        "D6": "75000"
      },
      "starter": "",
      "solution": "=COUNTIFS(B2:B6,\"Sales\",C2:C6,\"Delhi\")",
      "explain": "Kiran and Nisha → **2**. A formula keeps the answer live without changing the view."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Total salary of the **Sales** staff (what the status bar shows when you filter Sales and select the Salary column).",
      "example": {
        "title": "total of a filtered group",
        "code": "=SUMIF(B2:B50,\"HR\",D2:D50)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Dept",
        "C1": "City",
        "D1": "Salary",
        "A2": "Kiran",
        "B2": "Sales",
        "C2": "Delhi",
        "D2": "48000",
        "A3": "Lata",
        "B3": "Accounts",
        "C3": "Mumbai",
        "D3": "52000",
        "A4": "Manoj",
        "B4": "Sales",
        "C4": "Mumbai",
        "D4": "61000",
        "A5": "Nisha",
        "B5": "Sales",
        "C5": "Delhi",
        "D5": "39000",
        "A6": "Om",
        "B6": "IT",
        "C6": "Delhi",
        "D6": "75000"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B6,\"Sales\",D2:D6)",
      "explain": "48000 + 61000 + 39000 = **148000**."
    }
  ]
};
