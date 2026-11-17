export default {
  id: 'extra-05-time-figure-figcaption',
  title: 'Time, Figure and Figcaption: Machine-Readable Dates and Captioned Content',
  module: 'Extra: Elements & Attributes',
  extraNo: 5,
  level: 'Beginner',
  duration: '1 hour',
  summary: '<time> gives dates, times and durations a machine-readable format through the datetime attribute, and <figure> with <figcaption> groups an image, chart, code sample or quote with its caption. Both add meaning that search engines and assistive technology understand.',
  objectives: [
    'Mark up dates, times and durations with <time datetime>',
    'Write valid datetime formats (date, time, date-time with time zone, duration)',
    'Group self-contained content with <figure> and caption it with <figcaption>',
    'Decide when to use figure vs a plain image and how figcaption relates to alt',
  ],
  theory: [
    {
      heading: 'Why <time>?',
      content: `Humans write dates in many ways: "5 Jan", "01/05/2026", "next Friday". Computers cannot reliably understand these. \`<time>\` lets you show any friendly text to people while giving machines an exact value in the \`datetime\` attribute.

Think of it like a price tag that says "Special offer!" for customers but has a barcode underneath for the cash register.

Search engines, browser extensions (e.g. "add to calendar") and scripts can read the \`datetime\` value.`,
      syntax: `<p>Published <time datetime="2026-01-05">5 January 2026</time></p>
<p>Shop opens at <time datetime="09:30">9:30 am</time></p>`,
    },
    {
      heading: 'Valid datetime formats',
      content: `The \`datetime\` value must follow standard (ISO 8601-like) formats:
- Date: \`2026-03-15\`
- Year and month: \`2026-03\`
- Year only: \`2026\`
- Time: \`14:30\` or \`14:30:15\`
- Local date and time: \`2026-03-15T14:30\`
- With time zone: \`2026-03-15T14:30+05:30\` or UTC \`2026-03-15T09:00Z\`
- Week: \`2026-W11\`
- Duration: \`PT2H30M\` (2 hours 30 minutes), \`P3D\` (3 days)

If the text content itself is already a valid format (e.g. \`<time>2026-03-15</time>\`), \`datetime\` can be omitted.`,
      tip: 'Common mistake: datetime="15/03/2026". That is invalid. Always year-month-day with hyphens.',
    },
    {
      heading: '<figure> and <figcaption>',
      content: `\`<figure>\` represents **self-contained content** that is referenced from the main text and could be moved elsewhere (an appendix, a sidebar) without breaking the flow. Like a figure in a textbook: "see Figure 3".

It is not only for images. Use it for:
- photos and illustrations
- charts and diagrams (SVG, canvas)
- code listings
- quotations with attribution
- videos or tables with a caption

\`<figcaption>\` is the caption. It must be the **first or last child** of the figure, and there can be only one.`,
      syntax: `<figure>
  <img src="chart.png" alt="Bar chart: sales doubled from Jan to Jun">
  <figcaption>Figure 1: Sales, January–June 2026</figcaption>
</figure>`,
    },
    {
      heading: 'figcaption vs alt',
      content: `They do different jobs:
- \`alt\` **replaces** the image for people who cannot see it. It describes what the image shows.
- \`figcaption\` is visible to everyone and gives **context** (title, credit, explanation).

Do not copy the same text into both; screen-reader users would hear it twice. Keep alt descriptive and the caption contextual. Screen readers announce the figure with its caption as its accessible name.`,
      points: [
        'Decorative images that need no caption do not need <figure>.',
        'One figure can contain several images sharing one caption (a gallery).',
        'Only one <figcaption> per figure.',
      ],
    },
  ],
  examples: [
    {
      title: 'Blog post meta with <time>',
      scenario: 'An article shows a published date, an event time with time zone and a reading duration.',
      steps: [
        'Create an <article> with a heading',
        'Add a <time> for the publish date',
        'Add a <time> with a full date-time and +05:30 time zone',
        'Add a duration with datetime="PT8M"',
        'In JS, list each time element\'s datetime value',
        'Click Run and check the console',
      ],
      code: `<p>Published <time datetime="2026-03-15">15 March 2026</time></p>
<p>Live session: <time datetime="2026-03-20T18:00+05:30">20 Mar, 6 pm IST</time></p>
<p>Reading time: <time datetime="PT8M">8 minutes</time></p>`,
      playground: {
        html: `<article>
  <h2>Learning Semantic HTML</h2>
  <p class="meta">Published <time datetime="2026-03-15">15 March 2026</time> ·
  Reading time <time datetime="PT8M">8 min</time></p>
  <p>Live Q&amp;A session on <time datetime="2026-03-20T18:00+05:30">Friday at 6 pm (IST)</time>.</p>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.meta { color: #666; font-size: 14px; }
time { background: #fff7d6; padding: 0 4px; border-radius: 3px; }`,
        js: `document.querySelectorAll('time').forEach((t) => {
  console.log('Text: "' + t.textContent + '" -> datetime:', t.dateTime);
});
const live = new Date(document.querySelectorAll('time')[2].dateTime);
console.log('Parsed by JS as UTC:', live.toISOString());`,
      },
      result: 'Dates are highlighted. The console lists each human text with its machine value and shows the live session converted to UTC (2026-03-20T12:30:00.000Z).',
      explanation: 'The visible text is friendly; dateTime (the datetime attribute) is exact and machine-readable, so JavaScript can parse it with new Date().',
    },
    {
      title: 'Image figure with caption',
      scenario: 'A travel blog shows a photo with a caption and credit.',
      steps: [
        'Wrap an <img> in <figure>',
        'Write a descriptive alt',
        'Add a <figcaption> with context and credit',
        'Style the figure like a card',
        'Click Run',
      ],
      code: `<figure>
  <img src="https://picsum.photos/id/1018/480/280" alt="Green valley between rocky mountains under a blue sky">
  <figcaption>View from the trek's second camp. Photo: picsum.photos</figcaption>
</figure>`,
      playground: {
        html: `<p>On day two we reached the camp (see the photo below).</p>
<figure>
  <img src="https://picsum.photos/id/1018/480/280" alt="Green valley between rocky mountains under a blue sky" width="480" height="280">
  <figcaption>Figure 1: View from the trek's second camp. <small>Photo: picsum.photos</small></figcaption>
</figure>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
figure { margin: 0; max-width: 480px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
figure img { display: block; width: 100%; height: auto; }
figcaption { padding: 8px 12px; background: #f7f7f7; font-size: 14px; color: #444; }`,
      },
      result: 'A photo card with a grey caption bar underneath.',
      explanation: 'alt describes the picture for people who cannot see it; figcaption gives context and credit visible to everyone. The figure groups them so the caption belongs to the image.',
    },
    {
      title: 'Figure for code and a quotation',
      scenario: 'Figures are not only for images: caption a code snippet and a quote.',
      steps: [
        'Create a figure containing <pre><code>',
        'Put the figcaption first this time',
        'Create a second figure with <blockquote> and the author in figcaption',
        'Click Run',
      ],
      code: `<figure>
  <figcaption>Listing 1: A minimal HTML page</figcaption>
  <pre><code>&lt;!DOCTYPE html&gt; ...</code></pre>
</figure>
<figure>
  <blockquote>Simplicity is prerequisite for reliability.</blockquote>
  <figcaption>— Edsger W. Dijkstra</figcaption>
</figure>`,
      playground: {
        html: `<figure>
  <figcaption>Listing 1: A minimal HTML page</figcaption>
  <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;&lt;title&gt;Hi&lt;/title&gt;&lt;/head&gt;
  &lt;body&gt;Hello&lt;/body&gt;
&lt;/html&gt;</code></pre>
</figure>
<figure class="quote">
  <blockquote>Simplicity is prerequisite for reliability.</blockquote>
  <figcaption>— Edsger W. Dijkstra</figcaption>
</figure>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
figure { margin: 0 0 16px; }
figcaption { font-weight: 600; margin-bottom: 4px; }
pre { background: #1e1e1e; color: #dcdcdc; padding: 12px; border-radius: 6px; overflow-x: auto; }
.quote blockquote { font-size: 20px; font-style: italic; margin: 0; border-left: 4px solid teal; padding-left: 12px; }
.quote figcaption { font-weight: normal; color: #555; margin-top: 6px; }`,
      },
      result: 'A dark code block with "Listing 1" above it, and a styled quote with the author below.',
      explanation: 'figcaption can be first or last child. The quote attribution belongs in figcaption (not inside blockquote) because it is not part of the quoted words.',
    },
  ],
  interview: [
    { q: 'What is the purpose of the <time> element?', a: 'It represents a date, time or duration and provides a machine-readable value in the datetime attribute while showing human-friendly text.', level: 'Easy' },
    { q: 'Give three valid datetime attribute values.', a: '"2026-03-15" (date), "14:30" (time), "2026-03-15T14:30+05:30" (date-time with offset), "PT1H30M" (duration).', level: 'Medium' },
    { q: 'When can you omit the datetime attribute?', a: 'When the element\'s text content is itself in a valid machine-readable format, e.g. <time>2026-03-15</time>.', level: 'Medium' },
    { q: 'What is <figure> used for?', a: 'Self-contained content, usually referenced from the main text, that could be moved without affecting the flow: images, diagrams, code listings, quotes, videos, with an optional caption.', level: 'Easy' },
    { q: 'Where must <figcaption> be placed?', a: 'As the first or the last child of <figure>, and only one per figure.', level: 'Easy' },
    { q: 'Should figcaption text duplicate the image alt text?', a: 'No. alt replaces the image (describes it); figcaption adds context visible to all. Duplicating them makes screen readers repeat the same text.', level: 'Medium' },
    { q: 'Should every image be wrapped in <figure>?', a: 'No. Only when it is self-contained, referenced content that benefits from a caption. Inline icons, logos and decorative images do not need it.', level: 'Medium' },
    { q: 'How does JavaScript read the datetime value?', a: 'Via the element.dateTime property or getAttribute("datetime"), then parse with new Date(value) for date-time formats.', level: 'Medium' },
    { q: 'Why is a quotation author placed in figcaption instead of inside blockquote?', a: 'blockquote should contain only the quoted content. The attribution is not part of the quote, so figure + figcaption associates it correctly.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Mark up an event: "Workshop on Saturday, 4 April 2026, 10:00 to 13:00 IST".',
      hint: 'Use two <time> elements with full date-times and +05:30.',
      solution: `<p>Workshop on <time datetime="2026-04-04">Saturday, 4 April 2026</time>,
from <time datetime="2026-04-04T10:00+05:30">10:00</time>
to <time datetime="2026-04-04T13:00+05:30">13:00</time> IST.</p>`,
    },
    {
      task: 'Show a recipe with "Cooking time: 1 hour 15 minutes" using a duration.',
      hint: 'datetime="PT1H15M".',
      solution: `<p>Cooking time: <time datetime="PT1H15M">1 hour 15 minutes</time></p>`,
    },
    {
      task: 'Create a gallery figure containing three images sharing one caption.',
      hint: 'Put all <img> in one figure and one figcaption at the end.',
      solution: `<figure>
  <img src="https://picsum.photos/id/10/200/140" alt="Forest path">
  <img src="https://picsum.photos/id/11/200/140" alt="Lake at sunrise">
  <img src="https://picsum.photos/id/12/200/140" alt="Rocky beach">
  <figcaption>Three places we visited in 2026.</figcaption>
</figure>`,
    },
    {
      task: 'Wrap an inline SVG bar chart in a figure with a caption.',
      hint: 'Add role="img" and an aria-label to the svg.',
      solution: `<figure>
  <svg width="200" height="100" role="img" aria-label="Bar chart: Mon 40, Tue 70, Wed 55">
    <rect x="10" y="60" width="40" height="40" fill="teal"/>
    <rect x="80" y="30" width="40" height="70" fill="teal"/>
    <rect x="150" y="45" width="40" height="55" fill="teal"/>
  </svg>
  <figcaption>Visitors per day (Mon–Wed)</figcaption>
</figure>`,
    },
  ],
  quiz: [
    { question: 'Which datetime value is valid?', options: ['15/03/2026', '2026-03-15', 'March 15 2026', '15-03-2026'], answer: 1, explanation: 'Dates must be YYYY-MM-DD.' },
    { question: 'What does datetime="PT45M" mean?', options: ['45 months', 'Time 00:45', 'A duration of 45 minutes', 'Pacific Time 45'], answer: 2, explanation: 'P starts a duration, T separates the time part, 45M = 45 minutes.' },
    { question: 'Where can <figcaption> appear inside <figure>?', options: ['Anywhere', 'Only as the last child', 'Only outside the figure', 'As the first or last child'], answer: 3, explanation: 'figcaption must be the first or last child.' },
    { question: 'Which content is a good fit for <figure>?', options: ['A code listing referenced in the text', 'The site logo in the header', 'A decorative background swirl', 'A navigation icon'], answer: 0, explanation: 'Figures are self-contained, referenced content such as code listings, charts and photos.' },
    { question: 'What is the main job of the alt attribute compared to figcaption?', options: ['Shows a tooltip', 'Replaces the image for users who cannot see it', 'Adds a visible caption', 'Improves image loading speed'], answer: 1, explanation: 'alt is the text alternative; figcaption is the visible caption.' },
  ],
};
