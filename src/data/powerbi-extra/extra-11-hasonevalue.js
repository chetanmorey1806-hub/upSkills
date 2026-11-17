export default {
  id: 'extra-11-hasonevalue',
  title: 'HASONEVALUE()',
  module: 'Extra: DAX',
  extraNo: 11,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'HASONEVALUE() returns TRUE when exactly one distinct value of a column is visible in the current filter context. It protects measures that only make sense for a single item (a product price, one year average, a selected city name) and lets you control what totals show.',
  objectives: [
    'Explain what HASONEVALUE checks and how it relates to VALUES and COUNTROWS',
    'Show a value only when a single item is in context and blank it on totals',
    'Build selected-item text and compare HASONEVALUE with SELECTEDVALUE',
    'Compare HASONEVALUE with ISFILTERED in slicer scenarios',
    'Avoid the "a table of multiple values was supplied" error',
  ],
  theory: [
    {
      heading: 'What HASONEVALUE() checks',
      content: 'HASONEVALUE looks at a column in the current filter context and asks: "Is exactly one distinct value visible?" It is a shortcut for `COUNTROWS(VALUES(column)) = 1`.\n\nAnalogy: a waiter asks "Is there only one person at this table?" before bringing a single bill. If there are several people, a single bill makes no sense.\n\nExamples in a table visual with Product[Product] on rows:\n- On the Laptop row only Laptop is visible: HASONEVALUE(Product[Product]) = TRUE.\n- On the Total row all products are visible: FALSE.',
      syntax: 'HASONEVALUE(<columnName>)\n\n-- same as\nCOUNTROWS(VALUES(<columnName>)) = 1',
    },
    {
      heading: 'Why you need it: the VALUES error',
      content: '`VALUES(Product[Price])` returns a table of prices visible in the context. When one product is visible, DAX can convert that one-row, one-column table to a single value. When many products are visible (like on a total row), you get the error **"A table of multiple values was supplied where a single value was expected."**\n\nWrapping it with `IF(HASONEVALUE(...), VALUES(...))` returns the value only when it is safe, and BLANK otherwise (IF without a third argument returns BLANK).',
    },
    {
      heading: 'HASONEVALUE vs SELECTEDVALUE',
      content: 'SELECTEDVALUE(column, alternate) is built on the same idea:\n\n`SELECTEDVALUE(Customer[City], "Multiple")` is equivalent to\n`IF(HASONEVALUE(Customer[City]), VALUES(Customer[City]), "Multiple")`.\n\nUse SELECTEDVALUE when you just need the value. Use HASONEVALUE when you need to switch to a completely different calculation depending on whether one value is visible (for example average per month only for one year).',
      tip: 'Before SELECTEDVALUE existed (2017), the IF(HASONEVALUE(...), VALUES(...)) pattern was the standard. You will still see it in older reports and interview questions.',
    },
    {
      heading: 'HASONEVALUE vs ISFILTERED',
      content: 'They answer different questions:\n\n- **ISFILTERED(Customer[City])**: is there a direct filter on City?\n- **HASONEVALUE(Customer[City])**: is exactly one City visible, for any reason?\n\nCases:\n1. No slicers: ISFILTERED FALSE, HASONEVALUE FALSE (4 cities).\n2. Slicer City = Pune: TRUE, TRUE.\n3. Slicer City = Pune and Mumbai: TRUE, FALSE.\n4. Slicer on Customer[Customer] = one customer from Pune: ISFILTERED(City) FALSE, HASONEVALUE(City) TRUE (only Pune remains visible through the same table).',
    },
    {
      heading: 'Controlling totals',
      content: 'Many measures are meaningful per row but misleading on totals, for example a unit price or a "% of target" when targets are only defined per city. HASONEVALUE lets you blank or replace those totals.\n\nRemember the opposite pattern too: if you want a total that sums the row-level results (instead of re-calculating at total level), use SUMX over VALUES of the row column. Choose based on what the business expects the total to mean.',
      points: [
        'IF(HASONEVALUE(col), rowLevelCalc) blanks totals',
        'SUMX(VALUES(col), rowLevelCalc) makes totals equal the sum of rows',
        'Blank values (from unmatched relationships) count as a value in VALUES',
      ],
    },
  ],
  examples: [
    {
      title: 'Show product price only on product rows',
      scenario: 'A matrix shows Category and Product on rows with Total Sales. You want a Unit Price column, but the Category subtotal and grand total must not show a price.',
      table: {
        headers: ['Category / Product', 'Total Sales', 'List Price'],
        rows: [
          ['Electronics', '5,50,000', '(blank)'],
          ['   Laptop', '5,50,000', '55,000'],
          ['Accessories', '12,000', '(blank)'],
          ['   Mouse', '12,000', '600'],
          ['Total', '5,62,000', '(blank)'],
        ],
      },
      steps: [
        'Modeling > New measure: List Price (code below)',
        'Insert a Matrix: Rows = Product[Category], Product[Product]; Values = Total Sales, List Price',
        'Expand all levels (Expand all down one level in the hierarchy icon on the visual header)',
        'Remove the HASONEVALUE wrapper temporarily to see the multiple-values error on totals, then put it back',
      ],
      code: `List Price =
IF(
    HASONEVALUE(Product[Product]),
    VALUES(Product[Price])
)`,
      result: 'Laptop shows 55,000 and Mouse shows 600; category and grand total rows are blank.',
      explanation: 'On product rows only one product is visible, so VALUES returns one price. On subtotal and total rows several products are visible, HASONEVALUE is FALSE, and IF without a false branch returns BLANK.',
    },
    {
      title: 'Average monthly sales only for one year',
      scenario: 'Show average monthly sales per year. On the total row (two years) the average across 12 month names would mix years, so leave it blank.',
      table: {
        headers: ['Year', 'Total Sales', 'Avg Monthly Sales'],
        rows: [[2023, '12,00,000', '1,00,000'], [2024, '15,00,000', '1,25,000'], ['Total', '27,00,000', '(blank)']],
      },
      steps: [
        'Modeling > New measure: Avg Monthly Sales',
        'Insert a Table visual with Date[Year], Total Sales and Avg Monthly Sales',
        'Check that 2023 = 12,00,000 / 12 and 2024 = 15,00,000 / 12',
      ],
      code: `Avg Monthly Sales =
IF(
    HASONEVALUE('Date'[Year]),
    AVERAGEX(VALUES('Date'[Month]), [Total Sales])
)`,
      result: '2023 shows 1,00,000; 2024 shows 1,25,000; Total is blank.',
      explanation: 'AVERAGEX iterates the 12 month names visible for one year and averages Total Sales. On the total row both years are visible; Jan 2023 and Jan 2024 would be combined into one "Jan", so the measure returns BLANK instead of a misleading number.',
    },
    {
      title: 'Selected city text (classic pattern vs SELECTEDVALUE)',
      scenario: 'A card should show the selected city, or "Multiple cities" when more than one or none is selected.',
      table: {
        headers: ['City slicer', 'Selected City (both measures)'],
        rows: [['Nagpur', 'Nagpur'], ['Pune and Nashik', 'Multiple cities'], ['Nothing selected', 'Multiple cities']],
      },
      steps: [
        'Modeling > New measure: Selected City (classic)',
        'Modeling > New measure: Selected City (modern)',
        'Add a Customer[City] slicer and two Card visuals, one per measure',
        'Test the selections and confirm both cards always match',
      ],
      code: `Selected City (classic) =
IF(
    HASONEVALUE(Customer[City]),
    VALUES(Customer[City]),
    "Multiple cities"
)

Selected City (modern) = SELECTEDVALUE(Customer[City], "Multiple cities")`,
      result: 'Both measures return the same text for every selection.',
      explanation: 'SELECTEDVALUE is a built-in shortcut for the HASONEVALUE + VALUES pattern. With nothing selected, all 4 cities are visible, so HASONEVALUE is FALSE.',
    },
    {
      title: 'Compare HASONEVALUE and ISFILTERED',
      scenario: 'See how the two functions react to different slicers on the Customer table.',
      table: {
        headers: ['Slicer state', 'City Filtered (ISFILTERED)', 'One City (HASONEVALUE)'],
        rows: [
          ['No slicer', 'FALSE', 'FALSE'],
          ['City = Pune', 'TRUE', 'TRUE'],
          ['City = Pune, Mumbai', 'TRUE', 'FALSE'],
          ['Customer = Asha Traders (Pune) only', 'FALSE', 'TRUE'],
        ],
      },
      steps: [
        'Modeling > New measure: City Filtered and One City',
        'Add slicers for Customer[City] and Customer[Customer]',
        'Show both measures in a Table visual or two Cards',
        'Test each slicer state from the table above (clear the other slicer each time)',
      ],
      code: `City Filtered = ISFILTERED(Customer[City])

One City = HASONEVALUE(Customer[City])`,
      result: 'The measures match the table above.',
      explanation: 'ISFILTERED needs a direct filter on City. HASONEVALUE only counts visible values: choosing one customer filters the Customer table, leaving only that customer City visible.',
    },
  ],
  interview: [
    { q: 'What does HASONEVALUE() do?', a: 'Returns TRUE when exactly one distinct value of the column is visible in the current filter context. It equals COUNTROWS(VALUES(column)) = 1.', level: 'Easy' },
    { q: 'How do you fix "A table of multiple values was supplied where a single value was expected"?', a: 'The expression (often VALUES(column)) returned several rows. Wrap it with IF(HASONEVALUE(column), VALUES(column), alternative) or use SELECTEDVALUE(column, alternative), or aggregate with MAX/MIN if any single value is acceptable.', level: 'Medium' },
    { q: 'What is the relationship between HASONEVALUE and SELECTEDVALUE?', a: 'SELECTEDVALUE(col, alt) is equivalent to IF(HASONEVALUE(col), VALUES(col), alt). SELECTEDVALUE is the shorter modern form.', level: 'Easy' },
    { q: 'Give a case where ISFILTERED is FALSE but HASONEVALUE is TRUE.', a: 'A slicer on Customer[Customer] selects one customer from Pune. City is not directly filtered (ISFILTERED FALSE) but only Pune is visible (HASONEVALUE TRUE).', level: 'Hard' },
    { q: 'Why might a measure using HASONEVALUE still show a value on the total row?', a: 'Because only one value is actually visible at total level, e.g. a slicer reduced the data to one product, or the model has only one value. HASONEVALUE checks visible values, not whether the row is a total.', level: 'Medium' },
    { q: 'Scenario: A matrix shows % of Target by City; targets exist only per city. What should the total show and how?', a: 'Either blank: IF(HASONEVALUE(Customer[City]), DIVIDE([Total Sales], [Target])), or an overall % using total sales divided by summed targets: DIVIDE([Total Sales], SUMX(VALUES(Customer[City]), [Target])). Agree the definition with the business. (Target is an extra table the student creates.)', level: 'Hard' },
    { q: 'Does HASONEVALUE count a BLANK value?', a: 'Yes. VALUES includes the blank row created when fact rows do not match the dimension (invalid relationship), so a blank plus one real value means two values and HASONEVALUE returns FALSE.', level: 'Hard' },
  ],
  practice: [
    { task: 'Create Product Category Label that returns the category name when one category is visible, else "All categories". Write it with HASONEVALUE.', hint: 'IF + HASONEVALUE + VALUES.', solution: 'Product Category Label =\nIF(\n    HASONEVALUE(Product[Category]),\n    VALUES(Product[Category]),\n    "All categories"\n)' },
    { task: 'Rewrite the previous measure using SELECTEDVALUE.', hint: 'Second argument is the alternate result.', solution: 'Product Category Label 2 = SELECTEDVALUE(Product[Category], "All categories")' },
    { task: 'Create Avg Quantity per Order that shows only when one customer is in context.', hint: 'Check Customer[Customer]; average Quantity over orders.', solution: 'Avg Quantity per Order =\nIF(\n    HASONEVALUE(Customer[Customer]),\n    AVERAGEX(VALUES(Sales[OrderID]), CALCULATE(SUM(Sales[Quantity])))\n)' },
    { task: 'Make List Price show the product price on product rows and the average list price of visible products on totals.', hint: 'Use AVERAGE in the false branch.', solution: 'List Price 2 =\nIF(\n    HASONEVALUE(Product[Product]),\n    VALUES(Product[Price]),\n    AVERAGE(Product[Price])\n)' },
  ],
  quiz: [
    { question: 'HASONEVALUE(col) is equivalent to:', options: ['COUNT(col) = 1', 'COUNTROWS(VALUES(col)) = 1', 'ISFILTERED(col)', 'NOT ISBLANK(col)'], answer: 1, explanation: 'It checks that exactly one distinct value is visible.' },
    { question: 'On the Total row of a table with Product[Product] on rows (no slicers), HASONEVALUE(Product[Product]) is:', options: ['TRUE', 'FALSE', 'BLANK', 'An error'], answer: 1, explanation: 'All products are visible on the total row.' },
    { question: 'What does IF(HASONEVALUE(Product[Product]), VALUES(Product[Price])) return on the total row?', options: ['0', 'The sum of prices', 'BLANK', 'An error'], answer: 2, explanation: 'IF without an else argument returns BLANK.' },
    { question: 'City slicer selects Pune and Mumbai. HASONEVALUE(Customer[City]) returns:', options: ['TRUE', 'FALSE', 'Pune', 'Error'], answer: 1, explanation: 'Two values are visible.' },
    { question: 'Which function is the modern shortcut for IF(HASONEVALUE(c), VALUES(c), alt)?', options: ['LOOKUPVALUE', 'SELECTEDVALUE', 'FIRSTNONBLANK', 'DISTINCT'], answer: 1, explanation: 'SELECTEDVALUE(c, alt) does exactly this.' },
  ],
};
