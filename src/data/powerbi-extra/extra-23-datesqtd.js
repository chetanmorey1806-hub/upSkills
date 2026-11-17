export default {
  id: 'extra-23-datesqtd',
  title: 'DATESQTD()',
  module: 'Extra: DAX',
  extraNo: 23,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "DATESQTD() returns the set of dates from the first day of the current quarter up to the last date in the filter context. Wrapped inside CALCULATE it gives you Quarter-to-Date (QTD) totals, the number every sales manager asks for in a quarterly review.",
  objectives: [
    "Explain what DATESQTD() returns and why it is a table function",
    "Build Quarter-to-Date measures with CALCULATE + DATESQTD and compare them with TOTALQTD",
    "Combine DATESQTD with other filters and with SAMEPERIODLASTYEAR for QTD vs last year",
    "Understand how DATESQTD behaves at month, quarter and year level in a matrix",
  ],
  theory: [
    {
      heading: "What is Quarter-to-Date (QTD)?",
      content: "A financial year is split into four quarters: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep) and Q4 (Oct-Dec). **Quarter-to-Date** means: add up everything from the first day of the current quarter until today (or until the last date you are looking at).\n\nThink of a cricket over: the scoreboard shows runs in the current over so far, and it resets to zero when a new over starts. QTD works the same way. In February it shows Jan + Feb; in March it shows Jan + Feb + Mar; in April it resets and shows only April.\n\nIn Power BI we build this with the time intelligence function `DATESQTD()`.",
    },
    {
      heading: "DATESQTD() syntax and what it returns",
      content: "`DATESQTD()` is a **table function**. It does not return a number; it returns a one-column table of dates. You almost always pass that table as a filter to `CALCULATE()`.\n\nIf the current filter context is March 2024, `DATESQTD('Date'[Date])` returns every date from 1-Jan-2024 to 31-Mar-2024. If the context is 15-May-2024, it returns 1-Apr-2024 to 15-May-2024.\n\nThe argument should be the date column of your marked date table (`'Date'[Date]` in our practice model). Note the single quotes: `Date` is also the name of a DAX function, so the table name must be quoted.",
      syntax: "DATESQTD(<dates>)\n\nSales QTD = CALCULATE([Total Sales], DATESQTD('Date'[Date]))",
      points: [
        "<dates> = a column of dates, ideally from a marked date table",
        "Returns a table, so use it inside CALCULATE, CALCULATETABLE or as a filter argument",
        "The quarter boundaries are fixed calendar quarters (Jan, Apr, Jul, Oct starts)",
      ],
    },
    {
      heading: "DATESQTD vs TOTALQTD",
      content: "There are two ways to write the same QTD measure:\n\n1. `CALCULATE([Total Sales], DATESQTD('Date'[Date]))`\n2. `TOTALQTD([Total Sales], 'Date'[Date])`\n\n`TOTALQTD` is a shortcut that internally does exactly option 1. So why learn `DATESQTD`? Because it is more flexible:\n\n- You can add more filters in the same CALCULATE (for example only Electronics).\n- You can nest it inside other functions such as `SAMEPERIODLASTYEAR` to build QTD last year.\n- You can use it with `COUNTROWS`, `DISTINCTCOUNT` or any measure, not just sums.\n\nMost experienced developers prefer the `CALCULATE + DATESQTD` style because the logic is visible and easy to extend.",
      tip: "Interviewers love asking: 'What is the difference between TOTALQTD and DATESQTD?' Answer: TOTALQTD returns a scalar value (the evaluated expression); DATESQTD returns a table of dates that you use as a filter.",
    },
    {
      heading: "Why you need a proper date table",
      content: "Time intelligence functions work on a **continuous calendar**. Our practice model has a `Date` table from 2023-01-01 to 2024-12-31, marked as a date table (Table tools > Mark as date table) and related to `Sales[OrderDate]`.\n\nIf you use `Sales[OrderDate]` directly, days with no orders are missing and results can be wrong or confusing. Always:\n\n- Put `'Date'[Date]` inside DATESQTD.\n- Put `'Date'[Year]`, `'Date'[Quarter]`, `'Date'[Month]` on your visuals (not columns from Sales).",
    },
    {
      heading: "How DATESQTD behaves at different levels of a matrix",
      content: "DATESQTD looks at the **last date** visible in the current context and goes back to the start of that quarter.\n\n- **Month row (Feb 2024):** last date = 29-Feb-2024, so dates 1-Jan to 29-Feb are used.\n- **Quarter row (Q1 2024):** last date = 31-Mar-2024, so the whole Q1 is used. QTD = full quarter.\n- **Year row (2024):** last date = 31-Dec-2024, so only Q4 (1-Oct to 31-Dec) is used. Many students are surprised that the year total of a QTD measure equals Q4, not the full year.\n\nIf you want to hide the confusing year total, use `ISINSCOPE` or `HASONEVALUE('Date'[Quarter])` to return BLANK() at year level.",
      points: [
        "Month level: running total inside the quarter",
        "Quarter level: equals the full quarter",
        "Year / grand total level: equals the last quarter of the period",
      ],
    },
    {
      heading: "Common patterns using DATESQTD",
      content: "- **Count QTD:** `CALCULATE(COUNTROWS(Sales), DATESQTD('Date'[Date]))`\n- **Profit QTD:** `CALCULATE(SUM(Sales[SalesAmount]) - SUM(Sales[Cost]), DATESQTD('Date'[Date]))`\n- **QTD for one category:** `CALCULATE([Total Sales], DATESQTD('Date'[Date]), Product[Category] = \"Electronics\")`\n- **QTD last year:** `CALCULATE([Sales QTD], SAMEPERIODLASTYEAR('Date'[Date]))`\n- **QTD growth %:** `DIVIDE([Sales QTD] - [Sales QTD LY], [Sales QTD LY])`",
    },
  ],
  examples: [
    {
      title: "Build a basic Sales QTD measure",
      scenario: "The sales head of a Pune-based retailer wants a matrix showing monthly sales and a running Quarter-to-Date figure for the first half of 2024.",
      table: {
        headers: ['Quarter', 'Month', 'Total Sales', 'Sales QTD'],
        rows: [
          ['Q1', 'Jan', '1,20,000', '1,20,000'],
          ['Q1', 'Feb', '95,000', '2,15,000'],
          ['Q1', 'Mar', '1,40,000', '3,55,000'],
          ['Q2', 'Apr', '1,10,000', '1,10,000'],
          ['Q2', 'May', '1,30,000', '2,40,000'],
          ['Q2', 'Jun', '1,50,000', '3,90,000'],
        ],
      },
      steps: [
        "Open the practice model in Power BI Desktop and go to Report view",
        "In the Data pane, select the Sales table, then Modeling > New measure",
        "Type: Total Sales = SUM(Sales[SalesAmount]) and press Enter",
        "Modeling > New measure again and type the Sales QTD measure shown in the code box",
        "Insert a Matrix visual. Put 'Date'[Quarter] and 'Date'[Month] in Rows",
        "Put Total Sales and Sales QTD in Values",
        "Add a slicer on 'Date'[Year] and select 2024; sort months by MonthNo if needed (select Month column > Column tools > Sort by column > MonthNo)",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales QTD =
CALCULATE(
    [Total Sales],
    DATESQTD('Date'[Date])
)`,
      result: "Sales QTD grows within each quarter (1,20,000 -> 2,15,000 -> 3,55,000) and resets in April (1,10,000).",
      explanation: "For each month row, DATESQTD returns dates from the start of that quarter to the end of the month. CALCULATE replaces the month filter with this larger date set, so the measure adds up all months so far in the quarter.",
    },
    {
      title: "QTD for Electronics only, plus order count QTD",
      scenario: "The category manager for Electronics wants QTD sales for her category and also the number of orders placed so far in the quarter.",
      table: {
        headers: ['Month (2024)', 'Electronics Sales', 'Electronics QTD', 'Orders QTD'],
        rows: [
          ['Apr', '60,000', '60,000', '42'],
          ['May', '70,000', '1,30,000', '95'],
          ['Jun', '85,000', '2,15,000', '160'],
        ],
      },
      steps: [
        "Modeling > New measure and create Electronics QTD from the code box",
        "Modeling > New measure and create Orders QTD",
        "Insert a Table visual with 'Date'[Month], Electronics QTD and Orders QTD",
        "Add a slicer on 'Date'[Quarter] and select Q2, and a slicer on 'Date'[Year] = 2024",
        "Check that the values reset when you switch the slicer to Q3",
      ],
      code: `Electronics QTD =
CALCULATE(
    [Total Sales],
    DATESQTD('Date'[Date]),
    Product[Category] = "Electronics"
)

Orders QTD =
CALCULATE(
    COUNTROWS(Sales),
    DATESQTD('Date'[Date])
)`,
      result: "Electronics QTD shows 60,000, 1,30,000, 2,15,000 for Apr-Jun. Orders QTD shows the running count of order rows in the quarter.",
      explanation: "CALCULATE accepts many filter arguments. DATESQTD handles the date window and Product[Category] = \"Electronics\" adds a second filter. COUNTROWS shows DATESQTD works with any expression, not only SUM.",
    },
    {
      title: "QTD this year vs QTD last year with growth %",
      scenario: "Management wants to compare Q1 2024 QTD with the same period of Q1 2023.",
      table: {
        headers: ['Month', 'Sales QTD (2024)', 'Sales QTD LY (2023)', 'QTD Growth %'],
        rows: [
          ['Jan', '1,20,000', '1,00,000', '20.0%'],
          ['Feb', '2,15,000', '2,00,000', '7.5%'],
          ['Mar', '3,55,000', '3,10,000', '14.5%'],
        ],
      },
      steps: [
        "Make sure the Sales QTD measure from Example 1 exists",
        "Modeling > New measure: create Sales QTD LY from the code box",
        "Modeling > New measure: create QTD Growth %",
        "Select QTD Growth % and in Measure tools set Format to Percentage with 1 decimal",
        "Build a Table visual with 'Date'[Month], Sales QTD, Sales QTD LY, QTD Growth %, filtered to Year 2024 and Quarter Q1",
      ],
      code: `Sales QTD LY =
CALCULATE(
    [Sales QTD],
    SAMEPERIODLASTYEAR('Date'[Date])
)

QTD Growth % =
DIVIDE([Sales QTD] - [Sales QTD LY], [Sales QTD LY])`,
      result: "Growth % is 20.0% in Jan, 7.5% in Feb and 14.5% in Mar (3,55,000 vs 3,10,000).",
      explanation: "SAMEPERIODLASTYEAR shifts the current dates back one year, then the inner Sales QTD applies DATESQTD on those shifted dates. DIVIDE avoids a divide-by-zero error when last year is blank.",
    },
    {
      title: "Hide the confusing year total",
      scenario: "Users complain that the 2024 total row of Sales QTD shows only Q4 sales. You want the QTD measure to show blank at year level.",
      table: {
        headers: ['Row', 'Sales QTD (before)', 'Sales QTD Clean (after)'],
        rows: [
          ['Q1 2024', '3,55,000', '3,55,000'],
          ['Q4 2024', '4,20,000', '4,20,000'],
          ['Year 2024 total', '4,20,000', '(blank)'],
        ],
      },
      steps: [
        "Modeling > New measure and enter Sales QTD Clean from the code box",
        "Replace Sales QTD with Sales QTD Clean in the matrix",
        "Expand the matrix to Year > Quarter > Month using the drill down arrows",
        "Confirm the year row and grand total are blank while quarter and month rows show values",
      ],
      code: `Sales QTD Clean =
IF(
    HASONEVALUE('Date'[Quarter]),
    CALCULATE([Total Sales], DATESQTD('Date'[Date]))
)`,
      result: "Quarter and month rows show QTD values; the year and grand total rows are blank.",
      explanation: "At year level four quarters are visible, so HASONEVALUE('Date'[Quarter]) is FALSE and IF returns BLANK. At quarter or month level only one quarter is visible, so the QTD logic runs.",
    },
  ],
  interview: [
    { q: "What does DATESQTD() return?", a: "A single-column table containing all dates from the first day of the quarter up to the last date in the current filter context. It is a table function, so it is usually used as a filter argument inside CALCULATE.", level: 'Easy' },
    { q: "What is the difference between TOTALQTD and CALCULATE with DATESQTD?", a: "They give the same result. TOTALQTD(expr, dates) is syntax sugar for CALCULATE(expr, DATESQTD(dates)). DATESQTD is more flexible because you can combine it with more filters or nest other time intelligence functions around it.", level: 'Easy' },
    { q: "Why does my QTD measure show only Q4 sales on the year total row?", a: "At year level the last visible date is 31-Dec, so DATESQTD returns 1-Oct to 31-Dec. That is expected behaviour. To avoid confusion, return BLANK at year level using HASONEVALUE('Date'[Quarter]) or ISINSCOPE.", level: 'Medium' },
    { q: "Can you use Sales[OrderDate] instead of 'Date'[Date] inside DATESQTD?", a: "It may run, but it is not recommended. The fact table date column has gaps and duplicates, and filters from other date attributes would not work correctly. Use the date column of a continuous, marked date table.", level: 'Medium' },
    { q: "How would you compute QTD sales for the same quarter last year?", a: "CALCULATE([Sales QTD], SAMEPERIODLASTYEAR('Date'[Date])) or CALCULATE([Total Sales], DATESQTD(SAMEPERIODLASTYEAR('Date'[Date]))). Both shift the date window back one year.", level: 'Medium' },
    { q: "Scenario: your company's financial quarter starts in April (Q1 = Apr-Jun). Does DATESQTD handle that?", a: "DATESQTD uses calendar quarters, which already start in Jan, Apr, Jul and Oct, so the quarter boundaries are the same; only the quarter labels differ. Add a Fiscal Quarter column to the Date table for labels. For fiscal years, DATESYTD has a year-end argument, but DATESQTD does not need one.", level: 'Hard' },
    { q: "Scenario: QTD shows the same value as monthly sales for every month. What is wrong?", a: "Most likely the visual uses month from the Sales table or a date column not related to the Date table, or the Date table is not marked / not related. DATESQTD then cannot expand the date filter. Use 'Date' columns on the axis and check the relationship 'Date'[Date] -> Sales[OrderDate].", level: 'Hard' },
  ],
  practice: [
    { task: "Create a measure Cost QTD that returns the quarter-to-date sum of Sales[Cost].", hint: "Same pattern as Sales QTD, just a different expression.", solution: "Cost QTD = CALCULATE(SUM(Sales[Cost]), DATESQTD('Date'[Date]))" },
    { task: "Create Profit QTD = Sales QTD minus Cost QTD and show it in a matrix by Quarter and Month for 2024.", hint: "You can reuse the two QTD measures.", solution: "Profit QTD = [Sales QTD] - [Cost QTD]. Put 'Date'[Quarter] and 'Date'[Month] in Rows and Profit QTD in Values, with a Year slicer set to 2024." },
    { task: "Create a QTD measure for Corporate customers only.", hint: "Add a second filter on Customer[Segment].", solution: "Corporate Sales QTD = CALCULATE([Total Sales], DATESQTD('Date'[Date]), Customer[Segment] = \"Corporate\")" },
    { task: "Write the same Sales QTD measure using TOTALQTD and check both measures match in a table. Try both in the DAX Lab.", hint: "TOTALQTD(expression, dates).", solution: "Sales QTD 2 = TOTALQTD([Total Sales], 'Date'[Date]). Both columns show identical values on every row." },
    { task: "Create QTD Growth % vs last year and format it as a percentage.", hint: "Build Sales QTD LY with SAMEPERIODLASTYEAR first, then use DIVIDE.", solution: "Sales QTD LY = CALCULATE([Sales QTD], SAMEPERIODLASTYEAR('Date'[Date])); QTD Growth % = DIVIDE([Sales QTD] - [Sales QTD LY], [Sales QTD LY]); Measure tools > Format > Percentage." },
  ],
  quiz: [
    { question: "What type of value does DATESQTD() return?", options: ["A number", "A table of dates", "A text value", "A boolean"], answer: 1, explanation: "DATESQTD is a table function returning the dates from quarter start to the last date in context." },
    { question: "In the month of May 2024, which dates does DATESQTD('Date'[Date]) cover?", options: ["1-Jan-2024 to 31-May-2024", "1-May-2024 to 31-May-2024", "1-Apr-2024 to 31-May-2024", "1-Apr-2024 to 30-Jun-2024"], answer: 2, explanation: "Q2 starts on 1-Apr, and the last date in context is 31-May." },
    { question: "Which measure is equivalent to CALCULATE([Total Sales], DATESQTD('Date'[Date]))?", options: ["TOTALYTD([Total Sales], 'Date'[Date])", "TOTALQTD([Total Sales], 'Date'[Date])", "DATEADD([Total Sales], -1, QUARTER)", "SAMEPERIODLASTYEAR([Total Sales])"], answer: 1, explanation: "TOTALQTD is the shortcut version of CALCULATE + DATESQTD." },
    { question: "On the Year 2024 total row, a Sales QTD measure shows:", options: ["Full year 2024 sales", "Q1 2024 sales", "Q4 2024 sales", "Blank always"], answer: 2, explanation: "The last date at year level is 31-Dec, so DATESQTD returns Q4 dates." },
    { question: "Why is the table name written as 'Date' with single quotes?", options: ["It is required for all table names", "Date is also a DAX function name, so quoting avoids ambiguity", "Single quotes make the column a measure", "It marks the table as a date table"], answer: 1, explanation: "Table names that are reserved words or contain spaces must be wrapped in single quotes." },
  ],
};
