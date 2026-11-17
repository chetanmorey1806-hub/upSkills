export default {
  id: 'dax-advanced',
  title: 'Advanced DAX (Variables, Relationships, Virtual Tables & Business Patterns)',
  level: 'Advanced',
  day: 10,
  duration: '5 hours',
  summary:
    'Go beyond basic aggregations: write readable DAX with variables, control relationships inside a measure (USERELATIONSHIP, CROSSFILTER, TREATAS), build virtual tables, and implement real business patterns such as dynamic segmentation, ABC/Pareto analysis and new vs returning customers.',
  objectives: [
    'Write clean, efficient measures using VAR / RETURN and SWITCH(TRUE())',
    'Choose correctly between RELATED, RELATEDTABLE and LOOKUPVALUE',
    'Activate inactive relationships and change filter direction inside a measure with USERELATIONSHIP and CROSSFILTER',
    'Build and use virtual tables with SUMMARIZE, SUMMARIZECOLUMNS, ADDCOLUMNS, GENERATESERIES and TREATAS',
    'Implement dynamic segmentation, ABC/Pareto classification and new vs returning customer analysis',
    'Explain what calculation groups are and when they replace many duplicated measures',
  ],
  theory: [
    {
      heading: 'Sample model used in this lesson',
      content:
        'All examples use one star schema so you can rebuild them in a single .pbix file.\n\n**Sales** (fact): OrderID, OrderDate, ShipDate, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost.\n**Product** (dim): ProductID, ProductName, Category, Subcategory, ListPrice.\n**Customer** (dim): CustomerID, CustomerName, City, Country, Segment, FirstPurchaseDate.\n**\'Date\'** (dim, marked as date table): Date, Year, Quarter, MonthNumber, MonthName, YearMonth.\n\nRelationships: Sales[ProductID] -> Product[ProductID] (many-to-one, single direction), Sales[CustomerID] -> Customer[CustomerID], Sales[OrderDate] -> \'Date\'[Date] (active) and Sales[ShipDate] -> \'Date\'[Date] (inactive, dotted line).\n\nBase measures we reuse everywhere:',
      syntax:
        'Total Sales = SUM ( Sales[SalesAmount] )\nTotal Cost = SUM ( Sales[Cost] )\nTotal Profit = [Total Sales] - [Total Cost]\nOrders = DISTINCTCOUNT ( Sales[OrderID] )\nCustomers = DISTINCTCOUNT ( Sales[CustomerID] )',
      tip: 'Always build small "base" measures first and reference them in advanced measures. It keeps logic in one place and makes debugging far easier.',
    },
    {
      heading: 'Variables: VAR ... RETURN',
      content:
        'A variable stores the result of an expression so you can reuse it. Variables make DAX **readable**, **faster** (an expression referenced twice is evaluated once), and **easier to debug** (temporarily RETURN a variable to inspect it).\n\nThe most important rule: a variable is evaluated **once, in the filter context where it is defined**, and then it is a constant. If you define a variable outside CALCULATE and use it inside CALCULATE, CALCULATE cannot change its value. This is the most common variable bug.',
      syntax:
        'Profit Margin % =\nVAR SalesAmt = [Total Sales]\nVAR CostAmt  = [Total Cost]\nVAR Profit   = SalesAmt - CostAmt\nRETURN\n    DIVIDE ( Profit, SalesAmt )',
      points: [
        'Variables can hold scalar values or whole tables',
        'Variable names cannot contain spaces and cannot be a reserved word',
        'A measure can have many VARs but only one RETURN',
        'Variables are immutable: once evaluated they never change, even inside CALCULATE',
      ],
      tip: 'Debug trick: change RETURN to return an intermediate variable (e.g. RETURN CostAmt) to check each step, then switch back.',
    },
    {
      heading: 'RELATED vs RELATEDTABLE vs LOOKUPVALUE',
      content:
        '**RELATED** works from the **many side** to the **one side** and returns a single value. It needs a row context (a calculated column or an iterator such as SUMX) and an existing relationship. Example: in Sales, `RELATED(Product[Category])`.\n\n**RELATEDTABLE** goes the other way: from the **one side** to the **many side**, returning a table of related rows. Example: in Product, `COUNTROWS(RELATEDTABLE(Sales))` counts sales rows per product. It is a shortcut for CALCULATETABLE with context transition.\n\n**LOOKUPVALUE** does not need a relationship at all. It searches a column for matching values and returns a single value (or an alternate result / error if multiple different values match). It is slower than RELATED and should be used only when no relationship can exist (for example, looking up an exchange rate by currency and date).',
      syntax:
        '-- Calculated column in Sales\nCategory = RELATED ( Product[Category] )\n\n-- Calculated column in Product\nSales Rows = COUNTROWS ( RELATEDTABLE ( Sales ) )\n\n-- LOOKUPVALUE( result_column, search_column, search_value [, ...] [, alternate_result] )\nRate = LOOKUPVALUE ( FX[Rate], FX[Currency], Sales[Currency], FX[Date], Sales[OrderDate], 1 )',
      tip: 'If you find yourself using LOOKUPVALUE between two tables that share a key, you probably need a relationship instead.',
    },
    {
      heading: 'USERELATIONSHIP and CROSSFILTER',
      content:
        'Power BI allows only **one active relationship** between two tables. Additional relationships are inactive. **USERELATIONSHIP** activates an inactive relationship for the duration of one CALCULATE, which is the standard solution for "role-playing" dates (OrderDate vs ShipDate vs DueDate).\n\n**CROSSFILTER** changes the filter direction of an existing relationship inside a measure: "Both", "OneWay", "OneWay_LeftFiltersRight", "OneWay_RightFiltersLeft" or "None". This lets you keep model relationships single-direction (safer, faster) and enable bi-directional filtering only in the one measure that needs it.',
      syntax:
        'Sales by Ship Date =\nCALCULATE (\n    [Total Sales],\n    USERELATIONSHIP ( Sales[ShipDate], \'Date\'[Date] )\n)\n\nProducts Sold (bi-dir) =\nCALCULATE (\n    DISTINCTCOUNT ( Product[ProductID] ),\n    CROSSFILTER ( Sales[ProductID], Product[ProductID], Both )\n)',
      points: [
        'USERELATIONSHIP only works if the relationship already exists in the model (inactive)',
        'USERELATIONSHIP returns an error if row-level security is defined on a table involved in that relationship (per Microsoft docs), so test RLS models with View as',
        'CROSSFILTER with None disables a relationship temporarily',
      ],
      tip: 'Interviewers love the role-playing date question. Answer: one active relationship to Date, inactive ones for other dates, and USERELATIONSHIP inside CALCULATE.',
    },
    {
      heading: 'SWITCH(TRUE()) for readable branching',
      content:
        'Nested IF statements become unreadable quickly. `SWITCH(TRUE(), condition1, result1, condition2, result2, ..., else)` evaluates conditions top to bottom and returns the result of the **first** condition that is TRUE. Order your conditions carefully: put the most restrictive first.\n\nIt is used for banding (High / Medium / Low), KPI status text, colour measures for conditional formatting and dynamic measure selection.',
      syntax:
        'Margin Band =\nVAR m = [Profit Margin %]\nRETURN\n    SWITCH (\n        TRUE (),\n        ISBLANK ( m ), BLANK (),\n        m >= 0.40, "High",\n        m >= 0.20, "Medium",\n        "Low"\n    )',
      tip: 'Handle BLANK first, otherwise BLANK is treated as 0 in comparisons and can land in the wrong band.',
    },
    {
      heading: 'Virtual tables: SUMMARIZE, SUMMARIZECOLUMNS, ADDCOLUMNS, GENERATESERIES',
      content:
        'A **virtual table** exists only while a measure is being evaluated. You build it, then iterate over it (SUMX, AVERAGEX, MAXX, COUNTROWS, FILTER) to return a single value.\n\n**SUMMARIZE(table, groupBy columns...)** returns distinct combinations of group-by columns. Best practice: use it only for grouping, and add calculated columns with **ADDCOLUMNS** around it, because adding expressions inside SUMMARIZE can give unexpected results.\n\n**ADDCOLUMNS(table, "Name", expression)** adds calculated columns to any table; when the expression is a measure, context transition happens per row.\n\n**SUMMARIZECOLUMNS** is the fastest grouping function and is what Power BI visuals generate internally. Since 2023 it is supported inside measures in most scenarios, but it is still most commonly used in calculated tables and DAX queries.\n\n**GENERATESERIES(start, end, step)** creates a one-column table of numbers (column name Value). What-if parameters are built with it.\n\n**VALUES / DISTINCT** return the unique values of a column in the current filter context, and **TOPN** returns the top N rows by an expression.',
      syntax:
        'Avg Sales per Customer =\nAVERAGEX (\n    VALUES ( Customer[CustomerID] ),\n    [Total Sales]\n)\n\nBest Month Sales =\nMAXX (\n    ADDCOLUMNS (\n        SUMMARIZE ( Sales, \'Date\'[Year], \'Date\'[MonthNumber] ),\n        "@Sales", [Total Sales]\n    ),\n    [@Sales]\n)\n\n-- Calculated table\nDiscount Steps = GENERATESERIES ( 0, 0.30, 0.05 )',
      tip: 'Prefix virtual column names with @ (e.g. "@Sales") so readers know it is a column of a virtual table and not a model measure.',
    },
    {
      heading: 'TREATAS: virtual relationships',
      content:
        '**TREATAS(table_expression, column1, column2, ...)** takes the values of a table and applies them as a filter on columns of another table, as if a relationship existed. Typical uses:\n\n- Filtering a fact table by a disconnected table (e.g. a Budget table at Category/Month grain with no relationship to Product).\n- Applying a filter from a slicer table that is intentionally not related.\n- Replacing slower FILTER/CONTAINS or INTERSECT patterns.\n\nTREATAS is usually faster than equivalent FILTER patterns and is the recommended way to create a virtual relationship.',
      syntax:
        'Budget for Selected Categories =\nCALCULATE (\n    SUM ( Budget[BudgetAmount] ),\n    TREATAS ( VALUES ( Product[Category] ), Budget[Category] )\n)',
      tip: 'TREATAS lineage: the number of columns in the table expression must equal the number of target columns, in the same order.',
    },
    {
      heading: 'Business patterns: segmentation, ABC/Pareto, new vs returning',
      content:
        '**Dynamic segmentation** groups customers or products into buckets based on a measure calculated at query time (e.g. customers whose sales are 0-1,000 = "Bronze"). Because it is a measure, the segment respects slicers: a customer can be Gold in 2024 and Silver in 2025. Implemented with a disconnected Segments table (Segment, Min, Max) plus FILTER.\n\n**ABC / Pareto analysis** ranks items by contribution and classifies them: A = items making up the first ~70-80% of cumulative sales, B = next ~15-20%, C = the rest. It answers "which 20% of products drive 80% of revenue?" Implemented with a cumulative-sum-by-rank pattern.\n\n**New vs returning customers**: a customer is "new" in a period if their first-ever purchase date falls in that period; otherwise "returning". The measure finds each customer\'s first purchase ignoring date filters (ALL(\'Date\')), then compares it with the current period.\n\nAll three are classic portfolio and interview topics because they combine variables, iterators, virtual tables and filter manipulation.',
    },
    {
      heading: 'Calculation groups (introduction)',
      content:
        'If you need YTD, PY, YoY % and QTD versions of 20 base measures, you would write 80 nearly identical measures. A **calculation group** solves this: you write each time-intelligence pattern **once** as a **calculation item**, using `SELECTEDMEASURE()` as a placeholder for whatever measure is in the visual.\n\nCalculation groups can now be created directly in Power BI Desktop (Model view -> Calculation group), as well as in Tabular Editor. When a calculation group is added, the model\'s "discourage implicit measures" setting is turned on, so you must use explicit measures.\n\nExtra features: **format string expressions** (e.g. show % for YoY % item) and **precedence** when multiple groups apply.',
      syntax:
        '-- Calculation group: Time Intelligence, column: Time Calc\n-- Item "Current"\nSELECTEDMEASURE ()\n-- Item "YTD"\nCALCULATE ( SELECTEDMEASURE (), DATESYTD ( \'Date\'[Date] ) )\n-- Item "PY"\nCALCULATE ( SELECTEDMEASURE (), SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\n-- Item "YoY %"\nVAR Cur = SELECTEDMEASURE ()\nVAR PY  = CALCULATE ( SELECTEDMEASURE (), SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nRETURN DIVIDE ( Cur - PY, PY )',
      tip: 'Put the calculation group column on matrix columns and any measure on values: you instantly get Current / YTD / PY / YoY % for that measure.',
    },
  ],
  examples: [
    {
      title: 'Year-over-year growth with variables',
      scenario: 'Management wants YoY Sales Growth % that shows BLANK when there is no prior-year data, instead of a misleading 100% or error.',
      code:
        'Sales YoY % =\nVAR CurrentSales = [Total Sales]\nVAR PriorSales =\n    CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nRETURN\n    IF (\n        NOT ISBLANK ( PriorSales ),\n        DIVIDE ( CurrentSales - PriorSales, PriorSales )\n    )',
      result: 'For 2025: Current = 1,200,000, Prior = 1,000,000 -> 20.0%. For the first year in the data: BLANK.',
      explanation:
        '1. CurrentSales captures the sales in the current filter context (e.g. Year 2025 in a visual).\n2. PriorSales shifts the date filter back one year with SAMEPERIODLASTYEAR inside CALCULATE.\n3. IF without an else branch returns BLANK when there is no prior data.\n4. DIVIDE protects against division by zero. Each measure is evaluated once thanks to variables. Format the measure as Percentage.',
    },
    {
      title: 'Sales by Ship Date using an inactive relationship',
      scenario: 'Logistics wants to see revenue by the month orders were shipped, while the default model analyses by OrderDate.',
      table: {
        headers: ['OrderID', 'OrderDate', 'ShipDate', 'SalesAmount'],
        rows: [
          ['1001', '2025-01-30', '2025-02-02', '500'],
          ['1002', '2025-01-15', '2025-01-18', '300'],
          ['1003', '2025-02-10', '2025-02-12', '200'],
        ],
      },
      code:
        '-- Model: Sales[OrderDate] -> \'Date\'[Date] active\n--        Sales[ShipDate]  -> \'Date\'[Date] inactive\n\nSales by Ship Date =\nCALCULATE (\n    [Total Sales],\n    USERELATIONSHIP ( Sales[ShipDate], \'Date\'[Date] )\n)',
      result: 'January: Total Sales = 800, Sales by Ship Date = 300. February: Total Sales = 200, Sales by Ship Date = 700.',
      explanation:
        'Order 1001 was ordered in January but shipped in February. With USERELATIONSHIP, the Date filter flows through ShipDate instead of OrderDate for this measure only, so 1001 moves to February. Both measures can sit side by side in one visual using the same \'Date\' table.',
    },
    {
      title: 'Dynamic customer segmentation with a disconnected table',
      scenario: 'Classify customers as Bronze / Silver / Gold based on their sales in the selected period and show how many customers and how much revenue fall in each segment.',
      table: {
        headers: ['Segment', 'Min', 'Max'],
        rows: [
          ['Bronze', '0', '1000'],
          ['Silver', '1000', '5000'],
          ['Gold', '5000', '999999999'],
        ],
      },
      code:
        '-- Segments table created with Enter Data (no relationships)\n\nCustomers in Segment =\nCOUNTROWS (\n    FILTER (\n        VALUES ( Customer[CustomerID] ),\n        VAR CustSales = [Total Sales]\n        RETURN\n            CustSales > 0\n                && CustSales >= MIN ( Segments[Min] )\n                && CustSales <  MAX ( Segments[Max] )\n    )\n)\n\nSales in Segment =\nCALCULATE (\n    [Total Sales],\n    FILTER (\n        VALUES ( Customer[CustomerID] ),\n        VAR CustSales = [Total Sales]\n        RETURN\n            CustSales > 0\n                && CustSales >= MIN ( Segments[Min] )\n                && CustSales <  MAX ( Segments[Max] )\n    )\n)',
      result: 'A table visual with Segments[Segment], [Customers in Segment] and [Sales in Segment] shows e.g. Bronze 420 / 180K, Silver 150 / 390K, Gold 30 / 610K.',
      explanation:
        'Put Segments[Segment] on rows. For each row, MIN/MAX(Segments[...]) return that segment\'s boundaries. FILTER iterates every customer visible in the current context; [Total Sales] triggers context transition so it is calculated per customer, then compared with the boundaries. Because everything is a measure, changing a Year slicer re-segments customers instantly. Sort Segments[Segment] by Min for correct order.',
    },
    {
      title: 'ABC (Pareto) classification of products',
      scenario: 'Classify each product into A (top 70% of cumulative sales), B (next 20%) or C (last 10%) for inventory prioritisation.',
      code:
        'Cumulative Sales % =\nVAR CurrentProductSales = [Total Sales]\nVAR AllProducts =\n    ADDCOLUMNS (\n        ALLSELECTED ( Product[ProductName] ),\n        "@Sales", [Total Sales]\n    )\nVAR CumulativeSales =\n    SUMX (\n        FILTER ( AllProducts, [@Sales] >= CurrentProductSales ),\n        [@Sales]\n    )\nVAR GrandTotal = SUMX ( AllProducts, [@Sales] )\nRETURN\n    IF ( NOT ISBLANK ( CurrentProductSales ), DIVIDE ( CumulativeSales, GrandTotal ) )\n\nABC Class =\nVAR p = [Cumulative Sales %]\nRETURN\n    SWITCH (\n        TRUE (),\n        ISBLANK ( p ), BLANK (),\n        p <= 0.70, "A",\n        p <= 0.90, "B",\n        "C"\n    )',
      result: 'In a table sorted by Total Sales descending, the first few products show cumulative 25%, 46%, 63%, 71%... and classes A, A, A, B...',
      explanation:
        '1. AllProducts is a virtual table of every product currently selected (ALLSELECTED removes the row filter from the visual but keeps slicers) with its sales.\n2. For the current product, we sum the sales of all products whose sales are greater than or equal to its own: that is the running total in descending order.\n3. Dividing by the grand total gives the cumulative %.\n4. SWITCH(TRUE()) assigns the class. Combine Total Sales (columns) and Cumulative Sales % (line) in a Line and clustered column chart to get a Pareto chart.\nNote: products with identical sales get the same cumulative value (ties); that is acceptable for ABC analysis.',
    },
    {
      title: 'New vs returning customers',
      scenario: 'Marketing wants, for every month, how many customers bought for the first time and how many were returning, plus revenue from new customers.',
      code:
        'New Customers =\nVAR CustomersInPeriod = VALUES ( Sales[CustomerID] )\nVAR PeriodStart = MIN ( \'Date\'[Date] )\nRETURN\n    COUNTROWS (\n        FILTER (\n            CustomersInPeriod,\n            CALCULATE (\n                MIN ( Sales[OrderDate] ),\n                ALL ( \'Date\' )\n            ) >= PeriodStart\n        )\n    )\n\nReturning Customers = [Customers] - [New Customers]\n\nNew Customer Sales =\nVAR PeriodStart = MIN ( \'Date\'[Date] )\nRETURN\n    SUMX (\n        VALUES ( Sales[CustomerID] ),\n        VAR FirstPurchase =\n            CALCULATE ( MIN ( Sales[OrderDate] ), ALL ( \'Date\' ) )\n        RETURN\n            IF ( FirstPurchase >= PeriodStart, [Total Sales] )\n    )',
      result: 'Jan-2025: Customers 500, New 120, Returning 380. Feb-2025: Customers 520, New 95, Returning 425.',
      explanation:
        'For each customer active in the period, CALCULATE with ALL(\'Date\') removes the date filter, so MIN(Sales[OrderDate]) returns that customer\'s first-ever order date (context transition filters to the current customer). If the first purchase is on or after the start of the current period, the customer is new in this period (it cannot be after the period end, because the customer bought within the period). Returning = all active customers minus new ones. If Customer[FirstPurchaseDate] is stored as a column, you can use it instead for better performance.',
    },
    {
      title: 'Budget vs Actual with TREATAS (no relationship)',
      scenario: 'A Budget table exists at Category and YearMonth grain (columns Category, YearMonth, BudgetAmount). It is not related to Product or \'Date\' because the grain differs.',
      code:
        'Budget Amount =\nCALCULATE (\n    SUM ( Budget[BudgetAmount] ),\n    TREATAS ( VALUES ( Product[Category] ), Budget[Category] ),\n    TREATAS ( VALUES ( \'Date\'[YearMonth] ), Budget[YearMonth] )\n)\n\nVariance vs Budget = [Total Sales] - [Budget Amount]\nVariance % = DIVIDE ( [Variance vs Budget], [Budget Amount] )',
      result: 'A matrix with Product[Category] on rows and \'Date\'[YearMonth] on columns shows Actual, Budget and Variance correctly per cell.',
      explanation:
        'VALUES(Product[Category]) returns the categories visible in the current cell; TREATAS applies them as a filter on Budget[Category] as if there were a relationship. Same for YearMonth. Filtering by a Product[ProductName] works too: it reduces the visible categories, so the whole category budget is shown (budget cannot be split below its grain). The alternative is to create Category and Month dimension tables and relate both facts to them.',
    },
    {
      title: 'Top N products with a virtual table and RANKX',
      scenario: 'Show total sales of the top 5 products in the current selection as a single card, and a rank measure for a table visual.',
      code:
        'Top 5 Products Sales =\nVAR Top5 =\n    TOPN (\n        5,\n        ALLSELECTED ( Product[ProductName] ),\n        [Total Sales], DESC\n    )\nRETURN\n    CALCULATE ( [Total Sales], KEEPFILTERS ( Top5 ) )\n\nProduct Rank =\nIF (\n    ISINSCOPE ( Product[ProductName] ),\n    RANKX ( ALLSELECTED ( Product[ProductName] ), [Total Sales], , DESC, DENSE )\n)\n\nTop 5 Share % = DIVIDE ( [Top 5 Products Sales], CALCULATE ( [Total Sales], ALLSELECTED ( Product ) ) )',
      explanation:
        'TOPN returns a table of the 5 product names with the highest sales within the current selection. Passing it as a filter to CALCULATE restricts Total Sales to those products. ISINSCOPE ensures the rank shows only at product level, not on the total row. DENSE ranking gives consecutive ranks for ties.',
    },
  ],
  interview: [
    {
      q: 'Why should you use variables in DAX? Are there any pitfalls?',
      a: 'Benefits: readability (name each step), performance (an expression is evaluated once even if used several times), and debugging (RETURN an intermediate variable).\n\nPitfall: a variable is evaluated once, in the filter context where it is defined. Example:\n\n`VAR s = [Total Sales] RETURN CALCULATE(s, \'Date\'[Year] = 2024)` returns the current-context sales, not 2024 sales, because s is already a constant. The fix is to put the measure reference inside CALCULATE.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between RELATED and RELATEDTABLE? When would you use LOOKUPVALUE instead?',
      a: 'RELATED goes from the many side to the one side and returns one value (e.g. product category on each Sales row). RELATEDTABLE goes from the one side to the many side and returns a table (e.g. all sales rows of a product, often wrapped in COUNTROWS or SUMX). Both require a relationship and a row context.\n\nLOOKUPVALUE requires no relationship; it matches values on one or more columns. Use it only when a relationship is impossible or undesirable (e.g. multi-column lookup to a rate table with date ranges handled separately). It is slower and errors if multiple different values match unless you supply an alternate result.',
      level: 'Easy',
    },
    {
      q: 'Your Sales table has OrderDate, ShipDate and DueDate. How do you analyse sales by all three dates with one Date table?',
      a: 'Create three relationships from Sales to \'Date\'[Date]. Only one can be active (usually OrderDate); the other two are inactive. Then write measures that activate the inactive ones:\n\n`Sales by Ship Date = CALCULATE([Total Sales], USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date]))`\n\nAlternative: create role-playing copies of the Date table (Ship Date, Due Date) with active relationships. That is simpler for users who want separate slicers but increases model size and slicers do not interact across them.',
      level: 'Medium',
    },
    {
      q: 'When would you use CROSSFILTER instead of setting a relationship to bi-directional?',
      a: 'Bi-directional relationships in the model affect every visual and every measure: they can cause ambiguity, unexpected results, and performance problems, and they are risky with RLS. CROSSFILTER(col1, col2, Both) enables bi-directional filtering only inside one CALCULATE, so you get the behaviour exactly where you need it (e.g. count of products that were sold to the customers selected in a slicer) and keep the rest of the model single-direction. CROSSFILTER(..., None) can also disable a relationship inside a measure.',
      level: 'Medium',
    },
    {
      q: 'Explain SWITCH(TRUE()). Why is it preferred over nested IFs?',
      a: 'SWITCH compares an expression to values. When the expression is TRUE(), each "value" can be a logical condition; SWITCH returns the result for the first condition that evaluates to TRUE. It replaces deeply nested IF(..., IF(..., IF(...))) with a flat, readable list that is easy to extend. Ordering matters: put specific/strict conditions first, and handle BLANK explicitly before numeric comparisons.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between SUMMARIZE and SUMMARIZECOLUMNS?',
      a: 'SUMMARIZE(table, groupby columns) groups a base table by columns reachable through relationships. Adding calculated expressions inside SUMMARIZE is discouraged (it can produce unexpected results due to clustering); best practice is ADDCOLUMNS(SUMMARIZE(...), "@x", [Measure]).\n\nSUMMARIZECOLUMNS(groupby columns, filter tables, "Name", expression) is the optimized function that Power BI visuals generate. It automatically removes rows where all expressions are BLANK, and is generally faster. Historically it could not be used in measures with context transition; since 2023 most of those restrictions were lifted, but SUMMARIZE + ADDCOLUMNS remains common inside measures, and SUMMARIZECOLUMNS in calculated tables and DAX queries.',
      level: 'Hard',
    },
    {
      q: 'What is TREATAS and give a real use case.',
      a: 'TREATAS applies the values of a table as filters on columns of another table, creating a virtual relationship. Use case: a Budget table at Category/Month grain cannot relate to Product (ProductID grain). `CALCULATE(SUM(Budget[Amount]), TREATAS(VALUES(Product[Category]), Budget[Category]))` filters the budget by the categories currently selected. It is faster and cleaner than FILTER(ALL(Budget), Budget[Category] IN VALUES(Product[Category])).',
      level: 'Medium',
    },
    {
      q: 'Scenario: a manager wants customers grouped into High/Medium/Low value tiers that change when the Year slicer changes. A calculated column does not work. Why, and what do you build?',
      a: 'Calculated columns are computed at refresh time, not query time, so they ignore slicers: a tier column based on lifetime sales will never change with a Year slicer.\n\nBuild dynamic segmentation: a disconnected Tiers table (Tier, Min, Max), and a measure that iterates VALUES(Customer[CustomerID]), computes [Total Sales] per customer via context transition, and counts or sums customers whose sales fall between MIN(Tiers[Min]) and MAX(Tiers[Max]). Put Tiers[Tier] on axis and the measure on values. Because it is evaluated per query, tiers respond to every slicer.',
      level: 'Hard',
    },
    {
      q: 'How would you implement a Pareto / ABC analysis in Power BI?',
      a: '1) Base measure [Total Sales]. 2) A virtual table of products with their sales: ADDCOLUMNS(ALLSELECTED(Product[ProductName]), "@Sales", [Total Sales]). 3) Cumulative sales for the current product = SUMX of products whose @Sales >= current product sales. 4) Cumulative % = cumulative / grand total. 5) SWITCH(TRUE()) classification: <=70% A, <=90% B, else C. Visual: line and clustered column chart, products sorted by sales descending, columns = Total Sales, line = Cumulative %. Mention tie handling and that ALLSELECTED makes it respond to slicers.',
      level: 'Hard',
    },
    {
      q: 'How do you count new vs returning customers per month?',
      a: 'For each customer in the current period (VALUES(Sales[CustomerID])), compute the first purchase date ignoring date filters: CALCULATE(MIN(Sales[OrderDate]), ALL(\'Date\')). If it is >= MIN(\'Date\'[Date]) of the current period, the customer is new; count with COUNTROWS(FILTER(...)). Returning = DISTINCTCOUNT(customers) - New. For performance on large models, precompute Customer[FirstPurchaseDate] in Power Query or as a calculated column and compare to the period.',
      level: 'Hard',
    },
    {
      q: 'What are calculation groups and what problem do they solve?',
      a: 'Calculation groups are a model object containing calculation items that modify whatever measure is in context through SELECTEDMEASURE(). They solve "measure explosion": instead of creating YTD, PY, YoY% for every base measure (N x M measures), you create M calculation items once and they work for all measures. They support format string expressions (so YoY % shows as a percent) and precedence when several groups exist. They can be authored in Power BI Desktop model view or Tabular Editor. Adding one forces explicit measures (implicit measures are discouraged).',
      level: 'Medium',
    },
    {
      q: 'What is context transition and where does it happen in advanced patterns?',
      a: 'Context transition converts the current row context into an equivalent filter context. It happens when CALCULATE is called inside a row context, and every measure reference is implicitly wrapped in CALCULATE. Example: SUMX(VALUES(Customer[CustomerID]), [Total Sales]) - for each customer row, [Total Sales] becomes CALCULATE(SUM(...)) filtered to that customer. Segmentation, ABC analysis, and new customer patterns all rely on it. Be careful: context transition on a table without a unique key (e.g. iterating Sales with duplicate rows) can produce wrong, inflated numbers and is expensive.',
      level: 'Hard',
    },
    {
      q: 'Scenario: Your measure using LOOKUPVALUE returns the error "A table of multiple values was supplied where a single value was expected". What happened and how do you fix it?',
      a: 'LOOKUPVALUE found more than one row with different result values for the given search criteria (e.g. a product with two prices). Fixes: add more search columns to make the match unique (e.g. effective date), clean duplicates in Power Query, supply an alternate_result as the last argument to return a default instead of an error, or use an aggregation such as CALCULATE(MAX(Price[Price]), Price[ProductID] = ...) if any matching value is acceptable.',
      level: 'Medium',
    },
    {
      q: 'Difference between ALL, ALLSELECTED and REMOVEFILTERS in advanced measures like % of total?',
      a: 'ALL(table/column) removes all filters, including slicers - "% of grand total ignoring everything". REMOVEFILTERS is an alias of ALL usable only as a CALCULATE modifier, clearer in intent. ALLSELECTED removes filters coming from the visual (rows/columns) but keeps filters from outside the visual (slicers, page filters) - "% of visible total". For a Pareto that reacts to slicers, use ALLSELECTED; for share of company total, use ALL/REMOVEFILTERS.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write a measure "Avg Order Value" = Total Sales / number of orders, using variables, returning BLANK when there are no orders.',
      hint: 'Two variables and DIVIDE.',
      solution:
        'Avg Order Value =\nVAR SalesAmt = [Total Sales]\nVAR OrderCnt = DISTINCTCOUNT ( Sales[OrderID] )\nRETURN\n    DIVIDE ( SalesAmt, OrderCnt )\n\nDIVIDE returns BLANK when OrderCnt is 0 or BLANK.',
    },
    {
      task: 'Sales has OrderDate (active relationship) and ShipDate (inactive) to \'Date\'. Create "Orders Shipped" counting distinct orders by ship date, and "Avg Days to Ship".',
      hint: 'USERELATIONSHIP for the first; AVERAGEX over Sales for the second.',
      solution:
        'Orders Shipped =\nCALCULATE (\n    DISTINCTCOUNT ( Sales[OrderID] ),\n    USERELATIONSHIP ( Sales[ShipDate], \'Date\'[Date] )\n)\n\nAvg Days to Ship =\nAVERAGEX ( Sales, DATEDIFF ( Sales[OrderDate], Sales[ShipDate], DAY ) )',
    },
    {
      task: 'Create a measure "Stock Status" that returns "Out of stock" when [Units On Hand] = 0, "Reorder" when below 50, "OK" when 50-500, and "Overstock" above 500.',
      hint: 'SWITCH(TRUE()) and order the conditions.',
      solution:
        'Stock Status =\nVAR u = [Units On Hand]\nRETURN\n    SWITCH (\n        TRUE (),\n        ISBLANK ( u ), BLANK (),\n        u = 0, "Out of stock",\n        u < 50, "Reorder",\n        u <= 500, "OK",\n        "Overstock"\n    )',
    },
    {
      task: 'Return the highest monthly sales in the selected year (a single number for a card).',
      hint: 'Build a virtual table of months with their sales, then MAXX.',
      solution:
        'Max Monthly Sales =\nMAXX (\n    ADDCOLUMNS (\n        SUMMARIZE ( Sales, \'Date\'[Year], \'Date\'[MonthNumber] ),\n        "@Sales", [Total Sales]\n    ),\n    [@Sales]\n)\n\nAlternative simpler form: MAXX ( VALUES ( \'Date\'[YearMonth] ), [Total Sales] )',
    },
    {
      task: 'A Targets table (Country, Year, Target) is not related to the model. Write a "Target" measure that respects Customer[Country] and \'Date\'[Year] slicers, and "Achievement %".',
      hint: 'Two TREATAS filters.',
      solution:
        'Target =\nCALCULATE (\n    SUM ( Targets[Target] ),\n    TREATAS ( VALUES ( Customer[Country] ), Targets[Country] ),\n    TREATAS ( VALUES ( \'Date\'[Year] ), Targets[Year] )\n)\n\nAchievement % = DIVIDE ( [Total Sales], [Target] )',
    },
    {
      task: 'Count customers who bought in the current period AND also bought in the same period last year (retained customers).',
      hint: 'Iterate customers of current period; check prior-year sales per customer.',
      solution:
        'Retained Customers =\nCOUNTROWS (\n    FILTER (\n        VALUES ( Sales[CustomerID] ),\n        CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) ) > 0\n    )\n)\n\nFILTER iterates customers active now; context transition evaluates their prior-year sales.',
    },
    {
      task: 'Create a calculated table "Price Steps" containing values from 0 to 100 in steps of 10, and a calculated table with total sales per Category and Year using SUMMARIZECOLUMNS.',
      hint: 'GENERATESERIES and SUMMARIZECOLUMNS.',
      solution:
        'Price Steps = GENERATESERIES ( 0, 100, 10 )   -- column name: Value\n\nCategory Year Sales =\nSUMMARIZECOLUMNS (\n    Product[Category],\n    \'Date\'[Year],\n    "Sales", [Total Sales]\n)',
    },
  ],
  quiz: [
    {
      question: 'What does this measure return in a visual filtered to 2025?\nVAR s = [Total Sales]\nRETURN CALCULATE ( s, \'Date\'[Year] = 2024 )',
      options: ['Sales for 2024', 'Sales for 2025', 'BLANK', 'An error'],
      answer: 1,
      explanation: 'The variable is evaluated once in the current filter context (2025). CALCULATE cannot change an already-evaluated variable.',
    },
    {
      question: 'Which function activates an inactive relationship within a calculation?',
      options: ['CROSSFILTER', 'TREATAS', 'USERELATIONSHIP', 'RELATED'],
      answer: 2,
      explanation: 'USERELATIONSHIP, used as a CALCULATE modifier, activates an existing inactive relationship.',
    },
    {
      question: 'You are in a calculated column of the Product table and need the number of sales rows for each product. Which is correct?',
      options: ['RELATED(Sales[OrderID])', 'COUNTROWS(RELATEDTABLE(Sales))', 'LOOKUPVALUE(Sales[OrderID], Sales[ProductID], Product[ProductID])', 'COUNT(Sales[OrderID])'],
      answer: 1,
      explanation: 'RELATEDTABLE goes from the one side (Product) to the many side (Sales). COUNT alone would return the total of all rows because there is no filter context in a calculated column.',
    },
    {
      question: 'What does GENERATESERIES(1, 10, 3) return?',
      options: ['1, 4, 7, 10', '1, 3, 5, 7, 9', '3 random numbers', '1, 10'],
      answer: 0,
      explanation: 'Starts at 1 and adds 3 until the end value is exceeded: 1, 4, 7, 10.',
    },
    {
      question: 'Which is the best function to filter a Budget table by Product[Category] when no relationship exists?',
      options: ['RELATED', 'USERELATIONSHIP', 'TREATAS', 'CROSSFILTER'],
      answer: 2,
      explanation: 'TREATAS creates a virtual relationship by applying values as a filter on another column. USERELATIONSHIP and CROSSFILTER need an existing relationship.',
    },
    {
      question: 'In a calculation group, which function refers to the measure currently in the visual?',
      options: ['SELECTEDVALUE()', 'SELECTEDMEASURE()', 'ISINSCOPE()', 'CURRENTMEASURE()'],
      answer: 1,
      explanation: 'SELECTEDMEASURE() is the placeholder for the measure being modified by the calculation item.',
    },
  ],
};
