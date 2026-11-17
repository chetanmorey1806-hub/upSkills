export default {
  id: 'day-02-desktop-installation-interface',
  title: 'Power BI Desktop Installation, Interface, Ribbon, Report View, Data View, Model View',
  module: 'Module 1: Introduction to Power BI',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Install Power BI Desktop the right way and learn every part of its screen – the ribbon, panes and the Report, Table (Data), Model and DAX query views – so you can move around confidently from Day 3 onwards.',
  objectives: [
    'Install and update Power BI Desktop and know the system requirements',
    'Identify the ribbon tabs and what each one is used for',
    'Use the Report view canvas, Visualizations pane, Data pane and Filters pane',
    'Inspect loaded data in Table view (Data view) and relationships in Model view',
    'Configure useful Options and settings before starting a project',
  ],
  theory: [
    {
      heading: 'Installing Power BI Desktop',
      content:
        `Power BI Desktop is **free** and runs only on **Windows** (Windows 10/11, 64-bit recommended, at least 4 GB RAM – 8 GB or more is better). Mac users run it in a Windows virtual machine or use the Power BI Service in a browser.\n\nThere are two ways to install:\n\n1. **Microsoft Store (recommended)** – open the Microsoft Store, search "Power BI Desktop", click **Get/Install**. It updates automatically every month.\n2. **Download Center** – download \`PBIDesktopSetup_x64.exe\` from microsoft.com/power-bi/desktop and run the installer. You must download each monthly update yourself.\n\nAfter installation, open it from the Start menu. You can sign in with a work or school account (needed later to publish), but you can build reports without signing in.`,
      points: [
        'Power BI Desktop releases a new version every month – features in this course assume a recent version.',
        'Files are saved as **.pbix** (report + model + queries). Templates are **.pbit** (no data). Projects can also be saved as **.pbip** for source control.',
        'Do not install both the Store and the .exe versions on one PC – choose one.',
      ],
      tip: 'Use the Microsoft Store version on personal laptops so you always have the latest features without thinking about updates.',
    },
    {
      heading: 'The interface at a glance',
      content:
        `When you open a report, the screen has these areas:\n\n- **Ribbon** (top) – tabs with commands.\n- **View switcher** (left edge) – icons for **Report**, **Table**, **Model**, **DAX query** (and TMDL view in newer versions).\n- **Canvas** (centre) – the report page where visuals are placed.\n- **Page tabs** (bottom) – add, rename, duplicate, hide report pages.\n- **Panes** (right side) – **Filters**, **Visualizations** (build visual + format visual), **Data** (tables and fields). Other panes such as Bookmarks, Selection, Performance analyzer and Sync slicers are opened from the **View** tab.\n- **Status bar** – page number, zoom slider.\n\nAnalogy: the canvas is your **drawing paper**, the Visualizations pane is your **box of chart stamps**, and the Data pane is your **paint palette** of fields.`,
    },
    {
      heading: 'The ribbon tabs',
      content:
        `- **Home** – Get data, Transform data (opens Power Query), Refresh, New visual, Text box, New measure, Publish.\n- **Insert** – visuals, text box, buttons, shapes, images, Q&A, Smart narrative.\n- **Modeling** – New measure, New column, New table, New parameter (What-if/Field), Manage roles, View as, Mark as date table.\n- **View** – themes, page view, mobile layout, gridlines, snap to grid, and panes (Filters, Bookmarks, Selection, Performance analyzer, Sync slicers).\n- **Optimize** – pause visuals, optimization presets, Performance analyzer.\n- **Help** – documentation, learning, community, About.\n- **Format / Data / Table tools / Column tools / Measure tools** – contextual tabs that appear only when you select a visual, table, column or measure.`,
      tip: 'If you cannot find a command, select the object first – many options live on contextual tabs that appear only after selection.',
    },
    {
      heading: 'Report view',
      content:
        `**Report view** is where you design the report. To create a visual:\n\n1. Click an empty part of the canvas.\n2. In the **Data** pane tick a field (for example Sales[SalesAmount]) – Power BI picks a visual type.\n3. Change the type by clicking another icon in **Visualizations**.\n4. Drag fields into the **wells** (X-axis, Y-axis, Legend, Values, Tooltips).\n5. Use the **Format visual** (paint-brush) tab to change colours, titles and labels.\n\nThe **Filters** pane has three levels: **Filters on this visual**, **Filters on this page** and **Filters on all pages**.`,
    },
    {
      heading: 'Table view (Data view)',
      content:
        `**Table view** (older name: **Data view**) shows the actual rows loaded into the model, like a read-only spreadsheet.\n\nUse it to:\n\n- check that data loaded correctly (row count is shown in the status bar),\n- sort or filter a column temporarily to inspect values (this does not change the model),\n- set **data type**, **format** (currency, decimal places, date format) and **data category** (City, Country, Web URL) from **Column tools**,\n- create **calculated columns** (Table tools > New column) and see the result immediately.\n\nYou cannot type or edit values here – all data cleaning happens in Power Query.`,
    },
    {
      heading: 'Model view and DAX query view',
      content:
        `**Model view** shows each table as a box with its fields and the **relationships** as lines between them. Here you:\n\n- create relationships by dragging a column from one table onto the matching column of another (e.g. Product[ProductID] onto Sales[ProductID]),\n- double-click a line to edit cardinality and cross filter direction,\n- hide fields from report view, create display folders, set properties in the **Properties** pane,\n- create layouts (tabs) for large models.\n\n**DAX query view** lets you write and run DAX queries such as \`EVALUATE TOPN(5, Product)\` to test calculations and inspect results. It is a testing tool and does not add visuals to the report.`,
      points: [
        '1 on the line = "one" side (unique values, usually the dimension).',
        '* on the line = "many" side (repeating values, usually the fact table).',
        'The arrow on the line shows the filter direction.',
      ],
    },
    {
      heading: 'Useful Options before you start',
      content:
        `Open **File > Options and settings > Options**:\n\n- **Global > Data Load > Time intelligence**: many professionals turn off **Auto date/time** for new files and use their own Date table (Day 17).\n- **Current File > Data Load > Relationships**: you can turn off "Autodetect new relationships after data is loaded" to control relationships yourself.\n- **Global > Preview features**: try new features (they may change).\n- **Global > Regional settings**: locale for import affects how dates like 03/04/2024 are read.\n\nAlso use **File > Save** often – Power BI Desktop does have **AutoRecovery**, but saving is safer.`,
      tip: 'Regional settings matter in India: a CSV with dd/mm/yyyy dates read with an en-US locale will swap day and month. We fix this with "Using Locale" in Day 8.',
    },
  ],
  examples: [
    {
      title: 'Install from the Microsoft Store and verify the version',
      scenario: 'Set up a new Windows laptop for the course.',
      steps: [
        'Click Start, open Microsoft Store.',
        'Search "Power BI Desktop" and choose the app published by Microsoft Corporation.',
        'Click Get (or Install) and wait for the installation to finish.',
        'Open Power BI Desktop from the Start menu and close the welcome screen.',
        'Click Help > About to see the version number and month of release.',
      ],
      result: 'Power BI Desktop opens with a blank report and the About dialog shows the current monthly version.',
      explanation: 'The Store version updates automatically, so the menus will match current documentation.',
    },
    {
      title: 'Load the practice dataset and explore all three views',
      scenario: 'Load the course CSV files (Sales, Product, Customer, Date) downloaded from the app.',
      table: {
        headers: ['OrderID', 'OrderDate', 'CustomerID', 'ProductID', 'Quantity', 'UnitPrice', 'SalesAmount'],
        rows: [
          [1001, '2024-01-05', 'C01', 'P01', 2, 55000, 110000],
          [1002, '2024-01-06', 'C03', 'P04', 5, 800, 4000],
          [1003, '2024-01-08', 'C02', 'P07', 1, 12000, 12000],
        ],
      },
      steps: [
        'Home > Get data > Text/CSV, choose Sales.csv, click Load.',
        'Repeat for Product.csv, Customer.csv and Date.csv.',
        'Click the Table view icon on the left. Select Sales in the Data pane and check the row count in the status bar.',
        'Click the Model view icon. Check that Product, Customer and Date are linked to Sales. If a line is missing, drag Product[ProductID] onto Sales[ProductID].',
        'Click the Report view icon. Tick Customer[City] and Sales[SalesAmount] in the Data pane.',
      ],
      result: 'Table view shows the rows above, Model view shows four tables joined to Sales, Report view shows a column chart of SalesAmount by City.',
      explanation: 'Each view looks at the same .pbix from a different angle: data rows, structure, and presentation.',
    },
    {
      title: 'Format a column in Table view',
      scenario: 'SalesAmount shows as 110000 with no currency symbol. Make it show as ₹1,10,000.',
      steps: [
        'Go to Table view and click the SalesAmount column header in Sales.',
        'On the Column tools tab, set Data type to Decimal number or Fixed decimal number.',
        'Set Format to Currency and choose ₹ English (India) from the currency drop-down.',
        'Set decimal places to 0.',
      ],
      result: 'SalesAmount displays as ₹1,10,000 in Table view and in every visual that uses it.',
      explanation: 'Formatting set in Column tools is part of the model, so every report using the column inherits it.',
    },
    {
      title: 'Test a quick DAX query in DAX query view',
      scenario: 'Check the top 3 products by price without building a visual.',
      steps: [
        'Click the DAX query view icon on the left.',
        'Type the query below in the editor.',
        'Click Run (or press F5).',
      ],
      code: `EVALUATE
TOPN ( 3, Product, Product[Price], DESC )
ORDER BY Product[Price] DESC`,
      result: 'A result grid showing the 3 most expensive products with all Product columns.',
      explanation: 'EVALUATE returns a table. DAX query view is a safe place to test logic before turning it into measures.',
    },
  ],
  interview: [
    { q: 'What are the different views in Power BI Desktop?', a: 'Report view (design visuals and pages), Table view also called Data view (inspect loaded rows, set formats, create calculated columns), Model view (relationships, properties, layouts) and DAX query view (run DAX queries). Newer versions also include TMDL view for scripting the model.', level: 'Easy' },
    { q: 'Can you edit data values in Data view?', a: 'No. Data view (Table view) is read-only for values. Cleaning or correcting data is done in Power Query (Transform data) so the change repeats on every refresh.', level: 'Easy' },
    { q: 'What is the difference between .pbix, .pbit and .pbip?', a: '.pbix contains queries, model, data and report. .pbit is a template with queries, model and report but no data, so users enter parameters and load fresh data. .pbip is a Power BI Project folder that saves report and model definitions as text files for Git source control.', level: 'Medium' },
    { q: 'Store version vs downloaded .exe – which do you prefer?', a: 'The Microsoft Store version auto-updates monthly and is recommended for most users. The .exe is used where the Store is blocked by IT or a specific version must be pinned, for example to match Power BI Report Server.', level: 'Medium' },
    { q: 'Where do you find the Performance analyzer, Bookmarks and Selection panes?', a: 'On the View tab of the ribbon in Report view (Performance analyzer also appears on the Optimize tab).', level: 'Easy' },
    { q: 'What do the 1 and * symbols in Model view mean?', a: '1 marks the side of the relationship where the key column has unique values (dimension). * marks the many side where values repeat (fact). The arrow shows the filter direction.', level: 'Easy' },
    { q: 'Scenario: a colleague says dates like 03/04/2024 are loading as 4 March instead of 3 April. What setting do you check?', a: 'The locale used during import: File > Options and settings > Options > Current File > Regional settings, or better, in Power Query use Change Type > Using Locale with English (India) so the step is explicit.', level: 'Medium' },
  ],
  practice: [
    { task: 'Install Power BI Desktop and note the version number from Help > About.', hint: 'Microsoft Store is the easiest route.', solution: 'Store > search Power BI Desktop > Install > open > Help > About shows something like "Version 2.1xx.xxx".' },
    { task: 'Load Sales.csv and Product.csv and find the number of rows in each table.', hint: 'Use Table view and look at the status bar.', solution: 'Home > Get data > Text/CSV for each file > Load. In Table view select each table; the bottom-left shows "TABLE: Sales (N rows)".' },
    { task: 'Create a relationship between Product and Sales in Model view if not created automatically.', hint: 'Drag from the one side to the many side.', solution: 'Model view > drag Product[ProductID] onto Sales[ProductID] > the line shows 1 on Product and * on Sales, single direction.' },
    { task: 'Turn off Auto date/time for the current file.', hint: 'Options > Current File.', solution: 'File > Options and settings > Options > Current File > Data Load > untick "Auto date/time" > OK.' },
    { task: 'Make a table visual showing Product[Category] and Sales[Quantity], then rename the page to "Overview".', hint: 'Double-click the page tab to rename.', solution: 'Report view > Visualizations > Table icon > tick Category and Quantity > double-click "Page 1" > type Overview > Enter.' },
  ],
  quiz: [
    { question: 'Power BI Desktop is available for which operating system?', options: ['macOS only', 'Windows only', 'Linux only', 'Windows, macOS and Linux'], answer: 1, explanation: 'Desktop runs on Windows only; Mac users use a VM or the Service.' },
    { question: 'Which view is used to create relationships by drag-and-drop?', options: ['Model view', 'Report view', 'Table view', 'DAX query view'], answer: 0, explanation: 'Model view shows tables and relationship lines.' },
    { question: 'Which ribbon tab has "Transform data"?', options: ['Insert', 'View', 'Help', 'Home'], answer: 3, explanation: 'Home > Transform data opens the Power Query Editor.' },
    { question: 'Which file type is a template without data?', options: ['.pbix', '.pbip', '.pbit', '.xlsx'], answer: 2, explanation: '.pbit stores the definition only, not the data.' },
    { question: 'In Table view you can:', options: ['Type new values into cells', 'Set a column format to Currency', 'Delete individual rows', 'Merge two tables'], answer: 1, explanation: 'Table view is read-only for values but you can set data type, format and data category.' },
  ],
};
