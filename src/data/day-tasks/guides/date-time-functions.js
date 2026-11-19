// Day Task (auto-graded practice) for date-time-functions
export default {
  "lesson": "date-time-functions",
  "minutes": 22,
  "intro": "Revise date serial numbers, DATE/YEAR/MONTH, DATEDIF, EDATE/EOMONTH, NETWORKDAYS and WEEKDAY.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "How does Excel store the date **1-Jan-2025**?",
      "options": [
        "As the text \"01-01-2025\"",
        "As a serial number (45658) with a date format on top",
        "As three numbers: day, month, year",
        "As a time value"
      ],
      "answer": 1,
      "explain": "Dates are **serial numbers** counted from 1-Jan-1900 (= 1), so 1-Jan-2025 = 45658. That is why you can subtract dates to get days and add numbers to get future dates."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Completed **years of service** for **Asha** (row 2) on the report date in **B6**.",
      "example": {
        "title": "DATEDIF for whole years",
        "code": "=DATEDIF(C2,TODAY(),\"y\")"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joining",
        "C1": "Invoice date",
        "D1": "Due days",
        "A2": "Asha",
        "B2": "=DATE(2019,7,15)",
        "C2": "=DATE(2025,3,10)",
        "D2": "30",
        "A3": "Ravi",
        "B3": "=DATE(2022,11,1)",
        "C3": "=DATE(2025,1,31)",
        "D3": "45",
        "A4": "Meena",
        "B4": "=DATE(2016,2,29)",
        "C4": "=DATE(2025,6,5)",
        "D4": "15",
        "A6": "Report date",
        "B6": "=DATE(2025,6,30)"
      },
      "starter": "",
      "solution": "=DATEDIF(B2,B6,\"y\")",
      "explain": "15-Jul-2019 to 30-Jun-2025 = **5** complete years (the 6th year completes on 15-Jul). `\"y\"` = whole years, `\"m\"` months, `\"d\"` days, `\"ym\"` leftover months. Start date must come first."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Invoices are due at the **end of the month** that is **1 month after** the invoice date. Due date for **Ravi** (C3)?",
      "example": {
        "title": "month-end dates",
        "code": "=EOMONTH(A2,0)   → last day of the same month"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joining",
        "C1": "Invoice date",
        "D1": "Due days",
        "A2": "Asha",
        "B2": "=DATE(2019,7,15)",
        "C2": "=DATE(2025,3,10)",
        "D2": "30",
        "A3": "Ravi",
        "B3": "=DATE(2022,11,1)",
        "C3": "=DATE(2025,1,31)",
        "D3": "45",
        "A4": "Meena",
        "B4": "=DATE(2016,2,29)",
        "C4": "=DATE(2025,6,5)",
        "D4": "15",
        "A6": "Report date",
        "B6": "=DATE(2025,6,30)"
      },
      "starter": "",
      "solution": "=EOMONTH(C3,1)",
      "explain": "EOMONTH(31-Jan-2025, 1) = **28-Feb-2025** (serial 45716). EOMONTH always lands on the month end, which EDATE cannot do. Format the cell as a date to see it."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many **working days** (Mon-Fri) are there from Meena's invoice date (**C4**) to the report date (**B6**), counting both days?",
      "example": {
        "title": "working days between dates",
        "code": "=NETWORKDAYS(B2,C2,$H$2:$H$12)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Joining",
        "C1": "Invoice date",
        "D1": "Due days",
        "A2": "Asha",
        "B2": "=DATE(2019,7,15)",
        "C2": "=DATE(2025,3,10)",
        "D2": "30",
        "A3": "Ravi",
        "B3": "=DATE(2022,11,1)",
        "C3": "=DATE(2025,1,31)",
        "D3": "45",
        "A4": "Meena",
        "B4": "=DATE(2016,2,29)",
        "C4": "=DATE(2025,6,5)",
        "D4": "15",
        "A6": "Report date",
        "B6": "=DATE(2025,6,30)"
      },
      "starter": "",
      "solution": "=NETWORKDAYS(C4,B6)",
      "explain": "5-Jun-2025 to 30-Jun-2025 has **18** working days. NETWORKDAYS excludes Saturdays and Sundays and can also exclude a holiday list as the 3rd argument. Plain subtraction (25) counts weekends too."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return? (1-Jan-2025 was a Wednesday)",
      "code": "=WEEKDAY(DATE(2025,1,1))",
      "expected": "4",
      "explain": "With the default return_type 1, Sunday = 1 ... Saturday = 7, so Wednesday = **4**. With return_type 2 (Monday = 1) it would be 3."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Why does `=EDATE(DATE(2025,1,31),1)` return **28-Feb-2025** and not 3-Mar?",
      "options": [
        "It is a bug",
        "EDATE moves by whole months and, if the day does not exist, returns the last day of the target month",
        "February always has 28 days",
        "EDATE ignores the day"
      ],
      "answer": 1,
      "explain": "EDATE adds months and **clips** to the month end when needed. Adding 30 days instead would give 2-Mar, which is why EDATE is used for EMI and renewal dates."
    }
  ]
};
