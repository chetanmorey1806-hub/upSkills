// Day Task (auto-graded practice) for day-22-nested-if
export default {
  "lesson": "day-22-nested-if",
  "minutes": 25,
  "intro": "Choose between three or more outcomes with nested IF() and IFS(): grades, commission slabs and age categories.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Grade rule: **>= 80 \"A\"**, **>= 60 \"B\"**, **>= 40 \"C\"**, else **\"Fail\"**. Write the grade for Kavya (B4).",
      "example": {
        "title": "nested IF",
        "code": "=IF(C2>=90,\"Gold\",IF(C2>=70,\"Silver\",\"Bronze\"))"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Sales",
        "D1": "Age",
        "A2": "Isha",
        "B2": "92",
        "C2": "65000",
        "D2": "17",
        "A3": "Jay",
        "B3": "74",
        "C3": "180000",
        "D3": "25",
        "A4": "Kavya",
        "B4": "58",
        "C4": "95000",
        "D4": "62",
        "A5": "Laksh",
        "B5": "36",
        "C5": "30000",
        "D5": "40"
      },
      "starter": "",
      "solution": "=IF(B4>=80,\"A\",IF(B4>=60,\"B\",IF(B4>=40,\"C\",\"Fail\")))",
      "explain": "58 is not >= 80, not >= 60, but >= 40 → **C**. When checking \"greater than\", start from the **highest** limit; starting with >=40 would give C to everyone above 40."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Same grade rule using **IFS()** for Isha (B2).",
      "example": {
        "title": "IFS",
        "code": "=IFS(A2>100,\"High\",A2>50,\"Mid\",TRUE,\"Low\")"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Sales",
        "D1": "Age",
        "A2": "Isha",
        "B2": "92",
        "C2": "65000",
        "D2": "17",
        "A3": "Jay",
        "B3": "74",
        "C3": "180000",
        "D3": "25",
        "A4": "Kavya",
        "B4": "58",
        "C4": "95000",
        "D4": "62",
        "A5": "Laksh",
        "B5": "36",
        "C5": "30000",
        "D5": "40"
      },
      "starter": "",
      "solution": "=IFS(B2>=80,\"A\",B2>=60,\"B\",B2>=40,\"C\",TRUE,\"Fail\")",
      "explain": "IFS takes test/value pairs: Isha 92 → **A**. Use `TRUE,\"Fail\"` as the last pair for \"everything else\"; without it IFS returns #N/A when no test is TRUE."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Commission slabs on Sales: **above 1,50,000 → 10%**, **above 75,000 → 7%**, otherwise **5%**. Return the commission **amount** for Jay (C3).",
      "example": {
        "title": "IF with calculations",
        "code": "=IF(B2>50000,B2*0.08,B2*0.03)"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Sales",
        "D1": "Age",
        "A2": "Isha",
        "B2": "92",
        "C2": "65000",
        "D2": "17",
        "A3": "Jay",
        "B3": "74",
        "C3": "180000",
        "D3": "25",
        "A4": "Kavya",
        "B4": "58",
        "C4": "95000",
        "D4": "62",
        "A5": "Laksh",
        "B5": "36",
        "C5": "30000",
        "D5": "40"
      },
      "starter": "",
      "solution": "=IF(C3>150000,C3*10%,IF(C3>75000,C3*7%,C3*5%))",
      "explain": "180000 > 150000 → 10% = **18000**. Each branch returns a calculation. A common mistake is to return only the rate (0.1) when the amount is asked."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Age category for Kavya (D4): **< 18 \"Minor\"**, **< 60 \"Adult\"**, else **\"Senior\"**.",
      "example": {
        "title": "ascending order with <",
        "code": "=IF(A2<10,\"Small\",IF(A2<100,\"Medium\",\"Large\"))"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Sales",
        "D1": "Age",
        "A2": "Isha",
        "B2": "92",
        "C2": "65000",
        "D2": "17",
        "A3": "Jay",
        "B3": "74",
        "C3": "180000",
        "D3": "25",
        "A4": "Kavya",
        "B4": "58",
        "C4": "95000",
        "D4": "62",
        "A5": "Laksh",
        "B5": "36",
        "C5": "30000",
        "D5": "40"
      },
      "starter": "",
      "solution": "=IF(D4<18,\"Minor\",IF(D4<60,\"Adult\",\"Senior\"))",
      "explain": "With \"less than\" tests, start from the **lowest** limit. 62 is not < 18 and not < 60 → **Senior**."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return for B2 = **75**?",
      "code": "  | B\n1 | Marks\n2 | 75\n\n=IF(B2>=40,\"C\",IF(B2>=60,\"B\",IF(B2>=80,\"A\",\"Fail\")))",
      "expected": "C",
      "explain": "The order is wrong! 75 >= 40 is TRUE at the first test, so Excel stops and returns **C**. Always put the highest limit first when using >=."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does IFS return if **none** of its conditions is TRUE and there is no TRUE \"else\" pair?",
      "options": [
        "0",
        "FALSE",
        "#N/A",
        "An empty cell"
      ],
      "answer": 2,
      "explain": "IFS returns **#N/A** when no test matches. Add `TRUE, \"default value\"` as the final pair to handle all other cases."
    }
  ]
};
