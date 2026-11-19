// Day Task (auto-graded practice) for extra-24-excel-templates
export default {
  "lesson": "extra-24-excel-templates",
  "minutes": 12,
  "intro": "Create, use and edit Excel templates (.xltx / .xltm) so every new report starts from the same layout.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "What is the file extension of a normal Excel **template** (no macros)?",
      "accept": [
        ".xltx",
        "xltx"
      ],
      "explain": "Templates are saved as **.xltx** (File > Save As > Excel Template). Opening it creates a new unsaved copy (e.g. \"Invoice1\"), so the template itself is never overwritten."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Your invoice template contains a macro that numbers invoices. Which format must the template use?",
      "options": [
        ".xltx",
        ".xltm",
        ".xlsm",
        ".xlsx"
      ],
      "answer": 1,
      "explain": "**.xltm** is the macro-enabled template. Saving as .xltx would remove the VBA code. .xlsm is a macro-enabled workbook, not a template."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You double-click `Invoice.xltx`. What does Excel open?",
      "options": [
        "The template file itself for editing",
        "A new workbook based on the template, named like \"Invoice1\"",
        "A read-only copy",
        "An error because templates cannot be opened"
      ],
      "answer": 1,
      "explain": "Opening a template creates a **new workbook** based on it. To **edit the template itself**, right-click it > Open, or use File > Open and choose the .xltx."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "What should a good monthly-report template contain? (choose all that apply)",
      "options": [
        "Headings, formatting and column widths",
        "Formulas for totals and GST",
        "Data validation dropdowns",
        "Last month's actual sales data",
        "Protected formula cells"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "A template holds the **structure**: layout, formulas, validation, protection. Real data from last month should not be in it, otherwise every new report starts with old numbers."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Excel uses a template named **Book.xltx** as the default for every new workbook if it is saved in a special startup folder. What is that folder called?",
      "accept": [
        "XLSTART",
        "XLStart"
      ],
      "explain": "Save **Book.xltx** (and Sheet.xltx for new sheets) in the **XLSTART** folder (`%appdata%\\Microsoft\\Excel\\XLSTART`). From then on Ctrl+N uses your fonts, margins and styles."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The invoice template has the **total formula** ready in D6. Write it: the sum of line amounts D2:D5 plus GST at the rate in **F1**.",
      "example": {
        "title": "total with tax",
        "code": "=SUM(C2:C10)*(1+$H$1)"
      },
      "grid": {
        "A1": "Item",
        "B1": "Qty",
        "C1": "Rate",
        "D1": "Amount",
        "F1": "0.18",
        "A2": "A4 Paper Ream",
        "B2": "5",
        "C2": "260",
        "D2": "1300",
        "A3": "Stapler",
        "B3": "2",
        "C3": "180",
        "D3": "360",
        "A4": "Ink Cartridge",
        "B4": "1",
        "C4": "950",
        "D4": "950",
        "A5": "File Folder",
        "B5": "10",
        "C5": "45",
        "D5": "450"
      },
      "starter": "",
      "solution": "=SUM(D2:D5)*(1+F1)",
      "explain": "Amounts total 3,060; with 18% GST: 3,060 × 1.18 = **3,610.80**. Putting the rate in a cell (F1) instead of typing 18% in the formula makes the template easy to update."
    }
  ]
};
