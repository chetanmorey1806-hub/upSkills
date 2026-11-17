export default {
  id: 'extra-20-crossfilter',
  title: 'CROSSFILTER()',
  module: 'Extra: DAX',
  extraNo: 20,
  level: 'Advanced',
  duration: '1.5 hours',
  summary: "CROSSFILTER() changes the filter direction of an existing relationship for one calculation: make it Both (bi-directional), OneWay, or None (switch it off). It lets you answer questions like \"how many products were sold in this city\" without making the relationship bi-directional for the whole model.",
  objectives: [
    'Explain single vs both cross filter direction using the practice star schema',
    'Use CROSSFILTER(..., Both) inside CALCULATE to let a filter travel from the fact to a dimension',
    'Use CROSSFILTER(..., None) to ignore a relationship temporarily',
    'Decide between CROSSFILTER in a measure and changing the relationship setting in Model view',
  ],
  theory: [
    {
      heading: 'Filter direction in our model',
      content: "All relationships in the practice model are **one-to-many, single direction**:\n- Product → Sales\n- Customer → Sales\n- Date → Sales\n\nA filter on a dimension flows **down** to Sales (the arrow in Model view points to Sales). It does **not** flow back up. So a City filter (Customer) reaches Sales, but it stops there; it never reaches Product.\n\nAnalogy: water flows downhill from the dimension tanks into the Sales tank. With single direction there is no pump to push it from Sales up into the Product tank. CROSSFILTER(..., Both) is that pump, switched on only for one measure.",
    },
    {
      heading: 'Syntax',
      content: "CROSSFILTER() is a filter modifier used inside CALCULATE (or CALCULATETABLE). It does not return a value by itself.",
      syntax: `CALCULATE (
    <expression>,
    CROSSFILTER ( <columnName1>, <columnName2>, <direction> )
)`,
      points: [
        'columnName1 and columnName2: the two columns of an existing relationship, usually many side first: Sales[ProductID], Product[ProductID]',
        'Both: filters flow in both directions',
        'OneWay: filters flow from the one side to the many side (the normal setting)',
        'None: no filter flows through this relationship',
        'OneWay_LeftFiltersRight / OneWay_RightFiltersLeft: one direction, chosen by column order',
      ],
    },
    {
      heading: 'Why not set the relationship to Both permanently?',
      content: "In Model view you can double-click a relationship and set **Cross filter direction: Both**. It works, but it affects every visual and measure:\n\n- Slicers start filtering each other in unexpected ways (picking a city hides products in a product slicer)\n- Ambiguous paths can appear when several tables are bi-directional, and Power BI may refuse or silently deactivate relationships\n- Performance can drop because more filters propagate\n\nUsing CROSSFILTER() inside one measure gives bi-directional behaviour **only where you need it**. This is the recommended practice.",
      tip: 'Keep relationships single direction in the model and use CROSSFILTER(..., Both) inside the few measures that need it.',
    },
    {
      heading: 'Alternatives that avoid bi-directional filtering',
      content: "Often you can answer the same question by counting on the fact table instead:\n\n- Products sold in a city: `DISTINCTCOUNT(Sales[ProductID])`\n- Customers who bought a product: `DISTINCTCOUNT(Sales[CustomerID])`\n- Filter a dimension list with a measure: `FILTER(VALUES(Product[Product]), [Total Sales] > 0)`\n\nCROSSFILTER() is useful when you need **dimension columns** or **dimension row counts** under a fact-based filter, or when you must switch a relationship off (None).",
    },
    {
      heading: 'Things to know',
      content: "- CROSSFILTER() cannot create a relationship; it only changes an existing one\n- It works on the relationship between the two named columns; other relationships are unchanged\n- If both USERELATIONSHIP and CROSSFILTER are needed, put both in the same CALCULATE\n- CROSSFILTER and USERELATIONSHIP are **not** in the DAX Lab function list, so practise these in Power BI Desktop with the practice CSV files",
    },
  ],
  examples: [
    {
      title: 'How many products were sold in each city?',
      scenario: 'The regional team wants a count of catalog products sold in each city, using the Product table.',
      table: {
        headers: ['City', 'Products (single)', 'Products Sold in City'],
        rows: [
          ['Mumbai', '6', '4'],
          ['Nagpur', '6', '5'],
          ['Nashik', '6', '3'],
          ['Pune', '6', '5'],
        ],
      },
      steps: [
        'Modeling > New measure: Products (single) = COUNTROWS(Product).',
        'Modeling > New measure: Products Sold in City (code below).',
        'Insert a Matrix. Rows: Customer[City]. Values: Products (single), Products Sold in City.',
        'Turn off the totals: Format visual > Visual > Row subtotals > Off (we compare the city rows).',
      ],
      code: `Products (single) = COUNTROWS ( Product )

Products Sold in City =
CALCULATE (
    COUNTROWS ( Product ),
    CROSSFILTER ( Sales[ProductID], Product[ProductID], Both )
)`,
      result: 'The single-direction measure shows 6 for every city. With CROSSFILTER Both, Nashik shows 3 (Headphones, Keyboard, Mobile) and Mumbai shows 4.',
      explanation: 'City filters Customer, which filters Sales. With Both on the Sales-Product relationship, the filtered Sales rows now filter Product to the products that appear in them.',
    },
    {
      title: 'How many customers bought each product?',
      scenario: 'Count customers from the Customer table for each product, and hide products nobody bought.',
      table: {
        headers: ['Product', 'Customers (single)', 'Buying Customers'],
        rows: [
          ['Desk', '6', '(blank)'],
          ['Headphones', '6', '6'],
          ['Keyboard', '6', '4'],
          ['Laptop', '6', '4'],
          ['Mobile', '6', '6'],
          ['Office Chair', '6', '4'],
        ],
      },
      steps: [
        'Modeling > New measure: Customers (single) = COUNTROWS(Customer).',
        'Modeling > New measure: Buying Customers (code below).',
        'Insert a Table visual: Product[Product], Customers (single), Buying Customers.',
        'Remove Customers (single) from the visual and notice that the Desk row disappears.',
      ],
      code: `Customers (single) = COUNTROWS ( Customer )

Buying Customers =
CALCULATE (
    COUNTROWS ( Customer ),
    CROSSFILTER ( Sales[CustomerID], Customer[CustomerID], Both )
)`,
      result: 'Keyboard was bought by 4 customers (Asha Traders, Kiran Mart, Neha Enterprises, Om Electronics). Desk has no sales, so Buying Customers is blank.',
      explanation: 'Product filters Sales (normal direction). CROSSFILTER Both lets those Sales rows filter Customer. DISTINCTCOUNT(Sales[CustomerID]) would give the same numbers without bi-directional filtering.',
    },
    {
      title: 'Switch a relationship off with None',
      scenario: 'Show a benchmark column with total company sales that ignores the City rows, by disabling the Customer relationship.',
      table: {
        headers: ['City', 'Total Sales', 'Sales Ignoring Customer'],
        rows: [
          ['Mumbai', '801,109', '3,094,953'],
          ['Nagpur', '1,173,782', '3,094,953'],
          ['Nashik', '209,730', '3,094,953'],
          ['Pune', '910,332', '3,094,953'],
          ['Total', '3,094,953', '3,094,953'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Sales Ignoring Customer (code below).',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, Sales Ignoring Customer.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales Ignoring Customer =
CALCULATE (
    [Total Sales],
    CROSSFILTER ( Sales[CustomerID], Customer[CustomerID], None )
)`,
      result: 'Every city shows 3,094,953 in the second column.',
      explanation: 'With direction None, the City filter on Customer cannot reach Sales at all. The result is similar to REMOVEFILTERS(Customer), but filters on Product or Date would still apply.',
    },
    {
      title: 'Measure-level Both vs model-level Both',
      scenario: 'A developer set the Product-Sales relationship to Both in Model view to fix the "products per city" count. Now the Product slicer behaves strangely.',
      steps: [
        'Model view: double-click the Product - Sales relationship. Set Cross filter direction to Both and click OK.',
        'Insert a Slicer with Customer[City] and another with Product[Product].',
        'Select Nashik in the City slicer: the Product slicer now shows only Headphones, Keyboard and Mobile.',
        'Change the relationship back to Single and use the Products Sold in City measure from Example 1 instead.',
      ],
      code: `Products Sold in City =
CALCULATE (
    COUNTROWS ( Product ),
    CROSSFILTER ( Sales[ProductID], Product[ProductID], Both )
)`,
      result: 'With the model set to Both, slicers cross-filter each other everywhere. With the measure approach, only that measure is affected and slicers stay independent.',
      explanation: 'Model-level settings apply to the whole report. CROSSFILTER() changes the direction only inside one CALCULATE, which is safer and easier to reason about.',
    },
  ],
  interview: [
    { q: 'What does CROSSFILTER() do?', a: 'It changes the cross-filter direction (Both, OneWay, None, or a specific one way) of an existing relationship for the duration of a CALCULATE.', level: 'Easy' },
    { q: 'Why is a bi-directional relationship in the model considered risky?', a: 'It can create ambiguous filter paths, make slicers filter each other unexpectedly, interact badly with RLS and reduce performance. It is better to enable it only in specific measures with CROSSFILTER.', level: 'Medium' },
    { q: 'CROSSFILTER vs USERELATIONSHIP?', a: 'USERELATIONSHIP activates an inactive relationship. CROSSFILTER changes the direction of a relationship (or disables it with None). They can be combined in the same CALCULATE.', level: 'Medium' },
    { q: 'Scenario: count customers who bought the selected product using the Customer table. How?', a: 'CALCULATE(COUNTROWS(Customer), CROSSFILTER(Sales[CustomerID], Customer[CustomerID], Both)). Or simply DISTINCTCOUNT(Sales[CustomerID]) which avoids bi-directional filtering.', level: 'Medium' },
    { q: 'What does direction None do?', a: 'It stops filters from flowing through that relationship in either direction for the calculation, so filters on one table do not affect the other.', level: 'Easy' },
    { q: 'Scenario: a many-to-many bridge table needs filters to pass through it. How is CROSSFILTER used?', a: 'Bridge patterns (e.g. Customer - CustomerAccount bridge - Account) need filters to flow from the dimension through the bridge. Set the bridge relationship to Both inside the measure with CROSSFILTER instead of making it bi-directional in the model.', level: 'Hard' },
    { q: 'Does CROSSFILTER work if there is no relationship between the columns?', a: 'No. It modifies an existing relationship only; you get an error if none exists.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Count how many categories were sold in each city.',
      hint: 'COUNTROWS(VALUES(Product[Category])) with CROSSFILTER Both on Sales-Product.',
      solution: 'Categories in City = CALCULATE(COUNTROWS(VALUES(Product[Category])), CROSSFILTER(Sales[ProductID], Product[ProductID], Both)). Nashik 2 (Accessories, Electronics), Mumbai 3, Nagpur 3, Pune 3.',
    },
    {
      task: 'Get the same "products per city" result without CROSSFILTER.',
      hint: 'Count on the fact table.',
      solution: 'DISTINCTCOUNT(Sales[ProductID]) gives Mumbai 4, Nagpur 5, Nashik 3, Pune 5.',
    },
    {
      task: 'Create a measure that ignores the Product relationship, then put it in a matrix by Category.',
      hint: 'Direction None on Sales[ProductID] and Product[ProductID].',
      solution: 'Sales Ignoring Product = CALCULATE([Total Sales], CROSSFILTER(Sales[ProductID], Product[ProductID], None)). Every category shows 3,094,953.',
    },
    {
      task: 'For each segment, count the products bought (using the Product table).',
      hint: 'Segment filters Customer → Sales; you need Both on Sales-Product.',
      solution: 'Use Products Sold in City with Customer[Segment] on rows. Corporate: 5 products; Retail: 5 products (Ravi Stores, Om Electronics and Kiran Mart together bought all five sold products).',
    },
  ],
  quiz: [
    { question: 'In the practice model, which direction do filters flow by default?', options: ['From Sales to Product', 'From Product to Sales', 'Both ways', 'No direction'], answer: 1, explanation: 'Relationships are single direction from the dimension (one side) to the fact (many side).' },
    { question: 'Which direction value disables a relationship inside CROSSFILTER?', options: ['Both', 'OneWay', 'None', 'Off'], answer: 2, explanation: 'None stops filter propagation through that relationship.' },
    { question: 'In a matrix by City, CALCULATE(COUNTROWS(Product), CROSSFILTER(Sales[ProductID], Product[ProductID], Both)) returns what for Nashik?', options: ['6', '5', '4', '3'], answer: 3, explanation: 'Nashik bought Headphones, Keyboard and Mobile.' },
    { question: 'Why prefer CROSSFILTER in a measure over setting Both in Model view?', options: ['It is faster to type', 'It limits bi-directional behaviour to one calculation, avoiding side effects on slicers and other measures', 'Model view does not support Both', 'It creates a new relationship'], answer: 1, explanation: 'Measure-level control avoids model-wide ambiguity and surprises.' },
    { question: 'Which simpler measure gives "customers who bought this product" without CROSSFILTER?', options: ['COUNTROWS(Customer)', 'DISTINCTCOUNT(Sales[CustomerID])', 'COUNT(Product[ProductID])', 'SUM(Sales[CustomerID])'], answer: 1, explanation: 'Counting distinct keys in the fact table respects the product filter directly.' },
  ],
};
