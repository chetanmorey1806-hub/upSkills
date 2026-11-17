export default {
  id: 'extra-41-deployment-pipelines',
  title: 'Deployment Pipelines',
  module: 'Extra: Advanced & Administration',
  extraNo: 41,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Deployment pipelines move Power BI and Fabric content through stages such as Development, Test and Production, each stage being its own workspace. They let teams test changes safely, compare stages and switch data sources automatically with deployment rules, instead of re-publishing PBIX files by hand.',
  objectives: [
    'Explain the application lifecycle (Dev, Test, Prod) and why manual publishing is risky',
    'Create a deployment pipeline, configure 2 to 10 stages and assign a workspace to each stage',
    'Deploy all or selected items, use compare, and review deployment history',
    'Configure deployment rules (data source and parameter rules) so each stage uses the right data',
    'Know licence requirements, permissions and how pipelines relate to Git integration',
  ],
  theory: [
    {
      heading: 'Why we need lifecycle management',
      content:
        "Without a process, a developer edits the PBIX and publishes straight into the workspace that 500 users open every morning. A wrong measure or a broken relationship goes live instantly.\n\nSoftware teams solve this with **stages**:\n1. **Development**: build and experiment.\n2. **Test**: business users validate with realistic data.\n3. **Production**: what end users see, usually through an app.\n\nAnalogy: a restaurant tests a new dish in the kitchen (Dev), lets staff taste it (Test) and only then puts it on the menu (Prod).\n\n**Deployment pipelines** bring this to Power BI and Fabric without needing any code: you click **Deploy** to copy content from one stage to the next.",
    },
    {
      heading: 'Pipeline structure and requirements',
      content:
        "- Create from the Power BI / Fabric portal: left navigation **Deployment pipelines** (or Workspaces > ... ) > **New pipeline**.\n- A pipeline has **2 to 10 stages**. The default is three: **Development, Test, Production**, and you can rename, add or remove stages when you create it.\n- Each stage is assigned **exactly one workspace**, and a workspace can belong to only one pipeline.\n- Workspaces must be on a **Fabric capacity (F SKU)**, a legacy **Premium P** capacity or **Premium Per User**. (In PPU, all users who access the content need PPU.)\n- Supported items include reports, semantic models, dashboards, paginated reports, dataflows (Gen1 and Gen2), and many Fabric items such as lakehouses, warehouses, notebooks and data pipelines.\n- You can make a stage **public** or **private**; and the Production stage workspace usually publishes an **app** for end users.",
    },
    {
      heading: 'Deploying, comparing and history',
      content:
        "- **Deploy all** or **select related / specific items** and click **Deploy** to the next stage. You can add a deployment note.\n- Deployment copies **metadata** (report definitions, model schema, measures, settings). For semantic models that already exist in the target, the **data stays** and only the definition changes; new models need a **refresh** in the target stage after the first deployment.\n- The **Compare** view shows items that are **Different**, **Only in source** or **Same**, and you can open a side-by-side change review for semantic models and reports.\n- **Deployment history** lists who deployed what and when, with notes.\n- Content can also be deployed **backward** (for example Prod to Test) in limited situations, mainly to an empty or out-of-sync stage, to fix an issue.\n- Items keep a link to their counterparts across stages (pairing), so the same report in Dev and Prod is recognised as one item even if renamed.",
    },
    {
      heading: 'Deployment rules',
      content:
        "Dev often uses a dev database and Prod the real database. **Deployment rules** change settings automatically when content lands in a stage:\n\n- **Data source rules**: replace server/database (for example `sql-dev` to `sql-prod`).\n- **Parameter rules**: change a Power Query parameter value (for example `Environment = \"Prod\"` or `ServerName`). Parameters are the recommended way because they work for more connector types.\n- Lakehouse/notebook default lakehouse rules for Fabric items.\n\nRules are set on the **target stage** (click the lightning/rules icon on the stage > choose the item > Add rule), and you must be the **owner of the item** and a pipeline admin. Rules apply on the next deployment.",
      tip: 'Always parameterise server and database in Power Query (Home > Manage Parameters) before building a pipeline. Then a single parameter rule per stage handles the switch.',
    },
    {
      heading: 'Permissions and automation',
      content:
        "- **Pipeline admin** is the only pipeline role: admins can view, share, edit and delete the pipeline and assign workspaces.\n- To deploy, you also need workspace permissions: at least **Contributor** in the source and target workspaces (Member or Admin to deploy items you do not own or to change some settings).\n- **Git integration** (Azure DevOps or GitHub) stores item definitions in a repository for version control. A common pattern: Dev workspace connected to Git; pipelines promote Dev to Test to Prod.\n- **REST APIs** and Azure DevOps/GitHub Actions tasks let you automate deployments, for example deploy to Test every night.",
    },
  ],
  examples: [
    {
      title: 'Create a three-stage pipeline',
      scenario: 'Team BI has workspaces Retail-Dev, Retail-Test and Retail-Prod on an F64 capacity. Set up a pipeline.',
      steps: [
        'Power BI service > left navigation > Deployment pipelines (or Workspaces > Deployment pipelines) > + New pipeline',
        'Name: Retail Pipeline; keep the stages Development, Test, Production > Create and continue',
        'On the Development stage select Assign a workspace > Retail-Dev > Assign',
        'Assign Retail-Test to Test and Retail-Prod to Production',
        'Check that each stage card shows its workspace name and item count',
      ],
      result: 'A pipeline with three linked stages. The Dev stage lists the Retail Sales Model and its report; Test and Prod are empty or show differences.',
      explanation: 'Each stage maps to one workspace on capacity, so content can now flow left to right with a click.',
    },
    {
      title: 'Parameter rule to switch the database',
      scenario: 'The practice model reads Sales from SQL Server. Dev uses database RetailDW_Dev; Prod must use RetailDW.',
      table: {
        headers: ['Stage', 'Parameter DatabaseName', 'Source used'],
        rows: [
          ['Development', 'RetailDW_Dev', 'Test data'],
          ['Test', 'RetailDW_UAT', 'Copy of prod data'],
          ['Production', 'RetailDW', 'Live data'],
        ],
      },
      steps: [
        'In Desktop: Home > Transform data > Manage Parameters > New: Name DatabaseName, Type Text, Current value RetailDW_Dev > OK',
        'Edit the Source step of each query to use the parameter (see M code) > Close & Apply > Publish to Retail-Dev',
        'In the pipeline select the Test stage > Deployment rules (lightning icon) > Retail Sales Model',
        'Parameter rules > + Add rule > DatabaseName > value RetailDW_UAT > Save',
        'Repeat on the Production stage with value RetailDW',
        'Deploy Dev to Test, refresh the model in Test, then deploy Test to Production and refresh',
      ],
      code: `let
    Source = Sql.Database("SQLPROD01", DatabaseName),
    Sales = Source{[Schema = "dbo", Item = "Sales"]}[Data]
in
    Sales`,
      result: 'The same model definition reads RetailDW_UAT in Test and RetailDW in Production without editing the PBIX.',
      explanation: 'Parameter rules override the parameter value whenever content is deployed into that stage.',
    },
    {
      title: 'Selective deployment of a fixed report',
      scenario: 'Only the City Dashboard report changed. The semantic model in Test is being validated and must not be overwritten.',
      steps: [
        'Open Retail Pipeline and click Compare between Development and Test',
        'Note that City Dashboard shows Different and Retail Sales Model shows Same',
        'In the Development stage switch to the item list, tick only City Dashboard',
        'Click Deploy (selected items) > add note "Fix Pune label on bar chart" > Deploy',
        'Open Deployment history to confirm the entry',
      ],
      result: 'Only the report is updated in Test; the model is untouched. History shows your name, time and note.',
      explanation: 'Selective deployment lets you promote individual items; Power BI warns if a selected report depends on a model that is not yet in the target.',
    },
  ],
  interview: [
    {
      q: 'What is a deployment pipeline in Power BI?',
      a: 'A Fabric/Power BI feature that manages content lifecycle across stages (default Development, Test, Production), each linked to a workspace, letting you deploy, compare and apply environment-specific rules.',
      level: 'Easy',
    },
    {
      q: 'What licence is needed for deployment pipelines?',
      a: 'The stage workspaces must be on a Fabric capacity, a Premium P capacity or Premium Per User. Pro-only workspaces cannot be used.',
      level: 'Easy',
    },
    {
      q: 'How many stages can a pipeline have?',
      a: 'Between 2 and 10. The default template has three stages: Development, Test and Production; you can customise names and count when you create the pipeline.',
      level: 'Medium',
    },
    {
      q: 'Does deployment copy the data of a semantic model?',
      a: 'No, it copies metadata. If the model already exists in the target, its data is kept and the definition is updated. A newly deployed model must be refreshed in the target stage.',
      level: 'Medium',
    },
    {
      q: 'What are deployment rules and who can set them?',
      a: 'Rules that change data sources or parameter values for items in a specific target stage. They are set on the target stage by a pipeline admin who is also the item owner.',
      level: 'Medium',
    },
    {
      q: 'Scenario: after deploying to Production, the report shows Dev data. What went wrong?',
      a: 'No deployment rule was configured for the Production stage (or the rule targets the wrong parameter or the model was not refreshed after deployment). Add a data source or parameter rule on the Production stage, redeploy and refresh.',
      level: 'Hard',
    },
    {
      q: 'How do deployment pipelines and Git integration work together?',
      a: 'Git integration versions item definitions in a repo (usually connected to the Dev workspace or feature workspaces). Deployment pipelines then promote content from Dev to Test to Prod. Together they give version history plus controlled releases.',
      level: 'Hard',
    },
    {
      q: 'Scenario: a hotfix must go to Prod, but Test contains unfinished work. What do you do?',
      a: 'Use selective deployment of only the fixed items, or fix in Dev and deploy only those items through Test. Compare stages first so unfinished items are not selected. Document the deployment note.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create three workspaces (Dev/Test/Prod) on a trial capacity and a pipeline linking them.',
      hint: 'Deployment pipelines > New pipeline > Assign a workspace.',
      solution: 'The pipeline shows three stage cards each with its assigned workspace.',
    },
    {
      task: 'Add a DatabaseName (or FilePath) parameter to the practice model and use it in the Source step.',
      hint: 'Home > Manage Parameters > New Parameter.',
      solution: 'The Source step becomes Sql.Database("Server", DatabaseName) or Csv.Document(File.Contents(FilePath)), and the model still loads.',
    },
    {
      task: 'Deploy to Test and add a parameter rule for Test.',
      hint: 'Rules are on the target stage.',
      solution: 'After redeploying, the model settings in the Test workspace show the new parameter value; refresh loads the Test source.',
    },
    {
      task: 'Use Compare to find what changed between Dev and Test after you edit one measure.',
      hint: 'Click the compare icon between two stages.',
      solution: 'The semantic model is marked Different; the change review shows the edited measure expression.',
    },
  ],
  quiz: [
    {
      question: 'What is the default number of stages in a new deployment pipeline?',
      options: ['2', '3', '5', '10'],
      answer: 1,
      explanation: 'Development, Test and Production by default; 2 to 10 are allowed.',
    },
    {
      question: 'How many workspaces can be assigned to one stage?',
      options: ['One', 'Two', 'Up to five', 'Unlimited'],
      answer: 0,
      explanation: 'Each stage maps to exactly one workspace.',
    },
    {
      question: 'Which rule type changes a Power Query parameter in the target stage?',
      options: ['Data source rule', 'Parameter rule', 'RLS rule', 'Refresh rule'],
      answer: 1,
      explanation: 'Parameter rules override parameter values per stage.',
    },
    {
      question: 'Which workspace cannot be used in a deployment pipeline?',
      options: ['Workspace on F64', 'Workspace on PPU', 'Workspace on Pro (shared capacity)', 'Workspace on P1'],
      answer: 2,
      explanation: 'Pipelines need capacity or PPU workspaces.',
    },
    {
      question: 'After the first deployment of a new Import semantic model to Test, what must you do?',
      options: ['Nothing, data is copied', 'Refresh the model in Test', 'Delete the Dev model', 'Download the PBIX'],
      answer: 1,
      explanation: 'Deployment copies metadata only; refresh loads data in the target stage.',
    },
  ],
};
