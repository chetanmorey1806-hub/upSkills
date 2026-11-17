export default {
  id: 'day-24-iterator-functions-x',
  title: 'SUMX(), AVERAGEX(), COUNTX(), MINX(), MAXX()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 24,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'The "X" functions are iterators: they go through a table row by row, calculate an expression for each row, and then aggregate the results. They solve problems that plain SUM or AVERAGE cannot, such as revenue from Quantity x Price, profit per line, average sales per customer and the best month.',
  objectives: [
    'Explain row context and how an iterator creates it',
    'Use SUMX to calculate row-level expressions such as Quantity x UnitPrice and profit',
    'Use AVERAGEX, MINX and MAXX over a table or over VALUES() of a column',
    'Use COUNTX to count non-blank results of an expression',
    'Choose between SUM and SUMX, and between average-of-ratios and ratio-of-totals',
  ],
  theory: [
    {
      heading: 'What is an iterator? (row context)',
      content:
        `SUM(Sales[SalesAmount]) can only add up **one existing column**. But what if the column you need does not exist, for example Quantity x UnitPrice?\n\nAn **iterator** solves this. It:\n1. Takes a **table** (first argument).\n2. Visits each row of that table one by one. While visiting a row, DAX knows the "current row" - this is called **row context**.\n3. Evaluates the **expression** (second argument) for that row.\n4. Aggregates all row results (sum, average, min, max or count).\n\nAnalogy: a cashier scanning a bill line by line - for each line she multiplies quantity by price, then adds everything at the end. SUMX is that cashier.\n\nThe iterator respects the current filter context: in a visual row for "Electronics", SUMX(Sales, ...) only visits Electronics rows.`,
      syntax: `SUMX ( <table>, <expression> )
AVERAGEX ( <table>, <expression> )
MINX ( <table>, <expression> )
MAXX ( <table>, <expression> )
COUNTX ( <table>, <expression> )`,
    },
    {
      heading: 'SUMX(): sum of a row-by-row expression',
      content:
        `SUMX returns the sum of an expression evaluated for every row.\n\n- \`Revenue = SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])\`\n- \`Total Profit = SUMX(Sales, Sales[SalesAmount] - Sales[Cost])\`\n- With a related column: \`List Value = SUMX(Sales, Sales[Quantity] * RELATED(Product[Price]))\`\n\n**SUM vs SUMX**: \`SUM(Sales[SalesAmount])\` is internally the same as \`SUMX(Sales, Sales[SalesAmount])\`. Use SUM when the column exists; use SUMX when you need a calculation per row.\n\n**Why not a calculated column?** You could add a Profit column and then SUM it, but each calculated column is stored in the model and uses memory. A SUMX measure calculates only when needed and keeps the model smaller.`,
      tip: 'Never write SUM(Sales[Quantity]) * SUM(Sales[UnitPrice]) for revenue. It multiplies two totals, which gives a much larger and wrong number. Multiply per row with SUMX.',
    },
    {
      heading: 'AVERAGEX(): average per row or per group',
      content:
        `AVERAGEX evaluates the expression per row and returns the arithmetic mean. Blank results are ignored.\n\nTwo very common patterns:\n- **Average per transaction**: \`Avg Order Value = AVERAGEX(Sales, Sales[SalesAmount])\`.\n- **Average per group** by iterating **VALUES()** of a column: \`Avg Sales per Customer = AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales])\`.\n\nIn the second pattern AVERAGEX visits each customer, calculates that customer's [Total Sales] (a measure inside an iterator automatically filters to the current row - this is called context transition), and averages the results.\n\n- \`Avg Monthly Sales = AVERAGEX(VALUES('Date'[YearMonth]), [Total Sales])\` - months with no sales give BLANK and are skipped.`,
    },
    {
      heading: 'MINX() and MAXX(): smallest and largest result',
      content:
        `MINX and MAXX return the smallest or largest value of the expression across the rows.\n\n- \`Largest Order = MAXX(Sales, Sales[SalesAmount])\`\n- \`Smallest Line Profit = MINX(Sales, Sales[SalesAmount] - Sales[Cost])\`\n- \`Best Customer Sales = MAXX(VALUES(Customer[Customer]), [Total Sales])\` - the sales of the top customer.\n- \`Best Month Sales = MAXX(VALUES('Date'[YearMonth]), [Total Sales])\`\n\nMAXX returns the **value**, not the name. To get the name of the best customer you use TOPN or RANKX (see extra topics), for example \`CONCATENATEX(TOPN(1, VALUES(Customer[Customer]), [Total Sales]), Customer[Customer])\`.`,
    },
    {
      heading: 'COUNTX(): count non-blank results',
      content:
        `COUNTX counts the rows where the expression returns a **non-blank** value (numbers, dates or text are counted; blanks are not).\n\n- \`Orders With Cost = COUNTX(Sales, Sales[Cost])\`\n- \`Bulk Orders = COUNTX(FILTER(Sales, Sales[Quantity] >= 3), Sales[OrderID])\`\n- \`Customers With Sales = COUNTX(VALUES(Customer[Customer]), [Total Sales])\` - counts customers whose total is not blank.\n\nFor simply counting rows, COUNTROWS is clearer and faster. Use COUNTX when the thing you count is an **expression** that may be blank.`,
    },
    {
      heading: 'Average of ratios vs ratio of totals',
      content:
        `A very common interview trap:\n\n- **Ratio of totals** (weighted): \`Margin % = DIVIDE([Total Sales] - [Total Cost], [Total Sales])\`. Big orders count more.\n- **Average of ratios** (simple): \`Avg Line Margin % = AVERAGEX(Sales, DIVIDE(Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount]))\`. Every order counts equally.\n\nBoth are valid DAX but answer different business questions. Finance usually wants the weighted ratio of totals. Always ask which one the business means.\n\nPerformance: iterators over a fact table with millions of rows are fine for simple expressions, but avoid calling complex measures for every fact row. Iterate the smallest table that answers the question (e.g. VALUES of a dimension column).`,
    },
  ],
  examples: [
    {
      title: 'Revenue and profit with SUMX',
      scenario: 'The Sales table has Quantity, UnitPrice and Cost. Create Revenue and Profit measures without adding new columns. Uses the 8-row mini sample from Day 23.',
      table: {
        headers: ['OrderID', 'Quantity', 'UnitPrice', 'Qty x Price', 'Cost', 'Profit'],
        rows: [
          ['1001', '2', '50,000', '1,00,000', '80,000', '20,000'],
          ['1002', '10', '500', '5,000', '3,000', '2,000'],
          ['1003', '3', '4,000', '12,000', '9,000', '3,000'],
          ['1004', '1', '20,000', '20,000', '15,000', '5,000'],
          ['1005', '1', '50,000', '50,000', '40,000', '10,000'],
          ['1006', '2', '4,000', '8,000', '6,000', '2,000'],
          ['1007', '4', '500', '2,000', '1,200', '800'],
          ['1008', '3', '20,000', '60,000', '45,000', '15,000'],
        ],
      },
      steps: [
        'Select the Sales table in the Data pane',
        'Modeling > New measure: Revenue (code below)',
        'Modeling > New measure: Total Profit (code below)',
        'Insert a Table visual with Product[Category], [Revenue], [Total Profit]',
      ],
      code: `Revenue =
SUMX ( Sales, Sales[Quantity] * Sales[UnitPrice] )

Total Profit =
SUMX ( Sales, Sales[SalesAmount] - Sales[Cost] )`,
      result: 'Revenue = 2,57,000 and Total Profit = 57,800. By category: Electronics profit 50,000, Furniture 5,000, Accessories 2,800.',
      explanation:
        'SUMX calculates Qty x Price (or SalesAmount - Cost) on every row and then adds the row results. SUM(Quantity) x SUM(UnitPrice) would give 26 x 1,49,000 = 38,74,000, which is wrong.',
    },
    {
      title: 'Average order value and average sales per customer',
      scenario: 'Management asks: "What is our average order?" and "How much does an average customer buy?"',
      table: {
        headers: ['Measure', 'Calculation', 'Result'],
        rows: [
          ['Avg Order Value', '2,57,000 / 8 orders', '32,125'],
          ['Avg Sales per Customer', '(1,20,000 + 13,000 + 14,000 + 1,10,000) / 4', '64,250'],
          ['Avg Monthly Sales', '2,57,000 / 6 months that have sales', '42,833.33'],
        ],
      },
      steps: [
        'Modeling > New measure: Avg Order Value',
        'Modeling > New measure: Avg Sales per Customer',
        'Modeling > New measure: Avg Monthly Sales',
        'Add the three measures to a Multi-row card visual (Fields well)',
      ],
      code: `Avg Order Value =
AVERAGEX ( Sales, Sales[SalesAmount] )

Avg Sales per Customer =
AVERAGEX ( VALUES ( Customer[CustomerID] ), [Total Sales] )

Avg Monthly Sales =
AVERAGEX ( VALUES ( 'Date'[YearMonth] ), [Total Sales] )`,
      result: '32,125 per order, 64,250 per customer, 42,833.33 per month with sales.',
      explanation:
        'Iterating VALUES() of a column averages per group. Inside the iterator, the measure [Total Sales] is calculated for the current customer or month. Months with no sales return BLANK and AVERAGEX skips them.',
    },
    {
      title: 'Largest and smallest values with MAXX and MINX',
      scenario: 'Show the biggest single order, the smallest order, and the sales of the best customer.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['Largest Order', '1,00,000 (order 1001)'],
          ['Smallest Order', '2,000 (order 1007)'],
          ['Best Customer Sales', '1,20,000 (Asha)'],
          ['Weakest Customer Sales', '13,000 (Ravi)'],
        ],
      },
      steps: [
        'Modeling > New measure for each of the four formulas below',
        'Insert four Card visuals and put one measure in each Fields well',
        'Add a slicer on Date[Year] and pick 2024 - Largest Order becomes 60,000',
      ],
      code: `Largest Order = MAXX ( Sales, Sales[SalesAmount] )
Smallest Order = MINX ( Sales, Sales[SalesAmount] )
Best Customer Sales = MAXX ( VALUES ( Customer[Customer] ), [Total Sales] )
Weakest Customer Sales = MINX ( VALUES ( Customer[Customer] ), [Total Sales] )`,
      result: 'Cards show 1,00,000 / 2,000 / 1,20,000 / 13,000. With Year = 2024: 60,000 / 2,000 / 1,10,000 / 2,000.',
      explanation:
        'MAXX and MINX scan the rows (orders or customers) and return the extreme value. In 2024 Kiran (50,000 + 60,000) is the best customer and Neha (2,000) the weakest.',
    },
    {
      title: 'COUNTX for conditional counting',
      scenario: 'Count bulk orders (Quantity 3 or more) and customers who bought something.',
      table: {
        headers: ['Measure', 'Rows counted', 'Result'],
        rows: [
          ['Bulk Orders', '1002, 1003, 1007, 1008', '4'],
          ['Customers With Sales', 'Asha, Ravi, Neha, Kiran', '4'],
        ],
      },
      steps: [
        'Modeling > New measure: Bulk Orders',
        'Modeling > New measure: Customers With Sales',
        'Insert a Table visual with Date[Year] and both measures',
      ],
      code: `Bulk Orders =
COUNTX ( FILTER ( Sales, Sales[Quantity] >= 3 ), Sales[OrderID] )

Customers With Sales =
COUNTX ( VALUES ( Customer[Customer] ), [Total Sales] )`,
      result: 'Total row: Bulk Orders = 4, Customers With Sales = 4. Row 2023: 2 and 3; row 2024: 2 and 4.',
      explanation:
        'COUNTX counts rows where the expression is not blank. In 2023 Kiran has no sales, so [Total Sales] is BLANK for her and she is not counted.',
    },
    {
      title: 'Weighted margin vs average line margin',
      scenario: 'Two analysts report different margins. Show both and explain the difference.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['Margin % (ratio of totals)', '57,800 / 2,57,000 = 22.49%'],
          ['Avg Line Margin % (average of ratios)', '(20+40+25+25+20+25+40+25) / 8 = 27.50%'],
        ],
      },
      steps: [
        'Modeling > New measure: Margin % and set Measure tools > Format to Percentage',
        'Modeling > New measure: Avg Line Margin % and format as Percentage',
        'Put both on cards side by side and discuss which one Finance needs',
      ],
      code: `Margin % =
DIVIDE ( [Total Profit], [Total Sales] )

Avg Line Margin % =
AVERAGEX ( Sales, DIVIDE ( Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount] ) )`,
      result: '22.49% vs 27.50%.',
      explanation:
        'Small Mouse orders have 40% margin and count equally in AVERAGEX, pushing the simple average up. The weighted margin gives big Laptop orders their real weight.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between SUM and SUMX?',
      a: 'SUM adds one column. SUMX iterates a table, evaluates an expression for each row and adds the results. SUM(col) is just shorthand for SUMX(table, col). Use SUMX when you need a per-row calculation such as Quantity x Price.',
      level: 'Easy',
    },
    {
      q: 'What is row context?',
      a: 'Row context is the "current row" that exists while DAX iterates a table, in a calculated column or inside an X function. It lets you reference column values of that row. Row context alone does not filter other tables; context transition (CALCULATE or a measure reference) turns it into a filter.',
      level: 'Medium',
    },
    {
      q: 'Why is SUM(Sales[Quantity]) * SUM(Sales[UnitPrice]) wrong for revenue?',
      a: 'It multiplies total quantity by the sum of all prices, mixing rows. Revenue must be multiplied per row and then summed: SUMX(Sales, Sales[Quantity] * Sales[UnitPrice]).',
      level: 'Easy',
    },
    {
      q: 'How do you calculate the average sales per customer?',
      a: 'AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales]). It iterates distinct customers, calculates each customer total through context transition, and averages them. DIVIDE([Total Sales], DISTINCTCOUNT(Sales[CustomerID])) gives the same result.',
      level: 'Medium',
    },
    {
      q: 'Scenario: should Profit be a calculated column or a SUMX measure?',
      a: 'Prefer a measure: SUMX(Sales, Sales[SalesAmount] - Sales[Cost]). It is not stored in memory and reacts to filters. A calculated column is only needed if you must slice or filter by the profit value of each row.',
      level: 'Medium',
    },
    {
      q: 'What does COUNTX count?',
      a: 'The number of rows in the table where the expression returns a non-blank value. For counting all rows use COUNTROWS.',
      level: 'Easy',
    },
    {
      q: 'Explain the difference between average of ratios and ratio of totals with an example.',
      a: 'Ratio of totals = total profit / total sales (weighted by size). Average of ratios = AVERAGEX of per-row margin (every row equal). With one big low-margin order and many small high-margin orders, the average of ratios looks higher than the real business margin.',
      level: 'Hard',
    },
    {
      q: 'How would you find the best month sales value? And the month name?',
      a: "Value: MAXX(VALUES('Date'[YearMonth]), [Total Sales]). Name: CONCATENATEX(TOPN(1, VALUES('Date'[YearMonth]), [Total Sales]), 'Date'[YearMonth]) or a RANKX-based filter.",
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create Total Quantity x Price at list price using the Product table price.',
      hint: 'Use RELATED inside SUMX to fetch Product[Price].',
      solution: `List Value = SUMX ( Sales, Sales[Quantity] * RELATED ( Product[Price] ) )
-- Mini sample: 2,57,000 (unit price equals list price in the sample)`,
    },
    {
      task: 'Create Avg Quantity per Order and show it by Category.',
      hint: 'AVERAGEX over Sales of Sales[Quantity].',
      solution: `Avg Qty per Order = AVERAGEX ( Sales, Sales[Quantity] )
-- Total 26 / 8 = 3.25; Accessories (10+4)/2 = 7; Electronics (2+1+1+3)/4 = 1.75; Furniture (3+2)/2 = 2.5`,
    },
    {
      task: 'Find the highest single-line profit.',
      hint: 'MAXX over Sales of SalesAmount - Cost.',
      solution: `Max Line Profit = MAXX ( Sales, Sales[SalesAmount] - Sales[Cost] )
-- 20,000 (order 1001)`,
    },
    {
      task: 'Count how many cities have sales above 50,000. Try it in the DAX Lab.',
      hint: 'COUNTX over FILTER(VALUES(Customer[City]), [Total Sales] > 50000).',
      solution: `Big Cities =
COUNTX ( FILTER ( VALUES ( Customer[City] ), [Total Sales] > 50000 ), Customer[City] )
-- Pune and Nashik = 2`,
    },
    {
      task: 'Create the average sales per product category and display it on a card.',
      hint: 'AVERAGEX over VALUES(Product[Category]).',
      solution: `Avg Sales per Category = AVERAGEX ( VALUES ( Product[Category] ), [Total Sales] )
-- (2,30,000 + 7,000 + 20,000) / 3 = 85,666.67`,
    },
  ],
  quiz: [
    {
      question: 'Which function correctly calculates revenue from Quantity and UnitPrice?',
      options: [
        'SUM(Sales[Quantity]) * SUM(Sales[UnitPrice])',
        'SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])',
        'AVERAGEX(Sales, Sales[Quantity])',
        'COUNTX(Sales, Sales[UnitPrice])',
      ],
      answer: 1,
      explanation: 'The multiplication must happen per row, then the results are summed.',
    },
    {
      question: 'AVERAGEX(VALUES(Customer[CustomerID]), [Total Sales]) returns:',
      options: ['Average order value', 'Average sales per customer', 'Number of customers', 'Total sales'],
      answer: 1,
      explanation: 'It iterates customers, calculates each customer total and averages them.',
    },
    {
      question: 'What does COUNTX ignore?',
      options: ['Numbers', 'Dates', 'Rows where the expression is blank', 'Text values'],
      answer: 2,
      explanation: 'COUNTX counts non-blank results of the expression.',
    },
    {
      question: 'MAXX(VALUES(Customer[Customer]), [Total Sales]) returns:',
      options: ['The name of the best customer', 'The sales value of the best customer', 'The number of customers', 'The largest single order'],
      answer: 1,
      explanation: 'MAXX returns a value, not the name of the row.',
    },
    {
      question: 'What creates row context?',
      options: ['A slicer', 'A page filter', 'An iterator such as SUMX or a calculated column', 'A card visual'],
      answer: 2,
      explanation: 'Iterators and calculated columns work row by row and create row context.',
    },
  ],
};
