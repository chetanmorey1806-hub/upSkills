export default {
  id: 'dax-basics',
  title: 'DAX Fundamentals',
  level: 'Intermediate',
  day: 6,
  duration: '4 hours',
  summary:
    'DAX (Data Analysis Expressions) is the formula language of Power BI. Learn the difference between calculated columns, measures and calculated tables, DAX syntax and data types, row context vs filter context, core aggregation functions, DIVIDE, IF/SWITCH and format strings.',
  objectives: [
    'Explain what DAX is and where it is used',
    'Choose correctly between calculated column, measure and calculated table',
    'Write DAX with correct syntax, operators and references',
    'Explain row context and filter context with examples',
    'Use SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTBLANK, DISTINCTCOUNT, COUNTROWS, DIVIDE',
    'Write conditional logic with IF, SWITCH and SWITCH(TRUE()) and apply format strings',
  ],
  theory: [
    {
      heading: 'What is DAX?',
      content:
        `**DAX (Data Analysis Expressions)** is a functional formula language used in Power BI, Analysis Services Tabular and Excel Power Pivot. It looks similar to Excel formulas but works on **tables and columns**, not cells.\n\nDAX is used to create:\n\n1. **Measures** – dynamic calculations evaluated at query time (Total Sales, YoY %).\n2. **Calculated columns** – new columns computed row by row at refresh time and stored in the model.\n3. **Calculated tables** – new tables computed at refresh time (Date table, role-playing copies).\n4. **Row-level security** filter expressions, and DAX **queries** (EVALUATE).\n\nThe engine has two parts: the **Formula Engine** (interprets DAX, single-threaded) and the **Storage Engine** (VertiPaq, scans compressed columns, multi-threaded). Writing DAX that pushes work to the storage engine is the basis of performance tuning.`,
    },
    {
      heading: 'Calculated column vs measure vs calculated table',
      content:
        `**Calculated column**\n- Evaluated **row by row** during data refresh, in a **row context**.\n- Stored in the model (uses memory), can be used in slicers, rows/columns of visuals, relationships, filters.\n- Does NOT respond to slicers or filters (the value is fixed after refresh).\n- Example: \`Line Margin = Sales[SalesAmount] - Sales[Cost]\`.\n\n**Measure**\n- Evaluated at **query time** in the **filter context** of each visual cell.\n- Not stored; uses CPU when queried. Responds to slicers, filters, rows/columns.\n- Always returns a single scalar value; must aggregate columns.\n- Example: \`Total Sales = SUM(Sales[SalesAmount])\`.\n\n**Calculated table**\n- Evaluated at refresh, result stored like a normal table.\n- Example: \`Date = CALENDAR(DATE(2022,1,1), DATE(2025,12,31))\`.\n\nRule of thumb: if you want to **slice/filter/group by** it → column (preferably created in Power Query). If you want to **aggregate/calculate a KPI** that changes with filters → measure.`,
      tip: 'Interview gold: "A calculated column is computed at refresh and stored; a measure is computed at query time and depends on filter context."',
    },
    {
      heading: 'DAX syntax, references and operators',
      content:
        `A measure definition: \`Measure Name = expression\`.\n\n- Columns are referenced **fully qualified**: \`Sales[SalesAmount]\`. Table names with spaces or reserved words use single quotes: \`'Date'[Year]\`, \`'Sales Target'[Amount]\`.\n- Measures are referenced **without** the table name: \`[Total Sales]\`. This convention makes it easy to tell measures and columns apart.\n- Strings use double quotes \`"Bulk"\`; comments use \`//\`, \`--\` or \`/* */\`.\n- **Variables**: \`VAR name = expression ... RETURN result\` improve readability and performance (a variable is evaluated once).\n\n**Operators**:`,
      points: [
        'Arithmetic: `+ - * / ^`',
        'Comparison: `= == <> > >= < <=` (`==` is strict equal: BLANK == 0 is FALSE, while BLANK = 0 is TRUE)',
        'Text concatenation: `&`',
        'Logical: `&&` (and), `||` (or), `NOT()`, also functions AND(), OR() with two arguments',
        'Membership: `IN { "A", "B" }` e.g. `Product[Category] IN { "Bikes", "Accessories" }`',
      ],
      syntax: `Profit Margin % =
VAR SalesAmt = [Total Sales]
VAR CostAmt  = SUM ( Sales[Cost] )
RETURN
    DIVIDE ( SalesAmt - CostAmt, SalesAmt )`,
    },
    {
      heading: 'DAX data types and BLANK',
      content:
        `DAX data types: **Whole number** (64-bit integer), **Decimal number** (double), **Fixed decimal / Currency** (4 decimals), **Date/Time**, **Text**, **Boolean (True/False)**, **Variant** (mixed results of measures), and **Blank**.\n\n**BLANK** is DAX's equivalent of NULL. Important behaviours:\n\n- Aggregations ignore blanks; a measure returning BLANK makes the row disappear from most visuals (useful!).\n- BLANK + 5 = 5, BLANK * 5 = BLANK, BLANK = 0 is TRUE, BLANK == 0 is FALSE.\n- Test with \`ISBLANK(x)\`; create with \`BLANK()\`.\n- Division by zero with "/" returns Infinity or NaN (or an error for integers in some contexts) – use **DIVIDE(numerator, denominator, [alternate])** which returns BLANK (or the alternate) when the denominator is 0 or BLANK.\n\nImplicit conversions happen: \`"5" + 3 = 8\`, \`5 & 3 = "53"\`.`,
    },
    {
      heading: 'Implicit vs explicit measures',
      content:
        `**Implicit measures** are created when you drag a numeric column into a visual and Power BI aggregates it automatically (Sum of SalesAmount). The summarization is set in the visual or by the column's *Summarize by* property.\n\n**Explicit measures** are written in DAX: \`Total Sales = SUM(Sales[SalesAmount])\`.\n\nWhy explicit measures are best practice:\n\n- Reusable in other measures (\`Profit = [Total Sales] - [Total Cost]\`).\n- Consistent business logic and formatting in one place.\n- Required for **calculation groups** (implicit measures get disabled when calculation groups exist), and for Analyze in Excel (Excel cannot use implicit measures).\n- Clear naming and descriptions.\n\nAfter creating explicit measures, hide the raw numeric columns. You can also set the model property *Discourage implicit measures*.`,
    },
    {
      heading: 'Row context vs filter context',
      content:
        `These two concepts explain almost every DAX result.\n\n**Row context** means "the current row". It exists:\n- In **calculated columns** (automatically, for each row of the table).\n- Inside **iterator functions** (SUMX, FILTER, ADDCOLUMNS…) for each row they iterate.\n\nIn a row context you can reference a column value directly: \`Sales[Quantity] * Sales[UnitPrice]\`. Row context does **NOT** filter the model by itself – that is why a calculated column \`= SUM(Sales[SalesAmount])\` returns the grand total on every row.\n\n**Filter context** is the set of filters active when a measure is evaluated. It comes from:\n- Rows/columns of a visual (e.g., the cell for Category = "Bikes", Year = 2024),\n- Slicers and the Filters pane (visual, page, report levels),\n- Cross-filtering from other visuals,\n- Row-level security,\n- CALCULATE filter arguments (covered later).\n\nFilters propagate through relationships from dimension to fact. A measure like \`SUM(Sales[SalesAmount])\` sums only the rows visible in the current filter context.\n\n**RELATED** uses the row context to fetch a value from the one side of a relationship (\`RELATED(Product[Category])\` in a Sales calculated column). **RELATEDTABLE** returns the related many-side rows (\`COUNTROWS(RELATEDTABLE(Sales))\` in Product).`,
      tip: 'Turning a row context into a filter context is called context transition – done by CALCULATE (lesson 8).',
    },
    {
      heading: 'Basic aggregation functions',
      content: `All of these aggregate a column over the rows visible in the current filter context:`,
      points: [
        '`SUM(Sales[SalesAmount])` – total of a numeric column.',
        '`AVERAGE(Sales[UnitPrice])` – arithmetic mean (ignores blanks; zeros count).',
        '`MIN(...)` / `MAX(...)` – smallest / largest value (numbers or dates). MIN/MAX can also take two scalars: `MAX(0, [Profit])`.',
        '`COUNT(Sales[OrderID])` – counts non-blank values (numbers, dates, text). `COUNTA` similar for any type, `COUNTBLANK` counts blanks.',
        '`DISTINCTCOUNT(Sales[CustomerID])` – number of distinct values (includes BLANK as a value if present). `DISTINCTCOUNTNOBLANK` excludes blank.',
        '`COUNTROWS(Sales)` – number of rows in a table; preferred for counting fact rows (clearer intent, does not depend on a column\'s blanks).',
        '`DIVIDE(a, b, [alt])` – safe division.',
      ],
    },
    {
      heading: 'Conditional logic and format strings',
      content:
        `**IF(condition, value_if_true, [value_if_false])** – returns BLANK if the false branch is omitted and the condition is false.\n\n**SWITCH(expression, value1, result1, value2, result2, ..., [else])** – compares an expression to a list of values.\n\n**SWITCH(TRUE(), cond1, result1, cond2, result2, ..., else)** – evaluates conditions in order and returns the first true one; cleaner than nested IFs for ranges.\n\n**Formatting**: set the format of a measure in Measure tools → Format (Currency, Percentage, Whole number, decimals, thousands separator), or a custom format string such as \`"#,0"\`, \`"#,0.00"\`, \`"0.0%"\`, \`$#,0.0,,"M"\` (millions; each comma after the last digit placeholder divides by 1,000). The **FORMAT(value, format_string)** function converts a value into **text** – useful for labels but the result is no longer numeric (cannot be summed, sorts alphabetically). **Dynamic format strings** (Format → Dynamic) let one measure change its format using a DAX expression.`,
      syntax: `Customer Tier =
SWITCH (
    TRUE (),
    [Total Sales] >= 100000, "Platinum",
    [Total Sales] >= 50000, "Gold",
    [Total Sales] > 0, "Silver",
    "No Sales"
)`,
    },
  ],
  examples: [
    {
      title: 'Core measures for the sample model',
      scenario: 'Create a reusable base set of measures.',
      code: `Total Sales     = SUM ( Sales[SalesAmount] )
Total Cost      = SUM ( Sales[Cost] )
Total Quantity  = SUM ( Sales[Quantity] )
Profit          = [Total Sales] - [Total Cost]
Profit Margin % = DIVIDE ( [Profit], [Total Sales] )
Order Count     = DISTINCTCOUNT ( Sales[OrderID] )
Sales Lines     = COUNTROWS ( Sales )
Customer Count  = DISTINCTCOUNT ( Sales[CustomerID] )
Avg Order Value = DIVIDE ( [Total Sales], [Order Count] )`,
      explanation:
        'Base measures are built once and reused. Note the difference between Order Count (distinct orders; an order can have several product lines) and Sales Lines (rows). Avg Order Value reuses two measures; DIVIDE avoids errors when there are no orders.',
    },
    {
      title: 'Calculated column vs measure: the classic mistake',
      scenario: 'A beginner writes a calculated column to get total sales and gets the same number on every row.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Col_Total (calc column)'],
        rows: [
          ['1001', '1000', '3700'],
          ['1002', '1200', '3700'],
          ['1003', '1500', '3700'],
        ],
      },
      code: `// Calculated column in Sales (WRONG for this purpose)
Col_Total = SUM ( Sales[SalesAmount] )

// Correct: a measure
Total Sales = SUM ( Sales[SalesAmount] )

// Correct row-level calculated column
Line Margin = Sales[SalesAmount] - Sales[Cost]`,
      explanation:
        'In a calculated column there is a row context but no filter context from the row, so SUM sees the whole table and returns 3700 on every row. A measure is evaluated per visual cell with the proper filter context. Row-level arithmetic (Line Margin) is a valid column use – though Power Query is even better for it.',
    },
    {
      title: 'RELATED in a calculated column',
      scenario: 'Flag sales lines of premium brands where Product[Brand] is "Contoso" or "Fabrikam".',
      code: `Is Premium Brand =
IF (
    RELATED ( Product[Brand] ) IN { "Contoso", "Fabrikam" },
    "Premium",
    "Standard"
)`,
      explanation:
        'Inside the Sales calculated column, the row context lets RELATED follow the many-to-one relationship to Product and fetch the brand of the current row\'s product. RELATED only works from the many side towards the one side.',
    },
    {
      title: 'Price band with SWITCH(TRUE())',
      scenario: 'Create a column on Product to group products into price bands (Product has ListPrice).',
      code: `Price Band =
SWITCH (
    TRUE (),
    Product[ListPrice] < 100, "1. Under 100",
    Product[ListPrice] < 500, "2. 100-499",
    Product[ListPrice] < 1000, "3. 500-999",
    "4. 1000+"
)`,
      explanation:
        'Conditions are evaluated top-down; the first TRUE wins. Prefixing numbers ensures correct alphabetical sorting, or create a separate Price Band Sort column and use Sort by column. Because it is used to slice data, a column (not a measure) is the right choice.',
    },
    {
      title: 'Safe division and BLANK behaviour',
      scenario: 'Show margin % but avoid errors and show nothing for products without sales.',
      code: `Margin % (unsafe) = ( [Total Sales] - [Total Cost] ) / [Total Sales]
-- Returns NaN/Infinity when Total Sales is 0 or blank

Margin % = DIVIDE ( [Total Sales] - [Total Cost], [Total Sales] )
-- Returns BLANK when Total Sales is 0 or BLANK → row hidden in visuals

Margin % or 0 = DIVIDE ( [Total Sales] - [Total Cost], [Total Sales], 0 )
-- Returns 0 instead of BLANK (rows will no longer be hidden!)`,
      explanation:
        'DIVIDE handles zero/blank denominators. Be careful with the alternate result: returning 0 instead of BLANK makes visuals show every product, including those never sold, which can create huge tables and slow reports.',
    },
    {
      title: 'Formatting with FORMAT vs format strings',
      scenario: 'Display total sales in millions on a card with a label.',
      code: `// Keep numeric: set custom format string on the measure (Measure tools → Format → Custom)
Total Sales = SUM ( Sales[SalesAmount] )            -- Format string: $#,0.0,,"M"

// Text label (not numeric any more)
Sales Label = "Sales: " & FORMAT ( [Total Sales], "$#,0.0,,""M""" )

// Good for titles:
Report Title = "Sales report for " & SELECTEDVALUE ( 'Date'[Year], "All Years" )`,
      result: 'Card shows $4.2M; label shows "Sales: $4.2M"',
      explanation:
        'Each comma after the zero divides by 1,000, so ",," shows millions. Inside a DAX string literal, a double quote is written by doubling it (""), so the format string $#,0.0,,"M" becomes "$#,0.0,,""M""" in the FORMAT call. FORMAT returns text, so use it only for labels/titles, not for values that need sorting or further calculation.',
    },
  ],
  interview: [
    {
      q: 'What is DAX? Where is it used?',
      a: `DAX (Data Analysis Expressions) is a functional formula language for tabular models in Power BI, Analysis Services Tabular, and Excel Power Pivot. It is used to define measures, calculated columns, calculated tables, RLS filters, calculation groups items, and to write queries (EVALUATE). It is optimized for working with tables, relationships and filter context rather than cell references.`,
      level: 'Easy',
    },
    {
      q: 'What is the difference between a calculated column and a measure?',
      a: `| | Calculated column | Measure |\n|---|---|---|\n| Evaluated | At refresh, row by row | At query time |\n| Context | Row context | Filter context |\n| Storage | Stored, uses RAM | Not stored, uses CPU |\n| Reacts to slicers | No | Yes |\n| Use in slicers/axes | Yes | No (only values, conditional formatting, filters) |\n\nUse columns for attributes you slice/group by (preferably built in Power Query); use measures for aggregations and KPIs.`,
      level: 'Easy',
    },
    {
      q: 'Explain row context and filter context.',
      a: `**Row context**: awareness of the current row; exists in calculated columns and inside iterators (SUMX, FILTER). Lets you read column values of that row. It does not filter other tables or aggregations.\n\n**Filter context**: the set of filters applied when evaluating a measure – from visual rows/columns, slicers, filters pane, cross-highlighting, RLS and CALCULATE. Filters propagate across relationships (one → many by default).\n\nExample: \`SUM(Sales[SalesAmount])\` in a calculated column returns the grand total on each row (row context ≠ filter), while in a matrix by Category it returns each category's total (filter context).`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between COUNT, COUNTA, COUNTROWS and DISTINCTCOUNT?',
      a: `- **COUNT(col)**: counts non-blank values in a column (numbers, dates, strings).\n- **COUNTA(col)**: counts non-blank values of any type (incl. booleans) – nearly identical to COUNT in modern DAX.\n- **COUNTROWS(table)**: counts rows of a table (or table expression) regardless of blanks; best for counting fact rows.\n- **DISTINCTCOUNT(col)**: number of different values, counting BLANK as one value if present. **DISTINCTCOUNTNOBLANK** ignores blank.\n\nExample: Order Count = DISTINCTCOUNT(Sales[OrderID]) vs line count = COUNTROWS(Sales).`,
      level: 'Easy',
    },
    {
      q: 'Why use DIVIDE instead of the "/" operator?',
      a: `DIVIDE(numerator, denominator, [alternateResult]) returns BLANK (or the alternate result) when the denominator is 0 or BLANK, avoiding Infinity/NaN/errors. It also lets visuals hide rows with no data. "/" is slightly faster when the denominator is guaranteed non-zero (e.g., a constant), so use "/" for dividing by constants like 1000 and DIVIDE for measure denominators.`,
      level: 'Easy',
    },
    {
      q: 'What are implicit and explicit measures? Which should you use?',
      a: `Implicit measures are automatic aggregations created by dragging a numeric column into a visual (Sum of SalesAmount). Explicit measures are defined in DAX.\n\nUse explicit measures: reusable, consistent formatting and logic, required for calculation groups and Analyze in Excel, easier to maintain and document. Hide raw numeric columns and optionally enable "Discourage implicit measures".`,
      level: 'Easy',
    },
    {
      q: 'What is the difference between IF and SWITCH? When would you use SWITCH(TRUE())?',
      a: `IF evaluates one condition with true/false branches; nested IFs get hard to read. SWITCH compares one expression to many values (like CASE in SQL). SWITCH(TRUE(), cond1, res1, cond2, res2, else) evaluates independent conditions in order – ideal for ranges/bands (sales tiers, aging buckets). Both are evaluated lazily for performance in most cases, but SWITCH is more readable.`,
      level: 'Medium',
    },
    {
      q: 'How does BLANK behave in DAX?',
      a: `- BLANK represents missing value (like NULL).\n- Arithmetic: BLANK + 1 = 1, BLANK * 2 = BLANK, BLANK / 2 = BLANK.\n- Comparison: BLANK = 0 → TRUE and BLANK = "" → TRUE; strict \`==\` distinguishes them.\n- Aggregations ignore blanks; AVERAGE ignores blanks (but counts zeros).\n- Measures returning BLANK hide rows in visuals; returning 0 shows them.\n- Test using ISBLANK; COALESCE(x, 0) replaces blank with 0.`,
      level: 'Medium',
    },
    {
      q: 'What are variables in DAX and why use them?',
      a: `VAR defines a named expression evaluated **once**, in the context where it is defined, and RETURN gives the result. Benefits: readability, debugging (RETURN a variable to inspect it), performance (avoid computing the same expression multiple times), and correctness – a variable captures the value in the outer context before CALCULATE changes the filter context (e.g., VAR CurrentPrice = Product[ListPrice] used inside FILTER).\n\nNote: variables are constants – once computed they do not get re-evaluated inside a later CALCULATE.`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between RELATED and RELATEDTABLE?',
      a: `**RELATED(column)** returns a single value from the **one** side of a relationship, used in a row context on the many side (e.g., in Sales: RELATED(Product[Category])).\n\n**RELATEDTABLE(table)** returns the table of related rows on the **many** side, used in a row context on the one side (e.g., in Product: COUNTROWS(RELATEDTABLE(Sales)) = number of sales lines for this product). RELATEDTABLE is a shortcut for CALCULATETABLE(table) and performs context transition.`,
      level: 'Medium',
    },
    {
      q: 'When would you use a calculated table?',
      a: `- Date table: CALENDAR / CALENDARAUTO + ADDCOLUMNS.\n- Role-playing dimension copies (Ship Date = 'Date').\n- Small helper/disconnected tables for parameters (e.g., Top N selector via GENERATESERIES – used by what-if parameters).\n- Pre-aggregated or snapshot tables when the source cannot provide them (SUMMARIZECOLUMNS…).\n- Bridge tables (DISTINCT of a key across tables).\n\nCalculated tables are computed at refresh and do not respond to slicers. If data comes from a source, prefer Power Query.`,
      level: 'Medium',
    },
    {
      q: 'A measure shows the same value for every row in a table visual. What could be wrong?',
      a: `Typical causes:\n1. The field on rows comes from a table that has **no relationship** (or an inactive one) to the fact, so the filter does not propagate.\n2. Relationship **direction** prevents propagation (e.g., filtering a dimension from another dimension through the fact with single direction).\n3. The measure uses **ALL/REMOVEFILTERS** on that table.\n4. The field is from the **many side** and filters need to go to the one side.\n\nCheck the model diagram and relationships, then measure logic.`,
      level: 'Hard',
    },
    {
      q: 'What does FORMAT return and what is the risk of using it in measures?',
      a: `FORMAT returns **text**. Risks: the measure can no longer be used numerically (no sorting by value, no aggregation, charts cannot plot it), and FORMAT never returns BLANK – so FORMAT(BLANK(), "0") returns an empty string, which makes visuals show every row (all combinations) and can drastically slow the report. Prefer format strings on the measure or dynamic format strings; use FORMAT for titles and labels.`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create measures: Total Quantity, Average Unit Price (simple average), Max Order Date, Number of Products Sold (distinct).',
      hint: 'SUM, AVERAGE, MAX, DISTINCTCOUNT.',
      solution: `Total Quantity = SUM ( Sales[Quantity] )
Avg Unit Price = AVERAGE ( Sales[UnitPrice] )
Last Order Date = MAX ( Sales[OrderDate] )
Products Sold = DISTINCTCOUNT ( Sales[ProductID] )`,
    },
    {
      task: 'Add a calculated column in Sales "Order Size" = "Large" if Quantity >= 10, "Medium" if >= 5, else "Small".',
      hint: 'SWITCH(TRUE()).',
      solution: `Order Size =
SWITCH (
    TRUE (),
    Sales[Quantity] >= 10, "Large",
    Sales[Quantity] >= 5, "Medium",
    "Small"
)`,
    },
    {
      task: 'In the Product table, add a calculated column with the number of sales lines for each product and another with total sales amount.',
      hint: 'RELATEDTABLE or CALCULATE for context transition.',
      solution: `Sales Lines = COUNTROWS ( RELATEDTABLE ( Sales ) )
Product Sales = SUMX ( RELATEDTABLE ( Sales ), Sales[SalesAmount] )
-- Alternative: Product Sales = CALCULATE ( SUM ( Sales[SalesAmount] ) )  (context transition)`,
    },
    {
      task: 'Create a measure "Profit Status" returning "Loss" when Profit < 0, "Low" when margin < 10%, otherwise "Healthy". Return BLANK when there are no sales.',
      hint: 'Use variables and ISBLANK.',
      solution: `Profit Status =
VAR SalesAmt = [Total Sales]
VAR Margin = DIVIDE ( [Profit], SalesAmt )
RETURN
    IF (
        ISBLANK ( SalesAmt ),
        BLANK (),
        SWITCH (
            TRUE (),
            [Profit] < 0, "Loss",
            Margin < 0.1, "Low",
            "Healthy"
        )
    )`,
    },
    {
      task: 'Create a measure "Avg Sales per Customer" and make sure it does not error when there are no customers.',
      hint: 'DIVIDE with DISTINCTCOUNT.',
      solution: `Avg Sales per Customer =
DIVIDE ( [Total Sales], DISTINCTCOUNT ( Sales[CustomerID] ) )`,
    },
    {
      task: 'A colleague created this calculated column in Sales to show each line\'s share of sales: Share = Sales[SalesAmount] / SUM(Sales[SalesAmount]). When a Year slicer is applied, the shares no longer add up to 100%. Explain why and fix it.',
      hint: 'When is SUM evaluated in a calculated column, and with which filters?',
      solution:
        'SUM(Sales[SalesAmount]) in a calculated column is evaluated at refresh without any filters, so the denominator is always the all-time grand total. The column gives each line\'s share of the ALL-TIME total and never reacts to slicers. For a dynamic share use a measure:\n\nSales Share % = DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], ALLSELECTED ( Sales ) ) )',
    },
    {
      task: 'Create a dynamic title measure showing "Sales for <Category>" when exactly one category is selected, otherwise "Sales for all categories".',
      hint: 'SELECTEDVALUE with an alternate.',
      solution: `Sales Title =
"Sales for " & SELECTEDVALUE ( Product[Category], "all categories" )
-- Use in visual title: Format → Title → fx → Field value → Sales Title`,
    },
  ],
  quiz: [
    {
      question: 'When is a calculated column evaluated?',
      options: ['Every time a slicer changes', 'At data refresh', 'Only when exported', 'When the report is published'],
      answer: 1,
      explanation: 'Calculated columns are computed at refresh and stored; they do not respond to slicers.',
    },
    {
      question: 'What does DIVIDE(10, 0) return?',
      options: ['0', 'Error', 'BLANK', 'Infinity'],
      answer: 2,
      explanation: 'Without an alternate result, DIVIDE returns BLANK when dividing by zero.',
    },
    {
      question: 'Which function counts the rows of a table?',
      options: ['COUNT', 'COUNTA', 'COUNTROWS', 'DISTINCTCOUNT'],
      answer: 2,
      explanation: 'COUNTROWS takes a table; the others take a column.',
    },
    {
      question: 'How should a measure be referenced inside another measure?',
      options: ['Sales[Total Sales]', '[Total Sales]', "'Total Sales'", 'MEASURE(Total Sales)'],
      answer: 1,
      explanation: 'Best practice: measures without table prefix, columns always with table prefix.',
    },
    {
      question: 'Which context exists automatically in a calculated column?',
      options: ['Filter context', 'Row context', 'Query context', 'No context'],
      answer: 1,
      explanation: 'A calculated column is evaluated row by row in a row context.',
    },
    {
      question: 'What is the result of FORMAT(1234.5, "#,0")?',
      options: ['Number 1235', 'Text "1,235"', 'Text "1,234.5"', 'Number 1,234'],
      answer: 1,
      explanation: 'FORMAT returns text; "#,0" rounds to zero decimals with a thousands separator.',
    },
  ],
};
