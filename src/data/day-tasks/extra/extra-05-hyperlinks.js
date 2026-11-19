// Day Task (auto-graded practice) for extra-05-hyperlinks
export default {
  "lesson": "extra-05-hyperlinks",
  "minutes": 15,
  "intro": "Insert and build hyperlinks to sheets, websites and email, and manage them without accidentally clicking.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut opens the **Insert Hyperlink** dialog?",
      "accept": [
        "Ctrl+K"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*K\\s*$"
      ],
      "explain": "**Ctrl + K** (or Insert > Link) opens the dialog where you choose Existing File or Web Page, Place in This Document, Create New Document or E-mail Address."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which formula makes a link that jumps to cell **A1** of the **Summary** sheet in the same workbook?",
      "options": [
        "=HYPERLINK(\"Summary!A1\",\"Go to Summary\")",
        "=HYPERLINK(\"#Summary!A1\",\"Go to Summary\")",
        "=HYPERLINK(Summary!A1,\"Go to Summary\")",
        "=LINK(\"Summary\",\"A1\")"
      ],
      "answer": 1,
      "explain": "Inside the workbook, the link location must start with **#**: `\"#Summary!A1\"`. Without # Excel looks for a **file** called Summary and shows \"Cannot open the specified file\". If the sheet name has spaces, use quotes: `\"#'Sales Report'!A1\"`."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Complete the formula so that clicking opens a new email to HR: `=HYPERLINK(\"______hr@shreeinfotech.in\", \"Email HR\")` (type only the missing prefix)",
      "accept": [
        "mailto:"
      ],
      "explain": "Email links use the **mailto:** prefix, e.g. `=HYPERLINK(\"mailto:hr@shreeinfotech.in\",\"Email HR\")`. You can even add a subject: `\"mailto:hr@x.in?subject=Leave\"`."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Each product page on the company website is `https://shop.example.in/p/` followed by the product code. Write the **link_location text** for the product in **A3** (you would put this inside HYPERLINK). Build it with `&`.",
      "example": {
        "title": "joining fixed text with a cell",
        "code": "=\"https://maps.example.com/?q=\"&B2"
      },
      "grid": {
        "A1": "Code",
        "B1": "Product",
        "A2": "P101",
        "B2": "Steel Bottle",
        "A3": "P205",
        "B3": "Lunch Box",
        "A4": "P330",
        "B4": "Water Jug"
      },
      "starter": "",
      "solution": "=\"https://shop.example.in/p/\"&A3",
      "explain": "The first argument of HYPERLINK can be **built with a formula**: `=HYPERLINK(\"https://shop.example.in/p/\"&A3, B3)`. Copy it down and every row links to its own page. Here the text is `https://shop.example.in/p/P205`."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you **select** a cell that contains a hyperlink **without opening** the link?",
      "options": [
        "Double-click it",
        "Click and hold the mouse button for a second (or move to it with the arrow keys)",
        "Right-click > Open Hyperlink",
        "Press Ctrl+K twice"
      ],
      "answer": 1,
      "explain": "A normal click follows the link. **Click and hold** until the pointer becomes a cross, or move to the cell with the **arrow keys**; then you can edit it."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are correct ways to **remove** hyperlinks? (choose all that apply)",
      "options": [
        "Right-click the cell > Remove Hyperlink",
        "Select cells > Home > Clear > Clear Hyperlinks (keeps formatting) or Remove Hyperlinks",
        "Delete the cell content (for an inserted link)",
        "Press F9",
        "Ctrl + Shift + F9"
      ],
      "answers": [
        0,
        1,
        2
      ],
      "explain": "**Remove Hyperlink** (right-click) or **Home > Clear > Clear/Remove Hyperlinks** removes the link but keeps the text. For a `=HYPERLINK()` formula, replace the formula. F9 recalculates and Ctrl+Shift+F9 does not exist for this."
    }
  ]
};
