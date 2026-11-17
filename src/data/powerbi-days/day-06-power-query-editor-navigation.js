export default {
  id: 'day-06-power-query-editor-navigation',
  title: 'Introduction to Power Query Editor, Query Navigation',
  module: 'Module 2: Power Query – Data Cleaning',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Meet the Power Query Editor – the data-cleaning workshop inside Power BI. Learn every part of its screen, how Applied Steps record your clicks as M code, and how to navigate, rename, group, duplicate, reference and control loading of queries.',
  objectives: [
    'Open the Power Query Editor and identify the ribbon, Queries pane, preview grid, formula bar and Query Settings',
    'Understand Applied Steps and read the M code (let ... in) generated for each step',
    'Use column quality, distribution and profile to spot dirty data',
    'Rename, group, duplicate and reference queries, and disable load for helper queries',
    'Use Close & Apply, Close and Apply correctly and view Query dependencies',
  ],
  theory: [
    {
      heading: 'What is Power Query and why use it?',
      content:
        `**Power Query** is the ETL (Extract, Transform, Load) tool inside Power BI (and Excel, Dataflows, Fabric). You clean data with clicks; Power Query records every click as a **step** written in the **M language**.\n\nAnalogy: Power Query is like a **recipe card**. The first time you cook (clean), you write each step. Next month, when new vegetables (data) arrive, you just follow the same card – click **Refresh** and every step runs again automatically.\n\nPower Query **never changes the source file**. It only changes the copy that loads into the model.`,
    },
    {
      heading: 'Opening the editor and its layout',
      content:
        `Open it with **Home > Transform data** (or click Transform data in the Navigator while importing).\n\nScreen areas:\n\n1. **Ribbon tabs** – **Home** (Close & Apply, New Source, Manage columns, Reduce rows, Combine), **Transform** (changes existing columns), **Add Column** (creates new columns), **View** (formula bar, data profiling, Advanced Editor, Query dependencies), **Tools**, **Help**.\n2. **Queries pane** (left) – list of all queries (each becomes a table if loaded).\n3. **Data preview grid** (centre) – preview of the data (not all rows for big sources).\n4. **Formula bar** – the M code of the selected step. Turn it on with **View > Formula Bar**.\n5. **Query Settings pane** (right) – **Properties > Name** and **Applied Steps**.\n6. **Status bar** – column count, row count of preview, and "Column profiling based on top 1000 rows".`,
      points: [
        '**Transform tab** = modify the selected column in place (e.g. make text UPPERCASE).',
        '**Add Column tab** = keep the original and add a new column with the result.',
        'Column header icons: **ABC** text, **123** whole number, **1.2** decimal, **calendar** date, **ABC/123** any (type not set).',
      ],
      tip: 'If you do not see the formula bar, turn it on now (View > Formula Bar). Reading the M code for each step is the fastest way to learn Power Query.',
    },
    {
      heading: 'Applied Steps and the M code behind them',
      content:
        `Every action adds a step to **Applied Steps**. Each step takes the previous step's table and returns a new one. In M this is a \`let ... in\` expression: each line is \`StepName = function(PreviousStep, ...)\`, and \`in\` returns the final step.\n\nWorking with steps:\n\n- **Click a step** to see the data at that moment (time travel).\n- **Gear icon** next to a step re-opens its dialog to edit settings.\n- **Right-click** a step > **Rename**, **Delete**, **Delete Until End**, **Insert Step After**, **Move up/down**, **Properties** (add a description).\n- Adding a step while an earlier step is selected shows a warning **Insert Step** – later steps may break if they reference changed columns.\n- Step names with spaces are written as \`#"Step Name"\` in M.\n- **View > Advanced Editor** shows the whole query code.`,
      syntax: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\sales_export.csv"),[Delimiter=",", Encoding=65001]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{{"OrderID", Int64.Type}, {"Amount", type number}})
in
    #"Changed Type"`,
    },
    {
      heading: 'Data profiling: column quality, distribution, profile',
      content:
        `Turn on from the **View** tab:\n\n- **Column quality** – green bar with % **Valid**, % **Error** (red) and % **Empty** (grey) per column.\n- **Column distribution** – small histogram with **distinct** and **unique** counts. If distinct = row count the column could be a key.\n- **Column profile** – detailed statistics (min, max, average, count, nulls, errors, value distribution) for the selected column at the bottom.\n\nBy default profiling uses the **top 1000 rows**. Click the status bar text "Column profiling based on top 1000 rows" and choose **Column profiling based on entire data set** for exact numbers.`,
      tip: 'Distinct = number of different values. Unique = number of values that appear exactly once.',
    },
    {
      heading: 'Query navigation and management',
      content:
        `In the **Queries pane** right-click a query to:\n\n- **Rename** (or edit Name in Query Settings) – the query name becomes the table name in the model. Use clear names like Sales, Product.\n- **Duplicate** – a full independent copy of all steps.\n- **Reference** – a new query whose Source is the original query's result. Changes in the original flow into the reference.\n- **Move To Group > New Group** – folders such as "Fact", "Dimensions", "Helpers".\n- **Enable load** (untick) – query is available to other queries but is **not loaded** into the model (shown in italics). Good for staging/helper queries.\n- **Include in report refresh** – untick for static data that never changes.\n\n**View > Query dependencies** shows a diagram of how queries feed each other and their sources.`,
    },
    {
      heading: 'Close & Apply, Close, Apply, and Refresh Preview',
      content:
        `- **Home > Close & Apply** – closes the editor and loads all changes into the model (most common).\n- **Close & Apply > Apply** – loads changes but keeps the editor open.\n- **Close & Apply > Close** – closes without applying; Desktop shows a yellow banner "There are pending changes in your queries that haven't been applied".\n- **Home > Refresh Preview** – re-reads the source for the preview only.\n\nIf a step fails, the preview shows an **error message** and a yellow warning; click **Go to Error** to jump to the problem.`,
    },
  ],
  examples: [
    {
      title: 'Open the messy sales export and explore the editor',
      scenario: 'Import the messy export file sales_export.csv (the same file used in the Power Query Lab) and look at every part of the editor.',
      table: {
        headers: ['Column1', 'Column2', 'Column3', 'Column4', 'Column5', 'Column6', 'Column7'],
        rows: [
          ['Sales Export - Generated 01-Apr-2024', '', '', '', '', '', ''],
          ['OrderID', 'Order Date', 'Customer', 'City', 'Product', 'Qty', 'Amount'],
          ['1001', '05-01-2024', 'patil traders', ' pune', 'Laptop', '2', '110000'],
          ['1002', '06-01-2024', 'SHAH & SONS', 'Mumbai ', 'Mouse', '5', '4000'],
          ['1003', '08-01-2024', 'Kulkarni Stores', 'nagpur', 'Office Chair', '1', '12000'],
        ],
      },
      steps: [
        'Home > Get data > Text/CSV > choose sales_export.csv > Transform data.',
        'Click View > Formula Bar (tick) if it is hidden.',
        'In Query Settings > Applied Steps, click Source – the formula bar shows Csv.Document(...).',
        'Click View > Column quality and Column distribution to see the bars above each column.',
        'Note the header icons: Power Query has guessed types (ABC/123) for Column1..Column7.',
        'Click View > Advanced Editor to see the full let ... in code, then click Done.',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\sales_export.csv"),[Delimiter=",", Columns=7, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Changed Type" = Table.TransformColumnTypes(Source,{{"Column1", type text}, {"Column2", type text}, {"Column3", type text}, {"Column4", type text}, {"Column5", type text}, {"Column6", type text}, {"Column7", type text}})
in
    #"Changed Type"`,
      result: 'You see the raw table with the title row, headers in row 2, and inconsistent text – this is what we clean over Days 7 to 12.',
      explanation: 'Because the first row is a title, Power Query could not detect headers, so it named columns Column1..Column7 and typed them as text.',
    },
    {
      title: 'Navigate Applied Steps like a time machine',
      scenario: 'After promoting headers and changing types you want to see the data before the type change.',
      table: {
        headers: ['Applied step', 'What the preview shows'],
        rows: [
          ['Source', 'Raw rows, Column1..Column7'],
          ['Removed Top Rows', 'Title row gone, headers still in row 1 as data'],
          ['Promoted Headers', 'OrderID, Order Date, Customer ... as column names'],
          ['Changed Type1', 'OrderID 123, Qty 123, Amount 1.2 icons'],
        ],
      },
      steps: [
        'Home > Remove Rows > Remove Top Rows > Number of rows 1 > OK.',
        'Home > Use First Row as Headers (Power Query adds Promoted Headers and Changed Type1).',
        'Click each step in Applied Steps from top to bottom and watch the preview change.',
        'Right-click "Changed Type1" > Rename > type "Set Types".',
        'Right-click the step "Changed Type" (the original automatic one on Column1..7) > Delete – it is not needed.',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\PBI\\sales_export.csv"),[Delimiter=",", Columns=7, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Removed Top Rows" = Table.Skip(Source,1),
    #"Promoted Headers" = Table.PromoteHeaders(#"Removed Top Rows", [PromoteAllScalars=true]),
    #"Set Types" = Table.TransformColumnTypes(#"Promoted Headers",{{"OrderID", Int64.Type}, {"Order Date", type text}, {"Customer", type text}, {"City", type text}, {"Product", type text}, {"Qty", Int64.Type}, {"Amount", type number}})
in
    #"Set Types"`,
      result: 'Clicking any step shows the table at that point. The renamed step appears as #"Set Types" in the code.',
      explanation: 'Each step only stores a transformation, not a copy of data, so jumping between steps is just re-evaluating up to that point.',
    },
    {
      title: 'Duplicate vs Reference',
      scenario: 'You need a City list (lookup) built from the cleaned Sales query.',
      steps: [
        'In the Queries pane right-click "sales_export" > Rename > "Sales".',
        'Right-click Sales > Reference. A new query "Sales (2)" appears with one step: Source = Sales.',
        'Rename it "CityList".',
        'Select the City column > Home > Remove Columns > Remove Other Columns.',
        'Home > Remove Rows > Remove Duplicates.',
      ],
      code: `let
    Source = Sales,
    #"Removed Other Columns" = Table.SelectColumns(Source,{"City"}),
    #"Removed Duplicates" = Table.Distinct(#"Removed Other Columns")
in
    #"Removed Duplicates"`,
      result: 'CityList has one column of distinct cities. Any future cleaning added to Sales automatically flows into CityList.',
      explanation: 'Reference reuses the result of Sales; Duplicate would copy all of Sales\' steps, so fixes would have to be made twice.',
    },
    {
      title: 'Organise queries into groups and disable load',
      scenario: 'Keep the model tidy: a staging query should not appear in the report.',
      steps: [
        'Right-click Sales > Reference, rename the new query "Sales_Staging". (Imagine it holds intermediate logic.)',
        'Right-click Sales_Staging > untick Enable load. The name turns italic.',
        'Right-click Sales_Staging > Move To Group > New Group... > "Staging" > OK.',
        'Right-click Sales and CityList > Move To Group > New Group "Model".',
        'Click View > Query dependencies to see sales_export.csv > Sales > CityList / Sales_Staging.',
        'Home > Close & Apply.',
      ],
      result: 'The model (Data pane) shows Sales and CityList only. Sales_Staging exists in Power Query but is not loaded.',
      explanation: 'Disabling load saves memory and keeps the field list clean while keeping helper logic available.',
    },
  ],
  interview: [
    { q: 'What is Power Query?', a: 'The data connection and transformation (ETL) engine in Power BI. It records each transformation as a step in the M language and replays the steps on every refresh without changing the source.', level: 'Easy' },
    { q: 'What is the difference between the Transform tab and the Add Column tab?', a: 'Transform changes the selected column in place. Add Column creates a new column with the result and keeps the original.', level: 'Easy' },
    { q: 'What is the difference between Duplicate and Reference?', a: 'Duplicate copies all steps into an independent query. Reference creates a new query whose source is the output of the original, so changes to the original flow into it. Reference avoids repeating logic.', level: 'Medium' },
    { q: 'Why does column profiling show different numbers from the real data?', a: 'By default profiling is based on the top 1000 rows. Switch to "Column profiling based on entire data set" from the status bar for full statistics.', level: 'Medium' },
    { q: 'What does disabling "Enable load" do?', a: 'The query still runs when other queries need it but its output is not loaded as a table into the model. Used for staging, helper or parameter queries.', level: 'Medium' },
    { q: 'What is the structure of M code?', a: 'A let expression containing named steps, each usually calling a function on the previous step, and an in clause that returns the final step. Step names with spaces are written #"Like This".', level: 'Medium' },
    { q: 'Scenario: you inserted a step in the middle and now a later step shows an error "column X not found". What happened and how do you fix it?', a: 'A later step references a column by name that the new step removed or renamed. Fix by editing the later step (gear icon or formula bar) to use the new name, moving the inserted step, or deleting it.', level: 'Hard' },
    { q: 'Does Power Query change the source Excel file?', a: 'No. It reads the source and applies transformations only to the data loaded into Power BI.', level: 'Easy' },
  ],
  practice: [
    { task: 'Open sales_export.csv in Power Query, turn on formula bar, column quality, distribution and profile, and note which columns have empty values.', hint: 'View tab.', solution: 'View > tick Formula Bar, Column quality, Column distribution, Column profile. Grey % in Column quality shows empty values.' },
    { task: 'Remove the title row, promote headers and rename every step to a meaningful name.', hint: 'Right-click step > Rename.', solution: 'Remove Top Rows (1) > Use First Row as Headers. Rename steps e.g. "Remove title row", "Promote headers", "Set types".' },
    { task: 'Create a referenced query listing distinct Product names. Disable its load and group it under "Helpers". Try this in the Power Query Lab too.', hint: 'Reference > Remove Other Columns > Remove Duplicates.', solution: 'Right-click Sales > Reference > select Product > Remove Other Columns > Remove Duplicates > untick Enable load > Move To Group "Helpers".' },
    { task: 'Open Advanced Editor and identify the step that removes the title row.', hint: 'Look for Table.Skip.', solution: '#"Removed Top Rows" = Table.Skip(Source,1).' },
  ],
  quiz: [
    { question: 'Where do you see the list of transformations applied to a query?', options: ['Queries pane', 'Applied Steps in Query Settings', 'Visualizations pane', 'Status bar'], answer: 1, explanation: 'Applied Steps lists every recorded step.' },
    { question: 'Which keyword ends the list of steps and returns the result in M?', options: ['in', 'return', 'end', 'output'], answer: 0, explanation: 'let ... in – the in clause returns a value.' },
    { question: 'A query shown in italics in the Queries pane means:', options: ['It has errors', 'It is a function', 'It is a parameter', 'Enable load is off'], answer: 3, explanation: 'Queries not loaded to the model appear in italics.' },
    { question: 'Column profiling by default uses:', options: ['Entire data set', 'Top 100 rows', 'Top 1000 rows', 'Random sample'], answer: 2, explanation: 'Default is top 1000 rows.' },
    { question: 'To keep the original column and create a new one with UPPERCASE text, use:', options: ['Transform > Format > UPPERCASE', 'Add Column > Format > UPPERCASE', 'Home > Replace Values', 'View > Advanced Editor'], answer: 1, explanation: 'Add Column tab creates a new column.' },
  ],
};
