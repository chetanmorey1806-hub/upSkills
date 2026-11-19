// Day Task (auto-graded practice) for formulas-references
export default {
  "lesson": "formulas-references",
  "minutes": 20,
  "intro": "Revise operator precedence, relative/absolute/mixed references with F4, cross-sheet references and error values.",
  "tasks": [
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return?",
      "code": "=10+20/5*2-3^2",
      "expected": "9",
      "explain": "Order: **^** first (3² = 9), then **/ and *** left to right (20/5 = 4, 4×2 = 8), then + and −: 10 + 8 − 9 = **9**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Write the formula for the **GST amount** of the Mouse (row 3) as Price × Qty × GST rate, with the rate cell **G1 locked** so the formula can be copied down.",
      "example": {
        "title": "relative cells, absolute rate",
        "code": "=D2*$H$1"
      },
      "grid": {
        "A1": "Product",
        "B1": "Price",
        "C1": "Qty",
        "D1": "Amount",
        "F1": "GST",
        "G1": "0.18",
        "A2": "Pen drive",
        "B2": "450",
        "C2": "4",
        "A3": "Mouse",
        "B3": "399",
        "C3": "6",
        "A4": "Keyboard",
        "B4": "899",
        "C4": "3",
        "A5": "Cable",
        "B5": "149",
        "C5": "10"
      },
      "starter": "",
      "solution": "=B3*C3*$G$1",
      "explain": "399 × 6 × 0.18 = **430.92**. `$G$1` stays fixed when copied, while B3 and C3 move to B4, C4 ... Without `$`, the copied formula would point at G2, G3 (empty) and return 0."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=B$2*$A3` is in C3 and is copied to **D5**. What does it become?",
      "options": [
        "=C$2*$A5",
        "=B$2*$A5",
        "=C$4*$A5",
        "=C2*A5"
      ],
      "answer": 0,
      "explain": "Copying 1 column right and 2 rows down: `B$2` → column changes, row fixed = **C$2**; `$A3` → column fixed, row changes = **$A5**. This mixed pattern is used for multiplication tables."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "While editing a reference like `A1`, how many times do you press **F4** to get `A$1` (row locked only)?",
      "accept": [
        "2",
        "two",
        "twice"
      ],
      "explain": "F4 cycles: 1st press **$A$1**, 2nd **A$1**, 3rd **$A1**, 4th back to **A1**."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Match the error values. Which are **correct**? (choose all that apply)",
      "options": [
        "#DIV/0! = division by zero or an empty cell",
        "#NAME? = misspelt function or unknown name",
        "#REF! = a referenced cell was deleted",
        "#N/A = a lookup value was not found",
        "#VALUE! = the column is too narrow"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "**#####** (not an error) means the column is too narrow. **#VALUE!** means a wrong data type, e.g. =\"abc\"*2."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Without filling the Amount column, write **one formula** that returns the total of Price × Qty for all four products (rows 2-5).",
      "example": {
        "title": "multiply and add in one step",
        "code": "=SUMPRODUCT(C2:C20,D2:D20)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Price",
        "C1": "Qty",
        "D1": "Amount",
        "F1": "GST",
        "G1": "0.18",
        "A2": "Pen drive",
        "B2": "450",
        "C2": "4",
        "A3": "Mouse",
        "B3": "399",
        "C3": "6",
        "A4": "Keyboard",
        "B4": "899",
        "C4": "3",
        "A5": "Cable",
        "B5": "149",
        "C5": "10"
      },
      "starter": "",
      "solution": "=SUMPRODUCT(B2:B5,C2:C5)",
      "explain": "SUMPRODUCT multiplies pairs and adds them: 450×4 + 399×6 + 899×3 + 149×10 = **8,381**. In a real workbook a cross-sheet reference is written `=Rates!B2` (with quotes if the name has spaces: `='GST Rates'!B2`)."
    }
  ]
};
