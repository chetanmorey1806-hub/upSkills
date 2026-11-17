const firstPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Portal</title>
</head>
<body>
  <h1>Welcome to the Student Portal</h1>
  <p>This is my first web page for the .NET Full Stack course.</p>
</body>
</html>`;

const studentDetails = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Student Details</title>
</head>
<body>
  <h1>Student Details</h1>
  <h2>Personal Information</h2>
  <p><strong>Name:</strong> Riya Sharma</p>
  <p><strong>Roll No:</strong> 101</p>
  <p><strong>Course:</strong> .NET Full Stack</p>
  <hr>
  <h2>About Me</h2>
  <p>I enjoy <em>building web applications</em> with C# and ASP.NET Core.<br>
     My goal is to become a full stack developer.</p>
  <!-- This comment is not shown in the browser -->
</body>
</html>`;

const attrsHtml = `<h1 id="main-title" title="Hover text">Registration Opens Monday</h1>
<p class="note">Admission for batch <b>2026</b> is now open.</p>
<p lang="hi">स्वागत है</p>
<a href="https://learn.microsoft.com/dotnet/" target="_blank" title="Microsoft docs">Read .NET docs</a>
<img src="https://picsum.photos/200/120" alt="Campus photo" width="200" height="120">`;

const attrsJs = `const h1 = document.getElementById('main-title');
console.log('Tag name:', h1.tagName);
console.log('id attribute:', h1.getAttribute('id'));
console.log('title attribute:', h1.getAttribute('title'));
console.log('Link opens in:', document.querySelector('a').getAttribute('target'));`;

const headingsHtml = `<h1>Student Management System</h1>
<h2>Module 1: Registration</h2>
<h3>Personal Details</h3>
<h4>Address</h4>
<h5>Permanent Address</h5>
<h6>Notes</h6>
<p>A paragraph is a block of text.     Extra    spaces
and new lines in the source are collapsed into one space.</p>
<p>Use a line break<br>to force a new line.</p>
<pre>
Roll   Name
101    Riya
102    Arjun
</pre>`;

export default {
  id: 'day-051-html-introduction-structure-tags',
  title: 'HTML Introduction: Structure, Tags, Elements, Attributes, Headings and Paragraphs',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 51,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Start the frontend module: learn what HTML is, how every page is structured, the difference between tags, elements and attributes, and build your first web page with headings and paragraphs. ASP.NET Core Razor views (Module 6) produce exactly this HTML.',
  objectives: [
    'Explain what HTML is and how a browser turns an .html file into a page',
    'Write the basic HTML5 document structure from memory',
    'Differentiate tags, elements and attributes and use common attributes',
    'Use headings h1-h6, paragraphs, line breaks, horizontal rules and comments correctly',
    'Create and open a first web page in VS Code or Visual Studio',
  ],
  theory: [
    {
      heading: 'What is HTML and why .NET developers need it',
      content: "**HTML (HyperText Markup Language)** describes the **structure** of a web page: headings, paragraphs, links, images, tables and forms. It is a **markup language**, not a programming language (no variables, loops or conditions).\n\nA web page has three layers:\n- **HTML**: structure (the skeleton)\n- **CSS**: presentation (the paint)\n- **JavaScript**: behaviour (the electricity)\n\nAs a .NET full stack developer you will write HTML inside **Razor views (.cshtml)** in ASP.NET Core MVC, and React components render HTML too. The server (Kestrel) sends HTML to the browser; the browser **parses** it into a tree called the **DOM** and paints it.",
      points: ['HTML files are plain text saved with the .html extension', 'index.html is the default page of a folder/website', 'For deeper study open the full HTML course in this app'],
      tip: 'Interview: "Is HTML a programming language?" No. It is a markup language that only describes content.',
    },
    {
      heading: 'Basic structure of an HTML5 document',
      content: "Every HTML page follows the same skeleton:\n\n1. `<!DOCTYPE html>` tells the browser to use **HTML5 standards mode**.\n2. `<html lang=\"en\">` is the **root element**; `lang` helps screen readers and search engines.\n3. `<head>` holds information **about** the page (not shown): `<meta charset=\"UTF-8\">`, the viewport meta for mobiles, `<title>` (shown in the browser tab), links to CSS.\n4. `<body>` holds everything the user **sees**.",
      syntax: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page title</title>\n</head>\n<body>\n  visible content\n</body>\n</html>',
      tip: 'In VS Code type ! and press Tab (Emmet) to generate this skeleton. In Visual Studio: right-click wwwroot > Add > New Item > HTML Page.',
    },
    {
      heading: 'Tags, elements and attributes',
      content: "- A **tag** is the label in angle brackets: `<p>` (opening) and `</p>` (closing).\n- An **element** is the complete thing: opening tag + content + closing tag, e.g. `<p>Hello</p>`.\n- **Void (empty) elements** have no content and no closing tag: `<br>`, `<hr>`, `<img>`, `<input>`, `<meta>`, `<link>`.\n- **Nesting**: elements can contain other elements, but must close in reverse order: `<p><strong>Hi</strong></p>` (correct) vs `<p><strong>Hi</p></strong>` (wrong).\n\n**Attributes** give extra information and are written inside the opening tag as `name=\"value\"`.\n\nCommon global attributes: `id` (unique), `class` (group for CSS), `title` (tooltip), `style` (inline CSS), `lang`, `hidden`. Element-specific: `href` on `<a>`, `src`/`alt` on `<img>`, `type` on `<input>`.",
      syntax: '<a href="https://example.com" target="_blank" title="Visit">Link text</a>\n<!-- tag name: a | attributes: href, target, title | content: Link text -->',
      tip: 'HTML tag names are case-insensitive, but always write them in lowercase and always quote attribute values.',
    },
    {
      heading: 'Headings h1 to h6',
      content: "HTML has six heading levels. `<h1>` is the most important (page title) and `<h6>` the least. Browsers show them bold with decreasing size.\n\nRules:\n- Use **one `<h1>`** per page for the main topic.\n- Do not skip levels (h1 then h3) just to get a smaller font; use CSS for size.\n- Search engines and screen readers use headings to understand the page outline.",
      syntax: '<h1>Student Portal</h1>\n<h2>Courses</h2>\n<h3>.NET Full Stack</h3>',
    },
    {
      heading: 'Paragraphs, line breaks, horizontal rules, formatting and comments',
      content: "- `<p>` creates a paragraph (block with space above and below).\n- **Whitespace collapsing**: many spaces or new lines in source become **one space**. Use `<br>` for a line break or `<pre>` to keep spacing.\n- `<hr>` draws a thematic break (horizontal line).\n- Inline formatting: `<strong>` (important, bold), `<em>` (emphasis, italic), `<b>`, `<i>`, `<mark>`, `<small>`, `<sub>`, `<sup>`.\n- Comments: `<!-- text -->` are ignored by the browser but visible in View Source, so never put passwords in them.",
      syntax: '<p>Line one<br>Line two</p>\n<hr>\n<p>H<sub>2</sub>O and x<sup>2</sup></p>\n<!-- TODO: add photo -->',
      tip: 'Prefer <strong>/<em> over <b>/<i> because they carry meaning (semantics) for screen readers.',
    },
    {
      heading: 'Creating and running your first page',
      content: "1. Install **VS Code** with the **Live Server** extension (or use Visual Studio 2022/2026).\n2. Create a folder `StudentPortal`, then a file `index.html`.\n3. Type the skeleton, save with **Ctrl+S**.\n4. Right-click > **Open with Live Server** (or double-click the file to open it in Chrome/Edge).\n5. Press **F12** to open DevTools; the **Elements** tab shows the DOM tree; right-click > **View Page Source** shows the raw HTML.\n\nIn ASP.NET Core, static .html files go in the `wwwroot` folder and are served by `app.UseStaticFiles()`.",
    },
  ],
  examples: [
    {
      title: 'Create your first webpage',
      scenario: 'The training institute wants a simple welcome page for the Student Portal.',
      steps: ['Open VS Code and create a folder StudentPortal', 'Create index.html', 'Type ! and press Tab to get the skeleton, then edit title and body', 'Save (Ctrl+S) and right-click > Open with Live Server (or click Try in Playground)'],
      code: firstPage,
      playground: { html: firstPage, css: '', js: '' },
      result: 'Browser tab shows "Student Portal". Page shows a large bold heading "Welcome to the Student Portal" and one paragraph below it.',
      explanation: 'DOCTYPE switches on standards mode, <head> sets encoding, viewport and tab title, and <body> contains the visible h1 and p elements.',
    },
    {
      title: 'Print student details with headings, paragraphs and formatting',
      scenario: 'Show one student\'s details on a page (the Day 3 C# "print student details" program, now as HTML).',
      steps: ['Create student.html', 'Add h1 for the page title and h2 for each section', 'Use p with strong labels for each field', 'Add hr, br and a comment', 'Open in browser and press F12 to inspect the elements'],
      code: studentDetails,
      playground: { html: studentDetails, css: '', js: '' },
      result: 'Heading "Student Details", sub-heading "Personal Information", three lines with bold labels (Name: Riya Sharma, Roll No: 101, Course: .NET Full Stack), a horizontal line, then "About Me" with an italic phrase and a forced line break. The comment is not visible.',
      explanation: '<strong> makes labels bold and meaningful, <em> italicises, <br> breaks the line inside the same paragraph, <hr> separates sections, and the comment exists only in the source.',
    },
    {
      title: 'Tags, elements and attributes in action',
      scenario: 'Add an id, class, title, href, target, src and alt attributes, then read them with a little JavaScript.',
      steps: ['Create attributes.html with the HTML below', 'Hover over the heading to see the title tooltip', 'Open the playground console to see the attribute values read by JS', 'Click the link: it opens in a new tab because of target="_blank"'],
      code: attrsHtml + '\n\n<script>\n' + attrsJs + '\n</script>',
      playground: { html: attrsHtml, css: '.note { color: #555; }', js: attrsJs },
      result: 'Console:\nTag name: H1\nid attribute: main-title\ntitle attribute: Hover text\nLink opens in: _blank\nPage: heading, grey note paragraph, Hindi greeting, a link and a 200x120 picture.',
      explanation: 'Attributes live in the opening tag as name="value". getAttribute reads them; tagName is always upper-case in HTML documents. alt text is shown if the image fails and is read by screen readers.',
    },
    {
      title: 'Heading levels and whitespace rules',
      scenario: 'Show all six heading levels and prove that HTML collapses whitespace unless you use <br> or <pre>.',
      steps: ['Create headings.html', 'Paste the HTML below', 'Compare the source spacing with what the browser shows', 'Try removing <br> and watch the text join on one line'],
      code: headingsHtml,
      playground: { html: headingsHtml, css: 'body { font-family: Segoe UI, sans-serif; }', js: '' },
      result: 'Six headings from largest (h1) to smallest (h6). The first paragraph appears on one line with single spaces. The second paragraph breaks after "line break". The <pre> block keeps the column spacing exactly.',
      explanation: 'The browser collapses spaces/new lines inside normal elements. <br> inserts an explicit break; <pre> preserves whitespace and uses a monospace font.',
    },
  ],
  interview: [
    { q: 'What is HTML?', a: 'HyperText Markup Language: the standard markup language that describes the structure and content of web pages using elements (tags). It is not a programming language.', level: 'Easy' },
    { q: 'What is the purpose of <!DOCTYPE html>?', a: 'It is a declaration (not a tag) that tells the browser to render the page in HTML5 standards mode instead of quirks mode.', level: 'Easy' },
    { q: 'Difference between a tag and an element?', a: 'A tag is the markup in angle brackets (<p> or </p>). An element is the whole unit: opening tag, content and closing tag, e.g. <p>Hi</p>.', level: 'Easy' },
    { q: 'What are void (empty) elements? Give examples.', a: 'Elements with no content and no closing tag: <br>, <hr>, <img>, <input>, <meta>, <link>.', level: 'Easy' },
    { q: 'What goes in <head> vs <body>?', a: '<head> holds metadata (charset, viewport, title, CSS links, scripts); it is not displayed. <body> contains all visible content.', level: 'Easy' },
    { q: 'Difference between id and class attributes?', a: 'id must be unique in the page and identifies one element (used by JS getElementById, anchors). class can be shared by many elements and an element can have many classes; used mostly for CSS.', level: 'Easy' },
    { q: 'Why should a page have only one h1 and not skip heading levels?', a: 'Headings create the document outline used by screen readers and search engines. One h1 states the main topic; skipping levels breaks the logical outline. Use CSS to change size.', level: 'Medium' },
    { q: 'Difference between <strong> and <b>, <em> and <i>?', a: '<strong>/<em> are semantic (importance/emphasis, announced by screen readers). <b>/<i> are purely visual styling without extra meaning.', level: 'Medium' },
    { q: 'Why does extra whitespace in HTML source not appear on the page?', a: 'Browsers collapse consecutive whitespace (spaces, tabs, newlines) into a single space in normal flow. Use <br>, <pre>, &nbsp; or CSS white-space to control it.', level: 'Medium' },
    { q: 'What does the viewport meta tag do?', a: '<meta name="viewport" content="width=device-width, initial-scale=1.0"> makes mobile browsers use the device width instead of a zoomed-out 980px desktop layout; required for responsive design.', level: 'Medium' },
    { q: 'Where do static HTML files go in an ASP.NET Core project and what serves them?', a: 'In the wwwroot folder; they are served by the static files middleware app.UseStaticFiles() (or MapStaticAssets in .NET 9+).', level: 'Hard' },
  ],
  practice: [
    { task: 'Create about.html with your name in an h1, a paragraph introducing yourself and an hr.', hint: 'Use the HTML5 skeleton (! + Tab in VS Code).', solution: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>About Me</title></head>\n<body>\n  <h1>Arjun Mehta</h1>\n  <p>I am learning .NET Full Stack development.</p>\n  <hr>\n</body>\n</html>' },
    { task: 'Create a page showing a course outline using h1 (course), h2 (modules) and h3 (topics).', hint: 'Do not skip levels.', solution: '<h1>.NET Full Stack</h1>\n<h2>Module 1: C#</h2>\n<h3>Variables</h3>\n<h3>Loops</h3>\n<h2>Module 5: Frontend</h2>\n<h3>HTML</h3>\n<h3>CSS</h3>' },
    { task: 'Write the formula H2O and E = mc2 correctly using sub and sup.', hint: '<sub> lowers, <sup> raises.', solution: '<p>H<sub>2</sub>O</p>\n<p>E = mc<sup>2</sup></p>' },
    { task: 'Show a 3-line address in one paragraph and a timetable that keeps its spacing.', hint: '<br> inside p; <pre> for spacing.', solution: '<p>Flat 12, Sunrise Apartments<br>MG Road<br>Pune 411001</p>\n<pre>\nDay   Topic\nMon   HTML\nTue   CSS\n</pre>' },
    { task: 'Find and fix the errors: <P><strong>Hello</p></strong><img src=photo.jpg>', hint: 'Lowercase, correct nesting order, quoted attributes, alt text.', solution: '<p><strong>Hello</strong></p>\n<img src="photo.jpg" alt="Student photo">' },
  ],
  quiz: [
    { question: 'Which element contains the content visible on the page?', options: ['<head>', '<body>', '<title>', '<meta>'], answer: 1, explanation: 'Everything inside <body> is rendered; <head> holds metadata.' },
    { question: 'Which of these is a void element?', options: ['<p>', '<h1>', '<br>', '<strong>'], answer: 2, explanation: '<br> has no content and no closing tag.' },
    { question: 'Where is the text of <title> shown?', options: ['As the largest heading', 'In the browser tab', 'In the footer', 'Nowhere'], answer: 1, explanation: 'The title appears in the tab, bookmarks and search results.' },
    { question: 'In <a href="x.html" target="_blank">Go</a>, what is href?', options: ['An element', 'A tag', 'Content', 'An attribute'], answer: 3, explanation: 'href is an attribute written inside the opening tag.' },
    { question: 'Which tag gives the most important heading?', options: ['<h1>', '<h6>', '<head>', '<header>'], answer: 0, explanation: '<h1> is the top-level heading; <head> is the metadata section.' },
  ],
};
