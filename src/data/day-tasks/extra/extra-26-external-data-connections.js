// Day Task (auto-graded practice) for extra-26-external-data-connections
export default {
  "lesson": "extra-26-external-data-connections",
  "minutes": 12,
  "intro": "Connect workbooks to external data, manage connections and refresh options, and handle external links.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where do you see and manage all queries and connections in a workbook?",
      "options": [
        "Formulas > Name Manager",
        "Data > Queries & Connections",
        "View > Macros",
        "Home > Styles"
      ],
      "answer": 1,
      "explain": "**Data > Queries & Connections** opens the pane that lists every query/connection; right-click one for Properties, Refresh, Edit or Delete."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which shortcut **refreshes all** connections and queries in the workbook?",
      "accept": [
        "Ctrl+Alt+F5"
      ],
      "acceptRegex": [
        "^\\s*(ctrl|control)\\s*\\+\\s*Alt\\s*\\+\\s*F5\\s*$"
      ],
      "explain": "**Ctrl + Alt + F5** = Refresh All (Data > Refresh All). **Alt + F5** refreshes only the selected table/query."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which refresh options can you set in **Query/Connection Properties**? (choose all that apply)",
      "options": [
        "Refresh every N minutes",
        "Refresh data when opening the file",
        "Enable background refresh",
        "Refresh this connection on Refresh All",
        "Refresh when a cell value changes"
      ],
      "answers": [
        0,
        1,
        2,
        3
      ],
      "explain": "Properties > Usage offers periodic refresh, refresh on open, background refresh and inclusion in Refresh All. There is no built-in \"refresh on cell change\" (that would need VBA)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which is the correct format of an **external formula link** to another workbook?",
      "options": [
        "=Budget.xlsx!B5",
        "='[Budget.xlsx]Sheet1'!$B$5",
        "=Sheet1[Budget]!B5",
        "=LINK(\"Budget.xlsx\",B5)"
      ],
      "answer": 1,
      "explain": "An external reference has the file name in **square brackets**, then the sheet name and the cell: `='[Budget.xlsx]Sheet1'!$B$5`. When the source is closed, Excel shows the full path."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "The source file of external links moved to a new folder. Where do you point the links to the new location?",
      "options": [
        "File > Info > Check for Issues",
        "Data > Edit Links (Workbook Links) > Change Source",
        "Formulas > Trace Precedents",
        "Insert > Link"
      ],
      "answer": 1,
      "explain": "**Data > Queries & Connections > Edit Links** (called **Workbook Links** in Microsoft 365) lets you Update Values, **Change Source**, Open Source or Break Link."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What happens when you click **Break Link**?",
      "options": [
        "The links are hidden",
        "All formulas referring to that file are converted to their current values",
        "The source file is deleted",
        "The links refresh automatically"
      ],
      "answer": 1,
      "explain": "Break Link replaces each external formula with its **last value**; it cannot be undone with Ctrl+Z. Keep a backup before breaking links."
    }
  ]
};
