export default {
  "id": "extra-15-sequence",
  "title": "SEQUENCE()",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 15,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "SEQUENCE() generates a list or grid of numbers with a single formula that spills automatically. It replaces manual serial numbering and is the building block for dynamic serial numbers, date lists, invoice numbers and calendars.",
  "objectives": [
    "Write SEQUENCE() with all four arguments: rows, columns, start and step",
    "Create automatic serial numbers that grow or shrink with the data",
    "Generate date lists, invoice numbers and month names using SEQUENCE()",
    "Combine SEQUENCE() with COUNTA(), TEXT(), DATE() and SUM()"
  ],
  "theory": [
    {
      "heading": "What is SEQUENCE()?",
      "content": "SEQUENCE() is a **dynamic array function** available in Microsoft 365 and Excel 2021+. You type it in ONE cell and it returns many numbers, which **spill** into the cells below and/or to the right.\n\nOffice use cases:\n- Serial numbers (S.No.) in a salary sheet or marks sheet\n- Invoice numbers like INV-0001, INV-0002 ...\n- A list of dates for an attendance register\n- Instalment numbers 1 to 12 in an EMI schedule\n\nIf any cell in the spill area already contains data, you get a **#SPILL!** error. Clear those cells and the result appears.",
      "syntax": "=SEQUENCE(rows, [columns], [start], [step])"
    },
    {
      "heading": "The four arguments explained",
      "content": "- `rows` (required): how many rows of numbers to return.\n- `columns` (optional): how many columns. Default = 1.\n- `start` (optional): the first number. Default = 1.\n- `step` (optional): how much to add each time. Default = 1. A negative step counts down, a decimal step like 0.5 is allowed.\n\nNumbers fill **across the row first**, then move to the next row. So `=SEQUENCE(2,3)` gives 1 2 3 in the first row and 4 5 6 in the second row.",
      "points": [
        "=SEQUENCE(5) -> 1,2,3,4,5 (vertical)",
        "=SEQUENCE(1,5) -> 1 2 3 4 5 (horizontal)",
        "=SEQUENCE(5,1,10,10) -> 10,20,30,40,50",
        "=SEQUENCE(5,1,5,-1) -> 5,4,3,2,1"
      ],
      "tip": "To skip an optional argument, leave it blank between commas: =SEQUENCE(5,,100) returns 100 to 104 in one column."
    },
    {
      "heading": "Dynamic serial numbers with COUNTA()",
      "content": "A typed serial number (1, 2, 3...) does not update when you add a new employee. Wrap `COUNTA()` inside SEQUENCE() so the count of rows is calculated from the data:\n\n`=SEQUENCE(COUNTA(B2:B100))`\n\nIf column B has 6 names, you get 1 to 6. Add a 7th name and the list grows to 7 automatically.",
      "tip": "Make sure the COUNTA range has no stray spaces or headers inside it, otherwise the count will be wrong."
    },
    {
      "heading": "Dates, text codes and month names",
      "content": "Dates in Excel are just numbers, so SEQUENCE() can create dates too:\n\n- `=SEQUENCE(7,1,DATE(2025,4,1),1)` gives 7 consecutive dates from 1-Apr-2025. Format the cells as Date (Ctrl+1 > Number > Date).\n- `=\"INV-\"&TEXT(SEQUENCE(5),\"0000\")` gives INV-0001 to INV-0005.\n- `=TEXT(DATE(2025,SEQUENCE(12),1),\"mmm\")` gives Jan to Dec.\n\nYou can also feed SEQUENCE() into other functions: `=SUM(SEQUENCE(100))` returns 5050 (the sum of 1 to 100)."
    },
    {
      "heading": "Referring to a spilled result",
      "content": "To use the whole spilled list in another formula, refer to the top-left cell with a **#** sign. If SEQUENCE() is in A2, then `=SUM(A2#)` adds every spilled value, even when the list size changes.\n\nYou cannot edit or delete one cell inside a spill range. Select the first cell (the formula cell) to change or delete the whole result.",
      "tip": "SEQUENCE() is not available in Excel 2016/2019. If the file opens there, users will see _xlfn.SEQUENCE and a #NAME? error."
    }
  ],
  "examples": [
    {
      "title": "Simple serial numbers 1 to 10",
      "scenario": "You are making a new attendance register and need S.No. 1 to 10 in column A starting from A2.",
      "steps": [
        "Click cell A2",
        "Type =SEQUENCE(10)",
        "Press Enter",
        "The numbers spill from A2 down to A11"
      ],
      "code": "=SEQUENCE(10)",
      "result": "A2:A11 show 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
      "explanation": "Only rows is given, so columns = 1, start = 1 and step = 1 by default."
    },
    {
      "title": "Auto-growing S.No. for an employee list",
      "scenario": "Employee names are in B2:B7. Create serial numbers in column A that adjust automatically when new names are added (B2:B100 is the maximum area).",
      "table": {
        "headers": [
          "A: S.No.",
          "B: Employee"
        ],
        "rows": [
          [
            "(formula)",
            "Rahul"
          ],
          [
            "",
            "Priya"
          ],
          [
            "",
            "Amit"
          ],
          [
            "",
            "Sneha"
          ],
          [
            "",
            "Karan"
          ],
          [
            "",
            "Pooja"
          ]
        ]
      },
      "steps": [
        "Click A2 and make sure A3:A7 are empty",
        "Type =SEQUENCE(COUNTA(B2:B100))",
        "Press Enter",
        "COUNTA counts 6 names, so SEQUENCE(6) spills 1 to 6",
        "Type a new name 'Vikas' in B8 and watch A8 show 7 automatically"
      ],
      "code": "=SEQUENCE(COUNTA(B2:B100))",
      "result": "A2:A7 show 1, 2, 3, 4, 5, 6 (and 7 appears after adding Vikas)",
      "explanation": "COUNTA counts non-empty cells, so the rows argument changes with your data. Avoid blank rows in between names because COUNTA skips them and the numbering will be short."
    },
    {
      "title": "Invoice numbers INV-0001 to INV-0005",
      "scenario": "The accounts team wants 5 ready invoice numbers in the format INV-0001.",
      "steps": [
        "Click cell A2",
        "Type =\"INV-\"&TEXT(SEQUENCE(5),\"0000\")",
        "Press Enter",
        "Values spill from A2 to A6"
      ],
      "code": "=\"INV-\"&TEXT(SEQUENCE(5),\"0000\")",
      "result": "INV-0001, INV-0002, INV-0003, INV-0004, INV-0005",
      "explanation": "TEXT(...,\"0000\") pads each number with leading zeros to 4 digits, and & joins the prefix. The result is text, which is correct for an ID."
    },
    {
      "title": "Date list for the first week of April",
      "scenario": "Create the dates 1-Apr-2025 to 7-Apr-2025 for a daily sales sheet.",
      "steps": [
        "Click cell A2",
        "Type =SEQUENCE(7,1,DATE(2025,4,1),1)",
        "Press Enter: you will see numbers like 45748",
        "Select A2:A8 and press Ctrl+1 > Number > Date (or Custom dd-mmm-yyyy)"
      ],
      "code": "=SEQUENCE(7,1,DATE(2025,4,1),1)",
      "result": "01-Apr-2025, 02-Apr-2025, 03-Apr-2025, 04-Apr-2025, 05-Apr-2025, 06-Apr-2025, 07-Apr-2025 (underlying values 45748 to 45754)",
      "explanation": "DATE(2025,4,1) is serial number 45748. Each step adds 1 day. Use step 7 for weekly dates."
    },
    {
      "title": "A 4 x 5 grid counting in tens",
      "scenario": "Create a grid of seat numbers 10, 20, 30 ... for a 4-row, 5-column hall layout.",
      "steps": [
        "Click cell B2",
        "Type =SEQUENCE(4,5,10,10)",
        "Press Enter",
        "The grid fills B2:F5 row by row"
      ],
      "code": "=SEQUENCE(4,5,10,10)",
      "result": "Row 1: 10 20 30 40 50 | Row 2: 60 70 80 90 100 | Row 3: 110 120 130 140 150 | Row 4: 160 170 180 190 200",
      "explanation": "With 4 rows and 5 columns SEQUENCE returns 20 numbers. It fills left-to-right first, then goes to the next row."
    },
    {
      "title": "Month names and sum of 1 to 100",
      "scenario": "Make Jan-Dec headers for a monthly budget, and quickly check the sum of numbers 1 to 100.",
      "steps": [
        "In B1 type =TEXT(DATE(2025,SEQUENCE(1,12),1),\"mmm\") and press Enter: it spills across B1:M1",
        "In A20 type =SUM(SEQUENCE(100)) and press Enter"
      ],
      "code": "=TEXT(DATE(2025,SEQUENCE(1,12),1),\"mmm\")\n=SUM(SEQUENCE(100))",
      "result": "B1:M1 show Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec; A20 shows 5050",
      "explanation": "SEQUENCE(1,12) gives 1 to 12 horizontally; DATE builds the 1st of each month; TEXT with \"mmm\" shows the short month name."
    }
  ],
  "interview": [
    {
      "q": "What does SEQUENCE() do?",
      "a": "It returns an array of sequential numbers. =SEQUENCE(rows,[columns],[start],[step]) spills the numbers into adjacent cells. Only rows is required; columns, start and step default to 1.",
      "level": "Easy"
    },
    {
      "q": "What is the output of =SEQUENCE(3,2)?",
      "a": "A 3-row by 2-column array: 1 2 / 3 4 / 5 6. Numbers fill across each row before moving down.",
      "level": "Easy"
    },
    {
      "q": "How do you create serial numbers that update automatically when rows are added?",
      "a": "Use =SEQUENCE(COUNTA(B2:B1000)) where column B holds the names. The row count is calculated each time, so the list grows or shrinks. In an Excel Table you could also use =ROW()-ROW(Table1[#Headers]).",
      "level": "Medium"
    },
    {
      "q": "Why might SEQUENCE() show #SPILL!?",
      "a": "Because one or more cells in the area where the result needs to spill are not empty (or are merged, or the formula is inside an Excel Table). Clear the cells or move the formula.",
      "level": "Easy"
    },
    {
      "q": "How would you generate only even numbers from 2 to 20?",
      "a": "=SEQUENCE(10,1,2,2). 10 values, starting at 2, step 2: 2,4,...,20.",
      "level": "Easy"
    },
    {
      "q": "How can you create a countdown 5,4,3,2,1?",
      "a": "Use a negative step: =SEQUENCE(5,1,5,-1).",
      "level": "Medium"
    },
    {
      "q": "How do you generate all dates of a month dynamically?",
      "a": "If the first date is in B1: =SEQUENCE(DAY(EOMONTH(B1,0)),1,B1). DAY(EOMONTH(...)) gives the number of days in that month, so April gives 30 rows and May gives 31.",
      "level": "Hard"
    },
    {
      "q": "How do you refer to the full spilled output of SEQUENCE() in another formula?",
      "a": "Use the spill range operator: if the formula is in A2, write A2#. For example =SUM(A2#) or =COUNT(A2#).",
      "level": "Medium"
    },
    {
      "q": "Will SEQUENCE() work in Excel 2016?",
      "a": "No. It is available only in Microsoft 365, Excel 2021 and later, and Excel for the web. Older versions show #NAME?.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Create S.No. 1 to 25 in A2 for a student marks sheet with one formula.",
      "hint": "Only rows is needed.",
      "solution": "Click A2, type =SEQUENCE(25), press Enter. Values 1 to 25 spill into A2:A26."
    },
    {
      "task": "Product codes are needed: P101, P102 ... P110. Write one formula.",
      "hint": "Start at 101 and join the text P.",
      "solution": "=\"P\"&SEQUENCE(10,1,101). Result: P101, P102, P103, P104, P105, P106, P107, P108, P109, P110."
    },
    {
      "task": "Generate every Monday for 4 weeks starting from 7-Apr-2025 (a Monday).",
      "hint": "Use step 7.",
      "solution": "=SEQUENCE(4,1,DATE(2025,4,7),7) then format as date. Result: 07-Apr-2025, 14-Apr-2025, 21-Apr-2025, 28-Apr-2025."
    },
    {
      "task": "Make EMI instalment numbers 1 to 12 in a row (B1:M1) instead of a column.",
      "hint": "Use rows = 1 and columns = 12.",
      "solution": "In B1 type =SEQUENCE(1,12). Result: 1 to 12 across B1:M1."
    },
    {
      "task": "Find the total of the first 50 natural numbers and the total of the first 10 multiples of 5 with SEQUENCE().",
      "hint": "Wrap SEQUENCE in SUM.",
      "solution": "=SUM(SEQUENCE(50)) = 1275. =SUM(SEQUENCE(10,1,5,5)) = 5+10+...+50 = 275."
    }
  ],
  "quiz": [
    {
      "question": "What is the result of =SEQUENCE(4)?",
      "options": [
        "1,2,3,4 in a column",
        "1,2,3,4 in a row",
        "4,3,2,1",
        "0,1,2,3"
      ],
      "answer": 0,
      "explanation": "Only rows = 4 is given, so 1 to 4 spill vertically."
    },
    {
      "question": "Which formula returns 100, 200, 300, 400, 500 in a column?",
      "options": [
        "=SEQUENCE(5,100)",
        "=SEQUENCE(5,1,100,100)",
        "=SEQUENCE(100,5)",
        "=SEQUENCE(1,5,100,100)"
      ],
      "answer": 1,
      "explanation": "rows=5, columns=1, start=100, step=100."
    },
    {
      "question": "Which argument of SEQUENCE() is required?",
      "options": [
        "start",
        "step",
        "rows",
        "columns"
      ],
      "answer": 2,
      "explanation": "Only rows is required; the others default to 1."
    },
    {
      "question": "=SEQUENCE(2,3) puts which value in the second row, first column?",
      "options": [
        "2",
        "3",
        "4",
        "5"
      ],
      "answer": 2,
      "explanation": "First row is 1 2 3, so the second row starts with 4."
    },
    {
      "question": "What does =SUM(SEQUENCE(10)) return?",
      "options": [
        "10",
        "45",
        "55",
        "100"
      ],
      "answer": 2,
      "explanation": "1+2+...+10 = 55."
    }
  ]
};
