export default {
  id: 'extra-39-dataflows',
  title: 'Dataflows',
  module: 'Extra: Advanced & Administration',
  extraNo: 39,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'A dataflow is Power Query that runs in the cloud (Power Query Online) and stores its cleaned tables so many semantic models and reports can reuse them. Power BI Dataflow Gen1 stores results in Power BI managed storage, while Fabric Dataflow Gen2 writes results to destinations such as a lakehouse or warehouse.',
  objectives: [
    'Explain why dataflows exist: reuse of cleaning logic and a single version of the truth',
    'Compare Dataflow Gen1 and Dataflow Gen2 and their licence requirements',
    'Create a dataflow in a workspace with Power Query Online and schedule its refresh',
    'Consume dataflow tables in Power BI Desktop and, for Gen2, set a data destination',
    'Apply best practices: staging and transformation layers, linked/computed tables and incremental refresh',
  ],
  theory: [
    {
      heading: 'What is a dataflow and why use it?',
      content:
        "In Power BI Desktop, Power Query steps live inside one PBIX file. If five analysts each clean the same Product list from the ERP, you get five copies of the logic and often five different answers.\n\nA **dataflow** moves that Power Query work to the **Service**. It runs on a schedule in the cloud and saves the cleaned tables. Every report can then connect to the dataflow instead of the raw source.\n\nAnalogy: instead of every family in a building buying and filtering their own water, the building has one water purifier on the roof and every flat uses the clean supply.\n\nBenefits:\n- **Reuse**: clean once, use in many semantic models.\n- **Consistency**: one definition of Product, Customer and Date.\n- **Less load on sources**: the source is queried once per dataflow refresh, not once per model.\n- **Self-service ETL** with the same Power Query skills (no SQL needed).",
    },
    {
      heading: 'Dataflow Gen1 vs Dataflow Gen2',
      content:
        "**Dataflow Gen1** (Power BI dataflows):\n- Created in a Power BI workspace (+ New item > Dataflow Gen1).\n- Output is stored in Power BI managed storage (Azure Data Lake Gen2 in CDM format), or in your own ADLS Gen2 if configured.\n- Available with **Pro**. Advanced features such as the **enhanced compute engine**, **computed tables**, **linked tables** refresh chains and DirectQuery to dataflows need Premium, PPU or a Fabric capacity.\n\n**Dataflow Gen2** (Microsoft Fabric Data Factory):\n- Created with + New item > **Dataflow Gen2** in a workspace on a **Fabric capacity** (or trial).\n- Can write output to a **data destination**: Fabric Lakehouse, Fabric Warehouse, Azure SQL Database, KQL database, SharePoint files and others, with Append or Replace.\n- Supports staging, high-scale compute, Copilot assistance, **CI/CD (Git integration and deployment pipelines)** and public API, and can be orchestrated in **Data pipelines**.\n\nMicrosoft recommends **Gen2 for new solutions** in Fabric; Gen1 remains supported for Power BI-only (Pro/PPU) environments, and there is a built-in option to save a Gen1 dataflow as Gen2.",
    },
    {
      heading: 'Creating and refreshing a dataflow',
      content:
        "1. Open a workspace in the Power BI / Fabric portal.\n2. **+ New item** > **Dataflow Gen2** (or Dataflow Gen1).\n3. **Get data** opens Power Query Online with the same connectors and ribbon as Desktop (Home, Transform, Add column, View).\n4. Build queries and steps exactly like in Desktop; the Applied steps pane and the Advanced editor are there too.\n5. For Gen2 choose a **Data destination** per query (bottom-right of the query settings) or leave the default staging.\n6. **Publish** (Gen2) or **Save & close** (Gen1).\n7. Workspace > dataflow > ... > **Settings** > **Refresh** to schedule; on-premises sources need an **on-premises data gateway**.\n\nThe dataflow must be refreshed before downstream semantic models refresh, so schedule it earlier or chain refreshes in a pipeline.",
    },
    {
      heading: 'Consuming dataflows',
      content:
        "- **Power BI Desktop**: Home > Get data > **Dataflows** (for Gen1 and Gen2 outputs that use staging) > sign in > expand Workspace > Dataflow > select tables > Load. The tables arrive in Import mode (DirectQuery to Gen1 dataflows is possible with the enhanced compute engine on a capacity).\n- **Gen2 with a Lakehouse destination**: connect to the lakehouse instead (OneLake catalog > Lakehouse), or build a **Direct Lake** semantic model on those tables.\n- **Another dataflow**: reference tables from an existing dataflow (linked tables in Gen1).\n\nTip: for Gen2, writing to a lakehouse or warehouse destination is the recommended pattern because every Fabric tool (SQL, notebooks, Power BI) can then read the tables.",
    },
    {
      heading: 'Best practices',
      content:
        "- **Layered design**: a staging dataflow that only extracts raw tables, and a transformation dataflow that cleans and shapes them. This reduces load on sources and isolates errors.\n- Keep **query folding** where possible so filters and joins run in the source.\n- Use **incremental refresh** for large tables (Gen1 on capacity/PPU; Gen2 supports incremental refresh to supported destinations).\n- Use **parameters** for server names so the dataflow can move between Dev, Test and Prod.\n- Name tables and columns clearly and set data types in the dataflow, so every consumer gets typed, consistent data.\n- Endorse (Promote or Certify) shared dataflows so users find the trusted one.",
      tip: 'A dataflow is not a semantic model: it has no relationships, measures or RLS. You still build a semantic model on top of it.',
    },
  ],
  examples: [
    {
      title: 'Central Product dimension in a Dataflow Gen2',
      scenario:
        'Three reports need the same cleaned Product table (ProductID, Product, Category, Price). Category values in the ERP export have extra spaces and mixed case ("  electronics ").',
      table: {
        headers: ['ProductID', 'Product', 'Category (raw)', 'Category (clean)'],
        rows: [
          ['P01', 'Laptop', '  electronics ', 'Electronics'],
          ['P02', 'Mouse', 'ACCESSORIES', 'Accessories'],
          ['P03', 'Office Chair', 'furniture', 'Furniture'],
        ],
      },
      steps: [
        'Workspace on a Fabric capacity > + New item > Dataflow Gen2',
        'Get data > Text/CSV (or Excel) > choose Product.csv from OneDrive/SharePoint > Next > Create',
        'Select the Category column > Transform > Format > Trim, then Format > Capitalize Each Word',
        'Set data types: ProductID Text, Price Decimal number',
        'Bottom right of the query settings > Data destination > + > Lakehouse > choose RetailLH > New table Product > Replace > Save settings',
        'Publish; then Workspace > dataflow > ... > Settings > Refresh > schedule daily 06:00',
      ],
      code: `let
    Source = Csv.Document(Web.Contents("https://contoso.sharepoint.com/sites/bi/Shared%20Documents/Product.csv"), [Delimiter = ",", Encoding = 65001]),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Trimmed = Table.TransformColumns(Promoted, {{"Category", Text.Trim, type text}}),
    Proper = Table.TransformColumns(Trimmed, {{"Category", Text.Proper, type text}}),
    Typed = Table.TransformColumnTypes(Proper, {{"ProductID", type text}, {"Product", type text}, {"Price", type number}})
in
    Typed`,
      result: 'The lakehouse table Product contains three clean categories: Electronics, Accessories and Furniture. All reports read the same table.',
      explanation: 'Text.Trim removes spaces and Text.Proper capitalises each word, so every consumer gets consistent category names.',
    },
    {
      title: 'Use a dataflow in Power BI Desktop',
      scenario: 'Build a report that uses the Product table from the dataflow and Sales from the practice CSV.',
      steps: [
        'Power BI Desktop > Home > Get data > Dataflows > Connect (sign in with your work account)',
        'Expand your workspace > the Product dataflow > tick Product > Load',
        'Home > Get data > Text/CSV > Sales.csv > Load',
        'Model view > drag Product[ProductID] onto Sales[ProductID] (one-to-many, single)',
        'Build a column chart: Product[Category] on X-axis, Total Sales on Y-axis',
      ],
      code: `Total Sales = SUM ( Sales[SalesAmount] )`,
      result: 'A chart with the three clean categories. If the dataflow logic changes, every report gets the update at its next refresh.',
      explanation: 'The report imports the already-cleaned output instead of repeating the cleaning steps.',
    },
    {
      title: 'Staging and transformation layers',
      scenario: 'The ERP database is slow and several dataflows query it. Split extraction and transformation.',
      table: {
        headers: ['Dataflow', 'Purpose', 'Refresh time'],
        rows: [
          ['DF_Staging_ERP', 'Extract raw Sales, Product, Customer with minimal steps', '05:00'],
          ['DF_Transform_Retail', 'Clean, merge and shape from staging tables', '05:30'],
          ['Retail semantic model', 'Relationships, measures, RLS', '06:00'],
        ],
      },
      steps: [
        'Create DF_Staging_ERP that only selects the needed columns and filters dates (folds to the source)',
        'Write its output to a lakehouse (Gen2) or keep it as a Gen1 dataflow',
        'Create DF_Transform_Retail that reads from the staging output and performs Merge Queries, Group By and data type fixes',
        'Create a Data pipeline (Gen2) with a Dataflow activity for staging, then transform, then a Semantic model refresh activity, connected On success',
        'Schedule the pipeline at 05:00',
      ],
      result: 'The ERP is queried once per day, and failures are easy to locate in the pipeline run history.',
      explanation: 'Layering separates source load from business logic and allows reuse of the staging output by other dataflows.',
    },
  ],
  interview: [
    {
      q: 'What is a Power BI dataflow?',
      a: 'A cloud-based Power Query process created in a workspace that extracts, transforms and stores tables for reuse by multiple semantic models and reports.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between Dataflow Gen1 and Gen2?',
      a: 'Gen1 is the Power BI dataflow storing output in Power BI managed (or your own ADLS Gen2) storage and works with Pro. Gen2 is the Fabric Data Factory dataflow that runs on Fabric capacity, can write to destinations like Lakehouse, Warehouse or Azure SQL, integrates with pipelines and supports CI/CD.',
      level: 'Medium',
    },
    {
      q: 'Does a dataflow replace a semantic model?',
      a: 'No. A dataflow only prepares tables. Relationships, measures, hierarchies and RLS belong to the semantic model built on top of the dataflow output.',
      level: 'Easy',
    },
    {
      q: 'Scenario: ten reports clean the same customer list differently and show different counts. How would you fix this?',
      a: 'Create one dataflow (or a shared semantic model) with the agreed cleaning rules, endorse it as certified, and repoint all reports to it so there is one version of the truth.',
      level: 'Medium',
    },
    {
      q: 'What are computed and linked tables in Gen1?',
      a: 'A linked table references a table from another dataflow; a computed table performs further transformations on such a table using in-storage computation. Computed tables require Premium, PPU or a Fabric capacity.',
      level: 'Hard',
    },
    {
      q: 'In what order should dataflow and semantic model refreshes run?',
      a: 'Dataflow first, then the semantic model, otherwise the model loads yesterday\'s data. Use staggered schedules or orchestrate with a Fabric pipeline (Dataflow activity followed by a Semantic model refresh activity).',
      level: 'Medium',
    },
    {
      q: 'Scenario: a Gen2 dataflow must load only new orders each day into a lakehouse. What options do you have?',
      a: 'Configure incremental refresh on the Gen2 query (date column, refresh window and bucket) with a supported destination, or set the destination to Append and filter the source to new rows using a parameter or the last loaded date.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a Dataflow (Gen1 on Pro or Gen2 on a trial capacity) that loads the practice Customer file and trims and capitalises the City column.',
      hint: 'Transform > Format > Trim and Capitalize Each Word.',
      solution: 'City values become Pune, Mumbai, Nagpur and Nashik without extra spaces; save/publish and refresh the dataflow.',
    },
    {
      task: 'Connect Power BI Desktop to your dataflow and relate Customer to Sales.',
      hint: 'Get data > Dataflows.',
      solution: 'Customer[CustomerID] (one) to Sales[CustomerID] (many), single direction; a Sales by City chart works.',
    },
    {
      task: 'Schedule the dataflow at 06:00 and the semantic model at 06:30.',
      hint: 'Both are in ... > Settings > Refresh in the workspace.',
      solution: 'Refresh history shows the dataflow completing before the model starts, so the model always loads fresh tables.',
    },
    {
      task: 'For Gen2, set the output of the Customer query to a new lakehouse table and verify it in the SQL analytics endpoint.',
      hint: 'Data destination > Lakehouse; then open the lakehouse SQL analytics endpoint and run SELECT TOP 10 * FROM Customer.',
      solution: 'The query returns cleaned customer rows, proving the dataflow wrote a Delta table that any Fabric tool can read.',
    },
  ],
  quiz: [
    {
      question: 'Where does a dataflow run its Power Query steps?',
      options: ['On the user laptop', 'In the Power BI / Fabric service (Power Query Online)', 'Inside Excel', 'Inside the report visual'],
      answer: 1,
      explanation: 'Dataflows run in the cloud using Power Query Online.',
    },
    {
      question: 'Which feature is specific to Dataflow Gen2?',
      options: ['Power Query ribbon', 'Data destinations such as Lakehouse and Warehouse', 'Scheduled refresh', 'Use of connectors'],
      answer: 1,
      explanation: 'Gen2 can write outputs to destinations; the others exist in Gen1 too.',
    },
    {
      question: 'What does a dataflow NOT contain?',
      options: ['Queries', 'Applied steps', 'DAX measures and relationships', 'Data types'],
      answer: 2,
      explanation: 'Measures and relationships live in the semantic model.',
    },
    {
      question: 'Which Desktop connector reads Gen1 dataflow tables?',
      options: ['Get data > Dataflows', 'Get data > Web', 'Get data > Blank query', 'Get data > Folder'],
      answer: 0,
      explanation: 'The Dataflows connector lists workspaces and their dataflow tables.',
    },
    {
      question: 'Which capacity does Dataflow Gen2 need?',
      options: ['None, it works in My workspace on Free', 'Pro only', 'A Fabric capacity (or trial)', 'Power BI Report Server'],
      answer: 2,
      explanation: 'Gen2 is a Fabric item and needs a Fabric capacity or trial.',
    },
  ],
};
