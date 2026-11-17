export default {
  id: 'extra-09-isblank',
  title: 'ISBLANK()',
  module: 'Extra: DAX',
  extraNo: 9,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'ISBLANK() checks whether a value or measure result is BLANK, the DAX version of "nothing here". Use it to show 0 or a label instead of empty cells, avoid misleading percentages, and flag customers or products with no sales.',
  objectives: [
    'Explain what BLANK means in DAX and when measures return it',
    'Use ISBLANK() inside IF() in measures and calculated columns',
    'Know the difference between ISBLANK(x), x = BLANK() and x == BLANK()',
    'Replace blanks with 0 or text, and understand the visual side effects',
    'Use COALESCE() as a shorter alternative',
  ],
  theory: [
    {
      heading: 'What is BLANK in DAX?',
      content: 'BLANK is the DAX value for "no value". It is similar to NULL in SQL or an empty cell in Excel.\n\nA measure returns BLANK when there is nothing to calculate in the current filter context. Example: `Total Sales = SUM(Sales[SalesAmount])` returns BLANK for a product that had no sales in the selected year, because SUM of no rows is blank (not 0).\n\nBlanks are useful: Power BI hides rows where all measures are blank, which keeps tables and charts clean. But sometimes business users want to see 0, or your formula behaves wrongly when a value is blank.',
    },
    {
      heading: 'ISBLANK() syntax',
      content: 'ISBLANK takes one value and returns TRUE if it is BLANK, otherwise FALSE. It is almost always used inside IF.\n\n- `ISBLANK([Total Sales])` checks a measure result.\n- In a calculated column, `ISBLANK(Customer[City])` checks the column value of the current row.\n- `ISBLANK(0)` is **FALSE** (zero is a real number) and `ISBLANK("")` is **FALSE** (empty text is a value).',
      syntax: 'ISBLANK(<value>)\n\nSales or Zero = IF(ISBLANK([Total Sales]), 0, [Total Sales])',
    },
    {
      heading: 'ISBLANK vs = BLANK() vs == BLANK()',
      content: 'DAX treats BLANK as equal to 0 and to empty text when you use the normal `=` operator. This is a common trap.\n\n- `ISBLANK(x)`: TRUE only when x is BLANK.\n- `x = BLANK()`: TRUE when x is BLANK, **0**, empty text "" or FALSE.\n- `x == BLANK()`: strict equality, TRUE only when x is BLANK (same as ISBLANK).\n\nSo if you want to treat 0 and blank differently (for example "no orders" vs "orders that net to 0 after returns"), use ISBLANK or ==.',
      points: [
        'ISBLANK(0) = FALSE',
        '0 = BLANK() is TRUE',
        '0 == BLANK() is FALSE',
      ],
    },
    {
      heading: 'Replacing blanks: IF + ISBLANK, COALESCE and + 0',
      content: 'Three ways to show 0 instead of blank:\n\n1. `IF(ISBLANK([Total Sales]), 0, [Total Sales])`: clear and readable.\n2. `COALESCE([Total Sales], 0)`: returns the first non-blank argument; shorter and evaluates the measure once.\n3. `[Total Sales] + 0`: works because BLANK + 0 = 0, but is less readable.\n\nSide effect: Power BI shows a row only when a measure is non-blank. Once you return 0, **every** product, customer or date appears in the visual, even those with no activity. On large dimensions this creates long tables and slower reports. Replace blanks only where the business really needs zeros (for example a card or a small matrix).',
      tip: 'Prefer storing the measure as `Total Sales` and creating a separate display measure (Sales or Zero) for the few visuals that need zeros.',
    },
    {
      heading: 'Using ISBLANK to protect calculations',
      content: 'ISBLANK is also a safety check. In year-over-year growth, if this year sales are blank but last year had sales, the formula `(Curr - Prev) / Prev` gives -100%, which suggests a crash rather than "no data yet". Checking ISBLANK on both values returns BLANK instead.\n\nIn calculated columns you need CALCULATE to turn the row into a filter (context transition) before checking a sum from a related table, e.g. `ISBLANK(CALCULATE(SUM(Sales[SalesAmount])))` in the Customer table.',
    },
  ],
  examples: [
    {
      title: 'Show 0 for products with no sales',
      scenario: 'A table visual of products for 2024 hides Office Chair because it had no sales. The sales manager wants to see it with 0.',
      table: {
        headers: ['Product', 'Total Sales', 'Sales or Zero'],
        rows: [['Laptop', '5,50,000', '5,50,000'], ['Mouse', '12,000', '12,000'], ['Office Chair', '(blank)', '0'], ['Desk Lamp', '4,500', '4,500']],
      },
      steps: [
        'Select the Sales table in the Data pane, then Modeling > New measure and enter Total Sales',
        'Modeling > New measure again and enter Sales or Zero',
        'Insert a Table visual with Product[Product] and Total Sales; add a Year slicer from Date[Year] and select 2024',
        'Office Chair is missing; now add Sales or Zero to the table',
        'Office Chair appears with 0',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales or Zero = IF(ISBLANK([Total Sales]), 0, [Total Sales])`,
      result: 'All four products show; Office Chair shows 0 in Sales or Zero and blank in Total Sales.',
      explanation: 'For Office Chair no Sales rows exist in 2024, so SUM returns BLANK. ISBLANK detects it and IF returns 0. Because the row now has a non-blank measure, Power BI displays it.',
    },
    {
      title: 'Text label for a card',
      scenario: 'A card shows sales for the city chosen in a slicer. For a city/period with no sales the card shows "(Blank)", which confuses users.',
      table: {
        headers: ['Slicer selection', 'Sales Label'],
        rows: [['Pune, 2024', '6,00,000'], ['Nashik, Jan 2023 (no orders)', 'No sales']],
      },
      steps: [
        'Modeling > New measure: Sales Label (code below)',
        'Insert a Card visual and drag Sales Label into Fields',
        'Add slicers for Customer[City] and Date[Year]; test different selections',
      ],
      code: `Sales Label =
IF(
    ISBLANK([Total Sales]),
    "No sales",
    FORMAT([Total Sales], "#,##0")
)`,
      result: 'The card shows the formatted amount or the text No sales.',
      explanation: 'When the filter context has no Sales rows, Total Sales is BLANK and the measure returns friendly text. FORMAT returns text, so the measure always returns text (use it for display only, not for further maths).',
    },
    {
      title: 'Safe year-over-year growth',
      scenario: 'Show YoY growth by Year. 2023 has no previous year in the model, so growth should be blank instead of a wrong number.',
      table: {
        headers: ['Year', 'Total Sales', 'Sales PY', 'YoY %'],
        rows: [[2023, '12,00,000', '(blank)', '(blank)'], [2024, '15,00,000', '12,00,000', '25.0%']],
      },
      steps: [
        'Modeling > New measure: Sales PY',
        'Modeling > New measure: YoY % ; then Measure tools > Format > Percentage, 1 decimal',
        'Insert a Table visual with Date[Year], Total Sales, Sales PY and YoY %',
      ],
      code: `Sales PY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

YoY % =
VAR Curr = [Total Sales]
VAR Prev = [Sales PY]
RETURN
    IF(
        OR(ISBLANK(Curr), ISBLANK(Prev)),
        BLANK(),
        DIVIDE(Curr - Prev, Prev)
    )`,
      result: '2023 YoY % is blank; 2024 YoY % = (15,00,000 - 12,00,000) / 12,00,000 = 25.0%.',
      explanation: 'Without the ISBLANK(Curr) check, any period with last-year sales but no current sales would show -100%. Checking both values returns BLANK when either side is missing.',
    },
    {
      title: 'Calculated column: flag customers with no purchases',
      scenario: 'Add a Customer Status column to the Customer table so marketing can target customers who never bought.',
      table: {
        headers: ['Customer', 'City', 'Customer Status'],
        rows: [['Asha Traders', 'Pune', 'Active'], ['Sai Enterprises', 'Mumbai', 'Active'], ['Kiran Stores', 'Nagpur', 'No Purchase']],
      },
      steps: [
        'Table view (or Data pane) > select the Customer table',
        'Table tools > New column and enter the formula',
        'Use Customer Status in a slicer or as a filter on a table visual',
      ],
      code: `Customer Status =
IF(
    ISBLANK(CALCULATE(SUM(Sales[SalesAmount]))),
    "No Purchase",
    "Active"
)`,
      result: 'Customers with at least one sale are Active; customers with no Sales rows are No Purchase.',
      explanation: 'In a calculated column there is a row context, not a filter context. CALCULATE performs context transition, so the SUM is filtered to the current customer through the Customer to Sales relationship. If no rows exist, the SUM is BLANK.',
    },
  ],
  interview: [
    { q: 'What does ISBLANK() return for 0?', a: 'FALSE. Zero is a real number. ISBLANK returns TRUE only for BLANK values.', level: 'Easy' },
    { q: 'What is the difference between ISBLANK([M]), [M] = BLANK() and [M] == BLANK()?', a: 'ISBLANK and == BLANK() are TRUE only for BLANK. The = operator treats BLANK as equal to 0, empty text and FALSE, so [M] = BLANK() is also TRUE when [M] is 0.', level: 'Medium' },
    { q: 'Why does SUM return BLANK instead of 0 for a product with no sales?', a: 'There are no rows to sum in that filter context, and DAX aggregations over an empty set return BLANK. This lets Power BI hide empty rows automatically.', level: 'Easy' },
    { q: 'A manager wants 0 instead of blank everywhere. What are the risks?', a: 'Every member of the row/column fields will appear (all products, all dates), making visuals long and slower, and charts may show many zero points. Use zeros only in visuals where needed, via a separate display measure.', level: 'Hard' },
    { q: 'What is a shorter alternative to IF(ISBLANK([Total Sales]), 0, [Total Sales])?', a: 'COALESCE([Total Sales], 0). It returns the first non-blank argument and evaluates the measure once.', level: 'Easy' },
    { q: 'Scenario: YoY % shows -100% for the current month that has just started. How do you fix it?', a: 'Use VAR for current and previous values and return BLANK if either is blank (ISBLANK), or limit the calculation to dates with data. This avoids showing -100% for periods with no sales yet.', level: 'Medium' },
    { q: 'Why do you need CALCULATE when using ISBLANK on a sum inside a calculated column?', a: 'A calculated column has row context only. Without CALCULATE, SUM(Sales[SalesAmount]) would return the total of the whole Sales table for every row. CALCULATE converts the row into a filter (context transition).', level: 'Hard' },
  ],
  practice: [
    { task: 'Create a measure Qty or Zero that shows 0 when total quantity is blank.', hint: 'SUM(Sales[Quantity]) inside IF + ISBLANK.', solution: 'Qty or Zero =\nVAR Q = SUM(Sales[Quantity])\nRETURN IF(ISBLANK(Q), 0, Q)' },
    { task: 'Create a measure Sales Status that returns "No sales" when Total Sales is blank, "Loss-making" when total cost exceeds sales, else "Profitable".', hint: 'Check blank first, then compare with SUM(Sales[Cost]).', solution: 'Sales Status =\nSWITCH(\n    TRUE(),\n    ISBLANK([Total Sales]), "No sales",\n    SUM(Sales[Cost]) > [Total Sales], "Loss-making",\n    "Profitable"\n)' },
    { task: 'Rewrite Sales or Zero using COALESCE and compare the results in the DAX Lab.', hint: 'COALESCE(value, alternate).', solution: 'Sales or Zero 2 = COALESCE([Total Sales], 0)' },
    { task: 'Add a calculated column to Product named Has Sales returning TRUE/FALSE.', hint: 'Use NOT and ISBLANK with CALCULATE.', solution: 'Has Sales = NOT ISBLANK(CALCULATE(SUM(Sales[SalesAmount])))' },
  ],
  quiz: [
    { question: 'ISBLANK(0) returns:', options: ['TRUE', 'FALSE', 'BLANK', 'An error'], answer: 1, explanation: 'Zero is a value, not BLANK.' },
    { question: 'Which expression is TRUE when [Total Sales] is 0?', options: ['ISBLANK([Total Sales])', '[Total Sales] == BLANK()', '[Total Sales] = BLANK()', 'None of these'], answer: 2, explanation: 'The = operator treats BLANK and 0 as equal; ISBLANK and == are strict.' },
    { question: 'What does SUM(Sales[SalesAmount]) return for a filter context with no rows?', options: ['0', 'BLANK', 'An error', 'NULL text'], answer: 1, explanation: 'Aggregations over no rows return BLANK.' },
    { question: 'What happens in a table visual when a measure returns 0 instead of BLANK for products with no sales?', options: ['Nothing changes', 'Those products now appear as rows', 'The visual errors', 'Totals become blank'], answer: 1, explanation: 'Rows are hidden only when all measures are blank; 0 makes them visible.' },
    { question: 'Which function returns the first non-blank value among its arguments?', options: ['ISBLANK', 'IFERROR', 'COALESCE', 'FIRSTNONBLANK'], answer: 2, explanation: 'COALESCE([Total Sales], 0) returns Total Sales or 0 when blank.' },
  ],
};
