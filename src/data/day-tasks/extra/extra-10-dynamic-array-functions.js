// Day Task (auto-graded practice) for extra-10-dynamic-array-functions
export default {
  "lesson": "extra-10-dynamic-array-functions",
  "minutes": 15,
  "intro": "Understand spilling, the # spill reference, the @ operator and how to fix #SPILL! errors.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "A formula in D2 should spill 6 values down to D7, but it shows **#SPILL!**. What is the most common cause?",
      "options": [
        "The formula has a typo",
        "Some cell in D3:D7 already contains data",
        "The source range is too small",
        "Calculation is set to Manual"
      ],
      "answer": 1,
      "explain": "A spill never overwrites existing data. If any cell in the spill area is not empty (even a space), you get **#SPILL!**. Clear the obstructing cells and the result appears. Spilling into a merged cell or inside an Excel Table also causes #SPILL!."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "`=UNIQUE(A2:A50)` is entered in **D2** and spills down. Write the reference that always means \"the whole spilled result\" (to use inside COUNTA or as a dropdown source).",
      "accept": [
        "D2#",
        "=D2#",
        "$D$2#",
        "=$D$2#"
      ],
      "explain": "Add **#** after the anchor cell: `D2#`. It grows and shrinks with the spill, e.g. `=COUNTA(D2#)` counts the unique items and Data Validation can use `=$D$2#` as a dynamic list."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these are **dynamic array** functions that can spill? (choose all that apply)",
      "options": [
        "FILTER",
        "SORT",
        "UNIQUE",
        "SEQUENCE",
        "VLOOKUP",
        "SUMIF"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "FILTER, SORT, SORTBY, UNIQUE, SEQUENCE and RANDARRAY were designed to return arrays. VLOOKUP and SUMIF return a single value (they spill only if you give them an array of lookup values)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "An old workbook opened in Microsoft 365 shows `=@A2:A10*2`. What does **@** mean?",
      "options": [
        "The formula is broken",
        "Implicit intersection: return only the one value from the same row, like old Excel did",
        "The range is absolute",
        "The formula is an array formula"
      ],
      "answer": 1,
      "explain": "The **@** operator forces old-style **implicit intersection**, so the formula returns a single value (the one in the formula's row) instead of spilling. Excel adds it to keep old formulas giving the same result."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "`=UNIQUE(B2:B9)` in **D2** has spilled the city list into D2:D5 (see the sheet). The practice sheet cannot use `#`, so count the items of the spill range using its **cell range**.",
      "example": {
        "title": "counting a list",
        "code": "=COUNTA(F2:F10)"
      },
      "grid": {
        "A1": "Customer",
        "B1": "City",
        "D1": "Unique cities",
        "A2": "Asha",
        "B2": "Pune",
        "D2": "Pune",
        "A3": "Ravi",
        "B3": "Delhi",
        "D3": "Delhi",
        "A4": "Meena",
        "B4": "Pune",
        "D4": "Chennai",
        "A5": "Imran",
        "B5": "Chennai",
        "D5": "Jaipur",
        "A6": "Kavya",
        "B6": "Delhi",
        "A7": "Rohit",
        "B7": "Jaipur",
        "A8": "Sneha",
        "B8": "Pune",
        "A9": "Arjun",
        "B9": "Chennai"
      },
      "starter": "",
      "solution": "=COUNTA(D2:D5)",
      "explain": "In real Excel you would write `=COUNTA(D2#)` (or `=ROWS(D2#)`), which stays correct when a new city appears. Here the spill is D2:D5 → **4** unique cities."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=SORT(A2:A20)` in C2 has spilled to C2:C20. You click **C5** and press Delete. What happens?",
      "options": [
        "C5 becomes empty and the rest stays",
        "Nothing: only the anchor cell C2 can be edited; the spilled cells are read-only",
        "The whole spill is deleted",
        "Excel shows #REF!"
      ],
      "answer": 1,
      "explain": "Cells in a spill range other than the anchor show the formula greyed out and cannot be edited. Delete or change **C2** to change the whole result. Typing a value into C5 would instead cause #SPILL! in C2."
    }
  ]
};
