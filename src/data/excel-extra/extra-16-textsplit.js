export default {
  "id": "extra-16-textsplit",
  "title": "TEXTSPLIT()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 16,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "TEXTSPLIT() breaks one text value into separate pieces using a delimiter such as a space, comma or hyphen, and spills the pieces into columns and/or rows. It is the formula version of Text to Columns, so it updates automatically when the source text changes.",
  "objectives": [
    "Write TEXTSPLIT() and explain all six arguments",
    "Split names, addresses and codes into columns",
    "Split text into rows and columns at the same time",
    "Handle empty values, multiple delimiters, case and missing values (pad_with)"
  ],
  "theory": [
    {
      "heading": "What is TEXTSPLIT()?",
      "content": "TEXTSPLIT() is a Microsoft 365 dynamic array function. It takes a text such as `Rahul Kumar Sharma` and splits it at every delimiter (here a space) to give `Rahul | Kumar | Sharma` in three cells.\n\nCompared with **Data > Data Tools > Text to Columns** (Day 32):\n- Text to Columns is a one-time action; if the source changes you must do it again.\n- TEXTSPLIT is a formula; it recalculates automatically.",
      "syntax": "=TEXTSPLIT(text, col_delimiter, [row_delimiter], [ignore_empty], [match_mode], [pad_with])"
    },
    {
      "heading": "Arguments one by one",
      "content": "- `text` (required): the text or cell to split, e.g. A2.\n- `col_delimiter`: the character(s) where a NEW COLUMN starts, e.g. \" \" or \",\".\n- `row_delimiter` (optional): the character(s) where a NEW ROW starts, e.g. \";\".\n- `ignore_empty` (optional): FALSE (default) keeps empty pieces when two delimiters are side by side; TRUE skips them.\n- `match_mode` (optional): 0 (default) = case-sensitive delimiter match; 1 = case-insensitive.\n- `pad_with` (optional): the value used to fill gaps when rows have different numbers of pieces. Default is #N/A.\n\nYou must supply at least one of col_delimiter or row_delimiter. To skip col_delimiter, leave it blank: `=TEXTSPLIT(A2,,\",\")` splits into rows only."
    },
    {
      "heading": "Multiple delimiters with an array constant",
      "content": "If data uses different separators, put them inside curly braces:\n\n`=TEXTSPLIT(A2,{\",\",\";\",\"/\"})`\n\nEvery comma, semicolon and slash is treated as a split point.\n\nA delimiter can also be more than one character, e.g. `\", \"` (comma followed by a space), which avoids leading spaces in the results.",
      "tip": "If results have extra spaces, wrap with TRIM: =TRIM(TEXTSPLIT(A2,\",\"))."
    },
    {
      "heading": "Results are TEXT",
      "content": "TEXTSPLIT always returns text, even for digits. `=TEXTSPLIT(\"10-20-30\",\"-\")` gives \"10\", \"20\", \"30\" as text, so SUM() would return 0. Convert with a double minus or VALUE():\n\n`=SUM(--TEXTSPLIT(\"10-20-30\",\"-\"))` returns 60.",
      "tip": "Text results are left-aligned by default; numbers are right-aligned. That is a quick visual check."
    },
    {
      "heading": "Splitting many rows: one formula per row",
      "content": "TEXTSPLIT is designed for ONE text value. If you give it a range like A2:A10, Excel cannot return a separate 2-D result for each row and you will only get the first piece of each. The simple, reliable method is to write `=TEXTSPLIT(A2,\" \")` in B2 and **fill it down**; each row spills to the right.\n\nRelated functions: `TEXTBEFORE(text,delimiter)` returns the part before a delimiter and `TEXTAFTER(text,delimiter)` returns the part after it."
    }
  ],
  "examples": [
    {
      "title": "Split full names into First, Middle and Last name",
      "scenario": "An HR sheet has full names in column A. Split them into separate columns starting from B.",
      "table": {
        "headers": [
          "A: Full Name",
          "B: First",
          "C: Middle",
          "D: Last"
        ],
        "rows": [
          [
            "Rahul Kumar Sharma",
            "",
            "",
            ""
          ],
          [
            "Priya Anil Desai",
            "",
            "",
            ""
          ],
          [
            "Amit Raj Verma",
            "",
            "",
            ""
          ]
        ]
      },
      "steps": [
        "Click B2",
        "Type =TEXTSPLIT(A2,\" \")",
        "Press Enter: the result spills into B2:D2",
        "Select B2 and drag the fill handle down to B4"
      ],
      "code": "=TEXTSPLIT(A2,\" \")",
      "result": "Row 2: Rahul | Kumar | Sharma; Row 3: Priya | Anil | Desai; Row 4: Amit | Raj | Verma",
      "explanation": "The space is the column delimiter, so every space starts a new column. Keep C and D empty, otherwise you get #SPILL!."
    },
    {
      "title": "Split a list of branch cities",
      "scenario": "Cell A2 contains `Mumbai, Pune, Nashik, Nagpur`. Put each city in its own cell without leading spaces.",
      "table": {
        "headers": [
          "A: Branches"
        ],
        "rows": [
          [
            "Mumbai, Pune, Nashik, Nagpur"
          ]
        ]
      },
      "steps": [
        "Click B2",
        "Type =TEXTSPLIT(A2,\", \")",
        "Press Enter"
      ],
      "code": "=TEXTSPLIT(A2,\", \")",
      "result": "B2: Mumbai | C2: Pune | D2: Nashik | E2: Nagpur",
      "explanation": "Using the two-character delimiter comma+space removes the space before each city. With just \",\" you would get \" Pune\" with a leading space."
    },
    {
      "title": "Split item-quantity pairs into rows and columns",
      "scenario": "An order note in A2 reads `Pen-10;Pencil-20;Eraser-5`. Create a small table with Item and Qty.",
      "table": {
        "headers": [
          "A: Order note"
        ],
        "rows": [
          [
            "Pen-10;Pencil-20;Eraser-5"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =TEXTSPLIT(A2,\"-\",\";\")",
        "Press Enter: a 3-row x 2-column result spills into C2:D4"
      ],
      "code": "=TEXTSPLIT(A2,\"-\",\";\")",
      "result": "C2:D4 -> Pen | 10 ; Pencil | 20 ; Eraser | 5 (quantities are text)",
      "explanation": "\";\" starts a new row and \"-\" starts a new column. To total the quantities: =SUM(--INDEX(TEXTSPLIT(A2,\"-\",\";\"),,2)) returns 35."
    },
    {
      "title": "Ignore empty values caused by double commas",
      "scenario": "Data typed by a user has a double comma: `Red,,Blue,Green`.",
      "table": {
        "headers": [
          "A: Colours"
        ],
        "rows": [
          [
            "Red,,Blue,Green"
          ]
        ]
      },
      "steps": [
        "In B2 type =TEXTSPLIT(A2,\",\") and press Enter: you get 4 cells with an empty one",
        "In B4 type =TEXTSPLIT(A2,\",\",,TRUE) and press Enter"
      ],
      "code": "=TEXTSPLIT(A2,\",\",,TRUE)",
      "result": "Without ignore_empty: Red | (blank) | Blue | Green. With TRUE: Red | Blue | Green",
      "explanation": "The row_delimiter is skipped with an empty argument (,,) and ignore_empty is set to TRUE."
    },
    {
      "title": "Multiple delimiters and padding missing values",
      "scenario": "A2 contains `Pen-10;Pencil;Eraser-5` (Pencil has no quantity). Split into Item/Qty and show 0 where qty is missing.",
      "table": {
        "headers": [
          "A: Order note"
        ],
        "rows": [
          [
            "Pen-10;Pencil;Eraser-5"
          ]
        ]
      },
      "steps": [
        "Click C2",
        "Type =TEXTSPLIT(A2,\"-\",\";\",FALSE,0,0)",
        "Press Enter"
      ],
      "code": "=TEXTSPLIT(A2,\"-\",\";\",FALSE,0,0)",
      "result": "Pen | 10 ; Pencil | 0 ; Eraser | 5",
      "explanation": "Without pad_with the missing cell would show #N/A. pad_with = 0 fills the gap. For different separators in one text, e.g. `Red,Blue;Green`, use =TEXTSPLIT(A2,{\",\",\";\"}) which returns Red | Blue | Green."
    },
    {
      "title": "Case-insensitive delimiter and converting to numbers",
      "scenario": "A size code in A2 is `10x20X30` (mixed x/X). Split it and find the total.",
      "table": {
        "headers": [
          "A: Size"
        ],
        "rows": [
          [
            "10x20X30"
          ]
        ]
      },
      "steps": [
        "In B2 type =TEXTSPLIT(A2,\"x\",,,1) and press Enter",
        "In B4 type =SUM(--TEXTSPLIT(A2,\"x\",,,1)) and press Enter"
      ],
      "code": "=TEXTSPLIT(A2,\"x\",,,1)\n=SUM(--TEXTSPLIT(A2,\"x\",,,1))",
      "result": "B2:D2 -> 10 | 20 | 30 (text); B4 -> 60",
      "explanation": "match_mode 1 matches both x and X. The -- converts the text pieces into numbers so SUM works."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between TEXTSPLIT() and Text to Columns?",
      "a": "Text to Columns (Data > Text to Columns) is a one-time wizard that overwrites cells with static values. TEXTSPLIT is a formula that spills results and recalculates whenever the source text changes. TEXTSPLIT can also split into rows using row_delimiter.",
      "level": "Easy"
    },
    {
      "q": "Explain the arguments of TEXTSPLIT.",
      "a": "TEXTSPLIT(text, col_delimiter, [row_delimiter], [ignore_empty], [match_mode], [pad_with]). text is the source; col_delimiter splits into columns; row_delimiter splits into rows; ignore_empty TRUE skips empty pieces; match_mode 1 makes the delimiter case-insensitive; pad_with fills missing cells instead of #N/A.",
      "level": "Medium"
    },
    {
      "q": "How do you split on more than one delimiter?",
      "a": "Pass an array constant: =TEXTSPLIT(A2,{\",\",\";\",\" \"}). Each listed delimiter is a split point.",
      "level": "Medium"
    },
    {
      "q": "Why does SUM(TEXTSPLIT(\"1,2,3\",\",\")) return 0?",
      "a": "TEXTSPLIT returns text strings and SUM ignores text in arrays. Use =SUM(--TEXTSPLIT(\"1,2,3\",\",\")) or VALUE() to convert, which returns 6.",
      "level": "Medium"
    },
    {
      "q": "What does pad_with do?",
      "a": "When row_delimiter is used and rows have different numbers of pieces, the empty positions show #N/A by default. pad_with replaces them with a value you choose, such as \"\" or 0.",
      "level": "Medium"
    },
    {
      "q": "How do you get only the last name from 'Rahul Kumar Sharma'?",
      "a": "=TEXTAFTER(A2,\" \",-1) returns the text after the last space: Sharma. Or =TAKE(TEXTSPLIT(A2,\" \"),,-1).",
      "level": "Hard"
    },
    {
      "q": "You entered =TEXTSPLIT(A2:A10,\",\") and only got the first item for each row. Why?",
      "a": "TEXTSPLIT cannot return an array-of-arrays. With a multi-cell input it returns only the first piece per row. Write the formula for A2 and fill down, or use a combination like TEXTSPLIT(TEXTJOIN(\";\",,A2:A10),\",\",\";\") to split everything at once.",
      "level": "Hard"
    },
    {
      "q": "Which versions support TEXTSPLIT?",
      "a": "Microsoft 365 and Excel for the web (also Excel 2024). Excel 2019/2021 show #NAME?.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "A2 contains the email `neha.patil@abcltd.in`. Split it into user name and domain using @.",
      "hint": "The delimiter is \"@\".",
      "solution": "=TEXTSPLIT(A2,\"@\") returns neha.patil | abcltd.in."
    },
    {
      "task": "A2 contains the date text `15/08/2025`. Split day, month and year into three cells, then build a real date in E2.",
      "hint": "Use \"/\" and then DATE with converted numbers.",
      "solution": "B2: =TEXTSPLIT(A2,\"/\") gives 15 | 08 | 2025 (text). E2: =DATE(--D2,--C2,--B2) returns 15-Aug-2025."
    },
    {
      "task": "A2 contains `Laptop:55000|Mouse:500|Keyboard:1200`. Create a 2-column table of Product and Price.",
      "hint": "Pipe | separates rows, colon separates columns.",
      "solution": "=TEXTSPLIT(A2,\":\",\"|\") returns Laptop 55000 / Mouse 500 / Keyboard 1200. Total price: =SUM(--INDEX(TEXTSPLIT(A2,\":\",\"|\"),,2)) = 56700."
    },
    {
      "task": "A2 contains `HR, , Finance,IT` (with an empty item). Return only HR, Finance and IT without extra spaces.",
      "hint": "Use ignore_empty and TRIM. Note \", \" pieces may contain spaces.",
      "solution": "=TRIM(TEXTSPLIT(A2,\",\",,TRUE)) returns HR | (blank) | Finance | IT because the empty item is a single space, not empty. Better: =TEXTSPLIT(SUBSTITUTE(A2,\" \",\"\"),\",\",,TRUE) returns HR | Finance | IT."
    },
    {
      "task": "A2 contains `North 120 South 95 East 140`. Put region names in one column and numbers in the next.",
      "hint": "Split by space into one row, then use WRAPROWS(...,2).",
      "solution": "=WRAPROWS(TEXTSPLIT(A2,\" \"),2) returns North 120 / South 95 / East 140 (numbers as text)."
    }
  ],
  "quiz": [
    {
      "question": "What does =TEXTSPLIT(\"A-B-C\",\"-\") return?",
      "options": [
        "A, B, C in three columns",
        "A, B, C in three rows",
        "ABC",
        "#VALUE!"
      ],
      "answer": 0,
      "explanation": "The hyphen is the column delimiter, so pieces spill across columns."
    },
    {
      "question": "Which argument splits text into rows?",
      "options": [
        "col_delimiter",
        "row_delimiter",
        "pad_with",
        "match_mode"
      ],
      "answer": 1,
      "explanation": "row_delimiter is the third argument."
    },
    {
      "question": "What does ignore_empty = TRUE do?",
      "options": [
        "Removes spaces",
        "Skips empty pieces between consecutive delimiters",
        "Ignores errors",
        "Ignores case"
      ],
      "answer": 1,
      "explanation": "It skips empty strings created by delimiters next to each other."
    },
    {
      "question": "Missing positions in an uneven TEXTSPLIT result show by default:",
      "options": [
        "0",
        "blank",
        "#N/A",
        "#VALUE!"
      ],
      "answer": 2,
      "explanation": "Use pad_with to replace #N/A."
    },
    {
      "question": "The pieces returned by TEXTSPLIT are of which type?",
      "options": [
        "Number",
        "Text",
        "Date",
        "Logical"
      ],
      "answer": 1,
      "explanation": "They are text; convert with -- or VALUE for calculations."
    }
  ]
};
