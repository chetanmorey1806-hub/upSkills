export default {
  id: 'extra-33-sync-slicers',
  title: 'Sync Slicers',
  module: 'Extra: Visualization & Reporting',
  extraNo: 33,
  level: 'Intermediate',
  duration: '1 hour',
  summary: "Sync slicers lets one slicer selection apply across several report pages, so a user who picks Year = 2024 on the Overview page sees 2024 on every page. You control, per page, whether the slicer is synced and whether it is visible.",
  objectives: [
    "Open the Sync slicers pane and sync a slicer across pages",
    "Understand the difference between Sync and Visible settings",
    "Use sync groups to sync different slicers that use the same field",
    "Choose between synced slicers and report-level filters",
  ],
  theory: [
    {
      heading: "The problem sync slicers solve",
      content: "By default a slicer filters only the page it sits on. If your report has Overview, Products and Customers pages, a user who selects Year = 2024 on Overview will find the Products page still showing all years. They must select 2024 again on every page, which is annoying and causes mistakes.\n\n**Sync slicers** connect the slicer across pages: one selection, applied everywhere you choose. Think of it like a TV remote that controls the volume in every room of a house at once.",
    },
    {
      heading: "The Sync slicers pane",
      content: "Open it with **View > Sync slicers**. Select a slicer on the canvas and the pane lists every page in the report with two checkboxes:\n\n- **Sync** (the circular arrows icon): the slicer's selection applies to that page.\n- **Visible** (the eye icon): a copy of the slicer is shown on that page.\n\nTicking Visible on a page automatically adds the slicer to that page (same position and formatting). Ticking only Sync keeps it invisible but still filtering.",
      points: [
        "Sync + Visible: users see and can change the slicer on that page",
        "Sync only: the page is filtered silently by the selection made elsewhere",
        "Visible only: a slicer appears but is independent (not synced)",
        "Neither: the page is not affected",
      ],
      tip: "There is also an option 'Sync field changes to other slicers': if you change the slicer's field on one page, synced copies update too.",
    },
    {
      heading: "Sync groups (Advanced options)",
      content: "At the bottom of the Sync slicers pane, expand **Advanced options**. Every slicer has a **group name** (by default the field name, e.g. Year). Slicers with the same group name are synced together.\n\nUse this when you have two different slicer visuals (for example a dropdown slicer on Overview and a tile slicer on Products) on the same field and want them to stay in sync. Give both the same group name.\n\nOptions:\n\n- **Sync field changes to other slicers:** changing the field on one slicer changes it on others in the group.\n- **Sync filter changes to other slicers:** selection changes are shared (on by default).",
    },
    {
      heading: "Copy-paste shortcut",
      content: "When you copy a slicer (Ctrl+C) and paste it (Ctrl+V) on another page, Power BI asks: **Sync visuals?** Choose **Sync** to automatically link the pasted slicer with the original, or **Don't sync** to keep it independent.\n\nThis is the quickest way to put the same slicer on many pages.",
    },
    {
      heading: "Synced slicers vs report-level filters",
      content: "- **Report-level filter (Filters pane > Filters on all pages):** good for fixed filters set by the author, or filters users change in the Filters pane. It always applies to every page.\n- **Synced slicer:** visible, user-friendly control on the canvas, applied to the pages you choose. You can exclude pages (e.g. a 'Trend over all years' page that should not be filtered by Year).\n\nSynced slicers also work well with **drill through**: filters from synced slicers pass to detail pages when Keep all filters is on.\n\nNote: bookmarks capture slicer state; if you use bookmarks, test that synced slicers behave as expected.",
    },
  ],
  examples: [
    {
      title: "Sync the Year slicer across three pages",
      scenario: "A report has Overview, Products and Customers pages. The Year slicer is on Overview. Users should see it on all pages and selections should carry over.",
      table: {
        headers: ['Page', 'Sync', 'Visible', 'Result'],
        rows: [
          ['Overview', 'Yes', 'Yes', 'Slicer shown, Year = 2024'],
          ['Products', 'Yes', 'Yes', 'Same slicer shown, already 2024'],
          ['Customers', 'Yes', 'Yes', 'Same slicer shown, already 2024'],
        ],
      },
      steps: [
        "On the Overview page, select the slicer that uses 'Date'[Year]",
        "View > Sync slicers to open the pane",
        "In the Sync slicers pane, tick both Sync and Visible for Overview, Products and Customers",
        "Go to Products: the slicer appears in the same position",
        "Select 2024 on Products, then go back to Overview and check that 2024 is selected there too",
      ],
      result: "One selection of 2024 filters all three pages; the slicer is visible everywhere.",
      explanation: "Sync shares the filter state between pages; Visible places a synced copy of the slicer on each page.",
    },
    {
      title: "Hidden sync for a details page",
      scenario: "A Product Details drill through page has no room for a slicer, but should still respect the Year chosen elsewhere. A Trend page should ignore the Year slicer.",
      table: {
        headers: ['Page', 'Sync', 'Visible', 'Effect of Year = 2024'],
        rows: [
          ['Overview', 'Yes', 'Yes', 'Filtered to 2024'],
          ['Product Details', 'Yes', 'No', 'Filtered to 2024, no slicer shown'],
          ['Trend', 'No', 'No', 'Shows 2023 and 2024'],
        ],
      },
      steps: [
        "Select the Year slicer on Overview and open View > Sync slicers",
        "For Product Details tick Sync only (leave Visible unticked)",
        "For Trend untick both Sync and Visible",
        "Select 2024 on Overview",
        "Open Product Details: its cards show 2024 values; hover the filter icon on a card to confirm",
        "Open Trend: the line chart still shows both 2023 and 2024",
      ],
      result: "Product Details is silently filtered to 2024 while Trend shows all years.",
      explanation: "Sync without Visible applies the selection invisibly. Unchecking Sync on a page excludes it from the slicer's effect.",
    },
    {
      title: "Sync two different slicer styles with a group name",
      scenario: "Overview uses a dropdown City slicer; the Customers page uses a tile (button) style City slicer built separately. They should stay in sync.",
      table: {
        headers: ['Slicer', 'Page', 'Style', 'Group name'],
        rows: [
          ['City slicer A', 'Overview', 'Dropdown', 'City'],
          ['City slicer B', 'Customers', 'Tile', 'City'],
        ],
      },
      steps: [
        "Select the dropdown City slicer on Overview; View > Sync slicers > Advanced options; note the group name (City) and set it to City if different",
        "Go to Customers and select the tile City slicer",
        "In Advanced options type the same group name: City",
        "Make sure Sync filter changes to other slicers is ticked",
        "Select Pune on the tile slicer and check that Overview's dropdown now shows Pune",
      ],
      result: "Selecting Pune on either slicer updates the other; both pages show Pune data (Total Sales 5,40,000 for 2024).",
      explanation: "Slicers with the same group name share their selection even if they are separate visuals with different formatting.",
    },
  ],
  interview: [
    { q: "What are sync slicers?", a: "A feature that shares a slicer's selection across multiple report pages, configured in View > Sync slicers.", level: 'Easy' },
    { q: "What is the difference between Sync and Visible in the Sync slicers pane?", a: "Sync means the selection filters that page. Visible means the slicer is displayed on that page. You can sync without showing it.", level: 'Easy' },
    { q: "How can you quickly add a synced slicer to another page?", a: "Copy the slicer and paste it on the other page; choose Sync in the Sync visuals dialog.", level: 'Easy' },
    { q: "What are sync groups?", a: "In Advanced options, slicers with the same group name are synced together. This lets separate slicer visuals (different styles or created independently) share selections.", level: 'Medium' },
    { q: "When would you use a report-level filter instead of synced slicers?", a: "When the filter is set by the author or should always apply to all pages without a visible control. Synced slicers are better when users need a visible control and some pages should be excluded.", level: 'Medium' },
    { q: "Scenario: a user selects 2024 on Overview, but the Products page shows all years. What do you check?", a: "Open View > Sync slicers with the slicer selected and verify Sync is ticked for Products. Also check group names if the Products slicer is a separate visual, and check bookmarks that may reset slicer state.", level: 'Hard' },
    { q: "Scenario: one page must always show all years even though Year is synced. How?", a: "Untick Sync (and Visible) for that page in the Sync slicers pane, so the slicer's selection does not apply there.", level: 'Hard' },
  ],
  practice: [
    { task: "Sync a Category slicer across all pages and make it visible only on Overview.", hint: "Sync on all, Visible on one.", solution: "Select the Category slicer > View > Sync slicers: tick Sync for every page, tick Visible only for Overview." },
    { task: "Copy a Segment slicer to the Customers page with sync.", hint: "Ctrl+C, Ctrl+V.", solution: "Select the Segment slicer, Ctrl+C, go to Customers, Ctrl+V, click Sync in the Sync visuals dialog." },
    { task: "Exclude the Trend page from the Year slicer.", hint: "Untick Sync for that page.", solution: "View > Sync slicers with the Year slicer selected; untick Sync and Visible for Trend." },
    { task: "Make two separately built City slicers sync using a group name.", hint: "Advanced options.", solution: "Select each slicer, View > Sync slicers > Advanced options, set group name City for both and keep Sync filter changes ticked." },
  ],
  quiz: [
    { question: "Where do you open the Sync slicers pane?", options: ["Home > Sync", "View > Sync slicers", "Modeling > Sync", "Format > Sync"], answer: 1, explanation: "Sync slicers is in the View ribbon." },
    { question: "Sync ticked and Visible unticked for a page means:", options: ["The page is not filtered", "The page is filtered but no slicer is shown", "The slicer is shown but not synced", "The page is hidden"], answer: 1, explanation: "Sync applies the filter; Visible controls display." },
    { question: "When you paste a copied slicer onto another page, Power BI asks:", options: ["Replace visual?", "Sync visuals?", "Create bookmark?", "Keep all filters?"], answer: 1, explanation: "The Sync visuals dialog lets you link the pasted slicer." },
    { question: "Slicers in the same sync group must share:", options: ["The same page", "The same group name", "The same size", "The same theme"], answer: 1, explanation: "Group name (in Advanced options) controls syncing." },
    { question: "To keep one page unaffected by a synced slicer you:", options: ["Delete the slicer", "Untick Sync for that page", "Use a report-level filter", "Hide the page"], answer: 1, explanation: "Unticking Sync excludes that page from the slicer's selection." },
  ],
};
