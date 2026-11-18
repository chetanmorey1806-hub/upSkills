// Day Task (auto-graded practice) for day-02-excel-interface
export default {
  "lesson": "day-02-excel-interface",
  "minutes": 15,
  "intro": "Identify each part of the Excel window: Ribbon, Formula Bar, Name Box, Sheet Tabs and Status Bar.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which part of the Excel window shows the **address of the active cell** (for example `C5`) and lets you type an address to jump to it?",
      "options": [
        "Formula Bar",
        "Name Box",
        "Status Bar",
        "Quick Access Toolbar"
      ],
      "answer": 1,
      "explain": "The **Name Box** is at the left end of the Formula Bar. It shows the active cell address and you can type any address (like `Z100`) and press Enter to jump there. The Formula Bar shows the cell **content**, not the address."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You click a cell that shows **540**, but you want to see whether it is a typed number or a formula. Where do you look?",
      "options": [
        "Name Box",
        "Status Bar",
        "Formula Bar",
        "Sheet Tab"
      ],
      "answer": 2,
      "explain": "The cell shows the **result**; the **Formula Bar** shows what is really stored in the cell, e.g. `=B2*C2`. This is the fastest way to check if a value is typed or calculated."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Select a block of numbers. Which values does the **Status Bar** show by default? (choose all that apply)",
      "options": [
        "Sum",
        "Average",
        "Count",
        "Median",
        "Standard deviation"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "By default the Status Bar shows **Average, Count and Sum** of the selected cells. You can right-click the Status Bar to add Minimum, Maximum and Numerical Count. Median and standard deviation are not options there."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **keyboard key** shows the shortcut letters (KeyTips) on the Ribbon tabs?",
      "accept": [
        "Alt",
        "Alt key"
      ],
      "explain": "Press **Alt** and Excel shows KeyTips letters on every tab (e.g. Alt, H for Home). This lets you use any Ribbon command without the mouse."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **hides or shows the Ribbon** (collapses it)?",
      "accept": [
        "Ctrl+F1"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*F1\\s*$"
      ],
      "explain": "Press **Ctrl + F1** to collapse or expand the Ribbon so you get more space for the data. Double-clicking a tab name does the same."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The Ribbon is organised as **Tabs > ______ > Commands**. What is the middle level called?",
      "options": [
        "Menus",
        "Groups",
        "Panels",
        "Sheets"
      ],
      "answer": 1,
      "explain": "Each tab (Home, Insert, Formulas...) is divided into **groups** (e.g. Home > Font, Home > Alignment) and each group contains commands (Bold, Wrap Text...). Lesson menu paths are written like **Home > Font > Bold**."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The Status Bar would show the **Sum** of the three sales values. Write the formula that gives the same total in a cell by adding the three cells with `+`.",
      "example": {
        "title": "adding cells",
        "code": "=A2+A3"
      },
      "grid": {
        "A1": "Day",
        "B1": "Sales",
        "A2": "Mon",
        "B2": "1200",
        "A3": "Tue",
        "B3": "950",
        "A4": "Wed",
        "B4": "1430"
      },
      "starter": "",
      "solution": "=B2+B3+B4",
      "explain": "The Status Bar total is only a quick view: it is not saved in the sheet. To keep a total in the report you write a formula such as `=B2+B3+B4` (later you will learn `=SUM(B2:B4)`, which also works)."
    }
  ]
};
