export default {
  id: 'day-01-intro-data-analytics-power-bi',
  title: 'Introduction to Data Analytics, What is Power BI, Features, Uses, Power BI Architecture',
  module: 'Module 1: Introduction to Power BI',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Understand what data analytics is, where Power BI fits, what it can do and how its pieces (Power Query, the semantic model, DAX, reports, the Service and gateways) work together from raw data to a shared dashboard.',
  objectives: [
    'Explain data analytics and the four types of analytics with business examples',
    'Define Power BI and list its main features and real-world uses',
    'Describe the Power BI architecture: data sources, Power Query, semantic model, reports, Service, gateway',
    'Follow the standard workflow: Get Data > Transform > Model > Visualize > Publish > Share',
    'Recognise the shared practice dataset (Sales, Product, Customer, Date) used throughout this course',
  ],
  theory: [
    {
      heading: 'What is Data Analytics?',
      content:
        `**Data analytics** is the process of collecting raw data, cleaning it, organising it and studying it to find answers that help people make better decisions.\n\nThink of a kirana shop owner who writes every sale in a notebook. At the end of the month the notebook is just pages of numbers (raw data). When the owner adds up sales per product and notices that biscuits sell twice as much on weekends, that is **analytics**: turning data into a useful insight ("stock more biscuits on Friday").\n\nThe usual analytics flow is:\n\n1. **Collect** – get data from sources (Excel files, databases, websites, apps).\n2. **Clean** – fix spelling mistakes, blanks, duplicates, wrong data types.\n3. **Model** – connect related tables (sales to products to customers).\n4. **Analyse** – calculate totals, averages, growth, ranks.\n5. **Visualise and share** – charts and dashboards that decision makers can read in seconds.`,
      points: [
        '**Data** = raw facts (OrderID 1001, Laptop, 2 units, 2024-03-05).',
        '**Information** = organised data (Laptop sold 120 units in March).',
        '**Insight** = meaning that drives action (Laptop sales jump in March because of college admissions – plan stock in February).',
      ],
    },
    {
      heading: 'Four types of analytics',
      content:
        `Analytics answers four kinds of questions, from simple to advanced:\n\n1. **Descriptive** – What happened? *"Total sales in 2024 were ₹48 lakh."*\n2. **Diagnostic** – Why did it happen? *"Sales fell in Nashik because one corporate customer stopped ordering."*\n3. **Predictive** – What will probably happen? *"Next quarter we expect about ₹13 lakh."*\n4. **Prescriptive** – What should we do? *"Offer a 5% discount to Retail customers in Nagpur."*\n\nPower BI is mainly used for **descriptive** and **diagnostic** analytics (dashboards, drill down, slicing). It also has some predictive features such as forecasting on line charts and AI visuals like Key Influencers.`,
      tip: 'In interviews, give one example for each type using the same business. It shows you understand the difference, not just the definitions.',
    },
    {
      heading: 'What is Power BI?',
      content:
        `**Power BI** is Microsoft's business intelligence (BI) platform. It lets you connect to almost any data source, clean the data, build a data model, write calculations and create interactive reports and dashboards that can be shared securely with others.\n\nAn easy analogy: if Excel is a **calculator with a notebook**, Power BI is a **factory**. Raw material (data) comes in from many suppliers, machines clean and shape it (Power Query), it is stored in an organised warehouse (the semantic model), and finished products (reports) are delivered to customers (business users) automatically every day.\n\nPower BI is part of **Microsoft Fabric**, Microsoft's analytics platform, and works closely with Excel, Teams, SharePoint, Azure and SQL Server.`,
      points: [
        '**Power BI Desktop** – free Windows app where you build reports.',
        '**Power BI Service** (app.powerbi.com) – cloud website where you publish, share and refresh reports.',
        '**Power BI Mobile** – apps for Android and iOS to view reports on the phone.',
      ],
    },
    {
      heading: 'Key features of Power BI',
      content:
        `- **Hundreds of connectors** – Excel, CSV, SQL Server, MySQL, SharePoint, Web, JSON, Salesforce and many more.\n- **Power Query** – a no-code data cleaning tool. Every click is recorded as a step and written in the **M language**, so the cleaning repeats automatically on refresh.\n- **Data modeling** – connect tables with relationships (for example Product[ProductID] to Sales[ProductID]).\n- **DAX** (Data Analysis Expressions) – formula language for measures such as \`Total Sales = SUM(Sales[SalesAmount])\`.\n- **Interactive visuals** – click a bar and every other chart filters. Slicers, drill down, tooltips, bookmarks.\n- **AI features** – Q&A (ask questions in English), Key Influencers, Decomposition Tree, Smart Narrative, Copilot (with Fabric capacity).\n- **Scheduled refresh** – data updates automatically, even from on-premises sources through a gateway.\n- **Security** – Row-Level Security so a Pune manager sees only Pune data.\n- **Sharing** – workspaces, apps, Teams and SharePoint embedding, email subscriptions, export to PDF/PowerPoint/Excel.`,
    },
    {
      heading: 'Where is Power BI used?',
      content:
        `Almost every industry uses Power BI:\n\n- **Retail / e-commerce** – daily sales, top products, city-wise performance, stock levels.\n- **Finance** – profit and loss, budget vs actual, expense tracking.\n- **HR** – headcount, attrition, hiring funnel.\n- **Manufacturing** – production output, defects, machine downtime.\n- **Healthcare** – patient visits, bed occupancy, waiting time.\n- **Education** – student results, attendance, fee collection.\n\nJob roles that use Power BI daily: **Data Analyst, BI Developer, MIS Executive, Business Analyst, Financial Analyst**.`,
    },
    {
      heading: 'Power BI architecture',
      content:
        `The architecture describes how data travels from its source to the user's screen:\n\n1. **Data sources** – Excel, CSV, databases, cloud apps (on-premises or cloud).\n2. **Power Query (Get Data + Transform)** – connects to sources and cleans data. Output: clean tables.\n3. **Semantic model** (earlier called **dataset**) – the clean tables stored in the in-memory **VertiPaq** engine, plus relationships, DAX measures and security roles.\n4. **Report layer** – pages of visuals built on top of the semantic model in Power BI Desktop.\n5. **Power BI Service** – you **publish** the .pbix file; it becomes a semantic model + report in a **workspace**. You can pin visuals to **dashboards**, bundle content into an **App** and share it.\n6. **On-premises data gateway** – a bridge program installed inside the company network so the cloud Service can refresh data from on-premises sources (like a local SQL Server or a file on a shared drive).\n7. **Consumers** – users on the browser, Teams, or Power BI Mobile.\n\nStorage modes decide where data lives: **Import** (copied into the model, fastest), **DirectQuery** (queried live from the source), and **Direct Lake** (reads Fabric OneLake Delta tables directly).`,
      syntax: `Data Sources  -->  Power Query (M)  -->  Semantic Model (tables + relationships + DAX)
                                              |
                                        Report (Desktop .pbix)
                                              |  Publish
                                     Power BI Service (Workspace)
                                     /        |          \\
                              Dashboards     Apps     Scheduled refresh <-- Gateway <-- On-prem data
                                              |
                                  Browser / Teams / Mobile users`,
      tip: 'Remember the one-line flow: "Get Data, Transform, Model, Visualise, Publish, Share". Most interviewers start with "Explain the Power BI workflow".',
    },
    {
      heading: 'The practice dataset used in this course',
      content:
        `From Day 13 onwards (and in many earlier examples) we use one small company model so you can practise every concept on the same data:\n\n- **Sales** (fact): OrderID, OrderDate, Year, Month, CustomerID, ProductID, Quantity, UnitPrice, SalesAmount, Cost\n- **Product** (dimension): ProductID, Product, Category (Electronics / Accessories / Furniture), Price\n- **Customer** (dimension): CustomerID, Customer, City (Pune / Mumbai / Nagpur / Nashik), Segment (Corporate / Retail)\n- **Date** (dimension, marked as date table, 2023-01-01 to 2024-12-31): Date, Year, MonthNo, Month, Quarter, YearMonth\n\nRelationships are one-to-many and single direction: Product to Sales, Customer to Sales, Date[Date] to Sales[OrderDate]. You can download these as CSV from the app and test DAX in the **DAX Lab**.`,
    },
  ],
  examples: [
    {
      title: 'Classify questions into analytics types',
      scenario: 'A manager of our practice company asks five questions. Decide which type of analytics each one is.',
      table: {
        headers: ['Question', 'Type of analytics'],
        rows: [
          ['What was total SalesAmount in 2024?', 'Descriptive'],
          ['Why did Furniture sales drop in Q3 2024?', 'Diagnostic'],
          ['How much will we sell in Jan 2025?', 'Predictive'],
          ['Which city should get the next marketing budget?', 'Prescriptive'],
          ['Which 5 products sold the most units last month?', 'Descriptive'],
        ],
      },
      steps: [
        'Read each question and ask: is it about the past, a reason, the future, or an action?',
        'Past facts = Descriptive; a reason ("why") = Diagnostic; future = Predictive; recommended action = Prescriptive.',
        'Write the type next to each question as in the table.',
      ],
      result: 'Three descriptive-style or diagnostic questions can be answered directly in a Power BI report; predictive uses forecast features; prescriptive needs business judgement on top of the report.',
      explanation: 'The key word usually gives it away: "what was" (descriptive), "why" (diagnostic), "will" (predictive), "should" (prescriptive).',
    },
    {
      title: 'Map a real requirement to the Power BI architecture',
      scenario:
        'The sales team keeps orders in an Excel file on a shared office drive. Management wants a dashboard on their phones that updates every morning.',
      table: {
        headers: ['Requirement', 'Power BI component'],
        rows: [
          ['Read the Excel file', 'Get Data > Excel workbook (connector)'],
          ['Fix blank cities and wrong dates', 'Power Query Editor (M steps)'],
          ['Link Sales to Product and Customer', 'Model view relationships (semantic model)'],
          ['Total Sales, Profit %', 'DAX measures'],
          ['Charts and slicers', 'Report view in Power BI Desktop'],
          ['Share with management', 'Publish to Power BI Service workspace + App'],
          ['Refresh every morning from the office drive', 'On-premises data gateway + scheduled refresh'],
          ['View on phone', 'Power BI Mobile app'],
        ],
      },
      steps: [
        'List each requirement in plain words.',
        'Ask where in the flow it happens: source, transform, model, visual, publish, consume.',
        'Write the matching Power BI component next to each requirement.',
        'Note that a file on a local/shared drive is on-premises, so the cloud Service needs a gateway to refresh it.',
      ],
      result: 'A complete component map that covers source to mobile, as shown in the table.',
      explanation: 'Every Power BI solution uses the same layers. Mapping requirements to layers is the first thing a BI developer does in a project.',
    },
    {
      title: 'Your first look at Power BI Desktop with sample data',
      scenario: 'Open Power BI Desktop and load the built-in sample to see the full workflow in five minutes.',
      steps: [
        'Open Power BI Desktop (install it from the Microsoft Store if you have not – covered in Day 2).',
        'On the start screen click "Learn with sample data" (or Home > Get data > Sample dataset).',
        'Click "Load sample data", tick the "financials" table and click Load.',
        'In Report view, in the Data pane, expand financials and tick "Sales" and "Country".',
        'A clustered column chart appears. In Visualizations, click the "Pie chart" icon to change its type.',
        'Click any slice of the pie – notice the visual highlights the selection (interactivity).',
        'File > Save as > FirstReport.pbix.',
      ],
      result: 'A pie chart of Sales by Country and a saved .pbix file. You have done Get Data, Load, Visualise and Save.',
      explanation: 'The .pbix file stores the queries, the model (data + relationships + measures) and the report pages together.',
    },
    {
      title: 'Excel vs Power BI for the same task',
      scenario: 'Compare how a monthly city-wise sales report is produced in Excel and in Power BI.',
      table: {
        headers: ['Task', 'Excel (manual)', 'Power BI'],
        rows: [
          ['Get new month data', 'Copy-paste into sheet', 'Click Refresh (or scheduled refresh)'],
          ['Clean data', 'Repeat manual edits every month', 'Power Query steps re-run automatically'],
          ['Join product details', 'VLOOKUP/XLOOKUP formulas', 'Relationship in Model view'],
          ['Row limit', 'About 1,048,576 rows per sheet', 'Millions of rows (compressed in VertiPaq)'],
          ['Sharing', 'Email the file', 'Publish once, secure sharing, mobile'],
        ],
      },
      steps: [
        'Write down each monthly task in the left column.',
        'Note how much manual effort each needs in Excel.',
        'Note the Power BI feature that automates it.',
      ],
      result: 'A clear argument for when to move a report from Excel to Power BI.',
      explanation: 'Excel is still great for ad-hoc analysis; Power BI wins when the same report is refreshed and shared repeatedly.',
    },
  ],
  interview: [
    { q: 'What is Power BI?', a: 'Power BI is Microsoft\'s business intelligence platform used to connect to data sources, clean and model data, create DAX calculations and build interactive reports and dashboards that are shared securely through the Power BI Service and mobile apps. It is part of Microsoft Fabric.', level: 'Easy' },
    { q: 'Explain the Power BI workflow end to end.', a: 'Get Data from sources > Transform/clean in Power Query > Load into the semantic model > create relationships and DAX measures > build report visuals in Power BI Desktop > Publish to a workspace in the Power BI Service > set up scheduled refresh (gateway for on-premises) > share via apps, dashboards, Teams or mobile.', level: 'Easy' },
    { q: 'What are the four types of analytics? Which ones does Power BI cover?', a: 'Descriptive (what happened), diagnostic (why), predictive (what will happen) and prescriptive (what to do). Power BI is strongest at descriptive and diagnostic analytics, with some predictive capability through forecasting and AI visuals.', level: 'Easy' },
    { q: 'What is a semantic model?', a: 'The semantic model (formerly called dataset) is the layer that holds the loaded tables, relationships, DAX measures, calculated columns, hierarchies and security roles. Reports are built on top of it, and several reports can share one semantic model.', level: 'Medium' },
    { q: 'What is the on-premises data gateway and when do you need it?', a: 'It is software installed on a machine inside the company network that securely connects the cloud Power BI Service to on-premises sources such as a local SQL Server or files on a network drive. You need it for scheduled refresh or DirectQuery against on-premises data. Cloud sources such as SharePoint Online or Azure SQL do not need it.', level: 'Medium' },
    { q: 'Name the main components of Power BI.', a: 'Power BI Desktop (authoring), Power BI Service (cloud sharing and refresh), Power BI Mobile (viewing), on-premises data gateway (refresh bridge), Power BI Report Server (on-premises hosting) and Power BI Report Builder (paginated reports). Inside Desktop: Power Query, the semantic model with DAX, and the report canvas.', level: 'Easy' },
    { q: 'Scenario: your manager says "We already have Excel, why buy Power BI?" How do you answer?', a: 'Explain automation (Power Query steps and scheduled refresh replace monthly manual work), scale (millions of rows compressed in memory), one model with relationships instead of many lookup formulas, interactive filtering and drill down, secure sharing with row-level security, and mobile access. Excel remains useful for ad-hoc analysis and can even connect to Power BI semantic models.', level: 'Medium' },
    { q: 'What is the difference between Import, DirectQuery and Direct Lake?', a: 'Import copies data into the in-memory VertiPaq engine – fastest, needs refresh. DirectQuery sends queries to the source at view time – near real-time but slower and with some DAX/Power Query limits. Direct Lake (Fabric) reads Delta tables in OneLake directly into memory without a scheduled import, giving Import-like speed with fresher data.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write one descriptive, one diagnostic, one predictive and one prescriptive question for a college canteen.',
      hint: 'Use the key words: what was, why, will, should.',
      solution: 'Descriptive: What was total revenue last month? Diagnostic: Why did tea sales drop in May? Predictive: How many samosas will sell during exam week? Prescriptive: Should we add a combo offer on Fridays?',
    },
    {
      task: 'Draw the Power BI architecture for a company that stores data in an on-premises SQL Server and wants daily refreshed reports in Teams.',
      hint: 'Remember the gateway for on-premises sources.',
      solution: 'SQL Server (on-prem) > Power Query in Desktop > semantic model + DAX > report > Publish to workspace > gateway + scheduled refresh daily > share through an App and add the report as a tab in Microsoft Teams.',
    },
    {
      task: 'List five features of Power BI that Excel does not provide out of the box.',
      hint: 'Think about sharing, refresh, security and AI.',
      solution: 'Scheduled cloud refresh with gateway, Row-Level Security, publishing/apps with permission control, mobile app with alerts, cross-filtering interactive visuals and AI visuals such as Key Influencers and Decomposition Tree.',
    },
    {
      task: 'Open Power BI Desktop, load the "financials" sample, and create a column chart of Profit by Segment. Save as Day01.pbix.',
      hint: 'Start screen > Learn with sample data, or Home > Get data > Sample dataset.',
      solution: 'Load sample > tick financials > Load. In Report view tick Profit and Segment in the Data pane; Power BI creates a clustered column chart. File > Save as > Day01.pbix.',
    },
  ],
  quiz: [
    { question: 'Which tool inside Power BI is used to clean and shape data?', options: ['DAX', 'Power Query', 'Report view', 'Power BI Mobile'], answer: 1, explanation: 'Power Query (the Transform data editor) cleans and shapes data and records steps in M.' },
    { question: '"Why did Nashik sales drop last quarter?" is which type of analytics?', options: ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'], answer: 1, explanation: 'Questions about the reason for a result are diagnostic.' },
    { question: 'What is needed to refresh a report in the Service from an Excel file on an office network drive?', options: ['Power BI Mobile', 'A DAX measure', 'On-premises data gateway', 'A bookmark'], answer: 2, explanation: 'The cloud Service cannot reach on-premises files without a gateway.' },
    { question: 'The semantic model was earlier called:', options: ['Dashboard', 'Dataset', 'Dataflow', 'Workspace'], answer: 1, explanation: 'Microsoft renamed datasets to semantic models in 2023.' },
    { question: 'Which is the correct order of the Power BI workflow?', options: ['Visualise > Get Data > Model > Publish', 'Get Data > Transform > Model > Visualise > Publish', 'Publish > Transform > Get Data > Visualise', 'Model > Get Data > Publish > Transform'], answer: 1, explanation: 'Data is first brought in and cleaned, then modelled, visualised and published.' },
  ],
};
