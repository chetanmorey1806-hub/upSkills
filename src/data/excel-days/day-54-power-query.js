export default {
  id: 'day-54-power-query',
  title: 'Power Query: Import, Clean and Transform Data',
  module: 'Module 7: Advanced Excel Tools',
  day: 54,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Power Query is Excel\'s built-in data preparation tool. It imports data from files, folders, databases and the web, cleans and reshapes it with recorded steps, and refreshes everything with one click next month.',
  objectives: [
    'Open Power Query and import data from CSV, Excel workbooks, tables and folders',
    'Understand the Power Query Editor: preview, Applied Steps, formula bar and Advanced Editor',
    'Clean data: remove rows, remove duplicates, trim, change data types, replace values, fill down',
    'Transform data: split columns, add custom columns, unpivot, group by, append and merge queries',
    'Load results to a sheet or Data Model and refresh with Data > Refresh All',
  ],
  theory: [
    {
      heading: 'What is Power Query and why use it?',
      content: 'Every month many accountants receive the same messy file: extra spaces, blank rows, dates as text, months in columns. Cleaning it by hand takes hours and must be repeated next month.\n\n**Power Query** (Get & Transform) records each cleaning step once. Next month you replace the file and click **Refresh**; all steps run again automatically.\n\n- Found in **Data > Get & Transform Data** group.\n- Works in Excel 2016, 2019, 2021 and Microsoft 365 (and the same engine is inside Power BI).\n- It does NOT change your original file. It reads the source, transforms a copy and loads the result.\n- Each step is written in the **M language** behind the scenes.',
    },
    {
      heading: 'Importing data (Get Data)',
      content: 'Common menu paths:\n\n- **CSV / Text**: Data > Get & Transform Data > **From Text/CSV**, choose the file, click **Transform Data**.\n- **Another Excel workbook**: Data > Get Data > From File > **From Workbook**, choose the file, select a sheet or table in the Navigator, click **Transform Data**.\n- **A table/range in this workbook**: click inside it, Data > Get & Transform Data > **From Table/Range** (Excel converts a range into a Table first).\n- **All files in a folder**: Data > Get Data > From File > **From Folder**, choose the folder, click **Combine & Transform Data**. Great for 12 monthly files with the same layout.\n- **Web page**: Data > Get & Transform Data > **From Web**, paste the URL.\n- **Databases**: Data > Get Data > From Database > From SQL Server Database.\n\nIn the Navigator / preview window, **Load** loads directly; **Transform Data** opens the Power Query Editor so you can clean first (recommended).',
    },
    {
      heading: 'The Power Query Editor window',
      content: 'Parts of the editor:\n\n- **Ribbon tabs**: Home, Transform, Add Column, View.\n- **Queries pane** (left): list of all queries in the workbook.\n- **Data preview** (centre): first 1,000 rows. Column header icons show data type (ABC = text, 123 = whole number, 1.2 = decimal, calendar = date).\n- **Formula bar**: shows the M code of the selected step (turn on via View > Layout > Formula Bar).\n- **Query Settings** (right): query **Name** and **Applied Steps**. Click a step to see data at that point, click the X to delete it, right-click > Rename to give it a clear name.\n- **Advanced Editor**: Home > Query > Advanced Editor shows the full M code.\n\nTo reopen the editor later: Data > Queries & Connections, then double-click the query.',
      tip: 'Column quality bars: View > Data Preview > tick Column quality and Column profile. They show % valid, error and empty values. Tick "Column profiling based on entire data set" in the status bar for accurate counts.',
    },
    {
      heading: 'Cleaning data: the most used commands',
      content: '- **Use First Row as Headers**: Home > Transform > Use First Row as Headers.\n- **Change data type**: click the type icon on the header, or Transform > Any Column > Data Type. Always set dates and numbers correctly.\n- **Remove blank rows**: Home > Reduce Rows > Remove Rows > Remove Blank Rows.\n- **Remove top rows** (titles above the data): Home > Reduce Rows > Remove Rows > Remove Top Rows.\n- **Remove duplicates**: select key column(s), Home > Reduce Rows > Remove Rows > Remove Duplicates.\n- **Trim / Clean / Capitalize**: Transform > Text Column > Format > Trim, Clean, Capitalize Each Word, UPPERCASE.\n- **Replace values**: Transform > Any Column > Replace Values (e.g. "N/A" with null).\n- **Fill Down**: Transform > Any Column > Fill > Down (fill blank cells under a group heading).\n- **Remove columns**: select columns, Home > Manage Columns > Remove Columns (or Choose Columns to keep only some).\n- **Filter rows**: use the drop-down arrow on the column header, like AutoFilter.',
      tip: 'In Power Query "blank" text is "" but missing values are null. Remove Blank Rows removes rows where every column is null or empty.',
    },
    {
      heading: 'Transforming data: reshape and combine',
      content: '- **Split Column**: Home > Transform > Split Column > By Delimiter (e.g. split "Mumbai-West" at "-").\n- **Custom Column**: Add Column > General > Custom Column, e.g. `[Qty] * [Rate]`.\n- **Conditional Column**: Add Column > General > Conditional Column (IF-THEN logic without code).\n- **Column From Examples**: Add Column > Column From Examples (like Flash Fill).\n- **Unpivot**: select the ID column(s), Transform > Any Column > Unpivot Columns > **Unpivot Other Columns**. Converts months-in-columns into rows (Month, Sales).\n- **Group By**: Home > Transform > Group By (like a summary: total sales per region).\n- **Append Queries**: Home > Combine > Append Queries (stack Jan + Feb + Mar one below another).\n- **Merge Queries**: Home > Combine > Merge Queries (join two tables on a key, like VLOOKUP). Then click the expand icon to choose columns.',
    },
    {
      heading: 'Loading and refreshing',
      content: '- **Home > Close & Load**: loads the result as a new Table on a new sheet.\n- **Home > Close & Load > Close & Load To...**: choose Table, PivotTable Report, PivotChart, **Only Create Connection**, and optionally **Add this data to the Data Model** (Day 55).\n- **Refresh**: Data > Queries & Connections > **Refresh All** (Ctrl+Alt+F5), or right-click the result table > Refresh.\n- **Refresh on open**: Data > Queries & Connections > right-click query > Properties > tick **Refresh data when opening the file**.\n- **Change source file**: open the editor, click the gear icon next to the **Source** step, or Home > Data Sources > Data source settings > Change Source.',
      syntax: 'let\n    Step1 = ...,\n    Step2 = SomeFunction(Step1, ...)\nin\n    Step2',
      points: [
        'An M query is a let ... in block. Each step has a name and uses the previous step',
        'Step names with spaces are written as #"Step Name"',
        'M is case-sensitive: Table.SelectRows works, table.selectrows does not',
      ],
    },
  ],
  examples: [
    {
      title: 'Import and clean a monthly sales CSV',
      scenario: 'sales_jan.csv has Region values with extra spaces, a blank row, duplicate OrderIDs and Amount stored as text. Clean it and load to Excel.',
      table: {
        headers: ['A: OrderID', 'B: OrderDate', 'C: Region', 'D: Product', 'E: Amount'],
        rows: [['1001', '05-01-2025', '  North ', 'Laptop', '55000'], ['1002', '06-01-2025', 'south', 'Mobile', '18000'], ['', '', '', '', ''], ['1002', '06-01-2025', 'south', 'Mobile', '18000'], ['1003', '07-01-2025', 'West  ', 'Printer', '12000']],
      },
      steps: [
        'Data > Get & Transform Data > From Text/CSV. Select sales_jan.csv and click Import.',
        'In the preview click Transform Data.',
        'Home > Reduce Rows > Remove Rows > Remove Blank Rows.',
        'Select OrderID, then Home > Reduce Rows > Remove Rows > Remove Duplicates.',
        'Select Region, Transform > Text Column > Format > Trim, then Format > Capitalize Each Word.',
        'Click the type icon on OrderDate > Using Locale... > Date, English (India) (because dates are dd-mm-yyyy).',
        'Set Amount to Decimal Number (1.2 icon).',
        'In Query Settings rename the query to Sales_Jan.',
        'Home > Close & Load.',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\Reports\\sales_jan.csv"), [Delimiter = ",", Columns = 5, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    #"Removed Blank Rows" = Table.SelectRows(#"Promoted Headers", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Removed Duplicates" = Table.Distinct(#"Removed Blank Rows", {"OrderID"}),
    #"Trimmed Text" = Table.TransformColumns(#"Removed Duplicates", {{"Region", Text.Trim, type text}}),
    #"Capitalized Each Word" = Table.TransformColumns(#"Trimmed Text", {{"Region", Text.Proper, type text}}),
    #"Changed Type with Locale" = Table.TransformColumnTypes(#"Capitalized Each Word", {{"OrderDate", type date}}, "en-IN"),
    #"Changed Type" = Table.TransformColumnTypes(#"Changed Type with Locale", {{"OrderID", Int64.Type}, {"Amount", type number}})
in
    #"Changed Type"`,
      result: '3 clean rows: 1001 North Laptop 55000 | 1002 South Mobile 18000 | 1003 West Printer 12000',
      explanation: 'Each click became one Applied Step (one line of M). The blank row and duplicate 1002 were removed, Region was trimmed and capitalised, dates were read using the Indian locale so 06-01-2025 is 6 January (not 1 June). Next month, change the file path in the Source step and Refresh.',
    },
    {
      title: 'Unpivot month columns into rows',
      scenario: 'A budget sheet has products in rows and months in columns. A PivotTable needs one Month column and one Sales column.',
      table: { headers: ['A: Product', 'B: Jan', 'C: Feb', 'D: Mar'], rows: [['Pen', '1200', '1500', '1300'], ['Pencil', '800', '900', '700']] },
      steps: [
        'Click inside the data, Data > Get & Transform Data > From Table/Range. Tick My table has headers > OK.',
        'In the editor, select the Product column.',
        'Transform > Any Column > Unpivot Columns drop-down > Unpivot Other Columns.',
        'Rename Attribute to Month and Value to Sales (double-click the header).',
        'Set Sales type to Whole Number.',
        'Home > Close & Load.',
      ],
      code: `let
    Source = Excel.CurrentWorkbook(){[Name = "Table1"]}[Content],
    #"Unpivoted Other Columns" = Table.UnpivotOtherColumns(Source, {"Product"}, "Attribute", "Value"),
    #"Renamed Columns" = Table.RenameColumns(#"Unpivoted Other Columns", {{"Attribute", "Month"}, {"Value", "Sales"}}),
    #"Changed Type" = Table.TransformColumnTypes(#"Renamed Columns", {{"Sales", Int64.Type}})
in
    #"Changed Type"`,
      result: '6 rows: Pen Jan 1200 | Pen Feb 1500 | Pen Mar 1300 | Pencil Jan 800 | Pencil Feb 900 | Pencil Mar 700',
      explanation: 'Unpivot Other Columns keeps Product fixed and turns every other column into Month/Sales pairs. Using "Other Columns" means that when an Apr column is added later, it is unpivoted automatically on refresh.',
    },
    {
      title: 'Combine 12 monthly files from a folder',
      scenario: 'Folder C:\\Sales\\2025 contains Jan.xlsx ... Dec.xlsx, each with an identical table on sheet "Data". Build one combined table that picks up new files automatically.',
      steps: [
        'Data > Get Data > From File > From Folder. Browse to C:\\Sales\\2025, click Open.',
        'In the preview, click Combine > Combine & Transform Data.',
        'In Combine Files choose Sample File: First file, select the sheet "Data", click OK.',
        'Power Query creates helper queries and a combined query with a Source.Name column (file name).',
        'Rename Source.Name to Month and use Transform > Text Column > Extract > Text Before Delimiter "." to keep "Jan".',
        'Set data types, then Home > Close & Load.',
        'When a new month file is added to the folder, click Data > Refresh All.',
      ],
      code: `let
    Source = Folder.Files("C:\\Sales\\2025"),
    #"Filtered Excel" = Table.SelectRows(Source, each [Extension] = ".xlsx"),
    #"Added Data" = Table.AddColumn(#"Filtered Excel", "Data", each Excel.Workbook([Content], true){[Item = "Data", Kind = "Sheet"]}[Data]),
    #"Kept Columns" = Table.SelectColumns(#"Added Data", {"Name", "Data"}),
    #"Expanded Data" = Table.ExpandTableColumn(#"Kept Columns", "Data", {"OrderID", "Region", "Amount"}),
    #"Month Column" = Table.TransformColumns(#"Expanded Data", {{"Name", each Text.BeforeDelimiter(_, "."), type text}}),
    #"Renamed" = Table.RenameColumns(#"Month Column", {{"Name", "Month"}})
in
    #"Renamed"`,
      result: 'One table with Month, OrderID, Region, Amount for all 12 files',
      explanation: 'This hand-written version shows the logic: list files, keep .xlsx, read sheet "Data" from each with headers, expand into rows. The Combine button generates similar code with helper functions. All files must have the same column names.',
    },
    {
      title: 'Merge queries (lookup) and Group By',
      scenario: 'Orders has ProductID and Qty; Products has ProductID, Product and Rate. Get Product and Rate into Orders, compute Amount and total Amount by Product.',
      table: { headers: ['A: OrderID', 'B: ProductID', 'C: Qty'], rows: [['1', 'P1', '10'], ['2', 'P2', '5'], ['3', 'P1', '4']] },
      steps: [
        'Load both tables to Power Query (From Table/Range). Products: P1 Pen ₹10, P2 Marker ₹40. Close & Load To > Only Create Connection for Products.',
        'Open Orders query. Home > Combine > Merge Queries.',
        'Select ProductID in Orders, choose Products, select its ProductID. Join Kind: Left Outer. OK.',
        'Click the expand icon on the new Products column, tick Product and Rate, untick "Use original column name as prefix". OK.',
        'Add Column > General > Custom Column: name Amount, formula [Qty] * [Rate]. OK. Set type to number.',
        'Home > Transform > Group By: Group by Product, New column name Total Amount, Operation Sum, Column Amount. OK.',
        'Home > Close & Load.',
      ],
      code: `let
    Source = Excel.CurrentWorkbook(){[Name = "Orders"]}[Content],
    #"Merged Queries" = Table.NestedJoin(Source, {"ProductID"}, Products, {"ProductID"}, "Products", JoinKind.LeftOuter),
    #"Expanded Products" = Table.ExpandTableColumn(#"Merged Queries", "Products", {"Product", "Rate"}, {"Product", "Rate"}),
    #"Added Amount" = Table.AddColumn(#"Expanded Products", "Amount", each [Qty] * [Rate], type number),
    #"Grouped Rows" = Table.Group(#"Added Amount", {"Product"}, {{"Total Amount", each List.Sum([Amount]), type number}})
in
    #"Grouped Rows"`,
      result: 'Pen 140 | Marker 200',
      explanation: 'Pen: (10 + 4) x 10 = 140. Marker: 5 x 40 = 200. Merge Queries works like VLOOKUP but handles thousands of rows quickly and refreshes automatically. Left Outer keeps all orders even if a product is missing.',
    },
  ],
  interview: [
    { q: 'What is Power Query and what problem does it solve?', a: 'Power Query (Get & Transform) is an ETL tool inside Excel and Power BI. It extracts data from many sources, transforms it with recorded steps (remove blanks, trim, change types, unpivot, merge) and loads it to Excel. Because steps are saved, the same cleaning repeats on new data with one Refresh, removing manual repetitive work.', level: 'Easy' },
    { q: 'What are Applied Steps?', a: 'Each action you perform in the Power Query Editor is recorded as a step in the Query Settings pane. Steps run in order from top to bottom every refresh. You can click a step to view data at that point, rename it, delete it or insert steps in between. Each step is one line of M code.', level: 'Easy' },
    { q: 'Explain the difference between Merge Queries and Append Queries.', a: 'Append stacks tables vertically (rows of Jan below rows of Feb) – like UNION. The tables should have the same columns. Merge joins tables horizontally on matching key columns – like VLOOKUP or SQL JOIN – adding columns from the second table. Join kinds include Left Outer, Right Outer, Inner, Full Outer, Left Anti and Right Anti.', level: 'Medium' },
    { q: 'What is the difference between Unpivot Columns and Unpivot Other Columns?', a: 'Unpivot Columns unpivots only the columns you selected, so new columns added later are not unpivoted. Unpivot Other Columns keeps the selected ID columns and unpivots everything else, so new month columns are automatically included on refresh. Unpivot Other Columns is usually safer.', level: 'Medium' },
    { q: 'Dates like 06-01-2025 are loading as 1 June instead of 6 January. How do you fix it?', a: 'Change the type using locale: click the column type icon > Using Locale..., Data Type Date, Locale English (India). This generates Table.TransformColumnTypes(..., {{"OrderDate", type date}}, "en-IN"). Also remove any automatic Changed Type step that converted it wrongly before.', level: 'Hard' },
    { q: 'What is the difference between Close & Load and Only Create Connection?', a: 'Close & Load loads the result as a Table on a worksheet. Close & Load To > Only Create Connection keeps the query without loading rows to a sheet; it can be used by other queries (merge/append), PivotTables or the Data Model. This is useful for staging/lookup queries and large data that would exceed sheet limits.', level: 'Medium' },
    { q: 'How do you make Power Query refresh automatically?', a: 'Data > Queries & Connections > right-click the query > Properties. Tick Refresh data when opening the file, and/or Refresh every N minutes. Manually, use Data > Refresh All (Ctrl+Alt+F5).', level: 'Easy' },
    { q: 'What is M language? Show a simple example.', a: 'M is the functional, case-sensitive formula language behind Power Query. A query is a let ... in expression where each step refers to the previous one. Example: let Source = Excel.CurrentWorkbook(){[Name="Sales"]}[Content], Filtered = Table.SelectRows(Source, each [Amount] > 10000) in Filtered.', level: 'Hard' },
    { q: 'Your folder query fails after someone saved a temporary file in the folder. How do you prevent it?', a: 'Add a filter step after Folder.Files to keep only the right files, for example Extension = ".xlsx" and Name does not start with "~$" (Excel temp files). Also standardise column names in each file, because combine expects the same structure.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Employee list (Table "Emp"): Name ("  ravi kumar ", "SNEHA rao", "arjun "), Dept ("Sales", null, "HR"). Clean names to Proper case without spaces and fill missing Dept down.',
      hint: 'Trim, Capitalize Each Word, then Fill Down on Dept.',
      solution: '1. Click table > Data > From Table/Range.\n2. Select Name > Transform > Format > Trim; then Format > Capitalize Each Word.\n3. Select Dept > Transform > Fill > Down.\n4. Close & Load.\nResult: Ravi Kumar Sales | Sneha Rao Sales | Arjun HR.\nM: Table.FillDown(Table.TransformColumns(Source, {{"Name", each Text.Proper(Text.Trim(_)), type text}}), {"Dept"})',
    },
    {
      task: 'A CSV of invoices has the first 3 rows as a company title and blank lines before the header row. Import it and make row 4 the header.',
      hint: 'Remove Top Rows then Use First Row as Headers.',
      solution: '1. Data > From Text/CSV > Transform Data.\n2. Home > Remove Rows > Remove Top Rows > 3 > OK.\n3. Home > Use First Row as Headers.\n4. Set data types, Close & Load.\nM: Table.PromoteHeaders(Table.Skip(Source, 3), [PromoteAllScalars=true])',
    },
    {
      task: 'Sheets Jan_Sales and Feb_Sales (both Tables with Date, Region, Amount). Combine them into one table and add a column "Size" = "Big" if Amount >= 50000 else "Small".',
      hint: 'Append Queries as New, then Conditional Column.',
      solution: '1. Load both tables as connections (From Table/Range > Close & Load To > Only Create Connection).\n2. Data > Get Data > Combine Queries > Append, choose Jan_Sales and Feb_Sales.\n3. Add Column > Conditional Column: New column name Size; If Amount is greater than or equal to 50000 Then Big Else Small.\n4. Close & Load.\nM: Table.AddColumn(Table.Combine({Jan_Sales, Feb_Sales}), "Size", each if [Amount] >= 50000 then "Big" else "Small", type text)',
    },
    {
      task: 'Split column "City-Zone" (e.g. "Pune-West") into City and Zone.',
      hint: 'Split Column By Delimiter "-".',
      solution: 'Select the column > Home > Split Column > By Delimiter > Custom "-" > Split at Left-most delimiter > OK. Rename the columns City and Zone.\nM: Table.SplitColumn(Source, "City-Zone", Splitter.SplitTextByDelimiter("-"), {"City", "Zone"})',
    },
    {
      task: 'From a sales query, produce Region-wise Total Amount and Order Count. Data: North 1000, North 3000, South 2000.',
      hint: 'Group By with Advanced option for two aggregations.',
      solution: 'Home > Group By > Advanced: Group by Region; add aggregation Total Amount = Sum of Amount; add Order Count = Count Rows.\nResult: North 4000 (2) | South 2000 (1).\nM: Table.Group(Source, {"Region"}, {{"Total Amount", each List.Sum([Amount]), type number}, {"Order Count", each Table.RowCount(_), Int64.Type}})',
    },
  ],
  quiz: [
    { question: 'Where do you start importing a CSV with Power Query?', options: ['File > Open', 'Data > Get & Transform Data > From Text/CSV', 'Insert > Table', 'Home > Paste Special'], answer: 1, explanation: 'Data > Get & Transform Data > From Text/CSV, then Transform Data.' },
    { question: 'Which command converts month columns into rows?', options: ['Pivot Column', 'Transpose', 'Unpivot Other Columns', 'Group By'], answer: 2, explanation: 'Unpivot turns columns into attribute/value rows.' },
    { question: 'Merge Queries in Power Query is most similar to:', options: ['SUM', 'VLOOKUP / JOIN', 'Sort', 'Copy-paste below'], answer: 1, explanation: 'Merge joins two tables on a key column.' },
    { question: 'Shortcut for Data > Refresh All:', options: ['F9', 'Ctrl+R', 'Ctrl+Alt+F5', 'Alt+F11'], answer: 2, explanation: 'Ctrl+Alt+F5 refreshes all queries and connections.' },
    { question: 'In M, the result of the query is the step written after:', options: ['let', 'in', 'each', 'then'], answer: 1, explanation: 'A query is let ... in <final step>.' },
  ],
};
