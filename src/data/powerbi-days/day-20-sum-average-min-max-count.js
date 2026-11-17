export default {
  id: 'day-20-sum-average-min-max-count',
  title: 'SUM(), AVERAGE(), MIN(), MAX(), COUNT()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 20,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'The five basic aggregation functions turn a column of many values into one number for each cell of a visual. They are the building blocks of almost every Power BI report.',
  objectives: [
    'Write SUM, AVERAGE, MIN, MAX and COUNT measures with correct syntax',
    'Explain the argument each function takes and how blanks and zeros are treated',
    'Read the expected output of each measure in a matrix by Category and by Year',
    'Use the two-argument form of MIN/MAX to compare two values',
    'Combine basic aggregations into business KPIs such as Average Order Value',
  ],
  theory: [
    {
      heading: 'How aggregation functions work',
      content:
        "An **aggregation function** takes a **column** and returns **one value** by combining all the rows that are visible in the current filter context.\n\nIn a matrix with Product[Category] on rows, the Electronics cell sees only the 28 Electronics rows of Sales; the Total row sees all 60. The same measure gives different answers per cell, automatically.\n\nAll five functions take exactly one argument: a **column reference** in `Table[Column]` form. You cannot pass an expression like `SUM(Sales[Quantity] * Sales[UnitPrice])` - for row-by-row math use the X functions (SUMX, AVERAGEX) on Day 24.",
      points: ['Argument = a single column, not a table and not an expression', 'Blank cells are ignored', 'Result depends on filter context (visual rows, slicers, filters)'],
    },
    {
      heading: 'SUM()',
      content:
        "`SUM` adds all the numbers in a column.\n\n**Argument**:\n- **ColumnName**: a numeric column (Whole number, Decimal, Currency). Text columns give an error.\n\nBlanks are skipped. If every value is blank (or no rows are visible), SUM returns BLANK, so the row disappears from table visuals.\n\nExample: `Total Sales = SUM(Sales[SalesAmount])` returns 30,94,953 for all data.",
      syntax: 'SUM(<ColumnName>)',
    },
    {
      heading: 'AVERAGE()',
      content:
        "`AVERAGE` returns the arithmetic mean: sum of values divided by the **count of non-blank values**.\n\n**Argument**:\n- **ColumnName**: a numeric column.\n\nImportant: **blanks are ignored but zeros are counted**. If 3 orders are 100, 200 and blank, AVERAGE = 150. If they are 100, 200 and 0, AVERAGE = 100.\n\nExample: `Avg Sale = AVERAGE(Sales[SalesAmount])` = 30,94,953 / 60 = 51,582.55. This is the average **order line** value. The average of `Product[Price]` (all 6 products) is 16,333.33 because it reads the Product table, not Sales.",
      syntax: 'AVERAGE(<ColumnName>)',
    },
    {
      heading: 'MIN() and MAX()',
      content:
        "`MIN` returns the smallest value, `MAX` the largest value in a column. They work on **numbers, dates and text** (text is compared alphabetically).\n\n**One-argument form**:\n- **ColumnName**: the column to scan. `MIN(Sales[OrderDate])` = 07-01-2023 (first order), `MAX(Sales[OrderDate])` = 26-12-2024 (last order).\n\n**Two-argument form** (compare two scalar values):\n- **Expression1**, **Expression2**: two values; returns the smaller (MIN) or larger (MAX). Example: `MAX([Profit], 0)` returns profit, or 0 if profit is negative.\n\nBlanks are ignored in the column form.",
      syntax: `MIN(<ColumnName>)
MAX(<ColumnName>)
MIN(<Expression1>, <Expression2>)
MAX(<Expression1>, <Expression2>)`,
    },
    {
      heading: 'COUNT()',
      content:
        "`COUNT` counts the number of rows in a column that have a **non-blank** value.\n\n**Argument**:\n- **ColumnName**: a column containing numbers, dates or text.\n\n`COUNT(Sales[OrderID])` = 60 orders. Because blanks are skipped, `COUNT` on a column with missing values counts fewer rows than the table has. For \"how many rows\" regardless of blanks use `COUNTROWS(Sales)` (Day 21). For TRUE/FALSE columns use `COUNTA`.",
      syntax: 'COUNT(<ColumnName>)',
      tip: 'COUNT counts values, not unique values. Customer 103 with 18 orders adds 18 to COUNT(Sales[CustomerID]). For unique customers use DISTINCTCOUNT (Day 21).',
    },
    {
      heading: 'Quick reference',
      content:
        "- **SUM(column)**: total; numbers only; skips blanks\n- **AVERAGE(column)**: mean; numbers only; skips blanks, counts zeros\n- **MIN(column)** / **MAX(column)**: smallest / largest; numbers, dates, text\n- **MIN(a, b)** / **MAX(a, b)**: smaller / larger of two values\n- **COUNT(column)**: non-blank values; numbers, dates, text\n\nAll can be pasted into the DAX Lab. Format results with Measure tools > Format (Whole number, Decimal number with 2 places, Date).",
    },
  ],
  examples: [
    {
      title: 'Example 1: Five measures in one matrix by Category',
      scenario: 'Build a summary of order lines per product category.',
      table: {
        headers: ['Category', 'Total Sales', 'Avg Sale', 'Min Sale', 'Max Sale', 'Order Count'],
        rows: [
          ['Accessories', '1,57,575', '6,303.00', '1,500', '12,805', '25'],
          ['Electronics', '27,47,792', '98,135.43', '33,506', '2,60,140', '28'],
          ['Furniture', '1,89,586', '27,083.71', '8,826', '43,940', '7'],
          ['Total', '30,94,953', '51,582.55', '1,500', '2,60,140', '60'],
        ],
      },
      steps: [
        'Modeling > New measure for each of the five formulas below (one per measure)',
        'Format Avg Sale as Decimal number, 2 decimal places; others as Whole number',
        'Insert a Matrix visual; Rows = Product[Category]',
        'Drag the five measures into Values in the order shown',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])
Avg Sale = AVERAGE(Sales[SalesAmount])
Min Sale = MIN(Sales[SalesAmount])
Max Sale = MAX(Sales[SalesAmount])
Order Count = COUNT(Sales[OrderID])`,
      result: 'The matrix above. Note the Total row is not the sum of the rows for Avg, Min and Max: it is recalculated over all 60 rows.',
      explanation: 'Each cell re-runs the aggregation for its own filter. Total row AVERAGE = 30,94,953 / 60, not the average of the three category averages.',
    },
    {
      title: 'Example 2: Same measures by Year',
      scenario: 'Compare 2023 and 2024 order behaviour.',
      table: {
        headers: ['Year', 'Total Sales', 'Avg Sale', 'Min Sale', 'Max Sale', 'Order Count'],
        rows: [
          ['2023', '14,32,315', '44,759.84', '1,500', '2,21,776', '32'],
          ['2024', '16,62,638', '59,379.93', '1,642', '2,60,140', '28'],
          ['Total', '30,94,953', '51,582.55', '1,500', '2,60,140', '60'],
        ],
      },
      steps: [
        'Duplicate the matrix from Example 1 (Ctrl+C, Ctrl+V)',
        'Replace Product[Category] in Rows with Date[Year] (or Sales[Year] in the DAX Lab)',
      ],
      code: '-- reuse the five measures from Example 1',
      result: '2024 had fewer orders (28 vs 32) but higher sales because the average order was bigger (59,379.93 vs 44,759.84).',
      explanation: 'Same measures, different filter context. Measures are reusable across any dimension.',
    },
    {
      title: 'Example 3: MIN and MAX on Unit Price per Product',
      scenario: 'Sales staff give discounts. Show the lowest and highest unit price actually charged per product.',
      table: {
        headers: ['Product', 'List Price', 'Min Unit Price', 'Max Unit Price'],
        rows: [
          ['Headphones', '2,500', '2,280', '2,715'],
          ['Keyboard', '1,500', '1,387', '1,642'],
          ['Laptop', '55,000', '49,500', '56,946'],
          ['Mobile', '18,000', '16,327', '19,236'],
          ['Office Chair', '9,000', '8,130', '9,790'],
        ],
      },
      steps: [
        'Modeling > New measure: Min Unit Price and Max Unit Price (code below)',
        'Modeling > New measure: List Price = MAX(Product[Price])',
        'Insert a Table visual with Product[Product] and the three measures',
      ],
      code: `Min Unit Price = MIN(Sales[UnitPrice])
Max Unit Price = MAX(Sales[UnitPrice])
List Price = MAX(Product[Price])`,
      result: 'Laptop sold between 49,500 and 56,946 against a list price of 55,000. Desk does not appear because it has no sales (min/max are blank) - but List Price alone would show it.',
      explanation: 'MIN/MAX scan only the Sales rows visible for each product. List Price uses MAX on the Product table, which has one row per product, so MAX simply returns that price.',
    },
    {
      title: 'Example 4: First and last order date with MIN/MAX on dates',
      scenario: 'Show when each customer first and last ordered.',
      table: {
        headers: ['Measure', 'All customers'],
        rows: [
          ['First Order', '07-01-2023'],
          ['Last Order', '26-12-2024'],
        ],
      },
      steps: [
        'Modeling > New measure: First Order and Last Order (code below)',
        'Measure tools > Format > choose a date format such as dd-mm-yyyy',
        'Add two Cards, then add a Customer[Customer] slicer to see per-customer dates',
      ],
      code: `First Order = MIN(Sales[OrderDate])
Last Order = MAX(Sales[OrderDate])`,
      result: 'For all data: 07-01-2023 and 26-12-2024. Selecting a customer in the slicer shows that customer\'s first and last order dates.',
      explanation: 'MIN and MAX work on dates because dates are stored as numbers internally.',
    },
    {
      title: 'Example 5: Two-argument MAX and a KPI built from basics',
      scenario: 'Calculate Average Order Value from SUM and COUNT, and a "Profit floor" that never goes below zero.',
      table: {
        headers: ['City', 'Avg Order Value', 'Profit (floor 0)'],
        rows: [
          ['Mumbai', '66,759.08', '2,35,962'],
          ['Nagpur', '65,210.11', '3,58,225'],
          ['Nashik', '23,303.33', '63,798'],
          ['Pune', '43,349.14', '2,71,309'],
          ['Total', '51,582.55', '9,29,294'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula below',
        'Insert a Table visual: Customer[City], Avg Order Value, Profit Floor',
      ],
      code: `Avg Order Value = DIVIDE(SUM(Sales[SalesAmount]), COUNT(Sales[OrderID]))
Profit Floor = MAX(SUM(Sales[SalesAmount]) - SUM(Sales[Cost]), 0)`,
      result: 'The table above. No city has negative profit, so Profit Floor equals profit.',
      explanation: 'Avg Order Value is SUM / COUNT, which equals AVERAGE(Sales[SalesAmount]) here because each row is one order. MAX(a, 0) returns a if positive, otherwise 0.',
    },
  ],
  interview: [
    {
      q: 'What argument does SUM accept? Can you write SUM(Sales[Qty] * Sales[Price])?',
      a: 'SUM accepts only a single column reference. For an expression evaluated row by row you must use SUMX(Sales, Sales[Qty] * Sales[Price]).',
      level: 'Easy',
    },
    {
      q: 'How do AVERAGE and blanks/zeros interact?',
      a: 'AVERAGE ignores blank values but includes zeros in both the sum and the count. Replacing blanks with zero in Power Query will therefore lower the average.',
      level: 'Medium',
    },
    {
      q: 'Why is the Total row of an Average measure not the average of the rows above it?',
      a: 'Measures are recalculated in the total row filter context (all rows), so the total is the average over all underlying rows, weighted by row count, not an average of averages.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between COUNT and COUNTROWS?',
      a: 'COUNT(column) counts non-blank values in one column. COUNTROWS(table) counts rows in a table regardless of blanks. COUNTROWS is clearer and preferred for counting records.',
      level: 'Easy',
    },
    {
      q: 'Scenario: write a measure for the latest order date for each product and explain what Desk shows.',
      a: 'Last Order = MAX(Sales[OrderDate]). Desk has no sales so it returns blank and the row is hidden unless "Show items with no data" is enabled.',
      level: 'Medium',
    },
    {
      q: 'What does MAX([Profit], 0) do?',
      a: 'It is the two-argument form: it returns the larger of profit and 0, so negative profits are shown as 0.',
      level: 'Medium',
    },
    {
      q: 'Can MIN and MAX work on text columns?',
      a: 'Yes. They compare text alphabetically. MIN(Customer[Customer]) returns "Asha Traders", MAX returns "Sai Furnishers".',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create Total Quantity and Avg Quantity measures and show them by Category.',
      hint: 'SUM(Sales[Quantity]) and AVERAGE(Sales[Quantity]).',
      solution: 'Accessories 74 / 2.96, Electronics 89 / 3.18, Furniture 22 / 3.14, Total 185 / 3.08.',
    },
    {
      task: 'Find the biggest single order for each customer.',
      hint: 'MAX(Sales[SalesAmount]) with Customer[Customer] on rows.',
      solution: 'Asha Traders 2,60,140; Kiran Mart 55,200; Neha Enterprises 2,21,776; Om Electronics 91,785; Ravi Stores 2,52,415; Sai Furnishers 1,06,590.',
    },
    {
      task: 'Create Avg List Price = AVERAGE(Product[Price]) and show it in a card, then by Category.',
      hint: 'The Product table has 6 rows.',
      solution: 'Card: 16,333.33. By Category: Accessories 2,000; Electronics 36,500; Furniture 10,500.',
    },
    {
      task: 'In the DAX Lab, show Order Count and Total Sales by Customer[Segment].',
      hint: 'COUNT(Sales[OrderID]).',
      solution: 'Corporate 36 orders / 21,58,211; Retail 24 orders / 9,36,742.',
    },
  ],
  quiz: [
    {
      question: 'What does AVERAGE do with blank values?',
      options: ['Treats them as 0', 'Ignores them', 'Returns an error', 'Counts them twice'],
      answer: 1,
      explanation: 'Blanks are excluded from both the sum and the count.',
    },
    {
      question: 'Which formula is valid DAX?',
      options: ['SUM(Sales)', 'SUM(Sales[SalesAmount])', 'SUM(Sales[Quantity] * Sales[UnitPrice])', 'SUM[Sales](SalesAmount)'],
      answer: 1,
      explanation: 'SUM takes one column reference only.',
    },
    {
      question: 'MAX(Sales[OrderDate]) returns:',
      options: ['Number of dates', 'The latest order date in the current context', 'The earliest date', 'An error because dates are not numbers'],
      answer: 1,
      explanation: 'MAX works on dates and returns the latest one.',
    },
    {
      question: 'With the practice data, AVERAGE(Sales[SalesAmount]) for all data is:',
      options: ['30,94,953', '51,582.55', '16,333.33', '60'],
      answer: 1,
      explanation: '30,94,953 / 60 rows = 51,582.55.',
    },
    {
      question: 'COUNT(Sales[CustomerID]) for all data returns:',
      options: ['6', '60', '4', '185'],
      answer: 1,
      explanation: 'COUNT counts every non-blank value (60 rows), not unique customers (6).',
    },
  ],
};
