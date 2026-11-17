export default {
  id: "day-11-position-z-index",
  title: "Position: static, relative, absolute, fixed, sticky and z-index",
  module: "Module 2: Box Model & Positioning",
  day: 11,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn how the position property moves elements out of (or within) normal flow, how offsets (top, right, bottom, left) work for each value, and how z-index and stacking contexts decide which element appears on top.",
  objectives: [
    "Explain all five position values and how each affects normal flow",
    "Position a child relative to a parent with relative + absolute",
    "Build fixed headers and sticky table headers / sidebars",
    "Control overlap with z-index and understand stacking contexts",
  ],
  theory: [
    {
      heading: "Normal Flow and position: static",
      content: "By default every element is `position: static`. It sits in the **normal flow**: blocks stack top to bottom, inlines flow left to right.\n\nOffset properties `top`, `right`, `bottom`, `left` and `z-index` have **no effect** on static elements.\n\nAnalogy: normal flow is people standing in a queue. Positioning lets someone step slightly aside, leave the queue entirely, or glue themselves to the window.",
    },
    {
      heading: "position: relative",
      content: "A relative element stays in normal flow (its original space is **kept**), but you can nudge it visually with offsets from where it would have been.\n\n- `top: 10px` moves it **down** 10px (away from the top)\n- `left: 20px` moves it **right**\n\nOther elements do not move to fill the gap.\n\nIts most important job: being the **reference (containing block)** for absolutely positioned children.",
      syntax: `.nudge { position: relative; top: 5px; left: 10px; }
.card  { position: relative; } /* anchor for absolute children */`,
    },
    {
      heading: "position: absolute",
      content: "An absolute element is **removed from normal flow** (it takes no space; siblings move up as if it didn't exist). It is positioned relative to its **nearest positioned ancestor** (any ancestor with position other than static). If none exists, it uses the initial containing block (the page).\n\nCommon uses: badges on cards, close buttons on modals, tooltips, dropdown menus, overlays.\n\n`inset: 0` is shorthand for top/right/bottom/left: 0 and stretches the element over its container.",
      syntax: `.card  { position: relative; }
.badge { position: absolute; top: 10px; right: 10px; }`,
      tip: "Most common bug: forgetting position: relative on the parent, so the 'badge' flies to the corner of the whole page.",
    },
    {
      heading: "position: fixed",
      content: "A fixed element is removed from flow and positioned relative to the **viewport** (the browser window). It stays in the same place when you scroll.\n\nUses: sticky navigation bars, 'back to top' buttons, chat widgets, cookie banners.\n\nBecause it doesn't take space, a fixed header covers page content: add padding-top to the body equal to the header height.",
      syntax: `.chat-btn { position: fixed; bottom: 20px; right: 20px; }`,
      tip: "If an ancestor has transform, filter or perspective set, fixed elements become positioned relative to that ancestor instead of the viewport.",
    },
    {
      heading: "position: sticky",
      content: "Sticky is a hybrid: the element behaves like **relative** until scrolling reaches a threshold (e.g. `top: 0`), then it sticks like **fixed** - but only within its **parent container**. When the parent scrolls away, the sticky element leaves with it.\n\nRequirements:\n- You must set at least one threshold (top, bottom...)\n- No ancestor between it and the scroll container may have overflow: hidden/auto that cuts it off\n- The parent must be taller than the sticky element, otherwise there is no room to stick\n\nUses: table headers, section headings in long lists, sidebars.",
      syntax: `thead th { position: sticky; top: 0; }`,
    },
    {
      heading: "z-index and Stacking Context",
      content: "When positioned elements overlap, `z-index` decides which is on top. Higher number = closer to the viewer. It works only on positioned elements (and flex/grid items).\n\n**Stacking context**: certain properties create an isolated 'layer group' (position + z-index other than auto, opacity < 1, transform, filter, position: fixed/sticky, isolation: isolate...). Children's z-index values only compete **inside** their own context.\n\nThat is why a child with z-index: 9999 can still appear **under** another element: its parent's whole group is lower.\n\nAnalogy: stacking contexts are folders of papers. A paper's number decides its order only within its folder; whole folders are ordered by their own numbers.",
      syntax: `.modal-backdrop { position: fixed; inset: 0; z-index: 100; }
.modal          { position: fixed; z-index: 101; }`,
      tip: "Avoid z-index wars (9999, 99999). Define a small scale such as 10 dropdown, 100 header, 1000 modal.",
    },
  ],
  examples: [
    {
      title: "Relative vs Absolute: Notification Badge",
      scenario: "Place a red count badge on the top-right corner of a card.",
      steps: [
        "Create a .card with position: relative",
        "Add a .badge child with position: absolute; top: -10px; right: -10px",
        "Add a second card WITHOUT position: relative to see the bug",
        "Click Run",
      ],
      code: `.card  { position: relative; }
.badge { position: absolute; top: -10px; right: -10px; }`,
      playground: {
        html: `<div class="card ok">Inbox<span class="badge">5</span></div>
<div class="card broken">Broken (no position: relative)<span class="badge">!</span></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 30px 16px; }
.card { width: 220px; padding: 24px; margin-bottom: 30px; background: #f1f5f9; border-radius: 10px; }
.ok { position: relative; }
.badge { position: absolute; top: -10px; right: -10px; background: #dc2626; color: white; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 13px; }`,
      },
      result: "The '5' badge sits on the corner of the Inbox card. The '!' badge from the broken card jumps to the top-right corner of the whole page.",
      explanation: "Absolute elements look for the nearest positioned ancestor. The first card is positioned (relative); the second isn't, so its badge uses the page.",
    },
    {
      title: "Relative Offsets Keep Original Space",
      scenario: "Nudge a box and see that its original space remains.",
      steps: [
        "Create three boxes in a row",
        "Give the middle box position: relative; top: 30px; left: 30px",
        "Click Run",
      ],
      code: `.moved { position: relative; top: 30px; left: 30px; }`,
      playground: {
        html: `<div class="box">1</div><div class="box moved">2 (relative)</div><div class="box">3</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { display: inline-block; width: 110px; height: 70px; background: #bbf7d0; border: 2px solid #15803d; margin-right: 8px; text-align: center; line-height: 70px; }
.moved { position: relative; top: 30px; left: 30px; background: #fde047; opacity: 0.9; }`,
      },
      result: "Box 2 shifts 30px down and right, overlapping box 3, while boxes 1 and 3 stay exactly where they were.",
      explanation: "Relative positioning moves the element visually but the layout still reserves its original slot.",
    },
    {
      title: "Fixed Header and Sticky Section Titles",
      scenario: "Build a page with a fixed top bar and section headings that stick while their section is scrolling.",
      steps: [
        "Create a header with position: fixed; top: 0",
        "Add padding-top to the body so content isn't hidden",
        "Give each section's h2 position: sticky; top: 50px",
        "Click Run and scroll inside the preview",
      ],
      code: `header { position: fixed; top: 0; left: 0; right: 0; height: 50px; z-index: 10; }
body   { padding-top: 50px; }
section h2 { position: sticky; top: 50px; }`,
      playground: {
        html: `<header>Fixed Header</header>
<section><h2>Section A</h2><p>Scroll...</p><p>Lorem ipsum dolor sit amet.</p><p>Consectetur adipiscing elit.</p><p>Sed do eiusmod tempor.</p><p>Ut enim ad minim veniam.</p></section>
<section><h2>Section B</h2><p>Scroll...</p><p>Lorem ipsum dolor sit amet.</p><p>Consectetur adipiscing elit.</p><p>Sed do eiusmod tempor.</p><p>Ut enim ad minim veniam.</p></section>
<section><h2>Section C</h2><p>Scroll...</p><p>Lorem ipsum dolor sit amet.</p><p>Consectetur adipiscing elit.</p><p>Sed do eiusmod tempor.</p><p>Ut enim ad minim veniam.</p></section>`,
        css: `body { margin: 0; padding-top: 50px; font-family: system-ui, sans-serif; }
header { position: fixed; top: 0; left: 0; right: 0; height: 50px; line-height: 50px; padding: 0 16px; background: #1e293b; color: white; z-index: 10; }
section { padding: 0 16px 20px; }
section p { line-height: 2.4; margin: 0; }
section h2 { position: sticky; top: 50px; margin: 0; padding: 8px 0; background: #e0e7ff; }`,
      },
      result: "The dark header never moves. Each section's blue heading sticks just below the header while its section scrolls, then is pushed away by the next section.",
      explanation: "fixed attaches to the viewport. sticky behaves like relative until it reaches top: 50px, then sticks - but only within its parent <section>.",
    },
    {
      title: "z-index and the Stacking Context Trap",
      scenario: "Three overlapping cards; then see why a child with z-index 999 cannot escape its parent's layer.",
      steps: [
        "Create overlapping absolute boxes and give them z-index 1, 2, 3",
        "Create .parentA (z-index: 1) containing a child with z-index: 999",
        "Create .parentB (z-index: 2) overlapping it",
        "Click Run",
      ],
      code: `.parentA { position: relative; z-index: 1; }
.parentA .child { position: relative; z-index: 999; }
.parentB { position: relative; z-index: 2; }   /* B still wins */`,
      playground: {
        html: `<div class="stage">
  <div class="c c1">z 1</div>
  <div class="c c2">z 3</div>
  <div class="c c3">z 2</div>
</div>
<div class="stage2">
  <div class="parentA">Parent A (z 1)<div class="child">Child z 999</div></div>
  <div class="parentB">Parent B (z 2)</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.stage { position: relative; height: 170px; }
.c { position: absolute; width: 120px; height: 100px; padding: 8px; color: white; border-radius: 8px; }
.c1 { top: 0; left: 0; background: #ef4444; z-index: 1; }
.c2 { top: 30px; left: 60px; background: #3b82f6; z-index: 3; }
.c3 { top: 60px; left: 120px; background: #10b981; z-index: 2; }
.stage2 { position: relative; height: 180px; }
.parentA { position: absolute; top: 0; left: 0; width: 220px; height: 140px; background: #fbbf24; z-index: 1; padding: 8px; }
.child { position: relative; z-index: 999; top: 40px; left: 80px; width: 180px; padding: 10px; background: #7c3aed; color: white; }
.parentB { position: absolute; top: 50px; left: 140px; width: 200px; height: 110px; background: #0ea5e9; color: white; z-index: 2; padding: 8px; }`,
      },
      result: "Top area: blue (z 3) is above green (z 2), which is above red (z 1), even though green comes later in HTML. Bottom area: the purple 'Child z 999' is hidden under Parent B.",
      explanation: "Higher z-index wins among siblings. But Parent A forms a stacking context with z-index 1; everything inside it, even z-index 999, is painted as part of layer 1, which is below Parent B's layer 2.",
    },
  ],
  interview: [
    { q: "Explain the five position values.", a: "static: default, normal flow, offsets ignored. relative: stays in flow, offset from its normal position, keeps its space. absolute: removed from flow, positioned to nearest positioned ancestor. fixed: removed from flow, positioned to viewport. sticky: relative until a scroll threshold, then sticks within its parent.", level: "Easy" },
    { q: "What does an absolutely positioned element use as its reference?", a: "Its containing block: the nearest ancestor with position other than static (or with transform/filter etc.). If none, the initial containing block.", level: "Medium" },
    { q: "What is the difference between relative and absolute?", a: "Relative keeps the element's space in the flow and offsets it visually from its own spot. Absolute removes it from flow and positions it relative to a positioned ancestor.", level: "Easy" },
    { q: "Why isn't my position: sticky working?", a: "Common causes: no top/bottom threshold, an ancestor with overflow hidden/auto, the parent is not taller than the element, or the element is in a flex container that stretches it to full height.", level: "Hard" },
    { q: "What is z-index and when does it work?", a: "It sets the stacking order of overlapping elements. It applies to positioned elements (non-static) and flex/grid items.", level: "Easy" },
    { q: "What is a stacking context and what creates one?", a: "An isolated stacking layer whose children are ordered only within it. Created by the root, positioned elements with z-index not auto, fixed/sticky elements, opacity < 1, transform, filter, isolation: isolate, will-change, among others.", level: "Hard" },
    { q: "Why does a child with z-index: 9999 appear behind another element?", a: "Its parent creates a stacking context with a lower z-index than the other element; the child cannot escape the parent's layer.", level: "Hard" },
    { q: "How do you stretch an absolute overlay over its parent?", a: "Parent position: relative; overlay position: absolute; inset: 0 (top/right/bottom/left: 0).", level: "Medium" },
    { q: "How do you prevent a fixed header from covering content?", a: "Add padding-top (or margin-top) to the body/main equal to the header height, or use scroll-padding-top for anchor links.", level: "Medium" },
    { q: "What does top: 20px do on a relative element?", a: "Moves it 20px down from its normal position.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create a product card with a 'SALE' ribbon in its top-left corner using absolute positioning.",
      hint: "Parent relative, ribbon absolute top: 0; left: 0.",
      solution: `<div class="product"><span class="ribbon">SALE</span><img src="https://picsum.photos/240/160" alt="Product"><p>Sneakers</p></div>
<style>
.product { position: relative; width: 240px; }
.product img { display: block; width: 100%; }
.ribbon { position: absolute; top: 0; left: 0; background: crimson; color: white; padding: 4px 10px; font-weight: bold; }
</style>`,
    },
    {
      task: "Add a circular 'back to top' button fixed 24px from the bottom-right of the viewport.",
      hint: "position: fixed; bottom; right.",
      solution: `<a href="#" class="top">↑</a>
<style>
.top { position: fixed; bottom: 24px; right: 24px; width: 48px; height: 48px; border-radius: 50%; background: #111; color: white; text-align: center; line-height: 48px; text-decoration: none; z-index: 50; }
</style>`,
    },
    {
      task: "Build a scrollable table (height 200px) whose header row sticks to the top while rows scroll.",
      hint: "Wrapper overflow: auto; th position: sticky; top: 0 with a background.",
      solution: `<div class="wrap">
<table>
  <thead><tr><th>Name</th><th>Score</th></tr></thead>
  <tbody>
    <tr><td>Asha</td><td>91</td></tr><tr><td>Ben</td><td>84</td></tr><tr><td>Chen</td><td>77</td></tr>
    <tr><td>Dia</td><td>88</td></tr><tr><td>Eli</td><td>69</td></tr><tr><td>Fay</td><td>95</td></tr>
    <tr><td>Gus</td><td>73</td></tr><tr><td>Hana</td><td>81</td></tr>
  </tbody>
</table>
</div>
<style>
.wrap { height: 200px; overflow: auto; width: 260px; border: 1px solid #ccc; }
table { width: 100%; border-collapse: collapse; }
th { position: sticky; top: 0; background: #1e3a8a; color: white; }
th, td { padding: 8px; text-align: left; }
</style>`,
    },
    {
      task: "Create a modal: a fixed semi-transparent backdrop covering the screen (z-index 100) and a centered white box above it (z-index 101).",
      hint: "inset: 0 for the backdrop; top: 50%; left: 50%; transform: translate(-50%, -50%) for centering.",
      solution: `<div class="backdrop"></div>
<div class="modal">Hello, I am a modal</div>
<style>
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px; border-radius: 10px; z-index: 101; }
</style>`,
    },
  ],
  quiz: [
    { question: "What is the default position value?", options: ["relative", "absolute", "static", "fixed"], answer: 2, explanation: "Elements are static by default." },
    { question: "Which value keeps the element's original space in the layout?", options: ["relative", "absolute", "fixed", "None of them"], answer: 0, explanation: "Relative elements remain in normal flow." },
    { question: "An absolute element is positioned relative to:", options: ["Its next sibling", "Always the viewport", "Its previous sibling", "The nearest positioned ancestor"], answer: 3, explanation: "Nearest ancestor with position not static." },
    { question: "Which value sticks during scroll but only within its parent?", options: ["fixed", "sticky", "absolute", "static"], answer: 1, explanation: "Sticky is bounded by its container." },
    { question: "Does z-index work on position: static elements (not flex/grid items)?", options: ["Yes, always", "Only with negative values", "No", "Only on inline elements"], answer: 2, explanation: "z-index needs a positioned element (or flex/grid item)." },
  ],
};
