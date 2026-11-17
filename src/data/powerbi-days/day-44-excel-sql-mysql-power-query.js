export default {
  id: 'day-44-excel-sql-mysql-power-query',
  title: 'Power BI with Excel, SQL Server, MySQL and Power Query',
  module: 'Module 8: AI Features & Advanced Integration',
  day: 44,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Real projects pull data from Excel files and relational databases. Learn to connect Power BI to Excel, SQL Server and MySQL, choose Import or DirectQuery, keep transformations foldable in Power Query, switch servers with parameters, and push the finished semantic model back to Excel users.',
  objectives: [
    'Import Excel tables, sheets and named ranges correctly and reuse Excel Power Query/Power Pivot work',
    'Connect to SQL Server with Import or DirectQuery, write native SQL safely and verify query folding',
    'Connect to MySQL (driver, server:port, credentials) and know when a gateway is needed',
    'Use Power Query parameters to switch between Dev and Prod databases',
    'Connect Excel to a published semantic model with Analyze in Excel / PivotTable from Power BI',
  ],
  theory: [
    {
      heading: 'Power BI and Excel: both directions',
      content:
        "**Excel into Power BI**\n\n- **Home > Get data > Excel workbook**, choose the file; the Navigator lists **Tables** (formatted tables, best choice), **Sheets** and **named ranges**. Prefer Excel tables (Insert > Table in Excel) because they grow automatically and have clean headers.\n- **File > Import > Power Query, Power Pivot, Power View** imports an Excel workbook's queries, data model, relationships and measures into a new Power BI file: a fast way to migrate an Excel BI workbook.\n- Excel and Power BI use the **same Power Query engine and M language**. You can copy a query in Excel's Queries & Connections pane and paste it into Power BI's Queries pane.\n\n**Power BI into Excel**\n\n- **Analyze in Excel** (report > Export > Analyze in Excel) or in Excel **Insert > PivotTable > From Power BI** (or Data > Get Data > From Power Platform > From Power BI semantic model) creates a PivotTable live-connected to the semantic model. Needs Build permission.\n- **Export data** from a visual (Day 41).",
      tip: 'Store shared Excel sources in SharePoint/OneDrive so scheduled refresh works without a gateway.',
    },
    {
      heading: 'SQL Server connector',
      content:
        "Path: **Home > SQL Server** (or Get data > Database > SQL Server database).\n\n- **Server**: e.g. `SQLPROD01` or `SQLPROD01\\INSTANCE` or `server.database.windows.net` for Azure SQL.\n- **Database** (optional but recommended).\n- **Data connectivity mode**: **Import** (copy data; fastest visuals; needs refresh) or **DirectQuery** (live queries; source must be fast; some DAX/Power Query limits).\n- **Advanced options**: SQL statement (native query), Command timeout, Include relationship columns, Navigate using full hierarchy, Enable SQL Server Failover support.\n- **Credentials**: Windows, Database (SQL login), or Microsoft account (Entra ID for Azure SQL). Choose **Encrypt connection** when supported.\n\nThe Navigator shows tables and views; select them and click **Transform Data** to shape in Power Query.",
      syntax: "Source = Sql.Database ( \"SQLPROD01\", \"SalesDB\" )",
    },
    {
      heading: 'Query folding',
      content:
        "**Query folding** means Power Query translates your steps (filter, remove columns, group by, join) into one SQL query that runs on the database. The database does the heavy work and only the result travels to Power BI.\n\nCheck it: right-click a step in **Applied Steps**: if **View Native Query** is enabled, that step folds. Newer versions also show **step folding indicators** (a database icon next to each step).\n\nSteps that usually fold: remove/choose columns, filter rows, sort, group by, merge with another table from the same database, simple data type changes.\n\nSteps that often break folding: adding an Index column, complex custom M functions, changing types with locale, merging with a different source, some text transformations. Put non-foldable steps **at the end**.\n\nA hand-written SQL statement in Advanced options stops folding for later steps. To keep folding after a native query, use `Value.NativeQuery(..., [EnableFolding = true])`.",
      points: [
        'Folding matters most for large tables and for incremental refresh.',
        'In DirectQuery every step must fold; otherwise Power Query asks you to switch to Import.',
      ],
    },
    {
      heading: 'MySQL connector',
      content:
        "Path: **Get data > Database > MySQL database**.\n\n1. Install the **MySQL Connector/NET** (from Oracle/MySQL website) on the machine running Power BI Desktop, and on the gateway server for scheduled refresh. Without it Power BI shows a message that the required component is missing.\n2. Enter **Server** as `host:port`, e.g. `localhost:3306` or `mysql01.contoso.local:3306`, and the **Database** name.\n3. Choose **Database** authentication (MySQL username/password) or Windows if configured.\n4. Select tables in the Navigator and Transform Data.\n\nMySQL supports Import mode in Power BI Desktop; the connector supports query folding for common steps. For a cloud MySQL (Azure Database for MySQL) in a public endpoint no gateway is needed; for on-premises MySQL use a standard gateway.",
      syntax: "Source = MySQL.Database ( \"localhost:3306\", \"salesdb\", [ReturnSingleDatabase = true] )",
    },
    {
      heading: 'Parameters for Dev/Prod and reusable connections',
      content:
        "Hard-coding a server name means editing every query when you move from Dev to Prod. Instead:\n\n1. **Home > Manage parameters > New parameter**: Name `ServerName`, Type Text, Current value `SQLDEV01`. Repeat for `DatabaseName`.\n2. In each query's Source step replace the text with the parameter: `Sql.Database(ServerName, DatabaseName)`.\n3. After publishing, change parameter values in the Service: semantic model > Settings > **Parameters**, or use deployment pipeline rules.\n\nOther good practices: give queries friendly names (Sales, Product), disable load for staging queries (right-click > Enable load off), and keep one source query referenced by others.",
    },
  ],
  examples: [
    {
      title: 'Import the practice workbook from Excel',
      scenario: 'The practice data is in PracticeData.xlsx with formatted tables Sales, Product, Customer and Date.',
      table: {
        headers: ['Navigator item', 'Type', 'Load?'],
        rows: [
          ['Sales', 'Table', 'Yes'],
          ['Product', 'Table', 'Yes'],
          ['Customer', 'Table', 'Yes'],
          ['Date', 'Table', 'Yes'],
          ['Sheet1', 'Sheet', 'No (raw sheet)'],
        ],
      },
      steps: [
        'Home > Get data > Excel workbook > select PracticeData.xlsx > Open',
        'In Navigator tick Sales, Product, Customer, Date (table icons, not sheets)',
        'Click Transform Data; check data types (OrderDate = Date, amounts = Fixed decimal)',
        'Close & Apply; in Model view confirm the three 1-to-many relationships',
        'Table tools > Mark as date table on Date using Date[Date]',
      ],
      code: `let
    Source = Excel.Workbook ( File.Contents ( "C:\\PowerBI\\PracticeData.xlsx" ), null, true ),
    Sales_Table = Source{[Item = "Sales", Kind = "Table"]}[Data],
    Typed = Table.TransformColumnTypes (
        Sales_Table,
        {{"OrderDate", type date}, {"Quantity", Int64.Type},
         {"UnitPrice", Currency.Type}, {"SalesAmount", Currency.Type}, {"Cost", Currency.Type}}
    )
in
    Typed`,
      result: 'Four tables load with correct types; the model matches the shared practice model.',
      explanation: 'Kind = "Table" reads the formatted Excel table, which automatically includes new rows when the table grows.',
    },
    {
      title: 'Connect to SQL Server and check folding',
      scenario: 'Load only 2024 sales from SQLPROD01.SalesDB.dbo.Sales and confirm the filter runs in SQL.',
      table: {
        headers: ['Applied step', 'Folds?'],
        rows: [
          ['Source', 'Yes'],
          ['Navigation (dbo.Sales)', 'Yes'],
          ['Removed Other Columns', 'Yes'],
          ['Filtered Rows (Year = 2024)', 'Yes'],
          ['Added Index', 'No (place last or avoid)'],
        ],
      },
      steps: [
        'Home > SQL Server; Server SQLPROD01, Database SalesDB, Data connectivity mode Import > OK',
        'Credentials: Windows (or Database) > Connect',
        'Navigator: tick dbo.Sales > Transform Data',
        'Select OrderID, OrderDate, Year, Month, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost > Home > Remove Columns > Remove Other Columns',
        'Filter Year = 2024',
        'Right-click Filtered Rows > View Native Query to see the generated SELECT ... WHERE',
      ],
      code: `let
    Source = Sql.Database ( "SQLPROD01", "SalesDB" ),
    dbo_Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data],
    Kept = Table.SelectColumns ( dbo_Sales,
        {"OrderID", "OrderDate", "Year", "Month", "CustomerID", "ProductID",
         "Quantity", "UnitPrice", "SalesAmount", "Cost"} ),
    Filtered = Table.SelectRows ( Kept, each [Year] = 2024 )
in
    Filtered`,
      result: 'View Native Query shows a single SQL statement with a WHERE clause on Year = 2024; only 2024 rows are imported.',
      explanation: 'Column selection and row filters fold to SQL, reducing data transfer and refresh time.',
    },
    {
      title: 'Native SQL with folding still enabled',
      scenario: 'A DBA gives you a SQL query joining Sales and Product. You still want later filters to fold.',
      table: {
        headers: ['Category', 'SalesAmount (sample slice)'],
        rows: [
          ['Electronics', '1,50,000'],
          ['Accessories', '12,500'],
          ['Furniture', '24,000'],
        ],
      },
      steps: [
        'Home > Transform data > New Source > Blank Query',
        'Home > Advanced Editor; paste the code below > Done',
        'Approve the native database query prompt (Edit Permission > Run)',
        'Add a filter step on Category; right-click it > View Native Query is enabled',
      ],
      code: `let
    Source = Sql.Database ( "SQLPROD01", "SalesDB" ),
    Result = Value.NativeQuery (
        Source,
        "SELECT p.Category, SUM(s.SalesAmount) AS SalesAmount
         FROM dbo.Sales s
         JOIN dbo.Product p ON p.ProductID = s.ProductID
         GROUP BY p.Category",
        null,
        [EnableFolding = true]
    )
in
    Result`,
      result: 'A 3-row table by Category; later steps continue to fold into the SQL query.',
      explanation: 'Typing SQL in the Advanced options box disables folding for following steps; Value.NativeQuery with EnableFolding = true keeps it.',
    },
    {
      title: 'Connect to MySQL',
      scenario: 'The e-commerce team keeps orders in a MySQL database salesdb on mysql01:3306.',
      table: {
        headers: ['Field', 'Value'],
        rows: [
          ['Server', 'mysql01.contoso.local:3306'],
          ['Database', 'salesdb'],
          ['Authentication', 'Database (MySQL user report_reader)'],
          ['Driver', 'MySQL Connector/NET installed on PC and gateway'],
        ],
      },
      steps: [
        'Install MySQL Connector/NET on your PC (restart Power BI Desktop)',
        'Home > Get data > More > Database > MySQL database > Connect',
        'Server: mysql01.contoso.local:3306, Database: salesdb > OK',
        'Credentials: Database tab, user report_reader and password > Connect',
        'Navigator: tick salesdb.orders > Transform Data; rename the query to Sales',
        'For refresh in the Service, install the same connector on the gateway server and create a MySQL connection there',
      ],
      code: `let
    Source = MySQL.Database ( "mysql01.contoso.local:3306", "salesdb", [ReturnSingleDatabase = true] ),
    Orders = Source{[Schema = "salesdb", Item = "orders"]}[Data]
in
    Orders`,
      result: 'MySQL tables appear in Power Query and can be shaped like any other source.',
      explanation: 'The connector uses the Connector/NET provider; the gateway machine needs it too for scheduled refresh.',
    },
    {
      title: 'Switch Dev to Prod with parameters',
      scenario: 'Develop against SQLDEV01 and publish against SQLPROD01 without editing queries.',
      table: {
        headers: ['Parameter', 'Dev value', 'Prod value'],
        rows: [
          ['ServerName', 'SQLDEV01', 'SQLPROD01'],
          ['DatabaseName', 'SalesDB', 'SalesDB'],
        ],
      },
      steps: [
        'Home > Transform data > Manage parameters > New: ServerName, Text, Current value SQLDEV01; New: DatabaseName, Text, SalesDB > OK',
        'In each query Source step, replace the server and database text with the parameters (code below)',
        'Close & Apply and publish',
        'Service: semantic model > Settings > Parameters > ServerName = SQLPROD01 > Apply; map to the Prod gateway connection; Refresh now',
      ],
      code: `Source = Sql.Database ( ServerName, DatabaseName )`,
      result: 'The same .pbix works in both environments; only parameter values change.',
      explanation: 'Parameters are M values exposed to the Service and to deployment pipeline rules.',
    },
    {
      title: 'Excel PivotTable on the published semantic model',
      scenario: 'Finance prefers Excel but must use the same measures as the report.',
      table: {
        headers: ['Category', 'Total Sales', 'Profit'],
        rows: [
          ['Accessories', '12,500', '4,500'],
          ['Electronics', '1,50,000', '30,000'],
          ['Furniture', '24,000', '6,000'],
          ['Grand Total', '1,86,500', '40,500'],
        ],
      },
      steps: [
        'Make sure the user has Build permission on the semantic model',
        'Excel: Insert > PivotTable > From Power BI; choose the Sales semantic model (or Power BI report > Export > Analyze in Excel)',
        'In PivotTable Fields, drag Product > Category to Rows',
        'Drag the measures Total Sales and Profit to Values',
      ],
      result: 'The PivotTable shows the sample totals above and refreshes from the model; RLS applies to the Excel user.',
      explanation: 'Excel sends MDX/DAX queries to the semantic model; there is one source of truth for measures.',
    },
  ],
  interview: [
    {
      q: 'What is query folding and how do you check it?',
      a: 'Query folding is Power Query converting applied steps into a native source query (e.g. SQL) so the source does the work. Right-click a step > View Native Query (enabled = folds), or look at step folding indicators.',
      level: 'Medium',
    },
    {
      q: 'Import vs DirectQuery for a SQL Server source?',
      a: 'Import copies data into VertiPaq: fastest visuals, full DAX/Power Query, but needs refresh and has size limits. DirectQuery queries SQL live: near real-time and no size limit, but performance depends on the source and some features are limited.',
      level: 'Easy',
    },
    {
      q: 'What do you need to connect Power BI to MySQL?',
      a: 'The MySQL Connector/NET installed on the Desktop machine (and gateway server), server as host:port, database name, and database credentials. A gateway is required for on-premises MySQL refresh in the Service.',
      level: 'Medium',
    },
    {
      q: 'Why is it better to load Excel Tables than Sheets?',
      a: 'Tables have defined headers and boundaries and expand automatically with new rows; sheets may include blank rows, titles or notes and need extra cleaning steps.',
      level: 'Easy',
    },
    {
      q: 'Scenario: after writing a SQL statement in the SQL Server dialog, your later filters are slow. Why?',
      a: 'A native SQL statement entered in Advanced options prevents folding of subsequent steps, so filters run locally after importing everything. Use a view in the database, or Value.NativeQuery with EnableFolding = true, or build the logic with foldable Power Query steps.',
      level: 'Hard',
    },
    {
      q: 'How do you move a report from a Dev database to a Prod database?',
      a: 'Use Power Query parameters for server and database, then change them in the Service semantic model settings or via deployment pipeline parameter/data source rules. Map the Prod gateway connection.',
      level: 'Medium',
    },
    {
      q: 'How can an Excel user analyse a Power BI semantic model?',
      a: 'Using Analyze in Excel or Insert > PivotTable > From Power BI; the PivotTable is live-connected, uses model measures and RLS, and needs Build permission.',
      level: 'Easy',
    },
    {
      q: 'Which Power Query steps commonly break folding?',
      a: 'Index columns, custom M functions, some text/locale type changes, merges across different sources, Table.Buffer, and steps after a native query without EnableFolding.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Import an Excel workbook built with Power Query and Power Pivot into a new Power BI file.',
      hint: 'Not Get data: use File > Import.',
      solution: 'File > Import > Power Query, Power Pivot, Power View > select the workbook > Start > Close. Queries, model, relationships and measures are created.',
    },
    {
      task: 'Write M that connects to SQL Server using parameters and keeps only Electronics products from dbo.Product.',
      hint: 'Sql.Database with parameters, then Table.SelectRows.',
      solution: `let
    Source = Sql.Database ( ServerName, DatabaseName ),
    Product = Source{[Schema = "dbo", Item = "Product"]}[Data],
    Electronics = Table.SelectRows ( Product, each [Category] = "Electronics" )
in
    Electronics`,
    },
    {
      task: 'Add a step that breaks folding and observe View Native Query becoming disabled.',
      hint: 'Add column > Index column.',
      solution: 'After Add column > Index Column > From 1, right-click the step: View Native Query is greyed out. Move or remove the step to restore folding.',
    },
    {
      task: 'Write a SQL view that a DBA could create so Power BI loads a clean Sales table with Year and Month.',
      hint: 'Use YEAR() and DATENAME/MONTH in T-SQL.',
      solution: `CREATE VIEW dbo.vw_Sales AS
SELECT OrderID, CAST(OrderDate AS date) AS OrderDate,
       YEAR(OrderDate) AS [Year], LEFT(DATENAME(MONTH, OrderDate), 3) AS [Month],
       CustomerID, ProductID, Quantity, UnitPrice,
       Quantity * UnitPrice AS SalesAmount, Cost
FROM dbo.SalesRaw;`,
    },
    {
      task: 'Connect Excel to your published semantic model and recreate the category profit table.',
      hint: 'Insert > PivotTable > From Power BI.',
      solution: 'Select the semantic model, put Product[Category] in Rows, [Total Sales] and [Profit] in Values. Sample: Electronics 30,000, Furniture 6,000, Accessories 4,500 profit.',
    },
  ],
  quiz: [
    {
      question: 'Which M function connects to SQL Server?',
      options: ['Sql.Database', 'Excel.Workbook', 'MySQL.Database', 'Web.Contents'],
      answer: 0,
      explanation: 'Sql.Database(server, database).',
    },
    {
      question: 'What must be installed to use the MySQL connector?',
      options: ['ODBC for Excel', 'MySQL Connector/NET', 'SQL Server Management Studio', 'Python'],
      answer: 1,
      explanation: 'Power BI uses the MySQL Connector/NET provider.',
    },
    {
      question: 'If "View Native Query" is greyed out on a step, it means...',
      options: ['The query failed', 'The step does not fold', 'The data is DirectQuery', 'Credentials expired'],
      answer: 1,
      explanation: 'Disabled View Native Query indicates no folding at that step (with some connector exceptions).',
    },
    {
      question: 'Best way to switch from a Dev to a Prod server?',
      options: ['Edit each query manually', 'Power Query parameters', 'Copy the pbix', 'Use RLS'],
      answer: 1,
      explanation: 'Parameters centralise connection values and can be changed in the Service.',
    },
    {
      question: 'Analyze in Excel requires which permission?',
      options: ['Read only', 'Build', 'Admin', 'No permission'],
      answer: 1,
      explanation: 'It creates new content on the model.',
    },
  ],
};
