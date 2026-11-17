export default {
  id: 'extra-32-drill-through-pages',
  title: 'Drill Through Pages',
  module: 'Extra: Visualization & Reporting',
  extraNo: 32,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "A drill through page is a detail page that users jump to from a summary visual, carrying the selected item (for example a Product or City) as a filter. It keeps summary pages clean while giving users a one-click path to the full details of any item.",
  objectives: [
    "Create a drill through page with drill through fields and a back button",
    "Drill through from visuals using right-click and from buttons",
    "Use Keep all filters, multiple drill through fields and measure-based drill through",
    "Set up cross-report drill through between reports in a workspace",
  ],
  theory: [
    {
      heading: "What is drill through?",
      content: "Imagine an online shopping site: the home page lists products, and when you click one you open its **product details page**. Drill through in Power BI works the same way.\n\nA **summary page** shows totals by Product, City or Customer. A **drill through page** shows the details of one item. Users right-click a data point (e.g. the 'Laptop' bar) and choose **Drill through > Product Details**. Power BI opens the details page filtered to Laptop.\n\nDrill **down** stays inside one visual and moves down a hierarchy (Year > Quarter > Month). Drill **through** jumps to another page.",
    },
    {
      heading: "Creating a drill through page",
      content: "1. Add a new page and name it, for example `Product Details`.\n2. With no visual selected, in the **Visualizations pane (Build)** find the **Drill through** section.\n3. Drag the field you want to drill on, e.g. `Product[Product]`, into **Add drill-through fields here**.\n4. Power BI automatically adds a **Back button** (top-left) that returns users to the source page. Ctrl+click it in Desktop to test.\n5. Build the detail visuals: cards, trend line, table of orders.\n6. Optional: hide the page (right-click tab > Hide page) so users reach it only via drill through.\n\nNow every visual in the report that uses `Product[Product]` shows the drill through option on right-click.",
      points: [
        "Cross-report: allow drill through from other reports in the same workspace",
        "Keep all filters: on = pass all filters from the source (slicers, other fields); off = pass only the drill through field",
        "Multiple drill through fields: the page appears only when all fields are available in the source visual",
      ],
    },
    {
      heading: "Keep all filters",
      content: "The **Keep all filters** toggle (in the Drill through section) is on by default.\n\n- **On:** if the source page has a slicer Year = 2024 and Segment = Retail, and the user drills on Laptop, the details page shows Laptop for 2024 Retail.\n- **Off:** only Product = Laptop passes through; the details page shows Laptop across all years and segments (subject to its own filters).\n\nChoose based on what the detail page should answer.",
      tip: "If users ask 'why is the detail page showing a different number than the summary bar?' check Keep all filters and the slicers on both pages.",
    },
    {
      heading: "Ways to trigger drill through",
      content: "1. **Right-click** a data point > **Drill through** > page name.\n2. **Button action:** Insert > Buttons > Blank. Format > Action: Type = **Drill through**, Destination = page. The button is disabled until the user selects one data point, then it activates. Use the Button text with conditional formatting (fx) to show 'See details for Laptop'.\n3. **Measure-based drill through:** add a measure to the drill through well and choose **Used as category** / **Summarized** options; the drill through then appears from visuals that include that measure.\n\nButtons are more discoverable than right-click, especially for new users.",
      syntax: "Button Text =\nIF(\n    HASONEVALUE(Product[Product]),\n    \"See details for \" & SELECTEDVALUE(Product[Product]),\n    \"Select a product to see details\"\n)",
    },
    {
      heading: "Cross-report drill through",
      content: "You can drill from one report to a page in another report in the same workspace (or the same app).\n\n1. In the target report: on the drill through page, turn on **Cross-report** in the Drill through section.\n2. In both reports: File > Options and settings > Options > **Current file > Report settings** > enable **Allow visuals in this report to use drill-through targets from other reports**.\n3. Publish both reports to the same workspace.\n4. Field names and tables must match (same table and column names) for filters to pass.\n\nCross-report targets appear in the right-click menu as 'Page [Report name]'.",
    },
  ],
  examples: [
    {
      title: "Product Details drill through page",
      scenario: "The summary page has a bar chart of Total Sales by Product. Managers want to right-click a product and see its sales trend, customers and order list.",
      table: {
        headers: ['On Product Details (Laptop, 2024)', 'Value'],
        rows: [
          ['Total Sales', '4,40,000'],
          ['Quantity', '8'],
          ['Avg Unit Price', '55,000'],
          ['Top City', 'Pune'],
        ],
      },
      steps: [
        "Click + to add a page and rename it Product Details",
        "Click an empty spot of the canvas; in the Visualizations pane (Build) drag Product[Product] into Add drill-through fields here",
        "Notice the back button added at the top-left",
        "Create the measures in the code box (Modeling > New measure)",
        "Add Cards for Total Sales, Total Quantity, Avg Unit Price and Top City; add a Line chart 'Date'[Month] vs Total Sales; add a Table with Sales[OrderID], Sales[OrderDate], Customer[Customer], Sales[SalesAmount]",
        "Go to the summary page, right-click the Laptop bar > Drill through > Product Details",
        "Ctrl+click the back button to return",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Total Quantity = SUM(Sales[Quantity])

Avg Unit Price = DIVIDE([Total Sales], [Total Quantity])

Top City =
CONCATENATEX(
    TOPN(1, VALUES(Customer[City]), [Total Sales], DESC),
    Customer[City],
    ", "
)`,
      result: "Product Details opens filtered to Laptop (with Year 2024 from the slicer kept): 4,40,000 sales, 8 units, 55,000 average price, top city Pune.",
      explanation: "The drill through field Product[Product] receives the Laptop filter. Keep all filters is on, so the Year slicer from the summary page also applies.",
    },
    {
      title: "Drill through button with dynamic text",
      scenario: "Users do not know about right-click. Add a button that says which product will be opened.",
      table: {
        headers: ['User selection', 'Button text', 'Button state'],
        rows: [
          ['Nothing selected', 'Select a product to see details', 'Disabled'],
          ['Laptop bar clicked', 'See details for Laptop', 'Enabled'],
        ],
      },
      steps: [
        "Create the Button Text measure from the code box",
        "Insert > Buttons > Blank and place it under the bar chart",
        "Format button > Button > Action: on, Type = Drill through, Destination = Product Details",
        "Format button > Button > Text: on, click fx next to Text, choose Field value and select Button Text",
        "Optionally set a grey fill for the Disabled state and a blue fill for Default state",
        "Click the Laptop bar, then Ctrl+click the button",
      ],
      code: `Button Text =
IF(
    HASONEVALUE(Product[Product]),
    "See details for " & SELECTEDVALUE(Product[Product]),
    "Select a product to see details"
)`,
      result: "The button text changes to 'See details for Laptop' after selecting the bar and opens the Product Details page.",
      explanation: "A drill through button is enabled only when the selection gives exactly one value for the drill through field. HASONEVALUE mirrors that rule in the text.",
    },
    {
      title: "Keep all filters on vs off",
      scenario: "Compare what the detail page shows when the summary page has a Segment slicer set to Retail.",
      table: {
        headers: ['Keep all filters', 'Filters on detail page', 'Laptop Total Sales'],
        rows: [
          ['On', 'Product = Laptop, Year = 2024, Segment = Retail', '1,65,000'],
          ['Off', 'Product = Laptop only', '8,10,000 (both years, all segments)'],
        ],
      },
      steps: [
        "On the summary page add a slicer for Customer[Segment] and select Retail, and a Year slicer = 2024",
        "Drill through on Laptop and note Total Sales on the details page",
        "Go to the Product Details page; in the Drill through section switch Keep all filters off",
        "Return to the summary page and drill through on Laptop again",
        "Hover over the filter icon on the Total Sales card to see which filters are applied",
      ],
      result: "With Keep all filters on, the detail is 1,65,000 (Laptop, Retail, 2024). With it off, only Product passes: 8,10,000 across 2023 and 2024.",
      explanation: "Keep all filters decides whether the source page context (slicers and other fields) travels with the drill through field.",
    },
  ],
  interview: [
    { q: "What is the difference between drill down and drill through?", a: "Drill down moves to a lower hierarchy level inside the same visual. Drill through navigates to a different page filtered by the selected item.", level: 'Easy' },
    { q: "How do you create a drill through page?", a: "Create a page and drag the drill field into the Drill through well of the Visualizations pane. Power BI adds a back button. Then add the detail visuals.", level: 'Easy' },
    { q: "What does Keep all filters do?", a: "When on, all filters applied to the source visual (slicers, page filters, other fields) pass to the drill through page. When off, only the drill through field filter passes.", level: 'Medium' },
    { q: "How do you make drill through more discoverable?", a: "Add a button with Action Type Drill through and a destination page, with dynamic button text showing the selected item.", level: 'Medium' },
    { q: "What is needed for cross-report drill through?", a: "Turn on Cross-report on the target page, enable 'Allow visuals in this report to use drill-through targets from other reports' in report settings, publish both reports to the same workspace/app, and use matching table and column names.", level: 'Hard' },
    { q: "Scenario: the Drill through option does not appear when right-clicking a bar. Why?", a: "The source visual does not contain the drill through field (or one of multiple required fields), the field is from a different table name, or cross-report settings are missing for cross-report targets.", level: 'Hard' },
    { q: "Scenario: the detail page total differs from the bar value. What do you check?", a: "Keep all filters setting, page-level and visual-level filters on the detail page, and measures using ALL/REMOVEFILTERS that ignore the passed filter.", level: 'Hard' },
  ],
  practice: [
    { task: "Create a Customer Details drill through page using Customer[Customer].", hint: "Drill through well on a new page.", solution: "New page Customer Details; drag Customer[Customer] into the Drill through well; add cards Total Sales, Orders = COUNTROWS(Sales), and a table of Product[Product] vs Total Sales." },
    { task: "Add a second drill through field Customer[City] and observe when the page is available.", hint: "Both fields must exist in the source visual.", solution: "Drag Customer[City] into the Drill through well too. Drill through now appears only from visuals containing both Customer and City, e.g. a matrix with City and Customer rows." },
    { task: "Create a drill through button from a table of products.", hint: "Insert > Buttons > Blank; Action Type Drill through.", solution: "Insert > Buttons > Blank; Format > Action on, Type Drill through, Destination Product Details. Select a row in the table, then Ctrl+click the button." },
    { task: "Hide the drill through page and make sure it still works.", hint: "Right-click the page tab.", solution: "Right-click Product Details tab > Hide page. Right-click a bar on the summary page > Drill through > Product Details still works." },
  ],
  quiz: [
    { question: "Where do you add the drill through field?", options: ["Filters pane > Page filters", "Visualizations pane > Build > Drill through section", "Model view > Properties", "View > Drill through"], answer: 1, explanation: "Drag the field into the Drill through well." },
    { question: "What does Power BI add automatically to a new drill through page?", options: ["A slicer", "A back button", "A bookmark", "A tooltip"], answer: 1, explanation: "A back button returns to the source page." },
    { question: "In Power BI Desktop, how do you activate a button while editing?", options: ["Double-click", "Ctrl+click", "Shift+click", "Alt+click"], answer: 1, explanation: "Ctrl+click triggers button actions in Desktop edit mode." },
    { question: "With Keep all filters turned off, which filter passes to the detail page?", options: ["All slicers", "Only the drill through field", "No filters", "Only page filters"], answer: 1, explanation: "Only the drill through field value is passed." },
    { question: "Cross-report drill through requires reports to be:", options: ["In the same workspace or app", "In different tenants", "Saved as .pbit", "Using DirectQuery"], answer: 0, explanation: "Target and source must be published to the same workspace/app." },
  ],
};
