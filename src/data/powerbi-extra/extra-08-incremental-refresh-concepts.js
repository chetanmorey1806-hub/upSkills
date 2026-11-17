export default {
  id: 'extra-08-incremental-refresh-concepts',
  title: 'Incremental Refresh Concepts',
  module: 'Extra: Power Query',
  extraNo: 8,
  level: 'Advanced',
  duration: '2 hours',
  summary: 'Incremental refresh splits a large table into date-based partitions so the Power BI Service refreshes only recent data (for example the last 10 days) and keeps older history untouched. Refresh becomes faster, more reliable and lighter on the source system.',
  objectives: [
    'Explain full refresh vs incremental refresh and why partitions help',
    'Create the RangeStart and RangeEnd parameters and the correct filter step',
    'Configure an incremental refresh policy (archive period, refresh period and options)',
    'Understand query folding, licensing and real-time (hybrid) tables',
    'Handle date columns, integer date keys and detect data changes',
  ],
  theory: [
    {
      heading: 'Full refresh vs incremental refresh',
      content: 'With a normal (full) refresh, Power BI deletes the whole table and reloads every row, every time. If Sales has 5 years and 50 million rows but only today changed, that is like repainting the whole building because one room got a new chair.\n\nIncremental refresh divides the table into **partitions** by date (years, quarters, months, days). On each scheduled refresh in the Service:\n- **Historical partitions** (older data) are kept as they are.\n- **Incremental partitions** (the recent window, e.g. last 10 days) are refreshed.\n- Partitions that fall outside the archive window are removed automatically (rolling window).\n\nBenefits: faster refresh, fewer timeouts, less load on the source, and less memory used during refresh.',
    },
    {
      heading: 'RangeStart and RangeEnd',
      content: 'Incremental refresh is driven by two Power Query parameters:\n\n- Names must be exactly **RangeStart** and **RangeEnd** (case-sensitive).\n- Type must be **Date/Time**.\n- Their current values in Desktop decide how much data you load while developing (keep it small, e.g. one month).\n\nIn the Service, Power BI replaces these values for each partition, for example RangeStart = 2024-03-01 00:00 and RangeEnd = 2024-04-01 00:00 for the March 2024 partition.\n\nThe filter must use **>= on one side and < on the other** so a row on a boundary belongs to exactly one partition. Using >= and <= would load boundary rows twice.',
      syntax: 'Table.SelectRows(Source, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)',
      tip: 'Create the filter with the UI: click the OrderDate filter arrow > Date/Time Filters > Custom Filter, choose "is after or equal to" RangeStart AND "is before" RangeEnd (switch value boxes to Parameter).',
    },
    {
      heading: 'Defining the policy',
      content: 'After Close & Apply, in Report view right-click the table in the **Data pane** > **Incremental refresh** (or Table view > right-click table). In the dialog:\n\n1. Turn on **Incrementally refresh this table**.\n2. **Archive data starting** N Years/Quarters/Months/Days **before refresh date**: how much history to keep.\n3. **Incrementally refresh data starting** N Days/Months... **before refresh date**: the window refreshed every time.\n4. Optional: **Get the latest data in real time with DirectQuery** (hybrid table; needs Premium, PPU or Fabric capacity and a source that supports DirectQuery).\n5. Optional: **Only refresh complete days** (skip today until it is finished, useful for daily loads).\n6. Optional: **Detect data changes**: choose a column like LastUpdated; a partition in the refresh window is refreshed only if the max of that column changed.\n\nThe dialog shows a timeline summary. Click Apply, then publish.',
    },
    {
      heading: 'What happens after publishing',
      content: '- In Desktop the policy is not applied; you only see rows between your RangeStart and RangeEnd values.\n- The **first refresh in the Service** creates all partitions and loads the full history (can take long).\n- Later refreshes only touch the incremental window.\n- Incremental refresh works with **Pro** licences as well as Premium/PPU/Fabric; advanced features (real-time hybrid tables, XMLA endpoint partition management, larger models) need Premium, PPU or Fabric capacity.\n- With an XMLA endpoint (Premium/Fabric) tools like SQL Server Management Studio or Tabular Editor can refresh individual partitions.',
      points: [
        'Policy runs only in the Service',
        'First refresh = full history load',
        'Do not republish casually; republishing can require a new full load of history depending on changes',
      ],
    },
    {
      heading: 'Query folding and column types',
      content: '**Query folding** is essential. The RangeStart/RangeEnd filter must be translated into the source query (e.g. a SQL WHERE clause) so the source returns only that partition rows. If the query does not fold, Power BI still works but reads the whole table for every partition, which can be slower than a full refresh. The dialog warns when it cannot confirm folding. Check with right-click on the filter step > View Native Query.\n\nColumn types:\n- **Date/Time column**: compare directly with RangeStart/RangeEnd.\n- **Date column**: convert the parameters, not the column: `[OrderDate] >= Date.From(RangeStart)`. Converting the column can break folding.\n- **Integer date key** (20240315): use a small function to convert the parameter to YYYYMMDD.\n\nSources: relational databases (SQL Server, Azure SQL, Synapse, Oracle, etc.) fold well. Flat files like CSV/Excel do not fold, so incremental refresh brings little benefit there.',
    },
  ],
  examples: [
    {
      title: 'Create RangeStart and RangeEnd and filter Sales',
      scenario: 'Sales lives in SQL Server table dbo.Sales with an OrderDate column of type datetime. Prepare it for incremental refresh and load only December 2024 in Desktop.',
      steps: [
        'Home > Transform data',
        'Home > Manage Parameters > New Parameter: Name RangeStart, Type Date/Time, Current Value 01-12-2024 00:00:00',
        'New Parameter: Name RangeEnd, Type Date/Time, Current Value 01-01-2025 00:00:00, OK',
        'Select the Sales query; OrderDate filter arrow > Date/Time Filters > Custom Filter',
        'Row 1: is after or equal to > Parameter > RangeStart; And; Row 2: is before > Parameter > RangeEnd; OK',
        'Right-click the Filtered Rows step > View Native Query to confirm a WHERE clause is generated',
        'Close & Apply',
      ],
      code: `// Parameter queries
RangeStart = #datetime(2024, 12, 1, 0, 0, 0) meta [IsParameterQuery = true, Type = "DateTime", IsParameterQueryRequired = true]
RangeEnd = #datetime(2025, 1, 1, 0, 0, 0) meta [IsParameterQuery = true, Type = "DateTime", IsParameterQueryRequired = true]

// Sales query
let
    Source = Sql.Database("SQLSRV01", "SalesDB"),
    dbo_Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data],
    #"Filtered Rows" = Table.SelectRows(dbo_Sales, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)
in
    #"Filtered Rows"`,
      result: 'Desktop loads only orders from 1-Dec-2024 to 31-Dec-2024. View Native Query shows a SELECT with a WHERE on OrderDate.',
      explanation: 'The filter uses >= and <, so each row falls into exactly one partition. Because the step folds, the database returns only the requested date range.',
    },
    {
      title: 'Define the incremental refresh policy',
      scenario: 'Business needs 3 years of history; orders can still change for up to 10 days after the order date.',
      table: {
        headers: ['Data range', 'What the Service does on each refresh'],
        rows: [
          ['Older than the 3-year archive window', 'Partitions dropped (rolling window)'],
          ['Inside archive window, older than 10 days', 'Kept as is (not refreshed)'],
          ['Last 10 days', 'Refreshed every time'],
        ],
      },
      steps: [
        'In Report view, Data pane: right-click Sales > Incremental refresh',
        'Turn on Incrementally refresh this table',
        'Archive data starting 3 Years before refresh date',
        'Incrementally refresh data starting 10 Days before refresh date',
        'Tick Only refresh complete days (optional), click Apply',
        'Publish to a workspace; set credentials and scheduled refresh; run the first refresh',
      ],
      result: 'The first Service refresh loads about 3 years of history into partitions; following refreshes reload only the last 10 days.',
      explanation: 'The archive window sets how much history the model keeps; the refresh window sets which partitions are reprocessed. Late corrections within 10 days are picked up automatically.',
    },
    {
      title: 'Date column (not datetime)',
      scenario: 'In your source, OrderDate is a date type. Comparing a date with a datetime parameter causes an error, and converting the column breaks folding.',
      steps: [
        'Select the Filtered Rows step on Sales',
        'In the formula bar wrap the parameters with Date.From as shown',
        'Press Enter and check View Native Query is still available',
      ],
      code: `#"Filtered Rows" = Table.SelectRows(dbo_Sales, each [OrderDate] >= Date.From(RangeStart) and [OrderDate] < Date.From(RangeEnd))`,
      result: 'The filter works on a date column and still folds to the source.',
      explanation: 'Date.From converts the parameter value once; the column stays untouched, so the engine can translate the comparison to SQL.',
    },
    {
      title: 'Integer date key (YYYYMMDD)',
      scenario: 'A data warehouse fact table stores OrderDateKey as an integer like 20241215 instead of a date.',
      steps: [
        'Home > New Source > Blank Query; rename it fnDateKey; paste the function in the Advanced Editor',
        'Select the fact query > add a filter step in the formula bar (click fx) using fnDateKey',
        'Check View Native Query on the filter step',
        'Close & Apply, then define the incremental refresh policy as usual',
      ],
      code: `// Query: fnDateKey
(x as datetime) as number => Date.Year(x) * 10000 + Date.Month(x) * 100 + Date.Day(x)

// Filter step in FactSales
#"Filtered Rows" = Table.SelectRows(dbo_FactSales, each [OrderDateKey] >= fnDateKey(RangeStart) and [OrderDateKey] < fnDateKey(RangeEnd))`,
      result: 'With RangeStart 2024-12-01 and RangeEnd 2025-01-01 the filter becomes OrderDateKey >= 20241201 and < 20250101.',
      explanation: 'The parameters are still Date/Time, as incremental refresh requires, but the function converts them to the integer format of the key column.',
    },
  ],
  interview: [
    { q: 'What is incremental refresh?', a: 'A refresh policy for a table where the Service partitions data by date and refreshes only recent partitions (the refresh window), keeping older partitions and dropping data beyond the archive window.', level: 'Easy' },
    { q: 'What are the requirements to set it up?', a: 'Date/Time parameters named RangeStart and RangeEnd, a filter step using them (>= and <), a date/time or integer-key column, ideally a source that supports query folding, then a policy defined in Desktop and publishing to the Service.', level: 'Medium' },
    { q: 'Why must one boundary be inclusive and the other exclusive?', a: 'So each row belongs to exactly one partition. With >= and <= a row exactly at midnight on a boundary would be loaded in two partitions and duplicated.', level: 'Medium' },
    { q: 'What happens if the query does not fold?', a: 'Refresh still works, but for each partition Power BI pulls all data and filters locally, which can make refresh slower than a full refresh. The dialog warns if it cannot confirm folding.', level: 'Hard' },
    { q: 'Is incremental refresh available with a Pro licence?', a: 'Yes. Pro supports incremental refresh. Real-time data with DirectQuery (hybrid tables) and XMLA-based partition management need Premium, PPU or Fabric capacity.', level: 'Medium' },
    { q: 'What does Detect data changes do?', a: 'You choose a date/time column such as LastUpdated. Power BI stores the max value per partition and refreshes a partition in the refresh window only if that max changed, saving more time. It should not be the same column used for RangeStart/RangeEnd filtering.', level: 'Hard' },
    { q: 'Scenario: daily refresh takes 3 hours and often times out on a 40-million-row Sales table. What would you propose?', a: 'Configure incremental refresh: RangeStart/RangeEnd on OrderDate, confirm folding, archive the required history (e.g. 3 years), refresh the last few days, enable Only refresh complete days and Detect data changes if a LastUpdated column exists. Remove unused columns and consider aggregations.', level: 'Hard' },
    { q: 'Where is the incremental refresh policy applied?', a: 'Only in the Power BI Service. Desktop simply loads the data between the current RangeStart and RangeEnd values.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create RangeStart = 2024-01-01 and RangeEnd = 2024-02-01 and filter the Sales query so Desktop loads only January 2024.', hint: 'Both parameters must be Date/Time.', solution: 'Parameters with Type Date/Time; filter: = Table.SelectRows(#"Changed Type", each [OrderDate] >= Date.From(RangeStart) and [OrderDate] < Date.From(RangeEnd)) if OrderDate is a date column.' },
    { task: 'Write the policy for: keep 5 years, refresh last 3 months.', hint: 'Two dropdowns in the dialog.', solution: 'Archive data starting 5 Years before refresh date; Incrementally refresh data starting 3 Months before refresh date.' },
    { task: 'Explain why this filter is wrong: each [OrderDate] >= RangeStart and [OrderDate] <= RangeEnd', hint: 'Think about boundary rows.', solution: 'Both sides are inclusive, so rows exactly at RangeEnd are loaded into this partition and also into the next one (where they equal RangeStart), causing duplicates. Use < RangeEnd.' },
    { task: 'Write fnDateKey and use it to filter an integer DateKey column.', hint: 'Year*10000 + Month*100 + Day.', solution: '(x as datetime) as number => Date.Year(x) * 10000 + Date.Month(x) * 100 + Date.Day(x)\n\n= Table.SelectRows(Source, each [DateKey] >= fnDateKey(RangeStart) and [DateKey] < fnDateKey(RangeEnd))' },
  ],
  quiz: [
    { question: 'What type must RangeStart and RangeEnd be?', options: ['Text', 'Date', 'Date/Time', 'Whole Number'], answer: 2, explanation: 'Both parameters must be Date/Time with these exact names.' },
    { question: 'Which filter is correct for incremental refresh?', options: ['>= RangeStart and <= RangeEnd', '> RangeStart and < RangeEnd', '>= RangeStart and < RangeEnd', '= RangeStart'], answer: 2, explanation: 'One inclusive and one exclusive boundary avoids duplicate rows.' },
    { question: 'Where does the incremental refresh policy actually create partitions?', options: ['Power BI Desktop', 'Power BI Service', 'Excel', 'Power BI Mobile'], answer: 1, explanation: 'Partitions are created on the first refresh in the Service.' },
    { question: 'Why is query folding important for incremental refresh?', options: ['It is needed to publish', 'So each partition query fetches only its date range from the source', 'It enables DAX measures', 'It encrypts the data'], answer: 1, explanation: 'Without folding, all data is pulled and filtered locally for every partition.' },
    { question: 'Which feature needs Premium, PPU or Fabric capacity?', options: ['Basic incremental refresh', 'RangeStart parameter', 'Get the latest data in real time with DirectQuery (hybrid table)', 'Archive data setting'], answer: 2, explanation: 'Hybrid tables with a real-time DirectQuery partition require Premium/PPU/Fabric.' },
  ],
};
