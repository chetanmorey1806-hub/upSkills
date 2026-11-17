export default {
  id: 'day-05-import-excel-csv-text-json',
  title: 'Import Excel, CSV, Text Files, JSON Files and Basic Data Connections',
  module: 'Module 1: Introduction to Power BI',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Connect Power BI to the most common file sources – Excel workbooks, CSV, delimited text and JSON – understand the Navigator, Load vs Transform data, the M code each connector writes, and how to change a file path later.',
  objectives: [
    'Import sheets and Excel tables from a workbook and know the difference',
    'Import CSV and delimited text files and control delimiter, encoding and headers',
    'Import a JSON file and expand records/lists into a table',
    'Choose between Load and Transform data and read the generated M code',
    'Change a source file path with Data source settings and combine files from a folder',
  ],
  theory: [
    {
      heading: 'Get Data basics: Navigator, Load and Transform data',
      content:
        `Every import starts from **Home > Get data**. The common file connectors are on the drop-down; all connectors are under **Get data > More...**.\n\nAfter selecting a file, the **Navigator** (for Excel/databases) or a **preview dialog** (for CSV/text) appears. You then choose:\n\n- **Load** – load data straight into the model as-is.\n- **Transform data** – open the **Power Query Editor** first to clean it (recommended almost always).\n\nWhatever you choose, Power Query writes a query in the **M language**. The first step is always **Source**, which records the connector and file path.`,
      tip: 'Get into the habit of clicking Transform data instead of Load. Even if the data looks clean, you should check data types and headers.',
    },
    {
      heading: 'Importing Excel workbooks',
      content:
        `**Home > Get data > Excel workbook** > pick the .xlsx file > **Open**. The Navigator lists:\n\n- **Sheets** (icon of a sheet) – the whole used range of a worksheet, including any title rows or notes.\n- **Tables** (icon with blue header) – Excel Tables created with Ctrl+T, with clean boundaries and headers.\n- **Named ranges**.\n\nPrefer **Tables**: they grow automatically when new rows are added and headers are already set. When you import a **sheet**, Power Query usually adds a **Promoted Headers** step.`,
      syntax: `let
    Source = Excel.Workbook(File.Contents("C:\\PBI\\Sales.xlsx"), null, true),
    tblSales_Table = Source{[Item="tblSales",Kind="Table"]}[Data],
    #"Changed Type" = Table.TransformColumnTypes(tblSales_Table,
        {{"OrderID", Int64.Type}, {"OrderDate", type date}, {"SalesAmount", type number}})
in
    #"Changed Type"`,
    },
    {
      heading: 'Importing CSV and text files',
      content:
        `**Home > Get data > Text/CSV** works for .csv, .txt and .prn files. The preview dialog shows:\n\n- **File Origin** (encoding) – use **65001: Unicode (UTF-8)** for files with ₹, Hindi/Marathi text or special characters.\n- **Delimiter** – Comma, Tab, Semicolon, Space, Custom (for example \`|\` pipe), or Fixed width.\n- **Data Type Detection** – based on first 200 rows, entire dataset, or do not detect.\n\nCSV/text files have no data types, so Power Query adds **Promoted Headers** and **Changed Type** steps automatically.`,
      syntax: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\Sales.csv"),
        [Delimiter=",", Columns=7, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",
        {{"OrderID", Int64.Type}, {"OrderDate", type date}, {"Quantity", Int64.Type}})
in
    #"Changed Type"`,
      tip: 'If a CSV has new columns added later, the hard-coded Columns=7 can drop them. Remove the Columns=7 part from the Source step to read all columns.',
    },
    {
      heading: 'Importing JSON files',
      content:
        `**JSON** (JavaScript Object Notation) is the format most web APIs return. It contains **records** \`{ }\` (like one row) and **lists** \`[ ]\` (like many rows).\n\n**Home > Get data > More... > File > JSON** > pick file > **Connect**. Power Query opens with a **List** or **Record**. Then:\n\n1. If it is a list: **List Tools > Transform > To Table** > OK.\n2. Click the **expand icon** (two arrows) on Column1, untick "Use original column name as prefix", OK.\n3. Repeat expand for nested records or lists.\n4. Set data types.`,
      syntax: `let
    Source = Json.Document(File.Contents("C:\\PBI\\orders.json")),
    #"Converted to Table" = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1",
        {"orderId", "city", "amount"}, {"orderId", "city", "amount"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",
        {{"orderId", Int64.Type}, {"city", type text}, {"amount", type number}})
in
    #"Changed Type"`,
    },
    {
      heading: 'Other basic connections and managing sources',
      content:
        `- **Folder** – Get data > More > Folder > **Combine & Transform** to stack all files with the same structure (e.g. one CSV per month).\n- **Web** – Get data > Web > paste a URL (HTML tables, CSV links or APIs).\n- **SharePoint folder / OneDrive** – best for files that must refresh in the Service without a gateway.\n- **Enter data** – Home > Enter data to type or paste a small table (lookup lists, targets).\n- **Databases** – SQL Server, MySQL, etc. (Day 44).\n\n**Changing a file path**: **Home > Transform data > Data source settings > Change Source...**, or in Power Query select the query and click the gear icon next to the **Source** step.`,
      points: [
        'Local file paths (C:\\...) need a gateway for scheduled refresh in the Service.',
        'Files in SharePoint Online/OneDrive for Business refresh in the Service without a gateway.',
        'Use **Recent sources** on the Home ribbon to reconnect quickly.',
      ],
    },
  ],
  examples: [
    {
      title: 'Import an Excel table (not a sheet)',
      scenario: 'Sales.xlsx has a sheet "Sales" with a title row on top, and an Excel Table "tblSales" on the same data.',
      table: {
        headers: ['Navigator item', 'Icon', 'What you get'],
        rows: [
          ['Sales', 'Sheet', 'Title row "Monthly Sales Report" + blank row + headers as data rows'],
          ['tblSales', 'Table', 'Clean headers: OrderID, OrderDate, City, Product, Quantity, SalesAmount'],
        ],
      },
      steps: [
        'Home > Get data > Excel workbook, browse to Sales.xlsx, click Open.',
        'In Navigator click "Sales" (sheet) and look at the preview – note Column1, Column2 headers and the title row.',
        'Now click "tblSales" (table) – headers are already correct.',
        'Tick tblSales and click Transform data.',
        'In Power Query, check the Applied Steps: Source, Navigation, Changed Type.',
      ],
      code: `let
    Source = Excel.Workbook(File.Contents("C:\\PBI\\Sales.xlsx"), null, true),
    tblSales_Table = Source{[Item="tblSales",Kind="Table"]}[Data],
    #"Changed Type" = Table.TransformColumnTypes(tblSales_Table,{{"OrderID", Int64.Type}, {"OrderDate", type date}, {"City", type text}, {"Product", type text}, {"Quantity", Int64.Type}, {"SalesAmount", type number}})
in
    #"Changed Type"`,
      result: 'A clean query named tblSales with 6 typed columns.',
      explanation: 'Excel Tables have exact boundaries and headers, so fewer cleaning steps are needed and new rows are picked up automatically.',
    },
    {
      title: 'Import a pipe-delimited text file with UTF-8 encoding',
      scenario: 'The ERP exports customers.txt using | as separator and contains the ₹ symbol.',
      table: {
        headers: ['Raw line in customers.txt'],
        rows: [
          ['CustomerID|Customer|City|Segment'],
          ['C01|Patil Traders|Pune|Corporate'],
          ['C02|Shah & Sons|Mumbai|Retail'],
        ],
      },
      steps: [
        'Home > Get data > Text/CSV, choose customers.txt, Open.',
        'File Origin: 65001: Unicode (UTF-8).',
        'Delimiter: --Custom--, type | in the box.',
        'Click Transform data.',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\customers.txt"),[Delimiter="|", Columns=4, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{{"CustomerID", type text}, {"Customer", type text}, {"City", type text}, {"Segment", type text}})
in
    #"Changed Type"`,
      result: 'A table with columns CustomerID, Customer, City, Segment and rows C01 Patil Traders Pune Corporate, C02 Shah & Sons Mumbai Retail.',
      explanation: 'The Text/CSV connector handles any single-character delimiter; correct encoding prevents garbled characters.',
    },
    {
      title: 'Import a JSON file and flatten it',
      scenario: 'orders.json contains a list of order records.',
      table: {
        headers: ['orderId', 'city', 'amount'],
        rows: [
          [5001, 'Pune', 2500],
          [5002, 'Nagpur', 1800],
          [5003, 'Nashik', 4200],
        ],
      },
      steps: [
        'Home > Get data > More... > File > JSON > Connect, choose orders.json.',
        'Power Query shows a List with 3 Record items.',
        'Click List Tools > Transform > To Table, keep defaults, OK.',
        'Click the expand icon on Column1, tick orderId, city, amount, untick "Use original column name as prefix", OK.',
        'Select orderId > Transform > Data Type > Whole Number; amount > Decimal Number.',
        'Home > Close & Apply.',
      ],
      code: `// orders.json
// [ {"orderId":5001,"city":"Pune","amount":2500},
//   {"orderId":5002,"city":"Nagpur","amount":1800},
//   {"orderId":5003,"city":"Nashik","amount":4200} ]
let
    Source = Json.Document(File.Contents("C:\\PBI\\orders.json")),
    #"Converted to Table" = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", {"orderId", "city", "amount"}, {"orderId", "city", "amount"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",{{"orderId", Int64.Type}, {"city", type text}, {"amount", type number}})
in
    #"Changed Type"`,
      result: 'The 3-row table shown above.',
      explanation: 'JSON lists become tables via To Table; records become columns via Expand.',
    },
    {
      title: 'Change the source path after moving files',
      scenario: 'You moved Sales.csv from C:\\PBI to D:\\Projects\\Data and refresh fails with "Could not find file".',
      steps: [
        'Home > Transform data > Data source settings.',
        'Select the old path C:\\PBI\\Sales.csv and click Change Source...',
        'Browse to D:\\Projects\\Data\\Sales.csv, OK, Close.',
        'Home > Refresh.',
      ],
      code: `Source = Csv.Document(File.Contents("D:\\Projects\\Data\\Sales.csv"),[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None])`,
      result: 'Refresh succeeds; all later steps remain unchanged.',
      explanation: 'Only the Source step holds the path, so changing it repoints the whole query.',
    },
    {
      title: 'Combine monthly CSV files from a folder',
      scenario: 'Folder D:\\Sales\\2024 has Jan.csv, Feb.csv, Mar.csv with identical columns.',
      steps: [
        'Home > Get data > More... > Folder > Connect, browse to D:\\Sales\\2024, OK.',
        'In the file list dialog click Combine > Combine & Transform Data.',
        'In Combine Files choose the sample file (First file), click OK.',
        'Power Query creates a helper group (Transform File, Sample File) and a combined query with a Source.Name column showing the file name.',
        'Close & Apply. Next month just drop Apr.csv in the folder and click Refresh.',
      ],
      result: 'One table with rows from all three files plus Source.Name (Jan.csv, Feb.csv, Mar.csv).',
      explanation: 'Folder + Combine applies the same transformation to every file, so new files are added automatically on refresh.',
    },
  ],
  interview: [
    { q: 'What is the difference between Load and Transform data in the Navigator?', a: 'Load imports data directly into the model with automatic steps only. Transform data opens the Power Query Editor so you can clean and shape data before loading. Best practice is Transform data.', level: 'Easy' },
    { q: 'Why prefer an Excel Table over a sheet when importing?', a: 'Tables have defined boundaries and headers, expand automatically with new rows, and avoid title rows, notes and blank columns that come with a sheet\'s used range.', level: 'Easy' },
    { q: 'Your CSV shows strange characters instead of ₹. What do you change?', a: 'The File Origin/encoding to 65001: Unicode (UTF-8), which updates Encoding=65001 in Csv.Document.', level: 'Medium' },
    { q: 'How do you import JSON in Power BI?', a: 'Get data > JSON. Json.Document returns a list/record. Convert the list to a table, then expand record columns (and nested lists) and set data types.', level: 'Medium' },
    { q: 'How would you load 12 monthly files with the same structure?', a: 'Use the Folder connector and Combine & Transform. Power Query builds a function from a sample file and applies it to each file, appending them. New files in the folder load on refresh.', level: 'Medium' },
    { q: 'Scenario: a report using a CSV on your laptop refreshes in Desktop but fails in the Service. Why?', a: 'The Service cannot reach a local path. Either install and configure an on-premises data gateway, or move the file to SharePoint Online/OneDrive for Business and connect through the SharePoint/web connector.', level: 'Hard' },
    { q: 'A new column was added to the CSV but does not appear in Power BI. Why?', a: 'The Csv.Document step has a hard-coded Columns=N option, and/or later steps reference fixed columns. Remove Columns=N from the Source step (or update it) and refresh.', level: 'Hard' },
  ],
  practice: [
    { task: 'Import Product.csv and Customer.csv from the course dataset using Transform data and check the data types of every column.', hint: 'Look at the icon left of each header (ABC, 123, 1.2, calendar).', solution: 'Get data > Text/CSV > Transform data. ProductID/CustomerID text, Price decimal, others text. Fix any wrong type via Transform > Data Type.' },
    { task: 'Create a small Targets table with Home > Enter data: City, Target (Pune 500000, Mumbai 800000, Nagpur 300000, Nashik 250000).', hint: 'Type column names in the header row.', solution: 'Home > Enter data > type headers City, Target and four rows > name "Targets" > Load. M uses Table.FromRows(Json.Document(Binary.Decompress(...))).' },
    { task: 'Import a JSON file with nested address records, e.g. {"id":1,"name":"Asha","address":{"city":"Pune","pin":"411001"}}.', hint: 'Expand twice.', solution: 'To Table > expand Column1 (id, name, address) > expand address (city, pin) > set types.' },
    { task: 'Move one of your CSV files to another folder and fix the query with Data source settings.', hint: 'Home > Transform data > Data source settings.', solution: 'Select the old path > Change Source > browse new path > OK > Close > Refresh.' },
  ],
  quiz: [
    { question: 'Which M function reads a CSV file?', options: ['Csv.Document', 'Excel.Workbook', 'Json.Document', 'Table.FromList'], answer: 0, explanation: 'Csv.Document parses delimited text from File.Contents.' },
    { question: 'In the Excel Navigator, an Excel Table is preferred because:', options: ['It loads faster in all cases', 'Sheets cannot be imported', 'Tables are encrypted', 'It has defined headers and boundaries that grow with data'], answer: 3, explanation: 'Tables give clean structure and auto-expand.' },
    { question: 'What encoding code is UTF-8?', options: ['1252', '437', '65001', '1200'], answer: 2, explanation: '65001 is the Windows code page for UTF-8.' },
    { question: 'To stack 12 monthly CSVs with the same columns automatically, use:', options: ['Enter data', 'Folder connector with Combine', 'JSON connector', 'Merge queries'], answer: 1, explanation: 'Folder + Combine & Transform appends all files.' },
    { question: 'Where do you change the file path of an existing source?', options: ['Home > Transform data > Data source settings', 'View > Options', 'Modeling > Manage roles', 'Insert > Text box'], answer: 0, explanation: 'Data source settings > Change Source updates the path.' },
  ],
};
