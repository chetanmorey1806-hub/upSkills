// Day Task (auto-graded practice) for data-cleaning
export default {
  "lesson": "data-cleaning",
  "minutes": 20,
  "intro": "Revise cleaning messy data: TRIM/CLEAN/SUBSTITUTE, text-numbers, dates, duplicates, Go To Special and Find & Replace.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Some customer names were exported with a **hyphen** instead of a space and with extra spaces (e.g. \"Ravi-Kumar \"). Clean **A3** so it becomes \"Ravi Kumar\": replace the hyphen with a space, then TRIM.",
      "example": {
        "title": "replace, then trim",
        "code": "=TRIM(SUBSTITUTE(A2,\"_\",\" \"))"
      },
      "grid": {
        "A1": "Customer",
        "B1": "City",
        "A2": "  Asha  Patil",
        "B2": "Pune",
        "A3": "Ravi-Kumar ",
        "B3": "Delhi",
        "A4": "Imran  Shaikh",
        "B4": "Mumbai"
      },
      "starter": "",
      "solution": "=TRIM(SUBSTITUTE(A3,\"-\",\" \"))",
      "explain": "SUBSTITUTE replaces the unwanted character first, then TRIM removes leading/trailing spaces and doubles → **Ravi Kumar**. For web data the real combo is `=TRIM(CLEAN(SUBSTITUTE(A3,CHAR(160),\" \")))`."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Amounts were imported as text with a \"Rs.\" prefix, e.g. \"Rs. 4,500\". Convert **B2** into a real number.",
      "example": {
        "title": "two SUBSTITUTEs then VALUE",
        "code": "=VALUE(SUBSTITUTE(SUBSTITUTE(C2,\"$\",\"\"),\",\",\"\"))"
      },
      "grid": {
        "A1": "Invoice",
        "B1": "Amount",
        "A2": "INV-1",
        "B2": "Rs. 4,500",
        "A3": "INV-2",
        "B3": "Rs. 12,750",
        "A4": "INV-3",
        "B4": "Rs. 980"
      },
      "starter": "",
      "solution": "=VALUE(SUBSTITUTE(SUBSTITUTE(B2,\"Rs. \",\"\"),\",\",\"\"))",
      "explain": "Remove \"Rs. \" and the commas, then VALUE converts \"4500\" to **4500**. A number stored as text aligns left and is ignored by SUM, which is why totals look too small."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want to fill **blank cells** in column A with the value from the cell above. What is the fast method?",
      "options": [
        "Type each value by hand",
        "Select the column > Go To Special (F5 > Special) > Blanks, type = and press Up Arrow, then Ctrl+Enter",
        "Data > Remove Duplicates",
        "Sort the column"
      ],
      "answer": 1,
      "explain": "**Go To Special > Blanks** selects only the empty cells; `=` + Up Arrow builds a formula pointing to the cell above, and **Ctrl + Enter** fills all selected cells at once. Then Paste Values to fix them."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In **Find & Replace**, how do you find the literal asterisk character `*` (not \"any characters\")?",
      "options": [
        "*",
        "~*",
        "\\*",
        "\"*\""
      ],
      "answer": 1,
      "explain": "`*` and `?` are wildcards; put a tilde before them to search for the character itself: **~***. `~?` finds a question mark."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Before removing duplicates, flag them. Write a formula for **row 5** that returns **\"Duplicate\"** if the Email in B5 already appeared **above** it, otherwise **\"Unique\"**.",
      "example": {
        "title": "expanding range for \"seen before\"",
        "code": "=COUNTIF($A$2:A2,A2)>1"
      },
      "grid": {
        "A1": "Name",
        "B1": "Email",
        "A2": "Asha",
        "B2": "asha@mail.in",
        "A3": "Ravi",
        "B3": "ravi@mail.in",
        "A4": "Meena",
        "B4": "meena@mail.in",
        "A5": "Asha P",
        "B5": "asha@mail.in",
        "A6": "Kavya",
        "B6": "kavya@mail.in"
      },
      "starter": "",
      "solution": "=IF(COUNTIF($B$2:B5,B5)>1,\"Duplicate\",\"Unique\")",
      "explain": "The expanding range `$B$2:B5` counts occurrences from the top to the current row, so the **second** asha@mail.in is flagged **Duplicate** and the first stays Unique, exactly like Remove Duplicates keeps the first one."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about **Remove Duplicates** (Data > Data Tools) are TRUE? (choose all that apply)",
      "options": [
        "It keeps the first occurrence and deletes later ones",
        "You choose which columns decide a duplicate",
        "It is case-insensitive",
        "It can be undone with Ctrl+Z right after",
        "It updates automatically when new data arrives"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Remove Duplicates is a one-time action. For a repeatable process use **Power Query** (Remove Duplicates step, refreshable) or UNIQUE()."
    }
  ]
};
