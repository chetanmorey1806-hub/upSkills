export default {
  id: 'extra-38-direct-lake-concepts',
  title: 'Direct Lake Concepts',
  module: 'Extra: Advanced & Administration',
  extraNo: 38,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Direct Lake is a Microsoft Fabric storage mode in which a semantic model reads Delta tables stored in OneLake straight into memory, without importing a copy and without sending SQL queries for every visual. It aims to give Import-like speed with DirectQuery-like freshness for large data already in a Fabric lakehouse or warehouse.',
  objectives: [
    'Explain where Direct Lake fits next to Import and DirectQuery',
    'Describe OneLake, Delta Parquet tables, framing and transcoding in simple terms',
    'Compare the two flavours: Direct Lake on OneLake and Direct Lake on SQL endpoints, including DirectQuery fallback',
    'Create a Direct Lake semantic model from a Fabric lakehouse and from Power BI Desktop',
    'List requirements, guardrails and modeling limitations, and how to prepare tables for good performance',
  ],
  theory: [
    {
      heading: 'The problem Direct Lake solves',
      content:
        "Before Fabric you had to choose:\n- **Import**: very fast, but a full copy of the data and refresh windows that grow with data size.\n- **DirectQuery**: no copy and fresh, but every visual becomes a query to a database, so it is slower.\n\nIn **Microsoft Fabric**, data engineering tools (pipelines, Dataflow Gen2, notebooks) already write data into **OneLake** as **Delta tables** (open Parquet files plus a transaction log). The Parquet files are already columnar and compressed, very similar to how VertiPaq stores data.\n\n**Direct Lake** lets the Power BI engine load those Parquet column files **directly into memory** when they are needed. No duplicate import, no SQL translation per visual.\n\nAnalogy: Import is photocopying the book, DirectQuery is phoning the librarian for every question, Direct Lake is having the library shelf right next to your desk and pulling only the pages you need.",
    },
    {
      heading: 'Key terms: OneLake, Delta, framing, transcoding',
      content:
        "- **OneLake**: the single data lake that comes with every Fabric tenant; lakehouses and warehouses store their tables there.\n- **Delta table**: a folder of Parquet files plus a `_delta_log` that records versions of the table.\n- **Framing**: the Direct Lake equivalent of refresh. It does not copy data; it only updates the model metadata to point to the **latest version** of each Delta table. It usually takes seconds. By default the setting **Keep your Direct Lake data up to date** (semantic model Settings > Refresh) frames the model automatically when the Delta tables change; you can also schedule refresh or click Refresh now.\n- **Transcoding / paging in**: when a query needs a column, the engine loads that column from Parquet into memory (columns not used are never loaded). The first query after framing can be a little slower (cold cache); later queries are as fast as Import (warm cache).\n- **Eviction**: under memory pressure, rarely used columns are removed from memory and reloaded when needed.",
    },
    {
      heading: 'Two flavours: Direct Lake on OneLake vs on SQL endpoints',
      content:
        "**Direct Lake on SQL endpoints** (the original flavour): the model connects through the SQL analytics endpoint of a lakehouse or warehouse. If a query cannot be answered in Direct Lake (for example the table is a SQL **view**, SQL-level security is involved, or a **guardrail** is exceeded) it can **fall back to DirectQuery** through the SQL endpoint. The model property **Direct Lake behavior** controls this: **Automatic** (fallback allowed), **Direct Lake only** (no fallback, query errors instead) or **DirectQuery only**.\n\n**Direct Lake on OneLake** (newer flavour): reads Delta tables directly from OneLake, can combine tables from **several** Fabric items in one model, and **never falls back** to DirectQuery. It respects OneLake security. It is the flavour created when you connect from Power BI Desktop through the OneLake catalog.",
      points: [
        'Fallback means slower DirectQuery performance, so monitor it with Performance Analyzer or DAX Studio',
        'SQL views are only usable with the SQL endpoint flavour (and always via fallback)',
        'Check the current Microsoft Learn Direct Lake overview for the latest feature status, as both flavours are actively evolving',
      ],
    },
    {
      heading: 'Requirements and guardrails',
      content:
        "- Direct Lake needs the semantic model in a workspace on a **Fabric capacity (F SKU)**, a legacy Power BI Premium P capacity, or a Fabric trial capacity. It is **not** available in Pro-only or PPU-only workspaces.\n- Data must be in **Delta tables** in OneLake (lakehouse tables, warehouse tables, mirrored databases, or shortcuts that expose Delta tables).\n- **Guardrails** depend on the capacity SKU: maximum rows per table, maximum number of Parquet files and row groups per table, and maximum memory per model. Bigger SKUs allow bigger tables. When exceeded, the SQL-endpoint flavour falls back to DirectQuery, the OneLake flavour returns an error.\n- Report viewers on F64 or larger can view without a Pro licence; on smaller F SKUs viewers need Pro or PPU, just like other Power BI content.",
      tip: 'Keep Delta tables healthy: run table maintenance (OPTIMIZE to merge small files, V-Order enabled) so there are fewer, larger Parquet files and row groups. This improves both transcoding speed and guardrail headroom.',
    },
    {
      heading: 'Modeling differences you must know',
      content:
        "- **No Power Query** inside a Direct Lake model: all cleaning happens upstream (Dataflow Gen2, notebooks, pipelines, warehouse SQL).\n- **Calculated columns and calculated tables** that reference Direct Lake tables are restricted; create the column in the Delta table instead. **Measures** work normally.\n- Relationships, hierarchies, measures, RLS and OLS, calculation groups and field parameters are supported.\n- You can edit the model in the browser (open the semantic model > **Open data model**) or in Power BI Desktop with **live editing** of the Direct Lake model in the workspace. Reports built on it connect live.\n- Newer releases also allow composite models that mix Direct Lake on OneLake tables with Import tables.",
    },
    {
      heading: 'When to choose Direct Lake',
      content:
        "Choose Direct Lake when:\n- your organisation uses **Fabric** and the data already lands in a lakehouse or warehouse,\n- tables are large and import refresh takes too long,\n- users want data soon after the engineering pipeline finishes.\n\nPrefer Import when data is small, comes from many non-Fabric sources, or needs Power Query shaping. Prefer DirectQuery when the source is not in OneLake and must stay real-time.",
    },
  ],
  examples: [
    {
      title: 'Create a Direct Lake semantic model from a lakehouse',
      scenario:
        'A data engineer loaded the shared tables Sales, Product, Customer and Date as Delta tables into a lakehouse named RetailLH in a workspace on an F SKU capacity.',
      steps: [
        'Open the workspace in the Fabric portal (app.fabric.microsoft.com) and open RetailLH',
        'In the Lakehouse explorer ribbon select New semantic model',
        'Name it Retail DL; tick Sales, Product, Customer and Date > Confirm',
        'The model opens in the web modeling view; drag Product[ProductID] to Sales[ProductID], Customer[CustomerID] to Sales[CustomerID], Date[Date] to Sales[OrderDate]',
        'Select the Date table > Mark as date table > choose Date',
        'Home > New measure > Total Sales (code below)',
        'Select New report (or File > Create new report) to build visuals',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'A semantic model whose tables show storage mode Direct Lake. A report on it returns totals immediately without any import refresh.',
      explanation:
        'The model only stores metadata plus pointers to the Delta tables; data is paged into memory on first use.',
    },
    {
      title: 'Connect from Power BI Desktop (Direct Lake on OneLake)',
      scenario: 'You prefer to model in Desktop but the data is in the RetailLH lakehouse.',
      steps: [
        'Power BI Desktop > Home > OneLake catalog (or Get data > OneLake catalog)',
        'Select RetailLH > Connect (choose the option to connect to the lakehouse tables, not the SQL endpoint)',
        'Pick the tables and give the semantic model a name and workspace > OK',
        'Desktop opens in live edit mode: changes to relationships and measures are saved directly to the model in the Service',
        'Check Model view: each table shows Storage mode Direct Lake',
      ],
      result: 'A Direct Lake on OneLake model created and edited from Desktop. There is no local PBIX data and no Power Query step list.',
      explanation: 'Desktop is used as an editor of the model in the workspace; the Fabric capacity hosts it.',
    },
    {
      title: 'Framing after new data arrives',
      scenario: 'A nightly pipeline appends 20,000 new rows to the Sales Delta table. Users must see them in the morning.',
      table: {
        headers: ['Time', 'Event', 'Rows visible in report'],
        rows: [
          ['01:00', 'Pipeline appends rows (Delta version 41 -> 42)', '1,200,000'],
          ['01:01', 'Automatic update frames the model to version 42', '1,220,000'],
          ['09:00', 'First user query loads changed columns into memory', '1,220,000'],
        ],
      },
      steps: [
        'Workspace > Retail DL semantic model > ... > Settings',
        'Expand Refresh > ensure "Keep your Direct Lake data up to date" is On',
        'Optional: in the pipeline add a Semantic model refresh activity after the load to frame at a known time',
        'Open the report next morning and check Total Sales and COUNTROWS(Sales)',
      ],
      code: `Order Rows = COUNTROWS ( Sales )`,
      result: 'Order Rows shows 1,220,000 after framing, with no import refresh job.',
      explanation: 'Framing only switches the model to the latest Delta version; data is read from the same Parquet files the pipeline wrote.',
    },
    {
      title: 'Detect DirectQuery fallback',
      scenario: 'A model uses Direct Lake on SQL endpoints and one table is a SQL view. Some visuals are slow.',
      steps: [
        'Open the report in Power BI Desktop connected live to the model',
        'Optimize > Performance analyzer > Start recording > Refresh visuals',
        'Expand the slow visual: a Direct query line indicates fallback',
        'Fix: replace the view with a materialised Delta table (for example via a notebook or Dataflow Gen2)',
        'Optionally set the model property Direct Lake behavior to Direct Lake only so fallback becomes an error you can spot in testing',
      ],
      result: 'After replacing the view, the visual no longer shows a Direct query timing and renders quickly.',
      explanation: 'Views cannot be read as Delta files, so the engine had to send SQL queries through the SQL analytics endpoint.',
    },
  ],
  interview: [
    {
      q: 'What is Direct Lake mode?',
      a: 'A Fabric storage mode where the semantic model loads Delta Parquet column data from OneLake directly into the VertiPaq engine on demand, avoiding both a full import copy and per-visual SQL queries.',
      level: 'Easy',
    },
    {
      q: 'What is framing?',
      a: 'The Direct Lake refresh operation. It updates model metadata to reference the latest version of the Delta tables without copying data, usually in seconds. It can be automatic, scheduled or triggered from a pipeline.',
      level: 'Medium',
    },
    {
      q: 'What licence or capacity is required for Direct Lake?',
      a: 'The workspace must be on a Fabric capacity (any F SKU), a legacy Premium P capacity or a Fabric trial. Viewers need Pro/PPU unless the capacity is F64 or larger.',
      level: 'Medium',
    },
    {
      q: 'What is DirectQuery fallback and which flavour has it?',
      a: 'When a query cannot be served in Direct Lake (views, SQL-endpoint security, guardrails exceeded), a Direct Lake on SQL endpoints model can send the query as DirectQuery through the SQL analytics endpoint. Direct Lake on OneLake never falls back. The Direct Lake behavior property can disable fallback.',
      level: 'Hard',
    },
    {
      q: 'Can you use Power Query and calculated columns in a Direct Lake model?',
      a: 'No Power Query inside the model; transformations happen upstream. Calculated columns and tables on Direct Lake tables are restricted, so add the column to the Delta table. Measures are fully supported.',
      level: 'Medium',
    },
    {
      q: 'Scenario: the first report open each morning is slow, later clicks are fast. Explain.',
      a: 'After framing, columns must be transcoded (paged) from Parquet into memory on first use, so the first queries are cold. You can warm the cache by running a few queries after the pipeline finishes, and keep Delta tables optimised with V-Order and fewer files.',
      level: 'Hard',
    },
    {
      q: 'Scenario: should a small company with Excel and SQL Server sources and Pro licences use Direct Lake?',
      a: 'No. Direct Lake requires Fabric capacity and data in OneLake. For small multi-source data on Pro, Import mode is simpler and cheaper.',
      level: 'Medium',
    },
    {
      q: 'How do you improve Direct Lake performance at the lake level?',
      a: 'Use V-Order, run OPTIMIZE to compact small files, keep row groups large, avoid wide high-cardinality columns that are not needed, partition sensibly, and keep tables within the SKU guardrails.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Start a Fabric trial (if your organisation allows), create a lakehouse and upload the four practice CSV files, then load each into a Delta table.',
      hint: 'Lakehouse > Get data > Upload files, then right-click the file > Load to Tables > New table.',
      solution: 'Four Delta tables named Sales, Product, Customer and Date appear under Tables in the lakehouse explorer.',
    },
    {
      task: 'Create a Direct Lake semantic model from those tables with correct relationships and a Total Sales measure.',
      hint: 'Lakehouse ribbon > New semantic model.',
      solution: 'Model with three one-to-many relationships into Sales, Date marked as a date table, and Total Sales = SUM(Sales[SalesAmount]).',
    },
    {
      task: 'Append a row to the Sales table (for example with a notebook or by loading another CSV in Append mode) and confirm the model picks it up without import refresh.',
      hint: 'Check that automatic updates are on in the model settings.',
      solution: 'COUNTROWS(Sales) increases by one after framing; the refresh history shows a quick framing operation rather than a data import.',
    },
    {
      task: 'Write a one-paragraph comparison of Import, DirectQuery and Direct Lake for a manager.',
      hint: 'Cover speed, freshness, data copy and licence needs.',
      solution: 'Import: fastest, copy of data, needs refresh, works on Pro. DirectQuery: no copy, real-time, slower, works on Pro with supported sources. Direct Lake: near-Import speed with no full copy and fast framing, but needs Fabric capacity and Delta tables in OneLake.',
    },
  ],
  quiz: [
    {
      question: 'Where must data live for Direct Lake?',
      options: ['In an Excel file on SharePoint', 'In Delta tables in OneLake', 'In any ODBC source', 'Inside the PBIX file'],
      answer: 1,
      explanation: 'Direct Lake reads Delta Parquet tables stored in Fabric OneLake.',
    },
    {
      question: 'What does framing do?',
      options: ['Copies all rows into the model', 'Points the model to the latest Delta table version', 'Deletes old Parquet files', 'Creates a gateway connection'],
      answer: 1,
      explanation: 'Framing updates metadata only; no bulk data copy.',
    },
    {
      question: 'Which flavour can fall back to DirectQuery?',
      options: ['Direct Lake on OneLake', 'Direct Lake on SQL endpoints', 'Both', 'Neither'],
      answer: 1,
      explanation: 'Only the SQL endpoint flavour can fall back through the SQL analytics endpoint.',
    },
    {
      question: 'Which workspace type supports Direct Lake?',
      options: ['Pro workspace', 'My workspace on Pro', 'Workspace on a Fabric F SKU capacity', 'PPU workspace only'],
      answer: 2,
      explanation: 'Direct Lake requires Fabric (or legacy Premium P) capacity.',
    },
    {
      question: 'Where should you add a new calculated column needed by a Direct Lake model?',
      options: ['In Power Query of the model', 'As a DAX calculated column on the Direct Lake table', 'Upstream in the Delta table (notebook, Dataflow Gen2 or SQL)', 'In the report theme'],
      answer: 2,
      explanation: 'Direct Lake models have no Power Query and restrict calculated columns, so add it to the source Delta table.',
    },
  ],
};
