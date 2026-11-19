// Day Task (auto-graded practice) for day-14-counta-countblank-product
export default {
  "lesson": "day-14-counta-countblank-product",
  "minutes": 20,
  "intro": "Check data completeness with COUNTA() and COUNTBLANK() and multiply with PRODUCT().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many employees have **submitted documents** (non-empty cells in C2:C6)?",
      "example": {
        "title": "COUNTA",
        "code": "=COUNTA(B2:B30)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joined",
        "C1": "Docs Submitted",
        "D1": "Remarks",
        "A2": "Anil",
        "B2": "2023",
        "C2": "Yes",
        "A3": "Bhavna",
        "B3": "2024",
        "D3": "Pending PAN",
        "A4": "Chirag",
        "B4": "2022",
        "C4": "Yes",
        "A5": "Deepa",
        "C5": "Yes",
        "D5": "New",
        "A6": "Eshan",
        "B6": "2024"
      },
      "starter": "",
      "solution": "=COUNTA(C2:C6)",
      "explain": "COUNTA counts every non-empty cell (text, numbers, dates, errors): **3**. COUNT would return 0 here because \"Yes\" is text."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many employees have **not** submitted documents (empty cells in C2:C6)?",
      "example": {
        "title": "COUNTBLANK",
        "code": "=COUNTBLANK(D2:D30)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joined",
        "C1": "Docs Submitted",
        "D1": "Remarks",
        "A2": "Anil",
        "B2": "2023",
        "C2": "Yes",
        "A3": "Bhavna",
        "B3": "2024",
        "D3": "Pending PAN",
        "A4": "Chirag",
        "B4": "2022",
        "C4": "Yes",
        "A5": "Deepa",
        "C5": "Yes",
        "D5": "New",
        "A6": "Eshan",
        "B6": "2024"
      },
      "starter": "",
      "solution": "=COUNTBLANK(C2:C6)",
      "explain": "COUNTBLANK counts empty cells: **2** (Bhavna and Eshan). COUNTA + COUNTBLANK always equals the total number of cells."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many **remarks** are filled in D2:D6?",
      "example": {
        "title": "COUNTA on text",
        "code": "=COUNTA(A2:A12)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joined",
        "C1": "Docs Submitted",
        "D1": "Remarks",
        "A2": "Anil",
        "B2": "2023",
        "C2": "Yes",
        "A3": "Bhavna",
        "B3": "2024",
        "D3": "Pending PAN",
        "A4": "Chirag",
        "B4": "2022",
        "C4": "Yes",
        "A5": "Deepa",
        "C5": "Yes",
        "D5": "New",
        "A6": "Eshan",
        "B6": "2024"
      },
      "starter": "",
      "solution": "=COUNTA(D2:D6)",
      "explain": "Two remarks are filled (\"Pending PAN\" and \"New\") = **2**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A room is **12.5 m** long, **8 m** wide and **3.2 m** high. Use PRODUCT to find its **volume**.",
      "example": {
        "title": "PRODUCT of cells",
        "code": "=PRODUCT(B2, C2, 1.18)"
      },
      "grid": {
        "A1": "Length",
        "B1": "Width",
        "C1": "Height",
        "A2": "12.5",
        "B2": "8",
        "C2": "3.2"
      },
      "starter": "",
      "solution": "=PRODUCT(A2:C2)",
      "explain": "`=PRODUCT(A2:C2)` multiplies all three = **320** cubic metres. `=A2*B2*C2` gives the same result."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A1 = **5**, A2 is **blank**, A3 = **4**. What does `=PRODUCT(A1:A3)` show?",
      "code": "  | A\n1 | 5\n3 | 4\n\n=PRODUCT(A1:A3)",
      "expected": "20",
      "explain": "PRODUCT **ignores blank cells**, so it multiplies only 5 x 4 = **20**. `=A1*A2*A3` would treat the blank as 0 and return 0."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which function counts cells containing **any** data (text, numbers, dates)?",
      "options": [
        "COUNT",
        "COUNTA",
        "COUNTBLANK",
        "SUM"
      ],
      "answer": 1,
      "explain": "**COUNTA** = count all non-empty cells. **COUNT** = only numbers. **COUNTBLANK** = only empty cells."
    }
  ]
};
