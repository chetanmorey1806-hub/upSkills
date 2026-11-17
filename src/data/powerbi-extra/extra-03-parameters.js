export default {
  id: 'extra-03-parameters',
  title: 'Power Query Parameters',
  module: 'Extra: Power Query',
  extraNo: 3,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Parameters are named values (a folder path, server name, year, threshold) that your queries read instead of hard-coded text. Change the parameter once and every query that uses it follows, both in Power BI Desktop and in the Power BI Service.',
  objectives: [
    'Create, edit and type parameters with Home > Manage Parameters',
    'Use parameters in the Source step (file path, server, database)',
    'Filter data with a parameter and use a list query as suggested values',
    'Change parameter values in Desktop and in the semantic model settings in the Service',
    'Understand special parameters: RangeStart/RangeEnd and dynamic M query parameters',
  ],
  theory: [
    {
      heading: 'What is a parameter?',
      content: 'A parameter is a small query that holds one value. Think of it like the "settings" page of your report: instead of searching your code for every place you typed "C:\\Users\\Ravi\\Sales.csv", you store it once in a parameter called DataFolder.\n\nTypical uses:\n- File or folder paths (developer laptop vs shared drive)\n- Server and database names (Dev, Test, Prod)\n- Filter values (Year = 2024, MinimumQuantity = 1)\n- Incremental refresh boundaries (RangeStart, RangeEnd)\n- Inputs for a function created from a query',
    },
    {
      heading: 'Creating a parameter',
      content: 'In Power Query Editor go to **Home > Manage Parameters > New Parameter**. Fill in:\n\n- **Name**: e.g. DataFolder (no spaces makes M easier).\n- **Description**: shown as a tooltip.\n- **Required**: tick if a value must always be supplied.\n- **Type**: Text, Decimal Number, Date, Date/Time, True/False and so on. Pick the right type or comparisons will fail.\n- **Suggested Values**: Any value, List of values (typed list) or Query (a list query).\n- **Current Value**: the value used now.\n\nIn the Queries pane the parameter shows a special icon and its value. In M a parameter is stored as a value with a meta record.',
      syntax: '"C:\\Data\\" meta [IsParameterQuery = true, Type = "Text", IsParameterQueryRequired = true]',
    },
    {
      heading: 'Using parameters in queries',
      content: 'Many dialogs (From Text/CSV, SQL Server, Filter Rows, Replace Values) show a small **ABC/123 dropdown** next to the input where you can choose Parameter instead of a fixed value. You can also type the parameter name directly in M:\n\n- `File.Contents(DataFolder & "Sales.csv")` joins a text parameter with a file name.\n- `Sql.Database(ServerName, DatabaseName)` switches environments.\n- `Table.SelectRows(Sales, each [Year] = SelectedYear)` filters rows.\n\nWhen you change the current value (click the parameter in the Queries pane or Home > Edit Parameters in the Report view ribbon: Home > Transform data dropdown > Edit parameters), Power BI asks you to apply changes and refreshes.',
      tip: 'A parameter of type Text cannot be compared with a number column. If Year is a whole number column, the parameter must be Decimal Number (or convert with Number.From).',
    },
    {
      heading: 'Parameters in the Power BI Service',
      content: 'After publishing, open the workspace, select the semantic model > **Settings > Parameters**. You can change values there (for example switch from the Test database to Prod) without opening Desktop. Then refresh the semantic model.\n\nDeployment pipelines can set **parameter rules** so the same report automatically points to Dev, Test and Prod sources in each stage.',
      points: [
        'Parameters with type Any or used in ways the Service cannot read may not appear in settings',
        'Changing a parameter in the Service needs a refresh to take effect',
        'Use parameters for server/database names to make deployment simple',
      ],
    },
    {
      heading: 'Special parameters',
      content: '- **RangeStart and RangeEnd** (type Date/Time, exact names, case-sensitive) are required for incremental refresh. Power BI replaces their values per partition.\n- **Dynamic M query parameters** (DirectQuery sources) bind a parameter to a column in the model so a slicer selection is passed into the M query at query time.\n- **Parameter from a list query**: a query that returns a list (e.g. distinct years) can feed the Suggested Values dropdown so users pick valid values.\n\nNote: Power Query parameters are different from **What-if parameters** and **Field parameters** in the report (Modeling tab), which are DAX tables used by slicers.',
    },
  ],
  examples: [
    {
      title: 'Folder path parameter for a CSV source',
      scenario: 'You built the report on your laptop using C:\\Data\\. Your manager keeps the files in \\\\fileserver\\sales\\. Make the path a parameter so only one value changes.',
      steps: [
        'Home > Transform data',
        'Home > Manage Parameters > New Parameter',
        'Name: DataFolder, Type: Text, Suggested Values: Any value, Current Value: C:\\Data\\ (with the trailing backslash), click OK',
        'Select the Sales query > Source step; in the formula bar replace the path text with DataFolder & "Sales.csv"',
        'Press Enter and check the preview loads',
        'Change DataFolder current value to the server path and click Refresh Preview to test',
      ],
      code: `// Parameter query: DataFolder
"C:\\Data\\" meta [IsParameterQuery = true, Type = "Text", IsParameterQueryRequired = true]

// Sales query, Source step
Source = Csv.Document(File.Contents(DataFolder & "Sales.csv"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.None])`,
      result: 'The Sales query reads C:\\Data\\Sales.csv. After changing DataFolder it reads the file from the new folder with no other edits.',
      explanation: 'DataFolder & "Sales.csv" builds the full path at refresh time. Every query that uses DataFolder (Product.csv, Customer.csv) moves together.',
    },
    {
      title: 'Filter Sales by a SelectedYear parameter',
      scenario: 'A department wants a lightweight file with only one year of sales. Load only rows where Year equals a parameter.',
      table: {
        headers: ['SelectedYear', 'Rows loaded'],
        rows: [[2023, 'Only orders with Year = 2023'], [2024, 'Only orders with Year = 2024']],
      },
      steps: [
        'Home > Manage Parameters > New Parameter',
        'Name: SelectedYear, Type: Decimal Number, Suggested Values: List of values, enter 2023 and 2024, Current Value: 2024',
        'Open the Sales query, click the Year column filter arrow > Number Filters > Equals',
        'In the dialog change the value box dropdown from 123 to Parameter and choose SelectedYear, click OK',
        'Close & Apply. Later use Home > Transform data dropdown > Edit parameters to switch the year',
      ],
      code: `// Parameter query: SelectedYear
2024 meta [IsParameterQuery = true, Type = "Number", IsParameterQueryRequired = true, List = {2023, 2024}, DefaultValue = 2024]

// Step in Sales
#"Filtered Year" = Table.SelectRows(#"Changed Type", each [Year] = SelectedYear)`,
      result: 'With SelectedYear = 2024, the Sales table in the model contains only 2024 orders.',
      explanation: 'The filter compares each row Year with the parameter value. Because both are numbers the comparison works. In a SQL source, this filter folds into a WHERE clause.',
    },
    {
      title: 'Switch between Dev and Prod databases',
      scenario: 'Your company has a Dev SQL server (SQLDEV01) and a Prod server (SQLPROD01), both with database SalesDB.',
      steps: [
        'Create parameter ServerName, Type Text, Suggested Values: List of values SQLDEV01 and SQLPROD01, Current Value SQLDEV01',
        'Create parameter DatabaseName, Type Text, Current Value SalesDB',
        'Home > Get data > SQL Server; in the Server box choose Parameter > ServerName, in Database choose Parameter > DatabaseName',
        'Select dbo.Sales and click Transform Data',
        'Publish; in the Service go to semantic model Settings > Parameters, set ServerName = SQLPROD01, Apply, then Refresh now',
      ],
      code: `let
    Source = Sql.Database(ServerName, DatabaseName),
    dbo_Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data]
in
    dbo_Sales`,
      result: 'Desktop development uses Dev data; the published semantic model uses Prod data after the parameter change and refresh.',
      explanation: 'Sql.Database takes the server and database names from parameters, so moving between environments is a value change, not a code change. Make sure a gateway or cloud connection and credentials exist for each server.',
    },
    {
      title: 'Suggested values from a list query',
      scenario: 'Instead of typing the city list by hand, let the parameter dropdown show the cities that exist in the Customer table.',
      steps: [
        'Right-click the Customer query > Reference; rename the new query CityList',
        'Select the City column, right-click > Drill Down (creates a list), then List Tools > Transform > Remove Duplicates',
        'Right-click CityList > uncheck Enable load',
        'Home > Manage Parameters > New Parameter: Name SelectedCity, Type Text, Suggested Values: Query, Query: CityList, Current Value: Pune',
        'Use SelectedCity in a filter: Customer City equals Parameter SelectedCity',
      ],
      code: `// Query: CityList
let
    Source = Customer,
    City = Source[City],
    DistinctCities = List.Distinct(City)
in
    DistinctCities

// Filter step using the parameter
#"Filtered City" = Table.SelectRows(Customer, each [City] = SelectedCity)`,
      result: 'The parameter dropdown lists Pune, Mumbai, Nagpur and Nashik.',
      explanation: 'A list query can supply suggested values. Drill Down on a column returns a list and List.Distinct removes repeats. Disabling load keeps the helper list out of the model.',
    },
  ],
  interview: [
    { q: 'What is a Power Query parameter and why use it?', a: 'A named query that holds a single value (path, server, filter value) which other queries reference. It removes hard-coding so changing environments or filters is a single edit, and it can be changed in the Service under semantic model settings.', level: 'Easy' },
    { q: 'How is a Power Query parameter different from a What-if parameter?', a: 'A Power Query parameter is used at refresh time inside M to shape what data loads. A What-if parameter is a DAX table plus measure used by a slicer at report time; it does not change what is loaded.', level: 'Medium' },
    { q: 'Your report must point to Dev, Test and Prod databases. How would you design it?', a: 'Create ServerName and DatabaseName parameters and use them in Sql.Database. In a deployment pipeline set parameter rules for each stage, or change values in semantic model Settings > Parameters, and make sure gateway/cloud connections exist for each server.', level: 'Hard' },
    { q: 'What are RangeStart and RangeEnd?', a: 'Two Date/Time parameters with these exact names used to filter a table for incremental refresh. Power BI substitutes partition boundaries at refresh time. The filter should be >= RangeStart and < RangeEnd so no row is counted twice.', level: 'Medium' },
    { q: 'Why does a parameter filter return no rows even though the value looks right?', a: 'Usually a type mismatch: the parameter is Text "2024" but the column is a number, or a Date parameter compared with a Date/Time column. Set the matching type or convert in the filter.', level: 'Medium' },
    { q: 'What are dynamic M query parameters?', a: 'For DirectQuery sources, an M parameter can be bound to a model column (Model view > column properties > Advanced > Bind to parameter) so a slicer selection is injected into the M query at query time, pushing filtering to the source.', level: 'Hard' },
    { q: 'Where do you change parameters without opening Power Query Editor?', a: 'In Desktop Report view: Home > Transform data dropdown > Edit parameters. In the Service: semantic model Settings > Parameters.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a MinQuantity parameter (Decimal Number, value 1) and use it to keep only Sales rows where Quantity >= MinQuantity.', hint: 'Number Filters > Greater Than Or Equal To, then switch the value to Parameter.', solution: '= Table.SelectRows(#"Changed Type", each [Quantity] >= MinQuantity)' },
    { task: 'Parameterise the Product.csv and Customer.csv sources with the same DataFolder parameter.', hint: 'Edit the Source step of each query.', solution: 'Product: Source = Csv.Document(File.Contents(DataFolder & "Product.csv"), [Delimiter = ",", Encoding = 65001]); Customer: Source = Csv.Document(File.Contents(DataFolder & "Customer.csv"), [Delimiter = ",", Encoding = 65001]).' },
    { task: 'Create a Date parameter StartDate = 2024-01-01 and load only orders on or after it.', hint: 'Type Date; compare with the OrderDate column of type date.', solution: 'Parameter: #date(2024, 1, 1) meta [IsParameterQuery = true, Type = "Date", IsParameterQueryRequired = true]. Filter step: = Table.SelectRows(#"Changed Type", each [OrderDate] >= StartDate)' },
    { task: 'Publish a report that uses DataFolder and find where the value can be changed in the Service.', hint: 'Look at the semantic model, not the report.', solution: 'Workspace > semantic model > ... > Settings > Parameters section. Note: a local C:\\ path needs an on-premises data gateway to refresh in the Service.' },
  ],
  quiz: [
    { question: 'Where do you create a new parameter in Power Query Editor?', options: ['Modeling > New parameter', 'Home > Manage Parameters > New Parameter', 'View > Parameters', 'Add Column > Parameter'], answer: 1, explanation: 'Home > Manage Parameters > New Parameter opens the parameter dialog. Modeling > New parameter is for What-if/Field parameters.' },
    { question: 'Which expression correctly builds a file path from a Text parameter DataFolder?', options: ['DataFolder + "Sales.csv"', 'DataFolder & "Sales.csv"', 'CONCAT(DataFolder, "Sales.csv")', 'DataFolder."Sales.csv"'], answer: 1, explanation: 'In M, text is concatenated with &.' },
    { question: 'Incremental refresh requires parameters named:', options: ['StartDate and EndDate', 'RangeStart and RangeEnd', 'FromDate and ToDate', 'MinDate and MaxDate'], answer: 1, explanation: 'The names RangeStart and RangeEnd (Date/Time type) are reserved for incremental refresh.' },
    { question: 'Where can you change a parameter value after publishing?', options: ['Report > Format pane', 'Semantic model Settings > Parameters in the Service', 'Power BI Mobile', 'Dashboard tile settings'], answer: 1, explanation: 'Parameters appear in the semantic model settings; refresh afterwards.' },
    { question: 'A parameter SelectedYear of type Text with value "2024" filters a whole-number Year column and returns no rows. Why?', options: ['Parameters cannot filter', 'Type mismatch: text "2024" is not equal to number 2024', 'The year must be in quotes in the column', 'Filters only work on dates'], answer: 1, explanation: 'M does not auto-convert; make the parameter a number or convert with Number.From.' },
  ],
};
