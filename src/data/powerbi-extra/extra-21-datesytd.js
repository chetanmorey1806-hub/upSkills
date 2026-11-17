export default {
  id: 'extra-21-datesytd',
  title: 'DATESYTD()',
  module: 'Extra: DAX',
  extraNo: 21,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "DATESYTD() returns a table of dates from the start of the year up to the last date in the current filter context. Used inside CALCULATE() it produces year-to-date (YTD) totals, including fiscal years that do not start in January.",
  objectives: [
    'Explain what table of dates DATESYTD() returns for a given filter context',
    'Write YTD measures with CALCULATE() + DATESYTD() and compare with TOTALYTD()',
    'Create fiscal YTD measures with a year-end date such as "3/31"',
    'Build YTD previous year and YTD growth % measures',
  ],
  theory: [
    {
      heading: 'What DATESYTD() returns',
      content: "DATESYTD() is a **table function**: it returns a list of dates. Look at the **last** date visible in the current filter context and go back to 1 January of that year. All dates in between are returned.\n\n- On a matrix row for **2024-03**, the last visible date is 31-Mar-2024, so DATESYTD returns 1-Jan-2024 to 31-Mar-2024 (91 dates, 2024 is a leap year)\n- On the row for **2024** (year level), the last date is 31-Dec-2024, so it returns the full year\n\nAnalogy: a running fuel meter on a car trip. At any point it shows the total fuel used from the start of the trip (1 January) until now (the current month).",
      syntax: 'DATESYTD ( <Dates> [, <YearEndDate>] )',
      points: [
        "<Dates>: the date column of a marked date table, e.g. 'Date'[Date]",
        '<YearEndDate>: optional text such as "3/31" or "6/30" for fiscal years; default is "12/31"',
        'Returns a table, so it is used as a CALCULATE filter or inside COUNTROWS(), etc.',
      ],
    },
    {
      heading: 'DATESYTD() inside CALCULATE',
      content: "To get a YTD number, pass the date table to CALCULATE as a filter:\n\n`YTD Sales = CALCULATE([Total Sales], DATESYTD('Date'[Date]))`\n\nCALCULATE replaces the current date filter (one month) with the YTD date list (January to that month), then evaluates [Total Sales].\n\n`TOTALYTD([Total Sales], 'Date'[Date])` is a shortcut that does exactly the same thing. DATESYTD() is more flexible because you can add more filters in the same CALCULATE or combine it with other time functions.",
      tip: "Always use the Date table's column ('Date'[Date]), not Sales[OrderDate]. Time intelligence needs a continuous calendar with every date of the year.",
    },
    {
      heading: 'Requirements: a proper Date table',
      content: "Time intelligence functions work correctly only when:\n1. The Date table has **one row per day** with no gaps (our Date table covers 1-Jan-2023 to 31-Dec-2024)\n2. It is **marked as a date table**: select the table > Table tools > Mark as date table > choose Date\n3. It has a relationship to the fact table (Date[Date] → Sales[OrderDate])\n4. Visuals use columns from the Date table (Year, Month, YearMonth) on rows/axes",
    },
    {
      heading: 'Fiscal year YTD',
      content: "Many Indian companies use a financial year from **1 April to 31 March**. Pass the year-end as the second argument:\n\n`FYTD Sales = CALCULATE([Total Sales], DATESYTD('Date'[Date], \"3/31\"))`\n\nNow on the row for 2024-05 the dates returned are 1-Apr-2024 to 31-May-2024. On 2024-02 they are 1-Apr-2023 to 29-Feb-2024.\n\nThe year-end text uses month/day order. Write it without a year (\"3/31\"), and test once, because the text is interpreted using the model's locale.",
    },
    {
      heading: 'YTD of last year and YTD growth',
      content: "Combine time functions to compare this year's YTD with the same period last year:\n\n`YTD LY = CALCULATE([Total Sales], DATESYTD(SAMEPERIODLASTYEAR('Date'[Date])))`\n\nor simply `CALCULATE([YTD Sales], SAMEPERIODLASTYEAR('Date'[Date]))`.\n\nThen `YTD Growth % = DIVIDE([YTD Sales] - [YTD LY], [YTD LY])`.",
      points: [
        'Use DIVIDE() to avoid errors when last year has no data',
        'For the earliest year in the Date table (2023), YTD LY is blank because 2022 is not in the calendar',
      ],
    },
  ],
  examples: [
    {
      title: 'YTD sales by month for 2024',
      scenario: 'Management wants a running total of sales for 2024 that restarts every January.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'YTD Sales'],
        rows: [
          ['2024-01', '311,162', '311,162'],
          ['2024-02', '20,214', '331,376'],
          ['2024-03', '183,478', '514,854'],
          ['2024-04', '15,045', '529,899'],
          ['2024-05', '10,576', '540,475'],
          ['2024-06', '25,826', '566,301'],
          ['2024-07', '322,359', '888,660'],
          ['2024-08', '177,728', '1,066,388'],
          ['2024-09', '315,654', '1,382,042'],
          ['2024-10', '6,487', '1,388,529'],
          ['2024-11', '49,700', '1,438,229'],
          ['2024-12', '224,409', '1,662,638'],
          ['Total', '1,662,638', '1,662,638'],
        ],
      },
      steps: [
        'Make sure the Date table is marked: select Date in the Data pane > Table tools > Mark as date table > Date column: Date.',
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: YTD Sales (code below).',
        "Insert a Matrix. Rows: 'Date'[YearMonth]. Values: Total Sales, YTD Sales.",
        "Add a Slicer on 'Date'[Year] and select 2024.",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

YTD Sales =
CALCULATE ( [Total Sales], DATESYTD ( 'Date'[Date] ) )`,
      result: 'YTD grows every month and reaches 1,662,638 in December, equal to the 2024 total. With 2023 selected, December YTD is 1,432,315.',
      explanation: 'For each month row, DATESYTD returns 1-Jan-2024 to the last day of that month, and CALCULATE sums sales over those dates.',
    },
    {
      title: 'Indian financial year YTD (April to March)',
      scenario: 'Accounts follow the April–March financial year. Show FYTD next to calendar YTD.',
      table: {
        headers: ['YearMonth', 'Total Sales', 'YTD Sales', 'FYTD Sales'],
        rows: [
          ['2024-01', '311,162', '311,162', '1,161,609'],
          ['2024-02', '20,214', '331,376', '1,181,823'],
          ['2024-03', '183,478', '514,854', '1,365,301'],
          ['2024-04', '15,045', '529,899', '15,045'],
          ['2024-05', '10,576', '540,475', '25,621'],
          ['2024-06', '25,826', '566,301', '51,447'],
          ['2024-12', '224,409', '1,662,638', '1,147,784'],
        ],
      },
      steps: [
        'Modeling > New measure: FYTD Sales (code below).',
        'Add FYTD Sales to the matrix from Example 1 (2024 selected).',
        'Scroll to April and see the FYTD restart.',
      ],
      code: `FYTD Sales =
CALCULATE ( [Total Sales], DATESYTD ( 'Date'[Date], "3/31" ) )`,
      result: 'FYTD for March 2024 is 1,365,301 (sales from 1-Apr-2023 to 31-Mar-2024). In April 2024 it restarts at 15,045.',
      explanation: 'With year-end "3/31", the year starts on 1 April. For January to March 2024 the range begins on 1-Apr-2023, so it includes April–December 2023 sales (850,447).',
    },
    {
      title: 'YTD vs last year YTD and growth %',
      scenario: 'Compare 2024 YTD with the same period of 2023 to see if the business is ahead.',
      table: {
        headers: ['YearMonth', 'YTD Sales', 'YTD LY', 'YTD Growth %'],
        rows: [
          ['2024-01', '311,162', '209,187', '48.75%'],
          ['2024-03', '514,854', '581,868', '-11.52%'],
          ['2024-06', '566,301', '899,719', '-37.06%'],
          ['2024-09', '1,382,042', '1,182,072', '16.92%'],
          ['2024-12', '1,662,638', '1,432,315', '16.08%'],
        ],
      },
      steps: [
        'Create YTD LY and YTD Growth % with the code below. Format YTD Growth % as Percentage.',
        'Add both measures to the 2024 matrix.',
        'Optional: Format > Cell elements > Font color rules: red when YTD Growth % < 0, green when >= 0.',
      ],
      code: `YTD LY =
CALCULATE ( [Total Sales], DATESYTD ( SAMEPERIODLASTYEAR ( 'Date'[Date] ) ) )

YTD Growth % =
DIVIDE ( [YTD Sales] - [YTD LY], [YTD LY] )`,
      result: '2024 started strong (+48.75% in January), fell behind by June (-37.06%), and finished the year 16.08% ahead of 2023.',
      explanation: 'SAMEPERIODLASTYEAR shifts the visible dates back one year, and DATESYTD then expands them to the year-to-date range of 2023.',
    },
    {
      title: 'See the dates DATESYTD returns',
      scenario: 'To understand the function, count the days and orders inside the YTD window.',
      table: {
        headers: ['YearMonth', 'YTD Days', 'YTD Orders'],
        rows: [
          ['2023-03', '90', '11'],
          ['2024-02', '60', '6'],
          ['2024-03', '91', '8'],
          ['2024-12', '366', '28'],
        ],
      },
      steps: [
        "Modeling > New measure: YTD Days = COUNTROWS(DATESYTD('Date'[Date])).",
        "Modeling > New measure: YTD Orders = CALCULATE(COUNTROWS(Sales), DATESYTD('Date'[Date])).",
        "Insert a Matrix with 'Date'[YearMonth] on rows and both measures. Remove the Year slicer.",
      ],
      code: `YTD Days = COUNTROWS ( DATESYTD ( 'Date'[Date] ) )

YTD Orders =
CALCULATE ( COUNTROWS ( Sales ), DATESYTD ( 'Date'[Date] ) )`,
      result: 'March 2024 has 91 YTD days (31 + 29 + 31) versus 90 in March 2023, because 2024 is a leap year. 2024 has 28 orders in total.',
      explanation: 'COUNTROWS on the table returned by DATESYTD shows exactly how many calendar dates are in the YTD window. The window always starts on 1 January.',
    },
  ],
  interview: [
    { q: 'What does DATESYTD() return?', a: 'A one-column table of dates from the start of the year to the last date in the current filter context.', level: 'Easy' },
    { q: 'DATESYTD vs TOTALYTD?', a: 'TOTALYTD(expr, dates) is shorthand for CALCULATE(expr, DATESYTD(dates)). DATESYTD is a table function and can be combined with other filters or functions in one CALCULATE; TOTALYTD returns the scalar directly.', level: 'Medium' },
    { q: 'How do you calculate fiscal YTD for an April to March year?', a: 'CALCULATE([Total Sales], DATESYTD(\'Date\'[Date], "3/31")). The second argument is the year-end date.', level: 'Medium' },
    { q: 'Why must the Date table be marked as a date table?', a: 'Marking tells Power BI which column is the continuous date column, validates there are no gaps or duplicates, and ensures time intelligence works even when relationships use other columns. Without a complete calendar, YTD windows can be wrong.', level: 'Medium' },
    { q: 'Scenario: your YTD measure shows the same value as monthly sales. What is wrong?', a: "Most likely the matrix uses Sales[Month] or Sales[OrderDate] instead of Date table columns, or DATESYTD uses Sales[OrderDate]. Use 'Date'[Date] in the function and Date table columns in the visual.", level: 'Hard' },
    { q: 'How do you write YTD for the previous year?', a: "CALCULATE([Total Sales], DATESYTD(SAMEPERIODLASTYEAR('Date'[Date]))) or CALCULATE([YTD Sales], SAMEPERIODLASTYEAR('Date'[Date])).", level: 'Medium' },
    { q: 'Scenario: the Total row of a 2024 YTD matrix shows the 2024 total even though rows are months. Why?', a: 'On the Total row the filter context contains all of 2024 (Year slicer). The last visible date is 31-Dec-2024, so the YTD window is the full year.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create YTD Quantity and check its December 2024 value.',
      hint: 'Total Qty = SUM(Sales[Quantity]).',
      solution: "YTD Qty = CALCULATE([Total Qty], DATESYTD('Date'[Date])). December 2024 shows 82, the full 2024 quantity.",
    },
    {
      task: 'Rewrite YTD Sales with TOTALYTD and confirm both match.',
      hint: 'TOTALYTD(expression, dates).',
      solution: "YTD Sales 2 = TOTALYTD([Total Sales], 'Date'[Date]). Both show 514,854 for March 2024.",
    },
    {
      task: 'Create an Electronics YTD measure.',
      hint: 'Add a second filter in the same CALCULATE.',
      solution: "Electronics YTD = CALCULATE([Total Sales], DATESYTD('Date'[Date]), Product[Category] = \"Electronics\"). December 2024 = 1,565,941.",
    },
    {
      task: 'Create a fiscal YTD that ends on 30 June and read its value for June 2024.',
      hint: 'Use "6/30" as the year-end.',
      solution: "FYTD Jun = CALCULATE([Total Sales], DATESYTD('Date'[Date], \"6/30\")). June 2024 covers 1-Jul-2023 to 30-Jun-2024: 532,596 (Jul–Dec 2023) + 566,301 (Jan–Jun 2024) = 1,098,897.",
    },
  ],
  quiz: [
    { question: 'For the row 2024-03, which dates does DATESYTD(\'Date\'[Date]) return?', options: ['1-Mar-2024 to 31-Mar-2024', '1-Jan-2024 to 31-Mar-2024', '1-Apr-2023 to 31-Mar-2024', 'All dates of 2024'], answer: 1, explanation: 'It starts on 1 January of the year of the last visible date.' },
    { question: 'Which argument creates an April–March fiscal YTD?', options: ['"4/1"', '"3/31"', '"12/31"', '"FY"'], answer: 1, explanation: 'The second argument is the year-end date, 31 March.' },
    { question: 'What is YTD Sales for 2024-02 in the practice model?', options: ['20,214', '311,162', '331,376', '514,854'], answer: 2, explanation: 'January 311,162 + February 20,214 = 331,376.' },
    { question: 'TOTALYTD([Total Sales], \'Date\'[Date]) is equivalent to:', options: ["CALCULATE([Total Sales], DATESYTD('Date'[Date]))", "SUMX(DATESYTD('Date'[Date]), [Total Sales])", "DATESYTD([Total Sales])", "CALCULATE([Total Sales], DATESMTD('Date'[Date]))"], answer: 0, explanation: 'TOTALYTD is shorthand for CALCULATE with DATESYTD.' },
    { question: 'Why is YTD LY blank for 2023 months?', options: ['A bug', 'The Date table has no 2022 dates and there are no 2022 sales', 'DATESYTD does not work for 2023', 'SAMEPERIODLASTYEAR needs a slicer'], answer: 1, explanation: 'Shifting 2023 back one year leaves the calendar range, so there is nothing to sum.' },
  ],
};
