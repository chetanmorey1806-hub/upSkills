export default {
  id: 'day-06-html-links',
  title: 'HTML Links: <a>, href, target, Absolute & Relative URLs, Email Links',
  module: 'Module 2: Links, Images & Lists',
  day: 6,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Links are what make the web a "web". Learn to create links with <a>, control where they open with target, choose between absolute and relative URLs, and create email, phone and same-page links.',
  objectives: [
    'Create hyperlinks using the <a> element and href attribute',
    'Use target="_blank" safely with rel="noopener noreferrer"',
    'Explain and use absolute vs relative URLs (including ../ paths)',
    'Create mailto: email links with subject and body, and tel: links',
    'Link to a section of the same page using id and #',
  ],
  theory: [
    {
      heading: 'The anchor element <a> and href',
      content: "The `<a>` (**anchor**) element creates a **hyperlink**. The **href** (hypertext reference) attribute holds the destination. The content between the tags is the **clickable link text**.\n\nBy default, unvisited links are **blue and underlined**, visited links are **purple**, and active links (while clicking) are **red**.\n\nLink text should describe the destination. \"Click here\" or \"Read more\" is bad for accessibility (screen reader users often list all links out of context) and for SEO. Prefer \"Download the 2026 price list\".\n\nAn `<a>` **without href** is just a placeholder and is not focusable or clickable as a link.",
      syntax: '<a href="https://www.wikipedia.org">Visit Wikipedia</a>',
      tip: 'Common mistake: href="www.google.com" (missing https://). The browser treats it as a relative path to a file called www.google.com in your folder.',
    },
    {
      heading: 'The target attribute',
      content: "`target` decides **where** the linked page opens:\n- `_self` (default): same tab/window.\n- `_blank`: a **new tab** (or window).\n- `_parent` / `_top`: used with frames/iframes (parent or topmost window).\n- A **name**: opens in a named window or iframe.\n\n**Security:** a page opened with `target=\"_blank\"` could historically access your page through `window.opener` and redirect it to a phishing page (called **tabnabbing**). Modern browsers now apply `noopener` by default for `_blank`, but adding `rel=\"noopener noreferrer\"` is still the recommended, explicit practice.\n\nUse `_blank` sparingly: for external sites, PDFs, or when leaving would lose user work. Users dislike unexpected new tabs.",
      syntax: '<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>',
    },
    {
      heading: 'Absolute URLs',
      content: "An **absolute URL** is the full web address including the **protocol** and **domain**. It works from anywhere.\n\nParts of a URL: `https://www.example.com:443/blog/post.html?id=5#comments`\n- `https://` protocol (scheme)\n- `www.example.com` domain (host)\n- `:443` port (usually hidden)\n- `/blog/post.html` path\n- `?id=5` query string\n- `#comments` fragment (a section on the page)\n\nUse absolute URLs to link to **other websites**.\n\nAnalogy: an absolute URL is a full postal address with country and pin code. Anyone anywhere can find it.",
      syntax: '<a href="https://developer.mozilla.org/en-US/docs/Web/HTML">MDN HTML Docs</a>',
    },
    {
      heading: 'Relative URLs',
      content: "A **relative URL** points to a file **relative to the current page's location**. Use it to link pages **within your own website**. It keeps working when you move the whole site to a different domain.\n\nAnalogy: \"the house next door\" works only if you know where you are standing.\n\nImagine this folder structure:\n- `index.html`\n- `about.html`\n- `blog/post1.html`\n- `blog/post2.html`\n\nFrom `index.html`:\n- `about.html` or `./about.html`: same folder\n- `blog/post1.html`: go into a sub-folder\n\nFrom `blog/post1.html`:\n- `post2.html`: same folder (blog)\n- `../index.html`: `../` means **go up one folder**\n- `/about.html`: a leading `/` is **root-relative**: starts from the website root (works on a server, but not when opening files directly from your disk).",
      tip: 'Paths on real servers are often case-sensitive: About.html and about.html are different files. Use lowercase file names without spaces.',
    },
    {
      heading: 'Email, phone and same-page links',
      content: "**Email links** use the `mailto:` scheme. Clicking opens the user's email app with the address filled in. You can add `subject`, `body`, `cc` and `bcc` using a query string; separate parameters with `&` and encode spaces as `%20`.\n\n**Phone links** use `tel:`. On mobile, tapping dials the number. Include the country code: `tel:+919876543210`.\n\n**Same-page (fragment) links** jump to an element with a matching **id**: `<a href=\"#contact\">` jumps to `<section id=\"contact\">`. `href=\"#top\"` or `href=\"#\"` jumps to the top. You can also link to a section on another page: `about.html#team`.\n\nThe **download** attribute asks the browser to download the linked file instead of opening it: `<a href=\"report.pdf\" download>`.",
      syntax: '<a href="mailto:hr@company.com?subject=Job%20Application&body=Hello">Email HR</a>\n<a href="tel:+919876543210">Call us</a>\n<a href="#faq">Go to FAQ</a>\n...\n<h2 id="faq">FAQ</h2>',
    },
  ],
  examples: [
    {
      title: 'External link opening in a new tab',
      scenario: 'Your portfolio links to your GitHub and LinkedIn profiles.',
      steps: [
        'Create index.html',
        'Add <a> tags with absolute URLs',
        'Add target="_blank" and rel="noopener noreferrer"',
        'Click Run and click each link',
      ],
      code: `<p>Find me on:
  <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a> |
  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</p>`,
      playground: {
        html: `<h2>Ankit Verma - Web Developer</h2>
<p>Find me on:
  <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a> |
  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</p>`,
      },
      result: 'Two blue underlined links. Each opens the site in a new browser tab.',
      explanation: 'Absolute URLs are required for other websites. target="_blank" opens a new tab and rel="noopener noreferrer" prevents the new page from accessing window.opener and hides the referrer.',
    },
    {
      title: 'Same-page navigation with id and #',
      scenario: 'A long FAQ page needs a small menu that jumps to each section.',
      steps: [
        'Give each section heading a unique id',
        'Create links whose href is # followed by the id',
        'Add a "Back to top" link',
        'Click Run and click the menu links',
      ],
      code: `<nav>
  <a href="#shipping">Shipping</a> |
  <a href="#returns">Returns</a>
</nav>
<h2 id="shipping">Shipping</h2>
<p>...</p>
<h2 id="returns">Returns</h2>
<p>...</p>
<a href="#top">Back to top</a>`,
      playground: {
        html: `<h1 id="top">Help Centre</h1>
<nav>
  <a href="#shipping">Shipping</a> |
  <a href="#returns">Returns</a> |
  <a href="#payment">Payment</a>
</nav>
<h2 id="shipping">Shipping</h2>
<p class="long">We deliver across India in 3-5 working days. Free delivery above ₹499.</p>
<h2 id="returns">Returns</h2>
<p class="long">Returns are accepted within 7 days of delivery in original packaging.</p>
<h2 id="payment">Payment</h2>
<p class="long">We accept UPI, cards, net banking and cash on delivery.</p>
<a href="#top">Back to top</a>`,
        css: `.long { min-height: 300px; border-left: 3px solid #ccc; padding-left: 8px; }
html { scroll-behavior: smooth; }`,
      },
      result: 'Clicking Shipping, Returns or Payment scrolls smoothly to that section; Back to top returns to the heading.',
      explanation: 'A fragment link (#id) scrolls to the element with the matching id. ids must be unique. The CSS scroll-behavior: smooth is optional and only adds animation.',
    },
    {
      title: 'Email and phone links',
      scenario: 'A contact section where users can email support with a pre-filled subject or call directly.',
      steps: [
        'Add a mailto: link with subject and body',
        'Encode spaces as %20 and join parameters with &',
        'Add a tel: link with the country code',
        'Click Run (in a real browser your mail app/dialler opens)',
      ],
      code: `<a href="mailto:support@shop.com?subject=Order%20Issue&body=Order%20ID%3A%20">Email support</a>
<a href="tel:+919876543210">+91 98765 43210</a>`,
      playground: {
        html: `<h2>Contact Us</h2>
<p>Email: <a id="mail" href="mailto:support@shop.com?cc=manager@shop.com&subject=Order%20Issue&body=Order%20ID%3A%20">Email support</a></p>
<p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
<p><small>Tip: in the sandbox the mail app may not open; check the console for the parsed link.</small></p>`,
        js: `const link = document.getElementById('mail');
const url = new URL(link.href);
console.log('To:', url.pathname);
console.log('Subject:', url.searchParams.get('subject'));
console.log('CC:', url.searchParams.get('cc'));`,
      },
      result: 'Two links. The console shows To: support@shop.com, Subject: Order Issue, CC: manager@shop.com.',
      explanation: 'mailto: links open the default email client. The first parameter starts with ?, the rest join with &. Special characters must be URL-encoded (space = %20, colon = %3A). tel: links trigger the phone dialler on mobiles.',
    },
    {
      title: 'Relative paths explained',
      scenario: 'Understand how a browser resolves relative URLs from a page inside a sub-folder.',
      steps: [
        'Imagine the current page is https://mysite.com/blog/post1.html',
        'Write links with different relative paths',
        'Run the script to see the absolute URL each one resolves to',
      ],
      code: `<!-- current page: https://mysite.com/blog/post1.html -->
<a href="post2.html">Next post</a>          <!-- same folder -->
<a href="../index.html">Home</a>           <!-- up one folder -->
<a href="images/pic.png">Image</a>          <!-- sub-folder -->
<a href="/about.html">About</a>            <!-- root-relative -->`,
      playground: {
        html: `<h3>Current page: https://mysite.com/blog/post1.html</h3>
<table border="1" cellpadding="6" id="t">
  <tr><th>href</th><th>Resolves to</th></tr>
</table>`,
        js: `const base = 'https://mysite.com/blog/post1.html';
const paths = ['post2.html', './post2.html', '../index.html', 'images/pic.png', '/about.html', '#comments', 'https://google.com'];
const table = document.getElementById('t');
paths.forEach(p => {
  const resolved = new URL(p, base).href;
  table.insertAdjacentHTML('beforeend', '<tr><td><code>' + p + '</code></td><td>' + resolved + '</td></tr>');
  console.log(p, '->', resolved);
});`,
      },
      result: 'A table showing, for example, ../index.html resolves to https://mysite.com/index.html and /about.html resolves to https://mysite.com/about.html.',
      explanation: 'The browser combines each relative URL with the current page address. ../ climbs one folder, / starts at the domain root and an absolute URL is used unchanged. (The table border attribute is used here only for quick display; tables are covered on Day 10.)',
    },
  ],
  interview: [
    { q: 'What is the purpose of the href attribute?', a: 'href (hypertext reference) specifies the destination URL of a link: another page, a file, a section (#id), an email (mailto:) or a phone number (tel:).', level: 'Easy' },
    { q: 'What is the difference between absolute and relative URLs?', a: 'An absolute URL contains the full address including protocol and domain (https://site.com/page.html) and works anywhere. A relative URL is resolved relative to the current page location (about.html, ../index.html) and is used for links within the same site.', level: 'Easy' },
    { q: 'What does target="_blank" do and what security concern does it have?', a: 'It opens the link in a new tab. The opened page could access window.opener and redirect the original page (reverse tabnabbing). Adding rel="noopener noreferrer" prevents this; modern browsers imply noopener for _blank, but adding it explicitly is best practice.', level: 'Medium' },
    { q: 'How do you create an email link with a subject?', a: '<a href="mailto:name@example.com?subject=Hello%20there">Email me</a>. Additional parameters (cc, bcc, body) are joined with & and values are URL-encoded.', level: 'Easy' },
    { q: 'How do you link to a specific section of a page?', a: 'Give the target element an id (e.g. <h2 id="faq">) and link with href="#faq". From another page use href="page.html#faq".', level: 'Easy' },
    { q: 'What does ../ mean in a path?', a: 'It means go up one directory level from the current folder. ../../ goes up two levels.', level: 'Easy' },
    { q: 'What is the difference between "/about.html" and "about.html"?', a: '"/about.html" is root-relative: resolved from the domain root. "about.html" is document-relative: resolved from the folder of the current page.', level: 'Medium' },
    { q: 'What does the download attribute do on a link?', a: 'It tells the browser to download the linked resource instead of navigating to it. An optional value sets the suggested filename. It works for same-origin URLs (and blob/data URLs).', level: 'Medium' },
    { q: 'Why is "click here" bad link text?', a: 'Screen reader users often navigate a list of links out of context, so "click here" gives no information. Search engines also use link text to understand the target. Descriptive text is better for accessibility and SEO.', level: 'Medium' },
    { q: 'Can you put block elements inside <a>?', a: 'Yes. In HTML5 <a> has a transparent content model, so it can wrap block content such as a div or heading (making a whole card clickable), as long as it does not contain other interactive elements like buttons or links.', level: 'Hard' },
    { q: 'What is the difference between a link and a button?', a: 'A link (<a href>) navigates to a URL. A button (<button>) performs an action on the current page, such as submitting a form or opening a dialog. Using the right element ensures correct keyboard and screen reader behaviour.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a navigation bar with links to index.html, about.html, services.html and contact.html (relative URLs).',
      hint: 'All files are in the same folder, so just use the filenames.',
      solution: `<nav>
  <a href="index.html">Home</a> |
  <a href="about.html">About</a> |
  <a href="services.html">Services</a> |
  <a href="contact.html">Contact</a>
</nav>`,
    },
    {
      task: 'Create an email link to careers@techcorp.com with cc to hr@techcorp.com, subject "Application for Frontend Developer" and body "Please find my resume attached."',
      hint: 'Start with ?, join with &, replace spaces with %20.',
      solution: `<a href="mailto:careers@techcorp.com?cc=hr@techcorp.com&subject=Application%20for%20Frontend%20Developer&body=Please%20find%20my%20resume%20attached.">Apply by email</a>`,
    },
    {
      task: 'Build a single page with a table of contents (3 links) that jump to three sections, and a "Back to top" link at the end of each section.',
      hint: 'Give an id to each section heading and the page heading.',
      solution: `<h1 id="top">HTML Notes</h1>
<ul>
  <li><a href="#links">Links</a></li>
  <li><a href="#images">Images</a></li>
  <li><a href="#lists">Lists</a></li>
</ul>
<h2 id="links">Links</h2>
<p>Notes on links...</p>
<a href="#top">Back to top</a>
<h2 id="images">Images</h2>
<p>Notes on images...</p>
<a href="#top">Back to top</a>
<h2 id="lists">Lists</h2>
<p>Notes on lists...</p>
<a href="#top">Back to top</a>`,
    },
    {
      task: 'You are editing site/blog/2026/post.html. Write links to: site/index.html, site/blog/index.html, site/blog/2026/next.html and site/images/logo.png.',
      hint: 'Count how many folders you must climb with ../ for each.',
      solution: `<a href="../../index.html">Home</a>
<a href="../index.html">Blog home</a>
<a href="next.html">Next post</a>
<a href="../../images/logo.png">Logo</a>`,
    },
    {
      task: 'Create a contact card with a clickable phone number (+91 9988776655), an email link, and a link to Google Maps that opens in a new tab safely.',
      hint: 'tel:, mailto:, and target="_blank" with rel.',
      solution: `<h3>Sunrise Bakery</h3>
<p>Phone: <a href="tel:+919988776655">+91 99887 76655</a></p>
<p>Email: <a href="mailto:hello@sunrisebakery.in">hello@sunrisebakery.in</a></p>
<p><a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">View on Google Maps</a></p>`,
    },
  ],
  quiz: [
    { question: 'Which attribute specifies the destination of a link?', options: ['src', 'link', 'href', 'target'], answer: 2, explanation: 'href holds the URL.' },
    { question: 'What does target="_blank" do?', options: ['Opens the link in a new tab', 'Opens a blank page', 'Disables the link', 'Downloads the file'], answer: 0, explanation: '_blank opens a new browsing context (tab).' },
    { question: 'From blog/post.html, which href points to index.html in the parent folder?', options: ['/blog/index.html', 'index.html', './index.html', '../index.html'], answer: 3, explanation: '../ moves up one directory.' },
    { question: 'Which href creates an email link?', options: ['email:a@b.com', 'mailto:a@b.com', 'mail:a@b.com', 'href:a@b.com'], answer: 1, explanation: 'The mailto: scheme opens an email client.' },
    { question: 'How do you link to <section id="pricing"> on the same page?', options: ['href="pricing"', 'href=".pricing"', 'href="#pricing"', 'href="@pricing"'], answer: 2, explanation: 'Fragment links use # followed by the id.' },
  ],
};
