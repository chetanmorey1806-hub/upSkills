export default {
  id: 'data-modeling',
  title: 'Data Modeling: Star Schema & Relationships',
  level: 'Intermediate',
  day: 5,
  duration: '4 hours',
  summary:
    'A good data model is the foundation of every fast, correct Power BI report. Learn star vs snowflake schemas, facts vs dimensions, relationship cardinality and cross-filter direction, active vs inactive relationships, role-playing dimensions, surrogate keys and modeling best practices.',
  objectives: [
    'Design a star schema with fact and dimension tables',
    'Explain cardinality (1:*, 1:1, *:*) and cross-filter direction (single, both)',
    'Use active and inactive relationships with USERELATIONSHIP',
    'Handle role-playing dimensions such as Order Date vs Ship Date',
    'Explain surrogate keys, granularity and why bidirectional filters are risky',
    'Apply model hygiene: hide keys, display folders, sort by column, disable auto date/time',
  ],
  theory: [
    {
      heading: 'Fact tables vs dimension tables',
      content:
        `**Fact tables** store measurable business events (transactions): each row is an event at a defined **grain** (e.g., one order line). They contain **foreign keys** to dimensions and **numeric measures** (Quantity, SalesAmount, Cost). They are long (millions of rows) and narrow.\n\n**Dimension tables** describe the context of the events – who, what, where, when: Customer, Product, Store, Date. They have one row per entity, a unique **primary key**, and descriptive text attributes used for slicing, filtering and grouping (Category, Country, Segment). They are short and wide.\n\nIn our sample model: **Sales** is the fact (grain = one order line). **Product**, **Customer** and **'Date'** are dimensions.`,
      points: [
        '**Grain** – the level of detail of a fact row. Always define it first ("one row per order line per day").',
        '**Additive** measures can be summed across all dimensions (SalesAmount). **Semi-additive** cannot be summed across time (inventory balance, account balance). **Non-additive** cannot be summed at all (percentages, unit price).',
        '**Factless fact tables** record events without numeric measures (attendance, promotions coverage).',
      ],
    },
    {
      heading: 'Star schema vs snowflake schema',
      content:
        `In a **star schema**, the fact table sits in the center and each dimension is a single denormalized table connected directly to the fact. Example: Product contains ProductName, Subcategory and Category all in one table.\n\nIn a **snowflake schema**, dimensions are normalized into multiple related tables: Product → Subcategory → Category, each connected by keys.\n\n**Power BI strongly favors the star schema** (Microsoft's official guidance):\n\n- Fewer relationships = simpler filter propagation and faster queries.\n- Easier for users (all product attributes in one table in the field list).\n- Simpler DAX.\n- VertiPaq compression makes the repetition of text in denormalized dimensions cheap.\n\nIf the source is snowflaked, flatten it in Power Query by merging Subcategory and Category into Product.`,
      tip: 'Avoid one big flat table too: it bloats the model, makes some DAX harder (e.g., counting customers without sales) and cannot support multiple facts sharing dimensions.',
    },
    {
      heading: 'Relationships and cardinality',
      content:
        `A relationship connects a column in one table to a column in another so filters can propagate. Create them in Model view by dragging a column onto another, or Manage relationships → New.\n\n**Cardinality** options:\n\n- **One-to-many (1:*)** / **Many-to-one (*:1)** – the standard: the "one" side (dimension) has unique values; the "many" side (fact) has repeating values. Filters flow from the one side to the many side.\n- **One-to-one (1:1)** – both columns unique. Usually means the two tables should be merged into one (e.g., Product and ProductDetails). Cross-filter defaults to Both.\n- **Many-to-many (*:*)** – neither side unique. Used e.g. when relating a Budget table at Category grain to a Product table at product grain (Category repeats in both). Use carefully: results can be confusing and are always "limited"-like in behavior with no blank row added.\n\nThe classic **many-to-many through a bridge table** (e.g., Customer ↔ Account with a CustomerAccount bridge) is a different pattern using two 1:* relationships and a bidirectional filter or CROSSFILTER in DAX.`,
      tip: 'Error "You can\'t create a relationship between these two columns because one of the columns must have unique values" means duplicates (or blanks) exist in the dimension key. Fix the data, do not jump to many-to-many.',
    },
    {
      heading: 'Cross-filter direction: single vs both',
      content:
        `**Single** (default for 1:*) – filters flow from the dimension (one side) to the fact (many side). A slicer on Product[Category] filters Sales. Filtering Sales does not filter Product.\n\n**Both** (bidirectional) – filters flow in both directions. Example need: a slicer on Customer should show only Products bought by those customers (Customer → Sales → Product requires Sales to filter Product).\n\nWhy avoid Both by default:\n\n- **Ambiguity**: multiple filter paths between tables; Power BI may refuse or pick paths unexpectedly.\n- **Performance**: more filter propagation work.\n- **Unexpected results**: slicers start filtering each other, totals change.\n- RLS filters may leak in unintended ways (there is a separate option "Apply security filter in both directions").\n\nBetter alternatives: keep relationships single and use DAX \`CROSSFILTER(Sales[ProductID], Product[ProductID], BOTH)\` inside a specific measure, or filter slicers with a measure-based visual filter (e.g., show product only where [Total Sales] is not blank).`,
    },
    {
      heading: 'Active vs inactive relationships and USERELATIONSHIP',
      content:
        `Only **one active relationship** can exist between two tables (more precisely, only one active filter path between any two tables). Additional relationships are **inactive** (shown as dotted lines).\n\nExample: Sales has OrderDate and ShipDate, both related to 'Date'[Date]. Only one (OrderDate) can be active. To compute sales by ship date, activate the inactive relationship inside a measure with **USERELATIONSHIP**, used as a CALCULATE modifier.`,
      syntax: `Sales by Ship Date =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] )
)`,
      tip: 'USERELATIONSHIP requires an existing (inactive) relationship in the model. It cannot create one.',
    },
    {
      heading: 'Role-playing dimensions',
      content:
        `A **role-playing dimension** is one dimension used in several roles by the same fact – the classic case is Date (Order Date, Ship Date, Due Date) or Airport (Origin, Destination).\n\nTwo approaches:\n\n1. **One Date table + inactive relationships + USERELATIONSHIP** in measures. Pros: one table, smaller model. Cons: users cannot slice by both roles at once; need a measure version per role.\n2. **Duplicate the dimension** per role (Order Date table, Ship Date table) – e.g., with a calculated table \`Ship Date = 'Date'\` or a referenced query. Pros: all relationships active, users can filter both roles at the same time with clear field names. Cons: bigger model, more tables to maintain; rename columns ("Ship Year") to avoid confusion.`,
    },
    {
      heading: 'Keys: natural vs surrogate keys',
      content:
        `A **natural (business) key** comes from the source system (e.g., ProductCode "ELEC-LAP-001", email address). A **surrogate key** is a meaningless integer generated in the data warehouse (ProductKey = 1, 2, 3…).\n\nWhy surrogate keys:\n\n- Integers are smaller and compress/join faster than long text.\n- Combine data from multiple source systems whose natural keys collide.\n- Support **Slowly Changing Dimensions (SCD Type 2)** – keep history by having several rows (versions) of the same customer with different surrogate keys and ValidFrom/ValidTo dates.\n- Shield the model from changes in business keys.\n\nIn Power BI, you can create a surrogate key in Power Query with an **Index column** on the dimension and merge it into the fact – but ideally keys are created upstream in the warehouse.`,
    },
    {
      heading: 'Model best practices and hygiene',
      content: `A checklist used by experienced Power BI developers:`,
      points: [
        'Build a **star schema**; one fact per business process; shared (conformed) dimensions across facts.',
        'Use **1:* single-direction** relationships by default; integer keys where possible.',
        'Create and **mark a dedicated Date table**; disable **Auto date/time** (File → Options → Data Load) to avoid hidden date tables for every date column.',
        '**Hide** foreign keys and technical columns in the fact (Sales[ProductID], Sales[CustomerID]) so users slice by dimension attributes.',
        'Hide numeric fact columns and expose **explicit measures** instead; organize measures in **display folders** or a dedicated measure table.',
        'Use **Sort by column** (MonthName sorted by MonthNumber), set **data categories** (City, Country, Web URL, Image URL), set default summarization to None for IDs and years.',
        'Remove unnecessary columns, especially high-cardinality ones (GUIDs, timestamps); split datetime into date and time.',
        'Avoid calculated columns when Power Query can do it; avoid bidirectional and many-to-many unless needed.',
        'Name tables and fields in business language; add descriptions (shown as tooltips).',
      ],
      tip: 'Use the Model view "Layouts" feature to create diagrams focused on one fact table for large models.',
    },
  ],
  examples: [
    {
      title: 'Designing the sample star schema',
      scenario: 'Turn the sample tables into a star schema with correct relationships.',
      table: {
        headers: ['From (one side)', 'To (many side)', 'Cardinality', 'Cross-filter', 'Active'],
        rows: [
          ['Product[ProductID]', 'Sales[ProductID]', '1:*', 'Single', 'Yes'],
          ['Customer[CustomerID]', 'Sales[CustomerID]', '1:*', 'Single', 'Yes'],
          ["'Date'[Date]", 'Sales[OrderDate]', '1:*', 'Single', 'Yes'],
          ["'Date'[Date]", 'Sales[ShipDate]', '1:*', 'Single', 'No (inactive)'],
        ],
      },
      code: `Model view:
1. Drag Product[ProductID] onto Sales[ProductID]  → 1:*, Single
2. Drag Customer[CustomerID] onto Sales[CustomerID] → 1:*, Single
3. Drag 'Date'[Date] onto Sales[OrderDate] → 1:*, Single (active)
4. Drag 'Date'[Date] onto Sales[ShipDate] → created as inactive (dotted line)
5. Hide Sales[ProductID], Sales[CustomerID], Sales[OrderDate], Sales[ShipDate]
6. Mark 'Date' as date table (Table tools → Mark as date table → Date)`,
      explanation:
        'All dimensions filter the fact in one direction. The fact keys are hidden so report authors use the dimension attributes. The second date relationship stays inactive and is used via USERELATIONSHIP.',
    },
    {
      title: 'Flatten a snowflake Product dimension in Power Query',
      scenario: 'Source has Product (ProductID, ProductName, SubcategoryID), Subcategory (SubcategoryID, Subcategory, CategoryID) and Category (CategoryID, Category).',
      code: `let
    Source = Product_Raw,
    MergeSub = Table.NestedJoin(Source, {"SubcategoryID"}, Subcategory_Raw, {"SubcategoryID"}, "Sub", JoinKind.LeftOuter),
    ExpandSub = Table.ExpandTableColumn(MergeSub, "Sub", {"Subcategory", "CategoryID"}),
    MergeCat = Table.NestedJoin(ExpandSub, {"CategoryID"}, Category_Raw, {"CategoryID"}, "Cat", JoinKind.LeftOuter),
    ExpandCat = Table.ExpandTableColumn(MergeCat, "Cat", {"Category"}),
    Final = Table.RemoveColumns(ExpandCat, {"SubcategoryID", "CategoryID"})
in
    Final`,
      explanation:
        'Two left outer merges bring Subcategory and Category into a single Product table. Disable load for the three raw queries. The model now has one Product dimension (star) instead of a chain of three tables (snowflake).',
    },
    {
      title: 'Sales by Ship Date using an inactive relationship',
      scenario: 'Show sales by the date orders were shipped in the same visual as sales by order date.',
      code: `Total Sales = SUM ( Sales[SalesAmount] )

Sales by Ship Date =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[ShipDate], 'Date'[Date] )
)`,
      result: 'A line chart by \'Date\'[Month] shows both lines: orders placed vs orders shipped per month.',
      explanation:
        'Within CALCULATE, USERELATIONSHIP makes the ShipDate relationship active and the OrderDate relationship is ignored for that calculation, so the Date filter now applies to Sales[ShipDate].',
    },
    {
      title: 'Budget at category grain: many-to-many vs bridge',
      scenario: 'Budget is defined per Category and Month, while Product is at product grain. Compare Sales vs Budget by Category.',
      table: {
        headers: ['Category', 'MonthStart', 'BudgetAmount'],
        rows: [
          ['Electronics', '2024-01-01', '50000'],
          ['Furniture', '2024-01-01', '20000'],
        ],
      },
      code: `Option A (many-to-many):
  Budget[Category] *:* Product[Category], cross-filter: Product filters Budget (Single)
  Budget[MonthStart] *:1 'Date'[Date]

Option B (recommended, star-friendly): create a Category dimension
  Category = DISTINCT ( Product[Category] )            -- calculated table
  Category[Category] 1:* Product[Category]
  Category[Category] 1:* Budget[Category]
  Use Category[Category] in visuals (not Product[Category]).

Total Budget = SUM ( Budget[BudgetAmount] )
Budget Variance = [Total Sales] - [Total Budget]`,
      explanation:
        'Budget cannot relate 1:* to Product because Category repeats in Product. A small Category dimension gives clean 1:* relationships for both facts. Note: Budget is at month grain – showing Budget by day would repeat or split values, so restrict budget visuals to month level or allocate.',
    },
    {
      title: 'Role-playing Date as separate tables',
      scenario: 'Users want to filter Order Year = 2024 and Ship Month = January at the same time.',
      code: `Ship Date =
SELECTCOLUMNS (
    'Date',
    "Ship Date", 'Date'[Date],
    "Ship Year", 'Date'[Year],
    "Ship Month", 'Date'[MonthName],
    "Ship Month Number", 'Date'[MonthNumber]
)
-- Relationship: 'Ship Date'[Ship Date] 1:* Sales[ShipDate] (active)
-- Sort "Ship Month" by "Ship Month Number"`,
      explanation:
        'A calculated table copies the Date table with renamed columns, so both relationships can be active and the field list is unambiguous. Trade-off: extra memory and a second table to maintain.',
    },
    {
      title: 'Using CROSSFILTER instead of a bidirectional relationship',
      scenario: 'Count how many products were bought by the customers selected in a slicer, without making the relationship bidirectional.',
      code: `Products Bought =
CALCULATE (
    DISTINCTCOUNT ( Product[ProductID] ),
    CROSSFILTER ( Sales[ProductID], Product[ProductID], BOTH )
)`,
      explanation:
        'Customer filters Sales (normal direction). CROSSFILTER BOTH lets the filtered Sales rows filter Product only for this measure. The rest of the model keeps safe single-direction filtering. An alternative is DISTINCTCOUNT ( Sales[ProductID] ) which needs no cross filter at all.',
    },
  ],
  interview: [
    {
      q: 'What is a star schema and why is it recommended in Power BI?',
      a: `A star schema has a central fact table (events with numeric measures and foreign keys) surrounded by denormalized dimension tables (descriptive attributes), each connected directly with a 1:* relationship.\n\nRecommended because: simple and predictable filter propagation, fewer joins → faster VertiPaq queries, simpler DAX, user-friendly field list, and good compression. Microsoft's guidance explicitly recommends star schema for Power BI semantic models.`,
      level: 'Easy',
    },
    {
      q: 'Difference between fact and dimension tables?',
      a: `**Fact**: measurable events at a defined grain, many rows, foreign keys + numeric measures (Sales, Orders, Inventory snapshots).\n\n**Dimension**: descriptive context, fewer rows, unique primary key + text attributes (Product, Customer, Date, Store). Dimensions filter and group; facts are aggregated.`,
      level: 'Easy',
    },
    {
      q: 'Star schema vs snowflake schema – which is better for Power BI and why?',
      a: `Snowflake normalizes dimensions into multiple tables (Product → Subcategory → Category). It saves storage in relational databases but in Power BI it adds relationships, longer filter chains and a more confusing field list. VertiPaq compresses repeated text well, so the storage benefit disappears. Therefore star schema is preferred; flatten snowflakes in Power Query or SQL views. Snowflaking is acceptable when a dimension is shared at a different grain (e.g., a Category table related to Budget).`,
      level: 'Medium',
    },
    {
      q: 'Explain cardinality types in Power BI relationships.',
      a: `- **One-to-many (1:*)**: unique values on the one side (dimension), repeating on the many side (fact). Most common and recommended.\n- **One-to-one (1:1)**: both sides unique; usually signals tables that should be merged. Default cross-filter Both.\n- **Many-to-many (*:*)**: neither side unique; used for facts at different grains (Budget by Category). Must choose filter direction carefully; can give unintuitive results.\n\nCardinality is detected automatically when you create a relationship, but always verify it.`,
      level: 'Medium',
    },
    {
      q: 'What is cross-filter direction? When would you use Both?',
      a: `It controls in which direction filters propagate across a relationship. **Single**: from the one side to the many side (dimension → fact). **Both**: in both directions.\n\nUse Both sparingly – e.g., many-to-many with a bridge table (Customer ↔ CustomerAccount ↔ Account), or when a dimension slicer must show only values that have facts and other options are not suitable. Prefer \`CROSSFILTER\` in specific measures because bidirectional relationships cause ambiguity, performance costs and unexpected slicer interactions.`,
      level: 'Medium',
    },
    {
      q: 'What is an inactive relationship and how do you use it?',
      a: `When multiple relationships exist between two tables (e.g., 'Date' to Sales[OrderDate] and Sales[ShipDate]), only one can be active; the others are inactive (dotted line) and do not propagate filters automatically.\n\nActivate one inside a measure:\n\n\`\`\`\nSales by Ship Date = CALCULATE([Total Sales], USERELATIONSHIP(Sales[ShipDate], 'Date'[Date]))\n\`\`\`\n\nInactive relationships are also created automatically when a new relationship would create an ambiguous path.`,
      level: 'Medium',
    },
    {
      q: 'What is a role-playing dimension? How do you implement it in Power BI?',
      a: `A dimension used multiple times by a fact in different roles, e.g., Date as Order Date, Ship Date, Due Date.\n\nImplementations: (1) one Date table with one active and other inactive relationships + USERELATIONSHIP measures; (2) duplicate the dimension per role (calculated table or referenced query) with active relationships and renamed columns. Option 2 allows filtering by multiple roles simultaneously; option 1 keeps the model smaller.`,
      level: 'Medium',
    },
    {
      q: 'Why are bidirectional relationships considered risky?',
      a: `- They can create **ambiguous paths** (multiple ways for a filter to reach a table); Power BI will make some relationships inactive or return unexpected results.\n- **Performance**: extra filter propagation, especially on large facts.\n- **Unexpected behaviour**: slicers filter each other, measures like COUNTROWS(Product) change because Sales now filters Product.\n- **Security**: RLS can propagate in surprising ways.\n\nUse single direction plus CROSSFILTER, TREATAS or visual-level filters instead.`,
      level: 'Hard',
    },
    {
      q: 'What is a surrogate key and why use it?',
      a: `An artificial, meaningless (usually integer) key generated in the warehouse, independent of business keys. Benefits: smaller and faster joins, integrates multiple sources whose business keys conflict, supports SCD Type 2 history (multiple versions of a customer row), and insulates the model from business key changes. It also allows special members like -1 "Unknown" for missing references.`,
      level: 'Medium',
    },
    {
      q: 'What happens when a fact row has a key that does not exist in the dimension?',
      a: `With a regular (strong) relationship, Power BI adds a hidden **blank row** to the dimension, and the unmatched fact rows are grouped under "(Blank)" in visuals – totals still include them. This is a referential integrity issue. Fix: clean the data (Left Anti merge to find orphans), add an "Unknown" member in the dimension, or map to -1 key upstream.\n\nWith limited relationships (cross source group / many-to-many) no blank row is added, and unmatched rows are excluded – like an inner join.`,
      level: 'Hard',
    },
    {
      q: 'Why should you disable Auto date/time?',
      a: `Auto date/time creates a hidden date table (with Year, Quarter, Month, Day hierarchy) for EVERY date/datetime column in the model. This increases model size, cannot be customized (fiscal year, holidays), and the hidden tables are not shared between facts. A single, marked Date table is the best practice. Disable it in File → Options → Data Load (Current File and Global).`,
      level: 'Medium',
    },
    {
      q: 'What is granularity and why does it matter when relating two fact tables?',
      a: `Granularity is the level of detail of a table. Sales may be at day/product grain while Budget is at month/category grain. To compare them, both must relate to dimensions at a compatible grain: Budget relates to a Category dimension (not Product) and to the Date table on the first day of month (or a Month table). Visuals must not drill below the budget grain (or measures should hide values there, e.g., using ISINSCOPE). Never relate two fact tables directly to each other.`,
      level: 'Hard',
    },
    {
      q: 'How do you model a many-to-many relationship using a bridge table?',
      a: `Example: Customers can hold multiple Accounts, and Accounts can have multiple Customers. Create a bridge CustomerAccount (CustomerID, AccountID). Relationships: Customer 1:* CustomerAccount, Account 1:* CustomerAccount, Account 1:* Transactions. For Customer filters to reach Transactions, the filter must flow CustomerAccount → Account, so set the Account–CustomerAccount relationship to Both or use CROSSFILTER in the measure.\n\nBe aware that totals are not additive: a transaction on a joint account counts once per customer but once in the grand total.`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Given one flat table SalesFlat (OrderID, OrderDate, CustomerID, CustomerName, City, Country, ProductID, ProductName, Category, Quantity, UnitPrice, SalesAmount, Cost), design a star schema. List tables, columns and relationships.',
      hint: 'Extract distinct dimension attributes; keep keys + measures in the fact.',
      solution: `Sales (fact): OrderID, OrderDate, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost
Customer (dim): CustomerID (PK), CustomerName, City, Country
Product (dim): ProductID (PK), ProductName, Category
'Date' (dim): Date (PK), Year, Quarter, MonthNumber, MonthName, ...
Relationships (all 1:*, single): Customer[CustomerID] → Sales[CustomerID]; Product[ProductID] → Sales[ProductID]; 'Date'[Date] → Sales[OrderDate]
In Power Query: reference a staging query, select columns, Remove Duplicates on the keys.`,
    },
    {
      task: 'Sales has OrderDate and DueDate. Create measures Total Sales (by order date) and Sales by Due Date.',
      hint: 'Two relationships to Date: one active, one inactive.',
      solution: `Total Sales = SUM ( Sales[SalesAmount] )

Sales by Due Date =
CALCULATE (
    [Total Sales],
    USERELATIONSHIP ( Sales[DueDate], 'Date'[Date] )
)
-- Requires an inactive relationship 'Date'[Date] 1:* Sales[DueDate]`,
    },
    {
      task: 'You try to create a relationship Product[ProductID] → Sales[ProductID] and Power BI suggests many-to-many. What is the likely cause and how do you fix it?',
      hint: 'Check the dimension key.',
      solution:
        'Product[ProductID] contains duplicates (or the duplicates appear after trimming/case differences, or there are blanks). Use column profiling (entire data set) or Keep Duplicates in Power Query to find them, fix the source or Remove Duplicates (after deciding which row is correct), trim/clean the keys, then recreate the relationship as 1:*.',
    },
    {
      task: 'A slicer on Customer[Country] should show in a second slicer only the Products bought by customers of that country. Achieve this without a bidirectional relationship.',
      hint: 'Visual-level filter on the product slicer.',
      solution:
        'Select the Product slicer → Filters pane → add the measure [Total Sales] to "Filters on this visual" → "is not blank". The slicer now only shows products with sales in the current filter context (country). Relationships stay single-direction.',
    },
    {
      task: 'Write a measure that counts customers who bought products in the selected Product category, while Customer→Sales and Product→Sales are single direction.',
      hint: 'Count distinct keys in the fact, or use CROSSFILTER.',
      solution: `Customers Buying =
DISTINCTCOUNT ( Sales[CustomerID] )
-- Product filters Sales, so the distinct customers in Sales are those who bought.
-- Alternative counting from the dimension:
Customers Buying (dim) =
CALCULATE (
    COUNTROWS ( Customer ),
    CROSSFILTER ( Sales[CustomerID], Customer[CustomerID], BOTH )
)`,
    },
    {
      task: 'List 6 model hygiene steps you would perform before publishing a model.',
      hint: 'Think of what users see in the field list.',
      solution:
        '1) Hide foreign keys and raw numeric columns; 2) create explicit measures in display folders or a measure table; 3) sort MonthName by MonthNumber; 4) set data categories (Country, City) and default summarization None for Year/IDs; 5) mark the Date table and disable Auto date/time; 6) rename tables/columns to business names and add descriptions; plus remove unused columns and verify relationships are 1:* single.',
    },
  ],
  quiz: [
    {
      question: 'In a star schema, dimension tables typically:',
      options: [
        'Contain numeric measures and many rows',
        'Contain descriptive attributes and a unique key',
        'Are connected to each other in a chain',
        'Have no relationships',
      ],
      answer: 1,
      explanation: 'Dimensions describe entities with a unique primary key and text attributes used for slicing.',
    },
    {
      question: 'What is the default and recommended cross-filter direction for a 1:* relationship?',
      options: ['Both', 'Single (from one side to many side)', 'None', 'Single (from many side to one side)'],
      answer: 1,
      explanation: 'Filters flow from the dimension (one side) to the fact (many side).',
    },
    {
      question: 'Which function activates an inactive relationship within a measure?',
      options: ['CROSSFILTER', 'RELATED', 'USERELATIONSHIP', 'TREATAS'],
      answer: 2,
      explanation: 'USERELATIONSHIP is used as a CALCULATE modifier to use an existing inactive relationship.',
    },
    {
      question: 'Date used as Order Date, Ship Date and Due Date for the same fact is an example of:',
      options: ['Snowflake schema', 'Role-playing dimension', 'Junk dimension', 'Degenerate dimension'],
      answer: 1,
      explanation: 'A single dimension playing multiple roles is a role-playing dimension.',
    },
    {
      question: 'Sales rows with a ProductID that does not exist in Product appear in visuals as:',
      options: ['They are dropped silently', 'An error', '(Blank) product', 'The first product alphabetically'],
      answer: 2,
      explanation: 'Regular relationships add a virtual blank row in the dimension for unmatched fact keys.',
    },
    {
      question: 'Why is the star schema preferred over snowflake in Power BI?',
      options: [
        'Snowflake is not supported',
        'Fewer relationships, simpler DAX and faster queries',
        'Star schema uses less disk in SQL Server',
        'Star schema allows many-to-many only',
      ],
      answer: 1,
      explanation: 'Denormalized dimensions mean shorter filter paths, simpler models and better performance in VertiPaq.',
    },
  ],
};
