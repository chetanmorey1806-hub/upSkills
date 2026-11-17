export default {
  id: 'day-17-date-table-relationships-optimization',
  title: 'Date Table, Active and Inactive Relationships, Model Optimization',
  module: 'Module 3: Data Modeling',
  day: 17,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'A proper Date table is the backbone of every time-based report, inactive relationships let one Date table serve several date columns, and a few optimization habits keep your model small and fast.',
  objectives: [
    'Create a Date table with CALENDAR and ADDCOLUMNS and mark it as a date table',
    'Sort month names correctly using Sort by column',
    'Explain active vs inactive relationships and activate one with USERELATIONSHIP',
    'Disable Auto date/time and apply other model optimization techniques',
  ],
  theory: [
    {
      heading: 'Why you need a separate Date table',
      content:
        "Sales only has dates on which orders happened. Our first order is 2023-01-07 and some days have no orders at all. Time intelligence functions such as TOTALYTD and SAMEPERIODLASTYEAR (Day 27) need a **continuous** calendar: every single day, no gaps, covering full years.\n\nA Date table gives you:\n- One row per day from 1 Jan of the first year to 31 Dec of the last year\n- Ready columns for slicing: Year, Quarter, Month, MonthNo, YearMonth\n- A single place to filter every fact table by time (Sales, Budget, Returns)\n\nThe practice model already has `Date` covering 2023-01-01 to 2024-12-31 (731 rows). Below you learn to build it yourself.",
    },
    {
      heading: 'Creating the Date table with DAX',
      content:
        "Use **Modeling > New table** (or Table tools > New table) and write:\n\n- `CALENDAR(<StartDate>, <EndDate>)` returns a one-column table named `Date` with every day between the two dates (inclusive).\n- `CALENDARAUTO()` scans all date columns in the model and builds full years automatically. Simpler, but it may pick up odd dates like a birth date of 1950.\n- `ADDCOLUMNS(<Table>, \"Name\", <Expression>, ...)` adds calculated columns to that table.\n\nBecause `Date` is also a DAX function name, always write the table as `'Date'` with single quotes in DAX, e.g. `'Date'[Year]`.",
      syntax: `Date =
ADDCOLUMNS(
    CALENDAR(DATE(2023, 1, 1), DATE(2024, 12, 31)),
    "Year", YEAR([Date]),
    "MonthNo", MONTH([Date]),
    "Month", FORMAT([Date], "MMM"),
    "Quarter", "Q" & QUARTER([Date]),
    "YearMonth", FORMAT([Date], "YYYY-MM")
)`,
      points: [
        'CALENDAR StartDate: first day of the calendar, use DATE(year, 1, 1)',
        'CALENDAR EndDate: last day, use DATE(year, 12, 31)',
        'ADDCOLUMNS Table: the base table (CALENDAR output)',
        'ADDCOLUMNS Name/Expression pairs: column name in quotes and the formula for each row',
      ],
    },
    {
      heading: 'Mark as date table and Sort by column',
      content:
        "1. **Mark as date table**: select the Date table in the Data pane, then **Table tools > Mark as date table**, choose the `Date` column. Power BI validates that it is unique, continuous and has no blanks. This tells DAX time intelligence to use your table and removes the hidden auto tables for it.\n2. **Sort Month by MonthNo**: text months sort alphabetically (Apr, Aug, Dec...). Select `Date[Month]`, then **Column tools > Sort by column > MonthNo**. Now visuals show Jan, Feb, Mar...\n3. **Relate** `Date[Date]` 1 -> * `Sales[OrderDate]` (Many to one, Single). Make sure both are Date type (not Date/Time with times).",
      tip: 'Turn off Auto date/time: File > Options and settings > Options > Current File > Data Load > Time intelligence > uncheck Auto date/time. It creates a hidden date table for every date column and bloats the model.',
    },
    {
      heading: 'Active vs inactive relationships',
      content:
        "Between two tables Power BI allows only **one active** relationship path. If Sales had both `OrderDate` and `ShipDate`, you can create two relationships to Date, but only one can be active:\n\n- **Active** (solid line): used automatically by every visual and measure.\n- **Inactive** (dotted line): ignored unless a measure explicitly turns it on.\n\nThis lets one Date table answer \"sales by order date\" and \"sales by ship date\" without duplicating the Date table (role-playing dimension).",
    },
    {
      heading: 'USERELATIONSHIP: activate an inactive link inside one measure',
      content:
        "`USERELATIONSHIP` is a filter modifier used **inside CALCULATE**. For the duration of that calculation it activates the named inactive relationship (and the active one between the same tables is ignored).\n\nArguments:\n- **ColumnName1**: one column of the relationship, usually the many-side FK (`Sales[ShipDate]`)\n- **ColumnName2**: the other column, usually the one-side PK (`'Date'[Date]`)\n\nThe relationship must already exist in Model view (it can be inactive). USERELATIONSHIP cannot create new relationships.",
      syntax: 'CALCULATE(<Expression>, USERELATIONSHIP(<ColumnName1>, <ColumnName2>))',
    },
    {
      heading: 'Model optimization basics',
      content:
        "Power BI Import mode stores data in the VertiPaq engine, which compresses **columns**. Size and speed depend mostly on the **number of columns** and the **number of unique values** (cardinality) in each column.\n\n1. **Remove unused columns** in Power Query (Choose Columns). Every column costs memory.\n2. **Disable Auto date/time** (see tip above).\n3. **Reduce cardinality**: split Date/Time into separate Date and Time columns, round decimals you do not need, avoid unique text like comments.\n4. **Correct data types**: whole numbers instead of text for IDs; Fixed decimal for currency.\n5. **Prefer measures over calculated columns** for aggregations (Day 19).\n6. **Use star schema and Single direction** relationships (Days 15 and 16).\n7. **Avoid duplicate attributes**: once Date exists, Sales[Year] and Sales[Month] are redundant; use Date columns in visuals.\n8. Use **View > Performance analyzer** to see which visual is slow (Day 38 goes deeper).",
    },
  ],
  examples: [
    {
      title: 'Example 1: Build and mark the Date table',
      scenario: 'Create the calendar for 2023-2024 and confirm it has 731 rows.',
      table: {
        headers: ['Date', 'Year', 'MonthNo', 'Month', 'Quarter', 'YearMonth'],
        rows: [
          ['01-01-2023', '2023', '1', 'Jan', 'Q1', '2023-01'],
          ['02-01-2023', '2023', '1', 'Jan', 'Q1', '2023-01'],
          ['...', '...', '...', '...', '...', '...'],
          ['31-12-2024', '2024', '12', 'Dec', 'Q4', '2024-12'],
        ],
      },
      steps: [
        'File > Options and settings > Options > Current File > Data Load: uncheck Auto date/time, OK',
        'Modeling > New table, paste the DAX below, press Enter',
        'Select the Date table in the Data pane > Table tools > Mark as date table > choose column Date > OK',
        'Select Date[Month] > Column tools > Sort by column > MonthNo',
        'Model view: drag Date[Date] onto Sales[OrderDate]; Many to one, Single, Active',
        'Create a card with the measure Days = COUNTROWS(\'Date\')',
      ],
      code: `Date =
ADDCOLUMNS(
    CALENDAR(DATE(2023, 1, 1), DATE(2024, 12, 31)),
    "Year", YEAR([Date]),
    "MonthNo", MONTH([Date]),
    "Month", FORMAT([Date], "MMM"),
    "Quarter", "Q" & QUARTER([Date]),
    "YearMonth", FORMAT([Date], "YYYY-MM")
)`,
      result: 'Date table with 731 rows (2024 is a leap year: 365 + 366). The card shows 731.',
      explanation: 'CALENDAR creates every day between the two dates; ADDCOLUMNS adds slicing columns; marking validates continuity.',
    },
    {
      title: 'Example 2: Sales by Year and Quarter using the Date table',
      scenario: 'Show quarterly sales using Date columns, not Sales columns.',
      table: {
        headers: ['Year', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
        rows: [
          ['2023', '5,81,868', '3,17,851', '2,82,353', '2,50,243', '14,32,315'],
          ['2024', '5,14,854', '51,447', '8,15,741', '2,80,596', '16,62,638'],
          ['Total', '10,96,722', '3,69,298', '10,98,094', '5,30,839', '30,94,953'],
        ],
      },
      steps: [
        'Insert a Matrix visual',
        'Rows = Date[Year], Columns = Date[Quarter], Values = Total Sales',
        'Format pane > Row subtotals and Column subtotals On',
      ],
      code: 'Total Sales = SUM(Sales[SalesAmount])',
      result: 'The matrix above. 2024 Q2 is weak (51,447) and 2024 Q3 is strongest (8,15,741).',
      explanation: 'Date filters Sales through Date[Date] -> Sales[OrderDate]. Quarters are complete because the Date table covers full years.',
    },
    {
      title: 'Example 3: Inactive ShipDate relationship with USERELATIONSHIP',
      scenario: 'Orders ship 3 days after the order date. Finance wants sales by ship month. (ShipDate is an extra column you create.)',
      table: {
        headers: ['YearMonth', 'Total Sales (Order Date)', 'Sales by Ship Date'],
        rows: [
          ['2023-02', '88,808', '12,628'],
          ['2023-03', '2,83,873', '3,60,053'],
          ['2024-02', '20,214', '9,354'],
          ['2024-03', '1,83,478', '1,94,338'],
        ],
      },
      steps: [
        'Table view > select Sales > Table tools > New column: ShipDate = Sales[OrderDate] + 3, then set Column tools > Data type = Date',
        'Model view: drag Date[Date] onto Sales[ShipDate]; Power BI creates it as inactive (dotted line) because OrderDate is already active',
        'Modeling > New measure: Sales by Ship Date (code below)',
        'Insert a Table visual with Date[YearMonth], Total Sales and Sales by Ship Date; filter YearMonth to the four months shown',
      ],
      code: `Sales by Ship Date =
CALCULATE(
    SUM(Sales[SalesAmount]),
    USERELATIONSHIP(Sales[ShipDate], 'Date'[Date])
)`,
      result: 'Order 1034 (26-Feb-2023, 76,180) ships on 1-Mar-2023, so it moves from Feb to Mar. Order 1053 (28-Feb-2024, 10,860) ships on 2-Mar-2024 (2024 is a leap year), so it moves into March 2024 the same way.',
      explanation: 'USERELATIONSHIP switches Date to filter Sales through ShipDate for this measure only. Year totals stay the same (14,32,315 and 16,62,638) because no order crosses a year boundary.',
    },
    {
      title: 'Example 4: Quick model optimization pass',
      scenario: 'Your PBIX is slow and large. Apply the basic checklist.',
      steps: [
        'File > Options and settings > Options > Current File > Data Load: confirm Auto date/time is off',
        'Home > Transform data > Sales > Home > Choose Columns: untick columns not used in any visual or measure',
        'Check each ID column is Whole number (Transform > Data type)',
        'If OrderDate were Date/Time, change it to Date to cut cardinality',
        'Close & Apply, then View > Performance analyzer > Start recording > Refresh visuals and look at the slowest visual',
      ],
      result: 'Smaller file size and faster visuals. Hidden auto date tables disappear from the model.',
      explanation: 'VertiPaq cost grows with columns and distinct values. Fewer columns, proper types and no auto date tables reduce memory.',
    },
  ],
  interview: [
    {
      q: 'Why do you need a dedicated Date table in Power BI?',
      a: 'Time intelligence needs a continuous calendar with one row per day and full years. A Date table also provides consistent slicing columns and can filter multiple fact tables.',
      level: 'Easy',
    },
    {
      q: 'What are the requirements for marking a table as a date table?',
      a: 'The date column must be of Date type, contain unique values, have no blanks, and be continuous (no missing days) across the range.',
      level: 'Medium',
    },
    {
      q: 'Difference between CALENDAR and CALENDARAUTO?',
      a: 'CALENDAR(start, end) builds exactly the range you give. CALENDARAUTO() scans all date columns in the model and creates full calendar years covering them; it can be thrown off by outlier dates.',
      level: 'Medium',
    },
    {
      q: 'What is an inactive relationship and how do you use it?',
      a: 'A relationship shown as a dotted line that filters nothing by default. You activate it in a measure with CALCULATE(<expr>, USERELATIONSHIP(col1, col2)).',
      level: 'Medium',
    },
    {
      q: 'Scenario: Sales has OrderDate, ShipDate and DeliveryDate. How do you model this?',
      a: 'One Date table, one active relationship (usually OrderDate) and two inactive relationships for ShipDate and DeliveryDate. Write separate measures with USERELATIONSHIP for ship and delivery analysis. Alternatively create role-playing copies of Date if users need separate slicers.',
      level: 'Hard',
    },
    {
      q: 'Why should you disable Auto date/time?',
      a: 'It creates a hidden date table for every date column, increasing model size, and these tables cannot be shared across facts. A single marked Date table is better.',
      level: 'Medium',
    },
    {
      q: 'Name five ways to optimize a Power BI model.',
      a: 'Remove unused columns and rows, reduce cardinality (split datetime, round numbers), use correct data types, disable Auto date/time, use a star schema with single-direction relationships, and prefer measures over calculated columns.',
      level: 'Medium',
    },
    {
      q: 'Why does the month axis show Apr, Aug, Dec first and how do you fix it?',
      a: 'Month is text and sorts alphabetically. Use Column tools > Sort by column and sort Month by MonthNo.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Build the Date table with CALENDAR + ADDCOLUMNS and add a column "MonthYear" like "Jan 2024".',
      hint: 'FORMAT([Date], "MMM YYYY").',
      solution: 'Add the pair "MonthYear", FORMAT([Date], "MMM YYYY") inside ADDCOLUMNS. To sort it, also add "YearMonthNo", YEAR([Date]) * 100 + MONTH([Date]) and use Sort by column.',
    },
    {
      task: 'Create a matrix with Date[Year] on rows, Date[Month] on columns and Total Sales. Fix the month order.',
      hint: 'Sort by column.',
      solution: 'Select Date[Month] > Column tools > Sort by column > MonthNo. 2024 Jan shows 3,11,162 and 2024 Dec shows 2,24,409.',
    },
    {
      task: 'Add Sales[ShipDate] = Sales[OrderDate] + 3, relate it inactively to Date and write Sales by Ship Date.',
      hint: 'USERELATIONSHIP inside CALCULATE.',
      solution: "Sales by Ship Date = CALCULATE(SUM(Sales[SalesAmount]), USERELATIONSHIP(Sales[ShipDate], 'Date'[Date])). Feb 2023 drops to 12,628 and Mar 2023 rises to 3,60,053.",
    },
    {
      task: 'List three columns in the practice Sales table that you could remove once the Date table exists, and why.',
      hint: 'Which columns duplicate Date attributes?',
      solution: 'Sales[Year] and Sales[Month] duplicate Date[Year]/Date[MonthNo]. Removing them reduces model size and forces users to slice by the Date table. (Keep them only if a tool without the Date table, like the DAX Lab, needs them.)',
    },
  ],
  quiz: [
    {
      question: 'Which function creates a table with one row for every day between two dates?',
      options: ['DATESYTD', 'CALENDAR', 'DATEADD', 'TODAY'],
      answer: 1,
      explanation: 'CALENDAR(start, end) returns a continuous single-column date table.',
    },
    {
      question: 'How is an inactive relationship shown in Model view?',
      options: ['Red line', 'Dotted line', 'Thick line', 'It is not shown'],
      answer: 1,
      explanation: 'Active relationships are solid, inactive ones are dotted.',
    },
    {
      question: 'USERELATIONSHIP must be used inside:',
      options: ['FILTER', 'CALCULATE', 'SUM', 'Power Query'],
      answer: 1,
      explanation: 'It is a filter modifier argument of CALCULATE/CALCULATETABLE.',
    },
    {
      question: 'Month names appear as Apr, Aug, Dec... What fixes the order?',
      options: ['Change data type to Date', 'Sort by column using MonthNo', 'Mark as date table', 'Use a slicer'],
      answer: 1,
      explanation: 'Sort by column tells Power BI to order Month text by the numeric MonthNo column.',
    },
    {
      question: 'Which setting creates hidden date tables and should usually be turned off?',
      options: ['Autodetect relationships', 'Auto date/time', 'Q&A', 'Background data'],
      answer: 1,
      explanation: 'Auto date/time adds a hidden calendar for each date column and inflates the model.',
    },
  ],
};
