// Day Task (auto-graded practice) for extra-17-let
export default {
  "lesson": "extra-17-let",
  "minutes": 18,
  "intro": "Name intermediate results inside a formula with LET() to make long formulas shorter, clearer and faster.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "In `=LET(name1, value1, name2, value2, calculation)`, which argument is the **result** of the formula?",
      "options": [
        "name1",
        "value1",
        "The last argument (calculation)",
        "name2"
      ],
      "answer": 2,
      "explain": "LET takes pairs of **name, value** and then one final **calculation** that uses those names. The value of that last argument is what the cell shows."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return?",
      "code": "=LET(x, 5, y, x*2, x+y)",
      "expected": "15",
      "explain": "x = 5, y = x × 2 = 10, calculation x + y = **15**. Later names can use earlier names."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are **valid** names inside LET? (choose all that apply)",
      "options": [
        "total",
        "gst_rate",
        "qty2",
        "A1",
        "net amount",
        "R2C3"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "LET names follow named-range rules: start with a letter, no spaces, and they must **not look like cell references** (A1, R2C3)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "This formula pays a bonus: `=LET(t, SUM(C2:C6), IF(t>100000, t*5%, t*2%))`. Write a formula that returns the **same bonus without LET**.",
      "example": {
        "title": "a LET formula and its long version",
        "code": "=LET(a, B2*C2, IF(a>500, a-50, a))\n=IF(B2*C2>500, B2*C2-50, B2*C2)"
      },
      "grid": {
        "A1": "Month",
        "B1": "Rep",
        "C1": "Sales",
        "A2": "Jan",
        "B2": "Asha",
        "C2": "18500",
        "A3": "Feb",
        "B3": "Asha",
        "C3": "24300",
        "A4": "Mar",
        "B4": "Asha",
        "C4": "21800",
        "A5": "Apr",
        "B5": "Asha",
        "C5": "19750",
        "A6": "May",
        "B6": "Asha",
        "C6": "26400"
      },
      "starter": "",
      "solution": "=IF(SUM(C2:C6)>100000,SUM(C2:C6)*0.05,SUM(C2:C6)*0.02)",
      "explain": "Total = 110,750 > 100,000, so bonus = 5% = **5537.5**. Without LET you repeat `SUM(C2:C6)` three times; LET calculates it once and names it `t`, which is shorter and faster."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the LET formula that adds 18% GST: `=LET(amt, B2*C2, gst, amt*18%, ______)` (type only the last argument)",
      "accept": [
        "amt+gst",
        "gst+amt"
      ],
      "explain": "The calculation uses the names defined before it: `amt+gst`. Leaving out the last argument gives an error because LET always needs a final calculation."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Why is LET often **faster** than the same formula without it?",
      "options": [
        "It uses less memory for text",
        "A repeated expression is calculated only once and reused",
        "It turns off automatic calculation",
        "It caches results between workbooks"
      ],
      "answer": 1,
      "explain": "In `=IF(VLOOKUP(...)>0, VLOOKUP(...)*2, 0)` the lookup runs twice. With LET it runs **once** and the name is reused, which matters on thousands of rows."
    }
  ]
};
