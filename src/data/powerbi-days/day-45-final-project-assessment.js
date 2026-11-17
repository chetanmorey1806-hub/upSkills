export default {
  id: 'day-45-final-project-assessment',
  title: 'Final Dashboard Project, Interview Questions, Practical Assessment',
  module: 'Module 8: AI Features & Advanced Integration',
  day: 45,
  level: 'Advanced',
  duration: '5 hours',
  summary:
    'Capstone day: build a complete Sales Performance dashboard end to end with the shared practice model (Power Query, star schema, DAX, visuals, interactivity, RLS, publishing, refresh, app), then test yourself with a timed practical assessment and 25 interview questions covering all eight modules.',
  objectives: [
    'Deliver a complete, published Power BI solution from a business brief',
    'Apply Power Query, modeling, DAX, visualization, security and Service skills together',
    'Document measures and design decisions the way real projects require',
    'Complete a practical assessment and check your answers',
    'Prepare answers for the most common Power BI interview questions across all modules',
  ],
  theory: [
    {
      heading: 'Project brief: Sales Performance Dashboard',
      content:
        "**Client**: a furniture and electronics retailer with customers in Pune, Mumbai, Nagpur and Nashik, Corporate and Retail segments.\n\n**Business questions**\n\n1. How much did we sell, what did it cost and what profit did we make (2023 vs 2024)?\n2. Which categories, products, cities and segments drive sales and profit?\n3. How are sales trending month by month, and how does each month compare with last year?\n4. Who are the top customers and products?\n5. Branch managers must see only their own city.\n\n**Deliverables**\n\n- A .pbix with 3 report pages: **Overview**, **Product & Customer Analysis**, **Order Details** (drillthrough), plus a tooltip page.\n- A published semantic model and report in a workspace, an app for managers, a daily scheduled refresh, RLS by city.\n- A one-page measure dictionary (measure name, formula, meaning).\n\n**Data**: the shared practice model, Sales (fact), Product, Customer, Date (2023-01-01 to 2024-12-31).",
      points: [
        'Time box: 4 hours build + 1 hour assessment.',
        'Success criteria: correct numbers, clean model, fast pages (<2 s per visual), clear design, working security.',
      ],
    },
    {
      heading: 'Build plan: phases 1-4 (data and model)',
      content:
        "1. **Get data** (Module 1): Home > Get data > Text/CSV for each practice CSV (or Excel workbook). Click **Transform Data**, not Load.\n2. **Clean in Power Query** (Module 2): set data types (OrderDate = Date; Quantity = Whole number; UnitPrice, SalesAmount, Cost = Fixed decimal), trim and capitalise text columns (Customer, City), remove blank rows, check Column quality (View > Column quality) for errors and empty values, rename queries to Sales, Product, Customer, Date.\n3. **Model** (Module 3): Model view, create/verify relationships Product[ProductID] → Sales[ProductID], Customer[CustomerID] → Sales[CustomerID], Date[Date] → Sales[OrderDate], all **1-to-many, single direction**. Mark Date as date table (Table tools > Mark as date table). Sort Date[Month] by Date[MonthNo]. Hide foreign keys in Sales. Disable Auto date/time.\n4. **Measures** (Module 4): create a measure table (Home > Enter data, one empty column, name it _Measures, then delete the column after adding measures) and write the core measures listed in the examples. Format each measure (currency, %, whole number) and add descriptions in Model view > Properties.",
      tip: 'Build in this order and do not start visuals until numbers are verified in a simple table visual. Wrong numbers in a beautiful chart are still wrong.',
    },
    {
      heading: 'Build plan: phases 5-8 (report and Service)',
      content:
        "5. **Overview page** (Module 5): title text box, 4 KPI cards (Total Sales, Profit, Margin %, Orders) with YoY % as reference labels, line chart Sales and Sales PY by Month, clustered bar Sales by Category, donut or bar Sales by Segment, map or bar by City, slicers for Year and City in a left panel.\n6. **Analysis page**: matrix Category > Product with Sales, Profit, Margin %, Rank; conditional formatting (data bars on Sales, background colour on Margin %); Top N customer bar chart; decomposition tree (Module 8) on Total Sales by City, Segment, Category.\n7. **Interactivity and advanced** (Modules 5-6): drillthrough page Order Details (drillthrough field Product[Product] and Customer[Customer]), report page tooltip showing monthly trend, bookmarks + buttons to switch between chart and table view, field parameter to switch the bar chart axis (Category/City/Segment), dynamic titles, Performance Analyzer check.\n8. **Secure and deploy** (Modules 6-7): RLS role City Manager (dynamic with an extra UserAccess table), test with View as; publish to workspace; set credentials and scheduled refresh (gateway if the source is on-premises); assign RLS members; create an app with audiences; set a subscription for the director.",
    },
    {
      heading: 'Design checklist',
      content:
        "- **Layout**: KPIs top-left (people read top-left first), trend in the middle, breakdowns below, slicers in one consistent panel.\n- **Consistency**: one theme (View > Themes), same colour for the same category on every page, 2-3 fonts sizes only.\n- **Numbers**: thousands separators, % with 1-2 decimals, display units (K, Lakh/M) consistent.\n- **Accessibility**: alt text on visuals (Format > General > Alt text), enough colour contrast, tab order (View > Selection > Tab order).\n- **Performance**: fewer than ~12 visuals per page, no unused visuals, measures optimised (Day 38).\n- **Documentation**: measure descriptions, display folders, a hidden 'About' page with data sources and refresh time.",
    },
    {
      heading: 'Practical assessment: rules',
      content:
        "The assessment (in the Practice section) has 10 tasks worth 10 marks each. Work in a copy of your project file.\n\n1. Read each task fully before starting.\n2. Write measures in the DAX Lab or Desktop; check the result against the sample values given.\n3. For Service tasks, write the exact menu steps.\n4. After finishing, open each solution and mark yourself. 70+ = job-ready for a fresher analyst role; 50-69 = revise the weak module; below 50 = redo Modules 4 and 6.\n\nThe sample values in this lesson use a 5-order slice of the practice data (orders 1001-1005: Laptop 2 x 50,000 to Asha/Pune on 15-Jan-2024; Mouse 10 x 500 to Ravi/Mumbai on 20-Jan-2024; Chair 4 x 6,000 to Asha/Pune on 10-Feb-2024; Laptop 1 x 50,000 to Neha/Nagpur on 05-Mar-2024; Keyboard 5 x 1,500 to Ravi/Mumbai on 18-Mar-2024). Totals: Sales 1,86,500, Cost 1,46,000, Profit 40,500. On the full dataset your numbers will be larger.",
    },
    {
      heading: 'How to answer interview questions',
      content:
        "Interviewers for Power BI roles check three things: concepts, hands-on experience and communication.\n\n- Use the **define - example - when to use** pattern: 'A measure is... For example Total Sales = SUM(...). I use measures for aggregations that react to filters, and calculated columns only for row-level attributes I need to slice by.'\n- For scenario questions use **STAR** (Situation, Task, Action, Result) and mention numbers: 'reduced model size from 480 MB to 120 MB'.\n- Be honest about licensing and features; mention current names (semantic model, Fabric, Copilot).\n- Bring this capstone as a portfolio project: explain the business questions, model diagram, 3 key measures and how you secured it.",
    },
  ],
  examples: [
    {
      title: 'Phase 2: Clean the Sales and Customer queries',
      scenario: 'Customer names and cities come with extra spaces and mixed case; Sales amounts are text.',
      table: {
        headers: ['Column', 'Before', 'After'],
        rows: [
          ['Customer[City]', '"  pune "', 'Pune'],
          ['Customer[Customer]', '"asha  "', 'Asha'],
          ['Sales[SalesAmount]', '"100000" (text)', '100000 (Fixed decimal)'],
          ['Sales[OrderDate]', '"2024-01-15" (text)', '15-01-2024 (Date)'],
        ],
      },
      steps: [
        'Home > Transform data',
        'Customer query: select Customer and City > Transform > Format > Trim, then Format > Capitalize Each Word',
        'Sales query: select OrderDate > Data type: Date; Quantity > Whole number; UnitPrice, SalesAmount, Cost > Fixed decimal number',
        'View > Column quality and Column profile: confirm 0% errors and 0% empty in key columns',
        'Home > Close & Apply',
      ],
      code: `// Customer query (key steps)
Trimmed = Table.TransformColumns ( Source, {{"Customer", Text.Trim, type text}, {"City", Text.Trim, type text}} ),
Proper  = Table.TransformColumns ( Trimmed, {{"Customer", Text.Proper, type text}, {"City", Text.Proper, type text}} )

// Sales query (types)
Typed = Table.TransformColumnTypes ( Source,
    {{"OrderDate", type date}, {"Quantity", Int64.Type}, {"UnitPrice", Currency.Type},
     {"SalesAmount", Currency.Type}, {"Cost", Currency.Type}} )`,
      result: 'Four clean cities (Pune, Mumbai, Nagpur, Nashik) and numeric/date columns ready for modeling.',
      explanation: 'Clean text prevents duplicate slicer items ("pune" vs "Pune"); correct types allow aggregation and time intelligence.',
    },
    {
      title: 'Phase 3: Star schema and Date table',
      scenario: 'Set up relationships and a proper date table (DAX version if your data has no Date table).',
      table: {
        headers: ['From (one side)', 'To (many side)', 'Cardinality', 'Direction'],
        rows: [
          ['Product[ProductID]', 'Sales[ProductID]', '1:*', 'Single'],
          ['Customer[CustomerID]', 'Sales[CustomerID]', '1:*', 'Single'],
          ["'Date'[Date]", 'Sales[OrderDate]', '1:*', 'Single'],
        ],
      },
      steps: [
        'If no Date table exists: Modeling > New table and paste the DAX below',
        'Model view: drag Product[ProductID] onto Sales[ProductID]; repeat for Customer and Date; check 1:* and Single in Properties',
        "Select the Date table > Table tools > Mark as date table > Date column: Date > Save",
        "Select Date[Month] > Column tools > Sort by column > MonthNo",
        'Hide Sales[ProductID], Sales[CustomerID] (right-click > Hide in report view)',
        'File > Options and settings > Options > Current file > Data load > clear Auto date/time',
      ],
      code: `Date =
ADDCOLUMNS (
    CALENDAR ( DATE ( 2023, 1, 1 ), DATE ( 2024, 12, 31 ) ),
    "Year", YEAR ( [Date] ),
    "MonthNo", MONTH ( [Date] ),
    "Month", FORMAT ( [Date], "MMM" ),
    "Quarter", "Q" & QUARTER ( [Date] ),
    "YearMonth", FORMAT ( [Date], "YYYY-MM" )
)`,
      result: 'A star schema: Sales in the centre, three dimensions around it; months sort Jan to Dec.',
      explanation: 'Single-direction 1:* relationships from dimensions to the fact table give predictable filtering and best performance; a marked date table enables time intelligence.',
    },
    {
      title: 'Phase 4: Core KPI measures',
      scenario: 'Create the measure set used across all pages.',
      table: {
        headers: ['Measure', 'Sample slice result'],
        rows: [
          ['Total Sales', '1,86,500'],
          ['Total Cost', '1,46,000'],
          ['Profit', '40,500'],
          ['Margin %', '21.72%'],
          ['Orders', '5'],
          ['Avg Order Value', '37,300'],
          ['Customers', '3'],
        ],
      },
      steps: [
        'Select the _Measures table > Modeling > New measure for each formula below',
        'Format: Total Sales, Total Cost, Profit, Avg Order Value = Currency/whole number; Margin % = Percentage 2 decimals; Orders, Customers = Whole number',
        'Model view > select each measure > Properties > Description: write the business meaning',
        'Check all values in a Table visual against the sample results',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )
Total Cost = SUM ( Sales[Cost] )
Profit = [Total Sales] - [Total Cost]
Margin % = DIVIDE ( [Profit], [Total Sales] )
Orders = DISTINCTCOUNT ( Sales[OrderID] )
Avg Order Value = DIVIDE ( [Total Sales], [Orders] )
Customers = DISTINCTCOUNT ( Sales[CustomerID] )`,
      result: 'Matches the table: e.g. Avg Order Value = 1,86,500 / 5 = 37,300.',
      explanation: 'Small base measures are reused by bigger ones, so a fix in Total Sales flows everywhere.',
    },
    {
      title: 'Phase 4: Time intelligence and ranking measures',
      scenario: 'Trend, YoY and ranking measures for the Overview and Analysis pages.',
      table: {
        headers: ['Product', 'Total Sales', 'Product Rank'],
        rows: [
          ['Laptop', '1,50,000', '1'],
          ['Chair', '24,000', '2'],
          ['Keyboard', '7,500', '3'],
          ['Mouse', '5,000', '4'],
        ],
      },
      steps: [
        'Modeling > New measure for each formula below',
        'Build a matrix: Rows Product[Product]; Values Total Sales, Product Rank',
        'Build a line chart: X-axis Date[Month] (with a Year slicer), Y-axis Total Sales and Sales PY',
        'Add YoY % as the reference label of the Total Sales card (Format > Reference labels)',
      ],
      code: `Sales YTD = TOTALYTD ( [Total Sales], 'Date'[Date] )
Sales PY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
YoY % =
VAR Curr = [Total Sales]
VAR PY = [Sales PY]
RETURN IF ( NOT ISBLANK ( PY ), DIVIDE ( Curr - PY, PY ) )

Product Rank =
IF (
    HASONEVALUE ( Product[Product] ),
    RANKX ( ALL ( Product[Product] ), [Total Sales], , DESC, DENSE )
)

Top 3 Products Sales =
CALCULATE (
    [Total Sales],
    TOPN ( 3, ALL ( Product[Product] ), [Total Sales], DESC )
)`,
      result: 'Ranks Laptop 1, Chair 2, Keyboard 3, Mouse 4. Top 3 Products Sales = 1,50,000 + 24,000 + 7,500 = 1,81,500. Sales YTD at March 2024 = 1,86,500. Sales PY is blank on the sample slice because it has no 2023 rows.',
      explanation: 'RANKX over ALL products ranks each product against all others; HASONEVALUE blanks the total row. YoY % returns blank instead of a misleading value when there is no prior year.',
    },
    {
      title: 'Phase 5-7: Build the Overview page',
      scenario: 'Assemble the main dashboard page with interactivity.',
      table: {
        headers: ['Area', 'Visual', 'Fields'],
        rows: [
          ['Top row', '4 Cards', 'Total Sales, Profit, Margin %, Orders (reference label YoY %)'],
          ['Left panel', 'Slicers', "'Date'[Year] (tile), Customer[City] (dropdown), Customer[Segment]"],
          ['Middle', 'Line chart', 'X: Date[Month]; Y: Total Sales, Sales PY'],
          ['Bottom left', 'Bar chart + field parameter', 'Y: Axis Choice (Category/City/Segment); X: Total Sales'],
          ['Bottom right', 'Donut', 'Legend: Customer[Segment]; Values: Total Sales'],
        ],
      },
      steps: [
        'View > Themes > choose a theme (or Browse for a JSON theme)',
        'Insert > Text box: Sales Performance Dashboard',
        'Add the four cards; Format > Callout value display units: Thousands or None',
        'Add slicers and the line chart; set Format > Lines colours for Sales vs Sales PY',
        'Modeling > New parameter > Fields: Axis Choice with Category, City, Segment; build the bar chart on it',
        'Chart title > fx > Field value > Chart Title measure (Day 36)',
        'Format > Edit interactions: make the Year slicer filter all visuals',
        'Optimize > Performance analyzer > Start recording > Refresh visuals: confirm each visual loads quickly',
      ],
      code: `Chart Title =
"Total Sales by "
    & SWITCH ( SELECTEDVALUE ( 'Axis Choice'[Axis Choice Order] ),
        0, "Category", 1, "City", 2, "Segment", "Field" )
    & " - " & SELECTEDVALUE ( 'Date'[Year], "All Years" )`,
      result: 'A one-screen overview that answers questions 1-3 of the brief, with slicers and dynamic titles.',
      explanation: 'KPIs first, trend second, breakdowns last follows how managers read a page. The field parameter saves building three separate charts.',
    },
    {
      title: 'Phase 8: Secure, publish and distribute',
      scenario: 'Branch managers must see only their city; the director gets a daily email.',
      table: {
        headers: ['Task', 'Where'],
        rows: [
          ['Dynamic RLS role City Manager', 'Desktop: Modeling > Manage roles'],
          ['Test as Pune manager', 'Desktop: Modeling > View as > Other user'],
          ['Publish', 'Desktop: Home > Publish > workspace'],
          ['Credentials + refresh', 'Service: semantic model > Settings'],
          ['Role members', 'Service: semantic model > Security'],
          ['App with audiences', 'Service: workspace > Create app'],
          ['Director subscription', 'Service: report > Subscribe to report'],
        ],
      },
      steps: [
        'Home > Enter data: UserAccess (Email, City) extra table; keep it disconnected',
        'Modeling > Manage roles > New: City Manager; Customer filter and UserAccess filter (code below) > Save',
        'Modeling > View as > Other user asha.manager@contoso.com + City Manager: total shows 1,24,000',
        'Home > Publish > Sales Analytics workspace',
        'Service: semantic model > Settings > Data source credentials; Refresh > daily 06:00 (Pro: up to 8/day) > Apply',
        'Semantic model > Security > City Manager > add the managers security group > Save',
        'Workspace > Create app > Content and Audience (Managers, Leadership) > Publish app',
        'Report > Subscribe to report > Standard, weekdays 09:00, PDF attachment, recipient director',
      ],
      code: `-- Role: City Manager   Table: Customer
[City] IN CALCULATETABLE (
    VALUES ( UserAccess[City] ),
    UserAccess[Email] = USERPRINCIPALNAME ()
)
-- Role: City Manager   Table: UserAccess
[Email] = USERPRINCIPALNAME ()`,
      result: 'Managers (Viewer/app users) see only their city; the director receives the PDF each weekday; data refreshes daily.',
      explanation: 'RLS is enforced for read-only users; apps give a clean consumer experience; scheduled refresh keeps imported data current.',
    },
  ],
  interview: [
    {
      q: '[Module 1] What is Power BI and what are its main components?',
      a: 'A Microsoft business analytics platform (now part of Microsoft Fabric) to connect, transform, model and visualise data. Components: Power BI Desktop (build), Power BI Service (publish, share, refresh), Power BI Mobile, on-premises data gateway, Power BI Report Server, and Power BI Embedded.',
      level: 'Easy',
    },
    {
      q: '[Module 1] Report vs dashboard?',
      a: 'A report has one or more interactive pages built on one semantic model, created in Desktop or the Service. A dashboard is a single-page canvas in the Service with tiles pinned from one or more reports/semantic models; it has limited interactivity and supports data alerts on tiles.',
      level: 'Easy',
    },
    {
      q: '[Module 1] What is a semantic model?',
      a: 'The new name for a dataset: the tables, relationships, measures, hierarchies, security roles and (in Import) the data that reports query.',
      level: 'Easy',
    },
    {
      q: '[Module 2] What is Power Query and what language does it use?',
      a: 'Power Query is the data connection and transformation (ETL) engine in Power BI and Excel. Every step is recorded in the M language, visible in the formula bar and Advanced Editor.',
      level: 'Easy',
    },
    {
      q: '[Module 2] Append vs Merge queries?',
      a: 'Append stacks rows of tables with the same columns (like UNION). Merge joins tables side by side on matching key columns (like SQL JOIN) with join kinds Left outer, Right outer, Full outer, Inner, Left anti, Right anti.',
      level: 'Easy',
    },
    {
      q: '[Module 2] When do you unpivot data?',
      a: 'When values are spread across columns (Jan, Feb, Mar as columns). Unpivot converts them into attribute/value rows (Month, Sales), which is the shape Power BI models and DAX work best with.',
      level: 'Medium',
    },
    {
      q: '[Module 3] Explain star schema and why Power BI prefers it.',
      a: 'A central fact table (numeric events like Sales) linked by 1-to-many relationships to dimension tables (Product, Customer, Date). It is simple to understand, filters flow predictably from dimensions to facts, compresses well and gives fast, correct DAX.',
      level: 'Medium',
    },
    {
      q: '[Module 3] What are active and inactive relationships?',
      a: 'Only one active relationship can exist between two tables; others are inactive (dotted line). Inactive ones are used in specific measures with USERELATIONSHIP inside CALCULATE, e.g. sales by ShipDate.',
      level: 'Medium',
    },
    {
      q: '[Module 3] Why should cross filter direction usually be single?',
      a: 'Bidirectional filtering can create ambiguity, unexpected results and slower queries. Use it only when needed (e.g. some many-to-many cases), or use CROSSFILTER in a specific measure.',
      level: 'Medium',
    },
    {
      q: '[Module 4] Calculated column vs measure?',
      a: 'A calculated column is computed row by row at refresh and stored (uses memory, has row context, usable in slicers/axes). A measure is computed at query time in the filter context of each visual cell (no storage, used for aggregations).',
      level: 'Easy',
    },
    {
      q: '[Module 4] What does CALCULATE do?',
      a: 'It evaluates an expression in a modified filter context: adds, replaces or removes filters (with ALL/REMOVEFILTERS/KEEPFILTERS/USERELATIONSHIP), and performs context transition when used in row context.',
      level: 'Medium',
    },
    {
      q: '[Module 4] SUM vs SUMX?',
      a: 'SUM aggregates a single column. SUMX iterates a table row by row, evaluates an expression per row (e.g. Quantity * UnitPrice) and sums the results.',
      level: 'Easy',
    },
    {
      q: '[Module 4] Why use DIVIDE instead of the / operator?',
      a: 'DIVIDE handles division by zero or blank safely, returning BLANK or an alternate result, and is easier to read than IF checks.',
      level: 'Easy',
    },
    {
      q: '[Module 4] What do you need for time intelligence functions to work correctly?',
      a: 'A proper date table with continuous dates covering full years, marked as a date table (or related on a Date-type column), related to the fact table, and functions referencing the date table column, e.g. SAMEPERIODLASTYEAR(\'Date\'[Date]).',
      level: 'Medium',
    },
    {
      q: '[Module 5] How do you choose the right visual?',
      a: 'By the question: comparison (bar/column), trend over time (line/area), part-to-whole with few parts (donut/treemap/stacked bar), relationship (scatter), single KPI (card/KPI), detail (table/matrix), geography (map), process stages (funnel).',
      level: 'Easy',
    },
    {
      q: '[Module 5] Drill down vs drillthrough?',
      a: 'Drill down moves to a lower level of a hierarchy within the same visual (Year > Quarter > Month). Drillthrough navigates to another page filtered by the selected item (e.g. right-click a product > Drill through > Product Details).',
      level: 'Medium',
    },
    {
      q: '[Module 5] What are bookmarks used for?',
      a: 'To capture a page state (filters, slicers, visibility of visuals, sort) and restore it with a button: toggling chart/table views, guided storytelling, resetting filters, showing info panels.',
      level: 'Easy',
    },
    {
      q: '[Module 6] Explain row context and filter context.',
      a: 'Filter context is the set of filters active on a calculation (visual, slicers, CALCULATE). Row context is the current row during iteration in a calculated column or iterator. Row context does not filter by itself; CALCULATE converts it into filter context (context transition).',
      level: 'Hard',
    },
    {
      q: '[Module 6] How do you implement dynamic RLS?',
      a: 'Create a mapping table (Email, City/Region), a role with a DAX filter comparing it to USERPRINCIPALNAME(), test with View as > Other user, publish and add users/groups to the role in the semantic model Security page. RLS applies to Viewers and read-only users.',
      level: 'Hard',
    },
    {
      q: '[Module 6] A report is slow. What are your steps?',
      a: 'Use Performance Analyzer to find slow visuals; analyse queries in DAX query view/DAX Studio; optimise DAX (variables, column filters, iterate dimensions); reduce model size (remove columns, lower cardinality, disable Auto date/time, star schema); reduce visuals per page; check storage mode and query folding.',
      level: 'Hard',
    },
    {
      q: '[Module 6] What is a field parameter?',
      a: 'A Modeling > New parameter > Fields feature that creates a table with NAMEOF references so users can switch which columns or measures a visual uses through a slicer.',
      level: 'Medium',
    },
    {
      q: '[Module 7] What licence do users need to view shared reports?',
      a: 'Pro (or PPU for PPU workspaces), unless the workspace is on a Fabric F64 or larger capacity (or legacy Premium P), where Free users can view.',
      level: 'Medium',
    },
    {
      q: '[Module 7] Scheduled refresh limits and gateway types?',
      a: 'Pro: 8 refreshes/day, 2-hour timeout. PPU/Premium/Fabric capacity: 48/day via UI, 5-hour timeout. Gateways: standard on-premises (shared, Import + DirectQuery), personal mode (one user, Import only), and VNet data gateway for Azure VNet sources (capacity required).',
      level: 'Medium',
    },
    {
      q: '[Module 7] Workspace roles?',
      a: 'Admin (full control), Member (edit, share, manage members below admin, publish app), Contributor (create/edit/publish content, schedule refresh), Viewer (read-only; RLS applies).',
      level: 'Easy',
    },
    {
      q: '[Module 8] What do Key influencers and Decomposition tree do?',
      a: 'Key influencers ranks factors that increase/decrease a metric using statistical models; Decomposition tree breaks a measure down across dimensions interactively with optional AI splits for root-cause analysis.',
      level: 'Medium',
    },
    {
      q: '[Module 8] How do you check query folding when connecting to SQL Server?',
      a: 'Right-click a Power Query step > View Native Query (enabled means it folds) or use step folding indicators. Keep foldable steps first, avoid steps that break folding, and use Value.NativeQuery with EnableFolding = true for custom SQL.',
      level: 'Hard',
    },
    {
      q: '[Scenario] Tell me about a dashboard you built.',
      a: 'Use STAR: Situation (retailer needed sales visibility by city and category), Task (build a secure dashboard), Action (cleaned data in Power Query, star schema with Date table, 15 measures including YoY and ranking, 3 pages with drillthrough and field parameters, dynamic RLS, app and daily refresh), Result (managers stopped manual Excel reports, saving hours each week; page load under 2 seconds).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Assessment Q1 (Power Query, 10 marks): The City column contains "pune", " Pune ", "PUNE". Write the steps to standardise it and the M code.',
      hint: 'Trim then Capitalize Each Word.',
      solution: `Steps: select City > Transform > Format > Trim; Transform > Format > Capitalize Each Word.
Clean = Table.TransformColumns ( Source, {{"City", each Text.Proper ( Text.Trim ( _ ) ), type text}} )`,
    },
    {
      task: 'Assessment Q2 (Modeling, 10 marks): Sales has OrderDate and ShipDate (extra column). Create the relationships and a measure for sales by ship date.',
      hint: 'One active, one inactive relationship; USERELATIONSHIP.',
      solution: `Date[Date] -> Sales[OrderDate] active; Date[Date] -> Sales[ShipDate] inactive (dotted).
Sales by Ship Date =
CALCULATE ( [Total Sales], USERELATIONSHIP ( 'Date'[Date], Sales[ShipDate] ) )`,
    },
    {
      task: 'Assessment Q3 (DAX, 10 marks): Write Electronics Sales and Electronics share of total sales. Give sample-slice answers.',
      hint: 'CALCULATE with a column filter; DIVIDE with ALL.',
      solution: `Electronics Sales = CALCULATE ( [Total Sales], Product[Category] = "Electronics" )
Electronics Share = DIVIDE ( [Electronics Sales], CALCULATE ( [Total Sales], ALL ( Product ) ) )
-- Sample: 1,50,000 and 80.43%`,
    },
    {
      task: 'Assessment Q4 (DAX, 10 marks): Count customers who placed more than one order. Sample answer?',
      hint: 'FILTER customers with DISTINCTCOUNT of OrderID > 1.',
      solution: `Repeat Customers =
COUNTROWS (
    FILTER ( VALUES ( Customer[CustomerID] ),
        CALCULATE ( DISTINCTCOUNT ( Sales[OrderID] ) ) > 1 )
)
-- Sample: 2 (Asha has 1001, 1003; Ravi has 1002, 1005; Neha has only 1004)`,
    },
    {
      task: 'Assessment Q5 (Time intelligence, 10 marks): Write Sales MTD, Sales QTD and Sales previous month. What is Sales QTD at 31-Mar-2024 in the sample?',
      hint: 'TOTALMTD, TOTALQTD, PREVIOUSMONTH.',
      solution: `Sales MTD = TOTALMTD ( [Total Sales], 'Date'[Date] )
Sales QTD = TOTALQTD ( [Total Sales], 'Date'[Date] )
Sales PM = CALCULATE ( [Total Sales], PREVIOUSMONTH ( 'Date'[Date] ) )
-- QTD at 31-Mar-2024 = 1,05,000 + 24,000 + 57,500 = 1,86,500; Sales PM for March = 24,000`,
    },
    {
      task: 'Assessment Q6 (Visualization, 10 marks): Design a page that answers "Which city and category combination is most profitable?" List visuals and fields.',
      hint: 'Matrix with conditional formatting, plus a decomposition tree.',
      solution: 'Matrix: Rows Customer[City], Columns Product[Category], Values [Profit] with background colour scale (Format > Cell elements > Background color > fx, gradient). Add a decomposition tree Analyze [Profit], Explain by City, Category. Sample: Pune-Electronics 20,000 is highest.',
    },
    {
      task: 'Assessment Q7 (Advanced, 10 marks): Create a what-if parameter for discount (0-30%) and a measure for profit after discount. Sample result at 10%?',
      hint: 'Discount reduces sales, not cost.',
      solution: `Discount = GENERATESERIES ( 0, 0.3, 0.05 )
Discount Value = SELECTEDVALUE ( Discount[Discount], 0 )
Profit After Discount = [Total Sales] * ( 1 - [Discount Value] ) - [Total Cost]
-- At 10%: 1,67,850 - 1,46,000 = 21,850`,
    },
    {
      task: 'Assessment Q8 (Security, 10 marks): Create static RLS for Nagpur and state the expected total. Who will still see all data?',
      hint: 'Filter on Customer[City].',
      solution: `Role Nagpur, table Customer: [City] = "Nagpur"
-- Expected Total Sales = 50,000 (order 1004).
-- Workspace Admins, Members and Contributors still see all data; RLS applies to Viewers / read-only users.`,
    },
    {
      task: 'Assessment Q9 (Service, 10 marks): Source is an on-premises SQL Server. List the steps to get a daily 7 AM refresh working for a Pro workspace.',
      hint: 'Gateway, connection, mapping, schedule.',
      solution: '1. Install standard on-premises data gateway on an always-on server and register it. 2. Settings > Manage connections and gateways > New > On-premises > SQL Server connection with matching server/database and credentials. 3. Publish. 4. Semantic model > Settings > Gateway and cloud connections > map to the connection > Apply. 5. Refresh > Configure schedule Daily 07:00 with time zone, failure notifications > Apply (Pro allows up to 8/day).',
    },
    {
      task: 'Assessment Q10 (Performance, 10 marks): Rewrite this slow measure and explain why it is faster: CALCULATE([Total Sales], FILTER(Sales, RELATED(Customer[Segment]) = "Corporate")).',
      hint: 'Filter the dimension column directly.',
      solution: `Corporate Sales = CALCULATE ( [Total Sales], Customer[Segment] = "Corporate" )
-- Sample: 1,74,000. It filters one small dimension column, which flows to Sales through the relationship,
-- instead of iterating every Sales row and calling RELATED per row.`,
    },
  ],
  quiz: [
    {
      question: 'In the capstone model, which direction do filters flow?',
      options: ['Sales to Product', 'Product, Customer and Date to Sales', 'Both directions everywhere', 'No filters flow'],
      answer: 1,
      explanation: 'Single-direction 1-to-many relationships filter from dimensions to the fact table.',
    },
    {
      question: 'Avg Order Value on the sample slice (Sales 1,86,500; 5 orders) is...',
      options: ['18,650', '37,300', '62,166.67', '40,500'],
      answer: 1,
      explanation: '1,86,500 / 5 = 37,300.',
    },
    {
      question: 'Which feature lets one bar chart switch between Category, City and Segment?',
      options: ['Bookmarks', 'Field parameter', 'What-if parameter', 'Drillthrough'],
      answer: 1,
      explanation: 'Field parameters swap the field used on the axis.',
    },
    {
      question: 'Branch managers should get the report with only their city. Best combination?',
      options: [
        'Share the pbix by email',
        'Dynamic RLS + app with Viewer access',
        'Publish to web',
        'Give them Contributor role',
      ],
      answer: 1,
      explanation: 'RLS filters data for read-only users; apps distribute content cleanly. Contributors bypass RLS.',
    },
    {
      question: 'Which tool do you use first to find a slow visual?',
      options: ['Q&A', 'Performance Analyzer', 'Smart narrative', 'Manage roles'],
      answer: 1,
      explanation: 'Performance Analyzer measures each visual\'s query and render time.',
    },
  ],
};
