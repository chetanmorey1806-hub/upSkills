export default {
  id: 'day-21-html5-introduction',
  title: 'HTML5 Introduction, New HTML5 Features, New Semantic Elements',
  module: 'Module 5: HTML5 Advanced Topics',
  day: 21,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "HTML5 is the modern, living standard of HTML. It simplified the doctype, added semantic elements, native media, new form controls, graphics (canvas/SVG) and many JavaScript APIs. Today is the big-picture tour, plus the newer semantic elements beyond page landmarks: <figure>, <figcaption>, <time>, <mark>, <details>, <summary> and <address>.",
  objectives: [
    'Explain what HTML5 is and how it differs from HTML 4.01/XHTML',
    'List the major HTML5 feature groups (semantics, media, forms, graphics, APIs)',
    'Use newer semantic elements: <figure>, <figcaption>, <time>, <mark>, <details>/<summary>, <address>',
    'Identify obsolete HTML4 elements and their modern replacements',
  ],
  theory: [
    {
      heading: 'What is HTML5?',
      content: "**HTML5** is the fifth major version of HTML, published as a W3C Recommendation in 2014. Today HTML is maintained by **WHATWG** as the **HTML Living Standard**: it is updated continuously, so people still say \"HTML5\" to mean modern HTML.\n\nGoals of HTML5:\n- reduce the need for plugins (Flash, Java applets)\n- describe content with meaningful elements\n- work consistently across devices, especially mobile\n- define exactly how browsers must handle errors\n\nAnalogy: HTML4 was an old phone that needed extra gadgets for camera and music. HTML5 is a smartphone with them built in.",
    },
    {
      heading: 'Simpler syntax',
      content: "HTML5 made the boilerplate much shorter:",
      syntax: `<!-- HTML 4.01 -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<!-- HTML5 -->
<!DOCTYPE html>
<meta charset="UTF-8">`,
      points: [
        'type="text/javascript" and type="text/css" are optional now',
        'Attribute quotes and closing slashes on void elements (<br/>) are optional, but be consistent',
      ],
    },
    {
      heading: 'Major HTML5 feature groups',
      content: "1. **Semantic elements**: header, nav, main, section, article, aside, footer, figure, time, mark… (Day 16 and today)\n2. **Multimedia**: native `<audio>` and `<video>` (Day 19)\n3. **Forms**: new input types (email, date, range, color…) and validation attributes (required, pattern) (Module 3), datalist (Day 22)\n4. **Graphics**: `<canvas>` (Day 23) and inline `<svg>` (Day 24)\n5. **JavaScript APIs**: Local Storage, Geolocation, Drag and Drop, History API, Web Workers, WebSockets, Fetch…\n6. **Data attributes**: `data-*` for custom data\n7. **Accessibility**: built-in landmark roles and ARIA support",
    },
    {
      heading: 'New semantic elements: figure, figcaption, time, mark, address',
      content: "- `<figure>` + `<figcaption>`: self-contained illustration (image, chart, code) with its caption.\n- `<time datetime=\"2026-08-15\">`: a date/time in a machine-readable format, useful for search engines and calendars.\n- `<mark>`: text highlighted for relevance (like a search result highlight).\n- `<address>`: contact information for the nearest article or the page.",
      syntax: `<figure>
  <img src="chart.png" alt="Sales grew 40% in 2026">
  <figcaption>Figure 1: Yearly sales</figcaption>
</figure>
<p>Launched on <time datetime="2026-08-15">15 August</time>.</p>`,
    },
    {
      heading: '<details> and <summary>: native accordion',
      content: "`<details>` creates a disclosure widget that opens and closes **without any JavaScript**. `<summary>` is the always-visible clickable label. Add the `open` attribute to start expanded. Perfect for FAQs.",
      syntax: `<details>
  <summary>What is HTML5?</summary>
  <p>The latest version of HTML.</p>
</details>`,
    },
    {
      heading: 'Obsolete elements and replacements',
      content: "HTML5 removed presentational elements because styling belongs in CSS:\n- `<font>`, `<center>`, `<big>`, `<strike>` → CSS (font-family, text-align, font-size, text-decoration)\n- `<frame>`, `<frameset>` → `<iframe>` or CSS layouts\n- `<acronym>` → `<abbr>`\n- `<applet>` → `<object>` / modern JS\n- `<marquee>`, `<blink>` → CSS animations (or better, nothing)\n\nBrowsers may still render some of these for backward compatibility, but they are invalid in HTML5.",
      tip: 'Validate your pages at validator.w3.org to catch obsolete tags.',
    },
  ],
  examples: [
    {
      title: 'Minimal valid HTML5 document',
      scenario: 'Write the shortest correct modern HTML boilerplate.',
      steps: [
        'Create index.html',
        'Add <!DOCTYPE html>, <html lang="en">, <head> with charset, viewport and title',
        'Add a body with a heading',
        'Click Run',
      ],
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Page</title>
</head>
<body>
  <h1>Hello HTML5</h1>
</body>
</html>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Page</title>
</head>
<body>
  <h1>Hello HTML5</h1>
  <p>Rendering mode: <strong id="mode"></strong></p>
</body>
</html>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `document.getElementById('mode').textContent = document.compatMode;
console.log('compatMode:', document.compatMode, '(CSS1Compat = standards mode)');`,
      },
      result: 'A heading "Hello HTML5" and "Rendering mode: CSS1Compat" (standards mode).',
      explanation: 'The short <!DOCTYPE html> switches the browser into standards mode (CSS1Compat). Without it, browsers fall back to "quirks mode" (BackCompat) which emulates old buggy behaviour.',
    },
    {
      title: 'Figure, figcaption, time and mark in a news article',
      scenario: 'Write a short news article using HTML5 semantic text elements.',
      steps: [
        'Create an <article> with a heading',
        'Add a <time datetime> for the publish date',
        'Add an image inside <figure> with a <figcaption>',
        'Highlight a key phrase with <mark>, add author <address>',
        'Click Run',
      ],
      code: `<article>
  <h2>New Park Opens</h2>
  <p>Published <time datetime="2026-06-05">5 June 2026</time></p>
  <figure>
    <img src="https://picsum.photos/id/1018/400/200" alt="Green park with mountains">
    <figcaption>The park covers 20 acres.</figcaption>
  </figure>
  <p>Entry is <mark>free for children</mark>.</p>
  <address>Written by <a href="mailto:news@example.com">City News</a></address>
</article>`,
      playground: {
        html: `<article>
  <h2>New Park Opens</h2>
  <p>Published <time datetime="2026-06-05">5 June 2026</time></p>
  <figure>
    <img src="https://picsum.photos/id/1018/400/200" alt="Green park with mountains in the background" width="400" height="200">
    <figcaption>The new park covers 20 acres.</figcaption>
  </figure>
  <p>Entry is <mark>free for children under 12</mark> on weekdays.</p>
  <address>Written by <a href="mailto:news@example.com">City News Desk</a></address>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
img { max-width: 100%; height: auto; border-radius: 8px; }
figure { margin: 0; }
figcaption { font-size: 14px; color: #64748b; }`,
        js: `const t = document.querySelector('time');
console.log('Machine-readable date:', t.dateTime, '| Human text:', t.textContent);`,
      },
      result: 'A news article with a photo and grey caption, a yellow-highlighted phrase and an italic address line. Console shows the machine date 2026-06-05.',
      explanation: 'figure groups the image and caption. time gives computers an exact date while humans read a friendly one. mark highlights; address gives contact info for the article.',
    },
    {
      title: 'FAQ accordion with <details> and <summary>',
      scenario: 'Create an FAQ that expands and collapses with zero JavaScript.',
      steps: [
        'Create a <section> with an h2 "FAQ"',
        'Add three <details> elements each with a <summary> question',
        'Add open to the first one',
        'Click Run and click the questions',
      ],
      code: `<details open>
  <summary>Is HTML5 free?</summary>
  <p>Yes, it is an open standard.</p>
</details>`,
      playground: {
        html: `<section>
  <h2>FAQ</h2>
  <details open>
    <summary>Is HTML5 free to use?</summary>
    <p>Yes. It is an open standard maintained by WHATWG.</p>
  </details>
  <details>
    <summary>Do I need Flash for video?</summary>
    <p>No. Use the native &lt;video&gt; element.</p>
  </details>
  <details>
    <summary>Does this accordion need JavaScript?</summary>
    <p>No. &lt;details&gt; and &lt;summary&gt; work natively.</p>
  </details>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
details { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
summary { cursor: pointer; font-weight: 600; }
details[open] summary { color: #0f766e; }`,
        js: `document.querySelectorAll('details').forEach(d =>
  d.addEventListener('toggle', () => console.log(d.querySelector('summary').textContent, '→', d.open ? 'opened' : 'closed')));`,
      },
      result: 'Three FAQ items; the first is open. Clicking a question toggles its answer, and the console logs opened/closed.',
      explanation: 'The browser handles the open/close state, keyboard access (Enter/Space) and accessibility. The open attribute reflects the current state, which CSS can style with details[open].',
    },
    {
      title: 'Replacing obsolete tags with HTML5 + CSS',
      scenario: 'Modernise legacy markup using <center> and <font>.',
      steps: [
        'Look at the old markup',
        'Replace <center> with CSS text-align',
        'Replace <font color> with a class',
        'Click Run',
      ],
      code: `<!-- Old (obsolete) -->
<center><font color="red" size="5">Sale!</font></center>

<!-- HTML5 -->
<p class="sale">Sale!</p>
<style>.sale { text-align: center; color: red; font-size: 1.5rem; }</style>`,
      playground: {
        html: `<p class="sale">Sale!</p>
<p class="note"><abbr title="HyperText Markup Language">HTML</abbr> uses CSS for presentation.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.sale { text-align: center; color: red; font-size: 1.5rem; font-weight: bold; }
.note { text-align: center; }`,
      },
      result: 'A centred red "Sale!" and a note where hovering HTML shows its full form.',
      explanation: 'Structure stays in HTML, presentation moves to CSS. <abbr> replaces the removed <acronym>.',
    },
  ],
  interview: [
    { q: 'What is HTML5?', a: 'The latest major version of HTML (now the WHATWG Living Standard) that added semantic elements, native audio/video, new form controls, canvas/SVG support and many JS APIs while simplifying syntax.', level: 'Easy' },
    { q: 'What is the HTML5 doctype and why is it needed?', a: '<!DOCTYPE html>. It tells the browser to render in standards mode; without it the browser uses quirks mode.', level: 'Easy' },
    { q: 'List some new features introduced in HTML5.', a: 'Semantic tags (header, nav, article…), audio/video, canvas, SVG inline, new input types, form validation, localStorage/sessionStorage, Geolocation, Drag and Drop, Web Workers, data-* attributes.', level: 'Easy' },
    { q: 'What is the difference between HTML and HTML5?', a: 'HTML5 has a simple doctype, semantic elements, native multimedia, graphics, new form types and APIs, defined error handling, and no need for plugins like Flash. Older HTML relied on plugins and presentational tags.', level: 'Medium' },
    { q: 'What are <figure> and <figcaption>?', a: '<figure> wraps self-contained content like an image, diagram or code listing; <figcaption> provides its caption.', level: 'Easy' },
    { q: 'What is the purpose of the <time> element?', a: 'Represents a date/time; the datetime attribute gives a machine-readable value used by search engines, calendars and scripts.', level: 'Medium' },
    { q: 'How do you create an accordion without JavaScript?', a: 'Use <details> with a <summary> child. The open attribute controls the expanded state.', level: 'Medium' },
    { q: 'Which tags were removed in HTML5?', a: '<font>, <center>, <big>, <strike>, <frame>, <frameset>, <acronym>, <applet>, <tt>, <basefont>, <dir> among others.', level: 'Medium' },
    { q: 'What is the WHATWG Living Standard?', a: 'The continuously updated HTML specification maintained by browser vendors (WHATWG). Since 2019 W3C and WHATWG agreed it is the single authoritative HTML spec.', level: 'Hard' },
    { q: 'What is quirks mode?', a: 'A rendering mode that mimics old non-standard browser behaviour, triggered by a missing or outdated doctype. document.compatMode returns BackCompat in quirks mode and CSS1Compat in standards mode.', level: 'Hard' },
  ],
  practice: [
    { task: 'Write a complete HTML5 boilerplate with lang, charset, viewport and title "My Portfolio".', hint: 'Start with <!DOCTYPE html>.', solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
</head>
<body></body>
</html>` },
    { task: 'Display a code snippet inside a <figure> with a <figcaption> "Listing 1: Hello world".', hint: 'Use <pre><code>.', solution: `<figure>
  <pre><code>console.log('Hello world');</code></pre>
  <figcaption>Listing 1: Hello world</figcaption>
</figure>` },
    { task: 'Create an event announcement with a <time> including both date and time (10 AM, 20 Jan 2027).', hint: 'datetime="2027-01-20T10:00".', solution: `<p>Workshop starts <time datetime="2027-01-20T10:00">20 Jan 2027, 10 AM</time>.</p>` },
    { task: 'Build a 3-question FAQ using details/summary where only the second starts open.', hint: 'Put open on the second <details>.', solution: `<details><summary>Q1</summary><p>A1</p></details>
<details open><summary>Q2</summary><p>A2</p></details>
<details><summary>Q3</summary><p>A3</p></details>` },
  ],
  quiz: [
    { question: 'Which is the correct HTML5 doctype?', options: ['<!DOCTYPE HTML5>', '<!DOCTYPE html>', '<doctype html5>', '<!HTML>'], answer: 1, explanation: 'HTML5 uses the short <!DOCTYPE html>.' },
    { question: 'Which element provides a caption for a <figure>?', options: ['<caption>', '<legend>', '<label>', '<figcaption>'], answer: 3, explanation: '<caption> is for tables; <figcaption> is for figures.' },
    { question: 'Which tag is obsolete in HTML5?', options: ['<center>', '<mark>', '<time>', '<aside>'], answer: 0, explanation: '<center> was removed; use CSS text-align.' },
    { question: 'The clickable heading of a <details> element is:', options: ['<legend>', '<title>', '<summary>', '<header>'], answer: 2, explanation: '<summary> is the visible toggle label.' },
    { question: 'Which is NOT an HTML5 feature?', options: ['Native video', 'Canvas', 'Local Storage', 'Required Flash plugin for audio'], answer: 3, explanation: 'HTML5 removed the need for Flash.' },
  ],
};
