export default {
  id: 'security-rls',
  title: 'Security: Row-Level Security (RLS), Object-Level Security (OLS) & Governance',
  level: 'Advanced',
  day: 16,
  duration: '4 hours',
  summary:
    "Make sure every user sees only the data they are allowed to see. Learn static and dynamic row-level security, manager hierarchies with PATH functions, testing with View as, assigning roles in the Service, object-level security, workspace security and sensitivity labels. Security is a top interview topic for Power BI roles.",
  objectives: [
    'Create static RLS roles with DAX filter expressions',
    'Implement dynamic RLS using USERPRINCIPALNAME() and a security/mapping table',
    'Build manager hierarchy security with PATH and PATHCONTAINS',
    'Test roles with View as in Desktop and the Service, and assign members in the Service',
    'Explain OLS, workspace-level security, and how RLS interacts with workspace roles',
    'Apply sensitivity labels and describe data protection features',
  ],
  theory: [
    {
      heading: 'What is row-level security?',
      content:
        "**Row-level security (RLS)** restricts which **rows** of data a user can see. It is defined in the semantic model as **roles**; each role contains **DAX filter expressions** on one or more tables. The expression is evaluated for every row; rows where it returns TRUE are visible.\n\nFilters on a dimension table propagate through relationships to fact tables (following filter direction). So a filter on Customer[Country] automatically restricts Sales rows.\n\nRLS is enforced in the Service for users with the **Viewer** role, app users and users the report is shared with. It is **not** enforced for workspace **Admins, Members and Contributors** (they can edit the model). It is also enforced for Analyze in Excel, live connections and the XMLA endpoint (for read users).",
      points: [
        'Roles are created in Desktop (Modeling > Manage roles) and members are assigned in the Service',
        'A user in multiple roles sees the UNION of rows allowed by all roles (roles are additive)',
        'If a user has no role and the model has RLS, they see no data (for Viewers)',
        'RLS works for Import and DirectQuery; for live connection to Analysis Services, security is defined in the source model',
      ],
    },
    {
      heading: 'Static RLS',
      content:
        "In **static RLS** the filter value is hard-coded in the role. Example: role 'Germany' with filter on Customer: `[Country] = \"Germany\"`. You then add the German sales team to this role.\n\nIt is simple but does not scale: 30 countries require 30 roles, and changes in the organisation require editing and republishing the model.",
      syntax:
        '-- Role: Germany   Table: Customer\n[Country] = "Germany"\n\n-- Role: Europe   Table: Customer\n[Country] IN { "Germany", "France", "Spain", "Italy" }\n\n-- Role: Bikes Only   Table: Product\n[Category] = "Bikes"',
      tip: "The new Manage roles editor in Desktop offers a default UI where you pick table, column and value; switch to the DAX editor for complex expressions.",
    },
    {
      heading: 'Dynamic RLS with USERPRINCIPALNAME()',
      content:
        "**Dynamic RLS** uses one role whose filter depends on **who** is logged in. `USERPRINCIPALNAME()` returns the user's sign-in name (UPN), e.g. anna@contoso.com, in both Desktop (when testing with View as) and the Service. (`USERNAME()` returns DOMAIN\\user in Desktop but the UPN in the Service, so USERPRINCIPALNAME is preferred.)\n\nPattern:\n1. Create a **security table** mapping users to what they can see, e.g. UserSecurity(Email, Country) - one row per user per country.\n2. Relate it to the dimension, or filter in DAX.\n3. Create one role with a filter on the security table: `[Email] = USERPRINCIPALNAME()`.\n4. Add everyone (or a security group) to that single role.\n\nNow access is controlled by **data**, not by model changes: adding a row to UserSecurity grants access after the next refresh.",
      syntax:
        '-- Option A (recommended): no relationship to UserSecurity;\n--   filter the dimension in DAX\n-- Role: Dynamic Country   Table: Customer\n[Country]\n    IN CALCULATETABLE (\n        VALUES ( UserSecurity[Country] ),\n        UserSecurity[Email] = USERPRINCIPALNAME ()\n    )\n\n-- Option B: model relationship UserSecurity -> Country dimension -> Customer,\n--   with the role filter on UserSecurity:\n[Email] = USERPRINCIPALNAME ()',
      tip: "Option A keeps relationships simple and avoids bi-directional filters. In Option B, if UserSecurity is on the many side of a relationship to a Country dimension, the filter must flow from UserSecurity to Country, which requires a bi-directional relationship with 'Apply security filter in both directions' - more complex.",
    },
    {
      heading: 'Manager hierarchy security with PATH',
      content:
        "A common requirement: each manager sees their own data and the data of everyone reporting to them, at any depth. With an Employee table (EmployeeID, Name, Email, ManagerID) we use **parent-child** functions:\n\n- **PATH(EmployeeID, ManagerID)** - returns a delimited string of the chain from top to the current employee, e.g. \"1|4|9\".\n- **PATHCONTAINS(path, item)** - TRUE if item is in the path.\n- **PATHITEM(path, position, type)** and **PATHLENGTH(path)** - flatten the hierarchy into Level columns.\n\nThe RLS rule: show an employee's rows if the logged-in user's EmployeeID appears in that employee's path.",
      syntax:
        '-- Calculated column in Employee\nManagerPath = PATH ( Employee[EmployeeID], Employee[ManagerID] )\n\n-- Role: Manager Hierarchy   Table: Employee\nPATHCONTAINS (\n    Employee[ManagerPath],\n    LOOKUPVALUE (\n        Employee[EmployeeID],\n        Employee[Email], USERPRINCIPALNAME ()\n    )\n)',
      tip: "PATH requires that IDs be unique and that the top-level employee has a blank ManagerID. Circular references produce an error.",
    },
    {
      heading: 'Testing roles and assigning members',
      content:
        "**Testing in Desktop**: Modeling > **View as** > select one or more roles, and optionally **Other user** (type an email) to test dynamic RLS as a specific user. A yellow bar shows 'Now viewing as...'. Stop viewing to return.\n\n**Assigning in the Service**: semantic model > ... > **Security** > choose the role > add members (users, **security groups** recommended, distribution lists not supported) > Save. Roles created in Desktop appear automatically after publish; you cannot create or edit role DAX in the Service (except via web modeling or XMLA tools).\n\n**Testing in the Service**: Security > role > ... > **Test as role**; you can also enter another user to test dynamic RLS as them.\n\nRemember: test as a Viewer! As workspace Admin/Member/Contributor you will see everything in the normal view.",
    },
    {
      heading: 'Object-level security (OLS)',
      content:
        "**OLS** hides entire **tables or columns** from specific roles - e.g. hide Employee[Salary] or the whole Cost table from regular sales users. Unlike just hiding a column in the Field list, OLS secures the metadata: for restricted users the object does not exist, and visuals that use it show an error.\n\nOLS cannot be configured in Power BI Desktop's UI; you set it with an external tool such as **Tabular Editor** (Role > Table Permissions / Column permissions = None) and publish. OLS can be combined with RLS, but not across different roles for the same user: if a user belongs to one role with RLS and another role with OLS, Power BI returns an error. Define both restrictions in the same role instead.",
      points: [
        'Hiding a column (right-click > Hide in report view) is NOT security - users with Build permission can still access it',
        'OLS secures metadata: the object is invisible to restricted roles',
        'Measures referencing a secured column also become unavailable to those users',
        'Design reports for OLS users carefully (separate reports/pages), as visuals with secured fields break',
      ],
    },
    {
      heading: 'Workspace security, sharing and service principal considerations',
      content:
        "Security in Power BI is layered:\n\n1. **Tenant settings** (admin portal) - who can export, publish to web, share externally, use custom visuals, create workspaces.\n2. **Workspace roles** - Admin/Member/Contributor/Viewer. Remember editors bypass RLS.\n3. **Item permissions** - Read, Build, Reshare, Write on semantic models and reports; app audiences.\n4. **Data security** - RLS and OLS in the model.\n5. **Information protection** - sensitivity labels and DLP.\n\nPrinciple of least privilege: give consumers Viewer or app access, use security groups, avoid sharing from My workspace, and restrict Build permission when users should not create their own reports.",
    },
    {
      heading: 'Sensitivity labels and data protection',
      content:
        "**Microsoft Purview Information Protection sensitivity labels** (e.g. Public, General, Confidential, Highly Confidential) can be applied to reports, semantic models, dashboards and dataflows in Desktop and the Service.\n\n- Labels are visible to users and indicate how to handle content.\n- **Protection follows the data on export**: exporting to Excel, PowerPoint or PDF applies the label and its encryption, so only authorised people can open the exported file.\n- **Inheritance**: labels can flow downstream from data sources to semantic models to reports, and to newly created content.\n- **Mandatory labelling** and **default labels** can be enforced by admins.\n- **Data loss prevention (DLP)** policies in Purview can detect sensitive data (e.g. credit card numbers) in semantic models and alert.\n\nLabels require Microsoft 365/Purview licensing and admin enablement.",
    },
  ],
  examples: [
    {
      title: 'Static RLS by region',
      scenario: 'Three regional sales teams (North, South, West) should see only their region. Customer table has a Region column.',
      code:
        'Desktop > Modeling > Manage roles > New:\n  Role "North"  Table Customer: [Region] = "North"\n  Role "South"  Table Customer: [Region] = "South"\n  Role "West"   Table Customer: [Region] = "West"\nSave > View as > North -> verify only North numbers.\nPublish > semantic model > Security:\n  North -> SG-Sales-North\n  South -> SG-Sales-South\n  West  -> SG-Sales-West',
      explanation:
        'The filter on Customer flows to Sales through the one-to-many relationship, so all sales measures are restricted. Works well for few, stable regions; with many regions, switch to dynamic RLS.',
    },
    {
      title: 'Dynamic RLS with a user-country mapping table',
      scenario: 'Sales reps can access one or more countries. Access changes often and must not require republishing.',
      table: {
        headers: ['Email', 'Country'],
        rows: [
          ['anna@contoso.com', 'Germany'],
          ['anna@contoso.com', 'Austria'],
          ['raj@contoso.com', 'India'],
          ['li@contoso.com', 'China'],
        ],
      },
      code:
        '-- UserSecurity table loaded from SharePoint list / SQL table (no relationships)\n-- Role "Dynamic Country", filter on table Customer:\n[Country]\n    IN CALCULATETABLE (\n        VALUES ( UserSecurity[Country] ),\n        UserSecurity[Email] = USERPRINCIPALNAME ()\n    )\n\n-- Role filter on UserSecurity itself (so users cannot see others\' mappings):\n[Email] = USERPRINCIPALNAME ()\n\n-- Hide the UserSecurity table from report view.',
      result: 'Anna sees Germany + Austria; Raj sees India only; anyone not in the table sees nothing.',
      explanation:
        'One role for everyone. For each Customer row, the filter checks whether the country is in the list of countries mapped to the current user. Adding a row to the mapping table grants access after the next refresh. Make emails lowercase/consistent with UPNs and test with View as > Other user.',
    },
    {
      title: 'Manager hierarchy RLS',
      scenario: 'The CEO sees everything, each manager sees their own team (all levels below), and each rep sees only their own sales. Sales has an EmployeeID (sales rep).',
      table: {
        headers: ['EmployeeID', 'Name', 'Email', 'ManagerID', 'ManagerPath'],
        rows: [
          ['1', 'Maria (CEO)', 'maria@contoso.com', '', '1'],
          ['2', 'John', 'john@contoso.com', '1', '1|2'],
          ['3', 'Priya', 'priya@contoso.com', '2', '1|2|3'],
          ['4', 'Tom', 'tom@contoso.com', '2', '1|2|4'],
          ['5', 'Sara', 'sara@contoso.com', '1', '1|5'],
        ],
      },
      code:
        '-- Calculated column in Employee\nManagerPath = PATH ( Employee[EmployeeID], Employee[ManagerID] )\n\n-- Role "Hierarchy", table Employee\nVAR CurrentUserID =\n    LOOKUPVALUE ( Employee[EmployeeID], Employee[Email], USERPRINCIPALNAME () )\nRETURN\n    PATHCONTAINS ( Employee[ManagerPath], CurrentUserID )',
      result: 'Maria: all 5 employees. John: John, Priya, Tom. Priya: only Priya. Sara: only Sara.',
      explanation:
        'PATH builds the chain from the top. If the logged-in user\'s ID appears in an employee\'s path, that employee is the user or someone below them. The Employee filter flows to Sales via Sales[EmployeeID]. LOOKUPVALUE returns BLANK for unknown users, so they see nothing.',
    },
    {
      title: 'Testing dynamic RLS in Desktop and the Service',
      scenario: 'Verify that raj@contoso.com sees only India.',
      code:
        'Desktop: Modeling > View as > tick "Other user" = raj@contoso.com and tick role "Dynamic Country" > OK.\n  -> Cards and visuals show India only. Click "Stop viewing".\n\nService: semantic model > ... > Security > Dynamic Country > ... > Test as role\n  -> "Now viewing as: Dynamic Country" > change to "Viewing as raj@contoso.com".\n\nEnd-to-end: ask Raj (workspace Viewer or app user) to open the report.',
      explanation:
        'You must tick both the role and the user, otherwise USERPRINCIPALNAME returns your own account. Testing in the Service confirms that roles and memberships were published correctly.',
    },
    {
      title: 'Object-level security to hide salary data',
      scenario: 'HR model: only HR Managers may see Employee[Salary] and the Payroll table; others should not even see these fields.',
      code:
        '1. Desktop: Modeling > Manage roles > create "HR Managers" (no filter) and "Staff" (no filter or RLS as needed). Publish not yet.\n2. External tools > Tabular Editor (connects to the open model).\n3. Roles > Staff > Table Permissions: Payroll = None.\n4. Tables > Employee > Salary column > Object Level Security: Staff = None.\n5. Save to model (Ctrl+S) > back in Desktop > Publish.\n6. Service: assign groups to HR Managers and Staff.',
      explanation:
        'For Staff, the Payroll table and the Salary column do not exist in metadata. Measures using them are invalid for Staff. Build separate report pages or reports for each audience so Staff do not get broken visuals.',
    },
  ],
  interview: [
    {
      q: 'What is RLS and how is it implemented in Power BI?',
      a: 'Row-level security restricts data rows per user. In Desktop: Modeling > Manage roles > create roles with DAX filter expressions on tables (e.g. Customer[Country] = "Germany"); filters propagate via relationships. Test with View as. Publish, then in the Service assign users/security groups to roles (semantic model > Security). RLS applies to Viewers, app users and shared users, not to workspace Admin/Member/Contributor.',
      level: 'Easy',
    },
    {
      q: 'Static vs dynamic RLS - which would you choose and why?',
      a: 'Static RLS hard-codes values per role (one role per region): simple for a few stable groups but requires model changes for new groups. Dynamic RLS uses one role with USERPRINCIPALNAME() and a mapping table: access managed through data, scales to thousands of users, supports many-to-many access (user to several regions), no republish needed. For most real organisations, dynamic RLS is the better choice.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between USERNAME() and USERPRINCIPALNAME()?',
      a: 'USERPRINCIPALNAME() returns the UPN (user@domain.com) both in Desktop and the Service. USERNAME() returns DOMAIN\\username in Desktop and the UPN in the Service, which causes inconsistent results during testing. Use USERPRINCIPALNAME() and store UPNs in the security table. (CUSTOMDATA() is used for embedded/Analysis Services scenarios.)',
      level: 'Medium',
    },
    {
      q: 'A user belongs to two roles: "Germany" and "Bikes". What do they see?',
      a: 'Roles are additive (union): the user sees rows allowed by EITHER role - all German data plus all Bikes data worldwide, not only German bikes. To restrict to the intersection, create a single role with both conditions (Customer[Country] = "Germany" and Product[Category] = "Bikes" as filters in the same role).',
      level: 'Hard',
    },
    {
      q: 'Scenario: You applied RLS but a colleague still sees all data in the Service. Why?',
      a: 'Most likely they are workspace Admin, Member or Contributor - these roles have edit rights on the semantic model and RLS does not apply to them. Other causes: (note: a Viewer with no role sees nothing, not everything, so "no role" is not the cause); they view a different copy of the report/model; the RLS filter is on a table whose filter does not propagate to the fact (wrong relationship direction); or the model is a live connection where security must be defined at the source. Fix: give consumers Viewer role or app access and test with Test as role.',
      level: 'Hard',
    },
    {
      q: 'How do you implement manager hierarchy security?',
      a: 'Employee table with EmployeeID and ManagerID. Calculated column ManagerPath = PATH(EmployeeID, ManagerID). Role filter on Employee: PATHCONTAINS(Employee[ManagerPath], LOOKUPVALUE(Employee[EmployeeID], Employee[Email], USERPRINCIPALNAME())). Each manager sees employees whose path contains their ID, i.e. themselves and everyone below at any depth. The filter flows to fact tables via EmployeeID.',
      level: 'Hard',
    },
    {
      q: 'What is OLS and how is it different from hiding a column?',
      a: 'Object-level security restricts access to tables or columns per role - for unauthorised users the objects do not exist in metadata, and queries referencing them fail. Hiding a column only removes it from the field list for convenience; users with Build permission or Analyze in Excel can still query it. OLS is configured using external tools like Tabular Editor (not the Desktop UI).',
      level: 'Medium',
    },
    {
      q: 'Does RLS filter flow across relationships? What about bi-directional relationships?',
      a: 'Yes, RLS filters propagate along relationships in the filter direction (one to many). For a filter to flow from the many side to the one side (e.g. security table on the many side filtering a dimension), you need a bi-directional relationship AND the option "Apply security filter in both directions" on that relationship. It is often simpler to write a DAX filter with IN / CALCULATETABLE that avoids bi-directional relationships.',
      level: 'Hard',
    },
    {
      q: 'How do you test RLS?',
      a: 'In Desktop: Modeling > View as > select role(s), and Other user to simulate a specific UPN for dynamic RLS. In the Service: semantic model > Security > role > Test as role, optionally as a specific user. Finally, user acceptance testing with a real Viewer account. Validate totals, cards, and drill-through pages, and check that security tables are themselves secured.',
      level: 'Easy',
    },
    {
      q: 'Scenario: Some managers should see all regions while sales reps see only their own. How do you handle this with dynamic RLS?',
      a: 'Option 1: two roles - "All Data" with no filter (or TRUE()) for managers, and "Dynamic" for reps; assign groups accordingly. Option 2: a single role where the mapping table has a flag, e.g. IF(LOOKUPVALUE(UserAccess[SeeAll], UserAccess[Email], USERPRINCIPALNAME()) = TRUE(), TRUE(), [Region] IN <user regions>). Option 2 keeps all access management in data.',
      level: 'Hard',
    },
    {
      q: 'What are sensitivity labels in Power BI?',
      a: 'Microsoft Purview Information Protection labels (e.g. Confidential) applied to Power BI items. They classify content, can be inherited from data sources and downstream items, can be mandatory or default, and their protection (encryption) persists when data is exported to Excel, PowerPoint or PDF, so only authorised users can open the exported files. Admins enable them in tenant settings.',
      level: 'Medium',
    },
    {
      q: 'Can you use USERELATIONSHIP or bi-directional filters with RLS safely?',
      a: 'Be careful: USERELATIONSHIP raises an error if RLS is defined on a table involved in the relationship it activates, and bi-directional relationships can unintentionally expose or restrict data. Always test with View as. Keep security filters on dimensions with single-direction relationships where possible.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a static role "Accessories Team" that shows only the Accessories category, and test it.',
      hint: 'Filter on Product table.',
      solution:
        'Manage roles > New role "Accessories Team" > table Product > DAX: [Category] = "Accessories" > Save. View as > Accessories Team: all visuals (Sales, Customers count) show only Accessories data because Product filters Sales.',
    },
    {
      task: 'Build dynamic RLS where each sales rep (Sales has SalesRepEmail) sees only their own sales rows.',
      hint: 'Filter directly on the fact? Prefer a SalesRep dimension.',
      solution:
        'Create a SalesRep dimension (SalesRepID, Name, Email) related to Sales[SalesRepID]. Role "Rep" on SalesRep: [Email] = USERPRINCIPALNAME(). Test with View as > Other user. (Filtering the fact table directly also works: Sales[SalesRepEmail] = USERPRINCIPALNAME(), but dimension filters are more efficient and reusable.)',
    },
    {
      task: 'Write the DAX to flatten a manager hierarchy into Level1, Level2 and Level3 name columns.',
      hint: 'PATHITEM + LOOKUPVALUE.',
      solution:
        'Level1 = LOOKUPVALUE ( Employee[Name], Employee[EmployeeID], PATHITEM ( Employee[ManagerPath], 1, INTEGER ) )\nLevel2 = LOOKUPVALUE ( Employee[Name], Employee[EmployeeID], PATHITEM ( Employee[ManagerPath], 2, INTEGER ) )\nLevel3 = LOOKUPVALUE ( Employee[Name], Employee[EmployeeID], PATHITEM ( Employee[ManagerPath], 3, INTEGER ) )\nCreate a hierarchy Level1 > Level2 > Level3 for a matrix. Optionally fill blanks with the previous level name.',
    },
    {
      task: 'A user in the security table should see all data when the Country column contains "ALL". Write the role expression on Customer.',
      hint: 'Check for "ALL" first.',
      solution:
        'VAR UserCountries =\n    CALCULATETABLE ( VALUES ( UserSecurity[Country] ), UserSecurity[Email] = USERPRINCIPALNAME () )\nRETURN\n    IF ( "ALL" IN UserCountries, TRUE (), Customer[Country] IN UserCountries )',
    },
    {
      task: 'List the steps to assign the "Dynamic Country" role to all sales staff in the Service and verify it.',
      hint: 'Security page of the semantic model.',
      solution:
        '1. Workspace > semantic model > ... > Security.\n2. Select Dynamic Country > add security group SG-Sales-All > Save.\n3. ... > Test as role > Now viewing as > Specific person (e.g. raj@contoso.com).\n4. Ensure sales staff consume via app or Viewer role (not Contributor).',
    },
  ],
  quiz: [
    {
      question: 'Which function returns the logged-in user\'s UPN consistently in Desktop and the Service?',
      options: ['USERNAME()', 'USERPRINCIPALNAME()', 'USEROBJECTID()', 'CURRENTUSER()'],
      answer: 1,
      explanation: 'USERPRINCIPALNAME() returns user@domain in both environments.',
    },
    {
      question: 'For which workspace role is RLS enforced?',
      options: ['Admin', 'Member', 'Contributor', 'Viewer'],
      answer: 3,
      explanation: 'RLS applies to Viewers (and app/shared users), not to users who can edit the model.',
    },
    {
      question: 'A user is in roles "France" and "Bikes". What do they see?',
      options: ['Only French bikes', 'All French data plus all Bikes data', 'Nothing', 'An error'],
      answer: 1,
      explanation: 'Roles are additive; the user sees the union of rows allowed by each role.',
    },
    {
      question: 'Which function checks if an ID exists in a parent-child path string?',
      options: ['PATHITEM', 'PATHLENGTH', 'PATHCONTAINS', 'CONTAINSSTRING'],
      answer: 2,
      explanation: 'PATHCONTAINS(path, item) returns TRUE if the item is in the path.',
    },
    {
      question: 'Where are users assigned to RLS roles?',
      options: ['Power Query', 'Desktop Manage roles', 'Power BI Service semantic model Security page', 'Report Filters pane'],
      answer: 2,
      explanation: 'Roles are defined in Desktop but membership is managed in the Service.',
    },
    {
      question: 'Which tool is typically used to configure object-level security?',
      options: ['Tabular Editor', 'Performance Analyzer', 'Power Query editor', 'Report Builder'],
      answer: 0,
      explanation: 'OLS is set via external tools like Tabular Editor (or TMSL/XMLA), not through the Desktop UI.',
    },
  ],
};
