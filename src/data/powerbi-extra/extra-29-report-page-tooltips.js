export default {
  id: 'extra-29-report-page-tooltips',
  title: 'Report Page Tooltips',
  module: 'Extra: Visualization & Reporting',
  extraNo: 29,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "A report page tooltip is a small, specially designed report page that pops up when you hover over a data point. Instead of a plain text tooltip, users see mini charts, cards and KPIs filtered to exactly the item they are hovering over.",
  objectives: [
    "Create a tooltip page with the right page size and settings",
    "Connect a tooltip page to visuals automatically (tooltip fields) or manually",
    "Design compact, readable tooltip pages with cards and small charts",
    "Troubleshoot tooltips that show the wrong numbers or do not appear",
  ],
  theory: [
    {
      heading: "Default tooltips vs report page tooltips",
      content: "Every visual has a **default tooltip**: hover over a bar and you see the category and value as text. You can add more fields to the visual's Tooltips well, but it is still just text.\n\nA **report page tooltip** replaces that text with a whole mini report page. Hover over 'Electronics' in a bar chart and a small card pops up with Electronics sales, profit, a trend line by month and the top products.\n\nAnalogy: a default tooltip is a sticky note; a report page tooltip is a pocket-sized dashboard that opens on hover.",
    },
    {
      heading: "Step 1: Create and configure the tooltip page",
      content: "1. Add a new page (click + at the bottom) and rename it, for example `TT Category`.\n2. With the page selected and no visual selected, open the **Format** pane (Format your report page).\n3. Expand **Page information** and turn on **Allow use as tooltip**.\n4. Expand **Canvas settings** and set **Type** to **Tooltip** (320 x 240 pixels). You can also use Custom size, but keep it small.\n5. Optional: in the View ribbon, set **Page view > Actual size** so you design at real size.\n6. Right-click the page tab > **Hide page** so readers do not navigate to it directly.",
      tip: "Name tooltip pages with a prefix like 'TT ' so they are easy to find and keep them hidden.",
    },
    {
      heading: "Step 2: Design the tooltip content",
      content: "Add only a few visuals; the space is small:\n\n- 2-3 **cards** (Total Sales, Profit, Orders).\n- One small **line chart** or **column chart** (sales by month).\n- Optionally a **table** with top 3 products (use the Top N filter).\n\nUse a light background, small font sizes (9-11 pt) and turn off visual headers and titles you do not need. Every visual on the tooltip page will be **filtered by the data point being hovered**.",
    },
    {
      heading: "Step 3: Connect the tooltip page to visuals",
      content: "**Automatic (tooltip fields):** On the tooltip page, with no visual selected, the Visualizations pane (Build) shows a **Tooltip** field well (in the Drill through area). Drag a field such as `Product[Category]` there. Now any visual in the report that uses Category will show this tooltip page automatically. You can also add a measure here to match visuals that use that measure.\n\n**Manual:** Select a visual > Format pane > General > **Tooltips** > Type = **Report page**, Page = `TT Category`. This forces that visual to use the chosen page, even without matching fields.\n\nTo stop a visual from using any tooltip page, set its Tooltips Type back to Default, or turn Tooltips off.",
      points: [
        "Auto mode: tooltip page appears wherever the tooltip field is used",
        "Manual mode: chosen per visual in Format > General > Tooltips",
        "Keep all filters (on the tooltip page) controls whether all filters from the source visual pass through",
      ],
    },
    {
      heading: "How filtering works and common issues",
      content: "When you hover over a data point, Power BI passes the data point's filters (e.g. Category = Electronics, plus any slicer filters on the source page) to the tooltip page.\n\nCommon problems:\n\n- **Tooltip shows totals, not the hovered item:** the field on the source visual is from a different table or not related to the tooltip visuals. Check relationships.\n- **Tooltip page does not appear:** Allow use as tooltip is off, or the visual's Tooltips Type is set to Default.\n- **Tooltip is cut off:** the page size is too large; use Tooltip canvas type or a smaller custom size.\n- **Matrix or table visuals:** tooltips appear when hovering over cells, using the row and column filters for that cell.",
    },
  ],
  examples: [
    {
      title: "Category tooltip with cards and a trend",
      scenario: "On the main page a bar chart shows Total Sales by Category. Managers want to hover over a bar and see profit, order count and the monthly trend for that category.",
      table: {
        headers: ['Hovered bar', 'Total Sales', 'Profit', 'Orders'],
        rows: [
          ['Electronics', '8,25,000', '1,65,000', '310'],
          ['Furniture', '4,50,000', '1,12,500', '140'],
          ['Accessories', '2,30,000', '92,000', '520'],
        ],
      },
      steps: [
        "Click + at the bottom to add a page; double-click the tab and rename it TT Category",
        "Click an empty area of the canvas, open Format your report page > Page information > turn on Allow use as tooltip",
        "Canvas settings > Type > Tooltip",
        "Create the measures in the code box (Modeling > New measure)",
        "Add three Card visuals with Total Sales, Profit and Orders; add a Line chart with 'Date'[Month] on X-axis and Total Sales on Y-axis",
        "Click an empty area again and drag Product[Category] into the Tooltip well in the Visualizations pane (Build)",
        "Right-click the TT Category tab > Hide page",
        "Go back to the main page and hover over the Electronics bar in the Sales by Category chart",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Profit = SUM(Sales[SalesAmount]) - SUM(Sales[Cost])

Orders = COUNTROWS(Sales)`,
      result: "Hovering over Electronics shows a mini page with 8,25,000 sales, 1,65,000 profit, 310 orders and a monthly trend line for Electronics only.",
      explanation: "Because Category is in the tooltip page's Tooltip well, Power BI automatically uses the page for any visual with Category and filters it to the hovered category.",
    },
    {
      title: "Manually assign a tooltip page to a map or table",
      scenario: "A table by City should show a City tooltip page, even though the tooltip page has no matching tooltip field.",
      table: {
        headers: ['Hovered City', 'Corporate Sales', 'Retail Sales', 'Corporate %'],
        rows: [
          ['Pune', '3,24,000', '2,16,000', '60.0%'],
          ['Mumbai', '2,70,000', '2,20,000', '55.1%'],
        ],
      },
      steps: [
        "Create a page TT City with Allow use as tooltip on and Canvas type Tooltip",
        "Add a Clustered bar chart with Customer[Segment] on Y-axis and Total Sales on X-axis, plus a Card with Corporate %",
        "Hide the TT City page",
        "On the main page, select the table visual that has Customer[City] and Total Sales",
        "Format pane > General > Tooltips > Type: Report page, Page: TT City",
        "Hover over the Pune row",
      ],
      code: `Corporate % =
DIVIDE(
    CALCULATE([Total Sales], Customer[Segment] = "Corporate"),
    [Total Sales]
)`,
      result: "Hovering over Pune shows a segment split (Corporate 3,24,000, Retail 2,16,000) and Corporate % = 60.0%.",
      explanation: "Manual assignment ignores auto matching. The hovered row passes City = Pune as a filter to the tooltip page, so all its visuals show Pune data.",
    },
    {
      title: "Turn off tooltip for one visual",
      scenario: "A small KPI card on the main page should not show the category tooltip page when hovered.",
      steps: [
        "Select the card visual on the main page",
        "Format pane > General > Tooltips",
        "Turn the Tooltips toggle off (or set Type to Default to show only the basic text tooltip)",
        "Hover over the card to confirm no tooltip page appears",
      ],
      result: "The card no longer shows a tooltip, while the bar chart still shows the TT Category page.",
      explanation: "Tooltip settings are per visual, so you can control exactly where report page tooltips appear.",
    },
  ],
  interview: [
    { q: "What is a report page tooltip?", a: "A hidden, small report page used as a rich tooltip. When a user hovers over a data point, the page appears filtered to that data point.", level: 'Easy' },
    { q: "Which settings make a page usable as a tooltip?", a: "Format your report page > Page information > Allow use as tooltip = On, and usually Canvas settings > Type = Tooltip (320 x 240).", level: 'Easy' },
    { q: "What is the difference between automatic and manual tooltip assignment?", a: "Automatic uses the Tooltip field well on the tooltip page; any visual using those fields shows the page. Manual is set on the visual: Format > General > Tooltips > Type Report page and choose the page.", level: 'Medium' },
    { q: "Why should you hide tooltip pages?", a: "Readers would otherwise see a tiny, unfiltered page in the page navigation, which is confusing. Hiding keeps it usable only as a tooltip.", level: 'Easy' },
    { q: "Scenario: the tooltip shows the grand total instead of the hovered category. What do you check?", a: "Check that the tooltip visuals use fields related to the hovered field (e.g. Product[Category] relates to Sales), that Keep all filters is on, and that no visual-level filters or ALL() in measures remove the filter.", level: 'Hard' },
    { q: "Do report page tooltips work in the Power BI Service and mobile?", a: "They work in the Service. On mobile, tooltips appear on tap but layout space is limited, so keep them small and simple.", level: 'Medium' },
    { q: "Scenario: two tooltip pages both have Category in their Tooltip well. Which one is used?", a: "Auto mode picks one matching page, which may not be the one you want. Assign the desired page manually on the visual (Type = Report page) to be explicit.", level: 'Hard' },
  ],
  practice: [
    { task: "Build a TT Product tooltip page showing Total Quantity, Average Unit Price and a sales trend by month.", hint: "Create Total Quantity = SUM(Sales[Quantity]) and Avg Price = AVERAGE(Sales[UnitPrice]).", solution: "New page TT Product, Allow use as tooltip on, Canvas Type Tooltip. Add Card Total Quantity, Card Avg Price, Line chart 'Date'[Month] vs Total Sales. Drag Product[Product] to the Tooltip well and hide the page." },
    { task: "Use a custom tooltip size of 400 x 300 pixels.", hint: "Canvas settings.", solution: "Format your report page > Canvas settings > Type: Custom, Width 400, Height 300." },
    { task: "Assign TT Product manually to a table visual that lists products.", hint: "Format > General > Tooltips.", solution: "Select the table > Format pane > General > Tooltips > Type: Report page, Page: TT Product." },
    { task: "Add a Top 3 products table to the TT Category page.", hint: "Filter pane > Filter type Top N.", solution: "Add a table with Product[Product] and Total Sales. In the Filters pane for Product, set Filter type = Top N, Show items Top 3, By value Total Sales, click Apply filter." },
  ],
  quiz: [
    { question: "Which toggle enables a page to be used as a tooltip?", options: ["Hide page", "Allow use as tooltip", "Drill through", "Keep all filters"], answer: 1, explanation: "Page information > Allow use as tooltip." },
    { question: "The default Tooltip canvas size is:", options: ["1280 x 720", "320 x 240", "800 x 600", "640 x 480"], answer: 1, explanation: "Tooltip canvas type is 320 x 240 pixels." },
    { question: "Where do you manually set a visual to use a specific tooltip page?", options: ["View > Tooltips", "Format pane > General > Tooltips > Type: Report page", "Modeling > Tooltip", "Filters pane"], answer: 1, explanation: "Tooltip settings are in the visual's Format pane." },
    { question: "What filters the content of a report page tooltip?", options: ["Nothing; it always shows totals", "The data point being hovered (plus source page filters)", "Only bookmarks", "Only the Filters pane on the tooltip page"], answer: 1, explanation: "Hovered data point filters pass to the tooltip page." },
    { question: "Why hide the tooltip page?", options: ["Hidden pages refresh faster", "So readers don't navigate to the tiny unfiltered page", "Tooltips only work on hidden pages", "To make it mobile friendly"], answer: 1, explanation: "Hiding keeps navigation clean; the tooltip still works." },
  ],
};
