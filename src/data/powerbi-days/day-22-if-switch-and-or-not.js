export default {
  id: 'day-22-if-switch-and-or-not',
  title: 'IF(), SWITCH(), AND(), OR(), NOT()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 22,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Logical functions let your measures and columns make decisions: label performance, assign bands, flag exceptions and filter with conditions. IF handles one decision, SWITCH handles many, and AND/OR/NOT combine conditions.',
  objectives: [
    'Write IF with two and three arguments and know what happens when the false part is omitted',
    'Replace nested IFs with SWITCH and the SWITCH(TRUE()) pattern',
    'Combine conditions with AND, OR, NOT and their operators &&, ||',
    'Use logical functions both in calculated columns (row by row) and in measures (per filter context)',
    'Handle blank results so dimension members without data do not appear wrongly',
  ],
  theory: [
    {
      heading: 'IF()',
      content:
        "`IF` checks a condition and returns one value when it is TRUE and another when it is FALSE. It works exactly like Excel's IF.\n\n**Arguments**:\n- **LogicalTest**: any expression that returns TRUE/FALSE, e.g. `[Total Sales] >= 1000000` or `Sales[UnitPrice] >= 10000`\n- **ResultIfTrue**: value returned when the test is TRUE\n- **ResultIfFalse** (optional): value returned when FALSE. If omitted, IF returns **BLANK**\n\nBoth results should usually be the same data type (both text or both numbers). Mixing types (\"High\" vs 0) forces conversion and can cause errors in visuals.\n\nYou can nest IFs: `IF(a, \"X\", IF(b, \"Y\", \"Z\"))`, but more than two levels becomes hard to read - use SWITCH.",
      syntax: 'IF(<LogicalTest>, <ResultIfTrue> [, <ResultIfFalse>])',
    },
    {
      heading: 'SWITCH()',
      content:
        "`SWITCH` compares one expression against a list of values and returns the matching result. Think of a railway signal switch: one input, many tracks.\n\n**Arguments**:\n- **Expression**: the value to test, e.g. `Customer[City]` or `SELECTEDVALUE(Product[Category])`\n- **Value1, Result1**: if Expression = Value1, return Result1\n- **Value2, Result2, ...**: more pairs\n- **Else** (optional): returned when nothing matches; if omitted, BLANK\n\nExample (calculated column on Customer):\n`Zone = SWITCH(Customer[City], \"Pune\", \"West\", \"Mumbai\", \"West\", \"Nagpur\", \"Vidarbha\", \"Other\")`",
      syntax: 'SWITCH(<Expression>, <Value1>, <Result1> [, <Value2>, <Result2>]... [, <Else>])',
    },
    {
      heading: 'The SWITCH(TRUE()) pattern for ranges',
      content:
        "Plain SWITCH only checks **equality**. For ranges (>=, <) use `SWITCH(TRUE(), ...)`: the expression is TRUE, so SWITCH returns the result of the **first condition that is TRUE**. Order matters: put the strictest condition first.\n\n```\nSales Grade =\nSWITCH(\n    TRUE(),\n    [Total Sales] >= 1000000, \"A\",\n    [Total Sales] >= 150000, \"B\",\n    \"C\"\n)\n```\n\nThis replaces `IF(x >= 1000000, \"A\", IF(x >= 150000, \"B\", \"C\"))` and is much easier to read and extend.",
      tip: 'Always handle BLANK first in SWITCH(TRUE()) measures: ISBLANK([Total Sales]), BLANK(). Otherwise items with no sales fall to the else branch and suddenly appear in your visual.',
    },
    {
      heading: 'AND() and OR()',
      content:
        "**AND** returns TRUE only when **both** conditions are TRUE. **OR** returns TRUE when **at least one** condition is TRUE.\n\n**Arguments** (both functions):\n- **Logical1**: first TRUE/FALSE expression\n- **Logical2**: second TRUE/FALSE expression\n\nUnlike Excel, DAX AND and OR accept **exactly two arguments**. For three or more conditions either nest them `AND(a, AND(b, c))` or use the operators: `a && b && c` and `a || b || c`.\n\n- `AND([Total Sales] > 500000, [Margin %] > 0.30)` is the same as `[Total Sales] > 500000 && [Margin %] > 0.30`\n- `OR(Customer[City] = \"Pune\", Customer[City] = \"Mumbai\")` is the same as `Customer[City] = \"Pune\" || Customer[City] = \"Mumbai\"` and also `Customer[City] IN {\"Pune\", \"Mumbai\"}`",
      syntax: `AND(<Logical1>, <Logical2>)
OR(<Logical1>, <Logical2>)`,
    },
    {
      heading: 'NOT()',
      content:
        "`NOT` flips TRUE to FALSE and FALSE to TRUE.\n\n**Argument**:\n- **Logical**: any TRUE/FALSE expression\n\nCommon uses:\n- `NOT(ISBLANK([Total Sales]))` -> TRUE when there are sales\n- `CALCULATE([Total Sales], NOT(Product[Category] = \"Electronics\"))` -> sales of everything except Electronics (same as using `<>`)\n- `NOT(Customer[City] IN {\"Pune\", \"Mumbai\"})` -> cities outside the list",
      syntax: 'NOT(<Logical>)',
    },
    {
      heading: 'Logical functions in columns vs measures',
      content:
        "- In a **calculated column** the condition checks **each row**: `IF(Sales[Quantity] >= 3, \"Bulk\", \"Single\")`. The result can be used in slicers and axes.\n- In a **measure** the condition checks **aggregated values** in the current filter context: `IF([Total Sales] >= 1000000, \"High\", \"Normal\")`. It is evaluated per cell, including the Total row.\n\nRemember that the Total row also runs the measure. A label like \"Star\" may appear on the total if the overall numbers satisfy the condition. Use `HASONEVALUE` or `ISINSCOPE` (later days) if you want to hide it.",
    },
  ],
  examples: [
    {
      title: 'Example 1: IF measure - High vs Normal products (and the Desk trap)',
      scenario: 'Label products with sales of 10,00,000 or more as High.',
      table: {
        headers: ['Product', 'Total Sales', 'Sales Status (v1)', 'Sales Status (v2)'],
        rows: [
          ['Desk', '', 'Normal', ''],
          ['Headphones', '1,10,938', 'Normal', 'Normal'],
          ['Keyboard', '46,637', 'Normal', 'Normal'],
          ['Laptop', '17,39,560', 'High', 'High'],
          ['Mobile', '10,08,232', 'High', 'High'],
          ['Office Chair', '1,89,586', 'Normal', 'Normal'],
          ['Total', '30,94,953', 'High', 'High'],
        ],
      },
      steps: [
        'Modeling > New measure: Sales Status v1 (code below)',
        'Insert a Table visual with Product[Product], Total Sales and Sales Status v1',
        'Notice Desk appears with "Normal" even though it has no sales',
        'Modeling > New measure: Sales Status v2 with the ISBLANK check',
        'Replace v1 with v2 in the table: Desk disappears',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales Status v1 = IF([Total Sales] >= 1000000, "High", "Normal")

Sales Status v2 =
IF(
    ISBLANK([Total Sales]),
    BLANK(),
    IF([Total Sales] >= 1000000, "High", "Normal")
)`,
      result: 'Laptop and Mobile are High; the others Normal. v1 shows Desk as Normal; v2 hides Desk. The Total row is High because 30,94,953 >= 10,00,000.',
      explanation: 'BLANK >= 1000000 is FALSE, so v1 returns "Normal" for Desk and the non-blank text makes the row visible. v2 returns BLANK when there are no sales.',
    },
    {
      title: 'Example 2: SWITCH(TRUE()) for sales grades',
      scenario: 'Grade products A (10,00,000+), B (1,50,000+) or C.',
      table: {
        headers: ['Product', 'Total Sales', 'Sales Grade'],
        rows: [
          ['Headphones', '1,10,938', 'C'],
          ['Keyboard', '46,637', 'C'],
          ['Laptop', '17,39,560', 'A'],
          ['Mobile', '10,08,232', 'A'],
          ['Office Chair', '1,89,586', 'B'],
          ['Total', '30,94,953', 'A'],
        ],
      },
      steps: [
        'Modeling > New measure and enter the formula below (use Shift+Enter for new lines)',
        'Table visual: Product[Product], Total Sales, Sales Grade',
        'Paste the same measure into the DAX Lab with Product on rows to verify',
      ],
      code: `Sales Grade =
SWITCH(
    TRUE(),
    ISBLANK([Total Sales]), BLANK(),
    [Total Sales] >= 1000000, "A",
    [Total Sales] >= 150000, "B",
    "C"
)`,
      result: 'Laptop A, Mobile A, Office Chair B, Headphones C, Keyboard C. Desk is hidden (blank).',
      explanation: 'SWITCH(TRUE()) returns the result of the first condition that is TRUE. Mobile (10,08,232) passes the first test so it never reaches the B test.',
    },
    {
      title: 'Example 3: SWITCH in a calculated column - City to Zone',
      scenario: 'Create a Zone column on Customer and analyse sales by zone.',
      table: {
        headers: ['Zone', 'Total Sales'],
        rows: [
          ['North Maharashtra', '2,09,730'],
          ['Vidarbha', '11,73,782'],
          ['West', '17,11,441'],
          ['Total', '30,94,953'],
        ],
      },
      steps: [
        'Table view > select Customer > Table tools > New column',
        'Enter the Zone formula below and press Enter',
        'Report view: Table visual with Customer[Zone] and Total Sales',
        'Add a slicer on Customer[Zone]',
      ],
      code: `Zone =
SWITCH(
    Customer[City],
    "Pune", "West",
    "Mumbai", "West",
    "Nagpur", "Vidarbha",
    "Nashik", "North Maharashtra",
    "Unknown"
)`,
      result: 'West = Pune 9,10,332 + Mumbai 8,01,109 = 17,11,441; Vidarbha 11,73,782; North Maharashtra 2,09,730.',
      explanation: 'SWITCH checks each customer row city against the list. Because Zone is a column, it can be used in a slicer and on an axis.',
    },
    {
      title: 'Example 4: AND and OR in measures - Star customers and Review flags',
      scenario: 'Star customer = sales above 5,00,000 AND margin above 30%. Review = margin below 29% OR sales below 2,50,000.',
      table: {
        headers: ['Customer', 'Total Sales', 'Margin %', 'Customer Type', 'Review Flag'],
        rows: [
          ['Asha Traders', '6,36,464', '28.27%', 'Regular', 'Review'],
          ['Kiran Mart', '2,09,730', '30.42%', 'Regular', 'Review'],
          ['Neha Enterprises', '11,73,782', '30.52%', 'Star', 'OK'],
          ['Om Electronics', '2,73,868', '33.36%', 'Regular', 'OK'],
          ['Ravi Stores', '4,53,144', '28.82%', 'Regular', 'Review'],
          ['Sai Furnishers', '3,47,965', '30.29%', 'Regular', 'OK'],
          ['Total', '30,94,953', '30.03%', 'Star', 'OK'],
        ],
      },
      steps: [
        'Modeling > New measure for Margin %, Customer Type and Review Flag (code below)',
        'Format Margin % as Percentage with 2 decimals',
        'Table visual: Customer[Customer], Total Sales, Margin %, Customer Type, Review Flag',
        'Format pane > Cell elements > Background color on Review Flag (rules: "Review" = light red) to highlight',
      ],
      code: `Margin % = DIVIDE(SUM(Sales[SalesAmount]) - SUM(Sales[Cost]), SUM(Sales[SalesAmount]))

Customer Type =
IF(AND([Total Sales] > 500000, [Margin %] > 0.30), "Star", "Regular")

Review Flag =
IF(OR([Margin %] < 0.29, [Total Sales] < 250000), "Review", "OK")`,
      result: 'Only Neha Enterprises is a Star. Asha Traders (low margin), Kiran Mart (low sales) and Ravi Stores (low margin) need review.',
      explanation: 'Asha has high sales but fails the margin test, so AND is FALSE. Kiran has a good margin but low sales, and OR needs only one TRUE condition to flag Review. The Total row is evaluated too, so it shows Star / OK.',
    },
    {
      title: 'Example 5: NOT and && in filters and columns',
      scenario: 'Calculate sales outside Electronics, and flag bulk premium order lines (quantity 3+ AND unit price 10,000+).',
      table: {
        headers: ['Item', 'Result'],
        rows: [
          ['Non-Electronics Sales (measure)', '3,47,161'],
          ['Bulk Premium rows (column = "Bulk Premium")', '18'],
          ['Other rows', '42'],
        ],
      },
      steps: [
        'Modeling > New measure: Non-Electronics Sales (code below), show it in a Card',
        'Table view > Sales > New column: Line Type (code below)',
        'Report view: Table visual with Sales[Line Type] and Orders = COUNTROWS(Sales)',
      ],
      code: `Non-Electronics Sales =
CALCULATE([Total Sales], NOT(Product[Category] = "Electronics"))

-- calculated column in Sales
Line Type =
IF(Sales[Quantity] >= 3 && Sales[UnitPrice] >= 10000, "Bulk Premium", "Other")`,
      result: 'Card: 3,47,161 (Accessories 1,57,575 + Furniture 1,89,586). Line Type: Bulk Premium 18 rows, Other 42 rows.',
      explanation: 'NOT reverses the condition so CALCULATE keeps all categories except Electronics. In the column, && checks both conditions for each row; only Laptop and Mobile lines with 3+ units qualify.',
    },
  ],
  interview: [
    {
      q: 'What happens if you omit the third argument of IF?',
      a: 'When the condition is FALSE, IF returns BLANK. This is useful in measures because blank rows are hidden in visuals.',
      level: 'Easy',
    },
    {
      q: 'When would you use SWITCH instead of IF?',
      a: 'When there are more than two outcomes. SWITCH avoids deeply nested IFs and is easier to read and maintain. SWITCH(TRUE(), ...) handles ranges.',
      level: 'Easy',
    },
    {
      q: 'Explain SWITCH(TRUE()). Why does the order of conditions matter?',
      a: 'The expression TRUE() is compared with each condition, so SWITCH returns the result of the first condition that evaluates to TRUE. If a looser condition (>= 1,50,000) comes before a stricter one (>= 10,00,000), large values stop at the looser one and get the wrong label.',
      level: 'Medium',
    },
    {
      q: 'How many arguments do AND and OR take in DAX? How do you combine three conditions?',
      a: 'Exactly two. For three or more use nesting AND(a, AND(b, c)) or the operators a && b && c / a || b || c.',
      level: 'Medium',
    },
    {
      q: 'Scenario: your IF measure makes products with no sales appear in the table. Why and how do you fix it?',
      a: 'For those products the measure returns a non-blank value (the false branch text), so the visual shows the row. Return BLANK when the base measure is blank: IF(ISBLANK([Total Sales]), BLANK(), ...).',
      level: 'Hard',
    },
    {
      q: 'Should a sales band be a calculated column or a measure?',
      a: 'If you need to slice or group by the band at row level (e.g. order size band), use a column. If the band depends on aggregated values that change with filters (e.g. product grade by total sales), use a measure.',
      level: 'Medium',
    },
    {
      q: 'Write a measure that returns "Target Met" if sales are at least 15,00,000, otherwise the shortfall amount as text.',
      a: 'IF([Total Sales] >= 1500000, "Target Met", "Short by " & FORMAT(1500000 - [Total Sales], "#,##0")). For 2023 (14,32,315) it returns Short by 67,685.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between NOT and <>?',
      a: 'NOT reverses any logical expression, including complex ones like NOT(ISBLANK(x)) or NOT(col IN {...}). <> only compares two values. For a simple single-value check both give the same result.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a calculated column Order Size in Sales: "Large" if SalesAmount >= 1,00,000, "Medium" if >= 20,000, else "Small". Count orders per size.',
      hint: 'SWITCH(TRUE(), Sales[SalesAmount] >= 100000, "Large", ...).',
      solution: 'Order Size = SWITCH(TRUE(), Sales[SalesAmount] >= 100000, "Large", Sales[SalesAmount] >= 20000, "Medium", "Small"). Large 9 orders, Medium 24, Small 27 (total 60).',
    },
    {
      task: 'Write a Year Target measure: "Met" if Total Sales >= 15,00,000 else "Not met", shown by Sales[Year].',
      hint: 'IF with three arguments.',
      solution: '2023 (14,32,315) Not met; 2024 (16,62,638) Met; Total Met.',
    },
    {
      task: 'Write Pune Corporate Sales using AND inside CALCULATE with FILTER, and check it in the DAX Lab.',
      hint: 'CALCULATE([Total Sales], FILTER(Customer, AND(Customer[City] = "Pune", Customer[Segment] = "Corporate"))).',
      solution: 'Result 6,36,464 (Asha Traders is the only Corporate customer in Pune).',
    },
    {
      task: 'Write a measure Has Sales = NOT(ISBLANK([Total Sales])) and use it as a visual filter on a Product slicer.',
      hint: 'Filters pane > drag Has Sales to the slicer visual filter, set "is" True.',
      solution: 'The slicer lists only the 5 products with sales; Desk is hidden.',
    },
    {
      task: 'Create a Price Segment measure by Category using SWITCH on SELECTEDVALUE(Product[Category]): Electronics -> "High value", Furniture -> "Mid value", Accessories -> "Low value", else "All".',
      hint: 'SWITCH(SELECTEDVALUE(Product[Category]), "Electronics", "High value", ...).',
      solution: 'Each category row shows its label; the Total row shows "All" because SELECTEDVALUE returns blank when several categories are visible.',
    },
  ],
  quiz: [
    {
      question: 'IF([Total Sales] > 100, "Yes") returns what when sales are 50?',
      options: ['"No"', '0', 'BLANK', 'Error'],
      answer: 2,
      explanation: 'Without ResultIfFalse, IF returns BLANK.',
    },
    {
      question: 'Which pattern handles ranges like >= 10,00,000, >= 1,50,000?',
      options: ['SWITCH(Customer[City], ...)', 'SWITCH(TRUE(), ...)', 'AND(TRUE())', 'NOT(SWITCH())'],
      answer: 1,
      explanation: 'SWITCH(TRUE(), condition1, result1, ...) returns the first TRUE condition result.',
    },
    {
      question: 'How many arguments does DAX AND() accept?',
      options: ['One', 'Exactly two', 'Up to 255', 'Unlimited'],
      answer: 1,
      explanation: 'DAX AND/OR take two arguments; use && or || for more conditions.',
    },
    {
      question: 'Customer Type = IF(AND([Total Sales] > 500000, [Margin %] > 0.30), "Star", "Regular"). Asha Traders has 6,36,464 sales and 28.27% margin. Result?',
      options: ['Star', 'Regular', 'BLANK', 'Error'],
      answer: 1,
      explanation: 'The margin test fails, so AND is FALSE and the result is Regular.',
    },
    {
      question: 'CALCULATE([Total Sales], NOT(Product[Category] = "Electronics")) on the practice data returns:',
      options: ['27,47,792', '3,47,161', '30,94,953', '1,57,575'],
      answer: 1,
      explanation: 'It keeps Accessories (1,57,575) and Furniture (1,89,586) = 3,47,161.',
    },
  ],
};
