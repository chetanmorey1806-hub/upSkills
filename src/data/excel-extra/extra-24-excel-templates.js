export default {
  "id": "extra-24-excel-templates",
  "title": "Excel Templates",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 24,
  "level": "Intermediate",
  "duration": "1 hour",
  "summary": "An Excel template (.xltx) is a ready-made file with layout, formulas, formatting and validation already set up. Every time you open it, Excel creates a fresh copy, so the original never gets overwritten. Offices use templates for invoices, salary slips, attendance registers and monthly reports.",
  "objectives": [
    "Use built-in Excel templates from File > New",
    "Create and save your own template as .xltx / .xltm",
    "Set the personal templates folder and open templates from the Personal tab",
    "Protect template input cells and set default workbook templates"
  ],
  "theory": [
    {
      "heading": "What is a template and why use it?",
      "content": "A template is a **master file**. When you open it, Excel opens a copy named e.g. `GST_Invoice1` instead of the original. You fill the copy and save it as a normal .xlsx.\n\nBenefits:\n- Same format every time (company logo, headers, fonts)\n- Formulas already in place, fewer mistakes\n- New staff can use it without knowing formulas\n- The master cannot be overwritten by accident\n\nFile types:\n- `.xltx` - Excel Template (no macros)\n- `.xltm` - Excel Macro-Enabled Template\n- `.xlt` - old Excel 97-2003 template"
    },
    {
      "heading": "Using built-in templates",
      "content": "1. **File > New** (or Ctrl+N gives a blank workbook directly).\n2. Browse the featured templates or type in the search box: `invoice`, `budget`, `attendance`, `expense`.\n3. Click a template > **Create**.\n4. Excel opens a copy. Edit, fill and save as .xlsx.\n\nOnline templates need an internet connection to download the first time."
    },
    {
      "heading": "Creating your own template",
      "content": "1. Build the sheet: headings, formulas, formats, data validation, print settings (Page Layout).\n2. **Delete sample data** but keep formulas.\n3. Unlock input cells: select them > Ctrl+1 > Protection > untick **Locked**. Then **Review > Protect Sheet** (optional password) so users can type only in input cells.\n4. **File > Save As > Browse**. In **Save as type** choose **Excel Template (*.xltx)** (or Excel Macro-Enabled Template (*.xltm) if it has macros). Excel moves to the default templates folder automatically.\n5. Give a clear name, e.g. `GST_Invoice.xltx` > Save.\n\nShortcut: F12 opens the Save As dialog directly.",
      "tip": "Keep the template in the folder shown at File > Options > Save > Default personal templates location (usually C:\\Users\\<you>\\Documents\\Custom Office Templates). Then it appears under File > New > Personal."
    },
    {
      "heading": "Opening and editing templates",
      "content": "- **To USE the template**: File > New > **Personal** tab > click it. A copy opens (e.g. GST_Invoice1).\n- Double-clicking a .xltx in File Explorer also creates a new copy.\n- **To EDIT the master**: File > Open > Browse to the .xltx, or right-click the file in File Explorer > **Open**. Make changes and save again as .xltx.",
      "tip": "If you see the Personal tab missing, set the Default personal templates location in File > Options > Save and restart Excel."
    },
    {
      "heading": "Default workbook and sheet templates",
      "content": "You can make every NEW workbook start with your company's format:\n\n1. Format a blank workbook (fonts, header/footer, column widths).\n2. Save it as **Book.xltx** in the XLSTART folder (type `%appdata%\\Microsoft\\Excel\\XLSTART` in File Explorer's address bar).\n3. Restart Excel. Ctrl+N and new blank workbooks now use this format.\n\nSave a one-sheet template as **Sheet.xltx** in the same folder to control new sheets inserted with Shift+F11.\n\nTo undo, delete Book.xltx / Sheet.xltx from XLSTART."
    }
  ],
  "examples": [
    {
      "title": "Create a GST invoice template",
      "scenario": "Build a reusable invoice that calculates Amount, CGST 9%, SGST 9% and Grand Total. Test it with the sample items, then clear them and save as a template.",
      "table": {
        "headers": [
          "A: Item",
          "B: Qty",
          "C: Rate (₹)",
          "D: Amount (₹)"
        ],
        "rows": [
          [
            "Printer paper (ream)",
            "10",
            "250",
            "=IF(B2=\"\",\"\",B2*C2)"
          ],
          [
            "Toner cartridge",
            "2",
            "1800",
            "(same formula)"
          ],
          [
            "Stapler",
            "5",
            "120",
            "(same formula)"
          ]
        ]
      },
      "steps": [
        "In D2 type =IF(B2=\"\",\"\",B2*C2) and fill down to D11",
        "In C13 type Subtotal and in D13 =SUM(D2:D11)",
        "C14 CGST 9%: D14 =ROUND(D13*9%,2)",
        "C15 SGST 9%: D15 =ROUND(D13*9%,2)",
        "C16 Grand Total: D16 =D13+D14+D15",
        "Test with sample data, then delete A2:C4 (keep the formulas)",
        "File > Save As > Browse > Save as type: Excel Template (*.xltx) > File name: GST_Invoice > Save"
      ],
      "code": "=IF(B2=\"\",\"\",B2*C2)\n=SUM(D2:D11)\n=ROUND(D13*9%,2)\n=D13+D14+D15",
      "result": "With sample data: Amounts 2500, 3600, 600; Subtotal 6700; CGST 603; SGST 603; Grand Total 7906",
      "explanation": "10x250 = 2500, 2x1800 = 3600, 5x120 = 600. 9% of 6700 = 603. 6700 + 603 + 603 = 7906. The IF keeps empty rows blank, and SUM ignores the \"\" text."
    },
    {
      "title": "Protect input cells in the invoice template",
      "scenario": "Users should type only Item, Qty and Rate, not overwrite formulas.",
      "steps": [
        "Open the master: File > Open > Browse > GST_Invoice.xltx",
        "Select A2:C11 > Ctrl+1 > Protection tab > untick Locked > OK",
        "Review > Protect > Protect Sheet > keep 'Select unlocked cells' ticked, optionally untick 'Select locked cells' > enter password (optional) > OK",
        "Press Ctrl+S to save the template again"
      ],
      "result": "In new invoices, users can type only in A2:C11. Trying to edit D2 shows: 'The cell or chart you're trying to change is on a protected sheet.'",
      "explanation": "All cells are Locked by default, but locking takes effect only after Protect Sheet. Unlocking input cells first is the key step."
    },
    {
      "title": "Use the template for a new invoice",
      "scenario": "Create the invoice for customer Sharma Traders using your template.",
      "steps": [
        "File > New > Personal > GST_Invoice",
        "A copy named GST_Invoice1 opens",
        "Enter items, quantities and rates",
        "File > Save As > choose folder > Save as type Excel Workbook (*.xlsx) > name Invoice_Sharma_Traders_001 > Save"
      ],
      "result": "A new .xlsx invoice is saved; GST_Invoice.xltx stays empty and unchanged",
      "explanation": "Because a template always opens as a copy, the master is safe from accidental overwrite."
    },
    {
      "title": "Use a built-in expense template",
      "scenario": "Your manager needs a monthly expense tracker quickly.",
      "steps": [
        "File > New",
        "Type expense in the search box and press Enter",
        "Click a template such as an expense or budget tracker > Create",
        "Replace sample data with your expenses and save as .xlsx"
      ],
      "result": "A pre-formatted expense workbook opens with tables, totals and charts ready to use",
      "explanation": "Built-in templates are a fast starting point; you can customise them and then save your version as your own .xltx."
    },
    {
      "title": "Make every new workbook use company formatting",
      "scenario": "All new workbooks should use Calibri 11, company name in the header and A4 landscape.",
      "steps": [
        "Open a blank workbook",
        "Page Layout > Orientation > Landscape; Size > A4",
        "Insert > Header & Footer: type the company name in the centre header",
        "Delete extra sheets if needed",
        "F12 > Save as type Excel Template (*.xltx) > browse to %appdata%\\Microsoft\\Excel\\XLSTART > File name Book > Save",
        "Close and restart Excel, then press Ctrl+N"
      ],
      "result": "New workbooks open in A4 landscape with the company header already set",
      "explanation": "Excel uses Book.xltx in XLSTART as the default for new workbooks. Remove the file to go back to normal."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between .xlsx and .xltx?",
      "a": ".xlsx is a normal workbook that opens itself. .xltx is a template: opening it creates a new untitled copy, so the original stays unchanged.",
      "level": "Easy"
    },
    {
      "q": "How do you save a file as a template?",
      "a": "File > Save As > Browse (or F12), choose Save as type Excel Template (*.xltx) or Excel Macro-Enabled Template (*.xltm), name it and save.",
      "level": "Easy"
    },
    {
      "q": "Where are personal templates stored and how do you open them?",
      "a": "In the folder set at File > Options > Save > Default personal templates location (often Documents\\Custom Office Templates). Open them from File > New > Personal.",
      "level": "Medium"
    },
    {
      "q": "How do you edit the original template instead of a copy?",
      "a": "Use File > Open and browse to the .xltx, or right-click it in File Explorer and choose Open. Then save it again as .xltx.",
      "level": "Medium"
    },
    {
      "q": "Which template type should be used if the file contains macros?",
      "a": ".xltm (Excel Macro-Enabled Template). A .xltx cannot store VBA.",
      "level": "Easy"
    },
    {
      "q": "How can you prevent users from overwriting formulas in a template?",
      "a": "Unlock only the input cells (Ctrl+1 > Protection > untick Locked) and then Review > Protect Sheet.",
      "level": "Medium"
    },
    {
      "q": "What is Book.xltx?",
      "a": "A template saved in the XLSTART folder that Excel uses as the default for every new blank workbook.",
      "level": "Hard"
    },
    {
      "q": "What should a good template contain?",
      "a": "Clear headings, formulas with blank-handling (IF(...=\"\",\"\",...)), data validation drop-downs, number formats, print settings, protected formulas, instructions for users and no leftover sample data.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Create a salary slip template with Basic in B3, HRA = 40% of basic, DA = 10%, PF = 12%, and Net Pay. Test with Basic 30000.",
      "hint": "Write formulas, test, then clear Basic and save as .xltx.",
      "solution": "B4 =B3*40%, B5 =B3*10%, B6 =B3*12%, B7 =B3+B4+B5-B6. With 30000: HRA 12000, DA 3000, PF 3600, Net 41400. Clear B3, File > Save As > Excel Template (*.xltx) > Salary_Slip."
    },
    {
      "task": "Add a drop-down for Department (HR, Finance, IT, Sales) in the salary slip template and protect all cells except Name, Department and Basic.",
      "hint": "Data Validation + unlock inputs + Protect Sheet.",
      "solution": "Select department cell > Data > Data Validation > List > Source: HR,Finance,IT,Sales. Select input cells > Ctrl+1 > Protection > untick Locked. Review > Protect Sheet. Save the template."
    },
    {
      "task": "Find out where your personal templates are saved and change it to D:\\Templates.",
      "hint": "File > Options > Save.",
      "solution": "File > Options > Save > Default personal templates location: type D:\\Templates > OK. Save templates there; they appear in File > New > Personal."
    },
    {
      "task": "Create a monthly attendance register template with dates 1 to 31 across the top and a total present formula for each employee.",
      "hint": "Use =COUNTIF(range,\"P\").",
      "solution": "Row 1: Name, then 1..31 in B1:AF1 (or =SEQUENCE(1,31)). For each employee in AG2: =COUNTIF(B2:AF2,\"P\"). Add Data Validation list P,A,L on B2:AF50. Save as Attendance.xltx."
    }
  ],
  "quiz": [
    {
      "question": "The extension of a normal (macro-free) Excel template is:",
      "options": [
        ".xlsx",
        ".xltx",
        ".xlsm",
        ".xlsb"
      ],
      "answer": 1,
      "explanation": ".xltx is the template format."
    },
    {
      "question": "When you open a template from File > New > Personal, Excel:",
      "options": [
        "Opens the original file",
        "Opens a new copy",
        "Opens as read-only original",
        "Converts it to PDF"
      ],
      "answer": 1,
      "explanation": "A copy like Invoice1 is created."
    },
    {
      "question": "Which template type stores macros?",
      "options": [
        ".xltx",
        ".xltm",
        ".csv",
        ".xls"
      ],
      "answer": 1,
      "explanation": ".xltm is the macro-enabled template."
    },
    {
      "question": "Where is the personal templates location set?",
      "options": [
        "File > Options > Save",
        "Data > Templates",
        "Review > Protect",
        "View > Macros"
      ],
      "answer": 0,
      "explanation": "Default personal templates location is in File > Options > Save."
    },
    {
      "question": "Locked cells are protected only after:",
      "options": [
        "Saving as .xltx",
        "Review > Protect Sheet",
        "Ctrl+S",
        "Format as Table"
      ],
      "answer": 1,
      "explanation": "The Locked property takes effect when the sheet is protected."
    }
  ]
};
