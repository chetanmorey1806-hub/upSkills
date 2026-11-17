export default {
  id: 'day-03-service-mobile-desktop-vs-service',
  title: 'Power BI Service, Power BI Mobile, Power BI Desktop vs Service',
  module: 'Module 1: Introduction to Power BI',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn the cloud side of Power BI: what the Power BI Service (app.powerbi.com) does, how reports reach phones through Power BI Mobile, and exactly which tasks belong in Desktop and which in the Service.',
  objectives: [
    'Sign in to the Power BI Service and navigate Home, Workspaces, Apps, Browse and OneLake catalog',
    'Publish a report from Desktop to a workspace and open it in the Service',
    'Use Power BI Mobile features: viewing, favourites, alerts and mobile layout',
    'Compare Power BI Desktop and Service and choose the right tool for a task',
    'Understand the basic licence types: Free, Pro, Premium Per User and Fabric capacity',
  ],
  theory: [
    {
      heading: 'What is the Power BI Service?',
      content:
        `The **Power BI Service** is the cloud (SaaS) part of Power BI, opened in a browser at **app.powerbi.com**. Desktop is your **kitchen** where food is cooked; the Service is the **restaurant** where it is served to many customers, kept fresh and protected.\n\nIn the Service you can:\n\n- store content in **workspaces**,\n- view and interact with **reports**,\n- pin visuals to **dashboards**,\n- set **scheduled refresh** for semantic models,\n- **share** content, publish **apps**, set **permissions** and **row-level security** membership,\n- create **subscriptions** (emails) and **alerts**,\n- use Fabric items such as dataflows, lakehouses and notebooks (with Fabric capacity).`,
      points: [
        'Sign in needs a **work or school** account (Microsoft Entra ID). Personal Gmail/Outlook.com accounts cannot sign up.',
        'Left navigation: **Home**, **Create**, **Browse**, **OneLake catalog**, **Apps**, **Metrics**, **Monitor**, **Learn**, **Workspaces**, **My workspace**.',
      ],
    },
    {
      heading: 'Publishing from Desktop to the Service',
      content:
        `1. Save your .pbix in Desktop.\n2. Click **Home > Publish**.\n3. Sign in if asked and choose a destination workspace (My workspace or a shared workspace).\n4. Click **Select**. When it finishes, click **Open 'filename.pbix' in Power BI**.\n\nPublishing creates **two items** in the workspace: a **semantic model** (data + model) and a **report** (pages and visuals), both with the file name. Publishing again with the same name **replaces** them.`,
      tip: 'Dashboards are not published from Desktop. You create them in the Service by pinning visuals from a report.',
    },
    {
      heading: 'Power BI Mobile',
      content:
        `**Power BI Mobile** apps are available for Android and iOS (and Windows). Signing in with the same work account shows the same workspaces, apps and reports.\n\nKey mobile features:\n\n- View and interact with reports and dashboards (tap to filter, drill).\n- **Favourites** for quick access.\n- **Data alerts** on cards/KPIs/gauges in dashboards: get a notification when a value crosses a threshold.\n- **Annotate and share** a snapshot of a visual.\n- **Mobile layout**: in Desktop, **View > Mobile layout** lets you design a phone-friendly arrangement of visuals for each page. Without it, the phone shows the normal landscape page.\n- Scan **QR codes** to open a report.`,
    },
    {
      heading: 'Power BI Desktop vs Power BI Service',
      content:
        `Both can do some of the same things, but each has a main purpose: **Desktop = build**, **Service = share and manage**.`,
      points: [
        '**Power Query (full)**: Desktop yes; Service only through dataflows / web modeling with limits.',
        '**Data modeling and DAX**: full in Desktop; the Service supports editing the semantic model in the browser, but Desktop remains the main tool.',
        '**Report creation**: both (Service can create and edit reports in the browser).',
        '**Dashboards**: Service only.',
        '**Apps, sharing, permissions, subscriptions**: Service only.',
        '**Scheduled refresh and gateways**: Service only (Desktop refreshes manually).',
        '**Row-level security**: roles are defined in Desktop; members are assigned in the Service.',
        '**Cost**: Desktop free; Service sharing needs Pro/PPU licences or Fabric/Premium capacity.',
      ],
    },
    {
      heading: 'Licences in simple words',
      content:
        `- **Free** – can use Desktop and My workspace, but cannot share or consume shared content (unless content is in a Premium/Fabric F64+ capacity).\n- **Pro** – per-user licence to publish to shared workspaces, share and collaborate. Both sender and receiver need Pro (outside capacity).\n- **Premium Per User (PPU)** – Pro features plus Premium features (larger models, more refreshes, deployment pipelines, XMLA) per user.\n- **Fabric capacity (F SKUs) / Premium capacity** – the organisation buys capacity; with F64 or higher, free-licence viewers can read content in that capacity.`,
      tip: 'Exact prices and limits change; in interviews explain the concept (per-user vs capacity) rather than quoting numbers.',
    },
  ],
  examples: [
    {
      title: 'Publish your first report',
      scenario: 'Publish Day02.pbix (Sales by City chart) to My workspace.',
      steps: [
        'Open Day02.pbix in Power BI Desktop and click File > Save.',
        'Click Home > Publish.',
        'Sign in with your work/school account if prompted.',
        'Select "My workspace" and click Select.',
        'Wait for "Success!" and click "Open \'Day02.pbix\' in Power BI".',
        'In the browser, open My workspace and look at the item list.',
      ],
      table: {
        headers: ['Name', 'Type', 'Owner'],
        rows: [
          ['Day02', 'Report', 'You'],
          ['Day02', 'Semantic model', 'You'],
        ],
      },
      result: 'Two items named Day02 appear: one Report and one Semantic model.',
      explanation: 'The Service always separates the data (semantic model) from the visuals (report) so more reports can reuse the same model.',
    },
    {
      title: 'Pin a visual to a dashboard',
      scenario: 'Management wants one screen with the Total Sales card from several reports.',
      steps: [
        'In the Service, open the Day02 report.',
        'Hover over the Sales by City chart and click the pin icon.',
        'Choose "New dashboard", type "Management Overview", click Pin.',
        'Click "Go to dashboard" in the pop-up.',
      ],
      result: 'A new dashboard with one tile showing Sales by City. Clicking the tile opens the underlying report page.',
      explanation: 'Dashboards are Service-only, single-page canvases made of pinned tiles from one or more reports.',
    },
    {
      title: 'Design a mobile layout',
      scenario: 'Sales managers open the report on their phones and find the visuals too small.',
      steps: [
        'In Desktop, open the report page and click View > Mobile layout.',
        'From the Page visuals pane drag the Total Sales card to the top of the phone canvas.',
        'Drag the Sales by City chart below it and resize it to full width.',
        'Click View > Mobile layout again to return, then Home > Publish.',
        'Open the report in Power BI Mobile on a phone held in portrait.',
      ],
      result: 'In portrait mode the phone shows the card and chart stacked and readable.',
      explanation: 'Mobile layout is a separate arrangement of the same visuals; it does not change the desktop layout.',
    },
    {
      title: 'Desktop or Service? Decide for each task',
      scenario: 'You receive a list of tasks for a new project.',
      table: {
        headers: ['Task', 'Where'],
        rows: [
          ['Remove blank rows from CSV', 'Desktop (Power Query)'],
          ['Create relationship Customer-Sales', 'Desktop (Model view)'],
          ['Refresh every day at 7 AM', 'Service (Scheduled refresh)'],
          ['Pin KPIs to one screen', 'Service (Dashboard)'],
          ['Give 50 users read access', 'Service (App / Share)'],
          ['Create RLS role "Pune"', 'Desktop (Modeling > Manage roles)'],
          ['Add users to role "Pune"', 'Service (Semantic model > Security)'],
        ],
      },
      steps: [
        'For each task ask: is it building (Desktop) or sharing/managing (Service)?',
        'Remember the Service-only items: dashboards, apps, scheduled refresh, subscriptions, role membership.',
        'Fill in the Where column.',
      ],
      result: 'The completed table above.',
      explanation: 'Building logic lives in Desktop; distribution and automation live in the Service.',
    },
  ],
  interview: [
    { q: 'What is the difference between Power BI Desktop and Power BI Service?', a: 'Desktop is a free Windows authoring tool for connecting, transforming, modelling and building reports. The Service is the cloud platform for publishing, sharing, dashboards, apps, scheduled refresh, gateways, subscriptions and security management.', level: 'Easy' },
    { q: 'What gets created when you publish a .pbix?', a: 'A semantic model and a report with the same name in the chosen workspace. Republishing with the same name overwrites both.', level: 'Easy' },
    { q: 'Can you create a dashboard in Power BI Desktop?', a: 'No. Dashboards are created only in the Service by pinning tiles from reports (or Q&A results). Desktop creates reports.', level: 'Easy' },
    { q: 'What are data alerts and where can you set them?', a: 'Data alerts send a notification when a value crosses a threshold. They are set on card, KPI and gauge tiles in dashboards in the Service or the mobile app, not on report visuals.', level: 'Medium' },
    { q: 'A free-licence user cannot open the report you shared. Why?', a: 'Sharing in a shared (non-capacity) workspace requires both the publisher and the viewer to have Pro or PPU licences. Either give the viewer a Pro licence or host the content in a Fabric F64+ / Premium capacity workspace where free users can view.', level: 'Medium' },
    { q: 'How do you make a report look good on phones?', a: 'Use View > Mobile layout in Desktop to arrange selected visuals on a portrait phone canvas for each page, then publish. Power BI Mobile automatically shows the mobile layout in portrait mode.', level: 'Medium' },
    { q: 'Scenario: you change a measure in Desktop. How do users in the Service see it?', a: 'Republish the .pbix to the same workspace with the same name; it replaces the semantic model and report. If users consume through an App, update the app so they get the change.', level: 'Hard' },
  ],
  practice: [
    { task: 'Sign in to app.powerbi.com and list the items in the left navigation.', hint: 'You need a work or school account (or a Microsoft 365 developer/trial tenant).', solution: 'Home, Create, Browse, OneLake catalog, Apps, Metrics, Monitor, Learn, Workspaces, My workspace (names may vary slightly by tenant).' },
    { task: 'Publish any report to My workspace and open it in the browser.', hint: 'Home > Publish.', solution: 'Save .pbix > Home > Publish > My workspace > Select > Open in Power BI. A report and a semantic model appear.' },
    { task: 'Create a dashboard called "Daily KPIs" with two pinned visuals.', hint: 'Pin icon on hover in the Service report.', solution: 'Open report > hover visual > pin > New dashboard "Daily KPIs" > Pin. Repeat for second visual choosing Existing dashboard.' },
    { task: 'Make a table of five tasks done only in the Service.', hint: 'Think sharing and automation.', solution: 'Dashboards, Apps, Scheduled refresh, Subscriptions, Assigning users to RLS roles (also gateways, workspace access).' },
  ],
  quiz: [
    { question: 'What is the URL of the Power BI Service?', options: ['powerbi.microsoft.desktop', 'portal.azure.com', 'app.powerbi.com', 'office.com/powerbi-desktop'], answer: 2, explanation: 'The Service is at app.powerbi.com.' },
    { question: 'Which of these can only be created in the Service?', options: ['Report', 'Dashboard', 'Measure', 'Relationship'], answer: 1, explanation: 'Dashboards are built by pinning in the Service.' },
    { question: 'Scheduled refresh is configured in:', options: ['Power BI Service semantic model settings', 'Power Query Editor', 'Power BI Desktop Options', 'Power BI Mobile'], answer: 0, explanation: 'Semantic model > Settings > Refresh in the Service.' },
    { question: 'Data alerts can be set on:', options: ['Any report visual', 'Tables in Data view', 'Power Query steps', 'Card, KPI and gauge dashboard tiles'], answer: 3, explanation: 'Alerts work on dashboard tiles showing a single number.' },
    { question: 'Publishing a .pbix creates:', options: ['Only a dashboard', 'Only a semantic model', 'A report and a semantic model', 'An app'], answer: 2, explanation: 'Both a report and a semantic model are created.' },
  ],
};
