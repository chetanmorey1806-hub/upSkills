const CARD = `<div class="card">
  <h2 class="title">Diwali Sale</h2>
  <p class="desc">Flat 40% off on all courses this week.</p>
  <a class="btn" href="#">Enroll now</a>
</div>
<p class="note">Offer valid till Sunday.</p>`;

export default {
  lesson: 'day-055-css-colors-backgrounds-fonts-borders-spacing',
  minutes: 22,
  intro: 'Practise CSS colours (names, hex, rgb, rgba), backgrounds, fonts and text styles, borders, margins and padding.',
  tasks: [
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Style the card colours and background:\n- `.card`: `background-color: #fff3cd`\n- `.title`: `color: rgb(220, 53, 69)`\n- `.btn`: `background-color: #198754` and `color: white`\n- `.note`: `color: rgba(0, 0, 0, 0.6)`',
      html: CARD,
      example: { title: 'colour formats', code: '.box { background-color: #e7f1ff; }\nh3 { color: rgb(13, 110, 253); }\n.muted { color: rgba(0, 0, 0, 0.5); }' },
      starter: '.card {\n  /* TODO */\n}\n',
      solution: '.card { background-color: #fff3cd; }\n.title { color: rgb(220, 53, 69); }\n.btn { background-color: #198754; color: white; }\n.note { color: rgba(0, 0, 0, 0.6); }',
      checks: [
        { sel: '.card', style: { 'background-color': 'rgb(255, 243, 205)' }, msg: '.card background must be #fff3cd' },
        { sel: '.title', style: { color: 'rgb(220, 53, 69)' }, msg: '.title must be rgb(220, 53, 69)' },
        { sel: '.btn', style: { 'background-color': 'rgb(25, 135, 84)', color: 'rgb(255, 255, 255)' }, msg: '.btn needs background #198754 and white text' },
        { sel: '.note', style: { color: 'rgba(0, 0, 0, 0.6)' }, msg: '.note must be rgba(0, 0, 0, 0.6)' },
      ],
      explain: 'Hex `#fff3cd` = rgb(255, 243, 205). `rgba` adds an **alpha** (opacity) channel from 0 to 1. Browsers report computed colours in rgb()/rgba() form whichever format you wrote.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Fonts and text:\n- `.title`: `font-size: 28px`, `font-weight: bold`, `text-transform: uppercase`\n- `.desc`: `font-style: italic`, `line-height: 1.5` with `font-size: 16px`\n- `.btn`: `text-decoration: none`\n- `.note`: `text-align: center`',
      html: CARD,
      example: { title: 'font properties', code: 'h1 { font-size: 32px; font-weight: 600; letter-spacing: 1px; }\np { line-height: 1.6; text-align: justify; }' },
      starter: '.title {\n  /* TODO */\n}\n',
      solution: '.title { font-size: 28px; font-weight: bold; text-transform: uppercase; }\n.desc { font-style: italic; font-size: 16px; line-height: 1.5; }\n.btn { text-decoration: none; }\n.note { text-align: center; }',
      checks: [
        { sel: '.title', style: { 'font-size': '28px', 'font-weight': '700', 'text-transform': 'uppercase' }, msg: '.title needs 28px, bold, uppercase' },
        { sel: '.desc', style: { 'font-style': 'italic', 'line-height': '24px' }, msg: '.desc must be italic with line-height 1.5 at 16px (24px)' },
        { sel: '.btn', style: { 'text-decoration-line': 'none' }, msg: '.btn must have no underline' },
        { sel: '.note', style: { 'text-align': 'center' }, msg: '.note must be centred' },
      ],
      explain: '`bold` is computed as weight **700**. A unitless line-height multiplies the font size (16px × 1.5 = 24px). `text-transform` only changes how text looks, not the HTML content.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Borders and spacing for the card:\n- `.card`: `border: 2px solid #ffc107`, `border-radius: 12px`, `padding: 20px`, `margin: 16px`\n- `.btn`: `padding: 8px 16px` (8px top/bottom, 16px left/right) and `display: inline-block`',
      html: CARD,
      example: { title: 'border + spacing shorthands', code: '.panel {\n  border: 1px dashed gray;\n  border-radius: 8px;\n  padding: 10px 20px;  /* vertical | horizontal */\n  margin: 0 auto;\n}' },
      starter: '.card {\n  /* TODO */\n}\n',
      solution: '.card { border: 2px solid #ffc107; border-radius: 12px; padding: 20px; margin: 16px; }\n.btn { display: inline-block; padding: 8px 16px; }',
      checks: [
        { sel: '.card', style: { 'border-top-width': '2px', 'border-top-style': 'solid', 'border-top-color': 'rgb(255, 193, 7)' }, msg: '.card needs border: 2px solid #ffc107' },
        { sel: '.card', style: { 'border-top-left-radius': '12px' }, msg: '.card needs border-radius 12px' },
        { sel: '.card', style: { 'padding-top': '20px', 'padding-left': '20px' }, msg: '.card needs padding 20px' },
        { sel: '.card', style: { 'margin-top': '16px', 'margin-left': '16px' }, msg: '.card needs margin 16px' },
        { sel: '.btn', style: { 'padding-top': '8px', 'padding-left': '16px', display: 'inline-block' }, msg: '.btn needs padding 8px 16px and display inline-block' },
      ],
      explain: '**Padding** is space inside the border, **margin** is space outside it. With two values, `padding: 8px 16px` means top/bottom then left/right. Inline elements like `<a>` ignore vertical margins, so make the button `inline-block`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `margin: 10px 20px 30px 40px;` set?',
      options: [
        'top 10, bottom 20, left 30, right 40',
        'top 10, right 20, bottom 30, left 40 (clockwise)',
        'left 10, top 20, right 30, bottom 40',
        'All sides 10px',
      ],
      answer: 1,
      explain: 'Four values go **clockwise from the top**: top, right, bottom, left (remember "TRouBLe"). Three values = top, left/right, bottom; two values = top/bottom, left/right.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the declaration that sets a **background image** `banner.jpg` on an element (just the property and value, e.g. `property: value`).',
      example: { title: 'background properties', code: 'background-color: #f8f9fa;\nbackground-size: cover;\nbackground-repeat: no-repeat;' },
      accept: ['background-image: url("banner.jpg")', "background-image: url('banner.jpg')", 'background-image: url(banner.jpg)', 'background-image: url("banner.jpg");', "background-image: url('banner.jpg');", 'background-image: url(banner.jpg);'],
      acceptRegex: ['^background(-image)?\\s*:\\s*url\\(\\s*["\']?banner\\.jpg["\']?\\s*\\)\\s*;?$'],
      explain: 'Images are set with `background-image: url(...)`. Combine with `background-size: cover` (fill the box) and `background-position: center`. Always keep a `background-color` fallback for readability while the image loads.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are valid ways to write **pure red** in CSS? (choose all that apply)',
      options: ['red', '#ff0000', '#f00', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'rgb(0, 0, 255)'],
      answers: [0, 1, 2, 3, 4],
      explain: 'Named colours, 6- and 3-digit hex, rgb() and hsl() can all describe the same colour. `rgb(0, 0, 255)` is blue: the order is **R**ed, **G**reen, **B**lue.',
    },
  ],
};
