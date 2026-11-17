export default {
  id: 'extra-16-concatenatex',
  title: 'CONCATENATEX()',
  module: 'Extra: DAX',
  extraNo: 16,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "CONCATENATEX() loops over a table and joins one text value per row into a single string, with a delimiter and an optional sort order. It is used for dynamic titles, \"selected items\" labels, tooltips and lists such as \"products sold in this city\".",
  objectives: [
    'Write CONCATENATEX() with table, expression, delimiter and sort arguments',
    'Build a dynamic title that lists slicer selections',
    'Combine text and formatted numbers in each item',
    'Make sure the list respects the filters that reach the table you iterate',
  ],
  theory: [
    {
      heading: 'What CONCATENATEX() does',
      content: "CONCATENATEX() is an **iterator that returns text**. For each row of a table it evaluates an expression, converts the result to text, and glues all the pieces together with a delimiter.\n\nAnalogy: a teacher reads the attendance register and writes all present students' names on the board, separated by commas. The register is the table, the name is the expression, and the comma is the delimiter.",
      syntax: 'CONCATENATEX ( <Table>, <Expression> [, <Delimiter>] [, <OrderBy_Expression> [, <Order>]] ... )',
      points: [
        'Table: what to loop over, usually VALUES(column) or a filtered table',
        'Expression: the text for each row, e.g. Product[Product] or Product[Product] & " - " & FORMAT([Total Sales], "#,0")',
        'Delimiter: text placed between items, e.g. ", " or " | "',
        'OrderBy_Expression and Order: how to sort the items (ASC or DESC)',
      ],
    },
    {
      heading: 'Lists that follow slicers',
      content: "`CONCATENATEX(VALUES(Product[Category]), Product[Category], \", \")` lists the categories visible in the current filter context. With a Category slicer, it shows exactly what the user selected; with nothing selected it shows all three.\n\nThis makes it perfect for **dynamic titles**:\n\n`\"Sales for: \" & CONCATENATEX(VALUES(Product[Category]), Product[Category], \", \", Product[Category], ASC)`\n\nIn the visual, open Format > General > Title, click the **fx** button next to Text, choose Format style **Field value** and select the measure.",
      tip: 'When nothing is selected, a long list of all items is not helpful. Use IF(ISFILTERED(Product[Category]), <list>, "All categories").',
    },
    {
      heading: 'Make the right table: filter direction matters',
      content: "Our relationships are single direction: Product → Sales and Customer → Sales. A **City** filter (Customer table) reaches Sales but not Product. So in a City row, `VALUES(Product[Product])` still returns all 6 products.\n\nTo list only products sold in that city, filter the table with a measure:\n\n`FILTER(VALUES(Product[Product]), [Total Sales] > 0)`\n\n[Total Sales] is evaluated for each product with the City filter active, so only products with sales in that city stay.",
    },
    {
      heading: 'Formatting items and sorting',
      content: "The expression can build any text per row:\n- `Customer[Customer] & \" (\" & FORMAT([Total Sales], \"#,0\") & \")\"` gives `Asha Traders (636,464)`\n- Sort by the measure with `[Total Sales], DESC` as 4th and 5th arguments\n\nFor line breaks in tooltips or cards use `UNICHAR(10)` as the delimiter and turn on word wrap in the visual.",
      points: [
        'Without OrderBy arguments the order of items is not guaranteed',
        'Numbers are converted to text automatically, but FORMAT() gives control over thousands separators and decimals',
        'Very long lists can make visuals unreadable; combine with TOPN() or a count',
      ],
    },
    {
      heading: 'CONCATENATEX() vs CONCATENATE() and &',
      content: "- `CONCATENATE(a, b)` joins exactly **two** text values\n- The `&` operator joins any number of values in one row: `Customer[Customer] & \" - \" & Customer[City]`\n- `CONCATENATEX()` joins values **across many rows** of a table\n\nUse CONCATENATEX in measures. In a calculated column you are already in one row, so & is usually enough.",
    },
  ],
  examples: [
    {
      title: 'Products sold in each city',
      scenario: 'The sales team wants a matrix that shows, for each city, which products were sold there.',
      table: {
        headers: ['City', 'Products Sold'],
        rows: [
          ['Mumbai', 'Headphones, Laptop, Mobile, Office Chair'],
          ['Nagpur', 'Headphones, Keyboard, Laptop, Mobile, Office Chair'],
          ['Nashik', 'Headphones, Keyboard, Mobile'],
          ['Pune', 'Headphones, Keyboard, Laptop, Mobile, Office Chair'],
          ['Total', 'Headphones, Keyboard, Laptop, Mobile, Office Chair'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Products Sold (code below).',
        'Insert a Matrix. Rows: Customer[City]. Values: Products Sold.',
        'In Format visual > Values, turn on Text wrap so long lists are readable.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Products Sold =
CONCATENATEX (
    FILTER ( VALUES ( Product[Product] ), [Total Sales] > 0 ),
    Product[Product],
    ", ",
    Product[Product], ASC
)`,
      result: 'Nashik lists only Headphones, Keyboard, Mobile. Desk never appears because it has no sales anywhere.',
      explanation: 'VALUES(Product[Product]) alone would return all 6 products in every city (the City filter cannot reach Product). FILTER keeps products whose [Total Sales] in the current city is above zero.',
    },
    {
      title: 'Dynamic chart title from a slicer',
      scenario: 'A column chart of sales by month should have a title like "Sales for: Accessories, Furniture" depending on the Category slicer.',
      steps: [
        'Insert a Slicer with Product[Category].',
        'Modeling > New measure: Chart Title (code below).',
        'Insert a Clustered column chart: X-axis Sales[Month], Y-axis Total Sales.',
        'Select the chart > Format visual > General > Title > Text: click fx.',
        'Format style: Field value. What field should we base this on: Chart Title. Click OK.',
        'Select Accessories and Furniture in the slicer (Ctrl+click).',
      ],
      code: `Chart Title =
"Sales for: "
    & IF (
        ISFILTERED ( Product[Category] ),
        CONCATENATEX (
            VALUES ( Product[Category] ),
            Product[Category],
            ", ",
            Product[Category], ASC
        ),
        "All categories"
    )`,
      result: 'With Accessories and Furniture selected the title reads "Sales for: Accessories, Furniture". With no selection it reads "Sales for: All categories".',
      explanation: 'VALUES(Product[Category]) returns only the selected categories. ISFILTERED() detects whether the slicer is in use, so the title does not show a long list when everything is visible.',
    },
    {
      title: 'Customers with their sales, best first',
      scenario: 'A tooltip or table cell should list the customers of each segment with their sales, sorted from highest to lowest.',
      table: {
        headers: ['Segment', 'Customer List'],
        rows: [
          ['Corporate', 'Neha Enterprises (1,173,782), Asha Traders (636,464), Sai Furnishers (347,965)'],
          ['Retail', 'Ravi Stores (453,144), Om Electronics (273,868), Kiran Mart (209,730)'],
        ],
      },
      steps: [
        'Modeling > New measure: Customer List (code below).',
        'Insert a Table visual with Customer[Segment] and Customer List.',
        'Turn off totals: Format visual > Visual > Totals > Values off.',
      ],
      code: `Customer List =
CONCATENATEX (
    VALUES ( Customer[Customer] ),
    Customer[Customer] & " (" & FORMAT ( [Total Sales], "#,0" ) & ")",
    ", ",
    [Total Sales], DESC
)`,
      result: 'Each segment shows its 3 customers sorted by sales, with thousands separators.',
      explanation: 'The Segment filter is on the Customer table, so VALUES(Customer[Customer]) returns only that segment\'s customers. [Total Sales] is evaluated per customer for both the label and the sort.',
    },
    {
      title: 'Count and list in one label',
      scenario: 'Build a card label like "3 products: Headphones, Keyboard, Mobile" for the selected city.',
      steps: [
        'Insert a Slicer with Customer[City] and select Nashik.',
        'Modeling > New measure: Product Label (code below).',
        'Insert a Card and add Product Label.',
      ],
      code: `Product Label =
VAR SoldProducts =
    FILTER ( VALUES ( Product[Product] ), [Total Sales] > 0 )
RETURN
    COUNTROWS ( SoldProducts ) & " products: "
        & CONCATENATEX ( SoldProducts, Product[Product], ", ", Product[Product], ASC )`,
      result: 'For Nashik the card shows "3 products: Headphones, Keyboard, Mobile". For Pune it shows "5 products: Headphones, Keyboard, Laptop, Mobile, Office Chair".',
      explanation: 'The filtered table is stored once in a variable and reused for both the count and the list, which keeps the code short and consistent.',
    },
  ],
  interview: [
    { q: 'What is CONCATENATEX() and when do you use it?', a: 'An iterator that evaluates a text expression for each row of a table and joins the results with a delimiter. Used for dynamic titles, selected-item labels, tooltips and lists inside measures.', level: 'Easy' },
    { q: 'Difference between CONCATENATE, & and CONCATENATEX?', a: 'CONCATENATE joins two values; & joins any number of values in one row context; CONCATENATEX joins values across all rows of a table.', level: 'Easy' },
    { q: 'How do you control the order of items in CONCATENATEX?', a: 'Pass OrderBy expressions and directions after the delimiter, e.g. CONCATENATEX(VALUES(Customer[Customer]), Customer[Customer], ", ", [Total Sales], DESC). Without them the order is not guaranteed.', level: 'Medium' },
    { q: 'Scenario: your "products sold per city" measure lists all 6 products in every city. Why and how do you fix it?', a: 'VALUES(Product[Product]) is not filtered by City because the relationship Customer → Sales → Product does not pass filters from Sales up to Product. Use FILTER(VALUES(Product[Product]), [Total Sales] > 0) or iterate a fact column.', level: 'Hard' },
    { q: 'How do you create a dynamic title from a slicer selection?', a: 'Create a measure with CONCATENATEX(VALUES(col), col, ", ") (optionally guarded by ISFILTERED), then in Format > General > Title > Text click fx, choose Field value and select the measure.', level: 'Medium' },
    { q: 'How can you put each item on a new line?', a: 'Use UNICHAR(10) as the delimiter and enable word wrap in the visual (cards, tables and tooltips support it).', level: 'Medium' },
    { q: 'What are performance concerns with CONCATENATEX?', a: 'Iterating a large table and building long strings is costly and unreadable. Limit the table (VALUES of a dimension, TOPN, FILTER) and avoid running it for thousands of matrix cells.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'List the cities of the Retail segment in alphabetical order.',
      hint: 'Use a Segment slicer or a matrix with Segment on rows and VALUES(Customer[City]).',
      solution: 'City List = CONCATENATEX(VALUES(Customer[City]), Customer[City], ", ", Customer[City], ASC). Retail: Mumbai, Nashik, Pune. Corporate: Mumbai, Nagpur, Pune.',
    },
    {
      task: 'For each product, list the customers who bought it.',
      hint: 'FILTER(VALUES(Customer[Customer]), [Total Sales] > 0) inside CONCATENATEX.',
      solution: 'Buyers = CONCATENATEX(FILTER(VALUES(Customer[Customer]), [Total Sales] > 0), Customer[Customer], ", ", Customer[Customer], ASC). Laptop: Asha Traders, Neha Enterprises, Ravi Stores, Sai Furnishers.',
    },
    {
      task: 'Create a label that shows the products of the selected category separated by " | ".',
      hint: 'The Category filter reaches Product directly.',
      solution: 'Category Products = CONCATENATEX(VALUES(Product[Product]), Product[Product], " | ", Product[Product], ASC). Furniture: Desk | Office Chair.',
    },
    {
      task: 'Try this in the DAX Lab: list products with their quantity sold, highest quantity first.',
      hint: 'Create Total Qty = SUM(Sales[Quantity]) and use it in the expression and the sort.',
      solution: 'Qty List = CONCATENATEX(FILTER(VALUES(Product[Product]), [Total Qty] > 0), Product[Product] & ": " & [Total Qty], ", ", [Total Qty], DESC). Total: Mobile: 56, Headphones: 44, Laptop: 33, Keyboard: 30, Office Chair: 22.',
    },
  ],
  quiz: [
    { question: 'What does CONCATENATEX() return?', options: ['A table', 'A single text value', 'A number', 'A list of columns'], answer: 1, explanation: 'It joins row values into one string.' },
    { question: 'Which argument sets the text between items?', options: ['The first', 'The second', 'The third (delimiter)', 'The fifth'], answer: 2, explanation: 'The third argument is the delimiter, e.g. ", ".' },
    { question: 'With Furniture selected in a slicer, CONCATENATEX(VALUES(Product[Product]), Product[Product], ", ", Product[Product], ASC) returns:', options: ['Office Chair', 'Desk, Office Chair', 'Office Chair, Desk', 'All six products'], answer: 1, explanation: 'Furniture contains Desk and Office Chair; ASC sorts them alphabetically.' },
    { question: 'In a City row, why might VALUES(Product[Product]) list all products?', options: ['CONCATENATEX ignores filters', 'The City filter does not flow from Sales to Product with single-direction relationships', 'Product is a fact table', 'Cities are not related to Sales'], answer: 1, explanation: 'Filters flow from the one side to the many side only, so Product is not filtered by City.' },
    { question: 'Where do you apply a measure as a dynamic visual title?', options: ['Modeling > New table', 'Format > General > Title > Text > fx', 'View > Themes', 'Transform data'], answer: 1, explanation: 'The fx (conditional formatting) button on the Title text lets you pick a field value measure.' },
  ],
};
