export default {
  id: 'extra-19-userelationship',
  title: 'USERELATIONSHIP()',
  module: 'Extra: DAX',
  extraNo: 19,
  level: 'Advanced',
  duration: '2 hours',
  summary: "A table can have only one active relationship to another table, but you can create extra inactive ones (shown as dashed lines). USERELATIONSHIP() switches on an inactive relationship for one CALCULATE, so you can analyse the same sales by order date, ship date or any other date with a single Date table.",
  objectives: [
    'Explain active vs inactive relationships and why only one path can be active',
    'Create an inactive relationship between Date and a second date column',
    'Write measures with CALCULATE() + USERELATIONSHIP() and show them side by side',
    'Combine USERELATIONSHIP() with time intelligence functions',
  ],
  theory: [
    {
      heading: 'Role-playing dates and the one-active-path rule',
      content: "An order has several dates: OrderDate, ShipDate, DeliveryDate. All of them should use the **same** Date table (one calendar, one slicer). This is called a **role-playing dimension**: one table playing several roles.\n\nPower BI allows only **one active relationship** between two tables (and only one active path between any two tables). If Date is already related to Sales[OrderDate], a second relationship to Sales[ShipDate] is created as **inactive** and shown as a **dashed line** in Model view.\n\nAnalogy: a house has two doors to the same room, but only one can be unlocked at a time. USERELATIONSHIP() is the key that opens the second door for one calculation.",
    },
    {
      heading: 'Syntax and rules',
      content: "USERELATIONSHIP() is used only as a filter argument of CALCULATE (or CALCULATETABLE). Inside that CALCULATE, the named relationship becomes active and the normally active one between the same tables is temporarily switched off.",
      syntax: `CALCULATE (
    <expression>,
    USERELATIONSHIP ( <columnName1>, <columnName2> )
)`,
      points: [
        'The two columns must already be connected by a relationship (active or inactive) in the model',
        'The order of the columns does not matter; by convention write the many side first: Sales[ShipDate], \'Date\'[Date]',
        'It does not create a relationship; it only activates an existing one',
        'It cannot be used on tables protected by row-level security filters in some scenarios; test RLS reports carefully',
      ],
    },
    {
      heading: 'Setting up the extra column in the practice model',
      content: "Our shared model has only Sales[OrderDate]. For this topic you create an **extra** calculated column:\n\n1. In Data view select the Sales table, then Table tools > New column\n2. `ShipDate = Sales[OrderDate] + 3` (every order ships 3 days later)\n3. Column tools > Data type: Date\n4. Model view: drag 'Date'[Date] onto Sales[ShipDate]. Power BI creates the relationship as **inactive** (dashed line) because Date → Sales[OrderDate] is already active\n\nDouble-click the dashed line to check: the checkbox **Make this relationship active** is unticked. Leave it that way.",
      tip: 'In the DAX Lab only the default model exists, so build this example in Power BI Desktop with the practice CSV files.',
    },
    {
      heading: 'Why not just make another Date table?',
      content: "You could import a second date table (\"Ship Date\") and make an active relationship to it. That is valid and sometimes better for users who want two different date slicers.\n\nUSERELATIONSHIP() is usually preferred when:\n- You want **one** calendar slicer to drive order-based and ship-based measures together\n- You want fewer tables and a smaller model\n- Only a few measures need the second date\n\nUse a separate table when users must filter by order date and ship date **at the same time** with separate slicers.",
    },
    {
      heading: 'Combining with time intelligence',
      content: "USERELATIONSHIP() is just another CALCULATE filter, so you can combine it with DATESYTD(), SAMEPERIODLASTYEAR() and others in the same CALCULATE:\n\n`CALCULATE([Total Sales], USERELATIONSHIP(Sales[ShipDate], 'Date'[Date]), DATESYTD('Date'[Date]))`\n\nIf you already have a base measure that uses USERELATIONSHIP(), you can also wrap that measure in another CALCULATE with the time-intelligence filter.",
    },
  ],
  examples: [
    {
      title: 'Sales by order month vs ship month',
      scenario: 'Finance books revenue when goods ship, while sales reports by order date. Show both for the first months of 2024 using one Date table.',
      table: {
        headers: ['YearMonth', 'Total Sales (Order Date)', 'Sales by Ship Date'],
        rows: [
          ['2024-01', '311,162', '311,162'],
          ['2024-02', '20,214', '9,354'],
          ['2024-03', '183,478', '194,338'],
          ['2024-04', '15,045', '15,045'],
        ],
      },
      steps: [
        'Create Sales[ShipDate] = Sales[OrderDate] + 3 (Table tools > New column) and set its data type to Date.',
        'Model view: drag \'Date\'[Date] onto Sales[ShipDate]. Confirm it is a dashed (inactive) line.',
        'Modeling > New measure: Total Sales = SUM(Sales[SalesAmount]).',
        'Modeling > New measure: Sales by Ship Date (code below).',
        'Insert a Matrix. Rows: \'Date\'[YearMonth]. Values: Total Sales, Sales by Ship Date.',
        'Add a Slicer on \'Date\'[Year] and select 2024; scroll to the first four months.',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales by Ship Date =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] )
)`,
      result: 'February 2024 drops from 20,214 to 9,354 and March rises from 183,478 to 194,338. The headphones order of 28-Feb-2024 (10,860) ships on 2-Mar-2024, so it moves to March.',
      explanation: 'Total Sales uses the active OrderDate relationship. Inside Sales by Ship Date, USERELATIONSHIP activates the ShipDate relationship, so the Date filter (the month row) is applied to ShipDate instead.',
    },
    {
      title: 'Number of orders by order date vs ship date',
      scenario: 'The warehouse wants to know how many orders it shipped each month.',
      table: {
        headers: ['YearMonth', 'Orders', 'Orders Shipped'],
        rows: [
          ['2023-02', '3', '2'],
          ['2023-03', '4', '5'],
          ['2024-02', '3', '2'],
          ['2024-03', '2', '3'],
        ],
      },
      steps: [
        'Modeling > New measure: Orders = COUNTROWS(Sales).',
        'Modeling > New measure: Orders Shipped (code below).',
        'Use the matrix from Example 1 (remove the Year slicer selection) and add Orders and Orders Shipped.',
        'Look at February and March of both years.',
      ],
      code: `Orders = COUNTROWS ( Sales )

Orders Shipped =
CALCULATE (
    [Orders],
    USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] )
)`,
      result: 'In 2023 the order of 26-Feb (Mobile, Nagpur) ships on 1-Mar, so February has 3 orders but only 2 shipments and March gets 5 shipments.',
      explanation: 'The same base measure [Orders] is evaluated with a different active relationship. Orders placed near the end of a month move to the next month by ship date.',
    },
    {
      title: 'Yearly totals do not change',
      scenario: 'Check that switching the relationship only moves sales between months and does not create or lose any sales.',
      table: {
        headers: ['Year', 'Total Sales (Order Date)', 'Sales by Ship Date'],
        rows: [
          ['2023', '1,432,315', '1,432,315'],
          ['2024', '1,662,638', '1,662,638'],
          ['Total', '3,094,953', '3,094,953'],
        ],
      },
      steps: [
        'Insert a Matrix. Rows: \'Date\'[Year]. Values: Total Sales, Sales by Ship Date.',
        'Compare the two columns.',
      ],
      code: `Sales by Ship Date =
CALCULATE ( [Total Sales], USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] ) )`,
      result: 'Both years match because no order in the data ships in a different year (the last order of 2023 is on 23-Dec and ships on 26-Dec; the last order of 2024 is on 26-Dec and ships on 29-Dec).',
      explanation: 'This is a good reconciliation test: totals must match at a level where no rows cross a boundary. If a December order shipped in January, the year totals would differ.',
    },
    {
      title: 'Year-to-date by ship date',
      scenario: 'Finance wants a shipped YTD figure next to the ordered YTD figure.',
      table: {
        headers: ['YearMonth', 'Order YTD', 'Ship YTD'],
        rows: [
          ['2024-01', '311,162', '311,162'],
          ['2024-02', '331,376', '320,516'],
          ['2024-03', '514,854', '514,854'],
          ['2024-04', '529,899', '529,899'],
        ],
      },
      steps: [
        'Make sure the Date table is marked as a date table (Table tools > Mark as date table > Date).',
        'Create the two measures below.',
        'Insert a Matrix. Rows: \'Date\'[YearMonth]. Values: Order YTD, Ship YTD. Filter Year = 2024.',
      ],
      code: `Order YTD =
CALCULATE ( [Total Sales], DATESYTD ( 'Date'[Date] ) )

Ship YTD =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] ),
    DATESYTD ( 'Date'[Date] )
)`,
      result: 'By the end of February 2024, 10,860 less has shipped than ordered (331,376 vs 320,516). By March they match again.',
      explanation: 'DATESYTD() builds the list of dates from 1-Jan to the current month end. USERELATIONSHIP() decides which Sales column those dates filter.',
    },
  ],
  interview: [
    { q: 'What is USERELATIONSHIP()?', a: 'A CALCULATE modifier that activates an existing inactive relationship for the duration of that calculation, deactivating the active relationship between the same tables.', level: 'Easy' },
    { q: 'Why can a model have only one active relationship between two tables?', a: 'Filter propagation must be unambiguous. If two paths were active, the engine would not know which column a Date filter should apply to. So extra relationships are inactive until a measure activates one.', level: 'Medium' },
    { q: 'Does USERELATIONSHIP create a relationship?', a: 'No. The relationship must already exist in the model (usually as an inactive dashed line). USERELATIONSHIP only activates it.', level: 'Easy' },
    { q: 'Scenario: Sales has OrderDate, ShipDate and DueDate. How do you design the model?', a: 'One Date table marked as date table, active relationship to OrderDate, inactive relationships to ShipDate and DueDate. Base measures use the active one; Ship and Due measures use CALCULATE with USERELATIONSHIP. Use separate role-playing date tables only if users need independent slicers.', level: 'Hard' },
    { q: 'Can you use USERELATIONSHIP in a calculated column?', a: 'It only works inside CALCULATE/CALCULATETABLE. In a calculated column you can use CALCULATE with USERELATIONSHIP, but for simple lookups LOOKUPVALUE or a RELATED on the active relationship is usually easier.', level: 'Medium' },
    { q: 'How do you combine USERELATIONSHIP with SAMEPERIODLASTYEAR?', a: 'Put both in the same CALCULATE: CALCULATE([Total Sales], USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date]), SAMEPERIODLASTYEAR(\'Date\'[Date])), or wrap a ship-based base measure in CALCULATE(..., SAMEPERIODLASTYEAR(...)).', level: 'Hard' },
    { q: 'Scenario: your ship-date measure gives the same numbers as order-date. What do you check?', a: 'That the relationship to ShipDate exists, that the columns in USERELATIONSHIP are the right ones, that ShipDate is a Date type matching Date[Date] (no time part), and that the visual uses columns from the Date table, not Sales[OrderDate].', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create Quantity by Ship Date and compare it with total quantity for February 2024.',
      hint: 'Total Qty = SUM(Sales[Quantity]) first.',
      solution: 'Qty by Ship Date = CALCULATE([Total Qty], USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date])). February 2024: ordered 9 (3 + 2 + 4), shipped 5 (the 4 headphones of 28-Feb ship in March).',
    },
    {
      task: 'Create a measure showing the difference between order-date and ship-date sales.',
      hint: 'Subtract the two measures.',
      solution: 'Sales Not Yet Shipped = [Total Sales] - [Sales by Ship Date]. February 2024: 20,214 - 9,354 = 10,860; March 2024: -10,860.',
    },
    {
      task: 'Add a DeliveryDate column (OrderDate + 7) with another inactive relationship and a Sales by Delivery Date measure.',
      hint: 'Repeat the ShipDate steps with a new column.',
      solution: 'DeliveryDate = Sales[OrderDate] + 7; drag \'Date\'[Date] to Sales[DeliveryDate] (inactive). Sales by Delivery Date = CALCULATE([Total Sales], USERELATIONSHIP(Sales[DeliveryDate], \'Date\'[Date])).',
    },
    {
      task: 'Make a line chart with YearMonth on the X-axis and both Total Sales and Sales by Ship Date as lines.',
      hint: 'Use the Date table columns on the axis.',
      solution: 'The two lines overlap in most months and split only where orders were placed in the last 3 days of a month (Feb 2023, Feb 2024).',
    },
  ],
  quiz: [
    { question: 'How is an inactive relationship shown in Model view?', options: ['Bold line', 'Dashed line', 'Red line', 'It is hidden'], answer: 1, explanation: 'Inactive relationships are drawn with a dashed line.' },
    { question: 'Where can USERELATIONSHIP() be used?', options: ['Anywhere a table is expected', 'As a filter argument of CALCULATE / CALCULATETABLE', 'In Power Query', 'In the relationship dialog'], answer: 1, explanation: 'It is a CALCULATE modifier only.' },
    { question: 'In the example, why does February 2024 have lower ship-date sales?', options: ['A Feb order was cancelled', 'The 28-Feb order ships on 2-Mar', 'The Date table is wrong', 'ShipDate is text'], answer: 1, explanation: 'The headphones order of 28-Feb-2024 (10,860) ships 3 days later, in March.' },
    { question: 'What happens to the active OrderDate relationship inside CALCULATE(..., USERELATIONSHIP(Sales[ShipDate], \'Date\'[Date]))?', options: ['It stays active as well', 'It is temporarily deactivated', 'It is deleted', 'It becomes bi-directional'], answer: 1, explanation: 'Only one relationship between the two tables can be active, so the ShipDate one replaces it for that calculation.' },
    { question: 'When is a separate "Ship Date" table better than USERELATIONSHIP?', options: ['Never', 'When users need independent order-date and ship-date slicers at the same time', 'When the model is small', 'When using DAX Lab'], answer: 1, explanation: 'Separate role-playing tables let users filter both dates independently.' },
  ],
};
