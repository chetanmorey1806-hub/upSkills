export default {
  id: 'extra-14-structured-data-json-ld',
  title: 'Structured Data with JSON-LD and Schema.org (Rich Results)',
  module: 'Extra: SEO & Accessibility',
  extraNo: 14,
  level: 'Advanced',
  duration: '2 hours',
  summary: 'Structured data describes your page content in a machine-readable vocabulary (Schema.org) so search engines understand exactly what it is: an article, product, recipe, FAQ, event or organization. JSON-LD is Google\'s recommended format and can unlock rich results like star ratings, prices and breadcrumbs.',
  objectives: [
    'Explain what structured data and Schema.org are and why search engines use them',
    'Write JSON-LD blocks with @context, @type and properties',
    'Mark up common types: Organization, Article, Product with Offer and AggregateRating, FAQPage, BreadcrumbList',
    'Nest and combine entities (including @graph) correctly',
    'Validate with the Rich Results Test and follow Google\'s content guidelines',
  ],
  theory: [
    {
      heading: 'What is structured data?',
      content: `HTML tells a browser how content is structured (heading, paragraph, list). But a search engine reading "4.5 – 120 reviews – Rs 1,299" cannot be sure if that is a product rating, a price, or random text.

**Structured data** is a label for each fact: "this is a Product, its name is X, its price is 1299 INR, its average rating is 4.5". It is like filling in a standard form instead of writing a free-text letter.

The labels come from **Schema.org**, a shared vocabulary created by Google, Microsoft, Yahoo and Yandex. It defines hundreds of **types** (Person, Product, Recipe, Event, LocalBusiness...) and their **properties** (name, price, startDate...).

Benefits: **rich results** (stars, prices, FAQ dropdowns, breadcrumbs, event dates in search), knowledge panels, better understanding for voice assistants and AI search. It does not guarantee a ranking boost, but rich results usually increase click-through rate.`,
    },
    {
      heading: 'JSON-LD syntax',
      content: `There are three formats: **JSON-LD**, Microdata and RDFa. Google recommends **JSON-LD** because it is separate from your HTML markup and easy to maintain.

A JSON-LD block is a \`<script type="application/ld+json">\` element, usually in \`<head>\` (body also works). The browser does **not** execute it; it is just data.

- \`@context\`: always \`"https://schema.org"\`
- \`@type\`: the Schema.org type, e.g. \`"Organization"\`
- Other keys: properties of that type
- Values can be strings, numbers, arrays or **nested objects** with their own \`@type\`

It must be valid JSON: double quotes, no trailing commas, no comments.`,
      syntax: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CodeDaily",
  "url": "https://codedaily.example",
  "logo": "https://codedaily.example/logo.png",
  "sameAs": ["https://www.linkedin.com/company/codedaily", "https://x.com/codedaily"]
}
</script>`,
    },
    {
      heading: 'Common types for rich results',
      content: `- **Article / BlogPosting** – headline, image, author (Person), datePublished, dateModified.
- **Product** – name, image, description, brand, \`offers\` (Offer with price, priceCurrency, availability), \`aggregateRating\`, \`review\`.
- **FAQPage** – \`mainEntity\` is an array of Question objects, each with an \`acceptedAnswer\` Answer.
- **BreadcrumbList** – \`itemListElement\` array of ListItem with position, name, item (URL).
- **Event** – name, startDate, location (Place or VirtualLocation), offers.
- **LocalBusiness** – address (PostalAddress), telephone, openingHoursSpecification, geo.
- **Recipe**, **Course**, **JobPosting**, **VideoObject**, and more.

Enumerated values use full URLs, e.g. \`"availability": "https://schema.org/InStock"\`.`,
      syntax: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Mouse M2",
  "image": "https://shop.example/img/m2.jpg",
  "brand": { "@type": "Brand", "name": "ClickCo" },
  "offers": {
    "@type": "Offer",
    "price": "1299.00",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "reviewCount": "120" }
}`,
    },
    {
      heading: 'Multiple entities and @graph',
      content: `A page can have several JSON-LD scripts (e.g. one for Organization, one for BreadcrumbList, one for Article). Or put them together in one \`@graph\` array and link them with \`@id\`:

Using \`@id\` (a unique URL-like identifier) lets one entity reference another, e.g. the article's publisher points to the organization defined once.`,
      syntax: `{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://codedaily.example/#org", "name": "CodeDaily" },
    { "@type": "Article", "headline": "JSON-LD Basics",
      "publisher": { "@id": "https://codedaily.example/#org" } }
  ]
}`,
    },
    {
      heading: 'Rules, guidelines and testing',
      content: `Google's key rules:
- Mark up only content that is **visible** to users on the page. Hidden or fake reviews/prices can get a **manual penalty**.
- Data must be accurate and match the page (same price, same rating).
- Use the most specific type available.
- Required properties for a rich result must be present; recommended ones improve eligibility.

Testing:
1. **Rich Results Test** (search.google.com/test/rich-results) – which rich results the page is eligible for.
2. **Schema Markup Validator** (validator.schema.org) – general Schema.org validity.
3. Google Search Console → Enhancements reports for errors across the site.

JSON-LD can be generated server-side or by frameworks (Next.js, WordPress plugins). Google can read JSON-LD injected with JavaScript, but static/server-rendered is more reliable.

In the playground below, the JSON-LD is real and in the page; we use JavaScript to read and validate it, simulating what the Rich Results Test does.`,
      tip: 'Common mistake: copying JSON-LD with a trailing comma or single quotes. One syntax error makes the whole block invalid; always validate.',
    },
  ],
  examples: [
    {
      title: 'Product JSON-LD with a simulated rich result',
      scenario: 'A product page contains JSON-LD. JavaScript parses it, checks required fields and draws a Google-style search result with stars and price.',
      steps: [
        'Write the visible product HTML (name, price, rating)',
        'Add a <script type="application/ld+json"> with Product, Offer and AggregateRating',
        'In JS, select the script, JSON.parse its textContent',
        'Check required properties and render a simulated search snippet',
        'Click Run, then try breaking the JSON (e.g. add a trailing comma) and run again',
      ],
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Mouse M2",
  "offers": { "@type": "Offer", "price": "1299.00", "priceCurrency": "INR",
              "availability": "https://schema.org/InStock" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "reviewCount": "120" }
}
</script>`,
      playground: {
        html: `<article class="product">
  <h2>Wireless Mouse M2</h2>
  <p>Silent clicks, 18-month battery.</p>
  <p><strong>Rs 1,299</strong> · ★ 4.5 (120 reviews) · In stock</p>
</article>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wireless Mouse M2",
  "description": "Silent clicks, 18-month battery.",
  "image": "https://picsum.photos/id/180/400/400",
  "brand": { "@type": "Brand", "name": "ClickCo" },
  "offers": {
    "@type": "Offer",
    "url": "https://shop.example/m2",
    "price": "1299.00",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "reviewCount": "120" }
}
</script>
<h3>Simulated search result</h3>
<div id="serp"></div>
<ul id="issues"></ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; max-width: 600px; }
.product { border: 1px solid #ddd; padding: 10px 14px; border-radius: 8px; }
#serp { font-family: Arial, sans-serif; border-left: 3px solid #4285f4; padding: 8px 12px; }
#serp .url { color: #202124; font-size: 13px; }
#serp .title { color: #1a0dab; font-size: 19px; margin: 2px 0; }
#serp .rich { color: #70757a; font-size: 13px; }
#serp .stars { color: #f4b400; }
#issues li { color: crimson; }`,
        js: `const issues = [];
let data;
try {
  data = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
} catch (e) {
  issues.push('Invalid JSON: ' + e.message);
}
if (data) {
  if (data['@context'] !== 'https://schema.org') issues.push('@context should be https://schema.org');
  if (data['@type'] !== 'Product') issues.push('@type is not Product');
  if (!data.name) issues.push('Missing name');
  if (!data.offers && !data.aggregateRating && !data.review) issues.push('Product needs offers, review or aggregateRating');
  const o = data.offers || {};
  const r = data.aggregateRating || {};
  const rating = Number(r.ratingValue);
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: o.priceCurrency || 'INR' });
  const inStock = (o.availability || '').endsWith('InStock') ? 'In stock' : 'Out of stock';
  document.getElementById('serp').innerHTML =
    '<div class="url">shop.example › m2</div>' +
    '<div class="title"></div>' +
    '<div class="rich"><span class="stars">' + stars + '</span> Rating: ' + rating + ' · ' + r.reviewCount +
    ' reviews · ' + fmt.format(Number(o.price)) + ' · ' + inStock + '</div>';
  document.querySelector('#serp .title').textContent = data.name + ' – ' + (data.brand ? data.brand.name : '');
  console.log('Parsed JSON-LD:', data);
}
document.getElementById('issues').innerHTML = issues.length
  ? issues.map((i) => '<li>' + i + '</li>').join('')
  : '<li style="color:seagreen">No issues found – eligible for product rich result (if content is visible on page).</li>';`,
      },
      result: 'Below the product, a Google-like snippet shows ★★★★★ (rounded 4.5), "Rating: 4.5 · 120 reviews · ₹1,299.00 · In stock", and a green "No issues found". Breaking the JSON shows a red "Invalid JSON" error.',
      explanation: 'The JSON-LD script is not executed by the browser; it is data. Search engines parse it like JSON.parse does and use offers/aggregateRating for rich results. The visible content matches the markup, which is a Google requirement.',
    },
    {
      title: 'Generate FAQPage JSON-LD from <details> on the page',
      scenario: 'An FAQ section built with details/summary. JavaScript builds the FAQPage structured data from it, so markup and visible content always match.',
      steps: [
        'Write an FAQ with <details><summary>question</summary><p>answer</p></details>',
        'In JS, map each details into a Question with acceptedAnswer',
        'Wrap in { "@context", "@type": "FAQPage", "mainEntity": [...] }',
        'Insert a new <script type="application/ld+json"> into <head> and print the JSON',
        'Click Run',
      ],
      code: `const faq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...document.querySelectorAll('.faq details')].map((d) => ({
    '@type': 'Question',
    name: d.querySelector('summary').textContent.trim(),
    acceptedAnswer: { '@type': 'Answer', text: d.querySelector('p').textContent.trim() },
  })),
};`,
      playground: {
        html: `<section class="faq">
  <h2>FAQ</h2>
  <details><summary>Is the course free?</summary><p>Yes, all 30 days are free.</p></details>
  <details><summary>Do I get a certificate?</summary><p>Yes, after passing the final test.</p></details>
  <details><summary>Do I need a laptop?</summary><p>A laptop is recommended, but a tablet with a keyboard works.</p></details>
</section>
<h3>Generated JSON-LD</h3>
<pre id="out"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
details { margin: 6px 0; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; }`,
        js: `const faq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...document.querySelectorAll('.faq details')].map((d) => ({
    '@type': 'Question',
    name: d.querySelector('summary').textContent.trim(),
    acceptedAnswer: { '@type': 'Answer', text: d.querySelector('p').textContent.trim() },
  })),
};
const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(faq);
document.head.appendChild(script);
document.getElementById('out').textContent = JSON.stringify(faq, null, 2);
console.log('Questions marked up:', faq.mainEntity.length);
console.log('JSON-LD scripts in head:', document.head.querySelectorAll('script[type="application/ld+json"]').length);`,
      },
      result: 'The pretty-printed FAQPage JSON-LD with three Question objects appears, and the console confirms 3 questions and 1 JSON-LD script in the head.',
      explanation: 'Generating structured data from the visible DOM guarantees they match. Note: Google now shows FAQ rich results mainly for authoritative government/health sites, but FAQPage markup is still valid and helps understanding. Server-side generation is preferred for reliability.',
    },
    {
      title: 'BreadcrumbList builder with @graph',
      scenario: 'Turn a visible breadcrumb nav into BreadcrumbList structured data and combine it with Organization and Article in one @graph.',
      steps: [
        'Create a <nav aria-label="Breadcrumb"> with an ordered list of links',
        'Map each link to a ListItem with position, name and item',
        'Create Organization and Article entities linked with @id',
        'Output a single @graph JSON-LD',
        'Click Run',
      ],
      code: `{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://codedaily.example/#org", "name": "CodeDaily" },
    { "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://codedaily.example/" },
      { "@type": "ListItem", "position": 2, "name": "HTML", "item": "https://codedaily.example/html/" }
    ]},
    { "@type": "Article", "headline": "JSON-LD Basics", "publisher": { "@id": "https://codedaily.example/#org" } }
  ]
}`,
      playground: {
        html: `<nav aria-label="Breadcrumb">
  <ol class="crumbs">
    <li><a href="https://codedaily.example/">Home</a></li>
    <li><a href="https://codedaily.example/html/">HTML</a></li>
    <li><a href="https://codedaily.example/html/seo/">SEO</a></li>
    <li><a href="https://codedaily.example/html/seo/json-ld" aria-current="page">JSON-LD Basics</a></li>
  </ol>
</nav>
<h1>JSON-LD Basics</h1>
<p>Published <time datetime="2026-03-10">10 March 2026</time> by Asha K.</p>
<pre id="out"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.crumbs { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0; font-size: 14px; }
.crumbs li + li::before { content: '›'; margin-right: 6px; color: #888; }
.crumbs a[aria-current] { color: #333; text-decoration: none; font-weight: 600; }
pre { background: #f4f4f4; padding: 12px; font-size: 12px; overflow-x: auto; }`,
        js: `const ORG_ID = 'https://codedaily.example/#org';
const links = [...document.querySelectorAll('.crumbs a')];
const breadcrumb = {
  '@type': 'BreadcrumbList',
  itemListElement: links.map((a, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: a.textContent.trim(),
    item: a.href,
  })),
};
const article = {
  '@type': 'Article',
  headline: document.querySelector('h1').textContent,
  datePublished: document.querySelector('time').dateTime,
  author: { '@type': 'Person', name: 'Asha K' },
  publisher: { '@id': ORG_ID },
};
const org = { '@type': 'Organization', '@id': ORG_ID, name: 'CodeDaily', url: 'https://codedaily.example/' };
const graph = { '@context': 'https://schema.org', '@graph': [org, breadcrumb, article] };
document.getElementById('out').textContent =
  '<script type="application/ld+json">\\n' + JSON.stringify(graph, null, 2) + '\\n</' + 'script>';
console.log('Breadcrumb items:', breadcrumb.itemListElement.map((x) => x.position + '. ' + x.name).join(' > '));`,
      },
      result: 'A visual breadcrumb "Home › HTML › SEO › JSON-LD Basics" and below it the full script tag with a @graph of Organization, BreadcrumbList (4 items) and Article that references the organization by @id.',
      explanation: 'BreadcrumbList positions start at 1. @graph keeps related entities in one block; "@id" works like a variable name so the Article\'s publisher points to the Organization without repeating it. The closing script tag is split in JS so it does not end any surrounding script.',
    },
  ],
  interview: [
    { q: 'What is structured data?', a: 'Machine-readable annotations, using a standard vocabulary like Schema.org, that describe the entities on a page (product, article, event) and their properties so search engines can understand and display them as rich results.', level: 'Easy' },
    { q: 'What is JSON-LD and why does Google recommend it?', a: 'JavaScript Object Notation for Linked Data: structured data placed in a <script type="application/ld+json"> block. It is separate from visible HTML, easy to add/maintain/generate, and supports nesting and linking entities.', level: 'Easy' },
    { q: 'Name the three structured data formats.', a: 'JSON-LD, Microdata (itemscope/itemtype/itemprop attributes in HTML) and RDFa (vocab/typeof/property attributes).', level: 'Medium' },
    { q: 'What are @context and @type?', a: '@context defines the vocabulary (https://schema.org); @type defines which Schema.org type the object is, e.g. Product or Article.', level: 'Easy' },
    { q: 'Does structured data improve rankings?', a: 'Not directly. It helps search engines understand content and can make pages eligible for rich results, which often improves click-through rate.', level: 'Medium' },
    { q: 'What are Google\'s main guidelines for structured data?', a: 'Mark up only content visible to users, keep it accurate and up-to-date, do not mark up misleading or fake content (e.g. self-serving fake reviews), use the most specific type and include required properties.', level: 'Medium' },
    { q: 'How do you test structured data?', a: 'Google Rich Results Test for rich result eligibility, Schema Markup Validator for vocabulary validity, and Search Console enhancement reports for sitewide monitoring.', level: 'Easy' },
    { q: 'What is @graph and @id used for?', a: '@graph holds multiple top-level entities in one JSON-LD block. @id gives an entity a unique identifier so other entities can reference it (e.g. Article publisher → Organization).', level: 'Hard' },
    { q: 'Write minimal JSON-LD for a BreadcrumbList with two items.', a: '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://ex.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://ex.com/blog"}]}', level: 'Medium' },
    { q: 'Will a JSON-LD script run as JavaScript?', a: 'No. The browser only executes scripts with JavaScript MIME types. application/ld+json is treated as a data block.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write JSON-LD for a LocalBusiness (a bakery) with address, phone, opening hours and geo coordinates.',
      hint: 'Use @type "Bakery" (a LocalBusiness subtype), PostalAddress, GeoCoordinates.',
      solution: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Sweet Crumbs",
  "telephone": "+91-20-5555-1234",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "12 FC Road",
    "addressLocality": "Pune",
    "postalCode": "411004",
    "addressCountry": "IN"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 18.5236, "longitude": 73.8478 },
  "openingHours": "Mo-Sa 08:00-21:00"
}
</script>`,
    },
    {
      task: 'Write Article JSON-LD for a blog post with headline, image, author, datePublished and publisher with logo.',
      hint: 'author is a Person; publisher is an Organization with a logo ImageObject.',
      solution: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "10 HTML Tips Every Beginner Should Know",
  "image": ["https://codedaily.example/og/10-html-tips.jpg"],
  "datePublished": "2026-03-01T09:00:00+05:30",
  "dateModified": "2026-03-05T10:00:00+05:30",
  "author": { "@type": "Person", "name": "Asha K", "url": "https://codedaily.example/authors/asha" },
  "publisher": {
    "@type": "Organization",
    "name": "CodeDaily",
    "logo": { "@type": "ImageObject", "url": "https://codedaily.example/logo.png" }
  }
}
</script>`,
    },
    {
      task: 'Write Event JSON-LD for an online workshop on 4 April 2026, 10:00–13:00 IST, free.',
      hint: 'eventAttendanceMode OnlineEventAttendanceMode, location VirtualLocation, offers price 0.',
      solution: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "HTML Forms Workshop",
  "startDate": "2026-04-04T10:00+05:30",
  "endDate": "2026-04-04T13:00+05:30",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": { "@type": "VirtualLocation", "url": "https://codedaily.example/live" },
  "organizer": { "@type": "Organization", "name": "CodeDaily", "url": "https://codedaily.example" },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "availability": "https://schema.org/InStock", "url": "https://codedaily.example/workshop" }
}
</script>`,
    },
    {
      task: 'Write JavaScript that finds every JSON-LD block on a page and logs its @type, or "INVALID" if it fails to parse.',
      hint: 'querySelectorAll + try/catch JSON.parse.',
      solution: `<script>
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s, i) => {
    try {
      const d = JSON.parse(s.textContent);
      console.log(i, d['@type'] || (d['@graph'] ? '@graph' : 'unknown'));
    } catch (e) {
      console.log(i, 'INVALID', e.message);
    }
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'Which script type marks a JSON-LD block?', options: ['text/json', 'application/json-ld', 'application/ld+json', 'text/schema'], answer: 2, explanation: 'JSON-LD uses <script type="application/ld+json">.' },
    { question: 'What value should @context usually have?', options: ['"https://schema.org"', '"https://google.com"', '"json-ld"', '"https://w3.org/html"'], answer: 0, explanation: 'Schema.org is the vocabulary used by search engines.' },
    { question: 'Which property of a Product holds price information?', options: ['price', 'aggregateRating', 'brand', 'offers'], answer: 3, explanation: 'Price, currency and availability go inside an Offer in offers.' },
    { question: 'Which is AGAINST Google\'s structured data guidelines?', options: ['Using JSON-LD in <head>', 'Marking up reviews that are not visible on the page', 'Using several JSON-LD blocks', 'Using @graph'], answer: 1, explanation: 'Markup must describe content visible to users.' },
    { question: 'Which tool checks if a page is eligible for Google rich results?', options: ['Lighthouse PWA audit', 'W3C CSS validator', 'Rich Results Test', 'Facebook Sharing Debugger'], answer: 2, explanation: 'Google\'s Rich Results Test reports eligible rich result types and errors.' },
  ],
};
