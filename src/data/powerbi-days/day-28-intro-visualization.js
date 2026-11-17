export default {
  id: 'day-28-intro-visualization',
  title: 'Introduction to Visualization, Charts and Visual Selection',
  module: 'Module 5: Data Visualization',
  day: 28,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'A good visual answers a business question at a glance. Today you learn how the Visualizations pane works (Build visual wells, Format visual, Analytics), how to pick the right chart for comparison, trend, part-to-whole, distribution and KPI questions, and the basic design rules for a clean report page.',
  objectives: [
    'Navigate the Visualizations pane: Build visual (field wells), Format visual and Analytics',
    'Create, convert and resize a visual on the report canvas',
    'Choose the right visual for comparison, trend, composition, relationship and single-number questions',
    'Apply basic design rules: layout, colors, titles, labels and number formatting',
    'Understand cross-filtering between visuals on the same page',
  ],
  theory: [
    {
      heading: 'Why visualization matters',
      content:
        `People understand pictures much faster than tables of numbers. A table with 24 monthly values hides the trend; a line chart shows it in one second.\n\nA Power BI visual should:\n- Answer **one clear question** ("Which category sells most?", "Are sales growing?")\n- Show the **right level of detail** - not every column of the data\n- Use **consistent colors and formats** across the report\n\nAnalogy: a report page is like a newspaper front page. The headline numbers (cards) are at the top, the main story (trend chart) is big, supporting details (tables, small charts) are below.`,
    },
    {
      heading: 'The Visualizations pane: Build, Format, Analytics',
      content:
        `In **Report view** the Visualizations pane (right side) has three tabs at the top:\n\n1. **Build visual** (icon with bars and a plus): the gallery of visual icons and the **field wells** (X-axis, Y-axis, Legend, Values, Tooltips...). Drag fields from the **Data** pane into the wells.\n2. **Format visual** (paint brush): split into **Visual** (axes, legend, data labels, colors, lines) and **General** (title, size and position, effects like background, border, shadow, header icons, tooltips).\n3. **Analytics** (magnifier): reference lines such as constant line, average line, trend line, min/max lines, forecast (available for some visuals like line charts).\n\nHow to add a visual:\n- Click an empty part of the canvas, then click a visual icon in the gallery, then drag fields into wells; or\n- Tick a field checkbox in the Data pane - Power BI picks a default visual (often a table or column chart).\n\nTo **change the type** of an existing visual: select it and click another icon in the gallery. Fields move into matching wells.\n\nUse the **search box** in the Format pane to find any setting quickly (type "data labels").`,
      tip: 'Implicit measures: dragging a numeric column (Sales[SalesAmount]) into Values creates an automatic Sum. In real projects prefer explicit measures like [Total Sales] for consistency and reuse.',
    },
    {
      heading: 'Choosing the right visual',
      content: 'Start from the question, not from the chart you like. The main question types and the visuals that answer them:',
      points: [
        '**Comparison between categories** (Which city sells most?) -> Clustered bar chart (long names, many items) or Clustered column chart (few items)',
        '**Trend over time** (How are sales moving month by month?) -> Line chart; Area chart for volume; Column chart for few periods',
        '**Part-to-whole / composition** (What share does each category have?) -> Donut/Pie for 2-5 slices, Stacked bar/column or 100% stacked, Treemap for many items',
        '**Single key number** (What is total sales?) -> Card; KPI visual (value vs target with trend); Gauge (progress to target)',
        '**Exact values / detail** -> Table; Matrix for rows x columns with subtotals',
        '**Relationship between two measures** (Does discount drive quantity?) -> Scatter chart',
        '**Process stages** (Leads -> Orders) -> Funnel chart',
        '**Geography** -> Map / Filled map / Azure Map',
        '**Actual vs target over time** -> Line and clustered column chart (columns = actual, line = target)',
      ],
    },
    {
      heading: 'Design rules for clean reports',
      content:
        `1. **Layout in a Z pattern**: eyes move from top-left to right, then down. Put KPI cards across the top, main chart in the middle, detail at the bottom. Slicers on the left or top.\n2. **Less is more**: 5-8 visuals per page. Remove gridlines, borders and backgrounds you do not need.\n3. **Meaningful titles**: "Sales by City (2024)" instead of "Sum of SalesAmount by City".\n4. **Sort** bars from largest to smallest (visual header ... > Sort axis).\n5. **Consistent colors**: one color per category across all visuals; use a strong color only to highlight. Set a theme in View > Themes.\n6. **Number formatting**: display units (Thousands, Lakhs via custom format), no unnecessary decimals. Set the format once on the measure (Measure tools > Format).\n7. **Start bar/column axes at zero** - cutting the axis exaggerates differences.\n8. **Accessibility**: enough contrast, do not rely on red/green only, add alt text (Format > General > Alt text).\n\nAlign visuals with **Format > Align** (ribbon) and set exact size in **Format visual > General > Properties > Size and position**.`,
    },
    {
      heading: 'Interactions: cross-filtering and cross-highlighting',
      content:
        `Visuals on the same page are connected. When you click a bar for "Electronics" in one chart:\n- **Cross-highlight** (default for bar/column charts): other charts dim the non-Electronics part and highlight the Electronics part.\n- **Cross-filter**: other visuals are filtered to show only Electronics values.\n\nChange this with **Format** ribbon tab > **Edit interactions** (select the source visual first). Each other visual shows small icons: **Filter**, **Highlight** or **None**.\n\nCtrl+click selects several data points. Click the same point again (or an empty area of the visual) to clear the selection.`,
    },
    {
      heading: 'Sample numbers for this module',
      content:
        `All visual examples in Module 5 use the shared model (Sales, Product, Customer, Date) and the 8-row mini sample from Day 23, so you can check what you see:\n- Sales by Category: Electronics 2,30,000; Furniture 20,000; Accessories 7,000\n- Sales by City: Pune 1,20,000; Nashik 1,10,000; Nagpur 14,000; Mumbai 13,000\n- Sales by Segment: Corporate 2,30,000; Retail 27,000\n- Sales by Year: 2023 1,17,000; 2024 1,40,000\n- Monthly 2024: Jan 20,000; Feb 58,000; Mar 62,000; 2023: Jan 1,00,000; Feb 5,000; Mar 12,000\n\nCreate the base measures first: Total Sales = SUM(Sales[SalesAmount]), Total Cost = SUM(Sales[Cost]), Total Profit = [Total Sales] - [Total Cost], Total Quantity = SUM(Sales[Quantity]).`,
    },
  ],
  examples: [
    {
      title: 'Build your first visual: Sales by Category',
      scenario: 'Create a clustered column chart of Total Sales by Category and give it a clear title.',
      table: {
        headers: ['Category', 'Total Sales'],
        rows: [
          ['Electronics', '2,30,000'],
          ['Furniture', '20,000'],
          ['Accessories', '7,000'],
        ],
      },
      steps: [
        'Report view > click an empty area of the canvas',
        'Visualizations pane > Build visual > click the Clustered column chart icon',
        'Drag Product[Category] to the X-axis well',
        'Drag the [Total Sales] measure to the Y-axis well',
        'Visual header ... (More options) > Sort axis > Total Sales, then Sort descending',
        'Format visual > General > Title > Text: Sales by Category',
        'Format visual > Visual > Data labels: On',
      ],
      result: 'Three columns sorted high to low: Electronics, Furniture, Accessories with data labels 230K, 20K, 7K (default display units Auto).',
      explanation:
        'Category is a text field so it goes on the axis; the measure provides the height. Sorting descending makes the comparison instant.',
    },
    {
      title: 'Pick the visual for each business question',
      scenario: 'A manager sends five questions. Choose and build the right visual for each.',
      table: {
        headers: ['Question', 'Visual', 'Wells'],
        rows: [
          ['What are total sales?', 'Card', 'Fields: [Total Sales]'],
          ['How did sales move month by month?', 'Line chart', 'X-axis: Date[YearMonth]; Y-axis: [Total Sales]'],
          ['Which city sells the most?', 'Clustered bar chart', 'Y-axis: Customer[City]; X-axis: [Total Sales]'],
          ['What share do Corporate vs Retail have?', 'Donut chart', 'Legend: Customer[Segment]; Values: [Total Sales]'],
          ['Exact sales by Category and Year?', 'Matrix', 'Rows: Product[Category]; Columns: Date[Year]; Values: [Total Sales]'],
        ],
      },
      steps: [
        'Insert each visual from the Build visual gallery',
        'Drag fields into the wells listed in the table',
        'Rename each title in Format visual > General > Title',
        'Arrange: card top-left, line chart large in the middle, bar and donut on the right, matrix at the bottom',
      ],
      result: 'Card = 2,57,000; Bar chart Pune 1,20,000 at top; Donut Corporate 89.49% / Retail 10.51%; Matrix shows 2023 and 2024 columns.',
      explanation:
        'Each visual matches a question type: single number, trend, comparison, part-to-whole and exact detail.',
    },
    {
      title: 'Change visual type and fix a bad choice',
      scenario: 'Someone built a pie chart of sales by YearMonth (6 slices). Convert it to a visual that shows the trend.',
      table: {
        headers: ['YearMonth', 'Total Sales'],
        rows: [
          ['2023-01', '1,00,000'],
          ['2023-02', '5,000'],
          ['2023-03', '12,000'],
          ['2024-01', '20,000'],
          ['2024-02', '58,000'],
          ['2024-03', '62,000'],
        ],
      },
      steps: [
        'Select the pie chart on the canvas',
        'In Build visual click the Line chart icon',
        'If Date[YearMonth] landed in the Legend well, drag it to the X-axis well; keep [Total Sales] in the Y-axis well',
        'Visual header ... > Sort axis > YearMonth, Sort ascending',
        'Format visual > Visual > Markers: On',
      ],
      result: 'A line from 2023-01 to 2024-03 shows a big drop after Jan 2023 and steady growth in 2024.',
      explanation:
        'Time should flow left to right. A pie chart hides order and makes similar slices hard to compare.',
    },
    {
      title: 'Edit interactions between visuals',
      scenario: 'Clicking a category in the column chart should FILTER the city bar chart, but should NOT change the total sales card.',
      table: {
        headers: ['Click on', 'City bar chart shows', 'Card shows'],
        rows: [
          ['Electronics', 'Pune 1,20,000; Nashik 1,10,000', '2,57,000 (unchanged)'],
          ['Furniture', 'Nagpur 12,000; Mumbai 8,000', '2,57,000 (unchanged)'],
        ],
      },
      steps: [
        'Select the Sales by Category column chart',
        'Ribbon: Format > Edit interactions',
        'On the city bar chart click the Filter icon (funnel)',
        'On the card click the None icon (circle with a line)',
        'Format > Edit interactions again to turn off edit mode, then click Electronics',
      ],
      result: 'The bar chart shows only Electronics sales per city; the card stays at the overall total.',
      explanation:
        'Edit interactions defines how the selected (source) visual affects each other visual: Filter, Highlight or None.',
    },
  ],
  interview: [
    {
      q: 'How do you decide which chart to use?',
      a: 'Start with the question type: comparison (bar/column), trend (line/area), part-to-whole (donut, stacked, treemap), single KPI (card, KPI, gauge), detail (table/matrix), relationship (scatter), process (funnel), location (map). Then consider the number of items and the audience.',
      level: 'Easy',
    },
    {
      q: 'What are the three tabs in the Visualizations pane?',
      a: 'Build visual (gallery + field wells), Format visual (Visual and General formatting) and Analytics (reference lines, trend line, forecast, etc.).',
      level: 'Easy',
    },
    {
      q: 'What is the difference between cross-filtering and cross-highlighting?',
      a: 'Cross-filtering removes data that does not match the selection from other visuals. Cross-highlighting keeps all data but highlights the matching part and dims the rest. You switch via Format > Edit interactions.',
      level: 'Medium',
    },
    {
      q: 'Why should you avoid pie charts with many slices?',
      a: 'Humans compare angles poorly; with more than about 5 slices labels overlap and similar slices look equal. A sorted bar chart is easier to read.',
      level: 'Easy',
    },
    {
      q: 'What is an implicit measure and why avoid it?',
      a: 'A measure Power BI creates automatically when you drag a numeric column into a value well (e.g. Sum of SalesAmount). It cannot be reused in other DAX and is inconsistent across visuals. Explicit DAX measures are reusable, documented and formatted once.',
      level: 'Medium',
    },
    {
      q: 'Scenario: Your report page has 18 visuals and loads slowly. What would you do?',
      a: 'Reduce to the essential visuals (5-8), move detail to drill-through or tooltip pages, combine cards into a multi-row card or new card visual, use bookmarks to switch views, and check Performance Analyzer for slow visuals.',
      level: 'Hard',
    },
    {
      q: 'What design principles do you follow for dashboards?',
      a: 'Z-pattern layout with KPIs at top, consistent theme colors, meaningful titles, sorted bars, axes starting at zero, minimal clutter, proper number formats, enough contrast and alt text for accessibility.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Build a clustered bar chart of Total Sales by City sorted descending.',
      hint: 'Bar chart: Y-axis = City, X-axis = measure.',
      solution: `1. Insert Clustered bar chart
2. Y-axis: Customer[City]; X-axis: [Total Sales]
3. ... > Sort axis > Total Sales > Sort descending
Result: Pune 1,20,000; Nashik 1,10,000; Nagpur 14,000; Mumbai 13,000`,
    },
    {
      task: 'Add a card for Total Sales and a card for Total Profit at the top of the page.',
      hint: 'Card visual, Fields well.',
      solution: `Card 1 Fields: [Total Sales] -> 257K
Card 2 Fields: [Total Profit] -> 57.8K (Format > Visual > Callout value > Display units: Thousands, decimals 1)`,
    },
    {
      task: 'Decide the best visual for: "Show how sales split between 3 categories" and build it.',
      hint: 'Few categories, part-to-whole.',
      solution: `Donut chart: Legend = Product[Category]; Values = [Total Sales]
Electronics 89.49%, Furniture 7.78%, Accessories 2.72%. (A sorted bar chart is also acceptable.)`,
    },
    {
      task: 'Set the city bar chart to highlight (not filter) when a category is clicked.',
      hint: 'Format > Edit interactions.',
      solution: `Select the category chart > Format > Edit interactions > on the city chart click Highlight.`,
    },
  ],
  quiz: [
    {
      question: 'Which visual is best for showing a trend over 24 months?',
      options: ['Pie chart', 'Line chart', 'Card', 'Treemap'],
      answer: 1,
      explanation: 'Line charts show continuous change over time.',
    },
    {
      question: 'Where do you change a visual title?',
      options: ['Build visual > Legend', 'Format visual > General > Title', 'Analytics > Title', 'Modeling > Title'],
      answer: 1,
      explanation: 'Titles are under the General section of the Format visual tab.',
    },
    {
      question: 'Which ribbon option controls how a visual affects others on the page?',
      options: ['View > Themes', 'Format > Edit interactions', 'Home > Transform data', 'Modeling > Manage roles'],
      answer: 1,
      explanation: 'Edit interactions sets Filter, Highlight or None for each target visual.',
    },
    {
      question: 'For a single big number like Total Sales, use a:',
      options: ['Scatter chart', 'Matrix', 'Card', 'Funnel'],
      answer: 2,
      explanation: 'Cards are designed to show one value prominently.',
    },
    {
      question: 'Which Visualizations pane tab contains trend lines and constant lines?',
      options: ['Build visual', 'Format visual', 'Analytics', 'Filters'],
      answer: 2,
      explanation: 'Reference lines are added from the Analytics tab.',
    },
  ],
};
