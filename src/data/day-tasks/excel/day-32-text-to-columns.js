// Day Task (auto-graded practice) for day-32-text-to-columns
export default {
  "lesson": "day-32-text-to-columns",
  "minutes": 20,
  "intro": "Split names, addresses and codes with Text to Columns, and do the same splits with text formulas.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is **Text to Columns**?",
      "options": [
        "Home > Editing",
        "Data > Data Tools > Text to Columns",
        "Insert > Text",
        "Formulas > Text"
      ],
      "answer": 1,
      "explain": "**Data > Data Tools > Text to Columns** (Alt, A, E) opens the 3-step Convert Text to Columns Wizard."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Codes like `MH-PUN-2041` must be split at every hyphen. Which wizard option do you choose in Step 1?",
      "options": [
        "Fixed width",
        "Delimited",
        "General",
        "Text"
      ],
      "answer": 1,
      "explain": "**Delimited** splits wherever a character (comma, space, hyphen in \"Other\") appears. **Fixed width** splits at fixed character positions, useful when every field has the same length."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In Step 3, why would you set a column (e.g. PIN or employee code `00123`) to **Text** format?",
      "options": [
        "To make it bold",
        "So leading zeros are kept",
        "To delete the column",
        "To convert it to a date"
      ],
      "answer": 1,
      "explain": "With General format Excel converts `00123` to the number 123 and drops leading zeros. **Text** keeps them. \"Do not import column (skip)\" removes a column you do not need."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Get the **first name** from A2 with a formula (text before the space).",
      "example": {
        "title": "text before a delimiter",
        "code": "=LEFT(B2, FIND(\"-\", B2)-1)"
      },
      "grid": {
        "A1": "Full Name",
        "B1": "Address",
        "C1": "Code",
        "A2": "Arjun Mehta",
        "B2": "Andheri,Mumbai,400053",
        "C2": "MH-PUN-2041",
        "A3": "Sneha Kulkarni",
        "B3": "Kothrud,Pune,411038",
        "C3": "KA-BLR-1187",
        "A4": "Vikram Singh",
        "B4": "Civil Lines,Jaipur,302006",
        "C4": "DL-NDL-0932"
      },
      "starter": "",
      "solution": "=LEFT(A2,FIND(\" \",A2)-1)",
      "explain": "FIND(\" \",A2) = 6, so LEFT takes 5 characters → **Arjun**. `=TEXTBEFORE(A2,\" \")` (Microsoft 365) also works."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Get the **last name** from A3 (text after the space).",
      "example": {
        "title": "text after a delimiter",
        "code": "=MID(B2, FIND(\",\", B2)+1, 50)"
      },
      "grid": {
        "A1": "Full Name",
        "B1": "Address",
        "C1": "Code",
        "A2": "Arjun Mehta",
        "B2": "Andheri,Mumbai,400053",
        "C2": "MH-PUN-2041",
        "A3": "Sneha Kulkarni",
        "B3": "Kothrud,Pune,411038",
        "C3": "KA-BLR-1187",
        "A4": "Vikram Singh",
        "B4": "Civil Lines,Jaipur,302006",
        "C4": "DL-NDL-0932"
      },
      "starter": "",
      "solution": "=MID(A3,FIND(\" \",A3)+1,100)",
      "explain": "Start one character after the space: **Kulkarni**. `=RIGHT(A3,LEN(A3)-FIND(\" \",A3))` and `=TEXTAFTER(A3,\" \")` also work."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The 6-digit **PIN code** is always the last part of the address. Extract it from B4 as a **number** (so it can be used in calculations).",
      "example": {
        "title": "text to number",
        "code": "=VALUE(RIGHT(A2, 4))"
      },
      "grid": {
        "A1": "Full Name",
        "B1": "Address",
        "C1": "Code",
        "A2": "Arjun Mehta",
        "B2": "Andheri,Mumbai,400053",
        "C2": "MH-PUN-2041",
        "A3": "Sneha Kulkarni",
        "B3": "Kothrud,Pune,411038",
        "C3": "KA-BLR-1187",
        "A4": "Vikram Singh",
        "B4": "Civil Lines,Jaipur,302006",
        "C4": "DL-NDL-0932"
      },
      "starter": "",
      "solution": "=VALUE(RIGHT(B4,6))",
      "explain": "RIGHT(B4,6) gives the text \"302006\"; VALUE converts it into the number **302006**. Text to Columns does the same conversion automatically for General columns."
    }
  ]
};
