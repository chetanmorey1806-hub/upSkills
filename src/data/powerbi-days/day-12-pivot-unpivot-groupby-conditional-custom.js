export default {
  id: 'day-12-pivot-unpivot-groupby-conditional-custom',
  title: 'Pivot Columns, Unpivot Columns, Group By, Conditional Columns, Custom Columns',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Reshape and enrich data: unpivot wide Excel-style tables into tall analysis-ready tables, pivot when you need a column per value, summarise with Group By, and add new columns with the Conditional Column dialog or your own M formula in Custom Column.',
  objectives: [
    'Unpivot month/year columns into rows with Unpivot Other Columns and know why it is preferred',
    'Pivot a column with an aggregation (Sum) or without aggregation',
    'Summarise with Group By – basic and advanced (multiple keys and aggregations, All Rows)',
    'Create rule-based columns with Conditional Column (if ... then ... else)',
    'Write Custom Columns in M using operators, text, date and number functions',
  ],
  theory: [
    {
      heading: 'Wide vs tall data – why unpivot?',
      content:
        `Excel reports are usually **wide**: one column per month (Jan, Feb, Mar...). Power BI works best with **tall** (long) data: one column **Month** and one column **SalesAmount**.\n\nWhy tall is better:\n\n- One measure \`SUM(Sales[SalesAmount])\` works for every month; with wide data you need a measure per column.\n- Slicers and axes need **one** Month field.\n- Adding April does not change the model – it is just more rows.\n\nAnalogy: a wide table is like a **calendar on the wall** (good for humans to read); a tall table is like a **diary with one entry per line** (good for machines to analyse).`,
    },
    {
      heading: 'Unpivot Columns',
      content:
        `**Transform > Unpivot Columns** (or right-click header) has three options:\n\n1. **Unpivot Columns** – select the month columns and unpivot them.\n2. **Unpivot Other Columns** – select the **ID columns that should stay** (e.g. Product); all **other** columns are unpivoted. **Recommended**: when "Apr" is added next month, it is unpivoted automatically.\n3. **Unpivot Only Selected Columns** – unpivots exactly the selected columns, even if new ones appear later.\n\nThe result has two new columns: **Attribute** (old header) and **Value** (old cell). Rename them, e.g. Month and SalesAmount. Null cells are dropped during unpivot.`,
      syntax: `Table.UnpivotOtherColumns(PreviousStep, {"Product"}, "Attribute", "Value")
Table.Unpivot(PreviousStep, {"Jan", "Feb", "Mar"}, "Attribute", "Value")`,
    },
    {
      heading: 'Pivot Column',
      content:
        `Pivot is the opposite: turn **values of one column into column headers**.\n\n1. Select the column whose values become headers (e.g. Segment).\n2. **Transform > Pivot Column**.\n3. **Values Column**: the column with the numbers (e.g. SalesAmount).\n4. **Advanced options > Aggregate Value Function**: Sum, Count (All), Count (Not Blank), Minimum, Maximum, Median, Average, or **Don't Aggregate** (use when each combination has exactly one value; duplicates cause errors).\n\nPivot is useful for comparison tables, exporting, or turning attribute/value lists (key-value pairs) into proper columns.`,
      syntax: `Table.Pivot(PreviousStep, List.Distinct(PreviousStep[Segment]), "Segment", "SalesAmount", List.Sum)
Table.Pivot(PreviousStep, List.Distinct(PreviousStep[Attribute]), "Attribute", "Value")     // Don't Aggregate`,
      tip: 'The list of new columns is computed from data at refresh (List.Distinct). If later steps refer to a specific pivoted column name that disappears, those steps fail.',
    },
    {
      heading: 'Group By',
      content:
        `**Home > Group By** (also on Transform) summarises rows, like a pivot table or SQL GROUP BY.\n\n- **Basic**: one group column and one aggregation (e.g. City, Sum of SalesAmount).\n- **Advanced**: several group columns (City, Year) and several aggregations (**Add aggregation**).\n\nOperations: **Sum, Average, Median, Min, Max, Count Rows, Count Distinct Rows, All Rows**. **All Rows** keeps the detail rows as a nested table per group – useful to then add a rank/index inside each group or pick the latest record.`,
      syntax: `Table.Group(PreviousStep, {"City"}, {
    {"Total Sales", each List.Sum([SalesAmount]), type nullable number},
    {"Orders", each Table.RowCount(_), Int64.Type}})`,
      tip: 'Grouping in Power Query reduces granularity permanently. In Power BI you usually keep detail rows and aggregate with DAX measures. Group in Power Query for summary tables, very large data you never need at row level, or data-prep logic.',
    },
    {
      heading: 'Conditional Column',
      content:
        `**Add Column > Conditional Column** creates a column with **if / else if / else** rules – no code needed.\n\n1. New column name.\n2. **If** Column Name, Operator (equals, does not equal, is greater than, contains, begins with...), Value, **Then** Output.\n3. **Add Clause** for **Else If** rules (checked top to bottom – first match wins).\n4. **Else** value.\n5. Values/outputs can be a fixed value or another column (click the ABC/123 drop-down to select a column).\n\nSet the output type with the column header icon afterwards (or in newer versions in the dialog).`,
      syntax: `Table.AddColumn(PreviousStep, "Order Size",
    each if [SalesAmount] >= 50000 then "Large"
    else if [SalesAmount] >= 10000 then "Medium"
    else "Small", type text)`,
      tip: 'Put the most specific/highest condition first. If ">= 10000" came before ">= 50000", every large order would be labelled Medium.',
    },
    {
      heading: 'Custom Column and M basics',
      content:
        `**Add Column > Custom Column** lets you type any M formula. Click column names in **Available columns** (double-click inserts \`[ColumnName]\`). The dialog checks syntax ("No syntax errors have been detected").\n\nUseful M pieces:\n\n- Arithmetic: \`[SalesAmount] - [Cost]\`, \`[Quantity] * [UnitPrice]\`\n- Text join: \`[City] & " - " & [Segment]\` (numbers need \`Text.From([OrderID])\`)\n- Logic: \`if [Quantity] > 3 and [City] = "Pune" then "Bulk" else "Normal"\` (\`and\`, \`or\`, \`not\` are lowercase)\n- Dates: \`Date.Year([OrderDate])\`, \`Date.MonthName([OrderDate])\`, \`Date.QuarterOfYear([OrderDate])\`\n- Numbers: \`Number.Round([x], 2)\`\n- Null safety: \`if [SalesAmount] = null or [SalesAmount] = 0 then null else ...\`\n\nM is **case-sensitive**: \`Text.Upper\` works, \`text.upper\` fails. Also see **Add Column > Column From Examples**, where you type the expected output and Power Query writes the formula, and **Index Column** (0/1-based row numbers).`,
      syntax: `Table.AddColumn(PreviousStep, "Profit", each [SalesAmount] - [Cost], type number)`,
    },
  ],
  examples: [
    {
      title: 'Unpivot a wide monthly sales sheet',
      scenario: 'The sales head maintains a sheet with one column per month.',
      table: {
        headers: ['BEFORE: Product', 'Jan', 'Feb', 'Mar', '|', 'AFTER: Product', 'Month', 'SalesAmount'],
        rows: [
          ['Laptop', 220000, 165000, 275000, '|', 'Laptop', 'Jan', 220000],
          ['Mouse', 4000, 4800, 3200, '|', 'Laptop', 'Feb', 165000],
          ['', '', '', '', '|', 'Laptop', 'Mar', 275000],
          ['', '', '', '', '|', 'Mouse', 'Jan', 4000],
          ['', '', '', '', '|', 'Mouse', 'Feb', 4800],
          ['', '', '', '', '|', 'Mouse', 'Mar', 3200],
        ],
      },
      steps: [
        'Import the sheet and open Power Query (Home > Transform data).',
        'Click the Product column header (the column that should stay).',
        'Transform > Unpivot Columns drop-down > Unpivot Other Columns.',
        'Double-click Attribute and rename to Month; double-click Value and rename to SalesAmount.',
        'Set SalesAmount type to Whole Number or Decimal Number.',
      ],
      code: `    #"Unpivoted Other Columns" = Table.UnpivotOtherColumns(#"Changed Type", {"Product"}, "Attribute", "Value"),
    #"Renamed Columns" = Table.RenameColumns(#"Unpivoted Other Columns",{{"Attribute", "Month"}, {"Value", "SalesAmount"}}),
    #"Changed Type1" = Table.TransformColumnTypes(#"Renamed Columns",{{"SalesAmount", type number}})`,
      result: '2 rows x 3 months became 6 rows with Product, Month, SalesAmount (right half of the table).',
      explanation: 'Unpivot Other Columns keeps Product fixed and turns every other header into a Month value, so an Apr column added later is included automatically.',
    },
    {
      title: 'Pivot Segment into columns with Sum',
      scenario: 'Build a comparison table of Corporate vs Retail sales per city. Pune Retail appears twice in the source.',
      table: {
        headers: ['BEFORE: City', 'Segment', 'SalesAmount', '|', 'AFTER: City', 'Corporate', 'Retail'],
        rows: [
          ['Pune', 'Corporate', 300000, '|', 'Pune', 300000, 220000],
          ['Pune', 'Retail', 120000, '|', 'Mumbai', 500000, 260000],
          ['Pune', 'Retail', 100000, '|', '', '', ''],
          ['Mumbai', 'Corporate', 500000, '|', '', '', ''],
          ['Mumbai', 'Retail', 260000, '|', '', '', ''],
        ],
      },
      steps: [
        'Select the Segment column.',
        'Transform > Pivot Column.',
        'Values Column: SalesAmount.',
        'Advanced options > Aggregate Value Function: Sum. OK.',
      ],
      code: `    #"Pivoted Column" = Table.Pivot(#"Changed Type", List.Distinct(#"Changed Type"[Segment]), "Segment", "SalesAmount", List.Sum)`,
      result: 'Two rows: Pune 300000 / 220000 and Mumbai 500000 / 260000.',
      explanation: 'Pune Retail had two rows (120000 + 100000); List.Sum combined them. With "Don\'t Aggregate" this would return an Error because of the duplicate.',
    },
    {
      title: 'Group By City – total sales, order count and average',
      scenario: 'Create a summary table CitySummary from the cleaned Sales query.',
      table: {
        headers: ['BEFORE: OrderID', 'City', 'SalesAmount', '|', 'AFTER: City', 'Total Sales', 'Orders', 'Avg Order'],
        rows: [
          [1001, 'Pune', 110000, '|', 'Pune', 112500, 2, 56250],
          [1002, 'Mumbai', 4000, '|', 'Mumbai', 29000, 2, 14500],
          [1003, 'Nagpur', 12000, '|', 'Nagpur', 12000, 1, 12000],
          [1004, 'Mumbai', 25000, '|', '', '', '', ''],
          [1005, 'Pune', 2500, '|', '', '', '', ''],
        ],
      },
      steps: [
        'Right-click Sales in the Queries pane > Reference. Rename the new query CitySummary.',
        'Home > Group By > choose Advanced.',
        'Group by: City.',
        'New column name: Total Sales, Operation: Sum, Column: SalesAmount.',
        'Click Add aggregation: Orders, Count Rows.',
        'Click Add aggregation: Avg Order, Average, SalesAmount. OK.',
      ],
      code: `let
    Source = Sales,
    #"Grouped Rows" = Table.Group(Source, {"City"}, {
        {"Total Sales", each List.Sum([SalesAmount]), type nullable number},
        {"Orders", each Table.RowCount(_), Int64.Type},
        {"Avg Order", each List.Average([SalesAmount]), type nullable number}})
in
    #"Grouped Rows"`,
      result: 'Pune 112500 / 2 / 56250, Mumbai 29000 / 2 / 14500, Nagpur 12000 / 1 / 12000.',
      explanation: 'Table.Group collects the rows of each City into a group; each aggregation function runs on that group ([SalesAmount] is the list of amounts in the group, _ is the group table).',
    },
    {
      title: 'Conditional Column: Order Size bands',
      scenario: 'Label each order Large (>= 50,000), Medium (>= 10,000) or Small.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Order Size (new)'],
        rows: [
          [1001, 110000, 'Large'],
          [1002, 4000, 'Small'],
          [1003, 12000, 'Medium'],
          [1004, 25000, 'Medium'],
          [1005, 2500, 'Small'],
        ],
      },
      steps: [
        'Add Column > Conditional Column.',
        'New column name: Order Size.',
        'If: SalesAmount | is greater than or equal to | 50000 | Then: Large.',
        'Click Add Clause. Else If: SalesAmount | is greater than or equal to | 10000 | Then: Medium.',
        'Else: Small. OK.',
        'Set the column type to Text using the header icon if it shows ABC/123.',
      ],
      code: `    #"Added Conditional Column" = Table.AddColumn(#"Changed Type", "Order Size", each if [SalesAmount] >= 50000 then "Large" else if [SalesAmount] >= 10000 then "Medium" else "Small", type text)`,
      result: 'The Order Size column shown in the table.',
      explanation: 'Conditions are tested in order; 110000 matches the first rule, 12000 and 25000 fail the first but match the second, the rest fall to Else.',
    },
    {
      title: 'Custom Columns: Profit, Margin % and Month Name',
      scenario: 'Add row-level Profit, Margin % and a month name from OrderDate.',
      table: {
        headers: ['OrderID', 'OrderDate', 'SalesAmount', 'Cost', 'Profit', 'Margin %', 'MonthName'],
        rows: [
          [1001, '2024-01-05', 110000, 88000, 22000, '20.00%', 'January'],
          [1002, '2024-01-06', 4000, 2800, 1200, '30.00%', 'January'],
          [1003, '2024-02-08', 12000, 9000, 3000, '25.00%', 'February'],
        ],
      },
      steps: [
        'Add Column > Custom Column. New column name: Profit. Formula: = [SalesAmount] - [Cost]. OK.',
        'Click the header icon of Profit > Decimal Number (or choose Data type in the dialog in newer versions).',
        'Add Column > Custom Column. Name: Margin %. Formula: = if [SalesAmount] = null or [SalesAmount] = 0 then null else [Profit] / [SalesAmount]. OK. Set type to Percentage.',
        'Select OrderDate > Add Column > Date > Month > Name of Month. Rename to MonthName.',
      ],
      code: `    #"Added Profit" = Table.AddColumn(#"Added Conditional Column", "Profit", each [SalesAmount] - [Cost], type number),
    #"Added Margin" = Table.AddColumn(#"Added Profit", "Margin %", each if [SalesAmount] = null or [SalesAmount] = 0 then null else [Profit] / [SalesAmount], Percentage.Type),
    #"Inserted Month Name" = Table.AddColumn(#"Added Margin", "MonthName", each Date.MonthName([OrderDate]), type text)`,
      result: 'Profit 22000 / 1200 / 3000, Margin 20% / 30% / 25%, MonthName January / January / February.',
      explanation: 'Each Custom Column is Table.AddColumn with an each-expression evaluated row by row. Guarding against 0/null avoids divide errors. Note: aggregated margin should still be a DAX measure (DIVIDE(SUM profit, SUM sales)), because averaging row percentages gives wrong totals.',
    },
  ],
  interview: [
    { q: 'Why do we unpivot data in Power BI?', a: 'Power BI works best with tall data: one attribute column (e.g. Month) and one value column. This allows one measure, one slicer/axis field and automatic handling of new periods. Wide data needs a measure per column and model changes every month.', level: 'Easy' },
    { q: 'Unpivot Columns vs Unpivot Other Columns?', a: 'Unpivot Columns lists the selected columns to unpivot (Table.Unpivot). Unpivot Other Columns lists the columns to keep (Table.UnpivotOtherColumns) and unpivots everything else, so newly added month columns are handled automatically – preferred for growing reports.', level: 'Medium' },
    { q: 'When does Pivot with "Don\'t Aggregate" give errors?', a: 'When the same row/column combination has more than one value. Power Query cannot put two values in one cell, so it returns Error. Use an aggregation (Sum, Count) or remove duplicates first.', level: 'Medium' },
    { q: 'Group By in Power Query vs aggregation in DAX – which should you use?', a: 'Normally keep detail rows and aggregate with DAX measures so users can slice by any attribute. Use Power Query Group By for summary tables, pre-aggregating huge data you never analyse at row level, or prep logic such as latest record per customer.', level: 'Hard' },
    { q: 'What does the All Rows operation in Group By do?', a: 'It returns a nested table of all detail rows for each group, which you can later expand or transform (e.g. add an index per group or keep the top row per group).', level: 'Medium' },
    { q: 'Conditional Column vs Custom Column?', a: 'Conditional Column is a dialog for if/else-if/else rules without code. Custom Column lets you write any M expression (math, text, date functions, nested logic). Both generate Table.AddColumn.', level: 'Easy' },
    { q: 'Custom column vs DAX calculated column – where should you create Profit?', a: 'Prefer Power Query (custom column) for row-level columns that depend only on the same row – it is computed at refresh and compresses well ("as far upstream as possible, as far downstream as necessary"). Use DAX calculated columns when you need model features like RELATED or other tables after load. Aggregated ratios like Margin % should be DAX measures.', level: 'Hard' },
    { q: 'Scenario: your Conditional Column labels every order above 10,000 as "Medium", even 1,10,000. What is wrong?', a: 'The ">= 10000" rule is placed before ">= 50000". Rules are evaluated top-down and the first match wins. Reorder so the highest threshold comes first.', level: 'Medium' },
    { q: 'In a custom column, [OrderID] & "-" & [City] gives an error. Why?', a: 'OrderID is a number and the & operator in M only joins text (or lists/records). Convert with Text.From([OrderID]) & "-" & [City].', level: 'Medium' },
  ],
  practice: [
    { task: 'Recreate the wide Product | Jan | Feb | Mar table from Example 1 (Home > Enter data), unpivot the month columns into Month and SalesAmount, and rename them. Then try the Unpivot step in the Power Query Lab.', hint: 'Select the ID columns > Unpivot Other Columns.', solution: 'Table.UnpivotOtherColumns(prev, {"Product"}, "Attribute", "Value") then Table.RenameColumns(prev,{{"Attribute","Month"},{"Value","SalesAmount"}}).' },
    { task: 'Group the Sales query by Category and Year with total Quantity and distinct customer count.', hint: 'Advanced Group By; Count Distinct Rows counts rows, so use a custom aggregation for distinct customers.', solution: 'Table.Group(prev, {"Category","Year"}, {{"Total Qty", each List.Sum([Quantity]), type nullable number}, {"Customers", each List.Count(List.Distinct([CustomerID])), Int64.Type}}).' },
    { task: 'Add a Conditional Column "Region": Pune and Nashik = "West-Inland", Mumbai = "West-Coast", Nagpur = "Vidarbha".', hint: 'Three clauses with equals, Else blank.', solution: 'each if [City] = "Pune" then "West-Inland" else if [City] = "Nashik" then "West-Inland" else if [City] = "Mumbai" then "West-Coast" else if [City] = "Nagpur" then "Vidarbha" else null.' },
    { task: 'Add a Custom Column "Line Total" = Quantity * UnitPrice and compare it with SalesAmount.', hint: 'Then add another column for the difference.', solution: 'Table.AddColumn(prev,"Line Total", each [Quantity] * [UnitPrice], type number); Difference = [Line Total] - [SalesAmount] should be 0 for clean rows.' },
    { task: 'Pivot an attribute/value table (Attribute: Name, City, Phone) into columns without aggregation.', hint: 'Pivot Attribute, Values Value, Don\'t Aggregate.', solution: 'Table.Pivot(prev, List.Distinct(prev[Attribute]), "Attribute", "Value").' },
  ],
  quiz: [
    { question: 'Which command keeps "Product" and turns all month columns into rows, including months added later?', options: ['Unpivot Only Selected Columns', 'Pivot Column', 'Transpose', 'Unpivot Other Columns (Product selected)'], answer: 3, explanation: 'Unpivot Other Columns unpivots everything except the selected ID columns.' },
    { question: 'Group By generates which M function?', options: ['Table.Summarize', 'Table.Pivot', 'Table.Group', 'Table.Aggregate'], answer: 2, explanation: 'Table.Group(table, keys, aggregations).' },
    { question: 'In Conditional Column, rules are evaluated:', options: ['Bottom to top', 'Top to bottom, first match wins', 'All at once, last match wins', 'Randomly'], answer: 1, explanation: 'It becomes nested if/else if, so the first true condition wins.' },
    { question: 'Which custom column formula is valid M?', options: ['= [Qty] * [Price]', '= Qty * Price', '= IF([Qty]>3,"Bulk","Normal")', '= [OrderID] & "-" & [City] (OrderID numeric)'], answer: 0, explanation: 'Columns are referenced as [Name]; IF() is Excel/DAX syntax; numbers must be converted with Text.From before &.' },
    { question: 'Pivot with "Don\'t Aggregate" on data with duplicate combinations returns:', options: ['The first value', 'The sum', 'Blank columns', 'Error values'], answer: 3, explanation: 'Multiple values cannot fit in one cell without aggregation.' },
  ],
};
