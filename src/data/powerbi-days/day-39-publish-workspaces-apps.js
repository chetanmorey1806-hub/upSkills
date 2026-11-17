export default {
  id: 'day-39-publish-workspaces-apps',
  title: 'Publish Reports, Power BI Workspaces, Apps',
  module: 'Module 7: Power BI Service & Deployment',
  day: 39,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Reports become useful when people can open them in a browser or on mobile. Today you publish from Desktop to the Power BI Service (part of Microsoft Fabric), organise content in workspaces with the right roles and licences, and distribute it to business users through a Power BI app.',
  objectives: [
    'Publish a report from Power BI Desktop and know what lands in the Service (report + semantic model)',
    'Create a workspace and assign Admin, Member, Contributor and Viewer roles correctly',
    'Explain current licensing: Free, Pro, Premium Per User and Fabric capacity (F64+ for free viewers)',
    'Create, publish and update a Power BI app with audiences',
    'Know when to use My workspace, shared workspaces, apps, and Publish to web (and its risks)',
  ],
  theory: [
    {
      heading: 'Publishing from Desktop',
      content:
        "Path: **Home > Publish** (save the .pbix first), sign in with your work account, pick a destination workspace, click **Select**. When it finishes, click 'Open in Power BI'.\n\nWhat gets uploaded:\n\n- A **report** (pages and visuals).\n- A **semantic model** (formerly called dataset): tables, relationships, measures, roles and the imported data.\n\nIf an item with the same name exists you are asked to **Replace** it. Replacing keeps the URL, dashboards pinned from it, app links and RLS member assignments (as long as role names are the same).\n\nYou can also save reports as **.pbip (Power BI Project)** for Git integration; this is an advanced team workflow with Fabric workspaces connected to Azure DevOps or GitHub.",
      tip: 'Use a thin report pattern in teams: publish one shared semantic model, then build several reports that connect to it (Home > Get data > Power BI semantic models).',
    },
    {
      heading: 'Licences you must know (current model)',
      content:
        "- **Free**: build in Desktop, publish to **My workspace** for personal use. Cannot share or collaborate in workspaces, and cannot view shared content unless it is in a Fabric capacity of **F64 or larger** (or a legacy Premium P capacity).\n- **Pro** (per user, list price about US$14/user/month): publish to shared workspaces, share, collaborate, subscribe. Both the publisher and the viewer need Pro unless the content is in an F64+ capacity.\n- **Premium Per User (PPU)** (about US$24/user/month): all Pro features plus premium features (more refreshes, larger models, deployment pipelines, XMLA read/write). Viewers also need PPU for content in a PPU workspace.\n- **Fabric capacity (F SKUs)**: organisation buys compute (F2 to F2048). Workspaces assigned to it get capacity features. From **F64** upward, users with a Free licence can view Power BI content; creators still need Pro or PPU. Premium per capacity P SKUs are being retired and customers move to F SKUs.\n\nPrices vary by region and agreement; always check the Microsoft pricing page for your organisation.",
      points: [
        'Microsoft 365 E5 includes Power BI Pro.',
        'Content in My workspace cannot be distributed to others through an app.',
      ],
    },
    {
      heading: 'Workspaces and roles',
      content:
        "A **workspace** is a shared folder for a team or project containing reports, semantic models, dashboards, dataflows and (on Fabric) lakehouses, warehouses, notebooks and more.\n\nCreate: left navigation **Workspaces > + New workspace**, enter a name, optional description and domain, choose the **License mode** under Advanced (Pro, Premium per-user, Fabric capacity, Trial, Embedded), click **Apply**.\n\nAssign people: open the workspace > **Manage access** > **+ Add people or groups** > choose a role:\n\n- **Admin**: everything, including add/remove admins, delete the workspace, change settings.\n- **Member**: everything a Contributor can, plus add members/contributors/viewers, share items and publish or update the app.\n- **Contributor**: create, edit, publish and delete content, schedule refresh; cannot manage access or (by default) publish the app.\n- **Viewer**: view and interact with content only; RLS applies to them.",
      tip: 'Give business users the app or Viewer role, not Contributor. Use Microsoft Entra security groups instead of individual people.',
    },
    {
      heading: 'Power BI apps',
      content:
        "An **app** is a polished, read-only package of a workspace's content for end users. It has its own navigation, branding and audiences.\n\nCreate: open the workspace > **Create app** (top right). Tabs:\n\n1. **Setup**: name, description, logo, theme colour, contact.\n2. **Content**: add reports, dashboards, paginated reports and links; order them in sections.\n3. **Audience**: create one or more audiences (e.g. Sales Team, Leadership) and choose which content each audience sees; add users or groups.\n\nClick **Publish app**. Users open it from **Apps** in the left navigation or via the link. After you change the workspace, click **Update app** so users get the changes (they do not see edits until you update).\n\nThe classic model allows one app per workspace with multiple audiences. Microsoft is also rolling out an **org app** item type that allows more than one app per workspace; availability depends on your tenant.",
    },
    {
      heading: 'Other ways to distribute and when not to use them',
      content:
        "- **Share a report** (Day 41): quick, individual distribution.\n- **Embed in Microsoft Teams / SharePoint Online**: secure, respects permissions and RLS.\n- **Publish to web**: File > Embed report > Publish to web creates a **public** link. Anyone on the internet can see it, with no sign-in and no RLS. Use only for public data; admins often disable it.\n- **Deployment pipelines** (Premium/PPU/Fabric): promote content from Development to Test to Production workspaces with rules that switch data sources.\n- **Endorsement**: mark a semantic model or report as **Promoted** or **Certified** so users find trusted content.",
    },
  ],
  examples: [
    {
      title: 'Publish the practice report',
      scenario: 'Publish the Sales practice report to a team workspace named Sales Analytics - Dev.',
      table: {
        headers: ['Item in workspace', 'Type'],
        rows: [
          ['Sales Overview', 'Report'],
          ['Sales Overview', 'Semantic model'],
        ],
      },
      steps: [
        'File > Save as Sales Overview.pbix',
        'Home > Publish',
        'Sign in if prompted; select workspace Sales Analytics - Dev > Select',
        'Wait for Success!, then click Open Sales Overview.pbix in Power BI',
        'In the workspace list view, check that a Report and a Semantic model with the same name appear',
      ],
      result: 'Two items appear in the workspace; the report opens in the browser with the same pages as Desktop.',
      explanation: 'Publishing a .pbix with data always creates (or replaces) a semantic model and a report connected to it.',
    },
    {
      title: 'Create a workspace and assign roles',
      scenario: 'Set up a workspace for the sales BI team.',
      table: {
        headers: ['Person / group', 'Role', 'Reason'],
        rows: [
          ['BI Lead', 'Admin', 'Owns settings and access'],
          ['Senior analyst', 'Member', 'Publishes the app, shares content'],
          ['Junior developers (group)', 'Contributor', 'Build and publish reports'],
          ['QA testers (group)', 'Viewer', 'Test with RLS applied'],
        ],
      },
      steps: [
        'Workspaces > + New workspace',
        'Name: Sales Analytics - Dev; Advanced > License mode: Pro (or Fabric capacity if your organisation has one) > Apply',
        'Open the workspace > Manage access > + Add people or groups',
        'Add each person/group with the role in the table > Add',
      ],
      result: 'Each user has least-privilege access. Testers see data through RLS because Viewer is read-only.',
      explanation: 'Roles are cumulative: Admin > Member > Contributor > Viewer. Use the lowest role that lets the person do their job.',
    },
    {
      title: 'Publish an app with two audiences',
      scenario: 'Leadership should see only the Executive Summary; the sales team sees Executive Summary and Sales Detail.',
      table: {
        headers: ['Audience', 'Content visible'],
        rows: [
          ['Leadership', 'Executive Summary'],
          ['Sales Team', 'Executive Summary, Sales Detail'],
        ],
      },
      steps: [
        'Open the workspace > Create app',
        'Setup: Name Sales Hub, description, logo, theme colour',
        'Content: Add content > select both reports; arrange in a section',
        'Audience: rename default audience to Sales Team and add the sales group; + New audience: Leadership, hide Sales Detail with the eye icon, add the leadership group',
        'Publish app > copy the link and send it',
        'Later, after changes: Update app > Update',
      ],
      result: 'Each group sees only its content in the app navigation.',
      explanation: 'Audiences control content visibility inside one app. Data access (rows) is still controlled by RLS.',
    },
    {
      title: 'Choose a licence setup',
      scenario: 'A company has 10 report creators and 600 report viewers.',
      table: {
        headers: ['Option', 'Creators', 'Viewers', 'Notes'],
        rows: [
          ['All Pro', '10 Pro', '600 Pro', 'Simple; cost grows per viewer'],
          ['Fabric F64 + Pro creators', '10 Pro', '600 Free', 'Viewers need no paid licence; capacity also runs Fabric workloads'],
          ['PPU', '10 PPU', '600 PPU', 'Premium features but every viewer needs PPU'],
        ],
      },
      steps: [
        'List creators (publish/edit) and consumers (view only)',
        'Compare per-user costs (Pro or PPU) with the capacity cost (F64) for your region',
        'Check feature needs: refresh count, model size, deployment pipelines, Fabric items',
        'Assign the workspace to the capacity: Workspace settings > License info > Edit > Fabric capacity',
      ],
      result: 'For large viewer counts, an F64 capacity with Pro licences for creators is often the cheaper and more scalable choice.',
      explanation: 'Free users can view content only when it lives in an F64+ (or legacy P) capacity.',
    },
    {
      title: 'Replace a published report safely',
      scenario: 'You fixed a measure and need to update the report without breaking links.',
      table: {
        headers: ['Item', 'Publish > Replace', 'Delete and re-publish'],
        rows: [
          ['Report URL and app links', 'Kept', 'Broken'],
          ['Dashboard tiles pinned from it', 'Kept', 'Broken'],
          ['RLS role members', 'Kept (same role names)', 'Must be re-added'],
        ],
      },
      steps: [
        'Make the change in Desktop and save',
        'Home > Publish > same workspace > Select',
        'Click Replace when asked',
        'If the workspace has an app, open the workspace > Update app',
      ],
      result: 'Users see the fix through the same links after you update the app.',
      explanation: 'Replace overwrites content in place; deleting and republishing creates new IDs and breaks links and tiles.',
    },
  ],
  interview: [
    {
      q: 'What happens when you publish a .pbix file?',
      a: 'The Service creates or replaces two items in the chosen workspace: a semantic model (data, model, measures, roles) and a report bound to it.',
      level: 'Easy',
    },
    {
      q: 'Explain the four workspace roles.',
      a: 'Admin: full control including access and deletion. Member: edit content, add members below Admin, share and publish/update the app. Contributor: create, edit, publish content and schedule refresh, but not manage access. Viewer: read-only; RLS applies.',
      level: 'Easy',
    },
    {
      q: 'Can a Free licence user view a report shared with them?',
      a: 'Only if the content is in a workspace on a Fabric F64 or larger capacity (or legacy Premium P capacity). Otherwise they need Pro (or PPU for PPU workspaces).',
      level: 'Medium',
    },
    {
      q: 'What is the difference between a workspace and an app?',
      a: 'A workspace is the collaboration area where creators build and manage content. An app is a curated, read-only package of that content for consumers, with its own navigation and audiences, updated only when the creator clicks Update app.',
      level: 'Medium',
    },
    {
      q: 'What are app audiences?',
      a: 'Groups within one app that see different subsets of the app content, e.g. Leadership sees only the summary report while Sales sees all reports.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a manager wants a report on the public company website. What do you advise?',
      a: 'Publish to web makes data public with no authentication or RLS. Use it only for non-sensitive public data and if the tenant setting allows it. For internal users use apps, Teams or SharePoint embedding; for external customers consider Power BI Embedded.',
      level: 'Hard',
    },
    {
      q: 'What is PPU and when is it a good choice?',
      a: 'Premium Per User gives premium features (48 refreshes/day, larger models, deployment pipelines, XMLA read/write, paginated features) per user. It suits small teams that need premium features but not a capacity; all viewers of PPU content also need PPU.',
      level: 'Medium',
    },
    {
      q: 'What are deployment pipelines?',
      a: 'A Premium/PPU/Fabric feature to promote content through Development, Test and Production stages, comparing changes and applying deployment rules (e.g. different data source per stage).',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Publish your practice report to My workspace, then to a new shared workspace, and note the differences.',
      hint: 'You need a Pro or trial licence for the shared workspace.',
      solution: 'My workspace is personal and cannot be shared via apps. The shared workspace supports Manage access, apps and collaboration.',
    },
    {
      task: 'Create an app with sections Overview and Details and two audiences.',
      hint: 'Workspace > Create app > Content and Audience tabs.',
      solution: 'Setup > Content (add a section, place reports) > Audience (default audience + New audience, hide content per audience, add groups) > Publish app.',
    },
    {
      task: 'Decide the role for: a finance manager who only reads, an analyst who edits reports, a team lead who should add people.',
      hint: 'Least privilege.',
      solution: 'Finance manager: Viewer (or app audience). Analyst: Contributor. Team lead: Member.',
    },
    {
      task: 'Endorse your semantic model as Promoted.',
      hint: 'Semantic model settings.',
      solution: 'Workspace > semantic model > More options > Settings > Endorsement and discovery > Promoted > Apply. (Certified requires admin-approved certifiers.)',
    },
  ],
  quiz: [
    {
      question: 'Which items are created when you publish a .pbix with imported data?',
      options: ['Only a report', 'A report and a semantic model', 'A dashboard and a dataflow', 'An app'],
      answer: 1,
      explanation: 'Publishing creates a semantic model and a report.',
    },
    {
      question: 'Which workspace role can publish/update the app but cannot delete the workspace?',
      options: ['Viewer', 'Contributor', 'Member', 'Admin'],
      answer: 2,
      explanation: 'Members can publish and update the app; only Admins delete the workspace.',
    },
    {
      question: 'Free users can view shared Power BI content when it is in...',
      options: ['A Pro workspace', 'A PPU workspace', 'An F64 or larger Fabric capacity', 'My workspace'],
      answer: 2,
      explanation: 'F64+ capacities allow Free users to consume content.',
    },
    {
      question: 'After editing a report in the workspace, app users see the change when...',
      options: ['Immediately', 'You click Update app', 'After the next refresh', 'After 24 hours'],
      answer: 1,
      explanation: 'App content is updated only when you update the app.',
    },
    {
      question: 'Publish to web is suitable for...',
      options: ['Confidential HR data', 'Public, non-sensitive data', 'Data with RLS', 'Internal finance reports'],
      answer: 1,
      explanation: 'It creates a public anonymous link with no security.',
    },
  ],
};
