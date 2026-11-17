export default {
  id: 'day-14-relationship-types',
  title: 'One-to-One, One-to-Many, Many-to-Many Relationships',
  module: 'Module 3: Data Modeling',
  day: 14,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Relationships come in three shapes depending on how many times a key value appears on each side. Choosing the right type decides whether your totals are correct, duplicated or ambiguous.',
  objectives: [
    'Describe one-to-one, one-to-many (many-to-one) and many-to-many relationships with real examples',
    'Identify the relationship type from the data by checking for duplicate keys',
    'Create each type in Model view and read the 1 and * symbols on the line',
    'Handle a Budget table at Category level using a many-to-many relationship or a bridge table',
    'Know when a one-to-one relationship should be merged into a single table instead',
  ],
  theory: [
    {
      heading: 'Cardinality in plain words',
      content:
        "**Cardinality** answers one question for each side of a relationship: *can this key value appear more than once in this table?*\n\n- If the key is unique on one side and repeats on the other side: **one-to-many** (1:*). Power BI also shows it as **many-to-one** (*:1) when you start from the fact table. It is the same thing seen from the other end.\n- If the key is unique on both sides: **one-to-one** (1:1).\n- If the key repeats on both sides: **many-to-many** (*:*).\n\nAnalogy: one **mother** can have many **children** (one-to-many). One **person** has one **Aadhaar number** (one-to-one). Many **students** take many **courses** (many-to-many).",
      points: [
        '1 on the line = that side has unique values',
        '* (asterisk) on the line = that side can repeat values',
        'Power BI guesses cardinality from the data when you create the relationship',
      ],
    },
    {
      heading: 'One-to-many: the normal relationship',
      content:
        "Around 90% of relationships in a good Power BI model are one-to-many. The **one** side is a dimension (lookup) table with a unique key; the **many** side is a fact table where the key repeats.\n\nIn our practice model:\n- `Product[ProductID]` (6 unique rows) 1 -> * `Sales[ProductID]` (60 rows, IDs repeat)\n- `Customer[CustomerID]` (6 unique rows) 1 -> * `Sales[CustomerID]`\n- `Date[Date]` (731 unique days) 1 -> * `Sales[OrderDate]`\n\nFilters flow from the one side to the many side. Picking Category = Electronics filters Product to Laptop and Mobile, which filters Sales to the 28 Electronics orders.",
      tip: 'Desk (ProductID 6) exists in Product but has no sales. That is perfectly fine on the one side: dimension rows without facts are normal.',
    },
    {
      heading: 'One-to-one: two tables with the same key',
      content:
        "In a one-to-one relationship both columns are unique. Example: an **extra table you create** called `ProductDetails` (ProductID, Supplier, WarrantyMonths) with exactly one row per product.\n\nPower BI supports 1:1 and by default sets the cross filter direction to **Both**. But a 1:1 relationship usually means the two tables describe the same thing, so the best practice is to **merge them into one table** in Power Query (Home > Merge Queries, then expand the columns). One table is simpler for users and slightly faster.\n\nKeep a 1:1 only when the second table comes from a different source/refresh schedule or has security rules of its own.",
    },
    {
      heading: 'Many-to-many: when both sides repeat',
      content:
        "Many-to-many happens when data is stored at a **different grain** (level of detail). Example: an **extra table you create** called `Budget` with columns Category, Year, Budget. The Category \"Electronics\" appears twice in Budget (2023 and 2024) and twice in Product (Laptop and Mobile). Neither side is unique.\n\nYou have two options:\n1. **Direct many-to-many relationship**: relate `Budget[Category]` to `Product[Category]` with Cardinality = Many to many. Set cross filter direction to **Single (Product filters Budget)** or as needed. Power BI shows a warning icon because this can be confusing.\n2. **Bridge (dimension) table**: create a small `CategoryDim` table with one row per category, then relate `CategoryDim[Category]` 1 -> * `Product[Category]` and `CategoryDim[Category]` 1 -> * `Budget[Category]`. This keeps every relationship one-to-many and is the cleaner star-schema approach.",
      syntax: 'CategoryDim = DISTINCT(Product[Category])',
      tip: 'Many-to-many relationships are legal but use them on purpose. A many-to-many created by mistake (because of duplicate IDs in a dimension) is a data quality problem, not a design choice.',
    },
    {
      heading: 'How to identify the type from data',
      content:
        "Before creating a relationship, check whether keys are unique:\n\n1. In Power Query select the key column and look at **View > Column distribution**: if *distinct* = *unique* = row count, the column is unique.\n2. Or in Report view build a quick card: `Rows = COUNTROWS(Product)` and `Unique IDs = DISTINCTCOUNT(Product[ProductID])`. If both are 6, ProductID is unique.\n3. If Power BI proposes Many to many for what should be a dimension, look for **duplicate or blank keys** in that dimension.",
    },
    {
      heading: 'Comparison table',
      content:
        "- **One-to-many (1:*)**: unique on one side, repeats on other. Default cross filter: Single. Use: dimension to fact. Most common.\n- **One-to-one (1:1)**: unique on both sides. Default cross filter: Both. Use: rare; usually merge the tables.\n- **Many-to-many (*:*)**: repeats on both sides. Default cross filter: Both (you can change it). Use: different grain like Budget by Category; prefer a bridge table.",
    },
  ],
  examples: [
    {
      title: 'Example 1: Verify the one-to-many relationship Product -> Sales',
      scenario: 'Check that ProductID is unique in Product and repeats in Sales.',
      table: {
        headers: ['Measure', 'Value', 'Meaning'],
        rows: [
          ['COUNTROWS(Product)', '6', 'rows in Product'],
          ['DISTINCTCOUNT(Product[ProductID])', '6', 'unique -> one side'],
          ['COUNTROWS(Sales)', '60', 'rows in Sales'],
          ['DISTINCTCOUNT(Sales[ProductID])', '5', 'repeats -> many side (Desk never sold)'],
        ],
      },
      steps: [
        'Report view > Modeling > New measure, create each measure below one by one',
        'Insert four Card visuals and drop one measure in each',
        'Compare rows vs distinct count for each table',
        'Open Model view and double-click the Product-Sales line to confirm Cardinality = Many to one',
      ],
      code: `Product Rows = COUNTROWS(Product)
Product Unique IDs = DISTINCTCOUNT(Product[ProductID])
Sales Rows = COUNTROWS(Sales)
Sales Unique Products = DISTINCTCOUNT(Sales[ProductID])`,
      result: 'Cards show 6, 6, 60 and 5.',
      explanation: 'Rows = unique count on Product means ProductID is a valid one-side key. In Sales 60 rows share only 5 IDs, so it is the many side.',
    },
    {
      title: 'Example 2: One-to-one with an extra ProductDetails table',
      scenario: 'You receive a supplier file with one row per product. Create the table and relate it.',
      table: {
        headers: ['ProductID', 'Supplier', 'WarrantyMonths'],
        rows: [
          ['1', 'TechWorld', '12'],
          ['2', 'TechWorld', '12'],
          ['3', 'SoundCo', '6'],
          ['4', 'SoundCo', '6'],
          ['5', 'WoodCraft', '24'],
          ['6', 'WoodCraft', '24'],
        ],
      },
      steps: [
        'Home > Enter data, type the table above, name it ProductDetails, click Load',
        'Model view: drag ProductDetails[ProductID] onto Product[ProductID]',
        'In the dialog note Cardinality = One to one (1:1) and Cross filter direction = Both, click Save',
        'Better practice: Home > Transform data, select Product query, Home > Merge Queries, pick ProductDetails on ProductID, Left Outer join',
        'Expand the new column and tick Supplier and WarrantyMonths, then Close & Apply and delete the separate ProductDetails table',
      ],
      result: 'Either a 1:1 line between Product and ProductDetails, or (after merging) a single Product table with two extra columns.',
      explanation: 'Both tables are unique on ProductID, so the relationship is one-to-one. Merging them is simpler and avoids a bidirectional link.',
    },
    {
      title: 'Example 3: Many-to-many with a Category-level Budget table',
      scenario: 'Management gives a budget per Category per Year. You must show Sales vs Budget for 2024.',
      table: {
        headers: ['Category', 'Sales 2024', 'Budget 2024'],
        rows: [
          ['Accessories', '86,907', '1,50,000'],
          ['Electronics', '15,65,941', '15,00,000'],
          ['Furniture', '9,790', '1,00,000'],
          ['Total', '16,62,638', '17,50,000'],
        ],
      },
      steps: [
        'Home > Enter data, create Budget with columns Category, Year, Budget and rows: Accessories/2023/120000, Electronics/2023/1200000, Furniture/2023/150000, Accessories/2024/150000, Electronics/2024/1500000, Furniture/2024/100000',
        'Model view: drag Budget[Category] onto Product[Category]',
        'Power BI sets Cardinality = Many to many; set Cross filter direction = Single (Product filters Budget), click Save and accept the warning',
        'Modeling > New measure: create Total Sales and Total Budget (code below)',
        'Insert a Matrix: Rows = Product[Category], Values = Total Sales, Total Budget',
        'Add a slicer with Sales[Year] = 2024 for sales; for the budget add a visual-level filter Budget[Year] = 2024 (or use a shared Year/Date dimension, see Day 16)',
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])
Total Budget = SUM(Budget[Budget])`,
      result: 'The matrix shows 2024 Sales next to 2024 Budget per category as in the table above.',
      explanation: 'Budget is stored at Category grain, Product at Product grain, so Category repeats on both sides: many-to-many. Product[Category] filters Budget through the relationship.',
    },
    {
      title: 'Example 4: Replace the many-to-many with a bridge table',
      scenario: 'Your team lead prefers only one-to-many relationships. Build a CategoryDim table.',
      steps: [
        'Delete the many-to-many line between Budget and Product in Model view',
        'Modeling > New table and enter the formula below',
        'Drag CategoryDim[Category] onto Product[Category] (One to many, Single)',
        'Drag CategoryDim[Category] onto Budget[Category] (One to many, Single)',
        'In the matrix replace Product[Category] with CategoryDim[Category]',
      ],
      code: 'CategoryDim = DISTINCT(Product[Category])',
      result: 'Same numbers as Example 3, but every relationship line now shows 1 and *. CategoryDim has 3 rows.',
      explanation: 'A shared dimension at the common grain (Category) lets one slicer filter both fact tables without many-to-many ambiguity.',
    },
  ],
  interview: [
    {
      q: 'What are the cardinality options in Power BI relationships?',
      a: 'One-to-one (1:1), one-to-many (1:*), many-to-one (*:1, same as 1:* from the other side) and many-to-many (*:*).',
      level: 'Easy',
    },
    {
      q: 'Give a real example of each relationship type.',
      a: 'One-to-many: Customer -> Orders. One-to-one: Employee -> EmployeeLogin details with one row each. Many-to-many: Budget by Category vs Product table where Category repeats on both sides, or Students and Courses.',
      level: 'Easy',
    },
    {
      q: 'Power BI proposed Many to many between Customer and Sales. Customer should be a dimension. What went wrong?',
      a: 'Customer has duplicate CustomerID values (or blanks). Find duplicates in Power Query (Keep Rows > Keep Duplicates on CustomerID), fix the source or Remove Duplicates, then recreate the relationship as one-to-many.',
      level: 'Medium',
    },
    {
      q: 'Why is a one-to-one relationship often a sign that tables should be merged?',
      a: 'Both tables describe the same entity at the same grain. Merging gives one simpler table, avoids a bidirectional filter, and is easier for report authors.',
      level: 'Medium',
    },
    {
      q: 'How do you model a Budget table that is at Category and Month level while Sales is at Product and Day level?',
      a: 'Create shared dimensions at the common grain: a Category dimension (or bridge) and a Date table with a month key. Relate both fact tables to these dimensions one-to-many. Alternatively use a many-to-many relationship on Category with single direction.',
      level: 'Hard',
    },
    {
      q: 'What risks come with many-to-many relationships?',
      a: 'Totals can look wrong because values are not additive across the relationship, filter direction can be ambiguous, performance can drop, and users may misread numbers. Use them deliberately and document them.',
      level: 'Hard',
    },
    {
      q: 'Is many-to-one different from one-to-many?',
      a: 'No. It is the same relationship described from the other table. Sales to Product is many-to-one; Product to Sales is one-to-many.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create the measures Product Rows and Product Unique IDs, then repeat for Customer. Decide which tables are valid one-side tables.',
      hint: 'COUNTROWS(table) vs DISTINCTCOUNT(table[key]).',
      solution: 'Product: 6 and 6. Customer: 6 and 6. Both are unique, so both are valid one-side tables.',
    },
    {
      task: 'Build the Budget table from Example 3 and show Sales vs Budget by Category for 2023.',
      hint: 'Filter Sales[Year] = 2023 and Budget[Year] = 2023.',
      solution: 'Accessories 70,668 vs 1,20,000; Electronics 11,81,851 vs 12,00,000; Furniture 1,79,796 vs 1,50,000.',
    },
    {
      task: 'Add the ProductDetails table, relate it 1:1, then merge it into Product in Power Query instead.',
      hint: 'Home > Merge Queries, Left Outer, then expand.',
      solution: 'After merging, Product has Supplier and WarrantyMonths columns and ProductDetails can be deleted (or right-click > uncheck Enable load).',
    },
    {
      task: 'Create CategoryDim with DISTINCT and connect it to both Product and Budget. Confirm both lines are 1:*.',
      hint: 'Modeling > New table.',
      solution: 'CategoryDim = DISTINCT(Product[Category]) gives 3 rows; two one-to-many single-direction relationships.',
    },
  ],
  quiz: [
    {
      question: 'Product has one row per ProductID and Sales has many rows per ProductID. What is the relationship?',
      options: ['One-to-one', 'One-to-many', 'Many-to-many', 'No relationship possible'],
      answer: 1,
      explanation: 'Unique on Product, repeating on Sales = one-to-many.',
    },
    {
      question: 'What default cross filter direction does Power BI set for a one-to-one relationship?',
      options: ['Single', 'Both', 'None', 'Inactive'],
      answer: 1,
      explanation: 'One-to-one relationships are always bidirectional by default.',
    },
    {
      question: 'A Budget table stores values per Category. Product stores many products per Category. Relating on Category gives:',
      options: ['One-to-one', 'One-to-many', 'Many-to-many', 'An error always'],
      answer: 2,
      explanation: 'Category repeats in both tables, so the cardinality is many-to-many.',
    },
    {
      question: 'Which DAX creates a bridge table with one row per category?',
      options: ['CategoryDim = VALUES(Sales)', 'CategoryDim = DISTINCT(Product[Category])', 'CategoryDim = SUM(Product[Category])', 'CategoryDim = COUNT(Product)'],
      answer: 1,
      explanation: 'DISTINCT(column) returns a one-column table of unique values.',
    },
    {
      question: 'Power BI suggests many-to-many between Customer and Sales on CustomerID. Most likely cause?',
      options: ['Sales has too many rows', 'Customer has duplicate CustomerID values', 'The column is named wrongly', 'Auto date/time is on'],
      answer: 1,
      explanation: 'A dimension with duplicate keys cannot be the one side, so Power BI falls back to many-to-many.',
    },
  ],
};
