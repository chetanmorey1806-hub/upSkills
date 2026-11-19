// Day Task (auto-graded practice) for day-39-index-match
export default {
  "lesson": "day-39-index-match",
  "minutes": 20,
  "intro": "Learn INDEX() (value by position) and MATCH() (position of a value) on their own before combining them.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Return the value in the **3rd row, 2nd column** of B2:D5 with INDEX.",
      "example": {
        "title": "INDEX row and column",
        "code": "=INDEX(B2:F20, 5, 3)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Q1",
        "C1": "Q2",
        "D1": "Q3",
        "A2": "Laptop",
        "B2": "120",
        "C2": "135",
        "D2": "150",
        "A3": "Tablet",
        "B3": "80",
        "C3": "95",
        "D3": "70",
        "A4": "Mobile",
        "B4": "300",
        "C4": "280",
        "D4": "320",
        "A5": "Printer",
        "B5": "45",
        "C5": "50",
        "D5": "55"
      },
      "starter": "",
      "solution": "=INDEX(B2:D5,3,2)",
      "explain": "Row 3 of the range = Mobile, column 2 = Q2 → **280**. Positions are counted inside the range, not from A1."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **position** of \"Tablet\" in A2:A5 with MATCH (exact match).",
      "example": {
        "title": "MATCH exact",
        "code": "=MATCH(\"Pune\", C2:C30, 0)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Q1",
        "C1": "Q2",
        "D1": "Q3",
        "A2": "Laptop",
        "B2": "120",
        "C2": "135",
        "D2": "150",
        "A3": "Tablet",
        "B3": "80",
        "C3": "95",
        "D3": "70",
        "A4": "Mobile",
        "B4": "300",
        "C4": "280",
        "D4": "320",
        "A5": "Printer",
        "B5": "45",
        "C5": "50",
        "D5": "55"
      },
      "starter": "",
      "solution": "=MATCH(\"Tablet\",A2:A5,0)",
      "explain": "Tablet is the **2nd** item. MATCH returns a **position** (a number), not the value. Use 0 for exact match."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the column **position** of \"Q3\" in the header B1:D1.",
      "example": {
        "title": "MATCH in a row",
        "code": "=MATCH(\"Mar\", B1:M1, 0)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Q1",
        "C1": "Q2",
        "D1": "Q3",
        "A2": "Laptop",
        "B2": "120",
        "C2": "135",
        "D2": "150",
        "A3": "Tablet",
        "B3": "80",
        "C3": "95",
        "D3": "70",
        "A4": "Mobile",
        "B4": "300",
        "C4": "280",
        "D4": "320",
        "A5": "Printer",
        "B5": "45",
        "C5": "50",
        "D5": "55"
      },
      "starter": "",
      "solution": "=MATCH(\"Q3\",B1:D1,0)",
      "explain": "MATCH works on rows too: Q3 is the **3rd** header."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Return the **4th** product name from the one-column list A2:A5 using INDEX.",
      "example": {
        "title": "INDEX in one column",
        "code": "=INDEX(B2:B40, 10)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Q1",
        "C1": "Q2",
        "D1": "Q3",
        "A2": "Laptop",
        "B2": "120",
        "C2": "135",
        "D2": "150",
        "A3": "Tablet",
        "B3": "80",
        "C3": "95",
        "D3": "70",
        "A4": "Mobile",
        "B4": "300",
        "C4": "280",
        "D4": "320",
        "A5": "Printer",
        "B5": "45",
        "C5": "50",
        "D5": "55"
      },
      "starter": "",
      "solution": "=INDEX(A2:A5,4)",
      "explain": "With a single column you only need row_num → **Printer**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the position of the first product whose name starts with **\"Mob\"** (wildcard, exact-match mode).",
      "example": {
        "title": "MATCH with wildcard",
        "code": "=MATCH(\"*Kumar\", B2:B50, 0)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Q1",
        "C1": "Q2",
        "D1": "Q3",
        "A2": "Laptop",
        "B2": "120",
        "C2": "135",
        "D2": "150",
        "A3": "Tablet",
        "B3": "80",
        "C3": "95",
        "D3": "70",
        "A4": "Mobile",
        "B4": "300",
        "C4": "280",
        "D4": "320",
        "A5": "Printer",
        "B5": "45",
        "C5": "50",
        "D5": "55"
      },
      "starter": "",
      "solution": "=MATCH(\"Mob*\",A2:A5,0)",
      "explain": "Wildcards (* and ?) work with match_type 0 → Mobile is at position **3**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "The list of slab starts is sorted ascending. What does this formula return?",
      "code": "  | A\n1 | Slab Start\n2 | 0\n3 | 50\n4 | 100\n5 | 200\n\n=MATCH(150,A2:A5,1)",
      "expected": "3",
      "explain": "match_type **1** finds the position of the **largest value <= 150** in an ascending list: 100 is the 3rd item → **3**. With match_type 0 the result would be #N/A because 150 is not in the list."
    }
  ]
};
