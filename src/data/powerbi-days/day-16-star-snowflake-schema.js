export default {
  id: 'day-16-star-snowflake-schema',
  title: 'Star Schema, Snowflake Schema, Fact Tables, Dimension Tables',
  module: 'Module 3: Data Modeling',
  day: 16,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Fact tables hold numbers about events and dimension tables describe those events. Arranging them as a star schema is the single most important Power BI modeling best practice; a snowflake is a star whose dimensions are split further.',
  objectives: [
    'Separate any dataset into fact tables and dimension tables',
    'Explain the grain of a fact table',
    'Draw and build a star schema from the practice model',
    'Recognise a snowflake schema and flatten it into a star using Power Query',
    'List the benefits of a star schema for DAX, performance and usability',
  ],
  theory: [
    {
      heading: 'Fact tables: what happened',
      content:
        "A **fact table** records business **events** or **transactions**: a sale, a payment, a website visit, an attendance mark. It has:\n\n- **Foreign keys** to dimensions (ProductID, CustomerID, OrderDate)\n- **Numeric columns you aggregate** (Quantity, SalesAmount, Cost), also called measures or facts\n- Many rows that keep growing every day\n\nOur `Sales` table is a fact table: 60 rows, each one order line.\n\nThe **grain** is what one row represents. Sales grain = *one product ordered by one customer on one date*. Always state the grain before modeling; mixing grains (daily sales with monthly budget in one table) causes wrong totals.",
    },
    {
      heading: 'Dimension tables: who, what, where, when',
      content:
        "A **dimension table** describes the facts. It answers *who* (Customer), *what* (Product), *where* (City), *when* (Date). It has:\n\n- One row per item with a **unique key**\n- Descriptive text columns used for slicers, rows, axes and legends (Category, City, Segment, Month)\n- Relatively few rows that change slowly\n\nRule of thumb: if you **filter or group by** it, it belongs in a dimension. If you **sum, count or average** it, it belongs in a fact.",
      points: ['Product: Product, Category, Price', 'Customer: Customer, City, Segment', 'Date: Year, Quarter, Month, MonthNo, YearMonth'],
    },
    {
      heading: 'Star schema',
      content:
        "In a **star schema** the fact table sits in the centre and every dimension connects **directly** to it with a one-to-many, single-direction relationship. Drawn in Model view it looks like a star:\n\n```\n        Product\n           |\nCustomer - Sales - Date\n```\n\nWhy Power BI loves it:\n1. **Simple filters**: every dimension is one hop from the fact, so filter paths are never ambiguous.\n2. **Fast**: the VertiPaq engine compresses narrow dimension columns very well.\n3. **Short DAX**: measures like `SUM(Sales[SalesAmount])` just work by any dimension.\n4. **Easy for users**: fields are grouped logically (all product fields under Product).",
      tip: 'Microsoft documentation officially recommends star schema for Power BI semantic models.',
    },
    {
      heading: 'Snowflake schema',
      content:
        "A **snowflake schema** normalises a dimension into more tables. Example: instead of Category inside Product, you have an **extra table you create** called `CategoryTable` (CategoryID, Category, Department) and Product holds only CategoryID:\n\n```\nCategoryTable - Product - Sales - Customer\n```\n\nNow a Category filter has to travel two hops (CategoryTable -> Product -> Sales). It works, but:\n- More relationships to maintain\n- More tables in the field list for report users\n- Slightly slower queries and harder DAX in some patterns\n\nSnowflakes are common in source databases (SQL designers normalise to save space). In Power BI we usually **flatten** them back into a star using Merge Queries.",
    },
    {
      heading: 'Star vs Snowflake comparison',
      content:
        "- **Structure**: Star = dimensions connect directly to fact. Snowflake = dimensions connect to other dimensions.\n- **Number of tables**: Star fewer, Snowflake more.\n- **Redundancy**: Star repeats text in dimension (e.g. \"Electronics\" twice in Product). Snowflake stores it once.\n- **Query speed in Power BI**: Star usually faster.\n- **Ease of use**: Star simpler for report authors.\n- **When to use**: Star almost always in Power BI. Snowflake only when a dimension is huge and shared, or when it is a separate grain (e.g. Category used by a Budget fact).",
    },
    {
      heading: 'Other good modeling habits',
      content:
        "- Hide foreign key columns in the fact table (right-click > Hide in report view) so users pick Product[Product] instead of Sales[ProductID].\n- Put measures in the fact table or a dedicated measure table.\n- Avoid columns like Year and Month duplicated in both fact and Date. Use the Date table columns in visuals.\n- Name tables in business language (Sales, Product), not source names (tbl_fct_sls_01).",
    },
  ],
  examples: [
    {
      title: 'Example 1: Classify columns into fact and dimension',
      scenario: 'You receive one flat export with all columns. Decide where each belongs.',
      table: {
        headers: ['Column', 'Aggregate or describe?', 'Goes to table'],
        rows: [
          ['OrderID', 'Identify the event', 'Sales (fact)'],
          ['Quantity, SalesAmount, Cost', 'Aggregate (sum)', 'Sales (fact)'],
          ['Product, Category, Price', 'Describe product', 'Product (dimension)'],
          ['Customer, City, Segment', 'Describe customer', 'Customer (dimension)'],
          ['Year, Month, Quarter', 'Describe date', 'Date (dimension)'],
        ],
      },
      steps: [
        'Open the flat query in Power Query (Home > Transform data)',
        'Right-click the query > Reference, rename it Product; keep only ProductID, Product, Category, Price; Home > Remove Rows > Remove Duplicates',
        'Repeat Reference for Customer: keep CustomerID, Customer, City, Segment; Remove Duplicates',
        'In the original query (rename to Sales) remove the descriptive columns, keep keys and numbers',
        'Home > Close & Apply and check Model view',
      ],
      result: 'Three tables: Sales with keys and numbers, Product with 6 unique rows, Customer with 6 unique rows, linked by autodetected relationships.',
      explanation: 'Splitting by "aggregate vs describe" turns a flat file into a star schema.',
    },
    {
      title: 'Example 2: Build the star schema in Model view',
      scenario: 'Arrange the practice model as a star and hide the foreign keys.',
      steps: [
        'Model view: place Sales in the centre, Product above, Customer on the right, Date below',
        'Check three relationships exist: Product[ProductID] -> Sales[ProductID], Customer[CustomerID] -> Sales[CustomerID], Date[Date] -> Sales[OrderDate]',
        'Double-click each line: Many to one, Single, Active',
        'In the Sales card right-click ProductID > Hide in report view; repeat for CustomerID',
        'Build a Matrix: Rows = Customer[Segment], Columns = Product[Category], Values = Total Sales',
      ],
      code: 'Total Sales = SUM(Sales[SalesAmount])',
      table: {
        headers: ['Segment', 'Accessories', 'Electronics', 'Furniture', 'Total'],
        rows: [
          ['Corporate', '92,600', '19,66,419', '99,192', '21,58,211'],
          ['Retail', '64,975', '7,81,373', '90,394', '9,36,742'],
          ['Total', '1,57,575', '27,47,792', '1,89,586', '30,94,953'],
        ],
      },
      result: 'A matrix sliced by two different dimensions at once, both filtering the single fact table.',
      explanation: 'Each dimension is one hop from Sales, so Segment and Category filters combine without any extra DAX.',
    },
    {
      title: 'Example 3: Recognise and flatten a snowflake',
      scenario: 'Your IT team gives Product with a CategoryID and a separate CategoryTable (an extra table). Flatten it.',
      table: {
        headers: ['CategoryID', 'Category', 'Department'],
        rows: [
          ['C1', 'Electronics', 'Tech'],
          ['C2', 'Accessories', 'Tech'],
          ['C3', 'Furniture', 'Home'],
        ],
      },
      steps: [
        'Home > Transform data, select the Product query',
        'Home > Merge Queries; second table = CategoryTable; match Product[CategoryID] with CategoryTable[CategoryID]; Join Kind = Left Outer; OK',
        'Click the expand icon on the new column, tick Category and Department, untick "Use original column name as prefix", OK',
        'Remove the CategoryID column from Product if not needed',
        'Right-click CategoryTable > uncheck Enable load, then Home > Close & Apply',
      ],
      result: 'Model view shows Product directly connected to Sales with Category and Department inside Product. CategoryTable no longer appears in the field list.',
      explanation: 'Merging the outer dimension into the inner one removes a hop and turns the snowflake back into a star.',
    },
    {
      title: 'Example 4: When a snowflake-style shared dimension is right',
      scenario: 'You have two facts at different grains: Sales (product level) and Budget (category level, an extra table).',
      steps: [
        'Modeling > New table: CategoryDim = DISTINCT(Product[Category])',
        'Relate CategoryDim[Category] 1 -> * Product[Category] and CategoryDim[Category] 1 -> * Budget[Category]',
        'Use CategoryDim[Category] on rows with Total Sales and Total Budget',
      ],
      code: `CategoryDim = DISTINCT(Product[Category])
Total Budget = SUM(Budget[Budget])`,
      result: 'One Category slicer filters both Sales (via Product) and Budget.',
      explanation: 'Category is a conformed dimension shared by two facts. This is the accepted exception to "always flatten".',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a fact table and a dimension table?',
      a: 'A fact table stores events with foreign keys and numeric values to aggregate; it is long and grows quickly. A dimension table stores descriptive attributes with a unique key used to filter and group; it is shorter and changes slowly.',
      level: 'Easy',
    },
    {
      q: 'What is a star schema and why is it recommended for Power BI?',
      a: 'A central fact table with dimensions directly related one-to-many. It gives unambiguous single-direction filters, better compression and speed, simpler DAX and a clean field list.',
      level: 'Easy',
    },
    {
      q: 'What is the grain of a fact table? Give an example.',
      a: 'The level of detail of one row. For our Sales table it is one product per customer per order date. Budget might be one category per month.',
      level: 'Medium',
    },
    {
      q: 'How do you convert a snowflake into a star in Power BI?',
      a: 'In Power Query merge the outer dimension (CategoryTable) into the inner dimension (Product) with a left outer join, expand the needed columns and disable load of the outer table.',
      level: 'Medium',
    },
    {
      q: 'Scenario: you have one flat Excel file with 30 columns. How would you model it?',
      a: 'Identify the grain, keep keys and numeric columns in a fact query, create dimension queries by referencing the flat query, keeping descriptive columns and removing duplicates, create a Date table, then relate dimensions to the fact one-to-many single direction.',
      level: 'Hard',
    },
    {
      q: 'What is a conformed dimension?',
      a: 'A dimension shared by multiple fact tables, like Date or Category used by both Sales and Budget, so one slicer filters all facts consistently.',
      level: 'Hard',
    },
    {
      q: 'Should measures be stored in dimension tables?',
      a: 'They can be stored anywhere, but best practice is to keep them in the fact table or a dedicated measure table so users find them easily.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'For the practice model write the grain of Sales and list its foreign keys and numeric facts.',
      hint: 'What does one row represent?',
      solution: 'Grain: one product ordered by one customer on one date (one OrderID). FKs: ProductID, CustomerID, OrderDate. Facts: Quantity, UnitPrice, SalesAmount, Cost.',
    },
    {
      task: 'Build the Segment x Category matrix from Example 2.',
      hint: 'Rows Customer[Segment], Columns Product[Category], Values Total Sales.',
      solution: 'Corporate: 92,600 / 19,66,419 / 99,192; Retail: 64,975 / 7,81,373 / 90,394; Grand total 30,94,953.',
    },
    {
      task: 'Create a CategoryTable with Enter data and snowflake it to Product, then flatten it back with Merge Queries.',
      hint: 'Join on Category text if you did not add CategoryID.',
      solution: 'After merging, Product has a Department column (Tech/Home) and CategoryTable load is disabled.',
    },
    {
      task: 'Hide Sales[ProductID] and Sales[CustomerID] in report view and explain why.',
      hint: 'Right-click column in Model view or Data pane.',
      solution: 'Hidden keys prevent users from grouping by raw IDs in the fact table; they should use Product and Customer attributes instead.',
    },
  ],
  quiz: [
    {
      question: 'Which table is a fact table in the practice model?',
      options: ['Product', 'Customer', 'Sales', 'Date'],
      answer: 2,
      explanation: 'Sales holds the order events and numeric values.',
    },
    {
      question: 'In a star schema, dimension tables connect to:',
      options: ['Other dimensions', 'The fact table directly', 'Nothing', 'Only the Date table'],
      answer: 1,
      explanation: 'Each dimension is one hop from the central fact table.',
    },
    {
      question: 'Product -> CategoryTable -> ... with Category stored in a separate table is an example of:',
      options: ['Star schema', 'Snowflake schema', 'Flat table', 'Galaxy of facts'],
      answer: 1,
      explanation: 'A dimension split into further related tables is a snowflake.',
    },
    {
      question: 'Which column belongs in a dimension table?',
      options: ['SalesAmount', 'Quantity', 'Customer City', 'Cost'],
      answer: 2,
      explanation: 'City describes the customer and is used to filter or group.',
    },
    {
      question: 'Best way to flatten a snowflake in Power BI?',
      options: ['Bidirectional relationships', 'Merge Queries in Power Query', 'Calculated measure', 'Delete the fact table'],
      answer: 1,
      explanation: 'Merge the outer dimension into the inner one and disable load of the outer table.',
    },
  ],
};
