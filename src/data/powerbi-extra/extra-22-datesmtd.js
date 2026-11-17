export default {
  id: 'extra-22-datesmtd',
  title: 'DATESMTD()',
  module: 'Extra: DAX',
  extraNo: 22,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "DATESMTD() returns a table of dates from the first day of the month up to the last date in the current filter context. Inside CALCULATE() it gives month-to-date (MTD) totals for daily tracking, \"as of today\" cards and MTD vs last year comparisons.",
  objectives: [
    'Explain which dates DATESMTD() returns at day, month and year level',
    'Write MTD measures with CALCULATE() + DATESMTD() and relate them to TOTALMTD()',
    'Build MTD last year and MTD growth measures',
    'Create an "as of selected date" MTD card with a date slicer',
  ],
  theory: [
    {
      heading: 'What DATESMTD() returns',
      content: "DATESMTD() is a **table function**. It finds the **last date** visible in the current filter context and returns every date from the **1st of that month** up to that date.\n\n- Row **16-Jan-2024** (day level): returns 1-Jan-2024 to 16-Jan-2024\n- Row **2024-01** (month level): last date is 31-Jan, so it returns the whole of January\n- Row **2024** (year level): last date is 31-Dec-2024, so it returns 1-Dec to 31-Dec-2024\n\nAnalogy: the trip meter in a car that you reset on the 1st of every month. Whenever you look at it, it shows the distance driven since the 1st.",
      syntax: 'DATESMTD ( <Dates> )',
      points: [
        "<Dates>: the date column of a marked date table, e.g. 'Date'[Date]",
        'No year-end argument (months always start on the 1st)',
        'Returns a table, so it is used as a CALCULATE filter or inside COUNTROWS()',
      ],
    },
    {
      heading: 'MTD with CALCULATE, and TOTALMTD',
      content: "`MTD Sales = CALCULATE([Total Sales], DATESMTD('Date'[Date]))`\n\nCALCULATE replaces the current date filter with the MTD date list and evaluates [Total Sales].\n\n`TOTALMTD([Total Sales], 'Date'[Date])` is a shortcut that returns the same value. Use DATESMTD() when you want to add more filters or combine it with SAMEPERIODLASTYEAR(), DATEADD() or USERELATIONSHIP() in the same CALCULATE.",
      tip: 'MTD is most useful at day level (daily tracking) or with a single-date slicer. At month level it simply equals the month total.',
    },
    {
      heading: 'Same requirements as other time intelligence',
      content: "1. A continuous Date table, one row per day (our model: 1-Jan-2023 to 31-Dec-2024)\n2. Table tools > Mark as date table > Date\n3. Relationship Date[Date] → Sales[OrderDate]\n4. Date table columns on rows, axes and slicers\n\nIf you use Sales[OrderDate] on rows, days without orders are missing and the MTD running line has gaps.",
    },
    {
      heading: 'Watch the Total and Year rows',
      content: "On a Total or Year row the last visible date is the last date of the period, so MTD shows **only the last month** (for 2024 that is December: 224,409). This surprises many users.\n\nIf that is confusing, hide the value at higher levels:\n\n`IF(HASONEVALUE('Date'[YearMonth]), CALCULATE([Total Sales], DATESMTD('Date'[Date])))`",
    },
    {
      heading: 'MTD comparisons',
      content: "- **MTD last year**: `CALCULATE([MTD Sales], SAMEPERIODLASTYEAR('Date'[Date]))` gives 1st to the same day of the same month last year\n- **MTD previous month**: `CALCULATE([Total Sales], DATESMTD(DATEADD('Date'[Date], -1, MONTH)))` gives 1st to the same day of last month\n- **MTD growth %**: `DIVIDE([MTD Sales] - [MTD LY], [MTD LY])`",
      points: [
        'Compare like-for-like periods (same number of days) for a fair comparison',
        'When the selected day does not exist in the previous month (e.g. 31st), DATEADD returns the last valid day',
      ],
    },
  ],
  examples: [
    {
      title: 'Daily MTD running total for January 2024',
      scenario: 'The sales head reviews performance every day and wants to see sales so far this month.',
      table: {
        headers: ['Date', 'Total Sales', 'MTD Sales'],
        rows: [
          ['12-Jan-2024', '99,000', '99,000'],
          ['13-Jan-2024', '', '99,000'],
          ['15-Jan-2024', '', '99,000'],
          ['16-Jan-2024', '106,590', '205,590'],
          ['17-Jan-2024', '', '205,590'],
          ['18-Jan-2024', '105,572', '311,162'],
          ['31-Jan-2024', '', '311,162'],
          ['Total', '311,162', '311,162'],
        ],
      },
      steps: [
        'Mark the Date table: Table tools > Mark as date table > Date.',
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: MTD Sales (code below).',
        "Insert a Matrix. Rows: 'Date'[Date]. Values: Total Sales, MTD Sales.",
        "Add a Slicer on 'Date'[YearMonth] and select 2024-01. (Some in-between days are omitted in the table above.)",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

MTD Sales =
CALCULATE ( [Total Sales], DATESMTD ( 'Date'[Date] ) )`,
      result: 'MTD is blank from 1 to 11 January (no sales yet, rows hidden), jumps to 99,000 on the 12th, and reaches 311,162 on the 18th. It stays 311,162 until the 31st.',
      explanation: 'For each day row, DATESMTD returns 1-Jan to that day. Days with no sales still show the MTD value because earlier days in the month had sales.',
    },
    {
      title: 'MTD at month and year level',
      scenario: 'Put MTD Sales in a Year > YearMonth matrix and explain why the year row shows a small number.',
      table: {
        headers: ['Year / YearMonth', 'Total Sales', 'MTD Sales'],
        rows: [
          ['2024', '1,662,638', '224,409'],
          ['   2024-10', '6,487', '6,487'],
          ['   2024-11', '49,700', '49,700'],
          ['   2024-12', '224,409', '224,409'],
        ],
      },
      steps: [
        "Insert a Matrix. Rows: 'Date'[Year], then 'Date'[YearMonth]. Values: Total Sales, MTD Sales.",
        'Expand 2024 using the + icon (turn on Format > Row headers > +/- icons if needed).',
        'Compare the 2024 row with the 2024-12 row.',
      ],
      code: `MTD Sales =
CALCULATE ( [Total Sales], DATESMTD ( 'Date'[Date] ) )`,
      result: 'Every month row shows MTD equal to Total Sales. The 2024 year row shows 224,409, which is December 2024 only.',
      explanation: 'At month level the last date is the month end, so MTD = whole month. At year level the last date is 31-Dec-2024, so DATESMTD returns December only.',
    },
    {
      title: 'MTD vs same period last year',
      scenario: 'Compare January 2024 MTD with January 2023 MTD for the same days.',
      table: {
        headers: ['Date', 'MTD Sales', 'MTD LY', 'MTD Growth %'],
        rows: [
          ['12-Jan-2024', '99,000', '55,200', '79.35%'],
          ['16-Jan-2024', '205,590', '151,380', '35.81%'],
          ['18-Jan-2024', '311,162', '160,206', '94.23%'],
          ['31-Jan-2024', '311,162', '209,187', '48.75%'],
        ],
      },
      steps: [
        'Create MTD LY and MTD Growth % (code below). Format MTD Growth % as Percentage.',
        'Add both to the daily matrix from Example 1 (slicer on 2024-01).',
      ],
      code: `MTD LY =
CALCULATE ( [MTD Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )

MTD Growth % =
DIVIDE ( [MTD Sales] - [MTD LY], [MTD LY] )`,
      result: 'By 12 January 2023 only one order (7-Jan, 55,200) had been placed. On 16-Jan-2023 a 96,180 order arrived, so MTD LY rises to 151,380. January ends 48.75% ahead of last year.',
      explanation: 'SAMEPERIODLASTYEAR shifts the current day back one year, then the MTD logic inside [MTD Sales] expands it to 1-Jan-2023 up to that day.',
    },
    {
      title: '"As of" card with a single-date slicer',
      scenario: 'A dashboard card should show MTD sales and orders as of any date the user picks.',
      table: {
        headers: ['Selected Date', 'MTD Sales', 'MTD Orders'],
        rows: [
          ['01-Sep-2024', '2,774', '1'],
          ['19-Sep-2024', '262,914', '2'],
          ['25-Sep-2024', '315,654', '3'],
          ['24-Dec-2024', '129,954', '2'],
        ],
      },
      steps: [
        "Insert a Slicer with 'Date'[Date]. In Format > Slicer settings > Style choose Single value (or use a list slicer with Single select on).",
        "Modeling > New measure: MTD Orders = CALCULATE(COUNTROWS(Sales), DATESMTD('Date'[Date])).",
        'Insert two Cards: MTD Sales and MTD Orders.',
        'Pick 19-Sep-2024 in the slicer, then 24-Dec-2024.',
      ],
      code: `MTD Orders =
CALCULATE ( COUNTROWS ( Sales ), DATESMTD ( 'Date'[Date] ) )`,
      result: 'On 19-Sep-2024 the cards show 262,914 and 2 orders (1-Sep keyboard 2,774 + 19-Sep laptop 260,140). On 24-Dec-2024: 129,954 from 2 orders.',
      explanation: 'The slicer makes the selected date the last visible date, so DATESMTD returns the 1st of that month to the selected day.',
    },
  ],
  interview: [
    { q: 'What does DATESMTD() return?', a: 'A table of dates from the first day of the month to the last date in the current filter context.', level: 'Easy' },
    { q: 'DATESMTD vs TOTALMTD?', a: "TOTALMTD(expr, dates) = CALCULATE(expr, DATESMTD(dates)). DATESMTD is the table function and is more flexible for combining with other filters.", level: 'Easy' },
    { q: 'Why does MTD Sales on the Year row show only December?', a: 'At year level the last visible date is 31-Dec, so DATESMTD returns 1-Dec to 31-Dec. Hide it at higher levels with HASONEVALUE or ISINSCOPE if needed.', level: 'Medium' },
    { q: 'How do you calculate MTD for the same days last year?', a: "CALCULATE([MTD Sales], SAMEPERIODLASTYEAR('Date'[Date])) or CALCULATE([Total Sales], DATESMTD(SAMEPERIODLASTYEAR('Date'[Date]))).", level: 'Medium' },
    { q: 'Scenario: management wants "MTD as of yesterday" on an auto-refreshed dashboard. How?', a: "Filter the Date table to yesterday: CALCULATE([Total Sales], DATESMTD('Date'[Date]), 'Date'[Date] <= TODAY() - 1) or use a relative date filter on the page (Date is in the last 1 day, excluding today) and keep the MTD measure.", level: 'Hard' },
    { q: 'Scenario: daily MTD line chart has gaps on days without sales. Why?', a: 'The axis uses Sales[OrderDate], which has only days with orders. Use \'Date\'[Date] from the continuous Date table on the axis.', level: 'Hard' },
    { q: 'How do you compare MTD with the previous month MTD?', a: "CALCULATE([Total Sales], DATESMTD(DATEADD('Date'[Date], -1, MONTH))) gives 1st to the same day of the previous month.", level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create MTD Quantity and read it for 31-Jan-2024.',
      hint: 'Total Qty = SUM(Sales[Quantity]).',
      solution: "MTD Qty = CALCULATE([Total Qty], DATESMTD('Date'[Date])). On 31-Jan-2024 it shows 6 (2 + 2 + 2 laptops).",
    },
    {
      task: 'Rewrite MTD Sales with TOTALMTD.',
      hint: 'TOTALMTD(expression, dates).',
      solution: "MTD Sales 2 = TOTALMTD([Total Sales], 'Date'[Date]). Both measures return 205,590 on 16-Jan-2024.",
    },
    {
      task: 'Create MTD Previous Month and check it for 24-Dec-2024.',
      hint: 'DATESMTD over DATEADD(..., -1, MONTH).',
      solution: "MTD PM = CALCULATE([Total Sales], DATESMTD(DATEADD('Date'[Date], -1, MONTH))). On 24-Dec-2024 it returns 49,700 (the 19-Nov laptop order), compared with 129,954 MTD.",
    },
    {
      task: 'Show MTD only at month or day level, blank on the Year row.',
      hint: "Check HASONEVALUE('Date'[YearMonth]).",
      solution: "MTD Clean = IF(HASONEVALUE('Date'[YearMonth]), [MTD Sales]). The 2024 row becomes blank while month and day rows are unchanged.",
    },
  ],
  quiz: [
    { question: 'On the row 16-Jan-2024, DATESMTD(\'Date\'[Date]) returns:', options: ['16-Jan-2024 only', '1-Jan-2024 to 16-Jan-2024', '1-Jan-2024 to 31-Jan-2024', '16-Dec-2023 to 16-Jan-2024'], answer: 1, explanation: 'It starts on the 1st of the month and ends on the last visible date.' },
    { question: 'What is MTD Sales on 18-Jan-2024 in the practice model?', options: ['105,572', '205,590', '311,162', '99,000'], answer: 2, explanation: '99,000 + 106,590 + 105,572 = 311,162.' },
    { question: 'At month level (row 2024-11), MTD Sales equals:', options: ['Blank', 'The November 2024 total', 'YTD to November', 'December sales'], answer: 1, explanation: 'The last visible date is 30-Nov, so MTD covers the whole month.' },
    { question: 'Which function is the shortcut for CALCULATE(expr, DATESMTD(dates))?', options: ['TOTALYTD', 'TOTALQTD', 'TOTALMTD', 'DATEADD'], answer: 2, explanation: 'TOTALMTD is the scalar shortcut for month-to-date.' },
    { question: 'Why does the 2024 year row show 224,409 for MTD Sales?', options: ['It is the average month', 'The last visible date is 31-Dec-2024, so only December is included', 'It is the first month', 'It is an error'], answer: 1, explanation: 'At year level DATESMTD returns the last month of the period.' },
  ],
};
