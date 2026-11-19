// Day Task (auto-graded practice) for extra-02-freeze-panes
export default {
  "lesson": "extra-02-freeze-panes",
  "minutes": 12,
  "intro": "Keep headers and key columns visible while you scroll, using the active-cell rule of Freeze Panes.",
  "tasks": [
    {
      "type": "fill",
      "mins": 1,
      "q": "On which **Ribbon tab** is the **Freeze Panes** button?",
      "accept": [
        "View",
        "View tab"
      ],
      "explain": "Freeze Panes lives on **View > Window > Freeze Panes** (options: Freeze Panes, Freeze Top Row, Freeze First Column). It is not on the Home tab, which is a common guess."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want **row 1** (headers) and **column A** (employee names) to stay visible. Which cell must be active before you click **View > Freeze Panes > Freeze Panes**?",
      "options": [
        "A1",
        "A2",
        "B2",
        "B1"
      ],
      "answer": 2,
      "explain": "Excel freezes everything **above** and **to the left of** the active cell. To freeze row 1 and column A, select **B2**. Selecting A1 freezes nothing useful (or the middle of the window)."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Rows **1 to 3** (title + headers) and columns **A and B** (Emp ID and Name) must stay visible. Which cell do you select before Freeze Panes? (cell address)",
      "accept": [
        "C4"
      ],
      "explain": "The active cell must be the **first scrolling cell**: the row after the last frozen row (4) and the column after the last frozen column (C) → **C4**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Your attendance sheet has a 2-row title, and the real headers are in **row 3**. You choose **Freeze Top Row**. What happens?",
      "options": [
        "Rows 1-3 are frozen",
        "Only row 1 (the title) is frozen, so the headers in row 3 scroll away",
        "Excel freezes the row that contains headers automatically",
        "Nothing is frozen"
      ],
      "answer": 1,
      "explain": "**Freeze Top Row** always freezes row 1 only. When headers are lower, select **A4** and use **Freeze Panes** so rows 1-3 stay visible."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about Freeze Panes are **TRUE**? (choose all that apply)",
      "options": [
        "Only one freeze setting can exist per worksheet",
        "Freeze Panes changes what is printed on every page",
        "You cannot freeze rows in the middle of the sheet without freezing the rows above them",
        "Freeze Panes and Split cannot be used at the same time",
        "Freeze Panes is saved with the workbook"
      ],
      "answers": [
        0,
        2,
        3,
        4
      ],
      "explain": "Freezing is a **screen** setting saved with the file; it always freezes from the top/left edge. It does **not** affect printing (for that use Page Layout > Print Titles > Rows to repeat at top). Turning on Freeze removes a Split and vice versa."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "How do you remove a freeze?",
      "options": [
        "Press Esc",
        "View > Freeze Panes > Unfreeze Panes",
        "Home > Clear > Clear Formats",
        "Delete the frozen rows"
      ],
      "answer": 1,
      "explain": "When a freeze is active the first menu item changes to **Unfreeze Panes** (View > Freeze Panes > Unfreeze Panes). You never need to delete rows to remove a freeze."
    }
  ]
};
