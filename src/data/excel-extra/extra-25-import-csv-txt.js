export default {
  "id": "extra-25-import-csv-txt",
  "title": "Importing CSV and TXT Files",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 25,
  "level": "Intermediate",
  "duration": "1.5 hours",
  "summary": "Most software (Tally exports, banking portals, ERP and HR systems) gives data as CSV or TXT files. This lesson shows how to import them correctly with Data > From Text/CSV (Power Query), choose delimiter and encoding, keep leading zeros, fix Indian date formats and refresh the import when a new file arrives.",
  "objectives": [
    "Explain CSV, TXT, delimiters and encoding",
    "Import CSV/TXT using Data > Get Data > From Text/CSV and the preview dialog",
    "Avoid common problems: lost leading zeros, wrong dates, garbled ₹ symbols",
    "Read and adjust the M code Excel generates, and refresh imports"
  ],
  "theory": [
    {
      "heading": "What are CSV and TXT files?",
      "content": "- **CSV** (Comma Separated Values): plain text where each line is a row and commas separate columns.\n- **TXT**: plain text where columns are separated by tab, pipe |, semicolon, or fixed widths.\n\nA CSV opened in Notepad looks like:\n\n`InvoiceNo,Date,Customer,Amount`\n`INV-101,01-04-2025,Sharma Traders,12500`\n\nThe character that separates columns is the **delimiter**. Text that itself contains a comma is wrapped in double quotes: `\"Gupta, Sons\"`.\n\nCSV/TXT files have NO formatting, NO formulas and only ONE sheet."
    },
    {
      "heading": "Why not just double-click the CSV?",
      "content": "Double-clicking opens a CSV directly, but Excel guesses data types:\n- Employee IDs like `00125` become `125` (leading zeros lost).\n- Long numbers like 16-digit card/account numbers are turned into 1.23457E+15 and digits after 15 become 0.\n- Dates like `05-04-2025` may become 4-May instead of 5-April on a US-setting PC.\n- ₹ and Hindi text may appear garbled if the file is UTF-8.\n\nImporting through **Power Query** lets you control every column's type and encoding, and refresh later."
    },
    {
      "heading": "Import with Data > From Text/CSV",
      "content": "1. **Data > Get & Transform Data > From Text/CSV** (or Data > Get Data > From File > From Text/CSV).\n2. Select the file > **Import**.\n3. In the preview dialog set:\n   - **File Origin**: 65001: Unicode (UTF-8) for files with ₹ or Indian language text.\n   - **Delimiter**: Comma, Tab, Semicolon, Space, --Custom-- (e.g. |) or --Fixed Width--.\n   - **Data Type Detection**: Based on first 200 rows / Based on entire dataset / Do not detect data types.\n4. Click **Load** (to a new sheet as a Table), **Load To...** (choose Table, PivotTable, Only Create Connection, Add to Data Model), or **Transform Data** to clean in Power Query Editor first.",
      "tip": "Choose Transform Data whenever IDs, PIN codes or dates are present, so you can set the correct types before loading."
    },
    {
      "heading": "Fixing types: Text IDs and Indian dates",
      "content": "In the Power Query Editor:\n- **Keep leading zeros**: click the column header type icon (123) > **Text**. If asked, choose Replace current.\n- **dd-mm-yyyy dates**: right-click the column > **Change Type > Using Locale...** > Data Type: Date, Locale: **English (India)** > OK.\n- **Amounts**: set to Decimal Number or Fixed Decimal Number.\n\nThen **Home > Close & Load**.",
      "tip": "Delete the automatic 'Changed Type' step if it already destroyed leading zeros, then set types yourself."
    },
    {
      "heading": "The M code behind a CSV import",
      "content": "Every click is recorded as M code (Home > Advanced Editor). A typical CSV import:\n\n- `Csv.Document(File.Contents(path), [Delimiter=\",\", Encoding=65001, QuoteStyle=QuoteStyle.Csv])` reads the file.\n- `Table.PromoteHeaders` uses the first row as headers.\n- `Table.TransformColumnTypes(..., \"en-IN\")` sets types with the Indian locale.\n\nDelimiter values: `\",\"` comma, `\"|\"` pipe, `\";\"` semicolon, `\"#(tab)\"` tab.",
      "tip": "To point the query to a new month's file, change the path in the Source step (click the gear icon next to Source) or use Data > Get Data > Data Source Settings > Change Source."
    },
    {
      "heading": "Refreshing, legacy wizard and saving as CSV",
      "content": "- **Refresh**: replace the CSV with the new file (same name/location) and press **Data > Refresh All** (Ctrl+Alt+F5). Right-click the table > Refresh refreshes one query.\n- **Legacy Text Import Wizard**: File > Options > Data > tick **From Text (Legacy)**. Then Data > Get Data > Legacy Wizards > From Text (Legacy). Step 1 Delimited/Fixed width, Step 2 delimiter, Step 3 column data format (Text/Date DMY/Do not import).\n- **Saving as CSV**: File > Save As > **CSV UTF-8 (Comma delimited) (*.csv)**. Only the active sheet is saved and formatting/formulas are lost (values only).\n- **Many CSV files in one folder**: Data > Get Data > From File > **From Folder** > Combine & Transform."
    }
  ],
  "examples": [
    {
      "title": "Import a sales CSV and set correct types",
      "scenario": "File C:\\Data\\sales_apr.csv contains invoices. Dates are in dd-mm-yyyy. Import it so dates are correct and Amount is numeric.",
      "table": {
        "headers": [
          "A: InvoiceNo",
          "B: Date",
          "C: Customer",
          "D: Amount"
        ],
        "rows": [
          [
            "INV-101",
            "01-04-2025",
            "Sharma Traders",
            "12500"
          ],
          [
            "INV-102",
            "03-04-2025",
            "Gupta & Sons",
            "8400"
          ],
          [
            "INV-103",
            "05-04-2025",
            "Mehta Stores",
            "15200"
          ]
        ]
      },
      "steps": [
        "Data > From Text/CSV > select sales_apr.csv > Import",
        "File Origin: 65001: Unicode (UTF-8), Delimiter: Comma",
        "Click Transform Data",
        "Right-click the Date column > Change Type > Using Locale > Date, English (India) > OK",
        "Set Amount to Decimal Number and InvoiceNo to Text",
        "Home > Close & Load",
        "In F2 type =SUM(Table_sales_apr[Amount]) (the table name may differ; check Table Design > Table Name)"
      ],
      "code": "let\n    Source = Csv.Document(File.Contents(\"C:\\Data\\sales_apr.csv\"), [Delimiter = \",\", Columns = 4, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),\n    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),\n    ChangedType = Table.TransformColumnTypes(PromotedHeaders, {{\"InvoiceNo\", type text}, {\"Date\", type date}, {\"Customer\", type text}, {\"Amount\", type number}}, \"en-IN\")\nin\n    ChangedType",
      "result": "A table with 3 rows; dates show 01-04-2025 = 1 April 2025, 03-04-2025 = 3 April, 05-04-2025 = 5 April; total Amount = 36100",
      "explanation": "12500 + 8400 + 15200 = 36100. The \"en-IN\" culture tells Power Query that the day comes first. Without it, on a US-locale PC 05-04-2025 could become 4 May 2025."
    },
    {
      "title": "Import a pipe-delimited TXT and keep leading zeros",
      "scenario": "HR exported employees.txt with | as separator. Employee IDs like 00125 must keep their zeros, and PIN codes must stay as text.",
      "table": {
        "headers": [
          "A: EmpID",
          "B: Name",
          "C: PIN"
        ],
        "rows": [
          [
            "00125",
            "Ravi Kumar",
            "400001"
          ],
          [
            "00126",
            "Sita Rao",
            "411002"
          ],
          [
            "00127",
            "John D'Souza",
            "560001"
          ]
        ]
      },
      "steps": [
        "Data > From Text/CSV > select employees.txt > Import",
        "Delimiter: --Custom-- and type |",
        "Click Transform Data",
        "In Applied Steps delete Changed Type",
        "Select EmpID and PIN > Transform > Data Type > Text",
        "Home > Close & Load"
      ],
      "code": "let\n    Source = Csv.Document(File.Contents(\"C:\\Data\\employees.txt\"), [Delimiter = \"|\", Columns = 3, Encoding = 65001, QuoteStyle = QuoteStyle.None]),\n    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),\n    ChangedType = Table.TransformColumnTypes(PromotedHeaders, {{\"EmpID\", type text}, {\"Name\", type text}, {\"PIN\", type text}})\nin\n    ChangedType",
      "result": "EmpID shows 00125, 00126, 00127 (left-aligned text); PIN codes 400001, 411002, 560001 as text",
      "explanation": "If the type is set to Whole Number, 00125 becomes 125. IDs and PIN codes are labels, not quantities, so Text is correct."
    },
    {
      "title": "Import a tab-delimited bank statement",
      "scenario": "The bank portal gives statement.txt separated by tabs, with ₹ amounts and narration.",
      "table": {
        "headers": [
          "A: TxnDate",
          "B: Narration",
          "C: Debit",
          "D: Credit"
        ],
        "rows": [
          [
            "02-04-2025",
            "NEFT-Sharma Traders",
            "",
            "25000"
          ],
          [
            "04-04-2025",
            "Electricity Bill",
            "3450",
            ""
          ],
          [
            "07-04-2025",
            "Salary Transfer",
            "120000",
            ""
          ]
        ]
      },
      "steps": [
        "Data > From Text/CSV > statement.txt > Import",
        "Delimiter: Tab, File Origin: 65001: Unicode (UTF-8)",
        "Transform Data",
        "Change Type > Using Locale > Date, English (India) for TxnDate",
        "Set Debit and Credit to Decimal Number (blanks become null)",
        "Close & Load",
        "Total debit: =SUM(Table_statement[Debit])"
      ],
      "code": "let\n    Source = Csv.Document(File.Contents(\"C:\\Data\\statement.txt\"), [Delimiter = \"#(tab)\", Columns = 4, Encoding = 65001, QuoteStyle = QuoteStyle.None]),\n    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),\n    ChangedType = Table.TransformColumnTypes(PromotedHeaders, {{\"TxnDate\", type date}, {\"Narration\", type text}, {\"Debit\", type number}, {\"Credit\", type number}}, \"en-IN\")\nin\n    ChangedType",
      "result": "Total Debit = 123450, Total Credit = 25000",
      "explanation": "3450 + 120000 = 123450. In M, #(tab) represents the tab character. Empty cells become null and are ignored by SUM."
    },
    {
      "title": "Refresh the import with next month's file",
      "scenario": "May's file arrives with the same name and columns. Update the report without importing again.",
      "steps": [
        "Replace C:\\Data\\sales_apr.csv with the new file (same name), or",
        "Data > Get Data > Data Source Settings > select the file path > Change Source > browse to sales_may.csv > OK > Close",
        "Data > Refresh All (Ctrl+Alt+F5)"
      ],
      "result": "The table and all formulas/PivotTables based on it now show May data; all cleaning steps are reapplied automatically",
      "explanation": "Power Query remembers every step. As long as column names stay the same, Refresh All repeats the whole process in seconds."
    },
    {
      "title": "Use the legacy Text Import Wizard for a fixed-width file",
      "scenario": "An old system exports a fixed-width TXT with Code (5 chars), Item (15 chars), Qty.",
      "table": {
        "headers": [
          "Raw line"
        ],
        "rows": [
          [
            "10001Ball Pen       250"
          ],
          [
            "10002Notebook A4    120"
          ]
        ]
      },
      "steps": [
        "File > Options > Data > tick From Text (Legacy) > OK",
        "Data > Get Data > Legacy Wizards > From Text (Legacy) > select the file > Import",
        "Step 1: Fixed width > Next",
        "Step 2: click to set break lines after position 5 and 20 > Next",
        "Step 3: select Code column > Text; Qty > General > Finish",
        "Choose Existing worksheet =$A$1 > OK"
      ],
      "result": "Columns: 10001 | Ball Pen | 250 and 10002 | Notebook A4 | 120 (Code kept as text)",
      "explanation": "Fixed-width files have no delimiter; each field occupies fixed character positions. In Power Query choose Delimiter --Fixed Width-- and enter positions 0,5,20 for the same result."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between CSV and XLSX?",
      "a": "CSV is plain text with one sheet, no formatting, no formulas, columns separated by a delimiter. XLSX is a zipped XML workbook that can hold multiple sheets, formulas, formatting, charts and tables.",
      "level": "Easy"
    },
    {
      "q": "Why do leading zeros disappear when you open a CSV and how do you prevent it?",
      "a": "Excel converts 00125 to the number 125. Import via Data > From Text/CSV > Transform Data and set the column type to Text (or Step 3 Text in the legacy wizard).",
      "level": "Easy"
    },
    {
      "q": "A CSV shows dates 05-04-2025 as 4 May. How do you fix it?",
      "a": "In Power Query right-click the column > Change Type > Using Locale > Date with English (India), or use Table.TransformColumnTypes(..., \"en-IN\"). In the legacy wizard set Column data format Date: DMY.",
      "level": "Medium"
    },
    {
      "q": "What does File Origin 65001 mean?",
      "a": "UTF-8 encoding. It correctly reads ₹ symbols, accented and Indian language characters. Wrong encoding shows garbled characters like â‚¹.",
      "level": "Medium"
    },
    {
      "q": "How is a tab delimiter written in M code?",
      "a": "\"#(tab)\". For example Csv.Document(File.Contents(path),[Delimiter=\"#(tab)\"]).",
      "level": "Medium"
    },
    {
      "q": "How do you combine 12 monthly CSV files with the same structure?",
      "a": "Put them in one folder > Data > Get Data > From File > From Folder > Combine & Transform Data. New files added to the folder are included on Refresh.",
      "level": "Hard"
    },
    {
      "q": "What are the Load options after import?",
      "a": "Load (Table in a new sheet), Load To: Table / PivotTable Report / PivotChart / Only Create Connection, with an option to Add this data to the Data Model.",
      "level": "Medium"
    },
    {
      "q": "What happens to formulas when you save a workbook as CSV?",
      "a": "Only the values of the active sheet are saved. Formulas, formatting and other sheets are lost.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "A CSV has columns Mobile (10 digits), Name, City. Import it so Mobile stays text and Name is in Proper case.",
      "hint": "Transform Data, change type, Format > Capitalize Each Word.",
      "solution": "Data > From Text/CSV > Transform Data. Mobile > Data Type Text. Select Name > Transform > Format > Capitalize Each Word. Close & Load."
    },
    {
      "task": "A semicolon-separated file products.txt has Code;Product;Price. Write the M Source step.",
      "hint": "Delimiter \";\".",
      "solution": "Source = Csv.Document(File.Contents(\"C:\\Data\\products.txt\"), [Delimiter = \";\", Encoding = 65001, QuoteStyle = QuoteStyle.None]), then Table.PromoteHeaders(Source, [PromoteAllScalars = true])."
    },
    {
      "task": "Import a CSV only as a connection and create a PivotTable from it without loading rows to a sheet.",
      "hint": "Use Load To.",
      "solution": "Data > From Text/CSV > select file > Load > Load To... > PivotTable Report (or Only Create Connection, then Insert > PivotTable > Use an external data source / From Data Model if added to the Data Model)."
    },
    {
      "task": "Set an imported CSV query to refresh automatically when the workbook opens.",
      "hint": "Query Properties.",
      "solution": "Data > Queries & Connections > right-click the query > Properties > tick Refresh data when opening the file > OK."
    },
    {
      "task": "Save the sheet 'Summary' as a UTF-8 CSV for uploading to a portal.",
      "hint": "Activate the sheet first.",
      "solution": "Select the Summary sheet > File > Save As > Browse > Save as type: CSV UTF-8 (Comma delimited) (*.csv) > Save > click OK/Yes for the single-sheet warning."
    }
  ],
  "quiz": [
    {
      "question": "Which menu imports a CSV through Power Query?",
      "options": [
        "Insert > Table",
        "Data > From Text/CSV",
        "Home > Paste",
        "Review > Import"
      ],
      "answer": 1,
      "explanation": "Data > Get & Transform Data > From Text/CSV."
    },
    {
      "question": "File Origin 65001 stands for:",
      "options": [
        "Windows ANSI",
        "UTF-8",
        "ASCII",
        "Unicode UTF-16"
      ],
      "answer": 1,
      "explanation": "65001 is the UTF-8 code page."
    },
    {
      "question": "To keep 00125 as 00125 you should set the column type to:",
      "options": [
        "Whole Number",
        "Decimal",
        "Text",
        "Date"
      ],
      "answer": 2,
      "explanation": "Text keeps leading zeros."
    },
    {
      "question": "Which shortcut refreshes all queries in a workbook?",
      "options": [
        "Ctrl+R",
        "F9",
        "Ctrl+Alt+F5",
        "Alt+F11"
      ],
      "answer": 2,
      "explanation": "Ctrl+Alt+F5 = Refresh All."
    },
    {
      "question": "Saving a workbook as CSV keeps:",
      "options": [
        "All sheets and formulas",
        "Only values of the active sheet",
        "Charts",
        "Formatting"
      ],
      "answer": 1,
      "explanation": "CSV stores plain text values of one sheet."
    }
  ]
};
