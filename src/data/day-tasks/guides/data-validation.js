// Day Task (auto-graded practice) for data-validation
export default {
  "lesson": "data-validation",
  "minutes": 18,
  "intro": "Revise dropdown lists, number/date/length rules, custom formula validation, dependent dropdowns and error alerts.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **Ribbon path** opens the Data Validation dialog? (Tab > Group > Button)",
      "accept": [
        "Data > Data Tools > Data Validation",
        "Data>Data Tools>Data Validation",
        "Data > Data Validation"
      ],
      "explain": "**Data > Data Tools > Data Validation** (shortcut Alt, A, V, V). Choose Allow: List for a dropdown, Whole number, Decimal, Date, Text length or Custom."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A dropdown must list the regions typed in **Lists!A2:A20** and still work when the list is on another sheet. What do you put in **Source**?",
      "options": [
        "Lists!A2:A20 without =",
        "=Lists!$A$2:$A$20",
        "A2:A20",
        "\"Lists!A2:A20\""
      ],
      "answer": 1,
      "explain": "The source is a formula reference: `=Lists!$A$2:$A$20` (or a named range such as `=Regions`). Typed values are separated by commas: `North,South,East,West`."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Custom validation for **Employee ID**: it must be exactly **6 characters** long and start with **\"E\"**. Write the rule formula for the ID in **A3** (it must return TRUE for a valid ID).",
      "example": {
        "title": "a custom validation formula",
        "code": "=AND(ISNUMBER(B2),B2>0,B2<=100000)"
      },
      "grid": {
        "A1": "Emp ID",
        "B1": "Name",
        "A2": "E10234",
        "B2": "Asha",
        "A3": "E20871",
        "B3": "Ravi",
        "A4": "X3301",
        "B4": "Imran"
      },
      "starter": "",
      "solution": "=AND(LEN(A3)=6,LEFT(A3,1)=\"E\")",
      "explain": "For E20871: length 6 and first letter E → **TRUE**, so the entry is allowed. In the dialog you write the formula for the **first** cell of the selection with a relative reference; Excel adjusts it for the other cells."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Custom rule to prevent **duplicate** PAN numbers in A2:A6. Write the formula for **A4** that returns TRUE only if A4's value appears **once** in the list.",
      "example": {
        "title": "uniqueness rule",
        "code": "=COUNTIF($B$2:$B$500,B2)=1"
      },
      "grid": {
        "A1": "PAN",
        "B1": "Name",
        "A2": "ABCPK1234L",
        "B2": "Neha",
        "A3": "BXZPS5521Q",
        "B3": "Arjun",
        "A4": "ABCPK1234L",
        "B4": "Pooja",
        "A5": "CQWPM8890E",
        "B5": "Sameer",
        "A6": "DLRPA4471K",
        "B6": "Ritu"
      },
      "starter": "",
      "solution": "=COUNTIF($A$2:$A$6,A4)=1",
      "explain": "A4 repeats A2, so COUNTIF = 2 and the rule returns **FALSE**: Excel would reject the entry. The list is absolute and the checked cell relative."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want a **dependent dropdown**: when A2 is \"Fruits\", B2 lists the range named Fruits. Which Source formula is used for B2?",
      "options": [
        "=A2",
        "=INDIRECT(A2)",
        "=VLOOKUP(A2,Lists,2)",
        "=Fruits"
      ],
      "answer": 1,
      "explain": "`=INDIRECT(A2)` turns the text \"Fruits\" into a reference to the named range **Fruits**. Names cannot contain spaces, so categories like \"Home Decor\" need `INDIRECT(SUBSTITUTE(A2,\" \",\"_\"))`."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about Data Validation are TRUE? (choose all that apply)",
      "options": [
        "A Stop alert blocks invalid entries; Warning and Information let the user continue",
        "Validation does not check values that were pasted over the cell",
        "Data > Data Validation > Circle Invalid Data marks existing invalid entries",
        "Validation rules also protect the sheet",
        "An Input Message appears when the cell is selected"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Pasting can overwrite validation, so use Circle Invalid Data to audit. Validation is not protection: use Review > Protect Sheet to lock cells."
    }
  ]
};
