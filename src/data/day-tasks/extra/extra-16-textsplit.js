// Day Task (auto-graded practice) for extra-16-textsplit
export default {
  "lesson": "extra-16-textsplit",
  "minutes": 18,
  "intro": "Split text into columns and rows with TEXTSPLIT(), and extract pieces with TEXTBEFORE / TEXTAFTER.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "`=TEXTSPLIT(\"Asha Ramesh Patil\", \" \")` spills the pieces across columns. How many cells does it fill?",
      "accept": [
        "3"
      ],
      "explain": "The space is the **column delimiter**, so the three words go into **3** columns: Asha | Ramesh | Patil."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does `=TEXTSPLIT(\"Pen,10;Book,45\", \",\", \";\")` return?",
      "options": [
        "4 cells in one row",
        "2 rows × 2 columns: Pen | 10 and Book | 45",
        "2 cells: \"Pen,10\" and \"Book,45\"",
        "#VALUE!"
      ],
      "answer": 1,
      "explain": "The 2nd argument (\",\") splits into **columns** and the 3rd (\";\") into **rows**, so you get a small 2 × 2 table."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the formula so it splits on **both** commas and hyphens: `=TEXTSPLIT(A2, ______)` (type the second argument)",
      "accept": [
        "{\",\",\"-\"}",
        "{\"-\",\",\"}"
      ],
      "explain": "Multiple delimiters go in an **array constant**: `{\",\",\"-\"}`. Writing `\",-\"` would look for the two-character text \",-\" instead."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "`=SUM(TEXTSPLIT(\"10-20-30\",\"-\"))` returns 0. Why?",
      "options": [
        "TEXTSPLIT cannot split numbers",
        "The pieces are TEXT, and SUM ignores text",
        "The delimiter is wrong",
        "SUM cannot take arrays"
      ],
      "answer": 1,
      "explain": "TEXTSPLIT always returns **text**. Convert with `--TEXTSPLIT(...)` or `VALUE(TEXTSPLIT(...))`, then SUM gives 60."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Customer names are \"First Last\". Write a formula that returns only the **first name** of the customer in **A3**. (TEXTSPLIT would give both parts; use **TEXTBEFORE** to get just the first piece.)",
      "example": {
        "title": "text before a delimiter",
        "code": "=TEXTBEFORE(\"INV-2025-018\",\"-\")   → INV"
      },
      "grid": {
        "A1": "Customer",
        "B1": "City",
        "A2": "Asha Patil",
        "B2": "Pune",
        "A3": "Rohan Mehta",
        "B3": "Surat",
        "A4": "Farah Khan",
        "B4": "Lucknow"
      },
      "starter": "",
      "solution": "=TEXTBEFORE(A3,\" \")",
      "explain": "`TEXTBEFORE(text, \" \")` returns everything before the first space: **Rohan**. `=INDEX(TEXTSPLIT(A3,\" \"),1)` and `=LEFT(A3,FIND(\" \",A3)-1)` give the same result."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Employee codes look like **EMP-1045**. Return the **number part** of the code in **A2** as a real number (so it can be used in maths).",
      "example": {
        "title": "text after a delimiter, then a number",
        "code": "=VALUE(TEXTAFTER(\"Qty:25\",\":\"))   → 25"
      },
      "grid": {
        "A1": "Code",
        "B1": "Name",
        "A2": "EMP-1045",
        "B2": "Kiran",
        "A3": "EMP-0987",
        "B3": "Pooja",
        "A4": "EMP-1210",
        "B4": "Sameer"
      },
      "starter": "",
      "solution": "=VALUE(TEXTAFTER(A2,\"-\"))",
      "explain": "`TEXTAFTER(A2,\"-\")` gives the text \"1045\"; wrapping it in **VALUE** (or `--`) converts it into the number **1045**. Remember: split results are always text."
    }
  ]
};
