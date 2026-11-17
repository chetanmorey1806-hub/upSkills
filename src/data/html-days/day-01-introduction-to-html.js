export default {
  id: 'day-01-introduction-to-html',
  title: 'Introduction to HTML: History, Versions, Features and Uses',
  module: 'Module 1: HTML Fundamentals',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: "Learn what HTML is, where it came from, how it evolved into HTML5 and why every web page you have ever opened is built on it. You will write and run your very first web page.",
  objectives: [
    'Define HTML and explain the meaning of HyperText and Markup Language',
    'Describe the history of HTML from Tim Berners-Lee to the HTML Living Standard',
    'List the major HTML versions and what each one added',
    'Explain the key features and real-world uses of HTML',
    'Create and open a first HTML page in the browser',
  ],
  theory: [
    {
      heading: 'What is HTML?',
      content: "**HTML** stands for **HyperText Markup Language**. It is the standard language used to describe the **structure and content** of a web page: headings, paragraphs, links, images, lists, tables, forms and more.\n\nThink of a web page like a house:\n- **HTML** is the skeleton and walls (structure)\n- **CSS** is the paint and decoration (presentation)\n- **JavaScript** is the electricity and plumbing (behaviour)\n\n**HyperText** means text that contains links to other text (hyperlinks). **Markup** means we wrap content in special labels called **tags** so the browser knows what each piece of content is. **Language** means it has fixed rules (a syntax) that browsers understand.\n\nImportant: HTML is a **markup language, not a programming language**. It has no variables, loops or conditions. It only describes what the content is.",
      syntax: '<h1>This is a heading</h1>\n<p>This is a paragraph.</p>',
      tip: "Interview favourite: \"Is HTML a programming language?\" Answer: No. It is a markup language that describes structure; it cannot perform logic or calculations.",
    },
    {
      heading: 'How a browser uses HTML',
      content: "When you type a website address, this happens:\n\n1. The browser sends a request to a **web server**.\n2. The server sends back an **HTML file** (plain text).\n3. The browser **parses** (reads) the HTML and builds a tree of elements called the **DOM** (Document Object Model).\n4. The browser **renders** (paints) that tree on the screen, also loading any CSS, images and JavaScript the HTML points to.\n\nBecause HTML is plain text, you can write it in any text editor (VS Code, Notepad, Sublime). You save the file with the extension **.html** (for example `index.html`) and open it in any browser.",
      points: [
        'HTML files are plain text with the .html extension',
        'The browser is the program that reads and displays HTML',
        'index.html is the default file name a server shows for a folder',
      ],
    },
    {
      heading: 'History of HTML',
      content: "- **1989**: **Tim Berners-Lee**, a physicist at **CERN** (Switzerland), proposed a system to share documents between scientists using hyperlinks. This became the **World Wide Web**.\n- **1991**: He published the first description of HTML, called \"HTML Tags\", with about 18 tags.\n- **1993**: The Mosaic browser added images, making the web popular with the public.\n- **1994**: The **W3C** (World Wide Web Consortium) was founded to create web standards.\n- **2004**: Browser makers (Apple, Mozilla, Opera) formed **WHATWG** because they felt XHTML 2.0 was going in the wrong direction.\n- **2014**: **HTML5** became an official W3C Recommendation.\n- **2019 onwards**: W3C and WHATWG agreed that the **HTML Living Standard**, maintained by WHATWG, is the single official version of HTML. It is updated continuously instead of releasing big numbered versions.",
      tip: 'Remember the trio: Tim Berners-Lee (inventor), CERN (where), 1991 (first public HTML).',
    },
    {
      heading: 'HTML Versions',
      content: "1. **HTML 1.0 (1991/1993)**: very basic: headings, paragraphs, links.\n2. **HTML 2.0 (1995)**: first standard version; added **forms**.\n3. **HTML 3.2 (1997)**: first W3C recommendation; added **tables**, applets, text flow around images.\n4. **HTML 4.01 (1999)**: separated style from structure by encouraging **CSS**; added better forms and scripting support.\n5. **XHTML 1.0 (2000)**: HTML rewritten with strict XML rules (lowercase tags, every tag closed).\n6. **HTML5 (2014)**: semantic tags (`<header>`, `<nav>`, `<article>`), native `<audio>` and `<video>`, `<canvas>`, new input types, offline storage APIs, and a simple doctype `<!DOCTYPE html>`.\n7. **HTML Living Standard (today)**: continuously updated HTML5. When people say \"HTML5\" today, they mean this.",
      tip: 'Common mistake: thinking there will be an \"HTML6\". There is no numbered HTML6 planned; HTML is now a living standard.',
    },
    {
      heading: 'Features of HTML',
      content: "- **Easy to learn**: simple, readable tags.\n- **Platform independent**: works on Windows, Mac, Linux, Android, iOS in any browser.\n- **Free**: no licence or special software required.\n- **Case-insensitive tags**: `<P>` and `<p>` both work, but lowercase is the best practice.\n- **Forgiving**: browsers try to display a page even with small errors (which is why you must still write valid code: different browsers may \"fix\" errors differently).\n- **Hyperlinks**: connect pages together across the whole world.\n- **Multimedia support**: images, audio, video and graphics without plugins (HTML5).\n- **Works with CSS and JavaScript** to build full, interactive applications.\n- **SEO and accessibility friendly** when semantic tags are used correctly.",
    },
    {
      heading: 'Uses of HTML',
      content: "- **Web pages and websites**: every site (Google, Amazon, Wikipedia) sends HTML to your browser.\n- **Web applications**: Gmail, YouTube and online banking are HTML + CSS + JavaScript apps.\n- **Email templates**: newsletters and marketing emails are written in HTML.\n- **Mobile and desktop apps**: hybrid apps (Cordova, Ionic) and desktop apps (VS Code via Electron) use HTML for their interface.\n- **Documentation and e-books**: many help sites and EPUB books are HTML.\n- **Games and graphics** with `<canvas>` and SVG.\n\nComing next (Day 2): the full structure of an HTML document: `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` and `<title>`.",
    },
  ],
  examples: [
    {
      title: 'Your first web page',
      scenario: 'You want to create a simple page that greets visitors to your portfolio.',
      steps: [
        'Create a folder named my-first-site',
        'Inside it, create a file named index.html in VS Code',
        'Type the code below and save',
        'Double-click index.html (or click Run in the playground) to open it in a browser',
      ],
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is my very first web page built with HTML.</p>
</body>
</html>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is my very first web page built with HTML.</p>
</body>
</html>`,
      },
      result: 'A large bold heading "Hello, World!" followed by a normal paragraph of text. The browser tab shows "My First Page".',
      explanation: '<!DOCTYPE html> tells the browser to use modern HTML5 rules. <html> wraps the whole page, <head> holds information about the page (like the tab title), and <body> holds everything visible. <h1> is a main heading and <p> is a paragraph. You will study each of these in detail on Day 2.',
    },
    {
      title: 'HyperText in action: linking pages',
      scenario: 'Show what "HyperText" means by creating text that jumps to another page.',
      steps: [
        'Open index.html',
        'Add a paragraph that contains an <a> tag',
        'Set href to a real website address',
        'Click Run and click the link',
      ],
      code: `<h1>Learning Resources</h1>
<p>
  HTML is maintained by WHATWG. Read the official
  <a href="https://html.spec.whatwg.org/" target="_blank">HTML Living Standard</a>.
</p>`,
      playground: {
        html: `<h1>Learning Resources</h1>
<p>
  HTML is maintained by WHATWG. Read the official
  <a href="https://html.spec.whatwg.org/" target="_blank">HTML Living Standard</a>.
</p>
<p>Clicking the blue underlined text opens another document. That is <strong>HyperText</strong>.</p>`,
      },
      result: 'A paragraph with a blue, underlined link "HTML Living Standard". Clicking it opens the specification in a new tab.',
      explanation: 'The <a> (anchor) tag turns its text into a hyperlink. The href attribute holds the destination. This ability to jump between documents is the "HyperText" in HTML. Links are covered fully on Day 6.',
    },
    {
      title: 'Structure vs presentation vs behaviour',
      scenario: 'See how HTML, CSS and JavaScript each play a different role on the same page.',
      steps: [
        'Write the HTML: a heading and a button',
        'Add a little CSS to colour the heading',
        'Add a small JavaScript snippet that reacts to the button',
        'Click Run, then click the button',
      ],
      code: `<!-- HTML: structure -->
<h1 id="title">HTML, CSS and JS</h1>
<button id="btn">Click me</button>

/* CSS: presentation */
h1 { color: teal; font-family: sans-serif; }

// JavaScript: behaviour
document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('title').textContent = 'You clicked the button!';
});`,
      playground: {
        html: `<h1 id="title">HTML, CSS and JS</h1>
<p>HTML gives the heading and button. CSS colours them. JavaScript makes the button work.</p>
<button id="btn">Click me</button>`,
        css: `h1 { color: teal; font-family: sans-serif; }
button { padding: 8px 16px; font-size: 16px; cursor: pointer; }`,
        js: `document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('title').textContent = 'You clicked the button!';
  console.log('Button clicked - JavaScript handled the behaviour');
});`,
      },
      result: 'A teal heading and a button. Clicking the button changes the heading text and logs a message to the console.',
      explanation: 'HTML alone creates the heading and button (structure). CSS changes the colour (presentation). JavaScript listens for the click and changes the text (behaviour). In this course we focus on HTML; CSS and JS have their own courses.',
    },
    {
      title: 'Browsers forgive mistakes (but you should not rely on it)',
      scenario: 'Understand why valid HTML matters even though the browser still shows broken code.',
      steps: [
        'Write a paragraph and forget to close a <strong> tag',
        'Click Run and notice that the bold "leaks" into later text',
        'Fix the code by adding </strong>',
      ],
      code: `<p>This is <strong>important text.</p>
<p>Oops, why is this paragraph also bold?</p>

<!-- Fixed -->
<p>This is <strong>important</strong> text.</p>
<p>This paragraph is normal.</p>`,
      playground: {
        html: `<h3>Broken version</h3>
<div>
  <p>This is <strong>important text.</p>
  <p>Oops, why is this paragraph also bold?</p>
</div>
<h3>Fixed version</h3>
<div>
  <p>This is <strong>important</strong> text.</p>
  <p>This paragraph is normal.</p>
</div>`,
      },
      result: 'In the broken version, the second paragraph also appears bold. In the fixed version only the word "important" is bold.',
      explanation: 'HTML is forgiving: the browser does not crash on errors, it guesses. Here it guessed that the unclosed <strong> continues. Guesses may differ between browsers, so always close your tags and validate your code at validator.w3.org.',
    },
  ],
  interview: [
    { q: 'What is HTML?', a: 'HTML (HyperText Markup Language) is the standard markup language used to create the structure and content of web pages. It uses tags to tell the browser what each piece of content is (heading, paragraph, link, image and so on).', level: 'Easy' },
    { q: 'Is HTML a programming language? Why or why not?', a: 'No. HTML is a markup language. It has no logic, variables, loops or conditions; it only describes structure and meaning. Programming logic on web pages is done with JavaScript.', level: 'Easy' },
    { q: 'What does "HyperText" mean?', a: 'HyperText is text that contains links (hyperlinks) to other text or documents, allowing non-linear navigation. In HTML this is done with the <a> element.', level: 'Easy' },
    { q: 'Who invented HTML and when?', a: 'Tim Berners-Lee invented HTML while working at CERN. He proposed the Web in 1989 and published the first description of HTML tags in 1991.', level: 'Easy' },
    { q: 'What is the difference between W3C and WHATWG?', a: 'W3C (World Wide Web Consortium) is the international standards body for the web founded in 1994. WHATWG (Web Hypertext Application Technology Working Group) was formed by browser vendors in 2004. Since 2019 they agreed that WHATWG maintains the HTML Living Standard, which is the single authoritative HTML specification.', level: 'Medium' },
    { q: 'What is the latest version of HTML?', a: 'HTML5 was the last numbered version (2014). Today HTML is the "HTML Living Standard" maintained by WHATWG, which is continuously updated. People still commonly call it HTML5.', level: 'Easy' },
    { q: 'Name some features introduced in HTML5.', a: 'Semantic elements (header, nav, main, article, section, aside, footer), native audio and video, canvas and inline SVG, new input types (email, date, range, color), form validation attributes, localStorage/sessionStorage, and the simple <!DOCTYPE html> declaration.', level: 'Medium' },
    { q: 'What is the role of HTML, CSS and JavaScript in a web page?', a: 'HTML defines the structure and content, CSS controls presentation (colours, layout, fonts) and JavaScript adds behaviour and interactivity.', level: 'Easy' },
    { q: 'Are HTML tags case-sensitive?', a: 'No. <P> and <p> work the same in HTML. However, lowercase is the recommended convention and was required in XHTML.', level: 'Easy' },
    { q: 'What happens if you write invalid HTML?', a: 'Browsers use error-recovery rules and still try to render the page, but the result can be unexpected or differ between browsers, can hurt accessibility and SEO, and can break CSS/JS. That is why you should validate HTML (for example with the W3C validator).', level: 'Medium' },
    { q: 'What is the DOM?', a: 'The Document Object Model is the tree structure the browser builds in memory after parsing HTML. Each element becomes a node. CSS styles it and JavaScript can read and change it.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a page called about.html with a heading containing your name and a paragraph describing yourself in two sentences.',
      hint: 'Use <h1> for your name and <p> for the description. Start with <!DOCTYPE html>.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About Me</title>
</head>
<body>
  <h1>Priya Sharma</h1>
  <p>I am a fresher learning web development. My goal is to build my own portfolio website.</p>
</body>
</html>`,
    },
    {
      task: 'Build a "History of HTML" page that lists at least four key years as separate paragraphs.',
      hint: 'One <p> per year. Use <strong> to highlight the year.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>History of HTML</title>
</head>
<body>
  <h1>History of HTML</h1>
  <p><strong>1989</strong> - Tim Berners-Lee proposes the World Wide Web at CERN.</p>
  <p><strong>1991</strong> - First description of HTML tags is published.</p>
  <p><strong>2014</strong> - HTML5 becomes a W3C Recommendation.</p>
  <p><strong>2019</strong> - HTML Living Standard by WHATWG becomes the official HTML.</p>
</body>
</html>`,
    },
    {
      task: 'Create a page with a paragraph that contains a link to https://developer.mozilla.org opening in a new tab.',
      hint: 'Use <a href="..." target="_blank">.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resources</title>
</head>
<body>
  <h1>Where I learn HTML</h1>
  <p>My favourite reference is <a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a>.</p>
</body>
</html>`,
    },
    {
      task: 'Write a page titled "Uses of HTML" with a heading and five paragraphs, each describing one real-world use of HTML.',
      hint: 'Websites, web apps, emails, hybrid/desktop apps, documentation.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Uses of HTML</title>
</head>
<body>
  <h1>Uses of HTML</h1>
  <p>1. Building websites such as blogs and company sites.</p>
  <p>2. Building web applications such as Gmail.</p>
  <p>3. Designing HTML email newsletters.</p>
  <p>4. Creating desktop apps with Electron, like VS Code.</p>
  <p>5. Writing online documentation and e-books.</p>
</body>
</html>`,
    },
  ],
  quiz: [
    { question: 'What does HTML stand for?', options: ['Hyperlinks and Text Markup Language', 'HyperText Markup Language', 'Home Tool Markup Language', 'HighText Machine Language'], answer: 1, explanation: 'HTML = HyperText Markup Language.' },
    { question: 'Who invented HTML?', options: ['Brendan Eich', 'Bill Gates', 'Tim Berners-Lee', 'Linus Torvalds'], answer: 2, explanation: 'Tim Berners-Lee created HTML and the Web at CERN. Brendan Eich created JavaScript.' },
    { question: 'Which organisation maintains the HTML Living Standard today?', options: ['WHATWG', 'ISO', 'IEEE', 'ECMA'], answer: 0, explanation: 'WHATWG maintains the HTML Living Standard; ECMA maintains JavaScript (ECMAScript).' },
    { question: 'Which file extension is used for HTML pages?', options: ['.ht', '.txt', '.xml', '.html'], answer: 3, explanation: '.html (or the older .htm) is the extension for HTML documents.' },
    { question: 'Which statement about HTML is TRUE?', options: ['HTML is a programming language with loops', 'HTML only works on Windows', 'HTML describes the structure of a web page', 'HTML must be compiled before running'], answer: 2, explanation: 'HTML is a platform-independent markup language that describes structure; browsers read it directly without compiling.' },
  ],
};
