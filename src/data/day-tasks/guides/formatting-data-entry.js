// Day Task (auto-graded practice) for formatting-data-entry
export default {
  "lesson": "formatting-data-entry",
  "minutes": 18,
  "intro": "Revise number formats (look vs value), custom codes, Flash Fill, Center Across Selection and data entry quality.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Cell A1 contains **2.456** formatted to show **2.46**. What does `=A1*100` return?",
      "options": [
        "246",
        "245.6",
        "246.00",
        "#VALUE!"
      ],
      "answer": 1,
      "explain": "Formatting changes only how a value **looks**; calculations use the stored value 2.456 → **245.6**. Use ROUND when you need the rounded value in calculations."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Write the custom number format code that shows positive numbers with thousand separators, **negatives in red in brackets**, and zero as a dash. (Sections: positive;negative;zero)",
      "accept": [
        "#,##0;[Red](#,##0);\"-\"",
        "#,##0;[Red](#,##0);-"
      ],
      "explain": "Section 1 `#,##0` positives, section 2 `[Red](#,##0)` negatives in red brackets (the minus sign is replaced by brackets), section 3 `\"-\"` for zero. This is the classic accounting-style report format."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut runs **Flash Fill** (fills the column after you type one or two examples)?",
      "accept": [
        "Ctrl+E"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*E\\s*$"
      ],
      "explain": "**Ctrl + E** (Data > Flash Fill) detects the pattern from your examples, e.g. first names from full names. The result is static: it does not update when the source changes."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Why do many analysts prefer **Center Across Selection** over **Merge & Center** for titles?",
      "options": [
        "It looks different",
        "It centres the text without merging cells, so sorting, selecting columns and copy-paste keep working",
        "It works on numbers only",
        "It is faster to calculate"
      ],
      "answer": 1,
      "explain": "Merged cells break sorting, filtering, column selection and pasting. Center Across Selection (Format Cells > Alignment > Horizontal) gives the same look and no side effects."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A rate shows **18%** in the sheet. Write a formula for the **tax** on the amount in B3 using the rate cell **E1** (do not type 18 or 0.18).",
      "example": {
        "title": "using a percentage cell",
        "code": "=C2*$F$1"
      },
      "grid": {
        "A1": "Item",
        "B1": "Amount",
        "D1": "Tax rate",
        "E1": "0.18",
        "A2": "Chair",
        "B2": "2400",
        "A3": "Table",
        "B3": "5600",
        "A4": "Lamp",
        "B4": "899"
      },
      "starter": "",
      "solution": "=B3*E1",
      "explain": "18% is stored as **0.18**, so `=B3*E1` = 5600 × 0.18 = **1008**. Typing `=B3*18` would give 100,800 because the percent format is only the look of 0.18."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A phone number was typed as the number 9876543210 and shows in scientific notation. Build the display text **\"+91 9876543210\"** for the contact in **B2** using `&` (so the stored number is not changed).",
      "example": {
        "title": "adding a prefix with &",
        "code": "=\"EMP-\"&A2"
      },
      "grid": {
        "A1": "Name",
        "B1": "Mobile",
        "A2": "Rekha",
        "B2": "9876543210",
        "A3": "Vikram",
        "B3": "9123456780"
      },
      "starter": "",
      "solution": "=\"+91 \"&B2",
      "explain": "Joining text with a number gives **text**: \"+91 9876543210\". For IDs and phone numbers the best practice is to store them as text (format the column as Text before typing) so they never show as 9.88E+09."
    }
  ]
};
