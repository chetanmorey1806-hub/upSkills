export default {
  id: 'end-to-end-project',
  title: 'End-to-End Project & Career Prep (Sales Dashboard, Storytelling, Interviews, PL-300)',
  level: 'Advanced',
  day: 18,
  duration: '8 hours',
  summary:
    "Put everything together: build a complete Sales dashboard from business requirements to a published, secured, refreshed app. Then prepare for the job market with KPI design, data storytelling, a portfolio strategy, scenario-based interview questions and an overview of the PL-300 Power BI Data Analyst exam.",
  objectives: [
    'Gather requirements and translate business questions into KPIs, measures and pages',
    'Build a complete Sales solution: Power Query, star schema, Date table, DAX measures, report pages, interactivity',
    'Publish, configure refresh, RLS and an app in the Power BI Service',
    'Present insights with data storytelling techniques',
    'Build a portfolio that impresses recruiters',
    'Answer scenario-based interview questions and plan for the PL-300 exam',
  ],
  theory: [
    {
      heading: 'Step 1 - Requirements gathering',
      content:
        "Every successful dashboard starts with questions, not visuals. Meet stakeholders and document:\n\n- **Audience** - who uses it (CEO, regional managers, sales reps) and how often (daily monitoring vs monthly review).\n- **Business questions** - e.g. 'Are we on track vs target?', 'Which products and regions drive growth?', 'Which customers are we losing?'\n- **KPIs and definitions** - exactly how Sales, Profit, Margin, Orders, AOV, Customer retention are calculated (gross vs net, returns, currency, tax).\n- **Granularity and history** - daily? 3 years?\n- **Data sources** - ERP SQL database, CRM, Excel targets; owners and access.\n- **Security** - who sees what (regional managers see their region).\n- **Refresh frequency** - daily at 7 AM? near real-time?\n- **Delivery** - app, Teams, email subscription, mobile.\n\nOutput: a short **requirements document** and a **wireframe/mock-up** (PowerPoint or paper sketch) agreed with stakeholders before building.",
      tip: "In interviews, describing your requirements process shows maturity: 'Before building, I clarified the KPI definitions with Finance because Sales meant different things to different teams.'",
    },
    {
      heading: 'Step 2 - Data preparation in Power Query',
      content:
        "Connect to sources and shape them into clean tables:\n\n- Use **parameters** for server/database names (easy to switch Dev/Prod).\n- **Staging queries** (disable load) for raw sources; reference them for final tables.\n- Remove unneeded columns early; set correct **data types**; trim/clean text; handle nulls and errors; standardise codes (country names).\n- **Merge** to bring attributes (e.g. Subcategory into Product) and **Append** for multiple files/years.\n- Keep **query folding** for big sources; check View Native Query.\n- Use **Column quality / distribution / profile** to spot issues (View tab, profile entire dataset).\n- Name queries and steps clearly (Sales, Product, Customer, Date, Targets).",
    },
    {
      heading: 'Step 3 - Data model (star schema) and Date table',
      content:
        "Design a **star schema**:\n- **Fact**: Sales (OrderID, OrderDate, ShipDate, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost) and Targets (Month, Category, TargetAmount).\n- **Dimensions**: Product, Customer, Date.\n\nRelationships: one-to-many, single direction, integer keys where possible. A dedicated **Date table** (CALENDAR/CALENDARAUTO in DAX or Power Query) marked as date table, with Year, Quarter, Month, MonthNumber, YearMonth, fiscal columns if needed; disable **Auto date/time**.\n\nHide foreign keys and technical columns; create a **measures table** (Enter data > empty table named _Measures) and display folders; set formats and descriptions on measures.",
      syntax:
        "Date =\nADDCOLUMNS (\n    CALENDAR ( DATE ( 2022, 1, 1 ), DATE ( 2025, 12, 31 ) ),\n    \"Year\", YEAR ( [Date] ),\n    \"Quarter\", \"Q\" & QUARTER ( [Date] ),\n    \"MonthNumber\", MONTH ( [Date] ),\n    \"MonthName\", FORMAT ( [Date], \"MMM\" ),\n    \"YearMonth\", FORMAT ( [Date], \"YYYY-MM\" ),\n    \"YearMonthKey\", YEAR ( [Date] ) * 100 + MONTH ( [Date] )\n)",
    },
    {
      heading: 'Step 4 - KPI design and DAX measures',
      content:
        "A good KPI is **relevant** to a decision, **clearly defined**, **comparable** (vs target, vs last year, vs average) and **actionable**. Show each KPI with context: a number alone ('Sales 1.2M') means little; 'Sales 1.2M, +8% vs LY, 96% of target' tells a story.\n\nBuild measures in layers:\n1. **Base**: Total Sales, Total Cost, Total Profit, Orders, Customers, Quantity.\n2. **Ratios**: Profit Margin %, Avg Order Value.\n3. **Time intelligence**: Sales LY, YoY %, Sales YTD, Sales MTD, rolling 12 months.\n4. **Targets**: Target, Achievement %, Variance.\n5. **Advanced**: New customers, Top N, ranking, dynamic segmentation.\n6. **UX measures**: dynamic titles, colour measures for conditional formatting.",
      syntax:
        'Total Sales = SUM ( Sales[SalesAmount] )\nTotal Cost = SUM ( Sales[Cost] )\nTotal Profit = [Total Sales] - [Total Cost]\nProfit Margin % = DIVIDE ( [Total Profit], [Total Sales] )\nOrders = DISTINCTCOUNT ( Sales[OrderID] )\nAvg Order Value = DIVIDE ( [Total Sales], [Orders] )\nSales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nSales YoY % = DIVIDE ( [Total Sales] - [Sales LY], [Sales LY] )\nSales YTD = TOTALYTD ( [Total Sales], \'Date\'[Date] )\nTarget = SUM ( Targets[TargetAmount] )\nAchievement % = DIVIDE ( [Total Sales], [Target] )',
    },
    {
      heading: 'Step 5 - Report design and storytelling',
      content:
        "Typical page structure for a Sales solution:\n1. **Executive Overview** - KPI cards (Sales, Profit, Margin %, Orders, Achievement %), monthly trend vs LY/target, sales by category, by region map, top 10 products.\n2. **Product Analysis** - category/subcategory matrix, Pareto (ABC), price vs margin scatter.\n3. **Customer Analysis** - new vs returning, segmentation, top customers, retention.\n4. **Detail / drill-through pages** - Customer Details, Product Details.\n5. **Tooltip pages** for hover detail.\n\n**Data storytelling** principles:",
      points: [
        'Lead with the answer: insight-based titles ("Sales up 8% driven by Bikes in Germany") rather than "Sales by Category"',
        'Context, not just numbers: compare to target, last year, or average',
        'Guide the eye: layout from summary (top-left) to detail (bottom-right); highlight what matters with colour, grey out the rest',
        'One message per visual; remove clutter',
        'Structure a presentation as Situation -> Complication -> Resolution (what happened, why it matters, what to do)',
        'End with recommended actions, not just observations',
      ],
    },
    {
      heading: 'Step 6 - Publish, secure, refresh and distribute',
      content:
        "1. **Publish** to a team workspace (not My workspace).\n2. **Credentials & gateway**: map on-premises sources to a standard gateway connection; set cloud credentials.\n3. **Scheduled refresh**: e.g. daily 6 AM (within Pro's 8/day), failure notifications to a group.\n4. **RLS**: dynamic RLS by region; assign security groups in Security; test with Test as role.\n5. **App**: create the app with audiences (Executives, Regional managers), custom navigation, and publish. Users are not added to the workspace.\n6. **Extras**: endorsement (promote/certify the semantic model), subscriptions for weekly PDF, dashboard with alerts, sensitivity label (e.g. Confidential).\n7. **Documentation and handover**: KPI definitions, data sources, refresh schedule, owner/contacts, change log.\n8. **Adoption**: demo session, collect feedback, monitor usage metrics, iterate.",
    },
    {
      heading: 'Building a portfolio that gets interviews',
      content:
        "Recruiters spend a few minutes on your profile, so make projects easy to see and evaluate.",
      points: [
        'Build 3-4 projects in different domains: Sales, HR (attrition), Finance (P&L/budget vs actual), Supply chain or Healthcare',
        'Use realistic public data: Microsoft Contoso/AdventureWorks samples, Kaggle datasets, government open data, Maven Analytics challenges',
        'Each project should show the full workflow: Power Query cleaning, star schema, DAX (time intelligence, ranking, what-if), interactivity, RLS concept',
        'Publish screenshots/GIFs and a short write-up on GitHub, LinkedIn or a personal site; use Publish to web ONLY for public datasets',
        'Write a README: business problem, data, model diagram, key measures, insights, and what you would do next',
        'Show business impact: "identified 12% of products generating 70% of revenue" is better than "made a bar chart"',
        'Practise explaining one project in 2 minutes (STAR: Situation, Task, Action, Result)',
        'Join community challenges (e.g. Workout Wednesday, Maven challenges) and share on LinkedIn',
      ],
    },
    {
      heading: 'PL-300 exam overview',
      content:
        "**Exam PL-300: Microsoft Power BI Data Analyst** leads to the **Microsoft Certified: Power BI Data Analyst Associate** certification.\n\n- Format: around 40-60 questions (multiple choice, drag-and-drop, case studies, hot area); about 100 minutes; passing score **700 / 1000**.\n- Since 2023, role-based exams allow access to **Microsoft Learn** documentation during the exam (open book, but time is limited - you cannot look everything up).\n- The certification is valid for one year and is renewed for free through an online renewal assessment on Microsoft Learn.\n- Price varies by country (around USD 165 in the US); student discounts may apply.\n\nSkills measured (weights may change; always check the official study guide):",
      points: [
        'Prepare the data (~25-30%): get data, profile, clean, transform and load (Power Query, query folding, data quality)',
        'Model the data (~25-30%): design and implement the model, relationships, DAX calculations, optimise performance',
        'Visualize and analyze the data (~25-30%): create reports, enhance usability (bookmarks, drill, tooltips), identify patterns and trends (AI visuals, analytics)',
        'Manage and secure Power BI (~15-20%): workspaces, items, apps, refresh, gateways, RLS, sensitivity labels, sharing',
      ],
      tip: "Preparation plan: Microsoft Learn PL-300 learning path + official practice assessment (free on Microsoft Learn) + hands-on building + review this course's interview questions. Read case study questions carefully - they include requirements hidden in long text.",
    },
  ],
  examples: [
    {
      title: 'Requirements to KPI mapping',
      scenario: 'The Sales Director says: "I need to know if we are hitting our numbers, where growth comes from, and which customers we are losing."',
      table: {
        headers: ['Business question', 'KPI / Measure', 'Visual', 'Page'],
        rows: [
          ['Are we hitting our numbers?', 'Total Sales, Target, Achievement %, YoY %', 'KPI cards, line vs target', 'Overview'],
          ['Where does growth come from?', 'Sales YoY change by Category / Country', 'Waterfall, Decomposition tree', 'Overview / Product'],
          ['Which products drive revenue?', 'Cumulative Sales %, ABC class', 'Pareto combo chart', 'Product'],
          ['Which customers are we losing?', 'Lost customers, Retention %', 'Table with conditional formatting', 'Customer'],
          ['Detail for a customer', 'Orders, Sales trend, Products', 'Drill-through page', 'Customer Details'],
        ],
      },
      code:
        'Deliverables agreed:\n- 3 report pages + 2 drill-through pages + 1 tooltip page\n- Daily refresh at 06:00\n- Regional managers see only their region (dynamic RLS)\n- Distributed through an app with 2 audiences',
      explanation:
        'Mapping every business question to a measure and a visual keeps the project focused and becomes the acceptance checklist. If a visual does not answer a question in this table, it probably does not belong on the page.',
    },
    {
      title: 'Power Query: clean Sales and build Product dimension',
      scenario: 'Raw Sales has text dates, trailing spaces in product codes and some rows with null quantity; Product and Subcategory come in separate tables.',
      code:
        '// Sales\nlet\n    Source = Sql.Database(ServerName, DatabaseName),\n    Raw = Source{[Schema="dbo", Item="SalesOrders"]}[Data],\n    Keep = Table.SelectColumns(Raw, {"OrderID","OrderDate","ShipDate","CustomerID","ProductID","Quantity","UnitPrice","Cost"}),\n    Filtered = Table.SelectRows(Keep, each [Quantity] <> null and [OrderDate] >= #date(2022, 1, 1)),\n    Typed = Table.TransformColumnTypes(Filtered, {{"OrderDate", type date}, {"ShipDate", type date},\n        {"Quantity", Int64.Type}, {"UnitPrice", Currency.Type}, {"Cost", Currency.Type}}),\n    AddAmount = Table.AddColumn(Typed, "SalesAmount", each [Quantity] * [UnitPrice], Currency.Type)\nin\n    AddAmount\n\n// Product (merge Subcategory and Category)\nlet\n    P = Sql.Database(ServerName, DatabaseName){[Schema="dbo", Item="Product"]}[Data],\n    Merged = Table.NestedJoin(P, {"SubcategoryID"}, Subcategory, {"SubcategoryID"}, "Sub", JoinKind.LeftOuter),\n    Expanded = Table.ExpandTableColumn(Merged, "Sub", {"Subcategory", "Category"}),\n    Cleaned = Table.TransformColumns(Expanded, {{"ProductName", Text.Trim, type text}}),\n    Final = Table.SelectColumns(Cleaned, {"ProductID","ProductName","Subcategory","Category","ListPrice"})\nin\n    Final',
      explanation:
        'ServerName and DatabaseName are parameters (switchable per environment / deployment rules). Columns are selected and rows filtered early so the steps fold to SQL. The snowflaked Subcategory/Category tables are flattened into Product (star schema). Note: the Cost column is assumed to be total line cost; if it were unit cost you would multiply by Quantity.',
    },
    {
      title: 'Core measure set for the dashboard',
      scenario: 'Create the measures for the Executive Overview page, organised in a _Measures table with display folders.',
      code:
        '-- Base\nTotal Sales = SUM ( Sales[SalesAmount] )\nTotal Cost = SUM ( Sales[Cost] )\nTotal Profit = [Total Sales] - [Total Cost]\nProfit Margin % = DIVIDE ( [Total Profit], [Total Sales] )\nOrders = DISTINCTCOUNT ( Sales[OrderID] )\nCustomers = DISTINCTCOUNT ( Sales[CustomerID] )\nAvg Order Value = DIVIDE ( [Total Sales], [Orders] )\n\n-- Time intelligence\nSales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nSales YoY % = IF ( NOT ISBLANK ( [Sales LY] ), DIVIDE ( [Total Sales] - [Sales LY], [Sales LY] ) )\nSales YTD = TOTALYTD ( [Total Sales], \'Date\'[Date] )\nSales Rolling 12M =\nCALCULATE (\n    [Total Sales],\n    DATESINPERIOD ( \'Date\'[Date], MAX ( \'Date\'[Date] ), -12, MONTH )\n)\n\n-- Target (Targets table at Category + YearMonthKey grain, related via TREATAS)\nTarget =\nCALCULATE (\n    SUM ( Targets[TargetAmount] ),\n    TREATAS ( VALUES ( Product[Category] ), Targets[Category] ),\n    TREATAS ( VALUES ( \'Date\'[YearMonthKey] ), Targets[YearMonthKey] )\n)\nAchievement % = DIVIDE ( [Total Sales], [Target] )\n\n-- UX\nYoY Colour = IF ( [Sales YoY %] >= 0, "#2E7D32", "#C62828" )\nOverview Title = "Sales Overview - " & SELECTEDVALUE ( \'Date\'[Year], "All Years" )',
      explanation:
        'Layered measures reuse each other, so a definition change (e.g. net vs gross sales) happens in one place. Targets are linked with TREATAS because they are at a coarser grain. Format: currency measures with thousands separator, ratios as %, and assign display folders (Base, Time Intelligence, Targets, UX).',
    },
    {
      title: 'Building the Executive Overview page step by step',
      scenario: 'Turn the wireframe into a page.',
      code:
        '1. Apply the corporate JSON theme; set canvas background image with header band.\n2. Top row: Card (new) visual with Total Sales, Total Profit, Profit Margin %, Orders, Achievement %;\n   reference labels show Sales YoY % coloured by YoY Colour.\n3. Middle-left: Line chart - X: \'Date\'[YearMonth], Y: Total Sales, Sales LY, Target (LY grey, target dashed).\n4. Middle-right: Clustered bar - Sales by Product[Category], sorted desc, data labels.\n5. Bottom-left: Filled map / Azure map - Sales by Customer[Country].\n6. Bottom-right: Table - Top 10 products (Top N filter) with Sales, Margin % (conditional formatting) and data bars.\n7. Slicers panel: Year (dropdown), Country; sync to all pages.\n8. Edit interactions: category bar -> cards = None.\n9. Report page tooltip on the map; drill-through to Customer Details and Product Details.\n10. Title via fx: Overview Title. Alt text on every visual; tab order set in Selection pane.\n11. Performance Analyzer check: all visuals < 500 ms.',
      explanation:
        'The layout follows the Z-pattern: KPIs first, trend and composition next, details last. Interactivity and drill-through keep the main page simple. Accessibility and performance are checked before release.',
    },
    {
      title: 'Publishing and go-live checklist',
      scenario: 'Prepare the solution for 120 users across 4 regions.',
      code:
        '[ ] Publish to workspace "Sales Analytics [Prod]" (or via deployment pipeline Dev > Test > Prod)\n[ ] Gateway connection mapped; credentials via service account\n[ ] Scheduled refresh 06:00 daily; failure emails to BI-Support\n[ ] RLS role "Region" (dynamic): Customer[Region] IN user\'s regions; groups assigned; tested with Test as role\n[ ] App created with audiences: Executives (all pages), Regional Managers (no margin detail page)\n[ ] Semantic model endorsed (Promoted -> Certified after review)\n[ ] Sensitivity label: Confidential\n[ ] Subscription: weekly PDF of Overview to leadership\n[ ] Documentation: KPI dictionary, data lineage, owner, support process\n[ ] Training session + feedback form; review usage metrics after 2 weeks',
      explanation:
        'Go-live is more than clicking Publish. Security, refresh reliability, governance and adoption determine whether a dashboard is actually used. Interviewers value candidates who think about these steps.',
    },
    {
      title: 'Presenting the insights (storytelling script)',
      scenario: 'A 3-minute presentation of findings to the Sales Director.',
      code:
        'Situation: "2025 sales are 12.4M, up 8% vs last year, at 96% of target."\nComplication: "Growth is concentrated: Bikes in Germany contribute 70% of the increase, while Clothing declined 7% and its margin fell to 8%. We also lost 140 customers who bought in 2024 but not in 2025."\nResolution: "Recommendations: 1) review Clothing pricing and discounting, 2) launch a win-back campaign for the 140 lost customers (list on the Customer page), 3) replicate the German bike strategy in France, which has similar customer profiles."\nNext step: "I can add a monthly alert when Clothing margin falls below 10%."',
      explanation:
        'Situation-Complication-Resolution turns charts into decisions. Each statement points to a visual in the report, and the presenter ends with concrete actions and a next step.',
    },
  ],
  interview: [
    {
      q: 'Walk me through a Power BI project you built end to end.',
      a: 'Use STAR. Situation: the sales team tracked performance in multiple Excel files with inconsistent numbers. Task: build a single trusted sales dashboard. Action: gathered requirements and KPI definitions with sales and finance; connected to SQL and Excel targets with Power Query (parameters, folding, cleaning); built a star schema with a Date table; wrote layered DAX measures (YoY, YTD, achievement vs target, Pareto, new vs returning customers); designed 3 pages plus drill-through and tooltips; implemented dynamic RLS by region; published with a gateway and daily refresh; distributed via an app. Result: reporting time cut from 2 days to minutes per month, one version of the truth, and the Pareto analysis led to a product range review. Mention a challenge you solved (e.g. target grain mismatch solved with TREATAS).',
      level: 'Medium',
    },
    {
      q: 'Scenario: Two departments report different Sales numbers from your model. How do you resolve it?',
      a: 'First clarify definitions: gross vs net (returns, discounts), order date vs invoice date vs ship date, currency, tax, which entities are included. Reproduce both numbers with the same filters and trace the difference (data lineage, filters, RLS, report-level filters, timing of refresh). Agree an official definition with the business owner and document it in a KPI dictionary. Implement it as a single certified measure in a shared semantic model; if both views are needed, create clearly named measures (Gross Sales, Net Sales).',
      level: 'Hard',
    },
    {
      q: 'Scenario: The report is published but users complain it is slow. What are your steps?',
      a: 'Reproduce and measure: Performance Analyzer to find slow visuals, DAX Studio Server Timings to analyse queries (FE vs SE), VertiPaq Analyzer for model size. Typical fixes: reduce visuals per page and move detail to drill-through; rewrite inefficient DAX (FILTER over fact tables, nested iterators, BLANK to 0); reduce model cardinality and unused columns; remove bi-directional relationships; ensure query folding and incremental refresh; check storage mode (aggregations for DirectQuery); check capacity metrics and RLS complexity in the Service. Re-measure after each change.',
      level: 'Hard',
    },
    {
      q: 'Scenario: The business asks for a KPI you think is misleading (e.g. average of percentages). How do you handle it?',
      a: 'Explain with a concrete example why it misleads: averaging regional margin % ignores region size (a tiny region with 60% margin weighs the same as a large one with 20%). Propose the correct calculation (total profit / total sales - weighted) and show both side by side in a prototype. Let the business decide with full information, and document the definition. Being able to challenge requirements respectfully is a key analyst skill.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Targets are monthly by category but sales are daily by product. How do you model this?',
      a: 'Options: 1) Create dimension tables at the shared grain (Category dimension, Month in the Date table via a YearMonth column) and relate the Targets fact to them; Product relates to Category so both facts filter correctly. 2) Keep Targets disconnected and use TREATAS in the Target measure: CALCULATE(SUM(Targets[Amount]), TREATAS(VALUES(Product[Category]), Targets[Category]), TREATAS(VALUES(\'Date\'[YearMonth]), Targets[YearMonth])). Also handle lower-grain views: at day or product level either show blank or allocate the target (e.g. by days in month or by last year sales share).',
      level: 'Hard',
    },
    {
      q: 'Scenario: A manager wants to see their team\'s data only, and the CEO everything. Data comes from HR with ManagerID. How do you implement it?',
      a: 'Dynamic RLS with a parent-child hierarchy: Employee table with EmployeeID, ManagerID, Email; calculated column Path = PATH(EmployeeID, ManagerID); role filter on Employee: PATHCONTAINS(Employee[Path], LOOKUPVALUE(Employee[EmployeeID], Employee[Email], USERPRINCIPALNAME())). The CEO is at the top, so every path contains their ID. Filters flow to fact tables via EmployeeID. Assign all users to the role in the Service, test with Test as role, and ensure consumers are Viewers/app users.',
      level: 'Hard',
    },
    {
      q: 'How do you design KPIs for an executive dashboard?',
      a: 'Start from strategic goals and decisions. Pick a small set (5-7) of KPIs that are clearly defined, measurable from reliable data, comparable (vs target, LY, trend) and owned by someone. Show each KPI with context (variance and direction), use consistent colour semantics (green good, red bad, considering "higher is better" or not), and provide drill paths for investigation. Avoid vanity metrics that do not drive actions.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Data refresh failed this morning and the CEO meeting is in one hour. What do you do?',
      a: 'Check Refresh history for the error and fix the quickest root cause (expired credentials, gateway offline, schema change). If fixable, run Refresh now and monitor. If not, inform stakeholders proactively: the report shows data as of yesterday (add a "Last refreshed" card using a measure from a refresh timestamp table). Afterwards, do a root cause analysis and prevent recurrence (service accounts, gateway cluster, monitoring alerts, refresh failure notifications to a group).',
      level: 'Medium',
    },
    {
      q: 'What is data storytelling and how do you apply it in Power BI?',
      a: 'Data storytelling combines data, visuals and narrative to drive a decision. In Power BI: insight-based titles, logical page flow from summary to detail, context (targets, prior year), highlighting key points with colour, annotations/smart narratives, bookmarks to walk through a sequence, and ending with recommendations. In presentations use a structure like Situation-Complication-Resolution.',
      level: 'Easy',
    },
    {
      q: 'Import, DirectQuery or composite - how do you choose for a new project?',
      a: 'Default to Import for best performance and full DAX/Power Query features when data fits in memory and refresh latency (e.g. daily/hourly) is acceptable. Choose DirectQuery when data is too large, must be near real-time, or must stay in the source for compliance - accepting slower visuals and limitations. Composite models combine both: import dimensions and aggregates, DirectQuery for huge or real-time facts, or extend a shared semantic model. In Fabric, Direct Lake is an option for lakehouse data.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Users keep asking for small changes every week. How do you manage requests?',
      a: 'Set up a simple process: a request backlog (e.g. Teams/Planner/DevOps) with priority and owner; group changes into regular releases; develop in a Dev workspace and deploy via deployment pipeline to Test and Prod; update the app only after validation; communicate release notes. Empower power users with a certified shared semantic model so they can build their own thin reports for ad hoc needs.',
      level: 'Medium',
    },
    {
      q: 'What is in the PL-300 exam and how did you prepare?',
      a: 'PL-300 (Power BI Data Analyst Associate) covers four areas: Prepare the data, Model the data, Visualize and analyze the data, and Manage and secure Power BI. It is about 100 minutes, passing score 700, with case studies and multiple question types; Microsoft Learn is accessible during the exam. Preparation: Microsoft Learn learning path, the free official practice assessment, hands-on projects covering Power Query, DAX, RLS and the Service, and reviewing weak areas like time intelligence and workspace roles. The certification is renewed annually with a free online assessment.',
      level: 'Easy',
    },
    {
      q: 'Scenario: A stakeholder wants the dashboard to show data "as of last Friday" every week, frozen. How?',
      a: 'Options: schedule refresh weekly on Friday night/Saturday morning (all data frozen until next refresh); or keep daily refresh but add a report-level filter / measure logic limiting dates to the last completed week (e.g. \'Date\'[Date] <= last Friday computed in a calculated column or Power Query flag "IsUpToLastFriday"); or create snapshots in the source/dataflow. Choose based on whether other users need daily data. Document the "as of" date on the report with a dynamic label.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write a one-page requirements document for a Sales dashboard: audience, 5 business questions, KPI definitions, data sources, security, refresh and delivery.',
      hint: 'Use the Step 1 checklist.',
      solution:
        'Audience: Sales Director (monthly), Regional Managers (weekly).\nQuestions: on track vs target? growth drivers? top products? lost customers? regional performance?\nKPIs: Total Sales = SUM(SalesAmount) excl. tax, by OrderDate; Profit = Sales - Cost; Margin % = Profit / Sales; Achievement % = Sales / Target; Lost customers = bought LY not this year.\nSources: SQL SalesDW (Sales, Product, Customer), Excel Targets on SharePoint.\nSecurity: managers see own region (dynamic RLS).\nRefresh: daily 06:00. Delivery: app + weekly PDF subscription.',
    },
    {
      task: 'Build the complete star schema for the sample model with a DAX Date table, mark it as date table, and create relationships (including inactive ShipDate).',
      hint: 'CALENDAR + ADDCOLUMNS; Mark as date table.',
      solution:
        'Create Date with the ADDCOLUMNS(CALENDAR(...)) expression from Step 3. Table tools > Mark as date table > Date column. Sort MonthName by MonthNumber. Model view: Sales[OrderDate] -> Date[Date] (active, single), Sales[ShipDate] -> Date[Date] (inactive), Sales[ProductID] -> Product[ProductID], Sales[CustomerID] -> Customer[CustomerID]. File > Options > Data load > untick Auto date/time.',
    },
    {
      task: 'Create a "Lost Customers" measure: customers who bought last year but not in the current year (evaluated at Year level).',
      hint: 'EXCEPT of two customer lists.',
      solution:
        'Lost Customers =\nVAR CustomersLY =\n    CALCULATETABLE ( VALUES ( Sales[CustomerID] ), SAMEPERIODLASTYEAR ( \'Date\'[Date] ) )\nVAR CustomersCY = VALUES ( Sales[CustomerID] )\nRETURN\n    COUNTROWS ( EXCEPT ( CustomersLY, CustomersCY ) )',
    },
    {
      task: 'Add a "Last refreshed" label to the report.',
      hint: 'Power Query table with DateTime.LocalNow().',
      solution:
        'Power Query: New blank query "RefreshInfo":\nlet Source = #table(type table [LastRefresh = datetime], {{DateTime.LocalNow()}}) in Source\nMeasure: Last Refreshed = "Data as of " & FORMAT ( MAX ( RefreshInfo[LastRefresh] ), "dd-mmm-yyyy hh:nn" )\nShow it in a card or as a subtitle. Note: in the Service, LocalNow uses the server time zone (UTC); use DateTimeZone.SwitchZone(DateTimeZone.UtcNow(), 5, 30) for a specific offset.',
    },
    {
      task: 'Prepare a 2-minute STAR answer for "Tell me about your Power BI project".',
      hint: 'Situation, Task, Action, Result - with numbers.',
      solution:
        'S: Company tracked sales in 15 Excel files; month-end reporting took 2 days. T: Build an automated, trusted sales dashboard. A: Gathered KPI definitions; Power Query from SQL + SharePoint; star schema; 40 measures incl. YoY, targets, Pareto; 3 pages + drill-through; dynamic RLS; gateway + daily refresh; app for 120 users. R: Reporting time to 0 days, adoption 85% of managers weekly, Pareto analysis led to discontinuing 30 low-value products.',
    },
    {
      task: 'Create a 4-week PL-300 study plan.',
      hint: 'Map weeks to exam domains.',
      solution:
        'Week 1: Prepare the data - Power Query, profiling, folding, M basics; MS Learn modules + practice.\nWeek 2: Model the data - star schema, relationships, DAX (CALCULATE, time intelligence, iterators), performance.\nWeek 3: Visualize & analyze - visuals, interactivity, bookmarks, AI visuals, analytics; build a full report.\nWeek 4: Manage & secure - workspaces, apps, refresh, gateways, RLS, labels; take the official practice assessment twice, review weak areas, schedule the exam.',
    },
  ],
  quiz: [
    {
      question: 'What should be done FIRST in a new dashboard project?',
      options: ['Pick a colour theme', 'Gather requirements and KPI definitions', 'Write all DAX measures', 'Publish an empty report'],
      answer: 1,
      explanation: 'Requirements and agreed KPI definitions drive data, model and design decisions.',
    },
    {
      question: 'Which schema design is recommended for Power BI models?',
      options: ['One flat wide table', 'Star schema', 'Fully normalised 3NF', 'Many-to-many everywhere'],
      answer: 1,
      explanation: 'Star schemas (facts + dimensions) are simpler, faster and work best with DAX.',
    },
    {
      question: 'What is the passing score for PL-300?',
      options: ['600', '650', '700', '800'],
      answer: 2,
      explanation: 'Microsoft role-based exams require 700 on a scale of 1-1000.',
    },
    {
      question: 'Which PL-300 domain covers RLS, workspaces and gateways?',
      options: ['Prepare the data', 'Model the data', 'Visualize and analyze the data', 'Manage and secure Power BI'],
      answer: 3,
      explanation: 'Manage and secure Power BI covers workspaces, refresh, gateways, sharing and security.',
    },
    {
      question: 'Which title best follows data storytelling principles?',
      options: ['Sales by Category', 'Chart 1', 'Bikes drove 70% of 2025 sales growth', 'Category Analysis Visual'],
      answer: 2,
      explanation: 'Insight-based titles tell readers what to notice.',
    },
    {
      question: 'Targets are at Category/Month grain and Sales at Product/Day grain. Which DAX function helps filter Targets without a direct relationship?',
      options: ['RELATED', 'TREATAS', 'EARLIER', 'PATH'],
      answer: 1,
      explanation: 'TREATAS applies values from Product/Date as filters on Targets columns, creating a virtual relationship.',
    },
  ],
};
