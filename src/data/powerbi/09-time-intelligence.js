export default {
  id: 'time-intelligence',
  title: 'Time Intelligence in DAX',
  level: 'Advanced',
  day: 9,
  duration: '5 hours',
  summary:
    'Time intelligence compares measures across periods: year-to-date, previous year, month-over-month, rolling averages and running totals. Learn to build and mark a proper Date table, then use TOTALYTD, DATESYTD, SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, PREVIOUSMONTH, DATESINPERIOD and fiscal-year variants.',
  objectives: [
    'List the requirements of a valid Date table and create one with CALENDAR/CALENDARAUTO + ADDCOLUMNS',
    'Mark a table as a date table and explain why it matters',
    'Calculate YTD, QTD, MTD with TOTALxTD and DATESxTD, including fiscal years',
    'Compare periods with SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD and PREVIOUSMONTH',
    'Build YoY %, MoM %, rolling 3/12-month totals and averages, and running totals',
    'Avoid common pitfalls: incomplete date tables, future dates, wrong column used in time functions',
  ],
  theory: [
    {
      heading: 'Date table requirements',
      content:
        `All DAX time intelligence functions need a proper **Date (calendar) table**. Requirements:\n\n1. A column of data type **Date** (or Date/Time with midnight times) – the key column.\n2. **Unique** values – one row per day.\n3. **Contiguous** – no missing days between the first and last date.\n4. Covers **complete years** (1 January to 31 December, or full fiscal years) for all dates in the fact tables.\n5. No blank values.\n\nThe Date table has a **1:* relationship** from 'Date'[Date] to each fact date column (Sales[OrderDate]), single direction. Fact dates should be pure dates (no time part) – if the source has datetime, split date and time in Power Query.\n\nAdd useful attribute columns: Year, Quarter, MonthNumber, MonthName (sorted by MonthNumber), Year Month, Week, Weekday, IsWeekend, Fiscal Year, Fiscal Quarter, etc.`,
      tip: 'Turn off Auto date/time (File → Options → Data Load). It creates hidden date tables per date column and does not support fiscal calendars or sharing across facts.',
    },
    {
      heading: 'Creating a Date table with DAX: CALENDAR, CALENDARAUTO, ADDCOLUMNS',
      content:
        `- **CALENDAR(start_date, end_date)** returns a single-column table named **Date** with every day in the range.\n- **CALENDARAUTO([fiscal_year_end_month])** scans all date columns in the model (excluding calculated columns/tables) and returns full years covering them. With 6 as argument, years run July–June. Risk: a birthdate column from 1950 makes the calendar start in 1950.\n- **ADDCOLUMNS(table, "Name", expr, ...)** adds calculated columns to the generated table.\n\nYou can also build the Date table in **Power Query** (List.Dates) or take it from the data warehouse – best for reuse across models.`,
      syntax: `Date =
VAR MinYear = YEAR ( MIN ( Sales[OrderDate] ) )
VAR MaxYear = YEAR ( MAX ( Sales[OrderDate] ) )
RETURN
    ADDCOLUMNS (
        CALENDAR ( DATE ( MinYear, 1, 1 ), DATE ( MaxYear, 12, 31 ) ),
        "Year", YEAR ( [Date] ),
        "Quarter", "Q" & QUARTER ( [Date] ),
        "MonthNumber", MONTH ( [Date] ),
        "MonthName", FORMAT ( [Date], "MMM" ),
        "Year Month", FORMAT ( [Date], "YYYY-MM" ),
        "YearMonthKey", YEAR ( [Date] ) * 100 + MONTH ( [Date] ),
        "Weekday", FORMAT ( [Date], "ddd" ),
        "WeekdayNumber", WEEKDAY ( [Date], 2 ),
        "IsWeekend", WEEKDAY ( [Date], 2 ) > 5
    )`,
    },
    {
      heading: 'Mark as date table',
      content:
        `Select the Date table → **Table tools → Mark as date table** → choose the Date column. Power BI validates the requirements (unique, contiguous, no blanks).\n\nWhy mark it:\n\n- Time intelligence works correctly even when the relationship uses a column that is not of Date type (e.g., an integer DateKey 20240131): marking tells DAX which column holds the dates.\n- When you filter the marked date column in CALCULATE (e.g., time intelligence functions), DAX automatically removes filters from the other columns of the Date table (adds \`REMOVEFILTERS('Date')\`), so filters on Year or Month do not conflict with the new date filter.\n- Power BI stops creating auto date hierarchies for this table, and Q&A/visuals know it is a calendar.`,
      tip: 'If the relationship is on a Date-type column, DAX already applies the REMOVEFILTERS behaviour automatically, but marking the table is still best practice and required with integer keys.',
    },
    {
      heading: 'Period-to-date: TOTALYTD/QTD/MTD and DATESYTD/QTD/MTD',
      content:
        `**TOTALYTD(expression, dates, [filter], [year_end_date])** returns the expression evaluated from the start of the year to the last date in the current context. It is syntax sugar for \`CALCULATE(expression, DATESYTD(dates, [year_end_date]))\`.\n\n**TOTALQTD** and **TOTALMTD** do the same for quarter- and month-to-date (no year_end parameter).\n\n**DATESYTD / DATESQTD / DATESMTD** return the **table of dates** to be used as a CALCULATE filter – more flexible because you can combine them with other filters or use them inside other functions.\n\n**Fiscal year**: pass the year-end date as text "month/day": \`TOTALYTD([Total Sales], 'Date'[Date], "3/31")\` for an April–March fiscal year, \`"6/30"\` for July–June.`,
      syntax: `Sales YTD  = TOTALYTD ( [Total Sales], 'Date'[Date] )
Sales QTD  = TOTALQTD ( [Total Sales], 'Date'[Date] )
Sales MTD  = TOTALMTD ( [Total Sales], 'Date'[Date] )
Sales FYTD = CALCULATE ( [Total Sales], DATESYTD ( 'Date'[Date], "3/31" ) )`,
      tip: 'The year_end_date is a text string with month and day only (the year part is ignored), e.g. "3/31" or "6/30". It is parsed using the model locale, so verify the result once in your model.',
    },
    {
      heading: 'Comparing with previous periods: SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, PREVIOUSx',
      content:
        `- **SAMEPERIODLASTYEAR(dates)** – shifts the current dates back exactly one year (Mar 2024 → Mar 2023; YTD to 15 May 2024 → same days in 2023). Equivalent to \`DATEADD(dates, -1, YEAR)\`.\n- **DATEADD(dates, n, DAY|MONTH|QUARTER|YEAR)** – shifts the selected dates by n intervals; the most flexible (previous month, next quarter, 7 days ago…). Keeps the **same shape** (partial periods stay partial).\n- **PARALLELPERIOD(dates, n, MONTH|QUARTER|YEAR)** – shifts AND expands to **full periods**: in a cell for March 2024, \`PARALLELPERIOD('Date'[Date], -1, YEAR)\` returns the whole year 2023.\n- **PREVIOUSDAY / PREVIOUSMONTH / PREVIOUSQUARTER / PREVIOUSYEAR(dates)** – return the full previous period based on the **first date** in the current context. NEXTx functions go forward.\n\nAll these return tables of dates and are used as CALCULATE filter arguments.`,
      points: [
        'Shift with same shape → DATEADD / SAMEPERIODLASTYEAR',
        'Full previous period regardless of the selection → PARALLELPERIOD / PREVIOUSx',
        'They need contiguous dates – a gap in the Date table causes wrong results or errors.',
      ],
    },
    {
      heading: 'Growth measures: YoY %, MoM %',
      content:
        `Growth = (current − previous) / previous. Build base measures first, then the growth measure:\n\n- \`Sales PY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))\`\n- \`Sales YoY = [Total Sales] - [Sales PY]\`\n- \`Sales YoY % = DIVIDE([Sales YoY], [Sales PY])\`\n\nUse DIVIDE so that the first year (no previous data) returns BLANK, not an error. Often you also want to hide growth when the current period has no data: \`IF(ISBLANK([Total Sales]), BLANK(), ...)\`.`,
    },
    {
      heading: 'Rolling periods and moving averages with DATESINPERIOD',
      content:
        `**DATESINPERIOD(dates, start_date, number_of_intervals, interval)** returns dates starting at start_date and extending forward (positive) or backward (negative) by n intervals.\n\nRolling 12 months ending at the last visible date:\n\n\`CALCULATE([Total Sales], DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -12, MONTH))\`\n\nFor a rolling **average** per month, divide by the number of months that actually have data or iterate months: \`AVERAGEX(VALUES('Date'[Year Month]), [Total Sales])\` inside the same CALCULATE.\n\n**DATESBETWEEN(dates, start, end)** returns dates in an explicit range – useful for custom windows such as "last 30 days" or running totals.`,
    },
    {
      heading: 'Running (cumulative) totals and common pitfalls',
      content:
        `A running total sums from the beginning of time (or a period start) up to the last date in the current context:\n\n\`\`\`\nRunning Total =\nVAR MaxDate = MAX ( 'Date'[Date] )\nRETURN\n    CALCULATE ( [Total Sales], 'Date'[Date] <= MaxDate, REMOVEFILTERS ( 'Date' ) )\n\`\`\`\n\nREMOVEFILTERS('Date') clears Year/Month filters from the visual; the boolean filter keeps dates up to the current one. YTD is a running total that resets each year.\n\nPitfalls:`,
      points: [
        'Using Sales[OrderDate] instead of \'Date\'[Date] in time intelligence functions → wrong results (fact dates are not contiguous).',
        'Date table that does not cover full years → YTD/PY shift errors.',
        'Future dates in the Date table make YTD/running totals show flat lines into the future. Hide them with a column IsPastDate or a check like IF(MIN(\'Date\'[Date]) <= MAX(Sales[OrderDate]), ...).',
        'Comparing a partial current month with a full previous month → misleading MoM. Compare like-for-like periods (e.g., same number of days).',
        'Time intelligence on datetime fact columns with time parts → no matches; strip the time.',
      ],
    },
  ],
  examples: [
    {
      title: 'Complete Date table with fiscal columns (DAX)',
      scenario: 'Create a Date table covering the Sales data, with an April–March fiscal year.',
      code: `Date =
VAR MinYear = YEAR ( MIN ( Sales[OrderDate] ) )
VAR MaxYear = YEAR ( MAX ( Sales[OrderDate] ) )
RETURN
    ADDCOLUMNS (
        CALENDAR ( DATE ( MinYear - 1, 4, 1 ), DATE ( MaxYear + 1, 3, 31 ) ),
        "Year", YEAR ( [Date] ),
        "Quarter", "Q" & QUARTER ( [Date] ),
        "MonthNumber", MONTH ( [Date] ),
        "MonthName", FORMAT ( [Date], "MMM" ),
        "Year Month", FORMAT ( [Date], "YYYY-MM" ),
        "Fiscal Year", "FY" & IF ( MONTH ( [Date] ) >= 4, YEAR ( [Date] ) + 1, YEAR ( [Date] ) ),
        "Fiscal Month No", MOD ( MONTH ( [Date] ) - 4, 12 ) + 1,
        "Fiscal Quarter", "FQ" & ( INT ( MOD ( MONTH ( [Date] ) - 4, 12 ) / 3 ) + 1 )
    )

-- Then: Mark as date table on [Date]; sort MonthName by MonthNumber;
-- relationship 'Date'[Date] 1:* Sales[OrderDate]`,
      result: '15-May-2024 → Fiscal Year FY2025, Fiscal Month No 2, Fiscal Quarter FQ1',
      explanation:
        'The calendar covers complete fiscal years. MOD(MONTH - 4, 12) + 1 maps April→1 … March→12 (DAX MOD returns a non-negative result for a positive divisor, so January gives MOD(-3,12) = 9 → 10). Fiscal quarter derives from the fiscal month.',
    },
    {
      title: 'YTD, QTD, MTD and fiscal YTD',
      scenario: 'Show calendar and fiscal year-to-date sales in a matrix by month.',
      code: `Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )

Sales QTD = TOTALQTD ( [Total Sales], 'Date'[Date] )

Sales MTD = TOTALMTD ( [Total Sales], 'Date'[Date] )

Sales FYTD = TOTALYTD ( [Total Sales], 'Date'[Date], "3/31" )

-- Equivalent with DATESYTD:
Sales YTD (v2) = CALCULATE ( [Total Sales], DATESYTD ( 'Date'[Date] ) )`,
      table: {
        headers: ['Month', 'Total Sales', 'Sales YTD'],
        rows: [
          ['Jan 2024', '100', '100'],
          ['Feb 2024', '150', '250'],
          ['Mar 2024', '120', '370'],
        ],
      },
      explanation:
        'For each month cell, DATESYTD returns all dates from 1 January to the last date of that month, and CALCULATE evaluates Total Sales over them. The fiscal version resets on 1 April.',
    },
    {
      title: 'Previous year and YoY %',
      scenario: 'Compare each month with the same month last year.',
      code: `Sales PY =
CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )

Sales YoY = [Total Sales] - [Sales PY]

Sales YoY % =
IF (
    NOT ISBLANK ( [Total Sales] ),
    DIVIDE ( [Sales YoY], [Sales PY] )
)

Sales PY YTD =
CALCULATE ( [Sales YTD], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )`,
      result: 'Mar 2024 = 120, Mar 2023 = 100 → YoY = 20, YoY % = 20%',
      explanation:
        'SAMEPERIODLASTYEAR shifts the dates in context back one year. The IF prevents showing -100% for future months without sales. Sales PY YTD applies the shift on top of the YTD measure, giving last year\'s YTD up to the same day.',
    },
    {
      title: 'Previous month and MoM % with DATEADD and PREVIOUSMONTH',
      scenario: 'Month-over-month growth in a monthly line chart.',
      code: `Sales PM = CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, MONTH ) )

Sales PM (full) = CALCULATE ( [Total Sales], PREVIOUSMONTH ( 'Date'[Date] ) )

Sales MoM % = DIVIDE ( [Total Sales] - [Sales PM], [Sales PM] )`,
      explanation:
        'At month level both previous-month measures return the same value. They differ at day level: on 15 March, DATEADD returns 15 February (same shape, one day), while PREVIOUSMONTH returns the entire month of February (based on the first date in context).',
    },
    {
      title: 'PARALLELPERIOD vs SAMEPERIODLASTYEAR',
      scenario: 'Show full last-year sales next to each month for context.',
      table: {
        headers: ['Month', 'Total Sales', 'Sales PY (SPLY)', 'Sales Full PY (PARALLELPERIOD)'],
        rows: [
          ['Jan 2024', '100', '80', '1,200'],
          ['Feb 2024', '150', '90', '1,200'],
        ],
      },
      code: `Sales Full PY =
CALCULATE ( [Total Sales], PARALLELPERIOD ( 'Date'[Date], -1, YEAR ) )`,
      explanation:
        'SAMEPERIODLASTYEAR keeps the same shape (January → January last year). PARALLELPERIOD with YEAR expands to the whole previous year, so every month in 2024 shows total 2023 sales (1,200). Useful for "% of last year total" measures.',
    },
    {
      title: 'Rolling 3 and 12 months with DATESINPERIOD',
      scenario: 'Smooth seasonality with rolling totals and a rolling 3-month average.',
      code: `Sales R3M =
CALCULATE (
    [Total Sales],
    DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH )
)

Sales R12M =
CALCULATE (
    [Total Sales],
    DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -12, MONTH )
)

Sales R3M Avg =
CALCULATE (
    AVERAGEX ( VALUES ( 'Date'[Year Month] ), [Total Sales] ),
    DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH )
)`,
      explanation:
        'For the cell of March 2024, MAX(\'Date\'[Date]) = 31-Mar-2024; DATESINPERIOD returns 1-Jan-2024 to 31-Mar-2024 (3 months back including the current one). The average version iterates the months in that window and averages their totals; months without sales return BLANK and are ignored by AVERAGEX.',
    },
    {
      title: 'Running total and hiding future dates',
      scenario: 'Cumulative sales across all time, blank for dates after the last sale.',
      code: `Sales Running Total =
VAR MaxDate = MAX ( 'Date'[Date] )
VAR LastSaleDate = CALCULATE ( MAX ( Sales[OrderDate] ), REMOVEFILTERS ( 'Date' ) )
RETURN
    IF (
        MIN ( 'Date'[Date] ) <= LastSaleDate,
        CALCULATE (
            [Total Sales],
            'Date'[Date] <= MaxDate,
            REMOVEFILTERS ( 'Date' )
        )
    )`,
      explanation:
        'REMOVEFILTERS(\'Date\') clears the year/month filters of the current cell, and the boolean predicate keeps all dates up to the current cell\'s last date. LastSaleDate is computed over all dates so the measure returns BLANK for months entirely after the latest sale, preventing a flat line into the future.',
    },
  ],
  interview: [
    {
      q: 'What are the requirements of a Date table in Power BI?',
      a: `One row per day (unique dates), contiguous with no gaps, covering complete years (calendar or fiscal) spanning all fact dates, a Date-type column without blanks, related 1:* to the fact date columns. Then mark it as a date table. Fact date columns should not include times.`,
      level: 'Easy',
    },
    {
      q: 'Why do we mark a table as a date table?',
      a: `It tells Power BI which column is the calendar key so time intelligence works correctly – especially when relationships use a non-date key (e.g., integer DateKey). When the date column is filtered in CALCULATE, DAX automatically removes other filters on the Date table so period filters don't conflict with Year/Month filters. It also disables auto date/time hierarchies for that table and validates uniqueness/contiguity.`,
      level: 'Medium',
    },
    {
      q: 'CALENDAR vs CALENDARAUTO?',
      a: `CALENDAR(start, end) creates dates in an explicit range – full control (often computed from MIN/MAX of the fact). CALENDARAUTO([fiscal_year_end_month]) scans all date columns in the model and builds full years covering them. CALENDARAUTO is convenient but risky: an unrelated date column (birth dates, 1900-01-01 defaults) can make the table span decades, bloating it and producing weird visuals.`,
      level: 'Easy',
    },
    {
      q: 'What is the difference between TOTALYTD and DATESYTD?',
      a: `TOTALYTD(expr, dates, [filter], [year_end]) is a shortcut returning a scalar: CALCULATE(expr, DATESYTD(dates, [year_end])). DATESYTD returns a **table** of dates from the start of the year to the last date in context, which can be combined with other filters in CALCULATE or used in other functions (e.g., COUNTROWS(DATESYTD(...))). Results are identical when used equivalently.`,
      level: 'Medium',
    },
    {
      q: 'SAMEPERIODLASTYEAR vs DATEADD vs PARALLELPERIOD?',
      a: `- **SAMEPERIODLASTYEAR(dates)** = DATEADD(dates, -1, YEAR): shifts the selection back one year keeping its shape.\n- **DATEADD(dates, n, interval)**: shifts by any number of days/months/quarters/years, same shape.\n- **PARALLELPERIOD(dates, n, interval)**: shifts and returns **complete** periods of the interval: in March 2024, PARALLELPERIOD(-1, YEAR) returns the entire 2023.\n\nUse DATEADD/SPLY for like-for-like comparison and PARALLELPERIOD for full-period references.`,
      level: 'Medium',
    },
    {
      q: 'How do you calculate YoY growth %?',
      a: `\`\`\`\nSales PY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))\nSales YoY % = DIVIDE([Total Sales] - [Sales PY], [Sales PY])\n\`\`\`\nDIVIDE returns BLANK when there is no prior-year data. Optionally hide the result when current sales are blank (future periods) to avoid showing -100%.`,
      level: 'Easy',
    },
    {
      q: 'How do you calculate a rolling 12-month total?',
      a: `\`\`\`\nSales R12M =\nCALCULATE([Total Sales], DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -12, MONTH))\n\`\`\`\nDATESINPERIOD returns 12 months of dates ending at the last date in context. Optionally return BLANK when fewer than 12 months of history exist (count months with data using COUNTROWS of a filtered month list).`,
      level: 'Medium',
    },
    {
      q: 'How do you implement a fiscal year that starts in April?',
      a: `- In time intelligence, pass the year end: \`TOTALYTD([Total Sales], 'Date'[Date], "3/31")\` or \`DATESYTD('Date'[Date], "3/31")\`.\n- In the Date table, add Fiscal Year (e.g., "FY" & IF(MONTH>=4, YEAR+1, YEAR)), Fiscal Quarter and Fiscal Month No columns for grouping and sorting.\n- Build the calendar to cover full fiscal years (1 Apr – 31 Mar), e.g., CALENDARAUTO(3).\n- SAMEPERIODLASTYEAR and DATEADD work unchanged because they shift dates, not labels.\n\nFor non-standard calendars (4-4-5, 52/53-week retail), standard functions do not work – use custom columns (period index) and DAX with FILTER/ALL or the newer calendar-based time intelligence.`,
      level: 'Hard',
    },
    {
      q: 'Why should you not use the fact table date column in time intelligence functions?',
      a: `Time intelligence functions need a contiguous set of dates. A fact column has gaps (days without sales) and duplicates, so DATEADD/SAMEPERIODLASTYEAR may return incomplete results or errors ("contiguous dates" error). Also filters on the fact date do not remove filters on Date table columns. Always use 'Date'[Date] from a marked Date table.`,
      level: 'Medium',
    },
    {
      q: 'How do you build a running total that does not reset each year?',
      a: `\`\`\`\nRunning Total =\nVAR MaxDate = MAX('Date'[Date])\nRETURN CALCULATE([Total Sales], 'Date'[Date] <= MaxDate, REMOVEFILTERS('Date'))\n\`\`\`\nREMOVEFILTERS('Date') removes Year/Month filters from the visual cell, and the predicate keeps all dates up to the current one. For a running total that resets yearly, use TOTALYTD. For running total by a non-date order (e.g., product rank), use a similar pattern with the rank column.`,
      level: 'Medium',
    },
    {
      q: 'Your YTD line chart continues flat into future months. How do you fix it?',
      a: `The Date table includes future dates and YTD returns the accumulated value for them. Fixes:\n1. Add a column in the Date table: \`IsPast = 'Date'[Date] <= TODAY()\` (or <= max sales date) and filter the visual/page with it.\n2. Return BLANK in the measure: \`IF(MIN('Date'[Date]) <= CALCULATE(MAX(Sales[OrderDate]), REMOVEFILTERS('Date')), TOTALYTD(...))\`.\n3. Limit the Date table to the end of the current year and filter the visual.`,
      level: 'Hard',
    },
    {
      q: 'What is the difference between PREVIOUSMONTH and DATEADD(..., -1, MONTH)?',
      a: `PREVIOUSMONTH returns all dates of the previous month based on the **first date** in the current context – always a full month. DATEADD shifts the **current selection** by one month keeping its shape: if the context is 1–15 March, DATEADD returns 1–15 February; PREVIOUSMONTH returns 1–29 February. At full-month granularity they match.`,
      level: 'Medium',
    },
    {
      q: 'How would you compare MTD this month with the same days of the previous month?',
      a: `\`\`\`\nSales PMTD =\nCALCULATE([Sales MTD], DATEADD('Date'[Date], -1, MONTH))\n\`\`\`\nIf the current context is a month with the last sale on the 15th, Sales MTD needs to be limited to dates up to the last sale date first (e.g., in the visual filter the Date table to dates <= last sale date, or use DATESBETWEEN with the max sales date). DATEADD then shifts that same partial range to the previous month, giving a like-for-like comparison.`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a Date table from 1 Jan 2022 to 31 Dec 2025 with Year, MonthNumber, MonthName, Quarter and Year Month columns, then list the steps to make it usable for time intelligence.',
      hint: 'CALENDAR + ADDCOLUMNS; mark as date table; sort by column; relationship.',
      solution: `Date =
ADDCOLUMNS (
    CALENDAR ( DATE ( 2022, 1, 1 ), DATE ( 2025, 12, 31 ) ),
    "Year", YEAR ( [Date] ),
    "MonthNumber", MONTH ( [Date] ),
    "MonthName", FORMAT ( [Date], "MMMM" ),
    "Quarter", "Q" & QUARTER ( [Date] ),
    "Year Month", FORMAT ( [Date], "YYYY-MM" )
)
-- Steps: Table tools → Mark as date table → Date column;
-- Sort MonthName by MonthNumber; create 'Date'[Date] 1:* Sales[OrderDate];
-- disable Auto date/time; hide Sales[OrderDate].`,
    },
    {
      task: 'Create Sales YTD, Sales PY YTD and YTD Growth %.',
      hint: 'TOTALYTD then SAMEPERIODLASTYEAR on top.',
      solution: `Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )
Sales PY YTD = CALCULATE ( [Sales YTD], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
YTD Growth % = DIVIDE ( [Sales YTD] - [Sales PY YTD], [Sales PY YTD] )`,
    },
    {
      task: 'Create Profit fiscal YTD for a fiscal year ending 30 June.',
      hint: 'year_end_date argument.',
      solution: `Profit FYTD = TOTALYTD ( [Profit], 'Date'[Date], "6/30" )
-- or CALCULATE ( [Profit], DATESYTD ( 'Date'[Date], "6/30" ) )`,
    },
    {
      task: 'Create Sales MoM % and show it only when the current month has sales.',
      hint: 'DATEADD -1 MONTH; IF NOT ISBLANK.',
      solution: `Sales PM = CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, MONTH ) )
Sales MoM % =
IF (
    NOT ISBLANK ( [Total Sales] ),
    DIVIDE ( [Total Sales] - [Sales PM], [Sales PM] )
)`,
    },
    {
      task: 'Create a rolling 3-month average of monthly sales that returns BLANK if fewer than 3 months in the window have sales.',
      hint: 'Count months with sales inside the window.',
      solution: `Sales R3M Avg (strict) =
VAR Window = DATESINPERIOD ( 'Date'[Date], MAX ( 'Date'[Date] ), -3, MONTH )
VAR MonthsWithSales =
    CALCULATE (
        COUNTROWS ( FILTER ( VALUES ( 'Date'[Year Month] ), [Total Sales] > 0 ) ),
        Window
    )
RETURN
    IF (
        MonthsWithSales = 3,
        CALCULATE ( [Total Sales], Window ) / 3
    )`,
    },
    {
      task: 'Create a running total of Quantity that resets every year, and one that never resets.',
      hint: 'TOTALYTD vs REMOVEFILTERS pattern.',
      solution: `Qty YTD = TOTALYTD ( SUM ( Sales[Quantity] ), 'Date'[Date] )

Qty Running Total =
VAR MaxDate = MAX ( 'Date'[Date] )
RETURN
    CALCULATE ( SUM ( Sales[Quantity] ), 'Date'[Date] <= MaxDate, REMOVEFILTERS ( 'Date' ) )`,
    },
    {
      task: 'Show "Sales Same Month 2 Years Ago" and "Full Previous Quarter Sales".',
      hint: 'DATEADD -2 YEAR; PARALLELPERIOD or PREVIOUSQUARTER.',
      solution: `Sales 2Y Ago = CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -2, YEAR ) )

Sales Prev Quarter (full) = CALCULATE ( [Total Sales], PREVIOUSQUARTER ( 'Date'[Date] ) )
-- or PARALLELPERIOD ( 'Date'[Date], -1, QUARTER )`,
    },
  ],
  quiz: [
    {
      question: 'Which is NOT a requirement of a valid Date table?',
      options: ['Unique dates', 'Contiguous dates without gaps', 'Only dates that exist in the fact table', 'A column of Date data type'],
      answer: 2,
      explanation: 'The Date table must contain ALL days in the range, not only days with sales.',
    },
    {
      question: 'TOTALYTD([Total Sales], \'Date\'[Date], "3/31") calculates:',
      options: ['Calendar YTD', 'Fiscal YTD for a year ending 31 March', 'Sales for March only', 'Quarter-to-date'],
      answer: 1,
      explanation: 'The year_end_date argument defines the fiscal year end.',
    },
    {
      question: 'In a cell for March 2024, PARALLELPERIOD(\'Date\'[Date], -1, YEAR) returns:',
      options: ['March 2023', 'January–March 2023', 'All of 2023', 'February 2024'],
      answer: 2,
      explanation: 'PARALLELPERIOD expands to the complete period of the interval.',
    },
    {
      question: 'Which expression returns a rolling 12-month window ending at the current context\'s last date?',
      options: [
        'DATESYTD(\'Date\'[Date])',
        'DATESINPERIOD(\'Date\'[Date], MAX(\'Date\'[Date]), -12, MONTH)',
        'SAMEPERIODLASTYEAR(\'Date\'[Date])',
        'PREVIOUSYEAR(\'Date\'[Date])',
      ],
      answer: 1,
      explanation: 'DATESINPERIOD with -12 MONTH from the max date gives the trailing 12 months.',
    },
    {
      question: 'SAMEPERIODLASTYEAR(\'Date\'[Date]) is equivalent to:',
      options: [
        'PARALLELPERIOD(\'Date\'[Date], -1, YEAR)',
        'DATEADD(\'Date\'[Date], -1, YEAR)',
        'PREVIOUSYEAR(\'Date\'[Date])',
        'DATESYTD(\'Date\'[Date])',
      ],
      answer: 1,
      explanation: 'Both shift the current selection back one year keeping its shape.',
    },
    {
      question: 'Why is CALENDARAUTO sometimes risky?',
      options: [
        'It cannot create fiscal years',
        'It scans all date columns, so unrelated old/future dates can make the table span many years',
        'It returns duplicate dates',
        'It only works in DirectQuery',
      ],
      answer: 1,
      explanation: 'Columns like birth dates or 1900 placeholders extend the range unnecessarily.',
    },
  ],
};
