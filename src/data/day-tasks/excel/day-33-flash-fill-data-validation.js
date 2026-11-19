// Day Task (auto-graded practice) for day-33-flash-fill-data-validation
export default {
  "lesson": "day-33-flash-fill-data-validation",
  "minutes": 20,
  "intro": "Use Flash Fill to extract and reformat text, and Data Validation (including custom formulas) to stop wrong entries.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut runs **Flash Fill**?",
      "accept": [
        "Ctrl+E"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*E\\s*$"
      ],
      "explain": "Type one or two examples, then press **Ctrl + E** (or Data > Data Tools > Flash Fill)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Flash Fill results **do not update** when the source data changes. Why?",
      "options": [
        "Flash Fill is broken",
        "Flash Fill types static values, not formulas",
        "Calculation is set to manual",
        "The sheet is protected"
      ],
      "answer": 1,
      "explain": "Flash Fill writes **fixed values**. If the source changes, run it again or use formulas (LEFT, PROPER, etc.), which update automatically."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are valid options in **Data Validation > Settings > Allow**? (choose all that apply)",
      "options": [
        "Whole number",
        "Decimal",
        "List",
        "Date",
        "Text length",
        "Custom",
        "Colour"
      ],
      "answers": [
        0,
        1,
        2,
        3,
        4,
        5
      ],
      "explain": "Allow options: Any value, **Whole number, Decimal, List, Date, Time, Text length, Custom**. There is no colour rule."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Do with a formula what Flash Fill would do: get the **user name** before the @ from the email in C2 (`priya.nair`).",
      "example": {
        "title": "text before @",
        "code": "=LEFT(A2, FIND(\"-\", A2)-1)"
      },
      "grid": {
        "A1": "Name",
        "B1": "Mobile",
        "C1": "Email",
        "D1": "Age",
        "E1": "Join Date OK?",
        "A2": "priya nair",
        "B2": "9845012345",
        "C2": "priya.nair@abc.in",
        "D2": "24",
        "A3": "ROHIT JAIN",
        "B3": "98450",
        "C3": "rohit.jain@abc.in",
        "D3": "17",
        "A4": "meena das",
        "B4": "9988776655",
        "C4": "meena.das@abc.in",
        "D4": "61"
      },
      "starter": "",
      "solution": "=LEFT(C2,FIND(\"@\",C2)-1)",
      "explain": "FIND(\"@\") gives the position of @; LEFT takes everything before it → **priya.nair**. Unlike Flash Fill, the formula updates if the email changes."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A **Custom** validation rule for mobile numbers must return TRUE only for 10-character entries. Write that rule for **B3** (it should return FALSE here).",
      "example": {
        "title": "custom rule",
        "code": "=LEN(A2)=6"
      },
      "grid": {
        "A1": "Name",
        "B1": "Mobile",
        "C1": "Email",
        "D1": "Age",
        "E1": "Join Date OK?",
        "A2": "priya nair",
        "B2": "9845012345",
        "C2": "priya.nair@abc.in",
        "D2": "24",
        "A3": "ROHIT JAIN",
        "B3": "98450",
        "C3": "rohit.jain@abc.in",
        "D3": "17",
        "A4": "meena das",
        "B4": "9988776655",
        "C4": "meena.das@abc.in",
        "D4": "61"
      },
      "starter": "",
      "solution": "=LEN(B3)=10",
      "explain": "`=LEN(B3)=10` returns TRUE/FALSE; Data Validation allows the entry only when it is TRUE. 98450 has 5 characters → **FALSE**, so it would be rejected."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Write a custom validation rule for Age in **D3**: allow only **18 to 60** (inclusive). It should return FALSE for 17.",
      "example": {
        "title": "range rule",
        "code": "=AND(B2>=1, B2<=100)"
      },
      "grid": {
        "A1": "Name",
        "B1": "Mobile",
        "C1": "Email",
        "D1": "Age",
        "E1": "Join Date OK?",
        "A2": "priya nair",
        "B2": "9845012345",
        "C2": "priya.nair@abc.in",
        "D2": "24",
        "A3": "ROHIT JAIN",
        "B3": "98450",
        "C3": "rohit.jain@abc.in",
        "D3": "17",
        "A4": "meena das",
        "B4": "9988776655",
        "C4": "meena.das@abc.in",
        "D4": "61"
      },
      "starter": "",
      "solution": "=AND(D3>=18,D3<=60)",
      "explain": "AND makes both limits required: 17 fails → **FALSE**. (For this simple case, Allow: Whole number between 18 and 60 also works.)"
    }
  ]
};
