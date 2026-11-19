// Day Task (auto-graded practice) for day-29-sorting-data
export default {
  "lesson": "day-29-sorting-data",
  "minutes": 15,
  "intro": "Sort tables safely: ascending, descending, multi-level and custom-list sorts.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where is the **Custom Sort** dialog (for multi-level sorts)?",
      "options": [
        "Home > Editing > Sort & Filter > Custom Sort, or Data > Sort & Filter > Sort",
        "Insert > Sort",
        "View > Sort",
        "Formulas > Sort"
      ],
      "answer": 0,
      "explain": "Open **Data > Sort & Filter > Sort** (or Home > Editing > Sort & Filter > Custom Sort). There you can add levels like \"Department A to Z, then Salary Largest to Smallest\"."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You select **only the Salary column** and click Sort Largest to Smallest. Excel shows a **Sort Warning**. What should you choose?",
      "options": [
        "Continue with the current selection",
        "Expand the selection",
        "Cancel and delete the column",
        "Sort the column twice"
      ],
      "answer": 1,
      "explain": "Choose **Expand the selection** so whole rows move together. \"Continue with the current selection\" sorts only Salary and mixes up which salary belongs to which employee, the most dangerous sorting mistake."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You want Priority sorted as **High, Medium, Low** (not alphabetically). What do you use?",
      "options": [
        "Sort A to Z",
        "Sort Z to A",
        "A Custom List in the Order drop-down",
        "Filter"
      ],
      "answer": 2,
      "explain": "A to Z would give High, Low, Medium. In the Sort dialog choose **Order > Custom List** and enter High, Medium, Low. Month and weekday names already have built-in custom lists."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which of these can you sort by in the Sort dialog **\"Sort On\"** box? (choose all that apply)",
      "options": [
        "Cell Values",
        "Cell Color",
        "Font Color",
        "Conditional Formatting Icon",
        "Formula length"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "\"Sort On\" offers **Cell Values, Cell Color, Font Color and Conditional Formatting Icon**. There is no option to sort by formula length."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "In ascending order, how does Excel sort the values **10, 2, 33** when they are stored as **text**?",
      "options": [
        "2, 10, 33",
        "10, 2, 33",
        "33, 10, 2",
        "2, 33, 10"
      ],
      "answer": 1,
      "explain": "Text is sorted character by character: \"1\" comes before \"2\" before \"3\", so the order is **10, 2, 33**. Convert text numbers to real numbers to sort them numerically."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "After sorting salaries largest to smallest, the top value is in B2. Instead of sorting, you can find the **highest salary** with a formula. Write it.",
      "example": {
        "title": "highest value with a formula",
        "code": "=MAX(C2:C40)"
      },
      "grid": {
        "A1": "Emp",
        "B1": "Salary",
        "A2": "Ram",
        "B2": "42000",
        "A3": "Sana",
        "B3": "58000",
        "A4": "Tarun",
        "B4": "36500",
        "A5": "Uma",
        "B5": "61000"
      },
      "starter": "",
      "solution": "=MAX(B2:B5)",
      "explain": "Sorting rearranges the data; `=MAX(B2:B5)` gives **61000** without changing the order. Use `=LARGE(B2:B5,2)` for the second highest."
    }
  ]
};
