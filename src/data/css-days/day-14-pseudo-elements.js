export default {
  id: "day-14-pseudo-elements",
  title: "Pseudo-elements: ::before, ::after, ::first-letter, ::placeholder and ::selection",
  module: "Module 3: Selectors & Cascade",
  day: 14,
  level: "Intermediate",
  duration: "1.5 hours",
  summary: "Pseudo-elements let you style a specific part of an element, or insert decorative content, without adding extra HTML. Learn ::before, ::after and the content property, plus ::first-letter, ::first-line, ::placeholder, ::selection and ::marker.",
  objectives: [
    "Explain the difference between pseudo-classes and pseudo-elements",
    "Insert decorative content with ::before/::after and the content property",
    "Create drop caps with ::first-letter and style placeholders and text selection",
    "Know accessibility limits of generated content",
  ],
  theory: [
    {
      heading: "Pseudo-elements vs Pseudo-classes",
      content: "- A **pseudo-class** (single colon `:`) selects an element in a certain **state**: `a:hover`\n- A **pseudo-element** (double colon `::`) selects a **part** of an element, or creates a virtual element: `p::first-line`, `.btn::before`\n\nThe double colon was introduced in CSS3 to tell them apart. Browsers still accept the old single-colon form for ::before, ::after, ::first-letter and ::first-line, but use `::` in new code.\n\nAnalogy: a pseudo-class describes the whole person ('the one who is smiling'); a pseudo-element points to a part of them ('their first initial') or a sticker you put on them.",
    },
    {
      heading: "::before and ::after",
      content: "These create a virtual child element as the **first** (::before) or **last** (::after) child inside the selected element.\n\nRules:\n- The `content` property is **required**; without it nothing renders. Use `content: \"\"` for purely decorative shapes\n- They are **inline** by default; set display: block or position: absolute to size them\n- They don't work on 'replaced' elements without children such as <img>, <input> and <br>\n- `content` can be text, an empty string, `attr(data-x)`, `counter()`, or `url()` of an image\n\nCommon uses: icons, quotes, badges, decorative lines, tooltips, overlays, clearfix.",
      syntax: `.required::after { content: " *"; color: crimson; }
.quote::before    { content: "\\201C"; font-size: 3rem; }   /* opening curly quote */
.link[data-tip]:hover::after { content: attr(data-tip); }`,
      tip: "Don't put important information in ::before/::after content. It isn't selectable and screen reader support is inconsistent. Keep it decorative.",
    },
    {
      heading: "::first-letter and ::first-line",
      content: "`::first-letter` styles the first letter of a block element's first line, the classic magazine **drop cap**.\n\n`::first-line` styles the first rendered line, which changes as the window resizes.\n\nOnly a limited set of properties work on them (font, color, background, margin/padding for first-letter, float, text-decoration, etc.). They apply to block-level elements.",
      syntax: `article p:first-of-type::first-letter {
  float: left; font-size: 3.5rem; line-height: 1; margin-right: 8px;
}
p::first-line { font-variant: small-caps; }`,
    },
    {
      heading: "::placeholder",
      content: "`::placeholder` styles the hint text inside <input> and <textarea> elements.\n\nKeep enough contrast: many designs make placeholders too light. Remember a placeholder is NOT a substitute for a <label>.",
      syntax: `input::placeholder { color: #6b7280; font-style: italic; }`,
    },
    {
      heading: "::selection and ::marker",
      content: "`::selection` styles text the user highlights with the mouse. Only color, background-color, text-decoration and a few others are allowed.\n\n`::marker` styles list bullets and numbers (color, font-size, content).\n\nComing next: specificity, cascade and inheritance (Day 15).",
      syntax: `::selection { background: #fde047; color: #111; }
li::marker { color: #e11d48; font-weight: bold; }`,
    },
  ],
  examples: [
    {
      title: "Required Field Asterisk and Icons with ::before/::after",
      scenario: "Mark required labels with a red asterisk and add check icons to a feature list, without editing text.",
      steps: [
        "Add class required to label elements",
        "Use .required::after { content: \" *\" }",
        "Use .features li::before to add a check mark",
        "Click Run",
      ],
      code: `.required::after { content: " *"; color: #dc2626; }
.features li::before { content: "✔"; color: #16a34a; margin-right: 8px; }`,
      playground: {
        html: `<form>
  <label class="required">Full name</label><input type="text"><br>
  <label>Nickname</label><input type="text">
</form>
<ul class="features">
  <li>Unlimited projects</li>
  <li>Free SSL certificate</li>
  <li>24/7 support</li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
label { display: inline-block; width: 110px; margin: 6px 0; }
input { padding: 6px; }
.required::after { content: " *"; color: #dc2626; font-weight: bold; }
.features { list-style: none; padding: 0; }
.features li { padding: 4px 0; }
.features li::before { content: "✔"; color: #16a34a; margin-right: 8px; }`,
      },
      result: "'Full name' has a red asterisk; 'Nickname' does not. Each feature item starts with a green check mark.",
      explanation: "::after inserts content at the end inside the label; ::before inserts the check at the start of each li. The HTML text stays clean.",
    },
    {
      title: "Decorative Shapes with content: \"\"",
      scenario: "Draw an underline accent under a heading and a dark overlay on a card image using empty pseudo-elements.",
      steps: [
        "Give the heading position: relative and an ::after with content: \"\"",
        "Size and position the ::after as a colored bar",
        "Make a card with ::before covering it (inset: 0) as a gradient overlay",
        "Click Run",
      ],
      code: `.title { position: relative; }
.title::after {
  content: ""; position: absolute; left: 0; bottom: -8px;
  width: 60px; height: 4px; background: #f97316; border-radius: 2px;
}
.card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent, rgba(0,0,0,.7)); }`,
      playground: {
        html: `<h2 class="title">Our Services</h2>
<div class="card">
  <span>Mountain Retreat</span>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.title { position: relative; display: inline-block; margin-bottom: 30px; }
.title::after { content: ""; position: absolute; left: 0; bottom: -8px; width: 60px; height: 4px; background: #f97316; border-radius: 2px; }
.card { position: relative; width: 300px; height: 190px; border-radius: 12px; overflow: hidden;
  background: url('https://picsum.photos/id/1036/600/380') center / cover; }
.card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(0,0,0,0.75)); }
.card span { position: absolute; left: 16px; bottom: 14px; color: white; font-size: 1.3rem; font-weight: bold; z-index: 1; }`,
      },
      result: "The heading has a short orange accent bar beneath it. The photo card darkens toward the bottom, making the white caption readable.",
      explanation: "content: \"\" creates an empty box; absolute positioning lets you size and place it. The overlay needs the card to be position: relative.",
    },
    {
      title: "Drop Cap with ::first-letter and Styled ::first-line",
      scenario: "Give a blog article a magazine-style opening.",
      steps: [
        "Write an article with a long paragraph",
        "Style p::first-letter with a large floated letter",
        "Style p::first-line with small caps",
        "Click Run and resize the preview to see first-line update",
      ],
      code: `.story p::first-letter {
  float: left; font-size: 3.6rem; line-height: 0.9;
  margin: 4px 8px 0 0; color: #9f1239; font-family: Georgia, serif;
}
.story p::first-line { font-variant: small-caps; letter-spacing: 0.05em; }`,
      playground: {
        html: `<article class="story">
  <p>Once upon a time, in a small village surrounded by green hills, a young developer decided to learn CSS properly. Every day she practised a new property, and every day her websites became a little more beautiful. Soon, people from neighbouring villages came to ask her for help with their own pages.</p>
</article>`,
        css: `body { font-family: Georgia, serif; padding: 16px; max-width: 60ch; line-height: 1.6; font-size: 1.1rem; }
.story p::first-letter { float: left; font-size: 3.6rem; line-height: 0.9; margin: 4px 8px 0 0; color: #9f1239; font-weight: bold; }
.story p::first-line { font-variant: small-caps; letter-spacing: 0.05em; }`,
      },
      result: "A large dark-red 'O' drop cap spans about three lines, and the whole first line appears in small capitals. Resizing changes which words are in the first line.",
      explanation: "::first-letter targets only the first character; float makes text wrap around it. ::first-line is calculated after layout, so it adapts to width.",
    },
    {
      title: "::placeholder, ::selection and ::marker",
      scenario: "Brand the small details: input hints, text highlight color and list bullets.",
      steps: [
        "Style input::placeholder",
        "Set ::selection colors",
        "Color list markers with li::marker",
        "Click Run, then select some text with the mouse",
      ],
      code: `input::placeholder { color: #7c3aed; font-style: italic; }
::selection { background: #fde047; color: #111; }
li::marker { color: #e11d48; font-size: 1.3em; }`,
      playground: {
        html: `<input type="text" placeholder="Search tutorials...">
<p>Select this sentence with your mouse to see the custom highlight color.</p>
<ol>
  <li>HTML basics</li>
  <li>CSS selectors</li>
  <li>JavaScript events</li>
</ol>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input { padding: 10px; width: 260px; border: 2px solid #c4b5fd; border-radius: 8px; }
input::placeholder { color: #7c3aed; font-style: italic; }
::selection { background: #fde047; color: #111; }
li::marker { color: #e11d48; font-size: 1.3em; font-weight: bold; }`,
      },
      result: "The input hint text is purple italic; selected text is highlighted in yellow; list numbers are large bold pink.",
      explanation: "Each pseudo-element targets a part the browser generates (placeholder text, selection, list marker) that has no HTML tag of its own.",
    },
  ],
  interview: [
    { q: "What is the difference between a pseudo-class and a pseudo-element?", a: "A pseudo-class (:) selects an element in a state or position (e.g. :hover). A pseudo-element (::) selects a part of an element or generates content (e.g. ::before, ::first-letter).", level: "Easy" },
    { q: "Why doesn't my ::before show anything?", a: "Most likely the content property is missing. ::before/::after require content (even content: \"\"). Also they don't work on replaced elements like img or input.", level: "Easy" },
    { q: "Can you use ::before on an <img> or <input>?", a: "No (generally). Replaced/void elements have no content box for children, so ::before/::after are not rendered.", level: "Medium" },
    { q: "What values can the content property take?", a: "Strings, empty string, attr(), counter()/counters(), url(), open-quote/close-quote, and none/normal.", level: "Medium" },
    { q: "Why use :: instead of : for pseudo-elements?", a: "CSS3 introduced :: to distinguish pseudo-elements from pseudo-classes. Single colon still works for legacy ones (::before, ::after, ::first-line, ::first-letter) for backward compatibility.", level: "Easy" },
    { q: "Is content generated by ::before accessible?", a: "Screen readers may or may not read it, and it can't be selected or copied. It should be decorative; real content belongs in HTML.", level: "Medium" },
    { q: "How do you create a tooltip with only CSS?", a: "Put text in a data attribute and show it with ::after: .tip:hover::after { content: attr(data-tip); position: absolute; ... } with the parent position: relative.", level: "Hard" },
    { q: "Which properties can you use in ::selection?", a: "Limited set: color, background-color, text-decoration, text-shadow, and a few others. Not layout properties.", level: "Hard" },
    { q: "What is the default display of ::before/::after?", a: "inline.", level: "Medium" },
    { q: "How do you style list bullets without removing list semantics?", a: "Use li::marker for color/size/content, or list-style-type. Avoid list-style: none + ::before when you need native list semantics in some screen readers.", level: "Hard" },
  ],
  practice: [
    {
      task: "Add opening and closing curly quotes around every <blockquote> using ::before and ::after.",
      hint: "content: open-quote; content: close-quote; or the characters directly.",
      solution: `blockquote::before { content: "“"; font-size: 2em; color: #94a3b8; }
blockquote::after  { content: "”"; font-size: 2em; color: #94a3b8; }`,
    },
    {
      task: "Create a CSS-only tooltip: a span with data-tip shows the tip text above it on hover.",
      hint: "content: attr(data-tip); position absolute; parent relative.",
      solution: `<p>Hover <span class="tip" data-tip="Cascading Style Sheets">CSS</span> to learn more.</p>
<style>
.tip { position: relative; border-bottom: 1px dotted; cursor: help; }
.tip:hover::after {
  content: attr(data-tip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
  background: #111; color: white; padding: 4px 8px; border-radius: 4px; white-space: nowrap; font-size: 12px;
}
</style>`,
    },
    {
      task: "Style the first letter of every section intro paragraph (p.intro) as a 3-line drop cap in your brand color.",
      hint: "float: left plus a big font-size.",
      solution: `p.intro::first-letter { float: left; font-size: 3.2em; line-height: 0.9; margin: 4px 6px 0 0; color: #0d9488; font-weight: bold; }`,
    },
    {
      task: "Make all input placeholders grey italic, and the page text selection white on dark green.",
      hint: "::placeholder and ::selection.",
      solution: `input::placeholder, textarea::placeholder { color: #6b7280; font-style: italic; }
::selection { background: #065f46; color: white; }`,
    },
  ],
  quiz: [
    { question: "Which syntax is a pseudo-element?", options: ["a:hover", "li:first-child", "p::first-line", "input:checked"], answer: 2, explanation: "Pseudo-elements use ::" },
    { question: "Which property is required for ::before to render?", options: ["content", "display", "position", "z-index"], answer: 0, explanation: "Without content, nothing is generated." },
    { question: "Where does ::after insert its content?", options: ["After the element, outside it", "Before the element", "In the element's parent", "As the last child inside the element"], answer: 3, explanation: "It is the last child inside the element." },
    { question: "Which pseudo-element styles highlighted text?", options: ["::highlight-text", "::selection", "::marker", "::focus"], answer: 1, explanation: "::selection styles user-selected text." },
    { question: "Which is used to create a drop cap?", options: ["::first-line", "::marker", "::first-letter", "::placeholder"], answer: 2, explanation: "::first-letter targets the first character." },
  ],
};
