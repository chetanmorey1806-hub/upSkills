// Day Task (auto-graded practice) for day-06-formatting-cells-font
export default {
  "lesson": "day-06-formatting-cells-font",
  "minutes": 15,
  "intro": "Format text with font, size, colour, bold, italic and underline, and remember that formatting never changes the value.",
  "tasks": [
    {
      "type": "multi",
      "mins": 2,
      "q": "Which shortcuts are correct? (choose all that apply)",
      "options": [
        "Ctrl+B = Bold",
        "Ctrl+I = Italic",
        "Ctrl+U = Underline",
        "Ctrl+1 = Format Cells dialog",
        "Ctrl+5 = Bold"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Bold **Ctrl+B** (or Ctrl+2), Italic **Ctrl+I** (or Ctrl+3), Underline **Ctrl+U** (or Ctrl+4), Format Cells **Ctrl+1**. **Ctrl+5** is Strikethrough, not Bold."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you find the **Double Underline** option?",
      "options": [
        "Home > Font > Underline drop-down arrow",
        "Insert > Text",
        "View > Show",
        "Data > Tools"
      ],
      "answer": 0,
      "explain": "Click the small arrow next to the **U** button in **Home > Font** and choose **Double Underline**. It is also in Format Cells (Ctrl+1) > Font tab > Underline. It is used for grand totals in accounting reports."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **increases the font size** of the selected cell by one step?",
      "accept": [
        "Ctrl+Shift+>"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*>\\s*$",
        "^\\s*(ctrl|control)\\s*\\+\\s*Shift\\s*\\+\\s*\\.\\s*$"
      ],
      "explain": "**Ctrl + Shift + >** grows the font, **Ctrl + Shift + <** shrinks it. You can also click Home > Font > Increase Font Size (A^)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Cell B2 has the number 500 formatted **bold, red, size 16**. C2 has `=B2*2`. What does C2 show?",
      "options": [
        "1000",
        "500",
        "#VALUE!",
        "0"
      ],
      "answer": 0,
      "explain": "Formatting changes only how a cell **looks**, never its value. B2 is still 500, so C2 = 500 x 2 = **1000**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want all report headers to look the same (bold, fill, border) in one click. What should you use?",
      "options": [
        "Cell Styles (Home > Styles > Cell Styles)",
        "Wrap Text",
        "Merge & Center",
        "Freeze Panes"
      ],
      "answer": 0,
      "explain": "**Cell Styles** (e.g. Heading 1, Title, Total) apply a whole set of formats at once and keep headers consistent across sheets."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "The headers in row 1 are bold and coloured, but the values are normal numbers. Write a formula for the **total sales** of the four items (add the cells B2 to B5).",
      "example": {
        "title": "adding a column of numbers",
        "code": "=SUM(C2:C10)"
      },
      "grid": {
        "A1": "Product",
        "B1": "Sales",
        "A2": "Rice",
        "B2": "1250",
        "A3": "Dal",
        "B3": "980",
        "A4": "Oil",
        "B4": "1540",
        "A5": "Sugar",
        "B5": "620"
      },
      "starter": "",
      "solution": "=SUM(B2:B5)",
      "explain": "Formatting does not affect calculations: `=SUM(B2:B5)` (or `=B2+B3+B4+B5`) gives 4390 whatever the font or colour. Any formula with the correct result passes."
    }
  ]
};
