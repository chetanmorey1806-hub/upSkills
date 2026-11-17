export default {
  id: 'refresh-gateways',
  title: 'Data Refresh & Gateways (Scheduled, Incremental, DirectQuery)',
  level: 'Intermediate',
  day: 15,
  duration: '3 hours',
  summary:
    "Keep published reports up to date: understand refresh types, scheduled refresh limits, the on-premises data gateway (standard vs personal mode), credentials, incremental refresh with RangeStart/RangeEnd, DirectQuery behaviour and how to troubleshoot refresh failures - a daily responsibility of any Power BI developer.",
  objectives: [
    'Explain the types of refresh in Power BI and the daily limits for Pro, PPU and Premium/Fabric',
    'Decide when a gateway is needed and choose between standard and personal mode',
    'Configure data source credentials and gateway connections in the Service',
    'Implement incremental refresh with RangeStart and RangeEnd parameters',
    'Explain refresh behaviour for DirectQuery and Live connection',
    'Troubleshoot common refresh failures systematically',
  ],
  theory: [
    {
      heading: 'Types of refresh',
      content:
        "**Refresh** in Power BI can mean several things:\n\n- **Data refresh (semantic model refresh)** - re-runs Power Query and reloads data into an **Import** model. This is what scheduled refresh does.\n- **OneDrive/SharePoint refresh** - for .pbix files stored in OneDrive/SharePoint, the Service syncs file changes (about every hour).\n- **Query caches / visual refresh** - DirectQuery and Live connection visuals query the source when users interact; dashboard tiles based on DirectQuery have their cache refreshed periodically (every hour by default, configurable from every 15 minutes to weekly).\n- **Tile refresh** - dashboard tiles update after the semantic model refresh.\n\nRefresh can be **on demand** (Refresh now), **scheduled**, triggered via **REST API / Power Automate**, or orchestrated with **Fabric Data pipelines**.",
    },
    {
      heading: 'Scheduled refresh limits and settings',
      content:
        "In the Service: semantic model > **Settings** > **Refresh** (Scheduled refresh section). You set frequency (daily/weekly), time zone, time slots, and failure notification recipients.",
      points: [
        'Pro (shared capacity): up to 8 scheduled refreshes per day',
        'Premium Per User and Premium/Fabric capacity: up to 48 scheduled refreshes per day (every 30 minutes)',
        'Via the API/XMLA on Premium/Fabric capacity, refresh frequency is not limited by the 48 slots (only by capacity resources)',
        'Shared capacity refresh timeout: 2 hours per refresh; Premium/Fabric: 5 hours (longer with XMLA/enhanced refresh)',
        'Scheduled refresh is automatically disabled after 4 consecutive failures, and after 2 months of inactivity (no one viewed the content)',
        'Refreshes start within the time slot but may be delayed (up to ~1 hour) in shared capacity during busy times',
        'Model size limits: 1 GB per model on Pro; up to 100 GB on PPU; Premium/Fabric depends on the SKU with Large semantic model storage format',
      ],
      tip: "Interview answer to memorise: 'Pro gives 8 scheduled refreshes per day, Premium/PPU gives 48.'",
    },
    {
      heading: 'On-premises data gateway: when and why',
      content:
        "The Power BI Service runs in the cloud. To reach data sources that are **not accessible from the internet** - on-premises SQL Server, file shares, Oracle, SAP, or sources inside a private network/VNet - you need a **gateway**: a Windows service installed on a machine in your network that acts as a secure bridge. It makes **outbound** connections to Azure Service Bus, so no inbound firewall ports need to be opened.\n\nYou do **not** need a gateway for cloud sources accessible from the Service (Azure SQL Database with public endpoint, SharePoint Online, OneDrive, Salesforce, Dataverse, most SaaS connectors). Some cloud sources in a private VNet use a **Virtual network (VNet) data gateway** instead.\n\nThe gateway is used for scheduled refresh of Import models, DirectQuery and Live connection to on-prem Analysis Services, dataflows and paginated reports.",
      points: [
        'Install on an always-on machine (not a laptop) close to the data source, not on the database server itself if possible',
        'Set up a gateway cluster (multiple machines) for high availability and load balancing',
        'Keep the gateway updated (monthly releases) and monitor logs/performance counters',
        'Recovery key is required to restore/migrate a gateway - store it safely',
      ],
    },
    {
      heading: 'Standard mode vs personal mode',
      content:
        "The on-premises data gateway installs in one of two modes:",
      points: [
        'Standard mode (enterprise): shared by multiple users; supports scheduled refresh, DirectQuery and Live connection; supports Power BI, Power Apps, Power Automate, Logic Apps, Fabric; centrally managed with data source connections and user permissions; runs as a Windows service',
        'Personal mode: used by one person only; supports only scheduled refresh of Import models in Power BI; no DirectQuery/Live connection; cannot be shared; runs as an application under your account',
        'Personal mode is fine for individual analysts testing; standard mode is the choice for any production/team scenario',
      ],
      tip: "If asked 'Can a personal gateway support DirectQuery?' - No. DirectQuery requires the standard gateway.",
    },
    {
      heading: 'Configuring credentials and gateway connections',
      content:
        "After publishing a model that uses on-premises sources:\n\n1. A gateway admin creates a **connection** on the gateway (Settings > Manage connections and gateways > New): server, database, authentication method (Windows, Basic/database, OAuth), privacy level.\n2. In semantic model settings > **Gateway and cloud connections**, map each data source in the model to the matching gateway connection. The server and database names must match exactly what is used in Power Query.\n3. For cloud sources, enter credentials in **Data source credentials** (often OAuth2 for Microsoft sources).\n\nPrivacy levels (Private, Organizational, Public) control data combination between sources; mismatches can cause 'Formula.Firewall' errors. Consider using a service account rather than a personal account so refresh does not break when someone changes their password or leaves.",
      tip: "'Data source not found on gateway' usually means the server name in Power Query (e.g. localhost or SERVER01) differs from the gateway connection (e.g. SERVER01.contoso.local). Use the same fully-qualified name everywhere.",
    },
    {
      heading: 'Incremental refresh with RangeStart and RangeEnd',
      content:
        "For large fact tables (millions of rows, years of history), reloading everything daily is slow and expensive. **Incremental refresh** partitions the table by date and refreshes only recent partitions; older partitions are kept.\n\nSteps:\n1. In Power Query, create two parameters named exactly **RangeStart** and **RangeEnd**, type **Date/Time**, with any initial values (they are overwritten by the Service).\n2. Filter the date column: `OrderDate >= RangeStart` and `OrderDate < RangeEnd` (one boundary inclusive, the other exclusive, to avoid duplicates).\n3. Ensure the filter **query folds** (pushes down to the source as a WHERE clause) - otherwise each partition reads the full table.\n4. In Desktop, right-click the table > **Incremental refresh**: set 'Archive data starting X years before refresh date' and 'Incrementally refresh data starting X days/months before refresh date'. Options: **Detect data changes** (using a LastModified column), **Only refresh complete days**, and **Get the latest data in real time with DirectQuery** (hybrid table, Premium/Fabric).\n5. Publish. The first refresh in the Service creates partitions and loads all history; later refreshes process only the incremental window.\n\nIncremental refresh is available with Pro, PPU and Premium/Fabric (hybrid tables and XMLA partition management require Premium/PPU/Fabric).",
      syntax:
        '// Power Query (M) filter step\n= Table.SelectRows(\n    Source,\n    each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd\n  )',
      tip: "If the date column is an integer key (e.g. 20250131), convert RangeStart/RangeEnd to integer in a custom function inside the filter so folding still works.",
    },
    {
      heading: 'DirectQuery and Live connection refresh behaviour',
      content:
        "**DirectQuery** models do not import data, so there is no data refresh in the import sense: every visual interaction sends queries to the source in real time (via a gateway for on-prem sources). Considerations:\n\n- Report speed depends on the source; there is a limit of 1 million rows returned per intermediate query.\n- Dashboard tiles are updated through a **cache refresh** (every hour by default, configurable down to 15 minutes) and 'Automatic page refresh' can refresh report pages at intervals (minimum interval set by admin on capacity; e.g. 30 minutes on shared, down to seconds on Premium with change detection).\n- Power Query transformations are limited to those that fold to the source.\n\n**Live connection** (to a Power BI semantic model or Analysis Services) has no refresh in the report itself; data freshness depends on the source model.\n\n**Composite/Dual** storage modes mix Import and DirectQuery; import tables still need scheduled refresh.",
    },
    {
      heading: 'Troubleshooting refresh failures',
      content:
        "Follow a systematic approach. Open the semantic model > **Refresh history** to read the error message, then check:",
      points: [
        'Credentials expired or password changed -> re-enter in Data source credentials; use service accounts / OAuth refresh tokens',
        'Gateway offline -> check the gateway machine is on, service running, network ok; check gateway status in Manage connections and gateways',
        'Data source not mapped / name mismatch -> align server/database names between Power Query and gateway connection',
        'Timeout (2 h shared, 5 h Premium) -> reduce data (remove columns, filter rows), enable query folding, use incremental refresh, move heavy transforms to the source/dataflow',
        'Schema changes -> a renamed/removed source column breaks steps like Changed Type; update the query',
        'Data errors -> e.g. type conversion errors, duplicate keys on the one side of a relationship ("column contains duplicate values")',
        'Privacy level / Formula.Firewall errors -> set correct privacy levels or restructure queries',
        'Memory/capacity limits -> model too large for the SKU; optimise model, enable Large semantic model format',
        'Personal gateway or Desktop-only sources (e.g. local Excel file path on your laptop) -> move files to SharePoint/OneDrive or a network share accessible via the gateway',
      ],
      tip: "Test in Desktop first: if refresh fails in Desktop too, it is a data/query problem; if only in the Service, it is credentials, gateway or environment.",
    },
  ],
  examples: [
    {
      title: 'Configure scheduled refresh for a SQL Server model via gateway',
      scenario: 'Your Sales model imports from an on-premises SQL Server (SQLPROD01, database SalesDW) and must refresh at 6 AM and 1 PM daily.',
      code:
        '1. Gateway admin: Settings (gear) > Manage connections and gateways > Connections > New:\n   Type: On-premises, Gateway cluster: GW-Prod, Connection name: SalesDW-Prod,\n   Connection type: SQL Server, Server: SQLPROD01, Database: SalesDW,\n   Authentication: Windows (service account svc_pbi), Privacy level: Organizational.\n2. Add the BI developers as users of the connection.\n3. Semantic model "Sales" > Settings > Gateway and cloud connections > toggle on gateway GW-Prod > map source to SalesDW-Prod > Apply.\n4. Refresh > Configure a refresh schedule: On, Daily, Time zone (UTC+05:30), add 06:00 and 13:00.\n5. Failure notifications: send to owner + "BI-Support" mail group.\n6. Click Refresh now to test; check Refresh history.',
      explanation:
        'The connection on the gateway holds the credentials; the semantic model just maps to it. Using a service account prevents failures when individual passwords change. Two time slots are well within the Pro limit of 8.',
    },
    {
      title: 'Incremental refresh on a 50-million-row Sales table',
      scenario: 'Sales has 5 years of history. Keep 5 years, refresh only the last 10 days daily, and detect late changes using a LastModified column.',
      code:
        '// 1. Power Query: Manage Parameters > New\n//    RangeStart  Type: Date/Time  Current value: 1/1/2025 00:00\n//    RangeEnd    Type: Date/Time  Current value: 2/1/2025 00:00\n\n// 2. Filter step on Sales (must fold)\nFiltered = Table.SelectRows(\n    dbo_Sales,\n    each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd\n)\n\n// 3. Desktop: right-click Sales > Incremental refresh\n//    Archive data starting 5 Years before refresh date\n//    Incrementally refresh data starting 10 Days before refresh date\n//    [x] Detect data changes: column LastModified\n//    [x] Only refresh complete days\n// 4. Publish and run first refresh in the Service',
      explanation:
        'In Desktop, only one month (Jan 2025) is loaded because of the parameter values - keeping the .pbix small. The Service creates yearly/monthly/daily partitions; each later refresh reloads only partitions in the 10-day window (and only those whose max LastModified changed). Note: OrderDate must be datetime (or convert the parameters for other types). Use >= on one side and < on the other to avoid duplicate rows on boundaries.',
    },
    {
      title: 'Incremental refresh when the date is an integer key',
      scenario: 'The source fact table has OrderDateKey as integer (yyyymmdd) instead of a date.',
      code:
        '// Custom function fnDateKey\n(x as datetime) as number =>\n    Date.Year(x) * 10000 + Date.Month(x) * 100 + Date.Day(x)\n\n// Filter step\nFiltered = Table.SelectRows(\n    dbo_FactSales,\n    each [OrderDateKey] >= fnDateKey(RangeStart)\n     and [OrderDateKey] <  fnDateKey(RangeEnd)\n)',
      explanation:
        'RangeStart/RangeEnd must be Date/Time parameters, so we convert them to the integer format. Since the function is evaluated on the parameter (a constant), the comparison still folds to a SQL WHERE clause on the integer column.',
    },
    {
      title: 'Troubleshooting a failed refresh',
      scenario: 'Refresh failed overnight with: "The credentials provided for the SQL source are invalid."',
      code:
        '1. Semantic model > Refresh history > read error + time; note which data source failed.\n2. Check if the service account password was changed or expired -> yes, rotated yesterday.\n3. Manage connections and gateways > SalesDW-Prod > Edit credentials > update password > Test connection.\n4. Refresh now > Succeeded.\n5. Prevent: set password rotation process to update gateway connections; consider Microsoft Entra ID (OAuth) / managed identity where supported.\n6. If 4 consecutive failures occurred, re-enable the scheduled refresh (it gets disabled automatically).',
      explanation:
        'Read the error, identify the layer (credentials, gateway, query, data), fix at the right place, then re-test and prevent recurrence. Remember scheduled refresh auto-disables after 4 consecutive failures.',
    },
    {
      title: 'Choosing Import vs DirectQuery for a near-real-time requirement',
      scenario: 'Operations wants an order-status page updated every 5 minutes; management reports need fast history analysis.',
      code:
        'Design (composite model):\n- FactOrdersToday: DirectQuery (on-prem SQL via standard gateway), filtered to today\n- FactSales history: Import with incremental refresh (daily)\n- Dimensions: Dual storage mode\n- Ops page: Automatic page refresh = 5 minutes (Fixed interval or Change detection on Premium)\n\nAlternative on Premium/Fabric: incremental refresh with "Get the latest data in real time with DirectQuery" (hybrid table).',
      explanation:
        'Import gives fast analytics; DirectQuery gives freshness without scheduled refresh limits. Dual dimensions avoid limited relationships. The admin must allow the page refresh interval in tenant/capacity settings.',
    },
  ],
  interview: [
    {
      q: 'How many scheduled refreshes per day are allowed in Pro vs Premium?',
      a: 'Pro (shared capacity): 8 per day. Premium Per User and Premium/Fabric capacity: 48 per day in the UI schedule (every 30 min). On Premium/Fabric you can refresh more often via the REST API or XMLA endpoint, limited only by capacity resources.',
      level: 'Easy',
    },
    {
      q: 'What is an on-premises data gateway and when do you need it?',
      a: 'It is software installed on a machine inside your network that securely connects the Power BI Service (cloud) to data sources that are not reachable from the internet, using outbound connections through Azure Service Bus. Needed for on-prem databases, file shares, and sources inside private networks for scheduled refresh, DirectQuery and live connections. Not needed for public cloud sources like SharePoint Online or Azure SQL with public access.',
      level: 'Easy',
    },
    {
      q: 'Difference between standard and personal gateway?',
      a: 'Standard: multi-user, central management, supports Import refresh, DirectQuery and Live connections, works with Power BI, Power Apps, Power Automate, Logic Apps and Fabric, supports clustering for high availability. Personal: single user, Power BI only, Import scheduled refresh only, no DirectQuery/Live connection, not shareable. Production uses standard.',
      level: 'Easy',
    },
    {
      q: 'Explain incremental refresh and its requirements.',
      a: 'Incremental refresh partitions a table by date: older data is stored and not reloaded; only recent partitions refresh. Requirements: Date/Time parameters named RangeStart and RangeEnd (case-sensitive), a filter on a date column using them (>= and <), query folding to the source (strongly recommended - otherwise performance is poor), and a policy defined in Desktop (archive period and refresh period). Optional: detect data changes, only refresh complete days, real-time DirectQuery partition (hybrid tables on Premium/PPU/Fabric). The first Service refresh loads full history.',
      level: 'Medium',
    },
    {
      q: 'Why must the incremental refresh filter use >= on one side and < on the other?',
      a: 'Partitions are contiguous ranges. If both boundaries were inclusive (>= and <=), a row exactly on the boundary (e.g. midnight on the 1st) would belong to two partitions and be loaded twice, creating duplicates. If both were exclusive, it would be lost. One inclusive and one exclusive guarantees each row lands in exactly one partition.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Incremental refresh is configured but every refresh still takes as long as a full refresh. Why?',
      a: 'Most likely the RangeStart/RangeEnd filter does not fold to the source, so Power Query retrieves the full table for every partition and filters locally. Causes: a step before the filter breaks folding (e.g. added index, some custom columns, merging with a non-foldable source, flat files which never fold), or the filter is applied on a transformed column. Check with View Native Query / query diagnostics, move the filter early, and push transformations to the source or a view. Also verify the refresh window is not too large.',
      level: 'Hard',
    },
    {
      q: 'Does a DirectQuery model need scheduled refresh?',
      a: 'No data import refresh is needed - queries go to the source live. However, dashboard tile caches refresh on a schedule, and if the model is composite, its Import tables need scheduled refresh. Automatic page refresh can refresh report visuals at intervals. A gateway (standard) is needed if the source is on-premises.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Refresh works in Power BI Desktop but fails in the Service. What do you check?',
      a: 'Environment-specific issues: 1) data source credentials not set/expired in the Service; 2) gateway not configured, offline, or data source not mapped (server name mismatch); 3) local file paths (C:\\Users\\...) that the Service/gateway cannot reach - move to SharePoint/OneDrive or a UNC share accessible to the gateway; 4) privacy level differences; 5) timeouts (2 h shared) or memory limits in the Service; 6) a personal gateway on a laptop that was off. Read the Refresh history error first.',
      level: 'Hard',
    },
    {
      q: 'What happens after consecutive refresh failures?',
      a: 'After 4 consecutive scheduled refresh failures, Power BI disables the scheduled refresh and notifies the owner. Also, if no user visits a dashboard or report built on the model for 2 months, scheduled refresh is paused. You must fix the issue and re-enable the schedule.',
      level: 'Medium',
    },
    {
      q: 'How do you make gateways highly available?',
      a: 'Install multiple gateway members in a gateway cluster (same recovery key, added to an existing gateway). Requests are distributed across active members and fail over if one goes offline. Also: use stable, always-on servers, monitor them, keep versions consistent and updated, and place them close to data sources to reduce latency.',
      level: 'Medium',
    },
    {
      q: 'What is the refresh timeout and how do you handle a model that exceeds it?',
      a: 'Shared capacity: 2 hours per refresh; Premium/Fabric: 5 hours (longer via XMLA/API). To fix: remove unused columns and rows, reduce cardinality, ensure query folding, use incremental refresh, pre-aggregate or move transformations to the database/dataflows, avoid expensive steps (row-by-row custom functions, merges against non-folding sources), and consider Premium/Fabric for larger capacity.',
      level: 'Hard',
    },
    {
      q: 'Scenario: Your model combines an Excel file on a network share and an on-prem SQL database. What gateway setup is needed?',
      a: 'A standard gateway that can reach both the SQL Server and the network share (UNC path like \\\\fileserver\\finance\\budget.xlsx, not a mapped drive letter). Create two connections on the gateway (SQL Server and File), with appropriate credentials (Windows account with access to the share). Map both data sources in the semantic model settings. Set privacy levels consistently to allow combining.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'List three data sources that need a gateway and three that do not.',
      hint: 'Is it reachable from the internet?',
      solution:
        'Need gateway: on-prem SQL Server, Excel/CSV on a corporate file share, on-prem Oracle/SAP. No gateway: SharePoint Online/OneDrive files, Azure SQL Database (public endpoint), Salesforce / Dynamics 365 / Dataverse (cloud).',
    },
    {
      task: 'Create RangeStart and RangeEnd parameters and apply them to a Sales table, then configure a policy: archive 3 years, refresh last 7 days.',
      hint: 'Date/Time parameters; >= and <.',
      solution:
        'Home > Manage parameters > New: RangeStart (Date/Time, 1/1/2025 0:00), RangeEnd (Date/Time, 1/2/2025 0:00).\nFilter OrderDate: custom filter "is after or equal to" RangeStart AND "is before" RangeEnd, giving:\nTable.SelectRows(Source, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)\nClose & Apply. Right-click Sales > Incremental refresh > On > Archive 3 Years, Incrementally refresh 7 Days > Apply. Publish and refresh in Service.',
    },
    {
      task: 'Your OrderDate column is of type Date (not Date/Time). How do you still use incremental refresh?',
      hint: 'Convert parameters in the filter.',
      solution:
        'Keep parameters as Date/Time (required) and convert in the filter:\nTable.SelectRows(Source, each [OrderDate] >= Date.From(RangeStart) and [OrderDate] < Date.From(RangeEnd))\nDate.From on a parameter folds. Alternatively change the column type to Date/Time in the source view.',
    },
    {
      task: 'A scheduled refresh fails with "Data source not found on gateway". Write the troubleshooting steps.',
      hint: 'Compare names.',
      solution:
        '1. In Desktop, Transform data > Data source settings: note exact server and database (e.g. sqlprod01.contoso.local, SalesDW).\n2. In Service > Manage connections and gateways: check the connection definition uses identical server/database names.\n3. Create or fix the connection; ensure you are a user of the connection.\n4. Semantic model settings > Gateway and cloud connections > map the source > Apply > Refresh now.',
    },
    {
      task: 'Design a refresh schedule for: a dataflow (Customer), and two semantic models that use it, with refresh at 7 AM and 2 PM on Pro.',
      hint: 'Order matters.',
      solution:
        'Dataflow: 06:30 and 13:30. Semantic models: 07:00 and 14:00 (each within Pro\'s 8/day). Better: trigger model refresh when the dataflow completes using Power Automate ("When a dataflow refresh completes" -> "Refresh a dataset") or Fabric pipelines, to avoid timing gaps.',
    },
  ],
  quiz: [
    {
      question: 'Maximum scheduled refreshes per day for a semantic model in a Pro (shared) workspace?',
      options: ['4', '8', '24', '48'],
      answer: 1,
      explanation: 'Pro allows 8 scheduled refreshes per day; PPU/Premium allow 48.',
    },
    {
      question: 'Which gateway mode supports DirectQuery?',
      options: ['Personal mode only', 'Standard mode', 'Both modes', 'Neither'],
      answer: 1,
      explanation: 'Only standard mode supports DirectQuery and Live connections.',
    },
    {
      question: 'What must the incremental refresh parameters be called?',
      options: ['StartDate and EndDate', 'RangeStart and RangeEnd', 'FromDate and ToDate', 'Any names'],
      answer: 1,
      explanation: 'The parameters must be named RangeStart and RangeEnd and be of type Date/Time.',
    },
    {
      question: 'Which data source typically does NOT require a gateway?',
      options: ['On-prem SQL Server', 'Excel on a corporate file share', 'SharePoint Online list', 'On-prem Oracle'],
      answer: 2,
      explanation: 'SharePoint Online is a cloud source reachable by the Service.',
    },
    {
      question: 'After how many consecutive failures is scheduled refresh automatically disabled?',
      options: ['2', '3', '4', '10'],
      answer: 2,
      explanation: 'Scheduled refresh is disabled after four consecutive failures.',
    },
    {
      question: 'Why is query folding important for incremental refresh?',
      options: ['It encrypts data', 'It lets the date filter run at the source so only required rows are retrieved per partition', 'It enables RLS', 'It is not important'],
      answer: 1,
      explanation: 'Without folding, every partition refresh would pull the full table and filter locally.',
    },
  ],
};
