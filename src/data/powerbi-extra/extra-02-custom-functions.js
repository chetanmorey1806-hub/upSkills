export default {
  id: 'extra-02-custom-functions',
  title: 'Custom Functions in Power Query',
  module: 'Extra: Power Query',
  extraNo: 2,
  level: 'Advanced',
  duration: '2 hours',
  summary: 'A custom function is a reusable piece of M logic that takes inputs and returns a result. Write the cleaning or calculation logic once, then apply it to many columns, rows or files instead of repeating the same steps.',
  objectives: [
    'Write a custom function with the (parameter) => body syntax',
    'Add data types and optional parameters to function inputs',
    'Invoke a function with Add Column > Invoke Custom Function and from M code',
    'Turn a parameterised query into a function with Create Function',
    'Use a function to load and combine many files from a folder',
  ],
  theory: [
    {
      heading: 'Why custom functions?',
      content: 'Imagine you clean customer names in 5 different queries: trim spaces, remove hidden characters, make Proper Case. If the rule changes, you must edit 5 places. A custom function is like a stamp: you design it once and press it wherever you need.\n\nCustom functions help you:\n- Avoid repeating the same steps (DRY: Do not Repeat Yourself).\n- Keep business rules (GST rate, fiscal year logic) in one place.\n- Process many files with identical layout (the Combine Files feature itself creates a function called Transform File).',
    },
    {
      heading: 'Function syntax',
      content: 'A function is written as a parameter list in brackets, the arrow `=>`, and a body. You create it in a Blank Query (Home > New Source > Blank Query > Advanced Editor) and the query name becomes the function name.\n\n- Parameters can have types: `(price as number, rate as number) as number => ...`. Types make errors clearer.\n- Use `nullable` when nulls are allowed: `(t as nullable text) => ...`.\n- Use `optional` for parameters that may be skipped. Optional parameters must come last and receive null when missed.\n- The body can be a single expression or a full `let ... in` block.\n\nOnce created, the query shows an fx icon and an Enter Parameters panel where you can test it.',
      syntax: '(param1 as type, optional param2 as nullable type) as returnType =>\n    let\n        Step1 = ...,\n        Result = ...\n    in\n        Result',
      tip: 'Name functions with a prefix like fn (fnAddGST, fnCleanText) so they are easy to spot in the Queries pane.',
    },
    {
      heading: 'Invoking a function',
      content: 'There are three common ways to call a function:\n\n1. **Enter Parameters panel**: select the function query, type values, click Invoke. This creates a new query with the result (good for testing).\n2. **Add Column > Invoke Custom Function**: choose the function and map each parameter to a column or a fixed value. Power Query writes `Table.AddColumn(..., each fnName([Col1], 0.18))`.\n3. **Directly in M**: `fnCleanText(" pune ")`, or pass the function as a value: `Table.TransformColumns(Source, {{"City", fnCleanText, type text}})`. Note: no brackets after the name when you pass the function itself.',
    },
    {
      heading: 'Create Function from a query',
      content: 'You can build logic with normal clicks and then convert it into a function:\n\n1. Create a parameter (Home > Manage Parameters > New Parameter), for example FilePath of type Text.\n2. Build a query that uses the parameter instead of a hard-coded value.\n3. Right-click that query > **Create Function**, give a name such as fnLoadSalesFile.\n\nPower Query keeps the sample query linked to the function. When you edit the sample query, the function updates automatically. This is exactly how Combine Files works with its Sample File and Transform File queries.',
    },
    {
      heading: 'Performance and good practice',
      content: 'Functions are powerful but be careful:\n- A function invoked per row that calls a web API or database runs once per row; 10,000 rows means 10,000 calls.\n- Functions that are invoked per row often break **query folding**, so filter and reduce rows before invoking.\n- Functions that reference a data source dynamically (for example `Web.Contents` with a URL built from a column) may not refresh in the Power BI Service unless written with a static base URL and the RelativePath option.\n- Document functions using a `meta` record with Documentation.Name and Documentation.Description so users see help text in the Enter Parameters panel.',
      points: [
        'Filter before invoking',
        'Type your parameters',
        'Keep one function per business rule',
      ],
    },
  ],
  examples: [
    {
      title: 'fnAddGST: a simple calculation function',
      scenario: 'Finance wants the price including GST for every product. The GST rate should be an input so it can change later.',
      table: {
        headers: ['Product', 'Price', 'PriceWithGST'],
        rows: [['Laptop', 55000, 64900], ['Mouse', 600, 708], ['Office Chair', 7500, 8850]],
      },
      steps: [
        'Home > Transform data',
        'Home > New Source > Blank Query; rename it to fnAddGST',
        'Home > Advanced Editor, paste the function code, click Done',
        'Select the Product query > Add Column > Invoke Custom Function',
        'New column name: PriceWithGST; Function query: fnAddGST; price = Column Name Price; gstRate = Decimal Number 0.18',
        'Click OK and set the new column type to Decimal Number',
      ],
      code: `// Query name: fnAddGST
(price as number, gstRate as number) as number =>
    price * (1 + gstRate)

// Step created in the Product query by Invoke Custom Function
= Table.AddColumn(#"Changed Type", "PriceWithGST", each fnAddGST([Price], 0.18), type number)`,
      result: 'PriceWithGST = 64900, 708 and 8850.',
      explanation: 'The function multiplies the price by 1 + rate. Invoke Custom Function writes a Table.AddColumn step that calls the function once per row using that row Price.',
    },
    {
      title: 'fnCleanText: one cleaning rule for many columns',
      scenario: 'Customer and City contain extra spaces, hidden line breaks and mixed case (" pune", "MUMBAI ", "nagpur#(lf)").',
      table: {
        headers: ['Customer (before)', 'City (before)', 'Customer (after)', 'City (after)'],
        rows: [
          ['  asha traders', ' pune', 'Asha Traders', 'Pune'],
          ['SAI ENTERPRISES ', 'MUMBAI ', 'Sai Enterprises', 'Mumbai'],
          ['kiran stores', 'nagpur', 'Kiran Stores', 'Nagpur'],
        ],
      },
      steps: [
        'Home > New Source > Blank Query; rename it fnCleanText',
        'Advanced Editor: paste the function, click Done',
        'Open the Customer query and click fx next to the formula bar to add a new step',
        'Type the Table.TransformColumns formula shown, press Enter',
      ],
      code: `// Query name: fnCleanText
(t as nullable text) as nullable text =>
    if t = null then null else Text.Proper(Text.Trim(Text.Clean(t)))

// New step in the Customer query
= Table.TransformColumns(#"Changed Type", {{"Customer", fnCleanText, type nullable text}, {"City", fnCleanText, type nullable text}})`,
      result: 'Both columns are trimmed, hidden characters removed and in Proper Case. Null cells stay null.',
      explanation: 'Text.Clean removes non-printable characters, Text.Trim removes leading/trailing spaces and Text.Proper capitalises each word. Because the function is passed as a value (no brackets), TransformColumns calls it for every cell of each listed column.',
    },
    {
      title: 'Optional parameter with a default value',
      scenario: 'Most products use 18% GST, but some need a different rate. Make the rate optional with 18% as default.',
      steps: [
        'Open fnAddGST in Advanced Editor',
        'Replace the code with the version below and click Done',
        'Test: select fnAddGST, enter amount 1000 and leave rate empty, click Invoke (result 1180)',
        'Test again with rate 0.05 (result 1050)',
      ],
      code: `(amount as number, optional rate as nullable number) as number =>
    let
        UsedRate = if rate = null then 0.18 else rate,
        Result = amount * (1 + UsedRate)
    in
        Result`,
      result: 'fnAddGST(1000) returns 1180 and fnAddGST(1000, 0.05) returns 1050.',
      explanation: 'An optional parameter receives null when it is skipped, so the let block replaces null with the default rate.',
    },
    {
      title: 'Load and combine monthly files with a function',
      scenario: 'The sales team drops one CSV per month (Sales_2024_01.csv, Sales_2024_02.csv, ...) into C:\\Data\\Monthly. All files have the same columns.',
      steps: [
        'Home > New Source > Blank Query, rename it fnLoadSalesFile, paste the function code',
        'Home > New Source > Blank Query, rename it AllSales, paste the folder query code',
        'Check the Data column in the AllSalesFiles step shows Table for each file',
        'Look at the last step: one combined table with all months',
        'Close & Apply',
      ],
      code: `// Query name: fnLoadSalesFile
(filePath as text) as table =>
    let
        Source = Csv.Document(File.Contents(filePath), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
        Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true])
    in
        Promoted

// Query name: AllSales
let
    Source = Folder.Files("C:\\Data\\Monthly"),
    CsvOnly = Table.SelectRows(Source, each Text.Lower([Extension]) = ".csv"),
    AllSalesFiles = Table.AddColumn(CsvOnly, "Data", each fnLoadSalesFile([Folder Path] & [Name])),
    Combined = Table.Combine(AllSalesFiles[Data]),
    Typed = Table.TransformColumnTypes(Combined, {{"OrderID", Int64.Type}, {"OrderDate", type date}, {"Quantity", Int64.Type}, {"SalesAmount", type number}})
in
    Typed`,
      result: 'One table containing rows from every CSV in the folder. Adding a new month file and clicking Refresh adds its rows automatically.',
      explanation: 'Folder.Files lists files with Folder Path and Name columns. The function is invoked per file and returns a table. AllSalesFiles[Data] is a list of tables, and Table.Combine appends them.',
    },
  ],
  interview: [
    { q: 'How do you create a custom function in Power Query?', a: 'Create a Blank Query, open the Advanced Editor and write (parameters) => body. The query name becomes the function name. Alternatively build a query using a parameter and right-click > Create Function.', level: 'Easy' },
    { q: 'What is the difference between fnCleanText and fnCleanText() when used in Table.TransformColumns?', a: 'fnCleanText (no brackets) passes the function itself as a value so TransformColumns can call it for each cell. fnCleanText() tries to call it immediately with no argument, which errors.', level: 'Medium' },
    { q: 'What are optional parameters and how do you give them defaults?', a: 'Declare with the optional keyword (must be last). When skipped they receive null, so inside the body use if param = null then default else param.', level: 'Medium' },
    { q: 'Combine Files created queries named Sample File, Transform Sample File and Transform File. What are they?', a: 'Sample File points to one example file, Transform Sample File holds the steps you edit, and Transform File is the function generated from it. The main query invokes Transform File for every file in the folder and appends the results.', level: 'Hard' },
    { q: 'Your function calls a REST API per customer and refresh is very slow. What would you check?', a: 'The function runs once per row, so reduce rows first, avoid duplicate calls (use distinct keys), cache results with Table.Buffer when appropriate, and check whether the API supports a batch call. Also confirm the Web.Contents call uses a static base URL with RelativePath/Query options so it can refresh in the Service.', level: 'Hard' },
    { q: 'Why should you add types to function parameters?', a: 'Types document what the function expects, catch wrong inputs with clear errors, and drive the Invoke Custom Function dialog (it shows the right input type for each parameter).', level: 'Easy' },
    { q: 'Can custom functions break query folding?', a: 'Yes. Custom per-row logic usually cannot be translated to the source language, so steps after it run in the Power Query engine. Filter and remove columns before invoking functions to keep earlier steps folded.', level: 'Medium' },
  ],
  practice: [
    { task: 'Write fnProfitMargin(sales, cost) that returns (sales - cost) / sales and returns null when sales is 0.', hint: 'Use if sales = 0 then null else ...', solution: '(sales as number, cost as number) as nullable number =>\n    if sales = 0 then null else (sales - cost) / sales' },
    { task: 'Use Invoke Custom Function to add a Margin column to Sales using fnProfitMargin with SalesAmount and Cost.', hint: 'Add Column > Invoke Custom Function and map both parameters to columns.', solution: '= Table.AddColumn(#"Changed Type", "Margin", each fnProfitMargin([SalesAmount], [Cost]), type nullable number)' },
    { task: 'Write fnFiscalYear(d) returning the Indian fiscal year label (April to March), e.g. 15-Mar-2024 gives "FY2023-24" and 10-Apr-2024 gives "FY2024-25".', hint: 'If month >= 4 the start year is the date year, else year - 1.', solution: '(d as date) as text =>\n    let\n        StartYear = if Date.Month(d) >= 4 then Date.Year(d) else Date.Year(d) - 1,\n        Label = "FY" & Text.From(StartYear) & "-" & Text.End(Text.From(StartYear + 1), 2)\n    in\n        Label' },
    { task: 'Apply fnCleanText to the Product and Category columns of the Product query in a single step.', hint: 'Table.TransformColumns accepts a list of {column, function, type} lists.', solution: '= Table.TransformColumns(Source, {{"Product", fnCleanText, type nullable text}, {"Category", fnCleanText, type nullable text}})' },
  ],
  quiz: [
    { question: 'Which symbol separates the parameters from the body of an M function?', options: ['->', '=>', '::', '=='], answer: 1, explanation: 'M functions are written as (params) => body.' },
    { question: 'What value does a skipped optional parameter receive?', options: ['0', 'An empty text ""', 'null', 'An error'], answer: 2, explanation: 'Skipped optional parameters are null, so you test for null to apply a default.' },
    { question: 'Which menu adds a column by calling a function for each row?', options: ['Add Column > Invoke Custom Function', 'Home > Merge Queries', 'Transform > Pivot Column', 'View > Query Dependencies'], answer: 0, explanation: 'Invoke Custom Function maps columns or values to parameters and writes a Table.AddColumn step.' },
    { question: 'Right-clicking a query that uses a parameter and choosing Create Function will:', options: ['Delete the parameter', 'Create a function linked to that query so edits to the query update the function', 'Convert the query to DAX', 'Disable load for all queries'], answer: 1, explanation: 'The sample query stays linked; editing it changes the function.' },
    { question: 'In the AllSales example, what does Table.Combine(AllSalesFiles[Data]) do?', options: ['Merges tables side by side on a key', 'Appends a list of tables into one table', 'Removes duplicate files', 'Pivots the Data column'], answer: 1, explanation: 'AllSalesFiles[Data] is a list of tables; Table.Combine appends them (like Append Queries).' },
  ],
};
