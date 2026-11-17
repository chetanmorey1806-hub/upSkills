export default {
  id: 'day-42-ai-visuals-qa-influencers',
  title: 'Q&A Visual, Key Influencers, Decomposition Tree, Smart Narrative',
  module: 'Module 8: AI Features & Advanced Integration',
  day: 42,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Power BI includes built-in AI visuals that help users explore data without writing DAX: ask questions in plain English (Q&A), find what drives an outcome (Key influencers), break a number down step by step (Decomposition tree) and generate text summaries (Smart narrative, and the newer Copilot experiences).',
  objectives: [
    'Add a Q&A visual, ask natural-language questions and improve answers with synonyms',
    'Use the Key influencers visual to explain what increases or decreases a metric',
    'Build a Decomposition tree with manual and AI splits',
    'Insert a Smart narrative with dynamic values and know where Copilot fits today',
  ],
  theory: [
    {
      heading: 'Q&A visual',
      content:
        "The **Q&A** visual lets users type a question such as 'total sales by city as bar chart' and Power BI builds a visual from the model's tables, columns and measures.\n\nAdd it: **Insert > Q&A** (or the Q&A icon in the Visualizations pane), or double-click an empty area of the canvas. Suggested questions appear; you can type your own.\n\nTips:\n\n- Use names that people actually say. Rename `Sales[SalesAmount]` display name or add **synonyms** like revenue, turnover.\n- Synonyms: **Model view** > select a field > Properties > **Synonyms**, or **Modeling > Q&A setup** to review questions, teach Q&A terms and add suggested questions.\n- Click **Turn this Q&A result into a standard visual** (icon next to the question box) to convert the answer to a normal chart.\n\nStatus note: Microsoft has announced that Q&A is being retired (planned for December 2026) and is steering users to **Copilot** for natural-language questions. Learn Q&A for existing reports and interviews, but expect Copilot in new projects.",
      tip: 'Hide technical columns (keys, sort columns) so Q&A does not use them in answers.',
    },
    {
      heading: 'Key influencers',
      content:
        "The **Key influencers** visual uses machine learning (logistic or linear regression and decision trees) to show which factors most affect a metric.\n\n- **Analyze**: the outcome, a categorical column (e.g. Customer churn = Yes) or a numeric column/measure (e.g. SalesAmount).\n- **Explain by**: candidate factors (Category, City, Segment, Quantity...).\n\nTwo tabs:\n\n1. **Key influencers**: ranked list, e.g. 'When Category is Electronics, the average SalesAmount increases by 70,000'. Click a factor to see a supporting chart.\n2. **Top segments**: groups of conditions that together give a high (or low) value, e.g. Segment Corporate AND Category Electronics.\n\nIt needs enough rows to be statistically meaningful; use the full practice dataset, not a 5-row sample. Results show correlation, not proof of causation.",
    },
    {
      heading: 'Decomposition tree',
      content:
        "The **Decomposition tree** breaks a measure into its parts across several dimensions, level by level, in any order the user chooses. It is ideal for root-cause analysis: 'Why is total sales 1,86,500? Which city, then which category, then which product?'\n\nSetup: **Analyze** = a measure (Total Sales); **Explain by** = dimensions (City, Segment, Category, Product).\n\nIn the visual, click the **+** next to a bar and choose the next dimension. **AI splits** let Power BI choose: **High value** (go to the dimension with the highest value) or **Low value**. In the Format pane > Analysis you choose **Absolute** (highest value) or **Relative** (most different from the rest) for AI splits.\n\nAuthors can **lock** a level so consumers cannot remove it, and set the default expanded path before publishing.",
    },
    {
      heading: 'Smart narrative and Copilot narrative',
      content:
        "The **Smart narrative** visual writes a text summary of the page or a visual: trends, top contributors, changes. Insert it with **Insert > Narrative > Smart narrative** (in some versions Insert > Smart narrative), or right-click a visual > **Summarize**.\n\nThe text is editable; you can add **dynamic values**: click **+ Value**, type a natural-language description (e.g. 'total sales') or pick a measure, name it, and it updates with filters.\n\nNewer Desktop versions also offer a **Copilot narrative** visual and the **Copilot pane** that summarise pages and answer questions. Copilot requires a paid Fabric capacity (F2 or higher) or Premium capacity with Copilot enabled by your admin. Always read AI-generated text before sharing it.",
      points: [
        'Q&A: ask questions in words (being replaced by Copilot).',
        'Key influencers: what drives a metric up or down.',
        'Decomposition tree: drill a number into contributors in any order.',
        'Smart narrative/Copilot narrative: automatic text summaries.',
      ],
    },
  ],
  examples: [
    {
      title: 'Ask questions with the Q&A visual',
      scenario: 'A manager wants quick answers without building visuals.',
      table: {
        headers: ['Question typed', 'Visual produced (sample slice)'],
        rows: [
          ['total sales by city', 'Bar chart: Pune 1,24,000; Nagpur 50,000; Mumbai 12,500'],
          ['total sales by category as pie chart', 'Pie: Electronics 80.4%, Furniture 12.9%, Accessories 6.7%'],
          ['revenue in Pune', 'Card: 1,24,000 (after adding synonym revenue)'],
        ],
      },
      steps: [
        'Report view > Insert > Q&A (or double-click empty canvas)',
        'Type total sales by city and press Enter',
        'Model view > select the Total Sales measure > Properties > Synonyms: add revenue, turnover',
        'Back in Report view, type revenue in Pune',
        'Click the Turn this Q&A result into a standard visual icon to keep the chart',
      ],
      result: 'Q&A builds the charts shown; after adding synonyms, "revenue" is understood as Total Sales.',
      explanation: 'Q&A maps words to model fields using names and synonyms. Good naming improves results.',
    },
    {
      title: 'Find what drives order value with Key influencers',
      scenario: 'Using the full practice dataset, find factors that increase SalesAmount per order.',
      table: {
        headers: ['Influencer (example output)', 'Effect on average SalesAmount'],
        rows: [
          ['Category is Electronics', 'increases by several times vs other categories'],
          ['Quantity is high', 'increases'],
          ['Category is Accessories', 'decreases'],
        ],
      },
      steps: [
        'Load the full practice CSVs (Sales, Product, Customer, Date)',
        'Visualizations > Key influencers',
        'Analyze: Sales[SalesAmount] (keep the summarisation as Don\'t summarize / analysed per row)',
        'Explain by: Product[Category], Customer[City], Customer[Segment], Sales[Quantity]',
        'Read the Key influencers tab; click the top factor to see its column chart',
        'Open the Top segments tab to see combinations with the highest averages',
      ],
      result: 'Category Electronics appears as the top influencer increasing SalesAmount; Accessories decreases it. Exact numbers depend on the dataset rows.',
      explanation: 'The visual runs regression on each Explain-by field against SalesAmount at the Sales row level and ranks the strongest effects.',
    },
    {
      title: 'Root-cause path with a Decomposition tree',
      scenario: 'Explain where total sales come from in the 5-row sample slice.',
      table: {
        headers: ['Level', 'Path', 'Value'],
        rows: [
          ['Total', 'Total Sales', '1,86,500'],
          ['City', 'Pune', '1,24,000'],
          ['Category (under Pune)', 'Electronics', '1,00,000'],
          ['Category (under Pune)', 'Furniture', '24,000'],
          ['City', 'Nagpur', '50,000'],
          ['City', 'Mumbai', '12,500'],
        ],
      },
      steps: [
        'Visualizations > Decomposition tree',
        'Analyze: [Total Sales]; Explain by: Customer[City], Customer[Segment], Product[Category], Product[Product]',
        'Click + next to Total Sales > choose City',
        'Click + next to Pune > choose Category',
        'Click + next to Electronics > High value (AI split) to let Power BI pick the next level',
        'Format > Tree > Lock the City level, then save',
      ],
      result: 'The tree shows Pune 1,24,000 as the largest city, mostly from Electronics 1,00,000 (Laptop order 1001).',
      explanation: 'Each level filters the next; AI split High value chooses the dimension whose top member is largest.',
    },
    {
      title: 'Smart narrative with a dynamic value',
      scenario: 'Add an automatic summary and a sentence with a live total.',
      table: {
        headers: ['Slicer', 'Sentence shown'],
        rows: [
          ['(none)', 'Total sales this period are 1,86,500 in 3 city(s).'],
          ['City = Mumbai', 'Total sales this period are 12,500 in 1 city(s).'],
        ],
      },
      steps: [
        'Insert > Narrative > Smart narrative (or right-click a chart > Summarize)',
        'Edit the generated text; place the cursor where the number should go',
        'Click + Value; type total sales or choose [Total Sales]; name it Total Sales Value; Save',
        'Add another value using a measure Cities = DISTINCTCOUNT(Customer[City])',
        'Change the City slicer and watch the text update',
      ],
      code: `Cities = DISTINCTCOUNT ( Customer[City] )`,
      result: 'The narrative updates with the filters; numbers come from measures.',
      explanation: 'Dynamic values are bound to measures or Q&A-style expressions, so text stays consistent with visuals.',
    },
  ],
  interview: [
    {
      q: 'What AI visuals are available in Power BI?',
      a: 'Q&A, Key influencers, Decomposition tree, Smart narrative (and Copilot narrative), plus analytics features like anomaly detection and forecasting on line charts.',
      level: 'Easy',
    },
    {
      q: 'How do you improve Q&A answers?',
      a: 'Use business-friendly names, add synonyms (Model view > Properties > Synonyms), hide technical columns, set correct data categories and default summarisation, and use Modeling > Q&A setup to teach terms and add suggested questions.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between Key influencers and Decomposition tree?',
      a: 'Key influencers uses statistical models to rank factors that drive a metric (why). Decomposition tree lets users break down a measure across dimensions interactively (where), optionally with AI splits.',
      level: 'Medium',
    },
    {
      q: 'What are absolute and relative AI splits in the Decomposition tree?',
      a: 'Absolute picks the dimension member with the highest (or lowest) value. Relative picks the member that stands out most compared to the other members of that dimension.',
      level: 'Hard',
    },
    {
      q: 'Does Key influencers prove causation?',
      a: 'No. It finds statistical associations. A factor may be correlated with the outcome because of another hidden factor; business validation is needed.',
      level: 'Medium',
    },
    {
      q: 'What is the future of Q&A in Power BI?',
      a: 'Microsoft has announced that Q&A is being retired (planned for December 2026) and is replacing natural-language querying with Copilot, which requires a paid Fabric (F2+) or Premium capacity with Copilot enabled.',
      level: 'Medium',
    },
    {
      q: 'Scenario: the Key influencers visual shows "not enough data". What do you check?',
      a: 'The Analyze field needs enough rows and variation at the analysed level; use row-level data (do not summarise into a few rows), include more history, remove filters reducing data, and use Explain-by fields with reasonable cardinality.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Add synonyms so that Q&A understands "customers" as Customer[Customer] and "revenue" as Total Sales.',
      hint: 'Model view > Properties > Synonyms.',
      solution: 'Select Customer[Customer] > Synonyms: customers, client. Select [Total Sales] > Synonyms: revenue, turnover. Test with "revenue by customers".',
    },
    {
      task: 'Build a Decomposition tree for Profit by Segment, City and Category and find the largest path.',
      hint: 'Create Profit measure first.',
      solution: `Profit = SUM ( Sales[SalesAmount] ) - SUM ( Sales[Cost] )
-- Sample: Corporate 36,000 > Pune 26,000 > Electronics 20,000`,
    },
    {
      task: 'Use Key influencers to find what increases Quantity per order on the full dataset.',
      hint: 'Analyze Sales[Quantity], explain by Category, City, Segment, Month.',
      solution: 'Insert Key influencers, Analyze: Quantity, Explain by the dimensions; read the top factors (often Accessories, low-price items, increase quantity).',
    },
    {
      task: 'Add a Smart narrative that mentions total profit and margin as dynamic values.',
      hint: '+ Value and measures.',
      solution: `Margin % = DIVIDE ( [Profit], [Total Sales] )
-- Insert Smart narrative > + Value > [Profit]; + Value > [Margin %] (format %).`,
    },
  ],
  quiz: [
    {
      question: 'Which visual answers questions typed in plain English?',
      options: ['Decomposition tree', 'Q&A', 'Key influencers', 'Gauge'],
      answer: 1,
      explanation: 'Q&A interprets natural-language questions.',
    },
    {
      question: 'Where do you add synonyms for a field?',
      options: ['Power Query', 'Model view > Properties > Synonyms', 'Format pane', 'Performance analyzer'],
      answer: 1,
      explanation: 'Synonyms are field properties in Model view (also Q&A setup).',
    },
    {
      question: 'Which visual has Key influencers and Top segments tabs?',
      options: ['Smart narrative', 'Key influencers', 'Decomposition tree', 'Q&A'],
      answer: 1,
      explanation: 'Key influencers has both tabs.',
    },
    {
      question: '"High value" in the Decomposition tree is...',
      options: ['A filter', 'An AI split', 'A bookmark', 'A theme'],
      answer: 1,
      explanation: 'AI splits choose the next dimension automatically.',
    },
    {
      question: 'Copilot in Power BI requires...',
      options: ['Free licence only', 'Paid Fabric (F2+) or Premium capacity enabled by admin', 'Personal gateway', 'Publish to web'],
      answer: 1,
      explanation: 'Copilot runs on paid capacity and must be enabled in tenant settings.',
    },
  ],
};
