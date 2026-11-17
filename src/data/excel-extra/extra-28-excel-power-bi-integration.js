export default {
  "id": "extra-28-excel-power-bi-integration",
  "title": "Excel + Power BI Integration",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 28,
  "level": "Advanced",
  "duration": "2 hours",
  "summary": "Excel and Power BI work best together: Excel is where data is often prepared and analysed, and Power BI is where it is modelled, visualised and shared online. This lesson shows how to prepare Excel data for Power BI, load it, import whole Excel models, analyse Power BI data back in Excel and export data from Power BI visuals.",
  "objectives": [
    "Prepare Excel data in a Power BI-friendly structure",
    "Load Excel tables into Power BI Desktop and understand the generated M code",
    "Import Excel Power Query / Power Pivot models into Power BI Desktop",
    "Use Analyze in Excel, Excel PivotTables from Power BI semantic models, and Export data",
    "Plan refresh for Excel sources (OneDrive/SharePoint vs gateway)"
  ],
  "theory": [
    {
      "heading": "Why integrate Excel and Power BI?",
      "content": "- **Excel**: flexible calculations, data entry, ad-hoc analysis, familiar to everyone.\n- **Power BI**: interactive dashboards, large data models, scheduled refresh, secure sharing on the web and mobile.\n\nTypical workflow in an Indian MIS team: branches send Excel files > Power Query cleans them > Power BI model and dashboard > managers view on phone > finance team uses **Analyze in Excel** for detailed PivotTables.\n\nExcel's **Power Query** and **Power Pivot (DAX)** are the same engines as Power BI, so your Excel skills transfer directly."
    },
    {
      "heading": "Preparing Excel data for Power BI",
      "content": "Power BI reads data, not presentation. Before connecting:\n\n- Format the data as an **Excel Table** (Ctrl+T) and name it (Table Design > Table Name, e.g. `tblSales`).\n- One header row, unique column names, no blank header cells.\n- **No merged cells**, no subtotal or grand-total rows, no blank rows/columns inside data.\n- One type per column (dates only in Date column; numbers without text like \"Rs\" or \"NA\").\n- Long format: months as values in a Month column, not 12 separate month columns (unpivot in Power Query if needed).\n- Keep the file in **OneDrive for Business / SharePoint** if the report must refresh online.",
      "tip": "A clean Excel Table is the single best thing you can do for a reliable Power BI report."
    },
    {
      "heading": "Loading Excel into Power BI Desktop",
      "content": "1. Open Power BI Desktop > **Home > Get data > Excel workbook**.\n2. Select the file > Open.\n3. **Navigator**: tick tables (table icon) or sheets.\n4. **Load** (directly) or **Transform Data** (clean in Power Query Editor first).\n5. Build visuals in Report view; create measures with DAX, e.g. `Total Sales = SUM(tblSales[Amount])`.\n\nTo bring an entire Excel workbook model (Power Query queries, Data Model tables, relationships, DAX measures) into Power BI: **File > Import > Power Query, Power Pivot, Power View** > select the .xlsx > Start.",
      "tip": "Get data connects to the DATA. File > Import migrates the Excel MODEL (queries, relationships, measures). Do not confuse them."
    },
    {
      "heading": "Using Power BI data in Excel",
      "content": "- **Analyze in Excel**: In the Power BI service open the semantic model (dataset) or report > **Export > Analyze in Excel** (or ... More options > Analyze in Excel). An .xlsx downloads with a PivotTable **live-connected** to the Power BI model; measures appear in the field list.\n- **From Excel directly**: Insert > PivotTable > **From Power BI** (or Data > Get Data > From Power Platform > From Power BI semantic models) and pick a semantic model you have Build permission on.\n- **CUBE functions**: with a PivotTable connected to the model, PivotTable Analyze > OLAP Tools > **Convert to Formulas** turns cells into CUBEVALUE/CUBEMEMBER formulas for custom report layouts.\n- **Export data from a visual**: hover a visual > **... More options > Export data** > Summarized data or Underlying data > .xlsx (or .csv). Limits apply (e.g. up to 150,000 rows for .xlsx summarized export) and admins can disable it.",
      "tip": "Analyze in Excel requires a Power BI Pro / Premium Per User licence (or capacity) and Build permission on the semantic model."
    },
    {
      "heading": "Refreshing Excel sources in the Power BI service",
      "content": "After **Publish** (Home > Publish in Power BI Desktop):\n\n- **Excel file on OneDrive for Business / SharePoint** (connected via its web URL): the service can refresh it in the cloud without a gateway; set it at semantic model > Settings > Data source credentials (OAuth2) and Scheduled refresh.\n- **Excel file on a local drive or network share** (C:\\ or \\\\Server): requires an **on-premises data gateway** installed on a PC/server that can reach the file.\n- Scheduled refresh: Settings > Refresh > configure up to 8 times a day (Pro) or 48 (Premium).",
      "tip": "To connect to a OneDrive/SharePoint Excel file, copy its path from Excel (File > Info > Copy path), remove '?web=1' at the end, and use Get data > Web in Power BI Desktop with Organizational account sign-in."
    }
  ],
  "examples": [
    {
      "title": "Load an Excel sales table into Power BI and build a chart",
      "scenario": "Sales_2025.xlsx has a table tblSales. Load it into Power BI Desktop and show total sales by region.",
      "table": {
        "headers": [
          "A: Date",
          "B: Region",
          "C: Product",
          "D: Amount"
        ],
        "rows": [
          [
            "01-04-2025",
            "North",
            "Laptop",
            "55000"
          ],
          [
            "02-04-2025",
            "South",
            "Mobile",
            "18000"
          ],
          [
            "03-04-2025",
            "North",
            "Mobile",
            "22000"
          ],
          [
            "04-04-2025",
            "East",
            "Laptop",
            "60000"
          ],
          [
            "05-04-2025",
            "South",
            "Laptop",
            "52000"
          ]
        ]
      },
      "steps": [
        "In Excel, click inside the data > Ctrl+T > OK; Table Design > Table Name: tblSales > Save and close",
        "Power BI Desktop > Home > Get data > Excel workbook > Sales_2025.xlsx > Open",
        "Navigator: tick tblSales > Transform Data",
        "Check types: Date = Date, Region/Product = Text, Amount = Decimal number > Close & Apply",
        "In Data pane, right-click tblSales > New measure: Total Sales = SUM(tblSales[Amount])",
        "Insert a Clustered column chart: Region on X-axis, Total Sales on Y-axis"
      ],
      "code": "let\n    Source = Excel.Workbook(File.Contents(\"C:\\Reports\\Sales_2025.xlsx\"), null, true),\n    tblSales_Table = Source{[Item = \"tblSales\", Kind = \"Table\"]}[Data],\n    ChangedType = Table.TransformColumnTypes(tblSales_Table, {{\"Date\", type date}, {\"Region\", type text}, {\"Product\", type text}, {\"Amount\", type number}})\nin\n    ChangedType\n\nTotal Sales = SUM(tblSales[Amount])",
      "result": "Column chart: North 77000, South 70000, East 60000; card visual of Total Sales = 207000",
      "explanation": "North = 55000 + 22000 = 77000; South = 18000 + 52000 = 70000; East = 60000. Total = 207000. Column names in the M code must match the Excel headers exactly, because M is case-sensitive."
    },
    {
      "title": "Import an Excel Power Pivot model into Power BI Desktop",
      "scenario": "Finance built a workbook with Power Query queries, a Data Model with relationships (Sales-Products-Calendar) and DAX measures. Move it to Power BI without rebuilding.",
      "steps": [
        "Open a new Power BI Desktop file",
        "File > Import > Power Query, Power Pivot, Power View",
        "Select Finance_Model.xlsx > Open > Start",
        "Choose Copy data or Keep connection when asked about Excel tables used in the model (Keep connection keeps refreshing from the workbook)",
        "Review the migration summary > Close",
        "Check Model view for relationships and Data pane for measures"
      ],
      "result": "Power BI Desktop now contains all queries, tables, relationships and DAX measures from the workbook, ready for building visuals",
      "explanation": "This is a one-time migration of the MODEL. After import, maintain the model in Power BI. PivotTables and Excel charts themselves are not converted."
    },
    {
      "title": "Analyze in Excel: PivotTable on a Power BI semantic model",
      "scenario": "The finance manager wants region-wise and product-wise sales in an Excel PivotTable using the published Power BI model.",
      "table": {
        "headers": [
          "A: Date",
          "B: Region",
          "C: Product",
          "D: Amount"
        ],
        "rows": [
          [
            "01-04-2025",
            "North",
            "Laptop",
            "55000"
          ],
          [
            "02-04-2025",
            "South",
            "Mobile",
            "18000"
          ],
          [
            "03-04-2025",
            "North",
            "Mobile",
            "22000"
          ],
          [
            "04-04-2025",
            "East",
            "Laptop",
            "60000"
          ],
          [
            "05-04-2025",
            "South",
            "Laptop",
            "52000"
          ]
        ]
      },
      "steps": [
        "Open app.powerbi.com > Workspace > the Sales semantic model (or report)",
        "Export > Analyze in Excel (or ... > Analyze in Excel) > open the downloaded .xlsx > Enable Editing / Enable Content",
        "In PivotTable Fields: drag Region to Rows, Product to Columns, Total Sales measure to Values"
      ],
      "result": "PivotTable: North - Laptop 55000, Mobile 22000, Total 77000 | South - Laptop 52000, Mobile 18000, Total 70000 | East - Laptop 60000, Total 60000 | Grand Total: Laptop 167000, Mobile 40000, 207000",
      "explanation": "The PivotTable reads live from the Power BI model, so it uses the same measures and security as the dashboard. Only measures (not raw numeric columns) can be put in Values. Refresh with Data > Refresh All."
    },
    {
      "title": "Report cells with CUBEVALUE from a Power BI connection",
      "scenario": "Build a fixed-format MIS sheet where B2 always shows North sales from the Power BI model.",
      "steps": [
        "Create a PivotTable connected to the Power BI model (previous example)",
        "PivotTable Analyze > OLAP Tools > Convert to Formulas",
        "Excel turns cells into CUBE formulas; copy the connection name from Data > Queries & Connections",
        "Write a CUBEVALUE formula in B2 as below (replace the connection name with yours)"
      ],
      "code": "=CUBEVALUE(\"pbiazure://api.powerbi.com Sales\",\"[Measures].[Total Sales]\",\"[tblSales].[Region].&[North]\")",
      "result": "77000",
      "explanation": "CUBEVALUE(connection, member_expression1, member_expression2...) returns the measure value for the given members. The exact connection name is created by Excel when you connect, so always copy it from the converted formulas rather than typing it."
    },
    {
      "title": "Export data from a Power BI visual to Excel",
      "scenario": "An auditor needs the rows behind the 'Sales by Region' chart in Excel.",
      "steps": [
        "In the Power BI service or Desktop, hover over the chart > ... More options > Export data",
        "Choose Summarized data (what the visual shows) or Underlying data (detail rows), file format .xlsx",
        "Click Export and open the file in Excel"
      ],
      "result": "Summarized: 3 rows (North 77000, South 70000, East 60000). Underlying data: the 5 transaction rows with Date, Region, Product, Amount",
      "explanation": "Export respects filters and slicers applied to the visual. Exports have row limits and admins can disable them, so for large/regular needs prefer Analyze in Excel."
    }
  ],
  "interview": [
    {
      "q": "What are the main ways Excel and Power BI integrate?",
      "a": "1) Power BI uses Excel workbooks as a data source (Get data > Excel workbook). 2) File > Import migrates Excel Power Query/Power Pivot models. 3) Analyze in Excel / Insert > PivotTable > From Power BI lets Excel query Power BI semantic models live. 4) Export data from visuals to Excel. 5) Excel files on OneDrive/SharePoint refresh in the service.",
      "level": "Medium"
    },
    {
      "q": "How should Excel data be structured before loading into Power BI?",
      "a": "As a named Excel Table with one header row, unique column names, no merged cells, no blank rows/subtotals, one data type per column, and in long (unpivoted) format.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between Get data > Excel workbook and File > Import > Power Query, Power Pivot, Power View?",
      "a": "Get data connects to tables/sheets as data. File > Import migrates the workbook's queries, data model, relationships and DAX measures into Power BI Desktop.",
      "level": "Medium"
    },
    {
      "q": "What is Analyze in Excel?",
      "a": "A Power BI service feature that creates an Excel workbook with a PivotTable live-connected to a Power BI semantic model, so users can slice the model's measures in Excel. It needs Build permission and a suitable licence.",
      "level": "Medium"
    },
    {
      "q": "Why can't you drag a numeric column into Values in an Analyze in Excel PivotTable?",
      "a": "The connection behaves like an OLAP cube: only measures can be aggregated. Create explicit DAX measures (e.g. Total Sales = SUM(...)) in the model.",
      "level": "Hard"
    },
    {
      "q": "When do you need an on-premises data gateway for an Excel source?",
      "a": "When the Excel file is on a local or network drive. Files on OneDrive for Business or SharePoint Online can refresh in the cloud without a gateway.",
      "level": "Medium"
    },
    {
      "q": "Difference between Summarized data and Underlying data in Export data?",
      "a": "Summarized exports the aggregated values shown in the visual. Underlying exports the detail rows behind it (if permitted).",
      "level": "Easy"
    },
    {
      "q": "What are CUBE functions and how do they relate to Power BI?",
      "a": "CUBEVALUE, CUBEMEMBER, CUBESET etc. retrieve values from OLAP/Data Model connections, including Power BI semantic models. OLAP Tools > Convert to Formulas turns a connected PivotTable into CUBE formulas for free-form reports.",
      "level": "Hard"
    },
    {
      "q": "Can DAX measures written in Excel Power Pivot be reused in Power BI?",
      "a": "Yes. DAX is the same language. Import the workbook with File > Import or copy the measure formulas into Power BI Desktop.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Convert an Excel range of attendance (EmpID, Name, Date, Status) into a Power BI-ready table named tblAttendance and load it into Power BI Desktop.",
      "hint": "Ctrl+T, name the table, Get data > Excel workbook.",
      "solution": "Select the range > Ctrl+T > My table has headers > OK. Table Design > Table Name: tblAttendance. Save. Power BI Desktop > Get data > Excel workbook > select file > tick tblAttendance > Transform Data > set EmpID Text, Date Date, Status Text > Close & Apply."
    },
    {
      "task": "Using the sales table (North 77000, South 70000, East 60000 by region; Laptop 167000, Mobile 40000 by product), write DAX measures for Total Sales and Laptop Sales.",
      "hint": "SUM and CALCULATE.",
      "solution": "Total Sales = SUM(tblSales[Amount]) gives 207000. Laptop Sales = CALCULATE([Total Sales], tblSales[Product] = \"Laptop\") gives 167000."
    },
    {
      "task": "An Excel sheet has months as columns (Region, Apr, May, Jun). Make it Power BI-friendly.",
      "hint": "Unpivot in Power Query.",
      "solution": "Data > From Table/Range > select Region column > Transform > Unpivot Columns > Unpivot Other Columns. Rename Attribute to Month and Value to Sales. Close & Load. The result has columns Region, Month, Sales."
    },
    {
      "task": "Connect Excel to a published Power BI semantic model without downloading from the service.",
      "hint": "Insert > PivotTable.",
      "solution": "Excel (Microsoft 365, signed in with work account) > Insert > PivotTable > From Power BI > choose the semantic model > OK. Drag measures and fields in the PivotTable Fields pane."
    },
    {
      "task": "Your report uses an Excel file at D:\\Sales\\Sales_2025.xlsx and must refresh daily at 9 AM in the Power BI service. List two options.",
      "hint": "Gateway or cloud location.",
      "solution": "Option 1: Install and configure an on-premises data gateway, add the file data source, and set Scheduled refresh at 9:00 AM. Option 2: Move the file to OneDrive for Business/SharePoint, reconnect via its web URL in Power BI Desktop, republish, set credentials (OAuth2) and schedule refresh with no gateway."
    }
  ],
  "quiz": [
    {
      "question": "Which Power BI Desktop option migrates an Excel Data Model with its DAX measures?",
      "options": [
        "Get data > Excel workbook",
        "File > Import > Power Query, Power Pivot, Power View",
        "Home > Enter data",
        "Export > PDF"
      ],
      "answer": 1,
      "explanation": "File > Import migrates queries, model and measures."
    },
    {
      "question": "Analyze in Excel creates:",
      "options": [
        "A static CSV",
        "A PivotTable live-connected to a Power BI semantic model",
        "A Power BI report",
        "A VBA macro"
      ],
      "answer": 1,
      "explanation": "The workbook connects live to the model."
    },
    {
      "question": "Which is best practice for Excel data used in Power BI?",
      "options": [
        "Merged header cells",
        "Subtotal rows inside data",
        "A named Excel Table with one header row",
        "Months as separate sheets"
      ],
      "answer": 2,
      "explanation": "Named tables are stable and expand automatically."
    },
    {
      "question": "An Excel file on a local network drive needs scheduled refresh in the Power BI service. You need:",
      "options": [
        "Nothing",
        "An on-premises data gateway",
        "A macro",
        "Export data"
      ],
      "answer": 1,
      "explanation": "Local/network files require a gateway."
    },
    {
      "question": "In an Analyze in Excel PivotTable, what can go into the Values area?",
      "options": [
        "Any numeric column",
        "Only measures",
        "Only text columns",
        "Dates"
      ],
      "answer": 1,
      "explanation": "The connection exposes measures for aggregation."
    }
  ]
};
