export default {
  id: 'extra-36-directquery',
  title: 'DirectQuery',
  module: 'Extra: Advanced & Administration',
  extraNo: 36,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'In DirectQuery mode Power BI stores no data copy: every visual sends a query to the source database at the moment the user looks at it. It is used for very large or near-real-time data, but it brings limits on transformations, DAX and performance that every developer must know.',
  objectives: [
    'Explain how DirectQuery works and how it differs from Import',
    'Connect to a relational source in DirectQuery mode and identify supported sources',
    'List the main limitations: Power Query folding, the 1 million row limit, DAX restrictions and source load',
    'Apply performance techniques such as query reduction, Dual dimensions, aggregations and good source indexing',
    'Decide when DirectQuery is the right choice and when Import or Direct Lake is better',
  ],
  theory: [
    {
      heading: 'How DirectQuery works',
      content:
        "In **Import** mode, Power BI copies data into its own compressed in-memory engine. In **DirectQuery** mode it stores only the **metadata** (table and column names, relationships, measures). When a user opens a page:\n\n1. Each visual generates a DAX query.\n2. The engine translates it into the source language (for example SQL).\n3. The source database runs the query and returns a small result.\n4. The visual draws the result.\n\nAnalogy: Import is like downloading a movie before the flight; DirectQuery is like streaming. Streaming is always the latest version but depends on the network and the server.",
      points: [
        'No scheduled data refresh is needed to see new rows; data is as fresh as the source',
        'The PBIX file stays tiny because it holds no data',
        'Every click (slicer, filter, cross-highlight) can send new queries to the source',
      ],
    },
    {
      heading: 'Supported sources and how to connect',
      content:
        "DirectQuery works with sources that can answer queries themselves: SQL Server, Azure SQL Database, Azure Synapse Analytics, Fabric Warehouse and Lakehouse SQL analytics endpoints, Snowflake, Databricks, Google BigQuery, Amazon Redshift, Oracle, SAP HANA, Teradata and others. File sources such as **Excel, CSV, JSON and SharePoint lists do not support DirectQuery**.\n\nTo connect: **Home > Get data > SQL Server** > enter Server and Database > choose **Data Connectivity mode: DirectQuery** > OK > select tables > **Load** (or **Transform Data**).\n\nThe status bar at the bottom right then shows **Storage Mode: DirectQuery (click to change)**.\n\nIn the Service, cloud sources need credentials in the semantic model settings, and on-premises sources need an **on-premises data gateway** with the data source configured.",
    },
    {
      heading: 'Power Query and modeling limitations',
      content:
        "Because every visual becomes a source query, all Power Query steps must be translated (**folded**) to the source. If a step cannot fold, Power BI shows: **This step results in a query that is not supported in DirectQuery mode**. Right-click a step > **View Native Query** to see the SQL that will be sent.\n\nOther limits:\n- **1 million row limit**: an intermediate result returned from the source for one query cannot exceed 1 million rows (higher limits exist on Premium/Fabric capacities through capacity settings). Visuals with very detailed data hit this error.\n- **Calculated columns** are limited to row-level expressions that can be pushed to the source; they cannot use aggregations or functions such as RELATED in a way the source cannot translate.\n- **Calculated tables** referencing DirectQuery tables are imported, not live.\n- The built-in **Auto date/time** hierarchy is not available; use a proper Date table.\n- Some DAX functions are slow or unsupported in DirectQuery calculated columns; measures generally work but complex iterators can generate heavy SQL.",
      tip: 'Do heavy cleaning in the source (views in SQL, or upstream in Fabric) rather than in Power Query when you plan to use DirectQuery.',
    },
    {
      heading: 'Performance in DirectQuery',
      content:
        "The speed of a DirectQuery report is mostly the speed of the source. Good practice:\n\n- **Fewer visuals per page**: each visual sends at least one query.\n- **Query reduction**: File > Options and settings > Options > Current file > **Query reduction** > add an **Apply** button to slicers and the filter pane, and turn off cross-highlighting by default if needed.\n- **Dual** storage mode for dimensions and **aggregations** for facts (composite model).\n- **Index** and optimise the source (columnstore indexes, partitioning, statistics).\n- **Maximum connections per data source**: Options > Current file > DirectQuery (default 10); higher values allow more parallel queries if the source can handle them.\n- Use **Performance Analyzer** (Optimize > Performance analyzer): it shows a separate **Direct query** time for each visual, and you can copy the query.",
    },
    {
      heading: 'Freshness: caching, automatic page refresh and hybrid tables',
      content:
        "In the Service, **dashboard tiles** built on DirectQuery are refreshed from a cache on a schedule (semantic model settings > **Refresh** > Query caching / tile refresh frequency). Report visuals query the source when opened.\n\n**Automatic page refresh** (click an empty area of the canvas > Format pane (Format page) > **Page refresh**) can re-query the source every few seconds or minutes, or when a **change detection** measure changes. Admins control the minimum interval; on Pro workspaces the minimum is 30 minutes, on Fabric/Premium capacities it can be much lower.\n\n**Hybrid tables** combine incremental refresh (historical partitions in Import) with a real-time DirectQuery partition for the latest data. They require Premium, PPU or a Fabric capacity.",
    },
    {
      heading: 'When to choose DirectQuery',
      content:
        "Choose DirectQuery when:\n- the data is too big to import within your licence or capacity limits,\n- the business needs near-real-time numbers (minutes, not hours),\n- data must not be copied out of the source for compliance reasons,\n- the source enforces its own security per user (with single sign-on).\n\nAvoid it when the source is slow or busy with transactions, when users need very fast, highly interactive reports, or when you need complex Power Query shaping. If the data is in Fabric OneLake, **Direct Lake** often gives Import-like speed without a copy.",
    },
  ],
  examples: [
    {
      title: 'Connect to SQL Server in DirectQuery mode',
      scenario:
        'The shared Sales, Product, Customer and Date tables live in a SQL Server database named RetailDW on server SQLPROD01. Build a live report.',
      steps: [
        'Home > Get data > SQL Server',
        'Server: SQLPROD01, Database: RetailDW; Data Connectivity mode: DirectQuery > OK',
        'Choose your authentication (Windows or Database) > Connect',
        'In Navigator tick Sales, Product, Customer and Date > Load',
        'Check the status bar: "Storage Mode: DirectQuery"',
        'Model view: confirm relationships Product[ProductID] -> Sales[ProductID], Customer[CustomerID] -> Sales[CustomerID], Date[Date] -> Sales[OrderDate]',
        'Modeling > New measure > Total Sales; add a card and a column chart by Category',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'Visuals show the current database values. Insert a new order row in SQL Server, click Home > Refresh in Power BI Desktop, and the card total increases without importing data.',
      explanation:
        'Only metadata is stored in the PBIX. Each refresh of the visuals sends a SQL query such as SELECT SUM(SalesAmount) ... GROUP BY Category to the server.',
    },
    {
      title: 'See the native query generated by Power Query',
      scenario:
        'You filtered Sales to Year 2024 and removed the Cost column in Power Query. Confirm that these steps fold into SQL.',
      steps: [
        'Home > Transform data',
        'Select the Sales query; in Applied Steps right-click the last step (Removed Columns)',
        'Choose View Native Query',
        'Read the SQL statement in the window',
        'Add a step that cannot fold (for example Add Column > Index Column) and notice the warning about DirectQuery',
        'Delete the index step and Close & Apply',
      ],
      code: `// Power Query (M) steps that fold
let
    Source = Sql.Database("SQLPROD01", "RetailDW"),
    Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data],
    Filtered = Table.SelectRows(Sales, each [Year] = 2024),
    RemovedCost = Table.RemoveColumns(Filtered, {"Cost"})
in
    RemovedCost`,
      result: 'The native query shows a SELECT of the remaining columns with WHERE [Year] = 2024. The index column step produces the message that the step is not supported in DirectQuery mode.',
      explanation:
        'Filters and column removal translate into SQL, so they work in DirectQuery. An index column needs Power Query to process rows itself, which DirectQuery cannot do.',
    },
    {
      title: 'Reduce queries with Apply buttons',
      scenario:
        'Users click 4 cities and 2 segments in slicers, and every click fires new queries, overloading the database.',
      steps: [
        'File > Options and settings > Options',
        'Current file > Query reduction',
        'Under Slicers select "Add a single Apply button to apply all slicer changes at once"',
        'Under Filters select "Add an Apply button to each basic filter"',
        'OK; then Insert > Buttons > Apply all slicers to place the button on the canvas',
        'Optimize > Performance analyzer > Start recording and compare the number of queries before and after',
      ],
      result: 'Changing several slicers sends one batch of queries only when the user clicks Apply, instead of one batch per click.',
      explanation:
        'Query reduction options delay query execution until the user has finished selecting, which is important when every interaction hits the source.',
    },
    {
      title: 'Spot the 1 million row limit',
      scenario:
        'A table visual shows Sales[OrderID] with SalesAmount and fails with "The resultset of a query to external data source has exceeded the maximum allowed size of 1000000 rows".',
      table: {
        headers: ['Design', 'Rows returned', 'Works?'],
        rows: [
          ['Table of every OrderID (3.2 million orders)', '3,200,000', 'No - limit error'],
          ['Same table with Year and City slicers applied', '45,000', 'Yes'],
          ['Matrix by Category and Month', '72', 'Yes'],
        ],
      },
      steps: [
        'Select the failing table visual',
        'Add a required filter: Filters pane > Filters on this page > Year = 2024',
        'Add a top-level slicer on Customer[City] and set it to single select',
        'Alternatively replace the detail table with a matrix by Category and Month and use drill through to the detail page',
      ],
      result: 'With filters applied the result is under 1 million rows and the visual renders.',
      explanation:
        'DirectQuery limits intermediate results from the source to 1 million rows by default. Summaries and filtered detail views stay well below it.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Import and DirectQuery?',
      a: 'Import copies data into the compressed in-memory engine and needs refresh; it is fastest. DirectQuery stores only metadata and queries the source at run time; it is always current but performance depends on the source and some features are limited.',
      level: 'Easy',
    },
    {
      q: 'Can you use DirectQuery with an Excel file?',
      a: 'No. DirectQuery needs a source that can execute queries, such as SQL Server, Snowflake or Databricks. File sources like Excel and CSV can only be imported.',
      level: 'Easy',
    },
    {
      q: 'What is the 1 million row limit in DirectQuery?',
      a: 'A single query to the source may not return more than 1 million rows as an intermediate result (by default). Very detailed visuals or measures that force row-level results exceed it; you fix it with filters, aggregation or better model design.',
      level: 'Medium',
    },
    {
      q: 'Why do some Power Query steps show an error in DirectQuery mode?',
      a: 'In DirectQuery every step must fold into the source query. Steps that need local row-by-row processing, such as adding an index column or some custom M functions, cannot fold, so they are not supported.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a DirectQuery report takes 20 seconds per page. List your tuning steps.',
      a: 'Use Performance Analyzer to find slow visuals and copy their queries; check source indexes and statistics; reduce visuals per page; enable query reduction; set dimensions to Dual; add an Import aggregation table; simplify measures; increase maximum connections if the source can handle it; consider Import or Direct Lake if real time is not essential.',
      level: 'Hard',
    },
    {
      q: 'Does a DirectQuery semantic model need a gateway?',
      a: 'Only if the source is on-premises or in a private network. Cloud sources such as Azure SQL or Snowflake connect directly from the Service with stored credentials or SSO.',
      level: 'Medium',
    },
    {
      q: 'What is a hybrid table?',
      a: 'A table with incremental refresh where older partitions are imported and the most recent partition is DirectQuery, giving fast history plus real-time current data. It requires Premium, PPU or a Fabric capacity.',
      level: 'Hard',
    },
    {
      q: 'Scenario: the business wants numbers updated every minute on a wall screen. How do you design it?',
      a: 'Use DirectQuery (or a hybrid table) with automatic page refresh on a Fabric or Premium capacity, optionally using change detection so visuals refresh only when a measure such as MAX(OrderID) changes. Keep the page light and the source indexed.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Connect to any SQL Server, Azure SQL or Fabric Warehouse sample in DirectQuery and locate the storage mode indicator.',
      hint: 'Look at the bottom-right status bar.',
      solution: 'The status bar shows "Storage Mode: DirectQuery (click to change)". Clicking it offers to switch all tables to Import.',
    },
    {
      task: 'In Power Query, apply a filter and a column removal, then view the native query.',
      hint: 'Right-click the last applied step.',
      solution: 'View Native Query displays a SQL SELECT with only the kept columns and a WHERE clause for the filter, proving the steps fold.',
    },
    {
      task: 'Turn on query reduction with a single Apply button for slicers and test it.',
      hint: 'File > Options and settings > Options > Current file > Query reduction.',
      solution: 'Slicer selections are highlighted but not applied until you click the Apply button; Performance Analyzer shows one refresh after the click.',
    },
    {
      task: 'Write a measure Avg Order Value = DIVIDE(SUM(Sales[SalesAmount]), DISTINCTCOUNT(Sales[OrderID])) and check its Direct query time in Performance Analyzer.',
      hint: 'Put it in a card and refresh visuals while recording.',
      solution: 'The card shows a Direct query time entry; DISTINCTCOUNT becomes COUNT(DISTINCT OrderID) in the SQL sent to the source.',
    },
  ],
  quiz: [
    {
      question: 'Which source supports DirectQuery?',
      options: ['CSV file', 'Excel workbook', 'Azure SQL Database', 'JSON file'],
      answer: 2,
      explanation: 'Relational databases that can run queries support DirectQuery; files must be imported.',
    },
    {
      question: 'What does a DirectQuery PBIX file contain?',
      options: ['A full compressed copy of the data', 'Only metadata such as tables, relationships and measures', 'A CSV extract', 'Only the report pages'],
      answer: 1,
      explanation: 'No data is cached; queries are sent to the source at run time.',
    },
    {
      question: 'What is the default row limit for an intermediate DirectQuery result?',
      options: ['10,000', '100,000', '1,000,000', 'No limit'],
      answer: 2,
      explanation: 'Queries returning more than 1 million rows fail by default.',
    },
    {
      question: 'Which option reduces the number of queries sent while users change slicers?',
      options: ['Auto date/time', 'Query reduction Apply button', 'Mark as date table', 'Sync slicers'],
      answer: 1,
      explanation: 'The Apply button delays queries until the user confirms the selection.',
    },
    {
      question: 'Which right-click option in Power Query shows the SQL that will be sent?',
      options: ['Properties', 'View Native Query', 'Advanced Editor', 'Enable load'],
      answer: 1,
      explanation: 'View Native Query shows the folded query for that step.',
    },
  ],
};
