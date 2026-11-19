// Day Task (auto-graded practice) for extra-28-excel-power-bi-integration
export default {
  "lesson": "extra-28-excel-power-bi-integration",
  "minutes": 12,
  "intro": "Prepare Excel data for Power BI, load it, analyse Power BI data in Excel and keep everything refreshed.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "Before loading a sales sheet into Power BI, what should you do first?",
      "options": [
        "Merge the header cells for a nicer look",
        "Format the data as an Excel Table (Ctrl+T) with one header row and no blank rows",
        "Add subtotal rows after every region",
        "Put several tables side by side on one sheet"
      ],
      "answer": 1,
      "explain": "Power BI reads **Tables** cleanly by name. Merged cells, subtotal rows, blank rows and multiple tables on one sheet all cause messy imports."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which are good rules for Excel data that feeds Power BI? (choose all that apply)",
      "options": [
        "One header row with unique column names",
        "One type of data per column (e.g. only dates in the Date column)",
        "Long (tidy) format instead of months spread across columns",
        "Totals typed inside the data range",
        "Store the file on OneDrive/SharePoint for easy refresh"
      ],
      "answers": [
        0,
        1,
        2,
        4
      ],
      "explain": "Clean, tidy tables without total rows; Power BI calculates totals itself. Files on OneDrive/SharePoint can refresh in the Power BI service without a gateway."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "In Power BI Desktop, you load an Excel file with **Home > Get Data > ______** (type the connector name).",
      "accept": [
        "Excel Workbook",
        "Excel"
      ],
      "explain": "**Get Data > Excel Workbook**, choose the file, tick the Tables/sheets in the Navigator and click **Transform Data** (to clean) or **Load**."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does **Analyze in Excel** do?",
      "options": [
        "Exports a visual as a CSV file",
        "Opens Excel with a PivotTable connected live to the Power BI semantic model",
        "Imports Excel data into Power BI",
        "Converts a report to an Excel file with static values"
      ],
      "answer": 1,
      "explain": "Analyze in Excel creates a PivotTable connected to the published model, so users can slice the measures in Excel and refresh to get the latest data."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Your Power BI report uses an Excel file stored on your **local C: drive**. What do you need to schedule refresh in the Power BI service?",
      "options": [
        "Nothing, it refreshes automatically",
        "An on-premises data gateway",
        "A Premium licence only",
        "To email the file every day"
      ],
      "answer": 1,
      "explain": "The cloud service cannot see your C: drive, so local files need an **on-premises data gateway**. Files on OneDrive/SharePoint refresh without a gateway."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You built Power Query queries and a Power Pivot model in Excel. How do you bring them into Power BI Desktop in one step?",
      "options": [
        "Copy and paste each query",
        "File > Import > Power Query, Power Pivot, Power View",
        "Get Data > Text/CSV",
        "Publish to web"
      ],
      "answer": 1,
      "explain": "**File > Import > Power Query, Power Pivot, Power View** imports the queries, data model, relationships and DAX measures from the workbook."
    }
  ]
};
