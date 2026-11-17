export default {
  id: 'power-bi-service',
  title: 'Power BI Service (Workspaces, Sharing, Apps, Semantic Models, Dataflows)',
  level: 'Intermediate',
  day: 14,
  duration: '4 hours',
  summary:
    "Learn how reports move from Power BI Desktop to the cloud and reach users: workspaces and roles, publishing, dashboards vs reports, apps, sharing, semantic models, dataflows, subscriptions, alerts, Analyze in Excel, export, deployment pipelines and endorsement. This is how Power BI is actually used inside companies.",
  objectives: [
    'Explain the Power BI Service components and licensing basics (Free, Pro, PPU, Premium/Fabric capacity)',
    'Create workspaces and assign the correct roles (Admin, Member, Contributor, Viewer)',
    'Publish reports, build dashboards by pinning tiles, and distribute content via apps and sharing',
    'Describe semantic models, dataflows, and how to reuse them',
    'Set up subscriptions, data alerts, Analyze in Excel and export options',
    'Use deployment pipelines and endorsement (promoted/certified) for governance',
  ],
  theory: [
    {
      heading: 'Desktop vs Service and licensing basics',
      content:
        "**Power BI Desktop** (free Windows app) is where you connect to data, transform it with Power Query, model it and build reports. The **Power BI Service** (app.powerbi.com, now part of Microsoft Fabric) is the cloud platform where you publish, share, collaborate, refresh data, and govern content. **Power BI Mobile** apps let users view content on phones and tablets.\n\nLicensing (per user unless capacity):",
      points: [
        'Free - can create content in My workspace only; cannot share or consume shared content unless it is in a Premium/Fabric capacity (F64 or larger) workspace',
        'Pro - required to publish to shared workspaces, share, and consume content from non-Premium workspaces',
        'Premium Per User (PPU) - Pro features plus most Premium features (larger models, 48 refreshes/day, deployment pipelines, XMLA, paginated, AI) for PPU users only',
        'Premium capacity / Fabric capacity (F SKUs) - dedicated capacity; with F64 or larger (or P SKUs), users with Free licences can view content',
        'Content creators always need Pro or PPU to publish and share',
      ],
      tip: "Power BI Premium P SKUs are being retired in favour of Microsoft Fabric F SKUs. In interviews, say 'Premium/Fabric capacity' to show you know the current landscape.",
    },
    {
      heading: 'Workspaces and roles',
      content:
        "A **workspace** is a container for collaboration: reports, dashboards, semantic models, dataflows, paginated reports and Fabric items. Each user also has a personal **My workspace** (not for team content).\n\nWorkspace roles (from most to least permissions):",
      points: [
        'Admin - everything, including adding/removing users of any role, updating/deleting the workspace',
        'Member - everything a Contributor can do, plus add users with lower roles (Member/Contributor/Viewer), publish/update the app, share items, and allow others to reshare',
        'Contributor - create, edit, delete content in the workspace, publish reports, schedule refresh (if owner of the semantic model); cannot add users or publish/update the app (unless allowed by admin setting) ',
        'Viewer - view and interact with content only; cannot edit. Viewers are subject to RLS; Admin/Member/Contributor are not (they have edit rights on the semantic model)',
      ],
      tip: "Best practice: give business consumers access through an app or the Viewer role, never Contributor. Use Microsoft Entra ID (Azure AD) security groups rather than individual users.",
    },
    {
      heading: 'Publishing and the report vs dashboard difference',
      content:
        "From Desktop, **Home > Publish** uploads the .pbix to a workspace. This creates two items: the **report** and the **semantic model** (dataset). Republishing with the same name replaces both.\n\n**Report** - one or more pages of interactive visuals built on ONE semantic model; supports slicers, filters, drill, bookmarks. Created in Desktop or the Service.\n\n**Dashboard** - a single canvas (Service only) of **tiles** pinned from one or more reports (and potentially multiple semantic models). Dashboards give a one-screen overview, support **data alerts** on card/KPI/gauge tiles, Q&A at the top, and featured dashboards. Clicking a tile opens the source report.",
      points: [
        'Report: multiple pages, one semantic model, highly interactive, created in Desktop/Service',
        'Dashboard: single page, many sources, tiles are snapshots linking to reports, limited interactivity (no slicers), Service-only',
        'Pin a single visual (pin icon on visual header) or a whole live report page (Pin to a dashboard > Pin live page)',
        'Alerts can only be set on dashboard tiles (cards, KPIs, gauges)',
      ],
      tip: "Classic interview question. Key phrase: 'A report is for analysis, a dashboard is for monitoring.'",
    },
    {
      heading: 'Sharing options: apps, direct sharing, links, Teams, embed',
      content:
        "**Workspace roles** - for collaborators who build content.\n\n**Apps** - the recommended way to distribute content to many consumers. A workspace can publish one app (with **audiences**, so different groups see different reports in the same app). Users get a clean, read-only experience with custom navigation; developers can keep working in the workspace and update the app when ready.\n\n**Direct sharing / links** - share a single report or dashboard with specific people or via a link (people in your organization, people with existing access, or specific people). Good for ad hoc sharing; harder to govern at scale.\n\n**Other channels** - Microsoft Teams (Power BI tab or app), SharePoint Online web part, Embed (secure embed for internal portals), **Publish to web** (public, anyone on the internet - never for confidential data; can be disabled by admins).\n\nAll consumers need a Pro/PPU licence unless the content is in a Premium/Fabric F64+ capacity.",
    },
    {
      heading: 'Semantic models (datasets) and reuse',
      content:
        "A **semantic model** (formerly called **dataset**) holds the data (Import), connection definitions (DirectQuery), tables, relationships, measures, RLS roles and refresh settings. Reports are just visuals on top of it.\n\n**Shared semantic models**: build one certified model and let many reports connect to it with **Get data > Power BI semantic models** (live connection). Benefits: one version of the truth, measures defined once, refresh once, less duplication.\n\nUsers need **Build** permission on a semantic model to create new reports from it, use Analyze in Excel, or query it. Settings in the Service include refresh schedule, gateway connection, data source credentials, parameters, Q&A, endorsement and **Large semantic model storage format**.\n\n**Composite models / DirectQuery for Power BI semantic models** let you extend a shared model with your own local tables and measures.",
      tip: "'Thin reports' (reports with a live connection to a shared model, no data of their own) are the enterprise best practice.",
    },
    {
      heading: 'Dataflows',
      content:
        "A **dataflow** is Power Query in the Service: reusable, cloud-based ETL whose output tables are stored in the lake (Dataflow Gen1 in Power BI uses Azure Data Lake storage; **Dataflow Gen2** in Fabric can write to destinations like a Lakehouse or Warehouse).\n\nUse dataflows when the same cleaned tables (e.g. Customer, Product, Date) are needed by multiple semantic models, so transformation logic is defined once and source systems are queried once. Semantic models then connect to the dataflow (Get data > Dataflows).",
      points: [
        'Dataflows separate data preparation (ETL) from modelling',
        'They have their own refresh schedule; refresh the dataflow before the dependent semantic models',
        'Premium/Fabric adds features: computed/linked entities, incremental refresh, enhanced compute engine',
      ],
    },
    {
      heading: 'Subscriptions, alerts, Analyze in Excel and export',
      content:
        "**Subscriptions** email a snapshot (image + link, or attachment as PDF/PowerPoint for reports) of a report page or dashboard on a schedule (daily, weekly, after data refresh). You can subscribe yourself and others (with permissions). **Dynamic per-recipient subscriptions** (Premium/Fabric) send personalised filtered content.\n\n**Data alerts** - on dashboard tiles of type card, KPI or gauge: notify by email/notification when a value goes above/below a threshold; can trigger Power Automate.\n\n**Analyze in Excel** - creates an Excel workbook with a live connection to the semantic model; users build PivotTables using the model's measures (requires Build permission). Great for finance users who love Excel - and always up to date.\n\n**Export options** - export visual data (summarized or underlying data, to .csv/.xlsx; limits apply: up to 150,000 rows to .xlsx and 30,000 rows to .csv from a visual), export report to PDF/PowerPoint, and **Live connected tables in Excel**. Admin settings can disable export.",
      tip: "When users export to Excel every day to build their own reports, suggest Analyze in Excel or a live connected table - same Excel experience, but governed and refreshed.",
    },
    {
      heading: 'Deployment pipelines and endorsement',
      content:
        "**Deployment pipelines** (Premium, PPU or Fabric capacity) manage the lifecycle of content across stages - typically **Development > Test > Production** - each stage being a workspace. You compare stages, deploy content forward with one click, and set **deployment rules** (e.g. change the data source or parameter from Dev DB to Prod DB per stage). Combined with **Git integration** (Fabric), this supports proper ALM (application lifecycle management).\n\n**Endorsement** helps users find trustworthy content:\n- **Promoted** - any content owner with write permission can promote an item they think is useful.\n- **Certified** - only users authorised by the Power BI/Fabric admin can certify, indicating it meets organisational quality standards.\n- **Master data** - marks items as the authoritative single source for core data.\n\nEndorsed semantic models appear at the top of the OneLake data hub / catalog.",
    },
  ],
  examples: [
    {
      title: 'Setting up a team workspace with correct roles',
      scenario: 'The Sales Analytics team (3 developers, 1 lead) and 200 sales staff need access to the Sales reports.',
      code:
        '1. Service > Workspaces > New workspace > "Sales Analytics" (assign to a capacity if available).\n2. Manage access:\n   - Lead BI developer: Admin (plus a second Admin as backup)\n   - BI developers (security group "SG-Sales-BI-Dev"): Member or Contributor\n   - Business testers: Viewer\n3. Publish reports from Desktop to this workspace.\n4. Create an app (Create app) for the 200 sales staff:\n   - Audience "All Sales" (security group SG-Sales-All) - Sales Overview, Product report\n   - Audience "Sales Managers" - plus Team Performance report\n5. Sales staff are NOT added to the workspace.',
      explanation:
        'Developers work in the workspace; consumers use the app. Security groups simplify onboarding/offboarding. Two admins avoid orphaned workspaces. Viewers and app users are subject to RLS if defined.',
    },
    {
      title: 'Building an executive dashboard from multiple reports',
      scenario: 'The CEO wants one screen with key numbers from the Sales report and the HR report.',
      code:
        '1. Open Sales report in Service > hover the Total Sales card > Pin visual > New dashboard "Executive Overview".\n2. Pin Profit Margin % card and Sales trend line chart to the same dashboard.\n3. Open HR report > pin Headcount card and Attrition % KPI.\n4. Open dashboard > Edit > arrange tiles; Tile details > set titles and custom links.\n5. On the Total Sales card tile > ... > Manage alerts > Add: Above 1,000,000 > Notify once a day.\n6. Set as featured dashboard or include in the app.',
      explanation:
        'Dashboards can combine tiles from different reports and semantic models - something a single report cannot do. Tiles refresh when their underlying semantic model refreshes (and on dashboard tile cache refresh). Alerts work on card tiles.',
    },
    {
      title: 'Thin report on a shared certified semantic model',
      scenario: 'Finance wants their own report but must use the same Sales measures as the Sales team.',
      code:
        '1. Sales team publishes "Sales Model" (semantic model only, with a blank or documentation report) and gets it Certified.\n2. Grant Finance users Build permission (semantic model > Manage permissions) or a workspace role.\n3. Finance analyst: Power BI Desktop > Get data > Power BI semantic models > Sales Model > Connect (live connection).\n4. Build visuals using existing measures; add report-level measures if needed.\n5. Publish the thin report to the Finance workspace.\n6. Optionally: Make changes to this model > adds a composite model (DirectQuery to the semantic model) to add local tables such as a Finance budget.',
      explanation:
        'One semantic model, many reports: single version of truth, one refresh, consistent definitions. The thin report contains no data, so it is small and fast to publish.',
    },
    {
      title: 'Using a dataflow for a shared Customer dimension',
      scenario: 'Three semantic models (Sales, Service, Marketing) all clean the same CRM customer table.',
      code:
        '1. Workspace > New > Dataflow (Gen1) or Dataflow Gen2 (Fabric).\n2. Get data from CRM > apply cleaning steps (trim names, standardise country, remove duplicates).\n3. Save as entity "Customer" and set a scheduled refresh (e.g. 05:00).\n4. In each Desktop model: Get data > Dataflows > select workspace > Customer.\n5. Schedule semantic model refreshes after the dataflow refresh (e.g. 06:00).',
      explanation:
        'Cleaning logic is defined once; the CRM is queried once; all models get identical customers. Refresh order matters: the dataflow must finish before dependent models refresh.',
    },
    {
      title: 'Dev-Test-Prod with a deployment pipeline',
      scenario: 'Changes must be tested before reaching business users, and Dev uses a dev SQL database.',
      code:
        '1. Create workspaces: Sales [Dev], Sales [Test], Sales [Prod] on Premium/PPU/Fabric capacity.\n2. Deployment pipelines > Create pipeline "Sales" > assign Dev workspace to Development stage.\n3. Deploy to Test. In Test stage > Deployment rules > semantic model > Data source rules: change server from sql-dev to sql-test (or use a parameter rule).\n4. Testers validate; Deploy to Production with Prod rules (sql-prod).\n5. Update the app from the Prod workspace.',
      explanation:
        'Pipelines copy reports, semantic models, dataflows etc. between stages while deployment rules swap connections, so the same .pbix works in every environment. Business users only see Production via the app.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a report and a dashboard?',
      a: 'A report has one or more pages, is built on a single semantic model, and is fully interactive (slicers, filters, drill, bookmarks); it can be built in Desktop or Service. A dashboard is a single-page canvas, Service-only, made of tiles pinned from one or more reports/semantic models; it has limited interactivity (no slicers or filters), but supports data alerts, Q&A and featured dashboards. Clicking a tile opens the underlying report. Report = analysis; dashboard = monitoring.',
      level: 'Easy',
    },
    {
      q: 'Explain the four workspace roles.',
      a: 'Admin: full control, manage all users and the workspace. Member: everything Contributor can do plus add users (Member and below), share content and publish/update the app. Contributor: create, edit, delete and publish content, but cannot manage access or (by default) publish the app. Viewer: read-only access to content. RLS applies only to Viewers (and app/shared users); Admins, Members and Contributors bypass RLS in that workspace because they have write access to the semantic model.',
      level: 'Easy',
    },
    {
      q: 'What is a Power BI app and why use it over sharing reports directly?',
      a: 'An app is a packaged, read-only collection of content from one workspace, with custom navigation and audiences (different user groups see different items). Advantages: separation between development (workspace) and consumption (app), controlled releases (changes appear only when you update the app), easy distribution to large groups, better governance than many individual shares, and users can install it from AppSource within the org or receive it automatically.',
      level: 'Medium',
    },
    {
      q: 'What licence does a user need to view a report?',
      a: 'If the workspace is on shared (non-Premium) capacity, both publisher and viewer need Pro (or PPU; PPU content requires PPU viewers). If the workspace is in Premium (P) or Fabric F64+ capacity, viewers can use a Free licence; creators still need Pro/PPU. Publish to web is anonymous but public. Fabric capacities smaller than F64 still require Pro licences for viewers.',
      level: 'Medium',
    },
    {
      q: 'What is a semantic model and what is Build permission?',
      a: 'A semantic model (formerly dataset) is the model behind reports: tables, data (Import) or connections (DirectQuery), relationships, measures, RLS and refresh settings. Build permission allows a user to create new content from the model: new reports (live connection), Analyze in Excel, composite models, and querying via XMLA/DAX. Read permission alone allows viewing reports built on it.',
      level: 'Medium',
    },
    {
      q: 'Dataflow vs semantic model - what is the difference?',
      a: 'A dataflow is reusable ETL (Power Query online) that produces cleaned tables stored in the lake; it has no relationships, measures or visuals. A semantic model is the analytical model with relationships, DAX measures, RLS, which reports use. Dataflows feed semantic models. Use dataflows to centralise preparation of shared tables and reduce load on sources.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Finance users export data from your report to Excel every morning to make pivot tables. What do you recommend?',
      a: 'Recommend Analyze in Excel (or Excel live connected PivotTables via Get Data > From Power BI): they get pivot tables connected live to the governed semantic model with all measures, always refreshed, respecting RLS, without exporting raw data. Ensure they have Build permission. If they need fixed formatted extracts, consider a paginated report with a subscription delivering Excel attachments.',
      level: 'Medium',
    },
    {
      q: 'How do data alerts work and what are their limitations?',
      a: 'Alerts are set on dashboard tiles of cards, KPIs and gauges in the Service. You define a condition (above/below a threshold) and frequency (at most once an hour or once a day); when the semantic model refresh produces a value meeting the condition, you get a notification and optional email, and it can trigger Power Automate. Limitations: only those tile types, only on dashboards (not report visuals), each user sets their own, they evaluate after refresh, and they are not supported on streaming tiles in some cases.',
      level: 'Medium',
    },
    {
      q: 'What are deployment pipelines and what do deployment rules do?',
      a: 'Deployment pipelines (Premium/PPU/Fabric) manage content across stages (Dev, Test, Prod), each a workspace. You compare stages and deploy items forward. Deployment rules change data sources or parameter values per stage, so a semantic model points to the dev database in Dev and the production database in Prod without editing the .pbix. They support ALM along with Git integration in Fabric.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between Promoted and Certified content?',
      a: 'Promoted: any user with write permission on the item can promote it to signal it is valuable and ready for use. Certified: only users or groups authorised by the tenant admin can certify, indicating it meets organisational standards (reviewed, reliable). Both appear higher in search/OneLake catalog; certified carries more trust. There is also Master data endorsement for authoritative core data.',
      level: 'Easy',
    },
    {
      q: 'Scenario: A developer left the company and the reports he owned stopped refreshing. What happened and how do you prevent it?',
      a: 'Scheduled refresh runs with the semantic model owner\'s stored credentials/gateway bindings; when the account is disabled, refresh fails. Fix: a workspace Admin/Member takes over the semantic model (Settings > Take over), re-enters credentials and gateway mapping. Prevention: use service accounts or service principals for data source credentials, keep at least two admins per workspace, use security groups, and avoid content in My workspace.',
      level: 'Hard',
    },
    {
      q: 'Why should you avoid Publish to web for business reports?',
      a: 'Publish to web creates a public URL and embed code: anyone on the internet can view the report without signing in, RLS is not applied, and the data is effectively public. It is only for public data (e.g. open data on a public website). For internal sharing use apps, workspace access, secure embed or SharePoint/Teams embedding. Admins often disable it in tenant settings.',
      level: 'Medium',
    },
    {
      q: 'What happens when you republish a .pbix with the same name to a workspace?',
      a: 'Power BI asks to Replace; the report and semantic model are overwritten in place, keeping their IDs. Dashboard tiles pinned from the report remain (unless the visual was removed), apps show the update after the app is updated, and the scheduled refresh settings are kept, but you may need to re-enter credentials if data sources changed. Using deployment pipelines is safer for production.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Publish your Sales .pbix to a new workspace "Sales Demo". Identify the items created.',
      hint: 'Home > Publish.',
      solution:
        'Create workspace in Service > Desktop: Home > Publish > select Sales Demo. Two items appear: the Report "Sales" and the Semantic model "Sales". Open the semantic model settings to see refresh, credentials and gateway options.',
    },
    {
      task: 'Create a dashboard "Daily Sales Monitor" with 3 tiles and an alert when Total Sales today drops below 50,000.',
      hint: 'Pin visuals; alerts on card tiles.',
      solution:
        'Open report > pin the Total Sales card (new dashboard Daily Sales Monitor), Orders card and Sales trend chart. On the dashboard, Total Sales tile > ... > Manage alerts > + Add alert rule > Condition: Below, Threshold: 50000, Frequency: At most once a day, Send email: on.',
    },
    {
      task: 'Plan access for: 2 BI developers, 1 QA analyst who must not edit, 150 regional managers who should only see their region.',
      hint: 'Roles + app + RLS.',
      solution:
        'Developers: Member (one also Admin; ideally 2 admins). QA analyst: Viewer. Regional managers: app audience via a security group, no workspace role. Implement dynamic RLS on the semantic model and map the managers group to the role in Security settings. Viewers/app users are subject to RLS; test with View as.',
    },
    {
      task: 'Create a thin report in Desktop connected to the published Sales semantic model and add a report-level measure.',
      hint: 'Get data > Power BI semantic models.',
      solution:
        'Desktop > Get data > Power BI semantic models > choose Sales > Connect. The Data pane shows the model fields (no Power Query/Model view editing). New measure (report-level): Sales per Order = DIVIDE ( [Total Sales], [Orders] ). Build visuals, publish to another workspace. Requires Build permission.',
    },
    {
      task: 'Set up a weekly subscription that emails the Sales Overview page to you and your manager every Monday at 08:00 with a PDF attachment.',
      hint: 'Subscribe button on the report.',
      solution:
        'Open report > Subscribe to report > Create subscription (Standard) > recipients: you + manager, page: Sales Overview, Frequency: Weekly - Monday 08:00, Attach full report as PDF (or the page), Save. Recipients need access to the report (and licence) unless capacity rules apply.',
    },
    {
      task: 'Explain step by step how to certify a semantic model in your organization.',
      hint: 'Admin portal setting + semantic model settings.',
      solution:
        '1. Fabric/Power BI admin enables Certification in the Admin portal (Tenant settings > Export and sharing / Information protection area - "Certification") and specifies the security group allowed to certify, plus a documentation URL.\n2. Authorised user opens semantic model > Settings > Endorsement > Certified > adds a description > Apply.\n3. The model now shows a Certified badge and ranks higher in discovery.',
    },
  ],
  quiz: [
    {
      question: 'Which workspace role can publish or update the workspace app by default but cannot delete the workspace?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 1,
      explanation: 'Members can publish/update the app and add users with lower roles; only Admins can delete the workspace.',
    },
    {
      question: 'Data alerts can be configured on:',
      options: ['Any report visual', 'Dashboard tiles such as cards, KPIs and gauges', 'Paginated reports only', 'Dataflows'],
      answer: 1,
      explanation: 'Alerts are set on dashboard tiles of type card, KPI and gauge.',
    },
    {
      question: 'Which permission is required to use Analyze in Excel on a semantic model?',
      options: ['Read', 'Build', 'Reshare', 'Write on the workspace only'],
      answer: 1,
      explanation: 'Build permission allows creating new content (reports, Excel pivots) from the semantic model.',
    },
    {
      question: 'Users with a Free licence can view shared content when it is hosted in:',
      options: ['Any workspace', 'My workspace', 'A Premium P or Fabric F64 (or larger) capacity workspace', 'A Pro workspace with an app'],
      answer: 2,
      explanation: 'Free users can consume content in Premium P SKU or Fabric F64+ capacity workspaces.',
    },
    {
      question: 'What is the main purpose of a dataflow?',
      options: ['Visualise data', 'Reusable cloud data preparation (Power Query) shared by multiple models', 'Define RLS roles', 'Schedule email subscriptions'],
      answer: 1,
      explanation: 'Dataflows centralise ETL so multiple semantic models reuse the same prepared tables.',
    },
    {
      question: 'Who can mark a semantic model as Certified?',
      options: ['Any workspace Viewer', 'Any content owner', 'Only users authorised by the tenant admin', 'Only Microsoft'],
      answer: 2,
      explanation: 'Certification is restricted to users/groups specified by the admin; Promotion is open to content owners.',
    },
  ],
};
