export default {
  id: 'extra-14-rankx',
  title: 'RANKX()',
  module: 'Extra: DAX',
  extraNo: 14,
  level: 'Advanced',
  duration: '2 hours',
  summary: "RANKX() gives a position number (1, 2, 3...) to the current item by comparing its value with every item in a table you supply. It powers leaderboards such as product rank, customer rank and rank within a category.",
  objectives: [
    'Write a RANKX() measure that ranks products and customers by sales',
    'Choose the correct table argument (ALL, ALLSELECTED, FILTER) for the ranking you want',
    'Handle blanks, totals and ties (Skip vs Dense)',
    'Rank within a group (product rank inside its category)',
  ],
  theory: [
    {
      heading: 'How RANKX() thinks',
      content: "RANKX() is an **iterator**. Imagine a teacher ranking one student: she takes the full class list, writes down every student's marks, then counts how many students scored more than the current student. Position = that count + 1.\n\nRANKX() does the same:\n1. It loops over the **table** you give it and evaluates the **expression** for each row (building the list of scores)\n2. It evaluates the same expression for the **current** item (the matrix row you are on)\n3. It returns the position of the current value in that sorted list",
      syntax: 'RANKX ( <table>, <expression> [, <value>] [, <order>] [, <ties>] )',
      points: [
        '<table>: the list of competitors, usually ALL(Product[Product]) or ALLSELECTED(Customer[Customer])',
        '<expression>: usually a measure such as [Total Sales] (context transition happens for each row)',
        '<value>: optional, rarely used; the value to rank, defaults to <expression> in the current context',
        '<order>: DESC (default, biggest = 1) or ASC (smallest = 1)',
        '<ties>: Skip (default: 1, 1, 3) or Dense (1, 1, 2)',
      ],
    },
    {
      heading: 'Why the table needs ALL()',
      content: "On a matrix row for Laptop, the filter context contains only Laptop. If you write `RANKX(VALUES(Product[Product]), [Total Sales])`, the competitor list contains only Laptop, so **every row gets rank 1**. This is the most common RANKX mistake.\n\nUse `ALL(Product[Product])` so the competitor list always contains every product, while the current value is still calculated for the row's product.\n\n- `ALL(Product[Product])`: rank against all products, ignoring slicers on Product[Product]\n- `ALLSELECTED(Product[Product])`: rank only among products selected in slicers or visual filters\n- `ALL(Product)`: removes filters from every column of Product (also Category)",
      tip: 'Ranks always 1? Your table argument is being filtered by the current row. Wrap it in ALL() or ALLSELECTED().',
    },
    {
      heading: 'Blanks and the Total row',
      content: "Desk has no sales, so [Total Sales] is blank for it. RANKX() still gives it a rank (the last one), which makes the Desk row appear in your matrix with an empty sales cell. On the Total row, the grand total is compared with single products and gets rank 1, which is meaningless.\n\nFix both with a guard:\n\n`IF(HASONEVALUE(Product[Product]) && NOT ISBLANK([Total Sales]), RANKX(...))`\n\nIn ASC order a blank is treated like 0, so it would take rank 1. When ranking ascending, iterate only items with sales: `FILTER(ALL(Product[Product]), [Total Sales] > 0)`.",
    },
    {
      heading: 'Ties: Skip vs Dense',
      content: "If two items have the same value they share a rank.\n\n- **Skip** (default): 1, 1, 3 (like a race where two runners share gold and the next gets bronze)\n- **Dense**: 1, 1, 2 (no gap)\n\nExample from our data: Accessories and Electronics each have 6 buying customers, Furniture has 4. With Skip, Furniture is rank 3; with Dense it is rank 2.",
      syntax: 'RANKX ( ALL ( Product[Category] ), [Active Customers], , DESC, Dense )',
    },
    {
      heading: 'Ranking within a group',
      content: "Put Category and Product in a matrix (Category > Product). `RANKX(ALL(Product[Product]), [Total Sales])` removes only the **Product** filter; the **Category** filter from the parent row stays. So products of other categories return blank sales and drop to the bottom, and you get a rank **inside each category** automatically.\n\nTo rank across all categories instead, use `ALL(Product)` (or `ALL(Product[Product], Product[Category])`), which removes the category filter too.",
    },
    {
      heading: 'RANKX() vs RANK() and the Top N filter',
      content: "Newer Power BI versions also have the window function `RANK()`, which works on ORDERBY/PARTITIONBY. RANKX() remains the most widely used and is supported in the DAX Lab.\n\nFor a simple \"show only top 5\" visual you do not need DAX at all: Filters pane > drag Product[Product] > Filter type **Top N** > Show items Top 5 > By value Total Sales. Use RANKX() when you need the rank **number** on screen or in other measures.",
    },
  ],
  examples: [
    {
      title: 'Product sales rank',
      scenario: 'Show each product with its sales and its rank (1 = highest sales).',
      table: {
        headers: ['Product', 'Total Sales', 'Product Rank'],
        rows: [
          ['Laptop', '1,739,560', '1'],
          ['Mobile', '1,008,232', '2'],
          ['Office Chair', '189,586', '3'],
          ['Headphones', '110,938', '4'],
          ['Keyboard', '46,637', '5'],
          ['Total', '3,094,953', ''],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Product Rank (code below).',
        'Insert a Matrix. Rows: Product[Product]. Values: Total Sales, Product Rank.',
        'Click the Product Rank column header to sort ascending.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Product Rank =
IF (
    HASONEVALUE ( Product[Product] ) && NOT ISBLANK ( [Total Sales] ),
    RANKX ( ALL ( Product[Product] ), [Total Sales], , DESC )
)`,
      result: 'Laptop is rank 1 and Keyboard rank 5. Desk does not appear and the Total row rank is blank.',
      explanation: 'ALL(Product[Product]) gives the full list of 6 competitors. For each, [Total Sales] is calculated through context transition. The guard hides Desk (blank sales) and the Total row.',
    },
    {
      title: 'Rank inside each category',
      scenario: 'In a Category > Product matrix, show which product is number 1 in its own category, and also the overall rank.',
      table: {
        headers: ['Category / Product', 'Total Sales', 'Rank in Category', 'Overall Rank'],
        rows: [
          ['Accessories', '157,575', '', ''],
          ['   Headphones', '110,938', '1', '4'],
          ['   Keyboard', '46,637', '2', '5'],
          ['Electronics', '2,747,792', '', ''],
          ['   Laptop', '1,739,560', '1', '1'],
          ['   Mobile', '1,008,232', '2', '2'],
          ['Furniture', '189,586', '', ''],
          ['   Office Chair', '189,586', '1', '3'],
        ],
      },
      steps: [
        'Create the two measures below with Modeling > New measure.',
        'Insert a Matrix. Rows: Product[Category], then Product[Product] under it. Values: Total Sales, Rank in Category, Overall Rank.',
        'Use the Expand all down one level icon (forked arrow) on the visual header to show products.',
      ],
      code: `Rank in Category =
IF (
    HASONEVALUE ( Product[Product] ) && NOT ISBLANK ( [Total Sales] ),
    RANKX ( ALL ( Product[Product] ), [Total Sales] )
)

Overall Rank =
IF (
    HASONEVALUE ( Product[Product] ) && NOT ISBLANK ( [Total Sales] ),
    RANKX ( ALL ( Product ), [Total Sales] )
)`,
      result: 'Headphones is rank 1 inside Accessories but rank 4 overall. Category subtotal rows show blank ranks.',
      explanation: 'ALL(Product[Product]) clears only the product filter, so the category filter from the parent row still limits sales; products from other categories get blank and fall to the end. ALL(Product) clears category as well, so all products compete.',
    },
    {
      title: 'Customer leaderboard that respects slicers',
      scenario: 'Rank customers by sales, but when the user selects only some customers in a slicer, the ranks should restart among the selected ones.',
      table: {
        headers: ['Customer', 'Total Sales', 'Customer Rank'],
        rows: [
          ['Neha Enterprises', '1,173,782', '1'],
          ['Asha Traders', '636,464', '2'],
          ['Ravi Stores', '453,144', '3'],
          ['Sai Furnishers', '347,965', '4'],
          ['Om Electronics', '273,868', '5'],
          ['Kiran Mart', '209,730', '6'],
        ],
      },
      steps: [
        'Modeling > New measure: Customer Rank (code below).',
        'Insert a Table visual with Customer[Customer], Total Sales and Customer Rank.',
        'Insert a Slicer on Customer[Customer].',
        'Select Ravi Stores, Om Electronics and Kiran Mart in the slicer.',
      ],
      code: `Customer Rank =
IF (
    HASONEVALUE ( Customer[Customer] ),
    RANKX ( ALLSELECTED ( Customer[Customer] ), [Total Sales] )
)`,
      result: 'With no slicer selection you see ranks 1 to 6 as in the table. After selecting Ravi Stores, Om Electronics and Kiran Mart, their ranks become 1, 2 and 3.',
      explanation: 'ALLSELECTED() removes the row filter of the visual but keeps the slicer selection, so only the selected customers compete.',
    },
    {
      title: 'Ties with Skip and Dense',
      scenario: 'Rank categories by the number of customers who bought them. Two categories tie.',
      table: {
        headers: ['Category', 'Active Customers', 'Rank Skip', 'Rank Dense'],
        rows: [
          ['Accessories', '6', '1', '1'],
          ['Electronics', '6', '1', '1'],
          ['Furniture', '4', '3', '2'],
        ],
      },
      steps: [
        'Modeling > New measure: Active Customers = DISTINCTCOUNT(Sales[CustomerID]).',
        'Create Rank Skip and Rank Dense (code below).',
        'Insert a Table visual: Product[Category], Active Customers, Rank Skip, Rank Dense.',
      ],
      code: `Active Customers = DISTINCTCOUNT ( Sales[CustomerID] )

Rank Skip =
RANKX ( ALL ( Product[Category] ), [Active Customers], , DESC, Skip )

Rank Dense =
RANKX ( ALL ( Product[Category] ), [Active Customers], , DESC, Dense )`,
      result: 'Accessories and Electronics share rank 1. Furniture is 3 with Skip and 2 with Dense.',
      explanation: 'Skip leaves a gap equal to the number of tied items; Dense always uses the next integer. The third argument is left empty so RANKX uses the expression for the current value.',
    },
    {
      title: 'Smallest first: ascending rank without the blank problem',
      scenario: 'Find the weakest-selling products (rank 1 = lowest sales) to plan a discount campaign.',
      table: {
        headers: ['Product', 'Total Sales', 'Low Sales Rank'],
        rows: [
          ['Keyboard', '46,637', '1'],
          ['Headphones', '110,938', '2'],
          ['Office Chair', '189,586', '3'],
          ['Mobile', '1,008,232', '4'],
          ['Laptop', '1,739,560', '5'],
        ],
      },
      steps: [
        'Modeling > New measure: Low Sales Rank (code below).',
        'Insert a Table visual with Product[Product], Total Sales and Low Sales Rank. Sort by Low Sales Rank.',
      ],
      code: `Low Sales Rank =
IF (
    HASONEVALUE ( Product[Product] ) && NOT ISBLANK ( [Total Sales] ),
    RANKX (
        FILTER ( ALL ( Product[Product] ), [Total Sales] > 0 ),
        [Total Sales], , ASC
    )
)`,
      result: 'Keyboard is rank 1. Without the FILTER, Desk (blank = 0) would take rank 1 and Keyboard would become rank 2.',
      explanation: 'In ASC order blanks are treated as the smallest value. Filtering the competitor list to products with sales removes Desk from the competition.',
    },
  ],
  interview: [
    { q: 'Explain the arguments of RANKX().', a: 'RANKX(table, expression, value, order, ties). Table is the list of competitors, expression is evaluated for each row of that table and for the current context, value optionally overrides the current value, order is DESC (default) or ASC, ties is Skip (default) or Dense.', level: 'Easy' },
    { q: 'Your RANKX measure shows 1 for every product. Why?', a: 'The table argument is being filtered by the current row, for example VALUES(Product[Product]) or Product without ALL. Each row then competes only with itself. Use ALL(Product[Product]) or ALLSELECTED(Product[Product]).', level: 'Medium' },
    { q: 'ALL vs ALLSELECTED in RANKX: when do you use each?', a: 'ALL ignores every filter on the column, so ranks are fixed against the full list. ALLSELECTED keeps slicer and outer filter selections, so ranks are recalculated among the selected items, which is usually what users expect in interactive reports.', level: 'Medium' },
    { q: 'Why does RANKX use a measure like [Total Sales] instead of SUM(Sales[SalesAmount]) directly?', a: 'A measure reference triggers context transition for each row of the table being iterated. SUM(Sales[SalesAmount]) without CALCULATE would ignore the row context and return the same total for every product, making all ranks equal. CALCULATE(SUM(...)) would also work.', level: 'Hard' },
    { q: 'How do you hide the rank on the Total row and for products without sales?', a: 'Wrap RANKX in IF(HASONEVALUE(Product[Product]) && NOT ISBLANK([Total Sales]), RANKX(...)). ISINSCOPE(Product[Product]) is another common check in hierarchies.', level: 'Medium' },
    { q: 'Scenario: you need the rank of each product within its category in a matrix. How?', a: 'Use RANKX(ALL(Product[Product]), [Total Sales]) with Category above Product in the matrix. Only the product filter is removed; the category filter stays, so ranks restart in each category. Use ALL(Product) for an overall rank.', level: 'Hard' },
    { q: 'Difference between Skip and Dense ties?', a: 'With values 100, 100, 80: Skip gives 1, 1, 3; Dense gives 1, 1, 2.', level: 'Easy' },
    { q: 'Scenario: show only the top 3 products in a bar chart and allow the user to change N. Approach?', a: 'Create a What-if parameter for N, a measure Rank = RANKX(ALLSELECTED(Product[Product]), [Total Sales]) and a flag measure IF([Rank] <= [N Value], 1, 0). Add the flag as a visual-level filter equal to 1. For a fixed N the Top N filter type in the Filters pane is enough.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a City Rank measure and show it in a matrix with Customer[City] on rows.',
      hint: 'RANKX(ALL(Customer[City]), [Total Sales]) with a HASONEVALUE guard.',
      solution: 'City Rank = IF(HASONEVALUE(Customer[City]), RANKX(ALL(Customer[City]), [Total Sales])). Nagpur 1 (1,173,782), Pune 2, Mumbai 3, Nashik 4.',
    },
    {
      task: 'Rank products by quantity sold instead of sales value.',
      hint: 'Create Total Qty = SUM(Sales[Quantity]) first.',
      solution: 'Qty Rank = IF(HASONEVALUE(Product[Product]) && NOT ISBLANK([Total Qty]), RANKX(ALL(Product[Product]), [Total Qty])). Mobile 1 (56), Headphones 2 (44), Laptop 3 (33), Keyboard 4 (30), Office Chair 5 (22).',
    },
    {
      task: 'Create a flag that keeps only the top 2 products in a table visual.',
      hint: 'Reuse Product Rank and add the flag as a visual filter.',
      solution: 'Top 2 Flag = IF([Product Rank] <= 2, 1, 0). In the Filters pane, set Top 2 Flag is 1. Only Laptop and Mobile remain.',
    },
    {
      task: 'Rank customers inside each segment in a Segment > Customer matrix.',
      hint: 'Remove only the customer filter.',
      solution: 'Rank in Segment = IF(HASONEVALUE(Customer[Customer]), RANKX(ALL(Customer[Customer]), [Total Sales])). Corporate: Neha 1, Asha 2, Sai 3. Retail: Ravi 1, Om 2, Kiran 3.',
    },
    {
      task: 'Try this in the DAX Lab: write RANKX(VALUES(Product[Product]), [Total Sales]) and observe the result by Product.',
      hint: 'Compare it with the ALL version.',
      solution: 'Every product shows 1, because VALUES() returns only the current product. Changing to ALL(Product[Product]) fixes it.',
    },
  ],
  quiz: [
    { question: 'What is the default order of RANKX()?', options: ['ASC', 'DESC', 'Alphabetical', 'No order'], answer: 1, explanation: 'DESC is the default, so the largest value gets rank 1.' },
    { question: 'Which table argument ranks a product against all products regardless of slicers on Product[Product]?', options: ['VALUES(Product[Product])', 'ALL(Product[Product])', 'Product', 'SELECTEDVALUE(Product[Product])'], answer: 1, explanation: 'ALL() returns all products and ignores filters on that column.' },
    { question: 'Values 500, 500, 300 ranked with Dense give:', options: ['1, 2, 3', '1, 1, 3', '1, 1, 2', '2, 2, 1'], answer: 2, explanation: 'Dense does not leave gaps after ties.' },
    { question: 'In the practice model, what is Mobile\'s rank by Total Sales?', options: ['1', '2', '3', '4'], answer: 1, explanation: 'Laptop (1,739,560) is first and Mobile (1,008,232) is second.' },
    { question: 'In a Category > Product matrix, RANKX(ALL(Product[Product]), [Total Sales]) gives Headphones rank 1. Why?', options: ['Headphones has the highest total sales', 'The Accessories category filter is still active, so only Accessories products have sales', 'RANKX sorts alphabetically', 'ALL removes all filters from the model'], answer: 1, explanation: 'ALL(Product[Product]) clears only the product column, so the category filter remains and the ranking happens inside Accessories.' },
  ],
};
