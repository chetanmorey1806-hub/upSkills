export default {
  id: 'day-25-html-meta-tags-seo',
  title: 'HTML Meta Tags: Charset, Viewport, Description, Keywords, SEO Basics',
  module: 'Module 5: HTML5 Advanced Topics',
  day: 25,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "Meta tags live in the <head> and give browsers and search engines information about your page that users do not see directly: character encoding, mobile behaviour, a description for search results, and indexing rules. Together with good HTML structure, they form the basics of on-page SEO.",
  objectives: [
    'Write the essential meta tags: charset, viewport, description',
    'Explain why the keywords meta tag is ignored by Google',
    'Use robots, author and theme-color meta tags',
    'Apply on-page SEO basics: title, headings, alt text, semantic HTML, links',
  ],
  theory: [
    {
      heading: 'What are meta tags?',
      content: "`<meta>` elements provide **metadata**: data about the page. They are void elements (no closing tag) placed inside `<head>`. Most use the pattern `name=\"...\" content=\"...\"`.\n\nAnalogy: if your web page is a book, meta tags are the **information on the back cover and copyright page**: language, publisher, summary. Readers do not see it inside the story, but bookshops (search engines) use it to categorise the book.",
      syntax: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn HTML in 30 days with free lessons.">
  <title>Learn HTML | DayWise</title>
</head>`,
    },
    {
      heading: 'charset',
      content: "`<meta charset=\"UTF-8\">` tells the browser how to convert the bytes of your file into characters. **UTF-8** supports every language and emoji (हिंदी, 中文, 😀).\n\nRules: it must be within the **first 1024 bytes**, so put it as the very first element in `<head>`. Without it you risk garbled text like `Ã©`.",
    },
    {
      heading: 'viewport (mobile friendliness)',
      content: "Without a viewport tag, mobile browsers pretend the screen is about **980px wide** and zoom out, so your page looks tiny. The viewport tag tells them to use the real device width.\n\n`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`\n\n- `width=device-width`: layout width = screen width\n- `initial-scale=1.0`: no zoom on load\n\nIt is required for responsive design (media queries) and Google uses mobile-friendliness for ranking.",
      tip: 'Avoid user-scalable=no or maximum-scale=1: they stop users with poor eyesight from zooming, which is an accessibility failure.',
    },
    {
      heading: 'description, keywords, author, robots, theme-color',
      content: "- `description`: a 1–2 sentence summary (about **150–160 characters**). Google often shows it as the grey snippet under your title in search results, so it affects click-through rate.\n- `keywords`: a comma-separated list of keywords. **Google ignores it** since 2009 because it was spammed. Harmless, but do not rely on it.\n- `author`: page author name.\n- `robots`: instructions to crawlers, e.g. `index, follow` (default), `noindex` (do not show in results), `nofollow` (do not follow links).\n- `theme-color`: colour of the mobile browser address bar.\n- `http-equiv=\"refresh\"`: reloads/redirects (avoid for redirects; use server redirects).",
      syntax: `<meta name="description" content="Fresh vegetables delivered in 30 minutes in Pune.">
<meta name="keywords" content="vegetables, delivery, Pune">
<meta name="author" content="Asha Patil">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0f766e">`,
    },
    {
      heading: 'SEO basics: what really matters in HTML',
      content: "**SEO** (Search Engine Optimisation) means making pages easy for search engines to understand and rank. HTML-level checklist:\n\n1. Unique, descriptive `<title>` (about 50–60 characters, main keyword first)\n2. Helpful meta description\n3. **One `<h1>`** describing the page, then logical h2/h3\n4. Semantic HTML (`<main>`, `<article>`, `<nav>`)\n5. Descriptive `alt` text on images\n6. Meaningful link text (\"Download the syllabus\", not \"click here\")\n7. `<html lang=\"en\">`, mobile viewport, fast loading (lazy images)\n8. Clean, readable URLs (`/html-course/day-25`)\n\nMost of all: original, useful content. Meta tags help, but content quality ranks pages.",
      tip: 'Coming later (Extras): Open Graph tags for social sharing previews, canonical URLs and structured data (JSON-LD).',
    },
  ],
  examples: [
    {
      title: 'Complete SEO-ready <head>',
      scenario: 'Write the head of a bakery homepage with all essential meta tags.',
      steps: [
        'Create index.html with <!DOCTYPE html> and <html lang="en">',
        'Add charset first, then viewport, title, description, author, theme-color',
        'Add a body with one h1',
        'Click Run; the JS prints all meta tags found',
      ],
      code: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sweet Crumbs Bakery | Fresh Cakes in Pune</title>
  <meta name="description" content="Order fresh, eggless cakes and cookies in Pune. Same-day delivery and custom birthday cakes.">
  <meta name="author" content="Sweet Crumbs">
  <meta name="theme-color" content="#be185d">
</head>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sweet Crumbs Bakery | Fresh Cakes in Pune</title>
  <meta name="description" content="Order fresh, eggless cakes and cookies in Pune. Same-day delivery and custom birthday cakes.">
  <meta name="author" content="Sweet Crumbs">
  <meta name="theme-color" content="#be185d">
</head>
<body>
  <h1>Sweet Crumbs Bakery</h1>
  <p>Fresh cakes baked every morning.</p>
</body>
</html>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
h1 { color: #be185d; }`,
        js: `console.log('Title:', document.title);
document.querySelectorAll('meta').forEach(m => {
  const key = m.getAttribute('charset') ? 'charset' : m.name;
  console.log(key, '=>', m.getAttribute('charset') || m.content);
});`,
      },
      result: 'The page shows the bakery heading. The console lists the title and each meta tag (charset => UTF-8, viewport, description, author, theme-color). Some playgrounds merge or add their own head tags, so you may see extras.',
      explanation: 'Meta tags are invisible on the page but readable by browsers, crawlers and scripts via the DOM.',
    },
    {
      title: 'Search result snippet preview',
      scenario: 'Preview how Google might display your title and description, with length warnings.',
      steps: [
        'Create inputs for title and description',
        'Show a fake search result card that updates as you type',
        'Warn when title > 60 or description > 160 characters',
        'Click Run and type',
      ],
      code: `title.length > 60  → may be cut off with "..."
description.length > 160 → may be truncated`,
      playground: {
        html: `<label>Title <input id="t" value="Learn HTML in 30 Days | Free Course"></label>
<label>Description <textarea id="d" rows="3">Free day-wise HTML course for beginners with examples, practice tasks, quizzes and interview questions.</textarea></label>
<div class="serp">
  <div class="url">https://example.com &rsaquo; html-course</div>
  <div class="title" id="pt"></div>
  <div class="desc" id="pd"></div>
</div>
<p id="warn"></p>`,
        css: `body { font-family: arial, sans-serif; padding: 12px; }
label { display: block; margin-bottom: 8px; }
input, textarea { width: 100%; max-width: 480px; display: block; padding: 6px; }
.serp { max-width: 600px; margin-top: 12px; }
.url { font-size: 13px; color: #202124; }
.title { font-size: 20px; color: #1a0dab; }
.desc { font-size: 14px; color: #4d5156; }
#warn { color: #b45309; }`,
        js: `const t = document.getElementById('t'), d = document.getElementById('d');
function cut(s, n) { return s.length > n ? s.slice(0, n - 3) + '...' : s; }
function update() {
  document.getElementById('pt').textContent = cut(t.value, 60);
  document.getElementById('pd').textContent = cut(d.value, 160);
  const w = [];
  if (t.value.length > 60) w.push('Title is ' + t.value.length + ' chars (aim for 50-60)');
  if (d.value.length > 160) w.push('Description is ' + d.value.length + ' chars (aim for 150-160)');
  document.getElementById('warn').textContent = w.join(' | ');
}
t.oninput = d.oninput = update;
update();
console.log('Title length:', t.value.length, '| Description length:', d.value.length);`,
      },
      result: 'A Google-like result with a blue title and grey description that updates while typing. Long text is cut with "..." and an orange warning appears.',
      explanation: 'Search engines truncate long titles and descriptions. Keeping them within the recommended lengths makes your result readable and more clickable. (Exact limits are in pixels, so these numbers are guidelines.)',
    },
    {
      title: 'SEO audit of a page with JavaScript',
      scenario: 'Check a page for common on-page SEO problems.',
      steps: [
        'Create a page with a missing alt, two h1s and a "click here" link',
        'Write JS that checks h1 count, images without alt, vague link text and missing lang',
        'Click Run and read the report in the console',
      ],
      code: `document.querySelectorAll('h1').length !== 1  // problem
document.querySelectorAll('img:not([alt])')   // problem
links with text "click here"                  // problem`,
      playground: {
        html: `<h1>Garden Tools</h1>
<h1>Best Shovels</h1>
<img src="https://picsum.photos/id/152/200/120" width="200" height="120">
<p>To see our catalogue <a href="#">click here</a>.</p>
<p><a href="#">Download the 2026 price list</a></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `const issues = [];
const h1s = document.querySelectorAll('h1').length;
if (h1s !== 1) issues.push('Page has ' + h1s + ' <h1> elements (use exactly one)');
document.querySelectorAll('img:not([alt])').forEach(img => issues.push('Image missing alt: ' + img.src));
document.querySelectorAll('a').forEach(a => {
  if (/^(click here|here|read more)$/i.test(a.textContent.trim())) issues.push('Vague link text: "' + a.textContent.trim() + '"');
});
if (!document.documentElement.lang) issues.push('<html> has no lang attribute');
if (!document.querySelector('meta[name="description"]')) issues.push('No meta description');
console.log('SEO issues found:', issues.length);
issues.forEach((i, n) => console.log((n + 1) + '. ' + i));`,
      },
      result: 'The console prints a numbered list: two h1 elements, image missing alt, vague link text "click here", and possibly missing lang/meta description (depending on the playground wrapper).',
      explanation: 'These checks mirror what tools like Lighthouse report. Fix: one h1, descriptive alt, descriptive link text, lang on <html>, and a meta description.',
    },
  ],
  interview: [
    { q: 'What are meta tags?', a: 'Void elements in <head> that provide metadata about the page (encoding, viewport, description, robots rules) for browsers and search engines.', level: 'Easy' },
    { q: 'Why is <meta charset="UTF-8"> important and where should it go?', a: 'It defines the character encoding so text displays correctly in any language. It must be within the first 1024 bytes, ideally the first element in <head>.', level: 'Easy' },
    { q: 'What does the viewport meta tag do?', a: 'Tells mobile browsers to set the layout width to the device width and initial zoom to 1, which is necessary for responsive design.', level: 'Easy' },
    { q: 'Does the meta keywords tag help SEO?', a: 'No. Google and Bing ignore it for ranking because it was abused for keyword stuffing.', level: 'Medium' },
    { q: 'Does meta description affect rankings?', a: 'Not directly, but it is often shown as the search snippet and influences click-through rate. Google may rewrite it.', level: 'Medium' },
    { q: 'How do you stop a page from appearing in search results?', a: '<meta name="robots" content="noindex"> (and the page must remain crawlable so the bot can see the tag). Or the X-Robots-Tag HTTP header.', level: 'Medium' },
    { q: 'Difference between <title> and meta description?', a: '<title> appears in the browser tab and as the clickable search headline and is a ranking signal. The meta description is the summary snippet under it.', level: 'Easy' },
    { q: 'Name some HTML practices that improve SEO.', a: 'Unique title, meta description, one h1 with logical heading hierarchy, semantic elements, descriptive alt text, descriptive link text, lang attribute, mobile viewport, fast loading, clean URLs.', level: 'Medium' },
    { q: 'Why should you avoid user-scalable=no?', a: 'It prevents pinch-zoom, failing accessibility for low-vision users (WCAG 1.4.4).', level: 'Hard' },
    { q: 'What is http-equiv in a meta tag?', a: 'Simulates an HTTP response header, e.g. http-equiv="refresh" content="5;url=..." or older http-equiv="X-UA-Compatible". Real headers from the server are preferred.', level: 'Hard' },
  ],
  practice: [
    { task: 'Write a full <head> for "Ravi Fitness Studio" in Mumbai with charset, viewport, title, description and author.', hint: 'Title ~55 chars, description ~150 chars.', solution: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ravi Fitness Studio | Gym & Yoga Classes in Mumbai</title>
  <meta name="description" content="Join Ravi Fitness Studio in Andheri, Mumbai for gym training, yoga and Zumba classes. First trial session free. Open 6 AM to 10 PM.">
  <meta name="author" content="Ravi Fitness Studio">
</head>` },
    { task: 'Add meta tags so a private admin page is not indexed and its links are not followed.', hint: 'robots.', solution: `<meta name="robots" content="noindex, nofollow">` },
    { task: 'Fix this SEO-unfriendly markup: <title>Home</title> ... <img src="dog.jpg"> <a href="/adopt">click here</a>', hint: 'Better title, alt and link text.', solution: `<title>Adopt a Dog in Delhi | Happy Paws Shelter</title>
<img src="dog.jpg" alt="Brown Labrador puppy waiting for adoption">
<a href="/adopt">See dogs available for adoption</a>` },
    { task: 'Set the mobile address bar colour to dark blue and add a description for a blog page.', hint: 'theme-color.', solution: `<meta name="theme-color" content="#1e3a8a">
<meta name="description" content="Weekly tips on HTML, CSS and JavaScript for beginners.">` },
  ],
  quiz: [
    { question: 'Which meta tag makes a page display correctly on mobile?', options: ['<meta name="mobile">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta charset="mobile">', '<meta name="responsive">'], answer: 1, explanation: 'The viewport tag sets the layout width to the device width.' },
    { question: 'Which meta tag does Google ignore for ranking?', options: ['keywords', 'robots', 'viewport', 'charset'], answer: 0, explanation: 'Keywords meta has been ignored since 2009.' },
    { question: 'Recommended meta description length is about:', options: ['10–20 characters', '500 characters', '150–160 characters', 'Unlimited'], answer: 2, explanation: 'Longer descriptions are truncated in search results.' },
    { question: 'Where must <meta charset> appear?', options: ['At the end of body', 'Anywhere', 'Inside <title>', 'Within the first 1024 bytes of the document'], answer: 3, explanation: 'Browsers must find it early to decode the page.' },
    { question: '<meta name="robots" content="noindex"> means:', options: ['Do not show this page in search results', 'Block all robots from the site', 'Speed up indexing', 'Hide images'], answer: 0, explanation: 'noindex asks search engines not to include the page in results.' },
  ],
};
