export default {
  id: 'day-08-cards-list-groups-images-icons',
  title: 'Cards, List Groups, Images and Bootstrap Icons',
  module: 'Module 2: Components',
  day: 8,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build content blocks with cards (images, headers, footers, overlays, horizontal cards, card grids), list groups (links, badges, flush, actionable, list-tab), responsive images and the Bootstrap Icons library.',
  objectives: [
    'Compose cards with card-img-top, card-body, card-title, card-text, header and footer',
    'Build equal-height responsive card grids with row-cols and h-100',
    'Create list groups with active, disabled, actionable, flush, numbered and badge items',
    'Make images responsive and styled with img-fluid, img-thumbnail, figure and ratio',
    'Add Bootstrap Icons via CDN/npm and use them accessibly',
  ],
  theory: [
    {
      heading: 'Card Anatomy',
      content: 'A **card** is a flexible bordered box for content such as a product, a blog post or a profile.\n\n- `.card` – wrapper (flex column, border, radius)\n- `.card-img-top` / `.card-img-bottom` – image with rounded top/bottom corners\n- `.card-body` – padded area; inside it `.card-title`, `.card-subtitle`, `.card-text`, `.card-link`\n- `.card-header` and `.card-footer` – grey strips at top/bottom\n- `.card-img-overlay` – positions the body over a `.card-img` background\n- List inside a card: `<ul class="list-group list-group-flush">`\n- Card nav: `.card-header-tabs` / `.card-header-pills`\n\nAnalogy: a card is a playing card or ID card: a picture on top, a title, a few lines of text and an action.\n\nCards have **no fixed width**; they fill their parent. Control width with grid columns, `w-*` utilities or `style="max-width: 18rem"`.',
      syntax: `<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>`,
    },
    {
      heading: 'Card Layouts: Grids, Horizontal Cards, Styles',
      content: '- **Card grid**: `.row.row-cols-1.row-cols-md-3.g-4` with each `.col` containing `.card.h-100` → equal-height cards that wrap responsively\n- **Card group**: `.card-group` attaches cards together with equal height (no gaps)\n- **Horizontal card**: inside `.card`, a `.row.g-0` with an image column (`col-md-4`) and a body column (`col-md-8`)\n- **Colours**: `.text-bg-primary` on the card, or `.border-success` + `.text-success`\n- **Stretched link**: add `.stretched-link` to the card\'s main link so the whole card becomes clickable\n- Remove borders: `.border-0`, add depth: `.shadow-sm`\n\nTo align card buttons at the bottom when texts differ in length, use `d-flex flex-column` on `.card-body` and `mt-auto` on the button.',
      tip: 'Masonry layouts are not built into Bootstrap 5; use a CSS columns trick or the Masonry JS library.',
    },
    {
      heading: 'List Groups',
      content: 'List groups display a series of items:\n\n- `<ul class="list-group">` with `<li class="list-group-item">`\n- `.active` (highlighted, add `aria-current="true"`) and `.disabled` items\n- **Actionable**: use `<a>` or `<button>` with `.list-group-item-action` for hover/focus states\n- `.list-group-flush` – no outer borders/radius (good inside cards)\n- `.list-group-numbered` – auto numbers via CSS counters (use `<ol>`)\n- `.list-group-horizontal` / `-md` – items side by side\n- Contextual colours: `.list-group-item-success` etc.\n- With badges: `d-flex justify-content-between align-items-center` on the item\n- With checkboxes: `<input class="form-check-input me-1">` + label\n- **List group tabs**: `data-bs-toggle="list"` + `.tab-content` (same as tabs)',
    },
    {
      heading: 'Images and Figures',
      content: '- `.img-fluid` – `max-width: 100%; height: auto;` so the image never overflows its container\n- `.img-thumbnail` – rounded 1px border with padding\n- `.rounded`, `.rounded-circle` from utilities\n- Alignment: `.float-start`/`.float-end`, or centre a block image with `.d-block .mx-auto`\n- `<figure class="figure">` with `<img class="figure-img img-fluid rounded">` and `<figcaption class="figure-caption">`\n- `.object-fit-cover` keeps a fixed-size image from stretching (5.3)\n- `.ratio .ratio-16x9` (also 1x1, 4x3, 21x9) for responsive iframes/videos\n\nAlways write meaningful `alt` text; use `alt=""` for purely decorative images.',
    },
    {
      heading: 'Bootstrap Icons',
      content: '**Bootstrap Icons** is a free library of 2,000+ SVG icons, separate from Bootstrap itself.\n\nSetup:\n- CDN: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">`\n- npm: `npm i bootstrap-icons` then `import "bootstrap-icons/font/bootstrap-icons.css"`\n\nUsage (icon font): `<i class="bi bi-heart-fill"></i>`\n- Size via font-size: `.fs-3` or `style="font-size: 2rem"`\n- Colour via text utilities: `.text-danger`\n- Other ways: inline SVG copied from icons.getbootstrap.com, SVG sprite (`<use href="bootstrap-icons.svg#heart">`), or `<img src="heart.svg">`\n\n**Accessibility**: decorative icons next to text get `aria-hidden="true"`. Icon-only buttons need `aria-label` (or `.visually-hidden` text).',
      syntax: `<button class="btn btn-danger">
  <i class="bi bi-trash" aria-hidden="true"></i> Delete
</button>
<button class="btn btn-outline-secondary" aria-label="Settings">
  <i class="bi bi-gear" aria-hidden="true"></i>
</button>`,
      points: [
        'Icon fonts are easy; inline SVG gives the most control and no extra request',
        'Other icon sets: Font Awesome, Material Symbols, Heroicons',
        'Coming next (Day 9): forms: inputs, selects, checks, input groups, floating labels',
      ],
    },
  ],
  examples: [
    {
      title: 'Responsive Product Card Grid with Icons',
      scenario: 'An e-commerce listing: 1 card per row on phones, 2 on sm, 3 on lg, equal heights, Add to cart button aligned at the bottom.',
      steps: [
        'Create row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4',
        'Generate cards from a JS array with card-img-top, title, rating icons and price',
        'Use h-100 on the card and d-flex flex-column + mt-auto in the body',
        'Add a heart icon button and an Add to cart button with a cart icon',
      ],
      code: `<div class="col">
  <div class="card h-100 shadow-sm">
    <img src="https://picsum.photos/id/1/400/250" class="card-img-top" alt="Laptop">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">Laptop Pro</h5>
      <div class="text-warning mb-2"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-half"></i></div>
      <p class="card-text fw-bold">Rs 54,999</p>
      <button class="btn btn-primary mt-auto"><i class="bi bi-cart-plus" aria-hidden="true"></i> Add to cart</button>
    </div>
  </div>
</div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-4">
  <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4" id="grid"></div>
</div>`,
        js: `const products = [
  { id: 1, name: 'Laptop Pro', price: 54999, rating: 4.5, desc: 'Fast and light.' },
  { id: 2, name: 'Wireless Headphones', price: 2999, rating: 4, desc: 'Noise cancelling with 30-hour battery and quick charge support.' },
  { id: 3, name: 'Smart Watch', price: 4999, rating: 3.5, desc: 'Fitness tracking.' }
];
function stars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += '<i class="bi ' + (r >= i ? 'bi-star-fill' : r >= i - 0.5 ? 'bi-star-half' : 'bi-star') + '" aria-hidden="true"></i>';
  }
  return s + '<span class="visually-hidden">' + r + ' out of 5 stars</span>';
}
document.getElementById('grid').innerHTML = products.map(function (p) {
  return '<div class="col"><div class="card h-100 shadow-sm">' +
    '<img src="https://picsum.photos/id/' + (p.id + 1) + '/400/250" class="card-img-top" alt="' + p.name + '">' +
    '<div class="card-body d-flex flex-column">' +
    '<div class="d-flex justify-content-between align-items-start"><h5 class="card-title">' + p.name + '</h5>' +
    '<button class="btn btn-sm btn-light wish" aria-label="Add ' + p.name + ' to wishlist"><i class="bi bi-heart" aria-hidden="true"></i></button></div>' +
    '<div class="text-warning mb-2">' + stars(p.rating) + '</div>' +
    '<p class="card-text text-body-secondary">' + p.desc + '</p>' +
    '<p class="fw-bold fs-5">Rs ' + p.price.toLocaleString('en-IN') + '</p>' +
    '<button class="btn btn-primary mt-auto"><i class="bi bi-cart-plus" aria-hidden="true"></i> Add to cart</button>' +
    '</div></div></div>';
}).join('');
document.getElementById('grid').addEventListener('click', function (e) {
  const w = e.target.closest('.wish');
  if (!w) return;
  const icon = w.querySelector('i');
  icon.classList.toggle('bi-heart');
  icon.classList.toggle('bi-heart-fill');
  icon.classList.toggle('text-danger');
});`,
      },
      result: 'Three product cards of equal height with images, star ratings, prices and Add to cart buttons aligned at the bottom. Clicking the heart fills it red.',
      explanation: 'h-100 makes each card fill its column height; flex-column + mt-auto pins the button to the bottom despite different description lengths. Icons are font glyphs coloured by text-warning/text-danger.',
    },
    {
      title: 'Card Variations: Header/Footer, Overlay, Horizontal, Stretched Link',
      scenario: 'Build the four card variants most often seen in real websites.',
      steps: [
        'Card with card-header, card-body and card-footer text-body-secondary',
        'Image overlay card using card-img and card-img-overlay',
        'Horizontal card using row g-0 inside the card',
        'Make a card fully clickable with stretched-link',
      ],
      code: `<div class="card mb-3">
  <div class="row g-0">
    <div class="col-md-4"><img src="..." class="img-fluid rounded-start h-100 object-fit-cover" alt=""></div>
    <div class="col-md-8"><div class="card-body">...</div></div>
  </div>
</div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3">
  <div class="row g-3">
    <div class="col-md-6">
      <div class="card text-center h-100">
        <div class="card-header"><i class="bi bi-megaphone" aria-hidden="true"></i> Featured</div>
        <div class="card-body">
          <h5 class="card-title">Bootstrap Workshop</h5>
          <p class="card-text">Learn components in one weekend.</p>
          <a href="#" class="btn btn-success">Register</a>
        </div>
        <div class="card-footer text-body-secondary">2 days left</div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card text-bg-dark h-100">
        <img src="https://picsum.photos/id/1015/600/300" class="card-img h-100 object-fit-cover opacity-75" alt="River valley">
        <div class="card-img-overlay d-flex flex-column justify-content-end">
          <h5 class="card-title">Weekend in the Valley</h5>
          <p class="card-text small">Overlay text on top of the image.</p>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card">
        <div class="row g-0">
          <div class="col-md-4"><img src="https://picsum.photos/id/1060/400/300" class="img-fluid rounded-start h-100 object-fit-cover" alt="Coffee being brewed"></div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">Horizontal card</h5>
              <p class="card-text">Image on the left from md, on top on phones.</p>
              <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-primary shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-primary">Whole card is clickable</h5>
          <p class="card-text">Hover anywhere on the card.</p>
          <a href="#" class="stretched-link" onclick="console.log('Card clicked'); return false;">Read article</a>
        </div>
      </div>
    </div>
  </div>
</div>`,
      },
      result: 'A centred card with header and footer, an image with white overlay text, a horizontal card (image left on md+), and a blue-bordered card that is clickable anywhere (console logs "Card clicked").',
      explanation: 'card-img-overlay is position:absolute over the card. The horizontal layout is just the grid inside a card. stretched-link adds an ::after pseudo-element covering the nearest position-relative ancestor (.card is relative).',
    },
    {
      title: 'List Groups: Badges, Actionable, Checkboxes, Numbered and List Tabs',
      scenario: 'Build an inbox folder list with counts, a to-do list with checkboxes, and a settings menu that switches panes.',
      steps: [
        'List with d-flex justify-content-between and badges',
        'Actionable button list with active item and disabled item',
        'Checklist with form-check-input inside list items',
        'List-group tabs with data-bs-toggle="list"',
      ],
      code: `<ul class="list-group">
  <li class="list-group-item d-flex justify-content-between align-items-center">
    Inbox <span class="badge text-bg-primary rounded-pill">14</span>
  </li>
</ul>
<div class="list-group" role="tablist">
  <a class="list-group-item list-group-item-action active" data-bs-toggle="list" href="#l-home" role="tab">Home</a>
  <a class="list-group-item list-group-item-action" data-bs-toggle="list" href="#l-profile" role="tab">Profile</a>
</div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3">
  <div class="row g-4">
    <div class="col-md-6">
      <ul class="list-group mb-3">
        <li class="list-group-item d-flex justify-content-between align-items-center"><span><i class="bi bi-inbox me-2" aria-hidden="true"></i>Inbox</span><span class="badge text-bg-primary rounded-pill">14</span></li>
        <li class="list-group-item d-flex justify-content-between align-items-center"><span><i class="bi bi-send me-2" aria-hidden="true"></i>Sent</span><span class="badge text-bg-secondary rounded-pill">2</span></li>
        <li class="list-group-item list-group-item-danger d-flex justify-content-between align-items-center"><span><i class="bi bi-exclamation-octagon me-2" aria-hidden="true"></i>Spam</span><span class="badge text-bg-danger rounded-pill">99+</span></li>
      </ul>
      <div class="list-group mb-3">
        <button type="button" class="list-group-item list-group-item-action active" aria-current="true">Dashboard</button>
        <button type="button" class="list-group-item list-group-item-action">Orders</button>
        <button type="button" class="list-group-item list-group-item-action" disabled>Reports (no access)</button>
      </div>
      <ol class="list-group list-group-numbered">
        <li class="list-group-item">Learn grid</li><li class="list-group-item">Learn components</li><li class="list-group-item">Build project</li>
      </ol>
    </div>
    <div class="col-md-6">
      <ul class="list-group mb-3" id="todo">
        <li class="list-group-item"><input class="form-check-input me-2" type="checkbox" id="t1"><label class="form-check-label" for="t1">Buy groceries</label></li>
        <li class="list-group-item"><input class="form-check-input me-2" type="checkbox" id="t2"><label class="form-check-label" for="t2">Finish assignment</label></li>
        <li class="list-group-item"><input class="form-check-input me-2" type="checkbox" id="t3"><label class="form-check-label" for="t3">Call mom</label></li>
      </ul>
      <div class="row g-2">
        <div class="col-5">
          <div class="list-group" role="tablist">
            <a class="list-group-item list-group-item-action active" data-bs-toggle="list" href="#l-home" role="tab">Home</a>
            <a class="list-group-item list-group-item-action" data-bs-toggle="list" href="#l-profile" role="tab">Profile</a>
            <a class="list-group-item list-group-item-action" data-bs-toggle="list" href="#l-msg" role="tab">Messages</a>
          </div>
        </div>
        <div class="col-7">
          <div class="tab-content border rounded p-2 h-100">
            <div class="tab-pane fade show active" id="l-home" role="tabpanel">Welcome home.</div>
            <div class="tab-pane fade" id="l-profile" role="tabpanel">Your profile details.</div>
            <div class="tab-pane fade" id="l-msg" role="tabpanel">You have 3 messages.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
        js: `document.getElementById('todo').addEventListener('change', function (e) {
  const li = e.target.closest('li');
  li.classList.toggle('text-decoration-line-through', e.target.checked);
  li.classList.toggle('text-body-secondary', e.target.checked);
  const done = document.querySelectorAll('#todo input:checked').length;
  console.log(done + ' of 3 tasks done');
});`,
      },
      result: 'An inbox list with icons and pill counts, a clickable menu with an active and a disabled item, an auto-numbered list, a to-do list that strikes through checked items, and a list-tab menu that switches its pane.',
      explanation: 'list-group-item-action adds hover/focus/active styles. list-group-numbered uses CSS counters. data-bs-toggle="list" reuses the Tab plugin, matching href="#id" to .tab-pane ids.',
    },
    {
      title: 'Responsive Images, Figures, Thumbnails and Ratio Embeds',
      scenario: 'Show an image gallery with thumbnails, a captioned figure and a 16:9 responsive video area.',
      steps: [
        'Add an img-fluid image that shrinks with the container',
        'Add three img-thumbnail images in a row',
        'Add a figure with figcaption',
        'Add a ratio ratio-16x9 box containing an iframe (srcdoc) as a placeholder video',
      ],
      code: `<img src="..." class="img-fluid rounded" alt="...">
<img src="..." class="img-thumbnail" alt="...">
<figure class="figure">
  <img src="..." class="figure-img img-fluid rounded" alt="...">
  <figcaption class="figure-caption text-end">Caption</figcaption>
</figure>
<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed/..." title="Video" allowfullscreen></iframe></div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3">
  <img src="https://picsum.photos/id/1043/1200/400" class="img-fluid rounded mb-3" alt="Wide landscape, shrinks with the screen">
  <div class="row g-2 mb-3">
    <div class="col-4"><img src="https://picsum.photos/id/30/300/200" class="img-thumbnail" alt="Thumbnail 1"></div>
    <div class="col-4"><img src="https://picsum.photos/id/31/300/200" class="img-thumbnail" alt="Thumbnail 2"></div>
    <div class="col-4"><img src="https://picsum.photos/id/32/300/200" class="img-thumbnail" alt="Thumbnail 3"></div>
  </div>
  <figure class="figure">
    <img src="https://picsum.photos/id/40/400/250" class="figure-img img-fluid rounded" alt="A cat">
    <figcaption class="figure-caption text-end"><i class="bi bi-camera" aria-hidden="true"></i> Photo by Picsum</figcaption>
  </figure>
  <div class="ratio ratio-16x9 border rounded" style="max-width:480px">
    <iframe title="Placeholder video" srcdoc="<body style='margin:0;display:flex;align-items:center;justify-content:center;background:#212529;color:#fff;font-family:sans-serif'>16:9 video area</body>"></iframe>
  </div>
  <div class="d-flex gap-3 fs-2 mt-3">
    <i class="bi bi-house text-primary" aria-hidden="true"></i>
    <i class="bi bi-github" aria-hidden="true"></i>
    <i class="bi bi-envelope-fill text-danger" aria-hidden="true"></i>
    <i class="bi bi-check-circle-fill text-success" aria-hidden="true"></i>
  </div>
</div>`,
      },
      result: 'A wide banner image that resizes, three bordered thumbnails, a rounded figure with right-aligned caption, a dark 16:9 box that keeps its shape when resized, and a row of large coloured icons.',
      explanation: 'img-fluid sets max-width:100% and height:auto. ratio uses padding-top via --bs-aspect-ratio and absolutely positions the iframe inside. Icons scale with fs-2 because they are font glyphs.',
    },
  ],
  interview: [
    { q: 'What are the main parts of a Bootstrap card?', a: '.card wrapper, optional .card-header/.card-footer, .card-img-top/.card-img-bottom, and .card-body containing .card-title, .card-subtitle, .card-text and .card-link.', level: 'Easy' },
    { q: 'How do you make cards in a row equal height?', a: 'Place cards in grid columns and add .h-100 to each card. Rows are flex containers so columns stretch; h-100 makes the card fill the column.', level: 'Medium' },
    { q: 'How do you make an entire card clickable?', a: 'Add .stretched-link to a link inside the card. Its ::after covers the containing block (.card has position: relative).', level: 'Medium' },
    { q: 'How is a horizontal card built?', a: 'Inside .card add .row.g-0 with an image column (col-md-4, img with rounded-start) and a .card-body in col-md-8.', level: 'Medium' },
    { q: 'What does .list-group-flush do?', a: 'Removes outer borders and rounded corners so the list sits edge-to-edge inside a parent like a card.', level: 'Easy' },
    { q: 'What is .list-group-item-action?', a: 'A class for <a>/<button> list items that adds hover, focus and active states to indicate they are interactive.', level: 'Easy' },
    { q: 'What does .img-fluid do?', a: 'Applies max-width: 100% and height: auto so the image scales down with its parent and never overflows.', level: 'Easy' },
    { q: 'How do you embed a responsive YouTube video?', a: 'Wrap the iframe in <div class="ratio ratio-16x9">. The ratio helper keeps the aspect ratio at any width.', level: 'Easy' },
    { q: 'Are Bootstrap Icons included in Bootstrap CSS?', a: 'No. They are a separate package (bootstrap-icons) that you add via CDN link or npm, then use <i class="bi bi-name">, inline SVG or sprites.', level: 'Easy' },
    { q: 'How do you make icon-only buttons accessible?', a: 'Give the button an aria-label (or visually-hidden text) and mark the icon aria-hidden="true" so screen readers announce a meaningful name.', level: 'Medium' },
    { q: 'Icon font vs inline SVG: pros and cons?', a: 'Icon fonts are easy and style with color/font-size but load a full font and can render blurry or fail if blocked. Inline SVG is crisp, accessible with <title>, needs no extra request and supports multi-colour, but adds markup.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a blog card grid of 3 posts (1/2/3 per row responsive) with image, category badge, title, excerpt and a "Read more" stretched link.',
      hint: 'row-cols-1 row-cols-md-2 row-cols-lg-3, card h-100, stretched-link.',
      solution: `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
  <div class="col"><div class="card h-100">
    <img src="https://picsum.photos/id/180/400/220" class="card-img-top" alt="Desk">
    <div class="card-body">
      <span class="badge text-bg-info mb-2">CSS</span>
      <h5 class="card-title">Flexbox in 10 minutes</h5>
      <p class="card-text">A quick guide to the most useful flex properties.</p>
      <a href="#" class="stretched-link">Read more</a>
    </div>
  </div></div>
  <div class="col"><div class="card h-100">
    <img src="https://picsum.photos/id/0/400/220" class="card-img-top" alt="Laptop">
    <div class="card-body"><span class="badge text-bg-warning mb-2">JS</span><h5 class="card-title">Async/await</h5><p class="card-text">Write asynchronous code that reads like sync code.</p><a href="#" class="stretched-link">Read more</a></div>
  </div></div>
  <div class="col"><div class="card h-100">
    <img src="https://picsum.photos/id/3/400/220" class="card-img-top" alt="Code">
    <div class="card-body"><span class="badge text-bg-primary mb-2">Bootstrap</span><h5 class="card-title">Cards deep dive</h5><p class="card-text">Everything about cards.</p><a href="#" class="stretched-link">Read more</a></div>
  </div></div>
</div>`,
    },
    {
      task: 'Build a contact card with a circular avatar, name, and a flush list group of phone, email and location with icons.',
      hint: 'card text-center, rounded-circle, list-group-flush, bi-telephone, bi-envelope, bi-geo-alt.',
      solution: `<div class="card text-center" style="max-width:20rem">
  <div class="card-body">
    <img src="https://picsum.photos/id/91/100/100" class="rounded-circle mb-2" width="100" height="100" alt="Neha Joshi">
    <h5 class="card-title">Neha Joshi</h5>
    <p class="card-subtitle text-body-secondary">UI Designer</p>
  </div>
  <ul class="list-group list-group-flush text-start">
    <li class="list-group-item"><i class="bi bi-telephone me-2" aria-hidden="true"></i>+91 98765 43210</li>
    <li class="list-group-item"><i class="bi bi-envelope me-2" aria-hidden="true"></i>neha@example.com</li>
    <li class="list-group-item"><i class="bi bi-geo-alt me-2" aria-hidden="true"></i>Pune, India</li>
  </ul>
</div>`,
    },
    {
      task: 'Create a horizontal list group of steps "Cart → Address → Payment" with the current step active, horizontal from md.',
      hint: 'list-group list-group-horizontal-md.',
      solution: `<ul class="list-group list-group-horizontal-md">
  <li class="list-group-item list-group-item-success">1. Cart</li>
  <li class="list-group-item active" aria-current="step">2. Address</li>
  <li class="list-group-item">3. Payment</li>
</ul>`,
    },
    {
      task: 'Make a social-share toolbar with four icon-only buttons (Facebook, X/Twitter, LinkedIn, WhatsApp) with accessible labels.',
      hint: 'btn btn-outline-*, aria-label, bi-facebook, bi-twitter-x, bi-linkedin, bi-whatsapp.',
      solution: `<div class="d-flex gap-2">
  <button class="btn btn-outline-primary" aria-label="Share on Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></button>
  <button class="btn btn-outline-dark" aria-label="Share on X"><i class="bi bi-twitter-x" aria-hidden="true"></i></button>
  <button class="btn btn-outline-info" aria-label="Share on LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></button>
  <button class="btn btn-outline-success" aria-label="Share on WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></button>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which class places text over a card image?', options: ['card-overlay', 'card-img-overlay', 'card-text-overlay', 'overlay'], answer: 1, explanation: '.card-img-overlay is absolutely positioned over the card.' },
    { question: 'Which class makes all cards in a grid row equal height?', options: ['h-100 on each card', 'card-equal', 'card-group-equal', 'align-items-stretch on the card'], answer: 0, explanation: 'Columns stretch; h-100 makes the card fill them.' },
    { question: 'How do you create a Bootstrap icon of a heart?', options: ['<i class="icon-heart">', '<icon name="heart">', '<i class="bi bi-heart"></i>', '<span class="bs-heart">'], answer: 2, explanation: 'Bootstrap Icons use the bi bi-{name} classes.' },
    { question: 'Which class makes list items automatically numbered?', options: ['list-group-ordered', 'list-numbered', 'list-group-counter', 'list-group-numbered'], answer: 3, explanation: 'list-group-numbered uses CSS counters.' },
    { question: 'Which helper keeps an iframe at 16:9 at any width?', options: ['ratio ratio-16x9', 'embed-16-9', 'video-responsive', 'aspect-16x9'], answer: 0, explanation: 'Bootstrap 5 uses the ratio helper.' },
  ],
};
