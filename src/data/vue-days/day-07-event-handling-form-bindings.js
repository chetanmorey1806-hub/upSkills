export default {
  id: 'day-07-event-handling-form-bindings',
  title: 'Event Handling and Form Input Bindings (v-model modifiers)',
  module: 'Module 1: Vue Basics',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Handle user interaction professionally: method vs inline handlers, $event, event, key and mouse modifiers, then bind every kind of form control with v-model (text, textarea, checkbox, radio, select, multiple select) and use the .lazy, .number and .trim modifiers to build a complete registration form.',
  objectives: [
    'Write method and inline event handlers and access the native event',
    'Use event modifiers (.prevent, .stop, .self, .once, .capture, .passive) and key/mouse modifiers',
    'Bind text, textarea, checkbox (single and array), radio, select and multi-select with v-model',
    'Apply v-model modifiers .lazy, .number and .trim',
    'Build and submit a form with simple validation',
  ],
  theory: [
    {
      heading: 'Event handlers: method vs inline',
      content:
        '`v-on:event` (shorthand `@event`) accepts two kinds of values:\n\n1. **Method handler**: a function name or path, `@click="save"`. Vue calls it with the **native DOM event** as the first argument.\n2. **Inline handler**: JavaScript code, `@click="count++"` or `@click="remove(item.id)"`. Use the special variable `$event` if you also need the event: `@click="remove(item.id, $event)"`, or an arrow function `@click="(e) => remove(item.id, e)"`.\n\nVue decides which kind it is by looking at the expression: `save` and `foo.bar` are method handlers; `save()` and `count++` are inline.\n\nAnalogy: a method handler is giving someone your phone number ("call me when it happens"); an inline handler is a sticky note with exact instructions.',
      syntax: `<button @click="greet">Greet</button>             <!-- greet(event) -->
<button @click="greet('Asha')">Greet Asha</button> <!-- inline -->
<input @input="onInput($event.target.value)">`,
      tip: 'Do not write @click="greet()" when you need the event: calling it inline passes no event. Use @click="greet" or @click="greet($event)".',
    },
    {
      heading: 'Event modifiers',
      content:
        'Modifiers are dot-suffixes that handle common DOM details so your methods only contain business logic.\n\n- `.prevent`: `event.preventDefault()`; e.g. `@submit.prevent` stops page reload, `@click.prevent` on a link stops navigation\n- `.stop`: `event.stopPropagation()`; the event does not bubble to parents\n- `.self`: only trigger if `event.target` is the element itself (not a child); perfect for closing a modal when clicking the backdrop\n- `.once`: trigger at most once\n- `.capture`: listen in the capture phase (parent runs before child)\n- `.passive`: tells the browser you will not call preventDefault (smooth scrolling for `@scroll`/`@touchmove`)\n\nModifiers can be chained: `@click.stop.prevent`. Order matters for some combinations: `@click.prevent.self` prevents default for all clicks on the element and its children, while `@click.self.prevent` only for clicks on the element itself.',
      tip: 'Do not combine .passive and .prevent: the browser ignores preventDefault in passive listeners and warns.',
    },
    {
      heading: 'Key and mouse modifiers',
      content:
        '**Key modifiers** filter keyboard events: `@keyup.enter`, `.tab`, `.delete` (Delete and Backspace), `.esc`, `.space`, `.up`, `.down`, `.left`, `.right`. Any valid `KeyboardEvent.key` in kebab-case also works: `@keyup.page-down`.\n\n**System modifier keys**: `.ctrl`, `.alt`, `.shift`, `.meta` (Cmd on Mac, Windows key on PC). Example: `@keyup.ctrl.enter="send"` or `@click.ctrl="openInNewTab"`.\n\n`.exact` requires that **only** the listed modifiers are pressed: `@click.ctrl.exact` will not fire for Ctrl+Shift+click; `@click.exact` fires only when no modifier is pressed.\n\n**Mouse button modifiers**: `.left`, `.right`, `.middle`; e.g. `@click.right.prevent="openContextMenu"`.',
      syntax: `<input @keyup.enter="submit" @keyup.esc="cancel">
<textarea @keydown.ctrl.enter="send"></textarea>
<div @contextmenu.prevent="showMenu">Right click me</div>`,
    },
    {
      heading: 'v-model with every form control',
      content:
        'v-model chooses the right DOM property and event per element:\n\n- **text / textarea**: `value` + `input` event. Do not use `{{ }}` inside `<textarea>`; use v-model.\n- **single checkbox**: `checked` + `change`, binds a **boolean**. Custom values: `true-value="yes" false-value="no"`.\n- **multiple checkboxes** bound to the **same array**: the array contains the `value` of every checked box.\n- **radio**: binds the `value` of the selected radio.\n- **select**: binds the selected option\'s value. Add a disabled empty option as a placeholder, because iOS cannot select the first option if nothing is selected initially. `<select multiple>` binds an array.\n- **Non-string values**: use `:value` on options, radios or checkboxes to bind numbers, booleans or objects: `<option :value="{ id: 1 }">`.\n\nv-model **ignores** the initial `value`, `checked` or `selected` HTML attributes: the JavaScript state is always the single source of truth.',
      syntax: `<input type="checkbox" v-model="agree">                  <!-- boolean -->
<input type="checkbox" value="vue" v-model="skills">      <!-- array -->
<input type="radio" value="male" v-model="gender">
<select v-model="city">
  <option disabled value="">Please select</option>
  <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
</select>`,
    },
    {
      heading: 'v-model modifiers: .lazy, .number, .trim',
      content:
        '- `.lazy`: sync on the `change` event instead of every `input` (updates when the field loses focus or Enter is pressed). Useful to avoid expensive work on each keystroke.\n- `.number`: converts the value with `parseFloat()`. If it cannot be parsed, the original string is kept. `type="number"` inputs already apply it automatically in Vue 3, but adding it is explicit and harmless.\n- `.trim`: removes leading and trailing whitespace automatically.\n\nThey can be combined: `v-model.trim.lazy="name"`.\n\nWhy `.number` matters: HTML inputs always give strings. Without it, `"5" + 1` is `"51"`, a classic bug in calculators and carts.',
      syntax: `<input v-model.trim="username">
<input v-model.number="age">
<input v-model.lazy="address">`,
      tip: 'Coming next (Day 9): v-model on your own components with defineModel and custom modifiers.',
    },
  ],
  examples: [
    {
      title: 'Event modifiers playground: .stop, .self, .once and keys',
      scenario: 'A modal that closes only when the dark backdrop is clicked, a nested click demo for .stop, a one-time coupon, and keyboard shortcuts.',
      steps: [
        'Create a modal with a backdrop div using @click.self="open = false"',
        'Create nested divs: the inner button uses @click.stop so the parent handler does not run',
        'Add a "Claim coupon" button with @click.once',
        'Add an input with @keyup.enter, @keyup.esc and @keydown.ctrl.enter handlers',
        'Click around and watch the log',
      ],
      code: `<template>
  <div class="outer" @click="log('outer clicked')">
    <button @click="log('inner (bubbles)')">Inner</button>
    <button @click.stop="log('inner .stop (no bubble)')">Inner .stop</button>
  </div>

  <button @click.once="log('Coupon claimed!')">Claim coupon (once)</button>

  <input @keyup.enter="log('Enter')" @keyup.esc="log('Esc')" @keydown.ctrl.enter="log('Ctrl+Enter: send')">

  <button @click="open = true">Open modal</button>
  <div v-if="open" class="backdrop" @click.self="open = false">
    <div class="modal">Click outside me to close</div>
  </div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="outer" @click="log('outer clicked')">
    Outer box
    <button @click="log('inner (bubbles)')">Inner</button>
    <button @click.stop="log('inner .stop (no bubble)')">Inner .stop</button>
  </div>
  <p><button @click.once="log('Coupon claimed!')">Claim coupon (once)</button>
  <button @click="open = true">Open modal</button></p>
  <input placeholder="Enter / Esc / Ctrl+Enter" @keyup.enter="log('Enter')" @keyup.esc="log('Esc')" @keydown.ctrl.enter="log('Ctrl+Enter: send')">
  <ol class="log"><li v-for="(l, i) in logs" :key="i">{{ l }}</li></ol>

  <div v-if="open" class="backdrop" @click.self="open = false">
    <div class="modal">I am a modal. Clicking inside me does nothing; click the dark area to close.</div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.outer { background: #e0f2fe; padding: 14px; border-radius: 8px; }
.log { background: #f8fafc; min-height: 40px; font-size: 14px; }
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: grid; place-items: center; }
.modal { background: white; padding: 24px; border-radius: 10px; max-width: 260px; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const logs = ref([]);
    const open = ref(false);
    function log(msg) { logs.value.push(msg); }
    return { logs, open, log };
  }
}).mount('#app');`,
      },
      result: 'Clicking "Inner" logs "inner (bubbles)" and "outer clicked"; "Inner .stop" logs only its own message. The coupon logs once only. Enter, Esc and Ctrl+Enter log their names. The modal closes only when clicking the dark backdrop.',
      explanation:
        '.stop calls stopPropagation so the outer listener never sees the event. .self ignores clicks whose target is a child (the modal box). .once removes the listener after the first call. Key modifiers filter keyboard events by event.key.',
    },
    {
      title: 'All v-model input types in one form',
      scenario: 'A course enrolment form using text, textarea, checkbox (boolean and array), radio, select and multiple select, with a live JSON preview.',
      steps: [
        'Create a reactive form object with fields for each control type',
        'Bind each control with v-model (array for skills, boolean for terms)',
        'Use true-value/false-value on the newsletter checkbox',
        'Use a disabled empty option as select placeholder and :value for numeric option values',
        'Watch the JSON preview update live',
      ],
      code: `<script setup>
import { reactive } from 'vue'
const form = reactive({
  name: '',
  bio: '',
  terms: false,
  newsletter: 'no',
  skills: [],
  mode: 'online',
  batch: '',
  slots: [],
})
const batches = [{ id: 101, label: 'Morning' }, { id: 102, label: 'Evening' }]
</script>

<template>
  <input v-model="form.name">
  <textarea v-model="form.bio"></textarea>
  <input type="checkbox" v-model="form.terms"> Accept terms
  <input type="checkbox" v-model="form.newsletter" true-value="yes" false-value="no"> Newsletter
  <input type="checkbox" value="HTML" v-model="form.skills"> HTML
  <input type="checkbox" value="CSS" v-model="form.skills"> CSS
  <input type="radio" value="online" v-model="form.mode"> Online
  <input type="radio" value="offline" v-model="form.mode"> Offline
  <select v-model="form.batch">
    <option disabled value="">Select batch</option>
    <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.label }}</option>
  </select>
  <select v-model="form.slots" multiple>
    <option>Sat</option><option>Sun</option>
  </select>
  <pre>{{ form }}</pre>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="grid">
    <form>
      <label>Name <input v-model="form.name"></label>
      <label>Bio <textarea v-model="form.bio" rows="2"></textarea></label>
      <label><input type="checkbox" v-model="form.terms"> Accept terms</label>
      <label><input type="checkbox" v-model="form.newsletter" true-value="yes" false-value="no"> Newsletter</label>
      <fieldset><legend>Skills</legend>
        <label v-for="s in ['HTML', 'CSS', 'JavaScript', 'Vue']" :key="s"><input type="checkbox" :value="s" v-model="form.skills"> {{ s }}</label>
      </fieldset>
      <fieldset><legend>Mode</legend>
        <label><input type="radio" value="online" v-model="form.mode"> Online</label>
        <label><input type="radio" value="offline" v-model="form.mode"> Offline</label>
      </fieldset>
      <label>Batch
        <select v-model="form.batch">
          <option disabled value="">Select batch</option>
          <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.label }}</option>
        </select>
      </label>
      <label>Weekend slots (Ctrl+click)
        <select v-model="form.slots" multiple><option>Sat</option><option>Sun</option></select>
      </label>
    </form>
    <pre>{{ form }}
typeof batch: {{ typeof form.batch }}</pre>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: flex; flex-wrap: wrap; gap: 16px; }
form { display: flex; flex-direction: column; gap: 6px; min-width: 260px; }
fieldset label { margin-right: 8px; }
pre { background: #0f172a; color: #a7f3d0; padding: 10px; border-radius: 6px; min-width: 220px; }`,
        js: `const { createApp, reactive } = Vue;

createApp({
  setup() {
    const form = reactive({
      name: '', bio: '', terms: false, newsletter: 'no',
      skills: [], mode: 'online', batch: '', slots: [],
    });
    const batches = [{ id: 101, label: 'Morning' }, { id: 102, label: 'Evening' }];
    return { form, batches };
  }
}).mount('#app');`,
      },
      result: 'The JSON panel updates live: terms becomes true/false, newsletter "yes"/"no", skills an array like ["HTML","Vue"], mode "online"/"offline", batch the number 101 or 102 (typeof shows number), slots an array.',
      explanation:
        'Each control type maps to the right property/event automatically. Multiple checkboxes sharing one array model add/remove their value. :value on options keeps the numeric type instead of a string. true-value/false-value change what a single checkbox writes.',
    },
    {
      title: 'v-model modifiers: .trim, .number and .lazy',
      scenario: 'Show the classic "5 + 1 = 51" bug and how modifiers fix data quality problems.',
      steps: [
        'Bind one input without modifiers and one with .number, add 1 to each',
        'Bind a username with .trim and display its length in brackets',
        'Bind a city with .lazy and count how often it updates',
        'Type into each and compare the results',
      ],
      code: `<script setup>
import { ref, watch } from 'vue'
const raw = ref('5')
const num = ref(5)
const username = ref('')
const city = ref('')
const cityUpdates = ref(0)
watch(city, () => cityUpdates.value++)
</script>

<template>
  <input v-model="raw"> + 1 = {{ raw + 1 }}
  <input v-model.number="num"> + 1 = {{ num + 1 }}
  <input v-model.trim="username"> [{{ username }}] length {{ username.length }}
  <input v-model.lazy="city"> {{ city }} (updates: {{ cityUpdates }})
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>No modifier: <input v-model="raw" size="4"> + 1 = <b>{{ raw + 1 }}</b> ({{ typeof raw }})</p>
  <p>.number: <input v-model.number="num" size="4"> + 1 = <b>{{ num + 1 }}</b> ({{ typeof num }})</p>
  <p>.trim: <input v-model.trim="username" placeholder="  type with spaces  "> [{{ username }}] length {{ username.length }}</p>
  <p>.lazy: <input v-model.lazy="city" placeholder="type, then Tab/Enter"> {{ city }} (updates: {{ cityUpdates }})</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
p { margin: 12px 0; }`,
        js: `const { createApp, ref, watch } = Vue;

createApp({
  setup() {
    const raw = ref('5');
    const num = ref(5);
    const username = ref('');
    const city = ref('');
    const cityUpdates = ref(0);
    watch(city, () => cityUpdates.value++);
    return { raw, num, username, city, cityUpdates };
  }
}).mount('#app');`,
      },
      result: 'The first line shows "51 (string)", the second "6 (number)". Typing "  asha  " shows [asha] length 4. The .lazy city only updates (and increments the counter) when you leave the field or press Enter.',
      explanation:
        'Input values are strings, so + concatenates. .number parses with parseFloat. .trim strips whitespace before assigning. .lazy listens to change instead of input, reducing updates to one per edit.',
    },
    {
      title: 'Registration form with submit and validation',
      scenario: 'A complete sign-up form that validates on submit, shows errors per field, and prevents page reload.',
      steps: [
        'Create a reactive form and a reactive errors object',
        'Bind fields with v-model.trim / v-model.number',
        'Handle @submit.prevent="submit"',
        'In submit(), validate each field and fill errors; stop if any',
        'On success, show a summary and reset the form with Object.assign',
      ],
      code: `<script setup>
import { reactive, ref } from 'vue'
const initial = { name: '', email: '', age: null, course: '', terms: false }
const form = reactive({ ...initial })
const errors = reactive({})
const submitted = ref(null)

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (form.name.length < 3) errors.name = 'Name must be at least 3 characters'
  if (!/^\\S+@\\S+\\.\\S+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.age || form.age < 16) errors.age = 'You must be 16 or older'
  if (!form.course) errors.course = 'Choose a course'
  if (!form.terms) errors.terms = 'Accept the terms'
  return Object.keys(errors).length === 0
}
function submit() {
  if (!validate()) return
  submitted.value = { ...form }
  Object.assign(form, initial)
}
</script>

<template>
  <form @submit.prevent="submit" novalidate>
    <input v-model.trim="form.name"> <small>{{ errors.name }}</small>
    <input v-model.trim="form.email"> <small>{{ errors.email }}</small>
    <input type="number" v-model.number="form.age"> <small>{{ errors.age }}</small>
    <select v-model="form.course">...</select> <small>{{ errors.course }}</small>
    <input type="checkbox" v-model="form.terms"> <small>{{ errors.terms }}</small>
    <button>Register</button>
  </form>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <form @submit.prevent="submit" novalidate>
    <label>Name <input v-model.trim="form.name" :class="{ bad: errors.name }"></label>
    <small>{{ errors.name }}</small>
    <label>Email <input v-model.trim="form.email" :class="{ bad: errors.email }"></label>
    <small>{{ errors.email }}</small>
    <label>Age <input type="number" v-model.number="form.age" :class="{ bad: errors.age }"></label>
    <small>{{ errors.age }}</small>
    <label>Course
      <select v-model="form.course" :class="{ bad: errors.course }">
        <option disabled value="">Select...</option>
        <option>Vue.js</option><option>React</option><option>Node.js</option>
      </select>
    </label>
    <small>{{ errors.course }}</small>
    <label><input type="checkbox" v-model="form.terms"> I accept the terms</label>
    <small>{{ errors.terms }}</small>
    <button>Register</button>
  </form>
  <div v-if="submitted" class="ok">✅ Registered {{ submitted.name }} ({{ submitted.email }}), age {{ submitted.age }}, for {{ submitted.course }}</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: flex; flex-direction: column; gap: 4px; max-width: 320px; }
label { display: flex; justify-content: space-between; gap: 8px; }
small { color: #dc2626; min-height: 1em; }
.bad { border: 2px solid #dc2626; }
.ok { margin-top: 12px; background: #dcfce7; padding: 10px; border-radius: 6px; }`,
        js: `const { createApp, reactive, ref } = Vue;

createApp({
  setup() {
    const initial = { name: '', email: '', age: null, course: '', terms: false };
    const form = reactive({ ...initial });
    const errors = reactive({});
    const submitted = ref(null);

    function validate() {
      Object.keys(errors).forEach(k => delete errors[k]);
      if (form.name.length < 3) errors.name = 'Name must be at least 3 characters';
      if (!/^\\S+@\\S+\\.\\S+$/.test(form.email)) errors.email = 'Enter a valid email';
      if (!form.age || form.age < 16) errors.age = 'You must be 16 or older';
      if (!form.course) errors.course = 'Choose a course';
      if (!form.terms) errors.terms = 'Accept the terms';
      return Object.keys(errors).length === 0;
    }
    function submit() {
      if (!validate()) { console.log('errors', JSON.stringify(errors)); return; }
      submitted.value = { ...form };
      Object.assign(form, initial);
    }
    return { form, errors, submitted, submit };
  }
}).mount('#app');`,
      },
      result: 'Clicking Register with an empty form shows a red message under every field and red borders. Filling valid data shows a green "✅ Registered ..." summary and clears the form; the page never reloads.',
      explanation:
        '@submit.prevent stops the browser\'s default form submission. errors is reactive, so adding/deleting keys updates the messages. Object.assign(form, initial) resets fields while keeping the same reactive proxy. Day 21 shows schema validation with VeeValidate + zod.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a method handler and an inline handler?',
      a: 'A method handler is a function reference (@click="save"); Vue calls it with the native event. An inline handler is a JS statement (@click="save(id)" or @click="count++"); it runs as written, and the event is available via $event if needed.',
      level: 'Easy',
    },
    {
      q: 'How do you access the original DOM event in an inline handler?',
      a: 'Pass the special $event variable: @click="warn(\'msg\', $event)", or use an inline arrow function: @click="(e) => warn(\'msg\', e)".',
      level: 'Easy',
    },
    {
      q: 'Explain .prevent, .stop and .self.',
      a: '.prevent calls event.preventDefault() (e.g. stop form submit reload). .stop calls event.stopPropagation() so parents do not receive the event. .self only runs the handler if event.target is the element itself, not a child, useful for modal backdrops.',
      level: 'Easy',
    },
    {
      q: 'What does .exact do?',
      a: 'It controls the exact combination of system modifiers required. @click.ctrl fires for Ctrl+click even if Shift is also pressed; @click.ctrl.exact fires only when Ctrl alone is pressed; @click.exact fires only when no system modifiers are pressed.',
      level: 'Medium',
    },
    {
      q: 'What are the v-model modifiers and what do they do?',
      a: '.lazy syncs on change instead of input; .number casts the value with parseFloat (keeps the string if not parseable); .trim trims whitespace. They can be combined.',
      level: 'Easy',
    },
    {
      q: 'How does v-model work with multiple checkboxes?',
      a: 'When several checkboxes share the same v-model bound to an array, checking a box adds its value to the array and unchecking removes it. With a non-array model, a single checkbox binds a boolean (or custom true-value/false-value).',
      level: 'Medium',
    },
    {
      q: 'Why does v-model ignore the value/checked attributes in HTML?',
      a: 'Because the component state is the single source of truth. v-model always reflects the JavaScript value, so initial values must be set in state (ref/reactive), not in HTML attributes.',
      level: 'Medium',
    },
    {
      q: 'How do you bind a non-string value to a select option or radio?',
      a: 'Use v-bind on value: <option :value="123"> or <option :value="{ id: 1 }">. v-model then receives the number/object instead of a string.',
      level: 'Medium',
    },
    {
      q: 'Why is a disabled empty option recommended as the first option of a select?',
      a: 'If the bound value does not match any option, the select renders unselected. On iOS the user then cannot select the first item because no change event fires. A disabled placeholder option with value="" solves this and acts as a prompt.',
      level: 'Hard',
    },
    {
      q: 'How do you reset a reactive form after submission?',
      a: 'Keep an initial object and use Object.assign(form, initial) (or reassign a ref\'s .value). Do not reassign a reactive() variable itself, because the template keeps pointing to the old proxy. Alternatively change the form component\'s :key to remount it.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a chat input where Enter sends the message, Shift+Enter inserts a new line, and Esc clears the box.',
      hint: '@keydown.enter.exact.prevent="send" lets Shift+Enter pass through.',
      solution: `<script setup>
import { ref } from 'vue'
const text = ref('')
const messages = ref([])
function send() {
  if (!text.value.trim()) return
  messages.value.push(text.value.trim())
  text.value = ''
}
</script>
<template>
  <ul><li v-for="(m, i) in messages" :key="i" style="white-space:pre-line">{{ m }}</li></ul>
  <textarea v-model="text" @keydown.enter.exact.prevent="send" @keyup.esc="text = ''"></textarea>
</template>`,
    },
    {
      task: 'Build a pizza order form: size (radio), toppings (checkbox array, each ₹40), quantity (.number). Show the computed total (Small ₹199, Medium ₹299, Large ₹399).',
      hint: 'const prices = { small: 199, medium: 299, large: 399 }.',
      solution: `<script setup>
import { ref, computed } from 'vue'
const prices = { small: 199, medium: 299, large: 399 }
const size = ref('medium')
const toppings = ref([])
const qty = ref(1)
const total = computed(() => (prices[size.value] + toppings.value.length * 40) * qty.value)
</script>
<template>
  <label v-for="(p, s) in prices" :key="s"><input type="radio" :value="s" v-model="size"> {{ s }} ₹{{ p }}</label>
  <div>
    <label v-for="t in ['Cheese', 'Olives', 'Paneer', 'Corn']" :key="t">
      <input type="checkbox" :value="t" v-model="toppings"> {{ t }}
    </label>
  </div>
  <input type="number" min="1" v-model.number="qty">
  <h3>Total: ₹{{ total }}</h3>
</template>`,
    },
    {
      task: 'Make a right-click context menu: right-clicking a box opens a small menu at the mouse position; clicking anywhere else closes it.',
      hint: '@contextmenu.prevent, store event.clientX/Y, close with a click listener on a full-screen layer using .self.',
      solution: `<script setup>
import { ref } from 'vue'
const menu = ref(null)
function open(e) { menu.value = { x: e.clientX, y: e.clientY } }
</script>
<template>
  <div class="box" @contextmenu.prevent="open">Right-click me</div>
  <div v-if="menu" class="layer" @click.self="menu = null" @contextmenu.prevent="menu = null">
    <ul class="menu" :style="{ left: menu.x + 'px', top: menu.y + 'px' }">
      <li @click="menu = null">Copy</li><li @click="menu = null">Delete</li>
    </ul>
  </div>
</template>
<style scoped>
.layer { position: fixed; inset: 0; }
.menu { position: fixed; background: #fff; border: 1px solid #ccc; list-style: none; padding: 4px; margin: 0; }
</style>`,
    },
    {
      task: 'Create a "settings" form where changes are only applied when the user clicks Save; Cancel restores the previous values.',
      hint: 'Edit a copy (draft) of the saved settings; Save copies draft to saved; Cancel copies saved to draft.',
      solution: `<script setup>
import { reactive } from 'vue'
const saved = reactive({ username: 'asha', theme: 'light', emails: true })
const draft = reactive({ ...saved })
const save = () => Object.assign(saved, draft)
const cancel = () => Object.assign(draft, saved)
</script>
<template>
  <input v-model.trim="draft.username">
  <select v-model="draft.theme"><option>light</option><option>dark</option></select>
  <label><input type="checkbox" v-model="draft.emails"> Emails</label>
  <button @click="save">Save</button> <button @click="cancel">Cancel</button>
  <pre>Saved: {{ saved }}</pre>
</template>`,
    },
  ],
  quiz: [
    {
      question: 'Which modifier stops a form from reloading the page on submit?',
      options: ['@submit.stop', '@submit.self', '@submit.prevent', '@submit.once'],
      answer: 2,
      explanation: '.prevent calls event.preventDefault().',
    },
    {
      question: 'Several checkboxes share v-model="skills" where skills = ref([]). What does skills contain?',
      options: ['true/false', 'The values of the checked boxes', 'The number of checked boxes', 'The last clicked value only'],
      answer: 1,
      explanation: 'An array model collects the value of every checked checkbox.',
    },
    {
      question: 'Which modifier updates the model only on the change event?',
      options: ['.lazy', '.trim', '.number', '.sync'],
      answer: 0,
      explanation: '.lazy switches from input to change.',
    },
    {
      question: 'How do you run a handler only when Ctrl+Click is pressed with no other modifier keys?',
      options: ['@click.ctrl', '@click.exact', '@click.ctrl.only', '@click.ctrl.exact'],
      answer: 3,
      explanation: '.exact restricts the modifier combination.',
    },
    {
      question: 'Without .number, what does {{ qty + 1 }} show if the user typed 5 in a text input bound to qty?',
      options: ['6', '51', 'NaN', 'Error'],
      answer: 1,
      explanation: 'Input values are strings, so + concatenates to "51".',
    },
  ],
};
