export default {
  id: 'extra-43-xmla-endpoint-concepts',
  title: 'XMLA Endpoint Concepts',
  module: 'Extra: Advanced & Administration',
  extraNo: 43,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'The XMLA endpoint exposes Power BI semantic models in Premium Per User and Fabric capacity workspaces through the same open protocol used by Analysis Services. It lets professional tools such as SSMS, Tabular Editor, DAX Studio and Excel read, script, refresh and deploy models, turning Power BI into an enterprise BI platform.',
  objectives: [
    'Explain what XMLA is and why Power BI exposes semantic models through it',
    'Find a workspace connection string and know licence and admin requirements',
    'Describe read-only vs read-write access and what each allows',
    'Use common tools: DAX Studio, Tabular Editor, SSMS and SQL Server Profiler',
    'Know the important side effects, such as not being able to download a PBIX after XMLA edits',
  ],
  theory: [
    {
      heading: 'What is XMLA?',
      content:
        "**XMLA** (XML for Analysis) is an open protocol used for decades by **SQL Server Analysis Services** and **Azure Analysis Services**. Power BI semantic models run on the same Analysis Services (VertiPaq) engine, so Microsoft exposes them through an **XMLA endpoint**.\n\nAnalogy: Power BI Desktop and the Service are the front door with a friendly reception desk. The XMLA endpoint is the service entrance used by engineers with professional tools: they can reach the same rooms, but with more control.\n\nWhat you can do through it:\n- **Query** models with DAX or MDX (read).\n- **Script** the model as TMSL/TMDL, inspect metadata and DMVs.\n- **Create, change and deploy** models (write): add measures, tables, partitions, perspectives, roles.\n- **Refresh** specific tables or partitions with fine control.\n- **Trace** queries and refreshes.",
    },
    {
      heading: 'Requirements and settings',
      content:
        "- The workspace must be on **Premium Per User (PPU)**, a **Fabric capacity (F SKU)** or a legacy **Premium P** capacity. It is **not** available for Pro (shared capacity) workspaces.\n- **Capacity setting**: Admin portal > **Capacity settings** > choose the capacity > **Power BI workloads** > **XMLA Endpoint**: **Off**, **Read Only** or **Read Write**. For PPU it is set under Premium Per User settings. Read Write is required for any change or deployment.\n- **Tenant settings** (Admin portal > Tenant settings > Integration settings): **Allow XMLA endpoints and Analyze in Excel with on-premises semantic models** must be enabled for the users.\n- **Permissions**: to read you need Build (or workspace Contributor+); to write you need Contributor or higher in the workspace.\n- Authentication is with **Microsoft Entra ID** (user account or service principal).",
    },
    {
      heading: 'The connection string',
      content:
        "Every eligible workspace has a connection string in this format:\n\n`powerbi://api.powerbi.com/v1.0/myorg/<Workspace Name>`\n\nFind it: Workspace > **Workspace settings** > **License info** > **Connection link** > Copy. In a tool, paste it as the **Server** name; the semantic models in the workspace appear as **databases**.\n\nYou can also add `;Initial Catalog=<Semantic model name>` to connect to one model directly (for example in Excel or a custom app).",
      syntax: 'powerbi://api.powerbi.com/v1.0/myorg/Retail Analytics',
    },
    {
      heading: 'Common tools and what they are used for',
      content:
        "- **DAX Studio** (free): write and time DAX queries, view server timings and query plans, run **VertiPaq Analyzer** to see column sizes.\n- **Tabular Editor** (2 free, 3 commercial): edit measures, calculation groups, perspectives, translations, OLS; run Best Practice Analyzer rules; script and deploy changes.\n- **SQL Server Management Studio (SSMS)**: browse models, script as TMSL, process (refresh) tables and partitions, manage roles, run DMV queries.\n- **SQL Server Profiler / Extended events**: trace queries and refresh events.\n- **ALM Toolkit**: compare two models and deploy only differences.\n- **Excel** (Analyze in Excel), **paginated reports** and third-party BI tools also connect through XMLA.\n- Automation: PowerShell (SqlServer module), TOM (.NET Tabular Object Model), Fabric notebooks with Semantic Link Labs.",
    },
    {
      heading: 'Read-write side effects and best practice',
      content:
        "- After a model is **changed through XMLA write**, you can **no longer download it as a PBIX** from the Service. Keep the source of truth in a PBIP/TMDL repository or Tabular Editor files.\n- Publishing an older PBIX over an XMLA-modified model overwrites the XMLA changes. Agree on one authoring path per model.\n- Advanced refresh: refresh one partition (for example the current month) instead of the full table, which is also how incremental refresh partitions can be managed.\n- Large models: combine XMLA with the **large semantic model storage format**.\n- Use **service principals** for automated deployments and refresh, not personal accounts.\n- XMLA read/write queries and refreshes consume capacity resources (CU); monitor them in the **Fabric Capacity Metrics** app.",
      tip: 'If you only need to explore and tune queries, Read Only is enough and safer. Turn on Read Write for teams doing enterprise model deployment.',
    },
  ],
  examples: [
    {
      title: 'Connect DAX Studio to a published model',
      scenario: 'The Retail Sales Model (built on the practice tables) is published in the PPU workspace "Retail Analytics". Measure query speed in the Service.',
      steps: [
        'Workspace > Workspace settings > License info > Connection link > Copy',
        'Open DAX Studio > Connect > Tabular Server: paste powerbi://api.powerbi.com/v1.0/myorg/Retail Analytics > Connect (sign in with Entra ID)',
        'In the Database drop-down choose Retail Sales Model',
        'Turn on Server Timings in the Home ribbon',
        'Paste the query below and press Run (F5)',
      ],
      code: `EVALUATE
SUMMARIZECOLUMNS (
    Product[Category],
    "Total Sales", SUM ( Sales[SalesAmount] ),
    "Orders", DISTINCTCOUNT ( Sales[OrderID] )
)
ORDER BY Product[Category]`,
      result: 'A three-row result (Accessories, Electronics, Furniture) with Total Sales and Orders, plus Server Timings showing storage engine and formula engine time.',
      explanation: 'DAX Studio talks to the model through XMLA read access, exactly like a report visual but with diagnostic detail.',
    },
    {
      title: 'Add a measure with Tabular Editor (Read Write)',
      scenario: 'The team wants to add an Avg Order Value measure to the production model without republishing the PBIX. XMLA Endpoint is set to Read Write.',
      steps: [
        'Open Tabular Editor > File > Open > From DB',
        'Server: paste the workspace connection link > choose Retail Sales Model > OK',
        'Right-click the Sales table > Create > Measure > name it Avg Order Value',
        'Enter the expression (code below) and set Format String to #,##0.00',
        'Press Ctrl+S to save changes to the connected model',
        'Open any report on the model in the Service and add the new measure to a card',
      ],
      code: `Avg Order Value =
DIVIDE ( SUM ( Sales[SalesAmount] ), DISTINCTCOUNT ( Sales[OrderID] ) )`,
      result: 'The measure appears in the model immediately. The model can no longer be downloaded as a PBIX from the Service.',
      explanation: 'Read Write XMLA lets external tools update model metadata directly; this is powerful but changes the authoring path, so keep the change in source control too.',
    },
    {
      title: 'Refresh only one table in SSMS',
      scenario: 'Only the Product table changed today. A full refresh of the large Sales table would take 40 minutes.',
      steps: [
        'Open SSMS > Connect > Server type: Analysis Services > Server name: workspace connection link > Authentication: Microsoft Entra MFA > Connect',
        'Expand Databases > Retail Sales Model > Tables',
        'Right-click Product > Process Table > Mode: Process Full > OK',
        'Optionally click Script to save the TMSL command for automation',
      ],
      code: `{
  "refresh": {
    "type": "full",
    "objects": [
      { "database": "Retail Sales Model", "table": "Product" }
    ]
  }
}`,
      result: 'Product refreshes in seconds while Sales keeps its existing data.',
      explanation: 'XMLA exposes table and partition level processing that the Service UI does not offer.',
    },
  ],
  interview: [
    {
      q: 'What is the XMLA endpoint in Power BI?',
      a: 'An Analysis Services protocol endpoint for workspaces on PPU or Fabric/Premium capacity that lets client tools query, script, refresh and modify semantic models.',
      level: 'Easy',
    },
    {
      q: 'Which licence is required to use XMLA endpoints?',
      a: 'Premium Per User or a workspace on Fabric (F SKU) or Premium P capacity. Pro shared capacity workspaces do not expose XMLA.',
      level: 'Easy',
    },
    {
      q: 'What is the format of the XMLA connection string?',
      a: 'powerbi://api.powerbi.com/v1.0/myorg/<WorkspaceName>, found in Workspace settings > License info > Connection link.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between XMLA Read Only and Read Write?',
      a: 'Read Only allows querying and reading metadata (DAX Studio, Excel, Profiler). Read Write additionally allows creating and changing models, deploying from Tabular Editor or Visual Studio, and fine-grained refresh operations.',
      level: 'Medium',
    },
    {
      q: 'What happens if you change a model through XMLA write?',
      a: 'The model can no longer be downloaded as a PBIX, and publishing the old PBIX would overwrite the changes. Teams should keep model definitions in source control (PBIP/TMDL or Tabular Editor) and use one authoring path.',
      level: 'Hard',
    },
    {
      q: 'Scenario: a 60 GB model takes 2 hours to refresh. How can XMLA help?',
      a: 'Use partitions (or incremental refresh) and refresh only recent partitions via TMSL/SSMS or scripts, refresh dimension tables separately, and schedule with a service principal. Monitor capacity load in the Capacity Metrics app.',
      level: 'Hard',
    },
    {
      q: 'Which tools typically connect through XMLA?',
      a: 'DAX Studio, Tabular Editor, SSMS, SQL Server Profiler, ALM Toolkit, Excel, paginated reports (Report Builder), Visual Studio Analysis Services projects, PowerShell/TOM and Fabric notebooks with Semantic Link.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Find the connection link of a PPU or trial capacity workspace.',
      hint: 'Workspace settings > License info.',
      solution: 'It looks like powerbi://api.powerbi.com/v1.0/myorg/YourWorkspace; Pro workspaces show no connection link.',
    },
    {
      task: 'Run a DAX query that returns Total Sales by Customer[City] from DAX Studio.',
      hint: 'EVALUATE SUMMARIZECOLUMNS(Customer[City], "Total Sales", SUM(Sales[SalesAmount])).',
      solution: 'Four rows: Mumbai, Nagpur, Nashik, Pune with their totals; Server Timings shows the query duration.',
    },
    {
      task: 'Use VertiPaq Analyzer in DAX Studio to list the three largest columns.',
      hint: 'Advanced > View Metrics.',
      solution: 'The Columns tab sorted by Total Size shows high-cardinality columns such as Sales[OrderID] and Sales[OrderDate] at the top.',
    },
    {
      task: 'In SSMS, script the Product table refresh as TMSL instead of running it.',
      hint: 'Process Table dialog > Script > Script Action to New Query Window.',
      solution: 'A JSON refresh command naming the database and table appears, ready for automation via PowerShell Invoke-ASCmd.',
    },
  ],
  quiz: [
    {
      question: 'What does XMLA stand for?',
      options: ['Extended Model Language API', 'XML for Analysis', 'Cross Model Live Access', 'XML Lakehouse Adapter'],
      answer: 1,
      explanation: 'XMLA = XML for Analysis, the Analysis Services protocol.',
    },
    {
      question: 'Which workspace does NOT provide an XMLA endpoint?',
      options: ['PPU workspace', 'Workspace on F64', 'Workspace on Pro shared capacity', 'Workspace on P1'],
      answer: 2,
      explanation: 'XMLA requires PPU or capacity.',
    },
    {
      question: 'Where is the XMLA Read Only / Read Write setting for a capacity?',
      options: ['Power BI Desktop Options', 'Admin portal > Capacity settings > Power BI workloads', 'Workspace > Manage access', 'Report > Format pane'],
      answer: 1,
      explanation: 'It is a capacity workload setting in the Admin portal.',
    },
    {
      question: 'Which tool is mainly used to edit measures and calculation groups over XMLA?',
      options: ['Tabular Editor', 'Power Query', 'Report Builder', 'OneDrive'],
      answer: 0,
      explanation: 'Tabular Editor edits model metadata and saves to the model via XMLA.',
    },
    {
      question: 'After an XMLA write change, what can you no longer do?',
      options: ['Refresh the model', 'Query it with DAX', 'Download the model as a PBIX', 'Share the report'],
      answer: 2,
      explanation: 'PBIX download is blocked once a model is modified via XMLA.',
    },
  ],
};
