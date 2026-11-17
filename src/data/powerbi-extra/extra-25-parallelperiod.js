export default {
  id: 'extra-25-parallelperiod',
  title: 'PARALLELPERIOD()',
  module: 'Extra: DAX',
  extraNo: 25,
  level: 'Advanced',
  duration: '1.5 hours',
  summary: "PARALLELPERIOD() shifts the current dates by a number of months, quarters or years and then returns the COMPLETE period, not just the matching dates. It is ideal for showing full prior-year or prior-quarter totals next to the current month, and for 'share of last year' style KPIs.",
  objectives: [
    "Explain how PARALLELPERIOD() differs from DATEADD() and SAMEPERIODLASTYEAR()",
    "Write measures for full previous year, previous quarter and previous month totals",
    "Use PARALLELPERIOD to build percent-of-last-year and target-style comparisons",
    "Predict PARALLELPERIOD results at month, quarter and year levels of a matrix",
  ],
  theory: [
    {
      heading: "What PARALLELPERIOD() does",
      content: "PARALLELPERIOD works in two steps:\n\n1. It **shifts** the dates in the current context by the number of intervals you give (like DATEADD).\n2. It then **expands** the result to cover the full interval: whole months, whole quarters or whole years.\n\nAnalogy: you are standing in March 2024 and ask 'show me last year'. DATEADD hands you March 2023 only. PARALLELPERIOD hands you the entire 2023 calendar year, January to December, no matter which month you are standing in.",
      syntax: "PARALLELPERIOD(<dates>, <number_of_intervals>, <interval>)\n\n<interval> = MONTH | QUARTER | YEAR",
      points: [
        "<dates>: date column of the date table, e.g. 'Date'[Date]",
        "<number_of_intervals>: negative goes back, positive goes forward",
        "<interval>: MONTH, QUARTER or YEAR (DAY is not supported)",
        "Returns a table of dates, so use it inside CALCULATE",
      ],
    },
    {
      heading: "DATEADD vs PARALLELPERIOD side by side",
      content: "Assume the current row is **March 2024**:\n\n- `DATEADD('Date'[Date], -1, YEAR)` returns 1-Mar-2023 to 31-Mar-2023.\n- `SAMEPERIODLASTYEAR('Date'[Date])` returns 1-Mar-2023 to 31-Mar-2023.\n- `PARALLELPERIOD('Date'[Date], -1, YEAR)` returns 1-Jan-2023 to 31-Dec-2023.\n- `PARALLELPERIOD('Date'[Date], -1, QUARTER)` returns 1-Oct-2023 to 31-Dec-2023 (all of Q4 2023).\n- `PARALLELPERIOD('Date'[Date], -1, MONTH)` returns 1-Feb-2024 to 29-Feb-2024.\n\nSo with MONTH on a month row, PARALLELPERIOD and DATEADD give the same result. The difference shows up when the interval is bigger than the row's granularity.",
      tip: "Remember: DATEADD = 'same slice, moved'. PARALLELPERIOD = 'whole period, moved'.",
    },
    {
      heading: "Behaviour at different levels",
      content: "When several periods are visible, PARALLELPERIOD covers every full interval touched by the shifted dates.\n\n- **Month row, -1 YEAR:** whole previous year (repeats on every month row).\n- **Quarter row, -1 QUARTER:** the whole previous quarter.\n- **Year row, -1 QUARTER:** the dates of the year shifted back one quarter (Oct of previous year to Sep), expanded to full quarters, so you get four quarters, not one. This is why PARALLELPERIOD totals can look strange at higher levels; test your visual at each level.\n\nIf a measure only makes sense at one level, protect it with `HASONEVALUE` or `ISINSCOPE`.",
    },
    {
      heading: "When to use PARALLELPERIOD",
      content: "- **Full last year total next to monthly data:** 'This month we did X, last year in total we did Y.'\n- **Percent of last year achieved (run-rate):** YTD sales divided by the full previous year total.\n- **Previous full quarter benchmark:** compare each month of Q2 with the total of Q1.\n- **Simple targets:** a target of '10% above last year' can be built as `PARALLELPERIOD(-1, YEAR)` total x 1.1.\n\nUse DATEADD or SAMEPERIODLASTYEAR when you need like-for-like comparisons (same month last year).",
    },
    {
      heading: "Common mistakes",
      content: "- Using PARALLELPERIOD when you wanted same month last year, then wondering why every month shows the same large number.\n- Passing a fact table date like `Sales[OrderDate]`. Always use `'Date'[Date]` from the marked date table.\n- Forgetting the date table limits: shifting 2023 back a year gives 2022, which is not in our Date table, so the result is blank.\n- Trying DAY as the interval. Only MONTH, QUARTER and YEAR are allowed.",
    },
  ],
  examples: [
    {
      title: "Full previous-year total on every month",
      scenario: "Management wants each month of 2024 to show the full 2023 sales total as a benchmark line.",
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Sales PY (DATEADD)', 'Sales Full PY (PARALLELPERIOD)'],
        rows: [
          ['Jan', '1,20,000', '1,00,000', '14,00,000'],
          ['Feb', '95,000', '1,00,000', '14,00,000'],
          ['Mar', '1,40,000', '1,10,000', '14,00,000'],
        ],
      },
      steps: [
        "Make sure Total Sales = SUM(Sales[SalesAmount]) exists",
        "Modeling > New measure: create Sales PY and Sales Full PY from the code box",
        "Insert a Table visual with 'Date'[Month], Total Sales, Sales PY and Sales Full PY",
        "Add a slicer on 'Date'[Year] = 2024 and sort Month by MonthNo (Column tools > Sort by column)",
        "Compare the last two columns",
      ],
      code: `Sales PY =
CALCULATE([Total Sales], DATEADD('Date'[Date], -1, YEAR))

Sales Full PY =
CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, YEAR))`,
      result: "Sales PY changes by month (same month of 2023), while Sales Full PY shows 14,00,000 (total 2023) on every row.",
      explanation: "DATEADD shifts only January to January 2023. PARALLELPERIOD shifts and expands to the full year 2023, so every month sees the same year total.",
    },
    {
      title: "Previous full quarter as a benchmark",
      scenario: "The sales team in Q2 2024 wants to compare each month with the whole of Q1 2024 (3,55,000).",
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Prev Quarter Total', '% of Prev Quarter'],
        rows: [
          ['Apr', '1,10,000', '3,55,000', '31.0%'],
          ['May', '1,30,000', '3,55,000', '36.6%'],
          ['Jun', '1,50,000', '3,55,000', '42.3%'],
        ],
      },
      steps: [
        "Modeling > New measure: create Prev Quarter Total from the code box",
        "Modeling > New measure: create % of Prev Quarter, format as Percentage with 1 decimal",
        "Insert a Table with 'Date'[Month], Total Sales, Prev Quarter Total, % of Prev Quarter",
        "Add slicers: 'Date'[Year] = 2024, 'Date'[Quarter] = Q2",
      ],
      code: `Prev Quarter Total =
CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, QUARTER))

% of Prev Quarter =
DIVIDE([Total Sales], [Prev Quarter Total])`,
      result: "All three Q2 months show 3,55,000 as the benchmark; June alone reached 42.3% of the previous quarter.",
      explanation: "April shifted back one quarter is January; PARALLELPERIOD expands it to all of Q1. Same for May and June, so the benchmark is constant across the quarter.",
    },
    {
      title: "YTD as % of last year's full total (run-rate)",
      scenario: "At the end of June 2024 the CEO asks: what percentage of last year's full sales have we already achieved?",
      table: {
        headers: ['Month (2024)', 'Sales YTD', 'Sales Full PY', '% of LY Achieved'],
        rows: [
          ['Mar', '3,55,000', '14,00,000', '25.4%'],
          ['Jun', '7,45,000', '14,00,000', '53.2%'],
          ['Dec', '15,05,000', '14,00,000', '107.5%'],
        ],
      },
      steps: [
        "Modeling > New measure: Sales YTD = TOTALYTD([Total Sales], 'Date'[Date])",
        "Reuse Sales Full PY from Example 1",
        "Modeling > New measure: create % of LY Achieved from the code box and format as Percentage",
        "Insert a Line and clustered column chart: X-axis 'Date'[Month], columns Sales YTD, line % of LY Achieved",
        "Filter the page to 'Date'[Year] = 2024 in the Filters pane",
      ],
      code: `Sales YTD =
TOTALYTD([Total Sales], 'Date'[Date])

% of LY Achieved =
DIVIDE([Sales YTD], [Sales Full PY])`,
      result: "By June the company has achieved 53.2% of 2023's total; by December it crosses 100% (107.5%).",
      explanation: "Sales Full PY gives the constant full-year denominator from PARALLELPERIOD, while TOTALYTD gives the running numerator. The ratio is a simple run-rate KPI.",
    },
  ],
  interview: [
    { q: "What does PARALLELPERIOD return?", a: "A table of dates shifted by the given number of months, quarters or years, expanded to cover complete periods of that interval.", level: 'Easy' },
    { q: "Which intervals does PARALLELPERIOD support?", a: "MONTH, QUARTER and YEAR. DAY is not supported (DATEADD supports DAY).", level: 'Easy' },
    { q: "On a March 2024 row, what do DATEADD(-1, YEAR) and PARALLELPERIOD(-1, YEAR) return?", a: "DATEADD returns March 2023 only. PARALLELPERIOD returns the full year 2023 (1-Jan-2023 to 31-Dec-2023).", level: 'Medium' },
    { q: "When would you choose PARALLELPERIOD over SAMEPERIODLASTYEAR?", a: "When you need the complete previous period total, such as full last year sales as a benchmark or denominator, rather than the same slice of last year.", level: 'Medium' },
    { q: "How is PARALLELPERIOD different from PREVIOUSYEAR?", a: "PREVIOUSYEAR always returns the full previous year relative to the last date in context, with an optional year-end date. PARALLELPERIOD is more general: any number of intervals, forward or backward, for months, quarters or years.", level: 'Medium' },
    { q: "Scenario: a user says every month in your 'Last Year Sales' column shows the same value. What happened?", a: "The measure probably uses PARALLELPERIOD('Date'[Date], -1, YEAR), which returns the full previous year on each month. For same-month comparison use SAMEPERIODLASTYEAR or DATEADD(-1, YEAR).", level: 'Hard' },
    { q: "Scenario: you want a target equal to last year's full total plus 10%, shown on every month. Write it.", a: "Target = CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, YEAR)) * 1.1. Then compare Sales YTD against it, or divide by 12 for a monthly target.", level: 'Hard' },
  ],
  practice: [
    { task: "Create Prev Month Total with PARALLELPERIOD and compare it with DATEADD(-1, MONTH) at month level.", hint: "At month level they should match.", solution: "Prev Month Total = CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, MONTH)). On each month row it equals CALCULATE([Total Sales], DATEADD('Date'[Date], -1, MONTH))." },
    { task: "Create a measure showing the full previous-year order count.", hint: "COUNTROWS(Sales) inside CALCULATE.", solution: "Orders Full PY = CALCULATE(COUNTROWS(Sales), PARALLELPERIOD('Date'[Date], -1, YEAR))" },
    { task: "Build a monthly target = (full last year total x 1.1) / 12 and compare with monthly Total Sales in a column chart.", hint: "Use PARALLELPERIOD for last year total.", solution: "Monthly Target = DIVIDE(CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, YEAR)) * 1.1, 12). For 2024 this is 14,00,000 x 1.1 / 12 = 1,28,333 per month." },
    { task: "Create Full PY Electronics: full previous-year sales for Electronics only. Test it in the DAX Lab.", hint: "Add a Product[Category] filter.", solution: "Full PY Electronics = CALCULATE([Total Sales], PARALLELPERIOD('Date'[Date], -1, YEAR), Product[Category] = \"Electronics\")" },
  ],
  quiz: [
    { question: "On a June 2024 row, PARALLELPERIOD('Date'[Date], -1, YEAR) returns:", options: ["June 2023", "Jan-Jun 2023", "All of 2023", "May 2024"], answer: 2, explanation: "PARALLELPERIOD expands to the complete shifted year." },
    { question: "Which interval is NOT valid for PARALLELPERIOD?", options: ["MONTH", "QUARTER", "YEAR", "DAY"], answer: 3, explanation: "PARALLELPERIOD supports MONTH, QUARTER and YEAR only." },
    { question: "On an April 2024 row, PARALLELPERIOD('Date'[Date], -1, QUARTER) returns:", options: ["March 2024", "All of Q1 2024", "April 2023", "All of Q2 2023"], answer: 1, explanation: "April shifted back one quarter is January, expanded to the full Q1." },
    { question: "Which function gives the SAME month last year?", options: ["PARALLELPERIOD(dates, -1, YEAR)", "SAMEPERIODLASTYEAR(dates)", "PREVIOUSYEAR(dates)", "DATESYTD(dates)"], answer: 1, explanation: "SAMEPERIODLASTYEAR (or DATEADD -1 YEAR) shifts only the dates in context." },
    { question: "Why is PARALLELPERIOD(-1, YEAR) for any 2023 month blank in the practice model?", options: ["2022 is not in the Date table", "PARALLELPERIOD only works for 2024", "The Date table must be unmarked", "YEAR must be in quotes"], answer: 0, explanation: "The Date table starts on 2023-01-01, so shifted 2022 dates do not exist." },
  ],
};
