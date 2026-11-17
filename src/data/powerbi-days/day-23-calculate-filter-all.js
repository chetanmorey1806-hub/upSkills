export default {
  id: 'day-23-calculate-filter-all',
  title: 'CALCULATE(), FILTER(), ALL(), ALLEXCEPT()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 23,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'CALCULATE is the most important DAX function: it changes the filter context before a measure is evaluated. Today you learn how CALCULATE works with simple conditions, with FILTER(), and how ALL() and ALLEXCEPT() remove filters to build "% of total" and "fixed category" measures.',
  objectives: [
    'Explain what filter context is and how CALCULATE changes it',
    'Write CALCULATE measures with one or more simple filter conditions',
    'Use FILTER() when the condition is row-by-row or uses a measure',
    'Remove filters with ALL() to build % of grand total measures',
    'Keep only selected filters with ALLEXCEPT() to build % of category measures',
  ],
  theory: [
    {
      heading: 'Filter context in one minute',
      content:
        `Every number in a Power BI visual is calculated under a set of filters. This set is called the **filter context**.\n\nIf a table visual has **Product[Category]** on rows, the row "Electronics" calculates \`[Total Sales]\` only for Electronics rows of the Sales table. Slicers, the Filters pane and other visuals (cross-filtering) also add filters.\n\nAnalogy: think of a shop register. "Total sales" is the same formula every time, but the manager asks it with different filters: "only Pune", "only 2024", "only Electronics". The formula stays the same, the **question (filters) changes**.\n\nNormally the visual decides the filters. **CALCULATE lets your measure decide** - it can add, replace or remove filters before calculating.\n\nBase measures used all day (create them with **Modeling > New measure**):\n- \`Total Sales = SUM(Sales[SalesAmount])\`\n- \`Total Cost = SUM(Sales[Cost])\``,
      tip: 'Always build small base measures first ([Total Sales], [Total Cost]) and reuse them inside CALCULATE. This keeps every formula short and consistent.',
    },
    {
      heading: 'CALCULATE(): evaluate an expression with modified filters',
      content:
        `CALCULATE takes an expression (usually a measure) and one or more **filter arguments**.\n\nWhat happens inside, in simple steps:\n1. Start with the current filter context (from the visual, slicers, filters pane).\n2. Apply each filter argument. A filter on a column **replaces** any existing filter on the same column.\n3. Filters on other columns are kept.\n4. Several filter arguments are combined with **AND**.\n5. Calculate the expression in this new context.\n\nExamples:\n- \`Electronics Sales = CALCULATE([Total Sales], Product[Category] = "Electronics")\`\n- \`Pune Corporate Sales = CALCULATE([Total Sales], Customer[City] = "Pune", Customer[Segment] = "Corporate")\`\n- OR on one column: \`CALCULATE([Total Sales], Customer[City] IN {"Pune", "Mumbai"})\`\n\nBecause the filter **replaces** the Category filter, a table visual with Category on rows shows the Electronics value on **every row**. If you want the filter to respect the row instead, wrap it in **KEEPFILTERS(...)** (covered in the extra topics).`,
      syntax: `CALCULATE ( <expression> [, <filter1> [, <filter2> ...]] )`,
      points: [
        'Simple (boolean) filters can compare a column with a constant: Product[Category] = "Electronics", Sales[Quantity] >= 3',
        'A simple filter can use columns from only ONE table and cannot use a measure directly',
        'To compare with a measure, store it in a VAR first or use FILTER()',
      ],
    },
    {
      heading: 'FILTER(): return the rows that pass a condition',
      content:
        `FILTER is an **iterator**: it goes row by row through a table and keeps the rows where the condition is TRUE. It returns a **table**, so it is used inside other functions such as CALCULATE, COUNTROWS or SUMX.\n\nUse FILTER when:\n- The condition must be checked **row by row**, e.g. orders above 50,000.\n- The condition uses a **measure**, e.g. customers whose \`[Total Sales]\` is above 1,00,000.\n\nExamples:\n- \`Big Orders = COUNTROWS(FILTER(Sales, Sales[SalesAmount] >= 50000))\`\n- \`Big Order Sales = CALCULATE([Total Sales], FILTER(Sales, Sales[SalesAmount] >= 50000))\`\n- \`Top Customer Sales = CALCULATE([Total Sales], FILTER(VALUES(Customer[Customer]), [Total Sales] > 100000))\`\n\nPerformance rule: filter a **column** (or VALUES of a column) rather than a whole big fact table when you can. \`CALCULATE([Total Sales], Sales[SalesAmount] >= 50000)\` gives the same result as the FILTER(Sales, ...) version and is faster on large tables.`,
      syntax: `FILTER ( <table>, <condition> )`,
    },
    {
      heading: 'ALL(): remove filters',
      content:
        `ALL removes filters from a table or from specific columns.\n\n- \`ALL(Product)\` - remove every filter on the Product table.\n- \`ALL(Product[Category])\` - remove only the filter on Category.\n- \`ALL(Sales)\` - remove all filters on Sales, and because Sales "sees" its dimensions through relationships, also filters coming from Product, Customer and Date.\n\nThe classic use is **% of grand total**:\n\n\`All Sales = CALCULATE([Total Sales], ALL(Product))\`\n\`% of Total = DIVIDE([Total Sales], [All Sales])\`\n\nIn a visual by Category, the denominator ignores the Category filter, so each row is divided by the grand total.\n\nALL can also be used as a table function: \`COUNTROWS(ALL(Product[Category]))\` returns 3 (all categories), even when a slicer selects one.\n\nAnalogy: ALL is like asking "ignore what the customer pointed at, give me the whole shop's number".`,
      syntax: `ALL ( <table> | <column> [, <column> ...] )`,
      tip: 'REMOVEFILTERS(Product) does the same job as ALL(Product) inside CALCULATE and reads more clearly. ALL is still used everywhere, so know both.',
    },
    {
      heading: 'ALLEXCEPT(): remove all filters except some columns',
      content:
        `ALLEXCEPT removes all filters from a table **except** the columns you list.\n\n\`Category Sales = CALCULATE([Total Sales], ALLEXCEPT(Product, Product[Category]))\`\n\nIn a matrix with Category and Product on rows, the Product filter is removed but the Category filter is kept. So every product row shows its **category total**, and \`DIVIDE([Total Sales], [Category Sales])\` gives "% of category".\n\nImportant: ALLEXCEPT only touches the table you give it. Filters on other tables (for example a Year slicer on the Date table) still apply.\n\nWhen to use which:\n- ALL(Product) - compare with the grand total of all products.\n- ALLEXCEPT(Product, Product[Category]) - compare with the total of the same category.\n- ALL(Product[Product]) - remove only the product filter; very similar result when Category is also on the rows.`,
      syntax: `ALLEXCEPT ( <table>, <column> [, <column> ...] )`,
    },
    {
      heading: 'Mini sample data used in examples',
      content:
        `The examples use an 8-row slice of the shared practice model so you can check every number by hand. In the DAX Lab the full dataset gives bigger numbers, but the behaviour is identical.\n\n**Product**: P1 Laptop (Electronics), P2 Mouse (Accessories), P3 Chair (Furniture), P4 Phone (Electronics).\n\n**Customer**: C1 Asha (Pune, Corporate), C2 Ravi (Mumbai, Retail), C3 Neha (Nagpur, Retail), C4 Kiran (Nashik, Corporate).\n\n**Sales** (OrderID, OrderDate, Customer, Product, Qty, SalesAmount, Cost):\n- 1001, 2023-01-10, C1, Laptop, 2, 1,00,000, 80,000\n- 1002, 2023-02-05, C2, Mouse, 10, 5,000, 3,000\n- 1003, 2023-03-12, C3, Chair, 3, 12,000, 9,000\n- 1004, 2024-01-08, C1, Phone, 1, 20,000, 15,000\n- 1005, 2024-02-14, C4, Laptop, 1, 50,000, 40,000\n- 1006, 2024-02-20, C2, Chair, 2, 8,000, 6,000\n- 1007, 2024-03-03, C3, Mouse, 4, 2,000, 1,200\n- 1008, 2024-03-25, C4, Phone, 3, 60,000, 45,000\n\nTotal Sales = 2,57,000. Electronics = 2,30,000, Accessories = 7,000, Furniture = 20,000.`,
    },
  ],
  examples: [
    {
      title: 'Fixed category measure with CALCULATE',
      scenario: 'The manager wants a card that always shows Electronics sales, and wants to see what happens when that measure is placed in a table by Category.',
      table: {
        headers: ['Category', 'Total Sales', 'Electronics Sales'],
        rows: [
          ['Accessories', '7,000', '2,30,000'],
          ['Electronics', '2,30,000', '2,30,000'],
          ['Furniture', '20,000', '2,30,000'],
          ['Total', '2,57,000', '2,30,000'],
        ],
      },
      steps: [
        'In Report view select the Sales table in the Data pane',
        'Modeling > New measure and type: Total Sales = SUM(Sales[SalesAmount])',
        'Modeling > New measure and type the Electronics Sales measure shown below',
        'Insert a Table visual: drag Product[Category], [Total Sales] and [Electronics Sales] into Columns',
        'Compare the two measure columns row by row',
      ],
      code: `Electronics Sales =
CALCULATE (
    [Total Sales],
    Product[Category] = "Electronics"
)`,
      result: 'Electronics Sales shows 2,30,000 on every row, including Accessories and Furniture.',
      explanation:
        'The filter argument Product[Category] = "Electronics" replaces the Category filter coming from the row. So every row calculates Electronics only. This is exactly what you want in a card, but confusing in a table - use KEEPFILTERS if rows should be respected.',
    },
    {
      title: 'Two conditions (AND) and OR with IN',
      scenario: 'Find sales of Corporate customers in Pune, and sales of Pune + Mumbai together.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['Pune Corporate Sales', '1,20,000'],
          ['Pune Mumbai Sales', '1,33,000'],
        ],
      },
      steps: [
        'Modeling > New measure and enter Pune Corporate Sales (first measure below)',
        'Modeling > New measure and enter Pune Mumbai Sales (second measure below)',
        'Insert two Card visuals and drag one measure into the Fields well of each card',
        'Check: Asha (Pune, Corporate) bought 1,00,000 + 20,000; Ravi (Mumbai) bought 5,000 + 8,000',
      ],
      code: `Pune Corporate Sales =
CALCULATE ( [Total Sales], Customer[City] = "Pune", Customer[Segment] = "Corporate" )

Pune Mumbai Sales =
CALCULATE ( [Total Sales], Customer[City] IN { "Pune", "Mumbai" } )`,
      result: 'Pune Corporate Sales = 1,20,000 and Pune Mumbai Sales = 1,20,000 + 13,000 = 1,33,000.',
      explanation:
        'Separate filter arguments are combined with AND. For OR on the same column, use IN with a list of values (or the || operator).',
    },
    {
      title: 'Row-by-row condition with FILTER',
      scenario: 'Count orders worth 50,000 or more and find their total value.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Passes >= 50,000?'],
        rows: [
          ['1001', '1,00,000', 'Yes'],
          ['1005', '50,000', 'Yes'],
          ['1008', '60,000', 'Yes'],
          ['Other 5 orders', '47,000 in total', 'No'],
        ],
      },
      steps: [
        'Modeling > New measure: Big Orders (code below)',
        'Modeling > New measure: Big Order Sales (code below)',
        'Add both measures to Card visuals',
        'Add a Year slicer from Date[Year] and select 2024 to see the values change',
      ],
      code: `Big Orders =
COUNTROWS ( FILTER ( Sales, Sales[SalesAmount] >= 50000 ) )

Big Order Sales =
CALCULATE ( [Total Sales], FILTER ( Sales, Sales[SalesAmount] >= 50000 ) )`,
      result: 'Big Orders = 3 and Big Order Sales = 2,10,000. With Year = 2024 selected: 2 orders, 1,10,000.',
      explanation:
        'FILTER walks through every visible Sales row and keeps those passing the test. Because FILTER respects the current filter context, the Year slicer still applies.',
    },
    {
      title: '% of grand total with ALL',
      scenario: 'Show each category share of total sales.',
      table: {
        headers: ['Category', 'Total Sales', 'All Sales', '% of Total'],
        rows: [
          ['Accessories', '7,000', '2,57,000', '2.72%'],
          ['Electronics', '2,30,000', '2,57,000', '89.49%'],
          ['Furniture', '20,000', '2,57,000', '7.78%'],
          ['Total', '2,57,000', '2,57,000', '100.00%'],
        ],
      },
      steps: [
        'Modeling > New measure: All Sales (code below)',
        'Modeling > New measure: % of Total (code below)',
        'With % of Total selected, go to Measure tools > Format and choose Percentage, 2 decimal places',
        'Insert a Table visual with Product[Category], [Total Sales], [All Sales], [% of Total]',
      ],
      code: `All Sales =
CALCULATE ( [Total Sales], ALL ( Product ) )

% of Total =
DIVIDE ( [Total Sales], [All Sales] )`,
      result: 'Every row shows All Sales = 2,57,000 and the percentages add up to 100%.',
      explanation:
        'ALL(Product) removes the Category filter only for the denominator, so each category is divided by the overall total.',
    },
    {
      title: '% within category with ALLEXCEPT',
      scenario: 'In a matrix of Category > Product, show how much each product contributes to its own category.',
      table: {
        headers: ['Category / Product', 'Total Sales', 'Category Sales', '% of Category'],
        rows: [
          ['Electronics - Laptop', '1,50,000', '2,30,000', '65.22%'],
          ['Electronics - Phone', '80,000', '2,30,000', '34.78%'],
          ['Accessories - Mouse', '7,000', '7,000', '100.00%'],
          ['Furniture - Chair', '20,000', '20,000', '100.00%'],
        ],
      },
      steps: [
        'Modeling > New measure: Category Sales (code below)',
        'Modeling > New measure: % of Category (code below) and format it as Percentage',
        'Insert a Matrix visual: Rows = Product[Category] then Product[Product]; Values = [Total Sales], [Category Sales], [% of Category]',
        'Use the Expand all down one level icon (forked arrow) in the visual header to see products under each category',
      ],
      code: `Category Sales =
CALCULATE ( [Total Sales], ALLEXCEPT ( Product, Product[Category] ) )

% of Category =
DIVIDE ( [Total Sales], [Category Sales] )`,
      result: 'Laptop = 65.22% and Phone = 34.78% of Electronics; Mouse and Chair are 100% of their categories.',
      explanation:
        'ALLEXCEPT removes the Product filter but keeps Category, so the denominator becomes the category total for every product row.',
    },
  ],
  interview: [
    {
      q: 'What does CALCULATE do?',
      a: 'It evaluates an expression in a modified filter context. It takes the current filters, applies the filter arguments (replacing filters on the same columns, adding new ones, or removing filters with ALL/REMOVEFILTERS), and then calculates the expression.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between CALCULATE([Total Sales], Product[Category] = "Electronics") and CALCULATE([Total Sales], FILTER(Product, Product[Category] = "Electronics"))?',
      a: 'The boolean version is internally FILTER(ALL(Product[Category]), ...) so it overrides any existing Category filter. FILTER(Product, ...) iterates only the currently visible Product rows, so it respects existing filters: in a row for Furniture it returns blank. The boolean version is also faster.',
      level: 'Hard',
    },
    {
      q: 'When must you use FILTER inside CALCULATE instead of a simple condition?',
      a: 'When the condition uses a measure or aggregation (e.g. customers with [Total Sales] > 1,00,000), when it needs columns from more than one table in one expression, or when you want the condition to be evaluated row by row on the currently visible rows.',
      level: 'Medium',
    },
    {
      q: 'How do you calculate % of grand total in DAX?',
      a: 'DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Product))) - or ALL of the dimension used in the visual. If the result must respect slicers but ignore visual rows, use ALLSELECTED instead of ALL.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between ALL and ALLEXCEPT?',
      a: 'ALL removes filters from the given table or columns. ALLEXCEPT removes filters from the whole table except the listed columns. ALLEXCEPT(Product, Product[Category]) keeps the Category filter, useful for % of category.',
      level: 'Medium',
    },
    {
      q: 'Scenario: your "Electronics Sales" measure shows the same number on every row of a category table. Is it a bug? How do you fix it?',
      a: 'It is expected: the boolean filter replaces the row filter on Category. If you want Electronics only on the Electronics row and blank on others, wrap the condition in KEEPFILTERS: CALCULATE([Total Sales], KEEPFILTERS(Product[Category] = "Electronics")).',
      level: 'Medium',
    },
    {
      q: 'Why is FILTER(Sales, Sales[SalesAmount] > 1000) slower than Sales[SalesAmount] > 1000 inside CALCULATE?',
      a: 'FILTER(Sales, ...) iterates every row of the full (expanded) fact table and returns a big table used as a filter. The boolean condition filters only the single column, which the storage engine handles efficiently.',
      level: 'Hard',
    },
    {
      q: 'Does ALLEXCEPT(Product, Product[Category]) ignore a Year slicer from the Date table?',
      a: 'No. ALLEXCEPT only removes filters from the Product table. Filters on Date, Customer or any other table still apply.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a measure Retail Sales that always returns sales of the Retail segment.',
      hint: 'One simple filter argument on Customer[Segment].',
      solution: `Retail Sales = CALCULATE ( [Total Sales], Customer[Segment] = "Retail" )
-- Mini sample result: 5,000 + 12,000 + 8,000 + 2,000 = 27,000`,
    },
    {
      task: 'Create a measure that counts orders with Quantity of 3 or more.',
      hint: 'COUNTROWS around FILTER on the Sales table.',
      solution: `Bulk Orders = COUNTROWS ( FILTER ( Sales, Sales[Quantity] >= 3 ) )
-- Mini sample result: orders 1002, 1003, 1007, 1008 = 4`,
    },
    {
      task: 'Build a % of City Total measure for a table with Customer[City] on rows.',
      hint: 'Remove filters from Customer in the denominator.',
      solution: `% of City Total =
DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], ALL ( Customer ) ) )
-- Pune 46.69%, Nashik 42.80%, Nagpur 5.45%, Mumbai 5.06%`,
    },
    {
      task: 'In a matrix of City > Customer, show each customer share inside its City, using ALLEXCEPT.',
      hint: 'Keep Customer[City], remove other Customer filters.',
      solution: `City Sales = CALCULATE ( [Total Sales], ALLEXCEPT ( Customer, Customer[City] ) )
% of City = DIVIDE ( [Total Sales], [City Sales] )
-- Each city has one customer in the mini sample, so every row shows 100%`,
    },
    {
      task: 'Find the sales of customers whose total sales are above 1,00,000. Try it in the DAX Lab.',
      hint: 'FILTER over VALUES(Customer[Customer]) with a measure condition.',
      solution: `High Value Customer Sales =
CALCULATE (
    [Total Sales],
    FILTER ( VALUES ( Customer[Customer] ), [Total Sales] > 100000 )
)
-- Asha 1,20,000 + Kiran 1,10,000 = 2,30,000`,
    },
  ],
  quiz: [
    {
      question: 'In CALCULATE([Total Sales], Product[Category] = "Furniture"), what happens to an existing filter on Product[Category] from a visual row?',
      options: ['It is kept and combined with AND', 'It is replaced by Category = "Furniture"', 'It causes an error', 'It is converted to OR'],
      answer: 1,
      explanation: 'A filter argument on a column replaces any existing filter on that same column.',
    },
    {
      question: 'What does FILTER() return?',
      options: ['A single number', 'A text value', 'A table of rows meeting the condition', 'A TRUE/FALSE value'],
      answer: 2,
      explanation: 'FILTER is a table function; you use its result inside CALCULATE, COUNTROWS, SUMX, etc.',
    },
    {
      question: 'Which measure returns the grand total of sales on every Category row?',
      options: [
        'CALCULATE([Total Sales], ALL(Product))',
        'CALCULATE([Total Sales], VALUES(Product[Category]))',
        'SUM(Sales[SalesAmount])',
        'CALCULATE([Total Sales], Product[Category] = "All")',
      ],
      answer: 0,
      explanation: 'ALL(Product) removes the Category filter, so every row sees all products.',
    },
    {
      question: 'CALCULATE([Total Sales], ALLEXCEPT(Product, Product[Category])) in a Category > Product matrix returns:',
      options: ['Product sales', 'Grand total', 'The category total on every product row', 'Blank'],
      answer: 2,
      explanation: 'All Product filters are removed except Category, so each product row shows its category total.',
    },
    {
      question: 'Multiple filter arguments in one CALCULATE are combined with:',
      options: ['OR', 'AND', 'XOR', 'Only the last one is used'],
      answer: 1,
      explanation: 'Each filter argument narrows the context, so they work as AND.',
    },
  ],
};
