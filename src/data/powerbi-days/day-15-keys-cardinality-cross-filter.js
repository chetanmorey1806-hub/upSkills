export default {
  id: 'day-15-keys-cardinality-cross-filter',
  title: 'Primary Key, Foreign Key, Cardinality, Cross Filter Direction',
  module: 'Module 3: Data Modeling',
  day: 15,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Keys are the columns that make relationships work, cardinality says how often key values repeat, and cross filter direction says which way filters travel. Getting these three right is the core of a correct Power BI model.',
  objectives: [
    'Define primary key and foreign key and find them in the practice model',
    'Check a column for uniqueness and blanks before using it as a key',
    'Set cardinality correctly in the Edit relationship dialog',
    'Explain Single vs Both cross filter direction and see the effect in a visual',
    'Use CROSSFILTER inside CALCULATE as a safer alternative to bidirectional relationships',
  ],
  theory: [
    {
      heading: 'Primary key (PK)',
      content:
        "A **primary key** is a column whose value is **unique** and **never blank** for every row of a table. It identifies one row exactly, like a roll number in a class.\n\nIn our model:\n- `Product[ProductID]` is the PK of Product\n- `Customer[CustomerID]` is the PK of Customer\n- `Date[Date]` is the PK of the Date table\n- `Sales[OrderID]` is the PK of Sales\n\nPower BI does not have a \"set as primary key\" button. It simply checks uniqueness when you create a relationship. If the column is unique, that side becomes the **one** side.",
      points: ['Unique: no value appears twice', 'Not blank: every row has a value', 'Stable: should not change over time', 'Prefer numbers or short codes over long text'],
    },
    {
      heading: 'Foreign key (FK)',
      content:
        "A **foreign key** is a column in one table that stores the primary key of **another** table. It is the pointer that says \"this order belongs to that product\".\n\n`Sales[ProductID]` is a FK pointing to `Product[ProductID]`. `Sales[CustomerID]` is a FK pointing to `Customer[CustomerID]`. `Sales[OrderDate]` acts as a FK to `Date[Date]`.\n\nForeign keys **can repeat** (Mobile was ordered 16 times) and should always find a match in the PK table. A FK value with no matching PK is called an **orphan** and shows up as a blank row in visuals.",
      tip: 'Relationship = PK column (one side) + FK column (many side). Drag from PK to FK in Model view.',
    },
    {
      heading: 'Cardinality settings in the dialog',
      content:
        "Double-click a relationship line to open **Edit relationship**. The **Cardinality** dropdown has:\n\n- **Many to one (*:1)**: first table repeats, second table unique (Sales -> Product)\n- **One to one (1:1)**: both unique\n- **One to many (1:*)**: first table unique, second repeats\n- **Many to many (*:*)**: both repeat\n\nPower BI detects the right value from the data. If you force One to many but the one side has duplicates, you get the error *\"The cardinality you selected isn't valid for this relationship\"*. The fix is cleaning the data, not changing the setting.",
    },
    {
      heading: 'Cross filter direction: Single vs Both',
      content:
        "**Cross filter direction** decides which way filters flow:\n\n- **Single**: filters flow from the one side (dimension) to the many side (fact). Product filters Sales, but Sales does not filter Product. This is the default and recommended setting.\n- **Both** (bidirectional): filters also flow from Sales back to Product. Then Customer -> Sales -> Product becomes a chain, so choosing a customer can filter the product list.\n\nAnalogy: Single direction is a one-way street. Both is a two-way street: convenient, but more traffic and more chances of accidents (ambiguous paths, slower queries, confusing totals).",
      points: [
        'Use Single by default',
        'Use Both only for a clear need, e.g. a slicer that should show only products bought by the selected customer',
        'Better: keep Single and use CROSSFILTER(..., Both) inside one measure, or filter the slicer visual with a measure',
      ],
    },
    {
      heading: 'CROSSFILTER: turn on Both for one measure only',
      content:
        "`CROSSFILTER` is used inside `CALCULATE` to change the direction of an existing relationship just for that calculation.\n\nArguments:\n- **LeftColumnName**: the column on one end of the relationship, usually the many side (`Sales[ProductID]`)\n- **RightColumnName**: the column on the other end (`Product[ProductID]`)\n- **CrossFilterType**: `Both`, `OneWay`, `OneWay_LeftFiltersRight`, `OneWay_RightFiltersLeft` or `None`\n\nThe relationship must already exist in the model. CROSSFILTER only modifies it.",
      syntax: 'CROSSFILTER(<LeftColumnName>, <RightColumnName>, <CrossFilterType>)',
    },
    {
      heading: 'Checklist before creating a relationship',
      content:
        "1. PK column is unique and has no blanks (View > Column distribution / Column quality in Power Query).\n2. PK and FK have the **same data type**.\n3. FK values all exist in the PK table (no orphans) or you accept a blank member.\n4. Cardinality shows 1 on the dimension side.\n5. Cross filter direction is Single unless you have a documented reason.\n6. Relationship is Active (solid line).",
    },
  ],
  examples: [
    {
      title: 'Example 1: Identify PK and FK in the practice model',
      scenario: 'List each table, its primary key and the foreign keys it holds.',
      table: {
        headers: ['Table', 'Primary key', 'Foreign keys', 'Points to'],
        rows: [
          ['Sales', 'OrderID', 'ProductID, CustomerID, OrderDate', 'Product, Customer, Date'],
          ['Product', 'ProductID', '-', '-'],
          ['Customer', 'CustomerID', '-', '-'],
          ['Date', 'Date', '-', '-'],
        ],
      },
      steps: [
        'Open Table view (grid icon on the left) and select each table in the Data pane',
        'For each ID column, check the status bar: it shows "COLUMN: x distinct values"',
        'Compare distinct values with table rows: equal = candidate primary key',
        'Open Model view and confirm every relationship goes from a PK (1) to a FK (*)',
      ],
      result: 'Product[ProductID] shows 6 distinct values for 6 rows (PK). Sales[ProductID] shows 5 distinct values for 60 rows (FK).',
      explanation: 'A PK is unique per row; a FK repeats and points to the PK of a dimension.',
    },
    {
      title: 'Example 2: Single direction - a Product table does not react to a Customer slicer',
      scenario: 'Build a table of Product names plus a Customer slicer. With Single direction the product list does not shrink.',
      table: {
        headers: ['Product', 'Customers Count (Single)'],
        rows: [
          ['Desk', '6'],
          ['Headphones', '6'],
          ['Keyboard', '6'],
          ['Laptop', '6'],
          ['Mobile', '6'],
          ['Office Chair', '6'],
          ['Total', '6'],
        ],
      },
      steps: [
        'Modeling > New measure: Customers Count = COUNTROWS(Customer)',
        'Insert a Table visual with Product[Product] and the Customers Count measure',
        'Confirm the Product-Sales and Customer-Sales relationships are Single direction (double-click each line)',
        'Look at the result: every product shows 6',
      ],
      code: 'Customers Count = COUNTROWS(Customer)',
      result: 'Every product shows 6 customers, even Desk which was never sold.',
      explanation: 'The Product filter reaches Sales but cannot travel from Sales back up to Customer, because Customer -> Sales is single direction. So the Customer table is never filtered.',
    },
    {
      title: 'Example 3: Use CROSSFILTER to count customers per product',
      scenario: 'You want "how many different customers bought this product" without making the model bidirectional.',
      table: {
        headers: ['Product', 'Customers Who Bought'],
        rows: [
          ['Headphones', '6'],
          ['Keyboard', '4'],
          ['Laptop', '4'],
          ['Mobile', '6'],
          ['Office Chair', '4'],
          ['Total', '6'],
        ],
      },
      steps: [
        'Modeling > New measure and type the code below',
        'Add the measure to the same Table visual next to Product[Product]',
        'Remove the Customers Count measure so Desk disappears (it returns blank)',
      ],
      code: `Customers Who Bought =
CALCULATE(
    COUNTROWS(Customer),
    CROSSFILTER(Sales[CustomerID], Customer[CustomerID], Both)
)`,
      result: 'Headphones 6, Keyboard 4, Laptop 4, Mobile 6, Office Chair 4, Total 6. Desk returns blank so the row is hidden.',
      explanation: 'CROSSFILTER makes Sales filter Customer only while this measure runs. The simpler equivalent is DISTINCTCOUNT(Sales[CustomerID]), which gives the same numbers and works in the DAX Lab.',
    },
    {
      title: 'Example 4: Fix the "cardinality isn\'t valid" error',
      scenario: 'Someone appended a duplicate row for CustomerID 104 into Customer. Creating the relationship as Many to one fails.',
      steps: [
        'Home > Transform data, select the Customer query',
        'Select CustomerID column, Home > Keep Rows > Keep Duplicates to see the duplicate rows',
        'Delete that applied step, then Home > Remove Rows > Remove Duplicates with CustomerID selected',
        'Home > Close & Apply',
        'Model view: double-click the Customer-Sales line, set Cardinality = Many to one (*:1), Cross filter direction = Single, Save',
      ],
      result: 'The relationship saves without error and Customer shows 1 on its side of the line.',
      explanation: 'The one side must be unique. Removing the duplicate restores CustomerID as a valid primary key.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a primary key and a foreign key?',
      a: 'A primary key uniquely identifies each row in its own table and cannot be blank. A foreign key is a column in another table that stores those key values to link rows; it can repeat.',
      level: 'Easy',
    },
    {
      q: 'Can Power BI enforce primary keys like a SQL database?',
      a: 'No. Power BI has no PK constraint. It only checks uniqueness when you create or refresh a relationship and raises an error if the one side has duplicates.',
      level: 'Medium',
    },
    {
      q: 'What does cross filter direction Both do and why is it risky?',
      a: 'It lets filters flow from the many side back to the one side, chaining filters across tables. It can create ambiguous filter paths, slower queries and unexpected totals, so Single is preferred.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a Product slicer should only list products bought by the selected customer. How do you do it without a bidirectional relationship?',
      a: 'Add a measure like Has Sales = NOT ISBLANK(SUM(Sales[SalesAmount])) or COUNTROWS(Sales) to the slicer visual filter pane and set it to "is not blank" / greater than 0. The slicer then shows only products with sales in the current context.',
      level: 'Hard',
    },
    {
      q: 'Explain the arguments of CROSSFILTER.',
      a: 'CROSSFILTER(LeftColumn, RightColumn, Type). The two columns identify an existing relationship. Type is Both, OneWay, OneWay_LeftFiltersRight, OneWay_RightFiltersLeft or None. It only works inside CALCULATE/CALCULATETABLE.',
      level: 'Medium',
    },
    {
      q: 'What is an orphan foreign key and how does it appear in a report?',
      a: 'A FK value in the fact table with no matching PK in the dimension. Visuals group those rows under a blank dimension member, so totals look right but a blank row appears.',
      level: 'Medium',
    },
    {
      q: 'Why are integer keys preferred over long text keys?',
      a: 'Integers compress better in the VertiPaq engine, use less memory and make relationships faster. Long text keys increase model size.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write measures to prove Customer[CustomerID] is a primary key.',
      hint: 'Compare COUNTROWS(Customer) with DISTINCTCOUNT(Customer[CustomerID]).',
      solution: 'Both return 6, and there are no blanks, so CustomerID is unique: a valid primary key.',
    },
    {
      task: 'In the DAX Lab create Customers Who Bought = DISTINCTCOUNT(Sales[CustomerID]) and show it by Product.',
      hint: 'Put Product on rows.',
      solution: 'Headphones 6, Keyboard 4, Laptop 4, Mobile 6, Office Chair 4, Total 6.',
    },
    {
      task: 'Change the Customer-Sales relationship to Both and observe the Customers Count = COUNTROWS(Customer) measure by Product. Then set it back to Single.',
      hint: 'Double-click the line, Cross filter direction = Both.',
      solution: 'With Both: Headphones 6, Keyboard 4, Laptop 4, Mobile 6, Office Chair 4 and Desk disappears (blank). With Single every product shows 6.',
    },
    {
      task: 'List the PK and FK pairs for all three relationships of the practice model.',
      hint: 'Product, Customer and Date each have one link to Sales.',
      solution: 'Product[ProductID] PK -> Sales[ProductID] FK; Customer[CustomerID] PK -> Sales[CustomerID] FK; Date[Date] PK -> Sales[OrderDate] FK.',
    },
  ],
  quiz: [
    {
      question: 'Which column is a foreign key in the Sales table?',
      options: ['Sales[OrderID]', 'Sales[ProductID]', 'Product[ProductID]', 'Customer[City]'],
      answer: 1,
      explanation: 'Sales[ProductID] stores Product primary key values and repeats: it is a foreign key.',
    },
    {
      question: 'What is the recommended default cross filter direction?',
      options: ['Both', 'Single', 'None', 'It does not matter'],
      answer: 1,
      explanation: 'Single direction (dimension filters fact) is predictable and fast.',
    },
    {
      question: 'With all relationships Single, a measure COUNTROWS(Customer) shown by Product[Product] returns:',
      options: ['Customers who bought each product', 'Total customers (6) for every product', 'Blank for every product', 'An error'],
      answer: 1,
      explanation: 'The Product filter cannot travel from Sales up to Customer, so Customer stays unfiltered.',
    },
    {
      question: 'CROSSFILTER can be used:',
      options: ['Directly as a measure on its own', 'Inside CALCULATE or CALCULATETABLE', 'Only in Power Query', 'Only in calculated columns'],
      answer: 1,
      explanation: 'CROSSFILTER is a filter modifier and only works inside CALCULATE/CALCULATETABLE.',
    },
    {
      question: 'A primary key column must be:',
      options: ['Text only', 'Unique and not blank', 'Sorted ascending', 'Hidden'],
      answer: 1,
      explanation: 'Uniqueness and no blanks are what make a column a valid key.',
    },
  ],
};
