// Day Task (auto-graded practice) for extra-18-lambda
export default {
  "lesson": "extra-18-lambda",
  "minutes": 18,
  "intro": "Create reusable custom functions with LAMBDA(), test them in a cell and save them in the Name Manager.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you save a LAMBDA so it can be used like a built-in function (e.g. `=ADDGST(1000, 18%)`)?",
      "options": [
        "In a VBA module",
        "Formulas > Name Manager (Define Name) with the LAMBDA in \"Refers to\"",
        "In cell A1 of a hidden sheet",
        "File > Options > Formulas"
      ],
      "answer": 1,
      "explain": "Create a **name** (e.g. ADDGST) and put `=LAMBDA(amt, rate, amt*(1+rate))` in **Refers to**. No VBA and no macro-enabled file is needed."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return?",
      "code": "=LAMBDA(x, y, x*y+10)(4, 5)",
      "expected": "30",
      "explain": "Values in the second brackets are passed to the parameters: x = 4, y = 5 → 4 × 5 + 10 = **30**. This \"call it immediately\" style is how you test a LAMBDA in a cell."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You type `=LAMBDA(a, a*2)` in a cell **without** the second brackets. What does Excel show?",
      "options": [
        "0",
        "#CALC!",
        "#NAME?",
        "The formula text"
      ],
      "answer": 1,
      "explain": "A LAMBDA that is defined but not called returns **#CALC!**. Either call it, e.g. `=LAMBDA(a, a*2)(7)`, or save it in Name Manager."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The custom function **ADDGST** is defined as `=LAMBDA(amt, rate, amt*(1+rate))`. The practice sheet does not know ADDGST, so write the formula that gives the same result as `=ADDGST(B3, C3)`.",
      "example": {
        "title": "substituting LAMBDA parameters",
        "text": "For DISC = LAMBDA(p, d, p*(1-d)), DISC(A2, B2) is:",
        "code": "=A2*(1-B2)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Amount",
        "C1": "GST rate",
        "A2": "Laptop bag",
        "B2": "1500",
        "C2": "0.12",
        "A3": "Printer",
        "B3": "8400",
        "C3": "0.18",
        "A4": "Notebook",
        "B4": "60",
        "C4": "0.05"
      },
      "starter": "",
      "solution": "=B3*(1+C3)",
      "explain": "ADDGST replaces amt with B3 and rate with C3: 8400 × 1.18 = **9912**. Writing `B3*1+C3` forgets the brackets and gives 8400.18."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these are **LAMBDA helper functions**? (choose all that apply)",
      "options": [
        "MAP",
        "REDUCE",
        "BYROW",
        "SCAN",
        "VLOOKUP",
        "CONCAT"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "MAP, REDUCE, SCAN, BYROW, BYCOL and MAKEARRAY take a LAMBDA as an argument and apply it to arrays. VLOOKUP and CONCAT are ordinary functions."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "A LAMBDA can have parameters and must end with one argument that is always required. What is that last argument called? (one word)",
      "accept": [
        "calculation",
        "formula"
      ],
      "explain": "Syntax: `=LAMBDA([parameter1, parameter2, ...], calculation)`. Parameters are optional (up to 253), the **calculation** is required and is what the function returns."
    }
  ]
};
