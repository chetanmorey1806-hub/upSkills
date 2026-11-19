// Day Task (auto-graded practice) for day-16-mod-abs-sqrt-power
export default {
  "lesson": "day-16-mod-abs-sqrt-power",
  "minutes": 20,
  "intro": "Use MOD() for remainders, ABS() for variances, SQRT() and POWER() for maths and compound interest.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Soap: 250 units are packed 12 per box. How many **loose units** are left over?",
      "example": {
        "title": "MOD",
        "code": "=MOD(B5, C5)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Units",
        "C1": "Per Box",
        "D1": "Target",
        "E1": "Actual",
        "F1": "Minutes",
        "A2": "Soap",
        "B2": "250",
        "C2": "12",
        "D2": "5000",
        "E2": "4620",
        "F2": "135",
        "A3": "Shampoo",
        "B3": "96",
        "C3": "24",
        "D3": "3000",
        "E3": "3410",
        "F3": "75",
        "A4": "Biscuits",
        "B4": "410",
        "C4": "36",
        "D4": "4500",
        "E4": "4500",
        "F4": "200"
      },
      "starter": "",
      "solution": "=MOD(B2,C2)",
      "explain": "`=MOD(250,12)` = **10** (20 full boxes use 240 units). MOD returns the remainder after division."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **variance size** between Target and Actual for Soap without a minus sign.",
      "example": {
        "title": "ABS",
        "code": "=ABS(C4-B4)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Units",
        "C1": "Per Box",
        "D1": "Target",
        "E1": "Actual",
        "F1": "Minutes",
        "A2": "Soap",
        "B2": "250",
        "C2": "12",
        "D2": "5000",
        "E2": "4620",
        "F2": "135",
        "A3": "Shampoo",
        "B3": "96",
        "C3": "24",
        "D3": "3000",
        "E3": "3410",
        "F3": "75",
        "A4": "Biscuits",
        "B4": "410",
        "C4": "36",
        "D4": "4500",
        "E4": "4500",
        "F4": "200"
      },
      "starter": "",
      "solution": "=ABS(E2-D2)",
      "explain": "4620 - 5000 = -380. ABS removes the sign: **380**. Use ABS when only the size of the difference matters."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Convert Soap's **135 minutes** into the **leftover minutes** after full hours (e.g. 135 min = 2 h 15 min → 15).",
      "example": {
        "title": "MOD by 60",
        "code": "=MOD(A9, 60)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Units",
        "C1": "Per Box",
        "D1": "Target",
        "E1": "Actual",
        "F1": "Minutes",
        "A2": "Soap",
        "B2": "250",
        "C2": "12",
        "D2": "5000",
        "E2": "4620",
        "F2": "135",
        "A3": "Shampoo",
        "B3": "96",
        "C3": "24",
        "D3": "3000",
        "E3": "3410",
        "F3": "75",
        "A4": "Biscuits",
        "B4": "410",
        "C4": "36",
        "D4": "4500",
        "E4": "4500",
        "F4": "200"
      },
      "starter": "",
      "solution": "=MOD(F2,60)",
      "explain": "`=MOD(135,60)` = **15** minutes; `=INT(135/60)` gives the 2 hours. This is the classic time-splitting use of MOD."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Compound interest: ₹50,000 at **8%** per year for **5 years**. Use POWER to find the final amount `P × (1 + r)^n`. Round to 2 decimals.",
      "example": {
        "title": "POWER",
        "code": "=POWER(1+B2, 3)"
      },
      "grid": {
        "A1": "Principal",
        "B1": "Rate",
        "C1": "Years",
        "A2": "50000",
        "B2": "0.08",
        "C2": "5"
      },
      "starter": "",
      "solution": "=ROUND(A2*POWER(1+B2,C2),2)",
      "explain": "50000 x 1.08^5 = **73466.40** (73466.4). `POWER(1+B2, C2)` is the same as `(1+B2)^C2`. Brackets around 1+B2 are essential."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What will this formula show?",
      "code": "=SQRT(144)+MOD(17,5)",
      "expected": "14",
      "explain": "SQRT(144) = 12 and MOD(17,5) = 2 (17 = 3x5 + 2), so the result is **14**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=SQRT(-16)` return?",
      "options": [
        "-4",
        "4",
        "#NUM!",
        "#VALUE!"
      ],
      "answer": 2,
      "explain": "A negative number has no real square root, so Excel returns **#NUM!**. Use `=SQRT(ABS(A1))` if you need the root of the size of the number."
    }
  ]
};
