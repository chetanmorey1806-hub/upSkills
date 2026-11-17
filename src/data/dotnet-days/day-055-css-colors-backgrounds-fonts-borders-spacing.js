const colorsHtml = `<div class="swatch named">named: tomato</div>
<div class="swatch hex">hex: #1e40af</div>
<div class="swatch rgb">rgb(22, 163, 74)</div>
<div class="swatch rgba">rgba(22, 163, 74, 0.4)</div>
<div class="swatch hsl">hsl(280, 70%, 50%)</div>
<div class="swatch current">currentColor border</div>`;

const colorsCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.swatch { padding: 10px; margin: 6px 0; color: white; border-radius: 6px; }
.named   { background-color: tomato; }
.hex     { background-color: #1e40af; }
.rgb     { background-color: rgb(22, 163, 74); }
.rgba    { background-color: rgba(22, 163, 74, 0.4); color: #14532d; }
.hsl     { background-color: hsl(280, 70%, 50%); }
.current { color: crimson; background: white; border: 3px solid currentColor; }`;

const colorsJs = `document.querySelectorAll('.swatch').forEach(function (el) {
  console.log(el.className.replace('swatch ', '') + ' -> ' + getComputedStyle(el).backgroundColor);
});`;

const bgHtml = `<section class="hero">
  <h1>Welcome to Skyline Academy</h1>
  <p>Learn .NET Full Stack in 120 days</p>
</section>
<div class="pattern">Repeating striped background (no image file needed)</div>`;

const bgCss = `body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; }
.hero {
  height: 220px;
  color: white;
  text-align: center;
  padding-top: 60px;
  box-sizing: border-box;
  /* gradient overlay on top of a photo: two layers separated by a comma */
  background-image: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)),
                    url("https://picsum.photos/id/1048/900/400");
  background-size: cover;          /* fill the box, crop extra */
  background-position: center;     /* keep the middle visible */
  background-repeat: no-repeat;
}
.hero h1 { margin: 0 0 8px; }
.pattern {
  margin: 16px;
  padding: 20px;
  background: repeating-linear-gradient(45deg, #e0f2fe 0 10px, #bae6fd 10px 20px);
  border-radius: 8px;
}`;

const textHtml = `<h1 class="title">Typography Basics</h1>
<p class="lead">CSS controls font family, size, weight, style, spacing and alignment.</p>
<p class="justify">Justified text stretches every line so both the left and the right edge are straight, just like a newspaper column. It is fine for long paragraphs but can create large gaps on narrow screens.</p>
<p class="caps">transform me to capitals</p>
<a href="#" class="plain">A link without underline</a>
<p class="shadow">Text with a shadow</p>
<p class="ellipsis">This very long sentence will be cut with three dots because it does not fit in one line of the box.</p>`;

const textCss = `@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap");
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #1f2937; }
.title   { font-family: "Poppins", sans-serif; font-size: 2rem; font-weight: 700; letter-spacing: 1px; text-align: center; }
.lead    { font-size: 1.25rem; font-style: italic; color: #4b5563; }
.justify { text-align: justify; width: 320px; }
.caps    { text-transform: uppercase; word-spacing: 6px; }
.plain   { text-decoration: none; color: #2563eb; font-weight: 600; }
.plain:hover { text-decoration: underline; }
.shadow  { font-size: 24px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4); }
.ellipsis { width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px dashed #9ca3af; }`;

const textJs = `const t = document.querySelector('.title');
const s = getComputedStyle(t);
console.log('title font-size: ' + s.fontSize);
console.log('title font-weight: ' + s.fontWeight);
console.log('body font-size: ' + getComputedStyle(document.body).fontSize);`;

const spacingHtml = `<div class="outer">
  <div class="box">margin 20px | border 4px | padding 16px</div>
</div>
<div class="row">
  <div class="tag solid">solid</div>
  <div class="tag dashed">dashed</div>
  <div class="tag dotted">dotted</div>
  <div class="tag double">double</div>
  <div class="tag pill">pill</div>
</div>
<div class="center">margin: 0 auto centers me</div>`;

const spacingCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.outer { background: #fef3c7; overflow: auto; }      /* yellow = margin area of .box */
.box {
  margin: 20px;                 /* outside the border */
  border: 4px solid #2563eb;    /* width style color */
  padding: 16px;                /* inside the border */
  background: #dbeafe;          /* background covers content + padding */
}
.row { display: flex; gap: 10px; margin: 16px 0; }
.tag { padding: 6px 12px; }
.solid  { border: 2px solid #16a34a; }
.dashed { border: 2px dashed #dc2626; }
.dotted { border: 3px dotted #9333ea; }
.double { border: 4px double #0f172a; }
.pill   { border: 2px solid #0891b2; border-radius: 999px; }
.center { width: 260px; margin: 0 auto; padding: 10px; text-align: center; border-top: 4px solid teal; border-bottom: 1px solid #ccc; }`;

const spacingJs = `const b = getComputedStyle(document.querySelector('.box'));
console.log('margin: ' + b.marginTop + ', border: ' + b.borderTopWidth + ', padding: ' + b.paddingTop);`;

const cardHtml = `<div class="profile-card">
  <div class="cover"></div>
  <img class="avatar" src="https://picsum.photos/id/64/200/200" alt="Riya Sharma">
  <h2 class="name">Riya Sharma</h2>
  <p class="role">.NET Full Stack Developer</p>
  <p class="bio">I build ASP.NET Core Web APIs with SQL Server and React front ends.</p>
  <ul class="stats">
    <li><strong>42</strong><span>Projects</span></li>
    <li><strong>8</strong><span>Certificates</span></li>
    <li><strong>4.9</strong><span>Rating</span></li>
  </ul>
  <a class="btn" href="#">Contact Me</a>
</div>`;

const cardCss = `* { box-sizing: border-box; }
body { margin: 0; padding: 30px 16px; background: #e2e8f0; font-family: "Segoe UI", Arial, sans-serif; }
.profile-card {
  max-width: 320px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
}
.cover { height: 90px; background: linear-gradient(135deg, #2563eb, #7c3aed); }
.avatar {
  width: 100px; height: 100px;
  margin-top: -50px;                 /* pull up over the cover */
  border: 4px solid #ffffff;
  border-radius: 50%;                /* circle */
  object-fit: cover;
}
.name { margin: 8px 0 0; font-size: 22px; color: #0f172a; }
.role { margin: 4px 0 12px; color: #7c3aed; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
.bio  { margin: 0 20px 16px; color: #475569; line-height: 1.5; font-size: 14px; }
.stats { list-style: none; margin: 0; padding: 12px 0; display: flex; justify-content: space-around;
         border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
.stats strong { display: block; font-size: 18px; color: #0f172a; }
.stats span { font-size: 12px; color: #64748b; }
.btn { display: inline-block; margin: 16px 0 20px; padding: 10px 24px; background: #2563eb; color: #ffffff;
       text-decoration: none; border-radius: 999px; font-weight: 600; }
.btn:hover { background: #1d4ed8; }`;

export default {
  id: 'day-055-css-colors-backgrounds-fonts-borders-spacing',
  title: 'CSS Colors, Backgrounds, Fonts, Text, Borders, Margins and Padding',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 55,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn every common way to write colours, add background colours, images and gradients, control fonts and text, draw borders with rounded corners, and space elements with margin and padding; then design a profile card.',
  objectives: [
    'Write colours as names, HEX, RGB/RGBA and HSL and choose readable contrast',
    'Use background-color, background-image, gradients, size, position and repeat',
    'Style text with font-family, font-size units, weight, line-height, alignment, decoration and transform',
    'Draw borders, rounded corners and shadows and use margin/padding shorthand correctly',
    'Build a complete, reusable profile card component',
  ],
  theory: [
    {
      heading: 'Colours in CSS',
      content: "CSS accepts colours in several formats. All of these work for `color` (text), `background-color`, `border-color` and more.\n\n- **Named**: `red`, `tomato`, `teal` (about 140 names).\n- **HEX**: `#RRGGBB` in hexadecimal, e.g. `#1e40af`. Short form `#fff` = `#ffffff`. 8-digit `#1e40af80` adds alpha.\n- **RGB / RGBA**: `rgb(22, 163, 74)`; `rgba(22, 163, 74, 0.4)` adds opacity 0 (transparent) to 1 (solid). Modern syntax: `rgb(22 163 74 / 40%)`.\n- **HSL**: `hsl(hue 0-360, saturation %, lightness %)`; easy to make lighter/darker shades of one colour.\n- **currentColor**: uses the element's current text colour; **transparent**: fully see-through.\n\n`opacity: 0.5` makes the WHOLE element (including its text and children) see-through, while `rgba` affects only that one colour.",
      syntax: 'color: #1e40af;\nbackground-color: rgba(0, 0, 0, 0.5);\nborder-color: hsl(200, 80%, 40%);',
      tip: 'Keep good contrast: dark text on light backgrounds (at least 4.5:1 ratio for normal text). Chrome DevTools shows the contrast ratio when you click a colour swatch.',
    },
    {
      heading: 'Backgrounds and gradients',
      content: "- `background-color`: fills the content + padding area.\n- `background-image: url(\"img/banner.jpg\")`: in ASP.NET Core put images under `wwwroot/images` and use a path relative to the CSS file.\n- `background-repeat`: `repeat` (default), `no-repeat`, `repeat-x`, `repeat-y`.\n- `background-size`: `cover` (fill, may crop), `contain` (whole image visible, may leave gaps), or `200px 100px`.\n- `background-position`: `center`, `top right`, `50% 50%`.\n- `background-attachment: fixed`: parallax effect.\n- **Gradients** are generated images: `linear-gradient(135deg, #2563eb, #7c3aed)`, `radial-gradient(circle, white, skyblue)`, `repeating-linear-gradient(...)`.\n- Multiple layers are separated by commas; the FIRST layer is on top (great for a dark overlay on a photo).\n- Shorthand: `background: #000 url(a.jpg) no-repeat center / cover;`",
      syntax: '.hero {\n  background: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url("../images/hero.jpg") center / cover no-repeat;\n}',
    },
    {
      heading: 'Fonts and CSS units',
      content: "- `font-family`: a list of fonts with a generic fallback at the end: `\"Segoe UI\", Arial, sans-serif`. Quote names with spaces.\n- **Web fonts**: link Google Fonts (`<link href=\"https://fonts.googleapis.com/css2?family=Poppins&display=swap\" rel=\"stylesheet\">`) or `@font-face` with your own font file.\n- `font-size` units: `px` (fixed), `em` (relative to the parent font size), `rem` (relative to the root `<html>` font size, usually 16px, so `2rem` = 32px), `%`, `vw` (1% of viewport width).\n- `font-weight`: `normal` (400), `bold` (700), or 100-900.\n- `font-style`: `normal`, `italic`.\n- `line-height`: unitless like `1.5` is best (1.5 times the font size).\n- Shorthand: `font: italic 700 18px/1.5 Arial, sans-serif;` (style weight size/line-height family).",
      tip: 'Prefer rem for font sizes: users who increase the browser default font size get bigger text everywhere.',
    },
    {
      heading: 'Text properties',
      content: "- `text-align`: `left`, `right`, `center`, `justify`.\n- `text-decoration`: `none` (remove link underline), `underline`, `line-through`, `overline`.\n- `text-transform`: `uppercase`, `lowercase`, `capitalize`.\n- `letter-spacing`, `word-spacing`: space between letters / words.\n- `text-indent`: indent the first line.\n- `text-shadow: x y blur color`.\n- `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis`: cut long text with ...\n- `vertical-align`: aligns inline items (e.g. icons next to text).",
    },
    {
      heading: 'Borders, radius and shadows',
      content: "- `border: width style color` e.g. `2px solid #2563eb`. **Style is required**; without it no border is drawn. Styles: `solid`, `dashed`, `dotted`, `double`, `groove`, `none`.\n- Individual sides: `border-top`, `border-left: 4px solid teal`.\n- `border-radius: 8px` rounds corners; `50%` on a square makes a circle; `999px` makes a pill button.\n- `box-shadow: x y blur spread color` (`inset` for inner shadow), e.g. `0 10px 25px rgba(0,0,0,.15)`.\n- `outline` looks like a border but takes no space; browsers use it to show keyboard focus, so never remove it without a replacement.",
      syntax: '.card {\n  border: 1px solid #cbd5e1;\n  border-radius: 12px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}',
    },
    {
      heading: 'Margin and padding (shorthand rules)',
      content: "- **Padding** = space INSIDE the border (between border and content). Takes the element's background colour.\n- **Margin** = space OUTSIDE the border (between this element and its neighbours). Always transparent.\n\nShorthand, clockwise from the top (Top, Right, Bottom, Left = \"TRouBLe\"):\n- `margin: 10px;` all four\n- `margin: 10px 20px;` top/bottom 10, left/right 20\n- `margin: 10px 20px 30px;` top 10, left/right 20, bottom 30\n- `margin: 10px 20px 30px 40px;` top right bottom left\n\n`margin: 0 auto;` centers a block that has a width. Margins may be negative (pull an element up). **Margin collapsing**: vertical margins of stacked blocks merge into the larger one (20px + 30px = 30px gap, not 50px). Padding never collapses and cannot be negative.",
      tip: 'Full box model details (content, padding, border, margin, box-sizing) come on Day 56.',
    },
  ],
  examples: [
    {
      title: 'Five ways to write a colour',
      scenario: 'Compare named, HEX, RGB, RGBA, HSL and currentColor side by side and read the computed values.',
      steps: ['Create colors.html and colors.css in VS Code (or wwwroot/css in an ASP.NET Core project)', 'Add six divs, each with a class for one colour format', 'Open with Live Server / the browser and inspect with F12', 'Read the console: the browser converts every format to rgb()'],
      code: colorsCss,
      playground: { html: colorsHtml, css: colorsCss, js: colorsJs },
      result: 'Six coloured bars (tomato, dark blue, green, light transparent green, purple, white with a crimson border).\nConsole:\nnamed -> rgb(255, 99, 71)\nhex -> rgb(30, 64, 175)\nrgb -> rgb(22, 163, 74)\nrgba -> rgba(22, 163, 74, 0.4)\nhsl -> rgb(157, 38, 217)\ncurrent -> rgb(255, 255, 255)',
      explanation: 'Every format is converted to rgb()/rgba() internally. hsl(280, 70%, 50%) works out to rgb(157, 38, 217). currentColor makes the border use the text colour crimson, so changing color later changes the border automatically.',
    },
    {
      title: 'Hero banner with background image, overlay and gradient',
      scenario: 'Create the top banner of a training institute home page: a photo darkened by a gradient so white text is readable.',
      steps: ['Create hero.html with a section.hero containing h1 and p', 'Add background-image with two layers: a semi-transparent gradient and a photo', 'Set background-size: cover and background-position: center', 'Resize the browser and see the image always fills the banner'],
      code: bgCss,
      playground: { html: bgHtml, css: bgCss, js: '' },
      result: 'A 220px tall banner with a darkened photo filling the full width and centred white heading and text. Below it a box with a light-blue diagonal striped background.',
      explanation: 'The first background layer (the rgba gradient) is painted on top of the second (the photo). cover scales the image so it always fills the box. repeating-linear-gradient creates stripes without any image file.',
    },
    {
      title: 'Fonts and text styling',
      scenario: 'Style headings and paragraphs for a blog page using a Google Font, rem units and text properties.',
      steps: ['Create text.html with heading and paragraphs', 'Import Poppins from Google Fonts at the top of the CSS', 'Apply font, alignment, transform, decoration, shadow and ellipsis rules', 'Hover the link; narrow the window to see the ellipsis'],
      code: textCss,
      playground: { html: textHtml, css: textCss, js: textJs },
      result: 'Centred bold Poppins heading, italic grey lead text, a justified paragraph, an upper-case line, a non-underlined blue link (underline on hover), shadowed text, and a single line cut with "...".\nConsole:\ntitle font-size: 32px\ntitle font-weight: 700\nbody font-size: 16px',
      explanation: '2rem = 2 x 16px (root font size) = 32px. The ellipsis needs all three: white-space: nowrap, overflow: hidden and text-overflow: ellipsis, plus a width.',
    },
    {
      title: 'Borders, margin and padding',
      scenario: 'Visualise margin vs padding and try every border style.',
      steps: ['Create spacing.html', 'Give .box a margin, border and padding and different background colours on parent and box', 'Add the border style tags and the centred block', 'Open F12 > Elements > Computed to see the box diagram'],
      code: spacingCss,
      playground: { html: spacingHtml, css: spacingCss, js: spacingJs },
      result: 'A light-blue box with a 4px blue border sitting 20px inside a yellow area (the margin), with 16px of blue space between border and text (the padding). A row of tags with solid, dashed, dotted, double and pill borders, and a centred block with a teal top border.\nConsole:\nmargin: 20px, border: 4px, padding: 16px',
      explanation: 'The background of .box covers content + padding but not the margin, so the yellow parent shows through the margin. margin: 0 auto centres a block that has a fixed width.',
    },
    {
      title: 'Project: Design a profile card',
      scenario: 'Day 55 task: a student/developer profile card with a gradient cover, circular photo, stats and a button.',
      steps: ['Create profile.html and profile.css (or add to wwwroot/css/site.css in an MVC project)', 'Write the HTML: cover div, img, name, role, bio, stats list, button', 'Style the card: max-width, auto margins, border-radius, overflow hidden, box-shadow', 'Make the avatar a circle with border-radius: 50% and pull it up with a negative margin', 'Run and hover the button'],
      code: '<!-- profile.html -->\n' + cardHtml + '\n\n/* profile.css */\n' + cardCss,
      playground: { html: cardHtml, css: cardCss, js: '' },
      result: 'A centred white card with rounded corners and a soft shadow: a blue-purple gradient strip on top, a circular photo with a white ring overlapping the strip, name "Riya Sharma", purple upper-case role, grey bio, three stats (42 Projects, 8 Certificates, 4.9 Rating) between thin lines, and a blue pill "Contact Me" button that darkens on hover.',
      explanation: 'overflow: hidden clips the cover to the rounded corners. margin-top: -50px (half the avatar height) makes the photo overlap the cover. object-fit: cover keeps the photo from stretching. The stats use display: flex (Day 57) to sit in a row.',
    },
  ],
  interview: [
    { q: 'Name the ways to specify a colour in CSS.', a: 'Named colours, HEX (#rrggbb / #rgb / #rrggbbaa), rgb()/rgba(), hsl()/hsla(), currentColor and transparent (plus newer functions like oklch()).', level: 'Easy' },
    { q: 'Difference between opacity: 0.5 and rgba(..., 0.5)?', a: 'opacity makes the whole element including text and children semi-transparent; rgba makes only that one colour (e.g. the background) transparent.', level: 'Medium' },
    { q: 'background-size: cover vs contain?', a: 'cover scales the image to fill the whole box (some parts may be cropped); contain scales it to fit entirely inside (empty space may remain).', level: 'Medium' },
    { q: 'Difference between margin and padding?', a: 'Padding is inside the border and shows the element background; margin is outside the border, transparent, can be negative and vertical margins can collapse.', level: 'Easy' },
    { q: 'What does margin: 10px 20px 30px mean?', a: 'top 10px, left and right 20px, bottom 30px.', level: 'Easy' },
    { q: 'em vs rem?', a: 'em is relative to the font size of the parent (compounds when nested); rem is relative to the root html font size (usually 16px) so it is predictable.', level: 'Medium' },
    { q: 'Why add a generic family like sans-serif at the end of font-family?', a: 'It is the fallback if none of the named fonts are installed or downloaded, so the browser still picks a similar style.', level: 'Easy' },
    { q: 'How do you make a circular image?', a: 'Give it equal width and height and border-radius: 50%; add object-fit: cover so it does not stretch.', level: 'Easy' },
    { q: 'What is margin collapsing?', a: 'Adjacent vertical margins of block elements (siblings, or parent and first/last child without padding/border) merge into one margin equal to the largest, instead of adding up.', level: 'Hard' },
    { q: 'How do you truncate long text with "..."?', a: 'Give a width and use white-space: nowrap; overflow: hidden; text-overflow: ellipsis;', level: 'Medium' },
    { q: 'Why is "border: 2px red;" not visible?', a: 'border-style is missing; its default is none. Use border: 2px solid red;', level: 'Medium' },
  ],
  practice: [
    { task: 'Create three buttons (primary blue, success green, danger red) using HEX colours, padding 10px 20px and rounded corners.', hint: 'One .btn base class and three colour classes.', solution: '.btn { padding: 10px 20px; border: none; border-radius: 6px; color: #fff; font-weight: 600; }\n.btn-primary { background: #2563eb; }\n.btn-success { background: #16a34a; }\n.btn-danger  { background: #dc2626; }' },
    { task: 'Make a full-width banner with a background image that does not repeat, is centred and always fills the area.', hint: 'background shorthand with center / cover.', solution: '.banner { height: 300px; background: url("../images/banner.jpg") center / cover no-repeat; }' },
    { task: 'Style a quote block: italic, 1.25rem, grey text, 5px left border in teal, 16px padding, light background.', hint: 'border-left.', solution: 'blockquote { font-style: italic; font-size: 1.25rem; color: #4b5563; border-left: 5px solid teal; padding: 16px; background: #f0fdfa; margin: 0; }' },
    { task: 'Add a gradient header (left blue to right purple) with centred white upper-case text that has letter spacing 2px.', hint: 'linear-gradient(to right, ...).', solution: 'header { background: linear-gradient(to right, #2563eb, #7c3aed); color: #fff; text-align: center; text-transform: uppercase; letter-spacing: 2px; padding: 20px; }' },
    { task: 'Build a product card with image, name, price and "Add to cart" button using border, border-radius, box-shadow, margin and padding.', hint: 'Reuse the profile card structure.', solution: '<div class="product"><img src="https://picsum.photos/300/200" alt="Laptop"><h3>Laptop</h3><p class="price">45000</p><button>Add to cart</button></div>\n\n.product { width: 260px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.1); text-align: center; padding-bottom: 16px; }\n.product img { width: 100%; display: block; }\n.product .price { color: #16a34a; font-weight: 700; font-size: 1.25rem; }\n.product button { padding: 8px 20px; border: none; border-radius: 999px; background: #2563eb; color: #fff; }' },
  ],
  quiz: [
    { question: 'Which value makes a square image a circle?', options: ['border-radius: 100px', 'border-radius: 50%', 'border: circle', 'shape: round'], answer: 1, explanation: '50% radius on equal width and height produces a circle.' },
    { question: 'What does padding: 5px 10px set?', options: ['top 5, right 10, bottom 0, left 0', 'top/bottom 10, left/right 5', 'top/bottom 5, left/right 10', 'all sides 15'], answer: 2, explanation: 'Two values: first is top/bottom, second is left/right.' },
    { question: 'If the root font-size is 16px, 1.5rem equals?', options: ['15px', '16px', '20px', '24px'], answer: 3, explanation: '1.5 x 16 = 24px.' },
    { question: 'Which part of the box is always transparent?', options: ['Margin', 'Padding', 'Content', 'Border'], answer: 0, explanation: 'The background paints content and padding (and under the border) but never the margin.' },
    { question: 'Which colour is semi-transparent?', options: ['#000000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 0.5)', 'hsl(0, 0%, 0%)'], answer: 2, explanation: 'The 4th value 0.5 is the alpha (opacity) channel.' },
  ],
};
