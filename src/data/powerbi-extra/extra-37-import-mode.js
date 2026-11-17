export default {
  id: 'extra-37-import-mode',
  title: 'Import Mode',
  module: 'Extra: Advanced & Administration',
  extraNo: 37,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    'Import mode copies data into the highly compressed in-memory VertiPaq engine inside the semantic model. It is the default and fastest storage mode, supports every Power Query and DAX feature, but the data is only as fresh as the last refresh and the model must fit within licence and capacity size limits.',
  objectives: [
    'Explain how Import mode stores data with columnar compression (VertiPaq)',
    'Describe refresh: manual refresh in Desktop, scheduled refresh in the Service and refresh limits per licence',
    'Know current size limits for Pro, Premium Per User and Fabric capacities',
    'Reduce model size by removing columns, lowering cardinality and turning off Auto date/time',
    'Compare Import with DirectQuery and Direct Lake and pick the right mode',
  ],
  theory: [
    {
      heading: 'What Import mode does',
      content:
        "When you click **Load** after Get data, Power BI by default uses **Import** mode. Power Query runs all transformation steps and the result is stored inside the semantic model in the **VertiPaq** (also called xVelocity) in-memory engine.\n\nAnalogy: Import is like photocopying the pages you need from a library book. Reading your copy is instant, but if the library updates the book you need to photocopy again (refresh).\n\nBenefits:\n- Fastest query performance because data is in RAM and compressed.\n- Every Power Query transformation and every DAX function is available.\n- Data from many different sources (Excel, SQL, web APIs) can be combined freely.\n- No load on the source while users browse the report.",
    },
    {
      heading: 'How VertiPaq compression works',
      content:
        "VertiPaq stores data **column by column**, not row by row. Each column is compressed separately using:\n\n- **Dictionary (hash) encoding**: unique text values are stored once in a dictionary and the column stores small integer IDs. A City column with 4 values (Pune, Mumbai, Nagpur, Nashik) is tiny even with millions of rows.\n- **Value encoding** for numbers: stores numbers with an offset to use fewer bits.\n- **Run-length encoding**: repeated consecutive values are stored as value + count.\n\nThe key factor is **cardinality** (number of unique values). Low-cardinality columns (Segment, Category) compress extremely well; high-cardinality columns (OrderID, timestamps with seconds, long free-text comments) take most of the space.",
      tip: 'A 1 GB CSV often becomes 100-200 MB in an Import model, but a model with many unique text or datetime columns may compress much less.',
    },
    {
      heading: 'Refreshing Imported data',
      content:
        "Imported data does not change until a **refresh** runs.\n\n- **Desktop**: Home > **Refresh** reloads every table from the source.\n- **Service**: Workspace > semantic model > **Settings** > **Refresh** > configure **Refresh schedule** (time zone, frequency, times) and **Data source credentials**; on-premises sources need a **gateway connection**.\n- **Refresh now** button for an on-demand refresh.\n\nCurrent refresh limits for scheduled refresh:\n- **Pro** (shared capacity): up to **8** scheduled refreshes per day.\n- **Premium Per User (PPU)** and **Fabric capacity (F SKUs)**: up to **48** per day (every 30 minutes) in the UI; more via the REST API or XMLA.\n\n**Incremental refresh** refreshes only recent partitions (for example last 10 days) instead of the whole table, making refresh faster for large fact tables. It is available with Pro as well as PPU and capacities.",
    },
    {
      heading: 'Size limits and licences',
      content:
        "The model size that counts is the **compressed in-memory size**, not the source size.\n\n- **Pro** workspaces: each semantic model can be up to **1 GB** after compression.\n- **Premium Per User**: up to **100 GB** per model.\n- **Fabric capacity (F SKUs)** and remaining Premium P capacities: limited by the capacity SKU memory (for example an F64 allows models up to about 25 GB in memory), and the **Large semantic model storage format** setting must be on for models over 10 GB. In current workspaces on a capacity it is normally the default (Workspace settings > License info > Semantic model storage format: Large).\n\nNote: Microsoft has retired new purchases of Power BI Premium P SKUs; organisations now buy **Fabric F SKUs**. Users can view content in an F64 or larger capacity without a Pro licence; smaller F SKUs still require Pro or PPU for viewers.",
      tip: 'Prices and limits change; always confirm the current numbers on Microsoft Learn "Power BI licensing" and "Fabric capacity SKUs" pages before advising a customer.',
    },
    {
      heading: 'Making Import models smaller and faster',
      content:
        "1. **Remove unused columns** in Power Query (Home > Choose Columns). Columns you never use still cost memory.\n2. **Filter unnecessary rows** (for example only the last 3 years).\n3. **Lower cardinality**: split DateTime into Date and Time, round decimals, remove unique IDs that are not needed for relationships.\n4. **Correct data types**: whole numbers compress better than text; use Fixed decimal for currency.\n5. **Turn off Auto date/time**: File > Options and settings > Options > Current file > **Data Load** > untick **Auto date/time**. Otherwise Power BI creates a hidden date table for every date column.\n6. Prefer **measures** over calculated columns where possible.\n7. Use a **star schema** so text attributes live in small dimension tables.\n\nTools: **DAX Studio** with **VertiPaq Analyzer** (Advanced > View Metrics) shows the size of every column.",
    },
    {
      heading: 'Import vs DirectQuery vs Direct Lake',
      content:
        "- **Import**: fastest, full features, needs refresh, limited by model size. Default choice for most reports.\n- **DirectQuery**: no copy, real-time, slower and limited features. Use for huge or real-time data.\n- **Direct Lake** (Fabric only): reads Delta tables from OneLake straight into memory without a full import refresh; near-Import speed for large data already in a Fabric lakehouse or warehouse.\n- **Composite**: mix modes per table.\n\nRule of thumb: start with Import; move to another mode only for a clear reason (size, freshness, compliance).",
    },
  ],
  examples: [
    {
      title: 'Load the shared dataset in Import mode',
      scenario: 'You have the practice CSV files Sales.csv, Product.csv, Customer.csv and Date.csv downloaded from the app.',
      steps: [
        'Home > Get data > Text/CSV > select Sales.csv > Load',
        'Repeat for Product.csv, Customer.csv and Date.csv',
        'Look at the status bar: there is no "Storage Mode: DirectQuery" text, which means Import',
        'Model view: check the relationships to Sales on ProductID, CustomerID and Date -> OrderDate (create them by dragging if missing)',
        'Select the Date table > Table tools > Mark as date table > Date',
        'Modeling > New measure > Total Sales; build a card',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'Visuals respond instantly. Editing a value in Sales.csv does not change the report until you click Home > Refresh.',
      explanation: 'CSV files can only be imported. The data now lives inside the PBIX in compressed columns.',
    },
    {
      title: 'Turn off Auto date/time and remove unused columns',
      scenario: 'The model is bigger than expected. Sales has a Notes text column nobody uses, and Auto date/time is on.',
      table: {
        headers: ['Change', 'Size before', 'Size after'],
        rows: [
          ['Start', '58 MB', '-'],
          ['Disable Auto date/time', '58 MB', '51 MB'],
          ['Remove Sales[Notes]', '51 MB', '29 MB'],
        ],
      },
      steps: [
        'File > Options and settings > Options > Current file > Data Load > untick Auto date/time > OK',
        'Home > Transform data > select Sales',
        'Select the Notes column > Home > Remove Columns',
        'Home > Close & Apply',
        'File > Save, then check the PBIX file size in File Explorer (or use DAX Studio > Advanced > View Metrics)',
      ],
      result: 'The file shrinks (illustrative numbers shown in the table). The Notes column had very high cardinality, so removing it saves the most space.',
      explanation: 'Auto date/time creates a hidden date table per date column; free-text columns have almost one unique value per row and compress badly.',
    },
    {
      title: 'Schedule refresh in the Service',
      scenario: 'Publish the report to a Pro workspace and refresh it every morning at 7:00 and afternoon at 14:00.',
      steps: [
        'Home > Publish > choose the workspace > Select',
        'In the Power BI service open the workspace, hover the semantic model > ... > Settings',
        'Expand Data source credentials > Edit credentials and sign in (or map to a gateway connection for on-premises files)',
        'Expand Refresh > turn on "Configure a refresh schedule"',
        'Refresh frequency: Daily; Time zone: (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi; Add another time: 7:00 AM and 2:00 PM > Apply',
        'Check Refresh history in the same settings page after the next run',
      ],
      result: 'The semantic model refreshes twice a day. On Pro you could add up to 8 times per day; on PPU or a Fabric capacity up to 48.',
      explanation: 'Imported data must be refreshed to pick up source changes; the schedule runs in the Service without your PC.',
    },
    {
      title: 'Prefer a measure over a calculated column',
      scenario: 'A developer added a calculated column Profit = Sales[SalesAmount] - Sales[Cost] to a 10-million-row Sales table.',
      steps: [
        'Data view > select Sales > find the Profit column and delete it (Column tools > Delete... or right-click > Delete from model)',
        'Modeling > New measure > create Total Profit (code below)',
        'Replace the old column in visuals with the measure',
      ],
      code: `Total Profit = SUMX ( Sales, Sales[SalesAmount] - Sales[Cost] )`,
      result: 'Same numbers in visuals, but the model no longer stores 10 million extra values.',
      explanation: 'Calculated columns are stored in memory in Import mode. A measure computes at query time and uses no storage.',
    },
  ],
  interview: [
    {
      q: 'Why is Import mode usually the fastest?',
      a: 'Data is held in RAM in the VertiPaq columnar engine with heavy compression, so queries scan small compressed columns locally instead of calling an external source.',
      level: 'Easy',
    },
    {
      q: 'What is the maximum model size on Pro?',
      a: '1 GB per semantic model (compressed) in a Pro (shared capacity) workspace. PPU allows 100 GB, and Fabric capacities depend on the SKU memory with the large semantic model storage format.',
      level: 'Easy',
    },
    {
      q: 'How many scheduled refreshes per day are allowed?',
      a: '8 per day on Pro; 48 per day on PPU and Fabric/Premium capacities through the UI. API and XMLA-based refreshes on capacities are not bound by the 48 UI schedule slots.',
      level: 'Medium',
    },
    {
      q: 'What is cardinality and why does it matter in Import mode?',
      a: 'Cardinality is the number of distinct values in a column. VertiPaq uses dictionary encoding, so high-cardinality columns need large dictionaries and compress poorly, increasing memory and slowing scans.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a 900 MB Pro model fails to publish after adding a year of data. What can you do?',
      a: 'Remove unused columns, reduce cardinality (split datetime, round decimals), turn off Auto date/time, replace calculated columns with measures, filter old history, and consider incremental refresh. If still too large, move to PPU or a Fabric capacity, or use DirectQuery/Direct Lake.',
      level: 'Hard',
    },
    {
      q: 'Do viewers need a Pro licence to see an Import report?',
      a: 'In a Pro (shared capacity) workspace, yes, both author and viewers need Pro or PPU. In a workspace on a Fabric F64 or larger capacity (or legacy P capacity), free users with Viewer access can view it.',
      level: 'Medium',
    },
    {
      q: 'What is incremental refresh?',
      a: 'A policy that partitions a table by date (using RangeStart and RangeEnd parameters) so only recent partitions are refreshed while older ones are kept, making refresh faster and lighter on the source.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Load the four practice CSV files in Import mode and build a Total Sales by City column chart.',
      hint: 'Use Customer[City] on the X-axis and the Total Sales measure.',
      solution: 'After loading and relating the tables, the chart shows one column per city (Pune, Mumbai, Nagpur, Nashik).',
    },
    {
      task: 'Disable Auto date/time and note the file size before and after saving.',
      hint: 'Options > Current file > Data Load.',
      solution: 'The PBIX becomes smaller and the date hierarchy icons under Sales[OrderDate] disappear; use Date table columns instead.',
    },
    {
      task: 'Install DAX Studio, connect to your open model and find the largest column.',
      hint: 'External Tools ribbon > DAX Studio > Advanced > View Metrics.',
      solution: 'VertiPaq Analyzer lists tables and columns by total size; in the practice model Sales[OrderID] or Sales[OrderDate] is usually the largest because they are high cardinality.',
    },
    {
      task: 'Decide the storage mode: (a) 50 MB Excel budget, (b) 5 billion-row IoT table updated every second, (c) 3 GB sales history in a Fabric lakehouse.',
      hint: 'Think about size, freshness and where data lives.',
      solution: '(a) Import; (b) DirectQuery or a real-time solution (Fabric Real-Time Intelligence) with aggregations; (c) Direct Lake, or Import on a capacity if refresh windows are acceptable.',
    },
  ],
  quiz: [
    {
      question: 'Which engine stores Imported data in Power BI?',
      options: ['SQL Server', 'VertiPaq', 'Power Query', 'OneDrive'],
      answer: 1,
      explanation: 'VertiPaq is the in-memory columnar engine of Analysis Services used by Power BI.',
    },
    {
      question: 'What is the size limit for a semantic model in a Pro workspace?',
      options: ['100 MB', '1 GB', '10 GB', '100 GB'],
      answer: 1,
      explanation: 'Pro allows 1 GB compressed per semantic model; PPU allows 100 GB.',
    },
    {
      question: 'How many scheduled refreshes per day does Pro allow?',
      options: ['4', '8', '24', '48'],
      answer: 1,
      explanation: 'Pro allows 8; PPU and capacities allow 48 via the UI.',
    },
    {
      question: 'Which column will compress the worst?',
      options: ['Customer[Segment]', 'Product[Category]', 'A free-text comments column', 'Date[Quarter]'],
      answer: 2,
      explanation: 'Free text has very high cardinality, so dictionary encoding saves little.',
    },
    {
      question: 'Where do you turn off Auto date/time?',
      options: [
        'Model view > Properties',
        'File > Options and settings > Options > Current file > Data Load',
        'Power Query > View > Query settings',
        'Service > Workspace settings',
      ],
      answer: 1,
      explanation: 'It is a Data Load option for the current file (and can be set globally too).',
    },
  ],
};
