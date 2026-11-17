export default {
  id: 'day-38-performance-optimization',
  title: 'Performance Analyzer, DAX Optimization, Model Performance',
  module: 'Module 6: Advanced Power BI',
  day: 38,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'A slow report is a report nobody uses. Learn to measure visual load times with Performance Analyzer, rewrite slow DAX, and shrink the model (fewer columns, lower cardinality, star schema) so reports load in seconds.',
  objectives: [
    'Record and read Performance Analyzer results (DAX query, Visual display, Other)',
    'Copy a visual query to DAX query view or DAX Studio for deeper analysis',
    'Apply DAX optimization rules: variables, column filters instead of table FILTER, avoid heavy iterators',
    'Reduce model size: remove columns, lower cardinality, disable Auto date/time, use star schema',
    'Apply report design practices that reduce the number of queries per page',
  ],
  theory: [
    {
      heading: 'How Power BI renders a page',
      content:
        "When a page opens, every visual sends its own DAX query to the semantic model engine (VertiPaq for Import). The engine has two parts:\n\n- **Formula Engine (FE)**: single-threaded, understands all of DAX, handles complex logic.\n- **Storage Engine (SE)**: multi-threaded, very fast at scanning compressed columns and simple aggregations.\n\nFast DAX pushes most work to the Storage Engine. Slow DAX forces the Formula Engine to iterate row by row over large intermediate tables.\n\nAnalogy: SE is a team of warehouse workers who fetch boxes in parallel; FE is one manager who checks each box. The more boxes the manager inspects personally, the slower the job.",
    },
    {
      heading: 'Performance Analyzer',
      content:
        "Open it in Desktop with **Optimize > Performance analyzer** (in older versions View > Performance analyzer).\n\n1. Click **Start recording**.\n2. Click **Refresh visuals** (or interact: click a slicer, change page).\n3. Expand each visual to see durations in milliseconds:\n   - **DAX query**: time for the engine to return results. High value = DAX/model problem.\n   - **Visual display**: time to draw the visual. High value = too many data points or complex custom visual.\n   - **Other**: waiting for other visuals, preparing queries, background work. High value often means too many visuals on the page.\n   - **Direct query**: time spent in the source database (DirectQuery models only).\n4. Click **Copy query** and paste into **DAX query view** (left toolbar in Desktop) or **DAX Studio** to run it alone, see server timings and test rewrites.\n5. **Export** saves the results as JSON for sharing.",
      tip: 'Always test with a cold start: click Refresh visuals after opening, and compare the same page before and after each change.',
    },
    {
      heading: 'DAX optimization rules',
      content:
        "1. **Use variables** so expensive expressions are computed once.\n2. **Filter columns, not tables**: `CALCULATE([Total Sales], Sales[Quantity] >= 5)` is faster than `CALCULATE([Total Sales], FILTER(Sales, Sales[Quantity] >= 5))` because FILTER over the whole fact table materialises rows. Wrap with `KEEPFILTERS` if you must respect an existing filter on the same column.\n3. **Iterate small tables**: `SUMX(VALUES(Customer[CustomerID]), ...)` instead of iterating the fact table with measure references (context transition per row is expensive).\n4. **Use DIVIDE** for safe division and avoid `IFERROR`/`ISERROR`, which slow down evaluation.\n5. **Avoid unnecessary calculated columns** on large fact tables; compute them in Power Query or the source.\n6. **Prefer simple measures reused by others** (Total Sales, Total Cost, Profit) so the engine can cache results.\n7. Use `SELECTEDVALUE` instead of `IF(HASONEVALUE(...), VALUES(...))` for readability.",
      syntax: "-- Slow\nCALCULATE ( [Total Sales], FILTER ( Sales, Sales[Quantity] >= 5 ) )\n-- Fast\nCALCULATE ( [Total Sales], Sales[Quantity] >= 5 )",
    },
    {
      heading: 'Model performance: size and cardinality',
      content:
        "VertiPaq compresses each column separately. Size depends mostly on **cardinality** (number of distinct values) and data type.\n\n- **Remove unused columns and rows** in Power Query (the biggest win).\n- **Split high-cardinality columns**: a DateTime with seconds has millions of distinct values; split into Date and Time, or drop the time.\n- **Use integer keys** for relationships rather than long text keys.\n- **Reduce precision**: round decimals you do not need; use Fixed decimal number for currency.\n- **Disable Auto date/time**: File > Options and settings > Options > Current file > Data load > Time intelligence > clear Auto date/time. It creates a hidden date table for every date column. Use one marked Date table instead.\n- **Star schema**: one fact, small dimensions, single-direction relationships. Avoid unnecessary bidirectional and many-to-many relationships.\n- **Choose the right storage mode**: Import is fastest to query; DirectQuery depends on the source; use aggregations or composite models for very large data; on Fabric, Direct Lake reads Delta tables in OneLake.",
      points: [
        'DAX Studio > Advanced > View Metrics (VertiPaq Analyzer) shows the size of every table and column.',
        'Tabular Editor Best Practice Analyzer flags common model problems.',
      ],
    },
    {
      heading: 'Report design for speed',
      content:
        "- Limit visuals per page (each visual = at least one query). Combine cards into one multi-row card or new card visual with several values.\n- Avoid huge tables with thousands of rows on the landing page; use drillthrough for detail.\n- Use **Optimize > Optimization presets** or **Pause visuals** while designing, and enable **Apply all slicers** buttons for DirectQuery so queries run once after all selections.\n- Hidden visuals on a page still run queries if they are not in a hidden bookmark state; remove unused visuals.\n- Test custom visuals; some are much slower than built-in ones.",
    },
  ],
  examples: [
    {
      title: 'Find the slowest visual with Performance Analyzer',
      scenario: 'A sales overview page takes 6 seconds to load. Find the cause.',
      table: {
        headers: ['Visual', 'DAX query (ms)', 'Visual display (ms)', 'Other (ms)', 'Total (ms)'],
        rows: [
          ['Card - Total Sales', '12', '20', '150', '182'],
          ['Column chart - Sales by Category', '35', '60', '210', '305'],
          ['Table - Order details (all rows)', '4,850', '640', '230', '5,720'],
        ],
      },
      steps: [
        'Optimize > Performance analyzer',
        'Click Start recording, then Refresh visuals',
        'Sort by Total time (click the column header) and expand the slowest visual',
        'Click Copy query; open DAX query view, paste and Run to reproduce the time',
        'Fix: move the detailed table to a drillthrough page or add a Top N filter',
      ],
      result: 'The order-level table is responsible for most of the load time; after moving it to a drillthrough page the landing page loads in under 1 second (illustrative timings).',
      explanation: 'The DAX query column points to a heavy query; Other time for small visuals is mostly waiting for the slow visual.',
    },
    {
      title: 'Column predicate instead of FILTER on the fact table',
      scenario: 'Measure for sales of orders with quantity 5 or more.',
      table: {
        headers: ['OrderID', 'Quantity', 'SalesAmount', 'Included?'],
        rows: [
          ['1001', '2', '1,00,000', 'No'],
          ['1002', '10', '5,000', 'Yes'],
          ['1003', '4', '24,000', 'No'],
          ['1004', '1', '50,000', 'No'],
          ['1005', '5', '7,500', 'Yes'],
        ],
      },
      steps: [
        'Modeling > New measure: Bulk Sales Slow (below)',
        'Modeling > New measure: Bulk Sales Fast (below)',
        'Show both in cards; in Performance Analyzer compare DAX query times on the full dataset',
      ],
      code: `Bulk Sales Slow =
CALCULATE ( [Total Sales], FILTER ( Sales, Sales[Quantity] >= 5 ) )

Bulk Sales Fast =
CALCULATE ( [Total Sales], KEEPFILTERS ( Sales[Quantity] >= 5 ) )`,
      result: 'Both return 12,500 (orders 1002 and 1005). The fast version filters only one column instead of the whole Sales table.',
      explanation: 'A boolean column predicate becomes FILTER(ALL(Sales[Quantity]), ...), a small list of distinct quantities that the Storage Engine applies efficiently. KEEPFILTERS keeps any existing Quantity filter, matching the original semantics.',
    },
    {
      title: 'Variables remove repeated work',
      scenario: 'A YoY measure repeats the previous-year calculation three times.',
      table: {
        headers: ['Version', 'Times PY sales is evaluated'],
        rows: [
          ['Without variables', '3'],
          ['With variables', '1'],
        ],
      },
      steps: [
        'Open the existing YoY measure (slow version below)',
        'Rewrite it using VAR as in the fast version',
        'Compare with Performance Analyzer on a matrix by Month',
      ],
      code: `-- Slow
YoY % Slow =
IF (
    CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) ) = 0,
    BLANK (),
    ( [Total Sales] - CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) ) )
        / CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
)

-- Fast
YoY % =
VAR Curr = [Total Sales]
VAR PY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN
    DIVIDE ( Curr - PY, PY )`,
      result: 'Same values, shorter code, fewer engine calls. DIVIDE returns BLANK when PY is 0 or blank.',
      explanation: 'Each variable is evaluated once per cell; DIVIDE handles divide-by-zero without IF.',
    },
    {
      title: 'Shrink the model: cardinality and Auto date/time',
      scenario: 'A 2 million row Sales table imported with an OrderDateTime column and Auto date/time on is 480 MB.',
      table: {
        headers: ['Change', 'Effect (illustrative)'],
        rows: [
          ['Remove 12 unused text columns', '480 MB to 260 MB'],
          ['Split OrderDateTime into OrderDate (date) only', '260 MB to 150 MB'],
          ['Disable Auto date/time', '150 MB to 135 MB'],
          ['Round Cost to 2 decimals, Fixed decimal type', '135 MB to 120 MB'],
        ],
      },
      steps: [
        'Home > Transform data; select unused columns > Home > Remove columns',
        'Select OrderDateTime > Add column > Date > Date Only, then remove OrderDateTime',
        'Select Cost > Transform > Rounding > Round > 2; change type to Fixed decimal number',
        'Close & Apply',
        'File > Options and settings > Options > Current file > Data load > clear Auto date/time > OK',
        'Check sizes in DAX Studio: Advanced > View Metrics',
      ],
      code: `// Power Query: keep only the date part
= Table.TransformColumns ( #"Previous Step", {{"OrderDateTime", DateTime.Date, type date}} )`,
      result: 'Model size drops by roughly 75% and refresh and queries are faster.',
      explanation: 'Fewer columns and fewer distinct values compress far better in VertiPaq.',
    },
    {
      title: 'Iterate a dimension instead of the fact table',
      scenario: 'Average sales per customer written against the fact table is slow on millions of rows.',
      table: {
        headers: ['Measure', 'Sample result'],
        rows: [
          ['Avg per Customer (fast)', '62,166.67'],
        ],
      },
      steps: [
        'Replace the slow measure with the fast one below',
        'Compare DAX query time in Performance Analyzer',
      ],
      code: `-- Slow: context transition for every Sales row, and wrong if rows duplicate
Avg per Customer Slow =
AVERAGEX ( Sales, CALCULATE ( [Total Sales], ALLEXCEPT ( Sales, Sales[CustomerID] ) ) )

-- Fast: iterate distinct customers only
Avg per Customer =
AVERAGEX ( VALUES ( Sales[CustomerID] ), [Total Sales] )`,
      result: 'Fast version iterates 3 customers instead of 5 order rows (millions in real data) and returns 1,86,500 / 3 = 62,166.67.',
      explanation: 'The slow version averages per order row, so customers with more orders get more weight (wrong) and context transition runs per row (slow).',
    },
  ],
  interview: [
    {
      q: 'What are the three main timings shown in Performance Analyzer?',
      a: 'DAX query (engine time to return results), Visual display (render time) and Other (waiting/preparation, often because of other visuals). DirectQuery models also show Direct query time.',
      level: 'Easy',
    },
    {
      q: 'How do you analyse a slow visual query further?',
      a: 'Copy query in Performance Analyzer, paste into DAX query view in Desktop or DAX Studio, run it with Server Timings to see Storage Engine vs Formula Engine time and test rewrites.',
      level: 'Medium',
    },
    {
      q: 'Why is CALCULATE([Sales], FILTER(Sales, Sales[Qty] > 5)) slower than CALCULATE([Sales], Sales[Qty] > 5)?',
      a: 'FILTER(Sales, ...) iterates and materialises the whole fact table (all columns), while the column predicate filters only the distinct values of one column, which the Storage Engine can apply directly. Semantics differ slightly: the predicate replaces existing filters on that column unless wrapped in KEEPFILTERS.',
      level: 'Hard',
    },
    {
      q: 'Name five ways to reduce model size.',
      a: 'Remove unused columns/rows, reduce cardinality (split DateTime, round decimals), use integer keys, disable Auto date/time, avoid calculated columns on large tables, use star schema, and aggregate data to the needed grain.',
      level: 'Medium',
    },
    {
      q: 'What is cardinality and why does it matter for VertiPaq?',
      a: 'Cardinality is the number of distinct values in a column. VertiPaq uses dictionary and run-length encoding, so low-cardinality columns compress well and scan fast; high-cardinality columns (IDs, timestamps) are large and slow.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a page has 25 visuals and loads slowly although each DAX query is fast. What do you do?',
      a: 'The Other time is high because visuals queue. Reduce visuals (combine cards, use a multi-row or new card visual), move details to drillthrough or tooltip pages, remove hidden/unused visuals, and use bookmarks to show optional content.',
      level: 'Hard',
    },
    {
      q: 'What is the Formula Engine vs Storage Engine?',
      a: 'The Storage Engine is multi-threaded and scans compressed data fast for simple aggregations; the Formula Engine is single-threaded and evaluates complex DAX logic. Optimized DAX pushes more work into the Storage Engine.',
      level: 'Hard',
    },
    {
      q: 'Why should Auto date/time be disabled in production models?',
      a: 'It creates a hidden date table for each date column, increasing size and creating inconsistent time intelligence. A single marked Date table is smaller and gives consistent results.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Run Performance Analyzer on a page with at least 4 visuals and write down which timing is largest for each visual.',
      hint: 'Optimize > Performance analyzer > Start recording > Refresh visuals.',
      solution: 'Expand each visual entry; note DAX query, Visual display and Other. Large DAX query = optimize the measure/model; large Visual display = reduce points; large Other = fewer visuals.',
    },
    {
      task: 'Rewrite this measure to use a column predicate: CALCULATE([Total Sales], FILTER(Product, Product[Category] = "Electronics")).',
      hint: 'Filter the column directly.',
      solution: `Electronics Sales =
CALCULATE ( [Total Sales], Product[Category] = "Electronics" )
-- Sample result 1,50,000`,
    },
    {
      task: 'Rewrite a margin measure that calls SUM(Sales[SalesAmount]) three times so it calls it once.',
      hint: 'Variables.',
      solution: `Margin % =
VAR S = SUM ( Sales[SalesAmount] )
VAR C = SUM ( Sales[Cost] )
RETURN DIVIDE ( S - C, S )`,
    },
    {
      task: 'List the Power Query steps to reduce the size of a fact table that has OrderDateTime, CustomerName, CustomerAddress and ProductDescription columns.',
      hint: 'Keep keys in the fact table; descriptions belong in dimensions.',
      solution: '1. Keep CustomerID/ProductID keys; remove CustomerName, CustomerAddress, ProductDescription (they live in Customer and Product). 2. Convert OrderDateTime to Date only. 3. Set proper types (whole number keys, fixed decimal amounts). 4. Filter out years not needed.',
    },
    {
      task: 'Turn off Auto date/time for the current file and for all new files.',
      hint: 'There are two places in Options.',
      solution: 'File > Options and settings > Options > Current file > Data load > clear Auto date/time; and Global > Data load > clear Auto date/time for new files.',
    },
  ],
  quiz: [
    {
      question: 'In Performance Analyzer, a very high "Visual display" time usually means...',
      options: ['Slow DAX', 'Too many data points or a heavy visual', 'Slow gateway', 'RLS is enabled'],
      answer: 1,
      explanation: 'Visual display measures rendering; reduce points or change the visual.',
    },
    {
      question: 'Which column will compress best in VertiPaq?',
      options: ['OrderID (unique)', 'Timestamp with seconds', 'Category (3 values)', 'Free-text comments'],
      answer: 2,
      explanation: 'Low cardinality compresses best.',
    },
    {
      question: 'Which is usually the faster filter inside CALCULATE?',
      options: [
        'FILTER(Sales, Sales[Quantity] >= 5)',
        'Sales[Quantity] >= 5',
        'FILTER(ALL(Sales), Sales[Quantity] >= 5)',
        'They are always equal',
      ],
      answer: 1,
      explanation: 'A column predicate filters one column rather than iterating the full table.',
    },
    {
      question: 'Where do you paste a copied visual query inside Power BI Desktop?',
      options: ['Model view', 'DAX query view', 'Power Query Advanced Editor', 'Format pane'],
      answer: 1,
      explanation: 'DAX query view runs DAX queries directly in Desktop.',
    },
    {
      question: 'Which engine is single-threaded?',
      options: ['Storage Engine', 'Formula Engine', 'Both', 'Neither'],
      answer: 1,
      explanation: 'The Formula Engine is single-threaded; the Storage Engine is multi-threaded.',
    },
  ],
};
