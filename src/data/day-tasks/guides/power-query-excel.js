// Day Task (auto-graded practice) for power-query-excel
export default {
  "lesson": "power-query-excel",
  "minutes": 18,
  "intro": "Revise Power Query: getting data, Applied Steps, key transformations, Unpivot, Merge vs Append, data types and loading.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Where are the recorded actions of a query shown in the Power Query Editor?",
      "options": [
        "In the formula bar only",
        "In the Applied Steps list (Query Settings pane)",
        "In the Name Manager",
        "In cell comments"
      ],
      "answer": 1,
      "explain": "Every action becomes a step in **Applied Steps**. You can rename, reorder, delete or click a step to see the data at that point; the steps re-run on every Refresh."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A sheet has months **Apr, May, Jun** as separate columns. To make one \"Month\" column and one \"Sales\" column, you:",
      "options": [
        "Pivot Column",
        "Select the ID columns > Unpivot Other Columns",
        "Transpose",
        "Merge Queries"
      ],
      "answer": 1,
      "explain": "**Unpivot Other Columns** turns the cross-tab into a long table and keeps working when a new month column appears. Unpivot Columns (only the selected ones) would miss new months."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You have **January.csv** and **February.csv** with the same columns and want one table. Which operation?",
      "options": [
        "Merge Queries",
        "Append Queries",
        "Group By",
        "Pivot Column"
      ],
      "answer": 1,
      "explain": "**Append** stacks rows (like UNION). **Merge** joins columns from another table on a key (like VLOOKUP/SQL JOIN). For a whole folder of files use Get Data > From Folder."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are **Merge** join kinds in Power Query? (choose all that apply)",
      "options": [
        "Left Outer",
        "Right Outer",
        "Full Outer",
        "Inner",
        "Left Anti",
        "Vertical"
      ],
      "answers": [
        0,
        1,
        2,
        3,
        4
      ],
      "explain": "Power Query offers Left Outer (default), Right Outer, Full Outer, Inner, Left Anti and Right Anti. Anti joins find rows with **no match**, e.g. customers with no orders."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "Which command in the Close & Load menu loads a query only as a **connection** (or to the Data Model) without a table on a sheet? (type the menu item)",
      "accept": [
        "Close & Load To",
        "Close & Load To...",
        "Close and Load To"
      ],
      "explain": "**Close & Load To...** lets you choose Table, PivotTable report, PivotChart or **Only Create Connection**, and tick \"Add this data to the Data Model\"."
    },
    {
      "type": "code",
      "lang": "excel",
      "mins": 4,
      "q": "A Power Query step **Group By** City with **Sum of Amount** is planned. Check one result before building it: write a formula for the total Amount of **Pune**.",
      "example": {
        "title": "checking a group total",
        "code": "=SUMIF(A2:A100,\"Delhi\",D2:D100)"
      },
      "grid": {
        "A1": "OrderID",
        "B1": "City",
        "C1": "Amount",
        "A2": "A1",
        "B2": "Pune",
        "C2": "1200",
        "A3": "A2",
        "B3": "Nashik",
        "C3": "850",
        "A4": "A3",
        "B4": "Pune",
        "C4": "2300",
        "A5": "A4",
        "B5": "Satara",
        "C5": "640",
        "A6": "A5",
        "B6": "Pune",
        "C6": "1750",
        "A7": "A6",
        "B7": "Nashik",
        "C7": "990"
      },
      "starter": "",
      "solution": "=SUMIF(B2:B7,\"Pune\",C2:C7)",
      "explain": "Pune: 1,200 + 2,300 + 1,750 = **5,250**. Group By (Transform > Group By) produces one row per city with this total; checking one group with SUMIF is a quick way to test a query."
    }
  ]
};
