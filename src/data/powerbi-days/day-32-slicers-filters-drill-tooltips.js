export default {
  id: 'day-32-slicers-filters-drill-tooltips',
  title: 'Slicers, Filters, Drill Down, Drill Through, Tooltips',
  module: 'Module 5: Data Visualization',
  day: 32,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Interactivity turns a static report into an exploration tool. Today you add slicers for users, configure visual, page and report filters in the Filters pane, drill down through hierarchies, drill through to a detail page, and enrich tooltips - including report page tooltips.',
  objectives: [
    'Add and configure slicers (list, tile, dropdown, between, relative date) and sync them across pages',
    'Use the Filters pane at visual, page and all-pages level with Basic, Advanced and Top N filtering',
    'Drill down and up through a hierarchy in charts and matrices',
    'Set up a drill-through page with a Back button',
    'Add extra fields to tooltips and build a report page tooltip',
  ],
  theory: [
    {
      heading: 'Slicers: filters the user can see and click',
      content:
        `A **slicer** is a visual on the canvas that filters other visuals on the page. Users click values instead of opening the Filters pane.\n\n**Build**: Build visual > **Slicer** > drag one field into the **Field** well (e.g. Customer[City]). You can add several fields to create a hierarchy slicer (Category > Product).\n\n**Slicer styles** (Format visual > Visual > **Slicer settings > Options > Style**):\n- **Vertical list** - checkboxes; good for 3-15 values\n- **Tile** - buttons in a row; good for 2-6 values (Segment, Year)\n- **Dropdown** - saves space for long lists; search is available\n- For numbers/dates: **Between** (range slider), **Before**, **After**, **List**, **Relative date** (e.g. last 3 months), **Relative time**\n\n**Selection** (Slicer settings > Selection): **Single select**, **Multi-select with Ctrl**, **Show "Select all" option**.\n\nA newer **Button slicer** visual is also available in current Power BI Desktop for button-style designs with images and states.\n\n**Sync slicers**: View > **Sync slicers** pane. For each page tick **Sync** (filter that page) and **Visible** (show the slicer there). A Year slicer then filters all pages.\n\n**Edit interactions** (Format > Edit interactions) lets you stop a slicer from filtering a specific visual.`,
      tip: 'Use slicers for the 2-4 most common user choices (Year, City, Category). Put rarely used filters in the Filters pane to keep the page clean.',
    },
    {
      heading: 'The Filters pane: visual, page and report level',
      content:
        `The **Filters** pane (between the canvas and the Visualizations pane) has three areas:\n- **Filters on this visual** - only the selected visual (it also lists the visual fields automatically)\n- **Filters on this page** - all visuals on the page\n- **Filters on all pages** - the entire report\n\nDrag a field from the Data pane into the right area. Filter types:\n- **Basic filtering** - tick values from a list\n- **Advanced filtering** - conditions: is, is not, contains, starts with, is greater than, is blank... with And/Or\n- **Top N** - show Top/Bottom N items **by value** (a measure), e.g. Top 2 customers by [Total Sales] (visual level only)\n- For dates: **Relative date** (in the last 12 months)\n\nAs a report author you can **lock** a filter (users see but cannot change it) or **hide** it (users do not see it) using the lock and eye icons on each filter card. Hide the whole pane in Format pane > **Filter pane** settings, or in File > Options > Report settings.\n\n**Slicer vs filter**: slicers are visible on the canvas and easy for users; filters pane is good for fixed or advanced conditions (Top N, "Category is not Furniture").`,
    },
    {
      heading: 'Drill down and drill up',
      content:
        `**Drill down** moves from a summary level to a more detailed level within the **same visual** using a hierarchy: Year > Quarter > Month > Day, or Category > Product.\n\nCreate a hierarchy by putting several fields in one axis well (e.g. X-axis: Date[Year], Date[Quarter], Date[Month]), or right-click a field in the Data pane > **Create hierarchy**.\n\nDrill icons in the visual header (hover the visual):\n- **Up arrow** - Drill up one level\n- **Down arrow in a circle** - **Drill mode on**: clicking a data point drills into it (e.g. click 2024 -> its quarters)\n- **Double down arrow** - **Go to the next level** in the hierarchy for all data\n- **Forked arrow** - **Expand all down one level** (shows both levels, e.g. "2024 Q1")\n\nRight-click a data point > **Drill down** does the same without turning on drill mode. The ribbon also has these commands under **Data / Drill** (visual tools).\n\nAnalogy: drill down is like zooming into a map - country -> state -> city - on the same screen.`,
    },
    {
      heading: 'Drill through: jump to a detail page',
      content:
        `**Drill through** takes the user from a summary page to a **different page** filtered on the clicked item. Example: right-click "Pune" in a bar chart -> open the **Customer Details** page showing only Pune.\n\nSetup:\n1. Create a new page (e.g. "City Details") and build the detail visuals (table of orders, cards).\n2. On that page, with nothing selected, find the **Drill through** section at the bottom of the Build visual pane and drag the field (Customer[City]) into **Add drill-through fields here**.\n3. Power BI automatically adds a **Back** button (top-left) on the target page.\n4. **Keep all filters** (On by default): also carry over other filters from the source (slicers, filters). **Cross-report**: allow drill-through from other reports in the workspace.\n\nUse: on the source page right-click a data point that contains City > **Drill through > City Details**. In Power BI Desktop, Ctrl+click the Back button to return (in the Service a normal click).\n\nA button can also trigger drill-through: Insert > Buttons > Blank, Action type = **Drill through**, Destination = City Details.`,
    },
    {
      heading: 'Tooltips: default, extra fields and report page tooltips',
      content:
        `A **tooltip** is the box that appears when you hover over a data point.\n\n1. **Default tooltip** - shows the axis value and the measures in the visual.\n2. **Extra fields** - drag more measures into the **Tooltips** well (e.g. [Total Profit], [Orders]). They show on hover without adding bars.\n3. **Report page tooltip** - a small report page shown as the tooltip, with its own visuals:\n   - New page > Format page (paint brush with page selected) > **Page information > Allow use as tooltip: On**\n   - **Canvas settings > Type: Tooltip** (320 x 240 px)\n   - Build small visuals on it (card, mini chart)\n   - Optional: drag fields into the page **Tooltip** fields area so it only appears for visuals using them\n   - On the main visual: Format visual > **General > Tooltips > Type: Report page; Page: <tooltip page name>**\n\nTurn tooltips off for a visual in Format visual > General > Tooltips: Off. Modern visual tooltips (with drill actions) can be enabled in File > Options > Preview/Report settings.`,
    },
  ],
  examples: [
    {
      title: 'Slicers: City as a dropdown, Segment as tiles, Year synced',
      scenario: 'Add three slicers to the Sales Overview page and make the Year slicer filter every page.',
      table: {
        headers: ['Selection', 'Total Sales card shows'],
        rows: [
          ['Nothing selected', '2,57,000'],
          ['Segment = Retail', '27,000'],
          ['Segment = Retail and Year = 2024', '10,000'],
          ['City = Pune (Segment cleared)', '1,20,000'],
        ],
      },
      steps: [
        'Build visual > Slicer; Field: Customer[City]; Format visual > Visual > Slicer settings > Options > Style: Dropdown',
        'Build visual > Slicer; Field: Customer[Segment]; Slicer settings > Options > Style: Tile',
        'Build visual > Slicer; Field: Date[Year]; Style: Tile; Slicer settings > Selection > Single select: On',
        'Select the Year slicer > View > Sync slicers > tick Sync and Visible for all pages',
        'Test the selections in the table and watch the Total Sales card',
      ],
      result: 'Card values change with selections (Retail 27,000; Retail + 2024 = 10,000; Pune = 1,20,000). Year selection carries to other pages.',
      explanation:
        'Slicers on the same page filter all visuals by default. Sync slicers copies the Year selection to the pages you tick.',
    },
    {
      title: 'Filters pane: Top N and page filter',
      scenario: 'A bar chart should show only the top 2 customers by sales, and the whole page should exclude Accessories.',
      table: {
        headers: ['Customer', 'Total Sales (all)', 'Total Sales (excluding Accessories)'],
        rows: [
          ['Asha', '1,20,000', '1,20,000'],
          ['Kiran', '1,10,000', '1,10,000'],
        ],
      },
      steps: [
        'Build a Clustered bar chart: Y-axis Customer[Customer], X-axis [Total Sales]',
        'With the chart selected, open the Filters pane > Filters on this visual > expand Customer',
        'Filter type: Top N; Show items: Top 2; By value: drag [Total Sales]; click Apply filter',
        'Drag Product[Category] into Filters on this page; Basic filtering: tick Select all, then untick Accessories',
        'Hover the page filter card and click the lock icon so report users cannot change it',
      ],
      result: 'Only Asha (1,20,000) and Kiran (1,10,000) appear; Neha and Ravi drop out. Excluding Accessories does not change their totals (they bought no mice).',
      explanation:
        'Top N is evaluated with the measure in the current filter context. The page filter applies to every visual on the page, unlike the visual-level filter.',
    },
    {
      title: 'Drill down: Year > Quarter > Month',
      scenario: 'Let users start at yearly sales and drill into 2024 quarters and months.',
      table: {
        headers: ['Level', 'What you see'],
        rows: [
          ['Year', '2023: 1,17,000 | 2024: 1,40,000'],
          ['Drill into 2024 -> Quarter', 'Q1: 1,40,000 (Q2-Q4 no sales)'],
          ['Drill into Q1 -> Month', 'Jan 20,000 | Feb 58,000 | Mar 62,000'],
        ],
      },
      steps: [
        'Build visual > Clustered column chart; Y-axis: [Total Sales]',
        'X-axis: drag Date[Year], then Date[Quarter], then Date[Month] (in this order)',
        'Hover the visual and click the down arrow icon (Drill mode on)',
        'Click the 2024 column - the chart shows 2024 quarters',
        'Click Q1 - the chart shows Jan, Feb, Mar of 2024',
        'Click the up arrow to drill back up; try the forked arrow (Expand all down one level) to see "2023 Q1", "2024 Q1"',
      ],
      result: 'Drill path 2024 -> Q1 -> Jan 20,000, Feb 58,000, Mar 62,000.',
      explanation:
        'Multiple fields in one axis create a hierarchy. Drill mode filters to the clicked item; Expand shows the next level for all items.',
    },
    {
      title: 'Drill through to a City Details page',
      scenario: 'From the Sales by City chart, right-click a city to open a page with its order list.',
      table: {
        headers: ['OrderID', 'OrderDate', 'Customer', 'Product', 'SalesAmount'],
        rows: [
          ['1001', '10-Jan-2023', 'Asha', 'Laptop', '1,00,000'],
          ['1004', '08-Jan-2024', 'Asha', 'Phone', '20,000'],
          ['Total', '', '', '', '1,20,000'],
        ],
      },
      steps: [
        'Add a new page and rename it City Details (double-click the page tab)',
        'On City Details: add a Table with Sales[OrderID], Sales[OrderDate], Customer[Customer], Product[Product], [Total Sales]',
        'Add a Card with a title measure: Selected City = SELECTEDVALUE(Customer[City], "All Cities")',
        'Click an empty area of the page; in Build visual > Drill through drag Customer[City] into Add drill-through fields here',
        'Check that a Back button appeared at the top-left; keep "Keep all filters" On',
        'Go to the overview page, right-click the Pune bar > Drill through > City Details',
        'Ctrl+click the Back button to return',
      ],
      result: 'City Details opens filtered to Pune: 2 orders (1001, 1004) totalling 1,20,000; the card shows "Pune".',
      explanation:
        'The drill-through field passes the clicked City as a filter to the target page. Keep all filters also passes slicer selections such as Year.',
    },
    {
      title: 'Tooltips: extra fields and a report page tooltip',
      scenario: 'Hovering a category should show profit and margin, and later a mini chart of sales by year.',
      table: {
        headers: ['Hover on', 'Tooltip shows'],
        rows: [
          ['Electronics', 'Total Sales 2,30,000 | Total Profit 50,000 | Margin % 21.7%'],
          ['Furniture', 'Total Sales 20,000 | Total Profit 5,000 | Margin % 25.0%'],
          ['Accessories', 'Total Sales 7,000 | Total Profit 2,800 | Margin % 40.0%'],
        ],
      },
      steps: [
        'Select the Sales by Category column chart',
        'Drag [Total Profit] and [Margin %] into the Tooltips well; hover a column to check',
        'Add a new page named TT Category; Format page > Page information > Allow use as tooltip: On',
        'Format page > Canvas settings > Type: Tooltip',
        'On TT Category add a Card ([Total Sales]) and a small column chart (X-axis Date[Year], Y-axis [Total Sales])',
        'Back on the main page, select the category chart > Format visual > General > Tooltips > Type: Report page; Page: TT Category',
        'Hover Electronics',
      ],
      result: 'Hovering Electronics shows the mini page: card 230K and columns 2023 = 1,00,000, 2024 = 1,30,000.',
      explanation:
        'The tooltip page is filtered by the hovered data point (Category = Electronics), so its visuals show only that category.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a slicer and a filter in the Filters pane?',
      a: 'Both filter data. Slicers are visuals on the canvas, visible and easy to use, and can be synced across pages. Filters pane filters can be visual, page or report level, support advanced conditions and Top N, and can be locked or hidden from users.',
      level: 'Easy',
    },
    {
      q: 'What are the three levels of filters in Power BI Desktop?',
      a: 'Visual-level (Filters on this visual), page-level (Filters on this page) and report-level (Filters on all pages). Drill-through filters are a fourth kind applied when drilling through.',
      level: 'Easy',
    },
    {
      q: 'Drill down vs drill through - explain.',
      a: 'Drill down navigates a hierarchy inside the same visual (Year -> Quarter -> Month). Drill through navigates to a different report page filtered on the selected item (City -> City Details page).',
      level: 'Easy',
    },
    {
      q: 'How do you set up a drill-through page?',
      a: 'Create the target page, drag the field(s) into the Drill through well of that page, decide Keep all filters / Cross-report, and use the auto-created Back button. Users right-click a data point > Drill through > page.',
      level: 'Medium',
    },
    {
      q: 'How do you make one slicer filter all pages?',
      a: 'View > Sync slicers, select the slicer, tick Sync (and Visible if it should appear) for each page. Or use a report-level filter if users do not need to change it.',
      level: 'Medium',
    },
    {
      q: 'How do you show the Top 5 products in a chart?',
      a: 'Filters on this visual > Product > Filter type Top N > Top 5 by value [Total Sales] > Apply. Alternatively a RANKX/TOPN measure.',
      level: 'Medium',
    },
    {
      q: 'What is a report page tooltip and how do you create one?',
      a: 'A small page used as a tooltip. Set Page information > Allow use as tooltip On, Canvas type Tooltip, build visuals, then on a visual set Format > General > Tooltips > Type Report page and choose the page.',
      level: 'Medium',
    },
    {
      q: 'Scenario: A slicer on Year should not filter the "All-time Sales" card. How?',
      a: 'Select the slicer > Format > Edit interactions > click None on the card. Or write the card measure with REMOVEFILTERS(\'Date\').',
      level: 'Medium',
    },
    {
      q: 'Scenario: Users complain the drill-through option does not appear when they right-click a chart. What do you check?',
      a: 'The source visual must contain the drill-through field (or a field from the same table when using that option); the target page must have the field in its Drill through well; and the data type/field must match. Also check that a single data point is right-clicked.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Add a Between slicer on Sales[SalesAmount] and find the orders between 10,000 and 60,000.',
      hint: 'Numeric field slicers default to Between.',
      solution: `Slicer Field: Sales[SalesAmount], Style: Between, range 10,000 to 60,000.
Orders included: 1003 (12,000), 1004 (20,000), 1005 (50,000), 1008 (60,000) -> Total Sales 1,42,000`,
    },
    {
      task: 'Add a page-level Advanced filter: Customer[City] does not start with "N".',
      hint: 'Advanced filtering > does not start with.',
      solution: `Filters on this page > Customer[City] > Advanced filtering > does not start with "N" > Apply.
Remaining: Pune 1,20,000 + Mumbai 13,000 = 1,33,000`,
    },
    {
      task: 'Build a matrix with Category > Product rows and practise Expand all down one level vs Go to next level.',
      hint: 'Rows: Category then Product.',
      solution: `Expand all: shows Electronics with Laptop/Phone beneath, etc.
Go to next level: shows only products (Laptop, Phone, Chair, Mouse) without the category rows.`,
    },
    {
      task: 'Create a drill-through page "Product Details" using Product[Product].',
      hint: 'Add Product[Product] to the Drill through well of the new page.',
      solution: `Right-click Laptop in any visual > Drill through > Product Details:
orders 1001 (1,00,000) and 1005 (50,000) = 1,50,000`,
    },
    {
      task: 'Add [Orders] and [Total Quantity] to the Tooltips well of the Sales by City bar chart.',
      hint: 'Tooltips well under Build visual.',
      solution: `Hover Pune: Total Sales 1,20,000, Orders 2, Total Quantity 3
Hover Mumbai: 13,000, Orders 2, Quantity 12`,
    },
  ],
  quiz: [
    {
      question: 'Which slicer style is best for selecting one of 2-4 values like Segment?',
      options: ['Dropdown', 'Tile', 'Between', 'Relative date'],
      answer: 1,
      explanation: 'Tiles show each value as a button, ideal for a few options.',
    },
    {
      question: 'Where can you apply a Top N filter?',
      options: ['Filters on this visual', 'Sync slicers pane', 'Bookmarks pane', 'Model view'],
      answer: 0,
      explanation: 'Top N filtering is available at visual level.',
    },
    {
      question: 'What is created automatically when you add a drill-through field to a page?',
      options: ['A slicer', 'A Back button', 'A bookmark', 'A tooltip page'],
      answer: 1,
      explanation: 'Power BI adds a Back button to return to the source page.',
    },
    {
      question: 'Which icon shows both levels at once, e.g. "2024 Q1"?',
      options: ['Drill up', 'Drill mode on', 'Go to the next level', 'Expand all down one level'],
      answer: 3,
      explanation: 'Expand all down one level keeps the parent level and adds the child.',
    },
    {
      question: 'To use a page as a report page tooltip you must set:',
      options: ['Page view to Actual size', 'Page information > Allow use as tooltip: On', 'A drill-through field', 'Sync slicers'],
      answer: 1,
      explanation: 'Allow use as tooltip makes the page available as a tooltip.',
    },
  ],
};
