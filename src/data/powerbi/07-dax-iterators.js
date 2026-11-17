export default {
  id: 'dax-iterators',
  title: 'DAX Iterators & Aggregations (X Functions)',
  level: 'Intermediate',
  day: 7,
  duration: '3.5 hours',
  summary:
    'Iterators (SUMX, AVERAGEX, MAXX, MINX, COUNTX, RANKX, CONCATENATEX…) evaluate an expression row by row over a table and then aggregate the results. Learn when you need them, how RANKX and TOPN work with ALL/ALLSELECTED, and how to keep iterators fast.',
  objectives: [
    'Explain the difference between SUM and SUMX and when each is required',
    'Use AVERAGEX, MAXX, MINX and COUNTX over physical and virtual tables',
    'Rank items with RANKX and ALL/ALLSELECTED, handling ties and totals',
    'Return top N items with TOPN and compute Top N totals',
    'Build text lists with CONCATENATEX',
    'Write efficient iterators: iterate the smallest table, avoid nested heavy iterations',
  ],
  theory: [
    {
      heading: 'Aggregators vs iterators',
      content:
        `**Aggregators** such as SUM, AVERAGE, MIN, MAX take **one column** and aggregate the values visible in the filter context. \`SUM(Sales[SalesAmount])\` is internally just a shortcut for \`SUMX(Sales, Sales[SalesAmount])\`.\n\n**Iterators** (functions ending with X) take a **table** and an **expression**. They:\n\n1. Iterate over each row of the table (creating a **row context** for that row),\n2. Evaluate the expression for that row,\n3. Aggregate all row results (sum, average, max, count…).\n\nBecause the expression is evaluated per row, iterators can multiply columns, call measures per item, or apply logic before aggregating.`,
      syntax: `SUMX ( <table>, <expression> )
AVERAGEX ( <table>, <expression> )
MAXX ( <table>, <expression> )   MINX ( <table>, <expression> )
COUNTX ( <table>, <expression> )   COUNTAX ( <table>, <expression> )
RANKX ( <table>, <expression> [, <value> [, <order> [, <ties>]]] )
CONCATENATEX ( <table>, <expression> [, <delimiter> [, <orderBy_expression> [, <order>]]] )`,
    },
    {
      heading: 'SUM vs SUMX – when you NEED an iterator',
      content:
        `Suppose Sales has Quantity and UnitPrice but no SalesAmount. You want revenue.\n\n- \`SUM(Sales[Quantity]) * SUM(Sales[UnitPrice])\` is **WRONG**: it multiplies the total quantity by the sum of prices (not by price per line).\n- \`SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])\` is **correct**: multiplies on each line, then sums.\n\nThe rule: **"multiply then sum" ≠ "sum then multiply"**. Whenever the calculation must be done at a lower grain than the visual shows, use an iterator.\n\nOther classic uses: weighted averages, sums of per-customer measures, calculations that need RELATED columns per row, conditional per-row logic.`,
      tip: 'If you only need to sum an existing column, use SUM – it is identical in performance to SUMX over the same column, and more readable.',
    },
    {
      heading: 'AVERAGEX, MAXX, MINX, COUNTX over virtual tables',
      content:
        `The table argument can be a physical table (Sales) or a **table expression**: \`VALUES(Customer[CustomerID])\`, \`FILTER(...)\`, \`SUMMARIZE(...)\`, \`ALL(...)\`.\n\nIterating over a column of distinct values and evaluating a **measure** for each lets you change the grain of a calculation:\n\n- \`AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales])\` = average sales **per customer**.\n- \`MAXX(VALUES('Date'[Date]), [Total Sales])\` = best day's sales.\n- \`AVERAGEX(VALUES('Date'[MonthName]), [Total Sales])\` = average monthly sales.\n\nWhen a measure is used inside an iterator, DAX performs **context transition** (the measure is implicitly wrapped in CALCULATE), turning the current row into a filter. That is why \`[Total Sales]\` returns each customer's sales.\n\n**COUNTX(table, expr)** counts rows where the expression is not blank – e.g., \`COUNTX(VALUES(Customer[CustomerID]), [Total Sales])\` counts customers with sales. Simpler alternative: \`COUNTROWS(FILTER(...))\`.`,
      tip: 'AVERAGE(Sales[SalesAmount]) = average per sales line. AVERAGEX(VALUES(Sales[OrderID]), [Total Sales]) = average per order. Interviewers love this distinction.',
    },
    {
      heading: 'RANKX with ALL and ALLSELECTED',
      content:
        `\`RANKX(table, expression, [value], [order], [ties])\` evaluates the expression for every row of the table, then returns the rank of the current value.\n\n- **order**: DESC (default, largest = 1) or ASC.\n- **ties**: **Skip** (default; 1, 2, 2, 4) or **Dense** (1, 2, 2, 3).\n\nWhy **ALL**? In a table visual with one row per product, the filter context contains only that product. \`RANKX(VALUES(Product[ProductName]), [Total Sales])\` would rank the product among a list of itself → always 1. \`ALL(Product[ProductName])\` removes the filter so each product is ranked among **all** products.\n\nUse **ALLSELECTED** instead to rank among the products visible after slicers/filters (e.g., rank within the selected category). The total row would also get a rank, so wrap with \`IF(ISINSCOPE(Product[ProductName]), ...)\` or \`HASONEVALUE\`.`,
      syntax: `Product Rank =
IF (
    ISINSCOPE ( Product[ProductName] ),
    RANKX ( ALLSELECTED ( Product[ProductName] ), [Total Sales], , DESC, DENSE )
)`,
      tip: 'Ranking with ALL(Product) (the whole table) instead of ALL(Product[ProductName]) can give unexpected results when the visual also contains other Product columns. Iterate the same column(s) used in the visual.',
    },
    {
      heading: 'TOPN',
      content:
        `\`TOPN(n, table, orderBy_expression, [order], ...)\` returns a **table** with the top n rows of the table ordered by the expression. It does NOT sort its output, and it can return **more than n rows when there are ties** at the boundary.\n\nBecause it returns a table, TOPN is used inside other functions:\n\n- \`SUMX(TOPN(5, ALLSELECTED(Product[ProductName]), [Total Sales]), [Total Sales])\` = sales of top 5 products.\n- \`CALCULATE([Total Sales], TOPN(5, ALL(Customer[CustomerName]), [Total Sales]))\` = sales of the top 5 customers (as a filter).\n- As a calculated table or in DAX queries: \`EVALUATE TOPN(10, ...)\`.\n\nFor showing the top N items in a visual, the **Top N visual filter** in the Filters pane is often easier; DAX TOPN is needed for dynamic N (with a what-if parameter), "Top N + Others" or totals of the top N.`,
    },
    {
      heading: 'CONCATENATEX – lists of text',
      content:
        `\`CONCATENATEX(table, expression, delimiter, orderBy, order)\` concatenates an expression evaluated for each row. Common uses: dynamic titles listing selected items, tooltips listing products bought by a customer, debugging what filters are active.\n\nExample: \`CONCATENATEX(VALUES(Product[Category]), Product[Category], ", ", Product[Category], ASC)\` → "Accessories, Bikes, Clothing".\n\nUse \`UNICHAR(10)\` as a delimiter for line breaks (enable word wrap in the visual).`,
    },
    {
      heading: 'Iterator performance',
      content:
        `Iterators are not "slow" by default – SUMX over a column expression that the storage engine can handle (simple arithmetic on columns of the same table) is computed by VertiPaq very efficiently. Performance problems arise when:`,
      points: [
        '**Iterating a large table while calling a measure** (context transition on millions of rows). Iterate the smallest table that gives the correct grain: VALUES(Customer[CustomerID]) instead of Sales.',
        '**Nested iterators** over large tables (SUMX inside FILTER inside SUMX) multiply the work.',
        '**Complex expressions** in the row expression (IF, string functions, RELATED on large tables) can force the formula engine to do the work row by row (CallbackDataID in query plans).',
        '**FILTER on a whole table** (FILTER(Sales, ...)) instead of filtering columns: prefer CALCULATE with column predicates.',
        'Use **variables** to avoid evaluating the same measure twice per row.',
        'Measure with **Performance Analyzer** (View → Performance analyzer) and **DAX Studio** (Server Timings: SE vs FE time).',
      ],
      tip: 'Precompute row-level expressions as columns in Power Query when they do not depend on filters (e.g., SalesAmount = Quantity * UnitPrice) and then use simple SUM.',
    },
    {
      heading: 'When to use X functions – decision guide',
      content: `Use an iterator when any of these is true:`,
      points: [
        'The calculation must happen per row before aggregation (Quantity × Price, weighted values).',
        'You need an aggregation at a different grain than the visual (average per customer, max per day).',
        'You need to rank, find top N, or build text lists.',
        'You need per-row logic with RELATED (e.g., Quantity × RELATED(Product[StandardCost])).',
        'Otherwise, use simple aggregators (SUM, AVERAGE, COUNTROWS, DISTINCTCOUNT).',
      ],
    },
  ],
  examples: [
    {
      title: 'Revenue from Quantity and UnitPrice',
      scenario: 'Compute revenue when SalesAmount is not available.',
      table: {
        headers: ['OrderID', 'Quantity', 'UnitPrice'],
        rows: [
          ['1001', '2', '500'],
          ['1002', '1', '1200'],
          ['1003', '3', '100'],
        ],
      },
      code: `Wrong Revenue = SUM ( Sales[Quantity] ) * SUM ( Sales[UnitPrice] )
-- (2+1+3) * (500+1200+100) = 6 * 1800 = 10800  ✗

Revenue = SUMX ( Sales, Sales[Quantity] * Sales[UnitPrice] )
-- 2*500 + 1*1200 + 3*100 = 1000 + 1200 + 300 = 2500  ✓`,
      result: 'Revenue = 2500',
      explanation:
        'SUMX iterates each Sales row in the current filter context, multiplies Quantity by UnitPrice for that row, and sums the results.',
    },
    {
      title: 'Profit using cost from the Product table',
      scenario: 'Sales has no Cost column in this variant; Product has StandardCost per unit.',
      code: `Total Cost (std) =
SUMX ( Sales, Sales[Quantity] * RELATED ( Product[StandardCost] ) )

Gross Profit (std) = [Total Sales] - [Total Cost (std)]`,
      explanation:
        'RELATED works inside the row context created by SUMX on Sales, following the many-to-one relationship to Product to get the unit cost for each line.',
    },
    {
      title: 'Average sales per customer vs per line vs per order',
      scenario: 'Management asks: "What is our average sale?" – it depends on the grain!',
      code: `Avg per Line     = AVERAGE ( Sales[SalesAmount] )

Avg per Order    = AVERAGEX ( VALUES ( Sales[OrderID] ), [Total Sales] )

Avg per Customer = AVERAGEX ( VALUES ( Customer[CustomerID] ), [Total Sales] )`,
      explanation:
        'Avg per Order iterates distinct OrderIDs; for each, [Total Sales] is evaluated with context transition (filter OrderID = current). Avg per Customer iterates customers – note that VALUES(Customer[CustomerID]) includes customers without sales in the current context; AVERAGEX ignores BLANK results, so they are not counted. Iterating VALUES(Sales[CustomerID]) would give the same answer.',
    },
    {
      title: 'Best day and best month',
      scenario: 'Show the highest daily sales and the date it happened.',
      code: `Best Day Sales = MAXX ( VALUES ( 'Date'[Date] ), [Total Sales] )

Best Day Date =
VAR BestValue = [Best Day Sales]
RETURN
    MAXX (
        FILTER ( VALUES ( 'Date'[Date] ), [Total Sales] = BestValue ),
        'Date'[Date]
    )

Best Month Sales =
MAXX ( VALUES ( 'Date'[Year Month] ), [Total Sales] )`,
      explanation:
        'MAXX evaluates Total Sales per date and returns the maximum. To get the date, filter dates where sales equal the best value and take the max date (latest if ties). Alternatively use TOPN(1, VALUES(\'Date\'[Date]), [Total Sales]). Year Month is assumed to be a column like "2024-01" in the Date table.',
    },
    {
      title: 'Product ranking with RANKX',
      scenario: 'Rank products by sales in a table visual, ranking within the current slicer selection, and leave the total row blank.',
      code: `Product Rank =
IF (
    ISINSCOPE ( Product[ProductName] ),
    RANKX (
        ALLSELECTED ( Product[ProductName] ),
        [Total Sales],
        ,
        DESC,
        DENSE
    )
)

Product Rank (All Products) =
IF (
    HASONEVALUE ( Product[ProductName] ),
    RANKX ( ALL ( Product[ProductName] ), [Total Sales] )
)`,
      result: 'Laptop 1, Monitor 2, Desk 3 … total row blank',
      explanation:
        'ALLSELECTED ranks among products visible after slicers (e.g., inside the selected category). ALL ranks among all products regardless of slicers on product. ISINSCOPE/HASONEVALUE prevents a meaningless rank on the total row. DENSE gives consecutive ranks after ties.',
    },
    {
      title: 'Top 5 products sales and Top 5 share',
      scenario: 'Show a card with the sales of the top 5 products and their share of total.',
      code: `Top 5 Products Sales =
SUMX (
    TOPN ( 5, ALLSELECTED ( Product[ProductName] ), [Total Sales] ),
    [Total Sales]
)

Top 5 Share % =
DIVIDE ( [Top 5 Products Sales], CALCULATE ( [Total Sales], ALLSELECTED ( Product[ProductName] ) ) )`,
      explanation:
        'TOPN returns a table of the 5 product names with the highest sales within the selection (could be more with ties). SUMX evaluates Total Sales for each of them and sums. The share divides by the total for all selected products.',
    },
    {
      title: 'CONCATENATEX for a dynamic subtitle',
      scenario: 'Display the selected categories in the report subtitle; if more than 3 are selected show "Multiple categories".',
      code: `Selected Categories =
VAR Cnt = COUNTROWS ( VALUES ( Product[Category] ) )
VAR AllCnt = COUNTROWS ( ALL ( Product[Category] ) )
RETURN
    SWITCH (
        TRUE (),
        Cnt = AllCnt, "All categories",
        Cnt > 3, "Multiple categories (" & Cnt & ")",
        CONCATENATEX ( VALUES ( Product[Category] ), Product[Category], ", ", Product[Category], ASC )
    )`,
      result: '"Bikes, Clothing" when two categories are selected',
      explanation:
        'VALUES returns the categories visible in the filter context; CONCATENATEX joins them sorted alphabetically. Use the measure in a card or a visual title via fx (conditional formatting by field value).',
    },
  ],
  interview: [
    {
      q: 'What is the difference between SUM and SUMX?',
      a: `SUM aggregates a single column in the current filter context. SUMX iterates a table, evaluates an expression for each row (row context) and sums the results.\n\nUse SUMX when you need per-row computation before summing, e.g. \`SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])\`. \`SUM(Sales[Quantity]) * SUM(Sales[UnitPrice])\` would be wrong. SUM(col) is internally SUMX(table, col), so for a single column there is no performance difference.`,
      level: 'Easy',
    },
    {
      q: 'Are iterators slow? How do you write efficient iterators?',
      a: `Not inherently – simple row expressions on one table are handled by the storage engine in parallel. They become slow when they iterate very large tables while invoking measures (context transition per row), when nested, or when the row expression is complex enough to require the formula engine (callbacks).\n\nTips: iterate the smallest table with the right grain (VALUES of a dimension column), use variables, move static row-level calculations to Power Query, prefer CALCULATE with column filters over FILTER(entire table), and measure with DAX Studio server timings.`,
      level: 'Hard',
    },
    {
      q: 'Why do we use ALL inside RANKX?',
      a: `RANKX ranks the current value against values computed for each row of its table argument. In a visual, the filter context for each row contains only that product. If the table argument is VALUES(Product[ProductName]) or Product, it contains just the current product, so every rank is 1. ALL(Product[ProductName]) removes the filter so the current product is compared with all products. ALLSELECTED compares within the user's selection.`,
      level: 'Medium',
    },
    {
      q: 'Explain the ties parameter of RANKX.',
      a: `Ties determines what happens after equal values:\n- **SKIP** (default): 100, 90, 90, 80 → 1, 2, 2, 4 (like Olympic medals).\n- **DENSE**: 100, 90, 90, 80 → 1, 2, 2, 3.\n\nAlso watch out for floating-point differences that make "equal" numbers rank differently; rounding inside the expression can help.`,
      level: 'Medium',
    },
    {
      q: 'What does TOPN return and what are its gotchas?',
      a: `TOPN returns a **table** with the top N rows according to an expression. Gotchas: (1) the result is not sorted – ordering must be done in the visual or with ORDER BY in a query; (2) ties at the Nth position return more than N rows; (3) the table argument determines the context – use ALL/ALLSELECTED to look beyond the current filter; (4) it is typically used inside SUMX, CALCULATE or CONCATENATEX, or as the table for a calculated table/query.`,
      level: 'Medium',
    },
    {
      q: 'How would you calculate the average monthly sales?',
      a: `\`\`\`\nAvg Monthly Sales =\nAVERAGEX ( VALUES ( 'Date'[Year Month] ), [Total Sales] )\n\`\`\`\n\nIterates each month visible in the context (e.g., the 12 months of the selected year), computes Total Sales for each via context transition, and averages. Using \`[Total Sales] / 12\` would be wrong for partial years, and \`AVERAGE(Sales[SalesAmount])\` returns the average per line.\n\nIterate Year Month (unique across years), not MonthName, otherwise January 2023 and 2024 merge into one item.`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between COUNT, COUNTX and COUNTROWS(FILTER(...))?',
      a: `- \`COUNT(col)\`: non-blank values in a column.\n- \`COUNTX(table, expr)\`: iterates the table and counts rows where expr is not blank (e.g., customers with sales: COUNTX(VALUES(Customer[CustomerID]), [Total Sales])).\n- \`COUNTROWS(FILTER(table, condition))\`: counts rows meeting a boolean condition (e.g., customers with sales > 1000).\n\nCOUNTROWS(FILTER()) is the clearest when the logic is a condition; COUNTX when the logic is "non-blank expression".`,
      level: 'Medium',
    },
    {
      q: 'What is context transition and why does it matter in iterators?',
      a: `Context transition is the conversion of the current row context into an equivalent filter context, performed by CALCULATE. Every measure reference is implicitly wrapped in CALCULATE, so inside an iterator \`[Total Sales]\` is evaluated filtered to the current row's values.\n\nIn \`AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales])\` context transition filters Sales to the current customer. Without it (\`SUM(Sales[SalesAmount])\` instead of the measure) every iteration would return the same total. Context transition over a table with many columns or duplicate rows can be expensive or produce unexpected (duplicated) results.`,
      level: 'Hard',
    },
    {
      q: 'Give a use case for CONCATENATEX.',
      a: `Dynamic titles/subtitles listing selected slicer values, tooltips listing products a customer bought, building a comma-separated list of top 3 products (CONCATENATEX(TOPN(3, ...), Product[ProductName], ", ")), and debugging what is in the filter context. Syntax: CONCATENATEX(table, expression, delimiter, orderBy, order).`,
      level: 'Easy',
    },
    {
      q: 'Why does AVERAGE(Sales[SalesAmount]) differ from AVERAGEX(VALUES(Sales[OrderID]), [Total Sales])?',
      a: `AVERAGE divides total by the number of **sales lines** (rows). AVERAGEX over VALUES(OrderID) computes the total per **order** and averages across orders. If orders have several lines, the per-order average is higher. Always clarify the grain ("average per what?") – this is a common business misunderstanding and a favorite interview question.`,
      level: 'Medium',
    },
    {
      q: 'How do you compute a weighted average price?',
      a: `Weighted average unit price = total revenue / total quantity:\n\n\`\`\`\nWeighted Avg Price =\nDIVIDE ( SUMX ( Sales, Sales[Quantity] * Sales[UnitPrice] ), SUM ( Sales[Quantity] ) )\n\`\`\`\n\nA simple AVERAGE(Sales[UnitPrice]) treats a line of 1 unit and a line of 1,000 units equally, which is misleading.`,
      level: 'Medium',
    },
    {
      q: 'How would you show "Top N + Others" or a dynamic Top N?',
      a: `Dynamic N: create a what-if parameter (Modeling → New parameter → Numeric range) TopN with a measure \`[TopN Value]\`. Then:\n\n\`\`\`\nIs In Top N =\nVAR r = RANKX ( ALLSELECTED ( Product[ProductName] ), [Total Sales] )\nRETURN IF ( r <= [TopN Value], 1, 0 )\n\`\`\`\n\nUse it as a visual filter (= 1). For "Others", create a disconnected table of product names plus an "Others" row and a measure that returns the product's sales when in the top N and, on the Others row, total minus top N sales.`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a measure "Total Discount" where Sales has Quantity, UnitPrice and a column DiscountPct (0–1).',
      hint: 'Discount per row = Quantity * UnitPrice * DiscountPct.',
      solution: `Total Discount =
SUMX ( Sales, Sales[Quantity] * Sales[UnitPrice] * Sales[DiscountPct] )`,
    },
    {
      task: 'Create "Avg Sales per Product" that averages Total Sales over the products sold in the current context.',
      hint: 'AVERAGEX over VALUES.',
      solution: `Avg Sales per Product =
AVERAGEX ( VALUES ( Sales[ProductID] ), [Total Sales] )`,
    },
    {
      task: 'Rank customers by profit (dense), ranking against all customers regardless of slicers on customer, blank on totals.',
      hint: 'RANKX + ALL + ISINSCOPE.',
      solution: `Customer Profit Rank =
IF (
    ISINSCOPE ( Customer[CustomerName] ),
    RANKX ( ALL ( Customer[CustomerName] ), [Profit], , DESC, DENSE )
)`,
    },
    {
      task: 'Return the sales of the top 3 customers in the current selection.',
      hint: 'SUMX over TOPN with ALLSELECTED.',
      solution: `Top 3 Customers Sales =
SUMX (
    TOPN ( 3, ALLSELECTED ( Customer[CustomerName] ), [Total Sales] ),
    [Total Sales]
)`,
    },
    {
      task: 'Create a tooltip measure listing the top 3 products (by sales) for the current customer, comma separated.',
      hint: 'CONCATENATEX over TOPN.',
      solution: `Top 3 Products List =
CONCATENATEX (
    TOPN ( 3, VALUES ( Product[ProductName] ), [Total Sales] ),
    Product[ProductName],
    ", ",
    [Total Sales],
    DESC
)`,
    },
    {
      task: 'Count customers whose total sales exceed 10,000 in the current context.',
      hint: 'COUNTROWS(FILTER(VALUES(...), condition)).',
      solution: `High Value Customers =
COUNTROWS (
    FILTER ( VALUES ( Customer[CustomerID] ), [Total Sales] > 10000 )
)`,
    },
    {
      task: 'Find the maximum single order value (an order may have several lines).',
      hint: 'MAXX over distinct orders with the measure.',
      solution: `Max Order Value =
MAXX ( VALUES ( Sales[OrderID] ), [Total Sales] )
-- MAX(Sales[SalesAmount]) would return the biggest LINE, not the biggest order.`,
    },
  ],
  quiz: [
    {
      question: 'Sales lines: (Qty 2, Price 10), (Qty 3, Price 20). What does SUMX(Sales, Sales[Quantity] * Sales[UnitPrice]) return?',
      options: ['150', '80', '30', '60'],
      answer: 1,
      explanation: '2×10 + 3×20 = 20 + 60 = 80. SUM(Qty) × SUM(Price) would be 5 × 30 = 150.',
    },
    {
      question: 'Why is ALL commonly used as the first argument of RANKX in a table visual?',
      options: [
        'To make RANKX faster',
        'So each item is ranked against all items, not just itself',
        'To sort the visual',
        'To ignore blanks',
      ],
      answer: 1,
      explanation: 'Without removing the filter, the table contains only the current item and every rank is 1.',
    },
    {
      question: 'With the DENSE ties option, values 50, 40, 40, 30 rank as:',
      options: ['1, 2, 2, 4', '1, 2, 3, 4', '1, 2, 2, 3', '1, 1, 2, 3'],
      answer: 2,
      explanation: 'DENSE does not skip numbers after ties.',
    },
    {
      question: 'What does TOPN return?',
      options: ['A scalar value', 'A sorted table', 'A table that may contain more than N rows when there are ties', 'A list of measures'],
      answer: 2,
      explanation: 'TOPN returns an unsorted table; ties at the boundary can return extra rows.',
    },
    {
      question: 'Which measure returns average sales per customer?',
      options: [
        'AVERAGE(Sales[SalesAmount])',
        'AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales])',
        'SUM(Sales[SalesAmount]) / COUNTROWS(Sales)',
        'AVERAGEX(Sales, Sales[SalesAmount])',
      ],
      answer: 1,
      explanation: 'It iterates each customer and averages each customer\'s total sales.',
    },
    {
      question: 'Which practice improves iterator performance?',
      options: [
        'Iterate the entire fact table while calling measures',
        'Nest several iterators over the fact table',
        'Iterate the smallest table at the required grain and use variables',
        'Always use FILTER(Sales, ...) instead of column filters',
      ],
      answer: 2,
      explanation: 'Smaller iteration tables and variables reduce context transitions and repeated evaluation.',
    },
  ],
};
