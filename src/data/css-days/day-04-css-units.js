export default {
  id: "day-04-css-units",
  title: "CSS Units: px, %, em, rem, vw, vh and ch",
  module: "Module 1: CSS Basics",
  day: 4,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Understand absolute and relative CSS units, what each unit is relative to, and when to choose px, %, em, rem, vw, vh or ch for sizes, spacing and typography.",
  objectives: [
    "Differentiate absolute units (px) from relative units",
    "Explain what %, em and rem are relative to and avoid the em compounding trap",
    "Use viewport units (vw, vh) for full-screen sections",
    "Use ch to limit line length for readable text",
  ],
  theory: [
    {
      heading: "Absolute vs Relative Units",
      content: "Every length in CSS needs a number and a unit (except 0, which can be unitless).\n\n- **Absolute units** have a fixed size: `px` (pixels), plus print units like cm, mm, in, pt\n- **Relative units** depend on something else: the parent (%), the font size (em, rem, ch) or the browser window (vw, vh)\n\nAnalogy: px is like saying 'the table is 2 metres long'. Relative units are like saying 'the table is half the room' - it changes when the room changes.",
      tip: "Common mistake: width: 200 (no unit). Without a unit the declaration is invalid and ignored. Only 0 may omit the unit.",
    },
    {
      heading: "px (Pixels)",
      content: "`px` is the most common absolute unit. A CSS pixel is a reference pixel, not a physical screen dot: on high-density (Retina) screens one CSS pixel may be 2 or 3 device pixels.\n\nGood for: borders (1px), shadows, small fixed details.\nNot ideal for: font sizes (it can ignore the user's preferred browser font size) and fluid layouts.",
      syntax: `.card { border: 1px solid #ddd; padding: 16px; }`,
    },
    {
      heading: "% (Percentage)",
      content: "Percentages are relative to the **parent** (the containing block), but which parent value depends on the property:\n- `width: 50%` → half of the parent's width\n- `font-size: 120%` → 1.2 × parent's font size\n- `padding`/`margin` in % → based on the parent's **width** (even for top/bottom!)\n- `height: 50%` only works if the parent has an explicit height",
      syntax: `.sidebar { width: 30%; }
.main    { width: 70%; }`,
      tip: "height: 100% does nothing if the parent's height is auto. This confuses many beginners.",
    },
    {
      heading: "em and rem (Font-Relative Units)",
      content: "**em** is relative to the font-size of the **element itself** (for font-size, relative to the parent's font size). If a button has font-size 20px, `padding: 1em` = 20px.\n\n**rem** (root em) is relative to the font-size of the **root <html> element**, which is 16px by default. `2rem` = 32px everywhere, no matter where the element is.\n\n**The em compounding trap**: nested elements with font-size: 1.2em keep multiplying: 16 → 19.2 → 23.04... rem never compounds.\n\nBest practice:\n- Use **rem** for font sizes and most spacing (respects user browser settings, predictable)\n- Use **em** for things that should scale with the component's own text, e.g. button padding or icon size",
      syntax: `html { font-size: 16px; }   /* default */
h1  { font-size: 2rem; }    /* 32px */
.btn { font-size: 1.25rem; padding: 0.5em 1em; } /* padding scales with button text */`,
    },
    {
      heading: "vw and vh (Viewport Units)",
      content: "Viewport units are relative to the browser window (viewport):\n- `1vw` = 1% of the viewport **width**\n- `1vh` = 1% of the viewport **height**\n\n`height: 100vh` makes a full-screen hero section. `font-size: 5vw` scales text with screen width.\n\nOn mobile browsers 100vh can be taller than the visible area because of the address bar; newer units `dvh` (dynamic), `svh` and `lvh` fix that.",
      syntax: `.hero { height: 100vh; }
.title { font-size: 6vw; }`,
      tip: "width: 100vw can cause a horizontal scrollbar because it includes the vertical scrollbar width. Prefer width: 100% for full-width blocks.",
    },
    {
      heading: "ch (Character Unit)",
      content: "`1ch` = the width of the character '0' in the current font. It is perfect for limiting text line length.\n\nTypography research suggests 45-75 characters per line is most readable, so `max-width: 65ch` on paragraphs is a popular rule.\n\nQuick unit cheat sheet:\n- Borders: px\n- Font sizes: rem\n- Component padding: em or rem\n- Layout widths: % or fr (later)\n- Full-screen sections: vh / dvh\n- Text column width: ch",
      syntax: `article p { max-width: 65ch; }`,
    },
  ],
  examples: [
    {
      title: "px vs % Widths",
      scenario: "See how a percentage width adapts to its parent while px stays fixed.",
      steps: [
        "Create a parent container that is 80% wide",
        "Add a child with width 300px and another with width 50%",
        "Click Run and resize the preview pane",
      ],
      code: `.fixed   { width: 300px; }
.percent { width: 50%; }`,
      playground: {
        html: `<div class="parent">
  <div class="fixed">width: 300px (never changes)</div>
  <div class="percent">width: 50% (half of parent)</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.parent { width: 80%; border: 2px dashed #64748b; padding: 10px; }
.fixed, .percent { padding: 10px; margin: 8px 0; color: white; }
.fixed   { width: 300px; background: #0891b2; }
.percent { width: 50%; background: #c026d3; }`,
      },
      result: "The cyan box stays 300px wide; the pink box is always half the dashed parent, shrinking or growing as the window is resized.",
      explanation: "% is calculated from the parent's content width. px is absolute.",
    },
    {
      title: "em Compounding vs rem",
      scenario: "Nest three boxes and set font-size 1.3em on each; compare with 1.3rem.",
      steps: [
        "Create two columns of three nested divs",
        "Left column: .em { font-size: 1.3em }",
        "Right column: .rem { font-size: 1.3rem }",
        "Click Run",
      ],
      code: `.em  { font-size: 1.3em; }   /* multiplies at each level */
.rem { font-size: 1.3rem; }  /* always 1.3 × root (20.8px) */`,
      playground: {
        html: `<div class="cols">
  <div>
    <div class="em">em level 1
      <div class="em">em level 2
        <div class="em">em level 3</div>
      </div>
    </div>
  </div>
  <div>
    <div class="rem">rem level 1
      <div class="rem">rem level 2
        <div class="rem">rem level 3</div>
      </div>
    </div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; font-size: 16px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.em, .rem { border-left: 3px solid; padding-left: 8px; margin-top: 6px; }
.em  { font-size: 1.3em;  border-color: #ea580c; }
.rem { font-size: 1.3rem; border-color: #16a34a; }`,
      },
      result: "Left column text keeps getting bigger at each level (20.8px, 27px, 35px). Right column stays the same size at every level.",
      explanation: "em for font-size is relative to the parent's font-size, so it compounds when nested. rem always refers to the root <html> font size.",
    },
    {
      title: "Full-Screen Hero with vh and vw",
      scenario: "Create a landing section that fills the visible window, with a heading that scales with screen width.",
      steps: [
        "Create a section with class hero",
        "Set min-height: 100vh",
        "Set the heading font-size to 8vw",
        "Click Run and resize the preview",
      ],
      code: `.hero { min-height: 100vh; }
.hero h1 { font-size: 8vw; }`,
      playground: {
        html: `<section class="hero">
  <h1>Hello Viewport</h1>
  <p>This section is exactly as tall as the preview window.</p>
</section>
<section class="next"><p>Scroll down: next section</p></section>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.hero { min-height: 100vh; background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.hero h1 { font-size: 8vw; margin: 0; }
.next { padding: 40px; background: #f1f5f9; }`,
      },
      result: "The purple hero fills the whole preview; the heading gets larger or smaller as the preview gets wider or narrower. Scrolling reveals the next section.",
      explanation: "100vh = 100% of viewport height. 8vw = 8% of viewport width, so the font size is fluid.",
    },
    {
      title: "Readable Line Length with ch",
      scenario: "Compare a paragraph that stretches across the screen with one limited to 60ch.",
      steps: [
        "Add two identical long paragraphs",
        "Set max-width: 60ch on the second",
        "Click Run and widen the preview",
      ],
      code: `.readable { max-width: 60ch; }`,
      playground: {
        html: `<p class="wide">Without a limit, this paragraph stretches across the whole screen on wide monitors, so your eyes have to travel a long way back to find the start of the next line. That makes reading tiring.</p>
<p class="readable">With max-width: 60ch, this paragraph never exceeds about sixty characters per line, which typographers consider comfortable to read on any screen size.</p>`,
        css: `body { font-family: Georgia, serif; padding: 16px; line-height: 1.6; font-size: 1.1rem; }
p { padding: 10px; }
.wide { background: #fee2e2; }
.readable { background: #dcfce7; max-width: 60ch; }`,
      },
      result: "The red paragraph spans full width; the green one stops at about 60 characters per line.",
      explanation: "ch is the width of the '0' glyph in the current font, so 60ch adapts to the font and font size automatically.",
    },
  ],
  interview: [
    { q: "What is the difference between em and rem?", a: "em is relative to the font-size of the element itself (or the parent's when used on font-size), so it compounds when nested. rem is relative to the root <html> font-size and does not compound.", level: "Easy" },
    { q: "What is a relative unit? Give examples.", a: "A unit whose size depends on something else: % (parent), em/ch (element font), rem (root font), vw/vh (viewport).", level: "Easy" },
    { q: "Why use rem for font sizes instead of px?", a: "rem scales with the user's browser font-size preference, improving accessibility, and keeps sizes consistent and predictable across components.", level: "Medium" },
    { q: "What is 1vw and 1vh?", a: "1vw is 1% of the viewport width; 1vh is 1% of the viewport height.", level: "Easy" },
    { q: "Why might height: 50% not work?", a: "Percentage heights resolve against the parent's height. If the parent's height is auto (content-based), the percentage cannot be calculated and behaves like auto.", level: "Medium" },
    { q: "What is percentage padding-top relative to?", a: "The width of the containing block, not its height. This is the basis of the old aspect-ratio padding hack.", level: "Hard" },
    { q: "What problem does 100vh have on mobile and how is it fixed?", a: "Mobile browser toolbars make the visible area smaller than 100vh, so content is cut off. Use dynamic viewport units like 100dvh (or svh/lvh).", level: "Hard" },
    { q: "What is the ch unit and a typical use?", a: "The advance width of the '0' character. Commonly used as max-width: 65ch to keep text lines readable.", level: "Medium" },
    { q: "If html font-size is 16px and a div has font-size 20px, what is 2em padding and 2rem padding on that div?", a: "2em = 40px (relative to the div's own 20px). 2rem = 32px (relative to the root 16px).", level: "Medium" },
    { q: "Is a CSS pixel equal to a physical screen pixel?", a: "No. A CSS px is a reference unit; the device pixel ratio maps it to 1, 2, 3 or more physical pixels on high-density screens.", level: "Hard" },
  ],
  practice: [
    {
      task: "Set the root font size to the default and create headings h1=2.5rem, h2=2rem, p=1rem.",
      hint: "Use rem so each is relative to html.",
      solution: `html { font-size: 100%; } /* 16px default */
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
p  { font-size: 1rem; }`,
    },
    {
      task: "Create small, medium and large buttons where only font-size changes, but padding scales automatically.",
      hint: "Use em for padding.",
      solution: `<button class="btn sm">Small</button>
<button class="btn md">Medium</button>
<button class="btn lg">Large</button>
<style>
.btn { padding: 0.5em 1.2em; border-radius: 0.4em; border: none; background: #2563eb; color: white; }
.sm { font-size: 0.8rem; }
.md { font-size: 1rem; }
.lg { font-size: 1.4rem; }
</style>`,
    },
    {
      task: "Build a two-column layout using percentages: sidebar 25%, content 75%, with different background colors.",
      hint: "Use display: inline-block or float for now, or a simple flex container.",
      solution: `<div class="wrap"><aside>Sidebar</aside><main>Content</main></div>
<style>
.wrap { display: flex; }
aside { width: 25%; background: #e0f2fe; padding: 16px; }
main  { width: 75%; background: #fef9c3; padding: 16px; }
</style>`,
    },
    {
      task: "Create a full-height welcome screen (100vh) and an article below it whose paragraphs never exceed 70ch.",
      hint: "min-height: 100vh; max-width: 70ch.",
      solution: `<section class="welcome"><h1>Welcome</h1></section>
<article><p>Long article text goes here...</p></article>
<style>
body { margin: 0; }
.welcome { min-height: 100vh; background: #0f172a; color: white; display: grid; place-items: center; }
article p { max-width: 70ch; margin: 24px auto; line-height: 1.7; }
</style>`,
    },
  ],
  quiz: [
    { question: "If the root font-size is 16px, what is 1.5rem?", options: ["15px", "24px", "16px", "32px"], answer: 1, explanation: "1.5 × 16 = 24px." },
    { question: "What is 50vw?", options: ["50% of parent width", "50px", "50% of viewport width", "50% of viewport height"], answer: 2, explanation: "vw = viewport width." },
    { question: "Which unit compounds when elements are nested?", options: ["em", "rem", "px", "vh"], answer: 0, explanation: "em on font-size multiplies with each parent's font-size." },
    { question: "Which unit is best for limiting text line length?", options: ["vh", "px", "%", "ch"], answer: 3, explanation: "max-width: 65ch keeps lines readable." },
    { question: "Which value is valid without a unit?", options: ["10", "1.5", "0", "100"], answer: 2, explanation: "Only zero lengths may omit the unit." },
  ],
};
