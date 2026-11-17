export default {
  id: 'day-35-variables-context-transition',
  title: 'Variables (VAR), Context Transition, Dynamic Measures',
  module: 'Module 6: Advanced Power BI',
  day: 35,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Variables make DAX readable, faster and easier to debug. Context transition explains how CALCULATE (and every measure reference) turns a row context into a filter context. Dynamic measures let one visual switch between Sales, Profit and Quantity using a slicer.',
  objectives: [
    'Write measures with VAR / RETURN and explain when a variable is evaluated',
    'Explain context transition and predict its result in calculated columns and iterators',
    'Use measure references inside iterators knowing they trigger an implicit CALCULATE',
    'Build a dynamic measure driven by a disconnected selector table and SWITCH',
  ],
  theory: [
    {
      heading: 'Variables: VAR and RETURN',
      content:
        "A variable stores the result of an expression under a name so you can reuse it. Syntax: one or more `VAR name = expression` lines followed by one `RETURN` expression.\n\nWhy use variables:\n\n- **Readability**: break a long formula into named steps, like rough work in a maths notebook.\n- **Performance**: an expression stored in a variable is computed once, not every time it is used.\n- **Debugging**: temporarily `RETURN` an intermediate variable to check its value.\n\nVariables can hold a single value (scalar) or a table, e.g. `VAR TopProducts = TOPN(3, Product, [Total Sales])`.",
      syntax: "Measure Name =\nVAR Var1 = <expression>\nVAR Var2 = <expression using Var1>\nRETURN\n    <result expression>",
      tip: 'Name variables clearly (CurrentSales, PrevSales). A variable name cannot contain spaces and cannot be the same as a table name.',
    },
    {
      heading: 'Variables are evaluated where they are defined',
      content:
        "A variable is computed **once**, in the context where it is written, and then it is a constant. This is the most common surprise:\n\n`VAR S = [Total Sales] RETURN CALCULATE(S, ALL(Product))` does **not** return the grand total. `S` was already computed in the current filter context; CALCULATE cannot change a value that is already fixed.\n\nCorrect version: put the expression inside CALCULATE, e.g. `VAR AllSales = CALCULATE([Total Sales], ALL(Product))`.",
      points: [
        'Variables are constants after definition.',
        'CALCULATE filters cannot reach inside an already evaluated variable.',
        'A variable defined inside an iterator is evaluated for each row of that iterator.',
      ],
    },
    {
      heading: 'Context transition',
      content:
        "**Context transition** is the conversion of the current row context into an equivalent filter context. It happens whenever `CALCULATE` (or `CALCULATETABLE`) is executed inside a row context.\n\nExample: on the Customer table, a calculated column `= SUM(Sales[SalesAmount])` shows the grand total on every row (Day 34). But `= CALCULATE(SUM(Sales[SalesAmount]))` shows each customer's own sales, because CALCULATE takes the current Customer row and turns it into a filter Customer = this row, which flows to Sales through the relationship.\n\nAnalogy: row context is you pointing at a name in a register. Context transition is the teacher saying 'Show me only this student's marks', turning the pointer into a filter.",
      syntax: "Customer Sales (column) = CALCULATE ( SUM ( Sales[SalesAmount] ) )",
    },
    {
      heading: 'Every measure reference has a hidden CALCULATE',
      content:
        "When you reference a measure, DAX automatically wraps it in CALCULATE. So `[Total Sales]` inside an iterator behaves like `CALCULATE(SUM(Sales[SalesAmount]))` and triggers context transition.\n\nThat is why these work:\n\n- `AVERAGEX(VALUES(Customer[Customer]), [Total Sales])`: average sales per customer.\n- `COUNTROWS(FILTER(Customer, [Total Sales] > 20000))`: number of customers above 20,000.\n\nCautions:\n\n1. Context transition filters by **all columns** of the current row. If the table has duplicate rows (e.g. iterating over Sales without a unique key), results can be multiplied or wrong.\n2. Context transition is expensive on large tables; iterate over a small dimension or `VALUES(column)` instead of the fact table when possible.",
      tip: 'Rule of thumb: always reference measures with no table prefix, [Total Sales], and columns with the table prefix, Sales[SalesAmount]. Then you can instantly see where hidden CALCULATEs are.',
    },
    {
      heading: 'Dynamic measures with a selector table',
      content:
        "A **dynamic measure** changes what it calculates based on the user's choice in a slicer. The classic pattern:\n\n1. Create a small **disconnected table** (no relationship) with options, e.g. Metric = Sales, Profit, Quantity, using Home > Enter data.\n2. Put that column in a slicer (single select).\n3. Write a measure that reads the selection with `SELECTEDVALUE` and returns a different measure with `SWITCH`.\n\nThe table must stay disconnected so it does not filter the fact table. Today, **field parameters** (Day 36) can do this without DAX, but the SWITCH pattern is still common in interviews and is needed when you also want custom logic (formatting, different calculations).",
      syntax: "Selected Metric =\nSWITCH (\n    SELECTEDVALUE ( 'Metric Selector'[Metric], \"Sales\" ),\n    \"Sales\", [Total Sales],\n    \"Profit\", [Profit],\n    \"Quantity\", [Total Quantity]\n)",
    },
  ],
  examples: [
    {
      title: 'Profit margin with variables',
      scenario: 'Calculate profit margin % using the 5-row sample slice (Sales 1,86,500, Cost 1,46,000).',
      table: {
        headers: ['Category', 'Sales', 'Cost', 'Margin %'],
        rows: [
          ['Electronics', '1,50,000', '1,20,000', '20.00%'],
          ['Accessories', '12,500', '8,000', '36.00%'],
          ['Furniture', '24,000', '18,000', '25.00%'],
          ['Total', '1,86,500', '1,46,000', '21.72%'],
        ],
      },
      steps: [
        'Modeling > New measure and enter the formula below',
        'Measure tools > Format: Percentage, 2 decimals',
        'Add a Table visual with Product[Category] and [Margin %]',
      ],
      code: `Margin % =
VAR SalesAmt = SUM ( Sales[SalesAmount] )
VAR CostAmt  = SUM ( Sales[Cost] )
VAR ProfitAmt = SalesAmt - CostAmt
RETURN
    DIVIDE ( ProfitAmt, SalesAmt )`,
      result: 'Electronics 20.00%, Accessories 36.00%, Furniture 25.00%, Total 21.72% (40,500 / 1,86,500).',
      explanation: 'Each variable is computed once per cell. The formula reads like steps and you can RETURN ProfitAmt temporarily to check it.',
    },
    {
      title: 'Context transition in a calculated column',
      scenario: 'Add each customer total sales as a column on the Customer table.',
      table: {
        headers: ['Customer', 'City', 'No CALCULATE', 'With CALCULATE'],
        rows: [
          ['Asha', 'Pune', '1,86,500', '1,24,000'],
          ['Ravi', 'Mumbai', '1,86,500', '12,500'],
          ['Neha', 'Nagpur', '1,86,500', '50,000'],
        ],
      },
      steps: [
        'Table view > select the Customer table',
        'Table tools > New column: No CALCULATE = SUM(Sales[SalesAmount])',
        'Table tools > New column: With CALCULATE (formula below)',
        'Compare the two columns',
      ],
      code: `With CALCULATE = CALCULATE ( SUM ( Sales[SalesAmount] ) )`,
      result: 'Without CALCULATE every row shows 1,86,500. With CALCULATE: Asha 1,24,000, Ravi 12,500, Neha 50,000.',
      explanation: 'CALCULATE converts the Customer row context into a filter on Customer, which flows to Sales via Customer[CustomerID] → Sales[CustomerID].',
    },
    {
      title: 'Measures inside iterators (implicit CALCULATE)',
      scenario: 'Count customers whose total sales exceed 20,000 and compute average sales per customer.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['Big Customers', '2 (Asha, Neha)'],
          ['Avg Sales per Customer', '62,166.67'],
        ],
      },
      steps: [
        'Modeling > New measure: Big Customers (below)',
        'Modeling > New measure: Avg Sales per Customer (below)',
        'Show both in Card visuals',
      ],
      code: `Big Customers =
COUNTROWS ( FILTER ( Customer, [Total Sales] > 20000 ) )

Avg Sales per Customer =
AVERAGEX ( VALUES ( Customer[Customer] ), [Total Sales] )`,
      result: 'Big Customers = 2. Avg Sales per Customer = 1,86,500 / 3 = 62,166.67.',
      explanation: 'FILTER and AVERAGEX create row context on customers; referencing [Total Sales] triggers context transition so each customer gets its own sales.',
    },
    {
      title: 'The variable trap',
      scenario: 'A developer tries to compute % of total by applying CALCULATE to a variable.',
      table: {
        headers: ['Category', 'Wrong %', 'Correct %'],
        rows: [
          ['Electronics', '100%', '80.43%'],
          ['Accessories', '100%', '6.70%'],
          ['Furniture', '100%', '12.87%'],
        ],
      },
      steps: [
        'Modeling > New measure: Wrong % (below)',
        'Modeling > New measure: Correct % (below)',
        'Put both in the category table and compare',
      ],
      code: `Wrong % =
VAR S = [Total Sales]
RETURN DIVIDE ( S, CALCULATE ( S, ALL ( Product ) ) )

Correct % =
VAR S = [Total Sales]
VAR AllS = CALCULATE ( [Total Sales], ALL ( Product ) )
RETURN DIVIDE ( S, AllS )`,
      result: 'Wrong % shows 100% on every row; Correct % shows 80.43%, 6.70%, 12.87%.',
      explanation: 'S is a constant once defined, so CALCULATE(S, ...) still returns S. The expression to re-evaluate must be written inside CALCULATE.',
    },
    {
      title: 'Dynamic measure with a metric slicer',
      scenario: 'One column chart by Category should show Sales, Profit or Quantity depending on a slicer.',
      table: {
        headers: ['Category', 'Sales', 'Profit', 'Quantity'],
        rows: [
          ['Electronics', '1,50,000', '30,000', '3'],
          ['Accessories', '12,500', '4,500', '15'],
          ['Furniture', '24,000', '6,000', '4'],
        ],
      },
      steps: [
        'Home > Enter data. Name the table Metric Selector, one column Metric with rows Sales, Profit, Quantity. Click Load',
        'In Model view confirm Metric Selector has NO relationship',
        'Create measures Profit and Total Quantity (below), then Selected Metric',
        'Add a slicer with Metric Selector[Metric]; Format > Slicer settings > Selection > Single select on',
        'Add a clustered column chart: X-axis Product[Category], Y-axis [Selected Metric]',
        'Optional dynamic title: Format > Title > fx > Field value > [Metric Title]',
      ],
      code: `Profit = SUM ( Sales[SalesAmount] ) - SUM ( Sales[Cost] )
Total Quantity = SUM ( Sales[Quantity] )

Selected Metric =
SWITCH (
    SELECTEDVALUE ( 'Metric Selector'[Metric], "Sales" ),
    "Sales", [Total Sales],
    "Profit", [Profit],
    "Quantity", [Total Quantity]
)

Metric Title =
SELECTEDVALUE ( 'Metric Selector'[Metric], "Sales" ) & " by Category"`,
      result: 'Choosing Profit shows 30,000 / 4,500 / 6,000; choosing Quantity shows 3 / 15 / 4; the title follows the choice.',
      explanation: 'SELECTEDVALUE reads the single slicer choice (default Sales). SWITCH returns the matching measure. The disconnected table does not filter Sales.',
    },
  ],
  interview: [
    {
      q: 'What are the benefits of using variables in DAX?',
      a: 'Readability (named steps), performance (expression evaluated once and reused), and debugging (RETURN an intermediate variable). They also avoid repeating the same sub-expression.',
      level: 'Easy',
    },
    {
      q: 'When is a DAX variable evaluated?',
      a: 'Once, in the evaluation context where it is defined. After that it is a constant; CALCULATE applied later cannot change its value.',
      level: 'Medium',
    },
    {
      q: 'What is context transition?',
      a: 'The transformation of the current row context into an equivalent filter context, performed by CALCULATE/CALCULATETABLE. Because every measure reference is wrapped in an implicit CALCULATE, referencing a measure inside an iterator or calculated column also causes context transition.',
      level: 'Medium',
    },
    {
      q: 'Scenario: SUMX(Sales, [Total Sales]) gives a larger number than expected. Why?',
      a: 'The measure reference triggers context transition for each Sales row, filtering by all columns of that row. If Sales has duplicate rows (same values in every column), each duplicate filter returns all matching rows, so amounts are counted multiple times. It is also slow. Use SUMX(Sales, Sales[SalesAmount]) or iterate a dimension.',
      level: 'Hard',
    },
    {
      q: 'Why should you avoid writing measure references with a table prefix like Sales[Total Sales]?',
      a: 'It makes measures look like columns. Since measure references carry an implicit CALCULATE (context transition) and columns do not, the convention [Measure] vs Table[Column] tells readers where context transition happens.',
      level: 'Medium',
    },
    {
      q: 'How do you build a measure that switches between Sales, Profit and Quantity with a slicer?',
      a: 'Create a disconnected table of metric names, use it in a single-select slicer, and write SWITCH(SELECTEDVALUE(Table[Metric], "Sales"), "Sales", [Total Sales], "Profit", [Profit], ...). Alternatively use a field parameter (Modeling > New parameter > Fields).',
      level: 'Medium',
    },
    {
      q: 'What does SELECTEDVALUE return when the user selects two items in the slicer?',
      a: 'The alternate result (second argument) or BLANK if none is given, because there is not exactly one value in the filter context.',
      level: 'Easy',
    },
    {
      q: 'Is a dynamic measure built with SWITCH slower than separate measures?',
      a: 'Usually not noticeably: modern engines only evaluate the branch that matches when the selection is a single value. But putting heavy logic inside many branches and calling it in large visuals can add cost; keep branches as simple measure references.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Rewrite Sales Growth % (this year vs last year) using variables.',
      hint: 'Use SAMEPERIODLASTYEAR on the Date table.',
      solution: `Sales Growth % =
VAR CurrentSales = [Total Sales]
VAR PrevSales =
    CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
RETURN
    DIVIDE ( CurrentSales - PrevSales, PrevSales )`,
    },
    {
      task: 'Add a calculated column on Product with total sales of that product.',
      hint: 'Use CALCULATE for context transition.',
      solution: `Product Sales = CALCULATE ( SUM ( Sales[SalesAmount] ) )
-- Sample: Laptop 1,50,000, Mouse 5,000, Chair 24,000, Keyboard 7,500`,
    },
    {
      task: 'Count products whose sales are above the average product sales.',
      hint: 'Compute the average once in a variable, then FILTER products.',
      solution: `Above Avg Products =
VAR AvgSales = AVERAGEX ( VALUES ( Product[Product] ), [Total Sales] )
RETURN
    COUNTROWS (
        FILTER ( VALUES ( Product[Product] ), [Total Sales] > AvgSales )
    )
-- Sample: average = 1,86,500 / 4 = 46,625; only Laptop is above, result 1.`,
    },
    {
      task: 'Build a dynamic measure that switches between Total Sales and Average Order Value using a disconnected table.',
      hint: 'Average Order Value = DIVIDE([Total Sales], DISTINCTCOUNT(Sales[OrderID])).',
      solution: `Avg Order Value = DIVIDE ( [Total Sales], DISTINCTCOUNT ( Sales[OrderID] ) )

KPI Switch =
SWITCH (
    SELECTEDVALUE ( 'KPI Selector'[KPI], "Sales" ),
    "Sales", [Total Sales],
    "AOV", [Avg Order Value]
)`,
    },
    {
      task: 'Return the name of the best-selling category in a card using variables.',
      hint: 'TOPN(1, ...) returns a table; use CONCATENATEX or MAXX to read the name.',
      solution: `Top Category =
VAR TopCat = TOPN ( 1, VALUES ( Product[Category] ), [Total Sales] )
RETURN
    CONCATENATEX ( TopCat, Product[Category], ", " )
-- Sample: Electronics`,
    },
  ],
  quiz: [
    {
      question: 'Which keyword ends the variable section and gives the result?',
      options: ['END', 'RETURN', 'RESULT', 'THEN'],
      answer: 1,
      explanation: 'VAR definitions are followed by exactly one RETURN expression.',
    },
    {
      question: 'Context transition is performed by...',
      options: ['FILTER', 'RELATED', 'CALCULATE', 'VALUES'],
      answer: 2,
      explanation: 'CALCULATE (and CALCULATETABLE) turn row context into filter context; measure references have an implicit CALCULATE.',
    },
    {
      question: 'VAR S = [Total Sales] RETURN CALCULATE(S, ALL(Product)) returns...',
      options: ['Grand total sales', 'Sales of the current context', 'An error', 'BLANK'],
      answer: 1,
      explanation: 'S is already evaluated, so CALCULATE cannot change it.',
    },
    {
      question: 'For a dynamic measure, the metric selector table should be...',
      options: [
        'Related to Sales one-to-many',
        'Related to Product many-to-many',
        'Disconnected (no relationship)',
        'Marked as a date table',
      ],
      answer: 2,
      explanation: 'It only provides a choice to SELECTEDVALUE; a relationship would filter data incorrectly.',
    },
    {
      question: 'On the Customer table, = CALCULATE(SUM(Sales[SalesAmount])) as a column returns...',
      options: ['Grand total on every row', 'Each customer own sales', 'Count of orders', 'An error'],
      answer: 1,
      explanation: 'Context transition filters Sales to the current customer.',
    },
  ],
};
