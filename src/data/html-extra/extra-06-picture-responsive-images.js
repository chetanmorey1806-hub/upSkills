export default {
  id: 'extra-06-picture-responsive-images',
  title: 'Picture Tag and Responsive Images: srcset, sizes, <picture> and <source>',
  module: 'Extra: Elements & Attributes',
  extraNo: 6,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Responsive images let the browser download the right image for each screen: smaller files for phones, sharper files for high-density displays, different crops for different layouts and modern formats like AVIF/WebP when supported. This makes pages faster and better looking.',
  objectives: [
    'Explain the problem responsive images solve (performance and quality)',
    'Use srcset with x descriptors for high-density screens',
    'Use srcset with w descriptors plus sizes for fluid layouts',
    'Use <picture> with <source media> for art direction and <source type> for modern formats',
    'Combine responsive images with loading="lazy", width/height and alt',
  ],
  theory: [
    {
      heading: 'The problem: one image does not fit all',
      content: `If you use one huge 2400px photo everywhere, a phone on mobile data downloads megabytes it cannot even display. If you use a small 400px photo, it looks blurry on a large or Retina screen.

Responsive images solve this by giving the browser a **menu** of image files and some hints. The browser then picks the best one for the device, screen density and network. It is like a restaurant offering small, medium and large portions instead of serving everyone the large one.

There are two different needs:
1. **Resolution switching** – same picture, different sizes → \`srcset\` + \`sizes\` on \`<img>\`.
2. **Art direction** – a different crop or image for different layouts, or a different file format → \`<picture>\` with \`<source>\`.`,
    },
    {
      heading: 'srcset with x descriptors (pixel density)',
      content: `For images shown at a **fixed CSS size** (like a 200px logo or avatar), give versions for 1x, 2x and 3x screens. A "2x" phone has two device pixels per CSS pixel, so it needs a 400px file to look sharp at 200px.

The browser picks based on \`devicePixelRatio\`. \`src\` is the fallback for very old browsers.`,
      syntax: `<img src="avatar-200.jpg"
     srcset="avatar-200.jpg 1x, avatar-400.jpg 2x, avatar-600.jpg 3x"
     alt="Profile photo of Asha" width="200" height="200">`,
    },
    {
      heading: 'srcset with w descriptors and sizes',
      content: `For images that change width with the layout (e.g. full width on mobile, half width on desktop) list each file with its **real pixel width** using \`w\`, and tell the browser how wide the image will be displayed with \`sizes\`.

\`sizes\` is a list of "media condition + width", checked in order; the last item has no condition and is the default.

The browser calculates: displayed width × device pixel ratio, then picks the smallest file that is big enough. For example, \`sizes="(min-width: 800px) 50vw, 100vw"\` on a 400px wide 2x phone → needs 400 × 2 = 800px → picks the 800w file.`,
      syntax: `<img src="photo-800.jpg"
     srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
     sizes="(min-width: 800px) 50vw, 100vw"
     alt="Team at the hackathon" width="1600" height="900">`,
      tip: 'Without sizes, the browser assumes 100vw. Also, you cannot mix x and w descriptors in one srcset.',
    },
    {
      heading: '<picture> for art direction and formats',
      content: `\`<picture>\` wraps one or more \`<source>\` elements and **one required \`<img>\`** at the end. The browser uses the **first \`<source>\` that matches**; if none match, it uses the \`<img>\`.

- \`<source media="(max-width: 600px)" srcset="crop-square.jpg">\` → **art direction**: a tightly cropped image on small screens, a wide banner on large screens.
- \`<source type="image/avif" srcset="photo.avif">\` → **format switching**: browsers that support AVIF use it, others skip to the next source or the img.

The \`<img>\` is what is actually displayed, so \`alt\`, \`width\`, \`height\`, \`loading\` and CSS all go on the \`<img>\`, not on \`<picture>\`.`,
      syntax: `<picture>
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="Sunset over the city" width="1200" height="600">
</picture>`,
    },
    {
      heading: 'Performance best practices',
      content: `- Always set \`width\` and \`height\` (the intrinsic size) so the browser reserves space and the layout does not jump (CLS). Use CSS \`max-width: 100%; height: auto;\` to keep it responsive.
- Add \`loading="lazy"\` to images below the fold so they load only when the user scrolls near them. Do **not** lazy-load the main hero image.
- Add \`decoding="async"\` for non-critical images.
- Prefer modern formats (AVIF, WebP) with a JPEG/PNG fallback.
- Use \`fetchpriority="high"\` on the most important (LCP) image.`,
      tip: 'Common mistake: putting alt on <picture> or <source>. Only <img> has alt.',
    },
  ],
  examples: [
    {
      title: 'Resolution switching with srcset and sizes',
      scenario: 'Show a photo that is full width on small screens and 50% on wide screens, and log which file the browser chose.',
      steps: [
        'Create index.html',
        'Add an <img> with srcset of 400w, 800w and 1600w versions (picsum.photos sizes)',
        'Add sizes="(min-width: 800px) 50vw, 100vw"',
        'In JS, log img.currentSrc after it loads',
        'Click Run, then resize the preview/zoom and reload to see a different choice',
      ],
      code: `<img src="https://picsum.photos/id/1015/800/450"
     srcset="https://picsum.photos/id/1015/400/225 400w,
             https://picsum.photos/id/1015/800/450 800w,
             https://picsum.photos/id/1015/1600/900 1600w"
     sizes="(min-width: 800px) 50vw, 100vw"
     alt="River flowing through a mountain valley"
     width="1600" height="900">`,
      playground: {
        html: `<img id="photo"
     src="https://picsum.photos/id/1015/800/450"
     srcset="https://picsum.photos/id/1015/400/225 400w,
             https://picsum.photos/id/1015/800/450 800w,
             https://picsum.photos/id/1015/1600/900 1600w"
     sizes="(min-width: 800px) 50vw, 100vw"
     alt="River flowing through a mountain valley"
     width="1600" height="900">
<p id="info">Loading…</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
@media (min-width: 800px) { img { width: 50vw; } }`,
        js: `const img = document.getElementById('photo');
function report() {
  const msg = 'Viewport: ' + window.innerWidth + 'px, DPR: ' + window.devicePixelRatio +
    ' -> chose: ' + img.currentSrc.split('/id/1015/')[1];
  document.getElementById('info').textContent = msg;
  console.log(msg);
}
if (img.complete) report(); else img.addEventListener('load', report);`,
      },
      result: 'The photo displays and the text shows which file was chosen, e.g. "Viewport: 500px, DPR: 2 -> chose: 1600/900" or "800/450" depending on your screen.',
      explanation: 'The browser computes needed width = slot width (from sizes) × devicePixelRatio and picks the smallest candidate that covers it. currentSrc tells you which candidate it actually used. Note: once a large image is cached the browser may keep using it.',
    },
    {
      title: 'Art direction with <picture> and media',
      scenario: 'On narrow screens show a square close-up; on wide screens show a wide banner of the same scene.',
      steps: [
        'Create a <picture> element',
        'Add <source media="(max-width: 500px)"> with a square image',
        'Add a fallback <img> with the wide banner and alt text',
        'Click Run, then make the preview narrower than 500px (or open devtools device mode) and rerun',
      ],
      code: `<picture>
  <source media="(max-width: 500px)" srcset="https://picsum.photos/id/1025/400/400">
  <img src="https://picsum.photos/id/1025/1000/400" alt="A pug wrapped in a blanket" width="1000" height="400">
</picture>`,
      playground: {
        html: `<picture>
  <source media="(max-width: 500px)" srcset="https://picsum.photos/id/1025/400/400">
  <img id="pic" src="https://picsum.photos/id/1025/1000/400" alt="A pug wrapped in a blanket" width="1000" height="400">
</picture>
<p id="which"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }`,
        js: `const img = document.getElementById('pic');
const show = () => {
  const square = img.currentSrc.includes('400/400');
  const text = (square ? 'Square crop (narrow screen)' : 'Wide banner (wide screen)') + ' – viewport ' + window.innerWidth + 'px';
  document.getElementById('which').textContent = text;
  console.log(text);
};
img.addEventListener('load', show);
if (img.complete) show();`,
      },
      result: 'Wide previews show a 1000×400 banner; previews 500px or narrower show a square close-up. The paragraph says which one was used.',
      explanation: 'The first <source> whose media query matches wins. If none match, the <img> src is used. The <img> is always the element that renders, so alt and sizing go on it.',
    },
    {
      title: 'Format switching with type and lazy loading',
      scenario: 'Serve WebP to browsers that support it, fall back to JPEG, and lazy-load images further down the page.',
      steps: [
        'Create a <picture> with <source type="image/webp">',
        'Add a JPEG <img> fallback with loading="lazy" and decoding="async"',
        'Add a tall spacer so the image starts below the fold',
        'In JS, log when the image actually loads',
        'Click Run and scroll down',
      ],
      code: `<picture>
  <source type="image/webp" srcset="https://picsum.photos/id/1043/600/350.webp">
  <img src="https://picsum.photos/id/1043/600/350.jpg" alt="Old wooden boat on a calm lake"
       width="600" height="350" loading="lazy" decoding="async">
</picture>`,
      playground: {
        html: `<p>Scroll down ↓ The image below is lazy-loaded.</p>
<div style="height: 1200px; background: linear-gradient(#fff, #eef);"></div>
<picture>
  <source type="image/webp" srcset="https://picsum.photos/id/1043/600/350.webp">
  <img id="lazy" src="https://picsum.photos/id/1043/600/350.jpg" alt="Old wooden boat on a calm lake"
       width="600" height="350" loading="lazy" decoding="async">
</picture>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
img { max-width: 100%; height: auto; display: block; background: #ddd; }`,
        js: `const img = document.getElementById('lazy');
console.log('Page ready. Image loaded yet?', img.complete && img.naturalWidth > 0);
img.addEventListener('load', () => {
  console.log('Lazy image loaded now. Format used:', img.currentSrc.endsWith('.webp') ? 'WebP' : 'JPEG');
});`,
      },
      result: 'At first the console says the image is not loaded. When you scroll near it, it loads and the console says "WebP" in modern browsers.',
      explanation: 'type="image/webp" lets browsers skip the source if they cannot decode WebP. loading="lazy" defers the download until the image is close to the viewport. width/height reserve space so nothing jumps.',
    },
  ],
  interview: [
    { q: 'What problem do responsive images solve?', a: 'They let the browser choose an appropriately sized/formatted/cropped image per device so phones do not download huge files (performance) and high-density screens get sharp images (quality).', level: 'Easy' },
    { q: 'What is the difference between x and w descriptors in srcset?', a: 'x descriptors (1x, 2x) describe pixel density for fixed-size images. w descriptors (400w) give each file\'s real width so the browser can choose based on layout width (from sizes) and DPR. They cannot be mixed in one srcset.', level: 'Medium' },
    { q: 'What does the sizes attribute do?', a: 'It tells the browser how wide the image will be displayed under various media conditions, before CSS is loaded, so it can pick from a w-based srcset. Default is 100vw.', level: 'Medium' },
    { q: 'When should you use <picture> instead of just srcset?', a: 'For art direction (different crops/images per breakpoint using media) or format switching (AVIF/WebP with fallback using type). For the same image at different sizes, srcset+sizes on <img> is enough.', level: 'Medium' },
    { q: 'Why is the <img> inside <picture> mandatory?', a: 'The <img> is the element that actually renders and carries alt, width, height, loading; <source> only provides candidates. Without <img> nothing is displayed.', level: 'Medium' },
    { q: 'How does the browser choose between multiple <source> elements?', a: 'It goes in order and uses the first source whose media matches and whose type it supports. If none qualify, it falls back to the <img>.', level: 'Medium' },
    { q: 'Why add width and height attributes to responsive images?', a: 'They give the aspect ratio so the browser can reserve space before the image loads, preventing layout shift (CLS). CSS height:auto keeps it responsive.', level: 'Medium' },
    { q: 'What does loading="lazy" do and when should you avoid it?', a: 'It defers loading until the image is near the viewport, saving bandwidth. Avoid it for above-the-fold or LCP images like the hero, because it delays them.', level: 'Medium' },
    { q: 'How can you find which srcset candidate was used?', a: 'Read img.currentSrc in JavaScript or inspect the image in DevTools (Network panel or the element\'s currentSrc).', level: 'Hard' },
    { q: 'Given sizes="(min-width: 800px) 50vw, 100vw" on a 1200px wide 1x screen, how wide is the slot?', a: '600px (50vw of 1200). The browser picks the smallest candidate ≥ 600px, e.g. 800w.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a 150px logo that looks sharp on 1x, 2x and 3x screens.',
      hint: 'Use x descriptors with 150, 300 and 450 pixel files.',
      solution: `<img src="https://picsum.photos/id/237/150/150"
     srcset="https://picsum.photos/id/237/150/150 1x,
             https://picsum.photos/id/237/300/300 2x,
             https://picsum.photos/id/237/450/450 3x"
     alt="Company logo" width="150" height="150">`,
    },
    {
      task: 'Write an <img> that is 100vw on mobile, 50vw from 700px and 33vw from 1100px, with 400w/800w/1200w candidates.',
      hint: 'List sizes from the largest media condition down.',
      solution: `<img src="https://picsum.photos/id/1011/800/500"
     srcset="https://picsum.photos/id/1011/400/250 400w,
             https://picsum.photos/id/1011/800/500 800w,
             https://picsum.photos/id/1011/1200/750 1200w"
     sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
     alt="Woman in a canoe on a lake" width="1200" height="750">`,
    },
    {
      task: 'Use <picture> to show a portrait crop below 600px and a landscape image otherwise.',
      hint: '<source media="(max-width: 600px)">',
      solution: `<picture>
  <source media="(max-width: 600px)" srcset="https://picsum.photos/id/1005/400/600">
  <img src="https://picsum.photos/id/1005/1200/600" alt="Man standing on a hill" width="1200" height="600">
</picture>`,
    },
    {
      task: 'Serve AVIF, then WebP, then JPEG for one image, lazy-loaded.',
      hint: 'Order sources from best format to fallback.',
      solution: `<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" alt="Product photo" width="800" height="600" loading="lazy">
</picture>`,
    },
  ],
  quiz: [
    { question: 'Which descriptor tells the browser the real width of a candidate image?', options: ['400px', '400w', '2x', '400vw'], answer: 1, explanation: 'w descriptors give the intrinsic width of each file.' },
    { question: 'Which element inside <picture> is required?', options: ['<source>', '<figure>', '<img>', '<figcaption>'], answer: 2, explanation: 'One <img> is required; it renders the chosen image.' },
    { question: 'What is "art direction"?', options: ['Using different crops/images for different layouts', 'Adding filters to images', 'Lazy loading images', 'Adding alt text'], answer: 0, explanation: 'Art direction changes the image content/crop per breakpoint, done with <picture> and media.' },
    { question: 'If sizes is omitted with a w-based srcset, what does the browser assume?', options: ['50vw', 'The image natural width', '0', '100vw'], answer: 3, explanation: 'The default slot size is 100vw.' },
    { question: 'Where should the alt attribute go in a <picture>?', options: ['On <picture>', 'On each <source>', 'On the <img>', 'Nowhere'], answer: 2, explanation: 'Only <img> supports alt.' },
  ],
};
