export default {
  id: "day-01-introduction-to-css",
  title: "Introduction to CSS: How CSS Works, Inline, Internal & External CSS",
  module: "Module 1: CSS Basics",
  day: 1,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Learn what CSS is, how the browser combines HTML and CSS to paint a page, and the three ways to add CSS to a document: inline, internal and external.",
  objectives: [
    "Explain what CSS is and why we separate content (HTML) from presentation (CSS)",
    "Describe how the browser parses HTML and CSS and renders the page",
    "Add styles using inline, internal (<style>) and external (<link>) CSS",
    "Choose the right method for real projects and know which one wins when they conflict",
  ],
  theory: [
    {
      heading: "What is CSS?",
      content: "CSS stands for **Cascading Style Sheets**. HTML gives a page its structure and meaning (headings, paragraphs, images). CSS controls how that structure **looks**: colors, fonts, spacing, layout, animations and responsiveness.\n\nAnalogy: if a web page is a house, HTML is the bricks and rooms, CSS is the paint, furniture and interior design, and JavaScript is the electricity that makes things move.\n\nWhy separate them?\n- One CSS file can style hundreds of pages, so a redesign means editing one file\n- HTML stays clean and readable\n- Pages load faster because the browser caches the CSS file\n- Different style sheets can be used for screen, print or dark mode",
      points: [
        "CSS was proposed by Håkon Wium Lie in 1994; CSS1 became a W3C recommendation in 1996",
        "Today CSS is developed as separate modules (Flexbox, Grid, Colors...) instead of one big version",
        "'Cascading' means several rules can apply to one element and the browser decides which wins",
      ],
    },
    {
      heading: "How CSS Works in the Browser",
      content: "When you open a page, the browser does roughly this:\n\n1. Downloads the HTML and builds the **DOM** (a tree of elements)\n2. Finds CSS (inline, <style>, <link>) and builds the **CSSOM** (a tree of style rules)\n3. Combines DOM + CSSOM into the **render tree** (only visible elements, with their final computed styles)\n4. **Layout**: calculates the size and position of every box\n5. **Paint**: draws pixels on the screen\n\nBecause CSS blocks rendering until it is loaded, the browser waits for <link> stylesheets in the <head> before painting. That is why stylesheets belong in the <head>.",
      tip: "Put <link rel=\"stylesheet\"> in the <head>, not at the end of <body>. Otherwise users may briefly see an unstyled page (a 'flash of unstyled content').",
    },
    {
      heading: "Inline CSS",
      content: "Inline CSS is written directly on an element using the `style` attribute. It affects only that one element.\n\nUse it rarely: for quick tests, HTML emails, or values set by JavaScript. It mixes content with design, cannot be reused, and is very hard to override from a stylesheet.",
      syntax: `<p style="color: crimson; font-size: 20px;">Inline styled paragraph</p>`,
      tip: "Common mistake: forgetting the semicolon between declarations, e.g. style=\"color: red font-size: 20px\". The whole value becomes invalid.",
    },
    {
      heading: "Internal CSS",
      content: "Internal (embedded) CSS lives inside a <style> element in the <head> of a single HTML page. It can use selectors, so one rule can style many elements on that page.\n\nGood for: single-page demos, prototypes, or page-specific styles. Not ideal for multi-page websites because each page would need its own copy.",
      syntax: `<head>
  <style>
    h1 { color: navy; }
    p  { line-height: 1.6; }
  </style>
</head>`,
    },
    {
      heading: "External CSS",
      content: "External CSS is written in a separate `.css` file and linked with the <link> element. This is the **professional standard**.\n\nBenefits:\n- One file styles the whole website\n- Browser caches it, so later pages load faster\n- Clean separation of concerns: designers and developers can work on different files",
      syntax: `<!-- index.html -->
<head>
  <link rel="stylesheet" href="css/styles.css">
</head>

/* css/styles.css */
body { font-family: system-ui, sans-serif; }`,
      tip: "The path in href is relative to the HTML file. A wrong path is the #1 reason 'my CSS is not working'. Check the Network tab in DevTools for a 404.",
    },
    {
      heading: "Which One Wins? (Order of Priority)",
      content: "If the same property is set in several places for the same element:\n\n1. **Inline** style usually wins (it has the highest specificity)\n2. Between internal and external CSS, the rule that comes **later** in the document wins when selectors are equally specific\n\nSo if your <link> comes after your <style>, the external file wins for equal selectors. We will study the full rules (specificity, cascade, !important) on Day 15.",
      points: [
        "Inline > internal/external (for normal declarations)",
        "Same specificity → last one written wins",
        "Coming next: CSS syntax and basic selectors (Day 2)",
      ],
    },
  ],
  examples: [
    {
      title: "Inline CSS on a Single Element",
      scenario: "You want to quickly highlight one warning message without touching any stylesheet.",
      steps: [
        "Create index.html with two paragraphs",
        "Add a style attribute to the second paragraph",
        "Click Run and compare the two paragraphs",
      ],
      code: `<p>Normal paragraph with default browser styles.</p>
<p style="color: #b91c1c; background: #fee2e2; padding: 12px; border-left: 4px solid #b91c1c;">
  Warning: your session expires in 5 minutes.
</p>`,
      playground: {
        html: `<p>Normal paragraph with default browser styles.</p>
<p style="color: #b91c1c; background: #fee2e2; padding: 12px; border-left: 4px solid #b91c1c;">
  Warning: your session expires in 5 minutes.
</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }`,
      },
      result: "The first paragraph looks plain. The second has red text, a light red background, padding and a thick red left border.",
      explanation: "The style attribute holds declarations separated by semicolons. They apply only to that element, which is why the first paragraph is unaffected.",
    },
    {
      title: "Internal CSS Styling Many Elements",
      scenario: "A single landing page needs all headings blue and all paragraphs comfortable to read.",
      steps: [
        "Create index.html",
        "Write a <style> block with rules for h1 and p",
        "Add several headings and paragraphs",
        "Click Run: every matching element gets the style",
      ],
      code: `<style>
  h1 { color: #1d4ed8; }
  p  { color: #374151; line-height: 1.7; }
</style>

<h1>Welcome</h1>
<p>One rule styles every paragraph.</p>
<h1>About Us</h1>
<p>No need to repeat style attributes.</p>`,
      playground: {
        html: `<h1>Welcome</h1>
<p>One rule styles every paragraph on this page.</p>
<h1>About Us</h1>
<p>No need to repeat style attributes on every element.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
h1 { color: #1d4ed8; }
p  { color: #374151; line-height: 1.7; }`,
      },
      result: "Both headings are blue and both paragraphs are dark grey with relaxed line spacing.",
      explanation: "In the playground the CSS panel acts like a <style> block. Selectors (h1, p) target every element of that type, so one rule styles many elements.",
    },
    {
      title: "External Stylesheet Setup",
      scenario: "You are building a 5-page website and want all pages to share one look.",
      steps: [
        "Create a folder with index.html and css/styles.css",
        "Write your rules in styles.css",
        "Add <link rel=\"stylesheet\" href=\"css/styles.css\"> in the <head> of every page",
        "Open index.html in the browser (in the playground, the CSS panel plays the role of styles.css)",
      ],
      code: `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Site</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <header class="site-header">My Site</header>
  <main><p>Shared styles from one file.</p></main>
</body>
</html>

/* css/styles.css */
body { margin: 0; font-family: system-ui, sans-serif; }
.site-header { background: #0f766e; color: white; padding: 16px; font-size: 24px; }
main { padding: 16px; }`,
      playground: {
        html: `<header class="site-header">My Site</header>
<main><p>These styles would come from one shared file: css/styles.css.</p></main>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.site-header { background: #0f766e; color: white; padding: 16px; font-size: 24px; }
main { padding: 16px; }`,
      },
      result: "A teal header bar with white text and a padded main area.",
      explanation: "rel=\"stylesheet\" tells the browser the linked file is CSS. Every page that links the same file gets identical styling, and the browser downloads it only once.",
    },
    {
      title: "Inline vs Internal: Who Wins?",
      scenario: "A paragraph gets a color from internal CSS and a different one inline. Which color appears?",
      steps: [
        "Write a rule p { color: green; } in the CSS",
        "Add style=\"color: purple\" to one paragraph",
        "Click Run and compare",
      ],
      code: `p { color: green; }

<p>Green from the stylesheet</p>
<p style="color: purple;">Purple: inline beats the stylesheet</p>`,
      playground: {
        html: `<p>Green from the stylesheet</p>
<p style="color: purple;">Purple: inline beats the stylesheet</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; font-size: 20px; }
p { color: green; }`,
      },
      result: "First paragraph is green, second is purple.",
      explanation: "Both rules target the second paragraph, but inline styles have higher priority than selectors in a stylesheet, so purple wins.",
    },
  ],
  interview: [
    { q: "What is CSS and why is it used?", a: "CSS (Cascading Style Sheets) is a stylesheet language that describes the presentation of HTML documents: colors, fonts, spacing, layout and animation. It separates design from content so styles are reusable, maintainable and consistent across pages.", level: "Easy" },
    { q: "What are the three ways to add CSS to HTML?", a: "Inline (style attribute on an element), internal (a <style> element in the <head>) and external (a separate .css file linked with <link rel=\"stylesheet\" href=\"...\">).", level: "Easy" },
    { q: "Which method is best for a large website and why?", a: "External CSS. One file styles every page, it is cached by the browser, keeps HTML clean and makes site-wide changes a single edit.", level: "Easy" },
    { q: "What does 'cascading' mean in CSS?", a: "Multiple rules can target the same element. The cascade is the algorithm that decides which declaration wins, based on origin and importance, specificity and source order.", level: "Medium" },
    { q: "What is the difference between <link> and @import?", a: "<link> is an HTML element that loads stylesheets in parallel. @import is a CSS rule inside a stylesheet; it loads files sequentially, which is slower, and must appear at the top of the file. <link> is preferred for performance.", level: "Medium" },
    { q: "Why should stylesheets be placed in the <head>?", a: "CSS is render-blocking. Loading it in the head lets the browser build the CSSOM before the first paint, avoiding a flash of unstyled content and layout jumps.", level: "Medium" },
    { q: "Explain DOM, CSSOM and render tree.", a: "The DOM is the tree built from HTML. The CSSOM is the tree built from CSS rules. The browser combines them into the render tree containing visible nodes and their computed styles, then performs layout and paint.", level: "Hard" },
    { q: "What are the disadvantages of inline CSS?", a: "It is not reusable, mixes content and presentation, bloats HTML, has very high priority so it is hard to override, and cannot express pseudo-classes (:hover) or media queries.", level: "Easy" },
    { q: "If internal and external CSS set the same property with the same selector, which wins?", a: "The one that appears later in the document. If the <link> comes after the <style>, the external rule wins; otherwise the internal rule wins.", level: "Medium" },
    { q: "What is a 'flash of unstyled content' (FOUC)?", a: "A brief moment where the page appears without styles, usually because CSS loads late (e.g. linked at the bottom of body or injected by JS). Fix by linking CSS in the head.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a paragraph styled only with inline CSS: blue text, 18px font size, and a yellow background.",
      hint: "Separate declarations with semicolons inside the style attribute.",
      solution: `<p style="color: blue; font-size: 18px; background: yellow;">Styled with inline CSS</p>`,
    },
    {
      task: "Build a page with a <style> block that makes all h2 elements dark green and all paragraphs grey.",
      hint: "Use element selectors h2 and p.",
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Internal CSS</title>
  <style>
    h2 { color: darkgreen; }
    p  { color: grey; }
  </style>
</head>
<body>
  <h2>Section One</h2>
  <p>Grey text.</p>
  <h2>Section Two</h2>
  <p>More grey text.</p>
</body>
</html>`,
    },
    {
      task: "Create two pages (index.html, about.html) that share one external stylesheet css/main.css giving the body a light background and a custom font.",
      hint: "Both pages need the same <link> tag with the correct relative path.",
      solution: `<!-- index.html and about.html (same head) -->
<head>
  <meta charset="UTF-8">
  <title>Home</title>
  <link rel="stylesheet" href="css/main.css">
</head>

/* css/main.css */
body {
  background: #f8fafc;
  font-family: Georgia, serif;
  color: #1e293b;
}`,
    },
    {
      task: "Prove the priority order: style the same paragraph with external (red), internal (blue) after the link, and inline (green). Predict the final color, then remove inline and predict again.",
      hint: "Inline wins first; then the later of <link>/<style> wins.",
      solution: `<head>
  <link rel="stylesheet" href="style.css"> <!-- p { color: red; } -->
  <style> p { color: blue; } </style>
</head>
<body>
  <p style="color: green;">Green (inline wins)</p>
  <p>Blue (internal comes after the link)</p>
</body>`,
    },
  ],
  quiz: [
    { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], answer: 1, explanation: "CSS = Cascading Style Sheets." },
    { question: "Which HTML element links an external stylesheet?", options: ["<style src>", "<css>", "<script href>", "<link rel=\"stylesheet\">"], answer: 3, explanation: "<link rel=\"stylesheet\" href=\"file.css\"> placed in the head." },
    { question: "Where is internal CSS written?", options: ["In a <style> element", "In the style attribute", "In a .css file", "In a <script> element"], answer: 0, explanation: "Internal CSS lives in a <style> element, usually in the head." },
    { question: "Which has the highest priority for normal declarations?", options: ["External CSS", "Internal CSS", "Inline CSS", "Browser defaults"], answer: 2, explanation: "Inline styles beat stylesheet rules (unless !important is used)." },
    { question: "Why is external CSS preferred for multi-page sites?", options: ["It runs JavaScript", "It is reusable and cached by the browser", "It cannot be overridden", "It removes the need for HTML"], answer: 1, explanation: "One cached file styles all pages and keeps HTML clean." },
  ],
};
