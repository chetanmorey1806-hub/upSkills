export default {
  id: "day-12-combinators-attribute-selectors",
  title: "Combinators (Descendant, Child, Adjacent, General Sibling) and Attribute Selectors",
  module: "Module 3: Selectors & Cascade",
  day: 12,
  level: "Intermediate",
  duration: "1.5 hours",
  summary: "Target elements based on their relationship to other elements using the four combinators, and based on their attributes and attribute values using attribute selectors.",
  objectives: [
    "Use descendant (space) and child (>) combinators correctly",
    "Style siblings with adjacent (+) and general (~) sibling combinators",
    "Select elements by attribute presence and value with [attr], =, ^=, $=, *=, ~= and |=",
    "Write precise selectors without adding extra classes to HTML",
  ],
  theory: [
    {
      heading: "What Are Combinators?",
      content: "A combinator joins two selectors and describes the **relationship** between them in the HTML tree. Think of the DOM as a family tree:\n\n- **Descendant** (space): any child, grandchild, great-grandchild...\n- **Child** (>): direct children only\n- **Adjacent sibling** (+): the very next sibling\n- **General sibling** (~): all following siblings\n\nThe browser reads selectors from **right to left**: in `nav a`, it finds every <a> and then checks if it has a <nav> ancestor.",
    },
    {
      heading: "Descendant Combinator (space)",
      content: "`A B` selects every B that is anywhere inside A, at any depth.\n\nExample: `article p` matches all paragraphs inside articles, even inside nested divs.\n\nIt is the most used combinator, but it can be too broad: `.menu li` also hits list items of a nested sub-menu.",
      syntax: `article p { line-height: 1.7; }
.footer a { color: #94a3b8; }`,
    },
    {
      heading: "Child Combinator (>)",
      content: "`A > B` selects B only if it is a **direct child** of A (one level down).\n\nUse it to style top-level items without affecting nested ones, e.g. top-level menu items but not sub-menu items.",
      syntax: `.menu > li { display: inline-block; }   /* only first-level items */
ul > li { font-weight: bold; }`,
    },
    {
      heading: "Adjacent (+) and General (~) Sibling Combinators",
      content: "Siblings share the same parent.\n\n- `A + B` selects the B that comes **immediately after** A\n- `A ~ B` selects **every** B that comes after A (not necessarily directly)\n\nSiblings combinators only look **forward** (later siblings), never backward.\n\nClassic uses:\n- `h2 + p` - style the intro paragraph right after each heading\n- `li + li` - add a divider between list items (not before the first)\n- `input:checked ~ .panel` - show a panel when a checkbox is checked (CSS-only toggles)",
      syntax: `h2 + p { font-size: 1.15rem; }
li + li { border-top: 1px solid #e5e7eb; }
.error ~ p { color: crimson; }`,
    },
    {
      heading: "Attribute Selectors",
      content: "Attribute selectors match elements by their HTML attributes, written in square brackets:\n\n- `[attr]` - has the attribute: `input[required]`\n- `[attr=\"v\"]` - exact value: `input[type=\"email\"]`\n- `[attr^=\"v\"]` - **starts with**: `a[href^=\"https\"]`\n- `[attr$=\"v\"]` - **ends with**: `a[href$=\".pdf\"]`\n- `[attr*=\"v\"]` - **contains**: `a[href*=\"youtube\"]`\n- `[attr~=\"v\"]` - contains the **word** v in a space-separated list\n- `[attr|=\"v\"]` - exactly v or starts with v- : `[lang|=\"en\"]` matches en, en-US\n- Add ` i` before ] for case-insensitive: `[href$=\".PDF\" i]`\n\nThey are perfect for styling form inputs by type, external links, file-type icons and data-* attributes.",
      syntax: `input[type="text"], input[type="email"] { border: 1px solid #ccc; }
a[href^="http"] { color: #0369a1; }
a[href$=".pdf"]::after { content: " (PDF)"; }
[data-status="active"] { color: green; }`,
      tip: "Attribute selectors have the same specificity as a class (0,1,0). Quotes around the value are recommended, and required when the value has spaces or special characters.",
    },
    {
      heading: "Combining Everything",
      content: "You can chain combinators and attribute selectors freely:\n\n`form > .field input[type=\"checkbox\"] + label`\n\nRead it right to left: a label that comes right after a checkbox input, which is inside a .field that is a direct child of a form.\n\nBest practice: keep selectors short (2-3 parts). Long chains are fragile (they break when HTML changes) and harder to override.\n\nComing next: pseudo-classes (Day 13).",
    },
  ],
  examples: [
    {
      title: "Descendant vs Child Combinator",
      scenario: "A menu with a nested sub-menu: style only top-level items differently from all items.",
      steps: [
        "Create a nested list with class menu",
        "Color all items with .menu li (descendant)",
        "Make only top-level items bold with .menu > li (child)",
        "Click Run",
      ],
      code: `.menu li   { color: #2563eb; }       /* every level */
.menu > li { font-weight: bold; }    /* first level only */`,
      playground: {
        html: `<ul class="menu">
  <li>Products
    <ul>
      <li>Laptops</li>
      <li>Phones</li>
    </ul>
  </li>
  <li>Services</li>
  <li>About</li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; font-size: 18px; }
.menu li   { color: #2563eb; }
.menu > li { font-weight: bold; }
.menu li li { font-weight: normal; }`,
      },
      result: "All items are blue; Products, Services and About are bold while Laptops and Phones are normal weight.",
      explanation: "Descendant matches at any depth; child matches only direct children of .menu. (font-weight inherits, so nested items are reset to normal with .menu li li.)",
    },
    {
      title: "Sibling Combinators: Lead Paragraph and Dividers",
      scenario: "Make the first paragraph after each heading larger, and put lines between list items but not above the first.",
      steps: [
        "Write h2 + p for the lead paragraph",
        "Write h2 ~ p for all paragraphs after the heading (color)",
        "Write li + li for dividers",
        "Click Run",
      ],
      code: `h2 ~ p { color: #475569; }
h2 + p { font-size: 1.2rem; color: #0f172a; }
li + li { border-top: 1px solid #cbd5e1; }`,
      playground: {
        html: `<p>Paragraph before the heading (not matched).</p>
<h2>Getting Started</h2>
<p>Lead paragraph right after the heading.</p>
<p>Second paragraph after the heading.</p>
<p>Third paragraph after the heading.</p>
<ul>
  <li>Install</li><li>Configure</li><li>Deploy</li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; color: #b91c1c; }
h2 ~ p { color: #475569; }
h2 + p { font-size: 1.2rem; color: #0f172a; font-weight: 600; }
ul { list-style: none; padding: 0; width: 200px; border: 1px solid #cbd5e1; color: #111; }
li { padding: 10px; }
li + li { border-top: 1px solid #cbd5e1; }`,
      },
      result: "The paragraph before the heading stays red. The paragraph right after the heading is large and bold; the next ones are slate grey. The list has lines between items only.",
      explanation: "+ selects only the immediately following sibling; ~ selects all following siblings; neither looks backwards, so the first paragraph is untouched.",
    },
    {
      title: "Attribute Selectors for Links",
      scenario: "Automatically label external links, PDF downloads and email links without adding classes.",
      steps: [
        "Create a list of links with various href values",
        "Style a[href^=\"http\"], a[href$=\".pdf\"], a[href^=\"mailto:\"]",
        "Click Run",
      ],
      code: `a[href^="http"]::after   { content: " ↗"; }
a[href$=".pdf"]           { color: #b91c1c; }
a[href$=".pdf"]::before   { content: "PDF "; font-weight: bold; }
a[href^="mailto:"]        { color: #15803d; }
a[href*="example"]        { background: #fef9c3; }`,
      playground: {
        html: `<ul>
  <li><a href="https://developer.mozilla.org">MDN Docs</a></li>
  <li><a href="/files/report.pdf">Annual report</a></li>
  <li><a href="mailto:hello@example.com">Email us</a></li>
  <li><a href="/about">About (internal)</a></li>
  <li><a href="https://example.com/page">Example site</a></li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; line-height: 2; }
a { color: #1d4ed8; }
a[href^="http"]::after { content: " ↗"; }
a[href$=".pdf"] { color: #b91c1c; }
a[href$=".pdf"]::before { content: "PDF "; font-weight: bold; }
a[href^="mailto:"] { color: #15803d; }
a[href*="example"] { background: #fef9c3; }`,
      },
      result: "External links show an ↗ arrow; the PDF link is red with a 'PDF' prefix; the mailto link is green; links containing 'example' get a yellow highlight; the internal link is plain blue.",
      explanation: "^= matches the beginning of the value, $= the end, *= anywhere. The (mailto) email link also contains 'example', so it is highlighted too.",
    },
    {
      title: "Styling Form Inputs and data-* Attributes",
      scenario: "Style inputs by type and status badges by a data-status attribute.",
      steps: [
        "Create text, email and checkbox inputs plus status spans with data-status",
        "Use input[type=\"...\"] and [required] selectors",
        "Use [data-status=\"...\"] for badge colors",
        "Click Run",
      ],
      code: `input[type="text"], input[type="email"] { border: 2px solid #94a3b8; }
input[required] { border-left: 6px solid #f97316; }
[data-status="paid"]    { background: #dcfce7; }
[data-status="overdue"] { background: #fee2e2; }`,
      playground: {
        html: `<form>
  <input type="text" placeholder="Name"><br>
  <input type="email" placeholder="Email (required)" required><br>
  <label><input type="checkbox"> Subscribe</label>
</form>
<p>
  <span class="badge" data-status="paid">Paid</span>
  <span class="badge" data-status="pending">Pending</span>
  <span class="badge" data-status="overdue">Overdue</span>
</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input[type="text"], input[type="email"] { border: 2px solid #94a3b8; padding: 8px; border-radius: 6px; margin-bottom: 8px; width: 240px; }
input[required] { border-left: 6px solid #f97316; }
input[type="checkbox"] { width: 18px; height: 18px; vertical-align: middle; }
.badge { padding: 4px 12px; border-radius: 999px; font-size: 14px; }
[data-status="paid"]    { background: #dcfce7; color: #166534; }
[data-status="pending"] { background: #fef3c7; color: #92400e; }
[data-status="overdue"] { background: #fee2e2; color: #991b1b; }`,
      },
      result: "Text and email inputs have grey borders; the required email input also has a thick orange left border. Three badges are green, amber and red according to their data-status.",
      explanation: "Attribute selectors read HTML attributes directly, so JS can change data-status and the color updates automatically.",
    },
  ],
  interview: [
    { q: "What is the difference between 'div p' and 'div > p'?", a: "'div p' selects every p anywhere inside a div (descendant). 'div > p' selects only p elements that are direct children of a div.", level: "Easy" },
    { q: "What is the difference between + and ~?", a: "A + B selects only the B immediately following A. A ~ B selects all B siblings that follow A.", level: "Easy" },
    { q: "Can sibling combinators select previous siblings?", a: "No, they only select following siblings. (Modern :has() can be used to style based on later siblings, e.g. A:has(+ B).)", level: "Medium" },
    { q: "How would you select all links that open external https pages?", a: "a[href^=\"https://\"]", level: "Easy" },
    { q: "How do you select links to PDF files regardless of case?", a: "a[href$=\".pdf\" i]", level: "Medium" },
    { q: "What is the difference between [class~=\"btn\"] and [class*=\"btn\"]?", a: "~= matches the whole word btn in a space-separated list (class=\"btn primary\"). *= matches the substring anywhere, so it also matches class=\"btn-group\" or \"submit-btn\".", level: "Hard" },
    { q: "What is the specificity of an attribute selector?", a: "Same as a class: (0,1,0).", level: "Medium" },
    { q: "Why does the browser read selectors right to left?", a: "It starts with the rightmost (key) selector to quickly filter candidates, then checks ancestors/siblings. Hence very generic key selectors like 'div *' are less efficient.", level: "Hard" },
    { q: "Give a use of li + li.", a: "Adding separators or spacing between list items without affecting the first item, e.g. li + li { border-top: 1px solid #ddd; }.", level: "Medium" },
    { q: "What does [lang|=\"en\"] match?", a: "Elements with lang exactly \"en\" or starting with \"en-\" such as en-US or en-GB.", level: "Hard" },
  ],
  practice: [
    {
      task: "In a .card, make only direct child paragraphs grey, not paragraphs nested deeper inside .card .footer.",
      hint: "Use the child combinator.",
      solution: `.card > p { color: #6b7280; }`,
    },
    {
      task: "Give every image that directly follows an h3 a top margin of 0 and a rounded border.",
      hint: "h3 + img",
      solution: `h3 + img { margin-top: 0; border-radius: 12px; }`,
    },
    {
      task: "Style all inputs of type password with a monospace font and all disabled inputs with a grey background.",
      hint: "input[type=\"password\"], input[disabled]",
      solution: `input[type="password"] { font-family: monospace; letter-spacing: 0.2em; }
input[disabled] { background: #e5e7eb; cursor: not-allowed; }`,
    },
    {
      task: "Add an icon prefix to links: ZIP files get 'ZIP', links to youtube get a red color, and links opening in a new tab (target=\"_blank\") get an arrow after them.",
      hint: "$=, *=, and [target=\"_blank\"]::after",
      solution: `a[href$=".zip"]::before { content: "ZIP "; font-weight: bold; }
a[href*="youtube"] { color: #dc2626; }
a[target="_blank"]::after { content: " ↗"; }`,
    },
    {
      task: "Build a CSS-only reveal: when a checkbox is checked, the following .details div becomes visible.",
      hint: "input:checked ~ .details (pseudo-class preview).",
      solution: `<input type="checkbox" id="more"> <label for="more">Show more</label>
<div class="details">Hidden details revealed!</div>
<style>
.details { display: none; padding: 10px; background: #ecfeff; }
#more:checked ~ .details { display: block; }
</style>`,
    },
  ],
  quiz: [
    { question: "Which selector matches only direct children?", options: ["div p", "div > p", "div + p", "div ~ p"], answer: 1, explanation: "> is the child combinator." },
    { question: "'h1 + p' selects:", options: ["All p inside h1", "All p after h1", "The p immediately after h1", "The p before h1"], answer: 2, explanation: "+ is the adjacent sibling combinator." },
    { question: "Which selects links whose href ends with .jpg?", options: ["a[href$=\".jpg\"]", "a[href^=\".jpg\"]", "a[href*=\".jpg\"]", "a[href=\".jpg\"]"], answer: 0, explanation: "$= means ends with." },
    { question: "Which combinator selects ALL following siblings?", options: ["+", ">", "space", "~"], answer: 3, explanation: "~ is the general sibling combinator." },
    { question: "What does input[required] select?", options: ["Inputs with class required", "Inputs that have the required attribute", "Inputs with id required", "Nothing - invalid"], answer: 1, explanation: "[attr] matches presence of the attribute." },
  ],
};
