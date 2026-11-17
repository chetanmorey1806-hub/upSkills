export default {
  id: 'day-18-intro-dax-syntax-operators',
  title: 'Introduction to DAX, DAX Syntax, Operators',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 18,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'DAX (Data Analysis Expressions) is the formula language of Power BI. Today you learn how a DAX formula is written, how to reference tables and columns, and how arithmetic, comparison, text and logical operators work.',
  objectives: [
    'Explain what DAX is and where it is used (measures, calculated columns, calculated tables)',
    'Write correct DAX syntax: name, equals sign, functions, Table[Column] references, [Measure] references',
    'Use arithmetic, comparison, text concatenation and logical operators',
    'Understand operator precedence and how BLANK behaves in calculations',
    'Write and test your first measures in Power BI Desktop and the DAX Lab',
  ],
  theory: [
    {
      heading: 'What is DAX?',
      content:
        "**DAX** stands for **Data Analysis Expressions**. It is the formula language used in Power BI, Analysis Services and Power Pivot in Excel. If Excel formulas work on **cells**, DAX works on **tables and columns**.\n\nYou use DAX to create three things:\n1. **Measures**: calculations that respond to filters (Total Sales, Profit %). Created with **Modeling > New measure**. Most DAX you write will be measures.\n2. **Calculated columns**: a new column computed row by row and stored in the table (Day 19). **Modeling > New column**.\n3. **Calculated tables**: a whole new table from a formula, like the Date table on Day 17. **Modeling > New table**.\n\nDAX vs M: M (Power Query) cleans and shapes data **before** loading. DAX calculates **after** loading, inside the model.",
    },
    {
      heading: 'Anatomy of a DAX formula',
      content:
        "Every DAX formula follows this pattern:\n\n`Total Sales = SUM(Sales[SalesAmount])`\n\n- `Total Sales` : the **name** of the measure (spaces are allowed)\n- `=` : separates name and expression\n- `SUM` : a **function**\n- `( )` : wrap the function **arguments**\n- `Sales` : the **table** name\n- `[SalesAmount]` : the **column** name in square brackets\n\nReferences:\n- Column: `Sales[SalesAmount]` (always write the table name for columns)\n- Measure: `[Total Sales]` (write measures **without** table name; this makes them easy to tell apart)\n- Table with spaces or reserved names: `'Sales Data'[Amount]`, `'Date'[Year]`\n- Text values in double quotes: `\"Pune\"`; numbers without quotes: `100000`\n- Comments: `// single line`, `-- single line`, `/* multi-line */`",
      syntax: 'Measure Name = FUNCTION(Table[Column], <other arguments>)',
      tip: 'Use Shift + Enter to add a new line in the formula bar and Tab to indent. Long formulas are much easier to read on several lines.',
    },
    {
      heading: 'Arithmetic operators',
      content:
        "- `+` addition: `[Total Sales] + 1000`\n- `-` subtraction / negative sign: `[Total Sales] - [Total Cost]`\n- `*` multiplication: `Sales[Quantity] * Sales[UnitPrice]`\n- `/` division: `[Profit] / [Total Sales]`\n- `^` power: `2 ^ 3` returns 8\n\nDivision by zero with `/` returns **Infinity** (or NaN for 0/0) instead of a clean blank. That is why professionals use **DIVIDE(numerator, denominator, [alternate])** which returns BLANK (or your alternate value) when the denominator is 0 or blank.",
      syntax: 'DIVIDE(<Numerator>, <Denominator> [, <AlternateResult>])',
    },
    {
      heading: 'Comparison operators',
      content:
        "Comparison operators return **TRUE** or **FALSE**. They are used inside IF, FILTER and CALCULATE.\n\n- `=` equal to: `Customer[City] = \"Pune\"`\n- `==` strict equal (BLANK is not equal to 0 or empty text)\n- `<>` not equal to: `Product[Category] <> \"Furniture\"`\n- `>` greater than, `<` less than\n- `>=` greater than or equal, `<=` less than or equal\n\nText comparison with `=` is **case-insensitive** in DAX: \"pune\" = \"Pune\" is TRUE.",
    },
    {
      heading: 'Text and logical operators',
      content:
        "- `&` **concatenation**: joins text. `\"City: \" & \"Pune\"` returns `City: Pune`. Numbers are converted to text automatically, but use FORMAT to control the look.\n- `&&` **AND**: TRUE only when both sides are TRUE. `Customer[Segment] = \"Corporate\" && Customer[City] = \"Pune\"`\n- `||` **OR**: TRUE when at least one side is TRUE. `Customer[City] = \"Mumbai\" || Customer[City] = \"Pune\"`\n- `IN` **list membership**: `Product[Category] IN {\"Electronics\", \"Furniture\"}`. The curly braces `{ }` build a small list (table constructor).\n- `NOT` reverses TRUE/FALSE: `NOT(Customer[City] = \"Pune\")`\n\nThe functions AND(), OR(), NOT() do the same job (Day 22), but `&&` and `||` can chain more than two conditions easily.",
    },
    {
      heading: 'Operator precedence and BLANK',
      content:
        "When a formula has several operators, DAX evaluates in this order (highest first):\n1. `^` power\n2. `-` sign (negative number)\n3. `*` and `/`\n4. `+` and `-`\n5. `&` concatenation\n6. `=`, `==`, `<>`, `<`, `>`, `<=`, `>=`, `IN`\n7. `NOT`\n8. `&&`\n9. `||`\n\nSo `2 + 3 * 4` = 14, but `(2 + 3) * 4` = 20. Use brackets whenever in doubt.\n\n**BLANK** is DAX's empty value (like NULL). In arithmetic BLANK acts like 0: `BLANK() + 5` = 5. But `BLANK() * 5` stays BLANK and `BLANK() / 5` is BLANK. A measure returning BLANK makes the row disappear from a table visual, which is usually what you want.",
    },
  ],
  examples: [
    {
      title: 'Example 1: Your first measures - Total Sales, Total Cost, Profit',
      scenario: 'Create base measures and combine them with the minus operator.',
      table: {
        headers: ['Category', 'Total Sales', 'Total Cost', 'Profit'],
        rows: [
          ['Accessories', '1,57,575', '1,09,959', '47,616'],
          ['Electronics', '27,47,792', '19,19,269', '8,28,523'],
          ['Furniture', '1,89,586', '1,36,431', '53,155'],
          ['Total', '30,94,953', '21,65,659', '9,29,294'],
        ],
      },
      steps: [
        'Report view > select the Sales table in the Data pane',
        'Modeling > New measure, type Total Sales = SUM(Sales[SalesAmount]), press Enter',
        'Modeling > New measure: Total Cost = SUM(Sales[Cost])',
        'Modeling > New measure: Profit = [Total Sales] - [Total Cost]',
        'Insert a Matrix: Rows = Product[Category], Values = Total Sales, Total Cost, Profit',
        'Select each measure > Measure tools > Format = Whole number, thousands separator on',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])
Total Cost = SUM(Sales[Cost])
Profit = [Total Sales] - [Total Cost]`,
      result: 'The matrix above. Profit for Electronics is 27,47,792 - 19,19,269 = 8,28,523.',
      explanation: 'SUM aggregates the column in the current filter context. Profit reuses the two measures with the arithmetic - operator, so it automatically works per category.',
    },
    {
      title: 'Example 2: Division operator vs DIVIDE for Margin %',
      scenario: 'Calculate profit margin safely.',
      table: {
        headers: ['Category', 'Margin %'],
        rows: [
          ['Accessories', '30.22%'],
          ['Electronics', '30.15%'],
          ['Furniture', '28.04%'],
          ['Total', '30.03%'],
        ],
      },
      steps: [
        'Modeling > New measure and type the DIVIDE version below',
        'Measure tools > Format > Percentage, decimals = 2',
        'Add Margin % to the matrix from Example 1',
        'Add Product[Product] to rows and expand: Desk shows nothing because both measures are blank',
      ],
      code: `Margin % = DIVIDE([Profit], [Total Sales])
-- same as [Profit] / [Total Sales] but returns BLANK instead of an error when sales = 0`,
      result: 'Accessories 30.22%, Electronics 30.15%, Furniture 28.04%, Total 30.03%.',
      explanation: 'DIVIDE has 3 arguments: Numerator ([Profit]), Denominator ([Total Sales]) and optional AlternateResult (default BLANK). It protects against divide-by-zero.',
    },
    {
      title: 'Example 3: IN and || operators to filter several values',
      scenario: 'Management wants sales of Electronics + Furniture, and sales of Mumbai + Pune.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['Elec + Furniture Sales', '29,37,378'],
          ['Mumbai or Pune Sales', '17,11,441'],
          ['Corporate Pune Orders', '13'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula below',
        'Insert three Card visuals and place one measure in each',
        'Optional: paste the formulas into the DAX Lab to verify',
      ],
      code: `Elec + Furniture Sales =
CALCULATE([Total Sales], Product[Category] IN {"Electronics", "Furniture"})

Mumbai or Pune Sales =
CALCULATE([Total Sales], Customer[City] = "Mumbai" || Customer[City] = "Pune")

Corporate Pune Orders =
CALCULATE(COUNTROWS(Sales), Customer[Segment] = "Corporate" && Customer[City] = "Pune")`,
      result: '29,37,378 (27,47,792 + 1,89,586), 17,11,441 (8,01,109 + 9,10,332) and 13 orders.',
      explanation: 'IN checks list membership, || is OR, && is AND. CALCULATE (Day 23) applies the condition as a filter. Both columns in && come from the same Customer table, which is allowed.',
    },
    {
      title: 'Example 4: & operator to build a dynamic label',
      scenario: 'Show a text card like "Total: 30,94,953 | Margin: 30.03%".',
      steps: [
        'Modeling > New measure and type the code below',
        'Insert a Card visual and drop Sales Label into it',
        'Add a slicer on Product[Category] and click Electronics: the text changes',
      ],
      code: `Sales Label =
"Total: " & FORMAT([Total Sales], "#,##0")
    & " | Margin: " & FORMAT([Margin %], "0.00%")`,
      result: 'Card shows Total: 3,094,953 | Margin: 30.03% (with an Indian locale the number shows as 30,94,953). With Electronics selected: Total: 2,747,792 | Margin: 30.15%.',
      explanation: '& joins text pieces. FORMAT turns numbers into formatted text so the label looks clean.',
    },
    {
      title: 'Example 5: Operator precedence check',
      scenario: 'Understand why brackets matter.',
      table: {
        headers: ['Formula', 'Result'],
        rows: [
          ['= 2 + 3 * 4', '14'],
          ['= (2 + 3) * 4', '20'],
          ['= 2 ^ 3 * 2', '16'],
          ['= BLANK() + 5', '5'],
        ],
      },
      steps: ['Modeling > New measure: Test = 2 + 3 * 4', 'Show it in a Card', 'Edit the formula to each version in the table and observe the card'],
      code: `Test = 2 + 3 * 4`,
      result: 'Card values 14, 20, 16, 5 for the four versions.',
      explanation: 'Multiplication is done before addition and power before multiplication. BLANK acts as 0 in addition.',
    },
  ],
  interview: [
    {
      q: 'What is DAX and where can you use it in Power BI?',
      a: 'DAX is a formula language for data models. In Power BI you use it to create measures, calculated columns, calculated tables, and also for RLS role filters.',
      level: 'Easy',
    },
    {
      q: 'Why do we write column references with the table name but measures without it?',
      a: 'It is a best-practice convention. Table[Column] for columns and [Measure] for measures makes it instantly clear whether a reference is a column (row value) or a measure (aggregated in filter context).',
      level: 'Easy',
    },
    {
      q: 'What is the difference between / and DIVIDE?',
      a: 'The / operator returns Infinity or NaN for division by zero. DIVIDE(numerator, denominator, alternate) returns BLANK or the alternate value, and is optimized by the engine.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between = and == in DAX?',
      a: '= treats BLANK as equal to 0 or empty text. == (strict equality) treats BLANK as different from 0 and "".',
      level: 'Medium',
    },
    {
      q: 'How does BLANK behave in arithmetic?',
      a: 'In addition and subtraction BLANK acts like 0 (BLANK + 5 = 5). In multiplication and division with BLANK the result is BLANK. Comparisons treat BLANK as 0 or empty text.',
      level: 'Medium',
    },
    {
      q: 'Scenario: write a measure for sales of Pune and Nashik only.',
      a: 'CALCULATE([Total Sales], Customer[City] IN {"Pune", "Nashik"}). With the practice data it returns 11,20,062.',
      level: 'Medium',
    },
    {
      q: 'Is DAX case-sensitive?',
      a: 'Function names and object references are not case-sensitive, and text comparisons with = are case-insensitive. EXACT() can be used for case-sensitive comparison.',
      level: 'Medium',
    },
    {
      q: 'Explain operator precedence with an example.',
      a: 'DAX evaluates ^ first, then * and /, then + and -, then &, then comparisons, then NOT, &&, ||. So 2 + 3 * 4 = 14 while (2 + 3) * 4 = 20.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create Total Quantity = SUM(Sales[Quantity]) and show it by Customer[Segment].',
      hint: 'Modeling > New measure, then a table visual.',
      solution: 'Corporate 114, Retail 71, Total 185.',
    },
    {
      task: 'Create Profit and Margin % measures and show them by Customer[City]. Which city has the highest margin?',
      hint: 'Margin % = DIVIDE([Profit], [Total Sales]).',
      solution: 'Mumbai 29.45%, Nagpur 30.52%, Nashik 30.42%, Pune 29.80%. Nagpur has the highest margin.',
    },
    {
      task: 'Write a measure for sales NOT in Electronics using the <> operator. Check it in the DAX Lab.',
      hint: 'CALCULATE([Total Sales], Product[Category] <> "Electronics").',
      solution: 'Result 3,47,161 (Accessories 1,57,575 + Furniture 1,89,586).',
    },
    {
      task: 'Build a label measure "Orders: 60 | Qty: 185" using & and COUNTROWS.',
      hint: '"Orders: " & COUNTROWS(Sales) & " | Qty: " & SUM(Sales[Quantity]).',
      solution: 'Order Label = "Orders: " & COUNTROWS(Sales) & " | Qty: " & SUM(Sales[Quantity]) returns Orders: 60 | Qty: 185.',
    },
  ],
  quiz: [
    {
      question: 'What does DAX stand for?',
      options: ['Data Access XML', 'Data Analysis Expressions', 'Dynamic Analytics Extension', 'Data Aggregation Experience'],
      answer: 1,
      explanation: 'DAX = Data Analysis Expressions.',
    },
    {
      question: 'Which reference style is correct for a column?',
      options: ['[SalesAmount]Sales', 'Sales[SalesAmount]', 'Sales.SalesAmount', 'Sales(SalesAmount)'],
      answer: 1,
      explanation: 'Columns are written Table[Column].',
    },
    {
      question: 'Which operator joins two text values?',
      options: ['+', '&&', '&', '||'],
      answer: 2,
      explanation: '& is the concatenation operator; && is logical AND.',
    },
    {
      question: 'What does 2 + 3 * 4 return in DAX?',
      options: ['20', '14', '24', '9'],
      answer: 1,
      explanation: 'Multiplication happens before addition: 2 + 12 = 14.',
    },
    {
      question: 'Which expression keeps only Electronics or Furniture?',
      options: [
        'Product[Category] = "Electronics" && Product[Category] = "Furniture"',
        'Product[Category] IN {"Electronics", "Furniture"}',
        'Product[Category] & "Electronics"',
        'NOT Product[Category]',
      ],
      answer: 1,
      explanation: 'IN checks membership in a list. The && version can never be true because a category cannot be both values at once.',
    },
  ],
};
