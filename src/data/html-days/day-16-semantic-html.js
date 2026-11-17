export default {
  id: 'day-16-semantic-html',
  title: 'Semantic HTML: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>',
  module: 'Module 4: Semantic HTML & Advanced Elements',
  day: 16,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "Semantic HTML means choosing tags that describe the MEANING of content, not just its look. Today you learn the seven main layout landmarks and how they make pages easier for browsers, search engines, screen readers and other developers to understand.",
  objectives: [
    'Explain what semantic HTML is and why it matters (SEO, accessibility, maintainability)',
    'Use <header>, <nav>, <main> and <footer> to build a page skeleton',
    'Choose correctly between <section>, <article> and <aside>',
    'Replace a "div soup" layout with meaningful semantic elements',
  ],
  theory: [
    {
      heading: 'What is Semantic HTML?',
      content: "A **semantic** element clearly describes its meaning to both the browser and the developer. `<div>` tells you nothing: it is just a box. `<nav>` tells everyone: this box holds navigation links.\n\nThink of a newspaper. It has a masthead at the top, a menu of sections, the main stories, side columns with ads, and a footer with contact details. Semantic tags let you label each part of your web page the same way.\n\nWhy it matters:\n- **Accessibility**: screen readers let users jump straight to `<nav>` or `<main>` (these are called *landmarks*).\n- **SEO**: search engines understand which part is the real content.\n- **Readability**: other developers instantly understand the layout.\n- **Less code**: you need fewer class names like `class=\"header\"`.",
      points: [
        'Non-semantic: <div>, <span> (say nothing about content)',
        'Semantic: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>, <figure>, <time>…',
        'Semantic tags look the same as <div> by default; meaning is the difference, not style',
      ],
    },
    {
      heading: '<header>, <nav>, <main> and <footer>',
      content: "- `<header>`: introductory content, usually a logo, site title and maybe the navigation. A page can have one main header, and each `<article>` or `<section>` may also have its own header.\n- `<nav>`: a block of **major** navigation links (main menu, table of contents, pagination). Not every group of links needs `<nav>`.\n- `<main>`: the dominant, unique content of the page. Use it **only once** per page (only one visible `<main>`), and do not put it inside header, nav, article, aside or footer.\n- `<footer>`: closing information: copyright, contact links, related links. Articles and sections can have their own footers too.",
      syntax: `<body>
  <header>
    <h1>My Site</h1>
    <nav>
      <a href="#">Home</a> <a href="#">About</a>
    </nav>
  </header>
  <main>...</main>
  <footer>&copy; 2026 My Site</footer>
</body>`,
      tip: 'Common mistake: using <header> as a synonym for <head>. <head> holds metadata (title, meta tags) and is invisible; <header> is visible content inside <body>.',
    },
    {
      heading: '<section> vs <article>',
      content: "`<article>` is **self-contained** content that would still make sense if you copied it to another website: a blog post, a news story, a product card, a forum post, a comment.\n\n`<section>` is a **thematic group** of content inside a page, normally with its own heading: e.g. \"Features\", \"Pricing\", \"Testimonials\".\n\nQuick test: *Could I syndicate this alone in an RSS feed?* Yes → `<article>`. No, it is just a chapter of this page → `<section>`. Just need a box for styling → `<div>`.",
      points: [
        'A <section> should normally have a heading (h2–h6)',
        'An <article> can contain sections, and a section can contain articles (e.g. a "Latest posts" section with several articles)',
      ],
      tip: 'Do not use <section> as a generic wrapper just for CSS. If there is no meaningful heading, a <div> is usually the right choice.',
    },
    {
      heading: '<aside>',
      content: "`<aside>` holds content that is **tangentially related** to the content around it: a sidebar, a \"Did you know?\" box, related links, author bio, advertisements.\n\nAnalogy: in a textbook, the coloured box in the margin with an extra fact is an aside. You can skip it and the main text still makes sense.",
      syntax: `<article>
  <h2>Learning HTML</h2>
  <p>HTML is the skeleton of every web page...</p>
  <aside>
    <h3>Fun fact</h3>
    <p>The first website went live in 1991.</p>
  </aside>
</article>`,
    },
    {
      heading: 'Semantic page skeleton and landmarks',
      content: "A typical semantic layout:\n\n1. `<header>` with logo and `<nav>`\n2. `<main>` containing one or more `<section>` / `<article>` elements\n3. `<aside>` for sidebar content\n4. `<footer>` at the bottom\n\nBrowsers map these to accessibility **landmark roles** automatically: header → banner, nav → navigation, main → main, aside → complementary, footer → contentinfo. You do NOT need to add `role=\"main\"` yourself on a `<main>` element.",
      tip: 'Keep a logical heading order (h1 → h2 → h3) inside your semantic structure. Semantic tags plus good headings = a page that is easy to navigate with a screen reader.',
    },
  ],
  examples: [
    {
      title: 'Converting div soup into semantic HTML',
      scenario: 'A junior developer built a page using only <div class="..."> elements. Rewrite it using semantic tags.',
      steps: [
        'Create index.html',
        'Replace <div class="header"> with <header> and <div class="menu"> with <nav>',
        'Wrap the unique page content in <main>',
        'Replace the footer div with <footer>',
        'Click Run and compare: it looks the same, but the meaning is now in the markup',
      ],
      code: `<!-- Before -->
<div class="header"><div class="logo">ShopX</div>
  <div class="menu"><a href="#">Home</a> <a href="#">Shop</a></div>
</div>
<div class="content">...</div>
<div class="footer">© 2026 ShopX</div>

<!-- After -->
<header>
  <strong>ShopX</strong>
  <nav><a href="#">Home</a> <a href="#">Shop</a></nav>
</header>
<main>...</main>
<footer>&copy; 2026 ShopX</footer>`,
      playground: {
        html: `<header>
  <strong class="logo">ShopX</strong>
  <nav>
    <a href="#">Home</a>
    <a href="#">Shop</a>
    <a href="#">Contact</a>
  </nav>
</header>
<main>
  <h1>Welcome to ShopX</h1>
  <p>The best gadgets at the best prices.</p>
</main>
<footer>&copy; 2026 ShopX. All rights reserved.</footer>`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #0f766e; color: white; }
nav a { color: white; margin-left: 12px; text-decoration: none; }
main { padding: 20px; min-height: 120px; }
footer { padding: 12px 20px; background: #e2e8f0; font-size: 14px; }`,
        js: `const tags = [...document.body.children].map(el => el.tagName.toLowerCase());
console.log('Top-level landmarks:', tags.join(', '));`,
      },
      result: 'A teal header with logo and menu, main content, and a grey footer. The console prints: Top-level landmarks: header, main, footer.',
      explanation: 'Visually nothing changed, because semantic tags have no special styling. What changed is meaning: assistive technology now recognises a banner, navigation, main and contentinfo region, and the CSS uses tag selectors instead of extra classes.',
    },
    {
      title: 'Blog page with article, section and aside',
      scenario: 'Build a blog post page with a sidebar of related posts.',
      steps: [
        'Create blog.html',
        'Add a <main> containing an <article> with its own <header> and <footer>',
        'Split the article body into two <section>s with h2 headings',
        'Add an <aside> next to the article for related posts',
        'Click Run',
      ],
      code: `<main>
  <article>
    <header>
      <h1>10 Tips for Learning HTML</h1>
      <p>By Asha · <time datetime="2026-03-01">1 March 2026</time></p>
    </header>
    <section><h2>Start with structure</h2><p>...</p></section>
    <section><h2>Practise daily</h2><p>...</p></section>
    <footer>Tags: html, beginner</footer>
  </article>
  <aside>
    <h2>Related posts</h2>
    <ul><li><a href="#">CSS basics</a></li></ul>
  </aside>
</main>`,
      playground: {
        html: `<main class="layout">
  <article>
    <header>
      <h1>10 Tips for Learning HTML</h1>
      <p class="meta">By Asha &middot; <time datetime="2026-03-01">1 March 2026</time></p>
    </header>
    <section>
      <h2>Start with structure</h2>
      <p>Learn the document skeleton before worrying about colours.</p>
    </section>
    <section>
      <h2>Practise daily</h2>
      <p>Build one tiny page every day. Consistency beats intensity.</p>
    </section>
    <footer class="meta">Tags: html, beginner</footer>
  </article>
  <aside>
    <h2>Related posts</h2>
    <ul>
      <li><a href="#">CSS basics</a></li>
      <li><a href="#">Forms deep dive</a></li>
    </ul>
  </aside>
</main>`,
        css: `body { font-family: Georgia, serif; margin: 0; padding: 16px; }
.layout { display: grid; grid-template-columns: 1fr 200px; gap: 20px; }
@media (max-width: 500px) { .layout { grid-template-columns: 1fr; } }
article { border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
aside { background: #fef3c7; padding: 12px; border-radius: 8px; }
.meta { color: #666; font-size: 14px; }`,
      },
      result: 'A blog post card on the left with two sub-sections and tags, and a yellow sidebar of related posts on the right (stacked on narrow screens).',
      explanation: 'The post is an <article> because it is self-contained. Its parts are <section>s because each is a themed chapter with a heading. The related links are an <aside> because they are related but not essential. Note how the article has its own <header> and <footer> — that is allowed.',
    },
    {
      title: 'Product listing: a section full of articles',
      scenario: 'An e-commerce home page shows a "Best Sellers" section with three product cards.',
      steps: [
        'Create a <section> with an h2 "Best Sellers"',
        'Add three <article> product cards, each with an h3, price and button',
        'Run the JS snippet to count articles inside the section',
      ],
      code: `<section>
  <h2>Best Sellers</h2>
  <article><h3>Wireless Mouse</h3><p>₹799</p><button>Add to cart</button></article>
  ...
</section>`,
      playground: {
        html: `<section id="best">
  <h2>Best Sellers</h2>
  <div class="grid">
    <article><h3>Wireless Mouse</h3><p>&#8377;799</p><button>Add to cart</button></article>
    <article><h3>USB-C Hub</h3><p>&#8377;1,499</p><button>Add to cart</button></article>
    <article><h3>Laptop Stand</h3><p>&#8377;999</p><button>Add to cart</button></article>
  </div>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: flex; flex-wrap: wrap; gap: 12px; }
article { flex: 1 1 140px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
button { background: #2563eb; color: white; border: 0; padding: 6px 10px; border-radius: 4px; }`,
        js: `const count = document.querySelectorAll('#best article').length;
console.log('Products in Best Sellers:', count);`,
      },
      result: 'Three product cards under a "Best Sellers" heading. Console: Products in Best Sellers: 3.',
      explanation: 'Each product card is self-contained (it could appear in a search result or another page), so it is an <article>. The group of cards shares one theme, so it is a <section> with a heading. The inner <div class="grid"> is only for layout, so a div is correct there.',
    },
  ],
  interview: [
    { q: 'What is semantic HTML?', a: 'Using HTML elements that describe the meaning/role of their content (e.g. <nav>, <article>, <footer>) rather than only presentation. It improves accessibility, SEO and code readability.', level: 'Easy' },
    { q: 'What is the difference between <section> and <article>?', a: '<article> is self-contained, independently distributable content (blog post, product card, comment). <section> is a thematic grouping within a document, usually with a heading. If it makes sense on its own elsewhere, use article.', level: 'Medium' },
    { q: 'How many <main> elements can a page have?', a: 'Only one visible <main> per document. It must not be a descendant of <article>, <aside>, <footer>, <header> or <nav>.', level: 'Easy' },
    { q: 'Difference between <head> and <header>?', a: '<head> is a non-visible container for metadata (title, meta, links to CSS). <header> is a visible semantic element inside <body> holding introductory content such as logo, title or navigation.', level: 'Easy' },
    { q: 'Can you have multiple <header> and <footer> elements on one page?', a: 'Yes. Besides the page-level header/footer, each <article> or <section> can have its own header and footer.', level: 'Medium' },
    { q: 'When should you use <nav>?', a: 'For major blocks of navigation links: main menu, breadcrumbs, table of contents, pagination. Not for every small group of links (e.g. a couple of links in a footer may not need it).', level: 'Medium' },
    { q: 'What is <aside> used for?', a: 'Content tangentially related to the surrounding content: sidebars, pull quotes, related links, ads, author bios.', level: 'Easy' },
    { q: 'How does semantic HTML help accessibility?', a: 'Semantic elements map to ARIA landmark roles (banner, navigation, main, complementary, contentinfo). Screen reader users can jump between landmarks instead of listening to the whole page.', level: 'Medium' },
    { q: 'Do semantic elements have default styling different from <div>?', a: 'Mostly no. <header>, <section>, <article> etc. are display:block like a div. The difference is meaning, not appearance.', level: 'Easy' },
    { q: 'Should you write <main role="main">?', a: 'Not needed in modern browsers: <main> already has the implicit main role. Adding redundant roles is unnecessary (it was only a workaround for very old browsers).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a semantic skeleton for a personal portfolio: header with name and nav (Home, Projects, Contact), main with an "About" section and a "Projects" section, and a footer.',
      hint: 'Each section needs an h2. Only one <main>.',
      solution: `<header>
  <h1>Ravi Kumar</h1>
  <nav><a href="#about">Home</a> <a href="#projects">Projects</a> <a href="#contact">Contact</a></nav>
</header>
<main>
  <section id="about"><h2>About Me</h2><p>Front-end learner from Pune.</p></section>
  <section id="projects"><h2>Projects</h2><p>Coming soon.</p></section>
</main>
<footer id="contact">&copy; 2026 Ravi Kumar · ravi@example.com</footer>`,
    },
    {
      task: 'Create a news page with two news stories as <article>s, each with its own header (headline + date) and footer (author).',
      hint: 'Use <time datetime="YYYY-MM-DD"> for the date.',
      solution: `<main>
  <article>
    <header><h2>City Metro Opens</h2><time datetime="2026-05-01">1 May 2026</time></header>
    <p>The new metro line opened today...</p>
    <footer>Reported by Neha</footer>
  </article>
  <article>
    <header><h2>Rain Expected</h2><time datetime="2026-05-02">2 May 2026</time></header>
    <p>Heavy rain is forecast for the weekend...</p>
    <footer>Reported by Arjun</footer>
  </article>
</main>`,
    },
    {
      task: 'Add an <aside> to a recipe article showing "Chef tip: use fresh tomatoes".',
      hint: 'The aside can live inside the article because it relates to it.',
      solution: `<article>
  <h1>Tomato Soup</h1>
  <p>Boil tomatoes, blend, season and serve.</p>
  <aside><h2>Chef tip</h2><p>Use fresh, ripe tomatoes for the best flavour.</p></aside>
</article>`,
    },
    {
      task: 'Rewrite: <div id="top"><div id="menu">links</div></div><div id="content">text</div><div id="bottom">copyright</div> semantically.',
      hint: 'top → header, menu → nav, content → main, bottom → footer.',
      solution: `<header>
  <nav><a href="#">Home</a> <a href="#">Blog</a></nav>
</header>
<main><p>text</p></main>
<footer>&copy; 2026</footer>`,
    },
  ],
  quiz: [
    { question: 'Which element should hold the main, unique content of a page?', options: ['<section>', '<main>', '<body>', '<article>'], answer: 1, explanation: '<main> represents the dominant content of the document and should appear once.' },
    { question: 'A blog comment that could be shown on its own is best marked up as:', options: ['<aside>', '<section>', '<div>', '<article>'], answer: 3, explanation: 'Self-contained, independently meaningful content is an <article>.' },
    { question: 'Which element is for a sidebar of related links?', options: ['<aside>', '<nav>', '<footer>', '<main>'], answer: 0, explanation: '<aside> holds tangentially related content like sidebars.' },
    { question: 'What does <header> contain?', options: ['Meta tags and the page title', 'Only <h1>', 'Introductory content such as logo, heading or navigation', 'Scripts'], answer: 2, explanation: 'Metadata goes in <head>; <header> is visible introductory content.' },
    { question: 'Which statement is TRUE?', options: ['Semantic tags make text bold', 'A page may contain many visible <main> elements', '<section> should usually have a heading', '<nav> must wrap every link'], answer: 2, explanation: 'A section is a thematic grouping and normally has a heading.' },
  ],
};
