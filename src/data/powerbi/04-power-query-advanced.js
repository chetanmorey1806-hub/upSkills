export default {
  id: 'power-query-advanced',
  title: 'Advanced Power Query & M Language',
  level: 'Intermediate',
  day: 4,
  duration: '4 hours',
  summary:
    'Go beyond the ribbon: merge queries with all six join kinds, append, pivot/unpivot, group by, reference vs duplicate, parameters, custom functions, combining files from a folder, the M language (let/in, records, lists, each), query folding and error handling with try/otherwise.',
  objectives: [
    'Merge queries using Left Outer, Right Outer, Full Outer, Inner, Left Anti and Right Anti joins',
    'Append tables and combine all files from a folder',
    'Reshape data with Pivot, Unpivot and Group By',
    'Explain Reference vs Duplicate and build staging queries',
    'Read and write M: let/in, each/_ , lists, records, tables, custom functions',
    'Keep queries foldable and handle errors with try ... otherwise',
  ],
  theory: [
    {
      heading: 'Merge Queries and the six join kinds',
      content:
        `**Merge** (Home → Merge Queries) joins two tables horizontally on one or more matching columns, like SQL JOIN / Excel XLOOKUP. The result is a new column containing a nested **table** per row; you then **Expand** it to choose the columns to bring in.\n\nJoin kinds (left = first table selected, right = second):`,
      points: [
        '**Left Outer** (default) – all rows from left, matching rows from right (nulls where no match). Typical lookup.',
        '**Right Outer** – all rows from right, matching from left.',
        '**Full Outer** – all rows from both sides.',
        '**Inner** – only rows that match in both.',
        '**Left Anti** – rows in left with NO match in right (e.g., sales with unknown product).',
        '**Right Anti** – rows in right with NO match in left (e.g., products never sold).',
      ],
      syntax: `Table.NestedJoin(LeftTable, {"Key"}, RightTable, {"Key"}, "NewColumnName", JoinKind.LeftOuter)`,
      tip: 'Fuzzy matching (Use fuzzy matching to perform the merge) matches similar text with a similarity threshold (0–1) – useful for messy names, but it does not fold and is slower. Also, merging on multiple columns: Ctrl+click the columns in the same order in both tables.',
    },
    {
      heading: 'Append Queries and combining files from a folder',
      content:
        `**Append** stacks tables vertically (SQL UNION ALL). Columns are matched by **name**, not position; a column missing in one table is filled with null. Use **Append Queries** (modifies current query) or **Append Queries as New**.\n\n**Folder connector**: Get Data → Folder (or SharePoint Folder) lists every file with its Content (binary), Name, Extension, Date modified, Folder Path. Click **Combine & Transform**: Power Query creates helper queries – a *Sample File*, a *Parameter*, a *Transform Sample File* query and a *Transform File* **function** – and invokes the function for every file, then expands the results. Any cleaning applied to *Transform Sample File* is automatically applied to all files. New files dropped in the folder are picked up on the next refresh.`,
      tip: 'Filter the folder by Extension (e.g., ".csv") and exclude temp files (Name does not start with "~$") before combining, otherwise one bad file breaks the refresh.',
    },
    {
      heading: 'Pivot, Unpivot and Group By',
      content:
        `**Unpivot** turns columns into rows – it converts a "wide" cross-tab (Jan, Feb, Mar columns) into a "long" table (Month, Value). This is the most important reshaping skill because Power BI models work best with long, narrow tables. Prefer **Unpivot Other Columns** (select ID columns, unpivot the rest) so new month columns are handled automatically.\n\n**Pivot Column** is the reverse: turns values of one column into column headers, with an aggregation (Sum, Count, Don't Aggregate…).\n\n**Group By** (Transform → Group By) aggregates rows: Basic (one grouping column, one aggregation) or Advanced (multiple group columns and aggregations: Sum, Average, Median, Min, Max, Count Rows, Count Distinct Rows, **All Rows**). "All Rows" keeps the nested table per group, enabling advanced patterns like Top-N per group or index within group.`,
      syntax: `Table.UnpivotOtherColumns(Source, {"ProductID"}, "Month", "Sales")
Table.Pivot(Source, List.Distinct(Source[Month]), "Month", "Sales", List.Sum)
Table.Group(Source, {"CustomerID"}, {{"Total Sales", each List.Sum([SalesAmount]), type number}, {"Orders", each Table.RowCount(_), Int64.Type}})`,
    },
    {
      heading: 'Reference vs Duplicate, staging queries',
      content:
        `Right-click a query:\n\n- **Duplicate** copies ALL the M steps into a new independent query. Changing the original does not affect the copy. The source is queried separately.\n- **Reference** creates a new query whose source is the output of the original (\`Source = Sales_Staging\`). Changes in the original flow into the referencing query.\n\nPattern: create a **staging** query (connect + basic cleaning, Enable load OFF), then reference it for several outputs (e.g., Sales fact and a Customer dimension extracted from the same flat file). This avoids repeating logic.\n\nNote: referencing does not guarantee the source is read only once – in Power BI Desktop each loaded query evaluates its chain independently (caching may help). For true reuse across models, use **Dataflows**.`,
      tip: 'Interview phrase: "Duplicate = copy of the steps; Reference = pointer to the result of another query."',
    },
    {
      heading: 'M language fundamentals',
      content:
        `M is a functional, **case-sensitive**, lazily evaluated language. A query is usually a **let** expression: a list of named steps, and an **in** clause that returns the final value.\n\nCore value types:\n\n- **Primitive**: number, text ("hello"), logical (true/false), null, date (#date(2024,1,31)), datetime (#datetime(2024,1,31,10,0,0)), duration (#duration(1,0,0,0)).\n- **List**: \`{1, 2, 3}\`, \`{1..10}\`. Access item: \`MyList{0}\` (0-based).\n- **Record**: \`[Name = "Pen", Price = 10]\`. Access field: \`MyRecord[Price]\`.\n- **Table**: access a column as list \`Sales[Quantity]\`, a row as record \`Sales{0}\`, a cell \`Sales{0}[Quantity]\`, a row by key \`Source{[Item="Sales"]}\`.\n- **Function**: \`(x) => x * 2\`.\n\n**each** is shorthand for a one-parameter function: \`each [Quantity] * 2\` equals \`(_) => _[Quantity] * 2\`. The underscore \`_\` refers to the current row (or item).\n\nStep names with spaces are written \`#"Changed Type"\`. Comments use \`//\` or \`/* */\`. Operators: \`&\` concatenates text/lists/records, \`and/or/not\`, \`<>\` not equal, \`??\` coalesce (null fallback).`,
      syntax: `let
    Source = ...,
    Step2 = Transform(Source),
    #"Step with spaces" = Transform2(Step2)
in
    #"Step with spaces"`,
    },
    {
      heading: 'Parameters and custom functions',
      content:
        `**Parameters** (Manage Parameters) are named values (text, number, date, list) used in queries – server names, file paths, thresholds, RangeStart/RangeEnd.\n\n**Custom functions** encapsulate repeated logic. Create a blank query and write a function expression, or convert a query to a function: right-click → **Create Function** (based on parameters). Invoke via Add Column → **Invoke Custom Function** or directly in M.\n\nFunctions can have typed parameters, optional parameters and return types: \`(price as number, optional rate as nullable number) as number => ...\`.`,
      syntax: `// Query named fnNetPrice
(price as number, optional discountRate as nullable number) as number =>
let
    rate = if discountRate = null then 0 else discountRate,
    result = price * (1 - rate)
in
    result`,
    },
    {
      heading: 'Query folding in depth',
      content:
        `When the source is a database (or OData, some other connectors), Power Query tries to **fold** steps into one native query. Folding stops at the first step that cannot be translated; everything afterwards runs in the local mashup engine.\n\nUsually fold: Select/Remove columns, Rename, Filter rows, Sort, Group By, Merge/Append within the **same** database, Pivot/Unpivot (often), basic text and date functions that have SQL equivalents, Keep top rows.\n\nUsually break: Index column, Table.Buffer, Merge with a different source (privacy levels), Fill Down, Changed Type with locale, Column from Examples with complex logic, custom functions using unsupported M, starting from a **custom SQL statement** typed in the connector (later steps generally do not fold unless using Value.NativeQuery with EnableFolding=true).\n\nCheck with **View Native Query**, **step folding indicators** (in Power Query Online / Fabric), or **Query Diagnostics**.`,
      tip: 'Incremental refresh and DirectQuery need folding. Typing a native SQL query in the Source step disables folding for the rest of the query by default.',
    },
    {
      heading: 'Error handling: try ... otherwise and error types',
      content:
        `Errors in Power Query are either **step-level** (the whole query fails, e.g., file not found, column missing) or **cell-level** (individual cells show Error, e.g., text "abc" converted to number).\n\nCell-level tools: Remove Errors, Replace Errors, Keep Errors.\n\nIn M, \`try expression otherwise fallback\` returns the fallback when the expression errors. Without otherwise, \`try\` returns a record \`[HasError = true/false, Value = ..., Error = [Reason, Message, Detail]]\`, which you can inspect to log error messages.\n\nYou can raise your own errors with \`error "message"\` or \`error Error.Record("Reason", "Message")\`.`,
      syntax: `= Table.AddColumn(Source, "Qty Clean", each try Number.From([Quantity]) otherwise 0, Int64.Type)`,
      tip: 'Do not silently replace all errors with 0 in financial data – log them (try without otherwise → expand Error record) so data quality issues are visible.',
    },
  ],
  examples: [
    {
      title: 'Lookup Product Category into Sales (Left Outer)',
      scenario: 'Bring Category from Product into a staging Sales table (for a flat export).',
      code: `let
    Source = Sales,
    Merged = Table.NestedJoin(Source, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftOuter),
    Expanded = Table.ExpandTableColumn(Merged, "Product", {"ProductName", "Category"}, {"ProductName", "Category"})
in
    Expanded`,
      explanation:
        'Every Sales row is kept; unmatched ProductIDs get null in ProductName/Category. In a star schema you normally keep Product as a separate dimension with a relationship instead of merging, but merging is useful for flat exports or building dimensions.',
    },
    {
      title: 'Find data quality issues with Anti joins',
      scenario: 'Find sales rows whose ProductID is missing from the Product table, and products never sold.',
      code: `// Orphan sales (exist in Sales, not in Product)
OrphanSales = Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "P", JoinKind.LeftAnti),
OrphanSalesClean = Table.RemoveColumns(OrphanSales, {"P"}),

// Products never sold (exist in Product, not in Sales)
UnsoldProducts = Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, "P", JoinKind.RightAnti),
UnsoldList = Table.ExpandTableColumn(UnsoldProducts, "P", {"ProductID", "ProductName"}, {"UnsoldProductID", "UnsoldProductName"})`,
      explanation:
        'Left Anti returns left rows with no match. Right Anti returns right rows with no match – note the left columns will be null, so you expand the nested right table to see the products. Orphan sales would appear under a "(Blank)" member in visuals, so it is good practice to detect and fix them.',
    },
    {
      title: 'Unpivot a monthly budget sheet',
      scenario: 'Finance gives a budget with one column per month. Convert it to a long table for the model.',
      table: {
        headers: ['ProductID', 'Jan-2024', 'Feb-2024', 'Mar-2024'],
        rows: [
          ['P01', '1000', '1200', '900'],
          ['P02', '500', '650', '700'],
        ],
      },
      code: `let
    Source = Excel.Workbook(File.Contents("C:\\Data\\Budget.xlsx"), null, true),
    Budget = Source{[Item = "Budget", Kind = "Sheet"]}[Data],
    Promoted = Table.PromoteHeaders(Budget, [PromoteAllScalars = true]),
    Unpivoted = Table.UnpivotOtherColumns(Promoted, {"ProductID"}, "MonthText", "BudgetAmount"),
    AddedMonthStart = Table.AddColumn(Unpivoted, "MonthStart", each Date.FromText("01-" & [MonthText], [Format = "dd-MMM-yyyy", Culture = "en-US"]), type date),
    Typed = Table.TransformColumnTypes(AddedMonthStart, {{"BudgetAmount", Currency.Type}}),
    Final = Table.RemoveColumns(Typed, {"MonthText"})
in
    Final`,
      result: '6 rows: ProductID, BudgetAmount, MonthStart (2024-01-01, 2024-02-01, ...)',
      explanation:
        'Unpivot Other Columns keeps ProductID and turns all other columns into Attribute/Value pairs, so next year\'s new month columns are handled automatically. The month text is converted to a real date (first day of month) so it can relate to the Date table.',
    },
    {
      title: 'Group By customer with All Rows to get the latest order',
      scenario: 'For each customer, get total sales, number of orders and the date of last order.',
      code: `= Table.Group(
    Sales,
    {"CustomerID"},
    {
        {"Total Sales", each List.Sum([SalesAmount]), type number},
        {"Order Count", each List.Count(List.Distinct([OrderID])), Int64.Type},
        {"Last Order Date", each List.Max([OrderDate]), type date}
    }
)`,
      explanation:
        'Inside each aggregation, _ is the sub-table of rows for one customer, so [SalesAmount] is a list of that customer\'s amounts. List.Distinct counts orders, not lines. Against SQL sources this Group By folds into GROUP BY.',
    },
    {
      title: 'Combine all monthly CSV files from a folder',
      scenario: 'Each month a new Sales_YYYY_MM.csv file lands in a folder. Load them all as one table, with the file name as a column.',
      code: `let
    Source = Folder.Files("C:\\Data\\SalesMonthly"),
    CsvOnly = Table.SelectRows(Source, each [Extension] = ".csv" and not Text.StartsWith([Name], "~$")),
    Parsed = Table.AddColumn(CsvOnly, "Data", each
        Table.PromoteHeaders(
            Csv.Document([Content], [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
            [PromoteAllScalars = true]
        )
    ),
    KeepCols = Table.SelectColumns(Parsed, {"Name", "Data"}),
    Expanded = Table.ExpandTableColumn(KeepCols, "Data",
        {"OrderID", "OrderDate", "CustomerID", "ProductID", "Quantity", "UnitPrice", "SalesAmount", "Cost"}),
    Typed = Table.TransformColumnTypes(Expanded, {
        {"OrderID", Int64.Type}, {"OrderDate", type date}, {"Quantity", Int64.Type},
        {"UnitPrice", Currency.Type}, {"SalesAmount", Currency.Type}, {"Cost", Currency.Type}
    })
in
    Typed`,
      explanation:
        'This hand-written version is what the Combine Files wizard generates in a more compact form. Each file binary is parsed with Csv.Document, headers promoted, then all nested tables are expanded into one. Keeping the Name column lets you trace rows back to files. For SharePoint use SharePoint.Files(siteUrl, [ApiVersion = 15]) to avoid a gateway.',
    },
    {
      title: 'Custom function to clean phone numbers and invoke it',
      scenario: 'Phone numbers come as "(555) 123-4567", "555.123.4567" etc. Keep digits only.',
      code: `// Query: fnDigitsOnly
(input as nullable text) as nullable text =>
    if input = null then null
    else Text.Select(input, {"0".."9"})

// Using it in the Customer query:
= Table.TransformColumns(Customer, {{"Phone", fnDigitsOnly, type text}})`,
      result: '"(555) 123-4567" → "5551234567"',
      explanation:
        'Text.Select keeps only characters in the list; {"0".."9"} is a character range list. Typing parameters and the return as nullable avoids errors on blanks. The function is reusable in any query in the file.',
    },
    {
      title: 'try ... otherwise and logging errors',
      scenario: 'Quantity column has some text values like "two". Convert safely and keep an error message for auditing.',
      code: `let
    Source = Sales_Raw,
    WithTry = Table.AddColumn(Source, "QtyTry", each try Number.From([Quantity])),
    QtyClean = Table.AddColumn(WithTry, "QuantityClean", each if [QtyTry][HasError] then null else [QtyTry][Value], type number),
    QtyError = Table.AddColumn(QtyClean, "QuantityError", each if [QtyTry][HasError] then [QtyTry][Error][Message] else null, type text),
    Final = Table.RemoveColumns(QtyError, {"QtyTry"})
in
    Final`,
      explanation:
        'try without otherwise returns a record with HasError, Value or Error. We read the fields to produce a clean value and an error message column. A simpler version is: each try Number.From([Quantity]) otherwise null.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Merge and Append?',
      a: `**Merge** combines tables **horizontally** based on matching key columns (like SQL JOIN / VLOOKUP) – adds columns. **Append** combines tables **vertically** (like SQL UNION ALL) – adds rows; columns are matched by name, and missing columns get null.`,
      level: 'Easy',
    },
    {
      q: 'Explain all the join kinds available in Merge Queries.',
      a: `- **Left Outer**: all left rows + matches from right.\n- **Right Outer**: all right rows + matches from left.\n- **Full Outer**: all rows from both.\n- **Inner**: only matching rows.\n- **Left Anti**: left rows without a match (find orphans).\n- **Right Anti**: right rows without a match.\n\nUse cases: Left Outer for lookups, Inner to restrict to valid records, Anti joins for data quality checks (e.g., sales with unknown customers, products never sold).`,
      level: 'Medium',
    },
    {
      q: 'Reference vs Duplicate – what is the difference?',
      a: `**Duplicate** copies all steps into an independent query – later changes to the original do not affect it. **Reference** creates a query whose first step points to the output of the original; changes to the original propagate.\n\nUse Reference for staging patterns (one cleaned base query feeding many outputs). Use Duplicate when you want to experiment or branch logic independently.`,
      level: 'Easy',
    },
    {
      q: 'What is unpivoting and why is it important for Power BI?',
      a: `Unpivot transforms columns into attribute-value rows (wide → long). Power BI's engine and DAX work best with long, narrow tables: one column per attribute (Month) and one per value (Amount). With wide tables you cannot slice by month, relate to a Date table, or write a single measure – you would need one measure per column.\n\nPrefer **Unpivot Other Columns** (select the fixed ID columns) so newly added columns (new months) are automatically unpivoted on refresh.`,
      level: 'Medium',
    },
    {
      q: 'Explain the structure of an M query.',
      a: `A query is typically a \`let ... in ...\` expression. Inside \`let\` are comma-separated named steps (variables), each usually referencing the previous step. The \`in\` clause returns the final value (normally the last step). M is case-sensitive, functional and lazily evaluated – steps not needed by the result are not evaluated.\n\n\`\`\`\nlet\n    Source = Sql.Database("srv", "db"),\n    Sales = Source{[Schema="dbo", Item="Sales"]}[Data],\n    Filtered = Table.SelectRows(Sales, each [Quantity] > 0)\nin\n    Filtered\n\`\`\``,
      level: 'Medium',
    },
    {
      q: 'What does "each" and "_" mean in M?',
      a: `\`each\` is syntactic sugar for a function with one parameter named \`_\`. \`each [Quantity] > 0\` is the same as \`(_) => _[Quantity] > 0\`. In Table.SelectRows or Table.AddColumn, \`_\` is the current row (record), and \`[Quantity]\` is shorthand for \`_[Quantity]\`. In List functions, \`_\` is the current list item: \`List.Transform({1,2,3}, each _ * 10)\`.`,
      level: 'Medium',
    },
    {
      q: 'How do you combine multiple files from a folder? What happens when a new file is added?',
      a: `Get Data → Folder (or SharePoint Folder) → Combine & Transform. Power Query creates a Sample File, a Parameter, a Transform Sample File query and a Transform File function, invokes the function on each file's binary and expands the result.\n\nWhen a new file with the same structure is dropped in the folder, it is included automatically on the next refresh. Best practices: filter by extension, exclude temp/hidden files, keep the file name column for lineage, ensure consistent headers (otherwise columns become null).`,
      level: 'Medium',
    },
    {
      q: 'How do you create and use a custom function in Power Query?',
      a: `Create a blank query with a function expression, e.g.\n\n\`(price as number, rate as number) as number => price * (1 - rate)\`\n\nor build a query using parameters and right-click → Create Function. Invoke it with Add Column → Invoke Custom Function, or in M: \`Table.AddColumn(Sales, "Net", each fnNet([UnitPrice], 0.1))\`.\n\nUse cases: cleaning logic reused across columns/queries, calling a paged API (one call per page), the Combine Files pattern.`,
      level: 'Medium',
    },
    {
      q: 'Which transformations break query folding and how do you work around it?',
      a: `Common folding breakers: Index column, Table.Buffer, Fill Down/Up, merging with a different source, some text functions and type changes using locale, custom functions, typing a native SQL statement in the Source step.\n\nWorkarounds: place foldable steps (filters, column selection, joins) first; push complex logic into a SQL view or Dataflow; use Value.NativeQuery with \`[EnableFolding = true]\` for native SQL; avoid unnecessary type conversions before filtering; verify with View Native Query or Query Diagnostics.`,
      level: 'Hard',
    },
    {
      q: 'How do you handle errors in Power Query?',
      a: `- UI: **Remove Errors**, **Replace Errors**, **Keep Errors** (to investigate).\n- M: \`try expr otherwise fallback\`; \`try expr\` returns a record with HasError, Value, Error (Reason, Message, Detail) – useful to log errors in a column.\n- Raise custom errors: \`error "Invalid file"\`.\n- Prevent errors: correct data types with locale, null handling (\`??\` operator), filtering bad rows.\n- Step-level errors (missing column/file) can be made robust with \`MissingField.Ignore\` in Table.SelectColumns/RemoveColumns or by checking \`Table.HasColumns\`.`,
      level: 'Medium',
    },
    {
      q: 'What are privacy levels and why can they affect merges?',
      a: `Privacy levels (Private, Organizational, Public, None) control whether Power Query may send data from one source to another during evaluation (e.g., folding a filter list from an Excel file into a SQL query). When combining sources with incompatible levels, Power Query isolates them ("Formula.Firewall" error) or evaluates them locally, which can break folding and slow refresh.\n\nFix: set correct privacy levels in Data source settings, restructure queries (staging queries), or (in Desktop only, for trusted data) ignore privacy levels in Options.`,
      level: 'Hard',
    },
    {
      q: 'How would you get the Top 3 products by sales within each category in Power Query?',
      a: `Group By Category with an **All Rows** aggregation, then transform the nested table:\n\n\`\`\`\nGrouped = Table.Group(ProductSales, {"Category"}, {{"Rows", each _, type table}}),\nTop3 = Table.TransformColumns(Grouped, {{"Rows", each Table.FirstN(Table.Sort(_, {{"SalesAmount", Order.Descending}}), 3)}}),\nExpanded = Table.ExpandTableColumn(Top3, "Rows", {"ProductName", "SalesAmount"})\n\`\`\`\n\nNote: if the Top N must react to slicers (date range), do it in DAX with TOPN/RANKX instead, because Power Query results are static after refresh.`,
      level: 'Hard',
    },
    {
      q: 'What is the difference between Table.Group "Count Rows" and "Count Distinct Rows"?',
      a: `Count Rows (\`Table.RowCount(_)\`) counts all rows in the group. Count Distinct Rows (\`Table.RowCount(Table.Distinct(_))\`) counts distinct complete rows in the group. To count distinct values of ONE column (e.g., distinct orders), use \`List.Count(List.Distinct([OrderID]))\` (Advanced → custom), since Sales lines may share OrderIDs.`,
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Append three tables Sales2022, Sales2023, Sales2024 (same columns) into one query AllSales.',
      hint: 'Append Queries as New → Three or more tables.',
      solution: `let
    Source = Table.Combine({Sales2022, Sales2023, Sales2024})
in
    Source`,
    },
    {
      task: 'Find customers who never placed an order.',
      hint: 'Customer is the left table; which anti join?',
      solution: `let
    Joined = Table.NestedJoin(Customer, {"CustomerID"}, Sales, {"CustomerID"}, "S", JoinKind.LeftAnti),
    Result = Table.RemoveColumns(Joined, {"S"})
in
    Result`,
    },
    {
      task: 'A table has columns Region, Q1, Q2, Q3, Q4. Convert it to Region, Quarter, Sales.',
      hint: 'Select Region → Unpivot Other Columns.',
      solution: `= Table.UnpivotOtherColumns(Source, {"Region"}, "Quarter", "Sales")`,
    },
    {
      task: 'Using Group By, create a table with ProductID, Total Quantity, Total Sales and Average Unit Price.',
      hint: 'Advanced Group By with three aggregations.',
      solution: `= Table.Group(Sales, {"ProductID"}, {
    {"Total Quantity", each List.Sum([Quantity]), Int64.Type},
    {"Total Sales", each List.Sum([SalesAmount]), Currency.Type},
    {"Avg Unit Price", each List.Average([UnitPrice]), type number}
})`,
    },
    {
      task: 'Write a custom function fnFiscalYear(d as date) that returns the fiscal year label "FY2025" for a fiscal year starting 1 April (e.g., 15-May-2024 → FY2025, 10-Feb-2024 → FY2024).',
      hint: 'If month >= 4 then year + 1 else year.',
      solution: `(d as date) as text =>
let
    fy = if Date.Month(d) >= 4 then Date.Year(d) + 1 else Date.Year(d)
in
    "FY" & Text.From(fy)

// Invoke: Table.AddColumn(Sales, "Fiscal Year", each fnFiscalYear([OrderDate]), type text)`,
    },
    {
      task: 'UnitPrice arrives as text with values like "12.5", "N/A", "". Create a numeric column where invalid values become null.',
      hint: 'try ... otherwise with Number.From and a culture.',
      solution: `= Table.AddColumn(Source, "UnitPriceNum",
    each try Number.From([UnitPrice], "en-US") otherwise null,
    type nullable number)
// "N/A" (and empty text) cannot be converted, so the error is caught and null is returned.`,
    },
    {
      task: 'Create a staging query from a flat file SalesFlat (OrderID, OrderDate, CustomerID, CustomerName, City, ProductID, ProductName, Category, Quantity, UnitPrice) and derive a Customer dimension and a Sales fact from it.',
      hint: 'Disable load on staging; Reference it twice.',
      solution: `// SalesFlat_Staging: Source + types, Enable load = off
// Customer (Reference):
let
    Source = SalesFlat_Staging,
    Cols = Table.SelectColumns(Source, {"CustomerID", "CustomerName", "City"}),
    Distinct = Table.Distinct(Cols, {"CustomerID"})
in
    Distinct
// Product (Reference) similarly with ProductID, ProductName, Category
// Sales (Reference):
let
    Source = SalesFlat_Staging,
    Cols = Table.SelectColumns(Source, {"OrderID", "OrderDate", "CustomerID", "ProductID", "Quantity", "UnitPrice"}),
    AddAmount = Table.AddColumn(Cols, "SalesAmount", each [Quantity] * [UnitPrice], Currency.Type)
in
    AddAmount`,
    },
  ],
  quiz: [
    {
      question: 'Which join kind returns only rows from the first table that have NO match in the second table?',
      options: ['Inner', 'Left Outer', 'Left Anti', 'Right Anti'],
      answer: 2,
      explanation: 'Left Anti returns left-table rows without a matching key in the right table.',
    },
    {
      question: 'Append Queries matches columns by:',
      options: ['Position', 'Column name', 'Data type', 'Index column'],
      answer: 1,
      explanation: 'Append matches by column name; columns not present in a table are filled with null.',
    },
    {
      question: 'In M, "each [Quantity] * 2" is equivalent to:',
      options: ['(x) => Quantity * 2', '(_) => _[Quantity] * 2', 'Quantity => * 2', 'List.Transform(Quantity, 2)'],
      answer: 1,
      explanation: 'each defines a single-parameter function with parameter _, and [Quantity] means _[Quantity].',
    },
    {
      question: 'What does "Reference" do when you right-click a query?',
      options: [
        'Copies all steps into an independent query',
        'Creates a new query whose source is the output of the original query',
        'Creates a relationship between queries',
        'Exports the query to a template',
      ],
      answer: 1,
      explanation: 'A referencing query starts with Source = OriginalQuery, so changes upstream propagate.',
    },
    {
      question: 'Which of these steps typically breaks query folding on SQL Server?',
      options: ['Table.SelectRows filter', 'Table.SelectColumns', 'Table.Group', 'Table.Buffer'],
      answer: 3,
      explanation: 'Table.Buffer loads the table into memory locally, so subsequent steps cannot fold.',
    },
    {
      question: 'What does "try Number.From([Qty]) otherwise 0" return when [Qty] = "abc"?',
      options: ['An error', 'null', '0', '"abc"'],
      answer: 2,
      explanation: 'Number.From("abc") raises an error; try ... otherwise catches it and returns the fallback 0.',
    },
  ],
};
