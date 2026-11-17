export default {
  id: 'performance-optimization',
  title: 'Performance Optimization (VertiPaq, Model Size, DAX & Report Tuning)',
  level: 'Advanced',
  day: 17,
  duration: '5 hours',
  summary:
    "Make models smaller and reports faster. Understand how the VertiPaq engine stores and compresses data, reduce cardinality and remove unused columns, measure performance with Performance Analyzer and DAX Studio, apply Best Practice Analyzer rules, use aggregations, avoid bi-directional relationships, prefer measures over calculated columns, keep query folding, and design pages with fewer visuals.",
  objectives: [
    'Explain VertiPaq columnar storage, dictionary/value/RLE encoding and why cardinality drives model size',
    'Reduce model size by removing columns, reducing cardinality, choosing correct data types and disabling Auto date/time',
    'Diagnose slow visuals with Performance Analyzer and DAX Studio (Server Timings, VertiPaq Analyzer)',
    'Apply Best Practice Analyzer rules and DAX optimisation techniques',
    'Use aggregations, storage modes and good relationship design for large models',
    'Design reports that load quickly',
  ],
  theory: [
    {
      heading: 'How VertiPaq stores data',
      content:
        "Import models are stored by the **VertiPaq** engine (the in-memory columnar engine of Analysis Services). Instead of storing rows, it stores each **column separately** and compresses it. Queries read only the columns they need.\n\nCompression techniques:\n- **Value encoding** - for numeric columns, stores numbers with an offset/smaller bit width (e.g. 1,000,001-1,000,100 stored as 1-100).\n- **Dictionary (hash) encoding** - for text and high-variance columns, stores each unique value once in a dictionary and the column as small integer IDs.\n- **Run-length encoding (RLE)** - consecutive repeated values are stored once with a count (e.g. 'Germany' x 50,000). Sorting helps RLE, and VertiPaq chooses a sort order during processing.\n\nThe key insight: **column size depends mainly on cardinality (number of distinct values)**, not on the number of rows. A 100-million-row column with 3 distinct values is tiny; a 1-million-row unique GUID column is huge.\n\nThe query engine has two parts: the **Storage Engine (SE)** - fast, multi-threaded scans of compressed data, cached; and the **Formula Engine (FE)** - single-threaded, handles complex DAX logic. Fast queries push most work to the SE.",
      tip: "When someone says 'my model is 2 GB', ask 'which columns?'. Usually 2-3 high-cardinality columns (timestamps, IDs, free text) take most of the space.",
    },
    {
      heading: 'Reduce model size: columns, rows and cardinality',
      content:
        "The best optimisation is not loading data you do not need.",
      points: [
        'Remove unused columns in Power Query (not just hide them) - every column costs memory and refresh time',
        'Filter unnecessary rows (e.g. only last 5 years, only active statuses)',
        'Split DateTime into separate Date and Time columns (or drop the time) - a datetime with seconds can have millions of distinct values; a date has 365 per year',
        'Round decimals to the precision needed (e.g. 2 decimals); use Fixed decimal number (Currency) type where suitable',
        'Avoid high-cardinality text such as GUIDs, comments, URLs in the fact table; keep them out or in a separate detail table',
        'Replace long text keys with integer surrogate keys',
        'Disable Auto date/time (File > Options > Data load) - it creates a hidden date table for every date column',
        'Use correct data types: numbers as numbers (not text), whole numbers where possible',
        'Pre-aggregate in the source or Power Query if detail is not required (e.g. daily instead of transaction level)',
        'Prefer a star schema: narrow fact tables with keys and numbers; descriptive attributes in dimensions',
      ],
      tip: "Use DAX Studio > Advanced > View Metrics (VertiPaq Analyzer) to list tables and columns by size and cardinality - then fix the top offenders first.",
    },
    {
      heading: 'Measures vs calculated columns',
      content:
        "**Calculated columns** are computed at refresh and **stored** in the model (they consume memory and are compressed less efficiently than source columns because they are computed after compression decisions). **Measures** are computed at query time and store nothing.\n\nGuidelines:",
      points: [
        'Use measures for aggregations and anything that should respond to filters (ratios, totals, YoY)',
        'Use calculated columns only when you need to slice/filter/group by the value or use it in relationships',
        'Even better: create such columns in Power Query or the source (better compression, query folding) - "push transformations upstream"',
        'Avoid calculated columns that duplicate simple arithmetic like SalesAmount = Quantity * UnitPrice when a measure with SUMX would do - unless the stored column is needed and low-cardinality',
        'Avoid calculated tables that copy large tables',
      ],
      tip: "Roche's Maxim: 'Data should be transformed as far upstream as possible, and as far downstream as necessary.'",
    },
    {
      heading: 'Relationships and model design for performance',
      content:
        "- Use a **star schema**; avoid snowflakes with many chained dimensions where possible (flatten Category into Product).\n- Relationships on **integer keys** are faster than text keys.\n- **Avoid bi-directional relationships** unless needed: they expand filter propagation, can create ambiguity and slow queries. Use CROSSFILTER in specific measures instead.\n- Avoid **many-to-many** relationships when a bridge table design is possible; they are often slower.\n- **Limited (weak) relationships** (cross-source-group in composite models or many-to-many) cannot use the fast join paths of regular relationships.\n- Mark the Date table and use it consistently.\n- Avoid many inactive relationships and complex USERELATIONSHIP chains when a role-playing dimension would be simpler.",
    },
    {
      heading: 'Diagnosing: Performance Analyzer and DAX Studio',
      content:
        "**Performance Analyzer** (Optimize ribbon / View > Performance analyzer) in Desktop: Start recording > Refresh visuals. For each visual it shows:\n- **DAX query** - time for the engine to return results.\n- **Visual display** - time to render the visual.\n- **Other** - waiting for other visuals, preparing queries, etc.\n\nYou can **Copy query** to analyse it further in DAX Studio. Tip: also test with a cleared cache (start a new recording after 'Refresh visuals', or use DAX Studio Clear cache).\n\n**DAX Studio** (free external tool):\n- Run captured queries with **Server Timings** to see total time, **SE vs FE time**, number of SE queries, and cache hits.\n- **Query Plan** for deeper analysis.\n- **View Metrics (VertiPaq Analyzer)** - table/column sizes, cardinality, encoding, relationship sizes and referential integrity violations.\n- Export data, test measure variations, format DAX.\n\nHigh FE time or many SE queries (often caused by row-by-row iteration with context transition, nested iterators or IF inside large iterators) indicates DAX to rewrite.",
      tip: "Look for 'CallbackDataID' in SE queries in Server Timings - it means the SE had to call back to the FE for each row (e.g. complex expression inside SUMX), which is slow.",
    },
    {
      heading: 'DAX optimisation techniques and Best Practice Analyzer',
      content:
        "Common DAX improvements:",
      points: [
        'Use variables to avoid evaluating the same expression multiple times',
        'Use DIVIDE for safe division (and simple "/" when the denominator can never be zero, it is slightly faster)',
        'Filter columns, not whole tables: CALCULATE([Sales], Product[Color] = "Red") instead of FILTER(Product, Product[Color] = "Red") or FILTER(Sales, ...)',
        'Avoid FILTER over large fact tables; use KEEPFILTERS or column predicates',
        'Avoid iterating a fact table with measures inside (context transition per row) - iterate a dimension or VALUES of a key instead',
        'Prefer SELECTEDVALUE over IF(HASONEVALUE(), VALUES())',
        'Avoid converting BLANK to 0 everywhere (e.g. + 0) - it forces visuals to show all combinations and can explode the number of rows',
        'Use COUNTROWS(table) instead of COUNT(column) for row counts',
        'Reduce use of nested iterators and complex IFs inside iterators',
      ],
      syntax:
        '-- Slow: iterates the whole Sales table\nRed Sales Slow =\nCALCULATE ( [Total Sales], FILTER ( Sales, RELATED ( Product[Color] ) = "Red" ) )\n\n-- Fast: column predicate on the dimension\nRed Sales =\nCALCULATE ( [Total Sales], Product[Color] = "Red" )',
      tip: "Best Practice Analyzer (BPA) in Tabular Editor runs a rule set (Microsoft/community rules) that flags issues: bi-directional relationships, floating point data types, unused columns, missing formats, measures using IFERROR, Auto date/time tables, etc. The same rules can also be run against published models from Fabric notebooks using the semantic-link-labs library.",
    },
    {
      heading: 'Storage modes and aggregations for big data',
      content:
        "**Import** - fastest queries; data size and refresh time are limits.\n**DirectQuery** - data stays at the source; every visual queries the source (performance depends on the source, needs indexes/columnstore).\n**Dual** - a table that can act as Import or DirectQuery depending on the query - typical for dimensions in composite models.\n**Direct Lake** (Fabric) - reads Delta tables from OneLake directly into VertiPaq memory without import refresh.\n\n**Aggregations**: keep the huge detail fact in DirectQuery and add a smaller **aggregated table** in Import (e.g. Sales by Date, Product, Customer segment). With **Manage aggregations** (user-defined aggregations), Power BI automatically answers queries at the aggregated grain from the in-memory table and only goes to DirectQuery for detail. Requires the dimension tables to be Dual (or Import) and the aggregation table hidden. **Automatic aggregations** (Premium/Fabric) use machine learning to build them.\n\nOther tips for DirectQuery: reduce visuals, use 'Assume referential integrity' on relationships (inner joins), apply query reduction options (Apply buttons on slicers/filters).",
    },
    {
      heading: 'Report-level performance',
      content:
        "Every visual sends at least one query, so page design affects speed:",
      points: [
        'Limit the number of visuals per page (a common guideline is under ~8-10 data visuals); combine cards into a multi-row card or the new Card visual',
        'Use drill-through pages, tooltips and bookmarks to move detail off the main page',
        'Avoid tables/matrices with thousands of rows and many columns on landing pages',
        'Avoid high-cardinality slicers (e.g. 100,000 customer names) - use search or filter pane',
        'Reduce use of custom visuals that are slow or not optimised',
        'Turn on Query reduction options (Apply button for slicers/filters) for DirectQuery',
        'Use Top N filters to limit data points',
        'Check the "Show items with no data" option is off unless needed',
        'Test on the Service and with realistic data volumes, not just a sample',
      ],
    },
  ],
  examples: [
    {
      title: 'Splitting a DateTime column to reduce size',
      scenario: 'Sales[OrderDateTime] (datetime with seconds, 20 million rows) is the largest column: 15 million distinct values.',
      code:
        '// Power Query (M)\nlet\n    Source = Sql.Database("sqlprod01", "SalesDW"),\n    Sales = Source{[Schema="dbo", Item="FactSales"]}[Data],\n    AddDate = Table.AddColumn(Sales, "OrderDate", each DateTime.Date([OrderDateTime]), type date),\n    AddHour = Table.AddColumn(AddDate, "OrderHour", each Time.Hour([OrderDateTime]), Int64.Type),\n    RemoveDT = Table.RemoveColumns(AddHour, {"OrderDateTime"})\nin\n    RemoveDT',
      result: 'OrderDate: ~1,800 distinct values (5 years); OrderHour: 24 values. Column size drops from ~600 MB to a few MB.',
      explanation:
        'Cardinality drives dictionary size and compression. Splitting turns one huge column into two tiny ones. Keep the time only at the grain needed (hour). These steps fold to SQL on a relational source. Relate OrderDate to the Date table.',
    },
    {
      title: 'Finding the slow visual with Performance Analyzer',
      scenario: 'The Sales Overview page takes 9 seconds to load.',
      code:
        '1. Optimize ribbon > Performance analyzer > Start recording > Refresh visuals.\n2. Sort by Duration. Results:\n   Matrix "Customer detail"  DAX query 6,800 ms, Visual display 900 ms\n   Line chart                DAX query   220 ms\n   Cards (6)                 DAX query 40-90 ms each\n3. Expand Matrix > Copy query > paste in DAX Studio > Server Timings ON > Run.\n   Total 6.8 s: FE 5.9 s, SE 0.9 s, 1,240 SE queries -> FE-heavy, row-by-row.\n4. Inspect the measure used in the matrix (e.g. "Customer Rank" with nested iterators and FILTER(Sales,...)).\n5. Rewrite, re-test: 450 ms.',
      explanation:
        'Performance Analyzer pinpoints which visual is slow and whether time is DAX or rendering. DAX Studio Server Timings shows whether the problem is in the Formula Engine (DAX logic) or Storage Engine (data scanning). Many SE queries + high FE time usually means an inefficient iterator.',
    },
    {
      title: 'Rewriting a slow measure',
      scenario: 'A measure counts customers with sales above 1,000 but iterates the fact table.',
      code:
        '-- Slow: iterates Sales rows, context transition per row, FILTER on fact table\nBig Customers Slow =\nCOUNTROWS (\n    FILTER (\n        SUMMARIZE ( Sales, Sales[CustomerID], Sales[OrderID], Sales[ProductID] ),\n        CALCULATE ( SUM ( Sales[SalesAmount] ), ALLEXCEPT ( Sales, Sales[CustomerID] ) ) > 1000\n    )\n)\n\n-- Fast: iterate distinct customers only, reuse base measure\nBig Customers =\nCOUNTROWS (\n    FILTER (\n        VALUES ( Sales[CustomerID] ),\n        [Total Sales] > 1000\n    )\n)',
      explanation:
        'The slow version groups at order-line level (many rows), uses ALLEXCEPT which also ignores filters from other tables like Date, and may count customers multiple times - so it is both slow and wrong. The fast version iterates only distinct customers in context; [Total Sales] respects all current filters through context transition.',
    },
    {
      title: 'Removing bi-directional relationships',
      scenario: 'The model has Sales <-> Product set to Both because a slicer of Product should show only products sold to the selected customer segment.',
      code:
        '1. Set relationship Sales[ProductID] -> Product[ProductID] Cross filter direction = Single.\n2. Instead, filter the slicer with a measure:\n   Product Has Sales = INT ( NOT ISEMPTY ( Sales ) )\n3. Select the Product slicer > Filters on this visual > Product Has Sales is 1.\n4. Where a measure genuinely needs bi-directional behaviour:\n   Products Sold = CALCULATE ( DISTINCTCOUNT ( Product[ProductID] ), CROSSFILTER ( Sales[ProductID], Product[ProductID], Both ) )',
      explanation:
        'Visual-level measure filter on a slicer reproduces the "show only relevant items" effect without making the whole model bi-directional. The model becomes faster and free of ambiguity, and CROSSFILTER gives bi-directional logic only where needed.',
    },
    {
      title: 'User-defined aggregation over a DirectQuery fact',
      scenario: 'FactSales has 2 billion rows in DirectQuery. 90% of report queries are by month, category and country.',
      code:
        '1. Create SalesAgg in Import: \n   SELECT DateKey, ProductCategoryKey, CustomerCountryKey,\n          SUM(SalesAmount) AS SalesAmount, SUM(Quantity) AS Quantity, COUNT(*) AS RowCnt\n   FROM FactSales GROUP BY DateKey, ProductCategoryKey, CustomerCountryKey\n2. Set Date, Product category and Country dimensions to Dual storage mode.\n3. Relate SalesAgg to the dimensions.\n4. Right-click SalesAgg > Manage aggregations:\n   SalesAmount -> Sum -> FactSales[SalesAmount]\n   Quantity    -> Sum -> FactSales[Quantity]\n   RowCnt      -> Count table rows -> FactSales\n   Keys        -> GroupBy -> corresponding columns\n5. Hide SalesAgg. Keep measures on FactSales (e.g. SUM(FactSales[SalesAmount])).',
      explanation:
        'Queries at month/category/country grain hit the in-memory aggregation (milliseconds); drilling to individual orders falls back to DirectQuery. DAX Studio/SQL Profiler shows "aggregation hit" events to verify. Measures always reference the detail table; Power BI redirects automatically.',
    },
    {
      title: 'Checking query folding',
      scenario: 'Refresh of a large SQL table is slow. Make sure transformations fold.',
      code:
        '1. Power Query: right-click the last step > "View Native Query" (enabled = step folds), or check the step folding indicators.\n2. Problem: an "Added Index" step early in the query breaks folding; all later filters run locally.\n3. Fix: move filters, column removals and type changes BEFORE non-foldable steps; remove the index if unnecessary, or create it in a SQL view.\n4. Re-check: final step shows native query with WHERE and selected columns only.',
      explanation:
        'Query folding translates Power Query steps into source queries so the database does the filtering/aggregation and only needed rows/columns travel over the network. Folding also matters for incremental refresh and DirectQuery.',
    },
  ],
  interview: [
    {
      q: 'How does VertiPaq compress data and what affects model size most?',
      a: 'VertiPaq is a columnar in-memory engine. Each column is stored separately and compressed using value encoding (numbers), dictionary/hash encoding (unique values stored once, column holds IDs) and run-length encoding (repeated consecutive values stored once with a count). The biggest factor is column cardinality (distinct values): high-cardinality columns like datetimes with seconds, GUIDs, free text and transaction IDs consume most memory. Number of columns matters more than number of rows.',
      level: 'Medium',
    },
    {
      q: 'Your .pbix is 1.5 GB and cannot be published on Pro. How do you reduce it?',
      a: '1) Analyse with DAX Studio VertiPaq Analyzer to find the largest columns. 2) Remove unused columns and rows (date range filter). 3) Reduce cardinality: split datetime into date and time (or drop time), round decimals, replace text keys with integers, remove high-cardinality text (comments, GUIDs). 4) Disable Auto date/time. 5) Replace calculated columns with measures or Power Query columns. 6) Pre-aggregate if detail is not needed. 7) Consider incremental refresh to keep the .pbix small locally, DirectQuery/composite with aggregations, or Premium/PPU for larger models (Pro limit is 1 GB).',
      level: 'Hard',
    },
    {
      q: 'Measures vs calculated columns: performance implications?',
      a: 'Calculated columns are computed at refresh and stored in memory (increase model size and refresh time), evaluated in row context. Measures are computed at query time, store nothing, and respond to filters. Use measures for aggregations; use calculated columns only for slicing/grouping/relationships, and preferably create them in Power Query or the source for better compression.',
      level: 'Easy',
    },
    {
      q: 'What is Performance Analyzer and what do its timings mean?',
      a: 'A Desktop pane that records the time each visual takes when interacting or refreshing. DAX query = time for the engine to execute the query; Visual display = rendering time (affected by number of data points, custom visuals, images); Other = time waiting on other operations/visuals and preparing. You can copy the DAX query to DAX Studio for analysis.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between the Storage Engine and the Formula Engine?',
      a: 'The Storage Engine (SE) scans compressed column data, is multi-threaded, simple (aggregations, filters, joins), and caches results. The Formula Engine (FE) executes complex DAX logic, is single-threaded, and has no cache across queries. Efficient DAX pushes most work to the SE; high FE time or many small SE queries (and CallbackDataID) indicate inefficient patterns like row-by-row iteration with context transition.',
      level: 'Hard',
    },
    {
      q: 'Why should you avoid bi-directional relationships?',
      a: 'They propagate filters in both directions, which can produce ambiguous paths (Power BI may refuse or choose unexpected paths), unexpected results, worse performance (more filter propagation and larger query plans), and RLS complexity. Use single-direction by default and enable bi-directional behaviour only inside specific measures with CROSSFILTER, or use measure-based filters on slicers.',
      level: 'Medium',
    },
    {
      q: 'What is query folding and why does it matter for performance?',
      a: 'Query folding is Power Query translating transformation steps into a single native query executed by the source (e.g. SQL). It reduces data transferred and uses the source engine, making refresh much faster and less memory hungry. It is required for efficient incremental refresh and for DirectQuery. Check via View Native Query or folding indicators; keep foldable steps early and avoid breaking steps (custom functions, index columns, certain merges, non-foldable sources).',
      level: 'Medium',
    },
    {
      q: 'What are aggregations in Power BI?',
      a: 'Aggregation tables are pre-summarised tables (often Import) mapped to a detail table (often DirectQuery) via Manage aggregations. When a query can be answered at the aggregated grain, the engine uses the small in-memory table automatically; otherwise it queries the detail. Dimensions must be Dual for best results. They enable interactive analysis over billions of rows. Premium/Fabric also offers automatic aggregations.',
      level: 'Hard',
    },
    {
      q: 'Scenario: A matrix with Customer and Product on rows shows "+0" style zeros and is very slow. What could be wrong?',
      a: 'A measure probably converts BLANK to 0 (e.g. [Total Sales] + 0 or IF(ISBLANK(...), 0, ...)). Visuals hide rows where all measures are BLANK; forcing 0 makes every Customer x Product combination appear (a cross join of potentially millions of rows), which is slow and noisy. Fix: return BLANK, or apply the 0 replacement only where needed (e.g. a card), or show zeros only for existing combinations.',
      level: 'Hard',
    },
    {
      q: 'What is Best Practice Analyzer?',
      a: 'A Tabular Editor feature (and available via Fabric semantic-link-labs) that scans a model against a rule set covering performance, DAX expressions, naming, formatting and maintenance: e.g. avoid floating-point data types, remove auto date tables, avoid bi-directional relationships, hide foreign keys, set format strings, avoid IFERROR, use DIVIDE. It can auto-fix some issues. It is used in code reviews and CI/CD pipelines.',
      level: 'Medium',
    },
    {
      q: 'Why is FILTER(Sales, ...) inside CALCULATE often slower than a column predicate?',
      a: 'FILTER(Sales, condition) iterates every row of the fact table and returns a full table (all columns) as a filter, which may also involve RELATED lookups and FE work. A column predicate like Product[Color] = "Red" is converted to FILTER(ALL(Product[Color]), ...) - a filter on one low-cardinality column, which the SE handles efficiently and which propagates through relationships. Filter columns, not tables.',
      level: 'Medium',
    },
    {
      q: 'Scenario: A report is fast in Desktop but slow in the Service. What do you investigate?',
      a: 'Data volume differences (Desktop may have a sample due to incremental refresh parameters), capacity load/throttling (shared capacity or a busy Premium/Fabric capacity - check Fabric Capacity Metrics app), gateway latency for DirectQuery, RLS overhead (complex dynamic security filters), many concurrent users, network/browser rendering, and custom visuals. Use Performance Analyzer with the full dataset, check capacity metrics, and test RLS performance with Test as role.',
      level: 'Hard',
    },
    {
      q: 'How do you optimise a DirectQuery report?',
      a: 'Optimise the source (indexes, columnstore, materialised views), keep Power Query simple (folding), use star schema and integer keys, set "Assume referential integrity" for inner joins, reduce visuals per page, enable query reduction (Apply buttons), use Dual dimensions and Import aggregations (composite model), avoid complex DAX that generates heavy SQL, limit bi-directional relationships, and consider hybrid tables or Direct Lake.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Run VertiPaq Analyzer on your Sales model and list the top 3 largest columns with their cardinality. Propose one fix for each.',
      hint: 'DAX Studio > Advanced > View Metrics.',
      solution:
        'Open Desktop, External tools > DAX Studio > Advanced > View Metrics > Columns tab, sort by Total Size. Typical findings and fixes: Sales[OrderDateTime] (millions distinct) -> split into date and hour; Sales[OrderID] text GUID -> replace with integer or remove if not needed; Customer[Comments] free text -> remove or move to a separate table. Also check LocalDateTable_* tables -> disable Auto date/time.',
    },
    {
      task: 'Rewrite this measure for performance: Red Sales = SUMX(FILTER(Sales, RELATED(Product[Color]) = "Red"), Sales[SalesAmount])',
      hint: 'Column predicate in CALCULATE.',
      solution:
        'Red Sales = CALCULATE ( SUM ( Sales[SalesAmount] ), Product[Color] = "Red" )\nIf you must preserve existing color filters (intersect instead of overwrite): CALCULATE ( SUM ( Sales[SalesAmount] ), KEEPFILTERS ( Product[Color] = "Red" ) )',
    },
    {
      task: 'Replace the calculated column Sales[Profit] = Sales[SalesAmount] - Sales[Cost] with a better approach.',
      hint: 'Measure or Power Query.',
      solution:
        'If only aggregated profit is needed: Total Profit = SUM ( Sales[SalesAmount] ) - SUM ( Sales[Cost] ) (no stored column). If row-level profit is needed for slicing/bands, add it in Power Query (Add Column > Custom: [SalesAmount] - [Cost]) or in the SQL view so it compresses better and folds.',
    },
    {
      task: 'Use Performance Analyzer to compare a page with 14 cards vs the same KPIs in one Card (new) visual or multi-row card.',
      hint: 'Record both pages.',
      solution:
        'Start recording, refresh visuals on Page A (14 cards: 14 queries) and Page B (1 multi-measure card: 1 query). Compare total time and number of queries; Page B is typically faster because measures are retrieved in a single query and rendered once.',
    },
    {
      task: 'Check whether your Sales query folds and fix it if a step breaks folding.',
      hint: 'View Native Query.',
      solution:
        'Right-click each step from bottom to top; find the first step where View Native Query is greyed out. Move foldable steps (Removed Columns, Filtered Rows, Changed Type) above it, or replace the breaking step with an equivalent foldable one or a SQL view. Confirm the final step shows a native query.',
    },
    {
      task: 'Write a checklist of 8 items you would review when asked to "make this report faster".',
      hint: 'Model, DAX, report, environment.',
      solution:
        '1. Performance Analyzer to find slow visuals. 2. DAX Studio Server Timings for slow measures (FE vs SE). 3. VertiPaq Analyzer for large columns. 4. Remove unused columns/rows, reduce cardinality, disable Auto date/time. 5. Star schema, single-direction relationships, integer keys. 6. Replace calculated columns with measures or upstream columns; rewrite FILTER(table) patterns. 7. Reduce visuals per page, avoid huge tables, use drill-through/tooltips. 8. Storage mode review: Import vs DirectQuery, aggregations, incremental refresh; check capacity metrics in the Service.',
    },
  ],
  quiz: [
    {
      question: 'Which factor has the biggest impact on a column\'s size in VertiPaq?',
      options: ['Column name length', 'Number of distinct values (cardinality)', 'Number of measures', 'Number of report pages'],
      answer: 1,
      explanation: 'Cardinality determines dictionary size and compression efficiency.',
    },
    {
      question: 'In Performance Analyzer, which value tells you how long the engine took to run the query?',
      options: ['Visual display', 'DAX query', 'Other', 'Rendering'],
      answer: 1,
      explanation: 'DAX query is the engine time; Visual display is rendering.',
    },
    {
      question: 'Which engine in Analysis Services/Power BI is single-threaded?',
      options: ['Storage Engine', 'Formula Engine', 'VertiPaq scan engine', 'Both'],
      answer: 1,
      explanation: 'The Formula Engine is single-threaded; the Storage Engine is multi-threaded.',
    },
    {
      question: 'Which is the best way to reduce the size of a DateTime column with seconds?',
      options: ['Change its format string', 'Split into Date and Time (or remove time)', 'Hide the column', 'Rename the column'],
      answer: 1,
      explanation: 'Splitting reduces cardinality dramatically; formatting or hiding does not change storage.',
    },
    {
      question: 'Which storage mode is recommended for dimension tables in a composite model with aggregations?',
      options: ['Import only', 'DirectQuery only', 'Dual', 'Live connection'],
      answer: 2,
      explanation: 'Dual lets dimensions act as Import for aggregation hits and DirectQuery when joined to the detail fact.',
    },
    {
      question: 'Which tool provides Server Timings showing FE vs SE time?',
      options: ['Power Query editor', 'DAX Studio', 'Report Builder', 'Sync slicers pane'],
      answer: 1,
      explanation: 'DAX Studio Server Timings breaks query time into Formula and Storage Engine.',
    },
  ],
};
