// Day Task (auto-graded practice) for day-35-conditional-formatting
export default {
  "lesson": "day-35-conditional-formatting",
  "minutes": 20,
  "intro": "Highlight important values with Conditional Formatting rules, data bars, colour scales, icon sets and formula-based rules.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is **Conditional Formatting**?",
      "options": [
        "Home > Styles > Conditional Formatting",
        "Insert > Styles",
        "Data > Conditional",
        "View > Formatting"
      ],
      "answer": 0,
      "explain": "**Home > Styles > Conditional Formatting** has Highlight Cells Rules, Top/Bottom Rules, Data Bars, Color Scales, Icon Sets, New Rule and Manage Rules."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which option highlights repeated names in a list?",
      "options": [
        "Top/Bottom Rules > Top 10",
        "Highlight Cells Rules > Duplicate Values",
        "Data Bars",
        "Icon Sets"
      ],
      "answer": 1,
      "explain": "**Highlight Cells Rules > Duplicate Values** colours every value that appears more than once (you can switch it to Unique)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want to colour the **entire row** when Fees (column D) is \"Pending\". The range A2:D6 is selected. Which formula rule is correct?",
      "options": [
        "=D2=\"Pending\"",
        "=$D2=\"Pending\"",
        "=$D$2=\"Pending\"",
        "=D$2=\"Pending\""
      ],
      "answer": 1,
      "explain": "`=$D2=\"Pending\"`: the `$` locks column D so every cell in the row looks at column D, while the row (2) stays relative so each row checks its own fee. `$D$2` would colour all rows based on row 2 only."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "A formula rule `=$B2<35` is applied to A2:D6. For **row 3** (Bina), what does the rule return? (type TRUE or FALSE)",
      "code": "  | A       | B     | C               | D\n1 | Student | Marks | Due Date Passed | Fees\n2 | Arnav   | 82    | No              | Paid\n3 | Bina    | 28    | Yes             | Pending\n4 | Chetan  | 45    | Yes             | Paid\n5 | Diksha  | 91    | No              | Pending\n6 | Arnav   | 64    | No              | Paid\n\n=$B3<35",
      "expected": "TRUE",
      "explain": "For row 3 the rule becomes `=$B3<35` → 28 < 35 → **TRUE**, so Bina's whole row gets the format."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Write the formula a rule would use to test whether **Chetan's row (row 4)** is \"overdue and pending\": Due Date Passed is \"Yes\" **AND** Fees is \"Pending\".",
      "example": {
        "title": "AND in a rule",
        "code": "=AND($B2>50, $C2=\"No\")"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Due Date Passed",
        "D1": "Fees",
        "A2": "Arnav",
        "B2": "82",
        "C2": "No",
        "D2": "Paid",
        "A3": "Bina",
        "B3": "28",
        "C3": "Yes",
        "D3": "Pending",
        "A4": "Chetan",
        "B4": "45",
        "C4": "Yes",
        "D4": "Paid",
        "A5": "Diksha",
        "B5": "91",
        "C5": "No",
        "D5": "Pending",
        "A6": "Arnav",
        "B6": "64",
        "C6": "No",
        "D6": "Paid"
      },
      "starter": "",
      "solution": "=AND($C4=\"Yes\",$D4=\"Pending\")",
      "explain": "Chetan has \"Yes\" but his fees are \"Paid\" → **FALSE**, so his row is not highlighted. Formula rules must return TRUE/FALSE."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A duplicate-highlight formula rule for names: return TRUE if the name in **A6** appears more than once in $A$2:$A$6.",
      "example": {
        "title": "COUNTIF in a rule",
        "code": "=COUNTIF($B$2:$B$100, B2)>1"
      },
      "grid": {
        "A1": "Student",
        "B1": "Marks",
        "C1": "Due Date Passed",
        "D1": "Fees",
        "A2": "Arnav",
        "B2": "82",
        "C2": "No",
        "D2": "Paid",
        "A3": "Bina",
        "B3": "28",
        "C3": "Yes",
        "D3": "Pending",
        "A4": "Chetan",
        "B4": "45",
        "C4": "Yes",
        "D4": "Paid",
        "A5": "Diksha",
        "B5": "91",
        "C5": "No",
        "D5": "Pending",
        "A6": "Arnav",
        "B6": "64",
        "C6": "No",
        "D6": "Paid"
      },
      "starter": "",
      "solution": "=COUNTIF($A$2:$A$6,A6)>1",
      "explain": "Arnav appears twice → **TRUE**. This formula rule does what \"Duplicate Values\" does but can be adapted, e.g. to highlight only the second occurrence."
    }
  ]
};
