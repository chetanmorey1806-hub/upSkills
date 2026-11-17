export default {
  id: 'extra-12-values',
  title: 'VALUES()',
  module: 'Extra: DAX',
  extraNo: 12,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "VALUES() returns the list of unique values (or rows) that are visible in the current filter context. It is the building block for counting what is visible, reading the single selected value of a slicer, and iterating over a dimension inside measures.",
  objectives: [
    'Explain what VALUES() returns for a column and for a table',
    'Count visible items with COUNTROWS(VALUES(...)) and compare it with DISTINCTCOUNT()',
    'Read a single selected value safely with IF(HASONEVALUE(...), VALUES(...))',
    'Use VALUES() as the table argument of iterators such as AVERAGEX() and FILTER()',
    'Understand the extra blank row that VALUES() can return',
  ],
  theory: [
    {
      heading: 'What VALUES() does',
      content: "VALUES() is a **table function**. It does not return a number; it returns a one-column table of the unique values of a column that are visible **right now**, in the current filter context.\n\nThink of a shop shelf with a curtain. The filter context (slicers, matrix rows, filters pane) decides which part of the shelf is visible. VALUES() is like asking: \"Which different products can I see on the shelf at this moment?\"\n\nBecause it returns a table, you normally wrap it inside another function:\n- `COUNTROWS(VALUES(Product[Category]))` counts the visible categories\n- `CONCATENATEX(VALUES(Product[Product]), Product[Product], \", \")` lists them as text\n- `AVERAGEX(VALUES(Customer[Customer]), [Total Sales])` loops over them",
      syntax: 'VALUES ( <TableNameOrColumnName> )',
      points: [
        'VALUES(column) returns the distinct values of that column in the current filter context',
        'VALUES(table) returns the visible rows of the table (duplicates are kept)',
        'If a filter selects only one value, VALUES() returns a 1x1 table that DAX can convert to a scalar',
      ],
    },
    {
      heading: 'Filter context decides the result',
      content: "In our shared model, `Product` has 6 products in 3 categories. Put `Product[Category]` on matrix rows and add the measure `Products in List = COUNTROWS(VALUES(Product[Product]))`:\n\n- On the **Electronics** row only Laptop and Mobile are visible, so the result is 2\n- On the **Total** row nothing is filtered, so the result is 6\n\nRemember that filters only flow from the **one** side to the **many** side (Product → Sales). So `VALUES(Product[Product])` placed in a **City** row still returns all 6 products, because City is in the Customer table and its filter does not travel through Sales back to Product. To get products sold in a city, use `VALUES(Sales[ProductID])` or filter with a measure (shown in the examples).",
      tip: 'When a result looks \"wrong\", ask yourself: which filters can actually reach this column through the relationships?',
    },
    {
      heading: 'VALUES() as a scalar: the single selected value',
      content: "If exactly one value is visible, VALUES() returns a table with one row and one column. DAX automatically converts such a table into a single value, so `VALUES(Product[Category])` can be used like text.\n\nIf **more than one** value is visible, the same expression fails with the error *\"A table of multiple values was supplied where a single value was expected\"*. That is why you always guard it:\n\n`IF(HASONEVALUE(Product[Category]), VALUES(Product[Category]), \"All categories\")`\n\nThe modern short form is `SELECTEDVALUE(Product[Category], \"All categories\")`, which does exactly this check for you.",
      syntax: 'IF ( HASONEVALUE ( <column> ), VALUES ( <column> ), <alternate> )',
    },
    {
      heading: 'VALUES() inside iterators',
      content: "Iterators such as SUMX, AVERAGEX, MAXX and FILTER need a table to loop over. VALUES() gives them the **visible list of a dimension**, which is perfect for \"per customer\" or \"per product\" logic.\n\nExample: `Avg Sales per Customer = AVERAGEX(VALUES(Customer[Customer]), [Total Sales])`\n\n1. VALUES() returns the customers visible in the current cell\n2. For each customer, `[Total Sales]` is calculated (context transition turns the customer row into a filter)\n3. AVERAGEX averages those customer totals\n\nThis is different from `AVERAGE(Sales[SalesAmount])`, which averages individual order lines.",
    },
    {
      heading: 'The blank row and VALUES() vs DISTINCT()',
      content: "If the fact table contains a key that does not exist in the dimension (for example a Sales row with ProductID 99 when Product has only 1 to 6), Power BI adds a hidden **blank row** to the dimension so those sales are not lost. In visuals it appears as **(Blank)**.\n\n- `VALUES(Product[Category])` **includes** that blank row\n- `DISTINCT(Product[Category])` **does not** include it\n\nIn a clean model (like our practice model, where every Sales ProductID exists in Product) both return the same result. The DISTINCT() topic covers this difference in depth.",
      points: [
        'VALUES() = visible unique values + blank row (if the relationship has unmatched keys)',
        'DISTINCTCOUNT(column) counts a blank value as well; COUNTROWS(DISTINCT()) does not count the blank row',
      ],
    },
  ],
  examples: [
    {
      title: 'Products in the catalog vs products actually sold',
      scenario: 'The sales manager wants to know, for each category, how many products exist in the Product list and how many of them have at least one sale.',
      table: {
        headers: ['Category', 'Products in List', 'Products Sold'],
        rows: [
          ['Accessories', '2', '2'],
          ['Electronics', '2', '2'],
          ['Furniture', '2', '1'],
          ['Total', '6', '5'],
        ],
      },
      steps: [
        'Open the practice model in Power BI Desktop (or open the DAX Lab).',
        'Select the Sales table in the Data pane, then Modeling > New measure and create: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Products in List = COUNTROWS(VALUES(Product[Product])).',
        'Modeling > New measure: Products Sold = COUNTROWS(VALUES(Sales[ProductID])).',
        'Insert a Matrix visual. Drag Product[Category] to Rows and both new measures to Values.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Products in List = COUNTROWS(VALUES(Product[Product]))

Products Sold = COUNTROWS(VALUES(Sales[ProductID]))`,
      result: 'Furniture shows 2 products in the list but only 1 sold, because Desk has no sales. The total row shows 6 vs 5.',
      explanation: 'VALUES(Product[Product]) reads the dimension, so it lists every product in the category. VALUES(Sales[ProductID]) reads the fact table, so only products that appear in at least one sale are returned.',
    },
    {
      title: 'Show the selected category in a card',
      scenario: 'A report has a Category slicer. A card should show the chosen category name, or "All categories" when zero or several are selected.',
      steps: [
        'Insert a Slicer and drag Product[Category] into it.',
        'Modeling > New measure: Selected Category = IF(HASONEVALUE(Product[Category]), VALUES(Product[Category]), "All categories").',
        'Insert a Card visual and drag Selected Category into Fields.',
        'Click Electronics in the slicer, then Ctrl+click Furniture, then clear the slicer, and watch the card.',
      ],
      code: `Selected Category =
IF (
    HASONEVALUE ( Product[Category] ),
    VALUES ( Product[Category] ),
    "All categories"
)`,
      result: 'Only Electronics selected: card shows "Electronics". Electronics + Furniture selected: "All categories". Nothing selected: "All categories".',
      explanation: 'HASONEVALUE() returns TRUE only when exactly one category is visible. In that case VALUES() returns a single-row table that DAX converts to text. Without the guard, selecting two categories would raise the "table of multiple values" error.',
    },
    {
      title: 'Average sales per customer by city',
      scenario: 'Management wants the average sales of one customer in each city, not the average order line.',
      table: {
        headers: ['City', 'Total Sales', 'Customers', 'Avg Sales per Customer'],
        rows: [
          ['Mumbai', '801,109', '2', '400,554.50'],
          ['Nagpur', '1,173,782', '1', '1,173,782.00'],
          ['Nashik', '209,730', '1', '209,730.00'],
          ['Pune', '910,332', '2', '455,166.00'],
          ['Total', '3,094,953', '6', '515,825.50'],
        ],
      },
      steps: [
        'Make sure Total Sales exists (Example 1).',
        'Modeling > New measure: Customers = COUNTROWS(VALUES(Customer[Customer])).',
        'Modeling > New measure: Avg Sales per Customer = AVERAGEX(VALUES(Customer[Customer]), [Total Sales]).',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, Customers, Avg Sales per Customer.',
        'Select the Avg Sales per Customer measure and set Measure tools > Format to Decimal number with 2 decimals.',
      ],
      code: `Customers = COUNTROWS ( VALUES ( Customer[Customer] ) )

Avg Sales per Customer =
AVERAGEX (
    VALUES ( Customer[Customer] ),
    [Total Sales]
)`,
      result: 'Pune has Asha Traders (636,464) and Om Electronics (273,868), so the average is 455,166. The grand total is 3,094,953 / 6 = 515,825.50.',
      explanation: 'VALUES(Customer[Customer]) gives the customers visible in each city. AVERAGEX calculates [Total Sales] once per customer (context transition) and averages those totals.',
    },
    {
      title: 'Count big customers with FILTER(VALUES())',
      scenario: 'Count customers whose total sales are above 5 lakh (500,000), split by segment.',
      table: {
        headers: ['Segment', 'Total Sales', 'Big Customers'],
        rows: [
          ['Corporate', '2,158,211', '2'],
          ['Retail', '936,742', '(blank)'],
          ['Total', '3,094,953', '2'],
        ],
      },
      steps: [
        'Modeling > New measure: Big Customers = COUNTROWS(FILTER(VALUES(Customer[Customer]), [Total Sales] > 500000)).',
        'Insert a Matrix. Rows: Customer[Segment]. Values: Total Sales, Big Customers.',
        'Optional: wrap the formula in COALESCE(..., 0) to show 0 instead of blank for Retail.',
      ],
      code: `Big Customers =
COUNTROWS (
    FILTER (
        VALUES ( Customer[Customer] ),
        [Total Sales] > 500000
    )
)`,
      result: 'Corporate shows 2 (Neha Enterprises 1,173,782 and Asha Traders 636,464). Retail has no customer above 500,000, so the cell is blank.',
      explanation: 'VALUES() supplies the visible customers, FILTER() keeps only those whose own total passes the test, and COUNTROWS() counts what is left. COUNTROWS of an empty table returns BLANK, not 0.',
    },
  ],
  interview: [
    { q: 'What does VALUES() return?', a: 'A table: the distinct values of a column (or the visible rows of a table) in the current filter context. If the relationship has unmatched keys, it also includes the blank row.', level: 'Easy' },
    { q: 'What is the difference between VALUES() and DISTINCT()?', a: 'Both return distinct visible values. VALUES() includes the virtual blank row created by a referential-integrity violation (fact keys missing in the dimension); DISTINCT() does not. With a table argument, VALUES(table) keeps duplicate rows and the blank row, DISTINCT(table) removes duplicate rows.', level: 'Medium' },
    { q: 'Why does a measure that uses VALUES(Product[Category]) as text sometimes fail with "A table of multiple values was supplied"?', a: 'Because more than one category is visible (for example on the Total row or with a multi-select slicer). VALUES() then returns several rows, which cannot be converted to one value. Guard it with HASONEVALUE() or use SELECTEDVALUE().', level: 'Medium' },
    { q: 'COUNTROWS(VALUES(Sales[CustomerID])) vs DISTINCTCOUNT(Sales[CustomerID]): any difference?', a: 'Usually the same number. DISTINCTCOUNT counts a BLANK value if the column contains one; COUNTROWS(VALUES()) also counts it. COUNTROWS(DISTINCT()) on a dimension column ignores the virtual blank row. DISTINCTCOUNT is the clearer choice for a simple count.', level: 'Medium' },
    { q: 'Scenario: a matrix with Customer[City] on rows shows 6 in every row for COUNTROWS(VALUES(Product[Product])). Why?', a: 'The City filter is on the Customer table. With single-direction relationships it reaches Sales but not Product, so Product is unfiltered and all 6 products are visible. Use VALUES(Sales[ProductID]), FILTER(VALUES(Product[Product]), [Total Sales] > 0), or CROSSFILTER to make the filter reach Product.', level: 'Hard' },
    { q: 'Why use VALUES() as the table in AVERAGEX instead of the whole Sales table?', a: 'AVERAGEX(VALUES(Customer[Customer]), [Total Sales]) averages per customer totals. AVERAGEX(Sales, Sales[SalesAmount]) averages individual order lines. The grain of the table you iterate decides what you average.', level: 'Medium' },
    { q: 'Can VALUES() be used as a filter argument in CALCULATE?', a: 'Yes. Any table can be a filter. For example CALCULATE([Total Sales], VALUES(Product[Category])) inside an iterator restores the currently visible categories, which is a common pattern to keep an outer selection when other filters are removed.', level: 'Hard' },
    { q: 'What is SELECTEDVALUE() and how is it related to VALUES()?', a: 'SELECTEDVALUE(col, alt) is shorthand for IF(HASONEVALUE(col), VALUES(col), alt). It returns the single visible value or the alternate result.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a measure that counts how many cities are visible, and put it in a matrix by Segment.',
      hint: 'Use COUNTROWS(VALUES(Customer[City])).',
      solution: 'Cities = COUNTROWS(VALUES(Customer[City])). Corporate shows 3 (Pune, Nagpur, Mumbai), Retail shows 3 (Mumbai, Pune, Nashik), Total shows 4.',
    },
    {
      task: 'Build a card that shows the selected city, or "Several cities" when more than one is selected.',
      hint: 'Combine IF, HASONEVALUE and VALUES on Customer[City].',
      solution: 'Selected City = IF(HASONEVALUE(Customer[City]), VALUES(Customer[City]), "Several cities"). SELECTEDVALUE(Customer[City], "Several cities") gives the same result.',
    },
    {
      task: 'Calculate the highest single-customer sales in each city (Maximum of customer totals).',
      hint: 'MAXX over VALUES(Customer[Customer]).',
      solution: 'Top Customer Sales = MAXX(VALUES(Customer[Customer]), [Total Sales]). Pune shows 636,464 (Asha Traders), Mumbai 453,144 (Ravi Stores), Total 1,173,782.',
    },
    {
      task: 'In a matrix with Product[Category] on rows, count products that have sales above 1,00,000 (100,000).',
      hint: 'COUNTROWS(FILTER(VALUES(Product[Product]), [Total Sales] > 100000)).',
      solution: 'Electronics 2 (Laptop, Mobile), Accessories 1 (Headphones 110,938), Furniture 1 (Office Chair 189,586), Total 4.',
    },
    {
      task: 'Try this in the DAX Lab: compare COUNTROWS(VALUES(Sales[ProductID])) and DISTINCTCOUNT(Sales[ProductID]) by City.',
      hint: 'Both read the fact table, which is filtered by City.',
      solution: 'Both return Mumbai 4, Nagpur 5, Nashik 3, Pune 5, Total 5. They match because Sales has no blank ProductID.',
    },
  ],
  quiz: [
    { question: 'What type of result does VALUES(Product[Category]) return?', options: ['A number', 'A table of distinct visible values', 'A text string joined by commas', 'A Boolean'], answer: 1, explanation: 'VALUES() is a table function that returns the distinct values visible in the current filter context.' },
    { question: 'In a matrix row for Furniture, what does COUNTROWS(VALUES(Product[Product])) return in the practice model?', options: ['1', '2', '5', '6'], answer: 1, explanation: 'Furniture has two products in the Product table: Office Chair and Desk.' },
    { question: 'Which expression safely returns the single selected category?', options: ['VALUES(Product[Category])', 'IF(HASONEVALUE(Product[Category]), VALUES(Product[Category]), "All")', 'COUNTROWS(Product[Category])', 'DISTINCT(Product)'], answer: 1, explanation: 'HASONEVALUE() checks that only one value is visible before VALUES() is converted to a scalar.' },
    { question: 'What does VALUES() include that DISTINCT() does not?', options: ['Duplicate values of a column', 'Hidden columns', 'The blank row created by unmatched keys in a relationship', 'Filtered-out values'], answer: 2, explanation: 'When fact keys have no match in the dimension, VALUES() returns the extra blank row; DISTINCT() ignores it.' },
    { question: 'AVERAGEX(VALUES(Customer[Customer]), [Total Sales]) on the Total row returns 515,825.50. Why?', options: ['It averages all 60 order lines', 'It divides total sales (3,094,953) by 6 customers', 'It averages the 4 cities', 'It is the median order'], answer: 1, explanation: 'It iterates the 6 visible customers, computes each customer total and averages them: 3,094,953 / 6.' },
  ],
};
