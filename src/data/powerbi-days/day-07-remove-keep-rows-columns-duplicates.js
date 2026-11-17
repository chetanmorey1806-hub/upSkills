export default {
  id: 'day-07-remove-keep-rows-columns-duplicates',
  title: 'Remove Rows, Remove Columns, Keep Rows, Remove Duplicates',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Reduce a messy export to only the rows and columns you need: remove junk title/total/blank/error rows, drop or choose columns, keep top/bottom/range/duplicate rows and remove duplicates – with the exact clicks and the M code each step generates.',
  objectives: [
    'Remove and choose columns (Remove Columns, Remove Other Columns, Choose Columns)',
    'Remove top, bottom, alternate, blank, duplicate and error rows',
    'Keep top, bottom, range, duplicate and error rows for checking data',
    'Remove duplicates on one or several columns and know that it is case-sensitive',
    'Read and write Table.RemoveColumns, Table.SelectColumns, Table.Skip, Table.RemoveLastN, Table.Distinct and related M functions',
  ],
  theory: [
    {
      heading: 'Why reduce rows and columns first?',
      content:
        `Every extra column and row costs memory, refresh time and confusion. Exports from ERP/billing systems usually contain:\n\n- **title rows** at the top ("Sales Export - Generated..."),\n- **total / footer rows** at the bottom ("Grand Total", "End of report"),\n- **blank rows** between sections,\n- **useless columns** (Notes, internal codes, empty columns),\n- **duplicate rows** when the same order is exported twice.\n\nCleaning them early is like **removing packaging before you cook** – everything later is faster and simpler.\n\nWhere: **Home > Manage Columns** (Choose/Remove Columns) and **Home > Reduce Rows** (Keep Rows / Remove Rows). Many commands are also on the right-click menu of a column header.`,
      tip: 'Prefer "Remove Other Columns" / "Choose Columns" over "Remove Columns". If the source later adds a new junk column, Remove Other Columns automatically ignores it, while Remove Columns lets it through.',
    },
    {
      heading: 'Removing and choosing columns',
      content:
        `1. **Remove Columns** – select one or more headers (Ctrl+click), then **Home > Remove Columns** or press **Delete**. M: \`Table.RemoveColumns\`.\n2. **Remove Other Columns** – select the columns to keep, **Home > Remove Columns > Remove Other Columns**. M: \`Table.SelectColumns\`.\n3. **Choose Columns** – **Home > Choose Columns**, tick the columns to keep in a dialog (good for wide tables). M: \`Table.SelectColumns\`.\n4. **Go to Column** – Choose Columns > Go to Column to find a column in a wide table.`,
      syntax: `Table.RemoveColumns(PreviousStep, {"Notes", "Internal Code"})
Table.SelectColumns(PreviousStep, {"OrderID", "Order Date", "City", "Amount"})`,
    },
    {
      heading: 'Remove Rows options',
      content:
        `**Home > Remove Rows** drop-down:\n\n- **Remove Top Rows** – removes N rows from the top. M: \`Table.Skip(prev, N)\`\n- **Remove Bottom Rows** – removes N rows from the end. M: \`Table.RemoveLastN(prev, N)\`\n- **Remove Alternate Rows** – pattern: first row to remove, number to remove, number to keep. M: \`Table.AlternateRows(prev, offset, skip, take)\`\n- **Remove Duplicates** – on the selected column(s). M: \`Table.Distinct(prev, {cols})\`\n- **Remove Blank Rows** – rows where every value is null or empty.\n- **Remove Errors** – rows with an error in the selected column(s). M: \`Table.RemoveRowsWithErrors(prev, {cols})\``,
      syntax: `Table.SelectRows(PreviousStep, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))   // Remove Blank Rows`,
      tip: 'Remove Bottom Rows is risky when a report sometimes has 2 footer rows and sometimes 3. Filtering out footer text (Day 10) is more robust.',
    },
    {
      heading: 'Keep Rows options',
      content:
        `**Home > Keep Rows** drop-down is the opposite of Remove Rows – handy for testing and for checking problems:\n\n- **Keep Top Rows** – \`Table.FirstN(prev, N)\` (e.g. work on a sample).\n- **Keep Bottom Rows** – \`Table.LastN(prev, N)\`.\n- **Keep Range of Rows** – first row + number of rows. M: \`Table.Range(prev, offset, count)\` where offset is 0-based (first row 10 = offset 9).\n- **Keep Duplicates** – shows only rows whose selected column values appear more than once (great to investigate duplicates before removing).\n- **Keep Errors** – \`Table.SelectRowsWithErrors(prev, {cols})\` – shows only error rows to debug them.`,
    },
    {
      heading: 'Remove Duplicates in detail',
      content:
        `Select the column(s) that define "same row", then **Home > Remove Rows > Remove Duplicates** (or right-click the header > Remove Duplicates).\n\n- Select **one column** (OrderID) – keeps the first row for each OrderID.\n- Select **all columns** (Ctrl+A) – removes only rows that are identical in every column.\n- It is **case-sensitive** and **space-sensitive**: "Pune", "pune" and " Pune" are three different values. Clean text first (Trim, Capitalize – Day 8/9), then remove duplicates.\n- It keeps the **first** occurrence in the current order. If you sort first and want "latest record per key", wrap the sort in \`Table.Buffer\` so the order is respected.`,
      syntax: `Table.Distinct(PreviousStep, {"OrderID"})              // duplicates by OrderID
Table.Distinct(PreviousStep)                           // fully identical rows`,
    },
  ],
  examples: [
    {
      title: 'Remove the title row and the footer rows',
      scenario: 'The raw sales_export.csv has a title row at the top and two footer rows at the bottom.',
      table: {
        headers: ['Column1', 'Column2', 'Column3', 'Column4', 'Column5', 'Column6', 'Column7', 'Column8'],
        rows: [
          ['Sales Export - Generated 01-Apr-2024', '', '', '', '', '', '', ''],
          ['OrderID', 'Order Date', 'Customer', 'City', 'Product', 'Qty', 'Amount', 'Notes'],
          ['1001', '05-01-2024', 'patil traders', ' pune', 'Laptop', '2', '110000', 'urgent'],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000', ''],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000', ''],
          ['', '', '', '', '', '', '', ''],
          ['1003', '08-01-2024', 'Kulkarni Stores', 'nagpur', 'Office Chair', '1', '12000', ''],
          ['Grand Total', '', '', '', '', '', '130000', ''],
          ['End of report', '', '', '', '', '', '', ''],
        ],
      },
      steps: [
        'Home > Transform data to open Power Query and select the sales_export query.',
        'Home > Remove Rows > Remove Top Rows > Number of rows: 1 > OK.',
        'Home > Use First Row as Headers.',
        'Home > Remove Rows > Remove Bottom Rows > Number of rows: 2 > OK.',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\sales_export.csv"),[Delimiter=",", Columns=8, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Removed Top Rows" = Table.Skip(Source,1),
    #"Promoted Headers" = Table.PromoteHeaders(#"Removed Top Rows", [PromoteAllScalars=true]),
    #"Removed Bottom Rows" = Table.RemoveLastN(#"Promoted Headers",2)
in
    #"Removed Bottom Rows"`,
      result: 'Headers are OrderID ... Notes and 5 data rows remain (1001, 1002, 1002, blank, 1003). Title, Grand Total and End of report are gone.',
      explanation: 'Table.Skip drops rows from the top; Table.RemoveLastN drops rows from the bottom.',
    },
    {
      title: 'Remove blank rows and the Notes column',
      scenario: 'Continue from the previous result: one row is completely blank and the Notes column is not needed.',
      table: {
        headers: ['OrderID', 'Order Date', 'Customer', 'City', 'Product', 'Qty', 'Amount'],
        rows: [
          ['1001', '05-01-2024', 'patil traders', ' pune', 'Laptop', '2', '110000'],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000'],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000'],
          ['1003', '08-01-2024', 'Kulkarni Stores', 'nagpur', 'Office Chair', '1', '12000'],
        ],
      },
      steps: [
        'Home > Remove Rows > Remove Blank Rows.',
        'Click the Notes column header.',
        'Right-click > Remove (or press Delete).',
        'Better alternative: select OrderID, then Shift+click Amount to select the 7 needed columns > Home > Remove Columns > Remove Other Columns.',
      ],
      code: `    #"Removed Blank Rows" = Table.SelectRows(#"Removed Bottom Rows", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Removed Other Columns" = Table.SelectColumns(#"Removed Blank Rows",{"OrderID", "Order Date", "Customer", "City", "Product", "Qty", "Amount"})`,
      result: 'The table above: 4 rows, 7 columns (after-state).',
      explanation: 'Remove Blank Rows keeps a row only if at least one field is not empty or null. Table.SelectColumns keeps the listed columns in that order.',
    },
    {
      title: 'Find and remove duplicate orders',
      scenario: 'Order 1002 was exported twice. First check which orders are duplicated, then remove them.',
      table: {
        headers: ['OrderID', 'Order Date', 'Customer', 'City', 'Product', 'Qty', 'Amount'],
        rows: [
          ['1001', '05-01-2024', 'patil traders', ' pune', 'Laptop', '2', '110000'],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000'],
          ['1003', '08-01-2024', 'Kulkarni Stores', 'nagpur', 'Office Chair', '1', '12000'],
        ],
      },
      steps: [
        'Right-click the query in the Queries pane > Reference (a checking copy). Name it "DupCheck".',
        'In DupCheck select OrderID > Home > Keep Rows > Keep Duplicates. You see the two 1002 rows. Untick Enable load for DupCheck.',
        'Go back to the main query. Select the OrderID column.',
        'Home > Remove Rows > Remove Duplicates.',
      ],
      code: `// Keep Duplicates (in DupCheck query) – generated by Power Query
    #"Kept Duplicates" = let columnNames = {"OrderID"}, addCount = Table.Group(Source, columnNames, {{"Count", Table.RowCount, type number}}), selectDuplicates = Table.SelectRows(addCount, each [Count] > 1), removeCount = Table.RemoveColumns(selectDuplicates, "Count") in Table.Join(Source, columnNames, removeCount, columnNames, JoinKind.Inner)

// Remove Duplicates (in main query)
    #"Removed Duplicates" = Table.Distinct(#"Removed Other Columns", {"OrderID"})`,
      result: 'Main query has 3 unique orders (after table). DupCheck showed 2 rows for 1002.',
      explanation: 'Keep Duplicates groups by the key, keeps keys with count > 1 and joins back. Table.Distinct keeps the first row per OrderID.',
    },
    {
      title: 'Case-sensitive duplicates trap',
      scenario: 'A customer list has the same customer typed differently. Remove Duplicates on Customer does not reduce rows.',
      table: {
        headers: ['Before: Customer', 'After Trim + Capitalize + Remove Duplicates'],
        rows: [
          ['Patil Traders', 'Patil Traders'],
          ['patil traders', 'Shah & Sons'],
          [' Patil Traders', ''],
          ['SHAH & SONS', ''],
          ['Shah & Sons', ''],
        ],
      },
      steps: [
        'Select Customer > Home > Remove Rows > Remove Duplicates – still 5 rows (all different by case/space).',
        'Delete that step. Select Customer > Transform > Format > Trim.',
        'Transform > Format > Capitalize Each Word.',
        'Home > Remove Rows > Remove Duplicates.',
      ],
      code: `    #"Trimmed Text" = Table.TransformColumns(Source,{{"Customer", Text.Trim, type text}}),
    #"Capitalized Each Word" = Table.TransformColumns(#"Trimmed Text",{{"Customer", Text.Proper, type text}}),
    #"Removed Duplicates" = Table.Distinct(#"Capitalized Each Word", {"Customer"})`,
      result: 'Only 2 customers remain: Patil Traders and Shah & Sons.',
      explanation: 'Table.Distinct compares exact text. Standardising case and spaces first makes equal names truly equal.',
    },
    {
      title: 'Keep a range of rows for testing and remove error rows',
      scenario: 'A 1-lakh-row file is slow while building steps, and some Amount values are "N/A" causing errors after type change.',
      table: {
        headers: ['OrderID', 'Amount (after Change Type)'],
        rows: [
          ['1001', '110000'],
          ['1002', '4000'],
          ['1004', 'Error'],
          ['1005', '2500'],
        ],
      },
      steps: [
        'Home > Keep Rows > Keep Top Rows > 1000 > OK (temporary, for faster building).',
        'Select Amount > Home > Keep Rows > Keep Errors to inspect the error rows (1004 had "N/A"). Delete this step after checking.',
        'Select Amount > Home > Remove Rows > Remove Errors.',
        'Before finishing, delete the "Kept First Rows" step so all data loads.',
      ],
      code: `    #"Kept First Rows" = Table.FirstN(#"Changed Type",1000),
    #"Kept Errors" = Table.SelectRowsWithErrors(#"Kept First Rows", {"Amount"}),
    #"Removed Errors" = Table.RemoveRowsWithErrors(#"Kept First Rows", {"Amount"})`,
      result: 'After removing errors: rows 1001, 1002, 1005 remain. 1004 is removed.',
      explanation: 'Keep Errors helps you understand bad data; Remove Errors drops it. In real projects consider replacing errors instead of losing rows (Transform > Replace Errors).',
    },
  ],
  interview: [
    { q: 'Remove Columns vs Remove Other Columns – which is better and why?', a: 'Remove Other Columns (Table.SelectColumns) is usually better because it lists the columns to keep. If the source adds new columns later, they are ignored automatically. Remove Columns lists columns to drop and fails if a removed column no longer exists.', level: 'Medium' },
    { q: 'Is Remove Duplicates case-sensitive in Power Query?', a: 'Yes. "Pune" and "pune" are different. Trim and standardise case before removing duplicates, or use Table.Distinct with Comparer.OrdinalIgnoreCase in M.', level: 'Medium' },
    { q: 'Which row does Remove Duplicates keep?', a: 'The first occurrence in the current row order. To keep the latest record, sort descending by date and buffer the table (Table.Buffer) before Table.Distinct so the sort order is guaranteed.', level: 'Hard' },
    { q: 'How do you find duplicate values without removing them?', a: 'Select the key column and use Home > Keep Rows > Keep Duplicates (preferably in a referenced query), or Group By the key with Count Rows and filter count > 1.', level: 'Medium' },
    { q: 'What is the M function for Remove Top Rows and Remove Bottom Rows?', a: 'Table.Skip(table, n) for top rows, Table.RemoveLastN(table, n) for bottom rows.', level: 'Easy' },
    { q: 'Scenario: a monthly report has a variable number of footer rows. How do you remove them reliably?', a: 'Instead of Remove Bottom Rows with a fixed count, filter rows based on content, for example filter OrderID to keep only numeric values, or exclude values like "Grand Total" and "End of report", or change type and remove errors.', level: 'Hard' },
    { q: 'What does Remove Blank Rows check?', a: 'It keeps rows where at least one field is not null or empty string, using Record.FieldValues and List.RemoveMatchingItems.', level: 'Medium' },
    { q: 'Why would you use Keep Top Rows during development?', a: 'To work on a small sample for faster previews with large sources. Remember to remove the step before loading, or use a parameter to control it.', level: 'Easy' },
  ],
  practice: [
    { task: 'In the Power Query Lab, remove the title row, promote headers and remove the footer rows from the messy sales export.', hint: 'Remove Top Rows 1, Use First Row as Headers, Remove Bottom Rows.', solution: 'Table.Skip(Source,1) > Table.PromoteHeaders > Table.RemoveLastN(prev,2). Check that "Grand Total" is gone.' },
    { task: 'Keep only OrderID, Order Date, City, Product, Qty and Amount using Choose Columns.', hint: 'Home > Choose Columns.', solution: 'Home > Choose Columns > untick Customer and Notes > OK. M: Table.SelectColumns(prev,{"OrderID","Order Date","City","Product","Qty","Amount"}).' },
    { task: 'List the OrderIDs that appear more than once without changing the main query.', hint: 'Reference + Keep Duplicates.', solution: 'Reference the query > select OrderID > Keep Rows > Keep Duplicates > disable load.' },
    { task: 'Remove duplicate customers after making the names consistent.', hint: 'Trim and Capitalize Each Word first.', solution: 'Transform > Format > Trim, then Capitalize Each Word, then Remove Duplicates on Customer.' },
    { task: 'Keep rows 11 to 20 of a table.', hint: 'Keep Range of Rows, first row 11, number 10.', solution: 'Home > Keep Rows > Keep Range of Rows > First row 11, Number of rows 10. M: Table.Range(prev,10,10).' },
  ],
  quiz: [
    { question: 'Which M function does Remove Top Rows generate?', options: ['Table.FirstN', 'Table.RemoveLastN', 'Table.Skip', 'Table.Range'], answer: 2, explanation: 'Table.Skip skips the first N rows.' },
    { question: 'Remove Other Columns generates:', options: ['Table.RemoveColumns', 'Table.SelectColumns', 'Table.ReorderColumns', 'Table.Distinct'], answer: 1, explanation: 'It keeps (selects) the chosen columns.' },
    { question: '"Pune" and "pune" after Remove Duplicates on City will:', options: ['Both remain', 'Become one row', 'Cause an error', 'Be converted to PUNE'], answer: 0, explanation: 'Remove Duplicates is case-sensitive.' },
    { question: 'Keep Range of Rows with first row 5 and 3 rows produces:', options: ['Table.Range(prev,5,3)', 'Table.FirstN(prev,5)', 'Table.Skip(prev,3)', 'Table.Range(prev,4,3)'], answer: 3, explanation: 'Offset is zero-based, so row 5 is offset 4.' },
    { question: 'To debug rows that have errors in a column, use:', options: ['Remove Errors', 'Remove Blank Rows', 'Keep Errors', 'Keep Duplicates'], answer: 2, explanation: 'Keep Errors shows only error rows.' },
  ],
};
