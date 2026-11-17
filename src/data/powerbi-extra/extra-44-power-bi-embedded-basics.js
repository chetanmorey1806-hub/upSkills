export default {
  id: 'extra-44-power-bi-embedded-basics',
  title: 'Power BI Embedded Basics',
  module: 'Extra: Advanced & Administration',
  extraNo: 44,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Power BI Embedded means showing Power BI reports, dashboards and visuals inside another application, such as an internal portal or a product sold to customers. You will learn the no-code embedding options, the two developer scenarios (embed for your organization and embed for your customers), embed tokens, service principals and which capacity to buy.',
  objectives: [
    'List the no-code ways to embed: Teams, SharePoint Online, secure Embed link, and why Publish to web is different',
    'Explain "embed for your organization" (user owns data) vs "embed for your customers" (app owns data)',
    'Describe the main building blocks: Microsoft Entra app, service principal, embed token, Power BI JavaScript client',
    'Choose the right capacity (Fabric F SKU or Azure A SKU) and know when users need licences',
    'Apply RLS with effective identities in an app-owns-data solution',
  ],
  theory: [
    {
      heading: 'What embedding means',
      content:
        "Users often do not want to open app.powerbi.com. They live in Microsoft Teams, a company intranet or a software product. **Embedding** places the interactive Power BI report inside that application, keeping slicers, drill and tooltips.\n\nAnalogy: instead of asking customers to go to a separate TV channel, you put the screen inside your own shop window.\n\nThere are two families:\n- **No-code embedding** for internal users: Teams tab, SharePoint Online web part, **Embed report in website or portal** (secure link), Power Apps, PowerPoint add-in.\n- **Developer embedding** with the Power BI REST APIs and JavaScript SDK: full control of look, size and interactions inside your own web app.",
    },
    {
      heading: 'No-code options and Publish to web warning',
      content:
        "- **Microsoft Teams**: Add a tab > Power BI > choose a report. Users sign in with their own account and need access and a licence.\n- **SharePoint Online**: edit a page > add the **Power BI** web part > paste the report link. Same security as the Service.\n- **Secure embed**: in a report, **File > Embed report > Website or portal** gives an iframe link. Viewers must sign in and have permission; RLS applies.\n- **Publish to web** (File > Embed report > Publish to web (public)): creates a **public** link that **anyone on the internet** can open with no sign-in. There is **no security** and RLS is not supported. Use it only for truly public data (for example open government statistics). Admins usually disable it or restrict it to specific groups in the tenant settings.",
      tip: 'Interview trap: Publish to web is NOT Power BI Embedded. It is a public, unsecured sharing option.',
    },
    {
      heading: 'Embed for your organization vs embed for your customers',
      content:
        "**Embed for your organization** (also called **user owns data**):\n- Users of the app are in your Microsoft Entra ID tenant and sign in with their own accounts.\n- The app gets an **Entra access token** for the user; Power BI checks that user's permissions, licence and RLS.\n- Typical for internal portals (SharePoint, custom intranet).\n- Each viewer needs Pro or PPU, unless the content is on an F64+ (or P) capacity.\n\n**Embed for your customers** (also called **app owns data**, the classic **Power BI Embedded** scenario):\n- End users are customers who have **no Power BI accounts** and no licences.\n- Your backend authenticates to Power BI as a **service principal** (or a master user account), then requests an **embed token** for the specific report and passes it to the browser.\n- Your app handles login; Power BI only sees the service principal.\n- Content **must** be in a workspace on capacity (Fabric F SKU, Azure A SKU, or Premium P/EM for older contracts).",
    },
    {
      heading: 'Building blocks of an app-owns-data solution',
      content:
        "1. **Microsoft Entra app registration**: gives the app an identity (client ID, tenant ID, client secret or certificate).\n2. **Tenant setting**: Admin portal > Developer settings > **Service principals can use Fabric APIs** (formerly \"Allow service principals to use Power BI APIs\") enabled for a security group containing the app.\n3. **Workspace access**: add the service principal to the workspace as **Member** or **Admin** (or Contributor for read scenarios).\n4. **Capacity**: assign the workspace to a Fabric F SKU or Azure A SKU capacity.\n5. **Backend code**: call the Power BI REST API (`GenerateToken`) to get an **embed token** for report + semantic model, optionally with an **effective identity** for RLS.\n6. **Frontend**: use the **Power BI JavaScript client** (`powerbi-client` npm package, React wrapper `powerbi-client-react`) with the embed URL, report ID and token.\n\nThe **Power BI Embedded Analytics Playground** (playground.powerbi.com) and the **Embed setup tool** generate sample apps to learn from.",
    },
    {
      heading: 'Capacity and licensing choices',
      content:
        "- **Azure A SKUs** (A1 to A8): bought in the Azure portal as a Power BI Embedded resource; billed hourly and can be **paused** when not in use. Only for app-owns-data embedding (not for sharing in the Power BI service with Free users).\n- **Fabric F SKUs** (F2 to F2048): bought in Azure; support embedding for customers **and** all Fabric workloads; also pausable and scalable. F64 and above also allow Free internal users to view content in the Power BI service.\n- **Premium P SKUs** and **EM SKUs**: legacy. Microsoft stopped selling them to new customers and is moving customers to F SKUs.\n\nFor learning and development, you can test embedding with a **Pro/PPU** account and the embed token before buying capacity; production embed tokens require capacity.",
      tip: 'Size the capacity by load testing: concurrent users, report complexity and refresh schedule all consume capacity units (CU). Use the Fabric Capacity Metrics app to monitor.',
    },
    {
      heading: 'Security with RLS in embedded apps',
      content:
        "In app owns data, Power BI does not know who the real customer is, so your backend passes an **effective identity** when generating the embed token: a username (any string, such as the customer ID) and the RLS **role(s)** to apply.\n\nIn the model, the role uses `USERNAME()` or `USERPRINCIPALNAME()`, which return the username from the effective identity. This is how one report serves thousands of customers, each seeing only their own rows.\n\nAlso consider: token expiry (refresh tokens before they expire, typically within an hour), never exposing the client secret to the browser, and using **Key Vault** for secrets.",
    },
  ],
  examples: [
    {
      title: 'Embed a report in SharePoint Online (no code)',
      scenario: 'The Sales team intranet page should show the City Dashboard report built on the practice model.',
      steps: [
        'Open the report in the Power BI service > File > Embed report > SharePoint Online > copy the link',
        'Open the SharePoint page > Edit > + (add web part) > Power BI',
        'Paste the link in the Power BI report link box; choose the page and display options',
        'Republish the SharePoint page',
        'Make sure page visitors have access to the report (workspace role, app or direct share) and a suitable licence',
      ],
      result: 'The report appears on the intranet page; each user sees data according to their own permissions and RLS.',
      explanation: 'This is user-owns-data embedding without code: SharePoint shows the report but Power BI still authenticates each user.',
    },
    {
      title: 'Customer portal with RLS (app owns data)',
      scenario: 'A distributor portal shows each dealer only their own city. Dealers have no Power BI accounts. Create an RLS role on Customer[City] that reads the username from the embed token. The DealerCity mapping is handled by the portal, which passes the city as the username.',
      table: {
        headers: ['Portal user', 'Effective identity username', 'Role', 'Rows visible'],
        rows: [
          ['dealer-pune@portal', 'Pune', 'DealerCity', 'Only Pune sales'],
          ['dealer-nashik@portal', 'Nashik', 'DealerCity', 'Only Nashik sales'],
        ],
      },
      steps: [
        'Power BI Desktop > Modeling > Manage roles > New > name DealerCity > table Customer > switch to DAX editor and enter the filter below > Save',
        'Publish to a workspace assigned to an F SKU or A SKU capacity',
        'In Azure: register an Entra app, create a client secret, add the app to a security group allowed to use Fabric APIs, and add the service principal to the workspace as Member',
        'Backend: call the GenerateToken REST API for the report with identities: username = the dealer city, roles = ["DealerCity"], datasets = [semantic model ID]',
        'Frontend: embed with powerbi-client using the embedUrl, report ID and the returned token (tokenType Embed)',
      ],
      code: `-- RLS role DealerCity, filter on Customer table
[City] = USERNAME ()`,
      result: 'A dealer logged in as dealer-pune@portal sees the report filtered to Pune only; Nashik dealers see Nashik only.',
      explanation: 'The effective identity username flows into USERNAME() in the model, so one report securely serves all dealers.',
    },
    {
      title: 'Front-end embed code (JavaScript)',
      scenario: 'Your backend already returns embedUrl, reportId and embedToken as JSON. Show the report in a div.',
      steps: [
        'Install the client: npm install powerbi-client',
        'Add <div id="reportContainer" style="height:600px"></div> to the page',
        'Fetch the embed info from your backend endpoint /api/embed-info',
        'Call powerbi.embed with the configuration below',
        'Handle token expiry by calling report.setAccessToken(newToken) before expiration',
      ],
      code: `import * as pbi from 'powerbi-client';

const powerbi = new pbi.service.Service(
  pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory
);

const info = await fetch('/api/embed-info').then(r => r.json());

const report = powerbi.embed(document.getElementById('reportContainer'), {
  type: 'report',
  id: info.reportId,
  embedUrl: info.embedUrl,
  accessToken: info.embedToken,
  tokenType: pbi.models.TokenType.Embed,
  settings: { panes: { filters: { visible: false } } }
});`,
      result: 'The interactive report renders inside the web page with the filter pane hidden.',
      explanation: 'TokenType.Embed is used for app owns data; for user owns data you would pass an Entra access token with TokenType.Aad.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Power BI Embedded and Publish to web?',
      a: 'Power BI Embedded uses secure authentication (user tokens or embed tokens) and supports RLS. Publish to web creates a public URL anyone can view without sign-in, has no security and does not support RLS.',
      level: 'Easy',
    },
    {
      q: 'Explain user owns data vs app owns data.',
      a: 'User owns data (embed for your organization): users sign in with their own Entra accounts and need Power BI access and licences. App owns data (embed for your customers): the app authenticates with a service principal, generates embed tokens, and end users need no Power BI licence; content must be on capacity.',
      level: 'Medium',
    },
    {
      q: 'Which capacities support embedding for customers?',
      a: 'Fabric F SKUs and Azure Power BI Embedded A SKUs (plus legacy Premium P and EM SKUs for existing contracts). New customers buy F or A SKUs in Azure.',
      level: 'Medium',
    },
    {
      q: 'What is an embed token?',
      a: 'A short-lived token generated by the Power BI REST API (GenerateToken) that grants access to specific reports, semantic models or dashboards, optionally with effective identities for RLS. The browser uses it to display content.',
      level: 'Medium',
    },
    {
      q: 'How do you apply RLS in an app-owns-data solution?',
      a: 'Define roles in the model using USERNAME() or USERPRINCIPALNAME(), and pass an effective identity (username and roles) when generating the embed token. The model filters rows for that identity.',
      level: 'Hard',
    },
    {
      q: 'Why use a service principal instead of a master user account?',
      a: 'A service principal is not a person: no password expiry, no MFA prompts, no licence, and it can be scoped through security groups and certificates. It is Microsoft\'s recommended identity for production embedding.',
      level: 'Hard',
    },
    {
      q: 'Scenario: a startup wants to show reports to 2,000 external customers at night only. Which capacity and why?',
      a: 'An Azure A SKU or a Fabric F SKU sized by load test, with automation to pause/scale outside busy hours to save cost. Customers need no Power BI licences in app owns data.',
      level: 'Hard',
    },
    {
      q: 'Scenario: you embedded a report in SharePoint but colleagues see "You do not have access". Why?',
      a: 'SharePoint embedding is user owns data: each colleague needs permission to the report (workspace role, app or share) and a Pro/PPU licence unless the workspace is on F64+ capacity.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Open the Power BI Embedded Analytics Playground and explore the sample report APIs.',
      hint: 'playground.powerbi.com > Developer sandbox.',
      solution: 'You can run code snippets such as hiding the filter pane, applying filters and switching pages, and see the effect on the embedded sample report.',
    },
    {
      task: 'Embed one of your reports in a SharePoint or Teams page and test with a colleague who has Viewer access.',
      hint: 'File > Embed report > SharePoint Online, or Teams > + > Power BI.',
      solution: 'The colleague sees the report inside SharePoint/Teams; a user without access sees an access request message.',
    },
    {
      task: 'Create an RLS role using USERNAME() on Customer[City] and test it in Desktop with View as > Other user = Pune.',
      hint: 'Modeling > View as > tick the role and Other user.',
      solution: 'All visuals show only Pune data, simulating what an embed token with username Pune would show.',
    },
    {
      task: 'Write a short recommendation: when would you use Publish to web, secure embed, and app owns data?',
      hint: 'Think about audience and security.',
      solution: 'Publish to web: public open data only. Secure embed/SharePoint/Teams: internal users with Power BI access. App owns data: external customers without Power BI accounts, on F or A SKU capacity.',
    },
  ],
  quiz: [
    {
      question: 'Which option shares a report publicly with no sign-in?',
      options: ['Embed for your customers', 'Publish to web', 'SharePoint web part', 'Teams tab'],
      answer: 1,
      explanation: 'Publish to web is public and unsecured.',
    },
    {
      question: 'In app owns data, who authenticates to Power BI?',
      options: ['Each end customer', 'The application, usually via a service principal', 'Nobody', 'The gateway'],
      answer: 1,
      explanation: 'The app authenticates and generates embed tokens for users.',
    },
    {
      question: 'Which Azure SKU family is dedicated to Power BI Embedded?',
      options: ['A SKUs', 'B SKUs', 'D SKUs', 'S SKUs'],
      answer: 0,
      explanation: 'A1-A8 are Power BI Embedded SKUs; Fabric F SKUs also support embedding.',
    },
    {
      question: 'Which DAX function returns the effective identity username in an embedded RLS role?',
      options: ['SELECTEDVALUE', 'USERNAME', 'RELATED', 'LOOKUPVALUE'],
      answer: 1,
      explanation: 'USERNAME() (or USERPRINCIPALNAME()) returns the identity passed in the embed token.',
    },
    {
      question: 'Which token type is used in the JavaScript config for app owns data?',
      options: ['TokenType.Aad', 'TokenType.Embed', 'TokenType.Bearer', 'TokenType.Public'],
      answer: 1,
      explanation: 'Embed tokens use TokenType.Embed; user owns data uses TokenType.Aad.',
    },
  ],
};
