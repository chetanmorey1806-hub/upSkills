// Day Task (auto-graded practice) for day-43-eomonth-datedif-networkdays-workday
export default {
  "lesson": "day-43-eomonth-datedif-networkdays-workday",
  "minutes": 25,
  "intro": "Use EOMONTH(), DATEDIF(), NETWORKDAYS() and WORKDAY() for month-ends, service periods and working days.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **last day of the month** of Mohan's join date (B2).",
      "example": {
        "title": "EOMONTH",
        "code": "=EOMONTH(A2, 1)   ← end of next month"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Join Date",
        "C1": "Today",
        "D1": "Leave From",
        "E1": "Leave To",
        "A2": "Mohan",
        "B2": "=DATE(2019,6,15)",
        "C2": "=DATE(2025,11,18)",
        "D2": "=DATE(2025,11,3)",
        "E2": "=DATE(2025,11,14)",
        "A3": "Nalini",
        "B3": "=DATE(2022,1,31)",
        "C3": "=DATE(2025,11,18)",
        "D3": "=DATE(2025,12,1)",
        "E3": "=DATE(2025,12,31)"
      },
      "starter": "",
      "solution": "=EOMONTH(B2,0)",
      "explain": "EOMONTH(start_date, 0) = end of the same month → 30-Jun-2019 (serial 43646). Format the cell as a date to read it."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find Mohan's **completed years of service** from B2 to C2.",
      "example": {
        "title": "DATEDIF years",
        "code": "=DATEDIF(B5, TODAY(), \"Y\")"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Join Date",
        "C1": "Today",
        "D1": "Leave From",
        "E1": "Leave To",
        "A2": "Mohan",
        "B2": "=DATE(2019,6,15)",
        "C2": "=DATE(2025,11,18)",
        "D2": "=DATE(2025,11,3)",
        "E2": "=DATE(2025,11,14)",
        "A3": "Nalini",
        "B3": "=DATE(2022,1,31)",
        "C3": "=DATE(2025,11,18)",
        "D3": "=DATE(2025,12,1)",
        "E3": "=DATE(2025,12,31)"
      },
      "starter": "",
      "solution": "=DATEDIF(B2,C2,\"Y\")",
      "explain": "15-Jun-2019 to 18-Nov-2025 = **6** complete years. Unit \"Y\" = years, \"M\" = months, \"D\" = days, \"YM\" = months after full years."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Find the **extra months** after Mohan's complete years (the \"6 years **5 months**\" part).",
      "example": {
        "title": "DATEDIF months",
        "code": "=DATEDIF(B2, C2, \"YM\")"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Join Date",
        "C1": "Today",
        "D1": "Leave From",
        "E1": "Leave To",
        "A2": "Mohan",
        "B2": "=DATE(2019,6,15)",
        "C2": "=DATE(2025,11,18)",
        "D2": "=DATE(2025,11,3)",
        "E2": "=DATE(2025,11,14)",
        "A3": "Nalini",
        "B3": "=DATE(2022,1,31)",
        "C3": "=DATE(2025,11,18)",
        "D3": "=DATE(2025,12,1)",
        "E3": "=DATE(2025,12,31)"
      },
      "starter": "",
      "solution": "=DATEDIF(B2,C2,\"YM\")",
      "explain": "\"YM\" ignores full years: June to November = **5** months."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Count the **working days** (Mon-Fri) of Mohan's leave from D2 to E2.",
      "example": {
        "title": "NETWORKDAYS",
        "code": "=NETWORKDAYS(A2, B2, $H$2:$H$10)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Join Date",
        "C1": "Today",
        "D1": "Leave From",
        "E1": "Leave To",
        "A2": "Mohan",
        "B2": "=DATE(2019,6,15)",
        "C2": "=DATE(2025,11,18)",
        "D2": "=DATE(2025,11,3)",
        "E2": "=DATE(2025,11,14)",
        "A3": "Nalini",
        "B3": "=DATE(2022,1,31)",
        "C3": "=DATE(2025,11,18)",
        "D3": "=DATE(2025,12,1)",
        "E3": "=DATE(2025,12,31)"
      },
      "starter": "",
      "solution": "=NETWORKDAYS(D2,E2)",
      "explain": "3-Nov-2025 (Mon) to 14-Nov-2025 (Fri) is two full weeks = **10** working days. Both start and end dates are included."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which function gives the date **10 working days after** an order date (skipping weekends and listed holidays)?",
      "options": [
        "=NETWORKDAYS(A2,10)",
        "=WORKDAY(A2,10,Holidays)",
        "=EOMONTH(A2,10)",
        "=A2+10"
      ],
      "answer": 1,
      "explain": "**WORKDAY(start_date, days, [holidays])** returns a future date skipping weekends and holidays. NETWORKDAYS does the reverse: it counts working days between two dates. A2+10 counts calendar days."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Many Indian offices work **Monday to Saturday**. Which function counts working days with **only Sunday** as the weekend?",
      "options": [
        "NETWORKDAYS",
        "NETWORKDAYS.INTL with weekend code 11",
        "DATEDIF",
        "WORKDAY"
      ],
      "answer": 1,
      "explain": "**NETWORKDAYS.INTL(start, end, 11)** treats only Sunday as the weekend (code 11). Similarly, WORKDAY.INTL handles custom weekends for due dates."
    }
  ]
};
