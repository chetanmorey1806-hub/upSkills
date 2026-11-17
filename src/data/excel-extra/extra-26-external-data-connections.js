export default {
  "id": "extra-26-external-data-connections",
  "title": "External Data Connections",
  "module": "Additional Job-Oriented Skills",
  "extraNo": 26,
  "level": "Advanced",
  "duration": "1.5 hours",
  "summary": "External data connections link an Excel workbook to data that lives outside it: another workbook, a SQL Server database, a web page, SharePoint or an ODBC source. Instead of copy-pasting every month, you connect once and click Refresh. This lesson covers creating connections, refresh settings, credentials, privacy levels and managing external workbook links.",
  "objectives": [
    "Connect Excel to another workbook, a SQL Server database and a web page",
    "Manage queries and connections, credentials and data source settings",
    "Set refresh options: on open, every N minutes, background refresh",
    "Manage formula links to other workbooks with Edit Links"
  ],
  "theory": [
    {
      "heading": "What is an external data connection?",
      "content": "A connection stores **where the data is** (file path, server, URL), **how to log in** (credentials) and **what to fetch** (table, query). The data in your sheet becomes a **refreshable copy**.\n\nCommon sources in offices:\n- Another Excel workbook on a shared drive or SharePoint\n- SQL Server / MySQL / Oracle databases (ERP, billing)\n- Web pages with tables (rates, prices)\n- CSV/TXT exports (previous lesson)\n- ODBC sources (Tally ODBC, other software)\n\nAll modern connections are created with **Power Query** (Data > Get Data)."
    },
    {
      "heading": "Where to create connections",
      "content": "- **Workbook**: Data > Get Data > From File > From Excel Workbook\n- **SQL Server**: Data > Get Data > From Database > From SQL Server Database (enter Server and optional Database)\n- **Web**: Data > Get Data > From Other Sources > From Web (or Data > From Web) > enter URL\n- **ODBC**: Data > Get Data > From Other Sources > From ODBC > choose DSN\n- **SharePoint folder**: Data > Get Data > From File > From SharePoint Folder\n\nThe **Navigator** window shows available sheets/tables; select one and click Load or Transform Data.",
      "tip": "Prefer selecting an Excel TABLE (Kind = Table) rather than a sheet in Navigator. Tables expand automatically and keep the same name."
    },
    {
      "heading": "Managing connections and credentials",
      "content": "- **Queries & Connections pane**: Data > Queries & Connections. Hover a query to preview; right-click for Edit, Refresh, Properties, Load To, Delete.\n- **Data Source Settings**: Data > Get Data > Data Source Settings. Change Source (new path/server), Edit Permissions (credentials), Clear Permissions.\n- **Credentials types**: Windows (current or alternate account), Database (SQL username/password), Anonymous (public web), Organizational account (Microsoft 365/SharePoint).\n- **Privacy levels**: Public, Organizational, Private. They control whether data from one source may be combined/sent to another. Set them in Data Source Settings > Edit Permissions.",
      "tip": "Never hard-code passwords in a workbook. Credentials are stored on your PC, not in the file, so a colleague opening the file must enter their own."
    },
    {
      "heading": "Refresh options (Query Properties)",
      "content": "Data > Queries & Connections > right-click a query > **Properties** (or Data > Refresh All drop-down > Connection Properties):\n\n- **Enable background refresh**: keep working while it refreshes.\n- **Refresh every N minutes**: e.g. 30 for a live sales screen.\n- **Refresh data when opening the file**.\n- **Refresh this connection on Refresh All**.\n\nShortcuts: Alt+F5 refreshes the selected query/table, Ctrl+Alt+F5 refreshes all.",
      "points": [
        "Load To options: Table, PivotTable Report, PivotChart, Only Create Connection",
        "Tick 'Add this data to the Data Model' for Power Pivot/large data"
      ]
    },
    {
      "heading": "External formula links and Edit Links",
      "content": "A formula that points to another workbook is also an external connection:\n\n`='C:\\Reports\\[Branch_Sales.xlsx]Sheet1'!$B$10`\n\nWhen you open a file with such links Excel shows a security bar: **Enable Content** / **Update**.\n\nManage them at **Data > Queries & Connections > Edit Links** (called **Workbook Links** pane in newer Microsoft 365 builds):\n- **Update Values**: fetch latest values\n- **Change Source**: point to another file\n- **Break Link**: convert formulas to static values (cannot be undone)\n- **Startup Prompt**: control the message on opening\n\nFind hidden links: Ctrl+F > Find what `[` > Within: Workbook > Look in: Formulas.",
      "tip": "Formula links break easily when files are renamed or moved. For regular reporting, a Power Query connection is more robust."
    }
  ],
  "examples": [
    {
      "title": "Connect to a table in another workbook",
      "scenario": "Branch_Sales.xlsx on the shared drive has a table named tblSales. Pull it into the head-office report.",
      "table": {
        "headers": [
          "A: Branch",
          "B: Month",
          "C: Sales (₹)"
        ],
        "rows": [
          [
            "Pune",
            "Apr",
            "450000"
          ],
          [
            "Nashik",
            "Apr",
            "320000"
          ],
          [
            "Nagpur",
            "Apr",
            "280000"
          ]
        ]
      },
      "steps": [
        "Data > Get Data > From File > From Excel Workbook",
        "Browse to \\\\FileServer\\Reports\\Branch_Sales.xlsx > Import",
        "In Navigator select tblSales (table icon) > Load",
        "Next month, after branches update the file: Data > Refresh All"
      ],
      "code": "let\n    Source = Excel.Workbook(File.Contents(\"\\\\FileServer\\Reports\\Branch_Sales.xlsx\"), null, true),\n    tblSales = Source{[Item = \"tblSales\", Kind = \"Table\"]}[Data],\n    ChangedType = Table.TransformColumnTypes(tblSales, {{\"Branch\", type text}, {\"Month\", type text}, {\"Sales (₹)\", type number}})\nin\n    ChangedType",
      "result": "A new sheet with a refreshable table of 3 rows; total sales = 1050000",
      "explanation": "450000 + 320000 + 280000 = 1050000. Source{[Item=...,Kind=\"Table\"]} selects the table by name, so it keeps working even if rows are added."
    },
    {
      "title": "Import filtered orders from SQL Server",
      "scenario": "The billing system stores orders in SQL Server SALES-SRV01, database SalesDB, table dbo.Orders. Import only FY 2025-26 orders (from 1-Apr-2025) with four columns.",
      "table": {
        "headers": [
          "OrderID",
          "OrderDate",
          "Region",
          "Amount"
        ],
        "rows": [
          [
            "5001",
            "28-03-2025",
            "North",
            "18000"
          ],
          [
            "5002",
            "02-04-2025",
            "South",
            "22000"
          ],
          [
            "5003",
            "10-04-2025",
            "North",
            "15000"
          ]
        ]
      },
      "steps": [
        "Data > Get Data > From Database > From SQL Server Database",
        "Server: SALES-SRV01, Database: SalesDB > OK",
        "Credentials: Windows > Use my current credentials > Connect",
        "Navigator: select dbo.Orders > Transform Data",
        "Filter OrderDate > Date Filters > After or Equal > 01-04-2025",
        "Choose Columns: OrderID, OrderDate, Region, Amount > Close & Load"
      ],
      "code": "let\n    Source = Sql.Database(\"SALES-SRV01\", \"SalesDB\"),\n    Orders = Source{[Schema = \"dbo\", Item = \"Orders\"]}[Data],\n    FY26Orders = Table.SelectRows(Orders, each [OrderDate] >= #date(2025, 4, 1)),\n    KeptColumns = Table.SelectColumns(FY26Orders, {\"OrderID\", \"OrderDate\", \"Region\", \"Amount\"})\nin\n    KeptColumns",
      "result": "Only orders 5002 (02-04-2025, South, 22000) and 5003 (10-04-2025, North, 15000) are loaded; total = 37000",
      "explanation": "Order 5001 is before 1-Apr-2025 so it is filtered out. Power Query 'folds' this filter into a SQL WHERE clause, so only needed rows travel over the network (OrderDate is assumed to be a date column in SQL)."
    },
    {
      "title": "Get a table from a web page",
      "scenario": "A web page lists daily fuel rates in an HTML table. Bring the first table into Excel and refresh it daily.",
      "table": {
        "headers": [
          "City",
          "Petrol (₹/L)",
          "Diesel (₹/L)"
        ],
        "rows": [
          [
            "Mumbai",
            "103.50",
            "90.03"
          ],
          [
            "Delhi",
            "94.77",
            "87.67"
          ]
        ]
      },
      "steps": [
        "Data > From Web",
        "URL: the page address (here https://www.example.com/fuel-rates) > OK",
        "Access Web content: Anonymous > Connect",
        "Navigator: select Table 0 (preview shows City/Petrol/Diesel) > Load",
        "Data > Queries & Connections > right-click the query > Properties > tick Refresh data when opening the file"
      ],
      "code": "let\n    Source = Web.Page(Web.Contents(\"https://www.example.com/fuel-rates\")),\n    RatesTable = Source{0}[Data],\n    ChangedType = Table.TransformColumnTypes(RatesTable, {{\"City\", type text}, {\"Petrol (₹/L)\", type number}, {\"Diesel (₹/L)\", type number}})\nin\n    ChangedType",
      "result": "A table with the page's rows (e.g. Mumbai 103.50 / 90.03, Delhi 94.77 / 87.67) that updates each time the file opens",
      "explanation": "Web.Page returns all tables on the page; {0} picks the first. Rates shown are sample values; the live page decides the actual numbers. Web connections fail if the website changes its layout."
    },
    {
      "title": "Make the file path a parameter from a cell",
      "scenario": "Different users keep Branch_Sales.xlsx in different folders. Let them type the path in a cell instead of editing the query.",
      "table": {
        "headers": [
          "A: Setting",
          "B: Value"
        ],
        "rows": [
          [
            "File path",
            "D:\\Reports\\Branch_Sales.xlsx"
          ]
        ]
      },
      "steps": [
        "Select B2 > type FilePath in the Name Box > Enter (creates a named range)",
        "Data > Queries & Connections > right-click the query > Edit",
        "Home > Advanced Editor > replace the Source line as shown > Done",
        "Close & Load. Change B2 and Refresh All to read the other file"
      ],
      "code": "let\n    FilePath = Excel.CurrentWorkbook(){[Name = \"FilePath\"]}[Content]{0}[Column1],\n    Source = Excel.Workbook(File.Contents(FilePath), null, true),\n    tblSales = Source{[Item = \"tblSales\", Kind = \"Table\"]}[Data]\nin\n    tblSales",
      "result": "The query reads from whatever path is typed in B2; after Refresh All the table shows that file's data",
      "explanation": "Excel.CurrentWorkbook() reads named ranges/tables of the current file. A single-cell named range gives a one-column table whose first value is the path. If a Formula.Firewall privacy error appears, set Data > Get Data > Query Options > Current Workbook > Privacy appropriately, or set both sources to Organizational in Data Source Settings."
    },
    {
      "title": "Find and fix broken external formula links",
      "scenario": "A report shows #REF! and a warning 'This workbook contains links to one or more external sources' because Jan_Sales.xlsx was renamed to Sales_Jan_2025.xlsx.",
      "table": {
        "headers": [
          "A: Cell",
          "B: Formula"
        ],
        "rows": [
          [
            "B5",
            "='D:\\Reports\\[Jan_Sales.xlsx]Summary'!$C$10"
          ]
        ]
      },
      "steps": [
        "Data > Queries & Connections > Edit Links (or Workbook Links)",
        "Select Jan_Sales.xlsx > Change Source > browse to Sales_Jan_2025.xlsx > OK",
        "Click Update Values > Close",
        "If you no longer need live values: select the link > Break Link (converts to values)"
      ],
      "code": "='D:\\Reports\\[Sales_Jan_2025.xlsx]Summary'!$C$10",
      "result": "All formulas now point to the renamed file and show the correct value again",
      "explanation": "Change Source updates every formula that uses the old file in one go. Break Link is permanent, so save a backup first."
    }
  ],
  "interview": [
    {
      "q": "What is an external data connection in Excel?",
      "a": "A saved link to data outside the workbook (file, database, web, ODBC). It stores source location, credentials reference and query steps, so the data can be refreshed instead of re-imported.",
      "level": "Easy"
    },
    {
      "q": "How do you connect Excel to SQL Server?",
      "a": "Data > Get Data > From Database > From SQL Server Database, enter server and database, choose credentials (Windows or Database), select tables in Navigator, then Load or Transform Data.",
      "level": "Medium"
    },
    {
      "q": "How can a query refresh automatically?",
      "a": "Query Properties: Refresh every N minutes, Refresh data when opening the file, and Enable background refresh. For scheduled refresh without opening Excel, use Power BI or Power Automate.",
      "level": "Medium"
    },
    {
      "q": "What are privacy levels and why do they matter?",
      "a": "Public, Organizational and Private. Power Query uses them to stop data from a private source being sent to another source while combining queries. Wrong settings cause Formula.Firewall errors.",
      "level": "Hard"
    },
    {
      "q": "Where do you change the path or server of an existing connection?",
      "a": "Data > Get Data > Data Source Settings > select source > Change Source; or edit the Source step in the Power Query Editor.",
      "level": "Medium"
    },
    {
      "q": "What does Break Link do in Edit Links?",
      "a": "It replaces formulas that refer to the external workbook with their current values. It cannot be undone.",
      "level": "Easy"
    },
    {
      "q": "What is query folding?",
      "a": "Power Query translates steps like filters and column selection into the source's native language (e.g. SQL) so the database does the work and only needed rows are returned.",
      "level": "Hard"
    },
    {
      "q": "Are passwords saved inside the workbook?",
      "a": "No. Credentials are stored in the user's local Power Query data source settings. Another user must enter their own credentials.",
      "level": "Medium"
    },
    {
      "q": "Difference between Load To 'Table' and 'Only Create Connection'?",
      "a": "Table loads rows into a worksheet. Only Create Connection stores the query without loading rows, useful for staging queries, merges or loading to the Data Model.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Connect to Targets.xlsx (table tblTarget with Region and Target) and load it as Only Create Connection.",
      "hint": "Load To...",
      "solution": "Data > Get Data > From File > From Excel Workbook > Targets.xlsx > Navigator tblTarget > Load drop-down > Load To... > Only Create Connection > OK. It appears in the Queries & Connections pane."
    },
    {
      "task": "Write the M code to read table tblTarget from C:\\Plans\\Targets.xlsx.",
      "hint": "Excel.Workbook + File.Contents.",
      "solution": "let\n    Source = Excel.Workbook(File.Contents(\"C:\\Plans\\Targets.xlsx\"), null, true),\n    tblTarget = Source{[Item = \"tblTarget\", Kind = \"Table\"]}[Data]\nin\n    tblTarget"
    },
    {
      "task": "A SQL query must return total Amount per Region from dbo.Orders. Write M using a native SQL query.",
      "hint": "Sql.Database has a Query option.",
      "solution": "let\n    Source = Sql.Database(\"SALES-SRV01\", \"SalesDB\", [Query = \"SELECT Region, SUM(Amount) AS TotalAmount FROM dbo.Orders GROUP BY Region\"])\nin\n    Source"
    },
    {
      "task": "Set a sales query to refresh every 15 minutes and when the file opens.",
      "hint": "Query Properties.",
      "solution": "Data > Queries & Connections > right-click query > Properties > tick Refresh every 15 minutes and Refresh data when opening the file > OK."
    },
    {
      "task": "You received a file with unknown external links. Find all of them.",
      "hint": "Edit Links and Find.",
      "solution": "Data > Queries & Connections > Edit Links to list the source files. Then Ctrl+F > Options > Within: Workbook > Look in: Formulas > Find what: .xls > Find All to locate each cell. Also check Formulas > Name Manager and charts/data validation for links."
    }
  ],
  "quiz": [
    {
      "question": "Which path connects to a SQL Server database?",
      "options": [
        "Insert > Database",
        "Data > Get Data > From Database > From SQL Server Database",
        "File > Open > SQL",
        "Formulas > SQL"
      ],
      "answer": 1,
      "explanation": "Database connectors are under Data > Get Data > From Database."
    },
    {
      "question": "Which M function reads a table from another Excel file?",
      "options": [
        "Csv.Document",
        "Excel.Workbook",
        "Sql.Database",
        "Web.Page"
      ],
      "answer": 1,
      "explanation": "Excel.Workbook(File.Contents(path)) lists sheets and tables."
    },
    {
      "question": "Where do you update credentials of a data source?",
      "options": [
        "Data > Get Data > Data Source Settings",
        "Review > Protect",
        "Home > Styles",
        "View > Macros"
      ],
      "answer": 0,
      "explanation": "Edit Permissions is inside Data Source Settings."
    },
    {
      "question": "Break Link in Edit Links:",
      "options": [
        "Deletes the source file",
        "Converts linked formulas to values",
        "Refreshes links",
        "Hides links"
      ],
      "answer": 1,
      "explanation": "Formulas are replaced by their current values."
    },
    {
      "question": "Which shortcut refreshes all connections?",
      "options": [
        "Ctrl+Alt+F5",
        "Alt+F5",
        "Ctrl+F5",
        "F9"
      ],
      "answer": 0,
      "explanation": "Alt+F5 refreshes the selected one; Ctrl+Alt+F5 refreshes all."
    }
  ]
};
