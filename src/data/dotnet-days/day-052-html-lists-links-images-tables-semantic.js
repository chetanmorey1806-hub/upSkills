const listsHtml = `<h2>Course Modules (in order)</h2>
<ol>
  <li>C# Fundamentals</li>
  <li>OOP</li>
  <li>SQL Server</li>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </li>
</ol>

<h2>Documents to bring</h2>
<ul>
  <li>Aadhaar card</li>
  <li>10th marksheet</li>
  <li>Passport photo</li>
</ul>

<h2>Glossary</h2>
<dl>
  <dt>CLR</dt>
  <dd>Common Language Runtime that runs .NET code.</dd>
  <dt>SSMS</dt>
  <dd>SQL Server Management Studio.</dd>
</dl>

<h2>Batch ranking (starts at 5, reversed)</h2>
<ol start="5" reversed type="A">
  <li>Batch E</li>
  <li>Batch D</li>
</ol>`;

const linksHtml = `<nav>
  <a href="#profile">Jump to Profile</a> |
  <a href="https://learn.microsoft.com/aspnet/core/" target="_blank" rel="noopener noreferrer">ASP.NET Core Docs</a> |
  <a href="mailto:admissions@example.com?subject=Admission%20Query">Email Admissions</a> |
  <a href="tel:+911234567890">Call Us</a>
</nav>

<p style="height:300px">Scroll down...</p>

<section id="profile">
  <h2>Profile</h2>
  <figure>
    <img src="https://picsum.photos/id/1005/240/160" alt="Student Riya smiling in classroom" width="240" height="160">
    <figcaption>Riya Sharma, Roll No 101</figcaption>
  </figure>
  <a href="https://picsum.photos/id/1005/600/400" target="_blank">
    <img src="https://picsum.photos/id/1005/80/60" alt="Open larger photo" width="80" height="60">
  </a>
</section>`;

const tableHtml = `<table>
  <caption>Semester 1 Results</caption>
  <thead>
    <tr><th>Roll No</th><th>Name</th><th>C#</th><th>SQL</th><th>Total</th></tr>
  </thead>
  <tbody>
    <tr><td>101</td><td>Riya</td><td>85</td><td>78</td><td>163</td></tr>
    <tr><td>102</td><td>Arjun</td><td>72</td><td>90</td><td>162</td></tr>
    <tr><td>103</td><td>Neha</td><td colspan="2">Absent</td><td>0</td></tr>
  </tbody>
  <tfoot>
    <tr><td colspan="4">Class Total</td><td>325</td></tr>
  </tfoot>
</table>

<h3>Timetable (rowspan)</h3>
<table>
  <tr><th>Day</th><th>Time</th><th>Topic</th></tr>
  <tr><td rowspan="2">Monday</td><td>10:00</td><td>HTML</td></tr>
  <tr><td>12:00</td><td>CSS</td></tr>
</table>`;

const tableCss = `table { border-collapse: collapse; margin-bottom: 16px; font-family: Segoe UI, sans-serif; }
th, td { border: 1px solid #999; padding: 6px 12px; text-align: left; }
thead, th { background: #e8eefc; }
caption { font-weight: bold; padding: 6px; }
tfoot td { font-weight: bold; }`;

const semanticHtml = `<header>
  <h1>Student Information</h1>
  <nav>
    <a href="#about">About</a> | <a href="#marks">Marks</a> | <a href="#contact">Contact</a>
  </nav>
</header>

<main>
  <section id="about">
    <h2>About</h2>
    <figure>
      <img src="https://picsum.photos/id/64/120/120" alt="Profile photo of Riya" width="120" height="120">
      <figcaption>Riya Sharma</figcaption>
    </figure>
    <ul>
      <li>Roll No: 101</li>
      <li>Course: .NET Full Stack</li>
      <li>Batch: Morning</li>
    </ul>
  </section>

  <section id="marks">
    <h2>Marks</h2>
    <table>
      <thead><tr><th>Subject</th><th>Marks</th></tr></thead>
      <tbody>
        <tr><td>C#</td><td>85</td></tr>
        <tr><td>SQL Server</td><td>78</td></tr>
        <tr><td>HTML/CSS</td><td>92</td></tr>
      </tbody>
    </table>
  </section>

  <article>
    <h2>Project: Library App</h2>
    <p>A console app in C# that issues and returns books.</p>
  </article>
</main>

<aside>
  <h3>Notice</h3>
  <p>Mock interview on <time datetime="2026-12-05">5 December</time>.</p>
</aside>

<footer id="contact">
  <p>&copy; 2026 Student Portal | <a href="mailto:riya@example.com">riya@example.com</a></p>
</footer>`;

const semanticCss = `body { font-family: Segoe UI, sans-serif; margin: 0; }
header, footer { background: #1e3a8a; color: #fff; padding: 12px 16px; }
header a, footer a { color: #fde68a; }
main, aside { padding: 0 16px; }
aside { background: #fef9c3; margin: 8px 16px; padding: 8px 16px; }
table { border-collapse: collapse; }
th, td { border: 1px solid #aaa; padding: 4px 10px; }
figure { margin: 0; }`;

const semanticJs = `const tags = ['header','nav','main','section','article','aside','footer','figure'];
tags.forEach(t => console.log(t + ':', document.querySelectorAll(t).length));`;

export default {
  id: 'day-052-html-lists-links-images-tables-semantic',
  title: 'HTML Lists, Links, Images, Tables and Semantic Elements',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 52,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Build a complete Student Information webpage using ordered/unordered/description lists, links, images, tables and HTML5 semantic layout elements: the same building blocks a Razor view uses to list students.',
  objectives: [
    'Create ordered, unordered, nested and description lists',
    'Write absolute, relative, anchor, mailto and tel links and open them safely in new tabs',
    'Add images with correct src, alt, width and height, and use figure/figcaption',
    'Build tables with caption, thead, tbody, tfoot, colspan and rowspan',
    'Structure a page with header, nav, main, section, article, aside and footer',
  ],
  theory: [
    {
      heading: 'Lists: ol, ul, li, dl',
      content: "- **Unordered list** `<ul>`: bullet points when order does not matter (documents to bring).\n- **Ordered list** `<ol>`: numbered when order matters (steps, rankings). Attributes: `type` (1, A, a, I, i), `start`, `reversed`.\n- Each item is an `<li>`; only `<li>` may be a direct child of `ul`/`ol`.\n- **Nested list**: put a new `ul`/`ol` **inside an `<li>`**.\n- **Description list** `<dl>` with `<dt>` (term) and `<dd>` (description): glossaries, key-value data.",
      syntax: '<ol type="1" start="1">\n  <li>Install VS</li>\n  <li>Create project\n    <ul><li>Console App</li></ul>\n  </li>\n</ol>',
      tip: 'Navigation menus are usually a <ul> of links inside <nav>; Bootstrap and most CSS frameworks expect that structure.',
    },
    {
      heading: 'Links: the anchor element <a>',
      content: "`<a href=\"...\">text</a>` creates a hyperlink.\n\n- **Absolute URL**: full address `https://learn.microsoft.com/dotnet/`.\n- **Relative URL**: path from the current file: `courses.html`, `pages/fees.html`, `../index.html`. In ASP.NET Core you will often see root-relative `/Students/Index`.\n- **Anchor (fragment) link**: `href=\"#marks\"` jumps to the element with `id=\"marks\"`.\n- **Email / phone**: `mailto:a@b.com`, `tel:+911234567890`.\n- `target=\"_blank\"` opens a new tab; add `rel=\"noopener noreferrer\"` for security.\n- `download` attribute asks the browser to download the file.",
      syntax: '<a href="fees.html">Fees</a>\n<a href="#contact">Contact</a>\n<a href="https://dotnet.microsoft.com" target="_blank" rel="noopener noreferrer">.NET</a>',
    },
    {
      heading: 'Images: <img>, alt, size and <figure>',
      content: "`<img>` is a void element. Key attributes:\n- `src`: path or URL of the image (relative `images/logo.png` or absolute).\n- `alt`: text alternative, **required** for accessibility and shown if the image fails.\n- `width` / `height`: reserve space so the page does not jump while loading (in pixels, no unit).\n- `loading=\"lazy\"`: load only when near the viewport.\n\nWrap an image in `<figure>` with `<figcaption>` for a caption. Wrap it in `<a>` to make a clickable image.\n\nCommon formats: JPG (photos), PNG (transparency), SVG (logos/icons, scalable), WebP (modern, small).",
      syntax: '<figure>\n  <img src="images/riya.jpg" alt="Riya Sharma" width="120" height="120" loading="lazy">\n  <figcaption>Riya Sharma</figcaption>\n</figure>',
      tip: 'Decorative images should have an empty alt="" so screen readers skip them; meaningful images need a descriptive alt.',
    },
    {
      heading: 'Tables',
      content: "Tables show **tabular data** (rows and columns) such as student marks, never page layout.\n\n- `<table>` container, `<caption>` title.\n- `<tr>` table row, `<th>` header cell (bold, centred), `<td>` data cell.\n- `<thead>`, `<tbody>`, `<tfoot>` group rows (helps styling, printing and screen readers).\n- `colspan=\"2\"` merges cells across columns; `rowspan=\"2\"` merges cells down rows.\n- `scope=\"col\"` / `scope=\"row\"` on `<th>` improves accessibility.\n\nBorders come from CSS: `border-collapse: collapse; td, th { border: 1px solid }`.\n\nIn Module 6 you will generate `<tr>` rows with a Razor `@foreach (var s in Model)` loop.",
      syntax: '<table>\n  <thead><tr><th scope="col">Name</th><th scope="col">Marks</th></tr></thead>\n  <tbody><tr><td>Riya</td><td>85</td></tr></tbody>\n</table>',
    },
    {
      heading: 'Semantic elements (HTML5)',
      content: "**Semantic** elements describe their meaning, not just their look. `<div>` and `<span>` are non-semantic.\n\n- `<header>`: intro area / logo / site title.\n- `<nav>`: main navigation links.\n- `<main>`: the unique main content (one per page).\n- `<section>`: a themed group of content, usually with a heading.\n- `<article>`: self-contained content (blog post, product card, news item).\n- `<aside>`: side content (notices, ads, related links).\n- `<footer>`: closing info, copyright, contacts.\n- Others: `<figure>`, `<figcaption>`, `<time>`, `<address>`, `<mark>`.\n\nBenefits: **SEO**, **accessibility** (screen-reader landmarks), cleaner code for teams. The default ASP.NET Core MVC `_Layout.cshtml` uses header, nav, main and footer.",
      tip: 'Block vs inline: block elements (div, p, h1, ul, table, section) start on a new line and take full width; inline elements (a, span, img, strong) sit inside a line.',
    },
  ],
  examples: [
    {
      title: 'All list types including nested and description lists',
      scenario: 'Show the course modules (ordered), documents to bring (unordered) and a glossary (description list).',
      steps: ['Create lists.html', 'Add an ol with a nested ul inside the Frontend li', 'Add a ul and a dl', 'Try type, start and reversed attributes on the last ol', 'Click Try in Playground'],
      code: listsHtml,
      playground: { html: listsHtml, css: 'body { font-family: Segoe UI, sans-serif; } dt { font-weight: bold; }', js: '' },
      result: 'Numbered list 1-4 with HTML/CSS/JavaScript bullets under "Frontend"; a bulleted documents list; a glossary with bold terms and indented descriptions; a final list showing E. Batch E and D. Batch D.',
      explanation: 'The nested ul lives inside the li. start="5" with type="A" starts at E, and reversed counts down, so the second item is D.',
    },
    {
      title: 'Links and images',
      scenario: 'Create anchor, external, email and phone links plus a captioned student photo and a clickable thumbnail.',
      steps: ['Create links.html', 'Give the profile section id="profile" and link to it with href="#profile"', 'Add an external link with target and rel', 'Add figure/img/figcaption and an image wrapped in a link', 'Run it and click each link'],
      code: linksHtml,
      playground: { html: linksHtml, css: 'body { font-family: Segoe UI, sans-serif; } figcaption { color: #555; font-size: 14px; }', js: '' },
      result: 'A nav row of four links. "Jump to Profile" scrolls to the Profile section; the docs link opens a new tab; the email link opens the mail app with a subject; the photo shows with caption "Riya Sharma, Roll No 101"; the small thumbnail opens a larger image.',
      explanation: 'Fragment links target an id. mailto/tel use protocol handlers. rel="noopener noreferrer" stops the new tab from controlling the original page.',
    },
    {
      title: 'Student marks table with colspan and rowspan',
      scenario: 'Display semester results the way a Razor view will later render them from the database.',
      steps: ['Create results.html', 'Add caption, thead, tbody, tfoot', 'Use colspan="2" for the absent student and in the footer', 'Build a timetable with rowspan="2"', 'Add the CSS for borders and run'],
      code: tableHtml + '\n\n<style>\n' + tableCss + '\n</style>',
      playground: { html: tableHtml, css: tableCss, js: '' },
      result: 'A bordered results table with caption "Semester 1 Results", 3 student rows (Neha\'s "Absent" spans C# and SQL columns) and a bold footer "Class Total | 325". Below, a timetable where "Monday" spans two rows.',
      explanation: 'colspan merges horizontally, rowspan vertically; the row that is covered by a rowspan has one fewer td. border-collapse removes double borders.',
    },
    {
      title: 'Student information webpage with semantic elements',
      scenario: 'Day 52 project: combine everything into one semantic Student Information page.',
      steps: ['Create student-info.html', 'Add header with h1 and nav', 'Inside main add sections for About (figure + list) and Marks (table) plus an article', 'Add aside and footer', 'Run and check the console, which counts each semantic element'],
      code: semanticHtml,
      playground: { html: semanticHtml, css: semanticCss, js: semanticJs },
      result: 'Blue header with title and nav links, the About section with photo and details list, a marks table, a project article, a yellow notice aside and a blue footer.\nConsole:\nheader: 1\nnav: 1\nmain: 1\nsection: 2\narticle: 1\naside: 1\nfooter: 1\nfigure: 1',
      explanation: 'Semantic tags give the page landmarks; the CSS only colours them. querySelectorAll proves the structure from JavaScript.',
    },
  ],
  interview: [
    { q: 'Difference between ol, ul and dl?', a: 'ol is an ordered (numbered) list, ul is an unordered (bulleted) list, dl is a description list of dt terms and dd descriptions.', level: 'Easy' },
    { q: 'How do you create a nested list?', a: 'Place a complete ul or ol inside an li of the parent list, not directly inside the parent ul/ol.', level: 'Easy' },
    { q: 'Absolute vs relative URL?', a: 'Absolute includes protocol and domain (https://site.com/page). Relative is resolved from the current page location (page.html, ../index.html) or site root (/Students).', level: 'Easy' },
    { q: 'Why add rel="noopener noreferrer" to target="_blank" links?', a: 'It prevents the opened page from accessing window.opener (reverse tabnabbing) and hides the referrer. Modern browsers imply noopener but adding it is best practice.', level: 'Medium' },
    { q: 'Why is the alt attribute important?', a: 'Accessibility (screen readers read it), it is shown if the image fails to load, and search engines use it. Decorative images use alt="".', level: 'Easy' },
    { q: 'Why specify width and height on images?', a: 'The browser reserves space before the image loads, preventing layout shift (better Core Web Vitals CLS score).', level: 'Medium' },
    { q: 'What do colspan and rowspan do?', a: 'colspan merges a cell across several columns; rowspan merges a cell down several rows.', level: 'Easy' },
    { q: 'Why use thead, tbody and tfoot?', a: 'They group rows semantically, help accessibility, allow separate styling, let the body scroll and repeat header/footer when printing.', level: 'Medium' },
    { q: 'What are semantic elements and their benefits?', a: 'Elements whose name describes their meaning (header, nav, main, article, footer). Benefits: SEO, accessibility landmarks, readable maintainable code.', level: 'Easy' },
    { q: 'section vs article vs div?', a: 'article is self-contained content that makes sense alone; section is a thematic grouping with a heading; div is a generic container with no meaning, used only for styling/grouping.', level: 'Medium' },
    { q: 'Should tables be used for page layout?', a: 'No. Tables are for tabular data. Layout should use CSS (flexbox/grid). Layout tables hurt accessibility and responsiveness.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a nested list of modules with topics under each.', hint: 'ol for modules, ul inside each li.', solution: '<ol>\n  <li>C#<ul><li>Variables</li><li>Loops</li></ul></li>\n  <li>SQL<ul><li>SELECT</li><li>JOIN</li></ul></li>\n</ol>' },
    { task: 'Make a navigation bar with links to Home, Courses and an email link, all inside nav and ul.', hint: 'nav > ul > li > a.', solution: '<nav>\n  <ul>\n    <li><a href="index.html">Home</a></li>\n    <li><a href="courses.html">Courses</a></li>\n    <li><a href="mailto:info@example.com">Email</a></li>\n  </ul>\n</nav>' },
    { task: 'Build an employee table (Id, Name, Department, Salary) with 3 rows and a footer row showing total salary using colspan.', hint: 'tfoot with td colspan="3".', solution: '<table border="1">\n  <thead><tr><th>Id</th><th>Name</th><th>Department</th><th>Salary</th></tr></thead>\n  <tbody>\n    <tr><td>1</td><td>Amit</td><td>IT</td><td>50000</td></tr>\n    <tr><td>2</td><td>Sara</td><td>HR</td><td>40000</td></tr>\n    <tr><td>3</td><td>John</td><td>IT</td><td>45000</td></tr>\n  </tbody>\n  <tfoot><tr><td colspan="3">Total</td><td>135000</td></tr></tfoot>\n</table>' },
    { task: 'Add a captioned college logo that links to the home page.', hint: 'a > figure? Better: figure > a > img + figcaption.', solution: '<figure>\n  <a href="index.html"><img src="https://picsum.photos/100" alt="College logo" width="100" height="100"></a>\n  <figcaption>ABC College</figcaption>\n</figure>' },
    { task: 'Convert this div layout into semantic HTML: <div id="top">, <div id="menu">, <div id="content">, <div id="bottom">.', hint: 'header, nav, main, footer.', solution: '<header>...</header>\n<nav>...</nav>\n<main>...</main>\n<footer>...</footer>' },
  ],
  quiz: [
    { question: 'Which element is a valid direct child of <ul>?', options: ['<ul>', '<p>', '<li>', '<dt>'], answer: 2, explanation: 'Only li elements may be direct children of ul and ol.' },
    { question: 'Which link jumps to <section id="marks">?', options: ['<a href="marks">', '<a href="#marks">', '<a href=".marks">', '<a id="#marks">'], answer: 1, explanation: 'A # followed by the id creates a fragment link.' },
    { question: 'Which attribute merges a cell across two columns?', options: ['rowspan="2"', 'merge="2"', 'span="2"', 'colspan="2"'], answer: 3, explanation: 'colspan spans columns; rowspan spans rows.' },
    { question: 'Which element should wrap the unique main content of a page?', options: ['<main>', '<section>', '<body>', '<article>'], answer: 0, explanation: 'There should be one visible <main> per page.' },
    { question: 'What does alt on <img> provide?', options: ['Image size', 'Alternative text for accessibility', 'Tooltip only', 'Image border'], answer: 1, explanation: 'alt is the text alternative read by screen readers and shown if the image fails.' },
  ],
};
