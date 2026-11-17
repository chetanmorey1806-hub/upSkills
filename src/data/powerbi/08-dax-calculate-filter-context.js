export default {
  id: 'dax-calculate-filter-context',
  title: 'CALCULATE & Filter Context',
  level: 'Advanced',
  day: 8,
  duration: '5 hours',
  summary:
    'CALCULATE is the most important DAX function: it evaluates an expression in a modified filter context. Master filter arguments, FILTER, ALL, ALLEXCEPT, ALLSELECTED, REMOVEFILTERS, KEEPFILTERS, VALUES, SELECTEDVALUE, HASONEVALUE, context transition and percentage-of-total patterns.',
  objectives: [
    'Explain exactly how CALCULATE modifies the filter context',
    'Write boolean and table filter arguments, and know when FILTER is required',
    'Remove filters with ALL, ALLEXCEPT, REMOVEFILTERS and use ALLSELECTED for visual totals',
    'Intersect filters with KEEPFILTERS',
    'Use VALUES, SELECTEDVALUE, HASONEVALUE and ISINSCOPE to read the filter context',
    'Explain context transition and build % of total / % of category measures',
  ],
  theory: [
    {
      heading: 'CALCULATE semantics',
      content:
        `\`CALCULATE(<expression>, <filter1>, <filter2>, ...)\` evaluates the expression in a **new filter context** built from the current one plus the filter arguments.\n\nThe evaluation steps (simplified but interview-accurate):\n\n1. Take the **current filter context** (from the visual, slicers, outer CALCULATE…).\n2. If called in a **row context**, perform **context transition**: convert the current row into equivalent filters.\n3. Evaluate the filter arguments **in the original context** (not the modified one).\n4. Apply **modifiers** (ALL/REMOVEFILTERS, USERELATIONSHIP, CROSSFILTER, KEEPFILTERS).\n5. Each filter argument **overrides** (replaces) any existing filter on the **same columns**; filters on other columns are kept. Multiple filter arguments are combined with **AND**.\n6. Evaluate the expression in the resulting filter context.\n\nCALCULATETABLE works identically but returns a table.`,
      syntax: `CALCULATE ( <expression> [, <filter1> [, <filter2> [, ...]]] )`,
      tip: 'Key phrase: "Filter arguments in CALCULATE override existing filters on the same column(s), unless wrapped in KEEPFILTERS."',
    },
    {
      heading: 'Filter arguments: boolean predicates and tables',
      content:
        `**Boolean (simple) filters** compare a single column with a constant or measure-free expression:\n\n\`CALCULATE([Total Sales], Product[Category] = "Bikes")\`\n\nInternally, DAX rewrites it as a table filter:\n\n\`CALCULATE([Total Sales], FILTER(ALL(Product[Category]), Product[Category] = "Bikes"))\`\n\nThat is why it **overrides** any existing filter on Category – a matrix row for "Clothing" will still show Bikes sales.\n\nMultiple conditions:\n- Different arguments = AND: \`Product[Category] = "Bikes", Customer[Country] = "India"\`\n- OR on the same column: \`Product[Category] IN {"Bikes", "Clothing"}\` or \`Product[Category] = "Bikes" || Product[Category] = "Clothing"\`\n- Boolean predicates may reference **multiple columns of the same table** (\`Sales[Quantity] * Sales[UnitPrice] > 1000\`), but they **cannot reference measures**, use aggregation functions or columns from different tables. Compute such a value in a variable first (\`VAR Threshold = [Avg Order Value]\`) or use FILTER.\n\n**Table filters**: any table expression, e.g. \`FILTER(...)\`, \`VALUES(...)\`, \`ALL(...)\`, \`DATESYTD(...)\`, \`TREATAS(...)\`. The table's columns become filters.`,
    },
    {
      heading: 'FILTER – when you need it',
      content:
        `\`FILTER(<table>, <condition>)\` is an iterator that returns the rows of a table satisfying a condition. In CALCULATE you need FILTER when:\n\n- The condition uses a **measure**: \`FILTER(VALUES(Customer[CustomerID]), [Total Sales] > 10000)\`.\n- The condition must respect the existing filter (FILTER over VALUES/the column keeps the current context, unlike a boolean predicate).\n- Complex logic across columns of different tables (prefer separate filters where possible).\n\n**Best practice**: filter **columns**, not whole tables. \`FILTER(Sales, Sales[Quantity] > 5)\` iterates the entire fact table and uses the **expanded table** (all related dimension columns) as a filter, which is slow and can produce surprising results. Prefer \`Sales[Quantity] > 5\` or \`KEEPFILTERS(Sales[Quantity] > 5)\`.`,
      syntax: `Big Customers Sales =
CALCULATE (
    [Total Sales],
    FILTER ( VALUES ( Customer[CustomerID] ), [Total Sales] > 10000 )
)`,
    },
    {
      heading: 'Removing filters: ALL, REMOVEFILTERS, ALLEXCEPT, ALLNOBLANKROW',
      content:
        `- **ALL(table)** – removes all filters from the table (and returns all its rows when used as a table). **ALL(column1, column2…)** – removes filters from those columns; returns their distinct combinations.\n- **REMOVEFILTERS(table or columns)** – same as ALL used as a CALCULATE modifier, but cannot be used as a table expression. More readable intent.\n- **ALLEXCEPT(table, col1, col2…)** – removes all filters from the table **except** those on the listed columns. E.g., % within category: \`ALLEXCEPT(Product, Product[Category])\`.\n- **ALLNOBLANKROW** – like ALL but excludes the virtual blank row of unmatched keys.\n\nRemember **expanded tables**: the expanded version of Sales includes the columns of every table on the one side of its relationships (Product, Customer, 'Date'). Therefore \`REMOVEFILTERS(Sales)\` / \`ALL(Sales)\` also removes filters coming from those dimensions, while \`REMOVEFILTERS(Product)\` removes only Product filters. Be explicit and remove filters from the dimension (or columns) you actually mean.`,
      tip: 'ALLEXCEPT keeps the filter only if it is on the listed columns of THAT table. A filter coming from another table (e.g., a Date slicer) is not affected when you use ALLEXCEPT on Product.',
    },
    {
      heading: 'ALLSELECTED and visual totals',
      content:
        `**ALLSELECTED(table or column)** removes filters coming from the **visual itself** (rows, columns of the matrix) but keeps filters from **outside the visual** (slicers, page/report filters, filters pane).\n\nUse it for "% of visible total": the percentages add up to 100% of what the user selected.\n\n- \`ALL\` → % of grand total of the entire data (ignores slicers on that column).\n- \`ALLSELECTED\` → % of the total shown in the visual.\n\nALLSELECTED is complex internally (it uses "shadow filter contexts" from iterators); use it mostly in simple measures for visual totals, not deep inside nested iterators.`,
    },
    {
      heading: 'KEEPFILTERS – intersect instead of override',
      content:
        `By default, a CALCULATE filter **replaces** existing filters on the same column. **KEEPFILTERS** makes the new filter **intersect** with the existing one.\n\nExample in a matrix by Category:\n\n- \`CALCULATE([Total Sales], Product[Category] = "Bikes")\` → every row shows Bikes sales (Clothing row shows Bikes sales too!).\n- \`CALCULATE([Total Sales], KEEPFILTERS(Product[Category] = "Bikes"))\` → Bikes row shows Bikes sales; other rows are BLANK (intersection is empty).\n\nKEEPFILTERS can also wrap the table in iterators: \`SUMX(KEEPFILTERS(VALUES(...)), ...)\`.`,
    },
    {
      heading: 'Reading the filter context: VALUES, DISTINCT, SELECTEDVALUE, HASONEVALUE, ISINSCOPE, ISFILTERED',
      content: `These functions let a measure react to what is selected:`,
      points: [
        '**VALUES(column)** – distinct values visible in the current context, **including** the blank row added for unmatched keys. **VALUES(table)** returns visible rows incl. blank row. **DISTINCT(column)** – same but excludes the virtual blank row.',
        '**HASONEVALUE(column)** – TRUE when exactly one distinct value is visible.',
        '**SELECTEDVALUE(column, [alternate])** – returns the single visible value, otherwise the alternate (BLANK by default). Equivalent to IF(HASONEVALUE(col), VALUES(col), alternate).',
        '**ISFILTERED(column)** – TRUE if the column is directly filtered. **ISCROSSFILTERED** – TRUE if filtered directly or via another column/table.',
        '**ISINSCOPE(column)** – TRUE when the column is the current grouping level in a visual hierarchy; ideal to detect subtotal/total rows.',
      ],
    },
    {
      heading: 'Context transition',
      content:
        `**Context transition** happens when CALCULATE (or CALCULATETABLE) is executed inside a **row context**: the current row's values become filters. It also happens automatically whenever a **measure** is referenced inside a row context, because every measure is implicitly wrapped in CALCULATE.\n\nExample – calculated column in Customer:\n\n- \`Customer Sales = SUM(Sales[SalesAmount])\` → the grand total for every customer (row context does not filter).\n- \`Customer Sales = CALCULATE(SUM(Sales[SalesAmount]))\` → each customer's own sales (row → filter on all Customer columns → propagates to Sales).\n- \`Customer Sales = [Total Sales]\` → same as above (implicit CALCULATE).\n\nCaveats: context transition filters **all columns** of the row; if the table has duplicate rows, the result is multiplied/combined. It is expensive on large tables. It is what makes \`AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales])\` work.`,
    },
  ],
  examples: [
    {
      title: 'Sales for a fixed category vs respecting the filter',
      scenario: 'Compare behaviours in a matrix with Product[Category] on rows.',
      table: {
        headers: ['Category', 'Total Sales', 'Bikes Sales', 'Bikes Sales (Keep)'],
        rows: [
          ['Accessories', '200', '1,000', ''],
          ['Bikes', '1,000', '1,000', '1,000'],
          ['Clothing', '300', '1,000', ''],
          ['Total', '1,500', '1,000', '1,000'],
        ],
      },
      code: `Bikes Sales =
CALCULATE ( [Total Sales], Product[Category] = "Bikes" )

Bikes Sales (Keep) =
CALCULATE ( [Total Sales], KEEPFILTERS ( Product[Category] = "Bikes" ) )`,
      explanation:
        'The boolean filter replaces the row filter on Category, so every row shows 1,000. KEEPFILTERS intersects it with the row filter: only the Bikes row (and total) has a non-empty intersection.',
    },
    {
      title: '% of grand total and % of visible total',
      scenario: 'Show each category\'s share of sales.',
      code: `% of Grand Total =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], REMOVEFILTERS ( Product ) )
)

% of Visible Total =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALLSELECTED ( Product ) )
)`,
      result: 'Data: Accessories 200, Bikes 1,000, Clothing 300 (grand total 1,500). With a slicer selecting Bikes and Clothing: Bikes = 66.7% of grand total (1,000 / 1,500) and 76.9% of visible total (1,000 / 1,300); Clothing = 20.0% and 23.1%.',
      explanation:
        'REMOVEFILTERS(Product) ignores all Product filters (including the slicer) – the denominator is the total of all categories. ALLSELECTED(Product) removes the matrix row filter but keeps the slicer, so visible percentages sum to 100%. Filters on other tables (Date, Customer) still apply in both.',
    },
    {
      title: '% of category (parent) in a Category → Product matrix',
      scenario: 'In a matrix with Category and ProductName, show each product\'s share within its category.',
      code: `% of Category =
DIVIDE (
    [Total Sales],
    CALCULATE (
        [Total Sales],
        ALLEXCEPT ( Product, Product[Category] )
    )
)

-- Alternative that also respects slicers on other Product columns:
% of Category (v2) =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], REMOVEFILTERS ( Product[ProductName] ) )
)`,
      explanation:
        'ALLEXCEPT removes every filter on Product except Category, so the denominator is the category total. Version 2 removes only the ProductName filter, keeping other Product filters such as a Brand slicer – usually what users expect. At the category level the result is 100%.',
    },
    {
      title: 'FILTER with a measure condition',
      scenario: 'Sales coming from customers who bought more than 10,000 in the current period.',
      code: `Sales from Big Customers =
CALCULATE (
    [Total Sales],
    FILTER (
        VALUES ( Customer[CustomerID] ),
        [Total Sales] > 10000
    )
)

Big Customer Count =
COUNTROWS (
    FILTER ( VALUES ( Customer[CustomerID] ), [Total Sales] > 10000 )
)`,
      explanation:
        'A boolean filter cannot contain a measure, so FILTER iterates the visible customers (VALUES respects existing filters), evaluates [Total Sales] for each via context transition, and keeps those above 10,000. The resulting table of CustomerIDs becomes the filter.',
    },
    {
      title: 'SELECTEDVALUE and HASONEVALUE for dynamic behaviour',
      scenario: 'Show a target only when a single category is selected; build a measure switcher using a disconnected table.',
      code: `Category Target =
IF (
    HASONEVALUE ( Product[Category] ),
    SWITCH (
        VALUES ( Product[Category] ),
        "Bikes", 1200,
        "Clothing", 400,
        "Accessories", 250
    )
)

-- Disconnected table: Metric = DATATABLE("Metric", STRING, {{"Sales"}, {"Profit"}, {"Quantity"}})
Selected Metric Value =
SWITCH (
    SELECTEDVALUE ( Metric[Metric], "Sales" ),
    "Sales", [Total Sales],
    "Profit", [Profit],
    "Quantity", [Total Quantity]
)`,
      explanation:
        'HASONEVALUE guarantees VALUES returns one value (otherwise VALUES would return a multi-row table and cause an error inside SWITCH). SELECTEDVALUE returns the slicer selection of the disconnected Metric table, defaulting to "Sales" when nothing or several items are selected. (Field parameters are a modern no-code alternative for measure switching.)',
    },
    {
      title: 'Context transition in a calculated column',
      scenario: 'Classify customers by lifetime sales in the Customer table (for slicing).',
      code: `Lifetime Sales (wrong) = SUM ( Sales[SalesAmount] )        -- same grand total on every row
Lifetime Sales         = CALCULATE ( SUM ( Sales[SalesAmount] ) )   -- each customer's sales

Customer Segment =
VAR s = [Total Sales]          -- measure → implicit CALCULATE → context transition
RETURN
    SWITCH ( TRUE (), s >= 50000, "A", s >= 10000, "B", s > 0, "C", "No purchase" )`,
      explanation:
        'In a calculated column there is a row context for each customer. CALCULATE converts it into a filter on that customer, which propagates to Sales. Because it is a column, the segment is static (computed at refresh) and can be used in slicers.',
    },
    {
      title: 'Ignoring a slicer but keeping others',
      scenario: 'Show total sales for all countries next to the selected country, still respecting the Year slicer.',
      code: `Sales All Countries =
CALCULATE ( [Total Sales], REMOVEFILTERS ( Customer[Country] ) )

Country Share % = DIVIDE ( [Total Sales], [Sales All Countries] )`,
      explanation:
        'Only the Country column filter is removed; filters on Year (Date table) and other Customer columns are kept. If a City slicer also exists, it still filters (City implies Country), so remove Customer[City] too or use REMOVEFILTERS(Customer) as required.',
    },
  ],
  interview: [
    {
      q: 'What does CALCULATE do? Explain step by step.',
      a: `CALCULATE evaluates an expression in a modified filter context:\n1. Starts from the current filter context.\n2. If there is a row context, performs context transition (row → filters).\n3. Evaluates filter arguments in the original context.\n4. Applies modifiers (REMOVEFILTERS/ALL, USERELATIONSHIP, CROSSFILTER, KEEPFILTERS).\n5. Each filter argument overrides existing filters on the same columns (AND between arguments).\n6. Evaluates the expression in the new context.\n\nIt is the only function (with CALCULATETABLE) that can change the filter context.`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between CALCULATE([Total Sales], Product[Color] = "Red") and CALCULATE([Total Sales], FILTER(Product, Product[Color] = "Red"))?',
      a: `The first is a boolean filter = \`FILTER(ALL(Product[Color]), Product[Color] = "Red")\`: it **overrides** any existing filter on Color only; other Product filters stay. In a matrix by Color, every row shows Red sales.\n\nThe second iterates the Product table **as filtered by the current context**, so it **respects** existing filters (a Blue row → empty intersection → blank). It also filters all Product columns (the expanded table), and it is slower on large tables. To keep the existing filter on Color with a column filter, use \`KEEPFILTERS(Product[Color] = "Red")\`.`,
      level: 'Hard',
    },
    {
      q: 'ALL vs ALLSELECTED vs ALLEXCEPT vs REMOVEFILTERS?',
      a: `- **ALL(t/cols)**: removes all filters from the table/columns; also usable as a table function returning all rows.\n- **REMOVEFILTERS(t/cols)**: same as ALL but only as a CALCULATE modifier – clearer intent.\n- **ALLEXCEPT(t, cols)**: removes all filters on the table except those on the listed columns.\n- **ALLSELECTED(t/cols)**: removes filters from the current visual (rows/columns) but keeps outer filters (slicers, filters pane) – used for "% of visible total".`,
      level: 'Medium',
    },
    {
      q: 'What is KEEPFILTERS and when is it needed?',
      a: `KEEPFILTERS changes CALCULATE's behaviour from **override** to **intersect** for a filter argument. Needed when you want a measure like "Red sales" to show blank for non-red rows in a visual grouped by color, or when iterating with SUMX(KEEPFILTERS(VALUES(...)), ...) to respect existing filters, e.g. with arbitrary shaped filters in time intelligence.`,
      level: 'Hard',
    },
    {
      q: 'What is context transition? Give an example.',
      a: `Context transition is when CALCULATE turns the current row context into an equivalent filter context. It happens with explicit CALCULATE in a row context and implicitly when a measure is referenced in a row context (measures are wrapped in CALCULATE).\n\nExample: in a Customer calculated column, \`SUM(Sales[SalesAmount])\` returns the grand total, while \`CALCULATE(SUM(Sales[SalesAmount]))\` or \`[Total Sales]\` returns that customer's sales. In AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales]) it evaluates sales per customer.`,
      level: 'Hard',
    },
    {
      q: 'Difference between VALUES and DISTINCT?',
      a: `Both return distinct visible values of a column. **VALUES** includes the special **blank row** that the engine adds to a dimension when the fact contains keys not found in the dimension (referential integrity violation); **DISTINCT** does not include that virtual blank row (it still returns a real blank value if one exists in the data). Similarly ALL vs ALLNOBLANKROW.`,
      level: 'Hard',
    },
    {
      q: 'What does SELECTEDVALUE do and how is it different from VALUES?',
      a: `SELECTEDVALUE(col, alt) returns the value when exactly one distinct value is visible, otherwise alt (BLANK default). VALUES returns a table; if it has one row it can be used as a scalar, but with multiple rows it raises "A table of multiple values was supplied where a single value was expected". SELECTEDVALUE is the safe shortcut for IF(HASONEVALUE(col), VALUES(col), alt).`,
      level: 'Medium',
    },
    {
      q: 'How do you calculate % of total that ignores the slicer and one that respects it?',
      a: `\`\`\`\n% of Total (all data) = DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product)))\n% of Total (visible)  = DIVIDE([Total Sales], CALCULATE([Total Sales], ALLSELECTED(Product)))\n\`\`\`\n\nThe first ignores all Product filters including slicers on Product; the second removes only the visual's own grouping and keeps slicers, so the visible rows sum to 100%. Filters on other tables (Date) still apply in both.`,
      level: 'Medium',
    },
    {
      q: 'Why can\'t you use a measure directly in a CALCULATE boolean filter like CALCULATE([Total Sales], [Profit] > 0)?',
      a: `Boolean filter arguments must be predicates on columns (they are converted to FILTER(ALL(column), condition)). A measure has no column to filter, so DAX raises an error ("A function ... has been used in a True/False expression that is used as a table filter expression. This is not allowed."). Use FILTER over the grain you want: \`CALCULATE([Total Sales], FILTER(VALUES(Product[ProductID]), [Profit] > 0))\`.`,
      level: 'Medium',
    },
    {
      q: 'ISFILTERED vs ISCROSSFILTERED vs ISINSCOPE?',
      a: `- **ISFILTERED(col)**: TRUE if the column has a direct filter.\n- **ISCROSSFILTERED(col/table)**: TRUE if filtered directly or indirectly (through another column of the same table or a related table).\n- **ISINSCOPE(col)**: TRUE when the visual is grouping by that column at the current level – best for detecting subtotal vs detail rows in matrices (HASONEVALUE can be TRUE on a total row if only one item exists).`,
      level: 'Hard',
    },
    {
      q: 'Why should you avoid FILTER(Sales, ...) on a whole fact table inside CALCULATE?',
      a: `FILTER on a table iterates every row (millions) in the formula engine, and the result is the **expanded table** – a filter on all columns of Sales and its related dimensions, which can override/keep filters in unintended ways. Column predicates (Sales[Quantity] > 5) are converted to efficient storage-engine filters on just that column. Use FILTER only on small tables/columns or when a measure is needed in the condition.`,
      level: 'Hard',
    },
    {
      q: 'How do multiple filter arguments in CALCULATE combine? How do you express OR?',
      a: `Separate arguments are combined with **AND** (intersection). For OR on the same column use \`IN { }\` or \`||\` in one predicate: \`Product[Color] IN {"Red", "Blue"}\`. For OR across different columns of the same table, one predicate with \`||\` works (multi-column predicate). For OR across different tables, use FILTER over a cross-join of the columns, e.g. \`FILTER(CROSSJOIN(ALL(Product[Color]), ALL(Customer[Country])), Product[Color] = "Red" || Customer[Country] = "India")\` (watch performance).`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a measure that returns sales of the "Electronics" category in "India" only.',
      hint: 'Two boolean filters = AND.',
      solution: `Electronics India Sales =
CALCULATE (
    [Total Sales],
    Product[Category] = "Electronics",
    Customer[Country] = "India"
)`,
    },
    {
      task: 'In a matrix by Customer[Country], show each country\'s % of all countries, ignoring any Country slicer but respecting the Year slicer.',
      hint: 'REMOVEFILTERS on the Country column.',
      solution: `Country % of All =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], REMOVEFILTERS ( Customer[Country] ) )
)`,
    },
    {
      task: 'In a Category → Subcategory matrix, show Subcategory % of its Category.',
      hint: 'Remove the Subcategory filter only (or ALLEXCEPT).',
      solution: `% of Category =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], REMOVEFILTERS ( Product[Subcategory] ) )
)
-- If ProductName is also in the hierarchy, remove both: REMOVEFILTERS ( Product[Subcategory], Product[ProductName] )`,
    },
    {
      task: 'Count products that had at least one sale with a profit margin below 10% in the current context.',
      hint: 'FILTER over VALUES(Product[ProductID]) with measures.',
      solution: `Low Margin Products =
COUNTROWS (
    FILTER (
        VALUES ( Product[ProductID] ),
        NOT ISBLANK ( [Total Sales] ) && DIVIDE ( [Profit], [Total Sales] ) < 0.10
    )
)`,
    },
    {
      task: 'Create "Red or Blue Sales" that keeps existing color filters in a visual (non-red/blue rows should be blank).',
      hint: 'KEEPFILTERS + IN.',
      solution: `Red or Blue Sales =
CALCULATE (
    [Total Sales],
    KEEPFILTERS ( Product[Color] IN { "Red", "Blue" } )
)`,
    },
    {
      task: 'Create a dynamic card title: "Sales – <Country>" if one country is selected, "Sales – N countries" if several, "Sales – All countries" if no filter.',
      hint: 'ISFILTERED, HASONEVALUE/SELECTEDVALUE, COUNTROWS(VALUES()).',
      solution: `Sales Card Title =
SWITCH (
    TRUE (),
    NOT ISFILTERED ( Customer[Country] ), "Sales – All countries",
    HASONEVALUE ( Customer[Country] ), "Sales – " & SELECTEDVALUE ( Customer[Country] ),
    "Sales – " & COUNTROWS ( VALUES ( Customer[Country] ) ) & " countries"
)`,
    },
    {
      task: 'Add a calculated column in Product with each product\'s total quantity sold, and explain why CALCULATE is needed.',
      hint: 'Context transition.',
      solution: `Qty Sold = CALCULATE ( SUM ( Sales[Quantity] ) )
-- Without CALCULATE, SUM would see no filter (row context ≠ filter context) and return the total quantity of all products on every row.
-- CALCULATE converts the current Product row into a filter that propagates to Sales.`,
    },
  ],
  quiz: [
    {
      question: 'In a matrix by Category, the measure CALCULATE([Total Sales], Product[Category] = "Bikes") shows on the "Clothing" row:',
      options: ['Clothing sales', 'Bikes sales', 'BLANK', 'An error'],
      answer: 1,
      explanation: 'The boolean filter overrides the existing Category filter, so every row shows Bikes sales.',
    },
    {
      question: 'Which function removes filters from the visual but keeps slicer filters?',
      options: ['ALL', 'REMOVEFILTERS', 'ALLSELECTED', 'ALLEXCEPT'],
      answer: 2,
      explanation: 'ALLSELECTED restores the context as selected outside the visual.',
    },
    {
      question: 'What does KEEPFILTERS do?',
      options: [
        'Prevents filters from being removed by ALL',
        'Intersects the new filter with the existing filter instead of overriding it',
        'Keeps slicer selections after refresh',
        'Keeps blank rows',
      ],
      answer: 1,
      explanation: 'KEEPFILTERS changes override semantics into intersection.',
    },
    {
      question: 'In a Customer calculated column, which formula returns each customer\'s own sales?',
      options: ['SUM(Sales[SalesAmount])', 'CALCULATE(SUM(Sales[SalesAmount]))', 'SUMX(ALL(Sales), Sales[SalesAmount])', 'VALUES(Sales[SalesAmount])'],
      answer: 1,
      explanation: 'CALCULATE performs context transition, filtering Sales by the current customer.',
    },
    {
      question: 'SELECTEDVALUE(Product[Category], "Multiple") returns "Multiple" when:',
      options: ['Exactly one category is visible', 'Zero or more than one category is visible', 'The column is hidden', 'Always'],
      answer: 1,
      explanation: 'It returns the alternate result unless exactly one distinct value is in the filter context.',
    },
    {
      question: 'Multiple filter arguments in one CALCULATE are combined with:',
      options: ['OR', 'AND', 'XOR', 'The last one wins'],
      answer: 1,
      explanation: 'All filter arguments are intersected (logical AND).',
    },
  ],
};
