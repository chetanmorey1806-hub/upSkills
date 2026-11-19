// Day Task (auto-graded practice) for day-13-min-max-count
export default {
  "lesson": "day-13-min-max-count",
  "minutes": 20,
  "intro": "Find the highest, lowest and count of numbers with MAX(), MIN() and COUNT() on real vendor quotes.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **lowest quotation** in B2:B6 (Rao Enterprises has not sent a quote yet).",
      "example": {
        "title": "MIN of a range",
        "code": "=MIN(C2:C15)"
      },
      "grid": {
        "A1": "Vendor",
        "B1": "Quote",
        "C1": "Delivery Days",
        "A2": "Sharma Traders",
        "B2": "45500",
        "C2": "7",
        "A3": "Gupta & Sons",
        "B3": "43900",
        "C3": "10",
        "A4": "Patel Supplies",
        "B4": "47200",
        "C4": "5",
        "A5": "Rao Enterprises",
        "C5": "6",
        "A6": "Singh Agencies",
        "B6": "44800",
        "C6": "NA"
      },
      "starter": "",
      "solution": "=MIN(B2:B6)",
      "explain": "MIN ignores blank cells, so the empty quote is not treated as 0: lowest = **43900**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **highest quotation**.",
      "example": {
        "title": "MAX of a range",
        "code": "=MAX(D2:D15)"
      },
      "grid": {
        "A1": "Vendor",
        "B1": "Quote",
        "C1": "Delivery Days",
        "A2": "Sharma Traders",
        "B2": "45500",
        "C2": "7",
        "A3": "Gupta & Sons",
        "B3": "43900",
        "C3": "10",
        "A4": "Patel Supplies",
        "B4": "47200",
        "C4": "5",
        "A5": "Rao Enterprises",
        "C5": "6",
        "A6": "Singh Agencies",
        "B6": "44800",
        "C6": "NA"
      },
      "starter": "",
      "solution": "=MAX(B2:B6)",
      "explain": "`=MAX(B2:B6)` = **47200**. MAX and MIN take the same arguments as SUM: ranges, cells or numbers."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many vendors have **sent a quote** (a number in B2:B6)?",
      "example": {
        "title": "COUNT numbers",
        "code": "=COUNT(E2:E50)"
      },
      "grid": {
        "A1": "Vendor",
        "B1": "Quote",
        "C1": "Delivery Days",
        "A2": "Sharma Traders",
        "B2": "45500",
        "C2": "7",
        "A3": "Gupta & Sons",
        "B3": "43900",
        "C3": "10",
        "A4": "Patel Supplies",
        "B4": "47200",
        "C4": "5",
        "A5": "Rao Enterprises",
        "C5": "6",
        "A6": "Singh Agencies",
        "B6": "44800",
        "C6": "NA"
      },
      "starter": "",
      "solution": "=COUNT(B2:B6)",
      "explain": "COUNT counts only cells that contain **numbers**: 4. The blank cell is not counted. COUNTA (next day) would count any non-empty cell."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many vendors have a **numeric** delivery-days value in C2:C6? (\"NA\" is text.)",
      "example": {
        "title": "COUNT ignores text",
        "code": "=COUNT(B2:B9)"
      },
      "grid": {
        "A1": "Vendor",
        "B1": "Quote",
        "C1": "Delivery Days",
        "A2": "Sharma Traders",
        "B2": "45500",
        "C2": "7",
        "A3": "Gupta & Sons",
        "B3": "43900",
        "C3": "10",
        "A4": "Patel Supplies",
        "B4": "47200",
        "C4": "5",
        "A5": "Rao Enterprises",
        "C5": "6",
        "A6": "Singh Agencies",
        "B6": "44800",
        "C6": "NA"
      },
      "starter": "",
      "solution": "=COUNT(C2:C6)",
      "explain": "COUNT ignores text like \"NA\": **4**. This is a quick way to find how many entries are real numbers."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **spread** (range) of the quotes: highest minus lowest.",
      "example": {
        "title": "difference of two functions",
        "code": "=MAX(C2:C9)-MIN(C2:C9)"
      },
      "grid": {
        "A1": "Vendor",
        "B1": "Quote",
        "C1": "Delivery Days",
        "A2": "Sharma Traders",
        "B2": "45500",
        "C2": "7",
        "A3": "Gupta & Sons",
        "B3": "43900",
        "C3": "10",
        "A4": "Patel Supplies",
        "B4": "47200",
        "C4": "5",
        "A5": "Rao Enterprises",
        "C5": "6",
        "A6": "Singh Agencies",
        "B6": "44800",
        "C6": "NA"
      },
      "starter": "",
      "solution": "=MAX(B2:B6)-MIN(B2:B6)",
      "explain": "Spread = MAX - MIN = 47200 - 43900 = **3300**. It shows how far apart the quotes are."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A range has 5, 0, (blank), \"ten\", 12. What does `=COUNT(range)` return?",
      "options": [
        "2",
        "3",
        "4",
        "5"
      ],
      "answer": 1,
      "explain": "COUNT counts **numbers**: 5, 0 and 12 = **3**. Zero is a number, so it counts; the blank and the text \"ten\" do not."
    }
  ]
};
