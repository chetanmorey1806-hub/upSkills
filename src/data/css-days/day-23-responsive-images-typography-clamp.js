export default {
  id: 'day-23-responsive-images-typography-clamp',
  title: 'Responsive Images and Typography, clamp(), min(), max()',
  module: 'Module 5: Responsive Design',
  day: 23,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Make images that never overflow and keep their shape, and text that scales smoothly between phone and desktop sizes using the CSS math functions min(), max() and clamp() – often without any media queries.',
  objectives: [
    'Make images fluid with max-width: 100% and control their shape with aspect-ratio and object-fit',
    'Know when to use HTML srcset / <picture> versus CSS background images for responsiveness',
    'Use min(), max() and clamp() to create fluid widths, spacing and font sizes',
    'Build readable fluid typography with rem, line-height and measure (ch)',
  ],
  theory: [
    {
      heading: 'Fluid images: the essential rule',
      content: `By default an \`<img>\` renders at its natural pixel size. A 1600px photo on a 390px phone will overflow and cause horizontal scrolling.

The fix every project includes:

\`img { max-width: 100%; height: auto; display: block; }\`

- \`max-width: 100%\` – never wider than the container, but never stretched bigger than the original
- \`height: auto\` – keep the proportions when width shrinks
- \`display: block\` – removes the small gap under inline images

**width: 100%** vs **max-width: 100%**: width forces the image to always fill (it can upscale and look blurry); max-width only limits it.`,
      syntax: `img, video, svg { max-width: 100%; height: auto; display: block; }`,
    },
    {
      heading: 'aspect-ratio and object-fit',
      content: `\`aspect-ratio\` reserves a box with a fixed proportion even before the image loads (prevents layout shift, a Core Web Vital):
- \`aspect-ratio: 16 / 9\` – video shape
- \`aspect-ratio: 1\` – square

When you force an image into a box with different proportions, \`object-fit\` controls how it fills it:
- \`cover\` – fill and crop (most common for cards/avatars)
- \`contain\` – fit entirely, may leave empty bands
- \`fill\` – default, stretches/distorts

\`object-position\` chooses which part stays visible when cropping (e.g. \`top\`).`,
      syntax: `.thumb { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }`,
      tip: 'Card images of different sizes look messy. aspect-ratio + object-fit: cover makes them all uniform.',
    },
    {
      heading: 'Resolution switching: srcset and <picture> (HTML side)',
      content: `CSS can resize an image, but it can't stop a phone downloading a huge 2MB file. That's the job of HTML:

- \`srcset\` + \`sizes\` on \`<img>\` – the browser picks the best-sized file for the screen and pixel density
- \`<picture>\` with \`<source media="...">\` – **art direction**: a different crop for mobile vs desktop

For CSS backgrounds use media queries or \`image-set()\`:

\`background-image: image-set("hero.webp" 1x, "hero@2x.webp" 2x);\``,
      syntax: `<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(min-width: 768px) 50vw, 100vw"
     alt="Mountain lake">`,
    },
    {
      heading: 'CSS math: min(), max(), clamp()',
      content: `These functions choose a value at render time, and can mix units:

- \`min(a, b)\` – picks the **smaller** value. \`width: min(100%, 700px)\` = full width on phones, max 700px on desktops (replaces width + max-width).
- \`max(a, b)\` – picks the **larger**. \`padding: max(16px, 4vw)\` = never less than 16px.
- \`clamp(MIN, PREFERRED, MAX)\` – the preferred value, but never below MIN or above MAX. Equivalent to \`max(MIN, min(PREFERRED, MAX))\`.

Analogy: clamp is a thermostat – it lets the temperature follow the weather but never colder than 18° or hotter than 26°.`,
      syntax: `.container { width: min(100% - 2rem, 1100px); margin-inline: auto; }
.section  { padding-block: clamp(2rem, 6vw, 6rem); }`,
    },
    {
      heading: 'Fluid typography',
      content: `Instead of jumping font sizes at breakpoints, let text **scale smoothly** with clamp():

\`h1 { font-size: clamp(1.75rem, 1rem + 4vw, 3.5rem); }\`

- Minimum 1.75rem on small phones
- Grows with viewport width (4vw)
- Caps at 3.5rem on large screens

Always include a **rem** part in the preferred value (\`1rem + 4vw\`, not only \`4vw\`). Pure vw text **doesn't grow when users zoom**, which fails accessibility.

Readability tips:
- Body text: 1rem–1.125rem, \`line-height: 1.5–1.7\`
- Line length (measure): 45–75 characters → \`max-width: 65ch\`
- Headings: tighter line-height (1.1–1.25)

**Coming next:** Day 24 – CSS variables and calc() for theming and dark mode.`,
      syntax: `body { font-size: clamp(1rem, 0.9rem + 0.5vw, 1.2rem); line-height: 1.6; }
p { max-width: 65ch; }`,
    },
  ],
  examples: [
    {
      title: 'Fluid image vs overflowing image',
      scenario: 'See why every stylesheet needs max-width: 100% on images.',
      steps: [
        'Place two identical 1200px-wide images in a 300px container',
        'Give only the second one max-width: 100%; height: auto',
        'Run and compare',
      ],
      code: `.fluid { max-width: 100%; height: auto; display: block; }`,
      playground: {
        html: `<div class="box">
  <p>❌ No rule (overflows):</p>
  <img src="https://picsum.photos/seed/wide/1200/500" alt="Wide landscape">
  <p>✅ max-width: 100%:</p>
  <img class="fluid" src="https://picsum.photos/seed/wide/1200/500" alt="Wide landscape">
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; overflow-x: auto; }
.box { width: 300px; padding: 8px; border: 3px solid #f43f5e; }
.fluid { max-width: 100%; height: auto; display: block; }`,
      },
      result: 'The first image spills far outside the red 300px box; the second fits perfectly inside it with correct proportions.',
      explanation: 'Images default to their intrinsic width (1200px). max-width: 100% caps it at the container width; height: auto keeps the aspect ratio.',
    },
    {
      title: 'Uniform card images with aspect-ratio and object-fit',
      scenario: 'Product photos come in different shapes but the cards must look consistent.',
      steps: [
        'Add three images of different sizes',
        'Give them width: 100%, aspect-ratio: 1 and object-fit: cover',
        'Add a fourth with object-fit: contain to compare',
        'Run',
      ],
      code: `.card img { width: 100%; aspect-ratio: 1; object-fit: cover; }`,
      playground: {
        html: `<div class="row">
  <figure><img src="https://picsum.photos/seed/t1/600/300" alt=""><figcaption>cover (wide)</figcaption></figure>
  <figure><img src="https://picsum.photos/seed/t2/300/600" alt=""><figcaption>cover (tall)</figcaption></figure>
  <figure><img src="https://picsum.photos/seed/t3/400/400" alt=""><figcaption>cover (square)</figcaption></figure>
  <figure><img class="contain" src="https://picsum.photos/seed/t1/600/300" alt=""><figcaption>contain</figcaption></figure>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
figure { margin: 0; }
figure img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 10px; display: block; background: #e2e8f0; }
figure img.contain { object-fit: contain; }
figcaption { font-size: 13px; text-align: center; margin-top: 4px; }`,
      },
      result: 'Four identical square tiles. The first three are cropped to fill the square; the last shows the whole wide photo with grey bands.',
      explanation: 'aspect-ratio: 1 forces every box to be square; object-fit decides whether the photo crops (cover) or letterboxes (contain).',
    },
    {
      title: 'Fluid typography with clamp()',
      scenario: 'A hero heading that is readable on phones but big and bold on desktops, with no media queries.',
      steps: [
        'Set h1 font-size: clamp(1.75rem, 1rem + 5vw, 4rem)',
        'Set paragraph size with a gentler clamp and max-width: 60ch',
        'Run and resize the preview slowly',
      ],
      code: `h1 { font-size: clamp(1.75rem, 1rem + 5vw, 4rem); line-height: 1.1; }
p  { font-size: clamp(1rem, 0.9rem + 0.4vw, 1.25rem); max-width: 60ch; }`,
      playground: {
        html: `<section class="hero">
  <h1>Fluid type scales smoothly</h1>
  <p>Resize this preview. The heading grows and shrinks continuously between a minimum and maximum size, and the paragraph keeps a comfortable reading width of about sixty characters per line.</p>
</section>`,
        css: `body { margin: 0; font-family: Georgia, serif; }
.hero { padding: clamp(1rem, 5vw, 4rem); background: #fdf4ff; }
h1 { font-size: clamp(1.75rem, 1rem + 5vw, 4rem); line-height: 1.1; margin: 0 0 .5em; color: #86198f; }
p  { font-size: clamp(1rem, 0.9rem + 0.4vw, 1.25rem); line-height: 1.6; max-width: 60ch; }`,
      },
      result: 'A purple heading that grows smoothly as the preview widens, stopping at a sensible minimum and maximum; padding grows too.',
      explanation: 'clamp picks the middle (fluid) value until it hits a limit. Mixing rem and vw keeps text responsive and zoomable.',
    },
    {
      title: 'Container width with min() and spacing with max()',
      scenario: 'Replace the old width + max-width + padding trio with one line.',
      steps: [
        'Give .container width: min(100% - 2rem, 600px) and margin-inline: auto',
        'Give the card padding: max(12px, 3vw)',
        'Run and resize',
      ],
      code: `.container { width: min(100% - 2rem, 600px); margin-inline: auto; }
.card { padding: max(12px, 3vw); }`,
      playground: {
        html: `<div class="container">
  <div class="card">
    <h2>min() and max()</h2>
    <p>This container is never wider than 600px, and on small screens always keeps 1rem space on each side. The padding is at least 12px but grows with the viewport.</p>
  </div>
</div>`,
        css: `body { margin: 0; padding-block: 20px; font-family: system-ui, sans-serif; background: #ecfeff; }
.container { width: min(100% - 2rem, 600px); margin-inline: auto; }
.card { padding: max(12px, 3vw); background: #fff; border: 2px solid #06b6d4; border-radius: 12px; }`,
      },
      result: 'A white card centered on a cyan background, max 600px wide, with a small gutter on phones.',
      explanation: 'min() chooses the smaller of "full width minus 2rem" and 600px. max() guarantees padding never drops below 12px.',
    },
  ],
  interview: [
    { q: 'How do you make an image responsive in CSS?', a: 'img { max-width: 100%; height: auto; } so it scales down with its container but never upscales or distorts.', level: 'Easy' },
    { q: 'Difference between object-fit: cover and contain?', a: 'cover fills the box and crops overflow while keeping proportions; contain fits the whole image inside the box, possibly leaving empty space.', level: 'Easy' },
    { q: 'What does clamp() do?', a: 'clamp(MIN, PREFERRED, MAX) returns the preferred value but restricted to the range between MIN and MAX.', level: 'Easy' },
    { q: 'Rewrite width: 100%; max-width: 800px; using a math function.', a: 'width: min(100%, 800px);', level: 'Medium' },
    { q: 'Why should fluid font sizes include rem, not only vw?', a: 'vw-only text does not change when the user zooms or increases browser font size, which is an accessibility failure. Adding rem keeps it zoomable.', level: 'Hard' },
    { q: 'What is aspect-ratio used for?', a: 'To give an element a fixed width-to-height ratio, e.g. for video embeds or uniform image boxes, and to reserve space before images load, reducing layout shift (CLS).', level: 'Medium' },
    { q: 'Difference between srcset and the <picture> element?', a: 'srcset lets the browser choose among resolutions of the same image (resolution switching). <picture> with <source media> lets you serve different crops/formats under conditions you control (art direction, WebP/AVIF fallback).', level: 'Hard' },
    { q: 'What is a comfortable line length and how do you set it?', a: 'About 45–75 characters per line; use max-width: 65ch on text blocks.', level: 'Medium' },
    { q: 'Why add display: block to images?', a: 'Inline images sit on the text baseline, leaving a small gap underneath for descenders. display: block removes it.', level: 'Medium' },
    { q: 'Can you mix units inside min(), max() and clamp()?', a: 'Yes, e.g. min(100% - 2rem, 70ch) or clamp(1rem, 2vw + 0.5rem, 2rem). They also allow calc-style arithmetic inside without writing calc().', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a 16:9 responsive video placeholder box that always fills the width of its container.',
      hint: 'width: 100%; aspect-ratio: 16 / 9.',
      solution: `<style>
  .video { width: 100%; aspect-ratio: 16 / 9; background: #000; color: #fff; display: grid; place-items: center; }
</style>
<div class="video">▶ Video</div>`,
    },
    {
      task: 'Make circular avatars from rectangular photos at 96px.',
      hint: 'width/height 96px, border-radius 50%, object-fit cover.',
      solution: `<style>
  .avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; }
</style>
<img class="avatar" src="https://picsum.photos/seed/av/400/250" alt="User">`,
    },
    {
      task: 'Write a fluid type scale for h1, h2 and body using clamp().',
      hint: 'Different min/max per level.',
      solution: `<style>
  body { font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); line-height: 1.6; }
  h1 { font-size: clamp(2rem, 1.2rem + 4vw, 3.5rem); }
  h2 { font-size: clamp(1.5rem, 1.1rem + 2vw, 2.25rem); }
</style>`,
    },
    {
      task: 'Make a hero image that is 300px tall on phones, 60vh on larger screens but never more than 600px, cropped from the top.',
      hint: 'height: clamp(300px, 60vh, 600px); object-position: top.',
      solution: `<style>
  .hero-img { width: 100%; height: clamp(300px, 60vh, 600px); object-fit: cover; object-position: top; display: block; }
</style>
<img class="hero-img" src="https://picsum.photos/seed/hero/1600/900" alt="Hero">`,
    },
  ],
  quiz: [
    { question: 'Which rule prevents images from overflowing their container?', options: ['width: auto', 'max-width: 100%', 'object-fit: fill', 'overflow: visible'], answer: 1, explanation: 'max-width: 100% caps the image at the container width.' },
    { question: 'clamp(1rem, 3vw, 2rem) on a very wide screen returns…', options: ['1rem', '3vw', '2rem', '0'], answer: 2, explanation: '3vw becomes larger than 2rem, so the MAX is used.' },
    { question: 'min(100%, 700px) on a 400px wide container gives…', options: ['400px', '700px', '100px', '1100px'], answer: 0, explanation: '100% = 400px, which is smaller than 700px.' },
    { question: 'Which object-fit value crops the image to fill the box?', options: ['contain', 'fill', 'none', 'cover'], answer: 3, explanation: 'cover scales to fill and crops the excess.' },
    { question: 'What unit is ideal for setting readable line length?', options: ['vh', 'px', 'ch', '%'], answer: 2, explanation: '1ch ≈ width of the "0" character, so 65ch ≈ 65 characters.' },
  ],
};
