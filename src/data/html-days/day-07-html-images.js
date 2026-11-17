export default {
  id: 'day-07-html-images',
  title: 'HTML Images: <img>, src, alt, width, height, Image Paths',
  module: 'Module 2: Links, Images & Lists',
  day: 7,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Add images to your pages with <img>. Learn why alt text is mandatory, why width and height prevent layout jumps, which image formats to use, and how to write correct image paths.',
  objectives: [
    'Insert images with the <img> element and the src attribute',
    'Write meaningful alt text and know when to leave it empty',
    'Use width and height to prevent layout shift',
    'Write correct relative and absolute image paths',
    'Choose suitable image formats (JPG, PNG, GIF, SVG, WebP, AVIF) and make images clickable',
  ],
  theory: [
    {
      heading: 'The <img> element and src',
      content: "`<img>` embeds an image into the page. It is a **void element** (no closing tag) and is **inline** by default, meaning it sits in a line of text like a big letter.\n\nThe image is **not** inside your HTML file. The HTML only **points** to a separate image file using the **src** (source) attribute, like a photo frame that says \"put the photo from shelf 3 here\". The browser downloads the file and displays it.\n\nTwo attributes are required for valid HTML: `src` and `alt`.",
      syntax: '<img src="images/logo.png" alt="Sunrise Bakery logo">',
    },
    {
      heading: 'The alt attribute',
      content: "**alt** (alternative text) describes the image in words. It is used when:\n- A **screen reader** reads the page to a blind user\n- The image **fails to load** (wrong path, slow network), so the alt text is shown instead\n- **Search engines** index the image (Google Images uses alt text)\n\nWriting good alt text:\n1. Describe the **purpose/content** briefly: `alt=\"Red cotton kurta, front view\"`.\n2. Do not start with \"image of\" or \"picture of\"; screen readers already say \"image\".\n3. If the image is a **link or button**, describe the **action**: `alt=\"Go to home page\"`.\n4. If the image is **purely decorative** (a divider, background flourish), use an **empty alt**: `alt=\"\"`. Screen readers then skip it. Never omit alt completely: then some screen readers read the file name like \"IMG underscore 2041 dot jpg\".",
      tip: 'Interview line: "alt is mandatory for accessibility; use alt=\"\" for decorative images, not a missing alt."',
    },
    {
      heading: 'width and height',
      content: "`width` and `height` set the display size in **CSS pixels**. Write just the number: `width=\"300\"` (not `300px`).\n\nWhy set them even if CSS will resize the image? Because the browser then knows the image's **aspect ratio before it downloads**, so it reserves the correct space. Without them, text jumps down when the image finally loads. This jump is called **Cumulative Layout Shift (CLS)** and Google uses it as a ranking signal (Core Web Vitals).\n\nIf you set only width, the browser keeps the aspect ratio automatically. If you set both with the wrong ratio, the image is **stretched or squashed**.\n\nBest practice: put the image's **real** width and height in HTML, and use CSS like `max-width: 100%; height: auto;` to make it responsive.",
      syntax: '<img src="team.jpg" alt="Our team at the office" width="800" height="450">',
    },
    {
      heading: 'Image paths',
      content: "The src follows exactly the same rules as link hrefs (Day 6):\n- **Same folder**: `src=\"photo.jpg\"`\n- **Sub-folder**: `src=\"images/photo.jpg\"`\n- **Parent folder**: `src=\"../images/photo.jpg\"`\n- **Root-relative**: `src=\"/images/photo.jpg\"`\n- **Absolute URL**: `src=\"https://picsum.photos/400/300\"`\n- **Data URI**: the image data itself written inline, e.g. `src=\"data:image/svg+xml,...\"` (useful for tiny icons).\n\nBroken image checklist: wrong folder, wrong extension (.jpg vs .jpeg vs .png), wrong case (Photo.JPG vs photo.jpg on Linux servers), spaces in file names, or a typo.\n\nHotlinking (using another site's image URL directly) can break any time and may be a copyright issue; host your own images.",
      tip: 'Keep an images/ folder next to index.html and name files in lowercase with hyphens: red-kurta-front.jpg.',
    },
    {
      heading: 'Image formats',
      content: "- **JPEG/JPG**: photographs; small files, lossy compression, no transparency.\n- **PNG**: screenshots, logos, graphics needing **transparency**; lossless, bigger files.\n- **GIF**: simple **animations**, only 256 colours. Prefer video or WebP for animations today.\n- **SVG**: **vector** graphics (logos, icons): scale to any size without blurring; it is XML text (Day 24).\n- **WebP**: modern format, 25-35% smaller than JPEG/PNG, supports transparency and animation.\n- **AVIF**: newest, even smaller than WebP; supported in all modern browsers.\n\nRule of thumb: photos to WebP/AVIF/JPEG, logos and icons to SVG, screenshots to PNG/WebP.",
    },
    {
      heading: 'Clickable images, loading and title',
      content: "- **Image link**: wrap `<img>` inside `<a>`. The alt text then acts as the link text, so describe the destination.\n- **loading=\"lazy\"**: the browser delays loading images that are far down the page until the user scrolls near them. This speeds up page load. Do not lazy-load the main image visible at the top.\n- **title**: shows a tooltip on hover. It is **not** a replacement for alt.\n\nComing later: `<figure>` and `<figcaption>` for captions, and `<picture>`/`srcset` for responsive images (Extra lessons).",
      syntax: '<a href="index.html">\n  <img src="logo.svg" alt="Sunrise Bakery - Home" width="120" height="40">\n</a>\n<img src="gallery-1.jpg" alt="Chocolate cake" width="400" height="300" loading="lazy">',
    },
  ],
  examples: [
    {
      title: 'Basic image with alt, width and height',
      scenario: 'Display a product photo on a shop page.',
      steps: [
        'Create index.html',
        'Add <img> with src pointing to a photo URL',
        'Add descriptive alt text plus width and height',
        'Click Run',
      ],
      code: `<h2>Mountain Trek Backpack</h2>
<img src="https://picsum.photos/id/1018/400/250"
     alt="Green mountains under a cloudy sky"
     width="400" height="250">
<p>Perfect for weekend treks.</p>`,
      playground: {
        html: `<h2>Mountain Trek Backpack</h2>
<img src="https://picsum.photos/id/1018/400/250"
     alt="Green mountains under a cloudy sky"
     width="400" height="250">
<p>Perfect for weekend treks.</p>`,
        css: `img { max-width: 100%; height: auto; border-radius: 8px; }`,
      },
      result: 'A 400x250 landscape photo between the heading and paragraph, with rounded corners.',
      explanation: 'src gives the file location, alt describes it, width and height reserve space. The CSS makes it shrink on narrow screens while keeping its ratio.',
    },
    {
      title: 'What happens when an image is broken',
      scenario: 'See why alt text matters when the path is wrong.',
      steps: [
        'Add an image with a misspelt src and good alt text',
        'Add another broken image with no alt',
        'Click Run and compare',
        'Check the console for the error event',
      ],
      code: `<img src="imgaes/cake.jpg" alt="Chocolate birthday cake with candles" width="200" height="150">
<img src="imgaes/cake.jpg" width="200" height="150">`,
      playground: {
        html: `<p>With alt text:</p>
<img class="broken" src="imgaes/cake.jpg" alt="Chocolate birthday cake with candles" width="200" height="150">
<p>Without alt text:</p>
<img class="broken" src="imgaes/cake.jpg" width="200" height="150">`,
        css: `img { border: 1px dashed crimson; }`,
        js: `document.querySelectorAll('img.broken').forEach((img, i) => {
  img.addEventListener('error', () => console.log('Image', i + 1, 'failed to load. alt =', JSON.stringify(img.getAttribute('alt'))));
});`,
      },
      result: 'The first box shows the alt text "Chocolate birthday cake with candles"; the second shows only a broken-image icon. The console reports both failures.',
      explanation: 'The folder name is misspelt (imgaes), so both fail. The alt text tells the user (and screen readers) what should be there. Because width and height are set, the layout space is still reserved.',
    },
    {
      title: 'Aspect ratio: stretched vs correct',
      scenario: 'Understand why wrong width/height distort images.',
      steps: [
        'Show a 300x200 image at its real size',
        'Show the same image with width only',
        'Show it with a wrong width and height combination',
        'Click Run and compare',
      ],
      code: `<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="300" height="200">
<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="150">
<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="300" height="80">`,
      playground: {
        html: `<p>Correct (300x200):</p>
<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="300" height="200">
<p>Width only (150) - ratio kept:</p>
<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="150">
<p>Wrong ratio (300x80) - squashed:</p>
<img src="https://picsum.photos/id/237/300/200" alt="Black puppy" width="300" height="80">`,
      },
      result: 'The first image looks natural, the second is a smaller natural version, the third is visibly squashed.',
      explanation: 'The browser scales an image to fit the given box. When only one dimension is given, it calculates the other from the natural ratio. When both are given with the wrong ratio, it distorts the image.',
    },
    {
      title: 'Clickable logo, inline SVG data URI and lazy gallery',
      scenario: 'Build a header logo that links home and a small lazy-loaded gallery.',
      steps: [
        'Create a logo using an SVG data URI (no external file needed)',
        'Wrap it in an <a> linking to the home page',
        'Add a gallery of images with loading="lazy"',
        'Click Run and hover the logo',
      ],
      code: `<a href="#home">
  <img src="data:image/svg+xml,..." alt="Sunrise Bakery - go to home page" width="160" height="50">
</a>

<img src="https://picsum.photos/id/1080/200/150" alt="Strawberries in a bowl" width="200" height="150" loading="lazy">`,
      playground: {
        html: `<a href="#home" title="Home">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='50'%3E%3Crect width='160' height='50' rx='8' fill='%23f59e0b'/%3E%3Ctext x='80' y='32' font-size='18' text-anchor='middle' fill='white' font-family='sans-serif'%3ESunrise%3C/text%3E%3C/svg%3E"
       alt="Sunrise Bakery - go to home page" width="160" height="50">
</a>
<h3>Gallery</h3>
<img src="https://picsum.photos/id/1080/200/150" alt="Strawberries in a bowl" width="200" height="150" loading="lazy">
<img src="https://picsum.photos/id/292/200/150" alt="Fresh vegetables on a table" width="200" height="150" loading="lazy">
<img src="https://picsum.photos/id/431/200/150" alt="Cup of coffee" width="200" height="150" loading="lazy">`,
        css: `a img { display: block; }
img { margin: 4px; }`,
      },
      result: 'An orange "Sunrise" logo that is a link, followed by three gallery photos.',
      explanation: 'The logo is an SVG embedded as a data URI so no file is needed. Because it is inside <a>, its alt text describes the link destination. loading="lazy" defers off-screen images to speed up the initial load.',
    },
  ],
  interview: [
    { q: 'Which attributes are required on <img>?', a: 'src (the image location) and alt (alternative text). alt may be empty for decorative images, but it must be present.', level: 'Easy' },
    { q: 'Why is the alt attribute important?', a: 'It provides a text alternative for screen readers, is shown when the image fails to load, and helps search engines understand the image. It is required for valid, accessible HTML.', level: 'Easy' },
    { q: 'When should alt be empty?', a: 'When the image is purely decorative and conveys no information (e.g. ornamental dividers). alt="" tells screen readers to skip it. Omitting alt entirely is wrong because some readers will announce the file name.', level: 'Medium' },
    { q: 'Why should you specify width and height on images?', a: 'So the browser can calculate the aspect ratio and reserve space before the image downloads, preventing layout shift (CLS). CSS can still make the image responsive with max-width: 100%; height: auto.', level: 'Medium' },
    { q: 'Is <img> an inline or block element?', a: 'It is an inline (more precisely, a replaced inline) element. It sits on the text line, which is why a small gap may appear below it; display: block in CSS removes it.', level: 'Medium' },
    { q: 'What is the difference between alt and title on an image?', a: 'alt is the text alternative used when the image cannot be seen (accessibility, failed loads, SEO). title is advisory and shows a tooltip on hover; it is not reliably read by screen readers and cannot replace alt.', level: 'Medium' },
    { q: 'Which image format would you use for a logo and why?', a: 'SVG, because it is a vector format that stays sharp at any size, is usually small, can be styled with CSS and supports transparency. PNG or WebP is a fallback for complex logos.', level: 'Medium' },
    { q: 'What does loading="lazy" do?', a: 'It tells the browser to defer loading the image until it is near the viewport, reducing initial page load time and data usage. Do not use it on above-the-fold hero images.', level: 'Medium' },
    { q: 'How do you make an image clickable?', a: 'Wrap the <img> in an <a href="...">. The alt text should describe the link destination because it becomes the accessible name of the link.', level: 'Easy' },
    { q: 'What are common reasons for a broken image?', a: 'Wrong path or folder, typo in the file name, wrong extension, case mismatch on case-sensitive servers, spaces in names, missing file on the server, or a blocked external URL.', level: 'Easy' },
    { q: 'What is a data URI?', a: 'A URL that embeds the file data directly in the document, e.g. data:image/svg+xml,... or data:image/png;base64,.... It saves an HTTP request for very small images but increases HTML size and cannot be cached separately.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a 600x400 photo from picsum.photos with good alt text, width and height, and make it responsive with CSS.',
      hint: 'max-width: 100%; height: auto;',
      solution: `<style>
  img { max-width: 100%; height: auto; }
</style>
<img src="https://picsum.photos/id/1015/600/400" alt="River flowing through a rocky valley" width="600" height="400">`,
    },
    {
      task: 'Write alt text for: (a) a company logo linking to the home page, (b) a decorative wavy line, (c) a photo of a red saree on a model.',
      hint: 'Link images describe the destination; decorative images get empty alt.',
      solution: `<a href="index.html"><img src="logo.png" alt="TechNova - Home" width="140" height="40"></a>
<img src="wave.png" alt="" width="800" height="20">
<img src="saree.jpg" alt="Model wearing a red silk saree with gold border" width="400" height="600">`,
    },
    {
      task: 'Your page is at site/pages/gallery.html and images are in site/assets/img/. Write the img tag for beach.jpg.',
      hint: 'Go up from pages/ to site/, then into assets/img/.',
      solution: `<img src="../assets/img/beach.jpg" alt="Sunset at Goa beach" width="800" height="533">`,
    },
    {
      task: 'Build a gallery of 4 lazy-loaded thumbnails (200x200) where each thumbnail links to its full-size 800x800 version, opening in a new tab.',
      hint: 'Use picsum ids, e.g. /id/10/200/200 and /id/10/800/800.',
      solution: `<a href="https://picsum.photos/id/10/800/800" target="_blank" rel="noopener noreferrer"><img src="https://picsum.photos/id/10/200/200" alt="Forest path - open full size" width="200" height="200" loading="lazy"></a>
<a href="https://picsum.photos/id/20/800/800" target="_blank" rel="noopener noreferrer"><img src="https://picsum.photos/id/20/200/200" alt="Desk with notebook - open full size" width="200" height="200" loading="lazy"></a>
<a href="https://picsum.photos/id/30/800/800" target="_blank" rel="noopener noreferrer"><img src="https://picsum.photos/id/30/200/200" alt="Coffee mug - open full size" width="200" height="200" loading="lazy"></a>
<a href="https://picsum.photos/id/40/800/800" target="_blank" rel="noopener noreferrer"><img src="https://picsum.photos/id/40/200/200" alt="Cat portrait - open full size" width="200" height="200" loading="lazy"></a>`,
    },
    {
      task: 'Find and fix the errors: <img src="Images\\Photo 1.JPG" width="300px"></img>',
      hint: 'Forward slashes, no spaces, lowercase, numbers without px, add alt, no closing tag.',
      solution: `<img src="images/photo-1.jpg" alt="Family picnic in the park" width="300" height="200">`,
    },
  ],
  quiz: [
    { question: 'Which attribute provides the image file location?', options: ['href', 'src', 'alt', 'link'], answer: 1, explanation: 'src (source) points to the image file.' },
    { question: 'What alt value should a purely decorative image have?', options: ['alt="decorative"', 'No alt attribute', 'alt="image"', 'alt=""'], answer: 3, explanation: 'An empty alt tells assistive technology to ignore the image.' },
    { question: 'How do you correctly write a width of 300 pixels in HTML?', options: ['width="300"', 'width="300px"', 'width=300px;', 'size="300"'], answer: 0, explanation: 'The width attribute takes a number of CSS pixels without units.' },
    { question: 'Which format is best for a logo that must stay sharp at every size?', options: ['JPEG', 'GIF', 'SVG', 'BMP'], answer: 2, explanation: 'SVG is a vector format and scales without quality loss.' },
    { question: 'Why should width and height be set on images?', options: ['To make images load faster from the server', 'To prevent layout shift while the image loads', 'Because alt requires them', 'To enable lazy loading'], answer: 1, explanation: 'They let the browser reserve the right space before the image arrives.' },
  ],
};
