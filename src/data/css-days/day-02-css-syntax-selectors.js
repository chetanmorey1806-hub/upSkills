export default {
  id: "day-02-css-syntax-selectors",
  title: "CSS Syntax, Comments & Basic Selectors (Element, Class, ID, Universal, Group)",
  module: "Module 1: CSS Basics",
  day: 2,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Understand the anatomy of a CSS rule, how to write comments, and the five basic selectors you will use every day to target HTML elements.",
  objectives: [
    "Identify selector, declaration block, property and value in a CSS rule",
    "Write single-line and multi-line CSS comments",
    "Use element, class, id, universal and group selectors correctly",
    "Decide when to use a class versus an id",
  ],
  theory: [
    {
      heading: "Anatomy of a CSS Rule",
      content: "A CSS rule (rule set) has two parts:\n\n- **Selector**: which elements to style (e.g. `h1`)\n- **Declaration block**: inside `{ }`, one or more **declarations**\n\nEach declaration is a **property: value;** pair. Example: `color: red;` - property is `color`, value is `red`.\n\nAnalogy: the selector is the address on an envelope, the declarations are the instructions inside the letter.",
      syntax: `selector {
  property: value;
  property: value;
}

h1 {
  color: navy;
  font-size: 32px;
}`,
      tip: "If you misspell a property (colr: red) or a value, the browser silently ignores only that declaration. Check DevTools: invalid declarations are shown with a strike-through and a warning icon.",
    },
    {
      heading: "CSS Comments",
      content: "Comments explain your code to other developers (and to future you). The browser ignores them.\n\nCSS has only ONE comment style: `/* ... */`. It can span one line or many. There is NO `//` single-line comment in plain CSS - using it breaks the next rule.",
      syntax: `/* Single-line comment */

/*
  Multi-line comment
  Section: Header styles
*/
header { background: #111; }`,
      tip: "Common mistake: writing // comment in a .css file. The browser treats it as junk and drops the following rule.",
    },
    {
      heading: "Element (Type) and Universal Selectors",
      content: "The **element selector** targets every element of a given tag name: `p`, `h1`, `button`.\n\nThe **universal selector** `*` targets every element on the page. It is commonly used for a small reset, e.g. `* { box-sizing: border-box; }`.",
      syntax: `p { color: #333; }        /* all paragraphs */
* { margin: 0; }           /* every element */`,
      points: [
        "Element selectors are great for base styles (body, headings, links)",
        "Use * sparingly; styling everything can surprise you",
      ],
    },
    {
      heading: "Class Selector (.)",
      content: "A class selector starts with a dot and targets every element that has that class: `.btn` matches `<button class=\"btn\">`.\n\n- Classes are **reusable**: many elements can share a class\n- One element can have **multiple classes**: `class=\"btn btn-primary\"`\n- You can combine element and class: `p.note` matches only <p> with class note\n\nClasses are the workhorse of real-world CSS.",
      syntax: `.card { padding: 16px; border: 1px solid #ddd; }
.highlight { background: yellow; }
p.note { font-style: italic; }`,
      tip: "Class names are case-sensitive and cannot start with a digit. Prefer meaningful names like .error-message, not .red-text.",
    },
    {
      heading: "ID Selector (#)",
      content: "An ID selector starts with `#` and targets the ONE element with that id: `#main-title` matches `<h1 id=\"main-title\">`.\n\n- An id must be **unique** on the page\n- IDs are also used for anchor links (#section) and JavaScript (getElementById)\n- ID selectors are very strong (high specificity), which makes them hard to override\n\nBest practice: style with classes, use ids for linking and scripting.",
      syntax: `#site-logo { width: 120px; }`,
    },
    {
      heading: "Group Selector (,)",
      content: "When several selectors share the same declarations, list them separated by commas instead of repeating the rule.\n\nAnalogy: sending one group message instead of texting each friend separately.",
      syntax: `/* Instead of repeating */
h1 { font-family: Georgia, serif; }
h2 { font-family: Georgia, serif; }

/* Group them */
h1, h2, h3 { font-family: Georgia, serif; }`,
      tip: "If ONE selector in a group is invalid, the whole rule is dropped. Double-check each part.",
    },
  ],
  examples: [
    {
      title: "Element Selector for Base Styles",
      scenario: "Give every paragraph and heading on a blog page a consistent look.",
      steps: [
        "Create index.html with an h1 and a few paragraphs",
        "Write rules using the h1 and p element selectors",
        "Click Run",
      ],
      code: `h1 { color: #7c3aed; }
p  { color: #4b5563; font-size: 18px; }`,
      playground: {
        html: `<h1>My Blog</h1>
<p>First paragraph styled by the p selector.</p>
<p>Second paragraph gets the same style automatically.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
h1 { color: #7c3aed; }
p  { color: #4b5563; font-size: 18px; }`,
      },
      result: "The heading is purple; both paragraphs are grey and 18px.",
      explanation: "Element selectors match by tag name, so every <p> gets the paragraph rule without adding any attributes.",
    },
    {
      title: "Reusable Classes and Multiple Classes",
      scenario: "Build buttons that share a base style, with color variants.",
      steps: [
        "Create three buttons with class=\"btn\"",
        "Add a second class (primary / danger) to two of them",
        "Write .btn, .primary and .danger rules",
        "Click Run",
      ],
      code: `.btn { padding: 10px 18px; border: none; border-radius: 6px; font-size: 16px; }
.primary { background: #2563eb; color: white; }
.danger  { background: #dc2626; color: white; }`,
      playground: {
        html: `<button class="btn">Default</button>
<button class="btn primary">Save</button>
<button class="btn danger">Delete</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.btn { padding: 10px 18px; border: none; border-radius: 6px; font-size: 16px; background: #e5e7eb; cursor: pointer; }
.primary { background: #2563eb; color: white; }
.danger  { background: #dc2626; color: white; }`,
      },
      result: "Three rounded buttons: grey Default, blue Save, red Delete.",
      explanation: "Every button gets .btn base styles. The second class adds/overrides background and color. Multiple classes are separated by spaces in the class attribute.",
    },
    {
      title: "ID Selector for a Unique Element",
      scenario: "Style the single page banner differently from everything else.",
      steps: [
        "Give one div id=\"banner\"",
        "Write a #banner rule",
        "Click Run",
      ],
      code: `#banner {
  background: #0f172a;
  color: #fbbf24;
  padding: 24px;
  text-align: center;
}`,
      playground: {
        html: `<div id="banner">Big Summer Sale - 50% Off</div>
<p>Regular content below the banner.</p>`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
p { padding: 0 16px; }
#banner { background: #0f172a; color: #fbbf24; padding: 24px; text-align: center; font-size: 22px; }`,
      },
      result: "A dark navy banner with golden centered text, followed by a normal paragraph.",
      explanation: "#banner matches only the element whose id is banner. IDs must be unique, so this rule is for one element only.",
    },
    {
      title: "Universal, Group Selectors and Comments",
      scenario: "Reset default margins, then give all headings one font with a single grouped rule.",
      steps: [
        "Add a /* comment */ describing each section",
        "Write * { margin: 0; } as a reset",
        "Group h1, h2, h3 into one rule",
        "Click Run",
      ],
      code: `/* Reset: remove default margins */
* { margin: 0; }

/* Headings share one font and color */
h1, h2, h3 { font-family: Georgia, serif; color: #065f46; }`,
      playground: {
        html: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p>Notice there is no gap between elements: margins were reset.</p>`,
        css: `/* Reset: remove default margins */
* { margin: 0; }
body { padding: 16px; font-family: system-ui, sans-serif; }

/* Headings share one font and color */
h1, h2, h3 { font-family: Georgia, serif; color: #065f46; }`,
      },
      result: "All three headings are dark green serif text, stacked tightly with no default margins.",
      explanation: "* matches every element, removing browser default margins. The comma-separated group applies one declaration block to h1, h2 and h3. Comments are ignored by the browser.",
    },
  ],
  interview: [
    { q: "What are the parts of a CSS rule?", a: "A selector and a declaration block. The block contains declarations, each a property: value pair ending with a semicolon.", level: "Easy" },
    { q: "How do you write comments in CSS?", a: "Only with /* comment */. It can span multiple lines. // is not valid in plain CSS (it is valid in Sass/SCSS).", level: "Easy" },
    { q: "What is the difference between a class and an id?", a: "A class (.name) can be reused on many elements and an element can have many classes. An id (#name) must be unique per page and has much higher specificity. Use classes for styling, ids for anchors and JS hooks.", level: "Easy" },
    { q: "What does the universal selector do and when would you use it?", a: "* selects every element. It is commonly used in resets like * { box-sizing: border-box; margin: 0; }.", level: "Easy" },
    { q: "What is a group selector?", a: "A comma-separated list of selectors sharing one declaration block, e.g. h1, h2, h3 { ... }. It avoids repetition.", level: "Easy" },
    { q: "What happens if one selector in a group is invalid?", a: "The entire rule is discarded, because a selector list with an invalid selector is invalid as a whole (except inside forgiving lists like :is()/:where()).", level: "Medium" },
    { q: "What is the difference between p.intro and p .intro?", a: "p.intro (no space) matches a <p> that has class intro. p .intro (with space) matches any element with class intro that is inside a <p> (descendant).", level: "Medium" },
    { q: "Why do many style guides discourage ID selectors for styling?", a: "IDs have very high specificity, so overriding them requires another id or !important. They are not reusable. Classes keep specificity low and predictable.", level: "Medium" },
    { q: "What does the browser do with an invalid declaration?", a: "It ignores only that declaration and continues with the rest of the block. This is called error recovery.", level: "Medium" },
    { q: "Are class names case-sensitive?", a: "Yes. .Card and .card are different classes in HTML documents. Element names in HTML are case-insensitive.", level: "Hard" },
  ],
  practice: [
    {
      task: "Style all <li> elements with a dark blue color and 18px font size using an element selector.",
      hint: "Selector is just li.",
      solution: `li { color: darkblue; font-size: 18px; }`,
    },
    {
      task: "Create a .badge class (small rounded label) and apply it to three <span>s; add a .badge-success class that turns one green.",
      hint: "Use two classes on the same element: class=\"badge badge-success\".",
      solution: `<span class="badge">New</span>
<span class="badge badge-success">Paid</span>
<span class="badge">Draft</span>

<style>
.badge { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #e5e7eb; font-size: 13px; }
.badge-success { background: #16a34a; color: white; }
</style>`,
    },
    {
      task: "Give a footer with id=\"page-footer\" a black background and white centered text.",
      hint: "Use #page-footer.",
      solution: `<footer id="page-footer">© 2026 My Site</footer>
<style>
#page-footer { background: black; color: white; text-align: center; padding: 16px; }
</style>`,
    },
    {
      task: "Write a stylesheet with comment headings (/* Reset */, /* Typography */) that resets margins with * and groups h1, h2, h3, h4 to use a serif font.",
      hint: "Comments use /* */ only.",
      solution: `/* Reset */
* { margin: 0; padding: 0; }

/* Typography */
h1, h2, h3, h4 { font-family: Georgia, 'Times New Roman', serif; }`,
    },
  ],
  quiz: [
    { question: "In 'h1 { color: red; }', what is 'color'?", options: ["Selector", "Value", "Property", "Declaration block"], answer: 2, explanation: "color is the property; red is the value; h1 is the selector." },
    { question: "Which is the correct CSS comment?", options: ["/* comment */", "// comment", "<!-- comment -->", "# comment"], answer: 0, explanation: "CSS only supports /* */ comments." },
    { question: "Which selector targets elements with class=\"menu\"?", options: ["#menu", "menu", "*menu", ".menu"], answer: 3, explanation: "Class selectors start with a dot." },
    { question: "What does 'h1, p { color: blue; }' do?", options: ["Styles p inside h1", "Styles both h1 and p elements", "Styles h1 followed by p", "Is invalid"], answer: 1, explanation: "Commas create a group selector." },
    { question: "How many elements should share the same id on a page?", options: ["Any number", "Two", "Only one", "Ten maximum"], answer: 2, explanation: "IDs must be unique within a document." },
  ],
};
