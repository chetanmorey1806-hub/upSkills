export default {
  id: 'extra-24-dateadd',
  title: 'DATEADD()',
  module: 'Extra: DAX',
  extraNo: 24,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "DATEADD() shifts the dates in the current filter context forward or backward by a number of days, months, quarters or years. It is the most flexible way to build previous month, previous quarter and previous year comparisons such as MoM and YoY growth.",
  objectives: [
    "Understand the three arguments of DATEADD() and the four interval types",
    "Build Previous Month, Previous Quarter and Previous Year measures",
    "Calculate Month-over-Month (MoM) and Year-over-Year (YoY) growth with DIVIDE",
    "Know the requirements (continuous date table) and the difference from SAMEPERIODLASTYEAR and PARALLELPERIOD",
  ],
  theory: [
    {
      heading: "What DATEADD() does",
      content: "Imagine you are looking at March 2024 in a report. DATEADD takes the dates of March 2024 and **moves them** by the amount you ask for: one month back gives February 2024, one year back gives March 2023, two quarters forward gives September 2024.\n\nLike `DATESQTD`, it is a **table function**: it returns a table of shifted dates. You put it inside `CALCULATE()` so your measure is evaluated over the shifted dates instead of the current ones.",
      syntax: "DATEADD(<dates>, <number_of_intervals>, <interval>)\n\n<interval> = DAY | MONTH | QUARTER | YEAR",
      points: [
        "<dates>: the date column of your date table, e.g. 'Date'[Date]",
        "<number_of_intervals>: negative = go back in time, positive = go forward",
        "<interval>: DAY, MONTH, QUARTER or YEAR (written without quotes)",
      ],
    },
    {
      heading: "Previous period measures",
      content: "The three most common measures in any sales report:\n\n- **Sales PM (previous month):** `CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH))`\n- **Sales PQ (previous quarter):** `CALCULATE([Total Sales], DATEADD('Date'[Date], -1, QUARTER))`\n- **Sales PY (previous year):** `CALCULATE([Total Sales], DATEADD('Date'[Date], -1, YEAR))`\n\nThe same measure works at any level. On a month row it gives the previous month; on a quarter row with `-1, QUARTER` it gives the previous quarter; on a day row with `-1, DAY` it gives yesterday.",
    },
    {
      heading: "Growth measures: MoM and YoY",
      content: "Once you have the previous period value, growth is simple maths:\n\n`Growth % = (Current - Previous) / Previous`\n\nAlways use `DIVIDE()` instead of the `/` operator. When the previous value is blank (for example January 2023, the first month in our date table), DIVIDE returns BLANK instead of an error.\n\nUsing variables (VAR) makes the measure easier to read and avoids calculating the same thing twice.",
      syntax: "MoM % =\nVAR Curr = [Total Sales]\nVAR Prev = CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH))\nRETURN DIVIDE(Curr - Prev, Prev)",
    },
    {
      heading: "Requirements and gotchas",
      content: "- **Continuous date table:** DATEADD needs a column with every date, no gaps. Use the marked `Date` table (2023-01-01 to 2024-12-31), never `Sales[OrderDate]`.\n- **Results must stay inside the date table:** if you shift 2023 dates back one year, the shifted dates (2022) do not exist in the Date table, so the result is BLANK.\n- **Month-end handling:** shifting 31-Mar back one MONTH gives 29-Feb (in 2024) because DATEADD understands month ends. Whole months shift to whole months.\n- **Columns on the visual must come from the Date table**, otherwise the shift does not happen.",
      tip: "If a previous-year measure shows the same numbers as the current year, check that the visual axis uses 'Date'[Month] / 'Date'[Year] and not Sales[Month] / Sales[Year].",
    },
    {
      heading: "DATEADD vs SAMEPERIODLASTYEAR vs PARALLELPERIOD",
      content: "- `SAMEPERIODLASTYEAR('Date'[Date])` = `DATEADD('Date'[Date], -1, YEAR)`. Same result, but it can only go back exactly one year.\n- `DATEADD` can move any number of days, months, quarters or years, backward or forward.\n- `PARALLELPERIOD` also shifts, but it returns the **complete** period (full month, quarter or year) instead of the same partial set of dates. For example, on a March row, `PARALLELPERIOD('Date'[Date], -1, YEAR)` returns all of 2023, while `DATEADD('Date'[Date], -1, YEAR)` returns only March 2023.\n\nRule of thumb: use DATEADD for like-for-like comparisons, PARALLELPERIOD when you need a whole prior period total.",
    },
  ],
  examples: [
    {
      title: "Previous Month sales and MoM growth",
      scenario: "The finance team wants to see each month of Q1 2024 next to the previous month, with MoM growth %.",
      table: {
        headers: ['Month', 'Total Sales', 'Sales PM', 'MoM %'],
        rows: [
          ['Jan 2024', '1,20,000', '1,05,000 (Dec 2023)', '14.3%'],
          ['Feb 2024', '95,000', '1,20,000', '-20.8%'],
          ['Mar 2024', '1,40,000', '95,000', '47.4%'],
        ],
      },
      steps: [
        "Make sure Total Sales = SUM(Sales[SalesAmount]) exists (Modeling > New measure)",
        "Modeling > New measure and create Sales PM from the code box",
        "Modeling > New measure and create MoM %; in Measure tools set Format to Percentage, 1 decimal",
        "Insert a Table visual with 'Date'[YearMonth], Total Sales, Sales PM and MoM %",
        "Add a slicer on 'Date'[Year] = 2024 and 'Date'[Quarter] = Q1",
      ],
      code: `Sales PM =
CALCULATE(
    [Total Sales],
    DATEADD('Date'[Date], -1, MONTH)
)

MoM % =
VAR Curr = [Total Sales]
VAR Prev = [Sales PM]
RETURN
    DIVIDE(Curr - Prev, Prev)`,
      result: "Jan 2024 compares with Dec 2023 (1,05,000) for 14.3% growth; Feb drops 20.8%; Mar grows 47.4%.",
      explanation: "The slicer filters Q1 2024, but inside Sales PM, DATEADD replaces the current month with the month before. Because the Date table contains 2023, January can still see December 2023.",
    },
    {
      title: "Year-over-Year by quarter",
      scenario: "The CEO asks: how did each quarter of 2024 perform compared to the same quarter in 2023?",
      table: {
        headers: ['Quarter (2024)', 'Total Sales', 'Sales PY', 'YoY %'],
        rows: [
          ['Q1', '3,55,000', '3,10,000', '14.5%'],
          ['Q2', '3,90,000', '3,60,000', '8.3%'],
          ['Q3', '3,40,000', '3,50,000', '-2.9%'],
          ['Q4', '4,20,000', '3,80,000', '10.5%'],
        ],
      },
      steps: [
        "Modeling > New measure: create Sales PY from the code box",
        "Modeling > New measure: create YoY %, format as Percentage",
        "Insert a Clustered column chart: X-axis 'Date'[Quarter], Y-axis Total Sales and Sales PY",
        "Insert a Table visual with 'Date'[Quarter], Total Sales, Sales PY, YoY %",
        "Add a slicer on 'Date'[Year] and select 2024",
      ],
      code: `Sales PY =
CALCULATE(
    [Total Sales],
    DATEADD('Date'[Date], -1, YEAR)
)

YoY % =
DIVIDE([Total Sales] - [Sales PY], [Sales PY])`,
      result: "Column pairs for each quarter; Q3 is the only quarter with negative YoY growth (-2.9%).",
      explanation: "On each quarter row DATEADD shifts all dates of that quarter back one year, so Q1 2024 compares with Q1 2023. The same measure would compare months if Month were on the axis.",
    },
    {
      title: "Previous Quarter and a rolling look-ahead check",
      scenario: "A planner wants Q-o-Q comparison, and wants to understand what happens when shifting forward past the end of the date table.",
      table: {
        headers: ['Quarter', 'Total Sales', 'Sales PQ', 'Sales NQ (next quarter)'],
        rows: [
          ['Q1 2024', '3,55,000', '3,80,000 (Q4 2023)', '3,90,000'],
          ['Q2 2024', '3,90,000', '3,55,000', '3,40,000'],
          ['Q3 2024', '3,40,000', '3,90,000', '4,20,000'],
          ['Q4 2024', '4,20,000', '3,40,000', '(blank)'],
        ],
      },
      steps: [
        "Modeling > New measure: create Sales PQ and Sales NQ from the code box",
        "Insert a Matrix with 'Date'[Year] and 'Date'[Quarter] in Rows",
        "Add Total Sales, Sales PQ and Sales NQ to Values",
        "Expand to the quarter level (Expand all down one level icon on the visual header)",
        "Observe Q4 2024 for Sales NQ",
      ],
      code: `Sales PQ =
CALCULATE([Total Sales], DATEADD('Date'[Date], -1, QUARTER))

Sales NQ =
CALCULATE([Total Sales], DATEADD('Date'[Date], 1, QUARTER))`,
      result: "Sales PQ shows the previous quarter; Sales NQ is blank for Q4 2024 because Q1 2025 is outside the Date table.",
      explanation: "A positive number shifts forward. DATEADD can only return dates that exist in the date column, so shifting beyond 31-Dec-2024 returns an empty table and the measure is blank.",
    },
  ],
  interview: [
    { q: "What are the arguments of DATEADD?", a: "DATEADD(dates, number_of_intervals, interval). dates is a date column, number_of_intervals is a positive or negative integer, and interval is DAY, MONTH, QUARTER or YEAR.", level: 'Easy' },
    { q: "How do you calculate previous month sales?", a: "Sales PM = CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH)). It works in any visual that has month (or day) from the date table.", level: 'Easy' },
    { q: "What is the difference between SAMEPERIODLASTYEAR and DATEADD?", a: "SAMEPERIODLASTYEAR(dates) is the same as DATEADD(dates, -1, YEAR). DATEADD is more general because it supports any number of intervals and DAY/MONTH/QUARTER/YEAR.", level: 'Medium' },
    { q: "What is the difference between DATEADD and PARALLELPERIOD?", a: "DATEADD shifts exactly the dates in context, so March shifted back a year gives March of last year. PARALLELPERIOD shifts and then expands to the whole interval, so March shifted back a year gives the entire previous year.", level: 'Medium' },
    { q: "Why does DATEADD require a continuous date table?", a: "It shifts dates by calendar logic and returns only dates that exist in the column. If dates are missing (like in a fact table), shifted dates can be lost and results become wrong. A marked date table guarantees every day exists.", level: 'Medium' },
    { q: "Scenario: your YoY % measure shows an error or infinity for January 2023. How do you fix it?", a: "There is no 2022 data, so the previous value is blank. Use DIVIDE(Curr - Prev, Prev), which returns BLANK when the denominator is blank or zero. Optionally return BLANK when Prev is blank using IF(ISBLANK(Prev), BLANK(), ...).", level: 'Hard' },
    { q: "Scenario: Sales PY shows the same value as Total Sales on every row. What would you check?", a: "Check that the visual uses columns from the Date table, that the Date table is marked and related to Sales[OrderDate] with an active relationship, and that DATEADD uses 'Date'[Date] and not Sales[OrderDate].", level: 'Hard' },
  ],
  practice: [
    { task: "Create Sales PY using DATEADD and compare it with a SAMEPERIODLASTYEAR version in a table by month.", hint: "Both should return identical values.", solution: "Sales PY = CALCULATE([Total Sales], DATEADD('Date'[Date], -1, YEAR)); Sales SPLY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date])). Every row matches." },
    { task: "Create a measure showing sales from 2 months ago.", hint: "Use -2 as the number of intervals.", solution: "Sales 2M Ago = CALCULATE([Total Sales], DATEADD('Date'[Date], -2, MONTH))" },
    { task: "Build a MoM Change (absolute, not %) measure and show it with conditional formatting (green positive, red negative) in a table.", hint: "Current minus previous month. Use Format > Cell elements > Font color > Rules.", solution: "MoM Change = [Total Sales] - CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH)). In the table, Format visual > Cell elements > Font color on, rules: >= 0 green, < 0 red." },
    { task: "Create a YoY % measure for Electronics only. Try the measure in the DAX Lab.", hint: "Add a Product[Category] filter to both current and previous values.", solution: "Elec YoY % = VAR Curr = CALCULATE([Total Sales], Product[Category] = \"Electronics\") VAR Prev = CALCULATE([Total Sales], Product[Category] = \"Electronics\", DATEADD('Date'[Date], -1, YEAR)) RETURN DIVIDE(Curr - Prev, Prev)" },
    { task: "Create Orders PQ: the count of orders in the previous quarter.", hint: "COUNTROWS(Sales) with a DATEADD QUARTER filter.", solution: "Orders PQ = CALCULATE(COUNTROWS(Sales), DATEADD('Date'[Date], -1, QUARTER))" },
  ],
  quiz: [
    { question: "Which expression returns last year's dates for the current context?", options: ["DATEADD('Date'[Date], 1, YEAR)", "DATEADD('Date'[Date], -1, YEAR)", "DATEADD('Date'[Date], -12, DAY)", "DATEADD('Date'[Date], YEAR, -1)"], answer: 1, explanation: "A negative number goes back in time and the interval is the third argument." },
    { question: "Which interval is NOT valid in DATEADD?", options: ["DAY", "MONTH", "WEEK", "QUARTER"], answer: 2, explanation: "DATEADD supports DAY, MONTH, QUARTER and YEAR. For weeks, shift by -7 DAY." },
    { question: "Why use DIVIDE() in a growth % measure?", options: ["It is faster than /", "It returns BLANK (or an alternate value) instead of an error when the denominator is 0 or blank", "It formats the result as a percentage", "It is required by DATEADD"], answer: 1, explanation: "DIVIDE safely handles division by zero or blank." },
    { question: "For Q4 2024, Sales NQ = CALCULATE([Total Sales], DATEADD('Date'[Date], 1, QUARTER)) shows blank because:", options: ["DATEADD cannot move forward", "Q1 2025 dates do not exist in the Date table", "QUARTER is not a valid interval", "The measure needs SAMEPERIODLASTYEAR"], answer: 1, explanation: "DATEADD only returns dates present in the date column, which ends on 2024-12-31." },
    { question: "On a March 2024 row, DATEADD('Date'[Date], -1, YEAR) returns:", options: ["All of 2023", "March 2023", "February 2024", "Q1 2023"], answer: 1, explanation: "DATEADD shifts the exact dates in context; PARALLELPERIOD would return the whole year." },
  ],
};
