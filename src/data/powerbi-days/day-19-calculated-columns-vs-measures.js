export default {
  id: 'day-19-calculated-columns-vs-measures',
  title: 'Calculated Columns vs Measures',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 19,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Calculated columns compute a value for every row and store it in the table at refresh time; measures compute an aggregated value on the fly for whatever filters the visual applies. Choosing the right one keeps your numbers correct and your model fast.',
  objectives: [
    'Create calculated columns in Table view and measures with Modeling > New measure',
    'Explain row context (columns) vs filter context (measures) in simple words',
    'Decide when to use a calculated column and when to use a measure',
    'Avoid the classic mistakes: SUM inside a column, averaging percentages, implicit measures',
  ],
  theory: [
    {
      heading: 'Calculated column: one value per row, stored',
      content:
        "A **calculated column** adds a new column to an existing table. The formula runs **once for every row** during data refresh and the result is **stored** in the model, just like an imported column.\n\nCreate it: select the table in the Data pane > **Table tools > New column** (or right-click the table > New column).\n\nExample in Sales: `Line Profit = Sales[SalesAmount] - Sales[Cost]`. For order 1059 (SalesAmount 55,200, Cost 34,435) the row gets 20,765.\n\nInside a calculated column the formula can see the **current row** directly. This is called **row context**: `Sales[SalesAmount]` means \"SalesAmount of this row\".",
      points: [
        'Computed at refresh time, not when you click a slicer',
        'Takes memory (RAM) and increases file size',
        'Can be used on rows/columns/axis/legend, in slicers and as a relationship key',
        'Does NOT react to slicers: the stored value never changes until next refresh',
      ],
    },
    {
      heading: 'Measure: one value per filter context, computed live',
      content:
        "A **measure** is a formula that returns a **single aggregated value** for the current **filter context**: whatever filters come from the visual rows, columns, slicers, page and report filters.\n\nCreate it: **Modeling > New measure** (or Home > New measure). It appears with a calculator icon in the Data pane.\n\nExample: `Total Sales = SUM(Sales[SalesAmount])`. In a matrix with Category on rows, the same measure returns 1,57,575 for Accessories and 27,47,792 for Electronics. Nothing is stored; it is calculated when the visual is drawn.\n\nAnalogy: a calculated column is like printing the price on every product label (fixed). A measure is like the billing counter computing the total of whatever is in your basket right now.",
      points: ['Computed at query time (when the visual renders)', 'Uses CPU, almost no storage', 'Responds to every slicer and filter', 'Can only be placed in Values / fields that expect numbers or text results, not on axis or slicer'],
    },
    {
      heading: 'Side-by-side comparison',
      content:
        "- **Evaluated**: Column = at refresh, row by row. Measure = at query time, per cell of the visual.\n- **Context**: Column = row context. Measure = filter context.\n- **Storage**: Column = stored, uses RAM. Measure = not stored.\n- **Reacts to slicers**: Column = no. Measure = yes.\n- **Use on axis/slicer/relationship**: Column = yes. Measure = no.\n- **Typical use**: Column = categorise or label rows (Price Band, Age Group), keys. Measure = totals, ratios, KPIs, percentages, time intelligence.\n\nRule of thumb: **If you want to slice or group by it, use a column. If you want to see a number that changes with filters, use a measure.** When both could work, prefer the measure.",
      tip: 'Many columns can be avoided completely by doing the same logic in Power Query (Add Column > Conditional Column). Power Query columns compress better than DAX calculated columns.',
    },
    {
      heading: 'Mistake 1: SUM inside a calculated column',
      content:
        "If you write `Wrong Total = SUM(Sales[SalesAmount])` as a **calculated column**, every row shows **30,94,953**: the grand total. A calculated column has row context but no filter on the table, so SUM sees all 60 rows.\n\nIf you want the row's own value, refer to the column directly (`Sales[SalesAmount]`). If you want a total, make it a **measure**.",
    },
    {
      heading: 'Mistake 2: Averaging percentages (ratio of sums vs sum of ratios)',
      content:
        "Suppose you create a column `Row Margin = DIVIDE(Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount])` and drop it into a card with **Average** aggregation. You get **29.96%**.\n\nThe correct company margin is total profit / total sales = 9,29,294 / 30,94,953 = **30.03%**. The average of row percentages gives every order equal weight, so a small 1,500 order counts as much as a 2,60,140 order.\n\nRatios must be **measures**: `Margin % = DIVIDE(SUM(Sales[SalesAmount]) - SUM(Sales[Cost]), SUM(Sales[SalesAmount]))`.",
    },
    {
      heading: 'Implicit vs explicit measures',
      content:
        "When you drag a numeric column (like SalesAmount) straight into a visual, Power BI creates an **implicit measure** (Sum of SalesAmount). It is fine for quick exploration, but:\n- It cannot be reused in other DAX formulas\n- Some features (calculation groups, Analyze in Excel in some cases) need explicit measures\n- Users can accidentally change Sum to Count\n\n**Explicit measures** (written with Modeling > New measure) are the professional way. You can also stop numeric columns from summarizing: select the column > Column tools > Summarization = Don't summarize.",
    },
  ],
  examples: [
    {
      title: 'Example 1: Calculated column Line Profit',
      scenario: 'Add the profit of each order line to the Sales table.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Cost', 'Line Profit'],
        rows: [
          ['1059', '55,200', '34,435', '20,765'],
          ['1015', '96,180', '60,509', '35,671'],
          ['1017', '8,826', '5,488', '3,338'],
          ['1026', '48,981', '33,199', '15,782'],
        ],
      },
      steps: [
        'Click Table view (grid icon on the left), select Sales in the Data pane',
        'Table tools > New column',
        'Type the formula below in the formula bar and press Enter',
        'Scroll right: the new Line Profit column appears for all 60 rows',
        'Column tools > Format: Whole number, thousands separator on',
      ],
      code: 'Line Profit = Sales[SalesAmount] - Sales[Cost]',
      result: 'Each row has its own profit, e.g. order 1059 = 55,200 - 34,435 = 20,765. The column total (if summed in a card) is 9,29,294.',
      explanation: 'Row context: the formula reads SalesAmount and Cost from the same row and stores the result.',
    },
    {
      title: 'Example 2: Calculated column used as a slicer - Price Band',
      scenario: 'Users want to slice reports by Premium (unit price 10,000 or more) vs Standard lines.',
      table: {
        headers: ['Price Band', 'Orders', 'Total Sales'],
        rows: [
          ['Premium', '28', '27,47,792'],
          ['Standard', '32', '3,47,161'],
          ['Total', '60', '30,94,953'],
        ],
      },
      steps: [
        'Table view > Sales > Table tools > New column, enter the Price Band formula',
        'Report view: insert a Slicer with Sales[Price Band]',
        'Insert a Table visual with Sales[Price Band], Orders and Total Sales measures',
      ],
      code: `Price Band = IF(Sales[UnitPrice] >= 10000, "Premium", "Standard")

-- measures used in the table
Orders = COUNTROWS(Sales)
Total Sales = SUM(Sales[SalesAmount])`,
      result: 'Premium 28 orders / 27,47,792; Standard 32 orders / 3,47,161.',
      explanation: 'You need to group and slice by the band, so it must be a column. Laptops and Mobiles (unit prices 16,327 to 56,946) are Premium.',
    },
    {
      title: 'Example 3: Same logic as a measure - Total Profit and Margin %',
      scenario: 'Show profit and margin per city that react to slicers.',
      table: {
        headers: ['City', 'Total Profit', 'Margin %'],
        rows: [
          ['Mumbai', '2,35,962', '29.45%'],
          ['Nagpur', '3,58,225', '30.52%'],
          ['Nashik', '63,798', '30.42%'],
          ['Pune', '2,71,309', '29.80%'],
          ['Total', '9,29,294', '30.03%'],
        ],
      },
      steps: [
        'Modeling > New measure for Total Profit',
        'Modeling > New measure for Margin %, then Measure tools > Format > Percentage, 2 decimals',
        'Insert a Matrix: Rows = Customer[City], Values = both measures',
        'Add a Product[Category] slicer and click Furniture: values change instantly',
      ],
      code: `Total Profit = SUM(Sales[SalesAmount]) - SUM(Sales[Cost])
Margin % = DIVIDE([Total Profit], SUM(Sales[SalesAmount]))`,
      result: 'The matrix above. Paste both measures in the DAX Lab with City on rows to verify.',
      explanation: 'Measures aggregate in filter context. Margin % is a ratio of totals, which is correct at every level including the grand total.',
    },
    {
      title: 'Example 4: The SUM-in-a-column mistake',
      scenario: 'A colleague created a column to get "% of total" but every row shows 100% of the grand total.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Wrong Total (column)'],
        rows: [
          ['1059', '55,200', '30,94,953'],
          ['1015', '96,180', '30,94,953'],
          ['1017', '8,826', '30,94,953'],
        ],
      },
      steps: [
        'Table view > Sales > New column: Wrong Total = SUM(Sales[SalesAmount])',
        'See that every row shows 30,94,953',
        'Delete the column (right-click > Delete from model)',
        'Modeling > New measure: create % of Total Sales (code below) and format as Percentage',
        'Put Product[Category] and % of Total Sales in a table visual',
      ],
      code: `% of Total Sales =
DIVIDE(
    SUM(Sales[SalesAmount]),
    CALCULATE(SUM(Sales[SalesAmount]), ALL(Sales))
)`,
      result: 'Measure output: Accessories 5.09%, Electronics 88.78%, Furniture 6.13%, Total 100.00%.',
      explanation: 'In a column SUM ignores the current row and sums everything. The measure divides the filtered total by the unfiltered total (ALL removes filters; Day 23 explains it).',
    },
    {
      title: 'Example 5: Average of row percentages vs true margin',
      scenario: 'Compare a calculated column averaged in a card with the correct measure.',
      table: {
        headers: ['Approach', 'Result'],
        rows: [
          ['Column Row Margin, card aggregation = Average', '29.96%'],
          ['Measure Margin % (ratio of totals)', '30.03%'],
        ],
      },
      steps: [
        'Table view > Sales > New column: Row Margin = DIVIDE(Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount])',
        'Report view: add a Card, drag Row Margin into it, click the dropdown on the field > Average',
        'Add a second Card with the Margin % measure',
        'Compare both cards',
      ],
      code: `Row Margin = DIVIDE(Sales[SalesAmount] - Sales[Cost], Sales[SalesAmount])   -- calculated column
Margin % = DIVIDE(SUM(Sales[SalesAmount]) - SUM(Sales[Cost]), SUM(Sales[SalesAmount]))   -- measure`,
      result: 'Card 1: 29.96%. Card 2: 30.03%.',
      explanation: 'Averaging row ratios weights every order equally. The measure weights by sales value, which is what finance means by margin.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a calculated column and a measure?',
      a: 'A calculated column is computed row by row at refresh and stored in the model; it uses row context and can be used for slicing. A measure is computed at query time for the current filter context, is not stored and reacts to slicers.',
      level: 'Easy',
    },
    {
      q: 'When would you choose a calculated column over a measure?',
      a: 'When you need the value on an axis, in a slicer, as a filter, or as a relationship key, e.g. Price Band, Age Group, a composite key. Otherwise prefer measures.',
      level: 'Easy',
    },
    {
      q: 'Why do calculated columns increase model size?',
      a: 'Their values are materialized and stored for every row in VertiPaq memory, just like imported columns, and they often compress worse than Power Query columns.',
      level: 'Medium',
    },
    {
      q: 'A calculated column with SUM(Sales[SalesAmount]) shows the same number on every row. Why?',
      a: 'Calculated columns have row context but no filter context, so SUM aggregates the whole column. Use the column reference for the row value or move the calculation to a measure.',
      level: 'Medium',
    },
    {
      q: 'Scenario: finance says your Margin % card shows 29.96% but their Excel says 30.03%. What happened?',
      a: 'The card is averaging a row-level margin column. Margin must be a measure: DIVIDE(total profit, total sales), which gives 30.03%.',
      level: 'Hard',
    },
    {
      q: 'What are implicit and explicit measures?',
      a: 'Implicit measures are auto-aggregations created by dragging a numeric column into a visual. Explicit measures are written in DAX with New measure. Explicit measures are reusable, controllable and recommended.',
      level: 'Medium',
    },
    {
      q: 'Can a measure be used in a slicer?',
      a: 'Not directly as slicer values. You can use a measure as a visual-level filter on a slicer, or use field parameters/disconnected tables for dynamic selections.',
      level: 'Medium',
    },
    {
      q: 'Should you create a calculated column in DAX or a custom column in Power Query?',
      a: 'If the logic only needs data from the same row/table, Power Query is usually better (better compression, done at source). Use DAX columns when you need model features like RELATED or other tables already in the model.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a calculated column Order Size = IF(Sales[SalesAmount] >= 100000, "Large", "Small") and count orders per size.',
      hint: 'Use Orders = COUNTROWS(Sales) by Order Size.',
      solution: 'Large 9 orders, Small 51 orders.',
    },
    {
      task: 'Create a measure Avg Order Value = DIVIDE(SUM(Sales[SalesAmount]), COUNTROWS(Sales)) and show it by Year (Sales[Year]).',
      hint: 'Year is on rows.',
      solution: '2023: 44,759.84; 2024: 59,379.93; Total 51,582.55.',
    },
    {
      task: 'Create the Line Profit column and a Total Profit measure. Show that SUM of the column equals the measure.',
      hint: 'Total Profit = SUM(Sales[SalesAmount]) - SUM(Sales[Cost]).',
      solution: 'Both give 9,29,294. For additive values both are correct, but the measure needs no storage.',
    },
    {
      task: 'In the DAX Lab, write % of Total Sales and show it by Customer[Segment].',
      hint: 'DIVIDE(SUM(...), CALCULATE(SUM(...), ALL(Sales))).',
      solution: 'Corporate 69.73%, Retail 30.27%, Total 100%.',
    },
  ],
  quiz: [
    {
      question: 'When is a calculated column evaluated?',
      options: ['Every time a slicer changes', 'At data refresh, row by row', 'Only when exported', 'Never, it is a view'],
      answer: 1,
      explanation: 'Calculated columns are computed at refresh and stored.',
    },
    {
      question: 'Which one should you use for Profit Margin %?',
      options: ['Calculated column', 'Measure', 'Power Query custom column', 'Implicit average'],
      answer: 1,
      explanation: 'Ratios must be measures so they compute correctly at every level of aggregation.',
    },
    {
      question: 'Which can be placed in a slicer?',
      options: ['Measure', 'Calculated column', 'Both', 'Neither'],
      answer: 1,
      explanation: 'Slicers need column values; measures cannot be slicer fields.',
    },
    {
      question: 'Calculated column Total = SUM(Sales[SalesAmount]) shows on every row:',
      options: ['That row amount', 'The grand total 30,94,953', 'Blank', 'An error'],
      answer: 1,
      explanation: 'There is no filter context in a column, so SUM covers all rows.',
    },
    {
      question: 'Which context does a measure mainly use?',
      options: ['Row context', 'Filter context', 'No context', 'Query folding'],
      answer: 1,
      explanation: 'Measures are evaluated in the filter context of each visual cell.',
    },
  ],
};
