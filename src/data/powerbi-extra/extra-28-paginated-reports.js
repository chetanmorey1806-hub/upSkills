export default {
  id: 'extra-28-paginated-reports',
  title: 'Paginated Reports',
  module: 'Extra: Visualization & Reporting',
  extraNo: 28,
  level: 'Advanced',
  duration: '2 hours',
  summary: "Paginated reports are pixel-perfect, print-ready reports (invoices, statements, long lists) built with Power BI Report Builder and saved as .rdl files. Unlike interactive Power BI reports, they print every row across as many pages as needed and export cleanly to PDF, Excel and Word.",
  objectives: [
    "Explain the difference between Power BI reports (.pbix) and paginated reports (.rdl)",
    "Connect Power BI Report Builder to a published semantic model and write a DAX dataset query",
    "Build a table (tablix) with grouping, headers, footers and parameters",
    "Publish a paginated report and know the export, subscription and licensing basics",
  ],
  theory: [
    {
      heading: "What is a paginated report?",
      content: "A normal Power BI report is like a dashboard on a TV screen: interactive, one page fits the screen, and a table with 10,000 rows just scrolls inside a box.\n\nA **paginated report** is like a printed bank statement: designed for paper or PDF, laid out to the exact pixel, and it **flows across as many pages as the data needs**, with headers and page numbers on every page.\n\nPaginated reports come from SQL Server Reporting Services (SSRS) and use the **RDL** (Report Definition Language) file format. They are built in a separate free tool, **Power BI Report Builder**.",
      points: [
        "Use cases: invoices, customer statements, purchase orders, regulatory reports, full transaction listings",
        "File type: .rdl (not .pbix)",
        "Export formats: PDF, Excel, Word, PowerPoint, CSV, XML, MHTML, image",
      ],
    },
    {
      heading: "Power BI report vs paginated report",
      content: "- **Purpose:** interactive exploration vs printing and distribution.\n- **Tool:** Power BI Desktop vs Power BI Report Builder (or the web editor in the Service for simple ones).\n- **Layout:** fit-to-screen canvas vs fixed page size (A4, Letter) with margins.\n- **Data rows:** visuals show summaries and scroll; tablix grows across pages and prints every row.\n- **Interactivity:** slicers, cross-filtering, drill vs parameters, drill-through links, toggles.\n- **Data:** paginated reports can use a Power BI semantic model, SQL Server, Azure SQL, Oracle, Dataverse and more.\n\nYou can even show a paginated report inside a Power BI report with the **Paginated report visual**.",
    },
    {
      heading: "Building blocks in Report Builder",
      content: "1. **Data source:** the connection. For Power BI choose Power BI Semantic Model (pick a workspace and model after signing in).\n2. **Dataset:** a query that returns rows. With a semantic model the query is **DAX**, built with the Query Designer (drag fields) or typed by hand.\n3. **Parameters:** inputs like City or Year. In a DAX query they are referenced as `@City`.\n4. **Tablix:** the table/matrix/list region that repeats rows; supports row groups, subtotals and page breaks.\n5. **Header and footer:** repeat on every page; use built-in fields like `[&PageNumber]` and `[&TotalPages]`.\n6. **Expressions:** written in a VB-style language, e.g. `=Format(Fields!Amount.Value, \"N0\")`.",
      syntax: "EVALUATE\nSUMMARIZECOLUMNS(\n    Customer[City],\n    Product[Category],\n    \"Total Sales\", SUM(Sales[SalesAmount])\n)",
      tip: "The DAX Lab in this app does not run SUMMARIZECOLUMNS dataset queries. Test them in Power BI Desktop's DAX query view, then paste into Report Builder.",
    },
    {
      heading: "Publishing, licensing and distribution",
      content: "- Publish from Report Builder: **File > Publish to Power BI service**, or upload the .rdl in a workspace (Upload > Browse).\n- Paginated reports can be published to Pro workspaces; sharing with viewers follows the normal rule (Pro/PPU licences, or Premium / Fabric capacity for free viewers).\n- Users can **export** to PDF/Excel/Word and create **email subscriptions** that deliver the report as an attachment on a schedule.\n- In the Service you can also select a semantic model and choose **Create paginated report** to build a simple one in the browser.\n\nRefresh comes from the source: when the semantic model refreshes, the paginated report shows new data next time it runs.",
    },
    {
      heading: "When to choose a paginated report",
      content: "Choose paginated when users say:\n\n- 'I need to print this' or 'email me a PDF every Monday'.\n- 'Show me all 5,000 transactions with page totals.'\n- 'It must look exactly like our official invoice format.'\n\nChoose a normal Power BI report when users want to explore, slice, drill and see trends. In many companies both exist: an interactive dashboard for managers and a paginated statement for operations or customers.",
    },
  ],
  examples: [
    {
      title: "Sales listing by City with a parameter",
      scenario: "Operations wants a printable list of every 2024 order for a chosen city, with customer, product and amount, and a total at the end.",
      table: {
        headers: ['OrderID', 'OrderDate', 'Customer', 'Product', 'Amount'],
        rows: [
          ['1001', '05-Jan-2024', 'Pune Traders', 'Laptop', '55,000'],
          ['1004', '12-Jan-2024', 'Amit Sharma', 'Office Chair', '8,500'],
          ['1010', '02-Feb-2024', 'Pune Traders', 'Mouse', '1,200'],
          ['', '', '', 'City total (page 1 of 3)', '...'],
        ],
      },
      steps: [
        "Publish the practice model to a Power BI workspace (Home > Publish in Desktop)",
        "Install and open Power BI Report Builder (free from Microsoft) and sign in with your Power BI account",
        "Report Data pane > Data Sources > Add Power BI Semantic Model Connection, pick the workspace and model",
        "Right-click Datasets > Add Dataset, choose the data source and click Query Designer, or paste the DAX in the code box",
        "Right-click Parameters > Add Parameter: Name City, available values = Pune, Mumbai, Nagpur, Nashik",
        "Insert > Table > Table Wizard; drag OrderID, OrderDate, Customer, Product to rows and Amount to values; enable totals",
        "Insert > Footer > Add Footer; in the footer add a text box with =\"Page \" & Globals!PageNumber & \" of \" & Globals!TotalPages",
        "Click Run to preview, choose City = Pune and click View Report",
      ],
      code: `EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        Sales[OrderID],
        Sales[OrderDate],
        Customer[Customer],
        Product[Product],
        "Amount", SUM(Sales[SalesAmount])
    ),
    Customer[City] = @City,
    'Date'[Year] = 2024
)
ORDER BY Sales[OrderDate]`,
      result: "A multi-page report for Pune listing every 2024 order, with page numbers in the footer and a grand total on the last page.",
      explanation: "The DAX query returns one row per order for the chosen city. The tablix repeats each row and naturally flows to new pages; header and footer repeat on every page.",
    },
    {
      title: "Group with page break per City",
      scenario: "Finance wants one city per page with a subtotal at the bottom of each city.",
      table: {
        headers: ['City', 'Category', 'Total Sales'],
        rows: [
          ['Pune', 'Electronics', '3,00,000'],
          ['Pune', 'Furniture', '1,60,000'],
          ['Pune', 'Accessories', '80,000'],
          ['Pune subtotal', '', '5,40,000'],
        ],
      },
      steps: [
        "Create a dataset using the DAX in the code box",
        "Insert > Table and add Category and Total Sales columns",
        "In the Row Groups pane, right-click Details > Add Group > Parent Group, group by City, tick Add group header and Add group footer",
        "In the group footer cell under Total Sales, type =Sum(Fields!Total_Sales.Value)",
        "Right-click the City group > Group Properties > Page Breaks > tick Between each instance of a group",
        "Run the report and page through it",
      ],
      code: `EVALUATE
CALCULATETABLE(
    SUMMARIZECOLUMNS(
        Customer[City],
        Product[Category],
        "Total Sales", SUM(Sales[SalesAmount])
    ),
    'Date'[Year] = 2024
)`,
      result: "Each city prints on its own page with category rows and a subtotal; Pune shows 5,40,000.",
      explanation: "Row groups and page breaks are core tablix features. Report Builder renames DAX result columns to valid field names (e.g. Total_Sales), which you use in expressions.",
    },
    {
      title: "Export and subscribe in the Service",
      scenario: "The CFO wants the City report as a PDF in her inbox every Monday at 8 AM.",
      steps: [
        "In Report Builder: File > Publish to Power BI service and choose the workspace",
        "Open the paginated report in the Service, choose parameter values and click View report",
        "Click Export > PDF to download a copy manually",
        "Click Subscribe to report > Create a subscription",
        "Set recipients, attachment format PDF, parameter values, and schedule Weekly on Monday 08:00",
        "Save the subscription and use Run now to test",
      ],
      result: "The CFO receives an email with the PDF attached every Monday morning.",
      explanation: "Paginated report subscriptions can attach the full report in formats like PDF or Excel, which makes them ideal for scheduled distribution.",
    },
  ],
  interview: [
    { q: "What is a paginated report?", a: "A pixel-perfect, page-oriented report (RDL format) built with Power BI Report Builder, designed for printing and exporting; it renders all rows across as many pages as needed.", level: 'Easy' },
    { q: "Which tool do you use to build paginated reports?", a: "Power BI Report Builder (free desktop tool). Simple ones can also be created in the Power BI Service from a semantic model.", level: 'Easy' },
    { q: "What query language is used when the data source is a Power BI semantic model?", a: "DAX. The dataset query starts with EVALUATE and typically uses SUMMARIZECOLUMNS or CALCULATETABLE.", level: 'Medium' },
    { q: "How are parameters used in a paginated report with a semantic model source?", a: "Create a report parameter and reference it in the DAX query as @ParameterName, or let the Query Designer generate the filter. Available values can come from a separate dataset.", level: 'Medium' },
    { q: "When would you recommend a paginated report instead of a Power BI report?", a: "For printable, fixed-layout outputs like invoices, statements and full transaction listings, or when users need scheduled PDF/Excel attachments.", level: 'Medium' },
    { q: "How do you repeat page numbers on every page?", a: "Add a page header or footer and use the built-in fields Globals!PageNumber and Globals!TotalPages in an expression.", level: 'Medium' },
    { q: "Scenario: a user exports a Power BI table visual to Excel and only gets 150,000 rows. They need all rows in a formatted file monthly. What do you suggest?", a: "Build a paginated report with a tablix over the semantic model and set up a subscription with Excel or CSV attachments. Paginated reports are designed for large detailed exports.", level: 'Hard' },
    { q: "Scenario: show a paginated invoice inside an interactive Power BI report filtered by slicers.", a: "Use the Paginated report visual in Power BI Desktop, connect it to the published .rdl and map report fields to its parameters so slicer selections pass through.", level: 'Hard' },
  ],
  practice: [
    { task: "Write a DAX dataset query that returns Category and Total Quantity for 2024.", hint: "SUMMARIZECOLUMNS with a filter table, or CALCULATETABLE.", solution: "EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Product[Category], \"Total Quantity\", SUM(Sales[Quantity])), 'Date'[Year] = 2024)" },
    { task: "Add a Year parameter with values 2023 and 2024 and use it in the query.", hint: "Reference it as @Year.", solution: "Add Parameter Year (Integer) with available values 2023, 2024. Query: EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Product[Category], \"Total Sales\", SUM(Sales[SalesAmount])), 'Date'[Year] = @Year)" },
    { task: "Add a report title in the page header showing the selected city.", hint: "Use Parameters!City.Value.", solution: "Insert > Header > Add Header; add a text box with =\"Sales Listing - \" & Parameters!City.Value" },
    { task: "Make the Amount column show thousands separators and red for amounts below 5,000.", hint: "Text box properties: Number and Font.", solution: "Text Box Properties > Number > Number with 0 decimals and Use 1000 separator. Font > Color expression: =IIf(Fields!Amount.Value < 5000, \"Red\", \"Black\")" },
  ],
  quiz: [
    { question: "What file format do paginated reports use?", options: [".pbix", ".rdl", ".pbit", ".xlsx"], answer: 1, explanation: "RDL = Report Definition Language." },
    { question: "Which tool is used to author paginated reports?", options: ["Power BI Desktop", "Power BI Report Builder", "Tabular Editor", "Power Query Online"], answer: 1, explanation: "Power BI Report Builder is the authoring tool." },
    { question: "A key strength of paginated reports is:", options: ["AI visuals", "Cross-filtering between visuals", "Printing all rows across multiple pages with fixed layout", "Real-time streaming"], answer: 2, explanation: "They are designed for pixel-perfect, multi-page output." },
    { question: "In a DAX dataset query, a report parameter named City is referenced as:", options: ["[City]", "@City", "$City", "{City}"], answer: 1, explanation: "Query parameters use the @ prefix." },
    { question: "Which feature lets you embed a paginated report inside a Power BI report?", options: ["Q&A visual", "Paginated report visual", "Smart narrative", "Key influencers"], answer: 1, explanation: "The Paginated report visual renders an .rdl inside a Power BI report." },
  ],
};
