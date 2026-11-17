export default {
  id: 'extra-42-workspace-roles',
  title: 'Workspace Roles',
  module: 'Extra: Advanced & Administration',
  extraNo: 42,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    'Every Power BI and Fabric workspace controls access with four roles: Admin, Member, Contributor and Viewer. Choosing the right role for each person or group keeps content safe, lets builders work freely and ensures row-level security protects data for consumers.',
  objectives: [
    'List the four workspace roles and what each can and cannot do',
    'Add users and security groups to a workspace with Manage access',
    'Explain how workspace roles interact with RLS, Build permission, item sharing and apps',
    'Know the licence rules for accessing workspace content (Free, Pro, PPU, Fabric capacity)',
    'Design a role plan for a real team following least privilege',
  ],
  theory: [
    {
      heading: 'The four roles at a glance',
      content:
        "A workspace is a shared folder for reports, semantic models, dataflows and Fabric items. Access is given by roles, from most to least powerful:\n\n1. **Admin**: full control. Update and delete the workspace, add or remove anyone including other Admins, plus everything below.\n2. **Member**: add Members, Contributors and Viewers (not Admins), publish, update and unpublish the workspace **app**, share items and allow others to reshare, plus everything below.\n3. **Contributor**: create, edit, publish and delete content in the workspace; schedule refresh of items they own or take over; cannot manage access or share items. Can update the app only if the Admin enables \"Allow contributors to update the app\".\n4. **Viewer**: view and interact with content (filter, slicers, export if allowed). Cannot edit. Only this role is filtered by RLS.\n\nAnalogy: an office building. Admin is the owner, Member is the manager who hands out keys, Contributor is staff who can work in every room, Viewer is a visitor who can look but not move furniture.",
    },
    {
      heading: 'Detailed permissions table',
      content:
        "- **Delete the workspace / change its licence mode**: Admin\n- **Add/remove Admins**: Admin\n- **Add Members, Contributors, Viewers**: Admin, Member (Member cannot add Admins)\n- **Publish, update, unpublish the app**: Admin, Member (Contributor only if allowed by setting)\n- **Share an item / give Build or Reshare**: Admin, Member\n- **Create, edit, delete items, publish from Desktop**: Admin, Member, Contributor\n- **Build permission on semantic models**: automatic for Admin, Member, Contributor\n- **Schedule refresh, configure credentials**: item owner (Contributor+ can take over)\n- **View and interact**: all four roles\n- **Subject to RLS**: Viewer only\n- **Copy a report, Analyze in Excel**: requires Build (Contributor+ by default, Viewers only if granted Build)",
      tip: 'RLS does not filter Admin, Member or Contributor because they have edit permission on the semantic model. To test RLS for a colleague, give them Viewer, or use Security > Test as role.',
    },
    {
      heading: 'Adding people and groups',
      content:
        "1. Open the workspace > **Manage access** (top-right).\n2. Click **+ Add people or groups**.\n3. Enter names, emails, **Microsoft 365 groups**, **security groups** or **distribution lists**.\n4. Choose the role from the drop-down > **Add**.\n\nBest practice: assign roles to **groups** rather than individuals. When someone joins or leaves the team, IT updates the group and Power BI access follows automatically.\n\nWorkspace settings (Workspace settings > General / License info) also control the **licence mode** (Pro, PPU, Fabric capacity, Trial, Embedded) and contact list.",
    },
    {
      heading: 'Licences and who can open the content',
      content:
        "Roles grant permission, but a user also needs the right **licence**:\n\n- Workspace in **Pro** licence mode: everyone (including Viewers) needs **Pro** or **PPU**.\n- Workspace in **PPU** mode: every user who accesses it needs **PPU**.\n- Workspace on a **Fabric capacity F64 or larger** (or legacy P1+): users with a **Free** licence can view content as Viewers; creators still need Pro or PPU to publish Power BI content.\n- Workspace on a smaller **F SKU** (F2 to F32): Fabric items work, but viewing Power BI reports still needs Pro or PPU.\n\nThis is a frequent interview question: a role alone does not let a Free user see a report in a Pro workspace.",
    },
    {
      heading: 'Workspace roles vs item sharing vs apps',
      content:
        "There are three ways to give access:\n\n- **Workspace roles**: for the team that builds and maintains content. Access to everything in the workspace.\n- **Item sharing** (Share button or Manage permissions on a report/model): give one person access to one item, optionally with Reshare or Build.\n- **Apps**: package selected reports and dashboards for a broad audience, with **audiences** that show different content to different groups. Recommended for end consumers because they do not see work-in-progress items and you control when updates go live.\n\nTypical design: developers are Contributors, the team lead is Member, BI platform owners are Admins, and business users consume through the app (not workspace roles).",
    },
  ],
  examples: [
    {
      title: 'Role plan for a sales BI team',
      scenario: 'A team of 2 BI leads, 4 developers, 6 analysts who build their own reports on the shared model, and 300 sales staff who only read reports. Workspace is on F64.',
      table: {
        headers: ['People', 'Access method', 'Role / permission'],
        rows: [
          ['BI leads (group SG-BI-Leads)', 'Workspace', 'Admin'],
          ['Developers (SG-BI-Dev)', 'Workspace', 'Contributor'],
          ['Analysts (SG-Sales-Analysts)', 'Semantic model sharing', 'Build permission (no workspace role)'],
          ['Sales staff (SG-Sales-All)', 'App audience', 'App access, RLS applies'],
        ],
      },
      steps: [
        'Workspace > Manage access > + Add people or groups > SG-BI-Leads > Admin > Add',
        'Add SG-BI-Dev > Contributor > Add',
        'Workspace > Retail Sales Model > ... > Manage permissions > + Add user > SG-Sales-Analysts > tick Allow recipients to build content > Grant',
        'Workspace > Create app > Audience tab > add SG-Sales-All > Publish app',
      ],
      result: 'Developers can publish and edit, analysts can build reports from the model without seeing workspace drafts, and sales staff see only the app filtered by RLS. Free licence holders can view because the capacity is F64.',
      explanation: 'Least privilege: each group gets only the access its job needs, and access is managed through groups.',
    },
    {
      title: 'Why RLS did not filter for a tester',
      scenario: 'An RLS role "City Manager" filters Customer[City] = "Pune". The tester is a Member of the workspace and still sees all four cities.',
      steps: [
        'In Desktop: Modeling > Manage roles > New role City Manager > table Customer > filter [City] = "Pune" > Save, then publish',
        'In the Service: semantic model > ... > Security > City Manager > add the tester > Save',
        'Workspace > Manage access > change the tester from Member to Viewer',
        'Ask the tester to reopen the report; or use semantic model > ... > Security > ... > Test as role',
      ],
      code: `-- RLS table filter on Customer
[City] = "Pune"`,
      result: 'As a Viewer the tester sees only Pune data; as a Member they saw all cities.',
      explanation: 'RLS applies only to users without edit rights on the model, i.e. the Viewer role (and app or share recipients).',
    },
    {
      title: 'Let Contributors update the app',
      scenario: 'Developers are Contributors but must push report updates to the app without involving the lead each time.',
      steps: [
        'As Admin: Workspace > Workspace settings',
        'Under the Advanced (or General) section find "Allow contributors to update the app for this workspace" and turn it on > Save',
        'A Contributor opens the workspace > Update app > Update app',
      ],
      result: 'Contributors can now update the existing app; they still cannot publish it for the first time, unpublish it or manage access.',
      explanation: 'This setting extends one specific Member right to Contributors without granting user management.',
    },
  ],
  interview: [
    {
      q: 'What are the four workspace roles?',
      a: 'Admin, Member, Contributor and Viewer, in decreasing order of permissions.',
      level: 'Easy',
    },
    {
      q: 'What can a Member do that a Contributor cannot?',
      a: 'Add Members, Contributors and Viewers, share items and grant reshare/Build, and publish, update or unpublish the app. Contributors can only edit and publish content (and update the app if the admin allows).',
      level: 'Medium',
    },
    {
      q: 'Which role is filtered by row-level security?',
      a: 'Only Viewer. Admin, Member and Contributor have edit permission on the semantic model, so RLS does not apply to them.',
      level: 'Medium',
    },
    {
      q: 'Can a Free user with the Viewer role open a report?',
      a: 'Only if the workspace is on a Fabric F64 or larger (or legacy P) capacity. In a Pro or PPU workspace, or on F2-F32, they need a Pro or PPU licence.',
      level: 'Medium',
    },
    {
      q: 'Scenario: 500 business users need to read reports. Would you add them as workspace Viewers?',
      a: 'Better to publish an app with audiences and add their security group to it. Apps hide work-in-progress items, let you control when updates go live and are easier to manage at scale. RLS still applies.',
      level: 'Medium',
    },
    {
      q: 'Can a Member remove an Admin?',
      a: 'No. Only Admins can add or remove Admins and delete the workspace.',
      level: 'Easy',
    },
    {
      q: 'Scenario: an analyst must build reports on your model but must not see other items in the workspace. How?',
      a: 'Do not give a workspace role. Share the semantic model directly with Build permission (Manage permissions > Allow recipients to build content). They can then connect from Desktop or create reports in their own workspace.',
      level: 'Hard',
    },
    {
      q: 'Why assign roles to security groups instead of individuals?',
      a: 'Easier administration and auditing: joiners and leavers are handled in Entra ID group membership, roles stay consistent, and you avoid hundreds of individual entries.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a workspace and add a colleague as Viewer and another as Contributor.',
      hint: 'Manage access > + Add people or groups.',
      solution: 'The access list shows both users with their roles; the Viewer sees no Edit or Upload options.',
    },
    {
      task: 'Create an RLS role on Customer[City] and verify that only the Viewer is filtered.',
      hint: 'Modeling > Manage roles; then Security in the Service.',
      solution: 'The Viewer sees one city; the Contributor sees all cities even when added to the role.',
    },
    {
      task: 'Write a role plan for your own team (or an imaginary one) with at least four groups.',
      hint: 'Separate builders, model consumers and report consumers.',
      solution: 'Example: Admins = platform owners, Members = team lead, Contributors = developers, Build-only = analysts, app audience = business users.',
    },
    {
      task: 'Find the workspace licence mode and explain whether a Free user could view its reports.',
      hint: 'Workspace settings > License info.',
      solution: 'If it shows Pro or PPU, a Free user cannot view. If it shows Fabric capacity F64+ (or P1+), a Free Viewer can.',
    },
  ],
  quiz: [
    {
      question: 'Which role can delete the workspace?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 0,
      explanation: 'Only Admins can delete the workspace or manage Admins.',
    },
    {
      question: 'Which role can publish the workspace app by default?',
      options: ['Viewer', 'Contributor', 'Member', 'Any user with Pro'],
      answer: 2,
      explanation: 'Admin and Member can publish/update the app; Contributors only update if enabled.',
    },
    {
      question: 'RLS restricts data for which role?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 3,
      explanation: 'Only Viewers (and app/share recipients) are filtered by RLS.',
    },
    {
      question: 'Which role can create and edit reports but not manage access?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 2,
      explanation: 'Contributor is the builder role without user management.',
    },
    {
      question: 'A Free user is a Viewer in a workspace on F32. Can they open reports?',
      options: ['Yes, always', 'No, they need Pro or PPU because the capacity is below F64', 'Yes, only on mobile', 'Only if RLS is set'],
      answer: 1,
      explanation: 'Free viewing of Power BI content requires F64 or larger (or legacy P capacity).',
    },
  ],
};
