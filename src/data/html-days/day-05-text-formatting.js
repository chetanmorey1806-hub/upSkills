export default {
  id: 'day-05-text-formatting',
  title: 'Text Formatting: <b>, <strong>, <i>, <em>, <u>, <mark>, <small>, <del>, <ins>, <sub>, <sup>',
  module: 'Module 1: HTML Fundamentals',
  day: 5,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Learn the inline elements that format and give meaning to text. Understand the classic interview question: <b> vs <strong> and <i> vs <em>, and when each formatting tag is the right choice.',
  objectives: [
    'Differentiate presentational-looking tags (<b>, <i>, <u>) from semantic ones (<strong>, <em>)',
    'Highlight text with <mark> and write fine print with <small>',
    'Show edits with <del> and <ins>',
    'Write formulas and footnotes with <sub> and <sup>',
    'Choose formatting tags by meaning, not appearance',
  ],
  theory: [
    {
      heading: 'Semantic vs presentational formatting',
      content: "Formatting tags are **inline** elements: they sit inside a line of text without starting a new line.\n\nThere are two ways to think about them:\n- **Semantic**: the tag says what the text **means** (for example \"this is important\"). Screen readers and search engines can use that meaning.\n- **Presentational**: the tag only says how the text **looks** (for example \"make it bold\").\n\nIn HTML5 even `<b>`, `<i>` and `<u>` were given semantic definitions, but the golden rule remains: **choose the tag by meaning; use CSS when you only want a visual effect.**",
    },
    {
      heading: '<b> vs <strong>',
      content: "Both appear **bold** by default, but they mean different things.\n\n- `<strong>`: **strong importance, seriousness or urgency**. Example: warnings, key instructions. Screen readers may change tone, and it carries meaning.\n- `<b>`: draws attention to text **without extra importance**, for example keywords in a summary, product names in a review, or the lead sentence of an article.\n\nAnalogy: `<strong>` is a teacher saying \"This WILL be in the exam!\". `<b>` is simply a highlighter in your notes for keywords.",
      syntax: '<p><strong>Warning:</strong> Do not touch the wire.</p>\n<p>The <b>Pixel 9</b> has a great camera.</p>',
      tip: 'Interview answer: "<strong> has semantic importance; <b> is stylistic offset without importance. Prefer <strong> for importance."',
    },
    {
      heading: '<i> vs <em>',
      content: "Both appear *italic* by default.\n\n- `<em>`: **stress emphasis** that changes the meaning of a sentence when spoken. \"I *never* said that\" vs \"*I* never said that\".\n- `<i>`: text in an **alternate voice or mood** without emphasis: technical terms, foreign words (`<i lang=\"fr\">bon appétit</i>`), ship names, thoughts, scientific names (*Homo sapiens*).\n\nNesting `<em>` inside `<em>` increases the level of emphasis.",
      syntax: '<p>I <em>really</em> need this job.</p>\n<p>The scientific name of the tiger is <i>Panthera tigris</i>.</p>',
      tip: 'Do not use <i> for icons (a common Font Awesome habit). It works but is semantically wrong; a <span> is better.',
    },
    {
      heading: '<u>, <mark> and <small>',
      content: "- `<u>`: **unarticulated annotation**, text with a non-textual annotation, such as marking a **spelling mistake** or a proper name in Chinese text. It shows underlined. Avoid it for general emphasis, because underlined text looks like a **link** and confuses users.\n- `<mark>`: **highlighted** text relevant in the current context, like a search result match or a quote you want to point out. Shows with a yellow background.\n- `<small>`: **side comments and fine print**: copyright notices, legal disclaimers, \"T&C apply\". It is not just \"smaller font\" (use CSS for that).",
      syntax: '<p>Spelling: <u>recieve</u> should be receive.</p>\n<p>Search results for "html": Learn <mark>HTML</mark> in 30 days.</p>\n<p><small>&copy; 2026 Sunrise Bakery. All rights reserved.</small></p>',
    },
    {
      heading: '<del> and <ins>',
      content: "Used to show **edits to a document**:\n- `<del>`: text that has been **deleted** (shown with a strike-through line).\n- `<ins>`: text that has been **inserted** (shown underlined).\n\nBoth support optional attributes `cite` (URL explaining the change) and `datetime` (when it changed).\n\nReal-world uses: price drops on e-commerce sites, change logs, tracked edits in documents, to-do lists.\n\nDo not confuse `<del>` with `<s>`: `<s>` means content that is **no longer accurate or relevant** (for example an old price not as a document edit). The deprecated `<strike>` tag should not be used.",
      syntax: '<p>Price: <del>₹1,999</del> <ins>₹1,499</ins></p>\n<p>Meeting on <del datetime="2026-05-01">Monday</del> <ins datetime="2026-05-02">Tuesday</ins>.</p>',
    },
    {
      heading: '<sub> and <sup>',
      content: "- `<sub>`: **subscript**, text slightly below the line and smaller. Used in chemical formulas: H<sub>2</sub>O, CO<sub>2</sub>.\n- `<sup>`: **superscript**, text slightly above the line. Used in maths powers (x<sup>2</sup>), ordinals (1<sup>st</sup>), footnote markers and trademark-like symbols.\n\nUse them only when the position has **meaning** (typographic convention), not just to move text up or down for design.\n\nComing next (Module 2): links, images and lists.",
      syntax: '<p>Water is H<sub>2</sub>O.</p>\n<p>E = mc<sup>2</sup></p>\n<p>She finished 1<sup>st</sup> in the race.</p>',
    },
  ],
  examples: [
    {
      title: 'All formatting tags side by side',
      scenario: 'Build a reference sheet showing what every formatting tag looks like.',
      steps: [
        'Create formatting.html',
        'Add one paragraph per tag',
        'Click Run and compare the default styles',
      ],
      code: `<p><b>b</b> - bold, attention without importance</p>
<p><strong>strong</strong> - strong importance</p>
<p><i>i</i> - alternate voice</p>
<p><em>em</em> - stress emphasis</p>
<p><u>u</u> - unarticulated annotation</p>
<p><mark>mark</mark> - highlighted</p>
<p><small>small</small> - fine print</p>
<p><del>del</del> - deleted text</p>
<p><ins>ins</ins> - inserted text</p>
<p>H<sub>2</sub>O - subscript</p>
<p>x<sup>2</sup> - superscript</p>`,
      playground: {
        html: `<p><b>b</b> - bold, attention without importance</p>
<p><strong>strong</strong> - strong importance</p>
<p><i>i</i> - alternate voice</p>
<p><em>em</em> - stress emphasis</p>
<p><u>u</u> - unarticulated annotation</p>
<p><mark>mark</mark> - highlighted</p>
<p><small>small</small> - fine print</p>
<p><del>del</del> - deleted text</p>
<p><ins>ins</ins> - inserted text</p>
<p>H<sub>2</sub>O - subscript</p>
<p>x<sup>2</sup> - superscript</p>`,
      },
      result: 'Each line shows a different style: bold, italic, underline, yellow highlight, smaller text, strike-through, underline and lowered/raised numbers.',
      explanation: 'These are the browser default styles. Notice <b> and <strong> look identical, as do <i> and <em>. The difference is meaning, which matters to assistive technology and search engines.',
    },
    {
      title: 'E-commerce product price card',
      scenario: 'Show a discounted price, a highlighted offer and fine print like an online store.',
      steps: [
        'Create a heading with the product name',
        'Use <del> for old price and <ins> for new price',
        'Use <mark> for the offer and <strong> for stock urgency',
        'Use <small> for terms and conditions',
        'Click Run',
      ],
      code: `<h2>Wireless Earbuds</h2>
<p>Price: <del>₹2,999</del> <ins>₹1,799</ins></p>
<p><mark>Diwali Offer: 40% off</mark></p>
<p><strong>Only 3 left in stock!</strong></p>
<p><small>*Offer valid till 31 Oct. T&amp;C apply.</small></p>`,
      playground: {
        html: `<div class="card">
  <h2>Wireless Earbuds</h2>
  <p>Price: <del>₹2,999</del> <ins>₹1,799</ins></p>
  <p><mark>Diwali Offer: 40% off</mark></p>
  <p><strong>Only 3 left in stock!</strong></p>
  <p><small>*Offer valid till 31 Oct. T&amp;C apply.</small></p>
</div>`,
        css: `.card { font-family: sans-serif; border: 1px solid #ddd; border-radius: 8px; padding: 16px; width: 260px; }
ins { text-decoration: none; color: green; font-weight: bold; font-size: 1.2em; }
del { color: #999; }`,
      },
      result: 'A card with the old price crossed out, the new price in green, a yellow highlighted offer, a bold stock warning and small fine print.',
      explanation: '<del>/<ins> describe a price change, <mark> highlights the relevant offer, <strong> signals urgency and <small> marks legal fine print. CSS adjusts the look (removing the default underline on <ins>).',
    },
    {
      title: 'Science and maths notes',
      scenario: 'Write chemistry formulas and maths equations for a class notes page.',
      steps: [
        'Write formulas with <sub> for subscripts',
        'Write powers with <sup>',
        'Add a footnote marker with <sup> and the footnote in <small>',
        'Click Run',
      ],
      code: `<p>Water: H<sub>2</sub>O | Carbon dioxide: CO<sub>2</sub> | Sulphuric acid: H<sub>2</sub>SO<sub>4</sub></p>
<p>Pythagoras: a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></p>
<p>Einstein's famous equation E = mc<sup>2</sup><sup>[1]</sup></p>
<p><small>[1] Published in 1905.</small></p>`,
      playground: {
        html: `<h3>Chemistry</h3>
<p>Water: H<sub>2</sub>O | Carbon dioxide: CO<sub>2</sub> | Sulphuric acid: H<sub>2</sub>SO<sub>4</sub></p>
<h3>Maths and Physics</h3>
<p>Pythagoras: a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></p>
<p>Einstein's famous equation E = mc<sup>2</sup><sup>[1]</sup></p>
<p><small>[1] Published in 1905.</small></p>`,
      },
      result: 'Formulas display with numbers lowered (H₂O) or raised (a²), plus a footnote marker and small footnote text.',
      explanation: '<sub> and <sup> follow typographic conventions, so screen readers and search engines can understand that "2" is part of a formula, not plain text.',
    },
    {
      title: 'Emphasis changes meaning',
      scenario: 'Demonstrate how <em> on different words changes the meaning of the same sentence.',
      steps: [
        'Write the sentence "I did not take your pen" three times',
        'Put <em> on a different word each time',
        'Read each one aloud, stressing the emphasised word',
      ],
      code: `<p><em>I</em> did not take your pen. (someone else did)</p>
<p>I did not take <em>your</em> pen. (I took someone else's)</p>
<p>I did not take your <em>pen</em>. (I took your pencil)</p>`,
      playground: {
        html: `<p><em>I</em> did not take your pen. <small>(someone else did)</small></p>
<p>I did not take <em>your</em> pen. <small>(I took someone else's)</small></p>
<p>I did not take your <em>pen</em>. <small>(I took your pencil)</small></p>
<p>The word <i lang="ja">ikigai</i> means a reason for being. <small>(i = foreign word, no stress)</small></p>`,
        css: `em { color: crimson; }`,
      },
      result: 'Three versions of the same sentence, each with a different word in red italics, plus a foreign word in plain italics.',
      explanation: '<em> marks stress that changes meaning. <i lang="ja"> marks a foreign term in an alternate voice without stress; the lang attribute helps screen readers pronounce it.',
    },
  ],
  interview: [
    { q: 'What is the difference between <b> and <strong>?', a: 'Both render bold by default. <strong> indicates strong importance, seriousness or urgency (semantic). <b> draws attention to text without implying importance, e.g. keywords or product names.', level: 'Easy' },
    { q: 'What is the difference between <i> and <em>?', a: '<em> indicates stress emphasis that changes the meaning of a sentence. <i> represents text in an alternate voice or mood (technical terms, foreign phrases, thoughts) without emphasis.', level: 'Easy' },
    { q: 'Why should you avoid <u> for emphasis?', a: 'Underlined text is conventionally a hyperlink, so users may try to click it. In HTML5 <u> means unarticulated annotation, e.g. marking misspellings. Use <em>/<strong> or CSS for emphasis.', level: 'Medium' },
    { q: 'What is the <mark> tag used for?', a: 'To highlight text relevant in the current context, such as search-term matches or a part of a quote you want to draw attention to. Default style is a yellow background.', level: 'Easy' },
    { q: 'What is the difference between <del> and <s>?', a: '<del> marks text removed from a document as an edit (with optional cite and datetime). <s> marks content that is no longer accurate or relevant but is not a document edit, e.g. an outdated price.', level: 'Hard' },
    { q: 'What attributes can <del> and <ins> have?', a: 'cite (a URL explaining the change) and datetime (a machine-readable date/time of the change), plus global attributes.', level: 'Medium' },
    { q: 'When would you use <sub> and <sup>?', a: '<sub> for subscripts such as chemical formulas (H2O). <sup> for superscripts such as exponents (x2), ordinal suffixes (1st) and footnote markers.', level: 'Easy' },
    { q: 'Is <small> just for making text smaller?', a: 'No. Semantically it represents side comments and small print like copyright and legal text. For purely visual size changes, use CSS font-size.', level: 'Medium' },
    { q: 'Are formatting tags block-level or inline?', a: 'Inline. They flow within a line of text and do not start new lines.', level: 'Easy' },
    { q: 'Which formatting tags are deprecated?', a: '<font>, <center>, <big>, <strike> and <tt> are obsolete in HTML5. Use CSS (font, text-align, font-size) and semantic tags like <del>/<s> or <code> instead.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a safety notice paragraph where "Danger" is strongly important, and one word is stressed with emphasis.',
      hint: 'Use <strong> and <em>.',
      solution: `<p><strong>Danger:</strong> High voltage. Do <em>not</em> open this panel.</p>`,
    },
    {
      task: 'Create a to-do list using paragraphs where completed tasks are shown with <del> and a newly added task with <ins>.',
      hint: 'One <p> per task.',
      solution: `<h3>Today</h3>
<p><del>Buy groceries</del></p>
<p><del>Finish HTML Day 5</del></p>
<p>Call the bank</p>
<p><ins>Practice formatting tags</ins></p>`,
    },
    {
      task: 'Write the chemical formulas for glucose (C6H12O6) and ammonia (NH3), and the equation (a + b)2 = a2 + 2ab + b2.',
      hint: 'Numbers in formulas use <sub>; powers use <sup>.',
      solution: `<p>Glucose: C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></p>
<p>Ammonia: NH<sub>3</sub></p>
<p>(a + b)<sup>2</sup> = a<sup>2</sup> + 2ab + b<sup>2</sup></p>`,
    },
    {
      task: 'Create a search results snippet for the query "laptop" where every occurrence of laptop is highlighted, and add a copyright footer in fine print.',
      hint: '<mark> for highlights, <small> for the footer.',
      solution: `<h3>Results for "laptop"</h3>
<p>Best <mark>laptop</mark> deals of 2026 - compare prices on gaming and office <mark>laptop</mark> models.</p>
<p>How to choose a student <mark>laptop</mark> under ₹50,000.</p>
<p><small>&copy; 2026 QuickSearch. All rights reserved.</small></p>`,
    },
    {
      task: 'Write a sentence that includes the scientific name of the mango tree (Mangifera indica) and a French phrase, using the correct tag and lang attribute.',
      hint: '<i> is for alternate voice such as scientific names and foreign words.',
      solution: `<p>The mango tree, <i>Mangifera indica</i>, is the national tree of Bangladesh. As the French say, <i lang="fr">c'est la vie</i>.</p>`,
    },
  ],
  quiz: [
    { question: 'Which tag indicates strong importance?', options: ['<b>', '<strong>', '<mark>', '<i>'], answer: 1, explanation: '<strong> conveys importance; <b> does not.' },
    { question: 'Which tag would you use for the scientific name Homo sapiens?', options: ['<em>', '<u>', '<small>', '<i>'], answer: 3, explanation: '<i> is for alternate voice such as taxonomic names.' },
    { question: 'How do you write CO2 with a lowered 2?', options: ['CO<sup>2</sup>', 'CO<small>2</small>', 'CO<sub>2</sub>', 'CO<low>2</low>'], answer: 2, explanation: '<sub> creates subscript.' },
    { question: 'Which tag is best for showing a removed price in a document edit?', options: ['<del>', '<mark>', '<u>', '<strike>'], answer: 0, explanation: '<del> represents deleted content; <strike> is obsolete.' },
    { question: 'Which tag highlights text with a yellow background by default?', options: ['<highlight>', '<em>', '<mark>', '<ins>'], answer: 2, explanation: '<mark> highlights relevant text.' },
  ],
};
