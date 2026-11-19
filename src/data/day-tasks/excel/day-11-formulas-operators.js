// Day Task (auto-graded practice) for day-11-formulas-operators
export default {
  "lesson": "day-11-formulas-operators",
  "minutes": 20,
  "intro": "Write formulas with arithmetic, comparison and text operators and predict results using Excel's order of operations.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which character must **every formula** start with?",
      "options": [
        "+",
        "=",
        "@",
        "#"
      ],
      "answer": 1,
      "explain": "A formula starts with **=**. Without it, Excel treats `B2*C2` as plain text and shows it as typed."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What will this formula show? (type only the result)",
      "code": "=10+5*2",
      "expected": "20",
      "explain": "Multiplication is done before addition (BODMAS): 5*2 = 10, then 10 + 10 = **20**. Reading left to right would give 30, which is wrong."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What will this formula show?",
      "code": "=(10+5)*2^2",
      "expected": "60",
      "explain": "Order: brackets first (15), then the **power** `^` (2^2 = 4), then multiplication: 15 * 4 = **60**. In Excel `^` is calculated before `*` and `/`."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A2 has **Ravi** and B2 has **Kumar**. What will C2 show? (type it exactly)",
      "code": "  | A     | B\n1 | First | Last\n2 | Ravi  | Kumar\n\nC2: =A2&\" \"&B2",
      "expected": "Ravi Kumar",
      "explain": "The `&` operator joins text. `\" \"` adds a space between the two names: **Ravi Kumar**."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **shows formulas** in all cells instead of their results (and back)?",
      "accept": [
        "Ctrl+`"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*`\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*~\\s*$"
      ],
      "explain": "**Ctrl + `** (grave accent, the key left of 1) toggles Show Formulas (Formulas > Formula Auditing > Show Formulas). Very useful to check a sheet."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Calculate the **net amount** for the first product: Qty x Rate, minus the discount (Discount in D2 is a rate, e.g. 0.1 = 10%).",
      "example": {
        "title": "brackets control the order",
        "code": "=B5*(1+C5)   ← price plus tax rate"
      },
      "grid": {
        "A1": "Product",
        "B1": "Qty",
        "C1": "Rate",
        "D1": "Discount",
        "A2": "Mobile Cover",
        "B2": "25",
        "C2": "199",
        "D2": "0.1",
        "A3": "Charger",
        "B3": "12",
        "C3": "549",
        "D3": "0.05",
        "A4": "Earphones",
        "B4": "18",
        "C4": "899",
        "D4": "0.15",
        "A5": "Power Bank",
        "B5": "9",
        "C5": "1499",
        "D5": "0.2"
      },
      "starter": "",
      "solution": "=B2*C2*(1-D2)",
      "explain": "Gross = 25 x 199 = 4975; discount 10% leaves 90%: 4975 x 0.9 = **4477.5**. Without brackets `=B2*C2*1-D2` subtracts only 0.1 from the total, a typical order-of-operations mistake. `=B2*C2-B2*C2*D2` is also correct."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Write a formula that returns **TRUE** if the Charger's quantity (B3) is **greater than 10**, otherwise FALSE (use a comparison operator, no function needed).",
      "example": {
        "title": "a comparison formula",
        "code": "=C4<=500"
      },
      "grid": {
        "A1": "Product",
        "B1": "Qty",
        "C1": "Rate",
        "D1": "Discount",
        "A2": "Mobile Cover",
        "B2": "25",
        "C2": "199",
        "D2": "0.1",
        "A3": "Charger",
        "B3": "12",
        "C3": "549",
        "D3": "0.05",
        "A4": "Earphones",
        "B4": "18",
        "C4": "899",
        "D4": "0.15",
        "A5": "Power Bank",
        "B5": "9",
        "C5": "1499",
        "D5": "0.2"
      },
      "starter": "",
      "solution": "=B3>10",
      "explain": "Comparison operators (`=`, `<>`, `>`, `<`, `>=`, `<=`) return **TRUE** or **FALSE**. 12 > 10 is TRUE. These logical results are the base of IF() later."
    }
  ]
};
