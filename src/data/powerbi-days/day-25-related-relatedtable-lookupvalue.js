export default {
  id: 'day-25-related-relatedtable-lookupvalue',
  title: 'RELATED(), RELATEDTABLE(), LOOKUPVALUE()',
  module: 'Module 4: DAX – Data Analysis Expressions',
  day: 25,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'These three functions bring values from one table into another. RELATED follows a relationship from the many side to the one side, RELATEDTABLE goes from the one side to the many side, and LOOKUPVALUE finds a value by matching columns even when no relationship exists - similar to VLOOKUP/XLOOKUP in Excel.',
  objectives: [
    'Use RELATED() in calculated columns and iterators to fetch a value from a dimension table',
    'Use RELATEDTABLE() to get the matching fact rows for a dimension row',
    'Use LOOKUPVALUE() to look up a value by one or more matching columns',
    'Know the direction rules and errors of each function',
    'Decide when to use a relationship + RELATED instead of LOOKUPVALUE',
  ],
  theory: [
    {
      heading: 'Why we need lookup functions in DAX',
      content:
        `In a star schema the facts (Sales) and descriptions (Product, Customer, Date) live in different tables. Visuals combine them automatically through relationships, so for a simple chart you do **not** need any lookup function.\n\nYou need them when a **row-level calculation** needs a value from another table, for example:\n- Sales line value at list price = Sales[Quantity] x **Product[Price]**\n- A Sales column showing the customer City for an export\n- Number of orders for each customer as a column in Customer\n\nRemember the shared model relationships (all 1-to-many, single direction):\n- Product[ProductID] (1) -> Sales[ProductID] (many)\n- Customer[CustomerID] (1) -> Sales[CustomerID] (many)\n- 'Date'[Date] (1) -> Sales[OrderDate] (many)\n\nAnalogy: each Sales row is an order slip with a product code. RELATED is like looking at the product catalogue (one page per product) to read the price. RELATEDTABLE is the reverse: from one catalogue page, pull out all order slips for that product.`,
    },
    {
      heading: 'RELATED(): many side -> one side',
      content:
        `RELATED returns a column value from the **one side** of a relationship, for the current row on the **many side**.\n\nIt needs a **row context**, so you use it:\n- in a **calculated column** on the many-side table: \`Category = RELATED(Product[Category])\` in Sales\n- inside an **iterator** in a measure: \`List Value = SUMX(Sales, Sales[Quantity] * RELATED(Product[Price]))\`\n\nRules:\n- A relationship must exist (active, or activated inside the calculation).\n- It only works from many -> one. Using it in Product to read Sales columns gives an error, because one product has many sales rows.\n- It can follow a chain of many-to-one relationships, e.g. Sales -> Product -> Subcategory in a snowflake.\n\nCommon error: *"The column 'Product[Price]' either doesn't exist or doesn't have a relationship to any table available in the current context."* It means there is no relationship or you wrote RELATED outside a row context (e.g. directly in a measure without an iterator).`,
      syntax: `RELATED ( <column_from_one_side> )`,
    },
    {
      heading: 'RELATEDTABLE(): one side -> many side',
      content:
        `RELATEDTABLE returns a **table** of all rows on the many side that are related to the current row on the one side. Because it returns a table, you wrap it in COUNTROWS, SUMX, AVERAGEX, etc.\n\nIn the Customer table (calculated columns):\n- \`Order Count = COUNTROWS(RELATEDTABLE(Sales))\`\n- \`Customer Sales = SUMX(RELATEDTABLE(Sales), Sales[SalesAmount])\`\n\nIn the Product table:\n- \`Units Sold = SUMX(RELATEDTABLE(Sales), Sales[Quantity])\`\n\nRELATEDTABLE is actually CALCULATETABLE with no filters, so it performs **context transition**: the current Customer row becomes a filter on Sales. That is why each customer only sees its own orders.\n\nCalculated columns are calculated at refresh time and do **not** react to slicers. If you need a value that changes with the Year slicer, write a measure instead (e.g. \`[Total Sales]\` in a visual by Customer).`,
      syntax: `RELATEDTABLE ( <table_on_many_side> )`,
      tip: 'Use RELATEDTABLE columns for static segmentation, e.g. "Customer Type = IF([Order Count] >= 5, "Loyal", "New")" to slice by. For numbers that must react to filters, use measures.',
    },
    {
      heading: 'LOOKUPVALUE(): match columns without a relationship',
      content:
        `LOOKUPVALUE returns the value of a result column from the row where one or more search columns equal the given values. It works like **XLOOKUP** in Excel and does not need a relationship.\n\n\`City = LOOKUPVALUE(Customer[City], Customer[CustomerID], Sales[CustomerID])\`\n\nRead it as: "return Customer[City] where Customer[CustomerID] equals this row's Sales[CustomerID]".\n\nFeatures:\n- Several search pairs are allowed (AND): match on Category **and** Year.\n- An optional last argument is the **alternate result** returned when nothing matches.\n- If more than one row matches with different results, it raises an error: *"A table of multiple values was supplied where a single value was expected"*. Make sure the search columns identify a unique row.\n\nWhen to use it:\n- Lookup tables that are not related (a small Target table matched on Category).\n- Matching on more than one column (Category + Year), where a single relationship is not possible.\n\nWhen a proper relationship exists, **RELATED is faster and clearer** than LOOKUPVALUE.`,
      syntax: `LOOKUPVALUE (
    <result_column>,
    <search_column1>, <search_value1>
    [, <search_column2>, <search_value2> ...]
    [, <alternate_result>]
)`,
    },
    {
      heading: 'Choosing the right function',
      content: 'Quick decision guide:',
      points: [
        'Need a column from the ONE side while on a MANY-side row -> RELATED',
        'Need all MANY-side rows for a ONE-side row (to count/sum) -> RELATEDTABLE',
        'No relationship, or match on several columns -> LOOKUPVALUE',
        'Just showing Product[Category] next to [Total Sales] in a visual -> no function needed, the relationship does it',
        'Need a result that reacts to slicers -> write a measure, not a calculated column',
      ],
    },
    {
      heading: 'Mini sample data used in examples',
      content:
        `Same 8-row slice as Day 23-24.\n\n**Product**: P1 Laptop, Electronics, Price 50,000; P2 Mouse, Accessories, 500; P3 Chair, Furniture, 4,000; P4 Phone, Electronics, 20,000.\n\n**Customer**: C1 Asha, Pune, Corporate; C2 Ravi, Mumbai, Retail; C3 Neha, Nagpur, Retail; C4 Kiran, Nashik, Corporate.\n\n**Sales**: 1001 C1 P1 Qty 2 = 1,00,000; 1002 C2 P2 Qty 10 = 5,000; 1003 C3 P3 Qty 3 = 12,000; 1004 C1 P4 Qty 1 = 20,000; 1005 C4 P1 Qty 1 = 50,000; 1006 C2 P3 Qty 2 = 8,000; 1007 C3 P2 Qty 4 = 2,000; 1008 C4 P4 Qty 3 = 60,000.`,
    },
  ],
  examples: [
    {
      title: 'RELATED in a calculated column',
      scenario: 'The finance team exports the Sales table and wants the Category beside each order.',
      table: {
        headers: ['OrderID', 'ProductID', 'Category (new column)'],
        rows: [
          ['1001', 'P1', 'Electronics'],
          ['1002', 'P2', 'Accessories'],
          ['1003', 'P3', 'Furniture'],
          ['1004', 'P4', 'Electronics'],
        ],
      },
      steps: [
        'Go to Table view and select the Sales table',
        'Table tools > New column',
        'Type the formula below and press Enter',
        'Check that the relationship Product[ProductID] -> Sales[ProductID] exists in Model view',
      ],
      code: `Category = RELATED ( Product[Category] )`,
      result: 'A new Category column appears in Sales with Electronics / Accessories / Furniture for each order.',
      explanation:
        'Each Sales row has one ProductID, which matches exactly one Product row (the one side), so RELATED can return a single value.',
    },
    {
      title: 'RELATED inside SUMX in a measure',
      scenario: 'Calculate sales value at list price and the discount given, without adding columns.',
      table: {
        headers: ['Measure', 'Result'],
        rows: [
          ['List Value', '2,57,000'],
          ['Actual Sales', '2,57,000'],
          ['Discount Given', '0'],
        ],
      },
      steps: [
        'Modeling > New measure: List Value (code below)',
        'Modeling > New measure: Discount Given (code below)',
        'Add both to a Table visual with Product[Product]',
        'Edit one UnitPrice in the source (e.g. order 1002 at 450) and refresh to see Discount Given become 500',
      ],
      code: `List Value =
SUMX ( Sales, Sales[Quantity] * RELATED ( Product[Price] ) )

Discount Given =
[List Value] - [Total Sales]`,
      result: 'In the sample UnitPrice equals list Price, so List Value = 2,57,000 and Discount Given = 0.',
      explanation:
        'SUMX gives the row context RELATED needs. For each Sales row, RELATED fetches the Product price of that row.',
    },
    {
      title: 'RELATEDTABLE: order count and sales per customer (columns)',
      scenario: 'Create static customer columns for segmentation.',
      table: {
        headers: ['Customer', 'Order Count', 'Customer Sales', 'Customer Type'],
        rows: [
          ['Asha', '2', '1,20,000', 'Key Account'],
          ['Ravi', '2', '13,000', 'Standard'],
          ['Neha', '2', '14,000', 'Standard'],
          ['Kiran', '2', '1,10,000', 'Key Account'],
        ],
      },
      steps: [
        'Table view > select the Customer table',
        'Table tools > New column: Order Count',
        'Table tools > New column: Customer Sales',
        'Table tools > New column: Customer Type',
        'Use Customer[Customer Type] in a slicer on the report page',
      ],
      code: `Order Count = COUNTROWS ( RELATEDTABLE ( Sales ) )

Customer Sales = SUMX ( RELATEDTABLE ( Sales ), Sales[SalesAmount] )

Customer Type = IF ( Customer[Customer Sales] >= 100000, "Key Account", "Standard" )`,
      result: 'Each customer has 2 orders. Asha and Kiran are Key Accounts.',
      explanation:
        'RELATEDTABLE returns the Sales rows for the current customer. These columns are fixed at refresh time, which is fine for segmentation slicers.',
    },
    {
      title: 'LOOKUPVALUE with an unrelated Target table',
      scenario: 'Management gives a small target table. Create it as an extra table (Home > Enter data) named CategoryTarget with columns Category and Target. Do NOT create a relationship.',
      table: {
        headers: ['Category', 'Target', 'Total Sales', 'Target Value (measure)', 'Achieved %'],
        rows: [
          ['Accessories', '10,000', '7,000', '10,000', '70.00%'],
          ['Electronics', '2,00,000', '2,30,000', '2,00,000', '115.00%'],
          ['Furniture', '25,000', '20,000', '25,000', '80.00%'],
        ],
      },
      steps: [
        'Home > Enter data: name the table CategoryTarget, columns Category and Target, enter the three rows, click Load',
        'Modeling > New measure: Target Value (code below)',
        'Modeling > New measure: Achieved % and format it as Percentage',
        'Insert a Table visual with Product[Category], [Total Sales], [Target Value], [Achieved %]',
      ],
      code: `Target Value =
LOOKUPVALUE (
    CategoryTarget[Target],
    CategoryTarget[Category], SELECTEDVALUE ( Product[Category] )
)

Achieved % = DIVIDE ( [Total Sales], [Target Value] )`,
      result: 'Electronics achieved 115%, Furniture 80%, Accessories 70%. The Total row shows blank target because no single category is selected.',
      explanation:
        'SELECTEDVALUE returns the category of the current visual row; LOOKUPVALUE finds the matching target. At the total level there are 3 categories, SELECTEDVALUE returns blank, and no target matches. CategoryTarget is an extra table, so this example works in Power BI Desktop, not in the DAX Lab.',
    },
    {
      title: 'LOOKUPVALUE as a calculated column with a default',
      scenario: 'Add the customer City into Sales using LOOKUPVALUE and compare with RELATED.',
      table: {
        headers: ['OrderID', 'CustomerID', 'City (LOOKUPVALUE)', 'City (RELATED)'],
        rows: [
          ['1001', 'C1', 'Pune', 'Pune'],
          ['1002', 'C2', 'Mumbai', 'Mumbai'],
          ['1003', 'C3', 'Nagpur', 'Nagpur'],
          ['1005', 'C4', 'Nashik', 'Nashik'],
        ],
      },
      steps: [
        'Table view > Sales table > Table tools > New column: City LV (first formula)',
        'Table tools > New column: City RL (second formula)',
        'Compare the two columns - identical',
      ],
      code: `City LV =
LOOKUPVALUE ( Customer[City], Customer[CustomerID], Sales[CustomerID], "Unknown" )

City RL = RELATED ( Customer[City] )`,
      result: 'Both columns show the same cities. An order with a CustomerID not in Customer would show "Unknown" in City LV and blank in City RL.',
      explanation:
        'Because a relationship already exists, RELATED is the better choice (faster, simpler). LOOKUPVALUE is shown to understand its syntax and the alternate result.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between RELATED and RELATEDTABLE?',
      a: 'RELATED goes from the many side to the one side and returns a single value (e.g. Product[Category] for a Sales row). RELATEDTABLE goes from the one side to the many side and returns a table of related rows (e.g. all Sales rows of a Customer), which you then aggregate.',
      level: 'Easy',
    },
    {
      q: 'Can you use RELATED directly in a measure?',
      a: 'Not on its own. RELATED needs a row context, so in a measure you use it inside an iterator such as SUMX(Sales, Sales[Quantity] * RELATED(Product[Price])).',
      level: 'Medium',
    },
    {
      q: 'How is LOOKUPVALUE different from RELATED?',
      a: 'LOOKUPVALUE does not need a relationship; it matches on one or more column/value pairs and supports an alternate result. RELATED needs a relationship and is faster. Use RELATED when the relationship exists.',
      level: 'Medium',
    },
    {
      q: 'What causes "A table of multiple values was supplied where a single value was expected" in LOOKUPVALUE?',
      a: 'More than one row matched the search conditions and they have different result values. Add more search columns to make the match unique or clean duplicates in the lookup table.',
      level: 'Hard',
    },
    {
      q: 'Scenario: You created Customer[Order Count] = COUNTROWS(RELATEDTABLE(Sales)). Why does it not change when you select 2024 in a slicer?',
      a: 'It is a calculated column, computed once at refresh. Slicers never change calculated columns. Use a measure such as COUNTROWS(Sales) in a visual by Customer instead.',
      level: 'Medium',
    },
    {
      q: 'Why does RELATEDTABLE return only the current customer orders in a calculated column?',
      a: 'RELATEDTABLE is a CALCULATETABLE wrapper, so it triggers context transition: the current row of Customer becomes a filter that flows through the relationship to Sales.',
      level: 'Hard',
    },
    {
      q: 'Is RELATED the DAX equivalent of VLOOKUP?',
      a: 'Functionally yes for lookups from a fact table to a related dimension. The closest equivalent of a free VLOOKUP/XLOOKUP without a relationship is LOOKUPVALUE.',
      level: 'Easy',
    },
    {
      q: 'Scenario: Targets are given by Category and Year. How do you bring them next to actual sales?',
      a: 'Best: load the Target table and relate it to Product[Category] and Date[Year] through small dimension tables (or a bridge). Quick option: LOOKUPVALUE(Target[Target], Target[Category], SELECTEDVALUE(Product[Category]), Target[Year], SELECTEDVALUE(Date[Year])).',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Add a Segment column to Sales.',
      hint: 'Calculated column with RELATED from Customer.',
      solution: `Segment = RELATED ( Customer[Segment] )`,
    },
    {
      task: 'In the Product table create a Units Sold column.',
      hint: 'SUMX over RELATEDTABLE(Sales) of Sales[Quantity].',
      solution: `Units Sold = SUMX ( RELATEDTABLE ( Sales ), Sales[Quantity] )
-- Laptop 3, Mouse 14, Chair 5, Phone 4`,
    },
    {
      task: 'Write a measure for Electronics revenue at list price using RELATED. Try it in the DAX Lab.',
      hint: 'SUMX over FILTER(Sales, RELATED(Product[Category]) = "Electronics").',
      solution: `Electronics List Value =
SUMX (
    FILTER ( Sales, RELATED ( Product[Category] ) = "Electronics" ),
    Sales[Quantity] * RELATED ( Product[Price] )
)
-- 1,00,000 + 20,000 + 50,000 + 60,000 = 2,30,000`,
    },
    {
      task: 'Using LOOKUPVALUE, add the product name to Sales with "Not found" as default.',
      hint: 'Result column Product[Product], search Product[ProductID] = Sales[ProductID].',
      solution: `Product Name = LOOKUPVALUE ( Product[Product], Product[ProductID], Sales[ProductID], "Not found" )`,
    },
    {
      task: 'Flag Product rows that have never been sold.',
      hint: 'Check if COUNTROWS(RELATEDTABLE(Sales)) is blank or 0.',
      solution: `Never Sold = IF ( ISBLANK ( COUNTROWS ( RELATEDTABLE ( Sales ) ) ), "Yes", "No" )
-- In the mini sample every product sold, so all rows show "No"`,
    },
  ],
  quiz: [
    {
      question: 'RELATED works in which direction?',
      options: ['One side to many side', 'Many side to one side', 'Only many-to-many', 'Any direction without a relationship'],
      answer: 1,
      explanation: 'From a row on the many side, RELATED fetches the single matching value on the one side.',
    },
    {
      question: 'What does RELATEDTABLE return?',
      options: ['A single value', 'A table of related rows', 'TRUE/FALSE', 'A relationship'],
      answer: 1,
      explanation: 'It returns the many-side rows related to the current one-side row.',
    },
    {
      question: 'Which function can find a value without any relationship?',
      options: ['RELATED', 'RELATEDTABLE', 'LOOKUPVALUE', 'USERELATIONSHIP'],
      answer: 2,
      explanation: 'LOOKUPVALUE matches by column values and does not need a relationship.',
    },
    {
      question: 'Which formula correctly uses RELATED in a measure?',
      options: [
        'Price = RELATED(Product[Price])',
        'Value = SUMX(Sales, Sales[Quantity] * RELATED(Product[Price]))',
        'Value = SUM(RELATED(Product[Price]))',
        'Value = RELATED(SUM(Product[Price]))',
      ],
      answer: 1,
      explanation: 'RELATED needs the row context provided by SUMX.',
    },
    {
      question: 'What is the last optional argument of LOOKUPVALUE?',
      options: ['Sort order', 'Alternate result when no match is found', 'Relationship name', 'Number of rows'],
      answer: 1,
      explanation: 'The alternate result is returned when no row matches.',
    },
  ],
};
