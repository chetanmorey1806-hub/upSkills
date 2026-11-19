// Day Task (auto-graded practice) for text-functions
export default {
  "lesson": "text-functions",
  "minutes": 22,
  "intro": "Revise LEFT/MID/RIGHT, FIND vs SEARCH, TRIM/PROPER, TEXTJOIN, TEXT/VALUE, SUBSTITUTE and TEXTBEFORE/TEXTAFTER.",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Clean the name in **A2**: remove extra spaces and give it proper case (\"Asha Patil\").",
      "example": {
        "title": "nesting two cleaning functions",
        "code": "=UPPER(TRIM(B2))"
      },
      "grid": {
        "A1": "Raw name",
        "B1": "Email",
        "C1": "Code",
        "A2": "  asha   PATIL ",
        "B2": "asha.patil@infosys.com",
        "C2": "MH-PUN-0451",
        "A3": "ravi kumar",
        "B3": "ravi.k@tcs.com",
        "C3": "KA-BLR-1207",
        "A4": "MEENA iyer",
        "B4": "meena@wipro.com",
        "C4": "TN-CHE-0099"
      },
      "starter": "",
      "solution": "=PROPER(TRIM(A2))",
      "explain": "TRIM removes leading/trailing spaces and reduces inner runs to one space; PROPER capitalises each word → **Asha Patil**. Doing PROPER alone keeps the extra spaces."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Extract the **domain** (text after \"@\") from the email in **B3**.",
      "example": {
        "title": "text after a character",
        "code": "=MID(A2,FIND(\"-\",A2)+1,LEN(A2))"
      },
      "grid": {
        "A1": "Raw name",
        "B1": "Email",
        "C1": "Code",
        "A2": "  asha   PATIL ",
        "B2": "asha.patil@infosys.com",
        "C2": "MH-PUN-0451",
        "A3": "ravi kumar",
        "B3": "ravi.k@tcs.com",
        "C3": "KA-BLR-1207",
        "A4": "MEENA iyer",
        "B4": "meena@wipro.com",
        "C4": "TN-CHE-0099"
      },
      "starter": "",
      "solution": "=TEXTAFTER(B3,\"@\")",
      "explain": "`TEXTAFTER(B3,\"@\")` → **tcs.com**. The classic version is `=MID(B3,FIND(\"@\",B3)+1,LEN(B3))`, which works in every Excel version."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The code is **State-City-Number**. Extract the **city** part (\"CHE\") from **C4**.",
      "example": {
        "title": "MID with fixed positions",
        "code": "=MID(\"INV-2025-18\",5,4)   → 2025"
      },
      "grid": {
        "A1": "Raw name",
        "B1": "Email",
        "C1": "Code",
        "A2": "  asha   PATIL ",
        "B2": "asha.patil@infosys.com",
        "C2": "MH-PUN-0451",
        "A3": "ravi kumar",
        "B3": "ravi.k@tcs.com",
        "C3": "KA-BLR-1207",
        "A4": "MEENA iyer",
        "B4": "meena@wipro.com",
        "C4": "TN-CHE-0099"
      },
      "starter": "",
      "solution": "=MID(C4,4,3)",
      "explain": "The city always starts at position 4 and has 3 characters, so `MID(C4,4,3)` → **CHE**. For variable-length parts use FIND for the positions, or `TEXTBEFORE(TEXTAFTER(C4,\"-\"),\"-\")`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What is the difference between **FIND** and **SEARCH**?",
      "options": [
        "FIND is faster",
        "FIND is case-sensitive and does not allow wildcards; SEARCH is case-insensitive and allows * and ?",
        "SEARCH returns the text, FIND returns the position",
        "There is no difference"
      ],
      "answer": 1,
      "explain": "`=FIND(\"a\",\"Asha\")` → 4 (the lowercase a), `=SEARCH(\"a\",\"Asha\")` → 1. Both return #VALUE! when the text is not found."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Create a comma-separated list of the three **codes** C2:C4, like \"MH-PUN-0451, KA-BLR-1207, ...\", with one function.",
      "example": {
        "title": "joining with a separator",
        "code": "=TEXTJOIN(\" | \",TRUE,A2:A10)"
      },
      "grid": {
        "A1": "Raw name",
        "B1": "Email",
        "C1": "Code",
        "A2": "  asha   PATIL ",
        "B2": "asha.patil@infosys.com",
        "C2": "MH-PUN-0451",
        "A3": "ravi kumar",
        "B3": "ravi.k@tcs.com",
        "C3": "KA-BLR-1207",
        "A4": "MEENA iyer",
        "B4": "meena@wipro.com",
        "C4": "TN-CHE-0099"
      },
      "starter": "",
      "solution": "=TEXTJOIN(\", \",TRUE,C2:C4)",
      "explain": "TEXTJOIN(delimiter, ignore_empty, range) joins a whole range with a separator; TRUE skips blank cells. CONCAT would join without any separator."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula return?",
      "code": "=SUBSTITUTE(\"98-765-43210\",\"-\",\"\")&\" / \"&LEN(\"98-765-43210\")",
      "expected": "9876543210 / 12",
      "explain": "SUBSTITUTE replaces **every** \"-\" with nothing → 9876543210; LEN counts all 12 characters including the hyphens. Result: **9876543210 / 12**."
    }
  ]
};
