export default {
  id: 'extra-01-m-language-introduction',
  title: 'M Language Introduction',
  module: 'Extra: Power Query',
  extraNo: 1,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'M (Power Query Formula Language) is the language that Power Query writes behind every click you make in the Power Query Editor. Reading and editing M lets you fix broken steps, reuse logic and do transformations the ribbon buttons cannot.',
  objectives: [
    'Explain what M is and how it relates to the applied steps in Power Query',
    'Read the let ... in structure of a query in the Advanced Editor',
    'Recognise M values: text, number, date, list { }, record [ ] and table',
    'Use each and _ to write row-by-row logic in custom columns and transformations',
    'Edit a step safely in the formula bar and in the Advanced Editor',
  ],
  theory: [
    {
      heading: 'What is M and where do you see it?',
      content: 'Every time you click a button in the Power Query Editor (Remove Columns, Change Type, Filter Rows), Power Query writes one line of **M code**. M is a functional, case-sensitive language created only for getting and shaping data. Power BI Desktop, Excel Power Query, Dataflows and Fabric Dataflow Gen2 all use the same M language.\n\nThink of the Applied Steps pane as a recipe card and M as the actual written recipe. The pane shows the step names; M shows exactly what each step does.\n\nYou can see M in three places:\n- **Formula bar**: shows the code of the selected step (turn it on with View > Formula Bar).\n- **Advanced Editor**: Home > Advanced Editor shows the full query.\n- **Query Settings > Applied Steps**: right-click a step > View Native Query shows the SQL that M was translated to (only for sources that support query folding).',
      tip: 'M is case-sensitive. `Table.SelectRows` works, `table.selectrows` gives "The import table.selectrows matches no exports".',
    },
    {
      heading: 'The let ... in structure',
      content: 'Almost every query is one big `let` expression. Inside `let` you write named steps separated by commas. After `in` you name the step whose result the query returns (normally the last one).\n\n- Each step is `StepName = expression`.\n- A step can use any earlier step by its name. This is why steps form a chain.\n- Step names with spaces or special characters are written as `#"Step Name"`, for example `#"Changed Type"`.\n- The last step before `in` must NOT end with a comma. A missing or extra comma is the most common M syntax error.\n- Comments: `// single line` or `/* multi line */`.',
      syntax: 'let\n    Step1 = <expression>,\n    #"Step 2" = <expression using Step1>,\n    Step3 = <expression using #"Step 2">\nin\n    Step3',
    },
    {
      heading: 'M values: the building blocks',
      content: 'Everything in M is a value. The ones you meet daily are:\n\n- **Primitive values**: text `"Pune"`, number `55000`, logical `true`, `null`, date `#date(2024, 3, 15)`, datetime `#datetime(2024, 3, 15, 10, 30, 0)`.\n- **List** (ordered values in curly braces): `{"Pune", "Mumbai", "Nagpur"}` or `{1..12}`. Get an item by zero-based position: `Cities{0}` returns "Pune".\n- **Record** (named fields in square brackets): `[CustomerID = 1, City = "Pune"]`. Get a field with `MyRecord[City]`.\n- **Table**: rows and columns. A column of a table is a list: `Sales[Quantity]`. A row of a table is a record: `Sales{0}`.\n- **Function**: a value that takes inputs, for example `(x) => x * 2`.\n\nAnalogy: a list is a single column of an Excel sheet, a record is one row with headings, and a table is the whole sheet.',
      points: [
        '{ } = list, [ ] = record or field access, { } after a table = row by position',
        'Text is joined with &: "Sales " & "2024"',
        'null means no value; comparisons with null return null, not false',
      ],
    },
    {
      heading: 'Functions, each and _',
      content: 'M has more than 700 built-in functions grouped by prefix: `Text.`, `Number.`, `Date.`, `List.`, `Record.`, `Table.`. Type `= #shared` in a blank query to browse them all.\n\nMany table functions need a small function that runs once per row. Instead of writing `(row) => row[Quantity] > 0` you can write the shortcut `each [Quantity] > 0`.\n\n- `each` is short for `(_) =>`, a function with one parameter called `_`.\n- Inside `each`, `[Quantity]` is short for `_[Quantity]`, the Quantity field of the current row.\n- In `Table.TransformColumns`, `_` is the current cell value, so `each Text.Upper(_)` uppercases every cell.',
      syntax: 'Table.SelectRows(PreviousStep, each [Quantity] > 0)\nTable.AddColumn(PreviousStep, "NewCol", each [Quantity] * [UnitPrice], type number)\nTable.TransformColumns(PreviousStep, {{"Product", each Text.Upper(_), type text}})',
    },
    {
      heading: 'Conditions and error-safe editing',
      content: 'M uses `if ... then ... else` (there is no `elseif`; you nest another `if` after `else`). Logical operators are written in lowercase words: `and`, `or`, `not`. Equality is a single `=`, not equal is `<>`.\n\nGood habits when editing M by hand:\n1. Make a copy first (right-click query > Duplicate).\n2. Edit one step at a time in the formula bar and check the preview.\n3. If you rename a step, update every later step that uses it (Power Query does this automatically only when you rename via the Applied Steps pane).\n4. Use the Advanced Editor syntax message ("No syntax errors have been detected") before clicking Done.',
      tip: 'Renaming steps in Applied Steps (right-click > Rename) to clear names like FilteredPositiveQty makes your M self-documenting.',
    },
  ],
  examples: [
    {
      title: 'Read the M behind a CSV import',
      scenario: 'You imported Sales.csv, promoted headers, changed types and filtered out zero-quantity rows. Open the Advanced Editor and understand every line.',
      steps: [
        'Home > Get data > Text/CSV, pick Sales.csv, click Transform Data',
        'Home > Use First Row as Headers (if not already done)',
        'Select the Quantity column filter arrow > Number Filters > Greater Than > 0 > OK',
        'Home > Advanced Editor',
        'Read each step: Source, Promoted Headers, Changed Type, Filtered Rows',
        'Click Done (or Cancel if you made no change)',
      ],
      code: `let
    Source = Csv.Document(File.Contents("C:\\Data\\Sales.csv"), [Delimiter = ",", Columns = 10, Encoding = 65001, QuoteStyle = QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers", {{"OrderID", Int64.Type}, {"OrderDate", type date}, {"CustomerID", Int64.Type}, {"ProductID", Int64.Type}, {"Quantity", Int64.Type}, {"UnitPrice", type number}, {"SalesAmount", type number}, {"Cost", type number}}),
    #"Filtered Rows" = Table.SelectRows(#"Changed Type", each [Quantity] > 0)
in
    #"Filtered Rows"`,
      result: 'The query returns the Sales table with correct data types and no rows where Quantity is 0 or negative.',
      explanation: 'Each step takes the previous step name as its first argument. Source reads the file, Promoted Headers uses row 1 as column names, Changed Type sets types, and Filtered Rows keeps rows using an each condition. The query outputs #"Filtered Rows" because it is named after in.',
    },
    {
      title: 'Build a small table directly in M with #table',
      scenario: 'You need a quick Product lookup for testing, and you want a column that adds 18% GST to the price.',
      table: {
        headers: ['ProductID', 'Product', 'Category', 'Price', 'PriceWithGST'],
        rows: [
          [101, 'Laptop', 'Electronics', 55000, 64900],
          [102, 'Mouse', 'Accessories', 600, 708],
          [103, 'Office Chair', 'Furniture', 7500, 8850],
        ],
      },
      steps: [
        'Home > Transform data to open Power Query Editor',
        'Home > New Source > Blank Query',
        'Home > Advanced Editor, delete the existing text and paste the code',
        'Click Done and rename the query to ProductTest (right-click > Rename)',
      ],
      code: `let
    Source = #table(
        type table [ProductID = Int64.Type, Product = text, Category = text, Price = number],
        {
            {101, "Laptop", "Electronics", 55000},
            {102, "Mouse", "Accessories", 600},
            {103, "Office Chair", "Furniture", 7500}
        }
    ),
    AddGST = Table.AddColumn(Source, "PriceWithGST", each [Price] * 1.18, type number)
in
    AddGST`,
      result: 'A 3-row table with PriceWithGST = 64900, 708 and 8850.',
      explanation: '#table takes a table type (column names and types) and a list of rows, where each row is a list. Table.AddColumn runs the each expression once per row and the fourth argument sets the new column type.',
    },
    {
      title: 'Lists and records in one query',
      scenario: 'Understand how to read an item from a list and a field from a record.',
      table: {
        headers: ['Field', 'Value'],
        rows: [['Count', 4], ['First', 'Pune'], ['CustomerCity', 'Mumbai']],
      },
      steps: [
        'Home > New Source > Blank Query',
        'Home > Advanced Editor and paste the code',
        'Click Done; the preview shows a record with three fields',
        'Click on a step name (Cities, Customer) in Applied Steps to see each intermediate value',
      ],
      code: `let
    Cities = {"Pune", "Mumbai", "Nagpur", "Nashik"},
    CityCount = List.Count(Cities),
    FirstCity = Cities{0},
    Customer = [CustomerID = 2, Customer = "Sai Enterprises", City = "Mumbai"],
    CustomerCity = Customer[City],
    Result = [Count = CityCount, First = FirstCity, CustomerCity = CustomerCity]
in
    Result`,
      result: 'A record: Count = 4, First = Pune, CustomerCity = Mumbai.',
      explanation: 'Curly braces build a list and {0} picks the first item (positions start at 0). Square brackets build a record and Customer[City] reads one field. A query can return any value, not only a table.',
    },
    {
      title: 'Conditional column written in M',
      scenario: 'Add a SalesBand column: High when SalesAmount is 50000 or more, Medium when 10000 or more, else Low.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'SalesBand'],
        rows: [[1001, 55000, 'High'], [1002, 1200, 'Low'], [1003, 15000, 'Medium']],
      },
      steps: [
        'Open the Sales query in Power Query Editor',
        'Add Column > Custom Column',
        'New column name: SalesBand',
        'Formula: if [SalesAmount] >= 50000 then "High" else if [SalesAmount] >= 10000 then "Medium" else "Low"',
        'Click OK, then in the formula bar add type text as the last argument (shown in the code)',
      ],
      code: `= Table.AddColumn(#"Filtered Rows", "SalesBand", each if [SalesAmount] >= 50000 then "High" else if [SalesAmount] >= 10000 then "Medium" else "Low", type text)`,
      result: 'Orders 1001, 1002 and 1003 get High, Low and Medium.',
      explanation: 'The Custom Column dialog writes Table.AddColumn with an each function. Nested if ... else if gives multiple bands. Adding type text avoids the "ABC123" (any) type, so you do not need an extra Changed Type step.',
    },
  ],
  interview: [
    { q: 'What is M in Power BI?', a: 'M (Power Query Formula Language) is the functional, case-sensitive language Power Query uses to connect to and transform data. Every applied step is one M expression; the whole query is usually a let ... in expression.', level: 'Easy' },
    { q: 'What is the difference between M and DAX?', a: 'M runs in Power Query at refresh time to extract and shape data before it loads into the model. DAX runs in the model to create measures, calculated columns and tables and is evaluated in filter context at query time. Clean and shape with M; analyse and aggregate with DAX.', level: 'Easy' },
    { q: 'What does each mean in M?', a: 'each is shorthand for a one-parameter function (_) => .... Inside it, [Column] means _[Column], the column value of the current row. Example: Table.SelectRows(Source, each [Quantity] > 0).', level: 'Medium' },
    { q: 'What are list, record and table in M?', a: 'A list is an ordered set of values in { }, a record is a set of named fields in [ ], and a table is rows and columns. A table column is a list (Sales[Quantity]) and a table row is a record (Sales{0}).', level: 'Medium' },
    { q: 'Why do some step names appear as #"Changed Type"?', a: 'Identifiers containing spaces or special characters must be quoted with #"...". Simple names like Source or AddGST need no quoting.', level: 'Easy' },
    { q: 'You renamed a column in the source file and the refresh fails with "The column \'Qty\' of the table wasn\'t found". How do you fix it using M?', a: 'Open the Advanced Editor or click the failing step, find where the old name is hard-coded (often Changed Type or Renamed Columns) and update it to the new name. To make it robust, rename early in one step and use options like MissingField.Ignore in Table.RemoveColumns or Table.SelectColumns where suitable.', level: 'Hard' },
    { q: 'How do you return a value that is not a table from a query?', a: 'Put any expression after in, for example a number, list or record. Such queries are useful as parameters or helper values; they cannot be loaded as a table unless converted (for example with Table.FromList or Record.ToTable).', level: 'Medium' },
    { q: 'Is M case-sensitive?', a: 'Yes. Function names, step names, column names and text comparisons are case-sensitive. "pune" = "Pune" is false unless you use Comparer.OrdinalIgnoreCase or Text.Lower/Text.Upper.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a blank query that returns the list of months 1 to 12 and convert it to a table with a column named MonthNo.', hint: 'Use {1..12} and Table.FromList, or the List Tools > To Table button.', solution: 'let\n    Months = {1..12},\n    ToTable = Table.FromList(Months, Splitter.SplitByNothing(), {"MonthNo"}),\n    Typed = Table.TransformColumnTypes(ToTable, {{"MonthNo", Int64.Type}})\nin\n    Typed' },
    { task: 'In the Sales query, add a column Profit = SalesAmount - Cost with number type, writing the step directly in the formula bar.', hint: 'Click fx next to the formula bar to add a new step that references the previous step.', solution: '= Table.AddColumn(#"Changed Type", "Profit", each [SalesAmount] - [Cost], type number)' },
    { task: 'Uppercase every value in the Product column using Table.TransformColumns.', hint: 'Inside each, _ is the cell value.', solution: '= Table.TransformColumns(Source, {{"Product", each Text.Upper(_), type text}})' },
    { task: 'Open the Advanced Editor of any query, rename the last step to FinalTable and make sure the query still works.', hint: 'Change both the step definition and the name after in.', solution: 'Change the last line inside let to FinalTable = ... (no trailing comma) and change the text after in to FinalTable. Click Done; Applied Steps now shows FinalTable. Try this in the Power Query Lab too and compare the generated M.' },
  ],
  quiz: [
    { question: 'Which keyword ends the list of steps and names the output of a query?', options: ['return', 'in', 'end', 'output'], answer: 1, explanation: 'A query is let <steps> in <result>; the expression after in is returned.' },
    { question: 'What does {"Pune", "Mumbai"}{1} return?', options: ['Pune', 'Mumbai', 'An error', '2'], answer: 1, explanation: 'Lists are zero-based, so position 1 is the second item, Mumbai.' },
    { question: 'each [Quantity] > 0 is shorthand for:', options: ['(_) => _[Quantity] > 0', 'Table.Quantity > 0', 'for each row Quantity > 0 loop', 'Quantity.GreaterThan(0)'], answer: 0, explanation: 'each defines a function with one parameter named _, and [Quantity] means _[Quantity].' },
    { question: 'Which brackets create a record in M?', options: ['( )', '{ }', '[ ]', '< >'], answer: 2, explanation: 'Square brackets create records, e.g. [City = "Pune"]. Curly braces create lists.' },
    { question: 'Where do you see the complete M code of a query?', options: ['Modeling > New measure', 'Home > Advanced Editor in Power Query Editor', 'View > Performance Analyzer', 'File > Options > DAX'], answer: 1, explanation: 'The Advanced Editor shows the whole let ... in expression of the selected query.' },
  ],
};
