// Day Task (auto-graded practice) for day-34-dropdown-lists-input-messages-error-alerts
export default {
  "lesson": "day-34-dropdown-lists-input-messages-error-alerts",
  "minutes": 20,
  "intro": "Create drop-down lists with input messages and the right error alert style, and check entries against a list.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you create a drop-down list?",
      "options": [
        "Data > Data Tools > Data Validation > Allow: List",
        "Insert > List",
        "Home > Format > List",
        "Developer > List"
      ],
      "answer": 0,
      "explain": "**Data > Data Tools > Data Validation**, set Allow to **List** and type the items (Sales,HR,IT) or point the Source to a range like `=$A$2:$A$5`."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which **Error Alert** styles let the user **keep** an invalid value after a warning? (choose all that apply)",
      "options": [
        "Stop",
        "Warning",
        "Information"
      ],
      "answers": [
        1,
        2
      ],
      "explain": "**Stop** blocks invalid entries completely. **Warning** asks \"Continue?\" (Yes keeps it) and **Information** only informs (OK keeps it)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "When typing list items directly in the Source box, which character separates them (Indian/US regional settings)?",
      "options": [
        "Semicolon ;",
        "Comma ,",
        "Space",
        "Hyphen -"
      ],
      "answer": 1,
      "explain": "Type `Sales,HR,Accounts,IT` separated by **commas**. For a list that grows, use a range or an Excel Table as the source instead of typed items."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the purpose of the **Input Message** tab?",
      "options": [
        "Shows a tip when the cell is selected",
        "Shows an error after a wrong entry",
        "Sorts the list",
        "Deletes invalid data"
      ],
      "answer": 0,
      "explain": "The Input Message appears like a small note when the user **selects** the cell, e.g. \"Choose a department from the list\". The Error Alert appears only after a wrong entry."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Some departments were typed before the drop-down existed. Check whether **D3** (\"Acounts\") is a valid department from A2:A5: return TRUE if it appears in the list (COUNTIF > 0).",
      "example": {
        "title": "is the value in a list?",
        "code": "=COUNTIF($F$2:$F$10, B2)>0"
      },
      "grid": {
        "A1": "Department List",
        "C1": "Entry",
        "D1": "Dept typed",
        "A2": "Sales",
        "C2": "1",
        "D2": "Sales",
        "A3": "HR",
        "C3": "2",
        "D3": "Acounts",
        "A4": "Accounts",
        "C4": "3",
        "D4": "HR",
        "A5": "IT",
        "C5": "4",
        "D5": "Marketing"
      },
      "starter": "",
      "solution": "=COUNTIF($A$2:$A$5,D3)>0",
      "explain": "COUNTIF finds 0 matches for the misspelt \"Acounts\" → **FALSE**. The same idea is used as a Custom validation rule or with Data > Circle Invalid Data."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "How many entries in D2:D5 are **valid** departments? Check each entry with COUNTIF against A2:A5 and add the results (a TRUE counts as 1 when added).",
      "example": {
        "title": "add several checks",
        "code": "=(COUNTIF($F$2:$F$9,B2)>0)+(COUNTIF($F$2:$F$9,B3)>0)"
      },
      "grid": {
        "A1": "Department List",
        "C1": "Entry",
        "D1": "Dept typed",
        "A2": "Sales",
        "C2": "1",
        "D2": "Sales",
        "A3": "HR",
        "C3": "2",
        "D3": "Acounts",
        "A4": "Accounts",
        "C4": "3",
        "D4": "HR",
        "A5": "IT",
        "C5": "4",
        "D5": "Marketing"
      },
      "starter": "",
      "solution": "=(COUNTIF(A2:A5,D2)>0)+(COUNTIF(A2:A5,D3)>0)+(COUNTIF(A2:A5,D4)>0)+(COUNTIF(A2:A5,D5)>0)",
      "explain": "Sales and HR are valid; \"Acounts\" (misspelt) and \"Marketing\" are not in the list → **2**. Adding TRUE/FALSE values turns them into 1/0. In the real sheet, a drop-down prevents such entries from the start."
    }
  ]
};
