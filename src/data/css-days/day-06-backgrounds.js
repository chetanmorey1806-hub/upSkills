export default {
  id: "day-06-backgrounds",
  title: "CSS Backgrounds: background-color, background-image, repeat, position, size, attachment and Shorthand",
  module: "Module 1: CSS Basics",
  day: 6,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Learn to paint element backgrounds with colors and images, control how images repeat, where they sit, how they scale and scroll, and combine everything into the background shorthand.",
  objectives: [
    "Apply background-color and background-image to any element",
    "Control tiling with background-repeat and placement with background-position",
    "Scale images with background-size (cover, contain, lengths)",
    "Create parallax-style effects with background-attachment and write the background shorthand",
  ],
  theory: [
    {
      heading: "background-color",
      content: "`background-color` fills the element's box (content + padding, and under the border) with a color. Any color format from Day 3 works. The default is `transparent`, which is why the parent's background shows through.\n\nAlways set a background color even when you use an image: it shows while the image loads or if it fails, and keeps text readable.",
      syntax: `.alert { background-color: #fef3c7; }`,
    },
    {
      heading: "background-image",
      content: "`background-image: url('path')` paints an image behind the content. It can also take gradients such as `linear-gradient(...)` (covered in detail on Day 27).\n\nBackground images are **decorative**: they have no alt text and are not read by screen readers. If an image is content (a product photo), use <img> instead.\n\nYou can layer multiple images separated by commas; the first one is on top.",
      syntax: `.hero { background-image: url('images/hero.jpg'); }
.layered { background-image: url('logo.svg'), url('pattern.png'); }`,
      tip: "The URL in a .css file is relative to the CSS file, not to the HTML page. A wrong relative path is the most common reason a background image doesn't appear.",
    },
    {
      heading: "background-repeat",
      content: "By default a background image **tiles** (repeats) in both directions to fill the box.\n\n- `repeat` (default) - tile both ways\n- `repeat-x` - tile horizontally only\n- `repeat-y` - tile vertically only\n- `no-repeat` - show once\n- `space` / `round` - tile without cutting images (space adds gaps, round stretches)",
      syntax: `.banner { background-repeat: no-repeat; }
.stripe { background-repeat: repeat-x; }`,
    },
    {
      heading: "background-position",
      content: "`background-position` sets where the image starts. Values are x then y:\n- Keywords: `left`, `center`, `right`, `top`, `bottom` (e.g. `center center`, `right top`)\n- Lengths: `20px 40px`\n- Percentages: `50% 50%` (centered); `100% 0` = top-right\n- Offsets from an edge: `right 20px bottom 10px`\n\nDefault is `0% 0%` (top-left).",
      syntax: `.badge { background-position: right 12px center; }`,
    },
    {
      heading: "background-size",
      content: "`background-size` controls how big the image is drawn:\n- `auto` (default) - natural size\n- `cover` - scale until the box is **fully covered**; parts of the image may be cropped. Best for hero banners.\n- `contain` - scale until the **whole image fits**; there may be empty space. Best for logos.\n- Lengths/percentages: `200px 100px`, `50% auto`\n\nAnalogy: cover is like filling a photo frame and trimming the edges; contain is like fitting the whole photo in with blank margins.",
      syntax: `.hero { background-size: cover; }
.logo { background-size: contain; }`,
    },
    {
      heading: "background-attachment and the Shorthand",
      content: "`background-attachment` decides how the image behaves when you scroll:\n- `scroll` (default) - moves with the element\n- `fixed` - fixed relative to the viewport, creating a simple parallax effect (often ignored on mobile browsers)\n- `local` - scrolls with the element's own scrolling content\n\nThe **background shorthand** combines everything in one line. Order is flexible, but size must come right after position separated by a slash: `position / size`.\n\nOther useful properties: `background-clip` and `background-origin` (border-box, padding-box, content-box).",
      syntax: `/* color image repeat position/size attachment */
.hero {
  background: #1e293b url('hero.jpg') no-repeat center / cover fixed;
}`,
      tip: "The shorthand resets any background sub-property you leave out to its default. Writing background: red after background-image will remove the image.",
    },
  ],
  examples: [
    {
      title: "Repeat vs No-Repeat Pattern",
      scenario: "See how a small image tiles by default and how to control it.",
      steps: [
        "Create three boxes with the same small image",
        "Set repeat, repeat-x and no-repeat",
        "Click Run",
      ],
      code: `.tile   { background-image: url('https://picsum.photos/60'); background-repeat: repeat; }
.row    { background-repeat: repeat-x; }
.single { background-repeat: no-repeat; }`,
      playground: {
        html: `<div class="box tile">repeat</div>
<div class="box row">repeat-x</div>
<div class="box single">no-repeat</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { height: 140px; margin-bottom: 12px; border: 2px solid #334155; background-color: #e2e8f0;
  background-image: url('https://picsum.photos/id/1025/60/60'); color: white; font-weight: bold; padding: 8px; text-shadow: 0 1px 3px black; }
.tile   { background-repeat: repeat; }
.row    { background-repeat: repeat-x; }
.single { background-repeat: no-repeat; }`,
      },
      result: "Box 1 is completely tiled with the small dog photo; box 2 has one horizontal strip of tiles at the top; box 3 shows a single image in the top-left corner.",
      explanation: "background-repeat controls tiling. The grey background-color fills the area not covered by images.",
    },
    {
      title: "cover vs contain",
      scenario: "Choose the right background-size for a banner and for a logo-style image.",
      steps: [
        "Create two same-sized boxes with the same wide image",
        "Set background-size: cover on the first and contain on the second",
        "Add no-repeat and center position to both",
        "Click Run",
      ],
      code: `.cover   { background: #fde68a url('img.jpg') no-repeat center / cover; }
.contain { background: #fde68a url('img.jpg') no-repeat center / contain; }`,
      playground: {
        html: `<div class="box cover"><span>cover</span></div>
<div class="box contain"><span>contain</span></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
.box { width: 260px; height: 220px; border: 2px solid #92400e; position: relative; }
.box span { position: absolute; bottom: 6px; left: 6px; background: white; padding: 2px 8px; }
.cover   { background: #fde68a url('https://picsum.photos/id/1015/600/300') no-repeat center / cover; }
.contain { background: #fde68a url('https://picsum.photos/id/1015/600/300') no-repeat center / contain; }`,
      },
      result: "The cover box is fully filled with the landscape (sides cropped). The contain box shows the whole landscape with yellow bands above and below.",
      explanation: "cover scales until both dimensions are covered (cropping overflow). contain scales until the whole image fits inside (leaving gaps).",
    },
    {
      title: "Positioning a Background Icon",
      scenario: "Put a search icon inside an input field using background-position.",
      steps: [
        "Create an input with class search",
        "Add an inline SVG data URI as background-image",
        "Position it left 12px center and add padding-left so text doesn't overlap",
        "Click Run",
      ],
      code: `.search {
  background: url("data:image/svg+xml,...") no-repeat left 12px center / 18px;
  padding-left: 40px;
}`,
      playground: {
        html: `<input class="search" type="search" placeholder="Search products...">`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.search {
  width: 280px; padding: 10px 12px 10px 40px; font-size: 16px; border: 1px solid #cbd5e1; border-radius: 8px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cline x1='21' y1='21' x2='16.5' y2='16.5'/%3E%3C/svg%3E") no-repeat left 12px center / 18px;
}`,
      },
      result: "A rounded input with a grey magnifying-glass icon on the left; typed text starts to the right of the icon.",
      explanation: "left 12px center places the icon 12px from the left edge and vertically centered. / 18px sets background-size. Padding keeps text clear of the icon.",
    },
    {
      title: "Parallax Hero with background-attachment: fixed and Shorthand",
      scenario: "Create a hero section whose image stays still while content scrolls over it.",
      steps: [
        "Create a hero section followed by a long content section",
        "Write the background shorthand with color, image, no-repeat, center / cover and fixed",
        "Click Run and scroll inside the preview",
      ],
      code: `.hero {
  background: #0f172a url('mountains.jpg') no-repeat center / cover fixed;
  min-height: 300px;
}`,
      playground: {
        html: `<section class="hero"><h1>Explore the Mountains</h1></section>
<section class="content"><p>Scroll down. The hero image stays fixed while this content moves over it. Notice how the photo seems to sit behind the page.</p><p>More text to make the page scroll...</p><p>Even more text...</p></section>
<section class="hero"><h1>Keep Scrolling</h1></section>
<section class="content"><p>The end.</p></section>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.hero { background: #0f172a url('https://picsum.photos/id/1018/1200/800') no-repeat center / cover fixed;
  min-height: 300px; display: grid; place-items: center; color: white; text-shadow: 0 2px 8px rgba(0,0,0,0.7); }
.content { background: white; padding: 40px 16px; min-height: 250px; line-height: 1.7; }`,
      },
      result: "While scrolling, the mountain photos stay still behind the page, and white content sections slide over them like windows.",
      explanation: "background-attachment: fixed attaches the image to the viewport instead of the element. The shorthand sets color, image, repeat, position / size and attachment in one line.",
    },
  ],
  interview: [
    { q: "What is the difference between background-size cover and contain?", a: "cover scales the image to completely cover the box, possibly cropping it. contain scales it so the whole image is visible inside the box, possibly leaving empty space.", level: "Easy" },
    { q: "When should you use <img> instead of background-image?", a: "When the image is content (it has meaning, needs alt text, should be printed/indexed). Background images are for decoration.", level: "Medium" },
    { q: "What is the default value of background-repeat?", a: "repeat (tiles in both directions).", level: "Easy" },
    { q: "Why set a background-color along with a background image?", a: "As a fallback while the image loads or if it fails, and to maintain text contrast.", level: "Easy" },
    { q: "How do you write position and size together in the background shorthand?", a: "position / size, e.g. background: url(a.jpg) center / cover no-repeat;", level: "Medium" },
    { q: "What does background-attachment: fixed do?", a: "It fixes the background relative to the viewport, so it doesn't move when scrolling, creating a parallax-like effect.", level: "Medium" },
    { q: "Can an element have multiple background images?", a: "Yes. Comma-separate them in background-image (and matching lists for repeat/position/size). The first listed is drawn on top.", level: "Medium" },
    { q: "Relative URLs in a CSS file are relative to what?", a: "To the stylesheet's own location, not the HTML document.", level: "Hard" },
    { q: "What does the background shorthand do to unspecified sub-properties?", a: "Resets them to their initial values, which can accidentally remove a previously set image or size.", level: "Hard" },
    { q: "What does background-clip: text do?", a: "Clips the background to the text glyphs, so with transparent text color you get gradient or image-filled text.", level: "Hard" },
  ],
  practice: [
    {
      task: "Give a div a light blue background color and a 3px dashed navy border.",
      hint: "background-color plus border.",
      solution: `<div class="note">Note</div>
<style>.note { background-color: #e0f2fe; border: 3px dashed navy; padding: 16px; }</style>`,
    },
    {
      task: "Create a 400×250 banner with a picsum image that covers the area, is centered and does not repeat.",
      hint: "background-size: cover; background-position: center.",
      solution: `<div class="banner"></div>
<style>
.banner { width: 400px; height: 250px;
  background: #ccc url('https://picsum.photos/800/500') no-repeat center / cover; }
</style>`,
    },
    {
      task: "Place a small image in the bottom-right corner of a card, 16px from each edge.",
      hint: "background-position: right 16px bottom 16px.",
      solution: `<div class="card">Card content</div>
<style>
.card { width: 300px; height: 180px; padding: 16px; border: 1px solid #ddd;
  background: url('https://picsum.photos/50') no-repeat right 16px bottom 16px; }
</style>`,
    },
    {
      task: "Build a full-height hero with a fixed background image, dark fallback color and centered white heading using a single background shorthand.",
      hint: "background: color url() no-repeat center / cover fixed;",
      solution: `<section class="hero"><h1>Hello</h1></section>
<style>
body { margin: 0; }
.hero { min-height: 100vh; display: grid; place-items: center; color: white;
  background: #111 url('https://picsum.photos/1600/900') no-repeat center / cover fixed; }
</style>`,
    },
  ],
  quiz: [
    { question: "Which value prevents a background image from tiling?", options: ["repeat-x", "no-repeat", "space", "round"], answer: 1, explanation: "no-repeat displays the image once." },
    { question: "Which background-size crops the image to fill the box?", options: ["contain", "auto", "100px", "cover"], answer: 3, explanation: "cover fills the box and may crop." },
    { question: "What is the default background-position?", options: ["0% 0% (top left)", "center", "bottom right", "50% 50%"], answer: 0, explanation: "Images start at the top-left by default." },
    { question: "Which background-attachment value keeps the image still while scrolling?", options: ["scroll", "local", "fixed", "static"], answer: 2, explanation: "fixed attaches it to the viewport." },
    { question: "In the shorthand, how are position and size separated?", options: ["Comma", "Slash /", "Semicolon", "Colon"], answer: 1, explanation: "center / cover." },
  ],
};
