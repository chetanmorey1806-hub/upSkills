export default {
  id: 'day-03-reactivity-ref-reactive',
  title: 'Reactivity: ref and reactive',
  module: 'Module 1: Vue Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Reactivity is the heart of Vue. Learn how ref() and reactive() make data reactive, why refs need .value in JavaScript, the limitations of reactive(), how deep reactivity works, and helpers such as toRefs, shallowRef, readonly and nextTick.',
  objectives: [
    'Explain what reactivity means and how Vue tracks dependencies',
    'Create reactive state with ref() and reactive() and choose between them',
    'Understand .value, automatic unwrapping in templates and in reactive objects',
    'Avoid the common pitfalls: destructuring reactive objects and replacing them',
    'Use toRefs, readonly, shallowRef and nextTick',
  ],
  theory: [
    {
      heading: 'What is reactivity?',
      content:
        'In plain JavaScript, `let total = price * qty` is calculated once. If `price` changes later, `total` does not update. **Reactivity** means: when data changes, everything that depends on it (the template, computed values, watchers) updates automatically.\n\nVue 3 implements this with JavaScript **Proxies** and getter/setter interception:\n\n1. **Track**: while rendering, every time a reactive value is *read*, Vue records "this component depends on this value".\n2. **Trigger**: when the value is *written*, Vue looks up who depends on it and schedules them to re-run.\n3. **Batch**: updates are queued and the DOM is updated once per "tick", not once per assignment.\n\nAnalogy: an Excel sheet. Cell C1 = A1 * B1. Change A1 and C1 recalculates by itself. Vue makes your variables behave like spreadsheet cells.',
      points: [
        'Only reactive data (created with ref/reactive) triggers updates; a plain let variable does not',
        'Vue 3 Proxies detect new properties, deleted properties and array index changes (Vue 2 could not)',
      ],
    },
    {
      heading: 'ref(): reactive value for any type',
      content:
        '`ref(initialValue)` wraps any value (number, string, boolean, object, array, null) in an object with a single `.value` property.\n\n- In **JavaScript** (setup / `<script setup>`), you must use `.value` to read and write: `count.value++`.\n- In the **template**, top-level refs are automatically unwrapped: write `{{ count }}`, not `{{ count.value }}`.\n- If the value is an object or array, it is made **deeply reactive** (internally via `reactive()`), so `user.value.address.city = "Pune"` and `items.value.push(x)` are tracked.\n- You can **replace** the whole value: `items.value = []`. Reactivity is preserved because the ref object itself never changes.\n\nWhy `.value`? JavaScript cannot detect reads/writes of a plain variable like `let count = 0`. Wrapping it in an object lets Vue intercept `.value` with a getter and setter.',
      syntax: `import { ref } from 'vue'

const count = ref(0)
const user = ref({ name: 'Asha', skills: ['HTML'] })

count.value++                     // 1
user.value.skills.push('Vue')     // deep change, tracked
user.value = { name: 'Ravi', skills: [] }  // replace, still reactive`,
      tip: 'The official recommendation is to use ref() as the primary API for declaring reactive state.',
    },
    {
      heading: 'reactive(): reactive objects',
      content:
        '`reactive(obj)` returns a **Proxy** of an object (or array, Map, Set). You use it like a normal object, no `.value`: `state.count++`.\n\nLimitations of reactive():\n\n1. **Only object types**: `reactive(0)` or `reactive("text")` does not work.\n2. **Cannot replace the whole object**: `state = reactive({...})` breaks the connection, because the template still points to the old proxy. Change properties instead, or use `Object.assign(state, newData)`.\n3. **Not destructure-friendly**: `const { count } = state` copies the current number into a plain variable which is no longer reactive. Same when passing `state.count` into a function.\n\nIf you need to destructure, use `toRefs(state)`, which converts every property into a ref linked to the original object.',
      syntax: `import { reactive, toRefs } from 'vue'

const state = reactive({ count: 0, todos: [] })
state.count++                 // reactive
state.todos.push('Learn Vue') // reactive

let { count } = state        // ❌ lost reactivity
const { todos } = toRefs(state)  // ✅ todos is a ref linked to state.todos`,
    },
    {
      heading: 'ref vs reactive: unwrapping rules and when to use which',
      content:
        '**Unwrapping rules** (often asked in interviews):\n\n- Top-level refs are unwrapped in templates: `{{ count }}`.\n- A ref nested in a plain object in the template is *not* unwrapped for expressions: if `obj = { id: ref(1) }` then `{{ obj.id + 1 }}` gives "[object Object]1". Destructure it to the top level, or use reactive.\n- A ref placed inside a `reactive()` object is unwrapped automatically: `const s = reactive({ count: ref(0) }); s.count` is `0`.\n- Refs inside reactive **arrays** or Map are *not* unwrapped: `arr[0].value`.\n\n**Comparison:**\n\n- `ref`: any type, uses `.value` in JS, can be replaced, safe to destructure/return from composables.\n- `reactive`: objects only, no `.value`, cannot be replaced, loses reactivity when destructured.\n\nRule of thumb: use `ref` everywhere; use `reactive` for a group of related fields (like a form) when you like the `form.email` style.',
      tip: 'Common bug: writing count++ instead of count.value++ inside <script setup>. Vue will not warn you, and the screen will not update.',
    },
    {
      heading: 'readonly, shallowRef, nextTick and isRef',
      content:
        '- **readonly(obj)**: returns a read-only proxy. Writes fail with a warning in development. Useful to expose state that others must not mutate.\n- **shallowRef(value)**: only `.value` replacement is tracked, not deep changes. Good for large immutable data (big lists from an API, chart data) for performance. `shallowReactive` is the object equivalent.\n- **isRef(x)**, **unref(x)** (`isRef(x) ? x.value : x`), **isReactive(x)**, **toRaw(proxy)** (original object).\n- **nextTick()**: DOM updates are asynchronous and batched. After changing state, `await nextTick()` waits until the DOM reflects the change, e.g. before measuring an element\'s height or focusing a newly shown input.',
      syntax: `import { ref, nextTick } from 'vue'

const items = ref([])
async function add() {
  items.value.push('new')
  console.log(listEl.children.length) // still the OLD count
  await nextTick()
  console.log(listEl.children.length) // updated
}`,
    },
  ],
  examples: [
    {
      title: 'ref with primitives, objects and arrays',
      scenario: 'Build a student profile where you can change the name, add skills and reset everything, using only ref.',
      steps: [
        'Create name = ref("") and student = ref({ city, skills: [] })',
        'Bind name with v-model and display the uppercase version',
        'Push into student.value.skills to add a skill (deep reactivity)',
        'Replace student.value entirely in reset()',
        'Click buttons and see the screen follow the data',
      ],
      code: `<script setup>
import { ref } from 'vue'

const name = ref('Asha')
const student = ref({ city: 'Pune', skills: ['HTML', 'CSS'] })
const newSkill = ref('')

function addSkill() {
  if (!newSkill.value) return
  student.value.skills.push(newSkill.value)  // deep change
  newSkill.value = ''
}
function reset() {
  name.value = ''
  student.value = { city: 'Unknown', skills: [] } // replace whole object
}
</script>

<template>
  <input v-model="name">
  <h2>{{ name.toUpperCase() || '(no name)' }} from {{ student.city }}</h2>
  <input v-model="newSkill" @keyup.enter="addSkill"> <button @click="addSkill">Add skill</button>
  <ul><li v-for="s in student.skills" :key="s">{{ s }}</li></ul>
  <button @click="reset">Reset</button>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p><input v-model="name" placeholder="Name"></p>
  <h2>{{ name ? name.toUpperCase() : '(no name)' }} from {{ student.city }}</h2>
  <input v-model="newSkill" @keyup.enter="addSkill" placeholder="New skill">
  <button @click="addSkill">Add skill</button>
  <ul><li v-for="s in student.skills" :key="s">{{ s }}</li></ul>
  <button @click="reset">Reset</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
li { color: #42b883; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const name = ref('Asha');
    const student = ref({ city: 'Pune', skills: ['HTML', 'CSS'] });
    const newSkill = ref('');

    function addSkill() {
      if (!newSkill.value) return;
      student.value.skills.push(newSkill.value);
      console.log('skills now:', student.value.skills.join(', '));
      newSkill.value = '';
    }
    function reset() {
      name.value = '';
      student.value = { city: 'Unknown', skills: [] };
    }
    return { name, student, newSkill, addSkill, reset };
  }
}).mount('#app');`,
      },
      result: '"ASHA from Pune" with skills HTML, CSS. Adding "Vue" appends it to the list; Reset shows "(no name) from Unknown" with an empty list.',
      explanation:
        'In JavaScript we always go through .value; in the template the refs are unwrapped. Because the ref holds an object, Vue makes it deeply reactive, so push() is detected. Replacing student.value is fine with ref (it would break with reactive).',
    },
    {
      title: 'reactive() for a form, and the destructuring trap',
      scenario: 'A registration form whose fields live in one reactive object. We demonstrate why destructuring breaks reactivity and how toRefs fixes it.',
      steps: [
        'Create form = reactive({ name, email, age })',
        'Bind inputs with v-model="form.name" etc.',
        'Destructure once normally (broken) and once with toRefs (working)',
        'Show both values in the template and type into the inputs',
        'Observe that only the toRefs copy follows changes',
      ],
      code: `<script setup>
import { reactive, toRefs } from 'vue'

const form = reactive({ name: 'Ravi', email: '', age: 21 })

const { name: brokenName } = form        // ❌ plain string snapshot
const { name: linkedName } = toRefs(form) // ✅ ref linked to form.name

function submit() {
  alert(JSON.stringify(form))
}
function clear() {
  Object.assign(form, { name: '', email: '', age: null }) // keep same proxy
}
</script>

<template>
  <input v-model="form.name"> <input v-model="form.email"> <input v-model.number="form.age" type="number">
  <p>form.name: {{ form.name }}</p>
  <p>Destructured (broken): {{ brokenName }}</p>
  <p>toRefs (linked): {{ linkedName }}</p>
  <button @click="clear">Clear</button>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p><input v-model="form.name" placeholder="Name"></p>
  <p><input v-model="form.email" placeholder="Email"></p>
  <p><input v-model.number="form.age" type="number" placeholder="Age"></p>
  <p>form.name: <b>{{ form.name }}</b></p>
  <p>Destructured (broken): <b>{{ brokenName }}</b></p>
  <p>toRefs (linked): <b>{{ linkedName }}</b></p>
  <pre>{{ form }}</pre>
  <button @click="clear">Clear (Object.assign)</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
pre { background: #0f172a; color: #a7f3d0; padding: 8px; border-radius: 6px; }`,
        js: `const { createApp, reactive, toRefs } = Vue;

createApp({
  setup() {
    const form = reactive({ name: 'Ravi', email: '', age: 21 });
    const { name: brokenName } = form;
    const { name: linkedName } = toRefs(form);

    function clear() {
      Object.assign(form, { name: '', email: '', age: null });
    }
    return { form, brokenName, linkedName, clear };
  }
}).mount('#app');`,
      },
      result: 'Typing in the Name field updates "form.name" and "toRefs (linked)", but "Destructured (broken)" stays "Ravi" forever. The <pre> shows the whole object as JSON.',
      explanation:
        'Destructuring reads form.name once and stores the string, cutting the link to the proxy. toRefs creates refs whose .value reads/writes form.name, so they stay linked. Object.assign mutates the existing proxy, unlike form = {...}, which would break the binding. {{ form }} is auto-formatted as JSON by Vue.',
    },
    {
      title: 'Proof that plain variables are not reactive',
      scenario: 'A junior developer asks: "why does my counter not update?" Show the difference side by side.',
      steps: [
        'Declare let plain = 0 and const reactiveCount = ref(0)',
        'Create two buttons that increment each one and log to the console',
        'Click the plain button: the console shows a new value but the screen does not change',
        'Click the ref button: the screen updates (and re-renders the plain value too!)',
      ],
      code: `<script setup>
import { ref } from 'vue'

let plain = 0                 // NOT reactive
const reactiveCount = ref(0)  // reactive

function incPlain() { plain++; console.log('plain =', plain) }
function incRef() { reactiveCount.value++ }
</script>

<template>
  <button @click="incPlain">Plain: {{ plain }}</button>
  <button @click="incRef">Ref: {{ reactiveCount }}</button>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <button @click="incPlain">Plain variable: {{ getPlain() }}</button>
  <button @click="incRef">ref: {{ reactiveCount }}</button>
  <p>Click "Plain" several times (console shows it changing), then click "ref".</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { padding: 10px 14px; margin: 4px; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    let plain = 0;
    const reactiveCount = ref(0);
    function incPlain() { plain++; console.log('plain =', plain, '(screen not updated)'); }
    function incRef() { reactiveCount.value++; }
    const getPlain = () => plain;
    return { getPlain, reactiveCount, incPlain, incRef };
  }
}).mount('#app');`,
      },
      result: 'Clicking "Plain variable" logs plain = 1, 2, 3 but the button text stays 0. Clicking "ref" updates the ref button and, because the component re-renders, the plain button suddenly shows the latest number too.',
      explanation:
        'Vue only knows to re-render when a tracked reactive dependency changes. plain is an ordinary closure variable, so writing it triggers nothing. When the ref changes, the whole component re-renders and reads the current plain value as a side effect, which is confusing behaviour you should never rely on.',
    },
    {
      title: 'nextTick, readonly and shallowRef',
      scenario: 'Add chat messages and auto-scroll to the bottom only after the DOM has updated; expose a readonly config and use a shallowRef for a big list.',
      steps: [
        'Create messages = ref([]) and a scroll container',
        'In send(), push a message, await nextTick(), then scroll to bottom',
        'Create config = readonly(reactive({ max: 5 })) and try to modify it',
        'Create bigList = shallowRef([...]) and replace it with a new array to update',
        'Run, send messages and check the console warnings',
      ],
      code: `<script setup>
import { ref, reactive, readonly, shallowRef, nextTick, useTemplateRef } from 'vue'

const messages = ref(['Hi!'])
const text = ref('')
const box = useTemplateRef('box')         // template refs: Day 15
const config = readonly(reactive({ max: 5 }))
const bigList = shallowRef([1, 2, 3])

async function send() {
  messages.value.push(text.value || 'Hello')
  text.value = ''
  await nextTick()                        // DOM now has the new <p>
  box.value.scrollTop = box.value.scrollHeight
}
function tryChangeConfig() { config.max = 99 } // warning, ignored
function addBig() {
  bigList.value.push(4)                   // ❌ not tracked (shallow)
  bigList.value = [...bigList.value]      // ✅ replace to trigger
}
</script>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="box" ref="box">
    <p v-for="(m, i) in messages" :key="i">{{ m }}</p>
  </div>
  <input v-model="text" @keyup.enter="send" placeholder="Message">
  <button @click="send">Send</button>
  <p>Children counted after nextTick: {{ counted }}</p>
  <hr>
  <button @click="tryChangeConfig">Try config.max = 99</button> max = {{ config.max }}
  <br><button @click="addBig">Add to shallowRef list</button> {{ bigList }}
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { height: 90px; overflow-y: auto; border: 1px solid #ccc; padding: 4px 8px; margin-bottom: 8px; }
.box p { margin: 4px 0; }`,
        js: `const { createApp, ref, reactive, readonly, shallowRef, nextTick } = Vue;

createApp({
  setup() {
    const messages = ref(['Hi!']);
    const text = ref('');
    const box = ref(null);           // filled by ref="box" in the template
    const counted = ref(1);
    const config = readonly(reactive({ max: 5 }));
    const bigList = shallowRef([1, 2, 3]);

    async function send() {
      messages.value.push(text.value || 'Hello #' + (messages.value.length + 1));
      text.value = '';
      console.log('before nextTick:', box.value.children.length);
      await nextTick();
      console.log('after nextTick:', box.value.children.length);
      counted.value = box.value.children.length;
      box.value.scrollTop = box.value.scrollHeight;
    }
    function tryChangeConfig() { config.max = 99; }
    function addBig() {
      bigList.value.push(bigList.value.length + 1);
      bigList.value = [...bigList.value];
    }
    return { messages, text, box, counted, config, bigList, send, tryChangeConfig, addBig };
  }
}).mount('#app');`,
      },
      result: 'Each Send adds a message and scrolls the box down; the console logs "before nextTick: 1" then "after nextTick: 2". The config button leaves max at 5 (Vue warns "Set operation on key max failed: target is readonly"). The shallowRef list grows because we replace the array.',
      explanation:
        'Vue batches DOM updates, so immediately after push() the DOM is still old; nextTick resolves after the flush. readonly wraps a proxy that rejects writes. shallowRef tracks only .value assignments, so mutations alone would not re-render; replacing the array does.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between ref and reactive?',
      a: 'ref works with any value type and stores it in .value (needs .value in JS, unwrapped in templates); it can be reassigned and safely destructured/returned. reactive works only with objects/arrays/Map/Set, returns a Proxy used without .value, cannot be reassigned, and loses reactivity when destructured. Vue recommends ref as the primary API.',
      level: 'Easy',
    },
    {
      q: 'How does Vue 3 reactivity work internally?',
      a: 'reactive() wraps objects in ES6 Proxies with get/set/deleteProperty traps; ref() uses an object with a value getter/setter. On get, Vue calls track() to record the currently running effect (render, computed, watcher) as a dependency. On set, trigger() finds dependent effects and schedules them. A scheduler batches component updates into a single flush per tick.',
      level: 'Hard',
    },
    {
      q: 'Why do refs need .value?',
      a: 'JavaScript cannot intercept reads and writes of a plain local variable. By wrapping the value in an object, Vue can use a getter/setter on .value to track and trigger. Templates auto-unwrap top-level refs so you do not write .value there.',
      level: 'Medium',
    },
    {
      q: 'Why does destructuring a reactive object break reactivity, and how do you fix it?',
      a: 'Destructuring reads the property once and copies the primitive value into a new variable, which is not connected to the proxy. Use toRefs(state) (or toRef(state, "key")) to get refs linked to the original properties, or keep using state.prop.',
      level: 'Medium',
    },
    {
      q: 'What changed in reactivity from Vue 2 to Vue 3?',
      a: 'Vue 2 used Object.defineProperty getters/setters, so it could not detect added/deleted properties or array index assignment (needed Vue.set / this.$set). Vue 3 uses Proxies, which detect all these operations, support Map/Set, and are lazily deep (nested objects are proxied when accessed).',
      level: 'Medium',
    },
    {
      q: 'What is nextTick and when do you need it?',
      a: 'Vue batches state changes and updates the DOM asynchronously. nextTick() returns a promise that resolves after the next DOM flush. Use it when you need to read or manipulate the updated DOM right after changing state, e.g. scroll to a new message, measure size, or focus a newly rendered input.',
      level: 'Medium',
    },
    {
      q: 'What is shallowRef and when would you use it?',
      a: 'A ref whose inner value is not made deeply reactive; only replacing .value triggers updates. Use it for large data structures you treat immutably (big API results, chart data) or for integrating external objects (class instances, editors) to avoid the cost of deep proxies. Use triggerRef() if you must force an update after mutation.',
      level: 'Hard',
    },
    {
      q: 'Is a ref inside a reactive object unwrapped?',
      a: 'Yes, when accessed as a property of a reactive object (state.count returns the inner value, and assignment updates the ref). It is not unwrapped inside reactive arrays or collections like Map, where you need .value.',
      level: 'Hard',
    },
    {
      q: 'What does readonly() do?',
      a: 'Returns a deep read-only proxy of an object (reactive or plain). Reading is tracked as usual; any write is ignored with a development warning. Useful when a store or provider exposes state that consumers must not mutate directly.',
      level: 'Medium',
    },
    {
      q: 'Is the object returned by reactive() equal to the original?',
      a: 'No. reactive(obj) returns a Proxy, so proxy !== obj. Calling reactive(obj) again returns the same proxy, and reactive(proxy) returns itself. Mutating the original object directly bypasses tracking, so always work with the proxy. toRaw(proxy) returns the original.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a shopping cart with items = ref([]). Add buttons that push "Apple", "Mango" and "Banana", and show the count and the list. Add an "Empty cart" button that assigns a new array.',
      hint: 'items.value.push(...) and items.value = [].',
      solution: `<div id="app">
  <button v-for="f in ['Apple','Mango','Banana']" :key="f" @click="items.push(f)">Add {{ f }}</button>
  <button @click="empty">Empty cart</button>
  <p>{{ items.length }} items: {{ items.join(', ') }}</p>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  const items = ref([]);
  const empty = () => { items.value = []; };
  return { items, empty };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Use reactive() for a bank account { owner, balance }. Add deposit(amount) and withdraw(amount) functions; withdraw should refuse if balance is insufficient and show an error message.',
      hint: 'Keep an error ref or an error property inside the reactive object.',
      solution: `<script setup>
import { reactive } from 'vue'
const account = reactive({ owner: 'Asha', balance: 1000, error: '' })
function deposit(n) { account.balance += n; account.error = '' }
function withdraw(n) {
  if (n > account.balance) { account.error = 'Insufficient balance'; return }
  account.balance -= n; account.error = ''
}
</script>
<template>
  <h3>{{ account.owner }}: ₹{{ account.balance }}</h3>
  <button @click="deposit(500)">+500</button>
  <button @click="withdraw(2000)">-2000</button>
  <p v-if="account.error" style="color:red">{{ account.error }}</p>
</template>`,
    },
    {
      task: 'Write a function useCounterState() that returns toRefs of a reactive({ count: 0, step: 1 }) plus an increment function, and destructure it in setup without losing reactivity.',
      hint: 'return { ...toRefs(state), increment }.',
      solution: `const { createApp, reactive, toRefs } = Vue;
function useCounterState() {
  const state = reactive({ count: 0, step: 1 });
  const increment = () => { state.count += state.step; };
  return { ...toRefs(state), increment };
}
createApp({
  setup() {
    const { count, step, increment } = useCounterState();
    return { count, step, increment };
  },
  template: '<input type="number" v-model.number="step"> <button @click="increment">+{{ step }}</button> {{ count }}'
}).mount('#app');`,
    },
    {
      task: 'Show a hidden input when a button is clicked and focus it automatically. Explain why nextTick is required.',
      hint: 'The input does not exist in the DOM until Vue re-renders.',
      solution: `<script setup>
import { ref, nextTick } from 'vue'
const editing = ref(false)
const input = ref(null)
async function startEdit() {
  editing.value = true
  await nextTick()       // the <input> is now in the DOM
  input.value.focus()
}
</script>
<template>
  <button @click="startEdit">Edit</button>
  <input v-if="editing" ref="input" placeholder="I am focused">
</template>
<!-- Without nextTick, input.value is still null because v-if has not rendered yet. -->`,
    },
  ],
  quiz: [
    {
      question: 'Inside <script setup>, how do you increment const count = ref(0)?',
      options: ['count++', 'count.value++', 'this.count++', 'count.set(count + 1)'],
      answer: 1,
      explanation: 'Refs hold their value in .value in JavaScript.',
    },
    {
      question: 'Which value can NOT be passed to reactive()?',
      options: ['{ a: 1 }', '[1, 2, 3]', 'new Map()', '42'],
      answer: 3,
      explanation: 'reactive() only works with object types; use ref for primitives.',
    },
    {
      question: 'const state = reactive({ n: 1 }); const { n } = state; state.n = 5. What is n?',
      options: ['1', '5', 'undefined', 'A ref containing 5'],
      answer: 0,
      explanation: 'Destructuring copied the value 1; it is no longer connected.',
    },
    {
      question: 'Which API waits for the DOM to reflect the latest state changes?',
      options: ['setTimeout(fn, 1000)', 'watchEffect', 'nextTick', 'toRaw'],
      answer: 2,
      explanation: 'await nextTick() resolves after Vue flushes pending DOM updates.',
    },
    {
      question: 'What does Vue 3 use internally to make objects reactive?',
      options: ['Object.defineProperty only', 'ES6 Proxy', 'setInterval polling', 'MutationObserver'],
      answer: 1,
      explanation: 'Vue 3 reactive() is Proxy-based (Vue 2 used defineProperty).',
    },
  ],
};
