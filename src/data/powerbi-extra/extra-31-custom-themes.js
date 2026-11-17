export default {
  id: 'extra-31-custom-themes',
  title: 'Custom Themes',
  module: 'Extra: Visualization & Reporting',
  extraNo: 31,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "A report theme is a JSON file that controls the colours, fonts and default formatting of every visual in a report. Custom themes let you apply your company's brand in one click and keep all reports consistent without formatting each visual by hand.",
  objectives: [
    "Apply built-in themes and customize the current theme from the View ribbon",
    "Understand the structure of a theme JSON file (dataColors, textClasses, visualStyles)",
    "Write, import and export a valid custom theme JSON",
    "Know how themes interact with manual formatting and conditional formatting",
  ],
  theory: [
    {
      heading: "What is a report theme?",
      content: "Think of a theme like a school uniform: every student (visual) automatically wears the same colours without being told individually.\n\nA Power BI theme defines:\n\n- **Data colours:** the order of colours used for series (first category, second category ...).\n- **Text styles:** fonts and sizes for titles, labels, cards.\n- **Structural colours:** background, foreground, table accent.\n- **Sentiment colours:** good / neutral / bad (used in KPI visuals and waterfall).\n- **Divergent colours:** minimum / center / maximum for colour scales.\n- **Visual styles:** default formatting for any property of any visual (e.g. borders, title on/off, page background).\n\nThemes are found under **View > Themes**.",
    },
    {
      heading: "Three ways to work with themes",
      content: "1. **Built-in themes:** View > Themes gallery (Default, Executive, Innovate, Accessible themes ...). One click applies it.\n2. **Customize current theme:** View > Themes > dropdown > **Customize current theme**. A dialog lets you change name and colours, text, visuals, page and filter pane settings without writing JSON.\n3. **JSON theme file:** View > Themes > **Browse for themes** to import a `.json` file. Use **Save current theme** to export the current theme as JSON, edit it, and import it again.\n\nPower BI also has a **theme gallery** online where the community shares theme files.",
      tip: "Best workflow: start with Customize current theme, then Save current theme to get a valid JSON skeleton you can extend.",
    },
    {
      heading: "Structure of a theme JSON",
      content: "A theme is a JSON object. Only `name` is required; everything else is optional and overrides defaults.\n\n- `name`: theme name shown in Power BI.\n- `dataColors`: array of hex colours for series.\n- `background`, `foreground`, `tableAccent`: structural colours.\n- `good`, `neutral`, `bad`: sentiment colours.\n- `maximum`, `center`, `minimum`: divergent colour scale.\n- `textClasses`: font settings for classes like `callout` (card values), `title`, `header`, `label`.\n- `visualStyles`: `{ visualName: { styleName: { cardName: [ { property: value } ] } } }`. Use `\"*\"` for all visuals or all styles.\n\nJSON rules: double-quoted keys and strings, no trailing commas, no comments.",
      syntax: "{\n  \"name\": \"My Theme\",\n  \"dataColors\": [\"#1F4E79\", \"#F39C12\"],\n  \"visualStyles\": {\n    \"*\": { \"*\": { \"title\": [{ \"show\": true }] } }\n  }\n}",
    },
    {
      heading: "Themes vs manual formatting",
      content: "- The theme sets **defaults**. If you manually change a visual's colour in the Format pane, that manual setting wins over the theme.\n- To make a visual follow the theme again, use the **Reset to default** option in the Format pane for that card.\n- Colours you pick from the colour picker's **theme colours** row change automatically when you switch theme; colours entered as fixed hex codes do not.\n- Conditional formatting rules are not overridden by a theme.\n\nSo apply the theme **first**, then format only exceptions.",
    },
    {
      heading: "Accessibility and brand tips",
      content: "- Keep good contrast between text and background (WCAG 4.5:1 for text).\n- Do not rely on red/green alone; colour-blind users struggle with them. Power BI includes Accessible themes as a starting point.\n- Limit data colours to 6-8 distinct hues.\n- Use one font family (Segoe UI is the Power BI default and renders everywhere).\n- Store the company theme JSON in a shared location (SharePoint / Git) so all developers use the same file.",
    },
  ],
  examples: [
    {
      title: "Create and import a corporate theme JSON",
      scenario: "Your company brand uses navy blue, orange and green. Every new report should use these colours, card values in navy, rounded visual borders and a light grey page background.",
      table: {
        headers: ['Theme element', 'Value', 'Where you see it'],
        rows: [
          ['dataColors[0]', '#1F4E79 (navy)', 'First series, e.g. Electronics bar'],
          ['dataColors[1]', '#F39C12 (orange)', 'Second series'],
          ['callout', '28pt navy', 'Card values'],
          ['page background', '#F4F6F8', 'Canvas behind visuals'],
          ['good / bad', '#27AE60 / #C0392B', 'KPI visual status'],
        ],
      },
      steps: [
        "Open Notepad or VS Code and paste the JSON from the code box",
        "Save the file as PuneRetailTheme.json (make sure it is not saved as .txt)",
        "In Power BI Desktop go to View > Themes > Browse for themes",
        "Select PuneRetailTheme.json and click Open",
        "A message confirms the theme was imported; check the colours of existing charts and cards",
        "Insert a new bar chart of Total Sales by Product[Category] to see dataColors used in order",
      ],
      code: `{
  "name": "Pune Retail Corporate",
  "dataColors": ["#1F4E79", "#F39C12", "#27AE60", "#2E86C1", "#C0392B", "#8E44AD", "#16A085", "#7F8C8D"],
  "background": "#FFFFFF",
  "foreground": "#252423",
  "tableAccent": "#1F4E79",
  "good": "#27AE60",
  "neutral": "#F39C12",
  "bad": "#C0392B",
  "maximum": "#1F4E79",
  "center": "#F39C12",
  "minimum": "#FDEBD0",
  "textClasses": {
    "callout": { "fontSize": 28, "fontFace": "Segoe UI Semibold", "color": "#1F4E79" },
    "title": { "fontSize": 12, "fontFace": "Segoe UI Semibold", "color": "#252423" },
    "header": { "fontSize": 12, "fontFace": "Segoe UI Semibold", "color": "#252423" },
    "label": { "fontSize": 10, "fontFace": "Segoe UI", "color": "#605E5C" }
  },
  "visualStyles": {
    "*": {
      "*": {
        "title": [{ "show": true }],
        "border": [{ "show": true, "color": { "solid": { "color": "#D0D7DE" } }, "radius": 8 }],
        "background": [{ "show": true, "color": { "solid": { "color": "#FFFFFF" } }, "transparency": 0 }]
      }
    },
    "page": {
      "*": {
        "background": [{ "color": { "solid": { "color": "#F4F6F8" } }, "transparency": 0 }]
      }
    }
  }
}`,
      result: "All visuals switch to navy/orange/green colours with rounded borders on a light grey page; card values become large navy numbers.",
      explanation: "dataColors controls series order, textClasses.callout styles card values, and visualStyles with \"*\" applies border, title and background defaults to every visual. The page entry sets the canvas background.",
    },
    {
      title: "Customize the current theme without JSON",
      scenario: "A teammate is not comfortable with JSON and only needs to change colours and the title font.",
      steps: [
        "View > Themes > dropdown arrow > Customize current theme",
        "Name and colors tab: change Color 1 to #1F4E79 and Color 2 to #F39C12; set sentiment colours",
        "Text tab: set Title font to Segoe UI Semibold 12",
        "Visuals tab > Border: turn on border with radius 8",
        "Page tab: set Wallpaper and Page background colours",
        "Click Apply; then View > Themes > Save current theme to export the JSON for reuse",
      ],
      result: "The report uses the new colours and the saved JSON file can be shared with the team.",
      explanation: "The dialog edits the same theme JSON behind the scenes. Saving it gives everyone an identical, valid file.",
    },
    {
      title: "Override one visual type: bigger slicer header and no column chart gridlines",
      scenario: "The brand team wants every slicer header to be 12pt bold-look and column charts to have no horizontal gridlines.",
      steps: [
        "Export the current theme (View > Themes > Save current theme)",
        "Open the JSON and add the entries from the code box inside visualStyles (next to the \"*\" and \"page\" entries)",
        "Validate the JSON (no trailing commas) using VS Code or any JSON validator",
        "View > Themes > Browse for themes and import the updated file",
        "Insert a slicer and a clustered column chart to check the defaults",
      ],
      code: `"slicer": {
  "*": {
    "header": [{ "show": true, "textSize": 12, "fontFamily": "Segoe UI Semibold" }]
  }
},
"clusteredColumnChart": {
  "*": {
    "valueAxis": [{ "gridlineShow": false }]
  }
}`,
      result: "New slicers show a 12pt Semibold header and column charts have no gridlines; other visuals are unaffected.",
      explanation: "visualStyles keys are visual type names (slicer, clusteredColumnChart, card, lineChart ...). Property names match the internal names used in the Format pane; exporting a theme helps you discover them.",
    },
  ],
  interview: [
    { q: "What is a Power BI report theme?", a: "A JSON-based set of default colours, fonts and visual formatting applied to the entire report, managed from View > Themes.", level: 'Easy' },
    { q: "How do you import a custom theme?", a: "View > Themes > Browse for themes, then select the .json file.", level: 'Easy' },
    { q: "What does dataColors control?", a: "The ordered list of colours used for data series and categories in visuals.", level: 'Easy' },
    { q: "What is the purpose of visualStyles in a theme JSON?", a: "It sets default property values for visuals, either for all visuals using \"*\" or for specific visual types like slicer or card, at the level of format cards and properties.", level: 'Medium' },
    { q: "You applied a new theme, but one chart keeps its old colours. Why?", a: "That chart has manual formatting with fixed colours, which overrides the theme. Reset the formatting to default or pick colours from the theme colour row.", level: 'Medium' },
    { q: "Your theme file fails to import. What do you check?", a: "That it is valid JSON (double quotes, no trailing commas or comments), it has a name, the file extension is .json, and property names follow the theme schema.", level: 'Medium' },
    { q: "Scenario: 30 developers build reports for one company. How do you keep branding consistent?", a: "Create a central corporate theme JSON (and optionally a .pbit template using it), store it in a shared location or version control, and require it as the starting point for all reports.", level: 'Hard' },
  ],
  practice: [
    { task: "Write a minimal valid theme JSON with a name and four dataColors and import it.", hint: "Only name is required.", solution: "{ \"name\": \"Mini Theme\", \"dataColors\": [\"#1F4E79\", \"#F39C12\", \"#27AE60\", \"#C0392B\"] } saved as mini.json, then View > Themes > Browse for themes." },
    { task: "Export the current theme and find the dataColors section.", hint: "Save current theme.", solution: "View > Themes > Save current theme > save as .json and open in a text editor; dataColors is an array near the top." },
    { task: "Add a textClasses entry so card values are 32pt and orange.", hint: "callout class.", solution: "\"textClasses\": { \"callout\": { \"fontSize\": 32, \"color\": \"#F39C12\" } }" },
    { task: "Switch to an Accessible built-in theme and check chart readability.", hint: "View > Themes gallery.", solution: "View > Themes > choose an Accessible theme (e.g. Accessible default). Charts use high-contrast, colour-blind friendly palettes." },
  ],
  quiz: [
    { question: "Which property is required in a theme JSON?", options: ["dataColors", "name", "visualStyles", "textClasses"], answer: 1, explanation: "Only name is required; other properties are optional." },
    { question: "Which textClass controls the big number in a card?", options: ["title", "label", "callout", "header"], answer: 2, explanation: "callout is used for card and KPI values." },
    { question: "In visualStyles, what does \"*\" mean?", options: ["Delete all", "Apply to all visuals or all styles", "Multiply values", "Comment"], answer: 1, explanation: "* is a wildcard for all visual types or style names." },
    { question: "Manual formatting on a visual vs the theme:", options: ["Theme always wins", "Manual formatting wins", "Both are averaged", "Power BI shows an error"], answer: 1, explanation: "Manual settings override theme defaults." },
    { question: "Which is valid JSON?", options: ["{ name: 'Theme' }", "{ \"name\": \"Theme\", }", "{ \"name\": \"Theme\" }", "{ \"name\" = \"Theme\" }"], answer: 2, explanation: "Keys and strings must use double quotes and there must be no trailing comma." },
  ],
};
