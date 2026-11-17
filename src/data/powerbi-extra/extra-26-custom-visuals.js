export default {
  id: 'extra-26-custom-visuals',
  title: 'Custom Visuals',
  module: 'Extra: Visualization & Reporting',
  extraNo: 26,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "Custom visuals are extra chart types you add to Power BI from Microsoft AppSource, from a .pbiviz file, or from your organization's approved list. They fill gaps in the built-in visuals (bullet charts, Sankey diagrams, word clouds and more), but you must choose them carefully for security, performance and support.",
  objectives: [
    "Explain what a custom visual is and where it comes from (AppSource, file, organizational store)",
    "Import and use a custom visual in Power BI Desktop",
    "Understand certified visuals and why admins may restrict uncertified ones",
    "Decide when a custom visual is worth it and when a built-in visual is better",
  ],
  theory: [
    {
      heading: "What is a custom visual?",
      content: "Power BI ships with around 40 built-in visuals (bar, line, map, matrix and so on). A **custom visual** is an extra visual packaged as a `.pbiviz` file, built by Microsoft or third parties using the Power BI Visuals SDK (TypeScript and D3.js).\n\nThink of Power BI as a smartphone: built-in visuals are the default apps; custom visuals are apps you install from the store when you need something special.\n\nOnce added, a custom visual appears as a new icon in the **Visualizations** pane and is used just like a built-in visual: drag fields into its wells and format it in the Format pane.",
    },
    {
      heading: "Three sources of custom visuals",
      content: "1. **AppSource (Microsoft marketplace):** In Power BI Desktop, Visualizations pane > the three dots (...) > **Get more visuals**. Search, select, click **Add**. Hundreds of free and paid visuals are listed.\n2. **Import from a file:** Visualizations pane > ... > **Import a visual from a file** and choose a `.pbiviz` file (for example one your developer built).\n3. **Organizational visuals:** Admins upload approved visuals in the Power BI admin portal (Admin portal > Organizational visuals). Users see them under Get more visuals > **My organization**. This is the safest option in a company.",
      points: [
        "Custom visuals are saved inside the .pbix file, so colleagues who open the file see them",
        "To remove one: right-click its icon in the Visualizations pane > Unpin this visual (or ... > Remove a visual)",
        "Pin a visual you use often: right-click > Pin to visualizations pane",
      ],
    },
    {
      heading: "Certified visuals and security",
      content: "Microsoft marks some AppSource visuals as **Certified**. A certified visual has passed Microsoft code review: it does not call external services, does not access data outside the report, and meets quality rules. Only certified visuals support some features, such as export to PowerPoint / PDF and email subscriptions with rendered images.\n\nAdmins can control custom visuals in the admin portal tenant settings:\n\n- Allow or block visuals created with the SDK.\n- Allow **only certified** visuals.\n- Add approved visuals to the organizational store.\n\nIn a bank or hospital, expect only organizational or certified visuals to be allowed.",
      tip: "When a visual shows a warning 'This visual can't be displayed' in the Service, the admin probably blocked uncertified visuals.",
    },
    {
      heading: "Popular custom visuals",
      content: "- **Bullet Chart** – actual vs target in a compact bar, great for KPIs.\n- **Sankey Chart** – shows flows, e.g. orders moving from City to Category.\n- **Word Cloud** – text frequency, e.g. common words in customer feedback.\n- **Text Filter** – a search box slicer that filters a column by typed text.\n- **Chiclet / button-style slicers** – (largely replaced today by the built-in Button slicer).\n- **Gantt** – project timelines.\n- **Charticulator** – lets you design your own visual without code.\n\nVisuals from vendors like Zebra BI, Inforiver or Deneb (Vega-Lite) are very popular in finance and enterprise reporting.",
    },
    {
      heading: "When to use (and not use) a custom visual",
      content: "Use a custom visual when:\n\n- The built-in set truly cannot show the story (flows, bullet targets, Gantt).\n- The visual is certified or approved by your organization.\n- The vendor is active and updates the visual.\n\nAvoid it when:\n\n- A built-in visual can do the job (for example, the new Button slicer instead of an old chiclet slicer).\n- The visual is slow with large data, or limits the number of rows it can show.\n- It requires a paid licence nobody approved.\n\nAlways test performance with **Optimize > Performance analyzer** after adding a custom visual.",
    },
  ],
  examples: [
    {
      title: "Add the Bullet Chart from AppSource",
      scenario: "The sales manager wants to see Total Sales against a target for each Category in one compact visual.",
      table: {
        headers: ['Category', 'Total Sales', 'Sales Target'],
        rows: [
          ['Electronics', '8,25,000', '8,00,000'],
          ['Furniture', '4,50,000', '5,00,000'],
          ['Accessories', '2,30,000', '2,20,000'],
        ],
      },
      steps: [
        "In Report view, open the Visualizations pane and click the three dots (...) > Get more visuals",
        "Sign in if asked, type Bullet Chart in the search box and pick the Microsoft Bullet Chart (look for the Certified badge)",
        "Click Add; a confirmation appears and a new icon is added to the Visualizations pane",
        "Create the measures in the code box (Modeling > New measure)",
        "Click the new Bullet Chart icon; put Product[Category] in Category, Total Sales in Value, Sales Target in Target Value",
        "In the Format pane, set colours for the bands and turn on data labels",
      ],
      code: `Total Sales = SUM(Sales[SalesAmount])

Sales Target =
SWITCH(
    SELECTEDVALUE(Product[Category]),
    "Electronics", 800000,
    "Furniture", 500000,
    "Accessories", 220000
)`,
      result: "Three horizontal bullet bars; Electronics and Accessories cross their target markers, Furniture falls short.",
      explanation: "The Bullet Chart reads the Value and Target wells and draws a bar with a target marker. SWITCH on SELECTEDVALUE returns a different target for each category row (in real projects targets usually come from a Budget table you create).",
    },
    {
      title: "Import a visual from a .pbiviz file",
      scenario: "Your BI developer built a company-specific visual and sent you CompanyKPI.pbiviz.",
      steps: [
        "Save the .pbiviz file to your computer",
        "Visualizations pane > ... > Import a visual from a file",
        "Read the security warning (only import files from trusted sources) and click Import",
        "Browse to CompanyKPI.pbiviz and open it; a success message appears",
        "Click the new icon and add fields as described by the developer",
        "Save the .pbix; the visual is embedded in the file for anyone who opens it",
      ],
      result: "The company visual appears in the Visualizations pane and renders the data.",
      explanation: "A .pbiviz is a packaged visual. Importing embeds it into the report. Because uncertified code can do anything a web page can, only import files from trusted sources.",
    },
    {
      title: "Text Filter for searching customers",
      scenario: "With hundreds of customers, users want to type part of a name instead of scrolling a long slicer list.",
      table: {
        headers: ['Typed text', 'Customers matched', 'Total Sales'],
        rows: [
          ['Sharma', 'Amit Sharma, Neha Sharma', '62,000'],
          ['Traders', 'Pune Traders, Nashik Traders', '1,15,000'],
        ],
      },
      steps: [
        "Visualizations pane > ... > Get more visuals",
        "Search Text Filter (by Microsoft) and click Add",
        "Insert the Text Filter visual and drag Customer[Customer] into its Field well",
        "Add a Table visual with Customer[Customer] and Total Sales",
        "Type Sharma in the Text Filter box and press Enter",
      ],
      result: "The table shows only customers whose name contains the typed text, and totals update.",
      explanation: "Text Filter applies a 'contains' filter on the chosen column, which then filters other visuals through the normal relationships.",
    },
  ],
  interview: [
    { q: "What is a custom visual in Power BI?", a: "An additional visual packaged as a .pbiviz file, built with the Power BI Visuals SDK, that you can add to a report from AppSource, from a file, or from the organizational store.", level: 'Easy' },
    { q: "How do you add a custom visual from AppSource in Power BI Desktop?", a: "Visualizations pane > ... > Get more visuals, search for the visual and click Add. It then appears as an icon in the Visualizations pane.", level: 'Easy' },
    { q: "What does certified mean for a custom visual?", a: "Microsoft has reviewed its code. It does not access external services or resources, meets coding standards and supports features like export to PowerPoint/PDF and email subscriptions.", level: 'Medium' },
    { q: "What are organizational visuals?", a: "Visuals uploaded and approved by a Power BI admin in the admin portal. They appear under 'My organization' in Get more visuals and can be centrally updated or disabled.", level: 'Medium' },
    { q: "Does a colleague need to install the custom visual to open your report?", a: "No. Custom visuals are embedded inside the .pbix and the published report, unless the admin blocks that visual type in the tenant.", level: 'Medium' },
    { q: "Scenario: a report with a custom visual works in Desktop but the visual shows an error in the Service. Why?", a: "The tenant admin settings may block uncertified or non-organizational visuals. Check Admin portal > Tenant settings > Power BI visuals, or replace it with a certified/organizational version.", level: 'Hard' },
    { q: "Scenario: a client wants a fancy visual from an unknown vendor in a banking report. What do you advise?", a: "Prefer a built-in or certified visual. If needed, get it reviewed and approved by IT, add it as an organizational visual, test performance and confirm licensing. Uncertified visuals can send data externally.", level: 'Hard' },
  ],
  practice: [
    { task: "Add the Sankey Chart custom visual and show flow from Customer[City] to Product[Category] using Total Sales.", hint: "Source = City, Destination = Category, Weight = Total Sales.", solution: "Get more visuals > search Sankey Chart > Add. Put Customer[City] in Source, Product[Category] in Destination and Total Sales in Weight." },
    { task: "Pin a custom visual so it stays in the Visualizations pane for new reports.", hint: "Right-click the visual icon.", solution: "Right-click the custom visual icon in the Visualizations pane > Pin to visualizations pane." },
    { task: "Remove a custom visual you no longer need from a report.", hint: "Delete all visuals that use it first.", solution: "Delete the visuals on the canvas that use it, then right-click its icon in the Visualizations pane > Unpin this visual / Remove a visual." },
    { task: "Measure the performance cost of a custom visual vs a built-in bar chart.", hint: "Optimize ribbon.", solution: "Optimize > Performance analyzer > Start recording > Refresh visuals. Compare the duration of the custom visual and the bar chart (DAX query, visual display, other)." },
  ],
  quiz: [
    { question: "What file extension do Power BI custom visuals use?", options: [".pbix", ".pbit", ".pbiviz", ".pbids"], answer: 2, explanation: ".pbiviz is the packaged custom visual format." },
    { question: "Where do you find AppSource visuals in Power BI Desktop?", options: ["File > Options", "Visualizations pane > ... > Get more visuals", "Home > Get data", "Modeling > New parameter"], answer: 1, explanation: "Get more visuals opens the AppSource marketplace." },
    { question: "Who manages organizational visuals?", options: ["Each report author", "Power BI admins in the admin portal", "Microsoft support", "Gateway administrators"], answer: 1, explanation: "Admins upload and manage organizational visuals." },
    { question: "A certified visual means:", options: ["It is free", "Microsoft reviewed its code for security and quality", "It works only in Desktop", "It is built by Microsoft only"], answer: 1, explanation: "Certification is a Microsoft code review; third parties can be certified too." },
    { question: "Best first step before choosing a custom visual:", options: ["Check if a built-in visual already does the job", "Disable certified visuals", "Convert the model to DirectQuery", "Export data to Excel"], answer: 0, explanation: "Built-in visuals are supported, fast and always allowed." },
  ],
};
