export default {
  id: 'day-40-refresh-gateway-credentials',
  title: 'Scheduled Refresh, Gateway, Data Source Credentials',
  module: 'Module 7: Power BI Service & Deployment',
  day: 40,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Imported data in the Service is a snapshot. To keep it fresh you configure data source credentials, an on-premises data gateway for sources inside your network, and a scheduled refresh within the limits of your licence.',
  objectives: [
    'Explain when a semantic model needs refresh and when it needs a gateway',
    'Compare standard gateway, personal mode gateway and VNet data gateway',
    'Install and register an on-premises data gateway and create a connection in Manage connections and gateways',
    'Set data source credentials, privacy levels and scheduled refresh within Pro/PPU/capacity limits',
    'Troubleshoot refresh failures using refresh history',
  ],
  theory: [
    {
      heading: 'Why refresh is needed',
      content:
        "In **Import** mode, Power BI stores a copy of the data inside the semantic model. When the source changes (new orders in SQL Server, new rows in Excel), the report does not change until the model is **refreshed**.\n\nAnalogy: Import is a printed newspaper; it is fast to read but you need a new edition every morning. **DirectQuery** is a live TV channel: it queries the source each time, so data refresh is not needed (only visual/tile cache updates), but every click depends on source speed.\n\nRefresh types in the Service:\n\n- **Scheduled refresh**: runs automatically at times you set.\n- **On-demand refresh**: Refresh now button on the semantic model.\n- **Incremental refresh**: only refreshes recent partitions (e.g. last 3 days) of large tables; available with Pro as well as Premium/PPU/Fabric.\n- **API / pipeline refresh**: triggered from Power Automate, Data Factory or the REST API.",
    },
    {
      heading: 'Refresh limits by licence',
      content:
        "- **Pro (shared capacity)**: up to **8 scheduled refreshes per day**; each refresh must finish within **2 hours**; model size up to **1 GB** (compressed).\n- **Premium Per User (PPU)** and **Fabric / Premium capacity**: up to **48 scheduled refreshes per day** through the UI (every 30 minutes); refresh timeout **5 hours**; much larger models (PPU up to 100 GB; capacity depends on the SKU).\n\nOther rules:\n\n- Time slots are in 30-minute steps and in the time zone you choose.\n- Scheduled refresh is **paused automatically after 4 consecutive failures**.\n- Scheduled refresh is **turned off if nobody has visited** a report or dashboard built on the model for two months.\n- A refresh may start a few minutes after the scheduled time if the service is busy.",
      tip: 'Do not schedule more refreshes than the source data actually changes. If the ERP loads data nightly at 2 AM, one refresh at 3 AM is enough.',
    },
    {
      heading: 'Do I need a gateway?',
      content:
        "The Power BI Service runs in Microsoft's cloud. It can reach **cloud** sources directly: Azure SQL Database, SharePoint Online, OneDrive for work or school, Dataverse, Salesforce, Fabric lakehouses/warehouses, public web APIs.\n\nIt **cannot** reach sources inside your company network or PC: on-premises SQL Server, MySQL on a local server, a file on `C:\\Data\\` or a network share `\\\\fileserver\\finance`. For these you need a **gateway**, a bridge program installed on a computer that can see both the source and the internet. The gateway makes only outbound connections (to Azure Relay), so no inbound firewall ports are opened.\n\nTip: store Excel/CSV files in **OneDrive or SharePoint Online** and connect to them by URL; then no gateway is needed.",
    },
    {
      heading: 'Gateway modes',
      content:
        "1. **On-premises data gateway (standard mode)**: for organisations. Installed on an always-on server, shared by many users and many data sources. Supports scheduled refresh, DirectQuery and live connections, Power Apps, Power Automate, Logic Apps and Fabric. Admins manage connections and who can use them. Can be clustered (several machines) for high availability.\n2. **On-premises data gateway (personal mode)**: for one person only. Supports **Import / scheduled refresh only** (no DirectQuery or live connection), cannot be shared, only for Power BI. Fine for learning, not for production.\n3. **Virtual network (VNet) data gateway**: managed by Microsoft, no machine to install; connects to data sources inside an Azure virtual network. Requires a Premium/Fabric capacity.\n\nInstall the gateway on a server, not a laptop: if the machine is asleep, refresh fails. Keep it updated (monthly releases).",
      points: [
        'Standard mode: many users, many sources, Import + DirectQuery.',
        'Personal mode: one user, Import only.',
        'VNet gateway: Azure VNet sources, no install, needs capacity.',
      ],
    },
    {
      heading: 'Connections and data source credentials',
      content:
        "Power BI must know **how to sign in** to each source.\n\n**Cloud sources**: semantic model > **Settings** > **Data source credentials** > Edit credentials. Choose authentication: Anonymous, Basic (username/password), Windows, **OAuth2** (Microsoft Entra ID, used for SharePoint Online, Azure SQL), Key (API key), and a **privacy level**.\n\n**Gateway sources**: an admin creates a **connection** on the gateway: gear icon > **Manage connections and gateways** > **+ New** > On-premises > gateway cluster > connection name > type (SQL Server, File, MySQL...) > server/path > authentication > privacy level > Create. Then add users to the connection (Manage users) so they can bind models to it. In the semantic model settings, under **Gateway and cloud connections**, map each data source to the connection and Apply.\n\n**Privacy levels**: Private (most restrictive, e.g. HR data), Organizational (internal), Public (open data), None. They control whether Power Query can combine data from different sources.\n\nThe server and database names in Desktop must match the gateway connection exactly (e.g. `SQLPROD01` vs `sqlprod01.contoso.local` are different).",
    },
    {
      heading: 'Troubleshooting refresh',
      content:
        "Check **semantic model > Refresh history** (or Settings > Refresh history) for the error message.\n\n1. **Credentials expired**: OAuth tokens or passwords changed; edit credentials.\n2. **Gateway offline**: the machine is off or the service stopped; check status in Manage connections and gateways.\n3. **Data source not found in gateway**: server/database name in the .pbix differs from the connection; fix the name or create a matching connection.\n4. **Timeout**: refresh longer than 2 h (Pro) or 5 h (capacity): reduce data, use incremental refresh, check query folding.\n5. **Column not found / schema change**: the source table changed; update the Power Query steps in Desktop and republish.\n\nEnable **Send refresh failure notifications to the semantic model owner** and add extra contacts in Scheduled refresh settings.",
    },
  ],
  examples: [
    {
      title: 'Schedule refresh for a OneDrive-based Excel source (no gateway)',
      scenario: 'The practice Sales workbook is stored in OneDrive for work. Refresh it twice daily.',
      table: {
        headers: ['Setting', 'Value'],
        rows: [
          ['Data source credentials', 'OAuth2, Organizational'],
          ['Refresh frequency', 'Daily'],
          ['Time zone', '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi'],
          ['Times', '08:00 AM, 02:00 PM'],
          ['Failure notifications', 'Owner + bi-team@contoso.com'],
        ],
      },
      steps: [
        'In Desktop, Get data > Web, paste the OneDrive/SharePoint file URL (without ?web=1), sign in with Organizational account, load the Sales sheet, then publish',
        'Service: workspace > hover the semantic model > More options (...) > Settings',
        'Expand Data source credentials > Edit credentials > OAuth2 > Privacy level Organizational > Sign in',
        'Expand Refresh > turn on Configure a refresh schedule',
        'Choose Daily, time zone, Add another time twice: 08:00 and 14:00',
        'Tick Send refresh failure notifications to the semantic model owner; add the team email > Apply',
      ],
      result: 'The model refreshes at 8 AM and 2 PM IST. No gateway is listed because the source is in the cloud.',
      explanation: 'OneDrive/SharePoint Online are cloud sources reachable by the Service with OAuth2.',
    },
    {
      title: 'Install a standard gateway and create a SQL Server connection',
      scenario: 'Sales data is in an on-premises SQL Server SQLPROD01, database SalesDB.',
      table: {
        headers: ['Connection field', 'Value'],
        rows: [
          ['Gateway cluster', 'HQ-Gateway'],
          ['Connection name', 'SQLPROD01 - SalesDB'],
          ['Connection type', 'SQL Server'],
          ['Server / Database', 'SQLPROD01 / SalesDB'],
          ['Authentication', 'Windows (service account svc_pbi)'],
          ['Privacy level', 'Organizational'],
        ],
      },
      steps: [
        'Download the on-premises data gateway installer from Microsoft on an always-on server that can reach SQLPROD01',
        'Run the installer > choose On-premises data gateway (recommended), not personal mode > Install',
        'Sign in with your work account > Register a new gateway on this computer > name HQ-Gateway > enter and save the recovery key > Configure',
        'Power BI Service: gear icon > Manage connections and gateways > On-premises data gateways tab: confirm HQ-Gateway is Online',
        'Connections tab > + New > On-premises > select HQ-Gateway > fill the fields from the table > Create',
        'Open the new connection > Manage users > add the BI developers group',
      ],
      result: 'The connection appears with status Online and can be used by any semantic model that connects to SQLPROD01/SalesDB.',
      explanation: 'The gateway is the bridge; the connection stores the server, database and credentials centrally so developers do not need the SQL password.',
    },
    {
      title: 'Bind the semantic model to the gateway and schedule refresh',
      scenario: 'The Sales semantic model published from Desktop uses SQLPROD01/SalesDB.',
      table: {
        headers: ['Licence', 'Max daily scheduled refreshes', 'Timeout'],
        rows: [
          ['Pro', '8', '2 hours'],
          ['PPU / Fabric capacity', '48', '5 hours'],
        ],
      },
      steps: [
        'Workspace > semantic model > Settings',
        'Expand Gateway and cloud connections; turn on Use an On-premises or VNet data gateway',
        'Select HQ-Gateway; next to the data source choose Maps to: SQLPROD01 - SalesDB > Apply',
        'Expand Refresh > Configure a refresh schedule: Daily at 06:00 > Apply',
        'Click Refresh now on the semantic model to test, then open Refresh history',
      ],
      result: 'Refresh history shows Completed. The schedule runs daily at 6 AM through the gateway.',
      explanation: 'The Service sends the refresh request to the gateway, which runs the Power Query queries against SQL Server and sends the data back over an encrypted outbound channel.',
    },
    {
      title: 'Read refresh history and fix a failure',
      scenario: 'The 6 AM refresh failed for three days.',
      table: {
        headers: ['Error message (example)', 'Cause', 'Fix'],
        rows: [
          ['The credentials provided for the SQL source are invalid', 'Service account password changed', 'Update credentials in the gateway connection'],
          ['Unable to connect to the gateway', 'Gateway server switched off', 'Start the server/service; use a cluster for HA'],
          ['Data source not found on gateway', 'Desktop used localhost instead of SQLPROD01', 'Change source in Desktop to SQLPROD01 and republish'],
        ],
      },
      steps: [
        'Workspace > semantic model > More options (...) > Refresh history',
        'Open the Failed entry > Show details to read the error',
        'Apply the fix from the table',
        'Click Refresh now; confirm Completed',
        'If the schedule was paused after repeated failures, re-enable it in Settings > Refresh',
      ],
      result: 'Refresh succeeds and the schedule is active again.',
      explanation: 'After 4 consecutive failures Power BI pauses the schedule, so fix quickly and re-enable.',
    },
    {
      title: 'Local file source: gateway vs moving to OneDrive',
      scenario: 'A student report reads C:\\Users\\Asha\\Desktop\\Sales.xlsx and refresh fails in the Service.',
      table: {
        headers: ['Option', 'Gateway needed', 'Works when laptop is off?'],
        rows: [
          ['Keep file on C: drive', 'Yes (personal or standard)', 'No'],
          ['Move file to OneDrive/SharePoint and connect by URL', 'No', 'Yes'],
        ],
      },
      steps: [
        'Upload Sales.xlsx to OneDrive for work or a SharePoint document library',
        'Open the file > Copy link / Details > copy the path, remove ?web=1 from the end',
        'Desktop: Home > Transform data > Data source settings > Change Source, or Get data > Web and paste the URL; choose Organizational account sign-in',
        'Publish and set credentials to OAuth2 in the Service',
      ],
      code: `let
    Source = Excel.Workbook(
        Web.Contents("https://contoso-my.sharepoint.com/personal/asha_contoso_com/Documents/Sales.xlsx"),
        null, true),
    Sales_Sheet = Source{[Item = "Sales", Kind = "Sheet"]}[Data],
    Promoted = Table.PromoteHeaders(Sales_Sheet, [PromoteAllScalars = true])
in
    Promoted`,
      result: 'Refresh works without any gateway and without the laptop being on.',
      explanation: 'Files in OneDrive/SharePoint Online are cloud sources the Service can read directly.',
    },
  ],
  interview: [
    {
      q: 'How many scheduled refreshes per day are allowed with Pro and with Premium/Fabric capacity?',
      a: 'Pro (shared capacity): 8 per day. PPU and Premium/Fabric capacity: 48 per day via the schedule UI (more via API/XMLA on capacity).',
      level: 'Easy',
    },
    {
      q: 'When do you need an on-premises data gateway?',
      a: 'When the Service must reach a source inside a private network: on-premises databases, local or network-share files. Cloud sources like Azure SQL, SharePoint Online and OneDrive do not need one (Azure VNet sources use a VNet gateway).',
      level: 'Easy',
    },
    {
      q: 'Standard gateway vs personal mode?',
      a: 'Standard: multi-user, many sources, Import + DirectQuery + live connections, centrally managed connections, clustering, used by other Power Platform/Fabric services. Personal: single user, Import/scheduled refresh only, Power BI only, cannot be shared.',
      level: 'Medium',
    },
    {
      q: 'What are privacy levels used for?',
      a: 'They tell Power Query how data may be combined across sources (Private, Organizational, Public, None) to prevent sensitive data being sent to another source during query folding or merges.',
      level: 'Medium',
    },
    {
      q: 'Scenario: refresh fails with "data source not found on the gateway" although the connection exists. Why?',
      a: 'The server/database names in the .pbix must match the gateway connection exactly. The report may use localhost, an IP, or a different alias. Change the source in Desktop (Data source settings > Change source) to the same name, or create a connection with the matching name.',
      level: 'Hard',
    },
    {
      q: 'What is the refresh timeout in Pro vs capacity?',
      a: '2 hours for shared capacity (Pro) and 5 hours for Premium/PPU/Fabric capacity.',
      level: 'Medium',
    },
    {
      q: 'Why might a scheduled refresh stop running even though nobody turned it off?',
      a: 'It is paused after 4 consecutive failures, or disabled after two months without any user visiting reports/dashboards on that semantic model.',
      level: 'Medium',
    },
    {
      q: 'Does a DirectQuery model need scheduled refresh?',
      a: 'No data refresh is needed because queries go to the source live; it still needs a gateway for on-premises sources, and you can configure dashboard tile cache refresh frequency.',
      level: 'Medium',
    },
    {
      q: 'Does the gateway require opening inbound firewall ports?',
      a: 'No. It makes outbound connections to Azure Relay/Service Bus (HTTPS 443 by default), so inbound ports are not required.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Publish a report whose source is a CSV on your Desktop and observe the refresh error in the Service.',
      hint: 'Try Refresh now and then open Refresh history.',
      solution: 'The Service shows that a gateway is required/the data source is not reachable. Fix by installing a gateway or moving the CSV to OneDrive and connecting by URL.',
    },
    {
      task: 'Configure a refresh schedule at 7 AM and 7 PM in your local time zone with failure emails.',
      hint: 'Semantic model > Settings > Refresh.',
      solution: 'Turn on schedule > Daily > select time zone > add 07:00 and 19:00 > tick failure notification > add contact > Apply.',
    },
    {
      task: 'Choose the gateway type for: (a) a student testing at home, (b) a company with SQL Server used by 20 developers, (c) a database in an Azure VNet with Fabric capacity.',
      hint: 'Think users and sources.',
      solution: '(a) Personal mode. (b) Standard mode, ideally a cluster. (c) VNet data gateway.',
    },
    {
      task: 'Write a short checklist for a reliable production refresh.',
      hint: 'Infrastructure, credentials, schedule, monitoring.',
      solution: '1. Standard gateway on an always-on server, clustered. 2. Service account credentials in the connection. 3. Schedule after source load completes. 4. Failure notifications to a team mailbox. 5. Incremental refresh for big tables. 6. Keep the gateway updated.',
    },
  ],
  quiz: [
    {
      question: 'Maximum scheduled refreshes per day for a Pro workspace?',
      options: ['4', '8', '24', '48'],
      answer: 1,
      explanation: 'Shared capacity (Pro) allows 8 scheduled refreshes per day.',
    },
    {
      question: 'Which gateway mode supports DirectQuery?',
      options: ['Personal mode', 'Standard mode', 'Both', 'Neither'],
      answer: 1,
      explanation: 'Personal mode supports Import only.',
    },
    {
      question: 'Which source does NOT need a gateway?',
      options: ['On-premises SQL Server', 'Excel on C:\\ drive', 'SharePoint Online file', 'Network share file'],
      answer: 2,
      explanation: 'SharePoint Online is a cloud source.',
    },
    {
      question: 'Where do you create a gateway connection in the Service?',
      options: [
        'Workspace > Manage access',
        'Settings (gear) > Manage connections and gateways',
        'File > Options',
        'Report > Edit',
      ],
      answer: 1,
      explanation: 'Manage connections and gateways holds gateways and their connections.',
    },
    {
      question: 'Scheduled refresh is paused automatically after...',
      options: ['1 failure', '2 failures', '4 consecutive failures', '10 failures'],
      answer: 2,
      explanation: 'Power BI disables the schedule after four consecutive failures.',
    },
  ],
};
