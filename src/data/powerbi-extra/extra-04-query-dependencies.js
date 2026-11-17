export default {
  id: 'extra-04-query-dependencies',
  title: 'Query Dependencies',
  module: 'Extra: Power Query',
  extraNo: 4,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Queries often use other queries: a reference, a merge, an append, a parameter or a function. The Query Dependencies view draws this as a diagram so you can see where data comes from, what breaks if a source changes, and how to organise staging and final queries.',
  objectives: [
    'Open and read the Query Dependencies diagram',
    'Explain the difference between Reference and Duplicate',
    'Design staging (load disabled) and final queries',
    'Find the impact of changing or deleting a query or source',
    'Recognise and fix cyclic references',
  ],
  theory: [
    {
      heading: 'What is a query dependency?',
      content: 'Query B depends on Query A when B uses A in its M code. Examples:\n- `Source = Sales_Raw` (a reference)\n- `Table.NestedJoin(Sales, {"ProductID"}, Product, {"ProductID"}, ...)` (a merge depends on both tables)\n- `Table.Combine({Sales2023, Sales2024})` (an append)\n- `File.Contents(DataFolder & "Sales.csv")` (depends on a parameter)\n- `fnCleanText([City])` (depends on a function)\n\nThink of a family tree or a water pipeline: data flows from the source (top) through staging queries to the final tables that load into the model.',
    },
    {
      heading: 'The Query Dependencies view',
      content: 'Open it in Power Query Editor with **View > Query Dependencies**. The diagram shows:\n\n- **Data sources** (files, folders, databases, web) at the start of the flow.\n- **Queries** as boxes, with arrows pointing from a query to the queries that use it.\n- **Parameters and functions** as separate boxes.\n- Queries with load disabled are shown in italic text, so you can quickly spot which queries reach the model.\n\nClick a query box to highlight everything it depends on and everything that depends on it. Use the zoom slider and Layout options (top to bottom, left to right) for big models.',
      tip: 'Before you delete or rename a query, check the Query Dependencies view. Power Query will warn you, but the diagram shows the full chain at once.',
    },
    {
      heading: 'Reference vs Duplicate',
      content: 'Right-click a query and you get two options that look similar but behave differently:\n\n- **Duplicate** copies all the steps into a new independent query. Changing the original later does NOT change the copy. Both read the source separately.\n- **Reference** creates a new query whose only step is `Source = OriginalQuery`. It depends on the original, so fixing a step in the original fixes every reference.\n\nUse Reference for "one source, many outputs" (for example a cleaned Sales_Staging feeding Sales and a CustomerList). Use Duplicate when you want an experiment you can change freely.',
      points: [
        'Reference = linked child; Duplicate = independent copy',
        'References show as arrows in Query Dependencies; duplicates do not',
        'Reference does not automatically mean the source is read only once; each loaded query may evaluate its chain separately during refresh',
      ],
    },
    {
      heading: 'Staging and final queries',
      content: 'A common professional pattern is layers:\n\n1. **Source/staging queries** connect and do basic cleaning. Right-click > uncheck **Enable load** so they do not become model tables.\n2. **Final queries** reference staging queries, merge lookups and shape the star schema tables (Sales, Product, Customer, Date).\n3. Use **Groups** (right-click in Queries pane > New Group) such as Parameters, Functions, Staging, Model to keep the pane tidy.\n\n**Enable load** controls whether the query result becomes a model table. **Include in report refresh** controls whether it refreshes when you click Refresh. A staging query used by a loaded query still runs during refresh even if its own load is disabled.',
    },
    {
      heading: 'Cyclic references and broken chains',
      content: 'If Query A references Query B and Query B (directly or indirectly) references Query A, Power Query shows **Expression.Error: A cyclic reference was encountered during evaluation**. Fix it by moving the shared logic into a third staging query that both use, so arrows only flow one way.\n\nIf an upstream query errors (for example a renamed file), every downstream query also shows the error. Use the dependency diagram to walk upstream to the first failing query and fix it there.',
    },
  ],
  examples: [
    {
      title: 'Build a staging pattern with Reference',
      scenario: 'The raw sales export needs cleaning, and you want both the Sales fact table and a list of unique CustomerIDs from it.',
      table: {
        headers: ['Query', 'Load enabled', 'Depends on'],
        rows: [
          ['Sales_Raw', 'No', 'Sales.csv file, DataFolder parameter'],
          ['Sales', 'Yes', 'Sales_Raw'],
          ['ActiveCustomers', 'Yes', 'Sales_Raw'],
        ],
      },
      steps: [
        'Rename your cleaned sales query to Sales_Raw (right-click > Rename)',
        'Right-click Sales_Raw > Reference; rename the new query Sales',
        'Right-click Sales_Raw > Reference again; rename it ActiveCustomers; keep only CustomerID and Home > Remove Rows > Remove Duplicates',
        'Right-click Sales_Raw > uncheck Enable load',
        'View > Query Dependencies to see the diagram',
      ],
      code: `// Query: Sales
let
    Source = Sales_Raw
in
    Source

// Query: ActiveCustomers
let
    Source = Sales_Raw,
    KeepCustomer = Table.SelectColumns(Source, {"CustomerID"}),
    Unique = Table.Distinct(KeepCustomer)
in
    Unique`,
      result: 'The diagram shows Sales.csv > Sales_Raw (italic, not loaded) with arrows to Sales and ActiveCustomers.',
      explanation: 'Both outputs start from Sales_Raw, so a cleaning fix in Sales_Raw flows to both automatically. Disabling load keeps the raw table out of the model.',
    },
    {
      title: 'A merge creates a dependency',
      scenario: 'Bring Category from Product into Sales using Merge Queries.',
      steps: [
        'Select the Sales query > Home > Merge Queries',
        'Top table Sales, select ProductID; bottom table Product, select ProductID; Join Kind: Left Outer; OK',
        'Click the expand icon on the new Product column, tick only Category, untick Use original column name as prefix, OK',
        'View > Query Dependencies: Sales now has arrows from both Sales_Raw and Product',
      ],
      code: `let
    Source = Sales_Raw,
    #"Merged Queries" = Table.NestedJoin(Source, {"ProductID"}, Product, {"ProductID"}, "Product", JoinKind.LeftOuter),
    #"Expanded Product" = Table.ExpandTableColumn(#"Merged Queries", "Product", {"Category"}, {"Category"})
in
    #"Expanded Product"`,
      result: 'Sales gets a Category column; the diagram shows Product > Sales.',
      explanation: 'Table.NestedJoin names the Product query, so Sales now depends on it. Renaming or deleting Product would break Sales.',
    },
    {
      title: 'Impact analysis before changing a source',
      scenario: 'IT will move Sales.csv to a new folder next week. Find which queries are affected.',
      steps: [
        'View > Query Dependencies',
        'Click the Sales.csv data source box at the top; the downstream chain is highlighted',
        'Note every highlighted query (Sales_Raw, Sales, ActiveCustomers)',
        'Close the view; update only the DataFolder parameter (or the Source step of Sales_Raw)',
        'Home > Refresh Preview > Refresh All and confirm no query shows an error',
      ],
      result: 'Only one change (the parameter or Sales_Raw Source) is needed; all three downstream queries pick up the new path.',
      explanation: 'Because downstream queries reference Sales_Raw instead of connecting to the file themselves, the dependency chain gives one point of change.',
    },
    {
      title: 'Fix a cyclic reference',
      scenario: 'Sales references Product to merge Category, and someone edited Product to merge total sales from Sales. Refresh fails with "A cyclic reference was encountered during evaluation".',
      steps: [
        'View > Query Dependencies and click Product: arrows go both ways between Product and Sales',
        'Remove the merge step from Product (Applied Steps > click X on the step)',
        'Calculate total sales per product in the model with DAX instead (Modeling > New measure)',
        'Refresh All to confirm the error is gone',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])`,
      result: 'The cycle is removed. In a table visual with Product[Product] and [Total Sales], each product shows its total sales.',
      explanation: 'Queries must form a one-way flow. Aggregations that need the fact table belong in DAX measures, where the relationship Product[ProductID] to Sales[ProductID] handles filtering.',
    },
  ],
  interview: [
    { q: 'How do you view query dependencies in Power BI?', a: 'In Power Query Editor go to View > Query Dependencies. It shows sources, queries, parameters and functions with arrows showing which query uses which.', level: 'Easy' },
    { q: 'What is the difference between Reference and Duplicate?', a: 'Reference creates a new query whose source is the original query, so changes upstream flow down. Duplicate copies all steps into an independent query that does not change when the original changes.', level: 'Easy' },
    { q: 'Why disable load on staging queries?', a: 'They are intermediate steps used by other queries. Loading them would add unnecessary tables, increase model size and confuse report authors. With load disabled they still run when a dependent query refreshes.', level: 'Medium' },
    { q: 'Does referencing a query mean the source is read only once during refresh?', a: 'Not necessarily. Each loaded query evaluates its chain, so the source may be read multiple times (some caching may apply). For heavy sources consider Dataflows or doing the work in the source database.', level: 'Hard' },
    { q: 'What causes "A cyclic reference was encountered during evaluation"?', a: 'Two or more queries depend on each other in a loop (A uses B and B uses A). Break the loop by moving shared logic to a separate upstream query or by doing the aggregation in DAX.', level: 'Medium' },
    { q: 'A manager asks: if we delete the Product query, what breaks? How do you answer quickly?', a: 'Open View > Query Dependencies, click Product and list all highlighted downstream queries (e.g. Sales via merge). Also check the model: relationships, measures and visuals that use the Product table.', level: 'Medium' },
    { q: 'What is the difference between Enable load and Include in report refresh?', a: 'Enable load decides if the query becomes a model table. Include in report refresh decides if a loaded query refreshes when the model refreshes; turning it off keeps static data (like a fixed mapping table) unchanged.', level: 'Hard' },
  ],
  practice: [
    { task: 'Create Sales_Staging from your Sales query and make Sales reference it. Disable load on Sales_Staging.', hint: 'Rename the original, then Reference.', solution: 'Rename Sales to Sales_Staging, right-click > Reference, rename the new query Sales, right-click Sales_Staging > uncheck Enable load. Sales M: let Source = Sales_Staging in Source.' },
    { task: 'Organise the Queries pane into groups: Parameters, Staging, Model.', hint: 'Right-click empty space in Queries pane > New Group.', solution: 'Create the three groups, then right-click each query > Move To Group > choose the group.' },
    { task: 'Open Query Dependencies and change the layout to Left to Right.', hint: 'Look at the bottom of the dependencies window.', solution: 'Use the Layout dropdown at the bottom of the Query Dependencies dialog and pick Left to right; use the zoom slider to fit.' },
    { task: 'Create a Duplicate of Product, change something in the original and confirm the duplicate is unaffected.', hint: 'Compare with a Reference.', solution: 'Duplicate keeps its own copy of steps, so a new filter added to Product does not appear in Product (2). A Reference would show the filter because its Source is Product.' },
  ],
  quiz: [
    { question: 'Which menu opens the dependency diagram?', options: ['Home > Manage Parameters', 'View > Query Dependencies', 'Modeling > Manage relationships', 'Transform > Detect Data Type'], answer: 1, explanation: 'Query Dependencies is on the View tab of Power Query Editor.' },
    { question: 'A Reference query initially contains:', options: ['A copy of all steps', 'Source = <original query name>', 'Nothing', 'Only the data type step'], answer: 1, explanation: 'Reference creates a single step pointing to the original query.' },
    { question: 'How are queries with load disabled shown in the Queries pane?', options: ['In bold', 'In italic', 'In red', 'They are hidden'], answer: 1, explanation: 'Disabled-load queries appear in italic text.' },
    { question: 'Sales merges Product and Product merges Sales. What happens?', options: ['Both load fine', 'A cyclic reference error', 'Power BI creates a many-to-many relationship', 'Only Sales loads'], answer: 1, explanation: 'Queries must not depend on each other in a loop.' },
    { question: 'Which option is best for "one cleaned source, many outputs"?', options: ['Duplicate the query many times', 'Reference a staging query', 'Copy and paste the M code', 'Use Append Queries'], answer: 1, explanation: 'References keep the cleaning logic in one place.' },
  ],
};
