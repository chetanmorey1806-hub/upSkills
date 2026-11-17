export default {
  "id": "extra-27-power-query-m-language",
  "title": "Power Query M Language Basics",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 27,
  "level": "Advanced",
  "duration": "2 hours",
  "summary": "Every action you click in the Power Query Editor is written as M code. Knowing basic M lets you read and fix queries, write custom columns, handle errors and create reusable functions, which is a strong skill for data analyst and MIS jobs.",
  "objectives": [
    "Read the let ... in structure and step names of an M query",
    "Use M values: numbers, text, dates, lists, records and tables",
    "Write custom columns with each, _, if-then-else and try-otherwise",
    "Use common Table, Text, List and Date functions and create a custom function"
  ],
  "theory": [
    {
      "heading": "Where M code lives",
      "content": "- **Formula bar**: Power Query Editor > View > tick **Formula Bar**. Shows the code of the selected step.\n- **Advanced Editor**: Home > **Advanced Editor** (or View > Advanced Editor). Shows the full query.\n- **Applied Steps** pane: each step = one line of M.\n- **Blank query**: Data > Get Data > From Other Sources > **Blank Query** to write M from scratch.\n\nM is **case-sensitive**: `Table.AddColumn` works, `table.addcolumn` gives an error. Text comparison is also case-sensitive: `\"a\" = \"A\"` is false."
    },
    {
      "heading": "The let ... in structure",
      "content": "A query is a list of named steps:\n\n`let Step1 = ..., Step2 = ...Step1..., Step3 = ...Step2... in Step3`\n\nIn the Advanced Editor this is written with one step per line, indented under let, and the final step name indented under in.\n\n- Each step is `Name = expression` and ends with a comma, **except the last step before `in`**.\n- A step usually uses the previous step's name.\n- `in` says which step is the final output.\n- Names with spaces are written as `#\"Changed Type\"`.\n- Comments: `// single line` or `/* multi line */`.",
      "tip": "The most common Advanced Editor error is a missing or extra comma at the end of a step. 'Token Comma expected' or 'Token Identifier expected' usually means exactly this."
    },
    {
      "heading": "Values and data types",
      "content": "- Number: `100`, `2.5`  |  Text: `\"Pune\"` (double quotes only)  |  Logical: `true`, `false`  |  `null` = empty\n- Date: `#date(2025, 4, 15)`, DateTime: `#datetime(2025, 4, 15, 10, 30, 0)`, Duration: `#duration(1, 0, 0, 0)` (1 day)\n- **List** (curly braces): `{1, 2, 3}`, `{1..5}`, `{\"North\", \"South\"}`\n- **Record** (square brackets): `[Name = \"Riya\", Marks = 88]`; read a field with `[Marks]`\n- **Table**: `#table({\"Item\", \"Qty\"}, {{\"Pen\", 10}, {\"Pencil\", 20}})`\n\nColumn types in steps: `type text`, `type number`, `type date`, `type logical`, `Int64.Type` (whole number), `Currency.Type`.",
      "points": [
        "List.Sum({1..5}) -> 15",
        "[Name = \"Riya\", Marks = 88][Marks] -> 88",
        "{\"A\", \"B\", \"C\"}{0} -> \"A\" (index starts at 0)",
        "Date.Year(#date(2025, 4, 15)) -> 2025"
      ]
    },
    {
      "heading": "Operators, each and _",
      "content": "- Arithmetic: `+ - * /`  |  Text join: `&` (`\"INV-\" & \"101\"`)  |  Compare: `= <> > >= < <=`  |  Logic: `and`, `or`, `not`\n- Joining text with a number needs conversion: `\"Total: \" & Text.From(100)`.\n- Any calculation with `null` gives `null`: `null + 1` = null.\n\n**each** is shorthand for a function that runs on every row. `each [Qty] * [Rate]` means: for each row, take the Qty field times the Rate field.\n\n**_** (underscore) is the current item. In `Table.TransformColumns(..., {{\"Name\", each Text.Upper(_)}})` the _ is the cell value of Name."
    },
    {
      "heading": "Conditions and error handling",
      "content": "**if then else** (all lowercase, `else` is mandatory):\n\n`each if [Sales] >= 60000 then \"High\" else if [Sales] >= 40000 then \"Medium\" else \"Low\"`\n\n**try ... otherwise** returns a fallback when an error occurs (like IFERROR):\n\n`each try Number.From([Qty]) otherwise 0`\n\n**Custom functions** use `=>`:\n\n`(amount as number, rate as number) as number => amount * (1 + rate)`",
      "tip": "Number.Round uses banker's rounding by default: Number.Round(12.5) = 12 and Number.Round(13.5) = 14. Use Number.Round(12.5, 0, RoundingMode.AwayFromZero) to get 13 like Excel's ROUND."
    },
    {
      "heading": "Most used functions",
      "content": "- **Table**: Table.SelectRows (filter), Table.AddColumn, Table.RemoveColumns, Table.SelectColumns, Table.RenameColumns, Table.TransformColumnTypes, Table.TransformColumns, Table.Group, Table.Sort, Table.NestedJoin (merge), Table.Combine (append), Table.UnpivotOtherColumns, Table.RowCount\n- **Text**: Text.Trim, Text.Upper, Text.Lower, Text.Proper, Text.Length, Text.Start, Text.End, Text.Contains, Text.Replace, Text.From\n- **List**: List.Sum, List.Average, List.Max, List.Min, List.Count, List.Distinct\n- **Date**: Date.Year, Date.Month, Date.Day, Date.AddDays, Date.ToText, Date.From\n- **Number**: Number.From, Number.Round",
      "tip": "Type a function name like Table.Group in the formula bar of a blank query and press Enter to see its documentation and parameters."
    }
  ],
  "examples": [
    {
      "title": "Build a table and add Amount and GST columns",
      "scenario": "Create a small purchase table directly in M and add Amount = Qty x Rate and GST = 18% of Amount.",
      "table": {
        "headers": [
          "Item",
          "Qty",
          "Rate"
        ],
        "rows": [
          [
            "Pen",
            "10",
            "12"
          ],
          [
            "Notebook",
            "5",
            "60"
          ],
          [
            "Stapler",
            "2",
            "150"
          ]
        ]
      },
      "steps": [
        "Data > Get Data > From Other Sources > Blank Query",
        "Home > Advanced Editor",
        "Delete the existing text and paste the code below > Done",
        "Home > Close & Load"
      ],
      "code": "let\n    Source = #table(\n        type table [Item = text, Qty = number, Rate = number],\n        {{\"Pen\", 10, 12}, {\"Notebook\", 5, 60}, {\"Stapler\", 2, 150}}\n    ),\n    AddAmount = Table.AddColumn(Source, \"Amount\", each [Qty] * [Rate], type number),\n    AddGST = Table.AddColumn(AddAmount, \"GST\", each [Amount] * 0.18, type number)\nin\n    AddGST",
      "result": "Pen: Amount 120, GST 21.6 | Notebook: Amount 300, GST 54 | Stapler: Amount 300, GST 54",
      "explanation": "10x12 = 120, 5x60 = 300, 2x150 = 300; 18% of 120 = 21.6, of 300 = 54. AddGST uses the column created in AddAmount, showing how steps build on each other."
    },
    {
      "title": "Filter rows and add a category with if-then-else",
      "scenario": "Keep salespersons with sales of at least ₹40,000 and label them High (>= 60000) or Medium.",
      "table": {
        "headers": [
          "Salesperson",
          "Sales"
        ],
        "rows": [
          [
            "Amit",
            "45000"
          ],
          [
            "Neha",
            "62000"
          ],
          [
            "Ravi",
            "38000"
          ],
          [
            "Pooja",
            "71000"
          ],
          [
            "Karan",
            "50000"
          ]
        ]
      },
      "steps": [
        "Blank Query > Advanced Editor > paste the code > Done",
        "Check the preview",
        "Close & Load"
      ],
      "code": "let\n    Source = #table(\n        type table [Salesperson = text, Sales = number],\n        {{\"Amit\", 45000}, {\"Neha\", 62000}, {\"Ravi\", 38000}, {\"Pooja\", 71000}, {\"Karan\", 50000}}\n    ),\n    Filtered = Table.SelectRows(Source, each [Sales] >= 40000),\n    AddCategory = Table.AddColumn(Filtered, \"Category\", each if [Sales] >= 60000 then \"High\" else if [Sales] >= 40000 then \"Medium\" else \"Low\", type text)\nin\n    AddCategory",
      "result": "Amit 45000 Medium | Neha 62000 High | Pooja 71000 High | Karan 50000 Medium (Ravi removed)",
      "explanation": "Table.SelectRows keeps rows where the condition is true. The UI equivalent is the filter arrow (filter) and Add Column > Conditional Column (if-then-else)."
    },
    {
      "title": "Clean text columns with Table.TransformColumns",
      "scenario": "Customer names and cities have extra spaces and wrong case. Make names Proper case and cities UPPER case.",
      "table": {
        "headers": [
          "Name",
          "City"
        ],
        "rows": [
          [
            "  rahul SHARMA ",
            "pune"
          ],
          [
            "priya desai ",
            " MUMBAI"
          ]
        ]
      },
      "steps": [
        "Blank Query > Advanced Editor > paste the code > Done",
        "Close & Load"
      ],
      "code": "let\n    Source = #table(\n        {\"Name\", \"City\"},\n        {{\"  rahul SHARMA \", \"pune\"}, {\"priya desai \", \" MUMBAI\"}}\n    ),\n    Cleaned = Table.TransformColumns(\n        Source,\n        {{\"Name\", each Text.Proper(Text.Trim(_)), type text}, {\"City\", each Text.Upper(Text.Trim(_)), type text}}\n    )\nin\n    Cleaned",
      "result": "Rahul Sharma | PUNE ; Priya Desai | MUMBAI",
      "explanation": "_ is the current cell value. Text.Trim removes leading/trailing spaces (not double spaces in the middle), then Text.Proper / Text.Upper fix the case. Same as Transform > Format > Trim and Capitalize Each Word in the UI."
    },
    {
      "title": "Group by region: total sales and order count",
      "scenario": "Summarise sales by region with a total and the number of orders.",
      "table": {
        "headers": [
          "Region",
          "Sales"
        ],
        "rows": [
          [
            "North",
            "50000"
          ],
          [
            "South",
            "42000"
          ],
          [
            "North",
            "61000"
          ],
          [
            "South",
            "39000"
          ],
          [
            "East",
            "45000"
          ]
        ]
      },
      "steps": [
        "Blank Query > Advanced Editor > paste the code > Done",
        "Close & Load"
      ],
      "code": "let\n    Source = #table(\n        type table [Region = text, Sales = number],\n        {{\"North\", 50000}, {\"South\", 42000}, {\"North\", 61000}, {\"South\", 39000}, {\"East\", 45000}}\n    ),\n    Grouped = Table.Group(\n        Source,\n        {\"Region\"},\n        {{\"Total Sales\", each List.Sum([Sales]), type number}, {\"Orders\", each Table.RowCount(_), Int64.Type}}\n    )\nin\n    Grouped",
      "result": "North 111000, 2 orders | South 81000, 2 orders | East 45000, 1 order",
      "explanation": "Inside Table.Group, _ is the sub-table of each region, so [Sales] is a list of that region's sales and List.Sum adds it. UI: Home > Group By > Advanced."
    },
    {
      "title": "Create and use a custom function",
      "scenario": "Write a reusable AddGST function and use it in a new column.",
      "table": {
        "headers": [
          "Item",
          "Amount",
          "Rate"
        ],
        "rows": [
          [
            "Printer",
            "1000",
            "0.18"
          ],
          [
            "Rice bag",
            "2500",
            "0.05"
          ]
        ]
      },
      "steps": [
        "Blank Query > Advanced Editor > paste the code > Done",
        "Close & Load"
      ],
      "code": "let\n    AddGST = (amount as number, rate as number) as number => amount * (1 + rate),\n    Source = #table(\n        type table [Item = text, Amount = number, Rate = number],\n        {{\"Printer\", 1000, 0.18}, {\"Rice bag\", 2500, 0.05}}\n    ),\n    WithGST = Table.AddColumn(Source, \"Total\", each AddGST([Amount], [Rate]), type number)\nin\n    WithGST",
      "result": "Printer Total 1180 | Rice bag Total 2625",
      "explanation": "A function is just another step whose value is a function. To share it across queries, save the function alone as its own query named AddGST and call it from other queries."
    },
    {
      "title": "Handle bad values with try ... otherwise",
      "scenario": "A Qty column imported as text contains a wrong entry 'abc'. Convert to numbers and use 0 where conversion fails.",
      "table": {
        "headers": [
          "Item",
          "Qty"
        ],
        "rows": [
          [
            "Pen",
            "10"
          ],
          [
            "Pencil",
            "abc"
          ],
          [
            "Eraser",
            "5"
          ]
        ]
      },
      "steps": [
        "Blank Query > Advanced Editor > paste the code > Done",
        "Close & Load"
      ],
      "code": "let\n    Source = #table({\"Item\", \"Qty\"}, {{\"Pen\", \"10\"}, {\"Pencil\", \"abc\"}, {\"Eraser\", \"5\"}}),\n    QtyNumber = Table.AddColumn(Source, \"QtyNum\", each try Number.From([Qty]) otherwise 0, type number),\n    TotalQty = List.Sum(QtyNumber[QtyNum])\nin\n    QtyNumber",
      "result": "QtyNum: Pen 10, Pencil 0, Eraser 5 (the TotalQty step evaluates to 15 if you click it)",
      "explanation": "Number.From(\"abc\") raises an error; try catches it and otherwise returns 0. QtyNumber[QtyNum] gives the column as a list. The in clause returns QtyNumber, so TotalQty is only a side calculation."
    }
  ],
  "interview": [
    {
      "q": "What is M in Power Query?",
      "a": "M (Power Query Formula Language) is the functional, case-sensitive language that stores every transformation step. The UI generates it and you can edit it in the formula bar or Advanced Editor.",
      "level": "Easy"
    },
    {
      "q": "Explain the let ... in expression.",
      "a": "let contains named steps separated by commas; each step can use earlier steps. The expression after in is the query's output, usually the last step.",
      "level": "Easy"
    },
    {
      "q": "What do each and _ mean?",
      "a": "each creates a one-parameter function (each [Qty]*2 is (_) => _[Qty]*2). _ is that parameter: the current row in Table.AddColumn/SelectRows or the current value in TransformColumns.",
      "level": "Medium"
    },
    {
      "q": "Difference between a list, a record and a table in M?",
      "a": "A list is an ordered set of values in {}; a record is a set of named fields in []; a table is rows of records with named columns. Table[Column] returns a list; Table{0} returns a record (first row).",
      "level": "Medium"
    },
    {
      "q": "How do you handle errors in M?",
      "a": "Use try expression otherwise fallback, or try expression to get a record with HasError/Value/Error. In UI: Transform > Replace Errors or Home > Remove Rows > Remove Errors.",
      "level": "Medium"
    },
    {
      "q": "Why does Number.Round(2.5) return 2?",
      "a": "M uses banker's rounding (RoundingMode.ToEven) by default. Use Number.Round(2.5, 0, RoundingMode.AwayFromZero) to get 3.",
      "level": "Hard"
    },
    {
      "q": "How do you reference a step whose name contains spaces?",
      "a": "With #\"...\" syntax, e.g. #\"Changed Type\".",
      "level": "Easy"
    },
    {
      "q": "How do you create a custom function in M?",
      "a": "Write (param1 as type, param2) => expression, e.g. (x as number) => x * 1.18. Save it as a query to call it from other queries, or use Add Column > Invoke Custom Function.",
      "level": "Medium"
    },
    {
      "q": "Is M case-sensitive?",
      "a": "Yes. Function names, step names, column names and text comparisons are case-sensitive. Text.Upper works, text.upper does not; \"pune\" = \"Pune\" is false.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between Table.SelectColumns and Table.RemoveColumns?",
      "a": "SelectColumns keeps only listed columns (safer when the source adds new columns); RemoveColumns deletes listed columns and fails if a listed column no longer exists, unless MissingField.Ignore is used.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Write M to create a table of 3 students (Riya 88, Aman 75, Neha 92) and add a column Result = \"Pass\" if marks >= 80 else \"Review\".",
      "hint": "#table + Table.AddColumn + if.",
      "solution": "let\n    Source = #table(type table [Student = text, Marks = number], {{\"Riya\", 88}, {\"Aman\", 75}, {\"Neha\", 92}}),\n    AddResult = Table.AddColumn(Source, \"Result\", each if [Marks] >= 80 then \"Pass\" else \"Review\", type text)\nin\n    AddResult\nOutput: Riya Pass, Aman Review, Neha Pass."
    },
    {
      "task": "Using the same table, keep only students with Marks > 80 and sort by Marks descending.",
      "hint": "Table.SelectRows and Table.Sort.",
      "solution": "Filtered = Table.SelectRows(Source, each [Marks] > 80),\nSorted = Table.Sort(Filtered, {{\"Marks\", Order.Descending}})\nOutput: Neha 92, Riya 88."
    },
    {
      "task": "Evaluate these in a blank query: List.Sum({1..10}), Text.Length(\"Excel\"), Date.Month(#date(2025, 8, 15)), \"INV-\" & Text.From(101).",
      "hint": "Create one blank query per expression, or a record.",
      "solution": "Write = [a = List.Sum({1..10}), b = Text.Length(\"Excel\"), c = Date.Month(#date(2025, 8, 15)), d = \"INV-\" & Text.From(101)]. Results: a = 55, b = 5, c = 8, d = \"INV-101\"."
    },
    {
      "task": "Rename column \"Sales\" to \"Revenue\" and change its type to Currency in M.",
      "hint": "Table.RenameColumns and Table.TransformColumnTypes.",
      "solution": "Renamed = Table.RenameColumns(Source, {{\"Sales\", \"Revenue\"}}),\nTyped = Table.TransformColumnTypes(Renamed, {{\"Revenue\", Currency.Type}})"
    },
    {
      "task": "Write a custom function Discount(price, pct) and test it with price 5000 and pct 0.15.",
      "hint": "Use => and call the function.",
      "solution": "let\n    Discount = (price as number, pct as number) as number => price * (1 - pct),\n    Result = Discount(5000, 0.15)\nin\n    Result\nOutput: 4250."
    }
  ],
  "quiz": [
    {
      "question": "Which keyword marks the output of an M query?",
      "options": [
        "return",
        "in",
        "output",
        "end"
      ],
      "answer": 1,
      "explanation": "let defines steps; in specifies the result."
    },
    {
      "question": "A list in M is written with:",
      "options": [
        "[ ]",
        "( )",
        "{ }",
        "< >"
      ],
      "answer": 2,
      "explanation": "Curly braces create lists; square brackets create records."
    },
    {
      "question": "What does each [Qty] * 2 do in Table.AddColumn?",
      "options": [
        "Doubles the column once",
        "Calculates Qty x 2 for every row",
        "Filters Qty",
        "Renames Qty"
      ],
      "answer": 1,
      "explanation": "each runs the expression for each row."
    },
    {
      "question": "Which expression returns 0 when conversion fails?",
      "options": [
        "if Number.From([Qty]) then 0",
        "try Number.From([Qty]) otherwise 0",
        "IFERROR(Number.From([Qty]),0)",
        "Number.From([Qty]) or 0"
      ],
      "answer": 1,
      "explanation": "try ... otherwise handles errors in M."
    },
    {
      "question": "Is \"Pune\" = \"pune\" true in M?",
      "options": [
        "Yes",
        "No, M is case-sensitive",
        "Only in Excel",
        "Gives an error"
      ],
      "answer": 1,
      "explanation": "Text comparison in M is case-sensitive."
    }
  ]
};
