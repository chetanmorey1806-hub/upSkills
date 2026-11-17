export default {
  id: 'extra-35-composite-models',
  title: 'Composite Models',
  module: 'Extra: Advanced & Administration',
  extraNo: 35,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'A composite model mixes storage modes (Import, DirectQuery, Dual) or combines several sources, including live Power BI semantic models, inside one model. It lets you keep huge fact tables in the source while small dimensions stay fast in memory, or extend a shared semantic model with your own data.',
  objectives: [
    'Define a composite model and list the three table storage modes: Import, DirectQuery and Dual',
    'Set and change the storage mode of a table in Model view',
    'Explain source groups and limited (weak) relationships and their effect on results and performance',
    'Extend a published Power BI semantic model with local data using DirectQuery for Power BI semantic models',
    'Describe user-defined aggregations as a performance pattern in composite models',
  ],
  theory: [
    {
      heading: 'What is a composite model?',
      content:
        "Normally a Power BI model is either fully **Import** (all data copied into memory) or fully **DirectQuery** (every visual sends a query to the source). A **composite model** breaks that rule: different tables in the same model can use different storage modes, and data can come from more than one DirectQuery source.\n\nAnalogy: think of a restaurant kitchen. Ingredients used every minute (salt, onions) sit on the counter (Import, fast). Rare, bulky items stay in the cold store (DirectQuery, fetched when needed). Some items are kept in both places (Dual). The chef cooks one dish from all of them.\n\nYou get a composite model when you:\n- add an Import table to a DirectQuery model (or the reverse),\n- connect to two different DirectQuery sources, or\n- connect live to a published Power BI semantic model and then add local data (Power BI asks you to switch to a DirectQuery connection).",
    },
    {
      heading: 'Storage modes: Import, DirectQuery, Dual',
      content:
        "Each table has a **Storage mode** property.\n\n- **Import**: data is cached in the in-memory VertiPaq engine. Fastest queries, needs refresh.\n- **DirectQuery**: no data cached; queries go to the source at run time. Always current, speed depends on the source.\n- **Dual**: the table is both imported and available as DirectQuery. Power BI picks per query: if the query also touches a DirectQuery table from the same source, it sends one source query; otherwise it answers from memory.\n\nWhere to set it: **Model view** > select the table > **Properties** pane > **Advanced** > **Storage mode**. Changing a table from DirectQuery to Import is allowed; changing Import back to DirectQuery is not (you must remove and re-add the table).",
      tip: 'Set dimension tables related to a DirectQuery fact table to Dual. Slicers on Product or Customer then load from memory, and joins with the fact table can still be pushed to the source.',
    },
    {
      heading: 'Source groups and limited relationships',
      content:
        "Power BI organises a composite model into **source groups**: all Import tables form one group, and each DirectQuery source forms its own group.\n\nA relationship between tables in **different source groups** is a **limited relationship** (older name: weak relationship). In Model view it is drawn with small ( ) bracket marks at the ends of the line. Limited relationships:\n- do not have a guaranteed 'one' side, so missing keys do not produce a blank row,\n- cannot be used with some functions in the same way (for example RELATED does not work across them),\n- require Power BI to join data in the engine after fetching from each source, which is slower.\n\nMany-to-many relationships are also always limited.",
      points: [
        'Regular relationship: same source group, one-to-many, has a unique one side',
        'Limited relationship: crosses source groups or is many-to-many',
        'Keep high-volume joins inside one source group when possible',
      ],
    },
    {
      heading: 'DirectQuery for Power BI semantic models and Analysis Services',
      content:
        "The most popular composite scenario: a central BI team publishes a certified **Sales** semantic model. You connect to it live (**Home > Get data > Power BI semantic models**), and you need to add your own small Excel **Budget** table.\n\nSteps in short:\n1. Connect live to the semantic model.\n2. Click **Make changes to this model** (status bar or Modeling ribbon). Power BI converts the live connection to **DirectQuery** to that model.\n3. Add the Excel table (Import) and create relationships.\n\nRequirements: the tenant setting **Allow DirectQuery connections to Power BI semantic models** must be on, and you need **Build** permission on the source model. The remote model's measures are still computed in the remote model; your local measures can reference them.",
      tip: 'Chaining depth matters: a model built on a model built on a model becomes hard to maintain. Microsoft allows chains up to three levels, but one level is the best practice.',
    },
    {
      heading: 'Aggregations in composite models',
      content:
        "**User-defined aggregations** speed up huge DirectQuery fact tables. You create a small summarised table (for example sales by Date, Product and Customer summed) in **Import** mode, keep the detailed Sales table in **DirectQuery**, and map them with **Manage aggregations** (right-click the aggregation table in the Data pane).\n\nWhen a visual asks for totals by Month and Category, Power BI answers from the in-memory aggregation table. When a user drills to OrderID level, it falls through to DirectQuery. Users see one Sales table; the aggregation table is hidden.",
    },
    {
      heading: 'Security and governance considerations',
      content:
        "- Data from one source can be sent to another source inside a query (for example a filter list from an Excel table sent into a SQL query). Power BI shows a warning about this when you combine sources; check that it is acceptable for sensitive data.\n- Row-level security defined in a remote semantic model still applies to the user, because queries run under the user's identity.\n- Each DirectQuery source needs credentials and, for on-premises sources, a data gateway in the Service.\n- Composite models are more complex to troubleshoot; document storage modes and use Performance Analyzer to see which visuals hit DirectQuery.",
    },
  ],
  examples: [
    {
      title: 'Sales in DirectQuery, dimensions in Dual',
      scenario:
        'Your company stores the shared Sales, Product, Customer and Date tables in SQL Server. Sales has hundreds of millions of rows in production, so it must stay in DirectQuery, but slicers should be instant.',
      table: {
        headers: ['Table', 'Storage mode', 'Reason'],
        rows: [
          ['Sales', 'DirectQuery', 'Huge, changes all day'],
          ['Product', 'Dual', 'Small, used by slicers and joins'],
          ['Customer', 'Dual', 'Small, used by slicers and joins'],
          ['Date', 'Dual', 'Small, used by every time slicer'],
        ],
      },
      steps: [
        'Home > Get data > SQL Server > enter server and database > Data Connectivity mode: DirectQuery > OK',
        'Select Sales, Product, Customer and Date > Load',
        'Open Model view and click the Product table',
        'Properties pane > Advanced > Storage mode > Dual > OK on the warning; repeat for Customer and Date',
        'Mark Date as a date table: select Date > Table tools > Mark as date table > Date column',
        'Build a slicer on Product[Category] and a card with Total Sales = SUM(Sales[SalesAmount])',
        'Optimize ribbon (or View) > Performance Analyzer > Start recording > click the slicer and expand the card entry',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'The slicer shows no Direct query time (answered from memory), while the card shows a Direct query entry because Sales is DirectQuery. Relationships stay regular because all tables come from the same SQL Server source group.',
      explanation:
        'Dual tables are answered from memory when the query only needs them, and joined in the source when a DirectQuery table is also involved, so you avoid limited relationships.',
    },
    {
      title: 'Add an Excel Budget table to a published semantic model',
      scenario:
        'The certified "Sales Model" (with the shared tables) is published in the Service. A regional manager has a small Excel file with monthly budgets and wants Budget vs Actual. The Budget table is an extra table the student creates.',
      table: {
        headers: ['YearMonth', 'Category', 'BudgetAmount'],
        rows: [
          ['2024-01', 'Electronics', '250000'],
          ['2024-01', 'Accessories', '60000'],
          ['2024-01', 'Furniture', '90000'],
        ],
      },
      steps: [
        'Home > Get data > Power BI semantic models > select Sales Model > Connect (live connection)',
        'Click "Make changes to this model" in the status bar (or Modeling > Make changes to this model) > Add a local model',
        'Home > Get data > Excel workbook > select Budget.xlsx > tick Budget > Load',
        'In Model view drag Budget[Category] onto Product[Category]; set Cardinality Many to many and Cross filter direction Single (Product filters Budget) > OK',
        'Drag Budget[YearMonth] onto Date[YearMonth]; Many to many, Single (Date filters Budget) > OK',
        'Modeling > New measure > create Budget and Variance measures',
        'Build a matrix: rows Product[Category], columns Date[YearMonth], values Total Sales, Budget, Variance',
      ],
      code: `Budget = SUM ( Budget[BudgetAmount] )

Variance = [Total Sales] - [Budget]`,
      result: 'A matrix showing actual sales from the remote model next to the local budget per category and month. The relationships to the remote tables are drawn as limited relationships.',
      explanation:
        'After "Make changes to this model", the remote model becomes a DirectQuery source group and the Excel table forms the Import group. Budget is at Category and Month grain, so many-to-many relationships on Category and YearMonth are correct and are always limited.',
    },
    {
      title: 'Aggregation table for faster summaries',
      scenario:
        'Sales (DirectQuery) is slow for month-level visuals. Create an Import aggregation table summarised by OrderDate and ProductID. Sales_Agg is an extra table the student creates in Power Query.',
      steps: [
        'Home > Transform data > right-click the Sales query > Reference',
        'Rename it Sales_Agg; Transform > Group By > Advanced: group by OrderDate, ProductID, CustomerID; new columns SalesSum = Sum of SalesAmount, QtySum = Sum of Quantity, RowCnt = Count Rows',
        'Home > Close & Apply',
        'Model view > set Sales_Agg Storage mode to Import; relate Sales_Agg to Date, Product and Customer like Sales',
        'Data pane > right-click Sales_Agg > Manage aggregations',
        'Map SalesSum: Summarization Sum, Detail table Sales, Detail column SalesAmount; QtySum: Sum of Quantity; RowCnt: Count table rows of Sales; group-by columns map to OrderDate, ProductID, CustomerID > Apply all',
        'Hide Sales_Agg (Power BI hides it automatically) and test a Month by Category visual with Performance Analyzer',
      ],
      result: 'Month and Category visuals no longer show a Direct query timing; a table at OrderID level still queries the source.',
      explanation:
        'The engine checks if the query grain is covered by the aggregation table. If it is, it answers from memory (aggregation hit); if not, it falls back to the detail DirectQuery table.',
    },
  ],
  interview: [
    {
      q: 'What is a composite model in Power BI?',
      a: 'A model in which tables use different storage modes (Import, DirectQuery, Dual) or that connects to more than one DirectQuery source, including published Power BI semantic models and Analysis Services.',
      level: 'Easy',
    },
    {
      q: 'Explain Dual storage mode.',
      a: 'A Dual table is imported into memory and can also act as DirectQuery. Power BI decides per query: if the query only needs Dual/Import tables it uses the cache; if it joins with a DirectQuery table from the same source it pushes the join to the source.',
      level: 'Medium',
    },
    {
      q: 'What is a limited relationship and when does it occur?',
      a: 'A relationship without a guaranteed one side, used when tables are in different source groups or for many-to-many cardinality. Joins are done in the engine, no blank row is added for missing keys and RELATED cannot traverse it.',
      level: 'Medium',
    },
    {
      q: 'Scenario: your report connects live to a certified semantic model and you need to add a target table from Excel. What do you do?',
      a: 'Click "Make changes to this model" to convert the live connection to DirectQuery for Power BI semantic models, add the Excel table in Import mode, create relationships (usually many-to-many at the target grain) and write local measures. Requires Build permission and the tenant setting that allows DirectQuery to semantic models.',
      level: 'Medium',
    },
    {
      q: 'Can you change a table from Import to DirectQuery?',
      a: 'No. DirectQuery or Dual can be switched to Import, but Import cannot be switched back to DirectQuery; you must remove the table and connect again in DirectQuery mode.',
      level: 'Medium',
    },
    {
      q: 'How do aggregations help in a composite model?',
      a: 'A small Import table pre-summarises the large DirectQuery fact. With Manage aggregations, Power BI redirects summary queries to the in-memory table and only goes to the source for detail queries, giving big performance gains.',
      level: 'Hard',
    },
    {
      q: 'Scenario: a matrix in a composite model is slow and Performance Analyzer shows many DirectQuery queries. What do you check?',
      a: 'Check whether dimensions are Import instead of Dual (causing limited relationships and engine-side joins), whether relationships cross source groups, whether aggregations exist and are hit, the number of visuals per page, and whether measures force row-by-row work in DirectQuery.',
      level: 'Hard',
    },
    {
      q: 'Does RLS from a remote semantic model still apply in a composite model built on it?',
      a: 'Yes. Queries to the remote model run with the end user identity, so its RLS roles filter the data. Local tables need their own RLS if they contain sensitive data.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Load the shared tables from any SQL source in DirectQuery mode and set Product, Customer and Date to Dual.',
      hint: 'Model view > table > Properties > Advanced > Storage mode.',
      solution:
        'After the change, hovering over each table header in Model view shows Storage mode: Dual for the three dimensions and DirectQuery for Sales. Slicers become instant.',
    },
    {
      task: 'Create a small Import table Target (Category, TargetAmount) with Home > Enter data and relate it to Product[Category]. Note the relationship type.',
      hint: 'Category is not unique in Target if you add one row per category per year.',
      solution:
        'Product has many rows per category, so Product[Category] is not unique and Power BI creates a many-to-many relationship (set Product to filter Target). Many-to-many relationships are always limited; if Product is DirectQuery and Target is Import, it also crosses source groups.',
    },
    {
      task: 'Use Performance Analyzer to prove which visuals hit DirectQuery.',
      hint: 'Optimize > Performance Analyzer > Start recording > Refresh visuals.',
      solution:
        'Expand each visual: a "Direct query" line appears only for visuals that sent a query to the source. Visuals using only Dual/Import tables show DAX query time without Direct query time.',
    },
    {
      task: 'Write a short design note: which storage mode would you use for each shared table if Sales had 2 billion rows and refreshed every 5 minutes at the source?',
      hint: 'Think about freshness for facts and speed for dimensions.',
      solution:
        'Sales: DirectQuery (plus an Import aggregation table refreshed hourly). Product, Customer, Date: Dual. If the data lives in Fabric OneLake, Direct Lake is an alternative to consider.',
    },
  ],
  quiz: [
    {
      question: 'Which storage mode lets a table act as both cached and DirectQuery?',
      options: ['Import', 'DirectQuery', 'Dual', 'Live connection'],
      answer: 2,
      explanation: 'Dual tables can be answered from memory or pushed to the source depending on the query.',
    },
    {
      question: 'Where do you change a table storage mode in Power BI Desktop?',
      options: [
        'Report view > Format pane',
        'Model view > Properties pane > Advanced > Storage mode',
        'Power Query > Home > Data source settings',
        'File > Options > Data load',
      ],
      answer: 1,
      explanation: 'Storage mode is a table property in Model view under Advanced.',
    },
    {
      question: 'A relationship between an Import table and a DirectQuery table from another source is…',
      options: ['A regular relationship', 'A limited relationship', 'An inactive relationship', 'Not allowed'],
      answer: 1,
      explanation: 'Relationships across source groups are limited relationships.',
    },
    {
      question: 'What happens when you click "Make changes to this model" on a live connection?',
      options: [
        'The remote model is downloaded as a PBIX',
        'The connection becomes DirectQuery to the semantic model so local tables can be added',
        'All tables are converted to Import',
        'RLS is removed',
      ],
      answer: 1,
      explanation: 'It creates a local model that uses DirectQuery for Power BI semantic models.',
    },
    {
      question: 'Which feature redirects summary queries to a small Import table?',
      options: ['Incremental refresh', 'Manage aggregations', 'Query folding', 'Calculation groups'],
      answer: 1,
      explanation: 'User-defined aggregations map a summary table to a detail table so summary queries are answered from memory.',
    },
  ],
};
