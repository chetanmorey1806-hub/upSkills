export default {
  id: 'day-20-html-entities-symbols-comments',
  title: 'HTML Entities, Special Characters, Symbols, Emojis and Comments',
  module: 'Module 4: Semantic HTML & Advanced Elements',
  day: 20,
  level: 'Beginner',
  duration: '1 hour',
  summary: "Some characters such as < and & have special meaning in HTML, and others (©, ₹, →) are not on your keyboard. HTML entities let you display them safely. You will also learn how emojis work with UTF-8 and how to write HTML comments.",
  objectives: [
    'Explain why reserved characters must be escaped',
    'Write named, decimal and hexadecimal entities',
    'Use common symbol entities and &nbsp; correctly',
    'Insert emojis safely using UTF-8 and numeric references',
    'Write and use HTML comments properly',
  ],
  theory: [
    {
      heading: 'Why do we need entities?',
      content: "The browser reads `<` as \"a tag starts here\". So if you write `5 < 10 and 20 > 3` or want to show the code `<p>` as text, the browser may get confused and treat it as markup.\n\nAn **HTML entity** is a special code that starts with `&` and ends with `;` and is displayed as a character.\n\nAnalogy: entities are like **escape codes in a secret message**: you write `&lt;` and the reader (browser) knows you literally mean the `<` symbol.",
      points: [
        '&lt;  →  <   (less than)',
        '&gt;  →  >   (greater than)',
        '&amp; →  &   (ampersand)',
        '&quot; →  "  (double quote, useful inside attributes)',
        '&apos; or &#39; →  \' (apostrophe)',
      ],
      tip: 'Golden rule: always escape < and & in text, and quotes inside attribute values that use the same quote type.',
    },
    {
      heading: 'Three ways to write an entity',
      content: "1. **Named**: `&copy;` (easy to remember)\n2. **Decimal numeric**: `&#169;`\n3. **Hexadecimal numeric**: `&#xA9;`\n\nAll three show ©. Every character has a Unicode **code point** (© is U+00A9 = 169). Numeric entities work for ANY Unicode character, even those without a name.",
      syntax: `<p>&copy; &#169; &#xA9;</p>  <!-- © © © -->`,
      tip: 'Entity names are case-sensitive: &Eacute; is É, &eacute; is é. And do not forget the semicolon.',
    },
    {
      heading: 'Common symbols and the non-breaking space',
      content: "Frequently used entities:\n- `&nbsp;` non-breaking space (keeps words together, e.g. `10&nbsp;km`)\n- `&copy;` © `&reg;` ® `&trade;` ™\n- `&#8377;` ₹ (Indian Rupee) `&euro;` € `&pound;` £ `&yen;` ¥ `&cent;` ¢\n- `&times;` × `&divide;` ÷ `&plusmn;` ± `&ne;` ≠ `&le;` ≤ `&ge;` ≥\n- `&larr;` ← `&rarr;` → `&uarr;` ↑ `&darr;` ↓\n- `&hearts;` ♥ `&deg;` ° `&frac12;` ½ `&mdash;` — `&ndash;` – `&hellip;` …\n\nHTML collapses multiple spaces into one. `&nbsp;` is a space that does not collapse or break, but **do not use it for layout spacing**: use CSS margin/padding instead.",
    },
    {
      heading: 'Emojis and character encoding',
      content: "Emojis are just Unicode characters. With `<meta charset=\"UTF-8\">` in the head (which every modern page should have) you can type or paste them directly: 🚀 😀 ✅.\n\nYou can also use numeric references: 😀 is U+1F600, so `&#x1F600;` or `&#128512;`.\n\nAccessibility: screen readers read emojis aloud (e.g. \"grinning face\"). For decorative emojis wrap them as `<span aria-hidden=\"true\">🎉</span>`; for meaningful ones add a label: `<span role=\"img\" aria-label=\"Warning\">⚠️</span>`.",
      tip: 'If you see strange characters like â€™ on your page, the charset is wrong. Always save the file as UTF-8 and add <meta charset="UTF-8"> as the first element in <head>.',
    },
    {
      heading: 'HTML comments',
      content: "Comments are notes for developers; the browser does not display them.\n\nSyntax: `<!-- your comment -->`. They can span multiple lines and are useful to:\n- explain sections (`<!-- Navigation starts -->`)\n- temporarily disable code while debugging\n- leave TODO notes\n\nRules: comments cannot be nested, and you should not write `--` inside a comment.",
      syntax: `<!-- Single-line comment -->
<!--
  Multi-line comment:
  <p>This paragraph is disabled</p>
-->`,
      tip: 'Comments ARE visible to anyone using View Source. Never put passwords, API keys or private notes in HTML comments.',
    },
  ],
  examples: [
    {
      title: 'Displaying HTML code as text',
      scenario: 'A tutorial page must show the code <h1>Hello</h1> instead of rendering a heading.',
      steps: [
        'Create index.html',
        'Write the code using &lt; and &gt; inside <pre><code>',
        'Also show what happens WITHOUT escaping',
        'Click Run',
      ],
      code: `<pre><code>&lt;h1&gt;Hello&lt;/h1&gt;</code></pre>`,
      playground: {
        html: `<p>Escaped (shown as code):</p>
<pre><code>&lt;h1&gt;Hello &amp; welcome&lt;/h1&gt;</code></pre>
<p>Not escaped (rendered as a real heading):</p>
<h1>Hello &amp; welcome</h1>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
pre { background: #0f172a; color: #a5f3fc; padding: 10px; border-radius: 6px; }`,
        js: `console.log('Code block text:', document.querySelector('code').textContent);`,
      },
      result: 'The dark box shows the literal text <h1>Hello & welcome</h1>. Below it, a real big heading is rendered. Console prints the decoded text.',
      explanation: 'Entities are decoded into characters when displayed, but they are never interpreted as tags. That is how documentation sites show code.',
    },
    {
      title: 'Price list with symbols',
      scenario: 'Build a shop footer and price list using currency and math symbols.',
      steps: [
        'Write prices with &#8377; (₹), &euro; and &pound;',
        'Use &times; for quantities and &nbsp; to keep numbers with units',
        'Add a copyright line with &copy; and &trade;',
        'Click Run',
      ],
      code: `<li>Notebook: &#8377;120 &times; 3</li>
<li>Distance: 5&nbsp;km</li>
<footer>&copy; 2026 PaperCo&trade;</footer>`,
      playground: {
        html: `<ul>
  <li>Notebook: &#8377;120 &times; 3 = &#8377;360</li>
  <li>Imported pen: &euro;2 &asymp; &#8377;180</li>
  <li>Discount: 10&nbsp;% off on orders &ge; &#8377;500</li>
  <li>Temperature-safe up to 40&deg;C</li>
</ul>
<footer>&copy; 2026 PaperCo&trade; &mdash; All rights reserved &hearts;</footer>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
footer { margin-top: 12px; color: #475569; }`,
      },
      result: 'A list showing ₹120 × 3 = ₹360, €2 ≈ ₹180, 10 % off on orders ≥ ₹500, 40°C, and a footer "© 2026 PaperCo™ — All rights reserved ♥".',
      explanation: 'Named entities (&euro;, &times;, &deg;) and a numeric one (&#8377; for ₹, which has no common named entity) all display correctly regardless of keyboard.',
    },
    {
      title: 'Emojis three ways + accessibility',
      scenario: 'A to-do app shows status icons.',
      steps: [
        'Paste an emoji directly (needs UTF-8)',
        'Write the same emoji with a hex and decimal reference',
        'Mark decorative emojis aria-hidden and meaningful ones with role="img" aria-label',
        'Click Run',
      ],
      code: `<p>🚀 &#x1F680; &#128640;</p>
<p><span role="img" aria-label="Done">✅</span> Finish homework</p>`,
      playground: {
        html: `<p>Same rocket three ways: 🚀 &#x1F680; &#128640;</p>
<ul>
  <li><span role="img" aria-label="Done">&#x2705;</span> Finish homework</li>
  <li><span role="img" aria-label="Pending">&#x23F3;</span> Buy groceries</li>
</ul>
<h2><span aria-hidden="true">&#x1F389;</span> Party time</h2>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; font-size: 18px; }`,
        js: `const rocket = '🚀';
console.log('Code point of rocket: U+' + rocket.codePointAt(0).toString(16).toUpperCase());`,
      },
      result: 'Three identical rockets, a checklist with ✅ and ⏳ icons, and a "Party time" heading with 🎉. Console: Code point of rocket: U+1F680.',
      explanation: 'Emojis are Unicode characters, so direct typing and numeric references produce the same result. Labels tell screen readers what a meaningful icon means; aria-hidden hides purely decorative ones.',
    },
    {
      title: 'Using comments to organise and debug',
      scenario: 'Temporarily hide a promo banner and label page sections.',
      steps: [
        'Add section comments like <!-- Header -->',
        'Wrap the promo banner inside a comment',
        'Click Run: the banner disappears, comments are invisible',
        'Use JS to count comment nodes',
      ],
      code: `<!-- ===== Header ===== -->
<header>My Shop</header>
<!--
<div class="promo">50% OFF!</div>
-->`,
      playground: {
        html: `<!-- ===== Header ===== -->
<header><h1>My Shop</h1></header>

<!-- Promo disabled until Diwali sale
<div class="promo">50% OFF everything!</div>
-->

<!-- ===== Main content ===== -->
<main><p>Welcome! Browse our products.</p></main>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.promo { background: gold; padding: 10px; }`,
        js: `const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
let n = 0;
while (walker.nextNode()) { n++; console.log('Comment:', walker.currentNode.nodeValue.trim().split('\\n')[0]); }
console.log('Total comments:', n);`,
      },
      result: 'Only "My Shop" and the welcome text are visible; the promo is hidden. The console lists the three comments.',
      explanation: 'Comments stay in the DOM as comment nodes (so they are visible in View Source and DevTools) but are never rendered.',
    },
  ],
  interview: [
    { q: 'What is an HTML entity?', a: 'A text code starting with & and ending with ; that represents a character, e.g. &lt; for <, used for reserved or hard-to-type characters.', level: 'Easy' },
    { q: 'Which characters must be escaped in HTML text?', a: '< and & always (as &lt; and &amp;). > is safer escaped too. Inside attributes, escape the quote character used to delimit the value (&quot;).', level: 'Medium' },
    { q: 'Difference between named and numeric entities?', a: 'Named entities use a memorable name (&copy;); numeric use the Unicode code point in decimal (&#169;) or hex (&#xA9;). Numeric works for any character.', level: 'Easy' },
    { q: 'What is &nbsp; and when should you use it?', a: 'A non-breaking space: it prevents a line break and does not collapse. Use it to keep items together (10&nbsp;km), not for layout spacing (use CSS).', level: 'Medium' },
    { q: 'How do you display emojis in HTML?', a: 'Use UTF-8 encoding (<meta charset="UTF-8">) and type them directly, or use numeric references like &#x1F600;.', level: 'Easy' },
    { q: 'How do you make emojis accessible?', a: 'Give meaningful emojis role="img" and an aria-label; hide decorative ones with aria-hidden="true".', level: 'Medium' },
    { q: 'How do you write an HTML comment? Can comments be nested?', a: '<!-- comment -->. They cannot be nested; the first --> ends the comment.', level: 'Easy' },
    { q: 'Are HTML comments secure for hiding information?', a: 'No. They are sent to the browser and visible in View Source and DevTools. Never store secrets in them.', level: 'Easy' },
    { q: 'Why might you see garbled characters like â€™ on a page?', a: 'Encoding mismatch: the file is UTF-8 but the browser decodes it as another charset (or vice versa). Fix with <meta charset="UTF-8"> and saving files in UTF-8.', level: 'Hard' },
    { q: 'How does escaping relate to security (XSS)?', a: 'When inserting user input into HTML, characters like < and & must be escaped so the input is shown as text instead of being executed as markup/script, preventing cross-site scripting.', level: 'Hard' },
  ],
  practice: [
    { task: 'Display the sentence: Use <br> for line breaks & <hr> for lines.', hint: 'Escape < > and &.', solution: `<p>Use &lt;br&gt; for line breaks &amp; &lt;hr&gt; for lines.</p>` },
    { task: 'Create a footer: © 2026 TechCorp® – Prices in ₹ and €.', hint: '&copy; &reg; &ndash; &#8377; &euro;', solution: `<footer>&copy; 2026 TechCorp&reg; &ndash; Prices in &#8377; and &euro;.</footer>` },
    { task: 'Write a math line: 5 × 4 ÷ 2 ≠ 9 and x ≥ 3, plus navigation arrows ← Previous | Next →', hint: '&times; &divide; &ne; &ge; &larr; &rarr;', solution: `<p>5 &times; 4 &divide; 2 &ne; 9 and x &ge; 3</p>
<p>&larr; Previous | Next &rarr;</p>` },
    { task: 'Add a comment-documented page with three labelled sections, and comment out an old paragraph.', hint: 'Use <!-- --> around the paragraph.', solution: `<!-- Header -->
<header><h1>Blog</h1></header>
<!-- Main -->
<main>
  <p>New content</p>
  <!-- <p>Old content, removed on 1 May</p> -->
</main>
<!-- Footer -->
<footer>&copy; 2026</footer>` },
  ],
  quiz: [
    { question: 'Which entity displays the < character?', options: ['&gt;', '&lt;', '&lt', '&less;'], answer: 1, explanation: '&lt; means less-than. Do not forget the semicolon.' },
    { question: '&#169; and &copy; display:', options: ['®', '™', '©', '§'], answer: 2, explanation: '169 is the decimal code point for the copyright sign.' },
    { question: 'Which correctly writes an HTML comment?', options: ['// comment', '/* comment */', '<! comment >', '<!-- comment -->'], answer: 3, explanation: 'HTML comments use <!-- and -->.' },
    { question: 'Which meta tag ensures emojis display correctly?', options: ['<meta charset="UTF-8">', '<meta name="emoji">', '<meta lang="en">', '<meta viewport>'], answer: 0, explanation: 'UTF-8 encoding supports all Unicode characters, including emojis.' },
    { question: '&nbsp; is best used to:', options: ['Indent paragraphs', 'Keep a number and its unit on the same line', 'Create columns', 'Add vertical spacing'], answer: 1, explanation: 'It is a non-breaking space; spacing/layout belongs in CSS.' },
  ],
};
