export default {
  id: "day-05-text-and-fonts",
  title: "Text and Fonts: font-family, Google Fonts, font-size, font-weight, line-height, text-align, text-decoration, text-transform, letter-spacing",
  module: "Module 1: CSS Basics",
  day: 5,
  level: "Beginner",
  duration: "2 hours",
  summary: "Master CSS typography: choosing fonts with fallbacks, loading Google Fonts, and controlling size, weight, spacing, alignment, decoration and case to make text beautiful and readable.",
  objectives: [
    "Write font-family stacks with generic fallbacks and load a Google Font",
    "Control font-size, font-weight and line-height for readability",
    "Align, decorate and transform text",
    "Adjust letter-spacing for headings and labels",
  ],
  theory: [
    {
      heading: "font-family and Font Stacks",
      content: "`font-family` sets the typeface. You give a **list** (a font stack): the browser uses the first font that is available on the user's device.\n\nAlways end with a **generic family** as the final fallback:\n- `serif` (Times-like, with small feet)\n- `sans-serif` (clean, no feet: Arial, Helvetica)\n- `monospace` (every character same width: code)\n- `cursive`, `fantasy`, `system-ui`\n\nFont names with spaces must be quoted: 'Times New Roman'.",
      syntax: `body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
code { font-family: 'Courier New', monospace; }`,
      tip: "Never write a single font without a fallback. If the user doesn't have it, the browser falls back to its default (often Times), breaking your design.",
    },
    {
      heading: "Google Fonts (Web Fonts)",
      content: "Web fonts are downloaded by the browser, so every user sees the same font. Google Fonts is a free library.\n\nSteps:\n1. Go to fonts.google.com, pick a font (e.g. Poppins) and the weights you need\n2. Copy the <link> tags into your <head> (or the @import into your CSS)\n3. Use the font name in font-family with a fallback\n\n`display=swap` in the URL shows fallback text immediately and swaps in the web font when it loads (avoids invisible text).",
      syntax: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">

body { font-family: 'Poppins', sans-serif; }`,
      tip: "Load only the weights you use. Each weight is another file to download and slows the page.",
    },
    {
      heading: "font-size and font-weight",
      content: "`font-size` sets text size. Use rem for accessibility (Day 4). Browser default is 16px. Keywords like small, large also exist.\n\n`font-weight` sets thickness:\n- Numbers 100 to 900 (100 thin, 400 normal, 700 bold, 900 black)\n- Keywords: normal (400), bold (700), lighter, bolder\n\nA weight only looks different if the font provides it (or the browser fakes 'synthetic bold').",
      syntax: `h1 { font-size: 2.5rem; font-weight: 700; }
.caption { font-size: 0.875rem; font-weight: 300; }`,
    },
    {
      heading: "line-height",
      content: "`line-height` controls the vertical space of each line of text (the 'leading').\n\nBest practice: use a **unitless number** like `1.5`. It means 1.5 × the element's font size, and children recalculate it from their own font size. A value like `24px` or `1.5em` is calculated once and inherited as a fixed length, which can cause overlapping text in larger children.\n\nGuideline: body text 1.5-1.7, headings 1.1-1.3.",
      syntax: `body { line-height: 1.6; }
h1   { line-height: 1.2; }`,
    },
    {
      heading: "text-align, text-decoration and text-transform",
      content: "`text-align` aligns inline content horizontally inside its block: left, right, center, justify (and start/end which respect writing direction).\n\n`text-decoration` adds lines: none, underline, overline, line-through. It is shorthand for line, style (solid, dotted, wavy) and color. `text-decoration: none` is commonly used to remove link underlines. `text-underline-offset` moves the underline down.\n\n`text-transform` changes case visually without changing the HTML: uppercase, lowercase, capitalize, none.",
      syntax: `.center { text-align: center; }
a { text-decoration: none; }
.fancy { text-decoration: underline wavy #e11d48; text-underline-offset: 4px; }
.label { text-transform: uppercase; }`,
      tip: "Use text-transform for visual case instead of typing CAPITALS in HTML. Screen readers may spell out capitalised words letter by letter, and changing design later is one CSS edit.",
    },
    {
      heading: "letter-spacing (and word-spacing)",
      content: "`letter-spacing` adds (or removes, with negative values) space between characters. Use em so it scales with font size.\n\n- Uppercase labels look better with a little extra spacing: `0.1em`\n- Large headings often look tighter and more premium with slight negative spacing: `-0.02em`\n\n`word-spacing` does the same between words.\n\nComing next: backgrounds (Day 6).",
      syntax: `.eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem; }
.display  { letter-spacing: -0.03em; }`,
    },
  ],
  examples: [
    {
      title: "Loading and Using a Google Font",
      scenario: "Give a landing page a modern look with Poppins for headings and Inter for body text.",
      steps: [
        "Copy the Google Fonts <link> into the page (in the playground we use @import at the top of the CSS)",
        "Set body to 'Inter', sans-serif",
        "Set headings to 'Poppins', sans-serif",
        "Click Run",
      ],
      code: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@700&display=swap');

body { font-family: 'Inter', sans-serif; }
h1   { font-family: 'Poppins', sans-serif; font-weight: 700; }`,
      playground: {
        html: `<h1>Launch Faster</h1>
<p>Body text uses Inter. The heading uses Poppins Bold. If the fonts cannot load, the sans-serif fallback is used.</p>`,
        css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@700&display=swap');
body { font-family: 'Inter', sans-serif; padding: 16px; color: #1f2937; }
h1   { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 2.5rem; color: #4f46e5; }`,
      },
      result: "A bold geometric indigo heading (Poppins) above clean body text (Inter).",
      explanation: "The @import downloads the font files; font-family then uses them. The generic sans-serif keeps the design reasonable if the network fails.",
    },
    {
      title: "Font Weight and Size Scale",
      scenario: "Show a type scale and the visual effect of different font weights.",
      steps: [
        "Create lines with weights 300, 400, 600, 800",
        "Give headings decreasing rem sizes",
        "Click Run",
      ],
      code: `.w300 { font-weight: 300; }
.w400 { font-weight: 400; }
.w600 { font-weight: 600; }
.w800 { font-weight: 800; }`,
      playground: {
        html: `<p class="w300">Weight 300 - Light</p>
<p class="w400">Weight 400 - Normal</p>
<p class="w600">Weight 600 - Semi Bold</p>
<p class="w800">Weight 800 - Extra Bold</p>
<hr>
<div class="s1">2.5rem Display</div>
<div class="s2">1.75rem Title</div>
<div class="s3">1rem Body</div>
<div class="s4">0.8rem Caption</div>`,
        css: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
body { font-family: 'Inter', system-ui, sans-serif; padding: 16px; }
p { font-size: 1.4rem; margin: 6px 0; }
.w300 { font-weight: 300; } .w400 { font-weight: 400; } .w600 { font-weight: 600; } .w800 { font-weight: 800; }
.s1 { font-size: 2.5rem; } .s2 { font-size: 1.75rem; } .s3 { font-size: 1rem; } .s4 { font-size: 0.8rem; color: #6b7280; }`,
      },
      result: "Four lines getting progressively thicker, then four lines getting progressively smaller.",
      explanation: "font-weight numbers map to the font's available weights (loaded here: 300, 400, 600, 800). rem sizes are relative to the 16px root.",
    },
    {
      title: "line-height and Readability",
      scenario: "Compare cramped text with comfortable text.",
      steps: [
        "Create two identical paragraphs",
        "Give the first line-height: 1 and the second line-height: 1.7",
        "Click Run",
      ],
      code: `.tight { line-height: 1; }
.comfy { line-height: 1.7; }`,
      playground: {
        html: `<p class="tight">Line-height 1: the lines are packed so closely together that long paragraphs become hard to read and the eye easily jumps to the wrong line while reading.</p>
<p class="comfy">Line-height 1.7: there is breathing room between lines, so long paragraphs feel calm and are much easier to read on any screen.</p>`,
        css: `body { font-family: Georgia, serif; padding: 16px; font-size: 1.1rem; max-width: 60ch; }
p { padding: 10px; background: #f8fafc; border-left: 4px solid #94a3b8; }
.tight { line-height: 1; }
.comfy { line-height: 1.7; border-color: #22c55e; }`,
      },
      result: "The first paragraph looks cramped; the second is airy and readable.",
      explanation: "A unitless line-height multiplies the element's font-size, so 1.7 × 17.6px ≈ 30px per line.",
    },
    {
      title: "Alignment, Decoration, Transform and Spacing",
      scenario: "Style a pricing card header: uppercase spaced label, centered title, struck-through old price and fancy link.",
      steps: [
        "Create a card with a label, title, old price and a link",
        "Apply text-transform + letter-spacing to the label",
        "Use text-decoration: line-through on old price and a wavy underline on the link",
        "Center the card text",
      ],
      code: `.card { text-align: center; }
.label { text-transform: uppercase; letter-spacing: 0.15em; }
.old { text-decoration: line-through; }
.link { text-decoration: underline wavy #db2777; text-underline-offset: 5px; }`,
      playground: {
        html: `<div class="card">
  <div class="label">most popular</div>
  <h2>pro plan</h2>
  <p><span class="old">$49</span> <strong>$29</strong> / month</p>
  <a class="link" href="#">see all features</a>
  <p><a class="plain" href="#">Link without underline</a></p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { text-align: center; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 320px; }
.label { text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.75rem; color: #7c3aed; font-weight: 700; }
h2 { text-transform: capitalize; letter-spacing: -0.02em; font-size: 2rem; margin: 8px 0; }
.old { text-decoration: line-through; color: #9ca3af; }
.link { color: #db2777; text-decoration: underline wavy #db2777; text-underline-offset: 5px; }
.plain { text-decoration: none; color: #2563eb; }`,
      },
      result: "A centered card: spaced uppercase purple label, 'Pro Plan' capitalized, the $49 struck through, a pink wavy-underlined link and a plain blue link.",
      explanation: "The HTML text is lowercase; text-transform changes only the display. text-decoration shorthand sets line, style and color in one declaration.",
    },
  ],
  interview: [
    { q: "What is a font stack and why is a generic family important?", a: "A comma-separated list of fonts in font-family. The browser uses the first available one. A generic family (serif, sans-serif, monospace) guarantees a sensible fallback.", level: "Easy" },
    { q: "How do you use a Google Font?", a: "Add the <link> (or @import) from fonts.google.com, then reference the font name in font-family with a fallback, e.g. font-family: 'Roboto', sans-serif.", level: "Easy" },
    { q: "Why is a unitless line-height recommended?", a: "A unitless value is inherited as a ratio and recalculated for each element's font-size. Values with units are computed once and inherited as a fixed length, which can cause overlap in larger child text.", level: "Medium" },
    { q: "What does font-display: swap (display=swap) do?", a: "It shows text immediately with a fallback font and swaps to the web font when loaded, avoiding a flash of invisible text (FOIT).", level: "Hard" },
    { q: "What is the numeric value of font-weight: bold and normal?", a: "bold = 700, normal = 400.", level: "Easy" },
    { q: "How do you remove the underline from links?", a: "a { text-decoration: none; } (ideally keep another visual cue such as color or underline on hover for accessibility).", level: "Easy" },
    { q: "text-transform: uppercase vs typing in capitals - which is better?", a: "text-transform. Content stays semantic and normally cased, screen readers read words naturally, and styling is easily changed.", level: "Medium" },
    { q: "What values can text-align take?", a: "left, right, center, justify, start, end (and match-parent). start/end respect the text direction (LTR/RTL).", level: "Easy" },
    { q: "Why use em for letter-spacing?", a: "So the spacing scales proportionally with the font size; 0.1em looks the same at 12px and 48px.", level: "Medium" },
    { q: "Does text-align: center center a block element like a div?", a: "No. It centers inline content inside the block. To center a block itself use margin: 0 auto with a width (or flex/grid).", level: "Medium" },
    { q: "Why should you limit the number of web font weights you load?", a: "Each weight/style is a separate file, increasing download size and slowing first render.", level: "Medium" },
  ],
  practice: [
    {
      task: "Set the body font to a system font stack, size 1rem, line-height 1.6, and color #222.",
      hint: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      solution: `body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #222;
}`,
    },
    {
      task: "Load the Google Font 'Playfair Display' (700) and use it for all h1 and h2 with a serif fallback.",
      hint: "Use the css2 URL with wght@700 and display=swap.",
      solution: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
h1, h2 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; }
</style>`,
    },
    {
      task: "Create a navigation of links with no underline, uppercase text, 0.1em letter spacing, and an underline that appears on hover.",
      hint: "a { text-decoration: none } and a:hover { text-decoration: underline }",
      solution: `<nav><a href="#">Home</a> <a href="#">Blog</a> <a href="#">Contact</a></nav>
<style>
nav a { text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; color: #111; margin-right: 16px; }
nav a:hover { text-decoration: underline; text-underline-offset: 4px; }
</style>`,
    },
    {
      task: "Design a quote block: centered italic text at 1.5rem, line-height 1.4, and the author name right-aligned in small caps style using uppercase and letter-spacing.",
      hint: "Use font-style: italic; text-align for each part.",
      solution: `<blockquote>
  <p class="q">Simplicity is the soul of efficiency.</p>
  <p class="by">Austin Freeman</p>
</blockquote>
<style>
.q  { text-align: center; font-style: italic; font-size: 1.5rem; line-height: 1.4; }
.by { text-align: right; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.8rem; }
</style>`,
    },
  ],
  quiz: [
    { question: "Which property changes text to capital letters visually?", options: ["font-variant: caps", "text-transform: uppercase", "text-style: upper", "font-case: upper"], answer: 1, explanation: "text-transform: uppercase." },
    { question: "What is the recommended value type for line-height?", options: ["px", "%", "vh", "Unitless number"], answer: 3, explanation: "Unitless values scale per element." },
    { question: "Which font-weight equals 'bold'?", options: ["700", "400", "500", "900"], answer: 0, explanation: "bold = 700." },
    { question: "Which is a generic font family?", options: ["Arial", "Roboto", "monospace", "Poppins"], answer: 2, explanation: "Generic families: serif, sans-serif, monospace, cursive, fantasy, system-ui." },
    { question: "How do you strike through old prices?", options: ["text-decoration: line-through", "text-transform: strike", "font-style: strike", "text-decoration: overline"], answer: 0, explanation: "line-through draws a line across the text." },
  ],
};
