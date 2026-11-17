export default {
  id: 'day-30-pie-donut-treemap-funnel',
  title: 'Pie Chart, Donut Chart, Treemap, Funnel Chart',
  module: 'Module 5: Data Visualization',
  day: 30,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Pie, donut and treemap charts show how a whole is divided into parts; the funnel chart shows how values shrink through the stages of a process. Today you build each one with exact wells and formatting, and learn their limits so you use them only where they truly help.',
  objectives: [
    'Build pie and donut charts with Legend, Values and Details wells and show percentage labels',
    'Build a treemap with Category and Details for hierarchical part-to-whole',
    'Build a funnel chart for stage-based processes and read conversion rates',
    'Know when NOT to use these charts and what to use instead',
  ],
  theory: [
    {
      heading: 'Part-to-whole thinking',
      content:
        `A **part-to-whole** question asks "what share of the total does each part have?" Examples: share of sales by segment, by category, by payment mode.\n\nRules before using a pie/donut/treemap:\n- The parts must **add up to a meaningful whole** (sales by category: yes; average price by category: no - averages do not add up).\n- There should be **few parts** for pie/donut (2-5). Many parts -> treemap or sorted bar chart.\n- No negative values (a pie cannot show losses).\n\nAnalogy: a pizza cut into slices - easy to see "half" or "a quarter", hard to compare two slices of 18% and 21%.`,
    },
    {
      heading: 'Pie chart and Donut chart',
      content:
        `**Wells** (Build visual): **Legend** (the category, e.g. Customer[Segment]), **Values** (the measure), **Details** (optional second level that splits each slice), **Tooltips**.\n\n**Donut** = pie with a hole in the centre. Same wells. The hole leaves space for a label (place a Card visual on top showing the total), and people compare arc lengths a little more easily than angles.\n\nUseful Format pane options (Format visual > Visual):\n- **Detail labels**: Label contents = *Category, percent of total* (or Data value, percent of total); Position = Outside / Inside / Prefer outside; Display units; Percentage decimal places.\n- **Slices**: color per slice.\n- **Legend**: on/off and position (turn off if detail labels already show categories).\n- **Rotation** (pie/donut): rotate the start angle.\n- **Spacing > Inner radius** (donut): size of the hole.\n\nSorting: ... > Sort by > the measure, descending, so the biggest slice starts at 12 o'clock and goes clockwise.`,
      tip: 'Add Product[Category] to Legend and [Total Sales] to Values - never put a numeric ID or date in Legend; you get hundreds of slices.',
    },
    {
      heading: 'Treemap',
      content:
        `A treemap shows parts as **nested rectangles**; the area of each rectangle is proportional to its value. It handles many items (20-50) and **two levels** of hierarchy well.\n\n**Wells**: **Category** (first level, e.g. Product[Category]), **Details** (second level, e.g. Product[Product]), **Values** (measure), **Tooltips**.\n\nWithout Details, Category rectangles are colored by category. With Details, each category becomes a block containing its products; colors still follow the category.\n\nYou can also put two fields in **Category** to create a drill-down hierarchy (Category -> Product) and use the drill arrows in the visual header.\n\nFormat options: **Data labels**, **Category labels** (on/off, font), **Colors** per category, **Legend**.\n\nLimitations: hard to compare rectangles of similar size and small rectangles lose labels. Good for spotting the largest items in a big list, not for exact comparison.`,
    },
    {
      heading: 'Funnel chart',
      content:
        `A funnel chart shows a **sequential process** where values decrease from stage to stage: website visits -> sign-ups -> quotes -> orders, or a recruitment pipeline.\n\n**Wells**: **Category** (stage), **Values** (measure), **Tooltips**.\n\nThe widest bar is the first stage; each bar width is relative to the first. Hovering shows **% of first** and **% of previous** (conversion rates), which are the real insights.\n\nImportant: stages must appear in **process order**, not alphabetical. The visual sorts by the measure (descending) by default, which works when every stage is smaller than the one before. Otherwise add a StageOrder column and use Sort by column.\n\nFormat options: **Colors** (Show all / Default color), **Data labels** (Label contents: Data value, Percent of first, Percent of previous), **Conversion rate label** on/off, **Category axis**.\n\nYou can also use a funnel for a sorted ranking (top customers by sales), but a bar chart usually communicates that better.`,
    },
    {
      heading: 'When NOT to use these charts',
      content: 'Common mistakes and better choices:',
      points: [
        'More than 5-6 slices in a pie/donut -> use a sorted bar chart or treemap',
        'Comparing shares across several years -> 100% stacked column (one column per year), not several pies',
        'Values that do not sum to a whole (averages, %, ratios) -> bar chart',
        'Exact comparison of similar values (21% vs 23%) -> bar chart with labels',
        'Funnel for categories without an order (cities) -> bar chart',
        '3D or exploded pies are not available in Power BI - and that is good',
      ],
    },
  ],
  examples: [
    {
      title: 'Pie chart: Sales share by Segment',
      scenario: 'Show how much of total sales comes from Corporate vs Retail customers.',
      table: {
        headers: ['Segment', 'Total Sales', '% of Total'],
        rows: [
          ['Corporate', '2,30,000', '89.49%'],
          ['Retail', '27,000', '10.51%'],
        ],
      },
      steps: [
        'Report view > Build visual > Pie chart',
        'Legend: Customer[Segment]',
        'Values: [Total Sales]',
        'Format visual > Visual > Detail labels > Label contents: Category, percent of total',
        'Detail labels > Percentage decimal places: 1',
        'Format visual > Visual > Legend: Off (labels already show the segment)',
        'Format visual > General > Title > Text: Sales Share by Segment',
      ],
      result: 'Two slices labelled "Corporate 89.5%" and "Retail 10.5%".',
      explanation:
        'Two parts adding up to the total is the perfect case for a pie: the message ("Corporate is ~90%") is clear at a glance.',
    },
    {
      title: 'Donut chart with a centre total',
      scenario: 'Show category share in a donut with the total sales value in the middle.',
      table: {
        headers: ['Category', 'Total Sales', '% of Total'],
        rows: [
          ['Electronics', '2,30,000', '89.49%'],
          ['Furniture', '20,000', '7.78%'],
          ['Accessories', '7,000', '2.72%'],
        ],
      },
      steps: [
        'Build visual > Donut chart',
        'Legend: Product[Category]; Values: [Total Sales]',
        'Format visual > Visual > Spacing > Inner radius: about 60%',
        'Format visual > Visual > Detail labels > Label contents: Category, percent of total; Position: Outside',
        'Visual header ... > Sort by > Total Sales > Sort descending',
        'Insert a Card visual with [Total Sales]; Format > General > Effects > Background: Off; place it in the centre of the donut',
        'Card: Format visual > Visual > Category label: Off',
      ],
      result: 'A donut with three arcs (Electronics dominating) and "257K" in the centre.',
      explanation:
        'The donut hole is used for the headline number, saving a separate card position on the page.',
    },
    {
      title: 'Pie with Details: Segment split by City',
      scenario: 'Show segment share and, inside each segment, which cities contribute.',
      table: {
        headers: ['Segment', 'City', 'Total Sales'],
        rows: [
          ['Corporate', 'Pune', '1,20,000'],
          ['Corporate', 'Nashik', '1,10,000'],
          ['Retail', 'Nagpur', '14,000'],
          ['Retail', 'Mumbai', '13,000'],
        ],
      },
      steps: [
        'Select the Segment pie chart from example 1',
        'Drag Customer[City] into the Details well',
        'Format visual > Visual > Detail labels > Label contents: Category, percent of total',
      ],
      result: 'Four slices: Pune 46.7%, Nashik 42.8% (Corporate shades), Nagpur 5.4%, Mumbai 5.1% (Retail shades).',
      explanation:
        'Details splits each legend slice into sub-slices and uses shades of the legend color, so you see both levels.',
    },
    {
      title: 'Treemap: Category and Product',
      scenario: 'Find the biggest products inside each category.',
      table: {
        headers: ['Category', 'Product', 'Total Sales'],
        rows: [
          ['Electronics', 'Laptop', '1,50,000'],
          ['Electronics', 'Phone', '80,000'],
          ['Furniture', 'Chair', '20,000'],
          ['Accessories', 'Mouse', '7,000'],
        ],
      },
      steps: [
        'Build visual > Treemap',
        'Category: Product[Category]',
        'Details: Product[Product]',
        'Values: [Total Sales]',
        'Format visual > Visual > Data labels: On; Display units: Thousands',
        'Format visual > Visual > Colors: set Electronics blue, Furniture orange, Accessories green',
      ],
      result: 'Electronics fills about 90% of the area, split into Laptop (larger) and Phone; Chair and Mouse are small blocks.',
      explanation:
        'Area is proportional to sales. The treemap instantly shows that Laptop alone is more than half of total sales.',
    },
    {
      title: 'Funnel chart: sales pipeline (extra table)',
      scenario: 'Create an extra table named Pipeline with Home > Enter data: columns Stage, StageOrder, Count. Show conversion through the stages.',
      table: {
        headers: ['StageOrder', 'Stage', 'Count', '% of first', '% of previous'],
        rows: [
          ['1', 'Leads', '400', '100%', '100%'],
          ['2', 'Qualified', '160', '40%', '40%'],
          ['3', 'Quotes Sent', '40', '10%', '25%'],
          ['4', 'Orders', '8', '2%', '20%'],
        ],
      },
      steps: [
        'Home > Enter data: create table Pipeline with the rows above, click Load',
        'Table view > select Stage column > Column tools > Sort by column > StageOrder',
        'Modeling > New measure: Pipeline Count = SUM(Pipeline[Count])',
        'Build visual > Funnel: Category = Pipeline[Stage]; Values = [Pipeline Count]',
        'Visual header ... > Sort axis > Stage, Sort ascending (process order)',
        'Format visual > Visual > Data labels > Label contents: Data value, percent of first',
        'Hover each bar to read % of previous in the tooltip',
      ],
      result: 'Four centred bars narrowing from 400 to 8. Orders bar label: "8 (2%)". Biggest drop-off is Quotes Sent -> Orders (only 20% convert).',
      explanation:
        'The funnel highlights where prospects are lost. Sorting by StageOrder guarantees the process order even if a later stage were bigger.',
    },
  ],
  interview: [
    {
      q: 'When is a pie or donut chart appropriate?',
      a: 'When showing part-to-whole of a total that adds up, with few (2-5) parts and when the message is a rough share ("about 90% Corporate"). Not for exact comparisons or many categories.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between the Legend and Details wells in a pie chart?',
      a: 'Legend defines the main slices (and colors). Details subdivides each slice by a second field, using shades of the legend color.',
      level: 'Medium',
    },
    {
      q: 'Why choose a treemap over a pie chart?',
      a: 'Treemaps handle many items and two levels of hierarchy (Category and Details), using rectangle area. Pies become unreadable with many slices.',
      level: 'Easy',
    },
    {
      q: 'What does a funnel chart show, and what are % of first and % of previous?',
      a: 'It shows values through sequential stages. % of first = stage value / first stage value (overall conversion). % of previous = stage value / previous stage value (step conversion).',
      level: 'Medium',
    },
    {
      q: 'Scenario: Your funnel shows stages alphabetically (Leads, Orders, Qualified, Quotes). How do you fix it?',
      a: 'Add a StageOrder column, set Stage Sort by column = StageOrder, and sort the visual axis by Stage ascending. Alternatively ensure the measure is decreasing and sort by value.',
      level: 'Medium',
    },
    {
      q: 'Scenario: A stakeholder wants a pie of average order value by city. What do you say?',
      a: 'Averages do not add up to a meaningful whole, so a pie is misleading. Use a sorted bar chart of Avg Order Value by City.',
      level: 'Hard',
    },
    {
      q: 'How do you show percentage labels on a donut?',
      a: 'Format visual > Visual > Detail labels > Label contents: Percent of total (or Category, percent of total), and set percentage decimal places.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Build a donut of Total Quantity by Category with percent labels.',
      hint: 'Legend Category, Values a SUM(Sales[Quantity]) measure.',
      solution: `Total Quantity = SUM(Sales[Quantity])
Donut: Legend Product[Category]; Values [Total Quantity]
Accessories 14 (53.8%), Electronics 7 (26.9%), Furniture 5 (19.2%)`,
    },
    {
      task: 'Build a treemap of Total Profit by City.',
      hint: 'Category = Customer[City], Values = [Total Profit].',
      solution: `Profit by city: Pune 25,000; Nashik 25,000; Nagpur 3,800; Mumbai 4,000.
Pune and Nashik are two equal large rectangles.`,
    },
    {
      task: 'Convert the Category pie chart into a clustered bar chart and explain which is easier to read.',
      hint: 'Select visual > click Clustered bar chart icon.',
      solution: `Legend moves to Y-axis, Values to X-axis. The bar chart makes the 20,000 vs 7,000 gap clear; the pie shows these as tiny slivers.`,
    },
    {
      task: 'Create a funnel of Total Sales by Customer (top customers first).',
      hint: 'Category = Customer[Customer], Values = [Total Sales]; default sort is descending by value.',
      solution: `Asha 1,20,000 -> Kiran 1,10,000 -> Neha 14,000 -> Ravi 13,000.
Note: a bar chart would communicate this ranking just as well.`,
    },
  ],
  quiz: [
    {
      question: 'Which well in a treemap creates the second level inside each category?',
      options: ['Legend', 'Details', 'Tooltips', 'Values'],
      answer: 1,
      explanation: 'Details nests rectangles inside each Category block.',
    },
    {
      question: 'What is the recommended maximum number of slices for a pie chart?',
      options: ['About 5', 'About 15', 'About 30', 'No limit'],
      answer: 0,
      explanation: 'Beyond about 5 slices labels overlap and comparison becomes hard.',
    },
    {
      question: 'A funnel chart is best for:',
      options: ['Trend over time', 'Stages of a sequential process', 'Geographic data', 'Correlation'],
      answer: 1,
      explanation: 'Funnels show how values reduce through process stages.',
    },
    {
      question: 'Which measure should NOT be shown in a pie chart?',
      options: ['Total Sales', 'Total Quantity', 'Average Order Value', 'Total Cost'],
      answer: 2,
      explanation: 'Averages do not sum to a meaningful whole.',
    },
    {
      question: 'How is a donut different from a pie in Power BI?',
      options: ['It needs a date field', 'It has a hole in the centre; wells are the same', 'It cannot show percentages', 'It supports negative values'],
      answer: 1,
      explanation: 'Donut and pie share the same wells; the donut has an adjustable inner radius.',
    },
  ],
};
