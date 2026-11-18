export default {
  id: 'day-02-template-syntax-directives',
  title: 'Template Syntax, Interpolation and Directives (v-bind, v-on, v-if, v-for, v-model, v-html)',
  module: 'Module 1: Vue Basics',
  day: 2,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Vue templates are HTML with superpowers. Learn text interpolation with {{ }}, JavaScript expressions in templates, and the six core directives you will use every day: v-bind, v-on, v-if, v-for, v-model and v-html, plus their shorthands and modifiers.',
  objectives: [
    'Display data with text interpolation and JavaScript expressions',
    'Bind attributes with v-bind (:) and listen to events with v-on (@)',
    'Show elements conditionally with v-if / v-else and repeat them with v-for',
    'Create two-way bindings with v-model',
    'Render raw HTML with v-html and explain its XSS risk',
  ],
  theory: [
    {
      heading: 'Text interpolation {{ }} and expressions',
      content:
        'The most basic data binding is the "mustache" syntax: `{{ expression }}`. Vue replaces it with the value and updates it whenever the data changes. The content is always treated as **plain text**, so HTML characters are escaped (safe by default).\n\nInside `{{ }}` you can write any **single JavaScript expression**: arithmetic, ternaries, method calls, template strings.\n\n- Allowed: `{{ price * qty }}`, `{{ ok ? "Yes" : "No" }}`, `{{ name.split("").reverse().join("") }}`, `{{ formatDate(d) }}`\n- Not allowed (statements): `{{ let x = 1 }}`, `{{ if (ok) { } }}`\n\nTemplates can only access the component\'s exposed data plus a small allow-list of globals such as `Math`, `Date`, `JSON`, `Number`. Your own `window.myVar` is not visible.\n\nAnalogy: a template is a printed form with blanks. Vue fills each blank `{{ }}` with live values and rewrites the blank whenever the value changes.',
      syntax: `<p>{{ firstName }} {{ lastName }}</p>
<p>Total: {{ price * qty }}</p>
<p>{{ isMember ? 'Member price' : 'Regular price' }}</p>
<p>{{ Math.round(rating * 10) / 10 }}</p>`,
      tip: 'Keep template expressions short. If you need more than a simple expression, move it to a function or a computed property (Day 4).',
    },
    {
      heading: 'Directives: v-bind and v-on',
      content:
        'A **directive** is a special attribute starting with `v-`. Its value is a JavaScript expression, and the directive applies a reactive effect to the DOM.\n\nThe general shape is `v-name:argument.modifier="value"`.\n\n**v-bind** binds an attribute or prop to data. Mustaches do NOT work inside attributes (`src="{{ url }}"` is wrong). Shorthand: `:`\n\n- `<img v-bind:src="imageUrl">` is the same as `<img :src="imageUrl">`\n- Boolean attributes: `<button :disabled="isLoading">` (removed when falsy)\n- Same-name shorthand (Vue 3.4+): `<img :src>` means `:src="src"`\n- Bind many at once: `<input v-bind="{ id: \'email\', type: \'email\' }">`\n- Dynamic argument: `<a :[attrName]="value">`\n\n**v-on** listens to DOM events. Shorthand: `@`\n\n- `<button v-on:click="count++">` is the same as `<button @click="count++">`\n- Method handler: `@click="save"` (receives the native event)\n- Inline handler: `@click="say(\'hi\')"`; use `$event` to access the event: `@click="warn(\'stop\', $event)"`\n- Modifiers: `.prevent` (preventDefault), `.stop` (stopPropagation), `.once`, `.self`; key modifiers `@keyup.enter`, `@keyup.esc`',
      syntax: `<a :href="profileUrl" :title="name">Profile</a>
<button :disabled="!canSave" @click="save">Save</button>
<form @submit.prevent="onSubmit">...</form>
<input @keyup.enter="search">`,
    },
    {
      heading: 'Conditionals and lists: v-if, v-else-if, v-else, v-show, v-for',
      content:
        '**v-if** renders an element only when the expression is truthy; otherwise the element is completely removed from the DOM. It can be followed by `v-else-if` and `v-else`, which must come immediately after.\n\n**v-show** always renders the element and just toggles CSS `display: none`. Use it for things that toggle very often.\n\n**v-for** repeats an element for each item: `v-for="item in items"` or with index `v-for="(item, index) in items"`. It also works on objects `(value, key, index) in obj` and ranges `n in 5` (1 to 5). Always add a unique `:key` so Vue can track each item (Day 6 covers keys in depth).\n\nTo group several elements without adding a wrapper, use `<template v-if>` or `<template v-for>`; the `<template>` tag itself is not rendered.',
      syntax: `<p v-if="score >= 90">Grade A</p>
<p v-else-if="score >= 60">Pass</p>
<p v-else>Fail</p>

<ul>
  <li v-for="(fruit, i) in fruits" :key="fruit">{{ i + 1 }}. {{ fruit }}</li>
</ul>`,
      tip: 'Do not put v-if and v-for on the same element. In Vue 3 v-if runs first, so it cannot see the loop variable. Filter the list in a computed property, or wrap with <template v-for>.',
    },
    {
      heading: 'v-model: two-way binding',
      content:
        '`v-model` keeps a form field and a piece of state in sync in **both directions**: typing updates the data, and changing the data updates the field.\n\nIt is shorthand for a value binding plus an input listener:\n\n`<input v-model="text">` is roughly `<input :value="text" @input="text = $event.target.value">`\n\nIt works with `<input>` (text, checkbox, radio), `<textarea>` and `<select>`. Checkboxes bind to a boolean, or to an array when several checkboxes share the same model. Modifiers such as `.trim`, `.number` and `.lazy` are covered on Day 7.\n\nAnalogy: v-model is a walkie-talkie between the input box and your variable: messages travel both ways.',
      syntax: `<input v-model="name" placeholder="Name">
<p>Hello {{ name }}</p>
<input type="checkbox" v-model="agree"> I agree
<select v-model="city"><option>Pune</option><option>Mumbai</option></select>`,
    },
    {
      heading: 'v-html, v-text, v-once, v-pre and v-cloak',
      content:
        '- **v-html** sets the element\'s `innerHTML`, so HTML in the string is rendered as real markup. Danger: **never use it with user-provided content**, because it opens the door to Cross-Site Scripting (XSS). Use it only for trusted or sanitised HTML (e.g. with DOMPurify). Content inside v-html is not compiled as a Vue template.\n- **v-text** sets `textContent` (same as `{{ }}` on the whole element).\n- **v-once** renders the element once and then treats it as static, skipping future updates.\n- **v-pre** skips compilation: `{{ }}` is displayed literally (useful for showing Vue code on a page).\n- **v-cloak** stays on the element until compilation finishes; combine with `[v-cloak] { display: none }` to hide un-compiled `{{ }}` flicker when using the CDN build.',
      syntax: `<div v-html="trustedHtml"></div>
<span v-text="message"></span>
<h2 v-once>Initial value: {{ count }}</h2>
<code v-pre>{{ this is not compiled }}</code>`,
      tip: 'Common mistake: using v-html to show comments or chat messages typed by users. Interpolation {{ }} is safe; v-html is not.',
    },
  ],
  examples: [
    {
      title: 'Profile card with interpolation and v-bind',
      scenario: 'Display a student profile with an image, a link and a status badge whose text and title depend on the data.',
      steps: [
        'Store name, avatar URL, website and marks in reactive state',
        'Use {{ }} for text and expressions (percentage, uppercase name)',
        'Bind :src, :alt, :href and :title with v-bind shorthand',
        'Disable a button with :disabled when marks are below 40',
        'Run and change the marks in the console-free input to see updates',
      ],
      code: `<!-- ProfileCard.vue -->
<script setup>
import { ref } from 'vue'

const name = ref('Asha Patil')
const avatar = ref('https://picsum.photos/id/64/120/120')
const website = ref('https://vuejs.org')
const marks = ref(78)
</script>

<template>
  <div class="card">
    <img :src="avatar" :alt="name + ' photo'" width="120" height="120">
    <h2>{{ name.toUpperCase() }}</h2>
    <p>Score: {{ marks }} / 100 ({{ (marks / 100 * 100).toFixed(0) }}%)</p>
    <a :href="website" target="_blank" :title="'Visit ' + website">Website</a>
    <input type="number" v-model.number="marks">
    <button :disabled="marks < 40">Download certificate</button>
  </div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="card">
    <img :src="avatar" :alt="name + ' photo'" width="120" height="120">
    <h2>{{ name.toUpperCase() }}</h2>
    <p>Score: {{ marks }} / 100 &rarr; {{ marks >= 40 ? 'PASS' : 'FAIL' }}</p>
    <a :href="website" target="_blank" :title="'Visit ' + website">Website</a>
    <p><label>Change marks: <input type="number" v-model.number="marks"></label></p>
    <button :disabled="marks < 40">Download certificate</button>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { max-width: 280px; text-align: center; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
img { border-radius: 50%; }
button:disabled { opacity: .4; cursor: not-allowed; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const name = ref('Asha Patil');
    const avatar = ref('https://picsum.photos/id/64/120/120');
    const website = ref('https://vuejs.org');
    const marks = ref(78);
    return { name, avatar, website, marks };
  }
}).mount('#app');`,
      },
      result: 'A card with a round photo, "ASHA PATIL", score 78 → PASS and an enabled button. Typing 30 into the box shows FAIL and disables the button.',
      explanation:
        ':src, :alt, :href, :title and :disabled are v-bind shorthand: each attribute value is a JavaScript expression evaluated against component state. A boolean attribute such as disabled is removed when the expression is falsy. Mustaches only work in text content, never inside attributes.',
    },
    {
      title: 'Event handling with v-on and modifiers',
      scenario: 'A small form that increments a counter, greets with an argument, prevents page reload on submit and searches on Enter.',
      steps: [
        'Add a button with an inline handler @click="count++"',
        'Add a button that calls greet("Vue") with an argument',
        'Use @submit.prevent so the form does not reload the page',
        'Use @keyup.enter on an input to trigger search',
        'Click and type to see the log list update',
      ],
      code: `<script setup>
import { ref } from 'vue'
const count = ref(0)
const query = ref('')
const log = ref([])

function greet(who, event) {
  log.value.push('Hello ' + who + ' (' + event.type + ')')
}
function onSubmit() { log.value.push('Form submitted without reload') }
function search() { log.value.push('Searching for: ' + query.value) }
</script>

<template>
  <button @click="count++">Clicked {{ count }}</button>
  <button @click="greet('Vue', $event)">Greet</button>
  <form @submit.prevent="onSubmit">
    <input v-model="query" @keyup.enter="search" placeholder="Search + Enter">
    <button>Submit form</button>
  </form>
  <ul><li v-for="(l, i) in log" :key="i">{{ l }}</li></ul>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <button @click="count++">Clicked {{ count }}</button>
  <button @click="greet('Vue', $event)">Greet</button>
  <form @submit.prevent="onSubmit">
    <input v-model="query" @keyup.enter="search" placeholder="Type + press Enter">
    <button>Submit form</button>
  </form>
  <ul><li v-for="(l, i) in log" :key="i">{{ l }}</li></ul>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button, input { margin: 4px; padding: 6px 10px; }
form { margin: 8px 0; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const count = ref(0);
    const query = ref('');
    const log = ref([]);
    function greet(who, event) { log.value.push('Hello ' + who + ' (' + event.type + ')'); }
    function onSubmit() { log.value.push('Form submitted without reload'); }
    function search() { log.value.push('Searching for: ' + query.value); }
    return { count, query, log, greet, onSubmit, search };
  }
}).mount('#app');`,
      },
      result: 'The counter increases; "Greet" adds "Hello Vue (click)"; pressing Enter in the input adds "Searching for: ..."; the submit button adds a log line and the page never reloads.',
      explanation:
        '@ is shorthand for v-on. $event is the special variable holding the native DOM event in inline handlers. .prevent calls event.preventDefault(), and .enter filters keyup events to the Enter key only. Note: pressing Enter in a single-input form also submits it, so you will see both log lines.',
    },
    {
      title: 'v-if, v-show and v-for together: a task list',
      scenario: 'Show a list of tasks with numbering, an empty-state message, and a help panel that toggles often.',
      steps: [
        'Create a tasks array ref and a newTask ref bound with v-model',
        'Use v-for with (task, index) and a :key to render the list',
        'Use v-if / v-else to show "No tasks" when the array is empty',
        'Use v-show for the frequently toggled help panel',
        'Add and clear tasks to see both branches',
      ],
      code: `<script setup>
import { ref } from 'vue'
const tasks = ref(['Learn directives', 'Practice v-for'])
const newTask = ref('')
const showHelp = ref(false)

function addTask() {
  if (!newTask.value.trim()) return
  tasks.value.push(newTask.value.trim())
  newTask.value = ''
}
</script>

<template>
  <input v-model="newTask" @keyup.enter="addTask" placeholder="New task">
  <button @click="addTask">Add</button>
  <button @click="tasks = []">Clear</button>
  <button @click="showHelp = !showHelp">Help</button>

  <p v-show="showHelp">Type a task and press Enter.</p>

  <ol v-if="tasks.length">
    <li v-for="(task, index) in tasks" :key="task + index">{{ index + 1 }}. {{ task }}</li>
  </ol>
  <p v-else>No tasks yet 🎉</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <input v-model="newTask" @keyup.enter="addTask" placeholder="New task">
  <button @click="addTask">Add</button>
  <button @click="tasks = []">Clear</button>
  <button @click="showHelp = !showHelp">Help</button>

  <p v-show="showHelp" class="help">Type a task and press Enter. (v-show only toggles display)</p>

  <ul v-if="tasks.length">
    <li v-for="(task, index) in tasks" :key="task + index">{{ index + 1 }}. {{ task }}</li>
  </ul>
  <p v-else>No tasks yet 🎉</p>
  <p>Total: {{ tasks.length }}</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.help { background: #fef9c3; padding: 8px; border-radius: 6px; }
ul { list-style: none; padding: 0; }
li { padding: 6px; border-bottom: 1px solid #eee; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const tasks = ref(['Learn directives', 'Practice v-for']);
    const newTask = ref('');
    const showHelp = ref(false);
    function addTask() {
      if (!newTask.value.trim()) return;
      tasks.value.push(newTask.value.trim());
      newTask.value = '';
    }
    return { tasks, newTask, showHelp, addTask };
  }
}).mount('#app');`,
      },
      result: 'Two numbered tasks appear. Adding a task appends it; Clear shows "No tasks yet 🎉"; Help toggles a yellow hint.',
      explanation:
        'v-if/v-else add and remove DOM nodes; v-show keeps the node and toggles display: none, which is cheaper for frequent toggles. v-for repeats the <li> and the :key helps Vue match old and new items. Pushing into tasks.value is detected by Vue 3\'s Proxy-based reactivity.',
    },
    {
      title: 'v-model on different inputs and v-html vs {{ }}',
      scenario: 'Build a mini "post preview" form and see why v-html is risky for user input.',
      steps: [
        'Bind a text input, a checkbox and a select with v-model',
        'Bind a textarea for the post body',
        'Show the body twice: once with {{ }} (escaped) and once with v-html (rendered)',
        'Type <b>bold</b> in the textarea and compare the two previews',
        'Use v-pre to show literal mustache text',
      ],
      code: `<script setup>
import { ref } from 'vue'
const title = ref('My first post')
const published = ref(false)
const category = ref('Vue')
const body = ref('Hello <b>world</b>')
</script>

<template>
  <input v-model="title">
  <label><input type="checkbox" v-model="published"> Published</label>
  <select v-model="category">
    <option>Vue</option><option>React</option><option>Angular</option>
  </select>
  <textarea v-model="body"></textarea>

  <h3>{{ title }} [{{ category }}] {{ published ? '✅' : '📝 draft' }}</h3>
  <p>Safe text: {{ body }}</p>
  <!-- Only for TRUSTED html! -->
  <p>Rendered HTML: <span v-html="body"></span></p>
  <p v-pre>Literal: {{ body }}</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p><input v-model="title"></p>
  <p><label><input type="checkbox" v-model="published"> Published</label>
  <select v-model="category"><option>Vue</option><option>React</option><option>Angular</option></select></p>
  <textarea v-model="body" rows="3" cols="40"></textarea>

  <h3>{{ title }} [{{ category }}] {{ published ? '✅' : '📝 draft' }}</h3>
  <p>Safe text: <code>{{ body }}</code></p>
  <p>Rendered HTML (trusted only!): <span v-html="body"></span></p>
  <p v-pre>Literal: {{ body }}</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
code { background: #f1f5f9; padding: 2px 4px; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const title = ref('My first post');
    const published = ref(false);
    const category = ref('Vue');
    const body = ref('Hello <b>world</b> from <i>Vue</i>');
    return { title, published, category, body };
  }
}).mount('#app');`,
      },
      result: 'The heading updates as you type/tick/select. "Safe text" shows the raw tags as text, "Rendered HTML" shows bold and italic words, and the v-pre line shows {{ body }} literally.',
      explanation:
        'v-model adapts to the element: value + input event for text and textarea, checked + change for checkbox, value + change for select. {{ }} escapes HTML; v-html injects it as markup, which is why it must never receive untrusted input. v-pre skips compilation for its element and children.',
    },
  ],
  interview: [
    {
      q: 'What is a directive in Vue?',
      a: 'A special attribute with the v- prefix (v-if, v-for, v-bind, v-on, v-model, v-show, v-html...) whose value is a JavaScript expression. When the expression\'s value changes, the directive reactively applies side effects to the DOM. Directives can take an argument (v-bind:href) and modifiers (@submit.prevent).',
      level: 'Easy',
    },
    {
      q: 'What is the difference between v-if and v-show?',
      a: 'v-if conditionally renders: the element and its child components are created or destroyed. It has a higher toggle cost but zero cost when false initially. v-show always renders and toggles CSS display. It has a higher initial cost but cheap toggling. Use v-show for frequent toggles, v-if when the condition rarely changes. v-show does not support <template> or v-else.',
      level: 'Easy',
    },
    {
      q: 'What are the shorthands for v-bind and v-on?',
      a: 'v-bind:attr → :attr, v-on:event → @event. v-slot:name → #name (Day 10). Vue 3.4+ also allows same-name shorthand :id meaning :id="id".',
      level: 'Easy',
    },
    {
      q: 'Why should you not use v-if and v-for on the same element?',
      a: 'In Vue 3 v-if has higher precedence than v-for, so the v-if condition cannot access the loop variable and you get an error. Even when it works it is unclear. Filter the list with a computed property, or move v-for to a wrapping <template>.',
      level: 'Medium',
    },
    {
      q: 'Why is v-html dangerous?',
      a: 'It sets innerHTML, so any HTML or script-bearing attributes (e.g. <img onerror="...">) in the string are executed, enabling XSS attacks if the content comes from users. Only use it with trusted or sanitised content (e.g. DOMPurify). Interpolation {{ }} escapes HTML and is safe.',
      level: 'Medium',
    },
    {
      q: 'What can you write inside {{ }}?',
      a: 'Any single JavaScript expression that evaluates to a value: variables, arithmetic, ternaries, function calls, method chaining. Statements (if, for, let) are not allowed. Templates are sandboxed and can only access exposed component state and a whitelist of globals like Math and Date.',
      level: 'Easy',
    },
    {
      q: 'How does v-model work internally on a text input?',
      a: 'It is syntactic sugar for :value="x" plus @input="x = $event.target.value". For checkboxes and radios it uses checked + change, for select value + change. On components it becomes modelValue prop + update:modelValue event (Day 9).',
      level: 'Medium',
    },
    {
      q: 'What are event modifiers? Give examples.',
      a: 'Postfixes on v-on that handle common DOM details declaratively: .prevent (preventDefault), .stop (stopPropagation), .self (only if event.target is the element itself), .once (trigger once), .capture, .passive. Key modifiers: .enter, .esc, .tab, .space, .up, .down; system modifiers .ctrl, .alt, .shift, .meta and .exact.',
      level: 'Medium',
    },
    {
      q: 'What are dynamic arguments?',
      a: 'Directive arguments in square brackets evaluated as expressions: <a :[attrName]="url"> or <button @[eventName]="handler">. The expression must evaluate to a string (or null to remove the binding). In in-DOM templates, avoid uppercase in the argument name because browsers lowercase attributes.',
      level: 'Hard',
    },
    {
      q: 'What is v-cloak used for?',
      a: 'When templates are compiled in the browser (CDN build), users may briefly see raw {{ }}. v-cloak stays on the element until the app is mounted; with a CSS rule [v-cloak] { display: none } the element remains hidden until ready. It is unnecessary with pre-compiled SFCs.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a product view with name, price and quantity. Show the total price with 2 decimals and disable the "Buy" button when quantity is 0.',
      hint: 'Use {{ (price * qty).toFixed(2) }} and :disabled="qty === 0".',
      solution: `<div id="app">
  <h2>{{ name }}</h2>
  <p>Price: ₹{{ price }}</p>
  <button @click="qty > 0 && qty--">-</button> {{ qty }} <button @click="qty++">+</button>
  <p>Total: ₹{{ (price * qty).toFixed(2) }}</p>
  <button :disabled="qty === 0">Buy</button>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  return { name: ref('Notebook'), price: ref(49.5), qty: ref(1) };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Render a list of 5 programming languages with their index using v-for, and show "(favourite)" next to the one stored in a favourite ref.',
      hint: 'Use v-if on a <span> inside the <li>.',
      solution: `<div id="app">
  <ul>
    <li v-for="(lang, i) in langs" :key="lang">
      {{ i + 1 }}. {{ lang }} <span v-if="lang === favourite">(favourite)</span>
    </li>
  </ul>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  return { langs: ref(['JavaScript', 'Python', 'Java', 'Go', 'Rust']), favourite: ref('JavaScript') };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Build a grade checker: an input for marks (v-model) and v-if / v-else-if / v-else showing Distinction (>= 75), First class (>= 60), Pass (>= 35) or Fail.',
      hint: 'Use v-model.number so marks is a number.',
      solution: `<div id="app">
  <input type="number" v-model.number="marks">
  <p v-if="marks >= 75">Distinction</p>
  <p v-else-if="marks >= 60">First class</p>
  <p v-else-if="marks >= 35">Pass</p>
  <p v-else>Fail</p>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() { return { marks: ref(50) }; } }).mount('#app');
</script>`,
    },
    {
      task: 'Make a link builder: inputs for link text and URL, a checkbox "open in new tab", and a live preview <a> that uses :href and :target.',
      hint: ':target="newTab ? \'_blank\' : null" removes the attribute when null.',
      solution: `<div id="app">
  <input v-model="text" placeholder="Link text">
  <input v-model="url" placeholder="https://...">
  <label><input type="checkbox" v-model="newTab"> New tab</label>
  <p>Preview: <a :href="url" :target="newTab ? '_blank' : null">{{ text || url }}</a></p>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  return { text: ref('Vue docs'), url: ref('https://vuejs.org'), newTab: ref(true) };
}}).mount('#app');
</script>`,
    },
  ],
  quiz: [
    {
      question: 'Which is the correct way to bind an image source to a variable imgUrl?',
      options: ['<img src="{{ imgUrl }}">', '<img :src="imgUrl">', '<img v-src="imgUrl">', '<img @src="imgUrl">'],
      answer: 1,
      explanation: 'Mustaches do not work in attributes; use v-bind (:src).',
    },
    {
      question: 'Which directive only toggles CSS display instead of adding/removing the element?',
      options: ['v-if', 'v-for', 'v-show', 'v-once'],
      answer: 2,
      explanation: 'v-show keeps the element in the DOM and toggles display: none.',
    },
    {
      question: 'What does @submit.prevent do?',
      options: [
        'Listens to submit and calls event.preventDefault()',
        'Prevents the submit listener from being added',
        'Stops event bubbling',
        'Submits the form only once',
      ],
      answer: 0,
      explanation: '.prevent calls preventDefault, so the browser does not reload the page.',
    },
    {
      question: 'Which of these is NOT allowed inside {{ }}?',
      options: ['{{ a + b }}', '{{ ok ? "Y" : "N" }}', '{{ list.join(", ") }}', '{{ if (ok) { return 1 } }}'],
      answer: 3,
      explanation: 'Only single expressions are allowed, not statements like if.',
    },
    {
      question: 'Which directive can cause XSS if used with user input?',
      options: ['v-text', 'v-model', 'v-bind:title', 'v-html'],
      answer: 3,
      explanation: 'v-html sets innerHTML without escaping.',
    },
  ],
};
