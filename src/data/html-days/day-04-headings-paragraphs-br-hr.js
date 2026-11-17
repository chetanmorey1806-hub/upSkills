export default {
  id: 'day-04-headings-paragraphs-br-hr',
  title: 'Headings <h1> to <h6>, Paragraph <p>, Line Break <br>, Horizontal Line <hr>',
  module: 'Module 1: HTML Fundamentals',
  day: 4,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Headings and paragraphs are the backbone of every article, blog and product page. Learn to build a clear heading hierarchy, write paragraphs, and use <br> and <hr> only where they make sense.',
  objectives: [
    'Use <h1> to <h6> to create a logical heading hierarchy',
    'Explain why headings matter for SEO and screen readers',
    'Write paragraphs with <p> and understand whitespace collapsing',
    'Use <br> for meaningful line breaks and <hr> for thematic breaks',
    'Avoid common misuse such as choosing headings for size or stacking <br> for spacing',
  ],
  theory: [
    {
      heading: 'Heading tags <h1> to <h6>',
      content: "HTML has six levels of headings. `<h1>` is the most important (main title) and `<h6>` the least important. Browsers show them in decreasing size and in bold by default.\n\nThink of a book:\n- `<h1>` = book title (usually **one per page**)\n- `<h2>` = chapter titles\n- `<h3>` = sections inside a chapter\n- `<h4>` to `<h6>` = deeper sub-sections (rarely needed)\n\nHeadings are **block-level** elements: each starts on a new line and takes the full width.",
      syntax: '<h1>Main title</h1>\n<h2>Chapter</h2>\n<h3>Section</h3>\n<h4>Sub-section</h4>\n<h5>Minor heading</h5>\n<h6>Smallest heading</h6>',
    },
    {
      heading: 'Heading hierarchy, SEO and accessibility',
      content: "Headings are not about size; they are about **meaning and structure**.\n\n- **Screen reader users** jump from heading to heading (like a table of contents) to scan a page. Skipped or misused levels confuse them.\n- **Search engines** use headings to understand what the page is about. A clear `<h1>` with the main topic helps SEO.\n\nRules of thumb:\n1. Use **one `<h1>`** per page describing the main topic.\n2. **Do not skip levels** going down: after `<h2>` use `<h3>`, not `<h5>`.\n3. You may jump back up any number of levels (from `<h4>` back to `<h2>` for a new chapter).\n4. **Never pick a heading just because of its size.** If you want big text that is not a heading, use CSS.",
      tip: 'Common mistake: using <h4> for a small subtitle because it "looks right". Choose the level by structure, then style with CSS.',
    },
    {
      heading: 'Paragraph <p>',
      content: "`<p>` defines a **paragraph** of text. It is block-level, and browsers add space (margin) above and below it.\n\n**Whitespace collapsing:** inside HTML, multiple spaces, tabs and line breaks in your source code are shown as **one single space**. Pressing Enter in your code does **not** create a new line on the page. This lets you format your code neatly without affecting the output.\n\nTo show text exactly as typed (poems, code) you can use `<pre>` (preformatted), which keeps spaces and line breaks.\n\nAlso remember: a `<p>` cannot contain block elements like headings, lists or other paragraphs.",
      syntax: '<p>This is the first paragraph.</p>\n<p>This     text   has    extra   spaces\n   and a new line, but displays on one line.</p>',
    },
    {
      heading: 'Line break <br>',
      content: "`<br>` forces a **line break** inside text, without starting a new paragraph. It is a **void element** (no closing tag).\n\nUse `<br>` only where the line break is **part of the content**:\n- Postal addresses\n- Poems and song lyrics\n- Signatures\n\nDo **not** use multiple `<br><br><br>` to create vertical space between blocks. That is a presentation job for CSS (`margin`). Stacked breaks are hard to maintain and confusing for screen readers.",
      syntax: '<p>\n  Sunrise Bakery<br>\n  42 Park Street<br>\n  Kolkata 700016\n</p>',
      tip: '<br> for line breaks inside content, new <p> for new ideas, CSS margin for spacing.',
    },
    {
      heading: 'Horizontal rule <hr>',
      content: "`<hr>` represents a **thematic break** between paragraph-level content: a change of topic or scene, like the \"* * *\" in a novel. Browsers draw it as a horizontal line.\n\nIt is a void element. In HTML5 its meaning is semantic (topic change), not just decorative. Old presentational attributes such as `size`, `noshade` and `width` are **obsolete**; style it with CSS instead (for example `border-top: 2px dashed gray`).",
      syntax: '<p>That was the end of the first chapter.</p>\n<hr>\n<p>Ten years later...</p>',
    },
  ],
  examples: [
    {
      title: 'All six headings',
      scenario: 'See the default size of each heading level.',
      steps: [
        'Create headings.html with the boilerplate',
        'Add <h1> through <h6>',
        'Click Run and compare sizes',
      ],
      code: `<h1>Heading level 1</h1>
<h2>Heading level 2</h2>
<h3>Heading level 3</h3>
<h4>Heading level 4</h4>
<h5>Heading level 5</h5>
<h6>Heading level 6</h6>`,
      playground: {
        html: `<h1>Heading level 1</h1>
<h2>Heading level 2</h2>
<h3>Heading level 3</h3>
<h4>Heading level 4</h4>
<h5>Heading level 5</h5>
<h6>Heading level 6</h6>`,
      },
      result: 'Six bold lines decreasing in size from h1 (largest) to h6 (smallest, smaller than normal text).',
      explanation: 'Each heading is block-level so it sits on its own line. The default sizes come from the browser stylesheet, roughly 2em, 1.5em, 1.17em, 1em, 0.83em and 0.67em.',
    },
    {
      title: 'A blog article with correct hierarchy',
      scenario: 'Structure a recipe blog post so readers and Google understand it.',
      steps: [
        'Add one <h1> for the post title',
        'Add <h2> for main sections (Ingredients, Method)',
        'Add <h3> for sub-steps inside Method',
        'Write <p> paragraphs under each heading',
        'Run the script to print the heading outline',
      ],
      code: `<h1>Easy Masala Chai</h1>
<p>A warm, spiced tea ready in 10 minutes.</p>

<h2>Ingredients</h2>
<p>Water, milk, tea leaves, ginger, cardamom and sugar.</p>

<h2>Method</h2>
<h3>Step 1: Boil the spices</h3>
<p>Boil water with crushed ginger and cardamom.</p>
<h3>Step 2: Add tea and milk</h3>
<p>Add tea leaves, then milk and sugar. Simmer for 3 minutes.</p>`,
      playground: {
        html: `<h1>Easy Masala Chai</h1>
<p>A warm, spiced tea ready in 10 minutes.</p>
<h2>Ingredients</h2>
<p>Water, milk, tea leaves, ginger, cardamom and sugar.</p>
<h2>Method</h2>
<h3>Step 1: Boil the spices</h3>
<p>Boil water with crushed ginger and cardamom.</p>
<h3>Step 2: Add tea and milk</h3>
<p>Add tea leaves, then milk and sugar. Simmer for 3 minutes.</p>
<hr>
<pre id="outline"></pre>`,
        js: `const lines = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => {
  const level = Number(h.tagName[1]);
  return '  '.repeat(level - 1) + h.tagName + ': ' + h.textContent;
});
document.getElementById('outline').textContent = 'Document outline:\\n' + lines.join('\\n');
console.log(lines.join('\\n'));`,
      },
      result: 'The article followed by an indented "Document outline" showing H1, then two H2s, with two H3s under Method.',
      explanation: 'This outline is roughly what a screen reader user sees when listing headings. Because no level was skipped, the structure reads like a clean table of contents.',
    },
    {
      title: 'Whitespace collapsing vs <br> vs <pre>',
      scenario: 'Display a postal address and a short poem correctly.',
      steps: [
        'Write an address in a <p> using Enter keys only and run it',
        'Rewrite it using <br> at the end of each line',
        'Write a poem inside <pre> to keep spacing',
        'Click Run and compare',
      ],
      code: `<p>
  Sunrise Bakery
  42 Park Street
  Kolkata
</p>

<p>
  Sunrise Bakery<br>
  42 Park Street<br>
  Kolkata
</p>

<pre>
Twinkle,   twinkle,
     little star
</pre>`,
      playground: {
        html: `<h3>Without &lt;br&gt; (collapsed)</h3>
<p>
  Sunrise Bakery
  42 Park Street
  Kolkata
</p>
<h3>With &lt;br&gt;</h3>
<p>
  Sunrise Bakery<br>
  42 Park Street<br>
  Kolkata
</p>
<h3>With &lt;pre&gt;</h3>
<pre>
Twinkle,   twinkle,
     little star
</pre>`,
      },
      result: 'The first address appears on one line, the second on three lines, and the poem keeps its exact spacing in a monospace font.',
      explanation: 'The browser collapses new lines and spaces in normal text. <br> inserts a real line break. <pre> preserves all whitespace exactly as written.',
    },
    {
      title: 'Thematic break with a styled <hr>',
      scenario: 'Separate two scenes of a short story and style the line with CSS.',
      steps: [
        'Write two paragraphs about different scenes',
        'Place <hr> between them',
        'Style hr with CSS instead of obsolete attributes',
        'Click Run',
      ],
      code: `<p>The train left the station at midnight.</p>
<hr>
<p>Three years later, Meera returned to the same platform.</p>

<style>
  hr { border: none; border-top: 2px dashed #888; width: 50%; margin: 24px auto; }
</style>`,
      playground: {
        html: `<p>The train left the station at midnight. Meera waved goodbye.</p>
<hr>
<p>Three years later, Meera returned to the same platform.</p>`,
        css: `body { font-family: Georgia, serif; }
hr { border: none; border-top: 2px dashed #888; width: 50%; margin: 24px auto; }`,
      },
      result: 'Two paragraphs separated by a centred, dashed grey line.',
      explanation: '<hr> marks a change of scene (semantic meaning). CSS controls the look. Old attributes such as <hr size="3" noshade> are obsolete in HTML5.',
    },
  ],
  interview: [
    { q: 'How many heading levels are there in HTML?', a: 'Six: <h1> (most important) through <h6> (least important).', level: 'Easy' },
    { q: 'How many <h1> elements should a page have?', a: 'Best practice is one <h1> describing the main topic of the page. HTML does not forbid multiple, but one clear <h1> is best for SEO and accessibility.', level: 'Easy' },
    { q: 'Why should you not skip heading levels?', a: 'Screen readers and search engines use headings to build an outline. Skipping from <h2> to <h5> creates a confusing structure and implies missing sections. Choose levels by structure and use CSS for size.', level: 'Medium' },
    { q: 'What is the difference between <br> and <p>?', a: '<p> creates a new paragraph block (with margins), representing a separate idea. <br> only breaks the line inside existing text, used where line breaks are part of the content, like addresses or poems.', level: 'Easy' },
    { q: 'Why is using multiple <br> tags for spacing bad practice?', a: 'It mixes presentation into HTML, is hard to maintain, behaves inconsistently and is announced oddly by screen readers. Spacing should be done with CSS margin or padding.', level: 'Medium' },
    { q: 'What does <hr> represent in HTML5?', a: 'A thematic break between paragraph-level elements, such as a change of topic or scene. Its look is controlled by CSS.', level: 'Medium' },
    { q: 'What is whitespace collapsing?', a: 'Browsers treat any sequence of spaces, tabs and new lines in normal text as a single space. Use <br>, <pre>, entities like &nbsp;, or CSS white-space to preserve whitespace.', level: 'Medium' },
    { q: 'What is <pre> used for?', a: 'Preformatted text: it preserves spaces and line breaks exactly and uses a monospace font by default. Useful for code samples, ASCII art and poems.', level: 'Easy' },
    { q: 'Are headings block-level or inline elements?', a: 'Block-level. Each starts on a new line and occupies the full available width.', level: 'Easy' },
    { q: 'How do headings affect SEO?', a: 'Search engines give weight to heading text to understand the topics of a page. A descriptive <h1> and logical <h2>/<h3> structure help ranking and featured snippets, but keyword stuffing in headings is penalised.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a page about your city with one <h1>, three <h2> sections (Food, Places, Festivals) and a paragraph under each.',
      hint: 'One h1 at top; h2 for each section.',
      solution: `<h1>Exploring Jaipur</h1>
<h2>Food</h2>
<p>Try dal baati churma and pyaaz kachori.</p>
<h2>Places</h2>
<p>Visit Amber Fort, Hawa Mahal and City Palace.</p>
<h2>Festivals</h2>
<p>The Jaipur Literature Festival and Teej are famous.</p>`,
    },
    {
      task: 'Write your college address using a single paragraph with <br> tags so each part is on its own line.',
      hint: 'Put <br> at the end of each line except the last.',
      solution: `<p>
  ABC Institute of Technology<br>
  Sector 62<br>
  Noida, Uttar Pradesh<br>
  201309
</p>`,
    },
    {
      task: 'Fix the hierarchy: <h1>Shop</h1><h4>Men</h4><h6>Shirts</h6><h4>Women</h4><h6>Dresses</h6>',
      hint: 'Do not skip levels: h1 > h2 > h3.',
      solution: `<h1>Shop</h1>
<h2>Men</h2>
<h3>Shirts</h3>
<h2>Women</h2>
<h3>Dresses</h3>`,
    },
    {
      task: 'Write a two-scene story separated by <hr>, and style the hr as a 3px solid teal line that is 60% wide and centred.',
      hint: 'Remove default border then set border-top; use margin auto to centre.',
      solution: `<style>
  hr { border: none; border-top: 3px solid teal; width: 60%; margin: 20px auto; }
</style>
<p>Arjun opened his first shop in a small lane.</p>
<hr>
<p>Five years later, he had ten shops across the city.</p>`,
    },
    {
      task: 'Display this code exactly with its indentation using <pre>: a function with two indented lines.',
      hint: 'Everything inside <pre> keeps its spaces. Escape < as &lt; if needed.',
      solution: `<pre>
function greet() {
    let name = "Asha";
    console.log("Hi " + name);
}
</pre>`,
    },
  ],
  quiz: [
    { question: 'Which heading is the most important?', options: ['<h6>', '<head>', '<h1>', '<heading>'], answer: 2, explanation: '<h1> is the top level heading.' },
    { question: 'After an <h2>, which heading should a sub-section use?', options: ['<h3>', '<h5>', '<h1>', '<h6>'], answer: 0, explanation: 'Go down one level at a time: h2 then h3.' },
    { question: 'What does the browser do with five spaces typed between two words in a <p>?', options: ['Shows five spaces', 'Shows one space', 'Shows a line break', 'Shows an error'], answer: 1, explanation: 'Whitespace is collapsed to a single space.' },
    { question: 'Which is a correct use of <br>?', options: ['Adding space between two sections', 'Making text bigger', 'Ending every paragraph', 'Separating lines of a postal address'], answer: 3, explanation: '<br> is for line breaks that are part of the content.' },
    { question: 'What does <hr> mean semantically in HTML5?', options: ['A thematic break', 'A heading', 'A hyperlink', 'A horizontal scroll bar'], answer: 0, explanation: '<hr> represents a change of topic or scene.' },
  ],
};
