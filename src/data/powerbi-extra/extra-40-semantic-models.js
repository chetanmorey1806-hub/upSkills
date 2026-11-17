export default {
  id: 'extra-40-semantic-models',
  title: 'Semantic Models',
  module: 'Extra: Advanced & Administration',
  extraNo: 40,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'A semantic model (called a dataset before November 2023) is the published data model behind Power BI reports: tables, relationships, measures, security and refresh settings. Building shared, certified semantic models that many thin reports reuse is the foundation of scalable, trusted Power BI.',
  objectives: [
    'Explain what a semantic model contains and why Microsoft renamed datasets to semantic models',
    'Publish a semantic model and manage its settings: credentials, gateway, refresh and storage format',
    'Build thin reports with a live connection and understand Build permission',
    'Use endorsement (Promoted, Certified, Master data), lineage view and impact analysis',
    'Know modern authoring options: web modeling, PBIP/TMDL and Fabric semantic link',
  ],
  theory: [
    {
      heading: 'What is a semantic model?',
      content:
        "When you click **Publish** in Power BI Desktop, two items appear in the workspace: a **report** (pages and visuals) and a **semantic model** (the data and logic).\n\nThe semantic model contains:\n- tables and their data (Import) or connection info (DirectQuery / Direct Lake),\n- relationships, hierarchies and the date table setting,\n- **DAX measures**, calculated columns, calculated tables, calculation groups,\n- **RLS/OLS roles**, display folders, descriptions, formats and synonyms,\n- refresh schedule, credentials and gateway settings in the Service.\n\nIt is called **semantic** because it translates raw tables into business meaning: \"Total Sales\", \"Customer City\", \"Last Year\". Microsoft renamed **datasets** to **semantic models** in November 2023 to avoid confusion with other kinds of datasets in Fabric. Older documents, APIs and interview questions may still say dataset.",
    },
    {
      heading: 'One model, many reports (thin reports)',
      content:
        "A common beginner mistake is to put a full copy of the model inside every PBIX. Ten reports then mean ten refreshes, ten copies of measure logic and ten different answers.\n\nBetter pattern:\n1. Build and publish **one** model (often a PBIX with no or minimal report pages).\n2. Build each report as a **thin report**: Home > Get data > **Power BI semantic models** > choose the model > **Connect**. This is a **live connection**: the report has no own data, it uses the model's tables and measures.\n3. Report authors can add **report-level measures** but cannot change tables or relationships (unless they convert to a composite model).\n\nTo build reports on someone else's model a user needs **Build** permission on that semantic model (workspace Contributor and above have it automatically; others get it via sharing or app settings).",
    },
    {
      heading: 'Semantic model settings in the Service',
      content:
        "Workspace > hover the model > **...** > **Settings** shows:\n- **Gateway and cloud connections**: map data sources to a gateway or cloud connection.\n- **Data source credentials**: sign-in for each source.\n- **Parameters**: change Power Query parameter values (for example server name).\n- **Refresh**: scheduled refresh (8/day on Pro, 48/day on PPU or capacity), failure notifications, and for Direct Lake the automatic update option.\n- **Large semantic model storage format** (on capacities and PPU).\n- **Q&A** and **Featured Q&A questions**.\n- **Endorsement and discovery**: Promote, Certify, and make discoverable.\n\nOther actions from the **...** menu: Refresh now, Create report, **Analyze in Excel**, Manage permissions, Security (RLS role membership), **View lineage**, Download (if allowed).",
    },
    {
      heading: 'Endorsement, lineage and impact analysis',
      content:
        "**Endorsement** helps users find trustworthy models:\n- **Promoted**: the owner says it is ready to use (any contributor can promote).\n- **Certified**: an authorised reviewer (set by the Fabric admin) confirms it meets organisation standards.\n- **Master data**: marks a model or item as the authoritative single source for core data such as customers or products (also admin-authorised).\n\n**Lineage view** (workspace > View: Lineage) shows the chain: data sources > dataflows/lakehouses > semantic models > reports > dashboards/apps.\n\n**Impact analysis** (semantic model > ... > View lineage > Show impact across workspaces, or the Impact analysis button) lists every report and workspace that depends on the model, and lets you notify their owners before you change or delete a measure.",
    },
    {
      heading: 'Modern authoring and developer options',
      content:
        "- **Edit data models in the Power BI service**: open the model and choose **Open data model** to create measures, relationships and RLS roles in the browser.\n- **Power BI Project (.pbip)** format saves a report and model as folders of text files, and the model in **TMDL** (Tabular Model Definition Language). This works with Git and code review. Desktop also has a **TMDL view** to script model objects.\n- **Fabric Git integration** and **deployment pipelines** move models between Dev, Test and Prod.\n- **XMLA endpoint** (on PPU or capacity) lets tools such as Tabular Editor, SSMS and DAX Studio connect to the model.\n- **Semantic link** (SemPy) in Fabric notebooks lets data scientists read tables and evaluate measures of a semantic model from Python.\n- In Fabric, lakehouses and warehouses no longer get an automatically generated default semantic model; you create a semantic model explicitly (for example a Direct Lake model) with only the tables you need.",
    },
  ],
  examples: [
    {
      title: 'Publish a shared model and connect a thin report',
      scenario: 'Create a central "Retail Sales Model" from the practice tables and a separate report "City Dashboard" that reuses it.',
      steps: [
        'In Desktop load Sales, Product, Customer and Date, create relationships and mark Date as a date table',
        'Modeling > New measure: Total Sales, Total Cost and Margin % (code below)',
        'Save as Retail Sales Model.pbix and Home > Publish > choose workspace Sales Analytics',
        'Open a new Desktop file: Home > Get data > Power BI semantic models > choose Retail Sales Model > Connect',
        'The status bar says "Connected live to the Power BI semantic model"; build a bar chart Customer[City] vs Total Sales',
        'Save as City Dashboard.pbix and publish to the same or another workspace',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )

Total Cost = SUM ( Sales[Cost] )

Margin % = DIVIDE ( [Total Sales] - [Total Cost], [Total Sales] )`,
      result: 'The workspace shows one semantic model and two reports. Changing Margin % in the model updates both reports.',
      explanation: 'The thin report stores only visuals and a connection; all data and measures come from the shared model.',
    },
    {
      title: 'Give an analyst Build permission',
      scenario: 'Riya from Finance is not in the workspace but must create her own reports on the model.',
      steps: [
        'Workspace > Retail Sales Model > ... > Manage permissions',
        'Click + Add user > type Riya\'s email',
        'Tick "Allow recipients to build content with the data associated with this semantic model" > Grant',
        'Riya opens Power BI Desktop > Get data > Power BI semantic models and sees Retail Sales Model',
      ],
      result: 'Riya can create reports, use Analyze in Excel and build composite models on the model, but cannot edit it.',
      explanation: 'Build permission is a semantic-model-level permission separate from workspace roles.',
    },
    {
      title: 'Certify the model and check its impact',
      scenario: 'Your BI team wants users to find the official model and to know which reports break before a measure is renamed.',
      table: {
        headers: ['Dependent item', 'Type', 'Workspace'],
        rows: [
          ['City Dashboard', 'Report', 'Sales Analytics'],
          ['Finance Pack', 'Report', 'Finance'],
          ['Sales App', 'App', 'Sales Analytics'],
        ],
      },
      steps: [
        'Workspace > Retail Sales Model > ... > Settings > Endorsement and discovery',
        'Select Certified (requires being in the admin-approved certifier group), add a description > Apply',
        'Back in the workspace choose View > Lineage and find the model',
        'Click the impact analysis icon on the model card',
        'Review the dependent reports and use Notify contacts to email their owners about the planned change',
      ],
      result: 'The model shows a Certified badge in the OneLake catalog and Get data list, and impact analysis lists 2 reports in 2 workspaces plus the app (as shown in the table).',
      explanation: 'Certification signals trust; impact analysis prevents surprise breakages across workspaces.',
    },
    {
      title: 'Add a measure in the browser',
      scenario: 'A quick fix is needed and Desktop is not available.',
      steps: [
        'Workspace > Retail Sales Model > Open data model (web modeling)',
        'Select the Sales table > New measure',
        'Type the Orders measure (code below) and press Enter',
        'Changes save automatically; open City Dashboard and add Orders to a card',
      ],
      code: `Orders = DISTINCTCOUNT ( Sales[OrderID] )`,
      result: 'The new Orders measure is available in every report connected to the model.',
      explanation: 'Web modeling edits the published model directly. Keep source control in mind: if the team also works from a PBIX or PBIP, re-sync to avoid overwriting the change at the next publish.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a dataset and a semantic model?',
      a: 'They are the same thing. Microsoft renamed Power BI datasets to semantic models in November 2023; it contains the tables, relationships, measures, security and refresh settings used by reports.',
      level: 'Easy',
    },
    {
      q: 'What is a thin report?',
      a: 'A report file that has no data model of its own and connects live to a published semantic model. It contains only pages, visuals and optional report-level measures.',
      level: 'Easy',
    },
    {
      q: 'What is Build permission?',
      a: 'A semantic model permission that allows a user to create new content on the model: reports in Desktop or the Service, Analyze in Excel, composite models and queries. Viewing a report does not require Build.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between Promoted and Certified?',
      a: 'Promoted is a self-declaration by the owner that the item is ready to share. Certified is granted only by reviewers authorised by the tenant admin after checking quality and governance standards.',
      level: 'Medium',
    },
    {
      q: 'Scenario: the same KPI shows different values in three reports. How do you fix it long term?',
      a: 'Consolidate logic into one certified shared semantic model, rebuild the reports as thin reports on it, retire the old models, and use impact analysis and lineage to manage changes.',
      level: 'Medium',
    },
    {
      q: 'What is TMDL and why does it matter?',
      a: 'Tabular Model Definition Language is a human-readable text format for semantic model metadata, used in Power BI Projects (.pbip) and Git integration. It makes models easy to diff, review and version control.',
      level: 'Hard',
    },
    {
      q: 'Scenario: you must change a measure name used by 40 reports. What do you do first?',
      a: 'Run impact analysis on the semantic model to list dependent reports and owners, notify them, consider keeping the old measure hidden for compatibility, test in a Dev/Test workspace via deployment pipeline, then deploy.',
      level: 'Hard',
    },
    {
      q: 'Can a thin report owner add calculated columns?',
      a: 'Not with a pure live connection; they can add report-level measures only. To add columns or tables they must convert to a composite model using DirectQuery for Power BI semantic models (Make changes to this model).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Publish the practice model as Retail Sales Model with Total Sales, Total Cost and Margin % measures.',
      hint: 'Home > Publish.',
      solution: 'The workspace lists a semantic model and a report both named Retail Sales Model.',
    },
    {
      task: 'Create a thin report that connects live to it and shows Margin % by Product[Category].',
      hint: 'Get data > Power BI semantic models.',
      solution: 'A bar chart with Electronics, Accessories and Furniture margins; the Data pane shows the model tables with no Power Query option available.',
    },
    {
      task: 'Open Lineage view and identify every item that depends on your model.',
      hint: 'Workspace view switcher > Lineage.',
      solution: 'Lineage shows the data source(s) feeding the model and both reports depending on it.',
    },
    {
      task: 'Save the model as a Power BI Project and open the TMDL file for the Sales table.',
      hint: 'File > Save as > Save as type: Power BI project files (*.pbip).',
      solution: 'In the .SemanticModel/definition/tables folder, Sales.tmdl lists columns and the measures written in DAX in plain text.',
    },
  ],
  quiz: [
    {
      question: 'Before November 2023 a semantic model was called a…',
      options: ['Dataflow', 'Dataset', 'Datamart', 'Workbook'],
      answer: 1,
      explanation: 'Datasets were renamed to semantic models.',
    },
    {
      question: 'Which permission lets a user create a new report on a shared semantic model?',
      options: ['Read', 'Reshare', 'Build', 'Write'],
      answer: 2,
      explanation: 'Build permission allows creating new content on the model.',
    },
    {
      question: 'What connection type does a thin report use?',
      options: ['Import', 'Live connection to a Power BI semantic model', 'Gateway connection', 'ODBC'],
      answer: 1,
      explanation: 'Thin reports connect live and hold no data.',
    },
    {
      question: 'Who can mark a semantic model as Certified?',
      options: ['Any viewer', 'The report author always', 'Users authorised by the Fabric/Power BI admin', 'Only Microsoft support'],
      answer: 2,
      explanation: 'Admins define who can certify content.',
    },
    {
      question: 'Which feature lists all reports in all workspaces that depend on a model?',
      options: ['Performance analyzer', 'Impact analysis', 'Query diagnostics', 'Usage metrics'],
      answer: 1,
      explanation: 'Impact analysis shows downstream items and lets you notify owners.',
    },
  ],
};
