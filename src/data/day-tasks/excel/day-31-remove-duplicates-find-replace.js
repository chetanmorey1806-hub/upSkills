// Day Task (auto-graded practice) for day-31-remove-duplicates-find-replace
export default {
  "lesson": "day-31-remove-duplicates-find-replace",
  "minutes": 20,
  "intro": "Clean lists with Remove Duplicates and Find & Replace, and check duplicates or replace text with formulas.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens **Find and Replace** on the Replace tab?",
      "accept": [
        "Ctrl+H"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*H\\s*$"
      ],
      "explain": "**Ctrl + H** opens Replace; **Ctrl + F** opens Find."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Remove Duplicates on Cust ID finds two rows with **C101**. Which one does Excel keep?",
      "options": [
        "The last one",
        "The first one (top-most)",
        "Both",
        "Neither"
      ],
      "answer": 1,
      "explain": "Excel keeps the **first occurrence** (top-most row) and deletes the later ones. Sort first if you want to keep, e.g., the latest record. Always keep a backup copy before removing duplicates."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In Find & Replace, which wildcard matches **exactly one** character?",
      "options": [
        "*",
        "?",
        "~",
        "#"
      ],
      "answer": 1,
      "explain": "`?` = any **single** character, `*` = any number of characters, `~` before a wildcard finds the actual * or ? character (e.g. `~*`)."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Before deleting anything, check duplicates: how many times does the Cust ID in **A4** appear in A2:A6?",
      "example": {
        "title": "duplicate check",
        "code": "=COUNTIF($B$2:$B$500,B2)"
      },
      "grid": {
        "A1": "Cust ID",
        "B1": "Name",
        "C1": "City",
        "D1": "Phone",
        "A2": "C101",
        "B2": "Ramesh Patil",
        "C2": "Pune",
        "D2": "98220-11111",
        "A3": "C102",
        "B3": "Sunita Rao",
        "C3": "Hyderabad",
        "D3": "99000-22222",
        "A4": "C101",
        "B4": "Ramesh Patil",
        "C4": "Pune",
        "D4": "98220-11111",
        "A5": "C103",
        "B5": "Imran Shaikh",
        "C5": "Bombay",
        "D5": "97300-33333",
        "A6": "C104",
        "B6": "Kavita Joshi",
        "C6": "Bombay",
        "D6": "90110-44444"
      },
      "starter": "",
      "solution": "=COUNTIF($A$2:$A$6,A4)",
      "explain": "C101 appears **2** times → duplicate. A COUNTIF helper column lets you review duplicates before removing them."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The city \"Bombay\" should be \"Mumbai\". Instead of Replace, write a formula that returns the corrected city for **C5**.",
      "example": {
        "title": "SUBSTITUTE",
        "code": "=SUBSTITUTE(A2,\"Ltd\",\"Limited\")"
      },
      "grid": {
        "A1": "Cust ID",
        "B1": "Name",
        "C1": "City",
        "D1": "Phone",
        "A2": "C101",
        "B2": "Ramesh Patil",
        "C2": "Pune",
        "D2": "98220-11111",
        "A3": "C102",
        "B3": "Sunita Rao",
        "C3": "Hyderabad",
        "D3": "99000-22222",
        "A4": "C101",
        "B4": "Ramesh Patil",
        "C4": "Pune",
        "D4": "98220-11111",
        "A5": "C103",
        "B5": "Imran Shaikh",
        "C5": "Bombay",
        "D5": "97300-33333",
        "A6": "C104",
        "B6": "Kavita Joshi",
        "C6": "Bombay",
        "D6": "90110-44444"
      },
      "starter": "",
      "solution": "=SUBSTITUTE(C5,\"Bombay\",\"Mumbai\")",
      "explain": "SUBSTITUTE(text, old, new) → **Mumbai**. Find & Replace (Ctrl+H) changes cells in place; SUBSTITUTE keeps the original and gives a cleaned copy."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Remove the hyphen from the phone number in **D2** (result `9822011111`).",
      "example": {
        "title": "remove a character",
        "code": "=SUBSTITUTE(B2,\" \",\"\")"
      },
      "grid": {
        "A1": "Cust ID",
        "B1": "Name",
        "C1": "City",
        "D1": "Phone",
        "A2": "C101",
        "B2": "Ramesh Patil",
        "C2": "Pune",
        "D2": "98220-11111",
        "A3": "C102",
        "B3": "Sunita Rao",
        "C3": "Hyderabad",
        "D3": "99000-22222",
        "A4": "C101",
        "B4": "Ramesh Patil",
        "C4": "Pune",
        "D4": "98220-11111",
        "A5": "C103",
        "B5": "Imran Shaikh",
        "C5": "Bombay",
        "D5": "97300-33333",
        "A6": "C104",
        "B6": "Kavita Joshi",
        "C6": "Bombay",
        "D6": "90110-44444"
      },
      "starter": "",
      "solution": "=SUBSTITUTE(D2,\"-\",\"\")",
      "explain": "Replacing \"-\" with an empty text \"\" removes it: **9822011111**. In Find & Replace you would leave \"Replace with\" empty."
    }
  ]
};
