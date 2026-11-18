// Day Task (auto-graded practice) for day-07-cell-alignment-wrap-merge
export default {
  "lesson": "day-07-cell-alignment-wrap-merge",
  "minutes": 15,
  "intro": "Control alignment, Wrap Text, Merge & Center and text orientation, and learn the safer Center Across Selection.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "By default, how does Excel align **text** and **numbers** horizontally?",
      "options": [
        "Both left",
        "Text left, numbers right",
        "Text right, numbers left",
        "Both centre"
      ],
      "answer": 1,
      "explain": "With General alignment, **text is left-aligned and numbers (and dates) are right-aligned**. A \"number\" that sits on the left is usually stored as text, which is a quick way to spot data problems."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut inserts a **line break inside a cell** while typing?",
      "accept": [
        "Alt+Enter"
      ],
      "acceptRegex": [
        "^\\s*Alt\\s*\\+\\s*Enter\\s*$"
      ],
      "explain": "**Alt + Enter** starts a new line in the same cell (Excel turns on Wrap Text automatically). Pressing just Enter moves to the next cell."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which option centres a title across A1:F1 **without** merging the cells (so sorting and copying still work)?",
      "options": [
        "Merge Across",
        "Center Across Selection",
        "Wrap Text",
        "Shrink to Fit"
      ],
      "answer": 1,
      "explain": "**Center Across Selection** (Ctrl+1 > Alignment > Horizontal) looks like Merge & Center but keeps every cell separate. Merged cells cause problems with sorting, filtering and copy-paste."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does **Merge & Center** do if A1 has \"Sales Report\" and B1 has \"2025\"?",
      "options": [
        "Keeps both values",
        "Keeps only the upper-left value (A1) and deletes B1",
        "Keeps only B1",
        "Joins them as \"Sales Report 2025\""
      ],
      "answer": 1,
      "explain": "When merging, Excel keeps only the **upper-left** cell's value and warns that other values will be discarded. To join text use a formula like `=A1&\" \"&B1` instead."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which settings are on the **Alignment** tab of Format Cells (Ctrl+1)? (choose all that apply)",
      "options": [
        "Horizontal and Vertical alignment",
        "Wrap text",
        "Shrink to fit",
        "Orientation (degrees)",
        "Font colour"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "The Alignment tab has horizontal/vertical alignment, indent, **Wrap text, Shrink to fit, Merge cells** and **Orientation**. Font colour is on the Font tab."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Instead of merging A2 and B2, build the full title in one cell with a formula: join the **city** in A2, a space, and the **year** in B2 (result: `Pune 2025`).",
      "example": {
        "title": "joining text with &",
        "code": "=A5&\"-\"&B5"
      },
      "grid": {
        "A1": "City",
        "B1": "Year",
        "A2": "Pune",
        "B2": "2025"
      },
      "starter": "",
      "solution": "=A2&\" \"&B2",
      "explain": "The `&` operator joins text: `=A2&\" \"&B2` gives **Pune 2025**. Merge & Center would throw away B2's value; a formula keeps both. Forgetting the `\" \"` gives \"Pune2025\"."
    }
  ]
};
