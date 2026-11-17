export default {
  id: 'day-37-rls-ols',
  title: 'Row-Level Security (RLS), Object-Level Security (OLS) Basics',
  module: 'Module 6: Advanced Power BI',
  day: 37,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Row-Level Security restricts which rows a user can see (Pune manager sees only Pune), and Object-Level Security hides whole tables or columns (sales reps cannot see Cost). You will build static and dynamic RLS, test it in Desktop, assign users in the Power BI Service and understand OLS basics.',
  objectives: [
    'Create static RLS roles with DAX filter expressions in Modeling > Manage roles',
    'Build dynamic RLS using USERPRINCIPALNAME() and a user-access table',
    'Test roles with Modeling > View as and in the Power BI Service',
    'Assign users and security groups to roles in the Service and know who RLS does not apply to',
    'Explain OLS and set it up with Tabular Editor',
  ],
  theory: [
    {
      heading: 'What is Row-Level Security?',
      content:
        "**RLS** filters data at the row level based on who is viewing the report. One report and one semantic model serve everyone, but each person sees only their rows.\n\nAnalogy: a bank statement. Everyone uses the same banking app, but you see only your account.\n\nRLS is made of:\n\n1. **Roles** defined in Power BI Desktop (Modeling > Manage roles).\n2. A **DAX filter expression** on one or more tables per role; it must return TRUE/FALSE for each row.\n3. **Members** (users or security groups) assigned to roles in the Power BI Service, on the semantic model's Security page.\n\nThe filter on a dimension (e.g. Customer) flows through relationships to the fact table (Sales), so the user sees only matching sales.",
      points: [
        'RLS works on Import and DirectQuery semantic models created in Desktop.',
        'For a live connection to Analysis Services, security is defined in the source model instead.',
        'A user in several roles gets the union of their rows (roles are additive).',
      ],
    },
    {
      heading: 'Static RLS',
      content:
        "In static RLS the value is hard coded: role 'Pune' has the filter `[City] = \"Pune\"` on Customer. It is simple but needs one role per value, so it does not scale to hundreds of managers.\n\nSteps: **Modeling > Manage roles > New**, name the role, select the table, add a filter. The current editor lets you build rules with drop-downs; click **Switch to DAX editor** to type a DAX expression. Click **Save**.",
      syntax: "-- Table: Customer\n[City] = \"Pune\"",
    },
    {
      heading: 'Dynamic RLS',
      content:
        "Dynamic RLS uses one role whose filter compares data to the signed-in user, via `USERPRINCIPALNAME()`. That function returns the user's sign-in name (UPN), e.g. `asha@contoso.com`, in the Power BI Service. (`USERNAME()` returns DOMAIN\\user in Desktop, so prefer USERPRINCIPALNAME.)\n\nYou need an extra table that maps users to what they may see. For this course, create an extra table **UserAccess** (Email, City) with Home > Enter data. It is not part of the shared practice model.\n\nTwo ways to apply it:\n\n1. Relate UserAccess to a dimension and filter UserAccess by email (filter flows down the chain).\n2. Keep UserAccess disconnected and filter Customer with a lookup: `[City] IN CALCULATETABLE(VALUES(UserAccess[City]), UserAccess[Email] = USERPRINCIPALNAME())`.\n\nOption 2 avoids a many-to-many relationship because City is not unique in Customer.",
      syntax: "-- Role: Manager, Table: Customer\n[City] IN CALCULATETABLE (\n    VALUES ( UserAccess[City] ),\n    UserAccess[Email] = USERPRINCIPALNAME ()\n)",
      tip: 'Also add a filter on UserAccess itself ([Email] = USERPRINCIPALNAME()) or hide the table, so users cannot see who else has access.',
    },
    {
      heading: 'Testing and deploying RLS',
      content:
        "**In Desktop**: Modeling > **View as** > tick a role (and optionally **Other user** and type an email to test dynamic RLS) > OK. A yellow bar shows 'Now viewing as'. Click **Stop viewing** to return.\n\n**In the Service**: publish the report, open the workspace, hover the semantic model > More options (...) > **Security**. Select a role, add people or Microsoft Entra security groups, click **Add** then **Save**. Use More options next to the role > **Test as role** to check.\n\nImportant: RLS restricts users with the **Viewer** workspace role or users who receive the report through sharing or an app with read permission. Workspace **Admin, Member and Contributor** have edit rights on the semantic model, so **RLS does not apply to them**.",
      points: [
        'Prefer security groups over individual emails; HR adds people to the group.',
        'If a user is in no role and RLS exists, they see no data (blank visuals).',
        'Re-publishing does not remove role memberships as long as the role names stay the same.',
      ],
    },
    {
      heading: 'Object-Level Security (OLS)',
      content:
        "**OLS** hides entire tables or columns from a role. For users in the role, the object behaves as if it does not exist: visuals that use it show an error, and the field list (for build users) does not show it. Example: sales reps must not see `Sales[Cost]` or a `Salary` column.\n\nPower BI Desktop has no screen to set OLS. You:\n\n1. Create the role in Desktop (Manage roles). A role can exist with no row filter.\n2. Open **External tools > Tabular Editor** (free Tabular Editor 2 or paid version 3).\n3. Select the column or table > Object Level Security > set the role permission to **None** (default is Read).\n4. Save to the model (Ctrl+S), return to Desktop, publish, and assign members in the Service as for RLS.\n\nRules to remember: OLS also applies only to Viewers; a user cannot be in one role with RLS and another role with OLS at the same time (combine them inside one role instead).",
    },
  ],
  examples: [
    {
      title: 'Static role for Pune',
      scenario: 'The Pune branch manager should see only Pune customers and their sales (sample slice).',
      table: {
        headers: ['View', 'Total Sales'],
        rows: [
          ['No role (developer)', '1,86,500'],
          ['Role Pune', '1,24,000'],
        ],
      },
      steps: [
        'Modeling > Manage roles > New',
        'Rename the role to Pune',
        'Select the Customer table, Switch to DAX editor, type the filter below, click Save',
        'Modeling > View as > tick Pune > OK',
        'Check a card with [Total Sales]; then click Stop viewing',
      ],
      code: `-- Role: Pune   Table: Customer
[City] = "Pune"`,
      result: 'The card shows 1,24,000 (orders 1001 and 1003 of Asha, Pune).',
      explanation: 'The role filters Customer; the relationship Customer → Sales carries the filter to the fact table.',
    },
    {
      title: 'User in two roles (additive)',
      scenario: 'A regional manager is added to both the Pune and Mumbai roles.',
      table: {
        headers: ['Roles applied', 'Cities visible', 'Total Sales'],
        rows: [
          ['Pune', 'Pune', '1,24,000'],
          ['Mumbai', 'Mumbai', '12,500'],
          ['Pune + Mumbai', 'Pune, Mumbai', '1,36,500'],
        ],
      },
      steps: [
        'Create a second role Mumbai with [City] = "Mumbai" on Customer',
        'Modeling > View as > tick both Pune and Mumbai > OK',
        'Check the card and a table by City',
      ],
      code: `-- Role: Mumbai   Table: Customer
[City] = "Mumbai"`,
      result: 'Both cities are visible; total 1,36,500.',
      explanation: 'Multiple roles combine with OR logic: the user sees rows allowed by any of their roles.',
    },
    {
      title: 'Dynamic RLS with a UserAccess table',
      scenario: 'One role for all managers. A mapping table decides which city each email can see.',
      table: {
        headers: ['UserAccess[Email]', 'UserAccess[City]'],
        rows: [
          ['asha.manager@contoso.com', 'Pune'],
          ['ravi.manager@contoso.com', 'Mumbai'],
          ['zonal.head@contoso.com', 'Pune'],
          ['zonal.head@contoso.com', 'Nagpur'],
        ],
      },
      steps: [
        'Home > Enter data: create table UserAccess with the rows above (extra table, not in the shared model) > Load',
        'Model view: confirm UserAccess has no relationship',
        'Modeling > Manage roles > New role Manager',
        'Customer table filter: the first expression below (DAX editor)',
        'UserAccess table filter: the second expression below',
        'Save; Modeling > View as > tick Other user, type zonal.head@contoso.com, tick Manager > OK',
      ],
      code: `-- Role: Manager   Table: Customer
[City] IN CALCULATETABLE (
    VALUES ( UserAccess[City] ),
    UserAccess[Email] = USERPRINCIPALNAME ()
)

-- Role: Manager   Table: UserAccess
[Email] = USERPRINCIPALNAME ()`,
      result: 'zonal.head sees Pune + Nagpur = 1,74,000; ravi.manager sees 12,500; an email not in the table sees nothing.',
      explanation: 'USERPRINCIPALNAME returns the tested or signed-in email; CALCULATETABLE returns the cities for that email; the Customer filter keeps only those cities.',
    },
    {
      title: 'Assign members and test in the Power BI Service',
      scenario: 'Publish the report and give the Manager role to a security group.',
      table: {
        headers: ['Workspace role of user', 'Is RLS applied?'],
        rows: [
          ['Viewer', 'Yes'],
          ['Contributor', 'No'],
          ['Member', 'No'],
          ['Admin', 'No'],
          ['Shared with read permission / App audience', 'Yes'],
        ],
      },
      steps: [
        'Home > Publish > choose the workspace',
        'In the Service open the workspace, hover the semantic model > More options (...) > Security',
        'Select the Manager role, type the security group name (e.g. SG-Branch-Managers) > Add > Save',
        'Next to Manager click More options (...) > Test as role; optionally Now viewing as > choose a specific person',
        'Give managers the Viewer workspace role or share/publish an app to them',
      ],
      result: 'Managers in Viewer role see only their city. Contributors and above see everything.',
      explanation: 'RLS applies to users who only have read access. Anyone who can edit the semantic model bypasses RLS by design.',
    },
    {
      title: 'OLS: hide the Cost column from sales reps',
      scenario: 'Sales reps must never see Cost or any measure that uses it.',
      table: {
        headers: ['Object', 'Role SalesRep permission'],
        rows: [
          ['Sales[Cost]', 'None'],
          ['Sales[SalesAmount]', 'Read (default)'],
        ],
      },
      steps: [
        'Modeling > Manage roles > New role SalesRep (no row filter needed) > Save',
        'External tools > Tabular Editor (install it first if the ribbon does not show it)',
        'Expand Tables > Sales > Columns > Cost; in Properties find Object Level Security > SalesRep = None',
        'File > Save (saves back to the open Desktop model); close Tabular Editor',
        'Publish and add sales reps to SalesRep in the Service (Security page)',
      ],
      result: 'For SalesRep users, visuals using Cost or measures like Profit show an error ("cannot load the data for this visual"); other visuals work.',
      explanation: 'OLS removes the object from the user\'s view of the model. Measures that depend on a hidden column are also blocked, so design separate pages for restricted users.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between RLS and OLS?',
      a: 'RLS restricts rows (data values) using DAX filters per role; OLS hides whole tables or columns (metadata) for a role. RLS is configured in Desktop; OLS is configured with Tabular Editor or the XMLA endpoint.',
      level: 'Easy',
    },
    {
      q: 'Static vs dynamic RLS?',
      a: 'Static RLS hard-codes values (one role per city). Dynamic RLS uses one role with USERPRINCIPALNAME() and a mapping table, so access is controlled by data, not by creating more roles.',
      level: 'Easy',
    },
    {
      q: 'Why does a workspace Member see all data even though RLS is set?',
      a: 'RLS applies only to users with read-only access to the semantic model (Viewers, shared/app users). Admin, Member and Contributor can edit the model, so RLS is not enforced for them.',
      level: 'Medium',
    },
    {
      q: 'How do you test RLS before publishing?',
      a: 'Modeling > View as, select the role(s), and for dynamic RLS tick Other user and enter an email. In the Service, use Security > Test as role.',
      level: 'Easy',
    },
    {
      q: 'What happens if a user belongs to two roles?',
      a: 'Roles are additive; the user sees the union of rows allowed by both roles.',
      level: 'Medium',
    },
    {
      q: 'Scenario: 300 store managers each see one store. How do you design RLS?',
      a: 'Dynamic RLS: a StoreAccess table (Email, StoreID) maintained by IT or HR, one Manager role filtering Store by USERPRINCIPALNAME(), members assigned via a security group. New managers need only a row in the table and group membership, no model change.',
      level: 'Hard',
    },
    {
      q: 'What does USERPRINCIPALNAME() return?',
      a: 'The user principal name of the signed-in user, typically their email-format sign-in (user@company.com). In Desktop it returns the Windows/organisational UPN of the developer, or the Other user value in View as.',
      level: 'Medium',
    },
    {
      q: 'Can you configure OLS in Power BI Desktop directly?',
      a: 'No UI exists in Desktop. Create the role in Desktop, then set table/column permissions to None using Tabular Editor (External tools) or via TMSL/XMLA. Publish and assign members as usual.',
      level: 'Hard',
    },
    {
      q: 'What does a user who is not in any role see when the model has RLS?',
      a: 'No data. Once roles exist, read-only users must be members of at least one role to see rows.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a static role Corporate that shows only Corporate segment customers and test it.',
      hint: 'Filter the Customer table on Segment.',
      solution: `-- Role: Corporate  Table: Customer
[Segment] = "Corporate"
-- View as Corporate: sample total 1,74,000 (Asha + Neha).`,
    },
    {
      task: 'Create a role Electronics Team that sees only the Electronics category.',
      hint: 'Filter the Product table.',
      solution: `-- Role: Electronics Team  Table: Product
[Category] = "Electronics"
-- Sample total: 1,50,000`,
    },
    {
      task: 'Build dynamic RLS where each email can see one or more categories (extra table CategoryAccess with Email, Category).',
      hint: 'Same pattern as UserAccess but on Product.',
      solution: `-- Role: CategoryUser  Table: Product
[Category] IN CALCULATETABLE (
    VALUES ( CategoryAccess[Category] ),
    CategoryAccess[Email] = USERPRINCIPALNAME ()
)
-- Table: CategoryAccess
[Email] = USERPRINCIPALNAME ()`,
    },
    {
      task: 'Add a card that shows the current user email so testers can confirm who they are viewing as.',
      hint: 'A measure can call USERPRINCIPALNAME().',
      solution: `Current User = USERPRINCIPALNAME ()`,
    },
    {
      task: 'Write the steps to hide the Product[Price] column from a role Interns using OLS.',
      hint: 'Role in Desktop, permission in Tabular Editor.',
      solution:
        '1. Modeling > Manage roles > New: Interns > Save. 2. External tools > Tabular Editor. 3. Product > Price > Object Level Security > Interns = None. 4. Save, publish. 5. Service: semantic model > Security > Interns > add members > Save.',
    },
  ],
  quiz: [
    {
      question: 'Where do you create RLS roles?',
      options: ['Power Query Editor', 'Modeling > Manage roles', 'File > Options', 'Format pane'],
      answer: 1,
      explanation: 'Roles and their DAX filters are created in Desktop under Modeling > Manage roles.',
    },
    {
      question: 'Which function is recommended for dynamic RLS?',
      options: ['USERNAME()', 'USERPRINCIPALNAME()', 'SELECTEDVALUE()', 'USEROBJECTID() only'],
      answer: 1,
      explanation: 'USERPRINCIPALNAME() returns the UPN consistently in Desktop and Service.',
    },
    {
      question: 'For which workspace role is RLS enforced?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 3,
      explanation: 'Only read-only users such as Viewers are restricted.',
    },
    {
      question: 'OLS is typically configured using...',
      options: ['Performance Analyzer', 'Tabular Editor', 'Power Query', 'Bookmarks pane'],
      answer: 1,
      explanation: 'Desktop has no OLS UI; Tabular Editor (or XMLA/TMSL) sets object permissions.',
    },
    {
      question: 'A user in roles Pune and Mumbai sees...',
      options: ['Only Pune', 'Only Mumbai', 'Pune and Mumbai', 'No data'],
      answer: 2,
      explanation: 'Roles are additive (union).',
    },
  ],
};
