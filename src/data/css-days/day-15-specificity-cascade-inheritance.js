export default {
  id: "day-15-specificity-cascade-inheritance",
  title: "Specificity, Cascade, Inheritance and !important",
  module: "Module 3: Selectors & Cascade",
  day: 15,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Understand exactly how the browser decides which CSS rule wins: the cascade (origin, importance, specificity, order), how to calculate specificity, which properties inherit, and why !important should be a last resort.",
  objectives: [
    "Describe the steps of the cascade in order",
    "Calculate specificity as (inline, IDs, classes, elements) and compare selectors",
    "Know which properties inherit and control it with inherit, initial, unset and revert",
    "Use !important responsibly and debug conflicts in DevTools",
  ],
  theory: [
    {
      heading: "The Cascade: How Conflicts Are Resolved",
      content: "When several declarations set the same property on the same element, the browser picks a winner by checking, in this order:\n\n1. **Origin and importance** - browser defaults < author (your) styles; !important declarations flip the order and beat normal ones\n2. **Cascade layers** (@layer, advanced) - later layers win\n3. **Specificity** - the more specific selector wins\n4. **Source order** - if everything above ties, the declaration that appears **last** wins\n\nInline style attributes take part as the most specific author styles.\n\nAnalogy: a football tie-breaker - first points (importance), then goal difference (specificity), then whoever scored last (order).",
    },
    {
      heading: "Calculating Specificity",
      content: "Specificity is a score written as **(A, B, C)** (some teach it as 4 columns with inline style first):\n\n- **Inline style** attribute: beats any selector (think 1,0,0,0)\n- **A - IDs**: each `#id` adds (1,0,0)\n- **B - classes, attributes, pseudo-classes**: `.btn`, `[type=\"text\"]`, `:hover` each add (0,1,0)\n- **C - elements and pseudo-elements**: `div`, `p`, `::before` each add (0,0,1)\n- Universal `*` and combinators (` `, `>`, `+`, `~`) add **0**\n- `:where()` is always 0; `:is()`, `:not()`, `:has()` take their most specific argument\n\nCompare column by column from left to right; the first bigger column wins. 1 ID beats 100 classes.\n\nExamples:\n- `p` → (0,0,1)\n- `.card p` → (0,1,1)\n- `nav ul li a:hover` → (0,1,4)\n- `#main .card h2` → (1,1,1)",
      syntax: `#header .nav a      /* (1,1,1) */
.nav a.active       /* (0,2,1) */
ul li a             /* (0,0,3) */
/* #header .nav a wins: it has an ID */`,
      tip: "Keep specificity low and flat (mostly single classes). High-specificity selectors force you to write even higher ones later - a 'specificity war'.",
    },
    {
      heading: "Source Order",
      content: "When specificity is equal, the **last** declaration wins. This applies across files too: the stylesheet linked later in the <head> wins over the earlier one.\n\nThat's why you load a framework (like Bootstrap) first and your own custom.css after it.",
      syntax: `.btn { background: blue; }
.btn { background: green; }   /* green wins: same specificity, later */`,
    },
    {
      heading: "Inheritance",
      content: "Some properties are **inherited**: if you set them on a parent, children receive the same value unless they set their own.\n\n- **Inherited** (mostly text-related): color, font-family, font-size, font-weight, line-height, text-align, letter-spacing, visibility, cursor, list-style\n- **Not inherited** (mostly box-related): margin, padding, border, background, width, height, display, position\n\nThat's why setting `font-family` on body changes the whole page, but setting `border` on body doesn't put borders on every element.\n\nImportant: an inherited value has **no specificity at all**. Any rule that directly targets the element, even `*`, beats inherited values.\n\nControl keywords (work on any property):\n- `inherit` - take the parent's value\n- `initial` - reset to the CSS spec's initial value\n- `unset` - inherit if the property is inherited, otherwise initial\n- `revert` - roll back to the browser's default style",
      syntax: `body { color: #333; font-family: system-ui; }  /* inherited by all text */
button { font: inherit; }   /* buttons don't inherit fonts by default */
a.reset { color: inherit; }`,
    },
    {
      heading: "!important",
      content: "Adding `!important` to a declaration makes it beat all normal declarations, regardless of specificity, even inline styles.\n\nIf two !important declarations conflict, specificity and order decide between them.\n\nWhen it's acceptable:\n- Utility classes that must always apply (`.hidden { display: none !important; }`)\n- Overriding third-party inline styles you can't change\n- User accessibility style sheets\n\nWhy avoid it otherwise: it breaks the natural cascade, and the only way to override it is another !important, leading to messy code.",
      syntax: `.text-center { text-align: center !important; }`,
      tip: "Before reaching for !important, open DevTools, find the winning rule (unstruck), and write a selector with equal specificity placed later, or reduce the other selector's specificity.",
    },
    {
      heading: "Debugging with DevTools",
      content: "Inspect an element → Styles panel:\n- Rules are listed from most to least specific\n- Overridden declarations are shown **struck through**\n- Hover a selector to see its specificity (Chrome shows it in a tooltip)\n- The **Computed** tab shows the final value and lets you jump to the rule that set it\n- Inherited rules appear under 'Inherited from ...'\n\nThis ends Module 3. Coming next: Module 4 Layout, starting with float and clear (Day 16).",
    },
  ],
  examples: [
    {
      title: "Specificity Battle",
      scenario: "Four rules try to color the same heading. Predict the winner, then check.",
      steps: [
        "Write h1, .title, #main-title and h1.title rules with different colors",
        "Order them so the weakest comes last",
        "Click Run and see which color wins",
        "Read the console for the computed color",
      ],
      code: `#main-title { color: purple; }   /* (1,0,0) wins */
h1.title    { color: green; }    /* (0,1,1) */
.title      { color: blue; }     /* (0,1,0) */
h1          { color: red; }      /* (0,0,1) */`,
      playground: {
        html: `<h1 id="main-title" class="title">Which color am I?</h1>
<h1 class="title">I have no id</h1>
<h1>Plain h1</h1>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#main-title { color: purple; }
h1.title    { color: green; }
.title      { color: blue; }
h1          { color: red; }`,
        js: `document.querySelectorAll('h1').forEach(function (h) {
  console.log(h.textContent, '->', getComputedStyle(h).color);
});`,
      },
      result: "The first heading is purple, the second green, the third red - even though the red and blue rules come last.",
      explanation: "Specificity is checked before source order. The ID beats everything; h1.title (0,1,1) beats .title (0,1,0); the plain h1 only matches the h1 rule.",
    },
    {
      title: "Source Order Decides Ties",
      scenario: "Two classes with equal specificity are both on one button. Which background wins?",
      steps: [
        "Create a button with class=\"btn-green btn-blue\"",
        "Define .btn-blue first and .btn-green second in CSS",
        "Swap the class order in HTML and run again",
        "Click Run",
      ],
      code: `.btn-blue  { background: #2563eb; }
.btn-green { background: #16a34a; }  /* last in CSS → wins */`,
      playground: {
        html: `<button class="btn btn-blue btn-green">class="btn-blue btn-green"</button>
<button class="btn btn-green btn-blue">class="btn-green btn-blue"</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.btn { color: white; border: none; padding: 12px 18px; border-radius: 6px; margin: 6px; font-size: 15px; }
.btn-blue  { background: #2563eb; }
.btn-green { background: #16a34a; }`,
      },
      result: "Both buttons are green.",
      explanation: "The order of class names in the HTML attribute does not matter. Only the order of rules in the stylesheet matters when specificity ties.",
    },
    {
      title: "Inheritance and Control Keywords",
      scenario: "See which properties pass from parent to child, and use inherit/initial/unset.",
      steps: [
        "Give a .parent color, font and border",
        "Observe that children inherit color/font but not border",
        "Use color: initial, font: inherit on a button, and border: inherit on one child",
        "Click Run",
      ],
      code: `.parent { color: #9333ea; font-family: Georgia, serif; border: 3px solid #9333ea; }
.child-initial { color: initial; }     /* back to black */
.child-border  { border: inherit; }    /* forced to inherit */
button { font: inherit; }              /* buttons don't inherit font by default */`,
      playground: {
        html: `<div class="parent">
  Parent text (purple, serif, bordered)
  <p class="child">Child inherits color and font, but NOT the border.</p>
  <p class="child-initial">color: initial → default black.</p>
  <p class="child-border">border: inherit → I copy the parent's border.</p>
  <button>Default button font</button>
  <button class="inherit-font">font: inherit</button>
</div>`,
        css: `body { padding: 16px; }
.parent { color: #9333ea; font-family: Georgia, serif; font-size: 18px; border: 3px solid #9333ea; padding: 12px; }
.child-initial { color: initial; }
.child-border  { border: inherit; padding: 6px; }
.inherit-font  { font: inherit; }`,
      },
      result: "Normal children are purple serif with no border. The 'initial' child is black. The 'border: inherit' child has its own purple border. The first button uses the system font; the second matches the serif parent font.",
      explanation: "color and font-family are inherited properties; border is not. Keywords let you force or reset inheritance. Form controls use their own font by default, so font: inherit is a common reset.",
    },
    {
      title: "!important vs Inline Style and Inherited Values",
      scenario: "Understand what !important beats, and why a direct rule beats an inherited one.",
      steps: [
        "Give a paragraph an inline style color: blue",
        "Write p.note { color: red !important; } in the stylesheet",
        "Set #box { color: orange } on a parent and span { color: teal } on its child",
        "Click Run",
      ],
      code: `p.note { color: red !important; }  /* beats inline blue */
#box { color: orange; }            /* (1,0,0) but only inherited by span */
span { color: teal; }              /* (0,0,1) targets span directly → wins */`,
      playground: {
        html: `<p class="note" style="color: blue;">Inline says blue, but !important says red.</p>
<div id="box">Parent is orange via #box. <span>But this span is teal.</span></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; font-size: 18px; }
p.note { color: red !important; }
#box { color: orange; }
span { color: teal; font-weight: bold; }`,
      },
      result: "The paragraph is red despite the inline blue. The div text is orange, but the span inside is teal.",
      explanation: "!important declarations beat normal ones, including inline styles. Inherited values have no specificity, so even a weak element selector that targets the span directly wins over the ID-based color it would inherit.",
    },
  ],
  interview: [
    { q: "What is specificity?", a: "A weight the browser calculates for each selector, counting IDs, classes/attributes/pseudo-classes, and elements/pseudo-elements, to decide which conflicting declaration applies.", level: "Easy" },
    { q: "Calculate the specificity of '#nav .item a:hover'.", a: "(1,2,1): one ID, one class plus one pseudo-class, one element.", level: "Medium" },
    { q: "Which wins: '.a .b .c .d .e .f .g .h .i .j .k' (11 classes) or '#x'?", a: "#x. Specificity columns are compared left to right; one ID beats any number of classes.", level: "Medium" },
    { q: "What is the order of the cascade?", a: "Origin and importance (incl. !important), cascade layers, specificity, then source order (last wins). Inline styles count as the most specific author declarations.", level: "Hard" },
    { q: "Which properties are inherited by default? Give examples.", a: "Mainly text properties: color, font-*, line-height, text-align, letter-spacing, visibility, cursor. Box properties like margin, padding, border, background, width are not.", level: "Easy" },
    { q: "Difference between inherit, initial, unset and revert?", a: "inherit takes the parent's value; initial uses the property's spec default; unset behaves as inherit for inherited properties and initial otherwise; revert rolls back to the browser (user-agent) style.", level: "Hard" },
    { q: "Does an inherited value have specificity?", a: "No. Any declaration that directly targets the element, even with * selector, overrides an inherited value.", level: "Medium" },
    { q: "Why is overusing !important bad practice?", a: "It breaks the normal cascade and specificity, making styles hard to override and maintain; the only fix becomes more !important.", level: "Easy" },
    { q: "What is the specificity of :where() and :is()?", a: ":where() always has zero specificity. :is() takes the specificity of its most specific argument.", level: "Hard" },
    { q: "Do combinators and the universal selector add specificity?", a: "No, they add 0.", level: "Medium" },
    { q: "How do you override a style coming from a third-party library?", a: "Load your stylesheet after it and use a selector of equal or greater specificity; use !important only if the library uses inline styles or !important itself.", level: "Medium" },
    { q: "Does the order of class names in the HTML class attribute affect which rule wins?", a: "No. Only the order of rules in the stylesheet (and specificity) matters.", level: "Medium" },
  ],
  practice: [
    {
      task: "Write the specificity for: (a) ul li, (b) .menu li.active, (c) #app nav > a, (d) input[type=\"email\"]:focus, (e) a::before.",
      hint: "(IDs, classes/attr/pseudo-classes, elements/pseudo-elements).",
      solution: `/* (a) ul li                     → (0,0,2)
   (b) .menu li.active           → (0,2,1)
   (c) #app nav > a              → (1,0,2)
   (d) input[type="email"]:focus → (0,2,1)
   (e) a::before                 → (0,0,2) */`,
    },
    {
      task: "A link is styled by '#sidebar a { color: gray; }'. Override it to orange for links with class .highlight WITHOUT !important.",
      hint: "You need at least one ID plus more.",
      solution: `#sidebar a.highlight { color: orange; }  /* (1,1,1) beats (1,0,1) */`,
    },
    {
      task: "Set typography once on body so all text inherits it, and make buttons, inputs and textareas also inherit the font.",
      hint: "font: inherit on form controls.",
      solution: `body { font-family: 'Inter', system-ui, sans-serif; font-size: 1rem; line-height: 1.6; color: #1f2937; }
button, input, select, textarea { font: inherit; color: inherit; }`,
    },
    {
      task: "Create a utility class .hidden that must always hide elements, even if another rule sets display: flex with higher specificity.",
      hint: "This is a valid !important use case.",
      solution: `.hidden { display: none !important; }

/* Even this cannot show it: */
#toolbar .actions { display: flex; }
/* <div id="toolbar"><div class="actions hidden">...</div></div> stays hidden */`,
    },
    {
      task: "Fix the bug: '.card .title { color: navy; }' is set, but '.title-red { color: red; }' on the same h2 does not apply. Give two correct fixes.",
      hint: "Increase specificity of the second, or lower the first.",
      solution: `/* Fix 1: match the specificity and place it later */
.card .title-red { color: red; }

/* Fix 2: lower the first selector's specificity */
.card-title { color: navy; }   /* used instead of .card .title */
.title-red  { color: red; }    /* later, same specificity → wins */`,
    },
  ],
  quiz: [
    { question: "Which selector has the highest specificity?", options: [".nav .item a", "#logo", "ul li a span", "a:hover"], answer: 1, explanation: "An ID (1,0,0) beats any number of classes and elements." },
    { question: "Two rules have identical specificity. Which wins?", options: ["The first one", "The one with more properties", "The one that appears last", "Neither applies"], answer: 2, explanation: "Source order breaks ties: last wins." },
    { question: "Which property is NOT inherited by default?", options: ["color", "font-family", "line-height", "padding"], answer: 3, explanation: "Box model properties don't inherit." },
    { question: "What is the specificity of '.btn:hover'?", options: ["(0,2,0)", "(0,1,1)", "(1,1,0)", "(0,1,0)"], answer: 0, explanation: "Class + pseudo-class = two in the B column." },
    { question: "Which keyword resets a property to the browser's default stylesheet value?", options: ["initial", "revert", "inherit", "auto"], answer: 1, explanation: "revert rolls back to the user-agent style; initial uses the spec's initial value." },
  ],
};
