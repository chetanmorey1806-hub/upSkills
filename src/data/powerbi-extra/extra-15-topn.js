export default {
  id: 'extra-15-topn',
  title: 'TOPN()',
  module: 'Extra: DAX',
  extraNo: 15,
  level: 'Advanced',
  duration: '2 hours',
  summary: "TOPN() returns the top N rows of a table ordered by an expression, for example the 3 best-selling products. Because it returns a table, it is combined with SUMX, CONCATENATEX or CALCULATE to build Top N totals, Top N share and \"best customer\" measures.",
  objectives: [
    'Write TOPN() with the correct table, N and order-by expression',
    'Turn the TOPN() table into numbers with SUMX() and CALCULATE()',
    'Return the name of the top item with CONCATENATEX(TOPN(1, ...))',
    'Understand how TOPN() handles ties and filter context',
    'Compare TOPN() with the Top N filter in the Filters pane',
  ],
  theory: [
    {
      heading: 'What TOPN() returns',
      content: "TOPN() is a **table function**. It takes a table, sorts it by an expression and keeps the first N rows. It does **not** return a number, so you cannot put `TOPN(...)` directly in a card. You wrap it:\n\n- `SUMX(TOPN(3, ...), [Total Sales])` gives the sales of the top 3\n- `CONCATENATEX(TOPN(1, ...), Product[Product])` gives the name of the best item\n- `CALCULATE([Total Sales], TOPN(3, ...))` uses the top rows as a filter\n\nAnalogy: a school announces the top 3 students. TOPN() is the list of those 3 names; you still need to decide what to do with the list (add their marks, print their names...).",
      syntax: 'TOPN ( <N>, <Table>, <OrderByExpression> [, <Order>] [, <OrderByExpression2>, <Order2>] ... )',
      points: [
        'N: how many rows to keep (a number or an expression)',
        'Table: the candidates, usually ALL(Product[Product]) or ALLSELECTED(Customer[Customer])',
        'OrderByExpression: what to sort by, usually a measure like [Total Sales]',
        'Order: DESC (default, largest first) or ASC',
      ],
    },
    {
      heading: 'Choosing the candidate table',
      content: "Just like RANKX(), the table must contain all candidates. On a Product row the filter context shows only one product, so `TOPN(3, VALUES(Product[Product]), [Total Sales])` returns just that one product.\n\nUse `ALL(Product[Product])` to consider every product. Filters on **other** columns still apply: in a matrix with City on rows, `TOPN(3, ALL(Product[Product]), [Total Sales])` returns the top 3 products **of that city**, because [Total Sales] is evaluated per product with the City filter still active.",
      tip: 'Use ALLSELECTED() instead of ALL() when the top N should be chosen only from items the user selected in slicers.',
    },
    {
      heading: 'Ties: TOPN can return more than N rows',
      content: "If the value at position N is tied with other rows, TOPN() returns **all** tied rows. For example in Nashik only 3 products have sales; the other 3 are blank. `TOPN(4, ALL(Product[Product]), [Total Sales])` in Nashik returns Mobile, Headphones, Keyboard and all 3 blank products (6 rows), because they tie for 4th place.\n\nWhen totals are summed with SUMX the blanks add nothing, so the number is still correct. But a COUNTROWS() or a CONCATENATEX() list will show the extra rows. Add a second order-by column (for example the product name) or filter out blanks if you need exactly N.",
    },
    {
      heading: 'TOPN() as a CALCULATE filter',
      content: "A table returned by TOPN() can be used as a **filter argument**:\n\n`CALCULATE([Total Sales], TOPN(3, ALL(Product[Product]), [Total Sales]))`\n\nCALCULATE applies the 3 product names as a filter on Product[Product] and calculates sales for them together. This is useful when the inner measure is not additive, for example a distinct count of customers who bought any of the top 3 products.",
    },
    {
      heading: 'TOPN() vs the Top N visual filter',
      content: "For a visual that should simply show the top 5 items, use the Filters pane:\n1. Select the visual\n2. In Filters on this visual, expand the field (for example Product)\n3. Filter type: **Top N**, Show items: Top 5, By value: drag Total Sales\n4. Click **Apply filter**\n\nUse TOPN() in DAX when you need a **number** (Top 3 sales, Top 3 share %) or a **name** in a card, or when the top N must feed another calculation.",
    },
  ],
  examples: [
    {
      title: 'Sales of the top 3 products, per city',
      scenario: 'The regional head wants to see how much the 3 best-selling products contribute in each city.',
      table: {
        headers: ['City', 'Total Sales', 'Top 3 Products Sales'],
        rows: [
          ['Mumbai', '801,109', '780,529'],
          ['Nagpur', '1,173,782', '1,129,620'],
          ['Nashik', '209,730', '209,730'],
          ['Pune', '910,332', '850,501'],
          ['Total', '3,094,953', '2,937,378'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Top 3 Products Sales (code below).',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, Top 3 Products Sales.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Top 3 Products Sales =
SUMX (
    TOPN ( 3, ALL ( Product[Product] ), [Total Sales], DESC ),
    [Total Sales]
)`,
      result: 'In Pune the top 3 are Laptop (411,082), Mobile (379,558) and Office Chair (59,861) = 850,501. Nashik sells only 3 products, so its top 3 equals its total. The Total row uses Laptop + Mobile + Office Chair = 2,937,378.',
      explanation: 'ALL(Product[Product]) gives all 6 products as candidates, but the City filter still applies when [Total Sales] is calculated for each product, so each city gets its own top 3. SUMX then adds the sales of those 3 rows.',
    },
    {
      title: 'Top 3 share of total sales',
      scenario: 'Show what percentage of overall sales comes from the top 3 products.',
      steps: [
        'Make sure Top 3 Products Sales exists (Example 1).',
        'Modeling > New measure: Top 3 Share = DIVIDE([Top 3 Products Sales], [Total Sales]).',
        'With the measure selected, Measure tools > Format > Percentage, 2 decimals.',
        'Insert a Card visual and drag Top 3 Share into it.',
      ],
      code: `Top 3 Share =
DIVIDE ( [Top 3 Products Sales], [Total Sales] )`,
      result: 'The card shows 94.91% (2,937,378 / 3,094,953).',
      explanation: 'Both measures respect the same filter context, so adding a City slicer gives the share for that city (for example Pune: 850,501 / 910,332 = 93.43%).',
    },
    {
      title: 'Name of the best customer in each city',
      scenario: 'Next to each city, show the name of the customer with the highest sales.',
      table: {
        headers: ['City', 'Total Sales', 'Top Customer'],
        rows: [
          ['Mumbai', '801,109', 'Ravi Stores'],
          ['Nagpur', '1,173,782', 'Neha Enterprises'],
          ['Nashik', '209,730', 'Kiran Mart'],
          ['Pune', '910,332', 'Asha Traders'],
          ['Total', '3,094,953', 'Neha Enterprises'],
        ],
      },
      steps: [
        'Modeling > New measure: Top Customer (code below).',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, Top Customer.',
      ],
      code: `Top Customer =
CONCATENATEX (
    TOPN ( 1, ALL ( Customer[Customer] ), [Total Sales], DESC ),
    Customer[Customer],
    ", "
)`,
      result: 'Mumbai shows Ravi Stores (453,144 beats Sai Furnishers 347,965). The Total row shows Neha Enterprises (1,173,782).',
      explanation: 'TOPN(1, ...) returns a one-row table with the best customer for the current city. CONCATENATEX converts that table to text. If two customers tied, both names would appear separated by a comma.',
    },
    {
      title: 'List the top 3 products with their sales',
      scenario: 'Create a text measure for a card or tooltip: the top 3 products with values, best first.',
      steps: [
        'Modeling > New measure (code below).',
        'Insert a Card (or a Text box with a dynamic value) and use Top 3 List.',
      ],
      code: `Top 3 List =
VAR Top3 = TOPN ( 3, ALL ( Product[Product] ), [Total Sales], DESC )
RETURN
    CONCATENATEX (
        Top3,
        Product[Product] & " (" & FORMAT ( [Total Sales], "#,0" ) & ")",
        ", ",
        [Total Sales], DESC
    )`,
      result: 'Laptop (1,739,560), Mobile (1,008,232), Office Chair (189,586)',
      explanation: 'TOPN() does not guarantee any order of the rows it returns. The 4th and 5th arguments of CONCATENATEX sort the text by [Total Sales] descending.',
    },
    {
      title: 'Top N with the Filters pane (no DAX)',
      scenario: 'A bar chart should only show the top 3 customers.',
      table: {
        headers: ['Customer', 'Total Sales'],
        rows: [
          ['Neha Enterprises', '1,173,782'],
          ['Asha Traders', '636,464'],
          ['Ravi Stores', '453,144'],
        ],
      },
      steps: [
        'Insert a Clustered bar chart. Y-axis: Customer[Customer]. X-axis: Total Sales.',
        'Open the Filters pane, expand Customer under Filters on this visual.',
        'Filter type: Top N. Show items: Top, 3.',
        'Drag Total Sales into the By value box and click Apply filter.',
      ],
      result: 'The chart shows only the 3 customers above.',
      explanation: 'The visual-level Top N filter is the simplest option for display. Use DAX TOPN() when you need the result inside a measure.',
    },
  ],
  interview: [
    { q: 'What does TOPN() return?', a: 'A table containing the top N rows of the input table, ordered by the given expression. It must be wrapped in a function such as SUMX, CONCATENATEX, COUNTROWS or used as a CALCULATE filter.', level: 'Easy' },
    { q: 'Can TOPN(3, ...) return more than 3 rows?', a: 'Yes. If rows tie at the Nth position, all tied rows are returned. Add a tie-breaker order-by expression if you need exactly N.', level: 'Medium' },
    { q: 'Are the rows returned by TOPN() sorted?', a: 'No. TOPN only selects the rows; the result table has no guaranteed order. Sort in the consuming function (for example CONCATENATEX order arguments) or in the visual.', level: 'Medium' },
    { q: 'Why use ALL(Product[Product]) as the table argument?', a: 'Inside a visual row the product filter would leave only the current product. ALL removes that filter so all products compete. Filters on other columns (city, year) still apply to the order-by measure.', level: 'Medium' },
    { q: 'Scenario: show "Top 3 products sales" that changes with a Year slicer. Will SUMX(TOPN(3, ALL(Product[Product]), [Total Sales]), [Total Sales]) work?', a: 'Yes. ALL only removes the filter on Product[Product]. The Year filter stays, so the top 3 are selected using sales of that year and their sales are summed for that year.', level: 'Hard' },
    { q: 'TOPN vs RANKX: when to use which?', a: 'RANKX returns a number (position) for the current item, good for showing ranks or flagging rows. TOPN returns a set of rows, good for summing, listing or filtering the top items in one measure.', level: 'Medium' },
    { q: 'How would you let users choose N?', a: 'Create a What-if parameter (Modeling > New parameter > Numeric range) and use its value measure as the first argument: TOPN([TopN Value], ALL(Product[Product]), [Total Sales]).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Calculate the sales of the top 2 customers overall.',
      hint: 'SUMX(TOPN(2, ALL(Customer[Customer]), [Total Sales]), [Total Sales]).',
      solution: 'Top 2 Customers Sales = 1,173,782 + 636,464 = 1,810,246.',
    },
    {
      task: 'Return the name of the lowest-selling product that has sales.',
      hint: 'Use ASC order and filter out blank products.',
      solution: 'Weakest Product = CONCATENATEX(TOPN(1, FILTER(ALL(Product[Product]), [Total Sales] > 0), [Total Sales], ASC), Product[Product]). Result: Keyboard.',
    },
    {
      task: 'Count how many different customers bought any of the top 2 products.',
      hint: 'Use TOPN as a filter inside CALCULATE with DISTINCTCOUNT.',
      solution: 'Top2 Buyers = CALCULATE(DISTINCTCOUNT(Sales[CustomerID]), TOPN(2, ALL(Product[Product]), [Total Sales])). Laptop and Mobile together were bought by all 6 customers, so the result is 6.',
    },
    {
      task: 'Show the best product in each category in a matrix with Product[Category] on rows.',
      hint: 'TOPN(1, ALL(Product[Product]), [Total Sales]) keeps the category filter.',
      solution: 'Best Product = CONCATENATEX(TOPN(1, ALL(Product[Product]), [Total Sales]), Product[Product]). Accessories: Headphones, Electronics: Laptop, Furniture: Office Chair.',
    },
    {
      task: 'Try this in the DAX Lab: put Top 3 Products Sales in a matrix by Customer[Segment].',
      hint: 'Each segment picks its own top 3.',
      solution: 'Corporate and Retail each choose their own top 3 products; the numbers change because the segment filter applies while ranking.',
    },
  ],
  quiz: [
    { question: 'What is the data type of the result of TOPN()?', options: ['A number', 'A table', 'Text', 'A Boolean'], answer: 1, explanation: 'TOPN() returns a table of rows.' },
    { question: 'In the practice model, SUMX(TOPN(3, ALL(Product[Product]), [Total Sales]), [Total Sales]) on a card returns:', options: ['3,094,953', '2,937,378', '2,747,792', '1,739,560'], answer: 1, explanation: 'Laptop 1,739,560 + Mobile 1,008,232 + Office Chair 189,586 = 2,937,378.' },
    { question: 'What happens when rows tie at position N?', options: ['TOPN returns an error', 'TOPN picks one at random', 'TOPN returns all tied rows', 'TOPN skips them'], answer: 2, explanation: 'All rows tied at the cutoff are included, so the result can have more than N rows.' },
    { question: 'Which is the simplest way to show only the top 5 products in a bar chart?', options: ['Write a TOPN calculated table', 'Use the Top N filter type in the Filters pane', 'Use a Q&A visual', 'Sort the axis'], answer: 1, explanation: 'The visual-level Top N filter needs no DAX.' },
    { question: 'What is the default sort order in TOPN()?', options: ['ASC', 'DESC', 'By the first column', 'None'], answer: 1, explanation: 'DESC is the default, so the largest values are kept.' },
  ],
};
