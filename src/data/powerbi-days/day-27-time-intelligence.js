export default {
  id: 'day-27-time-intelligence',
  title: 'Time Intelligence: TOTALYTD(), TOTALMTD(), TOTALQTD(), SAMEPERIODLASTYEAR(), DATEADD()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 27,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Time intelligence functions answer the questions every business asks: "How much have we sold so far this year?", "How does this month compare with last year?" and "What is the growth vs last month?". Today you build YTD, QTD, MTD, last-year and previous-period measures on the shared Date table.',
  objectives: [
    'List the requirements for time intelligence: a proper, marked Date table with a relationship to Sales',
    'Build running totals with TOTALYTD, TOTALQTD and TOTALMTD (including fiscal year-end)',
    'Compare with the same period last year using SAMEPERIODLASTYEAR',
    'Shift periods with DATEADD for previous month, quarter or year',
    'Calculate YoY and MoM growth % safely with DIVIDE',
  ],
  theory: [
    {
      heading: 'Requirements: a good Date table',
      content:
        `Time intelligence functions work on a **date column of a Date table**, not on the date column of the fact table. The shared model already has this:\n\n- 'Date' table with one row per day from 2023-01-01 to 2024-12-31 (no gaps, no duplicates)\n- Columns Date, Year, MonthNo, Month, Quarter, YearMonth\n- Marked as date table: select the table > **Table tools > Mark as date table** > choose the Date column\n- Relationship 'Date'[Date] (1) -> Sales[OrderDate] (many)\n\nWhy? A function like SAMEPERIODLASTYEAR must find "the same dates one year earlier". It can only do that if every date exists in the Date table. If the table had only dates with sales, missing days would give wrong results.\n\nAlways put **Date table columns** (Date[Year], Date[Month], Date[YearMonth]) on visual axes and slicers, never Sales[OrderDate] or Sales[Year].\n\nBecause Date is a reserved word in DAX, the table name is written in quotes: \`'Date'[Date]\`.`,
      tip: 'Sort Date[Month] by Date[MonthNo] (Column tools > Sort by column) so months appear Jan..Dec instead of alphabetically.',
    },
    {
      heading: 'TOTALYTD, TOTALQTD, TOTALMTD: running totals within a period',
      content:
        `These functions return the expression accumulated from the **start of the year/quarter/month** up to the last date in the current filter context.\n\n- \`Sales YTD = TOTALYTD([Total Sales], 'Date'[Date])\`\n- \`Sales QTD = TOTALQTD([Total Sales], 'Date'[Date])\`\n- \`Sales MTD = TOTALMTD([Total Sales], 'Date'[Date])\`\n\nIn a visual row for March 2024, Sales YTD = sales from 1 Jan 2024 to 31 Mar 2024. It resets every 1 January.\n\n**Fiscal year**: TOTALYTD has an optional year-end date argument. For an Indian financial year (April-March):\n\`Sales FYTD = TOTALYTD([Total Sales], 'Date'[Date], "3/31")\`\n\nUnder the hood, \`TOTALYTD(expr, dates)\` = \`CALCULATE(expr, DATESYTD(dates))\`. The DATESYTD/DATESQTD/DATESMTD functions return the list of dates, which you can use when you need extra filters in the same CALCULATE.\n\nAnalogy: YTD is the odometer reading since 1 January; MTD is the trip meter you reset on the 1st of every month.`,
      syntax: `TOTALYTD ( <expression>, <dates> [, <filter>] [, <year_end_date>] )
TOTALQTD ( <expression>, <dates> [, <filter>] )
TOTALMTD ( <expression>, <dates> [, <filter>] )`,
    },
    {
      heading: 'SAMEPERIODLASTYEAR: compare with last year',
      content:
        `SAMEPERIODLASTYEAR returns the same set of dates shifted back **one year**. Used inside CALCULATE:\n\n\`Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))\`\n\n- Row March 2024 -> sales of March 2023\n- Row 2024 (year level) -> sales of the whole of 2023\n- Row Q1 2024 -> sales of Q1 2023\n\nThen growth:\n\`YoY % = DIVIDE([Total Sales] - [Sales LY], [Sales LY])\`\n\nDIVIDE protects you when last year has no data (returns BLANK instead of Infinity).\n\nYou can also combine: \`Sales YTD LY = CALCULATE([Sales YTD], SAMEPERIODLASTYEAR('Date'[Date]))\` gives last year YTD for a fair "YTD vs YTD LY" comparison.`,
      syntax: `SAMEPERIODLASTYEAR ( <dates> )`,
    },
    {
      heading: 'DATEADD: shift by any number of days, months, quarters or years',
      content:
        `DATEADD moves the current dates by a number of intervals. Negative numbers go back in time.\n\n- Previous month: \`Sales PM = CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH))\`\n- Previous quarter: \`CALCULATE([Total Sales], DATEADD('Date'[Date], -1, QUARTER))\`\n- Last year (same as SAMEPERIODLASTYEAR): \`DATEADD('Date'[Date], -1, YEAR)\`\n- Next month: \`DATEADD('Date'[Date], 1, MONTH)\`\n\nIntervals: DAY, MONTH, QUARTER, YEAR.\n\n**DATEADD vs SAMEPERIODLASTYEAR**: SAMEPERIODLASTYEAR is a shortcut for DATEADD(..., -1, YEAR). DATEADD is more flexible (any number, any interval).\n\n**DATEADD vs PREVIOUSMONTH**: PREVIOUSMONTH always returns the whole previous month based on the first date in context, while DATEADD shifts exactly the dates in context. In a monthly visual both give the same result.`,
      syntax: `DATEADD ( <dates>, <number_of_intervals>, <interval> )   -- interval: DAY | MONTH | QUARTER | YEAR`,
    },
    {
      heading: 'Growth measures and common pitfalls',
      content:
        `Standard set of measures in a sales report:\n1. \`Total Sales\` (base)\n2. \`Sales LY\` (SAMEPERIODLASTYEAR)\n3. \`YoY Growth = [Total Sales] - [Sales LY]\`\n4. \`YoY % = DIVIDE([YoY Growth], [Sales LY])\`\n5. \`Sales PM\` (DATEADD -1 MONTH) and \`MoM % = DIVIDE([Total Sales] - [Sales PM], [Sales PM])\`\n\nPitfalls:\n- Using Sales[OrderDate] instead of 'Date'[Date] - functions need a complete date column.\n- Date table not marked or missing dates - results look random.\n- **YTD shows values in future months**: after the last sale, YTD keeps showing the running total for Apr..Dec. Hide it with \`IF(ISBLANK([Total Sales]), BLANK(), [Sales YTD])\` so months without sales stay empty.\n- The Total row of a table: YTD at the grand total level is the YTD as of the last date in context (e.g. 31 Dec 2024), not the sum of the rows.`,
    },
    {
      heading: 'Mini sample monthly sales (from the Day 23 sample)',
      content:
        `- Jan: 2023 = 1,00,000; 2024 = 20,000\n- Feb: 2023 = 5,000; 2024 = 58,000 (two orders: 14 Feb 50,000 and 20 Feb 8,000)\n- Mar: 2023 = 12,000; 2024 = 62,000 (3 Mar 2,000 and 25 Mar 60,000)\n- Apr to Dec: no sales in either year\n\nYear totals: 2023 = 1,17,000; 2024 = 1,40,000. All sales are in Q1. With the full practice dataset in the DAX Lab the numbers are bigger, but you can verify the logic with these.`,
    },
  ],
  examples: [
    {
      title: 'Year-to-date, quarter-to-date and the running total',
      scenario: 'Show monthly sales and YTD/QTD for 2024.',
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Sales YTD', 'Sales QTD'],
        rows: [
          ['Jan', '20,000', '20,000', '20,000'],
          ['Feb', '58,000', '78,000', '78,000'],
          ['Mar', '62,000', '1,40,000', '1,40,000'],
          ['Apr', '', '1,40,000', ''],
          ['Total', '1,40,000', '1,40,000', ''],
        ],
      },
      steps: [
        'Check Model view: Date table is marked (Table tools > Mark as date table) and related to Sales[OrderDate]',
        'Modeling > New measure: Sales YTD (code below)',
        'Modeling > New measure: Sales QTD (code below)',
        'Insert a Table visual: Date[Month], [Total Sales], [Sales YTD], [Sales QTD]',
        'Add a Slicer with Date[Year] and select 2024',
      ],
      code: `Sales YTD =
TOTALYTD ( [Total Sales], 'Date'[Date] )

Sales QTD =
TOTALQTD ( [Total Sales], 'Date'[Date] )`,
      result: 'YTD grows 20,000 -> 78,000 -> 1,40,000 and stays at 1,40,000 for Apr-Dec. QTD equals YTD in Q1 and is blank in Apr (new quarter, no sales).',
      explanation:
        'Each row accumulates from 1 Jan (YTD) or the quarter start (QTD) to the last date of that month. Q2 starts on 1 Apr, so Apr QTD restarts and is blank because there are no Q2 sales. The Total row is evaluated at 31 Dec 2024 (Q4), so its QTD is blank.',
    },
    {
      title: 'Month-to-date at day level',
      scenario: 'Track how February 2024 sales build up day by day.',
      table: {
        headers: ['Date', 'Total Sales', 'Sales MTD'],
        rows: [
          ['13-Feb-2024', '', ''],
          ['14-Feb-2024', '50,000', '50,000'],
          ['15-Feb-2024 ... 19-Feb-2024', '', '50,000'],
          ['20-Feb-2024', '8,000', '58,000'],
          ['21-Feb-2024 ... 29-Feb-2024', '', '58,000'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales MTD (code below)',
        "Insert a Table visual with 'Date'[Date] (select Date, not Date Hierarchy, from the field dropdown), [Total Sales], [Sales MTD]",
        'Add a Slicer on Date[YearMonth] and select 2024-02',
      ],
      code: `Sales MTD =
TOTALMTD ( [Total Sales], 'Date'[Date] )`,
      result: 'MTD jumps to 50,000 on 14 Feb and to 58,000 on 20 Feb, then stays at 58,000 to month end.',
      explanation:
        'For each day, TOTALMTD sums from 1 Feb to that day. It resets on 1 March.',
    },
    {
      title: 'Same period last year and YoY %',
      scenario: 'Compare each 2024 month with the same month of 2023.',
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Sales LY', 'YoY %'],
        rows: [
          ['Jan', '20,000', '1,00,000', '-80.00%'],
          ['Feb', '58,000', '5,000', '1060.00%'],
          ['Mar', '62,000', '12,000', '416.67%'],
          ['Total (2024)', '1,40,000', '1,17,000', '19.66%'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales LY',
        'Modeling > New measure: YoY % and set Measure tools > Format to Percentage (2 decimals)',
        'Insert a Table visual with Date[Month], [Total Sales], [Sales LY], [YoY %]',
        'Year slicer = 2024',
        'Optional: Format pane > Cell elements > Font color on YoY % (rules: < 0 red, >= 0 green)',
      ],
      code: `Sales LY =
CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )

YoY % =
DIVIDE ( [Total Sales] - [Sales LY], [Sales LY] )`,
      result: 'Jan fell 80%, Feb grew 1060%, Mar grew 416.67%; the year grew 19.66% (1,40,000 vs 1,17,000).',
      explanation:
        'SAMEPERIODLASTYEAR shifts the dates of each row one year back. At the total level, the whole of 2024 is compared with the whole of 2023.',
    },
    {
      title: 'Previous month and MoM % with DATEADD',
      scenario: 'Show month-over-month growth for 2024.',
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Sales PM', 'MoM %'],
        rows: [
          ['Jan', '20,000', '(blank - Dec 2023 had no sales)', '(blank)'],
          ['Feb', '58,000', '20,000', '190.00%'],
          ['Mar', '62,000', '58,000', '6.90%'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales PM',
        'Modeling > New measure: MoM % (format as Percentage)',
        'Insert a Table visual with Date[YearMonth], [Total Sales], [Sales PM], [MoM %]',
        'Filter the visual to 2024 via the Filters pane > Filters on this visual > Date[Year] = 2024',
      ],
      code: `Sales PM =
CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, MONTH ) )

MoM % =
DIVIDE ( [Total Sales] - [Sales PM], [Sales PM] )`,
      result: 'Feb is 190% above Jan, Mar is 6.90% above Feb, Jan has no comparison.',
      explanation:
        'DATEADD shifts the visible dates back one month. DIVIDE returns BLANK in Jan because Dec 2023 sales are blank.',
    },
    {
      title: 'Fiscal year-to-date (April to March)',
      scenario: 'An Indian company reports on a financial year ending 31 March.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'Sales FYTD'],
        rows: [
          ['2023-01', '1,00,000', '1,00,000'],
          ['2023-02', '5,000', '1,05,000'],
          ['2023-03', '12,000', '1,17,000'],
          ['2023-04', '', '(blank - new FY starts)'],
          ['2024-01', '20,000', '20,000'],
          ['2024-03', '62,000', '1,40,000'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales FYTD (code below)',
        'Insert a Table visual: Date[YearMonth], [Total Sales], [Sales FYTD]',
        'Scroll to Apr 2023 and see the running total restart',
      ],
      code: `Sales FYTD =
TOTALYTD ( [Total Sales], 'Date'[Date], "3/31" )`,
      result: 'FY 2022-23 (data from Jan) ends at 1,17,000 in Mar 2023; FY 2023-24 builds 20,000 -> 78,000 -> 1,40,000 by Mar 2024.',
      explanation:
        'The year-end argument "3/31" makes the year restart on 1 April. Apr-Dec 2023 have no sales, so FYTD is blank until Jan 2024.',
    },
  ],
  interview: [
    {
      q: 'What are the requirements for time intelligence functions to work correctly?',
      a: 'A separate Date table with one row per day, continuous with no gaps covering all years in the data, a unique Date column, marked as date table, and a relationship to the fact date column. Use the Date table columns in visuals.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between TOTALYTD and DATESYTD?',
      a: 'TOTALYTD returns a value (it evaluates the expression over YTD dates). DATESYTD returns a table of dates from the start of the year to the last date in context; you use it inside CALCULATE. TOTALYTD(expr, d) = CALCULATE(expr, DATESYTD(d)).',
      level: 'Medium',
    },
    {
      q: 'How do you calculate YTD for a financial year April-March?',
      a: "TOTALYTD([Total Sales], 'Date'[Date], \"3/31\") - the last argument is the year-end date.",
      level: 'Medium',
    },
    {
      q: 'SAMEPERIODLASTYEAR vs DATEADD - which one would you use?',
      a: 'SAMEPERIODLASTYEAR is shorthand for DATEADD(dates, -1, YEAR). For last year either works; DATEADD is needed for other shifts like -1 MONTH, -1 QUARTER or -2 YEAR.',
      level: 'Medium',
    },
    {
      q: 'Write a YoY growth % measure.',
      a: "Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])); YoY % = DIVIDE([Total Sales] - [Sales LY], [Sales LY]).",
      level: 'Easy',
    },
    {
      q: 'Scenario: Your YTD line continues flat after the last sales month (Apr-Dec). How do you stop it?',
      a: "Return blank where there are no sales: Sales YTD Clean = IF(ISBLANK([Total Sales]), BLANK(), [Sales YTD]). Or compare MAX('Date'[Date]) with the last order date: IF(MIN('Date'[Date]) <= CALCULATE(MAX(Sales[OrderDate]), ALL(Sales)), [Sales YTD]).",
      level: 'Hard',
    },
    {
      q: 'Scenario: SAMEPERIODLASTYEAR returns wrong values. You used Sales[OrderDate] as the argument. Why?',
      a: 'Sales[OrderDate] only contains dates with sales and has duplicates, so the shifted set of dates is incomplete. Time intelligence needs the date column of a complete, marked Date table.',
      level: 'Hard',
    },
    {
      q: 'What does the grand total of a YTD column show?',
      a: 'YTD evaluated at the last date of the total context (e.g. end of the selected year), not the sum of the monthly YTD values.',
      level: 'Medium',
    },
    {
      q: 'How would you calculate last year YTD for a fair comparison?',
      a: "Sales YTD LY = CALCULATE([Sales YTD], SAMEPERIODLASTYEAR('Date'[Date])) or TOTALYTD([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])).",
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create Profit YTD using a Total Profit measure.',
      hint: 'Total Profit = [Total Sales] - [Total Cost], then TOTALYTD.',
      solution: `Total Profit = [Total Sales] - [Total Cost]
Profit YTD = TOTALYTD ( [Total Profit], 'Date'[Date] )
-- 2024: Jan 5,000; Feb 17,000; Mar 32,800`,
    },
    {
      task: 'Create Quantity Last Year and show it by Year.',
      hint: 'CALCULATE(SUM(Sales[Quantity]), SAMEPERIODLASTYEAR(...)).',
      solution: `Qty LY = CALCULATE ( SUM ( Sales[Quantity] ), SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
-- Row 2024 shows 15 (2023 quantity: 2 + 10 + 3)`,
    },
    {
      task: 'Create Sales Previous Quarter and QoQ %. Try it in the DAX Lab.',
      hint: 'DATEADD with -1, QUARTER.',
      solution: `Sales PQ = CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, QUARTER ) )
QoQ % = DIVIDE ( [Total Sales] - [Sales PQ], [Sales PQ] )`,
    },
    {
      task: 'Create a YTD measure that is blank for months without sales.',
      hint: 'Wrap Sales YTD in IF(ISBLANK([Total Sales]), BLANK(), ...).',
      solution: `Sales YTD Clean =
IF ( ISBLANK ( [Total Sales] ), BLANK (), TOTALYTD ( [Total Sales], 'Date'[Date] ) )`,
    },
    {
      task: 'Build a line chart comparing Total Sales and Sales LY by month for 2024.',
      hint: 'Line chart: X-axis = Date[Month], Y-axis = both measures.',
      solution: `1. Insert > Line chart
2. X-axis: Date[Month]; Y-axis: [Total Sales] and [Sales LY]
3. Year slicer = 2024
4. Format pane > Visual > Lines: set Sales LY to a dashed line style (Series = Sales LY)
Result: 2024 line 20k, 58k, 62k; LY line 100k, 5k, 12k`,
    },
  ],
  quiz: [
    {
      question: 'Which column should you pass to TOTALYTD?',
      options: ['Sales[OrderDate]', "'Date'[Date] of the marked Date table", 'Sales[Year]', "'Date'[Month]"],
      answer: 1,
      explanation: 'Time intelligence needs the complete date column of the Date table.',
    },
    {
      question: 'TOTALYTD([Total Sales], \'Date\'[Date], "3/31") calculates:',
      options: ['Sales for March only', 'Fiscal YTD with year ending 31 March', 'Sales until 31 March of every year only', 'Last year sales'],
      answer: 1,
      explanation: 'The last argument sets the fiscal year-end date.',
    },
    {
      question: "CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH)) returns:",
      options: ['Next month sales', 'Previous month sales', 'Last year sales', 'Month-to-date sales'],
      answer: 1,
      explanation: '-1 MONTH shifts the dates one month back.',
    },
    {
      question: 'SAMEPERIODLASTYEAR is equivalent to:',
      options: ["DATEADD('Date'[Date], -1, YEAR)", "DATESYTD('Date'[Date])", "PREVIOUSMONTH('Date'[Date])", "DATEADD('Date'[Date], 1, YEAR)"],
      answer: 0,
      explanation: 'Both shift the dates back by one year.',
    },
    {
      question: 'Using the mini sample, what is YoY % for 2024 (1,40,000 vs 1,17,000)?',
      options: ['16.43%', '19.66%', '23.00%', '83.57%'],
      answer: 1,
      explanation: '(1,40,000 - 1,17,000) / 1,17,000 = 0.1966 = 19.66%.',
    },
  ],
};
