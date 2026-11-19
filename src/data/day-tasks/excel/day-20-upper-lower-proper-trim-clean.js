// Day Task (auto-graded practice) for day-20-upper-lower-proper-trim-clean
export default {
  "lesson": "day-20-upper-lower-proper-trim-clean",
  "minutes": 20,
  "intro": "Clean messy names, cities and emails with UPPER(), LOWER(), PROPER(), TRIM() and CLEAN().",
  "tasks": [
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Remove the extra spaces from the name in A2 (leading, trailing and double spaces).",
      "example": {
        "title": "TRIM",
        "code": "=TRIM(B7)"
      },
      "grid": {
        "A1": "Raw Name",
        "B1": "City",
        "C1": "Email",
        "A2": "  rAJESH   kumar ",
        "B2": "nagpur",
        "C2": "Rajesh.K@Mail.com",
        "A3": "PRIYA SHARMA",
        "B3": " Bhopal ",
        "C3": "priya.s@MAIL.com",
        "A4": "amit o'neil",
        "B4": "PUNE",
        "C4": "AMIT@mail.COM"
      },
      "starter": "",
      "solution": "=TRIM(A2)",
      "explain": "TRIM removes spaces at both ends and reduces internal runs of spaces to one: **rAJESH kumar**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Clean the name in A2 completely: remove extra spaces **and** convert it to proper case (\"Rajesh Kumar\").",
      "example": {
        "title": "nesting two functions",
        "code": "=UPPER(TRIM(A4))"
      },
      "grid": {
        "A1": "Raw Name",
        "B1": "City",
        "C1": "Email",
        "A2": "  rAJESH   kumar ",
        "B2": "nagpur",
        "C2": "Rajesh.K@Mail.com",
        "A3": "PRIYA SHARMA",
        "B3": " Bhopal ",
        "C3": "priya.s@MAIL.com",
        "A4": "amit o'neil",
        "B4": "PUNE",
        "C4": "AMIT@mail.COM"
      },
      "starter": "",
      "solution": "=PROPER(TRIM(A2))",
      "explain": "Nest the functions: TRIM first, then PROPER → **Rajesh Kumar**. `=TRIM(PROPER(A2))` also works."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Is the city in B4 already typed in **proper case**? Return TRUE/FALSE by comparing B4 with `PROPER(B4)` using the case-sensitive **EXACT** function.",
      "example": {
        "title": "EXACT is case-sensitive",
        "code": "=EXACT(A2, UPPER(A2))"
      },
      "grid": {
        "A1": "Raw Name",
        "B1": "City",
        "C1": "Email",
        "A2": "  rAJESH   kumar ",
        "B2": "nagpur",
        "C2": "Rajesh.K@Mail.com",
        "A3": "PRIYA SHARMA",
        "B3": " Bhopal ",
        "C3": "priya.s@MAIL.com",
        "A4": "amit o'neil",
        "B4": "PUNE",
        "C4": "AMIT@mail.COM"
      },
      "starter": "",
      "solution": "=EXACT(B4,PROPER(B4))",
      "explain": "PROPER(B4) = \"Pune\" but B4 is \"PUNE\". A normal `=` comparison ignores case and would say TRUE; **EXACT** is case-sensitive, so the answer is **FALSE**. This is how you find entries that still need cleaning."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Emails must be stored in lowercase. Return TRUE if the email in C3 is **already all lowercase**, otherwise FALSE (use EXACT and LOWER).",
      "example": {
        "title": "checking the case",
        "code": "=EXACT(D2, LOWER(D2))"
      },
      "grid": {
        "A1": "Raw Name",
        "B1": "City",
        "C1": "Email",
        "A2": "  rAJESH   kumar ",
        "B2": "nagpur",
        "C2": "Rajesh.K@Mail.com",
        "A3": "PRIYA SHARMA",
        "B3": " Bhopal ",
        "C3": "priya.s@MAIL.com",
        "A4": "amit o'neil",
        "B4": "PUNE",
        "C4": "AMIT@mail.COM"
      },
      "starter": "",
      "solution": "=EXACT(C3,LOWER(C3))",
      "explain": "LOWER(C3) = \"priya.s@mail.com\" but C3 contains \"MAIL\" in capitals, so EXACT returns **FALSE**. The fix would be `=LOWER(C3)` in a helper column, then Paste Special > Values."
    },
    {
      "type": "output",
      "mins": 2,
      "q": "What does this formula show? (type it exactly)",
      "code": "=PROPER(\"amit o'neil\")",
      "expected": "Amit O'Neil",
      "explain": "PROPER capitalises any letter that follows a non-letter, including the apostrophe: **Amit O'Neil**. With names like \"mcdonald\" it gives \"Mcdonald\": PROPER has limits."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Data pasted from a website has **line-break characters** inside cells. Which function removes them?",
      "options": [
        "TRIM",
        "CLEAN",
        "PROPER",
        "LOWER"
      ],
      "answer": 1,
      "explain": "**CLEAN** removes non-printable characters (codes 0-31) such as line breaks. TRIM removes only spaces. Many people use `=TRIM(CLEAN(A2))` together."
    }
  ]
};
