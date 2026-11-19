const NAV = `<nav class="navbar">
  <div class="logo">UpSkillr</div>
  <ul class="menu">
    <li>Home</li>
    <li>Courses</li>
    <li>Contact</li>
  </ul>
</nav>
<section class="cards">
  <div class="card">C#</div>
  <div class="card">SQL</div>
  <div class="card">React</div>
  <div class="card">Azure</div>
</section>`;

export default {
  lesson: 'day-057-flexbox-grid-media-queries-bootstrap',
  minutes: 26,
  intro: 'Practise one-dimensional layouts with Flexbox, two-dimensional layouts with CSS Grid, responsive media queries and the Bootstrap 5 grid.',
  tasks: [
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Make a navbar with **Flexbox**:\n- `.navbar`: `display: flex`, `justify-content: space-between`, `align-items: center`\n- `.menu`: `display: flex`, `gap: 20px`, `list-style: none`',
      html: NAV,
      example: { title: 'flex container', code: '.toolbar {\n  display: flex;\n  justify-content: center;  /* main axis */\n  align-items: center;      /* cross axis */\n  gap: 12px;\n}' },
      starter: '.navbar {\n  /* TODO */\n}\n',
      solution: '.navbar { display: flex; justify-content: space-between; align-items: center; }\n.menu { display: flex; gap: 20px; list-style: none; }',
      checks: [
        { sel: '.navbar', style: { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }, msg: '.navbar needs display flex, space-between and align-items center' },
        { sel: '.menu', style: { display: 'flex', 'column-gap': '20px' }, msg: '.menu must be a flex container with gap 20px' },
        { sel: '.menu', style: { 'list-style-type': 'none' }, msg: '.menu needs list-style: none' },
      ],
      explain: '`justify-content` distributes items along the **main axis** (row by default); `space-between` pushes the logo left and the menu right. `align-items` aligns on the **cross axis**. `gap` adds space between flex items without margins.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Make the course cards a **CSS Grid**:\n- `.cards`: `display: grid`, `grid-template-columns: repeat(2, 1fr)` (2 equal columns), `gap: 16px`\n- `.card`: `padding: 12px`',
      html: NAV,
      example: { title: 'grid container', code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}' },
      starter: '.cards {\n  /* TODO */\n}\n',
      solution: '.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }\n.card { padding: 12px; }',
      checks: [
        { sel: '.cards', style: { display: 'grid', 'row-gap': '16px', 'column-gap': '16px' }, msg: '.cards must be a grid with gap 16px' },
        { sel: '.card', style: { 'padding-top': '12px' }, msg: '.card needs padding 12px' },
      ],
      explain: '`fr` means "fraction of the free space", so `repeat(2, 1fr)` makes two equal columns; the 4 cards flow into 2 rows automatically. Grid controls rows **and** columns; flexbox is for one direction.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which media query applies styles only on screens **600px wide or less** (phones)?',
      options: ['@media (min-width: 600px) { … }', '@media (max-width: 600px) { … }', '@media screen and (height: 600px) { … }', '@media (width > 600px) { … }'],
      answer: 1,
      explain: '`max-width: 600px` = "up to 600px". **Mobile-first** CSS writes the phone layout by default and adds `min-width` queries for larger screens. Also include `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
    },
    {
      type: 'code',
      lang: 'html',
      mins: 6,
      q: 'Use the **Bootstrap 5 grid** (Bootstrap is loaded): create a `.container` with one `.row` containing **3 columns** that are full width on phones and one-third each from the **md** breakpoint up (`col-12 col-md-4`). Put a **Bootstrap button** `btn btn-primary` in the first column.',
      libs: ['bootstrap'],
      example: { title: 'Bootstrap grid', code: '<div class="container">\n  <div class="row">\n    <div class="col-12 col-lg-6">Left</div>\n    <div class="col-12 col-lg-6">Right</div>\n  </div>\n</div>' },
      starter: '<div class="container">\n  <!-- TODO -->\n</div>\n',
      solution: '<div class="container">\n  <div class="row">\n    <div class="col-12 col-md-4"><button class="btn btn-primary">Enroll</button></div>\n    <div class="col-12 col-md-4">SQL Server</div>\n    <div class="col-12 col-md-4">React</div>\n  </div>\n</div>',
      checks: [
        { sel: '.container > .row', count: 1, msg: 'Put one .row directly inside .container' },
        { sel: '.row > .col-12.col-md-4', count: 3, msg: 'The row needs 3 columns with classes col-12 col-md-4' },
        { sel: '.row > div:first-child .btn.btn-primary', count: 1, msg: 'Put a .btn.btn-primary button in the first column' },
      ],
      explain: 'Bootstrap\'s grid has **12 columns**: `col-md-4` takes 4/12 = one third from 768px up, while `col-12` makes each column full width on smaller screens. Columns must be direct children of a `.row`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Flexbox or Grid? Which statements are TRUE? (choose all that apply)',
      options: [
        'Flexbox is ideal for one-dimensional layouts such as a navbar or a row of buttons',
        'Grid is ideal for two-dimensional layouts such as a dashboard or photo gallery',
        'flex-direction: column stacks flex items vertically',
        'justify-content always aligns items vertically',
        'flex-wrap: wrap lets items move to the next line when there is no space',
      ],
      answers: [0, 1, 2, 4],
      explain: '`justify-content` works on the **main axis**, which is horizontal for `row` but vertical for `flex-direction: column`. The other statements are true.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the media query so that on screens **up to 768px wide** the `.cards` grid shows a single column:\n```\n@media (________________) {\n  .cards { grid-template-columns: 1fr; }\n}\n```',
      example: { title: 'media query syntax', code: '@media (min-width: 992px) {\n  .sidebar { display: block; }\n}' },
      accept: ['max-width: 768px', 'max-width:768px', 'width <= 768px'],
      acceptRegex: ['^max-width\\s*:\\s*768px$', '^width\\s*<=\\s*768px$'],
      explain: '`max-width: 768px` matches widths from 0 up to 768px. Inside the query you override only what changes: here the grid becomes one column so cards stack on phones.',
    },
  ],
};
