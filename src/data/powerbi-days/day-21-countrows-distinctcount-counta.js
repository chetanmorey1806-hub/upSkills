export default {
  id: 'day-21-countrows-distinctcount-counta',
  title: 'COUNTROWS(), DISTINCTCOUNT(), COUNTA()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 21,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Counting is the second most common calculation after summing. COUNTROWS counts records, DISTINCTCOUNT counts unique values, and COUNTA counts non-blank cells of any type. Knowing which one answers which business question avoids wrong KPIs.',
  objectives: [
    'Write COUNTROWS, DISTINCTCOUNT and COUNTA measures with correct arguments',
    'Choose the right count for questions like "how many orders" vs "how many customers"',
    'Understand how each function treats blanks and duplicates',
    'Combine counts into KPIs such as orders per customer and unsold products',
    'Return 0 instead of blank when a count has no rows',
  ],
  theory: [
    {
      heading: 'Three counting questions',
      content:
        "Imagine a register of 60 bills in a shop:\n\n- **How many bills?** Count the rows: 60. -> `COUNTROWS(Sales)`\n- **How many different customers came?** Count unique names: 6. -> `DISTINCTCOUNT(Sales[CustomerID])`\n- **How many bills have a phone number written?** Count the filled cells in one column. -> `COUNTA(column)`\n\nPicking the wrong one is a classic mistake: \"Customers = COUNT(Sales[CustomerID])\" returns 60, not 6.",
    },
    {
      heading: 'COUNTROWS()',
      content:
        "`COUNTROWS` counts the number of **rows in a table** visible in the current filter context.\n\n**Argument**:\n- **Table** (optional in newer versions, but always write it): a table name like `Sales`, or a table expression such as `FILTER(Sales, Sales[Quantity] >= 3)` or `VALUES(Product[Category])`.\n\nIt does not look at any column, so blanks in columns do not matter. If no rows are visible, it returns **BLANK** (not 0).\n\n`COUNTROWS(Sales)` = 60, `COUNTROWS(Product)` = 6, `COUNTROWS(Customer)` = 6.",
      syntax: 'COUNTROWS([<Table>])',
      tip: 'COUNTROWS(Sales) is the recommended way to count orders. It is clearer than COUNT(Sales[OrderID]) and does not depend on a column having no blanks.',
    },
    {
      heading: 'DISTINCTCOUNT()',
      content:
        "`DISTINCTCOUNT` counts the number of **different values** in a column.\n\n**Argument**:\n- **ColumnName**: any column (numbers, text, dates).\n\nIt **counts BLANK as one value** if blanks exist. If you do not want that, use `DISTINCTCOUNTNOBLANK(column)`.\n\nExamples:\n- `DISTINCTCOUNT(Sales[CustomerID])` = 6 customers who ordered\n- `DISTINCTCOUNT(Sales[ProductID])` = 5 products sold (Desk never sold)\n- `DISTINCTCOUNT(Customer[City])` = 4 cities\n\nDISTINCTCOUNT is **not additive**: Corporate has 3 customers and Retail has 3, but a customer could in theory appear in both, so never add row values to get a total. The Total row recalculates correctly by itself.",
      syntax: 'DISTINCTCOUNT(<ColumnName>)',
    },
    {
      heading: 'COUNTA()',
      content:
        "`COUNTA` counts the **non-blank** values in a column of **any data type**: numbers, text, dates and TRUE/FALSE.\n\n**Argument**:\n- **ColumnName**: the column to inspect.\n\nDifference from COUNT: in current DAX, COUNT also accepts numbers, dates and text, but **COUNTA additionally counts Boolean (TRUE/FALSE)** values. For a column that may contain blanks, COUNTA tells you how many cells are filled. Its partner `COUNTBLANK(column)` counts the empty ones.\n\n`COUNTA(Customer[City])` = 6 (all customers have a city). `DISTINCTCOUNT(Customer[City])` = 4.",
      syntax: 'COUNTA(<ColumnName>)',
    },
    {
      heading: 'Comparison and blanks',
      content:
        "- **COUNTROWS(table)**: counts rows; ignores column contents; empty table -> BLANK\n- **COUNT(column)**: non-blank numbers/dates/text\n- **COUNTA(column)**: non-blank values of any type including TRUE/FALSE\n- **COUNTBLANK(column)**: blank values\n- **DISTINCTCOUNT(column)**: unique values, blank counted as one\n- **DISTINCTCOUNTNOBLANK(column)**: unique values, blank not counted\n\nTo show **0 instead of blank** (for example for a product with no orders) write `COUNTROWS(Sales) + 0` or `COALESCE(COUNTROWS(Sales), 0)`. Be careful: returning 0 makes every product/customer row visible in the visual, including those with no data.",
    },
  ],
  examples: [
    {
      title: 'Example 1: Orders vs unique customers vs unique products by City',
      scenario: 'Sales manager asks: per city, how many orders, how many different customers and how many different products?',
      table: {
        headers: ['City', 'Orders', 'Unique Customers', 'Unique Products'],
        rows: [
          ['Mumbai', '12', '2', '4'],
          ['Nagpur', '18', '1', '5'],
          ['Nashik', '9', '1', '3'],
          ['Pune', '21', '2', '5'],
          ['Total', '60', '6', '5'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula below',
        'Insert a Matrix visual: Rows = Customer[City]',
        'Values = Orders, Unique Customers, Unique Products',
        'Notice the Total row is not the sum of the city rows for the distinct counts',
      ],
      code: `Orders = COUNTROWS(Sales)
Unique Customers = DISTINCTCOUNT(Sales[CustomerID])
Unique Products = DISTINCTCOUNT(Sales[ProductID])`,
      result: 'Matrix above. Unique Products total is 5 (not 4+5+3+5=17) because the same products sell in many cities.',
      explanation: 'COUNTROWS counts every order row. DISTINCTCOUNT counts different IDs and recalculates at the total level, so it is non-additive.',
    },
    {
      title: 'Example 2: Catalogue vs sold products - find unsold items',
      scenario: 'Which category has products that never sold?',
      table: {
        headers: ['Category', 'Products in Catalogue', 'Products Sold', 'Unsold Products'],
        rows: [
          ['Accessories', '2', '2', '0'],
          ['Electronics', '2', '2', '0'],
          ['Furniture', '2', '1', '1'],
          ['Total', '6', '5', '1'],
        ],
      },
      steps: [
        'Modeling > New measure for the three formulas below',
        'Insert a Table visual: Product[Category], then the three measures',
        'Optionally add Product[Product] to see Desk is the unsold item',
      ],
      code: `Products in Catalogue = COUNTROWS(Product)
Products Sold = DISTINCTCOUNT(Sales[ProductID])
Unsold Products = [Products in Catalogue] - [Products Sold]`,
      result: 'Furniture has 1 unsold product (Desk). Total 1.',
      explanation: 'COUNTROWS(Product) counts the dimension table rows filtered by Category. DISTINCTCOUNT on the fact table counts only products that appear in sales.',
    },
    {
      title: 'Example 3: COUNTA vs DISTINCTCOUNT on a text column',
      scenario: 'How many customers have a city recorded, and how many different cities do we serve?',
      table: {
        headers: ['Measure', 'Formula', 'Result'],
        rows: [
          ['Customers with City', 'COUNTA(Customer[City])', '6'],
          ['Cities Served', 'DISTINCTCOUNT(Customer[City])', '4'],
          ['Customer Rows', 'COUNTROWS(Customer)', '6'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula',
        'Insert three Card visuals, one measure each',
        'Add a Customer[Segment] slicer and click Corporate',
      ],
      code: `Customers with City = COUNTA(Customer[City])
Cities Served = DISTINCTCOUNT(Customer[City])
Customer Rows = COUNTROWS(Customer)`,
      result: 'All data: 6, 4, 6. With Corporate selected: 3, 3, 3 (Asha Traders - Pune, Neha Enterprises - Nagpur, Sai Furnishers - Mumbai).',
      explanation: 'COUNTA counts filled cells including repeats (Pune twice). DISTINCTCOUNT counts each city once.',
    },
    {
      title: 'Example 4: Count rows that meet a condition',
      scenario: 'How many order lines have Quantity of 3 or more, per category?',
      table: {
        headers: ['Category', 'Orders', 'Orders Qty 3+', 'Share'],
        rows: [
          ['Accessories', '25', '15', '60.00%'],
          ['Electronics', '28', '18', '64.29%'],
          ['Furniture', '7', '5', '71.43%'],
          ['Total', '60', '38', '63.33%'],
        ],
      },
      steps: [
        'Modeling > New measure: Orders Qty 3+ (code below)',
        'Modeling > New measure: Share = DIVIDE([Orders Qty 3+], [Orders]), format as Percentage',
        'Matrix: Rows = Product[Category], Values = Orders, Orders Qty 3+, Share',
      ],
      code: `Orders Qty 3+ = COUNTROWS(FILTER(Sales, Sales[Quantity] >= 3))
Share = DIVIDE([Orders Qty 3+], [Orders])`,
      result: 'Matrix above. 38 of 60 order lines (63.33%) have 3 or more units.',
      explanation: 'FILTER returns only the rows that pass the condition and COUNTROWS counts them. You will learn FILTER in depth on Day 23.',
    },
    {
      title: 'Example 5: Orders per customer and showing 0 instead of blank',
      scenario: 'Show average orders per customer by Year and a product order count that displays 0 for unsold products.',
      table: {
        headers: ['Product', 'Orders (0 if none)'],
        rows: [
          ['Desk', '0'],
          ['Headphones', '14'],
          ['Keyboard', '11'],
          ['Laptop', '12'],
          ['Mobile', '16'],
          ['Office Chair', '7'],
          ['Total', '60'],
        ],
      },
      steps: [
        'Modeling > New measure for both formulas',
        'Table visual 1: Sales[Year] (or Date[Year]), Orders per Customer',
        'Table visual 2: Product[Product], Orders (0 if none)',
      ],
      code: `Orders per Customer = DIVIDE(COUNTROWS(Sales), DISTINCTCOUNT(Sales[CustomerID]))
Orders (0 if none) = COALESCE(COUNTROWS(Sales), 0)`,
      result: 'Orders per Customer: 2023 = 32 / 5 = 6.4, 2024 = 28 / 6 = 4.67, Total = 60 / 6 = 10. Desk shows 0 instead of disappearing.',
      explanation: 'COALESCE returns the first non-blank argument, so a blank count becomes 0. In 2023 only 5 of the 6 customers ordered.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between COUNT, COUNTA and COUNTROWS?',
      a: 'COUNT counts non-blank numbers/dates/text in a column, COUNTA counts non-blank values of any type including Booleans, and COUNTROWS counts the rows of a table regardless of column values.',
      level: 'Easy',
    },
    {
      q: 'How would you count unique customers who purchased?',
      a: 'DISTINCTCOUNT(Sales[CustomerID]). Counting the Customer table (COUNTROWS(Customer)) would include customers who never ordered and would not be filtered by product with single-direction relationships.',
      level: 'Easy',
    },
    {
      q: 'Why is the total of a DISTINCTCOUNT column not equal to the sum of its rows?',
      a: 'Distinct counts are non-additive: the same value can appear in several rows (e.g. a product sold in many cities). Power BI recalculates the distinct count over all rows for the total.',
      level: 'Medium',
    },
    {
      q: 'How does DISTINCTCOUNT handle blanks? What is the alternative?',
      a: 'It counts BLANK as one distinct value. DISTINCTCOUNTNOBLANK ignores blanks.',
      level: 'Medium',
    },
    {
      q: 'COUNTROWS returns blank for a product without orders. How do you show 0, and what is the side effect?',
      a: 'Use COALESCE(COUNTROWS(Sales), 0) or COUNTROWS(Sales) + 0. The side effect is that every dimension member now has a value, so rows with no activity appear in visuals and large tables can get slower.',
      level: 'Hard',
    },
    {
      q: 'Scenario: management wants "active customers per month" = customers with at least one order. Write it.',
      a: 'Active Customers = DISTINCTCOUNT(Sales[CustomerID]) with Date[YearMonth] on rows. Each month counts customers who had at least one sales row in that month.',
      level: 'Medium',
    },
    {
      q: 'Is COUNTROWS(Sales) or COUNT(Sales[OrderID]) better for order count?',
      a: 'COUNTROWS(Sales) is preferred: it shows intent clearly, does not depend on a column being non-blank and performs at least as well.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create Unique Customers and show it by Product[Product].',
      hint: 'DISTINCTCOUNT(Sales[CustomerID]).',
      solution: 'Headphones 6, Keyboard 4, Laptop 4, Mobile 6, Office Chair 4, Total 6.',
    },
    {
      task: 'Count how many order lines are 1,00,000 or more per Category.',
      hint: 'COUNTROWS(FILTER(Sales, Sales[SalesAmount] >= 100000)).',
      solution: 'Electronics 9, Accessories and Furniture blank, Total 9.',
    },
    {
      task: 'Create Cities Served = DISTINCTCOUNT(Customer[City]) and show it by Customer[Segment].',
      hint: 'The Customer table is filtered directly by Segment.',
      solution: 'Corporate 3 (Pune, Nagpur, Mumbai), Retail 3 (Mumbai, Pune, Nashik), Total 4.',
    },
    {
      task: 'In the DAX Lab, show Orders and Unique Products by Customer[Customer].',
      hint: 'COUNTROWS(Sales) and DISTINCTCOUNT(Sales[ProductID]).',
      solution: 'Asha Traders 13/5, Kiran Mart 9/3, Neha Enterprises 18/5, Om Electronics 8/4, Ravi Stores 7/4, Sai Furnishers 5/3; Total 60/5.',
    },
  ],
  quiz: [
    {
      question: 'Which measure returns 6 unique customers for the practice data?',
      options: ['COUNT(Sales[CustomerID])', 'COUNTROWS(Sales)', 'DISTINCTCOUNT(Sales[CustomerID])', 'COUNTA(Sales[CustomerID])'],
      answer: 2,
      explanation: 'Only DISTINCTCOUNT removes the duplicates; the other three return 60.',
    },
    {
      question: 'COUNTROWS takes which kind of argument?',
      options: ['A column', 'A table', 'A measure', 'A number'],
      answer: 1,
      explanation: 'COUNTROWS counts the rows of a table or table expression.',
    },
    {
      question: 'Which function counts TRUE/FALSE values as well as numbers and text?',
      options: ['COUNT', 'COUNTA', 'SUM', 'DISTINCTCOUNTNOBLANK'],
      answer: 1,
      explanation: 'COUNTA counts non-blank values of all data types including Boolean.',
    },
    {
      question: 'What does COUNTROWS return when no rows are visible?',
      options: ['0', 'BLANK', 'Error', '-1'],
      answer: 1,
      explanation: 'It returns BLANK; wrap with COALESCE(..., 0) if you need 0.',
    },
    {
      question: 'DISTINCTCOUNT(Customer[City]) on the practice data returns:',
      options: ['6', '4', '2', '60'],
      answer: 1,
      explanation: 'There are 4 different cities: Pune, Mumbai, Nagpur, Nashik.',
    },
  ],
};
