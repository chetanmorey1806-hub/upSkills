// Day Task (auto-graded practice) for extra-03-split-windows
export default {
  "lesson": "extra-03-split-windows",
  "minutes": 12,
  "intro": "Split one sheet into independently scrolling panes and compare sheets with New Window and View Side by Side.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "The active cell is **C10** and you click **View > Split**. What do you get?",
      "options": [
        "Two panes, split above row 10",
        "Two panes, split left of column C",
        "Four panes, split above row 10 and left of column C",
        "Nothing, because Split needs a selected range"
      ],
      "answer": 2,
      "explain": "Split works like Freeze Panes: it splits **above and to the left** of the active cell. A cell not in row 1 or column A gives **four** panes."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The active cell is **A15** and you click **View > Split**. What do you get?",
      "options": [
        "A horizontal split above row 15 (two panes, top and bottom)",
        "A vertical split (left and right panes)",
        "Four panes",
        "An error"
      ],
      "answer": 0,
      "explain": "In column A there is nothing to the left, so only a **horizontal** split above row 15 is created: two panes one above the other. A cell in row 1 (e.g. E1) gives a vertical split."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements describe the difference between **Split** and **Freeze Panes**? (choose all that apply)",
      "options": [
        "In Split every pane can scroll on its own",
        "In Freeze Panes the frozen part cannot scroll",
        "Split is used to compare two far-apart areas, e.g. row 5 with row 4,800",
        "Split creates a copy of the data",
        "You can drag the split bar to resize the panes"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Split = several scrollable **views** of the same sheet (no copy is made), handy for checking a total at the bottom against the first rows. Freeze = locked headers that never scroll."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "You opened **Sales.xlsx** and clicked **View > New Window**. The second window shows Sheet2 of the same file. In View Side by Side, which button makes both windows scroll **together**?",
      "accept": [
        "Synchronous Scrolling",
        "Synchronous scroll"
      ],
      "explain": "**View > Window > Synchronous Scrolling** (active with View Side by Side) scrolls both windows at the same time, perfect for comparing this month's sheet with last month's line by line."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "After **View > New Window** on `Sales.xlsx`, what does the title bar of the new window show?",
      "options": [
        "Sales (Copy).xlsx",
        "Sales.xlsx:2",
        "Book2",
        "Sales.xlsx - Read Only"
      ],
      "answer": 1,
      "explain": "New Window opens a second **view** of the same workbook, named **Sales.xlsx:2** (the first becomes :1). Changes typed in either window go into the same file; it is not a copy."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which is the quickest way to remove a split?",
      "options": [
        "Press Ctrl+Z",
        "Click View > Split again (or double-click the split bar)",
        "Close and reopen the file",
        "View > Freeze Panes > Unfreeze"
      ],
      "answer": 1,
      "explain": "**Split** is a toggle button: click it again to remove all splits, or double-click a split bar to remove just that bar. Ctrl + Z does not undo view changes."
    }
  ]
};
