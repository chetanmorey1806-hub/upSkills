export default {
  id: "day-03-css-colors",
  title: "CSS Colors: Named, HEX, RGB/RGBA, HSL/HSLA and Opacity",
  module: "Module 1: CSS Basics",
  day: 3,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Learn every common way to write colors in CSS, how transparency works with alpha channels, and the important difference between an alpha color and the opacity property.",
  objectives: [
    "Write colors as named keywords, HEX, RGB and HSL",
    "Add transparency using RGBA/HSLA and 8-digit HEX",
    "Explain the difference between alpha transparency and the opacity property",
    "Choose readable color combinations with enough contrast",
  ],
  theory: [
    {
      heading: "Where Colors Are Used",
      content: "Colors can be applied to many properties:\n- `color` - text color\n- `background-color` - element background\n- `border-color`, `outline-color`, `text-decoration-color`, `box-shadow` and more\n\nThe value can be written in several formats. All formats describe the same thing: amounts of red, green and blue light on your screen.",
      syntax: `p {
  color: white;
  background-color: #1e40af;
  border: 2px solid rgb(250, 204, 21);
}`,
    },
    {
      heading: "Named Colors",
      content: "CSS has about **148 named colors** like `red`, `tomato`, `navy`, `teal`, `rebeccapurple`, plus special keywords:\n- `transparent` - fully see-through\n- `currentColor` - uses the element's current text color (handy for borders and SVG icons)\n\nNamed colors are easy to read but limited; brand colors are usually HEX or HSL.",
      syntax: `h1 { color: tomato; }
.icon { border: 2px solid currentColor; }`,
    },
    {
      heading: "HEX Colors",
      content: "HEX writes red, green, blue as two hexadecimal digits each (00 to ff = 0 to 255): `#RRGGBB`.\n\n- `#ff0000` = pure red, `#000000` = black, `#ffffff` = white\n- Short form: `#f00` expands to `#ff0000` (each digit doubled)\n- 8-digit form adds alpha: `#RRGGBBAA`, e.g. `#00000080` = black at about 50% transparency\n\nHEX is what designers usually hand you from Figma.",
      syntax: `.brand { color: #2563eb; }
.short { color: #333; }        /* = #333333 */
.glass { background: #ffffff80; } /* 50% white */`,
      tip: "HEX is case-insensitive (#FFF = #fff), but pick one style and stay consistent.",
    },
    {
      heading: "RGB and RGBA",
      content: "`rgb(red, green, blue)` uses numbers 0-255 (or percentages).\n\n`rgba(r, g, b, alpha)` adds an **alpha** channel from 0 (invisible) to 1 (solid).\n\nModern CSS also accepts the space-separated syntax `rgb(37 99 235 / 0.5)`, and `rgb()` itself now accepts an alpha, so rgba() is just an alias.",
      syntax: `.solid  { background: rgb(37, 99, 235); }
.faded  { background: rgba(37, 99, 235, 0.3); }
.modern { background: rgb(37 99 235 / 30%); }`,
    },
    {
      heading: "HSL and HSLA",
      content: "`hsl(hue, saturation, lightness)` describes colors the way humans think:\n- **Hue**: angle on the color wheel, 0-360 (0 red, 120 green, 240 blue)\n- **Saturation**: 0% grey to 100% vivid\n- **Lightness**: 0% black, 50% normal, 100% white\n\n`hsla()` adds alpha. HSL makes it very easy to build shades: keep the hue, change the lightness.",
      syntax: `.btn       { background: hsl(220, 80%, 50%); }
.btn:hover { background: hsl(220, 80%, 40%); }  /* darker, same hue */
.overlay   { background: hsla(0, 0%, 0%, 0.6); }`,
      tip: "Use HSL when you need a color palette: hsl(220 80% 95%) for a light tint, hsl(220 80% 30%) for a dark shade of the same blue.",
    },
    {
      heading: "Opacity vs Alpha Transparency",
      content: "`opacity: 0.5` makes the **whole element** semi-transparent - background, text, border AND all children.\n\nAn alpha color like `rgba(0,0,0,0.5)` makes only **that one color** transparent. Text inside stays fully readable.\n\nRule of thumb: want a see-through background with solid text? Use an alpha background color, not opacity.",
      points: [
        "opacity ranges from 0 (invisible, but still takes up space and can be clicked) to 1",
        "Children cannot be made more opaque than their parent's opacity",
        "Accessibility: keep text contrast at least 4.5:1 against its background (WCAG AA)",
      ],
    },
  ],
  examples: [
    {
      title: "Same Color, Four Formats",
      scenario: "Prove that named, HEX, RGB and HSL can produce the exact same color.",
      steps: [
        "Create four boxes",
        "Color each one using a different format for the same blue (dodgerblue)",
        "Click Run and compare",
      ],
      code: `.named { background: dodgerblue; }
.hex   { background: #1e90ff; }
.rgb   { background: rgb(30, 144, 255); }
.hsl   { background: hsl(210, 100%, 56%); }`,
      playground: {
        html: `<div class="box named">named</div>
<div class="box hex">#1e90ff</div>
<div class="box rgb">rgb(30,144,255)</div>
<div class="box hsl">hsl(210,100%,56%)</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; display: flex; gap: 10px; flex-wrap: wrap; }
.box { width: 140px; height: 90px; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 13px; }
.named { background: dodgerblue; }
.hex   { background: #1e90ff; }
.rgb   { background: rgb(30, 144, 255); }
.hsl   { background: hsl(210, 100%, 56%); }`,
      },
      result: "Four boxes that look (practically) identical blue.",
      explanation: "dodgerblue is defined as #1e90ff which equals rgb(30,144,255). The HSL value is the rounded equivalent. The format is just notation.",
    },
    {
      title: "Building Shades with HSL",
      scenario: "Create a 5-step palette of one brand hue by changing only the lightness.",
      steps: [
        "Create five swatches",
        "Use hsl(260, 70%, L) with L = 90%, 75%, 60%, 45%, 30%",
        "Click Run",
      ],
      code: `.s1 { background: hsl(260, 70%, 90%); }
.s2 { background: hsl(260, 70%, 75%); }
.s3 { background: hsl(260, 70%, 60%); }
.s4 { background: hsl(260, 70%, 45%); }
.s5 { background: hsl(260, 70%, 30%); }`,
      playground: {
        html: `<div class="row">
  <div class="sw s1">90%</div><div class="sw s2">75%</div><div class="sw s3">60%</div><div class="sw s4">45%</div><div class="sw s5">30%</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; }
.sw { flex: 1; height: 100px; display: flex; align-items: end; justify-content: center; padding-bottom: 8px; font-size: 14px; }
.s1 { background: hsl(260, 70%, 90%); }
.s2 { background: hsl(260, 70%, 75%); }
.s3 { background: hsl(260, 70%, 60%); color: white; }
.s4 { background: hsl(260, 70%, 45%); color: white; }
.s5 { background: hsl(260, 70%, 30%); color: white; }`,
      },
      result: "A strip of five purple swatches from very light to very dark.",
      explanation: "Hue (260 = purple) and saturation stay fixed; only lightness changes, which is why HSL is ideal for design systems.",
    },
    {
      title: "Opacity vs RGBA Background",
      scenario: "Make a translucent caption over an image. Compare opacity with an alpha background.",
      steps: [
        "Place two cards over a picture",
        "Card A: black background + opacity: 0.5",
        "Card B: background rgba(0,0,0,0.5) with no opacity",
        "Click Run and compare the text",
      ],
      code: `.card-a { background: black; opacity: 0.5; }
.card-b { background: rgba(0, 0, 0, 0.5); }`,
      playground: {
        html: `<div class="photo">
  <div class="card card-a">opacity: 0.5 (text fades too)</div>
  <div class="card card-b">rgba(0,0,0,0.5) (text stays crisp)</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.photo { background: url('https://picsum.photos/600/300') center / cover; padding: 20px; display: grid; gap: 16px; border-radius: 8px; }
.card { color: white; padding: 16px; font-size: 18px; font-weight: bold; }
.card-a { background: black; opacity: 0.5; }
.card-b { background: rgba(0, 0, 0, 0.5); }`,
      },
      result: "Both cards show the photo through them, but in card A the white text is faded; in card B the text is fully white.",
      explanation: "opacity applies to the entire element including text. The alpha channel in rgba() affects only the background color.",
    },
    {
      title: "8-digit HEX and currentColor",
      scenario: "Make outlined tags whose border automatically matches their text color.",
      steps: [
        "Create tags with different text colors",
        "Set border: 2px solid currentColor",
        "Give a light tinted background using 8-digit HEX",
        "Click Run",
      ],
      code: `.tag { color: #059669; border: 2px solid currentColor; background: #05966922; }
.tag.warn { color: #d97706; background: #d9770622; }`,
      playground: {
        html: `<span class="tag">Success</span>
<span class="tag warn">Warning</span>
<span class="tag info">Info</span>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.tag { display: inline-block; padding: 6px 14px; border-radius: 999px; font-weight: 600;
  color: #059669; border: 2px solid currentColor; background: #05966922; }
.tag.warn { color: #d97706; background: #d9770622; }
.tag.info { color: #2563eb; background: #2563eb22; }`,
      },
      result: "Green, orange and blue pill tags, each with a matching border and a faint tinted background.",
      explanation: "currentColor copies the color value, so changing one property recolors the border too. The last two hex digits (22) set alpha to about 13%.",
    },
  ],
  interview: [
    { q: "List the color formats supported in CSS.", a: "Named keywords, HEX (#rgb, #rrggbb, #rrggbbaa), rgb()/rgba(), hsl()/hsla(), plus modern ones like hwb(), lab(), lch(), oklch() and keywords transparent and currentColor.", level: "Easy" },
    { q: "What is the difference between opacity and rgba()?", a: "opacity affects the whole element and its children (text, borders, images). rgba() alpha affects only the specific color property it is used on, e.g. just the background.", level: "Medium" },
    { q: "What does the 'a' in rgba/hsla mean?", a: "Alpha: the transparency level from 0 (fully transparent) to 1 (fully opaque).", level: "Easy" },
    { q: "Explain the three values of hsl().", a: "Hue is the angle on the color wheel (0-360deg), saturation is the intensity (0% grey to 100% full color), lightness is 0% black to 100% white with 50% being the pure color.", level: "Medium" },
    { q: "Convert #f0a to its 6-digit form.", a: "#ff00aa. Each digit in shorthand is doubled.", level: "Easy" },
    { q: "What is currentColor?", a: "A keyword that resolves to the element's computed color value. Useful to keep borders, shadows and SVG fills in sync with the text color.", level: "Medium" },
    { q: "Why might designers prefer HSL over HEX?", a: "HSL is human-readable: you can create lighter/darker shades or hover states by changing only lightness, and build consistent palettes by keeping hue fixed.", level: "Medium" },
    { q: "Does an element with opacity: 0 still take space and receive clicks?", a: "Yes. It is invisible but still occupies layout space and receives pointer events, unlike display: none.", level: "Hard" },
    { q: "What contrast ratio does WCAG AA require for normal text?", a: "At least 4.5:1 (3:1 for large text, 18pt or 14pt bold).", level: "Hard" },
    { q: "What is the default value of background-color?", a: "transparent.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create three paragraphs with text colors written as a named color, a HEX color and an RGB color.",
      hint: "color: teal; color: #e11d48; color: rgb(...)",
      solution: `<p class="a">Named</p><p class="b">HEX</p><p class="c">RGB</p>
<style>
.a { color: teal; }
.b { color: #e11d48; }
.c { color: rgb(124, 58, 237); }
</style>`,
    },
    {
      task: "Make a button with background hsl(150, 60%, 40%) that becomes 10% darker on hover using HSL.",
      hint: "Only change the lightness value in :hover.",
      solution: `<button class="go">Continue</button>
<style>
.go { background: hsl(150, 60%, 40%); color: white; border: none; padding: 10px 20px; border-radius: 6px; }
.go:hover { background: hsl(150, 60%, 30%); }
</style>`,
    },
    {
      task: "Place white heading text on a picture with a semi-transparent dark overlay so the text stays fully readable.",
      hint: "Use an rgba background on the text container, not opacity.",
      solution: `<div class="hero"><h1>Explore</h1></div>
<style>
.hero { background: url('https://picsum.photos/800/300') center / cover; padding: 60px 20px; }
.hero h1 { background: rgba(0, 0, 0, 0.55); color: white; padding: 16px; margin: 0; }
</style>`,
    },
    {
      task: "Build a palette of four boxes in the same hue (200) with lightness 85%, 65%, 45%, 25% and label each with its HSL value.",
      hint: "Use a class per box.",
      solution: `<div class="p p1">hsl(200 70% 85%)</div>
<div class="p p2">hsl(200 70% 65%)</div>
<div class="p p3">hsl(200 70% 45%)</div>
<div class="p p4">hsl(200 70% 25%)</div>
<style>
.p { padding: 20px; }
.p1 { background: hsl(200 70% 85%); }
.p2 { background: hsl(200 70% 65%); }
.p3 { background: hsl(200 70% 45%); color: white; }
.p4 { background: hsl(200 70% 25%); color: white; }
</style>`,
    },
  ],
  quiz: [
    { question: "Which HEX code is white?", options: ["#000000", "#ff0000", "#ffffff", "#00ff00"], answer: 2, explanation: "ff for red, green and blue = white." },
    { question: "What is the range of each value in rgb()?", options: ["0-255", "0-100", "0-360", "0-1"], answer: 0, explanation: "Each channel is 0-255 (or 0%-100%)." },
    { question: "In hsl(120, 100%, 50%), what color do you get?", options: ["Red", "Blue", "Black", "Green"], answer: 3, explanation: "Hue 120 is green; 100% saturation, 50% lightness = pure green." },
    { question: "Which makes ONLY the background semi-transparent?", options: ["opacity: 0.5", "background: rgba(0,0,0,0.5)", "visibility: 0.5", "filter: none"], answer: 1, explanation: "Alpha in the color affects only that property." },
    { question: "What does #abc expand to?", options: ["#abcabc", "#a0b0c0", "#000abc", "#aabbcc"], answer: 3, explanation: "Each shorthand digit is doubled." },
  ],
};
