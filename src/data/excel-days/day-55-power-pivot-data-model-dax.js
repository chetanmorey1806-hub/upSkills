export default {
  id: 'day-55-power-pivot-data-model-dax',
  title: 'Power Pivot, Data Model, Relationships and DAX Introduction',
  module: 'Module 7: Advanced Excel Tools',
  day: 55,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Power Pivot lets Excel hold several related tables (millions of rows) in a compressed Data Model, link them with relationships instead of VLOOKUP, and calculate smart totals with DAX measures. This is the same engine used in Power BI.',
  objectives: [
    'Enable the Power Pivot add-in and open the Power Pivot window',
    'Add tables to the Data Model and understand fact vs lookup (dimension) tables',
    'Create relationships in Diagram View or Data > Relationships',
    'Build a PivotTable from multiple related tables',
    'Write basic DAX: calculated columns and measures with SUM, SUMX, RELATED, CALCULATE, DIVIDE, DISTINCTCOUNT',
  ],
  theory: [
    {
      heading: 'What are Power Pivot and the Data Model?',
      content: 'A normal PivotTable uses ONE table. Real business data is in many tables: Sales, Products, Customers, Calendar. Earlier we joined them with VLOOKUP, which is slow and makes files huge.\n\nThe **Data Model** is an in-memory database inside the Excel file (the VertiPaq engine). It compresses data, so it can hold millions of rows (more than the 10,48,576 row sheet limit). **Power Pivot** is the window/add-in used to manage that model: view tables, create relationships, write DAX.\n\n**Enable Power Pivot**: File > Options > Add-ins > Manage: **COM Add-ins** > Go > tick **Microsoft Power Pivot for Excel** > OK. A **Power Pivot** tab appears. Click **Power Pivot > Data Model > Manage** to open the Power Pivot window.',
      tip: 'Power Pivot is available in Microsoft 365 Apps for business/enterprise and most Excel 2016+ desktop editions on Windows. Excel for Mac and Excel for the web cannot open the Power Pivot window.',
    },
    {
      heading: 'Adding data to the Data Model',
      content: 'Ways to load tables into the model:\n\n1. Convert each range to a Table (Ctrl+T) and name it (Table Design > Properties > Table Name: Sales, Products, Customers). Then click inside and **Power Pivot > Tables > Add to Data Model**.\n2. While creating a PivotTable: **Insert > PivotTable > From Table/Range**, tick **Add this data to the Data Model**.\n3. From Power Query: **Close & Load To... > Only Create Connection** + tick **Add this data to the Data Model**.\n4. In the Power Pivot window: **Home > Get External Data** (SQL Server, Access, text files...).\n\n**Fact table**: the big transaction table with numbers (Sales: Date, ProductID, CustomerID, Qty).\n**Lookup / dimension table**: one row per item with descriptions (Products: ProductID, Product, Category, Price).\nThis layout, with lookup tables around a fact table, is called a **star schema**.',
    },
    {
      heading: 'Relationships',
      content: 'A **relationship** links a column in the fact table to a key column in a lookup table, e.g. Sales[ProductID] -> Products[ProductID]. The lookup side must have **unique** values (one), the fact side can repeat (many): a **one-to-many** relationship.\n\nCreate relationships:\n\n- **Diagram View**: Power Pivot window > Home > View > **Diagram View**. Drag Sales[ProductID] onto Products[ProductID].\n- **Data > Data Tools > Relationships > New**: Table: Sales, Column (Foreign): ProductID, Related Table: Products, Related Column (Primary): ProductID > OK.\n- In a PivotTable, when you use fields from unrelated tables Excel shows "Relationships between tables may be needed" with a **CREATE** button.\n\nFilters flow from the "one" side (Products) to the "many" side (Sales). That is why a slicer on Category filters sales.',
      points: [
        'Key columns must have the same data type (both text or both whole number)',
        'Duplicate or blank keys in the lookup table cause an error',
        'Only one active relationship can exist between two tables; others become inactive (dotted line)',
      ],
    },
    {
      heading: 'DAX introduction: calculated columns vs measures',
      content: '**DAX** (Data Analysis Expressions) is the formula language of Power Pivot and Power BI. It looks like Excel formulas but refers to **tables and columns**: `Sales[Qty]`, not cell addresses.\n\n**Calculated column**: computed row by row and stored in the table. Add it in the Power Pivot window Data View: click the **Add Column** header, type the formula, press Enter. Use it when you need a value per row to slice by (e.g. Price Band).\n\n**Measure** (Calculated Field): computed on the fly for each cell of the PivotTable, based on the filters in that cell (filter context). Create via **Power Pivot > Calculations > Measures > New Measure**, or right-click a table in the PivotTable Fields list > **Add Measure**. Use measures for totals, ratios, percentages.\n\nIn the Power Pivot calculation area (below the grid) a measure is written as `Name:=formula`.',
      syntax: 'Total Qty:=SUM(Sales[Qty])',
      tip: 'Rule of thumb: if you will put it in the Values area, write a measure. Measures do not increase file size; calculated columns do.',
    },
    {
      heading: 'Essential DAX functions for beginners',
      content: '- `SUM(Table[Column])`: adds a column. `AVERAGE`, `MIN`, `MAX`, `COUNTROWS(Table)`, `DISTINCTCOUNT(Table[Column])` work similarly.\n- `RELATED(Lookup[Column])`: in a fact-table calculated column, fetches a value from the related lookup table (like VLOOKUP, but uses the relationship).\n- `SUMX(Table, expression)`: an iterator; calculates the expression for every row, then sums. Example: `SUMX(Sales, Sales[Qty] * RELATED(Products[Price]))`.\n- `CALCULATE(expression, filter1, ...)`: evaluates a measure with changed filters. Example: `CALCULATE([Revenue], Customers[Region] = "North")`.\n- `DIVIDE(numerator, denominator, [alternate])`: safe division, returns blank (or alternate) instead of an error when the denominator is 0.\n- `ALL(Table or Column)`: removes filters, used for % of total.',
      syntax: 'CALCULATE(<expression>, <filter1>, [<filter2>], ...)\nSUMX(<table>, <expression>)\nDIVIDE(<numerator>, <denominator>, [<alternateResult>])',
    },
    {
      heading: 'PivotTable from the Data Model',
      content: '1. **Insert > PivotTable > From Data Model** (or, inside the Power Pivot window, Home > PivotTable).\n2. Choose New Worksheet > OK.\n3. In PivotTable Fields, click **All** to see every table in the model.\n4. Drag Products[Category] to Rows, Customers[Region] to Columns, and a measure (fx icon) to Values.\n\nComing up on Day 56: automating repeated tasks with macros. (In Power BI you will reuse the exact same Data Model and DAX skills.)',
    },
  ],
  examples: [
    {
      title: 'Build the Data Model and relationships',
      scenario: 'Three tables are on separate sheets. Sales: OrderID 1-4 with ProductID and CustomerID. Products: P1 Laptop (Electronics, ₹50,000), P2 Chair (Furniture, ₹4,000), P3 Mouse (Electronics, ₹500). Customers: C1 Sharma Traders (North), C2 Iyer Stores (South). Link them.',
      table: {
        headers: ['A: OrderID', 'B: ProductID', 'C: CustomerID', 'D: Qty'],
        rows: [['1', 'P1', 'C1', '2'], ['2', 'P2', 'C2', '1'], ['3', 'P1', 'C2', '3'], ['4', 'P3', 'C1', '5']],
      },
      steps: [
        'Click in each range, press Ctrl+T > OK, and name it in Table Design > Table Name: Sales, Products, Customers.',
        'Click in Sales > Power Pivot > Tables > Add to Data Model. Repeat for Products and Customers.',
        'In the Power Pivot window: Home > View > Diagram View.',
        'Drag ProductID from Sales onto ProductID in Products.',
        'Drag CustomerID from Sales onto CustomerID in Customers.',
        'Double-click a line to check: Sales[ProductID] (many) -> Products[ProductID] (one).',
        'Home > View > Data View to return to the grid.',
      ],
      result: 'Two one-to-many relationships: Products 1-* Sales, Customers 1-* Sales (star schema)',
      explanation: 'No VLOOKUP columns were added. The relationships let any field from Products or Customers filter the Sales table in a PivotTable.',
    },
    {
      title: 'Calculated column with RELATED',
      scenario: 'Add a Line Amount column to the Sales table = Qty x Price from Products.',
      steps: [
        'Open Power Pivot > Data Model > Manage. Click the Sales tab at the bottom.',
        'Click the first cell under "Add Column".',
        'Type the formula below and press Enter.',
        'Right-click the new column header > Rename Column > Line Amount.',
        'Home > Formatting > Format: Currency (₹ symbol from the drop-down).',
      ],
      code: '= Sales[Qty] * RELATED(Products[Price])',
      result: 'Order 1: 1,00,000 | Order 2: 4,000 | Order 3: 1,50,000 | Order 4: 2,500',
      explanation: 'RELATED follows the Sales -> Products relationship to fetch Price for each row: 2 x 50000, 1 x 4000, 3 x 50000, 5 x 500. RELATED only works from the many side to the one side and needs an existing relationship.',
    },
    {
      title: 'Measures: Revenue, Total Qty and Average Order Value',
      scenario: 'Create reusable measures in the Sales table.',
      steps: [
        'Power Pivot > Calculations > Measures > New Measure.',
        'Table name: Sales. Measure name: Revenue. Formula: =SUMX(Sales, Sales[Qty] * RELATED(Products[Price])). Category: Currency. Click Check formula, then OK.',
        'Repeat for Total Qty: =SUM(Sales[Qty]) (Number, 0 decimals).',
        'Repeat for Avg Order Value: =DIVIDE([Revenue], DISTINCTCOUNT(Sales[OrderID])).',
        'Insert > PivotTable > From Data Model > New Worksheet. Tick Revenue, Total Qty and Avg Order Value.',
      ],
      code: `Revenue := SUMX(Sales, Sales[Qty] * RELATED(Products[Price]))
Total Qty := SUM(Sales[Qty])
Avg Order Value := DIVIDE([Revenue], DISTINCTCOUNT(Sales[OrderID]))`,
      result: 'Revenue ₹2,56,500 | Total Qty 11 | Avg Order Value ₹64,125',
      explanation: 'SUMX multiplies Qty and Price row by row (100000 + 4000 + 150000 + 2500 = 256500) without needing a stored column. 256500 / 4 orders = 64125. Measures are referenced in square brackets [Revenue] without a table name.',
    },
    {
      title: 'CALCULATE and % of total in a PivotTable',
      scenario: 'Show revenue by Category, the North region revenue, and each category\'s share of total revenue.',
      steps: [
        'Create measure North Revenue: =CALCULATE([Revenue], Customers[Region] = "North").',
        'Create measure Revenue % : =DIVIDE([Revenue], CALCULATE([Revenue], ALL(Products))). Format: Percentage, 2 decimals.',
        'In a Data Model PivotTable put Products[Category] in Rows.',
        'Put Revenue, North Revenue and Revenue % in Values.',
      ],
      code: `North Revenue := CALCULATE([Revenue], Customers[Region] = "North")
Revenue % := DIVIDE([Revenue], CALCULATE([Revenue], ALL(Products)))`,
      result: 'Electronics: Revenue 2,52,500 | North 1,02,500 | 98.44%\nFurniture: Revenue 4,000 | North (blank) | 1.56%\nGrand Total: 2,56,500 | 1,02,500 | 100.00%',
      explanation: 'Electronics = Laptop 100000 + 150000 + Mouse 2500 = 252500. North orders are 1 and 4 (Sharma Traders): 100000 + 2500 = 102500, both Electronics, so Furniture North is blank. ALL(Products) removes the Category filter so the denominator is always 256500: 252500 / 256500 = 98.44%.',
    },
  ],
  interview: [
    { q: 'What is the Excel Data Model?', a: 'An in-memory, column-compressed database (VertiPaq engine) stored inside the workbook. It holds multiple tables with relationships, can store millions of rows beyond the sheet limit, and is queried by PivotTables, CUBE functions and DAX. Power Pivot is the interface to manage it.', level: 'Easy' },
    { q: 'How do you enable Power Pivot?', a: 'File > Options > Add-ins > at the bottom Manage: COM Add-ins > Go > tick Microsoft Power Pivot for Excel > OK. The Power Pivot tab appears; Power Pivot > Manage opens the window.', level: 'Easy' },
    { q: 'Why are relationships better than VLOOKUP for reporting?', a: 'Relationships avoid duplicating lookup columns in the fact table, keep the file smaller, work for millions of rows, update automatically and allow any field from a lookup table to filter the fact table in PivotTables. VLOOKUP copies values into every row and recalculates slowly.', level: 'Medium' },
    { q: 'What is the difference between a calculated column and a measure?', a: 'A calculated column is evaluated row by row when data refreshes and stored in the table (row context); it increases file size and can be used in rows, columns, slicers. A measure is evaluated at query time for each PivotTable cell based on the filter context; it is not stored and is used in the Values area for aggregations like totals and ratios.', level: 'Medium' },
    { q: 'What does RELATED do and where can it be used?', a: 'RELATED(Lookup[Column]) returns the value from the "one" side table for the current row of the "many" side table using an existing relationship. It needs a row context, so it is used in calculated columns or inside iterators like SUMX/FILTER.', level: 'Medium' },
    { q: 'Explain CALCULATE with an example.', a: 'CALCULATE evaluates an expression in a modified filter context. Example: North Revenue := CALCULATE([Revenue], Customers[Region] = "North") always returns revenue only for North customers, whatever other filters (like Category) exist in the PivotTable. It is the most important DAX function.', level: 'Hard' },
    { q: 'Why use DIVIDE instead of the / operator in DAX?', a: 'DIVIDE handles division by zero safely: it returns BLANK (or an alternate value you specify) instead of an infinity/error. This keeps PivotTables clean. Example: DIVIDE([Profit], [Revenue], 0).', level: 'Easy' },
    { q: 'What is a star schema and why is it recommended?', a: 'A model design with one central fact table (transactions with numeric values and keys) connected by one-to-many relationships to surrounding dimension tables (Products, Customers, Calendar). It is simple to understand, gives correct filter flow and performs best in Power Pivot and Power BI.', level: 'Hard' },
    { q: 'Difference between SUM and SUMX?', a: 'SUM adds the values of one column. SUMX is an iterator: it goes row by row through a table, evaluates an expression (like Qty * Price) for each row, then sums the results. Use SUMX when the value to add must first be calculated per row.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Tables: Attendance (EmpID, Date, Hours) and Employees (EmpID, Name, Dept). Add both to the Data Model and create the relationship.',
      hint: 'Employees is the lookup (one) side.',
      solution: '1. Ctrl+T each range, name them Attendance and Employees.\n2. Power Pivot > Add to Data Model for both.\n3. Data > Data Tools > Relationships > New: Table Attendance, Column EmpID, Related Table Employees, Related Column EmpID > OK.\n(Or drag EmpID in Diagram View.)',
    },
    {
      task: 'Create a measure for Total Hours and a PivotTable showing Total Hours by Dept. Data: E1 (Sales) 8, 9; E2 (HR) 7; E3 (Sales) 6.',
      hint: 'SUM over Attendance[Hours].',
      solution: 'Measure: Total Hours := SUM(Attendance[Hours]). PivotTable from Data Model: Employees[Dept] in Rows, Total Hours in Values.\nResult: HR 7 | Sales 23 | Grand Total 30.',
    },
    {
      task: 'Sales table has Qty and Rate columns. Write a measure for revenue without adding a calculated column, and a measure for the number of distinct customers.',
      hint: 'SUMX and DISTINCTCOUNT.',
      solution: 'Revenue := SUMX(Sales, Sales[Qty] * Sales[Rate])\nCustomers Count := DISTINCTCOUNT(Sales[CustomerID])',
    },
    {
      task: 'Create a measure that shows revenue only for the "Electronics" category, and a profit margin % measure using [Profit] and [Revenue] safely.',
      hint: 'CALCULATE with a filter; DIVIDE.',
      solution: 'Electronics Revenue := CALCULATE([Revenue], Products[Category] = "Electronics")\nMargin % := DIVIDE([Profit], [Revenue])\nFormat Margin % as Percentage.',
    },
    {
      task: 'Add a calculated column "Price Band" in Products: "Premium" if Price >= 10000 else "Standard". Use it as a slicer.',
      hint: 'IF works in DAX like Excel.',
      solution: 'In Power Pivot Data View, Products table, Add Column: = IF(Products[Price] >= 10000, "Premium", "Standard"). Rename to Price Band. In the PivotTable: PivotTable Analyze > Filter > Insert Slicer > Price Band. With the sample data: Laptop = Premium, Chair and Mouse = Standard.',
    },
  ],
  quiz: [
    { question: 'Where do you enable the Power Pivot add-in?', options: ['File > Options > Add-ins > COM Add-ins', 'Data > Get Data', 'Insert > Add-ins > Store', 'View > Macros'], answer: 0, explanation: 'Power Pivot is a COM add-in: File > Options > Add-ins > Manage COM Add-ins > Go.' },
    { question: 'In a one-to-many relationship, the "one" side is usually:', options: ['The Sales fact table', 'The lookup/dimension table with unique keys', 'Any table', 'The PivotTable'], answer: 1, explanation: 'The lookup table (Products, Customers) has unique keys.' },
    { question: 'Which DAX function fetches a value from the related lookup table in a calculated column?', options: ['LOOKUP', 'VLOOKUP', 'RELATED', 'FETCH'], answer: 2, explanation: 'RELATED follows the relationship from many to one.' },
    { question: 'Which is evaluated at query time based on PivotTable filters?', options: ['Calculated column', 'Measure', 'Relationship', 'Table name'], answer: 1, explanation: 'Measures are evaluated in the filter context of each PivotTable cell.' },
    { question: 'Qty 2, 1, 3, 5 with prices 50000, 4000, 50000, 500. What is SUMX(Sales, Qty*Price)?', options: ['₹2,56,500', '₹1,04,500', '₹2,52,500', '₹11'], answer: 0, explanation: '100000 + 4000 + 150000 + 2500 = 256500.' },
  ],
};
