export default {
  id: 'day-13-intro-data-modeling',
  title: 'Introduction to Data Modeling, Tables and Relationships',
  module: 'Module 3: Data Modeling',
  day: 13,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Data modeling is how you connect your cleaned tables so Power BI knows how they relate. A good model lets one slicer filter every visual correctly and keeps your DAX short and simple.',
  objectives: [
    'Explain what a data model (semantic model) is and why Power BI needs one',
    'Identify the tables in the practice model and the role of each table',
    'Create, edit and delete relationships in Model view using drag-and-drop and Manage relationships',
    'See how a relationship lets a column from one table filter numbers in another table',
    'Recognise common beginner mistakes: missing relationship, wrong columns, mismatched data types',
  ],
  theory: [
    {
      heading: 'What is a data model?',
      content:
        "A **data model** is the set of tables you loaded, plus the **relationships** between them, plus the **measures** you write on top. In the Power BI Service the published model is called a **semantic model** (older name: dataset).\n\nThink of a school office. One register has student details (name, class, city). Another register has fee payments (receipt no, student ID, amount, date). Neither register alone can answer \"How much fee did students from Pune pay?\". You need to **link** both registers using Student ID. That link is a relationship, and the two registers plus the link are a data model.\n\nPower Query (Module 2) cleans each table. Data modeling (this module) **connects** the tables. DAX (Module 4) **calculates** on the connected tables.",
      points: [
        'Tables = the data you loaded (after Power Query cleaning)',
        'Relationships = the links between tables, usually on an ID column',
        'Measures and calculated columns = DAX logic stored inside the model',
        'Semantic model = the published model in Power BI Service / Fabric that reports connect to',
      ],
    },
    {
      heading: 'Our practice model: four tables',
      content:
        "All Module 3 and Module 4 examples use the same practice model (download it from the app, or use the DAX Lab):\n\n- `Sales` (fact): OrderID, OrderDate, Year, Month, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost. 60 orders.\n- `Product` (dimension): ProductID, Product, Category, Price. 6 products in 3 categories (Electronics, Accessories, Furniture).\n- `Customer` (dimension): CustomerID, Customer, City, Segment. 6 customers in Pune, Mumbai, Nagpur, Nashik.\n- `Date` (dimension): one row per day from 2023-01-01 to 2024-12-31 with Year, MonthNo, Month, Quarter, YearMonth.\n\nThe **Sales** table stores *events* (each order). The other tables *describe* those events (which product, which customer, which day).",
      tip: 'Before building any visual, open Model view and check that every table is connected. A table floating alone usually means wrong numbers later.',
    },
    {
      heading: 'What a relationship actually does',
      content:
        "A relationship tells Power BI: \"when the user picks a value in this column, keep only the matching rows in that other table\". This is called **filter propagation**.\n\nIn our model, `Product[ProductID]` is linked to `Sales[ProductID]`. When a matrix shows `Product[Category]` on rows, Power BI filters the Product table to (say) Electronics, finds those ProductIDs (1 and 2), then keeps only Sales rows with ProductID 1 or 2, and only then sums SalesAmount.\n\nFilters flow along the arrow on the relationship line: from the **one** side (Product, the lookup table) to the **many** side (Sales, the detail table).",
      points: [
        'Relationship line with 1 at one end and * at the other end = one-to-many',
        'The small arrow in the middle of the line shows the filter direction',
        'A solid line is an active relationship; a dotted line is inactive (Day 17)',
      ],
    },
    {
      heading: 'Creating relationships in Model view',
      content:
        "Power BI Desktop has three views on the left bar: Report, Table (Data) and **Model**. Relationships are managed in Model view.\n\n1. Click the **Model view** icon on the left.\n2. Drag `ProductID` from the Product table and drop it on `ProductID` in the Sales table.\n3. The **New relationship** dialog opens with Cardinality and Cross filter direction already guessed. Check them and click **Save** (or OK).\n\nOther ways: **Home > Manage relationships > New**, or **Modeling > Manage relationships**. To edit, double-click the line. To delete, select the line and press Delete.\n\nBy default Power BI also runs **autodetect** while loading data. It matches columns with the same name and type. Autodetect is helpful but always verify what it created.",
      tip: 'You can turn autodetect off in File > Options and settings > Options > Current File > Data Load > Relationships.',
    },
    {
      heading: 'Rules for a valid relationship',
      content:
        "- The two columns must hold the **same kind of value** (e.g. both ProductID). Names can differ, values must match.\n- The data types should match. Whole number to Text often fails or gives blanks. Fix the type in Power Query (Day 8) before modeling.\n- On the **one** side the column must be **unique** (no duplicate ProductID in Product) and should have no blanks.\n- Only **one active path** can exist between two tables. A second link becomes inactive (dotted).\n\nIf Sales has a ProductID (say 9) that does not exist in Product, the matrix shows a row with a **blank** category. That blank row is Power BI telling you the lookup table is missing a key.",
    },
    {
      heading: 'Why not one giant table?',
      content:
        "Beginners often merge everything into one wide table using Merge Queries in Power Query. It works for tiny files but causes problems:\n\n- Text like \"Electronics\" or \"Asha Traders\" repeats in every order row, so the file gets bigger and slower.\n- If a product changes category you must update thousands of rows instead of one.\n- Time intelligence and many DAX patterns expect a separate Date table.\n\nA **model with separate tables + relationships** (the star schema you will learn on Day 16) is the Power BI best practice.",
    },
  ],
  examples: [
    {
      title: 'Example 1: Load the practice tables and inspect Model view',
      scenario: 'You have downloaded Sales.csv, Product.csv and Customer.csv. You want to see how Power BI connects them.',
      table: {
        headers: ['Table', 'Rows', 'Key column', 'Role'],
        rows: [
          ['Sales', '60', 'OrderID (own key), ProductID, CustomerID', 'Fact (events)'],
          ['Product', '6', 'ProductID', 'Dimension (lookup)'],
          ['Customer', '6', 'CustomerID', 'Dimension (lookup)'],
        ],
      },
      steps: [
        'Home > Get data > Text/CSV, pick Sales.csv, click Load',
        'Repeat for Product.csv and Customer.csv',
        'Click the Model view icon (third icon on the left bar)',
        'Drag the table cards so Sales is in the middle, Product on the left, Customer on the right',
        'Look at the lines Power BI autodetected; hover each line to see which columns are linked',
        'Open Home > Manage relationships to see the list of relationships',
      ],
      result:
        'Two lines: Product[ProductID] 1 -> * Sales[ProductID] and Customer[CustomerID] 1 -> * Sales[CustomerID]. Manage relationships shows both as Active, Many to one, Single direction.',
      explanation:
        'Autodetect matched columns with the same name and type. Product and Customer have unique IDs, so they become the "one" side; Sales repeats IDs, so it is the "many" side.',
    },
    {
      title: 'Example 2: Matrix WITHOUT a relationship (the wrong result)',
      scenario: 'Delete the Product-Sales relationship and see what happens to a Sales by Category visual.',
      table: {
        headers: ['Category', 'Total Sales'],
        rows: [
          ['Accessories', '30,94,953'],
          ['Electronics', '30,94,953'],
          ['Furniture', '30,94,953'],
          ['Total', '30,94,953'],
        ],
      },
      steps: [
        'In Model view click the line between Product and Sales and press Delete, confirm',
        'Go to Report view, insert a Matrix visual from the Visualizations pane',
        'Drag Product[Category] to Rows',
        'Modeling > New measure and type the measure below, press Enter',
        'Drag the Total Sales measure to Values',
      ],
      code: 'Total Sales = SUM(Sales[SalesAmount])',
      result: 'Every category shows the same grand total 30,94,953 (Indian format of 3,094,953).',
      explanation:
        'Without a relationship the Category filter cannot reach the Sales table, so every row sums all 60 orders. Repeated identical values are the classic symptom of a missing or broken relationship.',
    },
    {
      title: 'Example 3: Create the relationship by drag-and-drop and fix the matrix',
      scenario: 'Recreate the link and confirm the numbers split correctly.',
      table: {
        headers: ['Category', 'Total Sales'],
        rows: [
          ['Accessories', '1,57,575'],
          ['Electronics', '27,47,792'],
          ['Furniture', '1,89,586'],
          ['Total', '30,94,953'],
        ],
      },
      steps: [
        'Go to Model view',
        'Drag Product[ProductID] and drop it on Sales[ProductID]',
        'In the New relationship dialog check: Cardinality = Many to one (*:1) or One to many, Cross filter direction = Single, Make this relationship active = ticked',
        'Click Save',
        'Return to Report view; the matrix refreshes automatically',
      ],
      code: 'Total Sales = SUM(Sales[SalesAmount])',
      result: 'Each category now shows its own sales and the three values add up to the total 30,94,953.',
      explanation:
        'Product[Category] filters Product rows, the relationship passes the matching ProductIDs to Sales, and SUM runs only on those rows. Try the same measure in the DAX Lab with Category on rows.',
    },
    {
      title: 'Example 4: Spot a data type mismatch',
      scenario: 'Customer.csv loaded CustomerID as Text ("101") while Sales has CustomerID as Whole number. Drag-and-drop fails or the relationship gives blanks.',
      steps: [
        'In Model view try dragging Customer[CustomerID] onto Sales[CustomerID]; note the warning',
        'Home > Transform data to open Power Query Editor',
        'Select the Customer query, click the CustomerID column header',
        'Transform > Data type > Whole Number',
        'Home > Close & Apply',
        'Back in Model view create the relationship again by drag-and-drop',
      ],
      result: 'The relationship is created as Many to one, Single. A matrix with Customer[City] and Total Sales shows Mumbai 8,01,109, Nagpur 11,73,782, Nashik 2,09,730, Pune 9,10,332.',
      explanation: 'Relationship columns must have matching data types. Always fix types in Power Query, not by guessing in the model.',
    },
  ],
  interview: [
    {
      q: 'What is data modeling in Power BI?',
      a: 'It is the process of organising loaded tables and defining relationships, data types, hierarchies and measures so that filters flow correctly and calculations are accurate. The resulting model is published as a semantic model.',
      level: 'Easy',
    },
    {
      q: 'Where do you create relationships in Power BI Desktop?',
      a: 'In Model view by dragging a column from one table onto the matching column in another, or via Home > Manage relationships > New. Double-click a relationship line to edit it.',
      level: 'Easy',
    },
    {
      q: 'Your matrix shows the same total in every row. What is the most likely cause?',
      a: 'The column on rows comes from a table that has no relationship (or an inactive/wrong one) with the table being summed. Check Model view, create or fix the relationship, and verify the columns and data types.',
      level: 'Medium',
    },
    {
      q: 'What does relationship autodetect do and should you trust it?',
      a: 'During load Power BI matches columns with the same name and compatible types and creates relationships automatically. It is a good start but it can link wrong columns (for example two different "ID" columns), so always review Model view.',
      level: 'Medium',
    },
    {
      q: 'Why does a blank row appear in a visual after creating a relationship?',
      a: 'The fact table contains key values that do not exist in the dimension table (orphan keys) or blank keys. Power BI groups those rows under a blank member. Fix it by adding the missing dimension rows or cleaning the fact data.',
      level: 'Medium',
    },
    {
      q: 'Why is a model with separate tables better than one flat merged table?',
      a: 'It stores descriptive text once instead of on every fact row, so the model is smaller and faster, easier to maintain, and works naturally with DAX patterns such as time intelligence that expect separate dimension tables.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a new Region table (City, Region) must be added to the model. How do you connect it?',
      a: 'Make sure City is unique in the Region table, then relate Region[City] (one side) to Customer[City] (many side). Filters will flow Region -> Customer -> Sales. Alternatively merge Region into Customer in Power Query to keep a pure star schema.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Load Sales, Product and Customer from the practice dataset and arrange them in Model view with Sales in the centre.',
      hint: 'Home > Get data > Text/CSV for each file, then click the Model view icon.',
      solution: 'Three cards appear. Drag Sales to the middle. Two relationships should exist: Product[ProductID] -> Sales[ProductID] and Customer[CustomerID] -> Sales[CustomerID].',
    },
    {
      task: 'Delete the Customer relationship, build a matrix of Customer[Segment] with Total Sales, note the result, then recreate the relationship.',
      hint: 'Total Sales = SUM(Sales[SalesAmount]).',
      solution: 'Without the relationship both Corporate and Retail show 30,94,953. After recreating it: Corporate 21,58,211 and Retail 9,36,742.',
    },
    {
      task: 'Open Home > Manage relationships and write down for each relationship: From table/column, To table/column, Cardinality, Cross filter direction, Active.',
      hint: 'Double-click any row to open the edit dialog.',
      solution: 'Sales[ProductID] -> Product[ProductID], Many to one, Single, Active. Sales[CustomerID] -> Customer[CustomerID], Many to one, Single, Active.',
    },
    {
      task: 'In the DAX Lab, write Total Sales and show it by Customer[City].',
      hint: 'Pick City as the row field in the Lab.',
      solution: 'Mumbai 8,01,109; Nagpur 11,73,782; Nashik 2,09,730; Pune 9,10,332; Total 30,94,953.',
    },
  ],
  quiz: [
    {
      question: 'In the Power BI Service, what is the current name for a published dataset?',
      options: ['Dataflow', 'Semantic model', 'Lakehouse', 'Workbook'],
      answer: 1,
      explanation: 'Microsoft renamed datasets to semantic models. The concept is the same: tables, relationships and measures.',
    },
    {
      question: 'Which view in Power BI Desktop shows tables as cards with relationship lines?',
      options: ['Report view', 'Table view', 'Model view', 'Power Query Editor'],
      answer: 2,
      explanation: 'Model view is where you create, edit and delete relationships.',
    },
    {
      question: 'Every category in your matrix shows 30,94,953. What should you check first?',
      options: ['The visual colour theme', 'The relationship between Product and Sales', 'The page size', 'The measure font'],
      answer: 1,
      explanation: 'Identical totals in every row mean the row field cannot filter the fact table: the relationship is missing or wrong.',
    },
    {
      question: 'In a one-to-many relationship Product -> Sales, which table is on the "one" side?',
      options: ['Sales', 'Product', 'Both', 'Neither'],
      answer: 1,
      explanation: 'Product has one row per ProductID (unique), Sales repeats ProductID many times.',
    },
    {
      question: 'Which is a requirement for the column on the "one" side of a relationship?',
      options: ['It must be text', 'It must contain unique values', 'It must be named ID', 'It must be the first column'],
      answer: 1,
      explanation: 'The one side must have unique values; otherwise Power BI cannot know which row a fact row belongs to.',
    },
  ],
};
