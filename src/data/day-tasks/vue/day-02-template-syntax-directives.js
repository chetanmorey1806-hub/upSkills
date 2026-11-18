export default {
  lesson: 'day-02-template-syntax-directives',
  minutes: 30,
  intro: 'Practise interpolation and the core directives v-bind, v-on, v-if, v-for and v-model by writing your own templates.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What are the shorthands for `v-bind:href` and `v-on:click`?',
      options: ['#href and @click', ':href and @click', '@href and :click', '.href and #click'],
      answer: 1,
      explain: '`:` is short for **v-bind** (bind an attribute/prop to an expression) and `@` is short for **v-on** (listen to an event). `#` is the shorthand for `v-slot`, which you will meet later.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `v-html` are TRUE? (choose all that apply)',
      options: [
        'It renders a string as real HTML instead of plain text',
        'Using it with user-entered content can allow XSS attacks',
        'It is the recommended way to show every piece of text',
        '`{{ }}` interpolation escapes HTML, so `<b>` is shown as text',
      ],
      answers: [0, 1, 3],
      explain: '`{{ }}` is safe because it escapes HTML. `v-html` inserts raw HTML, so a comment like `<img src=x onerror=alert(1)>` would run script. Use it only for trusted (or sanitised) HTML.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which directive creates a **two-way binding** between an `<input>` and a piece of state?',
      accept: ['v-model'],
      explain: '`v-model="name"` sets the input value from `name` and updates `name` on every `input` event. It is shorthand for `:value="name" @input="name = $event.target.value"`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Data: `marks = 60`, `courses = ["HTML", "Vue"]`. What visible text does the template produce? Write each line on its own line.',
      code: `<p v-if="marks >= 75">Distinction</p>
<p v-else-if="marks >= 35">Pass</p>
<p v-else>Fail</p>
<ul>
  <li v-for="(c, i) in courses">{{ i + 1 }}. {{ c }}</li>
</ul>`,
      expected: 'Pass\n1. HTML\n2. Vue',
      explain: 'Only the first matching branch of a `v-if` / `v-else-if` / `v-else` chain is rendered. `v-for="(item, index) in list"` gives the index as the second variable, starting at 0, hence `i + 1`.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 8,
      q: 'Write the **template** yourself (use the `template` option). The state is given in the starter. Render:\n- `<a id="site">` whose `href` is bound to `url` and whose text is `site`\n- `<ul id="courses">` with one `<li>` per course (use `v-for` with a `:key`)\n- `<button id="add">` that runs `addCourse` on click\n\nThe checks click **add** once.',
      html: '<div id="app"></div>',
      example: { title: 'a template string with directives', code: "createApp({\n  template: `\n    <img :src=\"photo\" :alt=\"name\">\n    <li v-for=\"s in skills\" :key=\"s\">{{ s }}</li>\n    <button @click=\"save\">Save</button>`,\n  setup() { /* ... */ },\n})" },
      starter: "const { createApp, ref } = Vue;\n\ncreateApp({\n  template: `\n    <!-- TODO -->\n  `,\n  setup() {\n    const site = ref('UpSkillr');\n    const url = ref('https://upskillr.in');\n    const courses = ref(['HTML', 'CSS']);\n    function addCourse() { courses.value.push('Vue'); }\n    return { site, url, courses, addCourse };\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref } = Vue;\n\ncreateApp({\n  template: `\n    <a id=\"site\" :href=\"url\">{{ site }}</a>\n    <ul id=\"courses\">\n      <li v-for=\"c in courses\" :key=\"c\">{{ c }}</li>\n    </ul>\n    <button id=\"add\" @click=\"addCourse\">Add Vue</button>\n  `,\n  setup() {\n    const site = ref('UpSkillr');\n    const url = ref('https://upskillr.in');\n    const courses = ref(['HTML', 'CSS']);\n    function addCourse() { courses.value.push('Vue'); }\n    return { site, url, courses, addCourse };\n  },\n}).mount('#app');",
      actions: [{ click: '#add' }],
      checks: [
        { sel: '#site', attr: { name: 'href', value: 'https://upskillr.in' }, msg: 'Bind the link href to url with :href' },
        { sel: '#site', textEq: 'UpSkillr', msg: 'The link text must come from site ({{ site }})' },
        { sel: '#courses li', count: 3, msg: 'After clicking Add there must be 3 <li> (render them with v-for from courses)' },
        { sel: '#courses li', index: 2, textEq: 'Vue', msg: 'The third course must be "Vue"' },
      ],
      explain: 'Writing `href="url"` without the colon would set the literal text "url". The list must come from `v-for`, otherwise the new course pushed by the button would never appear; that is the power of declarative rendering.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 7,
      q: 'Write the template **and** the state for a greeting form:\n- `<input id="name">` bound with `v-model` to `name` (starts empty)\n- `<p id="greet">` that shows `Hello, <name>!` only when the name is not empty (`v-if`)\n- otherwise `<p id="hint">Type your name</p>` (`v-else`)\n\nThe checks type **Ravi**.',
      html: '<div id="app"></div>',
      example: { title: 'v-model with v-if', code: "<input v-model=\"city\">\n<p v-if=\"city\">You live in {{ city }}</p>\n<p v-else>Enter a city</p>" },
      starter: "const { createApp, ref } = Vue;\n\ncreateApp({\n  template: `<!-- TODO -->`,\n  setup() {\n    // TODO\n    return {};\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref } = Vue;\n\ncreateApp({\n  template: `\n    <input id=\"name\" v-model=\"name\" placeholder=\"Your name\">\n    <p id=\"greet\" v-if=\"name\">Hello, {{ name }}!</p>\n    <p id=\"hint\" v-else>Type your name</p>\n  `,\n  setup() {\n    const name = ref('');\n    return { name };\n  },\n}).mount('#app');",
      actions: [{ input: ['#name', 'Ravi'] }],
      checks: [
        { sel: '#greet', textEq: 'Hello, Ravi!', msg: 'After typing Ravi, <p id="greet"> must show "Hello, Ravi!"' },
        { sel: '#hint', notExists: true, msg: 'The hint must be removed (v-else) when a name is typed' },
      ],
      explain: '`v-model` keeps `name` in sync on every keystroke, and `v-if` / `v-else` swap the two paragraphs. `v-else` must come **directly** after the `v-if` element, otherwise Vue reports an error.',
    },
  ],
};
