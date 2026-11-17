export default {
  id: 'day-04-components-workspaces-reports-dashboards',
  title: 'Power BI Components, Workspaces, Reports, Dashboards, Datasets/Semantic Models',
  module: 'Module 1: Introduction to Power BI',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Understand the building blocks of Power BI – components, workspaces, semantic models, reports and dashboards – and how they relate, so you can organise and share content correctly.',
  objectives: [
    'List the Power BI components and the role of each',
    'Create a workspace and assign roles (Admin, Member, Contributor, Viewer)',
    'Explain semantic models (datasets) and why many reports can share one',
    'Differentiate reports and dashboards clearly',
    'Organise content into workspaces and apps for a real team',
  ],
  theory: [
    {
      heading: 'Power BI components',
      content:
        `- **Power BI Desktop** – build queries, model and reports.\n- **Power BI Service** – cloud hub for sharing, refresh, dashboards, apps.\n- **Power BI Mobile** – view content on phones/tablets.\n- **On-premises data gateway** – bridge for refreshing on-premises data.\n- **Power BI Report Server** – host reports on your own servers (no cloud).\n- **Power BI Report Builder** – design **paginated reports** (pixel-perfect, printable, e.g. invoices).\n- **Power BI Embedded** – put reports inside your own web application.\n\nInside Desktop there are three engines: **Power Query** (data preparation, M language), the **VertiPaq/Analysis Services** engine (semantic model, DAX) and the **report canvas** (visuals).`,
    },
    {
      heading: 'Workspaces',
      content:
        `A **workspace** is a shared folder in the Service where a team keeps related content: semantic models, reports, dashboards, dataflows and other Fabric items. Think of it as a **project office room** – only people given a key (role) can enter.\n\n- **My workspace** – personal, for practice. Do not use it for team production content.\n- **Shared workspaces** – created by **Workspaces > + New workspace**. Each has a licence mode (Pro, PPU, Fabric capacity, etc.).\n\nWorkspace roles:`,
      points: [
        '**Admin** – everything, including adding/removing people and deleting the workspace.',
        '**Member** – publish, edit, share, add Members/Contributors/Viewers (not Admins), publish/update the app.',
        '**Contributor** – publish and edit content, cannot share or manage access (can update the app only if allowed by the admin setting).',
        '**Viewer** – read-only; can interact with reports but not edit.',
      ],
      tip: 'Common pattern: developers are Contributors/Members in the workspace; business users get access through an App, not the workspace.',
    },
    {
      heading: 'Semantic models (formerly datasets)',
      content:
        `A **semantic model** contains the data tables, relationships, DAX measures, calculated columns, hierarchies, formatting and RLS roles. It is the **single source of truth** that reports query.\n\nOne semantic model can feed **many reports**. For example, a "Sales Model" semantic model can power a Sales Overview report, a Product report and a City Manager report. In Desktop use **Home > Get data > Power BI semantic models** to build a new report on top of an existing published model (a **live connection** – no data is copied).\n\nIn the Service, semantic model settings include **scheduled refresh**, **data source credentials**, **gateway connection**, **endorsement** (Promoted/Certified) and **security** (RLS membership).`,
    },
    {
      heading: 'Reports',
      content:
        `A **report** is a multi-page, interactive view of one semantic model. Each page holds visuals that cross-filter each other. Reports support slicers, filters pane, drill down, drill through, bookmarks, tooltips and export.\n\nA report is always connected to **exactly one** semantic model (which itself can be a composite model).`,
    },
    {
      heading: 'Dashboards',
      content:
        `A **dashboard** is a **single page** of **tiles** pinned from one or more reports (even from different semantic models), Q&A answers, images, text or videos. It is a "headlines board".\n\nDashboards are Service-only, support **data alerts** on number tiles, and are good for executives who want a quick glance. Clicking a tile takes you to the source report for details.`,
      points: [
        'Report: many pages, one semantic model, full interactivity, created in Desktop or Service.',
        'Dashboard: one page, many sources, limited interactivity (no slicers, tiles do not cross-filter), Service only, alerts supported.',
      ],
    },
    {
      heading: 'Apps',
      content:
        `An **App** packages selected reports and dashboards from a workspace into a clean, read-only experience for a large audience. You publish it from the workspace (**Create app**), choose content, navigation and **audiences** (different groups can see different reports in the same app). After changes in the workspace, click **Update app** so users see them.`,
    },
  ],
  examples: [
    {
      title: 'Create a team workspace and add roles',
      scenario: 'Create a "Sales Analytics" workspace for a team of four.',
      table: {
        headers: ['Person', 'Job', 'Workspace role'],
        rows: [
          ['Asha', 'BI lead', 'Admin'],
          ['Ravi', 'Power BI developer', 'Member'],
          ['Neha', 'Junior developer', 'Contributor'],
          ['Sameer', 'Sales manager (reviewer)', 'Viewer'],
        ],
      },
      steps: [
        'In the Service click Workspaces > + New workspace.',
        'Name it "Sales Analytics", optionally add a description, expand Advanced to pick a licence mode, click Apply.',
        'In the workspace click Manage access > + Add people or groups.',
        'Type each email, choose the role from the table and click Add.',
      ],
      result: 'The workspace lists four people with Admin, Member, Contributor and Viewer roles.',
      explanation: 'Roles follow least privilege: give each person only what they need.',
    },
    {
      title: 'Build two reports on one semantic model',
      scenario: 'The published "Sales Model" contains Sales, Product, Customer and Date. Build a separate Product report without copying data.',
      steps: [
        'Open a new blank Power BI Desktop file.',
        'Home > Get data > Power BI semantic models.',
        'Pick "Sales Model" from the OneLake catalog list and click Connect.',
        'Note the status bar says "Connected live to the Power BI semantic model".',
        'Build a bar chart of Sales[SalesAmount] by Product[Category] and save as "Product Report.pbix".',
        'Home > Publish to the same workspace.',
      ],
      result: 'The workspace now has one semantic model and two reports. Lineage view shows both reports linked to Sales Model.',
      explanation: 'A live connection reuses the model so measures are defined once and refreshed once.',
    },
    {
      title: 'Report vs dashboard comparison',
      scenario: 'Explain to a manager which one to use.',
      table: {
        headers: ['Feature', 'Report', 'Dashboard'],
        rows: [
          ['Pages', 'Many', 'One'],
          ['Data sources', 'One semantic model', 'Many reports/models'],
          ['Slicers', 'Yes', 'No'],
          ['Created in', 'Desktop or Service', 'Service only'],
          ['Data alerts', 'No', 'Yes (card, KPI, gauge tiles)'],
          ['Best for', 'Analysis and exploration', 'At-a-glance monitoring'],
        ],
      },
      steps: [
        'List the manager\'s needs (explore vs monitor).',
        'Compare against the table.',
        'Recommend a dashboard for daily KPIs and reports for deeper analysis.',
      ],
      result: 'Manager uses the dashboard each morning and clicks tiles to open detailed reports.',
      explanation: 'They work together: the dashboard is the summary, the report is the detail.',
    },
    {
      title: 'Publish an App with two audiences',
      scenario: 'Sales managers should see both reports; city staff only the Sales report.',
      steps: [
        'Open the Sales Analytics workspace and click Create app.',
        'On Setup, enter name "Sales App" and a description.',
        'On Content, add the Sales report, Product report and dashboard.',
        'On Audience, rename the default audience "Managers" and add the managers group.',
        'Click + New audience "City Staff", hide Product report for this audience, add the staff group.',
        'Click Publish app.',
      ],
      result: 'Managers see three items; City Staff see the Sales report and dashboard only.',
      explanation: 'App audiences control visibility of content without creating separate workspaces.',
    },
  ],
  interview: [
    { q: 'What is the difference between a report and a dashboard?', a: 'A report has multiple pages built on one semantic model with full interactivity (slicers, drill). A dashboard is a single page of pinned tiles from many reports/models, created only in the Service, supports alerts but not slicers.', level: 'Easy' },
    { q: 'What are the workspace roles?', a: 'Admin, Member, Contributor and Viewer. Admin manages everything, Member can share and publish apps, Contributor can create and edit content, Viewer can only view.', level: 'Easy' },
    { q: 'Why share one semantic model across many reports?', a: 'Single source of truth: measures are defined once, data refreshes once, less storage, consistent numbers across reports, and it can be endorsed/certified.', level: 'Medium' },
    { q: 'What is a live connection?', a: 'Connecting Desktop to an existing published semantic model (or Analysis Services). No data is imported; the report queries the remote model. You can add report-level measures but not change the model (unless you convert it to a composite model with DirectQuery for Power BI semantic models).', level: 'Medium' },
    { q: 'Workspace access vs App access – which do you give to business users?', a: 'App access. Apps give a curated read-only view, audiences, and isolation from in-progress work in the workspace. Workspace roles are for people who build content.', level: 'Medium' },
    { q: 'What is Power BI Report Builder used for?', a: 'Creating paginated reports (.rdl) – pixel-perfect, printable reports such as invoices or statements that may span many pages, published to the Service or Report Server.', level: 'Easy' },
    { q: 'Scenario: a Contributor says they cannot share a report with a colleague. Why?', a: 'Contributors cannot share or manage permissions. A Member or Admin must share it, or the user must be given a higher role, or the content distributed via an App.', level: 'Hard' },
    { q: 'What is endorsement of a semantic model?', a: 'Labelling it as Promoted (owner says it is ready) or Certified (authorised reviewers verified it) so users can find trustworthy models in the OneLake catalog.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a workspace named "Day04 Practice" and add a classmate as Viewer.', hint: 'Workspaces > + New workspace, then Manage access.', solution: 'Create workspace > Manage access > Add people > email > Viewer > Add.' },
    { task: 'Publish a report and then create a second report connected live to its semantic model.', hint: 'Get data > Power BI semantic models.', solution: 'Publish first .pbix > new Desktop file > Get data > Power BI semantic models > select model > build visual > publish.' },
    { task: 'Make a dashboard with tiles from two different reports.', hint: 'Pin to existing dashboard.', solution: 'Pin a visual from report 1 to a new dashboard, then from report 2 choose Existing dashboard when pinning.' },
    { task: 'Write a 3-line explanation of semantic model vs report for a non-technical manager.', hint: 'Use the kitchen/menu analogy.', solution: 'The semantic model is the kitchen with all ingredients and recipes (data and calculations). The report is the plated dish – the charts you see. One kitchen can serve many dishes.' },
  ],
  quiz: [
    { question: 'Which workspace role can add people to the workspace but cannot delete it?', options: ['Admin', 'Member', 'Contributor', 'Viewer'], answer: 1, explanation: 'Members can add others (except Admins) but only Admins can delete the workspace.' },
    { question: 'A report is connected to how many semantic models?', options: ['Exactly one', 'Up to five', 'Unlimited', 'None'], answer: 0, explanation: 'A report always uses exactly one semantic model.' },
    { question: 'Which supports slicers?', options: ['Dashboard', 'Report', 'Both', 'Neither'], answer: 1, explanation: 'Slicers are report visuals; dashboards show pinned tiles.' },
    { question: 'The best way to distribute content to 500 read-only users is:', options: ['Add all as workspace Admin', 'Email the .pbix', 'Publish an App', 'Use My workspace'], answer: 2, explanation: 'Apps are designed for large read-only audiences.' },
    { question: 'Paginated reports are designed in:', options: ['Power BI Mobile', 'Power BI Report Builder', 'Power Query', 'Excel'], answer: 1, explanation: 'Report Builder creates .rdl paginated reports.' },
  ],
};
