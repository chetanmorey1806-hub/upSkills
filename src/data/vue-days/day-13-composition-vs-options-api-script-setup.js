export default {
  id: 'day-13-composition-vs-options-api-script-setup',
  title: 'Composition API vs Options API, <script setup>',
  module: 'Module 2: Components',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Vue offers two styles for writing component logic. Compare the Options API (data, methods, computed, watch, lifecycle options, this) with the Composition API (setup, ref, computed, watch, onMounted), understand why Vue 3 introduced composition, and master <script setup> with its compiler macros: defineProps, defineEmits, defineModel, defineExpose, defineOptions, defineSlots and useAttrs/useSlots.',
  objectives: [
    'Write the same component in Options API and Composition API',
    'Explain the "logical concerns" problem and how the Composition API solves it',
    'Understand the setup() function, its arguments and return value',
    'Use <script setup> and all its compiler macros correctly',
    'Choose a style for a project and migrate Options API code',
  ],
  theory: [
    {
      heading: 'Options API: organising by option type',
      content:
        'The **Options API** (the classic Vue 2 style, still fully supported in Vue 3) describes a component with an object of **options**:\n\n- `data()`: returns reactive state\n- `computed`: derived values\n- `methods`: functions\n- `watch`: watchers\n- `props`, `emits`, `components`\n- lifecycle hooks: `created`, `mounted`, `unmounted`...\n\nInside these options you access everything through **`this`**: `this.count`, `this.increment()`, `this.$emit()`.\n\nStrengths: very approachable for beginners, enforces a fixed structure, familiar to anyone who learned Vue 2.\n\nWeakness: code is organised by **option type**, not by **feature**. In a large component, the logic for "search" is split between data, computed, watch, methods and mounted; the logic for "pagination" is interleaved in the same options. To understand one feature you jump around the file. Reusing logic across components needed **mixins**, which have unclear property sources and name collisions.',
      syntax: `export default {
  props: { initial: { type: Number, default: 0 } },
  data() {
    return { count: this.initial }
  },
  computed: {
    double() { return this.count * 2 }
  },
  watch: {
    count(newVal) { console.log('count is', newVal) }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() { console.log('mounted') }
}`,
    },
    {
      heading: 'Composition API: organising by logical concern',
      content:
        'The **Composition API** uses imported functions inside `setup()` (or `<script setup>`): `ref`, `reactive`, `computed`, `watch`, `onMounted`, `provide`/`inject`...\n\n- No `this`: you work with plain variables and functions.\n- Code can be grouped by **feature**: all search code together, all pagination code together.\n- Any group can be extracted into a **composable** function (`useSearch()`, `usePagination()`) and reused across components (Day 14). This replaces mixins with explicit imports and return values.\n- Excellent **TypeScript** inference (no `this` typing gymnastics).\n- Smaller production bundles: `<script setup>` templates compile to closures with direct variable access, and minifiers can shorten local variable names (they cannot shorten `this.property` names).\n\nAnalogy: the Options API is a wardrobe organised by clothing type (all shirts in one drawer, all trousers in another). The Composition API is organised by outfit: everything you need for "office", "gym" or "party" in its own bag, and you can lend a whole bag to a friend (composable).',
      points: [
        'Both APIs are built on the same reactivity system; the Options API is implemented on top of the Composition API',
        'They can be mixed: a setup() option inside an Options API component; Options API code can read what setup() returns',
        'Vue 3 docs default to Composition API + <script setup> for new projects',
      ],
    },
    {
      heading: 'The setup() function',
      content:
        'Without `<script setup>`, the Composition API is used through the `setup` option:\n\n`setup(props, context)`\n\n- `props`: the resolved props, **reactive** (do not destructure it directly unless you use `toRefs(props)`, otherwise you lose reactivity)\n- `context`: a plain object `{ attrs, slots, emit, expose }`, safe to destructure\n- Return an **object**: its properties become available in the template (refs are unwrapped). Alternatively return a **render function**.\n- `setup` runs **before** the component is created, so `this` is undefined inside it.\n\nThis is exactly the form we use in the Code Playground (`createApp({ setup() { ... return {...} } })`), because `<script setup>` requires a build step (the SFC compiler).',
      syntax: `export default {
  props: { title: String },
  emits: ['close'],
  setup(props, { emit, attrs, slots, expose }) {
    const open = ref(true)
    function close() { open.value = false; emit('close') }
    expose({ close })          // what a parent ref can call
    return { open, close }     // what the template can use
  }
}`,
    },
    {
      heading: '<script setup>: the recommended syntax',
      content:
        '`<script setup>` is compile-time syntactic sugar for using the Composition API in SFCs. The code inside runs **every time an instance is created** (like the body of setup()).\n\n- All **top-level bindings** (variables, functions, imports, including imported components) are automatically available in the template; no `return`, no `components: {}` registration.\n- Less boilerplate, better runtime performance (template compiled into the same scope), better IDE/TypeScript support.\n- **Top-level await** is allowed (the component then needs `<Suspense>`).\n\n**Compiler macros** (no import needed, only valid in `<script setup>`):\n\n- `defineProps()`: declare props\n- `defineEmits()`: declare emitted events\n- `defineModel()`: v-model binding (3.4+)\n- `defineExpose({ ... })`: components using `<script setup>` are **closed by default**: a parent with a template ref cannot access their internals unless explicitly exposed\n- `defineOptions({ name, inheritAttrs })`: set component options (3.3+)\n- `defineSlots()`: type slots in TypeScript (3.3+)\n\nRuntime helpers: `useSlots()`, `useAttrs()`, `useTemplateRef()` (3.5), `useId()` (3.5, unique ids for accessibility attributes).\n\nYou can still add a normal `<script>` block next to `<script setup>` for module-level code that should run once (e.g. named exports) or for options that cannot be expressed otherwise.',
      syntax: `<script setup>
import { ref, computed, onMounted } from 'vue'
import ChildCard from './ChildCard.vue'   // usable directly as <ChildCard />

const props = defineProps({ initial: { type: Number, default: 0 } })
const emit = defineEmits(['change'])
defineOptions({ name: 'CounterBox' })

const count = ref(props.initial)
const double = computed(() => count.value * 2)
function increment() { count.value++; emit('change', count.value) }

defineExpose({ reset: () => (count.value = 0) })
onMounted(() => console.log('mounted'))
</script>`,
      tip: 'Macros are hoisted out of setup, so their arguments cannot reference local variables declared in <script setup> (imported constants are fine).',
    },
    {
      heading: 'Which one should you use?',
      content:
        '- **New projects, medium-to-large apps, TypeScript, teams**: Composition API with `<script setup>`. This is the default in the official docs, create-vue templates, Nuxt, Pinia and most of the modern ecosystem.\n- **Small widgets, progressive enhancement, beginners, legacy Vue 2 codebases**: the Options API is perfectly valid and is **not deprecated**.\n- Stay **consistent** within a codebase. Mixing styles in one component is possible but confusing.\n\n**Migration tips (Options → Composition)**:\n\n1. `data()` fields → `ref()` (or one `reactive()`)\n2. `computed: { x() {} }` → `const x = computed(() => ...)`\n3. `methods` → plain functions\n4. `watch: { a(n, o) {} }` → `watch(a, (n, o) => ...)`\n5. `mounted()` → `onMounted(...)`, `created()` → code directly in setup\n6. `this.x` → `x.value` (in script), `this.$emit` → `emit` from defineEmits, `this.$refs.el` → template ref\n7. Mixins → composables',
    },
  ],
  examples: [
    {
      title: 'The same counter in Options API and Composition API',
      scenario: 'Write a counter with a step, a computed "double", a watcher and a mounted log in both styles and use them side by side.',
      steps: [
        'Write OptionsCounter with data, computed, watch, methods and mounted',
        'Write CompositionCounter with ref, computed, watch, a function and onMounted',
        'Register both components and render them next to each other',
        'Click both and compare the console output and behaviour (identical)',
        'Compare the SFC <script setup> version in the code panel',
      ],
      code: `<!-- OptionsCounter.vue -->
<script>
export default {
  props: { step: { type: Number, default: 1 } },
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  watch: { count(n, o) { console.log('[options] ' + o + ' → ' + n) } },
  methods: { increment() { this.count += this.step } },
  mounted() { console.log('[options] mounted') },
}
</script>
<template><button @click="increment">{{ count }} (double {{ double }})</button></template>

<!-- CompositionCounter.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
const props = defineProps({ step: { type: Number, default: 1 } })
const count = ref(0)
const double = computed(() => count.value * 2)
watch(count, (n, o) => console.log('[composition] ' + o + ' → ' + n))
function increment() { count.value += props.step }
onMounted(() => console.log('[composition] mounted'))
</script>
<template><button @click="increment">{{ count }} (double {{ double }})</button></template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="row">
    <div class="box"><h4>Options API</h4><options-counter :step="2"></options-counter></div>
    <div class="box"><h4>Composition API</h4><composition-counter :step="2"></composition-counter></div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.box { border: 1px solid #ddd; border-radius: 10px; padding: 12px 16px; min-width: 180px; }
.box h4 { margin: 0 0 8px; }
button { padding: 8px 14px; }`,
        js: `const { createApp, ref, computed, watch, onMounted } = Vue;

const app = createApp({});

// Options API: organised by option type, uses this
app.component('OptionsCounter', {
  props: { step: { type: Number, default: 1 } },
  data() { return { count: 0 }; },
  computed: { double() { return this.count * 2; } },
  watch: { count(n, o) { console.log('[options] ' + o + ' -> ' + n); } },
  methods: { increment() { this.count += this.step; } },
  mounted() { console.log('[options] mounted'); },
  template: '<button @click="increment">{{ count }} (double {{ double }})</button>'
});

// Composition API: plain variables and functions in setup()
app.component('CompositionCounter', {
  props: { step: { type: Number, default: 1 } },
  setup(props) {
    const count = ref(0);
    const double = computed(() => count.value * 2);
    watch(count, (n, o) => console.log('[composition] ' + o + ' -> ' + n));
    function increment() { count.value += props.step; }
    onMounted(() => console.log('[composition] mounted'));
    return { count, double, increment };
  },
  template: '<button @click="increment">{{ count }} (double {{ double }})</button>'
});

app.mount('#app');`,
      },
      result: 'Two identical buttons "0 (double 0)". Each click adds 2: "2 (double 4)", "4 (double 8)". The console shows "[options] mounted", "[composition] mounted" and a log line per change for each.',
      explanation:
        'Both styles produce the same behaviour on the same reactivity engine. The Options API reaches state through this and fixed option buckets; the Composition API uses refs (.value in JS) and plain functions, and with <script setup> the return statement disappears.',
    },
    {
      title: 'Organising by logical concern: a product page with two features',
      scenario: 'A product list has a search feature and a pagination feature. In the Options API their code is interleaved; in the Composition API each feature is a self-contained block.',
      steps: [
        'List the pieces each feature needs: state, computed, watcher, functions',
        'Write the Composition version grouping "search" code first, then "pagination" code',
        'Notice the watcher resetting the page when search changes sits right next to the search state',
        'Run the playground and search/paginate',
        'Compare with the Options API version in the code panel, where each feature is spread across 4 options',
      ],
      code: `<!-- Options API: features are scattered -->
<script>
export default {
  data() {
    return { query: '', page: 1, perPage: 3, products: [...] }   // search + pagination
  },
  computed: {
    filtered() { /* search */ },
    totalPages() { /* pagination */ },
    pageItems() { /* pagination */ },
  },
  watch: { query() { this.page = 1 } },                           // search + pagination
  methods: { next() { /* pagination */ }, prev() { /* pagination */ } },
}
</script>

<!-- Composition API (<script setup>): grouped by feature -->
<script setup>
import { ref, computed, watch } from 'vue'
const products = ref([...])

// ---- Feature 1: search ----
const query = ref('')
const filtered = computed(() =>
  products.value.filter(p => p.toLowerCase().includes(query.value.toLowerCase())))

// ---- Feature 2: pagination ----
const page = ref(1)
const perPage = 3
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const pageItems = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const next = () => { if (page.value < totalPages.value) page.value++ }
const prev = () => { if (page.value > 1) page.value-- }
watch(query, () => { page.value = 1 })
</script>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <input v-model="query" placeholder="Search products">
  <ul><li v-for="p in pageItems" :key="p">{{ p }}</li></ul>
  <p v-if="!filtered.length">No products</p>
  <button @click="prev" :disabled="page === 1">◀ Prev</button>
  Page {{ page }} / {{ totalPages }}
  <button @click="next" :disabled="page === totalPages">Next ▶</button>
  <p><small>{{ filtered.length }} matching products</small></p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
li { padding: 3px 0; }`,
        js: `const { createApp, ref, computed, watch } = Vue;

createApp({
  setup() {
    const products = ref(['Laptop', 'Laptop Bag', 'Mouse', 'Keyboard', 'Monitor', 'USB Cable',
      'Webcam', 'Headphones', 'Mouse Pad', 'Desk Lamp', 'Microphone']);

    // ---- Feature 1: search ----
    const query = ref('');
    const filtered = computed(() =>
      products.value.filter(p => p.toLowerCase().includes(query.value.toLowerCase())));

    // ---- Feature 2: pagination ----
    const page = ref(1);
    const perPage = 3;
    const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)));
    const pageItems = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage));
    const next = () => { if (page.value < totalPages.value) page.value++; };
    const prev = () => { if (page.value > 1) page.value--; };
    watch(query, () => { page.value = 1; });

    return { query, filtered, page, totalPages, pageItems, next, prev };
  }
}).mount('#app');`,
      },
      result: 'Page 1 / 4 shows Laptop, Laptop Bag, Mouse. Next/Prev move through pages. Typing "mo" shows Mouse, Monitor, Mouse Pad on 1 page and jumps back to page 1.',
      explanation:
        'Each feature is a contiguous block that could be cut and pasted into a composable (useSearch, usePagination) tomorrow. In the Options API version, understanding pagination means reading data, computed, watch and methods separately.',
    },
    {
      title: 'defineExpose: parent calls a child method via a template ref',
      scenario: 'A parent form needs to reset and focus a child input component. <script setup> components are closed by default, so the child must expose what the parent may call.',
      steps: [
        'In the child (<script setup>), create focus() and clear() functions',
        'Call defineExpose({ focus, clear }) (in the playground: expose() from the setup context)',
        'In the parent, put ref="nameField" on the child and create a matching ref',
        'Call nameField.value.focus() and nameField.value.clear() from parent buttons',
        'Try to access an un-exposed value (internal) and see it is undefined',
      ],
      code: `<!-- SmartInput.vue -->
<script setup>
import { ref } from 'vue'
const text = ref('')
const input = ref(null)
const internal = 'secret'
function focus() { input.value.focus() }
function clear() { text.value = '' }
defineExpose({ focus, clear })       // only these are public
</script>
<template><input ref="input" v-model="text"></template>

<!-- ParentForm.vue -->
<script setup>
import { ref } from 'vue'
import SmartInput from './SmartInput.vue'
const nameField = ref(null)          // or useTemplateRef('nameField') in 3.5
</script>
<template>
  <SmartInput ref="nameField" />
  <button @click="nameField.focus()">Focus</button>
  <button @click="nameField.clear()">Clear</button>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <smart-input ref="nameField"></smart-input>
  <p>
    <button @click="nameField.focus()">Focus child</button>
    <button @click="nameField.clear()">Clear child</button>
    <button @click="peek">Read child.internal</button>
  </p>
  <p>{{ msg }}</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input { padding: 6px; width: 220px; }`,
        js: `const { createApp, ref } = Vue;

const app = createApp({
  setup() {
    const nameField = ref(null);
    const msg = ref('');
    function peek() { msg.value = 'child.internal = ' + nameField.value.internal; }
    return { nameField, msg, peek };
  }
});

app.component('SmartInput', {
  setup(props, { expose }) {
    const text = ref('Type something');
    const input = ref(null);
    const internal = 'secret';
    function focus() { input.value.focus(); }
    function clear() { text.value = ''; }
    expose({ focus, clear });           // = defineExpose({ focus, clear }) in <script setup>
    return { text, input, internal };
  },
  template: '<input ref="input" v-model="text">'
});

app.mount('#app');`,
      },
      result: 'Focus child focuses the input, Clear child empties it. "Read child.internal" shows "child.internal = undefined" because only focus and clear were exposed.',
      explanation:
        'A template ref on a component gives the parent the component\'s public instance. With expose() / defineExpose(), only the listed members are reachable, keeping the child\'s internals private. Use this sparingly: props and events should remain the main communication channel.',
    },
    {
      title: 'Migrating a mixin to the Composition API',
      scenario: 'A legacy Vue 2 style mixin adds online/offline detection to components. Rewrite it as a function used inside setup(), and use both in one page.',
      steps: [
        'Look at the mixin: data isOnline, mounted adds listeners, unmounted removes them',
        'Write useOnlineStatus() that creates a ref and registers onMounted/onUnmounted inside',
        'Use the mixin in an Options API component and the function in a Composition API component',
        'Notice where isOnline comes from in each component',
        'Toggle your network (or DevTools offline mode) to test',
      ],
      code: `// Options API mixin (old way) - where does isOnline come from? Not obvious in the component
export const onlineMixin = {
  data: () => ({ isOnline: navigator.onLine }),
  mounted() {
    this._update = () => (this.isOnline = navigator.onLine)
    window.addEventListener('online', this._update)
    window.addEventListener('offline', this._update)
  },
  unmounted() {
    window.removeEventListener('online', this._update)
    window.removeEventListener('offline', this._update)
  },
}

// Composition API (new way) - explicit import and return value
import { ref, onMounted, onUnmounted } from 'vue'
export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine)
  const update = () => { isOnline.value = navigator.onLine }
  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })
  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })
  return { isOnline }
}

<!-- StatusBar.vue -->
<script setup>
import { useOnlineStatus } from './useOnlineStatus'
const { isOnline } = useOnlineStatus()
</script>
<template><span>{{ isOnline ? '🟢 Online' : '🔴 Offline' }}</span></template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>Options API + mixin: <legacy-status></legacy-status></p>
  <p>Composition API function: <modern-status></modern-status></p>
  <button @click="simulate">Simulate offline/online event</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }`,
        js: `const { createApp, ref, onMounted, onUnmounted } = Vue;

let fakeOnline = true; // so the demo works without really disconnecting
const readStatus = () => fakeOnline;

const onlineMixin = {
  data: () => ({ isOnline: readStatus() }),
  mounted() {
    this._update = () => { this.isOnline = readStatus(); };
    window.addEventListener('online', this._update);
    window.addEventListener('offline', this._update);
  },
  unmounted() {
    window.removeEventListener('online', this._update);
    window.removeEventListener('offline', this._update);
  },
};

function useOnlineStatus() {
  const isOnline = ref(readStatus());
  const update = () => { isOnline.value = readStatus(); };
  onMounted(() => {
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
  });
  onUnmounted(() => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  });
  return { isOnline };
}

const app = createApp({
  setup() {
    function simulate() {
      fakeOnline = !fakeOnline;
      window.dispatchEvent(new Event(fakeOnline ? 'online' : 'offline'));
    }
    return { simulate };
  }
});

app.component('LegacyStatus', {
  mixins: [onlineMixin],
  template: '<span>{{ isOnline ? "🟢 Online" : "🔴 Offline" }}</span>'
});

app.component('ModernStatus', {
  setup() {
    const { isOnline } = useOnlineStatus();
    return { isOnline };
  },
  template: '<span>{{ isOnline ? "🟢 Online" : "🔴 Offline" }}</span>'
});

app.mount('#app');`,
      },
      result: 'Both lines show "🟢 Online". Clicking "Simulate" switches both to "🔴 Offline" and back.',
      explanation:
        'The mixin silently injects isOnline into the component via this: with several mixins you cannot tell where a property comes from, and names can collide. The function version returns an explicit value you destructure (and can rename), keeps setup and cleanup together, and is a composable, the topic of Day 14.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between the Options API and the Composition API?',
      a: 'The Options API defines component logic through option objects (data, computed, methods, watch, lifecycle hooks) and accesses state via this. The Composition API uses imported functions (ref, computed, watch, onMounted) inside setup/<script setup>, organising code by logical concern rather than option type, enabling reuse via composables and better TypeScript inference. Both share the same reactivity system.',
      level: 'Easy',
    },
    {
      q: 'Why was the Composition API introduced?',
      a: 'To solve three Options API pain points in large apps: logic for one feature was fragmented across options, logic reuse relied on mixins (unclear sources, name collisions, implicit dependencies), and TypeScript support for this was weak. Composition functions group code by feature, allow explicit reuse with composables, and type naturally.',
      level: 'Medium',
    },
    {
      q: 'Is the Options API deprecated in Vue 3?',
      a: 'No. It is fully supported and will continue to be. It can even be disabled at build time (__VUE_OPTIONS_API__ flag) to save bytes if you only use the Composition API. The docs recommend Composition API + <script setup> for most new projects, especially larger ones.',
      level: 'Easy',
    },
    {
      q: 'What are the arguments of setup() and what does it return?',
      a: 'setup(props, context): props is the reactive props object (do not destructure without toRefs); context contains attrs, slots, emit and expose. It returns an object whose properties are exposed to the template (refs auto-unwrapped), or a render function. this is undefined inside setup.',
      level: 'Medium',
    },
    {
      q: 'What are the advantages of <script setup>?',
      a: 'Less boilerplate (no return, imported components usable directly), compiler macros for props/emits/model, better runtime performance (template compiled in the same scope without a proxy), better TypeScript inference, top-level await support, and smaller minified output.',
      level: 'Medium',
    },
    {
      q: 'Name the <script setup> compiler macros.',
      a: 'defineProps, defineEmits, defineModel (3.4+), defineExpose, defineOptions (3.3+), defineSlots (3.3+), and withDefaults (for type-based props defaults). They need no import and are compiled away.',
      level: 'Medium',
    },
    {
      q: 'Why does a parent get undefined when accessing a <script setup> child\'s variable through a template ref?',
      a: 'Components using <script setup> are closed by default: their bindings are not exposed on the public instance. The child must call defineExpose({ ... }) to make specific properties or methods available to parents via template refs.',
      level: 'Hard',
    },
    {
      q: 'How do Options API hooks and properties map to the Composition API?',
      a: 'data → ref/reactive; computed → computed(); methods → plain functions; watch → watch/watchEffect; created → code in setup; mounted → onMounted; unmounted → onUnmounted; this.$emit → emit from defineEmits; this.$refs → template refs; this.$attrs/$slots → useAttrs()/useSlots(); mixins → composables; provide/inject options → provide()/inject().',
      level: 'Medium',
    },
    {
      q: 'Can you use the Options API and the Composition API in the same component?',
      a: 'Yes. An Options API component can have a setup() option; values returned from setup are available as this.x in other options. The reverse is not true: setup cannot access Options API data via this. It is useful for gradual migration but should not be the norm.',
      level: 'Hard',
    },
    {
      q: 'Why are mixins discouraged in Vue 3?',
      a: 'Properties injected by mixins have unclear origins (which mixin defined isOnline?), multiple mixins can silently overwrite each other\'s names, and mixins can depend implicitly on properties of the host component. Composables return explicit values that can be renamed and that clearly show dependencies.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Convert this Options API component to <script setup>: props title; data todos [] and text ""; computed remaining; methods add() and remove(i); watch todos (deep) saving to localStorage; mounted loading from localStorage.',
      hint: 'watch(todos, save, { deep: true }); onMounted(load).',
      solution: `<script setup>
import { ref, computed, watch, onMounted } from 'vue'
defineProps({ title: String })
const todos = ref([])
const text = ref('')
const remaining = computed(() => todos.value.filter(t => !t.done).length)
function add() {
  if (!text.value.trim()) return
  todos.value.push({ text: text.value.trim(), done: false })
  text.value = ''
}
function remove(i) { todos.value.splice(i, 1) }
watch(todos, (v) => localStorage.setItem('todos', JSON.stringify(v)), { deep: true })
onMounted(() => { todos.value = JSON.parse(localStorage.getItem('todos') || '[]') })
</script>
<template>
  <h2>{{ title }} ({{ remaining }} left)</h2>
  <input v-model="text" @keyup.enter="add">
  <ul><li v-for="(t, i) in todos" :key="i"><input type="checkbox" v-model="t.done"> {{ t.text }} <button @click="remove(i)">x</button></li></ul>
</template>`,
    },
    {
      task: 'Write the same "temperature converter" (Celsius input, computed Fahrenheit, a watcher warning above 40°C) in Options API and Composition API (setup function form).',
      hint: 'F = C * 9 / 5 + 32.',
      solution: `// Options API
const OptionsTemp = {
  data: () => ({ c: 25, warning: '' }),
  computed: { f() { return (this.c * 9) / 5 + 32 } },
  watch: { c(v) { this.warning = v > 40 ? 'Heat alert!' : '' } },
  template: '<input type="number" v-model.number="c"> °C = {{ f }} °F <b>{{ warning }}</b>'
}

// Composition API
const CompositionTemp = {
  setup() {
    const c = ref(25)
    const warning = ref('')
    const f = computed(() => (c.value * 9) / 5 + 32)
    watch(c, v => { warning.value = v > 40 ? 'Heat alert!' : '' })
    return { c, f, warning }
  },
  template: '<input type="number" v-model.number="c"> °C = {{ f }} °F <b>{{ warning }}</b>'
}`,
    },
    {
      task: 'Create a VideoPlayer component in <script setup> that exposes play() and pause() with defineExpose, and a parent with external Play/Pause buttons that use a template ref.',
      hint: 'Internally use a <video ref="video"> element and call video.value.play().',
      solution: `<!-- VideoPlayer.vue -->
<script setup>
import { ref } from 'vue'
defineProps({ src: String })
const video = ref(null)
const play = () => video.value.play()
const pause = () => video.value.pause()
defineExpose({ play, pause })
</script>
<template><video ref="video" :src="src" width="320"></video></template>

<!-- Parent.vue -->
<script setup>
import { useTemplateRef } from 'vue'
import VideoPlayer from './VideoPlayer.vue'
const player = useTemplateRef('player')
</script>
<template>
  <VideoPlayer ref="player" src="/intro.mp4" />
  <button @click="player.play()">Play</button>
  <button @click="player.pause()">Pause</button>
</template>`,
    },
    {
      task: 'Refactor a component that has "window size" logic mixed with "dark mode" logic into two grouped blocks in <script setup>, then extract one block into a function useWindowSize().',
      hint: 'Return { width, height } from the function and register listeners with onMounted/onUnmounted inside it.',
      solution: `// useWindowSize.js
import { ref, onMounted, onUnmounted } from 'vue'
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  const update = () => { width.value = window.innerWidth; height.value = window.innerHeight }
  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))
  return { width, height }
}

<!-- Page.vue -->
<script setup>
import { ref, watchEffect } from 'vue'
import { useWindowSize } from './useWindowSize'

// ---- window size ----
const { width, height } = useWindowSize()

// ---- dark mode ----
const dark = ref(false)
watchEffect(() => document.documentElement.classList.toggle('dark', dark.value))
</script>
<template>
  <p>{{ width }} × {{ height }}</p>
  <button @click="dark = !dark">Toggle dark</button>
</template>`,
    },
  ],
  quiz: [
    {
      question: 'Inside the Composition API setup() function, what is this?',
      options: ['The component instance', 'The app instance', 'undefined', 'window'],
      answer: 2,
      explanation: 'setup runs before the instance is fully created; use variables instead of this.',
    },
    {
      question: 'In <script setup>, how do you make a variable available to the template?',
      options: ['Declare it at the top level', 'Return it from setup', 'Add it to data()', 'Call defineExpose'],
      answer: 0,
      explanation: 'All top-level bindings are exposed to the template automatically.',
    },
    {
      question: 'Which macro lets a parent call a <script setup> child\'s method through a template ref?',
      options: ['defineProps', 'defineEmits', 'defineOptions', 'defineExpose'],
      answer: 3,
      explanation: '<script setup> components are closed by default.',
    },
    {
      question: 'What replaces mixins in the Composition API?',
      options: ['Plugins', 'Composables (functions that use Composition API)', 'Directives', 'Slots'],
      answer: 1,
      explanation: 'Composables give explicit, reusable stateful logic.',
    },
    {
      question: 'Which Options API option corresponds to code written directly in setup()?',
      options: ['mounted', 'beforeMount', 'created', 'updated'],
      answer: 2,
      explanation: 'beforeCreate/created logic goes directly in setup.',
    },
  ],
};
