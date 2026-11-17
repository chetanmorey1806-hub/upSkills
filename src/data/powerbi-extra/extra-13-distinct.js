export default {
  id: 'extra-13-distinct',
  title: 'DISTINCT()',
  module: 'Extra: DAX',
  extraNo: 13,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "DISTINCT() returns the unique values of a column (or the unique rows of a table) in the current filter context, without the extra blank row that VALUES() can add. It is used to count, list and iterate unique items such as customers, cities or products.",
  objectives: [
    'Use DISTINCT(column) to get a unique list of visible values',
    'Count unique items with COUNTROWS(DISTINCT(...)) and relate it to DISTINCTCOUNT()',
    'Explain exactly when DISTINCT() and VALUES() give different results',
    'Use DISTINCT() as the table argument of FILTER(), AVERAGEX() and CONCATENATEX()',
  ],
  theory: [
    {
      heading: 'What DISTINCT() does',
      content: "DISTINCT() is a **table function**. Give it a column and it returns a one-column table with each value only once, considering only the rows visible in the current filter context.\n\nAnalogy: the Sales table is a register with 60 bills. Many bills belong to the same customer. `DISTINCT(Sales[CustomerID])` is like reading the register and writing each customer ID on a sheet **only the first time you see it**.\n\nBecause the result is a table, you wrap it:\n- `COUNTROWS(DISTINCT(Sales[CustomerID]))` gives the number of buying customers\n- `CONCATENATEX(DISTINCT(Customer[City]), Customer[City], \", \")` lists cities",
      syntax: `DISTINCT ( <ColumnName> )
DISTINCT ( <Table> )`,
      points: [
        'DISTINCT(column): unique values of the column, blank row of a broken relationship is NOT added',
        'DISTINCT(table): unique rows of a table (duplicate rows removed)',
        'The result respects all filters that reach that column',
      ],
    },
    {
      heading: 'DISTINCT() vs VALUES(): the blank row',
      content: "When Sales contains a ProductID that is missing in the Product table, the model cannot match those rows. Power BI keeps those sales by adding a **virtual blank row** to Product. In a visual you see a row called **(Blank)**.\n\n- `VALUES(Product[Category])` returns Accessories, Electronics, Furniture **and** blank (4 rows)\n- `DISTINCT(Product[Category])` returns only Accessories, Electronics, Furniture (3 rows)\n\nIf the column itself contains real blank cells, **both** functions return the blank value. The difference is only about the *virtual* row created by unmatched keys.\n\nIn our clean practice model every ProductID and CustomerID in Sales exists in its dimension, so both functions give the same result. That is normal; the difference shows up in messy real-world data.",
      tip: 'If a (Blank) row appears in a slicer or matrix, check for fact keys that do not exist in the dimension. Fixing the data is better than hiding it.',
    },
    {
      heading: 'DISTINCT(table) vs VALUES(table)',
      content: "With a **table** argument the two functions behave differently:\n\n- `VALUES(Sales)` returns all visible rows of Sales, duplicates included, plus the blank row if needed\n- `DISTINCT(Sales)` removes rows that are completely identical in every column\n\nIn practice DISTINCT(table) is used mostly on calculated tables or on table expressions that may contain duplicate rows.",
    },
    {
      heading: 'COUNTROWS(DISTINCT()) and DISTINCTCOUNT()',
      content: "`DISTINCTCOUNT(Sales[CustomerID])` is the simple, optimized way to count unique values. `COUNTROWS(DISTINCT(Sales[CustomerID]))` gives the same number on a fact column without blanks.\n\nWhen to prefer the DISTINCT() form:\n1. When you need to **filter** the unique list first: `COUNTROWS(FILTER(DISTINCT(Customer[Customer]), [Total Sales] > 500000))`\n2. When you need to **iterate**: `AVERAGEX(DISTINCT(Sales[CustomerID]), ...)`\n3. When you want to **ignore** the virtual blank row on a dimension column",
      points: [
        'DISTINCTCOUNT() counts a blank value as one item',
        'DISTINCTCOUNTNOBLANK() ignores blank values',
        'COUNTROWS(DISTINCT(dimension column)) ignores the virtual blank row',
      ],
    },
    {
      heading: 'Where the filter comes from matters',
      content: "DISTINCT() reads whatever the filter context allows. In our model, relationships are single direction (Product → Sales, Customer → Sales).\n\n- `DISTINCT(Sales[CustomerID])` on a **Product** row returns only customers who bought that product, because Product filters Sales\n- `DISTINCT(Customer[Customer])` on a **Product** row returns all 6 customers, because the Product filter does not travel from Sales up to Customer\n\nTo use the dimension column but keep only customers with sales, filter it: `FILTER(DISTINCT(Customer[Customer]), [Total Sales] > 0)`. The measure is evaluated per customer with the Product filter still active.",
    },
  ],
  examples: [
    {
      title: 'Number of buying customers per product',
      scenario: 'The product team wants to know how many different customers bought each product.',
      table: {
        headers: ['Product', 'Total Sales', 'Customers Buying'],
        rows: [
          ['Headphones', '110,938', '6'],
          ['Keyboard', '46,637', '4'],
          ['Laptop', '1,739,560', '4'],
          ['Mobile', '1,008,232', '6'],
          ['Office Chair', '189,586', '4'],
          ['Total', '3,094,953', '6'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Customers Buying = COUNTROWS(DISTINCT(Sales[CustomerID])).',
        'Insert a Matrix. Rows: Product[Product]. Values: Total Sales, Customers Buying.',
        'Notice Desk is not shown, because both measures are blank for it.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Customers Buying = COUNTROWS ( DISTINCT ( Sales[CustomerID] ) )`,
      result: 'Mobile and Headphones were bought by all 6 customers, Laptop by 4. The Total row shows 6, not 24, because each customer is counted once.',
      explanation: 'The Product filter reaches Sales, so DISTINCT(Sales[CustomerID]) lists only the customers on that product\'s order lines. Totals are not added up; they are recalculated over all visible rows.',
    },
    {
      title: 'See the difference: VALUES() vs DISTINCT() with a bad key',
      scenario: 'A new order arrives with ProductID 99, which does not exist in the Product table. We want to see how VALUES() and DISTINCT() react.',
      table: {
        headers: ['Category', 'Total Sales', 'Cat VALUES', 'Cat DISTINCT'],
        rows: [
          ['(Blank)', '5,000', '1', '(blank)'],
          ['Accessories', '157,575', '1', '1'],
          ['Electronics', '2,747,792', '1', '1'],
          ['Furniture', '189,586', '1', '1'],
          ['Total', '3,099,953', '4', '3'],
        ],
      },
      steps: [
        'Extra step for this demo only: open the Sales CSV in Excel and add a row: OrderID 1061, OrderDate 2024-12-30, Year 2024, Month 12, CustomerID 101, ProductID 99, Quantity 1, UnitPrice 5000, SalesAmount 5000, Cost 3000. Save it.',
        'In Power BI Desktop click Home > Refresh.',
        'Modeling > New measure: Cat VALUES = COUNTROWS(VALUES(Product[Category])).',
        'Modeling > New measure: Cat DISTINCT = COUNTROWS(DISTINCT(Product[Category])).',
        'Insert a Matrix. Rows: Product[Category]. Values: Total Sales, Cat VALUES, Cat DISTINCT.',
        'After the demo, delete the extra row from the CSV and refresh again.',
      ],
      code: `Cat VALUES = COUNTROWS ( VALUES ( Product[Category] ) )

Cat DISTINCT = COUNTROWS ( DISTINCT ( Product[Category] ) )`,
      result: 'A (Blank) row appears with 5,000. VALUES() counts the blank row (Total = 4); DISTINCT() ignores it (Total = 3, and blank on the (Blank) row).',
      explanation: 'ProductID 99 has no match, so Power BI adds a virtual blank row to Product. VALUES() includes that row, DISTINCT() does not. This is the only difference between the two for a column.',
    },
    {
      title: 'Average sales per active customer by category',
      scenario: 'Find how much an average buying customer spends in each category.',
      table: {
        headers: ['Category', 'Total Sales', 'Active Customers', 'Sales per Active Customer'],
        rows: [
          ['Accessories', '157,575', '6', '26,262.50'],
          ['Electronics', '2,747,792', '6', '457,965.33'],
          ['Furniture', '189,586', '4', '47,396.50'],
          ['Total', '3,094,953', '6', '515,825.50'],
        ],
      },
      steps: [
        'Modeling > New measure: Active Customers = COUNTROWS(DISTINCT(Sales[CustomerID])).',
        'Modeling > New measure: Sales per Active Customer = DIVIDE([Total Sales], [Active Customers]).',
        'Insert a Matrix. Rows: Product[Category]. Values: Total Sales, Active Customers, Sales per Active Customer.',
        'Set the format of Sales per Active Customer to 2 decimal places (Measure tools > Format).',
      ],
      code: `Active Customers = COUNTROWS ( DISTINCT ( Sales[CustomerID] ) )

Sales per Active Customer =
DIVIDE ( [Total Sales], [Active Customers] )`,
      result: 'Furniture has only 4 buying customers, so its per-customer value is 189,586 / 4 = 47,396.50.',
      explanation: 'DISTINCT() over the fact column counts only customers who actually bought in the category. DIVIDE() avoids errors if a category had no customers.',
    },
    {
      title: 'List the cities where each product sells',
      scenario: 'Show, next to each product, the cities in which it was sold, using the Customer dimension column.',
      table: {
        headers: ['Product', 'Cities Served'],
        rows: [
          ['Headphones', 'Mumbai, Nagpur, Nashik, Pune'],
          ['Keyboard', 'Nagpur, Nashik, Pune'],
          ['Laptop', 'Mumbai, Nagpur, Pune'],
          ['Mobile', 'Mumbai, Nagpur, Nashik, Pune'],
          ['Office Chair', 'Mumbai, Nagpur, Pune'],
        ],
      },
      steps: [
        'Modeling > New measure (code below).',
        'Insert a Table visual. Add Product[Product] and the Cities Served measure.',
        'Remove the Total row: Format visual > Visual > Totals > Off (the total would list all 4 cities).',
      ],
      code: `Cities Served =
CONCATENATEX (
    FILTER ( DISTINCT ( Customer[City] ), [Total Sales] > 0 ),
    Customer[City],
    ", ",
    Customer[City], ASC
)`,
      result: 'Keyboard was never sold in Mumbai, and Laptop never in Nashik, so those cities are missing from their lists.',
      explanation: 'On a Product row, DISTINCT(Customer[City]) alone would list all 4 cities, because the Product filter cannot reach Customer. FILTER keeps only cities where [Total Sales] for the current product is above zero.',
    },
  ],
  interview: [
    { q: 'What is the difference between DISTINCT(column) and VALUES(column)?', a: 'Both return the unique visible values. VALUES() also returns the virtual blank row that appears when the fact table has keys missing from the dimension; DISTINCT() does not.', level: 'Easy' },
    { q: 'What is the difference between DISTINCT(table) and VALUES(table)?', a: 'DISTINCT(table) removes duplicate rows; VALUES(table) returns all visible rows including duplicates (and the blank row if one exists).', level: 'Medium' },
    { q: 'Does DISTINCT() ignore real blank values stored in a column?', a: 'No. A real blank stored in the column is a value and is returned by both DISTINCT() and VALUES(). DISTINCT() only skips the virtual blank row created by unmatched relationship keys.', level: 'Medium' },
    { q: 'DISTINCTCOUNT() or COUNTROWS(DISTINCT())? Which do you use?', a: 'For a plain count, DISTINCTCOUNT() is simpler and well optimized. Use COUNTROWS(DISTINCT()) or COUNTROWS(FILTER(DISTINCT(), ...)) when the list must be filtered or when you need to drop the virtual blank row.', level: 'Medium' },
    { q: 'Scenario: a slicer on Product[Category] shows a "(Blank)" item. What is happening and how do you fix it?', a: 'Some Sales rows have ProductIDs that do not exist in Product, so the engine adds a blank row. Fix it in data: add the missing products, map bad IDs in Power Query, or use an "Unknown" member. DISTINCT() can hide it in a measure, but the slicer will still show it.', level: 'Hard' },
    { q: 'Why does COUNTROWS(DISTINCT(Customer[Customer])) return 6 on every Product row?', a: 'Because the relationship Customer → Sales is single direction. The Product filter reaches Sales but not Customer. Use DISTINCT(Sales[CustomerID]) or filter the customer list with [Total Sales] > 0.', level: 'Hard' },
    { q: 'Can DISTINCT() be used in a calculated table?', a: 'Yes. For example Modeling > New table: City List = DISTINCT(Customer[City]) creates a one-column table of unique cities.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Count the distinct products bought by each customer.',
      hint: 'COUNTROWS(DISTINCT(Sales[ProductID])) with Customer[Customer] on rows.',
      solution: 'Products Bought = COUNTROWS(DISTINCT(Sales[ProductID])). For example Asha Traders bought 5 different products; the Total row shows 5 because Desk was never sold.',
    },
    {
      task: 'Create a calculated table with the unique segments.',
      hint: 'Modeling > New table.',
      solution: 'Segment List = DISTINCT(Customer[Segment]). It returns 2 rows: Corporate and Retail.',
    },
    {
      task: 'Count cities with sales above 8 lakh (800,000).',
      hint: 'COUNTROWS(FILTER(DISTINCT(Customer[City]), [Total Sales] > 800000)).',
      solution: 'Returns 3 on the card: Nagpur (1,173,782), Pune (910,332) and Mumbai (801,109). Nashik (209,730) is excluded.',
    },
    {
      task: 'Try this in the DAX Lab: compare DISTINCTCOUNT(Sales[CustomerID]) with COUNTROWS(DISTINCT(Sales[CustomerID])) by Category.',
      hint: 'They should match because Sales[CustomerID] has no blanks.',
      solution: 'Both return Accessories 6, Electronics 6, Furniture 4, Total 6.',
    },
  ],
  quiz: [
    { question: 'DISTINCT(Sales[CustomerID]) returns:', options: ['The number of customers', 'A table of unique customer IDs visible in the current context', 'All 60 customer IDs including repeats', 'The first customer ID'], answer: 1, explanation: 'DISTINCT() is a table function that returns each visible value once.' },
    { question: 'When does DISTINCT(Product[Category]) differ from VALUES(Product[Category])?', options: ['Never', 'When a slicer is used', 'When Sales has ProductIDs that are missing in Product', 'When the column is text'], answer: 2, explanation: 'Unmatched keys create a virtual blank row; VALUES() returns it, DISTINCT() does not.' },
    { question: 'On the Furniture row, COUNTROWS(DISTINCT(Sales[CustomerID])) returns 4. What does the Total row return?', options: ['16', '6', '4', '3'], answer: 1, explanation: 'Totals are recalculated: across all sales there are 6 distinct customers.' },
    { question: 'Which function removes duplicate rows from a table expression?', options: ['VALUES(table)', 'DISTINCT(table)', 'ALL(column)', 'RELATEDTABLE(table)'], answer: 1, explanation: 'DISTINCT(table) returns unique rows; VALUES(table) keeps duplicates.' },
    { question: 'On a Product row, why does DISTINCT(Customer[City]) list all 4 cities?', options: ['DISTINCT ignores filters', 'The Product filter does not flow from Sales to Customer with single-direction relationships', 'Cities are text', 'The Date table is missing'], answer: 1, explanation: 'Filters flow from one side to many side only. Customer is not filtered by Product, so all cities are visible.' },
  ],
};
