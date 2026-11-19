const LAYOUT = `<div class="box">Box</div>
<span class="tag">New</span>
<div class="banner">
  <span class="badge">Hot</span>
  Summer batch
</div>
<p class="long">Line 1<br>Line 2<br>Line 3<br>Line 4<br>Line 5<br>Line 6</p>
<div class="chat">Chat</div>
<div class="hidden-a">A</div>
<div class="hidden-b">B</div>`;

export default {
  lesson: 'day-056-css-box-model-display-position',
  minutes: 24,
  intro: 'Practise the CSS box model (content, padding, border, margin, box-sizing), display values, positioning, overflow and z-index.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'An element has `width: 200px; padding: 20px; border: 5px solid;` and the default `box-sizing: content-box`. How wide is it on screen?',
      options: ['200px', '225px', '250px', '240px'],
      answer: 2,
      explain: 'With **content-box**, width is only the content: 200 + 20 + 20 (padding) + 5 + 5 (border) = **250px**. With `box-sizing: border-box`, the total would stay 200px and the content would shrink to 150px.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Box model:\n- `.box`: `width: 300px`, `padding: 20px`, `border: 5px solid black` and **`box-sizing: border-box`** so the total width stays exactly 300px\n- `.tag` (a span): make it `display: inline-block` with `width: 80px`',
      html: LAYOUT,
      example: { title: 'border-box', code: '.card {\n  box-sizing: border-box;\n  width: 250px;\n  padding: 16px;   /* included inside the 250px */\n}' },
      starter: '.box {\n  /* TODO */\n}\n',
      solution: '.box { width: 300px; padding: 20px; border: 5px solid black; box-sizing: border-box; }\n.tag { display: inline-block; width: 80px; }',
      checks: [
        { sel: '.box', style: { 'box-sizing': 'border-box', width: '300px' }, msg: '.box must be 300px wide with box-sizing: border-box' },
        { sel: '.box', style: { 'padding-left': '20px', 'border-left-width': '5px' }, msg: '.box needs padding 20px and a 5px border' },
        { sel: '.tag', style: { display: 'inline-block', width: '80px' }, msg: '.tag must be inline-block with width 80px' },
      ],
      explain: '`border-box` makes width include padding and border, which makes layouts predictable. Inline elements (span, a) ignore `width`; `inline-block` stays in the text flow but respects width/height.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 6,
      q: 'Positioning:\n- `.banner`: `position: relative`\n- `.badge`: `position: absolute`, `top: 0`, `right: 0` (sticks to the banner\'s top-right corner)\n- `.chat`: `position: fixed`, `bottom: 20px`, `right: 20px`, `z-index: 100`',
      html: LAYOUT,
      example: { title: 'absolute inside relative', code: '.card { position: relative; }\n.card .ribbon { position: absolute; top: 10px; left: 10px; }\n.back-to-top { position: fixed; bottom: 16px; right: 16px; }' },
      starter: '.banner {\n  /* TODO */\n}\n',
      solution: '.banner { position: relative; }\n.badge { position: absolute; top: 0; right: 0; }\n.chat { position: fixed; bottom: 20px; right: 20px; z-index: 100; }',
      checks: [
        { sel: '.banner', style: { position: 'relative' }, msg: '.banner must be position: relative' },
        { sel: '.badge', style: { position: 'absolute', top: '0px', right: '0px' }, msg: '.badge must be absolute at top 0, right 0' },
        { sel: '.chat', style: { position: 'fixed', bottom: '20px', right: '20px', 'z-index': '100' }, msg: '.chat must be fixed at bottom/right 20px with z-index 100' },
      ],
      explain: 'An absolutely positioned element is placed relative to its nearest **positioned ancestor**; `position: relative` on the banner creates that reference. `fixed` is relative to the viewport (stays put while scrolling). `z-index` works on positioned elements; higher is on top.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 4,
      q: 'Overflow and hiding:\n- `.long`: `height: 60px` and `overflow: auto` (scrollbar only when needed)\n- `.hidden-a`: remove it from the layout completely (`display: none`)\n- `.hidden-b`: make it invisible but **keep its space** (`visibility: hidden`)',
      html: LAYOUT,
      example: { title: 'overflow + hiding', code: '.log { max-height: 100px; overflow-y: scroll; }\n.gone { display: none; }\n.ghost { visibility: hidden; }' },
      starter: '.long {\n  /* TODO */\n}\n',
      solution: '.long { height: 60px; overflow: auto; }\n.hidden-a { display: none; }\n.hidden-b { visibility: hidden; }',
      checks: [
        { sel: '.long', style: { height: '60px', 'overflow-y': 'auto' }, msg: '.long needs height 60px and overflow: auto' },
        { sel: '.hidden-a', style: { display: 'none' }, msg: '.hidden-a must be display: none' },
        { sel: '.hidden-b', style: { visibility: 'hidden' }, msg: '.hidden-b must be visibility: hidden' },
      ],
      explain: '`overflow: auto` adds a scrollbar only when the content is taller than the box (`hidden` would cut it off). `display: none` removes the element from the layout; `visibility: hidden` hides it but leaves an empty gap.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `display` are TRUE? (choose all that apply)',
      options: [
        'block elements (div, p, h1) start on a new line and take the full width by default',
        'inline elements (span, a, strong) ignore width and height',
        'inline-block elements sit in a line but accept width, height and vertical padding/margin',
        'position: sticky behaves like fixed from the very start',
        'float: left lets text wrap around an image',
      ],
      answers: [0, 1, 2, 4],
      explain: '`sticky` behaves like **relative** until the element reaches its threshold (e.g. `top: 0`) while scrolling, then sticks like fixed within its parent. The other statements are true; floats are now mostly used for text wrapping, while flexbox/grid handle layouts.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Two siblings overlap: `.a { position: absolute; z-index: 5; }` and `.b { position: absolute; z-index: 10; }`. Which one is on top?',
      options: ['.a', '.b', 'Whichever comes first in the HTML', 'z-index does not work with absolute'],
      answer: 1,
      explain: 'Higher `z-index` wins within the same stacking context, so `.b` (10) is drawn above `.a` (5). Without a z-index, later elements in the HTML are drawn on top.',
    },
  ],
};
