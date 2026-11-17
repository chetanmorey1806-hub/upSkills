export default {
  id: 'extra-13-open-graph-favicon-canonical',
  title: 'Open Graph Meta Tags, Twitter Cards, Favicon and Canonical URL',
  module: 'Extra: SEO & Accessibility',
  extraNo: 13,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Learn the <head> tags that control how your page looks when shared on WhatsApp, LinkedIn, Facebook or X (Open Graph and Twitter Cards), how to add favicons for every device, and how the canonical URL tells search engines which version of a page is the "real" one.',
  objectives: [
    'Write the essential Open Graph tags (og:title, og:description, og:image, og:url, og:type)',
    'Add Twitter/X card tags and know how they fall back to Open Graph',
    'Add a complete, modern favicon set (ICO, SVG, apple-touch-icon, manifest icons)',
    'Use rel="canonical" to avoid duplicate-content problems',
    'Test link previews with debugging tools',
  ],
  theory: [
    {
      heading: 'Why link previews matter',
      content: `When someone pastes your link into WhatsApp, Slack, LinkedIn or X, those apps visit your page and look for special meta tags to build a **preview card** (image + title + description). Without them, the app guesses: you may get no image or a random one, and fewer people click.

**Open Graph** (OG) is the protocol created by Facebook that almost every platform now reads. Think of OG tags as the **cover of a book**: the page content is the book, but the cover decides whether people pick it up.

Note: OG tags use \`property=\` (not \`name=\`) and live in \`<head>\`.`,
      syntax: `<meta property="og:title" content="Learn HTML in 30 Days">
<meta property="og:description" content="Free beginner course with daily lessons and projects.">
<meta property="og:image" content="https://example.com/images/og-html.jpg">
<meta property="og:image:alt" content="HTML course banner with code on a laptop">
<meta property="og:url" content="https://example.com/html-course">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CodeDaily">`,
    },
    {
      heading: 'OG best practices and Twitter Cards',
      content: `- **og:image** must be an **absolute URL** (https://...), ideally **1200×630 px** (1.91:1), under ~5 MB, JPG or PNG. Relative paths do not work because the crawler is not on your page.
- **og:title**: ~60 characters; **og:description**: ~110–160 characters.
- **og:type**: \`website\` for most pages, \`article\` for blog posts (then add \`article:published_time\`).
- Each page should have its own OG tags, not one copy for the whole site.

**Twitter/X cards** use \`name="twitter:..."\`. If a twitter tag is missing, X falls back to the matching OG tag, so you usually only need:`,
      syntax: `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@codedaily">`,
      tip: 'Platforms cache previews. After changing tags, use the Facebook Sharing Debugger, LinkedIn Post Inspector or opengraph.xyz to re-scrape.',
    },
    {
      heading: 'Favicons',
      content: `The **favicon** is the small icon in the browser tab, bookmarks and history. On phones a larger icon is used when the site is added to the home screen.

A modern, minimal set:
1. \`favicon.ico\` (32×32) in the site root – for old browsers and tools that request /favicon.ico automatically.
2. An **SVG** icon – sharp at any size, can even support dark mode with a media query inside the SVG.
3. \`apple-touch-icon.png\` (180×180) – iOS home screen.
4. 192 and 512 PNGs in the web app manifest – Android/PWA.

Use \`sizes="any"\` on the ICO link so browsers prefer the SVG where supported.`,
      syntax: `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">`,
    },
    {
      heading: 'The canonical URL',
      content: `The same content is often reachable through many URLs:
- \`https://example.com/shoes\`
- \`https://www.example.com/shoes\`
- \`https://example.com/shoes?utm_source=newsletter\`
- \`https://example.com/shoes/?sort=price\`

Search engines may see these as **duplicate pages** and split ranking signals between them. \`<link rel="canonical">\` says "this is the official address of this content; give all credit here". It is like saying "my legal name is X, even if friends call me by nicknames".

Rules:
- Use an **absolute** URL.
- One canonical per page, in \`<head>\`.
- A page can (and usually should) point to itself (self-referencing canonical).
- Keep og:url and canonical the same.
- Canonical is a strong hint, not a command; for moved pages use a 301 redirect instead.`,
      syntax: `<link rel="canonical" href="https://example.com/shoes">`,
    },
    {
      heading: 'Putting it together and testing',
      content: `A typical article \`<head>\` contains: charset, viewport, title, meta description, canonical, OG tags, Twitter card, favicons and manifest.

Testing tools:
- Browser DevTools → Elements → \`<head>\` to confirm tags are in the served HTML (crawlers usually **do not run JavaScript**, so tags added by client-side JS may be ignored by social apps).
- Facebook Sharing Debugger, LinkedIn Post Inspector, opengraph.xyz for previews.
- Google Search Console → URL Inspection to see the canonical Google chose.

In the playground below, the preview lives in an iframe, so tags cannot change a real tab or be crawled. Instead, the demos read meta tags with JavaScript and render a simulated preview card, which is exactly what the platforms do on their servers.`,
    },
  ],
  examples: [
    {
      title: 'Social preview card generator',
      scenario: 'Type a title, description and image URL, and see the generated OG/Twitter tags plus a simulated LinkedIn/WhatsApp-style preview.',
      steps: [
        'Create inputs for title, description, image URL and page URL',
        'On input, build the meta tag HTML string',
        'Render a preview card using the same values',
        'Warn if the title or description is too long, or the image URL is not absolute',
        'Click Run and edit the fields',
      ],
      code: `<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://...1200x630.jpg">
<meta property="og:url" content="https://...">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">`,
      playground: {
        html: `<form id="f">
  <label>Title <input name="title" value="Learn HTML in 30 Days"></label>
  <label>Description <input name="desc" value="Free beginner course with daily lessons, projects and interview questions."></label>
  <label>Image URL <input name="image" value="https://picsum.photos/id/0/1200/630"></label>
  <label>Page URL <input name="url" value="https://example.com/html-course"></label>
</form>
<div class="card">
  <img id="cImg" alt="">
  <div class="meta">
    <small id="cHost"></small>
    <strong id="cTitle"></strong>
    <p id="cDesc"></p>
  </div>
</div>
<ul id="warn"></ul>
<pre id="tags"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; max-width: 560px; }
label { display: block; margin: 4px 0; font-size: 14px; }
input { width: 100%; box-sizing: border-box; padding: 4px; }
.card { border: 1px solid #ddd; border-radius: 10px; overflow: hidden; margin: 14px 0; }
.card img { width: 100%; aspect-ratio: 1200 / 630; object-fit: cover; display: block; background: #eee; }
.meta { padding: 10px 12px; background: #f6f7f9; }
.meta small { color: #666; text-transform: uppercase; font-size: 11px; }
.meta strong { display: block; margin: 2px 0; }
.meta p { margin: 0; color: #555; font-size: 14px; }
#warn li { color: #b45309; }
pre { background: #111827; color: #d1fae5; padding: 10px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; }`,
        js: `const form = document.getElementById('f');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function update() {
  const d = Object.fromEntries(new FormData(form));
  document.getElementById('cImg').src = d.image;
  document.getElementById('cImg').alt = d.title;
  document.getElementById('cTitle').textContent = d.title;
  document.getElementById('cDesc').textContent = d.desc;
  let host = '';
  try { host = new URL(d.url).hostname; } catch (e) { host = 'invalid url'; }
  document.getElementById('cHost').textContent = host;
  const warnings = [];
  if (d.title.length > 60) warnings.push('Title is ' + d.title.length + ' chars (aim for ≤ 60)');
  if (d.desc.length > 160) warnings.push('Description is ' + d.desc.length + ' chars (aim for ≤ 160)');
  if (!/^https:\\/\\//.test(d.image)) warnings.push('og:image should be an absolute https:// URL');
  if (!/^https?:\\/\\//.test(d.url)) warnings.push('og:url must be absolute');
  document.getElementById('warn').innerHTML = warnings.map((w) => '<li>' + w + '</li>').join('');
  const tags = [
    '<meta property="og:title" content="' + esc(d.title) + '">',
    '<meta property="og:description" content="' + esc(d.desc) + '">',
    '<meta property="og:image" content="' + esc(d.image) + '">',
    '<meta property="og:url" content="' + esc(d.url) + '">',
    '<meta property="og:type" content="website">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<link rel="canonical" href="' + esc(d.url) + '">',
  ].join('\\n');
  document.getElementById('tags').textContent = tags;
}
form.addEventListener('input', update);
update();
console.log('Edit the form to see the preview update');`,
      },
      result: 'A preview card with a 1200×630 image, the domain, title and description, plus the ready-to-paste tags. Long titles or a relative image path show orange warnings.',
      explanation: 'Social platforms do the same thing on their servers: fetch your HTML, read og:* tags and build a card. We escape quotes so user text cannot break the attribute. The same URL is used for og:url and canonical.',
    },
    {
      title: 'Generate an SVG favicon (with dark mode) from text',
      scenario: 'Create a letter-based SVG favicon, preview it at different sizes and output the <link> tags. We also set it on the document, which will apply when this code runs in a normal tab.',
      steps: [
        'Write an SVG string with a rounded square and a letter',
        'Add a <style> with prefers-color-scheme inside the SVG for dark mode',
        'Turn it into a data: URL with encodeURIComponent',
        'Show it in <img> tags at 16, 32 and 180 px and set link rel="icon"',
        'Click Run and change the letter/colour',
      ],
      code: `<!-- icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>rect{fill:#0d9488} @media (prefers-color-scheme: dark){rect{fill:#5eead4}}</style>
  <rect width="64" height="64" rx="14"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="40" fill="#fff">H</text>
</svg>

<link rel="icon" href="/icon.svg" type="image/svg+xml">`,
      playground: {
        html: `<label>Letter <input id="letter" value="H" maxlength="2" size="2"></label>
<label>Colour <input id="color" type="color" value="#0d9488"></label>
<div class="sizes">
  <figure><img id="i16" width="16" height="16" alt="16px favicon"><figcaption>16</figcaption></figure>
  <figure><img id="i32" width="32" height="32" alt="32px favicon"><figcaption>32</figcaption></figure>
  <figure><img id="i180" width="180" height="180" alt="180px apple-touch-icon"><figcaption>180 (apple-touch)</figcaption></figure>
</div>
<pre id="code"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.sizes { display: flex; gap: 24px; align-items: flex-end; margin: 12px 0; }
figure { margin: 0; text-align: center; font-size: 12px; color: #666; }
pre { background: #f4f4f4; padding: 10px; font-size: 12px; white-space: pre-wrap; word-break: break-all; }`,
        js: `function makeSvg(letter, color) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<style>rect{fill:' + color + '}@media (prefers-color-scheme: dark){rect{fill:#5eead4}}</style>' +
    '<rect width="64" height="64" rx="14"/>' +
    '<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold" font-size="40" fill="#fff">' +
    letter.replace(/[<&]/g, '') + '</text></svg>';
}
function update() {
  const svg = makeSvg(document.getElementById('letter').value || '?', document.getElementById('color').value);
  const url = 'data:image/svg+xml,' + encodeURIComponent(svg);
  ['i16', 'i32', 'i180'].forEach((id) => { document.getElementById(id).src = url; });
  let link = document.querySelector('link[rel="icon"]');
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.type = 'image/svg+xml';
  link.href = url;
  document.getElementById('code').textContent = 'Save as /icon.svg:\\n' + svg +
    '\\n\\nThen in <head>:\\n<link rel="icon" href="/favicon.ico" sizes="32x32">\\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">';
  console.log('Favicon link set:', document.querySelector('link[rel="icon"]').type);
}
document.getElementById('letter').addEventListener('input', update);
document.getElementById('color').addEventListener('input', update);
update();`,
      },
      result: 'The icon is previewed at 16, 32 and 180 pixels and updates live. The SVG source and the head tags are printed. (The browser tab icon belongs to the parent page here, so it will not change in the playground.)',
      explanation: 'An SVG favicon scales perfectly and can adapt to dark mode via a media query inside it. Small sizes show why favicons must be simple: detail disappears at 16px. apple-touch-icon must still be a PNG.',
    },
    {
      title: 'Canonical URL normalizer',
      scenario: 'Several URL variants of one product page are shown; a function strips tracking parameters, forces https, removes www and trailing slashes to produce the canonical URL.',
      steps: [
        'Create an array of URL variants',
        'Write canonicalize(url) using the URL API',
        'Delete utm_* and other tracking params, lowercase the host, remove "www." and trailing "/"',
        'Group variants by their canonical result and print the table',
        'Click Run',
      ],
      code: `function canonicalize(input) {
  const u = new URL(input);
  u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase().replace(/^www\\./, '');
  [...u.searchParams.keys()]
    .filter(k => k.startsWith('utm_') || k === 'fbclid' || k === 'ref')
    .forEach(k => u.searchParams.delete(k));
  u.hash = '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
  return u.toString();
}
// <link rel="canonical" href="https://example.com/shoes/running">`,
      playground: {
        html: `<h3>URL variants → canonical</h3>
<table>
  <thead><tr><th>Variant</th><th>Canonical</th></tr></thead>
  <tbody id="rows"></tbody>
</table>
<p id="summary"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
table { border-collapse: collapse; font-size: 13px; }
th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; word-break: break-all; }
td:last-child { color: seagreen; }`,
        js: `const variants = [
  'http://example.com/shoes/running',
  'https://www.example.com/shoes/running/',
  'https://example.com/shoes/running?utm_source=newsletter&utm_medium=email',
  'https://EXAMPLE.com/shoes/running#reviews',
  'https://example.com/shoes/running?fbclid=abc123',
  'https://example.com/shoes/running?color=red',
];
function canonicalize(input) {
  const u = new URL(input);
  u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase().replace(/^www\\./, '');
  [...u.searchParams.keys()]
    .filter((k) => k.startsWith('utm_') || k === 'fbclid' || k === 'ref')
    .forEach((k) => u.searchParams.delete(k));
  u.hash = '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
  return u.toString();
}
const rows = document.getElementById('rows');
const unique = new Set();
variants.forEach((v) => {
  const c = canonicalize(v);
  unique.add(c);
  const tr = document.createElement('tr');
  const a = document.createElement('td'); a.textContent = v;
  const b = document.createElement('td'); b.textContent = c;
  tr.append(a, b);
  rows.appendChild(tr);
});
document.getElementById('summary').textContent = variants.length + ' variants → ' + unique.size +
  ' canonical URLs. (Filter params like ?color=red may deserve their own canonical decision.)';
console.log([...unique]);`,
      },
      result: 'Five variants map to https://example.com/shoes/running; the ?color=red variant keeps its parameter, so 6 variants → 2 canonical URLs.',
      explanation: 'This is the thinking behind rel="canonical": tracking parameters, http vs https, www, case and trailing slashes do not change the content, so they should all point to one URL. Meaningful parameters (a filter that changes content) need a deliberate decision.',
    },
  ],
  interview: [
    { q: 'What is Open Graph?', a: 'A protocol (originally by Facebook) of <meta property="og:..."> tags that describe a page for link previews: og:title, og:description, og:image, og:url, og:type. Most social and chat apps read it.', level: 'Easy' },
    { q: 'What are the required/essential Open Graph tags?', a: 'og:title, og:type, og:image and og:url are the four basic ones; og:description and og:site_name are strongly recommended, plus og:image:alt for accessibility.', level: 'Medium' },
    { q: 'What image size is recommended for og:image?', a: '1200×630 pixels (1.91:1 ratio), JPG/PNG, absolute HTTPS URL, under ~5 MB, with important content in the centre.', level: 'Medium' },
    { q: 'Do you need separate Twitter tags if you have OG tags?', a: 'Mostly no. X falls back to OG for title, description and image. You should still add twitter:card (e.g. summary_large_image) to control the layout.', level: 'Medium' },
    { q: 'Why might my updated OG image not appear when I share the link?', a: 'Platforms cache previews. Re-scrape with the Facebook Sharing Debugger or LinkedIn Post Inspector, change the image URL (cache-busting), and ensure tags are in server-rendered HTML since crawlers usually do not execute JavaScript.', level: 'Hard' },
    { q: 'What is a favicon and which formats should a modern site provide?', a: 'The small site icon used in tabs and bookmarks. Provide favicon.ico (32px), an SVG icon, a 180px apple-touch-icon PNG and 192/512 PNG icons in the web manifest.', level: 'Easy' },
    { q: 'What does rel="canonical" do?', a: 'It tells search engines the preferred URL for content that is available at multiple URLs, consolidating ranking signals and avoiding duplicate-content issues.', level: 'Easy' },
    { q: 'What is a self-referencing canonical and why use it?', a: 'A page whose canonical points to its own clean URL. It protects against variants created by tracking parameters, session ids or different hosts.', level: 'Medium' },
    { q: 'Canonical tag vs 301 redirect: when to use which?', a: 'Use a 301 when the old URL should no longer be visited (page moved). Use canonical when multiple URLs must keep working for users (filters, tracking params) but one should be indexed.', level: 'Hard' },
    { q: 'Why must og:image and canonical URLs be absolute?', a: 'The crawler or search engine processes them outside your page context; relative URLs can be resolved incorrectly or ignored.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write the complete <head> for a blog article "10 HTML Tips" with OG (type article), Twitter card, canonical and favicons.',
      hint: 'Add article:published_time for og:type article.',
      solution: `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>10 HTML Tips Every Beginner Should Know | CodeDaily</title>
  <meta name="description" content="Ten practical HTML tips on semantics, forms, images and accessibility.">
  <link rel="canonical" href="https://codedaily.example/blog/10-html-tips">
  <meta property="og:type" content="article">
  <meta property="og:title" content="10 HTML Tips Every Beginner Should Know">
  <meta property="og:description" content="Ten practical HTML tips on semantics, forms, images and accessibility.">
  <meta property="og:url" content="https://codedaily.example/blog/10-html-tips">
  <meta property="og:image" content="https://codedaily.example/og/10-html-tips.jpg">
  <meta property="og:image:alt" content="Laptop showing HTML code with the text 10 HTML Tips">
  <meta property="article:published_time" content="2026-03-01T09:00:00+05:30">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>`,
    },
    {
      task: 'Write JavaScript that reads all og:* meta tags of the current page into an object and logs it.',
      hint: 'document.querySelectorAll(\'meta[property^="og:"]\').',
      solution: `<script>
  const og = {};
  document.querySelectorAll('meta[property^="og:"]').forEach((m) => {
    og[m.getAttribute('property')] = m.content;
  });
  console.log(og);
</script>`,
    },
    {
      task: 'A product page is reachable at /product?id=5&utm_source=ad and /product?id=5. Write the canonical tag.',
      hint: 'Keep meaningful params, drop tracking params.',
      solution: `<link rel="canonical" href="https://shop.example/product?id=5">`,
    },
    {
      task: 'Write a minimal emoji favicon using an inline SVG data URL.',
      hint: 'Put the emoji in an SVG <text> element and URL-encode it.',
      solution: `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%9A%80%3C/text%3E%3C/svg%3E">`,
    },
  ],
  quiz: [
    { question: 'Which attribute do Open Graph meta tags use for the tag name?', options: ['name', 'property', 'rel', 'itemprop'], answer: 1, explanation: 'OG tags are <meta property="og:..." content="...">.' },
    { question: 'Which is the recommended og:image size?', options: ['1200×630', '16×16', '512×512', '1920×1080'], answer: 0, explanation: '1200×630 (1.91:1) is the standard large preview size.' },
    { question: 'What does <link rel="canonical"> tell search engines?', options: ['Which page to block', 'The page language', 'The preferred URL among duplicates', 'The page favicon'], answer: 2, explanation: 'It names the preferred, official URL for the content.' },
    { question: 'Which icon does iOS use when a site is added to the home screen?', options: ['favicon.ico', 'og:image', 'manifest 512 icon', 'apple-touch-icon'], answer: 3, explanation: 'iOS uses <link rel="apple-touch-icon"> (180×180 PNG).' },
    { question: 'Why might OG tags added with client-side JavaScript not work?', options: ['JS cannot create meta tags', 'Most social crawlers do not execute JavaScript', 'OG tags must be in the body', 'Browsers block them'], answer: 1, explanation: 'Crawlers usually read raw HTML, so tags must be server-rendered or static.' },
  ],
};
