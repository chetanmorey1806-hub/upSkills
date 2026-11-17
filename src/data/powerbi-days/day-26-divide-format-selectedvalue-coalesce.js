export default {
  id: 'day-26-divide-format-selectedvalue-coalesce',
  title: 'DIVIDE(), FORMAT(), SELECTEDVALUE(), COALESCE()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 26,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Four everyday helper functions that make measures safe and report-friendly: DIVIDE handles divide-by-zero, FORMAT turns numbers and dates into text labels, SELECTEDVALUE reads what the user picked in a slicer, and COALESCE replaces blanks with a default value.',
  objectives: [
    'Write safe ratios with DIVIDE() and its alternate result',
    'Convert numbers and dates into readable text with FORMAT() and know its side effects',
    'Read the single selected value of a column with SELECTEDVALUE() to build dynamic titles',
    'Replace BLANK results with COALESCE() and understand when that is a good idea',
    'Combine all four in KPI labels and dynamic titles',
  ],
  theory: [
    {
      heading: 'DIVIDE(): safe division',
      content:
        `The \`/\` operator returns **Infinity** or an error-like value when the denominator is 0, and NaN for 0/0. In a visual this looks ugly ("Infinity") and can break totals.\n\n\`DIVIDE(numerator, denominator, [alternate result])\` returns:\n- numerator / denominator when the denominator is not 0 or blank\n- the **alternate result** when it is 0 or blank (BLANK by default)\n\nExamples:\n- \`Margin % = DIVIDE([Total Sales] - [Total Cost], [Total Sales])\`\n- \`Avg Price = DIVIDE([Total Sales], SUM(Sales[Quantity]))\`\n- \`Growth % = DIVIDE([Total Sales] - [Sales LY], [Sales LY], 0)\` - returns 0 when there is no last year\n\nReturning BLANK (the default) is usually best, because rows with blank in every measure disappear from visuals. Use \`/\` only when the denominator can never be zero (e.g. dividing by a constant 100) - it is a little faster.`,
      syntax: `DIVIDE ( <numerator>, <denominator> [, <alternate_result>] )`,
    },
    {
      heading: 'FORMAT(): number or date to text',
      content:
        `FORMAT converts a value to **text** using a format string. Use it for labels, card titles and tooltips.\n\nNumber formats:\n- \`FORMAT(257000, "#,##0")\` -> "257,000"\n- \`FORMAT(0.2249, "0.0%")\` -> "22.5%"\n- \`FORMAT(32125, "0.00")\` -> "32125.00"\n- Predefined: "Currency", "Percent", "Fixed", "Standard"\n\nDate formats:\n- \`FORMAT(DATE(2024,3,25), "dd-mmm-yyyy")\` -> "25-Mar-2024"\n- "mmm yyyy" -> "Mar 2024"; "mmmm" -> "March"; "ddd" -> "Mon"; "yyyy-mm" -> "2024-03"\n\n**Side effects** - very important:\n1. The result is **text**, so it sorts alphabetically ("10,000" before "9,000") and cannot be summed or used in charts as a value.\n2. FORMAT(BLANK(), ...) returns an **empty string**, not BLANK, so a measure wrapped in FORMAT shows rows that would normally be hidden.\n\nFor normal number display, use **Measure tools > Format** (or the Properties pane in Model view) instead of FORMAT - the value stays numeric. Use FORMAT only when you need text, e.g. a sentence.`,
      syntax: `FORMAT ( <value>, <format_string> [, <locale_name>] )`,
      tip: 'The & operator joins text: "Sales: " & FORMAT([Total Sales], "#,##0"). Use UNICHAR(8377) or type the symbol directly to add the Rupee sign.',
    },
    {
      heading: 'SELECTEDVALUE(): what did the user pick?',
      content:
        `SELECTEDVALUE returns the value of a column **when exactly one value is visible** in the current filter context; otherwise it returns the alternate result (BLANK by default).\n\n- Slicer on Customer[City] with "Pune" selected -> \`SELECTEDVALUE(Customer[City])\` = "Pune"\n- Nothing selected (4 cities visible) -> BLANK, or your alternate: \`SELECTEDVALUE(Customer[City], "All Cities")\`\n- In a table visual row for "Mumbai" -> "Mumbai" (the row filters to one value)\n\nUses:\n- **Dynamic titles**: \`"Sales for " & SELECTEDVALUE(Customer[City], "All Cities")\`\n- **Logic based on a selection**: \`SWITCH(SELECTEDVALUE(Product[Category]), "Electronics", ..., ...)\`\n- **Lookup** in an unrelated table (Day 25 Target example)\n\nIt is shorthand for \`IF(HASONEVALUE(col), VALUES(col), alternate)\`.`,
      syntax: `SELECTEDVALUE ( <column> [, <alternate_result>] )`,
    },
    {
      heading: 'COALESCE(): first non-blank value',
      content:
        `COALESCE returns the first argument that is **not BLANK**. If all are blank it returns BLANK.\n\n- \`Sales or Zero = COALESCE([Total Sales], 0)\`\n- \`Display Name = COALESCE(SELECTEDVALUE(Customer[Customer]), "Multiple customers")\`\n- \`Price Used = COALESCE([Discount Price], [List Price], 0)\` - a fallback chain\n\nIt replaces the older pattern \`IF(ISBLANK([Total Sales]), 0, [Total Sales])\` and calculates the measure only once.\n\n**Warning**: replacing BLANK with 0 makes **every** combination appear in a table or matrix (e.g. all 24 months or every product x every city), because Power BI hides only rows where all measures are blank. Use COALESCE to 0 on cards and on visuals where zeros are meaningful (e.g. "no sales this month"), not blindly on every measure.`,
      syntax: `COALESCE ( <expression1>, <expression2> [, <expression3> ...] )`,
    },
    {
      heading: 'Putting it together: KPI labels',
      content:
        `These functions are often combined into a single text measure used in a card or a visual title (see the syntax box).\n\nTo use a text measure as a visual title: select the visual > Format pane > **General > Title** > click the **fx** button next to Text > Format style: **Field value** > choose the measure.`,
      syntax: `KPI Label =
VAR City = SELECTEDVALUE ( Customer[City], "All Cities" )
VAR SalesAmt = COALESCE ( [Total Sales], 0 )
VAR Margin = DIVIDE ( [Total Sales] - [Total Cost], [Total Sales] )
RETURN
    City & ": " & FORMAT ( SalesAmt, "#,##0" ) & " sales at " & FORMAT ( Margin, "0.0%" ) & " margin"`,
    },
    {
      heading: 'Mini sample reference numbers',
      content:
        `Using the 8-row sample from Day 23:\n- Total Sales 2,57,000; Total Cost 1,99,200; Profit 57,800; Quantity 26\n- By City: Pune 1,20,000 (cost 95,000), Mumbai 13,000 (cost 9,000), Nagpur 14,000 (cost 10,200), Nashik 1,10,000 (cost 85,000)\n- By Category: Electronics 2,30,000 / cost 1,80,000; Accessories 7,000 / 4,200; Furniture 20,000 / 15,000\n- Months with sales: 2023 Jan, Feb, Mar and 2024 Jan, Feb, Mar`,
    },
  ],
  examples: [
    {
      title: 'Margin % with DIVIDE',
      scenario: 'Show profit margin by category, safe against zero sales.',
      table: {
        headers: ['Category', 'Total Sales', 'Total Cost', 'Margin %'],
        rows: [
          ['Accessories', '7,000', '4,200', '40.00%'],
          ['Electronics', '2,30,000', '1,80,000', '21.74%'],
          ['Furniture', '20,000', '15,000', '25.00%'],
          ['Total', '2,57,000', '1,99,200', '22.49%'],
        ],
      },
      steps: [
        'Make sure Total Sales = SUM(Sales[SalesAmount]) and Total Cost = SUM(Sales[Cost]) exist',
        'Modeling > New measure: Margin % (code below)',
        'Measure tools > Format: Percentage, decimal places 2',
        'Insert a Table visual: Product[Category], [Total Sales], [Total Cost], [Margin %]',
      ],
      code: `Margin % =
DIVIDE ( [Total Sales] - [Total Cost], [Total Sales] )`,
      result: 'Accessories 40.00%, Electronics 21.74%, Furniture 25.00%, Total 22.49%.',
      explanation:
        'DIVIDE returns BLANK instead of an error if a filter leaves Total Sales empty (for example a city with no orders).',
    },
    {
      title: 'Average price per unit with an alternate result',
      scenario: 'Show average selling price per unit, and show 0 instead of blank for months without sales on a card.',
      table: {
        headers: ['Filter', 'Avg Unit Price'],
        rows: [
          ['All data', '9,884.62'],
          ['Electronics', '32,857.14'],
          ['Month Apr 2024 (no sales)', '0'],
        ],
      },
      steps: [
        'Modeling > New measure: Avg Unit Price (code below)',
        'Measure tools > Format: Decimal number, 2 decimals, thousands separator on',
        'Add a Card visual with [Avg Unit Price]; add slicers for Product[Category] and Date[YearMonth]',
      ],
      code: `Avg Unit Price =
DIVIDE ( [Total Sales], SUM ( Sales[Quantity] ), 0 )`,
      result: '2,57,000 / 26 = 9,884.62 overall; Electronics 2,30,000 / 7 = 32,857.14; a month with no sales shows 0.',
      explanation:
        'The third argument is used when the denominator is blank or zero. Here it gives a clean 0 on the card.',
    },
    {
      title: 'Text labels with FORMAT',
      scenario: 'Create a card label like "Sales: 257,000 | Margin: 22.5%" and a month label for the last order date.',
      table: {
        headers: ['Measure', 'Result (text)'],
        rows: [
          ['Sales Label', 'Sales: 257,000 | Margin: 22.5%'],
          ['Last Order Month', 'Mar 2024'],
          ['Last Order Date', '25-Mar-2024'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula below',
        'Insert a Card visual and drag [Sales Label] into Fields',
        'Insert a second Card visual for [Last Order Month]',
        'Notice the Data pane shows these measures as text (no summation)',
      ],
      code: `Sales Label =
"Sales: " & FORMAT ( [Total Sales], "#,##0" )
    & " | Margin: " & FORMAT ( [Margin %], "0.0%" )

Last Order Month = FORMAT ( MAX ( Sales[OrderDate] ), "mmm yyyy" )

Last Order Date = FORMAT ( MAX ( Sales[OrderDate] ), "dd-mmm-yyyy" )`,
      result: '"Sales: 257,000 | Margin: 22.5%", "Mar 2024", "25-Mar-2024".',
      explanation:
        'FORMAT returns text which can be joined with &. "#,##0" uses the thousands separator of the model locale, "0.0%" multiplies by 100 and adds %.',
    },
    {
      title: 'Dynamic title with SELECTEDVALUE',
      scenario: 'A column chart of sales by month should have a title that changes with the City slicer.',
      table: {
        headers: ['Slicer selection', 'Chart Title'],
        rows: [
          ['Nothing selected', 'Monthly Sales - All Cities'],
          ['Pune', 'Monthly Sales - Pune'],
          ['Pune + Mumbai', 'Monthly Sales - All Cities'],
        ],
      },
      steps: [
        'Modeling > New measure: Chart Title (code below)',
        'Insert a Slicer visual with Customer[City] in the Field well',
        'Insert a Clustered column chart: X-axis = Date[Month], Y-axis = [Total Sales]',
        'Select the chart > Format pane > General > Title > Text: click the fx button',
        'Format style = Field value, What field should we base this on? = Chart Title, click OK',
        'Select Pune in the slicer and watch the title change',
      ],
      code: `Chart Title =
"Monthly Sales - " & SELECTEDVALUE ( Customer[City], "All Cities" )`,
      result: 'The title shows the selected city, or "All Cities" when zero or several cities are selected.',
      explanation:
        'With exactly one city visible SELECTEDVALUE returns it; otherwise the alternate result. To list several selected cities use CONCATENATEX(VALUES(Customer[City]), Customer[City], ", ").',
    },
    {
      title: 'COALESCE to show 0 for missing months',
      scenario: 'A 2024 monthly table should show 0 for months with no orders instead of hiding them.',
      table: {
        headers: ['Month (2024)', 'Total Sales', 'Sales or Zero'],
        rows: [
          ['Jan', '20,000', '20,000'],
          ['Feb', '58,000', '58,000'],
          ['Mar', '62,000', '62,000'],
          ['Apr', '(blank)', '0'],
          ['May ... Dec', '(blank)', '0'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales or Zero (code below)',
        'Insert a Table visual with Date[Month] and [Sales or Zero]',
        'Add a slicer on Date[Year] and select 2024',
        'Sort the table by Month: make sure Date[Month] is sorted by Date[MonthNo] (Column tools > Sort by column)',
      ],
      code: `Sales or Zero =
COALESCE ( [Total Sales], 0 )`,
      result: 'All 12 months of 2024 appear; Apr to Dec show 0.',
      explanation:
        'With [Total Sales] alone, months with BLANK are hidden. COALESCE turns BLANK into 0, so every month from the Date table is shown.',
    },
  ],
  interview: [
    {
      q: 'Why should you use DIVIDE instead of the / operator?',
      a: 'DIVIDE handles division by zero or blank safely and returns BLANK (or an alternate result) instead of Infinity/NaN. It also makes the intent clear. Use / only when the denominator can never be zero.',
      level: 'Easy',
    },
    {
      q: 'What is the downside of using FORMAT in a measure?',
      a: 'It returns text: the result cannot be aggregated, sorts alphabetically, cannot be plotted as a numeric axis, and FORMAT(BLANK()) returns an empty string, so rows with no data appear in visuals. Prefer the model format string for plain number formatting.',
      level: 'Medium',
    },
    {
      q: 'What does SELECTEDVALUE return when the user selects two cities in a slicer?',
      a: 'The alternate result (BLANK by default), because more than one value is visible.',
      level: 'Easy',
    },
    {
      q: 'How do you create a dynamic title in Power BI?',
      a: 'Create a text measure (e.g. "Sales for " & SELECTEDVALUE(Customer[City], "All Cities")), then on the visual go to Format pane > General > Title > Text > fx > Field value and pick the measure.',
      level: 'Medium',
    },
    {
      q: 'What is COALESCE and how is it better than IF(ISBLANK())?',
      a: 'COALESCE returns the first non-blank argument. It is shorter and evaluates the measure once, while IF(ISBLANK([m]), 0, [m]) may evaluate [m] twice.',
      level: 'Medium',
    },
    {
      q: 'Scenario: After adding COALESCE([Total Sales], 0), your Product x City matrix becomes very large and slow. Why?',
      a: 'Power BI hides combinations where every measure is blank. Replacing blank with 0 makes all combinations non-blank, so the matrix shows every product for every city (and the engine computes them all). Remove COALESCE or apply it only where needed.',
      level: 'Hard',
    },
    {
      q: 'What is SELECTEDVALUE equivalent to?',
      a: 'IF(HASONEVALUE(column), VALUES(column), alternate_result).',
      level: 'Medium',
    },
    {
      q: 'How would you show "Mar 2024" for the latest order date?',
      a: 'FORMAT(MAX(Sales[OrderDate]), "mmm yyyy").',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create Cost % of Sales and format it as percentage.',
      hint: 'DIVIDE Total Cost by Total Sales.',
      solution: `Cost % = DIVIDE ( [Total Cost], [Total Sales] )
-- Total 1,99,200 / 2,57,000 = 77.51%`,
    },
    {
      task: 'Create a measure "Selected Segment" that shows the segment chosen in a slicer, or "Both Segments".',
      hint: 'SELECTEDVALUE with an alternate result.',
      solution: `Selected Segment = SELECTEDVALUE ( Customer[Segment], "Both Segments" )`,
    },
    {
      task: 'Build a card text: "Orders: 8 | Avg: 32,125". Try it in the DAX Lab.',
      hint: 'Use COUNTROWS(Sales), DIVIDE and FORMAT with &.',
      solution: `Orders Label =
"Orders: " & COUNTROWS ( Sales )
    & " | Avg: " & FORMAT ( DIVIDE ( [Total Sales], COUNTROWS ( Sales ) ), "#,##0" )`,
    },
    {
      task: 'Create a measure that shows the customer name if one is selected, otherwise the number of customers like "4 customers".',
      hint: 'COALESCE(SELECTEDVALUE(...), DISTINCTCOUNT(...) & " customers").',
      solution: `Customer Label =
COALESCE (
    SELECTEDVALUE ( Customer[Customer] ),
    DISTINCTCOUNT ( Customer[Customer] ) & " customers"
)`,
    },
    {
      task: 'Create Profit per Order with 0 when there are no orders.',
      hint: 'DIVIDE with the third argument.',
      solution: `Profit per Order = DIVIDE ( [Total Sales] - [Total Cost], COUNTROWS ( Sales ), 0 )
-- 57,800 / 8 = 7,225`,
    },
  ],
  quiz: [
    {
      question: 'DIVIDE(100, 0) returns:',
      options: ['0', 'Infinity', 'BLANK', 'An error'],
      answer: 2,
      explanation: 'Without an alternate result, DIVIDE returns BLANK when the denominator is zero.',
    },
    {
      question: 'What data type does FORMAT return?',
      options: ['Whole number', 'Decimal number', 'Text', 'Date'],
      answer: 2,
      explanation: 'FORMAT always returns text.',
    },
    {
      question: 'SELECTEDVALUE(Customer[City], "All") with no slicer selection returns:',
      options: ['Pune', '"All"', 'BLANK', 'An error'],
      answer: 1,
      explanation: 'All 4 cities are visible, so the alternate result is returned.',
    },
    {
      question: 'COALESCE(BLANK(), BLANK(), 5, 7) returns:',
      options: ['BLANK', '5', '7', '12'],
      answer: 1,
      explanation: 'It returns the first non-blank argument.',
    },
    {
      question: 'Which format string displays 0.2249 as 22.5%?',
      options: ['"0.0%"', '"#,##0"', '"0.00"', '"mmm yyyy"'],
      answer: 0,
      explanation: '"0.0%" multiplies by 100 and shows one decimal with a % sign.',
    },
  ],
};
