export default {
  id: 'powerbi-intro',
  title: 'Introduction to Power BI & BI Concepts',
  level: 'Beginner',
  day: 1,
  duration: '2 hours',
  summary:
    'Learn what Business Intelligence is, how the Power BI ecosystem fits together (Desktop, Service, Mobile, Gateway, Report Server, Fabric), the end-to-end workflow, licensing, and how Power BI compares with Excel and Tableau.',
  objectives: [
    'Explain Business Intelligence and the role of a BI/Data Analyst',
    'Describe each component of the Power BI ecosystem and when it is used',
    'Walk through the Get Data → Transform → Model → Visualize → Publish workflow',
    'Compare Free, Pro, Premium Per User, Premium/Fabric capacity licenses',
    'Navigate the Report, Table, Model and DAX query views in Power BI Desktop',
    'Answer "Power BI vs Excel vs Tableau" questions confidently in interviews',
  ],
  theory: [
    {
      heading: 'What is Business Intelligence (BI)?',
      content:
        `**Business Intelligence** is the set of processes, technologies and practices used to turn raw data into information that supports business decisions. A BI system collects data from operational systems (ERP, CRM, e-commerce, spreadsheets), cleans and integrates it, stores it in an analysis-friendly structure, and presents it as reports, dashboards and KPIs.\n\nBI usually answers four kinds of questions:\n\n1. **Descriptive** – What happened? (Sales last quarter were 4.2M.)\n2. **Diagnostic** – Why did it happen? (Sales dropped because the West region lost two big customers.)\n3. **Predictive** – What is likely to happen? (Forecast next quarter.)\n4. **Prescriptive** – What should we do? (Increase discount for at-risk customers.)\n\nPower BI is strongest at descriptive and diagnostic analytics, with some predictive features (forecast lines, key influencers, AI visuals).`,
      points: [
        '**Data source** – where data is born (SQL Server, Excel, SharePoint, Salesforce, APIs).',
        '**ETL / ELT** – Extract, Transform, Load: cleaning and shaping data (Power Query in Power BI).',
        '**Data model / semantic model** – tables + relationships + measures that business users query.',
        '**Visualization layer** – reports and dashboards consumed by decision makers.',
        '**KPI** – Key Performance Indicator, a measurable value tied to a business goal (e.g. Gross Margin %).',
      ],
      tip: 'In interviews, define BI in one sentence first ("turning raw data into actionable insight"), then give a concrete example from sales or HR.',
    },
    {
      heading: 'The Power BI ecosystem',
      content:
        `Power BI is not a single program; it is a family of products that work together.`,
      points: [
        '**Power BI Desktop** – free Windows application used by developers to connect to data, transform it with Power Query, build the data model and DAX measures, and design reports. Output is a `.pbix` file (or `.pbip` project format).',
        '**Power BI Service** (app.powerbi.com) – the cloud SaaS where reports are published, shared, organized into **workspaces** and **apps**, scheduled for refresh, secured with row-level security, and pinned to **dashboards**.',
        '**Power BI Mobile** – iOS/Android apps to view reports and dashboards; reports can have a dedicated mobile layout.',
        '**On-premises Data Gateway** – a bridge installed on a server inside the company network so the cloud Service can refresh or query on-premises sources (SQL Server, file shares). Standard mode serves many users; personal mode is for one user and Import only.',
        '**Power BI Report Server** – an on-premises report portal (included with Premium/SQL Server Enterprise + SA) for organizations that cannot use the cloud. Uses a special version of Desktop.',
        '**Power BI Embedded** – APIs and capacity to embed reports in your own applications or websites.',
        '**Microsoft Fabric** – Microsoft\'s unified analytics platform (Data Factory, Data Engineering, Data Warehouse, Real-Time Intelligence, Power BI) built on **OneLake**. Power BI is now the visualization workload inside Fabric; Fabric adds Direct Lake storage mode.',
        '**Power BI Report Builder** – desktop tool to build paginated (pixel-perfect, printable) reports, `.rdl` files.',
      ],
      tip: 'Remember: Desktop = build, Service = share/collaborate/refresh, Gateway = connect cloud to on-premises data.',
    },
    {
      heading: 'The Power BI workflow: Get Data → Transform → Model → Visualize → Publish',
      content:
        `Almost every Power BI project follows the same five steps:\n\n1. **Get Data** – connect to sources (Excel, CSV, SQL Server, SharePoint, web APIs). Choose a storage mode (Import, DirectQuery).\n2. **Transform (Power Query)** – clean and shape data: remove columns, fix data types, unpivot, merge, append. Each action is recorded as an *Applied Step* written in the **M language**.\n3. **Model** – load tables, create relationships (e.g. Sales[ProductID] → Product[ProductID]), build a **star schema**, create a Date table, write **DAX measures** such as Total Sales.\n4. **Visualize** – drag fields onto visuals (bar, line, matrix, card, map), add slicers, filters, drill-through, bookmarks, and format the report.\n5. **Publish & Share** – publish the .pbix to a workspace in the Power BI Service, configure scheduled refresh (via gateway if needed), apply row-level security, and distribute through an app, sharing links, or embedding in Teams/SharePoint.\n\nAfter publishing, the Service holds two items: the **semantic model** (formerly called *dataset*) and the **report**. Multiple reports can reuse one semantic model.`,
      tip: 'Microsoft renamed "dataset" to "semantic model" in late 2023. Use the new term in interviews but know both.',
    },
    {
      heading: 'Licensing: Free, Pro, Premium Per User, Premium/Fabric capacity',
      content:
        `Licensing is a very common interview topic because it decides who can share and view content.`,
      points: [
        '**Free** – use Desktop and publish to *My workspace* for personal use. Cannot share content with others or collaborate in workspaces (unless the workspace is on a capacity).',
        '**Pro** (per user) – publish to shared workspaces, share reports and apps, collaborate. **Both the creator and every viewer need Pro** (unless content is in a Premium/Fabric capacity). Semantic model size limit 1 GB, up to 8 scheduled refreshes/day.',
        '**Premium Per User (PPU)** – per-user license with most Premium features: 100 GB model size, 48 refreshes/day, paginated reports, deployment pipelines, XMLA endpoint, AI features. Viewers of PPU content also need PPU.',
        '**Premium capacity (P SKUs) / Fabric capacity (F SKUs)** – the organization buys dedicated compute. Content in that capacity can be viewed by **Free users** (for F64 and above / P1+). Creators still need Pro or PPU to publish. Microsoft is retiring P SKUs in favour of F SKUs.',
        '**Embedded (A/EM SKUs)** – capacity for embedding in custom apps.',
      ],
      tip: 'Classic interview trap: "Can a Free user view a report?" Answer: only if the report is in a workspace backed by Premium (P1+) or Fabric F64+ capacity, otherwise they need Pro.',
    },
    {
      heading: 'Power BI vs Excel vs Tableau',
      content:
        `**Power BI vs Excel**: Excel is a flexible spreadsheet for ad-hoc analysis, financial models and small data sets (1,048,576 rows per sheet). Excel also contains Power Query and Power Pivot (the same engines as Power BI). Power BI is built for interactive, shareable dashboards, handles hundreds of millions of rows thanks to the compressed **VertiPaq** columnar engine, supports scheduled refresh, row-level security, mobile, and centralized governance.\n\n**Power BI vs Tableau**: both are leading self-service BI tools. Power BI is cheaper (Pro is a low per-user price and Desktop is free), integrates deeply with Microsoft 365, Teams, Azure and Fabric, and has the powerful DAX language for modeling. Tableau is often praised for visual flexibility and exploration, uses calculated fields/LOD expressions, and runs on Windows and Mac. Power BI Desktop is Windows-only.`,
      points: [
        'Data volume: Excel ~1M rows/sheet (more via Data Model); Power BI handles very large compressed models.',
        'Sharing: Excel = files by email/SharePoint; Power BI = Service, apps, RLS, subscriptions.',
        'Modeling language: Power BI = DAX + M; Tableau = calculated fields + LOD; Excel = formulas (+ DAX in Power Pivot).',
        'Refresh: Power BI scheduled refresh via gateway; Excel usually manual.',
      ],
    },
    {
      heading: 'Power BI Desktop interface and views',
      content:
        `Power BI Desktop has a ribbon at the top (Home, Insert, Modeling, View, Optimize, Help), the **Visualizations** and **Data** panes on the right, the **Filters** pane, and view icons on the left side:`,
      points: [
        '**Report view** – canvas where you design pages and visuals.',
        '**Table view** (formerly Data view) – see the loaded rows of each table; useful to check calculated columns. Not available for DirectQuery tables.',
        '**Model view** – diagram of tables and relationships; set cardinality, cross-filter direction, hide fields, create display folders and layouts.',
        '**DAX query view** – write and run DAX queries (`EVALUATE`) against the model, test measures, and use quick queries.',
        '**TMDL view** – edit the model as Tabular Model Definition Language script (newer feature).',
        '**Power Query Editor** – opened with *Transform data*; a separate window for ETL.',
      ],
      tip: 'In Table view you see data AFTER Power Query; in Power Query Editor you only see a preview (first 1000 rows by default).',
    },
    {
      heading: 'Key building blocks and terminology',
      content:
        `Before moving on, be fluent with these terms used throughout the course. We will use one sample model in all lessons:\n\n- **Sales** (fact): OrderID, OrderDate, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost\n- **Product** (dimension): ProductID, ProductName, Category, Subcategory, Brand\n- **Customer** (dimension): CustomerID, CustomerName, City, Country, Segment\n- **'Date'** (dimension): Date, Year, Quarter, MonthNumber, MonthName, ...`,
      points: [
        '**Report** – one or more pages of interactive visuals built on a single semantic model.',
        '**Dashboard** – a single-page canvas in the Service made of tiles pinned from one or more reports. Dashboards are Service-only.',
        '**Workspace** – a container in the Service for collaborating on reports, models, dataflows.',
        '**App** – a packaged, read-only bundle of content distributed to a wider audience.',
        '**Dataflow** – Power Query in the cloud, reusable ETL shared across models.',
        '**Measure** – a DAX calculation evaluated at query time, e.g. Total Sales.',
      ],
    },
  ],
  examples: [
    {
      title: 'Your first measure: Total Sales',
      scenario: 'After loading the Sales table, the manager wants a single card showing total revenue.',
      table: {
        headers: ['OrderID', 'ProductID', 'Quantity', 'UnitPrice', 'SalesAmount'],
        rows: [
          ['1001', 'P01', '2', '500', '1000'],
          ['1002', 'P02', '1', '1200', '1200'],
          ['1003', 'P01', '3', '500', '1500'],
        ],
      },
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: '3700',
      explanation:
        'Create the measure via Home → New measure (or right-click Sales → New measure). Drop it on a Card visual. Measures are evaluated in the current filter context, so if you add a slicer on Product it will automatically show sales for the selected product only.',
    },
    {
      title: 'End-to-end mini project workflow',
      scenario: 'Build a monthly sales report from an Excel file and share it with the sales team.',
      code: `1. Home → Get Data → Excel workbook → select Sales.xlsx → tick Sales, Product, Customer sheets → Transform Data
2. Power Query: set data types (OrderDate = Date, SalesAmount = Fixed decimal), remove blank rows, trim text → Close & Apply
3. Model view: create relationships Product[ProductID] 1 → * Sales[ProductID], Customer[CustomerID] 1 → * Sales[CustomerID]
4. Create a Date table and relate 'Date'[Date] 1 → * Sales[OrderDate]
5. Write measures: Total Sales, Total Cost, Profit, Profit Margin %
6. Report view: line chart (Month vs Total Sales), bar chart (Category vs Profit), slicer (Year), card (Total Sales)
7. Home → Publish → choose workspace "Sales Analytics"
8. In the Service: configure scheduled refresh (gateway if file is on-premises), create an App for the sales team`,
      explanation:
        'This sequence mirrors the standard Get Data → Transform → Model → Visualize → Publish workflow and is exactly what interviewers want to hear when they ask "Walk me through how you build a report."',
    },
    {
      title: 'Profit and margin measures',
      scenario: 'Show profit and profit margin next to total sales.',
      code: `Total Cost = SUM ( Sales[Cost] )

Profit = [Total Sales] - [Total Cost]

Profit Margin % = DIVIDE ( [Profit], [Total Sales] )`,
      result: 'With Sales 3700 and Cost 2600: Profit = 1100, Margin = 29.7%',
      explanation:
        'Measures can reference other measures (re-use). DIVIDE safely returns BLANK instead of an error when the denominator is zero. Format Profit Margin % as Percentage in the Measure tools ribbon.',
    },
    {
      title: 'Testing a measure in DAX query view',
      scenario: 'Verify Total Sales by product category without building a visual.',
      code: `EVALUATE
SUMMARIZECOLUMNS (
    Product[Category],
    "Total Sales", [Total Sales],
    "Profit", [Profit]
)
ORDER BY [Total Sales] DESC`,
      explanation:
        'DAX query view runs queries starting with EVALUATE and returns a table. SUMMARIZECOLUMNS groups by Category and evaluates the measures for each group – this is the same type of query a visual sends to the engine.',
    },
    {
      title: 'Choosing a license for a scenario',
      scenario: 'A company has 5 report developers and 800 employees who only view reports.',
      code: `Option A: 805 Pro licenses (every viewer needs Pro)
Option B: 5 Pro licenses for developers + Fabric F64 (or Premium P1) capacity
          → 800 viewers can use Free licenses when content lives in the capacity workspace`,
      explanation:
        'With hundreds of viewers, capacity licensing is usually cheaper and also unlocks larger models, more refreshes and features like paginated reports and deployment pipelines. With a small team, Pro for everyone is cheapest.',
    },
  ],
  interview: [
    {
      q: 'What is Power BI and what are its main components?',
      a: `Power BI is Microsoft's business analytics platform for connecting to data, modeling it and building interactive reports and dashboards.\n\nMain components: **Power BI Desktop** (authoring), **Power BI Service** (cloud sharing, refresh, security), **Power BI Mobile**, **On-premises Data Gateway**, **Power BI Report Server** (on-premises portal), **Power BI Report Builder** (paginated reports), **Power BI Embedded**. Inside Desktop the engines are **Power Query** (M language, ETL), the **VertiPaq/Analysis Services Tabular engine** (data model) and **DAX** (calculations).`,
      level: 'Easy',
    },
    {
      q: 'What is the difference between a report and a dashboard?',
      a: `A **report** is multi-page, built in Desktop or the Service on **one semantic model**, highly interactive (slicers, cross-filtering, drill-through, filters pane).\n\nA **dashboard** exists only in the **Service**, is a **single page** of tiles pinned from **one or more reports/models**, has limited interactivity (clicking a tile opens the underlying report), and supports features like data alerts on card/KPI tiles and Q&A. Dashboards are used for a high-level monitoring view.`,
      level: 'Easy',
    },
    {
      q: 'What is the On-premises Data Gateway and when do you need it?',
      a: `The gateway is software installed on a machine inside the corporate network that securely relays requests between the Power BI Service (cloud) and on-premises data sources.\n\nYou need it when a published semantic model must **refresh** (Import) or **query live** (DirectQuery/Live) on-premises sources such as SQL Server, Oracle, files on a network share. Cloud sources such as Azure SQL, SharePoint Online or Salesforce usually do **not** need a gateway.\n\nModes: **Standard** (shared by many users and models, supports DirectQuery) and **Personal** (single user, Import only, cannot be shared). Best practice: install standard gateways in a **cluster** for high availability.`,
      level: 'Medium',
    },
    {
      q: 'Explain Power BI licensing. Can a free user view a report shared with them?',
      a: `- **Free**: personal use, My workspace only.\n- **Pro**: share and collaborate; both publisher and consumers need Pro.\n- **PPU**: Premium features per user; consumers also need PPU.\n- **Premium (P) / Fabric (F) capacity**: dedicated capacity; content can be consumed by Free users when the workspace is on P1+ or F64+.\n\nSo a Free user can view shared content **only** if it is hosted in a Premium P or Fabric F64+ capacity workspace. Otherwise they need Pro (or PPU for PPU workspaces).`,
      level: 'Medium',
    },
    {
      q: 'Walk me through the steps you follow to build a Power BI report.',
      a: `1. **Requirements** – understand KPIs, audience, granularity, refresh frequency.\n2. **Get Data** – connect to sources, choose Import/DirectQuery.\n3. **Transform** – Power Query: data types, cleaning, removing unnecessary columns, unpivoting, merging; keep query folding where possible.\n4. **Model** – star schema, relationships (1:* single direction), Date table marked as date table, hide keys.\n5. **DAX** – explicit measures (Total Sales, YoY %, etc.).\n6. **Visualize** – layout, appropriate visuals, slicers, drill-through, tooltips, bookmarks, consistent theme.\n7. **Validate** – reconcile numbers with source, performance analyzer.\n8. **Publish** – workspace, gateway, scheduled refresh, RLS, app, documentation.`,
      level: 'Easy',
    },
    {
      q: 'What is a semantic model (dataset) in Power BI?',
      a: `A semantic model is the published data model: tables, relationships, measures, hierarchies, RLS roles and metadata. When you publish a .pbix, the Service splits it into a **semantic model** and a **report**.\n\nOne semantic model can serve many reports ("golden dataset" / shared model approach), which ensures one version of the truth. Other users can build new reports on it via **Live Connection**, Analyze in Excel, or by connecting with the XMLA endpoint (Premium/PPU/Fabric).`,
      level: 'Medium',
    },
    {
      q: 'Power BI vs Excel – when would you use each?',
      a: `Use **Excel** for ad-hoc analysis, small data, what-if financial models, cell-level formatting and calculations, and when users need to type/edit data.\n\nUse **Power BI** for large data sets (VertiPaq compression), interactive dashboards shared to many users, automatic scheduled refresh, row-level security, mobile access, and centralized governance.\n\nThey complement each other: Excel shares the same Power Query and Power Pivot engines, and users can connect Excel PivotTables to a Power BI semantic model with **Analyze in Excel**.`,
      level: 'Easy',
    },
    {
      q: 'Power BI vs Tableau – what are the main differences?',
      a: `- **Cost**: Power BI Desktop free, Pro is low cost per user; Tableau Creator licenses cost more.\n- **Ecosystem**: Power BI integrates with Microsoft 365, Teams, Excel, Azure, Fabric; Tableau is owned by Salesforce.\n- **Modeling**: Power BI has a full semantic model with DAX and Power Query; Tableau uses calculated fields, LOD expressions and Tableau Prep.\n- **Platform**: Power BI Desktop is Windows-only; Tableau Desktop runs on Windows and Mac.\n- **Visual exploration**: Tableau is often considered more flexible for free-form visual exploration; Power BI has strong AI visuals and Q&A.\n\nA balanced answer acknowledging both tools' strengths sounds more professional than claiming one is always better.`,
      level: 'Medium',
    },
    {
      q: 'What are the different views in Power BI Desktop?',
      a: `**Report view** (design visuals), **Table view** (inspect loaded data and calculated columns), **Model view** (relationships, properties, display folders), **DAX query view** (run EVALUATE queries) and **TMDL view** (script the model). The **Power Query Editor** is a separate window opened from *Transform data*.`,
      level: 'Easy',
    },
    {
      q: 'What is Microsoft Fabric and how does Power BI relate to it?',
      a: `Microsoft Fabric is an end-to-end SaaS analytics platform that unifies data integration (Data Factory), data engineering (Spark notebooks, Lakehouse), data warehousing, real-time analytics, data science and Power BI, all storing data in **OneLake** (Delta/Parquet format).\n\nPower BI is the business-intelligence workload inside Fabric. Fabric introduced **Direct Lake** mode, where a semantic model reads Delta tables from OneLake directly, combining near-Import performance with near-real-time freshness without scheduled import refresh. Fabric capacities (F SKUs) replace Power BI Premium P SKUs.`,
      level: 'Medium',
    },
    {
      q: 'What is a .pbix file and what does it contain? What about .pbip?',
      a: `A **.pbix** is a binary (zip) file containing Power Query queries (M), the data model and its compressed data (for Import), DAX, the report layout and visuals, and metadata.\n\nA **.pbit** is a template – same as pbix but without data.\n\nA **.pbip** (Power BI Project) saves the report and model as folders of text files (TMDL/JSON), which makes Git source control, code reviews and CI/CD possible.`,
      level: 'Medium',
    },
    {
      q: 'What is a Power BI App and how is it different from sharing a report?',
      a: `An **App** packages selected reports, dashboards and workbooks from a workspace into a read-only, navigable product for a large audience. You can define audiences (different content for different groups), a navigation pane, and update the app in a controlled way (publish changes only when you update the app).\n\n**Direct sharing** gives access to a single item and is good for a few people. Apps are best practice for distributing content to business users because the workspace remains a development/collaboration area while consumers see only the published version.`,
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'List the five stages of the Power BI workflow and name the tool/feature used in each stage.',
      hint: 'Think about where you click in Desktop for each stage.',
      solution:
        'Get Data (Home → Get Data, connectors) → Transform (Power Query Editor, M) → Model (Model view, relationships, DAX) → Visualize (Report view, Visualizations pane) → Publish/Share (Publish button → Power BI Service, workspaces, apps, gateway, scheduled refresh).',
    },
    {
      task: 'Create measures Total Sales, Total Cost, Profit and Profit Margin % on the sample Sales table.',
      hint: 'Reuse measures inside other measures and use DIVIDE.',
      solution: `Total Sales = SUM ( Sales[SalesAmount] )
Total Cost = SUM ( Sales[Cost] )
Profit = [Total Sales] - [Total Cost]
Profit Margin % = DIVIDE ( [Profit], [Total Sales] )
-- Format Profit Margin % as Percentage with 1 decimal`,
    },
    {
      task: 'A company has 10 developers and 50 viewers. Viewers only need to view reports. Which licensing would you recommend and why? What changes at 1,000 viewers?',
      hint: 'Compare per-user cost vs capacity cost.',
      solution:
        'At 60 users, Pro for everyone (10 + 50) is simplest and cheapest. At 1,000 viewers, buying a Fabric F64 (or Premium) capacity becomes economical: developers keep Pro, viewers use Free licenses because content in F64+ capacity can be viewed by Free users. Capacity also adds larger model size, more refreshes and Premium features.',
    },
    {
      task: 'Your report reads from SQL Server on the company network. After publishing, the refresh fails with "data source credentials / gateway" error. What do you do?',
      hint: 'Cloud cannot see on-prem servers by itself.',
      solution:
        'Install (or ask admin for) an On-premises Data Gateway in standard mode on a server that can reach SQL Server. In the gateway settings add a data source connection for that server/database with credentials. In the semantic model settings → Gateway and cloud connections, map the source to the gateway connection. Then set scheduled refresh.',
    },
    {
      task: 'Write a DAX query in DAX query view that returns Total Sales by Customer[Country] sorted descending.',
      hint: 'EVALUATE + SUMMARIZECOLUMNS + ORDER BY.',
      solution: `EVALUATE
SUMMARIZECOLUMNS (
    Customer[Country],
    "Total Sales", [Total Sales]
)
ORDER BY [Total Sales] DESC`,
    },
    {
      task: 'Explain to a non-technical manager the difference between a report and a dashboard and which to use for a daily KPI check.',
      hint: 'Single page vs multi page, pinned tiles.',
      solution:
        'A report is a detailed, multi-page interactive analysis built on one data model. A dashboard is a one-page summary in the Power BI Service made of tiles pinned from one or more reports. For a quick daily KPI check (with optional data alerts on cards), a dashboard or the first page of an App works best; clicking a tile takes the manager to the detailed report for investigation.',
    },
  ],
  quiz: [
    {
      question: 'Which Power BI component is used primarily to author data models and reports?',
      options: ['Power BI Service', 'Power BI Desktop', 'Power BI Mobile', 'On-premises Data Gateway'],
      answer: 1,
      explanation: 'Power BI Desktop is the free Windows authoring tool for Power Query, modeling, DAX and report design.',
    },
    {
      question: 'What is the correct order of the typical Power BI workflow?',
      options: [
        'Visualize → Get Data → Model → Publish → Transform',
        'Get Data → Model → Transform → Publish → Visualize',
        'Get Data → Transform → Model → Visualize → Publish',
        'Transform → Get Data → Visualize → Model → Publish',
      ],
      answer: 2,
      explanation: 'Data is connected, shaped in Power Query, modeled with relationships/DAX, visualized and finally published.',
    },
    {
      question: 'A Free-license user can view a shared report when:',
      options: [
        'Always, Free users can view everything',
        'The report is in a workspace on Premium P1+/Fabric F64+ capacity',
        'The report has fewer than 10 pages',
        'The creator has a Pro license',
      ],
      answer: 1,
      explanation: 'Only capacity-backed workspaces (P1+ or F64+) allow Free users to consume content.',
    },
    {
      question: 'Which statement about dashboards is TRUE?',
      options: [
        'Dashboards can be created in Power BI Desktop',
        'A dashboard can have many pages',
        'A dashboard can contain tiles pinned from multiple reports',
        'Dashboards support slicers like reports',
      ],
      answer: 2,
      explanation: 'Dashboards are single-page, Service-only, and can combine tiles from several reports and models.',
    },
    {
      question: 'What is the purpose of the On-premises Data Gateway?',
      options: [
        'To speed up DAX calculations',
        'To let the Power BI Service access data sources inside a private network',
        'To convert .pbix to .pbip',
        'To create paginated reports',
      ],
      answer: 1,
      explanation: 'The gateway securely bridges the cloud Service and on-premises data sources for refresh and live queries.',
    },
    {
      question: 'Which view in Power BI Desktop lets you create and edit relationships visually?',
      options: ['Report view', 'Table view', 'Model view', 'DAX query view'],
      answer: 2,
      explanation: 'Model view shows the diagram of tables and relationships and their properties.',
    },
  ],
};
