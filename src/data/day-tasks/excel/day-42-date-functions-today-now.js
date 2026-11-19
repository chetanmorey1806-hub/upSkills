// Day Task (auto-graded practice) for day-42-date-functions-today-now
export default {
  "lesson": "day-42-date-functions-today-now",
  "minutes": 20,
  "intro": "Understand date serial numbers and split dates into day, month and year with DAY(), MONTH() and YEAR().",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the difference between `=TODAY()` and `=NOW()`?",
      "options": [
        "No difference",
        "TODAY gives only the date; NOW gives date and time",
        "NOW gives only the time",
        "TODAY is fixed, NOW changes"
      ],
      "answer": 1,
      "explain": "**TODAY()** returns the current date (time = 0). **NOW()** returns date **and** time. Both update whenever the sheet recalculates. For a fixed date use Ctrl + ;, for a fixed time Ctrl + Shift + ;."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the **month number** of the invoice date in B2.",
      "example": {
        "title": "MONTH",
        "code": "=MONTH(C5)"
      },
      "grid": {
        "A1": "Invoice",
        "B1": "Invoice Date",
        "C1": "Due Date",
        "D1": "DOB",
        "A2": "INV-501",
        "B2": "=DATE(2025,3,18)",
        "C2": "=DATE(2025,4,17)",
        "D2": "=DATE(2001,8,26)",
        "A3": "INV-502",
        "B3": "=DATE(2025,11,5)",
        "C3": "=DATE(2025,12,5)",
        "D3": "=DATE(1995,1,9)"
      },
      "starter": "",
      "solution": "=MONTH(B2)",
      "explain": "B2 is 18-Mar-2025 → **3**. MONTH, DAY and YEAR return numbers you can use in SUMIFS or IF."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the **year** of the date of birth in D3.",
      "example": {
        "title": "YEAR",
        "code": "=YEAR(B7)"
      },
      "grid": {
        "A1": "Invoice",
        "B1": "Invoice Date",
        "C1": "Due Date",
        "D1": "DOB",
        "A2": "INV-501",
        "B2": "=DATE(2025,3,18)",
        "C2": "=DATE(2025,4,17)",
        "D2": "=DATE(2001,8,26)",
        "A3": "INV-502",
        "B3": "=DATE(2025,11,5)",
        "C3": "=DATE(2025,12,5)",
        "D3": "=DATE(1995,1,9)"
      },
      "starter": "",
      "solution": "=YEAR(D3)",
      "explain": "D3 is 9-Jan-1995 → **1995**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many **days** are allowed for payment of INV-501 (Due Date minus Invoice Date)?",
      "example": {
        "title": "date subtraction",
        "code": "=D2-C2"
      },
      "grid": {
        "A1": "Invoice",
        "B1": "Invoice Date",
        "C1": "Due Date",
        "D1": "DOB",
        "A2": "INV-501",
        "B2": "=DATE(2025,3,18)",
        "C2": "=DATE(2025,4,17)",
        "D2": "=DATE(2001,8,26)",
        "A3": "INV-502",
        "B3": "=DATE(2025,11,5)",
        "C3": "=DATE(2025,12,5)",
        "D3": "=DATE(1995,1,9)"
      },
      "starter": "",
      "solution": "=C2-B2",
      "explain": "Dates are serial numbers, so subtracting gives days: 17-Apr - 18-Mar = **30**. If the result shows as a date, change the format to General."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Build the date **one month after** the invoice date of INV-502 with DATE, YEAR, MONTH and DAY (5-Dec-2025).",
      "example": {
        "title": "rebuilding a date",
        "code": "=DATE(YEAR(A2), MONTH(A2), 1)"
      },
      "grid": {
        "A1": "Invoice",
        "B1": "Invoice Date",
        "C1": "Due Date",
        "D1": "DOB",
        "A2": "INV-501",
        "B2": "=DATE(2025,3,18)",
        "C2": "=DATE(2025,4,17)",
        "D2": "=DATE(2001,8,26)",
        "A3": "INV-502",
        "B3": "=DATE(2025,11,5)",
        "C3": "=DATE(2025,12,5)",
        "D3": "=DATE(1995,1,9)"
      },
      "starter": "",
      "solution": "=DATE(YEAR(B3),MONTH(B3)+1,DAY(B3))",
      "explain": "DATE(year, month+1, day) → 5-Dec-2025 (serial 45996). DATE handles month 13 automatically by moving to January of the next year."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula show? (the result is formatted as General)",
      "code": "=DATE(2025,1,1)-DATE(2024,12,25)",
      "expected": "7",
      "explain": "Subtracting two dates gives the number of days between them: 25-Dec to 1-Jan = **7**."
    }
  ]
};
