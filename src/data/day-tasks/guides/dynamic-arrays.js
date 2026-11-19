// Day Task (auto-graded practice) for dynamic-arrays
export default {
  "lesson": "dynamic-arrays",
  "minutes": 22,
  "intro": "Revise spilling, the # operator, FILTER, SORT/SORTBY/UNIQUE, SEQUENCE, LET, LAMBDA and array shaping functions.",
  "tasks": [
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula spill? Type each value on its own line.",
      "code": "  | A     | B     | C         | D\n1 | Emp   | Dept  | City      | Salary\n2 | Asha  | Sales | Pune      | 52000\n3 | Ravi  | IT    | Bengaluru | 78000\n4 | Imran | Sales | Mumbai    | 47000\n5 | Meena | HR    | Pune      | 45000\n6 | Kavya | IT    | Pune      | 91000\n7 | Rohit | Sales | Delhi     | 56000\n\n=SORT(FILTER(A2:A7, B2:B7=\"Sales\"))",
      "expected": "Asha\nImran\nRohit",
      "explain": "FILTER keeps Asha, Imran, Rohit (Sales) and SORT orders them A-Z: **Asha, Imran, Rohit**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "`=FILTER(D2:D7, (B2:B7=\"IT\")+(C2:C7=\"Pune\"))` returns salaries where Dept is IT **OR** City is Pune. Write a formula for the **total** of those salaries without FILTER (watch out: Kavya matches both conditions and must be counted once).",
      "example": {
        "title": "OR logic without double counting",
        "code": "=SUMPRODUCT(((A2:A50=\"X\")+(B2:B50=\"Y\")>0)*C2:C50)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Dept",
        "C1": "City",
        "D1": "Salary",
        "A2": "Asha",
        "B2": "Sales",
        "C2": "Pune",
        "D2": "52000",
        "A3": "Ravi",
        "B3": "IT",
        "C3": "Bengaluru",
        "D3": "78000",
        "A4": "Imran",
        "B4": "Sales",
        "C4": "Mumbai",
        "D4": "47000",
        "A5": "Meena",
        "B5": "HR",
        "C5": "Pune",
        "D5": "45000",
        "A6": "Kavya",
        "B6": "IT",
        "C6": "Pune",
        "D6": "91000",
        "A7": "Rohit",
        "B7": "Sales",
        "C7": "Delhi",
        "D7": "56000"
      },
      "starter": "",
      "solution": "=SUMPRODUCT(((B2:B7=\"IT\")+(C2:C7=\"Pune\")>0)*D2:D7)",
      "explain": "Matches: Asha 52,000, Ravi 78,000, Meena 45,000, Kavya 91,000 → **266,000**. `SUMIF(IT) + SUMIF(Pune)` would count Kavya twice (357,000). In FILTER, `+` works because any non-zero means TRUE."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Write the reference to the whole spill range of a formula entered in **F2**.",
      "accept": [
        "F2#",
        "=F2#",
        "$F$2#"
      ],
      "explain": "`F2#` refers to the entire spilled result and resizes automatically. It is used in charts, dropdowns and other formulas like `=COUNTA(F2#)`."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return?",
      "code": "=LET(base, 50000, hra, base*40%, base+hra)",
      "expected": "70000",
      "explain": "base = 50,000, hra = 20,000, result **70000**. LET names each piece so long formulas are readable and calculated once."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which function returns the **first 3 rows** of a sorted array, e.g. a Top-3 list?",
      "options": [
        "=TAKE(SORT(A2:D7,4,-1),3)",
        "=DROP(SORT(A2:D7,4,-1),3)",
        "=CHOOSECOLS(A2:D7,3)",
        "=VSTACK(A2:D7,3)"
      ],
      "answer": 0,
      "explain": "**TAKE(array, 3)** keeps the first 3 rows (−3 = last 3). DROP removes rows, CHOOSECOLS picks columns, VSTACK appends arrays."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=UNIQUE(B2:B7)` shows **#SPILL!**. What is the most likely reason?",
      "options": [
        "UNIQUE does not work on text",
        "A cell below the formula already has a value",
        "The range must be sorted",
        "Calculation is manual"
      ],
      "answer": 1,
      "explain": "Spilled results need empty cells. Clear the obstruction (click the warning icon > Select Obstructing Cells). Spills are also not allowed inside an Excel Table."
    }
  ]
};
