// Day Task (auto-graded practice) for day-54-power-query
export default {
  "lesson": "day-54-power-query",
  "minutes": 25,
  "intro": "Import, clean and transform data with Power Query: Get Data, the editor, Applied Steps and refresh.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you start Power Query to import a CSV file?",
      "options": [
        "Data > Get & Transform Data > Get Data > From File > From Text/CSV",
        "Insert > CSV",
        "File > Open only",
        "Home > Paste"
      ],
      "answer": 0,
      "explain": "**Data > Get Data > From File > From Text/CSV** (or From Workbook, From Folder, From Table/Range). Then click **Transform Data** to open the Power Query Editor."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does the **Applied Steps** pane show?",
      "options": [
        "Cell formats",
        "Every transformation recorded in order, replayed on refresh",
        "VBA code",
        "Chart settings"
      ],
      "answer": 1,
      "explain": "Each action (Removed Columns, Changed Type, Filtered Rows...) is a recorded step. Next month just click **Refresh** and all steps run again on the new data."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are Power Query **transform** commands? (choose all that apply)",
      "options": [
        "Unpivot Columns",
        "Group By",
        "Merge Queries",
        "Append Queries",
        "Conditional Formatting"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Unpivot turns month columns into rows, Group By summarises, **Merge** joins tables (like a lookup), **Append** stacks tables. Conditional Formatting is a worksheet feature."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "A Power Query M query is written as `____ Step1 = ..., Step2 = ... in Step2`. Which keyword starts the query?",
      "accept": [
        "let"
      ],
      "explain": "Every M query has the form **let** ... **in** ...: steps are defined after `let`, and the step after `in` is the output."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which **Power Query function** keeps only rows that match a condition? Complete: `Table.______(Source, each [City] = \"Pune\")`",
      "accept": [
        "SelectRows",
        "Table.SelectRows"
      ],
      "explain": "`Table.SelectRows(table, each condition)` is the M code Power Query writes when you filter a column. `each` means \"for each row\"."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "Power Query's **Trim** + **Capitalize Each Word** would clean the name in A2. Write the equivalent worksheet formula.",
      "example": {
        "title": "clean text with formulas",
        "code": "=PROPER(TRIM(B2))"
      },
      "grid": {
        "A1": "Raw Name",
        "A2": "  sanjay   GUPTA "
      },
      "starter": "",
      "solution": "=PROPER(TRIM(A2))",
      "explain": "The worksheet equivalent is `=PROPER(TRIM(A2))` → **Sanjay Gupta**. Power Query does it once for the whole column and repeats it on every refresh without helper columns. (Note: Power Query Trim removes only leading/trailing spaces; TRIM also removes double spaces inside.)"
    }
  ]
};
