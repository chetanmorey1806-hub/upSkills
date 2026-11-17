export default {
  id: 'day-34-evaluation-context',
  title: 'Advanced DAX, Evaluation Context, Row Context, Filter Context',
  module: 'Module 6: Advanced Power BI',
  day: 34,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Every DAX formula is evaluated inside a "context" that decides which rows it can see. Today you learn the two kinds of evaluation context (row context and filter context), how they are created and how they interact, which is the single most important idea for writing correct advanced DAX.',
  objectives: [
    'Explain what evaluation context is and why the same measure shows different numbers in different cells',
    'Identify where row context comes from (calculated columns and iterators like SUMX)',
    'Identify where filter context comes from (visual rows/columns, slicers, filters, CALCULATE)',
    'Use ALL, ALLSELECTED and ALLEXCEPT to change filter context for % of total measures',
    'Debug wrong totals by reasoning about the context of each cell',
  ],
  theory: [
    {
      heading: 'What is evaluation context?',
      content:
        "A DAX measure is written once but evaluated many times: once for every cell of a visual, including the total row. The **evaluation context** is the set of conditions that is active when DAX computes one particular cell.\n\nAnalogy: think of a measure as a question to a shopkeeper: 'How much did we sell?'. The answer depends on *who* is asking. The Electronics manager hears only Electronics sales, the Pune manager hears only Pune sales, and the owner hears the grand total. The question is the same; the context changes the answer.\n\nThere are two kinds of context:\n\n1. **Filter context**: which rows of the tables are visible (filters).\n2. **Row context**: which single row we are currently 'standing on' while scanning a table.\n\nThey are different things. Mixing them up is the cause of most wrong DAX results.",
      points: [
        'Filter context = a set of filters applied to tables (Category = Electronics, Year = 2024).',
        'Row context = a pointer to the current row during a row-by-row scan.',
        'A measure in a visual starts with filter context only; it has no row context.',
      ],
    },
    {
      heading: 'Filter context: where it comes from',
      content:
        "Filter context is created by everything that filters the report:\n\n- Rows and columns of a table/matrix visual (each cell filters by its own Category, Month, etc.)\n- Axis and legend fields of charts\n- Slicers on the page\n- The Filters pane (visual, page and report level filters)\n- Cross-filtering from clicking another visual\n- Inside a formula: `CALCULATE` and `CALCULATETABLE` filter arguments\n\nFilters flow along relationships from the one side to the many side. A filter on `Product[Category]` reaches `Sales` because of the relationship Product[ProductID] → Sales[ProductID]. In our model (single direction), a filter on `Sales` does **not** flow back to `Product`.\n\nIn the **total row** of a visual, the Category filter is removed, so the measure sees all categories (subject to slicers). That is why totals are not 'the sum of the rows' but a new evaluation in a wider context.",
      tip: "When a number looks wrong, ask: 'What filters are active in THIS cell?' Write them down: Category = Accessories, Year = 2024, City slicer = Pune. Then compute the answer by hand.",
    },
    {
      heading: 'Row context: where it comes from',
      content:
        "Row context exists in two places:\n\n1. **Calculated columns**: the formula is evaluated once per row of the table, and you can refer to columns of that row directly, e.g. `Sales[Quantity] * Sales[UnitPrice]`.\n2. **Iterator functions**: `SUMX`, `AVERAGEX`, `MINX`, `MAXX`, `COUNTX`, `RANKX`, `FILTER`, `CONCATENATEX` create a row context over the table in their first argument.\n\nRow context does **not** filter anything. A calculated column `= SUM(Sales[SalesAmount])` returns the grand total on every row, because the row context does not turn into a filter by itself. (It only turns into a filter through context transition, which you will study on Day 35.)\n\nTo read a column from the one side of a relationship while in row context on the many side, use `RELATED`, e.g. `RELATED(Product[Category])` inside a row context on `Sales`.",
      syntax: "SUMX ( <table>, <expression evaluated in row context> )\nFILTER ( <table>, <condition evaluated in row context> )",
    },
    {
      heading: 'How the two contexts work together',
      content:
        "Inside a measure such as `SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])`:\n\n1. The visual sets the filter context (e.g. Category = Electronics).\n2. `SUMX` receives the table `Sales`, but only the rows visible in that filter context.\n3. `SUMX` creates a row context and walks those rows one by one, computing Quantity * UnitPrice.\n4. It adds the results.\n\nSo filter context decides **which rows**, and row context decides **which row right now**. Nested iterators create nested row contexts, e.g. `SUMX(Product, SUMX(RELATEDTABLE(Sales), ...))`.",
      points: [
        'Measures: filter context always; row context only inside iterators.',
        'Calculated columns: row context always; filter context is the whole table (no report filters) at refresh time.',
        'Calculated columns are computed at refresh and stored; slicers never change them.',
      ],
    },
    {
      heading: 'Changing filter context: ALL, ALLSELECTED, ALLEXCEPT, REMOVEFILTERS',
      content:
        "Advanced measures often need to compare a cell to a bigger group. `CALCULATE` is the only function that changes filter context, and these modifiers tell it what to remove:\n\n- `ALL(Product[Category])` / `REMOVEFILTERS(Product[Category])`: ignore any filter on Category.\n- `ALL(Product)`: ignore every filter on the Product table.\n- `ALLSELECTED(Product[Category])`: ignore the visual's own Category filter but keep the slicer selection (visual total).\n- `ALLEXCEPT(Customer, Customer[City])`: remove all filters on Customer except City.\n\nThe classic use is **% of total**: Sales of the cell divided by Sales with the category filter removed.",
      syntax: "CALCULATE ( <expression>, ALL ( <table or column> ) )\nCALCULATE ( <expression>, ALLSELECTED ( <column> ) )",
    },
    {
      heading: 'Common context mistakes',
      content:
        "1. **SUM in a calculated column** returns the grand total on every row because row context does not filter.\n2. **Wrong totals in a matrix**: a measure like `IF(SUM(Sales[Quantity]) > 5, ...)` evaluates differently at the total level because the total has a wider filter context. Use iterators (`SUMX(VALUES(...), ...)`) if the total must be the sum of the rows.\n3. **Using a column in a measure without aggregation**: `= Sales[SalesAmount] * 2` as a measure fails, because a measure has no row context; you must aggregate or iterate.\n4. **Expecting filters on Sales to filter Product**: single-direction relationships filter from one side to many side only.",
      tip: "Calculated column = row context. Measure = filter context. Iterator inside measure = both.",
    },
  ],
  examples: [
    {
      title: 'Same measure, different filter context',
      scenario:
        'Using a 5-row slice of the shared Sales table (orders 1001-1005), show how one measure returns a different value per category and for the total.',
      table: {
        headers: ['Category', 'Total Sales'],
        rows: [
          ['Electronics', '1,50,000'],
          ['Accessories', '12,500'],
          ['Furniture', '24,000'],
          ['Total', '1,86,500'],
        ],
      },
      steps: [
        'Modeling > New measure',
        'Type the measure below and press Enter',
        'Insert a Table visual from the Visualizations pane',
        'Drag Product[Category] and then [Total Sales] into Columns',
        'Hover over each cell and note which Category filter applies; the Total row has no Category filter',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'Electronics 1,50,000; Accessories 12,500; Furniture 24,000; Total 1,86,500 (sample slice). The formula never changed; only the filter context did.',
      explanation:
        'Each row of the visual applies a filter on Product[Category]; that filter flows through the relationship to Sales, so SUM sees only that category. The total row has no category filter, so SUM sees all five rows.',
    },
    {
      title: 'Row context in an iterator',
      scenario: 'Compute sales from quantity and unit price row by row instead of using the stored SalesAmount.',
      table: {
        headers: ['OrderID', 'Product', 'Quantity', 'UnitPrice', 'Qty x Price'],
        rows: [
          ['1001', 'Laptop', '2', '50,000', '1,00,000'],
          ['1002', 'Mouse', '10', '500', '5,000'],
          ['1003', 'Chair', '4', '6,000', '24,000'],
          ['1004', 'Laptop', '1', '50,000', '50,000'],
          ['1005', 'Keyboard', '5', '1,500', '7,500'],
        ],
      },
      steps: [
        'Modeling > New measure',
        'Enter the SUMX measure below',
        'Add a Card visual and put [Sales via SUMX] in Fields',
        'Add a Product[Category] slicer and select Electronics; the card changes to 1,50,000',
      ],
      code: `Sales via SUMX =
SUMX (
    Sales,
    Sales[Quantity] * Sales[UnitPrice]
)`,
      result: 'Card shows 1,86,500 with no slicer selection and 1,50,000 with Electronics selected.',
      explanation:
        'The slicer creates filter context (which rows). SUMX creates row context (current row) and multiplies Quantity by UnitPrice for each visible row, then sums.',
    },
    {
      title: 'Percent of total with ALL',
      scenario: 'Show each category as a share of all sales, ignoring the Category filter of the row.',
      table: {
        headers: ['Category', 'Total Sales', '% of All Categories'],
        rows: [
          ['Electronics', '1,50,000', '80.43%'],
          ['Accessories', '12,500', '6.70%'],
          ['Furniture', '24,000', '12.87%'],
          ['Total', '1,86,500', '100.00%'],
        ],
      },
      steps: [
        'Modeling > New measure and enter the measure below',
        'Select the measure; in Measure tools set Format to Percentage with 2 decimals',
        'Add the measure to the table visual from Example 1',
      ],
      code: `% of All Categories =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALL ( Product[Category] ) )
)`,
      result: 'Electronics 80.43%, Accessories 6.70%, Furniture 12.87%, Total 100%.',
      explanation:
        'The denominator runs CALCULATE with the Category filter removed, so it always equals 1,86,500 (within any other filters such as Year). The numerator keeps the cell context.',
    },
    {
      title: 'Calculated column vs measure: the SUM trap',
      scenario: 'A student writes SUM in a calculated column and gets the same number on every row.',
      table: {
        headers: ['OrderID', 'SalesAmount', 'Wrong Col (SUM)', 'Share Col'],
        rows: [
          ['1001', '1,00,000', '1,86,500', '53.62%'],
          ['1002', '5,000', '1,86,500', '2.68%'],
          ['1003', '24,000', '1,86,500', '12.87%'],
          ['1004', '50,000', '1,86,500', '26.81%'],
          ['1005', '7,500', '1,86,500', '4.02%'],
        ],
      },
      steps: [
        'Go to Table view and select the Sales table',
        'Table tools > New column, enter Wrong Col = SUM(Sales[SalesAmount])',
        'Table tools > New column, enter the Share Col formula below',
        'Format Share Col as Percentage',
      ],
      code: `Wrong Col = SUM ( Sales[SalesAmount] )

Share Col =
DIVIDE ( Sales[SalesAmount], SUM ( Sales[SalesAmount] ) )`,
      result: 'Wrong Col shows 1,86,500 on every row; Share Col shows each order share (53.62%, 2.68%, 12.87%, 26.81%, 4.02%).',
      explanation:
        'In a calculated column, Sales[SalesAmount] reads the current row (row context), but SUM ignores row context and sees the whole table. That behaviour is useful for Share Col but wrong if you wanted a per-row value. Note: calculated columns do not react to slicers.',
    },
    {
      title: 'ALLSELECTED: share of the visible total',
      scenario: 'A City slicer selects Pune and Mumbai only. The manager wants each category share of the selected cities, not of all cities.',
      table: {
        headers: ['Category', 'Total Sales (Pune+Mumbai)', '% of Selected'],
        rows: [
          ['Electronics', '1,00,000', '73.26%'],
          ['Accessories', '12,500', '9.16%'],
          ['Furniture', '24,000', '17.58%'],
          ['Total', '1,36,500', '100.00%'],
        ],
      },
      steps: [
        'Add a slicer with Customer[City] and select Pune and Mumbai',
        'Modeling > New measure and enter the measure below',
        'Add it to the category table and format as Percentage',
      ],
      code: `% of Selected =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALLSELECTED ( Product[Category] ) )
)`,
      result: 'Shares add up to 100% of 1,36,500 (Pune 1,24,000 + Mumbai 12,500). Order 1004 (Nagpur) is excluded by the slicer.',
      explanation:
        'ALLSELECTED removes the Category filter from the row but keeps filters coming from outside the visual (the City slicer), so the denominator is the visual total.',
    },
  ],
  interview: [
    {
      q: 'What is evaluation context in DAX?',
      a: 'It is the environment in which a DAX expression is computed. It has two parts: filter context (the filters active on tables, from visuals, slicers, filters and CALCULATE) and row context (the current row during iteration in a calculated column or iterator).',
      level: 'Easy',
    },
    {
      q: 'Does row context filter data?',
      a: 'No. Row context only lets you read the values of the current row. Aggregations such as SUM ignore it. Row context becomes a filter only through context transition, which happens when CALCULATE is called (or a measure is referenced) inside a row context.',
      level: 'Medium',
    },
    {
      q: 'Why does SUM(Sales[SalesAmount]) in a calculated column return the same value on every row?',
      a: 'Calculated columns have row context but no report filter context. SUM does not use row context, so it aggregates the entire column, giving the grand total on each row.',
      level: 'Medium',
    },
    {
      q: 'Name the sources of filter context in a report.',
      a: 'Rows/columns/axis/legend of visuals, slicers, visual/page/report filters in the Filters pane, cross-filtering/highlighting from other visuals, drillthrough filters, RLS, and CALCULATE/CALCULATETABLE filter arguments inside formulas.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between ALL and ALLSELECTED?',
      a: 'ALL removes every filter from the given table or columns, so you get the grand total regardless of slicers. ALLSELECTED removes filters coming from inside the visual (rows/columns) but keeps filters from outside (slicers, page filters), so you get the visible total.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a matrix row shows correct values but the total row looks wrong. Why?',
      a: 'The total is not the sum of rows; it is the same measure evaluated in a wider filter context (without the row field). Measures with IF conditions, DISTINCTCOUNT or averages give non-additive totals. If the business wants the sum of rows, rewrite with an iterator, e.g. SUMX(VALUES(Product[Category]), [My Measure]).',
      level: 'Hard',
    },
    {
      q: 'Can a measure refer to Sales[SalesAmount] without an aggregation?',
      a: 'No. A measure is evaluated in filter context with no current row, so a naked column reference is ambiguous and gives an error. You must aggregate (SUM, MAX) or use it inside an iterator that creates row context.',
      level: 'Medium',
    },
    {
      q: 'In a single-direction model, will a filter on Sales[Quantity] filter the Product table?',
      a: 'No. Filters propagate from the one side (Product) to the many side (Sales). To filter Product based on Sales you would use a measure condition, CROSSFILTER inside CALCULATE, or (carefully) a bidirectional relationship.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a measure that shows each City share of total sales, ignoring the City filter but respecting all other filters.',
      hint: 'Remove filters only from Customer[City].',
      solution: `% City Share =
DIVIDE (
    [Total Sales],
    CALCULATE ( [Total Sales], ALL ( Customer[City] ) )
)`,
    },
    {
      task: 'Write a Profit measure using an iterator and explain which context decides the rows and which context decides the current row.',
      hint: 'Use SUMX over Sales with SalesAmount minus Cost.',
      solution: `Profit = SUMX ( Sales, Sales[SalesAmount] - Sales[Cost] )
-- Filter context (visual/slicers) decides which Sales rows are visible.
-- SUMX row context picks each visible row in turn. Sample slice result: 40,500.`,
    },
    {
      task: 'Add a calculated column on Product that shows total quantity sold for that product.',
      hint: 'Row context on Product must become a filter on Sales: use RELATEDTABLE.',
      solution: `Qty Sold = SUMX ( RELATEDTABLE ( Sales ), Sales[Quantity] )
-- Laptop = 3, Mouse = 10, Chair = 4, Keyboard = 5 in the sample slice.`,
    },
    {
      task: 'Create a measure that returns sales for the whole Segment of the current customer, ignoring all other Customer filters.',
      hint: 'ALLEXCEPT keeps only the listed column filters.',
      solution: `Segment Sales =
CALCULATE ( [Total Sales], ALLEXCEPT ( Customer, Customer[Segment] ) )`,
    },
    {
      task: 'Make the total row of a category table equal the sum of rows for a measure High Qty Sales = IF(SUM(Sales[Quantity]) >= 5, [Total Sales]).',
      hint: 'Iterate over the categories.',
      solution: `High Qty Sales (Fixed) =
SUMX (
    VALUES ( Product[Category] ),
    IF ( CALCULATE ( SUM ( Sales[Quantity] ) ) >= 5, [Total Sales] )
)`,
    },
  ],
  quiz: [
    {
      question: 'Which of these creates a row context?',
      options: ['A slicer', 'SUMX', 'The Filters pane', 'A matrix column header'],
      answer: 1,
      explanation: 'Iterators such as SUMX create row context. Slicers, filters and matrix headers create filter context.',
    },
    {
      question: 'A calculated column = SUM(Sales[SalesAmount]) returns...',
      options: ['The current row amount', 'The grand total on every row', 'An error', 'BLANK'],
      answer: 1,
      explanation: 'Row context does not filter, so SUM aggregates the full column.',
    },
    {
      question: 'Which function keeps slicer filters but removes the visual row filter for a % of visible total?',
      options: ['ALL', 'ALLSELECTED', 'VALUES', 'RELATED'],
      answer: 1,
      explanation: 'ALLSELECTED returns the visual total while respecting outside filters such as slicers.',
    },
    {
      question: 'Which function is the only one that can modify filter context (along with CALCULATETABLE)?',
      options: ['FILTER', 'SUMX', 'CALCULATE', 'RELATED'],
      answer: 2,
      explanation: 'CALCULATE and CALCULATETABLE evaluate an expression in a modified filter context.',
    },
    {
      question: 'Why can the total row of a matrix differ from the sum of the rows?',
      options: [
        'Power BI rounds totals',
        'The total is evaluated in its own wider filter context',
        'Totals ignore relationships',
        'Totals use row context',
      ],
      answer: 1,
      explanation: 'The total cell evaluates the measure again without the row filter, so non-additive logic gives a different value.',
    },
  ],
};
