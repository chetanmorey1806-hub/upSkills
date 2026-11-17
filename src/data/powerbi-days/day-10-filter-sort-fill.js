export default {
  id: 'day-10-filter-sort-fill',
  title: 'Filter Rows, Sort Data, Fill Up, Fill Down',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 10,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Keep only the rows you need with text, number and date filters (including advanced AND/OR filters), sort data for the steps that depend on order, and fill missing values from the row above or below – with exact clicks and the M code for each step.',
  objectives: [
    'Filter rows using the checkbox list and Text, Number and Date filters',
    'Build Advanced filters with AND/OR conditions and read Table.SelectRows',
    'Sort by one or many columns with Table.Sort and know when sorting in Power Query matters',
    'Use Fill Down and Fill Up to complete grouped report layouts',
    'Avoid common mistakes: case-sensitive filters, hard-coded values, empty strings that do not fill',
  ],
  theory: [
    {
      heading: 'Filtering rows',
      content:
        `Filtering keeps only the rows that match a condition – like a **sieve** that lets the useful grains through. Click the **drop-down arrow** on a column header:\n\n- **Sort Ascending / Sort Descending**\n- **Remove Empty** – removes null and empty values in this column.\n- **Text Filters / Number Filters / Date Filters** – depending on the column type.\n- **Checkbox list** – tick/untick values. Only the first 1,000 distinct values are listed; click **Load more** if you see "List may be incomplete".\n\nEvery filter becomes a **Filtered Rows** step with \`Table.SelectRows(table, each condition)\`. Inside \`each\`, \`[Column]\` means "the value of this column in the current row".`,
      syntax: `Table.SelectRows(PreviousStep, each [City] = "Pune")
Table.SelectRows(PreviousStep, each ([City] = "Mumbai" or [City] = "Pune"))
Table.SelectRows(PreviousStep, each [City] <> null and [City] <> "")      // Remove Empty`,
      tip: 'Filters on text are case-sensitive: [City] = "pune" will not keep "Pune". Clean the text (Trim + Capitalize) before filtering.',
    },
    {
      heading: 'Text, Number and Date filters',
      content:
        `- **Text Filters**: Equals, Does Not Equal, Begins With, Ends With, Contains, Does Not Contain.\n- **Number Filters**: Equals, Does Not Equal, Greater Than, Greater Than Or Equal To, Less Than, Less Than Or Equal To, Between, Above/Below Average, Top/Bottom N (in some versions).\n- **Date Filters**: Equals, Before, After, Between, In the Next/Previous (days, weeks, months, years), Is Earliest, Is Latest, Year > This year / Last year, Quarter, Month, Week, Day, Custom Filter.\n\n**Basic vs Advanced** dialog: Basic gives two conditions on one column; **Advanced** lets you add clauses on **different columns** combined with **And/Or**.`,
      syntax: `each Text.StartsWith([Product], "Office")
each Text.Contains([Product], "chair", Comparer.OrdinalIgnoreCase)   // case-insensitive (typed in formula bar)
each [SalesAmount] >= 5000 and [SalesAmount] <= 50000
each [OrderDate] >= #date(2024, 1, 1) and [OrderDate] <= #date(2024, 3, 31)
each Date.IsInPreviousNMonths([OrderDate], 3)`,
    },
    {
      heading: 'Sorting data',
      content:
        `Select a column > **Home > Sort Ascending / Sort Descending** (or header drop-down). Sorting a second column adds it as a **secondary sort** to the same step.\n\nImportant: **sorting in Power Query does not control the sort order of visuals** – visuals sort themselves (and you use **Sort by column** in the model for things like month names). Sort in Power Query when a later step depends on order:\n\n- **Fill Down / Fill Up** (needs rows in the right order),\n- **Remove Duplicates** to keep the latest/first record,\n- **Index column** or **Keep Top Rows** (top 10 by amount).`,
      syntax: `Table.Sort(PreviousStep, {{"City", Order.Ascending}, {"SalesAmount", Order.Descending}})`,
      tip: 'Sorting big tables is expensive and may stop query folding. Avoid unnecessary sort steps just for "looks".',
    },
    {
      heading: 'Fill Down and Fill Up',
      content:
        `Many Excel reports show a group label only on the **first row** of each group and leave the rest blank (merged-cell style). For analysis every row needs the value.\n\n- **Fill Down** (select column > **Transform > Fill > Down**) copies the last non-null value **downwards** into null cells below it. M: \`Table.FillDown\`.\n- **Fill Up** (**Transform > Fill > Up**) copies the next non-null value **upwards**. Used when labels appear at the bottom of a group (e.g. subtotal label rows). M: \`Table.FillUp\`.\n\nFill works only on **null**, not on empty text "". If the cells look empty but do not fill, first **Replace Values**: leave Value To Find blank, Replace With \`null\`, Match entire cell contents.`,
      syntax: `Table.FillDown(PreviousStep, {"City"})
Table.FillUp(PreviousStep, {"Category"})`,
    },
    {
      heading: 'Good practices',
      content:
        `1. Filter **early** – fewer rows make every later step faster, and with databases the filter is **folded** into the SQL query.\n2. Filter on **clean** values (after Trim/Capitalize).\n3. Avoid hard-coding moving dates like \`#date(2024,1,1)\` if the report should always show "last 12 months" – use relative date filters like **In the Previous** or parameters.\n4. Use filters instead of **Remove Bottom Rows** when footer rows vary (e.g. filter OrderID does not equal "Grand Total").\n5. Check the row count in the status bar after each filter.`,
    },
  ],
  examples: [
    {
      title: 'Filter out footer rows and blank orders',
      scenario: 'Instead of removing a fixed number of bottom rows, filter out text rows like "Grand Total" and "End of report" and empty OrderIDs.',
      table: {
        headers: ['OrderID (before)', 'Keep?'],
        rows: [
          ['1001', 'Yes'],
          ['1002', 'Yes'],
          ['', 'No (empty)'],
          ['1003', 'Yes'],
          ['Grand Total', 'No'],
          ['End of report', 'No'],
        ],
      },
      steps: [
        'Click the OrderID drop-down arrow > Remove Empty.',
        'Click the OrderID drop-down again > Text Filters > Does Not Equal...',
        'Choose Advanced. Row 1: OrderID does not equal Grand Total. Click Add Clause. Row 2: And, OrderID does not equal End of report. OK.',
      ],
      code: `    #"Filtered Rows" = Table.SelectRows(#"Promoted Headers", each [OrderID] <> null and [OrderID] <> ""),
    #"Filtered Rows1" = Table.SelectRows(#"Filtered Rows", each [OrderID] <> "Grand Total" and [OrderID] <> "End of report")`,
      result: 'Only 1001, 1002, 1003 remain – the same as the rows marked Yes.',
      explanation: 'Content-based filters work no matter how many footer rows the next export has.',
    },
    {
      title: 'Filter Pune and Mumbai orders above ₹5,000',
      scenario: 'A regional manager wants only Pune and Mumbai orders with SalesAmount above 5000.',
      table: {
        headers: ['OrderID', 'City', 'SalesAmount', 'Kept?'],
        rows: [
          [1001, 'Pune', 110000, 'Yes'],
          [1002, 'Mumbai', 4000, 'No (amount)'],
          [1003, 'Nagpur', 12000, 'No (city)'],
          [1004, 'Mumbai', 25000, 'Yes'],
          [1005, 'Pune', 2500, 'No (amount)'],
        ],
      },
      steps: [
        'Click the City drop-down, untick (Select All), tick Mumbai and Pune, OK.',
        'Click the SalesAmount drop-down > Number Filters > Greater Than... > 5000 > OK.',
      ],
      code: `    #"Filtered Rows" = Table.SelectRows(#"Capitalized Each Word", each ([City] = "Mumbai" or [City] = "Pune")),
    #"Filtered Rows1" = Table.SelectRows(#"Filtered Rows", each [SalesAmount] > 5000)`,
      result: 'Two rows remain: 1001 Pune 110000 and 1004 Mumbai 25000.',
      explanation: 'Ticked values become OR conditions; the second filter is applied on the result of the first, so overall it is (Mumbai OR Pune) AND > 5000.',
    },
    {
      title: 'Date filter: Q1 2024 only',
      scenario: 'Keep only orders from 1 Jan 2024 to 31 Mar 2024. OrderDate is already a Date column.',
      table: {
        headers: ['OrderID', 'OrderDate', 'Kept?'],
        rows: [
          [1001, '2024-01-05', 'Yes'],
          [1010, '2023-12-28', 'No'],
          [1020, '2024-03-31', 'Yes'],
          [1030, '2024-04-02', 'No'],
        ],
      },
      steps: [
        'Click the OrderDate drop-down > Date Filters > Between...',
        'is after or equal to: 01-01-2024; And; is before or equal to: 31-03-2024. OK.',
      ],
      code: `    #"Filtered Rows" = Table.SelectRows(#"Renamed Columns", each [OrderDate] >= #date(2024, 1, 1) and [OrderDate] <= #date(2024, 3, 31))`,
      result: 'Orders 1001 and 1020 remain.',
      explanation: '#date(year, month, day) creates a date literal in M. "Between" includes both ends because it uses >= and <=.',
    },
    {
      title: 'Sort by City then by SalesAmount descending',
      scenario: 'Before keeping the top order per city, sort the data.',
      table: {
        headers: ['City', 'OrderID', 'SalesAmount'],
        rows: [
          ['Mumbai', 1004, 25000],
          ['Mumbai', 1002, 4000],
          ['Nagpur', 1003, 12000],
          ['Pune', 1001, 110000],
          ['Pune', 1005, 2500],
        ],
      },
      steps: [
        'Select City > Home > Sort Ascending.',
        'Select SalesAmount > Home > Sort Descending (added as second level to the same step).',
      ],
      code: `    #"Sorted Rows" = Table.Sort(#"Changed Type",{{"City", Order.Ascending}, {"SalesAmount", Order.Descending}})`,
      result: 'Rows ordered as in the table: cities A–Z, and within each city the largest amount first.',
      explanation: 'Table.Sort takes a list of {column, order} pairs; the first pair is the primary sort.',
    },
    {
      title: 'Fill Down a grouped city report',
      scenario: 'An Excel report shows City only on the first row of each block.',
      table: {
        headers: ['City (before)', 'Product', 'Quantity', '→', 'City (after Fill Down)'],
        rows: [
          ['Pune', 'Laptop', 2, '', 'Pune'],
          ['null', 'Mouse', 5, '', 'Pune'],
          ['null', 'Keyboard', 3, '', 'Pune'],
          ['Nashik', 'Office Chair', 1, '', 'Nashik'],
          ['null', 'Desk', 2, '', 'Nashik'],
        ],
      },
      steps: [
        'Check the empty City cells show "null" (italic). If they are just blank, first select City > Transform > Replace Values, leave Value To Find empty, Replace With: null, tick Match entire cell contents, OK.',
        'Select City > Transform > Fill > Down.',
      ],
      code: `    #"Replaced Value" = Table.ReplaceValue(#"Changed Type","",null,Replacer.ReplaceValue,{"City"}),
    #"Filled Down" = Table.FillDown(#"Replaced Value",{"City"})`,
      result: 'Every row has its City: Pune, Pune, Pune, Nashik, Nashik.',
      explanation: 'Table.FillDown copies the last non-null value into following null cells until a new value appears.',
    },
    {
      title: 'Fill Up a category label shown at the bottom',
      scenario: 'A stock report writes the category on the last row of each group.',
      table: {
        headers: ['Product', 'Category (before)', 'Category (after Fill Up)'],
        rows: [
          ['Laptop', 'null', 'Electronics'],
          ['Monitor', 'Electronics', 'Electronics'],
          ['Mouse', 'null', 'Accessories'],
          ['Keyboard', 'Accessories', 'Accessories'],
        ],
      },
      steps: [
        'Select Category > Transform > Fill > Up.',
      ],
      code: `    #"Filled Up" = Table.FillUp(#"Changed Type",{"Category"})`,
      result: 'Laptop gets Electronics and Mouse gets Accessories.',
      explanation: 'Fill Up copies the next non-null value upwards into nulls above it.',
    },
  ],
  interview: [
    { q: 'Which M function is generated for any filter in Power Query?', a: 'Table.SelectRows(table, each condition), where the condition uses [Column] references for the current row.', level: 'Easy' },
    { q: 'Why does Fill Down not fill some empty-looking cells?', a: 'Fill Down only fills null. Those cells contain empty text "" (or spaces). Replace "" with null first (Replace Values with Match entire cell contents), then Fill Down.', level: 'Medium' },
    { q: 'Does sorting in Power Query control the order in visuals?', a: 'No. Visual sort order is set in the visual or with Sort by column in the model. Sorting in Power Query is useful only when later steps depend on row order (fill, remove duplicates, index, keep top rows).', level: 'Medium' },
    { q: 'How do you filter with OR across two different columns?', a: 'Use the Advanced filter dialog with Or between clauses, or edit the formula: Table.SelectRows(t, each [City] = "Pune" or [Segment] = "Corporate").', level: 'Medium' },
    { q: 'Scenario: you filter City = "Pune" but some Pune rows are missing. What do you check?', a: 'Case and spaces – values like "pune" or " Pune". Trim and Capitalize the column before filtering, or use a case-insensitive comparison.', level: 'Medium' },
    { q: 'Why filter early in the query?', a: 'Fewer rows reduce processing for all later steps, and for foldable sources (SQL) the filter becomes a WHERE clause executed at the source.', level: 'Medium' },
    { q: 'What is the risk of hard-coded date filters?', a: 'They do not move with time; next year the report still shows old dates. Use relative date filters (In the Previous N months), parameters, or DAX/report-level relative date slicers.', level: 'Hard' },
    { q: 'Fill Down vs Fill Up – give a real example of each.', a: 'Fill Down: a report where the region name appears on the first row of each region block. Fill Up: a report where the subtotal/category label appears on the last row of each block.', level: 'Easy' },
  ],
  practice: [
    { task: 'In the Power Query Lab, filter the sales export to remove empty OrderIDs and footer text.', hint: 'Remove Empty + Does Not Equal (Advanced).', solution: 'Table.SelectRows(prev, each [OrderID] <> null and [OrderID] <> "") then filter out "Grand Total" and "End of report".' },
    { task: 'Keep only Electronics and Furniture products whose names contain "Chair" or "Laptop".', hint: 'Checkbox list for Category, Advanced Text filter with Or for Product.', solution: 'Table.SelectRows(prev, each ([Category] = "Electronics" or [Category] = "Furniture")) then Table.SelectRows(prev, each Text.Contains([Product], "Chair") or Text.Contains([Product], "Laptop")).' },
    { task: 'Keep orders from the previous 6 months only.', hint: 'Date Filters > In the Previous.', solution: 'Table.SelectRows(prev, each Date.IsInPreviousNMonths([OrderDate], 6)).' },
    { task: 'Sort by OrderDate descending and keep the top 10 rows.', hint: 'Sort then Keep Top Rows.', solution: 'Table.Sort(prev,{{"OrderDate", Order.Descending}}) then Table.FirstN(prev,10).' },
    { task: 'Fill Down a Region column that has blank strings instead of nulls.', hint: 'Replace "" with null first.', solution: 'Table.ReplaceValue(prev,"",null,Replacer.ReplaceValue,{"Region"}) then Table.FillDown(prev,{"Region"}).' },
  ],
  quiz: [
    { question: 'Fill Down fills which cells?', options: ['Empty text only', 'null cells', 'Zero values', 'Error cells'], answer: 1, explanation: 'Table.FillDown fills null values only.' },
    { question: 'Ticking Pune and Mumbai in the filter list produces:', options: ['each ([City] = "Mumbai" or [City] = "Pune")', 'each [City] = "Pune" and [City] = "Mumbai"', 'each [City] <> "Pune"', 'Table.Sort'], answer: 0, explanation: 'Multiple ticked values are combined with OR.' },
    { question: 'Which creates a date literal in M?', options: ['DATE(2024,1,1)', 'Date("2024-01-01")', '"2024-01-01"', '#date(2024, 1, 1)'], answer: 3, explanation: '#date(y, m, d) is the M date literal.' },
    { question: 'Table.Sort(t, {{"City", Order.Ascending}, {"Amount", Order.Descending}}) sorts:', options: ['Only by Amount', 'By Amount then City', 'By City then Amount descending within City', 'Randomly'], answer: 2, explanation: 'First pair is primary, second is secondary.' },
    { question: 'A filter [City] = "pune" on data with "Pune" returns:', options: ['All Pune rows', 'No Pune rows', 'An error', 'Only blank rows'], answer: 1, explanation: 'Text comparison is case-sensitive by default.' },
  ],
};
