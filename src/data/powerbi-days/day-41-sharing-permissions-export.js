export default {
  id: 'day-41-sharing-permissions-export',
  title: 'Sharing Reports, Permissions, Subscriptions, Export Reports',
  module: 'Module 7: Power BI Service & Deployment',
  day: 41,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn every way a published report reaches people: direct sharing with links, item and semantic model permissions (Read, Reshare, Build, Write), email subscriptions, and exporting to PDF, PowerPoint and Excel, plus the security and licensing rules behind each one.',
  objectives: [
    'Share a report with the right link type and permissions',
    'Explain Read, Reshare, Build and Write permissions on reports and semantic models',
    'Create standard and dynamic per-recipient email subscriptions',
    'Export reports to PDF/PowerPoint and visual data to Excel/CSV within row limits',
    'Choose between sharing, workspace roles and apps for a business scenario',
  ],
  theory: [
    {
      heading: 'Sharing a report',
      content:
        "Open the report in the Service and click **Share** (or More options > Share in the workspace list). The **Send link** dialog opens.\n\nLink settings (click the link type text to change):\n\n- **People in your organization**: anyone in your tenant with the link.\n- **People with existing access**: only those who already have access (useful to send a reminder link).\n- **Specific people**: only named users or groups, including external guests if allowed by admins.\n\nPermission checkboxes:\n\n- **Allow recipients to share this report** (Reshare).\n- **Allow recipients to build content with the data associated with this report** (Build permission on the semantic model).\n\nSend with **Outlook**, **Teams**, **Copy link**, or type names and click **Send**.\n\nLicensing: the person sharing needs **Pro or PPU**, and recipients need Pro (or PPU for PPU workspaces) **unless** the content is in a Fabric **F64+** (or legacy P) capacity, where Free users can view it.",
      tip: 'Sharing is for small, ad hoc audiences. For a department, use an app or Viewer access with groups; it is easier to manage.',
    },
    {
      heading: 'Permissions explained',
      content:
        "Two layers of permission matter:\n\n**Workspace roles** (Day 39): Admin, Member, Contributor, Viewer apply to everything in the workspace.\n\n**Item permissions** apply to one report or semantic model:\n\n- **Read**: open and interact with the report; see data (with RLS).\n- **Reshare**: share the item further.\n- **Build** (semantic model): create new reports on the model, use Analyze in Excel, export underlying data, connect from Desktop.\n- **Write** (semantic model): edit the model settings, refresh, manage; given to Admin/Member/Contributor through roles.\n\nTo review: report > More options (...) > **Manage permissions**. The **Direct access** tab lists people and their permissions; the **Links** tab lists sharing links you can delete. For a semantic model, More options > Manage permissions shows Build/Reshare and lets you remove access.",
      points: [
        'RLS still applies to users with Read or Build but not to users with Write.',
        'Removing someone from a group or deleting a link removes their access.',
        'External users (Microsoft Entra B2B guests) can be invited if the tenant setting allows.',
      ],
    },
    {
      heading: 'Subscriptions',
      content:
        "A **subscription** emails a snapshot of a report page or dashboard on a schedule.\n\nCreate: open the report > **Subscribe to report** (envelope icon) > **+ Create a subscription** > choose **Standard** or **Dynamic per recipient**.\n\n- **Standard**: same content for all recipients. Choose pages, frequency (Daily, Weekly, Monthly, Hourly, or After data refresh), time, attachment (none, PDF or PowerPoint of the full report), recipients.\n- **Dynamic per recipient**: one email per recipient with filters taken from a list of recipients in a semantic model (e.g. each city manager gets their city). Requires the report to be in a Premium/Fabric capacity (or PPU).\n\nRequirements: a Pro/PPU licence to subscribe (or content in F64+ capacity for free users subscribing themselves). You can subscribe others in your organisation if you own the content or have permission. Admins can disable email subscriptions in tenant settings. Always check how RLS affects what each recipient receives; use dynamic per-recipient subscriptions for personalised content.",
    },
    {
      heading: 'Exporting reports and data',
      content:
        "**Whole report** (in the Service, report > **Export**):\n\n- **PDF**: static pages, good for printing and archiving.\n- **PowerPoint**: embed **live data** (an interactive Power BI add-in slide) or export as **image**.\n- **Analyze in Excel**: creates an Excel workbook with a live connection to the semantic model (PivotTables); needs **Build** permission.\n- **Export to .pbix**: Download this file (only if allowed and you have edit rights).\n\n**Data from one visual**: hover a visual > More options (...) > **Export data**:\n\n- **Data with current layout**: Excel (.xlsx), up to **150,000 rows**.\n- **Summarized data**: .xlsx up to **150,000 rows** or **.csv** up to **30,000 rows**.\n- **Underlying data**: row-level data, .xlsx up to 150,000 rows; needs Build permission and must be allowed in report settings.\n\nReport authors control this in Desktop: **File > Options and settings > Options > Current file > Report settings > Export data**. Admins control it in tenant settings. Microsoft Purview **sensitivity labels** travel with exported files.",
    },
    {
      heading: 'Choosing the right distribution method',
      content:
        "- 2-3 colleagues need one report quickly: **Share** with Specific people.\n- A department needs a set of reports: **App** with audiences.\n- Team members co-develop: **Workspace roles** (Contributor/Member).\n- Managers want a daily email: **Subscription**.\n- Board pack or offline review: **Export to PDF/PowerPoint**.\n- Analysts want PivotTables on the model: **Build** permission + Analyze in Excel.\n- Embedded in Teams/SharePoint: Power BI tab or Power BI web part (respects permissions and RLS).",
    },
  ],
  examples: [
    {
      title: 'Share a report with specific people',
      scenario: 'Share the Sales Overview report with two regional managers, without allowing reshare or build.',
      table: {
        headers: ['Setting', 'Value'],
        rows: [
          ['Link type', 'Specific people'],
          ['Allow recipients to share', 'Off'],
          ['Allow recipients to build content', 'Off'],
          ['Recipients', 'asha.manager@contoso.com, ravi.manager@contoso.com'],
        ],
      },
      steps: [
        'Open Sales Overview in the Service > Share',
        'Click the link type text > choose Specific people',
        'Clear Allow recipients to share this report and Allow recipients to build content > Apply',
        'Enter the two emails, add a message > Send',
        'Verify: More options (...) > Manage permissions > Direct access shows both with Read',
      ],
      result: 'Both managers receive an email link and can view the report; RLS (if set) filters their data.',
      explanation: 'Read-only sharing is the safe default; Build and Reshare should be given deliberately.',
    },
    {
      title: 'Grant Build permission for Analyze in Excel',
      scenario: 'A finance analyst wants to build PivotTables on the Sales semantic model in Excel.',
      table: {
        headers: ['Permission', 'Allows'],
        rows: [
          ['Read', 'View reports'],
          ['Build', 'Analyze in Excel, new reports, underlying data export'],
        ],
      },
      steps: [
        'Workspace > semantic model > More options (...) > Manage permissions',
        'Click + Add user, enter the analyst email, tick Allow recipients to build content from the data associated with this semantic model > Grant access',
        'Analyst: open the report > Export > Analyze in Excel (or in Excel: Data > Get Data > From Power Platform > From Power BI)',
        'In Excel, drag Product[Category] to Rows and [Total Sales] to Values in the PivotTable',
      ],
      result: 'A PivotTable shows Electronics 1,50,000, Furniture 24,000, Accessories 12,500 on the sample slice, live-connected to the model.',
      explanation: 'Analyze in Excel queries the semantic model directly; measures and RLS come from the model, so numbers match the report.',
    },
    {
      title: 'Daily standard subscription with PDF attachment',
      scenario: 'The sales director wants the Overview page every weekday at 9 AM as a PDF.',
      table: {
        headers: ['Field', 'Value'],
        rows: [
          ['Type', 'Standard'],
          ['Report page', 'Overview'],
          ['Recipients', 'sales.director@contoso.com'],
          ['Frequency', 'Weekly: Mon-Fri, 09:00 (UTC+05:30)'],
          ['Attachment', 'PDF (full report)'],
        ],
      },
      steps: [
        'Open the report > Subscribe to report > + Create a subscription > Standard',
        'Name it, add the recipient, choose page Overview',
        'Schedule: Weekly, tick Monday to Friday, time 09:00, choose time zone',
        'Attach full report: PDF',
        'Save; click the Send now option to test',
      ],
      result: 'The director receives an email with a page image and a PDF every weekday morning.',
      explanation: 'Subscriptions deliver snapshots; choose After data refresh if the email must always follow a successful refresh.',
    },
    {
      title: 'Dynamic per-recipient subscription by city',
      scenario: 'Each city manager should receive the report filtered to their own city.',
      table: {
        headers: ['Email', 'City'],
        rows: [
          ['asha.manager@contoso.com', 'Pune'],
          ['ravi.manager@contoso.com', 'Mumbai'],
          ['neha.manager@contoso.com', 'Nagpur'],
        ],
      },
      steps: [
        'Make sure the workspace is on Fabric/Premium capacity or PPU',
        'Create (or reuse) a semantic model table with Email and City columns (extra table, e.g. ManagerList)',
        'Report > Subscribe to report > + Create a subscription > Dynamic per recipient',
        'Connect to the semantic model containing ManagerList; select Email as the recipient column',
        'Map the report filter Customer[City] to ManagerList[City]',
        'Set schedule and attachment > Save',
      ],
      result: 'Asha receives Pune data (1,24,000), Ravi Mumbai (12,500), Neha Nagpur (50,000).',
      explanation: 'The subscription reads the recipient list and applies each row value as a report filter for that recipient.',
    },
    {
      title: 'Export visual data within limits',
      scenario: 'A user exports the Sales by Category table visual.',
      table: {
        headers: ['Export option', 'Format', 'Row limit'],
        rows: [
          ['Data with current layout', '.xlsx', '150,000'],
          ['Summarized data', '.xlsx', '150,000'],
          ['Summarized data', '.csv', '30,000'],
          ['Underlying data', '.xlsx', '150,000 (needs Build)'],
        ],
      },
      steps: [
        'Hover over the table visual > More options (...) > Export data',
        'Choose Data with current layout > Export',
        'Open the downloaded file in Excel',
        'Author side: Desktop > File > Options and settings > Options > Current file > Report settings > Export data: choose what is allowed, then republish',
      ],
      result: 'An Excel file with Category and Total Sales, formatted as in the visual, with the applied filters listed.',
      explanation: 'Export respects filters and RLS; very large exports should use Analyze in Excel or paginated reports instead.',
    },
  ],
  interview: [
    {
      q: 'What licence is required to share a report?',
      a: 'The sharer needs Pro or PPU. Recipients need Pro (or PPU for content in a PPU workspace), unless the content is in an F64 or larger Fabric capacity (or legacy Premium P), where Free users can view.',
      level: 'Easy',
    },
    {
      q: 'What is Build permission?',
      a: 'A semantic model permission that lets a user create new content on the model: new reports in Desktop or the Service, Analyze in Excel, composite models, and export underlying data.',
      level: 'Medium',
    },
    {
      q: 'Sharing vs app: which is better for 200 users in Sales?',
      a: 'An app: curated navigation, audiences, a single link, controlled updates, managed with groups. Sharing item by item to 200 people is hard to audit and maintain.',
      level: 'Medium',
    },
    {
      q: 'What are the export row limits for a visual?',
      a: 'Excel (.xlsx) exports up to 150,000 rows (current layout, summarized or underlying); CSV summarized exports up to 30,000 rows.',
      level: 'Medium',
    },
    {
      q: 'What is a dynamic per-recipient subscription?',
      a: 'A subscription that sends each recipient a personalised version of the report by applying filter values from a recipient list stored in a semantic model. It requires Premium/Fabric capacity or PPU.',
      level: 'Hard',
    },
    {
      q: 'How do you stop users exporting underlying data from a report?',
      a: 'In Desktop, File > Options > Current file > Report settings > Export data: allow only summarized data or none; do not give Build permission; admins can also restrict export in tenant settings.',
      level: 'Medium',
    },
    {
      q: 'Scenario: a manager left the company. How do you make sure they lose access to shared reports?',
      a: 'Their Entra account is disabled by IT; additionally check Manage permissions (Direct access and Links), remove them from groups, workspace roles and app audiences. Using groups makes this a single change.',
      level: 'Hard',
    },
    {
      q: 'What export options exist for a whole report?',
      a: 'PDF, PowerPoint (live data add-in or image), Analyze in Excel, Download .pbix (if allowed), and Print. Subscriptions can also attach PDF/PowerPoint.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Share a report with a classmate using People in your organization, then delete that link.',
      hint: 'Manage permissions > Links tab.',
      solution: 'Share > link type People in your organization > Copy link. Then More options > Manage permissions > Links > select the link > Delete.',
    },
    {
      task: 'Create a subscription that sends after each data refresh.',
      hint: 'Frequency option.',
      solution: 'Subscribe to report > + Create a subscription > Standard > Frequency: After data refresh > Save. (It sends at most once per day.)',
    },
    {
      task: 'Export the report to PowerPoint with live data and test interactivity.',
      hint: 'Export > PowerPoint.',
      solution: 'Report > Export > PowerPoint > Embed live data > Export (or copy the link and use the Power BI add-in in PowerPoint). Open in PowerPoint and use slicers in the slide.',
    },
    {
      task: 'For each need choose a method: (a) CFO wants a Monday email, (b) analyst wants PivotTables, (c) 3 auditors need one-time PDF.',
      hint: 'Match need to feature.',
      solution: '(a) Subscription. (b) Build permission + Analyze in Excel. (c) Export to PDF.',
    },
  ],
  quiz: [
    {
      question: 'Which permission lets a user use Analyze in Excel?',
      options: ['Read', 'Reshare', 'Build', 'Viewer only'],
      answer: 2,
      explanation: 'Analyze in Excel creates new content on the model, which needs Build.',
    },
    {
      question: 'Max rows when exporting summarized data to CSV?',
      options: ['10,000', '30,000', '150,000', 'Unlimited'],
      answer: 1,
      explanation: 'CSV summarized export is limited to 30,000 rows.',
    },
    {
      question: 'Dynamic per-recipient subscriptions require...',
      options: ['Free licence', 'Premium/Fabric capacity or PPU', 'A gateway', 'Publish to web'],
      answer: 1,
      explanation: 'They are a premium feature.',
    },
    {
      question: 'Where can you see and delete sharing links for a report?',
      options: ['Refresh history', 'Manage permissions > Links', 'Workspace settings > License', 'Lineage view'],
      answer: 1,
      explanation: 'Manage permissions shows Direct access and Links.',
    },
    {
      question: 'Which option shares a report only with already authorised users?',
      options: ['People in your organization', 'People with existing access', 'Specific people', 'Publish to web'],
      answer: 1,
      explanation: 'It creates a link that works only for people who already have access.',
    },
  ],
};
