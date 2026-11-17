export default {
  id: 'extra-18-keepfilters',
  title: 'KEEPFILTERS()',
  module: 'Extra: DAX',
  extraNo: 18,
  level: 'Advanced',
  duration: '1.5 hours',
  summary: "By default a CALCULATE() filter on a column replaces any existing filter on that same column. KEEPFILTERS() changes this: the new filter is added on top of (intersected with) the existing filter, so slicers and matrix rows are respected.",
  objectives: [
    'Explain the default "overwrite" behaviour of CALCULATE filters',
    'Use KEEPFILTERS() to intersect a new filter with the existing one',
    'Predict results in a matrix for measures with and without KEEPFILTERS()',
    'Recognise when KEEPFILTERS() makes no difference',
  ],
  theory: [
    {
      heading: 'The default: CALCULATE overwrites filters on the same column',
      content: "When you write `CALCULATE([Total Sales], Product[Category] = \"Electronics\")`, DAX internally turns the condition into `FILTER(ALL(Product[Category]), Product[Category] = \"Electronics\")`. The **ALL()** part means: throw away any existing filter on Product[Category], then apply Electronics.\n\nSo in a matrix with Category on rows, the Furniture row is overwritten to Electronics, and every row shows the Electronics total (2,747,792).\n\nAnalogy: your manager says \"show me Furniture\". CALCULATE is like an assistant who ignores that and always brings the Electronics file, because that is what the formula said.",
    },
    {
      heading: 'KEEPFILTERS(): intersect instead of overwrite',
      content: "`CALCULATE([Total Sales], KEEPFILTERS(Product[Category] = \"Electronics\"))` keeps the existing Category filter and **adds** the new condition. The result is the intersection:\n\n- Electronics row: Electronics AND Electronics = Electronics → 2,747,792\n- Furniture row: Furniture AND Electronics = nothing → blank\n- Total row: all categories AND Electronics = Electronics → 2,747,792\n\nNow the assistant brings the file only if it is both what the manager asked for and what the formula says.",
      syntax: 'CALCULATE ( <expression>, KEEPFILTERS ( <filter expression> ) )',
      points: [
        'KEEPFILTERS() can wrap a Boolean condition, an IN list, or a table filter',
        'It is used only as a CALCULATE / CALCULATETABLE modifier',
        'It never removes filters; it only stops CALCULATE from removing them',
      ],
    },
    {
      heading: 'Overwrite affects only the same column',
      content: "The overwrite happens only for the **column used in the condition**. Filters on other columns stay anyway.\n\nIn a matrix with **Product** on rows, the plain measure `CALCULATE([Total Sales], Product[Category] = \"Electronics\")` already shows blank for Keyboard: the Product[Product] = Keyboard filter is a different column and stays, and Keyboard is not Electronics. So with Product on rows, KEEPFILTERS makes no difference.\n\nSimilarly, a Segment or City filter is never overwritten by a Category condition. KEEPFILTERS matters only when the **same column** is filtered both by the visual/slicer and by your formula.",
      tip: 'Ask: is the column in my CALCULATE condition also on rows, in a slicer, or in a filter? If yes, decide between overwrite and KEEPFILTERS.',
    },
    {
      heading: 'Typical uses',
      content: "1. **Fixed-segment measures that should respect slicers** such as \"Electronics Sales\" that turns blank when the user picks Furniture\n2. **IN lists**: `KEEPFILTERS(Customer[City] IN {\"Pune\", \"Mumbai\"})` shows Pune and Mumbai rows only and keeps the user's city selection\n3. **Iterators over ALL()**: `SUMX(KEEPFILTERS(ALL(Product[Product])), ...)` iterates only products that are still visible\n\nWhen in doubt, build a small matrix with both versions side by side and compare row by row.",
    },
  ],
  examples: [
    {
      title: 'Electronics Sales with and without KEEPFILTERS',
      scenario: 'A matrix by Category shows an "Electronics Sales" measure. The manager is confused because Furniture shows Electronics numbers.',
      table: {
        headers: ['Category', 'Total Sales', 'Electronics Sales', 'Electronics Sales (Keep)'],
        rows: [
          ['Accessories', '157,575', '2,747,792', '(blank)'],
          ['Electronics', '2,747,792', '2,747,792', '2,747,792'],
          ['Furniture', '189,586', '2,747,792', '(blank)'],
          ['Total', '3,094,953', '2,747,792', '2,747,792'],
        ],
      },
      steps: [
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Create Electronics Sales and Electronics Sales (Keep) with the code below.',
        'Insert a Matrix. Rows: Product[Category]. Values: Total Sales, Electronics Sales, Electronics Sales (Keep).',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Electronics Sales =
CALCULATE ( [Total Sales], Product[Category] = "Electronics" )

Electronics Sales (Keep) =
CALCULATE ( [Total Sales], KEEPFILTERS ( Product[Category] = "Electronics" ) )`,
      result: 'The plain measure repeats 2,747,792 on every row. The KEEPFILTERS version shows a value only on the Electronics row and the total.',
      explanation: 'Without KEEPFILTERS, the row filter on Product[Category] is replaced by Electronics. With KEEPFILTERS, the row filter and Electronics are intersected; Accessories AND Electronics is empty.',
    },
    {
      title: 'Same measures with Product on rows',
      scenario: 'Put the same two measures in a matrix by Product and see that they now match.',
      table: {
        headers: ['Product', 'Electronics Sales', 'Electronics Sales (Keep)'],
        rows: [
          ['Headphones', '(blank)', '(blank)'],
          ['Keyboard', '(blank)', '(blank)'],
          ['Laptop', '1,739,560', '1,739,560'],
          ['Mobile', '1,008,232', '1,008,232'],
          ['Office Chair', '(blank)', '(blank)'],
          ['Total', '2,747,792', '2,747,792'],
        ],
      },
      steps: [
        'Copy the matrix from Example 1 (Ctrl+C, Ctrl+V).',
        'Replace Product[Category] on Rows with Product[Product].',
        'Remove Total Sales from Values so only the two Electronics measures remain. Turn on Format > Row headers > Show items with no data if you want blank rows listed.',
      ],
      code: `Electronics Sales =
CALCULATE ( [Total Sales], Product[Category] = "Electronics" )`,
      result: 'Both measures return values only for Laptop and Mobile.',
      explanation: 'The row filter is on Product[Product], a different column from Product[Category]. CALCULATE only overwrites filters on Product[Category], so the product filter stays in both versions and the results are identical.',
    },
    {
      title: 'Respecting a slicer with an IN list',
      scenario: 'A "Metro Sales" measure should cover only Pune and Mumbai. In a matrix by City, other cities should be blank instead of repeating the metro total.',
      table: {
        headers: ['City', 'Total Sales', 'Metro Sales', 'Metro Sales (Keep)'],
        rows: [
          ['Mumbai', '801,109', '1,711,441', '801,109'],
          ['Nagpur', '1,173,782', '1,711,441', '(blank)'],
          ['Nashik', '209,730', '1,711,441', '(blank)'],
          ['Pune', '910,332', '1,711,441', '910,332'],
          ['Total', '3,094,953', '1,711,441', '1,711,441'],
        ],
      },
      steps: [
        'Create the two measures below.',
        'Insert a Matrix. Rows: Customer[City]. Values: Total Sales, Metro Sales, Metro Sales (Keep).',
        'Add a Slicer on Customer[City] and select only Mumbai. The matrix now shows only Mumbai: Metro Sales (Keep) = 801,109, while Metro Sales still shows 1,711,441.',
      ],
      code: `Metro Sales =
CALCULATE ( [Total Sales], Customer[City] IN { "Pune", "Mumbai" } )

Metro Sales (Keep) =
CALCULATE ( [Total Sales], KEEPFILTERS ( Customer[City] IN { "Pune", "Mumbai" } ) )`,
      result: 'Metro Sales (Keep) shows Mumbai 801,109 and Pune 910,332, blank for Nagpur and Nashik, and 1,711,441 in total.',
      explanation: 'The plain version replaces the City filter with {Pune, Mumbai} on every row. KEEPFILTERS intersects the row city with the list, so only matching cities keep a value.',
    },
    {
      title: 'Card that turns blank for the wrong slicer choice',
      scenario: 'A KPI card shows Electronics Sales. When a user selects Accessories in a Category slicer, the card should not keep showing Electronics numbers.',
      steps: [
        'Insert a Slicer on Product[Category] and select Accessories.',
        'Insert two Card visuals: one with Electronics Sales, one with Electronics Sales (Keep) (measures from Example 1).',
        'Change the slicer to Electronics, then to Electronics + Accessories.',
      ],
      code: `Electronics Sales (Keep) =
CALCULATE ( [Total Sales], KEEPFILTERS ( Product[Category] = "Electronics" ) )`,
      result: 'Accessories selected: plain card 2,747,792, Keep card (Blank). Electronics selected: both 2,747,792. Electronics + Accessories: both 2,747,792.',
      explanation: 'KEEPFILTERS intersects the slicer selection with Electronics. Accessories alone has no overlap, so the result is blank, telling the user the measure does not apply to the selection.',
    },
  ],
  interview: [
    { q: 'What does KEEPFILTERS() do?', a: 'It makes a CALCULATE filter intersect with the existing filter on the same column instead of replacing it.', level: 'Easy' },
    { q: 'Why does CALCULATE([Total Sales], Product[Category] = "Electronics") show the same value on every category row?', a: 'A Boolean filter is expanded to FILTER(ALL(Product[Category]), ...). The ALL removes the row filter on Category, so every row is overwritten to Electronics.', level: 'Medium' },
    { q: 'Does KEEPFILTERS change anything if the visual is filtered on a different column?', a: 'No. CALCULATE only overwrites filters on the columns used in its filter arguments. Filters on other columns are kept anyway, so KEEPFILTERS gives the same result.', level: 'Medium' },
    { q: 'Scenario: a measure CALCULATE([Total Sales], Customer[City] IN {"Pune","Mumbai"}) shows 1,711,441 even when the user picks Nagpur in a slicer. Fix?', a: 'Wrap the condition in KEEPFILTERS so it intersects with the slicer: CALCULATE([Total Sales], KEEPFILTERS(Customer[City] IN {"Pune","Mumbai"})). With Nagpur selected it returns blank.', level: 'Hard' },
    { q: 'KEEPFILTERS vs FILTER(VALUES(col), condition)?', a: 'Both intersect with the current filter. CALCULATE([Total Sales], FILTER(VALUES(Product[Category]), Product[Category] = "Electronics")) gives the same result as the KEEPFILTERS version. KEEPFILTERS is shorter and usually more efficient.', level: 'Hard' },
    { q: 'Can KEEPFILTERS be used outside CALCULATE?', a: 'It is used as a filter modifier in CALCULATE/CALCULATETABLE and can also wrap the table of some iterators (e.g. SUMX(KEEPFILTERS(ALL(...)), ...)) to keep existing filters during iteration. It is not a standalone function that returns a value.', level: 'Medium' },
    { q: 'When would you deliberately NOT use KEEPFILTERS?', a: 'When the measure must always show a fixed slice regardless of the row, for example a benchmark column "Electronics Sales" next to every category for comparison.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create Corporate Sales with KEEPFILTERS and put it in a matrix by Segment.',
      hint: 'KEEPFILTERS(Customer[Segment] = "Corporate").',
      solution: 'Corporate Sales (Keep) = CALCULATE([Total Sales], KEEPFILTERS(Customer[Segment] = "Corporate")). Corporate 2,158,211, Retail blank, Total 2,158,211.',
    },
    {
      task: 'Put Corporate Sales (Keep) in a matrix by City. Which cities show values?',
      hint: 'City is a different column from Segment.',
      solution: 'Pune 636,464 (Asha Traders), Nagpur 1,173,782, Mumbai 347,965 (Sai Furnishers), Nashik blank. The non-KEEPFILTERS version gives the same numbers because the row column is City, not Segment.',
    },
    {
      task: 'Create Accessories+Furniture Sales that respects a Category slicer.',
      hint: 'Use IN with KEEPFILTERS.',
      solution: 'Non-Electronics = CALCULATE([Total Sales], KEEPFILTERS(Product[Category] IN {"Accessories", "Furniture"})). By Category: Accessories 157,575, Furniture 189,586, Electronics blank, Total 347,161.',
    },
    {
      task: 'Try this in the DAX Lab: compare CALCULATE([Total Sales], Product[Category] = "Furniture") with the KEEPFILTERS version by Category.',
      hint: 'Look at the Electronics row.',
      solution: 'Plain: 189,586 on every row. KEEPFILTERS: 189,586 only on Furniture and Total; blank on Accessories and Electronics.',
    },
  ],
  quiz: [
    { question: 'By default, a Boolean filter in CALCULATE on Product[Category]:', options: ['Intersects with the existing Category filter', 'Replaces the existing Category filter', 'Is ignored', 'Removes all filters'], answer: 1, explanation: 'It is expanded with ALL(Product[Category]), which overwrites the existing filter on that column.' },
    { question: 'In a matrix by Category, CALCULATE([Total Sales], KEEPFILTERS(Product[Category] = "Electronics")) on the Furniture row returns:', options: ['189,586', '2,747,792', 'Blank', '3,094,953'], answer: 2, explanation: 'Furniture AND Electronics is empty, so the result is blank.' },
    { question: 'In a matrix by Product, do the plain and KEEPFILTERS Electronics measures differ?', options: ['Yes, on every row', 'Only on the Total row', 'No, because the row filter is on a different column', 'Only for Desk'], answer: 2, explanation: 'CALCULATE only overwrites Product[Category]; the Product[Product] filter stays in both versions.' },
    { question: 'Metro Sales (Keep) with KEEPFILTERS(Customer[City] IN {"Pune","Mumbai"}) shows what on the Total row?', options: ['3,094,953', '1,711,441', '910,332', 'Blank'], answer: 1, explanation: 'All cities intersected with Pune and Mumbai = 910,332 + 801,109 = 1,711,441.' },
    { question: 'Which expression gives the same result as KEEPFILTERS(Product[Category] = "Electronics") inside CALCULATE?', options: ['ALL(Product[Category])', 'FILTER(VALUES(Product[Category]), Product[Category] = "Electronics")', 'REMOVEFILTERS(Product)', 'Product[Category] = "Electronics"'], answer: 1, explanation: 'FILTER over VALUES only considers currently visible categories, which is an intersection.' },
  ],
};
