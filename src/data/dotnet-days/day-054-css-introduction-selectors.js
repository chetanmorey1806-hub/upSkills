const threeWaysHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Three ways to add CSS</title>

  <!-- 2. Internal CSS -->
  <style>
    h2 { color: darkgreen; }
    p  { color: purple; }
  </style>

  <!-- 3. External CSS, linked AFTER the style block:
       <link rel="stylesheet" href="css/site.css">
       (In the playground, the CSS panel is inserted at this position) -->
</head>
<body>
  <h1 id="a">External rule colours me navy</h1>
  <h2 id="b">Internal rule colours me green</h2>
  <p id="c">Internal says purple, external says gray: the later one (external) wins.</p>
  <!-- 1. Inline CSS -->
  <p id="d" style="color: crimson; font-weight: bold;">Inline style beats both: I am crimson.</p>
</body>
</html>`;

const threeWaysCss = `/* site.css (external) */
h1 { color: navy; font-family: Segoe UI, sans-serif; }
p  { color: gray; }  /* same specificity as the internal p rule, but comes later -> wins */`;

const threeWaysJs = `['a', 'b', 'c', 'd'].forEach(function (id) {
  const el = document.getElementById(id);
  console.log(el.tagName + '#' + id + ' -> ' + getComputedStyle(el).color);
});`;

const selectorsHtml = `<h1 id="title">Student List</h1>
<ul class="students">
  <li class="student topper">Riya - 92</li>
  <li class="student">Arjun - 81</li>
  <li class="student failed">Kabir - 31</li>
  <li class="student">Neha - 74</li>
</ul>
<p>Contact <a href="mailto:office@example.com">office</a> or visit <a href="https://example.com" target="_blank">website</a>.</p>
<div class="box"><p>Paragraph inside box (descendant)</p><section><p>Nested deeper</p></section></div>
<p class="note">Note paragraph</p>
<input type="text" placeholder="Name"> <input type="email" placeholder="Email">`;

const selectorsCss = `* { box-sizing: border-box; }                 /* universal */
body { font-family: Segoe UI, sans-serif; }   /* element/type */
#title { color: #1d4ed8; }                     /* id */
.student { padding: 4px; }                     /* class */
.student.topper { background: #dcfce7; }       /* element with BOTH classes */
li.failed { color: #b91c1c; text-decoration: line-through; } /* element + class */
h1, .note { text-transform: uppercase; }       /* group */
.box p { font-style: italic; }                 /* descendant (any depth) */
.box > p { font-weight: bold; }                /* child (direct only) */
h1 + ul { border-left: 4px solid #1d4ed8; }    /* adjacent sibling */
a[target="_blank"] { color: darkorange; }      /* attribute */
input[type="email"] { border: 2px solid teal; }
.students li:first-child { font-size: 18px; }  /* pseudo-class preview */`;

const selectorsJs = `console.log('.student            -> ' + document.querySelectorAll('.student').length);
console.log('.student.topper     -> ' + document.querySelectorAll('.student.topper').length);
console.log('.box p              -> ' + document.querySelectorAll('.box p').length);
console.log('.box > p            -> ' + document.querySelectorAll('.box > p').length);
console.log('a[target="_blank"]  -> ' + document.querySelectorAll('a[target="_blank"]').length);`;

const specHtml = `<p id="msg" class="alert">What colour am I?</p>`;
const specCss = `p        { color: green; }   /* specificity 0-0-1 */
.alert   { color: orange; }  /* 0-1-0 */
p.alert  { color: blue; }    /* 0-1-1 */
#msg     { color: red; }     /* 1-0-0  -> wins */
.alert   { color: purple; }  /* later but only 0-1-0, still loses to #msg */`;
const specJs = `console.log('Final colour: ' + getComputedStyle(document.getElementById('msg')).color);`;

const styledFormHtml = `<form class="reg-form">
  <h2>Student Registration</h2>
  <label for="n">Full Name</label>
  <input type="text" id="n" placeholder="Riya Sharma" required>
  <label for="e">Email</label>
  <input type="email" id="e" placeholder="riya@example.com" required>
  <label for="c">Course</label>
  <select id="c"><option>.NET Full Stack</option><option>SQL Server</option></select>
  <div class="radio-row">
    <label><input type="radio" name="g" value="F"> Female</label>
    <label><input type="radio" name="g" value="M"> Male</label>
  </div>
  <button type="submit" class="btn btn-primary">Register</button>
  <button type="reset" class="btn">Reset</button>
</form>`;

const styledFormCss = `body { font-family: "Segoe UI", Arial, sans-serif; background: #f1f5f9; }
.reg-form { width: 340px; margin: 20px auto; padding: 20px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; }
.reg-form h2 { margin-top: 0; color: #1e3a8a; text-align: center; }
.reg-form label { display: block; margin-top: 10px; font-weight: 600; color: #334155; }
.reg-form input[type="text"],
.reg-form input[type="email"],
.reg-form select { width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #94a3b8; border-radius: 4px; }
.radio-row label { display: inline; font-weight: normal; margin-right: 12px; }
.btn { margin-top: 14px; padding: 8px 16px; border: 1px solid #64748b; border-radius: 4px; background: #e2e8f0; cursor: pointer; }
.btn-primary { background: #2563eb; border-color: #2563eb; color: #fff; }
input:focus, select:focus { outline: 2px solid #93c5fd; }
input:invalid { border-color: #f87171; }`;

export default {
  id: 'day-054-css-introduction-selectors',
  title: 'CSS Introduction: Inline, Internal, External CSS and Selectors',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 54,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn what CSS is, the syntax of a rule, the three ways to add CSS (inline, internal, external), the cascade and specificity, and all the core selectors; then style yesterday\'s Student Registration form.',
  objectives: [
    'Explain what CSS does and write a correct CSS rule',
    'Apply CSS inline, internally and through an external stylesheet (wwwroot/css/site.css)',
    'Use universal, element, id, class, group, descendant, child, sibling and attribute selectors',
    'Predict which rule wins using the cascade, specificity and inheritance',
    'Style a registration form',
  ],
  theory: [
    {
      heading: 'What is CSS? Rule syntax',
      content: "**CSS (Cascading Style Sheets)** controls how HTML looks: colours, fonts, spacing, layout, animation. Separating style from structure means one stylesheet can restyle a whole site.\n\nA **rule** = **selector** + **declaration block**. Each declaration is `property: value;`.\n\nComments use `/* ... */` (no `//` in CSS).",
      syntax: 'h1 {               /* selector */\n  color: navy;     /* declaration: property: value; */\n  font-size: 32px;\n}',
      tip: 'A missing semicolon or brace silently breaks the next declarations. Use F12 > Elements > Styles to see crossed-out (invalid or overridden) rules.',
    },
    {
      heading: 'Three ways to add CSS',
      content: "1. **Inline**: `style` attribute on one element: `<p style=\"color:red\">`. Highest priority, hard to maintain; avoid except for quick tests.\n2. **Internal**: `<style>` block in `<head>`; applies to that page only.\n3. **External**: a separate `.css` file linked with `<link rel=\"stylesheet\" href=\"css/site.css\">`. Best practice: reusable across pages, cached by the browser.\n\nIn ASP.NET Core MVC the template already has `wwwroot/css/site.css` linked from `Views/Shared/_Layout.cshtml` as `<link rel=\"stylesheet\" href=\"~/css/site.css\" asp-append-version=\"true\" />`.",
      syntax: '<link rel="stylesheet" href="css/site.css">\n<style> p { color: purple; } </style>\n<p style="color: crimson;">Inline</p>',
      tip: 'Priority (same specificity): inline > whichever of internal/external comes LATER in the document.',
    },
    {
      heading: 'Basic selectors',
      content: "- **Universal** `*` : every element.\n- **Element/type** `p`, `h1`: all elements of that tag.\n- **Class** `.student`: elements with `class=\"student\"`. Reusable; an element can have many classes (`class=\"student topper\"`). Combine: `.student.topper`.\n- **ID** `#title`: the one element with `id=\"title\"`. Use sparingly in CSS.\n- **Group** `h1, h2, .note`: same styles for several selectors.\n- **Element + class** `li.failed`: only li elements with that class.",
    },
    {
      heading: 'Combinator and attribute selectors',
      content: "- **Descendant** `.box p`: any p inside .box at any depth.\n- **Child** `.box > p`: only direct children.\n- **Adjacent sibling** `h1 + ul`: the ul immediately after an h1.\n- **General sibling** `h1 ~ p`: all p siblings after the h1.\n- **Attribute**: `[required]`, `input[type=\"email\"]`, `a[href^=\"https\"]` (starts with), `a[href$=\".pdf\"]` (ends with), `[class*=\"btn\"]` (contains).\n- **Pseudo-classes** (more on Day 58): `:hover`, `:focus`, `:first-child`, `:nth-child(2)`, `:invalid`.",
      syntax: 'nav > ul > li { display: inline; }\ninput[type="email"] { border-color: teal; }\na[href$=".pdf"] { color: red; }',
    },
    {
      heading: 'Cascade, specificity and inheritance',
      content: "When several rules target the same property, the browser decides by:\n1. **Importance**: `!important` beats normal declarations (avoid it).\n2. **Specificity**: count (IDs, classes/attributes/pseudo-classes, elements). `#msg` = 1-0-0 beats `p.alert` = 0-1-1 beats `.alert` = 0-1-0 beats `p` = 0-0-1. Inline style beats all selectors.\n3. **Source order**: if specificity is equal, the **later** rule wins.\n\n**Inheritance**: text properties (`color`, `font-family`, `font-size`, `line-height`) pass from parent to children; box properties (`margin`, `padding`, `border`, `width`) do not. Use `inherit` to force it.",
      tip: 'Keep specificity low (prefer classes). This is exactly how Bootstrap is designed, so your own classes can override it easily.',
    },
  ],
  examples: [
    {
      title: 'Inline vs internal vs external CSS',
      scenario: 'See all three methods in one page and which one wins.',
      steps: ['Create css/site.css with the external rules', 'Create index.html with <link> to site.css, a <style> block and one inline style', 'Open in the browser and inspect each element with F12', 'In the playground, the CSS panel acts as site.css'],
      code: '/* css/site.css */\n' + threeWaysCss + '\n\n<!-- index.html -->\n' + threeWaysHtml,
      playground: { html: threeWaysHtml, css: threeWaysCss, js: threeWaysJs },
      result: 'h1 navy, h2 green, first p gray, last p crimson and bold.\nConsole:\nH1#a -> rgb(0, 0, 128)\nH2#b -> rgb(0, 100, 0)\nP#c -> rgb(128, 128, 128)\nP#d -> rgb(220, 20, 60)',
      explanation: 'Internal and external CSS have the same priority; for equal selectors (p vs p) the rule that appears LATER wins. Here the link/CSS panel comes after the <style> block so gray wins. Move the <link> above <style> and the paragraph turns purple. Inline style beats both.',
    },
    {
      title: 'Every core selector on a student list',
      scenario: 'Highlight the topper, strike through failed students and style links and inputs without adding extra classes.',
      steps: ['Create selectors.html with the list, links, box and inputs', 'Add the CSS rules one by one and watch what changes', 'Read the console which counts matches for some selectors'],
      code: selectorsCss,
      playground: { html: selectorsHtml, css: selectorsCss, js: selectorsJs },
      result: 'Blue upper-case heading; list with blue left border; Riya highlighted green and larger; Kabir red with line-through; external link orange; both box paragraphs italic but only the first bold; NOTE PARAGRAPH upper-case; email input teal border.\nConsole:\n.student            -> 4\n.student.topper     -> 1\n.box p              -> 2\n.box > p            -> 1\na[target="_blank"]  -> 1',
      explanation: 'Descendant matches both nested paragraphs, child only the direct one. Attribute selectors target by attribute value; h1 + ul targets only the list right after the heading.',
    },
    {
      title: 'Specificity battle',
      scenario: 'Five rules set the colour of one paragraph. Predict the winner.',
      steps: ['Create specificity.html with one p having id and class', 'Add the five rules', 'Predict, then run and check the console', 'Delete the #msg rule and run again to see blue win (p.alert 0-1-1)'],
      code: specCss,
      playground: { html: specHtml, css: specCss, js: specJs },
      result: 'Text is red.\nConsole:\nFinal colour: rgb(255, 0, 0)\n(Without the #msg rule it becomes blue because p.alert 0-1-1 beats .alert 0-1-0.)',
      explanation: 'ID specificity 1-0-0 beats any number of classes. Source order only decides between equal specificities.',
    },
    {
      title: 'Style the registration form',
      scenario: 'Day 54 project: turn the plain Day 53 registration form into a clean card.',
      steps: ['Create wwwroot/css/site.css (or register.css)', 'Link it in register.html', 'Use class, descendant, attribute and group selectors to style the card, labels, inputs and buttons', 'Run, then focus an input and try submitting empty'],
      code: styledFormCss,
      playground: { html: styledFormHtml, css: styledFormCss, js: '' },
      result: 'A centred white card on a light grey background with a dark-blue centred title, bold labels above full-width inputs, inline radio buttons, a blue Register button and a grey Reset button. Focused inputs get a light-blue outline; empty required inputs show a red border.',
      explanation: '.reg-form label {display:block} puts each label on its own line; attribute selectors target only text/email inputs; .btn + .btn-primary is the same pattern Bootstrap uses.',
    },
  ],
  interview: [
    { q: 'What is CSS and why "cascading"?', a: 'Cascading Style Sheets describe presentation of HTML. Cascading refers to the algorithm that combines rules from many sources using importance, specificity and source order.', level: 'Easy' },
    { q: 'Three ways to apply CSS and which is best?', a: 'Inline (style attribute), internal (<style> in head), external (<link> to .css file). External is best: reusable, cacheable, separates concerns.', level: 'Easy' },
    { q: 'Class vs ID selector?', a: '.class can be reused on many elements and an element can have several classes; #id must be unique and has much higher specificity.', level: 'Easy' },
    { q: 'How is specificity calculated?', a: 'As a tuple (IDs, classes+attributes+pseudo-classes, elements+pseudo-elements). Compare left to right. Inline styles beat selectors; !important beats normal declarations.', level: 'Medium' },
    { q: 'Descendant vs child selector?', a: '"A B" matches B at any depth inside A; "A > B" matches only direct children.', level: 'Medium' },
    { q: 'Which properties inherit?', a: 'Mostly text-related: color, font-*, line-height, text-align, visibility. Box model properties (margin, padding, border, width, background) do not.', level: 'Medium' },
    { q: 'Why avoid !important?', a: 'It breaks the natural cascade and leads to escalating !important wars that make CSS hard to maintain. Use better specificity or order instead.', level: 'Medium' },
    { q: 'What does asp-append-version="true" do on a stylesheet link?', a: 'It is a Tag Helper that appends a hash query string (?v=...) of the file so browsers download the new file whenever it changes (cache busting).', level: 'Hard' },
    { q: 'Write a selector for all email inputs and all links ending with .pdf.', a: 'input[type="email"] and a[href$=".pdf"].', level: 'Medium' },
    { q: 'If two rules have equal specificity, which wins?', a: 'The one that appears later in the source order.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create an external stylesheet and link it to two pages so both get the same heading colour.', hint: '<link rel="stylesheet" href="style.css"> in both heads.', solution: '/* style.css */\nh1 { color: #1e3a8a; }\n\n<!-- page1.html & page2.html -->\n<link rel="stylesheet" href="style.css">' },
    { task: 'Make every even row of a marks table light grey.', hint: 'tbody tr:nth-child(even).', solution: 'tbody tr:nth-child(even) { background: #f1f5f9; }' },
    { task: 'Give required inputs a yellow left border using an attribute selector.', hint: '[required].', solution: 'input[required] { border-left: 4px solid gold; }' },
    { task: 'Style only paragraphs that come immediately after an h2 in italic.', hint: 'Adjacent sibling +.', solution: 'h2 + p { font-style: italic; }' },
    { task: 'Compute specificity: (a) #nav .item a (b) ul li.active (c) .menu .item:hover', hint: 'IDs-classes-elements.', solution: '(a) 1-1-1  (b) 0-1-2  (c) 0-3-0' },
  ],
  quiz: [
    { question: 'Which tag links an external stylesheet?', options: ['<style src="">', '<css href="">', '<link rel="stylesheet" href="">', '<script href="">'], answer: 2, explanation: 'External CSS uses <link rel="stylesheet">.' },
    { question: 'Which selector has the highest specificity?', options: ['#a', '.a .b .c', 'div p span', '*'], answer: 0, explanation: 'One ID (1-0-0) beats any number of classes.' },
    { question: 'What does ".box > p" select?', options: ['All p in .box at any depth', 'p elements that are direct children of .box', 'The p after .box', '.box elements inside p'], answer: 1, explanation: '> is the child combinator.' },
    { question: 'How do you write a comment in CSS?', options: ['// comment', '<!-- comment -->', '# comment', '/* comment */'], answer: 3, explanation: 'CSS only supports /* */ comments.' },
    { question: 'Which property is inherited by default?', options: ['color', 'margin', 'border', 'padding'], answer: 0, explanation: 'Text properties like color inherit; box properties do not.' },
  ],
};
