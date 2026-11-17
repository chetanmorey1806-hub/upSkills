export default {
  id: 'day-11-append-merge-join-types',
  title: 'Append Queries, Merge Queries, Join Types',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 11,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Combine tables in Power Query: Append stacks tables with the same columns one below the other (like UNION), Merge joins tables side by side on a key column (like VLOOKUP/SQL JOIN). Learn all six join kinds with a worked example and the M code.',
  objectives: [
    'Append two or more queries and handle columns that do not match',
    'Merge queries on one or more key columns and expand the result',
    'Explain and choose between Left Outer, Right Outer, Full Outer, Inner, Left Anti and Right Anti joins',
    'Read Table.Combine, Table.NestedJoin and Table.ExpandTableColumn',
    'Decide when to merge in Power Query and when to create a relationship in the model',
  ],
  theory: [
    {
      heading: 'Append vs Merge – the big picture',
      content:
        `- **Append** = put tables **one below the other** (more rows). Like stapling January\'s pages under December\'s pages. SQL: \`UNION ALL\`.\n- **Merge** = put tables **side by side** using a matching key (more columns). Like looking up a student\'s name from their roll number. Excel: \`VLOOKUP/XLOOKUP\`. SQL: \`JOIN\`.\n\nBoth are on **Home > Combine** in the Power Query Editor, each with two versions:\n\n- **Append Queries** / **Merge Queries** – adds the step to the **current** query.\n- **Append Queries as New** / **Merge Queries as New** – creates a **new** query and leaves the originals unchanged (cleaner and easier to debug).`,
    },
    {
      heading: 'Append Queries',
      content:
        `1. **Home > Append Queries > Append Queries as New**.\n2. Choose **Two tables** (Primary + Table to append) or **Three or more tables** (add tables to the right-hand list).\n3. OK.\n\nRules:\n\n- Columns are matched **by name**, not by position.\n- A column present in only one table appears in the result with **null** for rows from the other table. So "Amount" vs "SalesAmount" creates two half-empty columns – **rename first**.\n- Duplicate rows are **kept** (it is UNION ALL). Use Remove Duplicates if needed.\n- For many files of the same structure, the **Folder** connector (Day 5) is easier than appending one by one.`,
      syntax: `Table.Combine({Sales2023, Sales2024})
Table.Combine({SalesPune, SalesMumbai, SalesNagpur})`,
    },
    {
      heading: 'Merge Queries',
      content:
        `1. Select the main (left) query, e.g. Sales.\n2. **Home > Merge Queries > Merge Queries as New**.\n3. Top table: Sales – click the **ProductID** column. Bottom drop-down: choose **Product** – click **ProductID**.\n4. Choose **Join Kind**. The dialog shows "The selection matches X of Y rows from the first table".\n5. OK. A new column named after the second table appears containing **Table** values.\n6. Click the **expand icon** on that column, tick the needed columns (e.g. Product, Category), untick **Use original column name as prefix**, OK.\n\nFor a **multi-column key** (e.g. City + Year), Ctrl+click the columns in the **same order** in both tables – the dialog shows 1, 2 numbers on the headers.\n\nOptional: **Use fuzzy matching to perform the merge** for approximate text matches (e.g. "Patil Tradrs" vs "Patil Traders") with a similarity threshold.`,
      syntax: `Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftOuter)
Table.ExpandTableColumn(PreviousStep, "Product", {"Product", "Category"}, {"Product", "Category"})`,
      tip: 'Key columns must have the same data type and clean values. "P01" will not match "P01 " (trailing space) or "p01". Merge is case-sensitive unless you use fuzzy matching with "Ignore case".',
    },
    {
      heading: 'The six join kinds',
      content:
        `Imagine two circles: **Left** = the first (top) table, **Right** = the second (bottom) table.`,
      points: [
        '**Left Outer** (default) – all rows from Left + matching rows from Right. Unmatched → null. Most common: add lookup details to a fact table. `JoinKind.LeftOuter`',
        '**Right Outer** – all rows from Right + matching rows from Left. `JoinKind.RightOuter`',
        '**Full Outer** – all rows from both; nulls where no match. Good for reconciliation. `JoinKind.FullOuter`',
        '**Inner** – only rows that match in both. `JoinKind.Inner`',
        '**Left Anti** – rows in Left with **no** match in Right (e.g. sales with an unknown product). `JoinKind.LeftAnti`',
        '**Right Anti** – rows in Right with **no** match in Left (e.g. products never sold). `JoinKind.RightAnti`',
      ],
      tip: 'Anti joins are the data-quality detective tools: they find orphans and missing records.',
    },
    {
      heading: 'Merge in Power Query or relationship in the model?',
      content:
        `In Power BI you often **do not need** to merge a lookup table into the fact table. A **relationship** in Model view (Product[ProductID] → Sales[ProductID]) lets visuals use Product[Category] with Sales[SalesAmount] without copying columns. This is the **star schema** (Day 16) and is usually smaller and faster.\n\nMerge in Power Query when:\n\n- you need to **flatten** a snowflake (e.g. bring Category name into Product from a Category table),\n- you need a value to **filter or calculate** inside Power Query,\n- you are **checking data quality** (anti joins),\n- the target is a single flat table (e.g. export).`,
    },
  ],
  examples: [
    {
      title: 'Append Sales2023 and Sales2024',
      scenario: 'Sales for each year come in separate files. One file uses "Amount" instead of "SalesAmount".',
      table: {
        headers: ['OrderID', 'OrderDate', 'SalesAmount', 'Amount', 'Note'],
        rows: [
          [901, '2023-12-20', 5000, 'null', 'from Sales2023'],
          [902, '2023-12-28', 7000, 'null', 'from Sales2023'],
          [1001, '2024-01-05', 'null', 110000, 'from Sales2024 (wrong column name)'],
          [1002, '2024-01-06', 'null', 4000, 'from Sales2024 (wrong column name)'],
        ],
      },
      steps: [
        'Import Sales2023.csv and Sales2024.csv as two queries.',
        'Home > Append Queries > Append Queries as New > Two tables. Primary: Sales2023, Table to append: Sales2024. OK.',
        'Look at the result (table above): Amount and SalesAmount are half-null – the names did not match.',
        'Fix: open Sales2024, double-click Amount and rename to SalesAmount.',
        'Return to Append1, rename it Sales, and untick Enable load on Sales2023 and Sales2024.',
      ],
      code: `// Sales2024 query – added step
    #"Renamed Columns" = Table.RenameColumns(#"Changed Type",{{"Amount", "SalesAmount"}})

// Append1 (renamed to Sales)
let
    Source = Table.Combine({Sales2023, Sales2024})
in
    Source`,
      result: 'After the rename, Sales has 3 columns (OrderID, OrderDate, SalesAmount) and 4 rows with no nulls: 901 5000, 902 7000, 1001 110000, 1002 4000.',
      explanation: 'Table.Combine matches columns by name. Making names identical turns two partial columns into one complete column.',
    },
    {
      title: 'All six join types on the same data',
      scenario: 'Sales has an order for P09 (not in Product). Product has P05 Monitor which was never sold.',
      table: {
        headers: ['Join kind', 'Rows', 'Result rows (OrderID – ProductID – Product)'],
        rows: [
          ['Sales (left)', 4, '1001-P01, 1002-P04, 1003-P07, 1004-P09'],
          ['Product (right)', 4, 'P01 Laptop, P04 Mouse, P07 Office Chair, P05 Monitor'],
          ['Left Outer', 4, '1001 Laptop, 1002 Mouse, 1003 Office Chair, 1004 null'],
          ['Right Outer', 4, '1001 Laptop, 1002 Mouse, 1003 Office Chair, null Monitor'],
          ['Full Outer', 5, '1001 Laptop, 1002 Mouse, 1003 Office Chair, 1004 null, null Monitor'],
          ['Inner', 3, '1001 Laptop, 1002 Mouse, 1003 Office Chair'],
          ['Left Anti', 1, '1004 (P09 – product missing)'],
          ['Right Anti', 1, 'P05 Monitor (never sold)'],
        ],
      },
      steps: [
        'Select Sales > Home > Merge Queries > Merge Queries as New.',
        'Top: Sales, click ProductID. Bottom: Product, click ProductID.',
        'Join Kind: choose one of the six. Note the match count message (3 of 4 rows).',
        'OK, then expand the Product column (tick Product, untick prefix).',
        'Repeat with each join kind and compare row counts with the table.',
      ],
      code: `let
    Source = Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftOuter),
    #"Expanded Product" = Table.ExpandTableColumn(Source, "Product", {"Product"}, {"Product"})
in
    #"Expanded Product"
// Change JoinKind.LeftOuter to RightOuter, FullOuter, Inner, LeftAnti or RightAnti to compare`,
      result: 'Row counts 4, 4, 5, 3, 1, 1 exactly as in the table.',
      explanation: 'Only P01, P04 and P07 exist in both tables. Outer joins keep unmatched rows with nulls; inner drops them; anti joins return only the unmatched ones.',
    },
    {
      title: 'Add Category to Sales with a Left Outer merge',
      scenario: 'A flat export for the finance team needs Category next to each sale.',
      table: {
        headers: ['OrderID', 'ProductID', 'SalesAmount', 'Product', 'Category'],
        rows: [
          [1001, 'P01', 110000, 'Laptop', 'Electronics'],
          [1002, 'P04', 4000, 'Mouse', 'Accessories'],
          [1003, 'P07', 12000, 'Office Chair', 'Furniture'],
        ],
      },
      steps: [
        'Select Sales > Home > Merge Queries > Merge Queries as New.',
        'Match Sales[ProductID] with Product[ProductID], Join Kind: Left Outer (all from first, matching from second). OK.',
        'Click the expand icon on the new Product column.',
        'Tick only Product and Category, untick "Use original column name as prefix". OK.',
        'Rename the query SalesFlat.',
      ],
      code: `let
    Source = Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftOuter),
    #"Expanded Product" = Table.ExpandTableColumn(Source, "Product", {"Product", "Category"}, {"Product", "Category"})
in
    #"Expanded Product"`,
      result: 'SalesFlat shows each order with Product and Category columns as in the table.',
      explanation: 'Table.NestedJoin puts the matching Product rows into a nested table; Table.ExpandTableColumn turns selected fields into normal columns.',
    },
    {
      title: 'Find orphan sales with a Left Anti join',
      scenario: 'Visuals show a (Blank) product with sales. Find the orders whose ProductID is not in the Product table.',
      table: {
        headers: ['OrderID', 'ProductID', 'SalesAmount'],
        rows: [
          [1004, 'P09', 3500],
          [1017, 'p02', 900],
        ],
      },
      steps: [
        'Select Sales > Home > Merge Queries > Merge Queries as New.',
        'Match ProductID to Product[ProductID], Join Kind: Left Anti (rows only in first). OK.',
        'Remove the nested Product column (each cell holds an empty table). Rename the query OrphanSales and untick Enable load.',
      ],
      code: `let
    Source = Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftAnti),
    #"Removed Columns" = Table.RemoveColumns(Source,{"Product"})
in
    #"Removed Columns"`,
      result: 'Two orphan orders: P09 does not exist, and "p02" is lowercase so it does not match "P02".',
      explanation: 'Left Anti returns rows with no match. It reveals both truly missing products and dirty keys (case/space problems) to fix with UPPERCASE/Trim.',
    },
    {
      title: 'Merge on two columns: City + Year targets',
      scenario: 'A Targets table has a target per City per Year. Bring the target into a CitySales summary.',
      table: {
        headers: ['City', 'Year', 'SalesAmount', 'Target'],
        rows: [
          ['Pune', 2024, 520000, 500000],
          ['Mumbai', 2024, 760000, 800000],
          ['Nagpur', 2024, 310000, 300000],
        ],
      },
      steps: [
        'Select CitySales > Home > Merge Queries > Merge Queries as New.',
        'In the top table click City, then Ctrl+click Year (headers show 1 and 2).',
        'Choose Targets in the bottom drop-down; click City, then Ctrl+click Year in the same order.',
        'Join Kind: Left Outer. OK.',
        'Expand Targets and tick only Target, untick prefix.',
      ],
      code: `let
    Source = Table.NestedJoin(CitySales, {"City", "Year"}, Targets, {"City", "Year"}, "Targets", JoinKind.LeftOuter),
    #"Expanded Targets" = Table.ExpandTableColumn(Source, "Targets", {"Target"}, {"Target"})
in
    #"Expanded Targets"`,
      result: 'Each City/Year row gets its own Target as in the table.',
      explanation: 'Key lists {"City","Year"} are matched position by position, so the order of selection must be the same in both tables.',
    },
  ],
  interview: [
    { q: 'What is the difference between Append and Merge?', a: 'Append stacks tables vertically (adds rows, like UNION ALL) and matches columns by name. Merge joins tables horizontally on key columns (adds columns, like SQL JOIN or VLOOKUP).', level: 'Easy' },
    { q: 'Explain the join kinds available in Merge Queries.', a: 'Left Outer (all left + matches), Right Outer (all right + matches), Full Outer (all from both), Inner (only matches), Left Anti (left rows without match), Right Anti (right rows without match).', level: 'Easy' },
    { q: 'After appending two tables, a column is half null. Why?', a: 'The column names differ between the tables (e.g. Amount vs SalesAmount, or a case/space difference). Append matches by name, so rename columns to be identical before appending.', level: 'Medium' },
    { q: 'How do you find products that were never sold?', a: 'Merge Product (left) with Sales (right) on ProductID using Left Anti, or Sales left with Product right using Right Anti.', level: 'Medium' },
    { q: 'Merge Queries vs Merge Queries as New?', a: 'Merge Queries adds the join as a step in the selected query. Merge Queries as New creates a separate query and keeps the original queries unchanged, which is cleaner for debugging and reuse.', level: 'Easy' },
    { q: 'Should you merge Product into Sales or create a relationship?', a: 'Usually create a relationship – star schema keeps the fact table narrow and the model efficient. Merge when flattening snowflake dimensions, needing the value inside Power Query, checking data quality or building a single flat output.', level: 'Hard' },
    { q: 'Scenario: a Left Outer merge returns more rows than the left table had. Why?', a: 'The right table has duplicate key values, so each left row matches multiple right rows. Remove duplicates on the key in the lookup table (or fix the source) before merging.', level: 'Hard' },
    { q: 'What M functions are used in a merge?', a: 'Table.NestedJoin creates a nested table column with the join kind (JoinKind.LeftOuter etc.), then Table.ExpandTableColumn expands chosen columns. Table.Join is an alternative that returns a flat join directly.', level: 'Medium' },
    { q: 'What is fuzzy matching in merge?', a: 'An option that matches similar but not identical text using a similarity threshold (0–1), with options like ignore case and a transformation table. Useful for names with typos.', level: 'Medium' },
  ],
  practice: [
    { task: 'Append three city files (SalesPune, SalesMumbai, SalesNagpur) into one query called Sales.', hint: 'Three or more tables option.', solution: 'Home > Append Queries as New > Three or more tables > add all three > OK. M: Table.Combine({SalesPune, SalesMumbai, SalesNagpur}). Disable load on the source queries.' },
    { task: 'In the Power Query Lab, merge the messy sales export with the product lookup table and expand Category.', hint: 'Left Outer on the product column.', solution: 'Merge Queries > match product key > Left Outer > expand Category. M: Table.NestedJoin(...JoinKind.LeftOuter) + Table.ExpandTableColumn.' },
    { task: 'List customers who placed no orders.', hint: 'Customer as left table, Left Anti.', solution: 'Table.NestedJoin(Customer, {"CustomerID"}, Sales, {"CustomerID"}, "Sales", JoinKind.LeftAnti) and remove the nested column.' },
    { task: 'Using the six-join example, predict the row count of a Full Outer join if Product also had P06 Webcam (never sold).', hint: 'Add one more unmatched right row.', solution: '6 rows: 3 matches + 1004 (left only) + P05 + P06 (right only).' },
    { task: 'Fix a merge where "P01 " in Sales does not match "P01" in Product.', hint: 'Clean the key first.', solution: 'Trim (and UPPERCASE) ProductID in both queries before the merge step; then re-check the match count in the Merge dialog.' },
  ],
  quiz: [
    { question: 'Append Queries generates which M function?', options: ['Table.Join', 'Table.NestedJoin', 'Table.Combine', 'Table.Append'], answer: 2, explanation: 'Table.Combine takes a list of tables.' },
    { question: 'Which join returns only rows that exist in both tables?', options: ['Left Outer', 'Inner', 'Full Outer', 'Left Anti'], answer: 1, explanation: 'Inner join keeps matches only.' },
    { question: 'Which join finds sales whose ProductID is missing in Product (Sales is the first table)?', options: ['Left Anti', 'Right Anti', 'Inner', 'Right Outer'], answer: 0, explanation: 'Left Anti returns left rows without a match.' },
    { question: 'Append matches columns by:', options: ['Position', 'Data type', 'Row count', 'Name'], answer: 3, explanation: 'Columns with the same name are stacked together.' },
    { question: 'The default join kind in the Merge dialog is:', options: ['Inner', 'Full Outer', 'Left Outer', 'Right Anti'], answer: 2, explanation: 'Left Outer is the default.' },
  ],
};
