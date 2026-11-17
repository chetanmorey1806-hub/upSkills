export default {
  id: 'extra-05-error-handling',
  title: 'Error Handling in Power Query',
  module: 'Extra: Power Query',
  extraNo: 5,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Real data is messy: text in number columns, missing files, renamed columns. Learn the two kinds of Power Query errors (step-level and cell-level), the ribbon tools to keep, remove or replace errors, and the M keywords try, otherwise and error to make refresh robust.',
  objectives: [
    'Distinguish step-level errors from cell-level errors',
    'Find error rows with Keep Errors and fix or remove them with Remove Errors and Replace Errors',
    'Use try ... otherwise to supply a fallback value',
    'Read the try record (HasError, Value, Error) to build an error log column',
    'Prevent common refresh failures caused by renamed or missing columns',
  ],
  theory: [
    {
      heading: 'Two kinds of errors',
      content: '**Step-level errors** stop the whole query. The preview shows a yellow message instead of data, and refresh fails. Typical causes:\n- `DataSource.Error`: file not found, server unreachable, wrong credentials.\n- `Expression.Error: The column \'Qty\' of the table wasn\'t found`: a column was renamed or removed in the source.\n- Syntax mistakes in M.\n\n**Cell-level errors** affect individual cells. The query still loads, but those cells show **Error** in the preview. Typical causes:\n- Changing type of "N/A" or "two" to Whole Number (`DataFormat.Error`).\n- Dividing text by a number in a custom column.\n\nWhen you Close & Apply, cell-level errors are loaded as blank values and Power BI shows "x errors" with a **View errors** link, which creates an error query for you.',
    },
    {
      heading: 'Finding errors: Column quality and Keep Errors',
      content: 'Turn on **View > Column quality**. The bar under each header shows Valid, Error and Empty percentages. A red Error portion tells you where to look.\n\nTo see only bad rows: select the column > **Home > Keep Rows > Keep Errors**. Click a cell (not the word Error, but the white space beside it) to see the error message at the bottom of the preview. Delete this step after investigating.',
      tip: 'Profiling defaults to the top 1000 rows. Click "Column profiling based on top 1000 rows" in the status bar and switch to "entire data set" before deciding there are no errors.',
    },
    {
      heading: 'Remove Errors and Replace Errors',
      content: '- **Home > Remove Rows > Remove Errors** (or right-click column header > Remove Errors) deletes rows where the selected columns have an error. M: `Table.RemoveRowsWithErrors`.\n- **Transform > Replace Values dropdown > Replace Errors** (or right-click header > Replace Errors) replaces error cells with a value you choose, such as 0 or null. M: `Table.ReplaceErrorValues`.\n\nChoose carefully: removing rows can lose valid sales amounts in other columns; replacing with 0 can hide a data problem. Replacing with null and reporting the count is often the honest choice.',
      syntax: 'Table.RemoveRowsWithErrors(table, {"Column1", "Column2"})\nTable.ReplaceErrorValues(table, {{"Column1", 0}, {"Column2", null}})',
    },
    {
      heading: 'try, otherwise and the try record',
      content: '`try expression otherwise fallback` evaluates the expression and returns the fallback if it errors. It is like saying "try to read this as a number; if you cannot, use null".\n\n`try expression` on its own returns a record:\n- When it works: `[HasError = false, Value = ...]`\n- When it fails: `[HasError = true, Error = [Reason = ..., Message = ..., Detail = ...]]`\n\nThis lets you keep the original value and store the error message in a separate column for an error log.\n\nNewer versions also support `try expression catch (e) => ...` where e is the error record.',
      syntax: 'try Number.From([Quantity]) otherwise null\nlet r = try Number.From([Quantity]) in if r[HasError] then r[Error][Message] else null',
    },
    {
      heading: 'Raising your own errors and preventing step errors',
      content: 'Use `error "message"` (or `error Error.Record("Reason", "Message")`) to stop a refresh deliberately when a business rule fails, for example a file with zero rows.\n\nTo prevent step-level errors from source changes:\n- Use `MissingField.Ignore` or `MissingField.UseNull` in Table.RemoveColumns, Table.SelectColumns and Table.RenameColumns.\n- Avoid removing the auto-generated Changed Type step that lists every column on CSV files with changing layouts; type only the columns you need.\n- Wrap risky sources: `try Excel.Workbook(File.Contents(path)) otherwise null`.',
      points: [
        'Errors in a step stop the query; errors in cells do not',
        'try ... otherwise = IFERROR of Power Query',
        'Log errors instead of silently hiding them',
      ],
    },
  ],
  examples: [
    {
      title: 'Find and replace bad Quantity values',
      scenario: 'A sales export has Quantity values "2", "N/A", "5", "two" and "3". Changing the type to Whole Number gives errors in two rows.',
      table: {
        headers: ['OrderID', 'Quantity (text)', 'After Whole Number', 'After Replace Errors with 0'],
        rows: [
          [1001, '2', 2, 2],
          [1002, 'N/A', 'Error', 0],
          [1003, '5', 5, 5],
          [1004, 'two', 'Error', 0],
          [1005, '3', 3, 3],
        ],
      },
      steps: [
        'Select Quantity > Transform > Data Type > Whole Number (errors appear in 1002 and 1004)',
        'View > Column quality: Quantity shows 60% Valid, 40% Error',
        'Select Quantity > Home > Keep Rows > Keep Errors to inspect; click beside an Error to read the DataFormat.Error message',
        'Delete the Kept Errors step in Applied Steps',
        'Right-click the Quantity header > Replace Errors, type 0, OK',
      ],
      code: `#"Changed Type" = Table.TransformColumnTypes(Source, {{"Quantity", Int64.Type}}),
#"Replaced Errors" = Table.ReplaceErrorValues(#"Changed Type", {{"Quantity", 0}})`,
      result: 'Quantity becomes 2, 0, 5, 0, 3 with no errors; Column quality shows 100% Valid.',
      explanation: 'Type conversion created cell-level errors; Table.ReplaceErrorValues swaps each error in the listed column for 0. Use null instead of 0 if zero would distort averages.',
    },
    {
      title: 'Remove error rows',
      scenario: 'Same data, but the business says orders with invalid quantities must not be loaded at all.',
      table: {
        headers: ['OrderID', 'Quantity'],
        rows: [[1001, 2], [1003, 5], [1005, 3]],
      },
      steps: [
        'After the Changed Type step, select the Quantity column',
        'Home > Remove Rows > Remove Errors',
        'Check the row count in the status bar (3 rows)',
      ],
      code: `#"Removed Errors" = Table.RemoveRowsWithErrors(#"Changed Type", {"Quantity"})`,
      result: 'Only orders 1001, 1003 and 1005 remain.',
      explanation: 'Table.RemoveRowsWithErrors drops any row that has an error in the listed columns. Other columns are not checked unless you list them.',
    },
    {
      title: 'try ... otherwise and an error log column',
      scenario: 'Keep every row, convert Quantity safely, and record why conversion failed so the data team can fix the source.',
      table: {
        headers: ['OrderID', 'Quantity', 'QtyNumber', 'QtyError'],
        rows: [
          [1001, '2', 2, 'null'],
          [1002, 'N/A', 'null', 'We couldn\'t convert to Number.'],
          [1003, '5', 5, 'null'],
          [1004, 'two', 'null', 'We couldn\'t convert to Number.'],
          [1005, '3', 3, 'null'],
        ],
      },
      steps: [
        'Keep Quantity as Text (remove the Changed Type step for this column if needed)',
        'Add Column > Custom Column: name QtyNumber, formula try Number.From([Quantity]) otherwise null, OK',
        'Add Column > Custom Column: name QtyError, formula from the code below, OK',
        'Set QtyNumber type to Whole Number and QtyError type to Text',
        'Optional: Reference this query, filter QtyError is not null and load it as an ErrorLog table',
      ],
      code: `#"Added QtyNumber" = Table.AddColumn(Source, "QtyNumber", each try Number.From([Quantity]) otherwise null, Int64.Type),
#"Added QtyError" = Table.AddColumn(#"Added QtyNumber", "QtyError", each
    let r = try Number.From([Quantity])
    in if r[HasError] then r[Error][Message] else null, type nullable text)`,
      result: 'QtyNumber is 2, null, 5, null, 3 and QtyError holds the message for 1002 and 1004 (exact message text may vary by version and locale).',
      explanation: 'try ... otherwise acts like IFERROR. A plain try returns a record with HasError; when true, the Error record holds Reason, Message and Detail, so you can log the message.',
    },
    {
      title: 'Prevent a step-level error from a missing column',
      scenario: 'Sometimes the export contains a column called Remarks and sometimes not. Your Removed Columns step fails with "The column \'Remarks\' of the table wasn\'t found".',
      steps: [
        'Click the failing Removed Columns step',
        'In the formula bar add MissingField.Ignore as the third argument',
        'Press Enter; the step works whether Remarks exists or not',
        'Refresh with both versions of the file to test',
      ],
      code: `#"Removed Columns" = Table.RemoveColumns(#"Promoted Headers", {"Remarks"}, MissingField.Ignore)`,
      result: 'The query refreshes successfully for files with or without the Remarks column.',
      explanation: 'By default Table.RemoveColumns raises an error for missing columns. MissingField.Ignore tells it to skip names that are not present.',
    },
    {
      title: 'Stop refresh with a custom error when the file is empty',
      scenario: 'If the daily file arrives empty, you prefer refresh to fail clearly instead of silently loading zero rows.',
      steps: [
        'Open the Sales query in the Advanced Editor',
        'Add the Checked step before in and return it',
        'Click Done; test with an empty file to see the custom message',
      ],
      code: `let
    Source = Csv.Document(File.Contents(DataFolder & "Sales.csv"), [Delimiter = ",", Encoding = 65001]),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Checked = if Table.RowCount(Promoted) = 0 then error "Sales.csv has no rows. Check the export job." else Promoted
in
    Checked`,
      result: 'With an empty file, refresh fails with "Sales.csv has no rows. Check the export job."; otherwise the table loads normally.',
      explanation: 'The error keyword raises an error deliberately. A clear failure (and refresh failure email in the Service) is better than a dashboard showing zero sales.',
    },
  ],
  interview: [
    { q: 'What is the difference between a step-level and a cell-level error?', a: 'A step-level error (missing file, missing column, bad syntax) stops the entire query. A cell-level error affects individual cells (e.g. converting "N/A" to number); the query still runs and errors load as blanks.', level: 'Easy' },
    { q: 'What is the Power Query equivalent of Excel IFERROR?', a: 'try expression otherwise fallback, for example try Number.From([Quantity]) otherwise 0. The UI equivalent for a whole column is Replace Errors.', level: 'Easy' },
    { q: 'What does try return without otherwise?', a: 'A record. If successful: [HasError = false, Value = result]. If failed: [HasError = true, Error = record with Reason, Message, Detail]. You can expand or read these fields to build error logs.', level: 'Medium' },
    { q: 'After Close & Apply Power BI says "5 rows loaded with errors". What happens and what do you do?', a: 'Error cells load as blank. Click View errors to open an auto-generated error query that keeps only rows with errors, find the cause, then fix in the main query (correct type, clean text, replace errors) and delete the helper query.', level: 'Medium' },
    { q: 'Would you remove error rows or replace errors with 0? Give a scenario.', a: 'It depends on meaning. Replacing a bad Quantity with 0 keeps the SalesAmount of that order but understates quantity; removing the row loses the sale. Often the best choice is null plus an error log reported to the data owner. For a mandatory key column, removing or quarantining the row is safer.', level: 'Hard' },
    { q: 'How do you make a query robust to a column that sometimes does not exist?', a: 'Use MissingField.Ignore or MissingField.UseNull in Table.RemoveColumns, Table.SelectColumns or Table.RenameColumns, and avoid hard-coding all column names in Changed Type.', level: 'Medium' },
    { q: 'How do you deliberately fail a refresh?', a: 'Use the error keyword, e.g. if Table.RowCount(T) = 0 then error "No rows" else T. This raises an Expression.Error with your message, and the Service sends a refresh failure notification.', level: 'Hard' },
  ],
  practice: [
    { task: 'In the Power Query Lab, change a text price column to Decimal Number and count how many errors appear using Column quality.', hint: 'View > Column quality.', solution: 'After Changed Type, the Column quality bar shows the Error %. Keep Errors shows the exact rows; delete that step when done.' },
    { task: 'Replace errors in UnitPrice with null and in Quantity with 0 in one step.', hint: 'Table.ReplaceErrorValues takes a list of {column, value} pairs.', solution: '= Table.ReplaceErrorValues(#"Changed Type", {{"UnitPrice", null}, {"Quantity", 0}})' },
    { task: 'Add a SafeDate column that converts a text OrderDateText column to date and returns null if conversion fails.', hint: 'Date.From inside try ... otherwise.', solution: '= Table.AddColumn(Source, "SafeDate", each try Date.From([OrderDateText]) otherwise null, type nullable date)' },
    { task: 'Make Table.SelectColumns keep OrderID, Quantity and Discount without failing when Discount is absent.', hint: 'Third argument of Table.SelectColumns.', solution: '= Table.SelectColumns(Source, {"OrderID", "Quantity", "Discount"}, MissingField.UseNull)' },
  ],
  quiz: [
    { question: 'Converting "N/A" to Whole Number produces:', options: ['A step-level error that stops the query', 'A cell-level error in that cell', 'The number 0', 'null automatically'], answer: 1, explanation: 'Type conversion failures create cell-level errors; the rest of the query works.' },
    { question: 'Which M function does Home > Remove Rows > Remove Errors generate?', options: ['Table.RemoveErrors', 'Table.RemoveRowsWithErrors', 'Table.SelectRowsWithErrors', 'Table.ReplaceErrorValues'], answer: 1, explanation: 'Remove Errors writes Table.RemoveRowsWithErrors(table, {columns}).' },
    { question: 'What does try Number.From("abc") otherwise -1 return?', options: ['abc', 'An error', '-1', 'null'], answer: 2, explanation: 'The conversion fails, so the otherwise value -1 is returned.' },
    { question: 'Which field of the try record tells you whether an error happened?', options: ['IsError', 'HasError', 'Failed', 'ErrorFlag'], answer: 1, explanation: 'The record has HasError plus Value or Error.' },
    { question: 'Which option prevents Table.RemoveColumns from failing when a column is missing?', options: ['MissingField.Ignore', 'Error.Skip', 'IgnoreErrors = true', 'try RemoveColumns'], answer: 0, explanation: 'MissingField.Ignore skips missing column names.' },
  ],
};
