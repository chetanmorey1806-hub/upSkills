// Day Task (auto-graded practice) for day-15-round-roundup-rounddown-int
export default {
  "lesson": "day-15-round-roundup-rounddown-int",
  "minutes": 20,
  "intro": "Round prices, taxes and quantities correctly with ROUND(), ROUNDUP(), ROUNDDOWN() and INT().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Round the Laptop price (B2) to **2 decimal places** (paise).",
      "example": {
        "title": "ROUND to decimals",
        "code": "=ROUND(C5, 2)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Price",
        "C1": "GST Rate",
        "D1": "Weight kg",
        "A2": "Laptop",
        "B2": "45999.567",
        "C2": "0.18",
        "D2": "2.35",
        "A3": "Mouse",
        "B3": "349.499",
        "C3": "0.18",
        "D3": "0.12",
        "A4": "Desk",
        "B4": "7849.5",
        "C4": "0.12",
        "D4": "18.7"
      },
      "starter": "",
      "solution": "=ROUND(B2,2)",
      "explain": "`=ROUND(B2,2)` = **45999.57**. Unlike decimal formatting, ROUND changes the stored value, so totals match the printed invoice."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Calculate the **GST amount** on the Desk (Price x GST Rate) **rounded to the nearest rupee**.",
      "example": {
        "title": "ROUND a calculation",
        "code": "=ROUND(B3*C3, 0)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Price",
        "C1": "GST Rate",
        "D1": "Weight kg",
        "A2": "Laptop",
        "B2": "45999.567",
        "C2": "0.18",
        "D2": "2.35",
        "A3": "Mouse",
        "B3": "349.499",
        "C3": "0.18",
        "D3": "0.12",
        "A4": "Desk",
        "B4": "7849.5",
        "C4": "0.12",
        "D4": "18.7"
      },
      "starter": "",
      "solution": "=ROUND(B4*C4,0)",
      "explain": "7849.5 x 0.12 = 941.94, rounded to 0 decimals = **942**. Put the whole calculation inside ROUND."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A courier charges per **full kg, always rounding up**. Find the chargeable weight of the Desk (D4).",
      "example": {
        "title": "ROUNDUP",
        "code": "=ROUNDUP(B6, 0)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Price",
        "C1": "GST Rate",
        "D1": "Weight kg",
        "A2": "Laptop",
        "B2": "45999.567",
        "C2": "0.18",
        "D2": "2.35",
        "A3": "Mouse",
        "B3": "349.499",
        "C3": "0.18",
        "D3": "0.12",
        "A4": "Desk",
        "B4": "7849.5",
        "C4": "0.12",
        "D4": "18.7"
      },
      "starter": "",
      "solution": "=ROUNDUP(D4,0)",
      "explain": "18.7 kg is charged as **19** kg. ROUNDUP always rounds away from zero, even 18.1 would become 19."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Round the Laptop price **down to the nearest hundred** (for a \"starting from\" price tag).",
      "example": {
        "title": "negative digits",
        "code": "=ROUND(B4, -3)   ← nearest thousand"
      },
      "grid": {
        "A1": "Item",
        "B1": "Price",
        "C1": "GST Rate",
        "D1": "Weight kg",
        "A2": "Laptop",
        "B2": "45999.567",
        "C2": "0.18",
        "D2": "2.35",
        "A3": "Mouse",
        "B3": "349.499",
        "C3": "0.18",
        "D3": "0.12",
        "A4": "Desk",
        "B4": "7849.5",
        "C4": "0.12",
        "D4": "18.7"
      },
      "starter": "",
      "solution": "=ROUNDDOWN(B2,-2)",
      "explain": "A negative num_digits rounds to the left of the decimal point: -2 = hundreds. 45999.567 → **45900**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What will this formula show?",
      "code": "=INT(-7.4)",
      "expected": "-8",
      "explain": "INT rounds **down to the next lower integer**. For a negative number that means further from zero: **-8**. ROUNDDOWN(-7.4,0) would give -7."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which function should you use for \"**number of complete boxes**\" when 250 pens are packed 12 per box?",
      "options": [
        "=ROUND(250/12,0)",
        "=INT(250/12)",
        "=ROUNDUP(250/12,0)",
        "=MOD(250,12)"
      ],
      "answer": 1,
      "explain": "250/12 = 20.83. Only **20** boxes are complete, so use `=INT(250/12)` (or ROUNDDOWN). ROUND would give 21, which is a box you cannot fill. ROUNDUP answers \"boxes needed\"."
    }
  ]
};
