export default {
  id: 'extra-17-removefilters',
  title: 'REMOVEFILTERS()',
  module: 'Extra: DAX',
  extraNo: 17,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "REMOVEFILTERS() is a CALCULATE modifier that clears filters from a table, from specific columns, or from the whole model. It is the clearest way to write \"% of total\", \"% of category\" and \"ignore this slicer\" measures.",
  objectives: [
    'Use REMOVEFILTERS() inside CALCULATE() to clear filters from a table or columns',
    'Build % of grand total and % of parent (category) measures',
    'Explain the difference between REMOVEFILTERS(), ALL() and ALLSELECTED()',
    'Predict which filters remain after REMOVEFILTERS() runs',
  ],
  theory: [
    {
      heading: 'What REMOVEFILTERS() does',
      content: "Every cell in a visual has a **filter context**: the row label, column label, slicers and page filters. CALCULATE() lets you change that context. REMOVEFILTERS() is the instruction \"forget these filters\".\n\nAnalogy: you wear coloured glasses (the filters) that let you see only Pune sales. REMOVEFILTERS(Customer) takes off the glasses for the Customer table, so you see all cities again, while other glasses (for example the Year filter) stay on.",
      syntax: `REMOVEFILTERS ( [<TableNameOrColumnName> [, <ColumnName> [, ...]]] )

CALCULATE ( <expression>, REMOVEFILTERS ( <table or columns> ) )`,
      points: [
        'REMOVEFILTERS(Customer): clear filters from every column of Customer',
        'REMOVEFILTERS(Product[Product]): clear only the Product[Product] filter',
        'REMOVEFILTERS(): no argument, clear every filter in the model',
      ],
    },
    {
      heading: 'REMOVEFILTERS() vs ALL()',
      content: "Used as a CALCULATE filter modifier, `REMOVEFILTERS(x)` and `ALL(x)` do **exactly the same** thing. REMOVEFILTERS() was added to make code easier to read: its name says what it does.\n\nThe difference: ALL() can **also** be used as a table function (for example in `RANKX(ALL(Product[Product]), ...)` or `COUNTROWS(ALL(Product))`). REMOVEFILTERS() can only be used as a CALCULATE / CALCULATETABLE modifier; it does not return a table.",
      tip: 'Rule of thumb: REMOVEFILTERS() when you want to clear filters inside CALCULATE; ALL() when you need a table of all values.',
    },
    {
      heading: 'Only what you name is removed',
      content: "REMOVEFILTERS() is precise. If the visual is filtered by Category (Product table) and Year (Sales[Year]):\n\n- `REMOVEFILTERS(Product)` removes Category but keeps the Year\n- `REMOVEFILTERS(Product[Product])` keeps Category **and** Year; only a filter on the product name is removed\n- `REMOVEFILTERS()` removes everything, including slicers on other pages that are synced\n\nThis is why % of total measures work correctly with slicers: you only clear the dimension shown on rows, and the other filters still apply to both numerator and denominator.",
    },
    {
      heading: 'REMOVEFILTERS() vs ALLSELECTED()',
      content: "Suppose a slicer selects only the Retail segment and a matrix shows cities.\n\n- `CALCULATE([Total Sales], REMOVEFILTERS(Customer))` returns sales of **all** customers (3,094,953), ignoring the slicer too\n- `CALCULATE([Total Sales], ALLSELECTED(Customer))` returns sales of the **selected** customers (Retail = 936,742), clearing only the matrix row filter\n\nUse ALLSELECTED() for \"% of what the user sees\" and REMOVEFILTERS() for \"% of the whole company\".",
    },
    {
      heading: 'Common patterns',
      content: "1. % of grand total: `DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product)))`\n2. % of parent: `DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product[Product])))` in a Category > Product matrix\n3. Ignore one slicer: `CALCULATE([Total Sales], REMOVEFILTERS(Customer[Segment]))`\n4. Grand total that nothing can change: `CALCULATE([Total Sales], REMOVEFILTERS())`",
      points: [
        'Always wrap the denominator in DIVIDE() to avoid division errors',
        'Format % measures with Measure tools > Format > Percentage',
      ],
    },
  ],
  examples: [
    {
      title: '% of grand total by category',
      scenario: 'Show each category\'s share of total company sales.',
      table: {
        headers: ['Category', 'Total Sales', 'All Category Sales', '% of Total'],
        rows: [
          ['Accessories', '157,575', '3,094,953', '5.09%'],
          ['Electronics', '2,747,792', '3,094,953', '88.78%'],
          ['Furniture', '189,586', '3,094,953', '6.13%'],
          ['Total', '3,094,953', '3,094,953', '100.00%'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: All Category Sales = CALCULATE([Total Sales], REMOVEFILTERS(Product)).',
        'Modeling > New measure: % of Total = DIVIDE([Total Sales], [All Category Sales]).',
        'Select % of Total and set Measure tools > Format to Percentage with 2 decimals.',
        'Insert a Matrix. Rows: Product[Category]. Values: Total Sales, All Category Sales, % of Total.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

All Category Sales =
CALCULATE ( [Total Sales], REMOVEFILTERS ( Product ) )

% of Total =
DIVIDE ( [Total Sales], [All Category Sales] )`,
      result: 'Electronics brings 88.78% of sales. All Category Sales shows 3,094,953 on every row.',
      explanation: 'On each row the Category filter is removed by REMOVEFILTERS(Product), so the denominator is always the total of all categories.',
    },
    {
      title: '% of category (parent) in a hierarchy',
      scenario: 'Inside each category, show what share each product contributes.',
      table: {
        headers: ['Category / Product', 'Total Sales', 'Category Sales', '% of Category'],
        rows: [
          ['Accessories', '157,575', '157,575', '100.00%'],
          ['   Headphones', '110,938', '157,575', '70.40%'],
          ['   Keyboard', '46,637', '157,575', '29.60%'],
          ['Electronics', '2,747,792', '2,747,792', '100.00%'],
          ['   Laptop', '1,739,560', '2,747,792', '63.31%'],
          ['   Mobile', '1,008,232', '2,747,792', '36.69%'],
          ['Furniture', '189,586', '189,586', '100.00%'],
          ['   Office Chair', '189,586', '189,586', '100.00%'],
        ],
      },
      steps: [
        'Modeling > New measure: Category Sales = CALCULATE([Total Sales], REMOVEFILTERS(Product[Product])).',
        'Modeling > New measure: % of Category = DIVIDE([Total Sales], [Category Sales]). Format as Percentage.',
        'Insert a Matrix. Rows: Product[Category] then Product[Product]. Values: Total Sales, Category Sales, % of Category.',
        'Click Expand all down one level in the visual header.',
      ],
      code: `Category Sales =
CALCULATE ( [Total Sales], REMOVEFILTERS ( Product[Product] ) )

% of Category =
DIVIDE ( [Total Sales], [Category Sales] )`,
      result: 'Laptop is 63.31% of Electronics; Headphones is 70.40% of Accessories. Category rows show 100%.',
      explanation: 'Only the Product[Product] filter is cleared; the Category filter from the parent row stays, so the denominator is the category total.',
    },
    {
      title: 'Share inside a year: other filters stay',
      scenario: 'A Year slicer is set to 2024. The category share should be calculated within 2024 only.',
      table: {
        headers: ['Category', 'Total Sales (2024)', '% of Total (2024)'],
        rows: [
          ['Accessories', '86,907', '5.23%'],
          ['Electronics', '1,565,941', '94.18%'],
          ['Furniture', '9,790', '0.59%'],
          ['Total', '1,662,638', '100.00%'],
        ],
      },
      steps: [
        'Reuse % of Total from Example 1.',
        'Insert a Slicer with Sales[Year] and select 2024.',
        'Look at the matrix from Example 1.',
      ],
      code: `% of Total =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], REMOVEFILTERS ( Product ) )
)`,
      result: 'With 2024 selected, Electronics is 94.18% of 2024 sales (1,565,941 / 1,662,638). In 2023 it is 82.51%.',
      explanation: 'REMOVEFILTERS(Product) clears only filters on the Product table. The Year filter is on Sales[Year], so it stays in both numerator and denominator.',
    },
    {
      title: 'REMOVEFILTERS vs ALLSELECTED with a Segment slicer',
      scenario: 'The Segment slicer is set to Retail. The manager wants to see each city as % of the company and as % of the selected segment.',
      table: {
        headers: ['City', 'Total Sales', '% of Company', '% of Selected'],
        rows: [
          ['Mumbai', '453,144', '14.64%', '48.37%'],
          ['Nashik', '209,730', '6.78%', '22.39%'],
          ['Pune', '273,868', '8.85%', '29.24%'],
          ['Total', '936,742', '30.27%', '100.00%'],
        ],
      },
      steps: [
        'Insert a Slicer with Customer[Segment] and select Retail.',
        'Create the two measures below and format both as Percentage.',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, % of Company, % of Selected.',
      ],
      code: `% of Company =
DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], REMOVEFILTERS ( Customer ) ) )

% of Selected =
DIVIDE ( [Total Sales], CALCULATE ( [Total Sales], ALLSELECTED ( Customer ) ) )`,
      result: 'Mumbai Retail sales are 14.64% of the whole company but 48.37% of Retail sales.',
      explanation: 'REMOVEFILTERS(Customer) also clears the Segment slicer, so the denominator is 3,094,953. ALLSELECTED(Customer) keeps the slicer, so the denominator is 936,742.',
    },
  ],
  interview: [
    { q: 'What is REMOVEFILTERS()?', a: 'A CALCULATE modifier that removes filters from a table, from specific columns, or (with no argument) from the entire model.', level: 'Easy' },
    { q: 'REMOVEFILTERS vs ALL: what is the difference?', a: 'As a CALCULATE modifier they behave identically. ALL can also be used as a table function (returning all rows/values), REMOVEFILTERS cannot. REMOVEFILTERS is preferred for readability when you only want to clear filters.', level: 'Medium' },
    { q: 'Can you write COUNTROWS(REMOVEFILTERS(Product))?', a: 'No. REMOVEFILTERS does not return a table. Use COUNTROWS(ALL(Product)) instead.', level: 'Medium' },
    { q: 'How do you write % of parent in a Category > Product matrix?', a: 'DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product[Product]))). Removing only the product column keeps the category filter.', level: 'Medium' },
    { q: 'Scenario: your % of total shows 100% on every row. What went wrong?', a: 'The denominator did not remove the filter of the column on the rows. For example rows use Product[Category] but the measure removes Customer filters. Remove filters from the table or column actually on the rows.', level: 'Hard' },
    { q: 'Scenario: a % of total measure should ignore the visual rows but respect slicers. Which function?', a: 'ALLSELECTED(). REMOVEFILTERS would also ignore slicer selections on that table.', level: 'Hard' },
    { q: 'What does CALCULATE([Total Sales], REMOVEFILTERS()) return?', a: 'Total sales with every filter in the model removed: slicers, rows, page and report filters. In the practice model it always returns 3,094,953.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create % of Total by City.',
      hint: 'Remove filters from the Customer table.',
      solution: 'City % = DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Customer))). Nagpur 37.93%, Pune 29.41%, Mumbai 25.88%, Nashik 6.78%.',
    },
    {
      task: 'Create a measure that always shows total sales of all segments, even when a Segment slicer is used.',
      hint: 'Clear only the Segment column.',
      solution: 'Sales All Segments = CALCULATE([Total Sales], REMOVEFILTERS(Customer[Segment])). With Retail selected it still shows 3,094,953 (and on a City row it shows that city\'s total for both segments).',
    },
    {
      task: 'In a matrix by Year (Sales[Year]), show each year as % of both years.',
      hint: 'Clear the Sales[Year] column.',
      solution: 'Year % = DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Sales[Year]))). 2023: 46.28%, 2024: 53.72%.',
    },
    {
      task: 'Try this in the DAX Lab: compare CALCULATE([Total Sales], REMOVEFILTERS(Product)) and CALCULATE([Total Sales], REMOVEFILTERS(Product[Product])) by Category.',
      hint: 'Which one keeps the category filter?',
      solution: 'REMOVEFILTERS(Product) shows 3,094,953 on every row. REMOVEFILTERS(Product[Product]) shows the category totals (157,575 / 2,747,792 / 189,586) because Category is a different column that remains filtered.',
    },
  ],
  quiz: [
    { question: 'Where can REMOVEFILTERS() be used?', options: ['As a table in COUNTROWS()', 'As a modifier inside CALCULATE() or CALCULATETABLE()', 'In Power Query', 'Only in calculated columns'], answer: 1, explanation: 'REMOVEFILTERS() is only a filter modifier; it does not return a table.' },
    { question: 'In a matrix by Category, CALCULATE([Total Sales], REMOVEFILTERS(Product)) on the Furniture row returns:', options: ['189,586', '3,094,953', 'Blank', '2,747,792'], answer: 1, explanation: 'All Product filters are removed, so the result is the grand total.' },
    { question: 'Which keeps slicer selections but ignores the visual\'s row filter?', options: ['REMOVEFILTERS()', 'ALL()', 'ALLSELECTED()', 'KEEPFILTERS()'], answer: 2, explanation: 'ALLSELECTED() respects outer selections such as slicers.' },
    { question: 'With a Year slicer on 2024, % of Total = DIVIDE([Total Sales], CALCULATE([Total Sales], REMOVEFILTERS(Product))) uses which denominator?', options: ['All years total 3,094,953', '2024 total 1,662,638', '2023 total 1,432,315', 'The category total'], answer: 1, explanation: 'Only Product filters are removed; the Year filter remains.' },
    { question: 'What does REMOVEFILTERS() with no arguments do?', options: ['Nothing', 'Removes all filters from the model', 'Removes only slicers', 'Returns an error'], answer: 1, explanation: 'With no argument it clears every filter in the model.' },
  ],
};
