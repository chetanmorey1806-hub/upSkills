export default {
  id: 'get-data-connectivity',
  title: 'Getting Data & Connectivity Modes',
  level: 'Beginner',
  day: 2,
  duration: '2.5 hours',
  summary:
    'Connect Power BI to files, databases and online services, and choose the right storage mode (Import, DirectQuery, Live Connection, Composite/Dual, Direct Lake). Storage mode decides performance, freshness, model size and which features are available.',
  objectives: [
    'Connect to common sources: Excel, CSV, folder, SQL Server, SharePoint, Web, OData',
    'Explain Import, DirectQuery, Live Connection and Composite models with pros and cons',
    'Choose a storage mode for a business scenario and justify it',
    'Understand Dual storage mode and aggregations at a high level',
    'Describe query folding and why it matters for performance',
    'Use parameters to switch data sources (Dev/Test/Prod)',
  ],
  theory: [
    {
      heading: 'Data source categories',
      content:
        `Power BI ships with hundreds of connectors, grouped in the Get Data dialog:\n\n- **File**: Excel workbook, Text/CSV, XML, JSON, PDF, Parquet, Folder, SharePoint folder.\n- **Database**: SQL Server, Azure SQL, Oracle, MySQL, PostgreSQL, Snowflake, Google BigQuery, Amazon Redshift, Teradata, SAP HANA.\n- **Power Platform / Fabric**: Power BI semantic models, Dataflows, Dataverse, Lakehouse, Warehouse.\n- **Azure**: Azure Data Lake Storage Gen2, Azure Synapse, Azure Analysis Services, Databricks.\n- **Online services**: SharePoint Online List, Salesforce, Dynamics 365, Google Analytics, Microsoft Exchange.\n- **Other**: Web (HTML pages and APIs), OData feed, ODBC, OLE DB, R and Python scripts, Blank Query.\n\nWhen you connect, the **Navigator** shows available tables/sheets with a preview. You can **Load** directly or **Transform Data** to open Power Query first (recommended).`,
      tip: 'For files on SharePoint/OneDrive, connect with the SharePoint Folder or Web connector using the file URL – then the Service can refresh WITHOUT a gateway. A path like C:\\Users\\... needs a gateway.',
    },
    {
      heading: 'Import mode',
      content:
        `In **Import** mode, Power Query loads a copy of the data into the model, compressed by the **VertiPaq** in-memory columnar engine. Visuals query this in-memory copy, so they are extremely fast.\n\nData is only as fresh as the last refresh (manual in Desktop, scheduled in the Service: 8/day on Pro, 48/day on Premium/PPU, or more with the API).`,
      points: [
        '**Pros**: fastest query performance, full DAX and Power Query functionality, can combine any sources, works offline in Desktop.',
        '**Cons**: data latency (refresh needed), model size limits (1 GB per model on Pro, larger on Premium), refresh time and memory usage, duplicate copy of data.',
        'Default and recommended mode for most scenarios.',
      ],
      tip: 'VertiPaq compression ratios of 10x are common, so a 5 GB CSV may become a 500 MB model, especially if you remove unused high-cardinality columns.',
    },
    {
      heading: 'DirectQuery mode',
      content:
        `In **DirectQuery**, no data is imported. Only metadata (table and column definitions) is stored. Every time a user interacts with a visual, Power BI translates the DAX query into native SQL and sends it to the source.\n\nUse it when data is too big to import, when near real-time data is required, or when data must stay in the source for compliance reasons.`,
      points: [
        '**Pros**: near real-time data, no model size limit in Power BI, no import refresh needed, source security can be used (SSO).',
        '**Cons**: slower visuals (depends on source performance), more load on the source database, some DAX functions and Power Query transformations are limited, 1 million row limit on intermediate results returned to Power BI, Table view not available.',
        'Every visual on a page sends at least one query; a page with 15 visuals = 15+ queries to the source.',
        'Supported only for sources that can be queried (SQL Server, Azure SQL, Synapse, Snowflake, Databricks, Oracle…), not for Excel/CSV.',
      ],
      tip: 'In DirectQuery, keep Power Query transformations foldable. Steps that cannot be translated to SQL raise the error "This step results in a query that is not supported in DirectQuery mode".',
    },
    {
      heading: 'Live Connection',
      content:
        `**Live Connection** connects a report to an existing **Analysis Services** model (SSAS Tabular/Multidimensional, Azure Analysis Services) or to a **published Power BI semantic model**. The report contains no model of its own — all tables, relationships and measures come from the remote model.\n\nThis is the pattern for **shared/golden semantic models**: one team owns the model, many report authors build thin reports on top of it.`,
      points: [
        'You cannot use Power Query or add tables in a pure live connection.',
        'You CAN create **report-level measures** (measures stored in the report, not the model).',
        'Security (RLS) is enforced by the remote model.',
        'To add your own tables you convert it into a **composite model** ("Make changes to this model" → DirectQuery for Power BI semantic models and Analysis Services).',
      ],
    },
    {
      heading: 'Composite models and Dual storage mode',
      content:
        `A **composite model** mixes storage modes in one model – e.g., a large Sales fact in DirectQuery and small dimension tables in Import, or a published semantic model extended with a local Excel table.\n\nEach table has a **Storage mode** property (Model view → Properties → Advanced): **Import**, **DirectQuery** or **Dual**.\n\n**Dual** tables are both imported and queryable via DirectQuery. The engine decides per query: when the query involves only Import/Dual tables, it uses the cached copy; when it joins with a DirectQuery fact, it sends the dimension filter to the source as part of the SQL query. Setting dimension tables to Dual avoids slow "limited" relationships between Import and DirectQuery tables.\n\n**Aggregations**: you can import a small summarized table (e.g., Sales by Date and Product) and map it to the large DirectQuery fact. Queries at the aggregated grain hit the fast in-memory table; detailed queries go to the source.`,
      points: [
        'Relationships between tables from different source groups are **limited relationships** (shown with a broken line) and behave like inner joins with some restrictions.',
        'Use Dual for shared dimensions in DirectQuery + aggregation scenarios.',
        'Changing a table from DirectQuery/Dual to Import is allowed; changing Import back to DirectQuery is NOT allowed.',
      ],
    },
    {
      heading: 'Direct Lake (Microsoft Fabric)',
      content:
        `**Direct Lake** is a Fabric-only storage mode. The semantic model reads Delta Parquet files in **OneLake** (Lakehouse or Warehouse tables) directly into memory on demand – no import copy and no SQL translation.\n\nIt offers performance close to Import with freshness close to DirectQuery. If a query cannot be served in Direct Lake (e.g., model guardrails exceeded or SQL views used), it can **fall back** to DirectQuery through the SQL analytics endpoint.`,
    },
    {
      heading: 'Choosing a storage mode – decision guide',
      content:
        `Ask these questions in order:`,
      points: [
        '1. Is there already a certified shared model? → **Live Connection** to it (do not rebuild).',
        '2. Does data fit in memory and is hourly/daily latency acceptable? → **Import** (default, best performance).',
        '3. Is data too large or must be real-time, and is the source fast (columnstore, Synapse, Databricks)? → **DirectQuery**.',
        '4. Need both speed and detail on a huge fact? → **Composite**: aggregations in Import, detail in DirectQuery, dimensions as Dual.',
        '5. Data already in Fabric OneLake as Delta tables? → **Direct Lake**.',
      ],
      tip: 'Interview answer pattern: state the mode, then justify with data volume, latency, source capability, and feature needs.',
    },
    {
      heading: 'Query folding (introduction)',
      content:
        `**Query folding** is Power Query's ability to translate transformation steps into a single native query (usually SQL) executed by the source. For example, Filter rows + Remove columns + Group by on a SQL Server table becomes \`SELECT ... WHERE ... GROUP BY ...\`.\n\nWhy it matters: the database does the heavy work, less data travels over the network, refresh is faster, and **incremental refresh** and **DirectQuery** depend on it.\n\nHow to check: right-click a step → **View Native Query** (enabled = folded), or look at the **step folding indicators** in Power Query Online / Desktop. Steps such as adding an Index column, certain custom M functions, or merging data from two different sources usually break folding. Once folding breaks, all following steps run locally in the mashup engine.`,
      tip: 'Do foldable steps (filters, column removal, joins on the same database) first, and non-foldable steps last.',
    },
    {
      heading: 'Parameters for data sources',
      content:
        `Hard-coding server names makes moving between environments painful. Create **parameters** (Home → Manage Parameters → New Parameter), e.g. \`ServerName\` and \`DatabaseName\`, then reference them in the Source step.\n\nIn the Service you can change parameter values under semantic model **Settings → Parameters**, and **deployment pipelines** can apply rules to switch parameters from Dev to Test to Prod. Parameters are also required for **incremental refresh** (\`RangeStart\` and \`RangeEnd\`, type Date/Time).`,
      syntax: `let
    Source = Sql.Database(ServerName, DatabaseName),
    Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data]
in
    Sales`,
    },
  ],
  examples: [
    {
      title: 'Connect to SQL Server with parameters',
      scenario: 'The Sales table lives in SQL Server. Dev and Prod servers differ, so we parameterize the connection.',
      code: `// Parameters created via Manage Parameters:
// ServerName  (Text) = "sql-dev.contoso.local"
// DatabaseName (Text) = "SalesDW"

let
    Source = Sql.Database(ServerName, DatabaseName),
    dbo_Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data],
    KeepColumns = Table.SelectColumns(
        dbo_Sales,
        {"OrderID", "OrderDate", "CustomerID", "ProductID", "Quantity", "UnitPrice", "SalesAmount", "Cost"}
    ),
    Filtered = Table.SelectRows(KeepColumns, each [OrderDate] >= #date(2022, 1, 1))
in
    Filtered`,
      explanation:
        'Sql.Database uses the parameters, so switching to Prod only requires changing the parameter value. Selecting columns and filtering rows both fold to SQL (SELECT col list ... WHERE OrderDate >= ...). Right-click the Filtered step → View Native Query to confirm.',
    },
    {
      title: 'Connect to an Excel file on SharePoint (no gateway needed)',
      scenario: 'The Product list is maintained in an Excel file on SharePoint Online.',
      code: `let
    Source = Excel.Workbook(
        Web.Contents("https://contoso.sharepoint.com/sites/Sales/Shared Documents/Product.xlsx"),
        null,
        true
    ),
    ProductSheet = Source{[Item = "Product", Kind = "Sheet"]}[Data],
    Promoted = Table.PromoteHeaders(ProductSheet, [PromoteAllScalars = true]),
    Typed = Table.TransformColumnTypes(
        Promoted,
        {{"ProductID", type text}, {"ProductName", type text}, {"Category", type text}, {"Subcategory", type text}, {"Brand", type text}}
    )
in
    Typed`,
      explanation:
        'Excel.Workbook reads the binary returned by Web.Contents. Because the file is in the cloud, the Power BI Service can refresh it directly with OAuth credentials – no gateway. The third argument true uses the first row as headers where possible; we still promote headers explicitly for sheets.',
    },
    {
      title: 'Choosing storage modes for a composite model',
      scenario: 'Sales has 2 billion rows in Azure Synapse and must be near real-time; Product, Customer and Date are small.',
      table: {
        headers: ['Table', 'Rows', 'Storage mode', 'Reason'],
        rows: [
          ['Sales', '2,000,000,000', 'DirectQuery', 'Too large to import; real-time'],
          ['Sales_Agg (by Date, Product)', '3,000,000', 'Import', 'Aggregation table for fast summary visuals'],
          ['Product', '5,000', 'Dual', 'Used with both Import agg and DirectQuery fact'],
          ['Customer', '200,000', 'Dual', 'Same reason'],
          ['Date', '3,650', 'Dual', 'Same reason'],
        ],
      },
      code: `Model view → select table → Properties → Advanced → Storage mode
Sales_Agg → Manage aggregations:
  SumSalesAmount  → Sum  → Sales[SalesAmount]
  OrderDate       → GroupBy → Sales[OrderDate]
  ProductID       → GroupBy → Sales[ProductID]`,
      explanation:
        'Summary visuals (sales by month and category) are answered by the in-memory Sales_Agg. Drilling to individual orders or customers falls back to DirectQuery on Sales. Dual dimensions avoid limited relationships and let the engine choose the cheapest path.',
    },
    {
      title: 'Live Connection with report-level measure',
      scenario: 'The BI team published a certified "Sales Model". You need an extra measure only for your report.',
      code: `// Home → Get Data → Power BI semantic models → Sales Model → Connect
// Then Home → New measure (stored in the report, not the shared model):

Avg Sales per Order =
DIVIDE ( [Total Sales], DISTINCTCOUNT ( Sales[OrderID] ) )`,
      explanation:
        'With a live connection you cannot change the model or use Power Query, but report-level measures are allowed. If the measure is useful to everyone, ask the model owner to add it to the shared model instead.',
    },
    {
      title: 'Incremental refresh parameters',
      scenario: 'Refresh only the last 3 days of a 5-year Sales table instead of the whole history.',
      code: `// Create parameters RangeStart and RangeEnd (type Date/Time) – names are case-sensitive
let
    Source = Sql.Database(ServerName, DatabaseName),
    dbo_Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data],
    FilteredRange = Table.SelectRows(
        dbo_Sales,
        each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd
    )
in
    FilteredRange
// Then: Sales table → Incremental refresh → Archive 5 years, Refresh last 3 days`,
      explanation:
        'Use >= on one boundary and < on the other to avoid duplicate rows at partition edges. The filter must fold to the source so each partition queries only its date range. OrderDate should be datetime (or convert with a function that still folds).',
    },
  ],
  interview: [
    {
      q: 'What are the storage/connectivity modes in Power BI?',
      a: `- **Import** – data copied into VertiPaq in-memory, fastest, needs refresh.\n- **DirectQuery** – queries sent to the source at runtime, near real-time, slower.\n- **Live Connection** – connects to an Analysis Services model or a published Power BI semantic model; no local model.\n- **Composite** – mixes Import and DirectQuery tables (and Dual).\n- **Dual** – table-level setting that can act as Import or DirectQuery depending on the query.\n- **Direct Lake** – Fabric mode reading Delta tables in OneLake directly.`,
      level: 'Easy',
    },
    {
      q: 'Import vs DirectQuery – what are the pros and cons of each and when do you choose them?',
      a: `**Import**: + fastest, full DAX/M, any source, offline; − refresh latency, model size limits, memory.\n\n**DirectQuery**: + near real-time, no size limit, data stays in source; − slower and depends on source performance, load on source, limited M/DAX, 1M-row result limit, no Table view.\n\nChoose Import by default. Choose DirectQuery when data is too large to import or real-time freshness is mandatory AND the source is fast (indexed/columnstore). Consider composite with aggregations to get both.`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between DirectQuery and Live Connection?',
      a: `**DirectQuery** connects to a relational source (SQL, Snowflake…). You still build your own model in Power BI: relationships, measures, calculated columns (with limits), Power Query steps that fold.\n\n**Live Connection** connects to a ready-made **analytical model** (SSAS, AAS, Power BI semantic model). The model is defined elsewhere; you cannot add tables or use Power Query — only report-level measures. Queries are DAX/MDX against the model, not SQL.`,
      level: 'Medium',
    },
    {
      q: 'What is Dual storage mode and why would you use it?',
      a: `A Dual table is stored in memory AND can be queried via DirectQuery. The engine chooses per query. Typically used for dimension tables in a composite model that relate to both an Import aggregation table and a DirectQuery fact table.\n\nBenefits: slicers and visuals using only the dimension are fast (cache), and when combined with the DirectQuery fact the dimension can be joined at the source, avoiding limited relationships and large filter lists in SQL.`,
      level: 'Hard',
    },
    {
      q: 'What is query folding and how do you check it?',
      a: `Query folding is when Power Query translates applied steps into a native source query (e.g., SQL), so the source does the processing.\n\nCheck by right-clicking a step → **View Native Query** (greyed out usually means not folded, though some connectors fold without showing it), or use step folding indicators and **Query Diagnostics**.\n\nSteps that typically fold: filter rows, remove/select columns, rename, group by, joins within the same source, sort. Typically break folding: Index column, some text transformations, merging different sources, custom M functions, Table.Buffer. Order foldable steps first.`,
      level: 'Medium',
    },
    {
      q: 'What limitations does DirectQuery have?',
      a: `- Performance depends on the source; each visual sends queries.\n- 1,000,000 row limit for intermediate results returned from the source (can fail with large detail tables).\n- Power Query transformations must fold; complex steps not allowed.\n- Some DAX functions are not supported or perform poorly in calculated columns (e.g., time intelligence on DirectQuery is fine in measures but heavy); calculated columns are limited to row-level expressions that can be translated.\n- No Table view; no auto date/time table.\n- Quick insights and some AI features unavailable.\n- Refresh of visuals uses cache with automatic page refresh options; dashboards tiles refresh on schedule.`,
      level: 'Hard',
    },
    {
      q: 'Do you need a gateway for cloud sources? For an Excel file on a local drive?',
      a: `Cloud sources reachable from the internet (Azure SQL, SharePoint Online, OneDrive, Salesforce) do NOT need a gateway – the Service connects directly.\n\nA file on a local or network drive (C:\\ or \\\\server\\share) or an on-premises database DOES need an on-premises data gateway for scheduled refresh. Best practice is to store files on SharePoint/OneDrive to avoid the gateway.`,
      level: 'Easy',
    },
    {
      q: 'What is a composite model? Give an example.',
      a: `A composite model combines tables with different storage modes or from different source groups in one model.\n\nExample 1: a huge Sales fact in DirectQuery on Synapse, an Import aggregation table, and Dual dimensions.\n\nExample 2: connecting to a published certified semantic model (DirectQuery for Power BI semantic models) and adding a local Excel table with sales targets, then relating Targets to the remote Date and Product tables.\n\nRelationships between different source groups are limited relationships.`,
      level: 'Medium',
    },
    {
      q: 'What are aggregations in Power BI?',
      a: `Aggregations are pre-summarized tables (usually Import) mapped to a detailed (usually DirectQuery) fact through **Manage aggregations**. When a query can be answered at the aggregated grain (e.g., Sales by Month and Category), the engine uses the small in-memory table transparently; otherwise it falls through to the detail table.\n\nThey give Import-like speed on very large data. Users and DAX authors write measures only against the detail table – the redirect is automatic. Hide the aggregation table.`,
      level: 'Hard',
    },
    {
      q: 'How do you parameterize a data source and why?',
      a: `Create parameters (Manage Parameters) such as ServerName and DatabaseName and use them in the Source step: \`Sql.Database(ServerName, DatabaseName)\`.\n\nWhy: easily switch between Dev/Test/Prod, change values in the Service without editing the file, deployment pipeline rules can swap them, and templates (.pbit) prompt for values. Parameters RangeStart/RangeEnd also power incremental refresh.`,
      level: 'Medium',
    },
    {
      q: 'What is Direct Lake mode?',
      a: `A Fabric storage mode where the semantic model loads column data straight from Delta Parquet files in OneLake into memory on demand. No import refresh copy is needed (a lightweight "framing" operation points the model to the latest Delta version) and no SQL translation is used.\n\nIt combines Import-like performance with DirectQuery-like freshness. Limits: tables must be Delta tables in Lakehouse/Warehouse; capacity guardrails apply; if they are exceeded or views are used, queries can fall back to DirectQuery (unless fallback is disabled).`,
      level: 'Hard',
    },
    {
      q: 'Your Import model refresh takes 2 hours. How would you reduce it?',
      a: `- Remove unused columns and rows at the source (fewer, narrower tables).\n- Ensure query folding so filters run in the database.\n- Use **incremental refresh** to refresh only recent partitions.\n- Avoid high-cardinality columns (e.g., datetime with seconds → split into date and time; remove GUIDs not needed).\n- Push complex transformations upstream (SQL views, dataflows, Fabric).\n- Reduce calculated columns (move to Power Query or source).\n- Disable Auto date/time.\n- Check gateway machine resources and parallel loading settings.`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'For each scenario choose a storage mode and justify: (a) 50,000-row Excel budget file updated monthly; (b) 3-billion-row IoT table that must show data from the last minute; (c) Company already has a certified Sales semantic model; (d) 800M-row sales table where 90% of visuals show monthly totals.',
      hint: 'Think volume, latency, reuse.',
      solution:
        '(a) Import – small, low change frequency. (b) DirectQuery (or Fabric Real-Time / Direct Lake) – too big and needs real-time; ensure the source is optimized. (c) Live Connection to the certified model – reuse, single version of truth. (d) Composite: DirectQuery detail + Import aggregation table at month/product grain, dimensions in Dual.',
    },
    {
      task: 'Write the M code to connect to SQL Server using parameters ServerName and DatabaseName, read dbo.Customer and keep only CustomerID, CustomerName, City, Country, Segment.',
      hint: 'Sql.Database + navigation + Table.SelectColumns.',
      solution: `let
    Source = Sql.Database(ServerName, DatabaseName),
    dbo_Customer = Source{[Schema = "dbo", Item = "Customer"]}[Data],
    Kept = Table.SelectColumns(dbo_Customer, {"CustomerID", "CustomerName", "City", "Country", "Segment"})
in
    Kept`,
    },
    {
      task: 'Check whether the steps of your Sales query fold. Add an Index column at the end and check again. What changes?',
      hint: 'Right-click the step → View Native Query.',
      solution:
        'Before adding the Index column, View Native Query is enabled on the last step and shows a SELECT statement with your filters. After Add Column → Index Column, View Native Query becomes greyed out on that step: folding is broken because SQL Server connector cannot translate the index. Move such steps to the end or create the index in the source/view.',
    },
    {
      task: 'Configure incremental refresh for Sales: store 3 years, refresh last 7 days.',
      hint: 'You need two parameters with exact names.',
      solution: `1. Manage Parameters → New: RangeStart (Date/Time, e.g. 1/1/2024 00:00), RangeEnd (Date/Time, e.g. 1/2/2024 00:00).
2. In the Sales query add filter step:
   Table.SelectRows(dbo_Sales, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)
3. Close & Apply. In Table view / Data pane → right-click Sales → Incremental refresh.
4. Archive data starting 3 Years before refresh date; Incrementally refresh data starting 7 Days before refresh date.
5. Publish; the Service creates partitions on first refresh.`,
    },
    {
      task: 'Change the Product table storage mode to Dual. Where is the setting and what restriction exists when changing modes?',
      hint: 'Model view properties.',
      solution:
        'Model view → select Product → Properties pane → Advanced → Storage mode → Dual. Restriction: a table that is Import cannot be switched back to DirectQuery or Dual; you can go DirectQuery → Dual → Import, but not Import → DirectQuery/Dual. Dual is only meaningful when the table source supports DirectQuery.',
    },
    {
      task: 'You connected live to a published semantic model and need to add a Targets Excel table. How?',
      hint: 'Convert to a composite model.',
      solution:
        'In Desktop, on the status bar/Modeling ribbon click "Make changes to this model" (DirectQuery for Power BI semantic models – must be allowed by the tenant). This converts the live connection into a composite model. Then Get Data → Excel → Targets, load it, and create relationships (e.g. Targets[ProductID] → Product[ProductID]). These are limited relationships because they cross source groups.',
    },
  ],
  quiz: [
    {
      question: 'Which storage mode gives the fastest query performance in most cases?',
      options: ['DirectQuery', 'Import', 'Live Connection', 'All are equal'],
      answer: 1,
      explanation: 'Import stores compressed data in memory (VertiPaq), which is fastest for queries.',
    },
    {
      question: 'In a Live Connection to a published semantic model, what CAN you do?',
      options: ['Add Power Query steps', 'Import another table without conversion', 'Create report-level measures', 'Edit relationships'],
      answer: 2,
      explanation: 'Live connection reports can only add report-level measures; model changes require converting to a composite model.',
    },
    {
      question: 'What does Dual storage mode mean?',
      options: [
        'The table is stored twice in the same model for redundancy',
        'The table can act as Import or DirectQuery depending on the query',
        'The table refreshes twice a day',
        'The table is shared by two reports',
      ],
      answer: 1,
      explanation: 'Dual tables are cached but can also participate in DirectQuery queries at the source.',
    },
    {
      question: 'Which step usually BREAKS query folding against SQL Server?',
      options: ['Filter rows', 'Remove columns', 'Add Index column', 'Rename column'],
      answer: 2,
      explanation: 'Index columns cannot be translated to SQL by the connector, so folding stops there.',
    },
    {
      question: 'Which parameter names are required for incremental refresh?',
      options: ['StartDate and EndDate', 'RangeStart and RangeEnd', 'FromDate and ToDate', 'Any names you choose'],
      answer: 1,
      explanation: 'Power BI looks specifically for Date/Time parameters named RangeStart and RangeEnd (case-sensitive).',
    },
    {
      question: 'Which scenario needs an on-premises data gateway for scheduled refresh?',
      options: [
        'Excel file stored on SharePoint Online',
        'Azure SQL Database',
        'SQL Server on a server in the company data center',
        'Salesforce',
      ],
      answer: 2,
      explanation: 'On-premises sources are not reachable from the cloud without a gateway.',
    },
  ],
};
