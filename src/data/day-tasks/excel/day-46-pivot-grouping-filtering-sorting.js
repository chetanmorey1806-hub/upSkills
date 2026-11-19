// Day Task (auto-graded practice) for day-46-pivot-grouping-filtering-sorting
export default {
  "lesson": "day-46-pivot-grouping-filtering-sorting",
  "minutes": 25,
  "intro": "Group pivot dates and numbers, filter with label/value/Top N filters and sort pivot results.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you group a date field in a pivot into **Months and Quarters**?",
      "options": [
        "Right-click a date > Group > choose Months and Quarters",
        "Insert > Group",
        "Data > Outline > Group",
        "Sort the dates first"
      ],
      "answer": 0,
      "explain": "Right-click any date in the Row area > **Group** and select Months, Quarters (and Years if data spans years). Newer Excel may group dates automatically."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Excel says **\"Cannot group that selection\"**. What is the most common cause?",
      "options": [
        "The pivot is too big",
        "The date/number column contains blanks or text values",
        "The sheet is protected",
        "Too many rows"
      ],
      "answer": 1,
      "explain": "Grouping needs every value in the field to be a real date or number. **Blank cells or text dates** (e.g. \"12.03.2025\") stop grouping. Clean the source and refresh."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want only the **Top 3 cities** by Amount in the pivot. Which filter?",
      "options": [
        "Label Filter > Begins With",
        "Value Filters > Top 10 (set to 3)",
        "Report Filter",
        "Sort A to Z"
      ],
      "answer": 1,
      "explain": "**Value Filters > Top 10...** lets you choose Top/Bottom, the number (3) and Items/Percent/Sum, based on a value field."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "You group Customer Age into ranges **20-29, 30-39...** How many orders fall in the **30-39** group?",
      "example": {
        "title": "counting a bucket",
        "code": "=COUNTIFS(C2:C99, \">=40\", C2:C99, \"<=49\")"
      },
      "grid": {
        "A1": "Order Date",
        "B1": "Customer Age",
        "C1": "City",
        "D1": "Amount",
        "A2": "=DATE(2025,1,14)",
        "B2": "23",
        "C2": "Pune",
        "D2": "12000",
        "A3": "=DATE(2025,2,3)",
        "B3": "35",
        "C3": "Nagpur",
        "D3": "8500",
        "A4": "=DATE(2025,4,22)",
        "B4": "41",
        "C4": "Pune",
        "D4": "15200",
        "A5": "=DATE(2025,5,9)",
        "B5": "28",
        "C5": "Nashik",
        "D5": "6400",
        "A6": "=DATE(2025,7,30)",
        "B6": "52",
        "C6": "Pune",
        "D6": "9900",
        "A7": "=DATE(2025,8,11)",
        "B7": "31",
        "C7": "Nagpur",
        "D7": "11300"
      },
      "starter": "",
      "solution": "=COUNTIFS(B2:B7,\">=30\",B2:B7,\"<=39\")",
      "explain": "Ages 35 and 31 → **2**. Pivot number grouping (Starting at 20, Ending at 59, By 10) creates exactly these buckets."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Grouping dates by **Quarter**: what is the total Amount for **Qtr2** (April-June 2025)?",
      "example": {
        "title": "SUMIFS between dates",
        "code": "=SUMIFS(D2:D99, A2:A99, \">=\"&DATE(2025,1,1), A2:A99, \"<\"&DATE(2025,4,1))"
      },
      "grid": {
        "A1": "Order Date",
        "B1": "Customer Age",
        "C1": "City",
        "D1": "Amount",
        "A2": "=DATE(2025,1,14)",
        "B2": "23",
        "C2": "Pune",
        "D2": "12000",
        "A3": "=DATE(2025,2,3)",
        "B3": "35",
        "C3": "Nagpur",
        "D3": "8500",
        "A4": "=DATE(2025,4,22)",
        "B4": "41",
        "C4": "Pune",
        "D4": "15200",
        "A5": "=DATE(2025,5,9)",
        "B5": "28",
        "C5": "Nashik",
        "D5": "6400",
        "A6": "=DATE(2025,7,30)",
        "B6": "52",
        "C6": "Pune",
        "D6": "9900",
        "A7": "=DATE(2025,8,11)",
        "B7": "31",
        "C7": "Nagpur",
        "D7": "11300"
      },
      "starter": "",
      "solution": "=SUMIFS(D2:D7,A2:A7,\">=\"&DATE(2025,4,1),A2:A7,\"<=\"&DATE(2025,6,30))",
      "explain": "April 15200 + May 6400 = **21600**. Date criteria are built with \">=\"&DATE(...)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Sort the pivot by Amount (largest first): which value would be at the top? Find the **largest** Amount for **Pune** (MAXIFS).",
      "example": {
        "title": "MAXIFS",
        "code": "=MAXIFS(D2:D99, B2:B99, \"North\")"
      },
      "grid": {
        "A1": "Order Date",
        "B1": "Customer Age",
        "C1": "City",
        "D1": "Amount",
        "A2": "=DATE(2025,1,14)",
        "B2": "23",
        "C2": "Pune",
        "D2": "12000",
        "A3": "=DATE(2025,2,3)",
        "B3": "35",
        "C3": "Nagpur",
        "D3": "8500",
        "A4": "=DATE(2025,4,22)",
        "B4": "41",
        "C4": "Pune",
        "D4": "15200",
        "A5": "=DATE(2025,5,9)",
        "B5": "28",
        "C5": "Nashik",
        "D5": "6400",
        "A6": "=DATE(2025,7,30)",
        "B6": "52",
        "C6": "Pune",
        "D6": "9900",
        "A7": "=DATE(2025,8,11)",
        "B7": "31",
        "C7": "Nagpur",
        "D7": "11300"
      },
      "starter": "",
      "solution": "=MAXIFS(D2:D7,C2:C7,\"Pune\")",
      "explain": "Pune amounts: 12000, 15200, 9900 → **15200**."
    }
  ]
};
